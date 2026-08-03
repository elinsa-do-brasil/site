import { ReportIntroduction } from "@/components/reports/report-introduction";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Canal de denúncias",
  description:
    "Tire dúvidas sobre o Canal de Denúncias da Elinsa, saiba o que pode ser relatado e acesse o formulário com segurança.",
  path: "/denunciar",
});

export default function DenunciarPage() {
  return <ReportIntroduction />;
}
