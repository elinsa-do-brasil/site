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
  canSubmitRequest: boolean;
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
    canSubmitRequest: context.isTeamLeader,
    hasPanelAccess:
      context.teams.includes(PSYCHOLOGICAL_CARE_TEAM) &&
      context.roles.includes(PSYCHOLOGICAL_CARE_ROLE),
  } satisfies PsychologicalCareAccessContext;
}

export async function canSubmitPsychologicalCareRequest(userId: string) {
  const context = await getPsychologicalCareAccessContext(userId);
  return context?.canSubmitRequest ?? false;
}

export async function canAccessPsychologicalCarePanel(userId: string) {
  const context = await getPsychologicalCareAccessContext(userId);
  return context?.hasPanelAccess ?? false;
}

export async function requirePsychologicalCareSubmissionAccess(
  userId?: string,
) {
  const context = await getPsychologicalCareAccessContext(userId);

  if (!context) {
    redirect("/entrar?redirectTo=/portal/atendimento-psicologico/solicitar");
  }

  if (!context.canSubmitRequest) {
    notFound();
  }

  return context;
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
