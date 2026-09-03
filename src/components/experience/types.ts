import type { BirthdayConfig } from "@/lib/config";

export const CHAPTERS = [
  { id: "seal", label: "The parcel" },
  { id: "hero", label: "The reveal" },
  { id: "candles", label: "The candles" },
  { id: "reasons", label: "The reasons" },
  { id: "cosmos", label: "The numbers" },
  { id: "wish", label: "The wish" },
  { id: "finale", label: "The send-off" },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

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
