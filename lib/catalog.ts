import nse from "./symbols-nse.json";

import type { CurrencyCode, InstrumentKind, Market } from "@/lib/providers";

// The static, in-repo instrument universe (CLAUDE.md: no external search
// API). NSE 500 + the benchmark indices; US tickers join by direct symbol
// entry; funds (AMFI master) arrive in Phase 5; PSX in Phase 8.
export interface CatalogEntry {
  kind: InstrumentKind;
  symbol: string; // data-source symbol, e.g. RELIANCE.NS, ^NSEI
  market: Market;
  currency: CurrencyCode;
  name: string;
  display: string; // what the user types against, e.g. RELIANCE
}

export const INDICES: CatalogEntry[] = [
  {
    kind: "index",
    symbol: "^NSEI",
    market: "IN",
    currency: "INR",
    name: "NIFTY 50",
    display: "NIFTY 50",
  },
  {
    kind: "index",
    symbol: "^BSESN",
    market: "IN",
    currency: "INR",
    name: "SENSEX",
    display: "SENSEX",
  },
  {
    kind: "index",
    symbol: "^KSE",
    market: "PK",
    currency: "PKR",
    name: "KSE-100",
    display: "KSE-100",
  },
  {
    kind: "index",
    symbol: "^GSPC",
    market: "US",
    currency: "USD",
    name: "S&P 500",
    display: "S&P 500",
  },
];

export const NSE_STOCKS: CatalogEntry[] = (
  nse as { s: string; n: string }[]
).map((e) => ({
  kind: "stock" as const,
  symbol: `${e.s}.NS`,
  market: "IN" as const,
  currency: "INR" as const,
  name: e.n,
  display: e.s,
}));

export const CATALOG: CatalogEntry[] = [...INDICES, ...NSE_STOCKS];

const US_SYMBOL_RE = /^[A-Z]{1,6}$/;

/** Case-insensitive substring search; prefix matches rank first. */
export function searchCatalog(query: string, limit = 8): CatalogEntry[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const scored = CATALOG.flatMap((e) => {
    const sym = e.display.toUpperCase();
    const name = e.name.toUpperCase();
    let score: number | null = null;
    if (sym.startsWith(q)) score = 0;
    else if (name.startsWith(q)) score = 1;
    else if (sym.includes(q) || name.includes(q)) score = 2;
    return score === null ? [] : [{ e, score }];
  });
  scored.sort(
    (a, b) => a.score - b.score || a.e.display.localeCompare(b.e.display),
  );
  return scored.slice(0, limit).map((s) => s.e);
}

/** Exact resolution used server-side; falls back to a raw US ticker. */
export function resolveCatalogEntry(
  symbol: string,
  market: string,
): CatalogEntry | null {
  const found = CATALOG.find((e) => e.symbol === symbol && e.market === market);
  if (found) return found;
  if (market === "US" && US_SYMBOL_RE.test(symbol)) {
    return {
      kind: "stock",
      symbol,
      market: "US",
      currency: "USD",
      name: null as unknown as string, // filled by the first fetch when possible
      display: symbol,
    };
  }
  return null;
}

export function isPlausibleUsTicker(query: string): boolean {
  return US_SYMBOL_RE.test(query.trim().toUpperCase());
}

/** India mutual funds (AMFI scheme codes) — loaded lazily; the list is an
 *  order of magnitude bigger than the stock universe. */
export async function loadFundEntries(): Promise<CatalogEntry[]> {
  const funds = (await import("./symbols-funds.json")).default as {
    c: string;
    n: string;
  }[];
  return funds.map((f) => ({
    kind: "fund" as const,
    symbol: f.c,
    market: "IN" as const,
    currency: "INR" as const,
    name: f.n,
    display: f.n,
  }));
}

export async function resolveInstrument(
  symbol: string,
  market: string,
  kind: string,
): Promise<CatalogEntry | null> {
  if (kind === "fund") {
    const funds = await loadFundEntries();
    return funds.find((f) => f.symbol === symbol && market === "IN") ?? null;
  }
  return resolveCatalogEntry(symbol, market);
}
