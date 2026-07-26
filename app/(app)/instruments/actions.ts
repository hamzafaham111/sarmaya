"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { resolveInstrument } from "@/lib/catalog";
import {
  addUserInstrument,
  getOrCreateInstrument,
  insertSnapshotIfAbsent,
  removeUserInstrument,
} from "@/lib/db/queries/instruments";
import { insertEntry } from "@/lib/db/queries/journal";
import { fetchQuickNav, fetchQuickQuote } from "@/lib/providers/quick-quote";
import { createClient } from "@/lib/supabase/server";

const addSchema = z.object({
  symbol: z.string().trim().min(1).max(20).toUpperCase(),
  market: z.enum(["IN", "PK", "US"]),
  kind: z.enum(["stock", "fund", "index"]).default("stock"),
});

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  return user.id;
}

export async function addInstrument(formData: FormData) {
  const userId = await requireUserId();

  const parsed = addSchema.safeParse({
    symbol: formData.get("symbol"),
    market: formData.get("market"),
    kind: formData.get("kind") || "stock",
  });
  if (!parsed.success) redirect("/instruments?error=invalid");

  const entry = await resolveInstrument(
    parsed.data.symbol,
    parsed.data.market,
    parsed.data.kind,
  );
  if (!entry) redirect("/instruments?error=unknown");

  const instrument = await getOrCreateInstrument({
    kind: entry.kind,
    symbol: entry.symbol,
    market: entry.market,
    currency: entry.currency,
    name: entry.name ?? entry.display,
  });
  await addUserInstrument(userId, instrument.id);

  // The ONE permitted request-time fetch: a minimal first snapshot so the
  // page isn't empty until tonight's job. Fail-soft by design.
  if (entry.kind === "fund") {
    const nav = await fetchQuickNav(instrument.symbol);
    if (nav) {
      await insertSnapshotIfAbsent(
        instrument.id,
        nav.asOf,
        nav.data,
        nav.source,
      );
    }
  } else {
    const quote = await fetchQuickQuote(instrument.symbol, instrument.market);
    if (quote) {
      await insertSnapshotIfAbsent(
        instrument.id,
        new Date().toISOString().slice(0, 10),
        quote.data,
        quote.source,
      );
    }
  }

  redirect(`/i/${instrument.id}`);
}

// Onboarding: a pre-filled example set (one stock, one fund, one journal
// note clearly marked as example) so a new user sees the product shape.
export async function createExampleSet() {
  const userId = await requireUserId();

  const stock = await getOrCreateInstrument({
    kind: "stock",
    symbol: "RELIANCE.NS",
    market: "IN",
    currency: "INR",
    name: "Reliance Industries Ltd.",
  });
  const fund = await getOrCreateInstrument({
    kind: "fund",
    symbol: "122639",
    market: "IN",
    currency: "INR",
    name: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
  });
  await addUserInstrument(userId, stock.id);
  await addUserInstrument(userId, fund.id);
  await insertEntry({
    userId,
    instrumentId: stock.id,
    kind: "note",
    tradeDate: new Date().toISOString().slice(0, 10),
    price: null,
    quantity: null,
    reasoning:
      "[Example] This is your decision journal. Record every buy, sell and SIP with the why — future you will want to know what past you was thinking. Delete this note anytime.",
  });

  redirect("/instruments");
}

export async function removeInstrument(instrumentId: string) {
  const userId = await requireUserId();
  if (!z.uuid().safeParse(instrumentId).success) redirect("/instruments");
  await removeUserInstrument(userId, instrumentId);
  redirect("/instruments");
}
