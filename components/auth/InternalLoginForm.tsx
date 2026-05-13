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
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export function LoginInternoForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMicrosoftSubmitting, setIsMicrosoftSubmitting] = useState(false);

  async function handleMicrosoftLogin() {
    setError(null);
    setIsMicrosoftSubmitting(true);
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: redirectTo,
    });
    // Não redefinimos isMicrosoftSubmitting para false imediatamente pois haverá redirecionamento
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: redirectTo,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error.message ||
          "E-mail ou senha inválidos. Verifique se sua conta foi confirmada.",
      );
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Portal Interno</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso restrito a colaboradores e convidados
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full font-medium"
        onClick={handleMicrosoftLogin}
        disabled={isMicrosoftSubmitting || isSubmitting}
      >
        {isMicrosoftSubmitting ? "Conectando..." : "Entrar com Microsoft"}
      </Button>

      <div className="my-6 relative text-center text-xs text-muted-foreground">
        <Separator className="absolute inset-0 top-1/2" />
        <span className="relative bg-card px-2">Ou continue com e-mail</span>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-email">E-mail corporativo ou convidado</FieldLabel>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="login-password">Senha</FieldLabel>
              <Link
                href="/recuperar-senha"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full" disabled={isSubmitting || isMicrosoftSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <span>Não possui conta? </span>
        <Link href="/criar" className="underline underline-offset-4 hover:text-primary">
          Criar conta por convite
        </Link>
      </div>
    </div>
  );
}
