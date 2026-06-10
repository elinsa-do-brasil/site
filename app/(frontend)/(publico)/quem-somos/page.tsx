import type { Metadata } from "next";
import { AboutFinalCtaSection } from "@/components/about/about-final-cta-section";
import { AboutHeroSection } from "@/components/about/about-hero-section";
import { AboutPillarsSection } from "@/components/about/about-pillars-section";
import { AboutPresenceSection } from "@/components/about/about-presence-section";
import { AboutTimelineSection } from "@/components/about/about-timeline-section";

export const metadata: Metadata = {
  title: "Quem somos - Elinsa",
  description:
    "Conheça a trajetória internacional, as bases técnicas e os valores da Elinsa do Brasil.",
};

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
