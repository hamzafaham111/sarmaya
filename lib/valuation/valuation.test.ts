import { describe, expect, it } from "vitest";

import { dcf } from "./dcf";
import { epv } from "./epv";
import { graham } from "./graham";
import { reverseDcf } from "./reverse_dcf";
import { isApplicable } from "./types";

// Reference cases hand-computed independently (Decimal arithmetic):
//   DCF(100 fcf, 10% growth, 5y, 12% discount, 15x terminal, 10 shares)
//     = 184.461349838655…  -> 184.46 to the cent
//   DCF zero-growth        = 121.161790381239…  -> 121.16
//   Graham(eps 10, bvps 40) = sqrt(9000) = 94.868329…  -> 94.87
//   EPV(200 op, 25% tax, 10% d, 300 debt, 100 cash, 10 sh) = 130.00

const DCF_REF = {
  startingFcf: 100,
  growthRatePct: 10,
  years: 5,
  discountRatePct: 12,
  terminalMultiple: 15,
  sharesOutstanding: 10,
};

describe("dcf", () => {
  it("matches the hand-computed reference to the cent", () => {
    expect(dcf(DCF_REF)).toEqual({ value: 184.46 });
  });

  it("zero-growth case to the cent (no float drift)", () => {
    expect(dcf({ ...DCF_REF, growthRatePct: 0 })).toEqual({ value: 121.16 });
  });

  it("negative FCF => notApplicable with reason", () => {
    const r = dcf({ ...DCF_REF, startingFcf: -50 });
    expect(isApplicable(r)).toBe(false);
    if (!isApplicable(r)) expect(r.notApplicable).toMatch(/free cash flow/i);
  });

  it("missing shares => notApplicable", () => {
    const r = dcf({ ...DCF_REF, sharesOutstanding: Number.NaN });
    expect(isApplicable(r)).toBe(false);
  });

  it("boundary abuse (0 discount, absurd years) refuses", () => {
    expect(isApplicable(dcf({ ...DCF_REF, discountRatePct: 0 }))).toBe(false);
    expect(isApplicable(dcf({ ...DCF_REF, years: 31 }))).toBe(false);
    expect(isApplicable(dcf({ ...DCF_REF, years: 2.5 }))).toBe(false);
  });
});

describe("graham", () => {
  it("matches sqrt(22.5 × eps × bvps) to the cent", () => {
    expect(graham({ eps: 10, bookValuePerShare: 40 })).toEqual({
      value: 94.87,
    });
  });

  it("missing/negative EPS => notApplicable with reason", () => {
    const r = graham({ eps: -3, bookValuePerShare: 40 });
    expect(isApplicable(r)).toBe(false);
    if (!isApplicable(r)) expect(r.notApplicable).toMatch(/EPS/);
    expect(
      isApplicable(graham({ eps: Number.NaN, bookValuePerShare: 40 })),
    ).toBe(false);
  });

  it("missing BVPS => notApplicable", () => {
    expect(isApplicable(graham({ eps: 10, bookValuePerShare: 0 }))).toBe(false);
  });
});

describe("epv", () => {
  const REF = {
    normalizedOperatingIncome: 200,
    taxRatePct: 25,
    discountRatePct: 10,
    totalDebt: 300,
    cash: 100,
    sharesOutstanding: 10,
  };

  it("matches the hand-computed reference to the cent", () => {
    expect(epv(REF)).toEqual({ value: 130 });
  });

  it("negative operating income => notApplicable", () => {
    expect(isApplicable(epv({ ...REF, normalizedOperatingIncome: -10 }))).toBe(
      false,
    );
  });

  it("net debt swamping earnings power => notApplicable, not a negative number", () => {
    const r = epv({ ...REF, totalDebt: 5000 });
    expect(isApplicable(r)).toBe(false);
    if (!isApplicable(r)) expect(r.notApplicable).toMatch(/net debt/i);
  });

  it("unknown debt/cash treated as 0 (stated in UI)", () => {
    const r = epv({ ...REF, totalDebt: Number.NaN, cash: Number.NaN });
    expect(r).toEqual({ value: 150 }); // 1500 / 10
  });
});

describe("reverseDcf", () => {
  const REF = {
    currentPrice: 184.46,
    startingFcf: 100,
    years: 5,
    discountRatePct: 12,
    terminalMultiple: 15,
    sharesOutstanding: 10,
  };

  it("recovers the growth that produced the reference price", () => {
    const r = reverseDcf(REF);
    expect("impliedGrowthPct" in r).toBe(true);
    if ("impliedGrowthPct" in r) {
      expect(Math.abs(r.impliedGrowthPct - 10)).toBeLessThan(0.1);
    }
  });

  it("price unreachable under the bounds => graceful refusal", () => {
    const r = reverseDcf({ ...REF, currentPrice: 1_000_000 });
    expect("notApplicable" in r).toBe(true);
    if ("notApplicable" in r) expect(r.notApplicable).toMatch(/outside/i);
  });

  it("negative FCF propagates the DCF refusal", () => {
    const r = reverseDcf({ ...REF, startingFcf: -5 });
    expect("notApplicable" in r).toBe(true);
  });

  it("missing price refuses", () => {
    expect("notApplicable" in reverseDcf({ ...REF, currentPrice: 0 })).toBe(
      true,
    );
  });
});
