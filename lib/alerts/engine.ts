import type { Rule } from "./rules";

// PURE function — no I/O, ever. All persistence, email and clock concerns
// belong to the caller (/api/cron). Semantics (CLAUDE.md, implemented
// exactly):
// - rule TRUE  => breached; an event fires ONLY on intact -> breached
// - stays silent while breached; FALSE again => back to intact (silent)
// - null metric (or no metrics at all) => unverifiable: no state change,
//   no event, logged in the result
// - archived theses are never evaluated
// The caller resolves the metric map per (user, instrument) — including the
// derived price_vs_estimate_low_pct — before calling in.

export type ThesisStatus = "intact" | "breached" | "archived";

export interface EngineThesis {
  id: string;
  status: ThesisStatus;
  rule: Rule | null;
}

export interface AlertEvent {
  thesisId: string;
  metric: Rule["metric"];
  op: Rule["op"];
  threshold: number;
  observed: number;
}

export interface StatusChange {
  thesisId: string;
  from: ThesisStatus;
  to: ThesisStatus;
}

export interface UnverifiableRule {
  thesisId: string;
  metric: Rule["metric"];
}

export interface EngineResult {
  events: AlertEvent[];
  statusChanges: StatusChange[];
  unverifiable: UnverifiableRule[];
}

function ruleIsTrue(rule: Rule, observed: number): boolean {
  // Strict comparisons: equality with the threshold does NOT trip the rule.
  return rule.op === "gt" ? observed > rule.value : observed < rule.value;
}

export function evaluate(
  theses: EngineThesis[],
  metrics: Record<string, number | null> | null,
): EngineResult {
  const result: EngineResult = {
    events: [],
    statusChanges: [],
    unverifiable: [],
  };

  for (const thesis of theses) {
    if (!thesis.rule) continue; // statement-only: nothing to check
    if (thesis.status === "archived") continue; // out of rotation

    const observed = metrics ? (metrics[thesis.rule.metric] ?? null) : null;
    if (observed === null || !Number.isFinite(observed)) {
      result.unverifiable.push({
        thesisId: thesis.id,
        metric: thesis.rule.metric,
      });
      continue;
    }

    const breachedNow = ruleIsTrue(thesis.rule, observed);

    if (breachedNow && thesis.status === "intact") {
      result.events.push({
        thesisId: thesis.id,
        metric: thesis.rule.metric,
        op: thesis.rule.op,
        threshold: thesis.rule.value,
        observed,
      });
      result.statusChanges.push({
        thesisId: thesis.id,
        from: "intact",
        to: "breached",
      });
    } else if (!breachedNow && thesis.status === "breached") {
      // Condition cleared: silent recovery re-arms the rule.
      result.statusChanges.push({
        thesisId: thesis.id,
        from: "breached",
        to: "intact",
      });
    }
    // breached && still true  -> silent (no daily re-email)
    // intact   && still false -> nothing to do
  }

  return result;
}
