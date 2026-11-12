import React from "react";
import { blinkAt } from "../kit/motion";
import { FONT, seeded } from "./core";

/**
 * Paper-Cut-Bausteine „Boxen / Lebenslauf als Kampf“ (zuerst: Mike-Tyson-Clip, scenes/tyson*.tsx).
 * Alles flach (SVG), Tiefe über versetzten Papierschatten (`PaperDefs` → filter `paper`).
 * Figuren: generische Cartoon-Köpfe ohne Porträtähnlichkeit; Silhouetten (`sil`) ohne Gesicht.
 * Ursprung jeder Figur = Mitte zwischen den Füßen (Fußpunkt), Größe s = 1 ≈ 600 px (Erwachsener).
 */

export const PAPER = {
  ink: "#15100C",
  skin: "#8B5A3C",
  skinShade: "#6E4530",
  hair: "#1B1411",
  trunks: "#131313",
  band: "#2C2C2C",
  shoe: "#0E0E0E",
  towel: "#F4F1EA",
  towelShade: "#D3CEC2",
  shirt: "#8E959E",
  pants: "#33405A",
  glove: "#7A2E26",
  gold: "#E8B64C",
  goldDark: "#B3832A",
  paper: "#F3EEE2",
  red: "#D93A3A",
  grey: "#6F7682",
  wood: "#8A5A34",
} as const;

/** Papierschatten-Filter (einmal je Bühne). Gruppen mit filter="url(#paper)" wirken ausgeschnitten. */
export const PaperDefs: React.FC<{ readonly strength?: number }> = ({ strength = 0.38 }) => (
  <defs>
    <filter id="paper" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="7" dy="9" stdDeviation="0" floodColor="#000" floodOpacity={strength} />
    </filter>
    <filter id="paperSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="6" stdDeviation="0" floodColor="#000" floodOpacity={strength * 0.8} />
    </filter>
    <radialGradient id="warmGlow">
      <stop offset="0" stopColor="#FFD9A0" stopOpacity="0.55" />
      <stop offset="1" stopColor="#FFD9A0" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* ------------------------------------------------------------------ */
/* Figur                                                               */
/* ------------------------------------------------------------------ */

export type FigAge = "kid" | "teen" | "adult";
export type Outfit = "trunks" | "shirt" | "coat" | "dress" | "plain";
export type FigEyes = "open" | "closed" | "wide" | "down" | "up" | "side";
export type FigMouth = "flat" | "frown" | "o" | "smile" | "grit";
/** Arm: [Oberarm, Unterarm] in Grad ab „hängt senkrecht“, positiv = nach außen/oben. */
export type Arm = readonly [number, number];

const PROP: Record<FigAge, { leg: number; torso: number; head: number; shW: number; hipW: number; a1: number; a2: number; limb: number }> = {
  adult: { leg: 270, torso: 210, head: 64, shW: 86, hipW: 54, a1: 112, a2: 104, limb: 36 },
  teen: { leg: 236, torso: 182, head: 62, shW: 70, hipW: 46, a1: 96, a2: 90, limb: 30 },
  kid: { leg: 160, torso: 132, head: 60, shW: 54, hipW: 38, a1: 70, a2: 64, limb: 25 },
};

/** Kopfmitte (relativ zum Fußpunkt, s = 1) – für Kamera-Ziele. */
export const headY = (age: FigAge, sit = false) => {
  const p = PROP[age];
  const hip = sit ? p.leg * 0.62 : p.leg;
  return -(hip + p.torso + 22 + p.head);
};

const rad = (d: number) => (d * Math.PI) / 180;

export const Figure: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly frame: number;
  readonly age?: FigAge;
  readonly outfit?: Outfit;
  readonly towel?: "neck" | "head" | "none";
  /** Silhouette: alles in dieser Farbe, kein Gesicht */
  readonly sil?: string;
  /** weiße Augen auch auf der Silhouette (Reaktion) */
  readonly silEyes?: boolean;
  readonly pose?: "stand" | "sit" | "walk";
  readonly step?: number;
  readonly lean?: number;
  readonly armL?: Arm;
  readonly armR?: Arm;
  readonly gloves?: boolean;
  readonly headDown?: number;
  readonly headTilt?: number;
  readonly eyes?: FigEyes;
  readonly eyePop?: number;
  readonly mouth?: FigMouth;
  readonly talk?: number;
  readonly brows?: "neutral" | "sad" | "angry" | "up";
  readonly grey?: boolean;
  readonly blinkSeed?: number;
  readonly squash?: number;
  readonly o?: number;
  readonly flip?: boolean;
  readonly coatColor?: string;
  readonly breathe?: boolean;
}> = ({
  x,
  y,
  s = 1,
  frame,
  age = "adult",
  outfit = "trunks",
  towel = "none",
  sil,
  silEyes = false,
  pose = "stand",
  step = 0,
  lean = 0,
  armL: armLIn,
  armR: armRIn,
  gloves = false,
  headDown = 0,
  headTilt = 0,
  eyes = "open",
  eyePop = 1,
  mouth = "flat",
  talk = 0,
  brows = "neutral",
  grey = false,
  blinkSeed = 5,
  squash = 1,
  o = 1,
  flip = false,
  coatColor,
  breathe = true,
}) => {
  const p = PROP[age];
  const ink = PAPER.ink;
  const skin = sil ?? PAPER.skin;
  const dark = sil ?? PAPER.trunks;
  const br = breathe ? Math.sin(frame * 0.11) * 3 : 0;
  const sit = pose === "sit";
  // Sitzend: Hände vor dem Bauch gefaltet, damit die Knie frei bleiben
  const armL: Arm = armLIn ?? (sit ? [-6, -24] : [12, 8]);
  const armR: Arm = armRIn ?? (sit ? [-6, -24] : [12, 8]);
  const hipY = -(sit ? p.leg * 0.62 : p.leg);
  const sh = hipY - p.torso + br;
  const headC = sh - 22 - p.head + headDown * p.head * 0.3;
  const sw = pose === "walk" ? step : 0;

  // Beine
  const legPts = (side: -1 | 1) => {
    if (sit) {
      const hx = side * p.hipW * 0.62;
      return [
        [hx, hipY],
        [side * (p.hipW + 74), hipY + 22],
        [side * (p.hipW + 60), 0],
      ];
    }
    const fx = side * p.hipW * 0.78 + side * sw * 36;
    const lift = pose === "walk" ? Math.max(0, side * sw) * 26 : 0;
    return [
      [side * p.hipW * 0.6, hipY],
      [side * p.hipW * 0.72 + side * sw * 18, hipY / 2 - lift * 0.5],
      [fx, -lift],
    ];
  };
  const poly = (pts: number[][]) => pts.map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  const legColor = outfit === "shirt" || outfit === "coat" ? (sil ?? PAPER.pants) : skin;
  const leg = (side: -1 | 1) => {
    const pts = legPts(side);
    const f = pts[2];
    const thigh = sit ? poly(pts.slice(0, 2)) : "";
    return (
      <g key={`leg${side}`}>
        <path d={poly(pts)} stroke={ink} strokeWidth={p.limb + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={poly(pts)} stroke={legColor} strokeWidth={p.limb} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {sit ? (
          <>
            {/* verkürzter Oberschenkel (zeigt zur Kamera) + Kniescheibe */}
            <path d={thigh} stroke={ink} strokeWidth={p.limb * 1.55 + 10} fill="none" strokeLinecap="round" />
            <path d={thigh} stroke={legColor} strokeWidth={p.limb * 1.55} fill="none" strokeLinecap="round" />
            <ellipse cx={pts[1][0]} cy={pts[1][1] + 4} rx={p.limb * 0.82} ry={p.limb * 0.7} fill={legColor} stroke={ink} strokeWidth={5} />
            <path d={`M ${pts[1][0] - p.limb * 0.4} ${pts[1][1] + 8} Q ${pts[1][0]} ${pts[1][1] + 18} ${pts[1][0] + p.limb * 0.4} ${pts[1][1] + 8}`} stroke={PAPER.skinShade} strokeWidth={4} fill="none" />
          </>
        ) : null}
        {/* Schuh: schwarz, hoch geschnitten; darüber nackte Haut (keine Socken) */}
        <path
          d={`M ${f[0] - p.limb * 0.62} ${f[1] - p.limb * 1.1} L ${f[0] + p.limb * 0.62} ${f[1] - p.limb * 1.1} L ${f[0] + p.limb * 0.7 + side * 14} ${f[1] + 6} L ${f[0] - p.limb * 0.7 + side * 14} ${f[1] + 6} Z`}
          fill={sil ?? PAPER.shoe}
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </g>
    );
  };

  // Arme
  const shoulder = (side: -1 | 1): [number, number] => [side * (p.shW - 14), sh + 18];
  const armPts = (side: -1 | 1, a: Arm) => {
    const s0 = shoulder(side);
    const e: [number, number] = [s0[0] + side * Math.sin(rad(a[0])) * p.a1, s0[1] + Math.cos(rad(a[0])) * p.a1];
    const h: [number, number] = [e[0] + side * Math.sin(rad(a[1])) * p.a2, e[1] + Math.cos(rad(a[1])) * p.a2];
    return [s0, e, h];
  };
  const arm = (side: -1 | 1, a: Arm) => {
    const pts = armPts(side, a);
    const hand = pts[2];
    const sleeve = outfit === "shirt" ? (sil ?? PAPER.shirt) : outfit === "coat" ? (coatColor ?? sil ?? "#3B3F48") : skin;
    const lowerColor = outfit === "coat" ? sleeve : skin;
    return (
      <g key={`arm${side}`}>
        <path d={poly(pts)} stroke={ink} strokeWidth={p.limb + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={poly(pts)} stroke={lowerColor} strokeWidth={p.limb} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {outfit === "shirt" ? (
          <path d={poly([pts[0], [lerp2(pts[0][0], pts[1][0], 0.55), lerp2(pts[0][1], pts[1][1], 0.55)]])} stroke={sleeve} strokeWidth={p.limb + 6} strokeLinecap="round" />
        ) : null}
        {gloves ? (
          <g transform={`translate(${hand[0]} ${hand[1]})`}>
            <ellipse rx={p.limb * 1.08} ry={p.limb * 1.18} fill={sil ?? PAPER.glove} stroke={ink} strokeWidth={6} />
            <ellipse cx={side * -p.limb * 0.55} cy={-p.limb * 0.2} rx={p.limb * 0.42} ry={p.limb * 0.6} fill={sil ?? PAPER.glove} stroke={ink} strokeWidth={5} />
            {sil ? null : <ellipse cx={side * 6} cy={-p.limb * 0.5} rx={p.limb * 0.35} ry={p.limb * 0.2} fill="#FFFFFF" opacity={0.25} />}
          </g>
        ) : (
          <circle cx={hand[0]} cy={hand[1]} r={p.limb * 0.62} fill={skin} stroke={ink} strokeWidth={5} />
        )}
      </g>
    );
  };

  // Rumpf
  const torsoD = `M ${-p.shW} ${sh + 10} Q ${-p.shW} ${sh - 8} ${-p.shW + 22} ${sh - 10} L ${p.shW - 22} ${sh - 10} Q ${p.shW} ${sh - 8} ${p.shW} ${sh + 10} L ${p.hipW + 4} ${hipY + 6} L ${-p.hipW - 4} ${hipY + 6} Z`;
  const torsoFill = outfit === "shirt" ? (sil ?? PAPER.shirt) : outfit === "coat" ? (coatColor ?? sil ?? "#3B3F48") : outfit === "dress" ? (sil ?? "#555") : skin;

  // Kopf
  const hr = p.head;
  const blink = !sil && (blinkAt(frame, blinkSeed) || eyes === "closed");
  const pupilDy = eyes === "down" ? 7 + headDown * 4 : eyes === "up" ? -8 : 0;
  const pupilDx = eyes === "side" ? 8 : 0;
  const eyeR = eyes === "wide" ? 1.3 : 1;
  const eyeY = headC + 2 + headDown * 10;
  const browY = eyeY - 26;
  const browIn = brows === "sad" ? -10 : brows === "angry" ? 8 : brows === "up" ? -12 : 0;
  const browOut = brows === "sad" ? 4 : brows === "angry" ? -6 : brows === "up" ? -12 : 0;
  const mY = headC + hr * 0.5 + headDown * 6;
  const open = Math.max(talk, mouth === "o" ? 0.75 : 0);
  const mouthEl =
    open > 0.12 ? (
      <ellipse cx={0} cy={mY} rx={9 + open * 4} ry={3 + open * 10} fill={ink} />
    ) : mouth === "frown" ? (
      <path d={`M -16 ${mY + 6} Q 0 ${mY - 8} 16 ${mY + 6}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "smile" ? (
      <path d={`M -18 ${mY - 4} Q 0 ${mY + 12} 18 ${mY - 4}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "grit" ? (
      <rect x={-17} y={mY - 6} width={34} height={12} rx={4} fill="#EDE6DA" stroke={ink} strokeWidth={5} />
    ) : (
      <path d={`M -13 ${mY} L 13 ${mY}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
    );
  const eye = (side: -1 | 1) => (
    <g key={`eye${side}`} transform={`translate(${side * hr * 0.36} ${eyeY}) scale(${eyePop * eyeR})`}>
      {blink ? (
        <path d="M -12 0 Q 0 6 12 0" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse rx={12} ry={eyes === "down" ? 11 : 15} fill="#FBF8F2" stroke={ink} strokeWidth={4} />
          <circle cx={pupilDx} cy={pupilDy * 0.6} r={6.5} fill={ink} />
        </>
      )}
    </g>
  );
  const head = (
    <g transform={`rotate(${headTilt} 0 ${sh - 10})`}>
      {/* Hals */}
      <rect x={-p.limb * 0.5} y={sh - 34} width={p.limb} height={40} fill={skin} stroke={ink} strokeWidth={5} />
      {/* Ohren */}
      {[-1, 1].map((sd) => (
        <circle key={sd} cx={sd * hr * 0.97} cy={headC + 6} r={hr * 0.22} fill={skin} stroke={ink} strokeWidth={5} />
      ))}
      <circle cx={0} cy={headC} r={hr} fill={skin} stroke={ink} strokeWidth={6} />
      {sil ? null : (
        <>
          {/* kurzes Haar als flache Kappe (generisch) */}
          <path
            d={`M ${-hr * 0.96} ${headC - hr * 0.12} Q ${-hr * 1.02} ${headC - hr * 1.08} 0 ${headC - hr * 1.06} Q ${hr * 1.02} ${headC - hr * 1.08} ${hr * 0.96} ${headC - hr * 0.12} Q ${hr * 0.7} ${headC - hr * 0.62} 0 ${headC - hr * 0.66} Q ${-hr * 0.7} ${headC - hr * 0.62} ${-hr * 0.96} ${headC - hr * 0.12} Z`}
            fill={PAPER.hair}
          />
          {grey
            ? [-1, 1].map((sd) => (
                <path
                  key={sd}
                  d={`M ${sd * hr * 0.96} ${headC - hr * 0.1} Q ${sd * hr * 0.98} ${headC - hr * 0.5} ${sd * hr * 0.78} ${headC - hr * 0.62} L ${sd * hr * 0.7} ${headC - hr * 0.3} Z`}
                  fill="#B9B9B9"
                />
              ))
            : null}
          {/* Wangenschatten (Papierlage) */}
          <path d={`M ${-hr * 0.9} ${headC + hr * 0.25} Q 0 ${headC + hr * 1.15} ${hr * 0.9} ${headC + hr * 0.25} Q 0 ${headC + hr * 0.92} ${-hr * 0.9} ${headC + hr * 0.25} Z`} fill={PAPER.skinShade} opacity={0.5} />
          {eye(-1)}
          {eye(1)}
          {[-1, 1].map((sd) => (
            <path
              key={`b${sd}`}
              d={`M ${sd * hr * 0.16} ${browY + browIn} L ${sd * hr * 0.56} ${browY + browOut}`}
              stroke={ink}
              strokeWidth={7}
              strokeLinecap="round"
            />
          ))}
          {/* Nase als kleiner Punkt (eine Kurve über dem Mund las sich als Schnurrbart) */}
          <ellipse cx={0} cy={eyeY + 24} rx={6} ry={4} fill={PAPER.skinShade} />
          {mouthEl}
        </>
      )}
      {sil && silEyes
        ? [-1, 1].map((sd) => (
            <ellipse key={sd} cx={sd * hr * 0.34} cy={eyeY} rx={10 * eyePop} ry={13 * eyePop} fill="#FBF8F2" />
          ))
        : null}
    </g>
  );

  const towelNeck =
    towel === "neck" ? (
      <g>
        <path
          d={`M ${-p.shW * 0.82} ${sh + 4} Q ${-p.shW * 0.5} ${sh - 30} 0 ${sh - 24} Q ${p.shW * 0.5} ${sh - 30} ${p.shW * 0.82} ${sh + 4} L ${p.shW * 0.56} ${sh + 14} Q 0 ${sh - 4} ${-p.shW * 0.56} ${sh + 14} Z`}
          fill={PAPER.towel}
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {[-1, 1].map((sd) => (
          <path
            key={sd}
            d={`M ${sd * p.shW * 0.24} ${sh + 2} L ${sd * p.shW * 0.62} ${sh + 6} L ${sd * p.shW * 0.56 + sd * Math.sin(frame * 0.09 + sd) * 3} ${sh + 128} L ${sd * p.shW * 0.2} ${sh + 122} Z`}
            fill={PAPER.towel}
            stroke={ink}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        ))}
        {[-1, 1].map((sd) => (
          <line key={`l${sd}`} x1={sd * p.shW * 0.25} y1={sh + 104} x2={sd * p.shW * 0.57} y2={sh + 108} stroke={PAPER.towelShade} strokeWidth={5} />
        ))}
      </g>
    ) : null;
  const towelHead =
    towel === "head" ? (
      <g>
        <path
          d={`M ${-p.shW * 0.95} ${sh + 70} Q ${-hr * 1.5} ${headC - hr * 0.2} ${-hr * 0.9} ${headC - hr * 1.1} Q 0 ${headC - hr * 1.6} ${hr * 0.9} ${headC - hr * 1.1} Q ${hr * 1.5} ${headC - hr * 0.2} ${p.shW * 0.95} ${sh + 70} L ${p.shW * 0.55} ${sh + 74} Q ${hr * 1.0} ${headC} ${hr * 0.62} ${headC - hr * 0.62} Q 0 ${headC - hr * 0.98} ${-hr * 0.62} ${headC - hr * 0.62} Q ${-hr * 1.0} ${headC} ${-p.shW * 0.55} ${sh + 74} Z`}
          fill={PAPER.towel}
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <ellipse cx={0} cy={headC + hr * 0.1} rx={hr * 0.8} ry={hr * 0.92} fill="#000" opacity={0.55} />
        {/* Stoffkante quer über der Stirn + Falten: liest sich als Tuch, nicht als Haar */}
        <path
          d={`M ${-hr * 1.05} ${headC - hr * 0.3} Q 0 ${headC - hr * 0.62} ${hr * 1.05} ${headC - hr * 0.3} L ${hr * 0.98} ${headC - hr * 0.6} Q 0 ${headC - hr * 0.98} ${-hr * 0.98} ${headC - hr * 0.6} Z`}
          fill={PAPER.towelShade}
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * hr * 1.15} ${headC} Q ${sd * hr * 1.3} ${sh} ${sd * p.shW * 0.8} ${sh + 60}`} stroke={PAPER.towelShade} strokeWidth={6} fill="none" />
        ))}
      </g>
    ) : null;

  // Kleidung über dem Rumpf
  const trunks =
    outfit === "trunks" ? (
      <g>
        <path
          d={
            sit
              ? `M ${-p.hipW - 8} ${hipY - 34} L ${p.hipW + 8} ${hipY - 34} L ${p.hipW + 40} ${hipY + 12} L ${p.hipW + 30} ${hipY + 34} L 0 ${hipY + 20} L ${-p.hipW - 30} ${hipY + 34} L ${-p.hipW - 40} ${hipY + 12} Z`
              : `M ${-p.hipW - 8} ${hipY - 34} L ${p.hipW + 8} ${hipY - 34} L ${p.hipW + 16} ${hipY + 70} L ${8} ${hipY + 74} L 0 ${hipY + 30} L ${-8} ${hipY + 74} L ${-p.hipW - 16} ${hipY + 70} Z`
          }
          fill={dark}
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <rect x={-p.hipW - 8} y={hipY - 38} width={p.hipW * 2 + 16} height={16} rx={4} fill={sil ?? PAPER.band} stroke={ink} strokeWidth={4} />
      </g>
    ) : outfit === "shirt" ? (
      <path
        d={`M ${-p.hipW - 6} ${hipY - 8} L ${p.hipW + 6} ${hipY - 8} L ${p.hipW + 10} ${hipY + 46} L ${-p.hipW - 10} ${hipY + 46} Z`}
        fill={sil ?? PAPER.pants}
        stroke={ink}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    ) : outfit === "coat" ? (
      <path
        d={`M ${-p.shW - 4} ${sh + 6} L ${p.shW + 4} ${sh + 6} L ${p.shW + 26} ${hipY + p.leg * 0.5} L ${-p.shW - 26} ${hipY + p.leg * 0.5} Z`}
        fill={coatColor ?? sil ?? "#3B3F48"}
        stroke={ink}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    ) : outfit === "dress" ? (
      <path
        d={`M ${-p.hipW - 4} ${hipY - 40} L ${p.hipW + 4} ${hipY - 40} L ${p.hipW + 44} ${hipY + p.leg * 0.55} L ${-p.hipW - 44} ${hipY + p.leg * 0.55} Z`}
        fill={sil ?? "#555"}
        stroke={ink}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    ) : null;

  const sq = Math.max(0.3, squash);
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${lean}) scale(${(s / Math.sqrt(sq)) * (flip ? -1 : 1)} ${s * sq})`}
      opacity={o}
      filter="url(#paper)"
    >
      {leg(-1)}
      {leg(1)}
      <path d={torsoD} fill={torsoFill} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      {outfit === "trunks" && !sil ? (
        <path d={`M -22 ${sh + 52} Q 0 ${sh + 62} 22 ${sh + 52}`} stroke={PAPER.skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
      ) : null}
      {trunks}
      {towelNeck}
      {head}
      {towelHead}
      {arm(-1, armL)}
      {arm(1, armR)}
    </g>
  );
};
const lerp2 = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* Ring                                                                */
/* ------------------------------------------------------------------ */

export const RING = { back: 1120, front: 1330, lx: 70, rx: 1010, flx: -170, frx: 1250 } as const;
export type RingTone = { readonly mat: string; readonly matShade: string; readonly rope: string; readonly apron: string; readonly post: string; readonly padA: string; readonly padB: string };
export const RING_TONES = {
  warm: { mat: "#D9CBB0", matShade: "#B9A988", rope: "#E9E2D2", apron: "#2A1C16", post: "#3A3A40", padA: "#9E3A2E", padB: "#3E5A7A" },
  cool: { mat: "#AEB8C6", matShade: "#8E99AA", rope: "#D5DCE6", apron: "#141A26", post: "#2C3240", padA: "#6C3E46", padB: "#3E5370" },
  grey: { mat: "#A9A9A9", matShade: "#8A8A8A", rope: "#CFCFCF", apron: "#1B1B1B", post: "#333", padA: "#5A5A5A", padB: "#4A4A4A" },
  dark: { mat: "#4A4038", matShade: "#3A322C", rope: "#77706A", apron: "#0B0907", post: "#1F1F22", padA: "#3E211C", padB: "#1E2833" },
} as const satisfies Record<string, RingTone>;

/** Ring (Hintergrund-Teil): Matte, Pfosten, hintere und seitliche Seile, Schürze. */
export const RingBack: React.FC<{ readonly tone: RingTone; readonly frame: number }> = ({ tone, frame }) => {
  const r = RING;
  const sway = (k: number) => Math.sin(frame * 0.05 + k) * 3;
  const ropes = [80, 165, 250];
  return (
    <g>
      <path d={`M ${r.lx} ${r.back} L ${r.rx} ${r.back} L ${r.frx} ${r.front} L ${r.flx} ${r.front} Z`} fill={tone.mat} />
      <path d={`M ${r.lx} ${r.back} L ${r.rx} ${r.back} L ${r.rx + 30} ${r.back + 24} L ${r.lx - 30} ${r.back + 24} Z`} fill={tone.matShade} opacity={0.6} />
      <rect x={-600} y={r.front} width={2300} height={500} fill={tone.apron} />
      <rect x={-600} y={r.front} width={2300} height={12} fill={tone.matShade} />
      {/* hintere Pfosten */}
      {[r.lx, r.rx].map((px, i) => (
        <g key={px} filter="url(#paperSoft)">
          <rect x={px - 13} y={r.back - 300} width={26} height={300} fill={tone.post} stroke={PAPER.ink} strokeWidth={4} />
          <rect x={px - 22} y={r.back - 272} width={44} height={210} rx={10} fill={i ? tone.padB : tone.padA} stroke={PAPER.ink} strokeWidth={4} />
        </g>
      ))}
      {ropes.map((h, i) => (
        <g key={h}>
          <path d={`M ${r.lx} ${r.back - h} Q 540 ${r.back - h + 8 + sway(i)} ${r.rx} ${r.back - h}`} stroke={PAPER.ink} strokeWidth={13} fill="none" />
          <path d={`M ${r.lx} ${r.back - h} Q 540 ${r.back - h + 8 + sway(i)} ${r.rx} ${r.back - h}`} stroke={tone.rope} strokeWidth={8} fill="none" />
          {[
            [r.lx, r.flx],
            [r.rx, r.frx],
          ].map(([a, b]) => (
            <g key={a}>
              <line x1={a} y1={r.back - h} x2={b} y2={r.front - h * 1.25} stroke={PAPER.ink} strokeWidth={15} />
              <line x1={a} y1={r.back - h} x2={b} y2={r.front - h * 1.25} stroke={tone.rope} strokeWidth={10} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

/** Holzhocker in der Ecke (Fußpunkt). */
export const Stool: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paperSoft)">
    {[-58, 0, 58].map((dx) => (
      <rect key={dx} x={dx - 9} y={-160} width={18} height={164} fill={PAPER.wood} stroke={PAPER.ink} strokeWidth={4} />
    ))}
    <rect x={-84} y={-176} width={168} height={28} rx={8} fill="#A06C40" stroke={PAPER.ink} strokeWidth={5} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Hintergrund + Kulissen                                               */
/* ------------------------------------------------------------------ */

/** Dunkle Halle: Verlauf, Traversen-Lichter, Zuschauer-Reihen als Silhouette (Weltraum, groß genug für Kamerafahrten). */
export const Hall: React.FC<{ readonly top: string; readonly bottom: string; readonly crowd?: string; readonly frame: number; readonly flashes?: number; readonly lights?: number }> = ({
  top,
  bottom,
  crowd = "#000",
  frame,
  flashes = 0,
  lights = 1,
}) => {
  const id = `hall-${top.slice(1)}-${bottom.slice(1)}`;
  const heads = React.useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: 140 }, (_, i) => ({ x: -500 + (i % 35) * 62 + r() * 20, row: Math.floor(i / 35), k: r() }));
  }, []);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={-1500} y={-1500} width={4100} height={4500} fill={`url(#${id})`} />
      {/* Lichterreihe unter dem Dach */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} opacity={lights}>
          <circle cx={-260 + i * 200} cy={140} r={16} fill="#FFF3D6" opacity={0.8} />
          <circle cx={-260 + i * 200} cy={140} r={60} fill="url(#warmGlow)" />
        </g>
      ))}
      {heads.map((h, i) => (
        <g key={i}>
          <circle cx={h.x} cy={880 + h.row * 58} r={24} fill={crowd} opacity={0.85 - h.row * 0.08} />
          <rect x={h.x - 30} y={892 + h.row * 58} width={60} height={50} rx={18} fill={crowd} opacity={0.85 - h.row * 0.08} />
          {flashes > 0 && Math.floor(frame / 3 + h.k * 40) % 23 === 0 ? <circle cx={h.x + 8} cy={870 + h.row * 58} r={14} fill="#FFFFFF" opacity={flashes} /> : null}
        </g>
      ))}
    </g>
  );
};

/** Bühnen-Prospekt (Kulisse), hängt an zwei Seilen und wird heruntergelassen (`down` 0..1, mit Nachfedern). */
export const Drop: React.FC<{
  readonly id: string;
  readonly down: number;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly dx?: number;
  readonly children: React.ReactNode;
}> = ({ id, down, x = -110, y = 60, w = 1300, h = 1060, dx = 0, children }) => {
  if (down <= 0) return null;
  const t = Math.min(1, down);
  const back = t < 1 ? 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2) : 1;
  const yy = y - (1 - back) * (h + 300);
  return (
    <g transform={`translate(${x + dx} ${yy})`}>
      <defs>
        <clipPath id={`drop-${id}`}>
          <rect width={w} height={h} />
        </clipPath>
      </defs>
      {[90, w - 90].map((sx) => (
        <line key={sx} x1={sx} y1={-2400} x2={sx} y2={0} stroke="#0B0B0B" strokeWidth={6} />
      ))}
      <g filter="url(#paper)">
        <g clipPath={`url(#drop-${id})`}>{children}</g>
        <rect width={w} height={h} fill="none" stroke={PAPER.ink} strokeWidth={10} />
      </g>
    </g>
  );
};

/** Lichtkegel von oben (Bildraum-unabhängig in Weltkoordinaten), verdunkelt den Rest. */
export const SpotCone: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly w?: number; readonly dim?: number; readonly color?: string }> = ({
  x,
  y,
  o,
  w = 300,
  dim = 0.6,
  color = "#FFF1D0",
}) => (
  <g opacity={o}>
    <defs>
      <linearGradient id="tyson-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0" />
        <stop offset="1" stopColor={color} stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path
      d={`M -3000 -3000 L 4000 -3000 L 4000 5000 L -3000 5000 Z M ${x - 50} ${y - 1700} L ${x - w} ${y} L ${x + w} ${y} L ${x + 50} ${y - 1700} Z`}
      fill="#000"
      opacity={dim}
      fillRule="evenodd"
    />
    <path d={`M ${x - 50} ${y - 1700} L ${x + 50} ${y - 1700} L ${x + w} ${y} L ${x - w} ${y} Z`} fill="url(#tyson-cone)" />
    <ellipse cx={x} cy={y} rx={w} ry={w * 0.15} fill={color} opacity={0.3} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Requisiten                                                           */
/* ------------------------------------------------------------------ */

/** Punktrichter-Karte. Zeilen mit Füllung (rot) und Wert rechts. Mitte (x, y). `turn` −1..1 = Drehung um die Hochachse. */
export type CardRow = { readonly label: string; readonly fill?: number; readonly mark?: string; readonly color?: string; readonly markColor?: string };
export const ScoreCard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  readonly rows: readonly CardRow[];
  readonly title?: string;
  readonly turn?: number;
  readonly rowH?: number;
  readonly pen?: number;
  readonly w?: number;
}> = ({ x, y, s = 1, r = 0, rows, title = "SCORECARD", turn = 1, rowH = 58, pen, w = 600 }) => {
  const head = 96;
  const h = head + rows.length * rowH + 30;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s * turn} ${s})`} filter="url(#paper)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={PAPER.paper} stroke={PAPER.ink} strokeWidth={8} />
      <rect x={-w / 2} y={-h / 2} width={w} height={head} rx={18} fill={PAPER.ink} />
      <text x={0} y={-h / 2 + 64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} letterSpacing={4} fill={PAPER.paper}>
        {title}
      </text>
      {rows.map((row, i) => {
        const ry = -h / 2 + head + 14 + i * rowH;
        return (
          <g key={row.label + i}>
            <rect x={-w / 2 + 20} y={ry + 4} width={(w - 40) * Math.max(0, Math.min(1, row.fill ?? 0))} height={rowH - 10} rx={8} fill={row.color ?? PAPER.red} />
            <line x1={-w / 2 + 20} y1={ry + rowH - 2} x2={w / 2 - 20} y2={ry + rowH - 2} stroke="#B5AE9F" strokeWidth={3} />
            <text x={-w / 2 + 36} y={ry + rowH * 0.7} fontFamily={FONT} fontWeight={900} fontSize={rowH * 0.56} fill={PAPER.ink}>
              {row.label}
            </text>
            {row.mark ? (
              <text x={w / 2 - 36} y={ry + rowH * 0.72} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={rowH * 0.62} fill={row.markColor ?? PAPER.ink}>
                {row.mark}
              </text>
            ) : null}
          </g>
        );
      })}
      {pen !== undefined ? (
        <g transform={`translate(${w / 2 - 120 + pen * 40} ${h / 2 - 60 - rowH * 0.2}) rotate(-35)`}>
          <rect x={-10} y={-150} width={22} height={150} rx={6} fill={PAPER.gold} stroke={PAPER.ink} strokeWidth={5} />
          <path d="M -10 0 L 12 0 L 1 26 Z" fill="#F0D9B0" stroke={PAPER.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      ) : null}
    </g>
  );
};

/** Meisterschaftsgürtel (neutral Gold, ohne Logo). Mitte (x, y). */
export const Belt: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly shine?: number; readonly outline?: boolean; readonly o?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  shine = 0,
  outline = false,
  o = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter={outline ? undefined : "url(#paper)"} opacity={o}>
    {outline ? (
      <g fill="none" stroke={PAPER.gold} strokeWidth={6} strokeDasharray="18 14">
        <rect x={-260} y={-34} width={520} height={68} rx={30} />
        <ellipse rx={92} ry={78} />
      </g>
    ) : (
      <>
        <rect x={-260} y={-34} width={520} height={68} rx={30} fill="#2A1A10" stroke={PAPER.ink} strokeWidth={6} />
        {[-190, -120, 120, 190].map((px) => (
          <ellipse key={px} cx={px} cy={0} rx={28} ry={24} fill={PAPER.gold} stroke={PAPER.ink} strokeWidth={4} />
        ))}
        <ellipse rx={92} ry={78} fill={PAPER.gold} stroke={PAPER.ink} strokeWidth={7} />
        <ellipse rx={62} ry={50} fill={PAPER.goldDark} stroke={PAPER.ink} strokeWidth={4} />
        <circle r={18} fill={PAPER.gold} />
        {shine > 0 ? <path d="M -40 -30 L -10 -60 L 0 -30 Z" fill="#FFFFFF" opacity={shine} /> : null}
      </>
    )}
  </g>
);

/** Bilderrahmen mit Brustbild-Silhouette (Erinnerung). `fade` 0..1 = Silhouette verblasst. */
export const PictureFrame: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly fade?: number; readonly long?: boolean; readonly r?: number; readonly o?: number }> = ({
  x,
  y,
  s = 1,
  fade = 0,
  long = false,
  r = 0,
  o = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)" opacity={o}>
    <rect x={-110} y={-140} width={220} height={280} rx={8} fill="#5C3B22" stroke={PAPER.ink} strokeWidth={7} />
    <rect x={-84} y={-114} width={168} height={228} fill="#C9B79A" stroke={PAPER.ink} strokeWidth={4} />
    <g opacity={1 - fade}>
      <circle cx={0} cy={-26} r={40} fill="#5B5049" />
      {long ? <path d="M -46 -40 Q -60 30 -50 60 L 50 60 Q 60 30 46 -40 Q 0 -86 -46 -40 Z" fill="#5B5049" /> : null}
      <path d="M -70 114 Q -66 30 0 26 Q 66 30 70 114 Z" fill="#5B5049" />
    </g>
  </g>
);

/** Taube (seitlich, Mitte). */
export const Pigeon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly flap?: number; readonly flip?: boolean }> = ({ x, y, s = 1, flap = 0, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (flip ? -1 : 1)} ${s})`} filter="url(#paperSoft)">
    <path d="M -60 10 L -96 -6 L -92 22 Z" fill="#6E7480" stroke={PAPER.ink} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={-6} cy={8} rx={58} ry={34} fill="#A3AAB6" stroke={PAPER.ink} strokeWidth={5} />
    <path d={`M -30 0 Q 0 ${-40 - flap * 30} 30 -4 Q 0 6 -30 0 Z`} fill="#8A919E" stroke={PAPER.ink} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={46} cy={-20} r={22} fill="#7D8794" stroke={PAPER.ink} strokeWidth={5} />
    <path d="M 26 -6 Q 40 6 56 -2" stroke="#5FA98B" strokeWidth={6} fill="none" />
    <circle cx={52} cy={-26} r={4} fill={PAPER.ink} />
    <path d="M 66 -20 L 82 -16 L 66 -12 Z" fill="#E0B39A" stroke={PAPER.ink} strokeWidth={3} />
  </g>
);

/** Einzelne Feder. */
export const Feather: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <path d="M 0 -60 Q 26 -30 14 20 Q 6 44 0 60 Q -6 44 -14 20 Q -26 -30 0 -60 Z" fill="#E6E9EE" stroke={PAPER.ink} strokeWidth={4} />
    <line x1={0} y1={-50} x2={0} y2={70} stroke={PAPER.ink} strokeWidth={3} />
  </g>
);

/** Strichliste in Fünfergruppen (Kreide), `n` sichtbare Striche. Ursprung links oben. */
export const Tally: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly per?: number; readonly s?: number; readonly color?: string }> = ({
  x,
  y,
  n,
  per = 4,
  s = 1,
  color = "#F2EFE6",
}) => {
  const groups = Math.ceil(38 / 5);
  const out: React.ReactNode[] = [];
  for (let g = 0; g < groups; g++) {
    const gx = (g % per) * 150;
    const gy = Math.floor(g / per) * 130;
    for (let k = 0; k < 5; k++) {
      const idx = g * 5 + k;
      if (idx >= Math.min(38, n)) break;
      out.push(
        k < 4 ? (
          <line key={idx} x1={gx + k * 26} y1={gy} x2={gx + k * 26 + 4} y2={gy + 96} stroke={color} strokeWidth={9} strokeLinecap="round" />
        ) : (
          <line key={idx} x1={gx - 12} y1={gy + 80} x2={gx + 104} y2={gy + 14} stroke={color} strokeWidth={9} strokeLinecap="round" />
        ),
      );
    }
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{out}</g>;
};

/** Geldschein (Mitte). */
export const Bill: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number; readonly flipY?: number }> = ({ x, y, r = 0, s = 1, flipY = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s} ${s * flipY})`}>
    <rect x={-60} y={-30} width={120} height={60} rx={6} fill="#7FB07A" stroke={PAPER.ink} strokeWidth={4} />
    <circle r={16} fill="#5E9159" stroke={PAPER.ink} strokeWidth={3} />
    <rect x={-50} y={-20} width={100} height={40} rx={4} fill="none" stroke="#4E7F4A" strokeWidth={3} />
  </g>
);

/** Mantel am Haken (Fußpunkt = Haken oben). `swing` Grad. */
export const HangingCoat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly swing?: number; readonly color?: string }> = ({ x, y, s = 1, swing = 0, color = "#3B3F48" }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`} filter="url(#paper)">
    <path d="M 0 -6 Q 10 -22 0 -30 Q -10 -36 -12 -24" stroke={PAPER.ink} strokeWidth={6} fill="none" />
    <path d="M -24 6 L 24 6 L 84 60 L 96 330 L -96 330 L -84 60 Z" fill={color} stroke={PAPER.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -24 6 L 0 120 L 24 6" fill="none" stroke={PAPER.ink} strokeWidth={5} />
    <line x1={0} y1={120} x2={0} y2={326} stroke={PAPER.ink} strokeWidth={4} />
    {[170, 230, 290].map((by) => (
      <circle key={by} cx={12} cy={by} r={7} fill="#1A1D24" />
    ))}
  </g>
);

/** Dokument mit Überschrift (Mitte). */
export const Doc: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly title: string; readonly stamp?: number }> = ({ x, y, s = 1, r = 0, title, stamp = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <rect x={-230} y={-290} width={460} height={580} rx={10} fill={PAPER.paper} stroke={PAPER.ink} strokeWidth={7} />
    <text x={0} y={-200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={PAPER.ink}>
      {title.split(" ")[0]}
    </text>
    <text x={0} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={PAPER.ink}>
      {title.split(" ").slice(1).join(" ")}
    </text>
    {[-60, -10, 40, 90, 140].map((ly, i) => (
      <rect key={ly} x={-170} y={ly} width={i % 2 ? 300 : 340} height={14} rx={7} fill="#C9C1AF" />
    ))}
    {stamp > 0 ? (
      <g transform={`translate(110 210) rotate(-14) scale(${1.6 - 0.6 * Math.min(1, stamp)})`} opacity={Math.min(1, stamp * 1.5)}>
        <circle r={62} fill="none" stroke="#B23A3A" strokeWidth={10} />
        <circle r={44} fill="none" stroke="#B23A3A" strokeWidth={5} />
      </g>
    ) : null}
  </g>
);

/** Richterhammer (Drehpunkt am Griffende). */
export const Gavel: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <rect x={0} y={-11} width={230} height={22} rx={10} fill="#6B4226" stroke={PAPER.ink} strokeWidth={5} />
    <rect x={200} y={-52} width={64} height={104} rx={12} fill="#7E4F2C" stroke={PAPER.ink} strokeWidth={6} />
    <rect x={200} y={-52} width={64} height={18} fill="#C9A15A" stroke={PAPER.ink} strokeWidth={4} />
    <rect x={200} y={34} width={64} height={18} fill="#C9A15A" stroke={PAPER.ink} strokeWidth={4} />
  </g>
);

/** Glühbirne an Kabel, warmer Schein (Kabel nach oben bis y −3000). */
export const Bulb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly glow?: number; readonly swing?: number }> = ({ x, y, s = 1, glow = 1, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
    <line x1={0} y1={-3000} x2={0} y2={-40} stroke="#0A0A0A" strokeWidth={5} />
    <circle cy={30} r={520} fill="url(#warmGlow)" opacity={glow} />
    <rect x={-16} y={-44} width={32} height={34} fill="#3A3A3A" stroke={PAPER.ink} strokeWidth={4} />
    <circle cy={14} r={30} fill="#FFE2A8" stroke={PAPER.ink} strokeWidth={4} />
  </g>
);

/** Papierblume (Mitte). */
export const PaperFlower: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly color?: string }> = ({ x, y, s = 1, r = 0, color = "#F1E6D6" }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <path d="M 0 30 Q 6 80 -4 130" stroke="#5E7F55" strokeWidth={7} fill="none" strokeLinecap="round" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={0} cy={-26} rx={18} ry={30} fill={color} stroke={PAPER.ink} strokeWidth={4} transform={`rotate(${a})`} />
    ))}
    <circle r={14} fill="#E3B95A" stroke={PAPER.ink} strokeWidth={4} />
  </g>
);

/** Sandsack an Kette (Drehpunkt oben). */
export const Bag: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly swing?: number }> = ({ x, y, s = 1, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`} filter="url(#paper)">
    <line x1={0} y1={-400} x2={0} y2={0} stroke="#2A2A2A" strokeWidth={7} />
    <rect x={-70} y={0} width={140} height={330} rx={40} fill="#6B3A2C" stroke={PAPER.ink} strokeWidth={7} />
    {[70, 260].map((by) => (
      <rect key={by} x={-70} y={by} width={140} height={14} fill="#4C281E" />
    ))}
  </g>
);

/** Schild mit Text (Mitte). */
export const Sign: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly lines: readonly string[]; readonly color?: string; readonly fg?: string; readonly w?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  lines,
  color = PAPER.red,
  fg = PAPER.paper,
  w = 520,
}) => {
  const h = 40 + lines.length * 84;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={color} stroke={PAPER.ink} strokeWidth={8} />
      {lines.map((l, i) => (
        <text key={l} x={0} y={-h / 2 + 92 + i * 84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} letterSpacing={2} fill={fg}>
          {l}
        </text>
      ))}
    </g>
  );
};

/** Hand mit erhobenen Fingern (Zählen), Mitte = Handballen. */
export const CountHand: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly s?: number; readonly color?: string }> = ({ x, y, n, s = 1, color = "#9AA0AA" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-40} y={0} width={80} height={200} rx={20} fill="#2E3440" stroke={PAPER.ink} strokeWidth={5} />
    <rect x={-56} y={-70} width={112} height={90} rx={30} fill={color} stroke={PAPER.ink} strokeWidth={5} />
    {[-40, -14, 12, 38].map((fx, i) => (
      <rect key={fx} x={fx - 11} y={i < n ? -150 : -92} width={22} height={i < n ? 92 : 34} rx={11} fill={color} stroke={PAPER.ink} strokeWidth={5} />
    ))}
    <rect x={44} y={n >= 5 ? -100 : -50} width={22} height={n >= 5 ? 70 : 34} rx={11} fill={color} stroke={PAPER.ink} strokeWidth={5} transform={n >= 5 ? "rotate(30 55 -40)" : undefined} />
  </g>
);

/** Boxhandschuh-Umriss (für Form-Wipe), Mitte, Größe s = 1 ≈ 400 px hoch. */
export const GLOVE_PATH =
  "M -120 170 L -120 40 Q -170 0 -150 -80 Q -130 -190 0 -200 Q 150 -205 165 -60 Q 175 40 110 90 L 110 170 Q 0 200 -120 170 Z";
export const GloveShape: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly color?: string; readonly r?: number }> = ({ x, y, s, color = PAPER.gold, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d={GLOVE_PATH} fill={color} stroke={PAPER.ink} strokeWidth={10 / Math.max(0.2, s)} strokeLinejoin="round" />
    <path d="M -150 -60 Q -90 -30 -70 40" stroke={PAPER.ink} strokeWidth={8 / Math.max(0.2, s)} fill="none" />
    <rect x={-124} y={110} width={238} height={36} fill="#00000022" />
  </g>
);

/**
 * Form-Wipe Boxhandschuh in Szene (Bildraum, über allem): wächst bis bildfüllend um `at`, danach
 * öffnet er sich als Loch (Rand fliegt nach außen). `local` = Frame relativ zur Mitte des Wipes.
 */
export const GloveWipe: React.FC<{ readonly local: number; readonly n?: number; readonly color?: string; readonly x?: number; readonly y?: number }> = ({
  local,
  n = 8,
  color = PAPER.gold,
  x = 540,
  y = 860,
}) => {
  if (local < -n || local >= n) return null;
  const full = 9.5;
  if (local < 0) {
    const t = (local + n) / n;
    return <GloveShape x={x} y={y} s={0.05 + full * t * t} r={-40 + 40 * t} color={color} />;
  }
  const t = local / n;
  const hole = full * t * t;
  return (
    <g>
      <defs>
        <mask id="glove-hole">
          <rect x={-2000} y={-2000} width={5000} height={6000} fill="#fff" />
          <path d={GLOVE_PATH} transform={`translate(${x} ${y}) scale(${hole})`} fill="#000" />
        </mask>
      </defs>
      <rect x={-2000} y={-2000} width={5000} height={6000} fill={color} mask="url(#glove-hole)" />
    </g>
  );
};

/** Kleine Comic-Sterne/Linien um einen Treffer. */
export const ImpactLines: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number; readonly color?: string }> = ({ x, y, t, s = 1, color = "#FFF4D6" }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - t}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const c = Math.cos(rad(a));
        const si = Math.sin(rad(a));
        return <line key={a} x1={c * (40 + t * 60)} y1={si * (40 + t * 60)} x2={c * (90 + t * 90)} y2={si * (90 + t * 90)} stroke={color} strokeWidth={10} strokeLinecap="round" />;
      })}
    </g>
  );
};


/** Ausweis-/Lizenzkarte (ohne echtes Logo), reißt bei `tear` 0..1 entlang einer Zickzack-Linie auseinander. Mitte (x, y). */
export const LicenseCard: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly tear?: number; readonly title?: string }> = ({
  x,
  y,
  s = 1,
  r = 0,
  tear = 0,
  title = "LICENSE",
}) => {
  const half = (side: -1 | 1) => {
    const outer = side < 0 ? "M 0 -130 L -260 -130 L -260 130 L -8 130" : "M 0 -130 L 260 -130 L 260 130 L -8 130";
    const d = `${outer} L -8 130 L 16 80 L -16 30 L 18 -20 L -14 -70 L 20 -120 L 0 -130 Z`;
    return (
      <g key={side} transform={`translate(${side * tear * 70} ${tear * 30}) rotate(${side * tear * 14})`}>
        <defs>
          <clipPath id={`lic-${side}`}>
            <path d={d} />
          </clipPath>
        </defs>
        <g clipPath={`url(#lic-${side})`}>
          <rect x={-260} y={-130} width={520} height={260} rx={22} fill={PAPER.paper} />
          <rect x={-260} y={-130} width={520} height={70} fill="#2E3A55" />
          <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} letterSpacing={6} fill={PAPER.paper}>
            {title}
          </text>
          <rect x={-220} y={-30} width={130} height={140} rx={10} fill="#B9B2A4" />
          <circle cx={-155} cy={20} r={30} fill="#8E877A" />
          {[-20, 30, 80].map((ly) => (
            <rect key={ly} x={-60} y={ly} width={ly === 80 ? 200 : 270} height={18} rx={9} fill="#C9C1AF" />
          ))}
        </g>
        <path d={d} fill="none" stroke={PAPER.ink} strokeWidth={7} strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
      {half(-1)}
      {half(1)}
    </g>
  );
};
