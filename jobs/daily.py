"""Daily job: snapshots + prices for tracked instruments (CLAUDE.md batch
discipline: shuffle, sleep 1.5s, per-instrument isolation, quarantine at 3,
idempotent upserts, job_runs row, operator webhook on failure).

Markets covered here: IN + US (+ indices) via the adapter facade. Funds
(AMFI bulk) are a separate section added in Phase 5; PSX in Phase 8.

Usage: python daily.py [--date YYYY-MM-DD]
Env: DATABASE_URL required; THESIS-style THROTTLE via SARMAYA_SLEEP (default 1.5);
     SARMAYA_PROVIDER=fake for offline tests; APP_BASE_URL+CRON_SECRET enable
     alert evaluation (Phase 7).
"""

from __future__ import annotations

import argparse
import datetime as dt
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
            delay = 2**attempt
            common.log(f"attempt {attempt} failed, retrying in {delay}s")
            time.sleep(delay)
    raise RuntimeError("unreachable")


def upsert_snapshot(conn, instrument_id: str, as_of: str, data: dict, source: str) -> None:
    conn.execute(
        """
        INSERT INTO snapshots (instrument_id, as_of, data, source)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (instrument_id, as_of)
        DO UPDATE SET data = excluded.data, source = excluded.source,
                      fetched_at = now()
        """,
        (instrument_id, as_of, json.dumps(data), source),
    )


def upsert_prices(conn, instrument_id: str, prices: list[dict]) -> int:
    if not prices:
        return 0
    # One batched statement — 5y backfill is ~1250 rows; row-by-row round
    # trips over the pooler would take minutes.
    with conn.cursor() as cur:
        cur.executemany(
            """
            INSERT INTO price_history (instrument_id, price_date, close)
            VALUES (%s, %s, %s)
            ON CONFLICT (instrument_id, price_date)
            DO UPDATE SET close = excluded.close
            """,
            [(instrument_id, p["date"], p["close"]) for p in prices],
        )
    return len(prices)


def price_backfill_period(conn, instrument_id: str) -> str:
    row = conn.execute(
        "SELECT count(*) FROM price_history WHERE instrument_id = %s",
        (instrument_id,),
    ).fetchone()
    # First sight of an instrument backfills 5y; steady state tops up a week.
    return "5y" if (row and row[0] == 0) else "7d"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=dt.date.today().isoformat())
    args = parser.parse_args()

    with common.connect() as conn:
        job_id = common.start_job(conn, "daily")
        instruments = common.tracked_instruments(
            conn, kinds=("stock", "index"), markets=("IN", "US")
        )
        random.shuffle(instruments)
        common.log(f"{len(instruments)} tracked instruments in rotation")

        ok = fail = 0
        for inst in instruments:
            try:
                if inst["kind"] == "stock":
                    raw = with_backoff(providers.get_raw_snapshot, inst["symbol"], inst["market"])
                    data = providers.normalize_snapshot(raw)
                    upsert_snapshot(conn, inst["id"], args.date, data, providers.source(inst["market"]))
                prices = with_backoff(
                    providers.get_price_history,
                    inst["symbol"],
                    inst["market"],
                    price_backfill_period(conn, inst["id"]),
                )
                upsert_prices(conn, inst["id"], prices)
                common.record_success(conn, inst["id"])
                ok += 1
                common.log(f"{inst['symbol']}: ok")
            except Exception as e:
                fail += 1
                common.log(f"{inst['symbol']}: FAILED — {e}")
                common.record_failure(conn, inst["id"], inst["symbol"])
            time.sleep(SLEEP)

        common.finish_job(conn, job_id, ok, fail, {"date": args.date})
        common.log(f"daily fetch done: ok={ok} fail={fail}")

    cron_failed = False
    try:
        result = common.call_cron("daily", args.date)
        common.log(f"alert evaluation: {json.dumps(result)}")
    except Exception as e:
        cron_failed = True
        common.log(f"alert evaluation FAILED: {e}")

    if (ok == 0 and fail > 0) or cron_failed:
        common.notify_operator(
            {"job": "daily", "date": args.date, "ok": ok, "fail": fail,
             "cron_failed": cron_failed}
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
