import type { Person } from "@/lib/config";

/**
 * Only what differs from the defaults. Everything else — theme, emoji, music,
 * and every text on the card — comes from `DEFAULTS` in
 * `src/celebration.config.ts` and from `src/i18n/messages/`.
 */
export const dia: Person = {
  name: "Dia",
  from: "Gev",
  birthDate: "1989-11-26",

  // Wording per language. Anything missing here uses the shared default text
  // for that language — to give Dia a personal letter in English, add e.g.
  //   en: { message: ["First paragraph.", "Second paragraph."] },
  texts: {
    hy: { name: "Դիա", from: "Գև" },
    ru: { name: "Диа", from: "Гев" },
  },
};
