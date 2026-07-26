import type { Section } from "../types";

// Real figures in this section are from primary sources, checked against the
// documents themselves: Infosys's FY2025 audited results (stock-exchange
// release filed with the SEC on 2025-04-17), Berkshire Hathaway shareholder
// letters (2007, 2022), B. Ramalinga Raju's 2009-01-07 letter to the Satyam
// board (SEC exhibit), and consolidated filing histories for HUL and Tata
// Steel. Figures are as reported; rounding is noted where used.

export const readingABusiness: Section = {
  slug: "reading-a-business",
  title: "Studying a business",
  blurb:
    "The three statements, the income statement line by line, margins and pricing power, whether the profit is real — and a repeatable way to study any company.",
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
          text: "Covers a period, usually a year. It starts with revenue and subtracts its way down to net income. It is the statement this course spends the most time on, because it is where the economics of the business — what it sells, what that costs, what is left — become visible. The next article takes it apart line by line.",
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
      next: ["income-statement", "key-figures"],
    },
    {
      slug: "income-statement",
      title: "The income statement, line by line",
      summary:
        "A real audited statement — Infosys, FY2025 — taken apart one line at a time, in both formats you will meet.",
      minutes: 16,
      body: [
        {
          t: "p",
          text: "This article walks through a real income statement: Infosys Limited, consolidated, for the year ended 31 March 2025, as audited and filed with the stock exchanges. The point is not Infosys — it is that after reading one statement slowly, every other statement becomes familiar. They all have the same skeleton.",
        },
        {
          t: "p",
          text: "One thing to know before starting: there are two ways to present the same year, and you will meet both. Companies reporting under IFRS or US GAAP usually classify costs by function — cost of sales, selling costs, admin costs — which gives you a gross profit line. Indian companies reporting under Ind-AS usually classify costs by nature — employee costs, materials, depreciation — which does not. Same business, same profit, different grouping. Infosys publishes both, so you can see one year through both lenses.",
        },
        { t: "h", text: "Format one: by function (IFRS)" },
        {
          t: "table",
          caption:
            "Infosys, consolidated, IFRS, in US$ million. Year ended 31 March. Source: audited results filed 17 April 2025.",
          head: ["Line", "FY2025", "FY2024", "% of revenue (FY25)"],
          rows: [
            ["Revenues", "19,277", "18,562", "100%"],
            ["Cost of sales", "13,405", "12,975", "69.5%"],
            ["Gross profit", "5,872", "5,587", "30.5%"],
            ["Operating expenses", "1,801", "1,753", "9.3%"],
            ["Operating profit", "4,071", "3,834", "21.1%"],
            ["Other income, net", "425", "568", "—"],
            ["Finance cost", "49", "56", "—"],
            ["Profit before income taxes", "4,447", "4,346", "—"],
            ["Income tax expense", "1,285", "1,177", "—"],
            ["Net profit", "3,162", "3,169", "16.4%"],
          ],
        },
        {
          t: "p",
          text: "Read it top to bottom as a story. Infosys billed clients $19.3 billion. Delivering that work — mostly engineers' salaries — cost $13.4 billion, leaving a 30.5% gross margin. Running the company around that delivery — sales teams, management, offices — took another $1.8 billion, leaving $4.1 billion of operating profit: 21 paise of every revenue rupee survived the business itself. Then come three lines that have nothing to do with operations — interest earned on the cash pile, interest paid, and tax — and $3.2 billion reaches the owners.",
        },
        { t: "h", text: "Format two: the same year, by nature (Ind-AS)" },
        {
          t: "table",
          caption:
            "Infosys, consolidated, Ind-AS, in ₹ crore. Year ended 31 March. Same company, same year, Indian presentation. Source: audited results filed 17 April 2025.",
          head: ["Line", "FY2025", "FY2024"],
          rows: [
            ["Revenue from operations", "162,990", "153,670"],
            ["Other income, net", "3,600", "4,711"],
            ["Total income", "166,590", "158,381"],
            ["Employee benefit expenses", "85,950", "82,620"],
            ["Cost of technical sub-contractors", "12,937", "12,232"],
            ["Travel expenses", "1,894", "1,759"],
            ["Cost of software packages and others", "15,911", "13,515"],
            ["Communication expenses", "620", "677"],
            ["Consultancy and professional charges", "1,655", "1,726"],
            ["Depreciation and amortisation", "4,812", "4,678"],
            ["Finance cost", "416", "470"],
            ["Other expenses", "4,787", "4,716"],
            ["Total expenses", "128,982", "122,393"],
            ["Profit before tax", "37,608", "35,988"],
            ["Tax expense", "10,858", "9,740"],
            ["Profit for the period", "26,750", "26,248"],
            ["EPS, basic (₹)", "64.50", "63.39"],
            ["EPS, diluted (₹)", "64.34", "63.29"],
          ],
        },
        {
          t: "p",
          text: "Notice what changed. There is no gross profit line — costs are grouped by what they are, not what they were for. Other income has moved to the top, inside 'total income', instead of sitting below operating profit. And now you can see something the IFRS format hid: employee costs are ₹85,950 crore, about 53 paise of every revenue rupee. Infosys is a business that converts salaries into billings. That single ratio — employee cost to revenue — is the operating story of every IT services firm, and the by-nature format hands it to you directly.",
        },
        {
          t: "note",
          kind: "watch",
          title: "Reconstruct what the format hides",
          text: "With an Ind-AS statement, compute operating profit yourself: revenue from operations, minus total expenses, adding back finance cost (a financing item, not an operating one) — for Infosys FY2025 that is roughly ₹34,400 crore, a 21.1% operating margin, matching the IFRS figure exactly. Never judge margins from 'total income', because it smuggles non-operating income into the top line.",
        },
        { t: "h", text: "What to ask each line" },
        {
          t: "terms",
          items: [
            {
              term: "Revenue",
              def: "Is it growing, and from what — more units, higher prices, or an acquisition? Price-driven growth with steady volumes signals pricing power; acquisition-driven growth needs the balance sheet checked for the debt that paid for it. Infosys grew 6.1% in rupee terms this year — for a company its size, a mature-business rate.",
            },
            {
              term: "The biggest cost line",
              def: "Every business has one cost that is the business: salaries for a services firm, raw materials for a manufacturer, interest for a bank. Find it, compute it as a share of revenue, and watch it across years. When it drifts up, either the company is losing pricing power or its input costs are outrunning it.",
            },
            {
              term: "Depreciation and amortisation",
              def: "The year's share of past capital spending, spread over the assets' assumed lives. It is a real cost paid in cash earlier — but the annual figure rests on an assumption. Lengthen the assumed life and reported profit rises with no change in the business.",
            },
            {
              term: "Finance cost",
              def: "Interest on borrowings. Compare it with operating profit: operating profit ÷ interest is the interest cover, and a business earning only two or three times its interest bill has handed its bad years to its lenders.",
            },
            {
              term: "Other income",
              def: "Interest on cash, investment gains, one-off credits. It is real money but it is not the business. See the warning below — this line rewards close reading more than any other.",
            },
            {
              term: "Tax",
              def: "Compute the effective rate: tax ÷ profit before tax. Infosys FY2025: 10,858 ÷ 37,608 ≈ 29%. A rate persistently far below the statutory corporate rate needs an explanation you can understand — incentives, export zones, or something less durable.",
            },
            {
              term: "EPS, basic and diluted",
              def: "Diluted EPS assumes all stock options and convertibles become shares. The gap between basic (₹64.50) and diluted (₹64.34) is the cost of employee stock grants to you, the outside owner. A widening gap means you are being diluted faster.",
            },
          ],
        },
        { t: "h", text: "The 'other income' trap — a live example" },
        {
          t: "p",
          text: "The notes to these same Infosys accounts disclose that other income included interest on an income-tax refund of ₹1,965 crore in FY2024 and ₹343 crore in FY2025. Strip those out and 'core' other income barely moved — but a reader comparing the raw lines would conclude other income collapsed by a quarter and profit growth was better than it looked. The note is three sentences long, and it changes the year-on-year story. This is why the notes are not optional.",
        },
        {
          t: "note",
          kind: "key",
          title: "Profit before tax is not 'the business'",
          text: "Infosys's FY2025 profit before tax of ₹37,608 crore includes ₹3,600 crore of other income — nearly a tenth. A business is its operating profit. Everything below that line is treasury, financing and tax: real, worth understanding, but not the thing you are valuing when you value the company.",
        },
        { t: "h", text: "Common-size: the statement as percentages" },
        {
          t: "formula",
          expr: "common-size line = line item ÷ revenue",
          note: "Do it for every line, every year. Size disappears; structure remains.",
        },
        {
          t: "p",
          text: "Dividing every line by revenue turns the statement into a shape that can be compared across years and across companies of any size. Infosys FY2025 in common-size: gross margin 30.5%, operating margin 21.1%, net margin 16.4%, employee costs 53% of revenue. Do the same for TCS or Wipro and you are comparing like with like, whatever their absolute size. Do it for five years of one company and cost drift that is invisible in crore terms becomes obvious in percentage terms.",
        },
        { t: "h", text: "One year is a photograph; ten years is the film" },
        {
          t: "p",
          text: "Benjamin Graham's advice on earnings was to distrust any single year: he worked from average earnings over seven to ten years, precisely so that one flattering or disastrous year could not dominate the arithmetic. A single income statement tells you almost nothing about durability. The questions that matter — does the margin hold through a downturn, does growth cost more capital each year, do one-offs recur — are only answerable across a decade of statements read side by side, which is how Sarmaya lays them out.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "The statements table shows every year the data source provides and accumulates new years as they arrive. Click any figure to attach a note — 'FY24 other income includes ₹1,965 cr tax-refund interest' pinned to that exact cell is worth more than a perfect memory.",
        },
      ],
      next: ["margins-and-pricing-power", "quality-of-earnings"],
    },
    {
      slug: "margins-and-pricing-power",
      title: "Margins, moats and pricing power",
      summary:
        "What margin structure reveals about competitive position — with a brand, a commodity and a services firm side by side, and the See's Candies numbers.",
      minutes: 13,
      body: [
        {
          t: "p",
          text: "A margin is what survives. Gross margin is what survives making the product; operating margin is what survives running the company; net margin is what survives everyone with a prior claim — suppliers, employees, lenders, the tax office. The level matters less than what it says about the company's position: a business that keeps a lot of each rupee, year after year, is a business whose customers have nowhere better to go.",
        },
        {
          t: "formula",
          expr: "gross margin = gross profit ÷ revenue\noperating margin = operating income ÷ revenue\nnet margin = net income ÷ revenue",
        },
        { t: "h", text: "Three real margin structures" },
        {
          t: "table",
          caption:
            "FY2025, consolidated, ₹ crore, figures as reported (margins rounded). Three listed companies, three different businesses.",
          head: [
            "Company",
            "What it sells",
            "Revenue",
            "Op. margin",
            "Net margin",
          ],
          rows: [
            [
              "Hindustan Unilever",
              "Branded consumer goods",
              "61,328",
              "~24%",
              "~17%",
            ],
            ["Infosys", "IT services", "162,990", "~21%", "~16%"],
            ["Tata Steel", "Steel", "218,543", "~12%", "~1.5%"],
          ],
        },
        {
          t: "p",
          text: "Tata Steel sells three and a half times more than Hindustan Unilever and keeps a fraction as much. That is not a criticism of Tata Steel — it is the nature of selling a commodity. Nobody pays extra for a particular company's steel; price is set by the world market, and in a weak year it can fall below cost. A brand is the opposite: the buyer of a specific soap or a specific chocolate accepts a price the maker chooses, within limits, and that choice shows up as a margin that persists.",
        },
        { t: "h", text: "The trend tells you more than the level" },
        {
          t: "table",
          caption:
            "Operating margin across a decade, consolidated, from company filings (rounded).",
          head: ["Year (FY)", "Hindustan Unilever", "Tata Steel"],
          rows: [
            ["2016", "18%", "−1%"],
            ["2018", "21%", "17%"],
            ["2020", "25%", "12%"],
            ["2022", "25%", "26%"],
            ["2024", "24%", "10%"],
            ["2025", "24%", "12%"],
          ],
        },
        {
          t: "p",
          text: "Read the columns as characters. HUL's margin walks upward and then holds a narrow band — pricing power plus cost discipline, disturbed by nothing in a decade that included a pandemic. Tata Steel's margin is a sine wave: from negative to 26% and back to 10%, driven by global steel prices the company does not set. Neither column is a secret; both are public arithmetic. But they imply completely different valuation problems — the next article on cyclicality and the P/E trap comes back to this.",
        },
        {
          t: "quote",
          text: "The single most important decision in evaluating a business is pricing power. If you've got the power to raise prices without losing business to a competitor, you've got a very good business.",
          who: "Warren Buffett",
          where: "testimony to the Financial Crisis Inquiry Commission, 2010",
        },
        { t: "h", text: "See's Candies: pricing power, measured" },
        {
          t: "p",
          text: "The cleanest documented example of what pricing power is worth comes from Berkshire Hathaway's 2007 shareholder letter, where Buffett laid out the full arithmetic of See's Candies, the boxed-chocolate maker Berkshire bought in 1972.",
        },
        {
          t: "table",
          caption:
            "See's Candies, from the Berkshire Hathaway 2007 shareholder letter. All figures as stated in the letter.",
          head: ["Measure", "1972", "2007"],
          rows: [
            ["Sales", "$30 million", "$383 million"],
            ["Pre-tax earnings", "under $5 million", "$82 million"],
            ["Capital required to run it", "$8 million", "$40 million"],
          ],
        },
        {
          t: "p",
          text: "Two details carry the lesson. First, volume barely grew: See's sold 16 million pounds of chocolate in 1972 and 31 million in 2007 — about 2% a year. Nearly all of the twelvefold sales growth was price, taken year after year from customers who kept coming back. Second, the growth was almost free: earnings went from $5 million to $82 million while the capital in the business grew by only $32 million. Cumulative pre-tax earnings of $1.35 billion were sent to the parent company to be invested elsewhere. A business that can raise prices without losing customers, and grow without consuming capital, is the rarest and most valuable kind — Buffett's own summary was that 'there aren't many See's in Corporate America'.",
        },
        { t: "h", text: "Where durable margins come from" },
        {
          t: "p",
          text: "A persistently high margin is a puzzle: competitors can see it too, and profit attracts imitation the way blood attracts sharks. When the margin survives anyway, something is blocking the competition. Investors call that something a moat. The common forms:",
        },
        {
          t: "ul",
          items: [
            "Brand — the customer asks for the product by name and accepts its price. Visible as: gross margin far above generic competitors, sustained ad spending, price increases that stick (HUL, See's).",
            "Switching costs — leaving is expensive or risky, so customers stay through price rises. Visible as: very high revenue retention, long contracts (core banking software, ERP systems).",
            "Network effects — the product improves as more people use it, so the leader compounds (exchanges themselves, payment networks, marketplaces).",
            "Cost advantage — the company produces at a cost others cannot reach, from scale, location or process. Visible as: ordinary prices but superior margins (the lowest-cost cement plant in a region).",
            "Licences and regulation — the state limits who may compete (airports, ratings agencies, some banks).",
          ],
        },
        {
          t: "note",
          kind: "watch",
          title: "A moat is a hypothesis, not a label",
          text: "Naming a moat is easy; the discipline is stating what evidence would show it eroding. Falling gross margin, rising ad spend to hold the same share, lengthening receivables to keep customers — those are a moat leaking before it fails. Write the evidence you are watching into your thesis, not just the claim.",
        },
        {
          t: "h",
          text: "Operating leverage: why margins move faster than sales",
        },
        {
          t: "p",
          text: "Costs come in two kinds. Variable costs move with each unit sold; fixed costs — the plant, the lease, much of the payroll — are the same whether the year is good or bad. The higher the fixed share, the more violently profit responds to a change in revenue, in both directions. A steel plant at 95% utilisation prints money; the same plant at 70% loses it, because the furnace costs the same either way. This is operating leverage, and it is why Tata Steel's margin column swings and HUL's does not: detergent demand barely moves, and much of HUL's cost (materials, packaging) is variable.",
        },
        {
          t: "note",
          kind: "key",
          text: "When you see operating margin jump in a single year, ask which it was: pricing power (durable), cost cutting (partly durable), a favourable input-price year (temporary), or operating leverage on a demand spike (temporary, and symmetric — it will amplify the downturn too).",
        },
      ],
      next: ["quality-of-earnings", "buffett"],
    },
    {
      slug: "quality-of-earnings",
      title: "Is the profit real? Quality of earnings",
      summary:
        "Accruals, working capital, the cash-conversion cycle — and Satyam, where ₹5,040 crore of reported cash did not exist.",
      minutes: 14,
      body: [
        {
          t: "p",
          text: "Reported profit is constructed. Accounting standards require companies to book revenue when it is earned, not when the cash arrives, and to spread costs over the periods they relate to. This accrual principle is sensible — it is what makes one year comparable with another — but it means every income statement contains a layer of estimates stacked on top of the cash facts. 'Quality of earnings' is the craft of measuring how thick that layer is.",
        },
        {
          t: "formula",
          expr: "net income = cash actually generated + accruals (estimates)",
          note: "The larger and more persistent the second term, the more the profit depends on management's judgement being right.",
        },
        { t: "h", text: "The first check: does profit become cash?" },
        {
          t: "p",
          text: "Set net income beside cash from operations for five years and read the pair. In an honest, steady business they track each other — cash sometimes ahead (customers pay in advance), sometimes behind (a growth year ties up cash in stock), but never divorced. Profit marching upward for years while operating cash flow stagnates is the single most reliable early warning in accounting: it means each year's earnings are increasingly made of receivables not yet collected, inventory not yet sold, or costs parked on the balance sheet.",
        },
        {
          t: "formula",
          expr: "cash conversion = free cash flow ÷ net income",
          note: "Sarmaya computes this per year in the ratios table. Persistently near or above 100% is what quality looks like.",
        },
        { t: "h", text: "Working capital: where profit hides" },
        {
          t: "p",
          text: "Three balance-sheet items convert the income statement's claims into testable day-counts:",
        },
        {
          t: "formula",
          expr: "receivable days (DSO) = trade receivables ÷ revenue × 365\ninventory days (DIO)  = inventory ÷ cost of goods sold × 365\npayable days (DPO)    = trade payables ÷ cost of goods sold × 365\n\ncash conversion cycle = DSO + DIO − DPO",
          note: "How many days a rupee is trapped between paying suppliers and collecting from customers.",
        },
        {
          t: "p",
          text: "The levels vary by industry and mean little alone; the trends are the signal. Receivable days climbing from 60 to 95 while revenue 'grows' means the growth is being bought by lending to customers — sales booked, cash absent. Inventory days climbing means production has outrun demand; a write-down is being stored for later. A negative cash-conversion cycle — collecting before paying — is a structural gift: See's sold chocolate for cash and paid suppliers on terms, one reason it needed almost no capital to grow. Some retailers and platform businesses run their whole expansion on this float.",
        },
        { t: "h", text: "The classic flattery techniques" },
        {
          t: "ul",
          items: [
            "Booking revenue early — recognising long contracts up front, stuffing distributor channels in March so the year ends well, or booking sales to entities the promoter controls.",
            "Capitalising operating costs — moving today's expense onto the balance sheet as an 'asset' to be depreciated later. Development costs and 'brand building' are the usual vehicles.",
            "Stretching asset lives — lower annual depreciation, higher profit, no change in reality.",
            "One-offs that recur — 'exceptional' losses every single year, while gains are always core.",
            "Round-tripping through related parties — sales and loans circulating through group companies until nobody can see the real perimeter. The related-party note in the annual report is where this is disclosed, which is why it is worth reading last and slowly.",
          ],
        },
        { t: "h", text: "Satyam, 2009: the confession as a textbook" },
        {
          t: "p",
          text: "On 7 January 2009, B. Ramalinga Raju, chairman of Satyam Computer Services — then India's fourth-largest IT company, listed in Mumbai and New York, audited by a Big Four firm — sent a letter to his board. It remains the most instructive document in Indian market history, because it states exactly which numbers were false and by how much.",
        },
        {
          t: "table",
          caption:
            "From Raju's letter to the Satyam board, 7 January 2009 (filed with the SEC). Q2 FY2009 and balance sheet as at 30 September 2008.",
          head: ["Figure", "In the books", "Actual"],
          rows: [
            ["Quarterly revenue", "₹2,700 crore", "₹2,112 crore"],
            [
              "Quarterly operating profit",
              "₹649 crore (24% margin)",
              "₹61 crore (3% margin)",
            ],
            [
              "Cash and bank balances",
              "₹5,361 crore",
              "₹321 crore — ₹5,040 crore did not exist",
            ],
            ["Trade debtors", "₹2,651 crore", "₹2,161 crore"],
          ],
        },
        {
          t: "p",
          text: "The letter also disclosed ₹376 crore of accrued interest that did not exist and ₹1,230 crore of liabilities kept off the books. The mechanics matter: inflated revenue produced inflated profit, and since the cash from those fictitious sales never arrived, the gap was parked as fictitious cash and fictitious accrued interest. Raju described the spiral in one sentence: 'It was like riding a tiger, not knowing how to get off without being eaten.'",
        },
        {
          t: "p",
          text: "What could an outside reader have seen? The fraud's own structure points at the checks. Satyam claimed margins near the best in the industry while spending like a company earning a fraction of that — the confession says the real margin was 3%, not 24%. And it claimed over ₹5,000 crore of cash while that cash earned conspicuously little interest income — fictitious deposits pay no interest. Profit that never becomes interest-bearing cash, margins implausibly ahead of identical competitors, and a promoter stake that had been sliding for years: every thread was in the public filings. Nobody could have proven fraud from outside — but 'the numbers do not cohere, so I will pass' was available to anyone doing the arithmetic.",
        },
        {
          t: "note",
          kind: "key",
          title: "You are not trying to catch frauds",
          text: "The odds of unmasking a determined fraud from published accounts are poor — Satyam fooled auditors for years. The realistic goal is different: notice that the numbers do not cohere and stay away. You never need to know why the cash yields nothing; 'I cannot explain it' is reason enough. There is no penalty in investing for walking away from a puzzle.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "The ratios table computes cash conversion per year, and the statements view puts CFO beside net income across every year on record. When a figure smells wrong, annotate the cell — the habit of writing 'receivables grew 2× faster than sales, why?' against the exact number is the whole discipline in one gesture.",
        },
      ],
      next: ["what-numbers-hide", "ratios"],
    },
    {
      slug: "key-figures",
      title: "The figures on the front page",
      summary:
        "P/E, P/B, EPS, yields and market cap — what each one means and where each one lies to you.",
      minutes: 10,
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
        { t: "h", text: "The cyclical P/E trap" },
        {
          t: "p",
          text: "For a cyclical business, the P/E is at its most seductive exactly when it is most dangerous. Tata Steel earned ₹41,749 crore in FY2022, the top of a global steel cycle — against the prices of that year, the P/E looked like a bargain-counter number. Two years later the same company reported a loss of about ₹4,900 crore, and by FY2025 earned ₹3,174 crore. The 'cheap' multiple was dividing by peak earnings that were never going to persist. With cyclicals, the old discipline is to do the opposite of instinct: they are statistically cheapest at the peak and dearest in the trough. Graham's remedy still works — divide price by the average of the last seven to ten years of earnings, not the best one.",
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
        "The per-year figures computed from the statements, grouped the way a business is actually read — plus the DuPont decomposition.",
      minutes: 12,
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
        { t: "h", text: "DuPont: taking ROE apart" },
        {
          t: "formula",
          expr: "ROE = net margin × asset turnover × leverage\n    = (net income ÷ revenue) × (revenue ÷ assets) × (assets ÷ equity)",
          note: "The three terms multiply out so that revenue and assets cancel, leaving net income ÷ equity.",
        },
        {
          t: "p",
          text: "Two companies with the same 20% ROE can be opposite businesses. One earns it as a luxury brand: fat margins, slow asset turnover, no debt. Another earns it as a supermarket: wafer margins, furious turnover. A third earns it as a bank must: thin margins, slow turnover, and leverage doing almost all the work. The decomposition tells you which machine you own — and which term to watch. Margin-driven ROE erodes through competition; turnover-driven ROE erodes through overexpansion; leverage-driven ROE does not erode, it detonates.",
        },
        {
          t: "p",
          text: "The same logic explains why a high-ROIC business is only valuable if it can reinvest at that rate. A company earning 25% on capital that can deploy new capital at 25% compounds; one that earns 25% but has nowhere to put the profits is a bond wearing a P/E. See's Candies was the second kind — the genius was sending its cash to a parent that had somewhere better to put it. When you read a great ratio, the follow-up question is always: at what rate does the next rupee reinvest?",
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
            {
              term: "Interest cover",
              def: "Operating income ÷ finance cost. How many times operations pay the interest bill. Compute it from the statement lines; the question is what happens to it in the business's worst plausible year.",
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
      next: ["studying-a-company", "no-single-value"],
    },
    {
      slug: "what-numbers-hide",
      title: "What the numbers cannot tell you",
      summary:
        "The questions no ratio answers — management, moats, disruption — and how to work on them anyway.",
      minutes: 8,
      body: [
        {
          t: "p",
          text: "The previous articles were about making the numbers confess. This one is about their limits. The things that most determine a decade of returns are usually absent from the accounts: whether management is honest and competent, whether the competitive advantage is durable, whether the industry is being quietly disrupted, whether regulation is about to change, and whether the culture retains good people. Numbers are the part that is easy to measure — which is not the same as the part that matters most.",
        },
        { t: "h", text: "Reading management from public record" },
        {
          t: "ul",
          items: [
            "Capital allocation history — the most objective window into management. Over ten years, what did they do with the profits? Dividends and buybacks at sensible prices, reinvestment that held its return on capital, or acquisitions at any price to grow the empire? The record is all in past annual reports.",
            "Do they say the same thing to everyone? Compare this year's chairman's letter with the one from three years ago — were the promises kept, and are the misses acknowledged or quietly reworded?",
            "Related-party dealings — business flowing to entities the promoters also own is the single most common way Indian and Pakistani minority shareholders are quietly diluted. The related-party note names names.",
            "Promoter pledging and stake sales — a promoter borrowing against shares, or steadily selling them, is expressing a view about the company more honestly than any interview.",
            "Remuneration versus performance — pay that rises through loss years tells you whose company it is.",
          ],
        },
        { t: "h", text: "Questions the statements cannot reach" },
        {
          t: "ul",
          items: [
            "Would customers care if this company disappeared tomorrow — and who would they switch to?",
            "What is the one input, customer or regulation this business cannot survive losing?",
            "Is the product getting better or merely cheaper? A company competing only on price has already told you its margin's future.",
            "Who is the smartest competitor, and what are they doing about this company's margin?",
            "If the founder left, what exactly walks out of the building?",
          ],
        },
        {
          t: "p",
          text: "These are researchable — annual reports of competitors, dealer and store visits, product reviews, employee chatter — just not computable. The article on studying a company turns them into a process; the Philip Fisher article covers scuttlebutt, the original method for answering them.",
        },
        {
          t: "note",
          kind: "watch",
          text: "None of the warning signs in this section or the last prove wrongdoing. Each is a reason to read further before committing money, and a reason to write down what you found. If you cannot explain a number to yourself, that is information in itself.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "This is what cell annotations and the thesis are for. Click any figure in a statement and attach a note to that exact number and year. Two years later, when the figure looks strange again, your own explanation is attached to it.",
        },
      ],
      next: ["studying-a-company", "why-write-a-thesis"],
    },
    {
      slug: "studying-a-company",
      title: "A repeatable way to study a company",
      summary:
        "A ten-step process from 'what does it sell' to a written thesis — the same order every time, so nothing gets skipped.",
      minutes: 14,
      body: [
        {
          t: "p",
          text: "Studying companies rewards routine more than brilliance. A fixed order does two things: it stops the exciting parts (the story, the price chart) from crowding out the boring parts (the debt schedule, the related-party note), and it makes your judgements comparable across companies because each one faced the same questions. What follows is one sensible order — adapt it, but have one.",
        },
        { t: "h", text: "The ten steps" },
        {
          t: "ol",
          items: [
            "Say what it sells, to whom, in one paragraph. If you cannot, stop — everything after this depends on it. The annual report's opening sections and management discussion exist for exactly this.",
            "Ten-year numbers, first pass. Revenue, operating margin, net profit, ROIC, debt, cash conversion — as trends, not points. You are sorting the company into a shape: steady compounder, cyclical, turnaround, decliner. The shape decides which tools apply.",
            "Income statement, line by line, common-size. Find the biggest cost line and its decade-long drift. Reconstruct operating profit if the format buries it. Strip other income out of your view of the operation.",
            "Quality check. CFO beside net income for every year on record; receivable and inventory days; effective tax rate; the basic-versus-diluted EPS gap. Anything that does not cohere gets an annotation and, if unexplained, ends the study.",
            "Balance sheet stress. Net debt, interest cover in the worst recent year, debt maturities, contingent liabilities note. The question is always the same: what happens to this company in a bad two years?",
            "The moat hypothesis. Why does the margin exist, and what evidence would show it eroding? Name the mechanism — brand, switching cost, network, cost, licence — or admit there is none, which is also an answer.",
            "Management and capital allocation. Ten years of what they did with the money, related parties, pledging, pay. Judge the record, not the interviews.",
            "The valuation range. All four models, your assumptions, seeded from history and edited by you. Then reverse DCF: what growth does today's price already assume, and has the company ever grown at that rate?",
            "Write the thesis — including the kill criteria. Three sentences of why, and the specific observable facts that would prove you wrong. A thesis without kill criteria is a mood.",
            "Size it and journal it. How much of the portfolio this idea deserves is a separate decision from whether the idea is good — position sizing has its own article. The journal entry records why, at what price, on what date.",
          ],
        },
        { t: "h", text: "Scuttlebutt: research beyond the filings" },
        {
          t: "p",
          text: "Philip Fisher's 'scuttlebutt' method — described fully in his own article in the Masters section — is the disciplined use of everyone who deals with the company: customers, suppliers, competitors, former employees. Most of it is available to a retail investor in South Asia at zero cost. Visit the stores and count footfall. Ask a dealer which brand moves and which sits. Read app reviews and complaint forums for the product. Read the competitor's annual report — the most honest description of a company's weaknesses is usually written by its rival's strategy section. Ask someone in the industry what they would buy from, work for, or bet against.",
        },
        {
          t: "quote",
          text: "It is remarkable how much long-term advantage people like us have gotten by trying to be consistently not stupid, instead of trying to be very intelligent.",
          who: "Charlie Munger",
        },
        { t: "h", text: "Invert the study before you finish" },
        {
          t: "p",
          text: "Munger's favourite tool, borrowed from the mathematician Jacobi: invert. Before finishing, spend thirty minutes arguing the other side as if paid to. Write the strongest case that this company disappoints over five years — the competitor move, the regulation, the input cost, the succession problem. If you cannot write a credible negative case, you have not studied it; if the negative case is stronger than yours, the study just paid for itself. This 'pre-mortem' becomes the kill-criteria section of the thesis almost verbatim.",
        },
        { t: "h", text: "Reading an annual report without drowning" },
        {
          t: "p",
          text: "A South Asian annual report can run past three hundred pages, most of it boilerplate. A working order: the auditor's opinion first (thirty seconds — is it clean, are there qualifications or 'emphasis of matter' paragraphs?), then the three statements, then the notes on revenue, debt, contingent liabilities and related parties, then management's discussion — read last, so the numbers frame the story rather than the story framing the numbers. The chairman's letter is best read against the previous years' letters, promises against outcomes.",
        },
        {
          t: "note",
          kind: "key",
          title: "Most studies end in 'no'",
          text: "A process that approves everything is a rubber stamp. Most companies studied carefully turn out to be ordinary businesses, or good businesses at prices assuming perfection — and 'no' costs nothing. The study is still banked: you now know the company, and prices change.",
        },
        {
          t: "note",
          kind: "example",
          title: "In Sarmaya",
          text: "The instrument page is laid out in this order — statements, ratios, then valuation — and the thesis form asks for your reasoning and rules, not a score. Steps that need the world (scuttlebutt, annual reports) happen away from the app; their conclusions come back as annotations and the written thesis.",
        },
      ],
      next: ["why-the-masters", "no-single-value"],
    },
  ],
};
