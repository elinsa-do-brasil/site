import { and, asc, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { TimesAdmin } from "@/components/admin/TimesAdmin";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import {
  invitation,
  member,
  organizationRole,
  teamMember,
  teamPermission,
  user,
} from "@/lib/db/schema";
import {
  canManageTeam,
  getAllElinsaTeams,
  requireOrgAdminOrTeamLeader,
} from "@/lib/organization/access";
import {
  BUILTIN_ORG_ROLES,
  TEAM_PERMISSION_OPTIONS,
  type TeamPermissionKey,
} from "@/lib/organization/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administração de times",
};

const permissionKeys = new Set(
  TEAM_PERMISSION_OPTIONS.map((option) => option.key),
);

export default async function TimesAdminPage() {
  const context = await requireOrgAdminOrTeamLeader();
  const allTeams = await getAllElinsaTeams();
  const manageableTeams = allTeams.filter((item) =>
    canManageTeam(context, item.name),
  );
  const teamIds = manageableTeams.map((item) => item.id);

  const [members, customRoles, teamMembers, permissions, pendingInvitations] =
    await Promise.all([
      db
        .select({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: member.role,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(eq(member.organizationId, context.organizationId))
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
              userId: user.id,
              name: user.name,
              email: user.email,
              role: member.role,
            })
            .from(teamMember)
            .innerJoin(user, eq(teamMember.userId, user.id))
            .innerJoin(
              member,
              and(
                eq(member.userId, user.id),
                eq(member.organizationId, context.organizationId),
              ),
            )
            .where(inArray(teamMember.teamId, teamIds))
            .orderBy(asc(user.email))
        : [],
      teamIds.length
        ? db
            .select({
              teamId: teamPermission.teamId,
              permission: teamPermission.permission,
            })
            .from(teamPermission)
            .where(
              and(
                inArray(teamPermission.teamId, teamIds),
                eq(teamPermission.enabled, true),
              ),
            )
        : [],
      teamIds.length
        ? db
            .select({
              id: invitation.id,
              teamId: invitation.teamId,
              email: invitation.email,
              role: invitation.role,
              status: invitation.status,
              expiresAt: invitation.expiresAt,
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

  const membersByTeam = new Map<string, typeof teamMembers>();
  for (const item of teamMembers) {
    const current = membersByTeam.get(item.teamId) ?? [];
    current.push(item);
    membersByTeam.set(item.teamId, current);
  }

  const permissionsByTeam = new Map<string, TeamPermissionKey[]>();
  for (const item of permissions) {
    if (!permissionKeys.has(item.permission as TeamPermissionKey)) continue;
    const current = permissionsByTeam.get(item.teamId) ?? [];
    current.push(item.permission as TeamPermissionKey);
    permissionsByTeam.set(item.teamId, current);
  }

  const invitationsByTeam = new Map<string, typeof pendingInvitations>();
  for (const item of pendingInvitations) {
    if (!item.teamId) continue;
    const current = invitationsByTeam.get(item.teamId) ?? [];
    current.push(item);
    invitationsByTeam.set(item.teamId, current);
  }

  const roleOptions = Array.from(
    new Set([...BUILTIN_ORG_ROLES, ...customRoles.map((role) => role.role)]),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Administração de times
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inclusão, exclusão, convites e permissões dos times internos.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal">Voltar ao portal</Link>
        </Button>
      </div>

      <TimesAdmin
        isOrgAdmin={context.isOrgAdmin}
        members={members}
        roleOptions={roleOptions}
        teams={manageableTeams.map((item) => ({
          ...item,
          invitations: (invitationsByTeam.get(item.id) ?? []).map((invite) => ({
            id: invite.id,
            email: invite.email,
            role: invite.role,
            status: invite.status,
            expiresAt: invite.expiresAt?.toISOString() ?? null,
          })),
          members: membersByTeam.get(item.id) ?? [],
          permissions: permissionsByTeam.get(item.id) ?? [],
        }))}
      />
    </div>
  );
}
