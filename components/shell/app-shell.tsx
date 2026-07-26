import Link from "next/link";

import { ThemeToggle } from "@/components/base/theme-toggle";
import { NavLinks } from "@/components/shell/nav-links";

// The terminal chrome: fixed sidebar on desktop, top nav on mobile.
// v3: the shell carries a gradient so the content surfaces read as raised
// panels sitting on it.
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
      <aside className="bg-grad-shell sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line md:flex">
        <div className="px-5 py-5">
          <Link
            href="/"
            className="pressable font-display inline-flex items-center gap-2 text-xl font-semibold"
          >
            <span
              aria-hidden
              className="bg-grad-brand inline-block size-6 rounded-lg"
            />
            <span className="text-grad-brand">Sarmaya</span>
          </Link>
          <p className="mt-1 text-[12px] text-ink-muted">research terminal</p>
        </div>
        <NavLinks orientation="side" />
        <div className="space-y-2.5 border-t border-line px-5 py-4">
          {userEmail ? (
            <p
              className="truncate text-[12px] text-ink-muted"
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
                  className="pressable rounded-lg border border-line px-2.5 py-1 text-xs text-ink-muted hover:border-neg/50 hover:text-neg"
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
        <header className="bg-grad-shell sticky top-0 z-10 flex items-center gap-4 border-b border-line px-4 py-3 backdrop-blur md:hidden">
          <Link
            href="/"
            className="pressable font-display shrink-0 text-base font-semibold"
          >
            <span className="text-grad-brand">Sarmaya</span>
          </Link>
          <NavLinks orientation="top" />
          <span className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {signOut ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="pressable rounded-lg border border-line px-2 py-1 text-xs text-ink-muted"
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
