import Link from "next/link";

import { allArticles, SECTIONS, TOTAL_MINUTES } from "@/lib/learn";

export const metadata = {
  title: "Learn — Sarmaya",
  description:
    "A course in investing fundamentals: instruments, studying a business statement by statement, valuation, the investors worth studying, portfolio construction and behaviour.",
};

export default function LearnIndex() {
  const articleCount = allArticles().length;

  return (
    <div>
      <header>
        <h1 className="font-display text-grad-brand text-2xl font-semibold">
          Learn
        </h1>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.75] text-ink-muted">
          Everything a first-time investor needs, in the order it makes sense to
          learn it — what the instruments are, how to study a business statement
          by statement (with real audited accounts as the worked examples), how
          valuation works and why it is always a range, the investors whose
          ideas these tools come from, how to build a portfolio, and the
          behaviour that decides most outcomes.
        </p>
        <p className="font-numeric mt-3 text-xs text-ink-muted">
          {SECTIONS.length} sections · {articleCount} articles · about{" "}
          {Math.round(TOTAL_MINUTES / 60)}h {TOTAL_MINUTES % 60}m of reading
        </p>
      </header>

      <aside className="bg-grad-surface mt-6 max-w-[72ch] rounded-xl border border-line border-l-2 border-l-warn px-5 py-4">
        <p className="mb-1.5 text-[12px] font-semibold tracking-wide text-warn uppercase">
          Education, not advice
        </p>
        <p className="text-[15px] leading-[1.7] text-ink">
          Nothing here recommends any security, predicts any price, or tells you
          what to do with your money. It explains how things work and what the
          trade-offs are, so your decisions are your own and you know what you
          are deciding. For anything that depends on your tax position or
          personal circumstances, talk to a registered adviser.
        </p>
      </aside>

      <div className="mt-10 space-y-10">
        {SECTIONS.map((section, i) => (
          <section key={section.slug}>
            <div className="mb-1 flex items-baseline gap-3">
              <span className="font-numeric text-grad-brand text-lg font-semibold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-lg font-semibold text-ink">
                {section.title}
              </h2>
            </div>
            <p className="mb-4 max-w-[68ch] text-[14px] text-ink-muted">
              {section.blurb}
            </p>

            <ul className="grid gap-3 sm:grid-cols-2">
              {section.articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/learn/${article.slug}`}
                    className="pressable-row bg-grad-surface block h-full rounded-xl border border-line p-4 hover:border-brand/50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-semibold text-ink">
                        {article.title}
                      </span>
                      <span className="font-numeric shrink-0 text-[12px] text-ink-muted">
                        {article.minutes}m
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] leading-[1.65] text-ink-muted">
                      {article.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
