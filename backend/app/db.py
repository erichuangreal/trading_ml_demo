"""SQLite-backed state for the Live Demo: today's run lock, its live
per-stage progress, and the public audit log.

This is the only state the Live Demo backend keeps. trading_ml is never
used as a database and is never written to beyond what its own scripts
already write (raw/processed data, a new models/ run directory).
"""

import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "live_demo.db"

STAGE_KEYS = [
    "extract_data",
    "fundamentals",
    "edgar_fundamentals",
    "process_data",
    "random_forest",
    "predict",
]


def connect():
    con = sqlite3.connect(DB_PATH, timeout=30)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    con = connect()
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trading_day TEXT NOT NULL UNIQUE,
            triggered_at_et TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'running',
            current_stage TEXT,
            stage_states TEXT NOT NULL,
            result_json TEXT,
            error_stage TEXT,
            error_message TEXT
        )
        """
    )
    con.commit()
    con.close()


def create_run(trading_day, triggered_at_et):
    """Atomically claims today's slot.

    The UNIQUE constraint on trading_day is the actual lock: if two
    requests race to trigger the same day, only one INSERT succeeds. Returns
    the new run id, or None if a run for this trading_day already exists.
    """
    con = connect()
    try:
        stage_states = json.dumps({key: "pending" for key in STAGE_KEYS})
        cur = con.execute(
            "INSERT INTO runs (trading_day, triggered_at_et, status, stage_states) "
            "VALUES (?, ?, 'running', ?)",
            (trading_day, triggered_at_et, stage_states),
        )
        con.commit()
        return cur.lastrowid
    except sqlite3.IntegrityError:
        return None
    finally:
        con.close()


def get_run_by_day(trading_day):
    con = connect()
    row = con.execute(
        "SELECT * FROM runs WHERE trading_day = ?", (trading_day,)
    ).fetchone()
    con.close()
    return dict(row) if row else None


def set_stage(run_id, stage_key, state):
    con = connect()
    row = con.execute(
        "SELECT stage_states FROM runs WHERE id = ?", (run_id,)
    ).fetchone()
    stages = json.loads(row["stage_states"])
    stages[stage_key] = state
    current_stage = stage_key if state == "running" else None
    con.execute(
        "UPDATE runs SET stage_states = ?, current_stage = ? WHERE id = ?",
        (json.dumps(stages), current_stage, run_id),
    )
    con.commit()
    con.close()


def complete_run(run_id, result):
    con = connect()
    con.execute(
        "UPDATE runs SET status = 'done', current_stage = NULL, result_json = ? "
        "WHERE id = ?",
        (json.dumps(result), run_id),
    )
    con.commit()
    con.close()


def fail_run(run_id, stage_key, message):
    con = connect()
    con.execute(
        "UPDATE runs SET status = 'error', current_stage = NULL, error_stage = ?, "
        "error_message = ? WHERE id = ?",
        (stage_key, message, run_id),
    )
    con.commit()
    con.close()


def list_audit_log(limit=100):
    con = connect()
    rows = con.execute(
        "SELECT * FROM runs ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    con.close()
    return [dict(row) for row in rows]
