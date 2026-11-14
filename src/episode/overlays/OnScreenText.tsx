import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CAPTION_FONT } from "./fonts";

/**
 * Handlungs-Phrase je Szene (Erweiterung „Continuous Improvement“ Regel 4, Drehbuch-Feld `scenes[].onScreen`):
 * oberes Drittel, ganze Szene, WEISS mit schwarzem Rand + Akzentbalken – farblich getrennt von den gelben
 * Untertiteln unten. Blendet je Szene 6 Bilder ein. Ohne `items` wird nichts gezeichnet.
 */
export const OnScreenText: React.FC<{
  readonly items: readonly { readonly text: string; readonly from: number; readonly to: number }[];
  readonly top?: number;
  readonly accent?: string;
  /** dunkle Platte hinter dem Text (Kontrast auf hellem/unruhigem Grund) */
  readonly plate?: boolean;
}> = ({ items, top = 150, accent = "#FFB23E", plate = false }) => {
  const frame = useCurrentFrame();
  const it = items.find((x) => frame >= x.from && frame < x.to);
  if (!it) return null;
  const local = frame - it.from;
  // mit Platte sofort voll deckend (kein halbtransparentes Einblenden über hellem Grund)
  const o = plate ? 1 : interpolate(local, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(local, [0, 6], [-14, 0], { extrapolateRight: "clamp" });
  const size = it.text.length > 22 ? 58 : 66;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: top + y, left: 70, right: 70, textAlign: "center", opacity: o }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: CAPTION_FONT,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.08,
            color: "#FFFFFF",
            textTransform: "uppercase",
            WebkitTextStroke: "14px #000",
            paintOrder: "stroke",
            textShadow: "0 6px 0 rgba(0,0,0,0.8), 0 0 22px rgba(0,0,0,0.6)",
            letterSpacing: 1,
            ...(plate ? { background: "rgba(4,6,14,0.88)", borderRadius: 22, padding: "14px 30px 18px" } : {}),
          }}
        >
          {it.text}
        </div>
        <div style={{ margin: "14px auto 0", width: 120, height: 8, borderRadius: 4, background: accent, boxShadow: "0 0 0 4px #000" }} />
      </div>
    </AbsoluteFill>
  );
};
