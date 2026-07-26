"""Provider normalization tests against recorded fixtures (CLAUDE.md testing
policy). When the provider breaks in prod: record the new raw response as a
fixture FIRST, then fix normalization until these pass.
"""

import json
import math
from pathlib import Path

import pytest

from providers.yfinance_provider import (
    SNAPSHOT_KEYS,
    normalize_snapshot,
    normalize_statements,
)

FIXTURES = sorted(
    p
    for p in (Path(__file__).parent.parent / "fixtures").glob("*.json")
    if not p.stem.startswith(("psx_", "amfi_"))  # other adapters own those
)


def load(path: Path) -> dict:
    return json.loads(path.read_text())


@pytest.mark.parametrize("path", FIXTURES, ids=lambda p: p.stem)
def test_every_fixture_normalizes_to_exact_vocabulary(path: Path) -> None:
    fx = load(path)
    snap = normalize_snapshot(fx["snapshot"])
    assert set(snap.keys()) == set(SNAPSHOT_KEYS)
    for key, value in snap.items():
        if key == "currency":
            assert value is None or isinstance(value, str)
        else:
            assert value is None or (
                isinstance(value, float) and not math.isnan(value)
            ), f"{key}={value!r}"


@pytest.mark.parametrize("path", FIXTURES, ids=lambda p: p.stem)
def test_every_fixture_statements_normalize_without_crash(path: Path) -> None:
    fx = load(path)
    years = normalize_statements(fx["statements"])
    for y in years:
        assert isinstance(y["fiscal_year"], int)
        assert y["statement"] in ("income", "balance", "cashflow")
        assert all(v is None or isinstance(v, float) for v in y["data"].values())


def test_fixture_coverage_per_plan() -> None:
    names = {p.stem for p in FIXTURES}
    assert {
        "in_large_cap_reliance",
        "in_bank_hdfc",
        "us_large_cap_aapl",
        "broken_missing_fields",
    } <= names


def test_reliance_reference_values() -> None:
    fx = load(Path(__file__).parent.parent / "fixtures" / "in_large_cap_reliance.json")
    snap = normalize_snapshot(fx["snapshot"])
    assert snap["currency"] == "INR"
    assert snap["price"] is not None and snap["price"] > 0
    years = normalize_statements(fx["statements"])
    assert len(years) >= 6  # ≥ 2 years × 3 statements accumulated
    income_years = [y for y in years if y["statement"] == "income"]
    assert all(y["data"]["revenue"] is not None for y in income_years)


def test_bank_missing_metrics_stay_null() -> None:
    fx = load(Path(__file__).parent.parent / "fixtures" / "in_bank_hdfc.json")
    snap = normalize_snapshot(fx["snapshot"])
    assert snap["currency"] == "INR"
    # banks: revenue/gross margin semantics differ — whatever is absent stays null
    assert snap["price"] is not None


def test_broken_fixture_all_nulls_no_crash() -> None:
    fx = load(Path(__file__).parent.parent / "fixtures" / "broken_missing_fields.json")
    snap = normalize_snapshot(fx["snapshot"])
    assert snap["currency"] is None  # non-string currency rejected
    assert all(v is None for k, v in snap.items() if k != "currency")
    years = normalize_statements(fx["statements"])
    assert years == []  # bogus years and corrupted frames yield nothing


def test_percent_fields_become_ratios() -> None:
    snap = normalize_snapshot({"debtToEquity": 36.65, "dividendYield": 0.47})
    assert snap["debt_to_equity"] == pytest.approx(0.3665)
    assert snap["dividend_yield"] == pytest.approx(0.0047)


def test_non_dict_raises() -> None:
    with pytest.raises(TypeError):
        normalize_snapshot(["nope"])
