"""PSX adapter (Pakistan stocks) against the PSX data portal.

Scrape-defensive by mandate (CLAUDE.md): every response is validated row by
row; anything malformed degrades to "data unavailable" — never a crash that
kills the run. v1 coverage is PRICES ONLY; statements aren't reliably
parseable from the portal, so stock pages show honest gaps for PK.

CLI:
    python psx_provider.py --symbol OGDC [--record-fixture psx_eod_ogdc]
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import urllib.request
from pathlib import Path

SOURCE = "psx-dps"
EOD_URL = "https://dps.psx.com.pk/timeseries/eod/"
FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"


def _fetch_eod_raw(symbol: str) -> dict:
    req = urllib.request.Request(
        f"{EOD_URL}{symbol.upper()}",
        headers={"User-Agent": "Mozilla/5.0 (sarmaya-daily)"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def parse_eod(raw: object) -> list[dict]:
    """Portal EOD payload -> [{date, close}] oldest-first.

    Payload shape: {"status": 1, "data": [[unix_ts, close, volume, ...], ...]}
    newest-first. Defensive: bad status, bad rows, bad values are skipped or
    yield an empty list — never an exception.
    """
    if not isinstance(raw, dict) or raw.get("status") != 1:
        return []
    data = raw.get("data")
    if not isinstance(data, list):
        return []
    out = []
    for row in data:
        if not isinstance(row, list) or len(row) < 2:
            continue
        ts, close = row[0], row[1]
        if isinstance(ts, bool) or not isinstance(ts, (int, float)):
            continue
        if isinstance(close, bool) or not isinstance(close, (int, float)):
            continue
        if close <= 0:
            continue
        try:
            date = dt.datetime.fromtimestamp(int(ts), dt.timezone.utc).date().isoformat()
        except (ValueError, OSError, OverflowError):
            continue
        out.append({"date": date, "close": float(close)})
    out.reverse()  # oldest-first, matching the other adapters
    return out


def fetch_price_history(symbol: str, period: str = "5y") -> list[dict]:
    prices = parse_eod(_fetch_eod_raw(symbol))
    if period != "5y" and prices:
        # steady-state top-up: the last ~10 rows cover a week comfortably
        return prices[-10:]
    return prices


def fetch_raw_snapshot(symbol: str) -> dict:
    """Minimal raw snapshot in the shared field convention: the facade's
    normalizer maps currentPrice/currency; everything else stays null."""
    prices = parse_eod(_fetch_eod_raw(symbol))
    if not prices:
        raise RuntimeError(f"PSX portal returned no usable data for {symbol}")
    return {"currentPrice": prices[-1]["close"], "currency": "PKR"}


def fetch_raw_statements(symbol: str) -> dict:
    """Statements are not reliably parseable from the portal — honest gap."""
    return {}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--record-fixture", metavar="NAME")
    args = parser.parse_args()

    raw = _fetch_eod_raw(args.symbol)
    if args.record_fixture:
        FIXTURES_DIR.mkdir(exist_ok=True)
        path = FIXTURES_DIR / f"{args.record_fixture}.json"
        # keep the fixture compact: first 30 rows exercise every code path
        slim = dict(raw)
        if isinstance(slim.get("data"), list):
            slim["data"] = slim["data"][:30]
        path.write_text(json.dumps(slim, indent=2))
        print(f"recorded {path}", file=sys.stderr)

    prices = parse_eod(raw)
    print(
        json.dumps(
            {
                "symbol": args.symbol.upper(),
                "days": len(prices),
                "latest": prices[-1] if prices else None,
                "snapshot": fetch_raw_snapshot(args.symbol),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
