import { DEFAULTS } from "@/celebration.config";
import type { Locale } from "@/i18n/config";
import { getMessages, type Messages } from "@/i18n";
import { ordinal } from "@/i18n/format";
import { getPerson } from "@/lib/people";

/**
 * Turns one card — a person from `src/people/` (or nobody, for the standard
 * card) in one language — into the shape the page consumes: every gap filled
 * from the shared defaults, validated, with everything date-derived computed
 * once.
 */

export const THEMES = ["aurora", "sunset", "candy", "cosmos", "orchard"] as const;
export type ThemeName = (typeof THEMES)[number];

export type Highlight = {
  title: string;
  body: string;
};

/** Everything a card says in words. A person can replace any of it, per language. */
export type CardTexts = {
  name: string;
  nickname: string;
  from: string;
  invitation: string;
  message: string[];
  highlights: Highlight[];
  wishes: string[];
};

export type Person = {
  /** Who this is for. Shown on the envelope and as the giant reveal. */
  name: string;
  /** Shorter, friendlier form for headings and the header pill. Defaults to the first word of `name`. */
  nickname?: string;
  /** Who the card is from — on the envelope, and signed at the end. */
  from?: string;
  /**
   * Date of birth, `YYYY-MM-DD`. Drives the age, the zodiac sign, the weekday
   * they were born on, and every number in the ledger chapter.
   */
  birthDate?: string | null;
  /** Overrides the computed age. */
  age?: number | null;
  /** Visual theme: aurora | sunset | candy | cosmos | orchard */
  theme?: ThemeName;
  /** Confetti emoji. The first five are used. */
  emojis?: string[];
  /** Portrait shown in the reveal chapter. Any image URL. */
  photoUrl?: string | null;
  /** The "Happy Birthday" music box, synthesized in the browser. */
  music?: boolean;
  /** Candles on the cake, 1–12. Unset picks a readable handful. */
  candles?: number | null;
  /**
   * Per-language wording. Whatever is set for a language wins there; anything
   * left out falls back to the shared default texts for that language (and,
   * for `name`, `nickname` and `from`, to the values above).
   */
  texts?: Partial<Record<Locale, Partial<CardTexts>>>;
};

export type BirthdayConfig = CardTexts & {
  locale: Locale;
  /** false on the standard card, which is not addressed to anyone in particular */
  personal: boolean;
  theme: ThemeName;
  emojis: string[];
  photoUrl: string | null;
  music: boolean;
  candles: number;
  /** null when no valid birth date was configured */
  birthDate: Date | null;
  age: number | null;
  ordinalAge: string | null;
  /**
   * Which birthday is being celebrated. On the day itself that is the new age;
   * opened early it is the one about to arrive — so a card opened two days
   * before a 22nd never says "21st birthday".
   */
  birthdayNumber: number | null;
  ordinalBirthday: string | null;
  daysAlive: number | null;
  daysUntilBirthday: number | null;
  isBirthdayToday: boolean;
  zodiac: { sign: string; symbol: string } | null;
  /** The weekday of birth, as `hero.bornOn` reads it in this language */
  weekdayBorn: string | null;
};

/**
 * Parses `YYYY-MM-DD` at UTC noon. Noon keeps the calendar date stable no
 * matter which timezone the viewer opens the page from.
 */
function parseBirthDate(value: string | null | undefined): Date | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim()) : null;
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
    return null; // rejects things like 2000-02-31
  }
  return date;
}

type ZodiacId = keyof Messages["zodiac"];

const ZODIAC: Array<{ id: ZodiacId; symbol: string; until: [number, number] }> = [
  { id: "capricorn", symbol: "♑", until: [1, 19] },
  { id: "aquarius", symbol: "♒", until: [2, 18] },
  { id: "pisces", symbol: "♓", until: [3, 20] },
  { id: "aries", symbol: "♈", until: [4, 19] },
  { id: "taurus", symbol: "♉", until: [5, 20] },
  { id: "gemini", symbol: "♊", until: [6, 20] },
  { id: "cancer", symbol: "♋", until: [7, 22] },
  { id: "leo", symbol: "♌", until: [8, 22] },
  { id: "virgo", symbol: "♍", until: [9, 22] },
  { id: "libra", symbol: "♎", until: [10, 22] },
  { id: "scorpio", symbol: "♏", until: [11, 21] },
  { id: "sagittarius", symbol: "♐", until: [12, 21] },
  { id: "capricorn", symbol: "♑", until: [12, 31] },
];

function zodiacFor(date: Date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return ZODIAC.find(({ until: [m, d] }) => month < m || (month === m && day <= d)) ?? null;
}

const DAY_MS = 86_400_000;

function utcMidnight(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** The first value that is a non-blank string, trimmed. */
function firstFilled(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** A list with blanks dropped, or null if nothing is left of it. */
function filled(lines: string[] | undefined): string[] | null {
  const kept = lines?.map((line) => line.trim()).filter(Boolean);
  return kept?.length ? kept : null;
}

function filledHighlights(cards: Highlight[] | undefined): Highlight[] | null {
  const kept = cards
    ?.map(({ title, body }) => ({ title: title.trim(), body: body.trim() }))
    .filter((card) => card.title || card.body);
  return kept?.length ? kept : null;
}

export function getBirthdayConfig(
  locale: Locale,
  personKey: string,
  now: Date = new Date(),
): BirthdayConfig {
  const t = getMessages(locale);
  const person = getPerson(personKey);
  const own = person?.texts?.[locale] ?? {};
  const shared = t.defaults;

  const name = firstFilled(own.name, person?.name, shared.name);
  const nickname = firstFilled(
    own.nickname,
    person?.nickname,
    person ? name.split(" ")[0] : shared.nickname,
  );
  const birthDate = parseBirthDate(person?.birthDate);

  const today = utcMidnight(now);
  let age: number | null = null;
  let daysAlive: number | null = null;
  let daysUntilBirthday: number | null = null;
  // Without a date there is nothing to be early for, so the day is today.
  let isBirthdayToday = true;

  if (birthDate) {
    const born = utcMidnight(birthDate);
    daysAlive = Math.max(0, Math.round((today - born) / DAY_MS));

    const todayDate = new Date(today);
    const thisYearsBirthday = Date.UTC(
      todayDate.getUTCFullYear(),
      birthDate.getUTCMonth(),
      birthDate.getUTCDate(),
    );
    isBirthdayToday = thisYearsBirthday === today;

    age = todayDate.getUTCFullYear() - birthDate.getUTCFullYear();
    if (thisYearsBirthday > today) age -= 1;
    age = Math.max(0, age);

    const nextBirthday =
      thisYearsBirthday >= today
        ? thisYearsBirthday
        : Date.UTC(
            todayDate.getUTCFullYear() + 1,
            birthDate.getUTCMonth(),
            birthDate.getUTCDate(),
          );
    daysUntilBirthday = Math.round((nextBirthday - today) / DAY_MS);
  }

  if (typeof person?.age === "number" && person.age >= 0) {
    age = person.age;
  }

  // A real candle-per-year cake stops being readable fast, so the default is a
  // handful; `candles` on a person can push it to 12.
  const candlesSetting = person?.candles ?? DEFAULTS.candles;
  const candles =
    typeof candlesSetting === "number" && candlesSetting > 0
      ? Math.min(candlesSetting, 12)
      : Math.min(Math.max(age ?? 5, 3), 5);

  const themeSetting = person?.theme ?? DEFAULTS.theme;
  const theme = THEMES.includes(themeSetting) ? themeSetting : "aurora";
  const emojis = (person?.emojis ?? DEFAULTS.emojis).filter(Boolean);

  const birthdayNumber = age === null ? null : isBirthdayToday ? age : age + 1;
  const sign = birthDate ? zodiacFor(birthDate) : null;

  return {
    locale,
    personal: person !== null,
    name,
    nickname,
    from: firstFilled(own.from, person?.from, shared.from),
    theme,
    emojis: emojis.length ? [...emojis] : ["🎉"],
    photoUrl: (person?.photoUrl ?? DEFAULTS.photoUrl)?.trim() || null,
    music: person?.music ?? DEFAULTS.music,
    invitation: firstFilled(own.invitation, shared.invitation),
    message: filled(own.message) ?? shared.message,
    highlights: filledHighlights(own.highlights) ?? shared.highlights,
    wishes: filled(own.wishes) ?? shared.wishes,
    candles,
    birthDate,
    age,
    ordinalAge: age === null ? null : ordinal(locale, age),
    birthdayNumber,
    ordinalBirthday: birthdayNumber === null ? null : ordinal(locale, birthdayNumber),
    daysAlive,
    daysUntilBirthday,
    isBirthdayToday,
    zodiac: sign ? { sign: t.zodiac[sign.id], symbol: sign.symbol } : null,
    weekdayBorn: birthDate ? t.weekdays[birthDate.getUTCDay()] : null,
  };
}
