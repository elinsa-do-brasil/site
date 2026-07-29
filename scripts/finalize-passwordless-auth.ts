import { eq, inArray } from "drizzle-orm";
import { db, dbPool } from "@/lib/db";
import { account, session } from "@/lib/db/schema";

const execute = process.argv.includes("--execute");

async function main() {
  const credentialAccounts = await db
    .select({ id: account.id, userId: account.userId })
    .from(account)
    .where(eq(account.providerId, "credential"));
  const userIds = [...new Set(credentialAccounts.map((item) => item.userId))];
  const affectedSessions =
    userIds.length > 0
      ? await db
          .select({ id: session.id })
          .from(session)
          .where(inArray(session.userId, userIds))
      : [];

  console.log("Resumo da finalização passwordless:", {
    credentialAccounts: credentialAccounts.length,
    sessionsToRevoke: affectedSessions.length,
    usersAffected: userIds.length,
  });

  if (!execute) {
    console.log(
      "Dry-run concluído. Faça backup do banco e use --execute para aplicar.",
    );
    return;
  }

  await db.transaction(async (tx) => {
    if (userIds.length > 0) {
      await tx.delete(session).where(inArray(session.userId, userIds));
    }

    await tx.delete(account).where(eq(account.providerId, "credential"));
  });

  console.log("Contas de senha removidas e sessões afetadas revogadas.");
}

try {
  await main();
} finally {
  await dbPool.end();
}
