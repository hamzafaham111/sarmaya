import Link from "next/link";
import { redirect } from "next/navigation";

import { DeltaValue } from "@/components/base/delta-value";
import { EmptyState } from "@/components/base/empty-state";
import { Sparkline } from "@/components/base/sparkline";
import { StaleBadge } from "@/components/base/stale-badge";
import { ManualAdd } from "@/components/instruments/manual-add";
import { SearchAdd } from "@/components/instruments/search-add";
import { dayChangeFromSeries } from "@/lib/analysis/overview";
import { listUserInstruments } from "@/lib/db/queries/instruments";
import { getSeriesBatch } from "@/lib/db/queries/study";
import { formatMoney, type Currency } from "@/lib/format";
import { getCurrentUser } from "@/lib/supabase/current-user";

import { addInstrument, addManualInstrument } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "That didn't look like a valid instrument.",
  unknown: "Not in the supported universe (NSE 500, indices, US tickers).",
  invalidManual:
    "Check the fields — a name, and a symbol of letters, digits, dots or dashes.",
  exists:
    "That symbol is already covered by a data source — search for it above instead.",
};

function isStale(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > 48 * 60 * 60 * 1000;
}

export default async function InstrumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const items = await listUserInstruments(user.id);
  // One batched series query for every row — this page used to make two
  // round trips per instrument, and each one costs ~400ms.
  const series = await getSeriesBatch(
    items.map((i) => i.instrument.id),
    90,
  );
  const extras = items.map(({ instrument }) => {
    const points = series.get(instrument.id);
    return {
      dayChange: dayChangeFromSeries(points),
      series: (points ?? []).map((p) =>
        Number.isFinite(Number(p.close)) ? Number(p.close) : null,
      ),
    };
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display text-grad-brand mb-4 text-2xl font-semibold">
        Instruments
      </h1>

      <SearchAdd action={addInstrument} />
      <ManualAdd action={addManualInstrument} />
      {error ? (
        <p className="mt-2 text-sm text-neg" role="alert">
          {ERRORS[error] ?? "Something went wrong."}
        </p>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing tracked yet"
            message="Search above — NSE stocks by name or symbol, the benchmark indices, or type a US ticker."
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {items.map(({ instrument, latestSnapshot }, idx) => {
            const data = latestSnapshot?.data as {
              price?: number | null;
            } | null;
            const { dayChange, series } = extras[idx];
            return (
              <li key={instrument.id}>
                <Link
                  href={`/i/${instrument.id}`}
                  className="flex items-baseline justify-between gap-4 px-5 py-3.5 pressable-row hover:bg-surface-2"
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="font-numeric text-sm font-semibold text-ink">
                      {instrument.symbol}
                    </span>
                    <span className="truncate text-sm text-ink-muted">
                      {instrument.name ?? "—"}
                    </span>
                    <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[12px] text-ink-muted">
                      {instrument.kind} · {instrument.market}
                    </span>
                    {instrument.isManual ? (
                      <span className="rounded-sm bg-gold-soft px-1.5 py-0.5 text-[12px] text-gold">
                        hand-kept
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <Sparkline
                      values={series}
                      width={72}
                      height={20}
                      tone="violet"
                    />
                    <span className="font-numeric w-24 text-right text-sm text-ink tabular-nums">
                      {formatMoney(
                        data?.price ?? null,
                        instrument.currency as Currency,
                      )}
                    </span>
                    <DeltaValue
                      value={dayChange === null ? null : dayChange * 100}
                      className="w-16 text-right text-xs"
                    />
                    {isStale(latestSnapshot?.fetchedAt ?? null) ? (
                      <StaleBadge asOf={latestSnapshot?.asOf ?? null} />
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
