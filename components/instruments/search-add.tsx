"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  isPlausibleUsTicker,
  searchCatalog,
  type CatalogEntry,
} from "@/lib/catalog";

// Client-side fuzzy search over the static in-repo universe — no external
// search API (CLAUDE.md). Picking a result submits the server-action form.
export function SearchAdd({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [funds, setFunds] = useState<CatalogEntry[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const symbolRef = useRef<HTMLInputElement>(null);
  const marketRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // The fund list is 10× the stock universe — load it lazily, off the
    // critical path.
    let cancelled = false;
    import("@/lib/catalog").then(async (m) => {
      const entries = await m.loadFundEntries();
      if (!cancelled) setFunds(entries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const base = searchCatalog(query);
    const q = query.trim().toUpperCase();
    if (!q || q.length < 3) return base;
    const fundHits = funds
      .filter((f) => f.name.toUpperCase().includes(q))
      .slice(0, Math.max(0, 8 - base.length));
    return [...base, ...fundHits];
  }, [query, funds]);
  const usFallback =
    query && results.length === 0 && isPlausibleUsTicker(query);

  function pick(symbol: string, market: string, kind: string) {
    if (
      symbolRef.current &&
      marketRef.current &&
      kindRef.current &&
      formRef.current
    ) {
      symbolRef.current.value = symbol;
      marketRef.current.value = market;
      kindRef.current.value = kind;
      formRef.current.requestSubmit();
    }
  }

  return (
    <div className="relative max-w-md">
      <form ref={formRef} action={action}>
        <input type="hidden" name="symbol" ref={symbolRef} />
        <input type="hidden" name="market" ref={marketRef} />
        <input type="hidden" name="kind" ref={kindRef} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search NSE stocks, funds, indices… (e.g. reliance)"
          className="w-full rounded-sm border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none"
          aria-label="Search instruments"
        />
      </form>

      {open && (results.length > 0 || usFallback) ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-sm border border-line bg-surface shadow-lg">
          {results.map((e) => (
            <li key={`${e.market}:${e.symbol}`}>
              <button
                type="button"
                onMouseDown={() => pick(e.symbol, e.market, e.kind)}
                className="flex w-full items-baseline justify-between px-4 py-3 text-left text-sm pressable-row hover:bg-surface-2"
              >
                <span>
                  <span className="font-numeric font-medium text-ink">
                    {e.display}
                  </span>
                  <span className="ml-2 text-ink-muted">{e.name}</span>
                </span>
                <span className="text-[12px] text-ink-muted">
                  {e.kind} · {e.market}
                </span>
              </button>
            </li>
          ))}
          {usFallback ? (
            <li>
              <button
                type="button"
                onMouseDown={() =>
                  pick(query.trim().toUpperCase(), "US", "stock")
                }
                className="flex w-full items-baseline justify-between px-4 py-3 text-left text-sm pressable-row hover:bg-surface-2"
              >
                <span className="text-ink">
                  Add{" "}
                  <span className="font-numeric font-medium">
                    {query.trim().toUpperCase()}
                  </span>{" "}
                  as a US ticker
                </span>
                <span className="text-[12px] text-ink-muted">stock · US</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
