import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var elinsaDbPool: Pool | undefined;
}

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export const dbPool = globalThis.elinsaDbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.elinsaDbPool = dbPool;
}

export const db = drizzle({ client: dbPool, schema });
