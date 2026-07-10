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
import { Logo } from "../logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
      <Card className="w-full max-w-108" variant="auth">
        <CardHeader className="px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">
            E-mail enviado
          </h1>
          <CardDescription>
            Se o e-mail <strong>{email}</strong> estiver cadastrado, você
            receberá um link para criar uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-6">
          <Button className="w-full" asChild>
            <Link href="/entrar">Voltar para o login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">
          Recuperar senha
        </h1>
        <CardDescription>
          Informe seu e-mail cadastrado para receber as instruções de
          redefinição.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reset-email">E-mail</FieldLabel>
              <Input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? <Spinner /> : "Enviar instruções"}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/entrar"
            className="underline underline-offset-4 hover:text-primary"
          >
            Voltar para o login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
