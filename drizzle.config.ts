import { defineConfig } from "drizzle-kit";

if (!process.env.SITE_DATABASE_URL) {
  throw new Error("SITE_DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.SITE_DATABASE_URL,
  },
});
