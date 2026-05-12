import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { reportAssignments } from "@/lib/db/schema";
import {
  getElinsaMembership,
  getUserTeamsInElinsa,
  parseRoleList,
} from "@/lib/organization/access";

const COMMITTEE_TEAM = "comite_etica";
const TECHNICAL_TEAM = "ti";

const FULL_ACCESS_ROLES = new Set(["owner", "admin", "ethics_admin"]);
const MEMBER_ROLES = new Set(["ethics_member"]);
const CONSULTANT_ROLES = new Set(["ethics_consultant"]);
const TECHNICAL_ROLES = new Set(["ethics_technical"]);

export type CommitteeContext = {
  userId: string;
  organizationId: string;
  roles: string[];
  teams: string[];
  isCommitteeTeamMember: boolean;
  isTechnicalTeamMember: boolean;
  hasFullAccess: boolean;
  isCommitteeMember: boolean;
  isConsultant: boolean;
  isTechnical: boolean;
};

export async function getCommitteeContext(
  userId: string,
): Promise<CommitteeContext | null> {
  const membership = await getElinsaMembership(userId);

  if (!membership) {
    return null;
  }

  const teams = await getUserTeamsInElinsa(userId);
  const teamNames = teams.map((item) => item.name);
  const roles = parseRoleList(membership.role);
  const isCommitteeTeamMember = teamNames.includes(COMMITTEE_TEAM);
  const isTechnicalTeamMember = teamNames.includes(TECHNICAL_TEAM);

  return {
    userId,
    organizationId: membership.organizationId,
    roles,
    teams: teamNames,
    isCommitteeTeamMember,
    isTechnicalTeamMember,
    hasFullAccess: roles.some((role) => FULL_ACCESS_ROLES.has(role)),
    isCommitteeMember: roles.some((role) => MEMBER_ROLES.has(role)),
    isConsultant: roles.some((role) => CONSULTANT_ROLES.has(role)),
    isTechnical: roles.some((role) => TECHNICAL_ROLES.has(role)),
  };
}

export async function requireCommitteeAccess(userId: string) {
  const context = await getCommitteeContext(userId);

  if (!context) {
    notFound();
  }

  if (
    context.isCommitteeTeamMember ||
    context.hasFullAccess ||
    (context.isTechnicalTeamMember && context.isTechnical)
  ) {
    return context;
  }

  notFound();
}

export async function canListReports(userId: string) {
  const context = await getCommitteeContext(userId);

  if (!context) return false;

  return (
    context.hasFullAccess ||
    (context.isCommitteeTeamMember &&
      (context.isCommitteeMember || context.isConsultant))
  );
}

export async function canReadReport(input: {
  userId: string;
  reportId: string;
}) {
  const context = await getCommitteeContext(input.userId);

  if (!context) return false;

  if (
    context.hasFullAccess ||
    (context.isCommitteeTeamMember && context.isCommitteeMember)
  ) {
    return true;
  }

  if (context.isCommitteeTeamMember && context.isConsultant) {
    return isAssigned(input);
  }

  if (context.isTechnicalTeamMember && context.isTechnical) {
    return isAssigned(input);
  }

  return false;
}

export async function canUpdateReport(input: {
  userId: string;
  reportId: string;
}) {
  return canReadReport(input);
}

export function requireUserId(userId?: string) {
  if (!userId) {
    redirect("/login?redirectTo=/comite");
  }

  return userId;
}

async function isAssigned(input: { userId: string; reportId: string }) {
  const [assignment] = await db
    .select({ id: reportAssignments.id })
    .from(reportAssignments)
    .where(
      and(
        eq(reportAssignments.userId, input.userId),
        eq(reportAssignments.reportId, input.reportId),
      ),
    );

  return Boolean(assignment);
}
