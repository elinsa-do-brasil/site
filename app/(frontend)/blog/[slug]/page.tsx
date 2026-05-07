import { EditorialArticlePage } from "@/components/editorial/editorial-pages";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EditorialArticlePage collection="blog" slug={slug} />;
}
