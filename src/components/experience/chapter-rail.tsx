"use client";

import { motion } from "motion/react";

import { fill } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/experience/i18n";
import { CHAPTERS } from "@/components/experience/types";

/**
 * The stepper. It sits under the header on every screen size and says three
 * things plainly: which chapter this is, what it is called, and how many are
 * left. Segments already visited are tappable to jump back.
 *
 * An earlier version was a column of unlabelled dots — it read as decoration,
 * so nobody realised it was navigation.
 */
export function ChapterRail({
  index,
  furthest,
  onSelect,
}: {
  index: number;
  furthest: number;
  onSelect: (target: number) => void;
}) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t.nav.rail}
      className="pointer-events-none fixed inset-x-0 top-16 z-20 flex flex-col items-center gap-2 px-4 sm:top-20"
    >
      <div className="pointer-events-auto flex items-center gap-1.5">
        {CHAPTERS.map((chapter, i) => {
          const reached = i <= furthest;
          const active = i === index;
          return (
            <button
              key={chapter}
              type="button"
              disabled={!reached}
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              aria-label={
                reached
                  ? fill(t.nav.goTo, { n: i + 1, label: t.chapters[chapter] })
                  : fill(t.nav.locked, { n: i + 1 })
              }
              className="group -my-2 py-2 disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "block h-1 rounded-full transition-all duration-500",
                  active
                    ? "w-8 bg-[linear-gradient(90deg,var(--c1),var(--c2))] shadow-[0_0_12px_var(--c2)]"
                    : reached
                      ? "w-4 bg-foreground/45 group-hover:bg-foreground/80"
                      : "w-4 bg-foreground/15",
                )}
              />
            </button>
          );
        })}
      </div>

      <motion.p
        key={index}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-mono text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase"
      >
        {fill(t.nav.position, {
          label: t.chapters[CHAPTERS[index]],
          n: index + 1,
          total: CHAPTERS.length,
        })}
      </motion.p>
    </nav>
  );
}
