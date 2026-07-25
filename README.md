# Sarmaya

A personal investment research terminal for South Asian retail investors —
study businesses, value them with your own assumptions, record your thinking.

Read [CLAUDE.md](./CLAUDE.md) (rules, doctrine, UI mandate) and
[PLAN.md](./PLAN.md) (phased plan) before working on this repo. Design
system: [DESIGN.md](./DESIGN.md), live at `/styleguide`.

## Local setup

```bash
nvm use && npm install
npm run dev          # http://localhost:3000
npm run test         # vitest (formatters, later: ratios/valuation/returns)
npm run test:e2e     # playwright against a production build
```

Full operations runbook arrives in Phase 8.
