"use client";

import { ExternalLink, LayoutGrid, Pencil, Plus } from "lucide-react";
import { DynamicIcon, type IconName, iconNames } from "lucide-react/dynamic";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { formatAdminName } from "@/components/admin/GestaoPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  excluirFerramentaTime,
  salvarFerramentaTime,
} from "@/lib/organization/actions";

type ToolRow = {
  id: string;
  slug: string;
  label: string;
  description: string;
  href: string;
  icon: string | null;
  isActive: boolean;
};

type TeamToolsRow = {
  id: string;
  name: string;
  tools: ToolRow[];
};

type FerramentasTeamAdminProps = {
  teams: TeamToolsRow[];
};

export function FerramentasTeamAdmin({ teams }: FerramentasTeamAdminProps) {
  if (teams.length === 0) {
    return (
      <Card className="rounded-md border-dashed">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma equipe disponível para administração de ferramentas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      {teams.map((team) => (
        <TeamToolsCard key={team.id} team={team} />
      ))}
    </div>
  );
}

function TeamToolsCard({ team }: { team: TeamToolsRow }) {
  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>{formatAdminName(team.name)}</CardTitle>
        <CardDescription>
          Cards exibidos no portal para membros desta equipe.
        </CardDescription>
        <CardAction>
          <ToolDialog
            team={team}
            trigger={
              <Button type="button" size="sm">
                <Plus data-icon="inline-start" />
                Nova ferramenta
              </Button>
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        {team.tools.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {team.tools.map((tool) => (
              <ToolItem key={tool.id} team={team} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhuma ferramenta configurada para esta equipe.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToolItem({ team, tool }: { team: TeamToolsRow; tool: ToolRow }) {
  const router = useRouter();
  const isExternal = tool.href.startsWith("https://");

  return (
    <div className="overflow-hidden rounded-md border bg-card/80 shadow-sm">
      <div className="flex min-h-32 items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-elinsa-primary/15 bg-elinsa-primary/10 text-elinsa-primary">
          <ToolPreviewIcon tool={tool} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-tight">{tool.label}</p>
            <Badge
              className="h-5 px-1.5 text-[0.68rem]"
              variant={tool.isActive ? "default" : "outline"}
            >
              {tool.isActive ? "Ativa" : "Oculta"}
            </Badge>
            {tool.icon && (
              <Badge
                className="h-5 max-w-full truncate px-1.5 font-mono text-[0.68rem]"
                variant="outline"
              >
                {tool.icon}
              </Badge>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          className="inline-flex min-w-0 items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground"
          href={tool.href}
          rel={isExternal ? "noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          <ExternalLink data-icon="inline-start" />
          <span className="truncate">{tool.href}</span>
        </a>
        <div className="flex shrink-0 gap-2">
          <ToolDialog
            team={team}
            tool={tool}
            trigger={
              <Button size="sm" type="button" variant="outline">
                <Pencil data-icon="inline-start" />
                Editar
              </Button>
            }
          />
          <ConfirmActionDialog
            action={() => excluirFerramentaTime(tool.id)}
            confirmLabel="Excluir ferramenta"
            description={`A ferramenta ${tool.label} deixará de aparecer no portal desta equipe.`}
            onSuccess={() => router.refresh()}
            successMessage="Ferramenta excluída."
            title="Excluir ferramenta?"
            trigger={
              <Button size="sm" type="button" variant="destructive">
                Excluir
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}

function ToolPreviewIcon({ tool }: { tool: ToolRow }) {
  const iconName = tool.icon ? toDynamicIconName(tool.icon) : null;

  if (!iconName) {
    return <LayoutGrid aria-hidden="true" className="size-5" />;
  }

  return (
    <DynamicIcon
      aria-hidden="true"
      className="size-5"
      fallback={() => <LayoutGrid aria-hidden="true" className="size-5" />}
      name={iconName}
    />
  );
}

function toDynamicIconName(componentName: string): IconName | null {
  const name = componentName
    .trim()
    .replace(/Icon$/, "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

  return iconNames.includes(name as IconName) ? (name as IconName) : null;
}

function ToolDialog({
  team,
  tool,
  trigger,
}: {
  team: TeamToolsRow;
  tool?: ToolRow;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(tool);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await salvarFerramentaTime(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing ? "Ferramenta atualizada." : "Ferramenta criada.",
      );
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar ferramenta" : "Nova ferramenta"}
          </DialogTitle>
          <DialogDescription>
            Configure o card exibido para a equipe {formatAdminName(team.name)}.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="teamId"
            type="hidden"
            defaultValue={team.id}
            style={{ caretColor: "transparent" }}
            suppressHydrationWarning
          />
          {tool && (
            <input
              name="toolId"
              type="hidden"
              defaultValue={tool.id}
              style={{ caretColor: "transparent" }}
              suppressHydrationWarning
            />
          )}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${team.id}-${tool?.id ?? "new"}-slug`}>
                Identificador
              </FieldLabel>
              <Input
                id={`${team.id}-${tool?.id ?? "new"}-slug`}
                name="slug"
                placeholder="painel_financeiro"
                defaultValue={tool?.slug}
                required
              />
              <FieldDescription>
                Usado internamente para ordenar e reconhecer o card.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${team.id}-${tool?.id ?? "new"}-label`}>
                Título
              </FieldLabel>
              <Input
                id={`${team.id}-${tool?.id ?? "new"}-label`}
                name="label"
                placeholder="Painel financeiro"
                defaultValue={tool?.label}
                required
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor={`${team.id}-${tool?.id ?? "new"}-description`}
              >
                Descrição
              </FieldLabel>
              <Textarea
                id={`${team.id}-${tool?.id ?? "new"}-description`}
                name="description"
                defaultValue={tool?.description}
                rows={3}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${team.id}-${tool?.id ?? "new"}-href`}>
                Link
              </FieldLabel>
              <Input
                id={`${team.id}-${tool?.id ?? "new"}-href`}
                name="href"
                placeholder="/portal/..."
                defaultValue={tool?.href}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${team.id}-${tool?.id ?? "new"}-icon`}>
                Ícone Lucide
              </FieldLabel>
              <Input
                id={`${team.id}-${tool?.id ?? "new"}-icon`}
                name="icon"
                placeholder="ShieldCheck"
                defaultValue={tool?.icon ?? ""}
              />
              <FieldDescription>
                Copie o component name em{" "}
                <a
                  className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:text-elinsa-primary"
                  href="https://lucide.dev/icons/"
                  rel="noreferrer"
                  target="_blank"
                >
                  lucide.dev/icons
                  <ExternalLink className="size-3" />
                </a>
                . Exemplos: ShieldCheck, Mail, PanelsTopLeft.
              </FieldDescription>
            </Field>
            <label
              className="flex items-center gap-2 text-sm"
              htmlFor={`${team.id}-${tool?.id ?? "new"}-active`}
            >
              <Checkbox
                id={`${team.id}-${tool?.id ?? "new"}-active`}
                name="isActive"
                defaultChecked={tool?.isActive ?? true}
              />
              Exibir no portal
            </label>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Spinner />
              ) : isEditing ? (
                "Salvar ferramenta"
              ) : (
                "Criar ferramenta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
