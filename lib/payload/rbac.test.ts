import assert from "node:assert/strict";
import test from "node:test";
import type { PayloadRequest } from "payload";
import {
  canDelete,
  canManageAdminTools,
  canManageUsers,
  canPublish,
  canWriteCollection,
  draftWriterUpdateAccess,
  getWritableCollections,
  type PayloadRole,
  payloadRoles,
  privateBlogReadAccess,
  publicPublishedReadAccess,
  type RBACCollectionSlug,
} from "./rbac.ts";
import {
  canUseFolderTypes,
  createDraftOnlyWorkflowHook,
  preventAuthorVersionRestore,
} from "./rbac-hooks.ts";
import { restrictAdminToolCollection } from "./rbac-plugins.ts";

const collections: RBACCollectionSlug[] = [
  "blog",
  "imprensa",
  "vagas",
  "media",
  "galeria",
];

const expectedWrites: Record<
  PayloadRole,
  Record<RBACCollectionSlug, boolean>
> = {
  admin: {
    blog: true,
    imprensa: true,
    vagas: true,
    media: true,
    galeria: true,
  },
  publisher: {
    blog: true,
    imprensa: true,
    vagas: true,
    media: true,
    galeria: true,
  },
  editor: {
    blog: true,
    imprensa: true,
    vagas: false,
    media: true,
    galeria: true,
  },
  recruiter: {
    blog: false,
    imprensa: false,
    vagas: true,
    media: true,
    galeria: false,
  },
};

function user(role: PayloadRole) {
  return { id: role, role };
}

function req(
  role: PayloadRole,
  query: Record<string, unknown> = {},
): PayloadRequest {
  return {
    query,
    searchParams: new URLSearchParams(),
    user: user(role),
  } as unknown as PayloadRequest;
}

test("implements the complete fixed-role write matrix", () => {
  for (const role of payloadRoles) {
    for (const collection of collections) {
      assert.equal(
        canWriteCollection(user(role), collection),
        expectedWrites[role][collection],
        `${role} / ${collection}`,
      );
    }

    assert.deepEqual(
      getWritableCollections(user(role)),
      collections.filter((collection) => expectedWrites[role][collection]),
    );
  }
});

test("separates user management, publishing, deletion and admin tools", () => {
  assert.equal(canManageUsers(user("admin")), true);
  assert.equal(canManageUsers(user("publisher")), false);

  for (const role of payloadRoles) {
    const expected = role === "admin" || role === "publisher";
    assert.equal(canPublish(user(role)), expected);
    assert.equal(canDelete(user(role)), expected);
    assert.equal(canManageAdminTools(user(role)), expected);
  }

  assert.equal(canPublish({ id: "legacy" }), false);
  assert.equal(canWriteCollection({ id: "legacy" }, "media"), false);
});

test("keeps Blog private and limits anonymous Imprensa/Vagas reads to published docs", async () => {
  assert.equal(
    await privateBlogReadAccess({
      req: { user: null } as PayloadRequest,
    }),
    false,
  );
  assert.deepEqual(
    await privateBlogReadAccess({
      req: req("editor"),
    }),
    {
      deletedAt: {
        exists: false,
      },
    },
  );

  const anonymousRead = await publicPublishedReadAccess("imprensa")({
    req: { user: null } as PayloadRequest,
  });
  assert.deepEqual(anonymousRead, {
    and: [
      {
        _status: {
          equals: "published",
        },
      },
      {
        deletedAt: {
          exists: false,
        },
      },
    ],
  });
  assert.deepEqual(
    await publicPublishedReadAccess("vagas")({
      req: req("recruiter"),
    }),
    {
      deletedAt: {
        exists: false,
      },
    },
  );
});

test("authors receive draft update permission but never publish permission", async () => {
  const access = draftWriterUpdateAccess("blog");

  assert.equal(await access({ data: undefined, req: req("editor") }), true);
  assert.equal(
    await access({
      data: { _status: "draft" },
      req: req("editor"),
    }),
    true,
  );
  assert.equal(
    await access({
      data: { _status: "published" },
      req: req("editor"),
    }),
    false,
  );
  assert.equal(
    await access({
      data: { _status: "published" },
      req: req("publisher"),
    }),
    true,
  );
});

test("draft workflow rejects publish, unpublish-like and trash restoration requests", () => {
  const hook = createDraftOnlyWorkflowHook("blog");
  const base = {
    collection: {},
    context: {},
    operation: "update",
    originalDoc: { _status: "published" },
  } as const;

  assert.doesNotThrow(() =>
    hook({
      ...base,
      data: { _status: "draft" },
      req: req("editor", { draft: "true" }),
    } as never),
  );
  assert.throws(
    () =>
      hook({
        ...base,
        data: { _status: "published" },
        req: req("editor", { draft: "true" }),
      } as never),
    /apenas rascunhos/,
  );
  assert.throws(
    () =>
      hook({
        ...base,
        data: { _status: "draft" },
        req: req("editor"),
      } as never),
    /apenas rascunhos/,
  );
  assert.throws(
    () =>
      hook({
        ...base,
        data: { _status: "draft", deletedAt: null },
        originalDoc: {
          _status: "published",
          deletedAt: "2026-07-25T00:00:00.000Z",
        },
        req: req("editor", { draft: "true" }),
      } as never),
    /lixeira/,
  );
  assert.doesNotThrow(() =>
    hook({
      ...base,
      data: { _status: "published" },
      req: req("publisher"),
    } as never),
  );
});

test("authors cannot restore versions", () => {
  assert.throws(
    () =>
      preventAuthorVersionRestore({
        operation: "restoreVersion",
        req: req("editor"),
      } as never),
    /restaurar versões/,
  );
  assert.doesNotThrow(() =>
    preventAuthorVersionRestore({
      operation: "restoreVersion",
      req: req("publisher"),
    } as never),
  );
});

test("folder scopes follow the same collection matrix", () => {
  assert.equal(
    canUseFolderTypes(req("editor"), {
      folderType: ["blog", "galeria"],
    }),
    true,
  );
  assert.equal(
    canUseFolderTypes(req("editor"), {
      folderType: ["blog", "vagas"],
    }),
    false,
  );
  assert.equal(
    canUseFolderTypes(req("recruiter"), {
      folderType: ["vagas", "media"],
    }),
    true,
  );
  assert.equal(
    canUseFolderTypes(req("recruiter"), {
      folderType: ["galeria"],
    }),
    false,
  );
});

test("protects custom plugin endpoints in addition to collection access", async () => {
  const collection = restrictAdminToolCollection({
    slug: "test-tool",
    fields: [],
    endpoints: [
      {
        handler: () => new Response("ok"),
        method: "post",
        path: "/run",
      },
    ],
  });
  const endpoints = collection.endpoints;
  assert.ok(Array.isArray(endpoints));
  const endpoint = endpoints[0];
  assert.ok(endpoint);

  const denied = await endpoint.handler(req("editor"));
  assert.equal(denied.status, 403);

  const allowed = await endpoint.handler(req("publisher"));
  assert.equal(allowed.status, 200);
  assert.equal(await allowed.text(), "ok");
});
