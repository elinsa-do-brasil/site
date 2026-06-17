"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  invitation,
  member,
  organization,
  organizationRole,
  portalTool,
  team,
  teamMember,
  user,
} from "@/lib/db/schema";
import { sendInternalAuthEmail } from "@/lib/email";
import {
  canManageTeam,
  ELINSA_ORGANIZATION_SLUG,
  getAllElinsaTeams,
  parseRoleList,
  requireInternalAccess,
  requireOrgAdmin,
  requireOrgAdminOrTeamLeader,
} from "@/lib/organization/access";
import {
  BUILTIN_ORG_ROLES,
  formatOrganizationRole,
  INVITATION_STATUS_OPTIONS,
  type InvitationStatus,
  TEAM_LEADER_ROLE,
} from "@/lib/organization/constants";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const DEFAULT_INVITATION_DAYS = 7;

function revalidateAdminPortal(teamName?: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/gestao/convites");
  revalidatePath("/portal/gestao/organizacao");
  revalidatePath("/portal/gestao/equipes");
  revalidatePath("/portal/gestao/ferramentas");

  if (teamName) {
    revalidatePath(`/portal/gestao/equipes/${teamName}`);
  }
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return value?.toString().trim().toLowerCase() ?? "";
}

function normalizeRoles(value: FormDataEntryValue | null) {
  const roles = (value?.toString() || "member")
    .split(",")
    .map((role) => normalizeSlug(role))
    .filter(Boolean);

  return Array.from(new Set(roles)).join(",") || "member";
}

function isValidHref(value: string) {
  return value.startsWith("/") || value.startsWith("https://");
}

async function getElinsaOrganization() {
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, ELINSA_ORGANIZATION_SLUG));

  return org ?? null;
}

async function getElinsaTeam(teamId: string) {
  const [row] = await db
    .select({
      id: team.id,
      name: team.name,
      organizationId: team.organizationId,
    })
    .from(team)
    .innerJoin(organization, eq(team.organizationId, organization.id))
    .where(
      and(eq(team.id, teamId), eq(organization.slug, ELINSA_ORGANIZATION_SLUG)),
    );

  return row ?? null;
}

async function getManageableTeams() {
  const context = await requireOrgAdminOrTeamLeader();
  const teams = await getAllElinsaTeams();

  return {
    context,
    teams: teams.filter((item) => canManageTeam(context, item.name)),
  };
}

async function canManageTeamId(teamId: string) {
  const { context, teams } = await getManageableTeams();
  const selectedTeam = teams.find((item) => item.id === teamId);

  return { context, selectedTeam };
}

async function isLastOwner(input: {
  organizationId: string;
  memberId: string;
}) {
  const members = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(eq(member.organizationId, input.organizationId));
  const owners = members.filter((item) =>
    parseRoleList(item.role).includes("owner"),
  );

  return (
    owners.length <= 1 && owners.some((item) => item.id === input.memberId)
  );
}

export async function enviarConviteAdmin(
  formData: FormData,
): Promise<ActionResult> {
  const { context, teams } = await getManageableTeams();
  const org = await getElinsaOrganization();
  const email = normalizeEmail(formData.get("email"));
  const requestedRole = normalizeRoles(formData.get("role"));
  const teamId = formData.get("teamId")?.toString().trim();
  const mensagem = formData.get("mensagem")?.toString().trim();

  if (!org) {
    return { error: "Organização principal não encontrada no sistema." };
  }

  if (!email) {
    return { error: "O e-mail é obrigatório." };
  }

  const selectedTeam = teamId
    ? teams.find((item) => item.id === teamId)
    : undefined;

  if (teamId && !selectedTeam) {
    return { error: "Você não pode convidar membros para esta equipe." };
  }

  if (!context.isOrgAdmin && !selectedTeam) {
    return { error: "Líderes precisam selecionar uma de suas equipes." };
  }

  const role = context.isOrgAdmin ? requestedRole : "member";

  await db
    .update(invitation)
    .set({ status: "canceled" })
    .where(
      and(
        eq(invitation.organizationId, org.id),
        eq(invitation.email, email),
        eq(invitation.status, "pending"),
      ),
    );

  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + DEFAULT_INVITATION_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(invitation).values({
    id: inviteId,
    organizationId: org.id,
    email,
    role,
    status: "pending",
    expiresAt,
    inviterId: context.userId,
    teamId: selectedTeam?.id ?? null,
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  const inviteLink = `${baseUrl}/convite/${inviteId}`;
  const linhasEmail = [
    "Olá,",
    "",
    `Você foi convidado(a) para acessar o Portal Interno da organização ${org.name}.`,
    `Função concedida: ${formatOrganizationRole(role)}`,
    selectedTeam
      ? `Equipe inicial alocada: ${selectedTeam.name.replace("_", " ")}`
      : "",
    mensagem ? "" : "",
    mensagem ? "Mensagem do administrador:" : "",
    mensagem ? `"${mensagem}"` : "",
    "",
    "Para aceitar o convite e liberar seu acesso, utilize o link abaixo:",
    inviteLink,
    "",
    "Caso ainda não possua conta, este mesmo link abrirá a criação com o e-mail do convite.",
    "",
    `Este convite expira em ${DEFAULT_INVITATION_DAYS} dias.`,
  ].filter((line) => line !== "");

  await sendInternalAuthEmail({
    to: email,
    subject: `Convite de acesso: Portal Interno ${org.name}`,
    text: linhasEmail.join("\n"),
    idempotencyKey: `invite-admin/${inviteId}/${Date.now()}`,
  });

  revalidateAdminPortal(selectedTeam?.name);
  return { success: true };
}

export async function cancelarConviteAdmin(
  invitationId: string,
): Promise<ActionResult> {
  const { context, teams } = await getManageableTeams();
  const teamIds = new Set(teams.map((item) => item.id));
  const [existingInvitation] = await db
    .select({
      id: invitation.id,
      teamId: invitation.teamId,
      status: invitation.status,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(organization.slug, ELINSA_ORGANIZATION_SLUG),
      ),
    );

  if (!existingInvitation) {
    return { error: "Convite não encontrado." };
  }

  if (
    !context.isOrgAdmin &&
    (!existingInvitation.teamId || !teamIds.has(existingInvitation.teamId))
  ) {
    return { error: "Você não pode revogar este convite." };
  }

  await db
    .update(invitation)
    .set({ status: "canceled" })
    .where(eq(invitation.id, invitationId));

  const selectedTeam = teams.find(
    (team) => team.id === existingInvitation.teamId,
  );

  revalidateAdminPortal(selectedTeam?.name);
  return { success: true };
}

export async function atualizarStatusConviteAdmin(
  formData: FormData,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const invitationId = formData.get("invitationId")?.toString().trim();
  const status = formData.get("status")?.toString().trim() as InvitationStatus;

  if (!invitationId || !INVITATION_STATUS_OPTIONS.includes(status)) {
    return { error: "Status de convite inválido." };
  }

  await db
    .update(invitation)
    .set({ status })
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.organizationId, context.organizationId),
      ),
    );

  revalidateAdminPortal();
  return { success: true };
}

export async function adicionarMembroExistente(
  formData: FormData,
): Promise<ActionResult> {
  const { context, teams } = await getManageableTeams();
  const org = await getElinsaOrganization();
  const email = normalizeEmail(formData.get("email"));
  const requestedRole = normalizeRoles(formData.get("role"));
  const teamId = formData.get("teamId")?.toString().trim();

  if (!org) {
    return { error: "Organização principal não encontrada no sistema." };
  }

  if (!email) {
    return { error: "Informe o e-mail do usuário existente." };
  }

  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email));

  if (!targetUser) {
    return { error: "Usuário não encontrado. Envie um convite primeiro." };
  }

  const selectedTeam = teamId
    ? teams.find((item) => item.id === teamId)
    : undefined;

  if (teamId && !selectedTeam) {
    return { error: "Você não pode vincular usuários a esta equipe." };
  }

  if (!context.isOrgAdmin && !selectedTeam) {
    return { error: "Líderes precisam selecionar uma de suas equipes." };
  }

  const role = context.isOrgAdmin ? requestedRole : "member";
  const [existingMembership] = await db
    .select({ id: member.id })
    .from(member)
    .where(
      and(eq(member.organizationId, org.id), eq(member.userId, targetUser.id)),
    );

  if (!existingMembership) {
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      userId: targetUser.id,
      role,
    });
  }

  if (selectedTeam) {
    await db
      .insert(teamMember)
      .values({
        id: crypto.randomUUID(),
        teamId: selectedTeam.id,
        userId: targetUser.id,
      })
      .onConflictDoNothing();
  }

  revalidateAdminPortal(selectedTeam?.name);
  return { success: true };
}

export async function atualizarFuncaoMembro(
  formData: FormData,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const memberId = formData.get("memberId")?.toString().trim();
  const role = normalizeRoles(formData.get("role"));

  if (!memberId) {
    return { error: "Membro inválido." };
  }

  const [targetMember] = await db
    .select()
    .from(member)
    .where(eq(member.id, memberId));

  if (!targetMember) {
    return { error: "Membro não encontrado." };
  }

  if (targetMember.organizationId !== context.organizationId) {
    return { error: "Membro não pertence à organização atual." };
  }

  if (
    parseRoleList(targetMember.role).includes("owner") &&
    !parseRoleList(role).includes("owner") &&
    (await isLastOwner({
      organizationId: targetMember.organizationId,
      memberId: targetMember.id,
    }))
  ) {
    return {
      error: "Não é possível remover o último proprietário da organização.",
    };
  }

  await db.update(member).set({ role }).where(eq(member.id, memberId));

  revalidateAdminPortal();
  return { success: true };
}

export async function removerMembroDaOrganizacao(
  memberId: string,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const [targetMember] = await db
    .select()
    .from(member)
    .where(eq(member.id, memberId));

  if (!targetMember) {
    return { error: "Membro não encontrado." };
  }

  if (targetMember.organizationId !== context.organizationId) {
    return { error: "Membro não pertence à organização atual." };
  }

  if (
    parseRoleList(targetMember.role).includes("owner") &&
    (await isLastOwner({
      organizationId: targetMember.organizationId,
      memberId: targetMember.id,
    }))
  ) {
    return {
      error: "Não é possível remover o último proprietário da organização.",
    };
  }

  const orgTeams = await db
    .select({ id: team.id })
    .from(team)
    .where(eq(team.organizationId, targetMember.organizationId));
  const orgTeamIds = orgTeams.map((item) => item.id);

  if (orgTeamIds.length > 0) {
    await db
      .delete(teamMember)
      .where(
        and(
          eq(teamMember.userId, targetMember.userId),
          inArray(teamMember.teamId, orgTeamIds),
        ),
      );
  }

  await db.delete(member).where(eq(member.id, memberId));

  revalidateAdminPortal();
  return { success: true };
}

export async function salvarRoleOrganizacao(
  formData: FormData,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const role = normalizeSlug(formData.get("role")?.toString() ?? "");
  const permission = formData.get("permission")?.toString().trim() || "{}";

  if (!role) {
    return { error: "Informe um identificador para a função." };
  }

  if (BUILTIN_ORG_ROLES.includes(role as (typeof BUILTIN_ORG_ROLES)[number])) {
    return { error: "Funções padrão não precisam ser recriadas." };
  }

  const [existingRole] = await db
    .select({ id: organizationRole.id })
    .from(organizationRole)
    .where(
      and(
        eq(organizationRole.organizationId, context.organizationId),
        eq(organizationRole.role, role),
      ),
    );

  if (existingRole) {
    await db
      .update(organizationRole)
      .set({ permission, updatedAt: new Date() })
      .where(eq(organizationRole.id, existingRole.id));
  } else {
    await db.insert(organizationRole).values({
      id: crypto.randomUUID(),
      organizationId: context.organizationId,
      role,
      permission,
    });
  }

  revalidateAdminPortal();
  return { success: true };
}

export async function excluirRoleOrganizacao(
  roleId: string,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const [targetRole] = await db
    .select()
    .from(organizationRole)
    .where(
      and(
        eq(organizationRole.id, roleId),
        eq(organizationRole.organizationId, context.organizationId),
      ),
    );

  if (!targetRole) {
    return { error: "Função não encontrada." };
  }

  if (
    BUILTIN_ORG_ROLES.includes(
      targetRole.role as (typeof BUILTIN_ORG_ROLES)[number],
    )
  ) {
    return { error: "Funções padrão não podem ser excluídas." };
  }

  const orgMembers = await db
    .select({ role: member.role })
    .from(member)
    .where(eq(member.organizationId, context.organizationId));
  const isAssigned = orgMembers.some((item) =>
    parseRoleList(item.role).includes(targetRole.role),
  );

  if (isAssigned) {
    return { error: "A função ainda está atribuída a membros." };
  }

  await db.delete(organizationRole).where(eq(organizationRole.id, roleId));

  revalidateAdminPortal();
  return { success: true };
}

export async function criarTimeOrganizacao(
  formData: FormData,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const name = normalizeSlug(formData.get("name")?.toString() ?? "");

  if (!name) {
    return { error: "Informe o nome da equipe." };
  }

  await db
    .insert(team)
    .values({
      id: `team_elinsa_${name}`,
      name,
      organizationId: context.organizationId,
    })
    .onConflictDoNothing();

  revalidateAdminPortal();
  return { success: true };
}

export async function atualizarTimeOrganizacao(
  formData: FormData,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const teamId = formData.get("teamId")?.toString().trim();
  const name = normalizeSlug(formData.get("name")?.toString() ?? "");

  if (!teamId || !name) {
    return { error: "Informe a equipe e o novo nome." };
  }

  const selectedTeam = await getElinsaTeam(teamId);
  if (!selectedTeam || selectedTeam.organizationId !== context.organizationId) {
    return { error: "Equipe não encontrada." };
  }

  const [existingTeam] = await db
    .select({ id: team.id })
    .from(team)
    .where(
      and(eq(team.organizationId, context.organizationId), eq(team.name, name)),
    );

  if (existingTeam && existingTeam.id !== teamId) {
    return { error: "Já existe uma equipe com esse nome." };
  }

  await db
    .update(team)
    .set({ name, updatedAt: new Date() })
    .where(eq(team.id, teamId));

  revalidateAdminPortal(selectedTeam.name);
  revalidatePath(`/portal/gestao/equipes/${name}`);
  return { success: true };
}

export async function removerTimeOrganizacao(
  teamId: string,
): Promise<ActionResult> {
  const context = await requireOrgAdmin();
  const selectedTeam = await getElinsaTeam(teamId);

  if (!selectedTeam || selectedTeam.organizationId !== context.organizationId) {
    return { error: "Equipe não encontrada." };
  }

  const teams = await getAllElinsaTeams();
  if (teams.length <= 1) {
    return { error: "A organização precisa manter pelo menos uma equipe." };
  }

  await db.delete(team).where(eq(team.id, teamId));

  revalidateAdminPortal(selectedTeam.name);
  return { success: true };
}

export async function adicionarMembroAoTime(
  formData: FormData,
): Promise<ActionResult> {
  const teamId = formData.get("teamId")?.toString().trim();
  const userId = formData.get("userId")?.toString().trim();

  if (!teamId || !userId) {
    return { error: "Selecione a equipe e o membro." };
  }

  const { selectedTeam } = await canManageTeamId(teamId);
  if (!selectedTeam) {
    return { error: "Você não pode gerenciar esta equipe." };
  }

  const org = await getElinsaOrganization();
  if (!org) {
    return { error: "Organização principal não encontrada." };
  }

  const [membership] = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.organizationId, org.id), eq(member.userId, userId)));

  if (!membership) {
    return { error: "Este usuário ainda não é membro da organização." };
  }

  await db
    .insert(teamMember)
    .values({ id: crypto.randomUUID(), teamId, userId })
    .onConflictDoNothing();

  revalidateAdminPortal(selectedTeam.name);
  return { success: true };
}

export async function removerMembroDoTime(
  formData: FormData,
): Promise<ActionResult> {
  const teamId = formData.get("teamId")?.toString().trim();
  const userId = formData.get("userId")?.toString().trim();

  if (!teamId || !userId) {
    return { error: "Selecione a equipe e o membro." };
  }

  const { context, selectedTeam } = await canManageTeamId(teamId);
  if (!selectedTeam) {
    return { error: "Você não pode gerenciar esta equipe." };
  }

  if (!context.isOrgAdmin && userId === context.userId) {
    return { error: "Líderes não podem remover o próprio vínculo da equipe." };
  }

  const [targetMembership] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, context.organizationId),
        eq(member.userId, userId),
      ),
    );

  if (
    !context.isOrgAdmin &&
    targetMembership &&
    parseRoleList(targetMembership.role).includes(TEAM_LEADER_ROLE)
  ) {
    return {
      error: "Apenas administradores da organização removem líderes de equipe.",
    };
  }

  await db
    .delete(teamMember)
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)));

  revalidateAdminPortal(selectedTeam.name);
  return { success: true };
}

export async function salvarFerramentaTime(
  formData: FormData,
): Promise<ActionResult> {
  await requireInternalAccess();
  const toolId = formData.get("toolId")?.toString().trim();
  const teamId = formData.get("teamId")?.toString().trim();
  const slug = normalizeSlug(formData.get("slug")?.toString() ?? "");
  const label = formData.get("label")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const href = formData.get("href")?.toString().trim();
  const isActive = formData.get("isActive") === "on";

  if (!teamId || !slug || !label || !description || !href) {
    return { error: "Preencha todos os campos da ferramenta." };
  }

  if (!isValidHref(href)) {
    return { error: "Use um caminho interno iniciado por / ou uma URL https." };
  }

  const { context, selectedTeam } = await canManageTeamId(teamId);
  if (!selectedTeam) {
    return { error: "Você não pode gerenciar ferramentas desta equipe." };
  }

  if (toolId) {
    const [existingTool] = await db
      .select({ id: portalTool.id, teamId: portalTool.teamId })
      .from(portalTool)
      .where(eq(portalTool.id, toolId));

    if (!existingTool || existingTool.teamId !== teamId) {
      return { error: "Ferramenta não encontrada." };
    }

    await db
      .update(portalTool)
      .set({
        slug,
        label,
        description,
        href,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(portalTool.id, toolId));
  } else {
    await db.insert(portalTool).values({
      id: crypto.randomUUID(),
      organizationId: context.organizationId,
      teamId,
      slug,
      label,
      description,
      href,
      isActive,
    });
  }

  revalidateAdminPortal();
  return { success: true };
}

export async function excluirFerramentaTime(
  toolId: string,
): Promise<ActionResult> {
  const context = await requireOrgAdminOrTeamLeader();
  const [existingTool] = await db
    .select({
      id: portalTool.id,
      teamName: team.name,
    })
    .from(portalTool)
    .innerJoin(team, eq(portalTool.teamId, team.id))
    .where(eq(portalTool.id, toolId));

  if (!existingTool) {
    return { error: "Ferramenta não encontrada." };
  }

  if (!canManageTeam(context, existingTool.teamName)) {
    return { error: "Você não pode excluir esta ferramenta." };
  }

  await db.delete(portalTool).where(eq(portalTool.id, toolId));

  revalidateAdminPortal();
  return { success: true };
}
