import { DASH } from "@/lib/format";

// THE signature element (UI mandate #9): the user's estimate range across
// models as a horizontal band, with current price as a marker. The band
// wears the brand accent — it is the user's own thinking made visible.
//
// Designed degradations (DESIGN.md):
// - no applicable models  -> render NOTHING (caller decides on empty state);
//   an empty track would imply an estimate exists.
// - single model          -> a tick, not a band.
// - marker outside band   -> the domain extends so the marker stays visible.
export interface RangeBandProps {
  /** Lowest applicable model output (user-adjusted), or null. */
  low: number | null;
  /** Highest applicable model output, or null. */
  high: number | null;
  /** Current price marker, or null. */
  marker: number | null;
  /** Format for end labels; required when labels are shown. */
  format?: (n: number) => string;
  /** Show numeric labels under band ends and marker (full variant). */
  labels?: boolean;
  /** Compact row variant (96×12, no labels — tooltip belongs to the caller). */
  compact?: boolean;
  /** e.g. "DCF · EPV · Graham" */
  caption?: string;
}

export function RangeBand({
  low,
  high,
  marker,
  format,
  labels = true,
  compact = false,
  caption,
}: RangeBandProps) {
  if (low === null || high === null) return null; // nothing to show, show nothing

  const lo = Math.min(low, high);
  const hi = Math.max(low, high);

  // Domain includes the marker plus 6% breathing room each side.
  const points = marker === null ? [lo, hi] : [lo, hi, marker];
  const dMin = Math.min(...points);
  const dMax = Math.max(...points);
  const span = dMax - dMin || 1; // degenerate all-equal case
  const padding = span * 0.06;
  const domainMin = dMin - padding;
  const domainSpan = span + padding * 2;

  const pct = (v: number) => ((v - domainMin) / domainSpan) * 100;
  const single = lo === hi;

  const trackH = compact ? "h-3" : "h-5";
  const fmt = format ?? ((n: number) => String(n));

  return (
    <div className={compact ? "w-24" : "w-full"}>
      <div className={`relative ${trackH}`} role="img" aria-label={ariaLabel()}>
        {/* hairline track */}
        <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-line" />
        {/* the estimate band (or single-model tick) */}
        {single ? (
          <div
            className="bg-grad-brand absolute top-1/2 h-full w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${pct(lo)}%` }}
          />
        ) : (
          // The signature: the user's estimate range wears the brand
          // gradient, so their own thinking is the most colourful thing on
          // the screen.
          <div
            className="bg-grad-brand absolute top-1/2 h-2/3 -translate-y-1/2 rounded-full opacity-80 ring-1 ring-brand/40 ring-inset"
            style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
        )}
        {/* current price marker */}
        {marker !== null ? (
          <div
            className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 rounded-full bg-ink"
            style={{ left: `${pct(marker)}%` }}
          />
        ) : null}
      </div>

      {labels && !compact ? (
        <div className="font-numeric relative mt-1 h-4 text-xs text-ink-muted tabular-nums">
          <span className="absolute left-0">{fmt(lo)}</span>
          {marker !== null ? (
            <span
              className="absolute -translate-x-1/2 text-ink"
              style={{
                left: `${clampLabel(pct(marker))}%`,
              }}
            >
              ▲ {fmt(marker)}
            </span>
          ) : null}
          <span className="absolute right-0">{single ? "" : fmt(hi)}</span>
        </div>
      ) : null}
      {caption && !compact ? (
        <div className="mt-1 text-xs text-ink-muted">{caption}</div>
      ) : null}
    </div>
  );

  function ariaLabel(): string {
    const m = marker === null ? DASH : fmt(marker);
    return single
      ? `Your estimate ${fmt(lo)}; current price ${m}`
      : `Your estimate range ${fmt(lo)} to ${fmt(hi)}; current price ${m}`;
  }
}

// Keep the marker label from colliding with the end labels.
function clampLabel(p: number): number {
  return Math.min(85, Math.max(15, p));
}
