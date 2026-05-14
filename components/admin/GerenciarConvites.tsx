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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  cancelarConviteAdmin,
  enviarConviteAdmin,
} from "@/lib/organization/actions";
import { formatOrganizationRole } from "@/lib/organization/constants";

type TeamOption = {
  id: string;
  name: string;
};

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date | null;
  teamName: string | null;
};

type GerenciarConvitesProps = {
  teams: TeamOption[];
  pendingInvitations: PendingInvite[];
};

export function GerenciarConvites({
  teams,
  pendingInvitations,
}: GerenciarConvitesProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    if (formData.get("teamId") === "none") {
      formData.delete("teamId");
    }

    startTransition(async () => {
      const result = await enviarConviteAdmin(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Limpar o formulário
        (event.target as HTMLFormElement).reset();
      }
    });
  }

  function handleCancelInvite(id: string) {
    startTransition(async () => {
      await cancelarConviteAdmin(id);
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="md:col-span-1 self-start">
        <CardHeader>
          <CardTitle>Novo Convite</CardTitle>
          <CardDescription>
            Conceder acesso restrito ao portal e alocar equipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 rounded-md bg-primary/10 p-3 text-xs text-primary font-medium text-center">
              Convite enviado com sucesso!
            </div>
          )}

          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-email">
                  E-mail do destinatário
                </FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-role">Função</FieldLabel>
                <Select name="role" defaultValue="member">
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      {formatOrganizationRole("member")}
                    </SelectItem>
                    <SelectItem value="admin">
                      {formatOrganizationRole("admin")}
                    </SelectItem>
                    <SelectItem value="owner">
                      {formatOrganizationRole("owner")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-team">
                  Equipe inicial (opcional)
                </FieldLabel>
                <Select name="teamId" defaultValue="none">
                  <SelectTrigger id="invite-team" className="w-full">
                    <SelectValue placeholder="Nenhuma equipe específica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Nenhuma equipe específica
                    </SelectItem>

                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-msg">
                  Mensagem (Opcional)
                </FieldLabel>
                <Textarea
                  id="invite-msg"
                  name="mensagem"
                  placeholder="Instruções ou contexto adicional..."
                  rows={3}
                />
              </Field>

              {error && <FieldError>{error}</FieldError>}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isPending}
              >
                {isPending ? "Processando..." : "Enviar Convite"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 self-start">
        <CardHeader>
          <CardTitle>Convites Pendentes</CardTitle>
          <CardDescription>
            Aguardando aceite e confirmação de e-mail pelos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-2 font-medium">E-mail</th>
                    <th className="py-2 pr-2 font-medium">Função</th>
                    <th className="py-2 pr-2 font-medium">Equipe</th>
                    <th className="py-2 pr-2 font-medium">Expira em</th>
                    <th className="py-2 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingInvitations.map((inv) => {
                    const isExpired =
                      inv.expiresAt && new Date() > new Date(inv.expiresAt);

                    return (
                      <tr key={inv.id} className="group">
                        <td className="py-3 pr-2 font-mono max-w-[180px] truncate">
                          {inv.email}
                        </td>
                        <td className="py-3 pr-2 capitalize">
                          <Badge
                            variant={
                              inv.role === "admin" ? "default" : "outline"
                            }
                          >
                            {formatOrganizationRole(inv.role)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-2 capitalize text-muted-foreground">
                          {inv.teamName ? inv.teamName.replace("_", " ") : "-"}
                        </td>
                        <td className="py-3 pr-2">
                          {inv.expiresAt ? (
                            <span
                              className={
                                isExpired ? "text-destructive font-medium" : ""
                              }
                            >
                              {new Intl.DateTimeFormat("pt-BR", {
                                dateStyle: "short",
                              }).format(new Date(inv.expiresAt))}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2"
                            onClick={() => handleCancelInvite(inv.id)}
                            disabled={isPending}
                          >
                            Cancelar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Nenhum convite pendente no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
