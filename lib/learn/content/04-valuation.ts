import type { Section } from "../types";

export const valuation: Section = {
  slug: "valuation",
  title: "Valuation",
  blurb:
    "Why there is no single number, what each model assumes, and where each one breaks.",
  articles: [
    {
      slug: "no-single-value",
      title: "Why there is no single value",
      summary:
        "Every valuation is a forecast wearing a decimal point. Ranges are honest; single numbers are not.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "The value of a business is the cash it will produce for its owners over the rest of its life, discounted back to today. That definition is precise and completely unusable, because nobody knows either the future cash or the right discount rate. Every valuation method is a way of guessing those two things with structure.",
        },
        {
          t: "p",
          text: "This is why any single figure presented as the value of a company is misleading. Change the growth assumption by two percentage points and the answer moves enormously. The output is not a measurement — it is your assumptions, arithmetic done on them, expressed to a suspicious level of precision.",
        },
        {
          t: "note",
          kind: "key",
          title: "The doctrine this app is built on",
          text: "Sarmaya computes four independent models side by side and shows the span between them as a band, with the current price marked against it. It will never blend them into one number, and it will never tell you a price is too high or too low. The range is yours; the reading of it is yours too.",
        },
        { t: "h", text: "How to read the band" },
        {
          t: "p",
          text: "A wide band means the models disagree, which usually means the outcome genuinely depends on assumptions nobody can pin down — a young company, a cyclical business, or one in transition. A narrow band means the methods agree, which is more comfortable but is not proof; they can share the same wrong assumption.",
        },
        {
          t: "p",
          text: "Where the price sits relative to the band is a starting point for a question, not an answer. Price below your range means either the market sees a problem you have not modelled, or your assumptions are more optimistic than theirs. Both are worth writing down before acting.",
        },
        { t: "h", text: "Margin of safety" },
        {
          t: "p",
          text: "The traditional response to all this uncertainty is to require a gap between price and your estimate before committing — a buffer for being wrong. The size of the buffer is a judgement about how confident you are, and confidence should be lowest exactly where the business is hardest to forecast.",
        },
        {
          t: "quote",
          text: "Confronted with a challenge to distill the secret of sound investment into three words, we venture the motto, margin of safety.",
          who: "Benjamin Graham",
          where: "The Intelligent Investor, chapter 20",
        },
        {
          t: "p",
          text: "The idea is nearly a century old and remains the intellectual foundation of everything on this page — the Graham article in the Masters section traces where it came from and what it survived.",
        },
      ],
      next: ["dcf", "graham"],
    },
    {
      slug: "dcf",
      title: "Discounted cash flow",
      summary:
        "Project the cash, discount it back. The most theoretically correct method and the easiest to fool yourself with.",
      minutes: 9,
      body: [
        {
          t: "p",
          text: "A DCF says a business is worth the cash it will generate, adjusted for the fact that a rupee in ten years is worth less than a rupee today. You forecast free cash flow for a number of years, estimate a value for everything after that, and discount it all back.",
        },
        {
          t: "formula",
          expr: "value = Σ [ FCF_year ÷ (1 + r)^year ] + terminal value ÷ (1 + r)^n",
          note: "r is your discount rate; n is the number of forecast years.",
        },
        { t: "h", text: "The inputs, and what each one is really saying" },
        {
          t: "terms",
          items: [
            {
              term: "Starting FCF",
              def: "The most recent free cash flow. If it is unusually high or low this year, the whole model inherits that distortion.",
            },
            {
              term: "Growth rate",
              def: "How fast you think that cash grows. Sarmaya seeds this from the company's own 5-year history, capped at 20%, and labels it 'auto — edit me'. It is a starting point, not a finding.",
            },
            {
              term: "Growth years",
              def: "How long the growth lasts before the business settles. Ten years of above-average growth is a strong claim about competitive advantage.",
            },
            {
              term: "Discount rate",
              def: "Your required annual return, compensating for risk and for waiting. Higher means you demand more, which lowers the value. 12% is a common default in Indian equity work; it is a convention, not a fact.",
            },
            {
              term: "Terminal multiple",
              def: "What the business is worth at the end of the forecast. This single number frequently accounts for the majority of the total — which is precisely why the method feels more rigorous than it is.",
            },
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "The honest weakness",
          text: "A DCF is extremely sensitive to the growth rate, the discount rate and the terminal assumption — three numbers nobody knows. Small changes produce very different answers, so it is entirely possible to justify almost any conclusion by nudging inputs that all look reasonable. Treat it as a way to make your assumptions explicit, not as a measurement of the company.",
        },
        { t: "h", text: "What exactly is being discounted: owner earnings" },
        {
          t: "p",
          text: "The intellectual ancestor of the FCF a DCF discounts is Warren Buffett's 'owner earnings', defined in the appendix to his 1986 shareholder letter:",
        },
        {
          t: "formula",
          expr: "owner earnings = reported earnings\n               + depreciation, amortisation and other non-cash charges\n               − maintenance capex",
          note: "Maintenance capex — the spending needed just to hold position and volume — must be estimated; it appears in no statement.",
        },
        {
          t: "p",
          text: "Free cash flow is the computable stand-in: it subtracts all capex, including growth spending, so for a company investing heavily it understates what the owner could take out — a conservative bias worth knowing you have. For a business whose capex is mostly maintenance, the two are nearly the same figure. When a DCF looks wrong for a heavy investor, this line is usually why, and the honest fix is judgement about how much of the capex builds versus maintains — not a bigger growth rate.",
        },
        { t: "h", text: "When it does not apply" },
        {
          t: "p",
          text: "If free cash flow is negative or unavailable, there is nothing to discount and Sarmaya says 'not applicable' with the reason rather than producing a number. That covers many young companies, most banks (whose cash flows work differently), and businesses in a heavy investment phase.",
        },
      ],
      next: ["reverse-dcf", "graham-and-epv"],
    },
    {
      slug: "graham-and-epv",
      title: "Graham number and Earnings Power Value",
      summary:
        "Two methods that deliberately refuse to forecast growth — and what that buys you.",
      minutes: 7,
      body: [
        { t: "h", text: "The Graham number" },
        {
          t: "p",
          text: "A deliberately crude formula from Benjamin Graham's era, combining earnings and book value into a conservative reference point for a defensive investor.",
        },
        {
          t: "formula",
          expr: "Graham number = √(22.5 × EPS × book value per share)",
        },
        {
          t: "p",
          text: "The 22.5 comes from Graham's rule of thumb that price should not exceed 15× earnings nor 1.5× book value (15 × 1.5 = 22.5). It assumes no growth at all and leans heavily on book value.",
        },
        {
          t: "ul",
          items: [
            "It suits stable, asset-heavy, profitable businesses — the kind Graham was writing about.",
            "It badly understates asset-light companies, where the value is brands, software or people rather than anything on the balance sheet.",
            "It is not applicable when EPS is negative — the arithmetic has no meaning without profits.",
            "It was designed in a different market, in a different era, with different accounting. Use it as one reference point among several, which is exactly how Sarmaya presents it.",
          ],
        },
        { t: "h", text: "Earnings Power Value" },
        {
          t: "p",
          text: "EPV asks a narrower and more answerable question: what is this business worth if it simply keeps earning what it earns now, forever, with no growth at all?",
        },
        {
          t: "formula",
          expr: "EPV = (normalised operating income × (1 − tax rate) ÷ discount rate) − debt + cash",
          note: "Capitalise the after-tax operating profit, then adjust for the balance sheet.",
        },
        {
          t: "p",
          text: "By refusing to forecast growth, EPV removes the assumption most likely to be wrong. That makes it conservative and unusually informative in comparison: if the market price is far above EPV, the difference is what the market is paying for growth that has not happened yet. Whether that is reasonable is a judgement you make with the rest of your research.",
        },
        {
          t: "note",
          kind: "key",
          text: "'Normalised' operating income means a figure representative of a typical year, not a peak or a trough. For a cyclical business, using the top of the cycle produces a badly inflated answer.",
        },
        {
          t: "p",
          text: "EPV as a formal method was systematised by Bruce Greenwald at Columbia, deliberately extending Graham: pay for the assets and the demonstrated earning power; treat growth as a separate question you answer with evidence about the moat, not with a spreadsheet cell.",
        },
        {
          t: "h",
          text: "A period piece worth knowing: Graham's growth formula",
        },
        {
          t: "p",
          text: "The Intelligent Investor also contains a quick growth heuristic, quoted everywhere and worth knowing mostly so you are not impressed by it:",
        },
        {
          t: "formula",
          expr: "value = EPS × (8.5 + 2g)",
          note: "g is the expected annual growth rate over 7–10 years, as a whole number — g = 10 means 10%.",
        },
        {
          t: "p",
          text: "It says a no-growth business deserves about 8.5× earnings and each point of long-run growth adds two multiples. Graham himself attached warnings to it, and later editions add more: it has no margin of safety in it, and it prices decade-long growth — the least knowable input in investing — at a flat rate. Its one genuinely useful mode is run backwards: implied g = (P/E − 8.5) ÷ 2. A stock at 45× earnings implies roughly 18% annual growth for a decade under this formula — a claim you can compare against the company's actual record, which is precisely the reverse-DCF habit with older arithmetic.",
        },
      ],
      next: ["reverse-dcf", "graham"],
    },
    {
      slug: "reverse-dcf",
      title: "Reverse DCF: what is the price already assuming?",
      summary:
        "Instead of guessing growth to get a value, take the price as given and solve for the growth it implies.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "A reverse DCF turns the question around. Rather than feeding in a growth rate to produce a value, it takes today's price as the answer and solves for the growth rate that would justify it. Sarmaya does this by bisection, and refuses gracefully when no rate in a sensible range can reach the price.",
        },
        {
          t: "p",
          text: "The output is a single, checkable claim: 'at this price, the market is assuming roughly this much annual growth for this many years'. That is far easier to have an opinion about than an abstract target value.",
        },
        {
          t: "note",
          kind: "example",
          title: "How to use it",
          text: "Compare the implied rate against what the company has actually achieved over the last five and ten years. If the price implies 18% annual growth and the business has compounded at 9% through good conditions, you have found the exact assumption you would need to believe. You may still believe it — but now you know what you are believing.",
        },
        { t: "h", text: "Why this is often the most useful of the four" },
        {
          t: "ul",
          items: [
            "It removes the temptation to reverse-engineer inputs until the answer matches what you already wanted to conclude.",
            "It produces a claim you can test against history rather than a number you can only accept or reject.",
            "It makes disagreement precise: you are no longer arguing about whether a company is 'good', but about whether a specific growth rate is achievable.",
          ],
        },
        {
          t: "p",
          text: "It inherits every weakness of the forward DCF — the discount rate and terminal assumption are still yours, and still arbitrary. It simply moves the uncertainty somewhere you can see it.",
        },
        {
          t: "p",
          text: "The habit of mind behind this tool is inversion — solving the problem backwards — which Charlie Munger spent a career advocating; his article in the Masters section covers where it came from and what else it is good for.",
        },
      ],
      next: ["munger", "position-sizing"],
    },
  ],
};
