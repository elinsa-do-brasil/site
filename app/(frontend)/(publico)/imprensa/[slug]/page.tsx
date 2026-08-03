import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { EditorialArticlePage } from "@/components/editorial/editorial-pages";
import {
  getAuthorName,
  getEditorialCoverImage,
  getEditorialPost,
  getRichTextPlainText,
} from "@/lib/editorial";
import {
  createNoIndexMetadata,
  createPageMetadata,
  createSeoDescription,
  resolveCmsSeoFields,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type ImprensaPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ImprensaPostPageProps): Promise<Metadata> {
  const [{ slug }, { isEnabled: isDraftMode }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const post = await getEditorialPost({
    collection: "imprensa",
    draft: isDraftMode,
    slug,
  });

  if (!post) {
    notFound();
  }

  const fallbackDescription = createSeoDescription(
    [post.summary, getRichTextPlainText(post.content)],
    "Notícia institucional da Elinsa do Brasil.",
  );
  const seo = resolveCmsSeoFields({
    fallbackDescription,
    fallbackImage: getEditorialCoverImage(post, "hero"),
    fallbackTitle: post.title,
    meta: post.meta,
  });

  if (isDraftMode || post._status === "draft") {
    return createNoIndexMetadata({
      description: seo.description,
      title: seo.title,
    });
  }

  return createPageMetadata({
    authors: [getAuthorName(post.author)],
    description: seo.description,
    image: seo.image,
    modifiedTime: post.updatedAt,
    path: `/imprensa/${slug}`,
    publishedTime: post.publishedAt ?? post.createdAt,
    title: seo.title,
    type: "article",
  });
}

export default async function ImprensaPostPage({
  params,
}: ImprensaPostPageProps) {
  const { slug } = await params;

  return <EditorialArticlePage collection="imprensa" slug={slug} />;
}
