import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { EVERYONE, findPersonKey } from "@/lib/people";

/**
 * Links stay short and readable — `/`, `/hy`, `/ru?for=dia` — while every
 * card is prerendered at `/[lang]/[person]`. This maps one onto the other,
 * with a rewrite, so the address bar keeps the link as it was shared.
 *
 * Anything that does not name a real card goes back to the standard one: an
 * unknown `for` to the standard card in the same language, an unknown first
 * segment to `/`.
 */
export function proxy(request: NextRequest) {
  const segment = request.nextUrl.pathname.slice(1);

  // Framework paths (/__nextjs_…) and stray files (/favicon.ico) are not cards.
  if (segment.startsWith("_") || segment.includes(".")) return NextResponse.next();

  if (segment && !isLocale(segment)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // English is the default and lives at the root, so /en is only an alias.
  if (segment === DEFAULT_LOCALE) {
    const root = request.nextUrl.clone();
    root.pathname = "/";
    return NextResponse.redirect(root);
  }

  const lang = segment || DEFAULT_LOCALE;
  const requested = request.nextUrl.searchParams.get("for");
  const person = requested === null ? EVERYONE : findPersonKey(requested);

  if (!person) {
    return NextResponse.redirect(new URL(lang === DEFAULT_LOCALE ? "/" : `/${lang}`, request.url));
  }

  return NextResponse.rewrite(new URL(`/${lang}/${person}`, request.url));
}

export const config = {
  // Only the public shapes. Deeper paths — the cards themselves and their
  // preview images — are served as they are.
  matcher: ["/", "/:segment"],
};
