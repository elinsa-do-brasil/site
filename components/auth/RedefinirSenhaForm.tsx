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
import { Logo } from "../logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
      <Card className="w-full max-w-108" variant="auth">
        <CardHeader className="px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight text-destructive">
            Link inválido
          </h1>
          <CardDescription>
            O token de redefinição de senha não foi encontrado ou expirou.
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-6">
          <Button className="w-full" asChild>
            <Link href="/recuperar-senha">Solicitar novo link</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-108" variant="auth">
        <CardHeader className="px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">
            Senha redefinida
          </h1>
          <CardDescription>
            Sua senha foi alterada com sucesso. Você já pode acessar o portal.
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-6">
          <Button className="w-full" asChild>
            <Link href="/entrar">Entrar no portal</Link>
          </Button>
        </CardFooter>
      </Card>
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
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">Nova senha</h1>
        <CardDescription>
          Crie uma senha segura com no mínimo 12 caracteres.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
              <Input
                id="new-password"
                name="new-password"
                type="password"
                placeholder="Mínimo de 12 caracteres"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar senha
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={isPending}
              size="lg"
            >
              {isPending ? <Spinner /> : "Redefinir senha"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
