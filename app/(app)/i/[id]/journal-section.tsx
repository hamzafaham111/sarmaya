import { computeHoldings } from "@/lib/analysis/holdings";
import type { JournalEntry } from "@/lib/db/queries/journal";
import { formatMoney, type Currency } from "@/lib/format";

import { createJournalEntry, deleteJournalEntry } from "./journal-actions";

const KIND_TONE: Record<string, string> = {
  buy: "bg-brand-soft text-pos",
  sip: "bg-brand-soft text-pos",
  sell: "bg-warn-soft text-neg",
  note: "bg-surface-2 text-ink-muted",
};

export function JournalSection({
  instrumentId,
  entries,
  isFund,
  currency,
  today,
  error,
}: {
  instrumentId: string;
  entries: JournalEntry[];
  isFund: boolean;
  currency: Currency;
  today: string;
  error?: string;
}) {
  const holdings = computeHoldings(
    entries.map((e) => ({
      kind: e.kind,
      tradeDate: e.tradeDate,
      price: e.price,
      quantity: e.quantity,
    })),
  );
  const held = holdings.netQuantity !== "0";

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg text-ink">Journal</h2>
      <p className="mt-1 mb-3 text-xs text-ink-muted">
        Every decision with its why — the why is mandatory.
      </p>
      {held ? (
        <p className="font-numeric mb-3 inline-flex rounded-sm bg-surface-2 px-2 py-1 text-xs text-ink tabular-nums">
          Holding {holdings.netQuantity} {isFund ? "units" : "shares"}
          {holdings.averageCost !== null
            ? ` · avg cost ${formatMoney(Number(holdings.averageCost), currency)}`
            : ""}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 text-sm text-neg" role="alert">
          {error === "rejected"
            ? "Rejected — the reasoning is the point; at least 10 characters."
            : "Invalid entry: trades need date, price/NAV, quantity/units and ≥10 characters of reasoning."}
        </p>
      ) : null}

      <details
        className="mb-4 rounded-md border border-line bg-surface px-4 py-3"
        open={entries.length === 0}
      >
        <summary className="cursor-pointer text-sm font-medium text-ink-muted transition hover:text-ink">
          Record a decision
        </summary>
        <form
          action={createJournalEntry.bind(null, instrumentId)}
          className="mt-3 space-y-2"
        >
          <div className="flex flex-wrap gap-2 text-sm">
            <select
              name="kind"
              defaultValue={isFund ? "sip" : "buy"}
              className="rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none"
            >
              <option value="buy">Buy</option>
              {isFund ? <option value="sip">SIP</option> : null}
              <option value="sell">Sell</option>
              <option value="note">Note</option>
            </select>
            <input
              name="tradeDate"
              type="date"
              defaultValue={today}
              required
              className="rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none"
            />
            <input
              name="price"
              inputMode="decimal"
              placeholder={isFund ? "NAV" : "price"}
              className="font-numeric w-24 rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
            <input
              name="quantity"
              inputMode="decimal"
              placeholder={isFund ? "units" : "quantity"}
              className="font-numeric w-24 rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
          </div>
          <textarea
            name="reasoning"
            required
            minLength={10}
            rows={2}
            placeholder="Why? (at least 10 characters — future you will read this)"
            className="w-full rounded-sm border border-line bg-background p-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm bg-brand px-3 py-1 text-sm text-on-brand"
          >
            Record
          </button>
        </form>
      </details>

      <ul className="space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-md border border-line bg-surface p-3 text-sm"
          >
            <div className="mb-1 flex items-center gap-2.5">
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
              <form
                action={deleteJournalEntry.bind(null, instrumentId, entry.id)}
                className="ml-auto"
              >
                <button
                  type="submit"
                  className="text-xs text-neg underline underline-offset-4"
                >
                  Delete
                </button>
              </form>
            </div>
            <p className="whitespace-pre-wrap text-ink-muted">
              {entry.reasoning}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
