import { describe, expect, it } from "vitest";

import {
  attentionItems,
  bucketDayChange,
  dayChangeFromSeries,
  latestClose,
  rankMovers,
  type MoverInput,
} from "./overview";

const NOW = new Date("2026-07-26T10:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

describe("dayChangeFromSeries", () => {
  it("is the last close against the previous one", () => {
    const change = dayChangeFromSeries([
      { date: "2026-07-24", close: "100" },
      { date: "2026-07-25", close: "110" },
    ]);
    expect(change).toBeCloseTo(0.1, 10);
  });

  it("uses only the final pair of a long series", () => {
    const change = dayChangeFromSeries([
      { date: "2026-07-20", close: "10" },
      { date: "2026-07-24", close: "200" },
      { date: "2026-07-25", close: "180" },
    ]);
    expect(change).toBeCloseTo(-0.1, 10);
  });

  it("needs two points", () => {
    expect(dayChangeFromSeries([{ date: "d", close: "100" }])).toBeNull();
    expect(dayChangeFromSeries([])).toBeNull();
    expect(dayChangeFromSeries(undefined)).toBeNull();
  });

  it("a zero or unparseable previous close is null, never Infinity", () => {
    expect(
      dayChangeFromSeries([
        { date: "a", close: "0" },
        { date: "b", close: "50" },
      ]),
    ).toBeNull();
    expect(
      dayChangeFromSeries([
        { date: "a", close: "oops" },
        { date: "b", close: "50" },
      ]),
    ).toBeNull();
  });
});

describe("latestClose", () => {
  it("reads the final point", () => {
    expect(
      latestClose([
        { date: "a", close: "10" },
        { date: "b", close: "12.5" },
      ]),
    ).toBe(12.5);
  });

  it("is null for empty or junk", () => {
    expect(latestClose([])).toBeNull();
    expect(latestClose(undefined)).toBeNull();
    expect(latestClose([{ date: "a", close: "" }])).toBeNull();
  });
});

describe("rankMovers", () => {
  const mover = (symbol: string, dayChange: number | null): MoverInput => ({
    instrumentId: symbol,
    symbol,
    name: symbol,
    kind: "stock",
    currency: "INR",
    price: 100,
    dayChange,
    series: [],
  });

  it("ranks by absolute move — a big drop is as newsworthy as a big rise", () => {
    const ranked = rankMovers(
      [mover("A", 0.01), mover("B", -0.06), mover("C", 0.03)],
      3,
    );
    expect(ranked.map((m) => m.symbol)).toEqual(["B", "C", "A"]);
  });

  it("keeps instruments with no change, but sorts them last", () => {
    const ranked = rankMovers(
      [mover("NEW", null), mover("A", 0.01), mover("ZED", null)],
      3,
    );
    expect(ranked.map((m) => m.symbol)).toEqual(["A", "NEW", "ZED"]);
  });

  it("respects the limit", () => {
    expect(
      rankMovers([mover("A", 0.1), mover("B", 0.2), mover("C", 0.3)], 2),
    ).toHaveLength(2);
  });

  it("does not mutate its input", () => {
    const input = [mover("A", 0.01), mover("B", -0.06)];
    rankMovers(input, 2);
    expect(input.map((m) => m.symbol)).toEqual(["A", "B"]);
  });
});

describe("bucketDayChange — value-weighted", () => {
  it("weights each holding by its market value", () => {
    // 75% of the bucket up 4%, 25% down 4% => +2%
    const change = bucketDayChange([
      { marketValue: "7500", dayChange: 0.04 },
      { marketValue: "2500", dayChange: -0.04 },
    ]);
    expect(change).toBeCloseTo(0.02, 10);
  });

  it("excludes rows missing either side, without skewing the base", () => {
    // Only the 1000-value row counts: +5%.
    const change = bucketDayChange([
      { marketValue: "1000", dayChange: 0.05 },
      { marketValue: "9000", dayChange: null },
      { marketValue: null, dayChange: 0.99 },
    ]);
    expect(change).toBeCloseTo(0.05, 10);
  });

  it("is null when nothing is measurable", () => {
    expect(bucketDayChange([])).toBeNull();
    expect(
      bucketDayChange([{ marketValue: "1000", dayChange: null }]),
    ).toBeNull();
    expect(bucketDayChange([{ marketValue: "0", dayChange: 0.05 }])).toBeNull();
  });

  it("ignores non-finite day changes", () => {
    expect(
      bucketDayChange([{ marketValue: "1000", dayChange: Infinity }]),
    ).toBeNull();
  });
});

describe("attentionItems", () => {
  const base = {
    theses: [],
    instruments: [],
    unpricedHoldings: 0,
    now: NOW,
  };

  it("says nothing when nothing needs the user", () => {
    expect(attentionItems(base)).toEqual([]);
  });

  it("surfaces a single breached thesis by name", () => {
    const items = attentionItems({
      ...base,
      theses: [
        {
          id: "t1",
          instrumentId: "i1",
          symbol: "RELIANCE.NS",
          status: "breached",
          lastReviewedAt: NOW,
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0].severity).toBe("alert");
    expect(items[0].message).toContain("RELIANCE.NS");
    expect(items[0].href).toBe("/i/i1");
  });

  it("summarises several breaches and links to the first", () => {
    const items = attentionItems({
      ...base,
      theses: ["A", "B", "C", "D"].map((s, i) => ({
        id: `t${i}`,
        instrumentId: `i${i}`,
        symbol: s,
        status: "breached",
        lastReviewedAt: NOW,
      })),
    });
    expect(items[0].message).toContain("4 theses breached");
    expect(items[0].message).toContain("…"); // only the first three named
  });

  it("ranks a breach above stale data above housekeeping", () => {
    const items = attentionItems({
      ...base,
      theses: [
        {
          id: "t1",
          instrumentId: "i1",
          symbol: "A",
          status: "breached",
          lastReviewedAt: NOW,
        },
        {
          id: "t2",
          instrumentId: "i2",
          symbol: "B",
          status: "intact",
          lastReviewedAt: daysAgo(200),
        },
      ],
      instruments: [
        {
          id: "i3",
          symbol: "C",
          fetchedAt: hoursAgo(100),
          status: "active",
          isManual: false,
        },
      ],
      unpricedHoldings: 1,
    });
    expect(items.map((i) => i.key)).toEqual([
      "breached",
      "stale",
      "unpriced",
      "review-due",
    ]);
  });

  it("calls out quarantined instruments separately from merely stale ones", () => {
    const items = attentionItems({
      ...base,
      instruments: [
        {
          id: "i1",
          symbol: "BROKEN",
          fetchedAt: hoursAgo(100),
          status: "fetch_failing",
          isManual: false,
        },
      ],
    });
    expect(items.map((i) => i.key)).toEqual(["fetch-failing"]);
    expect(items[0].message).toContain("BROKEN");
  });

  it("never calls a hand-kept instrument stale — nobody was fetching it", () => {
    const items = attentionItems({
      ...base,
      instruments: [
        {
          id: "i1",
          symbol: "ACME",
          fetchedAt: hoursAgo(500),
          status: "active",
          isManual: true,
        },
      ],
    });
    expect(items).toEqual([]);
  });

  it("treats a never-fetched instrument as stale", () => {
    const items = attentionItems({
      ...base,
      instruments: [
        {
          id: "i1",
          symbol: "NEW",
          fetchedAt: null,
          status: "active",
          isManual: false,
        },
      ],
    });
    expect(items[0].key).toBe("stale");
  });

  it("does not nag for review on a thesis that is already breached", () => {
    const items = attentionItems({
      ...base,
      theses: [
        {
          id: "t1",
          instrumentId: "i1",
          symbol: "A",
          status: "breached",
          lastReviewedAt: daysAgo(400),
        },
      ],
    });
    expect(items.map((i) => i.key)).toEqual(["breached"]);
  });

  it("holds fire until the review window actually passes", () => {
    const items = attentionItems({
      ...base,
      theses: [
        {
          id: "t1",
          instrumentId: "i1",
          symbol: "A",
          status: "intact",
          lastReviewedAt: daysAgo(89),
        },
      ],
    });
    expect(items).toEqual([]);
  });

  it("uses singular wording for one of anything", () => {
    const items = attentionItems({ ...base, unpricedHoldings: 1 });
    expect(items[0].message).toContain("1 holding excluded");
  });
});
