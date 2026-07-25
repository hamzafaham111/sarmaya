# CLAUDE.md — Sarmaya (Investment Research Terminal, v2)

This is a fresh project. Assume NO prior code exists. This file is your persistent context — read it fully before any task; it overrides any conflicting instinct. If PLAN.md conflicts with a rule here, stop and ask the user.

## What this product is

A personal investment **research terminal** for South Asian retail investors (India first, Pakistan second, US tickers as a bonus). The user studies businesses in depth, values them with multiple models, manages their portfolio, and records their thinking — in one place.

Three instrument types, treated differently:
- **Stocks** — the full treatment: complete financial statements (as many years as the source provides, accumulating forward), computed ratios, trend charts, multi-model intrinsic-value estimation, notes/thesis, portfolio inclusion.
- **Mutual funds** (India via AMFI data) — NAV history, returns (1M/1Y/3Y/5Y, CAGR), basic fund facts, SIP-aware portfolio inclusion. NO intrinsic-value models (they don't apply).
- **Indices** (NIFTY 50, SENSEX, KSE-100, S&P 500) — price history, returns, used as portfolio benchmarks context. Watchable, not holdable v1.

Primary user: the owner-developer (single power user) with multi-user architecture from day one so it can become a product later without rework.

What this product is NOT (never build, even if it seems helpful):
- No buy/sell recommendations, predictions, or AI-generated opinions on securities.
- No single-number "the intrinsic value" — see Valuation doctrine below.
- No real-time/intraday data, no trading integration, no broker connections, no social features, no screeners in v1.

## Valuation doctrine (product-defining — same weight as "no advice")

There is no true formula. Intrinsic value is always an estimate. Therefore:
1. Every stock gets MULTIPLE independent models computed side by side: DCF, Graham number, EPV (earnings power value), and Reverse DCF. Results display as a **range band** against current price — never a single blended number, never an average across models presented as "the value."
2. Every model input is visible and user-overridable. Auto-seeded defaults come from the company's own history (e.g. DCF growth seeded from 5Y revenue/FCF CAGR, capped at 20%) and are labeled "auto — edit me".
3. Reverse DCF answers "what growth does the current price imply?" — display that implied rate against the company's actual historical rate.
4. Forbidden copy anywhere in UI, code comments, or emails: "true value", "fair value is" (unprefixed), "undervalued", "overvalued", "we estimate", "buy", "sell". Allowed framing: "your DCF estimate", "estimate range", "price is X% of your estimate range low".
5. A model that lacks required inputs (e.g. negative FCF for DCF, no EPS for Graham) renders as "not applicable — [reason]", never a garbage number.

## Non-negotiable constraints

1. **$0 infrastructure and $0 data.** Free tiers only: Vercel, Supabase (Postgres + Auth), GitHub Actions (scheduled jobs), Resend (email), Sentry. Data: yfinance (unofficial Yahoo), mfapi.in / AMFI NAV data, PSX data portal (later phase). Never add a paid dependency or API without asking.
2. **The app never calls external data sources at request time**, with one exception: adding a new instrument may do one synchronous fetch. Everything else reads our Postgres cache, populated by scheduled jobs.
3. **All external data flows through the adapter layer** (`lib/providers/` + `jobs/providers/`). Nothing outside it may reference yfinance, Yahoo, AMFI, mfapi, or PSX concepts. Adapters are swappable per market.
4. **Financial values**: `numeric` in Postgres, decimal-safe handling in TS (no float arithmetic on money). Every metric nullable everywhere; UI renders `—` for null, never NaN.
5. **Multi-currency from day one**: every monetary value stored with its currency (INR, PKR, USD). v1 does NOT convert between currencies — portfolio totals are shown per currency bucket. Cross-currency conversion is out of scope (IDEAS.md).
6. **RLS on from day one** on every user-owned table (`user_id = auth.uid()`).
7. **Data honesty**: free sources provide ~4–5 years of statements. Store every year available at first fetch and every new year thereafter (append-only) so history accumulates. Never fabricate or interpolate missing years. Show "data since YYYY" labels.

## Stack (do not substitute)

- Next.js 14+ App Router, TypeScript strict, Tailwind CSS, shadcn/ui as the component base
- Recharts for all charts (free, React-native, good enough; no paid chart libs)
- Supabase: Postgres, Auth (magic link), RLS
- Drizzle ORM + drizzle-kit migrations
- Python 3.11 in `/jobs` only (yfinance + AMFI/PSX fetchers)
- GitHub Actions for scheduled jobs; Resend + react-email; Vitest + Playwright

## UI mandate — "nice UI" is a requirement, not a vibe

This is a terminal for studying money. The design brief: **calm, dense, precise — a professional instrument, not a dashboard toy.** Enforceable rules:

1. **Design tokens first.** Phase 0 produces `design-tokens` (Tailwind theme extension): a named palette (~5 colors max: background, surface, primary text, muted text, one accent used ONLY for interactive elements and the user's own annotations), a type scale, spacing scale. Every component uses tokens; hex values outside the theme file are a lint error.
2. **Typography**: a characterful display face for company names and page titles, a clean body face, and a **tabular-numerals mono or semi-mono face for ALL numbers** (tables, stats, charts) — financial numbers must align vertically. Numbers are the protagonist of every screen; treat them typographically as such.
3. **Dark mode is the default theme** (terminals live in dark), light mode supported via tokens.
4. **Density over whitespace**: statement tables are compact (comfortable line-height ~1.4, not airy cards). Indian/Pakistani number formatting respected: lakh/crore display toggle for INR/PKR values (1,23,45,678 grouping), thousands/millions for USD.
5. **Color encodes meaning only**: positive/negative deltas (muted green/red, colorblind-safe), the accent for user's own inputs/annotations, everything else neutral. No decorative gradients, no glassmorphism, no glow.
6. **Charts are quiet**: thin lines, no drop shadows, muted grid, tooltips with exact values. Sparklines inline in tables.
7. **Every screen designed for its empty, loading, partial-data, and stale-data states** before its happy state. Stale (>48h) data always visibly flagged.
8. Quality floor: responsive to mobile, keyboard focus visible, `prefers-reduced-motion` respected.
9. One signature element, chosen in Phase 0 and used consistently: the **valuation range band** — a horizontal band visual showing the estimate range across models with a marker for current price. It appears on company pages, portfolio rows, and watchlists. It is the product's visual identity; polish it.

## Normalized data contracts

Metric vocabulary for stock snapshots (all nullable):
`price, currency, market_cap, pe, pb, eps_ttm, revenue_ttm, revenue_growth_yoy, gross_margin, op_margin, net_margin, fcf_ttm, debt_to_equity, roe, roic, shares_outstanding, dividend_yield, book_value_per_share`

Statement line items (per fiscal year, all nullable): income (`revenue, gross_profit, operating_income, net_income, eps`), balance (`total_assets, total_equity, total_debt, cash, shares_outstanding`), cashflow (`cfo, capex, fcf, dividends_paid`).

Ratios are COMPUTED at read time from statements/snapshots in `lib/analysis/ratios.ts` (pure functions) — never stored, never fetched.

Fund vocabulary: `nav, nav_date, scheme_category, fund_house, returns_1m, returns_1y, returns_3y_cagr, returns_5y_cagr` (returns computed from NAV series, not fetched).

Instrument identity: `instruments(id, kind: stock|fund|index, symbol, market: IN|PK|US, name, currency)`. Indian stocks keyed by yfinance symbol (`RELIANCE.NS`); funds by AMFI scheme code; PSX by ticker.

## Testing policy

Exhaustive unit tests REQUIRED on: `lib/analysis/ratios.ts`, every valuation model in `lib/valuation/` (hand-computed reference cases matched to the cent, null/negative-input cases returning "not applicable"), returns/CAGR math for funds, and provider normalization (fixture-driven, one fixture per market per instrument kind, including a broken/missing-fields fixture). Playwright smoke: add stock → statements render → valuation renders → add to portfolio. Skip tests for CRUD glue and styling. CI on every push; never merge red.

## Batch job discipline

- Daily job: prices/NAVs for tracked instruments only. Weekly job: statements refresh (statements change quarterly; don't hammer). Shuffle order, sleep 1.5s between yfinance calls, per-instrument try/except, 3 consecutive failures ⇒ `status = fetch_failing` + drop from rotation. Idempotent (upserts, append-only statements). `job_runs` summary row per run; operator webhook on failure (`ALERT_WEBHOOK_URL`).
- AMFI NAV data comes as one bulk file for ALL funds — fetch once, filter to tracked schemes. Do not call per-fund endpoints in a loop when the bulk file exists.
- PSX adapter (late phase) is scrape-based: extra defensive parsing, fixtures mandatory, degrade to "data unavailable" gracefully — never crash the run.

## Workflow rules for you (Claude Code)

- Execute PLAN.md phase by phase; never start a phase before the prior phase's acceptance criteria are demonstrated (run the commands, show output).
- Restate acceptance criteria at phase start; list anything you need from the user (accounts, secrets) before coding.
- Uncovered decision ⇒ simplest option consistent with constraints, logged in `DECISIONS.md` (date, decision, why). Feature ideas ⇒ `IDEAS.md`, never built unprompted.
- Ask before: new dependencies beyond trivial, schema changes after Phase 1, anything relaxing the valuation doctrine or UI mandate.
- Keep main deployable at all times; forward-only migrations committed with the code that needs them.

## Environment variables (.env.example, never commit values)

`DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, SENTRY_DSN, ALERT_WEBHOOK_URL, CRON_SECRET`
