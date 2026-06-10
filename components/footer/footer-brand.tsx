import { Logo } from "@/components/logo";
import { socialLinks } from "./footer-data";
import { FooterSocialLink } from "./footer-social-link";

export function FooterBrand() {
  return (
    <div className="max-w-md">
      <Logo />
      <p className="mt-5 leading-7 text-muted-foreground">
        Engenharia elétrica, automação, manutenção e suporte técnico para
        infraestrutura de energia no Pará, conectando experiência industrial
        espanhola à operação brasileira integrada ao Grupo Amper.
      </p>
      <p className="mt-4 w-fit rounded-full border border-elinsa-primary/20 bg-elinsa-primary/10 px-3 py-1 text-xs font-bold text-elinsa-primary">
        Construindo um futuro melhor
      </p>

      <address className="mt-6 space-y-2 text-sm not-italic text-muted-foreground">
        <p>Belém, Pará - Brasil</p>
        <a
          className="inline-flex transition-colors hover:text-elinsa-primary"
          href="mailto:comercial@elinsa.com.br"
        >
          comercial@elinsa.com.br
        </a>
      </address>

      <div className="mt-6 flex items-center gap-3">
        {socialLinks.map((social) => (
          <FooterSocialLink key={social.href} social={social} />
        ))}
      </div>
    </div>
  );
}
