import { lexicalEditor, UploadFeature } from "@payloadcms/richtext-lexical";
import type { CollectionConfig, FieldHook } from "payload";
import {
  defaultEditorialSubject,
  editorialSubjects,
} from "../lib/editorial-subjects.ts";

const format = (val: string): string =>
  val
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase();

const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === "string" && value.length > 0) {
      return format(value);
    }

    const fallbackData = data?.[fallback] || originalDoc?.[fallback];

    if (fallbackData && typeof fallbackData === "string") {
      return format(fallbackData);
    }

    return value;
  };

const createEditorialCollection = ({
  group,
  labelPlural,
  labelSingular,
  slug,
}: {
  group: string;
  labelPlural: string;
  labelSingular: string;
  slug: "blog" | "imprensa";
}): CollectionConfig => ({
  slug,
  labels: {
    singular: labelSingular,
    plural: labelPlural,
  },
  admin: {
    useAsTitle: "title",
    group,
    defaultColumns: ["title", "subject", "author", "publishedAt", "updatedAt"],
    listSearchableFields: ["title", "summary"],
    livePreview: {
      url: ({ data }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${baseUrl}/${slug}/${data?.slug}`;
      },
    },
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  trash: true,
  folders: true,
  fields: [
    {
      name: "title",
      type: "text",
      label: "Título",
      required: true,
    },
    {
      name: "summary",
      type: "textarea",
      label: "Descrição rápida",
      required: true,
      admin: {
        description:
          "Resumo curto para listagens e para quem não for ler a notícia completa.",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Data",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "dd/MM/yyyy",
        },
      },
    },
    {
      name: "subject",
      type: "select",
      label: "Assunto geral",
      required: true,
      defaultValue: defaultEditorialSubject,
      options: [...editorialSubjects],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      label: "Autor",
      required: true,
      hasMany: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "galeria",
      label: "Imagem de capa",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "slug",
      type: "text",
      label: "Slug (URL)",
      index: true,
      unique: true,
      admin: {
        position: "sidebar",
        description:
          "Gerado automaticamente a partir do título se deixado em branco.",
      },
      hooks: {
        beforeValidate: [formatSlug("title")],
      },
    },
    {
      name: "content",
      type: "richText",
      label: "Conteúdo",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({
            collections: {
              galeria: {
                fields: [
                  {
                    name: "size",
                    type: "select",
                    label: "Tamanho da imagem",
                    defaultValue: "normal",
                    options: [
                      { label: "Pequena", value: "small" },
                      { label: "Normal", value: "normal" },
                      { label: "Grande", value: "large" },
                    ],
                  },
                  {
                    name: "alignment",
                    type: "select",
                    label: "Alinhamento",
                    defaultValue: "center",
                    options: [
                      { label: "Esquerda", value: "left" },
                      { label: "Centro", value: "center" },
                      { label: "Direita", value: "right" },
                    ],
                  },
                  {
                    name: "caption",
                    type: "text",
                    label: "Legenda",
                  },
                ],
              },
            },
          }),
        ],
      }),
    },
  ],
});

export const Imprensa: CollectionConfig = createEditorialCollection({
  slug: "imprensa",
  labelSingular: "Notícia pública",
  labelPlural: "Imprensa",
  group: "Conteúdo",
});

export const Blog: CollectionConfig = createEditorialCollection({
  slug: "blog",
  labelSingular: "Notícia interna",
  labelPlural: "Blog",
  group: "Conteúdo",
});
