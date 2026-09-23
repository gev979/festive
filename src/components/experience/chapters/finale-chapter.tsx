"use client";

import * as React from "react";
import { PartyPopper, ScrollText } from "lucide-react";
import { motion } from "motion/react";

import { emojiBurst, fireworks, glitterFall, popAt } from "@/lib/confetti";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/components/experience/i18n";
import type { ChapterProps } from "@/components/experience/types";

/**
 * Chapter seven: the actual letter, under sustained fireworks. Tapping anywhere
 * on this chapter throws the configured emoji, which is where most people end
 * up spending an extra minute.
 */
export function FinaleChapter({ config }: ChapterProps) {
  const { t } = useI18n();

  React.useEffect(() => {
    const stop = fireworks(4600);
    glitterFall(9000);
    const t = window.setTimeout(() => emojiBurst(config.emojis, { particleCount: 34 }), 900);
    return () => {
      stop();
      window.clearTimeout(t);
    };
  }, [config.emojis]);

  const onTap = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("button, a, textarea, input")) return;
    popAt(event.clientX, event.clientY, { particleCount: 22, scalar: 0.7 });
  };

  return (
    <div
      onPointerDown={onTap}
      className="flex w-full max-w-2xl cursor-crosshair flex-col items-center gap-5 text-center sm:gap-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Badge variant="accent" className="gap-2">
          <PartyPopper className="size-3" />
          {t.finale.badge}
        </Badge>
      </motion.div>

      <div className="space-y-4 sm:space-y-5">
        {config.message.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.25 + i * 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-lg leading-snug text-balance sm:text-3xl"
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4 + config.message.length * 0.45, duration: 0.8 }}
        className="h-px w-32 bg-[linear-gradient(90deg,transparent,var(--c2),transparent)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 + config.message.length * 0.45, duration: 0.8 }}
        className="flex flex-col items-center gap-4 sm:gap-6"
      >
        <div className="space-y-1">
          <p className="font-mono text-[0.6rem] tracking-[0.28em] text-muted-foreground uppercase">
            {t.finale.signoff}
          </p>
          <p className="font-display text-2xl font-semibold text-[var(--c3)] sm:text-3xl">
            {config.from}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="glow"
            onClick={() => emojiBurst(config.emojis, { particleCount: 44, spread: 150 })}
            className="gap-2"
          >
            <PartyPopper className="size-4" />
            {t.finale.again}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ScrollText className="size-4" />
                {t.finale.finePrint}
              </Button>
            </DialogTrigger>
            <DialogContent closeLabel={t.finale.close}>
              <DialogHeader>
                <DialogTitle>{t.finale.termsTitle}</DialogTitle>
                <DialogDescription>{t.finale.termsNote}</DialogDescription>
              </DialogHeader>
              <ol className="space-y-3 text-left text-sm leading-relaxed text-foreground/85">
                {t.finale.terms.map((term, i) => (
                  <li key={i}>
                    <span className="font-mono text-[var(--c2)]">
                      {String(i + 1).padStart(2, "0")} ·
                    </span>{" "}
                    {term}
                  </li>
                ))}
              </ol>
            </DialogContent>
          </Dialog>
        </div>

        <p className="font-mono text-[0.6rem] tracking-[0.22em] text-muted-foreground/80 uppercase">
          {t.finale.tapHint}
        </p>
      </motion.div>
    </div>
  );
}
