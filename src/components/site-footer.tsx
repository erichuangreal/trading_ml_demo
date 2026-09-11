const STACK = [
  "Python",
  "pandas",
  "scikit-learn",
  "XGBoost",
  "yfinance",
  "SEC EDGAR XBRL",
  "walk-forward validation",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Recharts",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12 sm:px-8">
        <div className="flex flex-wrap gap-1.5">
          {STACK.map((item) => (
            <span
              key={item}
              className="rounded border border-border px-2 py-1 font-mono text-[0.7rem] text-subtle"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-[0.8rem] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>Quantitative ML research project · historical analysis only, not investment advice.</p>
          <p>
            This site renders exported historical results only — the model training code
            lives in a{" "}
            <a
              href="https://github.com/erichuangreal/trading_ml"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent"
            >
              separate repo
            </a>
            .
          </p>
        </div>

        <a
          href="https://github.com/erichuangreal/trading_ml_demo"
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[0.75rem] text-subtle underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent sm:hidden"
        >
          View source →
        </a>
      </div>
    </footer>
  );
}
