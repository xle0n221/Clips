import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/luegen-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, INK, P, Person, Sky, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";

/**
 * „In This City, Every Lie Makes You Shorter“ (episodes/luegen-stadt.json) – 2D-Cartoon wie Gähn-Stadt.
 * Jede Einstellung an Wort-Beats geschnitten; eine Text-Ebene (nur Untertitel), Gag alle 5–8 s, kein Set > 2 Einstellungen
 * am Stück. Neu gegenüber Gähn-Stadt: Arme mit Ellenbogen + Gestik (`bendL/bendR/gest`), Gähn-Audit „Arme steif“.
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

const L = {
  dave: "#FF7A1A",
  daveDark: "#C2530A",
  mia: "#FF5FA8",
  linda: "#FFD23F",
  lindaHair: "#D8432C",
  dad: "#3D7BFF",
  wall: "#BFE8FF",
  wall2: "#FFE1C2",
  wood: "#C47A45",
  woodDark: "#8C4F26",
  cloth: "#FFFFFF",
  check: "#FF6B7A",
  sludge: "#9AA19A",
  sludgeDark: "#6E756E",
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Dave: React.FC<Fig> = (p) => <Person pants="#2B3A67" {...p} shirt={L.dave} hair="curly" hairColor="#5A3418" skin={P.skin} />;
const Mia: React.FC<Fig> = (p) => <Person pants={L.mia} {...p} shirt={L.mia} hair="pony" hairColor="#2A1B12" skin={P.skin2} />;
const CatSweater: React.FC = () => (
  <g transform="translate(0 -230)">
    <circle r={58} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <path d="M -50 -30 L -44 -78 L -14 -52 Z M 50 -30 L 44 -78 L 14 -52 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-20} cy={-8} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    <circle cx={20} cy={-8} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    <circle cx={-12} cy={-8} r={7} fill={INK} />
    <circle cx={12} cy={-8} r={7} fill={INK} />
    <path d="M -10 16 Q 0 26 10 16" fill="none" stroke={INK} strokeWidth={4} />
    <path d="M -60 14 L -28 18 M -60 28 L -28 24 M 60 14 L 28 18 M 60 28 L 28 24" stroke={INK} strokeWidth={3} />
    {[-80, 80].map((x) => (
      <circle key={x} cx={x} cy={60} r={10} fill={P.pink} stroke={INK} strokeWidth={3} />
    ))}
  </g>
);
const Linda: React.FC<Fig> = (p) => <Person pants="#7A3FB0" {...p} shirt={L.linda} hair="curly" hairColor={L.lindaHair} skin="#F2C7A5" chest={<CatSweater />} />;
const Dad: React.FC<Fig> = (p) => <Person pants="#1F3A80" {...p} shirt={L.dad} hair="none" hairColor="#000" skin={P.skin} stache />;

/* ------------------------------------------------------------------ */
/* Requisiten                                                         */
/* ------------------------------------------------------------------ */

/** Poof-Wolke: t = Frames seit dem Poof. */
const Poof: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t < 0 || t > 22) return null;
  const k = clamp01(t / 22);
  const o = 1 - k * k;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.5 + k * 0.9)})`} opacity={o}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 90} cy={Math.sin((a * Math.PI) / 180) * 70} r={70} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      ))}
      <circle r={90} fill="#FFFFFF" />
      <Burst x={0} y={0} r0={150} r1={230} n={10} o={o} />
    </g>
  );
};

/** Maßstriche an einer Wand (ohne Zahlen: eine Text-Ebene). */
const Chart: React.FC<{ readonly x: number; readonly y0: number; readonly y1: number; readonly mark?: number }> = ({ x, y0, y1, mark }) => (
  <g>
    <rect x={x - 40} y={y1} width={80} height={y0 - y1} rx={10} fill="#FFF6D8" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 13 }).map((_, k) => {
      const yy = lerp(y0, y1, k / 12);
      return <line key={k} x1={x - 40} x2={x - (k % 3 === 0 ? 0 : 18)} y1={yy} y2={yy} stroke={INK} strokeWidth={k % 3 === 0 ? 6 : 4} />;
    })}
    {mark !== undefined ? <line x1={x - 70} x2={x + 70} y1={mark} y2={mark} stroke={P.red} strokeWidth={10} strokeLinecap="round" /> : null}
  </g>
);

const Fish: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly look?: number; readonly r?: number; readonly flop?: number }> = ({ x, y, s = 1, look = 0, r = 0, flop = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r + flop}) scale(${s})`}>
    <path d="M 70 0 L 130 -45 L 125 45 Z" fill="#FF9A3D" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <ellipse rx={95} ry={55} fill="#FFB65C" stroke={INK} strokeWidth={7} />
    <path d="M -20 -50 Q 10 -20 -20 50" fill="none" stroke={INK} strokeWidth={5} />
    <circle cx={-52} cy={-12} r={22} fill={P.white} stroke={INK} strokeWidth={5} />
    <circle cx={-52 + look * 9} cy={-12} r={10} fill={INK} />
    <path d="M -95 12 Q -80 20 -70 12" fill="none" stroke={INK} strokeWidth={5} />
  </g>
);

const Pier: React.FC = () => (
  <g>
    <Sky id="pier" a="#5CC4FF" b="#D9F4FF" />
    <rect x={-1500} y={1180} width={4000} height={1400} fill={P.sea} />
    <rect x={-1500} y={1180} width={4000} height={30} fill="#7FE3E3" />
    <rect x={-1500} y={1450} width={4000} height={1200} fill={L.wood} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 14 }).map((_, k) => (
      <line key={k} x1={-700 + k * 180} x2={-700 + k * 180} y1={1450} y2={2600} stroke={L.woodDark} strokeWidth={6} />
    ))}
    {/* Köderhütte mit Maßstrichen */}
    <rect x={-300} y={560} width={460} height={890} fill="#5BB6E8" stroke={INK} strokeWidth={8} />
    <path d="M -340 580 L -70 400 L 200 580 Z" fill={P.red} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={850} cy={330} rx={160} ry={55} fill={P.white} opacity={0.9} />
  </g>
);

const Rod: React.FC<{ readonly hx: number; readonly hy: number; readonly tx: number; readonly ty: number; readonly fy: number; readonly fishS: number; readonly f: number }> = ({ hx, hy, tx, ty, fy, fishS, f }) => (
  <g>
    <line x1={hx} y1={hy} x2={tx} y2={ty} stroke="#5A3418" strokeWidth={14} strokeLinecap="round" />
    <line x1={tx} y1={ty} x2={tx} y2={fy - 30 * fishS} stroke={INK} strokeWidth={3} />
    <Fish x={tx} y={fy} s={fishS} r={90} flop={Math.sin(f * 0.8) * 12} />
  </g>
);

const Measure: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly ext: number }> = ({ x, y, s = 1, ext }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={-30} width={ext} height={60} fill="#FFE14D" stroke={INK} strokeWidth={6} />
    {Array.from({ length: Math.max(0, Math.floor(ext / 40)) }).map((_, k) => (
      <line key={k} x1={ext - k * 40} x2={ext - k * 40} y1={-30} y2={k % 4 === 0 ? 14 : -4} stroke={INK} strokeWidth={k % 4 === 0 ? 6 : 4} />
    ))}
    <rect x={ext - 8} y={-46} width={18} height={92} rx={4} fill="#9AA3B5" stroke={INK} strokeWidth={5} />
    <rect x={-210} y={-170} width={240} height={240} rx={50} fill={P.red} stroke={INK} strokeWidth={8} />
    <circle cx={-90} cy={-50} r={62} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <circle cx={-90} cy={-50} r={22} fill={INK} />
  </g>
);

const Room: React.FC<{ readonly wall?: string; readonly floor?: number; readonly window?: boolean; readonly night?: boolean }> = ({ wall = L.wall2, floor = 1500, window, night }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={2000 + floor} fill={wall} />
    {[...Array(14)].map((_, k) => (
      <rect key={k} x={-1500 + k * 300} y={-2000} width={110} height={2000 + floor} fill="#FFFFFF" opacity={0.18} />
    ))}
    <rect x={-2000} y={floor} width={5000} height={2500} fill={L.wood} />
    <rect x={-2000} y={floor} width={5000} height={22} fill={L.woodDark} />
    {window ? (
      <g>
        <rect x={700} y={330} width={340} height={420} rx={14} fill={night ? "#2A2C6E" : "#9EDCFF"} stroke={INK} strokeWidth={10} />
        <line x1={870} x2={870} y1={330} y2={750} stroke={INK} strokeWidth={8} />
        {night ? <circle cx={960} cy={420} r={34} fill="#FFF3B0" /> : null}
      </g>
    ) : null}
  </g>
);

/** Esstisch mit karierter Decke (Vorderkante bei y). */
const Table: React.FC<{ readonly y: number; readonly x0?: number; readonly x1?: number }> = ({ y, x0 = -400, x1 = 1480 }) => (
  <g>
    <rect x={x0} y={y - 40} width={x1 - x0} height={80} fill={L.cloth} stroke={INK} strokeWidth={8} />
    <rect x={x0} y={y + 40} width={x1 - x0} height={900} fill={L.cloth} stroke={INK} strokeWidth={8} />
    {Array.from({ length: Math.ceil((x1 - x0) / 120) }).map((_, k) => (
      <rect key={k} x={x0 + k * 120} y={y + 40} width={60} height={900} fill={L.check} opacity={0.55} />
    ))}
    {Array.from({ length: 8 }).map((_, k) => (
      <rect key={`h${k}`} x={x0} y={y + 40 + k * 120} width={x1 - x0} height={60} fill={L.check} opacity={0.35} />
    ))}
  </g>
);

/** Grauer Auflauf mit Blasen und einem Auge. eye 0..1 (offen). */
const Casserole: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly eye: number; readonly look?: number }> = ({ x, y, s = 1, f, eye, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={40} rx={300} ry={90} fill="#E8E2D8" stroke={INK} strokeWidth={8} />
    <path d="M -300 40 L -280 120 Q 0 190 280 120 L 300 40 Z" fill="#3E7BD8" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <ellipse cx={0} cy={30} rx={260} ry={66} fill={L.sludge} stroke={INK} strokeWidth={6} />
    {[-170, -60, 70, 180, 10].map((bx, k) => {
      const ph = (f * 0.09 + k * 0.37) % 1;
      return <circle key={k} cx={bx} cy={30 - ph * 30 + (k % 2) * 12} r={8 + ph * 24} fill={L.sludgeDark} stroke={INK} strokeWidth={4} opacity={1 - ph * ph} />;
    })}
    {eye > 0.02 ? (
      <g transform="translate(40 26)">
        <ellipse rx={44} ry={30 * eye} fill={P.white} stroke={INK} strokeWidth={5} />
        <circle cx={look * 18} r={13 * Math.min(1, eye * 1.4)} fill={INK} />
      </g>
    ) : (
      <path d="M -4 26 Q 40 40 84 26" fill="none" stroke={INK} strokeWidth={5} />
    )}
    {[-120, 0, 120].map((sx, k) => (
      <path key={sx} d={`M ${sx} -40 q 24 -40 0 -80 q -24 -40 0 -80`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(f * 0.2 + k)} />
    ))}
  </g>
);

/** Salzstreuer (Ursprung = Mitte des Deckels oben). */
const Shaker: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -230 60 L -260 900 Q 0 960 260 900 L 230 60 Z" fill="#EAF6FF" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -240 600 L -258 900 Q 0 960 258 900 L 240 600 Q 0 650 -240 600 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={180} width={50} height={500} rx={25} fill="#FFFFFF" opacity={0.7} />
    <path d="M -250 70 Q -250 -10 0 -10 Q 250 -10 250 70 Z" fill="#C9CED8" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    {[-110, -40, 30, 100].map((hx) => (
      <circle key={hx} cx={hx} cy={28} r={11} fill={INK} />
    ))}
  </g>
);

const Hearts: React.FC<{ readonly x: number; readonly y: number; readonly t: number }> = ({ x, y, t }) => (
  <g>
    {[0, 1, 2].map((k) => {
      const tt = t - k * 5;
      if (tt < 0) return null;
      const o = clamp01(1 - tt / 40);
      return (
        <path
          key={k}
          transform={`translate(${x + (k - 1) * 90} ${y - tt * 4}) scale(${0.8 + 0.2 * k})`}
          d="M 0 30 C -60 -10 -40 -60 0 -30 C 40 -60 60 -10 0 30 Z"
          fill={P.red}
          stroke={INK}
          strokeWidth={5}
          opacity={o}
        />
      );
    })}
  </g>
);

const Door: React.FC<{ readonly x: number; readonly y: number; readonly open: number; readonly color?: string; readonly warm?: boolean }> = ({ x, y, open, color = "#2F8F6B", warm }) => (
  <g>
    <rect x={x - 230} y={y - 820} width={460} height={820} fill={warm ? "#FFE6A3" : "#2B2440"} stroke={INK} strokeWidth={10} />
    <g transform={`translate(${x - 230} 0) scale(${1 - open * 0.85} 1) translate(${-(x - 230)} 0)`}>
      <rect x={x - 230} y={y - 820} width={460} height={820} fill={color} stroke={INK} strokeWidth={10} />
      <rect x={x - 170} y={y - 760} width={150} height={300} rx={10} fill="none" stroke={INK} strokeWidth={6} />
      <rect x={x + 20} y={y - 760} width={150} height={300} rx={10} fill="none" stroke={INK} strokeWidth={6} />
      <circle cx={x + 170} cy={y - 400} r={20} fill={P.bus} stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

const Car: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -520 -60 L -480 -230 Q -300 -260 -220 -380 L 220 -380 Q 320 -260 500 -230 L 540 -60 Z" fill={P.red} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M -190 -350 L 190 -350 L 280 -240 L -270 -240 Z" fill="#9EDCFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <line x1={0} x2={0} y1={-350} y2={-240} stroke={INK} strokeWidth={8} />
    {[-300, 300].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-50} r={120} fill={INK} />
        <circle cx={wx} cy={-50} r={55} fill="#C9CED8" stroke={INK} strokeWidth={6} />
      </g>
    ))}
    <ellipse cx={-420} cy={-480} rx={60} ry={14} fill="#FFFFFF" opacity={0.5} />
  </g>
);

const Bunting: React.FC<{ readonly y: number; readonly f: number }> = ({ y, f }) => (
  <g>
    <path d={`M -200 ${y} Q 540 ${y + 120} 1280 ${y}`} fill="none" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 12 }).map((_, k) => {
      const t = k / 11;
      const bx = lerp(-200, 1280, t);
      const by = y + 120 * 4 * t * (1 - t) * 0.5 + 8;
      const c = [P.red, P.bus, P.ted, P.lime][k % 4];
      return <path key={k} d={`M ${bx - 30} ${by} L ${bx + 30} ${by} L ${bx + Math.sin(f * 0.3 + k) * 6} ${by + 70} Z`} fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
    })}
  </g>
);

const Birdhouse: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={0} width={40} height={1400} fill={L.woodDark} stroke={INK} strokeWidth={6} />
    <rect x={-170} y={-330} width={340} height={340} fill="#5BB6E8" stroke={INK} strokeWidth={8} />
    <path d="M -210 -310 L 0 -480 L 210 -310 Z" fill={P.red} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={0} cy={-170} r={78} fill="#2B2440" stroke={INK} strokeWidth={8} />
    <rect x={-10} y={-60} width={20} height={70} fill={L.woodDark} />
    <rect x={-60} y={-20} width={120} height={18} rx={9} fill={L.woodDark} stroke={INK} strokeWidth={4} />
  </g>
);

const Bird: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly angry?: boolean }> = ({ x, y, s = 1, angry }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={80} ry={60} fill="#FFD23F" stroke={INK} strokeWidth={6} />
    <circle cx={60} cy={-50} r={44} fill="#FFD23F" stroke={INK} strokeWidth={6} />
    <path d="M 100 -50 L 140 -40 L 100 -30 Z" fill={P.orange} stroke={INK} strokeWidth={4} />
    <circle cx={70} cy={-58} r={9} fill={INK} />
    {angry ? <line x1={52} x2={86} y1={-82} y2={-70} stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
    <path d="M -10 -10 Q -60 -60 -100 -20" fill="#F2B800" stroke={INK} strokeWidth={5} />
  </g>
);

const Phone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-110} y={-200} width={220} height={400} rx={30} fill={INK} />
    <rect x={-94} y={-180} width={188} height={340} rx={16} fill="#BDF0FF" />
    {/* Profilbild: großer Muskel-Typ, Daumen hoch */}
    <circle cx={0} cy={-90} r={36} fill={P.skin} stroke={INK} strokeWidth={4} />
    <path d="M -80 120 Q -80 -40 0 -46 Q 80 -40 80 120 Z" fill={P.ted} stroke={INK} strokeWidth={4} />
    <circle cx={-70} cy={10} r={26} fill={P.skin} stroke={INK} strokeWidth={4} />
    <circle cx={70} cy={10} r={26} fill={P.skin} stroke={INK} strokeWidth={4} />
    <path d="M -60 140 L 60 140" stroke={P.red} strokeWidth={12} strokeLinecap="round" />
  </g>
);

const SugarBowl: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -110 0 Q -120 120 0 130 Q 120 120 110 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <ellipse cx={0} cy={0} rx={112} ry={26} fill="#F4F4F4" stroke={INK} strokeWidth={7} />
    <path d="M -50 40 Q 0 60 50 40" fill="none" stroke={P.pink} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const Desk: React.FC<{ readonly y: number }> = ({ y }) => (
  <g>
    <rect x={-300} y={y} width={1700} height={50} fill={L.wood} stroke={INK} strokeWidth={8} />
    <rect x={-300} y={y + 50} width={1700} height={900} fill={L.woodDark} stroke={INK} strokeWidth={8} />
  </g>
);

const Calendar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly circled: number }> = ({ x, y, s = 1, circled }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-210} y={-260} width={420} height={480} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <rect x={-210} y={-260} width={420} height={90} rx={16} fill={P.red} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 35 }).map((_, k) => {
      const cx = -180 + (k % 7) * 60 + 30;
      const cy = -140 + Math.floor(k / 7) * 70 + 30;
      const sun = k % 7 === 6;
      const show = sun && Math.floor(k / 7) < circled;
      return (
        <g key={k}>
          <rect x={cx - 18} y={cy - 18} width={36} height={36} rx={6} fill="#E7ECF5" />
          {show ? <circle cx={cx} cy={cy} r={28} fill="none" stroke={P.red} strokeWidth={8} /> : null}
        </g>
      );
    })}
  </g>
);

const Photo: React.FC<{ readonly x: number; readonly y: number; readonly dadS: number; readonly r?: number }> = ({ x, y, dadS, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-210} y={-260} width={420} height={500} rx={10} fill="#E6B65C" stroke={INK} strokeWidth={10} />
    <rect x={-180} y={-230} width={360} height={440} fill="#F3E2C0" />
    <g transform="translate(0 200) scale(0.62)">
      <Linda x={-130} y={0} s={0.72} eyes="closed" mouth="grin" brows="up" armL={20} armR={40} bendR={60} />
      <Dad x={130} y={0} s={0.72 * dadS} eyes="open" look={[-0.5, 0]} mouth={dadS > 0.6 ? "smile" : "frown"} brows={dadS > 0.6 ? "neutral" : "sad"} armL={30} armR={20} />
    </g>
    <rect x={-180} y={-230} width={360} height={440} fill="#C08A3A" opacity={0.18} />
  </g>
);

/** Augen-Sterne beim Kopfstoß */
const Stars: React.FC<{ readonly x: number; readonly y: number; readonly t: number }> = ({ x, y, t }) =>
  t < 0 || t > 40 ? null : (
    <g opacity={clamp01(1 - t / 40)}>
      {[0, 1, 2].map((k) => {
        const a = t * 0.2 + (k * Math.PI * 2) / 3;
        return <path key={k} transform={`translate(${x + Math.cos(a) * 120} ${y + Math.sin(a) * 40})`} d="M 0 -26 L 8 -8 L 26 0 L 8 8 L 0 26 L -8 8 L -26 0 L -8 -8 Z" fill={P.bus} stroke={INK} strokeWidth={4} />;
      })}
    </g>
  );

/** Zahnstocher-Gabel (Ursprung = Griff) */
const Fork: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-6} y={-150} width={12} height={150} rx={6} fill="#E8C690" stroke={INK} strokeWidth={4} />
    <path d="M -20 -150 L -20 -200 M 0 -150 L 0 -205 M 20 -150 L 20 -200 M -20 -150 L 20 -150" stroke="#9AA3B5" strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Rice: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <ellipse cx={x} cy={y} rx={34 * s} ry={16 * s} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
);

/** Riesige Tischkulisse im Makro (Teller, Glas) */
const MacroTable: React.FC<{ readonly f: number }> = () => (
  <g>
    <rect x={-1500} y={-1500} width={4000} height={2900} fill={L.wall2} />
    <rect x={-1500} y={1400} width={4000} height={1500} fill={L.cloth} />
    {Array.from({ length: 16 }).map((_, k) => (
      <rect key={k} x={-1500 + k * 260} y={1400} width={130} height={1500} fill={L.check} opacity={0.5} />
    ))}
    <ellipse cx={-120} cy={1330} rx={520} ry={120} fill="#FFFFFF" stroke={INK} strokeWidth={10} opacity={0.9} />
    <rect x={950} y={300} width={300} height={1100} rx={40} fill="#CFF0FF" stroke={INK} strokeWidth={10} opacity={0.75} />
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

export const LHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("One", 0.45) - 3, W("inch", 0.8) - 5], d, f);
  if (i === 0) {
    // Angler „THIS big“ mit Mini-Fisch – schrumpft ab Bild 6 sichtbar (Bewegung + Regel ab Bild 1)
    const at = Math.min(8, Math.max(4, W("lie", 0.2) - 6));
    const sh = ease(lf, at, at + 9);
    const s = lerp(0.95, 0.72, sh);
    const cam = frameOn(660, 1130, 540, lerp(840, 870, ease(lf, 0, len)), lerp(1.85, 1.95, ease(lf, 0, len)));
    const top = 1450 - 521 * s;
    return (
      <Shot cam={{ ...cam, y: cam.y + jolt(lf, at + 4, 10) }}>
        <Layer depth={0.7}>
          <Pier />
          <Chart x={400} y0={1450} y1={700} mark={top} />
        </Layer>
        <Layer>
          <Person x={600} y={1450} s={s} shirt="#3FB86B" pants="#2B3A67" hair="side" hairColor="#6B3A1E" eyes={sh > 0.4 ? "wide" : "squint"} brows={sh > 0.4 ? "up" : "neutral"} mouth={sh > 0.4 ? "o" : "grin"} open={0.5} armL={100} armR={95} bendL={-10} bendR={-25} gest={4} />
          <Rod hx={600 + 190 * s} hy={1450 - 300 * s} tx={870} ty={1450 - 700 * s} fy={1450 - 470 * s} fishS={0.42} f={lf} />
          <Poof x={600} y={1450 - 300 * s} t={lf - at - 2} s={0.7} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Tief: Angler kniehoch, Fisch auf den Planken so groß wie sein Kopf, starrt ihn an
    return (
      <Shot cam={{ ...frameOn(570, 1330, 540, 1000, 2.0), y: frameOn(570, 1330, 540, 1000, 2.0).y + jolt(lf, 0, 8) }}>
        <Layer depth={0.7}>
          <Pier />
        </Layer>
        <Layer>
          <Person x={420} y={1450} s={0.38} shirt="#3FB86B" pants="#2B3A67" hair="side" hairColor="#6B3A1E" eyes="open" look={[1, 0]} brows="worried" mouth="frown" armL={20} armR={40} bendR={-60} gest={6} />
          <Fish x={720} y={1400} s={0.75} look={-1} flop={Math.sin(lf * 0.9) * 4} />
          <Sweat x={480} y={1180} s={0.9} o={clamp01((lf - 8) / 6)} />
        </Layer>
      </Shot>
    );
  }
  // ECU: Maßband schnappt einen Zoll zurück
  const snap = ease(lf, 4, 9);
  return (
    <Shot cam={{ x: 540, y: 900 + jolt(lf, 9, 10), zoom: 1 }}>
      <Layer depth={0}>
        <rect x={-500} y={-500} width={2100} height={2900} fill="#FFE1C2" />
        {Array.from({ length: 8 }).map((_, k) => (
          <rect key={k} x={-200 + k * 200} y={-500} width={90} height={2900} fill="#FFFFFF" opacity={0.25} />
        ))}
      </Layer>
      <Layer>
        <Measure x={330} y={900} s={1.4} ext={lerp(480, 440, snap)} />
        <Burst x={330 + 1.4 * lerp(480, 440, snap)} y={900} r0={70} r1={120} n={8} o={bump(lf, 10, 6)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const LRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Dating", 0.35) - 4, W("And", 0.7) - 4], d, f);
  if (i === 0) {
    // Autohaus: knöchelhoher Verkäufer auf dem Reifen, Kunde schaut hinunter
    const cam = camPath(lf, [
      [0, { x: 560, y: 1150, zoom: 1.1 }],
      [len, { x: 520, y: 1180, zoom: 1.25 }],
    ]);
    return (
      <Shot cam={cam}>
        <Layer depth={0.6}>
          <Sky id="lot" a="#7FD0FF" b="#E2F6FF" />
          <rect x={-1500} y={1420} width={4000} height={1500} fill="#8A90A6" />
          <Bunting y={420} f={lf} />
        </Layer>
        <Layer>
          <Car x={380} y={1500} s={0.95} />
          <Person x={380} y={1142} s={0.3} shirt="#2B2B3A" suit pants="#2B2B3A" hair="side" hairColor="#1B1210" eyes="open" look={[1, -1]} brows="up" mouth="talk" open={0.5 + 0.5 * Math.sin(lf * 0.9)} armL={160} armR={130} bendR={-30} gest={14} />
          <Person x={880} y={1500} s={0.95} shirt={P.teal} pants="#3B3F66" hair="bun" hairColor="#3A2618" skin={P.skin3} eyes="open" look={[-1, 1]} brows="worried" mouth="flat" armL={10} armR={25} bendR={70} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Café: Frau schaut hinunter, Mini-Date winkt von der Zuckerdose, daneben das Profilbild
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.05 }], [len, { x: 560, y: 1010, zoom: 1.12 }]])}>
        <Layer depth={0.75}>
          <Room wall="#C8F0D8" floor={1700} window />
        </Layer>
        <Layer>
          <Person x={300} y={1380} s={0.95} seated shirt={P.purple} skin={P.skin} hair="pony" hairColor="#C2410C" eyes="open" look={[1, 1]} brows="up" mouth="flat" armL={20} armR={60} bendR={70} />
          <Table y={1400} />
          <SugarBowl x={720} y={1300} s={1} />
          <Person x={720} y={1300} s={0.13} shirt={P.orange} hair="spiky" hairColor="#1B1210" eyes="open" mouth="grin" armL={20} armR={170} gest={30} />
          <Phone x={900} y={1180} s={0.8} r={8} />
        </Layer>
      </Shot>
    );
  }
  // Vogelhaus: daumengroßer Angler winkt aus dem runden Loch, Vogel auf dem Dach ärgert sich
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 900, zoom: 1.0 }], [len, { x: 540, y: 820, zoom: 1.9 }]])}>
      <Layer depth={0.5}>
        <Sky id="bird" a="#6FC8FF" b="#D9F4FF" />
        <circle cx={-80} cy={500} r={360} fill="#6CCB5F" stroke={INK} strokeWidth={8} />
        <circle cx={1150} cy={650} r={420} fill="#5AB84E" stroke={INK} strokeWidth={8} />
        <rect x={-1500} y={1500} width={4000} height={1500} fill="#7DD36B" />
      </Layer>
      <Layer>
        <Birdhouse x={540} y={1000} s={1.15} />
        <Person x={540} y={850} s={0.13} shirt="#3FB86B" hair="side" hairColor="#6B3A1E" eyes="open" mouth="smile" armL={20} armR={160} gest={30} />
        <line x1={555} y1={810} x2={700} y2={720} stroke="#5A3418" strokeWidth={5} />
        <Bird x={640} y={470} s={0.9} angry />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* dave                                                               */
/* ================================================================== */

export const LDave: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Not", 0.72) - 4], d, f);
  if (i === 0) {
    // Flur: Dave duckt sich unter dem Türrahmen und stößt sich trotzdem den Kopf
    const walk = ease(lf, 0, Math.min(len - 10, 40));
    const hit = 26;
    const x = lerp(-80, 560, walk);
    return (
      <Shot cam={{ x: 540 + jolt(lf, hit, 14), y: 900, zoom: 0.92 }}>
        <Layer depth={0.8}>
          <Room wall="#D7D2FF" floor={1600} />
          <rect x={160} y={820} width={110} height={780} fill={L.wood} stroke={INK} strokeWidth={8} />
          <rect x={760} y={820} width={110} height={780} fill={L.wood} stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          <Dave x={x} y={1600} s={1.4} lean={lf < hit ? 6 : 2} nod={lf < hit ? 14 : -6} eyes={lf >= hit && lf < hit + 18 ? "closed" : "open"} brows={lf >= hit ? "sad" : "neutral"} mouth={lf >= hit && lf < hit + 18 ? "frown" : "smile"} armL={lf >= hit ? 150 : 12} bendL={lf >= hit ? 70 : 10} armR={14} bendR={10} gest={lf < hit ? 10 : 0} />
        </Layer>
        <Layer depth={1.05}>
          <rect x={60} y={720} width={920} height={110} fill={L.wood} stroke={INK} strokeWidth={8} />
          <Stars x={x} y={760} t={lf - hit} />
        </Layer>
      </Shot>
    );
  }
  // Büro: winziger (lügender) Chef auf dem Schreibtisch tobt, Dave sagt die Wahrheit
  const cam = camPath(lf, [
    [0, { x: 540, y: 1150, zoom: 1.0 }],
    [len, { x: 620, y: 1170, zoom: 1.3 }],
  ]);
  return (
    <Shot cam={cam}>
      <Layer depth={0.75}>
        <Room wall="#CDE7FF" floor={1700} window />
      </Layer>
      <Layer>
        <Dave x={280} y={1700} s={1.15} eyes="open" look={[1, 0.6]} brows="neutral" mouth="talk" open={0.4 + 0.4 * Math.sin(lf * 0.8)} armL={12} bendL={20} armR={70} bendR={60} gest={10} />
        <Desk y={1350} />
        <Person x={780} y={1350} s={0.27} suit shirt="#2B2B3A" pants="#2B2B3A" hair="none" hairColor="#000" skin="#FF8A7A" eyes="squint" brows="angry" mouth="scream" open={0.6} armL={150 + 15 * Math.sin(lf * 0.7)} armR={150 - 15 * Math.sin(lf * 0.7)} bendL={-40} bendR={-40} />
        <rect x={880} y={1260} width={110} height={90} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* stakes                                                             */
/* ================================================================== */

export const LStakes: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("She", 0.42) - 4, W("One", 0.6) - 4], d, f);
  if (i === 0 || i === 2) {
    // Veranda in der Dämmerung: Dave zupft den Kragen, Mia klingelt; später (i=2) schluckt Dave
    const lfx = i === 0 ? lf : lf + 40;
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 980, zoom: i === 0 ? 0.95 : 1.25 }], [len, { x: 540, y: 960, zoom: i === 0 ? 1.03 : 1.38 }]])}>
        <Layer depth={0.7}>
          <Sky id="dusk" a="#5B4BB5" b="#FF9E7A" />
          <rect x={-1500} y={420} width={4000} height={1300} fill="#E8B07A" stroke={INK} strokeWidth={8} />
          <rect x={-1500} y={1600} width={4000} height={1500} fill="#9A6A4A" />
          <Door x={540} y={1600} open={0} />
          <circle cx={900} cy={760} r={40} fill="#FFF3B0" stroke={INK} strokeWidth={6} />
          <circle cx={900} cy={760} r={110} fill="#FFF3B0" opacity={0.35} />
        </Layer>
        <Layer>
          <Mia x={260} y={1640} s={0.95} eyes="open" look={[1, -0.4]} mouth="smile" armL={12} armR={75} bendR={-20} />
          <Dave x={760} y={1640} s={1.22} eyes={i === 2 ? "wide" : "open"} look={[0, 0.3]} brows="worried" mouth={i === 2 ? "flat" : "smile"} armL={lfx > 30 ? 20 : 150} bendL={70} armR={150} bendR={95} gest={4} />
          {i === 2 ? <Sweat x={860} y={830} s={1.1} o={1} /> : null}
        </Layer>
      </Shot>
    );
  }
  // Küche ECU: grauer Brei blubbert, ein Auge öffnet sich
  const eye = ease(lf, len * 0.45, len * 0.45 + 8);
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.2 }], [len, { x: 560, y: 980, zoom: 1.45 }]])}>
      <Layer depth={0.8}>
        <Room wall="#FFD9A8" floor={1450} />
        <rect x={-300} y={1250} width={1700} height={260} fill="#5B5F73" stroke={INK} strokeWidth={8} />
      </Layer>
      <Layer>
        <Casserole x={540} y={1150} s={1.4} f={lf} eye={eye} look={Math.sin(lf * 0.2)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* sweater                                                            */
/* ================================================================== */

export const LSweater: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Dave", 0.45) - 4, W("brave", 0.82) - 8], d, f);
  if (i === 0) {
    // Tür geht auf: Linda im riesigen Katzenpulli, strahlt mit offenen Armen
    const open = ease(lf, 0, 8);
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1060, zoom: 1.05 }], [len, { x: 540, y: 1000, zoom: 1.2 }]])}>
        <Layer depth={0.8}>
          <rect x={-1500} y={-1500} width={4000} height={4000} fill="#E8B07A" />
          <rect x={-1500} y={1650} width={4000} height={1500} fill="#9A6A4A" />
        </Layer>
        <Layer>
          <Door x={540} y={1650} open={open} warm />
          <Linda x={540} y={1650} s={1.25 * (0.8 + 0.2 * open)} eyes="closed" brows="up" mouth="grin" armL={lerp(10, 120, open)} armR={lerp(10, 120, open)} bendL={-30} bendR={-30} gest={8} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah Dave: starrt auf den Pulli, Auge zuckt, Schweiß
    return (
      <Shot cam={frameOn(540, 1042, 540, 760, 1.6)}>
        <Layer depth={0.8}>
          <rect x={-1500} y={-1500} width={4000} height={4000} fill="#5B4BB5" />
        </Layer>
        <Layer>
          <Dave x={540} y={1500} s={1.1} f={lf} eyes="twitch" look={[0, 1]} brows="worried" mouth="flat" armL={10} armR={10} />
          <Sweat x={680} y={800} s={1.2} o={clamp01((lf - 6) / 6)} />
        </Layer>
      </Shot>
    );
  }
  // Zwei-Shot: Dave bleibt gleich groß (Strich an der Türzarge), Linda zieht die Braue hoch
  const talk = lf < 18;
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 0.98 }], [len, { x: 540, y: 1010, zoom: 1.05 }]])}>
      <Layer depth={0.8}>
        <rect x={-1500} y={-1500} width={4000} height={4000} fill="#FFE6A3" />
        <rect x={-1500} y={1650} width={4000} height={1500} fill="#B9774A" />
        <Chart x={540} y0={1650} y1={720} mark={1650 - 521 * 1.22} />
      </Layer>
      <Layer>
        <Linda x={260} y={1650} s={1.05} eyes="squint" look={[1, 0]} brows="angry" mouth="flat" armL={30} armR={40} bendL={110} bendR={110} />
        <Dave x={800} y={1650} s={1.22} eyes="open" look={[-1, 0]} brows="up" mouth={talk ? "talk" : "smile"} open={talk ? 0.4 + 0.4 * Math.sin(lf * 0.9) : 0} armL={60} bendL={50} armR={14} gest={10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* casserole                                                          */
/* ================================================================== */

export const LCasserole: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Is", 0.45) - 4, W("Dave", 0.58) - 4, W("Technically", 0.85) - 4], d, f);
  if (i === 0 || i === 1) {
    // Tisch: Linda stellt den grauen Auflauf ab; er blubbert, ein Auge blinzelt; dann beugt sie sich: „Is it good?“
    const down = ease(lf, 0, 12);
    const blinkAt = W("blinks", 0.35);
    const eye = i === 0 ? (f < blinkAt - 2 ? 0 : f < blinkAt + 4 ? 1 : f < blinkAt + 8 ? 0.1 : 1) : 1;
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: i === 0 ? 1050 : 980, zoom: i === 0 ? 1.0 : 1.25 }], [len, { x: 540, y: i === 0 ? 1080 : 960, zoom: i === 0 ? 1.12 : 1.32 }]])}>
        <Layer depth={0.8}>
          <Room wall="#FFD9A8" floor={1700} window night />
        </Layer>
        <Layer>
          <Linda x={540} y={1500} s={1.05} eyes={i === 0 ? "closed" : "open"} look={[0, 0.5]} brows="up" mouth={i === 0 ? "grin" : "smug"} armL={60} armR={60} bendL={-40} bendR={-40} lean={i === 1 ? 6 : 0} />
          <Table y={1380} />
          <Casserole x={540} y={lerp(1150, 1330, down)} s={0.9} f={lf} eye={eye} look={-0.6} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Nah Dave kaut: Backen voll, Tränen in den Augen
    const chew = Math.sin(lf * 0.6);
    return (
      <Shot cam={{ ...frameOn(540, 1247, 540, 760, 1.55), y: frameOn(540, 1247, 540, 760, 1.55).y + jolt(lf, 0, 6) }}>
        <Layer depth={0.8}>
          <Room wall="#FFD9A8" floor={1700} />
        </Layer>
        <Layer>
          <Dave x={540} y={1650} s={1.2} seated eyes="squint" brows="sad" mouth="pucker" armL={40} bendL={120} armR={10} nod={chew * 3} />
          <circle cx={455} cy={1295 + chew * 5} r={36} fill={P.skin} stroke={INK} strokeWidth={6} />
          <circle cx={625} cy={1295 - chew * 5} r={36} fill={P.skin} stroke={INK} strokeWidth={6} />
          <Sweat x={495} y={1245} s={0.5} o={clamp01((lf - 10) / 8)} />
          <Sweat x={585} y={1245} s={0.5} o={clamp01((lf - 14) / 8)} />
          <Table y={1500} />
        </Layer>
      </Shot>
    );
  }
  // Zwei-Shot: Linda beugt sich misstrauisch vor; Dave bleibt groß
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1150, zoom: 1.0 }], [len, { x: 540, y: 1140, zoom: 1.08 }]])}>
      <Layer depth={0.8}>
        <Room wall="#FFD9A8" floor={1700} window night />
      </Layer>
      <Layer>
        <Linda x={250} y={1640} s={1.05} seated eyes="squint" look={[1, 0]} brows="angry" mouth="flat" lean={lerp(0, 12, ease(lf, 0, 15))} armL={20} armR={80} bendR={60} />
        <Dave x={800} y={1640} s={1.25} seated eyes="open" look={[-1, 0]} brows="up" mouth="smile" armL={12} armR={12} gest={5} />
        <Table y={1450} />
        <Casserole x={540} y={1400} s={0.6} f={lf} eye={1} look={1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* dad                                                                */
/* ================================================================== */

export const LDad: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Two", 0.3) - 4, W("Thirty", 0.66) - 4], d, f);
  if (i === 0) {
    // Dave schaut verwirrt auf den Tisch hinunter
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1220, 540, 760, 1.3)], [len, frameOn(540, 1220, 540, 800, 1.4)]])}>
        <Layer depth={0.8}>
          <Room wall="#FFD9A8" floor={1700} window night />
        </Layer>
        <Layer>
          <Dave x={540} y={1640} s={1.25} seated eyes="open" look={[0.3, 1]} brows="up" mouth="o" nod={10} armL={20} armR={60} bendR={80} />
          <Table y={1450} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Makro: 2-Zoll-Vater sitzt auf dem Salzstreuer, isst ein Reiskorn, nickt müde
    const nod = Math.sin(lf * 0.18) * 6;
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.0 }], [len, { x: 540, y: 900, zoom: 1.2 }]])}>
        <Layer depth={0.6}>
          <MacroTable f={lf} />
        </Layer>
        <Layer>
          <Shaker x={540} y={760} s={0.85} />
          <Dad x={540} y={740} s={0.62} seated eyes="half" look={[0, 0.3]} brows="sad" mouth="flat" nod={nod} armL={30} armR={70} bendR={-50} />
          <Rice x={640} y={520} s={1.2} />
          <Fork x={650} y={640} r={20} s={0.7} />
        </Layer>
      </Shot>
    );
  }
  // Fotowand (Rückblick): der Vater schrumpft von Foto zu Foto
  const pan = ease(lf, 0, len, "inOut");
  return (
    <Shot cam={{ x: lerp(330, 1580, pan), y: 900, zoom: 1.35 }}>
      <Layer depth={0.9}>
        <rect x={-1500} y={-1500} width={5000} height={4000} fill="#E9D3B0" />
        {Array.from({ length: 12 }).map((_, k) => (
          <rect key={k} x={-1000 + k * 300} y={-1500} width={120} height={4000} fill="#FFFFFF" opacity={0.15} />
        ))}
      </Layer>
      <Layer>
        {[1, 0.75, 0.5, 0.25, 0.08].map((ds, k) => (
          <Photo key={k} x={250 + k * 470} y={900 + (k % 2) * 60} dadS={ds} r={(k % 2 ? 3 : -3)} />
        ))}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* question (Höhepunkt)                                               */
/* ================================================================== */

export const LQuestion: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Yes", 0.3) - 3, W("Then", 0.55, 2) - 4, W("smiles", 0.82) - 4], d, f);
  if (i === 0 || i === 2) {
    // ECU Linda lehnt sich zur Kamera (i=2: Kalender mit jedem Sonntag rot umkringelt)
    const sunday = W("Sunday", 0.75);
    const circled = i === 2 ? Math.min(5, Math.max(0, Math.floor((f - sunday + 4) / 3))) : 0;
    return (
      <Shot cam={camPath(lf, [[0, frameOn(i === 2 ? 420 : 540, 1109, i === 2 ? 400 : 540, 780, 1.4)], [len, frameOn(i === 2 ? 420 : 540, 1109, i === 2 ? 400 : 540, 760, 1.6)]])}>
        <Layer depth={0.8}>
          <Room wall="#FFD9A8" floor={1700} />
          {i === 2 ? <Calendar x={720} y={900} s={0.6} circled={circled} /> : null}
        </Layer>
        <Layer>
          <Linda x={i === 2 ? 420 : 540} y={1650} s={1.3} eyes="squint" look={[0, 0]} brows="angry" mouth={i === 2 ? "smug" : "flat"} lean={4} armL={20} armR={20} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // „Yes.“ – Mia strahlt (Herzen), Dave bleibt groß
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1250, 540, 800, 1.08)], [len, frameOn(540, 1250, 540, 790, 1.16)]])}>
        <Layer depth={0.8}>
          <Room wall="#FFD9A8" floor={1700} window night />
          <Chart x={540} y0={1640} y1={760} mark={1640 - 440 * 1.25} />
        </Layer>
        <Layer>
          <Mia x={260} y={1640} s={0.95} seated eyes="closed" brows="up" mouth="grin" blush armL={150} bendL={-80} armR={150} bendR={-80} />
          <Hearts x={260} y={980} t={lf - 4} />
          <Dave x={780} y={1640} s={1.25} seated eyes="open" look={[-0.6, 0]} brows="neutral" mouth="smile" blush armL={14} armR={14} gest={4} />
          <Table y={1580} />
        </Layer>
      </Shot>
    );
  }
  // Dave mit erzwungenem Riesen-Grinsen, Schweiß, Auge zuckt
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1220, 540, 760, 1.5)], [len, frameOn(540, 1220, 540, 740, 1.75)]])}>
      <Layer depth={0.8}>
        <Room wall="#FFD9A8" floor={1700} />
      </Layer>
      <Layer>
        <Dave x={540} y={1640} s={1.25} seated f={lf} eyes="twitch" brows="worried" mouth="grin" armL={130} bendL={-20} armR={14} />
        <Sweat x={680} y={1130} s={1.0} o={1} />
        <Sweat x={400} y={1110} s={0.8} o={clamp01((lf - 8) / 6)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* turn                                                               */
/* ================================================================== */

export const LTurn: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Dave", 0.25) - 4], d, f);
  if (i === 0) {
    // Poof: Daves Stuhl ist leer, der Hoodie flattert hinunter, Mia + Linda erschrecken
    const poof = Math.max(2, W("Poof", 0.05) + 1);
    const gone = lf >= poof + 3;
    const hood = ease(lf, poof + 3, len);
    return (
      <Shot cam={{ x: 540, y: 1000 + jolt(lf, poof, 14), zoom: 1.0 }}>
        <Layer depth={0.8}>
          <Room wall="#FFD9A8" floor={1700} window night />
        </Layer>
        <Layer>
          <Linda x={180} y={1640} s={1.0} seated eyes="wide" brows="up" mouth="o" armL={30} armR={130} bendR={-40} />
          <Mia x={540} y={1640} s={0.9} seated eyes="wide" look={[1, 0]} brows="up" mouth="scream" open={0.5} armL={150} bendL={-60} armR={150} bendR={-60} />
          <rect x={760} y={1080} width={260} height={420} rx={20} fill={L.wood} stroke={INK} strokeWidth={8} />
          {gone ? null : <Dave x={890} y={1640} s={1.25} seated eyes="wide" mouth="grin" armL={14} armR={14} />}
          {gone ? (
            <g transform={`translate(${890 + Math.sin(hood * 8) * 40} ${lerp(820, 1300, hood)}) rotate(${Math.sin(hood * 6) * 20})`}>
              <path d="M -110 0 Q -120 -90 0 -100 Q 120 -90 110 0 L 90 160 L -90 160 Z" fill={L.dave} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            </g>
          ) : null}
          <Table y={1450} />
          <Poof x={890} y={1050} t={lf - poof} s={1.3} />
        </Layer>
      </Shot>
    );
  }
  // Makro: Mini-Dave landet neben Dad auf dem Salzstreuer, Dad reicht die Zahnstocher-Gabel
  const land = ease(lf, 0, 10);
  const give = ease(lf, W("hands", 0.5) - (d - len) - 2, W("hands", 0.5) - (d - len) + 10);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 600 + jolt(lf, 10, 10), 540, 720, 1.4)], [len, frameOn(540, 600, 540, 720, 1.55)]])}>
      <Layer depth={0.6}>
        <MacroTable f={lf} />
      </Layer>
      <Layer>
        <Shaker x={540} y={760} s={0.85} />
        <Dad x={400} y={740} s={0.55} seated eyes="half" look={[1, 0]} brows="neutral" mouth="smile" armL={20} armR={lerp(20, 95, give)} bendR={-10} />
        <Fork x={lerp(470, 560, give)} y={lerp(700, 660, give)} r={lerp(-20, 60, give)} s={0.55} />
        <Dave x={660} y={lerp(-200, 740, land)} s={0.55} seated eyes={land < 1 ? "wide" : "open"} look={[-1, 0]} brows="sad" mouth={land < 1 ? "scream" : "frown"} open={0.6} armL={land < 1 ? 170 : 20} armR={land < 1 ? 170 : 40} bendL={-30} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const LOutro: React.FC = () => {
  const { f, d } = useBeats();
  const raise = ease(f, d * 0.55, d * 0.55 + 10);
  return (
    <Shot cam={camPath(f, [[0, frameOn(540, 600, 540, 720, 1.6)], [d, frameOn(540, 600, 540, 700, 1.85)]])}>
      <Layer depth={0.6}>
        <MacroTable f={f} />
      </Layer>
      <Layer>
        <Shaker x={540} y={760} s={0.85} />
        <Dad x={420} y={740} s={0.55} seated eyes="squint" look={[0, 0]} brows={raise > 0.5 ? "angry" : "neutral"} mouth="flat" armL={20} armR={lerp(20, 120, raise)} bendR={-40} />
        <Dave x={660} y={740} s={0.55} seated eyes="open" look={[0, 0]} brows="worried" mouth="flat" armL={20} armR={20} />
        {raise > 0.05 ? <Measure x={470} y={lerp(560, 380, raise)} s={0.35} ext={lerp(0, 220, raise)} /> : null}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const LUEGEN_SCENES: Record<string, React.FC> = {
  hook: LHook,
  rules: LRules,
  dave: LDave,
  stakes: LStakes,
  sweater: LSweater,
  casserole: LCasserole,
  dad: LDad,
  question: LQuestion,
  turn: LTurn,
  outro: LOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(LUEGEN_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): nur Untertitel-Phrasen + Cover-Titel. */
export const LUEGEN_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

export const LUEGEN_SHOT_COUNT: Record<string, number> = { hook: 3, rules: 3, dave: 2, stakes: 3, sweater: 3, casserole: 4, dad: 3, question: 4, turn: 2, outro: 1 };
