import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { DeltaValue } from "@/components/base/delta-value";
import { StaleBadge } from "@/components/base/stale-badge";
import { groupStatementYears } from "@/lib/analysis/ratios";
import { getInstrumentPage } from "@/lib/db/queries/instruments";
import {
  getAnnotations,
  getDayChange,
  getStatementRows,
} from "@/lib/db/queries/study";
import { getValuations } from "@/lib/db/queries/valuations";
import { buildSeeds } from "@/lib/valuation/seed";
import { formatMoney, type Currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { removeInstrument } from "../../instruments/actions";
import { NotesEditor } from "./notes-editor";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const data = latestSnapshot?.data as { price?: number | null } | null;
  const isStock = instrument.kind === "stock";

  const [statementRows, annotations, dayChange, savedValuations] =
    await Promise.all([
      isStock ? getStatementRows(instrument.id) : Promise.resolve([]),
      isStock ? getAnnotations(user.id, instrument.id) : Promise.resolve([]),
      getDayChange(instrument.id),
      isStock ? getValuations(user.id, instrument.id) : Promise.resolve([]),
    ]);

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
          {formatMoney(data?.price ?? null, currency)}
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
            annotations={annotations.map((a) => ({
              id: a.id,
              target: a.target,
              body: a.body,
            }))}
          />
          <TrendsSection years={years} currency={currency} />
          <RatiosSection years={years} />
        </>
      ) : (
        <div className="mt-8 rounded-md border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
          Index pages get price history and returns in Phase 5.
        </div>
      )}

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
