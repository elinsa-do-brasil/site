import type { CollectionConfig, PayloadRequest } from "payload";
import {
  canWriteCollection,
  deleteAccess,
  publicAssetReadAccess,
  writeAccess,
} from "../lib/payload/rbac.ts";
import { createTrashRestoreGuard } from "../lib/payload/rbac-hooks.ts";

type BeforeChangeHook = NonNullable<
  NonNullable<CollectionConfig["hooks"]>["beforeChange"]
>[number];

/**
 * Payload already applies `uploadEdits` before collection hooks run. Remove
 * them here so the Azure adapter's internal metadata update does not try to
 * retrieve and process the freshly uploaded file a second time.
 */
export function clearProcessedUploadEdits(query: PayloadRequest["query"]) {
  if (query && typeof query === "object" && "uploadEdits" in query) {
    delete query.uploadEdits;
  }
}

const preventUploadEditsReplay: BeforeChangeHook = ({ data, req }) => {
  clearProcessedUploadEdits(req.query);

  return data;
};

/**
 * Shared media library for editorial covers and rich-text uploads.
 *
 * `dbName` and `staticDir` intentionally preserve the original storage layout
 * from when this collection used the `galeria` slug.
 */
export const Media: CollectionConfig = {
  slug: "media",
  dbName: "media",
  labels: {
    singular: "Arquivo de mídia",
    plural: "Biblioteca de mídia",
  },
  admin: {
    group: "Conteúdo",
    useAsTitle: "alt",
    defaultColumns: ["alt", "filename", "mimeType", "updatedAt"],
    hidden: ({ user }) => !canWriteCollection(user, "media"),
  },
  access: {
    admin: ({ req }) => canWriteCollection(req.user, "media"),
    create: writeAccess("media"),
    delete: deleteAccess("media"),
    read: publicAssetReadAccess("media"),
    unlock: writeAccess("media"),
    update: writeAccess("media"),
  },
  hooks: {
    beforeChange: [preventUploadEditsReplay],
    beforeValidate: [createTrashRestoreGuard("media")],
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
