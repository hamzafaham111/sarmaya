import { describe, expect, it } from "vitest";

import { cagr, pointToPointReturn, returnsSummary } from "./returns";

// Hand-computed fixture series: NAV 100 exactly 5 years before the end,
// 150 exactly 3 years before, 180 one year before, 198 one month before,
// 200 at the end.
const END = "2026-07-24";
const SERIES = [
  { date: "2021-07-24", value: 100 }, // 5y back
  { date: "2022-07-24", value: 120 },
  { date: "2023-07-24", value: 150 }, // 3y back
  { date: "2024-07-24", value: 165 },
  { date: "2025-07-24", value: 180 }, // 1y back
  { date: "2026-06-24", value: 198 }, // ~1m back
  { date: END, value: 200 },
];

describe("pointToPointReturn", () => {
  it("1-month return matches hand computation", () => {
    // 200 / 198 - 1 = 0.0101...
    expect(pointToPointReturn(SERIES, 30)).toBeCloseTo(200 / 198 - 1, 10);
  });

  it("1-year return matches hand computation", () => {
    expect(pointToPointReturn(SERIES, 365)).toBeCloseTo(200 / 180 - 1, 10);
  });

  it("tolerates small gaps (weekend/holiday) at the lookback point", () => {
    // Nearest point ≤ target within 7 days is used.
    const gappy = [
      { date: "2025-07-20", value: 180 }, // 4 days earlier than exact 1y
      { date: END, value: 200 },
    ];
    expect(pointToPointReturn(gappy, 365)).toBeCloseTo(200 / 180 - 1, 10);
  });

  it("a hole larger than the tolerance yields null, not a lie", () => {
    const holey = [
      { date: "2025-05-01", value: 170 }, // ~85 days before the 1y point
      { date: END, value: 200 },
    ];
    expect(pointToPointReturn(holey, 365)).toBeNull();
  });

  it("too-short series yields null", () => {
    expect(pointToPointReturn([{ date: END, value: 200 }], 30)).toBeNull();
    expect(pointToPointReturn([], 30)).toBeNull();
  });
});

describe("cagr", () => {
  it("3-year CAGR matches hand computation", () => {
    // (200/150)^(1/3) - 1 — actualYears computed from real dates
    const r = cagr(SERIES, 3);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(Math.pow(200 / 150, 1 / 3) - 1, 3);
  });

  it("5-year CAGR matches hand computation", () => {
    const r = cagr(SERIES, 5);
    expect(r).toBeCloseTo(Math.pow(2, 1 / 5) - 1, 3);
  });

  it("series shorter than the window yields null (no extrapolation)", () => {
    expect(cagr(SERIES.slice(4), 5)).toBeNull();
  });

  it("non-positive values are dropped, never compounded", () => {
    const withJunk = [{ date: "2020-01-01", value: -5 }, ...SERIES];
    expect(cagr(withJunk, 5)).toBeCloseTo(Math.pow(2, 1 / 5) - 1, 3);
  });
});

describe("returnsSummary", () => {
  it("assembles all four windows", () => {
    const s = returnsSummary(SERIES);
    expect(s.r1m).toBeCloseTo(200 / 198 - 1, 10);
    expect(s.r1y).toBeCloseTo(200 / 180 - 1, 10);
    expect(s.cagr3y).not.toBeNull();
    expect(s.cagr5y).not.toBeNull();
  });

  it("empty series is all nulls", () => {
    expect(returnsSummary([])).toEqual({
      r1m: null,
      r1y: null,
      cagr3y: null,
      cagr5y: null,
    });
  });
});
