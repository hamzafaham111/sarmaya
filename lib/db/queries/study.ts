import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";

import { db } from "../index";
import {
  annotations,
  manualStatements,
  navHistory,
  priceHistory,
  statements,
  userInstruments,
} from "../schema";

export type StatementRow = typeof statements.$inferSelect;
export type Annotation = typeof annotations.$inferSelect;
export type ManualStatementRow = typeof manualStatements.$inferSelect;

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
export async function getNavSeries(
  instrumentId: string,
): Promise<PricePoint[]> {
  const rows = await db()
    .select({ date: navHistory.navDate, close: navHistory.nav })
    .from(navHistory)
    .where(eq(navHistory.instrumentId, instrumentId))
    .orderBy(asc(navHistory.navDate));
  return rows;
}

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

/**
 * Daily closes (stocks/indices) AND NAVs (funds) for many instruments in two
 * queries instead of one per instrument. The overview and watchlist both
 * need a series per row; the free-tier pooler gives us four connections, so
 * N+1 here is not an option.
 */
export async function getSeriesBatch(
  instrumentIds: string[],
  days: number,
): Promise<Map<string, PricePoint[]>> {
  const byInstrument = new Map<string, PricePoint[]>();
  if (instrumentIds.length === 0) return byInstrument;

  const since = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const [prices, navs] = await Promise.all([
    db()
      .select({
        instrumentId: priceHistory.instrumentId,
        date: priceHistory.priceDate,
        close: priceHistory.close,
      })
      .from(priceHistory)
      .where(
        and(
          inArray(priceHistory.instrumentId, instrumentIds),
          gte(priceHistory.priceDate, since),
        ),
      )
      .orderBy(asc(priceHistory.priceDate)),
    db()
      .select({
        instrumentId: navHistory.instrumentId,
        date: navHistory.navDate,
        close: navHistory.nav,
      })
      .from(navHistory)
      .where(
        and(
          inArray(navHistory.instrumentId, instrumentIds),
          gte(navHistory.navDate, since),
        ),
      )
      .orderBy(asc(navHistory.navDate)),
  ]);

  for (const row of [...prices, ...navs]) {
    const list = byInstrument.get(row.instrumentId) ?? [];
    list.push({ date: row.date, close: row.close });
    byInstrument.set(row.instrumentId, list);
  }
  return byInstrument;
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

/** The user's own statement figures for this instrument (overlaid on the
 *  fetched rows at read time — see lib/analysis/statements.ts). */
export async function getManualStatements(
  userId: string,
  instrumentId: string,
): Promise<ManualStatementRow[]> {
  return db()
    .select()
    .from(manualStatements)
    .where(
      and(
        eq(manualStatements.userId, userId),
        eq(manualStatements.instrumentId, instrumentId),
      ),
    )
    .orderBy(asc(manualStatements.fiscalYear));
}

export async function upsertManualStatement(values: {
  userId: string;
  instrumentId: string;
  fiscalYear: number;
  statement: string;
  data: Record<string, number | null>;
}): Promise<void> {
  await db()
    .insert(manualStatements)
    .values(values)
    .onConflictDoUpdate({
      target: [
        manualStatements.userId,
        manualStatements.instrumentId,
        manualStatements.fiscalYear,
        manualStatements.statement,
      ],
      set: { data: values.data, updatedAt: new Date() },
    });
}

export async function deleteManualStatement(
  userId: string,
  instrumentId: string,
  fiscalYear: number,
  statement: string,
): Promise<void> {
  await db()
    .delete(manualStatements)
    .where(
      and(
        eq(manualStatements.userId, userId),
        eq(manualStatements.instrumentId, instrumentId),
        eq(manualStatements.fiscalYear, fiscalYear),
        eq(manualStatements.statement, statement),
      ),
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
