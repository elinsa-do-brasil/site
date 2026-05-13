import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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
  teams: string[];
  isOrgAdmin: boolean;
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
    teams: teamNames,
    isOrgAdmin,
  };
}

export type InternalTool = {
  id: string;
  label: string;
  description: string;
  href: string;
  requiredTeams: string[];
  adminOnly?: boolean;
};

export function getAvailableInternalTools(context: InternalAccessContext) {
  const internalTools: InternalTool[] = [
    {
      id: "comite",
      label: "Comitê de Ética",
      description: "Triagem, acompanhamento e histórico do canal de denúncias.",
      href: "/portal/comite-de-etica",
      requiredTeams: ["comite_etica"],
    },
    {
      id: "ti",
      label: "Ferramentas de TI",
      description: "Atalhos e rotinas de apoio técnico disponíveis no portal.",
      href: "/portal",
      requiredTeams: ["ti"],
    },
    {
      id: "blog",
      label: "Blog interno",
      description: "Comunicados, eventos internos e novidades para as equipes.",
      href: "/portal/blog",
      requiredTeams: [],
    },
    {
      id: "convites",
      label: "Gestão de convites",
      description: "Envie, acompanhe e cancele convites de acesso interno.",
      href: "/portal/gestao/convites",
      requiredTeams: [],
      adminOnly: true,
    },
  ];

  const userTeamSet = new Set(context.teams);
  return internalTools.filter((tool) => {
    if (tool.adminOnly) {
      return context.isOrgAdmin;
    }

    if (tool.requiredTeams.length === 0) {
      return true;
    }

    return (
      context.isOrgAdmin ||
      tool.requiredTeams.some((reqTeam) => userTeamSet.has(reqTeam))
    );
  });
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
