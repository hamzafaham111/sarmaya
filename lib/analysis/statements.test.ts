import { describe, expect, it } from "vitest";

import { mergeManualStatements } from "./statements";
import type { StatementYearData } from "./ratios";

const FETCHED: StatementYearData[] = [
  {
    fiscalYear: 2024,
    income: { revenue: 1000, net_income: 100, eps: 10 },
    balance: { total_equity: 600, total_debt: 300 },
  },
  {
    fiscalYear: 2025,
    income: { revenue: 1200, net_income: 150, eps: 15 },
  },
];

describe("mergeManualStatements", () => {
  it("returns fetched years untouched when there is nothing manual", () => {
    const merged = mergeManualStatements(FETCHED, []);
    expect(merged.map((y) => y.fiscalYear)).toEqual([2024, 2025]);
    expect(merged[0].income).toEqual({
      revenue: 1000,
      net_income: 100,
      eps: 10,
    });
    expect(merged[0].manualKeys).toEqual([]);
  });

  it("adds a year the provider never had (the PSX / pre-history case)", () => {
    const merged = mergeManualStatements(FETCHED, [
      {
        fiscalYear: 2019,
        statement: "income",
        data: { revenue: 700, net_income: 60 },
      },
    ]);
    expect(merged.map((y) => y.fiscalYear)).toEqual([2019, 2024, 2025]);
    expect(merged[0].income).toEqual({ revenue: 700, net_income: 60 });
    expect(merged[0].manualKeys).toEqual([
      "income:revenue",
      "income:net_income",
    ]);
  });

  it("overrides a fetched field and leaves its siblings alone", () => {
    const merged = mergeManualStatements(FETCHED, [
      { fiscalYear: 2024, statement: "income", data: { revenue: 1111 } },
    ]);
    const y2024 = merged.find((y) => y.fiscalYear === 2024)!;
    expect(y2024.income).toEqual({
      revenue: 1111, // yours
      net_income: 100, // still the provider's
      eps: 10,
    });
    expect(y2024.manualKeys).toEqual(["income:revenue"]);
  });

  it("a null manual field means 'no opinion' and keeps the fetched figure", () => {
    const merged = mergeManualStatements(FETCHED, [
      {
        fiscalYear: 2024,
        statement: "income",
        data: { revenue: null, net_income: 999 },
      },
    ]);
    const y2024 = merged.find((y) => y.fiscalYear === 2024)!;
    expect(y2024.income?.revenue).toBe(1000);
    expect(y2024.income?.net_income).toBe(999);
    expect(y2024.manualKeys).toEqual(["income:net_income"]);
  });

  it("fills a statement the year did not have at all", () => {
    const merged = mergeManualStatements(FETCHED, [
      { fiscalYear: 2025, statement: "cashflow", data: { fcf: 180 } },
    ]);
    const y2025 = merged.find((y) => y.fiscalYear === 2025)!;
    expect(y2025.cashflow).toEqual({ fcf: 180 });
    expect(y2025.income?.revenue).toBe(1200);
    expect(y2025.manualKeys).toEqual(["cashflow:fcf"]);
  });

  it("merges rows across all three statements of one year", () => {
    const merged = mergeManualStatements(FETCHED, [
      { fiscalYear: 2024, statement: "income", data: { revenue: 1111 } },
      { fiscalYear: 2024, statement: "balance", data: { cash: 50 } },
      { fiscalYear: 2024, statement: "cashflow", data: { fcf: 90 } },
    ]);
    const y2024 = merged.find((y) => y.fiscalYear === 2024)!;
    expect(y2024.manualKeys.sort()).toEqual([
      "balance:cash",
      "cashflow:fcf",
      "income:revenue",
    ]);
    expect(y2024.balance).toEqual({
      total_equity: 600,
      total_debt: 300,
      cash: 50,
    });
  });

  it("keeps a manual zero — 'no debt' is an opinion, not a blank", () => {
    const merged = mergeManualStatements(FETCHED, [
      { fiscalYear: 2024, statement: "balance", data: { total_debt: 0 } },
    ]);
    const y2024 = merged.find((y) => y.fiscalYear === 2024)!;
    expect(y2024.balance?.total_debt).toBe(0);
    expect(y2024.manualKeys).toEqual(["balance:total_debt"]);
  });

  it("keeps manual negatives (capex, dividends paid, a loss)", () => {
    const merged = mergeManualStatements(
      [],
      [
        {
          fiscalYear: 2023,
          statement: "cashflow",
          data: { capex: -30, dividends_paid: -20 },
        },
      ],
    );
    expect(merged[0].cashflow).toEqual({ capex: -30, dividends_paid: -20 });
  });

  it("ignores unknown statement kinds and non-finite values defensively", () => {
    const merged = mergeManualStatements(FETCHED, [
      { fiscalYear: 2024, statement: "equity", data: { revenue: 5 } },
      {
        fiscalYear: 2024,
        statement: "income",
        data: { revenue: NaN, eps: Infinity },
      },
    ]);
    const y2024 = merged.find((y) => y.fiscalYear === 2024)!;
    expect(y2024.income?.revenue).toBe(1000);
    expect(y2024.income?.eps).toBe(10);
    expect(y2024.manualKeys).toEqual([]);
  });

  it("does not mutate the fetched input", () => {
    const fetched: StatementYearData[] = [
      { fiscalYear: 2024, income: { revenue: 1000 } },
    ];
    mergeManualStatements(fetched, [
      { fiscalYear: 2024, statement: "income", data: { revenue: 2000 } },
    ]);
    expect(fetched[0].income).toEqual({ revenue: 1000 });
  });

  it("sorts oldest -> newest whatever order the rows arrive in", () => {
    const merged = mergeManualStatements(
      [],
      [
        { fiscalYear: 2025, statement: "income", data: { revenue: 3 } },
        { fiscalYear: 2011, statement: "income", data: { revenue: 1 } },
        { fiscalYear: 2018, statement: "income", data: { revenue: 2 } },
      ],
    );
    expect(merged.map((y) => y.fiscalYear)).toEqual([2011, 2018, 2025]);
  });
});
