import type { BirthdayConfig } from "@/lib/config";

/** In order. Their titles live with the rest of the wording, under `chapters`. */
export const CHAPTERS = ["seal", "hero", "candles", "reasons", "cosmos", "wish", "finale"] as const;

export type ChapterId = (typeof CHAPTERS)[number];

export type ChapterProps = {
  config: BirthdayConfig;
  /** Advance to the next chapter. No-op on the last one. */
  next: () => void;
  /** Lets a chapter block or unblock the primary "continue" affordance. */
  setGate: (gate: { blocked: boolean; label?: string }) => void;
  playMusic: () => void;
  /**
   * Borrows the audio session for microphone capture and returns the function
   * that gives it back (which also resumes the song). iOS refuses capture while
   * the session is declared playback-only.
   */
  holdMusicForCapture: () => () => void;
};
