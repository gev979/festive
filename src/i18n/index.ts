import type { Locale } from "@/i18n/config";
import { en, type Messages } from "@/i18n/messages/en";
import { hy } from "@/i18n/messages/hy";
import { ru } from "@/i18n/messages/ru";

export type { Messages };

const MESSAGES: Record<Locale, Messages> = { en, hy, ru };

/**
 * Server-side only by convention: pages pass the result down as a prop, so the
 * browser receives the one language it is showing rather than all of them.
 */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
