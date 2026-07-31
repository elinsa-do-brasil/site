"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthRedirecting } from "@/components/auth/auth-redirecting";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";

const INVITATION_ID_HEADER = "x-elinsa-invitation-id";

const otpFormSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Digite os 6 dígitos."),
});

function createIdentityFormSchema(nameRequired: boolean) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Informe um e-mail válido.")),
    name: nameRequired
      ? z
          .string()
          .trim()
          .min(2, "Informe seu nome completo.")
          .max(120, "O nome deve ter no máximo 120 caracteres.")
      : z.string().trim().max(120),
  });
}

type IdentityFormValues = z.infer<ReturnType<typeof createIdentityFormSchema>>;
type OtpFormValues = z.infer<typeof otpFormSchema>;

export type EmailOtpStep = "identity" | "otp";

type EmailOtpFormProps = {
  fixedEmail?: string;
  identitySubmitVariant?: "default" | "secondary";
  invitationId?: string;
  nameRequired?: boolean;
  onAuthenticated?: () => void;
  onStepChange?: (step: EmailOtpStep) => void;
  redirectTo?: string;
};

export function EmailOtpForm({
  fixedEmail,
  identitySubmitVariant = "default",
  invitationId,
  nameRequired = false,
  onAuthenticated,
  onStepChange,
  redirectTo = "/portal",
}: EmailOtpFormProps) {
  const router = useRouter();
  const identityFormSchema = useMemo(
    () => createIdentityFormSchema(nameRequired),
    [nameRequired],
  );
  const identityForm = useForm<IdentityFormValues>({
    defaultValues: {
      email: fixedEmail?.trim().toLowerCase() ?? "",
      name: "",
    },
    resolver: zodResolver(identityFormSchema),
  });
  const otpForm = useForm<OtpFormValues>({
    defaultValues: { otp: "" },
    resolver: zodResolver(otpFormSchema),
  });
  const [step, setStep] = useState<EmailOtpStep>("identity");
  const [resendIn, setResendIn] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function requestOtp(
    values: IdentityFormValues,
    errorTarget: "identity" | "otp",
  ) {
    identityForm.clearErrors("root.server");
    otpForm.clearErrors("root.server");

    const result = await authClient.emailOtp.sendVerificationOtp({
      email: values.email,
      type: "sign-in",
      ...(invitationId
        ? {
            fetchOptions: {
              headers: { [INVITATION_ID_HEADER]: invitationId },
            },
          }
        : {}),
    });

    if (result.error) {
      const message = getErrorMessage(result.error.code ?? "");

      if (errorTarget === "otp") {
        otpForm.setError("root.server", { message });
      } else {
        identityForm.setError("root.server", { message });
      }

      return false;
    }

    return true;
  }

  async function handleSend(values: IdentityFormValues) {
    if (!(await requestOtp(values, "identity"))) return;

    identityForm.reset(values);
    otpForm.reset();
    setStep("otp");
    onStepChange?.("otp");
    setResendIn(60);
  }

  async function handleResend() {
    setIsResending(true);
    const sent = await requestOtp(identityForm.getValues(), "otp");
    setIsResending(false);

    if (sent) setResendIn(60);
  }

  async function handleVerify(values: OtpFormValues) {
    otpForm.clearErrors();

    const identity = identityForm.getValues();
    const result = await authClient.signIn.emailOtp({
      email: identity.email,
      otp: values.otp,
      ...(nameRequired ? { name: identity.name } : {}),
      ...(invitationId ? { invitationId } : {}),
    });

    if (result.error) {
      otpForm.setError("otp", {
        message: getErrorMessage(result.error.code ?? ""),
      });
      return;
    }

    if (invitationId) {
      const invitationResult = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (invitationResult.error) {
        otpForm.setError("root.server", {
          message:
            invitationResult.error.message ||
            "A conta foi criada, mas não foi possível aceitar o convite.",
        });
        return;
      }
    }

    setIsRedirecting(true);
    onAuthenticated?.();
    toast.success(`Bem-vindo(a), ${result.data.user.name}!`);
    router.replace(redirectTo);
  }

  function handleChangeEmail() {
    otpForm.reset();
    setStep("identity");
    onStepChange?.("identity");
    setResendIn(0);
  }

  if (isRedirecting) {
    return <AuthRedirecting />;
  }

  if (step === "otp") {
    const email = identityForm.getValues("email");
    const isVerifying = otpForm.formState.isSubmitting;
    const isBusy = isVerifying || isResending;

    return (
      <form onSubmit={otpForm.handleSubmit(handleVerify)} noValidate>
        <FieldGroup>
          <Controller
            control={otpForm.control}
            name="otp"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email-otp-code">Código</FieldLabel>
                <InputOTP
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="one-time-code"
                  autoFocus
                  containerClassName="w-full"
                  id="email-otp-code"
                  inputMode="numeric"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                >
                  <InputOTPGroup className="w-full gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        aria-invalid={fieldState.invalid}
                        className="h-12 w-auto min-w-0 flex-1 rounded-md border border-input bg-background font-mono text-lg tabular-nums first:rounded-md first:border-l last:rounded-md"
                        index={index}
                        key={index}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription className="grid gap-2 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-3">
                  <span className="grid min-w-0 gap-0.5 @sm/field-group:flex @sm/field-group:items-baseline @sm/field-group:justify-between @sm/field-group:gap-4">
                    <span>Enviado para</span>
                    <span className="min-w-0 break-all font-medium text-foreground @sm/field-group:text-right">
                      {email}
                    </span>
                  </span>
                  <span className="flex items-baseline justify-between gap-4 border-t border-border/60 pt-2">
                    <span>Válido por</span>
                    <span className="font-mono text-foreground tabular-nums">
                      10 min
                    </span>
                  </span>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <FieldError errors={[otpForm.formState.errors.root?.server]} />

          <Button disabled={isBusy} size="xl" type="submit">
            {isVerifying ? <Spinner data-icon="inline-start" /> : "Entrar"}
          </Button>

          <Field orientation="horizontal">
            <Button
              className="flex-1"
              disabled={isBusy || resendIn > 0}
              onClick={handleResend}
              type="button"
              variant="outline"
            >
              {isResending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <HugeiconsIcon
                  data-icon="inline-start"
                  icon={RefreshIcon}
                  strokeWidth={2}
                />
              )}
              {resendIn > 0 ? (
                <>
                  Reenviar em
                  <span
                    className="font-mono tabular-nums"
                    data-slot="resend-countdown"
                  >
                    {resendIn}s
                  </span>
                </>
              ) : (
                "Reenviar"
              )}
            </Button>
            {!fixedEmail && (
              <Button
                className="flex-1"
                disabled={isBusy}
                onClick={handleChangeEmail}
                type="button"
                variant="ghost"
              >
                Alterar e-mail
              </Button>
            )}
          </Field>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form onSubmit={identityForm.handleSubmit(handleSend)} noValidate>
      <FieldGroup>
        {nameRequired && (
          <Controller
            control={identityForm.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email-otp-name">Nome completo</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="name"
                  className="h-11"
                  id="email-otp-name"
                  maxLength={120}
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        <Controller
          control={identityForm.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email-otp-email">
                {fixedEmail ? "E-mail do convite" : "E-mail"}
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="email username webauthn"
                className="h-11"
                id="email-otp-email"
                placeholder="email@grupoamperelinsa.com"
                readOnly={Boolean(fixedEmail)}
                required
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <FieldError errors={[identityForm.formState.errors.root?.server]} />

        <Button
          disabled={identityForm.formState.isSubmitting}
          size="xl"
          type="submit"
          variant={identitySubmitVariant}
        >
          {identityForm.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <>
              <HugeiconsIcon
                data-icon="inline-start"
                icon={Mail01Icon}
                strokeWidth={2}
              />
              Enviar código
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
