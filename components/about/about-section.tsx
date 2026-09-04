// Reexporta o wrapper genérico de seção (components/content-section.tsx) com nomes específicos do domínio "about" — só por legibilidade nos outros arquivos about-*-section.tsx que importam daqui.
export {
  ContentSection as AboutSection,
  ContentSectionIntro as AboutSectionIntro,
} from "@/components/content-section";
