"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

export function AceitarConvite({ invitationId }: { invitationId: string }) {
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
      setError(
        "Você precisa estar conectado para aceitar o convite. Faça login ou crie sua conta com o e-mail convidado.",
      );
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
        router.push("/comite");
      }, 2000);
    }
  }

  if (accepted) {
    return (
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Convite aceito com sucesso!
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Seu acesso à organização Elinsa foi vinculado. Redirecionando para as
          ferramentas internas...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold tracking-tight">Convite Organizacional</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Você foi convidado(a) para integrar a organização institucional da Elinsa.
      </p>

      <div className="my-6 space-y-3 text-left bg-muted/50 p-4 rounded-md text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Regras de segurança:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>É necessário ter verificado seu e-mail.</li>
          <li>A sessão atual deve corresponder ao e-mail convidado.</li>
          <li>Após aceitar, os acessos acumulados dos times serão liberados.</li>
        </ul>
      </div>

      {error && <FieldError className="mb-4 text-center">{error}</FieldError>}

      <div className="space-y-3">
        <Button
          onClick={handleAccept}
          className="w-full font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Vinculando acesso..." : "Aceitar Convite"}
        </Button>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/entrar">Fazer Login</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/criar">Criar Conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
