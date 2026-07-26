"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { StatementYearData } from "@/lib/analysis/ratios";
import { computeYearRatios } from "@/lib/analysis/ratios";
import { DASH, formatMoney, formatPercent, type Currency } from "@/lib/format";

// Quiet small multiples (UI mandate #6): one metric per chart, thin marks,
// muted grid, exact values in tooltips. Nulls are gaps — never zeros.

interface Point {
  year: string;
  value: number | null;
}

function seriesFrom(
  years: StatementYearData[],
  kind: "income" | "balance" | "cashflow",
  key: string,
): Point[] {
  return years.map((y) => {
    const rec = y[kind] as Record<string, number | null> | undefined;
    const v = rec?.[key];
    return {
      year: `FY${y.fiscalYear}`,
      value: typeof v === "number" && Number.isFinite(v) ? v : null,
    };
  });
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="mb-1 text-[12px] tracking-wide text-ink-muted uppercase">
        {title}
      </p>
      <div className="h-28">{children}</div>
    </div>
  );
}

const AXIS = {
  tick: { fontSize: 10, fill: "var(--muted-foreground)" },
  axisLine: false as const,
  tickLine: false as const,
};

function MoneyBars({
  data,
  currency,
  format,
}: {
  data: Point[];
  currency: Currency;
  format?: (v: number) => string;
}) {
  const fmt = format ?? ((v: number) => formatMoney(v, currency, "compact"));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="year" {...AXIS} />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "var(--secondary)" }}
          contentStyle={tooltipStyle}
          formatter={(v) => [typeof v === "number" ? fmt(v) : DASH, ""]}
        />
        <Bar
          dataKey="value"
          fill="var(--chart-2)"
          radius={[2, 2, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PercentLine({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="year" {...AXIS} />
        <YAxis hide />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [
            typeof v === "number" ? formatPercent(v) : DASH,
            "",
          ]}
        />
        <Line
          dataKey="value"
          stroke="var(--chart-2)"
          strokeWidth={1.5}
          dot={{ r: 2 }}
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 11,
  color: "var(--foreground)",
};

export function TrendsSection({
  years,
  currency,
}: {
  years: StatementYearData[];
  currency: Currency;
}) {
  if (years.length < 2) {
    return null; // one year is a number, not a trend — the table has it
  }

  const ratios = years.map((y) => computeYearRatios(y));
  const marginData = (key: "netMargin" | "opMargin"): Point[] =>
    ratios.map((r) => ({ year: `FY${r.fiscalYear}`, value: r[key] }));

  return (
    <section className="mt-10">
      <h2 className="font-display mb-3 text-lg text-ink">Trends</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Revenue">
          <MoneyBars
            data={seriesFrom(years, "income", "revenue")}
            currency={currency}
          />
        </ChartCard>
        <ChartCard title="Net income">
          <MoneyBars
            data={seriesFrom(years, "income", "net_income")}
            currency={currency}
          />
        </ChartCard>
        <ChartCard title="Free cash flow">
          <MoneyBars
            data={seriesFrom(years, "cashflow", "fcf")}
            currency={currency}
          />
        </ChartCard>
        <ChartCard title="Operating margin">
          <PercentLine data={marginData("opMargin")} />
        </ChartCard>
        <ChartCard title="Net margin">
          <PercentLine data={marginData("netMargin")} />
        </ChartCard>
        <ChartCard title="Debt vs cash">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={years.map((y) => ({
                year: `FY${y.fiscalYear}`,
                debt: y.balance?.total_debt ?? null,
                cash: y.balance?.cash ?? null,
              }))}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" {...AXIS} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--secondary)" }}
                contentStyle={tooltipStyle}
                formatter={(v, name) => [
                  typeof v === "number"
                    ? formatMoney(v, currency, "compact")
                    : DASH,
                  String(name),
                ]}
              />
              <Bar
                dataKey="debt"
                fill="var(--chart-5)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="cash"
                fill="var(--chart-4)"
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Shares outstanding">
          <MoneyBars
            data={seriesFrom(years, "balance", "shares_outstanding")}
            currency={currency}
            format={(v) => `${(v / 1e6).toFixed(0)}M`}
          />
        </ChartCard>
      </div>
    </section>
  );
}
