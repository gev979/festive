import type { Person, ThemeName } from "@/lib/config";
import { dia } from "@/people/dia";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WHO GETS A CARD.
 *
 * Each person lives in their own file in `src/people/`. The key they are
 * registered under here is what goes in the link, matched ignoring case:
 *
 *   /?for=dia      English
 *   /hy?for=dia    Armenian
 *   /ru?for=dia    Russian
 *
 * A link without `for` shows the standard card; a `for` that is not listed
 * here redirects to it. Keys are lowercase letters, digits and dashes, and
 * `everyone` is taken (it is the standard card's own address).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const PEOPLE: Record<string, Person> = {
  dia,
};

/**
 * What a person gets for anything they leave out. The default *wording*, in
 * every language, lives in `src/i18n/messages/`.
 */
export const DEFAULTS: {
  theme: ThemeName;
  emojis: string[];
  photoUrl: string | null;
  music: boolean;
  candles: number | null;
} = {
  theme: "aurora",
  emojis: ["🎉", "🎂", "✨", "🎈", "💫"],
  photoUrl: null,
  music: true,
  candles: null,
};

/**
 * Canonical URL, used for link previews. On Vercel the deployment URL is
 * detected automatically, so this is only needed for a custom domain.
 */
export const SITE_URL: string | null = null;
