"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

/**
 * Rendered inside a <Link>, so it can see that link's own navigation state.
 * A page can take a moment to come back from a distant database; without
 * this the click looks like it did nothing.
 */
function NavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="ml-auto inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

// Nav items light up as their phases land.
const NAV = [
  { href: "/", label: "Overview", live: true },
  { href: "/instruments", label: "Instruments", live: true },
  { href: "/portfolio", label: "Portfolio", live: true },
  { href: "/journal", label: "Journal", live: true },
  { href: "/styleguide", label: "Styleguide", live: true },
] as const;

export function NavLinks({ orientation }: { orientation: "side" | "top" }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (orientation === "top") {
    return (
      // min-w-0 lets the nav scroll inside itself; without it a flex item's
      // min-content width pushes the whole page into a horizontal scroll.
      <nav className="flex min-w-0 gap-3 overflow-x-auto text-[14px]">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`pressable inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap ${
              isActive(item.href) ? "text-brand" : "text-ink-muted"
            }`}
          >
            {item.label}
            <NavPending />
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`pressable-row relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] ${
              active
                ? "bg-grad-brand-soft font-medium text-brand"
                : "text-ink-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {/* The active rail: a gradient tick, not just a colour change. */}
            <span
              aria-hidden
              className={`h-4 w-1 rounded-full ${active ? "bg-grad-brand" : "bg-transparent"}`}
            />
            {item.label}
            <NavPending />
          </Link>
        );
      })}
    </nav>
  );
}
