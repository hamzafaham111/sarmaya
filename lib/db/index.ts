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
    // SQL_DEBUG=1 logs every statement. A round trip to the pooler costs
    // ~400ms, so "how many queries does this page make" is the single most
    // useful number when a screen feels slow.
    const debug = process.env.SQL_DEBUG
      ? (_conn: unknown, query: string) =>
          console.log(
            `[sql] ${Date.now()} ${query.replace(/\s+/g, " ").slice(0, 100)}`,
          )
      : undefined;
    // max 8: a page fires ~6 queries concurrently, and with only 4 slots the
    // rest queued into a second ~400ms wave. idle_timeout keeps them
    // released so dev + prod + jobs still share the free-tier pooler.
    _db = drizzle(
      postgres(url, { prepare: false, max: 8, idle_timeout: 20, debug }),
      { schema },
    );
  }
  return _db;
}
