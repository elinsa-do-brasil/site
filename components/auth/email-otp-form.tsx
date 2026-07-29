"use client";

import { Check, Mail, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { getErrorMessage } from "@/lib/errors";

const emailSchema = z.email("Informe um e-mail válido.");
const INVITATION_ID_HEADER = "x-elinsa-invitation-id";

type EmailOtpFormProps = {
  fixedEmail?: string;
  invitationId?: string;
  nameRequired?: boolean;
  redirectTo?: string;
};

export function EmailOtpForm({
  fixedEmail,
  invitationId,
  nameRequired = false,
  redirectTo = "/portal",
}: EmailOtpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(fixedEmail ?? "");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendIn]);

  const normalizedEmail = email.trim().toLowerCase();

  async function sendOtp() {
    setError(null);

    const emailResult = emailSchema.safeParse(normalizedEmail);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? "E-mail inválido.");
      return;
    }

    if (nameRequired && name.trim().length < 2) {
      setError("Informe seu nome completo.");
      return;
    }

    setIsPending(true);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: normalizedEmail,
      type: "sign-in",
      ...(invitationId
        ? {
            fetchOptions: {
              headers: { [INVITATION_ID_HEADER]: invitationId },
            },
          }
        : {}),
    });
    setIsPending(false);

    if (result.error) {
      setError(getErrorMessage(result.error.code ?? ""));
      return;
    }

    setStep("otp");
    setResendIn(60);
    toast.success(
      "Se a conta estiver habilitada, o código chegará em instantes.",
    );
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendOtp();
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Digite o código de 6 dígitos enviado por e-mail.");
      return;
    }

    setIsPending(true);
    const result = await authClient.signIn.emailOtp({
      email: normalizedEmail,
      otp,
      ...(nameRequired ? { name: name.trim() } : {}),
      ...(invitationId ? { invitationId } : {}),
    });

    if (result.error) {
      setIsPending(false);
      setError(getErrorMessage(result.error.code ?? ""));
      return;
    }

    if (invitationId) {
      const invitationResult = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (invitationResult.error) {
        setIsPending(false);
        setError(
          invitationResult.error.message ||
            "A conta foi criada, mas não foi possível aceitar o convite.",
        );
        return;
      }
    }

    toast.success(`Bem-vindo(a), ${result.data.user.name}!`);
    router.push(redirectTo);
    router.refresh();
  }

  if (step === "otp") {
    return (
      <form className="flex flex-col gap-4" onSubmit={handleVerify} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email-otp-code">Código de acesso</FieldLabel>
            <Input
              autoComplete="one-time-code"
              autoFocus
              id="email-otp-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              pattern="[0-9]{6}"
              placeholder="000000"
              value={otp}
            />
            <FieldDescription>
              Enviado para {normalizedEmail}. O código expira em 10 minutos.
            </FieldDescription>
          </Field>

          {error ? <FieldError>{error}</FieldError> : null}

          <Button disabled={isPending} size="lg" type="submit">
            {isPending ? <Spinner /> : <Check />}
            Confirmar código
          </Button>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              disabled={isPending || resendIn > 0}
              onClick={sendOtp}
              type="button"
              variant="outline"
            >
              <RotateCcw />
              {resendIn > 0 ? `Reenviar em ${resendIn}s` : "Reenviar código"}
            </Button>
            {!fixedEmail ? (
              <Button
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  setOtp("");
                  setStep("email");
                }}
                type="button"
                variant="ghost"
              >
                Alterar e-mail
              </Button>
            ) : null}
          </div>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSend} noValidate>
      <FieldGroup>
        {nameRequired ? (
          <Field>
            <FieldLabel htmlFor="email-otp-name">Nome completo</FieldLabel>
            <Input
              autoComplete="name"
              id="email-otp-name"
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="email-otp-email">
            {fixedEmail ? "E-mail do convite" : "E-mail"}
          </FieldLabel>
          <Input
            autoComplete="email username webauthn"
            id="email-otp-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            readOnly={Boolean(fixedEmail)}
            required
            type="email"
            value={email}
          />
          <FieldDescription>
            {fixedEmail
              ? "O endereço vem do convite e não pode ser alterado."
              : "Disponível para contas já ativadas ou convidadas."}
          </FieldDescription>
        </Field>

        {error ? <FieldError>{error}</FieldError> : null}

        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? <Spinner /> : <Mail />}
          Enviar código
        </Button>
      </FieldGroup>
    </form>
  );
}
