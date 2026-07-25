import { EmptyState } from "@/components/base/empty-state";

// Portfolio — journal-derived, currency-bucketed; built in Phase 6.
export default function PortfolioPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-6">
      <h1 className="font-display mb-6 text-2xl font-medium text-ink">
        Portfolio
      </h1>
      <EmptyState
        title="No holdings yet"
        message="The portfolio derives from your journal entries — it lands in Phase 6."
      />
    </main>
  );
}
