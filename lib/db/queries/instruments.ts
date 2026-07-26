import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "../index";
import {
  instruments,
  priceHistory,
  snapshots,
  userInstruments,
} from "../schema";

export type Instrument = typeof instruments.$inferSelect;
export type Snapshot = typeof snapshots.$inferSelect;
export type UserInstrument = typeof userInstruments.$inferSelect;

export async function getOrCreateInstrument(values: {
  kind: string;
  symbol: string;
  market: string;
  currency: string;
  name: string | null;
  isManual?: boolean;
}): Promise<Instrument> {
  const inserted = await db()
    .insert(instruments)
    .values(values)
    .onConflictDoNothing()
    .returning();
  if (inserted[0]) return inserted[0];

  const existing = await db()
    .select()
    .from(instruments)
    .where(
      and(
        eq(instruments.symbol, values.symbol),
        eq(instruments.market, values.market),
      ),
    )
    .limit(1);
  if (!existing[0]) throw new Error(`instrument ${values.symbol} vanished`);
  return existing[0];
}

export async function findInstrument(
  symbol: string,
  market: string,
): Promise<Instrument | null> {
  const rows = await db()
    .select()
    .from(instruments)
    .where(and(eq(instruments.symbol, symbol), eq(instruments.market, market)))
    .limit(1);
  return rows[0] ?? null;
}

export async function addUserInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  await db()
    .insert(userInstruments)
    .values({ userId, instrumentId })
    .onConflictDoNothing();
}

export async function removeUserInstrument(
  userId: string,
  instrumentId: string,
): Promise<void> {
  await db()
    .delete(userInstruments)
    .where(
      and(
        eq(userInstruments.userId, userId),
        eq(userInstruments.instrumentId, instrumentId),
      ),
    );
}

export async function insertSnapshotIfAbsent(
  instrumentId: string,
  asOf: string,
  data: Record<string, unknown>,
  source: string,
): Promise<void> {
  await db()
    .insert(snapshots)
    .values({ instrumentId, asOf, data, source })
    .onConflictDoNothing();
}

/** Ownership + provenance check without loading the snapshot — the caller
 *  only needs to know "does this user track it, and is it hand-kept". */
export async function getOwnedInstrument(
  userId: string,
  instrumentId: string,
): Promise<Instrument | null> {
  const rows = await db()
    .select({ instrument: instruments })
    .from(userInstruments)
    .innerJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .where(
      and(
        eq(userInstruments.userId, userId),
        eq(userInstruments.instrumentId, instrumentId),
      ),
    )
    .limit(1);
  return rows[0]?.instrument ?? null;
}

/** A hand-entered price for a manual instrument. Writes the same snapshot +
 *  price_history shape the jobs write, so every downstream reader (charts,
 *  day change, valuation, portfolio) works without a special case. */
export async function setManualPrice(
  instrumentId: string,
  asOf: string,
  price: number,
  currency: string,
): Promise<void> {
  const data = { price, currency };
  // Both writes at once — they are independent, and each round trip to the
  // pooler is ~400ms of the user staring at a spinner.
  await Promise.all([
    db()
      .insert(snapshots)
      .values({ instrumentId, asOf, data, source: "manual" })
      .onConflictDoUpdate({
        target: [snapshots.instrumentId, snapshots.asOf],
        set: { data, source: "manual", fetchedAt: new Date() },
      }),
    db()
      .insert(priceHistory)
      .values({ instrumentId, priceDate: asOf, close: String(price) })
      .onConflictDoUpdate({
        target: [priceHistory.instrumentId, priceHistory.priceDate],
        set: { close: String(price) },
      }),
  ]);
}

export async function latestSnapshotFor(
  instrumentId: string,
): Promise<Snapshot | null> {
  const rows = await db()
    .select()
    .from(snapshots)
    .where(eq(snapshots.instrumentId, instrumentId))
    .orderBy(desc(snapshots.asOf))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * The newest snapshot for many instruments in ONE round trip.
 *
 * This matters more than it looks: a round trip to the pooler costs ~400ms,
 * so calling latestSnapshotFor in a loop turned every list page into
 * N × 400ms of dead time. DISTINCT ON is the Postgres-native "latest row per
 * group" and needs no window function.
 */
export async function latestSnapshotsFor(
  instrumentIds: string[],
): Promise<Map<string, Snapshot>> {
  const byInstrument = new Map<string, Snapshot>();
  if (instrumentIds.length === 0) return byInstrument;

  const rows = await db()
    .selectDistinctOn([snapshots.instrumentId])
    .from(snapshots)
    .where(inArray(snapshots.instrumentId, instrumentIds))
    .orderBy(snapshots.instrumentId, desc(snapshots.asOf));

  for (const row of rows) byInstrument.set(row.instrumentId, row);
  return byInstrument;
}

export interface TrackedInstrument {
  instrument: Instrument;
  latestSnapshot: Snapshot | null;
}

export async function listUserInstruments(
  userId: string,
): Promise<TrackedInstrument[]> {
  const rows = await db()
    .select()
    .from(userInstruments)
    .innerJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .where(eq(userInstruments.userId, userId))
    .orderBy(instruments.symbol);

  // Two round trips total, not one per instrument.
  const latest = await latestSnapshotsFor(rows.map((r) => r.instruments.id));
  return rows.map((row) => ({
    instrument: row.instruments,
    latestSnapshot: latest.get(row.instruments.id) ?? null,
  }));
}

export interface InstrumentPage {
  instrument: Instrument;
  userInstrument: UserInstrument;
  latestSnapshot: Snapshot | null;
}

export async function getInstrumentPage(
  userId: string,
  instrumentId: string,
): Promise<InstrumentPage | null> {
  const rows = await db()
    .select()
    .from(userInstruments)
    .innerJoin(instruments, eq(userInstruments.instrumentId, instruments.id))
    .where(
      and(
        eq(userInstruments.userId, userId),
        eq(userInstruments.instrumentId, instrumentId),
      ),
    )
    .limit(1);
  if (!rows[0]) return null;

  return {
    instrument: rows[0].instruments,
    userInstrument: rows[0].user_instruments,
    latestSnapshot: await latestSnapshotFor(instrumentId),
  };
}
