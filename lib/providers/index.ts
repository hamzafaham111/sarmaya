// Adapter layer boundary (CLAUDE.md #3). Nothing outside lib/providers/ and
// jobs/providers/ may reference provider-specific concepts. These are the
// normalized contracts every adapter maps into.

export const SNAPSHOT_KEYS = [
  "price",
  "currency",
  "market_cap",
  "pe",
  "pb",
  "eps_ttm",
  "revenue_ttm",
  "revenue_growth_yoy",
  "gross_margin",
  "op_margin",
  "net_margin",
  "fcf_ttm",
  "debt_to_equity",
  "roe",
  "roic",
  "shares_outstanding",
  "dividend_yield",
  "book_value_per_share",
] as const;

export type SnapshotKey = (typeof SNAPSHOT_KEYS)[number];

// Every metric nullable everywhere (CLAUDE.md #4); currency is a string code.
export type SnapshotData = { currency: string | null } & {
  [K in Exclude<SnapshotKey, "currency">]: number | null;
};

export const INCOME_KEYS = [
  "revenue",
  "gross_profit",
  "operating_income",
  "net_income",
  "eps",
] as const;
export const BALANCE_KEYS = [
  "total_assets",
  "total_equity",
  "total_debt",
  "cash",
  "shares_outstanding",
] as const;
export const CASHFLOW_KEYS = ["cfo", "capex", "fcf", "dividends_paid"] as const;

export type StatementKind = "income" | "balance" | "cashflow";

export interface StatementYear {
  fiscalYear: number;
  statement: StatementKind;
  data: Record<string, number | null>;
}

export type InstrumentKind = "stock" | "fund" | "index";
export type Market = "IN" | "PK" | "US";
export type CurrencyCode = "INR" | "PKR" | "USD";
