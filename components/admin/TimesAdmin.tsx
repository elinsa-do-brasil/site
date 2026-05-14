"use client";

import { Pencil, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TeamInviteDialog } from "@/components/admin/TeamInviteDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { criarTimeOrganizacao } from "@/lib/organization/actions";

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
};

type TeamCardRow = {
  id: string;
  name: string;
  memberCount: number;
  pendingInvitationCount: number;
};

type TimesAdminProps = {
  isOrgAdmin: boolean;
  registeredUsers: RegisteredUser[];
  roleOptions: string[];
  teams: TeamCardRow[];
};

type ActionResult = {
  error?: string;
  success?: boolean;
};

export function TimesAdmin({
  isOrgAdmin,
  registeredUsers,
  roleOptions,
  teams,
}: TimesAdminProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Administração de equipes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie membros e convites a partir do card de cada equipe.
          </p>
        </div>
        {isOrgAdmin && <CreateTeamDialog />}
      </div>

      {teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              isOrgAdmin={isOrgAdmin}
              key={team.id}
              registeredUsers={registeredUsers}
              roleOptions={roleOptions}
              team={team}
            />
          ))}
        </div>
      ) : (
        <Card className="rounded-md border-dashed py-10">
          <CardContent className="text-center text-sm text-muted-foreground">
            Nenhuma equipe disponível para administração.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeamCard({
  isOrgAdmin,
  registeredUsers,
  roleOptions,
  team,
}: {
  isOrgAdmin: boolean;
  registeredUsers: RegisteredUser[];
  roleOptions: string[];
  team: TeamCardRow;
}) {
  const teamName = formatTeamName(team.name);
  const href = `/portal/gestao/equipes/${encodeURIComponent(team.name)}`;

  return (
    <Card className="min-h-52 rounded-md border-border/80 bg-card py-0 shadow-sm transition hover:border-elinsa-primary/40">
      <CardHeader className="gap-4 py-5">
        <CardTitle className="text-xl tracking-tight">{teamName}</CardTitle>
        <CardDescription>
          Administração de membros e convites da equipe.
        </CardDescription>
        <CardAction>
          <Button aria-label={`Editar ${teamName}`} asChild size="icon-lg">
            <Link href={href}>
              <Pencil className="size-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="mt-auto space-y-5 pb-5">
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Membros</dt>
            <dd className="font-medium">{team.memberCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Convites pendentes</dt>
            <dd className="font-medium">{team.pendingInvitationCount}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2">
          <TeamInviteDialog
            isOrgAdmin={isOrgAdmin}
            registeredUsers={registeredUsers}
            roleOptions={roleOptions}
            team={team}
            trigger={
              <Button type="button" variant="secondary">
                <UserPlus className="size-4" />
                Convidar
              </Button>
            }
          />
          <Button asChild type="button" variant="outline">
            <Link href={href}>Administrar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateTeamDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result: ActionResult = await criarTimeOrganizacao(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Equipe criada.");
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          Nova equipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova equipe</DialogTitle>
          <DialogDescription>
            Crie uma equipe para agrupar membros e ferramentas do portal.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-team-name">Nome da equipe</FieldLabel>
              <Input id="new-team-name" name="name" placeholder="ti" required />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button disabled={isPending} type="submit">
              Criar equipe
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatTeamName(value: string) {
  return value.replace(/_/g, " ");
}
