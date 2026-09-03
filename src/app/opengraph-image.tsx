import { ImageResponse } from "next/og";

import { getBirthdayConfig } from "@/lib/config";
import { PALETTES } from "@/lib/palette";

export const alt = "An interactive birthday card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Matches the page: the preview mentions the age, so it cannot be frozen. */
export const revalidate = 900;

/**
 * Link previews are generated from the same config as the page, so sharing
 * the URL in a chat already shows the right name and theme.
 */
export default async function OpengraphImage() {
  const config = getBirthdayConfig();
  const palette = PALETTES[config.theme];

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
            happy birthday
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
            {config.ordinalBirthday ? (
              <span
                style={{
                  border: `2px solid ${palette.c3}`,
                  borderRadius: 9999,
                  padding: "10px 26px",
                }}
              >
                {config.ordinalBirthday} lap around the sun
              </span>
            ) : null}
            <span
              style={{
                border: `2px solid ${palette.c2}`,
                borderRadius: 9999,
                padding: "10px 26px",
              }}
            >
              from {config.from}
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
