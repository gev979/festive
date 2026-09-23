/**
 * The languages every card exists in. English is the default and lives at the
 * root (`/`); every other language is one path segment (`/hy`, `/ru`).
 */
export const LOCALES = ["en", "hy", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
