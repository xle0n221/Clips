import React, { useMemo } from "react";
import { C, clamp01, seeded } from "./core";

/**
 * Kulissen (2D): Sterne, Milchstraße, Stadt-Silhouette mit Fensterlichtern, Erde bei Nacht,
 * Mond-Scheibe, Dunstschicht. Prozedural (seeded) – gleich in Vorschau und Render.
 */

/* ------------------------------------------------------------------ */
/* Sterne + Milchstraße                                                */
/* ------------------------------------------------------------------ */

/** Sternfeld im Rechteck; `reveal` 0..1 blendet Sterne schichtweise ein (hellste zuerst). */
export const Stars: React.FC<{
  readonly seed?: number;
  readonly count?: number;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly reveal?: number;
  readonly frame: number;
  readonly color?: string;
}> = ({ seed = 3, count = 140, x = 0, y = 0, w = 1080, h = 1100, reveal = 1, frame, color = C.white }) => {
  const stars = useMemo(() => {
    const r = seeded(seed * 131 + 7);
    return Array.from({ length: count }, (_, i) => ({
      x: x + r() * w,
      y: y + r() * h,
      size: 1.2 + Math.pow(r(), 3) * 4.5,
      ph: r() * 6.28,
      order: i / count,
    }));
  }, [seed, count, x, y, w, h]);
  return (
    <g>
      {stars.map((s, i) => {
        const vis = clamp01((reveal - s.order) * 8);
        if (vis <= 0) return null;
        const tw = 0.65 + 0.35 * Math.sin(frame * 0.12 + s.ph);
        return <circle key={i} cx={s.x} cy={s.y} r={s.size * (0.6 + 0.4 * vis)} fill={color} opacity={vis * tw} />;
      })}
    </g>
  );
};

/** Milchstraße als schräges Band aus Verläufen + dichten Sternen. */
export const MilkyWay: React.FC<{ readonly o: number; readonly frame: number; readonly cx?: number; readonly cy?: number }> = ({
  o,
  frame,
  cx = 540,
  cy = 560,
}) => {
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={`translate(${cx} ${cy}) rotate(-28)`}>
      <defs>
        <radialGradient id="mw-core">
          <stop offset="0" stopColor="#E9E3FF" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#9C8FD6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3B3A7A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mw-dust">
          <stop offset="0" stopColor="#0B1026" stopOpacity="0.7" />
          <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse rx={1100} ry={210} fill="url(#mw-core)" />
      <ellipse cx={-180} rx={600} ry={120} fill="url(#mw-core)" />
      <ellipse cx={240} cy={20} rx={420} ry={60} fill="url(#mw-dust)" />
      <ellipse cx={-320} cy={-14} rx={300} ry={40} fill="url(#mw-dust)" />
      <Stars seed={11} count={220} x={-1000} y={-150} w={2000} h={300} frame={frame} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Stadt-Silhouette                                                    */
/* ------------------------------------------------------------------ */

type Building = {
  x: number;
  w: number;
  h: number;
  roof: number;
  windows: { x: number; y: number; t: number }[];
};

/**
 * Häuserreihe ab `x0` über `width`, Unterkante `baseY`. Fenster leuchten, solange
 * `lit(fx, t)` true ist (fx = x-Anteil 0..1 in der Reihe, t = Zufallswert je Fenster).
 * Standard: `litFrac` – Anteil der leuchtenden Fenster (erlöschen in zufälliger Reihenfolge).
 */
export const Skyline: React.FC<{
  readonly seed?: number;
  readonly x0?: number;
  readonly width?: number;
  readonly baseY: number;
  readonly minH?: number;
  readonly maxH?: number;
  readonly color: string;
  readonly litFrac?: number;
  readonly lit?: (fx: number, t: number) => boolean;
  readonly windows?: boolean;
  readonly windowColor?: string;
  readonly ground?: number;
}> = ({
  seed = 1,
  x0 = -400,
  width = 1900,
  baseY,
  minH = 180,
  maxH = 620,
  color,
  litFrac = 1,
  lit,
  windows = true,
  windowColor = C.window,
  ground = 900,
}) => {
  const blds = useMemo(() => {
    const r = seeded(seed * 977 + 5);
    const out: Building[] = [];
    let x = x0;
    while (x < x0 + width) {
      const w = 90 + r() * 150;
      const h = minH + Math.pow(r(), 1.4) * (maxH - minH);
      const roof = r();
      const wins: Building["windows"] = [];
      const cols = Math.max(2, Math.floor((w - 24) / 34));
      const rows = Math.max(2, Math.floor((h - 40) / 46));
      const gx = (w - cols * 34) / 2 + 8;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) if (r() > 0.35) wins.push({ x: x + gx + i * 34, y: baseY - h + 30 + j * 46, t: r() });
      out.push({ x, w, h, roof, windows: wins });
      x += w + 4 + r() * 18;
    }
    return out;
  }, [seed, x0, width, baseY, minH, maxH]);
  return (
    <g>
      <rect x={x0 - 200} y={baseY - 2} width={width + 400} height={ground} fill={color} />
      {blds.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={baseY - b.h} width={b.w} height={b.h + 2} fill={color} />
          {b.roof > 0.72 ? (
            <path d={`M ${b.x + b.w * 0.45} ${baseY - b.h} l 4 -70 l 4 70 Z`} fill={color} />
          ) : b.roof > 0.5 ? (
            <rect x={b.x + b.w * 0.2} y={baseY - b.h - 26} width={b.w * 0.6} height={28} fill={color} />
          ) : null}
          {windows
            ? b.windows.map((w, k) => {
                const on = lit ? lit((w.x - x0) / width, w.t) : w.t < litFrac;
                return on ? <rect key={k} x={w.x} y={w.y} width={18} height={24} rx={2} fill={windowColor} opacity={0.9} /> : null;
              })
            : null}
        </g>
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Erde bei Nacht                                                      */
/* ------------------------------------------------------------------ */

const CONTINENTS = [
  "M -230 -250 Q -120 -330 -20 -270 Q 40 -200 -40 -150 Q -90 -60 -170 -40 Q -260 -90 -280 -170 Z",
  "M -120 -20 Q -40 -10 -50 80 Q -70 190 -140 260 Q -170 160 -180 60 Q -170 -10 -120 -20 Z",
  "M 60 -300 Q 180 -330 260 -240 Q 300 -150 230 -110 Q 160 -90 120 -150 Q 60 -170 40 -230 Z",
  "M 80 -80 Q 170 -90 190 0 Q 200 110 130 200 Q 80 120 70 40 Q 50 -30 80 -80 Z",
  "M 220 120 Q 290 110 300 170 Q 260 220 210 190 Z",
];

/** Stadtlichter: Cluster auf den Kontinenten (seeded). */
const cityDots = (seed: number) => {
  const r = seeded(seed * 53 + 1);
  const centers: [number, number, number][] = [
    [-200, -200, 50], [-120, -170, 40], [-70, -230, 30], [-130, 60, 30], [-110, 160, 22],
    [110, -250, 40], [170, -200, 45], [230, -170, 35], [120, -130, 30], [130, 20, 26], [150, 120, 20], [250, 160, 18], [20, -260, 28],
  ];
  const dots: { x: number; y: number; s: number; t: number }[] = [];
  for (const [cx, cy, rad] of centers) {
    const n = Math.round(rad * 0.9);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.7) * rad;
      dots.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, s: 2 + r() * 4.5, t: r() });
    }
  }
  return dots;
};

/**
 * Erde (Nachtseite) mit Radius 320 bei s = 1, Mittelpunkt (x, y).
 * `lit(dx, t)`: leuchtet der Stadtpunkt? (dx = −1 Westrand … 1 Ostrand). `pulse` 0..1 hebt alle
 * Lichter kurz an. `atmo` = Dicke des Lufthüllen-Rands (1 = normal, > 1 aufgebläht).
 * `rim` = Farbe des Rands (Ofen-Pointe: orange).
 */
export const NightEarth: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly rot?: number;
  readonly lit?: (dx: number, t: number) => boolean;
  readonly pulse?: number;
  readonly atmo?: number;
  readonly rim?: string;
  readonly frame: number;
  readonly green?: number;
}> = ({ x, y, s = 1, rot = 0, lit, pulse = 0, atmo = 1, rim = "#5FB4FF", frame, green = 0 }) => {
  const dots = useMemo(() => cityDots(4), []);
  const R = 320;
  const land = green > 0 ? mix("#16244A", "#1F5A40", green) : "#16244A";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <radialGradient id="earth-ocean" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#173068" />
          <stop offset="1" stopColor="#081230" />
        </radialGradient>
        <radialGradient id="earth-atmo" r="0.5">
          <stop offset={`${(R / (R + 40 * atmo)) * 100 - 1}%`} stopColor={rim} stopOpacity="0" />
          <stop offset={`${(R / (R + 40 * atmo)) * 100}%`} stopColor={rim} stopOpacity="0.75" />
          <stop offset="100%" stopColor={rim} stopOpacity="0" />
        </radialGradient>
        <clipPath id="earth-clip">
          <circle r={R} />
        </clipPath>
        <radialGradient id="earth-shade" cx="0.75" cy="0.75" r="0.7">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={R + 40 * atmo} fill="url(#earth-atmo)" />
      <circle r={R} fill="url(#earth-ocean)" />
      <g clipPath="url(#earth-clip)">
        <g transform={`rotate(${rot})`}>
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill={land} />
          ))}
          {dots.map((d, i) => {
            const on = lit ? lit(d.x / R, d.t) : true;
            if (!on) return null;
            const tw = 0.75 + 0.25 * Math.sin(frame * 0.2 + d.t * 20);
            return (
              <circle key={i} cx={d.x} cy={d.y} r={d.s * (1 + pulse * 0.8)} fill={C.window} opacity={Math.min(1, tw + pulse * 0.4)} />
            );
          })}
        </g>
        <circle r={R} fill="url(#earth-shade)" />
      </g>
      <circle r={R} fill="none" stroke={C.ink} strokeWidth={6} />
    </g>
  );
};

/** Hex-Farbmischung a→b. */
export const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const k = clamp01(t);
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
};

/* ------------------------------------------------------------------ */
/* Mond, Dunst                                                         */
/* ------------------------------------------------------------------ */

/** Mond-Scheibe mit Kratern (Radius 100 bei s = 1). */
export const MoonDisc: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly glow?: number }> = ({
  x,
  y,
  s = 1,
  glow = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <radialGradient id="moon-glow">
        <stop offset="0.45" stopColor={C.moon} stopOpacity="0.35" />
        <stop offset="1" stopColor={C.moon} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle r={210} fill="url(#moon-glow)" opacity={glow} />
    <circle r={100} fill={C.moon} stroke={C.ink} strokeWidth={5} />
    <circle cx={-30} cy={-24} r={20} fill={C.moonDark} opacity={0.6} />
    <circle cx={34} cy={12} r={28} fill={C.moonDark} opacity={0.5} />
    <circle cx={-12} cy={46} r={13} fill={C.moonDark} opacity={0.55} />
    <circle cx={46} cy={-46} r={9} fill={C.moonDark} opacity={0.5} />
  </g>
);

/** Waagrechte Dunstschicht (CO₂-Haze) über y0..y1, wabert leicht. */
export const Haze: React.FC<{ readonly y0: number; readonly y1: number; readonly o: number; readonly frame: number; readonly x0?: number; readonly w?: number }> = ({
  y0,
  y1,
  o,
  frame,
  x0 = -600,
  w = 2300,
}) => (
  <g opacity={o}>
    <defs>
      <linearGradient id="haze-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.haze} stopOpacity="0" />
        <stop offset="0.5" stopColor={C.haze} stopOpacity="0.8" />
        <stop offset="1" stopColor={C.haze} stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={x0} y={y0} width={w} height={y1 - y0} fill="url(#haze-g)" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <ellipse
        key={i}
        cx={x0 + ((i * 420 + frame * (1.2 + i * 0.2)) % w)}
        cy={(y0 + y1) / 2 + Math.sin(frame * 0.05 + i) * 30}
        rx={260}
        ry={(y1 - y0) * 0.3}
        fill="#8A8E98"
        opacity={0.35}
      />
    ))}
  </g>
);
