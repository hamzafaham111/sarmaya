import Link from "next/link";

import { ThemeToggle } from "@/components/base/theme-toggle";
import { NavLinks } from "@/components/shell/nav-links";

// The terminal chrome: fixed sidebar on desktop, top nav on mobile.
export function AppShell({
  children,
  userEmail,
  signOut,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
  signOut?: () => Promise<void>;
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
        <NavLinks orientation="side" />
        <div className="space-y-2 border-t border-line px-4 py-3">
          {userEmail ? (
            <p
              className="truncate text-[11px] text-ink-muted"
              title={userEmail}
            >
              {userEmail}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            {signOut ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs text-ink-muted underline underline-offset-4 transition hover:text-ink"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur md:hidden">
          <Link href="/" className="font-display text-base text-ink">
            Sarmaya
          </Link>
          <NavLinks orientation="top" />
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {signOut ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs text-ink-muted underline underline-offset-4"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
