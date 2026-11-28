import React from "react";
import { camPath, clamp01, ease, frameOn, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/hangout-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, CROWD, INK, Mug, P, Person, Street, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";
import { ReactBg } from "./suche";
import { Bed, Door, Room } from "./akku";
import { CouchBack, CouchFront, Poof, Sparkle } from "./todo";
import { Clock, Confetti } from "./meckern";

/**
 * „In This City, 'We Should Hang Out Sometime' Is Legally Binding“ (episodes/hangout-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Konsequenz = Bürokratie/Vertragszwang: Riesen-Stempel, rotes Siegel (Handschlag-Symbol, keine Schrift), Handschellen-Kette.
 * Eine Text-Ebene (Untertitel); Requisiten sind Symbole. Schnitte an Wort-Beats.
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

/** Beschleunigt (Fallen). */
const eIn = (f: number, a: number, b: number) => {
  const t = ease(f, a, b, "linear");
  return t * t;
};

/** Kamera-Rütteln nach einem Einschlag (t = Frames seit dem Treffer). */
const shake = (t: number, amp = 26) => (t >= 0 && t < 12 ? Math.sin(t * 2.3) * amp * (1 - t / 12) : 0);

const C = {
  hoodie: "#2FCB6B",
  hair: "#1B1530",
  clerk: "#7D8597",
  clerkDark: "#59606F",
  seal: "#E0303F",
  paper: "#FFF6DC",
  wood: "#9A6534",
  woodDark: "#6E4320",
  court: "#3E5BD8",
  park: "#7ED957",
  night: "#2B2A6B",
  cafe: "#FFB35C",
  gym: "#FF5D8F",
  stage: "#6B2BD9",
  party: "#13C2C2",
  flat: "#FFD84D",
  inmate: "#FF8A1F",
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Marcus: React.FC<Fig> = (p) => <Person pants="#2B3A67" {...p} shirt={C.hoodie} hair="curly" hairColor={C.hair} skin={P.skin3} />;
const Clerk: React.FC<Fig> = (p) => <Person pants={C.clerkDark} suit stache glasses {...p} shirt={C.clerk} hair="side" hairColor="#3A3A3A" skin={P.skin} />;
const Dentist: React.FC<Fig> = (p) => <Person pants="#9FB8FF" glasses {...p} shirt="#FFFFFF" hair="none" hairColor="#000" skin={P.skin2} />;
const GymGuy: React.FC<Fig> = (p) => <Person pants="#22205A" {...p} shirt={P.red} hair="spiky" hairColor="#E8B23A" skin={P.skin} />;
const Ex: React.FC<Fig> = (p) => <Person pants="#3B2A66" {...p} shirt={P.purple} hair="pony" hairColor="#5A2A18" skin={P.skin2} />;
const Lawyer: React.FC<Fig> = (p) => <Person pants="#1F2433" suit {...p} shirt="#1F2433" hair="bun" hairColor="#1B1210" skin={P.skin} />;

/** Handposition (gerader Arm) – Ursprung Füße wie Person. */
const hand = (x: number, y: number, s: number, deg: number, side: 1 | -1, seated = false) => {
  const sh = (seated ? -250 : -330) + 40;
  const a = (deg * Math.PI) / 180;
  return [x + side * (78 + Math.sin(a) * 130) * s, y + (sh + Math.cos(a) * 130) * s] as const;
};
const head = (x: number, y: number, s: number, seated = false) => [x, y + ((seated ? -250 : -330) - 86) * s] as const;

/* ------------------------------------------------------------------ */
/* Requisiten                                                         */
/* ------------------------------------------------------------------ */

/** Riesen-Stempel; (x, y) = Mitte der Stempelfläche unten. */
const Stamp: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly ink?: string }> = ({ x, y, s = 1, r = 0, ink = C.seal }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-150} y={-70} width={300} height={70} rx={10} fill={ink} stroke={INK} strokeWidth={10} />
    <rect x={-170} y={-130} width={340} height={70} rx={14} fill={C.woodDark} stroke={INK} strokeWidth={10} />
    <rect x={-40} y={-300} width={80} height={180} fill={C.wood} stroke={INK} strokeWidth={10} />
    <circle cx={0} cy={-330} r={78} fill={C.seal} stroke={INK} strokeWidth={10} />
    <circle cx={-24} cy={-354} r={20} fill="#FFFFFF" opacity={0.5} />
  </g>
);

/** Siegel mit Handschlag-Symbol (keine Schrift). ok = grünes Häkchen statt Handschlag. */
const Seal: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number; readonly ok?: boolean }> = ({ x, y, s = 1, o = 1, ok }) => {
  const c = ok ? "#22B14C" : C.seal;
  const pts = Array.from({ length: 24 })
    .map((_, k) => {
      const a = (k / 24) * Math.PI * 2;
      const rr = k % 2 ? 150 : 168;
      return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
    })
    .join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-12)`} opacity={o}>
      <polygon points={pts} fill="none" stroke={c} strokeWidth={14} strokeLinejoin="round" />
      <circle r={118} fill="none" stroke={c} strokeWidth={10} />
      {ok ? (
        <path d="M -60 0 L -15 48 L 70 -50" fill="none" stroke={c} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g fill={c}>
          <rect x={-86} y={-22} width={90} height={44} rx={22} transform="rotate(-18)" />
          <rect x={-4} y={-22} width={90} height={44} rx={22} transform="rotate(18)" />
          <circle cx={-6} cy={2} r={30} />
        </g>
      )}
    </g>
  );
};

/** Handschelle (Ring) an einem Handgelenk. */
const Cuff: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={30} fill="none" stroke="#5E6472" strokeWidth={22} />
    <circle r={30} fill="none" stroke="#C9D0DE" strokeWidth={10} />
  </g>
);

/** Kette zwischen zwei Handgelenken (durchhängend), Handschellen an beiden Enden. */
const Chain: React.FC<{ readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number; readonly s?: number; readonly sag?: number; readonly o?: number }> = ({
  x1,
  y1,
  x2,
  y2,
  s = 1,
  sag = 80,
  o = 1,
}) => {
  const n = Math.max(4, Math.round(Math.hypot(x2 - x1, y2 - y1) / (34 * s)));
  const pts = Array.from({ length: n + 1 }).map((_, k) => {
    const t = k / n;
    return [lerp(x1, x2, t), lerp(y1, y2, t) + Math.sin(t * Math.PI) * sag * s] as const;
  });
  return (
    <g opacity={o}>
      {pts.slice(0, -1).map(([px, py], k) => {
        const [qx, qy] = pts[k + 1];
        const ang = (Math.atan2(qy - py, qx - px) * 180) / Math.PI;
        return (
          <ellipse
            key={k}
            cx={(px + qx) / 2}
            cy={(py + qy) / 2}
            rx={22 * s}
            ry={k % 2 ? 6 * s : 12 * s}
            fill="none"
            stroke={k % 2 ? "#5E6472" : "#C9D0DE"}
            strokeWidth={8 * s}
            transform={`rotate(${ang} ${(px + qx) / 2} ${(py + qy) / 2})`}
          />
        );
      })}
      <Cuff x={x1} y={y1} s={s} />
      <Cuff x={x2} y={y2} s={s} />
    </g>
  );
};

/** Sprechblase mit Kalender-Symbol (Verabredung, ohne Schrift). */
const PlanBubble: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number; readonly side?: 1 | -1 }> = ({ x, y, s = 1, o = 1, side = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * side} ${s})`} opacity={o}>
    <path d="M -150 -120 h 300 a 40 40 0 0 1 40 40 v 160 a 40 40 0 0 1 -40 40 h -190 l -70 60 l 10 -60 h -50 a 40 40 0 0 1 -40 -40 v -160 a 40 40 0 0 1 40 -40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <g transform={`scale(${side} 1)`}>
      <rect x={-80} y={-80} width={160} height={150} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
      <rect x={-80} y={-80} width={160} height={42} rx={14} fill={C.seal} stroke={INK} strokeWidth={9} />
      <line x1={-40} x2={-40} y1={-100} y2={-60} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <line x1={40} x2={40} y1={-100} y2={-60} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-56 + c * 42} y={-22 + r * 30} width={26} height={18} rx={4} fill={r === 1 && c === 1 ? C.seal : P.grey} />))}
      <text x={110} y={10} fontSize={90} fontWeight={900} fill={INK} fontFamily="Arial">
        ?
      </text>
    </g>
  </g>
);

/** Vertrag/Papier mit Kritzel-Zeilen. */
const Paper: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly h?: number; readonly s?: number; readonly r?: number; readonly lines?: number }> = ({ x, y, w = 420, h = 540, s = 1, r = 0, lines = 7 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={C.paper} stroke={INK} strokeWidth={10} />
    {Array.from({ length: lines }).map((_, k) => (
      <path
        key={k}
        d={`M ${-w / 2 + 40} ${-h / 2 + 60 + k * ((h - 120) / Math.max(1, lines - 1))} q 40 -14 80 0 t 80 0 t 80 0 ${k % 3 === 2 ? "" : "t 60 0"}`}
        fill="none"
        stroke="#B9A88E"
        strokeWidth={10}
        strokeLinecap="round"
      />
    ))}
  </g>
);

/** Strichliste (Zählen ohne Ziffern). n Striche, Fünferbündel. */
const Tally: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly s?: number }> = ({ x, y, n, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: Math.ceil(n / 5) }).map((_, g) => {
      const k = Math.min(5, n - g * 5);
      const gx = (g % 4) * 120;
      const gy = Math.floor(g / 4) * 130;
      return (
        <g key={g} transform={`translate(${gx} ${gy})`}>
          {Array.from({ length: Math.min(4, k) }).map((__, j) => (
            <line key={j} x1={j * 20} x2={j * 20} y1={0} y2={90} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          ))}
          {k === 5 ? <line x1={-14} x2={76} y1={70} y2={18} stroke={C.seal} strokeWidth={10} strokeLinecap="round" /> : null}
        </g>
      );
    })}
  </g>
);

const Gavel: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-14} y={-10} width={28} height={200} rx={10} fill={C.wood} stroke={INK} strokeWidth={8} />
    <rect x={-80} y={-70} width={160} height={70} rx={18} fill={C.woodDark} stroke={INK} strokeWidth={8} />
  </g>
);

const Bars: React.FC<{ readonly x0?: number; readonly x1?: number; readonly y0?: number; readonly y1?: number }> = ({ x0 = -200, x1 = 1300, y0 = -300, y1 = 2300 }) => (
  <g>
    {Array.from({ length: Math.ceil((x1 - x0) / 170) }).map((_, k) => (
      <rect key={k} x={x0 + k * 170} y={y0} width={34} height={y1 - y0} fill="#6B7280" stroke={INK} strokeWidth={8} />
    ))}
    <rect x={x0} y={y0 + 200} width={x1 - x0} height={34} fill="#6B7280" stroke={INK} strokeWidth={8} />
  </g>
);

const Pancakes: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={130} ry={30} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    {[0, 1, 2, 3].map((k) => (
      <ellipse key={k} cx={0} cy={-k * 26} rx={95} ry={24} fill="#F2B35A" stroke={INK} strokeWidth={7} />
    ))}
    <rect x={-20} y={-112} width={40} height={24} rx={6} fill="#FFF1A8" stroke={INK} strokeWidth={6} />
    <path d="M -60 -84 q 20 30 0 60" fill="none" stroke="#8A4B12" strokeWidth={12} strokeLinecap="round" />
  </g>
);

const Mimosa: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 -160 L 30 -160 L 20 -40 L -20 -40 Z" fill="#FFB52E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <line x1={0} x2={0} y1={-40} y2={0} stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={0} rx={34} ry={8} fill={INK} />
  </g>
);

const Table: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly c?: string }> = ({ x, y, w = 900, c = "#FFFFFF" }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={40} rx={10} fill={c} stroke={INK} strokeWidth={9} />
    <rect x={x - w / 2 + 60} y={y + 40} width={28} height={300} fill={C.woodDark} stroke={INK} strokeWidth={7} />
    <rect x={x + w / 2 - 88} y={y + 40} width={28} height={300} fill={C.woodDark} stroke={INK} strokeWidth={7} />
  </g>
);

const Bench: React.FC<{ readonly x: number; readonly y: number; readonly w?: number }> = ({ x, y, w = 820 }) => (
  <g>
    {[0, 1].map((k) => (
      <rect key={k} x={x - w / 2} y={y - 260 + k * 70} width={w} height={50} rx={12} fill="#C26B2E" stroke={INK} strokeWidth={9} />
    ))}
    <rect x={x - w / 2} y={y - 40} width={w} height={44} rx={10} fill="#C26B2E" stroke={INK} strokeWidth={9} />
    <rect x={x - w / 2 + 50} y={y} width={30} height={160} fill={INK} />
    <rect x={x + w / 2 - 80} y={y} width={30} height={160} fill={INK} />
  </g>
);

const Tree: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly c?: string }> = ({ x, y, s = 1, c = "#3FB24B" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-300} width={60} height={300} fill="#8A5A2B" stroke={INK} strokeWidth={8} />
    <circle cx={0} cy={-380} r={170} fill={c} stroke={INK} strokeWidth={9} />
    <circle cx={-110} cy={-300} r={100} fill={c} stroke={INK} strokeWidth={9} />
    <circle cx={110} cy={-300} r={100} fill={c} stroke={INK} strokeWidth={9} />
  </g>
);

const Battery: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lvl: number; readonly blink?: boolean; readonly f: number }> = ({ x, y, s = 1, lvl, blink, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={blink && Math.floor(f / 5) % 2 ? 0.35 : 1}>
    <rect x={-60} y={-34} width={110} height={68} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <rect x={50} y={-14} width={16} height={28} rx={4} fill={INK} />
    <rect x={-50} y={-24} width={90 * clamp01(lvl)} height={48} rx={6} fill={lvl < 0.25 ? C.seal : "#22B14C"} />
  </g>
);

const Smoke: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly s?: number; readonly o?: number }> = ({ x, y, f, s = 1, o = 1 }) => (
  <g opacity={o}>
    {[0, 1, 2, 3].map((k) => {
      const t = ((f + k * 9) % 36) / 36;
      return <circle key={k} cx={x + Math.sin((f + k * 20) * 0.15) * 30 * s} cy={y - t * 260 * s} r={(30 + t * 60) * s} fill="#6B6B7A" opacity={0.7 * (1 - t)} />;
    })}
  </g>
);

const Bulb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly on: number }> = ({ x, y, s = 1, on }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * on)})`}>
    <Burst x={0} y={-20} r0={110} r1={110 + 70 * on} n={10} o={on} color="#FFE14D" />
    <circle cx={0} cy={-30} r={80} fill={on > 0.5 ? "#FFE14D" : "#FFFFFF"} stroke={INK} strokeWidth={9} />
    <rect x={-34} y={40} width={68} height={50} rx={8} fill={P.grey} stroke={INK} strokeWidth={8} />
  </g>
);

const DiscoBall: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} x2={0} y1={-400} y2={-110} stroke={INK} strokeWidth={8} />
    <circle r={110} fill="#C9D0DE" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 16 }).map((_, k) => (
      <rect key={k} x={-90 + (k % 4) * 45} y={-90 + Math.floor(k / 4) * 45} width={36} height={36} fill={(k + Math.floor(f / 4)) % 3 ? "#FFFFFF" : "#7FD6FF"} opacity={0.8} />
    ))}
  </g>
);

const Mic: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-14} y={0} width={28} height={110} rx={10} fill={INK} />
    <circle cx={0} cy={-10} r={34} fill="#9AA3B5" stroke={INK} strokeWidth={8} />
  </g>
);

const Briefcase: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-80} width={60} height={30} rx={10} fill="none" stroke={INK} strokeWidth={10} />
    <rect x={-90} y={-56} width={180} height={120} rx={14} fill="#6E4320" stroke={INK} strokeWidth={9} />
    <rect x={-14} y={-10} width={28} height={20} fill="#FFD84D" stroke={INK} strokeWidth={5} />
  </g>
);

const Clipboard: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly ticks?: number; readonly r?: number }> = ({ x, y, s = 1, ticks = 0, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-90} y={-120} width={180} height={240} rx={12} fill={C.woodDark} stroke={INK} strokeWidth={8} />
    <rect x={-70} y={-96} width={140} height={200} fill="#FFFFFF" />
    <rect x={-36} y={-134} width={72} height={30} rx={8} fill={P.grey} stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3].map((k) => (
      <g key={k}>
        <rect x={-56} y={-76 + k * 44} width={24} height={24} fill="none" stroke={INK} strokeWidth={5} />
        <rect x={-20} y={-70 + k * 44} width={80} height={10} rx={5} fill={P.grey} />
        {k < ticks ? <path d={`M -54 ${-66 + k * 44} l 10 12 l 20 -26`} fill="none" stroke="#22B14C" strokeWidth={8} strokeLinecap="round" /> : null}
      </g>
    ))}
  </g>
);

const Barbell: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-420} y={-10} width={840} height={20} rx={8} fill="#9AA3B5" stroke={INK} strokeWidth={6} />
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <rect x={sd * 330 - 30} y={-110} width={60} height={220} rx={12} fill={INK} />
        <rect x={sd * 390 - 22} y={-80} width={44} height={160} rx={10} fill="#2F3545" stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);

const Chips: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-50, -10, 30, 60].map((cx, k) => (
      <ellipse key={k} cx={cx} cy={-30 - (k % 2) * 16} rx={34} ry={20} fill="#FFD25A" stroke={INK} strokeWidth={5} />
    ))}
    <path d="M -110 -20 L 110 -20 L 80 50 L -80 50 Z" fill={P.red} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </g>
);

/** Miet-Rechnung: Papier mit Münz-Symbol + rotem Pfeil nach oben. */
const Bill: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <Paper x={0} y={0} w={260} h={340} lines={3} />
    <circle cx={0} cy={60} r={56} fill="#FFD84D" stroke={INK} strokeWidth={8} />
    <circle cx={0} cy={60} r={34} fill="none" stroke="#C99A00" strokeWidth={6} />
    <path d="M 80 -10 l 0 -70 m -24 24 l 24 -24 l 24 24" fill="none" stroke={C.seal} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Tears: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly s?: number }> = ({ x, y, f, s = 1 }) => (
  <g>
    {[-1, 1].map((sd) =>
      [0, 1].map((k) => {
        const t = ((f + k * 8) % 16) / 16;
        return <ellipse key={`${sd}${k}`} cx={x + sd * (48 + t * 70) * s} cy={y + t * 120 * s} rx={12 * s} ry={18 * s} fill="#7FD6FF" stroke={INK} strokeWidth={3 * s} opacity={1 - t} />;
      }),
    )}
  </g>
);

/** Riss/Loch in der Decke mit Brocken (t = Frames seit dem Durchbruch). */
const CeilingBreak: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number; readonly crack?: number }> = ({ x, y, t, s = 1, crack = 1 }) => {
  const k = clamp01(t / 10);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -260 0 L -120 ${40 * crack} L -40 ${-10 * crack} L 60 ${50 * crack} L 160 ${5 * crack} L 260 0`} fill="none" stroke={INK} strokeWidth={10} strokeLinejoin="round" opacity={crack} />
      {t >= 0 ? <ellipse cx={0} cy={0} rx={300 * k} ry={70 * k} fill="#2A2230" /> : null}
      {t >= 0
        ? [-200, -90, 30, 140, 230].map((bx, j) => (
            <rect key={j} x={bx * (0.6 + k)} y={t * t * 2.2 + j * 30} width={70} height={50} rx={8} fill="#E6DCC8" stroke={INK} strokeWidth={6} transform={`rotate(${t * 14 * (j % 2 ? 1 : -1)} ${bx} ${t * t * 2.2})`} opacity={1 - clamp01((t - 20) / 10)} />
          ))
        : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Bildwelten                                                         */
/* ------------------------------------------------------------------ */

const Courtroom: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.court} />
    {[-300, 100, 500, 900, 1300].map((x) => (
      <rect key={x} x={x} y={-400} width={90} height={1900} fill="#2F47B8" />
    ))}
    <rect x={-2000} y={1500} width={5000} height={1000} fill="#7A4E2E" />
    <circle cx={540} cy={250} r={150} fill="#FFD84D" stroke={INK} strokeWidth={10} />
    <Seal x={540} y={250} s={0.7} />
  </g>
);

const Park: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3400} fill="#8ED8FF" />
    <rect x={-2000} y={1400} width={5000} height={1200} fill={C.park} />
    <Tree x={-60} y={1420} s={1.3} />
    <Tree x={1140} y={1420} s={1.1} c="#2E9E4A" />
  </g>
);

const Cafe: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.cafe} />
    <rect x={120} y={260} width={840} height={520} rx={30} fill="#FFE4B8" stroke={INK} strokeWidth={10} />
    <path d="M 120 520 L 960 520" stroke={INK} strokeWidth={8} />
    {[260, 540, 820].map((x) => (
      <g key={x}>
        <line x1={x} x2={x} y1={-200} y2={120} stroke={INK} strokeWidth={6} />
        <path d={`M ${x - 70} 200 L ${x + 70} 200 L ${x + 40} 120 L ${x - 40} 120 Z`} fill="#FF5D5D" stroke={INK} strokeWidth={7} />
      </g>
    ))}
    <rect x={-2000} y={1560} width={5000} height={1000} fill="#B5651D" />
  </g>
);

const Gym: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.gym} />
    <rect x={-100} y={200} width={1280} height={700} fill="#FFB3CB" stroke={INK} strokeWidth={10} />
    {[100, 400, 700, 1000].map((x) => (
      <line key={x} x1={x} x2={x} y1={200} y2={900} stroke={INK} strokeWidth={6} opacity={0.4} />
    ))}
    <rect x={-2000} y={1560} width={5000} height={1000} fill="#33384A" />
  </g>
);

const Stage: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.stage} />
    {[-1, 1].map((sd) => (
      <path key={sd} d={`M ${540 + sd * 640} -300 L ${540 + sd * 120} 1560 L ${540 + sd * 520} 1560 Z`} fill="#FFFFFF" opacity={0.12 + 0.06 * Math.sin(f * 0.3 + sd)} />
    ))}
    <rect x={-2000} y={1560} width={5000} height={1000} fill="#2A1460" />
    <rect x={-2000} y={1540} width={5000} height={40} fill="#FFD84D" />
  </g>
);

const PartyRoom: React.FC<{ readonly f: number; readonly gray?: number }> = ({ f, gray = 0 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.party} />
    {Array.from({ length: 8 }).map((_, k) => (
      <circle key={k} cx={(k * 173 + f * 6) % 1400 - 160} cy={200 + ((k * 97) % 600)} r={60} fill={["#FFD84D", "#FF5D8F", "#9A6BFF", "#FFFFFF"][k % 4]} opacity={0.35 * (1 - gray)} />
    ))}
    <rect x={-2000} y={1560} width={5000} height={1000} fill="#0E7F86" />
  </g>
);

/* ================================================================== */
/* Bild 1 (Hook, Cover, Loop-Ziel)                                    */
/* ================================================================== */

/** Zwei verabschieden sich, Sprechblase mit Kalender → Beamter fällt mit Stempel von oben, Knall, Kette. */
const HookStreet: React.FC<{ readonly lf: number; readonly f: number }> = ({ lf, f }) => {
  const land = 14;
  const fall = eIn(lf, 2, land);
  const hit = lf - land;
  const chained = hit >= 1;
  const AX = 210;
  const BX = 870;
  const Y = 1450;
  const s = 1.05;
  const pull = chained ? ease(hit, 1, 8) : 0;
  const armA = chained ? lerp(40, 70, pull) : 120 + Math.sin(lf * 0.9) * 25;
  const armB = chained ? lerp(40, 70, pull) : 120 + Math.sin(lf * 0.9 + 1) * 25;
  const [ax, ay] = hand(AX, Y, s, armA, 1);
  const [bx, by] = hand(BX, Y, s, armB, -1);
  const CY = lerp(-700, Y, fall);
  return (
    <g>
      <Street ground={Y} />
      <Person x={AX} y={Y} s={s} shirt={P.lime} hair="spiky" hairColor="#2A1B12" skin={P.skin2} eyes={chained ? "wide" : "open"} look={[1, chained ? 1 : 0]} brows={chained ? "up" : "neutral"} mouth={chained ? "o" : "talk"} open={chained ? 0.6 : 0.3 + 0.3 * Math.abs(Math.sin(lf * 0.7))} armR={armA} armL={10} lean={chained ? 4 : 0} />
      <Person x={BX} y={Y} s={s} shirt={P.pink} hair="side" hairColor="#5A3320" skin={P.skin} eyes={chained ? "wide" : "half"} look={[-1, chained ? 1 : 0]} brows={chained ? "up" : "neutral"} mouth={chained ? "scream" : "smile"} open={0.5} armL={armB} armR={10} lean={chained ? -4 : 0} />
      <PlanBubble x={AX + 200} y={Y - 760} s={0.8 * ease(lf, 0, 4)} o={chained ? 1 - clamp01(hit / 6) : 1} />
      <Clerk x={540} y={CY} s={0.9} eyes="half" look={[0, 1]} brows="angry" mouth="flat" armL={160} armR={160} bendL={-30} bendR={-30} />
      <Stamp x={540} y={chained ? Y - 6 : CY - 620} s={0.75} r={0} />
      {chained ? <Seal x={540} y={Y - 30} s={0.5 * (0.6 + 0.4 * ease(hit, 0, 4))} /> : null}
      {chained ? <Chain x1={ax} y1={ay} x2={bx} y2={by} s={1} sag={lerp(60, 10, pull)} /> : null}
      <Burst x={540} y={Y - 40} r0={160} r1={160 + 200 * clamp01(hit / 6)} n={14} o={hit >= 0 && hit < 10 ? 1 - hit / 10 : 0} color={INK} />
      <Poof x={540} y={Y - 40} t={hit} s={1.1} />
      <Sweat x={AX + 70} y={Y - 520} o={chained ? clamp01(hit / 6) : 0} />
      <Sweat x={BX - 70} y={Y - 520} o={chained ? clamp01(hit / 6) : 0} />
      <g opacity={0}>{f}</g>
    </g>
  );
};

export const HHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("legally", 0.7) - 2], d, f);
  if (i === 0) {
    const sh = shake(lf - 14);
    return (
      <Shot cam={push(lf, len, 540 + sh, 1050, 0.95, 1.05, 540, 900)}>
        <Layer>
          <HookStreet lf={lf} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Kette zwischen zwei Handgelenken, darunter das rote Siegel – beide starren (offene Münder, Schweiß)
  return (
    <Shot cam={push(lf, len, 540, 1000, 1.0, 1.08)}>
      <Layer depth={0.5}>
        <ReactBg a="#FFD84D" b="#FFB52E" f={f} />
      </Layer>
      <Layer>
        <Paper x={540} y={1250} w={760} h={560} r={-4} lines={5} />
        <Seal x={700} y={1330} s={0.9 + 0.05 * Math.sin(lf * 0.5)} />
        <Person x={160} y={1250} s={1.25} shirt={P.lime} hair="spiky" hairColor="#2A1B12" skin={P.skin2} eyes="wide" look={[1, 1]} brows="up" mouth="o" open={0.6} armR={95} armL={10} />
        <Person x={920} y={1250} s={1.25} shirt={P.pink} hair="side" hairColor="#5A3320" skin={P.skin} eyes="wide" look={[-1, 1]} brows="worried" mouth="scream" open={0.4} armL={95} armR={10} />
        <Chain x1={hand(160, 1250, 1.25, 95, 1)[0]} y1={hand(160, 1250, 1.25, 95, 1)[1]} x2={hand(920, 1250, 1.25, 95, -1)[0]} y2={hand(920, 1250, 1.25, 95, -1)[1]} s={1.3} sag={70 + Math.sin(lf * 0.4) * 10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const HRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Of", 0.75) - 2], d, f);
  if (i === 0) {
    // Gericht: Richter schlägt den Hammer, Angeklagter schwitzt vor dem Pult
    const bang = Math.max(0, Math.sin(lf * 0.45));
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.95, 1.05)}>
        <Layer depth={0.6}>
          <Courtroom />
        </Layer>
        <Layer>
          <Person x={540} y={1050} s={1.0} shirt="#1B1530" pants="#1B1530" hair="none" hairColor="#EDEDED" skin={P.skin} glasses wrinkles={0.5} eyes="squint" look={[0, 1]} brows="angry" mouth="talk" open={0.4} armR={100 + bang * 50} armL={30} />
          <rect x={120} y={900} width={840} height={360} rx={16} fill={C.wood} stroke={INK} strokeWidth={10} />
          <Seal x={540} y={1080} s={0.6} />
          <Gavel x={hand(540, 1050, 1, 100 + bang * 50, 1)[0]} y={hand(540, 1050, 1, 100 + bang * 50, 1)[1]} s={0.9} r={-40 + bang * 60} />
          <Burst x={760} y={900} r0={40} r1={120} n={8} o={bang > 0.9 ? 1 : 0} />
          <Person x={540} y={1760} s={1.1} shirt={P.orange} hair="curly" hairColor="#2A1B12" skin={P.skin2} eyes="wide" look={[0, -1]} brows="worried" mouth="frown" armL={20} armR={20} nod={Math.sin(lf * 0.8) * 3} />
          <Sweat x={640} y={1260} o={1} />
          <Sweat x={440} y={1230} o={0.8} />
        </Layer>
      </Shot>
    );
  }
  // Brunch-Knast: Gitter vor einem Brunch-Tisch, Häftlinge in Orange müssen Pancakes essen, Wärter nickt
  return (
    <Shot cam={push(lf, len, 540, 1000, 1.0, 1.08)}>
      <Layer depth={0.6}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#9AA3B5" />
        <rect x={-2000} y={1500} width={5000} height={1000} fill="#6B7280" />
      </Layer>
      <Layer>
        {[230, 540, 850].map((x, k) => (
          <Person key={k} x={x} y={1350} s={0.95} seated shirt={C.inmate} pants={C.inmate} hair={(["spiky", "bun", "none"] as const)[k]} hairColor="#2A1B12" skin={[P.skin, P.skin3, P.skin2][k]} eyes={k === 1 ? "twitch" : "half"} f={f} look={[0, 1]} brows="sad" mouth={k === 1 ? "o" : "frown"} open={0.4 * Math.abs(Math.sin(f * 0.3 + k))} armR={120} armL={120} bendR={-60} bendL={-60} />
        ))}
        <Table x={540} y={1250} w={1000} c="#FFFFFF" />
        <Pancakes x={230} y={1240} s={0.9} />
        <Pancakes x={540} y={1240} s={1.1} />
        <Pancakes x={850} y={1240} s={0.9} />
        <Mimosa x={380} y={1250} />
        <Mimosa x={700} y={1250} />
        <Bars />
        <Clerk x={980} y={1700} s={1.0} eyes="half" look={[-1, 0]} brows="angry" mouth="smug" armL={30} armR={20} nod={Math.sin(lf * 0.3) * 6} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* exes                                                               */
/* ================================================================== */

export const HExes: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("That's", 0.62) - 2], d, f);
  if (i === 0) {
    // Parkbank: sie setzt zum Satz an, er hält ihr panisch den Mund zu
    const q = W("let's", 0.35);
    const grab = ease(lf, q + 3, q + 9);
    return (
      <Shot cam={push(lf, len, 540, 1100, 1.0, 1.1)}>
        <Layer depth={0.6}>
          <Park />
        </Layer>
        <Layer>
          <Bench x={540} y={1450} />
          <Ex x={700} y={1430} s={1.0} seated eyes={grab > 0.5 ? "wide" : "half"} look={[-1, 0]} brows={grab > 0.5 ? "up" : "sad"} mouth={grab > 0.5 ? "flat" : "talk"} open={0.4 * Math.abs(Math.sin(lf * 0.6))} armL={30} armR={20} />
          <Person x={380} y={1430} s={1.0} seated shirt={P.teal} hair="side" hairColor="#3A2618" skin={P.skin} eyes="wide" look={[1, 0]} brows="up" mouth={grab > 0.5 ? "scream" : "o"} open={0.5} armR={lerp(30, 88, grab)} armL={20} />
          {grab > 0 ? (
            <g>
              <line x1={460} y1={1430 - 210} x2={lerp(470, 660, grab)} y2={lerp(1220, 1150, grab)} stroke={P.teal} strokeWidth={46} strokeLinecap="round" />
              <circle cx={lerp(480, 690, grab)} cy={lerp(1220, 1140, grab)} r={52} fill={P.skin} stroke={INK} strokeWidth={8} />
            </g>
          ) : null}
          <Sweat x={300} y={1080} o={grab} />
        </Layer>
      </Shot>
    );
  }
  // Dieselbe Bank, Jahrzehnte später: beide grau und faltig, immer noch angekettet, giftige Blicke; Blatt fällt
  return (
    <Shot cam={push(lf, len, 540, 1100, 1.0, 1.08)}>
      <Layer depth={0.6}>
        <rect x={-2000} y={-2000} width={5000} height={3400} fill="#FFC27A" />
        <rect x={-2000} y={1400} width={5000} height={1200} fill="#C9A23A" />
        <Tree x={-60} y={1420} s={1.3} c="#E07B2E" />
        <Tree x={1140} y={1420} s={1.1} c="#D9542E" />
      </Layer>
      <Layer>
        <Bench x={540} y={1450} />
        <Person x={700} y={1430} s={1.0} seated shirt={P.purple} hair="bun" hairColor="#E6E6E6" skin={P.skin2} glasses wrinkles={1} eyes="squint" look={[-1, 0]} brows="angry" mouth="frown" armL={40} armR={20} />
        <Person x={380} y={1430} s={1.0} seated shirt={P.teal} hair="none" hairColor="#E6E6E6" skin={P.skin} wrinkles={1} beard={0.6} eyes="squint" look={[1, 0]} brows="angry" mouth="frown" armR={40} armL={20} />
        <Chain x1={hand(380, 1430, 1, 40, 1, true)[0]} y1={hand(380, 1430, 1, 40, 1, true)[1]} x2={hand(700, 1430, 1, 40, -1, true)[0]} y2={hand(700, 1430, 1, 40, -1, true)[1]} s={0.9} sag={40} />
        <g transform={`translate(${540 + Math.sin(lf * 0.2) * 160} ${lerp(300, 1300, ease(lf, 0, len, "linear"))}) rotate(${lf * 9})`}>
          <path d="M 0 -40 q 40 20 0 80 q -40 -60 0 -80 Z" fill="#E07B2E" stroke={INK} strokeWidth={5} />
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* marcus                                                             */
/* ================================================================== */

export const HMarcus: React.FC = () => {
  const { f, d, W } = useBeats();
  const last = W("Last", 0.3) - 2;
  const { i, lf, len } = useShot([last, W("Can", 0.72) - 2], d, f);
  if (i === 0) {
    return (
      <Shot cam={push(lf, len, 540, 1050, 1.0, 1.1)}>
        <Layer depth={0.5}>
          <ReactBg a={C.flat} b="#FFE98A" f={f} />
        </Layer>
        <Layer>
          <Marcus x={540} y={1600} s={1.7} eyes="open" look={[0, 0]} brows="up" mouth="grin" armL={150} armR={150} bendL={-50} bendR={-50} nod={Math.sin(lf * 0.3) * 4} />
          <Sparkle x={250} y={700} t={lf % 20} s={1.2} />
          <Sparkle x={830} y={620} t={(lf + 10) % 20} s={1.0} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Wochenende im Zeitraffer: Leute laufen vorbei, Marcus winkt jedem, Blase poppt, Strichliste wächst
    const n = Math.min(40, Math.floor((lf / Math.max(1, len - 4)) * 40));
    const walk = (lf * 22) % 1500;
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.9, 0.95)}>
        <Layer depth={0.7}>
          <Street ground={1500} />
        </Layer>
        <Layer>
          {[0, 1, 2].map((k) => {
            const cr = CROWD[(k + Math.floor(lf / 22)) % CROWD.length];
            return <Person key={k} x={1300 - ((walk + k * 500) % 1500)} y={1520} s={0.9} shirt={cr.shirt} hair={cr.hair} hairColor={cr.hairColor} skin={cr.skin} eyes="open" look={[1, 0]} brows="neutral" mouth="smile" armL={20 + Math.sin(lf * 0.5 + k) * 15} armR={20 - Math.sin(lf * 0.5 + k) * 15} />;
          })}
          <Marcus x={540} y={1520} s={1.05} eyes="open" look={[1, 0]} brows="up" mouth="talk" open={0.3 + 0.3 * Math.abs(Math.sin(lf * 0.8))} armR={140 + Math.sin(lf * 1.1) * 25} armL={20} />
          <PlanBubble x={760} y={850} s={0.55 + 0.08 * Math.abs(Math.sin(lf * 0.4))} />
          <rect x={60} y={200} width={540} height={630} rx={24} fill="#FFFFFF" stroke={INK} strokeWidth={9} opacity={0.95} />
          <Tally x={110} y={240} n={n} s={1.0} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Schweißtropfen, nervöses Grinsen
  return (
    <Shot cam={push(lf, len, 540, 980, 1.0, 1.12)}>
      <Layer depth={0.5}>
        <ReactBg a={C.seal} b="#FF7A85" f={f} />
      </Layer>
      <Layer>
        <Marcus x={540} y={1900} s={2.4} eyes="wide" look={[Math.sin(lf * 0.4), 0]} brows="worried" mouth="grin" armL={10} armR={10} />
        <Sweat x={700} y={760} o={1} s={1.6} />
        <Sweat x={380} y={800} o={clamp01(lf / 8)} s={1.3} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* clerk                                                              */
/* ================================================================== */

export const HClerk: React.FC = () => {
  const { f, d, W } = useBeats();
  const forty = W("Forty", 0.7) - 2;
  const { i, lf, len } = useShot([W("The", 0.3) - 2, forty], d, f);
  if (i === 0) {
    // Dunkles Schlafzimmer, Wecker auf 6, Klingeln – Marcus fährt hoch
    const up = ease(lf, 8, 14);
    return (
      <Shot cam={push(lf, len, 540, 1100, 1.0, 1.06)}>
        <Layer depth={0.7}>
          <Room wall={C.night} floor={1500} />
        </Layer>
        <Layer>
          <Clock x={840} y={600} s={0.5} h={Math.PI} m={0} />
          <Bed x={480} y={1420} w={860} c="#4B5FD6" />
          <Marcus x={420} y={1330 - up * 60} s={0.95} seated eyes={up > 0.5 ? "wide" : "closed"} look={[1, -1]} brows={up > 0.5 ? "up" : "neutral"} mouth={up > 0.5 ? "o" : "flat"} open={0.6} armL={lerp(20, 150, up)} armR={lerp(20, 150, up)} />
          <Burst x={840} y={600} r0={170} r1={250} n={12} o={Math.floor(lf / 3) % 2 ? 1 : 0.3} color="#FFE14D" />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Haustür: der Beamte rollt eine Liste aus, die endlos die Treppe hinunterrollt
    const roll = ease(lf, 2, len);
    return (
      <Shot cam={push(lf, len, 540, 1050, 0.9, 0.95)}>
        <Layer depth={0.7}>
          <Room wall="#5BA3E8" floor={1500} />
        </Layer>
        <Layer>
          <Door x={540} y={1500} open={1} color="#2F8F6B" />
          <Clerk x={540} y={1500} s={1.1} eyes="half" look={[0, 1]} brows="neutral" mouth="smug" armR={90} armL={60} bendL={-40} />
          <Briefcase x={300} y={1460} s={0.8} />
          <g>
            <rect x={hand(540, 1500, 1.1, 90, 1)[0] - 70} y={hand(540, 1500, 1.1, 90, 1)[1]} width={140} height={1800 * roll} fill={C.paper} stroke={INK} strokeWidth={8} />
            {Array.from({ length: Math.floor(roll * 24) }).map((_, k) => (
              <rect key={k} x={hand(540, 1500, 1.1, 90, 1)[0] - 50} y={hand(540, 1500, 1.1, 90, 1)[1] + 30 + k * 72} width={k % 3 ? 100 : 70} height={14} rx={7} fill="#B9A88E" />
            ))}
            <circle cx={hand(540, 1500, 1.1, 90, 1)[0]} cy={hand(540, 1500, 1.1, 90, 1)[1] + 1800 * roll} r={50} fill={C.paper} stroke={INK} strokeWidth={8} />
          </g>
          <Marcus x={140} y={1560} s={0.9} eyes="wide" look={[1, 1]} brows="up" mouth="o" open={0.6} armL={10} armR={30} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Marcus entsetzt, Stempel knallt auf die Liste (Wort „Court-ordered“)
  const co = W("Court-ordered", 0.75) - forty;
  const hit = lf - co + 2;
  const drop = eIn(lf, co - 8, co - 2);
  return (
    <Shot cam={push(lf, len, 540 + shake(hit), 1000, 1.0, 1.06)}>
      <Layer depth={0.5}>
        <ReactBg a="#5BA3E8" b="#8EC5FF" f={f} />
      </Layer>
      <Layer>
        <Marcus x={540} y={1250} s={1.2} eyes="wide" look={[0, 1]} brows="up" mouth="scream" open={0.4 + 0.3 * clamp01(hit / 4)} armL={60} armR={60} bendL={-60} bendR={-60} />
        <Paper x={540} y={1450} w={900} h={620} r={-3} lines={8} s={1} />
        <Tally x={150} y={1220} n={40} s={0.6} />
        {hit >= 0 ? <Seal x={700} y={1500} s={0.95} /> : null}
        <Stamp x={700} y={hit >= 0 ? 1560 - Math.min(hit, 6) * 0 - clamp01((hit - 6) / 6) * 500 : lerp(-300, 1560, drop)} s={0.9} />
        <Burst x={700} y={1520} r0={200} r1={200 + 160 * clamp01(hit / 6)} n={14} o={hit >= 0 && hit < 10 ? 1 - hit / 10 : 0} />
        <Poof x={700} y={1520} t={hit} s={1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rush                                                               */
/* ================================================================== */

export const HRush: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Gym", 0.3) - 2, W("Karaoke", 0.62) - 2], d, f);
  if (i === 0) {
    // Café: der Zahnarzt schiebt Marcus den Mundspiegel rein, während er Kaffee trinken will
    return (
      <Shot cam={push(lf, len, 540, 1100, 1.0, 1.08)}>
        <Layer depth={0.6}>
          <Cafe />
        </Layer>
        <Layer>
          <Marcus x={360} y={1500} s={1.05} seated eyes="wide" look={[1, 0]} brows="worried" mouth="scream" open={0.7} armR={70} armL={20} />
          <Dentist x={760} y={1560} s={1.15} eyes="open" look={[-1, 0]} brows="up" mouth="grin" armL={95} armR={20} nod={-6} />
          <g transform={`translate(${head(360, 1500, 1.05, true)[0] + 40 + Math.sin(lf * 0.9) * 12} ${head(360, 1500, 1.05, true)[1] + 50})`}>
            <line x1={0} y1={0} x2={250} y2={20} stroke="#9AA3B5" strokeWidth={14} strokeLinecap="round" />
            <circle cx={0} cy={0} r={22} fill="#C9D0DE" stroke={INK} strokeWidth={6} />
          </g>
          <Table x={540} y={1450} w={720} c="#FFFFFF" />
          <Mug x={hand(360, 1500, 1.05, 70, 1, true)[0] + 30} y={1450} s={0.4} />
          <Sweat x={260} y={950} o={1} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Gym: Kniebeuge mit Riesen-Hantel, der Fremde von einmal brüllt ihn an, Marcus zittert
    const tr = Math.sin(lf * 2.2) * 6;
    return (
      <Shot cam={push(lf, len, 540, 1050, 0.95, 1.02)}>
        <Layer depth={0.6}>
          <Gym />
        </Layer>
        <Layer>
          <Barbell x={540 + tr} y={1560 - 300 * 1.1} s={1.15} r={tr * 0.6} />
          <Marcus x={540 + tr} y={1560} s={1.1} eyes="squint" look={[0, -1]} brows="worried" mouth="scream" open={0.5} armL={150} armR={150} bendL={-130} bendR={-130} />
          <GymGuy x={880} y={1600} s={1.15} eyes="wide" look={[-1, 0]} brows="angry" mouth="scream" open={0.6 + 0.3 * Math.abs(Math.sin(lf * 0.6))} armL={110} armR={40} />
          <Sweat x={440} y={1000} o={1} />
          <Sweat x={650} y={980} o={1} />
        </Layer>
      </Shot>
    );
  }
  // Karaoke: die Ex schreit ins Mikro, ihre Anwältin mit Aktenkoffer singt Backing, Marcus dazwischen
  const pulse = Math.abs(Math.sin(lf * 0.5));
  return (
    <Shot cam={push(lf, len, 540, 1100, 0.95, 1.04)}>
      <Layer depth={0.6}>
        <Stage f={f} />
      </Layer>
      <Layer>
        <Lawyer x={860} y={1560} s={1.0} eyes="closed" look={[0, 0]} brows="up" mouth="o" open={0.5 + 0.3 * pulse} armL={60} armR={20} gest={8} />
        <Briefcase x={hand(860, 1560, 1, 20, 1)[0] + 20} y={hand(860, 1560, 1, 20, 1)[1] + 50} s={0.7} />
        <Marcus x={540} y={1560} s={0.95} eyes="half" look={[-1, 0]} brows="sad" mouth="flat" armR={40} armL={10} />
        <Mic x={hand(540, 1560, 0.95, 40, 1)[0]} y={hand(540, 1560, 0.95, 40, 1)[1]} s={0.8} r={30} />
        <Ex x={230} y={1580} s={1.15} eyes="squint" look={[1, 0]} brows="angry" mouth="scream" open={0.6 + 0.4 * pulse} armR={110} armL={150} bendR={-60} />
        <Mic x={hand(230, 1580, 1.15, 110, 1)[0] - 20} y={hand(230, 1580, 1.15, 110, 1)[1] - 40} s={1} r={-60} />
        <Burst x={380} y={900} r0={60} r1={60 + 80 * pulse} n={8} color="#FFD84D" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* cooked                                                             */
/* ================================================================== */

export const HCooked: React.FC = () => {
  const { f, d, W } = useBeats();
  const bro = W("Bro", 0.65) - 2;
  const { i, lf, len } = useShot([bro], d, f);
  if (i === 0) {
    // Straße: Marcus torkelt, Akku auf der Brust blinkt rot, Kopf raucht
    const wob = Math.sin(lf * 0.35) * 8;
    return (
      <Shot cam={push(lf, len, 540, 1050, 1.0, 1.1)}>
        <Layer depth={0.7}>
          <Street ground={1550} />
        </Layer>
        <Layer>
          <Marcus x={540} y={1550} s={1.3} lean={wob} eyes="twitch" f={f} look={[0, 0]} brows="sad" mouth="drool" open={0.4} bags={1} armL={15} armR={15} gest={10} />
          <Battery x={540 + wob * 4} y={1550 - 200 * 1.3} s={1.1} lvl={0.12} blink f={f} />
          <Smoke x={540 + wob * 10} y={1550 - 560 * 1.3} f={f} s={1.3} />
        </Layer>
      </Shot>
    );
  }
  // POOF: er klatscht vornüber hin, der Beamte steigt drüber und hakt auf dem Klemmbrett ab
  const fall = eIn(lf, 0, 8);
  const step = ease(lf, 12, len - 4);
  return (
    <Shot cam={push(lf, len, 540, 1150, 0.95, 1.0)}>
      <Layer depth={0.7}>
        <Street ground={1550} />
      </Layer>
      <Layer>
        <Marcus x={260} y={1560} s={1.1} lean={lerp(10, 88, fall)} eyes="xx" look={[0, 0]} brows="none" mouth="drool" open={0.4} armL={170} armR={170} />
        <Smoke x={260 + 450} y={1500} f={f} s={1} o={fall} />
        <Poof x={600} y={1500} t={lf - 6} s={1.2} />
        <Clerk x={lerp(1300, 860, step)} y={1560} s={1.1} eyes="half" look={[-1, 1]} brows="neutral" mouth="flat" armR={80} armL={80} bendL={-60} />
        <Clipboard x={lerp(1300, 860, step) - 160} y={1560 - 300} s={0.9} ticks={lf > len - 8 ? 4 : 3} r={-10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

export const HTwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const tech = W("Technically", 0.75) - 2;
  const { i, lf, len } = useShot([W("One", 0.3) - 2, tech], d, f);
  if (i === 0) {
    // Glühbirne geht an, fieses Grinsen
    const on = ease(lf, 6, 10);
    return (
      <Shot cam={push(lf, len, 540, 950, 1.0, 1.1)}>
        <Layer depth={0.5}>
          <ReactBg a="#2B2A6B" b="#4B4AA0" f={f} />
        </Layer>
        <Layer>
          <Marcus x={540} y={1900} s={2.2} eyes={on > 0.5 ? "squint" : "half"} look={[1, -1]} brows={on > 0.5 ? "angry" : "sad"} mouth={on > 0.5 ? "smug" : "flat"} armL={10} armR={10} bags={0.6} />
          <Bulb x={540} y={330} s={1.2} on={on} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Riesenparty: alle 40 (Zahnarzt, Gym-Typ, Ex, Anwältin …), Discokugel, Konfetti, Marcus in der Mitte
    return (
      <Shot cam={push(lf, len, 540, 1100, 0.85, 0.92)}>
        <Layer depth={0.6}>
          <PartyRoom f={f} />
        </Layer>
        <Layer>
          {CROWD.map((c, k) => (
            <Person key={k} x={80 + k * 185} y={1450 + (k % 2) * 30} s={0.6} shirt={c.shirt} hair={c.hair} hairColor={c.hairColor} skin={c.skin} eyes="closed" look={[0, 0]} brows="up" mouth="grin" armL={150 + Math.sin(f * 0.4 + k) * 20} armR={150 - Math.sin(f * 0.4 + k) * 20} />
          ))}
          <Dentist x={170} y={1640} s={0.85} eyes="closed" look={[0, 0]} brows="up" mouth="grin" armL={160} armR={140} gest={12} />
          <GymGuy x={360} y={1660} s={0.9} eyes="open" look={[1, 0]} brows="up" mouth="scream" open={0.5} armL={170} armR={170} gest={10} />
          <Marcus x={560} y={1680} s={1.0} eyes="closed" look={[0, 0]} brows="up" mouth="grin" armL={160} armR={160} gest={14} />
          <Ex x={760} y={1660} s={0.9} eyes="half" look={[-1, 0]} brows="angry" mouth="flat" armL={20} armR={40} />
          <Lawyer x={930} y={1650} s={0.85} eyes="half" look={[-1, 0]} brows="neutral" mouth="smile" armL={30} armR={120} gest={6} />
          <DiscoBall x={540} y={500} f={f} s={1.2} />
          <Confetti f={f} />
        </Layer>
      </Shot>
    );
  }
  // Beamter prüft die Liste mit zusammengekniffenen Augen – dann grünes Häkchen-Siegel (Wort „hangout“)
  const ok = W("hangout", 0.85) - tech;
  const hit = lf - ok;
  return (
    <Shot cam={push(lf, len, 540 + shake(hit, 14), 1000, 1.0, 1.08)}>
      <Layer depth={0.5}>
        <ReactBg a={C.party} b="#5BE0E0" f={f} />
      </Layer>
      <Layer>
        <Clerk x={540} y={1900} s={2.0} eyes={hit >= 0 ? "open" : "squint"} look={[0, 1]} brows={hit >= 0 ? "up" : "angry"} mouth={hit >= 0 ? "smile" : "flat"} armL={40} armR={40} />
        <Clipboard x={540} y={1350} s={1.6} ticks={hit >= 0 ? 4 : 1} />
        {hit >= 0 ? <Seal x={720} y={1250} s={0.9 * (0.7 + 0.3 * ease(hit, 0, 4))} ok /> : null}
        <Burst x={720} y={1250} r0={170} r1={170 + 140 * clamp01(hit / 6)} n={12} o={hit >= 0 && hit < 10 ? 1 - hit / 10 : 0} color="#22B14C" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* clerk2                                                             */
/* ================================================================== */

export const HClerk2: React.FC = () => {
  const { f, d, W } = useBeats();
  const we = W("We", 0.62) - 2;
  const { i, lf, len } = useShot([we], d, f);
  if (i === 0) {
    // Tür der Party: Beamter zufrieden, winkt zum Abschied, Party feiert im Hintergrund
    return (
      <Shot cam={push(lf, len, 540, 1050, 0.95, 1.02)}>
        <Layer depth={0.7}>
          <PartyRoom f={f} />
        </Layer>
        <Layer>
          {CROWD.slice(0, 4).map((c, k) => (
            <Person key={k} x={130 + k * 140} y={1380} s={0.55} shirt={c.shirt} hair={c.hair} hairColor={c.hairColor} skin={c.skin} eyes="closed" look={[0, 0]} brows="up" mouth="grin" armL={150} armR={150} gest={14} />
          ))}
          <Marcus x={420} y={1580} s={0.9} eyes="open" look={[1, 0]} brows="up" mouth="grin" armR={150} armL={20} gest={10} />
          <Door x={820} y={1580} open={1} color="#B0306A" />
          <Clerk x={820} y={1580} s={1.0} eyes="closed" look={[-1, 0]} brows="up" mouth="smile" armL={150 + Math.sin(lf * 0.8) * 20} armR={20} />
          <Clipboard x={hand(820, 1580, 1, 20, 1)[0]} y={hand(820, 1580, 1, 20, 1)[1]} s={0.6} ticks={4} />
        </Layer>
      </Shot>
    );
  }
  // Nah: der Beamte lächelt und sagt es – die Party hinter ihm friert ein (Farbe weg), alle drehen sich um
  const freeze = ease(lf, W("sometime", 0.9) - we - 2, W("sometime", 0.9) - we + 6);
  return (
    <Shot cam={push(lf, len, 540, 1000, 1.0, 1.1)}>
      <Layer depth={0.7}>
        <PartyRoom f={f * (1 - freeze)} gray={freeze} />
        {CROWD.map((c, k) => (
          <Person key={k} x={60 + k * 195} y={1300} s={0.6} shirt={c.shirt} hair={c.hair} hairColor={c.hairColor} skin={c.skin} eyes={freeze > 0.5 ? "wide" : "closed"} look={[k < 3 ? 1 : -1, 0]} brows="up" mouth={freeze > 0.5 ? "o" : "grin"} open={0.5} armL={freeze > 0.5 ? 10 : 150} armR={freeze > 0.5 ? 10 : 150} />
        ))}
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#6B7280" opacity={0.55 * freeze} />
      </Layer>
      <Layer>
        <Clerk x={540} y={2000} s={2.2} eyes="closed" look={[0, 0]} brows="up" mouth="talk" open={freeze > 0.5 ? 0.1 : 0.2 + 0.25 * Math.abs(Math.sin(lf * 0.7))} armL={140 + Math.sin(lf * 0.8) * 15} armR={20} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* gone                                                               */
/* ================================================================== */

export const HGone: React.FC = () => {
  const { f, d, W } = useBeats();
  const two = W("Two", 0.3) - 2;
  const now = W("Now", 0.62) - 2;
  const { i, lf, len } = useShot([two, now], d, f);
  if (i === 0) {
    // Dem Beamten weicht die Farbe aus dem Gesicht: Augen riesig, Mund offen, Schweiß
    const drain = ease(lf, 0, 10);
    return (
      <Shot cam={push(lf, len, 540, 980, 1.05, 1.25)}>
        <Layer depth={0.5}>
          <ReactBg a="#3A3A55" b="#55557A" f={f} />
        </Layer>
        <Layer>
          <Person x={540} y={2000} s={2.2} shirt={C.clerk} pants={C.clerkDark} suit stache glasses hair="side" hairColor="#3A3A3A" skin={drain > 0.5 ? "#D8E6C8" : P.skin} eyes="wide" look={[0, -1]} brows="up" mouth="o" open={0.7} armL={10} armR={10} />
          <Sweat x={760} y={760} o={drain} s={1.5} />
          <Sweat x={320} y={800} o={drain} s={1.2} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Decke bricht auf, zwei Beamte fallen mit Stempel herein – KNALL
    const land = W("ceiling", 0.7) - two;
    const hit = lf - land;
    const fall = eIn(lf, 0, land);
    const Y = 1600;
    return (
      <Shot cam={push(lf, len, 540 + shake(hit, 30), 1100, 0.95, 1.0)}>
        <Layer depth={0.7}>
          <PartyRoom f={0} gray={1} />
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#6B7280" opacity={0.5} />
        </Layer>
        <Layer>
          <rect x={-2000} y={-400} width={5000} height={800} fill="#E6DCC8" />
          <CeilingBreak x={540} y={400} t={lf - 2} s={1.3} />
          <Person x={700} y={Y} s={1.0} shirt={C.clerk} pants={C.clerkDark} suit stache glasses hair="side" hairColor="#3A3A3A" skin="#D8E6C8" eyes="wide" look={[0, -1]} brows="up" mouth="scream" open={0.8} armL={170} armR={170} />
          <Clerk x={300} y={lerp(300, Y, fall)} s={0.95} eyes="half" look={[1, 0]} brows="angry" mouth="flat" armL={160} armR={160} />
          <Clerk x={1010} y={lerp(200, Y, fall)} s={0.95} eyes="half" look={[-1, 0]} brows="angry" mouth="flat" armL={160} armR={160} />
          <Stamp x={700} y={hit >= 0 ? Y - 640 : lerp(300, Y - 640, fall)} s={0.8} />
          <Burst x={700} y={Y - 640} r0={150} r1={150 + 200 * clamp01(hit / 6)} n={14} o={hit >= 0 && hit < 10 ? 1 - hit / 10 : 0} />
          <Poof x={540} y={Y - 60} t={hit} s={1.4} />
        </Layer>
      </Shot>
    );
  }
  // Beamter schluchzt, lebenslang an einen strahlenden Marcus gekettet
  const s = 1.15;
  return (
    <Shot cam={push(lf, len, 540, 1100, 1.0, 1.08)}>
      <Layer depth={0.6}>
        <ReactBg a="#FFB52E" b="#FFD84D" f={f} />
      </Layer>
      <Layer>
        <Clerk x={720} y={1600} s={s} eyes="closed" look={[0, 0]} brows="sad" mouth="scream" open={0.4 + 0.2 * Math.abs(Math.sin(lf * 0.5))} armL={50} armR={15} nod={Math.sin(lf * 0.5) * 5} />
        <Tears x={720} y={head(720, 1600, s)[1]} f={f} s={s} />
        <Marcus x={340} y={1600} s={s} eyes="closed" look={[0, 0]} brows="up" mouth="grin" armR={50} armL={150} gest={8} />
        <Chain x1={hand(340, 1600, s, 50, 1)[0]} y1={hand(340, 1600, s, 50, 1)[1]} x2={hand(720, 1600, s, 50, -1)[0]} y2={hand(720, 1600, s, 50, -1)[1]} s={1.1} sag={30} />
        <Sparkle x={200} y={820} t={lf % 20} s={1.1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const HOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const he = W("He", 0.5) - 2;
  const back = W("back", 0.85) - 2;
  const { i, lf, len } = useShot([he, back], d, f);
  const s = 1.0;
  if (i === 0) {
    // Wohnung: angekettete Mitbewohner auf dem Sofa, Beamter hält die Mietrechnung hoch, Marcus futtert Chips
    return (
      <Shot cam={push(lf, len, 540, 1100, 0.95, 1.02)}>
        <Layer depth={0.7}>
          <Room wall={C.flat} floor={1520} window />
        </Layer>
        <Layer>
          <CouchBack x={540} y={1440} w={920} color="#3D6BE0" />
          <Clerk x={740} y={1380} s={s} seated eyes="half" look={[-1, 0]} brows="angry" mouth="frown" armL={40} armR={150} bendR={-40} />
          <Bill x={hand(740, 1380, s, 150, 1, true)[0] - 20} y={hand(740, 1380, s, 150, 1, true)[1] - 160} s={0.8} r={8} />
          <Marcus x={340} y={1380} s={s} seated eyes="half" look={[0, 0]} brows="neutral" mouth="smile" armR={40} armL={110} bendL={-80} />
          <Chips x={250} y={1390} s={0.9} />
          <Chain x1={hand(340, 1380, s, 40, 1, true)[0]} y1={hand(340, 1380, s, 40, 1, true)[1]} x2={hand(740, 1380, s, 40, -1, true)[0]} y2={hand(740, 1380, s, 40, -1, true)[1]} s={0.9} sag={30} />
          <CouchFront x={540} y={1500} w={920} color="#3D6BE0" />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: Marcus grinst und sagt es
    return (
      <Shot cam={push(lf, len, 540, 980, 1.0, 1.12)}>
        <Layer depth={0.5}>
          <ReactBg a={C.hoodie} b="#7BE89E" f={f} />
        </Layer>
        <Layer>
          <Marcus x={540} y={1950} s={2.3} eyes="half" look={[1, 0]} brows="up" mouth="talk" open={0.2 + 0.25 * Math.abs(Math.sin(lf * 0.7))} armL={10} armR={150} bendR={-70} />
          <Sparkle x={820} y={600} t={lf % 20} s={1.2} />
        </Layer>
      </Shot>
    );
  }
  // Decke reißt über dem Sofa, der Schatten wächst, der Stempel kommt – harter Schnitt zurück auf Bild 1 (Loop)
  const down = eIn(lf, 0, Math.max(4, len - 2));
  return (
    <Shot cam={push(lf, len, 540 + shake(lf - 2, 10), 1000, 0.9, 0.95)}>
      <Layer depth={0.7}>
        <Room wall={C.flat} floor={1520} window />
      </Layer>
      <Layer>
        <rect x={-2000} y={-400} width={5000} height={420} fill="#E6DCC8" />
        <CeilingBreak x={540} y={20} t={lf - 4} s={1.2} crack={ease(lf, 0, 4)} />
        <CouchBack x={540} y={1440} w={920} color="#3D6BE0" />
        <ellipse cx={540} cy={1500} rx={160 + 220 * down} ry={30 + 30 * down} fill="#000000" opacity={0.15 + 0.3 * down} />
        <Clerk x={740} y={1380} s={s} seated eyes="wide" look={[0, -1]} brows="up" mouth="scream" open={0.7} armL={170} armR={170} />
        <Marcus x={340} y={1380} s={s} seated eyes="wide" look={[0, -1]} brows="up" mouth="o" open={0.6} armL={160} armR={40} />
        <Chain x1={hand(340, 1380, s, 40, 1, true)[0]} y1={hand(340, 1380, s, 40, 1, true)[1]} x2={hand(740, 1380, s, 170, -1, true)[0]} y2={hand(740, 1380, s, 170, -1, true)[1]} s={0.9} sag={30} />
        <CouchFront x={540} y={1500} w={920} color="#3D6BE0" />
        <Stamp x={540} y={lerp(250, 1000, down)} s={1.1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const HANGOUT_SCENES: Record<string, React.FC> = {
  hook: HHook,
  rules: HRules,
  exes: HExes,
  marcus: HMarcus,
  clerk: HClerk,
  rush: HRush,
  cooked: HCooked,
  twist: HTwist,
  clerk2: HClerk2,
  gone: HGone,
  outro: HOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(HANGOUT_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Requisiten sind Symbole. */
export const HANGOUT_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene: Straße, Siegel nah | Gericht, Brunch-Knast | Park ×2 | Marcus, Straße, Nah |
 * Schlafzimmer, Tür, Stempel | Café, Gym, Karaoke | Straße ×2 | Birne, Party, Klemmbrett | Tür, Nah |
 * Gesicht, Decke, Kette | Sofa, Nah, Decke → nie > 2 gleiche am Stück. */
export const HANGOUT_SHOT_COUNT: Record<string, number> = {
  hook: 2,
  rules: 2,
  exes: 2,
  marcus: 3,
  clerk: 3,
  rush: 3,
  cooked: 2,
  twist: 3,
  clerk2: 2,
  gone: 3,
  outro: 3,
};
