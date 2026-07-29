import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool, type PoolClient } from "pg";

const MIGRATIONS_FOLDER = resolve("lib/db/migrations");
const BASELINE_THROUGH_INDEX = 2;
const ALLOWED_MISSING_BASELINE_TABLES = new Set([
  "contact_rate_limits",
  "contacts",
]);

type Journal = {
  entries: Array<{
    idx: number;
    tag: string;
    when: number;
  }>;
};

type Snapshot = {
  tables: Record<
    string,
    {
      columns: Record<string, { name: string }>;
      name: string;
    }
  >;
};

const databaseUrl = process.env.SITE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("SITE_DATABASE_URL não configurada.");
}

const execute = process.argv.includes("--execute");
const confirmation = process.argv
  .find((argument) => argument.startsWith("--confirm-database="))
  ?.slice("--confirm-database=".length);
const configuredDatabase = new URL(databaseUrl).pathname.replace(/^\//, "");

if (execute && confirmation !== configuredDatabase) {
  throw new Error(
    `Para executar, informe --confirm-database=${configuredDatabase}.`,
  );
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  const journal = JSON.parse(
    await readFile(resolve(MIGRATIONS_FOLDER, "meta/_journal.json"), "utf8"),
  ) as Journal;
  const snapshot = JSON.parse(
    await readFile(
      resolve(
        MIGRATIONS_FOLDER,
        `meta/${String(BASELINE_THROUGH_INDEX).padStart(4, "0")}_snapshot.json`,
      ),
      "utf8",
    ),
  ) as Snapshot;
  const baselineEntries = journal.entries.filter(
    (entry) => entry.idx <= BASELINE_THROUGH_INDEX,
  );

  if (baselineEntries.length !== BASELINE_THROUGH_INDEX + 1) {
    throw new Error("O journal local não contém o baseline esperado.");
  }

  const client = await pool.connect();

  try {
    const state = await inspectDatabase(client, snapshot);

    console.log("Pré-verificação do baseline Drizzle:", {
      database: state.database,
      existingMigrationRecords: state.migrationCount,
      missingObjectsRepairedByNextMigration: state.allowedMissingTables,
      verifiedTables: state.verifiedTables,
    });

    if (!execute) {
      console.log(
        `Dry-run concluído. Para registrar o baseline: pnpm db:baseline --execute --confirm-database=${state.database}`,
      );
    } else {
      await client.query("begin");

      try {
        await client.query("select pg_advisory_xact_lock($1)", [2026072901]);
        const migrationCount = await getMigrationCount(client);

        if (migrationCount !== 0) {
          throw new Error(
            "O histórico de migrations mudou após a pré-verificação; operação cancelada.",
          );
        }

        for (const entry of baselineEntries) {
          const sql = await readFile(
            resolve(MIGRATIONS_FOLDER, `${entry.tag}.sql`),
            "utf8",
          );
          const hash = createHash("sha256").update(sql).digest("hex");

          await client.query(
            'insert into drizzle.__drizzle_migrations ("hash", "created_at") values ($1, $2)',
            [hash, entry.when],
          );
        }

        await client.query("commit");
        console.log(
          `Baseline registrado até ${baselineEntries.at(-1)?.tag ?? "desconhecido"}.`,
        );
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}

async function inspectDatabase(client: PoolClient, snapshot: Snapshot) {
  const databaseResult = await client.query<{ database: string }>(
    "select current_database() as database",
  );
  const migrationCount = await getMigrationCount(client);
  const tablesResult = await client.query<{ table_name: string }>(
    "select table_name from information_schema.tables where table_schema = 'public'",
  );
  const columnsResult = await client.query<{
    column_name: string;
    table_name: string;
  }>(
    "select table_name, column_name from information_schema.columns where table_schema = 'public'",
  );
  const database = databaseResult.rows[0]?.database;

  if (!database || database !== configuredDatabase) {
    throw new Error("O banco conectado não corresponde à URL configurada.");
  }

  if (migrationCount !== 0) {
    throw new Error(
      "O baseline só pode ser usado quando drizzle.__drizzle_migrations está vazio.",
    );
  }

  const actualTables = new Set(tablesResult.rows.map((row) => row.table_name));
  const actualColumns = new Set(
    columnsResult.rows.map((row) => `${row.table_name}.${row.column_name}`),
  );
  const expectedTables = Object.values(snapshot.tables);
  const missingTables = expectedTables
    .map((table) => table.name)
    .filter((tableName) => !actualTables.has(tableName));
  const unexpectedMissingTables = missingTables.filter(
    (tableName) => !ALLOWED_MISSING_BASELINE_TABLES.has(tableName),
  );

  if (unexpectedMissingTables.length > 0) {
    throw new Error(
      `Tabelas obrigatórias ausentes: ${unexpectedMissingTables.join(", ")}.`,
    );
  }

  const missingColumns = expectedTables.flatMap((table) => {
    if (!actualTables.has(table.name)) {
      return [];
    }

    return Object.values(table.columns)
      .filter((column) => !actualColumns.has(`${table.name}.${column.name}`))
      .map((column) => `${table.name}.${column.name}`);
  });

  if (missingColumns.length > 0) {
    throw new Error(
      `Colunas obrigatórias ausentes: ${missingColumns.join(", ")}.`,
    );
  }

  if (actualTables.has("rate_limit")) {
    throw new Error(
      "rate_limit já existe sem histórico; revise manualmente antes do baseline.",
    );
  }

  return {
    allowedMissingTables: missingTables,
    database,
    migrationCount,
    verifiedTables: expectedTables.length - missingTables.length,
  };
}

async function getMigrationCount(client: PoolClient) {
  const result = await client.query<{ count: string }>(
    "select count(*)::text as count from drizzle.__drizzle_migrations",
  );
  return Number(result.rows[0]?.count ?? Number.NaN);
}
