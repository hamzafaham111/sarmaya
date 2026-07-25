"use client";

import { useTheme } from "next-themes";

// Dark is the default (terminals live in dark); light via this toggle.
// No mounted-state dance: both labels render and CSS picks one from the
// html.dark class, so server and client markup always match.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-sm border border-line bg-surface px-2 py-1 text-xs text-ink-muted transition hover:text-ink"
      aria-label="Toggle color theme"
    >
      <span className="dark:hidden">☾ dark</span>
      <span className="hidden dark:inline">☀ light</span>
    </button>
  );
}
