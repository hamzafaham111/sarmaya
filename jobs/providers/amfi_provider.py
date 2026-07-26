"""AMFI adapter (India mutual funds).

The bulk NAV file (NAVAll.txt) covers EVERY scheme in one download — fetch
once per run and filter to tracked scheme codes; never loop per-fund
endpoints (CLAUDE.md batch discipline).

File format quirks (see fixture): semicolon-delimited rows
    Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
interleaved with blank lines, scheme-type headers ("Open Ended Schemes(...)")
and fund-house name lines. NAV can be "N.A."; dates are DD-MMM-YYYY.

CLI:
    python amfi_provider.py --record-fixture amfi_sample   # save a live slice
    python amfi_provider.py --codes 119551,120503           # parse + filter
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import urllib.request
from pathlib import Path

SOURCE = "amfi"
# portal. host is the reliable one; www. times out from some networks.
NAV_ALL_URLS = (
    "https://portal.amfiindia.com/spages/NAVAll.txt",
    "https://www.amfiindia.com/spages/NAVAll.txt",
)
FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"

_MONTHS = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
}


def fetch_bulk() -> str:
    last_error: Exception | None = None
    for url in NAV_ALL_URLS:
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "sarmaya-daily/1.0"}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except Exception as e:  # try the next mirror
            last_error = e
    raise RuntimeError(f"all AMFI hosts failed: {last_error}")


def _parse_date(raw: str) -> str | None:
    """DD-MMM-YYYY -> ISO date, None when malformed."""
    parts = raw.strip().split("-")
    if len(parts) != 3:
        return None
    day, mon, year = parts
    month = _MONTHS.get(mon[:3].title())
    if month is None:
        return None
    try:
        return dt.date(int(year), month, int(day)).isoformat()
    except ValueError:
        return None


def parse_bulk(text: str) -> dict[str, dict]:
    """Bulk file -> {scheme_code: {nav, nav_date, name, fund_house, category}}.

    Defensive by design: malformed rows are skipped, never fatal.
    """
    out: dict[str, dict] = {}
    category = None
    fund_house = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("Scheme Code"):
            continue  # column header
        if ";" not in line:
            # Section lines: scheme-type headers contain "Schemes";
            # everything else is a fund-house name.
            if "Schemes" in line and "(" in line:
                category = line
            else:
                fund_house = line
            continue

        fields = line.split(";")
        if len(fields) != 6:
            continue
        code, _isin1, _isin2, name, nav_raw, date_raw = (
            f.strip() for f in fields
        )
        if not code.isdigit():
            continue
        try:
            nav = float(nav_raw)
        except ValueError:
            continue  # "N.A." and friends
        nav_date = _parse_date(date_raw)
        if nav_date is None or nav <= 0:
            continue
        out[code] = {
            "nav": nav,
            "nav_date": nav_date,
            "name": name,
            "fund_house": fund_house,
            "category": category,
        }
    return out


def filter_tracked(parsed: dict[str, dict], codes: list[str]) -> dict[str, dict]:
    return {c: parsed[c] for c in codes if c in parsed}


def fetch_scheme_history(code: str) -> list[dict]:
    """Full NAV history for ONE scheme via mfapi.in — used only as a
    one-time backfill when a fund is first tracked; the daily bulk file
    keeps it fresh thereafter (never loop this in the daily path)."""
    req = urllib.request.Request(
        f"https://api.mfapi.in/mf/{code}",
        headers={"User-Agent": "sarmaya-backfill/1.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        payload = json.loads(resp.read())
    out = []
    for row in payload.get("data", []):
        # mfapi dates are DD-MM-YYYY (numeric month), unlike the bulk file.
        raw = str(row.get("date", ""))
        parts = raw.split("-")
        nav_date = None
        if len(parts) == 3 and all(p.isdigit() for p in parts):
            day, month, year = (int(p) for p in parts)
            try:
                nav_date = dt.date(year, month, day).isoformat()
            except ValueError:
                nav_date = None
        else:
            nav_date = _parse_date(raw)
        try:
            nav = float(row.get("nav", ""))
        except (TypeError, ValueError):
            continue
        if nav_date and nav > 0:
            out.append({"date": nav_date, "nav": nav})
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--record-fixture", metavar="NAME")
    parser.add_argument("--codes", default="")
    args = parser.parse_args()

    text = fetch_bulk()

    if args.record_fixture:
        # Keep a representative slice: enough sections to exercise every quirk.
        lines = text.splitlines()
        slice_text = "\n".join(lines[:400])
        FIXTURES_DIR.mkdir(exist_ok=True)
        path = FIXTURES_DIR / f"{args.record_fixture}.txt"
        path.write_text(slice_text)
        print(f"recorded {path} ({len(lines)} total lines in live file)", file=sys.stderr)

    parsed = parse_bulk(text)
    codes = [c.strip() for c in args.codes.split(",") if c.strip()]
    result = filter_tracked(parsed, codes) if codes else {}
    print(
        json.dumps(
            {"total_schemes": len(parsed), "tracked": result}, indent=2
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
