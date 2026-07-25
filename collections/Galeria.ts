import type { CollectionConfig } from "payload";
import {
  canWriteCollection,
  deleteAccess,
  publicAssetReadAccess,
  writeAccess,
} from "../lib/payload/rbac.ts";
import { createTrashRestoreGuard } from "../lib/payload/rbac-hooks.ts";

export const Galeria: CollectionConfig = {
  slug: "galeria",
  labels: {
    singular: "Foto da galeria",
    plural: "Galeria pública",
  },
  admin: {
    group: "Conteúdo",
    useAsTitle: "alt",
    defaultColumns: ["alt", "description", "filename", "updatedAt"],
    hidden: ({ user }) => !canWriteCollection(user, "galeria"),
  },
  access: {
    admin: ({ req }) => canWriteCollection(req.user, "galeria"),
    create: writeAccess("galeria"),
    delete: deleteAccess("galeria"),
    read: publicAssetReadAccess("galeria"),
    unlock: writeAccess("galeria"),
    update: writeAccess("galeria"),
  },
  hooks: {
    beforeValidate: [createTrashRestoreGuard("galeria")],
  },
  upload: {
    staticDir: "galeria-publica",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    // Não gere derivados nem reprocesse o arquivo enviado: imagens ficam
    // armazenadas somente em seu tamanho e formato originais.
    crop: false,
    focalPoint: false,
  },
  folders: true,
  trash: true,
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texto alternativo",
      required: true,
      validate: (value: unknown) =>
        (typeof value === "string" && value.trim().length > 0) ||
        "Informe um texto alternativo que descreva a foto.",
      admin: {
        description:
          "Texto curto que substitui a imagem para quem não consegue vê-la. Descreva o conteúdo sem começar com “imagem de”.",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Descrição do que acontece",
      required: true,
      validate: (value: unknown) =>
        (typeof value === "string" && value.trim().length > 0) ||
        "Descreva o que acontece na foto.",
      admin: {
        description:
          "Conte em uma ou duas frases o que acontece, quem aparece e o contexto da cena. Este texto será exibido ao abrir a foto na galeria.",
      },
    },
  ],
};
