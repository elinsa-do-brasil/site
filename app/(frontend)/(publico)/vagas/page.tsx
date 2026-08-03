import { VagasIndexPage } from "@/components/vagas/vagas-pages";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Vagas no Pará",
  description:
    "Consulte oportunidades abertas para trabalhar na Elinsa do Brasil e contribuir com operações de infraestrutura elétrica no Pará.",
  path: "/vagas",
});

export default function VagasPage() {
  return <VagasIndexPage />;
}
