import {
  ArrowRight,
  BookOpenText,
  CircleHelp,
  HeartHandshake,
  ListChecks,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ImpactMetric } from "./home-data";

type CareChannelSectionProps = {
  impactMetrics: ImpactMetric[];
};

type CareEvidence = {
  id: string;
  value: string;
  unit: string;
  title: string;
  description: string;
  detail?: string;
};

export function CareChannelSection({ impactMetrics }: CareChannelSectionProps) {
  const careEvidence = getCareEvidence(impactMetrics);

  return (
    <section
      id="canal-de-cuidado"
      aria-labelledby="canal-cuidado-heading"
      className="bg-muted/25 px-6 py-16 md:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="max-w-2xl">
            <Badge text="Cuidado com as pessoas" icon={HeartHandshake} />
            <h2
              id="canal-cuidado-heading"
              className="max-w-2xl text-3xl font-extrabold tracking-normal md:text-4xl"
            >
              Valores só importam quando viram cuidado.
            </h2>
          </div>

          <div className="border-t-3 border-elinsa-primary pt-6 md:border-l-3 md:border-t-0 md:py-2 md:pl-10">
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              Eles aparecem nas escolhas de todos os dias: no cuidado com quem
              está em campo, no compromisso com milhões de pessoas atendidas e
              na responsabilidade com quem faz a operação acontecer.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {careEvidence.map((metric) => (
            <CareEvidenceCard key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:items-start">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-md bg-elinsa-primary/10 text-elinsa-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-black leading-7 text-foreground md:text-lg">
                  Se algo não combina com respeito, segurança ou ética, existe
                  um caminho seguro para pedir ajuda.
                </p>
                <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
                  O Canal de Denúncias da Elinsa acolhe relatos de
                  colaboradores, parceiros e público externo com
                  confidencialidade e responsabilidade.
                </p>
              </div>
            </div>

            <nav
              aria-label="Orientações e acesso ao canal de denúncias"
              className="rounded-lg border border-border/70 bg-muted/25 p-3"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase leading-4 tracking-[0.14em] text-elinsa-primary">
                <BookOpenText className="size-4" />
                Guia de ética
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  className="w-full justify-between bg-card"
                  disabled
                >
                  O que denunciar
                  <CircleHelp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  className="w-full justify-between bg-card"
                  disabled
                >
                  Como denunciar
                  <ListChecks />
                </Button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  size="xl"
                  className="w-full justify-between bg-elinsa-primary text-white hover:bg-elinsa-dark"
                  asChild
                >
                  <Link href="/denunciar">
                    Denunciar
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full justify-between bg-card"
                  asChild
                >
                  <Link href="/acompanhar-denuncia">
                    Acompanhar denúncia
                    <LockKeyhole />
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

function CareEvidenceCard({ metric }: { metric: CareEvidence }) {
  return (
    <article
      className={cn(
        "relative min-h-56 overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:bg-card/80 dark:hover:bg-elinsa-primary/10",
        metric.id === "territorio" && "lg:min-h-64",
      )}
    >
      <div className="pointer-events-none absolute right-4 top-4 size-12 rounded-full bg-elinsa-primary/8" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="block text-5xl font-black leading-none text-elinsa-primary md:text-6xl">
            {metric.value}
          </span>
          <p className="max-w-32 pb-1 text-xs font-black uppercase leading-4 tracking-normal text-muted-foreground">
            {metric.unit}
          </p>
        </div>
        <h3 className="mt-5 text-lg font-black leading-6 text-foreground">
          {metric.title}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {metric.description}
        </p>

        {metric.detail ? (
          <p className="mt-auto border-t border-border/70 pt-4 text-sm font-bold leading-6 text-elinsa-dark dark:text-elinsa-sky">
            {metric.detail}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function getCareEvidence(impactMetrics: ImpactMetric[]): CareEvidence[] {
  const metricsById = new Map(
    impactMetrics.map((metric) => [metric.id, metric]),
  );
  const population = metricsById.get("impacto-populacao");
  const employees = metricsById.get("equipes");
  const safety = metricsById.get("seguranca");

  return [
    {
      id: "territorio",
      value: population?.value ?? "",
      unit: "milhões de pessoas",
      title: "Cuidado em escala",
      description:
        "Atender tantas pessoas exige planejamento, padrão técnico e respeito pelo território em cada frente de trabalho.",
      detail: "+ 700 mil lares atendidos",
    },
    {
      id: "seguranca",
      value: safety?.value ?? "",
      unit: safety?.label ?? "dias",
      title: "Sem acidentes e contando.",
      description:
        "Esse número nasce de decisões diárias: avaliar riscos, proteger a equipe e respeitar a vida antes de qualquer resultado.",
      detail: "O nosso maior orgulho.",
    },
    {
      id: "gente",
      value: employees?.value ?? "",
      unit: employees?.label ?? "colaboradores",
      title: "Nossa gente no centro",
      description:
        "Os mesmos valores que orientam a operação também precisam proteger, ouvir e respeitar quem faz tudo acontecer.",
      detail: "Cuidado também é escuta.",
    },
  ];
}

function getMetricHighlight(metric: ImpactMetric | undefined, label: string) {
  const highlight = metric?.highlights?.find(
    (item) => item.label.toLocaleLowerCase("pt-BR") === label,
  );

  return highlight?.value ?? null;
}
