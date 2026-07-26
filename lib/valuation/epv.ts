import Big from "big.js";

import type { ModelResult } from "./types";

// Earnings Power Value: no growth assumed at all. Normalized operating
// income, after tax, capitalized at the discount rate; net debt adjusted;
// per share. The honest "what if the business never grows" anchor.
export interface EpvAssumptions {
  normalizedOperatingIncome: number;
  taxRatePct: number; // default 25
  discountRatePct: number; // default 12
  totalDebt: number; // 0 when unknown — stated in UI
  cash: number;
  sharesOutstanding: number;
}

export function epv(a: EpvAssumptions): ModelResult {
  if (
    !Number.isFinite(a.normalizedOperatingIncome) ||
    a.normalizedOperatingIncome <= 0
  ) {
    return {
      notApplicable:
        "operating income is negative or unavailable — no earnings power to capitalize",
    };
  }
  if (!Number.isFinite(a.sharesOutstanding) || a.sharesOutstanding <= 0) {
    return { notApplicable: "shares outstanding unavailable" };
  }
  if (
    !Number.isFinite(a.discountRatePct) ||
    a.discountRatePct <= 0 ||
    !Number.isFinite(a.taxRatePct) ||
    a.taxRatePct < 0 ||
    a.taxRatePct >= 100
  ) {
    return { notApplicable: "assumptions out of range" };
  }

  const afterTax = new Big(a.normalizedOperatingIncome).times(
    new Big(100).minus(new Big(a.taxRatePct)).div(100),
  );
  const enterprise = afterTax.div(new Big(a.discountRatePct).div(100));
  const equity = enterprise
    .minus(new Big(Number.isFinite(a.totalDebt) ? a.totalDebt : 0))
    .plus(new Big(Number.isFinite(a.cash) ? a.cash : 0));

  if (equity.lte(0)) {
    return {
      notApplicable: "net debt exceeds the earnings power — equity value ≤ 0",
    };
  }
  return { value: Number(equity.div(new Big(a.sharesOutstanding)).round(2)) };
}
