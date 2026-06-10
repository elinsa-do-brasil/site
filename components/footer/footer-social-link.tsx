import { Button } from "@/components/ui/button";
import type { SocialLink } from "./footer-data";

export function FooterSocialLink({ social }: { social: SocialLink }) {
  const Icon = social.icon;

  return (
    <Button
      asChild
      className="size-10 rounded-lg text-muted-foreground hover:border-elinsa-primary hover:text-elinsa-primary"
      size="icon-lg"
      variant="outline"
    >
      <a
        aria-label={`${social.label} da Elinsa do Brasil`}
        href={social.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon aria-hidden="true" className="size-4" />
      </a>
    </Button>
  );
}
