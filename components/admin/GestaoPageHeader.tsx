import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { Button } from "@/components/ui/button";

type GestaoSection = "organizacao" | "convites" | "equipes" | "ferramentas";

const GESTAO_NAV: Array<{
  href: string;
  id: GestaoSection;
  label: string;
}> = [
  {
    href: "/portal/gestao/organizacao",
    id: "organizacao",
    label: "Organização",
  },
  {
    href: "/portal/gestao/convites",
    id: "convites",
    label: "Convites",
  },
  {
    href: "/portal/gestao/equipes",
    id: "equipes",
    label: "Equipes",
  },
  {
    href: "/portal/gestao/ferramentas",
    id: "ferramentas",
    label: "Ferramentas",
  },
];

type GestaoPageHeaderProps = {
  actions?: ReactNode;
  active: GestaoSection;
  description: string;
  eyebrow?: string;
  isOrgAdmin: boolean;
  title: string;
};

export function GestaoPageHeader({
  actions,
  active,
  description,
  eyebrow = "Gestão do portal",
  isOrgAdmin,
  title,
}: GestaoPageHeaderProps) {
  const availableSections = isOrgAdmin
    ? GESTAO_NAV
    : GESTAO_NAV.filter(
        (item) => item.id === "equipes" || item.id === "ferramentas",
      );

  return (
    <PageHeader
      actions={actions}
      description={description}
      eyebrow={eyebrow}
      navigation={
        <PageHeaderNavigation label="Administração do portal">
          <Button
            className="order-0 shrink-0"
            size="sm"
            variant="outline"
            asChild
          >
            <Link href="/portal" transitionTypes={["nav-back"]}>
              Voltar ao portal
            </Link>
          </Button>
          {availableSections.map((item) => (
            <Button
              aria-current={item.id === active ? "page" : undefined}
              className={
                item.id === active
                  ? "order-1 shrink-0 md:order-none"
                  : "order-2 shrink-0 md:order-none"
              }
              key={item.id}
              size="sm"
              variant={item.id === active ? "default" : "ghost"}
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </PageHeaderNavigation>
      }
      title={title}
    />
  );
}

export function formatAdminName(value: string) {
  const normalized = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return value;
  }

  const knownWords: Record<string, string> = {
    cms: "CMS",
    comite: "Comitê",
    etica: "Ética",
    ti: "TI",
  };

  return normalized
    .split(" ")
    .map((word) => {
      const known = knownWords[word.toLocaleLowerCase("pt-BR")];

      if (known) {
        return known;
      }

      return (
        word.charAt(0).toLocaleUpperCase("pt-BR") +
        word.slice(1).toLocaleLowerCase("pt-BR")
      );
    })
    .join(" ");
}
