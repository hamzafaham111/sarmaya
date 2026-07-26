import { seriesCagr, type StatementYearData } from "@/lib/analysis/ratios";

// Auto-seeded defaults come from the company's OWN history and are labeled
// "auto — edit me" in the UI (valuation doctrine #2). Growth seeds from 5Y
// FCF CAGR (fallback: revenue CAGR), capped at 20%.

export interface ValuationSeeds {
  dcf: {
    startingFcf: number | null;
    growthRatePct: number;
    years: number;
    discountRatePct: number;
    terminalMultiple: number;
    sharesOutstanding: number | null;
  };
  graham: { eps: number | null; bookValuePerShare: number | null };
  epv: {
    normalizedOperatingIncome: number | null;
    taxRatePct: number;
    discountRatePct: number;
    totalDebt: number | null;
    cash: number | null;
    sharesOutstanding: number | null;
  };
  historicalFcfCagrPct: number | null; // context for reverse DCF
}

interface SnapshotLite {
  fcf_ttm?: number | null;
  eps_ttm?: number | null;
  book_value_per_share?: number | null;
  shares_outstanding?: number | null;
}

function latest(
  years: StatementYearData[],
  kind: "income" | "balance" | "cashflow",
  key: string,
): number | null {
  for (let i = years.length - 1; i >= 0; i--) {
    const rec = years[i][kind] as Record<string, number | null> | undefined;
    const v = rec?.[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function average(
  years: StatementYearData[],
  kind: "income" | "balance" | "cashflow",
  key: string,
): number | null {
  const values = years
    .map((y) => {
      const rec = y[kind] as Record<string, number | null> | undefined;
      const v = rec?.[key];
      return typeof v === "number" && Number.isFinite(v) ? v : null;
    })
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function buildSeeds(
  years: StatementYearData[],
  snapshot: SnapshotLite | null,
): ValuationSeeds {
  const fcfCagr = seriesCagr(
    years.map((y) => ({
      fiscalYear: y.fiscalYear,
      value: y.cashflow?.fcf ?? null,
    })),
  );
  const revenueCagr = seriesCagr(
    years.map((y) => ({
      fiscalYear: y.fiscalYear,
      value: y.income?.revenue ?? null,
    })),
  );
  const seededGrowth = fcfCagr ?? revenueCagr;
  const growthRatePct =
    seededGrowth === null
      ? 10
      : Math.min(20, Math.max(0, Math.round(seededGrowth * 1000) / 10));

  const shares =
    latest(years, "balance", "shares_outstanding") ??
    snapshot?.shares_outstanding ??
    null;

  const equity = latest(years, "balance", "total_equity");
  const bvps =
    snapshot?.book_value_per_share ??
    (equity !== null && shares !== null && shares > 0 ? equity / shares : null);

  return {
    dcf: {
      startingFcf:
        latest(years, "cashflow", "fcf") ?? snapshot?.fcf_ttm ?? null,
      growthRatePct,
      years: 10,
      discountRatePct: 12,
      terminalMultiple: 15,
      sharesOutstanding: shares,
    },
    graham: {
      eps: snapshot?.eps_ttm ?? latest(years, "income", "eps"),
      bookValuePerShare: bvps,
    },
    epv: {
      normalizedOperatingIncome: average(years, "income", "operating_income"),
      taxRatePct: 25,
      discountRatePct: 12,
      totalDebt: latest(years, "balance", "total_debt"),
      cash: latest(years, "balance", "cash"),
      sharesOutstanding: shares,
    },
    historicalFcfCagrPct:
      fcfCagr === null ? null : Math.round(fcfCagr * 1000) / 10,
  };
}
