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
    # ONE round trip via unnest — 5y backfill is ~1250 rows and the pooler
    # is far away.
    conn.execute(
        """
        INSERT INTO price_history (instrument_id, price_date, close)
        SELECT %s, unnest(%s::date[]), unnest(%s::numeric[])
        ON CONFLICT (instrument_id, price_date)
        DO UPDATE SET close = excluded.close
        """,
        (
            instrument_id,
            [p["date"] for p in prices],
            [str(p["close"]) for p in prices],
        ),
    )
    return len(prices)


def price_backfill_period(conn, instrument_id: str) -> str:
    row = conn.execute(
        "SELECT count(*) FROM price_history WHERE instrument_id = %s",
        (instrument_id,),
    ).fetchone()
    # First sight of an instrument backfills 5y; steady state tops up a week.
    return "5y" if (row and row[0] == 0) else "7d"


def update_funds(conn, funds: list[dict]) -> tuple[int, int]:
    """India mutual funds: ONE bulk AMFI fetch regardless of fund count,
    filtered to tracked scheme codes. First-sight funds get a one-time
    history backfill from the per-scheme API."""
    from providers import amfi_provider

    if not funds:
        return (0, 0)
    parsed = amfi_provider.parse_bulk(amfi_provider.fetch_bulk())

    ok = fail = 0
    for f in funds:
        scheme = parsed.get(f["symbol"])
        if scheme is None:
            fail += 1
            common.log(f"fund {f['symbol']}: not in AMFI bulk file")
            common.record_failure(conn, f["id"], f["symbol"])
            continue

        row = conn.execute(
            "SELECT count(*) FROM nav_history WHERE instrument_id = %s",
            (f["id"],),
        ).fetchone()
        if row is not None and row[0] == 0:
            try:
                history = with_backoff(
                    amfi_provider.fetch_scheme_history, f["symbol"]
                )
                if history:
                    # ONE round trip via unnest — a decade of NAVs is ~3k
                    # rows and the pooler is far away.
                    conn.execute(
                        """
                        INSERT INTO nav_history (instrument_id, nav_date, nav)
                        SELECT %s, unnest(%s::date[]), unnest(%s::numeric[])
                        ON CONFLICT (instrument_id, nav_date) DO NOTHING
                        """,
                        (
                            f["id"],
                            [h["date"] for h in history],
                            [str(h["nav"]) for h in history],
                        ),
                    )
                common.log(f"fund {f['symbol']}: backfilled {len(history)} NAVs")
            except Exception as e:  # backfill is best-effort
                common.log(f"fund {f['symbol']}: backfill failed — {e}")

        conn.execute(
            """
            INSERT INTO nav_history (instrument_id, nav_date, nav)
            VALUES (%s, %s, %s)
            ON CONFLICT (instrument_id, nav_date) DO UPDATE SET nav = excluded.nav
            """,
            (f["id"], scheme["nav_date"], scheme["nav"]),
        )
        conn.execute(
            """
            INSERT INTO snapshots (instrument_id, as_of, data, source)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (instrument_id, as_of)
            DO UPDATE SET data = excluded.data, source = excluded.source,
                          fetched_at = now()
            """,
            (
                f["id"],
                scheme["nav_date"],
                json.dumps(
                    {
                        "nav": scheme["nav"],
                        "nav_date": scheme["nav_date"],
                        "scheme_category": scheme["category"],
                        "fund_house": scheme["fund_house"],
                    }
                ),
                amfi_provider.SOURCE,
            ),
        )
        common.record_success(conn, f["id"])
        ok += 1
    return (ok, fail)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=dt.date.today().isoformat())
    args = parser.parse_args()

    with common.connect() as conn:
        job_id = common.start_job(conn, "daily")
        instruments = common.tracked_instruments(
            conn, kinds=("stock", "index"), markets=("IN", "US", "PK")
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

        funds = common.tracked_instruments(conn, kinds=("fund",), markets=("IN",))
        try:
            fund_ok, fund_fail = update_funds(conn, funds)
        except Exception as e:  # bulk fetch itself failed — every fund fails
            common.log(f"AMFI bulk fetch FAILED — {e}")
            fund_ok, fund_fail = 0, len(funds)
        ok += fund_ok
        fail += fund_fail

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
