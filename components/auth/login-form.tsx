"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
// ícones:
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// dependências:
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
// componentes:
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";
import { Logo } from "../logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { MicrosoftOauthButton } from "./buttons/oauth-buttons";
import { PasskeySignInButton } from "./buttons/passkey-signin";
import { Or } from "./or";

// esquema do zod:
// TODO: melhorar a validação para não aceitar e-mails vazios
const loginInfos = z.object({
  email: z
    .email({ message: "O e-mail digitado não é válido" })
    .min(1, { message: "Precisamos de um e-mail ou nome de usuário" })
    .trim(),
  password: z.string().min(1, { message: "Precisamos de uma senha" }).trim(),
});

export function LoginForm({ redirectTo = "/portal" }: { redirectTo?: string }) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof loginInfos>>({
    resolver: standardSchemaResolver(loginInfos),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const pass = useWatch({ control: form.control, name: "password" });
  const [showPass, setShowPass] = useState<boolean>(false);
  const disableShowPassButton = pass === "" || pass === undefined;

  async function onSubmit(values: z.infer<typeof loginInfos>) {
    setIsPending(true);

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: redirectTo,
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onSuccess: (ctx) => {
          setIsPending(false);
          toast.success(`Bem-vindo(a), ${ctx.data.user.name}!`);
          router.push(redirectTo);
        },
        onError: (ctx) => {
          setIsPending(false);
          toast.error(getErrorMessage(ctx.error.code));
          form.setValue("password", "");
        },
      },
    );
  }

  return (
    <Card className="min-w-[24rem] max-w-108">
      <CardHeader className="px-6">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <CardDescription className="text-center">
          Faça login para acessar nossas ferramentas internas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        <MicrosoftOauthButton callbackURL={redirectTo} />

        <Or />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mb-6"
        >
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
                <Input
                  id="login-email"
                  placeholder="você@alguma-coisa.com"
                  autoComplete="email username webauthn"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel
                  htmlFor="login-password"
                  className="flex w-full justify-between items-center"
                >
                  Senha
                  <Button
                    variant="link"
                    className="text-muted-foreground hover:text-black dark:hover:text-white p-0 h-3.5"
                    asChild
                  >
                    <Link href="/recuperar-senha">Esqueceu sua senha?</Link>
                  </Button>
                </FieldLabel>
                <div className="flex">
                  <Input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    placeholder="***"
                    autoComplete="current-password webauthn"
                    aria-invalid={fieldState.invalid}
                    className="rounded-r-none"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-l-none border-l-0"
                    onClick={() => setShowPass((prev) => !prev)}
                    disabled={disableShowPassButton}
                  >
                    {showPass && !disableShowPassButton ? (
                      <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <EyeClosedIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showPass ? "Esconder senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending ? <Spinner /> : "Entrar"}
            </Button>
            <PasskeySignInButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
