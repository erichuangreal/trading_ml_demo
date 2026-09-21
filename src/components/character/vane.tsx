"use client";

import { motion, useReducedMotion } from "framer-motion";

export type VaneState = "idle" | "alert" | "travel" | "resting";

/**
 * Vane: a small amber compass-needle character built from the same tick
 * primitive as the symbol glyph set (see icons/glyphs.tsx). It seeks and
 * points at signal: idle sweep by default, snaps to point when something
 * ranks first, travels along the pipeline diagram, and rests during dense
 * reading. Purely decorative, aria-hidden throughout; everything it points
 * at already exists as real text/ARIA elsewhere.
 */
export function Vane({
  state = "idle",
  angle = 0,
  size = 40,
  className = "",
}: {
  state?: VaneState;
  /** Target angle in degrees for "alert" state; 0 = pointing straight up. */
  angle?: number;
  size?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  const glowOpacity = state === "resting" ? 0.18 : state === "alert" ? 0.55 : 0.32;
  const needleOpacity = state === "resting" ? 0.5 : 1;

  const rotateAnimate = prefersReducedMotion
    ? { rotate: state === "alert" ? angle : 0 }
    : state === "alert"
      ? { rotate: [angle - 8, angle + 3, angle] }
      : state === "resting"
        ? { rotate: [-3, 3, -3] }
        : { rotate: [-12, 12, -12] };

  const rotateTransition = prefersReducedMotion
    ? { duration: 0.2 }
    : state === "alert"
      ? { duration: 0.6, ease: [0.34, 1.4, 0.64, 1] as const }
      : state === "resting"
        ? { duration: 6, repeat: Infinity, ease: "easeInOut" as const }
        : { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {state === "travel" ? (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
            transform: "translateX(-45%) scale(0.85)",
            opacity: 0.4,
          }}
        />
      ) : null}

      {state === "idle" || state === "alert" ? (
        <motion.svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          animate={
            prefersReducedMotion
              ? { opacity: 0.25, rotate: 0 }
              : { opacity: [0.15, 0.4, 0.15], rotate: [0, 360] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : { duration: 9, repeat: Infinity, ease: "linear" }
          }
        >
          <circle cx="20" cy="20" r="17" stroke="var(--color-accent)" strokeWidth="0.75" strokeDasharray="2 8" />
        </motion.svg>
      ) : null}

      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 68%)" }}
        animate={{ opacity: glowOpacity }}
        transition={{ duration: 0.5 }}
      />

      <motion.svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 18 18"
        fill="none"
        animate={rotateAnimate}
        transition={rotateTransition}
        style={{ opacity: needleOpacity }}
      >
        <path d="M9 1.5L11.4 9 9 16.5 6.6 9z" fill="var(--color-accent)" />
        <circle cx="9" cy="9" r="1.4" fill="var(--color-accent-foreground)" />
        <circle cx="9" cy="9" r="2.4" stroke="var(--color-accent)" strokeWidth="0.8" opacity="0.5" />
      </motion.svg>
    </div>
  );
}
