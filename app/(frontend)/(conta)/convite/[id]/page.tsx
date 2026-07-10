import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { AceitarConvite } from "@/components/auth/AcceptInvite";
import { BotaoSair } from "@/components/auth/LogoutButton";
import { CriarContaForm } from "@/components/auth/SignUpForm";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invitation, organization, user } from "@/lib/db/schema";
import { formatOrganizationRole } from "@/lib/organization/constants";

export const metadata: Metadata = {
  title: "Aceitar convite",
};

export const dynamic = "force-dynamic";

type ConvitePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConvitePage({ params }: ConvitePageProps) {
  const { id } = await params;
  const invitationPath = `/convite/${encodeURIComponent(id)}`;
  const loginHref = `/entrar?redirectTo=${encodeURIComponent(invitationPath)}`;
  const [invite] = await db
    .select({
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      organizationName: organization.name,
      role: invitation.role,
      status: invitation.status,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(eq(invitation.id, id))
    .limit(1);

  if (!invite) {
    return (
      <InvitePageShell>
        <InviteMessageCard
          title="Convite não encontrado"
          description="Verifique se o link recebido está completo."
        >
          <Button className="w-full" asChild>
            <Link href="/entrar">Ir para o login</Link>
          </Button>
        </InviteMessageCard>
      </InvitePageShell>
    );
  }

  const isPending = invite.status === "pending";
  const isExpired = !invite.expiresAt || invite.expiresAt < new Date();

  if (!isPending || isExpired) {
    return (
      <InvitePageShell>
        <InviteMessageCard
          title={isExpired ? "Convite expirado" : "Convite indisponível"}
          description="Peça um novo convite para acessar o Portal Interno Elinsa."
        >
          <Button className="w-full" asChild>
            <Link href="/entrar">Ir para o login</Link>
          </Button>
        </InviteMessageCard>
      </InvitePageShell>
    );
  }

  const normalizedEmail = invite.email.trim().toLowerCase();
  const [existingUser] = await db
    .select({
      email: user.email,
      id: user.id,
    })
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1);
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });
  const sessionEmail = currentSession?.user.email?.trim().toLowerCase() ?? null;
  const isSessionForInvite = sessionEmail === normalizedEmail;
  const roleLabel = formatOrganizationRole(invite.role);

  if (currentSession?.user && !isSessionForInvite) {
    return (
      <InvitePageShell>
        <InviteMessageCard
          title="Convite para outro e-mail"
          description={`Este convite foi enviado para ${invite.email}.`}
        >
          <p className="text-center text-sm text-muted-foreground">
            Você está conectado como {currentSession.user.email}. Saia desta
            conta antes de aceitar o convite.
          </p>
          <BotaoSair
            label="Sair e entrar com outro e-mail"
            redirectTo={loginHref}
          />
        </InviteMessageCard>
      </InvitePageShell>
    );
  }

  if (existingUser && !currentSession?.user) {
    return (
      <InvitePageShell>
        <InviteMessageCard
          title="Entre para aceitar o convite"
          description={`A conta ${invite.email} já existe no portal.`}
        >
          <div className="rounded-md border border-border/80 bg-muted/40 p-3 text-sm">
            <p className="font-medium">{roleLabel}</p>
            <p className="text-muted-foreground">{invite.organizationName}</p>
          </div>
          <Button className="w-full" asChild>
            <Link href={loginHref}>Entrar com este e-mail</Link>
          </Button>
        </InviteMessageCard>
      </InvitePageShell>
    );
  }

  return (
    <InvitePageShell>
      {currentSession?.user ? (
        <AceitarConvite
          invitationEmail={invite.email}
          invitationId={id}
          organizationName={invite.organizationName}
          roleLabel={roleLabel}
        />
      ) : (
        <CriarContaForm
          invitationId={id}
          invitedEmail={invite.email}
          organizationName={invite.organizationName}
          roleLabel={roleLabel}
        />
      )}
    </InvitePageShell>
  );
}

function InvitePageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      id="conteudo-principal"
    >
      {children}
    </main>
  );
}

function InviteMessageCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="w-full max-w-108">
      <CardHeader className="px-6 text-center">
        <CardTitle className="mt-6 mb-3">
          <Logo className="mx-auto" />
        </CardTitle>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">{children}</CardContent>
    </Card>
  );
}
