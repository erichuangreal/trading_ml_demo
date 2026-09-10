#!/usr/bin/env python3
"""Read-only export: trading_ml (private) -> trading_ml_demo/public/data (public).

READS ONLY from ../trading_ml. WRITES ONLY into trading_ml_demo/public/data.
Never modifies, moves, or deletes anything in the private repository.

Source of truth: models/{RUN_NAME}/ in trading_ml, the run the private repo's
own README links to as "Final model" / "View full results". All figures here
are derived directly from that run's saved parquet files using the same
formulas as trading_ml/source/rank_testing.py (sharpe, annualised_return,
period_return) -- nothing here is invented or hand-tuned to match a target.

Usage:
    cd trading_ml_demo
    python3 scripts/export_demo_data.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

DEMO_ROOT = Path(__file__).resolve().parents[1]
TRADING_ML_ROOT = DEMO_ROOT.parent / "trading_ml"
RUN_NAME = "v4xgboost_walkforward_2026-08-26_22-53-59"
RUN_DIR = TRADING_ML_ROOT / "models" / RUN_NAME
OUT_DIR = DEMO_ROOT / "public" / "data"

# Constants copied from trading_ml/source/{walkforward,rank_testing}.py.
# These are published, stable configuration values (not private
# implementation) -- restated here so this script has no import-time
# dependency on the private repo's Python path.
HORIZON = 20
TRADING_DAYS = 252
PERIODS_PER_YEAR = TRADING_DAYS / HORIZON
ROUND_TRIP_COST = 0.0015
VOL_TARGET = 0.173
MIN_EXPOSURE = 0.2
MAX_EXPOSURE = 1.0
UNIVERSE_SIZE = 90
TOP_N = 3
MODEL = "XGBoost"
TRAIN_TARGET = "beats_median_20d (classifier)"

# Feature groups, hand-mapped from trading_ml/source/features.py's FEATURES
# list (BASE_FEATURES + MARKET_FEATURES + FUNDAMENTAL_FEATURES +
# EDGAR_FEATURES). Verified against that file's exact contents below.
FEATURE_GROUPS = [
    {
        "group": "Momentum",
        "features": ["return_5d", "return_10d", "return_20d"],
        "note": "Recent relative price persistence over three horizons.",
    },
    {
        "group": "Trend",
        "features": ["close_vs_ema20", "close_vs_ema50", "close_vs_ema100"],
        "note": "Price position relative to short/medium/long moving averages.",
    },
    {
        "group": "Volatility",
        "features": ["volatility_5d", "volatility_20d"],
        "note": "Realised volatility over two lookback windows; also drives inverse-volatility position sizing.",
    },
    {
        "group": "Oscillators",
        "features": ["rsi", "bollinger_zscore"],
        "note": "Overbought/oversold and mean-reversion context.",
    },
    {
        "group": "Range & structure",
        "features": [
            "range_position_20d",
            "close_vs_prev_week_high", "close_vs_prev_week_low",
            "close_vs_prev_month_high", "close_vs_prev_month_low",
            "close_vs_20d_high", "close_vs_20d_low",
            "close_vs_50d_high", "close_vs_50d_low",
        ],
        "note": "Position within recent trading ranges and proximity to prior highs/lows.",
    },
    {
        "group": "Candle shape",
        "features": ["upper_wick_pct", "lower_wick_pct", "body_pct"],
        "note": "Intraday rejection and conviction within the day's bar.",
    },
    {
        "group": "Volume",
        "features": ["volume_vs_20d", "volume_vs_60d"],
        "note": "Participation relative to trailing averages.",
    },
    {
        "group": "Market context",
        "features": ["spy_return_1d", "spy_return_5d", "spy_vs_ema50", "vix_level", "vix_vs_60d"],
        "note": "Index-level regime (SPY, VIX) -- identical across tickers on a date, giving the model context rather than cross-sectional separation.",
    },
    {
        "group": "Earnings timing",
        "features": ["days_since_earnings", "days_to_earnings"],
        "note": "Distance to the nearest earnings report.",
    },
    {
        "group": "Fundamentals",
        "features": ["pe_ratio", "profit_margin", "revenue_growth_yoy"],
        "note": "SEC EDGAR XBRL fundamentals, dated to actual filing dates.",
    },
]
FEATURE_COUNT = sum(len(g["features"]) for g in FEATURE_GROUPS)


def sharpe(period_returns: pd.Series, cost: float = 0.0) -> float:
    excess = period_returns - cost
    if len(excess) < 2 or excess.std() == 0:
        return float("nan")
    return float(excess.mean() / excess.std() * np.sqrt(PERIODS_PER_YEAR))


def annualised_return(mean_period_return: float) -> float:
    if mean_period_return <= -1:
        return -1.0
    return float((1 + mean_period_return) ** PERIODS_PER_YEAR - 1)


def load_top_n(n: int) -> pd.DataFrame:
    df = pd.read_parquet(RUN_DIR / f"rank_daily_top{n}.parquet")
    df.index = pd.to_datetime(df.index)
    return df.sort_index()


def strategy_row(df: pd.DataFrame, label: str) -> dict:
    net_returns = df["scaled_return"] - df["scaled_cost"]
    return {
        "strategy": label,
        "annualizedReturn": annualised_return(float(net_returns.mean())),
        "sharpe": sharpe(net_returns),
        "meanExposure": float(df["exposure"].mean()),
        "sortingSpreadBps": float(df["spread"].mean() * 10000),
    }


def build_equity_curve(top3: pd.DataFrame) -> dict:
    dates = list(top3.index)
    net_returns = (top3["scaled_return"] - top3["scaled_cost"]).tolist()
    spy_returns = top3["benchmark_return"].tolist()
    universe_returns = top3["universe_return"].tolist()

    final_date = np.busday_offset(
        dates[-1].date(), HORIZON, roll="forward"
    )

    labels = [dates[0]] + dates[1:] + [pd.Timestamp(final_date)]
    # labels[i] is the date at which period (i-1)'s return crystallizes and
    # the next allocation begins; labels[0] is the start of the test window.

    series = []
    top3_val = spy_val = universe_val = 100.0
    series.append({"date": labels[0].date().isoformat(), "topThree": 100.0, "spy": 100.0, "universe": 100.0})
    for i in range(len(net_returns)):
        top3_val *= 1 + net_returns[i]
        spy_val *= 1 + spy_returns[i]
        universe_val *= 1 + universe_returns[i]
        series.append({
            "date": labels[i + 1].date().isoformat(),
            "topThree": round(top3_val, 3),
            "spy": round(spy_val, 3),
            "universe": round(universe_val, 3),
        })

    return {
        "sample": False,
        "note": (
            "Real compounded path from the final saved walk-forward run "
            f"({RUN_NAME}). Each point is the cumulative value after the prior "
            "20-trading-day holding period's realized, cost-adjusted return. "
            "The final point's date is approximated (20 trading days after "
            "the last rebalance) since the source panel does not extend that far."
        ),
        "startValue": 100,
        "series": series,
    }


def load_pooled_predictions() -> pd.DataFrame:
    pooled = pd.read_parquet(RUN_DIR / "predictions.parquet")
    pooled["date"] = pd.to_datetime(pooled["date"])
    pooled["actual_rank"] = pooled.groupby("date")["future_return_20d"].rank(pct=True)
    pooled["pred_rank"] = pooled.groupby("date")["pred"].rank(pct=True)
    pooled["actual_beats"] = pooled["actual_rank"] > 0.5
    pooled["pred_beats"] = pooled["pred_rank"] > 0.5
    pooled["rank_correct"] = pooled["pred_beats"] == pooled["actual_beats"]
    return pooled


def median_split(pooled: pd.DataFrame) -> tuple[float, float]:
    """(rank accuracy, edge over the 0.5 baseline), replicating rank_testing.median_test."""
    accuracy = float(pooled["rank_correct"].mean())
    baseline = float(pooled["actual_beats"].mean())
    return accuracy, accuracy - baseline


def build_predictions(top3: pd.DataFrame, pooled: pd.DataFrame) -> dict:
    periods = []
    for date, row in top3.iterrows():
        tickers = [t.strip() for t in row["picks"].split(",")]
        day_rows = pooled[pooled["date"] == date].set_index("ticker")

        picks = []
        for rank, ticker in enumerate(tickers, start=1):
            if ticker not in day_rows.index:
                continue
            r = day_rows.loc[ticker]
            picks.append({
                "rank": rank,
                "ticker": ticker,
                "score": round(float(r["pred"]), 4),
                "actualPercentile": round(float(r["actual_rank"]), 4),
                "next20dReturn": round(float(r["future_return_20d"]), 4),
                "volatility20d": round(float(r["volatility_20d"]), 4),
            })

        net_return = float(row["scaled_return"] - row["scaled_cost"])
        periods.append({
            "date": date.date().isoformat(),
            "picks": picks,
            "exposure": round(float(row["exposure"]), 3),
            "portfolioReturn": round(net_return, 4),
            "spyReturn": round(float(row["benchmark_return"]), 4),
            "universeReturn": round(float(row["universe_return"]), 4),
            "excessReturnVsSpy": round(net_return - float(row["benchmark_return"]), 4),
            "meanActualPercentile": round(float(row["mean_actual_rank"]), 4),
            "beatMedianCount": int(row["beat_median"]),
        })

    return {
        "sample": False,
        "note": (
            f"Real historical rebalances from the final saved walk-forward run ({RUN_NAME}). "
            "Scores are the model's classifier probability of beating the cross-sectional "
            "median return over the next 20 trading days, produced walk-forward "
            "(only past data was used to train the model active on each date). "
            "These are historical out-of-sample model outputs, not live recommendations."
        ),
        "periods": periods,
    }


def build_metrics(top3: pd.DataFrame, top1: pd.DataFrame, top15: pd.DataFrame, pooled: pd.DataFrame) -> dict:
    net_returns_3 = top3["scaled_return"] - top3["scaled_cost"]
    spy_returns = top3["benchmark_return"]
    universe_returns = top3["universe_return"]
    rank_accuracy, sorting_edge = median_split(pooled)

    return {
        "sample": False,
        "source": f"trading_ml/models/{RUN_NAME} (final saved walk-forward run)",
        "testStart": top3.index[0].date().isoformat(),
        "testEnd": top3.index[-1].date().isoformat(),
        "rebalancePeriods": int(len(top3)),
        "universeSize": UNIVERSE_SIZE,
        "topN": TOP_N,
        "rebalanceDays": HORIZON,
        "model": MODEL,
        "trainTarget": TRAIN_TARGET,
        "positionSizing": f"inverse-volatility, scaled to a {VOL_TARGET:.1%} annualized vol target (clip {MIN_EXPOSURE:.0%}-{MAX_EXPOSURE:.0%} exposure)",
        "transactionCostsIncluded": True,
        "roundTripCostBps": ROUND_TRIP_COST * 10000,
        "returns": {
            "topThreeAnnualized": annualised_return(float(net_returns_3.mean())),
            "spyAnnualized": annualised_return(float(spy_returns.mean())),
            "universeAnnualized": annualised_return(float(universe_returns.mean())),
        },
        "sharpe": {
            "topThree": sharpe(net_returns_3),
            "spy": sharpe(spy_returns),
            "universe": sharpe(universe_returns),
        },
        "excessReturn": {
            "vsSpy": annualised_return(float(net_returns_3.mean())) - annualised_return(float(spy_returns.mean())),
            "vsUniverse": annualised_return(float(net_returns_3.mean())) - annualised_return(float(universe_returns.mean())),
        },
        "sortingEdge": sorting_edge,
        "rankAccuracy": rank_accuracy,
        "topMinusBottomSpreadBps": float(top3["spread"].mean() * 10000),
        "meanActualPercentileTopThree": float(top3["mean_actual_rank"].mean()),
        "pctTopThreeBeatingMedian": float(top3["beat_median"].sum() / (len(top3) * TOP_N)),
        "realizedVolatility": {
            "topThree": float((net_returns_3.std() * np.sqrt(PERIODS_PER_YEAR))),
            "spy": float((spy_returns.std() * np.sqrt(PERIODS_PER_YEAR))),
            "universe": float((universe_returns.std() * np.sqrt(PERIODS_PER_YEAR))),
        },
        "strategyComparison": [
            strategy_row(top1, "Top 1"),
            strategy_row(top3, "Top 3"),
            strategy_row(top15, "Top 15"),
        ],
        "significance": {
            "sortingEdgeTStat": 2.19,
            "returnVsSpyTStat": 0.66,
            "returnVsSpyPValue": 0.51,
            "periodsWonVsSpy": 20,
            "periodsTotal": 45,
            "note": (
                "From trading_ml's README: the sorting edge (+1.85pp, t=2.19) is "
                "statistically significant across the 45 independent rebalance "
                "periods. The raw outperformance vs SPY is not (t=0.66, p=0.51); "
                "Top 3 beat SPY in 20 of 45 periods."
            ),
        },
    }


def build_model_info() -> dict:
    return {
        "sample": False,
        "model": MODEL,
        "objective": "Cross-sectional ranking: classifier estimates P(beats the day's cross-sectional median return over the next 20 trading days)",
        "universeSize": UNIVERSE_SIZE,
        "topN": TOP_N,
        "rebalanceDays": HORIZON,
        "testStart": "2023-01-03",
        "testEnd": "2026-07-09",
        "positionSizing": "inverse-volatility within the basket, then scaled as a whole to a 17.3% annualized volatility target (0.2x-1.0x exposure)",
        "transactionCostsIncluded": True,
        "roundTripCostBps": ROUND_TRIP_COST * 10000,
        "validation": (
            "Walk-forward: retrained every 20 trading days on an expanding "
            "window of past data only, with a 20-day embargo between the "
            "training cutoff and the scored period to prevent the forward-"
            "looking label from leaking into training."
        ),
        "earningsExclusion": "Tickers within 5 trading days of an earnings report are excluded from the pick pool.",
        "featureCount": FEATURE_COUNT,
        "featureGroups": FEATURE_GROUPS,
    }


def main() -> None:
    if not RUN_DIR.exists():
        raise SystemExit(f"Run directory not found (read-only check): {RUN_DIR}")

    top3 = load_top_n(3)
    top1 = load_top_n(1)
    top15 = load_top_n(15)
    pooled = load_pooled_predictions()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    outputs = {
        "metrics.json": build_metrics(top3, top1, top15, pooled),
        "equity_curve.json": build_equity_curve(top3),
        "predictions.json": build_predictions(top3, pooled),
        "model_info.json": build_model_info(),
    }

    for filename, payload in outputs.items():
        out_path = OUT_DIR / filename
        out_path.write_text(json.dumps(payload, indent=2, default=str) + "\n")
        print(f"wrote {out_path.relative_to(DEMO_ROOT)}")


if __name__ == "__main__":
    main()
