import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CoverSpec } from "../types";

/** Bilder, die das Cover voll zeigt (danach 6 Bilder Ausblenden) – Regel: 0,5 s bei 30 fps. */
export const coverFrames = (c?: CoverSpec) => (c ? Math.max(1, c.frames ?? 15) : 0);
const FADE = 6;
/** Erstes Bild ohne Cover: HUD und Sticker erst ab hier (kein Textbrei beim Ausblenden). */
export const coverClear = (c?: CoverSpec) => (c ? coverFrames(c) + FADE : 0);

/**
 * Thumbnail-Cover (docs/clip-regeln.md → „Thumbnail im Video“): liegt über der ersten Szene,
 * damit der Nutzer auf YouTube/TikTok genau dieses Bild als Thumbnail wählen kann.
 * Titel mittig im sicheren Bereich, unteres Drittel frei; danach weiches Ausblenden in den Hook.
 */
export const Cover: React.FC<{ readonly cover: CoverSpec; readonly art?: React.FC }> = ({ cover, art: Art }) => {
  const frame = useCurrentFrame();
  const n = coverFrames(cover);
  if (frame >= n + FADE) return null;
  const o = interpolate(frame, [n - 1, n - 1 + FADE], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const words = cover.text.split(" ");
  // Zwei Zeilen, möglichst gleich lang
  let best = 1;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    const bestA = words.slice(0, best).join(" ").length;
    const bestB = words.slice(best).join(" ").length;
    if (Math.abs(a - b) < Math.abs(bestA - bestB)) best = i;
  }
  const lines = words.length > 2 ? [words.slice(0, best).join(" "), words.slice(best).join(" ")] : [cover.text];
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(170, Math.floor(1700 / Math.max(6, longest)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Art ? <Art /> : null}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,6,20,0.92) 0%, rgba(4,6,20,0.55) 30%, rgba(4,6,20,0.05) 52%, rgba(4,6,20,0) 62%, rgba(4,6,20,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 900,
        }}
      >
        {lines.map((l) => (
          <div
            key={l}
            style={{
              fontSize: size,
              lineHeight: 1.02,
              color: "#FFD23F",
              letterSpacing: -2,
              textShadow: "0 8px 0 #000, 0 0 40px rgba(0,0,0,0.85)",
              WebkitTextStroke: "6px #0A0D22",
              paintOrder: "stroke fill",
            }}
          >
            {l}
          </div>
        ))}
        {cover.sub ? (
          <div
            style={{
              marginTop: 34,
              // lange Unterzeilen in einer Zeile halten (kein einzelnes Wort in Zeile 2)
              fontSize: Math.min(52, Math.floor(1520 / Math.max(1, cover.sub.length))),
              whiteSpace: "nowrap",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.15,
              textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,0.9)",
            }}
          >
            {cover.sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
