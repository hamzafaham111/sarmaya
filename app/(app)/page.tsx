import { DataTable } from "@/components/base/data-table";
import { DeltaValue } from "@/components/base/delta-value";
import { RangeBand } from "@/components/base/range-band";
import { StatValue } from "@/components/base/stat-value";
import { formatMoney } from "@/lib/format";

// Overview with PREVIEW data — real screens land with Phases 1–3 (auth,
// data layer, study environment). Everything here is honest placeholder,
// labeled as such; it exists so the shell reads as an application.
export default function HomePage() {
  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-6 py-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-medium text-ink">
            Sarmaya
          </h1>
          <span className="rounded-sm bg-warn-soft px-1.5 py-0.5 text-[11px] text-warn">
            preview data — live data arrives with Phase 2
          </span>
        </div>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatValue label="Watchlist" value="4 instruments" />
          <StatValue
            label="Portfolio (INR)"
            value={formatMoney(2_84_55_000, "INR", "compact")}
          />
          <StatValue
            label="Portfolio (USD)"
            value={formatMoney(12_450, "USD", "compact")}
          />
          <StatValue label="Theses intact" value="5 / 6" />
        </section>

        <section className="mt-8">
          <h2 className="font-display mb-3 text-lg text-ink">Watchlist</h2>
          <DataTable
            ariaLabel="Watchlist preview"
            columns={[
              { key: "kind", header: "Kind", numeric: false },
              { key: "price", header: "Price" },
              { key: "delta", header: "1D" },
              { key: "band", header: "Your range", numeric: false },
            ]}
            rows={[
              {
                label: "RELIANCE — Reliance Industries",
                cells: [
                  "stock · IN",
                  formatMoney(1610.45, "INR"),
                  "+0.84%",
                  "band preview below",
                ],
              },
              {
                label: "HDFCBANK — HDFC Bank",
                cells: [
                  "stock · IN",
                  formatMoney(1729.1, "INR"),
                  "-0.32%",
                  "—",
                ],
              },
              {
                label: "Parag Parikh Flexi Cap",
                cells: ["fund · IN", formatMoney(82.61, "INR"), "+0.12%", "—"],
              },
              {
                label: "AAPL — Apple Inc.",
                cells: [
                  "stock · US",
                  formatMoney(333.02, "USD"),
                  "-1.05%",
                  "—",
                ],
              },
            ]}
          />
        </section>

        <section className="mt-8 max-w-md">
          <h2 className="font-display mb-1 text-lg text-ink">
            The signature: your estimate range
          </h2>
          <p className="mb-4 text-xs text-ink-muted">
            Four models, your assumptions, one band — against today&apos;s
            price. Activates in Phase 4.
          </p>
          <RangeBand
            low={1240}
            high={2180}
            marker={1610}
            format={(n) => formatMoney(n, "INR")}
            caption="models: DCF · EPV · Graham · Reverse DCF"
          />
          <div className="mt-4 flex gap-6 text-sm">
            <span>
              1D <DeltaValue value={0.84} />
            </span>
            <span>
              1Y <DeltaValue value={14.2} />
            </span>
          </div>
        </section>
      </main>
    </>
  );
}
