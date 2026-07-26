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
- 2026-07-25 — Continuous execution of ALL phases per user instruction (overrides stop-after-each-phase); criteria needing user accounts demonstrated as they arrive.
- 2026-07-25 — Design v2 after owner review: serif/editorial direction rejected ("newspaper"); pivot to Space Grotesk display + cool slate darks + blue accent + app shell. Density, tokens-only-hex, dark-default, mono numerals unchanged.
- 2026-07-26 — Ratios include an fcf_margin row and ROIC as a pre-tax proxy (op income / (equity+debt−cash)); interest coverage omitted — no interest-expense line item in the source.
- 2026-07-26 — price_history kept separate from nav_history (clean semantics per kind); both backfill on first sight via ONE unnest insert (the pooler is far away).
- 2026-07-26 — Fund NAV history backfills once via the per-scheme API (whitelisted mfapi.in), then the daily AMFI bulk file keeps it fresh — the bulk file only carries the latest NAV.
- 2026-07-26 — Fund search list = open-ended DIRECT+GROWTH schemes only (1.7k of 14k; regular/IDCW variants are noise); lazy-loaded client-side.
- 2026-07-26 — PSX v1 is prices-only via the portal's EOD JSON; statements show an honest "unavailable for this market" gap; parser rejects malformed rows defensively (fixtures incl. a broken one).
- 2026-07-26 — Sentry wired runtime-only (inline instrumentation init, errors only, no build plugin); client uses NEXT_PUBLIC_SENTRY_DSN.
- 2026-07-26 — Onboarding example set = RELIANCE.NS + Parag Parikh flexi fund + an [Example] journal note, created only on request from empty states.
- 2026-07-26 — e2e is ONE long journey test (sign-in → study → valuation → fund → portfolio) with a 240s budget — it exercises the real DB, not mocks.
- 2026-07-26 — Chart range windows (1Y/3Y/5Y) anchor to the LAST point in the series, not wall-clock now — keeps the render pure (no server/client hydration drift) and still shows a full window when the series ends before today.
- 2026-07-26 — Email templates are the one sanctioned place for hex outside `app/globals.css` — email clients don't support CSS custom properties; the palette is mirrored by hand there.
- 2026-07-26 — Key figures (snapshot/TTM) render in their own panel, kept separate from the per-fiscal-year Ratios table — one grid mixing TTM and FY would silently compare different periods. Earnings yield derives from eps/price (honest for loss-makers) rather than 1/PE.
- 2026-07-26 — Manual statements live in a user-owned `manual_statements` table with RLS, NOT as rows in the shared `statements` table: a job can never clobber your typing and your figures are never shown to another user. Merge is field-level — a blank field means "no opinion" and falls back to the provider's figure.
- 2026-07-26 — Hand-kept instruments (`instruments.is_manual`) are skipped by both batch jobs; their price is written through the normal `snapshots` + `price_history` path so charts, day change, valuation and portfolio need no special case. `saveManualPrice` refuses any instrument the user doesn't track or that a provider owns.
- 2026-07-26 — Creating a hand-kept instrument whose symbol already exists as a provider-backed one is refused (search for the real one instead) — no shadow duplicates in a global catalog.
