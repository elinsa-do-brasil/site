import type { Metadata } from "next";
import { EditorialIndex } from "@/components/editorial/editorial-pages";
import { getValidEditorialSubject } from "@/lib/editorial";
import { requireInternalAccess } from "@/lib/organization/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Elinsa",
  description:
    "Eventos internos, recrutamento e comunicados para equipes da Elinsa.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string | string[] }>;
}) {
  await requireInternalAccess();
  const { assunto } = await searchParams;

  return (
    <EditorialIndex
      collection="blog"
      subject={getValidEditorialSubject(assunto)}
    />
  );
}
