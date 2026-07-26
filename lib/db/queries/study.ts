import { and, asc, desc, eq, gte } from "drizzle-orm";

import { db } from "../index";
import {
  annotations,
  priceHistory,
  statements,
  userInstruments,
} from "../schema";

export type StatementRow = typeof statements.$inferSelect;
export type Annotation = typeof annotations.$inferSelect;

export async function getStatementRows(
  instrumentId: string,
): Promise<StatementRow[]> {
  return db()
    .select()
    .from(statements)
    .where(eq(statements.instrumentId, instrumentId))
    .orderBy(asc(statements.fiscalYear));
}

export interface PricePoint {
  date: string;
  close: string; // numeric-as-string
}

export async function getPriceSeries(
  instrumentId: string,
  days: number,
): Promise<PricePoint[]> {
  const since = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const rows = await db()
    .select({ date: priceHistory.priceDate, close: priceHistory.close })
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.instrumentId, instrumentId),
        gte(priceHistory.priceDate, since),
      ),
    )
    .orderBy(asc(priceHistory.priceDate));
  return rows;
}

/** Last two closes -> day change fraction, display-only. */
export async function getDayChange(
  instrumentId: string,
): Promise<number | null> {
  const rows = await db()
    .select({ close: priceHistory.close })
    .from(priceHistory)
    .where(eq(priceHistory.instrumentId, instrumentId))
    .orderBy(desc(priceHistory.priceDate))
    .limit(2);
  if (rows.length < 2) return null;
  const [latest, prev] = rows.map((r) => Number(r.close));
  if (!Number.isFinite(latest) || !Number.isFinite(prev) || prev === 0) {
    return null;
  }
  return (latest - prev) / prev;
}

export async function getAnnotations(
  userId: string,
  instrumentId: string,
): Promise<Annotation[]> {
  return db()
    .select()
    .from(annotations)
    .where(
      and(
        eq(annotations.userId, userId),
        eq(annotations.instrumentId, instrumentId),
      ),
    )
    .orderBy(asc(annotations.createdAt));
}

export async function addAnnotation(values: {
  userId: string;
  instrumentId: string;
  target: string;
  body: string;
}): Promise<void> {
  await db().insert(annotations).values(values);
}

export async function deleteAnnotation(
  userId: string,
  annotationId: string,
): Promise<void> {
  await db()
    .delete(annotations)
    .where(
      and(eq(annotations.id, annotationId), eq(annotations.userId, userId)),
    );
}

export async function updateNotes(
  userId: string,
  instrumentId: string,
  notesMd: string,
): Promise<void> {
  await db()
    .update(userInstruments)
    .set({ notesMd, updatedAt: new Date() })
    .where(
      and(
        eq(userInstruments.userId, userId),
        eq(userInstruments.instrumentId, instrumentId),
      ),
    );
}
