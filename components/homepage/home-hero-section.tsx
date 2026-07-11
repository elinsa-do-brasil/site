import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdaptativeLogo } from "@/components/adaptative-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Eletricista from "@/public/images/eletricistas.webp";
import type { ImpactMetric } from "./home-data";

type HomeHeroSectionProps = {
  impactMetrics: ImpactMetric[];
};

export function HomeHeroSection({ impactMetrics }: HomeHeroSectionProps) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden pb-8 pt-28"
    >
      <HeroBackdrop />

      <div className="relative z-10 mx-auto flex min-h-[34rem] w-full max-w-6xl flex-col justify-end gap-10 px-4 md:min-h-168 lg:gap-12">
        <HeroCopy />

        <HeroMetrics metrics={impactMetrics} />
      </div>
    </section>
  );
}

/** Places the field-operation image behind the hero while preserving text contrast. */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={Eletricista}
        alt="Equipe técnica da Elinsa em operação de infraestrutura elétrica"
        fill
        className="object-cover object-center"
        preload
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.84)_42%,rgba(255,255,255,0.3)_72%,rgba(255,255,255,0.08)_100%)] dark:bg-[linear-gradient(90deg,rgba(8,16,24,0.93)_0%,rgba(8,16,24,0.78)_44%,rgba(8,16,24,0.3)_74%,rgba(8,16,24,0.08)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background" />
    </div>
  );
}

/** Presents the central promise and routes visitors to the two main actions. */
function HeroCopy() {
  return (
    <div className="w-full max-w-72 min-w-0 sm:max-w-3xl">
      <AdaptativeLogo className="mb-8" />
      <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-white/80 px-3 py-2 text-sm font-semibold text-elinsa-dark shadow-sm backdrop-blur dark:bg-background/70 dark:text-elinsa-sky">
        <Building2 aria-hidden="true" className="size-4" />
        Infraestrutura e operação elétrica
      </div>

      <div className="flex flex-col gap-6">
        <h1
          id="home-hero-heading"
          className="max-w-3xl text-2xl font-extrabold leading-[0.98] tracking-normal text-elinsa-dark sm:text-3xl md:text-4xl dark:text-white"
        >
          Construindo um futuro melhor
        </h1>
        <p className="max-w-72 text-base leading-7 text-foreground/78 sm:max-w-3xl md:text-xl md:leading-8">
          Para a Elinsa, esse futuro começa com infraestrutura elétrica segura,
          escala regional e equipes preparadas para planejar, mobilizar e
          executar frentes técnicas no Pará.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          size="xl"
          className="w-full bg-elinsa-primary text-white hover:bg-elinsa-dark sm:w-auto"
          asChild
        >
          <Link href="/quem-somos">
            Conheça a Elinsa
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
        <Button
          size="xl"
          className="w-full border border-border bg-white/85 text-foreground hover:bg-white sm:w-auto dark:bg-background/70 dark:hover:bg-background"
          asChild
        >
          <Link href="/imprensa">Conheça nossa operação</Link>
        </Button>
      </div>
    </div>
  );
}

/** Groups impact indicators as evidence immediately after the hero promise. */
function HeroMetrics({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <div className="mt-8 w-full">
      <ul
        aria-label="Indicadores de impacto da Elinsa"
        className="grid list-none gap-3 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl shadow-elinsa-dark/5 backdrop-blur sm:grid-cols-2 lg:grid-cols-5"
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.id}
            isLinked={index < metrics.length - 1}
            metric={metric}
          />
        ))}
      </ul>
    </div>
  );
}

function MetricCard({
  isLinked,
  metric,
}: {
  isLinked: boolean;
  metric: ImpactMetric;
}) {
  return (
    <li className={cn("min-h-24", metric.featured && "lg:col-span-2")}>
      <Card
        className={cn(
          "relative h-full rounded-xl border-border/60 bg-muted/30 py-0 shadow-none transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:hover:bg-elinsa-primary/10",
          metric.featured &&
            "lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-center lg:gap-4",
        )}
      >
        {isLinked ? (
          <div className="pointer-events-none absolute -right-3 top-12 hidden h-px w-3 bg-elinsa-primary/25 lg:block" />
        ) : null}
        <div className="absolute right-3 top-3 size-10 rounded-full bg-elinsa-primary/8" />
        <CardContent className="relative z-10 p-4">
          <div>
            <span className="block text-[2.25rem] font-black leading-none text-elinsa-primary">
              {metric.value}
            </span>
            <p className="mt-1.5 text-[0.66rem] font-bold uppercase leading-4 tracking-normal text-muted-foreground">
              {metric.label}
            </p>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              {metric.description}
            </span>
          </div>
        </CardContent>

        {metric.highlights ? <MetricHighlights metric={metric} /> : null}
      </Card>
    </li>
  );
}

function MetricHighlights({ metric }: { metric: ImpactMetric }) {
  return (
    <div className="relative z-10 flex flex-col gap-1.5 border-t border-border/70 px-4 pb-4 pt-2 lg:border-l lg:border-t-0 lg:py-4 lg:pl-4">
      {metric.highlights?.map((highlight) => (
        <p
          key={highlight.label}
          className="flex items-baseline gap-1.5 text-[0.72rem] font-bold uppercase leading-4 tracking-normal text-muted-foreground lg:whitespace-nowrap"
        >
          <span>{highlight.prefix}</span>
          <span className="text-xl font-black leading-none text-elinsa-primary">
            {highlight.value}
          </span>
          <span>{highlight.label}</span>
        </p>
      ))}
    </div>
  );
}
