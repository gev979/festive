import type { Locale } from "@/i18n/config";

/**
 * A string whose wording depends on a count: one form per plural category the
 * language uses (English: one/other, Russian: one/few/many/other). A plain
 * string means the wording never changes with the number.
 */
export type Plural = string | ({ other: string } & Partial<Record<Intl.LDMLPluralRule, string>>);

/** Replaces `{key}` placeholders; unknown keys are left in place. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

export function plural(locale: Locale, count: number, forms: Plural): string {
  if (typeof forms === "string") return forms;
  return forms[new Intl.PluralRules(locale).select(count)] ?? forms.other;
}

/**
 * A numeric ordinal as each language writes it: "22nd", "22-й", "22-րդ".
 * Russian ordinals agree with their noun; every phrase here that uses one is
 * masculine (круг, день рождения), hence "-й".
 */
export function ordinal(locale: Locale, n: number): string {
  if (locale === "ru") return `${n}-й`;
  if (locale === "hy") return n === 1 ? "1-ին" : `${n}-րդ`;

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
