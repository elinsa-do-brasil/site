import { Factory } from "lucide-react";
import { GalleryCard } from "@/components/gallery-card";
import {
  CardContent,
  CardFooter,
  CardHeader,
  Card as ShadcnCard,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { services } from "./home-data";
import { HomeSection, HomeSectionIntro } from "./home-section";

/** Shows how the company turns planning into field execution. */
export function OperationSection() {
  return (
    <HomeSection
      headingId="operacao-heading"
      tone="muted"
      containerClassName="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch"
    >
      <GalleryCard />

      <div className="flex flex-col justify-center gap-6 lg:min-h-0">
        <HomeSectionIntro
          badge="Como a operação acontece"
          headingId="operacao-heading"
          icon={Factory}
          marker="01"
          title="Do planejamento à execução, cada frente tem um caminho claro."
          description={
            <>
              Antes da equipe sair, a Elinsa organiza escopo, materiais,
              segurança e janela de atendimento. Depois, o retorno de campo
              alimenta novas decisões para manter a operação em melhoria
              contínua.
            </>
          }
          variant="sequence"
        />

        <OperationServiceGrid />
      </div>
    </HomeSection>
  );
}

function OperationServiceGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {services.map((service, index) => (
        <OperationServiceCard
          key={service.id}
          index={index}
          service={service}
        />
      ))}
    </div>
  );
}

function OperationServiceCard({
  index,
  service,
}: {
  index: number;
  service: (typeof services)[number];
}) {
  return (
    <ShadcnCard
      className={cn(
        "group relative overflow-hidden rounded-xl border-border bg-card shadow-sm transition-colors hover:border-elinsa-primary/45",
        index === 0 ? "md:col-span-2" : "flex flex-col md:min-h-52",
      )}
    >
      <service.icon
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-7 -top-9 size-32 text-elinsa-primary/10 transition duration-300 group-hover:scale-105 group-hover:text-elinsa-primary/12",
          index === 0 && "md:-right-9 md:-top-12 md:size-40",
        )}
        strokeWidth={1.5}
      />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold tracking-normal">{service.title}</h3>
          <span className="shrink-0 text-sm font-black text-elinsa-primary/55">
            0{index + 1}
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-sm leading-6 text-muted-foreground">
          {service.description}
        </p>
      </CardContent>
      <CardFooter className="relative z-10 mt-auto border-t border-border pt-4 text-sm font-semibold text-elinsa-dark dark:text-elinsa-sky">
        {service.detail}
      </CardFooter>
    </ShadcnCard>
  );
}
