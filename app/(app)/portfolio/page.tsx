import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/base/empty-state";
import { RangeBand } from "@/components/base/range-band";
import { StatValue } from "@/components/base/stat-value";
import { buildPortfolio } from "@/lib/analysis/portfolio";
import { getPortfolioInputs } from "@/lib/db/queries/portfolio";
import {
  formatMoney,
  formatNumber,
  formatPercent,
  type Currency,
  DASH,
} from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// Journal-derived, currency-bucketed. No cross-currency totals anywhere
// (CLAUDE.md #5) — each bucket is its own little world.
export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const buckets = buildPortfolio(await getPortfolioInputs(user.id));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-6">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink">
        Portfolio
      </h1>

      {buckets.length === 0 ? (
        <EmptyState
          title="No holdings yet"
          message="Record buys, sells and SIPs — each with its why — from any instrument page; the portfolio derives from your journal."
        />
      ) : (
        buckets.map((bucket) => {
          const c = bucket.currency as Currency;
          return (
            <section key={bucket.currency} className="mb-10">
              <h2 className="font-display mb-3 text-lg text-ink">
                {bucket.currency} holdings
              </h2>

              {bucket.breachedValuePct !== null &&
              bucket.breachedValuePct > 0 ? (
                <p className="mb-3 rounded-sm bg-warn-soft px-3 py-2 text-sm text-warn">
                  {formatPercent(bucket.breachedValuePct, 0)} of your{" "}
                  {bucket.currency} stock value is in companies with a breached
                  thesis.
                </p>
              ) : null}

              <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatValue
                  label="Market value"
                  value={formatMoney(
                    Number(bucket.totalMarketValue),
                    c,
                    "compact",
                  )}
                  size="lg"
                />
                <StatValue
                  label="Cost basis"
                  value={formatMoney(
                    Number(bucket.totalCostBasis),
                    c,
                    "compact",
                  )}
                />
                <StatValue
                  label="Unrealized P/L"
                  value={formatMoney(
                    Number(bucket.totalUnrealizedPnl),
                    c,
                    "compact",
                  )}
                />
                <StatValue
                  label="Positions"
                  value={String(bucket.rows.length)}
                />
              </div>

              <div className="overflow-x-auto rounded-md border border-line bg-surface">
                <table className="w-full min-w-max text-[13px] leading-[1.4]">
                  <thead>
                    <tr className="border-b border-line text-ink-muted">
                      <th className="px-3 py-1.5 text-left font-medium">
                        Instrument
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium">
                        Qty
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium">
                        Avg cost
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium">
                        Price/NAV
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium">
                        Value
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium">
                        P/L
                      </th>
                      <th className="px-3 py-1.5 text-right font-medium">
                        Weight
                      </th>
                      <th className="px-3 py-1.5 text-left font-medium">
                        Your range
                      </th>
                      <th className="px-3 py-1.5 text-left font-medium">
                        Thesis
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucket.rows.map((row) => (
                      <tr
                        key={row.instrumentId}
                        className="border-b border-line last:border-0 hover:bg-surface-2"
                      >
                        <td className="px-3 py-1.5">
                          <Link
                            href={`/i/${row.instrumentId}`}
                            className="font-numeric font-medium text-ink hover:text-brand"
                          >
                            {row.symbol}
                          </Link>
                          <span className="ml-2 text-xs text-ink-muted">
                            {row.kind}
                          </span>
                        </td>
                        <td className="font-numeric px-3 py-1.5 text-right tabular-nums">
                          {formatNumber(row.netQuantity)}
                        </td>
                        <td className="font-numeric px-3 py-1.5 text-right tabular-nums">
                          {row.averageCost === null
                            ? DASH
                            : formatMoney(Number(row.averageCost), c)}
                        </td>
                        <td className="font-numeric px-3 py-1.5 text-right tabular-nums">
                          {formatMoney(row.latestValue, c)}
                        </td>
                        <td className="font-numeric px-3 py-1.5 text-right tabular-nums">
                          {row.marketValue === null
                            ? DASH
                            : formatMoney(
                                Number(row.marketValue),
                                c,
                                "compact",
                              )}
                        </td>
                        <td
                          className={`font-numeric px-3 py-1.5 text-right tabular-nums ${
                            row.unrealizedPnlPct === null
                              ? "text-ink-muted"
                              : row.unrealizedPnlPct >= 0
                                ? "text-pos"
                                : "text-neg"
                          }`}
                        >
                          {row.unrealizedPnl === null
                            ? DASH
                            : `${formatMoney(Number(row.unrealizedPnl), c, "compact")} (${
                                row.unrealizedPnlPct !== null &&
                                row.unrealizedPnlPct >= 0
                                  ? "+"
                                  : ""
                              }${formatPercent(row.unrealizedPnlPct)})`}
                        </td>
                        <td className="font-numeric px-3 py-1.5 text-right tabular-nums">
                          {formatPercent(row.weightPct, 1)}
                        </td>
                        <td className="px-3 py-1.5">
                          {row.estimateLow !== null &&
                          row.estimateHigh !== null ? (
                            <RangeBand
                              low={row.estimateLow}
                              high={row.estimateHigh}
                              marker={row.latestValue}
                              compact
                            />
                          ) : (
                            <span className="text-xs text-ink-muted">
                              {DASH}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-xs">
                          {row.thesisHealth === "none" ? (
                            <span className="text-ink-muted">no thesis</span>
                          ) : row.thesisHealth === "intact" ? (
                            <span className="text-pos">intact</span>
                          ) : row.thesisHealth === "partial" ? (
                            <span className="text-warn">partial</span>
                          ) : (
                            <span className="text-neg">breached</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bucket.excludedCount > 0 ? (
                <p className="mt-1 text-xs text-ink-muted">
                  {bucket.excludedCount} holding
                  {bucket.excludedCount > 1 ? "s" : ""} without a current price
                  — shown as {DASH} and excluded from totals.
                </p>
              ) : null}

              {bucket.weighted.pe !== null ||
              bucket.weighted.roe !== null ||
              bucket.weighted.debtToEquity !== null ? (
                <div className="mt-4 rounded-md border border-line bg-surface p-4">
                  <h3 className="mb-2 text-[11px] font-medium tracking-wide text-ink-muted uppercase">
                    Your {bucket.currency} stocks as one business
                    (value-weighted)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <StatValue
                      label="P/E"
                      value={
                        bucket.weighted.pe === null
                          ? null
                          : bucket.weighted.pe.toFixed(1)
                      }
                    />
                    <StatValue
                      label="ROE"
                      value={
                        bucket.weighted.roe === null
                          ? null
                          : formatPercent(bucket.weighted.roe)
                      }
                    />
                    <StatValue
                      label="Debt / equity"
                      value={
                        bucket.weighted.debtToEquity === null
                          ? null
                          : bucket.weighted.debtToEquity.toFixed(2)
                      }
                    />
                  </div>
                  {bucket.weighted.excludedByMetric.pe +
                    bucket.weighted.excludedByMetric.roe +
                    bucket.weighted.excludedByMetric.debtToEquity >
                  0 ? (
                    <p className="mt-2 text-xs text-ink-muted">
                      Holdings missing a metric are excluded from that metric
                      (P/E: {bucket.weighted.excludedByMetric.pe}, ROE:{" "}
                      {bucket.weighted.excludedByMetric.roe}, D/E:{" "}
                      {bucket.weighted.excludedByMetric.debtToEquity}).
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })
      )}
    </main>
  );
}
