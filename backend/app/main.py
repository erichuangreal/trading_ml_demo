"""FastAPI wrapper around the Live Demo pipeline.

Owns exactly the state described in PRODUCT.md's Live Demo section: a
once-per-trading-day lock, live per-stage progress while a run is in
flight, and the public audit log. All genuine inference and retraining
happens in the private trading_ml repo via pipeline/orchestrator.py; this
file only exposes that as HTTP and tracks state around it.

Run with (from backend/app):
    uvicorn main:app --reload --port 8000
"""

import json
import threading

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import db
import runner
import timekeeping as tk

app = FastAPI(title="Live Demo API")

app.add_middleware(
    CORSMiddleware,
    # Tighten to the demo site's real origin before this goes to production.
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
)


@app.on_event("startup")
def startup():
    db.init_db()


def _stage_list(stage_states):
    return [
        {"key": key, "label": label, "state": stage_states.get(key, "pending")}
        for key, label in tk.STAGES
    ]


def _serialize_run(run):
    if run is None:
        return None

    stage_states = json.loads(run["stage_states"])
    result = json.loads(run["result_json"]) if run["result_json"] else None

    return {
        "status": run["status"],
        "trading_day": run["trading_day"],
        "triggered_at_et": run["triggered_at_et"],
        "current_stage": run["current_stage"],
        "stages": _stage_list(stage_states),
        "error": (
            {"stage": run["error_stage"], "message": run["error_message"]}
            if run["status"] == "error"
            else None
        ),
        "result": result,
    }


@app.get("/status")
def get_status():
    now = tk.now_et()
    today = tk.today_et_date()
    run = db.get_run_by_day(today)

    if run is not None:
        return {
            "date_et": today,
            "is_trading_day": tk.is_trading_day(now),
            "market_closed": tk.market_closed(now),
            "triggered_today": True,
            "run": _serialize_run(run),
            "latest_completed_run": None,
        }

    # No run for today yet (not triggered, weekend, or before 4pm ET) --
    # fall back to the latest completed run so the page always has real
    # data to show instead of a blank state.
    latest = db.list_audit_log(limit=1)
    fallback = _serialize_run(latest[0]) if latest else None

    return {
        "date_et": today,
        "is_trading_day": tk.is_trading_day(now),
        "market_closed": tk.market_closed(now),
        "triggered_today": False,
        "run": None,
        "latest_completed_run": fallback,
    }


@app.post("/run")
def trigger_run():
    now = tk.now_et()
    today = tk.today_et_date()

    if not tk.is_trading_day(now):
        raise HTTPException(
            409, "Not a trading day (weekend). US market holidays aren't modeled yet."
        )

    if not tk.market_closed(now):
        raise HTTPException(409, "Too early: today's bar closes at 4pm ET.")

    if db.get_run_by_day(today) is not None:
        raise HTTPException(409, "Today's run has already been triggered.")

    run_id = db.create_run(today, now.isoformat())
    if run_id is None:
        # Lost a race to another request between the check above and here.
        raise HTTPException(409, "Today's run has already been triggered.")

    thread = threading.Thread(
        target=runner.run_pipeline_job, args=(run_id,), daemon=True
    )
    thread.start()

    return {"started": True, "run_id": run_id}


@app.get("/audit-log")
def audit_log(limit: int = 100):
    entries = []

    for row in db.list_audit_log(limit=limit):
        result = json.loads(row["result_json"]) if row["result_json"] else None

        if row["status"] == "done" and result:
            summary = ", ".join(pick["ticker"] for pick in result["picks"])
        elif row["status"] == "error":
            summary = f"Error ({row['error_stage']})"
        else:
            summary = "In progress"

        entries.append(
            {
                "triggered_at_et": row["triggered_at_et"],
                "trading_day": row["trading_day"],
                "result": summary,
            }
        )

    return {"entries": entries}
