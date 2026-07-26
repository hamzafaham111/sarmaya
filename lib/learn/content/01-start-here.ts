import type { Section } from "../types";

export const startHere: Section = {
  slug: "start-here",
  title: "Start here",
  blurb:
    "What investing actually is, what has to be true before you begin, and the one force that does most of the work.",
  articles: [
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
  ],
};
