import Big from "big.js";

import type { ModelResult } from "./types";

// Graham number: sqrt(22.5 × EPS × BVPS). Assumes a profitable company at
// ≤15× earnings and ≤1.5× book (22.5 = 15 × 1.5) — a conservative screen
// from a different era; the UI popover states this honestly.
export interface GrahamAssumptions {
  eps: number;
  bookValuePerShare: number;
}

export function graham(a: GrahamAssumptions): ModelResult {
  if (!Number.isFinite(a.eps) || a.eps <= 0) {
    return {
      notApplicable: "EPS is negative or unavailable — Graham assumes profits",
    };
  }
  if (!Number.isFinite(a.bookValuePerShare) || a.bookValuePerShare <= 0) {
    return { notApplicable: "book value per share unavailable" };
  }
  const product = new Big(22.5)
    .times(new Big(a.eps))
    .times(new Big(a.bookValuePerShare));
  return { value: Number(product.sqrt().round(2)) };
}
