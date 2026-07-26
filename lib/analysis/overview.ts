// What the overview screen is actually made of. Pure and testable: the page
// only renders what these functions decide.
//
// The screen answers three questions in order — what is my money doing, does
// anything need me today, and what moved — so the logic here is organised
// the same way.

import Big from "big.js";

const REVIEW_DUE_DAYS = 90;
const STALE_HOURS = 48;

export interface SeriesPoint {
  date: string;
  close: string; // numeric-as-string, as stored
}

/** Strict: an empty string is absent data, NOT zero — `Number("")` is 0 and
 *  would quietly render a real price of nought. */
function close(point: SeriesPoint | undefined): number | null {
  const raw = point?.close;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Last close vs the one before it, as a fraction. Null when the series is
 *  too short or the previous close is zero — never Infinity/NaN. */
export function dayChangeFromSeries(
  series: SeriesPoint[] | undefined,
): number | null {
  if (!series || series.length < 2) return null;
  const latest = close(series[series.length - 1]);
  const previous = close(series[series.length - 2]);
  if (latest === null || previous === null || previous === 0) return null;
  return (latest - previous) / previous;
}

export function latestClose(series: SeriesPoint[] | undefined): number | null {
  if (!series || series.length === 0) return null;
  return close(series[series.length - 1]);
}

export interface MoverInput {
  instrumentId: string;
  symbol: string;
  name: string | null;
  kind: string;
  currency: string;
  price: number | null;
  dayChange: number | null;
  series: (number | null)[];
}

/**
 * Biggest absolute movers first — a -6% day matters as much as a +6% one.
 * Instruments with no day change at all sort last rather than being dropped:
 * a newly added instrument still belongs on the screen.
 */
export function rankMovers(items: MoverInput[], limit: number): MoverInput[] {
  return [...items]
    .sort((a, b) => {
      if (a.dayChange === null && b.dayChange === null) {
        return a.symbol.localeCompare(b.symbol);
      }
      if (a.dayChange === null) return 1;
      if (b.dayChange === null) return -1;
      return Math.abs(b.dayChange) - Math.abs(a.dayChange);
    })
    .slice(0, limit);
}

/**
 * Value-weighted day change for one currency bucket: what the whole bucket
 * did today. Rows without a market value or a day change are excluded from
 * both sides of the ratio, so a partially-priced bucket still reports the
 * part it can stand behind.
 */
export function bucketDayChange(
  rows: { marketValue: string | null; dayChange: number | null }[],
): number | null {
  let base = new Big(0);
  let weighted = new Big(0);

  for (const row of rows) {
    if (row.marketValue === null || row.dayChange === null) continue;
    if (!Number.isFinite(row.dayChange)) continue;
    const value = new Big(row.marketValue);
    if (value.lte(0)) continue;
    base = base.plus(value);
    weighted = weighted.plus(value.times(new Big(String(row.dayChange))));
  }

  if (base.lte(0)) return null;
  return Number(weighted.div(base));
}

export type AttentionSeverity = "alert" | "info";

export interface AttentionItem {
  key: string;
  severity: AttentionSeverity;
  /** Short, factual. Never advice — the user decides what to do about it. */
  message: string;
  href: string;
}

export interface AttentionInput {
  theses: {
    id: string;
    instrumentId: string;
    symbol: string;
    status: string;
    lastReviewedAt: Date;
  }[];
  /** Tracked instruments and when their snapshot was last fetched. */
  instruments: {
    id: string;
    symbol: string;
    fetchedAt: Date | null;
    status: string;
    isManual: boolean;
  }[];
  /** Holdings the portfolio had to exclude for want of a price. */
  unpricedHoldings: number;
  /** "now" is passed in so this stays pure and testable. */
  now: Date;
}

/**
 * The only part of the screen that asks for something. Ordered by how much
 * it matters: a broken thesis outranks stale data outranks housekeeping.
 * Returns [] when nothing needs the user — the section then hides entirely
 * rather than reassuring them with a green tick they have to read.
 */
export function attentionItems(input: AttentionInput): AttentionItem[] {
  const items: AttentionItem[] = [];

  const breached = input.theses.filter((t) => t.status === "breached");
  if (breached.length > 0) {
    const symbols = [...new Set(breached.map((t) => t.symbol))];
    items.push({
      key: "breached",
      severity: "alert",
      message:
        breached.length === 1
          ? `A thesis on ${symbols[0]} is breached`
          : `${breached.length} theses breached — ${symbols.slice(0, 3).join(", ")}${symbols.length > 3 ? "…" : ""}`,
      href: `/i/${breached[0].instrumentId}`,
    });
  }

  // Hand-kept instruments are never "stale" in the job sense — nobody was
  // going to fetch them. Quarantined ones get their own, clearer line.
  const failing = input.instruments.filter(
    (i) => i.status === "fetch_failing" && !i.isManual,
  );
  if (failing.length > 0) {
    items.push({
      key: "fetch-failing",
      severity: "alert",
      message: `Data updates are failing for ${failing.map((i) => i.symbol).join(", ")}`,
      href: "/instruments",
    });
  }

  const staleCutoff = input.now.getTime() - STALE_HOURS * 3_600_000;
  const stale = input.instruments.filter(
    (i) =>
      !i.isManual &&
      i.status !== "fetch_failing" &&
      (i.fetchedAt === null || i.fetchedAt.getTime() < staleCutoff),
  );
  if (stale.length > 0) {
    items.push({
      key: "stale",
      severity: "info",
      message: `${stale.length} instrument${stale.length === 1 ? "" : "s"} not updated in ${STALE_HOURS}h`,
      href: "/instruments",
    });
  }

  if (input.unpricedHoldings > 0) {
    items.push({
      key: "unpriced",
      severity: "info",
      message: `${input.unpricedHoldings} holding${input.unpricedHoldings === 1 ? "" : "s"} excluded from totals — no price yet`,
      href: "/portfolio",
    });
  }

  const dueCutoff = input.now.getTime() - REVIEW_DUE_DAYS * 86_400_000;
  const due = input.theses.filter(
    (t) => t.status !== "breached" && t.lastReviewedAt.getTime() < dueCutoff,
  );
  if (due.length > 0) {
    items.push({
      key: "review-due",
      severity: "info",
      message: `${due.length} thesis${due.length === 1 ? "" : "es"} not reviewed in ${REVIEW_DUE_DAYS} days`,
      href: `/i/${due[0].instrumentId}`,
    });
  }

  return items;
}

export { REVIEW_DUE_DAYS, STALE_HOURS };
