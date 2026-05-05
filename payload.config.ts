import { buildConfig } from 'payload'
import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { pt } from '@payloadcms/translations/languages/pt'
import { en } from '@payloadcms/translations/languages/en'

export default buildConfig({
  // Idioma do painel administrativo
  i18n: {
    supportedLanguages: { pt, en },
    fallbackLanguage: 'pt',
  },

  editor: lexicalEditor(),

  collections: [],

  secret: process.env.PAYLOAD_SECRET || '',

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  sharp,
})