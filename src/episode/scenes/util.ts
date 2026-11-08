import { Easing, interpolate } from "remotion";

/** 0..1 zwischen zwei Frames (geclamped, weich). */
export const ease = (
  frame: number,
  a: number,
  b: number,
  easing = Easing.inOut(Easing.cubic),
) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
