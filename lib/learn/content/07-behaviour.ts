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
          text: "These are well-documented patterns in how people decide under uncertainty. Reading about them does not make you immune — the research is fairly clear that awareness alone changes little. What helps is having a written process that does not require you to be rational in the moment.",
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
  ],
};
