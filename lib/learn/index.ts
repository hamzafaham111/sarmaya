import { startHere } from "./content/01-start-here";
import { instruments } from "./content/02-instruments";
import { readingABusiness } from "./content/03-reading-a-business";
import { valuation } from "./content/04-valuation";
import { masters } from "./content/05-masters";
import { portfolio } from "./content/06-portfolio";
import { behaviour } from "./content/07-behaviour";
import { mechanics } from "./content/08-mechanics";
import { glossary } from "./content/09-glossary";
import type { Article, Section } from "./types";

export type { Article, Block, Section } from "./types";

/** The curriculum, in reading order. Add a section by writing a file in
 *  ./content and listing it here — no component needs to change. */
export const SECTIONS: Section[] = [
  startHere,
  instruments,
  readingABusiness,
  valuation,
  masters,
  portfolio,
  behaviour,
  mechanics,
  glossary,
];

export interface Located {
  article: Article;
  section: Section;
}

const BY_SLUG = new Map<string, Located>();
for (const section of SECTIONS) {
  for (const article of section.articles) {
    BY_SLUG.set(article.slug, { article, section });
  }
}

export function findArticle(slug: string): Located | null {
  return BY_SLUG.get(slug) ?? null;
}

export function allArticles(): Located[] {
  return [...BY_SLUG.values()];
}

/** Reading order across the whole curriculum, for prev/next links. */
export const READING_ORDER: string[] = SECTIONS.flatMap((s) =>
  s.articles.map((a) => a.slug),
);

export function neighbours(slug: string): {
  prev: Located | null;
  next: Located | null;
} {
  const i = READING_ORDER.indexOf(slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? findArticle(READING_ORDER[i - 1]) : null,
    next:
      i < READING_ORDER.length - 1 ? findArticle(READING_ORDER[i + 1]) : null,
  };
}

export const TOTAL_MINUTES = allArticles().reduce(
  (sum, { article }) => sum + article.minutes,
  0,
);
