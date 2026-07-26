import { and, asc, eq, sql } from "drizzle-orm";

import type { Rule } from "@/lib/alerts/rules";

import { db } from "../index";
import { theses } from "../schema";

export type Thesis = typeof theses.$inferSelect;

export async function listTheses(
  userId: string,
  instrumentId: string,
): Promise<Thesis[]> {
  return db()
    .select()
    .from(theses)
    .where(
      and(eq(theses.userId, userId), eq(theses.instrumentId, instrumentId)),
    )
    .orderBy(asc(theses.createdAt));
}

export async function countActiveTheses(
  userId: string,
  instrumentId: string,
): Promise<number> {
  const rows = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(theses)
    .where(
      and(
        eq(theses.userId, userId),
        eq(theses.instrumentId, instrumentId),
        sql`${theses.status} != 'archived'`,
      ),
    );
  return rows[0]?.count ?? 0;
}

export async function insertThesis(
  userId: string,
  instrumentId: string,
  statement: string,
  rule: Rule | null,
): Promise<void> {
  await db().insert(theses).values({ userId, instrumentId, statement, rule });
}

export async function updateThesis(
  userId: string,
  thesisId: string,
  statement: string,
  rule: Rule | null,
): Promise<void> {
  // Editing resets to intact: the old verdict belonged to the old rule.
  await db()
    .update(theses)
    .set({ statement, rule, status: "intact", lastReviewedAt: new Date() })
    .where(and(eq(theses.id, thesisId), eq(theses.userId, userId)));
}

export async function archiveThesis(
  userId: string,
  thesisId: string,
): Promise<void> {
  await db()
    .update(theses)
    .set({ status: "archived" })
    .where(and(eq(theses.id, thesisId), eq(theses.userId, userId)));
}

export async function deleteThesis(
  userId: string,
  thesisId: string,
): Promise<void> {
  await db()
    .delete(theses)
    .where(and(eq(theses.id, thesisId), eq(theses.userId, userId)));
}
