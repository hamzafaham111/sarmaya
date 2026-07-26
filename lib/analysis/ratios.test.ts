import { describe, expect, it } from "vitest";

import { computeYearRatios, groupStatementYears, seriesCagr } from "./ratios";

// Hand-computed reference company (round numbers so the arithmetic is
// checkable by eye):
//   revenue 1000, gross 400, opInc 200, netInc 120
//   equity 600, debt 300, cash 100, fcf 150
const REF = {
  fiscalYear: 2025,
  income: {
    revenue: 1000,
    gross_profit: 400,
    operating_income: 200,
    net_income: 120,
    eps: 12,
  },
  balance: {
    total_assets: 1500,
    total_equity: 600,
    total_debt: 300,
    cash: 100,
    shares_outstanding: 10,
  },
  cashflow: { cfo: 180, capex: -30, fcf: 150, dividends_paid: -20 },
};

describe("computeYearRatios — hand-computed reference", () => {
  const r = computeYearRatios(REF);

  it("margins", () => {
    expect(r.grossMargin).toBeCloseTo(0.4, 10);
    expect(r.opMargin).toBeCloseTo(0.2, 10);
    expect(r.netMargin).toBeCloseTo(0.12, 10);
    expect(r.fcfMargin).toBeCloseTo(0.15, 10);
  });

  it("returns on capital", () => {
    expect(r.roe).toBeCloseTo(120 / 600, 10);
    // ROIC proxy: 200 / (600 + 300 - 100) = 0.25
    expect(r.roic).toBeCloseTo(0.25, 10);
  });

  it("leverage", () => {
    expect(r.debtToEquity).toBeCloseTo(0.5, 10);
    // net debt = 300 - 100 = 200, over equity 600
    expect(r.netDebtToEquity).toBeCloseTo(1 / 3, 10);
  });

  it("returns on assets and asset efficiency", () => {
    expect(r.roa).toBeCloseTo(120 / 1500, 10);
    expect(r.assetTurnover).toBeCloseTo(1000 / 1500, 10);
  });

  it("cash conversion: FCF against reported profit", () => {
    expect(r.cashConversion).toBeCloseTo(150 / 120, 10);
  });

  it("payout ratio flips the reported outflow sign", () => {
    // dividends_paid is reported as -20; payout is 20/120.
    expect(r.payoutRatio).toBeCloseTo(20 / 120, 10);
  });

  it("book value per share", () => {
    expect(r.bookValuePerShare).toBeCloseTo(60, 10);
  });
});

describe("computeYearRatios — the added rows, edge cases", () => {
  it("net cash (cash > debt) stays negative, it is not clamped", () => {
    const r = computeYearRatios({
      fiscalYear: 2025,
      balance: { total_equity: 600, total_debt: 100, cash: 400 } as never,
    });
    // net debt = 100 - 400 = -300
    expect(r.netDebtToEquity).toBeCloseTo(-0.5, 10);
  });

  it("net debt needs both debt AND cash — no silent zero for cash", () => {
    const r = computeYearRatios({
      fiscalYear: 2025,
      balance: { total_equity: 600, total_debt: 300 } as never,
    });
    expect(r.netDebtToEquity).toBeNull();
  });

  it("payout ratio is not applicable in a loss year", () => {
    const r = computeYearRatios({
      fiscalYear: 2025,
      income: { net_income: -50 } as never,
      cashflow: { dividends_paid: -20 } as never,
    });
    expect(r.payoutRatio).toBeNull();
  });

  it("payout ratio accepts a positive dividends figure too", () => {
    const r = computeYearRatios({
      fiscalYear: 2025,
      income: { net_income: 100 } as never,
      cashflow: { dividends_paid: 25 } as never,
    });
    expect(r.payoutRatio).toBeCloseTo(0.25, 10);
  });

  it("cash conversion against a loss is negative, not null", () => {
    const r = computeYearRatios({
      fiscalYear: 2025,
      income: { net_income: -100 } as never,
      cashflow: { fcf: 50 } as never,
    });
    expect(r.cashConversion).toBeCloseTo(-0.5, 10);
  });

  it("zero shares outstanding => null BVPS, never Infinity", () => {
    const r = computeYearRatios({
      fiscalYear: 2025,
      balance: { total_equity: 600, shares_outstanding: 0 } as never,
    });
    expect(r.bookValuePerShare).toBeNull();
  });

  it("all added rows are null when the year is empty", () => {
    const r = computeYearRatios({ fiscalYear: 2024 });
    expect(r.roa).toBeNull();
    expect(r.netDebtToEquity).toBeNull();
    expect(r.cashConversion).toBeNull();
    expect(r.assetTurnover).toBeNull();
    expect(r.payoutRatio).toBeNull();
    expect(r.bookValuePerShare).toBeNull();
  });
});

describe("computeYearRatios — null discipline (null in => null out, never 0)", () => {
  it("missing statements entirely", () => {
    const r = computeYearRatios({ fiscalYear: 2024 });
    expect(r.grossMargin).toBeNull();
    expect(r.roe).toBeNull();
    expect(r.roic).toBeNull();
    expect(r.debtToEquity).toBeNull();
  });

  it("null line items propagate", () => {
    const r = computeYearRatios({
      fiscalYear: 2024,
      income: {
        revenue: 1000,
        gross_profit: null,
        operating_income: 200,
        net_income: null,
        eps: null,
      },
      balance: {
        total_assets: null,
        total_equity: null,
        total_debt: 300,
        cash: null,
        shares_outstanding: null,
      },
    });
    expect(r.grossMargin).toBeNull(); // null numerator
    expect(r.opMargin).toBeCloseTo(0.2, 10); // present pair still computes
    expect(r.roe).toBeNull(); // both sides null
    expect(r.roic).toBeNull(); // invested capital needs equity AND debt
    expect(r.debtToEquity).toBeNull(); // null denominator
  });

  it("zero denominators are null, not Infinity", () => {
    const r = computeYearRatios({
      fiscalYear: 2024,
      income: { revenue: 0, net_income: 10 } as never,
      balance: { total_equity: 0, total_debt: 100 } as never,
    });
    expect(r.netMargin).toBeNull();
    expect(r.roe).toBeNull();
    expect(r.debtToEquity).toBeNull();
  });

  it("missing cash treats cash as 0 in invested capital (documented proxy)", () => {
    const r = computeYearRatios({
      fiscalYear: 2024,
      income: { operating_income: 90 } as never,
      balance: { total_equity: 600, total_debt: 300 } as never,
    });
    expect(r.roic).toBeCloseTo(0.1, 10);
  });
});

describe("groupStatementYears", () => {
  it("merges the three statements per year and sorts ascending", () => {
    const grouped = groupStatementYears([
      { fiscalYear: 2025, statement: "income", data: { revenue: 2 } },
      { fiscalYear: 2024, statement: "income", data: { revenue: 1 } },
      { fiscalYear: 2025, statement: "balance", data: { total_equity: 5 } },
      { fiscalYear: 2025, statement: "cashflow", data: { fcf: 3 } },
    ]);
    expect(grouped.map((g) => g.fiscalYear)).toEqual([2024, 2025]);
    expect(grouped[1].income?.revenue).toBe(2);
    expect(grouped[1].balance?.total_equity).toBe(5);
    expect(grouped[1].cashflow?.fcf).toBe(3);
    expect(grouped[0].balance).toBeUndefined(); // absent, not fabricated
  });
});

describe("seriesCagr", () => {
  it("computes CAGR across available endpoints", () => {
    // 100 -> 200 over 4 years = 2^(1/4) - 1
    const cagr = seriesCagr([
      { fiscalYear: 2021, value: 100 },
      { fiscalYear: 2023, value: 150 },
      { fiscalYear: 2025, value: 200 },
    ]);
    expect(cagr).toBeCloseTo(Math.pow(2, 1 / 4) - 1, 10);
  });

  it("nulls inside the series are skipped, not treated as zero", () => {
    const cagr = seriesCagr([
      { fiscalYear: 2021, value: 100 },
      { fiscalYear: 2022, value: null },
      { fiscalYear: 2025, value: 200 },
    ]);
    expect(cagr).toBeCloseTo(Math.pow(2, 1 / 4) - 1, 10);
  });

  it("too short / non-positive endpoints => null", () => {
    expect(seriesCagr([{ fiscalYear: 2025, value: 100 }])).toBeNull();
    expect(
      seriesCagr([
        { fiscalYear: 2021, value: -5 },
        { fiscalYear: 2025, value: 200 },
      ]),
    ).toBeNull();
    expect(seriesCagr([])).toBeNull();
  });
});
