import type { Section } from "../types";

export const readingABusiness: Section = {
  slug: "reading-a-business",
  title: "Reading a business",
  blurb:
    "The three statements, the figures that summarise them, and what the numbers can hide.",
  articles: [
    {
      slug: "the-three-statements",
      title: "The three financial statements",
      summary:
        "Income, balance sheet, cash flow — what each answers, and why you need all three.",
      minutes: 9,
      body: [
        {
          t: "p",
          text: "Every listed company publishes three statements. They answer three different questions, and any one of them alone can mislead you. Sarmaya shows all three, years across the columns, so you read them as a trend rather than a snapshot.",
        },
        { t: "h", text: "The income statement — did it make a profit?" },
        {
          t: "p",
          text: "Covers a period, usually a year. It starts with revenue and subtracts its way down to net income.",
        },
        {
          t: "terms",
          items: [
            {
              term: "Revenue",
              def: "Everything sold. Also called turnover or the top line.",
            },
            {
              term: "Gross profit",
              def: "Revenue minus the direct cost of producing the goods. What is left to run the company with.",
            },
            {
              term: "Operating income",
              def: "Gross profit minus the cost of running the business — salaries, marketing, admin. The profit from operations, before financing and tax.",
            },
            {
              term: "Net income",
              def: "What remains after interest and tax. The bottom line.",
            },
            {
              term: "EPS",
              def: "Net income divided by shares outstanding — the profit attributable to one share.",
            },
          ],
        },
        { t: "h", text: "The balance sheet — what does it own and owe?" },
        {
          t: "p",
          text: "A snapshot on one date, not a period. It always balances, by construction:",
        },
        { t: "formula", expr: "assets = liabilities + equity" },
        {
          t: "terms",
          items: [
            {
              term: "Total assets",
              def: "Everything the company controls — cash, inventory, plant, receivables.",
            },
            {
              term: "Total debt",
              def: "Borrowed money that must be repaid, with interest, whatever happens.",
            },
            {
              term: "Cash",
              def: "What is actually in the bank. Debt minus cash is net debt.",
            },
            {
              term: "Total equity",
              def: "Assets minus liabilities — the owners' residual claim. Also called book value or net worth.",
            },
          ],
        },
        {
          t: "h",
          text: "The cash flow statement — did the money actually arrive?",
        },
        {
          t: "p",
          text: "The most useful of the three and the least read. Profit is an accounting opinion shaped by judgement calls; cash is a fact.",
        },
        {
          t: "terms",
          items: [
            {
              term: "Cash from operations (CFO)",
              def: "Cash the core business actually generated. If this is persistently far below net income, ask why.",
            },
            {
              term: "Capex",
              def: "Cash spent on plant, equipment and other long-lived assets. Reported as a negative.",
            },
            {
              term: "Free cash flow (FCF)",
              def: "CFO minus capex — cash left over after keeping the business running. This is what can fund dividends, buybacks and debt repayment.",
            },
            {
              term: "Dividends paid",
              def: "Cash actually handed to shareholders, shown as an outflow.",
            },
          ],
        },
        {
          t: "note",
          kind: "key",
          title: "Why all three",
          text: "A company can report rising profit while cash drains away — by booking sales customers have not paid for, or by capitalising costs that should have been expensed. The income statement says it is thriving; the cash flow statement says it is not. Where they disagree over several years is one of the most informative things in a set of accounts.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "Statements come from the provider for as many years as it supplies, and accumulate forward from there. Gaps are shown as an em dash, never guessed at. Anything the source cannot reach — older years, or markets with no statement coverage — you can type in yourself, and it is marked with a dotted gold underline as your own figure.",
        },
      ],
      next: ["key-figures", "ratios"],
    },
    {
      slug: "key-figures",
      title: "The figures on the front page",
      summary:
        "P/E, P/B, EPS, yields and market cap — what each one means and where each one lies to you.",
      minutes: 9,
      body: [
        {
          t: "p",
          text: "These are the market-facing numbers: what people are currently paying, and the trailing twelve months of business behind it. Each is a shortcut, and each has a specific way of being misleading.",
        },
        { t: "h", text: "P/E — price to earnings" },
        { t: "formula", expr: "P/E = share price ÷ earnings per share" },
        {
          t: "p",
          text: "How many rupees you pay for one rupee of annual profit. A P/E of 25 means 25 rupees per rupee of earnings — loosely, 25 years of today's earnings to pay you back, if nothing ever changed.",
        },
        {
          t: "ul",
          items: [
            "A high P/E is not automatically bad. It means the market expects growth. Whether that expectation is reasonable is the actual question.",
            "A low P/E is not automatically good. It often means the market expects earnings to fall — sometimes the market is right.",
            "It breaks completely when earnings are negative or near zero.",
            "It is distorted by one-off items. A single asset sale can inflate earnings and make the P/E look low for a year.",
            "It is only comparable within an industry. Banks, software firms and cement makers do not carry comparable multiples.",
          ],
        },
        { t: "h", text: "P/B — price to book" },
        { t: "formula", expr: "P/B = share price ÷ book value per share" },
        {
          t: "p",
          text: "Price against the accounting net worth. Genuinely useful for banks and insurers, whose balance sheets largely are the business. Much weaker for companies whose value is brands, software or people, because those barely appear on a balance sheet — which is why a strong consumer company can trade at many times book without that meaning anything alarming.",
        },
        { t: "h", text: "Earnings yield and FCF yield" },
        {
          t: "formula",
          expr: "earnings yield = EPS ÷ price     FCF yield = free cash flow ÷ market cap",
        },
        {
          t: "p",
          text: "The same relationship inverted, which makes it directly comparable to a deposit or bond rate. An earnings yield of 4% says the business earns 4% of what you are paying, per year. FCF yield is the stricter version, since it uses cash rather than accounting profit.",
        },
        { t: "h", text: "Dividend yield" },
        {
          t: "formula",
          expr: "dividend yield = annual dividend per share ÷ price",
        },
        {
          t: "p",
          text: "Cash returned as a percentage of price. A very high yield deserves suspicion rather than enthusiasm: yield rises when price falls, so an unusually high figure often means the market expects the dividend to be cut. Check whether earnings and free cash flow actually cover it.",
        },
        {
          t: "note",
          kind: "watch",
          title: "TTM is not the same as a fiscal year",
          text: "Sarmaya keeps the trailing-twelve-month key figures in a separate panel from the per-fiscal-year ratio table, deliberately. Mixing the two in one grid compares different periods and quietly produces nonsense.",
        },
      ],
      next: ["ratios", "what-numbers-hide"],
    },
    {
      slug: "ratios",
      title: "Ratios: profitability, returns, leverage, cash",
      summary:
        "The per-year figures computed from the statements, grouped the way a business is actually read.",
      minutes: 10,
      body: [
        {
          t: "p",
          text: "Ratios turn raw figures into something comparable across years and companies. Sarmaya computes all of these at read time from the statements — nothing is fetched or stored, so what you see always matches the statements above it.",
        },
        { t: "h", text: "Profitability — how much of each rupee is kept" },
        {
          t: "terms",
          items: [
            {
              term: "Gross margin",
              def: "Gross profit ÷ revenue. Pricing power and production efficiency. Stable, high gross margins often indicate a brand or a cost advantage.",
            },
            {
              term: "Operating margin",
              def: "Operating income ÷ revenue. Profitability of the actual operation, before financing choices and tax.",
            },
            {
              term: "Net margin",
              def: "Net income ÷ revenue. What finally reaches the owners.",
            },
            {
              term: "FCF margin",
              def: "Free cash flow ÷ revenue. How much of every rupee of sales becomes spendable cash.",
            },
          ],
        },
        { t: "h", text: "Returns on capital — how well the money is used" },
        {
          t: "terms",
          items: [
            {
              term: "ROE",
              def: "Net income ÷ equity. Return on the owners' money. Beware: it can be inflated purely by taking on debt, since debt shrinks equity.",
            },
            {
              term: "ROIC",
              def: "Operating income ÷ (equity + debt − cash). Return on all the capital in the business, regardless of how it was financed. Harder to flatter than ROE, which is why it is often the more honest number.",
            },
            {
              term: "ROA",
              def: "Net income ÷ total assets. Return on the whole asset base. Useful in asset-heavy industries.",
            },
          ],
        },
        {
          t: "note",
          kind: "watch",
          text: "Sarmaya's ROIC is a pre-tax proxy: it uses operating income, because the free data sources do not reliably provide a usable tax rate. The label says so on the page. A pre-tax figure is systematically higher than the after-tax version you would compute from a full filing — fine for comparing a company against its own history, less so against a textbook threshold.",
        },
        { t: "h", text: "Leverage — how much is borrowed" },
        {
          t: "terms",
          items: [
            {
              term: "Debt / equity",
              def: "Total debt ÷ equity. How much borrowed money sits alongside the owners'. What counts as high is entirely industry-dependent.",
            },
            {
              term: "Net debt / equity",
              def: "(Debt − cash) ÷ equity. A company with more cash than debt shows a negative figure — net cash, a position of strength. Sarmaya keeps that sign rather than clamping it to zero.",
            },
          ],
        },
        {
          t: "p",
          text: "Debt is not inherently bad; it is a magnifier. It increases returns when things go well and destroys the company when they do not. The question is never 'is there debt' but 'can operating cash comfortably service it in a bad year'.",
        },
        { t: "h", text: "Cash and efficiency — is the profit real" },
        {
          t: "terms",
          items: [
            {
              term: "Cash conversion",
              def: "Free cash flow ÷ net income. Persistently near or above 100% means reported profit turns into actual cash. Persistently far below deserves an explanation.",
            },
            {
              term: "Asset turnover",
              def: "Revenue ÷ total assets. How much sales each rupee of assets produces. Low turnover with high margins, or high turnover with thin margins, are both viable models — a supermarket and a luxury brand sit at opposite ends.",
            },
          ],
        },
        { t: "h", text: "Per shareholder" },
        {
          t: "terms",
          items: [
            {
              term: "Dividend payout",
              def: "Dividends ÷ net income. What share of profit is handed out rather than reinvested. A very high payout leaves little for growth; it is not applicable in a loss year.",
            },
            {
              term: "Book value per share",
              def: "Equity ÷ shares outstanding. The accounting net worth behind one share.",
            },
          ],
        },
        {
          t: "note",
          kind: "key",
          title: "Read the trend, not the number",
          text: "A single year's ROIC says almost nothing. Five years of ROIC drifting from 22% to 11% says a great deal. This is why the ratio table shows years side by side with a sparkline — the direction is usually more informative than the level.",
        },
      ],
      next: ["what-numbers-hide", "no-single-value"],
    },
    {
      slug: "what-numbers-hide",
      title: "What the numbers hide",
      summary:
        "Where accounts mislead honest readers, and the questions no ratio can answer.",
      minutes: 8,
      body: [
        {
          t: "p",
          text: "Financial statements are prepared by the company, within rules that allow real discretion. They are not lies, but they are a presentation. A few places where careful readers slow down:",
        },
        { t: "h", text: "Accounting choices that change the picture" },
        {
          t: "ul",
          items: [
            "Revenue recognition — when a sale is booked can shift profit between years.",
            "Capitalising versus expensing — treating a cost as an asset moves it off the income statement and flatters current profit.",
            "Depreciation assumptions — a longer assumed asset life means lower annual depreciation and higher reported profit.",
            "One-off items — asset sales, write-offs and restructuring charges that are described as exceptional every single year are not exceptional.",
            "Related-party transactions — business done with entities the promoters also control deserves close reading.",
          ],
        },
        { t: "h", text: "Signals worth investigating" },
        {
          t: "ul",
          items: [
            "Profit rising for years while cash from operations does not follow.",
            "Receivables growing much faster than revenue — sales booked but not collected.",
            "Inventory growing much faster than revenue — goods made but not sold.",
            "Frequent changes of auditor, or a resignation without a clear reason.",
            "Debt rising while the stated reason for it keeps changing.",
            "Promoter or insider shareholding falling steadily.",
            "Accounts published very late, or restated after the fact.",
          ],
        },
        {
          t: "note",
          kind: "watch",
          text: "None of these prove wrongdoing. Each is a reason to read further before committing money, and a reason to write down what you found. If you cannot explain a number to yourself, that is information in itself.",
        },
        { t: "h", text: "What no statement contains" },
        {
          t: "p",
          text: "The things that most determine a decade of returns are usually absent from the accounts: whether management is honest and competent, whether the competitive advantage is durable, whether the industry is being quietly disrupted, whether regulation is about to change, and whether the culture retains good people. Numbers are the part that is easy to measure — which is not the same as the part that matters most.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "This is what cell annotations are for. Click any figure in a statement and attach a note to that exact number and year. Two years later, when the figure looks strange again, your own explanation is attached to it.",
        },
      ],
      next: ["no-single-value", "why-write-a-thesis"],
    },
  ],
};
