import { notFound, redirect } from "next/navigation";
import { getInternalAccessContext } from "@/lib/organization/access";
import {
  PSYCHOLOGICAL_CARE_ROLE,
  PSYCHOLOGICAL_CARE_TEAM,
} from "@/lib/organization/constants";

export type PsychologicalCareAccessContext = {
  userId: string;
  organizationId: string;
  roles: string[];
  teams: string[];
  hasPanelAccess: boolean;
};

export async function getPsychologicalCareAccessContext(userId?: string) {
  const context = await getInternalAccessContext(userId);

  if (!context) return null;

  return {
    userId: context.userId,
    organizationId: context.organizationId,
    roles: context.roles,
    teams: context.teams,
    hasPanelAccess:
      context.teams.includes(PSYCHOLOGICAL_CARE_TEAM) &&
      context.roles.includes(PSYCHOLOGICAL_CARE_ROLE),
  } satisfies PsychologicalCareAccessContext;
}

export async function canAccessPsychologicalCarePanel(userId: string) {
  const context = await getPsychologicalCareAccessContext(userId);
  return context?.hasPanelAccess ?? false;
}

export async function requirePsychologicalCarePanelAccess(userId?: string) {
  const context = await getPsychologicalCareAccessContext(userId);

  if (!context) {
    redirect("/entrar?redirectTo=/portal/atendimento-psicologico");
  }

  if (!context.hasPanelAccess) {
    notFound();
  }

  return context;
}
