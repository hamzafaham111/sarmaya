// Overlaying the user's own statement figures on the provider's.
//
// Field-level merge, deliberately: free sources reach back ~4-5 years and
// some markets (PSX) carry no statements at all, so a user filling gaps
// should not have to retype the years the provider already got right. A
// manual field that is null means "no opinion" and falls through to the
// fetched figure — that is what lets you type only the two lines you have.
//
// Pure and provenance-preserving: the merged year records which fields came
// from the user, so the table can mark them.

import type { StatementYearData } from "./ratios";

export type StatementKind = "income" | "balance" | "cashflow";

export const STATEMENT_KINDS: StatementKind[] = [
  "income",
  "balance",
  "cashflow",
];

export interface ManualStatementRow {
  fiscalYear: number;
  statement: string;
  data: Record<string, number | null>;
}

export interface MergedStatementYear extends StatementYearData {
  /** `${statement}:${lineItem}` for every field the user supplied. */
  manualKeys: string[];
}

function isKind(value: string): value is StatementKind {
  return (STATEMENT_KINDS as string[]).includes(value);
}

/**
 * Merge fetched statement years with the user's manual rows.
 * Manual non-null fields win; manual nulls fall back to fetched; years that
 * exist only manually are added. Result is sorted oldest -> newest.
 */
export function mergeManualStatements(
  fetched: StatementYearData[],
  manual: ManualStatementRow[],
): MergedStatementYear[] {
  const byYear = new Map<number, MergedStatementYear>();

  for (const year of fetched) {
    byYear.set(year.fiscalYear, {
      fiscalYear: year.fiscalYear,
      income: year.income ? { ...year.income } : undefined,
      balance: year.balance ? { ...year.balance } : undefined,
      cashflow: year.cashflow ? { ...year.cashflow } : undefined,
      manualKeys: [],
    });
  }

  for (const row of manual) {
    if (!isKind(row.statement)) continue;
    const kind = row.statement;

    const year: MergedStatementYear = byYear.get(row.fiscalYear) ?? {
      fiscalYear: row.fiscalYear,
      manualKeys: [],
    };
    const target = { ...(year[kind] ?? {}) };

    for (const [key, value] of Object.entries(row.data ?? {})) {
      // null / non-finite => no opinion; keep whatever the provider gave.
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      target[key] = value;
      year.manualKeys.push(`${kind}:${key}`);
    }

    year[kind] = target;
    byYear.set(row.fiscalYear, year);
  }

  return [...byYear.values()].sort((a, b) => a.fiscalYear - b.fiscalYear);
}

/** Line items the manual entry form offers, per statement — the CLAUDE.md
 *  statement vocabulary, nothing invented. */
export const LINE_ITEM_VOCABULARY: Record<
  StatementKind,
  { key: string; label: string }[]
> = {
  income: [
    { key: "revenue", label: "Revenue" },
    { key: "gross_profit", label: "Gross profit" },
    { key: "operating_income", label: "Operating income" },
    { key: "net_income", label: "Net income" },
    { key: "eps", label: "EPS" },
  ],
  balance: [
    { key: "total_assets", label: "Total assets" },
    { key: "total_equity", label: "Total equity" },
    { key: "total_debt", label: "Total debt" },
    { key: "cash", label: "Cash" },
    { key: "shares_outstanding", label: "Shares outstanding" },
  ],
  cashflow: [
    { key: "cfo", label: "Cash from operations" },
    { key: "capex", label: "Capex" },
    { key: "fcf", label: "Free cash flow" },
    { key: "dividends_paid", label: "Dividends paid" },
  ],
};
