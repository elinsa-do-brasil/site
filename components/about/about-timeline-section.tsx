import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AboutMilestone, aboutIcons, aboutMilestones } from "./about-data";
import { AboutSection, AboutSectionIntro } from "./about-section";

/** Presents the company timeline as a scannable sequence of milestones. */
export function AboutTimelineSection() {
  return (
    <AboutSection id="trajetoria" headingId="trajetoria-heading">
      <AboutSectionIntro
        badge="Trajetória"
        headingId="trajetoria-heading"
        icon={aboutIcons.calendar}
        title="Crescimento construído etapa por etapa."
        aside={
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            A história da ELINSA é marcada por expansão industrial,
            especialização técnica e presença internacional, sem perder o foco
            em qualidade e seriedade.
          </p>
        }
      />

      <ol className="mt-10 grid list-none gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aboutMilestones.map((milestone) => (
          <li key={`${milestone.year}-${milestone.title}`}>
            <MilestoneCard milestone={milestone} />
          </li>
        ))}
      </ol>
    </AboutSection>
  );
}

function MilestoneCard({ milestone }: { milestone: AboutMilestone }) {
  return (
    <Card className="h-full rounded-xl border-border bg-card py-0 text-foreground shadow-sm ring-0">
      <CardHeader className="p-6 pb-0">
        <p className="text-sm font-black text-elinsa-primary">
          {milestone.year}
        </p>
        <CardTitle className="mt-3 text-2xl font-bold tracking-normal">
          {milestone.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <p className="leading-7 text-muted-foreground">
          {milestone.description}
        </p>
      </CardContent>
    </Card>
  );
}
