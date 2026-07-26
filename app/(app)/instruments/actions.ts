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
    const quote = await fetchQuickQuote(instrument.symbol);
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

export async function removeInstrument(instrumentId: string) {
  const userId = await requireUserId();
  if (!z.uuid().safeParse(instrumentId).success) redirect("/instruments");
  await removeUserInstrument(userId, instrumentId);
  redirect("/instruments");
}
