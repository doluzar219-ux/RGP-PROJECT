import confetti from "canvas-confetti";

/**
 * Paper-scrap confetti.
 *
 * Everything here fires from inside effects/event handlers (never during
 * render) because canvas-confetti is inherently impure — it writes to a
 * canvas and consults Math.random().
 */

/** Palette pulled from the scrapbook: ink, clay, marigold, sage, lilac, rose. */
export const SCRAP_COLORS = [
  "#fffcf2", // card cream
  "#e8bb52", // marigold
  "#cf7a4e", // clay
  "#8fae86", // sage
  "#85aecb", // sky
  "#b39cd0", // lilac
  "#dd8b95", // rose
];

const PREFERS_REDUCED_MOTION = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A modest burst — used when a single quest is stamped complete. */
export function paperBurst(originX = 0.5, originY = 0.5) {
  if (PREFERS_REDUCED_MOTION()) return;
  confetti({
    particleCount: 26,
    spread: 58,
    startVelocity: 26,
    gravity: 0.9,
    ticks: 190,
    scalar: 0.85,
    angle: 60,
    origin: { x: originX, y: originY },
    colors: SCRAP_COLORS,
    shapes: ["square"],
    zIndex: 90,
    disableForReducedMotion: true,
  });
}

/** The big one — a level-up deserves both cannons. */
export function levelUpBurst() {
  if (PREFERS_REDUCED_MOTION()) return;

  const base = {
    particleCount: 60,
    spread: 70,
    startVelocity: 42,
    gravity: 0.85,
    ticks: 260,
    scalar: 1.05,
    colors: SCRAP_COLORS,
    shapes: ["square"] as confetti.Shape[],
    zIndex: 90,
    disableForReducedMotion: true,
  };

  // left cannon
  confetti({ ...base, angle: 62, origin: { x: 0.02, y: 0.72 } });
  // right cannon
  confetti({
    ...base,
    angle: 118,
    origin: { x: 0.98, y: 0.72 },
    particleCount: 55,
  });

  // a slower, lazier sprinkle down the middle a beat later
  window.setTimeout(() => {
    if (PREFERS_REDUCED_MOTION()) return;
    confetti({
      particleCount: 40,
      spread: 120,
      startVelocity: 18,
      gravity: 0.6,
      ticks: 320,
      scalar: 0.7,
      origin: { x: 0.5, y: 0.35 },
      colors: SCRAP_COLORS,
      shapes: ["square"],
      zIndex: 90,
      disableForReducedMotion: true,
    });
  }, 220);
}
