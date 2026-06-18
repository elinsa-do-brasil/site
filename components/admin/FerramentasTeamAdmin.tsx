"use client";

import { ExternalLink, Pencil, Plus } from "lucide-react";
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

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{tool.label}</p>
            <Badge variant={tool.isActive ? "default" : "outline"}>
              {tool.isActive ? "Ativa" : "Oculta"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <a
          className="inline-flex min-w-0 items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
          href={tool.href}
        >
          <ExternalLink data-icon="inline-start" />
          <span className="truncate">{tool.href}</span>
        </a>
        <div className="flex gap-2">
          <ToolDialog
            team={team}
            tool={tool}
            trigger={
              <Button type="button" variant="outline">
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
              <Button type="button" variant="destructive">
                Excluir
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
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
