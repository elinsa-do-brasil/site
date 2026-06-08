import { createFromSource } from "fumadocs-core/search/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { internalDocs } from "@/lib/source";

export const revalidate = false;

const { staticGET } = createFromSource(internalDocs, {
  language: "portuguese",
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    return new Response("Não autorizado", { status: 401 });
  }

  return staticGET();
}
