import type { Metadata } from "next";
import { EditorialIndex } from "@/components/editorial/editorial-pages";
import { getValidEditorialSubject } from "@/lib/editorial";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imprensa | Elinsa",
  description: "Notícias públicas e comunicados institucionais da Elinsa.",
};

export default async function ImprensaPage({
  searchParams,
}: {
  searchParams: Promise<{ assunto?: string | string[] }>;
}) {
  const { assunto } = await searchParams;

  return (
    <EditorialIndex
      collection="imprensa"
      subject={getValidEditorialSubject(assunto)}
    />
  );
}
