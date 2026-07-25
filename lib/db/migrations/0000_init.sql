CREATE TABLE "alert_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"thesis_id" uuid,
	"rule_desc" text NOT NULL,
	"fired_on" date NOT NULL,
	"snapshot_id" uuid,
	"context" jsonb NOT NULL,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"target" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "annotations_body_ck" CHECK (length("annotations"."body") >= 1)
);
--> statement-breakpoint
ALTER TABLE "annotations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"symbol" text NOT NULL,
	"market" text NOT NULL,
	"name" text,
	"currency" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instruments_kind_ck" CHECK ("instruments"."kind" in ('stock', 'fund', 'index')),
	CONSTRAINT "instruments_market_ck" CHECK ("instruments"."market" in ('IN', 'PK', 'US')),
	CONSTRAINT "instruments_currency_ck" CHECK ("instruments"."currency" in ('INR', 'PKR', 'USD')),
	CONSTRAINT "instruments_status_ck" CHECK ("instruments"."status" in ('active', 'fetch_failing', 'delisted'))
);
--> statement-breakpoint
ALTER TABLE "instruments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"ok_count" integer DEFAULT 0 NOT NULL,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"detail" jsonb,
	CONSTRAINT "job_runs_job_ck" CHECK ("job_runs"."job" in ('daily', 'weekly'))
);
--> statement-breakpoint
ALTER TABLE "job_runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"trade_date" date NOT NULL,
	"price" numeric,
	"quantity" numeric,
	"reasoning" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entries_kind_ck" CHECK ("journal_entries"."kind" in ('buy', 'sell', 'sip', 'note')),
	CONSTRAINT "journal_entries_reasoning_ck" CHECK (length("journal_entries"."reasoning") >= 10)
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "nav_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"nav_date" date NOT NULL,
	"nav" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nav_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"price_date" date NOT NULL,
	"close" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"as_of" date NOT NULL,
	"data" jsonb NOT NULL,
	"source" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"fiscal_year" integer NOT NULL,
	"period" text DEFAULT 'annual' NOT NULL,
	"statement" text NOT NULL,
	"data" jsonb NOT NULL,
	"source" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "statements_kind_ck" CHECK ("statements"."statement" in ('income', 'balance', 'cashflow')),
	CONSTRAINT "statements_period_ck" CHECK ("statements"."period" in ('annual'))
);
--> statement-breakpoint
ALTER TABLE "statements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "theses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"statement" text NOT NULL,
	"rule" jsonb,
	"status" text DEFAULT 'intact' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "theses_status_ck" CHECK ("theses"."status" in ('intact', 'breached', 'archived')),
	CONSTRAINT "theses_rule_shape_ck" CHECK ("theses"."rule" is null or (
        ("theses"."rule"->>'metric') in (
  'price', 'market_cap', 'pe', 'pb', 'eps_ttm', 'revenue_ttm',
  'revenue_growth_yoy', 'gross_margin', 'op_margin', 'net_margin', 'fcf_ttm',
  'debt_to_equity', 'roe', 'roic', 'shares_outstanding', 'dividend_yield',
  'book_value_per_share', 'price_vs_estimate_low_pct'
)
        and ("theses"."rule"->>'op') in ('gt', 'lt')
        and jsonb_typeof("theses"."rule"->'value') = 'number'
      ))
);
--> statement-breakpoint
ALTER TABLE "theses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_instruments" (
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"notes_md" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_instruments_user_id_instrument_id_pk" PRIMARY KEY("user_id","instrument_id")
);
--> statement-breakpoint
ALTER TABLE "user_instruments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "valuations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"model" text NOT NULL,
	"assumptions" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "valuations_model_ck" CHECK ("valuations"."model" in ('dcf', 'graham', 'epv', 'reverse_dcf'))
);
--> statement-breakpoint
ALTER TABLE "valuations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_thesis_id_theses_id_fk" FOREIGN KEY ("thesis_id") REFERENCES "public"."theses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_snapshot_id_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nav_history" ADD CONSTRAINT "nav_history_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theses" ADD CONSTRAINT "theses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theses" ADD CONSTRAINT "theses_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_instruments" ADD CONSTRAINT "user_instruments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_instruments" ADD CONSTRAINT "user_instruments_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alert_events_thesis_fired_on_uq" ON "alert_events" USING btree ("thesis_id","fired_on") WHERE "alert_events"."thesis_id" is not null;--> statement-breakpoint
CREATE INDEX "alert_events_undelivered_idx" ON "alert_events" USING btree ("delivered_at") WHERE "alert_events"."delivered_at" is null;--> statement-breakpoint
CREATE INDEX "annotations_user_instrument_idx" ON "annotations" USING btree ("user_id","instrument_id");--> statement-breakpoint
CREATE UNIQUE INDEX "instruments_symbol_market_uq" ON "instruments" USING btree ("symbol","market");--> statement-breakpoint
CREATE INDEX "journal_entries_user_date_idx" ON "journal_entries" USING btree ("user_id","trade_date");--> statement-breakpoint
CREATE UNIQUE INDEX "nav_history_instrument_date_uq" ON "nav_history" USING btree ("instrument_id","nav_date");--> statement-breakpoint
CREATE UNIQUE INDEX "price_history_instrument_date_uq" ON "price_history" USING btree ("instrument_id","price_date");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_instrument_as_of_uq" ON "snapshots" USING btree ("instrument_id","as_of");--> statement-breakpoint
CREATE INDEX "snapshots_fetched_at_idx" ON "snapshots" USING btree ("fetched_at");--> statement-breakpoint
CREATE UNIQUE INDEX "statements_instrument_year_kind_uq" ON "statements" USING btree ("instrument_id","fiscal_year","statement");--> statement-breakpoint
CREATE INDEX "theses_user_instrument_idx" ON "theses" USING btree ("user_id","instrument_id");--> statement-breakpoint
CREATE INDEX "user_instruments_instrument_idx" ON "user_instruments" USING btree ("instrument_id");--> statement-breakpoint
CREATE UNIQUE INDEX "valuations_user_instrument_model_uq" ON "valuations" USING btree ("user_id","instrument_id","model");--> statement-breakpoint
CREATE POLICY "alert_events_select_own" ON "alert_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("alert_events"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "annotations_select_own" ON "annotations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("annotations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "annotations_insert_own" ON "annotations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("annotations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "annotations_update_own" ON "annotations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("annotations"."user_id" = (select auth.uid())) WITH CHECK ("annotations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "annotations_delete_own" ON "annotations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("annotations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "instruments_select_authenticated" ON "instruments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "journal_entries_select_own" ON "journal_entries" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("journal_entries"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "journal_entries_insert_own" ON "journal_entries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("journal_entries"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "journal_entries_update_own" ON "journal_entries" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("journal_entries"."user_id" = (select auth.uid())) WITH CHECK ("journal_entries"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "journal_entries_delete_own" ON "journal_entries" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("journal_entries"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "nav_history_select_authenticated" ON "nav_history" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "price_history_select_authenticated" ON "price_history" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "snapshots_select_authenticated" ON "snapshots" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "statements_select_authenticated" ON "statements" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "theses_select_own" ON "theses" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("theses"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "theses_insert_own" ON "theses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("theses"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "theses_update_own" ON "theses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("theses"."user_id" = (select auth.uid())) WITH CHECK ("theses"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "theses_delete_own" ON "theses" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("theses"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_instruments_select_own" ON "user_instruments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_instruments"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_instruments_insert_own" ON "user_instruments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_instruments"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_instruments_update_own" ON "user_instruments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("user_instruments"."user_id" = (select auth.uid())) WITH CHECK ("user_instruments"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "user_instruments_delete_own" ON "user_instruments" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("user_instruments"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "valuations_select_own" ON "valuations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("valuations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "valuations_insert_own" ON "valuations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("valuations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "valuations_update_own" ON "valuations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("valuations"."user_id" = (select auth.uid())) WITH CHECK ("valuations"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "valuations_delete_own" ON "valuations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("valuations"."user_id" = (select auth.uid()));