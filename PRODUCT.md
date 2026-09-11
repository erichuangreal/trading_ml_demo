# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: software engineering recruiters, ML engineering recruiters, quantitative developers/researchers, software engineers, and technical hiring managers evaluating this as a portfolio piece. A visitor should understand what the project is within ~30-60 seconds; more technical visitors should be able to inspect the ML workflow, walk-forward validation, portfolio construction, historical decisions, and performance/limitations in depth.

## Product Purpose

A public, recruiter-facing interactive demo/visualization of an existing machine-learning cross-sectional equity-ranking system. It makes an existing quantitative research project (built and run in a separate private repository) understandable, credible, and inspectable to a technical hiring audience. Success = a recruiter/engineer can, within about a minute, understand what the model does, how it was validated, what its historical results were, how those compare to benchmarks, and what its limitations are.

## Positioning

This is a portfolio/engineering-demonstration site, explicitly not a trading product. It presents itself with the visual and intellectual honesty of quantitative research / institutional analytics rather than retail trading or fintech marketing — critical self-assessment of results (e.g., lower Sharpe than SPY despite higher absolute return) is part of the credibility story, not something to hide.

## Operating Context

- **Repository split:** The ML implementation (training, feature engineering, walk-forward backtesting, saved runs) lives in a separate private repository, `trading_ml` (sibling directory `../trading_ml`, read-only from this repo). This repository, `trading_ml_demo`, is presentation-only and must not require runtime access to the private repo.
- **Data flow:** `trading_ml` (private) → `scripts/export_demo_data.py` (read-only from `../trading_ml`, writes only into this repo) → `trading_ml_demo/public/data/*.json` → Next.js frontend → Vercel.
- **Data files (real, present):** `public/data/metrics.json`, `public/data/equity_curve.json`, `public/data/predictions.json`, `public/data/model_info.json` all exist and carry `"sample": false` — sourced directly from the private repo's final saved walk-forward run, `v4xgboost_walkforward_2026-08-26_22-53-59` (45 real rebalance periods, 2023-01-03 to 2026-07-09). Re-run the export script to refresh from a newer saved run; never hand-edit these files.
- **Deployment:** Static/Vercel-deployable, no backend, no database, no auth, no live market data, no server-side inference.

## Capabilities and Constraints

**The underlying system (context, not to be rebuilt here):** a cross-sectional ML stock-ranking model. At each 20-trading-day rebalance: load historical market data → engineer 34 features (across momentum, trend, volatility, oscillators, range/structure, candle shape, volume, market context, earnings timing, and SEC EDGAR fundamentals) for ~90 NASDAQ equities → train an XGBoost classifier on historical data only (walk-forward, expanding window, 20-day embargo against label leakage) → estimate each stock's probability of beating the day's cross-sectional median return over the next 20 trading days → rank cross-sectionally → select Top 3 (excluding names within 5 trading days of earnings) → size inversely to each pick's own volatility, then scale the whole basket to a 17.3% annualized volatility target (20%-100% exposure clamp) → hold 20 trading days → repeat. Evaluated via historical out-of-sample walk-forward testing, test period 2023-01-03 to 2026-07-09, 45 independent non-overlapping rebalance periods. A 15 bps round-trip transaction cost is modeled and included in every net figure.

**Confirmed headline results (from the real export, `public/data/metrics.json`, sourced from the private repo's final saved run):** Top-3 annualized return 33.8%; SPY annualized return 24.3%; equal-weight universe annualized return 28.8%; Top-3 Sharpe 1.15; SPY Sharpe 1.77; universe Sharpe 1.51; annualized net excess return vs SPY +9.5%; sorting edge (median-split rank-accuracy edge over the 50% baseline) +1.85pp; rank accuracy 51.85%; mean actual percentile of Top-3 selections 0.5474; % of Top-3 selections beating the median 60.74%; top-minus-bottom-3 spread +259 bps/period.

**Statistical significance (important nuance, drives the site's "Results Interpretation" honesty):** the cross-sectional sorting edge is significant (t ≈ 2.19 across 45 periods). The raw return advantage over SPY is *not* statistically significant (t ≈ 0.66, p ≈ 0.51) — Top 3 beat SPY in only 20 of 45 periods, close to a coin flip. The most defensible result is the ranking signal, not the headline return number — never let site copy imply otherwise.

**Hard constraints on this repo:**
- Never merge with or expose the private `trading_ml` implementation (training scripts, model files, raw datasets, credentials, private notes).
- Never fabricate or invent returns, benchmark results, ticker selections, predictions, dates, Sharpe ratios, equity curves, or model metrics. Missing fields are omitted or shown as N/A, never silently filled.
- Not a live trading platform, brokerage, signal service, or recommendation engine — no BUY/SELL/current-recommendation language; all shown predictions are explicitly historical/out-of-sample.
- Tech stack is frozen: Next.js (App Router) + TypeScript + Tailwind CSS + Recharts + static JSON, deployed to Vercel. Explicitly no Python backend, no database (Supabase/Firebase/Mongo), no auth/accounts/payments, no live market-data or brokerage APIs, no WebSockets, no server-side ML inference, no chatbot, no notifications/news feed, no portfolio tracking.
- Scope is frozen to shipping this demo; no redesigning or retraining the ML system, no live inference.

## Evidence on Hand

`public/data/*.json` (metrics, equity_curve, predictions, model_info) are real, present, and marked `"sample": false`, generated by `scripts/export_demo_data.py` from `../trading_ml`'s final saved walk-forward run. The UI reads these files as its sole source of truth for anything presented as a real result — nothing is hard-coded in components. If a future export ever needs to ship with placeholder data (e.g. before a newer run's export lands), it must carry `"sample": true` and the UI must surface that clearly; the current files do not need this. If a metric or field is unavailable, display N/A rather than inventing or estimating it.

## Product Principles

1. **Data integrity over completeness.** Never fabricate or backfill a missing figure; omit or show N/A. Real exported JSON is the only source of truth for anything presented as an actual result.
2. **Research honesty over salesmanship.** Present results critically (e.g., lower Sharpe than SPY despite higher absolute return) — credibility to a technical audience matters more than looking impressive.
3. **Clear separation of historical vs. live.** Every prediction/decision shown is explicitly a historical, out-of-sample model output — never framed as a current recommendation or trading signal.
4. **Presentation-only boundary.** This repo never needs the private `trading_ml` implementation at runtime or build time; it consumes static exported JSON only.
5. **Recruiter-first clarity, researcher-depth on demand.** A visitor understands the project's premise in under a minute; a technical visitor can drill into methodology, walk-forward validation, and limitations without being forced to.

## Accessibility & Inclusion

Semantic HTML, proper heading structure, accessible labels, keyboard-accessible selectors (e.g. the historical rebalance-date picker), sufficient text contrast, and accessible chart descriptions are required — this is a general "should work well for all visitors" requirement, not a compliance mandate from a named standard.
