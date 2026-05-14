"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { Textarea } from "@/components/ui/textarea";
import {
  adicionarMembroExistente,
  atualizarFuncaoMembro,
  atualizarStatusConviteAdmin,
  cancelarConviteAdmin,
  criarTimeOrganizacao,
  enviarConviteAdmin,
  excluirRoleOrganizacao,
  removerMembroDaOrganizacao,
  salvarRoleOrganizacao,
} from "@/lib/organization/actions";
import {
  formatOrganizationRole,
  INVITATION_STATUS_OPTIONS,
} from "@/lib/organization/constants";

type TeamOption = {
  id: string;
  name: string;
};

type MemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  teams: string[];
  createdAt: string;
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  teamName: string | null;
  createdAt: string;
  expiresAt: string | null;
};

type RoleRow = {
  id: string;
  role: string;
  permission: string;
};

type OrganizacaoAdminProps = {
  members: MemberRow[];
  invitations: InvitationRow[];
  teams: TeamOption[];
  roles: RoleRow[];
  roleOptions: string[];
};

type ActionResult = {
  error?: string;
  success?: boolean;
};

export function OrganizacaoAdmin({
  members,
  invitations,
  teams,
  roles,
  roleOptions,
}: OrganizacaoAdminProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitForm(
    action: (formData: FormData) => Promise<ActionResult>,
    successMessage: string,
    options?: { reset?: boolean },
  ) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      if (formData.get("teamId") === "none") {
        formData.delete("teamId");
      }

      startTransition(async () => {
        const result = await action(formData);
        setMessage(result.error ?? successMessage);
        if (!result.error && options?.reset) {
          form.reset();
        }
      });
    };
  }

  function runAction(
    action: () => Promise<ActionResult>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.error ?? successMessage);
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-md border bg-card px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Novo convite</CardTitle>
            <CardDescription>
              Convide alguém para a organização e opcionalmente para uma equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={submitForm(enviarConviteAdmin, "Convite enviado.", {
                reset: true,
              })}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-email">E-mail</FieldLabel>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    required
                  />
                </Field>
                <RoleSelect id="invite-role" roles={roleOptions} />
                <TeamSelect id="invite-team" teams={teams} />
                <Field>
                  <FieldLabel htmlFor="invite-msg">Mensagem</FieldLabel>
                  <Textarea id="invite-msg" name="mensagem" rows={3} />
                </Field>
                <Button type="submit" disabled={isPending}>
                  Enviar convite
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar existente</CardTitle>
            <CardDescription>
              Vincule uma conta já criada à organização ou a uma equipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={submitForm(
                adicionarMembroExistente,
                "Membro adicionado.",
                { reset: true },
              )}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="member-email">E-mail</FieldLabel>
                  <Input
                    id="member-email"
                    name="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    required
                  />
                </Field>
                <RoleSelect id="member-role" roles={roleOptions} />
                <TeamSelect id="member-team" teams={teams} />
                <Button type="submit" disabled={isPending}>
                  Adicionar membro
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipes e funções</CardTitle>
            <CardDescription>
              Crie novas equipes e funções reutilizáveis no portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={submitForm(criarTimeOrganizacao, "Equipe criada.", {
                reset: true,
              })}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="team-name">Nova equipe</FieldLabel>
                  <Input
                    id="team-name"
                    name="name"
                    placeholder="administrativo"
                    required
                  />
                </Field>
                <Button type="submit" variant="secondary" disabled={isPending}>
                  Criar equipe
                </Button>
              </FieldGroup>
            </form>

            <form
              onSubmit={submitForm(salvarRoleOrganizacao, "Função salva.", {
                reset: true,
              })}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="role-name">Nova função</FieldLabel>
                  <Input
                    id="role-name"
                    name="role"
                    placeholder="financeiro_aprovador"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role-permission">
                    Descrição da função
                  </FieldLabel>
                  <Textarea
                    id="role-permission"
                    name="permission"
                    placeholder="Descreva quando esta função deve ser usada."
                    rows={3}
                  />
                </Field>
                <Button type="submit" variant="secondary" disabled={isPending}>
                  Salvar função
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da organização</CardTitle>
          <CardDescription>
            Atualize funções, confira equipes e remova vínculos quando
            necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Funções</TableHead>
                <TableHead>Equipes</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-muted-foreground">{item.email}</div>
                  </TableCell>
                  <TableCell className="min-w-56">
                    <form
                      className="flex gap-2"
                      onSubmit={submitForm(
                        atualizarFuncaoMembro,
                        "Função atualizada.",
                      )}
                    >
                      <input name="memberId" type="hidden" value={item.id} />
                      <RoleSelect
                        currentRole={item.role}
                        hideLabel
                        id={`member-role-${item.id}`}
                        label={`Função de ${item.email}`}
                        roles={roleOptions}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                      >
                        Salvar
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal">
                    <BadgeList values={item.teams} empty="Sem equipe" />
                  </TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          () => removerMembroDaOrganizacao(item.id),
                          "Membro removido.",
                        )
                      }
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Convites</CardTitle>
            <CardDescription>
              Acompanhe status e revogue convites da organização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      <form
                        className="flex gap-2"
                        onSubmit={submitForm(
                          atualizarStatusConviteAdmin,
                          "Status atualizado.",
                        )}
                      >
                        <input
                          name="invitationId"
                          type="hidden"
                          value={item.id}
                        />
                        <Select name="status" defaultValue={item.status}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INVITATION_STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          disabled={isPending}
                        >
                          Salvar
                        </Button>
                      </form>
                    </TableCell>
                    <TableCell>{formatOrganizationRole(item.role)}</TableCell>
                    <TableCell>{item.teamName ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            () => cancelarConviteAdmin(item.id),
                            "Convite revogado.",
                          )
                        }
                      >
                        Revogar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {invitations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum convite registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funções customizadas</CardTitle>
            <CardDescription>
              Funções criadas pela organização para compor permissões internas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Função</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatOrganizationRole(item.role)}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.role}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-96 whitespace-normal">
                      {item.permission}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            () => excluirRoleOrganizacao(item.id),
                            "Função excluída.",
                          )
                        }
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma função customizada criada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RoleSelect({
  currentRole = "member",
  hideLabel = false,
  id,
  label = "Função",
  roles,
}: {
  currentRole?: string;
  hideLabel?: boolean;
  id: string;
  label?: string;
  roles: string[];
}) {
  const options = Array.from(new Set([currentRole, ...roles]));

  return (
    <Field>
      <FieldLabel className={hideLabel ? "sr-only" : undefined} htmlFor={id}>
        {label}
      </FieldLabel>
      <Select name="role" defaultValue={currentRole}>
        <SelectTrigger id={id} className="w-full">
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
    </Field>
  );
}

function TeamSelect({ id, teams }: { id: string; teams: TeamOption[] }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Equipe</FieldLabel>
      <Select name="teamId" defaultValue="none">
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma equipe inicial</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function BadgeList({ values, empty }: { values: string[]; empty: string }) {
  if (values.length === 0) {
    return <span className="text-muted-foreground">{empty}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge key={value} variant="outline">
          {value}
        </Badge>
      ))}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
