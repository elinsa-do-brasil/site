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
import { Spinner } from "@/components/ui/spinner";
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
      <div className="w-full max-w-md rounded-md border border-border/80 bg-card p-8 text-center shadow-sm ring-1 ring-foreground/5">
        <h1 className="text-xl font-bold text-destructive">Link inválido</h1>
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
      <div className="w-full max-w-md rounded-md border border-border/80 bg-card p-8 text-center shadow-sm ring-1 ring-foreground/5">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Senha redefinida
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua senha foi alterada com sucesso. Você já pode acessar o portal.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/entrar">Entrar no portal</Link>
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
    <div className="w-full max-w-md rounded-md border border-border/80 bg-card p-8 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Crie uma senha segura com no mínimo 12 caracteres.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
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
            <FieldLabel htmlFor="confirm-password">Confirmar senha</FieldLabel>
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

          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? <Spinner /> : "Redefinir senha"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
