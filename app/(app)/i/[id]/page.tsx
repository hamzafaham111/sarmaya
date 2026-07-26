import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { DeltaValue } from "@/components/base/delta-value";
import { StaleBadge } from "@/components/base/stale-badge";
import { StatValue } from "@/components/base/stat-value";
import { groupStatementYears } from "@/lib/analysis/ratios";
import { getInstrumentPage } from "@/lib/db/queries/instruments";
import { returnsSummary } from "@/lib/analysis/returns";
import {
  getAnnotations,
  getDayChange,
  getNavSeries,
  getPriceSeries,
  getStatementRows,
} from "@/lib/db/queries/study";
import { listInstrumentEntries } from "@/lib/db/queries/journal";
import { listTheses } from "@/lib/db/queries/theses";
import { getValuations } from "@/lib/db/queries/valuations";
import { buildSeeds } from "@/lib/valuation/seed";
import { formatMoney, formatPercent, type Currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { removeInstrument } from "../../instruments/actions";
import { JournalSection } from "./journal-section";
import { ThesisSection } from "./thesis-section";
import { NotesEditor } from "./notes-editor";
import { SeriesChart } from "./series-chart";
import { RatiosSection } from "./ratios-section";
import { StatementsSection } from "./statements-section";
import { TrendsSection } from "./trends-section";
import { ValuationSection } from "./valuation-section";

function isStale(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > 48 * 60 * 60 * 1000;
}

// The study environment (Phase 3). Layout is kind-aware: stocks get the full
// treatment; indices price-only; funds get their own layout in Phase 5.
export default async function InstrumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ journalError?: string; thesisError?: string }>;
}) {
  const { id } = await params;
  const { journalError, thesisError } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const page = await getInstrumentPage(user.id, id);
  if (!page) notFound();

  const { instrument, userInstrument, latestSnapshot } = page;
  const currency = instrument.currency as Currency;
  const data = latestSnapshot?.data as {
    price?: number | null;
    nav?: number | null;
    nav_date?: string | null;
    fund_house?: string | null;
    scheme_category?: string | null;
  } | null;
  const isStock = instrument.kind === "stock";
  const isFund = instrument.kind === "fund";
  const headlineValue = isFund ? (data?.nav ?? null) : (data?.price ?? null);

  const [
    statementRows,
    annotations,
    dayChange,
    savedValuations,
    series,
    journal,
  ] = await Promise.all([
    isStock ? getStatementRows(instrument.id) : Promise.resolve([]),
    isStock ? getAnnotations(user.id, instrument.id) : Promise.resolve([]),
    getDayChange(instrument.id),
    isStock ? getValuations(user.id, instrument.id) : Promise.resolve([]),
    isFund
      ? getNavSeries(instrument.id)
      : getPriceSeries(instrument.id, 365 * 5),
    listInstrumentEntries(user.id, instrument.id),
  ]);
  const thesesRows = isStock ? await listTheses(user.id, instrument.id) : [];

  const seriesPoints = series
    .map((p) => ({ date: p.date, value: Number(p.close) }))
    .filter((p) => Number.isFinite(p.value) && p.value > 0);
  const summary = returnsSummary(seriesPoints);

  const years = groupStatementYears(
    statementRows.map((r) => ({
      fiscalYear: r.fiscalYear,
      statement: r.statement,
      data: r.data as Record<string, number | null>,
    })),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-medium text-ink">
          {instrument.name ?? instrument.symbol}
        </h1>
        <span className="font-numeric text-sm text-ink-muted">
          {instrument.symbol} · {instrument.market}
        </span>
        <span className="font-numeric text-xl text-ink tabular-nums">
          {formatMoney(headlineValue, currency)}
        </span>
        <DeltaValue
          value={dayChange === null ? null : dayChange * 100}
          className="text-sm"
        />
        {isStale(latestSnapshot?.fetchedAt ?? null) ? (
          <StaleBadge asOf={latestSnapshot?.asOf ?? null} />
        ) : null}
        {instrument.status !== "active" ? (
          <span className="rounded-sm bg-warn-soft px-1.5 py-0.5 text-xs text-warn">
            {instrument.status === "fetch_failing"
              ? "data updates failing"
              : instrument.status}
          </span>
        ) : null}
      </header>

      {isStock ? (
        <>
          <ValuationSection
            instrumentId={instrument.id}
            seeds={buildSeeds(
              years,
              (latestSnapshot?.data as Record<string, number | null>) ?? null,
            )}
            saved={Object.fromEntries(
              savedValuations.map((v) => [
                v.model,
                v.assumptions as Record<string, unknown>,
              ]),
            )}
            price={data?.price ?? null}
            currency={currency}
          />
          <StatementsSection
            instrumentId={instrument.id}
            years={years}
            currency={currency}
            statementsUnsupported={instrument.market === "PK"}
            annotations={annotations.map((a) => ({
              id: a.id,
              target: a.target,
              body: a.body,
            }))}
          />
          <ThesisSection
            instrumentId={instrument.id}
            theses={thesesRows}
            metrics={Object.fromEntries(
              Object.entries(
                (latestSnapshot?.data as Record<string, unknown>) ?? {},
              ).filter(([, v]) => typeof v === "number" || v === null) as [
                string,
                number | null,
              ][],
            )}
            hasEstimate={savedValuations.length > 0}
            error={thesisError}
          />
          <TrendsSection years={years} currency={currency} />
          <RatiosSection years={years} />
        </>
      ) : (
        <section className="mt-8 space-y-6">
          {isFund && (data?.fund_house || data?.scheme_category) ? (
            <p className="text-sm text-ink-muted">
              {data?.fund_house ?? ""}
              {data?.fund_house && data?.scheme_category ? " · " : ""}
              {data?.scheme_category ?? ""}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatValue
              label="1M return"
              value={summary.r1m === null ? null : formatPercent(summary.r1m)}
            />
            <StatValue
              label="1Y return"
              value={summary.r1y === null ? null : formatPercent(summary.r1y)}
            />
            <StatValue
              label="3Y CAGR"
              value={
                summary.cagr3y === null ? null : formatPercent(summary.cagr3y)
              }
            />
            <StatValue
              label="5Y CAGR"
              value={
                summary.cagr5y === null ? null : formatPercent(summary.cagr5y)
              }
            />
          </div>
          <SeriesChart
            series={seriesPoints}
            currency={currency}
            label={isFund ? "NAV" : "Index level"}
          />
        </section>
      )}

      {instrument.kind !== "index" ? (
        <JournalSection
          instrumentId={instrument.id}
          entries={journal}
          isFund={isFund}
          currency={currency}
          today={new Date().toISOString().slice(0, 10)}
          error={journalError}
        />
      ) : null}

      <NotesEditor
        instrumentId={instrument.id}
        initialNotes={userInstrument.notesMd}
      />

      <form
        action={removeInstrument.bind(null, instrument.id)}
        className="mt-12"
      >
        <button
          type="submit"
          className="text-xs text-neg underline underline-offset-4"
        >
          Stop tracking {instrument.symbol}
        </button>
      </form>
    </main>
  );
}
