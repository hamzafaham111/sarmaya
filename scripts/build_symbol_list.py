"""Dev-time script: build the static NSE symbol list shipped in-repo
(PLAN.md Phase 2 — no external search API at runtime). Source: Wikipedia's
NIFTY 500 constituents table. Usage: python scripts/build_symbol_list.py"""

import json
import urllib.request
from io import StringIO
from pathlib import Path

import pandas as pd

URL = "https://en.wikipedia.org/wiki/NIFTY_500"
OUT = Path(__file__).parent.parent / "lib" / "symbols-nse.json"


def main() -> int:
    req = urllib.request.Request(URL, headers={"User-Agent": "sarmaya-dev/1.0"})
    html = urllib.request.urlopen(req).read().decode("utf-8")
    for table in pd.read_html(StringIO(html)):
        if len(table) < 300:
            continue
        # The constituents table parses headerless: row 0 carries the labels.
        header = [str(v).strip().lower() for v in table.iloc[0]]
        if "symbol" not in header or "company name" not in header:
            continue
        sym = header.index("symbol")
        name = header.index("company name")
        entries = sorted(
            {
                str(r.iloc[sym]).strip().upper(): str(r.iloc[name]).strip()
                for _, r in table.iloc[1:].iterrows()
                if str(r.iloc[sym]).strip()
            }.items()
        )
        if True:
            OUT.write_text(
                json.dumps([{"s": s, "n": n} for s, n in entries], ensure_ascii=False)
                + "\n"
            )
            print(f"wrote {len(entries)} symbols -> {OUT}")
            return 0
    raise SystemExit("no constituents table found")


if __name__ == "__main__":
    raise SystemExit(main())
