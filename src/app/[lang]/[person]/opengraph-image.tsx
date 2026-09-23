import { ImageResponse } from "next/og";

import { getMessages } from "@/i18n";
import { fill } from "@/i18n/format";
import { fontsFor } from "@/lib/og-fonts";
import { PALETTES } from "@/lib/palette";
import { cardParams, loadCard, type CardParams } from "./card";

export const alt = "An interactive birthday card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const generateStaticParams = cardParams;

/** Matches the page: the preview mentions the age, so it cannot be frozen. */
export const revalidate = 900;

/**
 * Link previews are generated from the same card as the page, so sharing the
 * link in a chat already shows the right name, language and theme.
 */
export default async function OpengraphImage({ params }: { params: CardParams }) {
  const config = await loadCard(params);
  const { meta } = getMessages(config.locale);
  const palette = PALETTES[config.theme];
  const lap = config.ordinalBirthday
    ? fill(meta.imageLap, { ordinal: config.ordinalBirthday })
    : null;
  const from = fill(meta.imageFrom, { from: config.from });
  const fonts = await fontsFor([meta.imageKicker, config.name, lap, from].join(" "));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: palette.surface,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -240,
            left: -160,
            width: 780,
            height: 780,
            borderRadius: 9999,
            background: `radial-gradient(circle at center, ${palette.c1}, transparent 68%)`,
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -220,
            bottom: -280,
            width: 820,
            height: 820,
            borderRadius: 9999,
            background: `radial-gradient(circle at center, ${palette.c2}, transparent 68%)`,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 180,
            top: 120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: `radial-gradient(circle at center, ${palette.c3}, transparent 70%)`,
            opacity: 0.6,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 10,
              textTransform: "uppercase",
              color: palette.ink,
              opacity: 0.7,
            }}
          >
            {meta.imageKicker}
          </div>
          <div
            style={{
              fontSize: config.name.length > 14 ? 96 : 132,
              fontWeight: 700,
              lineHeight: 1,
              color: palette.ink,
              letterSpacing: -3,
            }}
          >
            {config.name}
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 14,
              fontSize: 26,
              color: palette.ink,
              opacity: 0.85,
            }}
          >
            {lap ? (
              <span
                style={{
                  border: `2px solid ${palette.c3}`,
                  borderRadius: 9999,
                  padding: "10px 26px",
                }}
              >
                {lap}
              </span>
            ) : null}
            <span
              style={{
                border: `2px solid ${palette.c2}`,
                borderRadius: 9999,
                padding: "10px 26px",
              }}
            >
              {from}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
