"use client";

import * as React from "react";
import {
  CalendarHeart,
  Clock,
  Globe2,
  HeartPulse,
  Moon,
  Orbit,
  Rocket,
  Sunrise,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";

import type { Locale } from "@/i18n/config";
import { fill, plural, type Plural } from "@/i18n/format";
import type { BirthdayConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accented } from "@/components/experience/accented";
import { AnimatedNumber, COMPACT_FROM } from "@/components/experience/animated-number";
import { useI18n } from "@/components/experience/i18n";
import type { ChapterProps } from "@/components/experience/types";

type StatId =
  | "sunrises"
  | "heartbeats"
  | "moons"
  | "distance"
  | "orbits"
  | "countdown"
  | "hours"
  | "breaths";

type Stat = {
  id: StatId;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
};

/** Rounded-but-honest rates, each labelled so nothing reads as a hard fact. */
const HEARTBEATS_PER_DAY = 72 * 60 * 24;
const BREATHS_PER_DAY = 16 * 60 * 24;
const LUNAR_CYCLE_DAYS = 29.53;
/** Earth's orbital speed, 29.78 km/s, turned into km per day. */
const KM_PER_DAY = 29.78 * 86_400;
/** Without a birth date there is no lifetime to count, so the ledger counts one year. */
const DAYS_IN_A_YEAR = 365;

function buildStats(config: BirthdayConfig): Stat[] {
  const { daysAlive, age, daysUntilBirthday, isBirthdayToday } = config;
  const days = daysAlive ?? DAYS_IN_A_YEAR;

  const stats: Stat[] = [
    { id: "sunrises", icon: Sunrise, value: days },
    { id: "heartbeats", icon: HeartPulse, value: Math.round(days * HEARTBEATS_PER_DAY) },
    { id: "moons", icon: Moon, value: Math.round(days / LUNAR_CYCLE_DAYS) },
    { id: "distance", icon: Rocket, value: Math.round((days * KM_PER_DAY) / 1_000_000) },
  ];

  if (daysAlive === null) {
    stats.push({ id: "hours", icon: Clock, value: DAYS_IN_A_YEAR * 24 });
  } else {
    if (age !== null) stats.push({ id: "orbits", icon: Orbit, value: age });
    if (daysUntilBirthday !== null && !isBirthdayToday) {
      stats.push({ id: "countdown", icon: CalendarHeart, value: daysUntilBirthday });
    }
  }

  stats.push({ id: "breaths", icon: Wind, value: Math.round(days * BREATHS_PER_DAY) });

  // Six fills the 3×2 grid exactly and keeps the chapter inside one viewport.
  return stats.slice(0, 6);
}

/**
 * Units agree with the number above them. A compacted count ("37.8M") reads as
 * "million …", which takes the many-form in languages that have one — Russian
 * says "млн ударов", never "млн удара".
 */
function unitFor(locale: Locale, value: number, forms: Plural): string {
  if (value >= COMPACT_FROM && typeof forms !== "string") return forms.many ?? forms.other;
  return plural(locale, value, forms);
}

/**
 * Chapter five: the celebrant, in numbers. Everything here is derived from the
 * configured birth date — with no date set the chapter shows what one ordinary
 * year adds up to instead.
 */
export function CosmosChapter({ config }: ChapterProps) {
  const { locale, t } = useI18n();
  const stats = React.useMemo(() => buildStats(config), [config]);
  const title =
    config.daysAlive === null || config.age === null
      ? t.cosmos.titleYear
      : fill(plural(locale, config.age, t.cosmos.title), { n: config.age });

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-8">
      <div className="space-y-3 text-center">
        <Badge variant="outline" className="gap-2">
          <Globe2 className="size-3" />
          {t.cosmos.badge}
        </Badge>
        <h2 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-5xl">
          <Accented text={title} />
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t.cosmos.subtitle}
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
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
                {unitFor(locale, stat.value, t.cosmos[stat.id].unit)}
              </p>
              <p className="hidden text-sm leading-relaxed text-muted-foreground text-pretty sm:block">
                {t.cosmos[stat.id].caption}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
