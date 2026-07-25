import { DASH } from "@/lib/format";

// Signed change value. The sign character always renders — color is never
// the only carrier of meaning (UI mandate #5).
export function DeltaValue({
  value,
  suffix = "%",
  className = "",
}: {
  /** The delta as a number (e.g. 1.24 for +1.24%), or null. */
  value: number | null;
  suffix?: string;
  className?: string;
}) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className={`font-numeric tabular-nums ${className} text-ink-muted`}>
        {DASH}
      </span>
    );
  }

  const positive = value > 0;
  const negative = value < 0;
  const tone = positive ? "text-pos" : negative ? "text-neg" : "text-ink-muted";
  const sign = positive ? "+" : ""; // negatives carry their own minus

  return (
    <span className={`font-numeric tabular-nums ${tone} ${className}`}>
      {sign}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}
