// Conexão Drizzle com o Postgres próprio do site (SITE_DATABASE_URL) — banco separado do CMS do Payload (CMS_DATABASE_URL, payload.config.ts). O pool fica em cache no globalThis para sobreviver aos hot-reloads do Next.js em dev.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var elinsaSiteDbPool: Pool | undefined;
}

function createPool() {
  if (!env.siteDatabaseUrl()) {
    throw new Error("SITE_DATABASE_URL nao configurada.");
  }

  return new Pool({
    connectionString: env.siteDatabaseUrl(),
  });
}

export const dbPool = globalThis.elinsaSiteDbPool ?? createPool();

// Só cacheia em dev: em produção cada processo deve criar seu próprio pool normalmente (evita reutilizar um pool entre lambdas/instâncias diferentes).
if (process.env.NODE_ENV !== "production") {
  globalThis.elinsaSiteDbPool = dbPool;
}

export const db = drizzle({ client: dbPool, schema });
