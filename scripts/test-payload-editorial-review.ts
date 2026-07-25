import assert from "node:assert/strict";
import configPromise from "@payload-config";
import {
  createLocalReq,
  getPayload,
  type Payload,
  type PayloadRequest,
} from "payload";
import {
  EditorialReviewForbiddenError,
  getEditorialReviewQueue,
} from "../lib/payload/editorial-review.ts";
import type { User, Vagas } from "../payload-types.ts";

const runID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const titlePrefix = `ERQ-${runID}`;
const temporaryPassword = `Editorial-${runID}-A1!`;
const created: Partial<Record<string, Array<number | string>>> = {};

function remember(collection: string, id: number | string) {
  const ids = created[collection] ?? [];
  ids.push(id);
  created[collection] = ids;
}

async function userRequest(
  payload: Payload,
  user?: User,
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

  for (const collection of ["blog", "imprensa", "vagas", "users"]) {
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
        errors.push(error);
      }
    }
  }

  if (errors.length) {
    throw new AggregateError(
      errors,
      "Editorial review integration cleanup failed.",
    );
  }
}

async function main() {
  const payload = await getPayload({ config: configPromise });

  try {
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
    assert.ok(admin, "Expected administrative test account was not found.");
    assert.equal(admin.role, "admin");

    const adminReq = await userRequest(payload, admin);
    const users = {} as Record<"editor" | "publisher" | "recruiter", User>;

    for (const role of ["publisher", "editor", "recruiter"] as const) {
      const user = await payload.create({
        collection: "users",
        data: {
          email: `payload-editorial-${role}-${runID}@example.invalid`,
          name: `Editorial ${role}`,
          password: temporaryPassword,
          role,
        },
        overrideAccess: false,
        req: adminReq,
        user: admin,
      });
      users[role] = user;
      remember("users", user.id);
    }

    const now = new Date().toISOString();
    const editorDraftReq = await userRequest(payload, users.editor, true);
    const recruiterDraftReq = await userRequest(payload, users.recruiter, true);
    const publisherReq = await userRequest(payload, users.publisher);

    const newBlog = await payload.create({
      collection: "blog",
      data: {
        _status: "draft",
        author: users.editor.id,
        publishedAt: now,
        summary: "Novo rascunho para a fila editorial.",
        title: `${titlePrefix} Blog novo`,
      },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });
    remember("blog", newBlog.id);

    const newPress = await payload.create({
      collection: "imprensa",
      data: {
        _status: "draft",
        author: users.editor.id,
        publishedAt: now,
        summary: "Nova notícia para a fila editorial.",
        title: `${titlePrefix} Imprensa nova`,
      },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });
    remember("imprensa", newPress.id);

    const newJob = await payload.create({
      collection: "vagas",
      data: {
        _status: "draft",
        city: "belem",
        content: lexicalContent("Descrição da vaga da fila editorial."),
        jobStatus: "aberta",
        publishedAt: now,
        sector: "Teste",
        summary: "Nova vaga para a fila editorial.",
        title: `${titlePrefix} Vaga nova`,
      },
      draft: true,
      overrideAccess: false,
      req: recruiterDraftReq,
      user: users.recruiter,
    });
    remember("vagas", newJob.id);

    const trashedDraft = await payload.create({
      collection: "blog",
      data: {
        _status: "draft",
        author: users.editor.id,
        publishedAt: now,
        summary: "Este rascunho não pode aparecer na fila.",
        title: `${titlePrefix} Blog na lixeira`,
      },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });
    remember("blog", trashedDraft.id);
    await payload.update({
      collection: "blog",
      id: trashedDraft.id,
      data: { deletedAt: new Date().toISOString() },
      draft: true,
      overrideAccess: false,
      req: await userRequest(payload, users.publisher, true),
      user: users.publisher,
    });

    await payload.update({
      collection: "blog",
      id: newBlog.id,
      data: { title: `${titlePrefix} Blog novo revisão 1` },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });
    await payload.update({
      collection: "blog",
      id: newBlog.id,
      data: { title: `${titlePrefix} Blog novo revisão 2` },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });

    const initialQueue = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { q: titlePrefix },
    });
    assert.equal(initialQueue.totalDocs, 3);
    assert.equal(initialQueue.items.length, 3);
    assert.equal(
      initialQueue.items.filter((item) => item.id === newBlog.id).length,
      1,
      "Multiple draft versions must produce a single queue item.",
    );
    assert.ok(initialQueue.items.every((item) => item.state === "new"));
    assert.equal(
      initialQueue.items.find((item) => item.id === newBlog.id)?.lastModifiedBy,
      users.editor.name,
    );
    assert.equal(
      initialQueue.items.some((item) => item.id === trashedDraft.id),
      false,
    );
    const outOfRangeQueue = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { page: "2", q: titlePrefix },
    });
    assert.equal(outOfRangeQueue.page, 1);
    assert.equal(outOfRangeQueue.items.length, 3);

    const publishedBlog = await payload.create({
      collection: "blog",
      data: {
        _status: "published",
        author: users.editor.id,
        publishedAt: now,
        subject: "comunicados",
        summary: "Conteúdo publicado que receberá uma revisão.",
        title: `${titlePrefix} Blog publicado`,
      },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    remember("blog", publishedBlog.id);
    const publishedVersions = await payload.findVersions({
      collection: "blog",
      limit: 1,
      overrideAccess: false,
      req: publisherReq,
      sort: "-createdAt",
      user: users.publisher,
      where: {
        and: [
          { parent: { equals: publishedBlog.id } },
          { "version._status": { equals: "published" } },
        ],
      },
    });
    const publishedVersion = publishedVersions.docs[0];
    assert.ok(publishedVersion);

    await payload.update({
      collection: "blog",
      id: publishedBlog.id,
      data: { title: `${titlePrefix} Blog com revisão pendente` },
      draft: true,
      overrideAccess: false,
      req: editorDraftReq,
      user: users.editor,
    });

    const queueWithRevision = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { q: titlePrefix },
    });
    assert.equal(queueWithRevision.totalDocs, 4);
    assert.equal(
      queueWithRevision.items.find((item) => item.id === publishedBlog.id)
        ?.state,
      "changed",
    );

    const blogOnly = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { area: "blog", q: titlePrefix },
    });
    assert.equal(blogOnly.totalDocs, 2);
    assert.ok(blogOnly.items.every((item) => item.collection === "blog"));

    await payload.update({
      collection: "imprensa",
      id: newPress.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      req: publisherReq,
      user: users.publisher,
    });
    const afterPublish = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { q: titlePrefix },
    });
    assert.equal(
      afterPublish.items.some((item) => item.id === newPress.id),
      false,
    );

    await payload.restoreVersion({
      collection: "blog",
      id: String(publishedVersion.id),
      draft: false,
      overrideAccess: false,
      req: await userRequest(payload, users.publisher),
      user: users.publisher,
    });
    const afterRevert = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { q: titlePrefix },
    });
    assert.equal(
      afterRevert.items.some((item) => item.id === publishedBlog.id),
      false,
    );

    await payload.update({
      collection: "blog",
      id: newBlog.id,
      data: { deletedAt: new Date().toISOString() },
      draft: true,
      overrideAccess: false,
      req: await userRequest(payload, users.publisher, true),
      user: users.publisher,
    });
    await payload.update({
      collection: "vagas",
      id: newJob.id,
      data: { _status: "published" },
      draft: false,
      overrideAccess: false,
      req: await userRequest(payload, users.publisher),
      user: users.publisher,
    });
    const emptyQueue = await getEditorialReviewQueue({
      req: publisherReq,
      searchParams: { q: titlePrefix },
    });
    assert.equal(emptyQueue.totalDocs, 0);
    assert.deepEqual(emptyQueue.items, []);

    const adminQueue = await getEditorialReviewQueue({
      req: adminReq,
      searchParams: { q: titlePrefix },
    });
    assert.equal(adminQueue.totalDocs, 0);

    for (const unauthorizedReq of [
      await userRequest(payload, users.editor),
      await userRequest(payload, users.recruiter),
      await userRequest(payload),
    ]) {
      await assert.rejects(
        getEditorialReviewQueue({ req: unauthorizedReq }),
        EditorialReviewForbiddenError,
      );
    }

    console.log("Payload editorial review integration checks passed.");
  } finally {
    await cleanup(payload);
    await payload.destroy();
  }
}

await main();
process.exit(0);
