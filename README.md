# Sarmaya

A personal investment research terminal for South Asian retail investors —
study businesses in depth, value them with multiple models (your assumptions,
never ours), manage a multi-currency portfolio, and record your thinking.

Read [CLAUDE.md](./CLAUDE.md) (rules, valuation doctrine, UI mandate) and
[PLAN.md](./PLAN.md) before working on this repo. Design system:
[DESIGN.md](./DESIGN.md), live at `/styleguide`. Decisions log:
[DECISIONS.md](./DECISIONS.md).

## Architecture in one paragraph

Next.js App Router on Vercel reads only our own Postgres (Supabase) — never an
external data source at request time (single exception: one quick quote when
an instrument is first added). Python jobs on GitHub Actions populate the
cache: `jobs/daily.py` (prices, NAVs, snapshots — IN/US via one adapter, PK
via the PSX portal, funds via ONE bulk AMFI fetch) and `jobs/weekly.py`
(financial statements, append-only so history accumulates). The daily job then
calls `POST /api/cron` (Bearer `CRON_SECRET`) where the single TypeScript
alert engine evaluates thesis rules — including "price vs your estimate low" —
records deduped alert events, and emails via Resend. Auth is Supabase magic
links; every user-owned table has RLS.

## Local setup

```bash
nvm use && npm install
cp .env.example .env.local            # fill in Supabase values
npm run dev                            # http://localhost:3000

python3 -m venv .venv && .venv/bin/pip install -r jobs/requirements.txt
DATABASE_URL=... npx drizzle-kit migrate   # apply migrations
node scripts/check-rls.mjs                 # prove user isolation
```

## Scripts

| Command                 | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Dev server                                            |
| `npm run build`         | Production build                                      |
| `npm run typecheck`     | `tsc --noEmit`                                        |
| `npm run test`          | Vitest (ratios, valuation, returns, holdings, engine) |
| `npm run test:coverage` | Alert-engine branch coverage (must stay 100%)         |
| `npm run test:e2e`      | Playwright journey against a production build         |
| `pytest jobs`           | Adapter tests against recorded fixtures               |

## Deploy

1. Push to GitHub; import in Vercel (Next.js preset, zero config). Set env
   vars from `.env.example` (all except `DATABASE_URL`/`ALERT_WEBHOOK_URL`).
2. GitHub repo → Settings → Secrets → Actions: `DATABASE_URL`,
   `APP_BASE_URL`, `CRON_SECRET`, `ALERT_WEBHOOK_URL`.
3. Supabase → Auth → URL Configuration: Site URL = the Vercel URL; add
   `http://localhost:3000/**` to redirect URLs.
4. Resend: create an API key (`RESEND_API_KEY`); with no verified domain it
   delivers only to your own address — fine for a personal terminal.

## Operations runbook

**A job failed (webhook fired / Actions red).** Open the run log; look for
`[job]` lines. One bad instrument never kills a run — failures increment
`instruments.consecutive_failures`; at 3 the instrument is quarantined
(`status='fetch_failing'`) and dropped from rotation. Un-quarantine:

```sql
update instruments set status='active', consecutive_failures=0 where symbol='XYZ';
```

Re-running any job for the same day is safe (idempotent upserts; statements
append-only). Manual run: Actions → daily/weekly → Run workflow.

**`/api/health` returns 500.** 200 only when the newest snapshot is < 48h
old — point an uptime monitor here. Check `job_runs`
(`select * from job_runs order by started_at desc limit 5`) then Actions logs.

**A data source broke.** Record the failing raw response as a fixture FIRST
(each adapter has `--record-fixture`), then fix the parser until
`pytest jobs` is green. The PSX portal is scrape-based and the most fragile —
its parser must always degrade to "data unavailable", never crash.

**Adding a market adapter.** Implement `fetch_raw_snapshot`,
`fetch_raw_statements`, `fetch_price_history` in
`jobs/providers/<name>_provider.py`; route the market in
`jobs/providers/__init__.py`; record fixtures + tests; extend the in-repo
symbol list and `lib/catalog.ts`. Nothing outside the adapter layer may
mention the provider (grep-enforced).

**Duplicate breach emails should be impossible**: dedup is the partial unique
constraint on `(thesis_id, fired_on)` plus intact↔breached state tracking.
Check `select * from alert_events where thesis_id='...' order by fired_on`.

**Hand-kept data.** Two escape hatches for what the free sources can't reach:

- _Your own statement figures_ — "Add figures by hand" under Statements on any
  stock. They land in `manual_statements` (user-owned, RLS) and are overlaid on
  the provider's rows field by field at read time: a blank field keeps the
  fetched figure, a filled one wins and is marked with a dotted underline. Jobs
  cannot clobber them; other users never see them. Use it for the years
  yfinance doesn't reach back to, and for PSX, which has no statements at all.
- _Hand-kept instruments_ — "Add a company by hand" on `/instruments` for an
  unlisted or uncovered company. `instruments.is_manual = true`, which excludes
  it from both batch jobs (`tracked_instruments` filters on it). Its price is
  typed on the instrument page and written through the normal
  `snapshots` + `price_history` path, so charts, valuation and portfolio need no
  special case. Ratios and all four valuation models compute from typed figures
  exactly as they do from fetched ones.
