import path from "node:path";
import { fileURLToPath } from "node:url";
import { blurDataUrlsPlugin } from "@oversightstudio/blur-data-urls";
import { activityLogPlugin } from "@payload-bites/activity-log";
import { auditFieldsPlugin } from "@payload-bites/audit-fields";
import { imageSearchPlugin } from "@payload-bites/image-search";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { importExportPlugin } from "@payloadcms/plugin-import-export";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { searchPlugin } from "@payloadcms/plugin-search";
import { sentryPlugin } from "@payloadcms/plugin-sentry";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { en } from "@payloadcms/translations/languages/en";
import { es } from "@payloadcms/translations/languages/es";
import { pt } from "@payloadcms/translations/languages/pt";
import * as Sentry from "@sentry/nextjs";
import { mediaPreview } from "@seshuk/payload-media-preview";
import { buildConfig, type CollectionSlug } from "payload";
import computeBlurhash from "payload-blurhash-plugin";
import sharp from "sharp";

import { Blog, Imprensa } from "./collections/Editorial.ts";
import { Galeria } from "./collections/Galeria.ts";
import { Users } from "./collections/Users.ts";
import { Vagas } from "./collections/Vagas.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// O Image Search procura nomes fixos; estes aliases preservam o padrão do .env do projeto.
if (!process.env.API_KEY_UNSPLASH && process.env.UNSPLASH_ACCESS_KEY) {
  process.env.API_KEY_UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;
}
if (!process.env.API_KEY_PEXELS && process.env.PEXELS_API_KEY) {
  process.env.API_KEY_PEXELS = process.env.PEXELS_API_KEY;
}

const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
const s3AccessKeyId =
  process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const s3SecretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const s3Region =
  process.env.S3_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION;
const s3Endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3;
const s3PublicUrl = process.env.S3_PUBLIC_URL;
const s3Prefix = process.env.S3_PREFIX || "galeria";
const isS3Configured = Boolean(s3Bucket && s3AccessKeyId && s3SecretAccessKey);
const shouldForceS3PathStyle =
  process.env.S3_FORCE_PATH_STYLE === "false" ? false : Boolean(s3Endpoint);
const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const publicContentCollections = ["imprensa", "blog", "vagas"] as const;
const usersCollectionSlug = Users.slug as CollectionSlug;
const galleryCollectionSlug = Galeria.slug as CollectionSlug;
const imageSearchConfigured = Boolean(
  process.env.API_KEY_UNSPLASH ||
    process.env.API_KEY_PEXELS ||
    process.env.API_KEY_PIXABAY,
);
const payloadSentryEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

function getDocumentPath(collectionSlug: string | undefined, slug: unknown) {
  if (typeof slug !== "string" || !slug) {
    return "/";
  }

  if (collectionSlug === "blog") {
    return `/portal/blog/${slug}`;
  }

  if (collectionSlug === "imprensa") {
    return `/imprensa/${slug}`;
  }

  if (collectionSlug === "vagas") {
    return `/vagas/${slug}`;
  }

  return "/";
}

function getUploadID(value: unknown) {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    return value.id as number | string;
  }

  return undefined;
}

export default buildConfig({
  // Idioma do painel administrativo
  i18n: {
    supportedLanguages: { pt, en, es },
    fallbackLanguage: "pt",
  },

  editor: lexicalEditor(),

  routes: {
    admin: "/payload",
  },

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  email: resendAdapter({
    defaultFromAddress: "payload@amperelinsa.com.br",
    defaultFromName: "CMS - Elinsa",
    apiKey: process.env.RESEND_API_KEY || "",
  }),

  collections: [Users, Imprensa, Blog, Vagas, Galeria],

  plugins: [
    s3Storage({
      enabled: isS3Configured,
      collections: {
        galeria: {
          prefix: s3Prefix,
          ...(s3PublicUrl
            ? {
                disablePayloadAccessControl: true,
                generateFileURL: ({
                  filename,
                  prefix,
                }: {
                  filename: string;
                  prefix?: string;
                }) => {
                  const key = prefix ? `${prefix}/${filename}` : filename;

                  return `${s3PublicUrl.replace(/\/$/, "")}/${key}`;
                },
              }
            : {}),
        },
      },
      bucket: s3Bucket || "elinsa-galeria",
      config: {
        credentials:
          s3AccessKeyId && s3SecretAccessKey
            ? {
                accessKeyId: s3AccessKeyId,
                secretAccessKey: s3SecretAccessKey,
              }
            : undefined,
        endpoint: s3Endpoint,
        forcePathStyle: shouldForceS3PathStyle,
        region: s3Region || (s3Endpoint ? "auto" : "us-east-1"),
      },
    }),
    auditFieldsPlugin({
      createdByLabel: "Criado por",
      excludedCollections: [usersCollectionSlug],
      lastModifiedByLabel: "Última alteração por",
      showInSidebar: true,
    }),
    computeBlurhash({
      collections: [Galeria.slug],
      mimeTypePattern: "image/*",
    }),
    blurDataUrlsPlugin({
      enabled: true,
      collections: [{ slug: Galeria.slug }],
      blurOptions: {
        width: 32,
        height: "auto",
        blur: 18,
      },
    }),
    mediaPreview({
      collections: {
        galeria: {
          contentMode: {
            audio: "inline",
            document: "newTab",
            image: "inline",
            video: "inline",
          },
          mode: "auto",
        },
      },
    }),
    imageSearchPlugin({
      enabled: imageSearchConfigured,
      enablePreview: true,
      providerAccess: ({ req }) => Boolean(req.user),
    }),
    seoPlugin({
      collections: [...publicContentCollections],
      uploadsCollection: Galeria.slug,
      tabbedUI: true,
      generateTitle: ({ doc }) =>
        typeof doc?.title === "string" ? doc.title : "Elinsa do Brasil",
      generateDescription: ({ doc }) =>
        typeof doc?.summary === "string"
          ? doc.summary
          : "Conteúdo publicado pela Elinsa do Brasil.",
      generateImage: ({ doc }) => getUploadID(doc?.coverImage) || "",
      generateURL: ({ collectionConfig, doc }) =>
        `${siteURL}${getDocumentPath(collectionConfig?.slug, doc?.slug)}`,
    }),
    redirectsPlugin({
      collections: [...publicContentCollections],
      redirectTypes: ["301", "302", "307", "308"],
      overrides: {
        admin: {
          group: "Administração",
        },
      },
    }),
    searchPlugin({
      collections: [...publicContentCollections],
      searchOverrides: {
        slug: "cms-search",
        labels: {
          singular: "Resultado de busca do CMS",
          plural: "Resultados de busca do CMS",
        },
        admin: {
          group: "Conteúdo",
        },
      },
    }),
    activityLogPlugin({
      admin: {
        group: "Administração",
      },
      collections: {
        blog: {},
        galeria: {},
        imprensa: {},
        vagas: {},
      },
      enableDraftAutosaveLogging: false,
      globals: {},
    }),
    importExportPlugin({
      batchSize: 50,
      collections: [
        {
          slug: "imprensa",
          import: { defaultVersionStatus: "draft" },
          export: true,
        },
        {
          slug: "blog",
          import: { defaultVersionStatus: "draft" },
          export: true,
        },
        {
          slug: "vagas",
          import: { defaultVersionStatus: "draft" },
          export: true,
        },
        {
          slug: galleryCollectionSlug,
          import: true,
          export: true,
        },
      ],
      defaultVersionStatus: "draft",
    }),
    sentryPlugin({
      enabled: payloadSentryEnabled,
      Sentry,
      options: {
        captureErrors: [400, 403],
        debug: process.env.NODE_ENV !== "production",
      },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: siteURL,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    migrationDir: "./migrations",
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),

  sharp,
});
