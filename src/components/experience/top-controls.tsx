"use client";

import * as React from "react";
import { Check, RotateCcw, Share2, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { BirthdayConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Melody = {
  playing: boolean;
  toggle: () => void;
  available: boolean;
};

export function TopControls({
  melody,
  config,
  onRestart,
  canRestart,
}: {
  melody: Melody;
  config: BirthdayConfig;
  onRestart: () => void;
  canRestart: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const [musicHint, setMusicHint] = React.useState(false);
  const hintShown = React.useRef(false);

  // The song starts on its own, so say so once — otherwise the only clue that
  // it can be silenced is an icon nobody was looking for.
  React.useEffect(() => {
    if (!melody.playing || hintShown.current) return;
    hintShown.current = true;
    const show = window.setTimeout(() => setMusicHint(true), 400);
    const hide = window.setTimeout(() => setMusicHint(false), 5200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [melody.playing]);

  const share = async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    const payload = {
      title: `Happy birthday, ${config.name}`,
      text: `A little something for ${config.nickname} 🎂`,
      url,
    };

    const canShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    try {
      if (canShare) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Share sheet dismissed or clipboard blocked — nothing worth surfacing.
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="glass flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--c2)] opacity-70" />
          <span className="relative inline-flex size-2 rounded-full bg-[var(--c2)]" />
        </span>
        <span className="font-mono text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
          for {config.nickname}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex items-center gap-1.5"
      >
        <AnimatePresence>
          {canRestart && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRestart}
                    className="glass"
                    aria-label="Start the experience over"
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Start over</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={share}
              className="glass"
              aria-label="Share this page"
            >
              {copied ? <Check className="text-[var(--c2)]" /> : <Share2 />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{copied ? "Link copied" : "Share"}</TooltipContent>
        </Tooltip>

        {melody.available && (
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={melody.toggle}
                  className="glass relative"
                  aria-label={melody.playing ? "Mute the music box" : "Play the music box"}
                  aria-pressed={melody.playing}
                >
                  {melody.playing ? <Volume2 className="text-[var(--c2)]" /> : <VolumeX />}
                  {musicHint && (
                    <span
                      aria-hidden
                      className="absolute -inset-0.5 animate-ping rounded-full border border-[var(--c2)]"
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {melody.playing ? "Mute (M)" : "Music box (M)"}
              </TooltipContent>
            </Tooltip>

            <AnimatePresence>
              {musicHint && (
                <motion.span
                  initial={{ opacity: 0, y: -6, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.94 }}
                  className="glass pointer-events-none absolute top-24 right-0 z-40 rounded-full px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.16em] whitespace-nowrap text-muted-foreground uppercase"
                >
                  ♪ tap to mute
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </header>
  );
}
