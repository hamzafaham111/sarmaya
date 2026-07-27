import type { Section } from "../types";

export const startHere: Section = {
  slug: "start-here",
  title: "Start here",
  blurb:
    "What investing actually is, what has to be true before you begin, and the one force that does most of the work.",
  articles: [
    {
      slug: "roadmap",
      title: "The roadmap: how to use this course",
      summary:
        "Seven stages from zero to a working process, with a checkpoint for each — so you always know what to read next and when to move on.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "This course is a path, not a pile. The sections are ordered so that each stage uses only what earlier stages built, and each stage below ends with a checkpoint — a plain test of whether it has done its job. Read at whatever pace suits you; the checkpoints, not the clock, decide when you move on. Skipping ahead is allowed and normal. Skipping checkpoints is how people end up with opinions about DCF terminal values before they can read a balance sheet.",
        },
        {
          t: "table",
          caption:
            "The seven stages. Total reading is a few evenings; the practice alongside it is what actually teaches.",
          head: ["Stage", "Sections", "You can move on when…"],
          rows: [
            [
              "1. Foundations",
              "Start here",
              "You can explain to someone else why volatility is not risk, and what has to be true about your own money before any of it goes to markets.",
            ],
            [
              "2. The instruments",
              "What you can own",
              "You can say what a share, a fund, an index fund and a bond each actually are, and which costs each one carries.",
            ],
            [
              "3. Reading a business",
              "Studying a business",
              "Given a real annual report, you can find the three statements, compute the margins yourself, and say whether profit became cash that year.",
            ],
            [
              "4. Valuation",
              "Valuation",
              "You can produce a range for one company with your own inputs, and state what growth its current price implies.",
            ],
            [
              "5. The tradition",
              "The investors worth studying",
              "You know whose method you are borrowing when you demand a margin of safety, check pricing power, or invert a question.",
            ],
            [
              "6. The portfolio",
              "Building a portfolio",
              "You have written rules for position sizes and for adding money, decided before looking at any particular stock.",
            ],
            [
              "7. The long game",
              "Behaviour and process · How the market works",
              "Every holding has a written thesis with kill criteria, and you know the tax and cost consequences of your own habits.",
            ],
          ],
        },
        { t: "h", text: "Practice that goes with each stage" },
        {
          t: "p",
          text: "Reading alone does not build the skill — each stage has a natural exercise, and none of them requires committing money. Stage 3 is the one that changes people: pick any company you already know as a customer, download its annual report, and walk it with the line-by-line article open beside you. Do that for three companies and financial statements stop being a foreign language. Stage 4's exercise is to value one of those companies badly — the point of the first valuation is to discover how much the answer moves when your assumptions do.",
        },
        {
          t: "ul",
          items: [
            "Stage 1–2: list your own money by horizon — what is needed within a year, within five, beyond. No products, just buckets.",
            "Stage 3: three annual reports, read with the course's ten-step process. Sarmaya's statements view and annotations are built for exactly this.",
            "Stage 4: one full valuation range, all four models, saved with your assumptions visible.",
            "Stage 5: read one primary source end to end — a single Berkshire letter is an evening.",
            "Stage 6–7: write your rules down before they are tested. A thesis per holding, sizing rules, and what would make you sell — all on paper first.",
          ],
        },
        {
          t: "note",
          kind: "key",
          title: "The order is the method",
          text: "Business first, price second, behaviour throughout. Most expensive mistakes are stage-skipping: valuing a company whose statements you have not read, or sizing a position with no written reason to own it at all.",
        },
        {
          t: "note",
          kind: "watch",
          title: "What this course will never do",
          text: "Nothing here tells you what to buy or sell, and nothing in the app ever will. The course teaches the craft; the decisions — and the reasons for them, written down — are yours.",
        },
      ],
      next: ["what-investing-is", "before-you-invest"],
    },
    {
      slug: "what-investing-is",
      title: "What investing is (and what it isn't)",
      summary:
        "Owning a piece of a productive business versus betting on a price. The difference decides everything else.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "Investing is putting money into something productive and letting it work for years. When you buy a share, you own a slice of a real business — its factories, its brands, its customers, and its future profits. Your return comes from the business earning more over time, and from what it pays back to owners.",
        },
        {
          t: "p",
          text: "Speculating is different. It is a bet that a price will move, usually soon, usually for reasons that have nothing to do with the business earning more. Both are legal, both are common, and both can make or lose money. They are not the same activity and they do not reward the same skills.",
        },
        {
          t: "note",
          kind: "key",
          title: "The distinction that matters",
          text: "An investor asks: will this business be worth more in ten years? A speculator asks: will someone pay me more next month? Neither question is wrong, but confusing the two is how people lose money — they buy with an investor's reasoning and sell with a speculator's nerves.",
        },
        {
          t: "quote",
          text: "Investment is most intelligent when it is most businesslike.",
          who: "Benjamin Graham",
          where:
            "The Intelligent Investor — the nine words Warren Buffett calls the most important ever written about investing",
        },
        { t: "h", text: "Where returns actually come from" },
        {
          t: "p",
          text: "Over long periods, an equity return breaks down into three parts:",
        },
        {
          t: "ul",
          items: [
            "Earnings growth — the business genuinely makes more money than it used to.",
            "Dividends — cash the business hands back to its owners.",
            "Change in the multiple — what other people are willing to pay for each rupee of those earnings.",
          ],
        },
        {
          t: "p",
          text: "The first two are the business working. The third is other people's mood. Over one year, mood dominates and the result looks random. Over ten years, the business dominates. That is the entire case for a long holding period — not patience as a virtue, but patience as the thing that lets the signal outgrow the noise.",
        },
        { t: "h", text: "What this app is for" },
        {
          t: "p",
          text: "Sarmaya is built for the first activity. It gives you statements, ratios, your own valuation models, and a journal that makes you write down why. It deliberately has no tips, no scores, no buy or sell signals, and no predictions. Nothing here will tell you what to do — the tools help you decide, and the journal makes you accountable to your past reasoning.",
        },
      ],
      next: ["before-you-invest", "compounding"],
    },
    {
      slug: "before-you-invest",
      title: "Before you invest a single rupee",
      summary:
        "Four things that need to be settled first. Skipping them is the most common way beginners get hurt.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "Markets are not the first place money should go. Four things generally come first, because each one can force you to sell at the worst possible moment — and being forced to sell is what turns a temporary fall into a permanent loss.",
        },
        { t: "h", text: "1. An emergency fund" },
        {
          t: "p",
          text: "Cash you can reach the same day, sized to cover your living costs for several months. A common convention is three to six months of expenses; people with irregular income often hold more. This is not an investment and it is not supposed to grow — it exists so that a job loss or a hospital bill never becomes a reason to sell your holdings at a bad price.",
        },
        { t: "h", text: "2. Expensive debt" },
        {
          t: "p",
          text: "A credit card charging 36% a year is a guaranteed negative return. No equity portfolio reliably beats that, so money that clears such a balance is doing more work there than in the market. Cheap, long-dated debt like a home loan is a different conversation, and reasonable people disagree about it.",
        },
        { t: "h", text: "3. Insurance" },
        {
          t: "p",
          text: "Health cover, and term life cover if anyone depends on your income. This protects the portfolio from having to be liquidated in a crisis. Note that insurance and investment are separate jobs; products that promise both often do neither well, which is why the costs are worth reading closely.",
        },
        { t: "h", text: "4. Knowing your time horizon" },
        {
          t: "p",
          text: "Money you need in two years and money you need in twenty do not belong in the same place. Equities have historically been rewarding over long stretches and brutally unpredictable over short ones. If a sum has a deadline, that deadline — not your optimism — determines what can hold it.",
        },
        {
          t: "table",
          caption: "A rough way to think about horizon (a convention, not a rule)", // prettier-ignore
          head: ["When you need it", "What the money is exposed to"],
          rows: [
            ["Under 1 year", "Cash and cash-like instruments"],
            ["1–3 years", "Mostly debt instruments; equity risk is hard to justify"], // prettier-ignore
            ["3–7 years", "A mix, weighted to how much of a fall you can sit through"], // prettier-ignore
            ["7+ years", "Equity becomes reasonable for the portion you can leave alone"], // prettier-ignore
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "This is a framework, not advice",
          text: "Your tax position, family obligations, job security and temperament all change these answers. Sarmaya has no idea about any of that, and neither does any article. Treat the table as a way to organise the question, not as an answer.",
        },
      ],
      next: ["risk-and-volatility", "compounding"],
    },
    {
      slug: "compounding",
      title: "Compounding, and why time beats timing",
      summary:
        "The one piece of arithmetic that explains why starting early matters more than being clever.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "Compounding means your returns start earning returns. It sounds trivial and it is not — it is the reason a modest, boring rate over a long period beats an exciting rate over a short one.",
        },
        { t: "formula", expr: "final = principal × (1 + r)^years", note: "r is the annual rate as a decimal; 12% is 0.12." }, // prettier-ignore
        {
          t: "table",
          caption: "₹1,00,000 growing at 12% a year, untouched",
          head: ["Years", "Value", "Of which is growth"],
          rows: [
            ["5", "₹1,76,234", "₹76,234"],
            ["10", "₹3,10,585", "₹2,10,585"],
            ["20", "₹9,64,629", "₹8,64,629"],
            ["30", "₹29,95,992", "₹28,95,992"],
          ],
        },
        {
          t: "p",
          text: "Look at the last column rather than the middle one. In the first five years, most of what you have is what you put in. By year thirty, almost everything you have is growth. The curve does very little for a long time and then does almost all of its work at the end — which is precisely why the most expensive mistake is interrupting it.",
        },
        {
          t: "quote",
          text: "Time is the friend of the wonderful business, the enemy of the mediocre.",
          who: "Warren Buffett",
          where: "1989 Berkshire Hathaway letter",
        },
        { t: "h", text: "The cost of a late start" },
        {
          t: "p",
          text: "Two people each invest ₹10,000 a month at 12%. One starts at 25 and stops at 35 — ten years of contributions, then nothing. The other starts at 35 and contributes until 60 — twenty-five years. At 60 the person who invested for ten years and stopped ends up with roughly the same amount as the person who invested for twenty-five. The difference is not effort; it is the number of years the money had to compound.",
        },
        { t: "h", text: "Where compounding breaks" },
        {
          t: "ul",
          items: [
            "Costs compound too. A 1.5% annual fee does not cost you 1.5% — over thirty years it quietly removes a large share of the final amount, because every rupee of fee is a rupee that never compounds.",
            "Withdrawals reset the clock on the portion withdrawn.",
            "A loss needs a bigger gain to undo it: down 50% needs +100% to get back to level. This asymmetry is why avoiding permanent losses matters more than catching every rise.",
            "The rate is never smooth. A '12% average' contains years of −30% and years of +40%, and you have to be able to sit through the bad ones for the average to ever reach you.",
          ],
        },
        {
          t: "note",
          kind: "key",
          text: "Nothing about compounding requires you to be smart. It requires you to start, keep costs low, and not interrupt it. That is genuinely most of the game.",
        },
      ],
      next: ["risk-and-volatility", "what-is-a-stock"],
    },
    {
      slug: "risk-and-volatility",
      title: "Risk is not the same as volatility",
      summary:
        "Prices bounce around; that is not the thing that can actually hurt you. Learning the difference changes how you behave in a crash.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "Volatility is how much a price moves around. Risk is the chance of permanently losing money, or of not having it when you need it. They get used interchangeably and they are not the same thing.",
        },
        {
          t: "p",
          text: "A good business whose share price fell 40% in a panic became more volatile, but if the business is unharmed the owner has lost nothing permanent — only on paper, and only until the price recovers. A weak business whose price is perfectly stable while its customers quietly leave is not volatile at all, and is genuinely risky.",
        },
        { t: "h", text: "The three ways people actually lose money" },
        {
          t: "ol",
          items: [
            "The business deteriorates — earnings fall and never recover. This is the real one.",
            "You overpay so severely that even a fine business takes many years to grow into the price.",
            "You are forced to sell during a fall, converting a paper loss into a permanent one. This is why the emergency fund comes first.",
          ],
        },
        {
          t: "quote",
          text: "You only find out who is swimming naked when the tide goes out.",
          who: "Warren Buffett",
          where: "2001 Berkshire Hathaway letter — on leverage and falls",
        },
        {
          t: "note",
          kind: "watch",
          title: "Falls are normal, not exceptional",
          text: "Broad equity markets have historically declined 10% or more in a large fraction of all calendar years, and 30%+ declines have occurred repeatedly across decades. A decline is not evidence that something has gone wrong; it is the ordinary cost of the returns.",
        },
        {
          t: "h",
          text: "The risk you can actually measure: your own reaction",
        },
        {
          t: "p",
          text: "Everyone plans to be calm in a crash. The useful exercise is arithmetic: take your intended portfolio, halve it, and look at the number. If a fall from ₹20,00,000 to ₹10,00,000 would make you sell, then a portfolio that can fall by half is the wrong portfolio for you, regardless of what any long-run average says.",
        },
        {
          t: "p",
          text: "This is what a written thesis is for. When the price falls, the question is whether the reasons you wrote down are still true. If they are, the fall is noise. If they are not, the fall is information. Without the written record you cannot tell the difference, and you will decide with your stomach.",
        },
      ],
      next: ["why-write-a-thesis", "diversification"],
    },
    {
      slug: "inflation-rates-currency",
      title: "Inflation, interest rates and the rupee",
      summary:
        "The three background forces every South Asian portfolio lives inside — and how much macro an investor actually needs.",
      minutes: 9,
      body: [
        {
          t: "p",
          text: "You do not need to predict the economy to invest well — nobody reliably can, including the people paid to. But three background forces set the terms for every rupee you invest, and understanding what they do (as opposed to guessing what they will do next) is foundational.",
        },
        { t: "h", text: "Inflation: the hurdle every return must clear" },
        {
          t: "p",
          text: "Inflation is the rate at which money loses purchasing power. Indian consumer inflation has averaged roughly 5–6% a year over recent decades; Pakistan's has been higher and far more volatile, with episodes above 20%. That average is the hurdle: a return below it is a loss wearing a plus sign.",
        },
        {
          t: "formula",
          expr: "real return ≈ nominal return − inflation",
          note: "The exact form is (1 + nominal) ÷ (1 + inflation) − 1, but the subtraction is close enough to think with.",
        },
        {
          t: "p",
          text: "This single line reorders the safety of things. A fixed deposit paying 7% during 6% inflation preserves almost nothing after tax — the interest is taxed at your slab rate, so the real, after-tax return is frequently negative. Equity is the opposite case: volatile over any given year, but a claim on businesses that can raise their prices as money cheapens. 'Safe' and 'stable' are not the same word — the deposit has a stable nominal value and an unstable real one, and over twenty years the difference compounds into the largest financial fact of most households.",
        },
        { t: "h", text: "Interest rates: gravity for every price" },
        {
          t: "p",
          text: "The central bank's policy rate — the RBI's repo rate, the State Bank of Pakistan's policy rate — is the price of money, and it acts on markets the way gravity acts on objects. When the risk-free rate rises, every other asset must offer more to compete, which mechanically means lower prices for the same cash flows. You have already met this force in the valuation section: it is the discount rate. A stock at 40× earnings offers a 2.5% earnings yield; whether that is acceptable depends entirely on what a government bond pays for doing nothing.",
        },
        {
          t: "ul",
          items: [
            "Rates up → future profits worth less today → valuations compress, hitting the longest-duration promises (high-growth, no-profit companies) hardest.",
            "Rates up → borrowing costs rise → leveraged companies' interest cover shrinks. The ratios article's interest-cover check is a rate-cycle stress test.",
            "Rates down → the reverse — and also the environment in which bubbles inflate, because cheap money makes every story affordable.",
          ],
        },
        { t: "h", text: "The rupee: the quiet third force" },
        {
          t: "p",
          text: "The Indian rupee has depreciated against the US dollar by roughly 3–4% a year on average over the long run; the Pakistani rupee faster and more erratically. This is the mechanism connecting inflation differentials between countries, and it touches a portfolio in specific places: it flatters exporters (an IT company earns in dollars and pays salaries in rupees), burdens importers and anyone with dollar debt, and silently adds to the return of any US holding measured in local currency. It is also why Sarmaya never merges your INR, PKR and USD totals — a merged number would hide exactly this force.",
        },
        {
          t: "quote",
          text: "If you spend more than 13 minutes analyzing economic and market forecasts, you've wasted 10 minutes.",
          who: "Peter Lynch",
          where: "One Up on Wall Street",
        },
        { t: "h", text: "How much macro is enough" },
        {
          t: "p",
          text: "Lynch's line is not a joke about ignorance — it is a claim about where the edge is. Forecasting next year's inflation or the next rate decision is a game with no persistent winners. What an investor actually needs is much smaller: know the current hurdle rate your returns must beat, know which of your companies are helped or hurt by rates and the currency (it is in their interest costs and their revenue mix), and know that both cycles turn without announcement. Prepare for the range; skip the prediction.",
        },
        {
          t: "note",
          kind: "key",
          title: "The lakh-crore trap",
          text: "Inflation is also why long-run return stories mislead. 'The index turned one lakh into a crore' across three decades sounds miraculous until you deflate it — a crore then buys what a fraction of it bought at the start. Always ask for real returns when someone quotes long-period magic.",
        },
      ],
      next: ["compounding", "taxes-and-costs"],
    },
  ],
};
