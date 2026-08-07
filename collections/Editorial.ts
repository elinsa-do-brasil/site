import type { CollectionConfig, FieldHook } from "payload";
import {
  defaultEditorialSubject,
  editorialSubjects,
} from "../lib/editorial-subjects.ts";
import { publicEnv } from "../lib/env.public.ts";
import {
  canWriteCollection,
  deleteAccess,
  draftWriterUpdateAccess,
  privateBlogReadAccess,
  publicPublishedReadAccess,
  publisherOrAdmin,
  writeAccess,
} from "../lib/payload/rbac.ts";
import {
  createDraftOnlyWorkflowHook,
  preventAuthorVersionRestore,
} from "../lib/payload/rbac-hooks.ts";
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
    defaultColumns: [
      "title",
      "_status",
      "subject",
      "author",
      "publishedAt",
      "updatedAt",
    ],
    hidden: ({ user }) => !canWriteCollection(user, slug),
    listSearchableFields: ["title", "summary"],
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
        const path =
          slug === "blog"
            ? `/portal/blog/${data?.slug}`
            : `/imprensa/${data?.slug}`;

        return `${baseUrl}${path}`;
      },
    },
  },
  versions: {
    drafts: true,
  },
  disableBulkEdit: true,
  access: {
    admin: ({ req }) => canWriteCollection(req.user, slug),
    create: writeAccess(slug),
    delete: deleteAccess(slug),
    read:
      slug === "blog"
        ? privateBlogReadAccess
        : publicPublishedReadAccess("imprensa"),
    readVersions: publisherOrAdmin,
    unlock: writeAccess(slug),
    update: draftWriterUpdateAccess(slug),
  },
  hooks: {
    beforeOperation: [preventAuthorVersionRestore],
    beforeValidate: [createDraftOnlyWorkflowHook(slug)],
  },
  timestamps: true,
  trash: true,
  folders: true,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: labelSingular,
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
              name: "content",
              type: "richText",
              label: "Conteúdo",
              editor: createContentEditor(),
            },
          ],
        },
      ],
    },
    // Campos fora das abas continuam disponíveis para o sidebar mesmo com a aba de SEO do plugin.
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
      relationTo: "media",
      label: "Imagem de capa",
      filterOptions: {
        mimeType: {
          contains: "image/",
        },
      },
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
