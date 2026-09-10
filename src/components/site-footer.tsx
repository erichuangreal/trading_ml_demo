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
            Model research and training implementation kept private; this site presents
            exported historical results only.
          </p>
        </div>
      </div>
    </footer>
  );
}
