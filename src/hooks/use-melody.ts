"use client";

import * as React from "react";

/**
 * "Happy Birthday" as a music box — synthesized in the browser, so no audio
 * file ships with the project.
 *
 * Why this renders to a WAV instead of just playing live through an
 * AudioContext: on iOS, audio coming straight out of a Web Audio graph counts
 * as *ambient* sound and the hardware ringer/silent switch mutes it outright.
 * (Granting microphone access used to make the song audible purely as a side
 * effect: getUserMedia flips iOS into a play-and-record session, which routes
 * output through the media channel.)
 *
 * So the melody is rendered once with an OfflineAudioContext and handed to a
 * plain <audio> element. Media elements play on the media channel — through the
 * silent switch, at the volume the phone's buttons control — which is what
 * anyone opening a birthday card expects. `navigator.audioSession` is set to
 * "playback" as well, where supported, to declare the intent explicitly.
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

// [note, beats] — the classic four phrases, with a long rest so the loop seam
// falls in silence instead of cutting off the last note's tail.
const MELODY: Array<[keyof typeof NOTES | "rest", number]> = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 1.75], ["rest", 0.25],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 1.75], ["rest", 0.25],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1.75], ["rest", 0.25],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2], ["rest", 3],
];

const BEAT = 0.42; // seconds per beat
/** 22.05 kHz is plenty: the tone is low-passed at 4.2 kHz, and it halves the blob. */
const SAMPLE_RATE = 22_050;

function pluck(
  ctx: BaseAudioContext,
  destination: AudioNode,
  freq: number,
  at: number,
  beats: number,
) {
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

/** Master bus with a feedback delay: a cheap room around the music box. */
function createBus(ctx: BaseAudioContext): AudioNode {
  const master = ctx.createGain();
  master.gain.value = 0.9;

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

  return master;
}

function encodeWav(buffer: AudioBuffer): Blob {
  const samples = buffer.getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));

  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

async function renderMelody(): Promise<Blob | null> {
  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  if (!OfflineCtx) return null;

  const beats = MELODY.reduce((total, [, value]) => total + value, 0);
  const seconds = beats * BEAT;

  try {
    const ctx = new OfflineCtx(1, Math.ceil(seconds * SAMPLE_RATE), SAMPLE_RATE);
    const bus = createBus(ctx);

    let cursor = 0;
    for (const [note, value] of MELODY) {
      if (note !== "rest") pluck(ctx, bus, NOTES[note], cursor, value);
      cursor += value * BEAT;
    }

    return encodeWav(await ctx.startRendering());
  } catch {
    return null; // No Web Audio: the page is simply silent.
  }
}

/**
 * Declares what the page is doing with audio.
 *
 * "playback" is what makes the song audible through the iOS ringer switch —
 * but it is playback *only*: while it is set, iOS refuses microphone capture,
 * so anything that wants the mic has to switch to "play-and-record" first and
 * switch back afterwards. See `holdForCapture` below.
 */
type SessionType = "playback" | "play-and-record";

function declareSession(type: SessionType) {
  const session = (
    navigator as Navigator & { audioSession?: { type: string } }
  ).audioSession;
  if (!session) return;
  try {
    session.type = type;
  } catch {
    // Read-only in some versions — harmless.
  }
}

export function useMelody(enabled: boolean) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const urlRef = React.useRef<string | null>(null);
  const mutedByUserRef = React.useRef(false);
  const capturingRef = React.useRef(false);
  const [playing, setPlaying] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Render the loop once, up front, so the first tap has audio to play.
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    let cancelled = false;

    declareSession("playback");

    void renderMelody().then((blob) => {
      if (cancelled || !blob) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.55;
      audio.preload = "auto";
      // Required on iOS so playback is not treated as a fullscreen video.
      audio.setAttribute("playsinline", "");
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("play", () => setPlaying(true));
      // Kept in the DOM (invisible, no controls) rather than detached: iOS is
      // more consistent about treating an attached element as media playback.
      audio.hidden = true;
      document.body.appendChild(audio);
      urlRef.current = url;
      audioRef.current = audio;
      setReady(true);
    });

    return () => {
      cancelled = true;
      audioRef.current?.pause();
      audioRef.current?.remove();
      audioRef.current = null;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, [enabled]);

  const start = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!capturingRef.current) declareSession("playback");
    void audio.play().catch(() => {
      // Refused until the visitor interacts — the unlock effect handles it.
    });
  }, []);

  const stop = React.useCallback(() => {
    audioRef.current?.pause();
  }, []);

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
   * Hands the audio session over to whoever needs the microphone, and returns
   * the function that hands it back. Pausing the song for the duration is a
   * bonus: with echo cancellation deliberately off, the music box coming out of
   * the speaker would otherwise be heard as breath.
   */
  const holdForCapture = React.useCallback(() => {
    const audio = audioRef.current;
    const wasPlaying = Boolean(audio && !audio.paused);

    capturingRef.current = true;
    audio?.pause();
    declareSession("play-and-record");

    return () => {
      capturingRef.current = false;
      declareSession("playback");
      if (wasPlaying && !mutedByUserRef.current) start();
    };
  }, [start]);

  /**
   * Browsers refuse to make noise before the visitor has interacted, so: try
   * immediately in case this browser allows it, otherwise start on the very
   * first touch, click or keypress anywhere — which is the press that opens the
   * parcel. From the visitor's side the song simply begins on its own.
   */
  React.useEffect(() => {
    if (!enabled || !ready) return;

    const audio = audioRef.current;
    if (!audio) return;

    start();

    const events = ["pointerdown", "touchstart", "keydown"] as const;
    const options = { capture: true, passive: true } as const;

    const unlock = () => {
      if (mutedByUserRef.current || capturingRef.current) return;
      start();
      if (!audio.paused) detach();
    };

    const detach = () => {
      events.forEach((event) => window.removeEventListener(event, unlock, options));
    };

    events.forEach((event) => window.addEventListener(event, unlock, options));
    return detach;
  }, [enabled, ready, start]);

  return { playing, start, stop, toggle, holdForCapture, available: enabled };
}
