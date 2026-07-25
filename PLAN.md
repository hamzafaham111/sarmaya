# PLAN.md — Sarmaya v2 implementation plan

Fresh repository; no prior code exists. Read CLAUDE.md first — it overrides this file on rules. Execute phases strictly in order; each ends with acceptance criteria that must be demonstrated (real command output / screenshots), not asserted. Stop after each phase.

---

## Phase 0 — Foundation + design system

Scaffold Next.js (App Router, TS strict, Tailwind, shadcn/ui). ESLint + Prettier, Vitest, Playwright, GitHub Actions CI (typecheck + tests). Directory layout per CLAUDE.md. `.env.example`, `DECISIONS.md`, `IDEAS.md`.

Design system, per the UI mandate:
- Produce a short written design plan FIRST (in `DESIGN.md`): named palette (~5 hex values), the three type roles (display / body / tabular-numeric) with chosen faces (Google Fonts, free), spacing/type scale, and a sketch of the signature valuation range band. Review it against the CLAUDE.md UI mandate before coding; revise anything that reads generic.
- Implement as Tailwind theme tokens + a small set of base components: `StatValue` (tabular numerals, lakh/crore-aware formatter), `DeltaValue` (signed, colored), `DataTable` (dense financial table), `Sparkline`, `RangeBand` (the signature — props: low, high, marker, labels), `StaleBadge`, `EmptyState`.
- Number formatting utilities: `formatMoney(value, currency, style: 'lakh-crore' | 'compact')` with unit tests covering INR 1,23,45,678 grouping, PKR, USD compact, negatives, null.
- A `/styleguide` route rendering every base component in all states (default, null, negative, loading, stale) — this page is the UI contract for all later phases.

**Acceptance criteria**
- [ ] Build, lint, typecheck, tests green locally and in CI; deployed to Vercel.
- [ ] `DESIGN.md` exists with the reviewed design plan; no hex values in components outside the theme file (grep check).
- [ ] `/styleguide` renders all base components in all states, dark mode default, light mode via toggle, mobile-responsive.
- [ ] Number formatter unit tests pass including lakh/crore grouping and nulls.

## Phase 1 — Schema, RLS, auth

Full Drizzle schema + migrations:

```
instruments        id, kind (stock|fund|index), symbol unique-per-market, market (IN|PK|US),
                   name, currency, status (active|fetch_failing|delisted), created_at
snapshots          id, instrument_id, as_of date, data jsonb, source text,
                   unique(instrument_id, as_of)
statements         id, instrument_id, fiscal_year int, period (annual), statement (income|balance|cashflow),
                   data jsonb, source, fetched_at, unique(instrument_id, fiscal_year, statement)
nav_history        id, instrument_id, nav_date date, nav numeric, unique(instrument_id, nav_date)
user_instruments   user_id, instrument_id, notes_md text default '', updated_at, pk(user_id, instrument_id)
valuations         id, user_id, instrument_id, model (dcf|graham|epv|reverse_dcf),
                   assumptions jsonb, updated_at, unique(user_id, instrument_id, model)
theses             id, user_id, instrument_id, statement text, rule jsonb null,
                   status (intact|breached|archived), created_at, last_reviewed_at
journal_entries    id, user_id, instrument_id, kind (buy|sell|sip|note), trade_date, price numeric,
                   quantity numeric, reasoning text not null check(length>=10), created_at
alert_events       id, user_id, thesis_id null, rule_desc text, fired_on date, snapshot_id,
                   delivered_at, unique nullable-safe on (thesis_id, fired_on)
annotations        id, user_id, instrument_id, target (metric key | 'valuation:<model>' | fiscal_year),
                   body text, created_at        -- notes attached to specific numbers
job_runs           id, job (daily|weekly), started_at, finished_at, ok_count, fail_count, detail jsonb
```

All money/quantity columns numeric. RLS policies on every user-owned table. Supabase Auth (magic link), protected app route group, sign-out.

**Acceptance criteria**
- [ ] Migrations apply cleanly to a fresh database.
- [ ] Scripted RLS proof: user A cannot read user B's rows in any user-owned table via anon key.
- [ ] Magic-link auth works end to end; unauthenticated access redirects.

## Phase 2 — Data layer: India stocks + indices

Adapter interface in `lib/providers/index.ts` (TS types for Snapshot, StatementYear) and Python implementation `jobs/providers/yfinance_provider.py`:
- `get_snapshot(symbol)` → normalized snapshot vocabulary (CLAUDE.md).
- `get_statements(symbol)` → every available fiscal year × three statements, normalized line items.
- `get_price_history(symbol, range)` → daily closes for charts (store 5y in a `price_history` table or reuse nav_history generalized — decide, record in DECISIONS.md).
- Index support via yfinance index symbols (`^NSEI`, `^BSESN`, `^GSPC`).

Instrument search: ship a static symbol list for NSE (top ~500 by market cap is sufficient v1) in-repo; fuzzy search client-side. Add-instrument flow: search → select → synchronous first fetch → instrument page shell.

Jobs: `jobs/daily.py` (snapshots + prices for tracked instruments) and `jobs/weekly.py` (statements), both per CLAUDE.md batch discipline, GitHub Actions workflows scheduled + manually dispatchable. Record ≥4 fixtures: large-cap IN, IN bank (missing debt metrics), US ticker, one broken/missing-fields case.

**Acceptance criteria**
- [ ] `python jobs/providers/yfinance_provider.py --symbol RELIANCE.NS` prints normalized snapshot + statement years.
- [ ] Fixture tests pass, including the broken fixture (nulls preserved, no crash).
- [ ] User can search "reliance", add it, and see the shell page with first data.
- [ ] Daily + weekly jobs run end to end in GitHub Actions against the deployed DB (demonstrate one manual dispatch each); job_runs rows written.
- [ ] Grep check: no yfinance/Yahoo references outside adapter directories.

## Phase 3 — The study environment (stock pages)

The core screen. `/i/[symbol]` for stocks:
- Header: name, price, currency, day change, market, StaleBadge; the RangeBand placeholder (activates in Phase 4).
- **Statements section**: three tabs (income / balance / cash flow), years as columns (oldest→newest), dense DataTable with lakh/crore formatting, YoY growth% row toggles, "data since YYYY" label. Every cell annotatable: click a cell → attach an annotation (stored against metric+year); annotated cells show a subtle accent marker; hover reveals the note.
- **Trends section**: Recharts line/bar charts for revenue, net income, FCF, margins (%), debt vs cash, shares outstanding — one metric per small-multiple chart, quiet styling per UI mandate.
- **Ratios section**: computed at read time from `lib/analysis/ratios.ts` (pure, unit-tested): ROE, ROIC, margins, debt/equity, interest coverage proxy if data allows, per-year table + sparkline each. Null-safe throughout.
- **Notes section**: the markdown notes editor (autosaved) — positioned last; annotations carry the in-context thinking.
- Watchlist index `/instruments`: table of tracked instruments with price, day delta, sparkline, kind badge.

**Acceptance criteria**
- [ ] RELIANCE.NS page renders all sections with real fetched data; a bank stock renders with its missing metrics as `—` (no NaN anywhere — automated check on rendered output).
- [ ] Ratio unit tests: hand-computed reference company matches; null inputs produce null, not 0.
- [ ] Annotations persist, render on the right cells, survive reload; RLS-scoped.
- [ ] Lighthouse performance ≥ 80 on the stock page; mobile layout usable (statements horizontally scrollable, not broken).

## Phase 4 — Valuation engine

`lib/valuation/` — four pure, decimal-safe, exhaustively tested modules:
- `dcf.ts`: FCF-based, growth years + terminal, inputs auto-seeded from statement history (5Y FCF CAGR capped 20%, discount default 12%, editable), per-share output.
- `graham.ts`: Graham number from EPS and BVPS (state the formula and its assumptions in the UI's info popover).
- `epv.ts`: earnings power value — normalized operating income, no growth assumption.
- `reverse_dcf.ts`: solves implied growth from current price (bisection; document convergence bounds).
Each returns `{ value } | { notApplicable: reason }`.

UI on the stock page: the valuation panel — model cards showing output + editable assumptions (auto-seeded values labeled "auto — edit me"), the info popover explaining each model's logic and weaknesses honestly, and the **RangeBand activated**: band spans min→max of applicable model outputs (user-adjusted values included), marker at current price, caption "your estimate range". Assumptions persist per user+instrument+model. Copy audit per valuation doctrine (grep forbidden phrases).

**Acceptance criteria**
- [ ] Each model's unit tests: reference case to the cent; negative-FCF DCF ⇒ notApplicable with reason; missing EPS Graham ⇒ notApplicable; reverse DCF converges on the reference case and refuses non-convergent inputs gracefully.
- [ ] RangeBand renders correctly for: all four applicable; only two applicable; none applicable (band hidden, honest empty state).
- [ ] Editing an assumption recomputes live, persists, and survives reload.
- [ ] Grep: zero forbidden copy phrases in the codebase.

## Phase 5 — Mutual funds (India) + indices pages

AMFI adapter in `jobs/providers/amfi_provider.py`: fetch the bulk NAV file, parse (fixture-tested — the file format is quirky; keep a real sample as fixture), filter to tracked scheme codes, upsert `nav_history`. Scheme search from the AMFI scheme master (static snapshot in-repo, refreshed by the weekly job).

Returns math in `lib/analysis/returns.ts` (pure, tested): point-to-point returns, CAGR (3Y/5Y), from NAV series with gap tolerance.

Fund page `/i/[schemeCode]`: NAV chart (1Y/3Y/5Y/max), returns table, fund facts, notes — NO valuation panel, NO statements (kind-based layout, not hidden sections). Index page: same skeleton with price series and returns. Watchlist handles all three kinds cleanly.

**Acceptance criteria**
- [ ] Add a real fund by searching its name; NAV history populates; returns match hand-computed values from the fixture series (unit test).
- [ ] Daily job updates NAVs via ONE bulk fetch regardless of number of tracked funds (assert call count in test).
- [ ] Fund and index pages render with correct kind-specific layout; no valuation UI reachable for non-stocks.

## Phase 6 — Portfolio manager

Journal-derived, multi-currency-bucketed:
- Journal entry flow supports stocks and funds (buy/sell/SIP with units+NAV), mandatory reasoning.
- Holdings math in `lib/analysis/holdings.ts` (pure, tested): net quantity, average cost, handles partial sells and SIP accumulation.
- `/portfolio`: per currency bucket — holdings table (qty, avg cost, price/NAV, market value, unrealized P/L abs+%, weight%), totals per bucket; allocation views (by instrument, by kind, by sector where snapshot provides it); the "portfolio as one business" panel: value-weighted P/E, ROE, debt/equity across stock holdings (nulls excluded with footnote); each stock row shows its mini RangeBand with price marker — the signature element doing portfolio duty; thesis-health rollup and banner ("N% of stock value has a breached thesis").
- Explicitly out (IDEAS.md): XIRR/time-weighted returns, benchmarks, dividends, realized P/L reports, currency conversion.

**Acceptance criteria**
- [ ] Holdings tests: buy/partial-sell/exit and a SIP sequence produce correct positions to the paisa.
- [ ] Mixed portfolio (IN stock + IN fund + US stock) renders as separate currency buckets, no cross-currency totals anywhere.
- [ ] Weighted aggregates match hand-computed reference; null-metric holdings excluded with visible footnote.
- [ ] RangeBand renders in rows where valuations exist; gracefully absent otherwise.

## Phase 7 — Theses, alerts, email

Thesis CRUD on stock pages (statements + optional rules via constrained form: metric dropdown from vocabulary ∪ `price_vs_estimate_low_pct`, gt/lt, value). Alert engine `lib/alerts/engine.ts` — pure, exhaustively tested: rule evaluation, intact↔breached transitions, null ⇒ unverifiable, `price_vs_estimate_low_pct` computed against the user's RangeBand low at evaluation time. Evaluation runs at the end of the daily job via a `CRON_SECRET`-guarded `/api/cron` route (single engine implementation — TS). Dedup by DB constraint. Breach email (react-email, quiet design matching tokens) + weekly digest (watchlist movers, portfolio delta, due-for-review theses at 90 days). `/api/health` returns 200 iff newest snapshot <48h.

**Acceptance criteria**
- [ ] Engine: 100% branch coverage; seeded breach fires exactly one email; persisting breach next day fires zero; recovery flips status back.
- [ ] Running the daily job twice for the same day: no duplicate snapshots, events, or emails (demonstrate).
- [ ] Digest renders correctly with a seeded account; health endpoint behaves for fresh vs stale.

## Phase 8 — Pakistan (PSX) + final polish

PSX adapter `jobs/providers/psx_provider.py` against the PSX data portal (dps.psx.com.pk): prices and whatever fundamentals are reliably parseable; scrape-defensively, fixtures mandatory, graceful "data unavailable" degradation; PKR formatting already handled by Phase 0 tokens. KSE-100 index. PSX symbol list in-repo. Stock pages render with honest partial data ("statements unavailable for this market" where true — the layout must not look broken with thin data).

Polish pass: onboarding (first sign-in offers a pre-filled example stock, fund, and a sample journal entry, deletable), empty states audit against `/styleguide`, Sentry wired, README with setup + operations runbook (what to do when a job fails; how to add a market adapter).

**Acceptance criteria**
- [ ] A real PSX ticker can be added and shows price history + available data with honest gaps; a PSX portal HTML change simulated via broken fixture degrades gracefully (test).
- [ ] Daily job covers IN + PK + US instruments in one run within free-tier limits (demonstrate run timing).
- [ ] New-user onboarding flow works; every list/page has a designed empty state (walkthrough with screenshots).
- [ ] README runbook complete; a stranger could deploy from it.

---

## Explicitly out of scope for v1 (IDEAS.md, never build unprompted)

AI features · recommendations/scores · screeners · broker/CSV import · intraday data · currency conversion & consolidated net worth · XIRR/benchmarking · dividends tracking · options/crypto · fund holdings overlap · mobile app · multi-language.

## Definition of done

The owner can: search and add RELIANCE.NS, study 4–5 years of its statements with annotations on specific cells, see quiet trend charts and computed ratios, build DCF/Graham/EPV/reverse-DCF estimates with their own assumptions and see the range band against price, add an Indian mutual fund and see NAV returns, record buys/SIPs with reasoning, open a portfolio that shows currency-bucketed holdings each with its range band and a value-weighted "portfolio as one business" view, set a rule "alert when price < 90% of my estimate low," and receive exactly one email the day it trips — all on free infrastructure, in an interface that looks like a professional instrument.
