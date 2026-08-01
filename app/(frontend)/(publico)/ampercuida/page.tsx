import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { PsychologicalCareRequestForm } from "@/components/psychological-care/psychological-care-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solicitação de atendimento psicológico",
  description:
    "Formulário público para solicitar apoio psicológico a colaboradores da Elinsa.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function AmperCuidaPage() {
  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-3 border-l-2 border-elinsa-primary pl-4 sm:pl-5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Solicitação de atendimento psicológico
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                Qualquer pessoa pode preencher este formulário. Informe os dados
                do colaborador que precisa de apoio psicológico.
              </p>
            </header>

            <div className="lg:hidden">
              <PsychologicalCareChannelNotice />
            </div>

            <PsychologicalCareRequestForm />
          </div>

          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <PsychologicalCareChannelNotice />
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}

function PsychologicalCareChannelNotice() {
  return (
    <Card
      className="rounded-md border-elinsa-sky/20 bg-elinsa-light/30 dark:border-elinsa-sky/20 dark:bg-elinsa-dark/20"
      size="sm"
    >
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-elinsa-sky/10 text-elinsa-sky">
              <HugeiconsIcon
                aria-hidden="true"
                className="size-5"
                icon={ShieldKeyIcon}
                strokeWidth={2}
              />
            </span>
            Sobre este canal
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="flex flex-col gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <HugeiconsIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-elinsa-sky"
              icon={CheckmarkCircle02Icon}
              strokeWidth={2}
            />
            <span>
              Os dados são criptografados, não são exibidos publicamente e ficam
              disponíveis somente para a equipe responsável.
            </span>
          </li>
          <li className="flex gap-2">
            <HugeiconsIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
              icon={InformationCircleIcon}
              strokeWidth={2}
            />
            <span>
              Este formulário não oferece atendimento imediato. Em caso de
              urgência, procure o serviço de emergência da sua região.
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
