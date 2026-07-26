import { z } from "zod";

// The ONE rule shape. Constrained form + Zod + the theses_rule_shape_ck DB
// constraint enforce the same contract — invalid rules are impossible by
// construction. Metrics = numeric snapshot vocabulary ∪ the derived
// price-vs-your-estimate metric (computed at evaluation time, never stored).
export const RULE_METRICS = [
  "price",
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
  "price_vs_estimate_low_pct",
] as const;

export type RuleMetric = (typeof RULE_METRICS)[number];

export const ruleSchema = z
  .object({
    metric: z.enum(RULE_METRICS),
    op: z.enum(["gt", "lt"]),
    value: z.number().finite(),
  })
  .strict();

export type Rule = z.infer<typeof ruleSchema>;

export const RULE_OPS = [
  { value: "gt", label: "rises above" },
  { value: "lt", label: "falls below" },
] as const;

export const METRIC_LABELS: Record<RuleMetric, string> = {
  price: "Price",
  market_cap: "Market cap",
  pe: "P/E (ttm)",
  pb: "P/B",
  eps_ttm: "EPS (ttm)",
  revenue_ttm: "Revenue (ttm)",
  revenue_growth_yoy: "Revenue growth (yoy)",
  gross_margin: "Gross margin",
  op_margin: "Operating margin",
  net_margin: "Net margin",
  fcf_ttm: "Free cash flow (ttm)",
  debt_to_equity: "Debt / equity",
  roe: "ROE",
  roic: "ROIC",
  shares_outstanding: "Shares outstanding",
  dividend_yield: "Dividend yield",
  book_value_per_share: "Book value / share",
  price_vs_estimate_low_pct: "Price as % of your estimate low",
};
