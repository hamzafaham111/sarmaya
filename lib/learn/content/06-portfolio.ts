import type { Section } from "../types";

export const portfolio: Section = {
  slug: "portfolio",
  title: "Building a portfolio",
  blurb:
    "Diversification, position sizing, SIPs, rebalancing, and the costs that quietly decide your result.",
  articles: [
    {
      slug: "diversification",
      title: "Diversification, and its limits",
      summary:
        "Why owning several things helps, why owning fifty may not, and what real diversification requires.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "Diversification protects you from being wrong about any single thing. Since you will be wrong about some things, this is not optional. But it is widely misunderstood as simply owning more names.",
        },
        { t: "h", text: "What actually diversifies" },
        {
          t: "p",
          text: "Holding ten banks is not diversification — one interest-rate move affects all ten. Diversification comes from owning things whose fortunes are driven by different forces: different industries, different customers, different geographies, sometimes different asset classes altogether. The question is not 'how many' but 'what would have to go wrong for all of these to fall together'.",
        },
        { t: "h", text: "Where it stops helping" },
        {
          t: "p",
          text: "The reduction in company-specific risk diminishes quickly with each additional holding. The move from one holding to five removes a great deal of risk; from twenty to forty removes very little. Meanwhile the cost of holding more is real: your attention. Thirty businesses cannot be genuinely understood and reviewed by one person with a job. Peter Lynch coined the word for the failure mode — 'diworsification': adding names until the portfolio guarantees mediocrity while feeling responsible.",
        },
        {
          t: "quote",
          text: "Owning stocks is like having children — don't get involved with more than you can handle.",
          who: "Peter Lynch",
          where: "One Up on Wall Street",
        },
        {
          t: "note",
          kind: "key",
          text: "There is a real tension here and no correct answer. Concentration is how large returns are made and how portfolios are destroyed. Diversification is how you survive being wrong and how you guarantee you will never dramatically outperform. Where you sit depends on how much you can genuinely follow, and how much of a mistake you can absorb.",
        },
        {
          t: "note",
          kind: "watch",
          title: "Diversification does not help in a crash",
          text: "In a severe market decline, correlations rise — things that normally move independently fall together. Diversification protects against a company failing, not against the market falling. Only your holding period and your cash buffer protect against that.",
        },
      ],
      next: ["position-sizing", "sip"],
    },
    {
      slug: "position-sizing",
      title: "Position sizing",
      summary:
        "How much of one thing to own. Usually a bigger decision than which thing to own.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "Two people can hold identical portfolios of the same ten stocks and get very different outcomes, because one held 40% in the worst performer and the other held 4%. Sizing determines how much your successes and failures actually matter.",
        },
        { t: "h", text: "Ways people approach it" },
        {
          t: "terms",
          items: [
            {
              term: "Equal weight",
              def: "Every holding the same size. Simple, requires no judgement about conviction, and rebalances naturally into whatever has fallen.",
            },
            {
              term: "Conviction weighted",
              def: "Larger positions where you understand the business best. Honest in principle, but conviction is not the same as being right, and it tends to be highest just before it is punished.",
            },
            {
              term: "Cap on any one holding",
              def: "A hard ceiling — say no single position above 10% at cost — so that no single mistake can be fatal, regardless of how certain you feel.",
            },
          ],
        },
        {
          t: "p",
          text: "Whichever you choose, the useful discipline is deciding the size before you buy, while you are calm, and writing down why. Sizing decided in the moment tends to track excitement rather than analysis.",
        },
        {
          t: "p",
          text: "Buffett's famous teaching device makes the same point from the other side: imagine a punch card with just twenty slots, one for every investment decision of your lifetime. Under that constraint nobody buys casually or sizes a position they barely believe in — each punch has to matter. The card is imaginary; the discipline it produces is not.",
        },
        { t: "h", text: "Drift" },
        {
          t: "p",
          text: "Positions do not stay the size you set them. A holding that triples becomes a much larger share of the portfolio without you doing anything, which means your risk concentrates in whatever has already risen most. Noticing that is the entire purpose of the weight column on the portfolio page.",
        },
      ],
      next: ["rebalancing", "sip"],
    },
    {
      slug: "sip",
      title: "SIPs and averaging",
      summary:
        "Investing a fixed amount on a schedule — what it does, what it does not do, and the honest trade-off.",
      minutes: 6,
      body: [
        {
          t: "p",
          text: "A Systematic Investment Plan invests a fixed amount at a fixed interval, usually monthly. Because the amount is fixed, it buys more units when prices are low and fewer when they are high. The average cost per unit therefore ends up below the average price over the period — this is rupee-cost averaging, and it is arithmetic rather than a strategy.",
        },
        { t: "h", text: "What it genuinely does" },
        {
          t: "ul",
          items: [
            "It removes the need to decide when — which is the decision people are worst at.",
            "It converts investing into a habit that survives your moods.",
            "It guarantees you keep buying during declines, which is exactly when it is hardest and usually most useful.",
          ],
        },
        { t: "h", text: "What it does not do" },
        {
          t: "ul",
          items: [
            "It does not protect against loss. A SIP into something that falls for five years loses money steadily.",
            "It is not mathematically superior to investing a lump sum. Studies across markets have generally found that investing a lump sum immediately beats spreading it out more often than not, simply because markets rise more often than they fall. Averaging in is chosen for behavioural reasons — regret is easier to bear — and that is a legitimate reason.",
            "Its effect weakens over time. Once the portfolio is large, a monthly contribution is small relative to it, and market movement dominates.",
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "A measurement problem",
          text: "With regular contributions, simple percentage return becomes misleading — money added last month is weighted the same as money added five years ago. XIRR is the standard fix, and Sarmaya does not yet compute it. Until it does, treat the return figure on a SIP-heavy holding as indicative rather than exact.",
        },
      ],
      next: ["rebalancing", "costs-and-fees"],
    },
    {
      slug: "rebalancing",
      title: "Rebalancing",
      summary:
        "Returning the portfolio to its intended shape — and why it feels wrong every single time.",
      minutes: 5,
      body: [
        {
          t: "p",
          text: "Suppose you intend 70% equity and 30% debt. After a strong year, equity has grown to 82%. You now hold a riskier portfolio than the one you chose — not by decision, but by drift. Rebalancing means selling some of what grew and buying what lagged, to return to the intended shape.",
        },
        {
          t: "p",
          text: "It always feels wrong. You are selling the thing that is working and buying the thing that is not. That discomfort is the mechanism: it forces the opposite of the instinct that hurts most investors.",
        },
        { t: "h", text: "Common triggers" },
        {
          t: "ul",
          items: [
            "Calendar — once a year, on a fixed date, regardless of what markets did. Simple and hard to rationalise your way out of.",
            "Threshold — when any allocation drifts more than a set amount from its target, say five percentage points.",
            "With new money — direct fresh contributions to whatever is underweight, avoiding a sale entirely. Usually the cheapest route, since it triggers no tax and no exit load.",
          ],
        },
        {
          t: "note",
          kind: "watch",
          text: "Rebalancing by selling has real costs: brokerage, exit loads, and tax on realised gains. Rebalancing too often can cost more than the drift it corrects. This is a genuine argument for doing it rarely and preferring new money when possible.",
        },
      ],
      next: ["costs-and-fees", "when-to-sell"],
    },
    {
      slug: "costs-and-fees",
      title: "Costs: the only certainty",
      summary:
        "Returns are unknown; costs are known in advance. That asymmetry makes them the highest-leverage thing you control.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "You cannot control what the market returns. You can control almost every cost you pay, and each one compounds against you exactly as returns compound for you.",
        },
        {
          t: "quote",
          text: "In investing, you get what you don't pay for.",
          who: "John Bogle",
          where: "founder of Vanguard, inventor of the public index fund",
        },
        { t: "h", text: "What you actually pay" },
        {
          t: "terms",
          items: [
            {
              term: "Expense ratio",
              def: "An annual percentage of your holding, deducted from a fund's NAV. You never see a bill; the return simply arrives smaller.",
            },
            {
              term: "Exit load",
              def: "A charge for redeeming within a defined period, commonly a year.",
            },
            {
              term: "Brokerage and transaction charges",
              def: "Per-trade costs. Small individually, significant if you trade often.",
            },
            {
              term: "Bid-ask spread",
              def: "The gap between buying and selling price. Invisible but real, and much wider on illiquid small companies.",
            },
            {
              term: "Taxes",
              def: "Levied on realised gains and on dividends. Rates and holding-period definitions differ by country and change over time — check the current rules for your jurisdiction rather than trusting any article, including this one.",
            },
          ],
        },
        {
          t: "note",
          kind: "key",
          title: "Why a fraction of a percent matters",
          text: "A 1% annual fee on a portfolio compounding for thirty years does not cost 1%. It removes roughly a quarter of the final amount, because each year's fee also removes all the growth that rupee would have produced for the remaining years.",
        },
        { t: "h", text: "The cost nobody invoices you for" },
        {
          t: "p",
          text: "Trading frequently generates costs and taxes, and it also tends to reduce returns for reasons unrelated to fees — research across markets has repeatedly found that the most active retail traders earn less than the least active. Doing nothing is a legitimate and often superior action, and it is free.",
        },
      ],
      next: ["when-to-sell", "why-write-a-thesis"],
    },
  ],
};
