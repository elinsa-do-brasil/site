"use client";

import Link from "next/link";
import { useState } from "react";
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

export function RecuperarSenhaForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/redefinir-senha",
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error.message ||
          "Erro ao solicitar redefinição de senha. Verifique o e-mail informado.",
      );
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-md border border-border/80 bg-card p-8 text-center shadow-sm ring-1 ring-foreground/5">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          E-mail enviado
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá
          um link para criar uma nova senha.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/entrar">Voltar para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-md border border-border/80 bg-card p-8 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Informe seu e-mail cadastrado para receber as instruções de
          redefinição.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reset-email">E-mail</FieldLabel>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Enviar instruções"}
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/entrar"
          className="underline underline-offset-4 hover:text-primary"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
