"use client";

import * as React from "react";
import { Check, Send, Sparkle, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { fill } from "@/i18n/format";
import { burst } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { useStoredWish } from "@/hooks/use-stored-wish";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Accented } from "@/components/experience/accented";
import { useI18n } from "@/components/experience/i18n";
import type { ChapterProps } from "@/components/experience/types";

/**
 * Chapter six: the visitor's turn. Whatever gets typed is launched as a
 * shooting star and kept in localStorage, so reopening the page on the same
 * device shows the wish still safe rather than an empty box.
 */
export function WishChapter({ config, setGate }: ChapterProps) {
  const { t } = useI18n();
  const [draft, setDraft] = React.useState("");
  const [sent, setSent] = useStoredWish();
  const [launching, setLaunching] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    setGate({ blocked: false, label: sent ? t.continue.wish : t.wish.skip });
  }, [sent, setGate, t]);

  const send = () => {
    const wish = draft.trim();
    if (!wish) return;

    setLaunching(true);

    window.setTimeout(
      () => {
        setSent(wish);
        setLaunching(false);
        setDraft("");
        burst({ particleCount: 60, spread: 90, origin: { y: 0.4 } });
      },
      reduceMotion ? 120 : 1150,
    );
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div className="space-y-4 sm:space-y-5">
        <Badge variant="outline" className="gap-2">
          <Sparkle className="size-3" />
          {t.wish.badge}
        </Badge>
        <h2 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-4xl">
          <Accented text={t.wish.title} />
        </h2>

        <ul className="space-y-2 sm:space-y-2.5">
          {config.wishes.map((wish, i) => (
            <motion.li
              key={wish}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.09, duration: 0.55 }}
              className={cn(
                "flex items-start gap-3 text-sm leading-relaxed text-foreground/85 sm:text-base",
                i >= 4 && "hidden sm:flex",
              )}
            >
              <Star className="mt-1 size-4 shrink-0 fill-[var(--c3)] text-[var(--c3)]" />
              <span className="text-pretty">{wish}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <Card className="relative order-first overflow-hidden p-5 sm:p-6 lg:order-none">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sealed"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[var(--c2)]">
                <Check className="size-4" />
                <span className="font-mono text-[0.62rem] tracking-[0.24em] uppercase">
                  {t.wish.sent}
                </span>
              </div>
              <blockquote className="font-display text-xl leading-snug text-balance sm:text-2xl">
                {t.quotes[0]}
                {sent}
                {t.quotes[1]}
              </blockquote>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.wish.sentNote}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSent(null)}
              >
                {t.wish.rewrite}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="compose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h3 className="font-display text-xl font-semibold">
                  {fill(t.wish.compose, { name: config.nickname })}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t.wish.hint}</p>
              </div>

              <motion.div
                animate={
                  launching && !reduceMotion
                    ? { x: 340, y: -280, scale: 0.15, opacity: 0, rotate: 24 }
                    : { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }
                }
                transition={{ duration: 1, ease: [0.32, 0, 0.67, 0] }}
              >
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, 180))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send();
                    }
                  }}
                  className="min-h-20 sm:min-h-24"
                  placeholder={t.wish.placeholder}
                  aria-label={t.wish.label}
                  disabled={launching}
                />
              </motion.div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
                  {draft.length}/180
                </span>
                <Button
                  variant="glow"
                  onClick={send}
                  disabled={!draft.trim() || launching}
                  className="gap-2"
                >
                  <Send className="size-4" />
                  {launching ? t.wish.sending : t.wish.send}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak that trails the wish as it leaves the card */}
        <AnimatePresence>
          {launching && !reduceMotion && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: [0, 1, 0], scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 h-[2px] w-3/4 origin-left -rotate-[38deg] bg-[linear-gradient(90deg,transparent,var(--c3),transparent)]"
            />
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
