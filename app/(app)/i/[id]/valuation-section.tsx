"use client";

import { useMemo, useState, useTransition } from "react";

import { RangeBand } from "@/components/base/range-band";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dcf, type DcfAssumptions } from "@/lib/valuation/dcf";
import { epv, type EpvAssumptions } from "@/lib/valuation/epv";
import { graham, type GrahamAssumptions } from "@/lib/valuation/graham";
import {
  reverseDcf,
  type ReverseDcfAssumptions,
} from "@/lib/valuation/reverse_dcf";
import type { ValuationSeeds } from "@/lib/valuation/seed";
import { isApplicable, type ModelResult } from "@/lib/valuation/types";
import { formatMoney, type Currency, DASH } from "@/lib/format";

import { saveValuation } from "./valuation-actions";

// The valuation panel: multiple independent models side by side, every input
// user-overridable, results shown as YOUR estimate range — never a single
// blended "the value" (valuation doctrine).

const MODEL_INFO: Record<string, { title: string; body: string }> = {
  dcf: {
    title: "Discounted Cash Flow",
    body: "Projects free cash flow at your growth rate for N years, discounts each year back, adds a terminal value (multiple × final-year FCF). Honest weakness: tiny changes in growth or discount assumptions swing the output hugely — that's why it's one voice among four, not an answer.",
  },
  graham: {
    title: "Graham number",
    body: "√(22.5 × EPS × book value per share) — Benjamin Graham's conservative screen: at most 15× earnings and 1.5× book. Honest weakness: built for 1970s industrial balance sheets; punishes asset-light businesses badly.",
  },
  epv: {
    title: "Earnings Power Value",
    body: "Capitalizes current after-tax operating income at your discount rate, assuming ZERO growth, then adjusts for net debt. Honest weakness: ignores genuine growth entirely — treat it as the floor a no-growth world would justify.",
  },
  reverse_dcf: {
    title: "Reverse DCF",
    body: "Runs the DCF backwards: what FCF growth would justify today's price? Compare that against the company's actual history — the gap is the market's optimism you're being asked to underwrite.",
  },
};

function Num({
  label,
  value,
  onChange,
  step = 1,
  auto,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  auto: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-ink-muted">
        {label}
        {auto ? (
          <span className="ml-1 rounded-sm bg-brand-soft px-1 py-px text-[9px] text-brand">
            auto — edit me
          </span>
        ) : null}
      </span>
      <input
        type="number"
        step={step}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="font-numeric w-24 rounded-sm border border-line bg-background px-1.5 py-0.5 text-right text-xs text-ink tabular-nums focus:border-brand focus:outline-none"
      />
    </label>
  );
}

function ModelCard({
  name,
  result,
  currency,
  onSave,
  saving,
  dirty,
  hideSave = false,
  children,
}: {
  name: keyof typeof MODEL_INFO;
  result: ModelResult | null;
  currency: Currency;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  hideSave?: boolean;
  children: React.ReactNode;
}) {
  const info = MODEL_INFO[name];
  return (
    <div className="flex flex-col rounded-md border border-line bg-surface p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-medium tracking-wide text-ink uppercase">
          {info.title}
        </span>
        <Popover>
          <PopoverTrigger className="text-xs text-ink-muted underline decoration-dotted underline-offset-2">
            how it works
          </PopoverTrigger>
          <PopoverContent className="max-w-xs text-xs leading-relaxed">
            {info.body}
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-3 space-y-1.5">{children}</div>

      <div className="mt-auto flex items-center justify-between border-t border-line pt-2">
        <span className="font-numeric text-base text-ink tabular-nums">
          {result === null
            ? DASH
            : isApplicable(result)
              ? formatMoney(result.value, currency)
              : null}
        </span>
        {result !== null && !isApplicable(result) ? (
          <span className="text-xs text-ink-muted italic">
            not applicable — {result.notApplicable}
          </span>
        ) : null}
        {hideSave ? null : (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="rounded-sm bg-brand px-2 py-0.5 text-xs text-on-brand transition disabled:opacity-40"
          >
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ValuationSection({
  instrumentId,
  seeds,
  saved,
  price,
  currency,
}: {
  instrumentId: string;
  seeds: ValuationSeeds;
  saved: Partial<Record<string, Record<string, unknown>>>;
  price: number | null;
  currency: Currency;
}) {
  const [pending, startTransition] = useTransition();

  const [dcfA, setDcfA] = useState<DcfAssumptions>({
    startingFcf:
      (saved.dcf?.startingFcf as number) ?? seeds.dcf.startingFcf ?? Number.NaN,
    growthRatePct:
      (saved.dcf?.growthRatePct as number) ?? seeds.dcf.growthRatePct,
    years: (saved.dcf?.years as number) ?? seeds.dcf.years,
    discountRatePct:
      (saved.dcf?.discountRatePct as number) ?? seeds.dcf.discountRatePct,
    terminalMultiple:
      (saved.dcf?.terminalMultiple as number) ?? seeds.dcf.terminalMultiple,
    sharesOutstanding:
      (saved.dcf?.sharesOutstanding as number) ??
      seeds.dcf.sharesOutstanding ??
      Number.NaN,
  });
  const [grahamA, setGrahamA] = useState<GrahamAssumptions>({
    eps: (saved.graham?.eps as number) ?? seeds.graham.eps ?? Number.NaN,
    bookValuePerShare:
      (saved.graham?.bookValuePerShare as number) ??
      seeds.graham.bookValuePerShare ??
      Number.NaN,
  });
  const [epvA, setEpvA] = useState<EpvAssumptions>({
    normalizedOperatingIncome:
      (saved.epv?.normalizedOperatingIncome as number) ??
      seeds.epv.normalizedOperatingIncome ??
      Number.NaN,
    taxRatePct: (saved.epv?.taxRatePct as number) ?? seeds.epv.taxRatePct,
    discountRatePct:
      (saved.epv?.discountRatePct as number) ?? seeds.epv.discountRatePct,
    totalDebt:
      (saved.epv?.totalDebt as number) ?? seeds.epv.totalDebt ?? Number.NaN,
    cash: (saved.epv?.cash as number) ?? seeds.epv.cash ?? Number.NaN,
    sharesOutstanding:
      (saved.epv?.sharesOutstanding as number) ??
      seeds.epv.sharesOutstanding ??
      Number.NaN,
  });

  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const dcfResult = useMemo(() => dcf(dcfA), [dcfA]);
  const grahamResult = useMemo(() => graham(grahamA), [grahamA]);
  const epvResult = useMemo(() => epv(epvA), [epvA]);
  const reverseA: ReverseDcfAssumptions = useMemo(
    () => ({
      currentPrice: price ?? Number.NaN,
      startingFcf: dcfA.startingFcf,
      years: dcfA.years,
      discountRatePct: dcfA.discountRatePct,
      terminalMultiple: dcfA.terminalMultiple,
      sharesOutstanding: dcfA.sharesOutstanding,
    }),
    [price, dcfA],
  );
  const reverseResult = useMemo(() => reverseDcf(reverseA), [reverseA]);

  const applicable = [
    { name: "DCF", r: dcfResult },
    { name: "Graham", r: grahamResult },
    { name: "EPV", r: epvResult },
  ].filter((m) => isApplicable(m.r)) as {
    name: string;
    r: { value: number };
  }[];

  const low = applicable.length
    ? Math.min(...applicable.map((m) => m.r.value))
    : null;
  const high = applicable.length
    ? Math.max(...applicable.map((m) => m.r.value))
    : null;

  function save(model: string, assumptions: Record<string, unknown>) {
    startTransition(async () => {
      await saveValuation({ instrumentId, model, assumptions });
      setDirty((d) => ({ ...d, [model]: false }));
    });
  }

  const isAuto = (model: string, field: string) =>
    saved[model]?.[field] === undefined && !dirty[model];

  return (
    <section className="mt-10">
      <h2 className="font-display text-lg text-ink">Valuation — your models</h2>
      <p className="mt-1 mb-4 text-xs text-ink-muted">
        Four independent lenses, every input yours to override. There is no true
        formula; this range is your estimate, not a fact.
      </p>

      {low !== null && high !== null ? (
        <div className="mb-6 max-w-lg">
          <RangeBand
            low={low}
            high={high}
            marker={price}
            format={(n) => formatMoney(n, currency)}
            caption={`your estimate range · models: ${applicable.map((m) => m.name).join(" · ")}`}
          />
          {price !== null && low !== null && low > 0 ? (
            <p className="font-numeric mt-1 text-xs text-ink-muted tabular-nums">
              price is {((price / low) * 100).toFixed(0)}% of your estimate
              range low
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mb-6 rounded-md border border-dashed border-line bg-surface p-4 text-center text-xs text-ink-muted">
          No applicable models yet — fill in the inputs below and your estimate
          range will appear here.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ModelCard
          name="dcf"
          result={dcfResult}
          currency={currency}
          saving={pending}
          dirty={!!dirty.dcf}
          onSave={() => save("dcf", { ...dcfA })}
        >
          <Num
            label="Starting FCF"
            value={Number.isFinite(dcfA.startingFcf) ? dcfA.startingFcf : null}
            auto={isAuto("dcf", "startingFcf")}
            step={1000000}
            onChange={(v) => {
              setDcfA({ ...dcfA, startingFcf: v ?? Number.NaN });
              setDirty((d) => ({ ...d, dcf: true }));
            }}
          />
          <Num
            label="Growth %/yr"
            value={dcfA.growthRatePct}
            auto={isAuto("dcf", "growthRatePct")}
            step={0.5}
            onChange={(v) => {
              setDcfA({ ...dcfA, growthRatePct: v ?? 0 });
              setDirty((d) => ({ ...d, dcf: true }));
            }}
          />
          <Num
            label="Growth years"
            value={dcfA.years}
            auto={isAuto("dcf", "years")}
            onChange={(v) => {
              setDcfA({ ...dcfA, years: v ?? 10 });
              setDirty((d) => ({ ...d, dcf: true }));
            }}
          />
          <Num
            label="Discount %/yr"
            value={dcfA.discountRatePct}
            auto={isAuto("dcf", "discountRatePct")}
            step={0.5}
            onChange={(v) => {
              setDcfA({ ...dcfA, discountRatePct: v ?? 12 });
              setDirty((d) => ({ ...d, dcf: true }));
            }}
          />
          <Num
            label="Terminal multiple"
            value={dcfA.terminalMultiple}
            auto={isAuto("dcf", "terminalMultiple")}
            onChange={(v) => {
              setDcfA({ ...dcfA, terminalMultiple: v ?? 15 });
              setDirty((d) => ({ ...d, dcf: true }));
            }}
          />
          <Num
            label="Shares outstanding"
            value={
              Number.isFinite(dcfA.sharesOutstanding)
                ? dcfA.sharesOutstanding
                : null
            }
            auto={isAuto("dcf", "sharesOutstanding")}
            step={1000000}
            onChange={(v) => {
              setDcfA({ ...dcfA, sharesOutstanding: v ?? Number.NaN });
              setDirty((d) => ({ ...d, dcf: true }));
            }}
          />
        </ModelCard>

        <ModelCard
          name="graham"
          result={grahamResult}
          currency={currency}
          saving={pending}
          dirty={!!dirty.graham}
          onSave={() => save("graham", { ...grahamA })}
        >
          <Num
            label="EPS (ttm)"
            value={Number.isFinite(grahamA.eps) ? grahamA.eps : null}
            auto={isAuto("graham", "eps")}
            step={0.1}
            onChange={(v) => {
              setGrahamA({ ...grahamA, eps: v ?? Number.NaN });
              setDirty((d) => ({ ...d, graham: true }));
            }}
          />
          <Num
            label="Book value / share"
            value={
              Number.isFinite(grahamA.bookValuePerShare)
                ? grahamA.bookValuePerShare
                : null
            }
            auto={isAuto("graham", "bookValuePerShare")}
            step={0.1}
            onChange={(v) => {
              setGrahamA({ ...grahamA, bookValuePerShare: v ?? Number.NaN });
              setDirty((d) => ({ ...d, graham: true }));
            }}
          />
        </ModelCard>

        <ModelCard
          name="epv"
          result={epvResult}
          currency={currency}
          saving={pending}
          dirty={!!dirty.epv}
          onSave={() => save("epv", { ...epvA })}
        >
          <Num
            label="Normalized op. income"
            value={
              Number.isFinite(epvA.normalizedOperatingIncome)
                ? epvA.normalizedOperatingIncome
                : null
            }
            auto={isAuto("epv", "normalizedOperatingIncome")}
            step={1000000}
            onChange={(v) => {
              setEpvA({ ...epvA, normalizedOperatingIncome: v ?? Number.NaN });
              setDirty((d) => ({ ...d, epv: true }));
            }}
          />
          <Num
            label="Tax rate %"
            value={epvA.taxRatePct}
            auto={isAuto("epv", "taxRatePct")}
            onChange={(v) => {
              setEpvA({ ...epvA, taxRatePct: v ?? 25 });
              setDirty((d) => ({ ...d, epv: true }));
            }}
          />
          <Num
            label="Discount %/yr"
            value={epvA.discountRatePct}
            auto={isAuto("epv", "discountRatePct")}
            step={0.5}
            onChange={(v) => {
              setEpvA({ ...epvA, discountRatePct: v ?? 12 });
              setDirty((d) => ({ ...d, epv: true }));
            }}
          />
          <Num
            label="Total debt"
            value={Number.isFinite(epvA.totalDebt) ? epvA.totalDebt : null}
            auto={isAuto("epv", "totalDebt")}
            step={1000000}
            onChange={(v) => {
              setEpvA({ ...epvA, totalDebt: v ?? Number.NaN });
              setDirty((d) => ({ ...d, epv: true }));
            }}
          />
          <Num
            label="Cash"
            value={Number.isFinite(epvA.cash) ? epvA.cash : null}
            auto={isAuto("epv", "cash")}
            step={1000000}
            onChange={(v) => {
              setEpvA({ ...epvA, cash: v ?? Number.NaN });
              setDirty((d) => ({ ...d, epv: true }));
            }}
          />
        </ModelCard>

        <ModelCard
          name="reverse_dcf"
          result={"impliedGrowthPct" in reverseResult ? null : reverseResult}
          currency={currency}
          saving={pending}
          dirty={false}
          hideSave
          onSave={() => {}}
        >
          <p className="text-xs leading-relaxed text-ink-muted">
            Uses your DCF discount, years, terminal multiple and shares.
          </p>
          {"impliedGrowthPct" in reverseResult ? (
            <p className="font-numeric text-sm text-ink tabular-nums">
              price implies{" "}
              <span className="text-brand">
                {reverseResult.impliedGrowthPct}%/yr
              </span>{" "}
              FCF growth for {dcfA.years} years
              {seeds.historicalFcfCagrPct !== null ? (
                <>
                  {" "}
                  · actual history:{" "}
                  <span className="text-ink">
                    {seeds.historicalFcfCagrPct}%/yr
                  </span>
                </>
              ) : null}
            </p>
          ) : null}
        </ModelCard>
      </div>
    </section>
  );
}
