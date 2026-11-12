import React from "react";
import { blinkAt } from "../kit/motion";
import { FONT, seeded } from "./core";

/**
 * Sticker-/Paper-Cut-Bausteine „Luxus-Satire“ (zuerst: Rolls-Royce-Clip, scenes/rolls*.tsx).
 * Sticker-Look = weiße Ausschnitt-Kante + harter Papierschatten (`LuxDefs` → filter `sticker`).
 * Alle Autos sind EIGENE stilisierte Formen in Seitenansicht: kein Emblem, kein Kühlergrill-Nachbau,
 * keine Kühlerfigur (Markenrecht) – Modellnamen nur als neutrales Text-Etikett (`Tag`).
 * Ursprung Figur = Fußpunkt (s = 1 ≈ 600 px hoch); Ursprung Auto = Mitte am Boden (s = 1 ≈ 920 px lang).
 */

export const LUX = {
  ink: "#16121C",
  white: "#FFFFFF",
  paper: "#FFF8EA",
  lime: "#A6E22E",
  limeDark: "#76A818",
  denim: "#3E5A8C",
  denimDark: "#2D4470",
  skin: "#F1C39B",
  skinShade: "#D99E74",
  hair: "#3A2418",
  gold: "#F2C14E",
  goldDark: "#C28E25",
  champagne: "#F6E3B4",
  red: "#E8434B",
  plum: "#3A2142",
  cream: "#EFE2C8",
  leather: "#B0763F",
  leatherDark: "#875628",
  wood: "#7A4A2A",
  silver: "#C9CED8",
  chrome: "#E9EDF3",
  glass: "#2B3550",
  tire: "#1C1A20",
  green: "#3BB273",
  money: "#8CC084",
} as const;

/** Filter: `sticker` (weiße Kante + Schatten), `paper`/`paperSoft` (nur Schatten), `glitch` (Rot-Versatz). */
export const LuxDefs: React.FC<{ readonly edge?: number }> = ({ edge = 7 }) => (
  <defs>
    <filter id="sticker" x="-15%" y="-15%" width="130%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={edge} result="grow" />
      <feFlood floodColor="#FFFFFF" result="white" />
      <feComposite in="white" in2="grow" operator="in" result="edge" />
      <feOffset in="grow" dx="8" dy="11" result="off" />
      <feFlood floodColor="#000" floodOpacity="0.32" result="black" />
      <feComposite in="black" in2="off" operator="in" result="shadow" />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="edge" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="paper" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="7" dy="9" stdDeviation="0" floodColor="#000" floodOpacity={0.3} />
    </filter>
    <filter id="paperSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="6" stdDeviation="0" floodColor="#000" floodOpacity={0.25} />
    </filter>
    <radialGradient id="luxGlow">
      <stop offset="0" stopColor="#FFE9B0" stopOpacity="0.75" />
      <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* YOU – Hauptfigur (limettengrüner Hoodie = exklusives Merkmal)        */
/* ------------------------------------------------------------------ */

export type DudeEyes = "open" | "wide" | "half" | "closed" | "up" | "side" | "down";
export type DudeMouth = "smile" | "grin" | "o" | "flat" | "frown" | "smirk";
export type Hold = "none" | "noodles" | "glass" | "tea" | "pretzel" | "pistol" | "wallet" | "calc";
/** Arm: [Oberarm, Unterarm] in Grad ab „hängt senkrecht“, positiv = vom Körper weg / nach oben. */
export type LuxArm = readonly [number, number];

const UPPER = 118;
const FORE = 108;

/** Handposition relativ zum Fußpunkt (für Requisiten, die die Szene selbst zeichnet). */
export const handOf = (side: -1 | 1, arm: LuxArm, shY: number) => {
  const sx = side * 92;
  const a1 = (arm[0] * Math.PI) / 180;
  const a2 = ((arm[0] + arm[1]) * Math.PI) / 180;
  const ex = sx + side * Math.sin(a1) * UPPER;
  const ey = shY + Math.cos(a1) * UPPER;
  return { ex, ey, hx: ex + side * Math.sin(a2) * FORE, hy: ey + Math.cos(a2) * FORE };
};
export const dudeShoulder = (sit: boolean) => (sit ? -318 : -398);
export const dudeHead = (sit: boolean) => dudeShoulder(sit) - 112;

export const Dude: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly frame: number;
  readonly pose?: "stand" | "sit";
  /** linker Bildarm / rechter Bildarm */
  readonly armA?: LuxArm;
  readonly armB?: LuxArm;
  readonly holdA?: Hold;
  readonly holdB?: Hold;
  readonly eyes?: DudeEyes;
  readonly mouth?: DudeMouth;
  readonly brows?: "neutral" | "up" | "one" | "sad" | "angry";
  /** Papp-Sonnenbrille 0..1 (fällt von oben ein) */
  readonly shades?: number;
  /** Kopf nicken/neigen in Grad */
  readonly nod?: number;
  /** Kopf in den Nacken 0..1 */
  readonly lookUp?: number;
  readonly blinkSeed?: number;
  readonly squash?: number;
  readonly lean?: number;
  /** Pupillen-Versatz x (−1..1) */
  readonly gaze?: number;
  readonly o?: number;
  /** Fahne „BANG!“ der Startpistole 0..1 */
  readonly bang?: number;
  /** Motten aus dem Portemonnaie 0..1 */
  readonly moths?: number;
  /** Brezel statt Tasse: Tausch-Fortschritt 0..1 (nur Anzeige-Hilfe) */
  readonly hideLegs?: boolean;
}> = ({
  x,
  y,
  s = 1,
  frame,
  pose = "stand",
  armA = [10, 6],
  armB = [10, 6],
  holdA = "none",
  holdB = "none",
  eyes = "open",
  mouth = "smile",
  brows = "neutral",
  shades = 0,
  nod = 0,
  lookUp = 0,
  blinkSeed = 4,
  squash = 1,
  lean = 0,
  gaze = 0,
  o = 1,
  bang = 0,
  moths = 0,
  hideLegs = false,
}) => {
  const ink = LUX.ink;
  const sit = pose === "sit";
  const br = Math.sin(frame * 0.1) * 3;
  const hipY = sit ? -190 : -250;
  const shY = dudeShoulder(sit) + br;
  const headC = shY - 112;
  const hr = 92;
  const blink = blinkAt(frame, blinkSeed) && eyes !== "closed";

  const legs = (side: -1 | 1) => {
    const hx = side * 44;
    if (sit) {
      return (
        <g key={side}>
          {/* Oberschenkel (verkürzt, zum Betrachter) */}
          <rect x={hx - 40} y={hipY - 24} width={80} height={70} rx={34} fill={LUX.denim} stroke={ink} strokeWidth={7} />
          <rect x={hx - 30} y={hipY + 30} width={60} height={138} rx={22} fill={LUX.denim} stroke={ink} strokeWidth={7} />
          <path d={`M ${hx - 44} ${-8} Q ${hx - 44} ${-42} ${hx} ${-42} Q ${hx + 46} ${-42} ${hx + 50} ${-8} Z`} fill={LUX.white} stroke={ink} strokeWidth={7} />
        </g>
      );
    }
    return (
      <g key={side}>
        <rect x={hx - 32} y={hipY - 10} width={64} height={-hipY - 20} rx={24} fill={LUX.denim} stroke={ink} strokeWidth={7} />
        <path d={`M ${hx - 40} ${0} Q ${hx - 40} ${-38} ${hx} ${-40} Q ${hx + side * 64} ${-36} ${hx + side * 66} ${0} Z`} fill={LUX.white} stroke={ink} strokeWidth={7} />
        <path d={`M ${hx - 40} ${-6} L ${hx + side * 64} ${-6}`} stroke={LUX.red} strokeWidth={6} />
      </g>
    );
  };

  const arm = (side: -1 | 1, a: LuxArm, hold: Hold) => {
    const sx = side * 92;
    const { ex, ey, hx, hy } = handOf(side, a, shY);
    return (
      <g key={`arm${side}`}>
        <path d={`M ${sx} ${shY + 10} L ${ex} ${ey} L ${hx} ${hy}`} stroke={ink} strokeWidth={58} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx} ${shY + 10} L ${ex} ${ey} L ${hx} ${hy}`} stroke={LUX.lime} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={hx} cy={hy} r={25} fill={LUX.skin} stroke={ink} strokeWidth={6} />
        <HeldItem kind={hold} x={hx} y={hy} frame={frame} bang={bang} moths={moths} side={side} />
      </g>
    );
  };

  const pupil = (ex: number, ey: number) => {
    const dx = eyes === "side" ? 9 : gaze * 9;
    const dy = eyes === "up" ? -11 : eyes === "down" ? 10 : -lookUp * 10;
    return <circle cx={ex + dx} cy={ey + dy} r={eyes === "wide" ? 8 : 10} fill={ink} />;
  };
  const eye = (side: -1 | 1) => {
    const ex = side * 34;
    const ey = headC - 6;
    if (blink || eyes === "closed") return <path key={side} d={`M ${ex - 16} ${ey} Q ${ex} ${ey + 9} ${ex + 16} ${ey}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const ry = eyes === "wide" ? 27 : eyes === "half" ? 12 : 21;
    return (
      <g key={side}>
        <ellipse cx={ex} cy={ey} rx={eyes === "wide" ? 22 : 18} ry={ry} fill={LUX.white} stroke={ink} strokeWidth={5} />
        {pupil(ex, ey + (eyes === "half" ? 2 : 0))}
        {eyes === "half" ? <path d={`M ${ex - 20} ${ey - 4} L ${ex + 20} ${ey - 4}`} stroke={ink} strokeWidth={7} strokeLinecap="round" /> : null}
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const ex = side * 34;
    const by = headC - 42 - shades * 34 - (brows === "up" ? 14 : brows === "one" && side === 1 ? 18 : 0) - (eyes === "wide" ? 6 : 0);
    const tilt = brows === "sad" ? -side * 8 : brows === "angry" ? side * 9 : 0;
    return <path key={`b${side}`} d={`M ${ex - 20} ${by + tilt} L ${ex + 20} ${by - tilt}`} stroke={LUX.hair} strokeWidth={10} strokeLinecap="round" />;
  };
  const my = headC + 44;
  const mouthEl = (() => {
    switch (mouth) {
      case "grin":
        return <path d={`M -34 ${my - 6} Q 0 ${my + 34} 34 ${my - 6} Z`} fill={LUX.white} stroke={ink} strokeWidth={6} strokeLinejoin="round" />;
      case "o":
        return <ellipse cx={0} cy={my + 4} rx={14} ry={18} fill="#5A1E22" stroke={ink} strokeWidth={6} />;
      case "flat":
        return <path d={`M -20 ${my} L 20 ${my}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />;
      case "frown":
        return <path d={`M -24 ${my + 8} Q 0 ${my - 12} 24 ${my + 8}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
      case "smirk":
        return <path d={`M -22 ${my + 4} Q 6 ${my + 10} 28 ${my - 8}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
      default:
        return <path d={`M -26 ${my - 2} Q 0 ${my + 20} 26 ${my - 2}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
    }
  })();
  const shadeDrop = (1 - shades) * -260;

  return (
    <g transform={`translate(${x} ${y}) scale(${s * (2 - squash)} ${s * squash}) rotate(${lean})`} opacity={o} filter="url(#sticker)">
      {hideLegs ? null : [legs(-1), legs(1)]}
      {/* Hoodie */}
      <path
        d={`M ${-96} ${shY} Q ${-112} ${shY + 6} ${-108} ${shY + 60} L ${-92} ${hipY + 26} Q 0 ${hipY + 44} 92 ${hipY + 26} L 108 ${shY + 60} Q 112 ${shY + 6} 96 ${shY} Q 0 ${shY - 22} -96 ${shY} Z`}
        fill={LUX.lime}
        stroke={ink}
        strokeWidth={7}
      />
      <path d={`M -58 ${hipY - 30} L 58 ${hipY - 30} L 70 ${hipY + 14} L -70 ${hipY + 14} Z`} fill={LUX.limeDark} stroke={ink} strokeWidth={5} />
      <path d={`M ${-92} ${hipY + 18} Q 0 ${hipY + 36} 92 ${hipY + 18}`} stroke={LUX.limeDark} strokeWidth={10} fill="none" />
      {/* Kapuze hinter dem Hals + Kordeln */}
      <path d={`M -70 ${shY - 6} Q 0 ${shY - 40} 70 ${shY - 6} Q 40 ${shY + 30} 0 ${shY + 30} Q -40 ${shY + 30} -70 ${shY - 6} Z`} fill={LUX.limeDark} stroke={ink} strokeWidth={6} />
      <path d={`M -18 ${shY + 22} L -22 ${shY + 92} M 18 ${shY + 22} L 22 ${shY + 92}`} stroke={LUX.white} strokeWidth={7} strokeLinecap="round" />
      <circle cx={-22} cy={shY + 96} r={6} fill={LUX.white} stroke={ink} strokeWidth={3} />
      <circle cx={22} cy={shY + 96} r={6} fill={LUX.white} stroke={ink} strokeWidth={3} />
      {/* Kopf */}
      <g transform={`rotate(${nod} 0 ${shY - 10}) translate(0 ${-lookUp * 10})`}>
        <circle cx={-hr + 4} cy={headC + 6} r={18} fill={LUX.skin} stroke={ink} strokeWidth={6} />
        <circle cx={hr - 4} cy={headC + 6} r={18} fill={LUX.skin} stroke={ink} strokeWidth={6} />
        <ellipse cx={0} cy={headC} rx={hr} ry={hr * (1 - lookUp * 0.06)} fill={LUX.skin} stroke={ink} strokeWidth={7} />
        <path
          d={`M ${-hr + 4} ${headC - 18} Q ${-hr + 2} ${headC - hr - 4} 0 ${headC - hr - 8} Q ${hr - 2} ${headC - hr - 4} ${hr - 4} ${headC - 18} Q ${hr * 0.5} ${headC - 54} ${10} ${headC - 48} L 26 ${headC - 70} L -4 ${headC - 50} Q ${-hr * 0.5} ${headC - 56} ${-hr + 4} ${headC - 18} Z`}
          fill={LUX.hair}
          stroke={ink}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <ellipse cx={-56} cy={headC + 26} rx={14} ry={8} fill="#F09A86" opacity={0.6} />
        <ellipse cx={56} cy={headC + 26} rx={14} ry={8} fill="#F09A86" opacity={0.6} />
        {eye(-1)}
        {eye(1)}
        <path d={`M -4 ${headC + 8} Q 8 ${headC + 22} -6 ${headC + 26}`} stroke={LUX.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
        {mouthEl}
        {shades > 0 ? (
          <g transform={`translate(0 ${headC - 8 + shadeDrop}) rotate(${(1 - shades) * -14})`} opacity={Math.min(1, shades * 3)}>
            {/* Papp-Sonnenbrille (viel zu groß, Pappkante sichtbar) */}
            <path d="M -150 -10 L -112 -16 M 150 -10 L 112 -16" stroke="#B88A55" strokeWidth={12} strokeLinecap="round" />
            <path d="M -118 -40 L -10 -40 L -18 30 Q -60 52 -106 30 Z" fill="#B88A55" stroke={ink} strokeWidth={6} />
            <path d="M 118 -40 L 10 -40 L 18 30 Q 60 52 106 30 Z" fill="#B88A55" stroke={ink} strokeWidth={6} />
            <path d="M -108 -32 L -20 -32 L -26 22 Q -62 40 -100 22 Z" fill="#111018" />
            <path d="M 108 -32 L 20 -32 L 26 22 Q 62 40 100 22 Z" fill="#111018" />
            <path d="M -96 -24 L -66 -24 L -88 10 Z M 32 -24 L 62 -24 L 40 10 Z" fill="#FFFFFF" opacity={0.35} />
            <rect x={-14} y={-38} width={28} height={14} fill="#B88A55" stroke={ink} strokeWidth={5} />
          </g>
        ) : null}
        {[brow(-1), brow(1)]}
      </g>
      {arm(-1, armA, holdA)}
      {arm(1, armB, holdB)}
    </g>
  );
};

/** Requisit in der Hand (immer aufrecht). */
export const HeldItem: React.FC<{
  readonly kind: Hold;
  readonly x: number;
  readonly y: number;
  readonly frame: number;
  readonly bang?: number;
  readonly moths?: number;
  readonly side?: -1 | 1;
}> = ({ kind, x, y, frame, bang = 0, moths = 0, side = 1 }) => {
  const ink = LUX.ink;
  switch (kind) {
    case "noodles":
      return (
        <g transform={`translate(${x} ${y - 30})`}>
          <path d="M -26 -46 Q -8 -84 4 -46 M 6 -46 Q 22 -90 30 -40" stroke="#F5D57A" strokeWidth={7} fill="none" />
          <path d="M 18 -60 L 34 -118" stroke="#C9A06A" strokeWidth={7} strokeLinecap="round" />
          <path d="M -48 -44 L 48 -44 L 36 52 L -36 52 Z" fill={LUX.white} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={-44} y={-18} width={88} height={30} fill={LUX.red} />
          <path d="M -48 -44 L 48 -44 L 36 52 L -36 52 Z" fill="none" stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          <text x={0} y={5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={LUX.white}>
            NOODLES
          </text>
        </g>
      );
    case "glass":
      return (
        <g transform={`translate(${x} ${y - 20})`}>
          <path d="M -20 -100 L 20 -100 L 14 -30 Q 0 -18 -14 -30 Z" fill={LUX.champagne} stroke={ink} strokeWidth={5} />
          <path d="M -16 -82 L 16 -82" stroke={LUX.gold} strokeWidth={5} />
          <circle cx={-4} cy={-60} r={3} fill={LUX.white} />
          <circle cx={5} cy={-46} r={2.5} fill={LUX.white} />
          <path d="M 0 -22 L 0 24 M -20 26 L 20 26" stroke={ink} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "tea":
      return (
        <g transform={`translate(${x} ${y - 14})`}>
          <path d="M -40 -8 Q 0 10 40 -8" stroke={ink} strokeWidth={6} fill={LUX.white} />
          <path d="M -30 -56 L 30 -56 Q 28 -14 0 -12 Q -28 -14 -30 -56 Z" fill={LUX.white} stroke={ink} strokeWidth={6} />
          <path d="M 28 -48 Q 50 -46 44 -30 Q 38 -22 26 -26" stroke={ink} strokeWidth={6} fill="none" />
          <path d="M -24 -50 L 24 -50" stroke="#9B5B3A" strokeWidth={6} />
          <path d={`M -6 -66 Q ${-14 + Math.sin(frame * 0.2) * 6} -86 -4 -104 M 10 -66 Q ${2 + Math.sin(frame * 0.2 + 1) * 6} -88 12 -108`} stroke={LUX.white} strokeWidth={5} fill="none" opacity={0.8} strokeLinecap="round" />
        </g>
      );
    case "pretzel":
      return (
        <g transform={`translate(${x} ${y - 46}) rotate(${side * -8})`}>
          <path
            d="M 0 34 Q -62 -10 -44 -46 Q -24 -76 0 -36 Q 24 -76 44 -46 Q 62 -10 0 34 M -40 24 Q 0 -22 40 24"
            stroke="#8A4B1E"
            strokeWidth={22}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 0 34 Q -62 -10 -44 -46 Q -24 -76 0 -36 Q 24 -76 44 -46 Q 62 -10 0 34 M -40 24 Q 0 -22 40 24" stroke="#C47A3A" strokeWidth={13} fill="none" strokeLinecap="round" />
          {[-30, -6, 20, 34].map((px, i) => (
            <rect key={px} x={px} y={-40 + i * 14} width={6} height={4} fill={LUX.white} />
          ))}
        </g>
      );
    case "pistol":
      return (
        <g transform={`translate(${x} ${y}) scale(${side} 1)`}>
          <path d="M -14 -6 L -14 -46 L 70 -46 L 70 -22 L 14 -22 L 14 26 L -14 26 Z" fill="#D9DDE6" stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          <rect x={60} y={-56} width={12} height={12} fill={LUX.red} stroke={ink} strokeWidth={4} />
          {bang > 0 ? (
            <g transform={`translate(${72} ${-34}) scale(${bang})`}>
              <path d="M 0 0 L 30 0" stroke={ink} strokeWidth={5} />
              <rect x={30} y={-32} width={130} height={60} rx={6} fill={LUX.white} stroke={ink} strokeWidth={5} />
              <text x={95} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={LUX.red} transform={side < 0 ? "translate(190 0) scale(-1 1)" : undefined}>
                GO!
              </text>
            </g>
          ) : null}
        </g>
      );
    case "wallet":
      return (
        <g transform={`translate(${x} ${y - 20})`}>
          <path d="M -60 -40 L 0 -30 L 60 -40 L 60 30 L 0 40 L -60 30 Z" fill="#5B3A22" stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 0 -30 L 0 40" stroke={ink} strokeWidth={5} />
          <path d="M -50 -26 L -8 -20 L -8 24 L -50 18 Z" fill="#3E2716" />
          {moths > 0
            ? [0, 1, 2].map((i) => {
                const t = moths * (1 + i * 0.25);
                const mx = (i - 1) * 40 + Math.sin(frame * 0.5 + i * 2) * 16;
                const myy = -40 - t * 140 - i * 20;
                const flap = Math.abs(Math.sin(frame * 0.9 + i));
                return (
                  <g key={i} transform={`translate(${mx} ${myy})`}>
                    <ellipse cx={-10} cy={0} rx={14} ry={10 * flap + 2} fill="#D8CDB8" stroke={ink} strokeWidth={3} />
                    <ellipse cx={10} cy={0} rx={14} ry={10 * flap + 2} fill="#D8CDB8" stroke={ink} strokeWidth={3} />
                    <ellipse cx={0} cy={0} rx={4} ry={9} fill={ink} />
                  </g>
                );
              })
            : null}
        </g>
      );
    case "calc":
      return (
        <g transform={`translate(${x} ${y - 30})`}>
          <rect x={-46} y={-66} width={92} height={124} rx={12} fill="#4A5160" stroke={ink} strokeWidth={6} />
          <rect x={-34} y={-54} width={68} height={28} rx={4} fill="#B9D7A6" />
          <text x={28} y={-32} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={20} fill={ink}>
            ERROR
          </text>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-32 + c * 24} y={-16 + r * 22} width={18} height={16} rx={3} fill="#E9EDF3" />),
          )}
        </g>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Autos (eigene Formen, Seitenansicht, Front zeigt nach rechts)         */
/* ------------------------------------------------------------------ */

export type CarKind = "sedan" | "suv" | "coupe" | "sweptail";

const BODY: Record<CarKind, { body: string; glass: string; pillar: number; wr: number; wx: readonly [number, number]; belt: number }> = {
  // lange Haube, aufrechte (aber ungegliederte) Front, kurzes Heck
  sedan: {
    body: "M -460 -48 L -462 -170 Q -458 -196 -430 -200 L -330 -206 Q -300 -212 -262 -300 Q -250 -318 -220 -318 L 10 -318 Q 40 -318 60 -296 L 150 -210 L 430 -196 Q 462 -192 466 -160 L 470 -60 Q 470 -40 450 -40 L -440 -40 Q -460 -40 -460 -48 Z",
    glass: "M -300 -212 Q -270 -296 -230 -300 L 0 -300 Q 30 -300 48 -282 L 116 -214 Z",
    pillar: -96,
    wr: 74,
    wx: [-292, 300],
    belt: -206,
  },
  suv: {
    body: "M -462 -56 L -466 -330 Q -462 -372 -420 -374 L 30 -378 Q 70 -378 92 -352 L 170 -250 L 432 -236 Q 466 -230 468 -196 L 472 -64 Q 472 -44 450 -44 L -440 -44 Q -462 -44 -462 -56 Z",
    glass: "M -440 -250 L -440 -336 Q -436 -356 -414 -356 L 24 -360 Q 54 -360 72 -340 L 140 -252 Z",
    pillar: -150,
    wr: 86,
    wx: [-292, 300],
    belt: -250,
  },
  coupe: {
    body: "M -462 -48 L -464 -150 Q -460 -176 -420 -184 Q -300 -220 -170 -294 Q -146 -306 -110 -306 L 6 -306 Q 40 -306 64 -284 L 160 -200 L 430 -186 Q 462 -182 466 -150 L 470 -58 Q 470 -40 450 -40 L -440 -40 Q -462 -40 -462 -48 Z",
    glass: "M -330 -200 Q -230 -250 -160 -286 Q -140 -294 -110 -292 L 0 -292 Q 30 -292 50 -274 L 126 -204 Z",
    pillar: -60,
    wr: 74,
    wx: [-292, 300],
    belt: -200,
  },
  sweptail: {
    body: "M -520 -64 Q -540 -120 -500 -150 Q -360 -240 -150 -300 Q -120 -308 -90 -308 L 10 -306 Q 44 -304 66 -284 L 162 -200 L 430 -186 Q 462 -182 466 -150 L 470 -58 Q 470 -40 450 -40 L -470 -40 Q -510 -42 -520 -64 Z",
    glass: "M -420 -178 Q -280 -250 -140 -288 Q -114 -294 -90 -294 L 0 -292 Q 30 -290 50 -272 L 126 -204 Z",
    pillar: -40,
    wr: 74,
    wx: [-300, 300],
    belt: -196,
  },
};

/** Eigene stilisierte Luxuslimousine (kein Emblem, kein Grill, keine Kühlerfigur). */
export const LuxCar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly kind?: CarKind;
  readonly body?: string;
  readonly top?: string;
  readonly flip?: boolean;
  readonly spin?: number;
  /** Glanzstreifen 0..1 (wandert über die Karosse) */
  readonly glint?: number;
  /** Heckklappe (nur suv) 0..1 */
  readonly hatch?: number;
  /** Fahrer im Fenster (Kopf in Hoodie-Grün, Sonnenbrille) */
  readonly driver?: boolean;
  readonly o?: number;
  /** Turntable-Drehung: Breite −1..1 (cos) */
  readonly turn?: number;
  readonly sticker?: boolean;
}> = ({ x, y, s = 1, kind = "sedan", body = "#2D2A4A", top = "#C9CED8", flip = false, spin = 0, glint = -1, hatch = 0, driver = false, o = 1, turn = 1, sticker = true }) => {
  const ink = LUX.ink;
  const b = BODY[kind];
  const sx = (flip ? -1 : 1) * s * (Math.abs(turn) < 0.06 ? 0.06 * Math.sign(turn || 1) : turn);
  const wheel = (wx: number) => (
    <g key={wx} transform={`translate(${wx} ${-b.wr + 8})`}>
      <circle r={b.wr + 4} fill={ink} />
      <circle r={b.wr} fill={LUX.tire} />
      <circle r={b.wr * 0.58} fill={LUX.chrome} stroke={ink} strokeWidth={5} />
      <g transform={`rotate(${spin})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={`M 0 0 L 0 ${-b.wr * 0.5}`} transform={`rotate(${a})`} stroke={LUX.silver} strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
      <circle r={b.wr * 0.16} fill={LUX.silver} stroke={ink} strokeWidth={4} />
    </g>
  );
  const clipId = `carclip-${kind}`;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <ellipse cx={0} cy={4} rx={500 * s} ry={26 * s} fill="#000" opacity={0.22} />
      <g transform={`scale(${sx} ${s})`} filter={sticker ? "url(#sticker)" : undefined}>
        <defs>
          <clipPath id={clipId}>
            <path d={b.body} />
          </clipPath>
        </defs>
        {/* Radkästen */}
        {b.wx.map((wx) => (
          <circle key={`arch${wx}`} cx={wx} cy={-b.wr + 8} r={b.wr + 18} fill={ink} />
        ))}
        <path d={b.body} fill={body} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
        {/* Zweifarbig: obere Hälfte */}
        <g clipPath={`url(#${clipId})`}>
          <rect x={-600} y={-420} width={1200} height={420 + b.belt + 26} fill={top} />
          <path d={`M -600 ${b.belt + 26} L 600 ${b.belt + 26}`} stroke={ink} strokeWidth={6} />
          <path d={`M -600 ${b.belt + 60} L 600 ${b.belt + 50}`} stroke={LUX.gold} strokeWidth={5} opacity={0.9} />
          {glint >= 0 && glint <= 1 ? (
            <path d={`M ${-700 + glint * 1400} -420 l 90 0 l -160 420 l -90 0 Z`} fill="#FFFFFF" opacity={0.35} />
          ) : null}
        </g>
        <path d={b.glass} fill={LUX.glass} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${b.pillar} ${b.belt - 120} L ${b.pillar} ${b.belt + 10}`} stroke={ink} strokeWidth={14} />
        {driver ? (
          <g transform={`translate(${b.pillar + 110} ${b.belt - 40})`}>
            <path d="M -60 40 Q -60 -10 0 -12 Q 60 -10 60 40 Z" fill={LUX.lime} stroke={ink} strokeWidth={5} />
            <circle cx={0} cy={-46} r={38} fill={LUX.skin} stroke={ink} strokeWidth={5} />
            <path d="M -38 -56 Q -36 -92 0 -92 Q 36 -92 38 -56 Q 10 -76 -38 -56 Z" fill={LUX.hair} />
            <rect x={-40} y={-58} width={80} height={24} rx={8} fill="#111018" stroke="#B88A55" strokeWidth={5} />
          </g>
        ) : null}
        <path d={b.glass} fill="#FFFFFF" opacity={0.08} />
        {/* Türfuge + Griff */}
        <path d={`M ${b.pillar} ${b.belt + 26} L ${b.pillar} -60`} stroke={ink} strokeWidth={4} opacity={0.6} />
        <rect x={b.pillar + 30} y={b.belt + 44} width={46} height={10} rx={5} fill={LUX.chrome} stroke={ink} strokeWidth={3} />
        {/* Front: schlichte Leuchte + Stoßfänger (keine Grill-Form) */}
        <rect x={420} y={b.belt + 34} width={40} height={22} rx={8} fill="#FFF3C4" stroke={ink} strokeWidth={4} />
        <rect x={-466} y={b.belt + 40} width={22} height={26} rx={6} fill={LUX.red} stroke={ink} strokeWidth={4} />
        <path d="M 380 -54 L 470 -54 M -460 -54 L -380 -54" stroke={LUX.chrome} strokeWidth={8} strokeLinecap="round" />
        {kind === "suv" && hatch > 0 ? (
          <g transform={`rotate(${hatch * 70} -462 -360)`}>
            <path d="M -462 -360 L -462 -230 L -440 -230 L -440 -350 Z" fill={top} stroke={ink} strokeWidth={6} />
          </g>
        ) : null}
        {b.wx.map(wheel)}
      </g>
    </g>
  );
};

/** Geöffneter Gepäckraum der SUV (dunkles Loch am Heck, mit Glas-Trennscheibe). */
export const TrunkHole: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o: number; readonly sparkle?: number }> = ({ x, y, s = 1, o, sparkle = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -462 -350 L -330 -350 L -330 -60 L -462 -60 Z" fill="#1A1420" stroke={LUX.ink} strokeWidth={6} />
    <rect x={-348} y={-336} width={12} height={270} fill="#BFE6FF" opacity={0.7} />
    {sparkle > 0 ? <Sparkle x={-342} y={-260} s={sparkle} /> : null}
  </g>
);

export const Sparkle: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly color?: string }> = ({ x, y, s = 1, color = "#FFFFFF" }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M 0 -40 Q 6 -6 40 0 Q 6 6 0 40 Q -6 6 -40 0 Q -6 -6 0 -40 Z"
    fill={color}
    stroke={LUX.ink}
    strokeWidth={4}
  />
);

/** Abstraktes Stoffband auf neutralem Sockel (KEINE Figur, keine Pose). `flutter` 0..1 = Wind. */
export const RibbonOrnament: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly frame: number; readonly flutter: number }> = ({
  x,
  y,
  s = 1,
  frame,
  flutter,
}) => {
  const w = (k: number) => Math.sin(frame * 0.35 + k) * (10 + flutter * 26);
  const len = 120 + flutter * 90;
  const band = (dy: number, k: number, c: string) => (
    <path
      d={`M 0 ${dy} C ${-len * 0.3} ${dy - 30 + w(k)} ${-len * 0.6} ${dy + 20 - w(k + 1)} ${-len} ${dy - 10 + w(k + 2)} L ${-len + 6} ${dy + 24 + w(k + 2)} C ${-len * 0.6} ${dy + 46 - w(k + 1)} ${-len * 0.3} ${dy + 6 + w(k)} 0 ${dy + 30} Z`}
      fill={c}
      stroke={LUX.ink}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
      <rect x={-34} y={-20} width={68} height={22} rx={6} fill={LUX.chrome} stroke={LUX.ink} strokeWidth={5} />
      <rect x={-10} y={-84} width={20} height={66} rx={8} fill={LUX.chrome} stroke={LUX.ink} strokeWidth={5} />
      <g transform="translate(0 -84)">
        {band(-30, 0, "#F4F6FA")}
        {band(4, 1.7, "#DCE2EC")}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Text-Requisiten (eigene Layouts)                                     */
/* ------------------------------------------------------------------ */

/** Häkchen als Geometrie (Schrift hat kein ✓). */
export const Check: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly color?: string; readonly t?: number }> = ({ x, y, s = 1, color = LUX.green, t = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M -30 0 L -8 22 L 34 -26"
    stroke={color}
    strokeWidth={16}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - t}
  />
);

/** Karte mit Text (Papier, Sticker-Kante). */
export const Card: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly s?: number;
  readonly r?: number;
  readonly fill?: string;
  readonly lines?: readonly string[];
  readonly size?: number;
  readonly fg?: string;
  readonly children?: React.ReactNode;
  readonly o?: number;
}> = ({ x, y, w, h, s = 1, r = 0, fill = LUX.paper, lines = [], size = 54, fg = LUX.ink, children, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)" opacity={o}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={fill} stroke={LUX.ink} strokeWidth={7} />
    {lines.map((l, i) => (
      <text
        key={l}
        x={0}
        y={-((lines.length - 1) * size * 1.12) / 2 + i * size * 1.12 + size * 0.36}
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight={900}
        fontSize={size}
        fill={fg}
      >
        {l}
      </text>
    ))}
    {children}
  </g>
);

/** Gummistempel-Abdruck (schräg, rot) – `t` 0..1 schlägt ein (groß → passend). */
export const Stamp: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly t: number; readonly r?: number; readonly color?: string; readonly size?: number; readonly w?: number }> = ({
  x,
  y,
  text,
  t,
  r = -10,
  color = LUX.red,
  size = 58,
  w,
}) => {
  if (t <= 0) return null;
  const k = 1 + (1 - Math.min(1, t)) * 1.6;
  const width = w ?? text.length * size * 0.72 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`} opacity={Math.min(1, t * 2)}>
      <rect x={-width / 2} y={-size * 0.95} width={width} height={size * 1.6} rx={12} fill="none" stroke={color} strokeWidth={10} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

/** Hängendes Etikett (Modellname als neutraler Text). */
export const Tag: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly s?: number; readonly r?: number; readonly color?: string }> = ({
  x,
  y,
  text,
  s = 1,
  r = -4,
  color = LUX.paper,
}) => {
  const w = text.length * 30 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
      <path d={`M ${-w / 2} -34 L ${w / 2 - 26} -34 L ${w / 2} 0 L ${w / 2 - 26} 34 L ${-w / 2} 34 Z`} fill={color} stroke={LUX.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={w / 2 - 30} cy={0} r={8} fill="none" stroke={LUX.ink} strokeWidth={4} />
      <text x={-12} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={LUX.ink} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

/** Papier-Geldschein ohne Währungsbild. */
export const Cash: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number; readonly flip?: number }> = ({ x, y, r = 0, s = 1, flip = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s} ${s * flip})`}>
    <rect x={-64} y={-32} width={128} height={64} rx={6} fill={LUX.money} stroke={LUX.ink} strokeWidth={5} />
    <rect x={-52} y={-21} width={104} height={42} rx={4} fill="none" stroke="#5E9159" strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={15} ry={17} fill="#6FA567" />
  </g>
);

/** Selbst gezeichneter Zickzack-Pfeil nach oben (Stonks-Pfeil, eigene Grafik). `t` 0..1 wächst. */
export const ZigzagArrow: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number; readonly color?: string }> = ({ x, y, s = 1, t, color = "#3DDC5A" }) => {
  const pts: [number, number][] = [
    [0, 0],
    [120, -150],
    [200, -90],
    [330, -330],
    [400, -270],
    [560, -620],
  ];
  // Teillänge entlang der Punkte
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, t));
  const shown: [number, number][] = [pts[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const k = Math.min(1, left / segs[i]);
    const a = pts[i];
    const b = pts[i + 1];
    shown.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    left -= segs[i];
  }
  const tip = shown[shown.length - 1];
  const prev = shown[Math.max(0, shown.length - 2)];
  const ang = (Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) * 180) / Math.PI;
  const d = shown.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
      <path d={d} stroke={LUX.ink} strokeWidth={58} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={42} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {t > 0.02 ? (
        <path transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang})`} d="M 70 0 L -20 -62 L -20 62 Z" fill={color} stroke={LUX.ink} strokeWidth={8} strokeLinejoin="round" />
      ) : null}
    </g>
  );
};

/** Sprech-/Gedankenblase (eigene Form). `pop` 0..1 platzt (Fetzen fliegen). */
export const ThoughtBubble: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly o?: number;
  readonly burst?: number;
  readonly tailX?: number;
  readonly tailY?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, s = 1, o = 1, burst = 0, tailX = -160, tailY = 300, children }) => {
  if (burst >= 1) return null;
  if (burst > 0) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - burst}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const r = 120 + burst * 260;
          return <path key={i} transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r * 0.7}) rotate(${i * 37 + burst * 200})`} d="M -26 -14 L 30 -8 L 18 18 L -22 12 Z" fill={LUX.white} stroke={LUX.ink} strokeWidth={4} />;
        })}
        <path d="M -60 0 L 60 0 M 0 -60 L 0 60 M -42 -42 L 42 42 M 42 -42 L -42 42" stroke={LUX.ink} strokeWidth={8} strokeLinecap="round" transform={`scale(${0.6 + burst})`} />
      </g>
    );
  }
  const puffs = [
    [-210, -10, 110],
    [-110, -110, 120],
    [40, -130, 130],
    [180, -60, 110],
    [190, 70, 100],
    [60, 130, 115],
    [-100, 120, 110],
    [-220, 80, 90],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} filter="url(#sticker)">
      <circle cx={tailX * 0.55} cy={tailY * 0.55} r={26} fill={LUX.white} stroke={LUX.ink} strokeWidth={6} />
      <circle cx={tailX * 0.85} cy={tailY * 0.85} r={16} fill={LUX.white} stroke={LUX.ink} strokeWidth={5} />
      {puffs.map(([px, py, r]) => (
        <circle key={`${px}${py}`} cx={px} cy={py} r={r} fill={LUX.ink} />
      ))}
      {puffs.map(([px, py, r]) => (
        <circle key={`w${px}${py}`} cx={px} cy={py} r={r - 7} fill={LUX.white} />
      ))}
      <ellipse cx={0} cy={0} rx={250} ry={150} fill={LUX.white} />
      {children}
    </g>
  );
};

/** Sterne-Dachhimmel: viele Lichtpunkte (keine zählbare Zahl), funkeln deterministisch. */
export const StarField: React.FC<{ readonly x0: number; readonly y0: number; readonly w: number; readonly h: number; readonly n?: number; readonly frame: number; readonly on?: number; readonly seed?: number }> = ({
  x0,
  y0,
  w,
  h,
  n = 260,
  frame,
  on = 1,
  seed = 7,
}) => {
  const rnd = seeded(seed);
  const pts = Array.from({ length: n }, () => [rnd(), rnd(), rnd(), rnd()] as const);
  return (
    <g>
      {pts.map(([a, b, c, d], i) => {
        const appear = Math.max(0, Math.min(1, on * 1.6 - c * 0.6));
        if (appear <= 0) return null;
        const tw = 0.55 + 0.45 * Math.sin(frame * (0.08 + d * 0.12) + i);
        const r = 2 + d * 4.5;
        return <circle key={i} cx={x0 + a * w} cy={y0 + b * h} r={r} fill="#FFF7DA" opacity={appear * tw} />;
      })}
    </g>
  );
};

/** Kalenderblatt (fliegt). */
export const CalendarPage: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number; readonly label: string }> = ({ x, y, r = 0, s = 1, label }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-70} y={-80} width={140} height={160} rx={10} fill={LUX.white} stroke={LUX.ink} strokeWidth={5} />
    <rect x={-70} y={-80} width={140} height={44} rx={10} fill={LUX.red} stroke={LUX.ink} strokeWidth={5} />
    <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={LUX.ink}>
      {label}
    </text>
  </g>
);

/** Zapfsäule (generisch), Münzschlitz frisst Münzen (`eat` 0..1 je Münze im Takt). */
export const GasPump: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly frame: number; readonly eat: number }> = ({ x, y, s = 1, frame, eat }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#sticker)">
      <rect x={-110} y={-520} width={220} height={520} rx={22} fill={LUX.red} stroke={LUX.ink} strokeWidth={8} />
      <rect x={-80} y={-470} width={160} height={110} rx={10} fill="#1E2430" stroke={LUX.ink} strokeWidth={6} />
      <text x={0} y={-400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#7CFF7A">
        {`$${Math.round(eat * 9999).toLocaleString("en-US")}`}
      </text>
      {/* Mund = Münzschlitz */}
      <path d={`M -60 -280 Q 0 ${-280 + 40 * Math.abs(Math.sin(frame * 0.5))} 60 -280 Q 0 -250 -60 -280 Z`} fill="#1A0E10" stroke={LUX.ink} strokeWidth={6} />
      <circle cx={-40} cy={-320} r={12} fill={LUX.white} stroke={LUX.ink} strokeWidth={4} />
      <circle cx={40} cy={-320} r={12} fill={LUX.white} stroke={LUX.ink} strokeWidth={4} />
      <path d="M 110 -380 Q 180 -380 180 -260 L 180 -120" stroke={LUX.ink} strokeWidth={14} fill="none" />
      <rect x={160} y={-140} width={40} height={70} rx={8} fill="#2A2A2A" stroke={LUX.ink} strokeWidth={5} />
    </g>
    {Array.from({ length: 6 }, (_, i) => {
      const t = ((eat * 6 - i) % 1 + 1) % 1;
      if (eat * 6 < i) return null;
      const cx = -220 + t * 220;
      const cy = -460 + t * 190 - Math.sin(t * Math.PI) * 120;
      return t < 0.98 ? <ellipse key={i} cx={cx} cy={cy} rx={26} ry={26 * Math.abs(Math.cos(t * 9))} fill={LUX.gold} stroke={LUX.ink} strokeWidth={5} /> : null;
    })}
  </g>
);

/** Umriss eines Familien-Kombis mit Holzdekor (gestrichelt, legt sich über die SUV). */
export const WagonOutline: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, t * 1.5)}>
    <path
      d="M -470 -50 L -470 -290 Q -466 -310 -440 -310 L 60 -310 L 170 -210 L 440 -196 Q 470 -192 472 -160 L 474 -56 L -470 -50 Z"
      fill="#8A5A34"
      fillOpacity={0.55 * t}
      stroke={LUX.white}
      strokeWidth={12}
      strokeDasharray="34 20"
      strokeLinejoin="round"
    />
    {[-380, -260, -140, -20, 100, 220, 340].map((px) => (
      <path key={px} d={`M ${px} -190 L ${px} -70`} stroke="#5E3A1E" strokeWidth={8} opacity={t} />
    ))}
    <path d="M -470 -190 L 470 -180" stroke={LUX.white} strokeWidth={8} opacity={t} />
  </g>
);
