import { EditorialIndex } from "@/components/editorial/editorial-pages";
import { getValidEditorialSubject } from "@/lib/editorial";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Imprensa",
  description:
    "Acompanhe notícias, comunicados institucionais e atualizações públicas da Elinsa do Brasil no Pará.",
  path: "/imprensa",
});

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
