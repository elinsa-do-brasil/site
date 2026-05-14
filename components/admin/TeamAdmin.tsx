"use client";

import { ArrowLeft, Save, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { TeamInviteDialog } from "@/components/admin/TeamInviteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  atualizarFuncaoMembro,
  atualizarTimeOrganizacao,
  cancelarConviteAdmin,
  removerMembroDoTime,
  removerTimeOrganizacao,
} from "@/lib/organization/actions";
import { formatOrganizationRole } from "@/lib/organization/constants";

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
};

type TeamMemberRow = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  expiresAt: string | null;
};

type TeamAdminProps = {
  invitations: InvitationRow[];
  isOrgAdmin: boolean;
  members: TeamMemberRow[];
  registeredUsers: RegisteredUser[];
  roleOptions: string[];
  team: {
    id: string;
    name: string;
  };
};

type ActionResult = {
  error?: string;
  success?: boolean;
};

export function TeamAdmin({
  invitations,
  isOrgAdmin,
  members,
  registeredUsers,
  roleOptions,
  team,
}: TeamAdminProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const teamName = formatTeamName(team.name);

  function submitForm(
    action: (formData: FormData) => Promise<ActionResult>,
    successMessage: string,
    options?: { redirectToTeamFromName?: boolean; refresh?: boolean },
  ) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      startTransition(async () => {
        const result = await action(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success(successMessage);
        if (options?.redirectToTeamFromName) {
          const nextName = normalizeTeamSlug(formData.get("name")?.toString());
          router.replace(
            `/portal/gestao/equipes/${encodeURIComponent(nextName)}`,
          );
        } else if (options?.refresh) {
          router.refresh();
        }
      });
    };
  }

  function runAction(
    action: () => Promise<ActionResult>,
    successMessage: string,
    options?: { redirectToTeams?: boolean },
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(successMessage);
      if (options?.redirectToTeams) {
        router.push("/portal/gestao/equipes");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/portal/gestao/equipes">
              <ArrowLeft className="size-4" />
              Equipes
            </Link>
          </Button>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{teamName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Adicione, remova e revise os membros desta equipe.
          </p>
        </div>
        <TeamInviteDialog
          isOrgAdmin={isOrgAdmin}
          registeredUsers={registeredUsers}
          roleOptions={roleOptions}
          team={team}
          trigger={
            <Button type="button">
              <UserPlus className="size-4" />
              Adicionar ou convidar
            </Button>
          }
        />
      </div>

      {isOrgAdmin && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Editar equipe</CardTitle>
            <CardDescription>
              Ajuste o nome usado nas rotas e cards administrativos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <form
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
              onSubmit={submitForm(
                atualizarTimeOrganizacao,
                "Equipe atualizada.",
                { redirectToTeamFromName: true },
              )}
            >
              <input name="teamId" type="hidden" value={team.id} />
              <Field>
                <FieldLabel htmlFor="team-name">Nome da equipe</FieldLabel>
                <Input
                  id="team-name"
                  name="name"
                  required
                  defaultValue={team.name}
                />
              </Field>
              <Button className="self-end" disabled={isPending} type="submit">
                <Save className="size-4" />
                Salvar
              </Button>
            </form>

            <Button
              className="self-end"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm(`Excluir a equipe ${teamName}?`)) return;
                runAction(
                  () => removerTimeOrganizacao(team.id),
                  "Equipe excluída.",
                  {
                    redirectToTeams: true,
                  },
                );
              }}
              type="button"
              variant="destructive"
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>
            Funções são da organização; o vínculo com a equipe controla o acesso
            aos recursos da equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função na organização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell className="min-w-60">
                    {isOrgAdmin ? (
                      <form
                        className="flex gap-2"
                        onSubmit={submitForm(
                          atualizarFuncaoMembro,
                          "Função atualizada.",
                          { refresh: true },
                        )}
                      >
                        <input
                          name="memberId"
                          type="hidden"
                          value={member.memberId}
                        />
                        <RoleSelect
                          currentRole={member.role}
                          label={`Função de ${member.email}`}
                          roles={roleOptions}
                        />
                        <Button
                          disabled={isPending}
                          size="sm"
                          type="submit"
                          variant="secondary"
                        >
                          Salvar
                        </Button>
                      </form>
                    ) : (
                      <Badge variant="outline">
                        {formatOrganizationRole(member.role)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <form
                      onSubmit={submitForm(
                        removerMembroDoTime,
                        "Membro removido da equipe.",
                        { refresh: true },
                      )}
                    >
                      <input name="teamId" type="hidden" value={team.id} />
                      <input
                        name="userId"
                        type="hidden"
                        value={member.userId}
                      />
                      <Button
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                        size="sm"
                        type="submit"
                        variant="ghost"
                      >
                        Remover
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell
                    className="py-10 text-center text-muted-foreground"
                    colSpan={3}
                  >
                    Esta equipe ainda não tem membros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Convites pendentes</CardTitle>
          <CardDescription>
            Convites aceitos vinculam a pessoa à organização e a esta equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>{formatOrganizationRole(invite.role)}</TableCell>
                  <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          () => cancelarConviteAdmin(invite.id),
                          "Convite revogado.",
                        )
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Revogar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell
                    className="py-10 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    Nenhum convite pendente para esta equipe.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatTeamName(value: string) {
  return value.replace(/_/g, " ");
}

function RoleSelect({
  currentRole,
  label,
  roles,
}: {
  currentRole: string;
  label: string;
  roles: string[];
}) {
  const options = Array.from(new Set([currentRole, ...roles]));

  return (
    <Select name="role" defaultValue={currentRole}>
      <SelectTrigger aria-label={label} className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((role) => (
          <SelectItem key={role} value={role}>
            {formatOrganizationRole(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function normalizeTeamSlug(value?: string) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}
