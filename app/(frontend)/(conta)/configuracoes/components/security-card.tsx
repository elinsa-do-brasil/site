"use client";

import { Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

type SecurityCardProps = {
  canChangeEmail: boolean;
  userEmail?: string | null;
};

type ChangeEmailStep = "details" | "current-otp" | "new-otp";

function getAuthErrorMessage(error: { message?: string } | null | undefined) {
  return error?.message || "Não foi possível concluir a ação agora.";
}

export function SecurityCard({ canChangeEmail, userEmail }: SecurityCardProps) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [currentOtp, setCurrentOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [step, setStep] = useState<ChangeEmailStep>("details");
  const [isPending, setIsPending] = useState(false);

  const normalizedCurrentEmail = userEmail?.trim().toLowerCase() ?? "";
  const normalizedNewEmail = newEmail.trim().toLowerCase();

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !z.email().safeParse(normalizedNewEmail).success ||
      normalizedNewEmail === normalizedCurrentEmail
    ) {
      toast.error("Informe um novo e-mail válido.");
      return;
    }

    setIsPending(true);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: normalizedCurrentEmail,
      type: "email-verification",
    });
    setIsPending(false);

    if (result.error) {
      toast.error(getAuthErrorMessage(result.error));
      return;
    }

    setStep("current-otp");
    toast.success("Enviamos um código para o e-mail atual.");
  }

  async function handleCurrentOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{6}$/.test(currentOtp)) {
      toast.error("Digite o código de 6 dígitos enviado ao e-mail atual.");
      return;
    }

    setIsPending(true);
    const result = await authClient.emailOtp.requestEmailChange({
      newEmail: normalizedNewEmail,
      otp: currentOtp,
    });
    setIsPending(false);

    if (result.error) {
      toast.error(getAuthErrorMessage(result.error));
      return;
    }

    setStep("new-otp");
    toast.success("Agora enviamos um código para o novo e-mail.");
  }

  async function handleNewOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{6}$/.test(newOtp)) {
      toast.error("Digite o código de 6 dígitos enviado ao novo e-mail.");
      return;
    }

    setIsPending(true);
    const result = await authClient.emailOtp.changeEmail({
      newEmail: normalizedNewEmail,
      otp: newOtp,
    });
    setIsPending(false);

    if (result.error) {
      toast.error(getAuthErrorMessage(result.error));
      return;
    }

    setCurrentOtp("");
    setNewOtp("");
    setNewEmail("");
    setStep("details");
    toast.success("E-mail atualizado.");
    router.refresh();
  }

  function restartChange() {
    setCurrentOtp("");
    setNewOtp("");
    setStep("details");
  }

  return (
    <Card className="rounded-md border-elinsa-primary/20 bg-card py-0 shadow-sm ring-1 ring-elinsa-primary/10">
      <CardHeader className="border-b bg-elinsa-primary/5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-elinsa-primary" />
          Segurança da conta
        </CardTitle>
        <CardDescription>
          E-mail confirmado por código e sessões protegidas.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <div className="rounded-md border border-border/80 bg-muted/20 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="size-4 text-elinsa-primary" />
                E-mail
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Alterações exigem um código no endereço atual e outro no novo.
              </p>
            </div>
            <Badge variant={canChangeEmail ? "secondary" : "outline"}>
              {canChangeEmail ? "Editável" : "Gerenciado"}
            </Badge>
          </div>

          {canChangeEmail ? (
            <EmailChangeForm
              currentEmail={normalizedCurrentEmail}
              currentOtp={currentOtp}
              isPending={isPending}
              newEmail={newEmail}
              newOtp={newOtp}
              onCurrentOtpChange={setCurrentOtp}
              onNewEmailChange={setNewEmail}
              onNewOtpChange={setNewOtp}
              onRestart={restartChange}
              onSubmitCurrentOtp={handleCurrentOtp}
              onSubmitDetails={handleStart}
              onSubmitNewOtp={handleNewOtp}
              step={step}
            />
          ) : (
            <p className="rounded-md border border-dashed bg-background/70 p-3 text-sm text-muted-foreground">
              O e-mail corporativo é administrado pela Microsoft e não pode ser
              alterado pelo portal.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmailChangeForm({
  currentEmail,
  currentOtp,
  isPending,
  newEmail,
  newOtp,
  onCurrentOtpChange,
  onNewEmailChange,
  onNewOtpChange,
  onRestart,
  onSubmitCurrentOtp,
  onSubmitDetails,
  onSubmitNewOtp,
  step,
}: {
  currentEmail: string;
  currentOtp: string;
  isPending: boolean;
  newEmail: string;
  newOtp: string;
  onCurrentOtpChange: (value: string) => void;
  onNewEmailChange: (value: string) => void;
  onNewOtpChange: (value: string) => void;
  onRestart: () => void;
  onSubmitCurrentOtp: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitDetails: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitNewOtp: (event: FormEvent<HTMLFormElement>) => void;
  step: ChangeEmailStep;
}) {
  if (step === "current-otp") {
    return (
      <form onSubmit={onSubmitCurrentOtp}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="current-email-otp">
              Código enviado para {currentEmail}
            </FieldLabel>
            <Input
              autoComplete="one-time-code"
              autoFocus
              id="current-email-otp"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                onCurrentOtpChange(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              value={currentOtp}
            />
          </Field>
          <Button disabled={isPending} type="submit">
            {isPending ? <Spinner /> : "Confirmar e enviar ao novo e-mail"}
          </Button>
          <Button onClick={onRestart} type="button" variant="ghost">
            Reiniciar alteração
          </Button>
        </FieldGroup>
      </form>
    );
  }

  if (step === "new-otp") {
    return (
      <form onSubmit={onSubmitNewOtp}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-email-otp">
              Código enviado para {newEmail}
            </FieldLabel>
            <Input
              autoComplete="one-time-code"
              autoFocus
              id="new-email-otp"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                onNewOtpChange(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              value={newOtp}
            />
            <FieldDescription>
              Se o código não chegar, reinicie a alteração para validar os dois
              endereços novamente.
            </FieldDescription>
          </Field>
          <Button disabled={isPending} type="submit">
            {isPending ? <Spinner /> : "Confirmar novo e-mail"}
          </Button>
          <Button onClick={onRestart} type="button" variant="ghost">
            Reiniciar alteração
          </Button>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitDetails}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="account-email">Novo e-mail</FieldLabel>
          <Input
            autoComplete="email"
            id="account-email"
            onChange={(event) => onNewEmailChange(event.target.value)}
            required
            type="email"
            value={newEmail}
          />
          <FieldDescription>
            Somente contas externas podem alterar o endereço pelo portal.
          </FieldDescription>
        </Field>
        <Button disabled={isPending} type="submit">
          {isPending ? <Spinner /> : "Iniciar alteração"}
        </Button>
      </FieldGroup>
    </form>
  );
}
