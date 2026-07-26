import { describe, expect, it } from "vitest";

import { hasAnyFigure, keyFigures } from "./key-figures";

// A snapshot as the daily job writes it: price 1250, 100 shares out,
// eps 50, fcf 20000, market cap 125000.
const SNAPSHOT = {
  price: 1250,
  currency: "INR",
  market_cap: 125_000,
  pe: 25,
  pb: 3,
  eps_ttm: 50,
  revenue_ttm: 500_000,
  revenue_growth_yoy: 0.12,
  gross_margin: 0.4,
  op_margin: 0.2,
  net_margin: 0.1,
  fcf_ttm: 20_000,
  debt_to_equity: 0.5,
  roe: 0.18,
  roic: 0.15,
  shares_outstanding: 100,
  dividend_yield: 0.008,
  book_value_per_share: 416.67,
};

describe("keyFigures — hand-computed reference", () => {
  const f = keyFigures(SNAPSHOT);

  it("passes market figures through untouched", () => {
    expect(f.price).toBe(1250);
    expect(f.marketCap).toBe(125_000);
    expect(f.pe).toBe(25);
    expect(f.pb).toBe(3);
    expect(f.dividendYield).toBe(0.008);
    expect(f.sharesOutstanding).toBe(100);
  });

  it("derives earnings yield as eps / price", () => {
    // 50 / 1250 = 0.04 — the inverse of the reported P/E of 25.
    expect(f.earningsYield).toBeCloseTo(0.04, 10);
    expect(f.earningsYield).toBeCloseTo(1 / (f.pe as number), 10);
  });

  it("derives FCF yield as fcf / market cap", () => {
    // 20000 / 125000 = 0.16
    expect(f.fcfYield).toBeCloseTo(0.16, 10);
  });

  it("passes trailing fundamentals through", () => {
    expect(f.epsTtm).toBe(50);
    expect(f.revenueTtm).toBe(500_000);
    expect(f.revenueGrowthYoy).toBe(0.12);
    expect(f.netMargin).toBe(0.1);
    expect(f.roe).toBe(0.18);
    expect(f.debtToEquity).toBe(0.5);
  });
});

describe("keyFigures — null discipline", () => {
  it("an entirely absent snapshot yields all nulls, no NaN", () => {
    const f = keyFigures(null);
    for (const value of Object.values(f)) expect(value).toBeNull();
  });

  it("an empty snapshot yields all nulls", () => {
    const f = keyFigures({});
    expect(f.pe).toBeNull();
    expect(f.earningsYield).toBeNull();
    expect(f.fcfYield).toBeNull();
  });

  it("derived figures need both inputs", () => {
    expect(keyFigures({ eps_ttm: 50 }).earningsYield).toBeNull();
    expect(keyFigures({ price: 1250 }).earningsYield).toBeNull();
    expect(keyFigures({ fcf_ttm: 20_000 }).fcfYield).toBeNull();
    expect(keyFigures({ market_cap: 125_000 }).fcfYield).toBeNull();
  });

  it("a zero denominator yields null, never Infinity", () => {
    expect(keyFigures({ eps_ttm: 50, price: 0 }).earningsYield).toBeNull();
    expect(keyFigures({ fcf_ttm: 1, market_cap: 0 }).fcfYield).toBeNull();
  });

  it("non-numeric junk in the snapshot is rejected, not coerced", () => {
    const f = keyFigures({ pe: "25", pb: null, price: NaN, market_cap: true });
    expect(f.pe).toBeNull();
    expect(f.pb).toBeNull();
    expect(f.price).toBeNull();
    expect(f.marketCap).toBeNull();
  });

  it("keeps a genuinely negative figure (loss-maker), not null", () => {
    const f = keyFigures({ price: 100, eps_ttm: -5, net_margin: -0.2 });
    expect(f.earningsYield).toBeCloseTo(-0.05, 10);
    expect(f.netMargin).toBe(-0.2);
  });
});

describe("hasAnyFigure", () => {
  it("is false when only a price arrived", () => {
    expect(hasAnyFigure(keyFigures({ price: 1250 }))).toBe(false);
  });

  it("is false for an empty snapshot", () => {
    expect(hasAnyFigure(keyFigures({}))).toBe(false);
  });

  it("is true as soon as one fundamental exists", () => {
    expect(hasAnyFigure(keyFigures({ price: 1250, pe: 25 }))).toBe(true);
  });
});
