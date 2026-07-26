CREATE TABLE "manual_statements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" uuid NOT NULL,
	"fiscal_year" integer NOT NULL,
	"statement" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manual_statements_kind_ck" CHECK ("manual_statements"."statement" in ('income', 'balance', 'cashflow')),
	CONSTRAINT "manual_statements_year_ck" CHECK ("manual_statements"."fiscal_year" between 1900 and 2200)
);
--> statement-breakpoint
ALTER TABLE "manual_statements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "instruments" ADD COLUMN "is_manual" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "manual_statements" ADD CONSTRAINT "manual_statements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_statements" ADD CONSTRAINT "manual_statements_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "manual_statements_user_instrument_year_kind_uq" ON "manual_statements" USING btree ("user_id","instrument_id","fiscal_year","statement");--> statement-breakpoint
CREATE POLICY "manual_statements_select_own" ON "manual_statements" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("manual_statements"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "manual_statements_insert_own" ON "manual_statements" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("manual_statements"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "manual_statements_update_own" ON "manual_statements" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("manual_statements"."user_id" = (select auth.uid())) WITH CHECK ("manual_statements"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "manual_statements_delete_own" ON "manual_statements" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("manual_statements"."user_id" = (select auth.uid()));