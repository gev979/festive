import { getMessages } from "@/i18n";
import { BirthdayExperience } from "@/components/experience/birthday-experience";
import { loadCard, type CardParams } from "./card";

/**
 * The page reports an age, day counts, and whether today *is* the birthday, so
 * it must not stay frozen at build time. Revalidating keeps the numbers rolling
 * over without giving up CDN caching.
 */
export const revalidate = 900;

/**
 * One card: a person (or the standard card) in one language. Both are resolved
 * on the server, so the client receives two plain objects — the card and its
 * wording — instead of every person in every language.
 */
export default async function Page({ params }: { params: CardParams }) {
  const config = await loadCard(params);
  return <BirthdayExperience config={config} messages={getMessages(config.locale)} />;
}
