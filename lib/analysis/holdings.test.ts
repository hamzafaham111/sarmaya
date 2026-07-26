import { describe, expect, it } from "vitest";

import { computeHoldings, type HoldingsEntry } from "./holdings";

const entry = (
  kind: string,
  date: string,
  qty: string | null,
  price: string | null,
): HoldingsEntry => ({ kind, tradeDate: date, quantity: qty, price });

describe("computeHoldings", () => {
  it("empty journal is a zero position", () => {
    expect(computeHoldings([])).toEqual({
      netQuantity: "0",
      averageCost: null,
      costBasis: "0",
    });
  });

  it("buy / partial sell / exit sequence to the paisa", () => {
    // 100 @ 10 -> sell 40 (avg 10) -> 60 @ 10; buy 60 @ 20 -> 120 @ 15;
    // sell 20 -> 100 @ 15, basis 1500.00
    const result = computeHoldings([
      entry("buy", "2026-01-01", "100", "10"),
      entry("sell", "2026-01-15", "40", "12"),
      entry("buy", "2026-02-01", "60", "20"),
      entry("sell", "2026-02-15", "20", "18"),
    ]);
    expect(result).toEqual({
      netQuantity: "100",
      averageCost: "15",
      costBasis: "1500",
    });
  });

  it("full exit then re-entry resets the basis", () => {
    const result = computeHoldings([
      entry("buy", "2026-01-01", "10", "100"),
      entry("sell", "2026-02-01", "10", "150"),
      entry("buy", "2026-03-01", "4", "50"),
    ]);
    expect(result).toEqual({
      netQuantity: "4",
      averageCost: "50",
      costBasis: "200",
    });
  });

  it("SIP sequence accumulates units at varying NAVs to the paisa", () => {
    // 3 SIPs of ₹10,000 at NAVs 80 / 100 / 125:
    // units: 125 + 100 + 80 = 305; cost 30,000; avg = 30000/305 = 98.3607 (4dp)
    const result = computeHoldings([
      entry("sip", "2026-01-05", "125", "80"),
      entry("sip", "2026-02-05", "100", "100"),
      entry("sip", "2026-03-05", "80", "125"),
    ]);
    expect(result.netQuantity).toBe("305");
    expect(result.averageCost).toBe("98.3607");
    expect(result.costBasis).toBe("30000");
  });

  it("SIP + partial redemption keeps average-cost discipline", () => {
    const result = computeHoldings([
      entry("sip", "2026-01-05", "125", "80"),
      entry("sip", "2026-02-05", "100", "100"),
      entry("sell", "2026-03-01", "25", "110"),
    ]);
    // 225 units @ avg (20000/225 = 88.888...); sell 25 -> 200 units,
    // basis 20000 - 25×88.888... = 17777.78
    expect(result.netQuantity).toBe("200");
    expect(result.costBasis).toBe("17777.78");
  });

  it("fractional units compound exactly (no float drift)", () => {
    const result = computeHoldings([
      entry("sip", "2026-01-01", "0.1", "0.3"),
      entry("sip", "2026-02-01", "0.2", "0.3"),
    ]);
    expect(result.netQuantity).toBe("0.3"); // 0.1 + 0.2 === 0.3 exactly
    expect(result.averageCost).toBe("0.3");
  });

  it("date order wins over array order; oversell clamps; notes ignored", () => {
    const result = computeHoldings([
      entry("sell", "2026-03-01", "999", "1"),
      entry("note", "2026-01-15", null, null),
      entry("buy", "2026-01-01", "10", "100"),
      entry("buy", "2026-02-01", null, "50"), // null qty ignored
    ]);
    expect(result).toEqual({
      netQuantity: "0",
      averageCost: null,
      costBasis: "0",
    });
  });
});
