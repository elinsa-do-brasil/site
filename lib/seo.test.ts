import assert from "node:assert/strict";
import test from "node:test";
import {
  absoluteUrl,
  createPageMetadata,
  createRobotsMetadata,
  createSitemap,
  isProductionIndexingEnabled,
  resolveCmsSeoFields,
  SITE_URL,
} from "@/lib/seo";
import {
  createBrandPageStructuredData,
  createJobPostingStructuredData,
  createNewsArticleStructuredData,
  serializeJsonLd,
} from "@/lib/structured-data";

test("metadata gera título sem marca duplicada e canonical absoluto", () => {
  const metadata = createPageMetadata({
    description: "Uma notícia pública da Elinsa.",
    path: "/imprensa/nova-base",
    title: "Nova base regional | Elinsa do Brasil",
  });

  assert.equal(metadata.title, "Nova base regional");
  assert.equal(
    metadata.alternates?.canonical,
    "https://elinsadobrasil.com.br/imprensa/nova-base",
  );
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.ok(JSON.stringify(metadata.twitter).includes("summary_large_image"));
});

test("campos SEO do Payload têm prioridade e conteúdo visível é fallback", () => {
  const cms = resolveCmsSeoFields({
    fallbackDescription: "Resumo visível",
    fallbackImage: { url: "/fallback.webp" },
    fallbackTitle: "Título visível",
    meta: {
      description: "Descrição editorial",
      image: { url: "/seo.webp" },
      title: "Título editorial",
    },
  });

  assert.equal(cms.title, "Título editorial");
  assert.equal(cms.description, "Descrição editorial");
  assert.deepEqual(cms.image, { url: "/seo.webp" });

  const fallback = resolveCmsSeoFields({
    fallbackDescription: "Resumo visível",
    fallbackImage: { url: "/fallback.webp" },
    fallbackTitle: "Título visível",
    meta: { description: " ", image: 42, title: "" },
  });

  assert.equal(fallback.title, "Título visível");
  assert.equal(fallback.description, "Resumo visível");
  assert.deepEqual(fallback.image, { url: "/fallback.webp" });
});

test("robots libera produção e bloqueia previews", () => {
  assert.equal(
    isProductionIndexingEnabled({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
    }),
    false,
  );
  assert.deepEqual(createRobotsMetadata(false), {
    rules: { disallow: "/", userAgent: "*" },
  });

  const production = createRobotsMetadata(true);
  assert.equal(production.sitemap, absoluteUrl("/sitemap.xml"));
  assert.ok(!JSON.stringify(production.rules).includes("/_next"));
  assert.ok(JSON.stringify(production.rules).includes("/portal/"));
});

test("sitemap contém apenas URLs públicas, canônicas e válidas", () => {
  const sitemap = createSitemap({
    gallery: {
      images: ["/api/galeria/file/equipe.webp"],
      updatedAt: "2026-07-01T12:00:00.000Z",
    },
    jobs: [
      {
        jobStatus: "aberta",
        slug: "eletricista-belem",
        updatedAt: "2026-07-02T12:00:00.000Z",
      },
      { jobStatus: "fechada", slug: "vaga-fechada" },
      { _status: "draft", jobStatus: "aberta", slug: "vaga-draft" },
    ],
    posts: [
      {
        image: "/api/media/file/noticia.webp",
        slug: "nova-operacao",
        updatedAt: "2026-07-03T12:00:00.000Z",
      },
      { _status: "draft", slug: "rascunho" },
    ],
  });
  const urls = sitemap.map((entry) => entry.url);

  assert.ok(urls.every((url) => url.startsWith(SITE_URL.toString())));
  assert.ok(urls.includes(absoluteUrl("/denunciar")));
  assert.ok(urls.includes(absoluteUrl("/amper-cuida")));
  assert.ok(urls.includes(absoluteUrl("/imprensa/nova-operacao")));
  assert.ok(urls.includes(absoluteUrl("/vagas/eletricista-belem")));
  assert.ok(!urls.some((url) => url.includes("formulario")));
  assert.ok(!urls.some((url) => url.includes("acompanhar-denuncia")));
  assert.ok(!urls.some((url) => url.includes("acolhimento")));
  assert.ok(!urls.some((url) => url.endsWith("/ampercuida")));
  assert.ok(!urls.some((url) => url.includes("vaga-fechada")));
  assert.ok(!urls.some((url) => url.includes("draft")));
  assert.deepEqual(
    sitemap.find((entry) => entry.url === absoluteUrl("/galeria"))?.images,
    [absoluteUrl("/api/galeria/file/equipe.webp")],
  );

  const marcaImages = sitemap.find(
    (entry) => entry.url === absoluteUrl("/marca"),
  )?.images;

  assert.ok(marcaImages && marcaImages.length > 0);
  assert.ok(marcaImages?.every((url) => url.startsWith(SITE_URL.toString())));
});

test("JSON-LD representa notícia e vaga e escapa início de tags", () => {
  const news = createNewsArticleStructuredData({
    author: "Elinsa do Brasil",
    datePublished: "2026-07-03T12:00:00.000Z",
    description: "Notícia pública",
    image: "/noticia.webp",
    path: "/imprensa/noticia",
    title: "Notícia <script>alert(1)</script>",
  });
  const job = createJobPostingStructuredData({
    city: "Belém",
    datePosted: "2026-07-02T12:00:00.000Z",
    description: "Vaga aberta",
    identifier: 10,
    path: "/vagas/eletricista",
    title: "Eletricista",
  });
  const serialized = serializeJsonLd(news);

  assert.ok(serialized.includes("\\u003cscript>"));
  assert.ok(!serialized.includes("<script>"));
  assert.equal(job["@graph"][0]["@type"], "JobPosting");
  assert.ok(JSON.stringify(job).includes('"addressRegion":"PA"'));
});

test("JSON-LD da página de marca expõe as imagens oficiais do logo", () => {
  const serialized = JSON.stringify(createBrandPageStructuredData());

  assert.ok(serialized.includes('"@type":"WebPage"'));
  assert.ok(serialized.includes(absoluteUrl("/marca")));
  assert.ok(serialized.includes('"@type":"ImageObject"'));
  assert.ok(serialized.includes('"@type":"BreadcrumbList"'));
});
