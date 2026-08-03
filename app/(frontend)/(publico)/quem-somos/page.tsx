import { AboutFinalCtaSection } from "@/components/about/about-final-cta-section";
import { AboutHeroSection } from "@/components/about/about-hero-section";
import { AboutPillarsSection } from "@/components/about/about-pillars-section";
import { AboutPresenceSection } from "@/components/about/about-presence-section";
import { AboutTimelineSection } from "@/components/about/about-timeline-section";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Quem somos",
  description:
    "Conheça a trajetória, as bases regionais, os valores e a atuação da Elinsa do Brasil em infraestrutura elétrica no Pará.",
  path: "/quem-somos",
});

export default function QuemSomos() {
  return (
    <div className="bg-background text-foreground">
      <AboutHeroSection />
      <AboutPresenceSection />
      <AboutPillarsSection />
      <AboutTimelineSection />
      <AboutFinalCtaSection />
    </div>
  );
}
