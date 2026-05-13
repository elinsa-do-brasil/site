import { EditorialArticlePage } from "@/components/editorial/editorial-pages";
import { requireInternalAccess } from "@/lib/organization/access";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireInternalAccess();
  const { slug } = await params;

  return <EditorialArticlePage collection="blog" slug={slug} />;
}
