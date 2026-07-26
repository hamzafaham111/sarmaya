import Big from "big.js";

// Portfolio assembly: currency-bucketed, journal-derived, display-only.
// v1 NEVER converts between currencies (CLAUDE.md #5) — totals exist only
// inside a bucket. Pure and unit-tested; the page just renders this.

export interface PortfolioInput {
  instrumentId: string;
  symbol: string;
  name: string | null;
  kind: string; // stock | fund
  currency: string; // INR | PKR | USD
  netQuantity: string; // from computeHoldings
  averageCost: string | null;
  costBasis: string;
  /** latest price (stocks) or NAV (funds); null when unavailable */
  latestValue: number | null;
  /** snapshot metrics for the "one business" panel (stocks) */
  pe: number | null;
  roe: number | null;
  debtToEquity: number | null;
  /** user's estimate range (from saved valuations), when it exists */
  estimateLow: number | null;
  estimateHigh: number | null;
  /** thesis statuses for this instrument (may be empty) */
  thesisStatuses: string[];
}

export interface PortfolioRow extends PortfolioInput {
  marketValue: string | null; // decimal string
  unrealizedPnl: string | null;
  unrealizedPnlPct: number | null;
  weightPct: number | null; // within its currency bucket
  thesisHealth: "intact" | "breached" | "partial" | "none";
}

export interface CurrencyBucket {
  currency: string;
  rows: PortfolioRow[];
  totalCostBasis: string;
  totalMarketValue: string;
  totalUnrealizedPnl: string;
  excludedCount: number; // holdings without a price — excluded from totals
  /** value-weighted aggregates across STOCK rows; nulls excluded */
  weighted: {
    pe: number | null;
    roe: number | null;
    debtToEquity: number | null;
    excludedByMetric: { pe: number; roe: number; debtToEquity: number };
  };
  /** % of stock market value whose thesis is breached (by value, not count) */
  breachedValuePct: number | null;
}

function thesisHealth(statuses: string[]): PortfolioRow["thesisHealth"] {
  const active = statuses.filter((s) => s !== "archived");
  if (active.length === 0) return "none";
  const breached = active.filter((s) => s === "breached").length;
  if (breached === 0) return "intact";
  if (breached === active.length) return "breached";
  return "partial";
}

export function buildPortfolio(inputs: PortfolioInput[]): CurrencyBucket[] {
  const held = inputs.filter((i) => new Big(i.netQuantity).gt(0));
  const byCurrency = new Map<string, PortfolioInput[]>();
  for (const input of held) {
    byCurrency.set(input.currency, [
      ...(byCurrency.get(input.currency) ?? []),
      input,
    ]);
  }

  const buckets: CurrencyBucket[] = [];
  for (const [currency, items] of byCurrency) {
    let totalCost = new Big(0);
    let totalValue = new Big(0);
    let excludedCount = 0;

    const rows: PortfolioRow[] = items.map((item) => {
      const qty = new Big(item.netQuantity);
      const cost = new Big(item.costBasis);
      totalCost = totalCost.plus(cost);

      if (item.latestValue === null || !Number.isFinite(item.latestValue)) {
        excludedCount += 1;
        return {
          ...item,
          marketValue: null,
          unrealizedPnl: null,
          unrealizedPnlPct: null,
          weightPct: null,
          thesisHealth: thesisHealth(item.thesisStatuses),
        };
      }

      const value = qty.times(new Big(String(item.latestValue)));
      totalValue = totalValue.plus(value);
      const pnl = value.minus(cost);
      return {
        ...item,
        marketValue: value.round(2).toString(),
        unrealizedPnl: pnl.round(2).toString(),
        unrealizedPnlPct: cost.gt(0) ? Number(pnl.div(cost)) : null,
        weightPct: null, // filled after the bucket total is known
        thesisHealth: thesisHealth(item.thesisStatuses),
      };
    });

    for (const row of rows) {
      if (row.marketValue !== null && totalValue.gt(0)) {
        row.weightPct = Number(new Big(row.marketValue).div(totalValue));
      }
    }

    // Value-weighted stock aggregates; a row missing a metric is excluded
    // from THAT metric with a visible count (footnote in the UI).
    const stockRows = rows.filter(
      (r) => r.kind === "stock" && r.marketValue !== null,
    );
    const weightedMetric = (key: "pe" | "roe" | "debtToEquity") => {
      const usable = stockRows.filter(
        (r) => r[key] !== null && Number.isFinite(r[key] as number),
      );
      const excluded = stockRows.length - usable.length;
      const base = usable.reduce(
        (a, r) => a.plus(new Big(r.marketValue as string)),
        new Big(0),
      );
      if (usable.length === 0 || base.lte(0)) {
        return { value: null as number | null, excluded };
      }
      const acc = usable.reduce(
        (a, r) =>
          a.plus(
            new Big(r.marketValue as string).times(
              new Big(String(r[key] as number)),
            ),
          ),
        new Big(0),
      );
      return { value: Number(acc.div(base)), excluded };
    };

    const pe = weightedMetric("pe");
    const roe = weightedMetric("roe");
    const dte = weightedMetric("debtToEquity");

    const stockValue = stockRows.reduce(
      (a, r) => a.plus(new Big(r.marketValue as string)),
      new Big(0),
    );
    const breachedValue = stockRows
      .filter(
        (r) => r.thesisHealth === "breached" || r.thesisHealth === "partial",
      )
      .reduce((a, r) => a.plus(new Big(r.marketValue as string)), new Big(0));

    buckets.push({
      currency,
      rows: rows.sort((a, b) =>
        new Big(b.marketValue ?? 0)
          .minus(new Big(a.marketValue ?? 0))
          .toNumber(),
      ),
      totalCostBasis: totalCost.round(2).toString(),
      totalMarketValue: totalValue.round(2).toString(),
      totalUnrealizedPnl: totalValue.minus(totalCost).round(2).toString(),
      excludedCount,
      weighted: {
        pe: pe.value,
        roe: roe.value,
        debtToEquity: dte.value,
        excludedByMetric: {
          pe: pe.excluded,
          roe: roe.excluded,
          debtToEquity: dte.excluded,
        },
      },
      breachedValuePct: stockValue.gt(0)
        ? Number(breachedValue.div(stockValue))
        : null,
    });
  }

  return buckets.sort((a, b) => a.currency.localeCompare(b.currency));
}
