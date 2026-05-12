import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var elinsaAuthDbPool: Pool | undefined;
}

function createPool() {
  if (!process.env.AUTH_DATABASE_URL) {
    throw new Error("AUTH_DATABASE_URL nao configurada.");
  }

  return new Pool({
    connectionString: process.env.AUTH_DATABASE_URL,
  });
}

export const dbPool = globalThis.elinsaAuthDbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.elinsaAuthDbPool = dbPool;
}

export const db = drizzle({ client: dbPool, schema });
