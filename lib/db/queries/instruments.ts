import { and, desc, eq } from "drizzle-orm";

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
  await db()
    .insert(snapshots)
    .values({ instrumentId, asOf, data, source: "manual" })
    .onConflictDoUpdate({
      target: [snapshots.instrumentId, snapshots.asOf],
      set: { data, source: "manual", fetchedAt: new Date() },
    });
  await db()
    .insert(priceHistory)
    .values({ instrumentId, priceDate: asOf, close: String(price) })
    .onConflictDoUpdate({
      target: [priceHistory.instrumentId, priceHistory.priceDate],
      set: { close: String(price) },
    });
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

  const result: TrackedInstrument[] = [];
  for (const row of rows) {
    result.push({
      instrument: row.instruments,
      latestSnapshot: await latestSnapshotFor(row.instruments.id),
    });
  }
  return result;
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
