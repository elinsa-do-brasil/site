import { db, dbPool } from "./index";
import { organization, team } from "./schema";

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Insert Elinsa Organization
    console.log("Inserting organization 'Elinsa'...");
    await db
      .insert(organization)
      .values({
        id: "org_elinsa",
        name: "Elinsa",
        slug: "elinsa",
      })
      .onConflictDoNothing();

    // 2. Insert Teams
    console.log("Inserting default teams...");
    const teamsToInsert = [
      { id: "team_elinsa_ti", name: "ti", organizationId: "org_elinsa" },
      {
        id: "team_elinsa_comite_etica",
        name: "comite_etica",
        organizationId: "org_elinsa",
      },
      { id: "team_elinsa_rh", name: "rh", organizationId: "org_elinsa" },
      {
        id: "team_elinsa_administrativo",
        name: "administrativo",
        organizationId: "org_elinsa",
      },
      {
        id: "team_elinsa_operacional",
        name: "operacional",
        organizationId: "org_elinsa",
      },
      {
        id: "team_elinsa_diretoria",
        name: "diretoria",
        organizationId: "org_elinsa",
      },
    ];

    for (const teamItem of teamsToInsert) {
      await db
        .insert(team)
        .values({
          id: teamItem.id,
          name: teamItem.name,
          organizationId: teamItem.organizationId,
        })
        .onConflictDoNothing();
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    // Close the connection pool
    await dbPool.end();
  }
}

main();
