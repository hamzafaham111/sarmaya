// Display-only number formatting. NO arithmetic on money ever happens here
// (CLAUDE.md constraint #4); null renders as an em dash, never NaN.

export type Currency = "INR" | "PKR" | "USD";
export type MoneyStyle = "lakh-crore" | "compact";

const DASH = "—";

const SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  PKR: "Rs ",
  USD: "$",
};

// en-IN grouping produces the lakh/crore comma pattern: 1,23,45,678.
const inGrouping = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const usGrouping = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}

/** Compact units for the subcontinent: crore (1e7) and lakh (1e5). */
function compactIndian(abs: number): string {
  if (abs >= 1e7) return `${trimTo3Sig(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `${trimTo3Sig(abs / 1e5)}L`;
  if (abs >= 1e3) return `${trimTo3Sig(abs / 1e3)}K`;
  return trimTo3Sig(abs);
}

/** Western compact units: B / M / K. */
function compactWestern(abs: number): string {
  if (abs >= 1e9) return `${trimTo3Sig(abs / 1e9)}B`;
  if (abs >= 1e6) return `${trimTo3Sig(abs / 1e6)}M`;
  if (abs >= 1e3) return `${trimTo3Sig(abs / 1e3)}K`;
  return trimTo3Sig(abs);
}

/** ~3 significant digits without trailing zeros: 1.23, 12.3, 123. */
function trimTo3Sig(n: number): string {
  const fixed = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return fixed.replace(/\.0+$|(\.\d*?)0+$/, "$1");
}

export function formatMoney(
  value: number | string | null | undefined,
  currency: Currency,
  style: MoneyStyle = "lakh-crore",
): string {
  const n = toNumber(value);
  if (n === null) return DASH;

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const symbol = SYMBOLS[currency];

  if (style === "compact") {
    const body = currency === "USD" ? compactWestern(abs) : compactIndian(abs);
    return `${sign}${symbol}${body}`;
  }

  // lakh-crore grouping is an INR/PKR concept; USD falls back to US grouping.
  const grouped =
    currency === "USD" ? usGrouping.format(abs) : inGrouping.format(abs);
  return `${sign}${symbol}${grouped}`;
}

/** Plain (non-monetary) number with dash-for-null; used by stats/tables. */
export function formatNumber(
  value: number | string | null | undefined,
  fractionDigits = 2,
): string {
  const n = toNumber(value);
  if (n === null) return DASH;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(
  value: number | string | null | undefined,
  fractionDigits = 1,
): string {
  const n = toNumber(value);
  if (n === null) return DASH;
  return `${(n * 100).toFixed(fractionDigits)}%`;
}

export { DASH };
