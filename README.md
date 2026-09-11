# ML Equity Ranking System — Public Demo

## Run it locally

```bash
npm install
npm run dev       # then open http://localhost:3000
```

An interactive research-memo-style frontend for a private machine-learning
equity-ranking project. It presents the model's methodology, walk-forward
validation, historical decisions, and results — critically, including where
the results fall short — to a technical audience (recruiters, engineers,
quant researchers) without exposing the underlying research implementation.

[Live demo](https://trading-ml-demo.vercel.app/) · [Screenshot](#)

> This is a research and engineering portfolio project. It is not a trading
> platform, brokerage, signal service, or investment recommendation. Every
> prediction shown is a historical, out-of-sample model output.

## What this is

The underlying system is a cross-sectional machine-learning stock-ranking
model: at each 20-trading-day rebalance, an XGBoost classifier ranks roughly
90 NASDAQ equities against each other by estimated probability of beating
the day's cross-sectional median return over the next 20 trading days. The
top 3 are selected, sized inversely to their own volatility, and the whole
basket is scaled to a 17.3% annualized volatility target. The model is
retrained walk-forward — only on data available before each test period —
so nothing in the test window ever leaks into training.

This repository is the **public-facing half** of that project. The private
research implementation (training code, feature engineering, walk-forward
backtesting engine, saved model runs) lives in a separate, private
repository. This repository never needs runtime access to it — it consumes
static, exported JSON.

## Architecture

```
trading_ml (private)                trading_ml_demo (this repo, public)
├── models/<run>/                   ├── scripts/export_demo_data.py
│   ├── predictions.parquet    ──┐  │     (read-only from ../trading_ml,
│   ├── rank_daily_top{1,3,15}   │  │      writes only into public/data)
│   └── rank_testing.log         │  │
└── source/                      └─▶├── public/data/*.json
    ├── features.py                 │     metrics, equity_curve,
    ├── walkforward.py              │     predictions, model_info
    └── rank_testing.py             │
                                     └── src/  (Next.js App Router UI)
```

`scripts/export_demo_data.py` is the only bridge between the two
repositories. It reads the private repo's saved parquet outputs for the
final saved walk-forward run and writes clean, typed JSON into
`public/data/`. It never writes into the private repository and never
copies training code, raw datasets, or model binaries into this one.

## Data flow

```
public/data/metrics.json          headline return/Sharpe/significance figures
public/data/equity_curve.json     real compounded portfolio path vs. SPY vs. universe
public/data/predictions.json      every real historical rebalance: picks, scores, outcomes
public/data/model_info.json       model config, validation method, feature groups
```

All four files are the sole source of truth for anything the UI presents as
a real result. Nothing in the React components hard-codes a metric — every
number renders from these JSON files, and a missing field renders as `N/A`
rather than being invented. If a data file were ever replaced with a
placeholder, it would carry an explicit `"sample": true` flag and the UI
would need to surface that (the current files are all real: `"sample": false`).

## Methodology

- **Universe:** ~90 NASDAQ-listed equities, ranked cross-sectionally at each rebalance.
- **Features:** 34 engineered features across 10 signal families — momentum,
  trend, volatility, oscillators, range/structure, candle shape, volume,
  market context (SPY/VIX), earnings timing, and SEC EDGAR fundamentals.
- **Model:** XGBoost classifier estimating P(beats the day's cross-sectional
  median return) over the next 20 trading days. The objective is relative
  ranking, not absolute direction.
- **Walk-forward validation:** retrained every 20 trading days on an
  expanding window of past data only, with a 20-day embargo between the
  training cutoff and the scored period so no forward-looking label ever
  leaks into training. This is a stricter, more realistic test than a
  single random train/test split, at the cost of a smaller effective
  sample — 45 independent, non-overlapping periods across 2023–2026.
- **Portfolio construction:** rank all ~90 names → select the top 3 →
  weight inversely to each pick's own volatility → scale the whole basket
  to a 17.3% annualized volatility target (clamped 20%–100% exposure) →
  hold 20 trading days → repeat.
- **Costs:** a 15 bps round-trip transaction cost is modeled and included
  in every reported net figure.

## Headline results (final saved run)

Sourced live from `public/data/metrics.json` — see that file for the exact,
current numbers. As of the run this repo currently ships with:

| | Top 3 (model) | SPY | Universe (90, eq-wt) |
|---|---:|---:|---:|
| Annualized return | 33.8% | 24.3% | 28.8% |
| Sharpe ratio | 1.15 | 1.77 | 1.51 |

The model beat SPY on raw return but not on risk-adjusted return. The
raw-return gap over SPY is not statistically significant (t ≈ 0.66,
p ≈ 0.51; won 20 of 45 periods). The cross-sectional **sorting edge**
(+1.85pp rank-accuracy edge over the 50% baseline, t ≈ 2.19) is the more
defensible result — see the site's Results Interpretation and Limitations
sections for the full, unvarnished discussion.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Recharts · static JSON
data · Vercel deployment. No backend, no database, no auth, no live
market-data or brokerage APIs, no server-side inference.

## Local setup

```bash
npm install
npm run dev       # http://localhost:3000
```

To regenerate `public/data/*.json` from a fresh saved run in the sibling
private repository (requires that repo to exist as `../trading_ml` with
`pandas`/`pyarrow` available, e.g. via its own virtualenv):

```bash
python3 scripts/export_demo_data.py
```

## Build

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

Deploy directly to [Vercel](https://vercel.com) — this is a static Next.js
site with no environment variables or external services required. Connect
the repository and deploy; `public/data/*.json` ships with the repo.

## Limitations

See the Limitations section on the site itself for the full list (small
sample size, regime dependence, signal decay, concentration risk,
volatility-target lag, modeled execution costs, no live track record, no
tax modeling, universe-construction caveats, and the statistical
significance caveat on the raw return figures).

This project is presented for research and engineering demonstration
purposes and is not investment advice.
