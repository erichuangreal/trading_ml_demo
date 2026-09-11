"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-start justify-center px-6">
      <h1 className="text-xl font-semibold text-foreground">Something broke on this page</h1>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
        A rendering error interrupted the page rather than the data or the model results
        behind it. Reloading usually clears it.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 border border-accent px-3 py-1.5 font-mono text-[0.8rem] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Try again
      </button>
    </div>
  );
}
