import { ArrowLeft01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { PsychologicalCareRequestForm } from "@/components/psychological-care/psychological-care-request-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { requirePsychologicalCareSubmissionAccess } from "@/lib/psychological-care/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atendimento psicológico — Solicitação da liderança",
  description:
    "Formulário interno para a liderança solicitar atendimento psicológico a colaboradores da Elinsa.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function PsychologicalCareRequestPage() {
  await requirePsychologicalCareSubmissionAccess();

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          description={
            <>
              <span>
                O atendimento psicológico oferecido pela empresa tem como
                objetivo promover acolhimento, escuta qualificada e orientação
                breve aos colaboradores.
              </span>
              <span className="mt-2 block">
                A solicitação deve ser realizada quando a liderança identificar
                que um colaborador pode necessitar de suporte.
              </span>
            </>
          }
          eyebrow="Saúde & acolhimento"
          navigation={
            <PageHeaderNavigation label="Navegação da solicitação de atendimento psicológico">
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link href="/portal" transitionTypes={["nav-back"]}>
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={ArrowLeft01Icon}
                    strokeWidth={2}
                  />
                  Voltar ao portal
                </Link>
              </Button>
            </PageHeaderNavigation>
          }
          title="Atendimento psicológico — Solicitação da liderança"
          variant="feature"
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
          <section aria-label="Formulário de solicitação de atendimento psicológico">
            <PsychologicalCareRequestForm />
          </section>

          <aside className="lg:sticky lg:top-28">
            <Alert className="p-4" role="note">
              <HugeiconsIcon
                aria-hidden="true"
                icon={SecurityCheckIcon}
                strokeWidth={2}
              />
              <AlertTitle>Acesso restrito</AlertTitle>
              <AlertDescription>
                <p>
                  As informações enviadas não são exibidas publicamente e ficam
                  disponíveis somente para a equipe responsável.
                </p>
                <p>
                  Informe apenas os dados necessários para o acolhimento do
                  colaborador.
                </p>
              </AlertDescription>
            </Alert>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
