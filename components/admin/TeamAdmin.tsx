"use client";

import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
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
import { Spinner } from "@/components/ui/spinner";
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
import {
  ETHICS_COMMITTEE_ROLE,
  ETHICS_COMMITTEE_TEAM,
  formatOrganizationRole,
  parseOrganizationRoleList,
} from "@/lib/organization/constants";

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

  return (
    <div className="flex flex-col gap-5">
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
              <input
                name="teamId"
                type="hidden"
                defaultValue={team.id}
                style={{ caretColor: "transparent" }}
                suppressHydrationWarning
              />
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
                {isPending ? (
                  <Spinner />
                ) : (
                  <>
                    <Save data-icon="inline-start" />
                    Salvar
                  </>
                )}
              </Button>
            </form>

            <div className="self-end">
              <ConfirmActionDialog
                action={() => removerTimeOrganizacao(team.id)}
                confirmLabel="Excluir equipe"
                description={`A equipe ${teamName} será removida. Os usuários continuam na organização.`}
                onSuccess={() => router.push("/portal/gestao/equipes")}
                successMessage="Equipe excluída."
                title="Excluir equipe?"
                trigger={
                  <Button type="button" variant="destructive">
                    <Trash2 data-icon="inline-start" />
                    Excluir
                  </Button>
                }
              />
            </div>
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
                          defaultValue={member.memberId}
                          style={{ caretColor: "transparent" }}
                          suppressHydrationWarning
                        />
                        <RoleSelect
                          currentRole={member.role}
                          disabledRoles={
                            team.name === ETHICS_COMMITTEE_TEAM
                              ? undefined
                              : [ETHICS_COMMITTEE_ROLE]
                          }
                          label={`Função de ${member.email}`}
                          roles={roleOptions}
                        />
                        <Button
                          disabled={isPending}
                          size="sm"
                          type="submit"
                          variant="secondary"
                        >
                          {isPending ? <Spinner /> : "Salvar"}
                        </Button>
                      </form>
                    ) : (
                      <Badge variant="outline">
                        {formatOrganizationRole(member.role)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmActionDialog
                      action={() => {
                        const formData = new FormData();
                        formData.set("teamId", team.id);
                        formData.set("userId", member.userId);
                        return removerMembroDoTime(formData);
                      }}
                      confirmLabel="Remover da equipe"
                      description={`${member.name} perderá o acesso às ferramentas desta equipe.`}
                      onSuccess={() => router.refresh()}
                      successMessage="Membro removido da equipe."
                      title="Remover membro da equipe?"
                      trigger={
                        <Button size="sm" type="button" variant="destructive">
                          Remover
                        </Button>
                      }
                    />
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
                    <ConfirmActionDialog
                      action={() => cancelarConviteAdmin(invite.id)}
                      confirmLabel="Revogar convite"
                      description={`O convite enviado para ${invite.email} deixará de funcionar imediatamente.`}
                      onSuccess={() => router.refresh()}
                      successMessage="Convite revogado."
                      title="Revogar convite?"
                      trigger={
                        <Button size="sm" type="button" variant="destructive">
                          Revogar
                        </Button>
                      }
                    />
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
  disabledRoles = [],
  label,
  roles,
}: {
  currentRole: string;
  disabledRoles?: string[];
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
        {options.map((role) => {
          const isDisabled = disabledRoles.some((disabledRole) =>
            parseOrganizationRoleList(role).includes(disabledRole),
          );

          return (
            <SelectItem disabled={isDisabled} key={role} value={role}>
              {formatOrganizationRole(role)}
              {isDisabled
                ? ` (exige equipe ${formatTeamName(ETHICS_COMMITTEE_TEAM)})`
                : ""}
            </SelectItem>
          );
        })}
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
