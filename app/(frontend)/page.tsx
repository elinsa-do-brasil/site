import { ArrowRight02Icon, Building01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity,
  Factory,
  HardHat,
  Heart,
  Leaf,
  Lightbulb,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  Scale,
  ShieldCheck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import {
  MapAbaetetuba,
  MapAltamira,
  MapBelem,
  MapItaituba,
  MapMonteAlegre,
  MapParagominas,
  MapSantarem,
} from "@/components/maps/municipalities";
import {
  Card as AppleCard,
  Carousel,
} from "@/components/ui/apple-cards-carousel";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { CardContent, Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Eletricista from "@/public/images/eletricistas.png";
import Lampada from "@/public/images/lampada.webp";

type ServiceCard = {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

type ImpactMetric = {
  id: string;
  value: string;
  label: string;
  description: string;
};

type FeatureItem = {
  category: string;
  title: string;
  src: string;
  content: ReactNode;
};

type RegionalBentoCard = {
  id: string;
  name: string;
  description: string;
  bases: string;
  coverage: string;
  accentClassName: string;
  badgeClassName: string;
  surfaceClassName: string;
};

const LAST_ACCIDENT_DATE_FALLBACK = "2025-05-03";
const SAFETY_TIME_ZONE = "America/Sao_Paulo";
const MS_PER_DAY = 86_400_000;

type ValueCard = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
};

const companyValues: ValueCard[] = [
  {
    id: "respeito-vida",
    title: "Respeito à Vida",
    description:
      "Priorizamos a vida em primeiro lugar. Cada decisão operacional passa pela segurança das pessoas antes de qualquer meta ou prazo.",
    icon: Heart,
    accentClassName: "text-rose-500 bg-rose-500/10",
  },
  {
    id: "gente",
    title: "Gente",
    description:
      "Nossas realizações são conquistas de cada pessoa do nosso time. O crescimento da empresa começa pelo desenvolvimento de quem faz parte dela.",
    icon: Users,
    accentClassName: "text-amber-500 bg-amber-500/10",
  },
  {
    id: "inovacao",
    title: "Inovação e Geração de Valor",
    description:
      "Inovamos em busca da excelência e da rentabilidade para clientes, colaboradores, fornecedores e acionistas.",
    icon: Lightbulb,
    accentClassName: "text-sky-500 bg-sky-500/10",
  },
  {
    id: "integridade",
    title: "Integridade",
    description:
      "Éticas e transparentes em todas as nossas relações. A confiança se constrói com coerência entre discurso e prática.",
    icon: Scale,
    accentClassName: "text-violet-500 bg-violet-500/10",
  },
  {
    id: "sustentabilidade",
    title: "Sustentabilidade e Responsabilidade Socioambiental",
    description:
      "Somos agentes ativos da preservação do meio ambiente, investindo para contribuir com o desenvolvimento social e ambiental.",
    icon: Leaf,
    accentClassName: "text-emerald-500 bg-emerald-500/10",
  },
];

const services: ServiceCard[] = [
  {
    id: "postes",
    title: "Obras de distribuição",
    description:
      "Ampliação, recondutoramento e correções de rede saem com escopo, equipe, materiais e janela de atendimento alinhados antes da mobilização.",
    detail: "Planejamento técnico, frota e execução na mesma cadência.",
    icon: Zap,
  },
  {
    id: "manutencao",
    title: "Manutenção operacional",
    description:
      "Preventivas e corretivas entram por criticidade, risco e impacto no ativo, com retorno de campo para orientar a próxima decisão.",
    detail: "Menos retrabalho entre chamado, rota e encerramento.",
    icon: Wrench,
  },
  {
    id: "planejamento",
    title: "Planejamento e suporte",
    description:
      "Acompanhamento de frentes, produtividade, suprimentos e documentação para manter a operação dedicada previsível.",
    detail: "Base administrativa conectada às equipes em campo.",
    icon: HardHat,
  },
];

const baseImpactMetrics: ImpactMetric[] = [
  {
    id: "experiencia",
    value: "14",
    label: "anos",
    description: "fundada em 2012",
  },
  {
    id: "bases",
    value: "6",
    label: "bases",
    description: "regionais no Pará",
  },
  {
    id: "equipes",
    value: "+2.500",
    label: "colaboradores",
    description: "estimados em operação",
  },
];

function getImpactMetrics(): ImpactMetric[] {
  return [
    ...baseImpactMetrics,
    {
      id: "seguranca",
      value: String(getDaysSinceLastAccident()),
      label: "dias",
      description: "sem acidentes e contando",
    },
  ];
}

function getDaysSinceLastAccident() {
  const lastAccidentDate =
    process.env.ELINSA_LAST_ACCIDENT_DATE ?? LAST_ACCIDENT_DATE_FALLBACK;
  const lastAccidentDay = parseLocalDateDayNumber(lastAccidentDate);
  const today = getTodayDayNumber(SAFETY_TIME_ZONE);

  if (lastAccidentDay === null) {
    return Math.max(
      0,
      today - (parseLocalDateDayNumber(LAST_ACCIDENT_DATE_FALLBACK) ?? today),
    );
  }

  return Math.max(0, today - lastAccidentDay);
}

function parseLocalDateDayNumber(dateString: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return Math.floor(timestamp / MS_PER_DAY);
}

function getTodayDayNumber(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const dateString = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

  return (
    parseLocalDateDayNumber(dateString) ?? Math.floor(Date.now() / MS_PER_DAY)
  );
}

const regionalBentoCards: Record<string, RegionalBentoCard> = {
  centro: {
    id: "centro",
    name: "Centro",
    description: "Xingu e Transamazônica",
    bases: "1 base",
    coverage: "12 municípios",
    accentClassName: "bg-yellow-500",
    badgeClassName: "bg-yellow-400 text-elinsa-dark",
    surfaceClassName:
      "bg-[linear-gradient(135deg,rgba(234,179,8,0.18),rgba(255,255,255,0)_62%)] dark:bg-[linear-gradient(135deg,rgba(234,179,8,0.20),rgba(255,255,255,0)_58%)]",
  },
  nordeste: {
    id: "nordeste",
    name: "Nordeste",
    description: "Baixo Tocantins, Capim e Guamá",
    bases: "2 bases",
    coverage: "20 municípios",
    accentClassName: "bg-emerald-500",
    badgeClassName: "bg-emerald-500 text-white",
    surfaceClassName:
      "bg-[linear-gradient(135deg,rgba(22,163,74,0.14),rgba(245,158,11,0.08)_44%,rgba(255,255,255,0)_70%)] dark:bg-[linear-gradient(135deg,rgba(22,163,74,0.18),rgba(245,158,11,0.12)_48%,rgba(255,255,255,0)_72%)]",
  },
  oeste: {
    id: "oeste",
    name: "Oeste",
    description: "Tapajós, Calha Norte e Baixo Amazonas",
    bases: "3 bases",
    coverage: "19 municípios",
    accentClassName: "bg-violet-500",
    badgeClassName: "bg-violet-500 text-white",
    surfaceClassName:
      "bg-[linear-gradient(135deg,rgba(139,92,246,0.16),rgba(6,182,212,0.11)_44%,rgba(239,68,68,0.08)_72%)] dark:bg-[linear-gradient(135deg,rgba(139,92,246,0.18),rgba(6,182,212,0.12)_44%,rgba(239,68,68,0.10)_72%)]",
  },
};

function NewsContent({
  children,
  points,
}: {
  children: ReactNode;
  points: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 text-base leading-7 text-muted-foreground md:text-lg">
      <p>{children}</p>
      <ul className="grid gap-3 text-sm text-foreground md:grid-cols-3">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
          >
            <ShieldCheck className="size-4 shrink-0 text-elinsa-primary" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegionalIntroCard({
  regional,
  className,
}: {
  regional: RegionalBentoCard;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full min-h-60 flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm",
        regional.surfaceClassName,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-1.5",
          regional.accentClassName,
        )}
      />
      <div className="relative z-10">
        <div
          className={cn(
            "mb-5 flex size-11 items-center justify-center rounded-md",
            regional.badgeClassName,
          )}
        >
          <MapPin className="size-5" />
        </div>
        <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
          Regional
        </p>
        <h3 className="mt-1 text-3xl font-black tracking-normal text-foreground">
          {regional.name}
        </h3>
        <p className="mt-3 max-w-64 text-sm leading-6 text-muted-foreground">
          {regional.description}
        </p>
      </div>
      <dl className="relative z-10 mt-8 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-border/70 bg-background/65 p-3 backdrop-blur">
          <dt className="text-muted-foreground">Bases</dt>
          <dd className="mt-1 font-bold text-foreground">{regional.bases}</dd>
        </div>
        <div className="rounded-md border border-border/70 bg-background/65 p-3 backdrop-blur">
          <dt className="text-muted-foreground">Cobertura</dt>
          <dd className="mt-1 font-bold text-foreground">
            {regional.coverage}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function CoverageMapCard({ className }: { className?: string }) {
  return (
    <Link
      href="/mapas"
      className={cn(
        "group relative flex h-full min-h-52 overflow-hidden rounded-3xl border border-elinsa-primary/25 bg-elinsa-dark p-6 text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-elinsa-primary hover:shadow-xl",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(36,163,221,0.28),rgba(255,255,255,0)_58%)]" />
      <MapIcon className="absolute -right-8 -top-14 size-48 text-white/10 transition-transform duration-300 group-hover:scale-105" />
      <div className="relative z-10 grid w-full gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="max-w-2xl">
          <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-white/12">
            <Factory className="size-5" />
          </div>
          <h3 className="text-2xl font-black tracking-normal md:text-3xl">
            Mapa operacional completo
          </h3>
          <p className="mt-3 leading-7 text-white/80">
            Explore as regionais, bases, municípios atendidos e arquivos de
            download em uma visão dedicada.
          </p>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span>Ver mapas</span>
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            className="size-5 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

const featureItems: FeatureItem[] = [
  {
    category: "Blog",
    title: "Operação focada no Grupo Equatorial Energia",
    src: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2400&auto=format&fit=crop",
    content: (
      <NewsContent points={["Obras", "Manutenção", "Suporte"]}>
        No Brasil, a Elinsa concentra suas frentes de obras, manutenção,
        planejamento e suporte operacional em atendimento ao Grupo Equatorial
        Energia.
      </NewsContent>
    ),
  },
  {
    category: "Segurança",
    title: "369 dias sem acidentes de trabalho",
    src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2400&auto=format&fit=crop",
    content: (
      <NewsContent points={["Prevenção", "Rotina", "Cuidado"]}>
        A marca de 369 dias e contando reflete disciplina operacional, presença
        de liderança em campo e atenção permanente aos procedimentos de
        segurança.
      </NewsContent>
    ),
  },
  {
    category: "Pessoas",
    title: "Mais de 2.500 colaboradores estimados",
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2400&auto=format&fit=crop",
    content: (
      <NewsContent points={["Paragominas", "Abaetetuba", "Outros eixos"]}>
        A estimativa parte dos 1.938 colaboradores ativos registrados nos eixos
        Paragominas e Abaetetuba em novembro de 2025, somando uma projeção
        conservadora para Santarém e Altamira.
      </NewsContent>
    ),
  },
  {
    category: "Bases",
    title: "Seis bases regionais em operação no Pará",
    src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2400&auto=format&fit=crop",
    content: (
      <NewsContent points={["Centro", "Nordeste", "Oeste"]}>
        A operação regional conta com seis bases, mantendo equipes e estrutura
        mais próximas das frentes atendidas em diferentes áreas do Pará.
      </NewsContent>
    ),
  },
];

export default async function Home() {
  await connection();

  const impactMetrics = getImpactMetrics();
  const carouselCards = featureItems.map((card, index) => (
    <AppleCard key={card.src} card={card} index={index} layout />
  ));

  return (
    <div className="bg-background text-foreground">
      <section className="relative flex min-h-[calc(100dvh-12rem)] items-end overflow-visible px-6 pb-10 pt-28 md:min-h-[calc(100dvh-10rem)] md:items-center md:px-8 md:pb-14">
        <div className="absolute inset-x-0 top-0 -bottom-28 overflow-hidden">
          <Image
            src={Eletricista}
            alt="Equipe técnica da Elinsa em operação de infraestrutura elétrica"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.82)_42%,rgba(255,255,255,0.28)_72%,rgba(255,255,255,0.06)_100%)] dark:bg-[linear-gradient(90deg,rgba(8,16,24,0.92)_0%,rgba(8,16,24,0.76)_44%,rgba(8,16,24,0.28)_74%,rgba(8,16,24,0.08)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-72 sm:max-w-6xl">
          <div className="w-full max-w-72 min-w-0 sm:max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-elinsa-primary/20 bg-white/80 px-3 py-2 text-sm font-semibold text-elinsa-dark shadow-sm backdrop-blur dark:bg-background/70 dark:text-elinsa-sky">
              <HugeiconsIcon icon={Building01Icon} className="size-4" />
              Infraestrutura elétrica empresarial
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-normal text-elinsa-dark sm:text-5xl md:text-7xl dark:text-white">
              Elinsa do Brasil
            </h1>
            <p className="mt-6 max-w-72 text-base leading-7 text-foreground/78 sm:max-w-2xl md:text-xl md:leading-8">
              Obras, manutenção, planejamento e suporte operacional para o Grupo
              Equatorial, com bases estratégicas no Pará e atuação
              orientada a segurança, previsibilidade e execução técnica.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="xl"
                className="w-full bg-elinsa-primary text-white hover:bg-elinsa-dark sm:w-auto"
                asChild
              >
                <Link href="/quem-somos">
                  Conheça a empresa
                  <HugeiconsIcon icon={ArrowRight02Icon} />
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="xl"
                className="w-full border border-border bg-white/85 text-foreground hover:bg-white sm:w-auto dark:bg-background/70 dark:hover:bg-background"
                asChild
              >
                <Link href="/imprensa">Ver notícias</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-10 px-6 pb-12 md:-mt-12 md:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-border/70 bg-background/95 p-3 shadow-xl shadow-elinsa-dark/5 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric) => (
              <article
                key={metric.id}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 px-5 py-5 transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:hover:bg-elinsa-primary/10"
              >
                <div className="absolute right-4 top-4 size-14 rounded-full bg-elinsa-primary/8" />
                <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
                  {metric.label}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black leading-none text-elinsa-primary md:text-5xl">
                    {metric.value}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {metric.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="bases" className="mx-auto max-w-6xl py-20">
        <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
              <MapPin className="size-4" />
              Bases estratégicas
            </div>
            <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Operação distribuída <br />
              no Pará
            </h2>
          </div>
          <p className="text-lg text-muted-foreground">
            A partir desses polos, a Elinsa mobiliza pessoas, equipamentos e
            liderança operacional para apoiar projetos elétricos em diferentes
            regiões do estado.
          </p>
        </div>

        <BentoGrid className="max-w-none grid-cols-1 gap-4 md:auto-rows-[12rem] md:grid-cols-6 lg:auto-rows-[11rem] lg:grid-cols-12">
          <MapBelem className="h-full min-h-76 md:col-span-3 md:row-span-2 md:min-h-0 lg:col-span-4" />
          <RegionalIntroCard
            regional={regionalBentoCards.centro}
            className="md:col-span-3 md:row-span-2 lg:col-span-3"
          />
          <MapAltamira className="h-full min-h-76 md:col-span-6 md:row-span-2 md:min-h-0 lg:col-span-5" />

          <RegionalIntroCard
            regional={regionalBentoCards.nordeste}
            className="md:col-span-2 md:row-span-2 lg:col-span-3"
          />
          <MapAbaetetuba className="h-full min-h-76 md:col-span-3 md:row-span-2 md:min-h-0 lg:col-span-4" />
          <MapParagominas className="h-full min-h-76 md:col-span-3 md:row-span-2 md:min-h-0 lg:col-span-5" />

          <RegionalIntroCard
            regional={regionalBentoCards.oeste}
            className="md:col-span-2 md:row-span-2 lg:col-span-3"
          />
          <MapSantarem className="h-full min-h-76 md:col-span-4 md:row-span-2 md:min-h-0 lg:col-span-3" />
          <MapItaituba className="h-full min-h-76 md:col-span-3 md:row-span-2 md:min-h-0 lg:col-span-3" />
          <MapMonteAlegre className="h-full min-h-76 md:col-span-3 md:row-span-2 md:min-h-0 lg:col-span-3" />

          <CoverageMapCard className="md:col-span-6 md:row-span-1 lg:col-span-12" />
        </BentoGrid>
      </section>

      <section className="overflow-hidden bg-muted/25 px-6 py-14 md:px-8 lg:h-[min(44rem,calc(100dvh-5rem))] lg:py-8">
        <div className="mx-auto grid h-full max-w-6xl gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          <div className="relative min-h-88 overflow-hidden rounded-2xl border border-white/10 bg-elinsa-dark p-6 text-white shadow-xl shadow-elinsa-dark/12 lg:min-h-0">
            <Image
              src={Lampada}
              alt="Lâmpada acesa em uma composição conceitual de operação elétrica"
              fill
              className="object-cover object-center opacity-45"
              sizes="(min-width: 1024px) 31vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,24,0.96)_0%,rgba(8,16,24,0.82)_48%,rgba(8,16,24,0.54)_100%)]" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
                <Zap className="size-4 text-yellow-300" />
                Programação em campo
              </div>

              <div>
                <p className="max-w-sm text-2xl font-black leading-tight tracking-normal md:text-3xl">
                  Ordem, rota, equipe e material fechados antes da mobilização.
                </p>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/72">
                  A execução fica mais clara quando cada frente sai com
                  responsável, janela de atendimento e retorno esperado.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                {["Escopo", "Rota", "Retorno"].map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/14 bg-white/10 px-3 py-2 text-center font-semibold text-white/88 backdrop-blur"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 lg:min-h-0">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground">
                <Factory className="size-4 text-elinsa-primary" />
                Fluxo de execução
              </div>
              <h2 className="max-w-3xl text-3xl font-extrabold tracking-normal md:text-4xl">
                Engenharia, campo e manutenção no mesmo ritmo
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Uma frente só funciona quando escopo, deslocamento, equipe,
                material e retorno de campo chegam juntos. Essa cadência
                organiza obras, manutenção e suporte técnico nas bases
                atendidas.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {services.map((service, index) => (
                <ShadcnCard
                  key={service.id}
                  className={cn(
                    "group relative overflow-hidden border-border bg-background shadow-sm transition-colors hover:border-elinsa-primary/45",
                    index === 0
                      ? "md:col-span-2"
                      : "flex flex-col md:min-h-52",
                  )}
                >
                  <service.icon
                    className={cn(
                      "pointer-events-none absolute -right-7 -top-9 size-32 text-elinsa-primary/8 transition duration-300 group-hover:scale-105 group-hover:text-elinsa-primary/12",
                      index === 0 && "md:-right-9 md:-top-12 md:size-40",
                    )}
                    strokeWidth={1.5}
                  />
                  <CardContent className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold tracking-normal">
                        {service.title}
                      </h3>
                      <span className="shrink-0 text-sm font-black text-elinsa-primary/55">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {service.description}
                    </p>
                    <p className="mt-3 border-t border-border pt-2.5 text-sm font-semibold text-elinsa-dark dark:text-elinsa-sky">
                      {service.detail}
                    </p>
                  </CardContent>
                </ShadcnCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="valores" className="bg-background px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-semibold text-muted-foreground">
              <Heart className="size-4 text-elinsa-primary" />
              Cultura e identidade
            </div>
            <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Nossos valores
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Os princípios que orientam cada decisão, cada frente de trabalho e
              cada relacionamento dentro da Elinsa do Brasil.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {companyValues.map((value, index) => (
              <ShadcnCard
                key={value.id}
                className={cn(
                  "group relative overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-elinsa-primary/30 hover:shadow-lg",
                  index < 2 ? "lg:col-span-3" : "lg:col-span-2",
                )}
              >
                <value.icon
                  className="pointer-events-none absolute -right-6 -top-6 size-28 text-foreground/4 transition-transform duration-300 group-hover:scale-110 group-hover:text-foreground/[0.07]"
                  strokeWidth={1.2}
                />
                <CardContent className="relative z-10">
                  <div
                    className={cn(
                      "mb-4 flex size-11 items-center justify-center rounded-xl",
                      value.accentClassName,
                    )}
                  >
                    <value.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-normal">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </ShadcnCard>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full overflow-hidden bg-background py-20">
        <div className="mx-auto mb-2 max-w-6xl px-6 md:px-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground">
            <Activity className="size-4 text-elinsa-primary" />
            Notícias
          </div>
          <h2 className="text-4xl font-extrabold tracking-normal md:text-5xl">
            Últimas do blog
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            Notícias institucionais, segurança, operação e comunicados da Elinsa
            do Brasil.
          </p>
        </div>
        <Carousel items={carouselCards} />
      </section>

      {/* <section className="border-y border-border bg-elinsa-dark px-6 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Operação dedicada ao Grupo Equatorial Energia
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/78">
              A Elinsa do Brasil atua em obras, manutenção, planejamento e
              suporte técnico para as frentes atendidas no Pará.
            </p>
          </div>
          <Button
            size="xl"
            className="w-fit bg-white text-elinsa-dark hover:bg-elinsa-light"
            asChild
          >
            <a href="mailto:comercial@elinsa.com.br">
              Solicitar contato
              <Cable className="size-4" />
            </a>
          </Button>
        </div>
      </section> */}
    </div>
  );
}
