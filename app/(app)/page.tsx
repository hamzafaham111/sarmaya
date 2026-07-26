import Link from "next/link";
import { redirect } from "next/navigation";

import { DeltaValue } from "@/components/base/delta-value";
import { EmptyState } from "@/components/base/empty-state";
import { StatValue } from "@/components/base/stat-value";
import { buildPortfolio } from "@/lib/analysis/portfolio";
import { listUserInstruments } from "@/lib/db/queries/instruments";
import { getPortfolioInputs } from "@/lib/db/queries/portfolio";
import { getDayChange } from "@/lib/db/queries/study";
import { formatMoney, type Currency, DASH } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { createExampleSet } from "./instruments/actions";

// The real overview: tracked instruments, per-currency portfolio totals,
// thesis health — all derived, nothing decorative.
export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [tracked, portfolioInputs] = await Promise.all([
    listUserInstruments(user.id),
    getPortfolioInputs(user.id),
  ]);
  const buckets = buildPortfolio(portfolioInputs);

  const intact = portfolioInputs
    .flatMap((i) => i.thesisStatuses)
    .filter((s) => s === "intact").length;
  const breached = portfolioInputs
    .flatMap((i) => i.thesisStatuses)
    .filter((s) => s === "breached").length;

  const movers = await Promise.all(
    tracked.slice(0, 8).map(async ({ instrument }) => ({
      instrument,
      dayChange: await getDayChange(instrument.id),
    })),
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink">
        Overview
      </h1>

      {tracked.length === 0 ? (
        <EmptyState
          title="Welcome to Sarmaya"
          message="Track your first instrument from the Instruments page — or start with a pre-filled example set to see how the terminal works."
          action={
            <form action={createExampleSet}>
              <button
                type="submit"
                className="rounded-sm bg-brand px-3 py-1.5 text-sm text-on-brand"
              >
                Create example set
              </button>
            </form>
          }
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatValue
              label="Tracked instruments"
              value={String(tracked.length)}
              size="lg"
            />
            {buckets.slice(0, 2).map((b) => (
              <StatValue
                key={b.currency}
                label={`Portfolio (${b.currency})`}
                value={formatMoney(
                  Number(b.totalMarketValue),
                  b.currency as Currency,
                  "compact",
                )}
              />
            ))}
            <StatValue
              label="Theses"
              value={
                intact + breached === 0
                  ? null
                  : `${intact} intact · ${breached} breached`
              }
            />
          </section>

          <section className="mt-8">
            <h2 className="font-display mb-3 text-lg text-ink">Watchlist</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {movers.map(({ instrument, dayChange }) => (
                <li key={instrument.id}>
                  <Link
                    href={`/i/${instrument.id}`}
                    className="flex items-baseline justify-between gap-4 px-4 py-2.5 transition hover:bg-surface-2"
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      <span className="font-numeric text-sm font-semibold text-ink">
                        {instrument.symbol}
                      </span>
                      <span className="truncate text-xs text-ink-muted">
                        {instrument.name ?? DASH}
                      </span>
                    </span>
                    <DeltaValue
                      value={dayChange === null ? null : dayChange * 100}
                      className="text-xs"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
