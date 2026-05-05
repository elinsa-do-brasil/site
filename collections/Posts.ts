import { CollectionConfig, FieldHook } from 'payload'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'

// Função para formatar strings para slug (ex: "Meu Post" -> "meu-post")
const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

// Hook para gerar o slug automaticamente a partir do título
const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string' && value.length > 0) {
      return format(value)
    }
    const fallbackData = data?.[fallback] || originalDoc?.[fallback]
    if (fallbackData && typeof fallbackData === 'string') {
      return format(fallbackData)
    }
    return value
  }

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        return `${baseUrl}/api/preview?slug=${data?.slug}&collection=posts`
      },
    },
  },
  versions: {
    drafts: true,
  },
  trash: true,
  folders: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Gerado automaticamente a partir do título se deixado em branco.',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de Capa',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Conteúdo',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'tamanho',
                    type: 'select',
                    label: 'Tamanho da Imagem',
                    defaultValue: 'normal',
                    options: [
                      { label: 'Pequena', value: 'small' },
                      { label: 'Normal (100%)', value: 'normal' },
                      { label: 'Grande', value: 'large' },
                    ],
                  },
                  {
                    name: 'alinhamento',
                    type: 'select',
                    label: 'Alinhamento',
                    defaultValue: 'center',
                    options: [
                      { label: 'Esquerda', value: 'left' },
                      { label: 'Centro', value: 'center' },
                      { label: 'Direita', value: 'right' },
                    ],
                  },
                  {
                    name: 'legenda',
                    type: 'text',
                    label: 'Legenda da Imagem',
                  },
                ],
              },
            },
          }),
        ],
      }),
    },
  ],
}
