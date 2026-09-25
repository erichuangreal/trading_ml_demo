"use client";

import { useEffect, useMemo, useState } from "react";
import { Vane } from "../character/vane";
import { UncertaintyGlyph } from "../icons/glyphs";
import { LivePipelineDiagram } from "../live-pipeline-diagram";
import { TickerLeaderboard } from "../ticker-leaderboard";
import { LiveAuditLog } from "../live-audit-log";
import { fetchAuditLog, fetchLiveStatus, triggerLiveRun } from "@/lib/live-api";
import type { AuditLogEntry, LiveStatus } from "@/lib/live-types";
import type { PageProps } from "./types";

const RUNNING_POLL_MS = 3000;
const IDLE_POLL_MS = 20000;

function formatEtClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LiveDemoPage({ predictions }: PageProps) {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const runStatus = status?.run?.status;

  const tickerPool = useMemo(() => {
    if (!predictions) return [];
    const seen = new Set<string>();
    for (const period of predictions.periods) {
      for (const pick of period.picks) seen.add(pick.ticker);
    }
    return Array.from(seen).sort();
  }, [predictions]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [nextStatus, nextAuditLog] = await Promise.all([fetchLiveStatus(), fetchAuditLog()]);
        if (cancelled) return;
        setStatus(nextStatus);
        setAuditLog(nextAuditLog);
        setStatusError(null);
      } catch {
        if (!cancelled) setStatusError("Live demo backend is unreachable right now.");
      }
    }

    poll();
    const interval = setInterval(poll, runStatus === "running" ? RUNNING_POLL_MS : IDLE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [runStatus]);

  async function handleTrigger() {
    setTriggering(true);
    setTriggerError(null);
    const result = await triggerLiveRun();
    setTriggering(false);
    if (!result.ok) {
      setTriggerError(result.error);
    }
    fetchLiveStatus().then(setStatus).catch(() => undefined);
  }

  const activeRun = status?.run ?? null;
  const fallbackRun = status?.latestCompletedRun ?? null;
  const isRunning = activeRun?.status === "running";
  const isDone = activeRun?.status === "done";
  const isError = activeRun?.status === "error";

  // What the diagram + result panel actually render: today's real run if one
  // exists (running, done, or errored), otherwise the most recent completed
  // run as context, so the page never just shows an empty gap before 4pm ET
  // or before anyone's triggered today. isShowingToday distinguishes the two
  // for labeling -- a fallback result must never be mistaken for today's.
  const isShowingToday = activeRun !== null;
  const displayStages = activeRun?.stages ?? fallbackRun?.stages ?? null;
  const displayResult = activeRun?.result ?? fallbackRun?.result ?? null;
  const hasDisplay = displayStages !== null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 sm:py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
            The live pipeline, actually running
          </h1>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
            Every other page on this site shows one saved historical backtest. This page triggers the real{" "}
            <code className="font-mono text-[0.85rem] text-foreground">trading_ml</code> pipeline: fresh yfinance and
            SEC EDGAR data, a full 45-fold walk-forward retrain, and today&apos;s real ranked picks, once per trading
            day.
          </p>
        </div>
        <Vane state={isRunning ? "travel" : isDone ? "alert" : "idle"} size={28} className="mt-1 shrink-0" />
      </div>

      {statusError ? (
        <div className="border border-border p-5 text-[0.85rem] text-subtle">{statusError}</div>
      ) : !status ? (
        <div className="border border-border p-5 text-[0.85rem] text-subtle">Checking today&apos;s status&hellip;</div>
      ) : (
        <>
          {status.triggeredToday && activeRun ? (
            <p className="mb-4 text-[0.8rem] text-subtle">
              The first request after 4pm ET each day has been triggered. Triggered at{" "}
              <span className="font-mono tabular-nums text-foreground">{formatEtClock(activeRun.triggeredAtEt)} ET</span>{" "}
              for trading day <span className="font-mono tabular-nums text-foreground">{activeRun.tradingDay}</span>.
            </p>
          ) : !status.isTradingDay ? (
            <p className="mb-4 text-[0.8rem] text-subtle">
              Markets are closed today (weekend). Showing the most recent completed run below; US market holidays
              aren&apos;t modeled yet, so a holiday will read the same way.
            </p>
          ) : !status.marketClosed ? (
            <p className="mb-4 text-[0.8rem] text-subtle">
              Today&apos;s bar closes at 4pm ET. A run can start after that, once the day&apos;s prices are final.
            </p>
          ) : null}

          {!status.triggeredToday && status.isTradingDay && status.marketClosed ? (
            <div className="mb-8 flex flex-col items-start gap-3 border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-[0.85rem] leading-relaxed text-muted">
                No one has run today&apos;s pipeline yet. Starting it fetches live market data and retrains the model,
                real, and takes about three minutes.
              </p>
              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={handleTrigger}
                  disabled={triggering}
                  className="shrink-0 border border-accent px-4 py-2 font-mono text-[0.8rem] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {triggering ? "Starting…" : "Run today's live pipeline"}
                </button>
                {triggerError ? <span className="text-[0.75rem] text-subtle">{triggerError}</span> : null}
              </div>
            </div>
          ) : null}

          {hasDisplay ? (
            <div className="mb-8 border-t border-border pt-8">
              {!isShowingToday && fallbackRun ? (
                <p className="mb-4 text-[0.8rem] text-subtle">
                  Most recent completed run, trading day{" "}
                  <span className="font-mono tabular-nums text-foreground">{fallbackRun.tradingDay}</span>. Not
                  today&apos;s result yet.
                </p>
              ) : null}
              <LivePipelineDiagram stages={displayStages} />
            </div>
          ) : null}

          {activeRun && isError ? (
            <div className="mb-8 flex items-start gap-3 border border-border p-5">
              <UncertaintyGlyph className="mt-0.5 shrink-0 text-subtle" width={20} height={20} />
              <div>
                <p className="text-[0.85rem] text-foreground">
                  Today&apos;s run hit an error at <span className="font-mono">{activeRun.error?.stage}</span>.
                </p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-subtle">
                  {activeRun.error?.message?.split("\n")[0]}
                </p>
                <p className="mt-2 text-[0.8rem] text-subtle">
                  Logged honestly in the audit log below rather than shown as a result. The next trading day&apos;s
                  first visitor can try again.
                </p>
              </div>
            </div>
          ) : null}

          {isRunning || displayResult ? (
            <div className="mb-8">
              <TickerLeaderboard
                tickerPool={tickerPool}
                isRunning={isRunning}
                result={displayResult}
                isToday={isShowingToday}
              />
            </div>
          ) : null}
        </>
      )}

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-[0.95rem] font-medium text-foreground">Public audit log</h2>
        <p className="mt-2 max-w-2xl text-[0.8rem] leading-relaxed text-subtle">
          Every real trigger, whoever happened to cause it. No visitor-identifying information is recorded.
        </p>
        <div className="mt-4">
          <LiveAuditLog entries={auditLog} />
        </div>
      </div>
    </div>
  );
}
