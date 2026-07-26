// The Learn section is a small documentation engine: content is data, not
// markup, so adding an article never means touching a component.
//
// Editorial rules (they are not negotiable — CLAUDE.md):
//   - Explain, never advise. No "you should", no recommendations, no
//     opinions on any specific security.
//   - The forbidden-copy list in CLAUDE.md's valuation doctrine applies here
//     too, and is grep-enforced. Say "price is above/below your estimate
//     range" rather than any judgement word about whether a price is right.
//   - Say plainly when something is a rule of thumb, a convention, or
//     genuinely unsettled.

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | { t: "note"; kind: "key" | "watch" | "example"; title?: string; text: string } // prettier-ignore
  | { t: "formula"; expr: string; note?: string }
  | { t: "terms"; items: { term: string; def: string }[] };

export interface Article {
  slug: string;
  title: string;
  /** One line, shown on cards and in search results. */
  summary: string;
  /** ~how long to read, minutes. */
  minutes: number;
  body: Block[];
  /** Slugs of articles worth reading next. */
  next?: string[];
}

export interface Section {
  slug: string;
  title: string;
  blurb: string;
  articles: Article[];
}
