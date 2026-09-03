"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts up to `value` when it scrolls into view. Big numbers get a thousands
 * separator so "13,240 days" stays readable at a glance.
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

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Past a million the exact digits stop meaning anything and start
    // overflowing the tile, so those counters land on "1.13B" instead.
    const compact = Math.abs(value) >= 1_000_000;
    const format = (n: number) =>
      compact
        ? Math.round(n).toLocaleString("en-US", {
            notation: "compact",
            maximumFractionDigits: 2,
          })
        : Math.round(n).toLocaleString("en-US");

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
  }, [delay, duration, inView, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
