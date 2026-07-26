"use client";

import { Fragment, useMemo, useState, useTransition } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StatementYearData } from "@/lib/analysis/ratios";
import type {
  ManualStatementRow,
  MergedStatementYear,
} from "@/lib/analysis/statements";
import { formatMoney, formatPercent, type Currency, DASH } from "@/lib/format";

import { createAnnotation, removeAnnotation } from "./actions";
import { ManualStatementForm } from "./manual-statement-form";

// Statements as years-across-columns tables. Every cell is annotatable:
// click → note form; annotated cells carry a brand marker (the user's own
// hand wears the accent — DESIGN.md).

const LINE_ITEMS: Record<
  "income" | "balance" | "cashflow",
  { key: string; label: string; percentOfRevenue?: boolean }[]
> = {
  income: [
    { key: "revenue", label: "Revenue" },
    { key: "gross_profit", label: "Gross profit" },
    { key: "operating_income", label: "Operating income" },
    { key: "net_income", label: "Net income" },
    { key: "eps", label: "EPS" },
  ],
  balance: [
    { key: "total_assets", label: "Total assets" },
    { key: "total_equity", label: "Total equity" },
    { key: "total_debt", label: "Total debt" },
    { key: "cash", label: "Cash" },
    { key: "shares_outstanding", label: "Shares outstanding" },
  ],
  cashflow: [
    { key: "cfo", label: "Operating cash flow" },
    { key: "capex", label: "Capex" },
    { key: "fcf", label: "Free cash flow" },
    { key: "dividends_paid", label: "Dividends paid" },
  ],
};

interface AnnotationLite {
  id: string;
  target: string;
  body: string;
}

export function StatementsSection({
  instrumentId,
  years,
  fetchedYears,
  manualRows,
  currency,
  annotations,
  statementsUnsupported = false,
  handKept = false,
}: {
  instrumentId: string;
  /** Provider data with the user's own figures already overlaid. */
  years: MergedStatementYear[];
  /** Pre-merge provider data — placeholders in the manual entry form. */
  fetchedYears: StatementYearData[];
  manualRows: ManualStatementRow[];
  currency: Currency;
  annotations: AnnotationLite[];
  /** true for markets whose source can't provide statements (e.g. PSX) */
  statementsUnsupported?: boolean;
  /** true when no provider covers this instrument at all */
  handKept?: boolean;
}) {
  const [showGrowth, setShowGrowth] = useState(false);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byTarget = useMemo(() => {
    const m = new Map<string, AnnotationLite[]>();
    for (const a of annotations) {
      m.set(a.target, [...(m.get(a.target) ?? []), a]);
    }
    return m;
  }, [annotations]);

  if (years.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="font-display mb-2 text-lg text-ink">Statements</h2>
        <p className="rounded-md border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {handKept
            ? "Nothing here yet — this one is hand-kept. Type the years you have from the annual report; ratios, trends and the valuation models all compute from whatever you enter."
            : statementsUnsupported
              ? "Statements unavailable for this market — the source provides prices only. You can type the years you have from the annual report; ratios and trends compute from whatever you enter."
              : "Statements unavailable yet — the weekly job brings every year the source provides. You can also type years in by hand."}
        </p>
        <ManualStatementForm
          instrumentId={instrumentId}
          fetchedYears={fetchedYears}
          manualRows={manualRows}
          currency={currency}
        />
      </section>
    );
  }

  const firstYear = years[0].fiscalYear;

  function cellValue(
    year: StatementYearData,
    kind: keyof typeof LINE_ITEMS,
    key: string,
  ): number | null {
    const rec = year[kind] as Record<string, number | null> | undefined;
    const v = rec?.[key];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }

  function growth(
    kind: keyof typeof LINE_ITEMS,
    key: string,
    idx: number,
  ): number | null {
    if (idx === 0) return null;
    const cur = cellValue(years[idx], kind, key);
    const prev = cellValue(years[idx - 1], kind, key);
    if (cur === null || prev === null || prev === 0) return null;
    return (cur - prev) / Math.abs(prev);
  }

  function submitNote(target: string) {
    const body = noteDraft.trim();
    if (!body) return;
    startTransition(async () => {
      const result = await createAnnotation({ instrumentId, target, body });
      // Never close over a rejected save — a silently dropped note is worse
      // than an error, because you think you wrote it down.
      if (!result?.ok) {
        setNoteError("Could not save that note. Try again.");
        return;
      }
      setNoteError(null);
      setNoteDraft("");
      setActiveCell(null);
    });
  }

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ink">Statements</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={showGrowth}
              onChange={(e) => setShowGrowth(e.target.checked)}
              className="accent-brand"
            />
            YoY growth
          </label>
          <span className="text-xs text-ink-muted">data since {firstYear}</span>
        </div>
      </div>
      <p className="mt-1 mb-3 text-xs text-ink-muted">
        Click any figure to attach a note to it. A dotted underline marks a
        figure you entered yourself.
      </p>

      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="cashflow">Cash flow</TabsTrigger>
        </TabsList>

        {(Object.keys(LINE_ITEMS) as (keyof typeof LINE_ITEMS)[]).map(
          (kind) => (
            <TabsContent key={kind} value={kind}>
              <div className="overflow-x-auto rounded-md border border-line bg-surface">
                <table className="w-full min-w-max text-[13px] leading-[1.4]">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="sticky left-0 bg-surface px-3 py-1.5 text-left font-medium text-ink-muted" />
                      {years.map((y) => (
                        <th
                          key={y.fiscalYear}
                          className="px-3 py-1.5 text-right font-medium text-ink-muted"
                        >
                          FY{y.fiscalYear}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LINE_ITEMS[kind].map((item) => (
                      <Fragment key={item.key}>
                        <tr className="border-b border-line last:border-0 hover:bg-surface-2">
                          <td className="sticky left-0 bg-surface px-3 py-1.5 text-ink-muted">
                            {item.label}
                          </td>
                          {years.map((y) => {
                            const target = `${kind}:${item.key}:${y.fiscalYear}`;
                            const value = cellValue(y, kind, item.key);
                            const notes = byTarget.get(target) ?? [];
                            const isMine = y.manualKeys.includes(
                              `${kind}:${item.key}`,
                            );
                            const display =
                              item.key === "eps"
                                ? value === null
                                  ? DASH
                                  : value.toFixed(2)
                                : formatMoney(value, currency, "compact");
                            return (
                              <td
                                key={target}
                                className="px-1 py-0.5 text-right"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCell(
                                      activeCell === target ? null : target,
                                    );
                                    setNoteDraft("");
                                  }}
                                  title={[
                                    isMine ? "Your figure" : null,
                                    notes.length
                                      ? notes.map((n) => n.body).join("\n")
                                      : "Add a note",
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                  className={`font-numeric w-full rounded-sm px-2 py-1 text-right tabular-nums transition hover:bg-surface-2 ${
                                    isMine
                                      ? "underline decoration-brand decoration-dotted underline-offset-4"
                                      : ""
                                  } ${
                                    notes.length
                                      ? "text-brand"
                                      : value === null
                                        ? "text-ink-muted"
                                        : "text-ink"
                                  }`}
                                >
                                  {display}
                                  {notes.length ? (
                                    <span className="ml-1 align-super text-[9px]">
                                      ●
                                    </span>
                                  ) : null}
                                </button>
                                {activeCell === target ? (
                                  <div className="absolute z-20 mt-1 w-64 rounded-md border border-line bg-surface p-2 text-left shadow-lg">
                                    {notes.map((n) => (
                                      <div
                                        key={n.id}
                                        className="mb-1.5 flex items-start justify-between gap-2 rounded-sm bg-brand-soft px-2 py-1 text-xs text-ink"
                                      >
                                        <span className="whitespace-pre-wrap">
                                          {n.body}
                                        </span>
                                        <button
                                          type="button"
                                          className="text-neg"
                                          onClick={() =>
                                            startTransition(async () => {
                                              await removeAnnotation({
                                                instrumentId,
                                                annotationId: n.id,
                                              });
                                            })
                                          }
                                          aria-label="Delete note"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    <textarea
                                      value={noteDraft}
                                      onChange={(e) =>
                                        setNoteDraft(e.target.value)
                                      }
                                      rows={2}
                                      placeholder={`Note on ${item.label} FY${y.fiscalYear}…`}
                                      className="w-full rounded-sm border border-line bg-background p-1.5 text-xs text-ink focus:border-brand focus:outline-none"
                                    />
                                    {noteError ? (
                                      <p className="mt-1 text-[11px] text-neg">
                                        {noteError}
                                      </p>
                                    ) : null}
                                    <div className="mt-1 flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setActiveCell(null)}
                                        className="text-xs text-ink-muted"
                                      >
                                        Close
                                      </button>
                                      <button
                                        type="button"
                                        disabled={pending || !noteDraft.trim()}
                                        onClick={() => submitNote(target)}
                                        className="rounded-sm bg-brand px-2 py-0.5 text-xs text-on-brand disabled:opacity-50"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                        {showGrowth ? (
                          <tr
                            key={`${item.key}-growth`}
                            className="border-b border-line text-[11px] last:border-0"
                          >
                            <td className="sticky left-0 bg-surface px-3 py-0.5 text-ink-muted">
                              Δ YoY
                            </td>
                            {years.map((y, idx) => {
                              const g = growth(kind, item.key, idx);
                              return (
                                <td
                                  key={`${item.key}-g-${y.fiscalYear}`}
                                  className={`font-numeric px-3 py-0.5 text-right tabular-nums ${
                                    g === null
                                      ? "text-ink-muted"
                                      : g >= 0
                                        ? "text-pos"
                                        : "text-neg"
                                  }`}
                                >
                                  {g === null
                                    ? DASH
                                    : `${g >= 0 ? "+" : ""}${formatPercent(g)}`}
                                </td>
                              );
                            })}
                          </tr>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ),
        )}
      </Tabs>

      <ManualStatementForm
        instrumentId={instrumentId}
        fetchedYears={fetchedYears}
        manualRows={manualRows}
        currency={currency}
      />
    </section>
  );
}
