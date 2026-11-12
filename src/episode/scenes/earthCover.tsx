import React from "react";
import { useCurrentFrame } from "remotion";
import { Ghost, H, MOODS, NightEarth, Stars, W } from "../kit2d";

/**
 * Thumbnail-Motiv „Earth Without Us“ (docs/clip-regeln.md → „Thumbnail im Video“):
 * Erde bei Nacht mit Stadtlichtern, davor YOU (Geist) groß, staunend – Hauptfigur + Kernbild des Themas.
 * Titel liegt oben (overlays/Cover.tsx), daher Motiv in der Bildmitte/unten.
 */
export const EarthCoverArt: React.FC = () => {
  const frame = useCurrentFrame();
  const sky = MOODS.space;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill={sky.sky[1]} />
      <Stars frame={frame} />
      <NightEarth x={540} y={1180} s={1.55} frame={frame} />
      <Ghost x={540} y={1760} s={1.5} frame={frame} eyes="wide" eyePop={1.3} mouth="o" armL={40} armR={40} />
    </svg>
  );
};
