import { PEOPLE } from "@/celebration.config";
import type { Person } from "@/lib/config";

/** The route segment of the standard card, shown when a link names nobody. */
export const EVERYONE = "everyone";

/** Every card that exists: the standard one and one per person. */
export const PERSON_KEYS = [EVERYONE, ...Object.keys(PEOPLE)];

const byLowercaseKey = new Map(Object.keys(PEOPLE).map((key) => [key.toLowerCase(), key]));

/** Matches a `?for=` value to a registered key, forgiving case and stray spaces. */
export function findPersonKey(requested: string): string | null {
  return byLowercaseKey.get(requested.trim().toLowerCase()) ?? null;
}

/** null for the standard card. */
export function getPerson(key: string): Person | null {
  if (key === EVERYONE || !Object.hasOwn(PEOPLE, key)) return null;
  return PEOPLE[key];
}
