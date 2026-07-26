"""Dev-time script: KSE-100 constituents from Wikipedia -> lib/symbols-psx.json.
Usage: python scripts/build_psx_list.py"""

import json
import urllib.request
from io import StringIO
from pathlib import Path

import pandas as pd

URL = "https://en.wikipedia.org/wiki/KSE_100_Index"
OUT = Path(__file__).parent.parent / "lib" / "symbols-psx.json"


def main() -> int:
    req = urllib.request.Request(URL, headers={"User-Agent": "sarmaya-dev/1.0"})
    html = urllib.request.urlopen(req).read().decode("utf-8")
    for table in pd.read_html(StringIO(html)):
        cols = {str(c).strip().lower(): c for c in table.columns}
        if "ticker" in cols and "company" in cols and len(table) > 50:
            entries = sorted(
                {
                    str(r[cols["ticker"]]).strip().upper(): str(
                        r[cols["company"]]
                    ).strip()
                    for _, r in table.iterrows()
                    if str(r[cols["ticker"]]).strip()
                }.items()
            )
            OUT.write_text(
                json.dumps([{"s": s, "n": n} for s, n in entries], ensure_ascii=False)
                + "\n"
            )
            print(f"wrote {len(entries)} PSX symbols -> {OUT}")
            return 0
    raise SystemExit("no constituents table found")


if __name__ == "__main__":
    raise SystemExit(main())
