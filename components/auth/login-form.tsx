"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { MicrosoftOauthButton } from "./buttons/oauth-buttons";
import { PasskeySignInButton } from "./buttons/passkey-signin";
import { EmailOtpForm, type EmailOtpStep } from "./email-otp-form";
import { Or } from "./or";

export function LoginForm({ redirectTo = "/portal" }: { redirectTo?: string }) {
  const [emailOtpStep, setEmailOtpStep] = useState<EmailOtpStep>("identity");

  return (
    <Card
      className="w-full max-w-108 data-[variant=auth]:[--card-spacing:--spacing(5)]"
      variant="auth"
    >
      <CardHeader className="px-5 pt-1 sm:px-7">
        <CardTitle className="mb-2">
          <Logo className="mx-auto h-16" />
        </CardTitle>
        <h1 className="sr-only">Entrar no portal</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 pb-1 sm:px-7">
        {emailOtpStep === "identity" && (
          <FieldGroup>
            <Field>
              <MicrosoftOauthButton callbackURL={redirectTo} />
              <PasskeySignInButton redirectTo={redirectTo} />
            </Field>
            <Or texto="ou" />
          </FieldGroup>
        )}

        <EmailOtpForm
          identitySubmitVariant="secondary"
          onStepChange={setEmailOtpStep}
          redirectTo={redirectTo}
        />
      </CardContent>
    </Card>
  );
}
