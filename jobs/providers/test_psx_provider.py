"""PSX parser tests — scrape-defensive by mandate; the fixtures are the
contract, including the broken one (graceful empty, never a crash)."""

import json
from pathlib import Path

import pytest

from providers.psx_provider import fetch_raw_snapshot, parse_eod

FIXTURES = Path(__file__).parent.parent / "fixtures"


def test_live_fixture_parses_oldest_first() -> None:
    raw = json.loads((FIXTURES / "psx_eod_ogdc.json").read_text())
    prices = parse_eod(raw)
    assert len(prices) > 20
    assert all(p["close"] > 0 for p in prices)
    dates = [p["date"] for p in prices]
    assert dates == sorted(dates)  # oldest-first


def test_broken_portal_response_degrades_gracefully() -> None:
    raw = json.loads((FIXTURES / "psx_broken.json").read_text())
    assert parse_eod(raw) == []


@pytest.mark.parametrize(
    "junk",
    [
        None,
        "html error page",
        {"status": 1},  # no data key
        {"status": 1, "data": "not-a-list"},
        {"status": 1, "data": [[True, 10], ["x"], [1784890800, -5], [1784890800, "NaN"]]},
        {"status": 1, "data": [[10**18, 10]]},  # timestamp overflow
    ],
)
def test_malformed_payloads_never_crash(junk) -> None:
    assert parse_eod(junk) == []


def test_snapshot_raises_cleanly_when_no_data(monkeypatch) -> None:
    monkeypatch.setattr(
        "providers.psx_provider._fetch_eod_raw", lambda s: {"status": 0}
    )
    with pytest.raises(RuntimeError, match="no usable data"):
        fetch_raw_snapshot("OGDC")
