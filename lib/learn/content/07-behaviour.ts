import type { Section } from "../types";

export const behaviour: Section = {
  slug: "behaviour",
  title: "Behaviour and process",
  blurb:
    "The part that decides most outcomes: writing things down, knowing your biases, and having a rule for selling.",
  articles: [
    {
      slug: "why-write-a-thesis",
      title: "Why you write it down",
      summary:
        "Memory rewrites itself. A thesis written before the price moved is the only honest record of what you believed.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "A thesis is a short statement of why you own or watch something — three to five sentences that would have to stop being true for the decision to be wrong. It is written before the outcome is known, which is the whole point.",
        },
        {
          t: "p",
          text: "Human memory is reconstructive. After a price falls, people genuinely remember having had doubts. After it rises, they genuinely remember having been confident. This is not dishonesty; it is how memory works, and it makes learning from your own decisions nearly impossible without a written record.",
        },
        { t: "h", text: "What a usable thesis looks like" },
        {
          t: "p",
          text: "Not 'this is a great company'. That cannot be checked and cannot be falsified. A usable thesis names something specific and observable:",
        },
        {
          t: "ul",
          items: [
            "'Retail margins keep expanding as the store mix shifts to own-brand.' — checkable against the margin line each year.",
            "'Net debt keeps falling while capex stays funded from operations.' — checkable against two statements.",
            "'The regulatory change in 2027 does not materially cut fee income.' — checkable when it happens.",
          ],
        },
        {
          t: "p",
          text: "Each names a fact that could turn out false. When one does, you have learned something specific rather than absorbing a vague feeling that you were unlucky.",
        },
        { t: "h", text: "The mandatory why" },
        {
          t: "p",
          text: "Sarmaya will not record a trade without at least ten characters of reasoning. This is deliberate friction. The journal entry is the only part of the app that will still be valuable in ten years — prices are available anywhere, and your reasoning at the moment of the decision exists nowhere else.",
        },
        {
          t: "note",
          kind: "example",
          title: "Attach a rule",
          text: "A thesis can carry a rule — a metric, a direction and a value — and the daily job emails you the day it trips. The rule is not a signal to act; it is a prompt to reread what you wrote and decide whether it still holds.",
        },
      ],
      next: ["biases", "when-to-sell"],
    },
    {
      slug: "biases",
      title: "The biases that cost money",
      summary:
        "Knowing them does not remove them. It does let you build rules that work around them.",
      minutes: 8,
      body: [
        {
          t: "p",
          text: "These are well-documented patterns in how people decide under uncertainty. Reading about them does not make you immune — the research is fairly clear that awareness alone changes little. What helps is having a written process that does not require you to be rational in the moment. (Charlie Munger's fuller catalogue, and the framework behind it, has its own article in the Masters section.)",
        },
        {
          t: "quote",
          text: "We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.",
          who: "Warren Buffett",
          where: "1986 Berkshire Hathaway letter",
        },
        {
          t: "terms",
          items: [
            {
              term: "Loss aversion",
              def: "A loss hurts roughly twice as much as an equivalent gain pleases. It leads people to hold losers to avoid making the loss 'real', and to sell winners early to lock in the good feeling — exactly backwards from what the reasoning would suggest.",
            },
            {
              term: "Anchoring",
              def: "Fixating on an irrelevant number, usually your purchase price. The price you paid has no bearing on what the business is worth now, but 'I'll sell when it gets back to what I paid' is one of the most common sentences in investing.",
            },
            {
              term: "Confirmation bias",
              def: "Seeking out what agrees with you. Once you own something, disconfirming information becomes strangely easy to dismiss.",
            },
            {
              term: "Recency bias",
              def: "Assuming the recent past continues. It makes people buy most enthusiastically after long rises and sell hardest after long falls.",
            },
            {
              term: "Overconfidence",
              def: "Most people rate themselves above average. Consistently correlated with trading more and earning less.",
            },
            {
              term: "Herding",
              def: "Comfort in doing what everyone else is doing. Being wrong alone feels much worse than being wrong in company, which is why crowded trades persist past sense.",
            },
            {
              term: "Sunk cost",
              def: "Continuing because of what has already been spent. The money already lost is gone whatever you do next; only what happens from here is a decision.",
            },
            {
              term: "Hindsight bias",
              def: "After the fact, everything looks as though it was obvious. Corrupts your assessment of your own past reasoning — which is why the written thesis matters.",
            },
          ],
        },
        { t: "h", text: "Process beats willpower" },
        {
          t: "p",
          text: "The reliable defences are structural rather than mental: decide position size before buying, write the thesis before the price moves, rebalance on a calendar rather than on a feeling, automate contributions, and reread what you wrote before acting. Each of these removes a decision from the moment when you are least equipped to make it.",
        },
      ],
      next: ["munger", "when-to-sell"],
    },
    {
      slug: "when-to-sell",
      title: "Thinking about selling",
      summary:
        "The harder half of the decision, and the one almost nobody plans for in advance.",
      minutes: 7,
      body: [
        {
          t: "p",
          text: "Most people put real effort into deciding what to buy and none at all into deciding when they would sell. The result is that the sell decision gets made under stress, by feeling, usually at the worst time. This article is a framework for thinking, not a recommendation — nothing here tells you to sell anything.",
        },
        { t: "h", text: "Reasons that follow from a thesis" },
        {
          t: "ul",
          items: [
            "The thesis is broken. What you said would be true has turned out false — margins compressed, debt climbed, the advantage went. This is the cleanest reason there is.",
            "The thesis played out. What you expected happened, and the price now reflects it. Nothing is wrong; the opportunity you identified simply no longer exists.",
            "You found a materially better use for the money, and you can articulate why.",
            "The position grew so large that a single mistake would be intolerable, and you are trimming to a size you chose in advance.",
            "You need the money for the purpose it was always intended for. This is a success, not a failure.",
          ],
        },
        {
          t: "quote",
          text: "Selling your winners and holding your losers is like cutting the flowers and watering the weeds.",
          who: "Peter Lynch",
          where:
            "One Up on Wall Street — Buffett liked it enough to quote it in his 1988 letter",
        },
        { t: "h", text: "Reasons that tend not to survive scrutiny" },
        {
          t: "ul",
          items: [
            "The price fell and it feels bad. If the thesis holds, the price falling is either noise or an opportunity.",
            "The price rose and it feels good. Selling to feel clever is the most reliably expensive habit in investing.",
            "It is 'back to what I paid'. Your purchase price is not information about the business.",
            "Someone on the internet said something.",
            "It has gone sideways and you are bored. Nothing compounds while you are being entertained.",
          ],
        },
        {
          t: "note",
          kind: "key",
          text: "The useful test: read the thesis you wrote before you owned this. If every statement in it is still true, the case for selling has to come from somewhere other than the price. If one is false, you have a real reason — and you found it by reading rather than reacting.",
        },
      ],
      next: ["reviewing", "why-write-a-thesis"],
    },
    {
      slug: "reviewing",
      title: "Reviewing what you own",
      summary:
        "A schedule for rereading your own reasoning, so a decision made years ago does not run unexamined.",
      minutes: 5,
      body: [
        {
          t: "p",
          text: "A thesis written three years ago and never revisited is not a process, it is an artefact. Businesses change. The review is where you find out whether the reasons still hold, in a calm moment rather than a panicked one.",
        },
        { t: "h", text: "A workable rhythm" },
        {
          t: "ol",
          items: [
            "When results are published — check the specific lines your thesis depends on, not the share price.",
            "Every quarter or so — a quick pass over the portfolio for anything that has drifted badly out of size.",
            "At least annually — reread every thesis properly and mark it reviewed. Sarmaya flags a thesis on the overview once it has gone ninety days without a review.",
          ],
        },
        { t: "h", text: "Three questions per holding" },
        {
          t: "ol",
          items: [
            "Is each statement in my thesis still true? Point at the number that shows it.",
            "Would I start this position today at this price, at this size, knowing what I now know?",
            "What would have to happen for me to conclude I was wrong — and has any of it started?",
          ],
        },
        {
          t: "note",
          kind: "example",
          title: "Keep the record",
          text: "Add a note entry when you review, even if nothing changed. 'Reviewed, margins still expanding, holding' is worth writing. Over years, that trail becomes the most honest account of your own judgement you will ever have — including the times you were right for the wrong reasons.",
        },
      ],
      next: ["biases", "corporate-actions"],
    },
    {
      slug: "market-history",
      title: "A short history of manias and crashes",
      summary:
        "1929, the Nifty Fifty, Harshad Mehta, the dot-com bust, 2008, COVID — what repeats, what it costs, and what survived every one of them.",
      minutes: 11,
      body: [
        {
          t: "p",
          text: "Nothing inoculates an investor like history, because every mania feels unprecedented from inside and looks identical from outside: a genuine story, cheap money, prices that make everyone who owns feel clever and everyone who abstains feel stupid — then the turn, arriving without announcement. These episodes are worth knowing as specifically as possible, figures included, because 'markets crash sometimes' is an abstraction, and abstractions do not hold your behaviour together at the bottom.",
        },
        {
          t: "quote",
          text: "The four most dangerous words in investing are: 'this time it's different.'",
          who: "Sir John Templeton",
          where: "Forbes, 1993",
        },
        { t: "h", text: "1929 and after: the worst case on record" },
        {
          t: "p",
          text: "The American crash of 1929 remains the calibration point for how bad equity can get: the market fell about 89% from its 1929 peak to the 1932 bottom, and the peak was not regained until 1954 — a quarter century. It is the crash that ruined Graham's clients, forged the margin of safety, and produced Security Analysis. Two of its lessons have never expired: leverage converts a drawdown into a wipeout (the 1929 market ran on 10% margin), and 'the market always comes back' is true of markets on decade timescales while being false, permanently, for many individual companies inside them.",
        },
        { t: "h", text: "The Nifty Fifty, 1972: quality at any price" },
        {
          t: "p",
          text: "By 1972, America's institutional consensus held that a list of great companies — Xerox, Polaroid, Avon, Disney, McDonald's — were 'one-decision' stocks: buy and never sell, price irrelevant. Several traded between 60 and 90 times earnings. The businesses were mostly as good as claimed; the prices were not, and in the 1973–74 break the group fell far harder than the market — Polaroid, at over 90× earnings at the peak, lost roughly 90% and never truly returned. The permanent lesson sits at the heart of this course's valuation section: a wonderful business and a wonderful investment are different claims, separated by the price paid.",
        },
        { t: "h", text: "1992: Harshad Mehta and the market India rebuilt" },
        {
          t: "p",
          text: "India's formative scandal. Through 1991–92, broker Harshad Mehta diverted an estimated ₹4,000–5,000 crore from the banking system — using fake and misused bank receipts in the ready-forward market — into a handful of stocks. The Sensex roughly quadrupled in about eighteen months to its April 1992 peak of around 4,467, with favourite counters multiplying far more, and 'the Big Bull' on magazine covers explaining why old valuation rules no longer applied. When a journalist exposed the funding chain, the index roughly halved within a year, and the favoured stocks fell much further.",
        },
        {
          t: "p",
          text: "What makes 1992 more than a crime story is what it built. The scandal gave SEBI statutory teeth (the SEBI Act, 1992), accelerated the founding of the NSE with screen-based trading, and set off the reforms that led to dematerialised shares and shorter settlement — the clean plumbing described in the mechanics section exists because this happened. A decade later the smaller Ketan Parekh episode (2001) — circular trading in ten favoured technology stocks with diverted bank funds — repeated the pattern and tightened the system again. The Indian retail investor's rulebook was written in these two fires.",
        },
        { t: "h", text: "2000: the dot-com bust" },
        {
          t: "p",
          text: "The internet was real — that is the uncomfortable part. The technology changed the world exactly as promised, and the NASDAQ still fell 78% from its March 2000 peak of 5,048 to the 2002 trough, taking fifteen years to regain the high. Companies with no revenue had been priced on 'eyeballs'; profitable survivors like Cisco fell 80%+ from prices that had assumed decades of perfection. India's parallel ran through the same months: the software favourites of 1999–2000 fell as hard, and Infosys itself — the same excellent business whose statements anchor this course — took years to grow back into its 2000 price. A true story does not make a price right; the reverse-DCF question ('what does this price assume?') is the vaccine this episode teaches.",
        },
        { t: "h", text: "2008: the credit crisis" },
        {
          t: "p",
          text: "A leverage crisis in American housing finance became, through interconnected balance sheets, everyone's crisis. The Sensex fell about 61% from its January 2008 peak near 21,000 to the March 2009 bottom near 8,200 — and then regained the peak by late 2010, faster than almost anyone at the bottom believed possible. 2008's lessons are about balance sheets and behaviour in equal measure: companies with debt maturing into a frozen credit market died regardless of their operations (the interest-cover and maturity checks in this course are 2008 lessons), and investors who held cash reserves and written theses bought the decade's best prices from investors who had neither.",
        },
        { t: "h", text: "2020: the fastest crash in history" },
        {
          t: "p",
          text: "COVID took the Sensex down roughly 38% in six weeks to its 23 March 2020 low — with daily moves hitting circuit breakers — and the recovery was equally unprecedented: the loss was regained within the same year while the pandemic still raged, as rates fell to historic lows and markets priced the recovery before the newspapers described the disaster. 2020 is the cleanest modern proof that markets are not mirrors of the present but auctions on the future, and that an investor who waits for the news to improve before acting waits until the prices already have.",
        },
        { t: "h", text: "Pakistan's own cycle" },
        {
          t: "p",
          text: "The KSE-100 compressed the whole pattern into one recent decade: a euphoric run to about 53,000 by May 2017 (MSCI emerging-market inclusion, CPEC optimism), a grinding 45%-plus decline over the following two years as the currency and macro cracked, long stagnation — and then, from 2023, one of the world's strongest bull markets, crossing 100,000 in late 2024. An investor who entered at the 2017 top and one who entered in the 2019 despair hold identical instruments with opposite experiences: the entry price, set by the crowd's mood, decided everything.",
        },
        { t: "h", text: "What actually repeats" },
        {
          t: "ul",
          items: [
            "Every mania has a true story at its core — electricity, the internet, reform, liquidity. The story being true is what makes the price being wrong so hard to see.",
            "The peak is unannounced and feels like the middle. The bottom is unannounced and feels like the end of the world. Nobody rings bells.",
            "Leverage is the difference between a bad year and a permanent exit. Every wipeout in this article ran through borrowed money somewhere.",
            "Indices recovered every single time; many individual favourites did not. Diversification and quality are what make 'wait for recovery' a plan rather than a hope.",
            "The rewards went to prepared temperament: cash to deploy, theses already written, and rules made in calm weather. The behaviour section is this article's toolkit.",
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "History rhymes; it does not schedule",
          text: "None of this predicts the next crash's date, cause or depth — no one has ever done that reliably, and this course will not pretend to. The claim is smaller and more useful: there will be one, it will feel different, and the balance sheet and behaviour that survived the last six will be what survives it.",
        },
      ],
      next: ["risk-and-volatility", "why-write-a-thesis"],
    },
  ],
};
