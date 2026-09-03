import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { getBirthdayConfig } from "@/lib/config";
import "./globals.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const config = getBirthdayConfig();
  const title = `Happy Birthday, ${config.name}`;
  const description = config.ordinalAge
    ? `An interactive card for ${config.nickname}'s ${config.ordinalAge} birthday. Open the parcel, blow out the candles, make a wish.`
    : `An interactive birthday card for ${config.nickname}. Open the parcel, blow out the candles, make a wish.`;

  return {
    metadataBase: resolveBaseUrl(config.siteUrl),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getBirthdayConfig();

  return (
    <html
      lang="en"
      data-theme={config.theme}
      className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
