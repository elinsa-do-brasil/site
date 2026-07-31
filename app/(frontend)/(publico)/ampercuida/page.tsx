import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PsychologicalCareRequestForm } from "@/components/psychological-care/psychological-care-request-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/ui/page-transition";

export const metadata: Metadata = {
  title: "Atendimento psicológico — Solicitação da liderança",
  description:
    "Formulário para a liderança solicitar atendimento psicológico a colaboradores da Elinsa.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function AmperCuidaPage() {
  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-12">
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
              <AlertTitle>Tratamento confidencial</AlertTitle>
              <AlertDescription>
                <p>
                  O formulário pode ser acessado sem login. As informações
                  enviadas não são exibidas publicamente e ficam disponíveis
                  somente para a equipe responsável.
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
