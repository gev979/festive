import { ImageResponse } from "next/og";

import { fontsFor } from "@/lib/og-fonts";
import { PALETTES } from "@/lib/palette";
import { cardParams, loadCard, type CardParams } from "./card";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export const generateStaticParams = cardParams;

/** Favicon: the celebrant's initial, in the card's language, on its theme's gradient. */
export default async function Icon({ params }: { params: CardParams }) {
  const config = await loadCard(params);
  const palette = PALETTES[config.theme];
  const initial = config.name.charAt(0).toUpperCase() || "B";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: `linear-gradient(135deg, ${palette.c3}, ${palette.c1} 55%, ${palette.c2})`,
          color: palette.surface,
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        {initial}
      </div>
    ),
    { ...size, fonts: await fontsFor(initial) },
  );
}
