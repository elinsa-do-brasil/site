"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
  CardHeader,
  CardTitle,
} from "../ui/card";

const signUpInfos = z
  .object({
    name: z.string().trim().min(1, { message: "Informe seu nome completo." }),
    password: z
      .string()
      .min(12, { message: "A senha deve ter no mínimo 12 caracteres." })
      .max(128, { message: "A senha deve ter no máximo 128 caracteres." }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type CriarContaFormProps = {
  invitationId: string;
  invitedEmail: string;
  organizationName: string;
  roleLabel: string;
};

export function CriarContaForm({
  invitationId,
  invitedEmail,
  organizationName,
  roleLabel,
}: CriarContaFormProps) {
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const invitationPath = `/convite/${encodeURIComponent(invitationId)}`;
  const loginHref = `/entrar?redirectTo=${encodeURIComponent(invitationPath)}`;
  const form = useForm<z.infer<typeof signUpInfos>>({
    defaultValues: {
      confirmPassword: "",
      name: "",
      password: "",
    },
    resolver: standardSchemaResolver(signUpInfos),
  });
  const password = useWatch({ control: form.control, name: "password" });
  const disableShowPasswordButton = !password;

  async function onSubmit(values: z.infer<typeof signUpInfos>) {
    form.clearErrors("root");

    const signUpBody = {
      email: invitedEmail,
      password: values.password,
      name: values.name,
      callbackURL: `${window.location.origin}${invitationPath}`,
      invitationId,
    } as Parameters<typeof authClient.signUp.email>[0] & {
      invitationId: string;
    };
    const result = await authClient.signUp.email(signUpBody);

    if (result.error) {
      form.setError("root", {
        message:
          result.error.message || "Erro ao criar conta. Tente novamente.",
      });
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
            Verifique seu e-mail
          </h1>
          <CardDescription>
            Enviamos a verificação para <strong>{invitedEmail}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6 text-center text-sm text-muted-foreground">
          <p>
            Depois de verificar o e-mail, volte para este convite para liberar o
            acesso ao portal.
          </p>
          <Button className="w-full" asChild>
            <Link href={invitationPath}>Voltar ao convite</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">Criar conta</h1>
        <CardDescription>
          Crie sua conta para aceitar o convite de {organizationName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        <div className="rounded-md border border-border/80 bg-muted/40 p-3 text-sm">
          <p className="font-medium">{roleLabel}</p>
          <p className="text-muted-foreground">{invitedEmail}</p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-6 flex flex-col gap-4"
          noValidate
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="register-name">Nome completo</FieldLabel>
                  <Input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <FieldLabel htmlFor="register-email">
                E-mail do convite
              </FieldLabel>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                aria-readonly="true"
                value={invitedEmail}
                readOnly
              />
              <FieldDescription>
                Este endereço vem do convite e não pode ser alterado.
              </FieldDescription>
            </Field>
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="register-password">
                    Senha (mín. 12 caracteres)
                  </FieldLabel>
                  <div className="flex">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      className="rounded-r-none"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={disableShowPasswordButton}
                    >
                      {showPassword && !disableShowPasswordButton ? (
                        <EyeIcon aria-hidden="true" />
                      ) : (
                        <EyeClosedIcon aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Esconder senha" : "Mostrar senha"}
                      </span>
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="register-confirm">
                    Confirmar senha
                  </FieldLabel>
                  <Input
                    id="register-confirm"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {form.formState.errors.root && (
              <FieldError errors={[form.formState.errors.root]} />
            )}
            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Spinner /> : "Criar conta"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <span>Já possui uma conta? </span>
          <Link
            href={loginHref}
            className="underline underline-offset-4 hover:text-primary"
          >
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
