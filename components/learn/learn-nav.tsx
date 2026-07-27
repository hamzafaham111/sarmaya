"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import type { Section } from "@/lib/learn";

/**
 * The documentation sidebar: every section and article, with a filter.
 * Client-side because the filter is instant and the whole curriculum is
 * already in the bundle — no round trip to search.
 */
export function LearnNav({ sections }: { sections: Section[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        articles: section.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.articles.length > 0);
  }, [sections, query]);

  return (
    <nav
      className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1 lg:pb-6"
      aria-label="Learn contents"
    >
      <label className="block">
        <span className="sr-only">Filter topics</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter topics…"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none"
        />
      </label>

      <div className="mt-4 space-y-6">
        {filtered.map((section) => {
          const number = sections.findIndex((s) => s.slug === section.slug) + 1;
          const current = section.articles.some(
            (a) => pathname === `/learn/${a.slug}`,
          );
          return (
            <div key={section.slug}>
              <p className="mb-2 flex items-baseline gap-2">
                <span
                  className={`font-numeric text-[12px] font-bold ${
                    current ? "text-gold" : "text-brand"
                  }`}
                >
                  {String(number).padStart(2, "0")}
                </span>
                <span
                  className={`text-[13px] font-bold tracking-[0.06em] uppercase ${
                    current ? "text-grad-brand" : "text-ink"
                  }`}
                >
                  {section.title}
                </span>
              </p>
              <ul
                className={`space-y-0.5 border-l ${current ? "border-brand/40" : "border-line"}`}
              >
                {section.articles.map((article) => {
                  const href = `/learn/${article.slug}`;
                  const active = pathname === href;
                  return (
                    <li key={article.slug}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`pressable-row -ml-px block border-l-2 py-1.5 pl-3 text-[14px] leading-snug ${
                          active
                            ? "border-l-brand bg-brand/8 font-semibold text-brand"
                            : current
                              ? "border-l-transparent text-ink hover:border-l-brand/40"
                              : "border-l-transparent text-ink-muted hover:border-l-line hover:text-ink"
                        }`}
                      >
                        {article.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="text-xs text-ink-muted">Nothing matches that.</p>
        ) : null}
      </div>
    </nav>
  );
}
