"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Vane } from "./character/vane";
import { OverviewPage } from "./pages/overview-page";
import { PerformancePage } from "./pages/performance-page";
import { DoesItWorkPage } from "./pages/does-it-work-page";
import { HowItsBuiltPage } from "./pages/how-its-built-page";
import { WhatILearnedPage } from "./pages/what-i-learned-page";
import { SiteFooter } from "./site-footer";
import type { EquityCurveData, MetricsData, ModelInfo, PredictionsData } from "@/lib/types";

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance" },
  { id: "does-it-work", label: "Does It Work?" },
  { id: "how-its-built", label: "How It's Built" },
  { id: "what-i-learned", label: "What I Learned" },
] as const;

export type ViewId = (typeof VIEWS)[number]["id"];
const VIEW_IDS = VIEWS.map((v) => v.id);

function isViewId(value: string | null): value is ViewId {
  return !!value && (VIEW_IDS as string[]).includes(value);
}

function readFromLocation(): { view: ViewId; rebalance: string | null } {
  if (typeof window === "undefined") return { view: "overview", rebalance: null };
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  return {
    view: isViewId(view) ? view : "overview",
    rebalance: params.get("rebalance"),
  };
}

function buildUrl(view: ViewId, rebalance: string | null): string {
  const params = new URLSearchParams();
  if (view !== "overview") params.set("view", view);
  if (rebalance) params.set("rebalance", rebalance);
  const qs = params.toString();
  return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
}

export function AppShell({
  metrics,
  equityCurve,
  predictions,
  modelInfo,
}: {
  metrics: MetricsData | null;
  equityCurve: EquityCurveData | null;
  predictions: PredictionsData | null;
  modelInfo: ModelInfo | null;
}) {
  // Server has no window, so it always renders the deterministic default.
  // Reading the real URL has to wait for a client-only effect after mount,
  // matching that same default, or the hydrated client tree would mismatch
  // the server-rendered HTML on any deep link (?view=... / ?rebalance=...)
  // and React would throw a hydration error.
  const [view, setView] = useState<ViewId>("overview");
  const [rebalance, setRebalanceState] = useState<string | null>(null);

  useEffect(() => {
    // Deliberate one-time sync from the URL (a genuinely external, non-React
    // data source) into React state right after mount; this can't happen
    // during render without risking the hydration mismatch described above.
    const initial = readFromLocation();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(initial.view);
    setRebalanceState(initial.rebalance);

    function onPopState() {
      const next = readFromLocation();
      setView(next.view);
      setRebalanceState(next.rebalance);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback(
    (nextView: ViewId) => {
      if (nextView === view) return;
      setView(nextView);
      window.history.pushState(null, "", buildUrl(nextView, rebalance));
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    [view, rebalance]
  );

  /**
   * Selecting a rebalance while staying on the same page is a same-page
   * refinement (replaceState); jumping to a different page with a target
   * date already chosen (the graph -> explorer link) is real navigation
   * (pushState), so Back still retraces the visit.
   */
  const selectRebalance = useCallback(
    (date: string | null, opts?: { navigateTo?: ViewId }): void => {
      const targetView = opts?.navigateTo ?? view;
      setRebalanceState(date);
      if (targetView !== view) {
        setView(targetView);
        window.history.pushState(null, "", buildUrl(targetView, date));
      } else {
        window.history.replaceState(null, "", buildUrl(targetView, date));
      }
    },
    [view]
  );

  const pageProps = { metrics, equityCurve, predictions, modelInfo, rebalance, selectRebalance, navigate };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-3 sm:px-8">
          <div className="flex shrink-0 items-center gap-2">
            <Vane state="idle" size={28} />
            <span className="truncate font-mono text-[0.8rem] font-medium tabular-nums text-foreground">
              ML Ranking
            </span>
          </div>

          <nav
            aria-label="Sections"
            className="flex min-w-0 flex-1 gap-4 overflow-x-auto sm:gap-6"
          >
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => navigate(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 py-3 text-[0.8rem] transition-colors ${
                  view === v.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </nav>

          <a
            href="https://github.com/erichuangreal/trading_ml_demo"
            target="_blank"
            rel="noreferrer"
            className="hidden shrink-0 font-mono text-[0.75rem] text-subtle underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent sm:inline"
          >
            Source
          </a>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "overview" ? <OverviewPage {...pageProps} /> : null}
            {view === "performance" ? <PerformancePage {...pageProps} /> : null}
            {view === "does-it-work" ? <DoesItWorkPage {...pageProps} /> : null}
            {view === "how-its-built" ? <HowItsBuiltPage {...pageProps} /> : null}
            {view === "what-i-learned" ? <WhatILearnedPage {...pageProps} /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}
