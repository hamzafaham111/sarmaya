// Ratios are COMPUTED at read time from statements — never stored, never
// fetched (CLAUDE.md data contracts). Pure functions; null in => null out;
// division by zero => null, never Infinity/NaN.

export interface StatementYearData {
  fiscalYear: number;
  income?: Record<string, number | null>;
  balance?: Record<string, number | null>;
  cashflow?: Record<string, number | null>;
}

export interface YearRatios {
  fiscalYear: number;
  grossMargin: number | null;
  opMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roic: number | null;
  debtToEquity: number | null;
  fcfMargin: number | null;
}

function div(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): number | null {
  if (
    numerator === null ||
    numerator === undefined ||
    denominator === null ||
    denominator === undefined ||
    denominator === 0 ||
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator)
  ) {
    return null;
  }
  return numerator / denominator;
}

function get(
  record: Record<string, number | null> | undefined,
  key: string,
): number | null {
  const v = record?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function computeYearRatios(year: StatementYearData): YearRatios {
  const revenue = get(year.income, "revenue");
  const grossProfit = get(year.income, "gross_profit");
  const operatingIncome = get(year.income, "operating_income");
  const netIncome = get(year.income, "net_income");
  const totalEquity = get(year.balance, "total_equity");
  const totalDebt = get(year.balance, "total_debt");
  const cash = get(year.balance, "cash");
  const fcf = get(year.cashflow, "fcf");

  // ROIC proxy: pre-tax operating income over invested capital
  // (equity + debt − cash). Documented as a proxy — no tax-rate data.
  const investedCapital =
    totalEquity !== null && totalDebt !== null
      ? totalEquity + totalDebt - (cash ?? 0)
      : null;

  return {
    fiscalYear: year.fiscalYear,
    grossMargin: div(grossProfit, revenue),
    opMargin: div(operatingIncome, revenue),
    netMargin: div(netIncome, revenue),
    roe: div(netIncome, totalEquity),
    roic: div(operatingIncome, investedCapital),
    debtToEquity: div(totalDebt, totalEquity),
    fcfMargin: div(fcf, revenue),
  };
}

/** Group flat statement rows (as stored) into per-year data for the ratio
 *  table. Years without any statements simply don't appear — data honesty. */
export function groupStatementYears(
  rows: {
    fiscalYear: number;
    statement: string;
    data: Record<string, number | null>;
  }[],
): StatementYearData[] {
  const byYear = new Map<number, StatementYearData>();
  for (const row of rows) {
    const year = byYear.get(row.fiscalYear) ?? { fiscalYear: row.fiscalYear };
    if (row.statement === "income") year.income = row.data;
    else if (row.statement === "balance") year.balance = row.data;
    else if (row.statement === "cashflow") year.cashflow = row.data;
    byYear.set(row.fiscalYear, year);
  }
  return [...byYear.values()].sort((a, b) => a.fiscalYear - b.fiscalYear);
}

/** 5-year (or available-history) CAGR of a line item; null when the series
 *  is too short or endpoints are non-positive. Used to auto-seed DCF growth. */
export function seriesCagr(
  values: { fiscalYear: number; value: number | null }[],
): number | null {
  const clean = values
    .filter((v) => v.value !== null && Number.isFinite(v.value))
    .sort((a, b) => a.fiscalYear - b.fiscalYear);
  if (clean.length < 2) return null;
  const first = clean[0];
  const last = clean[clean.length - 1];
  const years = last.fiscalYear - first.fiscalYear;
  if (years < 1) return null;
  if ((first.value as number) <= 0 || (last.value as number) <= 0) return null;
  return (
    Math.pow((last.value as number) / (first.value as number), 1 / years) - 1
  );
}
