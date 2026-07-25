import { EmptyState } from "@/components/base/empty-state";

// Watchlist — search + add arrive with Phase 2; the full table with Phase 3.
export default function InstrumentsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink">
        Instruments
      </h1>
      <EmptyState
        title="Nothing tracked yet"
        message="Instrument search and the add flow arrive with the data layer (Phase 2)."
      />
    </main>
  );
}
