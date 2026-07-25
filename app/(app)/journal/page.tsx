import { EmptyState } from "@/components/base/empty-state";

// Global decision journal — built in Phase 6 with the portfolio.
export default function JournalPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink">
        Journal
      </h1>
      <EmptyState
        title="Nothing recorded yet"
        message="Buys, sells and SIPs — each with a mandatory why — arrive in Phase 6."
      />
    </main>
  );
}
