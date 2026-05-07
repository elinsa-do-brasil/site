import type { Metadata } from "next";
import { EditorialIndex } from "@/components/editorial/editorial-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Elinsa",
  description:
    "Eventos internos, recrutamento e comunicados para equipes da Elinsa.",
};

export default async function BlogPage() {
  return <EditorialIndex collection="blog" />;
}
