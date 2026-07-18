import type { Metadata } from "next";
import { ReportIntroduction } from "@/components/reports/report-introduction";

export const metadata: Metadata = {
  title: "Canal de denúncias",
  description:
    "Tire dúvidas sobre o Canal de Denúncias da Elinsa, saiba o que pode ser relatado e acesse o formulário com segurança.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DenunciarPage() {
  return <ReportIntroduction />;
}
