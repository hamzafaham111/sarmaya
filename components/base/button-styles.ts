// One place that decides what a clickable thing looks like, so every button
// in the app presses the same way. `pressable` (globals.css) supplies the
// dip-and-darken on :active — the fix for "I can't tell my click registered".

export type ButtonVariant = "primary" | "gold" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const BASE =
  "pressable inline-flex items-center justify-center gap-1.5 rounded-lg font-medium " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:brightness-100 " +
  "disabled:active:transform-none";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

const VARIANTS: Record<ButtonVariant, string> = {
  // The gradient is the product's signature; shadow gives it lift.
  primary: "bg-grad-brand text-on-brand shadow-sm shadow-brand/25",
  // Gold is reserved for the user's own inputs and estimates.
  gold: "bg-grad-gold text-on-gold shadow-sm shadow-gold/25",
  ghost: "border border-line bg-surface text-ink-muted hover:text-ink",
  danger: "border border-neg/40 bg-neg-soft text-neg",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${extra}`.trim();
}
