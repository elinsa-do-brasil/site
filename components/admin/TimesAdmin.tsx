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
import { Checkbox } from "@/components/ui/checkbox";
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
  adicionarMembroAoTime,
  cancelarConviteAdmin,
  criarTimeOrganizacao,
  enviarConviteAdmin,
  removerMembroDoTime,
  removerTimeOrganizacao,
  salvarPermissoesTime,
} from "@/lib/organization/actions";
import {
  TEAM_PERMISSION_OPTIONS,
  type TeamPermissionKey,
} from "@/lib/organization/constants";

type MemberOption = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

type TeamMemberRow = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string | null;
};

type TeamAdminRow = {
  id: string;
  name: string;
  permissions: TeamPermissionKey[];
  members: TeamMemberRow[];
  invitations: InvitationRow[];
};

type TimesAdminProps = {
  isOrgAdmin: boolean;
  teams: TeamAdminRow[];
  members: MemberOption[];
  roleOptions: string[];
};

type ActionResult = {
  error?: string;
  success?: boolean;
};

export function TimesAdmin({
  isOrgAdmin,
  teams,
  members,
  roleOptions,
}: TimesAdminProps) {
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

      {isOrgAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Criar time</CardTitle>
            <CardDescription>
              Times organizam permissões, convites e ferramentas internas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-[1fr_auto]"
              onSubmit={submitForm(criarTimeOrganizacao, "Time criado.", {
                reset: true,
              })}
            >
              <Field>
                <FieldLabel htmlFor="new-team-name">Nome do time</FieldLabel>
                <Input
                  id="new-team-name"
                  name="name"
                  placeholder="financeiro"
                  required
                />
              </Field>
              <Button type="submit" className="self-end" disabled={isPending}>
                Criar time
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.members.length} membro(s), {team.invitations.length}{" "}
                  convite(s) pendente(s)
                </CardDescription>
              </div>
              {isOrgAdmin && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => removerTimeOrganizacao(team.id),
                      "Time removido.",
                    )
                  }
                >
                  Excluir time
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-6">
                <section className="space-y-3">
                  <div>
                    <h2 className="text-sm font-medium">Permissões do time</h2>
                    <p className="text-xs text-muted-foreground">
                      Permissões guiam o que o time pode operar dentro do
                      portal.
                    </p>
                  </div>
                  {isOrgAdmin ? (
                    <form
                      className="grid gap-3 sm:grid-cols-2"
                      onSubmit={submitForm(
                        salvarPermissoesTime,
                        "Permissões atualizadas.",
                      )}
                    >
                      <input name="teamId" type="hidden" value={team.id} />
                      {TEAM_PERMISSION_OPTIONS.map((option) => (
                        <label
                          key={option.key}
                          className="flex gap-3 rounded-md border p-3"
                          htmlFor={`${team.id}-${option.key}`}
                        >
                          <Checkbox
                            id={`${team.id}-${option.key}`}
                            name={option.key}
                            defaultChecked={team.permissions.includes(
                              option.key,
                            )}
                          />
                          <span>
                            <span className="block text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      ))}
                      <div className="sm:col-span-2">
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          disabled={isPending}
                        >
                          Salvar permissões
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <BadgeList
                      values={team.permissions}
                      empty="Nenhuma permissão especial configurada."
                    />
                  )}
                </section>

                <section className="space-y-3">
                  <div>
                    <h2 className="text-sm font-medium">Membros do time</h2>
                    <p className="text-xs text-muted-foreground">
                      Remover alguém do time não remove o vínculo com a
                      organização.
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Função org.</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.members.map((member) => (
                        <TableRow key={member.userId}>
                          <TableCell>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-muted-foreground">
                              {member.email}
                            </div>
                          </TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell className="text-right">
                            <form
                              onSubmit={submitForm(
                                removerMembroDoTime,
                                "Membro removido do time.",
                              )}
                            >
                              <input
                                name="teamId"
                                type="hidden"
                                value={team.id}
                              />
                              <input
                                name="userId"
                                type="hidden"
                                value={member.userId}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={isPending}
                              >
                                Remover
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                      {team.members.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="py-6 text-center text-muted-foreground"
                          >
                            Time sem membros.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </section>

                {team.invitations.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-medium">Convites pendentes</h2>
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
                        {team.invitations.map((invite) => (
                          <TableRow key={invite.id}>
                            <TableCell>{invite.email}</TableCell>
                            <TableCell>{invite.role}</TableCell>
                            <TableCell>
                              {formatDate(invite.expiresAt)}
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
                                    () => cancelarConviteAdmin(invite.id),
                                    "Convite revogado.",
                                  )
                                }
                              >
                                Revogar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                )}
              </div>

              <aside className="space-y-6">
                <form
                  onSubmit={submitForm(
                    adicionarMembroAoTime,
                    "Membro vinculado ao time.",
                  )}
                >
                  <FieldGroup>
                    <input name="teamId" type="hidden" value={team.id} />
                    <Field>
                      <FieldLabel htmlFor={`${team.id}-member`}>
                        Vincular membro existente
                      </FieldLabel>
                      <Select name="userId">
                        <SelectTrigger
                          id={`${team.id}-member`}
                          className="w-full"
                        >
                          <SelectValue placeholder="Selecione um membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem
                              key={member.userId}
                              value={member.userId}
                            >
                              {member.name} - {member.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                    >
                      Vincular
                    </Button>
                  </FieldGroup>
                </form>

                <form
                  onSubmit={submitForm(enviarConviteAdmin, "Convite enviado.", {
                    reset: true,
                  })}
                >
                  <FieldGroup>
                    <input name="teamId" type="hidden" value={team.id} />
                    <Field>
                      <FieldLabel htmlFor={`${team.id}-invite-email`}>
                        Convidar para o time
                      </FieldLabel>
                      <Input
                        id={`${team.id}-invite-email`}
                        name="email"
                        type="email"
                        placeholder="nome@empresa.com"
                        required
                      />
                    </Field>
                    {isOrgAdmin ? (
                      <Field>
                        <FieldLabel htmlFor={`${team.id}-invite-role`}>
                          Função
                        </FieldLabel>
                        <Select name="role" defaultValue="member">
                          <SelectTrigger
                            id={`${team.id}-invite-role`}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : (
                      <input name="role" type="hidden" value="member" />
                    )}
                    <Field>
                      <FieldLabel htmlFor={`${team.id}-invite-message`}>
                        Mensagem
                      </FieldLabel>
                      <Textarea
                        id={`${team.id}-invite-message`}
                        name="mensagem"
                        rows={3}
                      />
                    </Field>
                    <Button type="submit" size="sm" disabled={isPending}>
                      Enviar convite
                    </Button>
                  </FieldGroup>
                </form>
              </aside>
            </CardContent>
          </Card>
        ))}

        {teams.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Nenhum time disponível para administração.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function BadgeList({ values, empty }: { values: string[]; empty: string }) {
  if (values.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
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
  }).format(new Date(value));
}
