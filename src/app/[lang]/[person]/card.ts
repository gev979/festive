import { notFound } from "next/navigation";

import { LOCALES, isLocale } from "@/i18n/config";
import { getBirthdayConfig } from "@/lib/config";
import { EVERYONE, PERSON_KEYS, getPerson } from "@/lib/people";

export type CardParams = Promise<{ lang: string; person: string }>;

/**
 * Every card there is: the standard one and each person's, in every language.
 * The page and its preview images each prerender this list — image routes do
 * not inherit it from the layout.
 */
export function cardParams() {
  return LOCALES.flatMap((lang) => PERSON_KEYS.map((person) => ({ lang, person })));
}

/** Every file in this route reads the same card from the same two segments. */
export async function loadCard(params: CardParams) {
  const { lang, person } = await params;
  if (!isLocale(lang) || (person !== EVERYONE && !getPerson(person))) notFound();
  return getBirthdayConfig(lang, person);
}
