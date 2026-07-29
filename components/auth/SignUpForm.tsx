"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "../logo";
import { MicrosoftOauthButton } from "./buttons/oauth-buttons";
import { EmailOtpForm } from "./email-otp-form";

type InvitationAuthProps = {
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
}: InvitationAuthProps) {
  const invitationPath = `/convite/${encodeURIComponent(invitationId)}`;
  const loginHref = `/entrar?redirectTo=${encodeURIComponent(invitationPath)}`;

  return (
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">
          Ativar acesso por e-mail
        </h1>
        <CardDescription>
          Confirme o convite de {organizationName} com um código de uso único.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6 pb-6">
        <InvitationDetails
          email={invitedEmail}
          organizationName={organizationName}
          roleLabel={roleLabel}
        />

        <EmailOtpForm
          fixedEmail={invitedEmail}
          invitationId={invitationId}
          nameRequired
          redirectTo="/portal"
        />

        <div className="text-center text-sm text-muted-foreground">
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

export function CorporateInviteSignIn({
  invitationId,
  invitedEmail,
  organizationName,
  roleLabel,
}: InvitationAuthProps) {
  const invitationPath = `/convite/${encodeURIComponent(invitationId)}`;

  return (
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">
          Entrar com a Microsoft
        </h1>
        <CardDescription>
          Contas corporativas são ativadas pelo Microsoft Entra ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6 pb-6">
        <InvitationDetails
          email={invitedEmail}
          organizationName={organizationName}
          roleLabel={roleLabel}
        />
        <MicrosoftOauthButton callbackURL={invitationPath} />
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Entre com o mesmo endereço corporativo do convite. Depois do login,
          você voltará para concluir o aceite.
        </p>
        <Button asChild variant="ghost">
          <Link href="/entrar">Voltar ao login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function InvitationDetails({
  email,
  organizationName,
  roleLabel,
}: {
  email: string;
  organizationName: string;
  roleLabel: string;
}) {
  return (
    <div className="rounded-md border border-border/80 bg-muted/40 p-3 text-sm">
      <p className="font-medium">{roleLabel}</p>
      <p className="text-muted-foreground">{organizationName}</p>
      <p className="text-muted-foreground">{email}</p>
    </div>
  );
}
