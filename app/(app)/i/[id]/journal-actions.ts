"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { deleteEntry, insertEntry } from "@/lib/db/queries/journal";
import { createClient } from "@/lib/supabase/server";

// Money/quantity stay decimal STRINGS end to end (CLAUDE.md #4).
const decimalString = z
  .string()
  .trim()
  .regex(/^\d{1,12}(\.\d{1,8})?$/, "must be a positive decimal number");

const entrySchema = z
  .object({
    kind: z.enum(["buy", "sell", "sip", "note"]),
    tradeDate: z.iso.date(),
    price: decimalString.or(z.literal("")).transform((v) => v || null),
    quantity: decimalString.or(z.literal("")).transform((v) => v || null),
    reasoning: z
      .string()
      .trim()
      .min(10, "reasoning must be at least 10 characters"),
  })
  .refine(
    (e) => e.kind === "note" || (e.price !== null && e.quantity !== null),
    { message: "trades need both price/NAV and quantity/units" },
  );

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  return user.id;
}

export async function createJournalEntry(
  instrumentId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  if (!z.uuid().safeParse(instrumentId).success) redirect("/instruments");

  const parsed = entrySchema.safeParse({
    kind: formData.get("kind"),
    tradeDate: formData.get("tradeDate"),
    price: formData.get("price") ?? "",
    quantity: formData.get("quantity") ?? "",
    reasoning: formData.get("reasoning"),
  });
  if (!parsed.success) {
    redirect(`/i/${instrumentId}?journalError=invalid`);
  }

  try {
    await insertEntry({ userId, instrumentId, ...parsed.data });
  } catch {
    // DB check constraint (reasoning >= 10) is the backstop; fail soft.
    redirect(`/i/${instrumentId}?journalError=rejected`);
  }
  revalidatePath(`/i/${instrumentId}`);
  revalidatePath("/journal");
  revalidatePath("/portfolio");
  redirect(`/i/${instrumentId}`);
}

export async function deleteJournalEntry(
  instrumentId: string,
  entryId: string,
) {
  const userId = await requireUserId();
  if (
    !z.uuid().safeParse(instrumentId).success ||
    !z.uuid().safeParse(entryId).success
  ) {
    redirect("/instruments");
  }
  await deleteEntry(userId, entryId);
  revalidatePath(`/i/${instrumentId}`);
  revalidatePath("/journal");
  revalidatePath("/portfolio");
  redirect(`/i/${instrumentId}`);
}
