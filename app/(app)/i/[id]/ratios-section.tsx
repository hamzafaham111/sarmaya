import { Fragment } from "react";

import { Sparkline } from "@/components/base/sparkline";
import {
  computeYearRatios,
  type StatementYearData,
  type YearRatios,
} from "@/lib/analysis/ratios";
import { formatMoney, formatPercent, type Currency, DASH } from "@/lib/format";

// Computed at read time from statements — never stored (CLAUDE.md).
// Grouped the way an investor reads a business: how profitable, what it
// earns on capital, how it is financed, whether the profit is real cash,
// and what comes back to the holder.
type RatioKey = Exclude<keyof YearRatios, "fiscalYear">;

const ROWS: {
  key: RatioKey;
  label: string;
  format: "percent" | "ratio" | "money";
  group: string;
}[] = [
  { key: "grossMargin", label: "Gross margin", format: "percent", group: "Profitability" }, // prettier-ignore
  { key: "opMargin", label: "Operating margin", format: "percent", group: "Profitability" }, // prettier-ignore
  { key: "netMargin", label: "Net margin", format: "percent", group: "Profitability" }, // prettier-ignore
  { key: "fcfMargin", label: "FCF margin", format: "percent", group: "Profitability" }, // prettier-ignore
  { key: "roe", label: "ROE", format: "percent", group: "Returns on capital" },
  { key: "roic", label: "ROIC (pre-tax proxy)", format: "percent", group: "Returns on capital" }, // prettier-ignore
  { key: "roa", label: "ROA", format: "percent", group: "Returns on capital" },
  { key: "debtToEquity", label: "Debt / equity", format: "ratio", group: "Leverage" }, // prettier-ignore
  { key: "netDebtToEquity", label: "Net debt / equity", format: "ratio", group: "Leverage" }, // prettier-ignore
  { key: "cashConversion", label: "Cash conversion (FCF / net income)", format: "percent", group: "Cash & efficiency" }, // prettier-ignore
  { key: "assetTurnover", label: "Asset turnover", format: "ratio", group: "Cash & efficiency" }, // prettier-ignore
  { key: "payoutRatio", label: "Dividend payout", format: "percent", group: "Per shareholder" }, // prettier-ignore
  { key: "bookValuePerShare", label: "Book value / share", format: "money", group: "Per shareholder" }, // prettier-ignore
];

export function RatiosSection({
  years,
  currency,
}: {
  years: StatementYearData[];
  currency: Currency;
}) {
  if (years.length === 0) return null;
  const ratios = years.map((y) => computeYearRatios(y));

  function display(value: number | null, format: string): string {
    if (value === null) return DASH;
    if (format === "percent") return formatPercent(value);
    if (format === "money") return formatMoney(value, currency);
    return value.toFixed(2);
  }

  // Group headers are decided up front — the row list is static, so this is
  // a plain derivation rather than state carried through the render.
  const rows = ROWS.map((row, i) => ({
    ...row,
    startsGroup: i === 0 || ROWS[i - 1].group !== row.group,
  }));

  return (
    <section className="mt-10">
      <h2 className="font-display mb-1 text-lg text-ink">Ratios</h2>
      <p className="mb-3 text-xs text-ink-muted">
        Computed from the statements above at read time — nothing fetched,
        nothing stored. A dash means the source did not provide the inputs.
      </p>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-max text-[14px] leading-[1.4]">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 bg-surface px-4 py-2.5 text-left font-medium text-ink-muted" />
              {ratios.map((r) => (
                <th
                  key={r.fiscalYear}
                  className="px-4 py-2.5 text-right font-medium text-ink-muted"
                >
                  FY{r.fiscalYear}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right font-medium text-ink-muted">
                trend
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = ratios.map((r) => r[row.key]);
              return (
                <Fragment key={row.key}>
                  {row.startsGroup ? (
                    <tr className="border-b border-line bg-surface-2">
                      <td
                        colSpan={ratios.length + 2}
                        className="sticky left-0 px-4 py-2 text-[12px] tracking-wide text-ink-muted uppercase"
                      >
                        {row.group}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-b border-line last:border-0 hover:bg-surface-2">
                    <td className="sticky left-0 bg-surface px-4 py-2.5 text-ink-muted">
                      {row.label}
                    </td>
                    {values.map((v, i) => (
                      <td
                        key={ratios[i].fiscalYear}
                        className="font-numeric px-4 py-2.5 text-right text-ink tabular-nums"
                      >
                        {display(v, row.format)}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <Sparkline values={values} width={72} height={20} />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
