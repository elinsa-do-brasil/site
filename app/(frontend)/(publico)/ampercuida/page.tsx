import {
  Alert02Icon,
  Call02Icon,
  CheckmarkCircle02Icon,
  Message01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { PsychologicalCareRequestForm } from "@/components/psychological-care/psychological-care-request-form";
import { Button } from "@/components/ui/button";
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
              <PsychologicalCareSidebar />
            </div>

            <PsychologicalCareRequestForm />
          </div>

          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <PsychologicalCareSidebar />
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}

function PsychologicalCareSidebar() {
  return (
    <div className="grid gap-4">
      <PsychologicalCareImmediateHelp />
      <PsychologicalCareChannelNotice />
    </div>
  );
}

function PsychologicalCareImmediateHelp() {
  return (
    <Card
      className="rounded-md border-amber-300/70 bg-amber-50/80 text-amber-950 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100"
      size="sm"
    >
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-amber-200/60 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              <HugeiconsIcon
                aria-hidden="true"
                className="size-5"
                icon={Alert02Icon}
                strokeWidth={2}
              />
            </span>
            Precisa de ajuda imediata?
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3">
        <p className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/80">
          O Centro de Valorização da Vida (CVV) oferece apoio emocional gratuito
          e confidencial por telefone, no 188, ou via internet no site cvv.org.br.
        </p>

        <div className="grid gap-2">
          <Button
            className="w-full bg-amber-700 text-white hover:bg-amber-800 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300"
            asChild
          >
            <a aria-label="Ligar para o CVV no número 188" href="tel:188">
              <HugeiconsIcon
                aria-hidden="true"
                data-icon="inline-start"
                icon={Call02Icon}
                strokeWidth={2}
              />
              Ligar para 188
            </a>
          </Button>

          <Button
            className="w-full border-amber-400/70 bg-transparent text-amber-950 hover:bg-amber-100 hover:text-amber-950 dark:border-amber-700 dark:bg-transparent dark:text-amber-100 dark:hover:bg-amber-900/50 dark:hover:text-amber-100"
            variant="outline"
            asChild
          >
            <a
              href="https://cvv.org.br/chat/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <HugeiconsIcon
                aria-hidden="true"
                data-icon="inline-start"
                icon={Message01Icon}
                strokeWidth={2}
              />
              Acessar o chat do CVV
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
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
        </ul>
      </CardContent>
    </Card>
  );
}
