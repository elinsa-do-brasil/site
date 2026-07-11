import { and, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { GerenciarConvites } from "@/components/admin/GerenciarConvites";
import { GestaoPageHeader } from "@/components/admin/GestaoPageHeader";
import { PageTransition } from "@/components/ui/page-transition";
import { db } from "@/lib/db";
import {
  invitation,
  organization,
  organizationRole,
  team,
} from "@/lib/db/schema";
import { getAllElinsaTeams, requireOrgAdmin } from "@/lib/organization/access";
import { BUILTIN_ORG_ROLES } from "@/lib/organization/constants";

export const metadata: Metadata = {
  title: "Gerenciar convites",
};

export default async function AdminConvitesPage() {
  const context = await requireOrgAdmin();

  const [teams, customRoles, pendingInvites] = await Promise.all([
    getAllElinsaTeams(),
    db
      .select({ role: organizationRole.role })
      .from(organizationRole)
      .where(eq(organizationRole.organizationId, context.organizationId)),
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
  const roleOptions = Array.from(
    new Set([...BUILTIN_ORG_ROLES, ...customRoles.map((role) => role.role)]),
  );

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <GestaoPageHeader
          active="convites"
          title="Convites"
          description="Envie links de acesso, acompanhe pendências e revogue convites que não devem mais funcionar."
          isOrgAdmin={context.isOrgAdmin}
        />

        <GerenciarConvites
          pendingInvitations={pendingInvites}
          roleOptions={roleOptions}
          teams={teams}
        />
      </div>
    </PageTransition>
  );
}
