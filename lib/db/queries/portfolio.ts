import { eq } from "drizzle-orm";

import { computeHoldings } from "@/lib/analysis/holdings";
import type { PortfolioInput } from "@/lib/analysis/portfolio";
import { dcf } from "@/lib/valuation/dcf";
import { epv } from "@/lib/valuation/epv";
import { graham } from "@/lib/valuation/graham";
import { isApplicable } from "@/lib/valuation/types";

import { db } from "../index";
import { instruments, journalEntries, theses, valuations } from "../schema";
import { latestSnapshotsFor } from "./instruments";

/** The user's estimate range from their SAVED assumptions — computed with
 *  the same pure models the valuation panel uses (one implementation). */
function estimateRange(
  saved: { model: string; assumptions: Record<string, unknown> }[],
): { low: number | null; high: number | null } {
  const values: number[] = [];
  for (const v of saved) {
    const a = v.assumptions as Record<string, number>;
    if (v.model === "dcf") {
      const r = dcf({
        startingFcf: a.startingFcf,
        growthRatePct: a.growthRatePct,
        years: a.years,
        discountRatePct: a.discountRatePct,
        terminalMultiple: a.terminalMultiple,
        sharesOutstanding: a.sharesOutstanding,
      });
      if (isApplicable(r)) values.push(r.value);
    } else if (v.model === "graham") {
      const r = graham({
        eps: a.eps,
        bookValuePerShare: a.bookValuePerShare,
      });
      if (isApplicable(r)) values.push(r.value);
    } else if (v.model === "epv") {
      const r = epv({
        normalizedOperatingIncome: a.normalizedOperatingIncome,
        taxRatePct: a.taxRatePct,
        discountRatePct: a.discountRatePct,
        totalDebt: a.totalDebt,
        cash: a.cash,
        sharesOutstanding: a.sharesOutstanding,
      });
      if (isApplicable(r)) values.push(r.value);
    }
  }
  if (values.length === 0) return { low: null, high: null };
  return { low: Math.min(...values), high: Math.max(...values) };
}

export async function getPortfolioInputs(
  userId: string,
): Promise<PortfolioInput[]> {
  const entries = await db()
    .select()
    .from(journalEntries)
    .innerJoin(instruments, eq(journalEntries.instrumentId, instruments.id))
    .where(eq(journalEntries.userId, userId));

  const byInstrument = new Map<
    string,
    { instrument: typeof instruments.$inferSelect; rows: typeof entries }
  >();
  for (const row of entries) {
    const key = row.instruments.id;
    const group = byInstrument.get(key) ?? {
      instrument: row.instruments,
      rows: [] as typeof entries,
    };
    group.rows.push(row);
    byInstrument.set(key, group);
  }

  // Three round trips in parallel, then no per-instrument queries at all —
  // the pooler is ~400ms away, so a loop of them is the whole page's latency.
  const [userTheses, userValuations, latestSnapshots] = await Promise.all([
    db().select().from(theses).where(eq(theses.userId, userId)),
    db().select().from(valuations).where(eq(valuations.userId, userId)),
    latestSnapshotsFor([...byInstrument.keys()]),
  ]);

  const inputs: PortfolioInput[] = [];
  for (const { instrument, rows } of byInstrument.values()) {
    const holdings = computeHoldings(
      rows.map((r) => ({
        kind: r.journal_entries.kind,
        tradeDate: r.journal_entries.tradeDate,
        price: r.journal_entries.price,
        quantity: r.journal_entries.quantity,
      })),
    );

    const snapshot = latestSnapshots.get(instrument.id) ?? null;
    const data = (snapshot?.data ?? {}) as Record<string, unknown>;
    const latestValue =
      instrument.kind === "fund"
        ? typeof data.nav === "number"
          ? data.nav
          : null
        : typeof data.price === "number"
          ? data.price
          : null;

    const range = estimateRange(
      userValuations
        .filter((v) => v.instrumentId === instrument.id)
        .map((v) => ({
          model: v.model,
          assumptions: v.assumptions as Record<string, unknown>,
        })),
    );

    inputs.push({
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      name: instrument.name,
      kind: instrument.kind,
      currency: instrument.currency,
      netQuantity: holdings.netQuantity,
      averageCost: holdings.averageCost,
      costBasis: holdings.costBasis,
      latestValue,
      pe: typeof data.pe === "number" ? data.pe : null,
      roe: typeof data.roe === "number" ? data.roe : null,
      debtToEquity:
        typeof data.debt_to_equity === "number" ? data.debt_to_equity : null,
      estimateLow: range.low,
      estimateHigh: range.high,
      thesisStatuses: userTheses
        .filter((t) => t.instrumentId === instrument.id)
        .map((t) => t.status),
    });
  }
  return inputs;
}
