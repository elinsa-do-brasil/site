import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AboutPillar, aboutIcons, aboutPillars } from "./about-data";
import { AboutSection, AboutSectionIntro } from "./about-section";

/** Explains the operating strengths behind the institutional narrative. */
export function AboutPillarsSection() {
  return (
    <AboutSection
      headingId="pilares-heading"
      tone="muted"
      className="border-y border-border"
    >
      <AboutSectionIntro
        badge="O que nos move"
        headingId="pilares-heading"
        icon={aboutIcons.building}
        title="Técnica, pessoas e previsibilidade operacional."
        aside={
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            A Elinsa se consolidou em setores exigentes como energia, naval,
            indústria e serviços por combinar fabricação própria, engenharia
            aplicada e execução próxima do cliente.
          </p>
        }
      />

      <ul className="mt-10 grid list-none gap-4 md:grid-cols-2 lg:grid-cols-4">
        {aboutPillars.map((pillar) => (
          <li key={pillar.title}>
            <PillarCard pillar={pillar} />
          </li>
        ))}
      </ul>
    </AboutSection>
  );
}

function PillarCard({ pillar }: { pillar: AboutPillar }) {
  return (
    <Card className="relative h-full rounded-xl border border-border/70 bg-card py-0 text-foreground shadow-sm shadow-elinsa-dark/5 ring-1 ring-border/60 transition-colors hover:border-elinsa-primary/45 hover:bg-elinsa-light/45 dark:bg-card/80 dark:ring-border/40 dark:hover:bg-elinsa-primary/10">
      <div className="pointer-events-none absolute right-4 top-4 size-12 rounded-full bg-elinsa-primary/8 dark:bg-elinsa-primary/10" />
      <CardHeader className="relative z-10 p-6 pb-0">
        <div className="mb-6 flex size-11 items-center justify-center rounded-md bg-elinsa-light text-elinsa-dark dark:bg-elinsa-primary/10 dark:text-elinsa-sky">
          <pillar.icon aria-hidden="true" className="size-5" />
        </div>
        <CardTitle className="text-xl font-bold tracking-normal">
          {pillar.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-6 pt-3">
        <p className="leading-7 text-muted-foreground">{pillar.description}</p>
      </CardContent>
    </Card>
  );
}
