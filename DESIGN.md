# DESIGN.md — Sarmaya design plan

## v3 "Midnight, Violet & Gold" (owner review, 2026-07-26) — CURRENT

The owner reviewed v2 and asked for a modern theme with at least three
distinct colours and generous gradients, suited to business/investment, and
easier to read. That overrides v2's "~5 colours, no decorative gradients,
density over whitespace". Everything else — tokens-only hex, dark default,
tabular numerals, the RangeBand signature, colour-means-something — stands.

**Three brand hues, each with a job.** Blue is interactive. Violet is data
visualisation. Gold is the user's own hand — their inputs, annotations,
estimates, manual figures and hand-kept instruments. Green and red stay
reserved for gain and loss, which is why no brand hue comes from those
families.

| token          | dark                              | light                             | role                                     |
| -------------- | --------------------------------- | --------------------------------- | ---------------------------------------- |
| `background`   | `#0a0f1e`                         | `#f4f6fc`                         | deep navy page                           |
| `surface`      | `#141c33`                         | `#ffffff`                         | raised panels                            |
| `surface-2`    | `#1e2745`                         | `#eef2fb`                         | insets, hover, chips                     |
| `ink`          | `#eef2ff`                         | `#0f172a`                         | text and numbers                         |
| `ink-muted`    | `#a3aecc`                         | `#515e85`                         | labels (contrast raised from v2)         |
| `line`         | `#2a3559`                         | `#dae1f2`                         | hairlines                                |
| `brand`        | `#4f7df9`                         | `#3b5fe0`                         | interactive, primary actions             |
| `violet`       | `#a78bfa`                         | `#7c3aed`                         | charts, sparklines, second gradient stop |
| `gold`         | `#f0b429`                         | `#b4790b`                         | **the user's own hand** — never chrome   |
| `pos/neg/warn` | `#34d399` / `#fb7185` / `#fbbf24` | `#067a52` / `#d92d20` / `#a05a08` | gain / loss / stale                      |

**Gradients** (`--grad-*`, exposed as utilities): `grad-brand`
(blue→violet) on the portfolio hero edge, primary buttons, the active nav
rail, page titles (`text-grad-brand`) and the RangeBand; `grad-gold` on
every control that writes the user's own data; `grad-surface` /
`grad-shell` for panel and chrome depth; and an SVG area fill in the price
chart, where the gradient genuinely carries information (magnitude fading
to nothing) rather than decorating.

**Type**: body 15px / 1.55 (was 13px / 1.4). Scale redefined at the theme
level — `--text-xs` 13px, `--text-sm` 15px, `--text-lg` 19px, `--text-2xl`
28px — so `text-xs` grows everywhere at once. Nothing below 12px except one
superscript annotation marker. Table rows `px-4 py-2.5`; cards `p-5`;
radius base 0.625rem with `rounded-xl` panels.

**Press feedback** is part of the design, not an afterthought: `.pressable`
dips and darkens on `:active`, `.pressable-row` for list rows,
`SubmitButton` (`useFormStatus`) disables and spins while a server action is
in flight, and nav links show a spinner via `useLinkStatus`. All of it
respects `prefers-reduced-motion`.

> **Do not add a `loading.tsx` under `app/(app)/`.** It was tried and
> reverted: the Suspense boundary it creates re-suspends whenever a server
> action calls `revalidatePath`, and inside a `useTransition` that pending
> state never settles — every save button in the app stuck on "Saving…"
> forever while the write had actually succeeded. `useLinkStatus` gives the
> same navigation feedback without a boundary.

---

## v1/v2 (superseded — kept for the record)

The brief (CLAUDE.md UI mandate): **calm, dense, precise — a professional
instrument, not a dashboard toy.** Numbers are the protagonist. Dark is home.

## Voice

Sarmaya (سرمایہ / "capital") should feel like a well-made ledger crossed with a
terminal: ink-on-slate surfaces, one disciplined accent reserved for _the
user's own hand_ (their inputs, their annotations, their estimates), and
everything else neutral. Nothing decorative. If an element doesn't help read a
number, it goes.

## v2 revision (owner review)

The v1 editorial direction (Instrument Serif + warm paper/brass) was reviewed
by the owner and rejected as reading like print ("newspaper"). v2 keeps every
structural rule (tokens-only hex, density, dark default, mono numerals, accent
discipline, the RangeBand signature) and re-skins: **Space Grotesk** display,
cool **slate** neutrals, **blue** accent. An app shell (sidebar + topbar) is
part of the design system so the product reads as a terminal from day one.

## Palette v2 (the ONLY hex values allowed; everything else references tokens)

Dark (default): bg `#0b0e12`, surface `#12161d` (+`#19202a` inset), ink
`#e8ecf1`, ink-muted `#929eac`, line `#232c38`, accent (blue) `#5b9dff`.
Light: bg `#f6f7f9`, surface `#ffffff`, ink `#18202b`, ink-muted `#5f6b78`,
line `#dfe4ea`, accent `#2e6fe8`. Semantic: pos `#4cc38a`/`#178a53`, neg
`#f0776d`/`#c43d32`, warn `#e0a24a`/`#8f5a10`.

Type roles v2: display **Space Grotesk**, body **Inter**, numeric
**JetBrains Mono** (unchanged — numbers stay the protagonist).

## Palette v1 (superseded — kept for the record)

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
