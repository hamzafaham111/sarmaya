import Link from "next/link";

// Placeholder home — the real app shell arrives with auth (Phase 1) and
// instruments (Phase 2). /styleguide is Phase 0's deliverable.
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-display text-5xl text-ink">Sarmaya</h1>
      <p className="max-w-md text-sm text-ink-muted">
        A personal investment research terminal. Study businesses, value them
        with your own assumptions, record your thinking.
      </p>
      <Link
        href="/styleguide"
        className="text-sm text-brand underline underline-offset-4"
      >
        Design system styleguide →
      </Link>
    </main>
  );
}
