export const TEAM_LEADER_ROLE = "team_leader";
export const ETHICS_COMMITTEE_ROLE = "ethics";
export const ETHICS_COMMITTEE_TEAM = "comite_etica";

export const ORGANIZATION_ROLE_LABELS = {
  member: "Membro",
  admin: "Administrador",
  owner: "Proprietário",
  [TEAM_LEADER_ROLE]: "Líder de equipe",
  [ETHICS_COMMITTEE_ROLE]: "Membro do comitê",
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

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  accepted: "Aceito",
  canceled: "Revogado",
  pending: "Pendente",
  rejected: "Recusado",
};

export function formatOrganizationRole(role: string) {
  return (
    parseOrganizationRoleList(role)
      .map((item) => getOrganizationRoleLabel(item))
      .join(", ") || ORGANIZATION_ROLE_LABELS.member
  );
}

export function parseOrganizationRoleList(role: string) {
  return role
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatInvitationStatus(status: string) {
  return (
    INVITATION_STATUS_LABELS[status as InvitationStatus] ??
    getOrganizationRoleLabel(status)
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
