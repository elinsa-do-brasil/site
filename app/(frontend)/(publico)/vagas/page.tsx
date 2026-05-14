import type { Metadata } from "next";
import { VagasIndexPage } from "@/components/vagas/vagas-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vagas | Elinsa",
  description: "Oportunidades abertas para trabalhar com a Elinsa do Brasil.",
};

export default function VagasPage() {
  return <VagasIndexPage />;
}
