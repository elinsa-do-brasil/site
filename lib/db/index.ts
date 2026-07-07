import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var elinsaSiteDbPool: Pool | undefined;
}

function createPool() {
  if (!process.env.SITE_DATABASE_URL) {
    throw new Error("SITE_DATABASE_URL nao configurada.");
  }

  return new Pool({
    connectionString: process.env.SITE_DATABASE_URL,
  });
}

export const dbPool = globalThis.elinsaSiteDbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.elinsaSiteDbPool = dbPool;
}

export const db = drizzle({ client: dbPool, schema });
