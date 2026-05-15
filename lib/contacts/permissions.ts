import { notFound } from "next/navigation";
import {
  type InternalAccessContext,
  requireInternalAccess,
} from "@/lib/organization/access";

const MARKETING_TEAM = "marketing";

export async function assertCanAccessContacts() {
  const context = await requireInternalAccess();

  if (!isMarketingTeamMember(context)) {
    notFound();
  }

  return context;
}

function isMarketingTeamMember(context: InternalAccessContext) {
  return context.teams.some(
    (teamName) => normalizeTeamName(teamName) === MARKETING_TEAM,
  );
}

function normalizeTeamName(teamName: string) {
  return teamName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
