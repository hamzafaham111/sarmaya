"""Deterministic fake provider for offline tests and pipeline demos.
Activated with SARMAYA_PROVIDER=fake. Known symbols resolve to recorded
fixtures; FAILX.NS always raises; anything else returns empties."""

from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"

SYMBOL_FIXTURES = {
    "RELIANCE.NS": "in_large_cap_reliance.json",
    "HDFCBANK.NS": "in_bank_hdfc.json",
    "AAPL": "us_large_cap_aapl.json",
}


def _load(symbol: str) -> dict:
    name = SYMBOL_FIXTURES.get(symbol.upper())
    if name is None:
        return {"snapshot": {}, "statements": {}}
    fx = json.loads((FIXTURES_DIR / name).read_text())
    overrides = json.loads(os.environ.get("SARMAYA_FAKE_OVERRIDES", "{}"))
    fx["snapshot"].update(overrides.get(symbol.upper(), {}))
    return fx


def fetch_raw_snapshot(symbol: str) -> dict:
    if symbol.upper() == "FAILX.NS":
        raise RuntimeError("FAILX.NS always fails (seeded bad symbol)")
    return _load(symbol)["snapshot"]


def fetch_raw_statements(symbol: str) -> dict:
    if symbol.upper() == "FAILX.NS":
        raise RuntimeError("FAILX.NS always fails (seeded bad symbol)")
    return _load(symbol)["statements"]


def fetch_price_history(symbol: str, period: str = "5y") -> list[dict]:
    if symbol.upper() == "FAILX.NS":
        raise RuntimeError("FAILX.NS always fails (seeded bad symbol)")
    days = 30 if period != "5y" else 400
    base = dt.date.today() - dt.timedelta(days=days)
    # Deterministic gentle ramp — enough for chart/returns plumbing.
    return [
        {
            "date": (base + dt.timedelta(days=i)).isoformat(),
            "close": 100.0 + i * 0.5,
        }
        for i in range(days)
        if (base + dt.timedelta(days=i)).weekday() < 5
    ]
