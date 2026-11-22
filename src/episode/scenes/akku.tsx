import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/akku-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, INK, P, Person, Sky, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";

/**
 * „In This City, When Your Phone Dies, You Die“ (episodes/akku-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Schnitte an Wort-Beats, eine Text-Ebene (Untertitel; Akku-Anzeige auf dem Handy ist der Gag), kein Set > 2 am Stück.
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.round(x));
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

const FONT = "Montserrat";
const A = {
  gary: "#FFC727",
  garyHair: "#6B3A1E",
  grey: "#B9BCC6",
  greySkin: "#D5D5D8",
  dusk1: "#2B2F77",
  dusk2: "#FF8A5C",
  night: "#1C1D4A",
  red: "#FF2E4D",
  green: "#3DDC6A",
  yellow: "#FFD23F",
  glow: "#FFF3A8",
  wall: "#BFE8FF",
  mint: "#BFF2DE",
  wood: "#C47A45",
  woodDark: "#8C4F26",
  grass: "#5E8F4A",
  stone: "#9AA3B5",
};

const hex = (c: string) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  const k = clamp01(t);
  return `#${x.map((v, j) => (256 + Math.round(lerp(v, y[j], k))).toString(16).slice(1)).join("")}`;
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
/** Gary: gelber Hoodie; grey 0..1 = Low Power Mode (entsättigt). */
const Gary: React.FC<Fig & { readonly grey?: number }> = ({ grey = 0, ...p }) => (
  <Person pants={mix("#2B3A67", "#8E909A", grey)} {...p} shirt={mix(A.gary, A.grey, grey)} hair="spiky" hairColor={mix(A.garyHair, "#9A9A9A", grey)} skin={mix(P.skin, A.greySkin, grey)} />
);
const Stranger: React.FC<Fig> = (p) => <Person pants="#F4F4F4" suit {...p} shirt="#FFFFFF" hair="side" hairColor="#E8B23A" skin={P.skin2} />;
const SuitMan: React.FC<Fig> = (p) => <Person pants="#2B2B3A" suit {...p} shirt="#3A4B8C" hair="side" hairColor="#2A1B12" skin={p.skin ?? "#CFE8B0"} />;

/** Sonnenbrille (Kopf-Koordinaten wie Person: Ursprung Füße). */
const Shades: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly seated?: boolean }> = ({ x, y, s = 1, seated }) => (
  <g transform={`translate(${x} ${y - (seated ? 336 : 416) * s}) scale(${s})`}>
    <rect x={-92} y={-38} width={78} height={44} rx={14} fill={INK} />
    <rect x={14} y={-38} width={78} height={44} rx={14} fill={INK} />
    <rect x={-16} y={-26} width={32} height={8} fill={INK} />
    <rect x={-80} y={-32} width={22} height={10} rx={4} fill="#FFFFFF" opacity={0.6} />
  </g>
);

/** Kleiner Geist (weißes Laken, „><“-Augen optional). */
const Ghost: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly o?: number; readonly xx?: boolean }> = ({ x, y, s = 1, f, o = 1, xx }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.2) * 10}) scale(${s})`} opacity={o}>
    <path d={`M -90 40 Q -100 -150 0 -160 Q 100 -150 90 40 Q 70 ${70 + Math.sin(f * 0.4) * 10} 45 40 Q 22 ${75 - Math.sin(f * 0.4) * 10} 0 40 Q -22 ${75 + Math.sin(f * 0.4) * 10} -45 40 Q -70 70 -90 40 Z`} fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {xx ? (
      <path d="M -50 -80 L -20 -60 L -50 -40 M 50 -80 L 20 -60 L 50 -40" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <g>
        <ellipse cx={-32} cy={-62} rx={14} ry={20} fill={INK} />
        <ellipse cx={32} cy={-62} rx={14} ry={20} fill={INK} />
      </g>
    )}
    <ellipse cx={0} cy={-15} rx={16} ry={12} fill={INK} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Handy + Akku                                                       */
/* ------------------------------------------------------------------ */

const lvlColor = (lv: number) => (lv <= 0.05 ? A.red : lv <= 0.2 ? "#FF8A2B" : lv < 0.6 ? A.yellow : A.green);

/** Akku-Symbol, lv 0..1, blink = rot blinken (f). */
const Battery: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lv: number; readonly f?: number; readonly blink?: boolean }> = ({ x, y, s = 1, lv, f = 0, blink }) => {
  const on = !blink || Math.floor(f / 6) % 2 === 0;
  const w = Math.max(6, 150 * clamp01(lv));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-90} y={-45} width={180} height={90} rx={18} fill="#FFFFFF" stroke={INK} strokeWidth={10} />
      <rect x={90} y={-18} width={18} height={36} rx={6} fill={INK} />
      {on ? <rect x={-75} y={-30} width={w} height={60} rx={8} fill={lvlColor(lv)} /> : null}
    </g>
  );
};

type ScreenKind = "battery" | "black" | "chat" | "call" | "update" | "full";
/** Handy (Hochformat). kind = Bildschirminhalt; pct = Akku in %; t = Frames für Animationen. */
const Phone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly kind: ScreenKind; readonly pct?: number; readonly f: number; readonly t?: number; readonly shake?: number; readonly glow?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  kind,
  pct = 1,
  f,
  t = 0,
  shake = 0,
  glow = 0,
}) => {
  const sx = shake ? Math.sin(f * 2.3) * shake : 0;
  const lv = pct / 100;
  const low = pct <= 5;
  let screen: React.ReactNode = null;
  if (kind === "black") screen = <rect x={-102} y={-198} width={204} height={386} rx={18} fill="#0B0B12" />;
  else if (kind === "battery" || kind === "full") {
    const bg = kind === "full" ? "#E9FFE9" : low ? "#2A0B12" : "#1E2240";
    screen = (
      <g>
        <rect x={-102} y={-198} width={204} height={386} rx={18} fill={bg} />
        <Battery x={0} y={-50} s={0.95} lv={lv} f={f} blink={low} />
        <text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={kind === "full" ? A.green : lvlColor(lv)} stroke={INK} strokeWidth={5} paintOrder="stroke">
          {`${Math.round(pct)}%`}
        </text>
      </g>
    );
  } else if (kind === "chat") {
    const n = Math.min(7, Math.floor(t / 3));
    screen = (
      <g>
        <rect x={-102} y={-198} width={204} height={386} rx={18} fill="#F2F4FF" />
        {Array.from({ length: n }).map((_, k) => {
          const left = k % 2 === 0;
          return <rect key={k} x={left ? -88 : -30} y={150 - (n - k) * 48} width={118} height={38} rx={16} fill={left ? "#D9DCEB" : "#4F8BFF"} stroke={INK} strokeWidth={3} />;
        })}
        <Battery x={60} y={-170} s={0.22} lv={lv} f={f} blink={low} />
      </g>
    );
  } else if (kind === "call") {
    const ring = Math.sin(t * 0.5) * 6;
    screen = (
      <g>
        <rect x={-102} y={-198} width={204} height={386} rx={18} fill="#2D2F66" />
        <path d={`M 0 ${-60 + ring} C -70 -120 -90 -40 0 10 C 90 -40 70 -120 0 ${-60 + ring} Z`} fill={P.pink} stroke={INK} strokeWidth={5} transform="translate(0 -20)" />
        <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill="#FFFFFF" stroke={INK} strokeWidth={4} paintOrder="stroke">
          MOM
        </text>
        <circle cx={-55} cy={140} r={32} fill={A.red} stroke={INK} strokeWidth={5} />
        <circle cx={55} cy={140} r={32} fill={A.green} stroke={INK} strokeWidth={5} />
        <Battery x={60} y={-170} s={0.22} lv={lv} f={f} blink />
      </g>
    );
  } else if (kind === "update") {
    screen = (
      <g>
        <rect x={-102} y={-198} width={204} height={386} rx={18} fill="#10131F" />
        <g transform={`translate(0 -20) rotate(${t * 14})`}>
          {Array.from({ length: 10 }).map((_, k) => (
            <rect key={k} x={-8} y={-62} width={16} height={30} rx={8} fill="#FFFFFF" opacity={0.15 + (k / 10) * 0.85} transform={`rotate(${k * 36})`} />
          ))}
        </g>
        <rect x={-70} y={90} width={140} height={14} rx={7} fill="#3A3F55" />
        <rect x={-70} y={90} width={140 * clamp01(t / 300)} height={14} rx={7} fill="#FFFFFF" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x + sx} ${y}) rotate(${r}) scale(${s})`}>
      {glow > 0 ? <circle r={330} fill={A.glow} opacity={0.4 * glow} /> : null}
      <rect x={-120} y={-220} width={240} height={440} rx={34} fill={INK} />
      {screen}
      <rect x={-30} y={-212} width={60} height={10} rx={5} fill="#3A3A4A" />
    </g>
  );
};

/** Hand, die ein Handy hält (Daumen vorn). */
const Thumb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly skin?: string }> = ({ x, y, s = 1, r = 0, skin = P.skin }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -40 120 Q -60 0 -20 -40 Q 10 -70 30 -40 Q 40 -10 20 30 Q 60 40 60 120 Z" fill={skin} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <ellipse cx={8} cy={-36} rx={14} ry={10} fill="#FFFFFF" opacity={0.7} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                           */
/* ------------------------------------------------------------------ */

const Skyline: React.FC<{ readonly y?: number; readonly dim?: number }> = ({ y = 1300, dim = 0 }) => (
  <g>
    {Array.from({ length: 12 }).map((_, k) => {
      const w = 180 + ((k * 53) % 90);
      const h = 380 + ((k * 137) % 420);
      const x = -800 + k * 230;
      return (
        <g key={k}>
          <rect x={x} y={y - h} width={w} height={h + 400} fill={mix(k % 2 ? "#3A3F8F" : "#2E3378", "#4A4A50", dim)} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 8 }).map((__, j) => (
            <rect key={j} x={x + 26 + (j % 2) * 80} y={y - h + 40 + Math.floor(j / 2) * 90} width={44} height={50} fill={(k + j) % 3 ? mix("#FFE27A", "#8A8A8A", dim) : mix("#5960B0", "#5A5A5A", dim)} />
          ))}
        </g>
      );
    })}
  </g>
);

const DuskStreet: React.FC<{ readonly ground?: number; readonly dim?: number; readonly id: string }> = ({ ground = 1450, dim = 0, id }) => (
  <g>
    <Sky id={id} a={mix(A.dusk1, "#4B4B52", dim)} b={mix(A.dusk2, "#9A9AA0", dim)} />
    <Skyline y={ground - 40} dim={dim} />
    <rect x={-2000} y={ground} width={5000} height={2000} fill={mix("#7E86A8", "#8A8A8A", dim)} stroke={INK} strokeWidth={8} />
    <rect x={-2000} y={ground + 160} width={5000} height={2000} fill={mix("#4C516B", "#5A5A5A", dim)} />
    {Array.from({ length: 10 }).map((_, k) => (
      <rect key={k} x={-900 + k * 360} y={ground + 260} width={180} height={22} rx={8} fill={mix(A.yellow, "#BDBDBD", dim)} />
    ))}
  </g>
);

const BusStop: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 380} y={y - 760} width={20} height={760} fill={INK} />
    <rect x={x + 360} y={y - 760} width={20} height={760} fill={INK} />
    <rect x={x - 420} y={y - 800} width={840} height={70} rx={16} fill={P.teal} stroke={INK} strokeWidth={8} />
    <rect x={x - 360} y={y - 720} width={720} height={540} fill="#BFE8FF" opacity={0.35} stroke={INK} strokeWidth={5} />
    <rect x={x - 330} y={y - 230} width={660} height={36} rx={10} fill={A.wood} stroke={INK} strokeWidth={7} />
    <rect x={x - 300} y={y - 194} width={20} height={194} fill={INK} />
    <rect x={x + 280} y={y - 194} width={20} height={194} fill={INK} />
  </g>
);

const Room: React.FC<{ readonly wall?: string; readonly floor?: number; readonly window?: boolean }> = ({ wall = A.wall, floor = 1500, window }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={2000 + floor} fill={wall} />
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={k} x={-600 + k * 220} y={-2000} width={70} height={2000 + floor} fill="#FFFFFF" opacity={0.18} />
    ))}
    <rect x={-2000} y={floor} width={5000} height={2000} fill={A.wood} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 14 }).map((_, k) => (
      <line key={k} x1={-900 + k * 240} x2={-1100 + k * 300} y1={floor} y2={floor + 900} stroke={A.woodDark} strokeWidth={5} />
    ))}
    {window ? (
      <g>
        <rect x={640} y={420} width={380} height={460} rx={14} fill={A.night} stroke={INK} strokeWidth={9} />
        <circle cx={900} cy={530} r={50} fill="#FFF4C2" />
        <path d="M 830 420 L 830 880 M 640 650 L 1020 650" stroke={INK} strokeWidth={8} />
      </g>
    ) : null}
  </g>
);

const Bed: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly c?: string }> = ({ x, y, w = 760, c = "#7FA8FF" }) => (
  <g>
    <rect x={x - w / 2 - 30} y={y - 380} width={40} height={420} rx={14} fill={A.woodDark} stroke={INK} strokeWidth={7} />
    <rect x={x - w / 2} y={y - 120} width={w} height={130} rx={20} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <rect x={x - w / 2 + 200} y={y - 150} width={w - 200} height={150} rx={26} fill={c} stroke={INK} strokeWidth={7} />
    <rect x={x - w / 2 + 20} y={y - 190} width={180} height={90} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
  </g>
);

/** Infusionsständer mit Powerbank statt Beutel, Kabel zum Patienten. */
const PowerDrip: React.FC<{ readonly x: number; readonly y: number; readonly tx: number; readonly ty: number; readonly lv: number; readonly f: number }> = ({ x, y, tx, ty, lv, f }) => (
  <g>
    <rect x={x - 6} y={y - 760} width={12} height={760} fill="#7A8296" />
    <rect x={x - 70} y={y - 20} width={140} height={20} rx={8} fill="#7A8296" />
    <rect x={x - 60} y={y - 900} width={120} height={180} rx={18} fill="#2B2F45" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3].map((k) => (
      <rect key={k} x={x - 40} y={y - 760 - (k + 1) * 34} width={80} height={24} rx={6} fill={k < Math.round(lv * 4) ? A.green : "#4A4F66"} opacity={k === Math.round(lv * 4) - 1 ? 0.6 + 0.4 * Math.sin(f * 0.4) : 1} />
    ))}
    <path d={`M ${x} ${y - 720} Q ${(x + tx) / 2} ${ty + 120} ${tx} ${ty}`} fill="none" stroke={INK} strokeWidth={6} />
  </g>
);

const RockingChair: React.FC<{ readonly x: number; readonly y: number; readonly rock: number }> = ({ x, y, rock }) => (
  <g transform={`translate(${x} ${y}) rotate(${rock})`}>
    <path d="M -200 20 Q 0 80 200 20" fill="none" stroke={A.woodDark} strokeWidth={16} strokeLinecap="round" />
    <rect x={-150} y={-560} width={36} height={580} rx={10} fill={A.wood} stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-60} width={300} height={34} rx={10} fill={A.wood} stroke={INK} strokeWidth={6} />
    <rect x={120} y={-60} width={30} height={80} fill={A.wood} stroke={INK} strokeWidth={5} />
  </g>
);

const Cake: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-220} y={-200} width={440} height={200} rx={30} fill="#FFF4DE" stroke={INK} strokeWidth={8} />
    <path d="M -220 -150 Q -170 -110 -120 -150 Q -70 -110 -20 -150 Q 30 -110 80 -150 Q 130 -110 180 -150 L 220 -150 L 220 -200 L -220 -200 Z" fill={P.pink} stroke={INK} strokeWidth={6} />
    {Array.from({ length: 18 }).map((_, k) => {
      const cx = -200 + (k % 9) * 50 + (k > 8 ? 25 : 0);
      const cy = -200 - (k > 8 ? 40 : 0);
      return (
        <g key={k}>
          <rect x={cx - 7} y={cy - 70} width={14} height={70} fill={k % 2 ? P.teal : P.purple} stroke={INK} strokeWidth={3} />
          <ellipse cx={cx} cy={cy - 86 + Math.sin(f * 0.6 + k) * 3} rx={9} ry={16} fill="#FFB020" />
        </g>
      );
    })}
  </g>
);

const FlipPhone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-40} y={-120} width={80} height={110} rx={14} fill="#8A93A8" stroke={INK} strokeWidth={6} />
    <rect x={-28} y={-106} width={56} height={60} rx={6} fill="#B8F0A0" />
    <rect x={-40} y={-6} width={80} height={110} rx={14} fill="#8A93A8" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }).map((_, k) => (
      <rect key={k} x={-26 + (k % 3) * 20} y={10 + Math.floor(k / 3) * 26} width={14} height={16} rx={3} fill="#EDEFF5" />
    ))}
  </g>
);

const ReactBg: React.FC<{ readonly a: string; readonly b: string; readonly f: number; readonly cx?: number; readonly cy?: number }> = ({ a, b, f, cx = 540, cy = 900 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={a} />
    {Array.from({ length: 16 }).map((_, k) => {
      const t = (k / 16) * Math.PI * 2 + f * 0.004;
      const t2 = t + Math.PI / 16;
      return <path key={k} d={`M ${cx} ${cy} L ${cx + Math.cos(t) * 3000} ${cy + Math.sin(t) * 3000} L ${cx + Math.cos(t2) * 3000} ${cy + Math.sin(t2) * 3000} Z`} fill={b} />;
    })}
  </g>
);

const SpeedLines: React.FC<{ readonly f: number; readonly y0?: number; readonly y1?: number }> = ({ f, y0 = 500, y1 = 1400 }) => (
  <g>
    {Array.from({ length: 14 }).map((_, k) => {
      const yy = lerp(y0, y1, (k * 0.37) % 1);
      const xx = 1300 - (((f * 70 + k * 210) % 2200) + 0);
      return <rect key={k} x={xx} y={yy} width={260} height={10} rx={5} fill="#FFFFFF" opacity={0.7} />;
    })}
  </g>
);

const Snail: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -120 0 Q -130 -40 -80 -40 L 90 -40 Q ${130 + Math.sin(f * 0.5) * 6} -40 130 0 Z`} fill="#C9E86A" stroke={INK} strokeWidth={6} />
    <circle cx={-10} cy={-100} r={80} fill={P.orange} stroke={INK} strokeWidth={7} />
    <path d="M -10 -100 m -50 0 a 50 50 0 1 1 50 50 a 30 30 0 1 1 -20 -40" fill="none" stroke={INK} strokeWidth={6} />
    <line x1={110} y1={-36} x2={130} y2={-100} stroke={INK} strokeWidth={5} />
    <line x1={124} y1={-36} x2={160} y2={-92} stroke={INK} strokeWidth={5} />
    <circle cx={130} cy={-104} r={10} fill={INK} />
    <circle cx={162} cy={-96} r={10} fill={INK} />
  </g>
);

const Fly: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={-18} cy={-22} rx={22} ry={14} fill="#FFFFFF" opacity={0.75} stroke={INK} strokeWidth={3} transform={`rotate(${-30 + Math.sin(f * 3) * 25} -4 -10)`} />
    <ellipse cx={18} cy={-22} rx={22} ry={14} fill="#FFFFFF" opacity={0.75} stroke={INK} strokeWidth={3} transform={`rotate(${30 - Math.sin(f * 3) * 25} 4 -10)`} />
    <ellipse rx={20} ry={14} fill={INK} />
    <circle cx={14} cy={-4} r={6} fill={A.red} />
  </g>
);

const Door: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly color?: string }> = ({ x, y, open, color = "#2F8F6B" }) => (
  <g>
    <rect x={x - 200} y={y - 760} width={400} height={760} fill="#1A1430" stroke={INK} strokeWidth={9} />
    <rect x={x - 200} y={y - 760} width={400} height={760} fill="#FFE9A8" opacity={0.85 * open} />
    <g transform={`translate(${x - 200} 0) scale(${1 - open * 0.85} 1)`}>
      <rect x={0} y={y - 760} width={400} height={760} fill={color} stroke={INK} strokeWidth={8} />
      <circle cx={340} cy={y - 380} r={20} fill={A.yellow} stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

/** Steckdose (Wand), glow 0..1. */
const Outlet: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 ? <circle r={260} fill={A.glow} opacity={0.5 * glow} /> : null}
    <rect x={-120} y={-160} width={240} height={320} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    {[-60, 60].map((cy) => (
      <g key={cy}>
        <circle cx={0} cy={cy} r={48} fill="#F0F0F4" stroke={INK} strokeWidth={6} />
        <rect x={-24} y={cy - 22} width={12} height={34} rx={4} fill={INK} />
        <rect x={12} y={cy - 22} width={12} height={34} rx={4} fill={INK} />
      </g>
    ))}
  </g>
);

/** Stecker + Kabel; bend = Biegung (Grad) wenn er nicht passt. */
const Plug: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly bend?: number; readonly wrong?: boolean }> = ({ x, y, s = 1, r = 0, bend = 0, wrong }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d={`M 0 0 Q 0 ${300} ${-120} 600`} fill="none" stroke="#F4F4F4" strokeWidth={26} />
    <path d={`M 0 0 Q 0 ${300} ${-120} 600`} fill="none" stroke={INK} strokeWidth={4} />
    <rect x={-46} y={-80} width={92} height={110} rx={16} fill="#F4F4F4" stroke={INK} strokeWidth={7} />
    <g transform={`rotate(${bend} 0 -80)`}>
      {wrong ? <rect x={-30} y={-150} width={60} height={70} rx={8} fill="#CFD3DE" stroke={INK} strokeWidth={6} /> : <rect x={-14} y={-140} width={28} height={60} rx={6} fill="#CFD3DE" stroke={INK} strokeWidth={6} />}
    </g>
  </g>
);

const Rain: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    {Array.from({ length: 40 }).map((_, k) => {
      const x = -300 + ((k * 97) % 1700);
      const y = ((f * 38 + k * 173) % 2400) - 400;
      return <line key={k} x1={x} y1={y} x2={x - 18} y2={y + 70} stroke="#C9D6F0" strokeWidth={5} opacity={0.6} />;
    })}
  </g>
);

const Cemetery: React.FC<{ readonly f: number; readonly ground?: number }> = ({ f, ground = 1350 }) => (
  <g>
    <Sky id="cem" a="#4B5578" b="#9AA6C2" />
    <path d={`M -1000 ${ground - 200} Q 540 ${ground - 420} 2000 ${ground - 200} L 2000 3000 L -1000 3000 Z`} fill="#4E7A45" />
    <rect x={-2000} y={ground} width={5000} height={2000} fill={A.grass} stroke={INK} strokeWidth={8} />
    {[-200, 120, 980, 1260].map((x, k) => (
      <path key={k} d={`M ${x - 60} ${ground - 120 + k * 10} L ${x - 60} ${ground - 260} Q ${x} ${ground - 330} ${x + 60} ${ground - 260} L ${x + 60} ${ground - 120 + k * 10} Z`} fill={A.stone} stroke={INK} strokeWidth={6} />
    ))}
    <Rain f={f} />
  </g>
);

const Coffin: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -330 0 L -380 -110 L -300 -180 L 330 -180 L 380 -110 L 330 0 Z" fill="#6B3A1E" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -300 -180 L 330 -180" stroke="#9A5A2E" strokeWidth={12} />
    {/* Steckdosenleiste auf dem Sarg */}
    <rect x={-200} y={-230} width={400} height={56} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    {[-140, -70, 0, 70, 140].map((cx) => (
      <circle key={cx} cx={cx} cy={-202} r={16} fill="#E2E4EC" stroke={INK} strokeWidth={4} />
    ))}
  </g>
);

const Tomb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 0 L -260 -560 Q 0 -760 260 -560 L 260 0 Z" fill={A.stone} stroke={INK} strokeWidth={10} />
    <path d="M -200 -40 L -200 -540 Q 0 -690 200 -540 L 200 -40" fill="none" stroke="#7D869A" strokeWidth={8} />
    <Battery x={0} y={-430} s={0.9} lv={0} />
    <path d="M -110 -300 L 110 -300 M -80 -240 L 80 -240" stroke="#6B7386" strokeWidth={14} strokeLinecap="round" />
    <path d="M -60 -150 L 60 -150 M 0 -210 L 0 -90" stroke="#6B7386" strokeWidth={16} strokeLinecap="round" />
  </g>
);

const Flatline: React.FC<{ readonly t: number; readonly y: number; readonly o?: number }> = ({ t, y, o = 1 }) => {
  const k = clamp01(t / 24);
  const xEnd = lerp(-100, 1180, k);
  return (
    <g opacity={o}>
      <path d={`M -100 ${y} L 200 ${y} L 240 ${y - 120} L 290 ${y + 110} L 330 ${y} L ${Math.max(330, xEnd)} ${y}`} fill="none" stroke={A.green} strokeWidth={14} strokeLinejoin="round" strokeDasharray="4000" strokeDashoffset={lerp(4000, 2600, k)} />
    </g>
  );
};

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

export const KHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("you", 0.6) - 2], d, f);
  if (i === 0) {
    // Mann an der Haltestelle, Handy blinkt 1 % rot, Schweiß; bei „dies“ wird der Bildschirm schwarz
    const dead = W("dies", 0.45);
    const black = lf >= dead;
    const cam = frameOn(540, 1000, 540, 820, lerp(1.35, 1.5, ease(lf, 0, len)));
    return (
      <Shot cam={{ ...cam, x: cam.x + jolt(lf, dead, 8) }}>
        <Layer depth={0.6}>
          <DuskStreet id="hook" />
          <BusStop x={540} y={1450} />
        </Layer>
        <Layer>
          <SuitMan x={520} y={1250} s={1.05} seated eyes="wide" look={[1, -0.6]} brows={black ? "up" : "worried"} mouth={black ? "o" : "frown"} open={0.5} armR={120} bendR={-80} armL={30} />
          <Sweat x={430} y={760} s={1.1} o={1} />
          <Sweat x={640} y={720} s={0.8} o={bump(lf, 8, 10)} />
          <Phone x={760} y={760} s={0.9} r={-8} kind={black ? "black" : "battery"} pct={1} f={f} shake={black ? 0 : 4} glow={black ? 0 : 0.5 + 0.5 * Math.sin(lf * 0.5)} />
        </Layer>
      </Shot>
    );
  }
  // Steif, X-Augen, kippt wie ein Brett von der Bank; kleiner Geist mit totem Handy steigt auf
  const fall = ease(lf, 2, 12, "inOut");
  return (
    <Shot cam={{ x: 540 + jolt(lf, 12, 16), y: 980, zoom: 1.15 }}>
      <Layer depth={0.6}>
        <DuskStreet id="hook2" />
        <BusStop x={540} y={1450} />
      </Layer>
      <Layer>
        <SuitMan x={lerp(520, 640, fall)} y={lerp(1250, 1450, fall)} s={1.05} seated={fall < 0.5} lean={lerp(0, 88, fall)} eyes="xx" brows="none" mouth="o" open={0.3} armL={8} armR={8} />
        <Phone x={lerp(760, 300, fall)} y={lerp(760, 1420, fall)} s={0.5} r={lerp(-8, 70, fall)} kind="black" f={f} />
        <Ghost x={620} y={lerp(1000, 520, ease(lf, 10, len))} s={0.9} f={lf} o={clamp01((lf - 9) / 5)} xx />
        <Burst x={700} y={1350} r0={140} r1={230} n={10} o={bump(lf, 12, 6)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

const FAMILY = [
  { shirt: P.teal, hair: "curly" as const, hairColor: "#2A1B12", skin: P.skin2 },
  { shirt: P.purple, hair: "bun" as const, hairColor: "#F2F2F2", skin: P.skin },
  { shirt: P.orange, hair: "side" as const, hairColor: "#4A2E1E", skin: P.skin3 },
];

export const KRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Power", 0.35) - 3, W("old", 0.65) - 3], d, f);
  if (i === 0) {
    // Teenager im Bett, Familie weint, sie flüstert „goodbye“, Handy 2 %
    const bye = W("goodbye", 0.25);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 820, 1.05)], [len, frameOn(540, 1050, 540, 820, 1.2)]])}>
        <Layer depth={0.7}>
          <Room wall="#C9B8FF" floor={1500} window />
        </Layer>
        <Layer>
          {FAMILY.map((m, k) => (
            <Person key={k} x={-40 + k * 260} y={1500} s={0.95} {...m} eyes="closed" brows="sad" mouth="frown" armL={k === 1 ? 150 : 20} bendL={-90} armR={20} nod={6} />
          ))}
          <Bed x={760} y={1500} w={640} />
          <Person x={620} y={1360} s={0.78} seated shirt={P.pink} hair="pony" hairColor="#6B3A1E" skin={P.skin} eyes={lf >= bye ? "half" : "open"} brows="sad" mouth={lf >= bye ? "talk" : "frown"} open={0.3} armR={lerp(40, 110, ease(lf, bye, bye + 8))} bendR={-60} nod={-8} />
          <Phone x={830} y={980} s={0.42} r={10} kind="battery" pct={2} f={f} />
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={-40 + k * 260 + 30} cy={1500 - 420 + ((lf * 6 + k * 30) % 120)} rx={10} ry={16} fill="#7FD6FF" stroke={INK} strokeWidth={3} />
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Krankenhaus: Patienten am Powerbank-Tropf, Schwester tauscht eine Powerbank
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 860, 0.8)], [len, frameOn(640, 1150, 540, 860, 0.86)]])}>
        <Layer depth={0.7}>
          <Room wall={A.mint} floor={1500} />
          <path d="M -400 300 L 1600 300" stroke="#FFFFFF" strokeWidth={30} />
        </Layer>
        <Layer>
          {[0, 1].map((k) => (
            <g key={k}>
              <Bed x={120 + k * 820} y={1500} w={560} c="#9BC8FF" />
              <Person x={10 + k * 820} y={1360} s={0.7} seated shirt="#DCEBFF" hair={k ? "curly" : "none"} hairColor="#4A2E1E" skin={k ? P.skin2 : P.skin} eyes={k ? "half" : "closed"} brows="neutral" mouth={k ? "flat" : "smile"} armR={30} />
              <PowerDrip x={-260 + k * 820} y={1500} tx={60 + k * 820} ty={1180} lv={k ? 0.25 : 0.75} f={lf + k * 7} />
            </g>
          ))}
          <Person x={620} y={1500} s={0.95} shirt="#5BC0EB" pants="#5BC0EB" hair="bun" hairColor="#2A1B12" skin={P.skin3} cap eyes="open" look={[1, -0.5]} brows="neutral" mouth="smug" armR={150} bendR={-30} armL={20} gest={4} />
          <rect x={660 + Math.sin(lf * 0.3) * 6} y={720} width={110} height={160} rx={16} fill="#2B2F45" stroke={INK} strokeWidth={6} transform={`rotate(-12 715 800)`} />
        </Layer>
      </Shot>
    );
  }
  // Veranda: uralter Mann mit Klapphandy, Torte voller Kerzen, Geister-Freunde winken
  const rock = Math.sin(lf * 0.12) * 4;
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 900, 1.0)], [len, frameOn(540, 1100, 540, 900, 1.12)]])}>
      <Layer depth={0.7}>
        <Room wall="#FFD9A8" floor={1500} window />
      </Layer>
      <Layer>
        <Ghost x={140} y={760} s={0.8} f={lf} />
        <Ghost x={950} y={700} s={0.7} f={lf + 9} />
        <RockingChair x={420} y={1480} rock={rock} />
        <g transform={`rotate(${rock} 420 1480)`}>
          <Person x={420} y={1420} s={0.95} seated shirt="#B5895B" cardigan hair="none" hairColor="#F2F2F2" skin="#F2C7A5" stache bags={0.9} eyes="half" brows="neutral" mouth="smug" armR={110} bendR={-70} armL={10} />
          <FlipPhone x={570} y={890} s={1.1} r={-10} />
        </g>
        <Cake x={830} y={1500} s={0.85} f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* gary                                                               */
/* ================================================================== */

export const KGary: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Three", 0.4) - 3], d, f);
  if (i === 0) {
    // Gary tritt aus dem Büro, hebt das Handy: 9 %
    const look = ease(lf, W("Nine", 0.3) - 6, W("Nine", 0.3));
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 820, 1.25)], [len, frameOn(540, 980, 540, 820, 1.4)]])}>
        <Layer depth={0.6}>
          <DuskStreet id="gary" />
          <rect x={150} y={500} width={780} height={960} fill="#5B6BB8" stroke={INK} strokeWidth={9} />
          <rect x={330} y={800} width={420} height={660} fill="#BFE8FF" stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          <Gary x={lerp(470, 500, ease(lf, 0, 12))} y={1460} s={1.0} eyes="open" look={[1, -0.6]} brows={look > 0.5 ? "worried" : "neutral"} mouth={look > 0.5 ? "frown" : "flat"} armR={lerp(20, 125, look)} bendR={-80} armL={12} gest={3} />
          <Phone x={720} y={lerp(1300, 800, look)} s={0.55} r={-6} kind="battery" pct={9} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Weite: gestrichelter Weg zu einem winzigen Haus mit leuchtender Steckdose am Horizont
  const walk = ease(lf, 0, len);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(300, 1200, 300, 1000, 0.8)], [len, frameOn(700, 1100, 540, 900, 0.85)]])}>
      <Layer depth={0.5}>
        <Sky id="map" a={A.dusk1} b={A.dusk2} />
        <path d="M -1000 1000 Q 540 800 2200 980 L 2200 3000 L -1000 3000 Z" fill="#3E4A8A" stroke={INK} strokeWidth={8} />
      </Layer>
      <Layer>
        <path d="M 100 1450 Q 500 1200 800 1250 Q 1100 1300 1300 1000" fill="none" stroke={A.yellow} strokeWidth={14} strokeDasharray="30 30" strokeDashoffset={0} opacity={1} pathLength={1000} strokeLinecap="round" />
        <g transform="translate(1300 1000)">
          <circle r={140} fill={A.glow} opacity={0.4 + 0.2 * Math.sin(lf * 0.3)} />
          <path d="M -70 0 L -70 -90 L 0 -150 L 70 -90 L 70 0 Z" fill="#FFE1C2" stroke={INK} strokeWidth={6} />
          <rect x={-22} y={-70} width={44} height={56} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        </g>
        <Gary x={lerp(100, 180, walk)} y={lerp(1460, 1420, walk)} s={0.55} eyes="open" look={[1, -0.3]} brows="worried" mouth="frown" armL={20} armR={40} />
        <Phone x={lerp(190, 270, walk)} y={lerp(1230, 1190, walk)} s={0.22} kind="battery" pct={9} f={f} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* lowpower                                                           */
/* ================================================================== */

export const KLowpower: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("walks", 0.5) - 3, W("stops", 0.75) - 3], d, f);
  if (i === 0) {
    // Gary tippt „Low Power“ – wird grau und halb durchsichtig
    const g = ease(lf, W("dims", 0.4) - 4, W("dims", 0.4) + 8);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 840, 1.3)], [len, frameOn(540, 1050, 540, 840, 1.45)]])}>
        <Layer depth={0.6}>
          <DuskStreet id="lp1" dim={g * 0.6} />
        </Layer>
        <Layer opacity={1 - g * 0.35}>
          <Gary x={480} y={1460} s={1.0} grey={g} eyes={g > 0.5 ? "half" : "open"} look={[1, -0.5]} brows="neutral" mouth="flat" armR={120} bendR={-80} armL={10} />
          <Phone x={700} y={820} s={0.55} r={-6} kind="battery" pct={8} f={f} />
        </Layer>
        <Burst x={700} y={820} r0={150} r1={220} n={8} o={bump(lf, W("dims", 0.4), 6)} color={A.yellow} />
      </Shot>
    );
  }
  if (i === 1) {
    // Weite: graue Zeitlupe, eine Schnecke überholt ihn
    return (
      <Shot cam={{ x: 540, y: 1150, zoom: 0.9 }}>
        <Layer depth={0.6}>
          <DuskStreet id="lp2" dim={0.6} />
        </Layer>
        <Layer>
          <g opacity={0.7}>
            <Gary x={lerp(420, 470, lf / Math.max(1, len))} y={1460} s={0.85} grey={1} eyes="half" brows="neutral" mouth="flat" lean={2} armL={lerp(-10, 10, Math.sin(lf * 0.05))} armR={lerp(10, -10, Math.sin(lf * 0.05))} />
          </g>
          <Snail x={lerp(120, 900, lf / Math.max(1, len))} y={1470} s={0.8} f={lf} />
        </Layer>
      </Shot>
    );
  }
  // ECU: trockene, starre Augen – eine Fliege landet auf dem Augapfel
  const land = ease(lf, 6, 16);
  return (
    <Shot cam={frameOn(540, 1040, 540, 760, 3.6 + 0.2 * ease(lf, 0, len))}>
      <Layer depth={0.6}>
        <ReactBg a="#8E909A" b="#A6A8B2" f={lf} />
      </Layer>
      <Layer>
        <Gary x={540} y={1460} s={1.0} grey={1} eyes="wide" look={[0, 0]} brows="none" mouth="flat" />
        <Fly x={lerp(900, 582, land)} y={lerp(700, 1000, land) + (land < 1 ? Math.sin(lf * 1.3) * 30 : 0)} s={0.5} f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* chat                                                               */
/* ================================================================== */

export const KChat: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Don't", 0.4) - 3, W("opens", 0.6) - 2, W("Worth", 0.88) - 3], d, f);
  if (i === 0) {
    // ECU: Handy vibriert, Nachrichten stapeln sich, rotes Abzeichen
    return (
      <Shot cam={{ x: 540, y: 900 + jolt(lf, 3, 8), zoom: 1 }}>
        <Layer depth={0}>
          <ReactBg a="#2D2F66" b="#383B7A" f={lf} />
        </Layer>
        <Layer>
          <Phone x={540} y={820} s={2.2} kind="chat" pct={8} f={f} t={lf} shake={6} />
          <circle cx={760} cy={370} r={70} fill={A.red} stroke={INK} strokeWidth={8} transform={`scale(1)`} />
          <text x={760} y={396} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#FFFFFF">
            47
          </text>
          {[0, 1].map((k) => (
            <path key={k} d={`M ${250 - k * 40} ${700 + k * 80} q -40 40 0 80 M ${830 + k * 40} ${700 + k * 80} q 40 40 0 80`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(lf * 0.9 + k)} />
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: Daumen schwebt, Gary schwitzt (grau) – drückt
    return (
      <Shot cam={frameOn(540, 1000, 540, 760, 1.9 + 0.15 * ease(lf, 0, len))}>
        <Layer depth={0.6}>
          <ReactBg a="#FF8FC7" b="#FFB3D9" f={lf} cx={540} cy={760} />
        </Layer>
        <Layer>
          <Gary x={470} y={1460} s={1.0} grey={0.8} eyes="twitch" look={[1, 0.5]} brows="worried" mouth="frown" armR={110} bendR={-70} armL={10} f={lf} />
          <Sweat x={400} y={900} s={0.9} o={1} />
          <Sweat x={560} y={880} s={0.7} o={bump(lf, 10, 8)} />
          <Phone x={700} y={1060} s={0.6} r={-10} kind="chat" pct={8} f={f} t={30} />
          <Thumb x={720} y={lerp(1040, 1100, (Math.sin(lf * 0.4) + 1) / 2)} s={0.6} r={-15} skin={A.greySkin} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // ECU: der Akku läuft aus wie ein Abfluss → 4 %
    const drain = ease(lf, 2, len - 4);
    return (
      <Shot cam={{ x: 540, y: 900, zoom: 1 + 0.08 * drain }}>
        <Layer depth={0}>
          <ReactBg a="#2A0B12" b="#3A1220" f={lf} />
        </Layer>
        <Layer>
          <Phone x={540} y={860} s={2.3} kind="battery" pct={Math.round(lerp(8, 4, drain))} f={f} />
          <path d={`M 540 ${1380} q -30 ${60 * drain} 0 ${120 * drain} q 30 ${60 * drain} 0 ${120 * drain}`} fill="none" stroke={A.red} strokeWidth={18} strokeLinecap="round" opacity={drain} />
        </Layer>
      </Shot>
    );
  }
  // „Worth it.“ – Gary grinst selig ins Handy, Lachtränen
  return (
    <Shot cam={frameOn(540, 1000, 540, 780, 1.8)}>
      <Layer depth={0.6}>
        <ReactBg a={A.yellow} b="#FFE58A" f={lf} cx={540} cy={780} />
      </Layer>
      <Layer>
        <Gary x={480} y={1460} s={1.0} grey={0.8} eyes="squint" brows="up" mouth="grin" open={0.6} armR={115} bendR={-80} armL={10} nod={-6} />
        <Phone x={710} y={830} s={0.5} r={-8} kind="chat" pct={4} f={f} t={30} />
        {[-1, 1].map((sd) => (
          <ellipse key={sd} cx={480 + sd * 95} cy={1040 + ((lf * 5) % 60)} rx={10} ry={16} fill="#7FD6FF" stroke={INK} strokeWidth={3} />
        ))}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* stranger                                                           */
/* ================================================================== */

export const KStranger: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("cable", 0.25) - 3, W("hundred", 0.45) - 3, W("Gary", 0.8) - 3], d, f);
  if (i === 0) {
    // Ein Fremder im weißen Anzug hebt ein Ladekabel – Heiligenschein-Glow
    return (
      <Shot cam={camPath(lf, [[0, frameOn(640, 1000, 540, 820, 1.05)], [len, frameOn(640, 1000, 540, 820, 1.15)]])}>
        <Layer depth={0.6}>
          <DuskStreet id="str1" dim={0.4} />
          <BusStop x={640} y={1450} />
        </Layer>
        <Layer>
          <circle cx={800} cy={760} r={320} fill={A.glow} opacity={0.45 + 0.1 * Math.sin(lf * 0.3)} />
          <Stranger x={800} y={1460} s={1.0} eyes="open" mouth="smug" brows="up" armR={160} bendR={-20} armL={10} />
          <Shades x={800} y={1460} s={1.0} />
          <Plug x={1000} y={560} s={0.5} r={10} />
          <Gary x={300} y={1460} s={1.0} grey={0.8} eyes="wide" look={[1, -0.5]} brows="up" mouth="o" open={0.5} armL={150} bendL={-30} armR={150} bendR={-30} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // ECU: der Stecker passt nicht – verbiegt sich
    const push = ease(lf, 2, 10);
    return (
      <Shot cam={{ x: 540, y: 900 + jolt(lf, 10, 10), zoom: 1 }}>
        <Layer depth={0}>
          <ReactBg a="#3A3F8F" b="#454AA0" f={lf} />
        </Layer>
        <Layer>
          <g transform="translate(540 560) rotate(180) scale(1.9)">
            <rect x={-120} y={-220} width={240} height={440} rx={34} fill={INK} />
            <rect x={-26} y={-226} width={52} height={20} rx={8} fill="#55586A" />
          </g>
          <Plug x={540} y={lerp(1150, 1030, push)} s={1.6} bend={lf > 10 ? Math.min(35, (lf - 10) * 6) : 0} wrong />
          <Burst x={540} y={980} r0={110} r1={180} n={8} o={bump(lf, 11, 6)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Der Fremde, voll geladen (grüne Aura), lacht und schlürft Smoothie; Gary grau davor
    return (
      <Shot cam={camPath(lf, [[0, frameOn(700, 1000, 540, 820, 1.2)], [len, frameOn(700, 1000, 540, 820, 1.32)]])}>
        <Layer depth={0.6}>
          <ReactBg a="#3DDC6A" b="#6BF08E" f={lf} cx={700} cy={760} />
        </Layer>
        <Layer>
          <Stranger x={720} y={1460} s={1.0} eyes="squint" mouth="grin" open={0.7} brows="up" armR={120} bendR={-90} armL={20} nod={Math.sin(lf * 0.6) * 6} />
          <Shades x={720} y={1460} s={1.0} />
          <g transform={`translate(${870} ${900})`}>
            <path d="M -50 -110 L 50 -110 L 36 60 L -36 60 Z" fill="#FF8FC7" stroke={INK} strokeWidth={6} />
            <rect x={6} y={-190} width={12} height={90} fill={A.red} transform="rotate(12)" />
          </g>
          <Battery x={720} y={520} s={0.8} lv={1} />
          <Gary x={250} y={1500} s={0.9} grey={0.9} eyes="half" look={[1, -0.4]} brows="sad" mouth="frown" armL={10} armR={10} />
        </Layer>
      </Shot>
    );
  }
  // Gary schreit – Mund hinter schwarzem Zensurbalken (Piep im Ton)
  const sh = jolt(lf, 4, 12);
  return (
    <Shot cam={{ ...frameOn(540, 1040, 540, 780, 2.4), x: frameOn(540, 1040, 540, 780, 2.4).x + sh }}>
      <Layer depth={0.6}>
        <ReactBg a={A.red} b="#FF6B80" f={lf} cx={540} cy={780} />
      </Layer>
      <Layer>
        <Gary x={540} y={1460} s={1.0} grey={0.8} eyes="wide" brows="angry" mouth="scream" open={0.9} armL={160} bendL={-40} armR={160} bendR={-40} />
        <rect x={430} y={1050} width={220} height={70} rx={8} fill={INK} opacity={lf > 3 ? 1 : 0} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* sprint                                                             */
/* ================================================================== */

export const KSprint: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Everything", 0.3) - 3, W("mom", 0.6) - 3, W("declines", 0.85) - 3], d, f);
  const swing = Math.sin(f * 0.7);
  if (i === 0) {
    // Tief: Gary sprintet, Arme rudern, Speedlines
    return (
      <Shot cam={{ ...frameOn(540, 1150, 540, 900, 1.2), y: frameOn(540, 1150, 540, 900, 1.2).y + Math.abs(swing) * 8 }}>
        <Layer depth={0.4}>
          <g transform={`translate(${-(lf * 18) % 230} 0)`}>
            <DuskStreet id="run1" dim={0.5} />
          </g>
        </Layer>
        <Layer>
          <SpeedLines f={lf} />
          <Gary x={540} y={1460} s={1.0} grey={0.6} lean={-12} eyes="wide" look={[1, 0]} brows="worried" mouth="scream" open={0.6} armL={lerp(40, 160, (swing + 1) / 2)} armR={lerp(160, 40, (swing + 1) / 2)} bendL={-40} bendR={-40} />
          <Phone x={760} y={900} s={0.35} r={20} kind="battery" pct={2} f={f} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Weite: die Welt wird grau und klotzig um ihn herum
    const g = ease(lf, 0, len * 0.7);
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1100, zoom: 0.8 }], [len, { x: 560, y: 1100, zoom: 0.72 }]])}>
        <Layer depth={0.6}>
          <DuskStreet id="run2" dim={0.5 + 0.5 * g} />
          {Array.from({ length: 10 }).map((_, k) => (
            <rect key={k} x={-300 + k * 180} y={300 + ((k * 211) % 500)} width={120} height={120} fill="#6A6A70" opacity={g * 0.8} stroke={INK} strokeWidth={4} />
          ))}
        </Layer>
        <Layer>
          <Gary x={lerp(200, 800, lf / Math.max(1, len))} y={1460} s={0.6} grey={0.6 + 0.4 * g} lean={-12} eyes="wide" brows="worried" mouth="scream" open={0.5} armL={lerp(40, 160, (swing + 1) / 2)} armR={lerp(160, 40, (swing + 1) / 2)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // ECU: Anruf „MOM“ mit Herz
    return (
      <Shot cam={{ x: 540, y: 900 + jolt(lf, 2, 6), zoom: 1 }}>
        <Layer depth={0}>
          <ReactBg a="#6A6A72" b="#7A7A84" f={lf} />
        </Layer>
        <Layer>
          <Phone x={540} y={860} s={2.3} kind="call" pct={2} f={f} t={lf} shake={5} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Gary wischt kalt auf „Ablehnen“, ohne hinzusehen
  const sw = ease(lf, 3, 9);
  return (
    <Shot cam={frameOn(540, 1000, 540, 780, 1.9)}>
      <Layer depth={0.6}>
        <ReactBg a="#4A4A52" b="#56565F" f={lf} cx={540} cy={780} />
      </Layer>
      <Layer>
        <Gary x={480} y={1460} s={1.0} grey={1} eyes="half" look={[-1, 0]} brows="angry" mouth="flat" armR={100} bendR={-60} armL={10} nod={-4} />
        <Phone x={720} y={1010} s={0.5} r={-10} kind="call" pct={1} f={f} t={lf} />
        <Thumb x={lerp(760, 650, sw)} y={1080} s={0.55} r={-30} skin={A.greySkin} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* home                                                               */
/* ================================================================== */

export const KHome: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("outlet", 0.4) - 3, W("plugs", 0.7) - 3], d, f);
  if (i === 0) {
    // Gary kracht durch die Wohnungstür
    const open = ease(lf, W("door", 0.2) - 2, W("door", 0.2) + 4);
    return (
      <Shot cam={{ x: 540 + jolt(lf, W("door", 0.2) + 2, 18), y: 1050, zoom: 1.0 }}>
        <Layer depth={0.6}>
          <Room wall="#8E909A" floor={1500} />
        </Layer>
        <Layer>
          <Door x={540} y={1500} open={open} />
          <Gary x={lerp(540, 600, open)} y={1460} s={lerp(0.8, 1.15, open)} grey={1} lean={-15 * open} eyes="wide" brows="worried" mouth="scream" open={0.6} armL={150} armR={150} bendL={-30} bendR={-30} />
          <Burst x={540} y={1000} r0={260} r1={380} n={12} o={bump(lf, W("door", 0.2) + 3, 6)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // ECU: die Steckdose leuchtet wie ein Heiligtum
    return (
      <Shot cam={{ x: 540, y: 880, zoom: 1 + 0.12 * ease(lf, 0, len) }}>
        <Layer depth={0}>
          <ReactBg a="#FFD23F" b="#FFF3A8" f={lf * 3} cx={540} cy={820} />
        </Layer>
        <Layer>
          <Outlet x={540} y={820} s={2.0} glow={0.7 + 0.3 * Math.sin(lf * 0.3)} />
        </Layer>
      </Shot>
    );
  }
  // Stecker rein, Funke – Gary sinkt glücklich zu Boden
  const ins = ease(lf, 1, 6);
  const sink = ease(lf, 8, 20);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(560, 1200, 540, 860, 1.2)], [len, frameOn(560, 1250, 540, 860, 1.3)]])}>
      <Layer depth={0.6}>
        <Room wall="#B8BAC4" floor={1500} />
      </Layer>
      <Layer>
        <Outlet x={900} y={1250} s={0.6} glow={ins} />
        <Plug x={lerp(780, 900, ins)} y={1290} s={0.6} r={90} />
        <Burst x={880} y={1250} r0={80} r1={150} n={10} o={bump(lf, 6, 6)} color={A.yellow} />
        <Gary x={480} y={1500} s={1.0} grey={1 - sink * 0.6} seated={sink > 0.5} lean={lerp(0, -10, sink)} eyes={sink > 0.4 ? "closed" : "wide"} brows="up" mouth={sink > 0.4 ? "smile" : "o"} open={0.4} armR={lerp(90, 20, sink)} armL={lerp(20, 150, sink)} bendL={-40} />
        <Phone x={760} y={1330} s={0.3} r={80} kind="battery" pct={1} f={f} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* turn                                                               */
/* ================================================================== */

export const KTurn: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Do", 0.45) - 3, W("turns", 0.78) - 2], d, f);
  if (i === 0) {
    // ECU: Bildschirm leuchtet auf – Update-Rad dreht sich
    const on = ease(lf, W("lights", 0.15) - 2, W("lights", 0.15) + 4);
    return (
      <Shot cam={{ x: 540, y: 900, zoom: 1 + 0.06 * ease(lf, 0, len) }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={mix("#141420", "#2D3156", on)} />
        </Layer>
        <Layer>
          <Phone x={540} y={860} s={2.3} kind={on > 0.3 ? "update" : "black"} f={f} t={lf} glow={on * 0.6} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: Garys Lächeln gefriert
    const fr = ease(lf, 4, 14);
    return (
      <Shot cam={frameOn(500, 1110, 540, 760, lerp(2.2, 2.6, ease(lf, 0, len)))}>
        <Layer depth={0.6}>
          <ReactBg a="#2D3156" b="#363B66" f={lf} cx={540} cy={760} />
        </Layer>
        <Layer>
          <Gary x={500} y={1450} s={1.0} seated grey={0.4} eyes={fr > 0.5 ? "twitch" : "closed"} look={[1, 0.3]} brows={fr > 0.5 ? "worried" : "up"} mouth={fr > 0.5 ? "frown" : "smile"} f={lf} armL={20} armR={20} />
          <Sweat x={420} y={1000} s={0.8} o={fr} />
        </Layer>
      </Shot>
    );
  }
  // Gary wird steif, X-Augen, kippt nach hinten; Flatline
  const fall = ease(lf, 2, 10, "inOut");
  return (
    <Shot cam={{ x: 540 + jolt(lf, 10, 18), y: 1080, zoom: 1.0 }}>
      <Layer depth={0.6}>
        <Room wall="#4A4C5A" floor={1500} />
      </Layer>
      <Layer>
        <Outlet x={900} y={1250} s={0.6} />
        <Gary x={480} y={1500} s={1.0} lean={lerp(0, -88, fall)} grey={1} eyes="xx" brows="none" mouth="o" open={0.3} armL={8} armR={8} />
        <Phone x={760} y={1330} s={0.3} r={80} kind="update" f={f} t={lf} />
        <Flatline t={lf - 10} y={520} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* funeral                                                            */
/* ================================================================== */

const MOURN = [
  { shirt: INK, hair: "curly" as const, hairColor: "#2A1B12", skin: P.skin2 },
  { shirt: INK, hair: "bun" as const, hairColor: "#F2F2F2", skin: P.skin },
  { shirt: INK, hair: "side" as const, hairColor: "#4A2E1E", skin: P.skin3 },
  { shirt: INK, hair: "pony" as const, hairColor: "#E8B23A", skin: "#F2C7A5" },
];

export const KFuneral: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Everyone", 0.35) - 3, W("phone", 0.7) - 3], d, f);
  if (i === 0) {
    // Weite: Friedhof im Regen, Trauergäste, Sarg
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1200, 540, 900, 0.85)], [len, frameOn(540, 1200, 540, 900, 0.95)]])}>
        <Layer depth={0.6}>
          <Cemetery f={lf} />
        </Layer>
        <Layer>
          {MOURN.map((m, k) => (
            <Person key={k} x={60 + k * 320} y={1350} s={0.8} {...m} pants={INK} eyes="closed" brows="sad" mouth="frown" armL={20} armR={20} nod={8} />
          ))}
          <Coffin x={540} y={1560} s={1.0} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: alle stecken ihr Handy in die Steckdosenleiste auf dem Sarg
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1250, 540, 900, 1.25)], [len, frameOn(540, 1250, 540, 900, 1.35)]])}>
        <Layer depth={0.6}>
          <Cemetery f={lf} />
        </Layer>
        <Layer>
          {MOURN.map((m, k) => (
            <g key={k}>
              <Person x={120 + k * 280} y={1350} s={0.8} {...m} pants={INK} eyes={k % 2 ? "half" : "open"} look={[0, 1]} brows="sad" mouth={k === 2 ? "smile" : "flat"} armR={60} bendR={-40} armL={20} />
              <path d={`M ${210 + k * 280} ${1120} Q ${300 + k * 90} 1300 ${400 + k * 70} 1330`} fill="none" stroke="#F4F4F4" strokeWidth={10} />
              <Phone x={210 + k * 280} y={1110} s={0.18} kind="battery" pct={[64, 88, 100, 41][k]} f={f} />
            </g>
          ))}
          <Coffin x={540} y={1560} s={1.0} />
        </Layer>
      </Shot>
    );
  }
  // Grabstein mit leerem Akku; oben drauf Garys Handy – voll geladen, Update fertig
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 820, 1.1)], [len, frameOn(540, 950, 540, 820, 1.3)]])}>
      <Layer depth={0.6}>
        <Cemetery f={lf} ground={1450} />
      </Layer>
      <Layer>
        <Tomb x={540} y={1450} s={1.0} />
        <Phone x={540} y={700} s={0.55} kind="full" pct={100} f={f} glow={0.7} />
        <Burst x={540} y={700} r0={150} r1={220} n={10} o={0.4 + 0.3 * Math.sin(lf * 0.3)} color={A.green} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const KOutro: React.FC = () => {
  const { f, d } = useBeats();
  // POV: das Handy des Zuschauers füllt das Bild, Akku blinkt rot 1 %, Bildschirm dimmt (Loop zum Hook)
  const dim = ease(f, d * 0.6, d);
  return (
    <Shot cam={{ x: 540, y: 960, zoom: 1 + 0.05 * ease(f, 0, d) }}>
      <Layer depth={0}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
      </Layer>
      <Layer>
        <rect x={20} y={40} width={1040} height={1840} rx={90} fill={INK} />
        <rect x={50} y={70} width={980} height={1780} rx={70} fill={mix("#2A0B12", "#0B0B12", dim)} />
        <rect x={420} y={90} width={240} height={46} rx={23} fill="#0B0B12" />
        <Battery x={890} y={130} s={0.5} lv={0.01} f={f} blink />
        <Battery x={540} y={700} s={2.6} lv={0.01} f={f} blink />
        <text x={540} y={1050} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={200} fill={A.red} stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={Math.floor(f / 6) % 2 === 0 ? 1 : 0.35}>
          1%
        </text>
        <rect x={50} y={70} width={980} height={1780} rx={70} fill="#000000" opacity={dim * 0.55} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const AKKU_SCENES: Record<string, React.FC> = {
  hook: KHook,
  rules: KRules,
  gary: KGary,
  lowpower: KLowpower,
  chat: KChat,
  stranger: KStranger,
  sprint: KSprint,
  home: KHome,
  turn: KTurn,
  funeral: KFuneral,
  outro: KOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(AKKU_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Akku-Prozent nur als Gag auf dem Handy. */
export const AKKU_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene (Set-Zählung vor dem Render). */
export const AKKU_SHOT_COUNT: Record<string, number> = { hook: 2, rules: 3, gary: 2, lowpower: 3, chat: 4, stranger: 4, sprint: 4, home: 3, turn: 3, funeral: 3, outro: 1 };
