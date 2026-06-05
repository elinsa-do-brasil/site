import {
  ChartNoAxesCombined,
  HardHat,
  type LucideIcon,
  NotebookText,
} from "lucide-react";
import dadosAbertos from "@/scripts/estimates/result.json";

export type ServiceCard = {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

export type ImpactMetric = {
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

const LAST_ACCIDENT_DATE_FALLBACK = "2025-05-03";
const SAFETY_TIME_ZONE = "America/Sao_Paulo";
const MS_PER_DAY = 86_400_000;
const homeDadosAbertos = dadosAbertos as DadosAbertosHome;
const terrasTradicionais =
  homeDadosAbertos.terras_indigenas + homeDadosAbertos.terras_quilombolas;
const ptBrIntegerFormatter = new Intl.NumberFormat("pt-BR");
const ptBrDecimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

export const services: ServiceCard[] = [
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

export function getImpactMetrics(): ImpactMetric[] {
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
