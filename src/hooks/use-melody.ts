"use client";

import * as React from "react";

/**
 * "Happy Birthday" as a music box, synthesized with the Web Audio API.
 * No audio files ship with the project, which keeps the deploy tiny and means
 * the soundtrack works offline and never 404s.
 */

const NOTES: Record<string, number> = {
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

// [note, beats] — the classic four phrases.
const MELODY: Array<[keyof typeof NOTES | "rest", number]> = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 1.75], ["rest", 0.25],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 1.75], ["rest", 0.25],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1.75], ["rest", 0.25],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2], ["rest", 1],
];

const BEAT = 0.42; // seconds per beat

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  timer: number | null;
};

function pluck(ctx: AudioContext, destination: AudioNode, freq: number, at: number, beats: number) {
  const duration = Math.min(beats * BEAT * 2.2, 1.9);

  const bell = ctx.createOscillator();
  bell.type = "triangle";
  bell.frequency.value = freq;

  // A quiet octave partial gives the tone its music-box shimmer.
  const partial = ctx.createOscillator();
  partial.type = "sine";
  partial.frequency.value = freq * 2.01;

  const gain = ctx.createGain();
  const partialGain = ctx.createGain();
  partialGain.gain.value = 0.18;

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 4200;

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.42, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  bell.connect(gain);
  partial.connect(partialGain).connect(gain);
  gain.connect(tone).connect(destination);

  bell.start(at);
  partial.start(at);
  bell.stop(at + duration + 0.05);
  partial.stop(at + duration + 0.05);
}

function createEngine(): Engine {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();

  const master = ctx.createGain();
  master.gain.value = 0;

  // Feedback delay: cheap reverb that makes the box sound like it is in a room.
  const delay = ctx.createDelay(0.6);
  delay.delayTime.value = 0.28;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.24;
  const wet = ctx.createGain();
  wet.gain.value = 0.3;

  master.connect(ctx.destination);
  master.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(ctx.destination);

  return { ctx, master, timer: null };
}

export function useMelody(enabled: boolean) {
  const engineRef = React.useRef<Engine | null>(null);
  const mutedByUserRef = React.useRef(false);
  const [playing, setPlaying] = React.useState(false);

  const schedule = React.useCallback(() => {
    // `run` is a hoisted declaration so the loop can re-arm itself without the
    // callback having to close over its own identity.
    function run() {
      const engine = engineRef.current;
      if (!engine) return;
      const { ctx, master } = engine;
      let cursor = ctx.currentTime + 0.12;

      for (const [note, beats] of MELODY) {
        if (note !== "rest") pluck(ctx, master, NOTES[note], cursor, beats);
        cursor += beats * BEAT;
      }

      const loopIn = (cursor - ctx.currentTime) * 1000;
      engine.timer = window.setTimeout(run, loopIn);
    }

    run();
  }, []);

  const stop = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.timer) window.clearTimeout(engine.timer);
    engine.timer = null;
    engine.master.gain.cancelScheduledValues(engine.ctx.currentTime);
    engine.master.gain.setTargetAtTime(0, engine.ctx.currentTime, 0.15);
    setPlaying(false);
  }, []);

  const start = React.useCallback(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    if (!engineRef.current) {
      try {
        engineRef.current = createEngine();
      } catch {
        return; // Web Audio unavailable — the page simply stays silent.
      }
    }

    const engine = engineRef.current;
    engine.master.gain.cancelScheduledValues(engine.ctx.currentTime);
    engine.master.gain.setTargetAtTime(0.5, engine.ctx.currentTime, 0.4);
    if (!engine.timer) schedule();

    // The speaker icon must tell the truth: a context that is still suspended
    // (autoplay refused, waiting for a gesture) is not playing yet.
    const sync = () => setPlaying(engine.ctx.state === "running" && engine.timer !== null);
    engine.ctx.onstatechange = sync;
    void engine.ctx.resume().then(sync, () => {});
    sync();
  }, [enabled, schedule]);

  const toggle = React.useCallback(() => {
    if (playing) {
      mutedByUserRef.current = true;
      stop();
    } else {
      mutedByUserRef.current = false;
      start();
    }
  }, [playing, start, stop]);

  /**
   * Browsers refuse to make noise before the visitor has interacted, and iOS
   * additionally insists the AudioContext is resumed *synchronously inside* a
   * gesture handler — a resume from a rAF or promise callback is ignored, which
   * is why the song used to stay silent until something else (granting the
   * microphone) happened to unlock audio.
   *
   * So: try immediately in case the policy allows it, and otherwise start on the
   * very first touch, click or keypress anywhere on the page. From the visitor's
   * side the song simply begins on its own; the header button mutes it.
   */
  React.useEffect(() => {
    if (!enabled) return;

    start();
    if (engineRef.current?.ctx.state === "running") return;

    const events = ["pointerdown", "touchstart", "keydown"] as const;
    // Capture phase, so this runs before the seal's own handlers.
    const options = { capture: true, passive: true } as const;

    const unlock = () => {
      if (mutedByUserRef.current) return;
      start();
      if (engineRef.current?.ctx.state === "running") detach();
    };

    const detach = () => {
      events.forEach((event) => window.removeEventListener(event, unlock, options));
    };

    events.forEach((event) => window.addEventListener(event, unlock, options));
    return detach;
  }, [enabled, start]);

  React.useEffect(() => {
    return () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (engine.timer) window.clearTimeout(engine.timer);
      void engine.ctx.close();
      engineRef.current = null;
    };
  }, []);

  return { playing, start, stop, toggle, available: enabled };
}
