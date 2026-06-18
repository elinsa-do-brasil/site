import { asc, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { GestaoPageHeader } from "@/components/admin/GestaoPageHeader";
import { OrganizacaoAdmin } from "@/components/admin/OrganizacaoAdmin";
import { db } from "@/lib/db";
import {
  invitation,
  member,
  organizationRole,
  team,
  teamMember,
  user,
} from "@/lib/db/schema";
import { requireOrgAdmin } from "@/lib/organization/access";
import { BUILTIN_ORG_ROLES } from "@/lib/organization/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração da organização",
};

export default async function OrganizacaoAdminPage() {
  const context = await requireOrgAdmin();

  const [members, teams, teamLinks, invitations, roles] = await Promise.all([
    db
      .select({
        id: member.id,
        userId: member.userId,
        name: user.name,
        email: user.email,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, context.organizationId))
      .orderBy(asc(user.email)),
    db
      .select({ id: team.id, name: team.name })
      .from(team)
      .where(eq(team.organizationId, context.organizationId))
      .orderBy(asc(team.name)),
    db
      .select({
        userId: teamMember.userId,
        teamName: team.name,
      })
      .from(teamMember)
      .innerJoin(team, eq(teamMember.teamId, team.id))
      .where(eq(team.organizationId, context.organizationId)),
    db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        teamName: team.name,
      })
      .from(invitation)
      .leftJoin(team, eq(invitation.teamId, team.id))
      .where(eq(invitation.organizationId, context.organizationId))
      .orderBy(desc(invitation.createdAt)),
    db
      .select({
        id: organizationRole.id,
        role: organizationRole.role,
        permission: organizationRole.permission,
      })
      .from(organizationRole)
      .where(eq(organizationRole.organizationId, context.organizationId))
      .orderBy(asc(organizationRole.role)),
  ]);

  const teamsByUser = new Map<string, string[]>();
  for (const link of teamLinks) {
    const current = teamsByUser.get(link.userId) ?? [];
    current.push(link.teamName);
    teamsByUser.set(link.userId, current);
  }

  const roleOptions = Array.from(
    new Set([...BUILTIN_ORG_ROLES, ...roles.map((role) => role.role)]),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12">
      <GestaoPageHeader
        active="organizacao"
        title="Organização"
        description="Gerencie membros, vínculos e funções de acesso do Portal Interno Elinsa."
      />

      <OrganizacaoAdmin
        members={members.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          teams: teamsByUser.get(item.userId) ?? [],
        }))}
        pendingInvitationCount={
          invitations.filter((item) => item.status === "pending").length
        }
        roleOptions={roleOptions}
        roles={roles}
        teams={teams}
      />
    </div>
  );
}
