import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { en } from "@payloadcms/translations/languages/en";
import { es } from "@payloadcms/translations/languages/es";
import { pt } from "@payloadcms/translations/languages/pt";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Blog, Imprensa } from "./collections/Editorial.ts";
import { Galeria } from "./collections/Galeria.ts";
import { Users } from "./collections/Users.ts";

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

export default buildConfig({
  // Idioma do painel administrativo
  i18n: {
    supportedLanguages: { pt, en, es },
    fallbackLanguage: "pt",
  },

  editor: lexicalEditor(),

  admin: {
    user: Users.slug,
  },

  collections: [Users, Imprensa, Blog, Galeria],

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
  ],

  secret: process.env.PAYLOAD_SECRET || "",

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),

  sharp,
});
