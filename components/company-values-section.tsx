import {
  BadgeCheck,
  ClipboardCheck,
  Gauge,
  Handshake,
  Heart,
  Lightbulb,
  type LucideIcon,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type CompanyValue = {
  id: string;
  letter: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
};

type CompanyValuesVersion = {
  id: string;
  title: string;
  values: CompanyValue[];
};

type CompanyValuesContent = {
  badge: string;
  title: string;
  description: string;
  acronym: {
    id: string;
    letter: string;
  }[];
  versions: CompanyValuesVersion[];
};

const companyValuesContent = {
  badge: "Cultura e identidade",
  title: "Valores que acendem nossa operação",
  description:
    "O acrônimo ENERGIA reúne os princípios que orientam decisões, segurança e execução.",
  acronym: [
    { id: "energia-excelencia", letter: "E" },
    { id: "energia-nossa-gente", letter: "N" },
    { id: "energia-espirito", letter: "E" },
    { id: "energia-respeito", letter: "R" },
    { id: "energia-gestao", letter: "G" },
    { id: "energia-inovacao", letter: "I" },
    { id: "energia-atitude", letter: "A" },
  ],
  versions: [
    {
      id: "valores1",
      title: "Valores1",
      values: [
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
          accentClassName:
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
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
          accentClassName:
            "border-violet-500/30 bg-violet-500/10 text-violet-600",
        },
        {
          id: "atitude",
          letter: "A",
          title: "Atitude",
          description: "Transformamos compromisso em ação e resultados.",
          icon: Zap,
          accentClassName:
            "border-orange-500/30 bg-orange-500/10 text-orange-600",
        },
      ],
    },
    {
      id: "valores2",
      title: "Valores2",
      values: [
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
          accentClassName:
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
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
          accentClassName:
            "border-violet-500/30 bg-violet-500/10 text-violet-600",
        },
        {
          id: "acordos-cumpridos",
          letter: "A",
          title: "Acordos assumidos são cumpridos",
          description:
            "Cumprimos o que combinamos com responsabilidade, clareza e respeito aos prazos, às pessoas e aos resultados esperados.",
          icon: Gauge,
          accentClassName:
            "border-orange-500/30 bg-orange-500/10 text-orange-600",
        },
      ],
    },
  ],
} satisfies CompanyValuesContent;

export function CompanyValuesSection() {
  return (
    <>
      <Separator />
      <section
        id="valores"
        aria-labelledby="valores-heading"
        className="bg-background px-6 py-20 md:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-6 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-end">
            <div>
              <Badge text={companyValuesContent.badge} icon={Heart} />
              <h2
                id="valores-heading"
                className="max-w-2xl text-3xl font-extrabold tracking-normal md:text-4xl"
              >
                {companyValuesContent.title}
              </h2>
            </div>

            <div className="border-l-3 border-elinsa-primary pl-6 md:pl-12">
              <p className="text-lg leading-8 text-muted-foreground">
                {companyValuesContent.description}
              </p>
              <div
                className="mt-5 grid grid-cols-7 gap-1.5"
                aria-label="Acrônimo ENERGIA"
              >
                {companyValuesContent.acronym.map((item) => (
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
            {companyValuesContent.versions.map((version) => (
              <article
                key={version.id}
                className="relative overflow-hidden rounded-md border border-border/80 bg-card p-4 shadow-sm md:p-6"
              >
                <h3 className="text-2xl font-black tracking-normal text-foreground">
                  {version.title}
                </h3>

                <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-12">
                  {version.values.map((value, index) => {
                    const Icon = value.icon;

                    return (
                      <li
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
                            <Icon className="size-5" />
                          </div>
                          <h4 className="min-w-0 text-lg font-black leading-tight tracking-normal text-foreground">
                            {value.title}
                          </h4>
                        </div>
                        <p className="relative z-10 mt-4 text-sm leading-6 text-muted-foreground">
                          {value.description}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
