"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney, type Currency, DASH } from "@/lib/format";

// Quiet NAV/price series chart with range selection (1Y/3Y/5Y/Max).
const RANGES = [
  { key: "1Y", days: 365 },
  { key: "3Y", days: 365 * 3 },
  { key: "5Y", days: 365 * 5 },
  { key: "Max", days: Infinity },
] as const;

export function SeriesChart({
  series,
  currency,
  label,
}: {
  series: { date: string; value: number }[];
  currency: Currency;
  label: string;
}) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("1Y");

  const data = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? 365;
    if (!Number.isFinite(days)) return series;
    // Anchor the window to the series end (pure — no wall clock in render).
    const last = series[series.length - 1]?.date;
    if (!last) return series;
    const cutoff = new Date(last).getTime() - (days as number) * 86_400_000;
    return series.filter((p) => new Date(p.date).getTime() >= cutoff);
  }, [series, range]);

  if (series.length < 2) {
    return (
      <p className="rounded-md border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
        Not enough history yet — the daily job accumulates it from here.
      </p>
    );
  }

  return (
    <div className="rounded-md border border-line bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] tracking-wide text-ink-muted uppercase">
          {label}
        </span>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-sm px-1.5 py-0.5 text-[11px] transition ${
                range === r.key
                  ? "bg-brand-soft text-brand"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
          >
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={60}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 11,
                color: "var(--foreground)",
              }}
              formatter={(v) => [
                typeof v === "number" ? formatMoney(v, currency) : DASH,
                "",
              ]}
            />
            <Line
              dataKey="value"
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
