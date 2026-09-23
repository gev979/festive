"use client";

import * as React from "react";
import { Hand, Quote } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

import { fill } from "@/i18n/format";
import { popAt } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accented } from "@/components/experience/accented";
import { useI18n } from "@/components/experience/i18n";
import type { ChapterProps } from "@/components/experience/types";

const FLICK_DISTANCE = 110;

/**
 * Chapter four: a deck of reasons, one card at a time. Flick the top card away
 * (or press the button) and it rotates to the back of the stack, so the deck
 * never runs out and nobody is forced to read all of it.
 */
export function ReasonsChapter({ config }: ChapterProps) {
  const { t } = useI18n();
  const cards = config.highlights;
  const [order, setOrder] = React.useState(() => cards.map((_, i) => i));
  const [seen, setSeen] = React.useState(1);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-16, 16]);
  const opacity = useTransform(x, [-260, -60, 0, 60, 260], [0, 1, 1, 1, 0]);

  const advance = React.useCallback(
    (origin?: { x: number; y: number }) => {
      if (cards.length < 2) return;
      if (origin) popAt(origin.x, origin.y, { particleCount: 14, scalar: 0.5 });
      x.set(0);
      setOrder((current) => [...current.slice(1), current[0]]);
      setSeen((count) => Math.min(count + 1, cards.length));
    },
    [cards.length, x],
  );

  const activeIndex = order[0];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8">
      <div className="space-y-3 text-center">
        <Badge variant="outline" className="gap-2">
          <Quote className="size-3" />
          {t.reasons.badge}
        </Badge>
        <h2 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-5xl">
          <Accented text={t.reasons.title} />
        </h2>
      </div>

      <div data-no-swipe className="relative h-64 w-full max-w-md sm:h-60">
        {order
          .slice(0, 3)
          .map((cardIndex, stackPos) => {
            const card = cards[cardIndex];
            const isTop = stackPos === 0;

            return (
              <motion.div
                key={cardIndex}
                className={cn(
                  // The glass panels are translucent, so only the top card
                  // renders its text — otherwise the stack reads as a smudge.
                  "glass absolute inset-x-0 top-0 flex h-full flex-col justify-center gap-3 rounded-xl bg-[color-mix(in_oklab,var(--surface-soft)_78%,transparent)] p-7 text-left sm:p-9",
                  isTop ? "z-30 cursor-grab active:cursor-grabbing" : "z-10 select-none",
                )}
                onClick={isTop ? () => advance() : undefined}
                style={isTop ? { x, rotate, opacity } : undefined}
                drag={isTop && !reduceMotion ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.75}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > FLICK_DISTANCE) {
                    advance({ x: info.point.x, y: info.point.y });
                  } else {
                    x.set(0);
                  }
                }}
                initial={{ scale: 0.9, y: 26, opacity: 0 }}
                animate={{
                  scale: 1 - stackPos * 0.05,
                  y: stackPos * 14,
                  opacity: 1 - stackPos * 0.28,
                  rotate: isTop ? 0 : stackPos === 1 ? 2.5 : -2.5,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {isTop && (
                  <>
                    <span
                      aria-hidden
                      className="font-display text-5xl leading-none text-[var(--c2)]/40"
                    >
                      {t.quotes[0]}
                    </span>
                    {card.title && (
                      <h3 className="font-display text-xl leading-tight font-semibold sm:text-2xl">
                        {card.title}
                      </h3>
                    )}
                    <p className="text-base leading-relaxed text-foreground/80 text-pretty">
                      {card.body}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
      </div>

      <div className="flex flex-col items-center gap-3">
        {cards.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => advance()}
            className="hidden gap-2 sm:inline-flex"
          >
            <Hand className="size-3.5" />
            {t.reasons.next}
          </Button>
        )}
        <div className="flex items-center gap-1.5">
          {cards.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === activeIndex ? "bg-[var(--c2)]" : "bg-foreground/20",
              )}
            />
          ))}
        </div>
        <p className="font-mono text-[0.6rem] tracking-[0.22em] text-muted-foreground uppercase">
          {fill(t.reasons.progress, { seen, total: cards.length })}
        </p>
      </div>
    </div>
  );
}
