import { Sparkline } from "@/components/base/sparkline";
import {
  computeYearRatios,
  type StatementYearData,
} from "@/lib/analysis/ratios";
import { formatPercent, DASH } from "@/lib/format";

// Computed at read time from statements — never stored (CLAUDE.md).
const ROWS: {
  key:
    | "grossMargin"
    | "opMargin"
    | "netMargin"
    | "roe"
    | "roic"
    | "debtToEquity"
    | "fcfMargin";
  label: string;
  percent: boolean;
}[] = [
  { key: "grossMargin", label: "Gross margin", percent: true },
  { key: "opMargin", label: "Operating margin", percent: true },
  { key: "netMargin", label: "Net margin", percent: true },
  { key: "fcfMargin", label: "FCF margin", percent: true },
  { key: "roe", label: "ROE", percent: true },
  { key: "roic", label: "ROIC (pre-tax proxy)", percent: true },
  { key: "debtToEquity", label: "Debt / equity", percent: false },
];

export function RatiosSection({ years }: { years: StatementYearData[] }) {
  if (years.length === 0) return null;
  const ratios = years.map((y) => computeYearRatios(y));

  return (
    <section className="mt-10">
      <h2 className="font-display mb-1 text-lg text-ink">Ratios</h2>
      <p className="mb-3 text-xs text-ink-muted">
        Computed from the statements above at read time — nothing fetched,
        nothing stored.
      </p>
      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-max text-[13px] leading-[1.4]">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 bg-surface px-3 py-1.5 text-left font-medium text-ink-muted" />
              {ratios.map((r) => (
                <th
                  key={r.fiscalYear}
                  className="px-3 py-1.5 text-right font-medium text-ink-muted"
                >
                  FY{r.fiscalYear}
                </th>
              ))}
              <th className="px-3 py-1.5 text-right font-medium text-ink-muted">
                trend
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const values = ratios.map((r) => r[row.key]);
              return (
                <tr
                  key={row.key}
                  className="border-b border-line last:border-0 hover:bg-surface-2"
                >
                  <td className="sticky left-0 bg-surface px-3 py-1.5 text-ink-muted">
                    {row.label}
                  </td>
                  {values.map((v, i) => (
                    <td
                      key={ratios[i].fiscalYear}
                      className="font-numeric px-3 py-1.5 text-right text-ink tabular-nums"
                    >
                      {v === null
                        ? DASH
                        : row.percent
                          ? formatPercent(v)
                          : v.toFixed(2)}
                    </td>
                  ))}
                  <td className="px-3 py-1">
                    <Sparkline values={values} width={72} height={20} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
