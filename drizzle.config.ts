import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  // Supabase owns the anon/authenticated/service_role roles.
  entities: {
    roles: { provider: "supabase" },
  },
});
