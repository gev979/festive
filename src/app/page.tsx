import { getBirthdayConfig } from "@/lib/config";
import { BirthdayExperience } from "@/components/experience/birthday-experience";

/**
 * The page reports an age, day counts, and whether today *is* the birthday, so
 * it must not stay frozen at build time. Revalidating keeps the numbers rolling
 * over without giving up CDN caching.
 */
export const revalidate = 900;

/**
 * The whole site is this one page. Config is read on the server so the client
 * bundle receives one plain object instead of importing the config itself.
 */
export default function Page() {
  const config = getBirthdayConfig();
  return <BirthdayExperience config={config} />;
}
