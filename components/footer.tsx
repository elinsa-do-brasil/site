"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Logo } from "./logo";

const sitemapLinks = [
  { href: "/", label: "Início" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/vagas", label: "Vagas" },
  { href: "/mapas", label: "Mapas regionais" },
  { href: "/portal/blog", label: "Blog interno" },
  { href: "/imprensa", label: "Imprensa" },
  { href: "/licencas", label: "Licenças" },
];

const internalLinks = [
  { href: "/portal", label: "Portal Interno" },
  { href: "/payload", label: "Payload CMS" },
];

const legalLinks = [
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/elinsadobrasil/",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "https://www.linkedin.com/in/elinsadobrasil/",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/mapas")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-background px-6 py-12 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr_0.8fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">
            Infraestrutura elétrica, manutenção e obras complexas para frentes
            do Grupo Equatorial Energia.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-elinsa-primary hover:text-elinsa-primary"
              >
                <social.icon className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Mapa do site">
          <h2 className="font-bold">Mapa do site</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {sitemapLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-elinsa-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Acesso interno">
          <h2 className="font-bold">Acesso interno</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {internalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-elinsa-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informações legais">
          <h2 className="font-bold">Legal</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-elinsa-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-bold">Contato</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li>
              <a
                href="mailto:comercial@elinsa.com.br"
                className="transition-colors hover:text-elinsa-primary"
              >
                comercial@elinsa.com.br
              </a>
            </li>
            <li>Belém, Pará - Brasil</li>
            <li>Atendimento empresarial</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
