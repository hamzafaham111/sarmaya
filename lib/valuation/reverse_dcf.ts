import { dcf, type DcfAssumptions } from "./dcf";
import { isApplicable, type ModelResult } from "./types";

// Reverse DCF: what FCF growth does the CURRENT PRICE imply, given the same
// discount/terminal assumptions? Solved by bisection on growth in
// [-50%, +60%]; refuses gracefully when the price is unreachable in that
// range (doctrine #5 — never a garbage number).
export interface ReverseDcfAssumptions {
  currentPrice: number;
  startingFcf: number;
  years: number;
  discountRatePct: number;
  terminalMultiple: number;
  sharesOutstanding: number;
}

export const REVERSE_BOUNDS = { low: -50, high: 60 }; // growth % bounds
const TOLERANCE = 1e-4; // price units
const MAX_ITERATIONS = 200;

export type ReverseResult =
  { impliedGrowthPct: number } | { notApplicable: string };

export function reverseDcf(a: ReverseDcfAssumptions): ReverseResult {
  if (!Number.isFinite(a.currentPrice) || a.currentPrice <= 0) {
    return { notApplicable: "current price unavailable" };
  }

  const valueAt = (growthPct: number): ModelResult =>
    dcf({
      startingFcf: a.startingFcf,
      growthRatePct: growthPct,
      years: a.years,
      discountRatePct: a.discountRatePct,
      terminalMultiple: a.terminalMultiple,
      sharesOutstanding: a.sharesOutstanding,
    });

  const atLow = valueAt(REVERSE_BOUNDS.low);
  const atHigh = valueAt(REVERSE_BOUNDS.high);
  if (!isApplicable(atLow) || !isApplicable(atHigh)) {
    return {
      notApplicable:
        (atLow as { notApplicable: string }).notApplicable ??
        "inputs unavailable",
    };
  }
  if (a.currentPrice < atLow.value || a.currentPrice > atHigh.value) {
    return {
      notApplicable: `price is outside what growth between ${REVERSE_BOUNDS.low}% and ${REVERSE_BOUNDS.high}% can explain under these assumptions`,
    };
  }

  let low = REVERSE_BOUNDS.low;
  let high = REVERSE_BOUNDS.high;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const result = valueAt(mid);
    if (!isApplicable(result)) return { notApplicable: "did not converge" };
    const diff = result.value - a.currentPrice;
    if (Math.abs(diff) <= TOLERANCE) {
      return { impliedGrowthPct: Number(mid.toFixed(2)) };
    }
    if (diff > 0) high = mid;
    else low = mid;
  }
  // Bisection halves the interval 200× — reaching here means pathological
  // inputs; refuse rather than report noise.
  return { notApplicable: "did not converge" };
}
