import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WorldMap from "@/components/ui/world-map";
import { cn } from "@/lib/utils";
import {
  type AboutStat,
  aboutIcons,
  aboutStats,
  worldConnections,
} from "./about-data";

/** Opens the about page with the company origin, Brazil presence and proof points. */
export function AboutHeroSection() {
  return (
    <section
      aria-labelledby="quem-somos-heading"
      className="relative isolate overflow-hidden border-b border-border bg-background pb-10 pt-28 md:pb-14 md:pt-32"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_42%,transparent_82%)]" />
      <div className="absolute right-[-30rem] top-24 -z-20 w-[72rem] sm:right-[-26rem] md:right-[-22rem] lg:right-[-14rem] xl:right-[-9rem]">
        <WorldMap
          dots={worldConnections}
          lineColor="#24a3dd"
          className="opacity-[0.72]"
        />
      </div>

      <div className="mx-auto flex min-h-[38rem] w-full max-w-6xl flex-col justify-end gap-12 px-4 md:min-h-[42rem] md:justify-center">
        <div className="max-w-2xl">
          <SectionEyebrow
            className="mb-5"
            text="Espanha e Brasil conectados pela engenharia elétrica"
            icon={aboutIcons.globe}
            variant="line"
          />
          <h1
            id="quem-somos-heading"
            className="text-4xl font-black leading-none tracking-normal text-elinsa-dark sm:text-5xl md:text-6xl dark:text-white"
          >
            Quem somos
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/80 md:text-lg md:leading-8">
            A Elinsa do Brasil une origem industrial espanhola e atuação
            operacional brasileira para entregar instalações elétricas,
            automação, manutenção e suporte técnico em infraestrutura de
            energia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              size="xl"
              className="bg-elinsa-primary text-white hover:bg-elinsa-dark"
              asChild
            >
              <a href="#trajetoria">
                Ver trajetória
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="bg-background/80 backdrop-blur"
              asChild
            >
              <Link href="/imprensa">Notícias</Link>
            </Button>
          </div>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}

function HeroStats() {
  return (
    <div className="mt-2 w-full">
      <ul
        aria-label="Marcos institucionais da Elinsa"
        className="grid list-none gap-3 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl shadow-elinsa-dark/5 backdrop-blur sm:grid-cols-2 lg:grid-cols-4"
      >
        {aboutStats.map((stat, index) => (
          <HeroStatCard
            key={stat.label}
            isLinked={index < aboutStats.length - 1}
            stat={stat}
          />
        ))}
      </ul>
    </div>
  );
}

function HeroStatCard({
  isLinked,
  stat,
}: {
  isLinked: boolean;
  stat: AboutStat;
}) {
  return (
    <li className="min-h-24">
      <Card className="relative h-full rounded-xl border-border/60 bg-muted/30 py-0 shadow-none transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:hover:bg-elinsa-primary/10">
        {isLinked ? (
          <div className="pointer-events-none absolute -right-3 top-12 hidden h-px w-3 bg-elinsa-primary/25 lg:block" />
        ) : null}
        <div className="absolute right-3 top-3 size-10 rounded-full bg-elinsa-primary/8" />
        <CardContent className="relative z-10 p-4">
          <span
            className={cn(
              "block font-black leading-none text-elinsa-primary",
              stat.value.length > 7 ? "text-[2rem]" : "text-[2.25rem]",
            )}
          >
            {stat.value}
          </span>
          <p className="mt-1.5 text-[0.66rem] font-bold uppercase leading-4 tracking-normal text-muted-foreground">
            {stat.label}
          </p>
          <span className="mt-2 block text-xs leading-5 text-muted-foreground">
            {stat.description}
          </span>
        </CardContent>
      </Card>
    </li>
  );
}
