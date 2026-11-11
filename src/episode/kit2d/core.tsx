import type { Caption } from "@remotion/captions";
import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing } from "remotion";
import { CameraRigContext } from "../kit/camera";
import { talkFromCaptions } from "../kit/motion";

/**
 * 2D-Bau-Kit (Grundlage): Palette, Stimmungen (Color Script), Bühne mit 2D-Kamera und
 * Parallax-Ebenen. Alles reine Funktion von `frame` (wie das 3D-Kit). Koordinaten = Pixel eines
 * 1080×1920-Bildes bei Zoom 1 und Kamera auf (540, 960). Übergänge aus `kit/transitions.tsx`
 * wirken über `CameraRigContext` (yaw → Schwenk, push → Zoom, roll → Neigung) auch hier.
 */

export const W = 1080;
export const H = 1920;
export const FONT = "Montserrat";

export const C = {
  ink: "#0A0F1F",
  white: "#F4F7FF",
  window: "#FFC94A",
  ghost: "#BFF3FF",
  ghostShade: "#8FD8EC",
  scarf: "#FFD23F",
  scarfDark: "#D9A514",
  danger: "#FF3B30",
  moon: "#C9D1E0",
  moonDark: "#8A94A8",
  nature: "#2E6B4F",
  natureLight: "#4E9A6E",
  haze: "#6B6F7A",
  steel: "#9AA6C4",
  steelDark: "#5D6889",
  rust: "#B5542A",
  bridge: "#C0362C",
  water: "#123A5C",
  pool: "#2F8FD8",
  fire: "#FF8A3D",
  gold: "#E8B64C",
} as const;

/** Color Script: Stimmung je Szene (Himmel oben/mitte/unten + 3 Silhouetten-Ebenen hinten→vorn). */
export type Mood = "night" | "danger" | "nature" | "haze" | "moon" | "space";
export const MOODS: Record<
  Mood,
  { readonly sky: readonly [string, string, string]; readonly sil: readonly [string, string, string] }
> = {
  night: { sky: ["#0B1026", "#141B3D", "#1F2A5C"], sil: ["#18204A", "#0F1530", "#070A18"] },
  danger: { sky: ["#12091C", "#2A0F24", "#4A1420"], sil: ["#2A1428", "#170A18", "#08040C"] },
  nature: { sky: ["#0B1A26", "#12302E", "#1F4A3A"], sil: ["#173A30", "#0E241E", "#06120E"] },
  haze: { sky: ["#1A1C24", "#2A2D36", "#3E414C"], sil: ["#30333C", "#22242B", "#14151A"] },
  moon: { sky: ["#05070D", "#0C1018", "#161C28"], sil: ["#5C6478", "#3E4556", "#262B38"] },
  space: { sky: ["#02030A", "#05081A", "#0A0F2A"], sil: ["#18204A", "#0F1530", "#070A18"] },
};

/* ------------------------------------------------------------------ */
/* Zahlen-Helfer                                                       */
/* ------------------------------------------------------------------ */

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const SMOOTH = Easing.bezier(0.33, 0, 0.2, 1);
const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
/** 0..1 zwischen Frame a und b, weich (Standard) oder inOut. */
export const ease = (f: number, a: number, b: number, kind: "smooth" | "inOut" | "linear" = "smooth") => {
  const t = clamp01((f - a) / Math.max(1, b - a));
  return kind === "linear" ? t : kind === "inOut" ? INOUT(t) : SMOOTH(t);
};
/** Pop-Einblendung mit Überschwinger (0 → 1,08 → 1) über `dur` Frames ab `at`. */
export const pop = (f: number, at: number, dur = 9) => {
  const t = clamp01((f - at) / dur);
  if (t <= 0) return 0;
  return 1 - Math.pow(1 - t, 3) + 0.35 * Math.sin(t * Math.PI) * (1 - t);
};
/** Kurzer Kamera-Ruck (gedämpft) ab `at`. */
export const jolt = (f: number, at: number, amp = 14) => {
  const g = f - at;
  if (g < 0 || g > 14) return 0;
  return amp * Math.exp(-g * 0.3) * Math.sin(g * 2.1);
};
/** Beat mit Ersatzwert (useScene().beat liefert 1e9, wenn das Wort fehlt). */
export const beatOr = (beat: (n: string) => number, name: string, fallback: number) => {
  const v = beat(name);
  return v > 1e8 ? fallback : v;
};
export { seeded } from "../kit/toon";

/* ------------------------------------------------------------------ */
/* Kontext: Untertitel für Mund/Reaktionen                              */
/* ------------------------------------------------------------------ */

export type Kit2DInfo = { readonly captions: readonly Caption[]; readonly fps: number; readonly start: number };
export const Kit2DContext = createContext<Kit2DInfo>({ captions: [], fps: 30, start: 0 });
/** Mundöffnung 0..1 zum lokalen Szenen-Frame (aus Wort-Zeiten, kit/motion `talkFromCaptions`). */
export const useTalk = (localFrame: number) => {
  const { captions, fps, start } = useContext(Kit2DContext);
  return talkFromCaptions(captions as Caption[], ((start + localFrame) / fps) * 1000);
};

/* ------------------------------------------------------------------ */
/* Bühne + Kamera                                                      */
/* ------------------------------------------------------------------ */

/** 2D-Kamera: (x, y) = Weltpunkt in der Bildmitte, zoom 1 = 1 Welt-px pro Bild-px. */
export type Cam2D = { readonly x: number; readonly y: number; readonly zoom: number; readonly rot?: number };
export const CAM0: Cam2D = { x: 540, y: 960, zoom: 1 };

/** Kamerafahrt durch Schlüsselbilder [frame, cam] (weich zwischen je zwei Schlüsseln). */
export const camPath = (
  f: number,
  keys: readonly (readonly [number, Cam2D])[],
  kind: "smooth" | "inOut" | "linear" = "inOut",
): Cam2D => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [fb, b] = keys[i];
    const [fa, a] = keys[i - 1];
    if (f <= fb) {
      const t = ease(f, fa, fb, kind);
      return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        zoom: a.zoom * Math.pow(b.zoom / a.zoom, t),
        rot: lerp(a.rot ?? 0, b.rot ?? 0, t),
      };
    }
  }
  return keys[keys.length - 1][1];
};

const StageContext = createContext<Cam2D>(CAM0);

/**
 * Bühne: Himmel (Bildraum) + Ebenen. `cam` wird um den Übergangs-Zusatz (`CameraRigContext`)
 * ergänzt: Whip = waagrechter Reißschwenk, Zoom/Portal = Ranfahrt.
 */
export const Stage2D: React.FC<{
  readonly cam: Cam2D;
  readonly mood: Mood;
  readonly children: React.ReactNode;
  /** Himmel weglassen (z. B. Einsätze auf eigenem Grund) */
  readonly noSky?: boolean;
}> = ({ cam, mood, children, noSky }) => {
  const rig = useContext(CameraRigContext);
  const c: Cam2D = {
    x: cam.x + rig.yaw * 1500,
    y: cam.y,
    zoom: (cam.zoom * (1 + rig.push * 1.6)) / Math.max(0.5, rig.fov),
    rot: (cam.rot ?? 0) + (rig.roll * 180) / Math.PI,
  };
  const [top, mid, bottom] = MOODS[mood].sky;
  const id = `sky-${mood}`;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="0.55" stopColor={mid} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
        </defs>
        {noSky ? null : <rect width={W} height={H} fill={`url(#${id})`} />}
        <StageContext.Provider value={c}>{children}</StageContext.Provider>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Parallax-Ebene: depth 1 = Hauptebene, < 1 weiter hinten (bewegt sich weniger), > 1 Vordergrund.
 * depth 0 = am Bild festgeklebt (Bildraum).
 */
export const Layer: React.FC<{ readonly depth?: number; readonly children: React.ReactNode; readonly opacity?: number }> = ({
  depth = 1,
  children,
  opacity,
}) => {
  const cam = useContext(StageContext);
  const z = 1 + (cam.zoom - 1) * depth;
  const ox = 540 + (cam.x - 540) * depth;
  const oy = 960 + (cam.y - 960) * depth;
  return (
    <g
      opacity={opacity}
      transform={`translate(540 960) rotate(${(cam.rot ?? 0) * Math.min(1, depth)}) scale(${z}) translate(${-ox} ${-oy})`}
    >
      {children}
    </g>
  );
};

/** Gruppe an (x, y), skaliert/gedreht. */
export const At: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly sx?: number;
  readonly sy?: number;
  readonly r?: number;
  readonly o?: number;
  readonly children: React.ReactNode;
}> = ({ x, y, s = 1, sx = 1, sy = 1, r = 0, o, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s * sx} ${s * sy})`} opacity={o}>
    {children}
  </g>
);

/** Text in Montserrat 900 mit dunkler Kontur (lesbar auf jedem Grund). */
export const Label: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size?: number;
  readonly color?: string;
  readonly anchor?: "start" | "middle" | "end";
  readonly children: React.ReactNode;
  readonly spacing?: number;
  readonly o?: number;
}> = ({ x, y, size = 44, color = C.white, anchor = "middle", children, spacing = 2, o }) => (
  <text
    x={x}
    y={y}
    fontFamily={FONT}
    fontWeight={900}
    fontSize={size}
    letterSpacing={spacing}
    textAnchor={anchor}
    fill={color}
    stroke={C.ink}
    strokeWidth={size * 0.18}
    paintOrder="stroke"
    strokeLinejoin="round"
    opacity={o}
  >
    {children}
  </text>
);

/** Spotlight-Kegel (Fokus-Moment) – reine Verlaufsflächen, kein Filter. */
export const Spotlight: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly w?: number }> = ({
  x,
  y,
  o,
  w = 260,
}) => (
  <g opacity={o}>
    <defs>
      <linearGradient id="spot-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF6D8" stopOpacity="0" />
        <stop offset="1" stopColor="#FFF6D8" stopOpacity="0.32" />
      </linearGradient>
    </defs>
    <rect x={-2000} y={-3000} width={5000} height={7000} fill="#000" opacity={0.55} />
    <path d={`M ${x - 40} ${y - 1400} L ${x + 40} ${y - 1400} L ${x + w} ${y} L ${x - w} ${y} Z`} fill="url(#spot-cone)" />
    <ellipse cx={x} cy={y} rx={w} ry={w * 0.16} fill="#FFF6D8" opacity={0.28} />
  </g>
);
