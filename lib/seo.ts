import type { Metadata, MetadataRoute } from "next";

export const SITE_NAME = "Elinsa do Brasil";
export const SITE_URL = new URL("https://elinsadobrasil.com.br");
export const SITE_DESCRIPTION =
  "Infraestrutura elétrica, manutenção e obras para operações no Pará.";
export const DEFAULT_SOCIAL_IMAGE = "/images/eletricistas.webp";
// Square (2048x2048) so Google can render it in the circular Knowledge Panel /
// brand search logo slot without letterboxing the wide wordmark.
export const ORGANIZATION_LOGO = "/kit-de-marca/png/e-azul.png";
export const BRAND_ASSET_IMAGES = [
  {
    caption:
      "Versão colorida do logo oficial da Elinsa do Brasil, para uso em fundos claros ou neutros.",
    name: "Logo colorido da Elinsa do Brasil",
    url: "/kit-de-marca/png/logo-colorido.png",
  },
  {
    caption:
      "Versão branca do logo oficial da Elinsa do Brasil, para uso em fundos escuros.",
    name: "Logo branco da Elinsa do Brasil",
    url: "/kit-de-marca/png/logo-branco.png",
  },
  {
    caption:
      "Versão preta do logo oficial da Elinsa do Brasil, para aplicações monocromáticas.",
    name: "Logo preto da Elinsa do Brasil",
    url: "/kit-de-marca/png/logo-preto.png",
  },
  {
    caption:
      "Símbolo oficial da Elinsa do Brasil na cor azul, a cor principal da marca.",
    name: "Símbolo azul da Elinsa do Brasil",
    url: "/kit-de-marca/png/e-azul.png",
  },
  {
    caption: "Símbolo oficial da Elinsa do Brasil em branco.",
    name: "Símbolo branco da Elinsa do Brasil",
    url: "/kit-de-marca/png/e-branco.png",
  },
  {
    caption: "Símbolo oficial da Elinsa do Brasil em preto.",
    name: "Símbolo preto da Elinsa do Brasil",
    url: "/kit-de-marca/png/e-preto.png",
  },
] as const;

export const ORGANIZATION_SOCIAL_PROFILES = [
  "https://www.instagram.com/elinsadobrasil/",
  "https://www.linkedin.com/in/elinsadobrasil/",
  "https://github.com/elinsa-do-brasil",
];

export const STATIC_SITEMAP_PATHS = [
  "/",
  "/quem-somos",
  "/imprensa",
  "/vagas",
  "/galeria",
  "/mapas",
  "/marca",
  "/contato",
  "/privacidade",
  "/termos",
  "/licencas",
  "/denunciar",
  "/amper-cuida",
] as const;

export const ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/payload/",
  "/portal/",
  "/dev/",
  "/monitoring",
  "/entrar",
  "/criar",
  "/convite/",
  "/configuracoes/",
  "/recuperar-senha",
  "/redefinir-senha",
  "/verificar-email",
] as const;

export type SeoImage = {
  alt?: string;
  height?: number;
  url: string;
  width?: number;
};

export type CmsImageValue =
  | {
      alt?: null | string;
      height?: null | number;
      url?: null | string;
      width?: null | number;
    }
  | number
  | string
  | null
  | undefined;

type PageMetadataOptions = {
  absoluteTitle?: boolean;
  authors?: string[];
  description: string;
  image?: CmsImageValue;
  modifiedTime?: null | string;
  path: string;
  publishedTime?: null | string;
  title: string;
  type?: "article" | "website";
};

type SitemapPost = {
  _status?: null | string;
  draft?: boolean;
  image?: null | string;
  slug?: null | string;
  updatedAt?: null | string;
};

type SitemapJob = {
  _status?: null | string;
  draft?: boolean;
  jobStatus: string;
  slug?: null | string;
  updatedAt?: null | string;
};

type SitemapGallery = {
  images: string[];
  updatedAt?: null | string;
};

export function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, SITE_URL).toString();
  } catch {
    return SITE_URL.toString();
  }
}

export function normalizeSeoTitle(title: string) {
  const normalized = title
    .trim()
    .replace(/\s*(?:\||—|-)\s*Elinsa(?: do Brasil)?\s*$/iu, "")
    .trim();

  return normalized || SITE_NAME;
}

export function createSeoDescription(
  candidates: Array<null | string | undefined>,
  fallback: string,
) {
  const description = candidates
    .map((candidate) => candidate?.replace(/\s+/g, " ").trim())
    .find(Boolean);

  if (!description) {
    return fallback;
  }

  if (description.length <= 170) {
    return description;
  }

  return `${description.slice(0, 167).trimEnd()}…`;
}

export function getCmsSeoImage(value: CmsImageValue): SeoImage | null {
  if (!value || typeof value !== "object" || !value.url) {
    return null;
  }

  return {
    alt: value.alt ?? undefined,
    height: value.height ?? undefined,
    url: absoluteUrl(value.url),
    width: value.width ?? undefined,
  };
}

export function resolveCmsSeoFields({
  fallbackDescription,
  fallbackImage,
  fallbackTitle,
  meta,
}: {
  fallbackDescription: string;
  fallbackImage?: CmsImageValue;
  fallbackTitle: string;
  meta?: null | {
    description?: null | string;
    image?: CmsImageValue;
    title?: null | string;
  };
}) {
  return {
    description: meta?.description?.trim() || fallbackDescription,
    image: getCmsSeoImage(meta?.image) ? meta?.image : fallbackImage,
    title: meta?.title?.trim() || fallbackTitle,
  };
}

export function createPageMetadata({
  absoluteTitle = false,
  authors,
  description,
  image,
  modifiedTime,
  path,
  publishedTime,
  title,
  type = "website",
}: PageMetadataOptions): Metadata {
  const normalizedTitle = normalizeSeoTitle(title);
  const absolutePageTitle = title.trim() || SITE_NAME;
  const socialTitle = absoluteTitle
    ? absolutePageTitle
    : normalizedTitle === SITE_NAME
      ? SITE_NAME
      : `${normalizedTitle} | ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const cmsImage = getCmsSeoImage(image);
  const socialImage = cmsImage ?? {
    alt: `${SITE_NAME} — infraestrutura elétrica no Pará`,
    url: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
  };
  const metadataTitle = absoluteTitle
    ? { absolute: absolutePageTitle }
    : normalizedTitle;
  const openGraph =
    type === "article"
      ? {
          authors,
          description,
          images: [socialImage],
          locale: "pt_BR",
          modifiedTime: validDate(modifiedTime),
          publishedTime: validDate(publishedTime),
          siteName: SITE_NAME,
          title: socialTitle,
          type: "article" as const,
          url: canonical,
        }
      : {
          description,
          images: [socialImage],
          locale: "pt_BR",
          siteName: SITE_NAME,
          title: socialTitle,
          type: "website" as const,
          url: canonical,
        };

  return {
    alternates: { canonical },
    description,
    openGraph,
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title: metadataTitle,
    twitter: {
      card: "summary_large_image",
      description,
      images: [socialImage.url],
      title: socialTitle,
    },
  };
}

export function createNoIndexMetadata({
  description,
  title,
}: {
  description: string;
  title: string;
}): Metadata {
  return {
    description,
    robots: {
      follow: false,
      googleBot: { follow: false, index: false },
      index: false,
    },
    title: normalizeSeoTitle(title),
  };
}

export function isProductionIndexingEnabled(
  env: { NODE_ENV?: string; VERCEL_ENV?: string } = process.env,
) {
  return env.VERCEL_ENV
    ? env.VERCEL_ENV === "production"
    : env.NODE_ENV === "production";
}

export function createRobotsMetadata(
  indexable = isProductionIndexingEnabled(),
): MetadataRoute.Robots {
  if (!indexable) {
    return {
      rules: { disallow: "/", userAgent: "*" },
    };
  }

  return {
    rules: {
      allow: "/",
      disallow: [...ROBOTS_DISALLOW_PATHS],
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

export function createSitemap({
  gallery,
  jobs,
  posts,
}: {
  gallery?: SitemapGallery | null;
  jobs: SitemapJob[];
  posts: SitemapPost[];
}): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map(
    (path) => ({
      images:
        path === "/"
          ? [absoluteUrl(DEFAULT_SOCIAL_IMAGE)]
          : path === "/marca"
            ? BRAND_ASSET_IMAGES.map((image) => absoluteUrl(image.url))
            : undefined,
      url: absoluteUrl(path),
    }),
  );
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) => {
    if (!post.slug || post.draft || post._status === "draft") {
      return [];
    }

    return [
      {
        images: post.image ? [absoluteUrl(post.image)] : undefined,
        lastModified: validDate(post.updatedAt),
        url: absoluteUrl(`/imprensa/${encodeURIComponent(post.slug)}`),
      },
    ];
  });
  const jobEntries: MetadataRoute.Sitemap = jobs.flatMap((job) => {
    if (
      !job.slug ||
      job.jobStatus !== "aberta" ||
      job.draft ||
      job._status === "draft"
    ) {
      return [];
    }

    return [
      {
        lastModified: validDate(job.updatedAt),
        url: absoluteUrl(`/vagas/${encodeURIComponent(job.slug)}`),
      },
    ];
  });

  if (gallery) {
    const galleryEntry = staticEntries.find(
      (entry) => entry.url === absoluteUrl("/galeria"),
    );

    if (galleryEntry) {
      galleryEntry.images = gallery.images.map(absoluteUrl);
      galleryEntry.lastModified = validDate(gallery.updatedAt);
    }
  }

  return [...staticEntries, ...postEntries, ...jobEntries];
}

function validDate(value: null | string | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) {
    return undefined;
  }

  return value;
}
