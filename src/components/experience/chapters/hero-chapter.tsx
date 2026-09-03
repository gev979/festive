"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { burst, emojiBurst } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Balloons } from "@/components/experience/balloons";
import type { ChapterProps } from "@/components/experience/types";

/**
 * Splits into words, then characters, so wrapping never breaks mid-word. Each
 * glyph carries its position in the whole name, which drives the stagger.
 */
function letters(name: string) {
  let position = 0;
  return name.split(" ").map((word) => ({
    word,
    chars: Array.from(word).map((char) => ({ char, position: position++ })),
  }));
}

/**
 * Chapter two: the payoff. The name arrives one letter at a time, flipping in
 * from below with a shimmer running through it, over rising balloons.
 */
export function HeroChapter({ config }: ChapterProps) {
  const reduceMotion = useReducedMotion();
  const words = React.useMemo(() => letters(config.name), [config.name]);

  React.useEffect(() => {
    const t1 = window.setTimeout(() => burst({ particleCount: 130, spread: 100 }), 180);
    const t2 = window.setTimeout(() => emojiBurst(config.emojis), 720);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [config.emojis]);

  return (
    <>
      <Balloons />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-7 text-center">
        {config.photoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative", !reduceMotion && "animate-float")}
          >
            <span
              aria-hidden
              className="absolute -inset-3 rounded-full bg-[conic-gradient(from_0deg,var(--c1),var(--c2),var(--c3),var(--c1))] opacity-70 blur-md"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary env-supplied URL, optimization is off project-wide */}
            <img
              src={config.photoUrl}
              alt={config.name}
              className="relative size-28 rounded-full object-cover shadow-2xl ring-2 ring-white/25 sm:size-32"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <Badge variant="accent">
            {config.isBirthdayToday ? "It is officially today" : "Consider this a warm-up"}
          </Badge>
        </motion.div>

        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 scale-110 bg-[radial-gradient(ellipse_at_center,var(--c1),transparent_62%)] opacity-40 blur-3xl"
          />

          <p className="font-mono text-xs tracking-[0.42em] text-muted-foreground uppercase sm:text-sm">
            happy birthday
          </p>

          {/* The clamp lives on the h1 so the inter-word gap scales with it. */}
          <h1 className="mt-3 flex flex-wrap justify-center gap-x-[0.26em] font-display text-[clamp(2.9rem,13vw,7.5rem)] leading-[0.94] font-semibold tracking-[-0.02em] [perspective:900px]">
            <span className="sr-only">{config.name}</span>
            {words.map(({ word, chars }, wordIdx) => (
              <span key={`${word}-${wordIdx}`} className="flex" aria-hidden>
                {chars.map(({ char, position }) => {
                  const delay = 0.22 + position * 0.045;
                  return (
                    <motion.span
                      key={`${char}-${position}`}
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: "0.5em", rotateX: 92, filter: "blur(10px)" }
                      }
                      animate={
                        reduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }
                      }
                      transition={{
                        delay: reduceMotion ? 0 : delay,
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="text-gradient inline-block"
                      style={{ transformOrigin: "50% 100%" }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 + config.name.length * 0.03, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          {config.birthdayNumber !== null ? (
            <p className="text-lg text-foreground/85 sm:text-xl">
              Lap{" "}
              <span className="font-display text-2xl font-semibold text-[var(--c2)] sm:text-3xl">
                {config.birthdayNumber}
              </span>{" "}
              around the sun, and you are still the most interesting thing in orbit.
            </p>
          ) : (
            <p className="text-lg text-foreground/85 sm:text-xl">
              Another lap around the sun, and you are still the most interesting thing in
              orbit.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {config.ordinalBirthday && (
              <Badge variant="outline">{config.ordinalBirthday} birthday</Badge>
            )}
            {config.zodiac && (
              <Badge variant="outline">
                {config.zodiac.symbol} {config.zodiac.sign}
              </Badge>
            )}
            {config.weekdayBorn && (
              <Badge variant="outline">born on a {config.weekdayBorn}</Badge>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
