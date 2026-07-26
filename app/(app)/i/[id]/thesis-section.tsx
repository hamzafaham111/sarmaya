import {
  METRIC_LABELS,
  RULE_METRICS,
  RULE_OPS,
  type Rule,
} from "@/lib/alerts/rules";
import type { Thesis } from "@/lib/db/queries/theses";

import {
  archiveThesisAction,
  createThesisAction,
  deleteThesisAction,
  updateThesisAction,
} from "./thesis-actions";

const MAX_STATEMENTS = 5;

type DisplayStatus = "intact" | "breached" | "unverifiable-today" | "archived";

function displayStatus(
  thesis: Thesis,
  metrics: Record<string, number | null>,
): DisplayStatus | null {
  const rule = thesis.rule as Rule | null;
  if (thesis.status === "archived") return "archived";
  if (!rule) return null;
  if (thesis.status === "breached") return "breached";
  const observed = metrics[rule.metric];
  if (observed === null || observed === undefined) return "unverifiable-today";
  return "intact";
}

const BADGE: Record<DisplayStatus, string> = {
  intact: "bg-brand-soft text-pos",
  breached: "bg-warn-soft text-neg",
  "unverifiable-today": "bg-surface-2 text-ink-muted",
  archived: "bg-surface-2 text-ink-muted",
};

function ruleSummary(rule: Rule): string {
  const op = RULE_OPS.find((o) => o.value === rule.op)?.label ?? rule.op;
  return `breaks if ${METRIC_LABELS[rule.metric].toLowerCase()} ${op} ${rule.value}`;
}

function RuleFields({
  rule,
  hasEstimate,
}: {
  rule: Rule | null;
  hasEstimate: boolean;
}) {
  // The ONLY way to express a rule: metric dropdown + op dropdown + number.
  const metrics = RULE_METRICS.filter(
    (m) => m !== "price_vs_estimate_low_pct" || hasEstimate,
  );
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select
        name="rule_metric"
        defaultValue={rule?.metric ?? ""}
        className="rounded-sm border border-line bg-background px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
      >
        <option value="">No rule — statement only</option>
        {metrics.map((key) => (
          <option key={key} value={key}>
            {METRIC_LABELS[key]}
          </option>
        ))}
      </select>
      <select
        name="rule_op"
        defaultValue={rule?.op ?? "lt"}
        className="rounded-sm border border-line bg-background px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
      >
        {RULE_OPS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      <input
        name="rule_value"
        type="number"
        step="any"
        defaultValue={rule?.value ?? ""}
        placeholder="value"
        className="font-numeric w-24 rounded-sm border border-line bg-background px-2 py-1 text-xs text-ink tabular-nums placeholder:text-ink-muted focus:border-brand focus:outline-none"
      />
    </div>
  );
}

export function ThesisSection({
  instrumentId,
  theses,
  metrics,
  hasEstimate,
  error,
}: {
  instrumentId: string;
  theses: Thesis[];
  metrics: Record<string, number | null>;
  hasEstimate: boolean;
  error?: string;
}) {
  const active = theses.filter((t) => t.status !== "archived");

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg text-ink">Thesis</h2>
      <p className="mt-1 mb-3 text-xs text-ink-muted">
        3–5 short statements of why you own or watch this. Attach a rule to get
        an email the day it stops being true.
      </p>
      {error ? (
        <p className="mb-3 text-sm text-neg" role="alert">
          {error === "limit"
            ? `A thesis is at most ${MAX_STATEMENTS} active statements — sharpen, don't sprawl.`
            : "That statement or rule wasn't valid."}
        </p>
      ) : null}

      <ul className="space-y-2">
        {theses.map((thesis) => {
          const status = displayStatus(thesis, metrics);
          const rule = thesis.rule as Rule | null;
          return (
            <li
              key={thesis.id}
              className={`rounded-md border border-line bg-surface p-3 ${thesis.status === "archived" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm leading-snug text-ink">
                    {thesis.statement}
                  </p>
                  {rule ? (
                    <p className="font-numeric mt-1 text-xs text-ink-muted">
                      {ruleSummary(rule)}
                    </p>
                  ) : null}
                </div>
                {status ? (
                  <span
                    className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] ${BADGE[status]}`}
                  >
                    {status === "unverifiable-today"
                      ? "unverifiable today"
                      : status}
                  </span>
                ) : null}
              </div>

              {thesis.status !== "archived" ? (
                <div className="mt-2 flex items-center gap-4 border-t border-line pt-2">
                  <details className="flex-1">
                    <summary className="cursor-pointer text-xs text-ink-muted transition hover:text-ink">
                      Edit
                    </summary>
                    <form
                      action={updateThesisAction.bind(
                        null,
                        instrumentId,
                        thesis.id,
                      )}
                      className="mt-2 space-y-2"
                    >
                      <input
                        name="statement"
                        defaultValue={thesis.statement}
                        required
                        minLength={3}
                        maxLength={500}
                        className="w-full rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink focus:border-brand focus:outline-none"
                      />
                      <RuleFields rule={rule} hasEstimate={hasEstimate} />
                      <button
                        type="submit"
                        className="rounded-sm border border-line px-2 py-0.5 text-xs text-ink-muted hover:text-ink"
                      >
                        Save
                      </button>
                    </form>
                  </details>
                  <form
                    action={archiveThesisAction.bind(
                      null,
                      instrumentId,
                      thesis.id,
                    )}
                  >
                    <button
                      type="submit"
                      className="text-xs text-ink-muted underline underline-offset-4"
                    >
                      Archive
                    </button>
                  </form>
                  <form
                    action={deleteThesisAction.bind(
                      null,
                      instrumentId,
                      thesis.id,
                    )}
                  >
                    <button
                      type="submit"
                      className="text-xs text-neg underline underline-offset-4"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {active.length < MAX_STATEMENTS ? (
        <details
          className="mt-3 rounded-md border border-line bg-surface px-4 py-3"
          open={active.length === 0}
        >
          <summary className="cursor-pointer text-sm font-medium text-ink-muted transition hover:text-ink">
            Add a statement
          </summary>
          <form
            action={createThesisAction.bind(null, instrumentId)}
            className="mt-3 space-y-2"
          >
            <input
              name="statement"
              required
              minLength={3}
              maxLength={500}
              placeholder="e.g. Retail margins keep expanding as store mix shifts"
              className="w-full rounded-sm border border-line bg-background px-2 py-1 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
            <RuleFields rule={null} hasEstimate={hasEstimate} />
            <button
              type="submit"
              className="rounded-sm bg-brand px-3 py-1 text-sm text-on-brand"
            >
              Add statement
            </button>
          </form>
        </details>
      ) : null}
    </section>
  );
}
