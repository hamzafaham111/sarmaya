"""Dev-time script: build the static fund search list shipped in-repo from
the AMFI bulk file — open-ended DIRECT + GROWTH plans only (regular/IDCW
variants are noise for a research terminal).
Usage: python scripts/build_fund_list.py [path-to-NAVAll.txt]"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "jobs"))
from providers.amfi_provider import fetch_bulk, parse_bulk  # noqa: E402

OUT = Path(__file__).parent.parent / "lib" / "symbols-funds.json"


def main() -> int:
    text = Path(sys.argv[1]).read_text() if len(sys.argv) > 1 else fetch_bulk()
    parsed = parse_bulk(text)
    entries = []
    for code, s in parsed.items():
        upper = s["name"].upper()
        if "DIRECT" not in upper or "GROWTH" not in upper:
            continue
        if not (s["category"] or "").startswith("Open Ended"):
            continue
        entries.append({"c": code, "n": s["name"].strip()})
    entries.sort(key=lambda e: e["n"])
    OUT.write_text(json.dumps(entries, ensure_ascii=False) + "\n")
    print(f"wrote {len(entries)} direct-growth schemes -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
