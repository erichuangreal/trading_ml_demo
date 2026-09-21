"""Read-only bridge into trading_ml's predict.py.

Run as trading_ml's own venv python with cwd set to the trading_ml repo
root (orchestrator.py does both), so predict.py's relative paths
(MODELS_PATH = Path("models"), etc.) resolve exactly as they do when a
person runs `python source/predict.py` by hand.

This only imports predict.py and calls its existing todays_picks()
function with its existing run_name parameter. It does not modify, patch,
or monkeypatch anything in trading_ml -- the only reason this file can't
just live inside trading_ml/source is that todays_picks() alone prints
nothing and returns a DataFrame, and turning that into JSON is this
adapter's job, not trading_ml's.

Usage:
    <trading_ml venv python> predict_bridge.py <run_name>

Prints exactly one JSON object to stdout and nothing else, so
orchestrator.py can parse it directly.
"""

import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) != 2:
        print("usage: predict_bridge.py <run_name>", file=sys.stderr)
        sys.exit(2)

    run_name = sys.argv[1]

    # predict.py does `from features import FEATURES` etc., which only
    # resolves when source/ is importable -- true when it's run directly
    # (python source/predict.py) since Python puts the script's own
    # directory on sys.path[0]. Reproduce that here since this file lives
    # outside trading_ml/source.
    sys.path.insert(0, str(Path.cwd() / "source"))

    from predict import todays_picks, CAPITAL

    as_of, exposure, run_dir, top = todays_picks(run_name=run_name)

    invested = float(top["dollars"].sum())

    payload = {
        "as_of": as_of.date().isoformat(),
        "run_name": run_dir.name,
        "exposure": round(float(exposure), 4),
        "invested": round(invested, 2),
        "cash": round(CAPITAL - invested, 2),
        "picks": [
            {
                "ticker": row.ticker,
                "score": round(float(row.pred), 4),
                "volatility_20d": round(float(row.volatility_20d), 4),
                "weight_pct": round(float(row.weight) * 100, 2),
                "dollars": round(float(row.dollars), 2),
            }
            for row in top.itertuples()
        ],
    }

    print(json.dumps(payload))


if __name__ == "__main__":
    main()
