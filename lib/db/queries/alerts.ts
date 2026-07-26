import { and, eq, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";

import type { AlertEvent, ThesisStatus } from "@/lib/alerts/engine";
import type { Rule } from "@/lib/alerts/rules";

import { db } from "../index";
import {
  alertEvents,
  instruments,
  snapshots,
  theses,
  valuations,
} from "../schema";

export interface RuledThesis {
  id: string;
  userId: string;
  instrumentId: string;
  statement: string;
  status: ThesisStatus;
  rule: Rule;
  symbol: string;
  name: string | null;
}

export async function listRuledTheses(): Promise<RuledThesis[]> {
  const rows = await db()
    .select()
    .from(theses)
    .innerJoin(instruments, eq(theses.instrumentId, instruments.id))
    .where(and(isNotNull(theses.rule), ne(theses.status, "archived")));

  return rows.map((row) => ({
    id: row.theses.id,
    userId: row.theses.userId,
    instrumentId: row.theses.instrumentId,
    statement: row.theses.statement,
    status: row.theses.status as ThesisStatus,
    rule: row.theses.rule as Rule,
    symbol: row.instruments.symbol,
    name: row.instruments.name,
  }));
}

export async function snapshotsForDate(
  instrumentIds: string[],
  asOf: string,
): Promise<Map<string, Record<string, unknown>>> {
  if (instrumentIds.length === 0) return new Map();
  const rows = await db()
    .select()
    .from(snapshots)
    .where(
      and(
        inArray(snapshots.instrumentId, instrumentIds),
        eq(snapshots.asOf, asOf),
      ),
    );
  return new Map(rows.map((r) => [r.instrumentId, r.data]));
}

export async function savedValuationsFor(
  pairs: { userId: string; instrumentId: string }[],
): Promise<
  Map<string, { model: string; assumptions: Record<string, unknown> }[]>
> {
  if (pairs.length === 0) return new Map();
  const userIds = [...new Set(pairs.map((p) => p.userId))];
  const rows = await db()
    .select()
    .from(valuations)
    .where(inArray(valuations.userId, userIds));
  const map = new Map<
    string,
    { model: string; assumptions: Record<string, unknown> }[]
  >();
  for (const row of rows) {
    const key = `${row.userId}:${row.instrumentId}`;
    map.set(key, [
      ...(map.get(key) ?? []),
      {
        model: row.model,
        assumptions: row.assumptions as Record<string, unknown>,
      },
    ]);
  }
  return map;
}

export async function recordAlertEvents(
  events: (AlertEvent & {
    userId: string;
    symbol: string;
    statement: string;
    ruleDesc: string;
    snapshotId?: string | null;
  })[],
  firedOn: string,
): Promise<number> {
  if (events.length === 0) return 0;
  // Dedup is a DB guarantee: partial unique (thesis_id, fired_on).
  const inserted = await db()
    .insert(alertEvents)
    .values(
      events.map((e) => ({
        userId: e.userId,
        thesisId: e.thesisId,
        ruleDesc: e.ruleDesc,
        firedOn,
        snapshotId: e.snapshotId ?? null,
        context: {
          symbol: e.symbol,
          statement: e.statement,
          metric: e.metric,
          op: e.op,
          threshold: e.threshold,
          observed: e.observed,
        },
      })),
    )
    .onConflictDoNothing()
    .returning({ id: alertEvents.id });
  return inserted.length;
}

export async function applyStatusChanges(
  changes: { thesisId: string; to: ThesisStatus }[],
): Promise<void> {
  for (const change of changes) {
    await db()
      .update(theses)
      .set({ status: change.to })
      .where(eq(theses.id, change.thesisId));
  }
}

export interface DeliverableEvent {
  eventId: string;
  firedOn: string;
  context: Record<string, unknown>;
  email: string | null;
  instrumentId: string | null;
}

export async function listUndeliveredEvents(
  firedOn: string,
): Promise<DeliverableEvent[]> {
  const rows = await db()
    .select({
      eventId: alertEvents.id,
      firedOn: alertEvents.firedOn,
      context: alertEvents.context,
      email: authUsers.email,
      thesisId: alertEvents.thesisId,
    })
    .from(alertEvents)
    .innerJoin(authUsers, eq(alertEvents.userId, authUsers.id))
    .where(
      and(isNull(alertEvents.deliveredAt), eq(alertEvents.firedOn, firedOn)),
    );

  const withInstrument: DeliverableEvent[] = [];
  for (const row of rows) {
    let instrumentId: string | null = null;
    if (row.thesisId) {
      const t = await db()
        .select({ instrumentId: theses.instrumentId })
        .from(theses)
        .where(eq(theses.id, row.thesisId))
        .limit(1);
      instrumentId = t[0]?.instrumentId ?? null;
    }
    withInstrument.push({
      eventId: row.eventId,
      firedOn: row.firedOn,
      context: row.context as Record<string, unknown>,
      email: row.email,
      instrumentId,
    });
  }
  return withInstrument;
}

export async function markDelivered(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return;
  await db()
    .update(alertEvents)
    .set({ deliveredAt: new Date() })
    .where(inArray(alertEvents.id, eventIds));
}
