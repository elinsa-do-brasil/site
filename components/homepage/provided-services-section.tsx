import { BriefcaseBusiness, Zap } from "lucide-react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import {
  CardContent,
  CardFooter,
  CardHeader,
  Card as ShadcnCard,
} from "@/components/ui/card";
import { HomeSection, HomeSectionIntro } from "./home-section";

type ProvidedService = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
};

const providedServices: ProvidedService[] = [
  {
    id: "plantao-24h",
    eyebrow: "Plantão 24h",
    title: "Prontos para agir, a qualquer hora",
    description:
      "Quando a rede pede resposta rápida, nossa equipe entra em campo com segurança, organização e comunicação clara.",
    detail: "Plantão 24h para emergências e recomposição.",
  },
  {
    id: "ligacao-nova",
    eyebrow: "Ligação nova",
    title: "Novas ligações sem complicação",
    description:
      "Instalamos e ativamos novas ligações com planejamento, padrão técnico e cuidado com cada cliente.",
    detail: "Mais agilidade do pedido à energia ligada.",
  },
  {
    id: "corte-debito",
    eyebrow: "Corte por débito",
    title: "Ação comercial firme e responsável",
    description:
      "Realizamos cortes programados com orientação, registro em campo e respeito ao consumidor.",
    detail: "Inadimplência tratada com critério e segurança.",
  },
  {
    id: "seed-money",
    eyebrow: "Seed Money",
    title: "Receita recuperada, cliente regularizado",
    description:
      "Apoiamos negociações e acordos para transformar pendências em consumo ativo e em dia.",
    detail: "Mais retorno comercial com abordagem humanizada.",
  },
  {
    id: "fiscalizacao",
    eyebrow: "Fiscalização",
    title: "Energia usada do jeito certo",
    description:
      "Inspecionamos unidades para identificar irregularidades, reduzir perdas e proteger a rede.",
    detail: "Mais justiça no consumo e eficiência para o sistema.",
  },
  {
    id: "regularizacao",
    eyebrow: "Regularização",
    title: "Pendências resolvidas com cuidado",
    description:
      "Ajustamos cadastros, instalações e condições de atendimento para deixar tudo em ordem.",
    detail: "Cliente, rede e operação caminhando em conformidade.",
  },
];

/** Lists the technical and commercial services after the operating model. */
export function ProvidedServicesSection() {
  return (
    <HomeSection id="servicos" headingId="servicos-heading" tone="default">
      <HomeSectionIntro
        badge="Serviços que prestamos"
        headingId="servicos-heading"
        icon={BriefcaseBusiness}
        marker="06"
        title="Frentes técnicas e comerciais para a energia chegar melhor."
        variant="specification"
        aside={
          <div className="relative">
            <Zap
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 size-16 rotate-6 text-elinsa-primary/10 dark:text-elinsa-sky/10"
              strokeWidth={1.2}
            />
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              Da resposta emergencial à regularização de clientes, cada serviço
              precisa preservar segurança, rastreabilidade e respeito no
              atendimento.
            </p>
          </div>
        }
      />

      <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {providedServices.map((service) => (
          <ProvidedServiceCard key={service.id} service={service} />
        ))}
      </div>
    </HomeSection>
  );
}

function ProvidedServiceCard({ service }: { service: ProvidedService }) {
  return (
    <ShadcnCard className="relative min-h-64 rounded-xl border-border/70 bg-muted/25 py-0 shadow-none transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/40 hover:bg-elinsa-light/35 dark:bg-background/35 dark:hover:bg-elinsa-primary/10">
      <CardHeader className="relative z-10 pt-5 md:pt-6">
        <ShadcnBadge
          variant="outline"
          className="h-auto w-fit rounded-full border-elinsa-primary/20 bg-elinsa-light/65 px-3 py-1.5 text-xs font-black uppercase leading-4 tracking-[0.14em] text-elinsa-primary dark:bg-elinsa-primary/10 dark:text-elinsa-sky"
        >
          {service.eyebrow}
        </ShadcnBadge>
        <h3 className="mt-5 max-w-xl text-xl font-black leading-tight tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          {service.title}
        </h3>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="max-w-xl text-base leading-7 text-muted-foreground">
          {service.description}
        </p>
      </CardContent>
      <CardFooter className="relative z-10 mt-auto border-t border-border/70 pt-5 text-sm font-bold leading-6 text-foreground">
        {service.detail}
      </CardFooter>
    </ShadcnCard>
  );
}
