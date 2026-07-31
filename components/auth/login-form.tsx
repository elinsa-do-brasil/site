"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { AuthRedirecting } from "./auth-redirecting";
import { MicrosoftOauthButton } from "./buttons/oauth-buttons";
import { PasskeySignInButton } from "./buttons/passkey-signin";
import { EmailOtpForm, type EmailOtpStep } from "./email-otp-form";
import { Or } from "./or";

export function LoginForm({ redirectTo = "/portal" }: { redirectTo?: string }) {
  const [emailOtpStep, setEmailOtpStep] = useState<EmailOtpStep>("identity");
  const [isRedirecting, setIsRedirecting] = useState(false);

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
        {isRedirecting ? (
          <AuthRedirecting />
        ) : (
          <>
            {emailOtpStep === "identity" && (
              <FieldGroup>
                <Field>
                  <MicrosoftOauthButton callbackURL={redirectTo} />
                  <PasskeySignInButton
                    onAuthenticated={() => setIsRedirecting(true)}
                    redirectTo={redirectTo}
                  />
                </Field>
                <Or texto="ou" />
              </FieldGroup>
            )}

            <EmailOtpForm
              identitySubmitVariant="secondary"
              onAuthenticated={() => setIsRedirecting(true)}
              onStepChange={setEmailOtpStep}
              redirectTo={redirectTo}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
