import { Heart } from "lucide-react";
import { Badge } from "@/components/badge";
import { HomeSection } from "./home-section";

type ValueAccent =
  | "blue"
  | "gold"
  | "green"
  | "magenta"
  | "orange"
  | "red"
  | "steel"
  | "violet";

type CompanyValue = {
  id: string;
  letter: string;
  title: string;
  description: string;
  accent: ValueAccent;
};

type CompanyValuesVersionId = "valores1" | "valores2";

type CompanyValuesVersion = {
  id: CompanyValuesVersionId;
  complement: string;
  summaryTitle: string;
  description: string;
  values: CompanyValue[];
};

type CompanyValuesContent = {
  sectionLabel: string;
  heading: string;
  description: string;
};

const ACTIVE_VALUES_VERSION: CompanyValuesVersionId = "valores1";

const companyValuesContent = {
  sectionLabel: "Cultura e identidade",
  heading: "O que orienta nossa operação",
  description:
    "Os valores da Elinsa do Brasil orientam decisões de campo, relações de trabalho e a forma de entregar com segurança.",
} satisfies CompanyValuesContent;

const companyValuesVersions: Record<
  CompanyValuesVersionId,
  CompanyValuesVersion
> = {
  valores1: {
    id: "valores1",
    complement: "como jeito de operar",
    summaryTitle: "ENERGIA: valores para a operação",
    description:
      "Sete letras organizam os princípios aprovados em uma leitura direta para equipes, lideranças e parceiros.",
    values: [
      {
        id: "excelencia-execucao",
        letter: "E",
        title: "Excelência na execução",
        description:
          "Fazemos as coisas bem feitas, com qualidade, disciplina e profissionalismo.",
        accent: "blue",
      },
      {
        id: "nossa-gente",
        letter: "N",
        title: "Nossa gente",
        description:
          "Acreditamos que gente cuida de gente. Valorizamos as pessoas, desenvolvemos talentos e crescemos juntos.",
        accent: "gold",
      },
      {
        id: "espirito-dono",
        letter: "E",
        title: "Espírito de dono",
        description:
          "Assumimos responsabilidades e cuidamos da empresa como nossa.",
        accent: "green",
      },
      {
        id: "respeito",
        letter: "R",
        title: "Respeito",
        description: "Respeitamos pessoas, comunidades, clientes e colegas.",
        accent: "magenta",
      },
      {
        id: "gestao-seguranca",
        letter: "G",
        title: "Gestão com segurança",
        description: "A segurança vem sempre em primeiro lugar.",
        accent: "red",
      },
      {
        id: "inovacao-melhoria",
        letter: "I",
        title: "Inovação e melhoria contínua",
        description: "Buscamos aprender, evoluir e melhorar continuamente.",
        accent: "violet",
      },
      {
        id: "atitude",
        letter: "A",
        title: "Atitude",
        description: "Transformamos compromisso em ação e resultados.",
        accent: "orange",
      },
    ],
  },
  valores2: {
    id: "valores2",
    complement: "com frases de ação",
    summaryTitle: "ENERGIA: sete valores em ação",
    description:
      "O acrônimo ENERGIA reúne os valores da Elinsa em compromissos práticos para a operação elétrica: segurança, qualidade, responsabilidade, respeito, desenvolvimento, inovação e cumprimento do combinado.",
    values: [
      {
        id: "executamos-qualidade",
        letter: "E",
        title: "Executamos com qualidade",
        description:
          "Planejamos antes de agir e entregamos com disciplina, atenção aos detalhes e padrão técnico em cada atividade de campo.",
        accent: "blue",
      },
      {
        id: "nao-negociamos-seguranca",
        letter: "N",
        title: "Não negociamos segurança",
        description:
          "A vida vem antes de prazo, meta ou resultado. Toda decisão operacional começa pela proteção das pessoas e pelo controle dos riscos.",
        accent: "red",
      },
      {
        id: "entregamos-responsabilidade",
        letter: "E",
        title: "Entregamos com responsabilidade",
        description:
          "Assumimos compromissos com clareza, cuidamos dos recursos da empresa e buscamos soluções responsáveis para clientes, equipes e comunidades.",
        accent: "green",
      },
      {
        id: "respeito-relacoes",
        letter: "R",
        title: "Respeito se pratica nas relações",
        description:
          "Agimos com ética, escuta e consideração no relacionamento com colegas, clientes, parceiros e comunidades onde atuamos.",
        accent: "magenta",
      },
      {
        id: "gente-preparada",
        letter: "G",
        title: "Gente preparada faz melhor",
        description:
          "Valorizamos treinamento, colaboração e desenvolvimento técnico para que cada equipe trabalhe com segurança e confiança.",
        accent: "gold",
      },
      {
        id: "inovamos-melhorar",
        letter: "I",
        title: "Inovamos para melhorar",
        description:
          "Aprendemos com a prática e buscamos soluções mais simples, eficientes e inteligentes para evoluir a operação continuamente.",
        accent: "violet",
      },
      {
        id: "acordos-cumpridos",
        letter: "A",
        title: "Acordos assumidos são cumpridos",
        description:
          "Cumprimos o combinado com clareza, responsabilidade e respeito aos prazos, às pessoas e aos resultados esperados.",
        accent: "steel",
      },
    ],
  },
};

const activeValuesVersion = companyValuesVersions[ACTIVE_VALUES_VERSION];

const energyWordmarkLetters = [
  { id: "energia-word-e-1", letter: "E" },
  { id: "energia-word-n", letter: "N" },
  { id: "energia-word-e-2", letter: "E" },
  { id: "energia-word-r", letter: "R" },
  { id: "energia-word-g", letter: "G" },
  { id: "energia-word-i", letter: "I" },
  { id: "energia-word-a", letter: "A" },
];

export function CompanyValuesSection() {
  return (
    <HomeSection id="valores" headingId="valores-heading">
      <article className="relative">
        <div className="values-system">
          <CompanyValuesIntro />
          <CompanyValuesGrid />
        </div>
      </article>
    </HomeSection>
  );
}

/** Introduces the official ENERGIA value set without changing the approved copy. */
function CompanyValuesIntro() {
  return (
    <header className="mb-10 grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
      <div className="max-w-xl">
        <Badge text={companyValuesContent.sectionLabel} icon={Heart} />
        <h2
          id="valores-heading"
          className="max-w-2xl text-3xl font-extrabold tracking-normal md:text-4xl"
        >
          {companyValuesContent.heading}
        </h2>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          {companyValuesContent.description}
        </p>
      </div>

      <div className="border-t-3 border-elinsa-primary pt-6 md:border-l-3 md:border-t-0 md:py-2 md:pl-10">
        <p className="text-xs font-black uppercase leading-4 tracking-[0.18em] text-elinsa-primary">
          Acrônimo de valores
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <p className="text-xl font-black leading-7 text-foreground">
              {activeValuesVersion.summaryTitle}
            </p>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              {activeValuesVersion.description}
            </p>
          </div>

          <EnergyRibbon />
        </div>
      </div>
    </header>
  );
}

function EnergyRibbon() {
  return (
    <div
      className="energy-ribbon"
      aria-label={`Acrônimo ENERGIA ${activeValuesVersion.complement}`}
      role="img"
    >
      {energyWordmarkLetters.map((item, index) => (
        <span
          key={item.id}
          className="energy-ribbon-letter"
          data-energy-index={index}
        >
          {item.letter}
        </span>
      ))}
    </div>
  );
}

function CompanyValuesGrid() {
  return (
    <ol
      className="values-card-grid"
      aria-label={`ENERGIA ${activeValuesVersion.complement}`}
    >
      {activeValuesVersion.values.map((value, index) => (
        <CompanyValueCard key={value.id} index={index} value={value} />
      ))}
    </ol>
  );
}

function CompanyValueCard({
  index,
  value,
}: {
  index: number;
  value: CompanyValue;
}) {
  return (
    <li
      data-value-accent={value.accent}
      data-value-index={index}
      className="value-home-card"
    >
      <span className="value-home-card-ghost" aria-hidden="true">
        {value.letter}
      </span>

      <div className="value-home-card-marker" aria-hidden="true">
        <span>{value.letter}</span>
      </div>

      <h3 className="value-home-card-title">{value.title}</h3>
      <p className="value-home-card-description">{value.description}</p>
    </li>
  );
}
