import type { Block } from "@/lib/learn";

// Renders the content blocks. Prose gets a comfortable measure (~68
// characters) because long lines are the main thing that makes
// documentation tiring to read.

const NOTE_STYLE: Record<
  string,
  { edge: string; label: string; tone: string }
> = {
  key: { edge: "border-l-brand", label: "Key idea", tone: "text-brand" },
  watch: { edge: "border-l-warn", label: "Watch out", tone: "text-warn" },
  example: { edge: "border-l-gold", label: "In practice", tone: "text-gold" },
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return (
        <p className="max-w-[68ch] text-[15px] leading-[1.75] text-ink">
          {block.text}
        </p>
      );

    case "h":
      return (
        <h2 className="font-display mt-9 flex items-center gap-3 text-lg font-semibold text-ink">
          {block.text}
          <span aria-hidden className="rule-grad h-px flex-1 opacity-40" />
        </h2>
      );

    case "ul":
      return (
        <ul className="max-w-[68ch] space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-[1.7]">
              <span
                aria-hidden
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand"
              />
              <span className="text-ink">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="max-w-[68ch] space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-[1.7]">
              <span
                aria-hidden
                className="font-numeric bg-grad-brand-soft mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-brand"
              >
                {i + 1}
              </span>
              <span className="text-ink">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <figure className="max-w-[76ch]">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-max text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  {block.head.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left font-medium text-ink-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-2.5 text-ink ${j > 0 ? "font-numeric tabular-nums" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption ? (
            <figcaption className="mt-2 text-xs text-ink-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "note": {
      const style = NOTE_STYLE[block.kind];
      return (
        <aside
          className={`bg-grad-surface max-w-[72ch] rounded-r-xl border border-line border-l-2 ${style.edge} px-5 py-4`}
        >
          <p
            className={`mb-1.5 text-[12px] font-semibold tracking-wide uppercase ${style.tone}`}
          >
            {block.title ?? style.label}
          </p>
          <p className="text-[15px] leading-[1.7] text-ink">{block.text}</p>
        </aside>
      );
    }

    case "formula":
      return (
        <div className="max-w-[72ch]">
          <pre className="font-numeric overflow-x-auto rounded-xl border border-line bg-surface-2 px-5 py-4 text-[14px] text-ink">
            {block.expr}
          </pre>
          {block.note ? (
            <p className="mt-2 text-xs text-ink-muted">{block.note}</p>
          ) : null}
        </div>
      );

    case "terms":
      return (
        <dl className="max-w-[72ch] divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {block.items.map((item) => (
            <div key={item.term} className="px-5 py-3.5">
              <dt className="text-[15px] font-semibold text-ink">
                {item.term}
              </dt>
              <dd className="mt-1 text-[14px] leading-[1.7] text-ink-muted">
                {item.def}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}
