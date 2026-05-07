import { EditorialArticlePage } from "@/components/editorial/editorial-pages";

export const dynamic = "force-dynamic";

export default async function ImprensaPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EditorialArticlePage collection="imprensa" slug={slug} />;
}
