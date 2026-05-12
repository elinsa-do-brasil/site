import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization, team, teamMember } from "@/lib/db/schema";

export const ELINSA_ORGANIZATION_SLUG = "elinsa";

export function parseRoleList(role: string) {
  return role
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getElinsaMembership(userId: string) {
  const [row] = await db
    .select({
      id: member.id,
      organizationId: member.organizationId,
      role: member.role,
      userId: member.userId,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      and(
        eq(member.userId, userId),
        eq(organization.slug, ELINSA_ORGANIZATION_SLUG),
      ),
    );

  return row ?? null;
}

export async function getUserTeamsInElinsa(userId: string) {
  return db
    .select({
      id: team.id,
      name: team.name,
    })
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .innerJoin(organization, eq(team.organizationId, organization.id))
    .where(
      and(
        eq(teamMember.userId, userId),
        eq(organization.slug, ELINSA_ORGANIZATION_SLUG),
      ),
    );
}

export async function userHasTeam(userId: string, teamSlug: string) {
  const teams = await getUserTeamsInElinsa(userId);
  return teams.some((item) => item.name === teamSlug);
}
