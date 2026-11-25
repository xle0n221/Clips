import React from "react";
import { camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/scroll-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, INK, P, Person, Street, Sweat, BusInterior, Seat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";
import { ReactBg } from "./suche";
import { Room } from "./akku";
import { CouchBack, CouchFront, Poof, Sparkle } from "./todo";
import { Clock, Confetti } from "./meckern";
import { Cat } from "./ghosting";

/**
 * „In This City, Every Minute You Doomscroll, You Shrink One Inch“ (episodes/scroll-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Konsequenz = Schrumpfen (Figuren-Skalierung gegen riesige Alltagsdinge, Messlatte an der Wand). Eine Text-Ebene
 * (Untertitel); Handy-Inhalte sind Symbole/Kritzel-Zeilen, keine Schrift im Bild. Schnitte an Wort-Beats.
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

/** Langsamer Push-in auf einen Weltpunkt. */
const push = (lf: number, len: number, wx: number, wy: number, z0: number, z1: number, sx = 540, sy = 900) =>
  camPath(lf, [
    [0, frameOn(wx, wy, sx, sy, z0)],
    [len, frameOn(wx, wy, sx, sy, z1)],
  ]);

const C = {
  hoodie: "#FF8A1F",
  hair: "#1B1530",
  room: "#6FD3C9",
  bed: "#B79CFF",
  sky: "#7FD0FF",
  lobby: "#FFD84D",
  office: "#C8F27A",
  desk: "#C98A4E",
  deskDark: "#9A6534",
  janitor: "#2F6FD6",
  bag: "#8C7458",
  dust: "#B9A88E",
  screen: "#7FD6FF",
  date: "#FF6FAE",
};

/** Stufenweises Schrumpfen: n Stufen von a bis b zwischen den Frames t0 und t1, mit kleinem Federn je Stufe. */
const steps = (f: number, t0: number, t1: number, a: number, b: number, n: number) => {
  const t = clamp01((f - t0) / Math.max(1, t1 - t0));
  const k = Math.min(n, Math.floor(t * n + 1e-6));
  const local = t * n - k;
  const bounce = k > 0 && local < 0.35 ? Math.sin((local / 0.35) * Math.PI) * 0.035 : 0;
  return lerp(a, b, k / n) * (1 - bounce);
};
/** Frame der letzten Schrumpf-Stufe (für Effekte). */
const stepAt = (f: number, t0: number, t1: number, n: number) => {
  const t = clamp01((f - t0) / Math.max(1, t1 - t0));
  const k = Math.min(n, Math.floor(t * n + 1e-6));
  return k === 0 ? -99 : f - (t0 + (k / n) * (t1 - t0));
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Tyler: React.FC<Fig & { readonly suitUp?: boolean }> = ({ suitUp, ...p }) => (
  <Person pants="#2B3A67" {...p} shirt={suitUp ? "#2E3A8C" : C.hoodie} suit={suitUp} hair="curly" hairColor={C.hair} skin={P.skin2} />
);
const Grandpa: React.FC<Fig> = (p) => (
  <Person pants="#6B5B45" cardigan {...p} shirt={P.cream} hair="none" hairColor="#EDEDED" skin="#F2C7A5" glasses wrinkles={0.7} stache />
);
const Janitor: React.FC<Fig> = (p) => <Person pants={C.janitor} cap headphones {...p} shirt={C.janitor} hair="side" hairColor="#2A1B12" skin={P.skin3} />;
const Boss: React.FC<Fig> = (p) => <Person pants="#2A2440" suit {...p} shirt="#B0306A" hair="bun" hairColor="#1B1530" skin={P.skin} />;

/** Handposition (ohne Ellenbogen-Beugung) – Ursprung Füße wie Person. */
const hand = (x: number, y: number, s: number, deg: number, side: 1 | -1, seated = false) => {
  const sh = (seated ? -250 : -330) + 40;
  const a = (deg * Math.PI) / 180;
  return [x + side * (78 + Math.sin(a) * 130) * s, y + (sh + Math.cos(a) * 130) * s] as const;
};
/** Kopfmitte. */
const head = (x: number, y: number, s: number, seated = false) => [x, y + ((seated ? -250 : -330) - 86) * s] as const;

/* ------------------------------------------------------------------ */
/* Requisiten                                                         */
/* ------------------------------------------------------------------ */

/** Handy mit leuchtendem Bildschirm; scroll = Kritzel-Zeilen laufen nach oben. */
const Phone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly scroll?: number; readonly glow?: string }> = ({
  x,
  y,
  s = 1,
  r = 0,
  scroll = 0,
  glow = C.screen,
}) => {
  const off = (scroll * 26) % 44;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x={-40} y={-74} width={80} height={148} rx={14} fill={INK} />
      <rect x={-32} y={-64} width={64} height={124} rx={8} fill={glow} />
      <clipPath id={`ph-${Math.round(x)}-${Math.round(y)}`}>
        <rect x={-32} y={-64} width={64} height={124} rx={8} />
      </clipPath>
      <g clipPath={`url(#ph-${Math.round(x)}-${Math.round(y)})`}>
        {Array.from({ length: 5 }).map((_, k) => (
          <rect key={k} x={-24} y={-60 + k * 44 - off} width={48} height={30} rx={6} fill="#FFFFFF" opacity={0.75} />
        ))}
      </g>
    </g>
  );
};

/** Großer Handy-Bildschirm (Nahaufnahme), Kinder in Bildschirm-Koordinaten (0..w, 0..h). */
const Screen: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly h?: number; readonly r?: number; readonly bg?: string; readonly children?: React.ReactNode }> = ({
  x,
  y,
  w = 620,
  h = 1100,
  r = 0,
  bg = "#F4F6FF",
  children,
}) => (
  <g transform={`translate(${x - w / 2} ${y - h / 2}) rotate(${r} ${w / 2} ${h / 2})`}>
    <rect x={-34} y={-40} width={w + 68} height={h + 80} rx={70} fill={INK} />
    <rect x={0} y={0} width={w} height={h} rx={40} fill={bg} />
    <clipPath id={`scr-${Math.round(x)}-${Math.round(y)}-${w}`}>
      <rect x={0} y={0} width={w} height={h} rx={40} />
    </clipPath>
    <g clipPath={`url(#scr-${Math.round(x)}-${Math.round(y)}-${w})`}>{children}</g>
    <rect x={w / 2 - 70} y={18} width={140} height={26} rx={13} fill={INK} />
  </g>
);

/** Messlatte an der Wand: Striche ohne Zahlen, Markierung = aktuelle Kopfhöhe. */
const HeightChart: React.FC<{ readonly x: number; readonly y: number; readonly h: number; readonly mark: number; readonly old?: readonly number[] }> = ({ x, y, h, mark, old = [] }) => (
  <g>
    <rect x={x - 45} y={y - h} width={90} height={h} rx={10} fill="#FFF4D6" stroke={INK} strokeWidth={7} />
    {Array.from({ length: Math.floor(h / 40) }).map((_, k) => (
      <line key={k} x1={x - 45} x2={x - 45 + (k % 4 === 0 ? 60 : 30)} y1={y - k * 40} y2={y - k * 40} stroke={INK} strokeWidth={k % 4 === 0 ? 6 : 3} />
    ))}
    {old.map((m, k) => (
      <line key={`o${k}`} x1={x - 70} x2={x + 70} y1={m} y2={m} stroke={P.grey} strokeWidth={6} strokeDasharray="12 10" />
    ))}
    <line x1={x - 80} x2={x + 80} y1={mark} y2={mark} stroke={P.red} strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** Schrumpf-Effekt: drei Pfeile nach unten + Ringe, t = Frames seit der Stufe. */
const ShrinkFx: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t < 0 || t > 14) return null;
  const k = t / 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - k}>
      {[-1, 0, 1].map((j) => (
        <path
          key={j}
          d={`M ${j * 110 - 30} ${-40 + k * 80} L ${j * 110} ${k * 80} L ${j * 110 + 30} ${-40 + k * 80}`}
          fill="none"
          stroke={P.red}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <ellipse cx={0} cy={140} rx={120 + k * 160} ry={30 + k * 30} fill="none" stroke="#FFFFFF" strokeWidth={8} />
    </g>
  );
};

const Speech: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number; readonly side?: 1 | -1; readonly lines?: number }> = ({
  x,
  y,
  s = 1,
  o = 1,
  side = 1,
  lines = 2,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d={`M -190 -110 L 190 -110 Q 230 -110 230 -70 L 230 40 Q 230 80 190 80 L ${side * 40} 80 L ${side * 90} 150 L ${side * -30} 80 L -190 80 Q -230 80 -230 40 L -230 -70 Q -230 -110 -190 -110 Z`} fill="#FFFFFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {Array.from({ length: lines }).map((_, k) => (
      <path key={k} d={`M -160 ${-60 + k * 55} q 40 -14 80 0 t 80 0 t 80 0 t 60 0`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    ))}
  </g>
);

const FlipPhone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly open: number; readonly r?: number }> = ({ x, y, s = 1, open, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-34} y={0} width={68} height={100} rx={12} fill="#7A8094" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }).map((_, k) => (
      <circle key={k} cx={-18 + (k % 3) * 18} cy={30 + Math.floor(k / 3) * 22} r={6} fill="#D5D9E6" />
    ))}
    <g transform={`scale(1 ${lerp(1, -0.05, 1 - open)})`}>
      <rect x={-34} y={-100} width={68} height={100} rx={12} fill="#9AA0B4" stroke={INK} strokeWidth={6} />
      <rect x={-22} y={-86} width={44} height={56} rx={6} fill="#B9F2C9" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);

const Mug: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly c?: string; readonly steam?: number }> = ({ x, y, s = 1, c = P.red, steam = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 60 -120 q 60 0 60 50 q 0 50 -60 50" fill="none" stroke={INK} strokeWidth={22} />
    <path d="M 60 -120 q 60 0 60 50 q 0 50 -60 50" fill="none" stroke={c} strokeWidth={10} />
    <rect x={-70} y={-160} width={140} height={160} rx={18} fill={c} stroke={INK} strokeWidth={7} />
    <ellipse cx={0} cy={-160} rx={70} ry={16} fill="#6B3A1E" stroke={INK} strokeWidth={5} />
    {steam > 0
      ? [-30, 10, 45].map((sx, k) => (
          <path key={k} d={`M ${sx} -190 q -20 -40 0 -80 q 20 -40 0 -80`} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.7 * steam} />
        ))
      : null}
  </g>
);

const Pigeon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly flap?: number; readonly look?: "phone" | "fwd"; readonly phone?: boolean; readonly flip?: boolean }> = ({
  x,
  y,
  s = 1,
  f,
  flap = 1,
  look = "fwd",
  phone,
  flip,
}) => {
  const w = Math.sin(f * 0.6) * 40 * flap;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M -260 -40 L -380 -90 L -360 -10 Z" fill="#8A93A8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={-40} cy={-40} rx={240} ry={130} fill="#B6BDCE" stroke={INK} strokeWidth={8} />
      <ellipse cx={110} cy={-70} rx={90} ry={80} fill="#7FA89A" stroke={INK} strokeWidth={0} opacity={0.6} />
      <g transform={`translate(-40 -90) rotate(${-20 - w})`}>
        <path d="M 0 0 Q -120 -200 -320 -150 Q -200 -60 0 20 Z" fill="#9AA2B6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </g>
      <circle cx={170} cy={-150} r={78} fill="#B6BDCE" stroke={INK} strokeWidth={8} />
      <path d="M 238 -150 L 300 -128 L 236 -112 Z" fill="#F2B33D" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={190} cy={-170} r={24} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={look === "phone" ? 186 : 200} cy={look === "phone" ? -158 : -172} r={11} fill={INK} />
      <path d="M 160 -200 L 220 -192" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M -40 85 L -60 140 M 30 85 L 20 140" stroke="#F2B33D" strokeWidth={12} strokeLinecap="round" />
      {phone ? (
        <g>
          <path d="M 90 -40 Q 180 -40 210 -80" fill="none" stroke={INK} strokeWidth={34} strokeLinecap="round" />
          <path d="M 90 -40 Q 180 -40 210 -80" fill="none" stroke="#9AA2B6" strokeWidth={22} strokeLinecap="round" />
          <Phone x={240} y={-110} s={0.75} r={-25} scroll={f * 0.5} />
          <path d="M 205 -135 L 250 -128" stroke={C.screen} strokeWidth={30} opacity={0.25} />
        </g>
      ) : null}
    </g>
  );
};

const Vacuum: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly nx: number; readonly ny: number; readonly on?: number; readonly f: number }> = ({
  x,
  y,
  s = 1,
  nx,
  ny,
  on = 0,
  f,
}) => (
  <g>
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${Math.sin(f * 2.3) * 3 * on} 0)`}>
      <rect x={-160} y={-220} width={320} height={200} rx={90} fill="#E04A5A" stroke={INK} strokeWidth={8} />
      <rect x={-110} y={-200} width={120} height={60} rx={24} fill="#FFFFFF" opacity={0.35} />
      <circle cx={-110} cy={-10} r={34} fill={INK} />
      <circle cx={110} cy={-10} r={34} fill={INK} />
    </g>
    <path d={`M ${x + 150 * s} ${y - 150 * s} C ${x + 400 * s} ${y - 500 * s} ${nx - 300} ${ny - 200} ${nx} ${ny - 60}`} fill="none" stroke={INK} strokeWidth={52 * Math.max(0.5, s)} strokeLinecap="round" />
    <path d={`M ${x + 150 * s} ${y - 150 * s} C ${x + 400 * s} ${y - 500 * s} ${nx - 300} ${ny - 200} ${nx} ${ny - 60}`} fill="none" stroke="#5B6178" strokeWidth={36 * Math.max(0.5, s)} strokeLinecap="round" strokeDasharray="18 10" />
    <path d={`M ${nx - 150} ${ny} L ${nx + 150} ${ny} L ${nx + 60} ${ny - 80} L ${nx - 60} ${ny - 80} Z`} fill="#3A3F52" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {on > 0
      ? Array.from({ length: 7 }).map((_, k) => {
          const t = ((f * 0.12 + k / 7) % 1) * on;
          return <path key={k} d={`M ${nx - 260 + k * 85} ${ny + 260 - t * 200} L ${nx - 60 + k * 20} ${ny + 20}`} stroke="#FFFFFF" strokeWidth={6} opacity={0.8 * (1 - t)} strokeLinecap="round" />;
        })
      : null}
  </g>
);

/** Mini-Büro auf dem Schreibtisch: Trennwände aus Klebezetteln, Monitore, Pflanze. Ursprung = Mitte unten. */
const MiniOffice: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly suck?: number }> = ({ x, y, s = 1, suck = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-330, 0, 330].map((cx, k) => (
      <g key={k} transform={`translate(${cx * (1 - suck * 0.3)} ${-suck * 400 * (1 + k * 0.3)}) rotate(${suck * (k - 1) * 40})`} opacity={1 - suck}>
        <rect x={-150} y={-260} width={300} height={260} fill={["#FFE66B", "#9BE3FF", "#FF9FC9"][k]} stroke={INK} strokeWidth={7} />
        <rect x={-70} y={-200} width={140} height={90} rx={8} fill="#3A3F52" stroke={INK} strokeWidth={6} />
        <rect x={-58} y={-190} width={116} height={70} rx={4} fill={C.screen} />
        <rect x={-12} y={-110} width={24} height={30} fill="#3A3F52" />
        <rect x={-130} y={-80} width={260} height={30} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);

const Tie: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -20 -60 L 20 -60 L 12 -40 L 34 60 L 0 100 L -34 60 L -12 -40 Z" fill={P.red} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

const Desk: React.FC<{ readonly top: number }> = ({ top }) => (
  <g>
    <rect x={-2000} y={top} width={5000} height={3000} fill={C.desk} stroke={INK} strokeWidth={9} />
    {Array.from({ length: 10 }).map((_, k) => (
      <path key={k} d={`M -600 ${top + 60 + k * 110} q 500 ${-20 + (k % 3) * 20} 1100 0 t 1200 0`} fill="none" stroke={C.deskDark} strokeWidth={6} opacity={0.6} />
    ))}
  </g>
);

const Pen: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-500} y={-40} width={900} height={80} rx={40} fill="#2F6FD6" stroke={INK} strokeWidth={8} />
    <path d="M 400 -40 L 520 0 L 400 40 Z" fill="#F2E0C0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-420} y={-60} width={260} height={24} rx={10} fill="#C9D3E6" stroke={INK} strokeWidth={5} />
  </g>
);

const Plant: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-60, -25, 10, 45].map((a, k) => (
      <path key={k} d={`M 0 -200 Q ${a * 4} ${-420 - k * 30} ${a * 6} ${-560 + k * 40}`} fill="none" stroke="#2E9E5B" strokeWidth={40} strokeLinecap="round" />
    ))}
    <path d="M -120 -220 L 120 -220 L 90 0 L -90 0 Z" fill="#D9763A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </g>
);

const NotifIcon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-260} y={-90} width={520} height={180} rx={40} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <circle cx={-170} cy={0} r={58} fill={C.date} stroke={INK} strokeWidth={6} />
    <circle cx={-170} cy={-58} r={24} fill="#1B1530" />
    <circle cx={-170} cy={8} r={30} fill={P.skin} stroke={INK} strokeWidth={4} />
    <path d="M -80 -30 q 40 -12 80 0 t 80 0 t 80 0" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    <path d="M -80 30 q 40 -12 80 0 t 80 0" fill="none" stroke={P.grey} strokeWidth={9} strokeLinecap="round" />
    <path d="M 200 -20 q -30 -40 -60 0 q 30 40 60 60 q 30 -20 60 -60 q -30 -40 -60 0 Z" fill={P.red} stroke={INK} strokeWidth={5} />
    <path d="M 200 -18 L 190 10 L 208 22 L 198 52" fill="none" stroke="#FFFFFF" strokeWidth={6} />
  </g>
);

/** Grüner/roter Badge-Punkt. */
const Badge: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly c?: string }> = ({ x, y, s = 1, c = P.red }) => (
  <circle cx={x} cy={y} r={34 * s} fill={c} stroke={INK} strokeWidth={6} />
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                           */
/* ------------------------------------------------------------------ */

const LivingRoom: React.FC = () => (
  <g>
    <Room wall="#FFB86B" floor={1500} />
    <rect x={680} y={380} width={300} height={360} rx={16} fill={C.sky} stroke={INK} strokeWidth={8} />
    <line x1={830} y1={380} x2={830} y2={740} stroke={INK} strokeWidth={8} />
    <line x1={680} y1={560} x2={980} y2={560} stroke={INK} strokeWidth={8} />
  </g>
);

const Bedroom: React.FC<{ readonly wall?: string }> = ({ wall = C.room }) => (
  <g>
    <Room wall={wall} floor={1500} />
    <rect x={720} y={420} width={260} height={320} rx={16} fill="#FFE9A8" stroke={INK} strokeWidth={8} />
    <path d="M 750 700 L 820 560 L 880 640 L 930 590 L 960 700 Z" fill="#8ED6A8" stroke={INK} strokeWidth={5} />
  </g>
);

const Bed: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-520} y={-420} width={120} height={520} rx={30} fill="#7A4E2E" stroke={INK} strokeWidth={8} />
    <rect x={-480} y={-160} width={1000} height={200} rx={40} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <rect x={-460} y={-260} width={260} height={120} rx={50} fill="#FFF4DE" stroke={INK} strokeWidth={7} />
    <rect x={-480} y={20} width={1000} height={80} fill="#7A4E2E" stroke={INK} strokeWidth={8} />
  </g>
);

const Blanket: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -200 -150 Q 100 ${-190 + Math.sin(f * 0.1) * 6} 520 -150 L 520 40 L -200 40 Z`} fill={C.bed} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={20 + k * 180} cy={-60} r={22} fill="#FFFFFF" opacity={0.6} />
    ))}
  </g>
);

const City: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.sky} />
    {[
      [-200, 260],
      [520, 140],
      [1150, 330],
    ].map(([cx, cy], k) => (
      <g key={k} transform={`translate(${((cx + f * (2 + k)) % 1700) - 300} ${cy})`}>
        <ellipse rx={170} ry={60} fill="#FFFFFF" />
        <ellipse cx={-90} cy={20} rx={110} ry={50} fill="#FFFFFF" />
      </g>
    ))}
    {Array.from({ length: 12 }).map((_, k) => {
      const h = 500 + ((k * 211) % 520);
      const x = -500 + k * 190 - ((f * 3) % 190);
      return (
        <g key={k}>
          <rect x={x} y={1900 - h} width={170} height={h + 400} fill={["#9FB8FF", "#FF9DB5", "#FFD86B", "#8ED6A8", "#C9A6FF"][k % 5]} stroke={INK} strokeWidth={7} />
          {Array.from({ length: 6 }).map((_, j) => (
            <rect key={j} x={x + 30} y={1900 - h + 40 + j * 110} width={110} height={60} rx={8} fill="#FFF7D6" stroke={INK} strokeWidth={4} />
          ))}
        </g>
      );
    })}
  </g>
);

const Lobby: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={C.lobby} />
    {Array.from({ length: 10 }).map((_, k) => (
      <rect key={k} x={-600 + k * 260} y={-2000} width={30} height={3500} fill="#FFFFFF" opacity={0.25} />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#E8E2F0" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, k) => (
      <line key={k} x1={-1000 + k * 260} y1={1500} x2={-1600 + k * 400} y2={3000} stroke={P.grey} strokeWidth={5} />
    ))}
  </g>
);

const Elevator: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lit?: number }> = ({ x, y, s = 1, lit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-330} y={-1100} width={660} height={1100} fill="#B8BFD0" stroke={INK} strokeWidth={9} />
    <line x1={0} y1={-1100} x2={0} y2={0} stroke={INK} strokeWidth={8} />
    <rect x={380} y={-700} width={110} height={220} rx={20} fill="#8A90A6" stroke={INK} strokeWidth={8} />
    <circle cx={435} cy={-640} r={34} fill={lit > 0.5 ? "#FFF07A" : "#E8E2F0"} stroke={INK} strokeWidth={6} />
    <circle cx={435} cy={-540} r={34} fill="#E8E2F0" stroke={INK} strokeWidth={6} />
    {lit > 0.5 ? <Burst x={435} y={-640} r0={50} r1={110} n={10} color="#FFF07A" /> : null}
  </g>
);

const InterviewRoom: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#A9B8FF" />
    {Array.from({ length: 8 }).map((_, k) => (
      <rect key={k} x={-400 + k * 260} y={300} width={180} height={420} rx={10} fill="#FFFFFF" opacity={0.25} />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#5B5F9A" />
  </g>
);

const BigChair: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-330} y={-1100} width={660} height={760} rx={90} fill="#2B2F45" stroke={INK} strokeWidth={9} />
    <rect x={-380} y={-380} width={760} height={170} rx={50} fill="#3A3F5A" stroke={INK} strokeWidth={9} />
    <rect x={-30} y={-210} width={60} height={210} fill="#5B6178" stroke={INK} strokeWidth={7} />
  </g>
);

const BagInside: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.bag} />
    {Array.from({ length: 60 }).map((_, k) => {
      const x = ((k * 173) % 1500) - 200 + Math.sin(f * 0.03 + k) * 30;
      const y = ((k * 97 + f * (0.6 + (k % 4) * 0.3)) % 2100) - 100;
      return <circle key={k} cx={x} cy={y} r={4 + (k % 5) * 3} fill="#E9DCC4" opacity={0.5} />;
    })}
    {Array.from({ length: 8 }).map((_, k) => (
      <path key={`f${k}`} d={`M ${-200 + k * 200} ${-200} q 60 900 -40 2300`} stroke="#6E5A42" strokeWidth={10} fill="none" opacity={0.5} />
    ))}
  </g>
);

const DustBunny: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 9 }).map((_, k) => (
      <circle key={k} cx={Math.cos(k * 0.7) * 130} cy={Math.sin(k * 1.3) * 50 - 60} r={70 + (k % 3) * 20} fill={C.dust} stroke={INK} strokeWidth={5} />
    ))}
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

/** Bild 1 (auch im Loop auf Tylers Handy): Sofa, Messlatte, Mann scrollt und schrumpft Stufe für Stufe. */
const HookRoom: React.FC<{ readonly lf: number; readonly end: number }> = ({ lf, end }) => {
  const s = steps(lf, 6, end, 1, 0.45, 5);
  const X = 470;
  const Y = 1360;
  const [hx, hy] = hand(X, Y, s, 150, 1, true);
  const [, topY] = head(X, Y, s, true);
  return (
    <g>
      <LivingRoom />
      <HeightChart x={880} y={1500} h={1100} mark={topY - 110 * s} old={[Y - 520 - 60]} />
      <CouchBack x={470} y={1420} w={820} />
      <Tyler
        x={X}
        y={Y}
        s={s}
        seated
        eyes="wide"
        look={[1, -1]}
        brows={lf > 30 ? "worried" : "neutral"}
        mouth={lf > 40 ? "o" : "flat"}
        open={0.4}
        armR={150}
        bendR={-70}
        armL={40}
        bendL={60}
      />
      <Phone x={hx} y={hy - 50 * s} s={1.4 * s} r={-8} scroll={lf * 0.6} />
      <CouchFront x={470} y={1480} w={820} />
      <ShrinkFx x={X} y={topY - 160 * s} t={stepAt(lf, 6, end, 5)} s={s} />
      <Sweat x={X + 90 * s} y={topY - 40 * s} s={s} o={clamp01((lf - 30) / 10)} />
    </g>
  );
};

export const SHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const inch = W("inch", 0.8);
  const { i, lf, len } = useShot([inch - 4], d, f);
  if (i === 0) {
    return (
      <Shot cam={push(lf, len, 600, 1080, 1.3, 1.42, 540, 860)}>
        <Layer>
          <HookRoom lf={lf} end={len} />
        </Layer>
      </Shot>
    );
  }
  // Winzig auf dem Riesen-Kissen, das Handy größer als er – scrollt trotzdem weiter
  const X = 470;
  const Y = 1360;
  const s = lerp(0.45, 0.16, ease(lf, 0, 10));
  const [, ty] = head(X, Y, s, true);
  return (
    <Shot cam={push(lf, len, 470, 1250, 2.2, 2.45, 540, 820)}>
      <Layer>
        <LivingRoom />
        <CouchBack x={470} y={1420} w={820} />
        <Tyler x={X} y={Y} s={s} seated eyes="wide" look={[1, -1]} brows="up" mouth="scream" open={0.6} armR={160} armL={160} />
        <Phone x={X + 70} y={Y - 160 * 0.45} s={0.9} r={-14 + Math.sin(f * 0.3) * 3} scroll={lf * 0.6} />
        <CouchFront x={470} y={1480} w={820} />
        <Poof x={X} y={ty - 40} t={lf} s={0.5} />
        <ShrinkFx x={X} y={ty - 80} t={lf} s={0.4} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const SRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const scr = W("screen", 0.85);
  const { i, lf, len } = useShot([W("Dating", 0.38) - 2], d, f);
  if (i === 0) {
    // Bus: riesige Sitze, hamstergroße Pendler scrollen; einer springt vergeblich nach dem Halteknopf
    const jump = Math.abs(Math.sin(lf * 0.32)) * 90;
    const people = [
      { x: 180, c: P.pink, h: "bun" as const },
      { x: 400, c: P.lime, h: "side" as const },
      { x: 700, c: P.purple, h: "pony" as const },
      { x: 900, c: P.teal, h: "curly" as const },
    ];
    return (
      <Shot cam={push(lf, len, 540, 1150, 1.3, 1.4)}>
        <Layer depth={0.7}>
          <BusInterior />
        </Layer>
        <Layer>
          <Seat x={250} y={1520} s={2.1} c="#3D6BE0" />
          <Seat x={830} y={1520} s={2.1} c="#3D6BE0" />
          <rect x={530} y={600} width={26} height={900} fill={P.grey} stroke={INK} strokeWidth={6} />
          <rect x={500} y={760} width={86} height={60} rx={14} fill={P.red} stroke={INK} strokeWidth={6} />
          {people.map((p, k) => (
            <g key={k}>
              <Person x={p.x} y={1180} s={0.3} seated shirt={p.c} hair={p.h} hairColor="#3A2618" eyes="half" look={[0, 1]} brows="neutral" mouth="flat" armR={150} bendR={-70} />
              <Phone x={hand(p.x, 1180, 0.3, 150, 1, true)[0]} y={hand(p.x, 1180, 0.3, 150, 1, true)[1] - 14} s={0.42} scroll={f * 0.5 + k} />
            </g>
          ))}
          <Person x={560} y={1500 - jump} s={0.3} shirt={P.orange} hair="spiky" hairColor="#2A1B12" eyes="wide" look={[0, -1]} brows="up" mouth="o" open={0.5} armR={175} armL={20} />
        </Layer>
      </Shot>
    );
  }
  // Dating-App: Größen-Zeile (Lineal) wird durchgestrichen, darunter die Bildschirmzeit (Sanduhr + übervoller Balken)
  const strike = ease(lf, 8, 16);
  const bar = ease(lf, scr - (d - len) - 4, scr - (d - len) + 14);
  return (
    <Shot cam={push(lf, len, 540, 900, 1.0, 1.06)}>
      <Layer depth={0.5}>
        <ReactBg a={C.date} b="#FF9FCB" f={f} />
      </Layer>
      <Layer>
        <Screen x={540} y={900} w={640} h={1080}>
          <rect x={0} y={0} width={640} height={500} fill="#FFD5E8" />
          <Person x={320} y={560} s={0.8} shirt={P.lime} hair="side" hairColor="#5A3320" skin={P.skin2} eyes="half" look={[0, 0]} brows="up" mouth="smug" armL={10} armR={10} />
          {/* Größe: Lineal-Symbol, durchgestrichen */}
          <g transform="translate(110 600)">
            <rect x={-40} y={-30} width={160} height={60} rx={8} fill="#FFF4D6" stroke={INK} strokeWidth={6} />
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <line key={k} x1={-25 + k * 26} x2={-25 + k * 26} y1={-30} y2={k % 2 ? -10 : 0} stroke={INK} strokeWidth={4} />
            ))}
            <rect x={170} y={-12} width={300} height={24} rx={12} fill={P.grey} />
            <line x1={-60} x2={lerp(-60, 500, strike)} y1={0} y2={0} stroke={P.red} strokeWidth={16} strokeLinecap="round" />
          </g>
          {/* Bildschirmzeit: Sanduhr + Balken läuft über */}
          <g transform="translate(110 760)" opacity={ease(lf, 14, 20)}>
            <path d="M -30 -50 L 70 -50 L 20 0 L 70 50 L -30 50 L 20 0 Z" fill="#FFE66B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <rect x={110} y={-26} width={380} height={52} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
            <rect x={110} y={-26} width={lerp(60, 640, bar)} height={52} rx={26} fill={P.red} stroke={INK} strokeWidth={6} />
          </g>
          <g transform={`translate(160 ${960}) scale(${0.8 + 0.4 * bar})`} opacity={bar}>
            <circle r={70} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
            <path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke={P.red} strokeWidth={16} strokeLinecap="round" />
          </g>
        </Screen>
        <Burst x={600} y={1210} r0={90} r1={90 + 120 * bar} n={10} o={bar} color="#FFFFFF" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* grandpa                                                            */
/* ================================================================== */

export const SGrandpa: React.FC = () => {
  const { f, d, W } = useBeats();
  const flipW = W("Flip", 0.55);
  const { i, lf, len } = useShot([W("Grandpa", 0.3) + 4], d, f);
  if (i === 0) {
    // Untersicht Straße: winzige Leute scrollen, ein riesiger Schatten fällt – Opa ragt über die Dächer
    const rise = ease(lf, 4, 22);
    return (
      <Shot cam={push(lf, len, 540, 860, 0.56, 0.6, 540, 820)}>
        <Layer depth={0.8}>
          <Street ground={1650} />
        </Layer>
        <Layer>
          <Grandpa x={560} y={1660 + (1 - rise) * 500} s={3.7} eyes="half" look={[0, 1]} brows="up" mouth="smug" armR={30} armL={20} />
          {[200, 330, 780, 900].map((x, k) => (
            <g key={k}>
              <Person x={x} y={1690} s={0.32} shirt={[P.pink, P.lime, P.teal, P.purple][k]} hair="side" hairColor="#3A2618" eyes={rise > 0.5 ? "wide" : "half"} look={[0, -1]} brows="up" mouth="o" open={0.4} armR={150} bendR={-70} flip={k > 1} />
            </g>
          ))}
        </Layer>
      </Shot>
    );
  }
  // Näher: Opa klappt das Klapphandy zu, nippt aus einer Tasse so groß wie ein Auto; unten Augenrollen
  const snap = ease(f, flipW - 2, flipW + 4);
  const sip = ease(lf, len - 40, len - 22);
  const [hx, hy] = hand(540, 1900, 3.0, lerp(150, 120, sip), 1);
  return (
    <Shot cam={push(lf, len, 540, 1000, 0.75, 0.8)}>
      <Layer depth={0.6}>
        <ReactBg a="#FFC94D" b="#FFE08A" f={f} cx={540} cy={700} />
      </Layer>
      <Layer>
        <Grandpa x={540} y={1900} s={3.0} eyes={sip > 0.5 ? "closed" : "half"} look={[1, 0]} brows="up" mouth={sip > 0.5 ? "pucker" : "smug"} armR={lerp(150, 120, sip)} bendR={-90} armL={150} bendL={-90} />
        <FlipPhone x={hand(540, 1900, 3.0, 150, -1)[0] + 30} y={hand(540, 1900, 3.0, 150, -1)[1] - 160} s={2.6} open={1 - snap} r={-10} />
        <Mug x={hx + 60} y={hy - 40} s={1.6} c={P.teal} steam={1} />
        <Burst x={hand(540, 1900, 3.0, 150, -1)[0] + 30} y={hand(540, 1900, 3.0, 150, -1)[1] - 200} r0={80} r1={80 + 120 * snap * (1 - ease(f, flipW + 4, flipW + 14))} n={10} o={snap} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* tyler                                                              */
/* ================================================================== */

export const STyler: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Interview", 0.4) - 2, W("Will", 0.62) - 2], d, f);
  if (i === 0) {
    // Schlafzimmer: Tyler (orange Hoodie unterm Sakko) an der Messlatte bei „vier Fuß“, richtet die Krawatte, Daumen hoch
    const X = 430;
    const Y = 1500;
    const s = 0.58 * 1.9;
    const [, ty] = head(X, Y, s);
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.0, 1.08)}>
        <Layer depth={0.8}>
          <Bedroom />
        </Layer>
        <Layer>
          <HeightChart x={720} y={1500} h={1200} mark={ty - 108 * s} old={[400, 520]} />
          <Tyler suitUp x={X} y={Y} s={s} eyes="open" look={[1, -0.5]} brows="up" mouth="grin" armR={lerp(20, 150, ease(lf, 8, 16))} armL={160} bendL={-120} />
          <Sparkle x={X + 220} y={ty - 60} t={lf - 14} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Wecker 7 Uhr springt, daneben Kalender-Karte mit Aktentasche und roter Neun-Uhr-Uhr
    const ring = Math.sin(lf * 1.8) * 6;
    return (
      <Shot cam={push(lf, len, 540, 860, 1.0, 1.07)}>
        <Layer depth={0.5}>
          <ReactBg a="#6FD3C9" b="#9BE8DF" f={f} />
        </Layer>
        <Layer>
          <g transform={`translate(320 760) rotate(${ring})`}>
            <circle cx={-170} cy={-260} r={70} fill="#FFE66B" stroke={INK} strokeWidth={8} />
            <circle cx={170} cy={-260} r={70} fill="#FFE66B" stroke={INK} strokeWidth={8} />
            <Clock x={0} y={0} s={0.9} h={Math.PI * 2 * (7 / 12)} m={0} />
          </g>
          <g transform="translate(790 900)">
            <rect x={-200} y={-300} width={400} height={480} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
            <rect x={-200} y={-300} width={400} height={110} rx={30} fill={P.red} stroke={INK} strokeWidth={8} />
            <rect x={-110} y={-80} width={220} height={150} rx={18} fill="#8A5A3C" stroke={INK} strokeWidth={7} />
            <rect x={-50} y={-115} width={100} height={45} rx={12} fill="none" stroke={INK} strokeWidth={9} />
            <Clock x={130} y={140} s={0.28} h={Math.PI * 2 * (9 / 12)} m={0} />
          </g>
          <Burst x={320} y={760} r0={300} r1={360} n={14} o={0.8} color="#FFFFFF" />
        </Layer>
      </Shot>
    );
  }
  // Nachttisch: Handy vibriert und leuchtet, Tyler lugt über die Tischkante, Schweiß
  const buzz = Math.sin(lf * 2.4) * 8;
  return (
    <Shot cam={push(lf, len, 540, 980, 1.0, 1.15, 540, 860)}>
      <Layer depth={0.6}>
        <Bedroom wall="#3A3A7A" />
      </Layer>
      <Layer>
        <rect x={-200} y={1160} width={1500} height={900} fill="#7A4E2E" stroke={INK} strokeWidth={9} />
        <circle cx={600} cy={980} r={340} fill={C.screen} opacity={0.25 + 0.1 * Math.sin(lf * 0.5)} />
        <g transform={`translate(${600 + buzz} 1060) rotate(-80)`}>
          <Phone x={0} y={0} s={2.2} glow={C.screen} />
        </g>
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${600 + sd * 260} 980 q ${sd * 30} 40 0 80 q ${-sd * 30} 40 0 80`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
        ))}
        <Badge x={790} y={930} s={1.4} />
        <Tyler x={180} y={1520} s={1.3} eyes="wide" look={[1, 0]} brows="worried" mouth="flat" armL={160} armR={150} bendR={-60} />
        <Sweat x={300} y={760} s={1.2} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* ex                                                                 */
/* ================================================================== */

export const SEx: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Thirty", 0.4) - 2, W("bro", 0.75) - 2], d, f);
  if (i === 0) {
    // Benachrichtigung „Ex hat gepostet“ (Avatar mit Dutt + gebrochenes Herz), Daumen tippt
    const tap = ease(lf, len - 18, len - 10);
    return (
      <Shot cam={push(lf, len, 540, 900, 1.0, 1.1)}>
        <Layer depth={0.5}>
          <ReactBg a={C.bed} b="#CDBBFF" f={f} />
        </Layer>
        <Layer>
          <Screen x={540} y={980} w={620} h={1000} bg="#26284A">
            <Clock x={310} y={260} s={0.4} h={Math.PI * 2 * (7 / 12)} m={0} />
            <g transform={`translate(310 ${lerp(-120, 560, ease(lf, 2, 12))})`}>
              <NotifIcon x={0} y={0} s={1.05} />
            </g>
          </Screen>
          <g transform={`translate(${lerp(900, 640, ease(lf, 10, len - 14))} ${lerp(1700, 1560, tap)})`}>
            <path d="M -60 0 Q -70 -90 0 -90 Q 70 -90 60 0 L 90 600 L -200 700 Z" fill={P.skin2} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          </g>
          {tap > 0.9 ? <Burst x={600} y={1520} r0={60} r1={140} n={10} color="#FFFFFF" /> : null}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Bett: Tyler scrollt, Uhr rast, er schrumpft stufenweise und versinkt unter der Decke
    const s = steps(lf, 4, len - 4, 1.0, 0.42, 6);
    const X = 420;
    const Y = 1270;
    const [hx, hy] = hand(X, Y, s, 150, 1, true);
    return (
      <Shot cam={push(lf, len, 540, 1050, 1.0, 1.1)}>
        <Layer depth={0.8}>
          <Bedroom />
        </Layer>
        <Layer>
          <Clock x={840} y={520} s={0.42} h={Math.PI * 2 * (7 / 12) + lf * 0.02} m={lf * 0.25} />
          <Bed x={480} y={1400} />
          <Tyler x={X} y={Y} s={s} seated eyes="half" look={[1, 1]} brows="neutral" mouth="drool" open={0.3} armR={150} bendR={-70} armL={20} />
          <Phone x={hx} y={hy - 40 * s} s={1.2 * s} r={-8} scroll={lf * 0.6} />
          <Blanket x={480} y={1400} f={f} />
          <ShrinkFx x={X} y={Y - 560 * s} t={stepAt(lf, 4, len - 4, 6)} s={s} />
        </Layer>
      </Shot>
    );
  }
  // Die echte Katze beschnuppert ihn – gleiche Größe, Nase an Nase
  const sniff = Math.sin(lf * 0.9) * 6;
  return (
    <Shot cam={push(lf, len, 600, 1200, 1.35, 1.45, 540, 820)}>
      <Layer depth={0.8}>
        <Bedroom />
      </Layer>
      <Layer>
        <rect x={-1000} y={1300} width={3000} height={400} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
        <Tyler x={380} y={1340} s={0.42} eyes="half" look={[1, 0]} brows="neutral" mouth="flat" armL={10} armR={10} />
        <Phone x={hand(380, 1340, 0.42, 10, 1)[0]} y={hand(380, 1340, 0.42, 10, 1)[1] + 10} s={0.5} />
        <g transform={`translate(${820 + sniff} 1340)`}>
          <Cat x={0} y={0} f={f} s={-1.05} />
        </g>
        <Sweat x={420} y={1080} s={0.6} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* pigeon                                                             */
/* ================================================================== */

export const SPigeon: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("The", 0.5) - 2], d, f);
  if (i === 0) {
    // Himmel: Tyler (Sakko, Krawatte flattert) reitet eine Taube über die Stadt
    const bob = Math.sin(f * 0.25) * 20;
    return (
      <Shot cam={push(lf, len, 540, 900, 1.0, 1.06)}>
        <Layer depth={0.5}>
          <City f={f} />
        </Layer>
        <Layer>
          <g transform={`translate(${lerp(-60, 60, lf / len)} ${bob})`}>
            <Pigeon x={520} y={1000} s={1.3} f={f} />
            <Tyler suitUp x={470} y={790} s={0.42} seated eyes="wide" look={[1, 0]} brows="up" mouth="grin" armR={110} armL={170} />
            <Tie x={430} y={640} s={0.8} r={-70 + Math.sin(f * 0.8) * 14} />
          </g>
        </Layer>
      </Shot>
    );
  }
  // Nah: die Taube scrollt mit dem Flügel, schaut nicht nach vorn – Laterne kommt, Bumm
  const hit = Math.round(len - 14);
  const bang = ease(lf, hit, hit + 3);
  const bob = Math.sin(f * 0.25) * 14;
  return (
    <Shot cam={push(lf, len, 560, 900, 1.25, 1.36)}>
      <Layer depth={0.4}>
        <City f={f} />
      </Layer>
      <Layer>
        <g transform={`translate(${jolt(lf, hit, 30)} ${bob}) rotate(${bang * -18} 560 900)`}>
          <Pigeon x={480} y={1060} s={1.3} f={f} look="phone" phone flap={1 - bang} />
          <Tyler suitUp x={420} y={850} s={0.42} seated eyes="wide" look={[1, 0]} brows="worried" mouth={lf > hit - 20 ? "scream" : "o"} open={0.6} armR={150} armL={150} />
        </g>
        <g transform={`translate(${lerp(1500, 940, ease(lf, hit - 24, hit))} 0)`}>
          <rect x={-30} y={500} width={60} height={1600} fill="#3A3F52" stroke={INK} strokeWidth={8} />
          <path d="M -30 520 Q -30 420 -160 420 L -200 420" fill="none" stroke="#3A3F52" strokeWidth={40} />
          <circle cx={-210} cy={460} r={60} fill="#FFF07A" stroke={INK} strokeWidth={8} />
        </g>
        {bang > 0.5 ? <Burst x={800} y={860} r0={60} r1={200} n={12} color={P.red} o={1 - ease(lf, hit + 4, hit + 14)} /> : null}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* lobby                                                              */
/* ================================================================== */

export const SLobby: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("The", 0.3) - 2, W("Bro", 0.7) - 2], d, f);
  if (i === 0) {
    // Wanduhr 8:59, roter Zeiger zuckt
    const tick = Math.round(lf / 15) % 2;
    return (
      <Shot cam={push(lf, len, 540, 860, 1.0, 1.12)}>
        <Layer depth={0.5}>
          <ReactBg a={C.lobby} b="#FFE88A" f={f} />
        </Layer>
        <Layer>
          <Clock x={540} y={860} s={1.2} h={Math.PI * 2 * (8.98 / 12)} m={Math.PI * 2 * (59 / 60) + tick * 0.02} />
          <Burst x={540} y={860} r0={380} r1={440} n={16} o={0.7} color={P.red} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Totale: Aufzugknopf hoch oben wie ein Berg, Tyler winzig davor; im Hintergrund schiebt der Hausmeister den Staubsauger (Plant)
    const jx = lerp(-400, 1400, lf / Math.max(1, len));
    return (
      <Shot cam={push(lf, len, 560, 1450, 0.95, 1.0, 540, 1180)}>
        <Layer depth={0.8}>
          <Lobby />
        </Layer>
        <Layer depth={0.9}>
          <g opacity={0.95}>
            <Janitor x={jx} y={1500} s={0.75} eyes="closed" look={[1, 0]} brows="up" mouth="smile" armR={60} armL={40} gest={8} />
            <Vacuum x={jx + 260} y={1500} s={0.5} nx={jx + 120} ny={1500} f={f} />
          </g>
        </Layer>
        <Layer>
          <Elevator x={420} y={1520} s={1.0} />
          <Plant x={140} y={1520} s={0.8} />
          <Tyler suitUp x={860} y={1530} s={0.16} eyes="wide" look={[-1, -1]} brows="worried" mouth="o" open={0.4} armL={10} armR={10} />
          <circle cx={855} cy={1390} r={36} fill="none" stroke={P.red} strokeWidth={6} opacity={0.9} />
        </Layer>
      </Shot>
    );
  }
  // Untersicht Parkour: über den Pflanzenkübel, Sprung, Klatsch auf den Knopf – Knopf leuchtet
  const t = clamp01(lf / Math.max(1, len - 12));
  const path = (u: number) => {
    if (u < 0.35) return [lerp(120, 250, u / 0.35), lerp(1500, 1050, u / 0.35)];
    if (u < 0.7) return [lerp(250, 560, (u - 0.35) / 0.35), 1050 - Math.sin(((u - 0.35) / 0.35) * Math.PI) * 300];
    return [lerp(560, 760, (u - 0.7) / 0.3), lerp(1050, 760, (u - 0.7) / 0.3)];
  };
  const [x, y] = path(t);
  const lit = t >= 1 ? 1 : 0;
  return (
    <Shot cam={push(lf, len, 540, 980, 1.15, 1.25)}>
      <Layer depth={0.8}>
        <Lobby />
      </Layer>
      <Layer>
        <Elevator x={330} y={1620} s={1.3} lit={lit} />
        <Plant x={180} y={1620} s={1.1} />
        <g transform={`rotate(${t < 0.7 && t > 0.35 ? (t - 0.35) * 1000 : 0} ${x} ${y - 100})`}>
          <Tyler suitUp x={x} y={y} s={0.36} eyes="squint" look={[1, -1]} brows="angry" mouth="grin" armR={lit ? 180 : 120} armL={150} />
        </g>
        {lit ? <Sparkle x={900} y={720} t={lf - len + 12} s={1} /> : null}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* interview                                                          */
/* ================================================================== */

export const SInterview: React.FC = () => {
  const { f, d, W } = useBeats();
  const cooked = W("Cooked", 0.85);
  const { i, lf, len } = useShot([W("Tyler", 0.5) - 2, cooked - 3], d, f);
  if (i === 0) {
    // Riesiger Sessel, Tyler katzengroß darauf; die Frage kommt als Sprechblase von der Tischplatte (Quelle nicht im Bild)
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.95, 1.02)}>
        <Layer depth={0.8}>
          <InterviewRoom />
        </Layer>
        <Layer>
          <BigChair x={380} y={1600} s={1.0} />
          <Tyler suitUp x={380} y={1225} s={0.42} seated eyes="open" look={[1, -0.5]} brows="up" mouth="smile" armL={20} armR={20} />
          <rect x={720} y={1180} width={900} height={60} fill={C.desk} stroke={INK} strokeWidth={8} />
          <rect x={760} y={1240} width={60} height={500} fill={C.deskDark} stroke={INK} strokeWidth={7} />
          <Speech x={830} y={900} s={0.95} side={1} o={ease(lf, 2, 8)} lines={2} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: er zieht das Handy, Daumen scrollt, Schweiß
    const pull = ease(lf, 0, 10);
    return (
      <Shot cam={push(lf, len, 540, 860, 1.0, 1.1)}>
        <Layer depth={0.5}>
          <ReactBg a="#A9B8FF" b="#C9D3FF" f={f} />
        </Layer>
        <Layer>
          <Tyler suitUp x={540} y={1750} s={2.0} eyes="half" look={[0, 1]} brows="worried" mouth="flat" armR={lerp(20, 150, pull)} bendR={-70} armL={150} bendL={-70} />
          <Phone x={hand(540, 1750, 2.0, 150, 1)[0] - 140} y={hand(540, 1750, 2.0, 150, 1)[1] + 40} s={2.2 * pull} r={-6} scroll={lf * 0.7} />
          <Sweat x={720} y={720} s={1.3} />
          <Sweat x={350} y={760} s={1.0} />
        </Layer>
      </Shot>
    );
  }
  // Schrumpft auf dem Sessel zum Punkt – Riesen-Sitzfläche, Poof
  const s = lerp(0.42, 0.05, ease(lf, 0, 12));
  return (
    <Shot cam={push(lf, len, 380, 1150, 1.4, 1.6)}>
      <Layer depth={0.8}>
        <InterviewRoom />
      </Layer>
      <Layer>
        <BigChair x={380} y={1600} s={1.0} />
        <Tyler suitUp x={380} y={1225} s={s} seated eyes="wide" look={[0, -1]} brows="up" mouth="scream" open={0.6} armL={170} armR={170} />
        <Poof x={380} y={1180} t={lf} s={0.7} />
        <ShrinkFx x={380} y={1050} t={lf} s={0.6} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

export const STwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const hired = W("Hired", 0.8);
  const { i, lf, len } = useShot([W("The", 0.4) - 2, hired - 2], d, f);
  if (i === 0) {
    // Schreibtisch-Ebene: Tyler zwei Zoll groß zwischen Riesen-Stift und Tasse, schaut sich um
    const look = Math.sin(lf * 0.12);
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.0, 1.06)}>
        <Layer depth={0.5}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#A9B8FF" />
        </Layer>
        <Layer>
          <Desk top={1300} />
          <Mug x={860} y={1380} s={3.2} c={P.red} steam={1} />
          <Pen x={420} y={1500} s={0.8} r={-6} />
          <Tyler suitUp x={420} y={1380} s={1.0} eyes="wide" look={[look, -0.3]} brows="worried" mouth="o" open={0.3} armL={20} armR={20} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Enthüllung: ein ganzes Mini-Büro auf dem Tisch, alle zwei Zoll groß – die Interviewerin winkt
    const pan = ease(lf, 0, 16);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(420, 1100, 540, 900, 1.4)], [16, frameOn(740, 1200, 540, 960, 0.78)], [len, frameOn(740, 1200, 540, 960, 0.82)]])}>
        <Layer depth={0.5}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#A9B8FF" />
        </Layer>
        <Layer>
          <Desk top={1300} />
          <MiniOffice x={760} y={1360} s={0.9} />
          {[560, 860, 1100].map((x, k) => (
            <Person key={k} x={x} y={1400} s={0.5} shirt={[P.lime, P.teal, P.purple][k]} hair={(["pony", "side", "curly"] as const)[k]} hairColor="#3A2618" skin={[P.skin, P.skin3, P.skin2][k]} eyes="open" look={[-1, 0]} brows="up" mouth="smile" armL={10} armR={k === 1 ? 150 : 10} />
          ))}
          <Boss x={1250} y={1400} s={0.55} eyes="open" look={[-1, 0]} brows="up" mouth="grin" armR={lerp(10, 165, pan)} gest={pan > 0.9 ? 14 : 0} armL={10} flip />
          <Tyler suitUp x={220} y={1400} s={0.5} eyes="wide" look={[1, 0]} brows="up" mouth="o" open={0.5} armL={10} armR={10} />
        </Layer>
      </Shot>
    );
  }
  // Mini-Handschlag + Mini-Konfetti
  return (
    <Shot cam={push(lf, len, 540, 1050, 1.3, 1.4)}>
      <Layer depth={0.5}>
        <ReactBg a={C.office} b="#E2FFA8" f={f} />
      </Layer>
      <Layer>
        <Tyler suitUp x={370} y={1400} s={1.0} eyes="closed" look={[1, 0]} brows="up" mouth="grin" armR={100} armL={10} />
        <Boss x={710} y={1400} s={1.0} eyes="closed" look={[-1, 0]} brows="up" mouth="grin" armR={100} armL={10} flip />
        <circle cx={540} cy={1095 + Math.sin(lf * 0.8) * 14} r={30} fill={P.skin} stroke={INK} strokeWidth={6} />
        <Confetti f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* gone                                                               */
/* ================================================================== */

export const SGone: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("No", 0.3) - 2, W("He", 0.45) - 2, W("Oh", 0.85) - 2], d, f);
  if (i === 0) {
    // Untersicht von der Tischplatte: Riesen-Hausmeister kommt durch die Tür (Plant aus der Lobby)
    const walk = ease(lf, 0, len);
    return (
      <Shot cam={push(lf, len, 540, 900, 0.55, 0.6)}>
        <Layer depth={0.7}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.office} />
          <rect x={200} y={-600} width={700} height={2200} fill="#7A4E2E" stroke={INK} strokeWidth={12} />
          <rect x={260} y={-540} width={580} height={2140} fill="#FFF4D6" />
        </Layer>
        <Layer>
          <Janitor x={540} y={2050 + (1 - walk) * 200} s={3.4} eyes="closed" look={[0, 1]} brows="up" mouth="smile" armR={50} armL={30} gest={6} />
          <Desk top={1640} />
          <MiniOffice x={540} y={1660} s={0.7} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: Kopfhörer, wippt zur Musik, kein Handy – leere Hände
    const nod = Math.sin(lf * 0.4) * 8;
    return (
      <Shot cam={push(lf, len, 540, 900, 1.0, 1.08)}>
        <Layer depth={0.5}>
          <ReactBg a={C.janitor} b="#5E95F0" f={f} />
        </Layer>
        <Layer>
          <Janitor x={540} y={1900} s={2.3} nod={nod} eyes="closed" look={[0, 0]} brows="up" mouth="smile" armL={60} armR={60} bendL={-40} bendR={-40} />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${540 + sd * 330} 560 q ${sd * 40} -30 ${sd * 20} -80 M ${540 + sd * 380} 640 q ${sd * 50} -30 ${sd * 30} -90`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(lf * 0.4)} />
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Tisch-Ebene: Staubsaugerdüse senkt sich, die Mini-Belegschaft schreit, alles fliegt hinein
    const down = ease(lf, 0, 14);
    const suck = ease(lf, 14, len - 6);
    return (
      <Shot cam={push(lf, len, 540, 1100, 0.9, 0.96)}>
        <Layer depth={0.5}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.office} />
        </Layer>
        <Layer>
          <Desk top={1400} />
          <MiniOffice x={560} y={1460} s={0.8} suck={suck} />
          {[260, 520, 800].map((x, k) => (
            <g key={k} transform={`translate(${lerp(x, 560, suck)} ${-suck * 700}) rotate(${suck * 300 * (k - 1)} ${x} 1300)`} opacity={1 - clamp01((suck - 0.7) / 0.3)}>
              <Person x={x} y={1480} s={0.42} shirt={[P.lime, P.teal, P.purple][k]} hair={(["pony", "side", "curly"] as const)[k]} hairColor="#3A2618" eyes="wide" look={[0, -1]} brows="up" mouth="scream" open={0.7} armL={170} armR={170} />
            </g>
          ))}
          <Vacuum x={1400} y={300} s={0.01} nx={560} ny={lerp(200, 880, down)} on={down} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Leerer Tisch, eine winzige Krawatte trudelt herab
  return (
    <Shot cam={push(lf, len, 540, 1100, 1.0, 1.06)}>
      <Layer depth={0.5}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.office} />
      </Layer>
      <Layer>
        <Desk top={1400} />
        <Tie x={540 + Math.sin(lf * 0.3) * 120} y={lerp(300, 1350, ease(lf, 0, len, "linear"))} s={1.1} r={lf * 18} />
        <ellipse cx={540} cy={1420} rx={180} ry={24} fill="#000000" opacity={0.12} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const SOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("watching", 0.45) - 2], d, f);
  if (i === 0) {
    // Im Staubsaugerbeutel: Staubflocken-Galaxie, Mini-Belegschaft sitzt auf Wollmäusen und scrollt; Tyler winkt „alles gut“
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.0, 1.08)}>
        <Layer depth={0.6}>
          <BagInside f={f} />
        </Layer>
        <Layer>
          <DustBunny x={260} y={1200} s={1.2} />
          <DustBunny x={820} y={1320} s={1.0} />
          <DustBunny x={540} y={800} s={0.8} />
          <Person x={820} y={1220} s={0.6} seated shirt={P.teal} hair="side" hairColor="#3A2618" skin={P.skin3} eyes="half" look={[0, 1]} brows="neutral" mouth="flat" armR={150} bendR={-70} />
          <Phone x={hand(820, 1220, 0.6, 150, 1, true)[0]} y={hand(820, 1220, 0.6, 150, 1, true)[1] - 20} s={0.7} scroll={f * 0.5} />
          <Person x={540} y={720} s={0.45} seated shirt={P.purple} hair="curly" hairColor="#3A2618" skin={P.skin2} eyes="half" look={[0, 1]} brows="neutral" mouth="flat" armR={150} bendR={-70} />
          <Tyler suitUp x={260} y={1090} s={0.75} seated eyes="half" look={[1, 0]} brows="up" mouth="smug" armR={lerp(20, 165, ease(lf, 4, 12))} armL={150} bendL={-70} />
          <Phone x={hand(260, 1090, 0.75, 150, -1, true)[0]} y={hand(260, 1090, 0.75, 150, -1, true)[1] - 20} s={0.8} scroll={f * 0.5} />
        </Layer>
      </Shot>
    );
  }
  // Nah auf Tylers Mini-Handy: darauf läuft Bild 1 dieses Videos – Kamera fährt hinein, bis es das Bild füllt (Loop)
  const zin = ease(lf, 6, len, "inOut");
  const sc = lerp(0.42, 1.0, zin);
  const W0 = 1080 * sc;
  const H0 = 1920 * sc;
  return (
    <Shot cam={frameOn(540, 960, 540, 960, 1)}>
      <Layer>
        <BagInside f={f} />
        <g transform={`translate(${540 - W0 / 2} ${900 - H0 / 2})`}>
          <rect x={-40 * sc} y={-50 * sc} width={W0 + 80 * sc} height={H0 + 100 * sc} rx={110 * sc} fill={INK} opacity={1 - zin * 0.9} />
          <svg x={0} y={0} width={W0} height={H0} viewBox="0 0 1080 1920" preserveAspectRatio="none">
            <g transform={`translate(${540 - 560 * 1.12} ${900 - 1050 * 1.12}) scale(1.12)`}>
              <HookRoom lf={Math.min(lf, 4)} end={90} />
            </g>
          </svg>
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const SCROLL_SCENES: Record<string, React.FC> = {
  hook: SHook,
  rules: SRules,
  grandpa: SGrandpa,
  tyler: STyler,
  ex: SEx,
  pigeon: SPigeon,
  lobby: SLobby,
  interview: SInterview,
  twist: STwist,
  gone: SGone,
  outro: SOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(SCROLL_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Handy-Inhalte sind Symbole. */
export const SCROLL_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene: Wohnzimmer ×2 | Bus, Dating-App | Straße, Opa nah | Schlafzimmer, Wecker, Nachttisch |
 * Handy, Bett, Katze | Himmel ×2 | Uhr, Lobby, Parkour | Sessel, Handy nah, Sessel | Tisch, Mini-Büro, Handschlag |
 * Tür, Kopfhörer, Düse, leerer Tisch | Beutel, Handy-Loop → nie > 2 gleiche am Stück. */
export const SCROLL_SHOT_COUNT: Record<string, number> = {
  hook: 2,
  rules: 2,
  grandpa: 2,
  tyler: 3,
  ex: 3,
  pigeon: 2,
  lobby: 3,
  interview: 3,
  twist: 3,
  gone: 4,
  outro: 2,
};
