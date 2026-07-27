import Link from "next/link";
import { notFound } from "next/navigation";

import { Blocks, headingId } from "@/components/learn/blocks";
import { findArticle, neighbours, READING_ORDER } from "@/lib/learn";

export function generateStaticParams() {
  return READING_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = findArticle(slug);
  if (!found) return { title: "Learn — Sarmaya" };
  return {
    title: `${found.article.title} — Sarmaya`,
    description: found.article.summary,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = findArticle(slug);
  if (!found) notFound();

  const { article, section } = found;
  const { prev, next } = neighbours(slug);
  const related = (article.next ?? [])
    .map((s) => findArticle(s))
    .filter((r): r is NonNullable<typeof r> => r !== null);
  const headings = article.body.filter((b) => b.t === "h");

  return (
    <article className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-12">
      {headings.length >= 3 ? (
        <aside className="hidden xl:order-2 xl:block">
          <nav
            aria-label="On this page"
            className="sticky top-6 border-l border-line pl-4"
          >
            <p className="mb-2 text-[12px] font-bold tracking-[0.06em] text-ink uppercase">
              On this page
            </p>
            <ul className="space-y-1.5">
              {headings.map((h) => (
                <li key={h.text}>
                  <a
                    href={`#${headingId(h.text)}`}
                    className="pressable block text-[13px] leading-snug text-ink-muted hover:text-brand"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      ) : null}

      <div className="min-w-0 xl:order-1">
        <nav className="mb-3 flex items-center gap-2 text-[12px] text-ink-muted">
          <Link href="/learn" className="pressable hover:text-brand">
            Learn
          </Link>
          <span aria-hidden>/</span>
          <span>{section.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {article.title}
          </h1>
          <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.7] text-ink-muted">
            {article.summary}
          </p>
          <p className="font-numeric mt-2 text-[12px] text-ink-muted">
            {article.minutes} min read
          </p>
          <div aria-hidden className="rule-grad mt-5 h-0.5 w-24 rounded-full" />
        </header>

        <Blocks blocks={article.body} />

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="mb-3 text-[12px] font-semibold tracking-wide text-ink-muted uppercase">
              Read next
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map(({ article: a }) => (
                <li key={a.slug}>
                  <Link
                    href={`/learn/${a.slug}`}
                    className="pressable-row bg-grad-surface block h-full rounded-xl border border-line p-4 hover:border-brand/50"
                  >
                    <span className="text-[15px] font-semibold text-ink">
                      {a.title}
                    </span>
                    <p className="mt-1 text-[14px] leading-[1.6] text-ink-muted">
                      {a.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav className="mt-12 flex flex-wrap items-stretch justify-between gap-3 border-t border-line pt-5">
          {prev ? (
            <Link
              href={`/learn/${prev.article.slug}`}
              className="pressable-row rounded-xl border border-line px-4 py-3 hover:border-brand/50"
            >
              <span className="block text-[12px] text-ink-muted">Previous</span>
              <span className="text-[14px] font-medium text-ink">
                {prev.article.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${next.article.slug}`}
              className="pressable-row rounded-xl border border-line px-4 py-3 text-right hover:border-brand/50"
            >
              <span className="block text-[12px] text-ink-muted">Next</span>
              <span className="text-[14px] font-medium text-ink">
                {next.article.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  );
}
