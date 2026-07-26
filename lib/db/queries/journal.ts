import { and, desc, eq } from "drizzle-orm";

import { db } from "../index";
import { instruments, journalEntries } from "../schema";

export type JournalEntry = typeof journalEntries.$inferSelect;

export async function listInstrumentEntries(
  userId: string,
  instrumentId: string,
): Promise<JournalEntry[]> {
  return db()
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.instrumentId, instrumentId),
      ),
    )
    .orderBy(desc(journalEntries.tradeDate), desc(journalEntries.createdAt));
}

export interface JournalTimelineItem {
  entry: JournalEntry;
  symbol: string;
  name: string | null;
  kind: string;
  currency: string;
  instrumentId: string;
}

export async function listAllEntries(
  userId: string,
): Promise<JournalTimelineItem[]> {
  const rows = await db()
    .select()
    .from(journalEntries)
    .innerJoin(instruments, eq(journalEntries.instrumentId, instruments.id))
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.tradeDate), desc(journalEntries.createdAt));

  return rows.map((row) => ({
    entry: row.journal_entries,
    symbol: row.instruments.symbol,
    name: row.instruments.name,
    kind: row.instruments.kind,
    currency: row.instruments.currency,
    instrumentId: row.instruments.id,
  }));
}

export async function insertEntry(values: {
  userId: string;
  instrumentId: string;
  kind: "buy" | "sell" | "sip" | "note";
  tradeDate: string;
  price: string | null;
  quantity: string | null;
  reasoning: string;
}): Promise<void> {
  await db().insert(journalEntries).values(values);
}

export async function deleteEntry(
  userId: string,
  entryId: string,
): Promise<void> {
  await db()
    .delete(journalEntries)
    .where(
      and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)),
    );
}
