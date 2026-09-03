import { CELEBRATION } from "@/celebration.config";

/**
 * Turns the hardcoded values in `src/celebration.config.ts` into the shape the
 * page consumes: validated, with everything date-derived computed once.
 */

export const THEMES = ["aurora", "sunset", "candy", "cosmos", "orchard"] as const;
export type ThemeName = (typeof THEMES)[number];

export type Highlight = {
  title: string;
  body: string;
};

export type BirthdayConfig = {
  name: string;
  nickname: string;
  from: string;
  theme: ThemeName;
  emojis: string[];
  photoUrl: string | null;
  music: boolean;
  invitation: string;
  message: string[];
  highlights: Highlight[];
  wishes: string[];
  candles: number;
  siteUrl: string | null;
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
  weekdayBorn: string | null;
};

/**
 * Parses `YYYY-MM-DD` at UTC noon. Noon keeps the calendar date stable no
 * matter which timezone the viewer opens the page from.
 */
function parseBirthDate(value: string | null): Date | null {
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

const ZODIAC: Array<{ sign: string; symbol: string; until: [number, number] }> = [
  { sign: "Capricorn", symbol: "♑", until: [1, 19] },
  { sign: "Aquarius", symbol: "♒", until: [2, 18] },
  { sign: "Pisces", symbol: "♓", until: [3, 20] },
  { sign: "Aries", symbol: "♈", until: [4, 19] },
  { sign: "Taurus", symbol: "♉", until: [5, 20] },
  { sign: "Gemini", symbol: "♊", until: [6, 20] },
  { sign: "Cancer", symbol: "♋", until: [7, 22] },
  { sign: "Leo", symbol: "♌", until: [8, 22] },
  { sign: "Virgo", symbol: "♍", until: [9, 22] },
  { sign: "Libra", symbol: "♎", until: [10, 22] },
  { sign: "Scorpio", symbol: "♏", until: [11, 21] },
  { sign: "Sagittarius", symbol: "♐", until: [12, 21] },
  { sign: "Capricorn", symbol: "♑", until: [12, 31] },
];

function zodiacFor(date: Date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const found = ZODIAC.find(
    ({ until: [m, d] }) => month < m || (month === m && day <= d),
  );
  return found ? { sign: found.sign, symbol: found.symbol } : null;
}

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

const DAY_MS = 86_400_000;

function utcMidnight(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getBirthdayConfig(now: Date = new Date()): BirthdayConfig {
  const name = CELEBRATION.name.trim() || "Beautiful Human";
  const birthDate = parseBirthDate(CELEBRATION.birthDate);

  const today = utcMidnight(now);
  let age: number | null = null;
  let daysAlive: number | null = null;
  let daysUntilBirthday: number | null = null;
  let isBirthdayToday = false;

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

  if (typeof CELEBRATION.age === "number" && CELEBRATION.age >= 0) {
    age = CELEBRATION.age;
  }

  // A real candle-per-year cake stops being readable fast, so the default is a
  // handful; `candles` in the config can push it to 12.
  const candles =
    typeof CELEBRATION.candles === "number" && CELEBRATION.candles > 0
      ? Math.min(CELEBRATION.candles, 12)
      : Math.min(Math.max(age ?? 5, 3), 5);

  const theme = THEMES.includes(CELEBRATION.theme) ? CELEBRATION.theme : "aurora";
  const emojis = CELEBRATION.emojis.filter(Boolean);
  const highlights = CELEBRATION.highlights
    .map(({ title, body }) => ({ title: title.trim(), body: body.trim() }))
    .filter((highlight) => highlight.title || highlight.body);

  const birthdayNumber =
    age === null ? null : isBirthdayToday ? age : age + 1;

  return {
    name,
    nickname: CELEBRATION.nickname.trim() || (name.split(" ")[0] ?? name),
    from: CELEBRATION.from.trim() || "Someone who thinks the world of you",
    theme,
    emojis: emojis.length ? [...emojis] : ["🎉"],
    photoUrl: CELEBRATION.photoUrl?.trim() || null,
    music: CELEBRATION.music,
    invitation: CELEBRATION.invitation.trim() || "Something arrived for you today.",
    message: CELEBRATION.message.map((line) => line.trim()).filter(Boolean),
    highlights,
    wishes: CELEBRATION.wishes.map((wish) => wish.trim()).filter(Boolean),
    candles,
    siteUrl: CELEBRATION.siteUrl?.trim() || null,
    birthDate,
    age,
    ordinalAge: age === null ? null : ordinal(age),
    birthdayNumber,
    ordinalBirthday: birthdayNumber === null ? null : ordinal(birthdayNumber),
    daysAlive,
    daysUntilBirthday,
    isBirthdayToday,
    zodiac: birthDate ? zodiacFor(birthDate) : null,
    weekdayBorn: birthDate
      ? new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(
          birthDate,
        )
      : null,
  };
}
