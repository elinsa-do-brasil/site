import type { CollectionConfig, FieldHook } from "payload";
import { publicEnv } from "../lib/env.public.ts";
import {
  canWriteCollection,
  deleteAccess,
  draftWriterUpdateAccess,
  publicPublishedReadAccess,
  publisherOrAdmin,
  writeAccess,
} from "../lib/payload/rbac.ts";
import {
  createDraftOnlyWorkflowHook,
  preventAuthorVersionRestore,
} from "../lib/payload/rbac-hooks.ts";
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
    defaultColumns: [
      "title",
      "_status",
      "jobStatus",
      "sector",
      "city",
      "publishedAt",
    ],
    hidden: ({ user }) => !canWriteCollection(user, "vagas"),
    listSearchableFields: ["title", "summary", "sector"],
    components: {
      edit: {
        PublishButton:
          "/components/payload/RolePublishButton#RolePublishButton",
        UnpublishButton:
          "/components/payload/RoleUnpublishButton#RoleUnpublishButton",
      },
    },
    livePreview: {
      url: ({ data }) => {
        const baseUrl = publicEnv.siteUrl || "http://localhost:3000";
        return `${baseUrl}/vagas/${data?.slug}`;
      },
    },
  },
  versions: {
    drafts: true,
  },
  disableBulkEdit: true,
  access: {
    admin: ({ req }) => canWriteCollection(req.user, "vagas"),
    create: writeAccess("vagas"),
    delete: deleteAccess("vagas"),
    read: publicPublishedReadAccess("vagas"),
    readVersions: publisherOrAdmin,
    unlock: writeAccess("vagas"),
    update: draftWriterUpdateAccess("vagas"),
  },
  hooks: {
    beforeOperation: [preventAuthorVersionRestore],
    beforeValidate: [createDraftOnlyWorkflowHook("vagas")],
  },
  timestamps: true,
  trash: true,
  folders: true,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Vaga",
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
              name: "content",
              type: "richText",
              label: "Descrição da vaga",
              required: true,
              editor: createContentEditor(),
            },
          ],
        },
      ],
    },
    // Campos fora das abas continuam disponíveis para o sidebar mesmo com a aba de SEO do plugin.
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
  ],
};
