import { and, eq } from "drizzle-orm";
import { db, dbPool } from "../lib/db";
import { member, organization, team, teamMember, user } from "../lib/db/schema";

async function main() {
  console.log("👑 Iniciando bootstrap do administrador principal...");

  const adminEmail = "raave.aires@grupoamperelinsa.com";
  const adminName = "Raave Aires";

  try {
    // 1. Garantir organização Elinsa
    console.log("Verificando organização 'Elinsa'...");
    let [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, "elinsa"));

    if (!org) {
      console.log("Criando organização 'Elinsa'...");
      const [newOrg] = await db
        .insert(organization)
        .values({
          id: "org_elinsa",
          name: "Elinsa",
          slug: "elinsa",
        })
        .returning();
      org = newOrg;
    }

    // 2. Garantir times: comite_etica e ti
    console.log("Verificando times institucionais...");
    const requiredTeams = [
      { id: "team_elinsa_comite_etica", name: "comite_etica" },
      { id: "team_elinsa_ti", name: "ti" },
    ];

    const teamMap = new Map<string, string>();

    for (const rt of requiredTeams) {
      let [t] = await db
        .select()
        .from(team)
        .where(
          and(eq(team.organizationId, org.id), eq(team.name, rt.name)),
        );

      if (!t) {
        console.log(`Criando time '${rt.name}'...`);
        const [newT] = await db
          .insert(team)
          .values({
            id: rt.id,
            name: rt.name,
            organizationId: org.id,
          })
          .returning();
        t = newT;
      }
      teamMap.set(rt.name, t.id);
    }

    // 3. Buscar ou criar o usuário administrador
    console.log(`Verificando usuário '${adminEmail}'...`);
    let [targetUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, adminEmail));

    if (!targetUser) {
      console.log("Criando usuário administrador...");
      const userId = crypto.randomUUID();
      const [newUser] = await db
        .insert(user)
        .values({
          id: userId,
          name: adminName,
          email: adminEmail,
          emailVerified: true,
        })
        .returning();
      targetUser = newUser;
    } else {
      console.log(`Usuário encontrado com ID: ${targetUser.id}`);
      // Garantir que o e-mail esteja verificado
      if (!targetUser.emailVerified) {
        await db
          .update(user)
          .set({ emailVerified: true })
          .where(eq(user.id, targetUser.id));
      }
    }

    // 4. Garantir papel de 'owner' ou 'admin' na organização
    console.log("Verificando filiação (membership) na organização...");
    const [existingMember] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, org.id),
          eq(member.userId, targetUser.id),
        ),
      );

    if (!existingMember) {
      console.log("Atribuindo papel de 'owner' ao usuário...");
      await db.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: org.id,
        userId: targetUser.id,
        role: "owner",
      });
    } else if (
      existingMember.role !== "owner" &&
      existingMember.role !== "admin"
    ) {
      console.log("Promovendo usuário para 'owner'...");
      await db
        .update(member)
        .set({ role: "owner" })
        .where(eq(member.id, existingMember.id));
    } else {
      console.log(`Usuário já possui papel adequado: ${existingMember.role}`);
    }

    // 5. Garantir vínculo a ambos os times
    console.log("Garantindo vínculo aos times do Comitê de Ética e de TI...");
    for (const [teamName, teamId] of teamMap.entries()) {
      const [existingTm] = await db
        .select()
        .from(teamMember)
        .where(
          and(
            eq(teamMember.teamId, teamId),
            eq(teamMember.userId, targetUser.id),
          ),
        );

      if (!existingTm) {
        console.log(`Vinculando ao time '${teamName}'...`);
        await db.insert(teamMember).values({
          id: crypto.randomUUID(),
          teamId,
          userId: targetUser.id,
        });
      } else {
        console.log(`Usuário já vinculado ao time '${teamName}'`);
      }
    }

    console.log("✅ Bootstrap administrativo concluído com absoluto sucesso!");
  } catch (error) {
    console.error("❌ Falha no bootstrap administrativo:", error);
    process.exit(1);
  } finally {
    await dbPool.end();
  }
}

main();
