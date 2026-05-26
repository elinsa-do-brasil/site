export const TEAM_LEADER_ROLE = "team_leader";
export const ETHICS_COMMITTEE_ROLE = "ethics";

export const ORGANIZATION_ROLE_LABELS = {
  member: "Membro",
  admin: "Administrador",
  owner: "Proprietário",
  [TEAM_LEADER_ROLE]: "Líder de equipe",
  [ETHICS_COMMITTEE_ROLE]: "Advogada externa do Comitê de Ética",
} as const;

export const BUILTIN_ORG_ROLES = [
  "member",
  "admin",
  "owner",
  TEAM_LEADER_ROLE,
  ETHICS_COMMITTEE_ROLE,
] as const;

export const INVITATION_STATUS_OPTIONS = [
  "pending",
  "accepted",
  "canceled",
  "rejected",
] as const;

export type InvitationStatus = (typeof INVITATION_STATUS_OPTIONS)[number];

export function formatOrganizationRole(role: string) {
  return (
    role
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => getOrganizationRoleLabel(item))
      .join(", ") || ORGANIZATION_ROLE_LABELS.member
  );
}

export function getOrganizationRoleLabel(role: string) {
  const knownRole =
    ORGANIZATION_ROLE_LABELS[role as keyof typeof ORGANIZATION_ROLE_LABELS];

  if (knownRole) {
    return knownRole;
  }

  const normalized = role.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return ORGANIZATION_ROLE_LABELS.member;
  }

  return normalized.charAt(0).toLocaleUpperCase("pt-BR") + normalized.slice(1);
}
