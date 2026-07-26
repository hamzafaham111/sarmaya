// Every model returns a value OR an honest refusal — never a garbage number
// (valuation doctrine #5). The result is always the USER'S estimate.
export type ModelResult =
  | { value: number } // per-share, rounded to the cent
  | { notApplicable: string };

export function isApplicable(r: ModelResult): r is { value: number } {
  return "value" in r;
}

export const MODELS = ["dcf", "graham", "epv", "reverse_dcf"] as const;
export type ModelName = (typeof MODELS)[number];
