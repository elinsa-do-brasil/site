import { and, asc, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import { GestaoPageHeader } from "@/components/admin/GestaoPageHeader";
import { TimesAdmin } from "@/components/admin/TimesAdmin";
import { db } from "@/lib/db";
import {
  invitation,
  organizationRole,
  teamMember,
  user,
} from "@/lib/db/schema";
import {
  canManageTeam,
  getAllElinsaTeams,
  requireOrgAdminOrTeamLeader,
} from "@/lib/organization/access";
import { BUILTIN_ORG_ROLES } from "@/lib/organization/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração de equipes",
};

export default async function TimesAdminPage() {
  const context = await requireOrgAdminOrTeamLeader();
  const allTeams = await getAllElinsaTeams();
  const manageableTeams = allTeams.filter((item) =>
    canManageTeam(context, item.name),
  );
  const teamIds = manageableTeams.map((item) => item.id);

  const [registeredUsers, customRoles, teamMembers, pendingInvitations] =
    await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
        })
        .from(user)
        .orderBy(asc(user.email)),
      db
        .select({ role: organizationRole.role })
        .from(organizationRole)
        .where(eq(organizationRole.organizationId, context.organizationId))
        .orderBy(asc(organizationRole.role)),
      teamIds.length
        ? db
            .select({
              teamId: teamMember.teamId,
              userId: teamMember.userId,
            })
            .from(teamMember)
            .where(inArray(teamMember.teamId, teamIds))
        : [],
      teamIds.length
        ? db
            .select({
              id: invitation.id,
              teamId: invitation.teamId,
            })
            .from(invitation)
            .where(
              and(
                inArray(invitation.teamId, teamIds),
                eq(invitation.status, "pending"),
              ),
            )
        : [],
    ]);

  const memberCountByTeam = new Map<string, number>();
  for (const item of teamMembers) {
    memberCountByTeam.set(
      item.teamId,
      (memberCountByTeam.get(item.teamId) ?? 0) + 1,
    );
  }

  const pendingInvitationCountByTeam = new Map<string, number>();
  for (const item of pendingInvitations) {
    if (!item.teamId) continue;
    pendingInvitationCountByTeam.set(
      item.teamId,
      (pendingInvitationCountByTeam.get(item.teamId) ?? 0) + 1,
    );
  }

  const roleOptions = Array.from(
    new Set([...BUILTIN_ORG_ROLES, ...customRoles.map((role) => role.role)]),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12">
      <GestaoPageHeader
        active="equipes"
        title="Equipes"
        description="Agrupe pessoas, convites e permissões operacionais por área de trabalho."
      />
      <TimesAdmin
        isOrgAdmin={context.isOrgAdmin}
        registeredUsers={registeredUsers}
        roleOptions={roleOptions}
        teams={manageableTeams.map((item) => ({
          ...item,
          memberCount: memberCountByTeam.get(item.id) ?? 0,
          pendingInvitationCount:
            pendingInvitationCountByTeam.get(item.id) ?? 0,
        }))}
      />
    </div>
  );
}
