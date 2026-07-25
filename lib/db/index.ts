import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Lazy singleton: importing this module never throws at build time.
export function db() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // prepare:false — pooler-safe. Small pool + idle timeout: Supabase's
    // free-tier pooler slots are shared by dev + prod + jobs.
    _db = drizzle(postgres(url, { prepare: false, max: 4, idle_timeout: 20 }), {
      schema,
    });
  }
  return _db;
}
