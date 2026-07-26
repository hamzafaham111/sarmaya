import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/base/empty-state";
import { listAllEntries } from "@/lib/db/queries/journal";
import { createClient } from "@/lib/supabase/server";

const KIND_TONE: Record<string, string> = {
  buy: "bg-brand-soft text-pos",
  sip: "bg-brand-soft text-pos",
  sell: "bg-warn-soft text-neg",
  note: "bg-surface-2 text-ink-muted",
};

// The global decision journal: every buy/sell/SIP/note, newest first.
export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const items = await listAllEntries(user.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display mb-1 text-2xl font-medium text-ink">
        Journal
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        Every decision you&apos;ve recorded, across all instruments — newest
        first.
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing recorded yet"
          message="Record buys, sells and SIPs — each with a mandatory why — from any instrument page."
        />
      ) : (
        <ul className="space-y-2">
          {items.map(({ entry, symbol, instrumentId }) => (
            <li
              key={entry.id}
              className="rounded-md border border-line bg-surface p-3 text-sm"
            >
              <div className="mb-1 flex items-center gap-2.5">
                <Link
                  href={`/i/${instrumentId}`}
                  className="font-numeric font-semibold text-ink hover:text-brand"
                >
                  {symbol}
                </Link>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[11px] ${KIND_TONE[entry.kind] ?? ""}`}
                >
                  {entry.kind}
                </span>
                <span className="font-numeric text-xs text-ink-muted tabular-nums">
                  {entry.tradeDate}
                </span>
                {entry.quantity !== null && entry.price !== null ? (
                  <span className="font-numeric text-xs text-ink tabular-nums">
                    {entry.quantity} @ {entry.price}
                  </span>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap text-ink-muted">
                {entry.reasoning}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
