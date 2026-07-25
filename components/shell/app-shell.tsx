import Link from "next/link";

import { ThemeToggle } from "@/components/base/theme-toggle";

// The terminal chrome: fixed sidebar on desktop, top nav on mobile.
// Nav items light up as their phases land; until then they carry a tag.
const NAV = [
  { href: "/", label: "Overview", live: true },
  { href: "/instruments", label: "Instruments", live: false, phase: "3" },
  { href: "/portfolio", label: "Portfolio", live: false, phase: "6" },
  { href: "/journal", label: "Journal", live: false, phase: "6" },
  { href: "/styleguide", label: "Styleguide", live: true },
] as const;

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="px-4 py-4">
          <Link href="/" className="font-display text-lg font-medium text-ink">
            Sarmaya
          </Link>
          <p className="mt-0.5 text-[11px] text-ink-muted">research terminal</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.live ? item.href : "#"}
              aria-disabled={!item.live}
              className={`flex items-center justify-between rounded-sm px-2 py-1.5 text-[13px] transition ${
                active === item.href
                  ? "bg-brand-soft text-brand"
                  : item.live
                    ? "text-ink-muted hover:bg-surface-2 hover:text-ink"
                    : "cursor-default text-ink-muted/50"
              }`}
            >
              {item.label}
              {!item.live ? (
                <span className="text-[10px] text-ink-muted/60">
                  soon · P{item.phase}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line px-4 py-3">
          <ThemeToggle />
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar (mobile nav + page context) */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur md:hidden">
          <Link href="/" className="font-display text-base text-ink">
            Sarmaya
          </Link>
          <nav className="flex gap-3 overflow-x-auto text-[13px]">
            {NAV.filter((n) => n.live).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active === item.href ? "text-brand" : "text-ink-muted"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="ml-auto">
            <ThemeToggle />
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
