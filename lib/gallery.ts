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

export type GalleryPage = {
  hasNextPage: boolean;
  nextPage: number | null;
  page: number;
  photos: GalleryPhoto[];
  totalDocs: number;
  totalPages: number;
};

export type GallerySitemapData = {
  images: string[];
  updatedAt?: string;
};

export const GALLERY_PAGE_SIZE = 10;

export async function getGalleryPage(page = 1): Promise<GalleryPage> {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "galeria",
    depth: 0,
    limit: GALLERY_PAGE_SIZE,
    overrideAccess: false,
    page,
    pagination: true,
    // Payload derives upload URLs from these metadata fields after querying.
    select: {
      alt: true,
      blurDataUrl: true,
      description: true,
      filename: true,
      height: true,
      mimeType: true,
      prefix: true,
      url: true,
      width: true,
    },
    sort: ["-createdAt", "-id"],
    where: {
      mimeType: {
        contains: "image/",
      },
    },
  });

  const photos = result.docs.flatMap((doc) => {
    const alt = typeof doc.alt === "string" ? doc.alt.trim() : "";
    const description =
      typeof doc.description === "string" ? doc.description.trim() : "";
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

  return {
    hasNextPage: result.hasNextPage,
    nextPage: result.nextPage ?? null,
    page: result.page ?? page,
    photos,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  };
}

export async function getGallerySitemapData(): Promise<GallerySitemapData> {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "galeria",
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      filename: true,
      mimeType: true,
      prefix: true,
      updatedAt: true,
      url: true,
    },
    sort: "-updatedAt",
    where: {
      mimeType: {
        contains: "image/",
      },
    },
  });
  const images = result.docs.flatMap((doc) =>
    doc.url && doc.mimeType?.startsWith("image/") ? [doc.url] : [],
  );
  const updatedAt = result.docs
    .map((doc) => doc.updatedAt)
    .filter((value): value is string => Boolean(value))
    .find((value) => !Number.isNaN(Date.parse(value)));

  return { images, updatedAt };
}
