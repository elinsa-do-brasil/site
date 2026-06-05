import { Factory } from "lucide-react";
import { Badge } from "@/components/badge";
import { GalleryCard } from "@/components/gallery-card";
import { CardContent, Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { services } from "./home-data";

export function OperationSection() {
  return (
    <section className="min-h-dvh overflow-hidden bg-muted/25 px-6 py-14 md:px-8 lg:py-20">
      <div className="mx-auto grid h-full max-w-6xl gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <GalleryCard />

        <div className="flex flex-col justify-center gap-5 lg:min-h-0">
          <div>
            <Badge text="Como a operação acontece" icon={Factory} />

            <h2 className="max-w-3xl text-3xl font-extrabold tracking-normal md:text-4xl">
              Planejamento, mobilização e execução alinhados
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Cada frente mobilizada sai com escopo definido, equipe alinhada,
              materiais previstos e janela de atendimento organizada. O retorno
              de campo alimenta as próximas decisões operacionais.
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
  );
}
