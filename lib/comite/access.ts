// Controle de acesso do portal do Comitê de Ética (/portal/comite-de-etica) — exige ser membro da organização, além de estar na equipe E ter o cargo do comitê de ética (lib/organization/constants.ts).
import { notFound, redirect } from "next/navigation";
import {
  getElinsaMembership,
  getUserTeamsInElinsa,
  parseRoleList,
} from "@/lib/organization/access";
import {
  ETHICS_COMMITTEE_ROLE,
  ETHICS_COMMITTEE_TEAM,
} from "@/lib/organization/constants";

export type CommitteeContext = {
  userId: string;
  organizationId: string;
  roles: string[];
  teams: string[];
  isCommitteeTeamMember: boolean;
  isCommitteeLawyer: boolean;
  hasCommitteeAccess: boolean;
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
  // Acesso exige as duas condições ao mesmo tempo: pertencer à equipe do comitê NÃO basta sem o cargo "ethics", e vice-versa — ver hasCommitteeAccess abaixo.
  const isCommitteeTeamMember = teamNames.includes(ETHICS_COMMITTEE_TEAM);
  const isCommitteeLawyer = roles.includes(ETHICS_COMMITTEE_ROLE);

  return {
    userId,
    organizationId: membership.organizationId,
    roles,
    teams: teamNames,
    isCommitteeTeamMember,
    isCommitteeLawyer,
    hasCommitteeAccess: isCommitteeTeamMember && isCommitteeLawyer,
  };
}

export async function requireCommitteeAccess(userId: string) {
  const context = await getCommitteeContext(userId);

  if (!context) {
    notFound();
  }

  if (context.hasCommitteeAccess) {
    return context;
  }

  notFound();
}

export async function canListReports(userId: string) {
  const context = await getCommitteeContext(userId);

  if (!context) return false;

  return context.hasCommitteeAccess;
}

export async function canReadReport(input: {
  userId: string;
  reportId: string;
}) {
  const context = await getCommitteeContext(input.userId);

  if (!context) return false;

  return context.hasCommitteeAccess;
}

export async function canUpdateReport(input: {
  userId: string;
  reportId: string;
}) {
  return canReadReport(input);
}

export function requireUserId(userId?: string) {
  if (!userId) {
    redirect("/entrar?redirectTo=/portal/comite-de-etica");
  }

  return userId;
}
