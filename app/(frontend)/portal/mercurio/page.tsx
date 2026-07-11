import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { EmailSignatureGenerator } from "./_components/email-signature-generator";

export const metadata: Metadata = {
  title: "Gerador de assinatura de e-mail",
  description:
    "Crie uma assinatura de e-mail no padrão visual da Elinsa do Brasil.",
  alternates: {
    canonical: "/portal/mercurio",
  },
};

export default function EmailSignaturePage() {
  return (
    <PageTransition>
      <div className="bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4">
          <PageHeader
            description="Preencha seus dados e copie a assinatura no padrão visual da Elinsa do Brasil."
            eyebrow="Identidade corporativa"
            navigation={
              <PageHeaderNavigation label="Navegação do gerador de assinatura">
                <Button
                  className="shrink-0"
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <Link href="/portal" transitionTypes={["nav-back"]}>
                    Voltar ao portal
                  </Link>
                </Button>
              </PageHeaderNavigation>
            }
            title="Gerador de assinatura de e-mail"
            variant="feature"
          />

          <section className="pb-8">
            <div className="w-full">
              <EmailSignatureGenerator />
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
