import { AppShell } from "@/components/app-shell";
import { getEquityCurve, getMetrics, getModelInfo, getPredictions } from "@/lib/data";

export default function Home() {
  const metrics = getMetrics();
  const equityCurve = getEquityCurve();
  const predictions = getPredictions();
  const modelInfo = getModelInfo();

  return (
    <AppShell
      metrics={metrics}
      equityCurve={equityCurve}
      predictions={predictions}
      modelInfo={modelInfo}
    />
  );
}
