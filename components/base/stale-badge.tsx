// Stale-data flag (UI mandate #7): data older than 48h is always visibly
// marked. Dot + text — never color alone.
export function StaleBadge({ asOf }: { asOf: string | Date | null }) {
  const label =
    asOf === null
      ? "no data yet"
      : `as of ${typeof asOf === "string" ? asOf : asOf.toISOString().slice(0, 10)}`;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-warn-soft px-1.5 py-0.5 text-xs text-warn">
      <span aria-hidden className="text-[8px] leading-none">
        ●
      </span>
      stale · {label}
    </span>
  );
}
