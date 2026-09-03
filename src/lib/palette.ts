import type { ThemeName } from "@/lib/config";

/**
 * Hex mirror of the CSS custom properties in `globals.css`. The OG image is
 * rendered by Satori, which has no CSS variables, so the values live here too.
 * Keep the two in sync when adding a theme.
 */
export const PALETTES: Record<ThemeName, {
  surface: string;
  ink: string;
  c1: string;
  c2: string;
  c3: string;
}> = {
  aurora: { surface: "#05040f", ink: "#f6f4ff", c1: "#7c5cff", c2: "#22d3ee", c3: "#f472b6" },
  sunset: { surface: "#140a08", ink: "#fff4ec", c1: "#ff8a3d", c2: "#ff3d77", c3: "#ffd166" },
  candy: { surface: "#0d0a14", ink: "#fdf2ff", c1: "#ff9ecd", c2: "#7ce7d8", c3: "#b79cff" },
  cosmos: { surface: "#03050e", ink: "#eef3ff", c1: "#6366f1", c2: "#06b6d4", c3: "#fbbf24" },
  orchard: { surface: "#05120c", ink: "#f0fff7", c1: "#34d399", c2: "#fde68a", c3: "#fb7185" },
};
