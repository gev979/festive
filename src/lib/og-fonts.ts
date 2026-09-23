/**
 * `next/og` draws with one bundled face that covers Latin and Cyrillic only, so
 * Armenian text on a preview image or favicon would come out blank. For those,
 * a font is fetched from Google Fonts, cut down to exactly the characters being
 * drawn. If that fails the image still renders, just without those glyphs.
 */
const ARMENIAN = /[԰-֏ﬓ-ﬗ]/;

type ImageFont = { name: string; data: ArrayBuffer; weight: 400; style: "normal" };

export async function fontsFor(text: string): Promise<ImageFont[] | undefined> {
  if (!ARMENIAN.test(text)) return undefined;

  // Uppercase too: `textTransform: uppercase` is applied before glyph lookup.
  const glyphs = [...new Set(text + text.toUpperCase())].join("");
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian&text=${encodeURIComponent(glyphs)}`,
    ).then((response) => response.text());
    // Without a browser user agent the API answers with TrueType, which is what Satori reads.
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!url) return undefined;

    const response = await fetch(url);
    if (!response.ok) return undefined;
    return [
      { name: "Noto Sans Armenian", data: await response.arrayBuffer(), weight: 400, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}
