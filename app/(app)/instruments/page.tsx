import Link from "next/link";
import { redirect } from "next/navigation";

import { DeltaValue } from "@/components/base/delta-value";
import { EmptyState } from "@/components/base/empty-state";
import { Sparkline } from "@/components/base/sparkline";
import { StaleBadge } from "@/components/base/stale-badge";
import { SearchAdd } from "@/components/instruments/search-add";
import { listUserInstruments } from "@/lib/db/queries/instruments";
import { getDayChange, getPriceSeries } from "@/lib/db/queries/study";
import { formatMoney, type Currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { addInstrument } from "./actions";

const ERRORS: Record<string, string> = {
  invalid: "That didn't look like a valid instrument.",
  unknown: "Not in the supported universe (NSE 500, indices, US tickers).",
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const items = await listUserInstruments(user.id);
  const extras = await Promise.all(
    items.map(async ({ instrument }) => ({
      dayChange: await getDayChange(instrument.id),
      series: (await getPriceSeries(instrument.id, 90)).map((p) =>
        Number.isFinite(Number(p.close)) ? Number(p.close) : null,
      ),
    })),
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display mb-4 text-2xl font-medium text-ink">
        Instruments
      </h1>

      <SearchAdd action={addInstrument} />
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
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {items.map(({ instrument, latestSnapshot }, idx) => {
            const data = latestSnapshot?.data as {
              price?: number | null;
            } | null;
            const { dayChange, series } = extras[idx];
            return (
              <li key={instrument.id}>
                <Link
                  href={`/i/${instrument.id}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 transition hover:bg-surface-2"
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="font-numeric text-sm font-semibold text-ink">
                      {instrument.symbol}
                    </span>
                    <span className="truncate text-sm text-ink-muted">
                      {instrument.name ?? "—"}
                    </span>
                    <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-muted">
                      {instrument.kind} · {instrument.market}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <Sparkline values={series} width={72} height={20} />
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
