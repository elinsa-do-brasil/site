import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { es } from "@payloadcms/translations/languages/es";
import { pt } from "@payloadcms/translations/languages/pt";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Blog, Imprensa } from "./collections/Editorial";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Users } from "./collections/Users";

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

  collections: [Users, Posts, Imprensa, Blog, Media],

  secret: process.env.PAYLOAD_SECRET || "",

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  sharp,
});
