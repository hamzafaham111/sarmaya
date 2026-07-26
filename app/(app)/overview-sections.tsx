import Link from "next/link";

import { DeltaValue } from "@/components/base/delta-value";
import { Sparkline } from "@/components/base/sparkline";
import type { AttentionItem, MoverInput } from "@/lib/analysis/overview";
import type { CurrencyBucket } from "@/lib/analysis/portfolio";
import type { JournalTimelineItem } from "@/lib/db/queries/journal";
import { formatMoney, formatPercent, type Currency, DASH } from "@/lib/format";

// The overview's four panels. Server components — no interactivity, just
// dense readable state. Density over whitespace, colour only where it
// carries meaning (UI mandate).

const KIND_LABEL: Record<string, string> = {
  buy: "Buy",
  sell: "Sell",
  sip: "SIP",
  note: "Note",
};

/** A fund's "symbol" is its AMFI scheme code — a number that means nothing
 *  to the person holding it. Lead with the name and keep the code as the
 *  quiet second line; stocks and indices are the other way round. */
function identity(
  kind: string,
  symbol: string,
  name: string | null,
): { primary: string; secondary: string } {
  if (kind === "fund" && name) {
    return { primary: name, secondary: `scheme ${symbol}` };
  }
  return { primary: symbol, secondary: name ?? DASH };
}

/** One card per currency bucket. Value first, then what it cost you and
 *  what it did — the three numbers a holder actually wants. */
export function PortfolioCards({
  buckets,
  dayChanges,
}: {
  buckets: CurrencyBucket[];
  /** bucket currency -> value-weighted day change */
  dayChanges: Record<string, number | null>;
}) {
  if (buckets.length === 0) return null;

  return (
    <section
      className={`grid gap-3 ${buckets.length > 1 ? "sm:grid-cols-2" : ""}`}
    >
      {buckets.map((bucket) => {
        const currency = bucket.currency as Currency;
        const value = Number(bucket.totalMarketValue);
        const cost = Number(bucket.totalCostBasis);
        const pnl = Number(bucket.totalUnrealizedPnl);
        const pnlPct = cost > 0 ? pnl / cost : null;
        const dayChange = dayChanges[bucket.currency] ?? null;

        return (
          <Link
            key={bucket.currency}
            href="/portfolio"
            className="group rounded-md border border-line bg-surface p-4 transition hover:border-brand/50"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-wide text-ink-muted uppercase">
                {bucket.currency} portfolio
              </span>
              <span className="text-[11px] text-ink-muted">
                {bucket.rows.length} holding
                {bucket.rows.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-numeric text-2xl text-ink tabular-nums">
                {formatMoney(value, currency)}
              </span>
              <span className="flex items-baseline gap-1 text-xs text-ink-muted">
                today
                <DeltaValue
                  value={dayChange === null ? null : dayChange * 100}
                  className="text-xs"
                />
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[11px]">
              <div>
                <dt className="text-ink-muted">Invested</dt>
                <dd className="font-numeric mt-0.5 text-ink tabular-nums">
                  {formatMoney(cost, currency, "compact")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">Unrealised</dt>
                <dd
                  className={`font-numeric mt-0.5 tabular-nums ${
                    pnl > 0 ? "text-pos" : pnl < 0 ? "text-neg" : "text-ink"
                  }`}
                >
                  {pnl > 0 ? "+" : ""}
                  {formatMoney(pnl, currency, "compact")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">Return</dt>
                <dd className="mt-0.5">
                  <DeltaValue
                    value={pnlPct === null ? null : pnlPct * 100}
                    className="text-[11px]"
                  />
                </dd>
              </div>
            </dl>

            {bucket.breachedValuePct !== null && bucket.breachedValuePct > 0 ? (
              <p className="mt-2 text-[11px] text-warn">
                {formatPercent(bucket.breachedValuePct, 0)} of stock value has a
                breached thesis
              </p>
            ) : null}
            {bucket.excludedCount > 0 ? (
              <p className="mt-2 text-[11px] text-ink-muted">
                {bucket.excludedCount} holding
                {bucket.excludedCount === 1 ? "" : "s"} excluded — no price
              </p>
            ) : null}
          </Link>
        );
      })}
    </section>
  );
}

/** Only rendered when something actually needs the user. */
export function AttentionPanel({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-display mb-2 text-sm text-ink">Needs attention</h2>
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="flex items-start gap-2.5 px-3 py-2.5 transition hover:bg-surface-2"
            >
              <span
                aria-hidden
                className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                  item.severity === "alert" ? "bg-neg" : "bg-warn"
                }`}
              />
              <span className="text-xs leading-[1.5] text-ink">
                {item.message}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MoversList({ movers }: { movers: MoverInput[] }) {
  if (movers.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-sm text-ink">Biggest moves today</h2>
        <Link
          href="/instruments"
          className="text-[11px] text-ink-muted underline underline-offset-4 hover:text-brand"
        >
          all instruments
        </Link>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {movers.map((m) => {
          const { primary, secondary } = identity(m.kind, m.symbol, m.name);
          return (
            <li key={m.instrumentId}>
              <Link
                href={`/i/${m.instrumentId}`}
                className="flex items-center gap-3 px-3 py-2 transition hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[13px] font-semibold text-ink ${
                      m.kind === "fund" ? "" : "font-numeric"
                    }`}
                  >
                    {primary}
                  </span>
                  <span className="block truncate text-[11px] text-ink-muted">
                    {secondary}
                  </span>
                </span>
                <span className="hidden sm:block">
                  <Sparkline values={m.series} width={64} height={20} />
                </span>
                {/* Exact, not compact: a price is read to the rupee. */}
                <span className="font-numeric shrink-0 text-right text-[13px] text-ink tabular-nums">
                  {formatMoney(m.price, m.currency as Currency)}
                </span>
                <DeltaValue
                  value={m.dayChange === null ? null : m.dayChange * 100}
                  className="w-16 shrink-0 text-right text-xs"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The journal is the soul of the product — it belongs on the front page. */
export function RecentDecisions({
  entries,
}: {
  entries: JournalTimelineItem[];
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-sm text-ink">Recent decisions</h2>
        <Link
          href="/journal"
          className="text-[11px] text-ink-muted underline underline-offset-4 hover:text-brand"
        >
          full journal
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-line bg-surface px-3 py-6 text-center text-xs text-ink-muted">
          Nothing recorded yet. Every buy, sell and SIP carries its why — that
          record is what you will reread in three years.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {entries.map((item) => (
            <li key={item.entry.id}>
              <Link
                href={`/i/${item.instrumentId}`}
                className="block px-3 py-2.5 transition hover:bg-surface-2"
              >
                <span className="flex items-baseline gap-2">
                  {/* Neutral chip; the meaning rides on the text colour so
                      no new palette entries are needed. */}
                  <span
                    className={`rounded-sm bg-surface-2 px-1 py-px text-[10px] ${
                      item.entry.kind === "sell"
                        ? "text-neg"
                        : item.entry.kind === "note"
                          ? "text-ink-muted"
                          : "text-pos"
                    }`}
                  >
                    {KIND_LABEL[item.entry.kind] ?? item.entry.kind}
                  </span>
                  <span
                    className={`min-w-0 truncate text-[12px] font-semibold text-ink ${
                      item.kind === "fund" ? "" : "font-numeric"
                    }`}
                  >
                    {identity(item.kind, item.symbol, item.name).primary}
                  </span>
                  <span className="font-numeric ml-auto shrink-0 text-[11px] whitespace-nowrap text-ink-muted tabular-nums">
                    {item.entry.tradeDate}
                  </span>
                </span>
                <p className="mt-1 line-clamp-2 text-[11px] leading-[1.5] text-ink-muted">
                  {item.entry.reasoning}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
