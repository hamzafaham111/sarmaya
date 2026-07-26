// Returns/CAGR math for NAV & price series — computed, never fetched
// (CLAUDE.md fund vocabulary). Pure, null-safe, gap-tolerant: markets and
// NAV publication skip days, so "one year ago" matches the nearest earlier
// point within a tolerance window.

export interface SeriesPoint {
  date: string; // ISO date
  value: number;
}

const DAY_MS = 86_400_000;
const GAP_TOLERANCE_DAYS = 7;

function sorted(series: SeriesPoint[]): SeriesPoint[] {
  return [...series]
    .filter((p) => Number.isFinite(p.value) && p.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Nearest point to `target` within the tolerance window (either side) —
 *  a series with a season-long hole reports null, not a lie. */
function pointNear(series: SeriesPoint[], target: Date): SeriesPoint | null {
  let best: SeriesPoint | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const p of series) {
    const distance = Math.abs(new Date(p.date).getTime() - target.getTime());
    if (distance < bestDistance) {
      best = p;
      bestDistance = distance;
    }
  }
  if (!best || bestDistance / DAY_MS > GAP_TOLERANCE_DAYS) return null;
  return best;
}

/** Point-to-point simple return over roughly `days` back from the series
 *  end. Null when either endpoint is missing. */
export function pointToPointReturn(
  series: SeriesPoint[],
  days: number,
): number | null {
  const s = sorted(series);
  if (s.length < 2) return null;
  const end = s[s.length - 1];
  const target = new Date(new Date(end.date).getTime() - days * DAY_MS);
  const start = pointNear(s, target);
  if (!start || start.value <= 0 || start === end) return null;
  return end.value / start.value - 1;
}

/** Annualized CAGR over roughly `years` back. Null when the series doesn't
 *  actually reach that far (data honesty — no extrapolation). */
export function cagr(series: SeriesPoint[], years: number): number | null {
  const s = sorted(series);
  if (s.length < 2) return null;
  const end = s[s.length - 1];
  const target = new Date(
    new Date(end.date).getTime() - years * 365.25 * DAY_MS,
  );
  const start = pointNear(s, target);
  if (!start || start.value <= 0 || start === end) return null;
  const actualYears =
    (new Date(end.date).getTime() - new Date(start.date).getTime()) /
    (365.25 * DAY_MS);
  if (actualYears <= 0) return null;
  return Math.pow(end.value / start.value, 1 / actualYears) - 1;
}

export interface ReturnsSummary {
  r1m: number | null;
  r1y: number | null;
  cagr3y: number | null;
  cagr5y: number | null;
}

export function returnsSummary(series: SeriesPoint[]): ReturnsSummary {
  return {
    r1m: pointToPointReturn(series, 30),
    r1y: pointToPointReturn(series, 365),
    cagr3y: cagr(series, 3),
    cagr5y: cagr(series, 5),
  };
}
