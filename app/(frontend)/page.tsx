import { ArrowRight02Icon, Building01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity,
  Cable,
  Factory,
  HardHat,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import {
  MapAbaetetuba,
  MapAltamira,
  MapBelem,
  MapParagominas,
  MapSantarem,
} from "@/components/maps/municipalities";
import { Card, Carousel } from "@/components/ui/apple-cards-carousel";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import Eletricista from "@/public/eletricistas.png";

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

const services: ServiceCard[] = [
  {
    id: "postes",
    title: "Obras de distribuição",
    description:
      "Implantação, ampliação e requalificação de redes de distribuição para frentes do Grupo Equatorial Energia.",
    detail: "Equipes de campo, frota e execução elétrica integrada.",
    icon: Zap,
  },
  {
    id: "manutencao",
    title: "Manutenção operacional",
    description:
      "Rotinas preventivas e corretivas para apoiar a continuidade operacional dos ativos atendidos.",
    detail: "Atendimento coordenado para ativos críticos.",
    icon: Wrench,
  },
  {
    id: "planejamento",
    title: "Planejamento e suporte",
    description:
      "Apoio técnico, programação de equipes e controle das frentes de obra e manutenção no Brasil.",
    detail: "Atuação exclusiva para o Grupo Equatorial Energia.",
    icon: HardHat,
  },
];

const impactMetrics: ImpactMetric[] = [
  {
    id: "experiencia",
    value: "14",
    label: "anos",
    description: "fundada em 2012",
  },
  {
    id: "bases",
    value: "5",
    label: "bases",
    description: "operacionais no Pará",
  },
  {
    id: "equipes",
    value: "+2.500",
    label: "colaboradores",
    description: "estimados em operação",
  },
  {
    id: "seguranca",
    value: "369",
    label: "dias",
    description: "sem acidentes e contando",
  },
];

const siteLinks = [
  { href: "/", label: "Início" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/posts", label: "Publicações" },
  { href: "/admin", label: "Portal interno" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/elinsadobrasil/",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "https://www.linkedin.com/in/elinsadobrasil/",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

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
    title: "Cinco bases em operação no Pará",
    src: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2400&auto=format&fit=crop",
    content: (
      <NewsContent points={["Belém", "Altamira", "Santarém"]}>
        A operação atual conta com cinco bases, mantendo equipes e estrutura
        mais próximas das frentes atendidas em diferentes regiões do Pará.
      </NewsContent>
    ),
  },
];

export default function Home() {
  const carouselCards = featureItems.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout />
  ));

  return (
    <div className="bg-background text-foreground">
      <section className="relative flex min-h-[calc(100dvh-12rem)] items-end overflow-hidden px-6 pb-10 pt-28 md:min-h-[calc(100dvh-10rem)] md:items-center md:px-8 md:pb-14">
        <div className="absolute inset-0">
          <Image
            src={Eletricista}
            alt="Equipe técnica da Elinsa em operação de infraestrutura elétrica"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.82)_42%,rgba(255,255,255,0.28)_72%,rgba(255,255,255,0.06)_100%)] dark:bg-[linear-gradient(90deg,rgba(8,16,24,0.92)_0%,rgba(8,16,24,0.76)_44%,rgba(8,16,24,0.28)_74%,rgba(8,16,24,0.08)_100%)]" />
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
              Equatorial Energia, com bases estratégicas no Pará e atuação
              orientada a segurança, previsibilidade e execução técnica.
            </p>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Atuação exclusiva empresarial. Não atendemos diretamente ao
              público consumidor.
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
                <Link href="/posts">Ver publicações</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/35 px-6 py-[clamp(0.75rem,2dvh,1.5rem)] md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 text-center text-sm sm:grid-cols-2 md:grid-cols-4">
          {impactMetrics.map((metric) => (
            <div
              key={metric.id}
              className="flex flex-col items-center justify-center gap-1 rounded-md border border-border/70 bg-background/55 px-4 py-[clamp(0.75rem,2dvh,1.25rem)]"
            >
              <span className="text-[clamp(2.25rem,4.8dvh,3.5rem)] font-black leading-none text-elinsa-primary">
                {metric.value}
              </span>
              <p className="font-semibold uppercase tracking-normal">
                {metric.label}
              </p>
              <p className="text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="bases" className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-elinsa-light px-3 py-2 text-sm font-semibold text-elinsa-dark">
              <MapPin className="size-4" />
              Bases estratégicas
            </div>
            <h2 className="text-3xl font-extrabold tracking-normal md:text-4xl">
              Operação distribuída no Pará
            </h2>
          </div>
          <p className="text-lg text-muted-foreground">
            A partir desses polos, a Elinsa mobiliza pessoas, equipamentos e
            liderança operacional para apoiar projetos elétricos em diferentes
            regiões do estado.
          </p>
        </div>

        <BentoGrid className="max-w-none grid-cols-1 gap-5 md:auto-rows-[25rem] md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <MapAbaetetuba />
          </div>
          <div className="lg:col-span-2">
            <MapAltamira />
          </div>
          <div className="lg:col-span-2">
            <MapBelem />
          </div>
          <div className="lg:col-span-2">
            <MapParagominas />
          </div>
          <div className="lg:col-span-2">
            <MapSantarem />
          </div>
          <div className="lg:col-span-2">
            <Link
              href="/mapas"
              className="group relative flex h-full min-h-100 flex-col justify-between overflow-hidden rounded-3xl bg-elinsa-dark p-7 text-white shadow-sm transition-colors hover:bg-elinsa-primary"
            >
              <MapIcon className="absolute -right-12 -top-12 size-48 text-white/10 transition-transform duration-300 group-hover:scale-105" />
              <div className="relative z-10">
                <div className="mb-6 flex size-11 items-center justify-center rounded-md bg-white/12">
                  <Factory className="size-5" />
                </div>
                <h3 className="text-3xl font-bold tracking-normal">
                  Cobertura operacional
                </h3>
                <p className="mt-3 leading-7 text-white/82">
                  A nossa estrutura completa e alguns arquivos de mapas
                  detalhados estão disponíveis para download.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 font-semibold">
                <span>Ver os mapas</span>
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  className="size-5 transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          </div>
        </BentoGrid>
      </section>

      <section className="bg-muted/35 px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold tracking-normal md:text-5xl">
                Engenharia, campo e manutenção no mesmo ritmo
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A atuação integra obra elétrica, manutenção, planejamento e
                operação em campo para o Grupo Equatorial Energia, com prazos,
                segurança e previsibilidade.
              </p>
            </div>
            <Button
              size="xl"
              className="w-fit bg-elinsa-primary text-white hover:bg-elinsa-dark"
              asChild
            >
              <a href="mailto:comercial@elinsa.com.br">
                Entrar em contato
                <HugeiconsIcon icon={ArrowRight02Icon} />
              </a>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="group rounded-md border border-border bg-card p-6 shadow-sm transition-colors hover:border-elinsa-primary/45"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark transition-colors group-hover:bg-elinsa-primary group-hover:text-white">
                  <service.icon className="size-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-normal">
                  {service.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {service.description}
                </p>
                <p className="mt-6 border-t border-border pt-4 text-sm font-semibold text-elinsa-dark dark:text-elinsa-sky">
                  {service.detail}
                </p>
              </article>
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

      <section className="border-y border-border bg-elinsa-dark px-6 py-16 text-white md:px-8">
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
      </section>

      <footer className="bg-background px-6 py-12 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-black tracking-normal text-elinsa-dark dark:text-elinsa-sky">
              Elinsa do Brasil
            </h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              Infraestrutura elétrica, manutenção e obras complexas para frentes
              do Grupo Equatorial Energia.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-elinsa-primary hover:text-elinsa-primary"
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold">Mapa do site</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-elinsa-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold">Contato</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>
                <a
                  href="mailto:comercial@elinsa.com.br"
                  className="transition-colors hover:text-elinsa-primary"
                >
                  comercial@elinsa.com.br
                </a>
              </li>
              <li>Belém, Pará - Brasil</li>
              <li>Atendimento empresarial</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
