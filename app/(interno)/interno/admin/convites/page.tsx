import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { GerenciarConvites } from "@/components/admin/GerenciarConvites";
import { Button } from "@/components/ui/button";
import { getAllElinsaTeams, requireOrgAdmin } from "@/lib/organization/access";
import { db } from "@/lib/db";
import { invitation, organization, team } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Gerenciar Convites - Portal Interno Elinsa",
};

export default async function AdminConvitesPage() {
  await requireOrgAdmin();

  const [teams, pendingInvites] = await Promise.all([
    getAllElinsaTeams(),
    db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        teamName: team.name,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .leftJoin(team, eq(invitation.teamId, team.id))
      .where(
        and(eq(organization.slug, "elinsa"), eq(invitation.status, "pending")),
      )
      .orderBy(desc(invitation.createdAt)),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Convites</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Painel de administração para envio e revogação de convites de acesso
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/interno">Voltar ao Dashboard</Link>
        </Button>
      </div>

      <GerenciarConvites teams={teams} pendingInvitations={pendingInvites} />
    </main>
  );
}
