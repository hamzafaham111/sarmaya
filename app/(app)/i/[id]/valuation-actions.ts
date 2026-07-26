"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { upsertValuation } from "@/lib/db/queries/valuations";
import { createClient } from "@/lib/supabase/server";

const saveSchema = z.object({
  instrumentId: z.uuid(),
  model: z.enum(["dcf", "graham", "epv", "reverse_dcf"]),
  // Assumptions are the user's own numbers; keys are model-defined.
  assumptions: z.record(z.string(), z.number().finite().nullable()),
});

export async function saveValuation(input: {
  instrumentId: string;
  model: string;
  assumptions: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const cleaned = Object.fromEntries(
    Object.entries(input.assumptions).map(([k, v]) => [
      k,
      typeof v === "number" && Number.isFinite(v) ? v : null,
    ]),
  );
  const parsed = saveSchema.safeParse({ ...input, assumptions: cleaned });
  if (!parsed.success) return { ok: false as const };

  await upsertValuation(
    user.id,
    parsed.data.instrumentId,
    parsed.data.model,
    parsed.data.assumptions,
  );
  return { ok: true as const };
}
