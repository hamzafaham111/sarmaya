import { StatValue } from "@/components/base/stat-value";
import { hasAnyFigure, keyFigures } from "@/lib/analysis/key-figures";
import {
  formatMoney,
  formatNumber,
  formatPercent,
  type Currency,
} from "@/lib/format";

// The figures an investor reads first, straight off the latest snapshot.
// Split into two groups on purpose: what the market is paying, and the
// trailing business behind it. Ratios per fiscal year live further down —
// mixing TTM and FY in one grid would compare different periods.
export function KeyFiguresSection({
  snapshot,
  currency,
  asOf,
  isManual = false,
}: {
  snapshot: Record<string, unknown> | null;
  currency: Currency;
  asOf: string | null;
  isManual?: boolean;
}) {
  const f = keyFigures(snapshot);

  if (!hasAnyFigure(f)) {
    return (
      <section className="mt-6">
        <h2 className="font-display mb-2 text-lg text-ink">Key figures</h2>
        <p className="rounded-md border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {isManual
            ? "No figures yet — this instrument is yours to fill in. Add statement years below and the ratios compute from them."
            : "No figures beyond price from this source yet — the daily job adds them when the provider supplies them."}
        </p>
      </section>
    );
  }

  const money = (v: number | null) => formatMoney(v, currency, "compact");
  const exact = (v: number | null) => formatMoney(v, currency);
  const ratio = (v: number | null) => (v === null ? null : v.toFixed(2));
  const pct = (v: number | null) => (v === null ? null : formatPercent(v));

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ink">Key figures</h2>
        <span className="text-xs text-ink-muted">
          latest snapshot{asOf ? ` · ${asOf}` : ""} · trailing twelve months
        </span>
      </div>

      <div className="rounded-md border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <p className="mb-2 text-[11px] tracking-wide text-ink-muted uppercase">
            What the market pays
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatValue label="Market cap" value={money(f.marketCap)} />
            <StatValue label="P / E" value={ratio(f.pe)} />
            <StatValue label="P / B" value={ratio(f.pb)} />
            <StatValue label="Earnings yield" value={pct(f.earningsYield)} />
            <StatValue label="FCF yield" value={pct(f.fcfYield)} />
            <StatValue label="Dividend yield" value={pct(f.dividendYield)} />
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="mb-2 text-[11px] tracking-wide text-ink-muted uppercase">
            The business behind it
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatValue label="Revenue" value={money(f.revenueTtm)} />
            <StatValue label="Revenue growth" value={pct(f.revenueGrowthYoy)} />
            <StatValue label="EPS" value={exact(f.epsTtm)} />
            <StatValue label="Free cash flow" value={money(f.fcfTtm)} />
            <StatValue label="Gross margin" value={pct(f.grossMargin)} />
            <StatValue label="Operating margin" value={pct(f.opMargin)} />
            <StatValue label="Net margin" value={pct(f.netMargin)} />
            <StatValue label="ROE" value={pct(f.roe)} />
            <StatValue label="ROIC" value={pct(f.roic)} />
            <StatValue label="Debt / equity" value={ratio(f.debtToEquity)} />
            <StatValue
              label="Book value / share"
              value={exact(f.bookValuePerShare)}
            />
            <StatValue
              label="Shares out"
              value={
                f.sharesOutstanding === null
                  ? null
                  : formatNumber(f.sharesOutstanding, 0)
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
