import type { Person } from "@/lib/config";

/**
 * Only what differs from the defaults. Everything else — theme, emoji, music,
 * and every text on the card — comes from `DEFAULTS` in
 * `src/celebration.config.ts` and from `src/i18n/messages/`.
 */
export const miriam: Person = {
  name: "Miriam",
  from: "Gev",
  birthDate: "2004-09-05",

  // Wording per language. Anything missing here uses the shared default text
  // for that language — to give Miriam her own letter in English, add e.g.
  //   en: { message: ["First paragraph.", "Second paragraph."] },
  texts: {
    hy: { name: "Միրիամ", from: "Գև" },
    ru: { name: "Мириам", from: "Гев" },
  },
};
