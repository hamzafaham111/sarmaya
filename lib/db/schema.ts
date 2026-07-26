import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";

// Sarmaya schema — single source of truth. Conventions (CLAUDE.md):
// snake_case SQL / camelCase TS, money & quantities as numeric (strings in
// JS), every metric nullable, RLS on every user-owned table from day one.
// Shared market data (instruments/snapshots/statements/prices/navs) is
// readable by any signed-in user and written only by the service role.

const authUid = sql`(select auth.uid())`;

// Rule metrics = numeric snapshot vocabulary ∪ price_vs_estimate_low_pct
// (derived at alert-evaluation time; never stored in snapshots).
const RULE_METRICS_SQL = sql`(
  'price', 'market_cap', 'pe', 'pb', 'eps_ttm', 'revenue_ttm',
  'revenue_growth_yoy', 'gross_margin', 'op_margin', 'net_margin', 'fcf_ttm',
  'debt_to_equity', 'roe', 'roic', 'shares_outstanding', 'dividend_yield',
  'book_value_per_share', 'price_vs_estimate_low_pct'
)`;

export const instruments = pgTable(
  "instruments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    symbol: text("symbol").notNull(),
    market: text("market").notNull(),
    name: text("name"),
    currency: text("currency").notNull(),
    status: text("status").notNull().default("active"),
    // Hand-created instrument: no provider covers it, so the batch jobs skip
    // it entirely and every figure comes from the user typing it in.
    isManual: boolean("is_manual").notNull().default(false),
    // Batch discipline: 3 consecutive failed days => 'fetch_failing'.
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("instruments_symbol_market_uq").on(t.symbol, t.market),
    check("instruments_kind_ck", sql`${t.kind} in ('stock', 'fund', 'index')`),
    check("instruments_market_ck", sql`${t.market} in ('IN', 'PK', 'US')`),
    check(
      "instruments_currency_ck",
      sql`${t.currency} in ('INR', 'PKR', 'USD')`,
    ),
    check(
      "instruments_status_ck",
      sql`${t.status} in ('active', 'fetch_failing', 'delisted')`,
    ),
    pgPolicy("instruments_select_authenticated", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
);

export const snapshots = pgTable(
  "snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    asOf: date("as_of").notNull(),
    data: jsonb("data").notNull().$type<Record<string, unknown>>(),
    source: text("source").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("snapshots_instrument_as_of_uq").on(t.instrumentId, t.asOf),
    index("snapshots_fetched_at_idx").on(t.fetchedAt),
    pgPolicy("snapshots_select_authenticated", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
);

// Append-only per (instrument, fiscal year, statement kind) — history
// accumulates forward; never fabricate missing years (CLAUDE.md #7).
export const statements = pgTable(
  "statements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    fiscalYear: integer("fiscal_year").notNull(),
    period: text("period").notNull().default("annual"),
    statement: text("statement").notNull(),
    data: jsonb("data").notNull().$type<Record<string, unknown>>(),
    source: text("source").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("statements_instrument_year_kind_uq").on(
      t.instrumentId,
      t.fiscalYear,
      t.statement,
    ),
    check(
      "statements_kind_ck",
      sql`${t.statement} in ('income', 'balance', 'cashflow')`,
    ),
    check("statements_period_ck", sql`${t.period} in ('annual')`),
    pgPolicy("statements_select_authenticated", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
);

// The user's own statement figures, overlaid on `statements` at read time.
// Deliberately a SEPARATE user-owned table: the fetched table stays the
// provider's record of truth (a job can never clobber your typing, and your
// typing is never shown to another user). Field-level merge — a null here
// falls back to the fetched figure.
export const manualStatements = pgTable(
  "manual_statements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    fiscalYear: integer("fiscal_year").notNull(),
    statement: text("statement").notNull(),
    data: jsonb("data").notNull().$type<Record<string, number | null>>(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("manual_statements_user_instrument_year_kind_uq").on(
      t.userId,
      t.instrumentId,
      t.fiscalYear,
      t.statement,
    ),
    check(
      "manual_statements_kind_ck",
      sql`${t.statement} in ('income', 'balance', 'cashflow')`,
    ),
    check(
      "manual_statements_year_ck",
      sql`${t.fiscalYear} between 1900 and 2200`,
    ),
    pgPolicy("manual_statements_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("manual_statements_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("manual_statements_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("manual_statements_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

export const navHistory = pgTable(
  "nav_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    navDate: date("nav_date").notNull(),
    nav: numeric("nav").notNull(),
  },
  (t) => [
    uniqueIndex("nav_history_instrument_date_uq").on(t.instrumentId, t.navDate),
    pgPolicy("nav_history_select_authenticated", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
);

// Daily closes for stock/index charts (kept separate from fund NAVs so each
// keeps clean semantics — see DECISIONS.md).
export const priceHistory = pgTable(
  "price_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    priceDate: date("price_date").notNull(),
    close: numeric("close").notNull(),
  },
  (t) => [
    uniqueIndex("price_history_instrument_date_uq").on(
      t.instrumentId,
      t.priceDate,
    ),
    pgPolicy("price_history_select_authenticated", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ],
);

export const userInstruments = pgTable(
  "user_instruments",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    notesMd: text("notes_md").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.instrumentId] }),
    index("user_instruments_instrument_idx").on(t.instrumentId),
    pgPolicy("user_instruments_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("user_instruments_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("user_instruments_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("user_instruments_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

// One row per user × instrument × model; assumptions are the user's own.
export const valuations = pgTable(
  "valuations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    model: text("model").notNull(),
    assumptions: jsonb("assumptions")
      .notNull()
      .$type<Record<string, unknown>>(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("valuations_user_instrument_model_uq").on(
      t.userId,
      t.instrumentId,
      t.model,
    ),
    check(
      "valuations_model_ck",
      sql`${t.model} in ('dcf', 'graham', 'epv', 'reverse_dcf')`,
    ),
    pgPolicy("valuations_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("valuations_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("valuations_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("valuations_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

export const theses = pgTable(
  "theses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    statement: text("statement").notNull(),
    rule: jsonb("rule").$type<{
      metric: string;
      op: "gt" | "lt";
      value: number;
    } | null>(),
    status: text("status").notNull().default("intact"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("theses_user_instrument_idx").on(t.userId, t.instrumentId),
    check(
      "theses_status_ck",
      sql`${t.status} in ('intact', 'breached', 'archived')`,
    ),
    check(
      "theses_rule_shape_ck",
      sql`${t.rule} is null or (
        (${t.rule}->>'metric') in ${RULE_METRICS_SQL}
        and (${t.rule}->>'op') in ('gt', 'lt')
        and jsonb_typeof(${t.rule}->'value') = 'number'
      )`,
    ),
    pgPolicy("theses_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("theses_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("theses_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("theses_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

// The decision journal — the mandatory "why" is the soul of the product.
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    tradeDate: date("trade_date").notNull(),
    price: numeric("price"),
    quantity: numeric("quantity"),
    reasoning: text("reasoning").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("journal_entries_user_date_idx").on(t.userId, t.tradeDate),
    check(
      "journal_entries_kind_ck",
      sql`${t.kind} in ('buy', 'sell', 'sip', 'note')`,
    ),
    check("journal_entries_reasoning_ck", sql`length(${t.reasoning}) >= 10`),
    pgPolicy("journal_entries_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("journal_entries_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("journal_entries_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("journal_entries_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

// One row per (thesis, day) — dedup is a DB guarantee. thesis_id is nullable
// (rule_desc keeps the fired rule readable even if the thesis is deleted).
export const alertEvents = pgTable(
  "alert_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    thesisId: uuid("thesis_id").references(() => theses.id, {
      onDelete: "set null",
    }),
    ruleDesc: text("rule_desc").notNull(),
    firedOn: date("fired_on").notNull(),
    snapshotId: uuid("snapshot_id").references(() => snapshots.id, {
      onDelete: "set null",
    }),
    context: jsonb("context").notNull().$type<Record<string, unknown>>(),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // nullable-safe dedup: unique only where a thesis exists
    uniqueIndex("alert_events_thesis_fired_on_uq")
      .on(t.thesisId, t.firedOn)
      .where(sql`${t.thesisId} is not null`),
    index("alert_events_undelivered_idx")
      .on(t.deliveredAt)
      .where(sql`${t.deliveredAt} is null`),
    pgPolicy("alert_events_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

// Notes attached to specific numbers: a statement cell, a metric, a model.
export const annotations = pgTable(
  "annotations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    instrumentId: uuid("instrument_id")
      .notNull()
      .references(() => instruments.id, { onDelete: "cascade" }),
    target: text("target").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("annotations_user_instrument_idx").on(t.userId, t.instrumentId),
    check("annotations_body_ck", sql`length(${t.body}) >= 1`),
    pgPolicy("annotations_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("annotations_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("annotations_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
    pgPolicy("annotations_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
);

// Operator-only job summaries; RLS on with no policies => invisible to users.
export const jobRuns = pgTable(
  "job_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    job: text("job").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    okCount: integer("ok_count").notNull().default(0),
    failCount: integer("fail_count").notNull().default(0),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
  },
  (t) => [check("job_runs_job_ck", sql`${t.job} in ('daily', 'weekly')`)],
).enableRLS();
