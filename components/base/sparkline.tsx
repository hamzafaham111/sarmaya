"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

// Inline table sparkline (UI mandate #6): thin quiet line, no axes shown,
// no dots, gaps for nulls (connectNulls=false — never invent data).
export function Sparkline({
  values,
  width = 96,
  height = 24,
  tone = "muted",
}: {
  values: (number | null)[];
  width?: number;
  height?: number;
  /** muted (default) for context lines; brand for user-authored series */
  tone?: "muted" | "brand" | "ink";
}) {
  const nonNull = values.filter((v): v is number => v !== null);
  if (nonNull.length < 2) {
    return (
      <span className="text-xs text-ink-muted" style={{ width, height }}>
        —
      </span>
    );
  }

  const data = values.map((v, i) => ({ i, v }));
  const stroke =
    tone === "brand"
      ? "var(--brand)"
      : tone === "ink"
        ? "var(--foreground)"
        : "var(--muted-foreground)";

  return (
    <div style={{ width, height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
        >
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.25}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
