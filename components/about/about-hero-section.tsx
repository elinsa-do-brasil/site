import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorldMap from "@/components/ui/world-map";
import { aboutIcons, aboutStats, worldConnections } from "./about-data";

/** Opens the about page with the company origin, Brazil presence and proof points. */
export function AboutHeroSection() {
  return (
    <section
      aria-labelledby="quem-somos-heading"
      className="relative isolate overflow-hidden border-b border-border bg-background px-6 pb-10 pt-28 md:px-8 md:pb-14 md:pt-32"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_42%,transparent_82%)]" />
      <div className="absolute right-[-28rem] top-24 -z-20 w-[72rem] sm:right-[-24rem] md:right-[-18rem] lg:right-[-10rem] xl:right-[-5rem]">
        <WorldMap
          dots={worldConnections}
          lineColor="#24a3dd"
          className="opacity-[0.65]"
        />
      </div>

      <div className="mx-auto flex min-h-[38rem] w-full max-w-6xl flex-col justify-end gap-10 md:min-h-[42rem] md:justify-center">
        <div className="max-w-3xl">
          <Badge
            text="Espanha e Brasil conectados pela engenharia elétrica"
            icon={aboutIcons.globe}
          />
          <h1
            id="quem-somos-heading"
            className="text-4xl font-black leading-[0.98] tracking-normal text-elinsa-dark sm:text-5xl md:text-7xl dark:text-white"
          >
            Quem somos
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/80 md:text-xl md:leading-8">
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
    <ul className="grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {aboutStats.map((stat) => (
        <li key={stat.label}>
          <Card className="h-full gap-0 rounded-xl border-border/80 bg-background/80 py-0 text-foreground shadow-sm ring-0 backdrop-blur">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-3xl font-black leading-none text-elinsa-primary">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <p className="text-sm font-bold uppercase tracking-normal">
                {stat.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
