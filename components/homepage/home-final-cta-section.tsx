import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Button } from "@/components/ui/button";
import { HomeSection } from "./home-section";

/** Closes the landing-page flow with clear institutional next steps. */
export function HomeFinalCtaSection() {
  return (
    <HomeSection
      headingId="home-final-cta-heading"
      tone="muted"
      className="py-14 lg:py-16"
      containerClassName="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
    >
      <div className="max-w-3xl">
        <SectionEyebrow
          className="mb-5"
          text="Próximo passo"
          icon={MessageCircle}
          variant="line"
        />
        <h2
          id="home-final-cta-heading"
          className="text-3xl font-extrabold leading-tight tracking-normal md:text-4xl"
        >
          Precisa falar com a Elinsa?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          Encaminhe uma demanda institucional, conheça melhor a operação ou
          acesse o canal correto para relatar uma situação com segurança.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
        <Button
          size="xl"
          className="bg-elinsa-primary text-white hover:bg-elinsa-dark"
          asChild
        >
          <Link href="/contato">
            Falar com a Elinsa
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
        <Button variant="outline" size="xl" className="bg-card" asChild>
          <Link href="/denunciar">
            Acessar canal de denúncias
            <ShieldCheck aria-hidden="true" data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </HomeSection>
  );
}
