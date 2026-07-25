# DESIGN.md — Sarmaya design plan

The brief (CLAUDE.md UI mandate): **calm, dense, precise — a professional
instrument, not a dashboard toy.** Numbers are the protagonist. Dark is home.

## Voice

Sarmaya (سرمایہ / "capital") should feel like a well-made ledger crossed with a
terminal: ink-on-slate surfaces, one disciplined accent reserved for _the
user's own hand_ (their inputs, their annotations, their estimates), and
everything else neutral. Nothing decorative. If an element doesn't help read a
number, it goes.

## Palette (the ONLY hex values allowed; everything else references tokens)

Dark (default) — cool graphite, not pure black; borrowed from ledger paper
inverted:

| token       | hex       | role                                                                            |
| ----------- | --------- | ------------------------------------------------------------------------------- |
| `bg`        | `#101418` | page background                                                                 |
| `surface`   | `#171c22` | cards, tables, panels (+`surface-2` #1e242c derived for insets/hover)           |
| `ink`       | `#e6e9ec` | primary text & numbers                                                          |
| `ink-muted` | `#8b949e` | labels, captions, secondary text                                                |
| `accent`    | `#d9a44a` | brass — ONLY interactive elements + the user's own annotations/inputs/estimates |

Light — the same ledger, right side up: bg `#f4f2ed` (paper), surface
`#fdfcfa`, ink `#20262c`, ink-muted `#6a7178`, accent `#8a6420` (brass, deepened
for contrast on paper).

Semantic (meaning-only, colorblind-safe pairing — blue-leaning green vs
orange-leaning red, never the only carrier of meaning: deltas always render
sign characters):

- `pos` — dark `#4cc38a` / light `#18794e`
- `neg` — dark `#f0776d` / light `#c4392e`
- `warn` (stale flags) — dark `#e0a24a` / light `#8f5a10`

Rationale for brass over the obvious teal/blue: this is a money instrument
with South Asian roots — brass reads as scale-weights and ledgers, it is
warm against the graphite without being loud, and it can't be confused with
the pos/neg semantics. Accent discipline is the whole trick: when only the
user's own thinking is gold, the screen tells you at a glance what the
machine fetched vs what _you_ decided.

## Type roles (all Google Fonts, free)

| role    | face                                                        | why                                                                                                    |
| ------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| display | **Zodiak fallback → "Instrument Serif"** (`--font-display`) | company names & page titles get a single characterful serif moment; everything else stays instrumental |
| body    | **Inter** (`--font-body`)                                   | invisible, dense-friendly, superb at 13–14px                                                           |
| numeric | **JetBrains Mono** (`--font-numeric`)                       | true tabular alignment for ALL numbers; distinct enough from Inter that data reads as data             |

Scale (dense): 12 / 13(base) / 14 / 16 / 20 / 28 / 40. Body line-height 1.4.
Statement tables run at 13px numeric with 1.4 line-height — compact, never
cramped. Spacing scale: Tailwind default halved in tables (py-1.5 cells).

## The signature: RangeBand

One horizontal band, everywhere valuations live (stock header, portfolio
rows, watchlist):

```
   low ──────█████████████████────── high
   1,240            ▲price 1,610       2,180
             models: DCF · EPV · Graham
```

- Track: full-width hairline in `line` color (derived border tone).
- Band: the min→max span of the user's applicable model outputs, filled in
  translucent **accent** (it is the user's estimate — it wears their color).
- Marker: current price as a vertical tick in `ink`; label beneath.
- Low/high labels at the band ends, numeric face, 12px.
- Degradations designed first: no valuations → component absent (never an
  empty track); one model → a single tick labeled with the model name; price
  outside the band → marker sits outside, track extends to include it.
- Compact variant (portfolio/watchlist rows): 96×12px, no labels, tooltip
  carries the numbers.

## States before happy paths

Every base component ships with: null (`—`, never NaN), negative (sign +
`neg` color + parentheses option for accountants later — v1 sign only),
loading (skeleton, `motion-reduce` honored), stale (`StaleBadge`: warn dot +
"as of {date}"), empty (EmptyState: one sentence + one action, no
illustration clutter).

## Number formatting

`formatMoney(value, currency, style)`:

- INR/PKR `lakh-crore`: en-IN grouping — `₹1,23,45,678` / `Rs 12,34,567`
- INR/PKR `compact`: `₹1.23Cr`, `₹45.6L`, `₹12.3K`
- USD `lakh-crore` falls back to US grouping (`$1,234,567` — lakh/crore is
  an INR/PKR concept); USD `compact`: `$1.23B/M/K`
- Negatives: sign before symbol (`-₹1,23,456`). Null → `—`. Display-only —
  no arithmetic ever happens in formatters.

## Self-review against the mandate

- ~5 colors ✓ (bg, surface, ink, ink-muted, accent; pos/neg/warn are semantic,
  not palette decoration). Accent strictly interactive/user-authored ✓.
- Generic-check: the first draft used a blue accent and Space Grotesk display —
  rejected as "SaaS dashboard default." Brass + a single serif moment +
  mono-everywhere-numeric is the corrected, ownable answer.
- Density ✓ (13px/1.4 tables), lakh/crore first-class ✓, dark default ✓,
  charts quiet (Phase 3 consumes these tokens) ✓, reduced-motion ✓.
