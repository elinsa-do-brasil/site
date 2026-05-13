"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { invitation, organization, team } from "@/lib/db/schema";
import { sendInternalAuthEmail } from "@/lib/email";
import { requireOrgAdmin } from "@/lib/organization/access";

export async function enviarConviteAdmin(formData: FormData) {
  const context = await requireOrgAdmin();

  const email = formData.get("email")?.toString().trim();
  const role = formData.get("role")?.toString().trim() || "member";
  const teamId = formData.get("teamId")?.toString().trim();
  const mensagem = formData.get("mensagem")?.toString().trim();

  if (!email) {
    return { error: "O e-mail é obrigatório." };
  }

  // Buscar a organização institucional
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, "elinsa"));

  if (!org) {
    return { error: "Organização principal não encontrada no sistema." };
  }

  let selectedTeamName = "";
  if (teamId) {
    const [t] = await db.select().from(team).where(eq(team.id, teamId));
    if (t) {
      selectedTeamName = t.name;
    }
  }

  // Cancelar convites pendentes anteriores para o mesmo e-mail nesta organização
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
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  await db.insert(invitation).values({
    id: inviteId,
    organizationId: org.id,
    email,
    role,
    status: "pending",
    expiresAt,
    inviterId: context.userId,
    teamId: teamId || null,
  });

  // Enviar e-mail transacional do convite
  const baseUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "http://localhost:3000";
  const inviteLink = `${baseUrl}/convite/${inviteId}`;

  const linhasEmail = [
    `Olá,`,
    ``,
    `Você foi convidado(a) para acessar o Portal Interno da organização ${org.name}.`,
    `Nível de acesso concedido: ${role.toUpperCase()}`,
    selectedTeamName
      ? `Time inicial alocado: ${selectedTeamName.replace("_", " ")}`
      : "",
    mensagem ? `` : "",
    mensagem ? `Mensagem do administrador:` : "",
    mensagem ? `"${mensagem}"` : "",
    ``,
    `Para aceitar o convite e liberar seu acesso, utilize o link abaixo:`,
    inviteLink,
    ``,
    `Importante: Caso ainda não possua uma conta ativada, crie sua conta utilizando este mesmo e-mail antes de aceitar o convite.`,
    ``,
    `Este convite expira em 7 dias.`,
  ].filter((l) => l !== "");

  await sendInternalAuthEmail({
    to: email,
    subject: `Convite de acesso: Portal Interno ${org.name}`,
    text: linhasEmail.join("\n"),
    idempotencyKey: `invite-admin/${inviteId}/${Date.now()}`,
  });

  revalidatePath("/portal/gestao/convites");
  return { success: true };
}

export async function cancelarConviteAdmin(invitationId: string) {
  await requireOrgAdmin();

  await db
    .update(invitation)
    .set({ status: "canceled" })
    .where(eq(invitation.id, invitationId));

  revalidatePath("/portal/gestao/convites");
  return { success: true };
}
