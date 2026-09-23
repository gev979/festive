import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Literata,
  Noto_Sans_Armenian,
  Noto_Serif_Armenian,
} from "next/font/google";

import { SITE_URL } from "@/celebration.config";
import { getMessages } from "@/i18n";
import { fill } from "@/i18n/format";
import { cardParams, loadCard, type CardParams } from "./card";
import "@/app/globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Fraunces has no Cyrillic and none of the above has Armenian, so those scripts
// get faces of their own, picked per language in globals.css. They are not
// preloaded: only a page that actually draws them downloads them.
const literata = Literata({
  subsets: ["cyrillic"],
  variable: "--font-literata",
  display: "swap",
  preload: false,
});
const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-sans-armenian",
  display: "swap",
  preload: false,
});
const notoSerifArmenian = Noto_Serif_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-serif-armenian",
  display: "swap",
  preload: false,
});

const FONT_VARIABLES = [geist, geistMono, fraunces, literata, notoSansArmenian, notoSerifArmenian]
  .map((font) => font.variable)
  .join(" ");

export const generateStaticParams = cardParams;

// Nothing else exists. Shared links never get here with a wrong name anyway:
// `src/proxy.ts` sends those back to the standard card first.
export const dynamicParams = false;

function resolveBaseUrl(configured: string | null): URL | undefined {
  const candidate =
    configured ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : null);
  if (!candidate) return undefined;
  try {
    return new URL(candidate);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: { params: CardParams }): Promise<Metadata> {
  const config = await loadCard(params);
  const { meta } = getMessages(config.locale);
  const title = fill(meta.title, { name: config.name });
  const description = config.ordinalBirthday
    ? fill(meta.description, { nickname: config.nickname, ordinal: config.ordinalBirthday })
    : fill(meta.descriptionNoAge, { nickname: config.nickname });

  return {
    metadataBase: resolveBaseUrl(SITE_URL),
    title,
    description,
    applicationName: "Festive",
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#05040f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * The root layout sits under the card's segments so that the language and the
 * theme can go on `<html>` itself — dialogs and tooltips render in portals
 * outside the page, and they need both too.
 */
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: CardParams;
}) {
  const config = await loadCard(params);

  return (
    <html
      lang={config.locale}
      data-theme={config.theme}
      className={FONT_VARIABLES}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
