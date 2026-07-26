import { describe, expect, it } from "vitest";

import { buildPortfolio, type PortfolioInput } from "./portfolio";

const base: Omit<
  PortfolioInput,
  "instrumentId" | "symbol" | "currency" | "netQuantity" | "costBasis"
> = {
  name: null,
  kind: "stock",
  averageCost: null,
  latestValue: null,
  pe: null,
  roe: null,
  debtToEquity: null,
  estimateLow: null,
  estimateHigh: null,
  thesisStatuses: [],
};

describe("buildPortfolio — buckets and totals", () => {
  it("mixed currencies stay in separate buckets, never merged", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "RELIANCE.NS",
        currency: "INR",
        netQuantity: "10",
        costBasis: "12000",
        latestValue: 1300,
      },
      {
        ...base,
        instrumentId: "2",
        symbol: "AAPL",
        currency: "USD",
        netQuantity: "5",
        costBasis: "1500",
        latestValue: 330,
      },
      {
        ...base,
        instrumentId: "3",
        symbol: "122639",
        kind: "fund",
        currency: "INR",
        netQuantity: "200",
        costBasis: "16000",
        latestValue: 90,
      },
    ]);

    expect(buckets.map((b) => b.currency)).toEqual(["INR", "USD"]);
    const inr = buckets[0];
    // INR: 10×1300 + 200×90 = 13000 + 18000 = 31000; cost 28000; pnl 3000
    expect(inr.totalMarketValue).toBe("31000");
    expect(inr.totalCostBasis).toBe("28000");
    expect(inr.totalUnrealizedPnl).toBe("3000");
    // weights: 13000/31000, 18000/31000 (fund row sorted first — larger)
    expect(inr.rows[0].symbol).toBe("122639");
    expect(inr.rows[0].weightPct).toBeCloseTo(18000 / 31000, 10);
    const usd = buckets[1];
    expect(usd.totalMarketValue).toBe("1650");
    expect(usd.totalUnrealizedPnl).toBe("150");
  });

  it("null-price holding renders excluded from totals with a count", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "A.NS",
        currency: "INR",
        netQuantity: "10",
        costBasis: "1000",
        latestValue: 150,
      },
      {
        ...base,
        instrumentId: "2",
        symbol: "B.NS",
        currency: "INR",
        netQuantity: "10",
        costBasis: "500",
        latestValue: null, // no price — excluded
      },
    ]);
    const b = buckets[0];
    expect(b.excludedCount).toBe(1);
    expect(b.totalMarketValue).toBe("1500"); // only the priced row
    expect(b.rows.find((r) => r.symbol === "B.NS")!.marketValue).toBeNull();
    // cost basis still counts everything the user paid
    expect(b.totalCostBasis).toBe("1500");
  });

  it("exited positions (zero quantity) never appear", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "GONE.NS",
        currency: "INR",
        netQuantity: "0",
        costBasis: "0",
        latestValue: 100,
      },
    ]);
    expect(buckets).toEqual([]);
  });
});

describe("buildPortfolio — value-weighted 'one business' panel", () => {
  it("weights by market value and excludes null metrics with a count", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "A.NS",
        currency: "INR",
        netQuantity: "10",
        costBasis: "1",
        latestValue: 100, // value 1000
        pe: 20,
        roe: 0.2,
      },
      {
        ...base,
        instrumentId: "2",
        symbol: "B.NS",
        currency: "INR",
        netQuantity: "30",
        costBasis: "1",
        latestValue: 100, // value 3000
        pe: 40,
        roe: null, // excluded from ROE only
      },
    ]);
    const w = buckets[0].weighted;
    // PE: (1000×20 + 3000×40) / 4000 = 35
    expect(w.pe).toBeCloseTo(35, 10);
    // ROE: only A usable -> 0.2
    expect(w.roe).toBeCloseTo(0.2, 10);
    expect(w.excludedByMetric.roe).toBe(1);
    expect(w.excludedByMetric.pe).toBe(0);
  });
});

describe("buildPortfolio — breached-thesis rollup is by VALUE, not count", () => {
  it("one breached large holding dominates the percentage", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "BIG.NS",
        currency: "INR",
        netQuantity: "30",
        costBasis: "1",
        latestValue: 100, // 3000
        thesisStatuses: ["breached"],
      },
      {
        ...base,
        instrumentId: "2",
        symbol: "SMALL.NS",
        currency: "INR",
        netQuantity: "10",
        costBasis: "1",
        latestValue: 100, // 1000
        thesisStatuses: ["intact"],
      },
    ]);
    expect(buckets[0].breachedValuePct).toBeCloseTo(0.75, 10);
    expect(
      buckets[0].rows.find((r) => r.symbol === "BIG.NS")!.thesisHealth,
    ).toBe("breached");
  });

  it("partial = some but not all theses breached; archived ignored", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "MIX.NS",
        currency: "INR",
        netQuantity: "1",
        costBasis: "1",
        latestValue: 100,
        thesisStatuses: ["intact", "breached", "archived"],
      },
    ]);
    expect(buckets[0].rows[0].thesisHealth).toBe("partial");
  });

  it("no stock holdings => null pct (banner hidden)", () => {
    const buckets = buildPortfolio([
      {
        ...base,
        instrumentId: "1",
        symbol: "122639",
        kind: "fund",
        currency: "INR",
        netQuantity: "10",
        costBasis: "1",
        latestValue: 90,
      },
    ]);
    expect(buckets[0].breachedValuePct).toBeNull();
  });
});
