# IDEAS.md

Out-of-scope ideas land here instead of being built (CLAUDE.md workflow rule).
Nothing here is committed roadmap.

Seeded from CLAUDE.md/PLAN.md out-of-scope list: AI features · recommendations/scores · screeners · broker/CSV import · intraday data · currency conversion & consolidated net worth · XIRR/benchmarking · dividends tracking · options/crypto · fund holdings overlap · mobile app · multi-language.

---

# Review — 2026-07-26: what to add next, for retail and new retail investors

A walk through every screen with one question: what does someone who is not a
professional analyst need that Sarmaya does not give them? Ordered by value,
not by effort. Items marked **[scope]** contradict the v1 out-of-scope list
above and would need a deliberate decision.

## 0. Correctness gap that outranks every feature below

**Corporate actions — splits, bonus issues, rights.** Nothing in the codebase
handles them (`grep split|bonus` finds only string helpers). Provider prices
come back split-adjusted; the quantity in `journal_entries` does not. So the
day after a 1:1 bonus or a 1:5 split, `computeHoldings` returns the old share
count against a new, lower price: market value collapses, average cost is
wrong, unrealised P/L is fiction, and every `price_vs_estimate` rule
misfires. Indian issuers do this constantly — a long-term holder, which is
precisely this product's user, will hit it.

Shape of the fix: a `corporate_actions` table (instrument, ex-date, type,
ratio) filled by the weekly job, applied to journal-derived holdings at read
time, with the adjustment shown in the journal rather than silently applied
("2 Jul 2026 · 1:1 bonus · 10 → 20 shares, average cost halved"). Until then
the honest stopgap is a banner on any holding whose price moved more than
~35% in one session, asking the user to check for a corporate action.

## 1. Highest value for the target user

**Explain every number, in place.** The valuation models already have
"how it works" popovers; key figures and ratios have none. A new investor
reads "ROIC 14.2%" and learns nothing. Each metric wants three sentences:
what it is in plain language, how Sarmaya computed it (ours is a pre-tax
proxy — say so), and how it misleads (ROE flatters a leveraged balance
sheet). This is education, not advice, so it sits inside the doctrine
perfectly, and it is the single cheapest thing that makes the terminal usable
by someone learning. Pairs with a `/glossary` page.

**Give each number its own history as context.** "P/E 23" is meaningless
alone, and peer comparison needs a screener we deliberately do not have. The
honest alternative is self-context: show each key figure against that
company's own 5-year range — a thin band with the current value marked, the
RangeBand component doing a second job. No peer data, no verdict, just "this
is high or low _for this business_". Strong, doctrine-safe, and reuses the
signature element.

**Fund fundamentals beyond NAV.** Most South Asian retail money is in funds,
and Sarmaya currently shows a fund's NAV, returns and nothing else. The
number that actually decides a fund choice is the expense ratio, then AUM,
exit load and category. AMFI/SEBI disclose these free. Right now the app can
tell you a fund returned 14% but not that it charged you 1.8% to do it.

## 2. What retail asks for the moment the basics work

**Benchmark comparison [scope].** "Am I doing better than just buying the
index?" is the first question every retail investor asks, and the indices are
already tracked and priced in our own database. Value-weighted portfolio
return vs NIFTY 50 / KSE-100 since the first journal entry. Listed as
out-of-scope in v1; for this audience I would promote it.

**XIRR [scope].** Once SIPs exist, simple return is actively misleading —
money invested last month is weighted the same as money invested five years
ago. Anyone running a SIP is being shown a number that flatters or maligns
them for no reason. If benchmarking gets promoted, this comes with it.

**Realised P/L bucketed by holding period.** Sells are recorded but never
summarised. A per-financial-year view of realised gains, split by how long
each lot was held, is what people need at tax time. Deliberately stop at the
bucketing — the app should not compute a tax liability or quote rates, which
change and differ per market.

**Dividends received.** A real part of total return that is currently
invisible: `dividends_paid` in the statements is the _company's_ outflow, not
the user's receipt. A `dividend` journal kind, and income shown alongside
unrealised P/L.

**CAS / broker CSV import [scope].** The largest onboarding wall in the
product. Nobody hand-types three years of transactions, so today a new user
sees an empty portfolio and leaves. A CDSL/NSDL CAS parser (the same
defensive, fixture-driven treatment as the PSX adapter) would turn a
twenty-minute chore into one upload. This is the difference between a tool
the owner uses and a product other people can start using.

## 3. Behaviour — the product's actual thesis, pushed further

**A thesis review queue.** The data already exists and the overview now
surfaces "not reviewed in 90 days", but there is nowhere to _do_ the review.
A page that walks the due list one at a time: the thesis, what changed since
you last looked (price, the two or three metrics it depends on), and a box
for a one-line verdict that stamps `last_reviewed_at`.

**Decision retrospectives.** Sarmaya knows what you bought, when, and why —
nothing else does. "Fourteen months ago you bought this because retail
margins would expand. Margins went 8.1% → 7.4%. Still true?" No product in
this space closes that loop, and it is the most defensible thing here.

**A pre-trade checklist.** User-authored questions that appear when recording
a buy. The mandatory "why" already exists; this makes it a considered why
rather than a typed one. Strictly the user's own questions — the app must not
supply a checklist, or it becomes advice.

## 4. Smaller gaps noticed while working

- **Fund and index labelling** — the overview now leads with the fund name,
  but `/instruments`, `/portfolio` and `/journal` still show the bare AMFI
  scheme code as the identity. Same fix, three more screens.
- **Simple price alerts.** Thesis rules are powerful but demand that the user
  already think in metrics. "Tell me if it falls 20% from here" is the
  gateway version, and the alert engine already supports `price`.
- **Search universe.** NSE 500 + indices + US direct symbols only: BSE-only
  and small-cap names cannot be added except by hand.
- **Instrument page order.** Valuation sits above the statements it is
  derived from. For someone learning, statements → ratios → valuation is the
  order the thinking actually happens in.
- **Empty portfolio → first holding.** The overview's empty state points at
  `/instruments`, but the path from "tracking something" to "recording what I
  own" is still four clicks and a collapsed form.
