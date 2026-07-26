import type { Section } from "../types";

export const instruments: Section = {
  slug: "instruments",
  title: "What you can own",
  blurb:
    "Stocks, mutual funds, index funds and indices — what each one actually is, and what it costs you to hold.",
  articles: [
    {
      slug: "what-is-a-stock",
      title: "What a share actually is",
      summary:
        "Part-ownership of a business, with all the rights and none of the guarantees.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "A share is a unit of ownership in a company. Own one share out of ten crore, and you own a ten-croreth of everything the company owns and everything it earns. That is the whole idea; every price on every screen is people disagreeing about what that slice is worth.",
        },
        { t: "h", text: "What ownership entitles you to" },
        {
          t: "ul",
          items: [
            "A claim on profits, paid out as dividends when the board declares them — and retained inside the business when it does not.",
            "A vote on certain decisions, proportional to your holding. For a retail holder this is usually symbolic.",
            "A claim on what is left if the company is wound up — after employees, tax, lenders and preference holders. Ordinary shareholders are last in that queue, which is exactly why equity returns more than debt over time, and why it can go to zero.",
          ],
        },
        {
          t: "note",
          kind: "key",
          text: "Nobody owes you a return. A bond has a promised coupon; a fixed deposit has a promised rate. A share promises nothing at all. You are paid for accepting that.",
        },
        { t: "h", text: "Price and value are different things" },
        {
          t: "p",
          text: "The price is what the last two people agreed on, minutes ago. It reflects everything those people knew, felt, feared and needed — including the fact that one of them may have simply needed cash that day. Value is what the business will actually produce for its owners over its life. Price is observable and precise; value is unobservable and can only ever be estimated. Most of investing lives in that gap.",
        },
        { t: "h", text: "Market capitalisation" },
        {
          t: "formula",
          expr: "market cap = share price × shares outstanding",
          note: "What the market says the whole company is worth right now.",
        },
        {
          t: "p",
          text: "Market cap, not share price, is the size of the company. A ₹50 share is not 'cheaper' than a ₹5,000 share — the two numbers are not comparable at all until you know how many shares exist and how much the business earns. This confuses more beginners than almost anything else.",
        },
      ],
      next: ["mutual-funds", "the-three-statements"],
    },
    {
      slug: "mutual-funds",
      title: "Mutual funds: the plumbing that matters",
      summary:
        "NAV, direct vs regular, growth vs IDCW, and the expense ratio that quietly decides your outcome.",
      minutes: 8,
      body: [
        {
          t: "p",
          text: "A mutual fund pools money from many people and a manager invests it according to a stated mandate. You own units, not the underlying shares. It is the most common way people in India own equity, and most of the important decisions are about structure and cost rather than about picking a winner.",
        },
        { t: "h", text: "NAV — and what it does not tell you" },
        {
          t: "formula",
          expr: "NAV = (value of everything the fund holds − its liabilities) ÷ units outstanding", // prettier-ignore
        },
        {
          t: "p",
          text: "NAV is published once a day; funds do not trade continuously like shares. A fund with a NAV of ₹15 is not cheaper than one at ₹500, and a low NAV leaves no more 'room to grow'. NAV only tells you what one unit is worth today. Comparing two funds by NAV is meaningless — compare returns, cost and mandate instead.",
        },
        { t: "h", text: "Direct vs regular — the single biggest lever" },
        {
          t: "p",
          text: "The same fund is usually sold in two plans. A regular plan pays a commission to a distributor out of the fund's assets every year. A direct plan does not. Same manager, same portfolio, same strategy — different annual cost, often by 0.5% to 1.0% a year.",
        },
        {
          t: "table",
          caption:
            "₹10,000 monthly for 20 years at 12% before costs — illustrative",
          head: ["Annual cost", "Approx. final value", "Given up to cost"],
          rows: [
            ["0.2% (index, direct)", "≈ ₹95.6 lakh", "—"],
            ["1.0% (active, direct)", "≈ ₹87.1 lakh", "≈ ₹8.5 lakh"],
            ["1.8% (active, regular)", "≈ ₹79.4 lakh", "≈ ₹16.2 lakh"],
          ],
        },
        {
          t: "note",
          kind: "watch",
          text: "Those figures are illustrative arithmetic on a constant assumed return, not a forecast. The point is only the shape: a fraction of a percent per year becomes a large number over decades, because every rupee of fee is a rupee that never compounds.",
        },
        { t: "h", text: "Growth vs IDCW" },
        {
          t: "p",
          text: "A growth option keeps gains inside the fund, so your NAV rises. An IDCW option (Income Distribution cum Capital Withdrawal, formerly called 'dividend') pays some out, and the NAV drops by what was paid. IDCW is not free income — it is your own money returned, with tax consequences. The name was changed by the regulator precisely because 'dividend' misled people into thinking it was extra.",
        },
        { t: "h", text: "Reading a fund honestly" },
        {
          t: "ul",
          items: [
            "Expense ratio — the annual cost, deducted from NAV. You never see it as a charge; it is simply return you do not get.",
            "Exit load — a fee for leaving early, typically within a year.",
            "AUM — how much the fund manages. Very large funds in small-cap mandates face real constraints buying and selling.",
            "Mandate and category — what it is allowed to hold. A flexi-cap and a small-cap fund are not comparable.",
            "Manager tenure — a ten-year record under a manager who left last year tells you about a person who is gone.",
          ],
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "Funds are tracked by their AMFI scheme code, with NAV history and computed returns. There is no valuation panel for funds — DCF and Graham describe businesses, not baskets, so showing them would be a fiction.",
        },
      ],
      next: ["index-funds", "costs-and-fees"],
    },
    {
      slug: "index-funds",
      title: "Index funds, ETFs and what an index is",
      summary:
        "Owning the market instead of choosing within it — the mechanics, and the honest trade-offs.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "An index is a defined list of companies with rules for weighting them. NIFTY 50 is the fifty largest and most liquid companies on the NSE, weighted by free-float market cap. SENSEX is thirty companies on the BSE. KSE-100 covers a hundred companies on the Pakistan Stock Exchange. The S&P 500 covers five hundred large US companies. An index is a measuring stick, not a product.",
        },
        {
          t: "p",
          text: "An index fund is a product that mechanically holds the index. No manager decides what to buy, so the cost is low. An ETF is an index fund that trades on an exchange like a share, which means you need a demat account and you pay the market price, which can drift slightly from NAV.",
        },
        { t: "h", text: "The argument for" },
        {
          t: "ul",
          items: [
            "Cost. Index funds commonly charge a small fraction of what an active fund charges, and cost is the one variable in investing that is known in advance.",
            "It removes manager risk — the chance your particular manager underperforms, or leaves.",
            "Diversification comes built in.",
            "Across many markets and periods, a majority of active funds have failed to beat their benchmark after costs over long horizons. The proportion varies by market and by period; the direction of the finding has been persistent.",
          ],
        },
        { t: "h", text: "The honest limitations" },
        {
          t: "ul",
          items: [
            "You buy everything in the index, including businesses you would never choose.",
            "Cap-weighting means you own most of what has already risen most — you are structurally overweight yesterday's winners.",
            "You will match the market's falls exactly. An index fund gives no protection in a crash; it is not lower risk, only lower cost and lower dispersion.",
            "Tracking error and the fund's own costs mean you get slightly less than the index, never more.",
          ],
        },
        {
          t: "note",
          kind: "key",
          text: "Index and active are not opposites you must choose between. Many people hold an index core and study individual businesses alongside it. Sarmaya is built for the studying part, and tracks indices so you have the benchmark in view.",
        },
      ],
      next: ["costs-and-fees", "diversification"],
    },
    {
      slug: "bonds-and-deposits",
      title: "Bonds, deposits and the rest of the risk ladder",
      summary:
        "What sits below equity, why it exists in a portfolio, and the two risks people forget.",
      minutes: 5,
      body: [
        {
          t: "p",
          text: "Equity is one rung on a ladder. Knowing the other rungs makes it clearer what you are being paid for when you take equity risk.",
        },
        {
          t: "table",
          head: ["Instrument", "What it is", "Main risks"],
          rows: [
            ["Savings / liquid funds", "Cash you can reach quickly", "Inflation eats it"], // prettier-ignore
            ["Fixed deposit", "Bank pays a fixed rate for a fixed term", "Inflation; breaking early costs you"], // prettier-ignore
            ["Government bond", "State borrows from you at a stated coupon", "Rates rise and the price falls; inflation"], // prettier-ignore
            ["Corporate bond", "Company borrows from you", "The company defaults; rates; liquidity"], // prettier-ignore
            ["Equity", "Ownership of a business", "Everything above, plus the business itself failing"], // prettier-ignore
          ],
        },
        { t: "h", text: "The two risks beginners overlook" },
        {
          t: "p",
          text: "The first is inflation. A deposit paying 6% while prices rise 6% has earned you nothing in purchasing power, and after tax on that interest you are behind. 'Safe' means the number does not fall; it does not mean the money keeps its buying power.",
        },
        {
          t: "p",
          text: "The second is interest-rate risk on bonds. Bond prices move opposite to rates: when rates rise, an existing bond paying the old lower coupon becomes less attractive, so its market price falls. Longer-dated bonds move more. Holding to maturity avoids realising that, but a bond fund holds bonds it may not hold to maturity, so its NAV can fall.",
        },
      ],
      next: ["costs-and-fees", "diversification"],
    },
  ],
};
