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
import { Button } from "@/components/ui/button";
import { CardContent, Card as ShadcnCard } from "@/components/ui/card";
import { getDocsUrl } from "@/lib/docs-url";
import { cn } from "@/lib/utils";
import type { ImpactMetric } from "./home-data";
import { HomeSection, HomeSectionIntro } from "./home-section";

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
    <HomeSection
      id="canal-de-cuidado"
      headingId="canal-cuidado-heading"
      tone="muted"
    >
      <HomeSectionIntro
        badge="Cuidado com as pessoas"
        headingId="canal-cuidado-heading"
        icon={HeartHandshake}
        title="Valores só importam quando viram cuidado."
        aside={
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Eles aparecem nas escolhas de todos os dias: no cuidado com quem
            está em campo, no compromisso com milhões de pessoas atendidas e na
            responsabilidade com quem faz a operação acontecer.
          </p>
        }
      />

      <CareEvidenceGrid metrics={careEvidence} />
      <CareChannelCallout />
    </HomeSection>
  );
}

function CareEvidenceGrid({ metrics }: { metrics: CareEvidence[] }) {
  return (
    <div className="mt-10 grid gap-3 lg:grid-cols-3">
      {metrics.map((metric) => (
        <CareEvidenceCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

function CareEvidenceCard({ metric }: { metric: CareEvidence }) {
  return (
    <ShadcnCard
      className={cn(
        "relative min-h-56 overflow-hidden rounded-xl border-border/70 bg-card py-0 shadow-sm transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:bg-card/80 dark:hover:bg-elinsa-primary/10",
        metric.id === "territorio" && "lg:min-h-64",
      )}
    >
      <div className="pointer-events-none absolute right-4 top-4 size-12 rounded-full bg-elinsa-primary/8" />
      <CardContent className="relative z-10 flex h-full flex-col p-5">
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
      </CardContent>
    </ShadcnCard>
  );
}

function CareChannelCallout() {
  return (
    <ShadcnCard className="mt-4 rounded-xl border-border/70 bg-card py-0 shadow-sm">
      <CardContent className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:items-start">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-md bg-elinsa-primary/10 text-elinsa-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-black leading-7 text-foreground md:text-lg">
              Se algo não combina com respeito, segurança ou ética, existe um
              caminho seguro para pedir ajuda.
            </p>
            <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
              O Canal de Denúncias da Elinsa acolhe relatos de colaboradores,
              parceiros e público externo com confidencialidade e
              responsabilidade.
            </p>
          </div>
        </div>

        <CareGuideNavigation />
      </CardContent>
    </ShadcnCard>
  );
}

function CareGuideNavigation() {
  return (
    <nav
      aria-label="Orientações e acesso ao canal de denúncias"
      className="rounded-lg border border-border/70 bg-muted/25 p-3"
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase leading-4 tracking-[0.14em] text-elinsa-primary">
        <BookOpenText aria-hidden="true" className="size-4" />
        Guia de ética
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          size="xl"
          className="w-full justify-between bg-card"
          asChild
        >
          <Link href={getDocsUrl("/etica/o-que-pode-ser-denunciado")}>
            O que denunciar
            <CircleHelp aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="w-full justify-between bg-card"
          asChild
        >
          <Link href={getDocsUrl("/etica/como-denunciar")}>
            Como denunciar
            <ListChecks aria-hidden="true" data-icon="inline-end" />
          </Link>
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
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
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
            <LockKeyhole aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </nav>
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
