"""Runs trading_ml's existing pipeline end-to-end and returns today's live
picks.

Every step below is one of trading_ml's own scripts, run unmodified inside
its own virtualenv, in the order trading_ml/README.md documents:

    extract_data -> fundamentals -> edgar_fundamentals -> process_data ->
    random_forest -> predict

This file only sequences subprocess calls and reads their output. It never
edits, patches, or imports trading_ml's Python modules into this process.
Meant to run once per trading day, after 4pm ET, triggered by the first
visitor to the live demo page that day.
"""

import json
import subprocess
import time
from pathlib import Path

from config import TRADING_ML_ROOT, TRADING_ML_SOURCE, TRADING_ML_MODELS, TRADING_ML_PYTHON

BRIDGE_SCRIPT = Path(__file__).resolve().parent / "predict_bridge.py"

DATA_STEPS = [
    "extract_data.py",
    "fundamentals.py",
    "edgar_fundamentals.py",
    "process_data.py",
]

TRAIN_STEP = "random_forest.py"


def run_script(script_name):
    print(f"\n{'=' * 60}\n{script_name}\n{'=' * 60}", flush=True)
    start = time.time()

    result = subprocess.run(
        [str(TRADING_ML_PYTHON), str(TRADING_ML_SOURCE / script_name)],
        cwd=TRADING_ML_ROOT,
    )

    elapsed = time.time() - start
    if result.returncode != 0:
        raise RuntimeError(
            f"{script_name} failed (exit {result.returncode}) after {elapsed:.0f}s"
        )

    print(f"✓ {script_name} completed in {elapsed:.0f}s", flush=True)
    return elapsed


def train_and_get_run_name():
    """Runs random_forest.py and returns the run directory it just created.

    trading_ml doesn't expose the new run's name anywhere outside the
    process that trained it, so this diffs models/ before and after --
    the one new "*_walkforward_*" directory is today's run. Purely a
    filesystem read; nothing is written into trading_ml beyond what
    random_forest.py already writes itself.
    """
    before = {p.name for p in TRADING_ML_MODELS.glob("*_walkforward_*")}
    run_script(TRAIN_STEP)
    after = {p.name for p in TRADING_ML_MODELS.glob("*_walkforward_*")}

    new_runs = after - before
    if len(new_runs) != 1:
        raise RuntimeError(
            "expected exactly one new walk-forward run directory after "
            f"training, found {sorted(new_runs)}"
        )

    return new_runs.pop()


def get_todays_picks(run_name):
    result = subprocess.run(
        [str(TRADING_ML_PYTHON), str(BRIDGE_SCRIPT), run_name],
        cwd=TRADING_ML_ROOT,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(f"predict_bridge.py failed:\n{result.stderr}")

    return json.loads(result.stdout)


def run_live_pipeline():
    start = time.time()

    for script in DATA_STEPS:
        run_script(script)

    run_name = train_and_get_run_name()
    picks = get_todays_picks(run_name)

    elapsed = time.time() - start
    print(f"\n✓ Live pipeline completed in {elapsed:.0f}s ({elapsed / 60:.1f}m)")

    return picks


if __name__ == "__main__":
    result = run_live_pipeline()
    print(json.dumps(result, indent=2))
