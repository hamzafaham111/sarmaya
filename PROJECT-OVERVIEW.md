# Sarmaya — complete project overview

_A briefing document. Written to be handed to someone (or something) with no
prior context, so they can discuss what to build next without needing to read
the codebase first._

Last updated: 2026-07-26. ~15,000 lines of TypeScript/Python across the app,
analysis layer, jobs and tests.

---

## 1. What this is

**Sarmaya** (سرمایہ — "capital") is a personal investment **research
terminal** for South Asian retail investors: India first, Pakistan second, US
tickers as a bonus. It is not a broker, not a screener, and not a
recommendation engine. It is a place to study businesses in depth, value them
with several models, track what you own, and — most distinctively — record
_why_ you made every decision.

**Primary user:** the owner-developer, a single power user. Multi-user
architecture exists from day one (row-level security on every user-owned
table) so it could become a product later without rework.

**Three instrument kinds, deliberately treated differently:**

| Kind      | Gets                                                                       | Does not get                        |
| --------- | -------------------------------------------------------------------------- | ----------------------------------- |
| **Stock** | Full statements, ratios, four valuation models, thesis, annotations, notes | —                                   |
| **Fund**  | NAV history, returns/CAGR, fund facts, SIP-aware holdings                  | Valuation models (they don't apply) |
| **Index** | Price history, returns, benchmark context                                  | Not holdable in v1                  |

---

## 2. The doctrine — the rules that define the product

These are not preferences. They are in `CLAUDE.md` and they override
convenience.

### No advice, ever

No buy/sell recommendations, no predictions, no scores, no AI opinions on
securities. The app presents facts and the user's own reasoning; it never
suggests an action.

### The valuation doctrine

1. Every stock gets **four independent models side by side** — DCF, Graham
   number, EPV, Reverse DCF. Results display as a **range band** against the
   current price. Never a single blended number, never an average presented as
   "the value".
2. Every model input is **visible and user-overridable**. Auto-seeded defaults
   come from the company's own history and are labelled "auto — edit me".
3. Reverse DCF answers "what growth does the current price imply?" and shows
   it against actual history.
4. **Forbidden copy** anywhere in UI, comments or emails: "true value", "fair
   value is" (unprefixed), "undervalued", "overvalued", "we estimate", plus
   bare "buy"/"sell" as instructions. Grep-enforced.
5. A model lacking inputs renders "not applicable — [reason]", never a garbage
   number.

### Data honesty

Free sources give ~4–5 years of statements. Store every year available and
every new year thereafter (append-only) so history accumulates. **Never
fabricate or interpolate.** Missing data renders as an em dash, never zero,
never NaN. Stale data (>48h) is visibly flagged.

### Hard constraints

- **₹0 infrastructure and ₹0 data.** Free tiers only. No paid dependency or
  API without asking.
- **The app never calls external sources at request time**, with one
  exception: adding a new instrument may do one synchronous fetch.
- **All external data flows through the adapter layer.** Nothing outside
  `lib/providers/` and `jobs/providers/` may mention yfinance, AMFI or PSX.
- **Money is `numeric` in Postgres and decimal-safe in TS** (big.js). No float
  arithmetic on money.
- **Multi-currency from day one, never converted.** Portfolio totals are shown
  per currency bucket. INR and USD holdings are never added together.
- **RLS on every user-owned table** from day one.

---

## 3. Stack

- **Next.js 16** (App Router), TypeScript strict, **Tailwind v4**, shadcn/ui
- **Supabase** — Postgres, Auth (magic link), RLS
- **Drizzle ORM** + drizzle-kit migrations
- **Recharts** for all charts
- **Python 3.11** in `/jobs` only (yfinance, AMFI, PSX fetchers)
- **GitHub Actions** for scheduled jobs; **Resend** + react-email; **Sentry**
- **Vitest** (unit) + **Playwright** (e2e)
- Deployed on Vercel

---

## 4. Data model

Shared market data (readable by any signed-in user, written only by jobs):

| Table           | Holds                                                                    |
| --------------- | ------------------------------------------------------------------------ |
| `instruments`   | id, kind, symbol, market (IN/PK/US), name, currency, status, `is_manual` |
| `snapshots`     | one row per instrument per day; the metric vocabulary as JSONB           |
| `statements`    | per instrument × fiscal year × statement kind, append-only               |
| `price_history` | daily closes for stocks and indices                                      |
| `nav_history`   | daily NAVs for funds                                                     |

User-owned (RLS: `user_id = auth.uid()`):

| Table               | Holds                                                          |
| ------------------- | -------------------------------------------------------------- |
| `user_instruments`  | what you track, plus markdown notes                            |
| `manual_statements` | **your own** statement figures, overlaid on the provider's     |
| `valuations`        | your assumptions per instrument per model                      |
| `theses`            | your written statements, optional alert rule, review timestamp |
| `journal_entries`   | buy/sell/sip/note with **mandatory** ≥10 chars of reasoning    |
| `annotations`       | notes attached to a specific statement cell or metric          |
| `alert_events`      | fired alerts, deduped by a partial unique index                |

Operator-only: `job_runs`.

**Metric vocabulary** (all nullable): `price, currency, market_cap, pe, pb,
eps_ttm, revenue_ttm, revenue_growth_yoy, gross_margin, op_margin, net_margin,
fcf_ttm, debt_to_equity, roe, roic, shares_outstanding, dividend_yield,
book_value_per_share`.

**Statement line items** (all nullable): income (`revenue, gross_profit,
operating_income, net_income, eps`), balance (`total_assets, total_equity,
total_debt, cash, shares_outstanding`), cashflow (`cfo, capex, fcf,
dividends_paid`).

**Ratios are never stored.** They are computed at read time by pure functions
in `lib/analysis/ratios.ts`.

---

## 5. What exists today, screen by screen

### Overview (`/`)

Rebuilt to answer three questions in order:

1. **What is my money doing** — a card per currency bucket: market value,
   today's value-weighted move, invested, unrealised P/L, return, and the
   share of stock value carrying a breached thesis.
2. **Does anything need me** — a "Needs attention" panel: breached theses,
   quarantined instruments, stale data, holdings excluded from totals for want
   of a price, theses past their 90-day review. Renders nothing when nothing is
   wrong.
3. **What moved** — biggest absolute moves today with sparklines, plus the
   last five journal decisions with their reasoning.

Plus a weighted "your stocks as one business" strip (weighted P/E, ROE, D/E).

### Instruments (`/instruments`)

Search and add from a static in-repo catalog (NSE 500, indices, US tickers by
direct symbol, PSX list, ~1.7k open-ended direct-growth mutual fund schemes).
Adding does one synchronous first fetch. Also "add a company by hand" for
anything no provider covers. Rows show price, day change, sparkline, kind,
stale badge.

### Instrument page (`/i/[id]`) — the core screen

Kind-aware. A stock gets:

- **Header** — name, price, day change, stale badge, hand-kept badge
- **Key figures** — market cap, P/E, P/B, earnings yield, FCF yield, dividend
  yield; then revenue, growth, EPS, FCF, three margins, ROE, ROIC, D/E, book
  value/share, shares out. Kept separate from the ratio table because these are
  TTM and those are per fiscal year.
- **Valuation** — four model cards with editable, auto-seeded assumptions and
  an honest "how it works" popover each; the RangeBand across applicable models
  with the price marked
- **Statements** — three tabs, years across columns, YoY toggle, every cell
  annotatable, "data since YYYY", plus **manual entry** for years or markets the
  source can't reach
- **Thesis** — statements with optional alert rules
- **Trends** — small-multiple charts per metric
- **Ratios** — per-year table grouped as profitability / returns on capital /
  leverage / cash & efficiency / per shareholder, each with a sparkline
- **Journal** — record buy/sell/SIP/note with mandatory reasoning
- **Notes** — autosaved markdown

Funds get NAV chart, returns table and facts — no valuation, no statements.
Indices get price and returns.

### Portfolio (`/portfolio`)

Journal-derived holdings, per currency bucket, never summed across
currencies. Quantity, average cost, price, market value, unrealised P/L,
weight. Value-weighted "one business" aggregates with a footnote counting
excluded nulls. Thesis-health rollup.

### Journal (`/journal`)

Every decision across all instruments, newest first, with the reasoning.

### Learn (`/learn`) — new

A documentation-style course, **public** (no sign-in needed) since it holds no
user data. Nine sections, ~45 articles, ~6.5 hours of reading: a staged
roadmap with checkpoints, what you can own, studying a business (income
statement line by line, margins and pricing power, quality of earnings,
finding ideas, a repeatable study process), valuation, the investors worth
studying (Graham, Fisher, Buffett, Munger, plus Lynch/Bogle/Templeton/Marks
and the Indian lineage), building a portfolio, behaviour and process
(including a market-history article: 1929, Nifty Fifty, Harshad Mehta,
dot-com, 2008, COVID, KSE-100 cycle), market mechanics with an India+Pakistan
tax primer, and an A–Z glossary. Sidebar with numbered sections and instant
filter, an "On this page" outline on wide screens, prev/next navigation,
"read next" links, and primary-source quotes from the masters woven through
the articles.

The deep-dive articles are built on **real, primary-source figures**, verified
against the documents: Infosys FY2025 audited results (both Ind-AS ₹-crore and
IFRS USD presentations, from the SEC-filed exchange release), See's Candies
economics from the Berkshire 2007 letter, Coca-Cola/AmEx from the 2022 letter,
the Satyam fraud figures from Raju's 2009 confession letter (SEC exhibit), and
HUL/Tata Steel decade margins from consolidated filings.

Content is **data, not markup** — `lib/learn/content/*.ts` with a typed block
union (paragraph, heading, list, table, note, formula, quote, term list).
Adding an article means writing an object; no component changes.

### Email

Breach alerts and a weekly digest via Resend + react-email.

---

## 6. Jobs and data pipeline

- **Daily** — snapshots and prices for tracked instruments only. Shuffled
  order, 1.5s sleep between yfinance calls, per-instrument try/except, three
  consecutive failures ⇒ `status = fetch_failing` and dropped from rotation.
- **Weekly** — statements refresh (they only change quarterly).
- **AMFI** — one bulk NAV file for all funds, filtered to tracked schemes.
  Never a per-fund loop.
- **PSX** — scrape-based, defensive parsing, fixtures mandatory, degrades to
  "data unavailable" rather than crashing.
- Both jobs write a `job_runs` summary; failures hit an operator webhook.
- `/api/cron` (CRON_SECRET-guarded) runs alert evaluation at the end of the
  daily job. `/api/health` returns 200 only if the newest snapshot is <48h old.
- Hand-kept instruments (`is_manual`) are excluded from both jobs.

---

## 7. Design system (v3, "Midnight, Violet & Gold")

Three brand hues, each with a job: **blue** interactive, **violet** data
visualisation, **gold** reserved for the user's own hand (inputs, annotations,
estimates, manual figures, hand-kept instruments). Green/red stay reserved for
gain/loss, so no brand hue comes from those families.

Gradients on the portfolio hero, primary buttons, active nav rail, page
titles, the RangeBand and chart area fills. Body text 15px/1.55. Dark is the
default; light is fully supported. Every clickable element has a press state;
server-action buttons show pending state; nav links show a spinner.

**The signature element** is the **RangeBand** — a horizontal band spanning
the min→max of applicable model outputs, wearing the brand gradient, with the
current price as a marker. It appears on stock pages and portfolio rows.

---

## 8. Testing

- **146 unit tests** (Vitest) — exhaustive on `lib/analysis/*` (ratios,
  returns, holdings, portfolio, key figures, statement merge, overview logic)
  and `lib/valuation/*` (hand-computed reference cases to the cent, null and
  negative inputs returning "not applicable").
- **28 Python tests** — provider normalisation, fixture-driven, one fixture per
  market per kind including deliberately broken ones.
- **4 Playwright e2e** — the public Learn page and theme contract; the
  unauthenticated redirect; a long authenticated journey (sign in → add stock →
  statements → key figures → valuation edit → annotation → notes → add fund →
  journal → portfolio); and a hand-kept journey (create → price → type
  statements → ratios compute).
- CI on every push. Never merge red.

---

## 9. Known gaps and open decisions

Ordered by how much they matter. Full detail in `IDEAS.md`.

### The correctness gap that outranks everything

**Corporate actions are not handled at all.** Provider prices come back
split-adjusted; the quantity in `journal_entries` does not. After a 1:1 bonus
or a 1:5 split, holdings show the old share count against the new price —
market value collapses, average cost is wrong, unrealised P/L is fiction, and
price-based alert rules misfire. Indian issuers do this constantly. This is a
bug wearing a feature's clothes.

### Highest value for the target user

- **Explain every number in place** — key figures and ratios have no "what is
  this?" popovers; the valuation models do. Three sentences each: what it is,
  how we compute it, how it misleads. Now partly addressed by `/learn`, but not
  yet linked from the numbers themselves.
- **Self-context for each metric** — show each figure against that company's
  own 5-year range, reusing the RangeBand. No peer data needed, no verdict
  given.
- **Fund fundamentals beyond NAV** — expense ratio, AUM, exit load, category.
  Most South Asian retail money is in funds and the app currently can't tell
  you what a fund charges.

### Would need reversing a v1 scope decision

- **Benchmark comparison** — "am I beating NIFTY?" The indices are already in
  the database. The most-asked retail question.
- **XIRR** — simple return actively misleads anyone running a SIP.
- **CAS / broker CSV import** — the biggest onboarding wall; nobody hand-types
  three years of transactions.
- **Dividends received** — currently invisible; `dividends_paid` is the
  company's outflow, not the user's receipt.

### Process features that fit the product's thesis

- **A thesis review queue** — the overview flags "not reviewed in 90 days" but
  there is nowhere to actually do the review.
- **Decision retrospectives** — "14 months ago you bought this because X; here
  is what X did since." Nothing else in the market has this data.
- **A pre-trade checklist** — user-authored questions shown when recording a
  buy.

### Smaller

Fund/index labelling still shows raw AMFI scheme codes on
`/instruments`, `/portfolio` and `/journal` (fixed on the overview only).
Simple price alerts as a gateway to thesis rules. Search universe is NSE 500 +
indices + US only. Instrument page puts valuation above the statements it
derives from. The path from "tracking" to "recording what I own" is still four
clicks and a collapsed form.

---

## 10. Performance notes

A round trip to the Supabase pooler costs **~400ms from the developer's
location**. The code originally made one per instrument in several places,
so page time scaled with watchlist size. That is fixed — snapshots batch via
`DISTINCT ON`, series batch in one query, and the proxy forwards the identity
it already verified rather than every page re-calling `getUser()`.

Remaining latency is dominated by that ~400ms round trip, which is
geographic. Deployed on Vercel in the same region as the database it should
fall to tens of milliseconds. `SQL_DEBUG=1` logs every statement with a
timestamp when a screen feels slow.

**Do not add a `loading.tsx` under `app/(app)/`.** It was tried and reverted:
its Suspense boundary re-suspends on every `revalidatePath`, and inside a
`useTransition` the pending state never settles — every save button in the app
stuck on "Saving…" while the write had actually succeeded.

---

## 11. Repository map

```text
app/
  (app)/            authenticated routes — overview, instruments, i/[id],
                    portfolio, journal; server actions live beside their pages
  learn/            public documentation section
  api/              cron (alerts) and health
  globals.css       THE ONLY FILE WITH HEX VALUES (email templates excepted)
lib/
  analysis/         pure, exhaustively tested: ratios, returns, holdings,
                    portfolio, key-figures, statements merge, overview
  valuation/        dcf, graham, epv, reverse_dcf — pure, decimal-safe
  alerts/           pure rule engine (100% branch coverage)
  db/               drizzle schema, migrations, query modules
  learn/            curriculum content as typed data
  providers/        TS-side adapter types + the one request-time quick quote
components/
  base/             StatValue, DeltaValue, DataTable, Sparkline, RangeBand,
                    StaleBadge, EmptyState, SubmitButton, button styles
  learn/            documentation renderer and sidebar
  shell/            app shell and nav
jobs/               Python: daily.py, weekly.py, providers/, fixtures/
```

Key documents: `CLAUDE.md` (the rules), `PLAN.md` (the original phase plan,
all 8 phases complete), `DESIGN.md` (design system v1→v3), `DECISIONS.md`
(one line per decision with the why), `IDEAS.md` (out-of-scope ideas and the
retail-investor review), `README.md` (setup + operations runbook).

---

## 12. Good questions to discuss next

- Is the corporate-actions gap worth fixing before any new feature? (My view:
  yes — it silently corrupts the numbers the whole app is built on.)
- Should the v1 "no benchmarking, no XIRR, no CSV import" scope decisions be
  reversed now that the audience is explicitly retail investors?
- Does `/learn` need to be linked contextually from each metric, or is a
  standalone course enough?
- Is this staying a single-user tool, or becoming a product? That decision
  changes the priority of onboarding, import, and multi-user polish more than
  anything else on the list.
