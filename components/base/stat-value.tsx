import { Skeleton } from "@/components/ui/skeleton";
import { DASH } from "@/lib/format";

// A labeled number. Numbers are the protagonist (UI mandate): tabular
// numerals, quiet label, dash for null — never NaN.
export function StatValue({
  label,
  value,
  loading = false,
  size = "md",
}: {
  label: string;
  /** Pre-formatted display string (use lib/format helpers) or null. */
  value: string | null;
  loading?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <div>
      <div className="text-xs tracking-wide text-ink-muted uppercase">
        {label}
      </div>
      {loading ? (
        <Skeleton
          className={`mt-1 motion-reduce:animate-none ${size === "lg" ? "h-7 w-28" : "h-5 w-20"}`}
        />
      ) : (
        <div
          className={`font-numeric mt-0.5 text-ink tabular-nums ${size === "lg" ? "text-xl" : "text-sm"}`}
        >
          {value ?? DASH}
        </div>
      )}
    </div>
  );
}
