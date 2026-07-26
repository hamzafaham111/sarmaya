"use client";

import { useState, useTransition } from "react";

import { formatMoney, type Currency } from "@/lib/format";

import { saveManualPrice } from "./actions";

// A hand-created instrument has no provider, so its price is yours to keep
// current. Writes the same shape the daily job writes — the chart, day
// change, valuation band and portfolio all read it normally.
export function ManualPriceForm({
  instrumentId,
  currency,
  currentPrice,
  asOf,
}: {
  instrumentId: string;
  currency: Currency;
  currentPrice: number | null;
  asOf: string | null;
}) {
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    const parsed = Number(price.replace(/[,\s]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a price above zero.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveManualPrice({
        instrumentId,
        price: parsed,
        asOf: date || undefined,
      });
      if (!result.ok) {
        setError("Could not save that price.");
        return;
      }
      setPrice("");
      setSaved(true);
    });
  }

  return (
    <section className="mt-6 rounded-md border border-brand/40 bg-surface p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="font-display text-sm text-ink">
            Hand-kept instrument
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            No provider covers this one — every figure is yours.{" "}
            {currentPrice === null
              ? "No price recorded yet."
              : `Last price ${formatMoney(currentPrice, currency)}${asOf ? ` on ${asOf}` : ""}.`}
          </p>
        </div>
        <label className="text-xs text-ink-muted">
          <span className="mb-1 block">Price</span>
          <input
            type="text"
            inputMode="decimal"
            name="manualPrice"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setSaved(false);
            }}
            placeholder={currentPrice === null ? "0.00" : String(currentPrice)}
            className="font-numeric w-28 rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink tabular-nums focus:border-brand focus:outline-none"
          />
        </label>
        <label className="text-xs text-ink-muted">
          <span className="mb-1 block">As of</span>
          <input
            type="date"
            name="manualPriceDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="font-numeric rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink tabular-nums focus:border-brand focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !price.trim()}
          className="rounded-sm bg-brand px-3 py-1 text-xs text-on-brand disabled:opacity-50"
        >
          {saved ? "Price saved" : "Save price"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-neg">{error}</p> : null}
    </section>
  );
}
