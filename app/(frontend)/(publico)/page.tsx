import { Building01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  Clock3,
  Factory,
  Gauge,
  Handshake,
  HardHat,
  Heart,
  Lightbulb,
  type LucideIcon,
  MapPin,
  NotebookText,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AdaptativeLogo } from "@/components/adaptative-logo";
import { Badge } from "@/components/badge";
import { GalleryCard } from "@/components/gallery-card";
import {
  MapAbaetetuba,
  MapAltamira,
  MapBelem,
  MapItaituba,
  MapMonteAlegre,
  MapParagominas,
  MapSantarem,
} from "@/components/maps/municipalities";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type EditorialPost,
  formatEditorialDate,
  getEditorialCoverImage,
  getEditorialPosts,
  getPostSubjectValue,
  getReadingMinutes,
} from "@/lib/editorial";
import { getEditorialSubjectLabel } from "@/lib/editorial-subjects";
import { cn } from "@/lib/utils";
import Eletricista from "@/public/images/eletricistas.webp";
import Lampada from "@/public/images/lampada.webp";
import dadosAbertos from "@/scripts/estimates/result.json";

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
  featured?: boolean;
  highlights?: {
    label: string;
    prefix: string;
    value: string;
  }[];
};

type DadosAbertosHome = {
  terras_indigenas: number;
  terras_quilombolas: number;
  populacao: number;
  municipios: number;
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
const HOME_TITLE =
  "Elinsa do Brasil | Infraestrutura elétrica empresarial no Pará";
const HOME_DESCRIPTION =
  "Obras, manutenção e suporte operacional em infraestrutura elétrica para o Grupo Equatorial Energia, com bases regionais no Pará.";
const HOME_OG_IMAGE = {
  alt: "Equipe técnica da Elinsa em operação de infraestrutura elétrica",
  height: 941,
  url: "/images/eletricistas.webp",
  width: 1672,
};
const siteUrl = getPublicSiteUrl();
const homeDadosAbertos = dadosAbertos as DadosAbertosHome;
const terrasTradicionais =
  homeDadosAbertos.terras_indigenas + homeDadosAbertos.terras_quilombolas;
const ptBrIntegerFormatter = new Intl.NumberFormat("pt-BR");
const ptBrDecimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});
const energyAcronymLetters = [
  { id: "energia-e-excelencia", letter: "E" },
  { id: "energia-n-nossa-gente", letter: "N" },
  { id: "energia-e-espirito", letter: "E" },
  { id: "energia-r-respeito", letter: "R" },
  { id: "energia-g-gestao", letter: "G" },
  { id: "energia-i-inovacao", letter: "I" },
  { id: "energia-a-atitude", letter: "A" },
] as const;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  ...(siteUrl
    ? {
        alternates: {
          canonical: "/",
        },
        metadataBase: siteUrl,
      }
    : {}),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    locale: "pt_BR",
    siteName: "Elinsa do Brasil",
    type: "website",
    ...(siteUrl
      ? {
          images: [HOME_OG_IMAGE],
          url: "/",
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    ...(siteUrl ? { images: [HOME_OG_IMAGE.url] } : {}),
  },
};

type CompanyValue = {
  id: string;
  letter: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
};

type ValuesDeckProps = {
  label: string;
  kicker: string;
  title: string;
  description: string;
  values: CompanyValue[];
  variant: "primary" | "secondary";
};

const approvedValues: CompanyValue[] = [
  {
    id: "excelencia-execucao",
    letter: "E",
    title: "Excelência na execução",
    description:
      "Fazemos as coisas bem feitas, com qualidade, disciplina e profissionalismo.",
    icon: BadgeCheck,
    accentClassName: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  {
    id: "nossa-gente",
    letter: "N",
    title: "Nossa gente",
    description:
      "Acreditamos que gente cuida de gente. Valorizamos as pessoas, desenvolvemos talentos e crescemos juntos.",
    icon: Users,
    accentClassName: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  {
    id: "espirito-dono",
    letter: "E",
    title: "Espírito de dono",
    description:
      "Assumimos responsabilidades e cuidamos da empresa como nossa.",
    icon: ClipboardCheck,
    accentClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "respeito",
    letter: "R",
    title: "Respeito",
    description: "Respeitamos pessoas, comunidades, clientes e colegas.",
    icon: Handshake,
    accentClassName: "border-rose-500/30 bg-rose-500/10 text-rose-600",
  },
  {
    id: "gestao-seguranca",
    letter: "G",
    title: "Gestão com segurança",
    description: "A segurança vem sempre em primeiro lugar.",
    icon: ShieldCheck,
    accentClassName: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600",
  },
  {
    id: "inovacao-melhoria",
    letter: "I",
    title: "Inovação e melhoria contínua",
    description: "Buscamos aprender, evoluir e melhorar continuamente.",
    icon: Lightbulb,
    accentClassName: "border-violet-500/30 bg-violet-500/10 text-violet-600",
  },
  {
    id: "atitude",
    letter: "A",
    title: "Atitude",
    description: "Transformamos compromisso em ação e resultados.",
    icon: Zap,
    accentClassName: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  },
];

const proposedValues: CompanyValue[] = [
  {
    id: "executamos-qualidade",
    letter: "E",
    title: "Executamos com qualidade",
    description:
      "Fazemos o que precisa ser feito com planejamento, disciplina e atenção aos detalhes, buscando entregas bem feitas do início ao fim.",
    icon: BadgeCheck,
    accentClassName: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  },
  {
    id: "nao-negociamos-seguranca",
    letter: "N",
    title: "Não negociamos segurança",
    description:
      "Nenhum prazo, meta ou resultado vale mais do que a vida. A segurança orienta nossas decisões e a forma como conduzimos cada atividade.",
    icon: ShieldCheck,
    accentClassName: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600",
  },
  {
    id: "entregamos-responsabilidade",
    letter: "E",
    title: "Entregamos com responsabilidade",
    description:
      "Assumimos nossos compromissos com clareza, cuidamos dos recursos da empresa e buscamos soluções com senso de consequência.",
    icon: ClipboardCheck,
    accentClassName: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "respeito-relacoes",
    letter: "R",
    title: "Respeito se pratica nas relações",
    description:
      "Agimos com ética, escuta e consideração no relacionamento com colegas, clientes, parceiros e comunidades.",
    icon: Handshake,
    accentClassName: "border-rose-500/30 bg-rose-500/10 text-rose-600",
  },
  {
    id: "gente-preparada",
    letter: "G",
    title: "Gente preparada faz melhor",
    description:
      "Valorizamos o desenvolvimento, a colaboração e o preparo técnico de quem constrói nossa operação todos os dias.",
    icon: UserRoundCheck,
    accentClassName: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  {
    id: "inovamos-melhorar",
    letter: "I",
    title: "Inovamos para melhorar",
    description:
      "Buscamos formas mais simples, eficientes e inteligentes de trabalhar, aprendendo com a prática e evoluindo continuamente.",
    icon: Lightbulb,
    accentClassName: "border-violet-500/30 bg-violet-500/10 text-violet-600",
  },
  {
    id: "acordos-cumpridos",
    letter: "A",
    title: "Acordos assumidos são cumpridos",
    description:
      "Cumprimos o que combinamos com responsabilidade, clareza e respeito aos prazos, às pessoas e aos resultados esperados.",
    icon: Gauge,
    accentClassName: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  },
];

const services: ServiceCard[] = [
  {
    id: "planejamento",
    title: "Planejamento e programação",
    description:
      "Escopo, equipe, materiais, rota e janela de atendimento são definidos antes da mobilização.",
    detail: "Tudo começa antes da equipe sair",
    icon: NotebookText,
  },
  {
    id: "execucao",
    title: "Mobilização e execução",
    description:
      "Obras e manutenções seguem programação técnica, deslocamento e materiais previstos para reduzir interrupções.",
    detail: "Equipe, frota e execução no mesmo ritmo.",
    icon: HardHat,
  },
  {
    id: "retorno",
    title: "Retorno e acompanhamento",
    description:
      "Retornos operacionais, produtividade e ocorrências alimentam novas frentes, ajustes e suporte técnico.",
    detail: "O campo orienta a próxima decisão.",
    icon: ChartNoAxesCombined,
  },
];

const baseImpactMetrics: ImpactMetric[] = [
  {
    id: "experiencia",
    value: "14",
    label: "anos de atuação",
    description: "Desde 2012",
  },
  {
    id: "impacto-populacao",
    value: formatPopulation(homeDadosAbertos.populacao),
    label: "milhões",
    description: "de pessoas atendidas",
    featured: true,
    highlights: [
      {
        value: formatInteger(homeDadosAbertos.municipios),
        prefix: "em",
        label: "municípios",
      },
      {
        value: `+ ${formatInteger(terrasTradicionais)}`,
        prefix: "e",
        label: "comunidades",
      },
      {
        value: "6",
        prefix: "por",
        label: "bases regionais",
      },
    ],
  },
  {
    id: "equipes",
    value: "+2.000",
    label: "colaboradores",
    description: "mobilizados em operação",
  },
];

function getPublicSiteUrl() {
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelUrl ? `https://${vercelUrl}` : "");

  if (!candidate) {
    return undefined;
  }

  const normalized = /^[a-z][a-z\d+\-.]*:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    return new URL(normalized);
  } catch {
    return undefined;
  }
}

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

function formatInteger(value: number) {
  return ptBrIntegerFormatter.format(value);
}

function formatPopulation(value: number) {
  return ptBrDecimalFormatter.format(value / 1_000_000);
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

function Valores1() {
  return (
    <ValuesDeck
      label="Valores1"
      kicker="Versão aprovada"
      title="ENERGIA como jeito de operar"
      description="A leitura direta dos valores aprovados: simples, clara e pronta para virar referência no dia a dia."
      values={approvedValues}
      variant="primary"
    />
  );
}

function Valores2() {
  return (
    <ValuesDeck
      label="Valores2"
      kicker="Versão de teste"
      title="ENERGIA com frases de ação"
      description="A alternativa dá mais voz operacional a cada letra, transformando os valores em compromissos escritos como prática."
      values={proposedValues}
      variant="secondary"
    />
  );
}

function ValuesDeck({
  label,
  kicker,
  title,
  description,
  values,
  variant,
}: ValuesDeckProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-card p-4 shadow-sm md:p-6",
        variant === "primary"
          ? "border-elinsa-primary/25"
          : "border-border/80 bg-muted/20",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          variant === "primary"
            ? "bg-[linear-gradient(90deg,#0ea5e9,#f59e0b,#10b981,#f43f5e,#06b6d4,#8b5cf6,#f97316)]"
            : "bg-[linear-gradient(90deg,#0369a1,#0891b2,#059669,#be123c,#d97706,#7c3aed,#ea580c)]",
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-elinsa-primary/25 bg-elinsa-primary/10 px-2.5 py-1 text-xs font-black uppercase tracking-normal text-elinsa-primary">
              {label}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">
              {kicker}
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-black tracking-normal text-foreground md:text-3xl">
            {title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            {description}
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-6 right-6 top-7 hidden h-px bg-elinsa-primary/25 md:block" />
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {values.map((value, index) => (
              <div
                key={`${value.id}-letter`}
                className="relative flex min-w-0 flex-col items-center"
              >
                <div
                  className={cn(
                    "relative z-10 flex size-10 items-center justify-center rounded-md border text-base font-black shadow-sm md:size-14 md:text-2xl",
                    value.accentClassName,
                  )}
                >
                  {value.letter}
                </div>
                <span className="mt-2 hidden text-center text-[0.62rem] font-black uppercase leading-3 tracking-normal text-muted-foreground md:block">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[0.68rem] font-black uppercase tracking-normal text-elinsa-primary">
            E N E R G I A
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-12">
        {values.map((value, index) => (
          <article
            key={value.id}
            className={cn(
              "group relative flex min-h-48 flex-col overflow-hidden rounded-md border border-border/70 bg-background p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-elinsa-primary/35 hover:shadow-lg hover:shadow-elinsa-primary/10",
              index < 3 ? "lg:col-span-4" : "lg:col-span-3",
            )}
          >
            <span className="pointer-events-none absolute -right-2 -top-8 text-8xl font-black leading-none text-elinsa-primary opacity-[0.06] transition duration-300 group-hover:opacity-[0.12]">
              {value.letter}
            </span>
            <div className="relative z-10 flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md border",
                  value.accentClassName,
                )}
              >
                <value.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-black uppercase tracking-normal text-muted-foreground">
                  Letra {value.letter}
                </p>
                <h4 className="mt-1 text-lg font-black leading-tight tracking-normal text-foreground">
                  {value.title}
                </h4>
              </div>
            </div>
            <p className="relative z-10 mt-4 text-sm leading-6 text-muted-foreground">
              {value.description}
            </p>
          </article>
        ))}
      </div>
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

function PressNewsCard({ post }: { post: EditorialPost }) {
  const href = post.slug ? `/imprensa/${post.slug}` : "/imprensa";
  const coverImage = getEditorialCoverImage(post, "card");
  const publishedDate = formatEditorialDate(post.publishedAt ?? post.createdAt);
  const readingMinutes = getReadingMinutes(post.content);
  const subjectLabel = getEditorialSubjectLabel(getPostSubjectValue(post));

  return (
    <Link className="group block h-full" href={href}>
      <ShadcnCard className="h-full overflow-hidden rounded-md border-border/70 py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/35 hover:shadow-xl hover:shadow-elinsa-primary/10">
        <div className="relative aspect-16/10 overflow-hidden bg-elinsa-dark">
          <Image
            src={coverImage?.url ?? Lampada}
            alt={coverImage?.alt ?? post.title}
            fill
            className="object-cover object-center transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 22rem, (min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,14,22,0.08)_0%,rgba(4,14,22,0.78)_100%)]" />
          <ShadcnBadge className="absolute left-4 top-4 bg-white/92 text-elinsa-dark shadow-sm backdrop-blur hover:bg-white">
            {subjectLabel}
          </ShadcnBadge>
        </div>

        <CardHeader className="gap-3 p-5 pb-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
            {publishedDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-elinsa-primary" />
                {publishedDate}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-elinsa-primary" />
              {readingMinutes} min de leitura
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-2xl font-black leading-tight tracking-normal text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-base leading-7">
            {post.summary ??
              "Leia a notícia pública completa da Elinsa do Brasil."}
          </CardDescription>
        </CardHeader>

        <CardFooter className="pb-5 pt-0">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-elinsa-dark transition-colors group-hover:text-elinsa-primary dark:text-elinsa-sky">
            Ler notícia
            <ArrowRight
              className="transition-transform group-hover:translate-x-1"
              size={16}
            />
          </span>
        </CardFooter>
      </ShadcnCard>
    </Link>
  );
}

export default async function Home() {
  await connection();

  const impactMetrics = getImpactMetrics();
  const latestPressPosts = await getEditorialPosts("imprensa", { limit: 3 });

  return (
    <div className="bg-background text-foreground">
      {/* hero */}
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
              <h2 className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-normal text-elinsa-dark sm:text-3xl md:text-4xl dark:text-white">
                Operação forte. Energia contínua.
              </h2>
              <p className="max-w-72 text-base leading-7 text-foreground/78 sm:max-w-2xl md:text-xl md:leading-8">
                Planejamento, suporte operacional e execução técnica para manter
                a infraestrutura elétrica em movimento.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="xl"
                className="w-full bg-elinsa-primary text-white hover:bg-elinsa-dark sm:w-auto"
                asChild
              >
                <Link href="/quem-somos">
                  Conheça a empresa
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                size="xl"
                className="w-full border border-border bg-white/85 text-foreground hover:bg-white sm:w-auto dark:bg-background/70 dark:hover:bg-background"
                asChild
              >
                <Link href="/imprensa">Conheça nossa atuação</Link>
              </Button>
            </div>
          </div>

          <div className="w-full rounded-3xl border border-border/70 bg-background/95 p-2 shadow-xl shadow-elinsa-dark/5 backdrop-blur mt-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {impactMetrics.map((metric, index) => (
                <article
                  key={metric.id}
                  className={cn(
                    "relative min-h-24 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 transition-colors hover:border-elinsa-primary/40 hover:bg-elinsa-light/45 dark:hover:bg-elinsa-primary/10",
                    metric.featured &&
                      "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:items-center lg:gap-4",
                  )}
                >
                  {index < impactMetrics.length - 1 ? (
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
        </div>
      </section>

      {/* sessão de mapas */}
      <Separator />
      <section id="bases" className="mx-auto max-w-6xl py-20">
        <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end">
          <div>
            <Badge text="Bases regionais" icon={MapPin} />
            <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Operação distribuída <br />
              pelo Pará
            </h2>
          </div>
          <p className="text-lg text-muted-foreground border-l-3 border-elinsa-primary pl-6 md:pl-12">
            Com bases estrategicamente distribuídas, a Elinsa coorden equipes,
            frota e suporte operacional para garantir presença técnica em todo o
            estado.
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
        </BentoGrid>
      </section>

      {/* sessão de Como a operação acontece */}
      <Separator />
      <section className="overflow-hidden bg-muted/25 px-6 py-14 md:px-8 lg:py-20 min-h-dvh">
        <div className="mx-auto grid h-full max-w-6xl gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          {/* card de destaque com imagem de lâmpada e texto sobre programação em campo */}
          <GalleryCard />

          {/* etapas da operação */}
          <div className="flex flex-col justify-center gap-5 lg:min-h-0">
            <div>
              <Badge text="Como a operação acontece" icon={Factory} />

              <h2 className="max-w-3xl text-3xl font-extrabold tracking-normal md:text-4xl">
                Planejamento, mobilização e execução alinhados
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Cada frente mobilizada sai com escopo definido, equipe alinhada,
                materiais previstos e janela de atendimento organizada. O
                retorno de campo alimenta as próximas decisões operacionais.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {services.map((service, index) => (
                <ShadcnCard
                  key={service.id}
                  className={cn(
                    "group relative overflow-hidden border-border bg-card shadow-sm transition-colors hover:border-elinsa-primary/45",
                    index === 0 ? "md:col-span-2" : "flex flex-col md:min-h-52",
                  )}
                >
                  <service.icon
                    className={cn(
                      "pointer-events-none absolute -right-7 -top-9 size-32 text-elinsa-primary/10 transition duration-300 group-hover:scale-105 group-hover:text-elinsa-primary/12",
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

      {/* sessão de valores */}
      <Separator />
      <section id="valores" className="bg-background px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-end">
            <div>
              <Badge text="Cultura e identidade" icon={Heart} />
              <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
                Valores que acendem <br />
                nossa operação
              </h2>
            </div>
            <div className="border-l-3 border-elinsa-primary pl-6 md:pl-12">
              <p className="text-lg leading-8 text-muted-foreground">
                Duas formulações para a mesma ideia central: ENERGIA como
                acrônimo, ritmo e compromisso de operação.
              </p>
              <div className="mt-5 grid grid-cols-7 gap-1.5">
                {energyAcronymLetters.map((item) => (
                  <span
                    key={item.id}
                    className="flex aspect-square items-center justify-center rounded-md border border-elinsa-primary/25 bg-elinsa-primary/10 text-lg font-black text-elinsa-primary shadow-sm shadow-elinsa-primary/5 md:text-2xl"
                  >
                    {item.letter}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Valores1 />
            <Valores2 />
          </div>
        </div>
      </section>

      {/* sessão de notícias */}
      <Separator />
      <section className="w-full bg-background px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end">
            <div>
              <Badge text="Notícias" icon={Activity} />
              <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
                Últimas atualizações
              </h2>
            </div>
            <p className="text-lg text-muted-foreground border-l-3 border-elinsa-primary pl-6 md:pl-12">
              Acompanhe comunicados, novidades e atualizações sobre operações,
              equipes e iniciativas da Elinsa do Brasil.
            </p>
          </div>
        </div>

        {latestPressPosts.length > 0 ? (
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestPressPosts.map((post) => (
              <PressNewsCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-6xl">
            <ShadcnCard className="rounded-md border-dashed bg-muted/35">
              <CardContent className="py-12">
                <h3 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
                  Nenhuma notícia publicada
                </h3>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  As próximas notícias públicas aparecerão aqui automaticamente.
                </p>
              </CardContent>
            </ShadcnCard>
          </div>
        )}

        <div className="mx-auto mt-10 max-w-6xl text-center">
          <Button variant={"ghost"} size={"lg"} asChild>
            <Link href="/imprensa">
              Ver todas as notícias
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
