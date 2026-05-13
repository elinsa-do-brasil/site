import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const slug = searchParams.get("slug");
  const collection = searchParams.get("collection");

  if (!slug) {
    return new Response("Insufficient search params", { status: 404 });
  }

  // Ativa o modo rascunho do Next.js
  const draft = await draftMode();
  draft.enable();

  if (collection === "blog") {
    redirect(`/portal/blog/${slug}`);
  }

  if (collection === "imprensa") {
    redirect(`/${collection}/${slug}`);
  }

  return new Response("Collection not supported", { status: 400 });
}
