import assert from "node:assert/strict";
import configPromise from "@payload-config";
import {
  createLocalReq,
  getAccessResults,
  getPayload,
  type Payload,
  type PayloadRequest,
} from "payload";
import type { User, Vagas } from "../payload-types.ts";

const runID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const temporaryPassword = `Rbac-${runID}-A1!`;
const created: Partial<Record<string, Array<number | string>>> = {};

function remember(collection: string, id: number | string) {
  const ids = created[collection] ?? [];
  ids.push(id);
  created[collection] = ids;
}

function forget(collection: string, id: number | string) {
  created[collection] = (created[collection] ?? []).filter(
    (createdID) => createdID !== id,
  );
}

async function userRequest(
  payload: Payload,
  user: User,
  draft = false,
): Promise<PayloadRequest> {
  return createLocalReq(
    {
      req: {
        query: draft ? { draft: "true" } : {},
      },
      user,
    },
    payload,
  );
}

async function expectDenied(operation: () => Promise<unknown>) {
  await assert.rejects(operation, (error) => {
    assert.ok(error instanceof Error);
    return true;
  });
}

function lexicalContent(text: string): NonNullable<Vagas["content"]> {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as NonNullable<Vagas["content"]>;
}

async function cleanup(payload: Payload) {
  const errors: unknown[] = [];
  const cleanupOrder = [
    "payload-folders",
    "blog",
    "imprensa",
    "vagas",
    "users",
  ];

  for (const collection of cleanupOrder) {
    for (const id of [...(created[collection] ?? [])].reverse()) {
      try {
        await payload.delete({
          collection: collection as never,
          id,
          overrideAccess: true,
          overrideLock: true,
          trash: true,
        });
      } catch (error) {
        // A failed assertion must not leave later cleanup targets behind.
        errors.push(error);
      }
    }
  }

  if (errors.length) {
    throw new AggregateError(errors, "Payload RBAC test cleanup failed.");
  }
}

async function main() {
  const payload = await getPayload({ config: configPromise });

  try {
    assert.equal(Object.hasOwn(payload.collections, "cms-search"), false);

    const adminResult = await payload.find({
      collection: "users",
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: "raave.aires@grupoamperelinsa.com",
        },
      },
    });
    const admin = adminResult.docs[0];
    assert.ok(admin);
    assert.equal(admin.role, "admin");

    const adminReq = await userRequest(payload, admin);
    const roles = ["publisher", "editor", "recruiter"] as const;
    const users = {} as Record<(typeof roles)[number], User>;

    for (const role of roles) {
      const createdUser = await payload.create({
        collection: "users",
        data: {
          email: `payload-rbac-${role}-${runID}@example.invalid`,
          name: `RBAC ${role}`,
          password: temporaryPassword,
          role,
        },
        overrideAccess: false,
        req: adminReq,
        user: admin,
      });
      users[role] = createdUser;
      remember("users", createdUser.id);
    }

    const usersVisibleToEditor = await payload.find({
      collection: "users",
      limit: 10,
      overrideAccess: false,
      req: await userRequest(payload, users.editor),
      user: users.editor,
    });
    const editorView = usersVisibleToEditor.docs as unknown as Array<
      Record<string, unknown>
    >;
    const ownEditorView = editorView.find(
      (document) => document.id === users.editor.id,
    );
    const publisherView = editorView.find(
      (document) => document.id === users.publisher.id,
    );
    assert.equal(ownEditorView?.email, users.editor.email);
    assert.equal(ownEditorView?.role, "editor");
    assert.equal(publisherView?.id, users.publisher.id);
    assert.equal(publisherView?.name, users.publisher.name);
    assert.equal(publisherView?.email, undefined);
    assert.equal(publisherView?.role, undefined);

    await expectDenied(async () =>
      payload.create({
        collection: "users",
        data: {
          email: `payload-rbac-forbidden-${runID}@example.invalid`,
          name: "Forbidden",
          password: temporaryPassword,
          role: "editor",
        },
        overrideAccess: false,
        req: await userRequest(payload, users.publisher),
        user: users.publisher,
      }),
    );

    const renamedEditor = await payload.update({
      collection: "users",
      id: users.editor.id,
      data: { name: "RBAC editor atualizado" },
      overrideAccess: false,
      req: await userRequest(payload, users.editor),
      user: users.editor,
    });
    assert.equal(renamedEditor.name, "RBAC editor atualizado");

    await expectDenied(() =>
      payload.update({
        collection: "users",
        id: admin.id,
        data: { role: "publisher" },
        overrideAccess: false,
        req: adminReq,
        user: admin,
      }),
    );
    await expectDenied(() =>
      payload.delete({
        collection: "users",
        id: admin.id,
        overrideAccess: false,
        req: adminReq,
        user: admin,
      }),
    );

    const now = new Date().toISOString();
    const editorDraftReq = await userRequest(payload, users.editor, true);
    const editorBlog = await payload.create({
      collection: "blog",
      data: {
        _status: "draft",
        author: users.editor.id,
        publishedAt: now,
        summary: "Rascunho de integração RBAC",
        title: `RBAC Blog ${runID}`,
      },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });
    remember("blog", editorBlog.id);

    const editorPress = await payload.create({
      collection: "imprensa",
      data: {
        _status: "draft",
        author: users.editor.id,
        publishedAt: now,
        summary: "Rascunho público de integração RBAC",
        title: `RBAC Imprensa ${runID}`,
      },
      draft: true,
      overrideAccess: false,
      req: await userRequest(payload, users.editor, true),
      user: users.editor,
    });
    remember("imprensa", editorPress.id);

    const publisherDeleteTarget = await payload.create({
      collection: "blog",
      data: {
        _status: "draft",
        author: users.editor.id,
        publishedAt: now,
        summary: "Documento temporário para exclusão pelo publisher.",
        title: `RBAC exclusão publisher ${runID}`,
      },
      draft: true,
      overrideAccess: false,
      req: await userRequest(payload, users.editor, true),
      user: users.editor,
    });
    remember("blog", publisherDeleteTarget.id);

    await expectDenied(async () =>
      payload.create({
        collection: "blog",
        data: {
          _status: "published",
          author: users.editor.id,
          publishedAt: now,
          subject: "comunicados",
          summary: "Tentativa de publicação",
          title: `RBAC publicação negada ${runID}`,
        },
        draft: false,
        overrideAccess: false,
        req: await userRequest(payload, users.editor),
        user: users.editor,
      }),
    );

    await expectDenied(async () =>
      payload.create({
        collection: "vagas",
        data: {
          _status: "draft",
          city: "belem",
          jobStatus: "aberta",
          publishedAt: now,
          sector: "Teste",
          summary: "Editor não recruta",
          title: `RBAC vaga negada ${runID}`,
        },
        draft: true,
        overrideAccess: false,
        req: await userRequest(payload, users.editor, true),
        user: users.editor,
      }),
    );

    const recruiterJob = await payload.create({
      collection: "vagas",
      data: {
        _status: "draft",
        city: "belem",
        content: lexicalContent("Descrição da vaga RBAC"),
        jobStatus: "aberta",
        publishedAt: now,
        sector: "Teste",
        summary: "Rascunho de vaga RBAC",
        title: `RBAC Vaga ${runID}`,
      },
      draft: true,
      overrideAccess: false,
      req: await userRequest(payload, users.recruiter, true),
      user: users.recruiter,
    });
    remember("vagas", recruiterJob.id);

    await expectDenied(async () =>
      payload.create({
        collection: "blog",
        data: {
          _status: "draft",
          author: users.recruiter.id,
          publishedAt: now,
          summary: "Recrutador não escreve Blog",
          title: `RBAC blog recruiter negado ${runID}`,
        },
        draft: true,
        overrideAccess: false,
        req: await userRequest(payload, users.recruiter, true),
        user: users.recruiter,
      }),
    );

    const publisherReq = await userRequest(payload, users.publisher);
    await payload.delete({
      collection: "blog",
      id: publisherDeleteTarget.id,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    forget("blog", publisherDeleteTarget.id);

    await payload.update({
      collection: "blog",
      id: editorBlog.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    await payload.update({
      collection: "imprensa",
      id: editorPress.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    await payload.update({
      collection: "vagas",
      id: recruiterJob.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });

    await payload.update({
      collection: "blog",
      id: editorBlog.id,
      data: {
        _status: "draft",
        title: `RBAC Blog revisão ${runID}`,
      },
      draft: true,
      overrideAccess: false,
      req: await userRequest(payload, users.editor, true),
      user: users.editor,
    });
    const stillPublished = await payload.findByID({
      collection: "blog",
      id: editorBlog.id,
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    assert.equal(stillPublished.title, `RBAC Blog ${runID}`);

    await expectDenied(async () =>
      payload.delete({
        collection: "blog",
        id: editorBlog.id,
        overrideAccess: false,
        req: await userRequest(payload, users.editor),
        user: users.editor,
      }),
    );

    const versions = await payload.findVersions({
      collection: "blog",
      limit: 1,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
      where: {
        parent: {
          equals: editorBlog.id,
        },
      },
    });
    assert.ok(versions.docs[0]);
    await expectDenied(async () =>
      payload.restoreVersion({
        collection: "blog",
        id: String(versions.docs[0].id),
        overrideAccess: false,
        req: await userRequest(payload, users.editor),
        user: users.editor,
      }),
    );

    await payload.update({
      collection: "blog",
      id: editorBlog.id,
      data: { _status: "draft" },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    const unpublished = await payload.findByID({
      collection: "blog",
      id: editorBlog.id,
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    assert.equal(unpublished._status, "draft");
    await payload.update({
      collection: "blog",
      id: editorBlog.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });

    const editorFolder = await payload.create({
      collection: "payload-folders",
      data: {
        folderType: ["blog", "galeria"],
        name: `RBAC editor ${runID}`,
      },
      overrideAccess: false,
      req: await userRequest(payload, users.editor),
      user: users.editor,
    });
    remember("payload-folders", editorFolder.id);
    await expectDenied(async () =>
      payload.create({
        collection: "payload-folders",
        data: {
          folderType: ["vagas"],
          name: `RBAC pasta negada ${runID}`,
        },
        overrideAccess: false,
        req: await userRequest(payload, users.editor),
        user: users.editor,
      }),
    );
    await payload.delete({
      collection: "payload-folders",
      id: editorFolder.id,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    forget("payload-folders", editorFolder.id);

    const editorAccess = await getAccessResults({
      req: await userRequest(payload, users.editor),
    });
    assert.equal(editorAccess.collections?.media?.create, true);
    assert.equal(Boolean(editorAccess.collections?.media?.delete), false);
    assert.equal(editorAccess.collections?.galeria?.create, true);
    assert.equal(Boolean(editorAccess.collections?.galeria?.delete), false);
    assert.equal(Boolean(editorAccess.collections?.redirects?.create), false);
    assert.equal(
      Boolean(editorAccess.collections?.["activity-log"]?.read),
      false,
    );
    assert.equal(Boolean(editorAccess.collections?.imports?.read), false);

    const recruiterAccess = await getAccessResults({
      req: await userRequest(payload, users.recruiter),
    });
    assert.equal(recruiterAccess.collections?.media?.create, true);
    assert.equal(Boolean(recruiterAccess.collections?.galeria?.create), false);

    const publisherAccess = await getAccessResults({
      req: publisherReq,
    });
    assert.equal(publisherAccess.collections?.redirects?.create, true);
    assert.equal(publisherAccess.collections?.["activity-log"]?.read, true);
    assert.equal(publisherAccess.collections?.imports?.read, true);

    const anonymousPress = await payload.find({
      collection: "imprensa",
      limit: 1,
      overrideAccess: false,
      where: { id: { equals: editorPress.id } },
    });
    assert.equal(anonymousPress.totalDocs, 1);
    const anonymousJobs = await payload.find({
      collection: "vagas",
      limit: 1,
      overrideAccess: false,
      where: { id: { equals: recruiterJob.id } },
    });
    assert.equal(anonymousJobs.totalDocs, 1);
    await expectDenied(() =>
      payload.find({
        collection: "blog",
        limit: 1,
        overrideAccess: false,
        where: { id: { equals: editorBlog.id } },
      }),
    );

    await payload.update({
      collection: "users",
      id: users.editor.id,
      data: { role: "publisher" },
      overrideAccess: false,
      req: adminReq,
      user: admin,
    });
    const promoted = await payload.findByID({
      collection: "users",
      id: users.editor.id,
      overrideAccess: true,
    });
    const promotedAccess = await getAccessResults({
      req: await userRequest(payload, promoted),
    });
    assert.equal(promotedAccess.collections?.vagas?.update, true);
    assert.equal(promotedAccess.collections?.redirects?.create, true);

    await payload.update({
      collection: "users",
      id: users.editor.id,
      data: { role: "editor" },
      overrideAccess: false,
      req: adminReq,
      user: admin,
    });
    const demoted = await payload.findByID({
      collection: "users",
      id: users.editor.id,
      overrideAccess: true,
    });
    const demotedAccess = await getAccessResults({
      req: await userRequest(payload, demoted),
    });
    assert.equal(Boolean(demotedAccess.collections?.vagas?.update), false);
    assert.equal(Boolean(demotedAccess.collections?.redirects?.create), false);

    console.log("Payload RBAC integration checks passed.");
  } finally {
    await cleanup(payload);
    await payload.destroy();
  }
}

await main();
process.exit(0);
