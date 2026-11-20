import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp01, lerp } from "../kit2d";

/**
 * „In This City, One Yawn Puts Everyone to Sleep“ (episodes/gaehn-stadt.json) – 2D-Bau-Teile.
 * Flacher Cartoon mit dicken Konturen (Audit 20.11.2026: große Augen mit Pupillen, Brauen, offene Münder,
 * kräftige Farben, Hauptfigur hebt sich ab). Alle Teile sind reine Funktionen ihrer Props.
 */

export const INK = "#1B1530";
export const P = {
  sky: "#8ED8FF",
  skyLow: "#CFF0FF",
  sea: "#14C3C3",
  seaDeep: "#0A8FA8",
  bus: "#FFC727",
  busDark: "#E09A00",
  ted: "#1E6BFF",
  tedDark: "#1048B8",
  skin: "#F6C59B",
  skin2: "#C98A5E",
  skin3: "#8A5A3C",
  red: "#FF4D5E",
  pink: "#FF8FC7",
  lime: "#9BE35A",
  purple: "#9A6BFF",
  orange: "#FF9A3D",
  teal: "#22C7A9",
  white: "#FFFFFF",
  cream: "#FFF4DE",
  grey: "#B8BFD0",
  night: "#22205A",
  road: "#5B5F73",
  zzz: "#C9B8FF",
} as const;

const SW = 7; // Konturstärke

/* ------------------------------------------------------------------ */
/* Gesicht                                                            */
/* ------------------------------------------------------------------ */

export type Eyes = "open" | "half" | "closed" | "wide" | "rolled" | "squint" | "twitch";
export type Brows = "neutral" | "up" | "angry" | "sad" | "worried" | "none";
export type Mouth = "smile" | "flat" | "o" | "yawn" | "grin" | "frown" | "pucker" | "scream" | "talk" | "smug" | "drool" | "shh";

export type FaceProps = {
  readonly r: number;
  readonly skin?: string;
  readonly eyes?: Eyes;
  /** Blickrichtung der Pupillen, je −1..1 */
  readonly look?: readonly [number, number];
  readonly brows?: Brows;
  readonly mouth?: Mouth;
  /** Mundöffnung 0..1 (yawn/scream/talk) */
  readonly open?: number;
  /** Augenringe 0..1 */
  readonly bags?: number;
  /** Frame für Zucken/Blinzeln */
  readonly f?: number;
  readonly blush?: boolean;
};

export const Face: React.FC<FaceProps> = ({ r, skin = P.skin, eyes = "open", look = [0, 0], brows = "neutral", mouth = "smile", open = 0, bags = 0, f = 0, blush }) => {
  const ex = r * 0.36;
  const ey = -r * 0.12;
  const wide = eyes === "wide";
  const erx = r * (wide ? 0.27 : 0.23);
  const ery = r * (wide ? 0.33 : 0.27);
  const pr = r * (wide ? 0.09 : 0.12);
  const twitch = eyes === "twitch" ? (Math.sin(f * 2.7) > 0.3 ? 0.55 : 0.15) : 0;
  const eye = (side: -1 | 1) => {
    const cx = side * ex;
    const lid = eyes === "half" ? 0.55 : eyes === "squint" ? 0.7 : eyes === "twitch" && side === -1 ? twitch : eyes === "rolled" ? 0.45 : 0;
    if (eyes === "closed") {
      return <path key={side} d={`M ${cx - erx} ${ey} Q ${cx} ${ey + ery * 0.7} ${cx + erx} ${ey}`} fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />;
    }
    const px = cx + look[0] * erx * 0.45;
    const py = eyes === "rolled" ? ey - ery * 0.75 : ey + look[1] * ery * 0.4;
    const clip = `eye-${Math.round(r)}-${side}-${Math.round(cx)}`;
    return (
      <g key={side}>
        <defs>
          <clipPath id={clip}>
            <ellipse cx={cx} cy={ey} rx={erx} ry={ery} />
          </clipPath>
        </defs>
        <ellipse cx={cx} cy={ey} rx={erx} ry={ery} fill={P.white} />
        <g clipPath={`url(#${clip})`}>
          <circle cx={px} cy={py} r={pr} fill={INK} />
          <circle cx={px + pr * 0.35} cy={py - pr * 0.35} r={pr * 0.33} fill={P.white} />
          {lid > 0 ? <rect x={cx - erx - 2} y={ey - ery - 2} width={erx * 2 + 4} height={ery * 2 * lid + 2} fill={skin} /> : null}
        </g>
        {lid > 0 ? <line x1={cx - erx} x2={cx + erx} y1={ey - ery + ery * 2 * lid} y2={ey - ery + ery * 2 * lid} stroke={INK} strokeWidth={SW * 0.8} strokeLinecap="round" /> : null}
        <ellipse cx={cx} cy={ey} rx={erx} ry={ery} fill="none" stroke={INK} strokeWidth={SW * 0.8} />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    if (brows === "none") return null;
    const cx = side * ex;
    const by = ey - ery - r * (brows === "up" ? 0.22 : brows === "worried" ? 0.16 : 0.1);
    // innen (zur Mitte) / außen
    const tilt = brows === "angry" ? 0.16 : brows === "sad" || brows === "worried" ? -0.16 : brows === "up" ? -0.04 : 0;
    const inner = by + tilt * r;
    const outer = by - tilt * r;
    const ix = cx - side * erx * 0.9;
    const ox = cx + side * erx * 0.9;
    return <path key={`b${side}`} d={`M ${ix} ${inner} Q ${cx} ${Math.min(inner, outer) - r * 0.06} ${ox} ${outer}`} fill="none" stroke={INK} strokeWidth={r * 0.085} strokeLinecap="round" />;
  };
  const my = r * 0.45;
  const mw = r * 0.3;
  let m: React.ReactNode = null;
  if (mouth === "smile" || mouth === "smug") {
    m = <path d={`M ${-mw} ${my - 6} Q ${mouth === "smug" ? mw * 0.6 : 0} ${my + r * 0.2} ${mw} ${my - (mouth === "smug" ? 18 : 6)}`} fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />;
  } else if (mouth === "flat") {
    m = <line x1={-mw * 0.7} x2={mw * 0.7} y1={my} y2={my} stroke={INK} strokeWidth={SW} strokeLinecap="round" />;
  } else if (mouth === "frown") {
    m = <path d={`M ${-mw * 0.8} ${my + 10} Q 0 ${my - r * 0.14} ${mw * 0.8} ${my + 10}`} fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />;
  } else if (mouth === "pucker") {
    m = (
      <g>
        <circle cx={0} cy={my} r={r * 0.09} fill={P.red} stroke={INK} strokeWidth={SW * 0.8} />
        {[-1, 1].map((s) => (
          <path key={s} d={`M ${s * r * 0.16} ${my - r * 0.1} l ${s * r * 0.08} ${r * 0.1} l ${-s * r * 0.08} ${r * 0.1}`} fill="none" stroke={INK} strokeWidth={4} />
        ))}
      </g>
    );
  } else if (mouth === "shh") {
    m = <circle cx={0} cy={my} r={r * 0.07} fill={INK} />;
  } else if (mouth === "grin") {
    m = (
      <g>
        <path d={`M ${-mw * 1.1} ${my - 10} Q 0 ${my + r * 0.36} ${mw * 1.1} ${my - 10} Z`} fill={P.white} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <line x1={-mw} x2={mw} y1={my + 2} y2={my + 2} stroke={INK} strokeWidth={3} />
      </g>
    );
  } else {
    // yawn / o / scream / talk / drool: offene Mundhöhle
    const o = mouth === "o" ? 0.3 : clamp01(open);
    const w = mouth === "scream" ? mw * 1.25 : mouth === "yawn" ? lerp(mw * 0.5, mw * 1.05, o) : mw * 0.7;
    const h = mouth === "yawn" ? lerp(r * 0.06, r * 0.78, o) : mouth === "scream" ? r * (0.25 + 0.4 * o) : r * (0.06 + 0.3 * o);
    const cy = my + h * 0.25;
    m = (
      <g>
        <ellipse cx={0} cy={cy} rx={w} ry={h} fill="#5A1530" stroke={INK} strokeWidth={SW} />
        {h > r * 0.15 ? <ellipse cx={0} cy={cy + h * 0.55} rx={w * 0.6} ry={h * 0.35} fill="#FF6F8A" /> : null}
        {mouth === "yawn" && o > 0.5 ? <rect x={-w * 0.45} y={cy - h + 2} width={w * 0.9} height={h * 0.16} rx={6} fill={P.white} /> : null}
        {mouth === "drool" ? <path d={`M ${w * 0.6} ${cy} q 6 ${r * 0.3} 0 ${r * 0.42}`} fill="none" stroke="#9FE3FF" strokeWidth={8} strokeLinecap="round" /> : null}
      </g>
    );
  }
  return (
    <g>
      {bags > 0
        ? ([-1, 1] as const).map((s) => (
            <path
              key={`bag${s}`}
              d={`M ${s * ex - erx} ${ey + ery * 0.7} Q ${s * ex} ${ey + ery + r * 0.5 * bags} ${s * ex + erx} ${ey + ery * 0.7}`}
              fill="#8E6BB8"
              opacity={0.85}
              stroke={INK}
              strokeWidth={4}
            />
          ))
        : null}
      {eye(-1)}
      {eye(1)}
      {brow(-1)}
      {brow(1)}
      <ellipse cx={0} cy={r * 0.18} rx={r * 0.1} ry={r * 0.08} fill={skin} stroke={INK} strokeWidth={4} />
      {blush ? ([-1, 1] as const).map((s) => <ellipse key={`bl${s}`} cx={s * r * 0.6} cy={r * 0.3} rx={r * 0.13} ry={r * 0.07} fill={P.pink} opacity={0.7} />) : null}
      {m}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Figur                                                              */
/* ------------------------------------------------------------------ */

export type Hair = "none" | "spiky" | "bun" | "curly" | "side" | "pony" | "baby";
export type PersonProps = Omit<FaceProps, "r"> & {
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly shirt?: string;
  readonly pants?: string;
  readonly hair?: Hair;
  readonly hairColor?: string;
  /** Arm-Winkel in Grad (0 = hängt, 90 = waagrecht nach außen, 180 = hoch) */
  readonly armL?: number;
  readonly armR?: number;
  /** Neigung um die Füße (Grad) */
  readonly lean?: number;
  /** Kopf-Neigung (Grad) */
  readonly nod?: number;
  readonly seated?: boolean;
  readonly cap?: boolean;
  readonly handMouth?: boolean;
  readonly mask?: number;
  readonly headphones?: boolean;
  readonly flip?: boolean;
  readonly suit?: boolean;
  readonly cardigan?: boolean;
  /** Zeigefinger der rechten Hand nach oben (Psst) */
  readonly finger?: boolean;
  /** Hand der rechten Seite hält etwas (gezeichnet von der Szene) – liefert nichts extra */
};

/** Ursprung = Mitte zwischen den Füßen (stehend) bzw. Sitzfläche (sitzend). Höhe stehend ≈ 560 px bei s = 1. */
export const Person: React.FC<PersonProps> = (p) => {
  const { x, y, s = 1, shirt = P.red, pants = "#3B3F66", hair = "side", hairColor = "#4A2E1E", armL = 8, armR = 8, lean = 0, nod = 0, seated, cap, handMouth, mask = 0, headphones, flip, suit, cardigan, finger } = p;
  const skin = p.skin ?? P.skin;
  const r = 105;
  // Leben (Audit 20.11.: Squash & Stretch): Atmen je Figur versetzt, Kopf streckt sich beim großen Gähnen/Schreien
  const fr = useCurrentFrame();
  const ph = (x * 0.013 + y * 0.007) % (Math.PI * 2);
  const breath = Math.sin(fr * 0.16 + ph);
  const stretch = (p.mouth === "yawn" || p.mouth === "scream") ? clamp01(p.open ?? 0) * 0.1 : 0;
  const bodyTop = seated ? -250 : -330;
  const bodyH = 210;
  const headY = bodyTop - r * 0.82;
  const sh = bodyTop + 40;
  const arm = (side: -1 | 1, deg: number) => {
    const a = (deg * Math.PI) / 180;
    const L = 130;
    const sx = side * 78;
    const hx = sx + side * Math.sin(a) * L;
    const hy = sh + Math.cos(a) * L;
    return (
      <g key={side}>
        <line x1={sx} y1={sh} x2={hx} y2={hy} stroke={INK} strokeWidth={46} strokeLinecap="round" />
        <line x1={sx} y1={sh} x2={hx} y2={hy} stroke={cardigan ? P.purple : shirt} strokeWidth={32} strokeLinecap="round" />
        {side === 1 && finger ? <rect x={hx - 9} y={hy - 70} width={18} height={70} rx={9} fill={skin} stroke={INK} strokeWidth={5} /> : null}
        <circle cx={hx} cy={hy} r={24} fill={skin} stroke={INK} strokeWidth={SW} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s * (1 - breath * 0.008)} ${s * (1 + breath * 0.012)}) rotate(${lean})`}>
      {seated ? null : (
        <g>
          <rect x={-62} y={bodyTop + bodyH - 30} width={50} height={140} rx={22} fill={pants} stroke={INK} strokeWidth={SW} />
          <rect x={12} y={bodyTop + bodyH - 30} width={50} height={140} rx={22} fill={pants} stroke={INK} strokeWidth={SW} />
          <ellipse cx={-40} cy={-6} rx={44} ry={20} fill={INK} />
          <ellipse cx={40} cy={-6} rx={44} ry={20} fill={INK} />
        </g>
      )}
      {handMouth ? null : arm(-1, armL)}
      {finger ? null : arm(1, armR)}
      <path
        d={`M ${-92} ${bodyTop + bodyH} Q ${-104} ${bodyTop + 10} ${-40} ${bodyTop} L ${40} ${bodyTop} Q ${104} ${bodyTop + 10} ${92} ${bodyTop + bodyH} Z`}
        fill={shirt}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {suit ? <path d={`M -30 ${bodyTop} L 0 ${bodyTop + 90} L 30 ${bodyTop} Z`} fill={P.white} stroke={INK} strokeWidth={5} /> : null}
      {suit ? <path d={`M -8 ${bodyTop + 20} L 0 ${bodyTop + 90} L 8 ${bodyTop + 20} Z`} fill={P.red} /> : null}
      {cardigan ? (
        <g>
          <path d={`M -40 ${bodyTop} L -10 ${bodyTop + bodyH} L -92 ${bodyTop + bodyH} Q -104 ${bodyTop + 10} -40 ${bodyTop} Z`} fill={P.purple} stroke={INK} strokeWidth={5} />
          <path d={`M 40 ${bodyTop} L 10 ${bodyTop + bodyH} L 92 ${bodyTop + bodyH} Q 104 ${bodyTop + 10} 40 ${bodyTop} Z`} fill={P.purple} stroke={INK} strokeWidth={5} />
        </g>
      ) : null}
      {cap ? <circle cx={-48} cy={bodyTop + 60} r={14} fill={P.bus} stroke={INK} strokeWidth={4} /> : null}
      <g transform={`translate(0 ${headY + breath * 4}) rotate(${nod}) scale(${1 - stretch * 0.4} ${1 + stretch})`}>
        {hair === "bun" ? <circle cx={0} cy={-r * 1.02} r={r * 0.42} fill={hairColor} stroke={INK} strokeWidth={SW} /> : null}
        {hair === "pony" ? <ellipse cx={r * 0.95} cy={-r * 0.2} rx={r * 0.25} ry={r * 0.5} fill={hairColor} stroke={INK} strokeWidth={SW} /> : null}
        <circle cx={0} cy={0} r={r} fill={skin} stroke={INK} strokeWidth={SW} />
        {([-1, 1] as const).map((sd) => (
          <ellipse key={sd} cx={sd * r * 0.98} cy={r * 0.08} rx={r * 0.16} ry={r * 0.22} fill={skin} stroke={INK} strokeWidth={SW * 0.8} />
        ))}
        {hair === "spiky" ? <path d={`M ${-r * 0.95} ${-r * 0.3} L ${-r * 0.7} ${-r * 1.15} L ${-r * 0.35} ${-r * 0.75} L 0 ${-r * 1.25} L ${r * 0.35} ${-r * 0.75} L ${r * 0.7} ${-r * 1.15} L ${r * 0.95} ${-r * 0.3} Q 0 ${-r * 0.65} ${-r * 0.95} ${-r * 0.3} Z`} fill={hairColor} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /> : null}
        {hair === "side" || hair === "pony" ? <path d={`M ${-r * 0.98} ${-r * 0.1} Q ${-r} ${-r * 1.05} 0 ${-r * 1.02} Q ${r} ${-r * 1.05} ${r * 0.98} ${-r * 0.15} Q ${r * 0.2} ${-r * 0.75} ${-r * 0.98} ${-r * 0.1} Z`} fill={hairColor} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /> : null}
        {hair === "curly" ? [-0.75, -0.4, 0, 0.4, 0.75].map((k) => <circle key={k} cx={k * r} cy={-r * (0.82 - Math.abs(k) * 0.25)} r={r * 0.34} fill={hairColor} stroke={INK} strokeWidth={SW} />) : null}
        {hair === "bun" ? <path d={`M ${-r * 0.98} ${-r * 0.05} Q ${-r * 0.9} ${-r * 1.0} 0 ${-r * 1.0} Q ${r * 0.9} ${-r * 1.0} ${r * 0.98} ${-r * 0.05} Q 0 ${-r * 0.6} ${-r * 0.98} ${-r * 0.05} Z`} fill={hairColor} stroke={INK} strokeWidth={SW} strokeLinejoin="round" /> : null}
        {hair === "baby" ? <path d={`M -10 ${-r} q 20 -40 30 -10`} fill="none" stroke={hairColor} strokeWidth={10} strokeLinecap="round" /> : null}
        <Face {...p} r={r} skin={skin} />
        {mask > 0 ? (
          <g transform={`translate(0 ${lerp(-r * 0.75, -r * 0.12, mask)})`}>
            <rect x={-r * 0.9} y={-r * 0.22} width={r * 1.8} height={r * 0.42} rx={r * 0.2} fill={P.pink} stroke={INK} strokeWidth={SW} />
          </g>
        ) : null}
        {cap ? (
          <g>
            <path d={`M ${-r * 0.95} ${-r * 0.42} Q ${-r * 0.9} ${-r * 1.15} 0 ${-r * 1.12} Q ${r * 0.9} ${-r * 1.15} ${r * 0.95} ${-r * 0.42} Z`} fill={P.ted} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            <path d={`M ${-r * 1.05} ${-r * 0.42} L ${r * 1.15} ${-r * 0.42} Q ${r * 1.3} ${-r * 0.3} ${r * 1.0} ${-r * 0.25} L ${-r * 1.0} ${-r * 0.3} Z`} fill={P.tedDark} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
            <circle cx={0} cy={-r * 0.75} r={r * 0.16} fill={P.bus} stroke={INK} strokeWidth={4} />
          </g>
        ) : null}
        {headphones ? (
          <g>
            <path d={`M ${-r * 1.05} ${0} Q ${-r * 1.1} ${-r * 1.45} 0 ${-r * 1.4} Q ${r * 1.1} ${-r * 1.45} ${r * 1.05} 0`} fill="none" stroke={INK} strokeWidth={22} />
            {([-1, 1] as const).map((sd) => <rect key={sd} x={sd * r * 1.05 - 32} y={-r * 0.35} width={64} height={r * 0.8} rx={26} fill={P.red} stroke={INK} strokeWidth={SW} />)}
          </g>
        ) : null}
        {handMouth ? <circle cx={-10} cy={r * 0.48} r={44} fill={skin} stroke={INK} strokeWidth={SW} /> : null}
      </g>
      {finger ? arm(1, armR) : null}
    </g>
  );
};

/** Ted: Busfahrer (blau, Mütze, Augenringe). */
export const Ted: React.FC<Omit<PersonProps, "shirt" | "hair" | "cap">> = (p) => <Person bags={0.8} {...p} shirt={P.ted} pants="#16306E" hair="none" cap skin={P.skin} />;
/** Oma: lila Strickjacke, weißer Dutt. */
export const Granny: React.FC<Omit<PersonProps, "hair" | "hairColor">> = (p) => <Person shirt={P.cream} cardigan {...p} hair="bun" hairColor="#F2F2F2" skin={p.skin ?? "#F2C7A5"} />;

/** Gesichts-Varianten für Fahrgäste und Passanten (kräftige Einzelfarben). */
export const CROWD: readonly { readonly shirt: string; readonly skin: string; readonly hair: Hair; readonly hairColor: string }[] = [
  { shirt: P.red, skin: P.skin, hair: "side", hairColor: "#4A2E1E" },
  { shirt: P.lime, skin: P.skin2, hair: "curly", hairColor: "#2A1B12" },
  { shirt: P.pink, skin: P.skin3, hair: "pony", hairColor: "#1B1210" },
  { shirt: P.orange, skin: P.skin, hair: "spiky", hairColor: "#E8B23A" },
  { shirt: P.teal, skin: P.skin2, hair: "bun", hairColor: "#3A2618" },
  { shirt: P.purple, skin: P.skin, hair: "none", hairColor: "#000" },
];

/* ------------------------------------------------------------------ */
/* Effekte                                                            */
/* ------------------------------------------------------------------ */

/** Z-Z-Z steigt auf (t = Frames seit Einschlafen). */
export const Zzz: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t < 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 1, 2].map((i) => {
        const k = ((t / 30 + i * 0.33) % 1 + 1) % 1;
        const o = Math.sin(k * Math.PI);
        return (
          <text key={i} x={k * 70 + i * 6} y={-k * 160} fontFamily="Montserrat" fontWeight={900} fontSize={46 + i * 14} fill={P.zzz} stroke={INK} strokeWidth={7} paintOrder="stroke" opacity={o * clamp01(t / 8)}>
            Z
          </text>
        );
      })}
    </g>
  );
};

/** Ringwelle (Gähn-Schockwelle), t 0..1 */
export const Shock: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly max?: number; readonly color?: string }> = ({ x, y, t, max = 900, color = P.zzz }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g>
      {[0, 0.22, 0.44].map((d) => {
        const k = clamp01((t - d) / (1 - d));
        if (k <= 0) return null;
        return <circle key={d} cx={x} cy={y} r={k * max} fill="none" stroke={color} strokeWidth={28 * (1 - k)} opacity={1 - k} />;
      })}
    </g>
  );
};

/** Schweißtropfen */
export const Sweat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={o} d="M 0 -40 Q 26 0 0 26 Q -26 0 0 -40 Z" fill="#7FD6FF" stroke={INK} strokeWidth={5} />
);

/** Comic-Strahlen (Aktion/Schreck) um (x, y) */
export const Burst: React.FC<{ readonly x: number; readonly y: number; readonly r0: number; readonly r1: number; readonly n?: number; readonly o?: number; readonly color?: string }> = ({ x, y, r0, r1, n = 12, o = 1, color = INK }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={10} strokeLinecap="round" />;
    })}
  </g>
);

/** Laute Schallwellen (Klammern) */
export const Waves: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly side?: 1 | -1; readonly color?: string }> = ({ x, y, f, side = 1, color = P.red }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const k = ((f / 12 + i / 3) % 1 + 1) % 1;
      const rr = 40 + k * 120;
      return <path key={i} d={`M ${x + side * rr * 0.5} ${y - rr} Q ${x + side * rr * 1.1} ${y} ${x + side * rr * 0.5} ${y + rr}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" opacity={1 - k} />;
    })}
  </g>
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                           */
/* ------------------------------------------------------------------ */

/** Großer Verlauf, reicht über den Rand */
export const Sky: React.FC<{ readonly id: string; readonly a: string; readonly b: string }> = ({ id, a, b }) => (
  <>
    <defs>
      <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect x={-1500} y={-1500} width={4080} height={4920} fill={`url(#g-${id})`} />
  </>
);

/** Stadtstraße: Häuser in Bonbonfarben, Bürgersteig */
export const Street: React.FC<{ readonly ground?: number }> = ({ ground = 1450 }) => {
  const houses = [
    { x: -500, w: 300, h: 700, c: "#FF9DB5" },
    { x: -190, w: 260, h: 900, c: "#FFD86B" },
    { x: 80, w: 320, h: 760, c: "#8ED6A8" },
    { x: 410, w: 280, h: 980, c: "#9FB8FF" },
    { x: 700, w: 300, h: 820, c: "#FFB070" },
    { x: 1010, w: 300, h: 920, c: "#C9A6FF" },
    { x: 1320, w: 300, h: 760, c: "#FF9DB5" },
  ];
  return (
    <g>
      <Sky id="street" a={P.sky} b={P.skyLow} />
      {houses.map((h) => (
        <g key={h.x}>
          <rect x={h.x} y={ground - 200 - h.h} width={h.w} height={h.h + 200} fill={h.c} stroke={INK} strokeWidth={SW} />
          {[0, 1, 2, 3].map((row) =>
            [0, 1].map((col) => (
              <rect key={`${row}-${col}`} x={h.x + 45 + col * (h.w / 2 - 20)} y={ground - h.h - 120 + row * 170} width={h.w / 2 - 70} height={100} rx={10} fill="#FFF7D6" stroke={INK} strokeWidth={5} />
            )),
          )}
        </g>
      ))}
      <rect x={-1500} y={ground - 40} width={4080} height={120} fill="#E8E2F0" stroke={INK} strokeWidth={SW} />
      <rect x={-1500} y={ground + 80} width={4080} height={1500} fill={P.road} />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={-1400 + i * 300} y={ground + 300} width={150} height={24} rx={12} fill="#FFF3B0" />
      ))}
    </g>
  );
};

/** Bus von außen (Seitenansicht), Ursprung = Mitte unten. `faces` zeichnet Köpfe in den Fenstern. */
export const BusSide: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly f?: number;
  readonly sleepT?: number;
  readonly snore?: number;
  readonly honk?: number;
  readonly bounce?: number;
}> = ({ x, y, s = 1, f = 0, sleepT = -1, snore = 0, honk = 0, bounce = 0 }) => {
  const by = -Math.abs(Math.sin(f * 0.5)) * 4 * bounce;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${by})`}>
        <rect x={-560} y={-420} width={1120} height={360} rx={60} fill={P.bus} stroke={INK} strokeWidth={10} />
        <rect x={-560} y={-150} width={1120} height={40} fill={P.busDark} />
        {Array.from({ length: 5 }).map((_, i) => {
          const wx = -470 + i * 190;
          const asleep = sleepT >= 0;
          const c = CROWD[i % CROWD.length];
          return (
            <g key={i}>
              <rect x={wx} y={-380} width={160} height={170} rx={20} fill="#BFEFFF" stroke={INK} strokeWidth={8} />
              <g transform={`translate(${wx + 80} ${-250}) scale(0.42) rotate(${asleep ? 18 * (i % 2 ? 1 : -1) : 0})`}>
                <circle r={105} fill={c.skin} stroke={INK} strokeWidth={14} />
                <Face r={105} skin={c.skin} eyes={asleep ? "closed" : "wide"} mouth={asleep ? "drool" : "flat"} open={0.3} brows={asleep ? "none" : "worried"} />
              </g>
              {snore > 0 ? (
                <circle cx={wx + 80 + Math.sin(f * 0.2 + i) * 10} cy={-420 - snore * (60 + 30 * Math.sin(f * 0.15 + i * 2))} r={45 + 40 * snore * (0.6 + 0.4 * Math.sin(f * 0.2 + i))} fill="#E8F7FF" stroke={INK} strokeWidth={6} opacity={0.9} />
              ) : null}
            </g>
          );
        })}
        <rect x={500} y={-380} width={50} height={230} rx={14} fill="#BFEFFF" stroke={INK} strokeWidth={8} />
        <rect x={540} y={-120} width={36} height={30} rx={8} fill="#FFF3B0" stroke={INK} strokeWidth={6} />
        <rect x={-570} y={-110} width={30} height={30} rx={8} fill={P.red} stroke={INK} strokeWidth={6} />
        {honk > 0 ? <Burst x={600} y={-200} r0={60} r1={60 + 140 * honk} n={9} color={P.red} /> : null}
      </g>
      {[-330, 330].map((wx) => (
        <g key={wx} transform={`translate(${wx} -60) rotate(${f * 12})`}>
          <circle r={78} fill={INK} />
          <circle r={34} fill={P.grey} stroke={INK} strokeWidth={6} />
          <line x1={-30} x2={30} y1={0} y2={0} stroke={INK} strokeWidth={6} />
        </g>
      ))}
    </g>
  );
};

/** Bus innen: Gang nach hinten (Fluchtpunkt), Sitzreihen links/rechts. */
export const BusInterior: React.FC<{ readonly tint?: number }> = ({ tint = 0 }) => (
  <g>
    <rect x={-1500} y={-1500} width={4080} height={4920} fill="#FFE9A8" />
    <path d="M -400 300 L 1480 300 L 1480 -600 L -400 -600 Z" fill="#FFF6D2" stroke={INK} strokeWidth={SW} />
    {/* Fenster links und rechts */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={-380 + i * 70} y={340 + i * 90} width={300 - i * 70} height={260 - i * 60} rx={24} fill={P.sky} stroke={INK} strokeWidth={SW} />
        <rect x={1160 - i * 0} y={340 + i * 90} width={300 - i * 70} height={260 - i * 60} rx={24} fill={P.sky} stroke={INK} strokeWidth={SW} />
      </g>
    ))}
    <path d="M 300 1950 L 460 820 L 620 820 L 780 1950 Z" fill="#7B6FA8" stroke={INK} strokeWidth={SW} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={300 + i * 4} y1={1950 - i * 230} x2={780 - i * 4} y2={1950 - i * 230} stroke={INK} strokeWidth={3} opacity={0.3} />)}
    <rect x={410} y={600} width={260} height={230} rx={20} fill={P.sky} stroke={INK} strokeWidth={SW} />
    <line x1={-400} y1={180} x2={1480} y2={180} stroke={P.grey} strokeWidth={18} />
    {tint > 0 ? <rect x={-1500} y={-1500} width={4080} height={4920} fill={P.night} opacity={tint} /> : null}
  </g>
);

/** Sitzlehne (von hinten) */
export const Seat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly c?: string }> = ({ x, y, s = 1, c = "#3D6BE0" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-220} width={240} height={260} rx={50} fill={c} stroke={INK} strokeWidth={SW} />
    <rect x={-90} y={-200} width={180} height={50} rx={20} fill="#FFFFFF" opacity={0.35} />
  </g>
);

/** Fahrerkabine: Lenkrad, Armaturen, Frontscheibe mit Brücke */
export const Cab: React.FC<{ readonly f: number; readonly clock?: string; readonly shake?: number; readonly dark?: number; readonly scroll?: number }> = ({ f, clock = "8:01", shake = 0, dark = 0, scroll }) => {
  const sx = Math.sin(f * 1.7) * shake;
  const roadScroll = scroll ?? f * 14;
  return (
    <g transform={`translate(${sx} 0)`}>
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#2E3A70" />
      {/* Frontscheibe */}
      <rect x={-100} y={120} width={1280} height={640} rx={60} fill={P.sky} stroke={INK} strokeWidth={10} />
      <rect x={-100} y={560} width={1280} height={200} fill={P.sea} />
      <path d="M 260 760 L 480 560 L 600 560 L 820 760 Z" fill={P.road} />
      {[0, 1, 2, 3].map((i) => {
        const k = ((roadScroll / 200 + i / 4) % 1 + 1) % 1;
        const yy = lerp(565, 760, k * k);
        return <rect key={i} x={540 - lerp(4, 18, k)} y={yy} width={lerp(8, 36, k)} height={lerp(6, 30, k)} fill="#FFF3B0" />;
      })}
      {/* Rückspiegel */}
      <rect x={560} y={140} width={520} height={220} rx={50} fill="#9FB0C8" stroke={INK} strokeWidth={10} />
      {/* Armaturen */}
      <path d="M -300 1180 Q 540 1020 1380 1180 L 1380 2500 L -300 2500 Z" fill="#454E86" stroke={INK} strokeWidth={10} />
      <rect x={330} y={1010} width={420} height={170} rx={24} fill="#101428" stroke={INK} strokeWidth={8} />
      <text x={540} y={1130} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={120} fill="#7CFFB2">
        {clock}
      </text>
      {dark > 0 ? <rect x={-1500} y={-1500} width={4080} height={4920} fill={P.night} opacity={dark} /> : null}
    </g>
  );
};

/** Lenkrad (Vordergrund), Ursprung = Mitte */
export const Wheel: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <circle r={250} fill="none" stroke={INK} strokeWidth={70} />
    <circle r={250} fill="none" stroke="#2A2F4A" strokeWidth={50} />
    <circle r={70} fill="#2A2F4A" stroke={INK} strokeWidth={10} />
    <line x1={-240} y1={0} x2={-70} y2={0} stroke="#2A2F4A" strokeWidth={40} />
    <line x1={240} y1={0} x2={70} y2={0} stroke="#2A2F4A" strokeWidth={40} />
  </g>
);

/** Brücke über das Meer (Weitwinkel), Fluchtpunkt oben; Ursprung egal (Welt 1080×1920) */
export const Bridge: React.FC<{ readonly f: number; readonly sunset?: number }> = ({ f, sunset = 0 }) => (
  <g>
    <Sky id={`bridge-${sunset}`} a={sunset ? "#FF9A7A" : P.sky} b={sunset ? "#FFE1A0" : P.skyLow} />
    <rect x={-1500} y={700} width={4080} height={3000} fill={P.sea} />
    {Array.from({ length: 18 }).map((_, i) => {
      const yy = 760 + i * 70;
      const xx = ((i * 263 + f * 2) % 1400) - 200;
      return <path key={i} d={`M ${xx} ${yy} q 30 -18 60 0 q 30 18 60 0`} fill="none" stroke="#E6FFFF" strokeWidth={6} opacity={0.7} />;
    })}
    {/* Fahrbahn verjüngt sich zum Horizont */}
    <path d="M 120 1920 L 520 700 L 560 700 L 960 1920 Z" fill={P.road} stroke={INK} strokeWidth={SW} />
    <path d="M 120 1920 L 520 700 L 500 700 L 60 1920 Z" fill={P.red} stroke={INK} strokeWidth={5} />
    <path d="M 960 1920 L 560 700 L 580 700 L 1020 1920 Z" fill={P.red} stroke={INK} strokeWidth={5} />
    {Array.from({ length: 8 }).map((_, i) => {
      const k = i / 8;
      const yy = lerp(720, 1900, k * k);
      return <rect key={i} x={540 - lerp(2, 14, k)} y={yy} width={lerp(4, 28, k)} height={lerp(8, 70, k)} fill="#FFF3B0" />;
    })}
  </g>
);

/** Brücke von der Seite (Super-Weit): lange Linie übers Meer, Pfeiler */
export const BridgeSide: React.FC<{ readonly f: number; readonly y?: number }> = ({ f, y = 1100 }) => (
  <g>
    <Sky id="bside" a={P.sky} b={P.skyLow} />
    <circle cx={850} cy={420} r={110} fill="#FFE36B" stroke={INK} strokeWidth={SW} />
    <rect x={-3000} y={y + 40} width={8000} height={3000} fill={P.sea} />
    {Array.from({ length: 30 }).map((_, i) => (
      <rect key={i} x={-2900 + i * 260} y={y} width={40} height={260} fill="#D9D2E8" stroke={INK} strokeWidth={5} />
    ))}
    <rect x={-3000} y={y - 40} width={8000} height={60} fill={P.red} stroke={INK} strokeWidth={SW} />
    {Array.from({ length: 12 }).map((_, i) => {
      const xx = ((i * 337 + f * 1.5) % 1600) - 300;
      return <path key={i} d={`M ${xx} ${y + 140 + (i % 4) * 90} q 30 -18 60 0 q 30 18 60 0`} fill="none" stroke="#E6FFFF" strokeWidth={6} opacity={0.7} />;
    })}
  </g>
);

/** Kinderwagen mit Baby (Ursprung = Bodenmitte) */
export const Stroller: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly open: number; readonly eyes?: Eyes; readonly f?: number }> = ({ x, y, s = 1, open, eyes = "open", f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 -260 Q -250 -40 0 -40 L 260 -40 L 260 -260 Z" fill={P.teal} stroke={INK} strokeWidth={SW} />
    <path d="M -260 -260 Q -240 -520 40 -470 L 40 -260 Z" fill={P.pink} stroke={INK} strokeWidth={SW} />
    {[-170, 170].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-10} r={50} fill={INK} />
        <circle cx={wx} cy={-10} r={20} fill={P.grey} />
      </g>
    ))}
    <g transform="translate(140 -300)">
      <circle r={120} fill={P.skin} stroke={INK} strokeWidth={SW} />
      <path d="M -10 -120 q 20 -40 30 -10" fill="none" stroke="#4A2E1E" strokeWidth={10} strokeLinecap="round" />
      <Face r={120} eyes={eyes} mouth="yawn" open={open} brows={open > 0.5 ? "sad" : "neutral"} f={f} blush />
    </g>
  </g>
);

/** Sprechblase mit Zick-Zack-Chart (Krypto-Gerede) */
export const ChartBubble: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly o?: number }> = ({ x, y, s = 1, f, o = 1 }) => {
  const pts = Array.from({ length: 9 }).map((_, i) => `${-200 + i * 50},${-30 + Math.sin(i * 1.9 + f * 0.25) * 60 - (i % 2 ? 30 : 0)}`);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-240} y={-150} width={480} height={280} rx={40} fill={P.white} stroke={INK} strokeWidth={SW} />
      <path d="M -60 130 L -110 210 L 20 130 Z" fill={P.white} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={-50} y={125} width={90} height={14} fill={P.white} />
      <polyline points={pts.join(" ")} fill="none" stroke={P.lime} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
      <text x={150} y={-80} fontFamily="Montserrat" fontWeight={900} fontSize={60} fill={P.orange} stroke={INK} strokeWidth={5} paintOrder="stroke">
        $
      </text>
    </g>
  );
};

/** Kissen */
export const Pillow: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <path d="M -150 -90 Q 0 -120 150 -90 Q 180 0 150 90 Q 0 120 -150 90 Q -180 0 -150 -90 Z" fill={P.white} stroke={INK} strokeWidth={SW} />
    <path d="M -90 -20 q 30 20 60 0" fill="none" stroke={P.grey} strokeWidth={6} />
  </g>
);

/** Zitrone */
export const Lemon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly bitten?: boolean }> = ({ x, y, s = 1, bitten }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={80} ry={60} fill="#FFE94A" stroke={INK} strokeWidth={SW} />
    {bitten ? <circle cx={70} cy={-20} r={36} fill="#FFFBD0" stroke={INK} strokeWidth={5} /> : null}
  </g>
);

/** Kaffee-Becher (riesig) */
export const Mug: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 -260 L 150 -260 L 120 0 L -120 0 Z" fill={P.white} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M 140 -200 q 90 0 80 80 q -10 60 -90 50" fill="none" stroke={INK} strokeWidth={22} />
    <ellipse cx={0} cy={-255} rx={145} ry={22} fill="#6B3A1E" />
  </g>
);

/** Absperrband (diagonal) */
export const Tape: React.FC<{ readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number; readonly text?: string }> = ({ x1, y1, x2, y2, text = "ILLEGAL MEETING" }) => {
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${a})`}>
      <rect x={0} y={-36} width={len} height={72} fill="#FFE14A" stroke={INK} strokeWidth={6} />
      {Array.from({ length: Math.ceil(len / 560) }).map((_, i) => (
        <text key={i} x={30 + i * 560} y={18} fontFamily="Montserrat" fontWeight={900} fontSize={46} fill={INK}>
          {text}
        </text>
      ))}
    </g>
  );
};

/** Schild mit großer Schrift (Preistafel, Haltestelle) */
export const Board: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly lines: readonly string[]; readonly bg?: string; readonly fg?: string; readonly size?: number; readonly r?: number }> = ({
  x,
  y,
  w,
  h,
  lines,
  bg = "#2B2240",
  fg = P.white,
  size = 80,
  r = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={24} fill={bg} stroke={INK} strokeWidth={SW} />
    {lines.map((l, i) => (
      <text key={l} x={0} y={-h / 2 + size * 1.1 + i * size * 1.15 + (h - lines.length * size * 1.15) / 2 - size * 0.1} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={size} fill={fg}>
        {l}
      </text>
    ))}
  </g>
);
