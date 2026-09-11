import { ModelPipeline } from "../model-pipeline";
import { WalkForwardDiagram } from "../walk-forward-diagram";
import { FeatureSystem } from "../feature-system";
import { PortfolioConstruction } from "../portfolio-construction";
import type { PageProps } from "./types";

export function HowItsBuiltPage({ metrics, modelInfo }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
          What&apos;s under the hood
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
          Built end to end myself: data, features, training, ranking, and sizing. XGBoost,
          pandas, and scikit-learn do the heavy lifting. The pipeline connecting them is mine.
        </p>
      </div>

      <ModelPipeline />

      <div className="mt-14 border-t border-border pt-10">
        <WalkForwardDiagram />
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <FeatureSystem modelInfo={modelInfo} />
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <PortfolioConstruction metrics={metrics} />
      </div>
    </div>
  );
}
