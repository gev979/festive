"use client";

import { motion, useReducedMotion } from "motion/react";

import { range, seeded } from "@/lib/utils";

const COLORS = ["var(--c1)", "var(--c2)", "var(--c3)"];

/**
 * Balloons that drift up through the whole viewport behind the chapter content.
 * Positions come from a seeded pseudo-random so server and client markup match.
 */
export function Balloons({ count = 9 }: { count?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {range(count).map((i) => {
        const left = seeded(i + 1) * 100;
        const size = 42 + seeded(i + 7) * 46;
        const duration = 15 + seeded(i + 13) * 12;
        const delay = seeded(i + 21) * 10;
        const color = COLORS[i % COLORS.length];
        const sway = 24 + seeded(i + 31) * 40;

        return (
          <motion.div
            key={i}
            className="absolute bottom-[-22vh]"
            style={{ left: `${left}%` }}
            initial={{ y: 0, x: 0 }}
            animate={{
              y: ["0vh", "-130vh"],
              x: [0, sway, -sway * 0.7, sway * 0.4, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          >
            <svg
              width={size}
              height={size * 1.55}
              viewBox="0 0 60 93"
              style={{ opacity: 0.42 + seeded(i + 41) * 0.3 }}
            >
              <defs>
                <radialGradient id={`balloon-${i}`} cx="34%" cy="28%" r="72%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.75" />
                  <stop offset="42%" stopColor={color} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.55" />
                </radialGradient>
              </defs>
              <ellipse cx="30" cy="32" rx="26" ry="31" fill={`url(#balloon-${i})`} />
              <path d="M30 63 l-5 7 h10 z" fill={color} opacity="0.85" />
              <path
                d="M30 70 q7 10 0 20 q-7 10 0 3"
                fill="none"
                stroke="var(--ink)"
                strokeOpacity="0.28"
                strokeWidth="1.1"
              />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}
