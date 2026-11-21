import React from "react";
import { camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import { useBeats } from "./rollsSets";
import { Burst, INK, P, Person, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";

/**
 * „What a Ghost Pepper Does Inside Your Body“ (episodes/ghost-pepper.json) – Innenwelt-Cartoon
 * (docs/prompts/innenwelt-cartoon.md): 2D-Doodle, große weiße Rundköpfe, dicke Konturen, warme detaillierte
 * Hintergründe mit Fluchtpunkt + Glow. Schnitte an Wort-Beats; jede Einstellung hat einen Hintergrund-Gag (Schild/Poster).
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.max(1, Math.round(x)));
  const i = shotIndex(f, c);
  const a = i === 0 ? 0 : c[i - 1];
  const b = i < c.length ? c[i] : d;
  return { i, lf: f - a, len: Math.max(1, b - a) };
};

const Shot: React.FC<{ readonly cam: Cam2D; readonly children: React.ReactNode }> = ({ cam, children }) => (
  <Stage2D cam={cam} mood="haze" noSky>
    {children}
  </Stage2D>
);

const G = {
  guy: "#2FBF71",
  guyPants: "#2B3A67",
  caps: "#F2202E",
  capsDark: "#A30E1A",
  gold: "#FFC531",
  door: "#7B4DFF",
  doorDark: "#4B2BB0",
  brain: "#FF9EC4",
  neonP: "#FF3FD0",
  neonC: "#2FF0FF",
  pepper: "#FF3B1F",
  white: "#FFFFFF",
};

/* ------------------------------------------------------------------ */
/* Bausteine                                                          */
/* ------------------------------------------------------------------ */

const Grad: React.FC<{ readonly id: string; readonly a: string; readonly b: string; readonly y0?: number; readonly y1?: number }> = ({ id, a, b, y0 = -300, y1 = 2200 }) => (
  <>
    <defs>
      <linearGradient id={`gp-${id}`} x1="0" y1={y0} x2="0" y2={y1} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect x={-1500} y={-1500} width={4100} height={5000} fill={`url(#gp-${id})`} />
  </>
);

/** Weicher Lichtfleck (Glow/Bloom). */
const Glow: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly c: string; readonly o?: number; readonly id: string }> = ({ x, y, r, c, o = 0.6, id }) => (
  <>
    <defs>
      <radialGradient id={`gl-${id}`}>
        <stop offset="0" stopColor={c} stopOpacity={o} />
        <stop offset="1" stopColor={c} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#gl-${id})`} />
  </>
);

/** Schild mit Text (Hintergrund-Gag). */
const Sign: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly lines: readonly string[]; readonly size?: number; readonly bg?: string; readonly fg?: string; readonly r?: number }> = ({ x, y, w, lines, size = 44, bg = "#FFF4DE", fg = INK, r = 0 }) => {
  const h = lines.length * size * 1.18 + size * 0.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={bg} stroke={INK} strokeWidth={7} />
      {lines.map((l, k) => (
        <text key={l} x={0} y={-h / 2 + size * 0.35 + (k + 1) * size * 1.18 - size * 0.18} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={size} fill={fg}>
          {l}
        </text>
      ))}
    </g>
  );
};

/** Fluchtpunkt-Linien (Tiefe). */
const Persp: React.FC<{ readonly vx: number; readonly vy: number; readonly c: string; readonly n?: number; readonly o?: number }> = ({ vx, vy, c, n = 12, o = 0.35 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, k) => {
      const a = (k / n) * Math.PI * 2;
      return <line key={k} x1={vx} y1={vy} x2={vx + Math.cos(a) * 3000} y2={vy + Math.sin(a) * 3000} stroke={c} strokeWidth={6} />;
    })}
  </g>
);

const Steam: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly side: 1 | -1; readonly o?: number; readonly s?: number }> = ({ x, y, f, side, o = 1, s = 1 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${side * s} ${s})`}>
    {[0, 1, 2].map((k) => {
      const ph = ((f * 0.06 + k / 3) % 1);
      return <circle key={k} cx={30 + ph * 120} cy={-ph * 160} r={24 + ph * 40} fill="#FFFFFF" stroke={INK} strokeWidth={5} opacity={1 - ph} />;
    })}
  </g>
);

const Tears: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {([-1, 1] as const).map((sd) => (
      <g key={sd}>
        {Array.from({ length: 6 }).map((_, k) => {
          const t = ((f * 0.09 + k / 6) % 1);
          return <circle key={k} cx={sd * (60 + t * 260)} cy={-20 + t * t * 420 - t * 120} r={18} fill="#6FD3FF" stroke={INK} strokeWidth={4} />;
        })}
      </g>
    ))}
  </g>
);

/** Ghost Pepper mit kleinem bösen Gesicht. Ursprung = Mitte. */
const Pepper: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly bitten?: boolean; readonly grin?: boolean }> = ({ x, y, s = 1, r = 0, bitten, grin = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -10 -120 Q 30 -170 70 -150" fill="none" stroke="#2E8B3A" strokeWidth={18} strokeLinecap="round" />
    <path d="M -60 -110 Q 0 -150 60 -110 Q 90 -20 50 70 Q 20 140 -10 170 Q -30 120 -60 60 Q -95 -20 -60 -110 Z" fill={G.pepper} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -36 -80 Q -50 -10 -30 50" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
    {bitten ? <path d="M 40 -90 q 30 10 20 40 q 25 15 10 45 q 20 20 -5 40" fill="#FFE07A" stroke={INK} strokeWidth={6} /> : null}
    <path d="M -34 -40 L -10 -28 M 24 -40 L 0 -28" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <circle cx={-20} cy={-18} r={7} fill={INK} />
    <circle cx={12} cy={-18} r={7} fill={INK} />
    {grin ? <path d="M -28 10 Q -6 32 18 10" fill="#FFFFFF" stroke={INK} strokeWidth={6} /> : null}
  </g>
);

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor" | "skin">;
/** GUY: großer weißer Rundkopf, grünes Shirt. Kopf-Mitte ≈ y − 470·s. */
const Guy: React.FC<Fig & { readonly red?: number }> = ({ red = 0, ...p }) => (
  <g>
    <Person pants={G.guyPants} headS={1.55} {...p} shirt={G.guy} hair="none" hairColor="#000" skin={red > 0.5 ? "#FFD3CF" : "#FFFFFF"} blush={red > 0.2} />
  </g>
);
const GUY_HEAD = (y: number, s: number, seated?: boolean) => y - s * ((seated ? 250 : 330) + 105 * 0.82 * 1.55);

/** CAPSAICIN: rotes Molekül mit Hut, Sonnenbrille, Goldkette. Ursprung = Füße, Höhe ≈ 420·s. */
const Caps: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly f: number;
  readonly walk?: number;
  readonly armL?: number;
  readonly armR?: number;
  readonly mouth?: "smug" | "grin" | "o";
  readonly flip?: boolean;
  readonly shades?: boolean;
  readonly bling?: number;
  readonly wave?: boolean;
}> = ({ x, y, s = 1, f, walk = 0, armL = 20, armR = 20, mouth = "smug", flip, shades = true, bling = 0, wave }) => {
  const step = walk ? Math.sin(f * 0.45) * walk : 0;
  const bob = walk ? Math.abs(Math.sin(f * 0.45)) * -10 * walk : Math.sin(f * 0.15) * 3;
  const by = -230 + bob;
  const arm = (side: -1 | 1, deg0: number) => {
    const deg = deg0 + (wave && side === 1 ? Math.sin(f * 0.5) * 25 : 0);
    const a = (deg * Math.PI) / 180;
    const sx = side * 82;
    const ex = sx + side * Math.sin(a) * 75;
    const ey = by + 20 + Math.cos(a) * 75;
    const hx = ex + side * Math.sin(a + 0.5 * side) * 55;
    const hy = ey + Math.cos(a + 0.5 * side) * 55;
    return (
      <g key={side}>
        <path d={`M ${sx} ${by + 20} Q ${ex} ${ey} ${hx} ${hy}`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {/* Beine */}
      <path d={`M -34 ${by + 70} Q ${-40 + step * 20} -60 ${-44 + step * 34} -18`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d={`M 34 ${by + 70} Q ${40 - step * 20} -60 ${44 - step * 34} -18`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={-54 + step * 34} cy={-12} rx={40} ry={18} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      <ellipse cx={54 - step * 34} cy={-12} rx={40} ry={18} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      {/* Molekül-Seitenatome (Bindungen) */}
      <line x1={-60} y1={by - 40} x2={-128} y2={by - 92} stroke={INK} strokeWidth={10} />
      <line x1={70} y1={by + 30} x2={136} y2={by + 70} stroke={INK} strokeWidth={10} />
      <circle cx={-132} cy={by - 98} r={30} fill="#FF8A1F" stroke={INK} strokeWidth={6} />
      <circle cx={140} cy={by + 76} r={26} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      {arm(-1, armL)}
      {arm(1, armR)}
      {/* Körper = Kopf */}
      <circle cx={0} cy={by} r={100} fill={G.caps} stroke={INK} strokeWidth={8} />
      <ellipse cx={-40} cy={by - 50} rx={26} ry={16} fill="#FFFFFF" opacity={0.45} />
      {/* Gesicht */}
      {shades ? (
        <g>
          <rect x={-70} y={by - 30} width={62} height={34} rx={12} fill={INK} />
          <rect x={8} y={by - 30} width={62} height={34} rx={12} fill={INK} />
          <line x1={-8} x2={8} y1={by - 18} y2={by - 18} stroke={INK} strokeWidth={6} />
          <rect x={-60} y={by - 26} width={18} height={8} rx={4} fill="#FFFFFF" opacity={0.6} />
        </g>
      ) : (
        <g>
          <circle cx={-34} cy={by - 14} r={16} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={34} cy={by - 14} r={16} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={-30} cy={by - 12} r={7} fill={INK} />
          <circle cx={38} cy={by - 12} r={7} fill={INK} />
        </g>
      )}
      {mouth === "smug" ? <path d={`M -26 ${by + 34} Q 6 ${by + 50} 34 ${by + 26}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
      {mouth === "grin" ? <path d={`M -36 ${by + 26} Q 0 ${by + 70} 36 ${by + 26} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
      {mouth === "o" ? <ellipse cx={0} cy={by + 40} rx={14} ry={18} fill={INK} /> : null}
      {/* Zahnstocher */}
      <line x1={30} y1={by + 32} x2={78} y2={by + 22} stroke="#E8C27A" strokeWidth={6} strokeLinecap="round" />
      {/* Goldkette */}
      <path d={`M -62 ${by + 60} Q 0 ${by + 132} 62 ${by + 60}`} fill="none" stroke={G.gold} strokeWidth={14} />
      <path d={`M -62 ${by + 60} Q 0 ${by + 132} 62 ${by + 60}`} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="10 8" />
      <circle cx={0} cy={by + 98} r={20} fill={G.gold} stroke={INK} strokeWidth={5} />
      {bling > 0 ? <Burst x={0} y={by + 98} r0={36} r1={36 + 60 * bling} n={8} color={G.gold} o={bling} /> : null}
      {/* Fedora */}
      <ellipse cx={0} cy={by - 92} rx={118} ry={24} fill="#222033" stroke={INK} strokeWidth={6} />
      <path d={`M -66 ${by - 96} Q -62 ${by - 176} 0 ${by - 170} Q 62 ${by - 176} 66 ${by - 96} Z`} fill="#2E2B45" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-64} y={by - 122} width={128} height={18} fill={G.caps} />
    </g>
  );
};

/** TRPV1: Türsteher-Ionenkanal (lila Tonne mit Spalt). Ursprung = Füße, Höhe ≈ 760·s. open 0..1 = Kanal offen (glüht). */
const Bouncer: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly f: number;
  readonly open?: number;
  readonly mood?: "angry" | "wide" | "yell" | "smug";
  readonly point?: boolean;
  readonly crack?: boolean;
}> = ({ x, y, s = 1, f, open = 0, mood = "angry", point, crack }) => {
  const top = -760;
  const shake = mood === "yell" ? Math.sin(f * 2.1) * 4 : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={-8} rx={220} ry={30} fill="#000" opacity={0.25} />
      {/* Beine */}
      <rect x={-120} y={-120} width={70} height={120} rx={20} fill={G.doorDark} stroke={INK} strokeWidth={8} />
      <rect x={50} y={-120} width={70} height={120} rx={20} fill={G.doorDark} stroke={INK} strokeWidth={8} />
      {/* zwei Halbröhren = Kanal */}
      <path d={`M -200 -120 L -200 ${top + 120} Q -200 ${top} -90 ${top} L -20 ${top} L -20 -120 Z`} fill={G.door} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d={`M 200 -120 L 200 ${top + 120} Q 200 ${top} 90 ${top} L 20 ${top} L 20 -120 Z`} fill={G.door} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {/* Spalt (Pore) */}
      <rect x={-20 - open * 30} y={top + 260} width={40 + open * 60} height={380} rx={20} fill={open > 0.05 ? "#FFE36B" : "#2A1B5E"} stroke={INK} strokeWidth={7} />
      {open > 0.05 ? <Glow x={0} y={top + 450} r={260} c="#FFB000" o={0.75 * open} id={`bo-${Math.round(x)}`} /> : null}
      {/* Streifen */}
      {[top + 200, top + 680].map((yy) => (
        <line key={yy} x1={-200} x2={200} y1={yy} y2={yy} stroke={G.doorDark} strokeWidth={12} />
      ))}
      {/* Gesicht */}
      <g transform={`translate(0 ${top + 120})`}>
        {mood === "wide" ? (
          <g>
            <circle cx={-70} cy={0} r={40} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <circle cx={70} cy={0} r={40} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <circle cx={-70} cy={4} r={12} fill={INK} />
            <circle cx={70} cy={4} r={12} fill={INK} />
          </g>
        ) : (
          <g>
            <ellipse cx={-70} cy={4} rx={30} ry={mood === "smug" ? 12 : 22} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <ellipse cx={70} cy={4} rx={30} ry={mood === "smug" ? 12 : 22} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <circle cx={-66} cy={8} r={10} fill={INK} />
            <circle cx={74} cy={8} r={10} fill={INK} />
            <path d="M -116 -46 L -30 -20 M 116 -46 L 30 -20" stroke={INK} strokeWidth={12} strokeLinecap="round" />
          </g>
        )}
        {mood === "yell" ? (
          <ellipse cx={0} cy={110} rx={70} ry={64} fill="#5A0F22" stroke={INK} strokeWidth={8} />
        ) : mood === "wide" ? (
          <ellipse cx={0} cy={100} rx={26} ry={34} fill="#5A0F22" stroke={INK} strokeWidth={7} />
        ) : (
          <path d="M -50 100 Q 0 80 50 100" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
        )}
        {mood === "angry" || mood === "yell" ? <path d="M 150 -70 l 20 -30 m -10 40 l 34 -12 m -24 -10 l 0 0" stroke={P.red} strokeWidth={9} strokeLinecap="round" /> : null}
      </g>
      {/* Namensschild */}
      <rect x={-150} y={top + 290} width={110} height={56} rx={10} fill="#FFF4DE" stroke={INK} strokeWidth={6} />
      <text x={-95} y={top + 330} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={INK}>
        TRPV1
      </text>
      {/* Arme */}
      {point ? (
        <g>
          <path d={`M 190 ${top + 360} Q 300 ${top + 300} 380 ${top + 250}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <circle cx={384} cy={top + 246} r={30} fill={G.door} stroke={INK} strokeWidth={7} />
        </g>
      ) : crack ? (
        <g>
          <path d={`M -190 ${top + 380} Q -60 ${top + 470} -10 ${top + 420}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <path d={`M 190 ${top + 380} Q 60 ${top + 470} 10 ${top + 420}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <circle cx={-14} cy={top + 418 + Math.sin(f * 0.9) * 6} r={34} fill={G.door} stroke={INK} strokeWidth={7} />
          <circle cx={14} cy={top + 418 - Math.sin(f * 0.9) * 6} r={34} fill={G.door} stroke={INK} strokeWidth={7} />
        </g>
      ) : (
        <g>
          <path d={`M -190 ${top + 380} Q -40 ${top + 520} 120 ${top + 470}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <path d={`M 190 ${top + 380} Q 40 ${top + 520} -120 ${top + 470}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <circle cx={120} cy={top + 470} r={30} fill={G.door} stroke={INK} strokeWidth={7} />
          <circle cx={-120} cy={top + 470} r={30} fill={G.door} stroke={INK} strokeWidth={7} />
        </g>
      )}
    </g>
  );
};

/** Thermometer-Schild. level 0..1 */
const Thermo: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly level: number; readonly cold?: boolean }> = ({ x, y, s = 1, level, cold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-300} width={80} height={300} rx={40} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <circle cx={0} cy={20} r={60} fill={cold ? "#5CC8FF" : P.red} stroke={INK} strokeWidth={8} />
    <rect x={-18} y={-270 + 260 * (1 - level)} width={36} height={270 * level} rx={18} fill={cold ? "#5CC8FF" : P.red} />
    {[0, 1, 2, 3].map((k) => (
      <line key={k} x1={40} x2={70} y1={-240 + k * 60} y2={-240 + k * 60} stroke={INK} strokeWidth={6} />
    ))}
  </g>
);

/** Gehirn-Beamter (rosa Hirnkopf, Brille, Krawatte). Kopf-Mitte ≈ y − 460·s. */
const Clerk: React.FC<Fig> = (p) => {
  const s = p.s ?? 1;
  const hx = p.x;
  const hy = p.y - s * (330 + 105 * 0.82 * 1.45);
  const r = 105 * 1.45 * s;
  return (
    <g>
      <Person pants="#3B3F66" headS={1.45} suit {...p} shirt="#8C95B8" hair="none" hairColor="#000" skin={G.brain} />
      <g transform={`translate(${hx} ${hy})`} opacity={0.9}>
        <path d={`M ${-r * 0.8} ${-r * 0.35} q ${r * 0.2} ${-r * 0.3} ${r * 0.4} 0 q ${r * 0.2} ${-r * 0.35} ${r * 0.45} 0 q ${r * 0.2} ${-r * 0.3} ${r * 0.4} 0`} fill="none" stroke="#C2457E" strokeWidth={7 * s} strokeLinecap="round" />
        <path d={`M ${-r * 0.55} ${-r * 0.7} q ${r * 0.25} ${-r * 0.2} ${r * 0.5} 0 q ${r * 0.2} ${-r * 0.2} ${r * 0.45} 0`} fill="none" stroke="#C2457E" strokeWidth={7 * s} strokeLinecap="round" />
        <line x1={0} y1={-r * 0.98} x2={0} y2={-r * 0.45} stroke="#C2457E" strokeWidth={7 * s} />
        {/* Brille */}
        <circle cx={-r * 0.36} cy={-r * 0.1} r={r * 0.3} fill="none" stroke={INK} strokeWidth={8 * s} />
        <circle cx={r * 0.36} cy={-r * 0.1} r={r * 0.3} fill="none" stroke={INK} strokeWidth={8 * s} />
        <line x1={-r * 0.06} x2={r * 0.06} y1={-r * 0.1} y2={-r * 0.1} stroke={INK} strokeWidth={8 * s} />
      </g>
    </g>
  );
};

/** Zungen-Figur mit Gesicht (Ursprung = Mitte). */
const Tongue: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly slam: number }> = ({ x, y, s = 1, f, slam }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 160 Q -300 -170 0 -200 Q 300 -170 260 160 Z" fill="#FF6F8E" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M 0 -150 L 0 100" stroke="#D9415F" strokeWidth={10} strokeLinecap="round" />
    {Array.from({ length: 10 }).map((_, k) => (
      <circle key={k} cx={-180 + (k % 5) * 90} cy={-60 + Math.floor(k / 5) * 110} r={9} fill="#D9415F" />
    ))}
    {/* Gesicht: wütend, rot */}
    <path d="M -120 -110 L -40 -80 M 120 -110 L 40 -80" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <ellipse cx={-80} cy={-50} rx={26} ry={30} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <ellipse cx={80} cy={-50} rx={26} ry={30} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <circle cx={-74} cy={-44} r={11} fill={INK} />
    <circle cx={86} cy={-44} r={11} fill={INK} />
    <path d="M -50 40 Q 0 10 50 40" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <Steam x={-230} y={-120} f={f} side={-1} s={0.7} />
    <Steam x={230} y={-120} f={f} side={1} s={0.7} />
    {/* Arm mit Beschwerde-Zettel */}
    <path d={`M 200 0 Q 330 ${-60 + slam * 120} 380 ${-40 + slam * 170}`} fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <g transform={`translate(${380} ${-40 + slam * 170}) rotate(${-14 + slam * 14})`}>
      <rect x={-120} y={-150} width={240} height={300} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
      <text x={0} y={-90} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={P.red}>
        COMPLAINT
      </text>
      {[0, 1, 2, 3].map((k) => (
        <line key={k} x1={-90} x2={90 - (k % 2) * 40} y1={-40 + k * 40} y2={-40 + k * 40} stroke={INK} strokeWidth={5} />
      ))}
      <text x={0} y={128} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={INK}>
        #4,817
      </text>
    </g>
  </g>
);

/** Kleine Zellen-Arbeiter mit Helm (laufen mit Eimern). */
const Cell: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly ph?: number }> = ({ x, y, s = 1, f, ph = 0 }) => {
  const st = Math.sin(f * 0.8 + ph);
  return (
    <g transform={`translate(${x} ${y + Math.abs(st) * -12}) scale(${s})`}>
      <line x1={-20} y1={-30} x2={-30 + st * 24} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={20} y1={-30} x2={30 - st * 24} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <circle cx={0} cy={-90} r={66} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
      <path d="M -66 -110 Q 0 -190 66 -110 Z" fill="#FFC531" stroke={INK} strokeWidth={6} />
      <path d="M -36 -96 l 18 10 l -18 10 M 36 -96 l -18 10 l 18 10" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={0} cy={-56} rx={14} ry={10} fill={INK} />
      <path d="M 60 -70 L 110 -40" stroke={INK} strokeWidth={8} />
      <path d="M 90 -50 L 150 -50 L 140 10 L 100 10 Z" fill="#5CC8FF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Sweat x={-70} y={-140} s={0.6} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Sets                                                               */
/* ------------------------------------------------------------------ */

/** Nachtmarkt-Stand (Hook + Outro). day = Tageslicht fürs Outro. */
const Stall: React.FC<{ readonly f: number; readonly day?: boolean }> = ({ f, day }) => (
  <g>
    <Grad id={day ? "stallD" : "stallN"} a={day ? "#7FD3FF" : "#2A1650"} b={day ? "#FFE3B0" : "#FF7A3D"} />
    <Persp vx={540} vy={980} c={day ? "#FFFFFF" : "#FFB36B"} n={16} o={0.18} />
    {/* Hintergrund-Stände in Fluchtperspektive */}
    {[-1, 1].map((sd) =>
      [0, 1, 2].map((k) => {
        const sc = 0.55 - k * 0.15;
        const xx = 540 + sd * (330 - k * 90);
        return (
          <g key={`${sd}-${k}`} transform={`translate(${xx} ${980}) scale(${sc})`}>
            <rect x={-200} y={-300} width={400} height={300} fill={["#FF4D5E", "#FFC531", "#22C7A9"][k]} stroke={INK} strokeWidth={10} />
            <path d="M -240 -300 L 240 -300 L 200 -400 L -200 -400 Z" fill="#FFFFFF" stroke={INK} strokeWidth={10} />
          </g>
        );
      }),
    )}
    {/* Lichterkette */}
    <path d="M -100 320 Q 540 470 1180 320" fill="none" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 11 }).map((_, k) => {
      const t = k / 10;
      const bx = lerp(-100, 1180, t);
      const by = 320 + 150 * 4 * t * (1 - t) * 0.5 + 16;
      const c = ["#FFD84A", "#FF5FA8", "#5CF0FF"][k % 3];
      return (
        <g key={k}>
          <Glow x={bx} y={by} r={70} c={c} o={day ? 0.25 : 0.7 + 0.2 * Math.sin(f * 0.2 + k)} id={`sl${k}${day ? "d" : "n"}`} />
          <circle cx={bx} cy={by} r={16} fill={c} stroke={INK} strokeWidth={4} />
        </g>
      );
    })}
    {/* Theke */}
    <rect x={-200} y={1240} width={1480} height={900} fill="#C47A45" stroke={INK} strokeWidth={9} />
    <rect x={-200} y={1240} width={1480} height={40} fill="#E69A5E" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }).map((_, k) => (
      <line key={k} x1={-100 + k * 170} x2={-100 + k * 170} y1={1290} y2={2140} stroke="#8C4F26" strokeWidth={6} />
    ))}
    {/* Schilder (Hintergrund-Gags) */}
    <Sign x={830} y={560} w={380} lines={["GHOST PEPPER", "CHALLENGE"]} size={44} bg="#FFD84A" r={4} />
    <Sign x={830} y={740} w={360} lines={["NO REFUNDS.", "NO SURVIVORS."]} size={32} bg="#FFFFFF" r={4} />
    <Sign x={230} y={620} w={340} lines={["BUY 1", "GET 1 FREE"]} size={50} bg={P.red} fg="#FFFFFF" r={-5} />
  </g>
);

/** Mund innen (Zähne oben/unten, Zäpfchen). */
const Mouth: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Grad id="mouth" a="#5A0F22" b="#B8243F" />
    <Glow x={540} y={760} r={700} c="#FF6F5A" o={0.55} id="mouthg" />
    <path d={`M 470 -100 Q 470 380 540 ${420 + Math.sin(f * 0.2) * 10} Q 610 380 610 -100 Z`} fill="#FF7E95" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 7 }).map((_, k) => (
      <path key={`t${k}`} d={`M ${-90 + k * 190} -40 L ${-90 + k * 190} 170 Q ${0 + k * 190} 240 ${90 + k * 190} 170 L ${90 + k * 190} -40 Z`} fill="#FFFDF2" stroke={INK} strokeWidth={8} />
    ))}
    {Array.from({ length: 7 }).map((_, k) => (
      <path key={`b${k}`} d={`M ${-90 + k * 190} 1960 L ${-90 + k * 190} 1760 Q ${0 + k * 190} 1690 ${90 + k * 190} 1760 L ${90 + k * 190} 1960 Z`} fill="#FFFDF2" stroke={INK} strokeWidth={8} />
    ))}
    <Sign x={250} y={340} w={330} lines={["COMPLAINTS", "DEPT."]} size={38} r={-6} />
    <Sign x={850} y={360} w={300} lines={["WAIT TIME:", "FOREVER"]} size={34} bg="#FFD84A" r={5} />
  </g>
);

/** Rachen-Tunnel (Ringe, Fluchtpunkt). t = Fahrt 0..1 */
const Throat: React.FC<{ readonly t: number }> = ({ t }) => (
  <g>
    <Grad id="throat" a="#3A0A1E" b="#9E1F3E" />
    {Array.from({ length: 9 }).map((_, k) => {
      const z = ((k / 9 + t * 0.9) % 1);
      const sc = 0.05 + z * z * 2.4;
      return <ellipse key={k} cx={540} cy={900} rx={520 * sc} ry={640 * sc} fill="none" stroke="#FF8FA8" strokeWidth={16 * sc + 3} opacity={0.3 + z * 0.6} />;
    })}
    <Glow x={540} y={900} r={300} c="#FFE6A0" o={0.8} id="throatg" />
  </g>
);

/** Club-Straße im Körper (Neon, Fluchtpunkt). */
const ClubStreet: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Grad id="club" a="#14092E" b="#5A1A6E" />
    <Persp vx={540} vy={1000} c={G.neonP} n={18} o={0.22} />
    <path d="M -200 1300 L 440 1000 L 640 1000 L 1280 1300 L 1280 2200 L -200 2200 Z" fill="#2B1840" stroke={INK} strokeWidth={8} />
    {/* Fassaden */}
    <path d="M -200 -200 L 440 760 L 440 1000 L -200 1300 Z" fill="#3B2266" stroke={INK} strokeWidth={8} />
    <path d="M 1280 -200 L 640 760 L 640 1000 L 1280 1300 Z" fill="#3B2266" stroke={INK} strokeWidth={8} />
    {/* Neon-Schilder */}
    <g transform="translate(150 560) skewY(28)">
      <rect x={-120} y={-70} width={260} height={140} rx={20} fill="#1A0C33" stroke={G.neonC} strokeWidth={8} />
      <text x={10} y={-8} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={G.neonC} opacity={0.75 + 0.25 * Math.sin(f * 0.7)}>
        CLUB
      </text>
      <text x={10} y={42} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={G.neonC}>
        NERVE
      </text>
    </g>
    <g transform="translate(930 600) skewY(-28)">
      <rect x={-130} y={-80} width={260} height={160} rx={16} fill="#FFF4DE" stroke={INK} strokeWidth={7} />
      <text x={0} y={-24} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={INK}>
        TONIGHT:
      </text>
      <text x={0} y={18} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={30} fill={P.red}>
        DJ SALIVA
      </text>
      <text x={0} y={56} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill={INK}>
        (AGAIN)
      </text>
    </g>
    <Glow x={150} y={560} r={260} c={G.neonC} o={0.35} id="clubg1" />
    <Glow x={540} y={980} r={380} c={G.neonP} o={0.4} id="clubg2" />
  </g>
);

/** Comic-Fläche (Farbe + Strahlen) für Nah-Einstellungen – bricht Set-Wiederholung (Lessons Lügen-Stadt #7). */
const ReactBg: React.FC<{ readonly id: string; readonly a: string; readonly b: string; readonly f: number; readonly ray?: string }> = ({ id, a, b, f, ray = "#FFFFFF" }) => (
  <g>
    <Grad id={id} a={a} b={b} />
    <g opacity={0.22} transform={`rotate(${f * 0.4} 540 900)`}>
      {Array.from({ length: 16 }).map((_, k) => {
        const a0 = (k / 16) * Math.PI * 2;
        const a1 = a0 + Math.PI / 32;
        return <path key={k} d={`M 540 900 L ${540 + Math.cos(a0) * 3000} ${900 + Math.sin(a0) * 3000} L ${540 + Math.cos(a1) * 3000} ${900 + Math.sin(a1) * 3000} Z`} fill={ray} />;
      })}
    </g>
    {Array.from({ length: 40 }).map((_, k) => (
      <circle key={k} cx={(k * 197) % 1300 - 100} cy={(k * 331) % 2100 - 100} r={10} fill={ray} opacity={0.18} />
    ))}
  </g>
);

/** Club-Eingang mit Samtkordel. */
const ClubDoor: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Grad id="door" a="#1A0C33" b="#4A1A5E" />
    <rect x={-200} y={-200} width={1480} height={1520} fill="#3A2266" />
    {Array.from({ length: 12 }).map((_, k) => (
      <line key={k} x1={-200} x2={1280} y1={-100 + k * 120} y2={-100 + k * 120} stroke="#2A1850" strokeWidth={8} />
    ))}
    <rect x={-200} y={1320} width={1480} height={900} fill="#22143A" stroke={INK} strokeWidth={8} />
    {/* Neon über der Tür */}
    <rect x={250} y={180} width={580} height={130} rx={24} fill="#1A0C33" stroke={G.neonP} strokeWidth={9} />
    <text x={540} y={266} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={66} fill={G.neonP} opacity={0.8 + 0.2 * Math.sin(f * 0.9)}>
      HEAT ONLY
    </text>
    <Glow x={540} y={245} r={420} c={G.neonP} o={0.35} id="doorg" />
    {/* Kordel */}
    {[110, 970].map((px) => (
      <g key={px}>
        <rect x={px - 14} y={1060} width={28} height={260} fill={G.gold} stroke={INK} strokeWidth={6} />
        <circle cx={px} cy={1052} r={26} fill={G.gold} stroke={INK} strokeWidth={6} />
      </g>
    ))}
    <Sign x={930} y={520} w={250} lines={["DRESS CODE:", "≥ PAINFUL"]} size={28} r={6} />
  </g>
);

/** Amt im Gehirn. */
const Office: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Grad id="office" a="#FFE7C2" b="#E8B98A" />
    <Persp vx={540} vy={760} c="#B9875A" n={14} o={0.25} />
    {/* Fenster mit Neuronen */}
    <rect x={120} y={200} width={360} height={420} rx={12} fill="#2A1650" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 5 }).map((_, k) => (
      <g key={k}>
        <line x1={170 + k * 70} y1={260 + (k % 2) * 120} x2={220 + k * 60} y2={480 - (k % 3) * 60} stroke="#FFD84A" strokeWidth={5} opacity={0.5 + 0.5 * Math.sin(f * 0.6 + k)} />
        <circle cx={170 + k * 70} cy={260 + (k % 2) * 120} r={14} fill="#FFD84A" />
      </g>
    ))}
    <line x1={300} x2={300} y1={200} y2={620} stroke={INK} strokeWidth={8} />
    {/* Aktenschränke */}
    {[700, 880].map((cx) => (
      <g key={cx}>
        <rect x={cx - 80} y={420} width={160} height={560} fill="#9AA7C7" stroke={INK} strokeWidth={8} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={cx - 60} y={450 + k * 180} width={120} height={150} rx={8} fill="#B9C4DE" stroke={INK} strokeWidth={6} />
        ))}
      </g>
    ))}
    <Sign x={790} y={290} w={360} lines={["NO THINKING", "AFTER 5 PM"]} size={36} bg="#FFFFFF" r={-3} />
    {/* Schreibtisch */}
    <rect x={-200} y={1120} width={1480} height={1000} fill="#8C4F26" stroke={INK} strokeWidth={9} />
    <rect x={-200} y={1120} width={1480} height={36} fill="#A9643A" stroke={INK} strokeWidth={6} />
    <Glow x={300} y={300} r={500} c="#FFF2C2" o={0.45} id="officeg" />
  </g>
);

/** Körper-Fabrik mit Alarm. */
const Factory: React.FC<{ readonly f: number }> = ({ f }) => {
  const a = Math.sin(f * 0.5);
  return (
    <g>
      <Grad id="fac" a="#3A1A1A" b="#8A2A1A" />
      <Persp vx={540} vy={900} c="#FF7A3D" n={16} o={0.25} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd < 0 ? -200 : 900} y={-200} width={380} height={2400} fill="#5A2A22" stroke={INK} strokeWidth={8} />
          {[200, 520, 840].map((yy) => (
            <rect key={yy} x={sd < 0 ? -60 : 920} y={yy} width={220} height={60} rx={30} fill="#B8BFD0" stroke={INK} strokeWidth={7} />
          ))}
        </g>
      ))}
      <rect x={-200} y={1250} width={1480} height={900} fill="#3B2622" stroke={INK} strokeWidth={8} />
      {/* Alarmleuchte */}
      <Glow x={540} y={240} r={700} c="#FF2020" o={0.45 + 0.35 * a} id="facg" />
      <path d={`M 540 240 L ${540 + Math.cos(f * 0.35) * 1600} ${240 + Math.sin(f * 0.35) * 500 + 400} L ${540 + Math.cos(f * 0.35 + 0.3) * 1600} ${240 + Math.sin(f * 0.35 + 0.3) * 500 + 400} Z`} fill="#FF4A3A" opacity={0.25} />
      <circle cx={540} cy={240} r={70} fill="#FF2020" stroke={INK} strokeWidth={8} />
      <Sign x={540} y={470} w={460} lines={["CALM DOWN DEPT.", "(CLOSED)"]} size={36} bg="#FFF4DE" r={-2} />
    </g>
  );
};

/** Garten (Schlauch). */
const Yard: React.FC = () => (
  <g>
    <Grad id="yard" a="#62C6FF" b="#D9F4FF" />
    <rect x={-200} y={1100} width={1480} height={1100} fill="#5DCB5A" stroke={INK} strokeWidth={8} />
    <rect x={-200} y={700} width={1480} height={420} fill="#F2E3C6" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, k) => (
      <path key={k} d={`M ${-180 + k * 130} 720 L ${-180 + k * 130} 640 L ${-130 + k * 130} 600 L ${-80 + k * 130} 640 L ${-80 + k * 130} 720`} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    ))}
    <Sign x={830} y={520} w={340} lines={["NEIGHBORHOOD", "WATCH"]} size={34} r={4} />
    <Glow x={900} y={200} r={400} c="#FFF6B0" o={0.6} id="yardg" />
  </g>
);

/** Bad am Morgen. */
const Bath: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Grad id="bath" a="#DFF6FF" b="#9FD8F0" />
    {Array.from({ length: 10 }).map((_, k) => (
      <line key={`v${k}`} x1={-100 + k * 140} x2={-100 + k * 140} y1={-200} y2={1300} stroke="#BCE6F5" strokeWidth={5} />
    ))}
    {Array.from({ length: 12 }).map((_, k) => (
      <line key={`h${k}`} x1={-200} x2={1280} y1={-100 + k * 120} y2={-100 + k * 120} stroke="#BCE6F5" strokeWidth={5} />
    ))}
    <rect x={-200} y={1300} width={1480} height={900} fill="#F2E3C6" stroke={INK} strokeWidth={8} />
    {/* Fenster mit Morgensonne */}
    <rect x={620} y={160} width={360} height={380} rx={14} fill="#FFE7A0" stroke={INK} strokeWidth={9} />
    <circle cx={800} cy={420} r={90} fill="#FFB84A" />
    <line x1={800} x2={800} y1={160} y2={540} stroke={INK} strokeWidth={8} />
    <Glow x={800} y={360} r={520} c="#FFF2B0" o={0.55} id="bathg" />
    {/* Vogel */}
    <path d={`M ${700 + (f % 60) * 2} 260 q 20 -20 40 0 q 20 -20 40 0`} fill="none" stroke={INK} strokeWidth={6} />
    <Sign x={260} y={330} w={340} lines={["LIVE. LAUGH.", "REGRET."]} size={38} bg="#FFFFFF" r={-4} />
  </g>
);

/** Toilette (seitlich, Ursprung = Sitzfläche). */
const Toilet: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={60} y={-380} width={150} height={300} rx={20} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <path d="M -150 0 L 200 0 Q 190 160 60 200 L 40 330 L -60 330 L -80 200 Q -160 140 -150 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-170} y={-20} width={390} height={34} rx={17} fill="#E6EEF5" stroke={INK} strokeWidth={7} />
  </g>
);

/** Darm-Tunnel mit EXIT-Tür (Morgen). */
const ExitHall: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Grad id="exit" a="#2A0F1E" b="#7A2A3E" />
    {Array.from({ length: 7 }).map((_, k) => {
      const sc = 0.25 + k * 0.32;
      return <ellipse key={k} cx={540} cy={820} rx={560 * sc} ry={520 * sc} fill="none" stroke="#C25A72" strokeWidth={10 + k * 3} opacity={0.5} />;
    })}
    <rect x={-200} y={1300} width={1480} height={900} fill="#4A1A2A" stroke={INK} strokeWidth={8} />
    {/* Tür */}
    <rect x={640} y={560} width={300} height={740} rx={14} fill="#8A3A2A" stroke={INK} strokeWidth={9} />
    <circle cx={900} cy={940} r={18} fill={G.gold} stroke={INK} strokeWidth={5} />
    <rect x={660} y={420} width={260} height={110} rx={12} fill="#1E9E4A" stroke={INK} strokeWidth={8} />
    <text x={790} y={500} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={70} fill="#FFFFFF">
      EXIT
    </text>
    <Glow x={790} y={475} r={280} c="#3DFF7A" o={0.35 + 0.1 * Math.sin(f * 0.6)} id="exitg" />
    <Sign x={240} y={480} w={330} lines={["WELCOME BACK,", "CAPSAICIN"]} size={30} bg="#FFD84A" r={-5} />
  </g>
);

const Bubble: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly s?: number; readonly o?: number }> = ({ x, y, text, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -260 -120 Q -280 -200 -160 -200 L 160 -200 Q 280 -200 260 -120 L 260 20 Q 280 100 160 100 L 0 100 L -80 180 L -60 100 L -160 100 Q -280 100 -260 20 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <text x={0} y={-20} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={120} fill={P.red}>
      {text}
    </text>
  </g>
);

/* ================================================================== */
/* Szenen                                                             */
/* ================================================================== */

/** 0–~4 s: Kerl beißt in die Ghost Pepper → Zunge legt Beschwerde ein. */
export const GHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("His", 0.55) - 2], d, f);
  if (i === 0) {
    // Bewegung ab Bild 1: Biss + Dampf + ><-Augen; Kopf groß über den Untertiteln
    const bite = W("ghost", 0.2);
    const hot = ease(lf, Math.min(10, bite), Math.min(10, bite) + 10);
    const hy = GUY_HEAD(1560, 1.25);
    return (
      <Shot cam={{ ...frameOn(560, hy + 60, 540, lerp(1080, 860, ease(lf, 12, 20)), lerp(1.3, 1.42, ease(lf, 0, len))), y: frameOn(560, hy + 60, 540, lerp(1080, 860, ease(lf, 12, 20)), 1.36).y + jolt(lf, 12, 10) }}>
        <Layer depth={0.6}>
          <Stall f={f} />
        </Layer>
        <Layer>
          <Guy x={540} y={1560} s={1.25} red={hot} eyes={hot > 0.5 ? "xx" : "wide"} brows={hot > 0.5 ? "worried" : "up"} mouth={hot > 0.5 ? "scream" : "o"} open={0.7 * hot + 0.2} armL={20} armR={150} bendR={-80} gest={hot * 8} />
          <Pepper x={lerp(760, 720, hot)} y={hy + lerp(80, 40, hot)} s={0.85} r={-30} bitten />
          <Steam x={540 - 250} y={hy} f={lf} side={-1} o={hot} />
          <Steam x={540 + 250} y={hy} f={lf} side={1} o={hot} />
          <Sweat x={540 + 170} y={hy - 160} s={1.2} o={hot} />
        </Layer>
      </Shot>
    );
  }
  // Zunge knallt die Beschwerde auf den Tresen
  const slam = ease(lf, W("complaint", 0.85) - W("His", 0.55) - 4, W("complaint", 0.85) - W("His", 0.55) + 2);
  return (
    <Shot cam={{ ...camPath(lf, [[0, frameOn(540, 980, 540, 900, 1.0)], [len, frameOn(560, 980, 540, 900, 1.08)]]), y: 980 + jolt(lf, W("complaint", 0.85) - W("His", 0.55) + 2, 14) }}>
      <Layer depth={0.7}>
        <Mouth f={f} />
      </Layer>
      <Layer>
        <Tongue x={460} y={1000} s={1.15} f={lf} slam={slam} />
      </Layer>
    </Shot>
  );
};

/** Abtauchen durch den Rachen → Capsaicin stolziert in die Club-Straße. */
export const GDive: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("meet", 0.25) - 1], d, f);
  if (i === 0) {
    return (
      <Shot cam={{ x: 540, y: 960, zoom: lerp(1, 1.6, ease(lf, 0, len)), rot: lerp(0, 18, ease(lf, 0, len)) }}>
        <Layer depth={0}>
          <Throat t={lf / 18} />
        </Layer>
      </Shot>
    );
  }
  const hugeAt = W("Huge", 0.75) - W("meet", 0.25);
  const walkIn = ease(lf, 0, Math.max(12, hugeAt - 6));
  const bling = Math.max(0, 1 - Math.abs(lf - hugeAt - 3) / 8);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(620, 1080, 540, 860, 1.25)], [len, frameOn(600, 1080, 540, 840, 1.4)]])}>
      <Layer depth={0.6}>
        <ClubStreet f={f} />
      </Layer>
      <Layer>
        {/* Statisten in der Schlange: Zucker-Würfel, Salzkorn */}
        <g transform="translate(300 1250) scale(0.8)">
          <rect x={-90} y={-180} width={180} height={180} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
          <path d="M -40 -110 l 20 10 M 40 -110 l -20 10 M -30 -50 q 30 -20 60 0" fill="none" stroke={INK} strokeWidth={8} />
          <text x={0} y={-200} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill="#FFFFFF">
            SUGAR
          </text>
        </g>
        <Caps x={lerp(1180, 620, walkIn)} y={1330} s={1.5} f={lf} walk={1 - ease(lf, hugeAt - 8, hugeAt)} armL={30} armR={lerp(30, 150, bling)} bling={bling} mouth={bling > 0.3 ? "grin" : "smug"} />
      </Layer>
    </Shot>
  );
};

/** TRPV1-Türsteher: weit → Thermometer → Brüllen. */
export const GDoor: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Its", 0.5) - 2, W("Yell", 0.75) - 2], d, f);
  if (i === 0) {
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 900, 540, 820, 0.95)], [len, frameOn(540, 900, 540, 820, 1.05)]])}>
        <Layer depth={0.6}>
          <ClubDoor f={f} />
        </Layer>
        <Layer>
          <Bouncer x={540} y={1330} s={1.05} f={lf} mood="angry" />
          <Caps x={lerp(1000, 860, ease(lf, 0, 16))} y={1360} s={0.75} f={lf} walk={1 - ease(lf, 10, 16)} armL={20} armR={60} mouth="smug" />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    return (
      <Shot cam={camPath(lf, [[0, frameOn(620, 620, 540, 700, 1.25)], [len, frameOn(620, 620, 540, 700, 1.35)]])}>
        <Layer depth={0.6}>
          <ReactBg id="thermo" a="#FFD84A" b="#FF8A1F" f={lf} />
        </Layer>
        <Layer>
          <Bouncer x={540} y={1330} s={1.05} f={lf} mood="smug" point />
          <Thermo x={900} y={600} s={0.9} level={0.85} />
          <Glow x={960} y={460} r={200} c="#FF4020" o={0.4} id="thermog" />
        </Layer>
      </Shot>
    );
  }
  return (
    <Shot cam={{ ...frameOn(540, 640, 540, 720, 1.5), y: frameOn(540, 640, 540, 720, 1.5).y + jolt(lf, 3, 14) }}>
      <Layer depth={0.5}>
        <ClubDoor f={f} />
        <Burst x={540} y={700} r0={420} r1={900} n={18} o={0.5} color="#FF3FD0" />
      </Layer>
      <Layer>
        <Bouncer x={540} y={1330} s={1.05} f={lf} mood="yell" />
      </Layer>
    </Shot>
  );
};

/** Keine Hitze, nur Schalter → Gehirn stempelt „FIRE“. */
export const GBrain: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He", 0.3, 2) - 2, W("brain", 0.55) - 3, W("signs", 0.82) - 3], d, f);
  if (i === 0) {
    // „brings no heat“: Capsaicin zeigt leere Taschen, Thermometer eiskalt
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 820, 1.2)], [len, frameOn(540, 1000, 540, 820, 1.3)]])}>
        <Layer depth={0.6}>
          <ReactBg id="cold" a="#7FD8FF" b="#2F6BFF" f={lf} />
        </Layer>
        <Layer>
          <Caps x={500} y={1360} s={1.25} f={lf} armL={95} armR={95} mouth="smug" />
          <Thermo x={860} y={1100} s={0.8} level={0.08} cold />
          <path d="M 330 1060 q 20 -40 40 0 M 650 1060 q 20 -40 40 0" fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.6} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Hebel „HEAT“ umlegen → Kanal glüht, Türsteher entsetzt
    const pull = ease(lf, 6, 12);
    return (
      <Shot cam={{ ...frameOn(560, 860, 540, 780, 1.1), y: frameOn(560, 860, 540, 780, 1.1).y + jolt(lf, 12, 12) }}>
        <Layer depth={0.6}>
          <ClubDoor f={f} />
        </Layer>
        <Layer>
          <Bouncer x={400} y={1330} s={1.0} f={lf} mood={pull > 0.5 ? "wide" : "angry"} open={pull} />
          {/* Hebel */}
          <rect x={700} y={900} width={150} height={240} rx={14} fill="#B8BFD0" stroke={INK} strokeWidth={8} />
          <text x={775} y={960} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={36} fill={P.red}>
            HEAT
          </text>
          <line x1={775} y1={1060} x2={775 + Math.sin(lerp(-0.7, 0.7, pull)) * 200} y2={1060 - Math.cos(lerp(-0.7, 0.7, pull)) * 200} stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <circle cx={775 + Math.sin(lerp(-0.7, 0.7, pull)) * 200} cy={1060 - Math.cos(lerp(-0.7, 0.7, pull)) * 200} r={30} fill={P.red} stroke={INK} strokeWidth={7} />
          <Caps x={lerp(950, 930, pull)} y={1360} s={0.9} f={lf} armL={20} armR={lerp(160, 200, pull)} mouth="grin" flip />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Gehirn-Amt liest den Zettel „FIRE“ (ohne hinzusehen: Kaffee + Handy)
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 720, 540, 760, 1.0)], [len, frameOn(540, 720, 540, 760, 1.08)]])}>
        <Layer depth={0.6}>
          <Office f={f} />
        </Layer>
        <Layer>
          <Clerk x={540} y={1300} s={1.05} eyes="half" look={[1, 0]} brows="neutral" mouth="flat" armL={60} armR={120} bendL={-40} bendR={-60} />
          <g transform="translate(250 1050) rotate(-8)">
            <rect x={-130} y={-90} width={260} height={180} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <text x={0} y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={80} fill={P.red}>
              FIRE!!
            </text>
          </g>
          <g transform="translate(830 1060)">
            <rect x={-46} y={-70} width={92} height={110} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <path d="M -20 -90 q 10 -20 0 -40 M 14 -90 q 10 -20 0 -40" fill="none" stroke="#FFFFFF" strokeWidth={6} />
            <text x={0} y={2} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill={INK}>
              #1 BOSS
            </text>
          </g>
        </Layer>
      </Shot>
    );
  }
  // Stempel „APPROVED“ knallt – Blick auf Kaffee, nicht auf den Zettel
  const stamp = ease(lf, 2, 6);
  return (
    <Shot cam={{ ...frameOn(420, 980, 540, 820, 1.55), y: frameOn(420, 980, 540, 820, 1.55).y + jolt(lf, 6, 14) }}>
      <Layer depth={0.6}>
        <Office f={f} />
      </Layer>
      <Layer>
        <Clerk x={600} y={1300} s={1.05} eyes="closed" brows="neutral" mouth="smug" armL={lerp(140, 60, stamp)} armR={60} bendL={-30} />
        <g transform="translate(330 1080) rotate(-8)">
          <rect x={-130} y={-90} width={260} height={180} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
          <text x={0} y={-10} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={70} fill={P.red}>
            FIRE!!
          </text>
          {stamp > 0.9 ? (
            <g transform="rotate(-14)">
              <rect x={-120} y={10} width={240} height={70} rx={8} fill="none" stroke="#1E9E4A" strokeWidth={8} />
              <text x={0} y={62} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill="#1E9E4A">
                APPROVED
              </text>
            </g>
          ) : null}
        </g>
        <g transform={`translate(330 ${lerp(760, 1040, stamp)})`}>
          <rect x={-50} y={-120} width={100} height={110} rx={20} fill="#8C4F26" stroke={INK} strokeWidth={7} />
          <rect x={-90} y={-14} width={180} height={40} rx={8} fill="#1E9E4A" stroke={INK} strokeWidth={7} />
        </g>
        {stamp > 0.9 ? <Burst x={330} y={1080} r0={160} r1={260} n={10} o={1 - clamp01((lf - 6) / 14)} /> : null}
      </Layer>
    </Shot>
  );
};

/** Alarm in der Fabrik → Kerl am Schlauch weint → Nah „It's you“. */
export const GPanic: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Sirens", 0.3) + 8, W("you", 0.85) - 2], d, f);
  if (i === 0) {
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 960, 1.15), rot: Math.sin(lf * 0.4) * 1.5 }}>
        <Layer depth={0.6}>
          <Factory f={f} />
        </Layer>
        <Layer>
          {[0, 1, 2, 3, 4].map((k) => {
            const x = ((k * 330 + lf * 24) % 1650) - 250;
            return <Cell key={k} x={x} y={1250 - (k % 2) * 170} s={1.45 - (k % 2) * 0.35} f={lf} ph={k} />;
          })}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    const hy = GUY_HEAD(1500, 1.0);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, hy + 150, 540, 820, 1.3)], [len, frameOn(540, hy + 150, 540, 820, 1.42)]])}>
        <Layer depth={0.6}>
          <Yard />
        </Layer>
        <Layer>
          <Guy x={540} y={1500} s={1.0} red={1} eyes="xx" brows="sad" mouth="scream" open={0.8} armL={150} armR={140} bendL={-60} bendR={-60} />
          {/* Schlauch in den Mund */}
          <path d={`M -200 1300 Q 200 1250 ${540 - 60} ${hy + 120}`} fill="none" stroke="#2E8B3A" strokeWidth={30} strokeLinecap="round" />
          <path d={`M -200 1300 Q 200 1250 ${540 - 60} ${hy + 120}`} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="2 40" />
          <Tears x={540} y={hy - 20} f={lf} s={1.1} />
        </Layer>
      </Shot>
    );
  }
  const hy = GUY_HEAD(1500, 1.0);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, hy, 540, 760, 2.0)], [len, frameOn(540, hy, 540, 760, 2.3)]])}>
      <Layer depth={0.6}>
        <Yard />
      </Layer>
      <Layer>
        <Guy x={540} y={1500} s={1.0} red={1} eyes="xx" brows="sad" mouth="frown" armL={10} armR={10} />
        <Tears x={540} y={hy - 20} f={lf} s={1.0} />
        <Steam x={540 - 170} y={hy} f={lf} side={-1} s={0.7} />
        <Steam x={540 + 170} y={hy} f={lf} side={1} s={0.7} />
      </Layer>
    </Shot>
  );
};

/** Nächster Morgen: Klo → Türsteher am EXIT → Schrei (#@%&! + Piep). */
export const GMorning: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Same", 0.35) - 2, W("exit", 0.85) - 2], d, f);
  if (i === 0) {
    const hy = GUY_HEAD(1220, 1.0, true);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, hy + 160, 540, 820, 1.0)], [len, frameOn(540, hy + 160, 540, 820, 1.06)]])}>
        <Layer depth={0.6}>
          <Bath f={f} />
        </Layer>
        <Layer>
          <Toilet x={520} y={1230} s={1.0} />
          <Guy x={540} y={1220} s={1.0} seated eyes="half" brows="neutral" mouth="smile" armL={60} armR={60} bendL={-70} bendR={-70} />
          {/* Zeitung */}
          <g transform={`translate(540 ${hy + 330})`}>
            <rect x={-170} y={-110} width={340} height={220} fill="#F5F5F0" stroke={INK} strokeWidth={7} />
            <text x={0} y={-50} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={34} fill={INK}>
              BODY NEWS
            </text>
            <text x={0} y={0} textAnchor="middle" fontFamily="Montserrat" fontWeight={700} fontSize={24} fill={INK}>
              ALL CALM. NOTHING
            </text>
            <text x={0} y={34} textAnchor="middle" fontFamily="Montserrat" fontWeight={700} fontSize={24} fill={INK}>
              TO SEE HERE.
            </text>
          </g>
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    return (
      <Shot cam={camPath(lf, [[0, frameOn(620, 900, 540, 820, 0.95)], [len, frameOn(620, 900, 540, 820, 1.05)]])}>
        <Layer depth={0.6}>
          <ExitHall f={f} />
        </Layer>
        <Layer>
          <Bouncer x={420} y={1330} s={1.05} f={lf} mood="smug" crack />
          <Caps x={830} y={1360} s={1.0} f={lf} armL={20} armR={160} wave mouth="grin" />
        </Layer>
      </Shot>
    );
  }
  const hy = GUY_HEAD(1220, 1.0, true);
  const pop = ease(lf, 0, 5);
  return (
    <Shot cam={{ ...frameOn(540, hy + 40, 540, 780, 1.45), x: 540 + Math.sin(lf * 2.3) * 8 * (1 - clamp01(lf / 40)), y: frameOn(540, hy + 40, 540, 780, 1.45).y + jolt(lf, 2, 16) }}>
      <Layer depth={0.5}>
        <Bath f={f} />
        <Burst x={540} y={hy} r0={300} r1={900} n={20} o={0.6} color="#FF4D5E" />
      </Layer>
      <Layer>
        <Toilet x={520} y={1230} s={1.0} />
        <Guy x={540} y={1220} s={1.0} seated red={1} eyes="xx" brows="angry" mouth="scream" open={1} armL={170} armR={170} bendL={-20} bendR={-20} gest={10} />
        <Bubble x={560} y={hy - 330} text="#@%&!" s={lerp(0.4, 0.75, pop)} o={pop} />
        <Steam x={540 - 250} y={hy} f={lf} side={-1} />
        <Steam x={540 + 250} y={hy} f={lf} side={1} />
      </Layer>
    </Shot>
  );
};

/** Loop: derselbe Stand, „BUY 1 GET 1 FREE“ – er hält zwei hoch. */
export const GOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const two = ease(f, W("two", 0.7) - 6, W("two", 0.7) + 2);
  const hy = GUY_HEAD(1560, 1.25);
  return (
    <Shot cam={camPath(f, [[0, frameOn(520, hy + 60, 540, 700, 1.2)], [d, frameOn(540, hy + 60, 540, 700, 1.3)]])}>
      <Layer depth={0.6}>
        <Stall f={f} day />
        {two > 0.5 ? <circle cx={230} cy={620} r={230} fill="none" stroke={P.red} strokeWidth={12} opacity={two} /> : null}
      </Layer>
      <Layer>
        <Guy x={540} y={1560} s={1.25} eyes="half" look={[0, 0]} brows="neutral" mouth="grin" armL={lerp(20, 160, two)} armR={lerp(20, 160, two)} bendL={-50} bendR={-50} />
        <Sweat x={540 - 170} y={hy - 170} s={1.1} />
        <Pepper x={540 - lerp(190, 230, two)} y={hy + lerp(330, -150, two)} s={0.75} r={-20} />
        <Pepper x={540 + lerp(190, 230, two)} y={hy + lerp(330, -150, two)} s={0.75} r={20} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const GHOST_SCENES: Record<string, React.FC> = {
  hook: GHook,
  dive: GDive,
  door: GDoor,
  brain: GBrain,
  panic: GPanic,
  morning: GMorning,
  outro: GOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(GHOST_SCENES).slice(1)) TRANSITIONS[id] = CUT;

/** Eine Text-Ebene: rote 1-Wort-Untertitel + Cover; Schilder nur als Hintergrund-Gag. */
export const GHOST_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
  filmLook: { grain: 0.08, vignette: 0.4 },
};
