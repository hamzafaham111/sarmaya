import { DataTable } from "@/components/base/data-table";
import { DeltaValue } from "@/components/base/delta-value";
import { EmptyState } from "@/components/base/empty-state";
import { RangeBand } from "@/components/base/range-band";
import { Sparkline } from "@/components/base/sparkline";
import { StaleBadge } from "@/components/base/stale-badge";
import { StatValue } from "@/components/base/stat-value";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

// The UI contract for every later phase: each base component in every state
// (default, null, negative, loading, stale, empty). If a screen needs a state
// that isn't here, it gets designed here first.

const sparkValues = [4, 5.2, 5.1, 6, null, null, 6.4, 7.1, 6.8, 7.6, 8.2];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-8 last:border-0">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {note ? <p className="mt-1 text-xs text-ink-muted">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StateLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] tracking-wider text-ink-muted uppercase">
      {children}
    </div>
  );
}

export default function StyleguidePage() {
  const inr = (n: number) => formatMoney(n, "INR", "compact");

  return (
    <AppShell active="/styleguide">
      <main className="mx-auto w-full max-w-3xl px-6 pb-24">
        <header className="py-8">
          <h1 className="font-display text-3xl font-medium text-ink">
            Styleguide
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            The UI contract. Dark is home; toggle (sidebar) to verify light.
          </p>
        </header>

        <Section
          title="Type roles"
          note="display / body / numeric — numbers always tabular"
        >
          <p className="font-display text-3xl font-medium text-ink">
            Reliance Industries{" "}
            <span className="text-ink-muted">— display face</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-ink">
            Body face at 13px/1.4 — dense, calm, built for reading labels and
            reasoning, not decoration.
          </p>
          <p className="font-numeric mt-2 text-sm text-ink tabular-nums">
            1,23,45,678.00 · 99.10 · -0.42 · numeric face aligns vertically
          </p>
        </Section>

        <Section title="StatValue" note="states: default / null / loading">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatValue
              label="Market cap"
              value={inr(20_45_00_00_00_000)}
              size="lg"
            />
            <StatValue label="P/E (ttm)" value="27.4" />
            <StatValue label="Dividend yield" value={null} />
            <StatValue label="Revenue (ttm)" value="" loading />
          </div>
        </Section>

        <Section
          title="DeltaValue"
          note="states: positive / negative / zero / null — sign always renders, color never alone"
        >
          <div className="flex flex-wrap items-baseline gap-6 text-sm">
            <DeltaValue value={1.24} />
            <DeltaValue value={-2.31} />
            <DeltaValue value={0} />
            <DeltaValue value={null} />
            <DeltaValue value={-4520.5} suffix="" />
          </div>
        </Section>

        <Section
          title="RangeBand — the signature"
          note="the user's estimate range vs current price; degradations designed first"
        >
          <div className="space-y-8">
            <div>
              <StateLabel>full — four models, price inside band</StateLabel>
              <RangeBand
                low={1240}
                high={2180}
                marker={1610}
                format={(n) => formatMoney(n, "INR")}
                caption="models: DCF · EPV · Graham · Reverse DCF"
              />
            </div>
            <div>
              <StateLabel>price outside the band (domain extends)</StateLabel>
              <RangeBand
                low={1240}
                high={1580}
                marker={1975}
                format={(n) => formatMoney(n, "INR")}
                caption="models: DCF · EPV"
              />
            </div>
            <div>
              <StateLabel>
                single applicable model — a tick, not a band
              </StateLabel>
              <RangeBand
                low={860}
                high={860}
                marker={790}
                format={(n) => formatMoney(n, "INR")}
                caption="models: Graham"
              />
            </div>
            <div>
              <StateLabel>compact row variant (portfolio/watchlist)</StateLabel>
              <div className="flex items-center gap-3">
                <span className="font-numeric text-sm">RELIANCE</span>
                <RangeBand low={1240} high={2180} marker={1610} compact />
                <span className="font-numeric text-sm">₹1,610</span>
              </div>
            </div>
            <div>
              <StateLabel>
                no applicable models — component renders nothing (honest empty
                state belongs to the caller)
              </StateLabel>
              <RangeBand low={null} high={null} marker={1610} />
              <EmptyState
                title="No estimates yet"
                message="Build a DCF, Graham, or EPV estimate with your own assumptions to see your range here."
              />
            </div>
          </div>
        </Section>

        <Section
          title="DataTable"
          note="dense statements table: 13px numerals, lakh/crore, — for null, horizontal scroll on mobile"
        >
          <DataTable
            ariaLabel="Example income statement"
            columns={[
              { key: "fy21", header: "FY21" },
              { key: "fy22", header: "FY22" },
              { key: "fy23", header: "FY23" },
              { key: "fy24", header: "FY24" },
              { key: "fy25", header: "FY25" },
            ]}
            rows={[
              {
                label: "Revenue",
                cells: [
                  formatMoney(4_66_92_40_00_00_00, "INR", "compact"),
                  formatMoney(6_95_60_10_00_00_00, "INR", "compact"),
                  formatMoney(8_74_39_60_00_00_00, "INR", "compact"),
                  formatMoney(9_00_60_50_00_00_00, "INR", "compact"),
                  formatMoney(9_64_69_30_00_00_00, "INR", "compact"),
                ],
              },
              {
                label: "Operating income",
                cells: [
                  formatMoney(50_46_10_00_00_00, "INR", "compact"),
                  formatMoney(70_98_30_00_00_00, "INR", "compact"),
                  formatMoney(81_53_80_00_00_00, "INR", "compact"),
                  null,
                  formatMoney(99_54_70_00_00_00, "INR", "compact"),
                ],
              },
              {
                label: "Net income",
                cells: [
                  formatMoney(49_12_80_00_00_00, "INR", "compact"),
                  formatMoney(60_70_50_00_00_00, "INR", "compact"),
                  formatMoney(66_70_20_00_00_00, "INR", "compact"),
                  formatMoney(69_62_10_00_00_00, "INR", "compact"),
                  formatMoney(-4_20_10_00_00_00, "INR", "compact"),
                ],
                emphasis: true,
              },
              {
                label: "EPS (₹)",
                cells: ["72.6", "89.7", "98.6", null, "-6.2"],
              },
            ]}
          />
        </Section>

        <Section
          title="Sparkline"
          note="quiet inline line; nulls are gaps, never zeros; <2 points renders a dash"
        >
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <StateLabel>default (muted)</StateLabel>
              <Sparkline values={sparkValues} />
            </div>
            <div>
              <StateLabel>brand (user-authored series)</StateLabel>
              <Sparkline values={sparkValues} tone="brand" />
            </div>
            <div>
              <StateLabel>insufficient data</StateLabel>
              <Sparkline values={[5]} />
            </div>
          </div>
        </Section>

        <Section
          title="StaleBadge"
          note="data >48h old is always flagged; dot + words, never color alone"
        >
          <div className="flex flex-wrap gap-4">
            <StaleBadge asOf="2026-07-21" />
            <StaleBadge asOf={null} />
          </div>
        </Section>

        <Section title="EmptyState">
          <EmptyState
            title="Nothing tracked yet"
            message="Search for an instrument to start studying it — statements, ratios, and your own estimates in one place."
            action={<Button size="sm">Add an instrument</Button>}
          />
        </Section>

        <Section
          title="Accent discipline"
          note="brass = interactive elements and the user's own annotations ONLY"
        >
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Button size="sm">Primary action</Button>
            <a href="#top" className="text-brand underline underline-offset-4">
              a link
            </a>
            <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-xs text-brand">
              your annotation
            </span>
            <span className="text-ink">machine-fetched number: </span>
            <span className="font-numeric text-ink">₹1,610.45</span>
          </div>
        </Section>
      </main>
    </AppShell>
  );
}
