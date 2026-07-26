"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  addAnnotation,
  deleteAnnotation,
  updateNotes,
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
