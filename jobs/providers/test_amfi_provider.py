"""AMFI parser tests against the recorded fixture — the file format is
quirky, so the fixture is the contract."""

from pathlib import Path

from providers.amfi_provider import filter_tracked, parse_bulk

FIXTURE = (Path(__file__).parent.parent / "fixtures" / "amfi_sample.txt").read_text()


def test_fixture_parses_schemes_with_metadata() -> None:
    parsed = parse_bulk(FIXTURE)
    assert len(parsed) > 200
    scheme = parsed["119551"]
    assert scheme["nav"] > 0
    assert scheme["nav_date"].startswith("20")
    assert "Aditya Birla" in scheme["fund_house"]
    assert scheme["category"].startswith("Open Ended Schemes")


def test_headers_and_blank_lines_are_skipped() -> None:
    parsed = parse_bulk(FIXTURE)
    # No fund-house or category line ever becomes a scheme.
    assert all(code.isdigit() for code in parsed)


def test_malformed_rows_never_crash() -> None:
    junk = "\n".join(
        [
            "Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date",
            "Some Fund House",
            "Open Ended Schemes(Equity)",
            "123456;INF1;INF2;Broken NAV Fund;N.A.;24-Jul-2026",  # N.A. NAV
            "123457;INF1;INF2;Broken Date Fund;10.5;garbage-date",  # bad date
            "123458;INF1;Too;Few;Fields",  # wrong field count
            "not-a-code;INF1;INF2;Alpha Code Fund;10.5;24-Jul-2026",  # bad code
            "123459;INF1;INF2;Zero NAV Fund;0;24-Jul-2026",  # non-positive
            "123460;INF1;INF2;Good Fund;25.1234;24-Jul-2026",  # the one keeper
        ]
    )
    parsed = parse_bulk(junk)
    assert list(parsed.keys()) == ["123460"]
    assert parsed["123460"]["nav"] == 25.1234
    assert parsed["123460"]["nav_date"] == "2026-07-24"


def test_filter_tracked_only_returns_known_codes() -> None:
    parsed = parse_bulk(FIXTURE)
    filtered = filter_tracked(parsed, ["119551", "000000"])
    assert set(filtered.keys()) == {"119551"}


def test_bulk_is_fetched_once_regardless_of_tracked_count(monkeypatch) -> None:
    """The daily job's fund section must hit AMFI exactly once (call-count
    assertion per PLAN.md Phase 5)."""
    import daily

    calls = {"n": 0}

    def fake_bulk() -> str:
        calls["n"] += 1
        return FIXTURE

    monkeypatch.setattr("providers.amfi_provider.fetch_bulk", fake_bulk)

    tracked = [
        {"id": f"id-{i}", "symbol": code, "kind": "fund", "market": "IN"}
        for i, code in enumerate(["119551", "119552", "119553", "108272"])
    ]
    written: list[tuple] = []

    class FakeConn:
        def execute(self, *_args, **_kwargs):
            written.append(_args)
            return self

        def fetchone(self):
            return None

        def cursor(self):
            raise AssertionError("fund section should not need a cursor")

    daily.update_funds(FakeConn(), tracked)
    assert calls["n"] == 1  # ONE bulk fetch for four tracked funds
    assert len(written) >= 4  # a nav upsert per tracked fund
