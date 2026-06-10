import { Card, CardContent } from "@/components/ui/card";
import WorldMap from "@/components/ui/world-map";
import { aboutIcons, highlightedCountries } from "./about-data";
import { AboutSection, AboutSectionIntro } from "./about-section";

/** Connects ELINSA's Spanish industrial base to the Brazilian operation. */
export function AboutPresenceSection() {
  return (
    <AboutSection
      headingId="presenca-heading"
      containerClassName="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
    >
      <AboutSectionIntro
        badge="Presença internacional"
        headingId="presenca-heading"
        icon={aboutIcons.earth}
        title="Da Galícia à Amazônia, com padrão técnico comum."
        description={
          <>
            A matriz espanhola concentra engenharia, fabricação e experiência
            industrial acumulada. No Brasil, essa base vira operação, manutenção
            e execução técnica para frentes de energia.
          </>
        }
        className="lg:grid-cols-1"
      />

      <Card className="rounded-xl border border-border/70 bg-card py-0 text-foreground shadow-sm shadow-elinsa-dark/5 ring-1 ring-border/60 dark:bg-card/80 dark:ring-border/40">
        <CardContent className="p-3 md:p-4">
          <WorldMap
            fadeEdges={false}
            highlights={highlightedCountries}
            lineColor="#24a3dd"
          />
        </CardContent>
      </Card>
    </AboutSection>
  );
}
