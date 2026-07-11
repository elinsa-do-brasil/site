import { FooterBrand } from "@/components/footer/footer-brand";
import { footerLinkGroups } from "@/components/footer/footer-data";
import { FooterLegalBar } from "@/components/footer/footer-legal-bar";
import { FooterLinkGroup } from "@/components/footer/footer-link-group";
import { HeroImageCopyright } from "./hero-image-copyright";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-background pt-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.95fr)]">
          <FooterBrand />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerLinkGroups.map((group) => (
              <FooterLinkGroup group={group} key={group.title} />
            ))}
          </div>
        </div>

        <HeroImageCopyright />
        <div aria-hidden="true" className="h-px w-full bg-border" />
        <FooterLegalBar />
      </div>
    </footer>
  );
}
