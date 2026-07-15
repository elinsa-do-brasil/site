import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getGalleryPage } from "@/lib/gallery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const galleryPageSchema = z.coerce.number().int().min(1).max(10_000);

export async function GET(request: NextRequest) {
  const page = galleryPageSchema.safeParse(
    request.nextUrl.searchParams.get("page") ?? "1",
  );

  if (!page.success) {
    return NextResponse.json(
      { error: "A página solicitada é inválida." },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const galleryPage = await getGalleryPage(page.data);

  return NextResponse.json(galleryPage, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
