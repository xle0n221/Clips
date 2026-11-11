import React from "react";
import { blinkAt, followThrough } from "../kit/motion";
import { C } from "./core";

/**
 * YOU als Geist (2D): runder Kopf, hohle Augen, gelbes Halstuch (einziges Signalgelb der Figur).
 * Ursprung = Mitte der Schwanzspitze unten; Kopf-Oberkante bei y ≈ −262 (Skalierung 1).
 * Lebendig: Schweben (Auf/Ab), wellender Saum, versetztes Blinzeln (`blinkSeed`), Halstuch-Zipfel
 * schwingt nach (`followThrough` auf `motion`), Squash über `squash` (z. B. aus `hop`).
 */
export type GhostEyes = "normal" | "wide" | "squint" | "closed" | "side";
export type GhostMouth = "flat" | "smile" | "o" | "frown" | "grin";

export const GHOST_HEAD_TOP = 262;

export const Ghost: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly frame: number;
  /** Körperbewegung als Funktion des Frames (x-Versatz) – treibt das Nachschwingen des Halstuchs */
  readonly motion?: (f: number) => number;
  /** Armwinkel in Grad (0 = hängend, 90 = waagrecht nach außen, 160 = hoch) */
  readonly armL?: number;
  readonly armR?: number;
  readonly eyes?: GhostEyes;
  /** Augen-Pop 1..2 (Pointe) */
  readonly eyePop?: number;
  readonly mouth?: GhostMouth;
  /** zusätzliche Mundöffnung 0..1 */
  readonly talk?: number;
  readonly squash?: number;
  readonly tilt?: number;
  readonly o?: number;
  readonly blinkSeed?: number;
  /** liegend (Sterne-Szene): Figur um 90° gedreht */
  readonly lying?: boolean;
  readonly bob?: boolean;
  readonly flip?: boolean;
}> = ({
  x,
  y,
  s = 1,
  frame,
  motion,
  armL = 18,
  armR = 18,
  eyes = "normal",
  eyePop = 1,
  mouth = "flat",
  talk = 0,
  squash = 1,
  tilt = 0,
  o = 1,
  blinkSeed = 7,
  lying = false,
  bob = true,
  flip = false,
}) => {
  const f = frame;
  const by = bob && !lying ? Math.sin(f * 0.09) * 9 : 0;
  const sway = Math.sin(f * 0.07) * 2.2;
  const sig = (k: number) => (motion ? motion(k) : 0) + Math.sin(k * 0.09) * 6;
  const scarfSwing = followThrough(sig, f, { gain: 1.6 }) * 0.9 + Math.sin(f * 0.11) * 5;
  const blink = blinkAt(f, blinkSeed) || eyes === "closed";
  const w = Math.sin(f * 0.25);
  const hem = (k: number) => Math.sin(f * 0.22 + k) * 7;
  const sxq = 1 / Math.sqrt(Math.max(0.3, squash));
  const body = `M -92 -170 A 92 92 0 0 1 92 -170 L 84 -48 Q 80 ${-6 + hem(0)} 56 ${-14 + hem(1)} Q 38 ${-26 + hem(2)} 20 ${2 + hem(3)} Q 0 ${-24 + hem(4)} -20 ${2 + hem(5)} Q -38 ${-26 + hem(6)} -56 ${-14 + hem(7)} Q -80 ${-6 + hem(8)} -84 -48 Z`;
  const arm = (side: -1 | 1, ang: number) => (
    <g transform={`translate(${side * 78} -104) rotate(${side * -ang})`}>
      <path
        d={`M 0 0 Q ${side * 18} 34 ${side * 10} 64 Q ${side * -4} 76 ${side * -12} 60 Q ${side * -6} 30 ${side * -16} 6 Z`}
        fill={C.ghost}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </g>
  );
  const eyeRy = blink ? 3 : eyes === "squint" ? 7 : eyes === "wide" ? 30 : 23;
  const eyeRx = eyes === "wide" ? 20 : 16;
  const eye = (ex: number) => (
    <g transform={`translate(${ex + (eyes === "side" ? 12 : 0)} -186) scale(${eyePop})`}>
      <ellipse rx={eyeRx} ry={eyeRy} fill={C.ink} />
      {!blink && eyeRy > 8 ? <circle cx={-5} cy={-eyeRy * 0.45} r={5} fill={C.white} opacity={0.85} /> : null}
    </g>
  );
  const open = Math.max(talk, mouth === "o" ? 0.8 : 0);
  const mouthEl =
    open > 0.12 ? (
      <ellipse cx={0} cy={-132} rx={11 + open * 3} ry={4 + open * 13} fill={C.ink} />
    ) : mouth === "smile" ? (
      <path d="M -20 -136 Q 0 -118 20 -136" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    ) : mouth === "grin" ? (
      <path d="M -26 -138 Q 0 -110 26 -138 Z" fill={C.ink} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    ) : mouth === "frown" ? (
      <path d="M -18 -124 Q 0 -140 18 -124" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    ) : (
      <path d="M -14 -130 L 14 -130" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
    );
  return (
    <g
      transform={`translate(${x} ${y + by}) rotate(${(lying ? -90 : 0) + tilt + sway * 0.4}) scale(${s * sxq * (flip ? -1 : 1)} ${s * squash})`}
      opacity={o}
    >
      {/* weicher Schein (Verlauf statt Filter: billig im CPU-Render) */}
      <defs>
        <radialGradient id="ghost-glow">
          <stop offset="0" stopColor={C.ghost} stopOpacity="0.38" />
          <stop offset="1" stopColor={C.ghost} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ghost-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.ghost} />
          <stop offset="1" stopColor={C.ghostShade} />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={-130} rx={190} ry={210} fill="url(#ghost-glow)" />
      {arm(-1, armL + w * 3)}
      {arm(1, armR - w * 3)}
      <path d={body} fill="url(#ghost-body)" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" opacity={0.96} />
      {/* Wange/Glanz */}
      <ellipse cx={-48} cy={-226} rx={16} ry={26} fill={C.white} opacity={0.5} transform="rotate(28 -48 -226)" />
      {eye(-34)}
      {eye(34)}
      {mouthEl}
      {/* Halstuch: Band + nachschwingender Zipfel */}
      <g transform={`translate(44 -88) rotate(${18 + scarfSwing})`}>
        <path d="M -8 0 L 16 0 L 22 74 Q 10 84 -2 74 Z" fill={C.scarfDark} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
      <path
        d="M -86 -104 Q 0 -78 86 -104 L 84 -76 Q 0 -50 -84 -76 Z"
        fill={C.scarf}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <circle cx={46} cy={-82} r={13} fill={C.scarf} stroke={C.ink} strokeWidth={5} />
    </g>
  );
};
