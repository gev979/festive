import { ImageResponse } from "next/og";

import { getBirthdayConfig } from "@/lib/config";
import { PALETTES } from "@/lib/palette";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: the celebrant's initial on the active theme's gradient. */
export default async function Icon() {
  const config = getBirthdayConfig();
  const palette = PALETTES[config.theme];
  const initial = config.name.trim().charAt(0).toUpperCase() || "B";

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
    size,
  );
}
