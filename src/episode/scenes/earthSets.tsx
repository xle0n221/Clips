import React from "react";
import { C, Clothes, Layer, MOODS, Mood, MoonDisc, Skyline, Stars } from "../kit2d";

/**
 * Wiederkehrende 2D-Kulissen für „Earth Without Humans“ (scenes/earth*.tsx).
 * Straße (Hook + Ende), Weltraum-Hintergrund.
 */

/** Nachtstraße mit 3 Silhouetten-Ebenen (Parallax), Mond, Sternen; Bodenkante y 1200. */
export const StreetSet: React.FC<{
  readonly f: number;
  readonly mood?: Mood;
  /** Anteil leuchtender Fenster 0..1 */
  readonly lit: number;
  /** Sterne-Sichtbarkeit (Lichtverschmutzung: wenige) */
  readonly stars?: number;
  /** Himmel nach oben verlängern (Ende: Kamera kommt aus dem All) */
  readonly tallSky?: boolean;
  readonly piles?: boolean;
}> = ({ f, mood = "night", lit, stars = 0.25, tallSky = false, piles = false }) => {
  const sil = MOODS[mood].sil;
  return (
    <>
      <Layer depth={0.15}>
        <Stars frame={f} seed={21} count={tallSky ? 260 : 90} x={-300} y={tallSky ? -1700 : -100} w={1700} h={tallSky ? 2700 : 1000} reveal={stars} />
        <MoonDisc x={830} y={330} s={0.8} />
      </Layer>
      <Layer depth={0.35}>
        <Skyline seed={2} baseY={1110} minH={320} maxH={780} color={sil[0]} litFrac={lit * 0.55} />
      </Layer>
      <Layer depth={0.6}>
        <Skyline seed={5} baseY={1170} minH={200} maxH={560} color={sil[1]} litFrac={lit * 0.75} />
      </Layer>
      <Layer depth={1}>
        <rect x={-1200} y={1196} width={3600} height={1600} fill={sil[2]} />
        <rect x={-1200} y={1196} width={3600} height={14} fill="#1E2752" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={-1100 + i * 240} y={1420} width={130} height={14} rx={6} fill="#2A3460" />
        ))}
        {piles ? <StreetPiles /> : null}
      </Layer>
    </>
  );
};

/** Feste Lage der Kleiderhaufen (Hook nach dem POOF, Ende). */
export const PEOPLE = [
  { x: -60, c: "#3E6FD8", dir: 1 },
  { x: 140, c: "#C0362C", dir: -1 },
  { x: 330, c: "#4E9A6E", dir: 1 },
  { x: 760, c: "#8A5CC2", dir: -1 },
  { x: 930, c: "#E07A2E", dir: 1 },
  { x: 1120, c: "#3E6FD8", dir: -1 },
];
export const StreetPiles: React.FC = () => (
  <>
    {PEOPLE.map((p, i) => (
      <Clothes key={i} x={p.x + p.dir * 40} y={1240} color={p.c} s={1.05} />
    ))}
  </>
);

/** Weltraum-Hintergrund: zwei Sternschichten mit Parallax. */
export const SpaceBack: React.FC<{ readonly f: number; readonly seed?: number }> = ({ f, seed = 31 }) => (
  <>
    <Layer depth={0.08}>
      <Stars frame={f} seed={seed} count={150} x={-900} y={-1200} w={2900} h={4300} color="#C9D6FF" />
    </Layer>
    <Layer depth={0.25}>
      <Stars frame={f} seed={seed + 1} count={70} x={-900} y={-1200} w={2900} h={4300} />
    </Layer>
  </>
);

export { C };
