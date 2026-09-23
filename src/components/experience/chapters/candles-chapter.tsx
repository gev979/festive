"use client";

import * as React from "react";
import { Mic, MicOff, Wind } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { fill, plural } from "@/i18n/format";
import { burst, cannons, popAt } from "@/lib/confetti";
import { cn, range } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accented } from "@/components/experience/accented";
import { useI18n } from "@/components/experience/i18n";
import type { ChapterProps } from "@/components/experience/types";

type MicState =
  | "idle"
  | "listening"
  | "denied"
  | "unavailable"
  | "insecure"
  | "unsupported"
  | "failed";

/** Sustained loudness that counts as a breath rather than room noise. */
const BLOW_THRESHOLD = 0.075;
const BLOW_COOLDOWN_MS = 260;

/**
 * Chapter three: the cake. Candles go out by tap, or — the surprise — by
 * actually blowing into the microphone. The mic is strictly opt-in and the tap
 * path always works, so a denied permission never dead-ends the experience.
 */
export function CandlesChapter({ config, setGate, holdMusicForCapture }: ChapterProps) {
  const { locale, t } = useI18n();
  const total = config.candles;
  const [lit, setLit] = React.useState<boolean[]>(() => range(total).map(() => true));
  const [micState, setMicState] = React.useState<MicState>("idle");
  const [level, setLevel] = React.useState(0);
  const reduceMotion = useReducedMotion();

  const audioRef = React.useRef<{
    ctx: AudioContext;
    stream: MediaStream;
    raf: number;
    releaseSession: () => void;
  } | null>(null);
  const lastBlowRef = React.useRef(0);
  const cakeRef = React.useRef<HTMLDivElement>(null);

  const remaining = lit.filter(Boolean).length;
  const allOut = remaining === 0;

  const extinguish = React.useCallback((index?: number) => {
    setLit((current) => {
      const target = index ?? current.findIndex(Boolean);
      if (target < 0 || !current[target]) return current;
      const nextLit = [...current];
      nextLit[target] = false;
      return nextLit;
    });
  }, []);

  const stopMic = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(audio.raf);
    audio.stream.getTracks().forEach((track) => track.stop());
    void audio.ctx.close();
    audio.releaseSession();
    audioRef.current = null;
    setLevel(0);
    setMicState((state) => (state === "listening" ? "idle" : state));
  }, []);

  const startMic = React.useCallback(async () => {
    if (audioRef.current) {
      stopMic();
      return;
    }
    if (!window.isSecureContext) {
      // getUserMedia is unavailable over plain http, e.g. a phone hitting a dev
      // server by LAN address.
      setMicState("insecure");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicState("unsupported");
      return;
    }

    // iOS will not open the microphone while the session is playback-only, so
    // the melody hands it over for the duration.
    const releaseSession = holdMusicForCapture();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Noise suppression would filter out the very breath we listen for.
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);

      const tick = () => {
        analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (const sample of buffer) sum += sample * sample;
        const rms = Math.sqrt(sum / buffer.length);
        setLevel(Math.min(1, rms / (BLOW_THRESHOLD * 2.4)));

        const now = performance.now();
        if (rms > BLOW_THRESHOLD && now - lastBlowRef.current > BLOW_COOLDOWN_MS) {
          lastBlowRef.current = now;
          extinguish();
        }

        const audio = audioRef.current;
        if (audio) audio.raf = requestAnimationFrame(tick);
      };

      audioRef.current = { ctx, stream, raf: requestAnimationFrame(tick), releaseSession };
      setMicState("listening");
    } catch (error) {
      releaseSession();
      const name = (error as { name?: string } | null)?.name;
      setMicState(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "unavailable"
            : "failed",
      );
    }
  }, [extinguish, holdMusicForCapture, stopMic]);

  React.useEffect(() => stopMic, [stopMic]);

  // Gate the chapter until the last flame is out.
  React.useEffect(() => {
    setGate(
      allOut
        ? { blocked: false, label: t.continue.candles }
        : {
            blocked: true,
            label:
              remaining === total
                ? fill(plural(locale, total, t.candles.blowAll), { n: total })
                : fill(plural(locale, remaining, t.candles.remaining), { n: remaining }),
          },
    );
  }, [allOut, locale, remaining, setGate, t, total, setLit]);

  // Payoff once every candle is out.
  React.useEffect(() => {
    if (!allOut) return;
    stopMic();
    const t1 = window.setTimeout(() => cannons(), 120);
    const t2 = window.setTimeout(() => burst({ particleCount: 70, spread: 130 }), 520);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [allOut, stopMic]);

  const onCandleClick = (index: number, event: React.MouseEvent) => {
    if (!lit[index]) return;
    extinguish(index);
    popAt(event.clientX, event.clientY, { particleCount: 18, scalar: 0.55 });
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5 text-center sm:gap-8">
      <div className="space-y-3">
        <Badge variant="outline" className="gap-2">
          <Wind className="size-3" />
          {allOut ? t.candles.done : t.candles.todo}
        </Badge>
        <h2 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-5xl">
          <Accented
            text={
              allOut ? t.candles.doneTitle : fill(t.candles.title, { name: config.nickname })
            }
          />
        </h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          {allOut ? t.candles.doneBody : t.candles.body}
        </p>
      </div>

      {/* Microphone path */}
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        {!allOut && (
          <Button
            variant={micState === "listening" ? "outline" : "secondary"}
            onClick={startMic}
            size="lg"
            className="h-12 w-full gap-2 sm:h-11 sm:w-auto"
          >
            {micState === "listening" ? <MicOff /> : <Mic />}
            {micState === "listening" ? t.candles.micStop : t.candles.micStart}
          </Button>
        )}

        {micState === "listening" && (
          <div className="w-full space-y-1.5">
            <Progress value={level * 100} aria-label={t.candles.micLevel} />
            <p className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
              {level > 0.5 ? t.candles.loud : t.candles.quiet}
            </p>
          </div>
        )}

        {/* Each failure state has its own message, keyed by the state's name. */}
        {micState !== "idle" && micState !== "listening" && (
          <p className="text-xs leading-relaxed text-muted-foreground">{t.candles[micState]}</p>
        )}
      </div>

      {/* Cake */}
      <div ref={cakeRef} className="relative w-full max-w-[17.5rem] sm:max-w-md">
        <motion.div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle_at_center,var(--c3),transparent_62%)] blur-2xl"
          animate={{ opacity: allOut ? 0.12 : [0.34, 0.52, 0.34] }}
          transition={{ duration: 3.2, repeat: allOut ? 0 : Infinity, ease: "easeInOut" }}
        />

        {/* Candles sit above the cake in their own row so hit targets stay large.
            The row is capped to the width of the top tier so nothing overhangs. */}
        <div className="relative z-10 mx-auto flex w-[62%] items-end justify-center gap-1 sm:gap-2">
          {lit.map((isLit, i) => (
            <button
              key={i}
              type="button"
              onClick={(event) => onCandleClick(i, event)}
              disabled={!isLit}
              aria-label={fill(isLit ? t.candles.candleLit : t.candles.candleOut, { n: i + 1 })}
              className="group relative flex cursor-pointer flex-col items-center px-1.5 pt-8 disabled:cursor-default"
            >
              <AnimatePresence>
                {isLit ? (
                  <motion.span
                    key="flame"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.2, opacity: 0, y: -8 }}
                    className="absolute top-1.5 flex flex-col items-center"
                  >
                    <span
                      aria-hidden
                      className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,var(--c3),transparent_65%)] opacity-80 blur-[6px]"
                    />
                    <span
                      className={cn(
                        "relative block h-4 w-2.5 rounded-full bg-[linear-gradient(180deg,#fff8d6,var(--c3)_45%,#ff7a18)] shadow-[0_0_16px_4px_rgba(255,190,80,0.55)] group-hover:scale-110",
                        !reduceMotion && "animate-flicker",
                      )}
                      style={{ borderRadius: "50% 50% 45% 45% / 62% 62% 38% 38%" }}
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="smoke"
                    initial={{ opacity: 0.8, y: 0, scale: 0.6 }}
                    animate={{ opacity: 0, y: -46, scale: 1.9 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute top-0 size-3 rounded-full bg-foreground/45 blur-[5px]"
                  />
                )}
              </AnimatePresence>

              {/* Wick + candle body */}
              <span className="h-1.5 w-[2px] bg-foreground/50" />
              <span
                className="h-12 w-2.5 rounded-t-[3px] shadow-inner sm:h-14 sm:w-3"
                style={{
                  background:
                    i % 3 === 0
                      ? "repeating-linear-gradient(45deg,var(--c1),var(--c1) 5px,color-mix(in oklab,var(--ink) 88%,transparent) 5px,color-mix(in oklab,var(--ink) 88%,transparent) 10px)"
                      : i % 3 === 1
                        ? "repeating-linear-gradient(45deg,var(--c2),var(--c2) 5px,color-mix(in oklab,var(--ink) 88%,transparent) 5px,color-mix(in oklab,var(--ink) 88%,transparent) 10px)"
                        : "repeating-linear-gradient(45deg,var(--c3),var(--c3) 5px,color-mix(in oklab,var(--ink) 88%,transparent) 5px,color-mix(in oklab,var(--ink) 88%,transparent) 10px)",
                }}
              />
            </button>
          ))}
        </div>

        <svg viewBox="0 0 320 190" className="relative -mt-5 w-full drop-shadow-2xl">
          <defs>
            <linearGradient id="tier-top" x1="0" x2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--c1) 70%, white)" />
              <stop offset="100%" stopColor="var(--c1)" />
            </linearGradient>
            <linearGradient id="tier-mid" x1="0" x2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--c3) 70%, white)" />
              <stop offset="100%" stopColor="var(--c3)" />
            </linearGradient>
            <linearGradient id="tier-base" x1="0" x2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--c2) 65%, white)" />
              <stop offset="100%" stopColor="var(--c2)" />
            </linearGradient>
            <linearGradient id="plate" x1="0" x2="1">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--ink) 55%, transparent)" />
              <stop offset="100%" stopColor="color-mix(in oklab, var(--ink) 18%, transparent)" />
            </linearGradient>
          </defs>

          {/* top tier */}
          <rect x="80" y="18" width="160" height="44" rx="12" fill="url(#tier-top)" />
          <path
            d="M80 34 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 v-18 H80 Z"
            fill="color-mix(in oklab, var(--ink) 92%, transparent)"
            opacity="0.92"
          />
          {/* middle tier */}
          <rect x="62" y="62" width="196" height="52" rx="14" fill="url(#tier-mid)" />
          <path
            d="M62 80 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 24 0 q12 14 30 0 v-20 H62 Z"
            fill="color-mix(in oklab, var(--ink) 92%, transparent)"
            opacity="0.86"
          />
          {/* base tier */}
          <rect x="34" y="114" width="252" height="56" rx="16" fill="url(#tier-base)" />
          {/* plate */}
          <ellipse cx="160" cy="176" rx="146" ry="11" fill="url(#plate)" />

          {/* sprinkles */}
          {range(26).map((i) => {
            const x = 44 + ((i * 47) % 232);
            const y = 122 + ((i * 29) % 40);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width="7"
                height="2.6"
                rx="1.3"
                fill="var(--ink)"
                opacity="0.5"
                transform={`rotate(${(i * 53) % 180} ${x} ${y})`}
              />
            );
          })}
        </svg>
      </div>

    </div>
  );
}
