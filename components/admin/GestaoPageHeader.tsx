import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  title: string;
};

export function GestaoPageHeader({
  actions,
  active,
  description,
  eyebrow = "Gestão do portal",
  title,
}: GestaoPageHeaderProps) {
  return (
    <header className="mb-6 border-b pb-5">
      <nav
        aria-label="Administração do portal"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal">Voltar ao portal</Link>
        </Button>
        {GESTAO_NAV.map((item) => (
          <Button
            aria-current={item.id === active ? "page" : undefined}
            key={item.id}
            variant={item.id === active ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions && (
          <div className={cn("flex flex-wrap gap-2 sm:justify-end")}>
            {actions}
          </div>
        )}
      </div>
    </header>
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
