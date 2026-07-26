"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      <nav className="flex min-w-0 gap-3 overflow-x-auto text-[13px]">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap ${
              isActive(item.href) ? "text-brand" : "text-ink-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-2">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center justify-between rounded-sm px-2 py-1.5 text-[13px] transition ${
            isActive(item.href)
              ? "bg-brand-soft text-brand"
              : "text-ink-muted hover:bg-surface-2 hover:text-ink"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
