"use client";

import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MicrosoftOauthButton } from "./buttons/oauth-buttons";
import { PasskeySignInButton } from "./buttons/passkey-signin";
import { EmailOtpForm } from "./email-otp-form";
import { Or } from "./or";

export function LoginForm({ redirectTo = "/portal" }: { redirectTo?: string }) {
  return (
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="sr-only">Entrar no portal</h1>
        <CardDescription className="text-center">
          Acesse com sua conta corporativa, um código por e-mail ou uma Passkey.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6 pb-6">
        <MicrosoftOauthButton callbackURL={redirectTo} />
        <PasskeySignInButton redirectTo={redirectTo} />

        <Or />

        <EmailOtpForm redirectTo={redirectTo} />
      </CardContent>
    </Card>
  );
}
