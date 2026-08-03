import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { VagaPage } from "@/components/vagas/vagas-pages";
import { getRichTextPlainText } from "@/lib/editorial";
import {
  createNoIndexMetadata,
  createPageMetadata,
  createSeoDescription,
  resolveCmsSeoFields,
} from "@/lib/seo";
import { getVagaBySlug } from "@/lib/vagas";

export const dynamic = "force-dynamic";

type VagaPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: VagaPostPageProps): Promise<Metadata> {
  const [{ slug }, { isEnabled: isDraftMode }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const vaga = await getVagaBySlug({ draft: isDraftMode, slug });

  if (!vaga) {
    notFound();
  }

  const fallbackDescription = createSeoDescription(
    [vaga.summary, getRichTextPlainText(vaga.content)],
    "Oportunidade para trabalhar na Elinsa do Brasil no Pará.",
  );
  const seo = resolveCmsSeoFields({
    fallbackDescription,
    fallbackTitle: vaga.title,
    meta: vaga.meta,
  });

  if (isDraftMode || vaga._status === "draft") {
    return createNoIndexMetadata({
      description: seo.description,
      title: seo.title,
    });
  }

  return createPageMetadata({
    description: seo.description,
    image: seo.image,
    modifiedTime: vaga.updatedAt,
    path: `/vagas/${slug}`,
    publishedTime: vaga.publishedAt ?? vaga.createdAt,
    title: seo.title,
  });
}

export default async function VagaPostPage({ params }: VagaPostPageProps) {
  const { slug } = await params;

  return <VagaPage slug={slug} />;
}
