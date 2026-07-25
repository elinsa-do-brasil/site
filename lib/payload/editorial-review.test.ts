import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyEditorialReviewCandidates,
  createEditorialReviewCandidate,
  type EditorialReviewCandidate,
  mergeEditorialReviewCandidates,
  parseEditorialReviewFilters,
} from "./editorial-review.ts";

function candidate({
  collection = "blog",
  id,
  updatedAt,
}: {
  collection?: EditorialReviewCandidate["collection"];
  id: number;
  updatedAt: string;
}): EditorialReviewCandidate {
  return {
    collection,
    href: `/payload/collections/${collection}/${id}`,
    id,
    lastModifiedBy: `Usuário ${id}`,
    title: `Documento ${id}`,
    updatedAt,
  };
}

test("normaliza filtros válidos e mantém somente valores seguros", () => {
  assert.deepEqual(
    parseEditorialReviewFilters({
      area: "imprensa",
      page: "3",
      q: "  comunicado  ",
    }),
    {
      area: "imprensa",
      page: 3,
      query: "comunicado",
    },
  );

  assert.deepEqual(
    parseEditorialReviewFilters({
      area: "redirects",
      page: "0",
      q: ["não", "aceitar"],
    }),
    {
      area: "todas",
      page: 1,
      query: "",
    },
  );

  assert.equal(parseEditorialReviewFilters({ page: "1001" }).page, 1);
  assert.equal(parseEditorialReviewFilters({ page: "101" }).page, 1);
});

test("monta candidato com título, responsável e URL do documento original", () => {
  const result = createEditorialReviewCandidate({
    adminRoute: "/payload",
    collection: "blog",
    document: {
      id: "artigo com espaço",
      lastModifiedBy: {
        relationTo: "users",
        value: {
          id: 42,
          collection: "users",
          email: "editor@example.invalid",
          name: "  Editora Exemplo  ",
          role: "editor",
          updatedAt: "2026-01-01T00:00:00.000Z",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
      title: "  Artigo de teste  ",
      updatedAt: "2026-07-25T10:00:00.000Z",
    },
  });

  assert.equal(
    result.href,
    "/payload/collections/blog/artigo%20com%20espa%C3%A7o",
  );
  assert.equal(result.lastModifiedBy, "Editora Exemplo");
  assert.equal(result.title, "Artigo de teste");
});

test("aplica fallbacks quando título, usuário ou data não estão disponíveis", () => {
  const result = createEditorialReviewCandidate({
    adminRoute: "/payload",
    collection: "vagas",
    document: {
      id: 9,
      lastModifiedBy: {
        relationTo: "users",
        value: 12,
      },
      title: "   ",
      updatedAt: "data-inválida",
    },
  });

  assert.equal(result.title, "Sem título");
  assert.equal(result.lastModifiedBy, "Usuário indisponível");
  assert.equal(result.updatedAt, "1970-01-01T00:00:00.000Z");
});

test("deduplica por coleção e ID, preserva coleções distintas e ordena por atualização", () => {
  const results = mergeEditorialReviewCandidates({
    candidates: [
      candidate({ id: 1, updatedAt: "2026-07-21T10:00:00.000Z" }),
      candidate({ id: 2, updatedAt: "2026-07-24T10:00:00.000Z" }),
      candidate({ id: 1, updatedAt: "2026-07-25T10:00:00.000Z" }),
      candidate({
        collection: "imprensa",
        id: 1,
        updatedAt: "2026-07-23T10:00:00.000Z",
      }),
    ],
    page: 1,
    perPage: 20,
  });

  assert.deepEqual(
    results.map(({ collection, id, updatedAt }) => ({
      collection,
      id,
      updatedAt,
    })),
    [
      {
        collection: "blog",
        id: 1,
        updatedAt: "2026-07-25T10:00:00.000Z",
      },
      {
        collection: "blog",
        id: 2,
        updatedAt: "2026-07-24T10:00:00.000Z",
      },
      {
        collection: "imprensa",
        id: 1,
        updatedAt: "2026-07-23T10:00:00.000Z",
      },
    ],
  );
});

test("pagina a lista conjunta somente depois de ordenar", () => {
  const results = mergeEditorialReviewCandidates({
    candidates: Array.from({ length: 45 }, (_, index) =>
      candidate({
        collection:
          index % 3 === 0 ? "blog" : index % 3 === 1 ? "imprensa" : "vagas",
        id: index + 1,
        updatedAt: new Date(
          Date.UTC(2026, 6, 25, 12, 0, 0) - index * 60_000,
        ).toISOString(),
      }),
    ),
    page: 2,
    perPage: 20,
  });

  assert.equal(results.length, 20);
  assert.equal(results[0]?.id, 21);
  assert.equal(results[19]?.id, 40);
});

test("classifica como revisão somente candidatos com versão publicada", () => {
  const candidates = [
    candidate({ id: 1, updatedAt: "2026-07-25T10:00:00.000Z" }),
    candidate({
      collection: "imprensa",
      id: 1,
      updatedAt: "2026-07-25T09:00:00.000Z",
    }),
  ];
  const results = classifyEditorialReviewCandidates({
    candidates,
    publishedKeys: new Set(["blog:1"]),
  });

  assert.deepEqual(
    results.map(({ collection, state }) => ({ collection, state })),
    [
      { collection: "blog", state: "changed" },
      { collection: "imprensa", state: "new" },
    ],
  );
});
