// Só membros da equipe `marketing` (lib/organization) podem ver /portal/contatos.
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

// Remove acentos/maiúsculas antes de comparar com "marketing" — defesa extra caso o nome da equipe no banco não esteja exatamente no formato esperado.
function normalizeTeamName(teamName: string) {
  return teamName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
