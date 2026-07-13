import { and, asc, eq } from "drizzle-orm";
import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  formatAdminName,
  GestaoPageHeader,
} from "@/components/admin/GestaoPageHeader";
import { TeamAdmin } from "@/components/admin/TeamAdmin";
import { TeamInviteDialog } from "@/components/admin/TeamInviteDialog";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { db } from "@/lib/db";
import {
  invitation,
  member,
  organizationRole,
  team,
  teamMember,
  user,
} from "@/lib/db/schema";
import {
  canManageTeam,
  requireOrgAdminOrTeamLeader,
} from "@/lib/organization/access";
import { BUILTIN_ORG_ROLES } from "@/lib/organization/constants";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Equipe ${slug.replace(/_/g, " ")}`,
  };
}

export default async function TeamAdminPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const context = await requireOrgAdminOrTeamLeader();
  const [selectedTeam] = await db
    .select({
      id: team.id,
      name: team.name,
    })
    .from(team)
    .where(
      and(eq(team.organizationId, context.organizationId), eq(team.name, slug)),
    );

  if (!selectedTeam || !canManageTeam(context, selectedTeam.name)) {
    notFound();
  }

  const [registeredUsers, customRoles, members, pendingInvitations] =
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
      db
        .select({
          memberId: member.id,
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
        .where(eq(teamMember.teamId, selectedTeam.id))
        .orderBy(asc(user.email)),
      db
        .select({
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
        })
        .from(invitation)
        .where(
          and(
            eq(invitation.teamId, selectedTeam.id),
            eq(invitation.status, "pending"),
          ),
        )
        .orderBy(asc(invitation.email)),
    ]);

  const roleOptions = Array.from(
    new Set([...BUILTIN_ORG_ROLES, ...customRoles.map((role) => role.role)]),
  );

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <GestaoPageHeader
          active="equipes"
          title={formatAdminName(selectedTeam.name)}
          description="Revise membros, convites e configurações desta equipe."
          isOrgAdmin={context.isOrgAdmin}
          actions={
            <TeamInviteDialog
              isOrgAdmin={context.isOrgAdmin}
              registeredUsers={registeredUsers}
              roleOptions={roleOptions}
              team={selectedTeam}
              trigger={
                <Button type="button">
                  <UserPlus data-icon="inline-start" />
                  Adicionar ou convidar
                </Button>
              }
            />
          }
        />
        <TeamAdmin
          invitations={pendingInvitations.map((invite) => ({
            ...invite,
            expiresAt: invite.expiresAt?.toISOString() ?? null,
          }))}
          isOrgAdmin={context.isOrgAdmin}
          members={members}
          roleOptions={roleOptions}
          team={selectedTeam}
        />
      </div>
    </PageTransition>
  );
}
