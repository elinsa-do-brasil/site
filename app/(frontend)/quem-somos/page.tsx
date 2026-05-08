import {
  ArrowRight,
  Building2,
  CalendarDays,
  Earth,
  Factory,
  Globe2,
  type LucideIcon,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import WorldMap from "@/components/ui/world-map";

export const metadata: Metadata = {
  title: "Quem somos - Elinsa",
  description:
    "Conheça a trajetória internacional, as bases técnicas e os valores da Elinsa do Brasil.",
};

type Stat = {
  value: string;
  label: string;
  description: string;
};

type Pillar = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Milestone = {
  year: string;
  title: string;
  description: string;
};

const stats: Stat[] = [
  {
    value: "1968",
    label: "origem",
    description: "fundação da ELINSA em A Coruña",
  },
  {
    value: "12.000 m²",
    label: "estrutura",
    description: "entre escritórios, fábricas e armazéns",
  },
  {
    value: "2012",
    label: "Brasil",
    description: "criação da Elinsa do Brasil Ltda.",
  },
  {
    value: "2020",
    label: "grupo",
    description: "entrada no Grupo Amper",
  },
];

const pillars: Pillar[] = [
  {
    title: "Engenharia aplicada",
    description:
      "Projetos, fabricação de quadros elétricos, automação e eletrônica de potência com padrão industrial.",
    icon: Factory,
  },
  {
    title: "Operação em campo",
    description:
      "Equipes técnicas mobilizadas para obras, manutenção e suporte operacional em ambientes exigentes.",
    icon: Route,
  },
  {
    title: "Segurança e método",
    description:
      "Rotina orientada por planejamento, qualidade, rastreabilidade e cuidado permanente com pessoas.",
    icon: ShieldCheck,
  },
  {
    title: "Capacidade humana",
    description:
      "Um time multidisciplinar que combina experiência, treinamento e presença próxima das frentes atendidas.",
    icon: Users,
  },
];

const milestones: Milestone[] = [
  {
    year: "1968",
    title: "Fundação em A Coruña",
    description:
      "A Electrotécnica Industrial y Naval nasce com vocação técnica para instalações elétricas industriais e navais.",
  },
  {
    year: "1973",
    title: "Expansão industrial",
    description:
      "A fábrica e os escritórios passam a operar no polígono de A Grela, em A Coruña, fortalecendo a produção própria.",
  },
  {
    year: "2003",
    title: "Manutenção estruturada",
    description:
      "A criação do departamento de manutenção amplia a atuação recorrente em ativos críticos.",
  },
  {
    year: "2010",
    title: "I+D+i",
    description:
      "A área de investigação, desenvolvimento e inovação reforça a cultura de melhoria técnica contínua.",
  },
  {
    year: "2012",
    title: "Elinsa do Brasil",
    description:
      "A filial brasileira é criada em Macapá e abre uma nova frente de atuação no mercado elétrico nacional.",
  },
  {
    year: "2020",
    title: "Grupo Amper",
    description:
      "A ELINSA passa a integrar o Grupo Amper, ampliando sinergias e capacidade de execução internacional.",
  },
];

const worldConnections = [
  {
    start: { lat: 40.416775, lng: -3.70379, label: "Madrid" },
    end: { lat: -2.9916131, lng: -47.3835003, label: "Macapá" },
  },
];

const highlightedCountries = [
  {
    lat: 40.4168,
    lng: -3.7038,
    label: "Espanha",
    detail: "origem técnica",
    radius: 4,
    labelPosition: "top" as const,
  },
  {
    lat: -10.3333,
    lng: -53.2,
    label: "Brasil",
    detail: "operação nacional",
    radius: 8,
    labelPosition: "bottom" as const,
  },
];

export default function QuemSomos() {
  return (
    <div className="bg-background text-foreground">
      <section className="relative isolate min-h-[calc(100dvh-2rem)] overflow-hidden border-b border-border bg-background px-6 pb-10 pt-28 md:px-8 md:pb-14 md:pt-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_42%,transparent_82%)]" />
        <div className="absolute right-[-28rem] top-28 -z-20 w-[72rem] sm:right-[-24rem] md:right-[-18rem] md:top-24 lg:right-[-10rem] xl:right-[-5rem]">
          <WorldMap
            dots={worldConnections}
            lineColor="#24a3dd"
            className="opacity-[0.65]"
          />
        </div>

        <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-6xl flex-col justify-end md:justify-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-background/80 px-3 py-2 text-sm font-semibold text-elinsa-dark shadow-sm backdrop-blur dark:text-elinsa-sky">
              <Globe2 className="size-4" />
              Espanha e Brasil conectados pela engenharia elétrica
            </div>
            <h1 className="text-4xl font-black leading-[0.98] tracking-normal text-elinsa-dark sm:text-5xl md:text-7xl dark:text-white">
              Quem somos
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/80 md:text-xl md:leading-8">
              Somos a presença brasileira de uma empresa com origem industrial
              espanhola, especializada em instalações elétricas, automação,
              manutenção e soluções para infraestrutura de energia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#trajetoria"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-elinsa-primary px-5 text-sm font-bold text-white transition-colors hover:bg-elinsa-dark"
              >
                Ver trajetória
                <ArrowRight className="size-4" />
              </a>
              <Link
                href="/imprensa"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background/80 px-5 text-sm font-bold text-foreground backdrop-blur transition-colors hover:border-elinsa-primary hover:text-elinsa-primary"
              >
                Notícias
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="gap-0 border border-border/80 bg-background/80 p-4 text-foreground shadow-sm ring-0 backdrop-blur"
              >
                <p className="text-3xl font-black leading-none text-elinsa-primary">
                  {stat.value}
                </p>
                <h2 className="mt-3 text-sm font-bold uppercase tracking-normal">
                  {stat.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {stat.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
              <Earth className="size-4" />
              Presença internacional
            </div>
            <h2 className="text-2xl font-black tracking-normal md:text-3xl">
              Da Galícia à Amazônia, com padrão técnico comum
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              A matriz espanhola concentra engenharia, fabricação e experiência
              industrial acumulada. No Brasil, essa base se transforma em
              operação, manutenção e execução técnica para frentes de energia.
            </p>
          </div>

          <Card className="gap-0 border border-border bg-card p-4 text-foreground shadow-sm ring-0">
            <WorldMap
              fadeEdges={false}
              highlights={highlightedCountries}
              lineColor="#24a3dd"
            />
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-muted/35 px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-primary">
              <Building2 className="size-4 text-elinsa-primary" />O que nos move
            </div>
            <h2 className="text-2xl font-black tracking-normal md:text-3xl">
              Técnica, pessoas e previsibilidade operacional
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              A Elinsa se consolidou em setores exigentes como energia, naval,
              indústria e serviços por combinar fabricação própria, engenharia
              aplicada e execução próxima do cliente.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Card
                key={pillar.title}
                className="gap-0 border border-border bg-background p-6 text-foreground shadow-sm ring-0 transition-colors hover:border-elinsa-primary/50"
              >
                <div className="mb-6 flex size-11 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark">
                  <pillar.icon className="size-5" />
                </div>
                <h3 className="text-xl font-bold tracking-normal">
                  {pillar.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {pillar.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="trajetoria" className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
                <CalendarDays className="size-4" />
                Trajetória
              </div>
              <h2 className="text-2xl font-black tracking-normal md:text-3xl">
                Crescimento construído etapa por etapa
              </h2>
            </div>
            <p className="text-lg leading-8 text-muted-foreground">
              A história da ELINSA é marcada por expansão industrial,
              especialização técnica e presença internacional, sem perder o foco
              em qualidade e seriedade.
            </p>
          </div>

          <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone) => (
              <Card
                key={`${milestone.year}-${milestone.title}`}
                className="gap-0 border border-border bg-card p-6 text-foreground shadow-sm ring-0"
              >
                <p className="text-sm font-black text-elinsa-primary">
                  {milestone.year}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-normal">
                  {milestone.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {milestone.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-elinsa-dark px-6 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-normal md:text-4xl">
              Engenharia elétrica para operações que não podem parar
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/78">
              A Elinsa do Brasil atua com foco empresarial em infraestrutura,
              obras, manutenção e suporte técnico para frentes de energia.
            </p>
          </div>
          <a
            href="mailto:comercial@elinsa.com.br"
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-elinsa-dark transition-colors hover:bg-elinsa-light"
          >
            Solicitar contato
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
