import { BriefcaseBusiness, Wrench, Zap } from "lucide-react";
import { Badge } from "@/components/badge";
import { CardContent, Card as ShadcnCard } from "@/components/ui/card";

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

export function ProvidedServicesSection() {
  return (
    <section
      id="servicos"
      aria-labelledby="servicos-heading"
      className="overflow-hidden bg-background px-6 py-20 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <article className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-sm md:p-6 lg:p-8">
          <Zap
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-7 hidden size-40 rotate-6 text-elinsa-primary/5 md:block lg:right-10 lg:top-8 lg:size-48 dark:text-elinsa-sky/5"
            strokeWidth={1.2}
          />
          <header className="relative z-10 border-b border-border/70 pb-7">
            <div className="max-w-4xl">
              <Badge text="Serviços que prestamos" icon={BriefcaseBusiness} />

              <h2
                id="servicos-heading"
                className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-normal md:text-4xl"
              >
                Serviços técnicos e comerciais para a energia chegar melhor
              </h2>
            </div>
          </header>

          <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-2 lg:mt-6 lg:grid-cols-3 lg:gap-4">
            {providedServices.map((service) => (
              <ProvidedServiceCard key={service.id} service={service} />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function ProvidedServiceCard({ service }: { service: ProvidedService }) {
  return (
    <ShadcnCard className="relative min-h-64 border-border/70 bg-muted/25 py-0 shadow-none transition duration-300 hover:-translate-y-1 hover:border-elinsa-primary/40 hover:bg-elinsa-light/35 dark:bg-background/35 dark:hover:bg-elinsa-primary/10">
      <CardContent className="relative z-10 flex h-full flex-col p-5 md:p-6">
        <div className="inline-flex w-fit items-center rounded-full border border-elinsa-primary/20 bg-elinsa-light/65 px-3 py-1.5 text-xs font-black uppercase leading-4 tracking-[0.14em] text-elinsa-primary dark:bg-elinsa-primary/10 dark:text-elinsa-sky">
          {service.eyebrow}
        </div>

        <h3 className="mt-7 max-w-xl text-xl font-black leading-tight tracking-normal text-elinsa-dark dark:text-elinsa-sky">
          {service.title}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {service.description}
        </p>

        <p className="mt-auto border-t border-border/70 pt-5 text-sm font-bold leading-6 text-foreground">
          {service.detail}
        </p>
      </CardContent>
    </ShadcnCard>
  );
}
