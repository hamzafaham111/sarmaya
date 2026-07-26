import { and, eq } from "drizzle-orm";

import { db } from "../index";
import { valuations } from "../schema";

export type ValuationRow = typeof valuations.$inferSelect;

export async function getValuations(
  userId: string,
  instrumentId: string,
): Promise<ValuationRow[]> {
  return db()
    .select()
    .from(valuations)
    .where(
      and(
        eq(valuations.userId, userId),
        eq(valuations.instrumentId, instrumentId),
      ),
    );
}

export async function upsertValuation(
  userId: string,
  instrumentId: string,
  model: string,
  assumptions: Record<string, unknown>,
): Promise<void> {
  await db()
    .insert(valuations)
    .values({ userId, instrumentId, model, assumptions })
    .onConflictDoUpdate({
      target: [valuations.userId, valuations.instrumentId, valuations.model],
      set: { assumptions, updatedAt: new Date() },
    });
}
