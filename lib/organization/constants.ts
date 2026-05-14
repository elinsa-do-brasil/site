export const TEAM_LEADER_ROLE = "team_leader";

export const BUILTIN_ORG_ROLES = [
  "member",
  "admin",
  "owner",
  TEAM_LEADER_ROLE,
  "ethics_admin",
  "ethics_member",
  "ethics_consultant",
  "ethics_technical",
] as const;

export const TEAM_PERMISSION_OPTIONS = [
  {
    key: "members:invite",
    label: "Convidar membros",
    description: "Permite convidar novos membros como integrantes do time.",
  },
  {
    key: "members:manage",
    label: "Gerenciar membros",
    description: "Permite adicionar e remover integrantes do time.",
  },
  {
    key: "tools:manage",
    label: "Gerenciar ferramentas",
    description: "Permite editar os cards de ferramentas do time.",
  },
  {
    key: "reports:read",
    label: "Ler registros",
    description: "Permite consultar registros internos vinculados ao time.",
  },
  {
    key: "reports:write",
    label: "Atualizar registros",
    description: "Permite movimentar registros internos vinculados ao time.",
  },
] as const;

export const INVITATION_STATUS_OPTIONS = [
  "pending",
  "accepted",
  "canceled",
  "rejected",
] as const;

export type TeamPermissionKey = (typeof TEAM_PERMISSION_OPTIONS)[number]["key"];
export type InvitationStatus = (typeof INVITATION_STATUS_OPTIONS)[number];
