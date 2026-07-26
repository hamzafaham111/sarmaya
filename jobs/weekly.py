"""Weekly job: statements refresh (statements change quarterly — don't
hammer). Append-only: every year the source provides is upserted; existing
years are refreshed; absent years are never invented.

Usage: python weekly.py
"""

from __future__ import annotations

import json
import os
import random
import time

import common
import providers

SLEEP = float(os.environ.get("SARMAYA_SLEEP", "1.5"))
MAX_ATTEMPTS = 3




def with_backoff(fn, *args):
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            return fn(*args)
        except Exception:
            if attempt == MAX_ATTEMPTS:
                raise
            time.sleep(2**attempt)
    raise RuntimeError("unreachable")


def upsert_statement_years(conn, instrument_id: str, years: list[dict], source: str) -> int:
    n = 0
    for y in years:
        conn.execute(
            """
            INSERT INTO statements (instrument_id, fiscal_year, statement, data, source)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (instrument_id, fiscal_year, statement)
            DO UPDATE SET data = excluded.data, source = excluded.source,
                          fetched_at = now()
            """,
            (
                instrument_id,
                y["fiscal_year"],
                y["statement"],
                json.dumps(y["data"]),
                source,
            ),
        )
        n += 1
    return n


def main() -> int:
    with common.connect() as conn:
        job_id = common.start_job(conn, "weekly")
        instruments = common.tracked_instruments(
            conn, kinds=("stock",), markets=("IN", "US")
        )
        random.shuffle(instruments)
        common.log(f"{len(instruments)} tracked stocks for statements refresh")

        ok = fail = 0
        for inst in instruments:
            try:
                raw = with_backoff(providers.get_raw_statements, inst["symbol"], inst["market"])
                years = providers.normalize_statements(raw)
                count = upsert_statement_years(conn, inst["id"], years, providers.source(inst["market"]))
                common.record_success(conn, inst["id"])
                ok += 1
                common.log(f"{inst['symbol']}: {count} statement-years")
            except Exception as e:
                fail += 1
                common.log(f"{inst['symbol']}: FAILED — {e}")
                common.record_failure(conn, inst["id"], inst["symbol"])
            time.sleep(SLEEP)

        common.finish_job(conn, job_id, ok, fail, {})
        common.log(f"weekly statements done: ok={ok} fail={fail}")

    if ok == 0 and fail > 0:
        common.notify_operator({"job": "weekly", "ok": ok, "fail": fail})
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
