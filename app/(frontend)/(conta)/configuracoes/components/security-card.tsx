"use client";

import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

type SecurityCardProps = {
  canChangeEmail: boolean;
  hasPassword: boolean;
  userEmail?: string | null;
};

function getAuthErrorMessage(error: { message?: string } | null | undefined) {
  return error?.message || "Não foi possível concluir a ação agora.";
}

export function SecurityCard({
  canChangeEmail,
  hasPassword,
  userEmail,
}: SecurityCardProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState(userEmail ?? "");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 12) {
      toast.error("A nova senha deve ter no mínimo 12 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas informadas não coincidem.");
      return;
    }

    setIsChangingPassword(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setIsChangingPassword(false);

    if (result.error) {
      toast.error(getAuthErrorMessage(result.error));
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Senha atualizada e outras sessões revogadas.");
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail === userEmail?.toLowerCase()) {
      toast.error("Informe um e-mail diferente do atual.");
      return;
    }

    setIsChangingEmail(true);
    const result = await authClient.changeEmail({
      callbackURL: "/configuracoes",
      newEmail: normalizedEmail,
    });
    setIsChangingEmail(false);

    if (result.error) {
      toast.error(getAuthErrorMessage(result.error));
      return;
    }

    toast.success("Enviamos a verificação para o novo e-mail.");
  }

  return (
    <Card className="rounded-md border-elinsa-primary/20 bg-card py-0 shadow-sm ring-1 ring-elinsa-primary/10">
      <CardHeader className="border-b bg-elinsa-primary/5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-elinsa-primary" />
          Segurança da conta
        </CardTitle>
        <CardDescription>Senha, e-mail e sessões da conta.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4 xl:grid-cols-2">
        <form
          className="rounded-md border border-border/80 bg-muted/20 p-4"
          onSubmit={handlePasswordSubmit}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="size-4 text-elinsa-primary" />
                Senha
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Troque a senha local e encerre outras sessões.
              </p>
            </div>
            <Badge variant={hasPassword ? "secondary" : "outline"}>
              {hasPassword ? "Ativa" : "Indisponível"}
            </Badge>
          </div>

          {hasPassword ? (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current-password">Senha atual</FieldLabel>
                <Input
                  autoComplete="current-password"
                  id="current-password"
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  type="password"
                  value={currentPassword}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-account-password">
                  Nova senha
                </FieldLabel>
                <Input
                  autoComplete="new-password"
                  id="new-account-password"
                  minLength={12}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  type="password"
                  value={newPassword}
                />
                <FieldDescription>Mínimo de 12 caracteres.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-account-password">
                  Confirmar nova senha
                </FieldLabel>
                <Input
                  autoComplete="new-password"
                  id="confirm-account-password"
                  minLength={12}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </Field>
              <Button disabled={isChangingPassword} type="submit">
                {isChangingPassword ? <Spinner /> : "Atualizar senha"}
              </Button>
            </FieldGroup>
          ) : (
            <p className="rounded-md border border-dashed bg-background/70 p-3 text-sm text-muted-foreground">
              Esta conta ainda não possui senha local. Use a recuperação para
              criar uma senha.
            </p>
          )}
        </form>

        <form
          className="rounded-md border border-border/80 bg-muted/20 p-4"
          onSubmit={handleEmailSubmit}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="size-4 text-elinsa-primary" />
                E-mail
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Disponível para contas sem login social.
              </p>
            </div>
            <Badge variant={canChangeEmail ? "secondary" : "outline"}>
              {canChangeEmail ? "Editável" : "Social"}
            </Badge>
          </div>

          {canChangeEmail ? (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="account-email">Novo e-mail</FieldLabel>
                <Input
                  autoComplete="email"
                  id="account-email"
                  onChange={(event) => setNewEmail(event.target.value)}
                  required
                  type="email"
                  value={newEmail}
                />
                <FieldDescription>
                  O novo endereço precisa ser verificado.
                </FieldDescription>
              </Field>
              <Button disabled={isChangingEmail} type="submit">
                {isChangingEmail ? <Spinner /> : "Atualizar e-mail"}
              </Button>
            </FieldGroup>
          ) : (
            <p className="rounded-md border border-dashed bg-background/70 p-3 text-sm text-muted-foreground">
              O e-mail desta conta vem do provedor de login.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
