import { Heart } from "lucide-react";
import { Badge } from "@/components/badge";
import { Separator } from "@/components/ui/separator";

type ValueAccent =
  | "amber"
  | "cyan"
  | "emerald"
  | "orange"
  | "rose"
  | "sky"
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
  description: string;
  values: CompanyValue[];
};

type CompanyValuesContent = {
  sectionLabel: string;
  heading: string;
};

const ACTIVE_VALUES_VERSION: CompanyValuesVersionId = "valores2";

const companyValuesContent = {
  sectionLabel: "Cultura e identidade",
  heading: "O que orienta nossa operação",
} satisfies CompanyValuesContent;

const companyValuesVersions: Record<
  CompanyValuesVersionId,
  CompanyValuesVersion
> = {
  valores1: {
    id: "valores1",
    complement: "como jeito de operar",
    description:
      "A leitura direta dos valores aprovados: simples, clara e pronta para virar referência no dia a dia.",
    values: [
      {
        id: "excelencia-execucao",
        letter: "E",
        title: "Excelência na execução",
        description:
          "Fazemos as coisas bem feitas, com qualidade, disciplina e profissionalismo.",
        accent: "sky",
      },
      {
        id: "nossa-gente",
        letter: "N",
        title: "Nossa gente",
        description:
          "Acreditamos que gente cuida de gente. Valorizamos as pessoas, desenvolvemos talentos e crescemos juntos.",
        accent: "amber",
      },
      {
        id: "espirito-dono",
        letter: "E",
        title: "Espírito de dono",
        description:
          "Assumimos responsabilidades e cuidamos da empresa como nossa.",
        accent: "emerald",
      },
      {
        id: "respeito",
        letter: "R",
        title: "Respeito",
        description: "Respeitamos pessoas, comunidades, clientes e colegas.",
        accent: "rose",
      },
      {
        id: "gestao-seguranca",
        letter: "G",
        title: "Gestão com segurança",
        description: "A segurança vem sempre em primeiro lugar.",
        accent: "cyan",
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
    description:
      "A alternativa dá mais voz operacional a cada letra, transformando os valores em compromissos escritos como prática.",
    values: [
      {
        id: "executamos-qualidade",
        letter: "E",
        title: "Executamos com qualidade",
        description:
          "Fazemos o que precisa ser feito com planejamento, disciplina e atenção aos detalhes, buscando entregas bem feitas do início ao fim.",
        accent: "sky",
      },
      {
        id: "nao-negociamos-seguranca",
        letter: "N",
        title: "Não negociamos segurança",
        description:
          "Nenhum prazo, meta ou resultado vale mais do que a vida. A segurança orienta nossas decisões e a forma como conduzimos cada atividade.",
        accent: "cyan",
      },
      {
        id: "entregamos-responsabilidade",
        letter: "E",
        title: "Entregamos com responsabilidade",
        description:
          "Assumimos nossos compromissos com clareza, cuidamos dos recursos da empresa e buscamos soluções com senso de consequência.",
        accent: "emerald",
      },
      {
        id: "respeito-relacoes",
        letter: "R",
        title: "Respeito se pratica nas relações",
        description:
          "Agimos com ética, escuta e consideração no relacionamento com colegas, clientes, parceiros e comunidades.",
        accent: "rose",
      },
      {
        id: "gente-preparada",
        letter: "G",
        title: "Gente preparada faz melhor",
        description:
          "Valorizamos o desenvolvimento, a colaboração e o preparo técnico de quem constrói nossa operação todos os dias.",
        accent: "amber",
      },
      {
        id: "inovamos-melhorar",
        letter: "I",
        title: "Inovamos para melhorar",
        description:
          "Buscamos formas mais simples, eficientes e inteligentes de trabalhar, aprendendo com a prática e evoluindo continuamente.",
        accent: "violet",
      },
      {
        id: "acordos-cumpridos",
        letter: "A",
        title: "Acordos assumidos são cumpridos",
        description:
          "Cumprimos o que combinamos com responsabilidade, clareza e respeito aos prazos, às pessoas e aos resultados esperados.",
        accent: "orange",
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
    <>
      <Separator />
      <section
        id="valores"
        aria-labelledby="valores-heading"
        className="bg-background px-6 py-20 md:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <article className="values-deck relative">
            <header className="mb-12 grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-end">
              <div>
                <Badge text={companyValuesContent.sectionLabel} icon={Heart} />
                <h2
                  id="valores-heading"
                  className="max-w-2xl text-3xl font-extrabold tracking-normal md:text-4xl"
                >
                  {companyValuesContent.heading}
                </h2>
              </div>

              <div className="border-l-3 border-elinsa-primary pl-6 md:pl-12">
                <p className="text-lg font-black leading-7 text-foreground">
                  ENERGIA {activeValuesVersion.complement}
                </p>
                <p className="mt-2 text-lg leading-8 text-muted-foreground">
                  {activeValuesVersion.description}
                </p>
              </div>
            </header>

            <div className="values-system">
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

              <ol
                className="values-card-grid"
                aria-label={`ENERGIA ${activeValuesVersion.complement}`}
              >
                {activeValuesVersion.values.map((value, index) => (
                  <li
                    key={value.id}
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
                    <p className="value-home-card-description">
                      {value.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
