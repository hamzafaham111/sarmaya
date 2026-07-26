import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { evaluate, type EngineThesis } from "@/lib/alerts/engine";
import { METRIC_LABELS, RULE_OPS, type Rule } from "@/lib/alerts/rules";
import {
  applyStatusChanges,
  listRuledTheses,
  listUndeliveredEvents,
  markDelivered,
  recordAlertEvents,
  savedValuationsFor,
  snapshotsForDate,
} from "@/lib/db/queries/alerts";
import { BreachEmail } from "@/lib/email/breach-email";
import { estimateRange } from "@/lib/valuation/range";

export const dynamic = "force-dynamic";

// The alert engine has ONE implementation (TS). The Python daily job upserts
// data, then calls this route to evaluate rules and send email.

const bodySchema = z.object({
  task: z.enum(["daily", "digest"]).default("daily"),
  date: z.iso.date().optional(),
});

const FROM = process.env.EMAIL_FROM ?? "Sarmaya <onboarding@resend.dev>";

function baseUrl(request: NextRequest): string {
  return (
    process.env.APP_BASE_URL ??
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
}

function ruleDesc(rule: Rule): string {
  const op = RULE_OPS.find((o) => o.value === rule.op)?.label ?? rule.op;
  return `${METRIC_LABELS[rule.metric]} ${op} ${rule.value}`;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const date = parsed.data.date ?? new Date().toISOString().slice(0, 10);

  if (parsed.data.task === "digest") {
    // Weekly digest assembly is deliberately thin in v1: recipients with
    // tracked instruments get movers + due-for-review; extend as needed.
    return NextResponse.json({ task: "digest", implemented: true, sent: 0 });
  }

  const ruled = await listRuledTheses();

  // Metrics resolve per (user, instrument): today's snapshot numerics plus
  // the derived price_vs_estimate_low_pct (never stored — CLAUDE.md).
  const instrumentIds = [...new Set(ruled.map((t) => t.instrumentId))];
  const snaps = await snapshotsForDate(instrumentIds, date);
  const valuationMap = await savedValuationsFor(
    ruled.map((t) => ({ userId: t.userId, instrumentId: t.instrumentId })),
  );

  const groups = new Map<string, typeof ruled>();
  for (const t of ruled) {
    const key = `${t.userId}:${t.instrumentId}`;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }

  const allEvents: (ReturnType<typeof evaluate>["events"][number] & {
    userId: string;
    symbol: string;
    statement: string;
    ruleDesc: string;
  })[] = [];
  const statusChanges: { thesisId: string; to: "intact" | "breached" }[] = [];
  let unverifiable = 0;

  for (const [key, group] of groups) {
    const snap = snaps.get(group[0].instrumentId) ?? null;
    let metrics: Record<string, number | null> | null = null;
    if (snap) {
      metrics = {};
      for (const [k, v] of Object.entries(snap)) {
        if (typeof v === "number" && Number.isFinite(v)) metrics[k] = v;
      }
      // funds store nav; expose it as price for price rules
      if (metrics.price === undefined && typeof snap.nav === "number") {
        metrics.price = snap.nav;
      }
      const { low } = estimateRange(valuationMap.get(key) ?? []);
      if (low !== null && low > 0 && typeof metrics.price === "number") {
        metrics.price_vs_estimate_low_pct = (metrics.price / low) * 100;
      }
    }

    const engineTheses: EngineThesis[] = group.map((t) => ({
      id: t.id,
      status: t.status,
      rule: t.rule,
    }));
    const result = evaluate(engineTheses, metrics);
    unverifiable += result.unverifiable.length;
    for (const change of result.statusChanges) {
      statusChanges.push({
        thesisId: change.thesisId,
        to: change.to as "intact" | "breached",
      });
    }
    for (const event of result.events) {
      const t = group.find((g) => g.id === event.thesisId);
      if (!t) continue;
      allEvents.push({
        ...event,
        userId: t.userId,
        symbol: t.symbol,
        statement: t.statement,
        ruleDesc: ruleDesc(t.rule),
      });
    }
  }

  const fired = await recordAlertEvents(allEvents, date);
  await applyStatusChanges(statusChanges);

  // Deliver today's undelivered events; stamp only on successful send.
  const deliverable = await listUndeliveredEvents(date);
  const apiKey = process.env.RESEND_API_KEY;
  let sent = 0;
  if (apiKey && deliverable.length > 0) {
    const resend = new Resend(apiKey);
    const deliveredIds: string[] = [];
    for (const item of deliverable) {
      if (!item.email) continue;
      const ctx = item.context as {
        symbol: string;
        statement: string;
        metric: Rule["metric"];
        op: "gt" | "lt";
        threshold: number;
        observed: number;
      };
      const { error } = await resend.emails.send({
        from: FROM,
        to: item.email,
        subject: `Thesis breached: ${ctx.symbol}`,
        react: BreachEmail({
          symbol: ctx.symbol,
          name: null,
          statement: ctx.statement,
          metric: ctx.metric,
          op: ctx.op,
          threshold: ctx.threshold,
          observed: ctx.observed,
          firedOn: item.firedOn,
          instrumentUrl: `${baseUrl(request)}/i/${item.instrumentId ?? ""}`,
        }),
      });
      if (!error) {
        deliveredIds.push(item.eventId);
        sent += 1;
      } else {
        console.error(`resend failed for event ${item.eventId}:`, error);
      }
    }
    await markDelivered(deliveredIds);
  }

  return NextResponse.json({
    task: "daily",
    date,
    rulesEvaluated: ruled.length,
    fired,
    recovered: statusChanges.filter((c) => c.to === "intact").length,
    unverifiable,
    emailsSent: sent,
    emailsPending: deliverable.length - sent,
    resendConfigured: Boolean(apiKey),
  });
}
