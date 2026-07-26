"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ruleSchema, type Rule } from "@/lib/alerts/rules";
import {
  archiveThesis,
  countActiveTheses,
  deleteThesis,
  insertThesis,
  updateThesis,
} from "@/lib/db/queries/theses";
import { createClient } from "@/lib/supabase/server";

const MAX_STATEMENTS = 5;
const statementSchema = z.string().trim().min(3).max(500);
const idSchema = z.object({ instrumentId: z.uuid(), thesisId: z.uuid() });

// The rule can ONLY be assembled from constrained form fields — there is no
// free-text rule path anywhere.
function parseRuleFromForm(formData: FormData): Rule | null | "invalid" {
  const metric = String(formData.get("rule_metric") ?? "");
  if (metric === "") return null;
  const parsed = ruleSchema.safeParse({
    metric,
    op: String(formData.get("rule_op") ?? ""),
    value: Number(formData.get("rule_value")),
  });
  return parsed.success ? parsed.data : "invalid";
}

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  return user.id;
}

export async function createThesisAction(
  instrumentId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  if (!z.uuid().safeParse(instrumentId).success) redirect("/instruments");

  const statement = statementSchema.safeParse(formData.get("statement"));
  const rule = parseRuleFromForm(formData);
  if (!statement.success || rule === "invalid") {
    redirect(`/i/${instrumentId}?thesisError=invalid`);
  }
  if ((await countActiveTheses(userId, instrumentId)) >= MAX_STATEMENTS) {
    redirect(`/i/${instrumentId}?thesisError=limit`);
  }

  await insertThesis(userId, instrumentId, statement.data, rule);
  revalidatePath(`/i/${instrumentId}`);
  redirect(`/i/${instrumentId}`);
}

export async function updateThesisAction(
  instrumentId: string,
  thesisId: string,
  formData: FormData,
) {
  const userId = await requireUserId();
  if (!idSchema.safeParse({ instrumentId, thesisId }).success) {
    redirect("/instruments");
  }
  const statement = statementSchema.safeParse(formData.get("statement"));
  const rule = parseRuleFromForm(formData);
  if (!statement.success || rule === "invalid") {
    redirect(`/i/${instrumentId}?thesisError=invalid`);
  }
  await updateThesis(userId, thesisId, statement.data, rule);
  revalidatePath(`/i/${instrumentId}`);
  redirect(`/i/${instrumentId}`);
}

export async function archiveThesisAction(
  instrumentId: string,
  thesisId: string,
) {
  const userId = await requireUserId();
  if (!idSchema.safeParse({ instrumentId, thesisId }).success) {
    redirect("/instruments");
  }
  await archiveThesis(userId, thesisId);
  revalidatePath(`/i/${instrumentId}`);
  redirect(`/i/${instrumentId}`);
}

export async function deleteThesisAction(
  instrumentId: string,
  thesisId: string,
) {
  const userId = await requireUserId();
  if (!idSchema.safeParse({ instrumentId, thesisId }).success) {
    redirect("/instruments");
  }
  await deleteThesis(userId, thesisId);
  revalidatePath(`/i/${instrumentId}`);
  redirect(`/i/${instrumentId}`);
}
