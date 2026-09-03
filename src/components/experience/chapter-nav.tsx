"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

/**
 * The bottom bar: the one thing to press to go forward, an explicit way back,
 * and a hint about the gesture. On phones the forward button is wide enough to
 * be the obvious target with a thumb.
 */
export function ChapterNav({
  label,
  blocked,
  canGoBack,
  onNext,
  onPrev,
}: {
  label: string;
  blocked: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: blocked ? 0 : 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 px-5 sm:bottom-9"
    >
      <div className="flex w-full max-w-md items-center gap-2">
        {canGoBack && (
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            aria-label="Back to the previous chapter"
            className="glass size-12 shrink-0 sm:size-11"
          >
            <ArrowLeft />
          </Button>
        )}

        {!label ? null : blocked ? (
          <span className="glass flex h-12 flex-1 items-center justify-center rounded-full px-5 text-center text-xs leading-tight text-muted-foreground sm:h-11">
            {label}
          </span>
        ) : (
          <Button
            variant="glow"
            onClick={onNext}
            className="group relative h-12 flex-1 text-base sm:h-11"
          >
            <span className="relative z-10">{label}</span>
            <ArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            {/* Light sweep so it reads as the live target. */}
            <span
              aria-hidden
              className="animate-sheen absolute inset-y-0 -left-1/2 w-1/2 bg-white/25 blur-md"
            />
          </Button>
        )}
      </div>

      {/* On the last chapter there is nothing forward to promise. */}
      <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground/70 uppercase">
        {label ? (
          <>
            <span className="hidden sm:inline">or use ← → keys</span>
            <span className="sm:hidden">or swipe left and right</span>
          </>
        ) : (
          "that is the whole thing"
        )}
      </span>
    </motion.div>
  );
}
