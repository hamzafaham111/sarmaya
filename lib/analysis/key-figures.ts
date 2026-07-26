// The market-facing figures an investor reads first: what the market is
// currently paying, and the trailing-twelve-month fundamentals behind it.
//
// Two rules, both from CLAUDE.md:
//   - Nothing is fetched or stored here. These come from the latest snapshot
//     the daily job already wrote; the derived ones are computed at read time.
//   - Every figure is nullable and a missing input yields null, never 0/NaN.
//
// This is deliberately separate from ratios.ts: those are per FISCAL YEAR
// from statements, these are AS OF TODAY from the snapshot. Mixing the two
// periods in one table would quietly compare different things.

export interface KeyFigures {
  // What the market pays
  price: number | null;
  marketCap: number | null;
  pe: number | null;
  pb: number | null;
  dividendYield: number | null;
  /** eps_ttm / price — the inverse of P/E, kept honest for loss-makers. */
  earningsYield: number | null;
  /** fcf_ttm / market_cap. */
  fcfYield: number | null;
  // The trailing business behind it
  epsTtm: number | null;
  bookValuePerShare: number | null;
  revenueTtm: number | null;
  revenueGrowthYoy: number | null;
  fcfTtm: number | null;
  grossMargin: number | null;
  opMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roic: number | null;
  debtToEquity: number | null;
  sharesOutstanding: number | null;
}

function num(
  snapshot: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  const v = snapshot?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function div(
  numerator: number | null,
  denominator: number | null,
): number | null {
  if (numerator === null || denominator === null || denominator === 0) {
    return null;
  }
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

/** Read the snapshot vocabulary into display-ready figures. */
export function keyFigures(
  snapshot: Record<string, unknown> | null | undefined,
): KeyFigures {
  const price = num(snapshot, "price");
  const epsTtm = num(snapshot, "eps_ttm");
  const fcfTtm = num(snapshot, "fcf_ttm");
  const marketCap = num(snapshot, "market_cap");

  return {
    price,
    marketCap,
    pe: num(snapshot, "pe"),
    pb: num(snapshot, "pb"),
    dividendYield: num(snapshot, "dividend_yield"),
    earningsYield: div(epsTtm, price),
    fcfYield: div(fcfTtm, marketCap),
    epsTtm,
    bookValuePerShare: num(snapshot, "book_value_per_share"),
    revenueTtm: num(snapshot, "revenue_ttm"),
    revenueGrowthYoy: num(snapshot, "revenue_growth_yoy"),
    fcfTtm,
    grossMargin: num(snapshot, "gross_margin"),
    opMargin: num(snapshot, "op_margin"),
    netMargin: num(snapshot, "net_margin"),
    roe: num(snapshot, "roe"),
    roic: num(snapshot, "roic"),
    debtToEquity: num(snapshot, "debt_to_equity"),
    sharesOutstanding: num(snapshot, "shares_outstanding"),
  };
}

/** True when the snapshot carried nothing beyond a price — the page should
 *  say so plainly instead of rendering a grid of em dashes. */
export function hasAnyFigure(figures: KeyFigures): boolean {
  return Object.entries(figures).some(
    ([key, value]) => key !== "price" && value !== null,
  );
}
