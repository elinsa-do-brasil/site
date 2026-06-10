import {
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

export type AboutStat = {
  value: string;
  label: string;
  description: string;
};

export type AboutPillar = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type AboutMilestone = {
  year: string;
  title: string;
  description: string;
};

export const aboutIcons = {
  building: Building2,
  calendar: CalendarDays,
  earth: Earth,
  factory: Factory,
  globe: Globe2,
} as const;

export const aboutStats: AboutStat[] = [
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

export const aboutPillars: AboutPillar[] = [
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

export const aboutMilestones: AboutMilestone[] = [
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

export const worldConnections = [
  {
    start: { lat: 40.416775, lng: -3.70379, label: "Madrid" },
    end: { lat: -2.9916131, lng: -47.3835003, label: "Macapá" },
  },
];

export const highlightedCountries = [
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
