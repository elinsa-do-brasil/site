import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { auth } from "@/lib/auth";
import { getInternalAccessContext } from "@/lib/organization/access";
import { EmailSignatureGenerator } from "./_components/email-signature-generator";
import { SocialLinksPreview } from "./_components/social-links-preview";
import { normalizeSignatureName } from "./signature-name";

export const metadata: Metadata = {
  title: "Gerador de assinatura de e-mail",
  description:
    "Crie uma assinatura de e-mail no padrão visual da Elinsa do Brasil.",
  alternates: {
    canonical: "/portal/mercurio",
  },
};

export default async function EmailSignaturePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    redirect("/entrar?redirectTo=/portal/mercurio");
  }

  const accessContext = await getInternalAccessContext(session.user.id);

  if (!accessContext) {
    redirect("/entrar?redirectTo=/portal/mercurio");
  }

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
              <EmailSignatureGenerator
                initialValues={{
                  email: getEmailUsername(session.user.email),
                  nome: normalizeSignatureName(session.user.name),
                }}
                socialLinks={<SocialLinksPreview />}
              />
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

function getEmailUsername(email: string) {
  return (email.trim().split("@", 1)[0] ?? "").toLocaleLowerCase("en-US");
}
