import confetti from "canvas-confetti";

/**
 * Confetti reads the active theme's accent colors straight off the CSS custom
 * properties, so every burst matches whatever `theme` is set to in the config.
 */
export function themeColors(): string[] {
  if (typeof window === "undefined") return ["#7c5cff", "#22d3ee", "#f472b6"];
  const styles = getComputedStyle(document.documentElement);
  const colors = ["--c1", "--c2", "--c3", "--ink"]
    .map((token) => styles.getPropertyValue(token).trim())
    .filter(Boolean);
  return colors.length ? colors : ["#7c5cff", "#22d3ee", "#f472b6"];
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function burst(options: confetti.Options = {}) {
  if (prefersReducedMotion()) return;
  confetti({
    particleCount: 90,
    spread: 78,
    startVelocity: 42,
    origin: { y: 0.62 },
    colors: themeColors(),
    disableForReducedMotion: true,
    ...options,
  });
}

/** Two angled cannons from the bottom corners — the "reveal" moment. */
export function cannons() {
  if (prefersReducedMotion()) return;
  const colors = themeColors();
  const shared: confetti.Options = {
    particleCount: 120,
    spread: 62,
    startVelocity: 62,
    ticks: 260,
    colors,
    disableForReducedMotion: true,
  };
  confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.9 } });
  confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.9 } });
}

/** A small pop anchored to a screen coordinate (candle blowouts, taps). */
export function popAt(x: number, y: number, options: confetti.Options = {}) {
  if (prefersReducedMotion()) return;
  confetti({
    particleCount: 34,
    spread: 360,
    startVelocity: 22,
    scalar: 0.75,
    ticks: 130,
    gravity: 0.7,
    colors: themeColors(),
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    disableForReducedMotion: true,
    ...options,
  });
}

/** Emoji confetti built from the configured emoji list. */
export function emojiBurst(emojis: string[], options: confetti.Options = {}) {
  if (prefersReducedMotion() || !emojis.length) return;
  const shapes = emojis.slice(0, 5).map((emoji) => confetti.shapeFromText({ text: emoji, scalar: 2.4 }));
  confetti({
    particleCount: 26,
    spread: 110,
    startVelocity: 34,
    scalar: 2.4,
    shapes,
    flat: true,
    ticks: 320,
    origin: { y: 0.55 },
    disableForReducedMotion: true,
    ...options,
  });
}

/** Sustained finale: random small bursts across the top of the viewport. */
export function fireworks(durationMs = 4200) {
  if (prefersReducedMotion()) return () => {};
  const end = Date.now() + durationMs;
  const colors = themeColors();
  let frame = 0;

  const tick = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 3,
      startVelocity: 26,
      spread: 360,
      ticks: 220,
      gravity: 0.5,
      scalar: 0.9,
      colors,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      disableForReducedMotion: true,
    });
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/** Slow drifting glitter used as ambient texture behind the finale. */
export function glitterFall(durationMs = 6000) {
  if (prefersReducedMotion()) return;
  const colors = themeColors();
  const end = Date.now() + durationMs;
  const tick = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 2,
      startVelocity: 0,
      ticks: 420,
      gravity: 0.32,
      spread: 180,
      scalar: 0.6,
      colors,
      origin: { x: Math.random(), y: -0.05 },
      disableForReducedMotion: true,
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
