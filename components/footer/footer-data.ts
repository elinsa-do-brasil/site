import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { getDocsUrl } from "@/lib/docs-url";

export type FooterLink = {
  href: string;
  label: string;
};

export type FooterLinkGroup = {
  ariaLabel: string;
  links: FooterLink[];
  title: string;
};

export type SocialLink = FooterLink & {
  icon: IconType;
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    ariaLabel: "Links institucionais",
    title: "Institucional",
    links: [
      { href: "/", label: "Início" },
      { href: "/quem-somos", label: "Quem somos" },
      { href: "/imprensa", label: "Imprensa" },
      { href: "/marca", label: "Kit de marca" },
    ],
  },
  {
    ariaLabel: "Links de operação",
    title: "Operação",
    links: [
      { href: "/mapas", label: "Mapas regionais" },
      { href: "/vagas", label: "Vagas" },
      { href: "/licencas", label: "Licenças" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    ariaLabel: "Links de apoio e ética",
    title: "Apoio e ética",
    links: [
      { href: getDocsUrl(), label: "Ajuda ao colaborador" },
      {
        href: getDocsUrl("/etica/codigo-de-conduta"),
        label: "Código de conduta",
      },
      { href: "/denunciar", label: "Canal de denúncias" },
      { href: "/acompanhar-denuncia", label: "Acompanhar denúncia" },
    ],
  },
  {
    ariaLabel: "Links internos e legais",
    title: "Acesso e legal",
    links: [
      { href: "/entrar", label: "Entrar" },
      { href: "/portal", label: "Portal interno" },
      { href: "/payload", label: "Payload CMS" },
      { href: "/privacidade", label: "Privacidade" },
      { href: "/termos", label: "Termos de uso" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
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
  {
    href: "https://github.com/elinsa-do-brasil",
    label: "GitHub",
    icon: FaGithub,
  },
];
