import type { Plural } from "@/i18n/format";

/** Marks a count-dependent field, so other languages can give more forms. */
const forms = (value: Plural): Plural => value;

/**
 * Every word on the card, in English. This file is the source of truth: the
 * other languages must have exactly the same keys.
 *
 * Conventions: `{name}`-style placeholders are filled in by the page, and
 * `*…*` marks the words drawn in the accent gradient.
 */
export const en = {
  /** Browser tab, link previews and the preview image. */
  meta: {
    title: "Happy Birthday, {name}",
    description:
      "An interactive card for {nickname}'s {ordinal} birthday. Open the parcel, blow out the candles, make a wish.",
    descriptionNoAge:
      "An interactive birthday card for {nickname}. Open the parcel, blow out the candles, make a wish.",
    imageKicker: "happy birthday",
    imageLap: "{ordinal} lap around the sun",
    imageFrom: "from {from}",
  },

  /**
   * The standard card, and everything a person's own file leaves out. Any of
   * it can be replaced per person and language in `src/people/`.
   */
  defaults: {
    name: "Beautiful Human",
    nickname: "Beautiful Human",
    from: "Someone who thinks the world of you",
    invitation: "Something arrived for you today.",
    message: [
      "Some people make a room warmer just by walking into it.",
      "You have been doing that for as long as I have known you.",
      "Here is to a year that finally keeps up with you.",
    ],
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
    wishes: [
      "Mornings that feel like a running start",
      "Plans that actually happen",
      "Songs that arrive exactly when you need them",
      "One unreasonably good piece of news",
      "Rooms full of people who get you",
    ],
  },

  /** Opening and closing quotation marks. */
  quotes: ["“", "”"],

  /** Weekday names as they read inside `hero.bornOn`, Sunday first. */
  weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  zodiac: {
    capricorn: "Capricorn",
    aquarius: "Aquarius",
    pisces: "Pisces",
    aries: "Aries",
    taurus: "Taurus",
    gemini: "Gemini",
    cancer: "Cancer",
    leo: "Leo",
    virgo: "Virgo",
    libra: "Libra",
    scorpio: "Scorpio",
    sagittarius: "Sagittarius",
  },

  chapters: {
    seal: "The parcel",
    hero: "The reveal",
    candles: "The candles",
    reasons: "The reasons",
    cosmos: "The numbers",
    wish: "The wish",
    finale: "The send-off",
  },

  /** The forward button, by the chapter it is pressed on. */
  continue: {
    hero: "There is cake",
    candles: "Why you, specifically",
    reasons: "Run the numbers",
    cosmos: "Make a wish",
    wish: "One last thing",
  },

  nav: {
    announce: "Chapter {n} of {total}: {label}",
    rail: "Chapters",
    goTo: "Go to chapter {n}: {label}",
    locked: "Chapter {n} is locked",
    position: "{label} · {n} of {total}",
    back: "Back to the previous chapter",
    keys: "or use ← → keys",
    swipe: "or swipe left and right",
    end: "that is the whole thing",
  },

  top: {
    pill: "for {name}",
    /** The pill on the standard card, which is not for anyone in particular. */
    pillEveryone: "for you",
    shareTitle: "Happy birthday, {name}",
    shareText: "A little something for {name} 🎂",
    shareTextEveryone: "A little something for you 🎂",
    restart: "Start the experience over",
    restartTip: "Start over",
    share: "Share this page",
    shareTip: "Share",
    copied: "Link copied",
    mute: "Mute the music box",
    play: "Play the music box",
    muteTip: "Mute (M)",
    playTip: "Music box (M)",
    musicHint: "♪ tap to mute",
  },

  seal: {
    today: "Delivered today",
    early: "Arrived early",
    to: "addressed to",
    from: "from",
    hold: "Hold to open",
    holding: "Keep holding…",
    missed: "Hold it a moment longer",
    opening: "Opening…",
    rescue: "or just tap here to open it",
  },

  hero: {
    today: "It is officially today",
    early: "Consider this a warm-up",
    kicker: "happy birthday",
    /** `{n}` is the lap number and `{ordinal}` the same as "22nd"; `*…*` is set large. */
    lap: "Lap *{n}* around the sun, and you are still the most interesting thing in orbit.",
    lapUnknown:
      "Another lap around the sun, and you are still the most interesting thing in orbit.",
    birthday: "{ordinal} birthday",
    bornOn: "born on a {weekday}",
  },

  candles: {
    todo: "One job left",
    done: "Wish locked in",
    title: "Make it count, *{name}*",
    doneTitle: "*That is going to come true*",
    body: "Tap each flame, or let the microphone hear you actually blow them out.",
    doneBody: "Every candle out on the first pass. That is officially a good omen.",
    blowAll: forms({ one: "Blow out the candle", other: "Blow out all {n} candles" }),
    remaining: forms("{n} still burning"),
    micStart: "Blow them out for real",
    micStop: "Stop listening",
    micLevel: "Microphone level",
    loud: "keep going",
    quiet: "take a deep breath and blow",
    denied: "Microphone blocked — tap the flames instead, it counts just the same.",
    unavailable: "No microphone found on this device. Tap the flames instead.",
    insecure: "The microphone needs a secure (https) connection. Tap the flames instead.",
    unsupported: "This browser will not share a microphone. Tap the flames instead.",
    failed: "The microphone would not open. Tap the flames instead.",
    candleLit: "Blow out candle {n}",
    candleOut: "Candle {n} is out",
  },

  reasons: {
    badge: "the receipts",
    title: "Reasons this day *matters*",
    next: "Next reason",
    progress: "{seen} of {total} · tap or flick the card",
  },

  cosmos: {
    badge: "the ledger",
    title: forms({
      one: "What *{n}* year actually looks like",
      other: "What *{n}* years actually looks like",
    }),
    /** Heading when there is no birth date, and the numbers are one ordinary year. */
    titleYear: "What *one year* actually looks like",
    subtitle: "Approximate, affectionate, and all yours.",
    sunrises: {
      unit: forms({ one: "sunrise", other: "sunrises" }),
      caption: "and not one of them looked quite like the others",
    },
    heartbeats: {
      unit: forms({ one: "heartbeat", other: "heartbeats" }),
      caption: "roughly — your heart has been extremely reliable about this",
    },
    moons: {
      unit: forms({ one: "full moon", other: "full moons" }),
      caption: "somebody should have pointed more of them out to you",
    },
    distance: {
      unit: forms("million km flown"),
      caption: "Earth has been carrying you around the sun this whole time",
    },
    orbits: {
      unit: forms({ one: "orbit completed", other: "orbits completed" }),
      caption: "a full lap of the sun, every single one of them",
    },
    countdown: {
      unit: forms({ one: "day to the next one", other: "days to the next one" }),
      caption: "consider this a very early start",
    },
    breaths: {
      unit: forms({ one: "breath", other: "breaths" }),
      caption: "the next one is on the house",
    },
    hours: {
      unit: forms({ one: "hour", other: "hours" }),
      caption: "and today gets to be the loudest twenty-four",
    },
  },

  wish: {
    badge: "wished on your behalf",
    title: "Things the year ahead *owes you*",
    compose: "Now add yours, {name}",
    hint: "One line, unedited. That is how wishes work.",
    placeholder: "This year, I want…",
    label: "Your birthday wish",
    send: "Send it up",
    sending: "Launching…",
    sent: "sent up and kept safe",
    sentNote:
      "Kept in this browser only — nobody else can read it. The universe has, however, been notified.",
    rewrite: "Write a different one",
    skip: "Skip ahead",
  },

  finale: {
    badge: "the part that is actually true",
    signoff: "with everything",
    again: "Again, louder",
    finePrint: "The fine print",
    termsTitle: "Terms of celebration",
    termsNote: "Non-negotiable, effective immediately.",
    terms: [
      "Today, every opinion you have about how the day should go wins automatically.",
      "Cake before noon is reclassified as breakfast, retroactively, for the whole week.",
      "Any sentence starting “I should probably…” is void until tomorrow.",
      "The wish you made is now the responsibility of the year ahead. It has been informed.",
      "This page can be reopened whenever you want, no occasion required.",
    ],
    close: "Close",
    tapHint: "tap anywhere · it throws confetti",
  },
};

export type Messages = typeof en;
