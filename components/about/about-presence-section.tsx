import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <Card className="rounded-xl border-border bg-card py-0 text-foreground shadow-sm ring-0">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-black uppercase tracking-[0.14em] text-elinsa-primary">
            Conexão técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
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
