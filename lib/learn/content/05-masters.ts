import type { Section } from "../types";

// Quotes and figures are from the primary documents: Graham's The Intelligent
// Investor and Security Analysis, Fisher's Common Stocks and Uncommon Profits,
// and Berkshire Hathaway shareholder letters (1986, 1989, 2007, 2022 — checked
// against the letters themselves). Where a line is commonly attributed rather
// than printed in a primary source, the attribution says so.

export const masters: Section = {
  slug: "masters",
  title: "The investors worth studying",
  blurb:
    "Graham, Fisher, Buffett, Munger — where the ideas in this app come from, what each man actually said, and the record behind the reputation.",
  articles: [
    {
      slug: "why-the-masters",
      title: "Where these ideas come from",
      summary:
        "Every tool in Sarmaya has a lineage. A short map of who built what, before the four longer portraits.",
      minutes: 5,
      body: [
        {
          t: "p",
          text: "Nothing in this app is original, and that is deliberate. The tools — statements read across a decade, multiple valuation models shown as a range, a written thesis with rules attached — are the working methods of a specific intellectual tradition, built by a handful of people whose records and writings are public. Reading them directly is the highest-return study time available to an investor, and the four portraits that follow are meant as maps into their own books, not substitutes for them.",
        },
        {
          t: "table",
          caption: "The lineage of what you use in this app.",
          head: ["In Sarmaya", "The idea", "Its source"],
          rows: [
            [
              "Valuation as a range, never one number",
              "All value rests on assumptions; precision is false comfort",
              "Graham's margin of safety",
            ],
            [
              "Graham number",
              "A no-growth reference point from earnings and book value",
              "Graham, The Intelligent Investor",
            ],
            [
              "EPV model",
              "Value the current earning power; pay nothing for promises",
              "Graham, formalised later by Bruce Greenwald",
            ],
            [
              "DCF with your own inputs",
              "A business is worth its future cash, honestly estimated",
              "Buffett's owner-earnings discipline",
            ],
            [
              "Reverse DCF",
              "Invert: ask what the price already assumes",
              "Munger's habit of inversion",
            ],
            [
              "Ten-year statements, quality checks",
              "Study the business, not the ticker",
              "Fisher's scuttlebutt; Buffett's letters",
            ],
            [
              "Written thesis with kill criteria",
              "Decide on paper, in advance, so mood cannot decide later",
              "All four, in different words",
            ],
          ],
        },
        {
          t: "p",
          text: "A rough genealogy: Graham, writing after losing heavily in the 1929 crash, founded security analysis as a discipline — buy assets and earnings you can verify, demand a margin of safety, treat the market as a counterparty rather than a guide. Fisher, working at the same time on the other coast, built the opposite toolkit: deep qualitative research into a few outstanding growth companies, held for decades. Buffett began as Graham's student and employee, then — pushed by Munger — fused the two schools: Graham's discipline about price, Fisher's standards about quality. Munger supplied the thinking tools around it all: inversion, incentives, and the psychology of error. Almost everything worth reading in investing is a footnote to one of the four.",
        },
        {
          t: "note",
          kind: "watch",
          title: "Study the reasoning, not the portfolio",
          text: "None of what follows is a suggestion to imitate their holdings — different era, different markets, different tax rules, and they held through drawdowns most people cannot sit through. What transfers is the reasoning: how they defined risk, what they refused to do, and how they behaved when prices fell.",
        },
      ],
      next: ["graham", "fisher"],
    },
    {
      slug: "graham",
      title: "Benjamin Graham: the margin of safety",
      summary:
        "Mr. Market, the margin of safety, net-nets and the defensive investor's checklist — the foundation everything else stands on.",
      minutes: 12,
      body: [
        {
          t: "p",
          text: "Benjamin Graham (1894–1976) ran an investment partnership through the 1929 crash — in which it nearly failed — and came out the other side determined to make investing an analytical discipline rather than a rumour trade. The result was two books that still anchor the field: Security Analysis (1934, with David Dodd), the professional's text, and The Intelligent Investor (1949), the readable one. Warren Buffett, his student at Columbia and later his employee, calls the latter the best book about investing ever written.",
        },
        { t: "h", text: "Mr. Market" },
        {
          t: "p",
          text: "Graham's most durable teaching is a character. Imagine you own a share in a private business with a partner called Mr. Market. Every day, without fail, he names a price at which he will buy your interest or sell you more. Some days his price is sensible; some days his mood swings and the price is absurd in either direction. He does not mind being ignored — he will be back tomorrow with a new quote. The whole discipline of price falls out of the parable: the quote exists to serve you, not to instruct you. You are free to use it when it is foolish and ignore it when it is not. The investor's disadvantage begins only at the moment Mr. Market's mood becomes their own.",
        },
        {
          t: "quote",
          text: "In the short run, the market is a voting machine, but in the long run it is a weighing machine.",
          who: "Benjamin Graham",
          where: "as summarised by Warren Buffett in the 1993 Berkshire letter",
        },
        { t: "h", text: "The margin of safety" },
        {
          t: "p",
          text: "Asked to compress sound investment into three words, Graham chose: margin of safety. The idea is engineering, not finance. A bridge built to carry exactly its expected load fails at the first surprise; one built to carry three times that load absorbs surprises as routine. Since every estimate of a business's worth is uncertain, commit money only when the price is far enough below your estimate that being substantially wrong still leaves an acceptable outcome. The margin is not a way to boost returns — it is the acknowledgement, built into the purchase itself, that your analysis contains errors you cannot see.",
        },
        {
          t: "p",
          text: "This is the direct ancestor of Sarmaya's range band. A range of estimates with the price marked against it is the margin of safety made visible: the question the band asks is not 'what is the exact value' but 'how wrong could I afford to be at this price'.",
        },
        { t: "h", text: "Net-nets: the deep-discount era" },
        {
          t: "p",
          text: "Graham's signature purchase in the depressed markets of the 1930s and 40s was the net-net: a company priced below its net current asset value — what its cash, receivables and inventory would fetch, minus every liability, with the plant, brands and future thrown in for less than free.",
        },
        {
          t: "formula",
          expr: "NCAV per share = (current assets − total liabilities) ÷ shares outstanding",
          note: "Graham's working rule was to pay no more than two-thirds of this figure.",
        },
        {
          t: "p",
          text: "His Northern Pipe Line campaign of the 1920s shows the method at full strength: reading the pipeline company's obscure regulatory filings, Graham found it held railroad bonds and other liquid assets worth more per share than its own market price, and — after a proxy fight — pushed it to distribute the surplus to owners. Genuine net-nets are nearly extinct in modern markets outside panics and neglected small companies; what survives is the reflex, which applies everywhere: check what the balance sheet alone would justify before paying anything for the future.",
        },
        { t: "h", text: "The defensive investor's checklist" },
        {
          t: "p",
          text: "For the investor unwilling to make analysis a second job, Graham prescribed mechanical standards. His list from The Intelligent Investor (chapter 14), for its flavour more than its thresholds:",
        },
        {
          t: "ul",
          items: [
            "Adequate size — no small, fragile enterprises.",
            "Strong finances — current assets at least twice current liabilities; long-term debt below net current assets.",
            "Earnings stability — a profit in each of the past ten years.",
            "An unbroken dividend record — his benchmark was twenty years.",
            "Earnings growth — at least one-third growth in per-share earnings over ten years, using three-year averages at each end.",
            "A moderate multiple — price no more than 15× the average of the last three years' earnings.",
            "A moderate price to assets — price-to-book no more than 1.5, with the famous allowance that the two multiples may be traded off: P/E × P/B ≤ 22.5.",
          ],
        },
        {
          t: "p",
          text: "That last number is where Sarmaya's Graham-number model comes from: √(22.5 × EPS × book value per share) is simply the highest price consistent with both ceilings at once. The thresholds are period pieces — 1949 interest rates, 1949 accounting — but the structure is timeless: decide your standards before looking at any particular stock, and let the standards do the refusing.",
        },
        { t: "h", text: "The exception that taught the rule" },
        {
          t: "p",
          text: "In 1948 Graham's fund paid about $712,000 for half of GEICO, a then-small insurer — a position so large relative to the fund that it broke his own diversification rules. In the postscript to The Intelligent Investor he confesses the irony: the profits from that single decision far exceeded the combined profits of twenty years of the wide-ranging, rule-bound operations that made his reputation. Graham drew the honest conclusion — that one lucky or supremely shrewd decision can outweigh a lifetime of discipline — and left the tension unresolved. His best student would spend the next fifty years resolving it.",
        },
        {
          t: "note",
          kind: "key",
          title: "What transfers today",
          text: "The specific screens have aged; the three foundations have not. The market is a counterparty, not an oracle. Price and value are different things, connected only in the long run. And no analysis is good enough to be trusted without a margin for its own error.",
        },
      ],
      next: ["fisher", "no-single-value"],
    },
    {
      slug: "fisher",
      title: "Philip Fisher: scuttlebutt and the outstanding company",
      summary:
        "The fifteen points, the scuttlebutt method, and the case for holding a great business almost indefinitely.",
      minutes: 10,
      body: [
        {
          t: "p",
          text: "Philip Fisher (1907–2004) started his San Francisco investment counselling firm in 1931 and ran it for nearly seventy years. Where Graham asked 'what is this worth today, verifiably?', Fisher asked 'which few companies will be much larger and stronger in fifteen years?' — and held the answers for decades. He bought Motorola in 1955 and still held it at his death in 2004. His 1958 book Common Stocks and Uncommon Profits was the first investment book Buffett publicly recommended alongside Graham's, and Buffett has described his own approach as a blend of the two.",
        },
        { t: "h", text: "Scuttlebutt" },
        {
          t: "p",
          text: "Fisher's method starts from a blunt observation: the most valuable facts about a company are not in its filings. They are distributed among the people who deal with it — customers, suppliers, competitors, former employees, industry researchers — and most of them will talk. He called the systematic collection of this 'scuttlebutt', navy slang for the water-barrel where sailors traded gossip. His favourite question was to ask executives what their competitors do better. Companies rarely flatter their rivals, so agreement across five such conversations is close to fact.",
        },
        {
          t: "p",
          text: "For a retail investor in India or Pakistan the method costs nothing but shoe leather: count customers in the store, ask the distributor which brand he pushes and why, read the rival's annual report for its account of the market, find the product's users and listen. One honest dealer describing which company's stock sits unsold is worth a dozen broker reports.",
        },
        { t: "h", text: "The fifteen points, compressed" },
        {
          t: "p",
          text: "Fisher's checklist of what an outstanding company looks like — fifteen questions in the book, grouped here by what they probe:",
        },
        {
          t: "table",
          caption:
            "Condensed from Common Stocks and Uncommon Profits (1958), chapter 3.",
          head: ["Probing", "The questions, shortened"],
          rows: [
            [
              "The runway",
              "Do the products have room for years of sales growth? When today's lines mature, is management already developing the next?",
            ],
            [
              "The machine",
              "Is research productive for its size? Is the sales organisation better than the industry's? Are margins worthwhile — and what specifically is being done to protect and improve them?",
            ],
            [
              "The people",
              "Are labour and executive relations genuinely good? Is there depth beyond the founder? Are costs actually understood by management?",
            ],
            [
              "The character",
              "Does management think in years, not quarters? Will growth be funded without endless dilution? Do they talk as freely when things go wrong? Is their integrity beyond question?",
            ],
          ],
        },
        {
          t: "p",
          text: "Point fifteen — integrity — was Fisher's veto: fail it and the other fourteen do not matter, because you cannot be a minority partner of people who regard your share as their option pool. Notice how many of the fifteen cannot be answered from statements at all. That is the point: the numbers confirm quality, but the discovery of it is field work.",
        },
        { t: "h", text: "Holding, selling, and how many" },
        {
          t: "quote",
          text: "If the job has been correctly done when a common stock is purchased, the time to sell it is — almost never.",
          who: "Philip Fisher",
          where: "Common Stocks and Uncommon Profits",
        },
        {
          t: "p",
          text: "Fisher allowed three reasons to sell: the original analysis was wrong; the company no longer passes the fifteen points; or a demonstrably better opportunity exists — the last to be used sparingly, because the compounding you understand is worth more than the promise you do not. Selling merely because a price had risen, or because the market looked high, he regarded as forfeiting the whole logic of owning outstanding businesses. He was equally heretical on diversification: a handful of companies known deeply beats forty known superficially — 'I don't want a lot of good investments; I want a few outstanding ones.'",
        },
        {
          t: "note",
          kind: "key",
          title: "What transfers today",
          text: "Quality is researchable by ordinary people — the information is legally public, just not conveniently filed. Time in an outstanding business does the compounding. And the qualitative questions (runway, people, integrity) belong in a written checklist exactly because they never appear in a ratio table.",
        },
      ],
      next: ["buffett", "studying-a-company"],
    },
    {
      slug: "buffett",
      title: "Warren Buffett: from cigar butts to compounders",
      summary:
        "Owner earnings, the four filters, and the documented arithmetic of See's, Coca-Cola and American Express.",
      minutes: 13,
      body: [
        {
          t: "p",
          text: "Warren Buffett (b. 1930) ran a Graham-style partnership from 1956 to 1969, then compounded Berkshire Hathaway — originally a failing textile mill, itself a cigar-butt purchase he later called a mistake — for six decades. His annual letters to shareholders, all free on Berkshire's website, are the best sustained course in business analysis ever written; the figures in this article come from them.",
        },
        { t: "h", text: "The early method, and why he abandoned it" },
        {
          t: "p",
          text: "The partnership years were Graham applied with youthful aggression: statistically dirt-cheap companies — 'cigar butts' with one free puff left in them — bought below liquidation value, sold on the bounce. It worked brilliantly with small sums, including the famous 1964 American Express purchase: when the salad-oil scandal (a borrower had faked warehouse receipts for vegetable oil that did not exist) knocked the shares down by half, Buffett checked whether cardholders and merchants had stopped using Amex — scuttlebutt, not spreadsheets — found the franchise untouched, and put roughly forty percent of the partnership into it. But cigar butts do not scale, and time works against a mediocre business: the longer you hold it, the more its poor economics dominate the cheap price you paid.",
        },
        {
          t: "quote",
          text: "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.",
          who: "Warren Buffett",
          where: "1989 Berkshire Hathaway letter",
        },
        {
          t: "p",
          text: "The shift — urged by Charlie Munger and vindicated by See's Candies, whose full arithmetic is in the margins article — was from buying discounts to buying compounding machines: businesses whose returns on capital are so good that holding them for decades, at a merely sensible entry price, beats a parade of bargains. The purchase of See's in 1972 at three times book value would have been unthinkable to Graham; it became the most instructive investment Berkshire ever made.",
        },
        { t: "h", text: "Owner earnings" },
        {
          t: "p",
          text: "Buffett's contribution to valuation arithmetic is a definition. Reported earnings mislead in both directions: depreciation can understate what maintaining the business really costs, and accounting charges can overstate it. What the owner truly receives is:",
        },
        {
          t: "formula",
          expr: "owner earnings = reported earnings\n               + depreciation, amortisation and other non-cash charges\n               − maintenance capex (the capital spending required to hold\n                 the business's position and volume)",
          note: "From the appendix to the 1986 Berkshire letter. Maintenance capex must be estimated — which, Buffett notes, is exactly why the figure is honest.",
        },
        {
          t: "p",
          text: "Free cash flow — CFO minus all capex, which Sarmaya's DCF uses — is the computable cousin: stricter than owner earnings when a company is investing heavily in growth, since it subtracts growth spending too. The idea to keep is the question behind the definition: of the profit this company reports, how much could actually be mailed to the owners each year without the business shrinking?",
        },
        { t: "h", text: "The four filters" },
        {
          t: "p",
          text: "Buffett's own statement of his method, from the 2007 letter: 'Charlie and I look for companies that have a) a business we understand; b) favorable long-term economics; c) able and trustworthy management; and d) a sensible price tag.' The order is the lesson — price comes fourth, and the first filter does most of the refusing. The 'circle of competence' is the honest map of what you can actually judge; its size, he insists, matters far less than knowing exactly where its edge is. Everything outside the edge goes in a pile Buffett and Munger labelled 'too hard', where most things belong.",
        },
        { t: "h", text: "The record, in its own numbers" },
        {
          t: "table",
          caption:
            "From the 2022 Berkshire letter — the two purchases Buffett chose to illustrate his 'secret sauce'.",
          head: ["", "Coca-Cola", "American Express"],
          rows: [
            ["Purchase completed", "1994 (begun 1988)", "1995"],
            ["Total cost", "$1.3 billion", "$1.3 billion"],
            ["Annual dividend then", "$75 million (1994)", "$41 million"],
            ["Annual dividend, 2022", "$704 million", "$302 million"],
            ["Position value, end 2022", "$25 billion", "$22 billion"],
          ],
        },
        {
          t: "p",
          text: "Read the dividend rows: the cash income alone grew roughly ninefold on Coca-Cola and sevenfold on Amex while the shares themselves multiplied in value — and the letter's stated lesson is not stock-picking prowess but arithmetic and patience: 'the weeds wither away in significance as the flowers bloom.' A dozen truly good decisions in sixty years, held without interruption, produced the record; in the same letter he grades most of his capital-allocation decisions as 'no better than so-so'. Note also what the table quietly teaches about position sizing done by holding rather than buying: each stake became about five percent of Berkshire's worth by growing, not by being topped up.",
        },
        {
          t: "quote",
          text: "Price is what you pay. Value is what you get.",
          who: "Warren Buffett",
          where: "2008 Berkshire letter, crediting Ben Graham",
        },
        {
          t: "note",
          kind: "key",
          title: "What transfers today",
          text: "Judge the business first and the price fourth. Compute what an owner could actually withdraw, not what the accounts announce. Stay inside the edge of what you can judge, and let refusal do most of the work — the record above was built on a dozen yeses and ten thousand nos.",
        },
      ],
      next: ["munger", "margins-and-pricing-power"],
    },
    {
      slug: "munger",
      title: "Charlie Munger: inversion, incentives, and sitting still",
      summary:
        "The latticework of mental models, the psychology of misjudgment, and why avoiding stupidity beats seeking brilliance.",
      minutes: 11,
      body: [
        {
          t: "p",
          text: "Charlie Munger (1924–2023) was a lawyer who ran his own investment partnership before becoming Berkshire Hathaway's vice-chairman and Buffett's thinking partner for over half a century. He published no book of his own; his teaching survives in talks and Q&A collected in Poor Charlie's Almanack — above all the Harvard speech 'The Psychology of Human Misjudgment'. His influence on Buffett was structural: it was Munger who argued that a great business at a sensible price beats a mediocre one at a bargain price, the pivot on which Berkshire's whole record turns.",
        },
        { t: "h", text: "The latticework" },
        {
          t: "p",
          text: "Munger's core claim is that investing cannot be done well with finance concepts alone. Reality is not organised by academic department, so a judge of businesses needs the big ideas of many fields — compound interest from mathematics, break-points and feedback from engineering, evolution and ecosystems from biology, incentives from economics, misjudgment from psychology — hung on a 'latticework' and applied together. A person with one model treats everything as a nail; a person with eighty notices which three apply. The point is not erudition but error-avoidance: most bad investments fail for reasons that were visible from a discipline the investor did not think to consult.",
        },
        { t: "h", text: "Invert, always invert" },
        {
          t: "p",
          text: "From the mathematician Carl Jacobi, Munger took the habit of solving problems backwards. Instead of 'how do I get a good outcome?', ask 'what guarantees a terrible one?' — and avoid that. Applied to a company: do not ask why it will succeed; write down what would kill it, then check how far each cause has already progressed. Applied to a price: do not project growth to justify it; extract the growth it already assumes and ask whether the company has ever done that. Sarmaya's reverse DCF is inversion built into a tool, and the pre-mortem in the study process is inversion built into a habit.",
        },
        {
          t: "quote",
          text: "All I want to know is where I'm going to die, so I'll never go there.",
          who: "Charlie Munger",
          where: "a favourite line, collected in Poor Charlie's Almanack",
        },
        { t: "h", text: "The psychology of misjudgment" },
        {
          t: "p",
          text: "Munger catalogued twenty-five psychological tendencies that produce systematic error. The behaviour section of this course covers the biases in practice; these are the entries most expensive in markets, with the shape they take there:",
        },
        {
          t: "table",
          caption:
            "Selected from 'The Psychology of Human Misjudgment', investing manifestations.",
          head: ["Tendency", "How it costs money"],
          rows: [
            [
              "Incentive-caused bias",
              "Whoever is paid on your action — brokerage, fund launches, tips channels — will sincerely believe advice that generates it. Ask what the adviser earns if you act.",
            ],
            [
              "Social proof",
              "Buying because everyone is buying; the mechanism of every bubble and the reason tops feel safest.",
            ],
            [
              "Commitment and consistency",
              "Having said a stock is great — publicly, or just in your own head — you defend it against new facts instead of updating.",
            ],
            [
              "Deprival super-reaction",
              "Losses hurt roughly twice as much as gains please, so people hold losers to avoid 'making the loss real' and sell winners to feel it.",
            ],
            [
              "Availability",
              "Whatever is vivid and recent — last month's crash, a neighbour's multibagger — feels probable; base rates do not.",
            ],
            [
              "Lollapalooza",
              "Munger's word for several tendencies firing together in one direction. A late-stage bull market is social proof + envy + incentive bias + availability at once, which is why intelligence alone does not protect anyone.",
            ],
          ],
        },
        {
          t: "quote",
          text: "Show me the incentive and I will show you the outcome.",
          who: "Charlie Munger",
        },
        { t: "h", text: "Sit-on-your-ass investing" },
        {
          t: "p",
          text: "Munger's name for the conclusion the whole framework points to: a few outstanding businesses, bought after genuine work, held with something close to inactivity. Activity is where the costs live — brokerage, taxes, and above all fresh opportunities for misjudgment; each transaction is another chance for one of the twenty-five tendencies to fire. 'The big money is not in the buying and the selling, but in the waiting.' The waiting is not passive, he insisted — it is the readiness to act at scale on the rare day the odds are overwhelming, funded by all the days you did nothing.",
        },
        {
          t: "p",
          text: "His two-track analysis is the practical wrapper: first, work out the rational answer — what are the real economics of this business? Second, and separately, audit the psychology — which tendencies, in the market and in yourself, are distorting how this situation appears? A decision is finished only when both tracks have been run.",
        },
        {
          t: "note",
          kind: "key",
          title: "What transfers today",
          text: "Invert every study before finishing it. Trace every piece of advice to its incentive. Treat activity as a cost centre and waiting as a position. And measure yourself by the stupidity avoided, which compounds quietly, rather than the brilliance attempted, which usually does not.",
        },
      ],
      next: ["biases", "reverse-dcf"],
    },
    {
      slug: "wider-tradition",
      title: "The wider tradition, including ours",
      summary:
        "Lynch, Bogle, Templeton, Marks, Klarman — and the Indian investors who proved the craft transfers: Parikh, Jhunjhunwala, Agrawal, Prasad.",
      minutes: 11,
      body: [
        {
          t: "p",
          text: "The four portraits before this are the trunk of the tree; these are branches worth knowing, each for one distinct idea you can actually use. None of them contradicts the others on what matters — business first, price discipline, temperament over intellect — which is itself the strongest evidence the craft is real.",
        },
        { t: "h", text: "Peter Lynch: the amateur's edge" },
        {
          t: "p",
          text: "Lynch ran Fidelity's Magellan fund from 1977 to 1990 at about 29% a year, and then wrote two books — One Up on Wall Street and Beating the Street — arguing that ordinary people can beat professionals precisely because they meet products and companies in real life years before Wall Street's spreadsheets do. He also coined the most useful pejorative in portfolio construction, 'diworsification' — adding holdings until the portfolio guarantees mediocrity — and his one-line discipline appears throughout this course: know what you own, and know why you own it. His sharpest warning is behavioural: more money is lost preparing for corrections, and jumping in and out to dodge them, than in the corrections themselves.",
        },
        { t: "h", text: "John Bogle: the case against costs" },
        {
          t: "p",
          text: "Bogle founded Vanguard and, in 1976, launched the first index fund available to the public — mocked at the time as 'Bogle's folly', now the largest ownership structure in world markets. His argument is arithmetic, not opinion: investors as a group earn the market's return minus what they pay in fees and trading, so the cheapest broad exposure must beat the average participant over time. Every article in this course that mentions expense ratios or churn is downstream of Bogle. His maxim survives translation into every market: you get what you don't pay for.",
        },
        {
          t: "h",
          text: "John Templeton: buy at the point of maximum pessimism",
        },
        {
          t: "p",
          text: "Templeton's founding act is the cleanest margin-of-safety story on record: in 1939, with war beginning and pessimism absolute, he bought every US-listed stock trading under a dollar — about a hundred companies, many in bankruptcy — and multiplied his money several times over the following years. He then spent decades applying the same reflex globally, buying Japan in the 1960s before the world noticed it. Two of his rules frame this course's history article: the time of maximum pessimism is the best time to buy, and 'this time it's different' are the four most expensive words in investing.",
        },
        { t: "h", text: "Howard Marks and Seth Klarman: risk, restated" },
        {
          t: "p",
          text: "Marks (Oaktree Capital) writes the most-read memos in professional investing — Buffett says he opens them first. His two exportable ideas: second-level thinking (the question is never 'is this a good company' but 'is it better than the price already says'), and cycle awareness — you cannot predict the cycle, but you can know roughly where you stand in it and lean accordingly. Klarman's out-of-print Margin of Safety restates Graham for modern markets in one sentence worth keeping: risk is not volatility; it is the probability of permanent capital loss, and it is highest exactly when things feel safest.",
        },
        { t: "h", text: "The Indian lineage" },
        {
          t: "p",
          text: "The craft transferred to South Asia intact, with local proof at every scale.",
        },
        {
          t: "ul",
          items: [
            "Parag Parikh — India's first serious writer on behavioural value investing (Value Investing and Behavioural Finance, 2007), and founder of the fund house that still bears the approach. His core claim: in a market as sentiment-driven as India's, temperament is the edge, because analysis is increasingly common and calm is not.",
            "Rakesh Jhunjhunwala — India's most famous individual investor, who ran a few thousand rupees in 1985 into a multi-billion-dollar estate by his death in 2022. Behind the folklore, his method was orthodox: a handful of conviction positions (most famously Titan, held through crashes for nearly two decades), leverage used knowingly and separately from the core portfolio, and the repeated insistence that his mistakes taught him more than his wins.",
            "Raamdeo Agrawal — co-founder of Motilal Oswal, whose annual Wealth Creation Studies are the closest thing India has to the Berkshire letters: free, data-heavy autopsies of which listed businesses compounded and why. His QGLP checklist — quality, growth, longevity, price — is the four filters in an Indian accent.",
            "Pulak Prasad — Nalanda Capital's founder, whose What I Learned About Investing from Darwin (2023) is the best recent book in the tradition: buy exceptional, conservatively financed businesses rarely, sell almost never, and treat avoiding ruin — not finding winners — as the investor's actual job.",
          ],
        },
        { t: "h", text: "A reading order" },
        {
          t: "table",
          caption:
            "If the course leaves you wanting the sources — one sensible sequence.",
          head: ["Start", "Book / source", "For"],
          rows: [
            [
              "1",
              "One Up on Wall Street — Lynch",
              "The gentlest serious start; ideas and temperament",
            ],
            [
              "2",
              "The Intelligent Investor — Graham (ch. 8 and 20 first)",
              "Mr. Market and margin of safety, from the source",
            ],
            [
              "3",
              "Berkshire letters — Buffett (free online)",
              "Business analysis as literature; start with 1983–1996",
            ],
            [
              "4",
              "Common Stocks and Uncommon Profits — Fisher",
              "Scuttlebutt and the fifteen points",
            ],
            [
              "5",
              "Poor Charlie's Almanack — Munger",
              "The thinking tools around everything else",
            ],
            [
              "6",
              "Value Investing and Behavioural Finance — Parikh",
              "The whole tradition, in the Indian market's own terms",
            ],
            [
              "7",
              "The Most Important Thing — Marks",
              "Risk and cycles, once the basics are set",
            ],
          ],
        },
        {
          t: "note",
          kind: "key",
          title: "What the whole tradition agrees on",
          text: "Across seventy years, two continents and wildly different personalities: the stock is a business, the market is a servant, the price paid decides the return, costs and churn are the silent killers, and temperament — not intelligence — is the scarce input. Everything else is implementation detail.",
        },
      ],
      next: ["market-history", "why-write-a-thesis"],
    },
  ],
};
