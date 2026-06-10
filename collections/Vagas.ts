import type { CollectionConfig, FieldHook } from "payload";
import { vagaCidadeOptions } from "../lib/vaga-options.ts";
import { createContentEditor } from "./fields/contentEditor.ts";

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

export const Vagas: CollectionConfig = {
  slug: "vagas",
  labels: {
    singular: "Vaga",
    plural: "Vagas",
  },
  admin: {
    useAsTitle: "title",
    group: "Conteúdo",
    defaultColumns: ["title", "jobStatus", "sector", "city", "publishedAt"],
    listSearchableFields: ["title", "summary", "sector"],
    livePreview: {
      url: ({ data }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${baseUrl}/vagas/${data?.slug}`;
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
        description: "Resumo curto para a listagem pública de vagas.",
      },
    },
    {
      name: "jobStatus",
      type: "select",
      label: "Status",
      required: true,
      defaultValue: "aberta",
      options: [
        { label: "Aberta", value: "aberta" },
        { label: "Fechada", value: "fechada" },
      ],
      admin: {
        position: "sidebar",
        description: "A página /vagas exibe apenas vagas abertas.",
      },
    },
    {
      name: "sector",
      type: "text",
      label: "Setor",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "city",
      type: "select",
      label: "Cidade da vaga",
      required: true,
      options: [...vagaCidadeOptions],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Data de publicação",
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
      label: "Descrição da vaga",
      required: true,
      editor: createContentEditor(),
    },
  ],
};
