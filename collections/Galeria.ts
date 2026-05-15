import type { CollectionConfig } from "payload";

export const Galeria: CollectionConfig = {
  slug: "galeria",
  dbName: "media",
  labels: {
    singular: "Imagem da galeria",
    plural: "Galeria",
  },
  admin: {
    group: "Conteúdo",
    useAsTitle: "alt",
    defaultColumns: ["alt", "filename", "mimeType", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "galeria",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: undefined,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: undefined,
        position: "centre",
      },
      {
        name: "hero",
        width: 1440,
        height: undefined,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    formatOptions: {
      format: 'webp',
      options: {
        quality: 100,
        effort: 4,
      },
    },
    crop: true,
    focalPoint: true,
  },
  folders: true,
  trash: true,
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Texto alternativo",
      required: true,
    },
    {
      name: "caption",
      type: "text",
      label: "Legenda",
    },
  ],
};
