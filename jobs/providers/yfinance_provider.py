"""yfinance adapter (IN + US stocks, indices).

Maps raw provider fields into the normalized vocabulary — the ONLY keys the
rest of the system knows. Shape-validates before returning; every metric is
nullable; missing years are never fabricated (CLAUDE.md #7).

CLI:
    python yfinance_provider.py --symbol RELIANCE.NS            # snapshot + statement years
    python yfinance_provider.py --symbol RELIANCE.NS --record-fixture in_large_cap
    python yfinance_provider.py --symbol ^NSEI --prices 1y      # price history sample
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import numbers
import sys
from pathlib import Path

SOURCE = "yfinance"
FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"

SNAPSHOT_KEYS = [
    "price", "currency", "market_cap", "pe", "pb", "eps_ttm", "revenue_ttm",
    "revenue_growth_yoy", "gross_margin", "op_margin", "net_margin", "fcf_ttm",
    "debt_to_equity", "roe", "roic", "shares_outstanding", "dividend_yield",
    "book_value_per_share",
]

# snapshot key -> candidate provider fields (first non-null wins)
_SNAPSHOT_MAP = {
    "price": ("currentPrice", "regularMarketPrice"),
    "market_cap": ("marketCap",),
    "pe": ("trailingPE",),
    "pb": ("priceToBook",),
    "eps_ttm": ("trailingEps",),
    "revenue_ttm": ("totalRevenue",),
    "revenue_growth_yoy": ("revenueGrowth",),
    "gross_margin": ("grossMargins",),
    "op_margin": ("operatingMargins",),
    "net_margin": ("profitMargins",),
    "fcf_ttm": ("freeCashflow",),
    "debt_to_equity": ("debtToEquity",),  # provider reports PERCENT -> ratio
    "roe": ("returnOnEquity",),
    "roic": (),  # not provided; computed from statements at read time
    "shares_outstanding": ("sharesOutstanding",),
    "dividend_yield": ("dividendYield",),  # provider reports PERCENT -> ratio
    "book_value_per_share": ("bookValue",),
}

# normalized statement line item -> candidate row labels in provider frames
_INCOME_MAP = {
    "revenue": ("Total Revenue",),
    "gross_profit": ("Gross Profit",),
    "operating_income": ("Operating Income", "EBIT"),
    "net_income": ("Net Income",),
    "eps": ("Basic EPS", "Diluted EPS"),
}
_BALANCE_MAP = {
    "total_assets": ("Total Assets",),
    "total_equity": (
        "Stockholders Equity",
        "Total Equity Gross Minority Interest",
    ),
    "total_debt": ("Total Debt",),
    "cash": (
        "Cash And Cash Equivalents",
        "Cash Cash Equivalents And Short Term Investments",
    ),
    "shares_outstanding": ("Ordinary Shares Number", "Share Issued"),
}
_CASHFLOW_MAP = {
    "cfo": ("Operating Cash Flow",),
    "capex": ("Capital Expenditure",),
    "fcf": ("Free Cash Flow",),
    "dividends_paid": ("Cash Dividends Paid", "Common Stock Dividend Paid"),
}


def _as_number(value: object) -> float | None:
    if isinstance(value, bool) or not isinstance(value, numbers.Real):
        return None
    value = float(value)
    if value != value:  # NaN
        return None
    return value


def normalize_snapshot(raw: dict) -> dict:
    """Raw info dict -> normalized snapshot. Never raises on missing fields."""
    if not isinstance(raw, dict):
        raise TypeError(f"raw snapshot must be a dict, got {type(raw)}")

    out: dict[str, object] = {}
    for key, fields in _SNAPSHOT_MAP.items():
        value = None
        for field in fields:
            value = _as_number(raw.get(field))
            if value is not None:
                break
        if key in ("debt_to_equity", "dividend_yield") and value is not None:
            value = value / 100.0  # provider reports percent; we store ratios
        out[key] = value

    currency = raw.get("currency") or raw.get("financialCurrency")
    out["currency"] = currency if isinstance(currency, str) else None

    _validate_snapshot(out)
    return out


def _validate_snapshot(data: dict) -> None:
    if set(data.keys()) != set(SNAPSHOT_KEYS):
        raise ValueError(f"snapshot has wrong keys: {sorted(data.keys())}")
    for key, value in data.items():
        if key == "currency":
            if value is not None and not isinstance(value, str):
                raise ValueError(f"currency must be str|None, got {value!r}")
        elif value is not None and not isinstance(value, float):
            raise ValueError(f"{key} has non-numeric value {value!r}")


def normalize_statements(raw_frames: dict) -> list[dict]:
    """Raw {kind: {year: {label: value}}} -> normalized StatementYear list.

    `raw_frames` is the JSON-safe form we record as fixtures:
    {"income": {"2025": {"Total Revenue": ..., ...}, ...}, "balance": ..., "cashflow": ...}
    Years present in the source are kept; absent years are NOT invented.
    """
    maps = {"income": _INCOME_MAP, "balance": _BALANCE_MAP, "cashflow": _CASHFLOW_MAP}
    out: list[dict] = []
    for kind, mapping in maps.items():
        years = raw_frames.get(kind) or {}
        if not isinstance(years, dict):
            continue
        for year_str, row in years.items():
            try:
                year = int(year_str)
            except (TypeError, ValueError):
                continue
            if not isinstance(row, dict):
                continue
            data = {}
            for item, labels in mapping.items():
                value = None
                for label in labels:
                    value = _as_number(row.get(label))
                    if value is not None:
                        break
                data[item] = value
            if all(v is None for v in data.values()):
                continue  # a year with zero usable line items is noise
            out.append({"fiscal_year": year, "statement": kind, "data": data})
    out.sort(key=lambda s: (s["statement"], s["fiscal_year"]))
    return out


# ---------------------------------------------------------------- live fetch

def fetch_raw_snapshot(symbol: str) -> dict:
    import yfinance

    return dict(yfinance.Ticker(symbol).info)


def fetch_raw_statements(symbol: str) -> dict:
    """Provider statement frames -> the JSON-safe fixture shape."""
    import yfinance

    t = yfinance.Ticker(symbol)
    frames = {
        "income": t.income_stmt,
        "balance": t.balance_sheet,
        "cashflow": t.cashflow,
    }
    out: dict[str, dict] = {}
    for kind, frame in frames.items():
        years: dict[str, dict] = {}
        if frame is not None and hasattr(frame, "columns"):
            for col in frame.columns:
                year = getattr(col, "year", None)
                if year is None:
                    continue
                col_data = frame[col]
                years[str(year)] = {
                    str(label): (None if _is_nan(v) else float(v))
                    for label, v in col_data.items()
                    if isinstance(v, numbers.Real) or v is None
                }
        out[kind] = years
    return out


def _is_nan(v: object) -> bool:
    return isinstance(v, float) and v != v


def fetch_price_history(symbol: str, period: str = "5y") -> list[dict]:
    """Daily closes -> [{date, close}] (floats; DB stores numeric)."""
    import yfinance

    frame = yfinance.Ticker(symbol).history(period=period, interval="1d")
    out = []
    for ts, row in frame.iterrows():
        close = _as_number(row.get("Close"))
        if close is None:
            continue
        out.append({"date": ts.date().isoformat(), "close": close})
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--record-fixture", metavar="NAME")
    parser.add_argument("--prices", metavar="PERIOD")
    args = parser.parse_args()

    if args.prices:
        prices = fetch_price_history(args.symbol, args.prices)
        print(json.dumps({"symbol": args.symbol, "days": len(prices), "tail": prices[-3:]}, indent=2))
        return 0

    raw_snapshot = fetch_raw_snapshot(args.symbol)
    raw_statements = fetch_raw_statements(args.symbol)

    if args.record_fixture:
        FIXTURES_DIR.mkdir(exist_ok=True)
        path = FIXTURES_DIR / f"{args.record_fixture}.json"
        path.write_text(
            json.dumps(
                {"snapshot": raw_snapshot, "statements": raw_statements},
                indent=2,
                sort_keys=True,
                default=str,
            )
        )
        print(f"recorded {path}", file=sys.stderr)

    print(
        json.dumps(
            {
                "symbol": args.symbol,
                "as_of": dt.date.today().isoformat(),
                "source": SOURCE,
                "snapshot": normalize_snapshot(raw_snapshot),
                "statement_years": normalize_statements(raw_statements),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
