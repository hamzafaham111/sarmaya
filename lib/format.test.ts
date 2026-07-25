import { describe, expect, it } from "vitest";

import { formatMoney, formatNumber, formatPercent } from "./format";

describe("formatMoney — lakh-crore grouping (INR/PKR)", () => {
  it("groups INR the Indian way: 1,23,45,678", () => {
    expect(formatMoney(12345678, "INR")).toBe("₹1,23,45,678");
  });

  it("groups PKR the same way with the Rs symbol", () => {
    expect(formatMoney(12345678, "PKR")).toBe("Rs 1,23,45,678");
  });

  it("small values need no exotic grouping", () => {
    expect(formatMoney(999, "INR")).toBe("₹999");
    expect(formatMoney(1234, "INR")).toBe("₹1,234");
    expect(formatMoney(123456, "INR")).toBe("₹1,23,456");
  });

  it("USD falls back to western grouping (lakh/crore is an INR/PKR concept)", () => {
    expect(formatMoney(12345678, "USD")).toBe("$12,345,678");
  });

  it("negatives put the sign before the symbol", () => {
    expect(formatMoney(-12345678, "INR")).toBe("-₹1,23,45,678");
    expect(formatMoney(-1234567, "USD")).toBe("-$1,234,567");
  });

  it("accepts numeric strings (DB numeric comes as string)", () => {
    expect(formatMoney("12345678", "INR")).toBe("₹1,23,45,678");
    expect(formatMoney("-12345678.55", "PKR")).toBe(
      "Rs 1,23,45,678.55".replace("Rs ", "-Rs "),
    );
  });

  it("null / undefined / empty / NaN render as em dash, never NaN", () => {
    expect(formatMoney(null, "INR")).toBe("—");
    expect(formatMoney(undefined, "PKR")).toBe("—");
    expect(formatMoney("", "USD")).toBe("—");
    expect(formatMoney("not-a-number", "INR")).toBe("—");
    expect(formatMoney(Number.NaN, "USD")).toBe("—");
  });
});

describe("formatMoney — compact style", () => {
  it("INR compacts to crore / lakh / thousand", () => {
    expect(formatMoney(12_300_000, "INR", "compact")).toBe("₹1.23Cr");
    expect(formatMoney(4_560_000, "INR", "compact")).toBe("₹45.6L");
    expect(formatMoney(12_300, "INR", "compact")).toBe("₹12.3K");
    expect(formatMoney(950, "INR", "compact")).toBe("₹950");
  });

  it("PKR compacts with Rs symbol", () => {
    expect(formatMoney(200_000_000, "PKR", "compact")).toBe("Rs 20Cr");
  });

  it("USD compacts to B / M / K", () => {
    expect(formatMoney(1_230_000_000, "USD", "compact")).toBe("$1.23B");
    expect(formatMoney(45_600_000, "USD", "compact")).toBe("$45.6M");
    expect(formatMoney(9_990, "USD", "compact")).toBe("$9.99K");
  });

  it("compact negatives and nulls behave", () => {
    expect(formatMoney(-12_300_000, "INR", "compact")).toBe("-₹1.23Cr");
    expect(formatMoney(null, "INR", "compact")).toBe("—");
  });
});

describe("formatNumber / formatPercent", () => {
  it("plain numbers with dash-for-null", () => {
    expect(formatNumber(1234.567)).toBe("1,234.57");
    expect(formatNumber(null)).toBe("—");
  });

  it("percent from fraction with dash-for-null", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
    expect(formatPercent(-0.05)).toBe("-5.0%");
    expect(formatPercent(null)).toBe("—");
  });
});
