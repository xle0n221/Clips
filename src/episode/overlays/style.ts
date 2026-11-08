import { Easing, interpolate } from "remotion";

/** Gemeinsamer Sticker-Look der Overlays: dicke schwarze Kontur, harte Schatten. */
export const INK = "#111";
export const ACCENT = "#FFD23F";
export const DANGER = "#FF3B30";
export const OUTLINE = 7;
export const hardShadow = (y: number) => `0 ${y}px 0 ${INK}`;

/** Text in Großbuchstaben mit schwarzer Kontur (wie die Untertitel, nur kleiner). */
export const strokeText = (px: number) => ({
  WebkitTextStroke: `${px}px ${INK}`,
  paintOrder: "stroke" as const,
});

/** Helle Füllfarbe? Dann schwarze Schrift, sonst weiße. */
export const isLight = (hex: string) => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};

export const clamp01 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Wert eines Kanals zu Frame f: letzte Änderung + Fortschritt seit dieser Änderung. */
export type Track = { from: number; to: number; since: number };

export const trackAt = (
  initial: number,
  changes: { frame: number; value: number }[],
  frame: number,
): Track => {
  let from = initial;
  let to = initial;
  let since = 1e9;
  for (const c of changes) {
    if (c.frame > frame) break;
    from = to;
    to = c.value;
    since = frame - c.frame;
  }
  return { from, to, since };
};

export const tween = (t: Track, frames: number) =>
  interpolate(t.since, [0, frames], [t.from, t.to], {
    ...clamp01,
    easing: Easing.out(Easing.cubic),
  });
