import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/base/empty-state";
import { StatValue } from "@/components/base/stat-value";
import { SubmitButton } from "@/components/base/submit-button";
import {
  attentionItems,
  bucketDayChange,
  dayChangeFromSeries,
  latestClose,
  rankMovers,
  type MoverInput,
} from "@/lib/analysis/overview";
import { buildPortfolio } from "@/lib/analysis/portfolio";
import { listUserInstruments } from "@/lib/db/queries/instruments";
import { listAllEntries } from "@/lib/db/queries/journal";
import { getPortfolioInputs } from "@/lib/db/queries/portfolio";
import { getSeriesBatch } from "@/lib/db/queries/study";
import { listUserTheses } from "@/lib/db/queries/theses";
import { formatPercent } from "@/lib/format";
import { getCurrentUser } from "@/lib/supabase/current-user";

import { createExampleSet } from "./instruments/actions";
import {
  AttentionPanel,
  MoversList,
  PortfolioCards,
  RecentDecisions,
} from "./overview-sections";

const MOVERS_SHOWN = 6;
const DECISIONS_SHOWN = 5;
const SPARK_DAYS = 90;

// The front page answers three questions, in this order: what is my money
// doing, does anything need me today, and what moved. Everything on it is
// derived from data we already hold — nothing decorative, no advice.
export default async function OverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const [tracked, portfolioInputs, theses, journal] = await Promise.all([
    listUserInstruments(user.id),
    getPortfolioInputs(user.id),
    listUserTheses(user.id),
    listAllEntries(user.id),
  ]);

  // One batched query for every sparkline and day change on the page — the
  // pooler gives us four connections, so no per-instrument round trips.
  const series = await getSeriesBatch(
    tracked.map((t) => t.instrument.id),
    SPARK_DAYS,
  );

  const buckets = buildPortfolio(portfolioInputs);
  const now = new Date();

  const movers: MoverInput[] = tracked.map(({ instrument }) => {
    const points = series.get(instrument.id);
    return {
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      name: instrument.name,
      kind: instrument.kind,
      currency: instrument.currency,
      price: latestClose(points),
      dayChange: dayChangeFromSeries(points),
      series: (points ?? []).map((p) => {
        const n = Number(p.close);
        return Number.isFinite(n) ? n : null;
      }),
    };
  });
  const dayChangeById = new Map(
    movers.map((m) => [m.instrumentId, m.dayChange]),
  );

  const dayChanges: Record<string, number | null> = {};
  for (const bucket of buckets) {
    dayChanges[bucket.currency] = bucketDayChange(
      bucket.rows.map((row) => ({
        marketValue: row.marketValue,
        dayChange: dayChangeById.get(row.instrumentId) ?? null,
      })),
    );
  }

  const attention = attentionItems({
    theses,
    instruments: tracked.map(({ instrument, latestSnapshot }) => ({
      id: instrument.id,
      symbol: instrument.symbol,
      fetchedAt: latestSnapshot?.fetchedAt ?? null,
      status: instrument.status,
      isManual: instrument.isManual,
    })),
    unpricedHoldings: buckets.reduce((sum, b) => sum + b.excludedCount, 0),
    now,
  });

  const breachedTheses = theses.filter((t) => t.status === "breached").length;
  const held = buckets.reduce((sum, b) => sum + b.rows.length, 0);

  if (tracked.length === 0) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-6">
        <h1 className="font-display text-grad-brand mb-6 text-2xl font-semibold">
          Overview
        </h1>
        <EmptyState
          title="Welcome to Sarmaya"
          message="Track your first instrument from the Instruments page — or start with a pre-filled example set to see how the terminal works."
          action={
            <form action={createExampleSet}>
              <SubmitButton pendingLabel="Setting up…">
                Create example set
              </SubmitButton>
            </form>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-6">
      <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-grad-brand text-2xl font-semibold">
          Overview
        </h1>
        <p className="font-numeric text-xs text-ink-muted tabular-nums">
          {now.toISOString().slice(0, 10)}
        </p>
      </header>

      {/* One line of context above the money. */}
      <section className="bg-grad-surface mb-5 grid grid-cols-2 gap-4 rounded-xl border border-line px-5 py-4 shadow-sm sm:grid-cols-4">
        <StatValue label="Tracked" value={String(tracked.length)} />
        <StatValue label="Held" value={held === 0 ? null : String(held)} />
        <StatValue
          label="Active theses"
          value={theses.length === 0 ? null : String(theses.length)}
        />
        <StatValue
          label="Breached"
          value={breachedTheses === 0 ? "none" : String(breachedTheses)}
        />
      </section>

      {buckets.length === 0 ? (
        <div className="mb-5 rounded-xl border border-dashed border-line bg-surface px-6 py-8 text-center">
          <p className="text-sm text-ink">Nothing held yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">
            Record a buy or a SIP from any instrument page — with the why — and
            your positions, cost and unrealised return appear here.
          </p>
          <Link
            href="/instruments"
            className="mt-3 inline-block text-xs text-brand underline underline-offset-4"
          >
            Go to instruments
          </Link>
        </div>
      ) : (
        <div className="mb-5">
          <PortfolioCards buckets={buckets} dayChanges={dayChanges} />
          {buckets.length > 1 ? (
            <p className="mt-2 text-[12px] text-ink-muted">
              Buckets are never added together — Sarmaya does not convert
              currencies.
            </p>
          ) : null}
        </div>
      )}

      {/* min-w-0 on the columns: a grid child's automatic minimum size is
          its content, which would push the page into a sideways scroll on a
          narrow screen. */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="min-w-0 space-y-5 lg:col-span-3">
          <MoversList movers={rankMovers(movers, MOVERS_SHOWN)} />
        </div>
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <AttentionPanel items={attention} />
          <RecentDecisions entries={journal.slice(0, DECISIONS_SHOWN)} />
        </div>
      </div>

      {buckets.length > 0 && buckets[0].weighted.pe !== null ? (
        <section className="mt-5 rounded-xl border border-line bg-surface px-5 py-3.5">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-sm text-ink">
              Your {buckets[0].currency} stocks as one business
            </h2>
            <Link
              href="/portfolio"
              className="text-[12px] text-ink-muted underline underline-offset-4 hover:text-brand"
            >
              full portfolio
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatValue
              label="Weighted P / E"
              value={buckets[0].weighted.pe.toFixed(2)}
            />
            <StatValue
              label="Weighted ROE"
              value={
                buckets[0].weighted.roe === null
                  ? null
                  : formatPercent(buckets[0].weighted.roe)
              }
            />
            <StatValue
              label="Weighted debt / equity"
              value={
                buckets[0].weighted.debtToEquity === null
                  ? null
                  : buckets[0].weighted.debtToEquity.toFixed(2)
              }
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
