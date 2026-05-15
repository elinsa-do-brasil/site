import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      .orderBy(desc(sessionTable.updatedAt)),
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

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Configurações da conta
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie seus dados de acesso ao Portal Interno Elinsa.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/portal">Voltar ao portal</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-5">
            <AccountOverviewCard
              user={currentUser}
              hasPassword={hasPassword}
              passkeysCount={normalizedPasskeys.length}
              sessionsCount={normalizedSessions.length}
            />
            <ProfileCard user={currentUser} />
            <LoginMethodsCard
              accounts={accounts}
              hasPassword={hasPassword}
              socialProviders={socialProviders}
            />
          </section>

          <section className="space-y-6 lg:col-span-7">
            <PasskeysCard initialPasskeys={normalizedPasskeys} />
            <ActiveSessionsCard
              initialSessions={normalizedSessions}
              currentSessionToken={currentSessionToken}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
