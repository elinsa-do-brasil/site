import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  member,
  organization,
  portalTool,
  team,
  teamMember,
} from "@/lib/db/schema";
import {
  parseOrganizationRoleList,
  TEAM_LEADER_ROLE,
} from "@/lib/organization/constants";

export const ELINSA_ORGANIZATION_SLUG = "elinsa";

export function parseRoleList(role: string) {
  return parseOrganizationRoleList(role);
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

export async function getAllElinsaTeams() {
  return db
    .select({
      id: team.id,
      name: team.name,
    })
    .from(team)
    .innerJoin(organization, eq(team.organizationId, organization.id))
    .where(eq(organization.slug, ELINSA_ORGANIZATION_SLUG));
}

export type InternalAccessContext = {
  userId: string;
  organizationId: string;
  organizationSlug: "elinsa";
  role: string | string[];
  roles: string[];
  teams: string[];
  isOrgAdmin: boolean;
  isTeamLeader: boolean;
};

export async function getInternalAccessContext(
  userId?: string,
): Promise<InternalAccessContext | null> {
  let uid = userId;
  if (!uid) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.id) return null;
    uid = session.user.id;
  }

  const membership = await getElinsaMembership(uid);
  if (!membership) return null;

  const userTeams = await getUserTeamsInElinsa(uid);
  const teamNames = userTeams.map((t) => t.name);

  const roles = parseRoleList(membership.role);
  const isOrgAdmin =
    roles.includes("admin") ||
    roles.includes("owner") ||
    membership.role === "admin" ||
    membership.role === "owner";

  return {
    userId: uid,
    organizationId: membership.organizationId,
    organizationSlug: "elinsa",
    role: membership.role,
    roles,
    teams: teamNames,
    isOrgAdmin,
    isTeamLeader: roles.includes(TEAM_LEADER_ROLE),
  };
}

export type InternalTool = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon?: string | null;
  teamName?: string;
};

const BUILTIN_INTERNAL_TOOLS: InternalTool[] = [
  {
    id: "email-signature",
    label: "Assinatura de e-mail",
    description:
      "Gere e copie a assinatura corporativa no padrão da marca Elinsa.",
    href: "/portal/assinatura-de-email",
    icon: "Mail",
  },
];

export async function getAvailableInternalTools(
  context: InternalAccessContext,
) {
  const userTeamSet = new Set(context.teams);
  const configuredTools = await listConfiguredPortalTools();
  const builtinHrefs = new Set(BUILTIN_INTERNAL_TOOLS.map((tool) => tool.href));

  const teamTools = configuredTools
    .filter((tool) => context.isOrgAdmin || userTeamSet.has(tool.teamName))
    .filter((tool) => !builtinHrefs.has(tool.href))
    .map<InternalTool>((tool) => ({
      id: tool.id,
      label: tool.label,
      description: tool.description,
      href: tool.href,
      icon: tool.icon,
      teamName: tool.teamName,
    }));

  return [...BUILTIN_INTERNAL_TOOLS, ...teamTools];
}

async function listConfiguredPortalTools() {
  try {
    return await db
      .select({
        id: portalTool.id,
        label: portalTool.label,
        description: portalTool.description,
        href: portalTool.href,
        icon: portalTool.icon,
        teamName: team.name,
      })
      .from(portalTool)
      .innerJoin(team, eq(portalTool.teamId, team.id))
      .innerJoin(organization, eq(portalTool.organizationId, organization.id))
      .where(
        and(
          eq(organization.slug, ELINSA_ORGANIZATION_SLUG),
          eq(portalTool.isActive, true),
        ),
      );
  } catch (error) {
    if (isMissingPortalToolIconColumnError(error)) {
      const tools = await db
        .select({
          id: portalTool.id,
          label: portalTool.label,
          description: portalTool.description,
          href: portalTool.href,
          teamName: team.name,
        })
        .from(portalTool)
        .innerJoin(team, eq(portalTool.teamId, team.id))
        .innerJoin(organization, eq(portalTool.organizationId, organization.id))
        .where(
          and(
            eq(organization.slug, ELINSA_ORGANIZATION_SLUG),
            eq(portalTool.isActive, true),
          ),
        );

      return tools.map((tool) => ({ ...tool, icon: null }));
    }

    if (isMissingRelationError(error)) {
      return [];
    }

    throw error;
  }
}

function isMissingRelationError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const cause = "cause" in error ? error.cause : undefined;
  if (
    cause &&
    typeof cause === "object" &&
    "code" in cause &&
    cause.code === "42P01"
  ) {
    return true;
  }

  return error.message.includes('relation "portal_tool" does not exist');
}

export function isMissingPortalToolIconColumnError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const cause = "cause" in error ? error.cause : undefined;
  if (
    cause &&
    typeof cause === "object" &&
    "code" in cause &&
    cause.code === "42703"
  ) {
    return true;
  }

  return error.message.includes('column "icon" does not exist');
}

export function canManageTeam(
  context: InternalAccessContext,
  teamName: string,
) {
  return (
    context.isOrgAdmin ||
    (context.isTeamLeader && context.teams.includes(teamName))
  );
}

export function canManageAnyTeam(context: InternalAccessContext) {
  return (
    context.isOrgAdmin || (context.isTeamLeader && context.teams.length > 0)
  );
}

export async function requireInternalAccess() {
  const context = await getInternalAccessContext();
  if (!context) {
    redirect("/entrar");
  }
  return context;
}

export async function requireTeam(teamSlug: string) {
  const context = await requireInternalAccess();
  if (!context.teams.includes(teamSlug) && !context.isOrgAdmin) {
    notFound();
  }
  return context;
}

export async function requireOrgAdmin() {
  const context = await requireInternalAccess();
  if (!context.isOrgAdmin) {
    notFound();
  }
  return context;
}

export async function requireOrgAdminOrTeamLeader() {
  const context = await requireInternalAccess();
  if (!canManageAnyTeam(context)) {
    notFound();
  }
  return context;
}
