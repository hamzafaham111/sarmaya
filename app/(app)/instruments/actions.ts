"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { resolveCatalogEntry } from "@/lib/catalog";
import {
  addUserInstrument,
  getOrCreateInstrument,
  insertSnapshotIfAbsent,
  removeUserInstrument,
} from "@/lib/db/queries/instruments";
import { fetchQuickQuote } from "@/lib/providers/quick-quote";
import { createClient } from "@/lib/supabase/server";

const addSchema = z.object({
  symbol: z.string().trim().min(1).max(20).toUpperCase(),
  market: z.enum(["IN", "PK", "US"]),
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
  });
  if (!parsed.success) redirect("/instruments?error=invalid");

  const entry = resolveCatalogEntry(parsed.data.symbol, parsed.data.market);
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
  const quote = await fetchQuickQuote(instrument.symbol);
  if (quote) {
    await insertSnapshotIfAbsent(
      instrument.id,
      new Date().toISOString().slice(0, 10),
      quote.data,
      quote.source,
    );
  }

  redirect(`/i/${instrument.id}`);
}

export async function removeInstrument(instrumentId: string) {
  const userId = await requireUserId();
  if (!z.uuid().safeParse(instrumentId).success) redirect("/instruments");
  await removeUserInstrument(userId, instrumentId);
  redirect("/instruments");
}
