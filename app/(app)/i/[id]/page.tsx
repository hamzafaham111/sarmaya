import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { StaleBadge } from "@/components/base/stale-badge";
import { getInstrumentPage } from "@/lib/db/queries/instruments";
import { formatMoney, type Currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { removeInstrument } from "../../instruments/actions";

function isStale(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > 48 * 60 * 60 * 1000;
}

// Instrument page shell (Phase 2). The study sections — statements, trends,
// ratios, annotations, valuation — land in Phases 3–4.
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

  const { instrument, latestSnapshot } = page;
  const data = latestSnapshot?.data as { price?: number | null } | null;
  const currency = instrument.currency as Currency;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
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

      <div className="mt-8 rounded-md border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
        Full data — statements, trends, ratios — arrives with tonight&apos;s
        update; the study sections land in Phases 3–4.
      </div>

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
