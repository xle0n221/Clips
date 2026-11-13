import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Kino-Look als DOM-Ebene direkt über der 3D-Leinwand (unter Stickern/Untertiteln):
 * - Filmkorn: SVG-`feTurbulence`, Seed wechselt jedes Bild (deterministisch aus dem Frame), `overlay`-Mischung.
 * - Vignette: weicher dunkler Rand.
 * - Geringe Schärfentiefe (Tilt-Shift-Näherung): oberer/unterer Bildrand per `backdrop-filter` weich gezeichnet,
 *   Übergang über eine Verlaufs-Maske. `dof` = [Anteil oben, Anteil unten, Unschärfe px]; 0 = aus.
 * Nur aktiv, wenn eine Episode sie in `EPISODE_CONFIG` einträgt (`filmLook`).
 */
export type FilmLookSpec = {
  readonly grain?: number;
  readonly vignette?: number;
  readonly dof?: readonly [number, number, number];
};

export const FilmLook: React.FC<{ readonly spec: FilmLookSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { grain = 0.1, vignette = 0.55, dof } = spec;
  const seed = (frame * 7) % 97;
  const band = (from: "top" | "bottom", share: number, blur: number) =>
    share > 0 && blur > 0 ? (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [from]: 0,
          height: `${share * 100}%`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: `linear-gradient(to ${from === "top" ? "bottom" : "top"}, black 0%, black 35%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to ${from === "top" ? "bottom" : "top"}, black 0%, black 35%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />
    ) : null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dof ? band("top", dof[0], dof[2]) : null}
      {dof ? band("bottom", dof[1], dof[2]) : null}
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      ) : null}
      {grain > 0 ? (
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: grain }}>
          <filter id={`grain-${seed}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
