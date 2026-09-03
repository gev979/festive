import type { ThemeName } from "@/lib/config";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ONLY FILE YOU EDIT.
 *
 * Everything the page says about the birthday person lives here. Change these
 * values, commit, and the deploy shows the new celebration.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const CELEBRATION = {
  /** Who this is for. Shown on the envelope and as the giant reveal. */
  name: "Miriam",

  /** Shorter, friendlier form used in headings and the header pill. */
  nickname: "Miriam",

  /**
   * Date of birth, `YYYY-MM-DD`. Drives the age, the zodiac sign, the weekday
   * they were born on, and every number in the ledger chapter.
   * Set to `null` to skip all of that.
   */
  birthDate: "2004-09-05" as string | null,

  /** Overrides the computed age. Leave `null` to derive it from `birthDate`. */
  age: null as number | null,

  /** Who the card is from — on the envelope, and signed at the end. */
  from: "Gev",

  /** Visual theme: aurora | sunset | candy | cosmos | orchard */
  theme: "aurora" as ThemeName,

  /** Confetti emoji. The first five are used. */
  emojis: ["🎉", "🎂", "✨", "🎈", "💫"],

  /** Portrait shown in the reveal chapter. Any image URL, or `null`. */
  photoUrl: null as string | null,

  /** The "Happy Birthday" music box, synthesized in the browser. */
  music: true,

  /** Candles on the cake, 1–12. `null` picks a readable handful. */
  candles: null as number | null,

  /** The line on the sealed envelope, before anything is revealed. */
  invitation: "Something arrived for you today.",

  /** The closing letter. Each paragraph fades in on its own. */
  message: [
    "Some people make a room warmer just by walking into it.",
    "You have been doing that for as long as I have known you.",
    "Here is to a year that finally keeps up with you.",
  ],

  /** The card deck of reasons. `title` may be an empty string. */
  highlights: [
    {
      title: "Impossible to replace",
      body: "There is exactly one of you, and the rest of us got lucky.",
    },
    {
      title: "Quietly unstoppable",
      body: "You keep going when it would be easier not to. That is not a small thing.",
    },
    {
      title: "Absurdly good company",
      body: "Ordinary days turn into stories when you are around.",
    },
  ],

  /** Wishes for the year ahead. */
  wishes: [
    "Mornings that feel like a running start",
    "Plans that actually happen",
    "Songs that arrive exactly when you need them",
    "One unreasonably good piece of news",
    "Rooms full of people who get you",
  ],

  /**
   * Canonical URL, used for link previews. On Vercel the deployment URL is
   * detected automatically, so this is only needed for a custom domain.
   */
  siteUrl: null as string | null,
} as const;
