"""Shared plumbing for the scheduled jobs: DB access, quarantine discipline,
job_runs bookkeeping, operator notification. No provider concepts here."""

from __future__ import annotations

import json
import os
import urllib.request

import psycopg

QUARANTINE_AFTER = 3  # consecutive failed days => status 'fetch_failing'


def log(msg: str) -> None:
    print(f"[job] {msg}", flush=True)


def connect() -> psycopg.Connection:
    return psycopg.connect(os.environ["DATABASE_URL"], autocommit=True)


def tracked_instruments(
    conn: psycopg.Connection, kinds: tuple[str, ...], markets: tuple[str, ...]
) -> list[dict]:
    """Only instruments someone actually tracks — never the whole market.

    Hand-kept instruments (is_manual) are excluded: no provider covers them,
    so a fetch attempt would only quarantine them as fetch_failing.
    """
    rows = conn.execute(
        """
        SELECT i.id, i.kind, i.symbol, i.market, i.currency
        FROM instruments i
        WHERE i.status = 'active'
          AND NOT i.is_manual
          AND i.kind = ANY(%s) AND i.market = ANY(%s)
          AND EXISTS (
            SELECT 1 FROM user_instruments ui WHERE ui.instrument_id = i.id
          )
        """,
        (list(kinds), list(markets)),
    ).fetchall()
    return [
        {"id": str(r[0]), "kind": r[1], "symbol": r[2], "market": r[3], "currency": r[4]}
        for r in rows
    ]


def start_job(conn: psycopg.Connection, job: str) -> str:
    row = conn.execute(
        "INSERT INTO job_runs (job, started_at) VALUES (%s, now()) RETURNING id",
        (job,),
    ).fetchone()
    return str(row[0])


def finish_job(
    conn: psycopg.Connection, job_id: str, ok: int, fail: int, detail: dict
) -> None:
    conn.execute(
        """
        UPDATE job_runs
        SET finished_at = now(), ok_count = %s, fail_count = %s, detail = %s
        WHERE id = %s
        """,
        (ok, fail, json.dumps(detail), job_id),
    )


def record_success(conn: psycopg.Connection, instrument_id: str) -> None:
    conn.execute(
        "UPDATE instruments SET consecutive_failures = 0 WHERE id = %s",
        (instrument_id,),
    )


def record_failure(conn: psycopg.Connection, instrument_id: str, symbol: str) -> None:
    row = conn.execute(
        """
        UPDATE instruments
        SET consecutive_failures = consecutive_failures + 1
        WHERE id = %s RETURNING consecutive_failures
        """,
        (instrument_id,),
    ).fetchone()
    failures = row[0] if row else 0
    if failures >= QUARANTINE_AFTER:
        conn.execute(
            "UPDATE instruments SET status = 'fetch_failing' WHERE id = %s",
            (instrument_id,),
        )
        log(f"{symbol}: {failures} consecutive failures — QUARANTINED")


def notify_operator(payload: dict) -> None:
    url = os.environ.get("ALERT_WEBHOOK_URL")
    if not url:
        log("ALERT_WEBHOOK_URL not set — cannot notify operator")
        return
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=30)
        log("operator notified")
    except Exception as e:  # best effort
        log(f"operator webhook failed: {e}")


def call_cron(task: str, date: str) -> dict:
    """Hand off to the app's alert evaluation (single TS engine — Phase 7)."""
    base = os.environ.get("APP_BASE_URL")
    secret = os.environ.get("CRON_SECRET")
    if not base or not secret:
        log("APP_BASE_URL/CRON_SECRET not set — skipping alert evaluation")
        return {"skipped": True}
    req = urllib.request.Request(
        f"{base.rstrip('/')}/api/cron",
        data=json.dumps({"task": task, "date": date}).encode(),
        headers={
            "Authorization": f"Bearer {secret}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())
