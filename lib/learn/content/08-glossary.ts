import type { Section } from "../types";

export const glossary: Section = {
  slug: "glossary",
  title: "Glossary",
  blurb: "Every term used in Sarmaya, in one place, in plain language.",
  articles: [
    {
      slug: "glossary",
      title: "Glossary A–Z",
      summary:
        "Plain-language definitions for every term that appears in the app.",
      minutes: 12,
      body: [
        {
          t: "p",
          text: "Definitions as this app uses them. Where Sarmaya computes something a particular way, that is stated — a term can mean slightly different things in different places, and the version on your screen is the one described here.",
        },
        { t: "h", text: "A–C" },
        {
          t: "terms",
          items: [
            {
              term: "AMFI",
              def: "Association of Mutual Funds in India. Publishes the daily NAV file Sarmaya reads for fund prices.",
            },
            {
              term: "Annual report",
              def: "The company's yearly account of itself — statements, auditor's opinion and management's discussion. The primary source.",
            },
            {
              term: "Asset turnover",
              def: "Revenue ÷ total assets. How much sales each rupee of assets generates.",
            },
            {
              term: "AUM",
              def: "Assets under management — the total a fund manages.",
            },
            {
              term: "Average cost",
              def: "Total amount paid ÷ units held. Sarmaya derives this from your journal entries using the average-cost method.",
            },
            {
              term: "Balance sheet",
              def: "What a company owns and owes on one date. Assets = liabilities + equity.",
            },
            {
              term: "Bid–ask spread",
              def: "The gap between the highest price a buyer offers and the lowest a seller accepts. An invisible cost of transacting.",
            },
            {
              term: "Bonus issue",
              def: "Free extra shares from reserves. Share count rises, price falls proportionally, total value unchanged.",
            },
            {
              term: "Book value",
              def: "Total equity — assets minus liabilities. The accounting net worth.",
            },
            {
              term: "Capex",
              def: "Capital expenditure. Cash spent on long-lived assets like plant and equipment.",
            },
            {
              term: "Cash conversion",
              def: "Free cash flow ÷ net income. Whether reported profit becomes actual cash.",
            },
            {
              term: "CFO",
              def: "Cash from operations. Cash the core business generated, before capital spending.",
            },
            {
              term: "Circuit limit",
              def: "The maximum a price may move in a session before trading is halted or restricted.",
            },
            {
              term: "Compounding",
              def: "Returns earning returns. The reason time matters more than timing.",
            },
            {
              term: "Corporate action",
              def: "Anything the company does that directly affects its shares — split, bonus, dividend, rights, buyback, merger.",
            },
          ],
        },
        { t: "h", text: "D–I" },
        {
          t: "terms",
          items: [
            {
              term: "DCF",
              def: "Discounted cash flow. Values a business as its future cash discounted back to today.",
            },
            {
              term: "Debt / equity",
              def: "Total debt ÷ total equity. How much borrowed money sits alongside the owners'.",
            },
            {
              term: "Demat account",
              def: "Where your shares are held electronically.",
            },
            {
              term: "Dividend",
              def: "Cash paid to shareholders out of profits.",
            },
            {
              term: "Dividend payout",
              def: "Dividends ÷ net income. The share of profit distributed rather than reinvested.",
            },
            {
              term: "Dividend yield",
              def: "Annual dividend per share ÷ price.",
            },
            {
              term: "Earnings yield",
              def: "EPS ÷ price — the inverse of P/E, expressed like an interest rate. Sarmaya computes it from EPS and price so it stays meaningful when earnings are negative.",
            },
            {
              term: "EPS",
              def: "Earnings per share. Net income ÷ shares outstanding.",
            },
            {
              term: "EPV",
              def: "Earnings power value. What the business is worth if it earns today's profit forever, with no growth.",
            },
            {
              term: "ETF",
              def: "Exchange-traded fund. An index fund that trades on an exchange like a share.",
            },
            {
              term: "Ex-date",
              def: "From this date a share trades without the entitlement to a declared dividend or corporate action.",
            },
            {
              term: "Expense ratio",
              def: "A fund's annual cost as a percentage of assets, deducted from NAV.",
            },
            {
              term: "FCF",
              def: "Free cash flow. CFO minus capex — the cash left after keeping the business running.",
            },
            { term: "FCF yield", def: "Free cash flow ÷ market cap." },
            {
              term: "Fiscal year",
              def: "A company's accounting year. In India this commonly runs April to March.",
            },
            {
              term: "Graham number",
              def: "√(22.5 × EPS × book value per share). A conservative reference point assuming no growth.",
            },
            { term: "Gross margin", def: "Gross profit ÷ revenue." },
            {
              term: "Index",
              def: "A defined list of companies with weighting rules — NIFTY 50, SENSEX, KSE-100, S&P 500.",
            },
            {
              term: "Index fund",
              def: "A fund that mechanically holds an index, so costs stay low.",
            },
          ],
        },
        { t: "h", text: "L–R" },
        {
          t: "terms",
          items: [
            {
              term: "Limit order",
              def: "An order that executes only at your price or better.",
            },
            {
              term: "Liquidity",
              def: "How easily something can be traded without moving its price.",
            },
            {
              term: "Market cap",
              def: "Share price × shares outstanding. The market's price for the whole company.",
            },
            {
              term: "Market order",
              def: "An order that executes immediately at whatever price is available.",
            },
            {
              term: "NAV",
              def: "Net asset value. A fund's assets minus liabilities, per unit, published daily.",
            },
            {
              term: "Net debt",
              def: "Total debt minus cash. Negative means net cash.",
            },
            { term: "Net margin", def: "Net income ÷ revenue." },
            { term: "Operating margin", def: "Operating income ÷ revenue." },
            { term: "P/B", def: "Price ÷ book value per share." },
            {
              term: "P/E",
              def: "Price ÷ earnings per share. How much you pay for a rupee of annual profit.",
            },
            {
              term: "Rebalancing",
              def: "Returning a portfolio to its intended allocation after drift.",
            },
            {
              term: "Reverse DCF",
              def: "Solves for the growth rate the current price implies, instead of assuming growth to produce a value.",
            },
            {
              term: "Rights issue",
              def: "An offer of new shares to existing holders, usually below market price.",
            },
            { term: "ROA", def: "Net income ÷ total assets." },
            {
              term: "ROE",
              def: "Net income ÷ equity. Can be flattered by debt.",
            },
            {
              term: "ROIC",
              def: "Return on invested capital. Sarmaya uses a pre-tax proxy: operating income ÷ (equity + debt − cash).",
            },
            {
              term: "Rupee-cost averaging",
              def: "Investing a fixed amount at fixed intervals, so you buy more units when prices are lower.",
            },
          ],
        },
        { t: "h", text: "S–Z" },
        {
          t: "terms",
          items: [
            {
              term: "SEBI",
              def: "Securities and Exchange Board of India, the Indian market regulator.",
            },
            {
              term: "SECP",
              def: "Securities and Exchange Commission of Pakistan.",
            },
            {
              term: "Settlement",
              def: "The process by which shares and money actually change hands after a trade.",
            },
            {
              term: "Shares outstanding",
              def: "The number of shares in existence. Needed to turn any total into a per-share figure.",
            },
            {
              term: "SIP",
              def: "Systematic Investment Plan. A fixed amount invested on a fixed schedule.",
            },
            {
              term: "Stock split",
              def: "Each share becomes several. Price falls proportionally; total value unchanged.",
            },
            {
              term: "Terminal value",
              def: "In a DCF, the assumed value of the business beyond the forecast period. Often the largest single component, and the least reliable.",
            },
            {
              term: "Thesis",
              def: "A short written statement of why you own or watch something, framed so it can be checked and can turn out false.",
            },
            {
              term: "TTM",
              def: "Trailing twelve months. The most recent four quarters, which may not line up with a fiscal year.",
            },
            {
              term: "Volatility",
              def: "How much a price moves around. Not the same as risk.",
            },
            {
              term: "XIRR",
              def: "A return calculation that accounts for money going in at different times. The right measure for a SIP; Sarmaya does not compute it yet.",
            },
          ],
        },
      ],
      next: ["what-investing-is", "ratios"],
    },
  ],
};
