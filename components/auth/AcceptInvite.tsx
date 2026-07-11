"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
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

type AceitarConviteProps = {
  invitationEmail: string;
  invitationId: string;
  organizationName: string;
  roleLabel: string;
};

export function AceitarConvite({
  invitationEmail,
  invitationId,
  organizationName,
  roleLabel,
}: AceitarConviteProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  async function handleAccept() {
    setError(null);
    setIsSubmitting(true);

    // Verifica a sessão atual antes de aceitar
    const { data: session } = await authClient.getSession();

    if (!session?.user) {
      setIsSubmitting(false);
      setError("Entre com o e-mail convidado para aceitar este convite.");
      return;
    }

    const result = await authClient.organization.acceptInvitation({
      invitationId,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error.message ||
          "Não foi possível aceitar o convite. Verifique se ele expirou ou se você está conectado com o e-mail correto.",
      );
    } else {
      setAccepted(true);
      setTimeout(() => {
        router.push("/portal");
      }, 2000);
    }
  }

  if (accepted) {
    return (
      <Card className="w-full max-w-108" variant="auth">
        <CardHeader className="px-6 text-center">
          <CardTitle className="mt-6 mb-3">
            <Logo className="mx-auto" />
          </CardTitle>
          <h1 className="text-lg font-semibold tracking-tight">
            Convite aceito
          </h1>
          <CardDescription className="flex items-center justify-center gap-2">
            <Spinner />
            Redirecionando para o portal...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-108" variant="auth">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">
          Aceitar convite
        </h1>
        <CardDescription>
          Aceite o convite de {organizationName} para liberar seu acesso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="rounded-md border border-border/80 bg-muted/40 p-3 text-sm">
          <p className="font-medium">{roleLabel}</p>
          <p className="text-muted-foreground">{invitationEmail}</p>
        </div>

        {error && <FieldError className="text-center">{error}</FieldError>}

        <Button
          onClick={handleAccept}
          className="w-full font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Aceitar convite"}
        </Button>
      </CardContent>
    </Card>
  );
}
