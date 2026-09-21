"""Runs today's live pipeline stage by stage, updating db state as it goes,
so /status can show real per-stage progress instead of one opaque
pending/done flag.

Every stage here is one of trading_ml's own unmodified scripts, run through
pipeline.orchestrator's existing, already-verified functions. This file adds
no new logic against trading_ml itself; it only sequences and observes.
Runs in a background thread started by POST /run in main.py.
"""

import sys
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "pipeline"))

import orchestrator  # noqa: E402  (backend/pipeline/orchestrator.py)

import db
from timekeeping import STAGES, STAGE_SCRIPTS


def run_pipeline_job(run_id):
    run_name = None

    for stage_key, _label in STAGES:
        if stage_key == "predict":
            continue  # needs run_name from the random_forest stage below

        db.set_stage(run_id, stage_key, "running")
        try:
            if stage_key == "random_forest":
                run_name = orchestrator.train_and_get_run_name()
            else:
                orchestrator.run_script(STAGE_SCRIPTS[stage_key])
        except Exception as error:
            db.set_stage(run_id, stage_key, "error")
            db.fail_run(run_id, stage_key, f"{error}\n{traceback.format_exc()}")
            return

        db.set_stage(run_id, stage_key, "done")

    db.set_stage(run_id, "predict", "running")
    try:
        picks = orchestrator.get_todays_picks(run_name)
    except Exception as error:
        db.set_stage(run_id, "predict", "error")
        db.fail_run(run_id, "predict", f"{error}\n{traceback.format_exc()}")
        return

    db.set_stage(run_id, "predict", "done")
    db.complete_run(run_id, picks)
