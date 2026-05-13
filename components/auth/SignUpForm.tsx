"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function CriarContaForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("A senha deve ter no mínimo 12 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);

    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message || "Erro ao criar conta. Tente novamente.");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Conta criada com sucesso!
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Enviamos um link de verificação para <strong>{email}</strong>.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Após verificar seu e-mail, clique no link do convite que recebeu para ter
          acesso às ferramentas internas.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/entrar">Ir para o Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Criar Conta</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Use o mesmo e-mail que recebeu o convite. O acesso às ferramentas internas
          só será liberado após aceitar o convite enviado pela Elinsa.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="register-name">Nome completo</FieldLabel>
            <Input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-email">E-mail</FieldLabel>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-password">Senha (mín. 12 caracteres)</FieldLabel>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={12}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-confirm">Confirmar senha</FieldLabel>
            <Input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={12}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <span>Já possui uma conta? </span>
        <Link href="/entrar" className="underline underline-offset-4 hover:text-primary">
          Entrar
        </Link>
      </div>
    </div>
  );
}
