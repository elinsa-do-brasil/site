import type { Metadata } from "next";
import { EditorialIndex } from "@/components/editorial/editorial-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imprensa | Elinsa",
  description: "Notícias públicas e comunicados institucionais da Elinsa.",
};

export default async function ImprensaPage() {
  return <EditorialIndex collection="imprensa" />;
}
