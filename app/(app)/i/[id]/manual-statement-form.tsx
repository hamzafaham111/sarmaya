"use client";

import { useMemo, useState, useTransition } from "react";

import { buttonClass } from "@/components/base/button-styles";
import { Spinner } from "@/components/base/submit-button";
import type { StatementYearData } from "@/lib/analysis/ratios";
import {
  LINE_ITEM_VOCABULARY,
  STATEMENT_KINDS,
  type ManualStatementRow,
  type StatementKind,
} from "@/lib/analysis/statements";
import { formatMoney, type Currency } from "@/lib/format";

import { clearManualStatement, saveManualStatement } from "./actions";

const KIND_LABELS: Record<StatementKind, string> = {
  income: "Income",
  balance: "Balance",
  cashflow: "Cash flow",
};

/** Accepts "12,50,000" / "1250000" / "-30" / "" — returns null for blank. */
function parseFigure(raw: string): number | null | "invalid" {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : "invalid";
}

export function ManualStatementForm({
  instrumentId,
  fetchedYears,
  manualRows,
  currency,
}: {
  instrumentId: string;
  /** Pre-merge provider data — shown as the placeholder behind each input. */
  fetchedYears: StatementYearData[];
  manualRows: ManualStatementRow[];
  currency: Currency;
}) {
  const defaultYear =
    fetchedYears.length > 0
      ? fetchedYears[fetchedYears.length - 1].fiscalYear
      : new Date().getFullYear() - 1;

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(String(defaultYear));
  const [kind, setKind] = useState<StatementKind>("income");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const fiscalYear = Number(year);
  const yearIsValid =
    Number.isInteger(fiscalYear) && fiscalYear >= 1900 && fiscalYear <= 2200;

  // Your saved figures for the selected year+statement.
  const mine = useMemo(() => {
    const row = manualRows.find(
      (r) => r.fiscalYear === fiscalYear && r.statement === kind,
    );
    return (row?.data ?? {}) as Record<string, number | null>;
  }, [manualRows, fiscalYear, kind]);

  // The provider's figures for the same slot — placeholders, never values.
  const fetched = useMemo(() => {
    const y = fetchedYears.find((y) => y.fiscalYear === fiscalYear);
    return (y?.[kind] ?? {}) as Record<string, number | null>;
  }, [fetchedYears, fiscalYear, kind]);

  // Untouched fields fall back to what you already saved.
  function fieldValue(key: string): string {
    if (key in edits) return edits[key];
    const own = mine[key];
    return typeof own === "number" ? String(own) : "";
  }

  function reset() {
    setEdits({});
    setTouched(false);
    setError(null);
    setSaved(false);
  }

  function submit() {
    if (!yearIsValid) {
      setError("Fiscal year must be between 1900 and 2200.");
      return;
    }
    const data: Record<string, number | null> = {};
    for (const item of LINE_ITEM_VOCABULARY[kind]) {
      const parsed = parseFigure(fieldValue(item.key));
      if (parsed === "invalid") {
        setError(`${item.label} is not a number.`);
        return;
      }
      data[item.key] = parsed;
    }
    setError(null);
    startTransition(async () => {
      const result = await saveManualStatement({
        instrumentId,
        fiscalYear,
        statement: kind,
        data,
      });
      if (!result.ok) {
        setError("Could not save those figures.");
        return;
      }
      setEdits({});
      setTouched(false);
      setSaved(true);
    });
  }

  function clearMine() {
    startTransition(async () => {
      await clearManualStatement({ instrumentId, fiscalYear, statement: kind });
      reset();
    });
  }

  if (!open) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pressable rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold-soft"
        >
          + Add figures by hand
        </button>
      </div>
    );
  }

  return (
    <div className="bg-grad-surface mt-3 rounded-xl border border-gold/40 p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-gold">Your own figures</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="text-xs text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <p className="mb-3 text-xs text-ink-muted">
        Stored against your account only, and overlaid on whatever the source
        provided. Leave a field blank to keep the fetched figure. Type full
        units in {currency} — 12500000, not 1.25Cr.
      </p>

      <div className="mb-3 flex flex-wrap items-end gap-4">
        <label className="text-xs text-ink-muted">
          <span className="mb-1 block">Fiscal year</span>
          <input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              reset();
            }}
            className="font-numeric w-24 rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink tabular-nums focus:border-brand focus:outline-none"
          />
        </label>
        <div className="text-xs text-ink-muted">
          <span className="mb-1 block">Statement</span>
          <div className="flex gap-1">
            {STATEMENT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  reset();
                }}
                className={`pressable rounded-lg px-2.5 py-1 text-xs ${
                  kind === k
                    ? "bg-gold-soft font-medium text-gold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {KIND_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINE_ITEM_VOCABULARY[kind].map((item) => {
          const provider = fetched[item.key];
          return (
            <label key={item.key} className="text-xs text-ink-muted">
              <span className="mb-1 block">{item.label}</span>
              <input
                type="text"
                inputMode="decimal"
                value={fieldValue(item.key)}
                onChange={(e) => {
                  setEdits((prev) => ({ ...prev, [item.key]: e.target.value }));
                  setTouched(true);
                  setSaved(false);
                }}
                placeholder={
                  typeof provider === "number"
                    ? `${provider} (fetched)`
                    : "not provided"
                }
                className="font-numeric w-full rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink tabular-nums focus:border-brand focus:outline-none"
              />
              {typeof provider === "number" ? (
                <span className="mt-0.5 block text-[12px] text-ink-muted">
                  source: {formatMoney(provider, currency, "compact")}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-xs text-neg">{error}</p> : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !yearIsValid}
          className={buttonClass("gold", "sm")}
        >
          {pending ? <Spinner /> : null}
          {pending ? "Saving…" : saved && !touched ? "Saved" : "Save figures"}
        </button>
        {Object.keys(mine).length > 0 ? (
          <button
            type="button"
            onClick={clearMine}
            disabled={pending}
            className="text-xs text-neg underline underline-offset-4 disabled:opacity-50"
          >
            Remove my figures for FY{year} {KIND_LABELS[kind].toLowerCase()}
          </button>
        ) : null}
      </div>
    </div>
  );
}
