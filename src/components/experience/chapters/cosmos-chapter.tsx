"use client";

import * as React from "react";
import {
  CalendarHeart,
  Globe2,
  HeartPulse,
  Moon,
  Orbit,
  Rocket,
  Sunrise,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";

import type { BirthdayConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/experience/animated-number";
import type { ChapterProps } from "@/components/experience/types";

type Stat = {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  unit: string;
  caption: string;
};

/** Rounded-but-honest rates, each labelled so nothing reads as a hard fact. */
const HEARTBEATS_PER_DAY = 72 * 60 * 24;
const BREATHS_PER_DAY = 16 * 60 * 24;
const LUNAR_CYCLE_DAYS = 29.53;
/** Earth's orbital speed, 29.78 km/s, turned into km per day. */
const KM_PER_DAY = 29.78 * 86_400;

function buildStats(config: BirthdayConfig): Stat[] {
  const { daysAlive, age, daysUntilBirthday, isBirthdayToday } = config;
  const stats: Stat[] = [];

  if (daysAlive !== null) {
    stats.push({
      icon: Sunrise,
      value: daysAlive,
      unit: "sunrises",
      caption: "and not one of them looked quite like the others",
    });
    stats.push({
      icon: HeartPulse,
      value: Math.round(daysAlive * HEARTBEATS_PER_DAY),
      unit: "heartbeats",
      caption: "roughly — your heart has been extremely reliable about this",
    });
    stats.push({
      icon: Moon,
      value: Math.round(daysAlive / LUNAR_CYCLE_DAYS),
      unit: "full moons",
      caption: "somebody should have pointed more of them out to you",
    });
    stats.push({
      icon: Rocket,
      value: Math.round((daysAlive * KM_PER_DAY) / 1_000_000),
      unit: "million km flown",
      caption: "Earth has been carrying you around the sun this whole time",
    });
  }

  if (age !== null) {
    stats.push({
      icon: Orbit,
      value: age,
      unit: "orbits completed",
      caption: "a full lap of the sun, every single one of them",
    });
  }

  if (daysUntilBirthday !== null && !isBirthdayToday) {
    stats.push({
      icon: CalendarHeart,
      value: daysUntilBirthday,
      unit: "days to the next one",
      caption: "consider this a very early start",
    });
  }

  if (daysAlive !== null) {
    stats.push({
      icon: Wind,
      value: Math.round(daysAlive * BREATHS_PER_DAY),
      unit: "breaths",
      caption: "the next one is on the house",
    });
  }

  // Six fills the 3×2 grid exactly and keeps the chapter inside one viewport.
  return stats.slice(0, 6);
}

/**
 * Chapter five: the celebrant, in numbers. Everything here is derived from the
 * configured birth date — with no date set the chapter degrades to a single
 * honest panel rather than showing zeroes.
 */
export function CosmosChapter({ config }: ChapterProps) {
  const stats = React.useMemo(() => buildStats(config), [config]);

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-8">
      <div className="space-y-3 text-center">
        <Badge variant="outline" className="gap-2">
          <Globe2 className="size-3" />
          the ledger
        </Badge>
        <h2 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-5xl">
          What{" "}
          <span className="text-gradient">{config.age ?? "a few"}</span>{" "}
          {typeof config.age === "number" ? "years" : "years"} actually looks like
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          Approximate, affectionate, and all yours.
        </p>
      </div>

      {stats.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.unit}
              // Six tiles need a third row a phone does not have, so the last
              // two are desktop-only.
              className={i >= 4 ? "hidden sm:block" : undefined}
              initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.1 + i * 0.09, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="group h-full gap-2 p-4 transition-transform duration-500 hover:-translate-y-1 sm:gap-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className="size-5 text-[var(--c2)]" />
                  <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-mono text-xl leading-none font-semibold tracking-tight sm:text-4xl">
                  <AnimatedNumber value={stat.value} delay={0.2 + i * 0.09} />
                </p>
                <p className="font-display text-sm font-semibold text-[var(--c3)] sm:text-base">
                  {stat.unit}
                </p>
                <p className="hidden text-sm leading-relaxed text-muted-foreground text-pretty sm:block">
                  {stat.caption}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="max-w-lg text-center">
          <p className="text-base leading-relaxed text-foreground/85">
            Set <code className="font-mono text-[var(--c2)]">birthDate</code> in{" "}
            <code className="font-mono text-[var(--c2)]">src/celebration.config.ts</code>{" "}
            and this chapter fills up with sunrises, heartbeats, full moons and the
            distance {config.nickname} has travelled through space.
          </p>
        </Card>
      )}
    </div>
  );
}
