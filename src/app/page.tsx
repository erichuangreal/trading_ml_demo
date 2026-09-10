import { ResearchHeader } from "@/components/research-header";
import { ExecutiveResult } from "@/components/executive-result";
import { PerformanceChart } from "@/components/performance-chart";
import { RankingQuality } from "@/components/ranking-quality";
import { HistoricalDecisionExplorer } from "@/components/historical-decision-explorer";
import { ModelPipeline } from "@/components/model-pipeline";
import { WalkForwardDiagram } from "@/components/walk-forward-diagram";
import { FeatureSystem } from "@/components/feature-system";
import { PortfolioConstruction } from "@/components/portfolio-construction";
import { ResearchConclusion } from "@/components/research-conclusion";
import { Limitations } from "@/components/limitations";
import { SiteFooter } from "@/components/site-footer";
import { getEquityCurve, getMetrics, getModelInfo, getPredictions } from "@/lib/data";

export default function Home() {
  const metrics = getMetrics();
  const equityCurve = getEquityCurve();
  const predictions = getPredictions();
  const modelInfo = getModelInfo();

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <ResearchHeader metrics={metrics} />
        <ExecutiveResult metrics={metrics} />
        <PerformanceChart equityCurve={equityCurve} />
        <RankingQuality metrics={metrics} predictions={predictions} />
        <HistoricalDecisionExplorer predictions={predictions} />
        <ModelPipeline />
        <WalkForwardDiagram />
        <FeatureSystem modelInfo={modelInfo} />
        <PortfolioConstruction metrics={metrics} />
        <ResearchConclusion metrics={metrics} />
        <Limitations />
      </main>
      <SiteFooter />
    </div>
  );
}
