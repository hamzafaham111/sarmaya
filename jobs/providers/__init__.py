"""Adapter facade — the ONLY door jobs use to reach market data. Provider
names never escape this package (CLAUDE.md #3). Dispatch is by market;
SARMAYA_PROVIDER=fake reroutes everything to the deterministic fake."""

from __future__ import annotations

import os


def _impl(market: str):
    if os.environ.get("SARMAYA_PROVIDER") == "fake":
        from providers import fake_provider

        return fake_provider
    if market == "PK":
        from providers import psx_provider

        return psx_provider
    # IN + US (stocks & indices) share one adapter; AMFI (funds) has its own
    # bulk entry point in the daily job.
    from providers import yfinance_provider

    return yfinance_provider


def source(market: str) -> str:
    impl = _impl(market)
    return getattr(impl, "SOURCE", "fake")


def get_raw_snapshot(symbol: str, market: str) -> dict:
    return _impl(market).fetch_raw_snapshot(symbol)


def get_raw_statements(symbol: str, market: str) -> dict:
    return _impl(market).fetch_raw_statements(symbol)


def get_price_history(symbol: str, market: str, period: str) -> list[dict]:
    return _impl(market).fetch_price_history(symbol, period)


def normalize_snapshot(raw: dict) -> dict:
    from providers import yfinance_provider

    return yfinance_provider.normalize_snapshot(raw)


def normalize_statements(raw: dict) -> list[dict]:
    from providers import yfinance_provider

    return yfinance_provider.normalize_statements(raw)
