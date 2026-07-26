import { describe, expect, it } from "vitest";

import { evaluate, type EngineThesis, type ThesisStatus } from "./engine";
import type { Rule } from "./rules";

const thesis = (
  rule: Rule | null,
  status: ThesisStatus = "intact",
  id = "t1",
): EngineThesis => ({ id, status, rule });

const rule = (metric: Rule["metric"], op: Rule["op"], value: number): Rule => ({
  metric,
  op,
  value,
});

const METRICS: Record<string, number | null> = {
  price: 100,
  pe: 23.1,
  debt_to_equity: 0.37,
  fcf_ttm: -5,
  price_vs_estimate_low_pct: 92,
  roe: null,
};

describe("evaluate — operator truth table incl. boundaries", () => {
  const cases: [Rule["metric"], Rule["op"], number, boolean][] = [
    ["price", "gt", 50, true],
    ["price", "gt", 150, false],
    ["price", "gt", 100, false], // equality does not trip gt
    ["price", "lt", 150, true],
    ["price", "lt", 50, false],
    ["price", "lt", 100, false], // equality does not trip lt
    ["pe", "gt", 20, true],
    ["fcf_ttm", "lt", 0, true], // negative observed compares fine
    ["price_vs_estimate_low_pct", "lt", 95, true], // the derived metric
    ["debt_to_equity", "gt", 0.37, false], // ratio boundary
  ];

  it.each(cases)("%s %s %d => fires %s", (metric, op, threshold, fires) => {
    const result = evaluate([thesis(rule(metric, op, threshold))], METRICS);
    expect(result.events.length).toBe(fires ? 1 : 0);
    if (fires) {
      expect(result.events[0]).toEqual({
        thesisId: "t1",
        metric,
        op,
        threshold,
        observed: METRICS[metric],
      });
      expect(result.statusChanges).toEqual([
        { thesisId: "t1", from: "intact", to: "breached" },
      ]);
    }
  });
});

describe("evaluate — state machine", () => {
  const r = rule("price", "lt", 150);

  it("intact + true => event + breached", () => {
    const result = evaluate([thesis(r, "intact")], METRICS);
    expect(result.events).toHaveLength(1);
  });

  it("breached + still true => SILENT (no daily re-email)", () => {
    const result = evaluate([thesis(r, "breached")], METRICS);
    expect(result.events).toHaveLength(0);
    expect(result.statusChanges).toHaveLength(0);
  });

  it("breached + false => silent recovery to intact", () => {
    const result = evaluate(
      [thesis(rule("price", "lt", 50), "breached")],
      METRICS,
    );
    expect(result.events).toHaveLength(0);
    expect(result.statusChanges).toEqual([
      { thesisId: "t1", from: "breached", to: "intact" },
    ]);
  });

  it("intact + false => nothing", () => {
    const result = evaluate(
      [thesis(rule("price", "lt", 50), "intact")],
      METRICS,
    );
    expect(result).toEqual({ events: [], statusChanges: [], unverifiable: [] });
  });

  it("full lifecycle fires exactly on the two crossings", () => {
    let status: ThesisStatus = "intact";
    const days = [
      { price: 40 }, // breach (lt 50)... wait use lt 150 with prices
    ];
    void days;
    const r2 = rule("price", "lt", 90);
    const observedByDay = [80, 80, 95, 70]; // breach, persist, recover, re-breach
    const fired: number[] = [];
    observedByDay.forEach((price, i) => {
      const result = evaluate([thesis(r2, status)], { price });
      if (result.events.length) fired.push(i);
      for (const c of result.statusChanges) status = c.to;
    });
    expect(fired).toEqual([0, 3]);
    expect(status).toBe("breached");
  });
});

describe("evaluate — unverifiable & exclusions", () => {
  it("null metric: no state change, no event, logged", () => {
    const result = evaluate([thesis(rule("roe", "gt", 0.15))], METRICS);
    expect(result.events).toHaveLength(0);
    expect(result.statusChanges).toHaveLength(0);
    expect(result.unverifiable).toEqual([{ thesisId: "t1", metric: "roe" }]);
  });

  it("metric absent from the map: unverifiable", () => {
    const result = evaluate([thesis(rule("pb", "gt", 3))], METRICS);
    expect(result.unverifiable).toEqual([{ thesisId: "t1", metric: "pb" }]);
  });

  it("no metrics at all (no snapshot today): unverifiable, state frozen", () => {
    const result = evaluate(
      [thesis(rule("price", "lt", 150), "breached")],
      null,
    );
    expect(result.statusChanges).toHaveLength(0);
    expect(result.unverifiable).toHaveLength(1);
  });

  it("statement-only theses are ignored", () => {
    expect(evaluate([thesis(null)], METRICS).unverifiable).toHaveLength(0);
  });

  it("archived theses are never evaluated", () => {
    const result = evaluate(
      [thesis(rule("price", "lt", 150), "archived")],
      METRICS,
    );
    expect(result).toEqual({ events: [], statusChanges: [], unverifiable: [] });
  });

  it("empty batch", () => {
    expect(evaluate([], METRICS)).toEqual({
      events: [],
      statusChanges: [],
      unverifiable: [],
    });
  });

  it("mixed batch routes each thesis independently", () => {
    const result = evaluate(
      [
        thesis(rule("price", "lt", 150), "intact", "fires"),
        thesis(rule("pe", "lt", 20), "breached", "recovers"),
        thesis(rule("debt_to_equity", "gt", 0.3), "breached", "silent"),
        thesis(rule("roe", "gt", 0.1), "intact", "unverifiable"),
        thesis(null, "intact", "plain"),
        thesis(rule("price", "gt", 1), "archived", "archived"),
      ],
      METRICS,
    );
    expect(result.events.map((e) => e.thesisId)).toEqual(["fires"]);
    expect(result.statusChanges).toEqual([
      { thesisId: "fires", from: "intact", to: "breached" },
      { thesisId: "recovers", from: "breached", to: "intact" },
    ]);
    expect(result.unverifiable).toEqual([
      { thesisId: "unverifiable", metric: "roe" },
    ]);
  });
});
