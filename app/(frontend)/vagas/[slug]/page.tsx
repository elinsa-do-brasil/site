import { VagaPage } from "@/components/vagas/vagas-pages";

export const dynamic = "force-dynamic";

export default async function VagaPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <VagaPage slug={slug} />;
}
