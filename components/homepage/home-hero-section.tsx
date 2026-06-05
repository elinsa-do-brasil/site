import { Building01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdaptativeLogo } from "@/components/adaptative-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Eletricista from "@/public/images/eletricistas.webp";
import type { ImpactMetric } from "./home-data";

type HomeHeroSectionProps = {
  impactMetrics: ImpactMetric[];
};

export function HomeHeroSection({ impactMetrics }: HomeHeroSectionProps) {
  return (
    <section className="relative min-h-dvh overflow-hidden px-6 pb-8 pt-28 md:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={Eletricista}
          alt="Equipe técnica da Elinsa em operação de infraestrutura elétrica"
          fill
          className="object-cover object-center"
          preload
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.82)_42%,rgba(255,255,255,0.28)_72%,rgba(255,255,255,0.06)_100%)] dark:bg-[linear-gradient(90deg,rgba(8,16,24,0.92)_0%,rgba(8,16,24,0.76)_44%,rgba(8,16,24,0.28)_74%,rgba(8,16,24,0.08)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-72 flex-col justify-end gap-10 sm:max-w-6xl lg:gap-12">
        <div className="w-full max-w-72 min-w-0 sm:max-w-3xl">
          <AdaptativeLogo className="mb-8" />
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-white/80 px-3 py-2 text-sm font-semibold text-elinsa-dark shadow-sm backdrop-blur dark:bg-background/70 dark:text-elinsa-sky">
            <HugeiconsIcon icon={Building01Icon} className="size-4" />
            Infraestrutura e operação elétrica
          </div>

          <div className="flex flex-col gap-6">
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-normal text-elinsa-dark sm:text-3xl md:text-4xl dark:text-white">
              Construindo um futuro melhor
            </h1>
            <p className="max-w-72 text-base leading-7 text-foreground/78 sm:max-w-3xl md:text-xl md:leading-8">
              Para a Elinsa, futuro melhor é energia chegando com segurança:
              planejamento antes da mobilização, execução técnica em campo e
              cuidado com as comunidades atendidas.
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
                <ArrowRight />
              </Link>
            </Button>
            <Button
              size="xl"
              className="w-full border border-border bg-white/85 text-foreground hover:bg-white sm:w-auto dark:bg-background/70 dark:hover:bg-background"
              asChild
            >
              <Link href="/imprensa">Veja nossa atuação</Link>
            </Button>
          </div>
        </div>

        <HeroMetrics metrics={impactMetrics} />
      </div>
    </section>
  );
}

function HeroMetrics({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <div className="mt-8 w-full rounded-3xl border border-border/70 bg-background/95 p-2 shadow-xl shadow-elinsa-dark/5 backdrop-blur">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric, index) => (
          <article
            key={metric.id}
            className={cn(
              "relative min-h-24 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:hover:bg-elinsa-primary/10",
              metric.featured &&
                "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-center lg:gap-4",
            )}
          >
            {index < metrics.length - 1 ? (
              <div className="pointer-events-none absolute -right-3 top-12 hidden h-px w-3 bg-elinsa-primary/25 lg:block" />
            ) : null}
            <div className="absolute right-3 top-3 size-10 rounded-full bg-elinsa-primary/8" />
            <div className="relative z-10">
              <div>
                <span className="block text-[2.25rem] font-black leading-none text-elinsa-primary">
                  {metric.value}
                </span>
                <p className="mt-1.5 text-[0.66rem] font-bold uppercase leading-4 tracking-normal text-muted-foreground">
                  {metric.label}
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {metric.description}
              </p>
            </div>
            {metric.highlights ? (
              <dl className="relative z-10 mt-3 space-y-1.5 border-t border-border/70 pt-2 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                {metric.highlights.map((highlight) => (
                  <div
                    key={highlight.label}
                    className="flex items-baseline gap-1.5 text-[0.72rem] font-bold uppercase leading-4 tracking-normal text-muted-foreground lg:whitespace-nowrap"
                  >
                    <dt>{highlight.prefix}</dt>
                    <dd className="text-xl font-black leading-none text-elinsa-primary">
                      {highlight.value}
                    </dd>
                    <dt>{highlight.label}</dt>
                  </div>
                ))}
              </dl>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
