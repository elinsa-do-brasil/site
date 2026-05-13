"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-destructive">Link Inválido</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O token de redefinição de senha não foi encontrado ou expirou.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/recuperar-senha">Solicitar novo link</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Senha redefinida!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua senha foi alterada com sucesso. Você já pode acessar o portal.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/entrar">Entrar no Portal</Link>
        </Button>
      </div>
    );
  }

  const resetToken = token;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("A senha deve ter no mínimo 12 caracteres por segurança.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    startTransition(async () => {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: resetToken,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Não foi possível redefinir a senha. O link pode ter expirado.",
        );
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Nova Senha</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Crie uma senha segura com no mínimo 12 caracteres.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-password">Nova Senha</FieldLabel>
            <Input
              id="new-password"
              type="password"
              placeholder="Mínimo de 12 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">Confirmar Senha</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Salvando..." : "Redefinir Senha"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
