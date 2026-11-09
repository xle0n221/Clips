import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CameraRig, NO_RIG } from "./camera";
import { seeded, INK } from "./toon";

/**
 * Übergangs-Baukasten für EINE ThreeCanvas (docs/design-system.md §10, animation-techniken.md Top 1/2).
 * Alle Übergänge verstecken den harten Schnitt (Unschärfe, Form, Farbe) statt zu überblenden –
 * es wird nie mehr als eine Szene gleichzeitig gerendert. Alles reine Funktion von `frame`.
 *
 * Arten:
 * - `flash` – bisheriger weißer Blitz + Zoom-Stoß (Standard, wenn nichts gesetzt ist)
 * - `tint`  – derselbe Blitz in Akzentfarbe (für Pointen)
 * - `whip`  – Reißschwenk: Kamera dreht in den letzten `frames` Bildern weg, B dreht aus derselben
 *             Richtung ein; dazwischen waagrechte Bewegungsunschärfe + Speed-Streifen
 * - `wipe`  – Form-Wipe/Iris: Form wächst bis bildfüllend, Schnitt, Form öffnet sich als Loch
 * - `zoom`  – Zoom-Through: Kamera fährt ins Bild, Farbe schließt sich von außen, B fährt zurück
 * - `match` – Match Cut: harter Schnitt + 4 Bilder kleiner Zoom-Stoß (gleiche Form an gleicher
 *             Bildstelle selbst per `aimAt` planen)
 * - `cut`   – harter Schnitt ohne alles
 */
export type WipeShape = "circle" | "star" | "hex" | "diamond" | "burst";
export type TransitionSpec = {
  readonly kind: "flash" | "tint" | "whip" | "wipe" | "zoom" | "match" | "cut";
  /** Bilder vor UND nach dem Schnitt (Standard: whip 6, wipe 8, zoom 8, tint 6) */
  readonly frames?: number;
  /** whip: 1 = Schwenk nach rechts (Bild zieht nach links), −1 = nach links */
  readonly dir?: 1 | -1;
  /** wipe/zoom/tint: Farbe */
  readonly color?: string;
  readonly shape?: WipeShape;
  /** wipe/zoom: Mittelpunkt in Bildanteilen (Standard Bildmitte etwas über der Mitte) */
  readonly at?: readonly [number, number];
};

export type TransitionState = {
  readonly spec: TransitionSpec;
  /** Frame relativ zum Schnitt: −n..−1 = Ende von A, 0..n−1 = Anfang von B */
  readonly local: number;
  readonly n: number;
};

const DEFAULT_FRAMES: Record<TransitionSpec["kind"], number> = {
  flash: 6,
  tint: 6,
  whip: 6,
  wipe: 8,
  zoom: 8,
  match: 4,
  cut: 0,
};

/**
 * Aktiver Übergang zum (globalen) Frame. `cuts[i]` = erster Frame der Szene i+1,
 * `specs[i]` = Übergang in diese Szene (undefined = alter Blitz).
 */
export const transitionAt = (
  frame: number,
  cuts: readonly number[],
  specs: readonly (TransitionSpec | undefined)[],
): TransitionState | null => {
  // spätester passender Schnitt gewinnt (kurze Szenen: Ende von B überlappt Anfang des nächsten)
  for (let i = cuts.length - 1; i >= 0; i--) {
    const spec = specs[i] ?? { kind: "flash" };
    const n = spec.frames ?? DEFAULT_FRAMES[spec.kind];
    const local = frame - cuts[i];
    const pre = spec.kind === "whip" || spec.kind === "wipe" || spec.kind === "zoom" ? n : 0;
    if (local >= -pre && local < Math.max(n, 12)) return { spec, local, n };
  }
  return null;
};

/** Anteil 0..1 vor dem Schnitt (1 = letztes Bild von A) und nach dem Schnitt (1 = erstes Bild von B). */
const phases = (s: TransitionState) => ({
  pre: s.local < 0 ? (s.local + s.n + 1) / s.n : 0,
  post: s.local >= 0 ? Math.max(0, 1 - s.local / s.n) : 0,
});

/** Kamera-Zusatzbewegung (für `CameraRigContext`). */
export const rigOf = (s: TransitionState | null): CameraRig => {
  if (!s) return NO_RIG;
  const { pre, post } = phases(s);
  const dir = s.spec.dir ?? 1;
  switch (s.spec.kind) {
    case "whip":
      // A dreht beschleunigt weg, B kommt aus der Gegenrichtung und bremst ab
      return { ...NO_RIG, yaw: -dir * 0.55 * pre * pre + dir * 0.55 * post * post, roll: dir * 0.04 * (pre - post) };
    case "zoom":
      return { ...NO_RIG, push: 0.82 * pre * pre * pre + 0.5 * post * post, fov: 1 - 0.1 * pre };
    case "wipe":
      return { ...NO_RIG, push: 0.12 * pre * pre };
    default:
      return NO_RIG;
  }
};

/** Kamera-Leinwand: Zusatz-Filter + Transform. `undefined` = alten Effekt verwenden. */
export const canvasFxOf = (
  s: TransitionState | null,
  filterId = "kit-whip-blur",
): { filter: string; transform: string } | undefined => {
  if (!s || s.spec.kind === "flash") return undefined;
  const { pre, post } = phases(s);
  if (s.spec.kind === "whip") {
    const k = Math.max(pre * pre, post * post);
    if (k <= 0.01) return { filter: "", transform: "" };
    return { filter: `url(#${filterId})`, transform: `scaleX(${1 + 0.04 * k})` };
  }
  if (s.spec.kind === "tint") {
    if (s.local < 0) return { filter: "", transform: "" };
    const punch = interpolate(s.local, [0, 9], [1.12, 1], { extrapolateRight: "clamp" });
    const blur = interpolate(s.local, [0, 5], [10, 0], { extrapolateRight: "clamp" });
    return { filter: `blur(${blur}px)`, transform: `scale(${punch})` };
  }
  if (s.spec.kind === "match") {
    if (s.local < 0) return { filter: "", transform: "" };
    const punch = interpolate(s.local, [0, s.n], [1.06, 1], { extrapolateRight: "clamp" });
    return { filter: "", transform: `scale(${punch})` };
  }
  return { filter: "", transform: "" };
};

/** Stärke der waagrechten Unschärfe beim Whip (px bei 1080 Breite). */
export const whipBlurOf = (s: TransitionState | null) => {
  if (!s || s.spec.kind !== "whip") return 0;
  const { pre, post } = phases(s);
  return 90 * Math.max(pre * pre, post * post);
};

/** SVG-Filter für die Whip-Unschärfe (einmal ins DOM, Leinwand nutzt `url(#id)`). */
export const WhipBlurDefs: React.FC<{ readonly blur: number; readonly id?: string }> = ({
  blur,
  id = "kit-whip-blur",
}) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id={id} x="-20%" y="0%" width="140%" height="100%">
        <feGaussianBlur stdDeviation={`${blur.toFixed(2)} 0`} edgeMode="duplicate" />
      </filter>
    </defs>
  </svg>
);

/**
 * Speed-Streifen als DOM-Ebene (auch einzeln nutzbar, z. B. für schnelle Figuren-Bewegung):
 * `strength` 0..1, `dir` Laufrichtung, `seed` für andere Verteilung.
 */
export const SpeedStreaks: React.FC<{
  readonly strength: number;
  readonly frame: number;
  readonly dir?: 1 | -1;
  readonly color?: string;
  readonly count?: number;
  readonly seed?: number;
  /** vertikaler Bereich in Bildanteilen (Standard ganzes Bild) */
  readonly band?: readonly [number, number];
}> = ({ strength, frame, dir = 1, color = "#FFFFFF", count = 26, seed = 31, band = [0, 1] }) => {
  const lines = React.useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => ({
      y: r(),
      x: r(),
      len: 0.25 + r() * 0.55,
      w: 3 + r() * 7,
      v: 0.6 + r() * 0.8,
    }));
  }, [count, seed]);
  if (strength <= 0.02) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {lines.map((l, i) => {
        const x = (((l.x + frame * 0.21 * l.v) % 1.6) - 0.3) * 1080;
        const y = (band[0] + l.y * (band[1] - band[0])) * 1920;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: y,
              left: dir === 1 ? 1080 - x : x - l.len * 1080 * strength,
              width: l.len * 1080 * strength,
              height: l.w,
              borderRadius: l.w,
              background: color,
              opacity: 0.75 * strength,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* Formen mit Außenradius 1 und Innenkreis-Radius (für „bildfüllend“). */
const polygon = (pts: [number, number][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(4)} ${p[1].toFixed(4)}`).join(" L") + " Z";
const ring = (k: number, rIn: number, off = -Math.PI / 2) =>
  Array.from({ length: k * 2 }, (_, i): [number, number] => {
    const a = off + (i * Math.PI) / k;
    const r = i % 2 ? rIn : 1;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
const SHAPES: Record<WipeShape, { d: string; inner: number }> = {
  circle: { d: "M -1 0 A 1 1 0 1 0 1 0 A 1 1 0 1 0 -1 0 Z", inner: 1 },
  star: { d: polygon(ring(5, 0.48)), inner: 0.48 * Math.cos(Math.PI / 5) },
  hex: {
    d: polygon(Array.from({ length: 6 }, (_, i): [number, number] => [Math.cos((i * Math.PI) / 3), Math.sin((i * Math.PI) / 3)])),
    inner: Math.cos(Math.PI / 6),
  },
  diamond: { d: polygon([[0, -1], [1, 0], [0, 1], [-1, 0]]), inner: Math.SQRT1_2 },
  burst: { d: polygon(ring(12, 0.78)), inner: 0.78 * Math.cos(Math.PI / 12) },
};

/** DOM-Ebene des Übergangs (Form, Farbe, Streifen, Blitz). Über der Leinwand, unter Untertiteln. */
export const TransitionOverlay: React.FC<{
  readonly state: TransitionState | null;
  readonly width?: number;
  readonly height?: number;
}> = ({ state, width = 1080, height = 1920 }) => {
  if (!state) return null;
  const { spec, local, n } = state;
  const { pre, post } = phases(state);
  const color = spec.color ?? (spec.kind === "zoom" ? "#0B0B14" : "#FFD23F");
  const cx = (spec.at?.[0] ?? 0.5) * width;
  const cy = (spec.at?.[1] ?? 0.42) * height;
  const far = Math.max(
    Math.hypot(cx, cy),
    Math.hypot(width - cx, cy),
    Math.hypot(cx, height - cy),
    Math.hypot(width - cx, height - cy),
  );

  if (spec.kind === "tint") {
    if (local < 0 || local > 5) return null;
    const o = interpolate(local, [0, 5], [0.7, 0], { extrapolateRight: "clamp" });
    return <AbsoluteFill style={{ background: spec.color ?? "#FFD23F", opacity: o }} />;
  }
  if (spec.kind === "whip") {
    const k = Math.max(pre * pre, post * post);
    return <SpeedStreaks strength={k} frame={local + 100} dir={spec.dir ?? 1} />;
  }
  if (spec.kind === "wipe") {
    const sh = SHAPES[spec.shape ?? "circle"];
    const full = (far / sh.inner) * 1.04;
    if (local < 0) {
      const s = full * pre * pre;
      const rot = 70 * pre;
      return (
        <AbsoluteFill>
          <svg width={width} height={height}>
            <path
              d={sh.d}
              transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}
              fill={color}
              stroke={INK}
              strokeWidth={16}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </AbsoluteFill>
      );
    }
    if (local >= n) return null;
    const u = 1 - post; // 0 → 1
    const s = full * (1 - Math.pow(1 - u, 2.2));
    const rot = 70 + 50 * u;
    return (
      <AbsoluteFill>
        <svg width={width} height={height}>
          <defs>
            <mask id="kit-wipe-hole">
              <rect width={width} height={height} fill="white" />
              <path d={sh.d} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`} fill="black" />
            </mask>
          </defs>
          <rect width={width} height={height} fill={color} mask="url(#kit-wipe-hole)" />
          <path
            d={sh.d}
            transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}
            fill="none"
            stroke={INK}
            strokeWidth={16}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </AbsoluteFill>
    );
  }
  if (spec.kind === "zoom") {
    // Farbe schließt sich als Iris um die Bildmitte, B öffnet sie wieder
    const open = local < 0 ? 1 - pre * pre : 1 - post * post;
    if (open >= 0.999 || local >= n) return null;
    const r = far * 1.02 * open;
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,0) ${r * 0.82}px, ${color} ${r}px)`,
        }}
      />
    );
  }
  return null;
};
