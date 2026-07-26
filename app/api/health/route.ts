import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { snapshots } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

// 200 iff the newest snapshot is < 48h old; 500 when stale, missing, or the
// database is unreachable — an uptime monitor here doubles as a
// dead-pipeline alarm.
export async function GET() {
  try {
    const rows = await db()
      .select({ fetchedAt: snapshots.fetchedAt })
      .from(snapshots)
      .orderBy(desc(snapshots.fetchedAt))
      .limit(1);

    const newest = rows[0]?.fetchedAt ?? null;
    if (newest && Date.now() - newest.getTime() < MAX_AGE_MS) {
      return NextResponse.json({ ok: true, newestSnapshot: newest });
    }
    return NextResponse.json(
      {
        ok: false,
        newestSnapshot: newest,
        reason: newest ? "newest snapshot older than 48h" : "no snapshots",
      },
      { status: 500 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, reason: "database unreachable" },
      { status: 500 },
    );
  }
}
