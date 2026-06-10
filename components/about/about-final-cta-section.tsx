import { ArrowRight, Newspaper } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AboutSection } from "./about-section";

/** Gives visitors practical next steps after learning who Elinsa is. */
export function AboutFinalCtaSection() {
  return (
    <AboutSection
      headingId="about-final-cta-heading"
      tone="dark"
      className="border-t border-border py-14 lg:py-16"
      containerClassName="grid gap-8 md:grid-cols-[1fr_auto] md:items-center"
    >
      <div>
        <h2
          id="about-final-cta-heading"
          className="text-3xl font-black leading-tight tracking-normal md:text-4xl"
        >
          Engenharia elétrica para operações que não podem parar.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-white/78">
          A Elinsa do Brasil atua com foco empresarial em infraestrutura, obras,
          manutenção e suporte técnico para frentes de energia.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
        <Button
          size="xl"
          className="bg-white text-elinsa-dark hover:bg-elinsa-light"
          asChild
        >
          <Link href="/contato">
            Solicitar contato
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
          asChild
        >
          <Link href="/imprensa">
            Acompanhar notícias
            <Newspaper aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </AboutSection>
  );
}
