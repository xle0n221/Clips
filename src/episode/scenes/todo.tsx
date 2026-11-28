import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/todo-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, CROWD, INK, P, Person, Sky, Sweat, Zzz } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";

/**
 * „In This City, You Die When Your To-Do List Is Done“ (episodes/todo-stadt.json) – 2D-Cartoon wie Lügen-Stadt,
 * schwarzer Humor: der Tod als gelangweilter Cartoon-Schädel im Hoodie. Jede Einstellung an Wort-Beats geschnitten;
 * eine Text-Ebene (Untertitel; Listen/Schilder nur als Gag), kein Set > 2 Einstellungen am Stück.
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

const T = {
  bone: "#F4EFDF",
  hood: "#2A2340",
  hoodHi: "#4A3F6B",
  dennis: "#2FA35A",
  wall: "#BFE8FF",
  wall2: "#FFE1C2",
  wall3: "#E4D6FF",
  wood: "#C47A45",
  woodDark: "#8C4F26",
  couch: "#E2513C",
  couchDark: "#A8331F",
  paper: "#FFFDF4",
  check: "#E8202E",
  grass: "#7ED957",
};
const FONT = "Montserrat";

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type DeathMood = "bored" | "happy" | "shock" | "neutral";
type DeathProps = {
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly seated?: boolean;
  readonly armL?: number;
  readonly armR?: number;
  readonly bendL?: number;
  readonly bendR?: number;
  readonly lean?: number;
  readonly flip?: boolean;
  readonly mood?: DeathMood;
  readonly look?: readonly [number, number];
  readonly open?: number;
  readonly scythe?: boolean;
  readonly nod?: number;
};

/** Der Tod: runder Cartoon-Schädel, schwarzer Hoodie, optional Sense (rechte Hand, nur bei bendR 0). */
const Death: React.FC<DeathProps> = ({ x, y, s = 1, seated, armL = 8, armR = 8, bendL = 0, bendR = 0, lean = 0, flip, mood = "bored", look = [0, 0], open = 0, scythe, nod = 0 }) => {
  const hy = seated ? -336 : -416;
  const fx = flip ? -1 : 1;
  const sh = (seated ? -250 : -330) + 40;
  const a = (armR * Math.PI) / 180;
  const hx = 78 + Math.sin(a) * 130;
  const hyy = sh + Math.cos(a) * 130;
  const r = 105;
  const sock = mood === "shock" ? [30, 38] : [26, 30];
  return (
    <g transform={`translate(${x} ${y}) scale(${fx * s} ${s}) rotate(${lean})`}>
      {scythe ? (
        <g>
          <line x1={hx} y1={hyy - 470} x2={hx} y2={hyy + 230} stroke="#7A4A22" strokeWidth={18} strokeLinecap="round" />
          <path d={`M ${hx} ${hyy - 470} Q ${hx - 160} ${hyy - 560} ${hx - 330} ${hyy - 430} Q ${hx - 170} ${hyy - 490} ${hx} ${hyy - 420} Z`} fill="#D8DEE8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        </g>
      ) : null}
      {/* Kapuze hinten */}
      <g transform={`translate(0 ${hy}) rotate(${nod})`}>
        <path d={`M ${-r * 1.28} ${r * 0.7} Q ${-r * 1.4} ${-r * 1.5} 0 ${-r * 1.42} Q ${r * 1.4} ${-r * 1.5} ${r * 1.28} ${r * 0.7} Z`} fill={T.hood} stroke={INK} strokeWidth={7} />
      </g>
      <Person x={0} y={0} seated={seated} shirt={T.hood} pants={T.hood} skin={T.bone} hair="none" eyes="closed" brows="none" mouth="flat" armL={armL} armR={armR} bendL={bendL} bendR={bendR} nod={nod} />
      <g transform={`translate(0 ${hy}) rotate(${nod})`}>
        {/* Kapuzen-Rand vorn (verdeckt Ohren) */}
        <path d={`M ${-r * 1.12} ${r * 0.62} A ${r * 1.12} ${r * 1.12} 0 1 1 ${r * 1.12} ${r * 0.62}`} fill="none" stroke={T.hood} strokeWidth={30} />
        <path d={`M ${-r * 1.27} ${r * 0.66} A ${r * 1.27} ${r * 1.27} 0 1 1 ${r * 1.27} ${r * 0.66}`} fill="none" stroke={INK} strokeWidth={6} />
        {/* Augenhöhlen */}
        {([-1, 1] as const).map((sd) => {
          const cx = sd * 38;
          const cy = -14;
          if (mood === "happy") {
            return <path key={sd} d={`M ${cx - 28} ${cy + 8} Q ${cx} ${cy - 34} ${cx + 28} ${cy + 8} Q ${cx} ${cy - 10} ${cx - 28} ${cy + 8} Z`} fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
          }
          return (
            <g key={sd}>
              <ellipse cx={cx} cy={cy} rx={sock[0]} ry={sock[1]} fill={INK} />
              <circle cx={cx + look[0] * 9} cy={cy + look[1] * 9 + (mood === "bored" ? 8 : 0)} r={mood === "shock" ? 6 : 8} fill="#FFFFFF" />
              {mood === "bored" ? <rect x={cx - sock[0] - 3} y={cy - sock[1] - 4} width={sock[0] * 2 + 6} height={sock[1] * 0.9} fill={T.bone} /> : null}
              {mood === "bored" ? <line x1={cx - sock[0]} x2={cx + sock[0]} y1={cy - sock[1] * 0.12} y2={cy - sock[1] * 0.12} stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
            </g>
          );
        })}
        <path d="M -9 22 L 9 22 L 0 38 Z" fill={INK} />
        {/* Zähne */}
        <rect x={-44} y={50} width={88} height={22 + open * 40} rx={8} fill={open > 0.05 ? INK : "#FFFFFF"} stroke={INK} strokeWidth={6} />
        <rect x={-44} y={50} width={88} height={22} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        {[-22, 0, 22].map((k) => (
          <line key={k} x1={k} x2={k} y1={50} y2={72} stroke={INK} strokeWidth={4} />
        ))}
        {mood === "happy" ? <path d="M -60 52 Q 0 100 60 52" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
      </g>
    </g>
  );
};

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Vest: React.FC = () => (
  <g>
    <path d="M -40 -330 L 0 -250 L 40 -330 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -9 -318 L 9 -318 L 13 -250 L 0 -232 L -13 -250 Z" fill={P.red} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);
const Glasses: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly seated?: boolean }> = ({ x, y, s = 1, seated }) => {
  const hy = y + (seated ? -336 : -416) * s;
  return (
    <g transform={`translate(${x} ${hy}) scale(${s})`}>
      <circle cx={-38} cy={-13} r={33} fill="none" stroke={INK} strokeWidth={8} />
      <circle cx={38} cy={-13} r={33} fill="none" stroke={INK} strokeWidth={8} />
      <line x1={-6} x2={6} y1={-16} y2={-16} stroke={INK} strokeWidth={7} />
    </g>
  );
};
const Dennis: React.FC<Fig & { readonly old?: boolean }> = ({ old, ...p }) => (
  <g>
    <Person pants="#2B3A67" {...p} shirt={T.dennis} hair="side" hairColor={old ? "#D9D9D9" : "#3A2A1A"} skin={P.skin} chest={<g transform={`translate(0 ${p.seated ? 80 : 0})`}><Vest /></g>} bags={old ? 0.9 : p.bags} />
    <Glasses x={p.x} y={p.y} s={p.s} seated={p.seated} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Requisiten                                                         */
/* ------------------------------------------------------------------ */

export const Poof: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number; readonly dark?: boolean }> = ({ x, y, t, s = 1, dark }) => {
  if (t < 0 || t > 22) return null;
  const k = clamp01(t / 22);
  const o = 1 - k * k;
  const c = dark ? "#5B4F7A" : "#FFFFFF";
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.5 + k * 0.9)})`} opacity={o}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 90} cy={Math.sin((a * Math.PI) / 180) * 70} r={70} fill={c} stroke={INK} strokeWidth={6} />
      ))}
      <circle r={90} fill={c} />
    </g>
  );
};

/** Haken (rot), k = 0..1 gezeichnet */
const Tick: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly k: number; readonly color?: string }> = ({ x, y, s = 1, k, color = T.check }) =>
  k <= 0 ? null : (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M -22 2 L -6 20 L 28 -26" fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(k)} />
  );

/** Liste auf Klemmbrett. ticks[i] = 0..1 Haken-Fortschritt; write = 0..1 Schreibfortschritt der letzten Zeile. */
const ListBoard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  readonly title?: string;
  readonly items: readonly string[];
  readonly ticks: readonly number[];
  readonly write?: number;
  readonly cover?: number;
  readonly clip?: boolean;
}> = ({ x, y, s = 1, r = 0, title = "TO DO", items, ticks, write = 1, cover = -1, clip = true }) => {
  const h = 150 + items.length * 78;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {clip ? <rect x={-170} y={-40} width={340} height={h + 40} rx={18} fill={T.woodDark} stroke={INK} strokeWidth={7} /> : null}
      <rect x={-148} y={-12} width={296} height={h} rx={6} fill={T.paper} stroke={INK} strokeWidth={6} />
      {clip ? <rect x={-60} y={-56} width={120} height={48} rx={10} fill="#B8BFD0" stroke={INK} strokeWidth={6} /> : null}
      <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>
        {title}
      </text>
      {items.map((it, k) => {
        const yy = 112 + k * 78;
        const last = k === items.length - 1;
        const w = last ? clamp01(write) : 1;
        return (
          <g key={`${it}-${k}`}>
            <rect x={-124} y={yy - 24} width={44} height={44} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
            <defs>
              <clipPath id={`lb-${k}-${Math.round(x)}-${Math.round(y)}`}>
                <rect x={-66} y={yy - 40} width={210 * w} height={60} />
              </clipPath>
            </defs>
            <text x={-64} y={yy + 12} fontFamily={FONT} fontWeight={800} fontSize={it.length > 9 ? 27 : 32} fill="#2A2A6A" clipPath={`url(#lb-${k}-${Math.round(x)}-${Math.round(y)})`}>
              {it}
            </text>
            {k === cover ? <ellipse cx={30} cy={yy} rx={110} ry={40} fill={P.skin} stroke={INK} strokeWidth={6} /> : null}
            <Tick x={-100} y={yy} k={ticks[k] ?? 0} />
          </g>
        );
      })}
    </g>
  );
};

const Pen: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number }> = ({ x, y, r = 30, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-10} y={-150} width={20} height={130} rx={8} fill="#3D7BFF" stroke={INK} strokeWidth={5} />
    <path d="M -10 -20 L 0 6 L 10 -20 Z" fill="#F2D6A8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

const Room: React.FC<{ readonly wall?: string; readonly floor?: number; readonly window?: boolean }> = ({ wall = T.wall2, floor = 1500, window }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={2000 + floor} fill={wall} />
    {[...Array(14)].map((_, k) => (
      <rect key={k} x={-1500 + k * 300} y={-2000} width={110} height={2000 + floor} fill="#FFFFFF" opacity={0.18} />
    ))}
    <rect x={-2000} y={floor} width={5000} height={2500} fill={T.wood} />
    <rect x={-2000} y={floor} width={5000} height={22} fill={T.woodDark} />
    {window ? (
      <g>
        <rect x={700} y={330} width={340} height={420} rx={14} fill="#9EDCFF" stroke={INK} strokeWidth={10} />
        <line x1={870} x2={870} y1={330} y2={750} stroke={INK} strokeWidth={8} />
      </g>
    ) : null}
  </g>
);

/** Couch: Rückenlehne (back) und Sitz/Armlehnen (front) getrennt, damit Figuren dazwischen sitzen. */
export const CouchBack: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly color?: string }> = ({ x, y, w = 760, color = T.couch }) => (
  <rect x={x - w / 2} y={y - 330} width={w} height={300} rx={60} fill={color} stroke={INK} strokeWidth={8} />
);
export const CouchFront: React.FC<{ readonly x: number; readonly y: number; readonly w?: number; readonly color?: string; readonly dark?: string }> = ({ x, y, w = 760, color = T.couch, dark = T.couchDark }) => (
  <g>
    <rect x={x - w / 2 + 40} y={y - 60} width={w - 80} height={140} rx={30} fill={color} stroke={INK} strokeWidth={8} />
    <rect x={x - w / 2 - 20} y={y - 190} width={110} height={290} rx={45} fill={dark} stroke={INK} strokeWidth={8} />
    <rect x={x + w / 2 - 90} y={y - 190} width={110} height={290} rx={45} fill={dark} stroke={INK} strokeWidth={8} />
    <rect x={x - w / 2 + 20} y={y + 80} width={30} height={50} fill={INK} />
    <rect x={x + w / 2 - 50} y={y + 80} width={30} height={50} fill={INK} />
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

const Ground: React.FC<{ readonly y?: number; readonly color?: string }> = ({ y = 1450, color = "#9AA3B5" }) => (
  <g>
    <rect x={-2000} y={y} width={5000} height={2500} fill={color} />
    <rect x={-2000} y={y} width={5000} height={18} fill={INK} opacity={0.25} />
  </g>
);

const House: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly a?: string; readonly half?: boolean; readonly door?: string }> = ({ x, y, s = 1, a = "#FF8FC7", half, door = "#2F8F6B" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-520} width={520} height={520} fill={half ? "#C9CED8" : a} stroke={INK} strokeWidth={8} />
    {half ? <rect x={-260} y={-520} width={260} height={520} fill={a} /> : null}
    {half ? <path d="M 0 -520 L 0 0" stroke={a} strokeWidth={24} strokeDasharray="30 22" /> : null}
    <rect x={-260} y={-520} width={520} height={520} fill="none" stroke={INK} strokeWidth={8} />
    <path d="M -300 -500 L 0 -760 L 300 -500 Z" fill="#5B4F7A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-60} y={-250} width={120} height={250} rx={10} fill={door} stroke={INK} strokeWidth={7} />
    <circle cx={35} cy={-120} r={9} fill={P.bus} />
    {[-170, 170].map((wx) => (
      <rect key={wx} x={wx - 60} y={-420} width={120} height={110} rx={8} fill="#BFE8FF" stroke={INK} strokeWidth={7} />
    ))}
  </g>
);

const Cobweb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={0.85}>
    {[0, 22, 45, 68, 90].map((a) => (
      <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 120} y2={Math.sin((a * Math.PI) / 180) * 120} stroke="#FFFFFF" strokeWidth={4} />
    ))}
    {[40, 75, 110].map((rr) => (
      <path key={rr} d={`M ${rr} 0 Q ${rr * 0.75} ${rr * 0.3} ${rr * 0.7} ${rr * 0.7} Q ${rr * 0.3} ${rr * 0.75} 0 ${rr}`} fill="none" stroke="#FFFFFF" strokeWidth={3} />
    ))}
  </g>
);

const Crossword: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly gap?: boolean }> = ({ x, y, s = 1, r = 0, gap = true }) => {
  const L = ["DOOMS", "R  NE", "EVERY", "AIL E", "DREAD"];
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x={-200} y={-200} width={400} height={400} fill={T.paper} stroke={INK} strokeWidth={8} />
      {L.map((row, j) =>
        row.split("").map((ch, i) => {
          const empty = gap && i === 4 && j === 4;
          const block = ch === " ";
          return (
            <g key={`${i}-${j}`}>
              <rect x={-200 + i * 80} y={-200 + j * 80} width={80} height={80} fill={block ? INK : empty ? "#FFF4A8" : "#FFFFFF"} stroke={INK} strokeWidth={4} />
              {!block && !empty ? (
                <text x={-160 + i * 80} y={-140 + j * 80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#2A2A6A">
                  {ch}
                </text>
              ) : null}
            </g>
          );
        }),
      )}
    </g>
  );
};

const Park: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Sky id="park" a="#7FD0FF" b="#E2F7FF" />
    <rect x={-2000} y={1250} width={5000} height={2500} fill={T.grass} />
    <path d="M -2000 1250 Q 540 1180 3000 1250" fill="#6CC747" />
    {[-150, 1200].map((tx) => (
      <g key={tx}>
        <rect x={tx - 30} y={700} width={60} height={560} fill={T.woodDark} stroke={INK} strokeWidth={7} />
        <circle cx={tx} cy={620} r={210} fill="#3FB86B" stroke={INK} strokeWidth={8} />
      </g>
    ))}
    <ellipse cx={300 + (f % 600) * 0.3} cy={300} rx={150} ry={50} fill="#FFFFFF" opacity={0.9} />
  </g>
);
const Bench: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 340} y={y - 300} width={680} height={40} rx={10} fill={T.wood} stroke={INK} strokeWidth={7} />
    <rect x={x - 340} y={y - 240} width={680} height={40} rx={10} fill={T.wood} stroke={INK} strokeWidth={7} />
    <rect x={x - 360} y={y - 20} width={720} height={44} rx={10} fill={T.wood} stroke={INK} strokeWidth={7} />
    {[-300, 300].map((k) => (
      <rect key={k} x={x + k - 14} y={y + 20} width={28} height={110} fill={INK} />
    ))}
  </g>
);

const Check: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t < 0) return null;
  const k = clamp01(t / 7);
  const sc = s * (k < 1 ? 0.4 + k * 0.75 : 1.08 - Math.min(0.08, (t - 7) * 0.02));
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`}>
      <circle r={110} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
      <Tick x={0} y={6} s={3} k={clamp01(t / 6)} />
    </g>
  );
};

export const Sparkle: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) =>
  t < 0 || t > 30 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * Math.sin(t * 0.4))}) rotate(${t * 4})`} opacity={clamp01(1 - t / 30)}>
      <path d="M 0 -60 L 14 -14 L 60 0 L 14 14 L 0 60 L -14 14 L -60 0 L -14 -14 Z" fill="#FFF07A" stroke={INK} strokeWidth={5} />
    </g>
  );

const Tear: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly side: 1 | -1 }> = ({ x, y, f, side }) => (
  <g>
    {[0, 1, 2].map((k) => {
      const t = ((f * 0.06 + k / 3) % 1 + 1) % 1;
      return <ellipse key={k} cx={x + side * t * 90} cy={y + t * t * 160} rx={14} ry={20} fill="#7FD6FF" stroke={INK} strokeWidth={4} opacity={1 - t} />;
    })}
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

const HOOK_ITEMS = ["BUY BREAD", "PAY RENT", "CALL MOM"] as const;

const HookCouchSet: React.FC = () => (
  <g>
    <Room wall={T.wall} window />
    <rect x={120} y={360} width={200} height={150} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <path d="M 140 490 L 200 420 L 240 460 L 270 430 L 300 490 Z" fill="#7ED957" stroke={INK} strokeWidth={4} />
  </g>
);

export const DHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("moment", 0.35) + 2, W("So", 0.62) - 3], d, f);
  if (i === 0) {
    // Bild 1: letzter Haken → POOF → Tod hinter der Couch (Regel stumm lesbar, Bewegung ab Bild 1)
    const tick = ease(lf, 2, 9);
    const rise = ease(lf, 9, 17);
    const cam = camPath(lf, [[0, frameOn(560, 1000, 540, 820, 1.28)], [len, frameOn(560, 990, 540, 820, 1.4)]]);
    return (
      <Shot cam={{ ...cam, y: cam.y + jolt(lf, 10, 12) }}>
        <Layer depth={0.7}>
          <HookCouchSet />
        </Layer>
        <Layer>
          <Death x={720} y={lerp(1520, 1240, rise)} s={0.95} mood={rise > 0.9 ? "neutral" : "shock"} look={[-1, 0.4]} armL={lerp(10, 125, ease(lf, 15, 22))} bendL={-35} scythe />
          <Poof x={720} y={1000} t={lf - 8} s={1.1} dark />
          <CouchBack x={540} y={1480} />
          <Person x={470} y={1420} seated s={1} shirt={P.orange} pants="#2B3A67" hair="spiky" hairColor="#3A2A1A" eyes={rise > 0.6 ? "wide" : "open"} look={rise > 0.6 ? [1, -0.3] : [0.4, 0.6]} brows={rise > 0.6 ? "up" : "neutral"} mouth={rise > 0.6 ? "scream" : "smile"} open={rise > 0.6 ? 0.7 : 0} armL={40} armR={35} bendL={-70} bendR={-60} />
          <ListBoard x={470} y={1190} s={0.55} r={-6} items={HOOK_ITEMS} ticks={[1, 1, tick]} />
          <Pen x={560 + bump(lf, 6, 5) * 10} y={1330} r={25} s={0.7} />
          <CouchFront x={540} y={1480} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nah: er kritzelt panisch eine neue Zeile, der Tod lässt die Schultern hängen
    const write = ease(lf, 2, 16, "linear");
    const sag = ease(lf, 14, 24);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(560, 1080, 540, 800, 1.75)], [len, frameOn(560, 1080, 540, 800, 1.9)]])}>
        <Layer depth={0.7}>
          <HookCouchSet />
        </Layer>
        <Layer>
          <Death x={740} y={1240} s={0.95} mood="bored" look={[-1, 0.6]} armL={lerp(110, 10, sag)} bendL={-20} armR={8} nod={lerp(0, 12, sag)} scythe />
          <CouchBack x={540} y={1480} />
          <Person x={470} y={1420} seated s={1} shirt={P.orange} pants="#2B3A67" hair="spiky" hairColor="#3A2A1A" eyes="wide" look={[0, 0.8]} brows="worried" mouth="frown" armL={40} armR={45} bendL={-70} bendR={-60} gest={6} />
          <Sweat x={560} y={960} o={1} />
          <ListBoard x={470} y={1150} s={0.62} r={-4} items={[...HOOK_ITEMS, "BUY MILK"]} ticks={[1, 1, 1, 0]} write={write} />
          <Pen x={470 - 60 + write * 120} y={1150 + 0.62 * 346 + Math.sin(lf * 1.7) * 6} r={25} s={0.75} />
          <CouchFront x={540} y={1480} />
        </Layer>
      </Shot>
    );
  }
  // Totale Straße: halb gestrichenes Haus, halbe Brücke, halb rasierter Mann; Tod gelangweilt an der Laterne
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 900, 1.0)], [len, frameOn(540, 1000, 540, 900, 1.08)]])}>
      <Layer depth={0.6}>
        <Sky id="hookst" a="#6FC8FF" b="#DDF4FF" />
        <path d="M -400 1000 Q -100 760 200 1000" fill="none" stroke="#8C94A8" strokeWidth={50} />
        <path d="M 900 1000 Q 1100 800 1250 860" fill="none" stroke="#8C94A8" strokeWidth={50} />
        <rect x={-500} y={1000} width={720} height={30} fill="#8C94A8" stroke={INK} strokeWidth={5} />
        <rect x={880} y={1000} width={700} height={30} fill="#8C94A8" stroke={INK} strokeWidth={5} />
        <House x={540} y={1250} s={0.8} a="#FF8FC7" half />
      </Layer>
      <Layer>
        <Ground y={1250} />
        <rect x={680} y={760} width={14} height={500} fill={T.woodDark} transform="rotate(12 690 1250)" />
        <Person x={280} y={1380} s={0.62} shirt={P.teal} hair="spiky" hairColor="#3A2A1A" eyes="half" mouth="flat" armL={10} armR={120} bendR={-90} chest={<ellipse cx={45} cy={-385} rx={70} ry={46} fill="#FFFFFF" stroke={INK} strokeWidth={5} />} />
        <rect x={895} y={860} width={18} height={420} fill={INK} />
        <circle cx={904} cy={850} r={30} fill="#FFF3B0" stroke={INK} strokeWidth={6} />
        <Death x={860} y={1290} s={0.55} mood="bored" look={[-1, 0.3]} lean={8} armL={10} armR={8} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

const Digger: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-220} y={-260} width={340} height={180} rx={20} fill={P.bus} stroke={INK} strokeWidth={8} />
    <rect x={-170} y={-400} width={170} height={150} rx={14} fill="#BFE8FF" stroke={INK} strokeWidth={8} />
    <path d="M 100 -220 L 300 -420 L 420 -260" fill="none" stroke={P.busDark} strokeWidth={40} strokeLinejoin="round" />
    <path d="M 400 -280 L 470 -200 L 380 -170 Z" fill="#8C94A8" stroke={INK} strokeWidth={7} />
    <rect x={-240} y={-90} width={380} height={90} rx={45} fill={INK} />
    <Cobweb x={100} y={-220} s={1.1} r={-60} />
    <Cobweb x={-170} y={-400} s={0.8} />
  </g>
);
const Barrier: React.FC<{ readonly x: number; readonly y: number; readonly w?: number }> = ({ x, y, w = 600 }) => (
  <g>
    <rect x={x - w / 2} y={y - 160} width={w} height={60} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    {Array.from({ length: Math.floor(w / 80) }).map((_, k) => (
      <path key={k} d={`M ${x - w / 2 + k * 80} ${y - 100} L ${x - w / 2 + k * 80 + 40} ${y - 160} L ${x - w / 2 + k * 80 + 80} ${y - 160} L ${x - w / 2 + k * 80 + 40} ${y - 100} Z`} fill={P.orange} />
    ))}
    <rect x={x - w / 2} y={y - 160} width={w} height={60} fill="none" stroke={INK} strokeWidth={7} />
    {[-w / 2 + 30, w / 2 - 30].map((k) => (
      <rect key={k} x={x + k - 12} y={y - 110} width={24} height={110} fill={INK} />
    ))}
  </g>
);
const PaperPile: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly s?: number }> = ({ x, y, n, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }).map((_, k) => (
      <rect key={k} x={-130 + Math.sin(k * 2.3) * 22} y={-k * 34 - 34} width={260} height={34} rx={4} fill={k % 3 === 0 ? "#FFF4C2" : T.paper} stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(k * 1.7) * 4} 0 ${-k * 34})`} />
    ))}
  </g>
);
const RockingChair: React.FC<{ readonly x: number; readonly y: number; readonly rock: number }> = ({ x, y, rock }) => (
  <g transform={`rotate(${rock} ${x} ${y + 60})`}>
    <rect x={x - 150} y={y - 420} width={300} height={360} rx={40} fill={T.woodDark} stroke={INK} strokeWidth={8} />
    <rect x={x - 170} y={y - 40} width={340} height={50} rx={14} fill={T.wood} stroke={INK} strokeWidth={8} />
    <path d={`M ${x - 230} ${y + 40} Q ${x} ${y + 140} ${x + 230} ${y + 40}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
  </g>
);
const Balloons: React.FC<{ readonly x: number; readonly y: number; readonly f: number }> = ({ x, y, f }) => (
  <g>
    {["2", "1", "2"].map((ch, k) => {
      const bx = x + k * 120;
      const by = y + Math.sin(f * 0.08 + k) * 10;
      return (
        <g key={k}>
          <line x1={bx} y1={by + 80} x2={x + 120} y2={y + 360} stroke={INK} strokeWidth={3} />
          <ellipse cx={bx} cy={by} rx={62} ry={78} fill={[P.red, P.purple, P.teal][k]} stroke={INK} strokeWidth={6} />
          <text x={bx} y={by + 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill="#FFFFFF" stroke={INK} strokeWidth={5} paintOrder="stroke">
            {ch}
          </text>
        </g>
      );
    })}
  </g>
);

export const DRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Grandma", 0.25) - 3, W("On", 0.6) - 3, W("Productivity", 0.72) - 3], d, f);
  if (i === 0) {
    // Baustelle seit Ewigkeiten: Arbeiter schlafen auf Schaufeln, Spinnweben am Bagger
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 900, 1.05)], [len, frameOn(600, 1050, 540, 900, 1.15)]])}>
        <Layer depth={0.6}>
          <Sky id="road" a="#FFC27A" b="#FFF0D6" />
          <Ground y={1300} color="#5B5F73" />
          <path d="M -2000 1360 L 3000 1360" stroke="#FFFFFF" strokeWidth={16} strokeDasharray="90 70" />
          <Digger x={720} y={1300} s={0.9} />
        </Layer>
        <Layer>
          <ellipse cx={300} cy={1330} rx={260} ry={40} fill="#8C5A3A" stroke={INK} strokeWidth={6} />
          {[180, 440].map((px, k) => (
            <g key={px}>
              <line x1={px + 60} y1={1340} x2={px + 30} y2={980} stroke="#7A4A22" strokeWidth={14} />
              <Person x={px} y={1340} s={0.55} cap shirt={P.orange} pants="#2B3A67" hair="none" hairColor="#000" eyes="closed" mouth="drool" open={0.3} lean={k ? -10 : 10} armL={20} armR={150} bendR={-40} stache={k === 1} />
              <Zzz x={px + 40} y={1340 - 520 * 0.55} t={lf + k * 15} s={0.8} />
            </g>
          ))}
          <Barrier x={560} y={1470} w={760} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Uroma Edna (212) im Schaukelstuhl neben dem Steuer-Berg
    return (
      <Shot cam={camPath(lf, [[0, frameOn(500, 1050, 540, 880, 1.15)], [len, frameOn(500, 1040, 540, 880, 1.25)]])}>
        <Layer depth={0.7}>
          <Room wall={T.wall3} />
          <Balloons x={600} y={420} f={lf} />
        </Layer>
        <Layer>
          <PaperPile x={830} y={1500} n={26} s={1} />
          <RockingChair x={400} y={1440} rock={Math.sin(lf * 0.12) * 4} />
          <Person x={400} y={1400} s={0.95} seated shirt={P.cream} cardigan hair="bun" hairColor="#F2F2F2" skin="#F2C7A5" eyes="half" bags={1} brows="neutral" mouth="flat" armL={15} armR={60} bendR={-50} lean={Math.sin(lf * 0.12) * 4} />
          <Cobweb x={250} y={1000} s={0.7} r={180} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // „On purpose.“ Nah: Edna zwinkert verschlagen (Comic-Fläche)
    const wink = bump(lf, 6, 8);
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 820, 1.8), y: frameOn(540, 1000, 540, 820, 1.8).y + jolt(lf, 5, 8) }}>
        <Layer depth={0}>
          <ReactBg a="#FFD23F" b="#FFE680" f={lf} cx={540} cy={820} />
        </Layer>
        <Layer>
          <Person x={540} y={1340} s={1} seated shirt={P.cream} cardigan hair="bun" hairColor="#F2F2F2" skin="#F2C7A5" eyes={wink > 0.3 ? "squint" : "half"} bags={1} brows="angry" mouth="smug" look={[1, 0]} armL={15} armR={150} bendR={-110} />
          <Sparkle x={640} y={880} t={lf - 6} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  // Seminar: Coach hakt den letzten Punkt ab – Tod in Reihe 1 steht mit Popcorn auf
  const tick = ease(lf, W("seminar", 0.7) - (d - len) - 6, W("seminar", 0.7) - (d - len) + 2);
  const up = ease(lf, W("seminar", 0.7) - (d - len), W("seminar", 0.7) - (d - len) + 8);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.0)], [len, frameOn(540, 1000, 540, 860, 1.1)]])}>
      <Layer depth={0.6}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#3A2F6B" />
        <rect x={-2000} y={1150} width={5000} height={2500} fill="#7A3FB0" stroke={INK} strokeWidth={8} />
        <rect x={330} y={330} width={600} height={430} rx={18} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
        <text x={630} y={420} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>
          FINISH IT ALL!
        </text>
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={400} y={470 + k * 90} width={56} height={56} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
            <rect x={480} y={485 + k * 90} width={360} height={26} rx={13} fill="#C9CED8" />
            <Tick x={428} y={498 + k * 90} s={1.1} k={k < 2 ? 1 : tick} />
          </g>
        ))}
      </Layer>
      <Layer>
        <Person x={200} y={1150} s={0.85} suit shirt="#2B2240" pants="#2B2240" hair="spiky" hairColor="#F2B53A" eyes={up > 0.4 ? "wide" : "open"} brows={up > 0.4 ? "up" : "angry"} mouth={up > 0.4 ? "o" : "grin"} open={0.6} look={up > 0.4 ? [1, 1] : [1, 0]} armL={20} armR={lerp(140, 100, tick)} bendR={-20} gest={up > 0.4 ? 0 : 8} />
        {[-60, 180, 900, 1140].map((hx, k) => (
          <circle key={hx} cx={hx} cy={1560 + (k % 2) * 30} r={110} fill="#2B2240" stroke={INK} strokeWidth={6} />
        ))}
        <Death x={560} y={lerp(1640, 1300, up)} s={0.75} seated={up < 0.5} mood={up > 0.5 ? "happy" : "bored"} look={[-1, -0.6]} armL={lerp(60, 120, up)} bendL={-80} armR={lerp(60, 160, up)} bendR={-30} />
        <g transform={`translate(${450} ${lerp(1500, 1000, up)})`}>
          <path d="M -50 0 L 50 0 L 38 120 L -38 120 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          {[-36, -12, 12, 36].map((k) => (
            <rect key={k} x={k - 8} y={0} width={14} height={120} fill={P.red} opacity={0.8} />
          ))}
          {[-30, 0, 30, -14, 16].map((k, n) => (
            <circle key={n} cx={k} cy={-12 - (n > 2 ? 22 : 0)} r={20} fill="#FFF4C2" stroke={INK} strokeWidth={4} />
          ))}
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* death                                                              */
/* ================================================================== */

export const DDeath: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("crosswords", 0.45) - 4], d, f);
  if (i === 0) {
    // Park: der gelangweilteste Typ der Stadt, Spinnweben zwischen Sense und Bank
    const yawn = bump(lf, 22, 16);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.1)], [len, frameOn(540, 1000, 540, 860, 1.25)]])}>
        <Layer depth={0.7}>
          <Park f={lf} />
        </Layer>
        <Layer>
          <Bench x={540} y={1400} />
          <Death x={540} y={1380} s={1} seated mood="bored" look={[0, 0.4]} open={yawn} armL={15} armR={25} nod={Math.sin(lf * 0.05) * 3} scythe />
          <Cobweb x={735} y={1100} s={0.9} r={0} />
        </Layer>
      </Shot>
    );
  }
  // Nah: ein Feld bleibt leer – Stift nähert sich, Schweiß, zieht zurück
  const pull = ease(lf, W("either", 0.6) - (d - len) - 4, W("either", 0.6) - (d - len) + 6);
  const near = ease(lf, 0, 18) * (1 - pull);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 760, 540, 800, 1.3)], [len, frameOn(560, 790, 540, 800, 1.45)]])}>
      <Layer depth={0.3}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill={T.grass} />
      </Layer>
      <Layer>
        <Crossword x={540} y={760} s={1} r={-3} />
        <g transform={`translate(${lerp(980, 740, near)} ${lerp(1260, 980, near)}) rotate(-35)`}>
          <rect x={-14} y={-10} width={28} height={300} rx={12} fill={T.hood} />
          {[-24, -8, 8, 24].map((k) => (
            <rect key={k} x={k - 6} y={-60} width={12} height={60} rx={6} fill={T.bone} stroke={INK} strokeWidth={4} />
          ))}
          <ellipse cx={0} cy={-10} rx={40} ry={30} fill={T.bone} stroke={INK} strokeWidth={5} />
          <Pen x={0} y={-50} r={0} s={0.9} />
        </g>
        <Sweat x={900} y={620} s={1.1} o={clamp01(near * 2)} />
        <Sweat x={960} y={700} s={0.8} o={clamp01(near * 2 - 0.5)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* dennis                                                             */
/* ================================================================== */

const NOTE_COLORS = ["#FFF07A", "#FF8FC7", "#9BE35A", "#7FD6FF", "#FFB65C"];
const StickyWall: React.FC = () => (
  <g>
    <Room wall="#FFF4DE" />
    {Array.from({ length: 48 }).map((_, k) => {
      const cx = -200 + (k % 8) * 190 + ((k * 37) % 50);
      const cy = 180 + Math.floor(k / 8) * 190 + ((k * 53) % 40);
      return <rect key={k} x={cx} y={cy} width={120} height={120} fill={NOTE_COLORS[k % 5]} stroke={INK} strokeWidth={4} transform={`rotate(${((k * 29) % 20) - 10} ${cx + 60} ${cy + 60})`} />;
    })}
  </g>
);

export const DDennis: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He", 0.5) - 3, W("wedding", 0.8) - 6], d, f);
  if (i === 2) {
    // Hochzeit: Gelübde als Stichpunkte auf dem Klemmbrett, Braut verdreht die Augen, Gast schläft
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.15)], [len, frameOn(540, 980, 540, 860, 1.3)]])}>
        <Layer depth={0.7}>
          <Sky id="wed" a="#FFC7E6" b="#FFF4DE" />
          <rect x={-2000} y={1400} width={5000} height={2500} fill="#E8D6FF" />
          <path d="M 140 1400 L 140 640 Q 540 260 940 640 L 940 1400" fill="none" stroke="#FFFFFF" strokeWidth={60} />
          <path d="M 140 1400 L 140 640 Q 540 260 940 640 L 940 1400" fill="none" stroke={INK} strokeWidth={6} />
          {[200, 360, 720, 880].map((fx) => (
            <circle key={fx} cx={fx} cy={600 - Math.abs(fx - 540) * 0.2} r={40} fill={P.pink} stroke={INK} strokeWidth={5} />
          ))}
        </Layer>
        <Layer>
          <Person x={760} y={1460} s={0.95} shirt="#FFFFFF" pants="#FFFFFF" hair="pony" hairColor="#8A5A3C" skin={P.skin2} eyes="rolled" brows="neutral" mouth="flat" armL={20} armR={15} />
          <Dennis x={330} y={1460} s={0.95} suit eyes="open" look={[0.5, 0.8]} brows="up" mouth="talk" open={0.4 + Math.sin(lf * 0.9) * 0.3} armL={45} armR={45} bendL={-80} bendR={-80} />
          <ListBoard x={330} y={1150} s={0.42} title="VOWS" items={["LOVE", "HONOR", "Q3 GOALS"]} ticks={[1, 1, 0]} />
        </Layer>
      </Shot>
    );
  }
  if (i === 0) {
    const hug = ease(lf, W("loves", 0.4) - 4, W("loves", 0.4) + 6);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.2)], [len, frameOn(540, 980, 540, 860, 1.35)]])}>
        <Layer depth={0.7}>
          <StickyWall />
        </Layer>
        <Layer>
          <Dennis x={540} y={1480} s={1} eyes={hug > 0.5 ? "closed" : "open"} brows="up" mouth={hug > 0.5 ? "grin" : "smile"} armL={lerp(20, 50, hug)} armR={lerp(20, 50, hug)} bendL={lerp(0, -100, hug)} bendR={lerp(0, -100, hug)} lean={Math.sin(lf * 0.2) * 3 * hug} />
          <ListBoard x={540} y={1170} s={0.5} r={lerp(0, -8, hug)} items={["LISTS", "MORE LISTS"]} ticks={[1, 0]} />
          {hug > 0.5
            ? [0, 1, 2].map((k) => {
                const t = (lf * 0.03 + k / 3) % 1;
                return <path key={k} transform={`translate(${380 + k * 160} ${760 - t * 200}) scale(${0.8 + t * 0.4})`} d="M 0 18 C -40 -10 -20 -40 0 -20 C 20 -40 40 -10 0 18 Z" fill={P.red} stroke={INK} strokeWidth={4} opacity={1 - t} />;
              })
            : null}
        </Layer>
      </Shot>
    );
  }
  // ECU: die Liste der Listen
  return (
    <Shot cam={{ ...frameOn(540, 960, 540, 820, 1.0), y: frameOn(540, 960, 540, 820, 1.0).y + jolt(lf, 0, 6) }}>
      <Layer depth={0}>
        <ReactBg a="#9BE35A" b="#B9F08A" f={lf} cx={540} cy={800} />
      </Layer>
      <Layer>
        <ListBoard x={540} y={520} s={1.3} r={-2} title="MY LISTS" items={["TO-DO LIST", "SHOPPING LIST", "BUCKET LIST", "LIST OF LISTS"]} ticks={[1, 1, 1, ease(lf, len - 18, len - 10)]} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rush                                                               */
/* ================================================================== */

export const DRush: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Workout", 0.4) - 3, W("Inbox", 0.55) - 3, W("Across", 0.75) - 3], d, f);
  if (i === 0) {
    // „great morning“ + Küche: glänzender Geschirrstapel, Haken
    const doneAt = W("done", 0.3) + 2;
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.15)], [len, frameOn(540, 980, 540, 860, 1.3)]])}>
        <Layer depth={0.7}>
          <Room wall="#BFF0E0" window />
          <rect x={-2000} y={1250} width={5000} height={60} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          <Dennis x={380} y={1500} s={0.95} eyes="open" brows="up" mouth="grin" armL={30} armR={110} bendR={-50} gest={10} />
          {Array.from({ length: 7 }).map((_, k) => (
            <ellipse key={k} cx={760} cy={1240 - k * 34} rx={150} ry={26} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          ))}
          <Sparkle x={860} y={1000} t={(lf % 30)} s={0.8} />
          <Sparkle x={660} y={1060} t={((lf + 15) % 30)} s={0.6} />
          <Check x={780} y={620} t={lf - doneAt} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Gym: Hantel über dem Kopf, Haken
    const lift = ease(lf, 0, 10);
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 860, 1.2), y: frameOn(540, 1000, 540, 860, 1.2).y + jolt(lf, 10, 10) }}>
        <Layer depth={0.7}>
          <Room wall="#FFD9D9" floor={1450} />
          {[150, 930].map((mx) => (
            <rect key={mx} x={mx - 80} y={300} width={160} height={700} rx={10} fill="#E9F6FF" stroke={INK} strokeWidth={7} />
          ))}
        </Layer>
        <Layer>
          <Dennis x={540} y={1450} s={0.95} eyes="squint" brows="angry" mouth="grin" armL={lerp(60, 165, lift)} armR={lerp(60, 165, lift)} bendL={lerp(-60, 0, lift)} bendR={lerp(-60, 0, lift)} />
          <g transform={`translate(540 ${lerp(1100, 860, lift)})`}>
            <rect x={-330} y={-12} width={660} height={24} rx={10} fill="#8C94A8" stroke={INK} strokeWidth={5} />
            {[-1, 1].map((sd) => (
              <rect key={sd} x={sd * 300 - 30} y={-90} width={60} height={180} rx={14} fill={INK} />
            ))}
          </g>
          <Sweat x={680} y={930} o={lift} />
          <Check x={850} y={560} t={lf - 14} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Schreibtisch: Posteingang 0, Konfetti
    const zero = W("zero", 0.5) - (W("Inbox", 0.55) - 3);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 980, 540, 860, 1.2)], [len, frameOn(540, 960, 540, 860, 1.35)]])}>
        <Layer depth={0.7}>
          <StickyWall />
          <rect x={-2000} y={1260} width={5000} height={80} fill={T.wood} stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          <Dennis x={330} y={1560} s={0.9} eyes="wide" brows="up" mouth="grin" open={0.6} armL={lf > zero ? 165 : 40} armR={lf > zero ? 165 : 70} bendR={lf > zero ? 0 : -60} />
          <rect x={560} y={880} width={420} height={300} rx={18} fill="#2B2240" stroke={INK} strokeWidth={8} />
          <rect x={585} y={905} width={370} height={250} rx={8} fill="#FFFFFF" />
          <text x={770} y={1010} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>
            INBOX
          </text>
          <text x={770} y={1120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={lf > zero ? T.check : "#8C94A8"}>
            {lf > zero ? "0" : String(Math.max(1, Math.round(lerp(212, 1, ease(lf, 0, zero, "linear")))))}
          </text>
          <path d="M 520 1180 L 1020 1180 L 1060 1250 L 480 1250 Z" fill="#8C94A8" stroke={INK} strokeWidth={7} />
          {lf > zero
            ? Array.from({ length: 18 }).map((_, k) => {
                const t = lf - zero;
                return <rect key={k} x={770 + Math.cos(k * 1.3) * t * (10 + (k % 4) * 3)} y={900 - t * 14 + t * t * 0.45 + (k % 3) * 20} width={20} height={34} fill={NOTE_COLORS[k % 5]} transform={`rotate(${k * 40 + t * 12} ${770 + Math.cos(k * 1.3) * t * 10} ${900})`} />;
              })
            : null}
        </Layer>
      </Shot>
    );
  }
  // Park: der Tod legt das Kreuzworträtsel weg, lächelt zum ersten Mal, knackt den Nacken
  const stand = ease(lf, W("crossword", 0.6) - (d - len) - 6, W("crossword", 0.6) - (d - len) + 6);
  const crack = jolt(lf, W("crossword", 0.6) - (d - len) + 8, 10);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.15)], [len, frameOn(540, 960, 540, 860, 1.4)]])}>
      <Layer depth={0.7}>
        <Park f={lf + 200} />
      </Layer>
      <Layer>
        <Bench x={540} y={1400} />
        <Crossword x={lerp(560, 760, stand)} y={lerp(1240, 1450, stand)} s={0.3} r={lerp(0, 30, stand)} />
        <Death x={540} y={lerp(1380, 1420, stand)} s={1} seated={stand < 0.5} mood={stand > 0.3 ? "happy" : "bored"} look={[0, 0]} armL={lerp(40, 20, stand)} armR={lerp(60, 8, stand)} bendL={-60} nod={crack * 1.5} scythe={stand > 0.5} />
        <Burst x={540} y={960} r0={180} r1={260} n={12} o={bump(lf, W("crossword", 0.6) - (d - len) + 8, 8)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* panic                                                              */
/* ================================================================== */

const Laundry: React.FC<{ readonly x: number; readonly y: number; readonly k: number; readonly r?: number }> = ({ x, y, k, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    {k % 3 === 0 ? (
      <path d="M -20 -60 L 20 -60 L 20 10 L 50 30 L 40 55 L -20 30 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    ) : k % 3 === 1 ? (
      <path d="M -60 -40 L -20 -55 L 20 -55 L 60 -40 L 50 -10 L 30 -15 L 30 50 L -30 50 L -30 -15 L -50 -10 Z" fill={P.pink} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    ) : (
      <path d="M -50 -30 L 50 -30 L 40 40 L 5 40 L 0 0 L -5 40 L -40 40 Z" fill="#7FD6FF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    )}
    <path d="M -10 -10 q 6 -6 12 0" stroke="#8C5A3A" strokeWidth={6} fill="none" />
  </g>
);

const PanicStreet: React.FC = () => (
  <g>
    <Sky id="panic" a="#FF9A6A" b="#FFE1C2" />
    <Ground y={1300} color="#9AA3B5" />
    <House x={540} y={1300} s={1.0} a="#7FD6FF" />
  </g>
);

const MomRoom: React.FC = () => (
  <g>
    <Room wall="#FFD3EC" />
    <rect x={-2000} y={1280} width={5000} height={70} fill={T.wood} stroke={INK} strokeWidth={8} />
    <rect x={120} y={300} width={220} height={260} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <circle cx={230} cy={410} r={60} fill={P.pink} stroke={INK} strokeWidth={5} />
  </g>
);
const Printer: React.FC<{ readonly x: number; readonly y: number; readonly smoke: number; readonly out: number; readonly f: number }> = ({ x, y, smoke, out, f }) => (
  <g transform={`translate(${x} ${y})`}>
    {out > 0 ? <rect x={-110} y={-130 - 240 * out} width={220} height={260} fill="#FFFFFF" stroke={INK} strokeWidth={5} /> : null}
    {out > 0 ? <path d={`M -60 ${-90 - 240 * out} L 60 ${-90 - 240 * out} M -60 ${-50 - 240 * out} L 40 ${-50 - 240 * out}`} stroke="#8C94A8" strokeWidth={10} /> : null}
    <rect x={-200} y={-130} width={400} height={150} rx={20} fill="#D8DEE8" stroke={INK} strokeWidth={8} />
    <rect x={-150} y={-150} width={300} height={30} rx={8} fill="#8C94A8" stroke={INK} strokeWidth={6} />
    <circle cx={140} cy={-60} r={14} fill={smoke > 0 ? P.red : P.lime} stroke={INK} strokeWidth={4} />
    {smoke > 0
      ? [0, 1, 2].map((k) => {
          const t = ((f * 0.04 + k / 3) % 1 + 1) % 1;
          return <circle key={k} cx={-60 + k * 50 + Math.sin(t * 6) * 20} cy={-170 - t * 260} r={40 + t * 40} fill="#5B5F73" opacity={(1 - t) * smoke * 0.85} />;
        })
      : null}
  </g>
);

const Mom: React.FC<Fig> = (p) => <Person pants="#7A3FB0" {...p} shirt={P.purple} hair="curly" hairColor="#B8BFD0" skin={P.skin} />;

export const DPanic: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("They", 0.22) - 3, W("mom", 0.45) - 4, W("fixes", 0.7) - 3], d, f);
  if (i === 0) {
    // Nachbarn in Panik vor Dennis' Haus
    return (
      <Shot cam={{ ...camPath(lf, [[0, frameOn(540, 1050, 540, 900, 0.95)], [len, frameOn(540, 1050, 540, 900, 1.05)]]), y: frameOn(540, 1050, 540, 900, 1).y + Math.sin(lf * 1.4) * 4 }}>
        <Layer depth={0.7}>
          <PanicStreet />
        </Layer>
        <Layer>
          {CROWD.slice(0, 5).map((c, k) => (
            <Person key={k} x={120 + k * 210} y={1460 + (k % 2) * 30} s={0.62} shirt={c.shirt} skin={c.skin} hair={c.hair} hairColor={c.hairColor} eyes="wide" brows="worried" mouth="scream" open={0.7 + Math.sin(lf * 0.5 + k) * 0.2} armL={150 + Math.sin(lf * 0.6 + k) * 15} armR={150 + Math.cos(lf * 0.5 + k) * 15} bendL={-30} bendR={-30} />
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Schmutzwäsche fliegt gegen die Tür (Arbeit = Leben)
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 900, 1.6)], [len, frameOn(540, 1150, 540, 900, 1.75)]])}>
        <Layer depth={0.7}>
          <PanicStreet />
        </Layer>
        <Layer>
          {Array.from({ length: 14 }).map((_, k) => {
            const t0 = k * 2.5 - 8;
            const t = clamp01((lf - t0) / 14);
            if (lf < t0) return null;
            const sx = k % 2 ? -200 : 1300;
            const ex = 470 + ((k * 37) % 140);
            const ey = 1300 - 20 - Math.floor(k / 2) * 18;
            return <Laundry key={k} k={k} x={lerp(sx, ex, t)} y={lerp(1200, ey, t) - Math.sin(t * Math.PI) * 300} r={t * 360 * (k % 2 ? 1 : -1) * (1 - t) + (k * 23) % 40} />;
          })}
        </Layer>
      </Shot>
    );
  }
  const fixAt = W("fixes", 0.7) - (d - len);
  const fixed = ease(lf, fixAt - 2, fixAt + 4);
  const out = ease(lf, fixAt + 2, fixAt + 16);
  const sc = ease(lf, W("seconds", 0.85) - (d - len) - 2, W("seconds", 0.85) - (d - len) + 6);
  const phone = (
    <g transform="translate(470 1150) rotate(-10) scale(0.8)">
      <rect x={-60} y={-110} width={120} height={220} rx={20} fill={INK} />
      <rect x={-48} y={-94} width={96} height={180} rx={10} fill="#BFE8FF" />
      <circle cx={0} cy={-20} r={30} fill={P.skin} stroke={INK} strokeWidth={4} />
      <circle cx={-10} cy={-24} r={9} fill="none" stroke={INK} strokeWidth={3} />
      <circle cx={10} cy={-24} r={9} fill="none" stroke={INK} strokeWidth={3} />
      <path d="M -10 -4 Q 0 6 10 -4" fill="none" stroke={INK} strokeWidth={3} />
    </g>
  );
  if (i === 2) {
    // Mama weint mit qualmendem Drucker, Telefon am Ohr
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.2)], [len, frameOn(540, 990, 540, 860, 1.32)]])}>
        <Layer depth={0.7}>
          <MomRoom />
        </Layer>
        <Layer>
          <Mom x={360} y={1500} s={0.95} eyes="closed" brows="sad" mouth="scream" open={0.5} armL={20} armR={160} bendR={-150} />
          <Tear x={330} y={1040} f={lf} side={-1} />
          <Tear x={400} y={1040} f={lf + 8} side={1} />
          {phone}
          <Printer x={780} y={1270} smoke={1} out={0} f={lf} />
        </Layer>
      </Shot>
    );
  }
  // Ein Tipp per Video-Anruf – Drucker druckt perfekt, Mama schreit vor Entsetzen
  return (
    <Shot cam={{ ...camPath(lf, [[0, frameOn(620, 1000, 540, 860, 1.3)], [len, frameOn(620, 990, 540, 860, 1.45)]]), y: frameOn(620, 1000, 540, 860, 1.3).y + jolt(lf, W("seconds", 0.85) - (d - len), 12) }}>
      <Layer depth={0.7}>
        <MomRoom />
      </Layer>
      <Layer>
        <Mom x={360} y={1500} s={0.95} eyes={sc > 0.3 ? "wide" : "open"} look={[1, 0]} brows={sc > 0.3 ? "up" : "sad"} mouth={sc > 0.3 ? "scream" : "o"} open={sc > 0.3 ? 0.9 : 0.4} armL={sc > 0.3 ? 160 : 20} armR={160} bendR={-150} bendL={-30} />
        {phone}
        <Printer x={780} y={1270} smoke={1 - fixed} out={out} f={lf} />
        <Sparkle x={830} y={900} t={lf - fixAt - 6} s={1.1} />
        <Burst x={360} y={1060} r0={150} r1={230} n={12} o={bump(lf, W("seconds", 0.85) - (d - len) + 3, 8)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* turn                                                               */
/* ================================================================== */

const TURN_ITEMS = ["DISHES", "GYM", "INBOX", "PRINTER", "RELAX"] as const;

export const DTurn: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Knock", 0.3) - 3, W("Dennis", 0.6) - 3], d, f);
  if (i === 0) {
    // ECU: ein Kästchen offen, Daumen über der letzten Zeile
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 900, 540, 760, 1.0)], [len, frameOn(540, 1020, 540, 760, 1.25)]])}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={T.wood} />
        </Layer>
        <Layer>
          <ListBoard x={540} y={420} s={1.25} items={TURN_ITEMS} ticks={[1, 1, 1, 1, 0]} cover={4} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Tür: der Tod klopft, Sense über der Schulter
    const k1 = W("Knock", 0.3) - (W("Knock", 0.3) - 3);
    const knock = (t: number) => bump(lf, t, 3);
    const kk = Math.max(knock(k1), knock(k1 + 8));
    return (
      <Shot cam={{ ...frameOn(600, 1000, 540, 860, 1.2), x: frameOn(600, 1000, 540, 860, 1.2).x + kk * 6 }}>
        <Layer depth={0.7}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2A2C6E" />
          <circle cx={900} cy={300} r={70} fill="#FFF3B0" />
          <rect x={-2000} y={1450} width={5000} height={2500} fill="#4A4F66" />
          <rect x={150} y={400} width={420} height={1060} fill="#7FD6FF" stroke={INK} strokeWidth={9} />
          <rect x={210} y={560} width={300} height={900} rx={10} fill="#2F8F6B" stroke={INK} strokeWidth={8} />
          <circle cx={470} cy={1040} r={14} fill={P.bus} />
          <rect x={240} y={1400} width={240} height={50} rx={8} fill="#C47A45" stroke={INK} strokeWidth={5} />
          {kk > 0.2 ? <Burst x={510} y={900} r0={40} r1={90} n={8} o={kk} /> : null}
        </Layer>
        <Layer>
          <Death x={760} y={1460} s={1} mood="happy" look={[-1, 0]} armL={lerp(110, 125, kk)} bendL={lerp(-20, -50, kk)} armR={8} scythe />
        </Layer>
      </Shot>
    );
  }
  // Reaktion: Dennis liest – „RELAX“ wird sichtbar, Auge zuckt
  const rev = ease(lf, W("Relax", 0.75) - (d - len) - 2, W("Relax", 0.75) - (d - len) + 3);
  return (
    <Shot cam={{ ...frameOn(540, 1000, 540, 820, 1.25), y: frameOn(540, 1000, 540, 820, 1.25).y + jolt(lf, W("Relax", 0.75) - (d - len), 12) }}>
      <Layer depth={0}>
        <ReactBg a={rev > 0.5 ? "#FF4D5E" : "#7FD6FF"} b={rev > 0.5 ? "#FF7A86" : "#A8E4FF"} f={lf} cx={540} cy={760} />
      </Layer>
      <Layer>
        <Dennis x={540} y={1520} s={1.05} eyes={rev > 0.5 ? "twitch" : "open"} f={lf} look={[0, 0.8]} brows={rev > 0.5 ? "worried" : "neutral"} mouth={rev > 0.5 ? "frown" : "flat"} armL={60} armR={60} bendL={-80} bendR={-80} />
        <Sweat x={680} y={880} o={rev} />
        <Sweat x={400} y={900} s={0.8} o={rev} />
        <g opacity={rev}>
          <rect x={320} y={1130} width={440} height={170} rx={14} fill={T.paper} stroke={INK} strokeWidth={8} transform="rotate(-4 540 1215)" />
          <text x={540} y={1250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={T.check} transform="rotate(-4 540 1215)">
            RELAX
          </text>
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* payoff                                                             */
/* ================================================================== */

const OldRoom: React.FC = () => (
  <g>
    <Room wall="#D9E8C9" />
    <rect x={150} y={420} width={260} height={210} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    {/* Foto: Dennis + Tod */}
    <circle cx={235} cy={510} r={36} fill={P.skin} stroke={INK} strokeWidth={4} />
    <circle cx={325} cy={510} r={36} fill={T.bone} stroke={INK} strokeWidth={4} />
    <path d="M 290 498 h 70 M 290 522 h 70" stroke={INK} strokeWidth={6} />
    <path d="M 199 510 a 36 36 0 0 1 72 0" fill="none" stroke={T.hood} strokeWidth={0} />
    <rect x={700} y={380} width={240} height={300} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <text x={820} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>
      2066
    </text>
    {Array.from({ length: 12 }).map((_, k) => (
      <path key={k} d={`M ${720 + (k % 4) * 55} ${490 + Math.floor(k / 4) * 60} l 40 40 M ${760 + (k % 4) * 55} ${490 + Math.floor(k / 4) * 60} l -40 40`} stroke={T.check} strokeWidth={6} />
    ))}
  </g>
);

export const DPayoff: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("meditates", 0.4) - 3, W("Death", 0.62) - 3], d, f);
  if (i === 1) {
    // „Competitively.“ Comic-Fläche: Meditation mit Stoppuhr und Pokal, Adern pochen
    const comp = ease(lf, W("Competitively", 0.7) - (W("meditates", 0.4) - 3) - 3, W("Competitively", 0.7) - (W("meditates", 0.4) - 3) + 4);
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 820, 1.3), y: frameOn(540, 1000, 540, 820, 1.3).y + jolt(lf, W("Competitively", 0.7) - (W("meditates", 0.4) - 3), 10) }}>
        <Layer depth={0}>
          <ReactBg a={comp > 0.5 ? "#9A6BFF" : "#C9B8FF"} b={comp > 0.5 ? "#B796FF" : "#DCD0FF"} f={lf} cx={540} cy={800} />
        </Layer>
        <Layer>
          <Dennis x={540} y={1450} seated s={1} old eyes={comp > 0.5 ? "squint" : "closed"} brows={comp > 0.5 ? "angry" : "neutral"} mouth={comp > 0.5 ? "grin" : "flat"} armL={110} armR={110} bendL={-40} bendR={-40} />
          <ellipse cx={540} cy={1460} rx={260} ry={50} fill="#FF8FC7" stroke={INK} strokeWidth={6} />
          {comp > 0.3 ? <Sweat x={680} y={1000} o={comp} /> : null}
          <g transform={`translate(830 ${lerp(1500, 980, comp)})`}>
            <path d="M -60 -90 L 60 -90 Q 60 10 0 20 Q -60 10 -60 -90 Z" fill={P.bus} stroke={INK} strokeWidth={6} />
            <rect x={-14} y={18} width={28} height={50} fill={P.busDark} stroke={INK} strokeWidth={5} />
            <rect x={-50} y={66} width={100} height={30} rx={6} fill={INK} />
            <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>
              1st
            </text>
          </g>
          <g transform={`translate(250 ${lerp(1500, 1000, comp)})`}>
            <circle r={70} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
            <rect x={-12} y={-100} width={24} height={30} fill={INK} />
            <line x1={0} y1={0} x2={Math.sin(lf * 0.4) * 50} y2={-Math.cos(lf * 0.4) * 50} stroke={T.check} strokeWidth={7} strokeLinecap="round" />
          </g>
        </Layer>
      </Shot>
    );
  }
  if (i === 0) {
    // 40 Jahre später: grauer Dennis steif auf der Couch, Auge zuckt
    return (
      <Shot cam={camPath(lf, [[0, frameOn(440, 1000, 540, 820, 1.55)], [len, frameOn(440, 990, 540, 820, 1.7)]])}>
        <Layer depth={0.7}>
          <OldRoom />
        </Layer>
        <Layer>
          <CouchBack x={540} y={1480} color="#6E8FD8" />
          <Dennis x={400} y={1420} seated s={1} old eyes="twitch" f={lf} look={[0, 0]} brows="worried" mouth="flat" armL={30} armR={30} bendL={-70} bendR={-70} />
          <ListBoard x={400} y={1200} s={0.45} items={["RELAX"]} ticks={[0]} />
          <CouchFront x={540} y={1480} color="#6E8FD8" dark="#4A64A8" />
        </Layer>
      </Shot>
    );
  }
  // Weiter: der Tod in Pantoffeln mit Fernbedienung und Tee, legt den Arm um ihn
  const hug = ease(lf, W("couch", 0.7) - (d - len) - 4, W("couch", 0.7) - (d - len) + 6);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 1.05)], [len, frameOn(540, 1000, 540, 860, 1.15)]])}>
      <Layer depth={0.7}>
        <OldRoom />
      </Layer>
      <Layer>
        <CouchBack x={540} y={1480} color="#6E8FD8" />
        <Dennis x={360} y={1420} seated s={0.9} old eyes="twitch" f={lf} look={[1, 0]} brows="worried" mouth="flat" armL={30} armR={30} bendL={-70} bendR={-70} />
        <Death x={720} y={1420} s={0.9} seated mood="happy" look={[-1, 0]} armL={lerp(40, 130, hug)} bendL={lerp(-70, -40, hug)} armR={60} bendR={-80} />
        <g transform="translate(830 1180)">
          <rect x={-30} y={-50} width={60} height={110} rx={12} fill={INK} />
          <circle cx={0} cy={-25} r={10} fill={P.red} />
        </g>
        <CouchFront x={540} y={1480} color="#6E8FD8" dark="#4A64A8" />
        {[640, 820].map((sx) => (
          <ellipse key={sx} cx={sx} cy={1620} rx={70} ry={34} fill={P.pink} stroke={INK} strokeWidth={6} />
        ))}
        <g transform="translate(920 1400)">
          <rect x={-40} y={-50} width={80} height={90} rx={12} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          <path d="M 40 -30 q 30 10 0 40" fill="none" stroke={INK} strokeWidth={6} />
          {[0, 1].map((k) => (
            <path key={k} d={`M ${-10 + k * 20} -60 q 10 -20 0 -40`} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.8} />
          ))}
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const DOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const handAt = W("thing", 0.4);
  const cutAt = W("sent", 0.85) + 5;
  if (f >= cutAt) {
    // Harter Schnitt mitten im Wort → schwarz (Loop-Pointe)
    return (
      <Shot cam={{ x: 540, y: 960, zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#000000" />
        </Layer>
      </Shot>
    );
  }
  const slide = ease(f, handAt - 4, handAt + 12);
  const tap = bump(f, handAt + 16, 4) + bump(f, handAt + 26, 4);
  return (
    <Shot cam={camPath(f, [[0, frameOn(540, 900, 540, 820, 1.0)], [d, frameOn(540, 900, 540, 820, 1.18)]])}>
      <Layer depth={0}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill={T.wood} />
        {Array.from({ length: 12 }).map((_, k) => (
          <rect key={k} x={-500} y={-300 + k * 260} width={2200} height={8} fill={T.woodDark} opacity={0.4} />
        ))}
      </Layer>
      <Layer>
        <rect x={210} y={360} width={660} height={860} rx={10} fill="#FFF7B8" stroke={INK} strokeWidth={8} transform="rotate(-3 540 790)" />
        {Array.from({ length: 9 }).map((_, k) => (
          <line key={k} x1={230} x2={850} y1={460 + k * 85} y2={460 + k * 85 - 30} stroke="#9EC9FF" strokeWidth={4} />
        ))}
        <g transform="rotate(-3 540 790)">
          <text x={540} y={450} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>
            MY LIST
          </text>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect x={270} y={510 + k * 120} width={60} height={60} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
              <rect x={360} y={530 + k * 120} width={380} height={22} rx={11} fill="#B8BFD0" />
              <Tick x={300} y={540 + k * 120} s={1.2} k={1} />
            </g>
          ))}
          <rect x={270} y={870} width={60} height={60} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          <text x={355} y={915} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#2A2A6A">
            FINISH THIS SENTENCE
          </text>
        </g>
        <Pen x={lerp(330, 300, ease(f, 0, d))} y={lerp(980, 920, ease(f, 0, d)) + Math.sin(f * 0.5) * 4} r={20} s={1.1} />
        {/* Knochenhand gleitet herein und tippt aufs Papier */}
        <g transform={`translate(${lerp(-200, 470, slide)} ${lerp(1150, 1010, slide) + tap * 25}) rotate(${lerp(-60, -20, slide)})`}>
          <rect x={-500} y={-26} width={500} height={52} rx={20} fill={T.hood} />
          <ellipse cx={20} cy={0} rx={46} ry={34} fill={T.bone} stroke={INK} strokeWidth={5} />
          {[-24, -8, 8, 24].map((k, n) => (
            <rect key={k} x={50} y={k - 7} width={n === 0 ? 80 : 56} height={14} rx={7} fill={T.bone} stroke={INK} strokeWidth={4} />
          ))}
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const TODO_SCENES: Record<string, React.FC> = {
  hook: DHook,
  rules: DRules,
  death: DDeath,
  dennis: DDennis,
  rush: DRush,
  panic: DPanic,
  turn: DTurn,
  payoff: DPayoff,
  outro: DOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(TODO_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Listen/Schilder nur als Gag. */
export const TODO_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene (Set-Zählung vor dem Render, Lessons Ghost-Pepper #5). */
export const TODO_SHOT_COUNT: Record<string, number> = { hook: 3, rules: 4, death: 2, dennis: 3, rush: 4, panic: 4, turn: 3, payoff: 3, outro: 1 };
