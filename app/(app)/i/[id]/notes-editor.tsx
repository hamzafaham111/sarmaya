"use client";

import { useEffect, useRef, useState } from "react";

import { saveNotes } from "./actions";

// Autosaved markdown notes — positioned last on the page; the in-context
// thinking lives in cell annotations.
export function NotesEditor({
  instrumentId,
  initialNotes,
}: {
  instrumentId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(initialNotes);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onChange(value: string) {
    setNotes(value);
    latest.current = value;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const result = await saveNotes({
        instrumentId,
        notesMd: latest.current,
      });
      setStatus(result.ok ? "saved" : "error");
    }, 800);
  }

  return (
    <section className="mt-10">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-ink">Notes</h2>
        <span
          className={`text-xs ${status === "error" ? "text-neg" : "text-ink-muted"}`}
        >
          {status === "saving"
            ? "Saving…"
            : status === "error"
              ? "Couldn't save"
              : "Saved"}
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Your research notes (markdown)…"
        className="font-numeric w-full rounded-xl border border-line bg-surface p-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none"
      />
    </section>
  );
}
