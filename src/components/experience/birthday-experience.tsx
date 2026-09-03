"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { BirthdayConfig } from "@/lib/config";
import { useMelody } from "@/hooks/use-melody";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Backdrop } from "@/components/experience/backdrop";
import { ChapterRail } from "@/components/experience/chapter-rail";
import { ChapterNav } from "@/components/experience/chapter-nav";
import { SparkleTrail } from "@/components/experience/sparkle-trail";
import { TopControls } from "@/components/experience/top-controls";
import { CHAPTERS, type ChapterProps } from "@/components/experience/types";
import { SealChapter } from "@/components/experience/chapters/seal-chapter";
import { HeroChapter } from "@/components/experience/chapters/hero-chapter";
import { CandlesChapter } from "@/components/experience/chapters/candles-chapter";
import { ReasonsChapter } from "@/components/experience/chapters/reasons-chapter";
import { CosmosChapter } from "@/components/experience/chapters/cosmos-chapter";
import { WishChapter } from "@/components/experience/chapters/wish-chapter";
import { FinaleChapter } from "@/components/experience/chapters/finale-chapter";

const VIEWS: Array<React.ComponentType<ChapterProps>> = [
  SealChapter,
  HeroChapter,
  CandlesChapter,
  ReasonsChapter,
  CosmosChapter,
  WishChapter,
  FinaleChapter,
];

const CONTINUE_LABELS = [
  "", // the seal chapter drives its own transition
  "There is cake",
  "Why you, specifically",
  "Run the numbers",
  "Make a wish",
  "One last thing",
  "", // the finale has nowhere to go
];

const SWIPE_THRESHOLD = 60;

export function BirthdayExperience({ config }: { config: BirthdayConfig }) {
  const [index, setIndex] = React.useState(0);
  const [furthest, setFurthest] = React.useState(0);
  const [gate, setGate] = React.useState<{ blocked: boolean; label?: string }>({
    blocked: false,
  });
  const reduceMotion = useReducedMotion();
  const melody = useMelody(config.music);
  const liveRegionRef = React.useRef<HTMLDivElement>(null);

  const goTo = React.useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(VIEWS.length - 1, target));
      setIndex((current) => {
        if (clamped === current) return current;
        setFurthest((max) => Math.max(max, clamped));
        setGate({ blocked: false });
        return clamped;
      });
    },
    [],
  );

  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);

  const restart = React.useCallback(() => {
    setFurthest(0);
    setGate({ blocked: false });
    setIndex(0);
  }, []);

  // Keyboard navigation makes the whole thing usable without a pointer.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        if (!gate.blocked && index > 0) next();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        prev();
      } else if (event.key === " " && index > 0 && !gate.blocked) {
        event.preventDefault();
        next();
      } else if (event.key === "m" || event.key === "M") {
        melody.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gate.blocked, index, melody, next, prev]);

  // Announce chapter changes for screen readers.
  React.useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Chapter ${index + 1} of ${VIEWS.length}: ${CHAPTERS[index].label}`;
    }
  }, [index]);

  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-no-swipe], input, textarea")) {
      touchStart.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start) return;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && !gate.blocked && index > 0) next();
    if (dx > 0) prev();
  };

  const Chapter = VIEWS[index];
  const continueLabel =
    index === VIEWS.length - 1 ? "" : (gate.label ?? CONTINUE_LABELS[index]);

  return (
    <TooltipProvider>
      <Backdrop />
      <SparkleTrail />

      <main
        className="relative z-10 flex min-h-[100svh] flex-col"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div ref={liveRegionRef} className="sr-only" aria-live="polite" />

        <TopControls
          melody={melody}
          config={config}
          onRestart={restart}
          canRestart={furthest > 0}
        />

        <div className="relative flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={CHAPTERS[index].id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 44, filter: "blur(14px)" }}
              animate={
                reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -34, scale: 0.97, filter: "blur(14px)" }
              }
              transition={{ duration: reduceMotion ? 0.15 : 0.62, ease: [0.22, 1, 0.36, 1] }}
              // Chapters are viewport-sized, but a long one (small phone,
              // large text settings) scrolls inside itself rather than clipping.
              className="flex min-h-[100svh] w-full items-center justify-center overflow-x-hidden overflow-y-auto px-5 pt-30 pb-36 sm:px-8 sm:pt-32 sm:pb-32"
              aria-label={CHAPTERS[index].label}
            >
              <Chapter
                config={config}
                next={next}
                setGate={setGate}
                playMusic={melody.start}
                holdMusicForCapture={melody.holdForCapture}
              />
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Fades behind the fixed bars, so a chapter that runs past them reads
            as "there is more" instead of as a cut-off. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[15] h-24 bg-[linear-gradient(to_bottom,var(--surface),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[15] h-28 bg-[linear-gradient(to_top,var(--surface),transparent)]"
        />

        <ChapterRail index={index} furthest={furthest} onSelect={goTo} />

        {index > 0 && (
          <ChapterNav
            key={`nav-${index}`}
            label={continueLabel}
            blocked={gate.blocked}
            canGoBack={index > 0}
            onNext={next}
            onPrev={prev}
          />
        )}
      </main>
    </TooltipProvider>
  );
}
