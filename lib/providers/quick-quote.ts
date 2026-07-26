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

/** Best-effort latest NAV for a fund scheme (one sync fetch on add). */
export async function fetchQuickNav(schemeCode: string): Promise<{
  data: Record<string, unknown>;
  asOf: string;
  source: string;
} | null> {
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, {
      headers: { "User-Agent": "sarmaya-add-instrument" },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      meta?: {
        scheme_name?: string;
        fund_house?: string;
        scheme_category?: string;
      };
      data?: { date?: string; nav?: string }[];
    };
    const row = body.data?.[0];
    const nav = Number(row?.nav);
    if (!row?.date || !Number.isFinite(nav) || nav <= 0) return null;
    // mfapi dates are DD-MM-YYYY
    const [dd, mm, yyyy] = row.date.split("-");
    const asOf = `${yyyy}-${mm}-${dd}`;
    return {
      data: {
        nav,
        nav_date: asOf,
        scheme_category: body.meta?.scheme_category ?? null,
        fund_house: body.meta?.fund_house ?? null,
      },
      asOf,
      source: "quick-nav",
    };
  } catch {
    return null;
  }
}

/** Best-effort latest PSX close (one sync fetch on add). */
async function fetchQuickPsx(
  symbol: string,
): Promise<{ data: SnapshotData; source: string } | null> {
  try {
    const res = await fetch(
      `https://dps.psx.com.pk/timeseries/eod/${encodeURIComponent(symbol)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (sarmaya-add-instrument)" },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as {
      status?: number;
      data?: [number, number, ...unknown[]][];
    };
    const close = body.status === 1 ? body.data?.[0]?.[1] : null;
    if (typeof close !== "number" || close <= 0) return null;
    const data = emptySnapshotData();
    data.price = close;
    data.currency = "PKR";
    return { data, source: "quick-psx" };
  } catch {
    return null;
  }
}

/** Best-effort minimal quote; returns null on any failure (the add flow
 *  degrades to "first data with tonight's update"). */
export async function fetchQuickQuote(
  symbol: string,
  market?: string,
): Promise<{ data: SnapshotData; source: string } | null> {
  if (market === "PK") return fetchQuickPsx(symbol);
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
