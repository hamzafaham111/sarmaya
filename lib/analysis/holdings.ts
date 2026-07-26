import Big from "big.js";

// Holdings derived from journal entries (PLAN.md Phase 6). Average-cost
// method; SIPs are buys (units + NAV). Decimal-safe via big.js — money is
// never float-arithmetic'd (CLAUDE.md #4). Display only, no analytics.

export interface HoldingsEntry {
  kind: string; // 'buy' | 'sell' | 'sip' | 'note'
  tradeDate: string; // ISO date
  price: string | null; // numeric-as-string from the DB
  quantity: string | null;
}

export interface HoldingsSummary {
  netQuantity: string; // decimal string
  averageCost: string | null; // decimal string; null when nothing held
  costBasis: string; // decimal string (current position's basis)
}

const ACQUIRING = new Set(["buy", "sip"]);

export function computeHoldings(entries: HoldingsEntry[]): HoldingsSummary {
  const ordered = [...entries].sort((a, b) =>
    a.tradeDate.localeCompare(b.tradeDate),
  );

  let qty = new Big(0);
  let cost = new Big(0);

  for (const entry of ordered) {
    const acquiring = ACQUIRING.has(entry.kind);
    if (!acquiring && entry.kind !== "sell") continue;
    if (entry.quantity === null) continue;
    const q = new Big(entry.quantity);
    if (q.lte(0)) continue;

    if (acquiring) {
      if (entry.price === null) continue; // can't cost a priceless lot
      qty = qty.plus(q);
      cost = cost.plus(q.times(new Big(entry.price)));
    } else {
      if (qty.lte(0)) continue; // sell with nothing held: display-only, skip
      const sellQty = q.gt(qty) ? qty : q; // clamp to what's held
      const avg = cost.div(qty);
      qty = qty.minus(sellQty);
      cost = qty.eq(0) ? new Big(0) : cost.minus(sellQty.times(avg));
    }
  }

  return {
    netQuantity: qty.toString(),
    averageCost: qty.gt(0) ? cost.div(qty).round(4).toString() : null,
    costBasis: cost.round(2).toString(),
  };
}
