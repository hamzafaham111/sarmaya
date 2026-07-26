// The ONE permitted request-time fetch (CLAUDE.md #2): when the user adds an
// instrument, we grab a minimal first snapshot (price + currency) so the
// page isn't empty until tonight's job. Full snapshots/statements come from
// the Python adapters. This lives inside the adapter layer by design.

import type { SnapshotData } from "./index";

const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";

export function emptySnapshotData(): SnapshotData {
  return {
    price: null,
    currency: null,
    market_cap: null,
    pe: null,
    pb: null,
    eps_ttm: null,
    revenue_ttm: null,
    revenue_growth_yoy: null,
    gross_margin: null,
    op_margin: null,
    net_margin: null,
    fcf_ttm: null,
    debt_to_equity: null,
    roe: null,
    roic: null,
    shares_outstanding: null,
    dividend_yield: null,
    book_value_per_share: null,
  };
}

/** Best-effort minimal quote; returns null on any failure (the add flow
 *  degrades to "first data with tonight's update"). */
export async function fetchQuickQuote(
  symbol: string,
): Promise<{ data: SnapshotData; source: string } | null> {
  try {
    const res = await fetch(
      `${CHART_URL}${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (sarmaya-add-instrument)" },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as {
      chart?: { result?: { meta?: Record<string, unknown> }[] };
    };
    const meta = body.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price =
      typeof meta.regularMarketPrice === "number"
        ? meta.regularMarketPrice
        : null;
    const currency = typeof meta.currency === "string" ? meta.currency : null;
    if (price === null) return null;

    const data = emptySnapshotData();
    data.price = price;
    data.currency = currency;
    return { data, source: "quick-quote" };
  } catch {
    return null;
  }
}
