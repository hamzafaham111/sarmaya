import Big from "big.js";

import type { ModelResult } from "./types";

// Single-stage FCF DCF: project `years` of growth, discount each year, add a
// discounted terminal value (multiple × final-year FCF), divide by shares.
// Pure and decimal-safe (big.js — no float drift on the reference case).
export interface DcfAssumptions {
  startingFcf: number; // company currency
  growthRatePct: number; // e.g. 12 = 12%/yr
  years: number; // growth years before terminal
  discountRatePct: number;
  terminalMultiple: number; // × final-year FCF
  sharesOutstanding: number;
}

export const DCF_BOUNDS = {
  growthRatePct: { min: -20, max: 40 },
  years: { min: 3, max: 15 },
  discountRatePct: { min: 5, max: 25 },
  terminalMultiple: { min: 5, max: 30 },
};

export function dcf(a: DcfAssumptions): ModelResult {
  if (!Number.isFinite(a.startingFcf) || a.startingFcf <= 0) {
    return {
      notApplicable:
        "free cash flow is negative or unavailable — a FCF-based DCF has nothing to discount",
    };
  }
  if (!Number.isFinite(a.sharesOutstanding) || a.sharesOutstanding <= 0) {
    return { notApplicable: "shares outstanding unavailable" };
  }
  if (
    !Number.isFinite(a.growthRatePct) ||
    !Number.isFinite(a.discountRatePct) ||
    !Number.isFinite(a.terminalMultiple) ||
    !Number.isInteger(a.years) ||
    a.years < 1 ||
    a.years > 30 ||
    a.discountRatePct <= 0 ||
    a.terminalMultiple <= 0
  ) {
    return { notApplicable: "assumptions out of range" };
  }

  const growth = new Big(1).plus(new Big(a.growthRatePct).div(100));
  const discount = new Big(1).plus(new Big(a.discountRatePct).div(100));

  let fcf = new Big(a.startingFcf);
  let discountFactor = new Big(1);
  let total = new Big(0);

  for (let year = 1; year <= a.years; year++) {
    fcf = fcf.times(growth);
    discountFactor = discountFactor.times(discount);
    total = total.plus(fcf.div(discountFactor));
  }

  const terminal = new Big(a.terminalMultiple).times(fcf).div(discountFactor);
  const perShare = total.plus(terminal).div(new Big(a.sharesOutstanding));

  if (perShare.lte(0)) {
    return { notApplicable: "assumptions produce a non-positive value" };
  }
  return { value: Number(perShare.round(2)) };
}
