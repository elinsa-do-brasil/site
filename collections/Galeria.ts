import type { CollectionConfig } from "payload";

export const Galeria: CollectionConfig = {
  slug: "galeria",
  dbName: "media",
  labels: {
    singular: "Mídia da galeria",
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
    // Os plugins de blur ignoram MIME não-imagem, então vídeos podem viver na mesma coleção.
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/ogg",
    ],
    formatOptions: {
      format: "webp",
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
      label: "Texto alternativo ou título",
      required: true,
      admin: {
        description:
          "Para imagens, descreva o conteúdo. Para vídeos, use um título curto.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Legenda",
    },
    {
      name: "captionsUrl",
      type: "text",
      label: "URL da legenda VTT",
      admin: {
        description:
          "Opcional para vídeos. Use um arquivo .vtt público para habilitar legendas no player.",
      },
    },
  ],
};
