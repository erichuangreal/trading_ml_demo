import type { ReactNode } from "react";

export function Section({
  id,
  className = "",
  children,
  divider = true,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  divider?: boolean;
}) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-5xl px-6 py-20 sm:px-8 md:py-28 ${
        divider ? "border-t border-border" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  lede,
}: {
  title: string;
  lede?: ReactNode;
}) {
  return (
    <div className="mb-10 max-w-2xl md:mb-14">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{lede}</p>
      ) : null}
    </div>
  );
}
