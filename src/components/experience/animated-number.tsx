"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

import { useI18n } from "@/components/experience/i18n";

/**
 * Past a million the exact digits stop meaning anything and start overflowing
 * the tile, so from here on counters land on "1.13B" instead.
 */
export const COMPACT_FROM = 1_000_000;

/**
 * Counts up to `value` when it scrolls into view. Big numbers get the
 * language's thousands separator so "13,240 days" stays readable at a glance.
 */
export function AnimatedNumber({
  value,
  duration = 1.9,
  delay = 0,
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const { locale } = useI18n();

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const compact = Math.abs(value) >= COMPACT_FROM;
    const format = (n: number) =>
      compact
        ? Math.round(n).toLocaleString(locale, {
            notation: "compact",
            maximumFractionDigits: 2,
          })
        : Math.round(n).toLocaleString(locale);

    if (reduceMotion || !inView) {
      if (reduceMotion) node.textContent = format(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });

    return () => controls.stop();
  }, [delay, duration, inView, locale, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
