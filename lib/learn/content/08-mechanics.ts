import type { Section } from "../types";

export const mechanics: Section = {
  slug: "mechanics",
  title: "How the market actually works",
  blurb:
    "Accounts, orders, settlement, corporate actions and who regulates whom — in India and Pakistan.",
  articles: [
    {
      slug: "getting-started-mechanics",
      title: "What you need before you can buy anything",
      summary:
        "Demat, trading account, KYC — the plumbing of actually owning a share in India and Pakistan.",
      minutes: 6,
      body: [
        { t: "h", text: "India" },
        {
          t: "p",
          text: "Shares are held electronically. Three things are involved, and brokers usually bundle them so you may only fill one form:",
        },
        {
          t: "terms",
          items: [
            {
              term: "Demat account",
              def: "Where the shares themselves sit, held with a depository (CDSL or NSDL) through a participant — usually your broker.",
            },
            {
              term: "Trading account",
              def: "The account through which orders reach the exchange.",
            },
            { term: "Bank account link", def: "Where money moves in and out." },
            {
              term: "KYC",
              def: "Identity verification — PAN, address proof, a photograph, sometimes in-person or video verification. Required once, then reusable across providers.",
            },
          ],
        },
        {
          t: "p",
          text: "Mutual funds do not strictly require a demat account. They can be bought directly from the asset management company or through platforms, and many people hold funds outside demat entirely.",
        },
        { t: "h", text: "Pakistan" },
        {
          t: "p",
          text: "The structure is similar: a brokerage account with a TREC holder of the Pakistan Stock Exchange, with shares held in the Central Depository Company. Investor Account Services allow holding directly with CDC rather than through a broker's sub-account. KYC requirements are comparable — CNIC, proof of address, bank details.",
        },
        {
          t: "note",
          kind: "watch",
          text: "Charges differ substantially between brokers — account opening, annual maintenance, per-trade brokerage, and charges for the demat side. These are knowable in advance and worth comparing before opening, because switching later is friction you will avoid doing.",
        },
      ],
      next: ["orders-and-settlement", "corporate-actions"],
    },
    {
      slug: "orders-and-settlement",
      title: "Orders, prices and settlement",
      summary:
        "Market versus limit, what a spread costs you, and when the shares are actually yours.",
      minutes: 6,
      body: [
        { t: "h", text: "Order types" },
        {
          t: "terms",
          items: [
            {
              term: "Market order",
              def: "Execute now at whatever price is available. Certain to fill, uncertain in price. Risky in thinly traded stocks, where the next available price can be far from the last one.",
            },
            {
              term: "Limit order",
              def: "Execute only at your price or better. Certain in price, uncertain to fill. Usually the sensible default for a long-term buyer, who has no reason to be in a hurry.",
            },
            {
              term: "Stop loss",
              def: "An order that triggers once a price is reached. A trader's tool; it can convert a temporary decline into a realised loss, which is the opposite of what a long-term owner usually wants.",
            },
          ],
        },
        { t: "h", text: "The spread and liquidity" },
        {
          t: "p",
          text: "At any moment there is a highest price someone will pay (the bid) and a lowest price someone will accept (the ask). The gap is the spread, and crossing it is a cost you pay without ever seeing an invoice. In large companies it is negligible. In small, thinly traded ones it can be several percent — which is one reason small caps are more expensive to own than their headline returns suggest.",
        },
        { t: "h", text: "Settlement" },
        {
          t: "p",
          text: "Trading and settlement are different events. After a trade, there is a defined period before shares and money actually change hands. India has moved progressively shorter over the years and now settles very quickly by global standards, with same-day settlement being phased in for parts of the market. The practical consequence is that money from a sale is not instantly available for withdrawal, and the rules change periodically — check your broker's current terms.",
        },
        {
          t: "note",
          kind: "watch",
          title: "Circuit limits",
          text: "Exchanges cap how far a stock or index may move in a day. If a stock hits its limit, trading may pause or you may simply be unable to transact at any price. In a genuine panic, 'I will just sell' is not always available.",
        },
      ],
      next: ["corporate-actions", "getting-started-mechanics"],
    },
    {
      slug: "corporate-actions",
      title: "Corporate actions: splits, bonuses, dividends, rights",
      summary:
        "Events that change your share count or your cost basis. Miss one and your records quietly become wrong.",
      minutes: 8,
      body: [
        {
          t: "p",
          text: "A corporate action is something the company does that affects its shares directly. Most create no value by themselves — they slice the same pie differently — but they change the numbers in your records, and if you do not adjust for them your average cost and returns become nonsense.",
        },
        {
          t: "terms",
          items: [
            {
              term: "Stock split",
              def: "Each share becomes several. A 1:5 split turns 100 shares at ₹1,000 into 500 shares at ₹200. Your total value is unchanged. The purpose is a lower price per share and better liquidity.",
            },
            {
              term: "Bonus issue",
              def: "Free additional shares from the company's reserves. A 1:1 bonus doubles your share count and halves the price. Again, no value is created — but your average cost per share halves.",
            },
            {
              term: "Dividend",
              def: "Cash paid per share. To receive it you must own the share before the ex-dividend date. The price typically drops by roughly the dividend on that date.",
            },
            {
              term: "Rights issue",
              def: "Existing holders are offered new shares, usually below market price, in proportion to their holding. Taking it up costs money; not taking it up dilutes your ownership share.",
            },
            {
              term: "Buyback",
              def: "The company purchases its own shares and cancels them. Fewer shares means each remaining one owns a larger slice.",
            },
            {
              term: "Merger / demerger",
              def: "Companies combine or split apart. You may end up holding shares in an entity you never bought.",
            },
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "This is where records break",
          text: "Price history from data providers is usually adjusted for splits and bonuses automatically. Your own record of 'I bought 100 shares at ₹1,000' is not. After a 1:1 bonus you hold 200 shares, but a portfolio that still thinks you hold 100 will value your position at half of what it is. Sarmaya does not yet handle corporate actions — it is the top item in IDEAS.md — so if one occurs on something you hold, adjust your journal entries by hand and note why.",
        },
        { t: "h", text: "Key dates" },
        {
          t: "terms",
          items: [
            {
              term: "Announcement date",
              def: "The company declares its intention.",
            },
            {
              term: "Ex-date",
              def: "From this date the share trades without the entitlement. Buy on or after the ex-date and you do not receive it.",
            },
            {
              term: "Record date",
              def: "The date the company checks its register to see who is entitled.",
            },
            {
              term: "Payment date",
              def: "When the cash or shares actually arrive.",
            },
          ],
        },
      ],
      next: ["who-regulates", "reviewing"],
    },
    {
      slug: "who-regulates",
      title: "Who regulates what, and where to check",
      summary:
        "The bodies that set the rules, and the primary sources worth reading instead of tips.",
      minutes: 5,
      body: [
        { t: "h", text: "India" },
        {
          t: "terms",
          items: [
            {
              term: "SEBI",
              def: "Securities and Exchange Board of India. Regulates exchanges, brokers, mutual funds and listed-company disclosure.",
            },
            {
              term: "RBI",
              def: "The central bank. Sets policy rates and regulates banks — relevant to you because rates move markets and because banks are a large part of most indices.",
            },
            {
              term: "NSE / BSE",
              def: "The two main exchanges. Both publish company announcements, shareholding patterns and results.",
            },
            {
              term: "AMFI",
              def: "The mutual fund industry body. Publishes daily NAVs for every scheme — the source Sarmaya uses for fund data.",
            },
          ],
        },
        { t: "h", text: "Pakistan" },
        {
          t: "terms",
          items: [
            {
              term: "SECP",
              def: "Securities and Exchange Commission of Pakistan. The market regulator.",
            },
            { term: "State Bank of Pakistan", def: "The central bank." },
            {
              term: "PSX",
              def: "Pakistan Stock Exchange. Publishes prices and company announcements; the source Sarmaya scrapes for PK prices.",
            },
            {
              term: "CDC",
              def: "Central Depository Company, where shares are held electronically.",
            },
          ],
        },
        { t: "h", text: "Read the primary sources" },
        {
          t: "p",
          text: "The annual report, the quarterly results, and the exchange filings are written by the company under legal obligation. They are longer and duller than a video or a forum post, and they are the only place the actual numbers live. The management discussion section in an annual report is usually the highest-value reading available on any company, and it is free.",
        },
        {
          t: "note",
          kind: "watch",
          title: "On tips and finfluencers",
          text: "Anyone confidently telling you what to buy is either selling something, positioned already, or guessing. Regulators in both countries have taken action against unregistered advisers and paid promotion presented as opinion. That a claim is confident, detailed and popular says nothing about whether it is true.",
        },
      ],
      next: ["glossary", "why-write-a-thesis"],
    },
    {
      slug: "taxes-and-costs",
      title: "Taxes: the rules of the game",
      summary:
        "How equity gains, fund gains and dividends are taxed in India and Pakistan — structurally, since the rates change with every budget.",
      minutes: 10,
      body: [
        {
          t: "p",
          text: "Taxes are the one market force with a rulebook, and the rulebook has a consistent shape even though the numbers in it change almost every budget. This article teaches the shape. The specific rates quoted were current as of early 2026 — treat every one of them as 'verify against this year's Finance Act', and treat anything involving your personal situation as a question for a professional, not an app.",
        },
        { t: "h", text: "The one structural idea: holding period" },
        {
          t: "p",
          text: "Both countries' systems, like most in the world, distinguish short-term from long-term capital gains and tax the short kind harder. The boundary for listed Indian equity is twelve months: sell at a gain before it and the gain is short-term; after it, long-term. This single cliff is the tax system's opinion about your behaviour, expressed as money — churning is billed, holding is discounted. Everything else is detail on top of it.",
        },
        {
          t: "table",
          caption:
            "India, listed equity and equity funds — as of early 2026; rates change with budgets, so verify before acting on them.",
          head: ["Event", "Treatment"],
          rows: [
            [
              "Gain, held ≤ 12 months (STCG)",
              "Taxed at a flat rate — 20% as of the 2024 budget",
            ],
            [
              "Gain, held > 12 months (LTCG)",
              "12.5% on gains above an annual exemption (₹1.25 lakh) — small investors' long-term gains are often untaxed in practice",
            ],
            [
              "Dividends",
              "Added to your income, taxed at your slab rate; TDS deducted above a threshold",
            ],
            [
              "Every trade, both directions",
              "Securities transaction tax plus brokerage, exchange charges and stamp duty — small percentages that compound with churn",
            ],
          ],
        },
        {
          t: "p",
          text: "Three structural notes behind that table. First, equity mutual funds inherit equity treatment, but the growth option compounds untaxed until you redeem, while dividend (IDCW) payouts are taxed at slab every year — a structural argument for growth options that survives any rate change. Second, non-equity funds lost their favourable treatment in 2023: debt-fund gains are now simply slab income, which removed most of their tax advantage over deposits. Third, a SIP is not one purchase for tax: every monthly instalment has its own twelve-month clock, so 'held over a year' applies instalment by instalment.",
        },
        { t: "h", text: "Pakistan: the filer's market" },
        {
          t: "p",
          text: "Pakistan taxes capital gains on listed securities at a flat rate (15% for tax filers in recent years) with the decisive variable being filer status: appearing on the Active Taxpayer List roughly halves the withholding on dividends and much else, making non-filer investing structurally expensive. Dividends carry withholding at source. The broker and NCCPL handle most computation and deduction, but the filer/non-filer gap is the single largest controllable tax fact for a Pakistani investor.",
        },
        { t: "h", text: "What this means for behaviour, not products" },
        {
          t: "ul",
          items: [
            "Churn is taxed three times: the short-term rate, the transaction taxes, and the interrupted compounding. A strategy that trades monthly must beat a buy-and-hold by several percentage points a year just to stand still.",
            "Unrealised gains are an interest-free loan from the tax office — tax is due on selling, not on holding, so deferral itself compounds. This is a real, quantifiable part of why the masters' 'holding period: decades' works.",
            "Realised losses have value: both systems allow setting losses against gains under specific rules — records matter.",
            "Tax should shape how you do things, not what you own. Selling a deteriorating business slowly 'for tax reasons' replaces a small certain cost with a large uncertain one.",
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "Verify, always",
          text: "Rates, exemption limits, holding periods and surcharges here WILL go stale — India alone changed the equity STCG and LTCG rates in a single 2024 budget. The structure (holding-period cliffs, slab-taxed dividends, filer status, churn friction) is durable; the numbers are not. Check the current year's rules or ask a professional before any decision that hinges on them.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "The journal records every buy and sell with dates — which is exactly the record a holding-period tax system requires at filing time. Sarmaya does not compute taxes; it preserves the facts your accountant needs.",
        },
      ],
      next: ["costs-and-fees", "orders-and-settlement"],
    },
  ],
};
