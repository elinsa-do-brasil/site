import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader, PageHeaderNavigation } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  account as accountTable,
  passkey as passkeyTable,
  session as sessionTable,
  user as userTable,
} from "@/lib/db/schema";
import { AccountOverviewCard } from "./components/account-overview-card";
import { ActiveSessionsCard } from "./components/active-sessions-card";
import { LoginMethodsCard } from "./components/login-methods-card";
import { PasskeysCard } from "./components/passkeys-card";
import { ProfileCard } from "./components/profile-card";
import { SecurityCard } from "./components/security-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configurações da conta",
};

export default async function AccountSettingsPage() {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!currentSession?.user.id) {
    redirect("/entrar?redirectTo=/configuracoes");
  }

  const userId = currentSession.user.id;
  const currentSessionToken =
    (currentSession as { session?: { token?: string | null } }).session
      ?.token ?? null;
  const [users, accounts, passkeys, sessions] = await Promise.all([
    db.select().from(userTable).where(eq(userTable.id, userId)).limit(1),
    db
      .select({
        id: accountTable.id,
        providerId: accountTable.providerId,
        accountId: accountTable.accountId,
        password: accountTable.password,
        createdAt: accountTable.createdAt,
        updatedAt: accountTable.updatedAt,
      })
      .from(accountTable)
      .where(eq(accountTable.userId, userId))
      .orderBy(desc(accountTable.updatedAt)),
    db
      .select({
        id: passkeyTable.id,
        name: passkeyTable.name,
        deviceType: passkeyTable.deviceType,
        backedUp: passkeyTable.backedUp,
        createdAt: passkeyTable.createdAt,
      })
      .from(passkeyTable)
      .where(eq(passkeyTable.userId, userId))
      .orderBy(desc(passkeyTable.createdAt)),
    db
      .select({
        id: sessionTable.id,
        token: sessionTable.token,
        createdAt: sessionTable.createdAt,
        updatedAt: sessionTable.updatedAt,
        expiresAt: sessionTable.expiresAt,
        ipAddress: sessionTable.ipAddress,
        userAgent: sessionTable.userAgent,
      })
      .from(sessionTable)
      .where(eq(sessionTable.userId, userId))
      .orderBy(desc(sessionTable.updatedAt))
      .limit(5),
  ]);

  const currentUser = users[0] ?? {
    id: currentSession.user.id,
    name: currentSession.user.name,
    email: currentSession.user.email,
    emailVerified: currentSession.user.emailVerified,
    image: currentSession.user.image ?? null,
    createdAt: null,
    updatedAt: null,
  };
  const normalizedPasskeys = passkeys.map((passkey) => ({
    ...passkey,
    createdAt: passkey.createdAt?.toISOString() ?? null,
  }));
  const normalizedSessions = sessions.map((activeSession) => ({
    id: activeSession.id,
    token: activeSession.token,
    createdAt: activeSession.createdAt.toISOString(),
    updatedAt: activeSession.updatedAt.toISOString(),
    expiresAt: activeSession.expiresAt.toISOString(),
    ipAddress: activeSession.ipAddress ?? null,
    userAgent: activeSession.userAgent ?? null,
  }));
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential" && account.password,
  );
  const socialProviders = accounts
    .map((account) => account.providerId)
    .filter((providerId) => providerId !== "credential");
  const canChangeEmail = hasPassword && socialProviders.length === 0;

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <PageHeader
          description="Dados, acesso e sessões do Portal Interno Elinsa."
          eyebrow="Conta & segurança"
          navigation={
            <PageHeaderNavigation label="Navegação da conta">
              <Button className="shrink-0" size="sm" variant="outline" asChild>
                <Link href="/portal" transitionTypes={["nav-back"]}>
                  Voltar ao portal
                </Link>
              </Button>
            </PageHeaderNavigation>
          }
          title="Configurações da conta"
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-5">
            <AccountOverviewCard
              user={currentUser}
              hasPassword={hasPassword}
              passkeysCount={normalizedPasskeys.length}
              sessionsCount={normalizedSessions.length}
            />
            <SecurityCard
              canChangeEmail={canChangeEmail}
              hasPassword={hasPassword}
              userEmail={currentUser.email}
            />
            <LoginMethodsCard
              accounts={accounts}
              hasPassword={hasPassword}
              socialProviders={socialProviders}
            />
          </section>

          <section className="space-y-5">
            <ProfileCard user={currentUser} />
            <PasskeysCard initialPasskeys={normalizedPasskeys} />
            <ActiveSessionsCard
              initialSessions={normalizedSessions}
              currentSessionToken={currentSessionToken}
            />
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
