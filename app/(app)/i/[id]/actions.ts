"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  LINE_ITEM_VOCABULARY,
  STATEMENT_KINDS,
  type StatementKind,
} from "@/lib/analysis/statements";
import {
  getInstrumentPage,
  setManualPrice,
} from "@/lib/db/queries/instruments";
import {
  addAnnotation,
  deleteAnnotation,
  deleteManualStatement,
  updateNotes,
  upsertManualStatement,
} from "@/lib/db/queries/study";
import { createClient } from "@/lib/supabase/server";

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  return user.id;
}

const notesSchema = z.object({
  instrumentId: z.uuid(),
  notesMd: z.string().max(200_000),
});

export async function saveNotes(input: {
  instrumentId: string;
  notesMd: string;
}) {
  const userId = await requireUserId();
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };
  await updateNotes(userId, parsed.data.instrumentId, parsed.data.notesMd);
  return { ok: true as const };
}

const annotationSchema = z.object({
  instrumentId: z.uuid(),
  target: z.string().min(1).max(120),
  body: z.string().trim().min(1).max(2_000),
});

export async function createAnnotation(input: {
  instrumentId: string;
  target: string;
  body: string;
}) {
  const userId = await requireUserId();
  const parsed = annotationSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };
  await addAnnotation({ userId, ...parsed.data });
  revalidatePath(`/i/${parsed.data.instrumentId}`);
  return { ok: true as const };
}

// Manual statements: the user's own figures, stored in their own table and
// overlaid on the provider's at read time. A field left blank arrives here
// as null and means "no opinion" — the fetched figure keeps showing.
const manualStatementSchema = z.object({
  instrumentId: z.uuid(),
  fiscalYear: z.number().int().min(1900).max(2200),
  statement: z.enum(STATEMENT_KINDS as [StatementKind, ...StatementKind[]]),
  // Only the CLAUDE.md line-item vocabulary is accepted; anything else is
  // dropped rather than stored, so the tables can never grow invented rows.
  data: z.record(z.string(), z.number().finite().nullable()),
});

export async function saveManualStatement(input: {
  instrumentId: string;
  fiscalYear: number;
  statement: string;
  data: Record<string, number | null>;
}) {
  const userId = await requireUserId();
  const parsed = manualStatementSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" };

  const allowed = new Set(
    LINE_ITEM_VOCABULARY[parsed.data.statement].map((i) => i.key),
  );
  const data = Object.fromEntries(
    Object.entries(parsed.data.data).filter(
      ([key, value]) => allowed.has(key) && value !== null,
    ),
  );

  // Nothing left to store => this is a clear, not a save.
  if (Object.keys(data).length === 0) {
    await deleteManualStatement(
      userId,
      parsed.data.instrumentId,
      parsed.data.fiscalYear,
      parsed.data.statement,
    );
  } else {
    await upsertManualStatement({
      userId,
      instrumentId: parsed.data.instrumentId,
      fiscalYear: parsed.data.fiscalYear,
      statement: parsed.data.statement,
      data,
    });
  }

  revalidatePath(`/i/${parsed.data.instrumentId}`);
  return { ok: true as const };
}

// Prices for hand-created instruments. `snapshots` is a SHARED table, so
// this refuses anything the user doesn't track and anything a provider owns
// — a manual price may never overwrite fetched market data.
const manualPriceSchema = z.object({
  instrumentId: z.uuid(),
  price: z.number().finite().positive(),
  asOf: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function saveManualPrice(input: {
  instrumentId: string;
  price: number;
  asOf?: string;
}) {
  const userId = await requireUserId();
  const parsed = manualPriceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };

  const page = await getInstrumentPage(userId, parsed.data.instrumentId);
  if (!page || !page.instrument.isManual) return { ok: false as const };

  await setManualPrice(
    parsed.data.instrumentId,
    parsed.data.asOf ?? new Date().toISOString().slice(0, 10),
    parsed.data.price,
    page.instrument.currency,
  );
  revalidatePath(`/i/${parsed.data.instrumentId}`);
  return { ok: true as const };
}

export async function clearManualStatement(input: {
  instrumentId: string;
  fiscalYear: number;
  statement: string;
}) {
  const userId = await requireUserId();
  const parsed = manualStatementSchema
    .omit({ data: true })
    .safeParse({ ...input });
  if (!parsed.success) return { ok: false as const };
  await deleteManualStatement(
    userId,
    parsed.data.instrumentId,
    parsed.data.fiscalYear,
    parsed.data.statement,
  );
  revalidatePath(`/i/${parsed.data.instrumentId}`);
  return { ok: true as const };
}

export async function removeAnnotation(input: {
  instrumentId: string;
  annotationId: string;
}) {
  const userId = await requireUserId();
  if (
    !z.uuid().safeParse(input.annotationId).success ||
    !z.uuid().safeParse(input.instrumentId).success
  ) {
    return { ok: false as const };
  }
  await deleteAnnotation(userId, input.annotationId);
  revalidatePath(`/i/${input.instrumentId}`);
  return { ok: true as const };
}
