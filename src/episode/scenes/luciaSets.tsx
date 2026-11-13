import React from "react";
import { blinkAt } from "../kit/motion";
import { clamp01, FONT, lerp, seeded } from "../kit2d";

/**
 * Kulissen + Figuren für „Who is Lucia from GTA 6?“ (scenes/lucia*.tsx), 2D-Comic/Paper-Cut als Akte „CASE FILE: LUCIA“.
 * Grenzen (Drehbuch `style`): eigene Cartoon-Figuren (LUCIA türkis, JASON pink, nie größer als Lucia), keine Logos,
 * kein GTA-/Rockstar-Schriftzug, keine Trailer-/Cover-Motive, Waffen gar nicht, Familie nur als unscharfe, nicht zählbare
 * Gruppe, Vater als gesichtslose Silhouette. Florida-/Leonida-Licht = freie Farbwahl (Pink/Türkis/Orange).
 * Bildregeln: HUD oben links bis y ≈ 372, Sticker ab y 402 (bis ≈ 560), Handlung y ≈ 600–1290, ab y ≈ 1300 Untertitel.
 * Kamera-Raster der Akte: Foto (9:16) Mitte (540, 700), 420 × 746,7 → bei Zoom `PHOTO_ZOOM` füllt es genau das Bild,
 * Inhalt des Fotos ist im Bildraum 1080 × 1920 gezeichnet (Cover = Foto = Loop-Ende, Portal in die Rückblende).
 */

export const LC = {
  ink: "#1A1220",
  skin: "#C98B62",
  skinShade: "#A86E4B",
  hair: "#1E1418",
  hairHi: "#3D2C34",
  teal: "#2EC4B6",
  tealDark: "#1C8D84",
  pink: "#FF4FA3",
  pinkDark: "#C2307A",
  orange: "#FF8C42",
  sand: "#D9A05B",
  sandDark: "#AD7A3A",
  yellow: "#FFD23F",
  red: "#FF3B3B",
  redDark: "#B8232C",
  plum: "#3B1D4E",
  night: "#22112E",
  manila: "#E9C98B",
  manilaDark: "#C49A55",
  paper: "#FFF8EA",
  denim: "#34446A",
  white: "#F6F2EA",
  grey: "#8A8794",
  greyDark: "#55525F",
  jSkin: "#E2B38B",
  jShade: "#C28F68",
  jHair: "#4A3020",
  wood: "#5A3626",
  woodDark: "#3E2419",
  cork: "#B98552",
  money: "#7FB07A",
} as const;

/** Text (SVG), Montserrat. */
export const LT: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly fill?: string;
  readonly anchor?: "start" | "middle" | "end";
  readonly weight?: number;
  readonly spacing?: number;
  readonly children: React.ReactNode;
  readonly o?: number;
  readonly r?: number;
}> = ({ x, y, size, fill = LC.ink, anchor = "middle", weight = 900, spacing = 1, children, o, r = 0 }) => (
  <text
    x={x}
    y={y}
    fontFamily={FONT}
    fontWeight={weight}
    fontSize={size}
    letterSpacing={spacing}
    textAnchor={anchor}
    fill={fill}
    opacity={o}
    transform={r ? `rotate(${r} ${x} ${y})` : undefined}
  >
    {children}
  </text>
);

/* ------------------------------------------------------------------ */
/* Figuren: LUCIA (Zopf + türkises Haarband) und JASON (pinkes Hemd)    */
/* ------------------------------------------------------------------ */

export type LArm = readonly [number, number];
type Build = { leg: number; torso: number; head: number; shW: number; hipW: number; waist: number; a1: number; a2: number; limb: number };
const BUILD: Record<"adult" | "teen" | "kid" | "jason", Build> = {
  adult: { leg: 250, torso: 184, head: 58, shW: 64, hipW: 52, waist: 44, a1: 100, a2: 96, limb: 27 },
  teen: { leg: 214, torso: 160, head: 57, shW: 56, hipW: 45, waist: 40, a1: 88, a2: 84, limb: 24 },
  kid: { leg: 142, torso: 118, head: 56, shW: 46, hipW: 38, waist: 38, a1: 64, a2: 60, limb: 22 },
  jason: { leg: 248, torso: 188, head: 58, shW: 80, hipW: 54, waist: 60, a1: 104, a2: 100, limb: 31 },
};
export type LAge = "kid" | "teen" | "adult";
export type LOutfit = "casual" | "overall" | "kid" | "teen" | "heist" | "jason";
const rad = (d: number) => (d * Math.PI) / 180;
const poly = (pts: readonly (readonly [number, number])[]) => pts.map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");

/** Kopfmitte relativ zum Fußpunkt (s = 1). */
export const toonHeadY = (who: "lucia" | "jason" = "lucia", age: LAge = "adult") => {
  const b = BUILD[who === "jason" ? "jason" : age];
  return -(b.leg + b.torso + 20 + b.head);
};
/** Handposition relativ zum Fußpunkt (s = 1, nicht gespiegelt). */
export const toonHand = (side: -1 | 1, arm: LArm, who: "lucia" | "jason" = "lucia", age: LAge = "adult") => {
  const b = BUILD[who === "jason" ? "jason" : age];
  const sh = -b.leg - b.torso;
  const s0: [number, number] = [side * (b.shW - 10), sh + 16];
  const e: [number, number] = [s0[0] + side * Math.sin(rad(arm[0])) * b.a1, s0[1] + Math.cos(rad(arm[0])) * b.a1];
  return [e[0] + side * Math.sin(rad(arm[0] + arm[1])) * b.a2, e[1] + Math.cos(rad(arm[0] + arm[1])) * b.a2] as const;
};

export const Toon: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly frame: number;
  readonly who?: "lucia" | "jason";
  readonly age?: LAge;
  readonly outfit?: LOutfit;
  readonly armL?: LArm;
  readonly armR?: LArm;
  readonly eyes?: "open" | "wide" | "closed" | "down" | "narrow";
  readonly mouth?: "flat" | "smile" | "smirk" | "o" | "frown" | "grit";
  readonly brows?: "neutral" | "up" | "sad" | "angry";
  /** Blickrichtung der Pupillen −1..1 */
  readonly look?: number;
  readonly lookY?: number;
  readonly blinkSeed?: number;
  readonly lean?: number;
  readonly headTilt?: number;
  /** Gehen: Schrittphase −1..1 */
  readonly step?: number;
  readonly walk?: boolean;
  readonly squash?: number;
  readonly flip?: boolean;
  /** Silhouette in dieser Farbe (Haarband bleibt türkis) */
  readonly sil?: string;
  readonly mask?: boolean;
  /** Trainingshandschuhe (Farbe) */
  readonly gloves?: string;
  readonly eyePop?: number;
  readonly o?: number;
  readonly breathe?: boolean;
  /** Wärme-/Gegenlicht: Kante in dieser Farbe (Sonnenuntergang) */
  readonly rim?: string;
}> = ({
  x,
  y,
  s = 1,
  frame,
  who = "lucia",
  age = "adult",
  outfit: outfitIn,
  armL = [10, 8],
  armR = [10, 8],
  eyes = "open",
  mouth = "flat",
  brows = "neutral",
  look = 0,
  lookY = 0,
  blinkSeed = 3,
  lean = 0,
  headTilt = 0,
  step = 0,
  walk = false,
  squash = 1,
  flip = false,
  sil,
  mask = false,
  gloves,
  eyePop = 1,
  o = 1,
  breathe = true,
  rim,
}) => {
  const isJ = who === "jason";
  const b = BUILD[isJ ? "jason" : age];
  const outfit: LOutfit = outfitIn ?? (isJ ? "jason" : age === "kid" ? "kid" : age === "teen" ? "teen" : "casual");
  const ink = LC.ink;
  const skin = sil ?? (isJ ? LC.jSkin : LC.skin);
  const shade = isJ ? LC.jShade : LC.skinShade;
  const hairC = sil ?? (isJ ? LC.jHair : LC.hair);
  const br = breathe ? Math.sin(frame * 0.1 + blinkSeed) * 2.5 : 0;
  const hipY = -b.leg;
  const sh = hipY - b.torso + br;
  const hr = b.head;
  const headC = sh - 20 - hr;
  const wy = sh + b.torso * 0.6;
  const sw = walk ? step : 0;

  const pal = (() => {
    switch (outfit) {
      case "overall":
        return { top: LC.sand, sleeveU: LC.sand, sleeveL: LC.sand, sleeveLen: 0.55, leg: LC.sand, shoe: "#2B2430", bottom: LC.sand };
      case "kid":
        return { top: "#F7D774", sleeveU: "#F7D774", sleeveL: skin, sleeveLen: 0, leg: skin, shoe: LC.white, bottom: "#3A4660" };
      case "teen":
        return { top: "#8C8A99", sleeveU: "#8C8A99", sleeveL: "#8C8A99", sleeveLen: 1, leg: LC.denim, shoe: LC.white, bottom: LC.denim };
      case "heist":
        return { top: "#2A2433", sleeveU: "#2A2433", sleeveL: "#2A2433", sleeveLen: 1, leg: "#221D2A", shoe: "#141018", bottom: "#221D2A" };
      case "jason":
        return { top: LC.pink, sleeveU: LC.pink, sleeveL: skin, sleeveLen: 0, leg: "#3C4A66", shoe: "#2B2430", bottom: "#3C4A66" };
      default:
        return { top: LC.white, sleeveU: LC.teal, sleeveL: LC.teal, sleeveLen: 1, leg: LC.denim, shoe: LC.white, bottom: LC.denim };
    }
  })();
  const S = (c: string) => sil ?? c;

  // Beine
  const legPts = (side: -1 | 1): [number, number][] => {
    const lift = walk ? Math.max(0, side * sw) * 26 : 0;
    return [
      [side * b.hipW * 0.55, hipY],
      [side * b.hipW * 0.62 + side * sw * 16, hipY / 2 - lift * 0.6],
      [side * b.hipW * 0.66 + side * sw * 34, -lift],
    ];
  };
  const leg = (side: -1 | 1) => {
    const pts = legPts(side);
    const f = pts[2];
    const w = b.limb + (outfit === "kid" ? 0 : 6);
    return (
      <g key={`leg${side}`}>
        <path d={poly(pts)} stroke={ink} strokeWidth={w + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={poly(pts)} stroke={S(pal.leg)} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={`M ${f[0] - b.limb * 0.6} ${f[1] - b.limb * 0.9} L ${f[0] + b.limb * 0.6} ${f[1] - b.limb * 0.9} Q ${f[0] + side * 10 + b.limb * 0.95} ${f[1] - 6} ${f[0] + side * 16 + b.limb * 0.8} ${f[1] + 6} L ${f[0] + side * 16 - b.limb * 0.8} ${f[1] + 6} Q ${f[0] - b.limb * 0.8} ${f[1] - 4} ${f[0] - b.limb * 0.6} ${f[1] - b.limb * 0.9} Z`}
          fill={S(pal.shoe)}
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {sil ? null : <path d={`M ${f[0] + side * 16 - b.limb * 0.8} ${f[1] + 2} L ${f[0] + side * 16 + b.limb * 0.8} ${f[1] + 2}`} stroke={pal.shoe === LC.white ? "#B9B2A6" : "#000"} strokeWidth={5} />}
      </g>
    );
  };

  // Arme
  const armPts = (side: -1 | 1, a: LArm): [number, number][] => {
    const s0: [number, number] = [side * (b.shW - 10), sh + 16];
    const e: [number, number] = [s0[0] + side * Math.sin(rad(a[0])) * b.a1, s0[1] + Math.cos(rad(a[0])) * b.a1];
    const h: [number, number] = [e[0] + side * Math.sin(rad(a[0] + a[1])) * b.a2, e[1] + Math.cos(rad(a[0] + a[1])) * b.a2];
    return [s0, e, h];
  };
  const arm = (side: -1 | 1, a: LArm) => {
    const pts = armPts(side, a);
    const hand = pts[2];
    const lowerEnd: [number, number] = [lerp(pts[1][0], pts[2][0], pal.sleeveLen), lerp(pts[1][1], pts[2][1], pal.sleeveLen)];
    const upperHalf: [number, number] = [lerp(pts[0][0], pts[1][0], 0.6), lerp(pts[0][1], pts[1][1], 0.6)];
    const w = b.limb;
    return (
      <g key={`arm${side}`}>
        <path d={poly(pts)} stroke={ink} strokeWidth={w + 10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={poly(pts)} stroke={skin} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {outfit === "kid" || outfit === "jason" ? (
          <path d={poly([pts[0], upperHalf])} stroke={S(pal.sleeveU)} strokeWidth={w + 8} strokeLinecap="round" />
        ) : (
          <>
            <path d={poly([pts[0], pts[1]])} stroke={S(pal.sleeveU)} strokeWidth={w + 4} strokeLinecap="round" />
            {pal.sleeveLen > 0 ? <path d={poly([pts[1], lowerEnd])} stroke={S(pal.sleeveL)} strokeWidth={w + 2} strokeLinecap="round" /> : null}
            {outfit === "casual" && !sil ? <circle cx={lowerEnd[0]} cy={lowerEnd[1]} r={w * 0.55} fill={LC.tealDark} stroke={ink} strokeWidth={4} /> : null}
          </>
        )}
        {gloves ? (
          <g transform={`translate(${hand[0]} ${hand[1]})`}>
            <ellipse rx={w * 1.3} ry={w * 1.4} fill={S(gloves)} stroke={ink} strokeWidth={6} />
            <ellipse cx={side * -w * 0.7} cy={-w * 0.2} rx={w * 0.5} ry={w * 0.7} fill={S(gloves)} stroke={ink} strokeWidth={5} />
            {sil ? null : <ellipse cx={side * 6} cy={-w * 0.6} rx={w * 0.4} ry={w * 0.22} fill="#FFFFFF" opacity={0.3} />}
            <rect x={-w * 0.9} y={w * 1.05} width={w * 1.8} height={w * 0.7} rx={6} fill={S(LC.white)} stroke={ink} strokeWidth={5} />
          </g>
        ) : (
          <circle cx={hand[0]} cy={hand[1]} r={w * 0.62} fill={skin} stroke={ink} strokeWidth={5} />
        )}
      </g>
    );
  };

  // Rumpf
  const torsoD = isJ
    ? `M ${-b.shW} ${sh + 10} Q ${-b.shW} ${sh - 8} ${-b.shW + 22} ${sh - 10} L ${b.shW - 22} ${sh - 10} Q ${b.shW} ${sh - 8} ${b.shW} ${sh + 10} L ${b.waist + 4} ${hipY + 6} L ${-b.waist - 4} ${hipY + 6} Z`
    : `M ${-b.shW} ${sh + 10} Q ${-b.shW} ${sh - 8} ${-b.shW + 20} ${sh - 10} L ${b.shW - 20} ${sh - 10} Q ${b.shW} ${sh - 8} ${b.shW} ${sh + 10} L ${b.waist} ${wy} L ${b.hipW + 4} ${hipY + 6} L ${-b.hipW - 4} ${hipY + 6} L ${-b.waist} ${wy} Z`;
  const lowerD = `M ${-b.waist - 2} ${wy} L ${b.waist + 2} ${wy} L ${b.hipW + 6} ${hipY + 8} L ${-b.hipW - 6} ${hipY + 8} Z`;

  // Kopf
  const blink = !sil && !mask && (eyes === "closed" || blinkAt(frame, blinkSeed));
  const eyeY = headC + hr * 0.06;
  const eyeR = (eyes === "wide" ? 1.3 : 1) * eyePop;
  const pdx = look * 6;
  const pdy = (eyes === "down" ? 6 : 0) + lookY * 5;
  const browY = eyeY - hr * 0.42;
  const browIn = brows === "sad" ? -8 : brows === "angry" ? 8 : brows === "up" ? -10 : 0;
  const browOut = brows === "sad" ? 5 : brows === "angry" ? -5 : brows === "up" ? -10 : 0;
  const mY = headC + hr * 0.52;
  const lip = isJ ? ink : "#7A2E3A";
  const mouthEl =
    mouth === "o" ? (
      <ellipse cx={0} cy={mY + 2} rx={9} ry={12} fill={ink} />
    ) : mouth === "smile" ? (
      <path d={`M -17 ${mY - 4} Q 0 ${mY + 13} 17 ${mY - 4}`} stroke={lip} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "smirk" ? (
      <path d={`M -14 ${mY + 2} Q 4 ${mY + 6} 17 ${mY - 6}`} stroke={lip} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "frown" ? (
      <path d={`M -15 ${mY + 6} Q 0 ${mY - 6} 15 ${mY + 6}`} stroke={lip} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "grit" ? (
      <rect x={-17} y={mY - 6} width={34} height={13} rx={4} fill="#F3EEE4" stroke={ink} strokeWidth={5} />
    ) : (
      <path d={`M -12 ${mY} L 12 ${mY}`} stroke={lip} strokeWidth={6} strokeLinecap="round" />
    );
  const eye = (side: -1 | 1) => (
    <g key={`eye${side}`} transform={`translate(${side * hr * 0.37} ${eyeY}) scale(${eyeR})`}>
      {blink ? (
        <path d="M -12 0 Q 0 6 12 0" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse rx={12} ry={eyes === "narrow" ? 7 : eyes === "down" ? 10 : 14} fill="#FBF8F2" stroke={ink} strokeWidth={4} />
          <circle cx={pdx} cy={pdy * 0.6} r={eyes === "narrow" ? 5.5 : 6.8} fill={isJ ? "#3B2A1C" : "#2A1A12"} />
          <circle cx={pdx + 2} cy={pdy * 0.6 - 2.5} r={2} fill="#FFFFFF" />
          {isJ ? null : (
            <>
              <path d={`M -13 ${eyes === "narrow" ? -4 : -6} Q 0 ${eyes === "narrow" ? -11 : -17} 13 ${eyes === "narrow" ? -4 : -6}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
              <path d={`M ${side * 12} -6 L ${side * 20} -13`} stroke={ink} strokeWidth={4} strokeLinecap="round" />
            </>
          )}
        </>
      )}
    </g>
  );

  // Haare
  const backHair =
    !isJ ? <ellipse cx={0} cy={headC + hr * 0.22} rx={hr * 1.13} ry={hr * 1.14} fill={hairC} stroke={ink} strokeWidth={6} /> : null;
  const braidPts = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    const bx = lerp(lerp(hr * 0.78, b.shW * 0.7, t), lerp(b.shW * 0.7, b.shW * 0.42, t), t) + Math.sin(frame * 0.07 + i * 0.6) * 1.5;
    const by = lerp(lerp(headC + hr * 0.75, sh + 20, t), lerp(sh + 20, sh + b.torso * 0.62, t), t);
    return [bx, by] as const;
  });
  const braid = !isJ ? (
    <g>
      {braidPts.map(([bx, by], i) => (
        <ellipse key={i} cx={bx} cy={by} rx={b.limb * (0.62 - i * 0.03)} ry={b.limb * 0.78} fill={hairC} stroke={ink} strokeWidth={4} transform={`rotate(${i % 2 ? 18 : -18} ${bx} ${by})`} />
      ))}
      {sil ? null : braidPts.map(([bx, by], i) => <path key={`h${i}`} d={`M ${bx - 6} ${by - 8} Q ${bx} ${by - 2} ${bx + 6} ${by - 8}`} stroke={LC.hairHi} strokeWidth={3} fill="none" />)}
      <rect x={braidPts[6][0] - b.limb * 0.5} y={braidPts[6][1] + b.limb * 0.5} width={b.limb} height={b.limb * 0.42} rx={4} fill={LC.teal} stroke={ink} strokeWidth={4} />
      <path
        d={`M ${braidPts[6][0] - b.limb * 0.4} ${braidPts[6][1] + b.limb * 0.92} Q ${braidPts[6][0]} ${braidPts[6][1] + b.limb * 2.1} ${braidPts[6][0] + b.limb * 0.4} ${braidPts[6][1] + b.limb * 0.92} Z`}
        fill={hairC}
        stroke={ink}
        strokeWidth={4}
      />
    </g>
  ) : null;
  const frontHair = isJ ? (
    <path
      d={`M ${-hr * 0.98} ${headC - hr * 0.08} Q ${-hr * 1.06} ${headC - hr * 1.1} ${-hr * 0.1} ${headC - hr * 1.12} Q ${hr * 0.5} ${headC - hr * 1.32} ${hr * 0.9} ${headC - hr * 0.92} Q ${hr * 1.06} ${headC - hr * 0.6} ${hr * 0.98} ${headC - hr * 0.1} Q ${hr * 0.72} ${headC - hr * 0.62} ${hr * 0.1} ${headC - hr * 0.66} Q ${-hr * 0.6} ${headC - hr * 0.6} ${-hr * 0.98} ${headC - hr * 0.08} Z`}
      fill={hairC}
      stroke={ink}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  ) : (
    <g>
      <path
        d={`M ${-hr * 1.02} ${headC + hr * 0.42} Q ${-hr * 1.12} ${headC - hr * 1.12} ${hr * 0.05} ${headC - hr * 1.1} Q ${hr * 1.12} ${headC - hr * 1.04} ${hr * 1.02} ${headC + hr * 0.36} L ${hr * 0.84} ${headC + hr * 0.4} Q ${hr * 0.86} ${headC - hr * 0.4} ${hr * 0.22} ${headC - hr * 0.62} Q ${-hr * 0.4} ${headC - hr * 0.3} ${-hr * 0.82} ${headC - hr * 0.2} L ${-hr * 0.84} ${headC + hr * 0.46} Z`}
        fill={hairC}
        stroke={ink}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {sil ? null : <path d={`M ${-hr * 0.5} ${headC - hr * 0.86} Q ${hr * 0.1} ${headC - hr * 1.0} ${hr * 0.6} ${headC - hr * 0.8}`} stroke={LC.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />}
      {/* Haarband: das Erkennungsmerkmal (auch auf der Silhouette türkis) */}
      <path d={`M ${-hr * 1.0} ${headC - hr * 0.42} Q 0 ${headC - hr * 1.28} ${hr * 1.0} ${headC - hr * 0.42}`} stroke={ink} strokeWidth={hr * 0.32} fill="none" strokeLinecap="round" />
      <path d={`M ${-hr * 1.0} ${headC - hr * 0.42} Q 0 ${headC - hr * 1.28} ${hr * 1.0} ${headC - hr * 0.42}`} stroke={LC.teal} strokeWidth={hr * 0.2} fill="none" strokeLinecap="round" />
    </g>
  );

  const head = (
    <g transform={`rotate(${headTilt} 0 ${sh - 8})`}>
      {backHair}
      <rect x={-b.limb * 0.5} y={sh - 32} width={b.limb} height={40} fill={skin} stroke={ink} strokeWidth={5} />
      {[-1, 1].map((sd) => (
        <circle key={sd} cx={sd * hr * 0.97} cy={headC + 8} r={hr * 0.2} fill={skin} stroke={ink} strokeWidth={5} />
      ))}
      <ellipse cx={0} cy={headC} rx={hr * (isJ ? 1 : 0.94)} ry={hr} fill={skin} stroke={ink} strokeWidth={6} />
      {sil ? null : (
        <>
          <path d={`M ${-hr * 0.88} ${headC + hr * 0.25} Q 0 ${headC + hr * 1.12} ${hr * 0.88} ${headC + hr * 0.25} Q 0 ${headC + hr * 0.9} ${-hr * 0.88} ${headC + hr * 0.25} Z`} fill={shade} opacity={0.45} />
          {isJ ? (
            <g opacity={0.5}>
              <path d={`M ${-hr * 0.8} ${headC + hr * 0.3} Q 0 ${headC + hr * 1.18} ${hr * 0.8} ${headC + hr * 0.3} Q 0 ${headC + hr * 0.82} ${-hr * 0.8} ${headC + hr * 0.3} Z`} fill="#5A4030" opacity={0.35} />
              {Array.from({ length: 14 }, (_, i) => (
                <circle key={i} cx={-hr * 0.6 + (i % 7) * hr * 0.2} cy={headC + hr * (0.66 + Math.floor(i / 7) * 0.14) + Math.abs((i % 7) - 3) * -3} r={2.4} fill="#3B2A1C" />
              ))}
            </g>
          ) : (
            [-1, 1].map((sd) => <ellipse key={`c${sd}`} cx={sd * hr * 0.52} cy={headC + hr * 0.36} rx={hr * 0.16} ry={hr * 0.09} fill="#E0705F" opacity={0.35} />)
          )}
          {eye(-1)}
          {eye(1)}
          {[-1, 1].map((sd) => (
            <path
              key={`b${sd}`}
              d={`M ${sd * hr * 0.14} ${browY + browIn} Q ${sd * hr * 0.36} ${browY + Math.min(browIn, browOut) - 6} ${sd * hr * 0.58} ${browY + browOut}`}
              stroke={isJ ? LC.jHair : ink}
              strokeWidth={isJ ? 9 : 7}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <path d={`M -4 ${eyeY + hr * 0.36} Q 0 ${eyeY + hr * 0.44} 6 ${eyeY + hr * 0.36}`} stroke={shade} strokeWidth={5} fill="none" strokeLinecap="round" />
          {mouthEl}
        </>
      )}
      {mask ? (
        <g>
          <rect x={-hr * 1.04} y={eyeY - 17} width={hr * 2.08} height={34} rx={14} fill="#121016" stroke={ink} strokeWidth={4} />
          {[-1, 1].map((sd) => (
            <ellipse key={sd} cx={sd * hr * 0.37} cy={eyeY} rx={11 * eyeR} ry={9 * eyeR} fill="#FBF8F2" />
          ))}
          {[-1, 1].map((sd) => (
            <circle key={`p${sd}`} cx={sd * hr * 0.37 + pdx * 0.7} cy={eyeY} r={4.5} fill={ink} />
          ))}
        </g>
      ) : null}
      {frontHair}
    </g>
  );

  // Kleidung über dem Rumpf
  const clothes = (() => {
    if (sil) return null;
    if (outfit === "casual")
      return (
        <g>
          {[-1, 1].map((sd) => (
            <path
              key={sd}
              d={`M ${sd * b.shW} ${sh + 10} Q ${sd * b.shW} ${sh - 8} ${sd * (b.shW - 20)} ${sh - 10} L ${sd * 22} ${sh - 6} L ${sd * 16} ${wy - 4} L ${sd * (b.waist + 6)} ${wy + 6} Z`}
              fill={LC.teal}
              stroke={ink}
              strokeWidth={5}
              strokeLinejoin="round"
            />
          ))}
          {[-1, 1].map((sd) => (
            <path key={`l${sd}`} d={`M ${sd * 22} ${sh - 6} L ${sd * 40} ${sh + 40} L ${sd * 18} ${sh + 56} Z`} fill={LC.tealDark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          ))}
          <path d={lowerD} fill={LC.denim} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-b.waist - 2} y={wy - 2} width={b.waist * 2 + 4} height={12} fill="#2A2032" />
          <rect x={-8} y={wy - 3} width={16} height={14} rx={2} fill={LC.yellow} stroke={ink} strokeWidth={3} />
        </g>
      );
    if (outfit === "overall")
      return (
        <g>
          <path d={`M -26 ${sh - 8} L 0 ${sh + 40} L 26 ${sh - 8}`} fill={LC.sandDark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M 0 ${sh + 40} L 0 ${hipY - 6}`} stroke={LC.sandDark} strokeWidth={5} />
          <rect x={-b.shW * 0.62} y={sh + 50} width={36} height={30} rx={4} fill="none" stroke={LC.sandDark} strokeWidth={4} />
          <path d={`M ${-b.waist} ${wy} L ${b.waist} ${wy}`} stroke={LC.sandDark} strokeWidth={6} />
        </g>
      );
    if (outfit === "kid")
      return (
        <path
          d={`M ${-b.hipW - 6} ${hipY - 22} L ${b.hipW + 6} ${hipY - 22} L ${b.hipW + 14} ${hipY + 52} L 6 ${hipY + 56} L 0 ${hipY + 22} L -6 ${hipY + 56} L ${-b.hipW - 14} ${hipY + 52} Z`}
          fill="#3A4660"
          stroke={ink}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      );
    if (outfit === "teen")
      return (
        <g>
          <path d={lowerD} fill={LC.denim} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M -30 ${sh - 6} Q 0 ${sh + 30} 30 ${sh - 6}`} stroke="#6E6C7A" strokeWidth={8} fill="none" />
        </g>
      );
    if (outfit === "jason")
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const rnd = seeded(40 + i);
            const px = (rnd() - 0.5) * b.shW * 1.5;
            const py = sh + 20 + rnd() * (b.torso - 50);
            return (
              <g key={i} transform={`translate(${px} ${py})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={Math.cos(rad(a)) * 7} cy={Math.sin(rad(a)) * 7} rx={5} ry={3.4} fill="#FFE1EF" transform={`rotate(${a} ${Math.cos(rad(a)) * 7} ${Math.sin(rad(a)) * 7})`} />
                ))}
              </g>
            );
          })}
          <path d={`M -30 ${sh - 8} L 0 ${sh + 44} L 30 ${sh - 8}`} fill={skin} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 30} ${sh - 8} L ${sd * 52} ${sh + 30} L ${sd * 10} ${sh + 34} Z`} fill={LC.pinkDark} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
          ))}
          <path d={`M ${-b.waist - 4} ${hipY - 34} L ${b.waist + 4} ${hipY - 34} L ${b.hipW + 6} ${hipY + 8} L ${-b.hipW - 6} ${hipY + 8} Z`} fill="#3C4A66" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      );
    return null;
  })();

  const sq = Math.max(0.3, squash);
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${(s / Math.sqrt(sq)) * (flip ? -1 : 1)} ${s * sq})`} opacity={o} filter="url(#paper)">
      {leg(-1)}
      {leg(1)}
      <path d={torsoD} fill={S(pal.top)} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      {clothes}
      {head}
      {braid}
      {arm(-1, armL)}
      {arm(1, armR)}
      {rim ? (
        <path
          d={`M ${b.shW + 4} ${sh + 14} L ${b.waist + 4} ${wy} L ${b.hipW + 6} ${hipY + 4} M ${hr * 0.9} ${headC - hr * 0.5} Q ${hr * 1.1} ${headC} ${hr * 0.86} ${headC + hr * 0.5}`}
          stroke={rim}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Florida-/Leonida-Licht                                              */
/* ------------------------------------------------------------------ */

/** Palme als Scherenschnitt (Fußpunkt). */
export const Palm: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lean?: number; readonly color?: string; readonly sway?: number }> = ({
  x,
  y,
  s = 1,
  lean = 8,
  color = "#2A0F35",
  sway = 0,
}) => {
  const tx = Math.sin(rad(lean)) * 600;
  const top: [number, number] = [tx, -600];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -22 0 Q ${tx * 0.3 - 30} -300 ${top[0] - 9} ${top[1]} L ${top[0] + 9} ${top[1]} Q ${tx * 0.3 + 30} -300 22 0 Z`} fill={color} />
      {[-150, -110, -60, -20, 25, 70, 120, 165].map((a, i) => {
        const ang = rad(a - 90 + sway * (i % 2 ? 1 : -1));
        const len = 230 - Math.abs(a) * 0.35;
        const ex = top[0] + Math.cos(ang) * len;
        const ey = top[1] + Math.sin(ang) * len * 0.75 + 60;
        const mx = top[0] + Math.cos(ang) * len * 0.5;
        const my = top[1] + Math.sin(ang) * len * 0.5 - 40;
        return <path key={a} d={`M ${top[0]} ${top[1]} Q ${mx} ${my - 30} ${ex} ${ey} Q ${mx + 10} ${my + 20} ${top[0]} ${top[1] + 12} Z`} fill={color} />;
      })}
    </g>
  );
};

/** Sonnenuntergang (Weltraum-Koordinaten = Bildraum 1080 × 1920): Himmel, gestreifte Sonne, Meer. `red` 0..1 färbt rot. */
export const Sunset: React.FC<{ readonly id: string; readonly horizon?: number; readonly sunX?: number; readonly sunR?: number; readonly red?: number; readonly f: number; readonly sea?: boolean; readonly w?: number }> = ({
  id,
  horizon = 1250,
  sunX = 700,
  sunR = 230,
  red = 0,
  f,
  sea = true,
  w = 1080,
}) => {
  const sunA = lerp2c("#FFE07A", "#FF5A4A", red);
  const sunB = lerp2c("#FF7A59", "#B8132C", red);
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1={horizon - 1500} x2="0" y2={horizon} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={lerp2c("#24103A", "#2A0A1E", red)} />
          <stop offset="0.45" stopColor={lerp2c("#6B2A72", "#7A1838", red)} />
          <stop offset="0.8" stopColor={lerp2c("#FF5F7E", "#E8343F", red)} />
          <stop offset="1" stopColor={lerp2c("#FFB36B", "#FF6A3D", red)} />
        </linearGradient>
        <linearGradient id={`sun-${id}`} x1="0" y1={horizon - sunR * 1.6} x2="0" y2={horizon} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={sunA} />
          <stop offset="1" stopColor={sunB} />
        </linearGradient>
        <linearGradient id={`sea-${id}`} x1="0" y1={horizon} x2="0" y2={horizon + 700} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={lerp2c("#8A3A7A", "#7A1A30", red)} />
          <stop offset="1" stopColor="#1E0E2C" />
        </linearGradient>
      </defs>
      <rect x={-3000} y={horizon - 4000} width={w + 6000} height={4000} fill={`url(#sky-${id})`} />
      <circle cx={sunX} cy={horizon - sunR * 0.55} r={sunR * 1.6} fill={sunA} opacity={0.18} />
      <circle cx={sunX} cy={horizon - sunR * 0.55} r={sunR} fill={`url(#sun-${id})`} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={sunX - sunR - 10} y={horizon - sunR * 0.55 + sunR * (0.12 + i * 0.17)} width={sunR * 2 + 20} height={6 + i * 4} fill={lerp2c("#FF5F7E", "#C8203A", red)} />
      ))}
      {sea ? (
        <>
          <rect x={-3000} y={horizon} width={w + 6000} height={3000} fill={`url(#sea-${id})`} />
          {Array.from({ length: 7 }, (_, i) => (
            <rect
              key={i}
              x={sunX - sunR * (0.9 - i * 0.1) + Math.sin(f * 0.06 + i) * 14}
              y={horizon + 24 + i * 34}
              width={sunR * 2 * (0.9 - i * 0.1)}
              height={9}
              rx={4}
              fill={sunA}
              opacity={0.5 - i * 0.05}
            />
          ))}
        </>
      ) : null}
    </g>
  );
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** Farbe mischen (#RRGGBB). */
export const lerp2c = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = clamp01(t);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
};

/** Gitterstäbe (vertikal), x von x0 in Abständen `gap`. */
export const Bars: React.FC<{ readonly x0: number; readonly n: number; readonly gap: number; readonly y0: number; readonly y1: number; readonly w?: number; readonly color?: string; readonly cross?: readonly number[] }> = ({
  x0,
  n,
  gap,
  y0,
  y1,
  w = 34,
  color = "#1C1622",
  cross = [],
}) => (
  <g filter="url(#paper)">
    {Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <rect x={x0 + i * gap - w / 2} y={y0} width={w} height={y1 - y0} rx={w / 2} fill={color} stroke={LC.ink} strokeWidth={5} />
        <rect x={x0 + i * gap - w / 2 + 7} y={y0 + 10} width={6} height={y1 - y0 - 20} rx={3} fill="#FFFFFF" opacity={0.18} />
      </g>
    ))}
    {cross.map((cy) => (
      <rect key={cy} x={x0 - gap * 0.4} y={cy - w * 0.45} width={gap * (n - 0.2)} height={w * 0.9} rx={8} fill={color} stroke={LC.ink} strokeWidth={5} />
    ))}
  </g>
);

/** Jalousie-Lichtstreifen (Film-noir, Florida-Abendlicht) – nur Licht, keine Form. */
export const BlindLight: React.FC<{ readonly x: number; readonly y: number; readonly o?: number; readonly color?: string; readonly n?: number }> = ({ x, y, o = 0.22, color = "#FF9E6B", n = 7 }) => (
  <g opacity={o} transform={`translate(${x} ${y}) skewX(-28)`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-600} y={i * 110} width={1700} height={54} fill={color} />
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/* Cover / Foto-Inhalt (Bildraum 1080 × 1920)                           */
/* ------------------------------------------------------------------ */

/** Cover-Motiv: Lucia (Overall, türkises Haarband, Zopf) blickt durch Gitterstäbe ins Abendlicht; Palmen, gestreifte Sonne. */
export const CoverArt: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Sunset id="cover" f={f} horizon={1330} sunX={760} sunR={250} />
    <Palm x={60} y={1500} s={1.25} lean={10} sway={2 * Math.sin(f * 0.05)} />
    <Palm x={1010} y={1460} s={1.05} lean={-12} sway={2 * Math.sin(f * 0.05 + 1)} />
    <Toon x={470} y={2330} s={2.5} frame={f} outfit="overall" look={0.9} lookY={-0.2} brows="angry" mouth="flat" blinkSeed={9} headTilt={-3} rim="#FFB36B" breathe={false} />
    <Bars x0={-120} n={5} gap={300} y0={-40} y1={1960} w={40} cross={[1640]} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Akte                                                                 */
/* ------------------------------------------------------------------ */

export const PHOTO = { x: 540, y: 700, w: 420, h: 746.67 } as const;
/** Zoom, bei dem das Foto genau das Bild füllt (1080/420). */
export const PHOTO_ZOOM = 1080 / PHOTO.w;

/** Schreibtisch (dunkles Holz) mit Jalousie-Licht. */
export const Desk: React.FC<{ readonly id: string; readonly f: number; readonly warm?: number }> = ({ id, f, warm = 1 }) => (
  <g>
    <defs>
      <radialGradient id={`lamp-${id}`} cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#7A4A36" />
        <stop offset="1" stopColor="#2A1620" />
      </radialGradient>
    </defs>
    <rect x={-3000} y={-3000} width={7000} height={7000} fill={`url(#lamp-${id})`} />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M -3000 ${-900 + i * 230} Q 540 ${-880 + i * 230 + 30 * Math.sin(i)} 4000 ${-900 + i * 230}`} stroke="#000" strokeWidth={4} opacity={0.12} fill="none" />
    ))}
    <BlindLight x={-200} y={-200 + Math.sin(f * 0.02) * 10} o={0.16 * warm} n={22} />
  </g>
);

/** Aktenmappe mit Blatt: Reiter „LUCIA“, Kopf „CASE FILE“, Foto (Inhalt als children im Bildraum 1080 × 1920), Felder. */
export const CaseFile: React.FC<{
  readonly f: number;
  readonly photo: React.ReactNode;
  readonly reason?: string;
  readonly reasonQ?: number;
  readonly clipId: string;
}> = ({ f, photo, reason = "?", reasonQ = 0, clipId }) => {
  const k = PHOTO.w / 1080;
  const px = PHOTO.x - PHOTO.w / 2;
  const py = PHOTO.y - PHOTO.h / 2;
  return (
    <g>
      {/* Mappe */}
      <g filter="url(#paper)">
        <path d="M 30 150 L 330 150 L 370 210 L 1050 210 L 1050 1520 L 30 1520 Z" fill={LC.manila} stroke={LC.ink} strokeWidth={7} strokeLinejoin="round" />
        <LT x={70} y={200} size={36} anchor="start" spacing={4} fill="#6B4A1E">
          LUCIA
        </LT>
      </g>
      {/* Blatt */}
      <g filter="url(#paper)" transform="rotate(-1.2 540 860)">
        <rect x={80} y={240} width={920} height={1250} fill={LC.paper} stroke={LC.ink} strokeWidth={6} />
        <LT x={120} y={300} size={34} anchor="start" spacing={6} fill="#9A3A2E">
          CASE FILE
        </LT>
        <LT x={960} y={300} size={26} anchor="end" spacing={2} fill="#8A8794" weight={700}>
          NO. L-01
        </LT>
        <path d="M 120 318 L 960 318" stroke={LC.ink} strokeWidth={3} />
        <LT x={120} y={1160} size={40} anchor="start" fill="#55525F" weight={800}>
          NAME:
        </LT>
        <LT x={290} y={1160} size={52} anchor="start" fill={LC.tealDark}>
          LUCIA
        </LT>
        <path d="M 280 1176 L 960 1176" stroke="#C9C1B0" strokeWidth={3} />
        <LT x={120} y={1260} size={40} anchor="start" fill="#55525F" weight={800}>
          REASON:
        </LT>
        <g transform={`translate(330 1262) scale(${0.6 + 0.4 * reasonQ})`} opacity={reasonQ > 0 ? 1 : 0.35}>
          <LT x={0} y={0} size={reason.length > 6 ? 40 : 64} anchor="start" fill={reasonQ > 0 ? LC.red : "#B5AD9C"}>
            {reason}
          </LT>
        </g>
        <path d="M 320 1276 L 960 1276" stroke="#C9C1B0" strokeWidth={3} />
        {[1330, 1380, 1430].map((ly) => (
          <path key={ly} d={`M 120 ${ly} L ${520 + (ly % 7) * 50} ${ly}`} stroke="#DDD5C4" strokeWidth={10} strokeLinecap="round" />
        ))}
      </g>
      {/* Foto mit weißem Rand + Büroklammer */}
      <g filter="url(#paper)">
        <rect x={px - 18} y={py - 18} width={PHOTO.w + 36} height={PHOTO.h + 36} fill="#FFFFFF" stroke={LC.ink} strokeWidth={5} />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect x={px} y={py} width={PHOTO.w} height={PHOTO.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${px} ${py}) scale(${k})`}>{photo}</g>
      </g>
      <rect x={px} y={py} width={PHOTO.w} height={PHOTO.h} fill="none" stroke={LC.ink} strokeWidth={3} />
      <path
        d={`M ${px + 60} ${py - 50} L ${px + 60} ${py + 60} Q ${px + 60} ${py + 80} ${px + 80} ${py + 80} Q ${px + 100} ${py + 80} ${px + 100} ${py + 60} L ${px + 100} ${py - 30}`}
        stroke="#9AA2AE"
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
        opacity={0.95 + 0.0 * f}
      />
    </g>
  );
};

/** Gummistempel (schlägt ein, `t` 0..1). */
export const Stamp: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly t: number; readonly r?: number; readonly color?: string; readonly size?: number; readonly sub?: string }> = ({
  x,
  y,
  text,
  t,
  r = -10,
  color = LC.red,
  size = 64,
  sub,
}) => {
  if (t <= 0) return null;
  const k = 1 + (1 - Math.min(1, t)) * 1.6;
  const width = text.length * size * 0.74 + 70;
  const h = size * (sub ? 2.2 : 1.6);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`} opacity={Math.min(1, t * 2)}>
      <rect x={-width / 2} y={-size * 0.95} width={width} height={h} rx={12} fill="#FFFFFF" fillOpacity={0.6} stroke={color} strokeWidth={10} />
      <rect x={-width / 2 + 12} y={-size * 0.95 + 12} width={width - 24} height={h - 24} rx={6} fill="none" stroke={color} strokeWidth={3} />
      <LT x={0} y={size * 0.36} size={size} fill={color} spacing={3}>
        {text}
      </LT>
      {sub ? (
        <LT x={0} y={size * 1.0} size={size * 0.42} fill={color} spacing={2}>
          {sub}
        </LT>
      ) : null}
    </g>
  );
};

/** Notizzettel (gelb) mit Klebestreifen. */
export const PostIt: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly lines: readonly string[]; readonly fill?: string; readonly fg?: string; readonly size?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  lines,
  fill = "#FFE58A",
  fg = LC.ink,
  size = 46,
}) => {
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.72 + 70;
  const h = lines.length * size * 1.18 + 56;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={LC.ink} strokeWidth={5} />
      <rect x={-50} y={-h / 2 - 18} width={100} height={34} fill="#FFFFFF" opacity={0.6} transform="rotate(-4)" />
      {lines.map((l, i) => (
        <LT key={l} x={0} y={-((lines.length - 1) * size * 1.18) / 2 + i * size * 1.18 + size * 0.36} size={size} fill={fg}>
          {l}
        </LT>
      ))}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Requisiten                                                           */
/* ------------------------------------------------------------------ */

/** Vierblättriges Kleeblatt (Glück) – als Sticker. */
export const Clover: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly glow?: number }> = ({ x, y, s = 1, r = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
    {glow > 0 ? <circle r={150} fill="#B6FF9C" opacity={0.35 * glow} /> : null}
    <path d="M 0 20 Q 10 90 -20 150" stroke="#2E7D32" strokeWidth={14} fill="none" strokeLinecap="round" />
    {[0, 90, 180, 270].map((a) => (
      <g key={a} transform={`rotate(${a + 45})`}>
        <path d="M 0 0 C -60 -20 -70 -90 -18 -96 C 0 -98 0 -80 0 -70 C 0 -80 0 -98 18 -96 C 70 -90 60 -20 0 0 Z" fill="#43A047" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 0 -10 L 0 -70" stroke="#2E7D32" strokeWidth={5} />
      </g>
    ))}
  </g>
);

/** Fragezeichen-Blase. */
export const QBubble: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => {
  if (s <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
      <circle r={70} fill="#FFFFFF" stroke={LC.ink} strokeWidth={7} />
      <path d="M -20 60 L -40 100 L 10 66 Z" fill="#FFFFFF" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" />
      <LT x={0} y={34} size={100}>
        ?
      </LT>
    </g>
  );
};

/** Zellenwand mit Fenster (Lichtstrahl), Pritsche. */
export const Cell: React.FC<{ readonly id: string; readonly f: number; readonly floor?: number; readonly light?: number }> = ({ id, f, floor = 1300, light = 0 }) => (
  <g>
    <defs>
      <linearGradient id={`cellwall-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A3F55" />
        <stop offset="1" stopColor="#555B73" />
      </linearGradient>
      <linearGradient id={`beam-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFB36B" stopOpacity="0.5" />
        <stop offset="1" stopColor="#FFB36B" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x={-3000} y={-3000} width={7000} height={3000 + floor} fill={`url(#cellwall-${id})`} />
    {Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => (
        <rect key={`${r}-${c}`} x={-400 + c * 240 + (r % 2) * 120} y={300 + r * 110} width={232} height={102} fill="none" stroke="#2E3246" strokeWidth={4} opacity={0.6} />
      )),
    )}
    <rect x={-3000} y={floor} width={7000} height={3000} fill="#2B2E3E" />
    <path d={`M -3000 ${floor} L 4000 ${floor}`} stroke={LC.ink} strokeWidth={6} />
    {/* Fenster oben mit Abendlicht */}
    <rect x={220} y={430} width={220} height={150} fill="#FF8C6B" stroke={LC.ink} strokeWidth={6} />
    {[275, 330, 385].map((bx) => (
      <rect key={bx} x={bx - 7} y={430} width={14} height={150} fill="#1C1622" />
    ))}
    <path d={`M 220 580 L 440 580 L ${700 + light * 40} ${floor} L ${360 + light * 40} ${floor} Z`} fill={`url(#beam-${id})`} opacity={0.8 + 0.1 * Math.sin(f * 0.05)} />
    {/* Pritsche */}
    <g filter="url(#paper)">
      <rect x={-120} y={floor - 170} width={420} height={40} rx={8} fill="#6E7388" stroke={LC.ink} strokeWidth={6} />
      <rect x={-110} y={floor - 200} width={380} height={34} rx={14} fill="#D8D2C4" stroke={LC.ink} strokeWidth={5} />
      <rect x={-100} y={floor - 130} width={20} height={130} fill="#4A4F63" stroke={LC.ink} strokeWidth={4} />
      <rect x={260} y={floor - 130} width={20} height={130} fill="#4A4F63" stroke={LC.ink} strokeWidth={4} />
    </g>
  </g>
);

/** Zellentür aus Stäben mit Schloss; `open` 0..1 schwingt nach rechts auf (schiebt sich zur Seite). */
export const CellDoor: React.FC<{ readonly x: number; readonly y0: number; readonly y1: number; readonly w?: number; readonly open: number; readonly glow?: number }> = ({ x, y0, y1, w = 520, open, glow = 0 }) => (
  <g>
    {/* Licht hinter der Tür (Gang) */}
    <rect x={x} y={y0} width={w} height={y1 - y0} fill="#FFE2B0" opacity={0.15 + 0.6 * glow} />
    <g transform={`translate(${x + open * w * 0.92} 0)`}>
      <Bars x0={36} n={5} gap={(w - 72) / 4} y0={y0} y1={y1} w={30} cross={[y0 + 60, y1 - 60]} />
      <g filter="url(#paper)">
        <rect x={w / 2 - 70 + 0} y={(y0 + y1) / 2 - 60} width={140} height={120} rx={14} fill="#8C8F9E" stroke={LC.ink} strokeWidth={6} />
        <circle cx={w / 2} cy={(y0 + y1) / 2 - 8} r={16} fill={LC.ink} />
        <rect x={w / 2 - 6} y={(y0 + y1) / 2 - 2} width={12} height={34} fill={LC.ink} />
      </g>
    </g>
    <rect x={x - 26} y={y0 - 26} width={w + 52} height={30} fill="#2B2E3E" stroke={LC.ink} strokeWidth={6} />
    <rect x={x - 26} y={y0 - 26} width={30} height={y1 - y0 + 26} fill="#2B2E3E" stroke={LC.ink} strokeWidth={6} />
  </g>
);

/** Gefängnismauer mit Tor (Torflügel `open` 0..1), Stacheldraht, Wachturm. Tor-Öffnung bei x gx ± 170. */
export const PrisonWall: React.FC<{ readonly gx: number; readonly floor: number; readonly open: number; readonly f: number; readonly light?: number }> = ({ gx, floor, open, f, light = 1 }) => {
  const top = floor - 620;
  const gw = 340;
  return (
    <g>
      {/* Licht hinter dem Tor */}
      <rect x={gx - gw / 2} y={floor - 460} width={gw} height={460} fill="#FFE7BE" opacity={0.6 * light * open} />
      <g filter="url(#paper)">
        <path
          d={`M -900 ${top} L ${gx + 1500} ${top} L ${gx + 1500} ${floor} L ${gx + gw / 2} ${floor} L ${gx + gw / 2} ${floor - 460} L ${gx - gw / 2} ${floor - 460} L ${gx - gw / 2} ${floor} L -900 ${floor} Z`}
          fill="#8D8794"
          stroke={LC.ink}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${-900 + i * 260} ${top + 4} L ${-900 + i * 260} ${floor}`} stroke="#6F6976" strokeWidth={4} />
        ))}
        <rect x={-900} y={top - 30} width={gx + 2400} height={36} fill="#6F6976" stroke={LC.ink} strokeWidth={6} />
      </g>
      {/* Stacheldraht */}
      <path
        d={Array.from({ length: 60 }, (_, i) => `${i ? "L" : "M"} ${-900 + i * 50} ${top - 46 + (i % 2) * 24}`).join(" ")}
        stroke={LC.ink}
        strokeWidth={4}
        fill="none"
      />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={-880 + i * 100} cy={top - 60} r={26} fill="none" stroke={LC.ink} strokeWidth={4} />
      ))}
      {/* Wachturm */}
      <g filter="url(#paper)">
        <rect x={gx + 420} y={top - 420} width={70} height={420} fill="#76707E" stroke={LC.ink} strokeWidth={6} />
        <rect x={gx + 360} y={top - 520} width={190} height={110} fill="#5E5866" stroke={LC.ink} strokeWidth={6} />
        <rect x={gx + 380} y={top - 500} width={150} height={50} fill="#FFD27A" opacity={0.6 + 0.2 * Math.sin(f * 0.1)} />
        <path d={`M ${gx + 340} ${top - 520} L ${gx + 455} ${top - 600} L ${gx + 570} ${top - 520} Z`} fill="#4A4552" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {/* Torflügel (Gitter), schieben sich auseinander */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${gx + sd * open * gw * 0.48} 0)`}>
          <g transform={`translate(${sd < 0 ? gx - gw / 2 : gx} 0)`}>
            <rect x={0} y={floor - 460} width={gw / 2} height={460} fill="#3A3542" opacity={0.25} />
            <Bars x0={24} n={4} gap={(gw / 2 - 48) / 3} y0={floor - 460} y1={floor} w={18} cross={[floor - 400, floor - 60]} />
          </g>
        </g>
      ))}
    </g>
  );
};

/** Eigenes Cabrio (Seitenansicht, kein reales Modell). Fußpunkt = Mitte zwischen den Rädern auf dem Boden. */
export const Convertible: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly wheel?: number; readonly color?: string; readonly flip?: boolean; readonly children?: React.ReactNode; readonly sil?: string }> = ({
  x,
  y,
  s = 1,
  wheel = 0,
  color = LC.orange,
  flip = false,
  children,
  sil,
}) => {
  const c = sil ?? color;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (flip ? -1 : 1)} ${s})`}>
      {children}
      <g filter="url(#paper)">
        <path
          d="M -330 -60 Q -340 -140 -260 -150 L -120 -160 L -40 -160 L 60 -170 L 250 -160 Q 340 -150 340 -90 L 336 -40 Q 330 -20 300 -20 L -300 -20 Q -330 -20 -330 -60 Z"
          fill={c}
          stroke={LC.ink}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        {sil ? null : (
          <>
            <path d="M -320 -95 L 330 -105" stroke="#FFFFFF" strokeWidth={10} opacity={0.75} />
            <path d="M -40 -160 L -10 -230 L 10 -230 L -10 -160 Z" fill="#BFE6F2" stroke={LC.ink} strokeWidth={5} opacity={0.9} />
            <rect x={300} y={-130} width={40} height={24} rx={6} fill="#FFF1B8" stroke={LC.ink} strokeWidth={4} />
            <rect x={-336} y={-120} width={24} height={26} rx={5} fill="#FF4A4A" stroke={LC.ink} strokeWidth={4} />
            <path d="M -200 -150 L -200 -60 M 90 -165 L 90 -60" stroke="#00000033" strokeWidth={5} />
          </>
        )}
      </g>
      {[-210, 210].map((wx) => (
        <g key={wx} transform={`translate(${wx} -20) rotate(${wheel})`}>
          <circle r={62} fill="#18141C" stroke={LC.ink} strokeWidth={6} />
          <circle r={30} fill={sil ?? "#C9C4CF"} stroke={LC.ink} strokeWidth={5} />
          <path d="M -28 0 L 28 0 M 0 -28 L 0 28" stroke={LC.ink} strokeWidth={5} />
        </g>
      ))}
    </g>
  );
};

/** Bankfassade (eigene Grafik, Wort „BANK“ ohne Institut), Alarmlicht `alarm` 0..1. */
export const BankFront: React.FC<{ readonly x: number; readonly floor: number; readonly alarm: number; readonly f: number }> = ({ x, floor, alarm, f }) => {
  const rot = alarm > 0 ? (f * 14) % 360 : 0;
  return (
    <g>
      <g filter="url(#paper)">
        <rect x={x - 470} y={floor - 760} width={940} height={760} fill="#D9CBB2" stroke={LC.ink} strokeWidth={7} />
        <path d={`M ${x - 520} ${floor - 760} L ${x} ${floor - 960} L ${x + 520} ${floor - 760} Z`} fill="#CDBD9F" stroke={LC.ink} strokeWidth={7} strokeLinejoin="round" />
        <rect x={x - 230} y={floor - 860} width={460} height={80} rx={8} fill="#2A2433" stroke={LC.ink} strokeWidth={5} />
        <LT x={x} y={floor - 800} size={56} fill="#F2E3C2" spacing={14}>
          BANK
        </LT>
        {[-360, -200, 200, 360].map((cx) => (
          <g key={cx}>
            <rect x={x + cx - 34} y={floor - 720} width={68} height={680} fill="#EFE5D2" stroke={LC.ink} strokeWidth={5} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${x + cx - 18 + i * 18} ${floor - 700} L ${x + cx - 18 + i * 18} ${floor - 60}`} stroke="#C9BCA3" strokeWidth={4} />
            ))}
          </g>
        ))}
        <rect x={x - 110} y={floor - 420} width={220} height={420} fill="#3A2E3E" stroke={LC.ink} strokeWidth={6} />
        <rect x={x - 500} y={floor - 40} width={1000} height={40} fill="#BDAE93" stroke={LC.ink} strokeWidth={6} />
      </g>
      {/* Alarmlicht */}
      <g transform={`translate(${x + 300} ${floor - 520})`}>
        <rect x={-30} y={-10} width={60} height={30} fill="#3A3542" stroke={LC.ink} strokeWidth={5} />
        <path d="M -26 -10 Q -26 -60 0 -60 Q 26 -60 26 -10 Z" fill={alarm > 0 ? LC.red : "#7A3A3A"} stroke={LC.ink} strokeWidth={5} />
        {alarm > 0 ? (
          <g opacity={alarm} transform={`rotate(${rot} 0 -36)`}>
            <path d="M 0 -36 L 900 -260 L 900 190 Z" fill={LC.red} opacity={0.28} />
            <path d="M 0 -36 L -900 190 L -900 -260 Z" fill={LC.red} opacity={0.28} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Geldsack ($-Zeichen als Geometrie-freier Text „$“ ist in Montserrat enthalten). `rip` 0..1 reißt auf. */
export const MoneyBag: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rip?: number; readonly r?: number }> = ({ x, y, s = 1, rip = 0, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <path d="M -80 -10 Q -110 90 0 100 Q 110 90 80 -10 Q 60 -60 30 -70 L -30 -70 Q -60 -60 -80 -10 Z" fill="#C9B48A" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -40 -70 Q 0 -110 40 -70" fill="#C9B48A" stroke={LC.ink} strokeWidth={6} />
    <rect x={-40} y={-78} width={80} height={14} rx={6} fill="#8A6A3A" stroke={LC.ink} strokeWidth={4} />
    <LT x={0} y={50} size={80} fill="#5A4220">
      $
    </LT>
    {rip > 0 ? <path d={`M 20 -40 L 40 0 L 24 20 L 50 60`} stroke={LC.ink} strokeWidth={6 + rip * 4} fill="none" /> : null}
  </g>
);

/** Geldschein (eigene Grafik). */
export const Cash: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-60} y={-30} width={120} height={60} rx={6} fill={LC.money} stroke={LC.ink} strokeWidth={4} />
    <circle r={16} fill="#5E9159" stroke={LC.ink} strokeWidth={3} />
    <rect x={-50} y={-20} width={100} height={40} rx={4} fill="none" stroke="#4E7F4A" strokeWidth={3} />
  </g>
);

/** Fiktive Halbinsel-Karte (Bundesstaat „LEONIDA“, eigene Form). Ursprung = Kartenmitte. */
export const STATE_PATH =
  "M -260 -420 L 160 -440 L 230 -380 L 250 -250 L 300 -120 L 290 20 L 250 150 L 210 280 L 160 380 L 90 450 L 30 430 L 20 330 L -40 220 L -110 120 L -170 20 L -200 -110 L -270 -170 L -330 -230 L -300 -330 Z";
export const StateMap: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly label?: string }> = ({ x, y, s = 1, label = "LEONIDA" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#paper)">
      <path d={STATE_PATH} fill="#E9DFC4" stroke={LC.ink} strokeWidth={7} strokeLinejoin="round" />
    </g>
    <path d="M -150 -300 L 150 -280 M -100 -100 L 220 -60 M -40 120 L 230 160" stroke="#CDBF9C" strokeWidth={6} strokeDasharray="20 14" />
    <LT x={-10} y={-360} size={40} spacing={8} fill="#8A7A5A">
      {label}
    </LT>
  </g>
);

/** Auge-Symbol (Beobachter der Verschwörung). */
export const EyeMark: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly look?: number; readonly blink?: boolean }> = ({ x, y, s = 1, look = 0, blink = false }) => {
  if (s <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -50 0 Q 0 -44 50 0 Q 0 44 -50 0 Z" fill={blink ? LC.ink : "#FFFFFF"} stroke={LC.ink} strokeWidth={6} />
      {blink ? null : (
        <>
          <circle cx={look * 14} cy={0} r={18} fill={LC.red} stroke={LC.ink} strokeWidth={4} />
          <circle cx={look * 14} cy={0} r={8} fill={LC.ink} />
        </>
      )}
    </g>
  );
};

/** Pinnwand-Nadel. */
export const Pin: React.FC<{ readonly x: number; readonly y: number; readonly color?: string }> = ({ x, y, color = LC.red }) => (
  <g>
    <circle cx={x + 4} cy={y + 6} r={14} fill="#000" opacity={0.3} />
    <circle cx={x} cy={y} r={14} fill={color} stroke={LC.ink} strokeWidth={4} />
    <circle cx={x - 4} cy={y - 4} r={4} fill="#FFFFFF" opacity={0.6} />
  </g>
);

/** Polaroid mit Name (Inhalt = children, lokaler Rahmen 300 × 340). */
export const Polaroid: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly name: string; readonly color: string; readonly id: string; readonly children: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  r = 0,
  name,
  color,
  id,
  children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <g filter="url(#paper)">
      <rect x={-170} y={-200} width={340} height={430} fill="#FFFFFF" stroke={LC.ink} strokeWidth={6} />
    </g>
    <defs>
      <clipPath id={`pol-${id}`}>
        <rect x={-150} y={-180} width={300} height={320} />
      </clipPath>
    </defs>
    <rect x={-150} y={-180} width={300} height={320} fill={color} opacity={0.35} />
    <g clipPath={`url(#pol-${id})`}>{children}</g>
    <rect x={-150} y={-180} width={300} height={320} fill="none" stroke={LC.ink} strokeWidth={4} />
    <LT x={0} y={200} size={46} fill={color === LC.pink ? LC.pinkDark : LC.tealDark} spacing={4}>
      {name}
    </LT>
  </g>
);

/** Goldsiegel „FIRST“. `t` 0..1 prägt sich ein. */
export const GoldSeal: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number; readonly text?: string }> = ({ x, y, s = 1, t, text = "FIRST" }) => {
  if (t <= 0) return null;
  const k = s * (1 + (1 - Math.min(1, t)) * 1.2);
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${-8 + 8 * Math.min(1, t)})`} opacity={Math.min(1, t * 2)} filter="url(#paper)">
      <path d={Array.from({ length: 32 }, (_, i) => `${i ? "L" : "M"} ${Math.cos((i / 32) * Math.PI * 2) * (i % 2 ? 128 : 150)} ${Math.sin((i / 32) * Math.PI * 2) * (i % 2 ? 128 : 150)}`).join(" ") + " Z"} fill="#F2C14E" stroke={LC.ink} strokeWidth={6} />
      <circle r={104} fill="#FFD969" stroke="#B8862A" strokeWidth={6} />
      <circle r={88} fill="none" stroke="#B8862A" strokeWidth={3} strokeDasharray="6 8" />
      <LT x={0} y={18} size={52} fill="#7A4E10" spacing={3}>
        {text}
      </LT>
      <path d="M -60 130 L -90 240 L -50 215 L -30 250 L -10 140 Z M 60 130 L 90 240 L 50 215 L 30 250 L 10 140 Z" fill={LC.red} stroke={LC.ink} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** Haken als Geometrie (kein Sonderzeichen). */
export const Tick: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t?: number; readonly color?: string }> = ({ x, y, s = 1, t = 1, color = LC.tealDark }) => (
  <path
    d="M -24 2 L -6 22 L 28 -24"
    transform={`translate(${x} ${y}) scale(${s})`}
    stroke={color}
    strokeWidth={12}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray="1 1"
    strokeDashoffset={1 - clamp01(t)}
  />
);

/** Eigener Controller-Umriss (kein Konsolen-Design). */
export const Pad: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <path d="M -260 -90 Q -200 -140 -100 -120 L 100 -120 Q 200 -140 260 -90 Q 330 60 290 160 Q 250 220 190 170 L 120 90 L -120 90 L -190 170 Q -250 220 -290 160 Q -330 60 -260 -90 Z" fill="#2B2236" stroke={LC.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-200} y={-50} width={36} height={110} rx={8} fill={LC.teal} stroke={LC.ink} strokeWidth={5} />
    <rect x={-237} y={-13} width={110} height={36} rx={8} fill={LC.teal} stroke={LC.ink} strokeWidth={5} />
    {[
      [180, -50],
      [230, 0],
      [180, 50],
      [130, 0],
    ].map(([bx, by], i) => (
      <circle key={i} cx={bx} cy={by} r={24} fill={i % 2 ? LC.pink : LC.yellow} stroke={LC.ink} strokeWidth={5} opacity={0.75 + 0.25 * Math.sin(f * 0.2 + i)} />
    ))}
    <circle cx={-60} cy={50} r={36} fill="#3E3350" stroke={LC.ink} strokeWidth={5} />
    <circle cx={60} cy={50} r={36} fill="#3E3350" stroke={LC.ink} strokeWidth={5} />
  </g>
);

/** Konfetti (Bildraum), `t` Zeit in Bildern ab Start. */
export const Confetti: React.FC<{ readonly t: number; readonly n?: number }> = ({ t, n = 46 }) => {
  if (t <= 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const rnd = seeded(300 + i);
        const x0 = rnd() * 1080;
        const vy = 6 + rnd() * 8;
        const y = -60 + t * vy;
        if (y > 1300) return null;
        const c = [LC.teal, LC.pink, LC.yellow, LC.white][i % 4];
        return <rect key={i} x={x0 + Math.sin(t * 0.1 + i) * 30} y={y} width={18} height={30} fill={c} stroke={LC.ink} strokeWidth={3} transform={`rotate(${t * 8 + i * 30} ${x0} ${y})`} />;
      })}
    </g>
  );
};

/** Kalenderblatt (eigene Grafik): Kopfzeile rot, große Zeile, Unterzeile; `cross` 0..1 streicht durch. */
export const DateSheet: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly big: string; readonly sub?: string; readonly cross?: number; readonly head?: string; readonly color?: string }> = ({
  x,
  y,
  s = 1,
  r = 0,
  big,
  sub,
  cross = 0,
  head = "RELEASE",
  color = LC.red,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <g filter="url(#paper)">
      <rect x={-200} y={-230} width={400} height={460} rx={14} fill={LC.paper} stroke={LC.ink} strokeWidth={7} />
      <rect x={-200} y={-230} width={400} height={100} rx={14} fill={color} stroke={LC.ink} strokeWidth={7} />
    </g>
    <circle cx={-110} cy={-230} r={14} fill={LC.ink} />
    <circle cx={110} cy={-230} r={14} fill={LC.ink} />
    <LT x={0} y={-160} size={40} fill="#FFFFFF" spacing={4}>
      {head}
    </LT>
    <LT x={0} y={sub ? 40 : 70} size={big.length > 5 ? 96 : 130}>
      {big}
    </LT>
    {sub ? (
      <LT x={0} y={140} size={54} fill="#55525F">
        {sub}
      </LT>
    ) : null}
    {cross > 0 ? (
      <g stroke={LC.red} strokeWidth={18} strokeLinecap="round">
        <path d={`M -160 -90 L ${-160 + 320 * clamp01(cross * 2)} ${-90 + 280 * clamp01(cross * 2)}`} />
        {cross > 0.5 ? <path d={`M 160 -90 L ${160 - 320 * clamp01(cross * 2 - 1)} ${-90 + 280 * clamp01(cross * 2 - 1)}`} /> : null}
      </g>
    ) : null}
  </g>
);

/** Unscharfe Gruppe (Familie, nicht zählbar): weiche Farbflecken mit Gaußscher Unschärfe. */
export const BlurGroup: React.FC<{ readonly id: string; readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly o?: number }> = ({ id, x, y, s = 1, f, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <defs>
      <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="34" />
      </filter>
    </defs>
    <g filter={`url(#blur-${id})`}>
      <ellipse cx={0} cy={-300} rx={420} ry={340} fill="#E9A27A" opacity={0.75} />
      <ellipse cx={-180} cy={-430 + 6 * Math.sin(f * 0.05)} rx={150} ry={170} fill="#F6C89A" opacity={0.8} />
      <ellipse cx={170} cy={-390 + 6 * Math.sin(f * 0.05 + 2)} rx={160} ry={190} fill="#C77B8A" opacity={0.75} />
      <ellipse cx={0} cy={-170} rx={360} ry={180} fill="#8A5A7A" opacity={0.6} />
    </g>
  </g>
);

/** Höhenstriche an der Wand (Kinderzimmer-Türrahmen). */
export const HeightMarks: React.FC<{ readonly x: number; readonly floor: number; readonly marks: readonly number[]; readonly t: number }> = ({ x, floor, marks, t }) => (
  <g>
    <rect x={x - 26} y={floor - 760} width={52} height={760} fill="#E4D2B0" stroke={LC.ink} strokeWidth={5} />
    {marks.map((h, i) => (
      <g key={h} opacity={clamp01(t * marks.length - i)}>
        <path d={`M ${x - 40} ${floor - h} L ${x + 40} ${floor - h}`} stroke={LC.ink} strokeWidth={6} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

/** Riss im Glas (VULNERABLE). `t` 0..1 wächst. */
export const Crack: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number }> = ({ x, y, s = 1, t }) => {
  if (t <= 0) return null;
  const k = clamp01(t);
  const rays = [
    [-160, -120],
    [140, -170],
    [190, 60],
    [-60, 180],
    [-200, 40],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.95}>
      {rays.map(([rx, ry], i) => (
        <path key={i} d={`M 0 0 L ${rx * 0.45 * k} ${ry * 0.45 * k + 14} L ${rx * k} ${ry * k}`} />
      ))}
      <path d={`M ${-60 * k} ${-40 * k} L ${50 * k} ${-50 * k} L ${70 * k} ${30 * k} L ${-20 * k} ${60 * k} Z`} strokeWidth={4} />
      <g stroke={LC.ink} strokeWidth={2} opacity={0.5}>
        {rays.map(([rx, ry], i) => (
          <path key={i} d={`M 3 3 L ${rx * 0.45 * k + 3} ${ry * 0.45 * k + 17} L ${rx * k + 3} ${ry * k + 3}`} />
        ))}
      </g>
    </g>
  );
};

/** Kaffeefleck (FLAWED). */
export const CoffeeRing: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number }> = ({ x, y, s = 1, t }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * clamp01(t))})`} opacity={clamp01(t * 2) * 0.85}>
      <circle r={120} fill="#8A5A2E" opacity={0.18} />
      <circle r={110} fill="none" stroke="#7A4A22" strokeWidth={14} opacity={0.6} />
      <circle cx={130} cy={70} r={18} fill="#7A4A22" opacity={0.45} />
      <circle cx={-120} cy={-90} r={10} fill="#7A4A22" opacity={0.45} />
    </g>
  );
};

/** Seitenblatt (Bildraum) für den Umblätter-Übergang: `t` 0..1 legt sich von rechts über das Bild, 1..2 verlässt es nach links. */
export const PageFlip: React.FC<{ readonly t: number; readonly title: string; readonly big: string }> = ({ t, title, big }) => {
  if (t <= 0 || t >= 2) return null;
  // Rechte Kante bleibt bei t ≤ 1 am rechten Rand, linke Kante wandert von rechts nach links
  const left = t <= 1 ? lerp(1080, -10, t) : -10;
  const right = t <= 1 ? 1090 : lerp(1090, -40, t - 1);
  const w = Math.max(0, right - left);
  if (w <= 0) return null;
  const curl = t <= 1 ? 1 - t : t - 1;
  return (
    <g>
      <rect x={left} y={0} width={w} height={1920} fill={LC.paper} />
      <rect x={left} y={0} width={Math.min(w, 60)} height={1920} fill="#000" opacity={0.12 * curl} />
      <path d={`M ${t <= 1 ? left : right} 0 L ${t <= 1 ? left : right} 1920`} stroke={LC.ink} strokeWidth={8} />
      {w > 600 ? (
        <g opacity={clamp01((w - 600) / 300)}>
          <text x={(left + right) / 2} y={840} fontFamily={FONT} fontWeight={900} fontSize={46} letterSpacing={10} textAnchor="middle" fill="#9A3A2E">
            {title}
          </text>
          <text x={(left + right) / 2} y={1060} fontFamily={FONT} fontWeight={900} fontSize={240} textAnchor="middle" fill={LC.ink}>
            {big}
          </text>
          <path d={`M ${(left + right) / 2 - 220} 880 L ${(left + right) / 2 + 220} 880`} stroke={LC.ink} strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

/** Heller Schleier (Licht flutet) im Bildraum. */
export const Flood: React.FC<{ readonly o: number; readonly color?: string }> = ({ o, color = "#FFE2B0" }) =>
  o > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={color} opacity={o} /> : null;

/** Staub-/Treffer-Wolke. */
export const Puff: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number; readonly color?: string }> = ({ x, y, t, s = 1, color = "#F2E2C2" }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - t}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 30 + t * 110;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.8} r={26 * (1 - t) + 8} fill={color} stroke={LC.ink} strokeWidth={3} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        return <path key={`l${i}`} d={`M ${Math.cos(a) * (50 + t * 60)} ${Math.sin(a) * (50 + t * 60)} L ${Math.cos(a) * (90 + t * 120)} ${Math.sin(a) * (90 + t * 120)}`} stroke={LC.ink} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};
