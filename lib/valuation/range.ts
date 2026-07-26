import { dcf } from "./dcf";
import { epv } from "./epv";
import { graham } from "./graham";
import { isApplicable } from "./types";

// The user's estimate range from their SAVED assumptions — computed with the
// same pure models the valuation panel uses. ONE implementation, shared by
// the portfolio and the alert evaluation (price_vs_estimate_low_pct).
export function estimateRange(
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
      const r = graham({ eps: a.eps, bookValuePerShare: a.bookValuePerShare });
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
