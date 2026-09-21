"""Locates the private trading_ml repo and its Python environment.

trading_ml_demo has no ML dependencies of its own -- every pipeline step runs
inside trading_ml's own virtualenv, as trading_ml's own unmodified scripts,
exactly as they'd run if a person typed the command by hand. Nothing under
backend/ imports trading_ml's code into this process, edits any of its
files, or writes into it except the files those scripts already write
themselves (raw/processed data, a new models/ run directory).
"""

from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DEMO_ROOT = BACKEND_ROOT.parent
TRADING_ML_ROOT = DEMO_ROOT.parent / "trading_ml"
TRADING_ML_SOURCE = TRADING_ML_ROOT / "source"
TRADING_ML_MODELS = TRADING_ML_ROOT / "models"
TRADING_ML_PYTHON = TRADING_ML_ROOT / ".venv" / "bin" / "python3"

if not TRADING_ML_ROOT.exists():
    raise RuntimeError(f"trading_ml not found at {TRADING_ML_ROOT}")
if not TRADING_ML_PYTHON.exists():
    raise RuntimeError(f"trading_ml's virtualenv not found at {TRADING_ML_PYTHON}")
