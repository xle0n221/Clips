import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import { Bill } from "../kit2d/boxing";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/apple-ipod.json";
import { useBeats } from "./rollsSets";
import { Burst, Face, INK, P, Person, Sweat } from "./gaehnSets";
import type { FaceProps, PersonProps } from "./gaehnSets";
import { ReactBg } from "./suche";

/**
 * „Apple Was Almost Dead. Its Enemy Paid the Rent.“ (episodes/apple-ipod.json) – 2D-Cartoon, wahre Geschichte, Roast-Humor.
 * Alle Geräte sind eigene, generische Figuren mit Bildschirm-Gesicht (keine Logos, keine Produktnachbildungen).
 * Eine Text-Ebene (Untertitel), Schnitte an Wort-Beats, kein Set > 2 am Stück (APPLE_SHOT_COUNT).
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.max(1, Math.round(x)));
  const i = shotIndex(f, c);
  const a = i === 0 ? 0 : c[i - 1];
  const b = i < c.length ? c[i] : d;
  return { i, lf: f - a, len: Math.max(1, b - a) };
};

const Shot: React.FC<{ readonly cam: Cam2D; readonly children: React.ReactNode }> = ({ cam, children }) => (
  <Stage2D cam={cam} mood="haze" noSky>
    {children}
  </Stage2D>
);

const C = {
  beige: "#EADFC2",
  beigeDark: "#C9B98F",
  crt: "#8FF0C8",
  clinic: "#6FD3C4",
  clinicFloor: "#DDEAF2",
  tower: "#8E98AE",
  towerDark: "#5E6780",
  gold: "#FFC531",
  goldDark: "#D8930B",
  egg: "#19B8D8",
  pod: "#F8F8FA",
  podScreen: "#BFD8FF",
  brick: "#727A88",
  lcd: "#B8C99A",
  cube: "#23232B",
  stage: "#1C1438",
  nerdRoom: "#16204A",
  grass: "#7BC96F",
  sky: "#8ED8FF",
  money: "#5FBF6A",
};

type FaceP = Pick<FaceProps, "eyes" | "brows" | "mouth" | "open" | "look" | "blush" | "f">;

/* ------------------------------------------------------------------ */
/* Geräte-Figuren (Ursprung = Füße bzw. Unterkante)                   */
/* ------------------------------------------------------------------ */

/** Armende für Geräte-Arme: deg 0 = hängt, 90 = seitlich, 180 = hoch. */
const armEnd = (sx: number, sy: number, deg: number, side: 1 | -1, len: number) => {
  const a = (deg * Math.PI) / 180;
  return [sx + side * Math.sin(a) * len, sy + Math.cos(a) * len] as const;
};

const Arm: React.FC<{ readonly sx: number; readonly sy: number; readonly deg: number; readonly side: 1 | -1; readonly len?: number; readonly c?: string }> = ({ sx, sy, deg, side, len = 150, c = INK }) => {
  const [hx, hy] = armEnd(sx, sy, deg, side, len);
  const a = (deg * Math.PI) / 180;
  const mx = sx + side * Math.sin(a) * len * 0.5 + side * 18 * Math.cos(a);
  const my = sy + Math.cos(a) * len * 0.5 - 10;
  return (
    <g>
      <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`} fill="none" stroke={c} strokeWidth={12} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    </g>
  );
};

type DevProps = FaceP & {
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly armL?: number;
  readonly armR?: number;
  readonly legs?: boolean;
  readonly lean?: number;
  readonly flip?: boolean;
  /** über dem Gerät (Gerätekoordinaten, Ursprung Unterkante Körper) */
  readonly extra?: React.ReactNode;
};

type Shape = {
  readonly w: number;
  readonly h: number;
  readonly body: React.ReactNode;
  readonly scr: readonly [number, number, number, number];
  readonly screen: string;
  readonly faceR: number;
  readonly faceY?: number;
};

const Device: React.FC<DevProps & { readonly shape: Shape }> = ({ x, y, s = 1, armL = 20, armR = 20, legs = true, lean = 0, flip, extra, shape, ...face }) => {
  const L = legs ? 110 : 0;
  const { w, h, scr } = shape;
  const shY = -L - h * 0.62;
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {legs ? (
        <g>
          {[-1, 1].map((k) => (
            <g key={k}>
              <path d={`M ${k * w * 0.22} ${-L} L ${k * w * 0.26} -8`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
              <ellipse cx={k * w * 0.26 + k * 16} cy={-6} rx={34} ry={14} fill={INK} />
            </g>
          ))}
        </g>
      ) : null}
      <Arm sx={-w / 2 + 6} sy={shY} deg={armL} side={-1} />
      <Arm sx={w / 2 - 6} sy={shY} deg={armR} side={1} />
      <g transform={`translate(0 ${-L})`}>
        {shape.body}
        <rect x={scr[0]} y={scr[1]} width={scr[2]} height={scr[3]} rx={Math.min(scr[2], scr[3]) * 0.16} fill={shape.screen} stroke={INK} strokeWidth={7} />
        <g transform={`translate(${scr[0] + scr[2] / 2} ${scr[1] + scr[3] / 2 + (shape.faceY ?? 0)}) scale(${flip ? -1 : 1} 1)`}>
          <Face r={shape.faceR} skin={shape.screen} {...face} />
        </g>
        {extra}
      </g>
    </g>
  );
};

/** Apple als Patient: beiger Röhren-Computer. */
const CRT: Shape = {
  w: 380,
  h: 340,
  body: (
    <g>
      <path d="M -150 -40 L 150 -40 L 175 0 L -175 0 Z" fill={C.beigeDark} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-190} y={-340} width={380} height={310} rx={34} fill={C.beige} stroke={INK} strokeWidth={9} />
      {[0, 1, 2].map((k) => <rect key={k} x={110 + k * 18} y={-80} width={8} height={30} rx={3} fill={C.beigeDark} />)}
    </g>
  ),
  scr: [-150, -310, 300, 230],
  screen: C.crt,
  faceR: 95,
};
const Patient: React.FC<DevProps> = (p) => <Device {...p} shape={CRT} />;

/** Rivale: grauer Turm mit Sonnenbrille + Goldkette. */
const TOWER: Shape = {
  w: 240,
  h: 520,
  body: (
    <g>
      <rect x={-120} y={-520} width={240} height={520} rx={22} fill={C.tower} stroke={INK} strokeWidth={9} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={-80} y={-230 + k * 46} width={160} height={18} rx={9} fill={C.towerDark} />)}
      <circle cx={70} cy={-40} r={14} fill={P.lime} stroke={INK} strokeWidth={4} />
    </g>
  ),
  scr: [-95, -495, 190, 170],
  screen: "#C9D3E6",
  faceR: 70,
};
const Shades: React.FC<{ readonly y?: number; readonly w?: number }> = ({ y = -425, w = 1 }) => (
  <g transform={`translate(0 ${y}) scale(${w})`}>
    <rect x={-72} y={-20} width={62} height={38} rx={10} fill={INK} />
    <rect x={10} y={-20} width={62} height={38} rx={10} fill={INK} />
    <rect x={-12} y={-12} width={24} height={8} fill={INK} />
    <path d="M -60 -10 L -40 -10" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g>
);
const Chain: React.FC = () => (
  <g>
    <path d="M -80 -300 Q 0 -200 80 -300" fill="none" stroke={C.gold} strokeWidth={14} strokeDasharray="14 8" />
    <circle cx={0} cy={-235} r={26} fill={C.gold} stroke={INK} strokeWidth={5} />
  </g>
);
const Rival: React.FC<DevProps & { readonly shades?: boolean }> = ({ shades = true, extra, ...p }) => (
  <Device
    {...p}
    shape={TOWER}
    extra={
      <g>
        {shades ? <Shades /> : null}
        <Chain />
        {extra}
      </g>
    }
  />
);

/** MessagePad-artiges Taschengerät (eigene Form: grauer Ziegel mit Antenne). */
const BRICK: Shape = {
  w: 220,
  h: 320,
  body: (
    <g>
      <path d="M 70 -320 L 70 -410" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <circle cx={70} cy={-414} r={14} fill={P.red} stroke={INK} strokeWidth={4} />
      <rect x={-110} y={-320} width={220} height={320} rx={18} fill={C.brick} stroke={INK} strokeWidth={9} />
      {[0, 1, 2].map((k) => <circle key={k} cx={-50 + k * 50} cy={-45} r={14} fill="#4E5562" stroke={INK} strokeWidth={4} />)}
    </g>
  ),
  scr: [-85, -295, 170, 190],
  screen: C.lcd,
  faceR: 64,
};
const Brick: React.FC<DevProps> = (p) => <Device {...p} shape={BRICK} />;

/** Bonbon-Computer (eigene Ei-Form, durchsichtig mit sichtbarem Innenleben). */
const eggShape = (c: string): Shape => ({
  w: 360,
  h: 380,
  body: (
    <g>
      <path d="M -170 -60 Q -200 -380 0 -380 Q 200 -380 170 -60 Q 160 0 0 0 Q -160 0 -170 -60 Z" fill={c} opacity={0.82} stroke={INK} strokeWidth={9} />
      <path d="M -110 -50 L -60 -90 L 0 -60 L 60 -95 L 110 -50" fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.6} />
      <ellipse cx={-110} cy={-300} rx={26} ry={50} fill="#FFFFFF" opacity={0.45} transform="rotate(25 -110 -300)" />
    </g>
  ),
  scr: [-125, -320, 250, 200],
  screen: "#EAF8FF",
  faceR: 82,
});

/** Musikplayer (eigene Form: weißer Kasten, Bildschirm oben, zwei Knöpfe; keine Produktnachbildung). */
const POD: Shape = {
  w: 200,
  h: 320,
  body: (
    <g>
      <rect x={-100} y={-320} width={200} height={320} rx={40} fill={C.pod} stroke={INK} strokeWidth={9} />
      <rect x={-50} y={-95} width={44} height={44} rx={12} fill={P.pink} stroke={INK} strokeWidth={5} />
      <rect x={6} y={-95} width={44} height={44} rx={12} fill={P.lime} stroke={INK} strokeWidth={5} />
    </g>
  ),
  scr: [-78, -295, 156, 170],
  screen: C.podScreen,
  faceR: 60,
};
const Buds: React.FC = () => (
  <g>
    <path d="M -100 -60 Q -190 40 -150 160" fill="none" stroke="#FFFFFF" strokeWidth={8} />
    <path d="M 100 -60 Q 190 40 150 160" fill="none" stroke="#FFFFFF" strokeWidth={8} />
    <circle cx={-150} cy={170} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <circle cx={150} cy={170} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
  </g>
);
const Pod: React.FC<DevProps & { readonly shades?: boolean }> = ({ shades, extra, ...p }) => (
  <Device
    {...p}
    shape={POD}
    extra={
      <g>
        <g transform="translate(0 -200)">
          <Buds />
        </g>
        {shades ? <Shades y={-225} w={0.85} /> : null}
        {extra}
      </g>
    }
  />
);

/* ------------------------------------------------------------------ */
/* Menschen                                                           */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Founder: React.FC<Fig> = (p) => <Person pants="#3A5A8C" {...p} shirt="#15151C" hair="side" hairColor="#2A1E18" skin={P.skin} glasses />;
const Doctor: React.FC<Fig> = (p) => <Person pants="#1D9E86" {...p} shirt="#FFFFFF" hair="bun" hairColor="#2E1A10" skin={P.skin2} />;
const Nerd: React.FC<Fig> = (p) => <Person pants="#2B2F45" {...p} shirt="#E8413A" hair="spiky" hairColor="#B5651D" skin={P.skin} glasses />;
const Kid: React.FC<Fig> = (p) => <Person pants="#1E6BFF" {...p} shirt={P.bus} hair="baby" hairColor="#6B3A1E" skin={P.skin3} />;

/* ------------------------------------------------------------------ */
/* Requisiten + Sets                                                   */
/* ------------------------------------------------------------------ */

/** Herzmonitor; level 1 = normal, 0 = flach unten; t = Laufzeit. */
const Monitor: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly level: number; readonly s?: number; readonly gold?: boolean }> = ({ x, y, t, level, s = 1, gold }) => {
  const pts: string[] = [];
  for (let k = 0; k <= 40; k++) {
    const px = -150 + k * 7.5;
    const ph = (k + t * 0.8) % 14;
    const spike = ph < 1 ? -70 : ph < 2 ? 50 : 0;
    const drift = lerp(110, 0, level) * (k / 40);
    pts.push(`${px},${spike * level + drift}`);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={90} width={24} height={500} fill="#9AA3B5" stroke={INK} strokeWidth={6} />
      <rect x={-180} y={-120} width={360} height={240} rx={22} fill={gold ? C.gold : "#2F3548"} stroke={INK} strokeWidth={9} />
      <rect x={-160} y={-100} width={320} height={200} rx={12} fill="#0C1420" />
      <polyline points={pts.join(" ")} fill="none" stroke={level < 0.35 ? P.red : P.lime} strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
};

const Bed: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly gold?: boolean; readonly blanket?: string; readonly children?: React.ReactNode; readonly cover?: number }> = ({
  x,
  y,
  s = 1,
  gold,
  blanket = "#7FA8FF",
  children,
  cover = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-420} y={-520} width={46} height={560} rx={16} fill={gold ? C.gold : "#B8C2D6"} stroke={INK} strokeWidth={8} />
    <rect x={374} y={-360} width={46} height={400} rx={16} fill={gold ? C.gold : "#B8C2D6"} stroke={INK} strokeWidth={8} />
    <rect x={-400} y={-200} width={800} height={90} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    {children}
    <path d={`M -390 ${-190 - cover * 300} Q 0 ${-260 - cover * 330} 390 ${-190 - cover * 300} L 390 -80 L -390 -80 Z`} fill={gold ? "#FFE27A" : blanket} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-400} y={-90} width={800} height={50} rx={16} fill={gold ? C.goldDark : "#8C96AA"} stroke={INK} strokeWidth={8} />
    {[-330, 330].map((k) => <circle key={k} cx={k} cy={10} r={28} fill={INK} />)}
  </g>
);

const Clinic: React.FC<{ readonly f: number; readonly gold?: boolean }> = ({ f, gold }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={gold ? "#FFE9A8" : C.clinic} />
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={k} x={-600 + k * 220} y={-2000} width={70} height={3500} fill="#FFFFFF" opacity={0.14} />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill={gold ? "#F2C14E" : C.clinicFloor} />
    {Array.from({ length: 14 }).map((_, k) => <line key={k} x1={-400 + k * 140} y1={1500} x2={-700 + k * 200} y2={2400} stroke={INK} strokeWidth={3} opacity={0.15} />)}
    <rect x={640} y={260} width={360} height={300} rx={14} fill="#CFF0FF" stroke={INK} strokeWidth={9} />
    <path d="M 820 260 L 820 560 M 640 410 L 1000 410" stroke={INK} strokeWidth={7} />
    <circle cx={180 + Math.sin(f * 0.05) * 6} cy={300} r={70} fill={gold ? C.gold : "#FFFFFF"} stroke={INK} strokeWidth={8} />
    <path d="M 180 300 L 180 255 M 180 300 L 215 318" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const Wallet: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly open: number; readonly f: number }> = ({ x, y, s = 1, open, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-90} width={300} height={180} rx={24} fill="#8A4B22" stroke={INK} strokeWidth={8} />
    <path d={`M -150 -60 L 150 -60 L 150 ${-60 - open * 90} L -150 ${-60 - open * 140} Z`} fill="#A65E2E" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <g transform="translate(0 20)">
      <Face r={58} skin="#C27A44" eyes="wide" brows="worried" mouth="scream" open={0.6} f={f} />
    </g>
    <Sweat x={110} y={-40} s={0.8} />
  </g>
);

/** Geldscheine, die nach oben/außen wegfliegen. */
const FlyingBills: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly n?: number; readonly up?: boolean; readonly s?: number }> = ({ x, y, t, n = 10, up = true, s = 1 }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => {
      const ph = (t * (1.6 + (k % 3) * 0.4) + k * 23) % 70;
      const dir = (k / n) * Math.PI - Math.PI;
      const dx = Math.cos(dir) * ph * 9;
      const dy = up ? -ph * 11 + ph * ph * 0.06 : ph * 12;
      return <Bill key={k} x={x + dx} y={y + dy} r={(t * 9 + k * 40) % 360} s={1.3 * s} />;
    })}
  </g>
);

const MoneyRain: React.FC<{ readonly t: number; readonly n?: number }> = ({ t, n = 26 }) => (
  <g>
    {Array.from({ length: n }).map((_, k) => (
      <Bill key={k} x={((k * 173) % 1400) - 160 + Math.sin(t * 0.1 + k) * 40} y={((t * (9 + (k % 4) * 2) + k * 131) % 2200) - 300} r={(t * 6 + k * 50) % 360} s={1.5} />
    ))}
  </g>
);

const Spot: React.FC<{ readonly x: number; readonly o?: number; readonly c?: string }> = ({ x, o = 0.35, c = "#FFF6C9" }) => (
  <path d={`M ${x - 60} -400 L ${x - 420} 1550 L ${x + 420} 1550 L ${x + 60} -400 Z`} fill={c} opacity={o} />
);

const StageSet: React.FC<{ readonly f: number; readonly c?: string }> = ({ f, c = C.stage }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={c} />
    {Array.from({ length: 20 }).map((_, k) => (
      <circle key={k} cx={((k * 211) % 1500) - 200} cy={((k * 137) % 900) + 60} r={4 + (k % 3) * 2} fill="#FFFFFF" opacity={0.3 + 0.3 * Math.sin(f * 0.2 + k)} />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#2E2458" />
    <ellipse cx={540} cy={1500} rx={430} ry={70} fill="#FF4FA0" stroke={INK} strokeWidth={8} />
  </g>
);

const Hallway: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill="#FFD9A8" />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#B8693A" />
    <rect x={380} y={560} width={420} height={940} rx={12} fill="#7E4320" stroke={INK} strokeWidth={10} />
    <circle cx={740} cy={1060} r={20} fill={C.gold} stroke={INK} strokeWidth={5} />
    {[-300, 1100].map((x) => <rect key={x} x={x} y={400} width={200} height={260} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={8} />)}
    <path d="M -240 600 L -170 480 L -100 560 L -40 450" fill="none" stroke={P.red} strokeWidth={10} />
    <path d="M 1160 470 L 1230 590 L 1300 500" fill="none" stroke={P.lime} strokeWidth={10} />
  </g>
);

const Office: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill="#3C6BE0" />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={-300 + k * 420} y={200} width={300} height={700} fill="#8ED8FF" stroke={INK} strokeWidth={8} />)}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#253E8A" />
    <path d="M 60 1240 L 1020 1240 L 1080 1330 L 0 1330 Z" fill="#B8693A" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={60} y={1330} width={40} height={180} fill="#7E4320" stroke={INK} strokeWidth={6} />
    <rect x={980} y={1330} width={40} height={180} fill="#7E4320" stroke={INK} strokeWidth={6} />
  </g>
);

const Graveyard: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill="#5B4F9A" />
    <circle cx={860} cy={320} r={110} fill="#FFF4DE" />
    <circle cx={820} cy={300} r={100} fill="#5B4F9A" />
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M ${-100 + k * 450 + Math.sin(f * 0.03 + k) * 30} ${600 + k * 70} q 60 -40 120 0 q 60 -40 120 0`} fill="none" stroke="#8C82C9" strokeWidth={10} strokeLinecap="round" />
    ))}
    <rect x={-2000} y={1450} width={5000} height={2000} fill="#3E7A43" />
    {[-160, 1180].map((x) => <path key={x} d={`M ${x - 70} 1450 L ${x - 70} 1250 Q ${x} 1170 ${x + 70} 1250 L ${x + 70} 1450 Z`} fill="#9AA3B5" stroke={INK} strokeWidth={8} />)}
  </g>
);

const Schoolyard: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill="#FFB27A" />
    <rect x={-400} y={420} width={1900} height={700} fill="#D6574A" stroke={INK} strokeWidth={9} />
    {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-300 + k * 360} y={520} width={220} height={200} fill="#CFF0FF" stroke={INK} strokeWidth={8} />)}
    <rect x={-2000} y={1150} width={5000} height={2000} fill="#9AA3B5" />
    {Array.from({ length: 8 }).map((_, k) => <rect key={k} x={-200 + k * 190} y={1150} width={14} height={300} fill={INK} opacity={0.4} />)}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#7D8597" />
  </g>
);

const NerdRoom: React.FC<{ readonly f: number; readonly glow?: number }> = ({ f, glow = 1 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={C.nerdRoom} />
    <rect x={-200} y={300} width={360} height={240} fill="#2A3670" stroke={INK} strokeWidth={8} />
    <circle cx={-20} cy={420} r={60} fill="#FFE27A" opacity={0.6} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#0E1533" />
    <rect x={480} y={820} width={520} height={380} rx={18} fill="#2F3548" stroke={INK} strokeWidth={9} />
    <rect x={505} y={845} width={470} height={330} rx={10} fill="#BFE8FF" opacity={0.75 + 0.15 * Math.sin(f * 0.7) * glow} />
    {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={540} y={880 + k * 50} width={300 - (k % 2) * 120} height={18} rx={9} fill="#5B8FD6" />)}
    <path d="M 640 1200 L 840 1200 L 880 1260 L 600 1260 Z" fill="#2F3548" stroke={INK} strokeWidth={7} />
    <path d="M 40 1260 L 1080 1260 L 1080 1320 L 40 1320 Z" fill="#6B4A9A" stroke={INK} strokeWidth={8} />
    {[160, 230, 950].map((x, k) => (
      <g key={x} transform={`rotate(${k === 1 ? 70 : 0} ${x} 1240)`}>
        <rect x={x - 26} y={1150} width={52} height={110} rx={10} fill={[P.lime, P.orange, P.pink][k]} stroke={INK} strokeWidth={6} />
      </g>
    ))}
  </g>
);

const Showroom: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill="#FF8FC7" />
    {Array.from({ length: 30 }).map((_, k) => (
      <circle key={k} cx={((k * 197) % 1500) - 200} cy={((k * 131) % 1200) + 80 + Math.sin(f * 0.05 + k) * 20} r={30 + (k % 4) * 10} fill={[P.bus, P.lime, P.sky, P.purple, "#FFFFFF"][k % 5]} opacity={0.55} />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#C9579A" />
    <rect x={160} y={1360} width={760} height={140} rx={20} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
  </g>
);

const Confetti: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    {Array.from({ length: 36 }).map((_, k) => {
      const x = ((k * 137) % 1300) - 100 + Math.sin(f * 0.1 + k) * 30;
      const y = ((f * (6 + (k % 5)) + k * 97) % 1700) - 100;
      return <rect key={k} x={x} y={y} width={22} height={34} fill={[P.bus, P.pink, P.lime, P.sky, P.orange][k % 5]} transform={`rotate(${(f * 7 + k * 40) % 360} ${x} ${y})`} />;
    })}
  </g>
);

const Check: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-260} y={-110} width={520} height={220} rx={14} fill="#E9FBE6" stroke={INK} strokeWidth={8} />
    <rect x={-230} y={-80} width={150} height={26} rx={8} fill="#B9DDB3" />
    <text x={130} y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={110} fill="#1F7A35" stroke={INK} strokeWidth={4} paintOrder="stroke">
      $$$
    </text>
    <path d="M -230 70 q 40 -40 80 0 t 80 0" fill="none" stroke={INK} strokeWidth={6} />
  </g>
);

/** Truthahn-Garanzeige (Pop-up-Timer) auf dem Gerätedach. */
const PopTimer: React.FC<{ readonly x: number; readonly y: number; readonly up: number; readonly s?: number }> = ({ x, y, up, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-20 - up * 110} width={28} height={30 + up * 110} rx={8} fill="#FF3B3B" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-26 - up * 110} rx={26} ry={16} fill="#FF3B3B" stroke={INK} strokeWidth={6} />
    <rect x={-40} y={-4} width={80} height={24} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
  </g>
);

const Steam: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-90, 0, 90].map((k, j) => (
      <path key={k} d={`M ${k} 0 q -30 -60 0 -120 q 30 -60 0 -120`} fill="none" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" opacity={0.5 + 0.4 * Math.sin(t * 0.3 + j)} transform={`translate(0 ${-((t * 3 + j * 30) % 60)})`} />
    ))}
  </g>
);

/** Schwarzer Würfel (Firmenkauf) mit aufklappendem Deckel. */
const Cube: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lid: number; readonly tag?: boolean }> = ({ x, y, s = 1, lid, tag = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-400} width={400} height={400} fill={C.cube} stroke={INK} strokeWidth={9} />
    <path d="M -200 -400 L -140 -460 L 260 -460 L 200 -400 Z" fill="#3A3A46" stroke={INK} strokeWidth={8} strokeLinejoin="round" opacity={1 - lid} />
    <path d="M 200 -400 L 260 -460 L 260 -60 L 200 0 Z" fill="#111116" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <g transform={`rotate(${-lid * 120} -200 -400)`}>
      <rect x={-200} y={-420} width={400} height={20} fill="#3A3A46" stroke={INK} strokeWidth={7} />
    </g>
    {tag ? (
      <g transform="rotate(-12 180 -320)">
        <path d="M 140 -350 L 300 -350 L 330 -310 L 300 -270 L 140 -270 Z" fill={C.gold} stroke={INK} strokeWidth={6} />
        <text x={225} y={-292} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={56} fill={INK}>
          $$$
        </text>
      </g>
    ) : null}
  </g>
);

const Spring: React.FC<{ readonly x: number; readonly y0: number; readonly y1: number }> = ({ x, y0, y1 }) => {
  const n = 7;
  const pts: string[] = [];
  for (let k = 0; k <= n * 2; k++) pts.push(`${x + (k % 2 ? 40 : -40)},${lerp(y0, y1, k / (n * 2))}`);
  return <polyline points={pts.join(" ")} fill="none" stroke="#C9CEDB" strokeWidth={10} strokeLinejoin="round" />;
};

const Plug: React.FC<{ readonly x: number; readonly y: number; readonly r?: number }> = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-30} y={-40} width={60} height={80} rx={10} fill={INK} />
    <rect x={-18} y={-70} width={10} height={32} fill="#C9CEDB" />
    <rect x={8} y={-70} width={10} height={32} fill="#C9CEDB" />
  </g>
);

const Phone: React.FC<{ readonly pct: number; readonly t: number }> = ({ pct, t }) => {
  const pts: string[] = [];
  for (let k = 0; k <= 40; k++) {
    const px = 140 + k * 20;
    const ph = (k + t * 0.8) % 14;
    const spike = ph < 1 ? -60 : ph < 2 ? 45 : 0;
    const drop = clamp01((t - 20) / 40) * (k / 40) * 260;
    pts.push(`${px},${1260 + spike * (1 - clamp01((t - 20) / 40)) + drop}`);
  }
  return (
    <g>
      <rect x={20} y={40} width={1040} height={1840} rx={90} fill={INK} />
      <rect x={50} y={70} width={980} height={1780} rx={70} fill="#151626" />
      <rect x={420} y={90} width={240} height={46} rx={23} fill="#0B0B12" />
      <g transform="translate(540 620)">
        <rect x={-300} y={-140} width={560} height={280} rx={40} fill="none" stroke="#FFFFFF" strokeWidth={22} />
        <rect x={270} y={-50} width={40} height={100} rx={10} fill="#FFFFFF" />
        <rect x={-275} y={-115} width={510 * pct} height={230} rx={22} fill={P.red} />
      </g>
      <polyline points={pts.join(" ")} fill="none" stroke={P.red} strokeWidth={10} strokeLinejoin="round" />
    </g>
  );
};

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

const PatientBed: React.FC<{ readonly f: number; readonly face: FaceP; readonly level: number; readonly money?: boolean; readonly gold?: boolean; readonly cover?: number; readonly timer?: number; readonly shades?: boolean }> = ({
  f,
  face,
  level,
  money,
  gold,
  cover = 0,
  timer = -1,
  shades,
}) => (
  <g>
    <Monitor x={890} y={760} t={f} level={level} s={0.8} gold={gold} />
    <Bed x={470} y={1480} s={0.95} gold={gold} cover={cover}>
      <g transform="translate(-60 -150)">
        <Patient x={0} y={0} s={0.95} legs={false} armL={level < 0.4 ? 150 : 40} armR={level < 0.4 ? 160 : 60} {...face} extra={shades ? <Shades y={-205} w={1.4} /> : timer >= 0 ? <PopTimer x={60} y={-340} up={timer} /> : null} />
      </g>
    </Bed>
    {money ? <FlyingBills x={360} y={1160} t={f} n={12} /> : null}
  </g>
);

export const AHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const it = W("It", 0.3);
  const bro = W("Bro", 0.7);
  const { i, lf, len } = useShot([it - 2, bro - 2], d, f);
  if (i === 0) {
    // COVER + Bild 1: Patient stürzt ab, EKG fällt, Geld fliegt – in Bewegung ab Bild 0
    const lvl = lerp(1, 0.15, ease(lf, 0, Math.min(len, 50)));
    return (
      <Shot cam={camPath(lf, [[0, frameOn(500, 1150, 540, 900, 1.12)], [len, frameOn(500, 1150, 540, 880, 1.28)]])}>
        <Layer depth={0.6}>
          <Clinic f={lf} />
        </Layer>
        <Layer>
          <PatientBed f={lf} level={lvl} money face={{ eyes: "wide", brows: "worried", mouth: "scream", open: 0.8, f: lf }} />
          <Sweat x={250} y={820} s={1.2} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Brieftasche mit Gesicht kotzt Geld aus
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 900, 1.25), x: 540 + jolt(lf, 2, 12) }}>
        <Layer depth={0.5}>
          <ReactBg a="#1E8F6E" b="#27A880" f={lf} cy={950} />
        </Layer>
        <Layer>
          <FlyingBills x={540} y={900} t={lf + 10} n={16} />
          <Wallet x={540} y={1050} s={1.6} open={ease(lf, 0, 8)} f={lf} />
        </Layer>
      </Shot>
    );
  }
  // „Bro was cooked“: Garanzeige springt aus dem Kopf, Dampf
  const pop = W("cooked", 0.85) - (bro - 2);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(410, 1150, 540, 1000, 1.6)], [len, frameOn(410, 1150, 540, 1000, 1.75)]])}>
      <Layer depth={0.6}>
        <Clinic f={lf} />
      </Layer>
      <Layer>
        <PatientBed f={lf} level={0.08} timer={ease(lf, pop - 2, pop + 3)} face={{ eyes: "xx", brows: "worried", mouth: "frown", open: 0.3 }} />
        <Steam x={410} y={980} t={lf} s={1} />
        <Burst x={470} y={830} r0={50} r1={130} n={10} o={bump(lf, pop + 3, 7)} color={P.red} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* question                                                           */
/* ================================================================== */

export const AQuestion: React.FC = () => {
  const { f, d, W } = useBeats();
  const not = W("Not", 0.4);
  const its = W("Its", 0.7);
  const { i, lf, len } = useShot([its - 2], d, f);
  if (i === 0) {
    // Musikplayer fliegt als Retter rein – Hand schiebt ihn zurück („Not at first“)
    const fly = ease(lf, 0, 14);
    const push = ease(lf, not - 2, not + 8);
    const x = lerp(1400, 560, fly) + push * 900;
    return (
      <Shot cam={frameOn(540, 1150, 540, 960, 1.05)}>
        <Layer depth={0.6}>
          <StageSet f={lf} />
          <Spot x={560} />
        </Layer>
        <Layer>
          <g transform={`rotate(${push * 30} ${x} 1200)`}>
            <Pod x={x} y={1450 - Math.sin(fly * Math.PI) * 120} s={1.3} armL={150} armR={160} eyes={push > 0.1 ? "wide" : "open"} brows={push > 0.1 ? "worried" : "up"} mouth={push > 0.1 ? "o" : "grin"} open={0.5} shades={push < 0.1} />
          </g>
          {/* Hand von links */}
          <g transform={`translate(${lerp(-500, 200, ease(lf, not - 8, not)) + push * 300} 1100)`}>
            <rect x={-900} y={-40} width={900} height={80} fill="#15151C" stroke={INK} strokeWidth={8} />
            <ellipse cx={20} cy={0} rx={90} ry={70} fill={P.skin} stroke={INK} strokeWidth={8} />
          </g>
        </Layer>
      </Shot>
    );
  }
  // Silhouette des Rivalen im Gegenlicht, Sonnenbrille blitzt
  const glint = bump(lf, 10, 6);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 960, 1.1)], [len, frameOn(540, 1050, 540, 960, 1.3)]])}>
      <Layer depth={0.6}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#FF9A3D" />
        <circle cx={540} cy={900} r={520} fill="#FFE27A" />
        <rect x={-2000} y={1500} width={5000} height={2000} fill="#3A1E4A" />
      </Layer>
      <Layer>
        <g opacity={0.95}>
          <Rival x={540} y={1500} s={1.4} armL={30} armR={40} eyes="squint" brows="angry" mouth="smug" />
        </g>
        <rect x={340} y={630} width={400} height={900} fill="#2A1238" opacity={0.55} />
        <Burst x={600} y={790} r0={10} r1={70} n={8} o={glint} color="#FFFFFF" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* patient                                                            */
/* ================================================================== */

export const APatient: React.FC = () => {
  const { f, d, W } = useBeats();
  const lk = W("lowkey", 0.65);
  const { i, lf, len } = useShot([lk - 2], d, f);
  if (i === 0) {
    // Ärztin zeigt Röntgenbild: nur Spinnweben und eine Motte
    const moth = lf * 2;
    return (
      <Shot cam={camPath(lf, [[0, frameOn(560, 1100, 540, 960, 1.0)], [len, frameOn(600, 1000, 540, 900, 1.15)]])}>
        <Layer depth={0.6}>
          <Clinic f={lf} />
        </Layer>
        <Layer>
          <PatientBed f={lf} level={0.3} face={{ eyes: "half", brows: "sad", mouth: "frown" }} />
          <Doctor x={880} y={1500} s={1.05} eyes="squint" brows="up" mouth="flat" armL={150} armR={20} />
          <g transform="translate(700 560)">
            <rect x={-190} y={-150} width={380} height={300} rx={10} fill="#1A2238" stroke={INK} strokeWidth={8} />
            <path d="M -170 -130 L -60 -20 M -170 -40 L -90 -110 M -120 -130 L -170 -80" stroke="#DDE6FF" strokeWidth={4} />
            <path d="M 170 -130 L 70 -30 M 170 -50 L 110 -110" stroke="#DDE6FF" strokeWidth={4} />
            <g transform={`translate(${Math.sin(moth * 0.1) * 90} ${Math.cos(moth * 0.13) * 50})`}>
              <ellipse cx={-26} cy={0} rx={30} ry={20} fill="#DDE6FF" />
              <ellipse cx={26} cy={0} rx={30} ry={20} fill="#DDE6FF" />
              <ellipse cx={0} cy={0} rx={10} ry={24} fill="#A9B4D6" />
            </g>
          </g>
        </Layer>
      </Shot>
    );
  }
  // Scham: Decke über den Bildschirm, rot
  const hide = ease(lf, 8, 20);
  return (
    <Shot cam={frameOn(470, 1180, 540, 1000, 1.45)}>
      <Layer depth={0.5}>
        <ReactBg a="#FF6FAE" b="#FF8FC7" f={lf} cy={900} />
      </Layer>
      <Layer>
        <Bed x={470} y={1480} s={0.95} cover={hide * 0.9} blanket="#FFD34D">
          <g transform="translate(-60 -150)">
            <Patient x={0} y={0} s={0.95} legs={false} armL={170} armR={170} eyes="squint" brows="worried" mouth="frown" blush />
          </g>
        </Bed>
        <Sweat x={260} y={830} s={1.1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* jobs                                                               */
/* ================================================================== */

export const AJobs: React.FC = () => {
  const { f, d, W } = useBeats();
  const st = W("Steve", 0.4);
  const it2 = W("Interim", 0.75, 2);
  const { i, lf, len } = useShot([st - 2, it2 - 2], d, f);
  if (i === 0) {
    // Schwarzer Würfel mit Preisschild wird in die Klinik geschoben
    const slide = ease(lf, 0, 18);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 960, 1.0)], [len, frameOn(540, 1150, 540, 960, 1.12)]])}>
        <Layer depth={0.6}>
          <Hallway />
        </Layer>
        <Layer>
          <Cube x={lerp(-300, 470, slide)} y={1500} s={1.1} lid={0} />
          <Patient x={900} y={1500} s={0.8} armL={60} armR={150} eyes="wide" brows="up" mouth="o" open={0.4} look={[-1, 0]} />
          <Burst x={470} y={1050} r0={180} r1={260} n={12} o={bump(lf, 20, 8)} color={C.gold} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Deckel auf: Gründer springt heraus wie ein Spielzeug
    const up = clamp01((lf - 2) / 8);
    const boing = up * (1 + 0.15 * Math.sin(lf * 0.9) * Math.exp(-lf * 0.08));
    const top = 1060 - boing * 380;
    return (
      <Shot cam={frameOn(470, 1000, 540, 960, 1.05)}>
        <Layer depth={0.6}>
          <Hallway />
        </Layer>
        <Layer>
          <Spring x={470} y0={1100} y1={top + 40} />
          <Founder x={470} y={top + 60} s={1.0} eyes="open" brows="up" mouth="grin" armL={150} armR={150} bendL={-20} bendR={-20} />
          <Cube x={470} y={1500} s={1.1} lid={1} tag={false} />
          <Burst x={470} y={top - 300} r0={120} r1={230} n={12} o={bump(lf, 8, 8)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // „Interim. Sure, buddy.“ – Füße auf dem Chefschreibtisch, winziges Schild
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 960, 1.0)], [len, frameOn(470, 980, 540, 860, 1.35)]])}>
      <Layer depth={0.6}>
        <Office />
      </Layer>
      <Layer>
        <rect x={250} y={760} width={420} height={560} rx={60} fill="#22222E" stroke={INK} strokeWidth={9} />
        <Founder x={470} y={1290} s={1.05} seated eyes="half" brows="up" mouth="smug" armL={160} armR={160} bendL={-70} bendR={-70} lean={-6} />
        <g transform="translate(700 1220)">
          <ellipse cx={0} cy={0} rx={60} ry={26} fill={INK} />
          <ellipse cx={90} cy={-10} rx={60} ry={26} fill={INK} />
        </g>
        <path d="M 520 1250 L 700 1220" stroke="#3A5A8C" strokeWidth={50} strokeLinecap="round" />
        <g transform="rotate(-6 860 1180)">
          <rect x={800} y={1150} width={120} height={60} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <path d="M 815 1185 q 15 -15 30 0 t 30 0 t 30 0" fill="none" stroke={INK} strokeWidth={4} />
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* cuts                                                               */
/* ================================================================== */

export const ACuts: React.FC = () => {
  const { f, d, W } = useBeats();
  const it = W("It", 0.6);
  const { i, lf, len } = useShot([it - 2], d, f);
  if (i === 0) {
    // Stecker gezogen: Taschen-Ziegel sackt zusammen
    const yank = W("killed", 0.3) + 2;
    const out = ease(lf, yank, yank + 5);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 960, 1.05)], [len, frameOn(600, 1150, 540, 960, 1.15)]])}>
        <Layer depth={0.6}>
          <Office />
        </Layer>
        <Layer>
          <path d={`M 760 1360 Q ${lerp(560, 420, out)} 1480 ${lerp(430, 260, out)} ${lerp(1310, 1150, out)}`} fill="none" stroke={INK} strokeWidth={10} />
          <rect x={410} y={1290} width={46} height={60} fill="#C9CEDB" stroke={INK} strokeWidth={5} />
          <Plug x={lerp(430, 270, out)} y={lerp(1310, 1140, out)} r={lerp(0, -50, out)} />
          <Founder x={220} y={1500} s={1.0} eyes="half" brows="neutral" mouth="flat" armL={20} armR={lerp(40, 120, out)} />
          <Brick x={800} y={1500} s={1.0} lean={out * 14} armL={lerp(30, 0, out)} armR={lerp(40, 0, out)} eyes={out > 0.5 ? "xx" : "wide"} brows={out > 0.5 ? "sad" : "worried"} mouth={out > 0.5 ? "frown" : "o"} open={0.4} />
          <Burst x={430} y={1300} r0={30} r1={90} n={8} o={bump(lf, yank + 3, 6)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // Friedhof: Grabstein in Ziegelform – daneben ein echter Ziegel, identisch
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 960, 1.0)], [len, frameOn(540, 1250, 540, 1000, 1.25)]])}>
      <Layer depth={0.6}>
        <Graveyard f={lf} />
      </Layer>
      <Layer>
        <rect x={330} y={1060} width={300} height={400} rx={20} fill={C.brick} stroke={INK} strokeWidth={9} />
        <rect x={370} y={1100} width={220} height={170} rx={14} fill="#8E9A76" stroke={INK} strokeWidth={6} />
        <path d="M 440 1150 L 480 1190 M 480 1150 L 440 1190 M 520 1150 L 560 1190 M 560 1150 L 520 1190" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <rect x={700} y={1330} width={180} height={120} rx={8} fill="#C1533C" stroke={INK} strokeWidth={8} />
        <path d="M 700 1390 L 880 1390 M 790 1330 L 790 1390" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((k) => <circle key={k} cx={380 + k * 90} cy={1470} r={22} fill={[P.pink, P.bus, P.purple][k]} stroke={INK} strokeWidth={5} />)}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* enemy                                                              */
/* ================================================================== */

export const AEnemy: React.FC = () => {
  const { f, d, W } = useBeats();
  const th = W("That's", 0.45);
  const hu = W("Humiliating", 0.8);
  const { i, lf, len } = useShot([th - 2, hu - 2], d, f);
  if (i === 0) {
    // Rivale überreicht den Riesen-Scheck im Krankenzimmer
    const give = ease(lf, 10, 28);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(560, 1100, 540, 960, 0.98)], [len, frameOn(560, 1100, 540, 960, 1.1)]])}>
        <Layer depth={0.6}>
          <Clinic f={lf} />
        </Layer>
        <Layer>
          <PatientBed f={lf} level={0.35} face={{ eyes: "wide", brows: "up", mouth: "o", open: 0.5, look: [1, 0] }} />
          <Rival x={900} y={1500} s={0.95} armL={lerp(40, 110, give)} armR={30} eyes="squint" brows="neutral" mouth="smug" />
          <Check x={lerp(760, 560, give)} y={lerp(1050, 950, give)} s={0.75} r={lerp(10, -6, give)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Schulhof: Mobber-Turm hält den Patienten am Kragen hoch … und zahlt ihm die Miete
    const pay = ease(lf, Math.round(len * 0.45), Math.round(len * 0.45) + 8);
    return (
      <Shot cam={frameOn(540, 1100, 540, 960, 1.0)}>
        <Layer depth={0.6}>
          <Schoolyard />
        </Layer>
        <Layer>
          <Rival x={720} y={1500} s={1.0} armL={lerp(150, 95, pay)} armR={20} eyes="squint" brows="angry" mouth={pay > 0.5 ? "smug" : "grin"} />
          <Patient x={400} y={1380 - (1 - pay) * 80} s={0.8} armL={150} armR={150} eyes="wide" brows="worried" mouth={pay > 0.5 ? "o" : "scream"} open={0.6} />
          <FlyingBills x={560} y={1050} t={lf * pay} n={pay > 0.3 ? 8 : 0} up={false} s={0.8} />
          <Sweat x={260} y={900} s={1} />
        </Layer>
      </Shot>
    );
  }
  // „Humiliating as f***“ – Scheck in zitternder Hand, Bildschirm glüht rot
  const shake = Math.sin(lf * 2.3) * 6;
  return (
    <Shot cam={camPath(lf, [[0, frameOn(500, 1000, 540, 900, 1.3)], [len, frameOn(500, 1000, 540, 900, 1.5)]])}>
      <Layer depth={0.5}>
        <ReactBg a="#C8102E" b="#E8413A" f={lf} cy={900} />
      </Layer>
      <Layer>
        <Patient x={500} y={1500} s={1.15} armL={20} armR={120} eyes="squint" brows="sad" mouth="frown" blush look={[1, 0.4]} />
        <Check x={790 + shake} y={980} s={0.6} r={-14 + shake} />
        <Sweat x={300} y={820} s={1.2} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* imac                                                               */
/* ================================================================== */

export const AImac: React.FC = () => {
  const { f, d, W } = useBeats();
  const lk = W("Lowkey", 0.35);
  const ap = W("Apple", 0.55);
  const { i, lf, len } = useShot([lk - 2, ap - 2], d, f);
  if (i === 0) {
    // Bonbon-Computer rollt auf die Bühne, Konfetti
    const inn = ease(lf, 0, 14);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1100, 540, 960, 1.0)], [len, frameOn(540, 1100, 540, 960, 1.15)]])}>
        <Layer depth={0.6}>
          <Showroom f={lf} />
        </Layer>
        <Layer>
          <Device x={lerp(1300, 540, inn)} y={1440} s={1.25} shape={eggShape(C.egg)} armL={150} armR={160} eyes="open" brows="up" mouth="grin" />
          <Device x={150} y={1440} s={0.7} shape={eggShape(P.orange)} armL={120} armR={40} eyes="open" mouth="smile" />
          <Device x={950} y={1440} s={0.7} shape={eggShape(P.purple)} armL={40} armR={120} eyes="open" mouth="smile" flip />
          <Confetti f={lf} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // „Lowkey lickable“ – Kind leckt am Gehäuse, Ärztin zieht es weg
    const pull = ease(lf, Math.round(len * 0.55), Math.round(len * 0.55) + 8);
    return (
      <Shot cam={frameOn(540, 1150, 540, 960, 1.2)}>
        <Layer depth={0.5}>
          <ReactBg a="#19B8D8" b="#4FD3EA" f={lf} />
        </Layer>
        <Layer>
          <Device x={650} y={1450} s={1.1} shape={eggShape(P.lime)} armL={30} armR={30} eyes="wide" brows="worried" mouth="o" open={0.5} look={[-1, 0]} />
          <Kid x={lerp(410, 250, pull)} y={1450} s={0.85} lean={lerp(14, -6, pull)} eyes="closed" brows="up" mouth="drool" open={0.7} armL={20} armR={90} />
          {pull < 0.3 ? <ellipse cx={490} cy={1080} rx={22} ry={34} fill={P.pink} stroke={INK} strokeWidth={5} /> : null}
          <Doctor x={lerp(-300, 90, pull)} y={1500} s={1.0} eyes="squint" brows="angry" mouth="frown" armR={95} />
        </Layer>
      </Shot>
    );
  }
  // EKG geht wieder hoch, Pflaster auf dem Bildschirm
  const lvl = lerp(0.3, 1, ease(lf, 6, 30));
  return (
    <Shot cam={camPath(lf, [[0, frameOn(600, 1050, 540, 960, 1.05)], [len, frameOn(700, 900, 540, 900, 1.2)]])}>
      <Layer depth={0.6}>
        <Clinic f={lf} />
      </Layer>
      <Layer>
        <PatientBed f={lf} level={lvl} face={{ eyes: "open", brows: "up", mouth: "grin", open: 0.3 }} />
        <g transform="translate(470 1000) rotate(-18)">
          <rect x={-90} y={-26} width={180} height={52} rx={20} fill="#FFD9A8" stroke={INK} strokeWidth={5} />
        </g>
        <Burst x={890} y={760} r0={170} r1={240} n={12} o={bump(lf, 30, 10)} color={P.lime} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* ipod                                                               */
/* ================================================================== */

export const AIpod: React.FC = () => {
  const { f, d, W } = useBeats();
  const one = W("One", 0.3);
  const lame = W("Lame", 0.85);
  const { i, lf, len } = useShot([one - 2, lame - 3], d, f);
  if (i === 0) {
    // Musikplayer tanzt im Scheinwerfer
    const bob = Math.sin(lf * 0.45);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 960, 1.0)], [len, frameOn(540, 1150, 540, 960, 1.2)]])}>
        <Layer depth={0.6}>
          <StageSet f={lf} c="#2A1650" />
          <Spot x={540} o={0.4} />
        </Layer>
        <Layer>
          <Pod x={540} y={1460 - Math.abs(bob) * 40} s={1.45} lean={bob * 8} armL={130 + bob * 30} armR={130 - bob * 30} eyes="closed" brows="up" mouth="grin" open={0.4} />
          {[0, 1, 2].map((k) => (
            <text key={k} x={240 + k * 300} y={700 + Math.sin(lf * 0.2 + k) * 40} fontSize={90} fill={[P.pink, P.bus, P.lime][k]} opacity={0.85}>
              ♪
            </text>
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nerd im dunklen Zimmer tippt seine Kritik
    return (
      <Shot cam={camPath(lf, [[0, frameOn(500, 1050, 540, 960, 1.0)], [len, frameOn(500, 1050, 540, 960, 1.12)]])}>
        <Layer depth={0.6}>
          <NerdRoom f={lf} />
        </Layer>
        <Layer>
          <Nerd x={330} y={1440} s={1.05} seated eyes="squint" brows="angry" mouth="smug" armL={60} armR={70} bendR={-40} gest={6} f={lf} look={[1, 0]} />
        </Layer>
      </Shot>
    );
  }
  // ECU: ein Finger, eine Taste – „Lame.“
  const press = bump(lf, 4, 4);
  return (
    <Shot cam={frameOn(540, 1000, 540, 960, 1.0)}>
      <Layer depth={0.5}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0E1533" />
      </Layer>
      <Layer>
        <rect x={60} y={1000} width={960} height={380} rx={30} fill="#2F3548" stroke={INK} strokeWidth={10} />
        {Array.from({ length: 18 }).map((_, k) => (
          <rect key={k} x={100 + (k % 6) * 150} y={1040 + Math.floor(k / 6) * 110} width={120} height={90} rx={14} fill={k === 8 ? "#5B8FD6" : "#454C66"} stroke={INK} strokeWidth={5} transform={k === 8 ? `translate(0 ${press * 14})` : undefined} />
        ))}
        <g transform={`translate(560 ${lerp(760, 1000, ease(lf, 0, 4)) - press * 0})`}>
          <rect x={-40} y={-400} width={80} height={420} rx={40} fill={P.skin} stroke={INK} strokeWidth={8} />
          <path d="M -24 -20 Q 0 -50 24 -20" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
        </g>
        <Burst x={555} y={1090} r0={60} r1={140} n={10} o={bump(lf, 6, 6)} color="#FFFFFF" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rich                                                               */
/* ================================================================== */

export const ARich: React.FC = () => {
  const { f, d, W } = useBeats();
  const lame = W("Lame", 0.75);
  const { i, lf, len } = useShot([lame - 2], d, f);
  if (i === 0) {
    // Höhepunkt: Musikplayer thront auf dem Geldberg, Computer stehen kleinlaut daneben
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1200, 540, 960, 0.95)], [len, frameOn(540, 1000, 540, 850, 1.15)]])}>
        <Layer depth={0.5}>
          <ReactBg a="#FFB800" b="#FFD34D" f={lf} cy={800} />
        </Layer>
        <Layer>
          <path d="M 80 1520 Q 300 1000 540 960 Q 780 1000 1000 1520 Z" fill={C.money} stroke={INK} strokeWidth={9} />
          {Array.from({ length: 14 }).map((_, k) => <Bill key={k} x={220 + (k % 7) * 105} y={1420 - Math.floor(k / 7) * 150 - Math.abs(3 - (k % 7)) * -30} r={(k * 37) % 40 - 20} s={1.4} />)}
          <Pod x={540} y={990} s={1.05} armL={150} armR={170} eyes="half" brows="up" mouth="smug" shades extra={<Chain />} />
          <Device x={120} y={1500} s={0.55} shape={CRT} armL={10} armR={10} eyes="half" brows="sad" mouth="frown" />
          <Device x={960} y={1500} s={0.5} shape={eggShape(C.egg)} armL={10} armR={10} eyes="half" brows="sad" mouth="frown" flip />
          <MoneyRain t={lf} n={22} />
        </Layer>
      </Shot>
    );
  }
  // Nerd: Kiefer fällt, Dose kippt
  const drop = ease(lf, 2, 8);
  return (
    <Shot cam={{ ...frameOn(330, 1040, 540, 900, 1.5), x: frameOn(330, 1040, 540, 900, 1.5).x + jolt(lf, 3, 10) }}>
      <Layer depth={0.6}>
        <NerdRoom f={lf} />
      </Layer>
      <Layer>
        <Nerd x={330} y={1440} s={1.05} seated eyes="wide" brows="up" mouth="scream" open={lerp(0.2, 1, drop)} armL={20} armR={20} look={[1, -0.2]} f={lf} />
        <MoneyRain t={lf + 40} n={10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const AOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const im = W("iMac", 0.3);
  const md = W("made", 0.55);
  const ph = W("can't", 0.75);
  const { i, lf, len } = useShot([im - 2, md - 2, ph - 2], d, f);
  if (i === 0) {
    // „Did the iPod save Apple? Nah.“ – Musikplayer zuckt mit den Schultern
    const shrug = bump(lf, Math.round(len * 0.7), 8);
    return (
      <Shot cam={frameOn(540, 1150, 540, 960, 1.15)}>
        <Layer depth={0.6}>
          <StageSet f={lf} c="#3A1E6B" />
          <Spot x={540} o={0.3} />
        </Layer>
        <Layer>
          <Pod x={540} y={1460} s={1.35} armL={lerp(40, 130, shrug)} armR={lerp(40, 130, shrug)} eyes="half" brows="up" mouth="flat" />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Pfleger-Team: Bonbon-Computer klebt Pflaster, Rivale zahlt
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1100, 540, 960, 0.95)], [len, frameOn(540, 1100, 540, 960, 1.05)]])}>
        <Layer depth={0.6}>
          <Clinic f={lf} />
        </Layer>
        <Layer>
          <PatientBed f={lf} level={0.9} face={{ eyes: "open", brows: "neutral", mouth: "smile" }} />
          <Device x={140} y={1500} s={0.75} shape={eggShape(C.egg)} armL={30} armR={120} eyes="open" mouth="grin" />
          <Rival x={950} y={1500} s={0.8} armL={110} armR={20} eyes="squint" brows="sad" mouth="frown" extra={<Check x={-150} y={-330} s={0.4} r={-10} />} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // „…made it rich“ – goldenes Bett, Sonnenbrille, Geldregen
    return (
      <Shot cam={camPath(lf, [[0, frameOn(470, 1150, 540, 960, 1.05)], [len, frameOn(470, 1150, 540, 960, 1.2)]])}>
        <Layer depth={0.6}>
          <Clinic f={lf} gold />
        </Layer>
        <Layer>
          <PatientBed f={lf} level={1} gold shades face={{ eyes: "half", brows: "up", mouth: "smug" }} />
          <Pod x={880} y={1500} s={0.8} armL={150} armR={30} eyes="open" brows="up" mouth="grin" />
          <MoneyRain t={lf} n={18} />
        </Layer>
      </Shot>
    );
  }
  // POV: Zuschauer-Handy 10 %, Akku-Linie fällt wie das EKG aus Bild 1 (Loop)
  return (
    <Shot cam={{ x: 540, y: 960, zoom: 1 + 0.05 * ease(lf, 0, len) }}>
      <Layer depth={0}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
      </Layer>
      <Layer>
        <Phone pct={lerp(0.1, 0.02, ease(lf, 10, len))} t={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const APPLE_SCENES: Record<string, React.FC> = {
  hook: AHook,
  question: AQuestion,
  patient: APatient,
  jobs: AJobs,
  cuts: ACuts,
  enemy: AEnemy,
  imac: AImac,
  ipod: AIpod,
  rich: ARich,
  outro: AOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(APPLE_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; „$$$“ auf Scheck/Preisschild ist Teil des Gags. */
export const APPLE_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene + Set-Folge (vor dem Render gezählt):
 * Klinik, Comic grün, Klinik | Bühne, Gegenlicht | Klinik, Comic pink | Flur, Flur, Büro | Büro, Friedhof |
 * Klinik, Schulhof, Comic rot | Showroom, Comic blau, Klinik | Bühne lila, Nerd-Zimmer, Tastatur-ECU |
 * Comic gold, Nerd-Zimmer | Bühne, Klinik, Gold-Klinik, POV  → nie > 2 gleiche am Stück, 16 Bildwelten. */
export const APPLE_SHOT_COUNT: Record<string, number> = { hook: 3, question: 2, patient: 2, jobs: 3, cuts: 2, enemy: 3, imac: 3, ipod: 3, rich: 2, outro: 4 };
