import React from "react";
import { camPath, clamp01, ease, frameOn, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/schnecken-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, BusInterior, Face, INK, P, Person, Seat, Street, Sweat } from "./gaehnSets";
import type { FaceProps, Hair, PersonProps } from "./gaehnSets";
import { Church, Pew, ReactBg } from "./suche";
import { Bed, Door, Room } from "./akku";
import { CouchBack, CouchFront, Poof, Sparkle } from "./todo";
import { Clock, PovHand } from "./meckern";

/**
 * „In This City, If You Text "On My Way" From Bed, You Turn Into a Snail“ (episodes/schnecken-stadt.json) – 2D-Cartoon,
 * schwarzer Humor. Konsequenz = Verwandlung (Schneckenhaus → Stielaugen → Schneckenfuß → ganze Schnecke mit Menschengesicht),
 * stumm lesbar ab Bild 1. Eine Text-Ebene (Untertitel); Chat-Blasen zeigen nur ein Renn-Männchen, keine Schrift.
 * Schnitte an Wort-Beats, kein Set > 2 am Stück (SCHNECKE_SHOT_COUNT).
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.max(1, Math.round(x)));
  const i = shotIndex(f, c);
  const a = i === 0 ? 0 : c[i - 1];
  const b = i < c.length ? c[i] : d;
  return { i, lf: f - a, len: b - a };
};

const Shot: React.FC<{ readonly cam: Cam2D; readonly children: React.ReactNode }> = ({ cam, children }) => (
  <Stage2D cam={cam} mood="haze" noSky>
    {children}
  </Stage2D>
);

const push = (lf: number, len: number, wx: number, wy: number, z0: number, z1: number, sx = 540, sy = 900) =>
  camPath(lf, [
    [0, frameOn(wx, wy, sx, sy, z0)],
    [len, frameOn(wx, wy, sx, sy, z1)],
  ]);

/** Feder: 0 → Überschwinger → 1 ab Frame a. */
const spring = (f: number, a: number, dur = 12) => {
  if (f < a) return 0;
  const t = clamp01((f - a) / dur);
  return 1 + Math.sin(t * Math.PI) * 0.25 * (1 - t);
};

const C = {
  devin: "#2F6FD6",
  devinHair: "#FF8A1F",
  kyle: P.lime,
  flesh: "#C9DB8E",
  fleshDark: "#9DB566",
  slime: "#D8F7B4",
  shell: "#C97A3D",
  shellDark: "#8E4F22",
  maya: "#FFD23F",
  mayaDark: "#D9A400",
  mom: "#B07CFF",
  dad: "#4FA3A5",
  bubble: "#2F8CFF",
  night: "#1E2350",
  bedroom: "#7ED6C8",
  hall: "#FFC94D",
};

/* ------------------------------------------------------------------ */
/* Schnecken-Bausteine                                                */
/* ------------------------------------------------------------------ */

/** Schneckenhaus mit Spirale; Ursprung = Mitte. */
const Shell: React.FC<{ readonly x: number; readonly y: number; readonly R: number; readonly c?: string; readonly dark?: string; readonly r?: number; readonly sash?: boolean }> = ({
  x,
  y,
  R,
  c = C.shell,
  dark = C.shellDark,
  r = 0,
  sash,
}) => {
  if (R <= 0.5) return null;
  const pts: string[] = [];
  for (let k = 0; k <= 60; k++) {
    const t = (k / 60) * Math.PI * 5;
    const rr = R * 0.86 * (1 - k / 64);
    pts.push(`${(Math.cos(t + 2.4) * rr).toFixed(1)} ${(Math.sin(t + 2.4) * rr).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <circle r={R} fill={c} stroke={INK} strokeWidth={Math.max(3, R * 0.06)} />
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={dark} strokeWidth={Math.max(3, R * 0.09)} strokeLinecap="round" />
      <ellipse cx={-R * 0.42} cy={-R * 0.5} rx={R * 0.22} ry={R * 0.12} fill="#FFFFFF" opacity={0.55} transform={`rotate(-35 ${-R * 0.42} ${-R * 0.5})`} />
      {sash ? <path d={`M ${-R * 0.95} ${-R * 0.3} L ${R * 0.3} ${R * 0.95} L ${R * 0.6} ${R * 0.78} L ${-R * 0.7} ${-R * 0.62} Z`} fill={P.red} stroke={INK} strokeWidth={Math.max(3, R * 0.04)} /> : null}
    </g>
  );
};

/**
 * Stielaugen über einem Kopf (Kopfmitte hx/hy, Radius r). k = 0: Augen noch im Gesicht, 1: oben auf den Stielen.
 * Deckt die Gesichtsaugen ab, sobald sie wandern (die Brauen bleiben).
 */
const Stalks: React.FC<{ readonly hx: number; readonly hy: number; readonly r: number; readonly k: number; readonly skin: string; readonly look?: readonly [number, number]; readonly f?: number; readonly wide?: boolean }> = ({
  hx,
  hy,
  r,
  k,
  skin,
  look = [0, 0],
  f = 0,
  wide,
}) => {
  if (k <= 0) return null;
  const kk = Math.min(1.15, k);
  const wob = Math.sin(f * 0.25) * 0.08 * r;
  return (
    <g>
      <ellipse cx={hx} cy={hy - r * 0.1} rx={r * 0.74} ry={r * 0.26} fill={skin} />
      {([-1, 1] as const).map((sd) => {
        const bx = hx + sd * r * 0.3;
        const by = hy - r * 0.86;
        const tx = hx + sd * (r * 0.36 + r * 0.32 * kk) + wob * sd;
        const ty = lerp(hy - r * 0.12, hy - r * 0.9 - r * 1.5 * kk, clamp01(k));
        const er = r * (wide ? 0.34 : 0.28);
        return (
          <g key={sd}>
            {k > 0.15 ? <path d={`M ${bx} ${by} Q ${bx + sd * r * 0.1} ${(by + ty) / 2} ${tx} ${ty + er * 0.6}`} fill="none" stroke={INK} strokeWidth={r * 0.26} strokeLinecap="round" /> : null}
            {k > 0.15 ? <path d={`M ${bx} ${by} Q ${bx + sd * r * 0.1} ${(by + ty) / 2} ${tx} ${ty + er * 0.6}`} fill="none" stroke={C.flesh} strokeWidth={r * 0.16} strokeLinecap="round" /> : null}
            <circle cx={tx} cy={ty} r={er} fill="#FFFFFF" stroke={INK} strokeWidth={Math.max(3, r * 0.06)} />
            <circle cx={tx + look[0] * er * 0.4} cy={ty + look[1] * er * 0.4} r={er * 0.45} fill={INK} />
            <circle cx={tx + look[0] * er * 0.4 - er * 0.15} cy={ty + look[1] * er * 0.4 - er * 0.15} r={er * 0.13} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

/** Schleimspur (glänzend) entlang der Bodenlinie y von x0 bis x1. */
const Slime: React.FC<{ readonly x0: number; readonly x1: number; readonly y: number; readonly h?: number; readonly f?: number }> = ({ x0, x1, y, h = 40, f = 0 }) => {
  if (Math.abs(x1 - x0) < 2) return null;
  const a = Math.min(x0, x1);
  const b = Math.max(x0, x1);
  return (
    <g>
      <path d={`M ${a} ${y} Q ${a} ${y - h} ${a + 40} ${y - h * 0.8} L ${b - 20} ${y - h} Q ${b + 20} ${y - h * 0.6} ${b} ${y} Q ${(a + b) / 2} ${y + h * 0.35} ${a} ${y} Z`} fill={C.slime} opacity={0.85} stroke="#9FD27A" strokeWidth={4} />
      {Array.from({ length: Math.max(1, Math.floor((b - a) / 140)) }).map((_, k) => (
        <ellipse key={k} cx={a + 60 + k * 140 + (f % 20)} cy={y - h * 0.5} rx={26} ry={7} fill="#FFFFFF" opacity={0.8} />
      ))}
    </g>
  );
};

/** Tropfen, die von oben herablaufen (t in Frames). */
const Drips: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly t: number; readonly n?: number; readonly len?: number }> = ({ x, y, w, t, n = 6, len = 300 }) => {
  if (t <= 0) return null;
  return (
    <g>
      <rect x={x} y={y - 20} width={w} height={40 + Math.min(40, t * 2)} rx={20} fill={C.slime} stroke="#9FD27A" strokeWidth={4} opacity={0.92} />
      {Array.from({ length: n }).map((_, k) => {
        const dx = x + (w / (n + 1)) * (k + 1);
        const l = Math.min(len * (0.5 + ((k * 37) % 10) / 20), t * (6 + (k % 3) * 3));
        return (
          <g key={k}>
            <rect x={dx - 16} y={y} width={32} height={l} rx={16} fill={C.slime} stroke="#9FD27A" strokeWidth={4} opacity={0.92} />
            <circle cx={dx} cy={y + l} r={22} fill={C.slime} stroke="#9FD27A" strokeWidth={4} />
            <ellipse cx={dx - 6} cy={y + l * 0.5} rx={5} ry={Math.max(4, l * 0.2)} fill="#FFFFFF" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

/** Schneckenfuß über den Beinen einer stehenden Person (k = 0..1). */
const FootOver: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly k: number; readonly side?: 1 | -1 }> = ({ x, y, s, k, side = -1 }) => {
  if (k <= 0) return null;
  const tail = 120 + 160 * k;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={`M ${-80} ${-150 * k} Q ${-95} ${-40} ${side * tail} ${-10} Q ${side * (tail + 40)} ${10} ${side * tail * 0.6} ${10} L ${-side * 110} ${10} Q ${-side * 120} ${-30} ${80} ${-150 * k} Z`}
        fill={C.flesh}
        stroke={INK}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <path d={`M ${-60} ${-90 * k} Q 0 ${-70 * k} ${60} ${-90 * k}`} fill="none" stroke={C.fleshDark} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={-20} cy={-40} rx={30} ry={8} fill="#FFFFFF" opacity={0.7} />
    </g>
  );
};

type Acc = { readonly hat?: boolean; readonly tie?: boolean; readonly collar?: boolean; readonly cardigan?: boolean; readonly bib?: boolean; readonly ring?: boolean; readonly stache?: boolean; readonly glasses?: boolean };

/** Kleiner Haar-Renderer für Schneckenköpfe. */
const SnailHair: React.FC<{ readonly r: number; readonly hair: Hair; readonly c: string }> = ({ r, hair, c }) => {
  if (hair === "spiky") return <path d={`M ${-r * 0.95} ${-r * 0.3} L ${-r * 0.7} ${-r * 1.1} L ${-r * 0.35} ${-r * 0.75} L 0 ${-r * 1.2} L ${r * 0.35} ${-r * 0.75} L ${r * 0.7} ${-r * 1.1} L ${r * 0.95} ${-r * 0.3} Q 0 ${-r * 0.65} ${-r * 0.95} ${-r * 0.3} Z`} fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
  if (hair === "bun")
    return (
      <g>
        <circle cx={0} cy={-r * 1.02} r={r * 0.4} fill={c} stroke={INK} strokeWidth={6} />
        <path d={`M ${-r * 0.98} ${-r * 0.05} Q ${-r * 0.9} ${-r} 0 ${-r} Q ${r * 0.9} ${-r} ${r * 0.98} ${-r * 0.05} Q 0 ${-r * 0.6} ${-r * 0.98} ${-r * 0.05} Z`} fill={c} stroke={INK} strokeWidth={6} />
      </g>
    );
  if (hair === "curly") return <g>{[-0.75, -0.4, 0, 0.4, 0.75].map((k) => <circle key={k} cx={k * r} cy={-r * (0.82 - Math.abs(k) * 0.25)} r={r * 0.32} fill={c} stroke={INK} strokeWidth={6} />)}</g>;
  if (hair === "side") return <path d={`M ${-r * 0.98} ${-r * 0.1} Q ${-r} ${-r * 1.05} 0 ${-r * 1.02} Q ${r} ${-r * 1.05} ${r * 0.98} ${-r * 0.15} Q ${r * 0.2} ${-r * 0.75} ${-r * 0.98} ${-r * 0.1} Z`} fill={c} stroke={INK} strokeWidth={6} />;
  return null;
};

/**
 * Ganze Schnecke mit Menschengesicht. Ursprung = Boden unter dem Kopf-Ende; blickt nach rechts (flip = links).
 * Kopfmitte liegt bei (x + 190 s, y − 330 s).
 */
const SnailMan: React.FC<
  Omit<FaceProps, "r"> & {
    readonly x: number;
    readonly y: number;
    readonly s?: number;
    readonly flip?: boolean;
    readonly hair?: Hair;
    readonly hairColor?: string;
    readonly shell?: string;
    readonly shellDark?: string;
    readonly stalk?: number;
    readonly hide?: number;
    readonly acc?: Acc;
    readonly lean?: number;
  }
> = (p) => {
  const { x, y, s = 1, flip, hair = "none", hairColor = "#4A2E1E", shell = C.shell, shellDark = C.shellDark, stalk = 1, hide = 0, acc = {}, lean = 0 } = p;
  const skin = p.skin ?? P.skin;
  const r = 95;
  const hx = 190;
  const hy = -330 + hide * 200;
  const f = p.f ?? 0;
  const squish = Math.sin(f * 0.18) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (1 + squish)} ${s * (1 - squish)}) rotate(${lean})`}>
      {/* Fuß */}
      <path d="M -360 0 Q -380 -40 -300 -60 L 140 -90 Q 260 -100 270 -20 Q 272 0 240 0 Z" fill={C.flesh} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={-120} cy={-30} rx={60} ry={10} fill="#FFFFFF" opacity={0.6} />
      {/* Hals */}
      <g opacity={1 - hide}>
        <path d={`M 80 -60 Q 100 ${hy + 60} ${hx} ${hy + 20} Q ${hx + 90} ${hy + 40} 280 -150 L 270 -40 Z`} fill={C.flesh} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {acc.tie ? <path d={`M ${hx - 10} ${hy + r * 0.95} L ${hx + 20} ${hy + r * 0.95} L ${hx + 30} ${hy + r * 2.2} L ${hx + 5} ${hy + r * 2.5} L ${hx - 20} ${hy + r * 2.2} Z`} fill={P.red} stroke={INK} strokeWidth={5} /> : null}
        {acc.cardigan ? <path d={`M ${hx - 90} ${hy + r * 0.9} Q ${hx} ${hy + r * 1.3} ${hx + 90} ${hy + r * 0.9} L ${hx + 80} ${hy + r * 1.6} Q ${hx} ${hy + r * 1.9} ${hx - 80} ${hy + r * 1.6} Z`} fill={C.mom} stroke={INK} strokeWidth={5} /> : null}
        {acc.collar ? <rect x={hx - 26} y={hy + r * 0.85} width={52} height={30} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={5} /> : null}
        {acc.bib ? <path d={`M ${hx - 70} ${hy + r * 0.85} L ${hx + 70} ${hy + r * 0.85} L ${hx} ${hy + r * 2.1} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={5} /> : null}
      </g>
      {/* Haus */}
      <Shell x={-90} y={-250} R={230} c={shell} dark={shellDark} sash={acc.hat} />
      {/* Kopf */}
      <g transform={`translate(${hx} ${hy}) scale(${1 - hide * 0.6})`} opacity={1 - hide}>
        {hair === "bun" ? <SnailHair r={r} hair="bun" c={hairColor} /> : null}
        <circle r={r} fill={skin} stroke={INK} strokeWidth={7} />
        {hair !== "bun" ? <SnailHair r={r} hair={hair} c={hairColor} /> : null}
        <Face {...p} r={r} skin={skin} />
        {acc.stache ? <path d={`M ${-r * 0.42} ${r * 0.4} Q ${-r * 0.2} ${r * 0.18} 0 ${r * 0.3} Q ${r * 0.2} ${r * 0.18} ${r * 0.42} ${r * 0.4} Q 0 ${r * 0.36} ${-r * 0.42} ${r * 0.4} Z`} fill="#4A2E1E" stroke={INK} strokeWidth={5} /> : null}
        <Stalks hx={0} hy={0} r={r} k={stalk} skin={skin} look={p.look} f={f} wide={p.eyes === "wide"} />
        {acc.glasses ? (
          <g fill="none" stroke={INK} strokeWidth={6}>
            <circle cx={-r * 0.36} cy={-r * 0.12} r={r * 0.26} />
            <circle cx={r * 0.36} cy={-r * 0.12} r={r * 0.26} />
          </g>
        ) : null}
        {acc.hat ? (
          <g transform={`translate(0 ${-r * 0.85}) rotate(-8)`}>
            <rect x={-r * 0.75} y={-14} width={r * 1.5} height={22} rx={8} fill={INK} />
            <rect x={-r * 0.48} y={-r * 0.9} width={r * 0.96} height={r * 0.9} rx={8} fill={INK} />
            <rect x={-r * 0.48} y={-r * 0.3} width={r * 0.96} height={16} fill={P.red} />
          </g>
        ) : null}
        {acc.ring ? (
          <g transform={`translate(${r * 0.68} ${-r * 1.4})`}>
            <circle r={r * 0.2} fill="none" stroke="#FFD23F" strokeWidth={10} />
            <path d={`M 0 ${-r * 0.2} l ${-r * 0.12} ${-r * 0.16} l ${r * 0.12} ${-r * 0.12} l ${r * 0.12} ${r * 0.12} Z`} fill="#BFF4FF" stroke={INK} strokeWidth={4} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Chat-Blase „on my way“: nur ein rennendes Männchen + Pfeil (keine Schrift). sent = 0..1 fliegt nach oben weg. */
const OmwBubble: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number; readonly sent?: number; readonly checks?: boolean }> = ({ x, y, s = 1, o = 1, sent = 0, checks }) => {
  if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y - sent * 260}) scale(${s * (1 + sent * 0.15)})`} opacity={o * (1 - sent * 0.6)}>
      <path d="M -150 -80 Q -150 -110 -120 -110 L 120 -110 Q 150 -110 150 -80 L 150 50 Q 150 80 120 80 L 60 80 L 90 130 L 10 80 L -120 80 Q -150 80 -150 50 Z" fill={C.bubble} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* Renn-Männchen */}
      <g stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" fill="none">
        <circle cx={-40} cy={-60} r={18} fill="#FFFFFF" stroke="none" />
        <path d="M -50 -35 L -70 15 M -58 -15 L -20 -25 L 0 -5 M -70 15 L -40 40 M -70 15 L -105 45 M -58 -15 L -95 -5" />
        <path d="M 30 -15 L 105 -15 M 80 -40 L 108 -15 L 80 10" />
      </g>
      {checks ? (
        <g stroke="#9BFFB0" strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M 70 55 l 12 12 l 24 -26 M 95 55 l 12 12 l 24 -26" />
        </g>
      ) : null}
    </g>
  );
};

/** Handy mit leuchtendem Bildschirm. */
const Phone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly glow?: string }> = ({ x, y, s = 1, r = 0, glow = "#7FD6FF" }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-40} y={-74} width={80} height={148} rx={14} fill={INK} />
    <rect x={-32} y={-64} width={64} height={124} rx={8} fill={glow} />
    <rect x={-22} y={-50} width={44} height={20} rx={6} fill={C.bubble} />
  </g>
);

/** Taube (seitlich, blickt nach links). */
const Pigeon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly bib?: number; readonly fork?: number; readonly tilt?: number }> = ({ x, y, s = 1, f, bib = 0, fork = 0, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -40 L -60 0 M 20 -40 L 10 0" stroke="#E2683C" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={0} cy={-170} rx={190} ry={140} fill="#9AA3B8" stroke={INK} strokeWidth={8} />
    <path d="M 60 -200 Q 220 -230 250 -120 Q 160 -150 60 -120 Z" fill="#7C8499" stroke={INK} strokeWidth={7} />
    <g transform={`translate(-150 -330) rotate(${tilt + Math.sin(f * 0.2) * 4})`}>
      <path d="M 20 60 Q 70 120 120 150 L -20 160 Z" fill="#6FD3A9" stroke={INK} strokeWidth={6} />
      <circle r={95} fill="#9AA3B8" stroke={INK} strokeWidth={8} />
      <path d="M -88 0 L -170 18 L -88 34 Z" fill="#F2A23C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={-34} cy={-18} r={30} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={-44} cy={-14} r={15} fill="#FF7A2E" />
      <circle cx={-46} cy={-14} r={7} fill={INK} />
      <path d="M -70 -60 L 0 -44" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    </g>
    {bib > 0 ? (
      <g opacity={bib} transform={`translate(-140 -230)`}>
        <path d="M -90 0 L 90 0 L 0 150 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        <path d="M -60 20 L 60 20 M -40 60 L 40 60" stroke={P.red} strokeWidth={10} />
      </g>
    ) : null}
    {fork > 0 ? (
      <g opacity={fork} transform={`translate(-260 -260) rotate(${-20 + Math.sin(f * 0.5) * 6})`}>
        <rect x={-8} y={0} width={16} height={180} rx={8} fill="#D8DCE6" stroke={INK} strokeWidth={5} />
        <path d="M -30 0 L -30 -70 M -10 0 L -10 -70 M 10 0 L 10 -70 M 30 0 L 30 -70 M -30 0 L 30 0" stroke="#D8DCE6" strokeWidth={12} strokeLinecap="round" />
        <path d="M -30 0 L -30 -70 M -10 0 L -10 -70 M 10 0 L 10 -70 M 30 0 L 30 -70" stroke={INK} strokeWidth={3} fill="none" />
      </g>
    ) : null}
  </g>
);

/** Blumenstrauß. wilt 0..1 lässt ihn hängen. */
const Flowers: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly wilt?: number }> = ({ x, y, s = 1, wilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-30, 0, 30].map((dx, k) => {
      const tx = dx * 1.4 + wilt * (k - 1) * 60;
      const ty = -150 + wilt * 90;
      return (
        <g key={k}>
          <path d={`M 0 0 Q ${dx} -80 ${tx} ${ty}`} fill="none" stroke="#2E9E4F" strokeWidth={10} />
          <circle cx={tx} cy={ty} r={34} fill={[P.red, P.pink, P.bus][k]} stroke={INK} strokeWidth={6} opacity={1 - wilt * 0.3} />
          <circle cx={tx} cy={ty} r={12} fill={P.bus} />
        </g>
      );
    })}
    <path d="M -50 -20 L 50 -20 L 20 60 L -20 60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
  </g>
);

/** Spinnennetz-Ecke. */
const Web: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.9}>
    {[0, 22, 45, 67, 90].map((a) => (
      <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 160} y2={Math.sin((a * Math.PI) / 180) * 160} />
    ))}
    {[50, 95, 140].map((rr) => (
      <path key={rr} d={`M ${rr} 0 Q ${rr * 0.8} ${rr * 0.3} ${rr * 0.92} ${rr * 0.38} Q ${rr * 0.55} ${rr * 0.55} ${rr * 0.7} ${rr * 0.7} Q ${rr * 0.3} ${rr * 0.8} ${rr * 0.38} ${rr * 0.92} Q ${rr * 0.1} ${rr * 0.85} 0 ${rr}`} />
    ))}
  </g>
);

/** Kerzenstummel mit Wachs. */
const Candle: React.FC<{ readonly x: number; readonly y: number; readonly h?: number }> = ({ x, y, h = 30 }) => (
  <g>
    <path d={`M ${x - 40} ${y} Q ${x - 50} ${y - 20} ${x - 20} ${y - 16} L ${x + 20} ${y - 16} Q ${x + 50} ${y - 20} ${x + 40} ${y} Z`} fill="#FFF4DE" stroke={INK} strokeWidth={5} />
    <rect x={x - 16} y={y - 16 - h} width={32} height={h} fill="#FFF4DE" stroke={INK} strokeWidth={5} />
    <path d={`M ${x} ${y - 16 - h} l 0 -14`} stroke={INK} strokeWidth={4} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Devin: React.FC<Fig> = (p) => <Person pants="#2B2F45" {...p} shirt={C.devin} hair="spiky" hairColor={C.devinHair} skin={p.skin ?? P.skin} />;
const Kyle: React.FC<Fig> = (p) => <Person pants="#3B3F66" {...p} shirt={C.kyle} hair="curly" hairColor="#4A2E1E" skin={P.skin2} />;

/** Kopfmitte einer Person. */
const headOf = (x: number, y: number, s: number, seated = false) => [x, y + ((seated ? -250 : -330) - 86) * s] as const;
/** Handposition (ohne Beugung). */
const hand = (x: number, y: number, s: number, deg: number, side: 1 | -1, seated = false) => {
  const sh = (seated ? -250 : -330) + 40;
  const a = (deg * Math.PI) / 180;
  return [x + side * (78 + Math.sin(a) * 130) * s, y + (sh + Math.cos(a) * 130) * s] as const;
};

/** Devin-Schnecke (Gesicht + Haar wie Devin). */
const DevinSnail: React.FC<Omit<React.ComponentProps<typeof SnailMan>, "hair" | "hairColor">> = (p) => <SnailMan hair="spiky" hairColor={C.devinHair} {...p} />;

/* ------------------------------------------------------------------ */
/* Kulissen                                                           */
/* ------------------------------------------------------------------ */

const Bedroom: React.FC<{ readonly wall?: string; readonly night?: boolean }> = ({ wall = C.bedroom, night }) => (
  <g>
    <Room wall={wall} floor={1500} />
    <rect x={700} y={420} width={300} height={360} rx={16} fill={night ? C.night : "#BFE8FF"} stroke={INK} strokeWidth={8} />
    <line x1={850} y1={420} x2={850} y2={780} stroke={INK} strokeWidth={8} />
    <line x1={700} y1={600} x2={1000} y2={600} stroke={INK} strokeWidth={8} />
    {/* Poster: Schnecke mit Pfeil (Hintergrund-Gag) */}
    <g transform="translate(160 560)">
      <rect x={-110} y={-140} width={220} height={280} rx={10} fill="#FFF4DE" stroke={INK} strokeWidth={6} />
      <Shell x={10} y={10} R={60} />
      <path d="M -70 90 L 70 90 M 40 70 L 70 90 L 40 110" stroke={P.red} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
  </g>
);

const CityHall: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#8ED8FF" />
    {[
      [-100, 260],
      [600, 160],
    ].map(([cx, cy], k) => (
      <g key={k} transform={`translate(${((cx + f * (1.5 + k)) % 1600) - 200} ${cy})`}>
        <ellipse rx={170} ry={60} fill="#FFFFFF" />
        <ellipse cx={-90} cy={20} rx={110} ry={50} fill="#FFFFFF" />
      </g>
    ))}
    <rect x={40} y={620} width={1000} height={760} fill="#F2E6CF" stroke={INK} strokeWidth={9} />
    <path d="M 0 640 L 540 360 L 1080 640 Z" fill="#E8D6B0" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {[140, 330, 520, 710, 900].map((x) => (
      <rect key={x} x={x} y={700} width={70} height={680} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    ))}
    <circle cx={540} cy={530} r={60} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <rect x={-2000} y={1380} width={5000} height={2000} fill="#C9B79A" stroke={INK} strokeWidth={8} />
  </g>
);

const LivingRoom: React.FC<{ readonly warm?: boolean }> = ({ warm }) => (
  <g>
    <Room wall={warm ? "#FFB86B" : "#F7A6C8"} floor={1500} />
    <rect x={120} y={420} width={260} height={200} rx={10} fill="#FFF4DE" stroke={INK} strokeWidth={6} />
    <circle cx={250} cy={520} r={60} fill={C.shell} stroke={INK} strokeWidth={5} />
  </g>
);

/** Esszimmer mit kaltem Braten, Kerzenstummeln, Spinnweben. */
const DiningTable: React.FC<{ readonly y: number }> = ({ y }) => (
  <g>
    <rect x={60} y={y} width={960} height={50} rx={14} fill="#B97A45" stroke={INK} strokeWidth={8} />
    <rect x={100} y={y + 50} width={40} height={260} fill="#8E5A2E" stroke={INK} strokeWidth={6} />
    <rect x={940} y={y + 50} width={40} height={260} fill="#8E5A2E" stroke={INK} strokeWidth={6} />
    <ellipse cx={540} cy={y - 10} rx={200} ry={40} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <path d={`M 400 ${y - 20} Q 400 ${y - 140} 540 ${y - 140} Q 680 ${y - 140} 680 ${y - 20} Z`} fill="#A0623A" stroke={INK} strokeWidth={7} />
    <path d={`M 470 ${y - 100} q 20 -10 40 0 M 560 ${y - 110} q 20 -10 40 0`} stroke="#6B3E22" strokeWidth={6} fill="none" />
    <Candle x={260} y={y} h={18} />
    <Candle x={820} y={y} h={10} />
    <Web x={380} y={y - 140} s={0.6} r={0} />
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

/** Bild 1: Kyle im Bett tippt die Renn-Blase, schickt sie – sofort springt ein Schneckenhaus auf seinen Rücken. */
const HookBed: React.FC<{ readonly lf: number; readonly f: number }> = ({ lf, f }) => {
  const send = ease(lf, 8, 18);
  const pop = spring(lf, 14, 12);
  const stalk = ease(lf, 50, 74);
  const X = 470;
  const Y = 1330;
  const s = 1.05;
  const [hx, hy] = headOf(X, Y, s, true);
  const [px, py] = hand(X, Y, s, 150, 1, true);
  const shocked = lf > 20;
  return (
    <g>
      <Bedroom />
      <Bed x={540} y={1470} w={980} c="#7FA8FF" />
      <Shell x={X - 150} y={Y - 300} R={190 * pop} />
      <Kyle
        x={X}
        y={Y}
        s={s}
        seated
        eyes={shocked ? "wide" : "half"}
        look={shocked ? [-1, -0.6] : [1, 0.6]}
        brows={shocked ? "up" : "neutral"}
        mouth={shocked ? "scream" : "smug"}
        open={shocked ? 0.55 : 0}
        armR={150}
        bendR={-70}
        armL={shocked ? 160 : 30}
        bendL={shocked ? -40 : 50}
      />
      <Stalks hx={hx} hy={hy} r={105 * s} k={stalk} skin={P.skin2} look={[-1, 0.4]} f={f} wide />
      <Phone x={px} y={py - 40} s={1.3} r={-8} />
      <rect x={-200} y={1330} width={1480} height={240} rx={40} fill="#7FA8FF" stroke={INK} strokeWidth={8} />
      <path d="M 120 1400 q 60 -40 120 0 q 60 40 120 0" fill="none" stroke="#FFFFFF" strokeWidth={8} opacity={0.6} />
      <OmwBubble x={px - 60} y={py - 240} s={1.05} sent={send} checks={send > 0.5} />
      <Poof x={X - 230} y={Y - 330} t={lf - 14} s={0.55} />
      <Drips x={X - 260} y={Y - 160} w={200} t={lf - 30} n={3} len={180} />
    </g>
  );
};

export const SHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const snail = W("snail", 0.82);
  const from = W("from", 0.45);
  const { i, lf, len } = useShot([from - 2, snail - 3], d, f);
  if (i <= 1) {
    return (
      <Shot cam={i === 0 ? push(lf, len, 520, 1000, 1.22, 1.3, 540, 860) : push(lf, len, 420, 900, 1.6, 1.72, 540, 820)}>
        <Layer>
          <HookBed lf={f} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Ganze Schnecke im Bett: Decke fliegt weg, Schleim auf dem Laken, Schrei
  const fly = ease(lf, 0, 10);
  return (
    <Shot cam={push(lf, len, 520, 1100, 1.0, 1.08, 540, 880)}>
      <Layer depth={0.5}>
        <ReactBg a="#7ED6C8" b="#A6EBDF" f={f} cx={520} cy={900} />
      </Layer>
      <Layer>
        <Bed x={540} y={1480} w={980} c="#7FA8FF" />
        <Slime x0={150} x1={900} y={1350} h={50} f={f} />
        <SnailMan x={430} y={1350} s={1.05} hair="curly" hairColor="#4A2E1E" skin={P.skin2} eyes="wide" look={[0.6, -0.5]} brows="up" mouth="scream" open={0.7} f={f} shell={C.shell} />
        <rect x={-200 + fly * 900} y={1330 - fly * 900} width={900} height={240} rx={40} fill="#7FA8FF" stroke={INK} strokeWidth={8} transform={`rotate(${fly * 40} ${250 + fly * 900} ${1450 - fly * 900})`} />
        <Phone x={820} y={1290} s={1.2} r={20} />
        <Poof x={260} y={1180} t={lf} s={0.6} />
        <Burst x={620} y={990} r0={160} r1={160 + 140 * ease(lf, 0, 8)} n={12} o={1 - ease(lf, 8, 18)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const SRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const stalksW = W("stalks", 0.3);
  const { i, lf, len } = useShot([W("Almost", 0.45) - 2, W("Bro", 0.7) - 2], d, f);
  if (i === 0) {
    // Frau im Bademantel auf dem Sofa tippt „five minutes out“ – Augen springen auf Stiele
    const k = ease(f, stalksW - 4, stalksW + 6);
    const X = 540;
    const Y = 1300;
    const s = 1.15;
    const [hx, hy] = headOf(X, Y, s, true);
    const [px, py] = hand(X, Y, s, 150, 1, true);
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.18, 1.28, 540, 900)}>
        <Layer>
          <LivingRoom />
          <CouchBack x={540} y={1360} w={900} color="#5B6BD6" />
          <Shell x={X + 150} y={Y - 290} R={170 * spring(lf, 6, 12)} c="#E87FB0" dark="#B04D80" />
          <Person x={X} y={Y} s={s} seated shirt="#FFFFFF" cardigan={false} hair="bun" hairColor="#2A1B12" skin={P.skin3} eyes="half" look={[1, 0.6]} brows={k > 0.5 ? "up" : "neutral"} mouth={k > 0.5 ? "o" : "smug"} open={0.4} armR={150} bendR={-70} armL={20} />
          <Stalks hx={hx} hy={hy} r={105 * s} k={k} skin={P.skin3} look={[0.8, 0.8]} f={f} wide />
          <Phone x={px} y={py - 40} s={1.4} r={-8} />
          <CouchFront x={540} y={1420} w={900} color="#5B6BD6" />
          <OmwBubble x={px - 40} y={py - 260} s={0.9} sent={ease(lf, 4, 12)} checks />
          <Poof x={hx} y={hy - 200} t={f - stalksW + 2} s={0.6} />
        </Layer>
      </Shot>
    );
  }
  // Bus: halbe Schnecke rutscht durch den Gang, Pendler heben die Füße, Warnschild (2. Einstellung: nah auf Schleim + Gesicht)
  const slide = ease(f, W("Almost", 0.45) - 2, d, "linear");
  const sx = lerp(80, 700, slide);
  return (
    <Shot cam={i === 1 ? push(lf, len, 540, 1150, 1.15, 1.22) : push(lf, len, sx - 40, 1300, 1.7, 1.85, 540, 860)}>
      <Layer depth={0.7}>
        <BusInterior />
      </Layer>
      <Layer>
        <Slime x0={-300} x1={sx - 60} y={1560} h={46} f={f} />
        <Seat x={170} y={1460} s={1.9} c="#3D6BE0" />
        <Seat x={910} y={1460} s={1.9} c="#3D6BE0" />
        <Person x={170} y={1190} s={0.75} seated shirt={P.pink} hair="pony" hairColor="#3A2618" eyes="wide" look={[0.5, 1]} brows="up" mouth="scream" open={0.5} armR={150} armL={160} />
        <Person x={910} y={1190} s={0.75} seated shirt={P.teal} hair="side" hairColor="#2A1B12" skin={P.skin3} eyes="squint" look={[-0.5, 1]} brows="angry" mouth="frown" armR={160} armL={30} flip />
        <Shell x={sx - 200} y={1560 - 320} R={125} />
        <Person x={sx} y={1560} s={0.9} shirt={P.orange} hair="spiky" hairColor="#2A1B12" eyes="half" look={[1, 0]} brows="neutral" mouth="smug" armR={30} armL={20} lean={-6} />
        <FootOver x={sx} y={1560} s={0.9} k={1} />
        <Phone x={hand(sx, 1560, 0.9, 30, 1)[0]} y={hand(sx, 1560, 0.9, 30, 1)[1] - 20} s={1} />
        {/* Warnschild „nasser Boden“ (Symbol) */}
        <g transform="translate(940 1600)">
          <path d="M -70 0 L 0 -200 L 70 0 Z" fill="#FFD23F" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -10 -130 q 20 30 0 60" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
          <circle cx={6} cy={-50} r={9} fill={INK} />
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* mayor                                                              */
/* ================================================================== */

export const SMayor: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He's", 0.55) - 2], d, f);
  if (i === 0) {
    // Platz vor dem Rathaus: Menge wartet an einem Band (Bärte, Spinnweben auf der Schere), winzige Bürgermeister-Schnecke in der Ferne
    const crowd = [
      { x: 120, c: P.pink, h: "bun" as Hair, beard: 0 },
      { x: 300, c: P.lime, h: "side" as Hair, beard: 0.9 },
      { x: 780, c: P.purple, h: "curly" as Hair, beard: 0 },
      { x: 960, c: P.teal, h: "none" as Hair, beard: 1.1 },
    ];
    return (
      <Shot cam={push(lf, len, 540, 1100, 0.95, 1.02, 540, 960)}>
        <Layer depth={0.6}>
          <CityHall f={f} />
        </Layer>
        <Layer>
          <rect x={430} y={1210} width={20} height={300} fill="#D8DCE6" stroke={INK} strokeWidth={5} />
          <rect x={630} y={1210} width={20} height={300} fill="#D8DCE6" stroke={INK} strokeWidth={5} />
          <path d={`M 440 1260 Q 540 ${1290 + Math.sin(f * 0.2) * 6} 640 1260`} stroke={P.red} strokeWidth={22} fill="none" />
          {crowd.map((p, k) => (
            <g key={k}>
              <Person x={p.x} y={1520} s={0.62} shirt={p.c} hair={p.h} hairColor={p.beard ? "#EDEDED" : "#3A2618"} beard={p.beard} wrinkles={p.beard ? 0.8 : 0} eyes={k % 2 ? "half" : "closed"} look={[0, 0]} brows="sad" mouth="flat" armR={k === 0 ? 170 : 20} armL={10} flip={k > 1} />
              {k === 0 ? (
                <g>
                  <line x1={hand(p.x, 1520, 0.62, 170, 1)[0]} y1={hand(p.x, 1520, 0.62, 170, 1)[1]} x2={hand(p.x, 1520, 0.62, 170, 1)[0] + 10} y2={1060} stroke={INK} strokeWidth={4} />
                  <ellipse cx={hand(p.x, 1520, 0.62, 170, 1)[0] + 10} cy={1010} rx={44} ry={54} fill="#B8BFD0" stroke={INK} strokeWidth={5} />
                </g>
              ) : null}
            </g>
          ))}
          {/* Riesen-Schere mit Spinnweben */}
          <g transform="translate(540 1150) rotate(-20)">
            <path d="M -20 0 L -200 -60 L -20 -20 Z M 20 0 L -200 40 L 0 20 Z" fill="#D8DCE6" stroke={INK} strokeWidth={6} />
            <circle cx={40} cy={-24} r={34} fill="none" stroke={P.red} strokeWidth={14} />
            <circle cx={40} cy={30} r={34} fill="none" stroke={P.red} strokeWidth={14} />
            <Web x={-200} y={-60} s={0.6} r={10} />
          </g>
          {/* Bürgermeister-Schnecke weit hinten links */}
          <Slime x0={-300} x1={lerp(60, 70, ease(lf, 0, len))} y={1640} h={22} f={f} />
          <SnailMan x={lerp(60, 70, ease(lf, 0, len))} y={1640} s={0.48} skin={P.skin} hair="side" hairColor="#9A9AA8" eyes="squint" look={[1, 0]} brows="worried" mouth="flat" f={f} acc={{ hat: true }} shell="#7C5CD6" shellDark="#4E3A99" />
          <path d="M 230 1420 L 290 1460 L 220 1480" stroke={P.red} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f * 0.3)} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Bürgermeister-Schnecke schwitzt, Schärpe, Zylinder – kriecht Millimeter
  return (
    <Shot cam={push(lf, len, 540, 1050, 1.15, 1.25, 540, 900)}>
      <Layer depth={0.5}>
        <ReactBg a="#7C5CD6" b="#9B82E8" f={f} cx={540} cy={900} />
      </Layer>
      <Layer>
        <Slime x0={-400} x1={300 + lf * 0.3} y={1380} h={40} f={f} />
        <SnailMan x={330 + lf * 0.3} y={1380} s={1.15} skin={P.skin} hair="side" hairColor="#9A9AA8" eyes="squint" look={[1, 0]} brows="worried" mouth="grin" f={f} acc={{ hat: true }} shell="#7C5CD6" shellDark="#4E3A99" lean={-3} />
        <Sweat x={330 + 190 * 1.15 + 100} y={1380 - 360 * 1.15} s={1.3} o={1} />
        <Sweat x={330 + 190 * 1.15 - 90} y={1380 - 300 * 1.15} s={1} o={0.6 + 0.4 * Math.sin(f * 0.4)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* devin                                                              */
/* ================================================================== */

export const SDevin: React.FC = () => {
  const { f, d, W } = useBeats();
  const its = W("It's", 0.3);
  const typing = W("typing", 0.55);
  const can = W("Can", 0.75);
  const { i, lf, len } = useShot([its - 2, typing - 2, can - 2], d, f);
  const X = 470;
  const Y = 1330;
  const s = 1.05;
  if (i === 0) {
    // Devin im Bett, Chips-Krümel, winkt in die Kamera
    return (
      <Shot cam={push(lf, len, 520, 1000, 1.15, 1.25, 540, 860)}>
        <Layer>
          <Bedroom wall="#FFC2E0" />
          <Bed x={540} y={1470} w={980} c="#FF9A3D" />
          <Devin x={X} y={Y} s={s} seated eyes="open" look={[0, 0]} brows="up" mouth="grin" armR={170} bendR={-20} gest={14} armL={30} bendL={50} />
          <rect x={-200} y={1330} width={1480} height={240} rx={40} fill="#FF9A3D" stroke={INK} strokeWidth={8} />
          {/* Chipstüte + Krümel */}
          <g transform="translate(800 1300) rotate(14)">
            <rect x={-70} y={-110} width={140} height={190} rx={16} fill={P.red} stroke={INK} strokeWidth={7} />
            <circle cx={0} cy={-20} r={34} fill="#FFD23F" stroke={INK} strokeWidth={5} />
          </g>
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} cx={300 + k * 90} cy={1360 + (k % 2) * 20} r={10} fill="#FFD23F" stroke={INK} strokeWidth={3} />
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Wanduhr 7:00 groß, Devin klein darunter, rührt sich nicht
    const tick = Math.sin(f * 0.5) * 0.02;
    return (
      <Shot cam={push(lf, len, 540, 760, 1.0, 1.06, 540, 760)}>
        <Layer depth={0.5}>
          <ReactBg a="#FFC2E0" b="#FFD9EC" f={f} cx={540} cy={760} />
        </Layer>
        <Layer>
          <Clock x={540} y={720} s={1.25} h={(7 / 12) * Math.PI * 2} m={tick} />
          <Burst x={540} y={720} r0={400} r1={460} n={14} o={0.5 + 0.5 * Math.sin(f * 0.4)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Handy nah: Daumen schickt die Renn-Blase
    const send = ease(lf, 10, 20);
    return (
      <Shot cam={push(lf, len, 540, 900, 1.0, 1.05, 540, 860)}>
        <Layer depth={0.5}>
          <ReactBg a={C.bubble} b="#5FA8FF" f={f} cx={540} cy={900} />
        </Layer>
        <Layer>
          <rect x={210} y={240} width={660} height={1180} rx={70} fill={INK} />
          <rect x={240} y={280} width={600} height={1100} rx={44} fill="#F4F6FF" />
          {[0, 1].map((k) => (
            <rect key={k} x={270} y={360 + k * 130} width={360 - k * 80} height={90} rx={30} fill="#D9DEEA" />
          ))}
          <OmwBubble x={620} y={820} s={1.2} sent={send * 0.5} checks={send > 0.6} />
          <circle cx={760} cy={1250} r={52} fill={C.bubble} stroke={INK} strokeWidth={6} />
          <path d="M 735 1250 L 790 1250 M 770 1228 L 792 1250 L 770 1272" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" />
          <g transform={`translate(${lerp(900, 790, ease(lf, 0, 10))} ${lerp(1700, 1300, ease(lf, 0, 10)) + (send > 0 && send < 1 ? 20 : 0)})`}>
            <PovHand x={0} y={0} w={0} skin={P.skin} />
          </g>
          <Sparkle x={760} y={1180} t={lf - 10} s={1} />
        </Layer>
      </Shot>
    );
  }
  // Schneckenhaus wächst, Devin springt panisch aus dem Bett, greift den Strauß
  const pop = spring(lf, 2, 12);
  const jump = ease(lf, 6, 18);
  const dx = lerp(X, 620, jump);
  const dy = lerp(Y, 1500, jump) - Math.sin(jump * Math.PI) * 220;
  const [hx, hy] = headOf(dx, dy, s, jump < 0.5);
  return (
    <Shot cam={push(lf, len, 540, 1050, 1.0, 1.06, 540, 880)}>
      <Layer>
        <Bedroom wall="#FFC2E0" />
        <Bed x={540} y={1470} w={980} c="#FF9A3D" />
        <Shell x={dx - 140 * s} y={dy - (jump < 0.5 ? 270 : 340) * s} R={110 * pop} />
        <Devin x={dx} y={dy} s={s} seated={jump < 0.5} eyes="wide" look={[1, -0.4]} brows="up" mouth="scream" open={0.7} armR={160} armL={140} bendL={-30} />
        <Flowers x={hand(dx, dy, s, 160, 1, jump < 0.5)[0]} y={hand(dx, dy, s, 160, 1, jump < 0.5)[1]} s={1} />
        {jump < 0.5 ? <rect x={-200} y={1330} width={1480} height={240} rx={40} fill="#FF9A3D" stroke={INK} strokeWidth={8} /> : null}
        <Poof x={dx - 140} y={dy - 290} t={lf - 2} s={0.6} />
        <Sweat x={hx + 110} y={hy - 30} s={1.3} o={1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* traffic                                                            */
/* ================================================================== */

export const STraffic: React.FC = () => {
  const { f, d, W } = useBeats();
  const foot = W("foot", 0.75);
  const { i, lf, len } = useShot([W("His", 0.45) - 2], d, f);
  const run = Math.sin(f * 0.6);
  if (i === 0) {
    // Leere Straße (kein einziges Auto), Devin rennt und tippt „stuck in traffic“ (Blase mit Auto-Symbol)
    const X = 540;
    const Y = 1520;
    const s = 0.95;
    const [px, py] = hand(X, Y, s, 150, 1);
    return (
      <Shot cam={camPath(lf, [
        [0, frameOn(540, 1150, 540, 900, 1.0)],
        [len, frameOn(540, 1150, 540, 900, 1.06)],
      ])}>
        <Layer depth={0.7}>
          <g transform={`translate(${-((f * 10) % 600)} 0)`}>
            <Street ground={1560} />
          </g>
        </Layer>
        <Layer>
          <Shell x={X - 140} y={Y - 300} R={120} />
          <Devin x={X} y={Y - Math.abs(run) * 24} s={s} eyes="half" look={[1, 0.8]} brows="worried" mouth="smug" armR={150} bendR={-70} armL={lerp(10, 60, (run + 1) / 2)} lean={6} />
          <Phone x={px} y={py - 40} s={1.1} r={-8} />
          <Flowers x={hand(X, Y, s, 40, -1)[0]} y={hand(X, Y, s, 40, -1)[1]} s={0.8} />
          {/* Blase: Auto + Ampel-Symbol */}
          <g transform={`translate(${px + 40} ${py - 260}) scale(${spring(lf, 6, 10)})`}>
            <path d="M -150 -90 Q -150 -120 -120 -120 L 120 -120 Q 150 -120 150 -90 L 150 50 Q 150 80 120 80 L 60 80 L 90 130 L 10 80 L -120 80 Q -150 80 -150 50 Z" fill={C.bubble} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <rect x={-100} y={-50} width={140} height={60} rx={20} fill="#FFFFFF" />
            <circle cx={-70} cy={20} r={18} fill={INK} />
            <circle cx={10} cy={20} r={18} fill={INK} />
            <rect x={70} y={-90} width={50} height={140} rx={14} fill={INK} />
            <circle cx={95} cy={-60} r={14} fill={P.red} />
            <circle cx={95} cy={-20} r={14} fill="#FFD23F" />
            <circle cx={95} cy={20} r={14} fill="#55D66B" />
          </g>
          {/* leere Straße: Steppenläufer rollt durchs Bild (Hintergrund-Gag) */}
          <g transform={`translate(${1200 - ((lf * 9) % 1600)} 1700) rotate(${lf * 9})`}>
            <circle r={60} fill="none" stroke="#B48A55" strokeWidth={10} />
            <path d="M -50 -20 L 50 20 M -40 30 L 40 -30 M 0 -60 L 0 60" stroke="#B48A55" strokeWidth={8} />
          </g>
        </Layer>
      </Shot>
    );
  }
  // Beine verschmelzen zu einem Fuß, Schuhe fliegen weg, er platscht hin und rutscht weiter
  const k = ease(f, foot - 6, foot + 4);
  const flop = ease(f, foot + 4, foot + 14);
  const X = 560;
  const Y = 1500;
  const s = 1.15;
  return (
    <Shot cam={push(lf, len, 560, 1150, 1.15, 1.22, 540, 900)}>
      <Layer depth={0.5}>
        <ReactBg a="#FF9A3D" b="#FFB870" f={f} cx={560} cy={1000} />
      </Layer>
      <Layer>
        <Slime x0={-300} x1={X - 40} y={Y} h={44} f={f} />
        <Shell x={X - 170} y={Y - 320 + flop * 60} R={140} />
        <Devin x={X} y={Y + flop * 40} s={s} eyes="wide" look={[0, 1]} brows="up" mouth="scream" open={0.6} armR={lerp(40, 150, flop)} armL={lerp(30, 160, flop)} lean={lerp(0, 18, flop)} />
        <FootOver x={X} y={Y} s={s} k={k} />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${X + sd * 50 + sd * k * 300} ${Y - 10 - Math.sin(k * Math.PI) * 400 + k * 30}) rotate(${sd * k * 200})`} opacity={k > 0.05 ? 1 : 0}>
            <ellipse rx={48} ry={22} fill={INK} />
            <rect x={-30} y={-40} width={50} height={30} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          </g>
        ))}
        <Poof x={X} y={Y - 60} t={f - foot + 2} s={0.7} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* pigeon                                                             */
/* ================================================================== */

export const SPigeon: React.FC = () => {
  const { f, d, W } = useBeats();
  const brunch = W("brunch", 0.8);
  const { i, lf, len } = useShot([W("A", 0.35) - 2], d, f);
  if (i === 0) {
    // Park-Weg: Devin als halbe Schnecke kriecht mit dem Strauß, Stielaugen
    const X = lerp(380, 520, ease(lf, 0, len, "linear"));
    const Y = 1480;
    const s = 1.0;
    const [hx, hy] = headOf(X, Y, s);
    return (
      <Shot cam={push(lf, len, 520, 1100, 1.05, 1.12, 540, 900)}>
        <Layer depth={0.6}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#8ED8FF" />
          {[-200, 200, 650, 1050].map((x, k) => (
            <g key={x}>
              <rect x={x - 20} y={900} width={40} height={600} fill="#8E5A2E" stroke={INK} strokeWidth={6} />
              <circle cx={x} cy={860} r={170 + (k % 2) * 30} fill="#55C46A" stroke={INK} strokeWidth={7} />
            </g>
          ))}
          <rect x={-2000} y={1380} width={5000} height={2000} fill="#6FD36E" stroke={INK} strokeWidth={7} />
          <rect x={-2000} y={1440} width={5000} height={120} fill="#E8D6B0" stroke={INK} strokeWidth={6} />
        </Layer>
        <Layer>
          <Slime x0={-200} x1={X - 60} y={Y} h={36} f={f} />
          <Shell x={X - 160} y={Y - 300} R={140} />
          <Devin x={X} y={Y} s={s} eyes="half" look={[1, 0]} brows="worried" mouth="flat" armR={40} armL={20} lean={8} />
          <Stalks hx={hx} hy={hy} r={105 * s} k={1} skin={P.skin} look={[1, 0]} f={f} />
          <FootOver x={X} y={Y} s={s} k={1} />
          <Flowers x={hand(X, Y, s, 40, 1)[0]} y={hand(X, Y, s, 40, 1)[1]} s={0.85} wilt={0.3} />
          {/* Schatten der Taube fällt schon ins Bild */}
          <ellipse cx={980} cy={1500} rx={200 * ease(lf, len - 30, len)} ry={40 * ease(lf, len - 30, len)} fill={INK} opacity={0.25} />
        </Layer>
      </Shot>
    );
  }
  // Untersicht: Riesen-Taube legt Serviette an, hebt die Gabel – Devin verkriecht sich ins Haus
  const bib = ease(lf, 4, 12);
  const fork = ease(f, brunch - 6, brunch + 2);
  const hide = ease(f, brunch + 2, brunch + 10);
  return (
    <Shot cam={push(lf, len, 540, 1000, 0.95, 1.02, 540, 900)}>
      <Layer depth={0.5}>
        <ReactBg a="#6FD36E" b="#94E293" f={f} cx={540} cy={800} />
      </Layer>
      <Layer>
        <Pigeon x={900} y={1400} s={1.45} f={f} bib={bib} fork={fork} tilt={-10 + fork * 15} />
        <SnailMan x={200} y={1500} s={0.85} hair="spiky" hairColor={C.devinHair} eyes="wide" look={[1, -0.8]} brows="up" mouth="scream" open={0.6} f={f} hide={hide} />
        <Flowers x={470} y={1500} s={0.6} wilt={0.8} />
        <Shock x={370} y={1130} t={lf} />
      </Layer>
    </Shot>
  );
};

/** Schreck-Striche (lokal, damit die Szene keine weitere Abhängigkeit braucht). */
const Shock: React.FC<{ readonly x: number; readonly y: number; readonly t: number }> = ({ x, y, t }) => (
  <g opacity={clamp01(1 - (t % 30) / 30)}>
    {[-40, -10, 20].map((a, k) => (
      <line key={k} x1={x + Math.cos(((a - 90) * Math.PI) / 180) * 120} y1={y + Math.sin(((a - 90) * Math.PI) / 180) * 120} x2={x + Math.cos(((a - 90) * Math.PI) / 180) * 190} y2={y + Math.sin(((a - 90) * Math.PI) / 180) * 190} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    ))}
  </g>
);

/* ================================================================== */
/* door                                                               */
/* ================================================================== */

export const SDoor: React.FC = () => {
  const { f, d, W } = useBeats();
  const bell = W("door", 0.85);
  const { i, lf, len } = useShot([W("slimes", 0.5) - 2], d, f);
  if (i === 0) {
    // Nacht-Straße: Schleimspur die ganze Straße lang, Devin ganz Schnecke, welker Strauß, Mond
    return (
      <Shot cam={push(lf, len, 540, 1100, 0.9, 0.96, 540, 960)}>
        <Layer depth={0.6}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.night} />
          <circle cx={820} cy={360} r={110} fill="#FFF4C2" stroke={INK} strokeWidth={7} />
          {Array.from({ length: 14 }).map((_, k) => (
            <circle key={k} cx={(k * 173) % 1100} cy={150 + ((k * 97) % 500)} r={5} fill="#FFFFFF" opacity={0.5 + 0.5 * Math.sin(f * 0.2 + k)} />
          ))}
          {[-100, 330, 760].map((x, k) => (
            <g key={x}>
              <rect x={x} y={760} width={360} height={720} fill={["#3A3F7A", "#4A3A7A", "#2F4F7A"][k]} stroke={INK} strokeWidth={7} />
              <path d={`M ${x - 30} 780 L ${x + 180} 620 L ${x + 390} 780 Z`} fill="#2A2E5A" stroke={INK} strokeWidth={7} />
              <rect x={x + 60} y={880} width={90} height={90} rx={8} fill={k === 2 ? "#FFE9A8" : "#5A5F9A"} stroke={INK} strokeWidth={5} />
              <rect x={x + 210} y={880} width={90} height={90} rx={8} fill="#5A5F9A" stroke={INK} strokeWidth={5} />
            </g>
          ))}
          <rect x={-2000} y={1480} width={5000} height={2000} fill="#3B3F5A" stroke={INK} strokeWidth={7} />
        </Layer>
        <Layer>
          <Slime x0={-600} x1={650} y={1600} h={34} f={f} />
          <DevinSnail x={700} y={1600} s={0.6} eyes="half" look={[1, 0]} brows="sad" mouth="flat" f={f} />
          <Flowers x={880} y={1600} s={0.55} wilt={1} />
        </Layer>
      </Shot>
    );
  }
  // Nah an der Haustür: ein Stielauge drückt die Klingel
  const press = ease(f, bell - 4, bell + 2) * (1 - ease(f, bell + 6, bell + 12));
  return (
    <Shot cam={push(lf, len, 560, 1000, 1.1, 1.18, 540, 900)}>
      <Layer>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#4A3A7A" />
        <Door x={600} y={1500} open={0} color="#B9473A" />
        <circle cx={880} cy={1060} r={26} fill="#FFD23F" stroke={INK} strokeWidth={6} />
        <rect x={-2000} y={1500} width={5000} height={2000} fill="#3B3F5A" stroke={INK} strokeWidth={7} />
        <rect x={250} y={1490} width={700} height={30} rx={10} fill="#8E5A2E" stroke={INK} strokeWidth={5} />
        <DevinSnail x={620} y={1500} s={0.95} eyes="squint" look={[1, -1]} brows="worried" mouth="flat" f={f} lean={lerp(0, -8, press)} />
        {press > 0.2 ? <Burst x={880} y={1060} r0={40} r1={40 + 70 * press} n={8} o={press} /> : null}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

const Mom: React.FC<Omit<React.ComponentProps<typeof SnailMan>, "hair" | "hairColor">> = (p) => (
  <SnailMan hair="curly" hairColor="#BDBDC9" skin={P.skin} shell={C.mom} shellDark="#7A4ED6" acc={{ cardigan: true, glasses: true }} {...p} />
);
const Dad: React.FC<Omit<React.ComponentProps<typeof SnailMan>, "hair" | "hairColor">> = (p) => (
  <SnailMan hair="none" skin={P.skin2} shell={C.dad} shellDark="#2E6E70" acc={{ tie: true, stache: true }} {...p} />
);
const Maya: React.FC<Omit<React.ComponentProps<typeof SnailMan>, "hair" | "hairColor">> = (p) => (
  <SnailMan hair="bun" hairColor="#2A1B12" skin={P.skin3} shell={C.maya} shellDark={C.mayaDark} {...p} />
);

export const STwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("She's", 0.45) - 2, W("They", 0.75) - 2], d, f);
  if (i === 0) {
    // Tür knarrt auf: Mama- und Papa-Schnecke im warmen Licht, dahinter kalter Braten
    const open = ease(lf, 2, 18);
    return (
      <Shot cam={push(lf, len, 560, 1050, 1.0, 1.08, 540, 900)}>
        <Layer>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#4A3A7A" />
          <rect x={150} y={500} width={820} height={1000} fill="#FFE9A8" stroke={INK} strokeWidth={9} />
          <g opacity={open}>
            <DiningTable y={1180} />
            <Dad x={290} y={1500} s={0.85} eyes="half" look={[1, 0]} brows="neutral" mouth="flat" f={f} />
            <Mom x={800} y={1500} s={0.85} flip eyes="half" look={[-1, 0]} brows="up" mouth="smile" f={f} />
          </g>
          <g transform={`translate(150 0) scale(${1 - open * 0.92} 1)`}>
            <rect x={0} y={500} width={820} height={1000} fill="#B9473A" stroke={INK} strokeWidth={8} />
            <circle cx={720} cy={1000} r={26} fill="#FFD23F" stroke={INK} strokeWidth={5} />
          </g>
          <rect x={-2000} y={1500} width={5000} height={2000} fill="#3B3F5A" stroke={INK} strokeWidth={7} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Freundin Maya als Schnecke auf dem Sofa, das Handy klebt am Stielauge
    return (
      <Shot cam={push(lf, len, 560, 1050, 1.1, 1.18, 540, 880)}>
        <Layer>
          <LivingRoom warm />
          <CouchBack x={540} y={1380} w={980} color="#4FA3A5" />
          <Maya x={420} y={1380} s={1.0} eyes="half" look={[1, -0.6]} brows="neutral" mouth="smug" f={f} />
          <Phone x={420 + 190 + 130} y={1380 - 330 - 170} s={1.1} r={18} />
          <CouchFront x={540} y={1440} w={980} color="#4FA3A5" />
          <Sparkle x={740} y={900} t={lf} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  // Vier Handys nebeneinander, jedes zeigt dieselbe Renn-Blase
  return (
    <Shot cam={push(lf, len, 540, 900, 1.0, 1.06, 540, 900)}>
      <Layer depth={0.5}>
        <ReactBg a={C.bubble} b="#5FA8FF" f={f} cx={540} cy={900} />
      </Layer>
      <Layer>
        {[0, 1, 2, 3].map((k) => {
          const x = 180 + (k % 2) * 720 * 0 + k * 240;
          const y = 900 + (k % 2) * 90;
          const o = ease(lf, k * 5, k * 5 + 8);
          return (
            <g key={k} opacity={o} transform={`translate(${x} ${y}) scale(${0.9 + o * 0.1})`}>
              <rect x={-105} y={-210} width={210} height={420} rx={30} fill={INK} />
              <rect x={-90} y={-190} width={180} height={380} rx={18} fill={["#FFE9A8", "#E9DDFF", "#CFF5F0", "#FFD9EC"][k]} />
              <OmwBubble x={0} y={-10} s={0.5} checks />
            </g>
          );
        })}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* gone                                                               */
/* ================================================================== */

export const SGone: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("What", 0.5) - 2], d, f);
  if (i === 0) {
    // Esszimmer: alle Schnecken um den kalten Braten, erstarrt; Kerzenstummel, Spinnweben am Papa
    return (
      <Shot cam={push(lf, len, 540, 1400, 1.35, 1.45, 540, 860)}>
        <Layer>
          <LivingRoom warm />
          <DiningTable y={1250} />
          <Dad x={90} y={1560} s={0.62} eyes="half" look={[1, 0]} brows="neutral" mouth="flat" f={0} />
          <Web x={20} y={1220} s={0.7} r={0} />
          <Mom x={990} y={1560} s={0.62} flip eyes="half" look={[-1, 0]} brows="up" mouth="smile" f={0} />
          <Maya x={400} y={1560} s={0.5} eyes="open" look={[1, -1]} brows="up" mouth="smug" f={f} acc={{}} />
          <DevinSnail x={700} y={1560} s={0.5} flip eyes="wide" look={[-1, -1]} brows="up" mouth="o" open={0.5} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Devins Gesicht, fassungslos, Stielaugen zittern
  return (
    <Shot cam={push(lf, len, 640, 940, 1.5, 1.62, 540, 820)}>
      <Layer depth={0.5}>
        <ReactBg a={P.red} b="#FF7A86" f={f} cx={600} cy={900} />
      </Layer>
      <Layer>
        <DevinSnail x={450 + Math.sin(f * 1.3) * 4} y={1260} s={1.0} eyes="wide" look={[0, 0]} brows="angry" mouth="scream" open={0.8} f={f * 3} />
        <Burst x={640} y={930} r0={220} r1={220 + 160 * ease(lf, 0, 8)} n={14} o={1 - ease(lf, 8, 20)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* after                                                              */
/* ================================================================== */

export const SAfter: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("The", 0.4) - 2], d, f);
  if (i === 0) {
    // Ring am Stielauge, Maya errötet
    return (
      <Shot cam={push(lf, len, 560, 1000, 1.0, 1.08, 540, 880)}>
        <Layer depth={0.5}>
          <ReactBg a={P.pink} b="#FFB3D9" f={f} cx={540} cy={900} />
        </Layer>
        <Layer>
          <DevinSnail x={130} y={1400} s={0.85} eyes="open" look={[1, 0]} brows="up" mouth="grin" f={f} acc={{ ring: true }} />
          <Maya x={950} y={1400} s={0.85} flip eyes="closed" look={[-1, 0]} brows="up" mouth="smile" blush f={f} />
          {[0, 1, 2].map((k) => (
            <path key={k} transform={`translate(${540 + (k - 1) * 90} ${760 - ((lf * 3 + k * 40) % 200)}) scale(${0.8 + k * 0.1})`} d="M 0 20 C -40 -10 -30 -50 0 -30 C 30 -50 40 -10 0 20 Z" fill={P.red} stroke={INK} strokeWidth={5} />
          ))}
        </Layer>
      </Shot>
    );
  }
  // Leere Kapelle: Stühle, Gäste-Schnecken kriechen herein, Pfarrer-Schnecke noch an der Tür, Kalenderblätter fliegen
  return (
    <Shot cam={push(lf, len, 540, 1050, 0.9, 0.96, 540, 960)}>
      <Layer depth={0.7}>
        <Church wall="#BFE8FF" floor={1450} />
      </Layer>
      <Layer>
        <Pew y={1460} x0={-400} x1={420} />
        <Pew y={1460} x0={660} x1={1500} />
        <rect x={420} y={1450} width={240} height={600} fill={P.red} opacity={0.8} />
        <SnailMan x={380} y={1440} s={0.6} hair="none" skin="#F2C7A5" eyes="closed" look={[0, 0]} brows="neutral" mouth="flat" f={f} acc={{ collar: true }} shell="#5B4F7A" shellDark="#3A3058" />
        <SnailMan x={lerp(-60, 40, ease(lf, 0, len))} y={1760} s={0.72} hair="side" hairColor="#3A2618" skin={P.skin2} eyes="half" look={[1, 0]} brows="neutral" mouth="smile" f={f} shell="#55C46A" shellDark="#2E8A44" />
        <SnailMan x={lerp(1130, 1040, ease(lf, 0, len))} y={1760} s={0.72} flip hair="curly" hairColor="#C98A5E" skin={P.skin} eyes="half" look={[-1, 0]} brows="up" mouth="o" f={f} shell={P.orange} />
        {Array.from({ length: 6 }).map((_, k) => {
          const t = (lf + k * 14) % 80;
          return (
            <g key={k} transform={`translate(${100 + k * 170 + Math.sin(t * 0.1 + k) * 40} ${300 + t * 14}) rotate(${t * 6 + k * 30})`} opacity={1 - t / 80}>
              <rect x={-50} y={-60} width={100} height={120} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
              <rect x={-50} y={-60} width={100} height={30} fill={P.red} stroke={INK} strokeWidth={5} />
            </g>
          );
        })}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const SOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const slimy = W("slimy", 0.8);
  const { i, lf, len } = useShot([W("Why's", 0.55) - 2], d, f);
  // POV: Hand des Zuschauers hält das Handy, auf dem Bild 1 läuft; oben die eigene, gesendete Renn-Blase
  const drip = i === 1 ? lf : 0;
  const peek = i === 1 ? ease(f, slimy - 4, slimy + 8) : 0;
  return (
    <Shot cam={push(lf, len, 540, 960, 1.0, i === 1 ? 1.06 : 1.03, 540, 960)}>
      <Layer>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2B2440" />
        <rect x={190} y={180} width={700} height={1300} rx={80} fill={INK} />
        <rect x={220} y={220} width={640} height={1220} rx={54} fill="#FFFFFF" />
        <svg x={220} y={220} width={640} height={1220} viewBox="60 260 960 1830" preserveAspectRatio="xMidYMid slice">
          <HookBed lf={(f % 60) + 20} f={f} />
        </svg>
        <g transform="translate(540 330)">
          <OmwBubble x={0} y={0} s={0.8} checks />
        </g>
        <Drips x={230} y={240} w={620} t={drip * 1.4} n={7} len={900} />
        {/* Ärmel + Hand unten, Schneckenhaus schaut heraus */}
        <path d="M -100 2000 L 120 1500 L 420 1560 L 380 2000 Z" fill="#5B6BD6" stroke={INK} strokeWidth={9} />
        <Shell x={240} y={lerp(1900, 1560, peek)} R={130} />
        <PovHand x={560} y={1420} w={0} skin={P.skin} />
        <Stalks hx={240} hy={lerp(1900, 1560, peek) + 60} r={90} k={peek} skin={C.flesh} look={[1, -1]} f={f} wide />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const SCHNECKE_SCENES: Record<string, React.FC> = {
  hook: SHook,
  rules: SRules,
  mayor: SMayor,
  devin: SDevin,
  traffic: STraffic,
  pigeon: SPigeon,
  door: SDoor,
  twist: STwist,
  gone: SGone,
  after: SAfter,
  outro: SOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(SCHNECKE_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Handy-Inhalte sind Symbole. */
export const SCHNECKE_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene: Schlafzimmer, Bett-Schnecke | Sofa, Bus | Rathausplatz, Bürgermeister nah | Bett, Uhr, Handy, Sprung |
 * Straße, Fuß nah | Park, Taube | Nacht-Straße, Haustür | Tür auf, Sofa, vier Handys | Esszimmer, Gesicht nah | Ring, Kapelle |
 * POV-Handy ×2 → nie > 2 gleiche am Stück. */
export const SCHNECKE_SHOT_COUNT: Record<string, number> = {
  hook: 3,
  rules: 3,
  mayor: 2,
  devin: 4,
  traffic: 2,
  pigeon: 2,
  door: 2,
  twist: 3,
  gone: 2,
  after: 2,
  outro: 2,
};
