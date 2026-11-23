import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/meckern-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, INK, P, Person, Street, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";
import { ReactBg } from "./suche";
import { Bed, Room } from "./akku";
import { Poof } from "./todo";

/**
 * „In This City, Every Time You Complain, You Age One Year“ (episodes/meckern-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Konsequenz = Altern (weder Tod noch Peinlichkeit). Eine Text-Ebene (Untertitel); Meckerwolken/Sterne sind Bildzeichen ohne Schrift.
 * Schnitte an Wort-Beats, kein Set > 2 am Stück (MECKERN_SHOT_COUNT).
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

const M = {
  hoodie: "#FF7A1A",
  hair: "#2F6BFF",
  grayHair: "#E4E4EC",
  rain: "#5A6A9A",
  diner: "#1FB5A8",
  hold: "#C7B98A",
  party: "#FF5FA2",
  dark: "#1A1636",
  couch: "#7A4DE0",
  desk: "#FFCF3A",
  station: "#6FC3FF",
  office: "#B8F06A",
  night: "#2A2470",
  door: "#FF9A3D",
  coffee: "#6B3A1E",
  date: "#FFD23F",
  boss: "#5D6377",
};

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
  const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  const k = clamp01(t);
  return `#${pa.map((v, j) => ("0" + Math.round(lerp(v, pb[j], k)).toString(16)).slice(-2)).join("")}`;
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
/** Tyler: oranger Hoodie, blaue Stachelhaare. gray = graue Haare 0..1, old = Greis 0..1 (Glatze, Bart, krumm). */
const Tyler: React.FC<Fig & { readonly gray?: number; readonly old?: number }> = ({ gray = 0, old = 0, ...p }) => (
  <Person
    pants="#2B3A67"
    {...p}
    shirt={mix(M.hoodie, "#C98A5E", old * 0.5)}
    hair={old > 0.6 ? "none" : "spiky"}
    hairColor={mix(M.hair, M.grayHair, Math.max(gray, old))}
    skin={mix(P.skin, "#E7C3A6", old)}
    wrinkles={Math.max(p.wrinkles ?? 0, old, gray * 0.35)}
    beard={old > 0.3 ? old : 0}
    lean={(p.lean ?? 0) + old * 10}
    nod={(p.nod ?? 0) + old * 12}
  />
);
const OldGuy: React.FC<Fig & { readonly c?: string; readonly h?: PersonProps["hair"] }> = ({ c = P.purple, h = "none", ...p }) => (
  <Person pants="#4A4F66" cardigan {...p} shirt={c} hair={h} hairColor={M.grayHair} skin={p.skin ?? "#EBC7A8"} wrinkles={1} />
);
const Boss: React.FC<Fig> = (p) => <Person pants="#3A3F52" suit {...p} shirt={M.boss} hair="side" hairColor="#2A1B12" skin="#F2C7A5" stache />;
const DateGirl: React.FC<Fig> = (p) => <Person pants={M.date} {...p} shirt={M.date} hair="pony" hairColor="#8A4B22" skin={P.skin3} />;

/** Handposition (ohne Ellenbogen-Beugung) – Ursprung Füße wie Person. */
const hand = (x: number, y: number, s: number, deg: number, side: 1 | -1, seated = false) => {
  const sh = (seated ? -250 : -330) + 40;
  const a = (deg * Math.PI) / 180;
  return [x + side * (78 + Math.sin(a) * 130) * s, y + (sh + Math.cos(a) * 130) * s] as const;
};

/* ------------------------------------------------------------------ */
/* Bildzeichen / Requisiten                                           */
/* ------------------------------------------------------------------ */

/** Gewitterwolke mit Blitz (Meckern ohne Schrift). */
const Storm: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-70, 0, 70].map((k, j) => <circle key={k} cx={k} cy={j === 1 ? -30 : 0} r={j === 1 ? 70 : 55} fill="#4A4F66" stroke={INK} strokeWidth={7} />)}
    <rect x={-120} y={0} width={240} height={50} rx={25} fill="#4A4F66" />
    <path d="M 10 40 L -30 120 L 5 120 L -20 200 L 50 100 L 15 100 L 40 40 Z" fill={P.bus} stroke={INK} strokeWidth={6} strokeLinejoin="round" opacity={Math.sin(f * 0.9) > -0.3 ? 1 : 0.3} />
  </g>
);

/** Sprechblase mit Gewitterwolke (Meckern). */
const Grumble: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly s?: number; readonly f?: number; readonly tail?: 1 | -1 }> = ({ x, y, o, s = 1, f = 0, tail = -1 }) =>
  o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * o)})`} opacity={clamp01(o)}>
      <path d={`M -200 -150 Q -210 -230 -110 -230 L 110 -230 Q 210 -230 200 -150 L 200 40 Q 200 110 110 110 L ${tail * 40} 110 L ${tail * 120} 190 L ${tail * 100} 110 L -110 110 Q -200 110 -200 40 Z`} fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <Storm x={0} y={-80} s={0.8} f={f} />
    </g>
  );

/** Gedankenblase mit Gewitter + Kackhaufen (Twist). */
const Thought: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly s?: number; readonly f?: number }> = ({ x, y, o, s = 1, f = 0 }) =>
  o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * o)})`} opacity={clamp01(o)}>
      {[
        [-150, -60, 110],
        [-40, -130, 130],
        [100, -100, 120],
        [160, 10, 100],
        [40, 60, 110],
        [-110, 50, 100],
      ].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={8} />)}
      <ellipse cx={0} cy={-30} rx={210} ry={150} fill="#FFFFFF" />
      {[
        [-160, 200, 34],
        [-210, 280, 22],
      ].map(([cx, cy, r], k) => <circle key={`d${k}`} cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={7} />)}
      <Storm x={-70} y={-90} s={0.55} f={f} />
      <g transform="translate(90 30)">
        {[0, 1, 2].map((k) => <ellipse key={k} cx={0} cy={-k * 38} rx={70 - k * 18} ry={26} fill="#8A5A2B" stroke={INK} strokeWidth={6} />)}
        <path d="M -6 -110 q 12 -22 -4 -36" fill="none" stroke="#8A5A2B" strokeWidth={14} strokeLinecap="round" />
        <circle cx={-20} cy={-40} r={7} fill={INK} />
        <circle cx={20} cy={-40} r={7} fill={INK} />
      </g>
    </g>
  );

const Rain: React.FC<{ readonly f: number; readonly o?: number }> = ({ f, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 46 }).map((_, k) => {
      const x = ((k * 173) % 1500) - 200;
      const y = ((f * 38 + k * 211) % 2200) - 200;
      return <line key={k} x1={x} y1={y} x2={x - 18} y2={y + 70} stroke="#BFD4FF" strokeWidth={6} strokeLinecap="round" />;
    })}
  </g>
);

/** Regenschirm, flip 0 = normal, 1 = umgestülpt. */
const Umbrella: React.FC<{ readonly x: number; readonly y: number; readonly flip: number; readonly s?: number; readonly r?: number }> = ({ x, y, flip, s = 1, r = 0 }) => {
  const k = lerp(-1, 1, clamp01(flip));
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <line x1={0} y1={0} x2={0} y2={-330} stroke={INK} strokeWidth={10} />
      <path d={`M 0 0 q 0 40 -30 40`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d={`M -230 -330 Q -115 ${-330 + 160 * k} 0 -330 Q 115 ${-330 + 160 * k} 230 -330 Q 0 ${-330 + 330 * k} -230 -330 Z`} fill={P.red} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {flip > 0.5 ? <path d="M -230 -330 L -260 -400 M 230 -330 L 270 -390 M 0 -330 L 0 -420" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
    </g>
  );
};

const Cane: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M 0 0 L 0 -300 Q 0 -350 -45 -350 Q -80 -350 -80 -315" fill="none" stroke="#7E4320" strokeWidth={20} strokeLinecap="round" />
  </g>
);

const Walker: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#B8BFD0" strokeWidth={16} strokeLinecap="round">
    <path d="M -150 0 L -130 -300 L 130 -300 L 150 0 M -140 -150 L 140 -150" />
    {[-150, 150].map((k) => <circle key={k} cx={k} cy={0} r={22} fill="#6B7287" stroke={INK} strokeWidth={6} />)}
  </g>
);

const Soup: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -170 -60 Q -160 70 0 80 Q 160 70 170 -60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={0} cy={-60} rx={170} ry={36} fill={P.orange} stroke={INK} strokeWidth={8} />
    {[0, 1, 2].map((k) => <path key={k} d={`M ${-60 + k * 60} -110 q ${18 * Math.sin(f * 0.2 + k)} -40 0 -80`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.25} />)}
  </g>
);

const PhoneS: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly glow?: string }> = ({ x, y, s = 1, r = 0, glow = "#7FD6FF" }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-38} y={-70} width={76} height={140} rx={14} fill={INK} />
    <rect x={-30} y={-60} width={60} height={118} rx={8} fill={glow} />
  </g>
);

const Laptop: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly glow?: string; readonly dead?: number; readonly f?: number }> = ({ x, y, s = 1, glow = "#BFE8FF", dead = 0, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-340} width={520} height={330} rx={20} fill="#3A3F52" stroke={INK} strokeWidth={9} />
    <rect x={-230} y={-310} width={460} height={270} rx={10} fill={dead > 0.5 ? (Math.sin(f * 1.7) > 0 ? "#2B2F45" : "#5B6178") : glow} />
    <path d="M -320 0 L 320 0 L 280 -30 L -280 -30 Z" fill="#8A8FA3" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </g>
);

const Star: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly fill?: boolean; readonly r?: number }> = ({ x, y, s = 1, fill, r = 0 }) => {
  const pts = Array.from({ length: 10 }).map((_, k) => {
    const a = (k * Math.PI) / 5 - Math.PI / 2;
    const rr = k % 2 ? 22 : 52;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  });
  return <polygon transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} points={pts.join(" ")} fill={fill ? P.bus : "#3A3F52"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
};

/** Ein-Stern-Bewertung (1 gelb, 4 grau) – fliegt aus dem Laptop. */
const OneStar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-290} y={-70} width={580} height={140} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3, 4].map((k) => <Star key={k} x={-220 + k * 110} y={0} s={0.9} fill={k === 0} />)}
  </g>
);

const Cake: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-200} width={600} height={200} rx={24} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    <path d="M -300 -150 Q -240 -100 -180 -150 Q -120 -100 -60 -150 Q 0 -100 60 -150 Q 120 -100 180 -150 Q 240 -100 300 -150" fill="none" stroke={P.pink} strokeWidth={22} />
    {Array.from({ length: 31 }).map((_, k) => {
      const cx = -270 + (k % 11) * 54 + (Math.floor(k / 11) % 2) * 27;
      const cy = -200 - Math.floor(k / 11) * 26;
      return (
        <g key={k}>
          <rect x={cx - 8} y={cy - 90} width={16} height={90} fill={[P.sky, P.lime, P.bus][k % 3]} stroke={INK} strokeWidth={3} />
        </g>
      );
    })}
    {/* Ein einziges Flammenmeer über allen Kerzen */}
    <path d={`M -300 -260 Q -240 ${-430 - 40 * Math.sin(f * 0.6)} -150 -330 Q -90 ${-520 - 50 * Math.sin(f * 0.5 + 1)} 0 -360 Q 80 ${-540 - 40 * Math.sin(f * 0.7)} 150 -340 Q 230 ${-450 - 40 * Math.sin(f * 0.6 + 2)} 300 -260 Z`} fill={P.orange} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M -200 -270 Q -120 ${-380 - 30 * Math.sin(f * 0.8)} -40 -300 Q 30 ${-420 - 30 * Math.sin(f * 0.6)} 100 -290 Q 180 ${-370 - 20 * Math.sin(f)} 220 -270 Z`} fill={P.bus} />
  </g>
);

/** Riesiges Ohr in der Wand: die Stadt hört mit. */
const Ear: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * o} ${s})`} opacity={clamp01(o * 2)}>
    <path d="M -60 -200 Q 120 -240 140 -40 Q 150 100 40 160 Q 10 240 -60 200 Q -40 120 -10 80 Q 60 20 30 -60 Q 0 -110 -60 -100 Z" fill={P.skin} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -20 -150 Q 80 -160 90 -50 Q 90 20 30 60" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Clock: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly h: number; readonly m: number }> = ({ x, y, s = 1, h, m }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={300} fill="#FFFFFF" stroke={INK} strokeWidth={16} />
    {Array.from({ length: 12 }).map((_, k) => {
      const a = (k * Math.PI) / 6;
      return <line key={k} x1={Math.sin(a) * 240} y1={-Math.cos(a) * 240} x2={Math.sin(a) * 275} y2={-Math.cos(a) * 275} stroke={INK} strokeWidth={k % 3 ? 8 : 16} strokeLinecap="round" />;
    })}
    <line x1={0} y1={0} x2={Math.sin(h) * 150} y2={-Math.cos(h) * 150} stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(m) * 220} y2={-Math.cos(m) * 220} stroke={P.red} strokeWidth={14} strokeLinecap="round" />
    <circle r={20} fill={INK} />
  </g>
);

const Confetti: React.FC<{ readonly f: number; readonly o?: number }> = ({ f, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 40 }).map((_, k) => {
      const x = ((k * 137) % 1300) - 100 + Math.sin(f * 0.1 + k) * 30;
      const y = ((f * (6 + (k % 5)) + k * 97) % 1700) - 100;
      return <rect key={k} x={x} y={y} width={22} height={34} fill={[P.bus, P.pink, P.lime, P.sky, P.orange][k % 5]} transform={`rotate(${(f * 7 + k * 40) % 360} ${x} ${y})`} />;
    })}
  </g>
);

const Tape: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly k: number }> = ({ x, y, s = 1, k }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(k * 2)}>
      <rect x={-80} y={-20} width={160} height={40} rx={6} fill="#D9D3C2" stroke={INK} strokeWidth={5} transform={`rotate(${lerp(0, 20, k)})`} />
      <rect x={-80} y={-20} width={160} height={40} rx={6} fill="#D9D3C2" stroke={INK} strokeWidth={5} transform={`rotate(${lerp(0, -20, k)})`} />
    </g>
  );

/** Hand mit Daumen (POV, Ursprung = Daumenspitze). w = Falten 0..1 */
const PovHand: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly skin?: string }> = ({ x, y, w, skin = P.skin }) => {
  const c = mix(skin, "#E2C2A8", w);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -60 -20 Q -70 -80 0 -80 Q 70 -80 60 -20 L 90 520 L -200 620 L -160 80 Z" fill={c} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M -30 -60 Q 0 -75 30 -60 L 28 -10 Q 0 -2 -28 -10 Z" fill="#FFFFFF" opacity={0.6} stroke={INK} strokeWidth={4} />
      <g fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={clamp01(w * 1.5)}>
        {Array.from({ length: 7 }).map((_, k) => <path key={k} d={`M -50 ${40 + k * 55} q 40 ${-10 + (k % 2) * 20} 85 0`} />)}
        {Array.from({ length: 6 }).map((_, k) => <circle key={`s${k}`} cx={-90 + (k * 47) % 140} cy={250 + (k * 71) % 250} r={9} fill="#B07A4A" stroke="none" />)}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Sets                                                               */
/* ------------------------------------------------------------------ */

const RainStreet: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.rain} />
    <Street ground={1500} />
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2A3366" opacity={0.35} />
    <Storm x={300} y={250} s={1.3} f={f} />
    <Storm x={850} y={160} s={1} f={f + 3} />
    {[200, 700].map((x) => <ellipse key={x} cx={x} cy={1600} rx={190} ry={26} fill="#9FB4FF" opacity={0.6} />)}
  </g>
);

const Diner: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.diner} />
    {Array.from({ length: 9 }).map((_, k) => <rect key={k} x={-400 + k * 220} y={-2000} width={110} height={3500} fill="#FFFFFF" opacity={0.12} />)}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#FFFFFF" />
    {Array.from({ length: 16 }).map((_, k) => <rect key={k} x={-600 + k * 160} y={1500 + (k % 2) * 80} width={80} height={80} fill={INK} />)}
    <rect x={150} y={420} width={420} height={300} rx={20} fill="#FFE08A" stroke={INK} strokeWidth={8} />
    <circle cx={360} cy={570} r={90} fill={P.orange} stroke={INK} strokeWidth={7} />
    <rect x={-300} y={1150} width={1700} height={60} rx={16} fill={P.red} stroke={INK} strokeWidth={8} />
  </g>
);

const HoldRoom: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.hold} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#8C7F5A" />
    {/* Spinnweben in den Ecken */}
    {[
      [-20, 0, 1],
      [1100, 0, -1],
    ].map(([x, y, sd], k) => (
      <g key={k} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.8}>
        {[0, 1, 2, 3].map((j) => <path key={j} d={`M ${x} ${y + j * 60} Q ${x + (sd as number) * (60 + j * 40)} ${y + j * 70 + 40} ${x + (sd as number) * (j * 60 + 60)} ${y}`} />)}
        {[0, 1, 2].map((j) => <line key={`l${j}`} x1={x} y1={y} x2={(x as number) + (sd as number) * (120 + j * 90)} y2={(y as number) + 300 - j * 90} />)}
      </g>
    ))}
    {/* Warteschleifen-Noten */}
    {[0, 1, 2, 3].map((k) => {
      const t = ((f * 2 + k * 50) % 200) / 200;
      return (
        <g key={k} transform={`translate(${200 + k * 230} ${700 - t * 380})`} opacity={1 - t}>
          <ellipse cx={0} cy={0} rx={26} ry={20} fill={INK} />
          <line x1={22} y1={0} x2={22} y2={-90} stroke={INK} strokeWidth={8} />
          <path d="M 22 -90 q 40 10 30 50" fill="none" stroke={INK} strokeWidth={8} />
        </g>
      );
    })}
  </g>
);

const Party: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.party} />
    {Array.from({ length: 12 }).map((_, k) => (
      <path key={k} d={`M ${-300 + k * 150} 150 l 60 120 l 60 -120 Z`} fill={[P.bus, P.lime, P.sky][k % 3]} stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(f * 0.1 + k) * 3} ${-270 + k * 150} 150)`} />
    ))}
    <path d="M -300 150 Q 540 230 1400 150" fill="none" stroke={INK} strokeWidth={5} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#C2367A" />
    <rect x={120} y={1260} width={840} height={50} rx={12} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <rect x={180} y={1310} width={36} height={190} fill="#E6E6EE" stroke={INK} strokeWidth={5} />
    <rect x={864} y={1310} width={36} height={190} fill="#E6E6EE" stroke={INK} strokeWidth={5} />
  </g>
);

const DarkRoom: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.dark} />
    <ellipse cx={540} cy={1000} rx={600} ry={520} fill="#3B4BAA" opacity={0.45} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#0F0C24" />
    <rect x={160} y={1240} width={760} height={50} rx={10} fill="#5B3A22" stroke={INK} strokeWidth={8} />
    {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={-200 + k * 60} y={1180 - k * 8} width={50} height={60} rx={6} fill="#7A6A5A" opacity={0.6} />)}
  </g>
);

const Apartment: React.FC<{ readonly wall?: string }> = ({ wall = "#FFD9E8" }) => (
  <g>
    <Room wall={wall} floor={1500} />
    <rect x={-200} y={1080} width={1480} height={300} rx={80} fill={M.couch} stroke={INK} strokeWidth={9} />
    <rect x={-250} y={1250} width={1580} height={250} rx={60} fill="#6A3ED0" stroke={INK} strokeWidth={9} />
    {[150, 430, 710].map((x) => <rect key={x} x={x} y={1150} width={240} height={130} rx={40} fill="#9A72FF" stroke={INK} strokeWidth={7} />)}
  </g>
);

const Building: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#8ED8FF" />
    <circle cx={150} cy={250} r={110} fill="#FFE27A" />
    <rect x={100} y={300} width={880} height={1300} fill="#FFB27A" stroke={INK} strokeWidth={10} />
    {Array.from({ length: 12 }).map((_, k) => {
      const x = 170 + (k % 3) * 270;
      const y = 380 + Math.floor(k / 3) * 280;
      const his = k === 4;
      return (
        <g key={k}>
          <rect x={x} y={y} width={200} height={200} rx={10} fill={his ? "#3A3F66" : "#BFF0FF"} stroke={INK} strokeWidth={7} />
          {his ? <rect x={x} y={y} width={200} height={200} rx={10} fill="#FFFFFF" opacity={bump(f % 30, 3, 3) * 0.8} /> : null}
        </g>
      );
    })}
    <rect x={-2000} y={1600} width={5000} height={2000} fill="#9AA3B5" />
    <Storm x={540} y={520} s={1.1} f={f} />
    {Array.from({ length: 10 }).map((_, k) => {
      const y = 620 + ((f * 30 + k * 40) % 240);
      return <line key={k} x1={460 + k * 18} y1={y} x2={450 + k * 18} y2={y + 40} stroke="#BFD4FF" strokeWidth={6} strokeLinecap="round" />;
    })}
  </g>
);

const BlackCat: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-70} rx={110} ry={60} fill={INK} />
    <circle cx={110} cy={-130} r={52} fill={INK} />
    <path d="M 80 -170 L 90 -215 L 115 -178 M 130 -175 L 150 -215 L 158 -165" fill={INK} stroke={INK} strokeWidth={6} />
    <circle cx={100} cy={-135} r={10} fill={P.bus} />
    <circle cx={130} cy={-135} r={10} fill={P.bus} />
    <path d={`M -100 -80 Q -170 ${-150 + Math.sin(f * 0.4) * 30} -140 -220`} fill="none" stroke={INK} strokeWidth={18} strokeLinecap="round" />
    {[-70, -20, 30, 80].map((k, j) => <rect key={k} x={k} y={-30} width={20} height={30 + (Math.sin(f * 0.8 + j * 1.5) > 0 ? 6 : 0)} fill={INK} />)}
  </g>
);

const Desk: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.desk} />
    <rect x={-2000} y={1150} width={5000} height={2000} fill="#B8693A" />
    {Array.from({ length: 6 }).map((_, k) => <line key={k} x1={-200} x2={1300} y1={1220 + k * 110} y2={1220 + k * 110} stroke="#7E4320" strokeWidth={6} />)}
  </g>
);

const Station: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.station} />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={-300 + k * 450} y={150} width={60} height={1200} fill="#4A6BD6" stroke={INK} strokeWidth={6} />)}
    <rect x={-2000} y={100} width={5000} height={80} fill="#4A6BD6" stroke={INK} strokeWidth={6} />
    <rect x={-2000} y={1150} width={5000} height={90} fill="#FFE27A" stroke={INK} strokeWidth={6} />
    <rect x={-2000} y={1240} width={5000} height={400} fill="#5B5F73" />
    {[1330, 1510].map((y) => <rect key={y} x={-2000} y={y} width={5000} height={22} fill="#C9CEDB" stroke={INK} strokeWidth={4} />)}
    {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={-300 + k * 150} y={1300} width={40} height={260} fill="#7E4320" opacity={0.6} />)}
    <rect x={-2000} y={1640} width={5000} height={2000} fill="#9AA3B5" />
    <g transform={`translate(${200 + f * 1.2} 1320)`}>
      <path d="M -50 0 Q -60 -40 -20 -46 L 40 -46 Q 70 -20 50 0 Z" fill={P.lime} stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-60} r={38} fill="#E0A85A" stroke={INK} strokeWidth={5} />
      <path d="M -10 -60 a 18 18 0 1 1 18 18" fill="none" stroke={INK} strokeWidth={4} />
      <path d="M 45 -40 L 60 -80 M 55 -40 L 78 -72" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);

const Office: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.office} />
    {Array.from({ length: 6 }).map((_, k) => <rect key={k} x={-300 + k * 300} y={-2000} width={30} height={3500} fill="#FFFFFF" opacity={0.25} />)}
    <rect x={480} y={380} width={560} height={420} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    {/* Tylers Glühbirnen-Zeichnung */}
    <circle cx={760} cy={540} r={95} fill="#FFF27A" stroke={INK} strokeWidth={8} />
    <rect x={720} y={630} width={80} height={60} rx={8} fill="#B8BFD0" stroke={INK} strokeWidth={7} />
    {[0, 1, 2, 3, 4].map((k) => {
      const a = -Math.PI / 2 + (k - 2) * 0.55;
      return <line key={k} x1={760 + Math.cos(a) * 125} y1={540 + Math.sin(a) * 125} x2={760 + Math.cos(a) * 165} y2={540 + Math.sin(a) * 165} stroke={INK} strokeWidth={8} strokeLinecap="round" />;
    })}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#5E8F3A" />
    <path d="M -300 1300 L 1380 1300 L 1480 1440 L -400 1440 Z" fill="#7A4A2A" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </g>
);

const NightRoom: React.FC = () => (
  <g>
    <Room wall={M.night} floor={1500} window />
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0830" opacity={0.25} />
  </g>
);

const Doorway: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={M.door} />
    {Array.from({ length: 10 }).map((_, k) => <rect key={k} x={-400 + k * 200} y={-2000} width={100} height={3500} fill="#FFFFFF" opacity={0.12} />)}
    <rect x={380} y={300} width={620} height={1200} fill="#3B2412" stroke={INK} strokeWidth={10} />
    <rect x={420} y={340} width={540} height={1160} fill="#FFF4DE" />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#B8693A" />
    <rect x={150} y={1500} width={300} height={40} rx={8} fill="#7FD6A8" stroke={INK} strokeWidth={6} />
  </g>
);

const Flowers: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly drop?: number }> = ({ x, y, s = 1, drop = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, 0, 40].map((k) => <line key={k} x1={0} y1={0} x2={k} y2={-160} stroke="#2F8F3A" strokeWidth={9} />)}
    {[-40, 0, 40].map((k, j) => <circle key={k} cx={k} cy={-170 + (drop > 0 ? drop * (120 + j * 60) : 0)} r={34} fill={[P.red, P.pink, P.purple][j]} stroke={INK} strokeWidth={5} />)}
    <path d="M -50 -40 L 50 -40 L 25 40 L -25 40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

export const MHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const age = W("age", 0.7);
  const { i, lf, len } = useShot([age - 2], d, f);
  if (i === 0) {
    // Regen-Straße: Schirm klappt ab Bild 0 um, Tyler-Typ meckert (Wolken-Blase)
    const flip = ease(lf, 0, 8);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 900, 1.25)], [len, frameOn(540, 1050, 540, 900, 1.4)]])}>
        <Layer depth={0.6}>
          <RainStreet f={lf} />
        </Layer>
        <Layer>
          <Person x={460} y={1550} s={1.05} shirt={P.teal} pants="#2B3A67" hair="curly" hairColor="#2A1B12" skin={P.skin2} eyes={lf > 8 ? "squint" : "wide"} brows="angry" mouth={lf > 8 ? "scream" : "o"} open={0.7} armR={150} bendR={-30} armL={40} gest={lf > 8 ? 5 : 0} />
          <Umbrella x={hand(460, 1550, 1.05, 150, 1)[0]} y={hand(460, 1550, 1.05, 150, 1)[1]} flip={flip} s={1} r={10 + jolt(lf, 6, 12)} />
          <Grumble x={760} y={640} o={clamp01((lf - 6) / 3)} s={0.8} f={lf} />
        </Layer>
        <Layer depth={1.1}>
          <Rain f={lf} />
        </Layer>
      </Shot>
    );
  }
  // POOF: derselbe Mann altert in einem Wimpernschlag – Bart, krumm, Stock
  const o = ease(lf, 3, 9);
  return (
    <Shot cam={{ ...frameOn(540, 1050, 540, 860, 1.25), x: frameOn(540, 1050, 540, 860, 1.25).x + jolt(lf, 3, 14) }}>
      <Layer depth={0.6}>
        <RainStreet f={lf + 40} />
      </Layer>
      <Layer>
        <Person x={480} y={1550} s={1.05} shirt={P.teal} pants="#2B3A67" hair={o > 0.5 ? "side" : "curly"} hairColor={mix("#2A1B12", M.grayHair, o)} skin={mix(P.skin2, "#D9B08C", o)} wrinkles={o} beard={o > 0.4 ? o * 0.7 : 0} lean={o * 10} nod={o * 10} eyes="wide" brows="up" mouth="o" open={0.5} armR={o > 0.5 ? 25 : 150} armL={20} />
        {o > 0.5 ? <Cane x={hand(480, 1550, 1.05, 25, 1)[0] + 50} y={1550} s={1.05} /> : null}
        {o > 0.5 ? <Umbrella x={820} y={1560} flip={1} s={0.8} r={80} /> : null}
        <Poof x={500} y={1100} t={lf} s={1.6} />
        <Sweat x={350} y={830} s={1.1} o={clamp01((lf - 9) / 4)} />
      </Layer>
      <Layer depth={1.1}>
        <Rain f={lf + 40} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const MRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("beard", 0.2) - 4, W("customer", 0.55) - 2], d, f);
  if (i === 0) {
    // Diner: Mann schiebt die Suppe weg, Meckerblase
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1080, 540, 820, 1.1)], [len, frameOn(540, 1080, 540, 820, 1.22)]])}>
        <Layer depth={0.7}>
          <Diner />
        </Layer>
        <Layer>
          <Person x={540} y={1260} s={1} seated shirt={P.lime} hair="side" hairColor="#4A2E1E" skin={P.skin} eyes="squint" brows="angry" mouth="frown" armL={70} armR={110} bendR={-30} gest={4} />
          <rect x={150} y={1150} width={780} height={60} rx={14} fill={P.red} stroke={INK} strokeWidth={8} />
          <Soup x={lerp(560, 700, ease(lf, 8, 18))} y={1150} s={0.9} f={lf} />
          <Grumble x={760} y={560} o={clamp01((lf - 4) / 3)} s={0.7} f={lf} tail={-1} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: POOF – weißer Bart wächst und klatscht in die Suppe
    const g = ease(lf, 4, 16);
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 800, 1.5), y: frameOn(540, 1000, 540, 800, 1.5).y + jolt(lf, 16, 10) }}>
        <Layer depth={0.7}>
          <Diner />
        </Layer>
        <Layer>
          <Person x={540} y={1260} s={1} seated shirt={P.lime} hair="side" hairColor={mix("#4A2E1E", M.grayHair, g)} skin={P.skin} wrinkles={g} beard={g * 0.6} eyes="wide" look={[0, 1]} brows="up" mouth="o" open={0.4} armL={20} armR={20} />
          <rect x={150} y={1150} width={780} height={60} rx={14} fill={P.red} stroke={INK} strokeWidth={8} />
          <Soup x={560} y={1150} s={0.8} f={lf} />
          {g > 0.95 ? <Burst x={540} y={1100} r0={60} r1={150} n={10} o={bump(lf, 18, 6)} color={P.orange} /> : null}
          <Poof x={540} y={700} t={lf} s={1.1} />
        </Layer>
      </Shot>
    );
  }
  // Warteschleife: Reihen uralter Leute mit Telefon am Ohr, Spinnweben, Warte-Noten
  const ppl = [
    [190, P.purple, "none"],
    [540, P.teal, "bun"],
    [890, P.orange, "side"],
  ] as const;
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 0.95)], [len, frameOn(540, 1000, 540, 860, 1.05)]])}>
      <Layer depth={0.7}>
        <HoldRoom f={lf} />
      </Layer>
      <Layer>
        {ppl.map(([x, c, h], k) => {
          const sc = 1.0;
          const hy = 1450 - 336 * sc;
          return (
            <g key={x}>
              <rect x={x - 150} y={1440} width={300} height={34} rx={8} fill="#6B5A3A" stroke={INK} strokeWidth={5} />
              <OldGuy x={x} y={1450} s={sc} seated c={c} h={h} beard={k % 2 === 0 ? 0.6 : 0} eyes={k === 1 ? "closed" : "half"} bags={0.8} brows="sad" mouth={k === 2 ? "drool" : "flat"} armR={150} bendR={-150} armL={15} nod={k === 1 ? 14 : 0} />
              <PhoneS x={x + 118 * sc} y={hy + 10} s={0.9} r={12} glow="#9BE35A" />
            </g>
          );
        })}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* oldest                                                             */
/* ================================================================== */

export const MOldest: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He", 0.5) - 2], d, f);
  if (i === 0) {
    // Party: Torte mit 31 Kerzen = ein einziges Flammenmeer, Gäste wedeln, Feuerlöscher
    const spray = ease(lf, len * 0.5, len * 0.6);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.05)], [len, frameOn(540, 1000, 540, 860, 1.15)]])}>
        <Layer depth={0.7}>
          <Party f={lf} />
        </Layer>
        <Layer>
          <Person x={110} y={1560} s={0.9} shirt={P.sky} hair="curly" hairColor="#2A1B12" skin={P.skin3} eyes="wide" brows="up" mouth="scream" open={0.7} armL={160} armR={160} gest={14} />
          <Person x={980} y={1560} s={0.9} shirt={P.lime} hair="pony" hairColor="#E8B23A" skin={P.skin} eyes="xx" brows="up" mouth="scream" open={0.8} armL={140} armR={40} gest={10} />
          <Cake x={540} y={1260} f={lf} s={0.95} />
          {spray > 0 ? (
            <g>
              <rect x={860} y={1060} width={70} height={170} rx={20} fill={P.red} stroke={INK} strokeWidth={6} />
              <path d={`M 860 1080 Q 700 ${1000 - 60 * Math.sin(lf)} ${lerp(860, 320, spray)} 980`} fill="none" stroke="#FFFFFF" strokeWidth={70 * spray} strokeLinecap="round" opacity={0.85} />
            </g>
          ) : null}
        </Layer>
      </Shot>
    );
  }
  // Dunkles Zimmer: uralter, verschrumpelter 31-Jähriger tippt, Ein-Stern-Bewertungen fliegen
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 840, 1.15)], [len, frameOn(540, 1050, 540, 840, 1.3)]])}>
      <Layer depth={0.7}>
        <DarkRoom />
      </Layer>
      <Layer>
        <rect x={250} y={1300} width={300} height={40} rx={10} fill="#5B3A22" stroke={INK} strokeWidth={6} />
        <rect x={385} y={1340} width={30} height={160} fill="#3B2412" stroke={INK} strokeWidth={5} />
        <OldGuy x={400} y={1300} s={1} seated c="#5B6178" h="none" skin="#D9C2A8" beard={0.9} glasses eyes="squint" brows="angry" mouth="frown" bags={1} armL={90} armR={90} bendL={-60} bendR={-60} gest={6} lean={8} />
        <Laptop x={800} y={1240} s={0.7} glow="#7FD6FF" />
        {[0, 1, 2].map((k) => {
          const t = ((lf + k * 12) % 36) / 36;
          return <OneStar key={k} x={lerp(800, [170, 900, 540][k], t)} y={lerp(1000, [500, 420, 300][k], t)} s={lerp(0.2, 0.75, t)} r={(k - 1) * 12 * t} />;
        })}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* tyler                                                              */
/* ================================================================== */

export const MTyler: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Can", 0.5) - 2, W("without", 0.8) - 2], d, f);
  if (i === 0) {
    // Couch: Tyler meckert ins Handy, drei Meckerblasen hintereinander
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 840, 1.2)], [len, frameOn(540, 1050, 540, 840, 1.32)]])}>
        <Layer depth={0.7}>
          <Apartment />
        </Layer>
        <Layer>
          <Tyler x={540} y={1300} s={1} seated eyes="rolled" brows="angry" mouth="talk" open={0.5 + 0.4 * Math.sin(lf * 0.7)} armR={150} bendR={-110} armL={60} gest={8} />
          <PhoneS x={hand(540, 1300, 1, 150, 1, true)[0] - 60} y={hand(540, 1300, 1, 150, 1, true)[1] + 60} s={1} r={-10} />
          {[0, 1, 2].map((k) => <Grumble key={k} x={[230, 850, 540][k]} y={[560, 520, 360][k]} o={clamp01((lf - 4 - k * 14) / 3)} s={0.5} f={lf + k * 5} tail={k === 1 ? -1 : 1} />)}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Montag: Gewitter nur über Tylers Fenster, schwarze Katze läuft vorbei
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 900, 0.95)], [len, frameOn(540, 900, 540, 900, 1.05)]])}>
        <Layer depth={0.6}>
          <Building f={lf} />
        </Layer>
        <Layer>
          <BlackCat x={lerp(-200, 1250, ease(lf, 0, len, "linear"))} y={1720} f={lf} s={1.1} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: Tyler klebt sich ein X über den Mund, Daumen hoch, Schweiß
  const k = ease(lf, 2, 10);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 800, 1.45)], [len, frameOn(540, 1084, 540, 800, 1.6)]])}>
      <Layer depth={0}>
        <ReactBg a={P.orange} b="#FFC08A" f={lf} />
      </Layer>
      <Layer>
        <Tyler x={540} y={1500} s={1} eyes="wide" brows="worried" mouth="flat" armR={k > 0.6 ? 150 : 100} bendR={k > 0.6 ? -20 : -110} armL={20} />
        <Tape x={540} y={1500 - 416 + 40} s={1} k={k} />
        {k > 0.6 ? <circle cx={hand(540, 1500, 1, 150, 1)[0]} cy={hand(540, 1500, 1, 150, 1)[1] - 30} r={30} fill={P.skin} stroke={INK} strokeWidth={6} /> : null}
        <Sweat x={430} y={1010} s={0.9} />
        <Sweat x={660} y={980} s={0.7} o={bump(lf, 16, 10)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* coffee                                                             */
/* ================================================================== */

export const MCoffee: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Tyler", 0.35) - 2, W("Weird", 0.7) - 2], d, f);
  if (i === 0) {
    // Schreibtisch nah: Tasse kippt (ab Bild 0), Kaffee flutet den Laptop, Funken
    const tip = ease(lf, 0, 10);
    const pool = ease(lf, 8, 30);
    return (
      <Shot cam={{ x: 540 + jolt(lf, 30, 10), y: 1000, zoom: 1.1 }}>
        <Layer depth={0}>
          <Desk />
        </Layer>
        <Layer>
          <Laptop x={540} y={1250} s={1.3} dead={pool > 0.6 ? 1 : 0} f={lf} />
          <ellipse cx={560} cy={1250} rx={lerp(20, 430, pool)} ry={lerp(8, 60, pool)} fill={M.coffee} stroke={INK} strokeWidth={6} opacity={pool > 0 ? 0.95 : 0} />
          <g transform={`translate(860 1150) rotate(${lerp(0, -100, tip)})`}>
            <rect x={-70} y={-170} width={140} height={170} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
            <path d="M 70 -130 q 60 10 50 60 q -10 40 -50 30" fill="none" stroke={INK} strokeWidth={8} />
          </g>
          {tip > 0.5 ? <path d={`M 700 ${1080} Q 650 1150 620 1240`} stroke={M.coffee} strokeWidth={40 * (1 - pool)} strokeLinecap="round" fill="none" /> : null}
          <Burst x={480} y={950} r0={40} r1={120} n={8} o={bump(lf, 30, 8)} color={P.bus} />
          <Burst x={680} y={880} r0={30} r1={90} n={7} o={bump(lf, 36, 8)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: Tyler lächelt mit aufgerissenen Augen (Geisel-Video), Schweiß
    return (
      <Shot cam={{ ...frameOn(540, 1084, 540, 780, 1.55), x: frameOn(540, 1084, 540, 780, 1.55).x + Math.sin(lf * 2.3) * 2 }}>
        <Layer depth={0.7}>
          <Room wall="#9DE0FF" floor={1500} />
          <rect x={-2000} y={1250} width={5000} height={2000} fill="#B8693A" />
        </Layer>
        <Layer>
          <Tyler x={540} y={1500} s={1} eyes="wide" look={[0, 0]} brows="worried" mouth="grin" armL={60} armR={60} bendL={-60} bendR={-60} />
          <Sweat x={420} y={980} s={1} />
          <Sweat x={680} y={960} s={0.8} o={bump(lf, 20, 12)} />
          <Sweat x={470} y={930} s={0.6} o={bump(lf, 36, 12)} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche Kopf groß: ein einzelnes graues Haar springt heraus (boing)
  const pop = ease(lf, W("one", 0.3, 1) - (W("Weird", 0.7) - 2), W("one", 0.3, 1) - (W("Weird", 0.7) - 2) + 6);
  const wob = Math.sin(lf * 0.9) * 14 * Math.exp(-Math.max(0, lf - 10) * 0.05);
  const hy = 1500 - 416;
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 900, 2.0)], [len, frameOn(540, 980, 540, 900, 2.15)]])}>
      <Layer depth={0}>
        <ReactBg a={P.lime} b="#C8F59A" f={lf} />
      </Layer>
      <Layer>
        <Tyler x={540} y={1500} s={1} eyes="open" look={[0, -1]} brows="up" mouth="o" open={0.3} armL={10} armR={10} />
        {pop > 0 ? <path d={`M 540 ${hy - 120} q ${-30 + wob} ${-60 * pop} ${10 + wob} ${-110 * pop} q ${30 - wob} ${-40 * pop} ${-10} ${-70 * pop}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" /> : null}
        {pop > 0 ? <path d={`M 540 ${hy - 120} q ${-30 + wob} ${-60 * pop} ${10 + wob} ${-110 * pop} q ${30 - wob} ${-40 * pop} ${-10} ${-70 * pop}`} fill="none" stroke="#FFFFFF" strokeWidth={11} strokeLinecap="round" /> : null}
        <Burst x={540} y={hy - 260} r0={30} r1={80} n={8} o={bump(lf, (W("one", 0.3, 1) - (W("Weird", 0.7) - 2)) + 6, 6)} color="#FFFFFF" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* train                                                              */
/* ================================================================== */

export const MTrain: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He", 0.25) - 2, W("Sarcasm", 0.6) - 2, W("Two", 0.85) - 2], d, f);
  if (i === 0) {
    // Bahnsteig: leeres Gleis, eine Schnecke kriecht über die Schiene, Wartende
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1100, 540, 900, 0.95)], [len, frameOn(600, 1100, 540, 900, 1.05)]])}>
        <Layer depth={0.6}>
          <Station f={lf} />
        </Layer>
        <Layer>
          {[60, 300, 820, 1040].map((x, k) => (
            <Person key={x} x={x} y={1150} s={0.65} shirt={[P.purple, P.teal, P.pink, P.lime][k]} hair={(["side", "bun", "curly", "pony"] as const)[k]} hairColor="#2A1B12" skin={[P.skin, P.skin2, P.skin3, P.skin][k]} eyes="half" bags={0.7} brows="sad" mouth="flat" armL={10} armR={10} nod={k % 2 ? 8 : -6} />
          ))}
          <Tyler x={560} y={1150} s={0.75} eyes="half" look={[1, 0]} brows="worried" mouth="flat" armL={10} armR={10} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Halbnah: Tyler doppelter Daumen hoch, falsches Grinsen
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1100, 540, 820, 1.35)], [len, frameOn(540, 1100, 540, 820, 1.48)]])}>
        <Layer depth={0.6}>
          <Station f={lf + 60} />
        </Layer>
        <Layer>
          <Tyler x={540} y={1500} s={1} eyes="half" brows="up" mouth="smug" armL={150} armR={150} bendL={-20} bendR={-20} gest={4} />
          {([-1, 1] as const).map((sd) => {
            const [hx, hy] = hand(540, 1500, 1, 150, sd);
            return <circle key={sd} cx={hx} cy={hy - 30} r={32} fill={P.skin} stroke={INK} strokeWidth={6} />;
          })}
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Bahnsteig-Wand: ein riesiges Ohr wächst heraus – die Stadt hört mit; Tyler erstarrt
    const o = ease(lf, 2, 12);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.1)], [len, frameOn(540, 1000, 540, 860, 1.2)]])}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#4A6BD6" />
          {Array.from({ length: 8 }).map((_, k) => <rect key={k} x={-200 + (k % 4) * 380} y={300 + Math.floor(k / 4) * 520} width={340} height={480} fill="#5A7BE6" stroke={INK} strokeWidth={5} />)}
          <rect x={-2000} y={1500} width={5000} height={2000} fill="#FFE27A" />
        </Layer>
        <Layer>
          <Ear x={760} y={800} s={1.4} o={o} />
          <Tyler x={330} y={1560} s={1} eyes="wide" look={[1, -0.4]} brows="up" mouth="grin" armL={10} armR={10} />
          <Sweat x={220} y={900} s={1} o={clamp01((lf - 10) / 4)} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: POOF – Krähenfüße, graue Schläfen, kleiner Bauch
  const o = ease(lf, 3, 10);
  return (
    <Shot cam={{ ...frameOn(540, 1084, 540, 820, 1.4), x: frameOn(540, 1084, 540, 820, 1.4).x + jolt(lf, 3, 12) }}>
      <Layer depth={0}>
        <ReactBg a={P.sky} b="#BFE8FF" f={lf} />
      </Layer>
      <Layer>
        <Tyler x={540} y={1500} s={1} gray={o * 0.45} wrinkles={o * 0.6} eyes="half" bags={o} brows="sad" mouth="flat" armL={10} armR={10} chest={<ellipse cx={0} cy={-170} rx={lerp(60, 120, o)} ry={lerp(40, 90, o)} fill={M.hoodie} stroke={INK} strokeWidth={6} opacity={o} />} />
        <Poof x={540} y={1000} t={lf} s={1.2} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* boss                                                               */
/* ================================================================== */

export const MBoss: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Tyler", 0.4) - 2, W("left", 0.65) - 2], d, f);
  if (i === 0) {
    // Meeting: selbstgefälliger Chef zeigt auf Tylers Glühbirnen-Zeichnung, alle klatschen
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.0)], [len, frameOn(540, 1000, 540, 860, 1.1)]])}>
        <Layer depth={0.7}>
          <Office />
        </Layer>
        <Layer>
          <Boss x={300} y={1300} s={0.95} eyes="half" brows="up" mouth="smug" armR={120} bendR={10} armL={20} />
          {[100, 800, 1000].map((x, k) => (
            <Person key={x} x={x} y={1560} s={0.8} shirt={[P.purple, P.teal, P.pink][k]} hair={(["bun", "side", "curly"] as const)[k]} hairColor="#2A1B12" skin={[P.skin2, P.skin, P.skin3][k]} eyes="closed" brows="up" mouth="grin" armL={60 + 20 * Math.sin(lf * 1.1 + k)} armR={60 + 20 * Math.sin(lf * 1.1 + k)} bendL={-90} bendR={-90} />
          ))}
          <Tyler x={600} y={1560} s={0.85} eyes="wide" look={[-1, -0.3]} brows="up" mouth="o" open={0.5} armL={10} armR={10} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: Tyler erstarrtes Lächeln, Faust zittert
    return (
      <Shot cam={{ ...frameOn(540, 1084, 540, 800, 1.5), x: frameOn(540, 1084, 540, 800, 1.5).x + Math.sin(lf * 2.7) * 3 }}>
        <Layer depth={0.7}>
          <Office />
        </Layer>
        <Layer>
          <Tyler x={540} y={1500} s={1} eyes="twitch" f={lf} brows="angry" mouth="grin" armL={60} bendL={-100} armR={10} />
          <circle cx={hand(540, 1500, 1, 60, -1)[0] + 40 + Math.sin(lf * 3) * 5} cy={hand(540, 1500, 1, 60, -1)[1] - 90} r={40} fill={P.skin} stroke={INK} strokeWidth={6} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche Gesicht groß: nur das linke Auge altert – Falten, Hängelid, buschige graue Braue
  const a = ease(lf, 4, len * 0.7);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 840, 2.0)], [len, frameOn(500, 1084, 540, 840, 2.3)]])}>
      <Layer depth={0}>
        <ReactBg a={P.purple} b="#C9B3FF" f={lf} />
      </Layer>
      <Layer>
        <Tyler x={540} y={1500} s={1} eyes="open" look={[0.3, 0]} brows="neutral" mouth="flat" eyeAge={a} armL={10} armR={10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* midnight                                                           */
/* ================================================================== */

export const MMidnight: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He", 0.35) - 2], d, f);
  if (i === 0) {
    // Wanduhr groß: Zeiger springen auf zwölf, Uhr hüpft
    const t = ease(lf, 0, Math.max(6, len - 10), "inOut");
    const hit = Math.max(6, len - 10);
    return (
      <Shot cam={{ x: 540, y: 900 + jolt(lf, hit, 16), zoom: 1 + 0.08 * bump(lf, hit, 8) }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2A2470" />
          {Array.from({ length: 20 }).map((_, k) => <circle key={k} cx={(k * 211) % 1080} cy={(k * 337) % 1900} r={6} fill="#FFF4C2" opacity={0.6} />)}
        </Layer>
        <Layer>
          <Clock x={540} y={900} s={1.15} h={lerp(-0.6, 0, t)} m={lerp(-Math.PI * 2 * 0.95, 0, t)} />
          <Burst x={540} y={900} r0={360} r1={470} n={16} o={bump(lf, hit + 2, 10)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: Tyler (graue Schläfen) jubelt, Konfetti, posiert
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 840, 1.2)], [len, frameOn(540, 1084, 540, 840, 1.35)]])}>
      <Layer depth={0}>
        <ReactBg a={P.bus} b="#FFE58A" f={lf} />
      </Layer>
      <Layer>
        <Tyler x={540} y={1500} s={1} gray={0.45} wrinkles={0.35} eyes="closed" brows="up" mouth="grin" armL={165} armR={lerp(165, 120, ease(lf, 20, 30))} bendL={-20} bendR={lerp(-20, -110, ease(lf, 20, 30))} gest={6} />
        <Confetti f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

export const MTwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Turns", 0.35) - 2, W("Forty-seven", 0.55) - 2, W("Bro", 0.8) - 2], d, f);
  if (i === 0) {
    // Nachts im Bett: Tyler zufrieden, dann Gedankenblase mit Gewitter + Kackhaufen
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 900, 1.05)], [len, frameOn(540, 1150, 540, 900, 1.2)]])}>
        <Layer depth={0.7}>
          <NightRoom />
        </Layer>
        <Layer>
          <Bed x={540} y={1500} w={900} c="#7FA8FF" />
          <Tyler x={300} y={1360} s={0.9} seated gray={0.45} wrinkles={0.35} eyes={lf > 10 ? "half" : "closed"} brows={lf > 10 ? "sad" : "up"} mouth={lf > 10 ? "frown" : "smile"} armL={20} armR={20} lean={-25} />
          <Thought x={700} y={560} o={clamp01((lf - 8) / 4)} s={0.95} f={lf} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Comic-Fläche: riesiger POOF, Staubwolken
    return (
      <Shot cam={{ x: 540 + jolt(lf, 2, 22), y: 1000 + jolt(lf, 4, 16), zoom: 1.05 }}>
        <Layer depth={0}>
          <ReactBg a="#3A2F8A" b="#7A6BD6" f={lf} />
        </Layer>
        <Layer>
          <Poof x={420} y={1050} t={lf} s={2.2} />
          <Poof x={650} y={900} t={lf - 4} s={1.6} />
          <Poof x={300} y={800} t={lf - 8} s={1.3} />
          <Burst x={480} y={1000} r0={300} r1={480} n={14} o={bump(lf, 3, 8)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Tyler ist 75: Glatze, Bart bis zum Boden, krumm, Bett bricht ein
    const sag = ease(lf, 4, 12);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1100, 540, 860, 1.0)], [len, frameOn(540, 1100, 540, 860, 1.12)]])}>
        <Layer depth={0.7}>
          <NightRoom />
        </Layer>
        <Layer>
          <g transform={`rotate(${lerp(0, 6, sag)} 540 1500) translate(0 ${lerp(0, 40, sag)})`}>
            <Bed x={540} y={1500} w={900} c="#7FA8FF" />
          </g>
          <Tyler x={520} y={1420} s={1} seated old={1} eyes="half" bags={1} brows="up" mouth="o" open={0.3} armL={20} armR={20} />
          <Burst x={980} y={1460} r0={40} r1={110} n={8} o={bump(lf, 12, 6)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: Greisengesicht groß, Gebiss fällt heraus
  const fall = ease(lf, 6, 18, "linear");
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 840, 1.7)], [len, frameOn(540, 1084, 540, 840, 1.85)]])}>
      <Layer depth={0}>
        <ReactBg a={P.red} b="#FF9AA6" f={lf} />
      </Layer>
      <Layer>
        <Tyler x={540} y={1500} s={1} old={1} eyes="wide" brows="up" mouth="o" open={0.8} armL={10} armR={10} />
        <g transform={`translate(560 ${1500 - 416 + 60 + fall * fall * 520}) rotate(${fall * 200})`}>
          <rect x={-60} y={-20} width={120} height={40} rx={18} fill="#FF8FA8" stroke={INK} strokeWidth={5} />
          {[-40, -15, 10, 35].map((k) => <rect key={k} x={k - 10} y={-18} width={20} height={20} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* date                                                               */
/* ================================================================== */

export const MDate: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("She", 0.45) - 2], d, f);
  if (i === 0) {
    // Haustür: hübsches Date mit Blumen, der alte Tyler öffnet mit Rollator
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 860, 1.0)], [len, frameOn(540, 1050, 540, 860, 1.1)]])}>
        <Layer depth={0.7}>
          <Doorway />
        </Layer>
        <Layer>
          <Tyler x={700} y={1500} s={0.95} old={1} eyes="half" bags={1} brows="up" mouth="smile" armL={40} armR={40} />
          <Walker x={700} y={1500} s={0.9} />
          <DateGirl x={220} y={1560} s={0.95} eyes="open" look={[1, 0]} brows="up" mouth="smile" armR={70} bendR={-60} armL={15} />
          <Flowers x={hand(220, 1560, 0.95, 70, 1)[0]} y={hand(220, 1560, 0.95, 70, 1)[1]} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Date späht hoffnungsvoll an ihm vorbei in die Wohnung, Tyler deadpan, Blüten fallen
  const peek = ease(lf, 2, 10);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 820, 1.3)], [len, frameOn(540, 1084, 540, 820, 1.42)]])}>
      <Layer depth={0.7}>
        <Doorway />
      </Layer>
      <Layer>
        <DateGirl x={lerp(260, 340, peek)} y={1560} s={1} lean={lerp(0, 14, peek)} eyes="open" look={[1, -0.6]} brows="up" mouth="smile" blush armR={70} bendR={-60} armL={15} />
        <Flowers x={hand(lerp(260, 340, peek), 1560, 1, 70, 1)[0]} y={hand(lerp(260, 340, peek), 1560, 1, 70, 1)[1]} s={0.95} drop={ease(lf, len * 0.5, len)} />
        <Tyler x={760} y={1560} s={1} old={1} eyes="half" look={[-1, 0]} bags={1} brows="neutral" mouth="flat" armL={20} armR={20} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const MOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Comment", 0.35) - 2], d, f);
  const Screen: React.FC<{ readonly typed: number; readonly hairs: number }> = ({ typed, hairs }) => (
    <g>
      <rect x={140} y={120} width={800} height={1700} rx={80} fill={INK} />
      <rect x={170} y={150} width={740} height={1640} rx={60} fill="#151626" />
      {/* Video-Vorschau oben: Mini-Tyler alt */}
      <rect x={200} y={190} width={680} height={620} rx={30} fill={P.red} />
      <Person x={540} y={760} s={0.7} shirt="#C98A5E" hair="none" hairColor={M.grayHair} skin="#E7C3A6" wrinkles={1} beard={1} eyes="half" brows="up" mouth="o" open={0.3} armL={10} armR={10} lean={10} nod={12} />
      {/* Kommentare (Kritzel-Zeilen, ohne Schrift) */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <circle cx={250} cy={900 + k * 140} r={38} fill={[P.purple, P.teal, P.pink][k]} />
          <rect x={310} y={880 + k * 140} width={[480, 380, 520][k]} height={22} rx={11} fill="#3A3F5A" />
          <rect x={310} y={920 + k * 140} width={[300, 420, 260][k]} height={18} rx={9} fill="#2E3350" />
        </g>
      ))}
      {/* Eingabefeld + getippte Punkte */}
      <rect x={200} y={1380} width={680} height={110} rx={55} fill="#2E3350" stroke="#FFFFFF" strokeWidth={4} />
      {Array.from({ length: Math.floor(typed * 12) }).map((_, k) => <circle key={k} cx={260 + k * 44} cy={1435} r={14} fill="#FFFFFF" />)}
      <rect x={260 + Math.floor(typed * 12) * 44 - 10} y={1405} width={6} height={60} fill="#FFFFFF" opacity={Math.sin(f * 0.5) > 0 ? 1 : 0} />
      {/* graue Haare fallen aufs Display */}
      {Array.from({ length: hairs }).map((_, k) => {
        const y = Math.min(1300, 200 + ((lf * 14 + k * 260) % 1100));
        return <path key={k} d={`M ${300 + ((k * 197) % 480)} ${y} q 40 -30 70 10 q 30 40 70 0`} fill="none" stroke={M.grayHair} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
  if (i === 0) {
    // POV: das Handy des Zuschauers (dieses Video), Hand hält es
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 960, zoom: 0.9 }], [len, { x: 540, y: 960, zoom: 0.97 }]])}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
        </Layer>
        <Layer>
          <Screen typed={0} hairs={0} />
          <PovHand x={960} y={1300} w={0} />
        </Layer>
      </Shot>
    );
  }
  // POV: Daumen tippt einen Kommentar – und altert dabei, graue Haare fallen aufs Display
  const typed = ease(lf, 0, len * 0.8, "linear");
  const w = ease(lf, len * 0.25, len * 0.9);
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1200, zoom: 1.15 }], [len, { x: 560, y: 1250, zoom: 1.3 }]])}>
      <Layer depth={0}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
      </Layer>
      <Layer>
        <Screen typed={typed} hairs={Math.floor(w * 6)} />
        <PovHand x={260 + Math.floor(typed * 12) * 44 + 20} y={1470 + Math.sin(lf * 1.3) * 10} w={w} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const MECKERN_SCENES: Record<string, React.FC> = {
  hook: MHook,
  rules: MRules,
  oldest: MOldest,
  tyler: MTyler,
  coffee: MCoffee,
  train: MTrain,
  boss: MBoss,
  midnight: MMidnight,
  twist: MTwist,
  date: MDate,
  outro: MOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(MECKERN_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Meckerwolken/Sterne sind Bildzeichen. */
export const MECKERN_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene + Set-Folge (vor dem Render gezählt):
 * Regen-Straße ×2 | Diner ×2, Warteschleife | Party, Dunkelzimmer | Couch, Hausfassade, Comic orange |
 * Schreibtisch-ECU, Zimmer blau, Comic grün | Bahnsteig ×2, Ohr-Wand, Comic hellblau | Büro ×2, Comic lila |
 * Uhr-ECU, Comic gelb | Schlafzimmer, Comic violett (POOF), Schlafzimmer, Comic rot | Haustür ×2 | POV ×2
 * → nie > 2 gleiche am Stück, 22 Bildwelten. */
export const MECKERN_SHOT_COUNT: Record<string, number> = { hook: 2, rules: 3, oldest: 2, tyler: 3, coffee: 3, train: 4, boss: 3, midnight: 2, twist: 4, date: 2, outro: 2 };
