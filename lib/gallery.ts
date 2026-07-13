import "server-only";

import configPromise from "@payload-config";
import { getPayload } from "payload";

export type GalleryPhoto = {
  alt: string;
  blurDataUrl?: string;
  description: string;
  height: number;
  id: number | string;
  url: string;
  width: number;
};

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "galeria",
    depth: 0,
    overrideAccess: false,
    pagination: false,
    sort: "-createdAt",
    where: {
      mimeType: {
        contains: "image/",
      },
    },
  });

  return docs.flatMap((doc) => {
    const alt = typeof doc.alt === "string" ? doc.alt.trim() : "";
    const description = doc.description.trim();
    const height = doc.height;
    const url = doc.url;
    const width = doc.width;

    if (
      !alt ||
      !description ||
      !url ||
      !width ||
      width <= 0 ||
      !height ||
      height <= 0 ||
      !doc.mimeType?.startsWith("image/")
    ) {
      return [];
    }

    return [
      {
        alt,
        blurDataUrl: doc.blurDataUrl || undefined,
        description,
        height,
        id: doc.id,
        url,
        width,
      },
    ];
  });
}
