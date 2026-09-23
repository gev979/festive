"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

import { cannons, emojiBurst } from "@/lib/confetti";
import { cn, range, seeded } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/experience/i18n";
import type { ChapterProps } from "@/components/experience/types";

const HOLD_MS = 750;
/** After this many early releases, a plain one-tap button appears. */
const PATIENCE = 2;
const RESCUE_AFTER_MS = 6000;

function buzz(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  navigator.vibrate?.(pattern);
}

/**
 * Chapter one. Nothing is given away yet: a sealed parcel addressed to the
 * birthday person, opened by pressing and holding.
 *
 * The ritual only works if it is obvious, so the affordance is deliberately
 * over-communicated — the whole envelope is the press target, a full-width
 * button underneath fills as you hold, and letting go early says so. If someone
 * still has not got in after a few seconds, a plain one-tap button appears.
 */
export function SealChapter({ config, next, playMusic }: ChapterProps) {
  const { t } = useI18n();
  const [progress, setProgress] = React.useState(0);
  const [holding, setHolding] = React.useState(false);
  const [misses, setMisses] = React.useState(0);
  const [rescue, setRescue] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const holdRef = React.useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-11, 11]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [9, -9]), {
    stiffness: 120,
    damping: 18,
  });
  const glareX = useTransform(pointerX, [-1, 1], ["18%", "82%"]);

  // Nobody should ever be stuck on this screen.
  React.useEffect(() => {
    const timer = window.setTimeout(() => setRescue(true), RESCUE_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const complete = React.useCallback(() => {
    setBroken(true);
    setHolding(false);
    setProgress(1);
    buzz([18, 40, 26]);
    playMusic();
    cannons();
    emojiBurst(config.emojis, { origin: { y: 0.5 } });
    window.setTimeout(next, reduceMotion ? 240 : 1150);
  }, [config.emojis, next, playMusic, reduceMotion]);

  const startHold = React.useCallback(() => {
    if (broken || holdRef.current !== null) return;
    buzz(8);
    setHolding(true);
    const start = performance.now();

    const tick = () => {
      const ratio = Math.min(1, (performance.now() - start) / HOLD_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        holdRef.current = null;
        complete();
        return;
      }
      holdRef.current = requestAnimationFrame(tick);
    };

    holdRef.current = requestAnimationFrame(tick);
  }, [broken, complete]);

  const stopHold = React.useCallback(() => {
    if (holdRef.current === null) return;
    cancelAnimationFrame(holdRef.current);
    holdRef.current = null;
    setHolding(false);
    setProgress(0);
    // A short tap is a miss, not a mistake — count it and offer more help.
    setMisses((count) => count + 1);
  }, []);

  React.useEffect(() => {
    return () => {
      if (holdRef.current !== null) cancelAnimationFrame(holdRef.current);
    };
  }, []);

  const showRescue = !broken && (rescue || misses >= PATIENCE);
  const monogram = config.name.trim().charAt(0).toUpperCase() || "★";
  const ring = 2 * Math.PI * 46;

  const holdHandlers = {
    onPointerDown: startHold,
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  };

  const label = broken
    ? t.seal.opening
    : holding
      ? t.seal.holding
      : misses > 0
        ? t.seal.missed
        : t.seal.hold;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center sm:max-w-xl sm:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        <Badge variant="outline" className="gap-2">
          <Sparkles className="size-3" />
          {config.isBirthdayToday ? t.seal.today : t.seal.early}
        </Badge>
      </motion.div>

      <motion.div
        className="relative w-full [perspective:1400px]"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
          pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
        }}
        onPointerLeave={() => {
          pointerX.set(0);
          pointerY.set(0);
        }}
      >
        {/* The entire envelope is the press target, not just the seal. */}
        <motion.div
          role="button"
          tabIndex={-1}
          aria-hidden
          {...holdHandlers}
          style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={
            broken
              ? { opacity: 0, y: -30, scale: 1.06, transition: { delay: 0.55, duration: 0.6 } }
              : { opacity: 1, y: 0, scale: holding ? 0.985 : 1 }
          }
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "glass relative mx-auto flex aspect-4/3 w-full cursor-pointer touch-none flex-col justify-between overflow-hidden rounded-xl p-5 select-none sm:p-8",
            !reduceMotion && !broken && !holding && "animate-float",
          )}
        >
          {/* Envelope flap */}
          <motion.div
            className="absolute inset-x-0 top-0 origin-top"
            animate={broken ? { rotateX: -168 } : { rotateX: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <svg viewBox="0 0 100 26" className="w-full">
              <defs>
                <linearGradient id="flap" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--c1)" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="var(--c3)" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="var(--c2)" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path d="M0 0 H100 L50 25 Z" fill="url(#flap)" />
              <path d="M0 0 H100 L50 25 Z" fill="none" stroke="var(--ink)" strokeOpacity="0.18" />
            </svg>
          </motion.div>

          <motion.span
            className="pointer-events-none absolute -inset-px opacity-45"
            style={{
              background: `radial-gradient(420px circle at ${glareX} 12%, color-mix(in oklab, var(--ink) 26%, transparent), transparent 65%)`,
            }}
          />

          <div className="relative z-10 mt-16 space-y-1 text-left sm:mt-20">
            <p className="font-mono text-[0.6rem] tracking-[0.28em] text-muted-foreground uppercase">
              {t.seal.to}
            </p>
            <p className="font-display text-2xl leading-tight font-semibold text-balance sm:text-3xl">
              {config.name}
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-4 text-left">
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.28em] text-muted-foreground uppercase">
                {t.seal.from}
              </p>
              <p className="mt-1 max-w-[16ch] text-sm leading-snug text-foreground/80">
                {config.from}
              </p>
            </div>

            {/* Wax seal: the visual anchor, ringed by the hold progress */}
            <div className="relative shrink-0">
              {!broken && !holding && !reduceMotion && (
                // A breathing ring rather than a filled ping: it draws the eye
                // without smearing a pale blob across the envelope.
                <motion.span
                  aria-hidden
                  animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute -inset-1 rounded-full border-2 border-[var(--c3)]"
                />
              )}
              <svg
                viewBox="0 0 100 100"
                className="absolute -inset-2 size-[calc(100%+1rem)] -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="color-mix(in oklab, var(--ink) 16%, transparent)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="var(--c2)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={ring}
                  strokeDashoffset={ring * (1 - progress)}
                  className="transition-[stroke-dashoffset] duration-75"
                />
              </svg>

              <motion.div
                animate={
                  broken
                    ? { scale: 1.7, opacity: 0, rotate: 22 }
                    : { scale: 1 + progress * 0.14, opacity: 1 }
                }
                transition={{ duration: broken ? 0.45 : 0.12 }}
                className="relative grid size-20 place-items-center rounded-full bg-[radial-gradient(circle_at_32%_28%,color-mix(in_oklab,var(--c3)_85%,white),var(--c1)_70%)] shadow-[0_10px_30px_-8px_var(--c1)] sm:size-18"
              >
                <span className="font-display text-3xl font-bold text-black/55 mix-blend-overlay sm:text-2xl">
                  {monogram}
                </span>
              </motion.div>

              {/* Wax shards, only once the seal gives way */}
              {broken &&
                !reduceMotion &&
                range(11).map((i) => {
                  const angle = (i / 11) * Math.PI * 2;
                  const distance = 70 + seeded(i + 3) * 90;
                  return (
                    <motion.span
                      key={i}
                      aria-hidden
                      initial={{ x: 36, y: 36, opacity: 1, scale: 1 }}
                      animate={{
                        x: 36 + Math.cos(angle) * distance,
                        y: 36 + Math.sin(angle) * distance + 60,
                        opacity: 0,
                        scale: 0.4,
                        rotate: seeded(i) * 540 - 270,
                      }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="absolute top-0 left-0 size-2.5 rounded-[3px]"
                      style={{ background: i % 2 ? "var(--c3)" : "var(--c1)" }}
                    />
                  );
                })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: broken ? 0 : 1, y: 0 }}
        transition={{ delay: broken ? 0 : 0.65, duration: 0.6 }}
        className="flex w-full flex-col items-center gap-3"
      >
        <p className="max-w-sm text-base leading-relaxed text-foreground/85 text-balance sm:text-lg">
          {config.invitation}
        </p>

        {/* The instruction, as a control rather than a caption. */}
        <motion.button
          type="button"
          {...holdHandlers}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              startHold();
            }
          }}
          onKeyUp={stopHold}
          disabled={broken}
          animate={misses > 0 && !holding ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
          transition={{ duration: 0.36 }}
          className="relative h-14 w-full max-w-xs touch-none overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--c2)_45%,transparent)] bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] text-base font-medium select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-[linear-gradient(100deg,var(--c3),var(--c1),var(--c2))] opacity-90 transition-[width] duration-75"
            style={{ width: `${progress * 100}%` }}
          />
          <span
            className={cn(
              "relative flex items-center justify-center gap-2",
              progress > 0.45 && "text-black/80",
            )}
          >
            {!holding && !broken && (
              <motion.span
                aria-hidden
                animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                👆
              </motion.span>
            )}
            {label}
          </span>
        </motion.button>

        {/* Last resort, so the experience can never be a dead end. */}
        <motion.button
          type="button"
          onClick={complete}
          initial={{ opacity: 0, height: 0 }}
          animate={
            showRescue ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }
          }
          transition={{ duration: 0.4 }}
          className={cn(
            "font-mono text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase underline decoration-dotted underline-offset-4",
            !showRescue && "pointer-events-none",
          )}
        >
          {t.seal.rescue}
        </motion.button>
      </motion.div>

      {/* Bloom flash at the moment the seal breaks */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 bg-[radial-gradient(circle_at_center,var(--ink),transparent_60%)]"
        initial={{ opacity: 0 }}
        animate={broken ? { opacity: [0, 0.75, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9, times: [0, 0.18, 1] }}
      />
    </div>
  );
}
