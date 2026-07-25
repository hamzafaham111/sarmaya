# DECISIONS.md

One line per decision: date, decision, why.

- 2026-07-25 — npm, Node 22 (`.nvmrc`), Next.js 16 (latest stable ≥14 per CLAUDE.md) — boring defaults, zero-config Vercel.
- 2026-07-25 — shadcn/ui initialized with radix base, default preset; generated `components/ui/*` excluded from prettier (vendor-styled code).
- 2026-07-25 — next-themes for the dark-default/light-toggle requirement — the standard shadcn companion, trivial dep.
- 2026-07-25 — Palette: graphite + brass accent (DESIGN.md) — first draft (blue + Space Grotesk) rejected as generic-SaaS per the mandate's "revise anything that reads generic".
- 2026-07-25 — Named tokens exposed as `bg/surface/ink/ink-muted/line/brand/pos/neg/warn` layered over shadcn's variables; ALL hex values live in `app/globals.css` only (grep-enforced).
- 2026-07-25 — `Rs ` (with space) as PKR symbol, `₹` for INR; USD `lakh-crore` style falls back to western grouping — lakh/crore is an INR/PKR concept.
- 2026-07-25 — Compact money: Cr/L/K for INR/PKR, B/M/K for USD, ~3 significant digits.
- 2026-07-25 — RangeBand renders nothing when no models apply — an empty track would imply an estimate exists; callers own the empty state.
- 2026-07-25 — Sparkline uses Recharts (mandated chart lib) with `connectNulls=false` — gaps are gaps, never interpolated.
- 2026-07-25 — Playwright runs against a production build on port 3210, `reuseExistingServer: false` — avoids dev-lock conflicts and stale servers.
- 2026-07-25 — CI is node-only until Phase 2 introduces `/jobs` (python), which adds the 3.11 pytest job.
- 2026-07-25 — Vitest owns `*.test.ts`, Playwright owns `tests/*.spec.ts`.
- 2026-07-25 — Reusing the existing Supabase project (same URL/keys); user confirmed the leftover Thesis-era tables will be DROPPED at Phase 1 start so Sarmaya's new schema applies to a clean public schema.
