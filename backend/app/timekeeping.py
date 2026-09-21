"""Eastern-time helpers and the stage label copy shown on the Live Demo page.

Trading-day detection here is a weekday check only. It does not know US
market holidays (Thanksgiving, July 4th, etc.) -- a real market calendar
(e.g. pandas_market_calendars) should replace is_trading_day before this
ships. Documented limitation, not a silent gap: a holiday will currently be
treated as an open trading day and a trigger attempt will run the real
pipeline against a closed market (extract_data.py will just find no new
bar, which is a harmless no-op, not a crash).
"""

from datetime import datetime
from zoneinfo import ZoneInfo

EASTERN = ZoneInfo("America/New_York")

# No new run before this hour ET -- today's bar hasn't closed yet, so
# predict.py would be scoring an unfinished session.
TRIGGER_HOUR_ET = 16

STAGES = [
    ("extract_data", "Fetching prices (yfinance)"),
    ("fundamentals", "Fetching fundamentals"),
    ("edgar_fundamentals", "Fetching SEC filings (EDGAR)"),
    ("process_data", "Processing data"),
    ("random_forest", "Retraining (45-fold walk-forward)"),
    ("predict", "Ranking today's picks"),
]

STAGE_SCRIPTS = {
    "extract_data": "extract_data.py",
    "fundamentals": "fundamentals.py",
    "edgar_fundamentals": "edgar_fundamentals.py",
    "process_data": "process_data.py",
}


def now_et():
    return datetime.now(EASTERN)


def today_et_date():
    return now_et().date().isoformat()


def is_weekday(dt):
    return dt.weekday() < 5


def market_closed(dt):
    return dt.hour >= TRIGGER_HOUR_ET


def is_trading_day(dt=None):
    dt = dt or now_et()
    return is_weekday(dt)
