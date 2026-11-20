import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/gaehn-stadt.json";
import { useBeats } from "./rollsSets";
import {
  Bridge,
  BridgeSide,
  BusInterior,
  BusSide,
  Burst,
  Cab,
  ChartBubble,
  CROWD,
  Face,
  Granny,
  INK,
  Lemon,
  Mug,
  P,
  Person,
  Pillow,
  Seat,
  Shock,
  Sky,
  Street,
  Stroller,
  Sweat,
  Tape,
  Ted,
  Waves,
  Wheel,
  Zzz,
} from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";

/**
 * „In This City, One Yawn Puts Everyone to Sleep“ – 2D-Cartoon (Drehbuch `style`). 31 Einstellungen, jede an
 * Wort-Beats geschnitten (eine neue Tonspur passt ohne Code-Änderung). Audit 20.11.2026: Bewegung + Konflikt ab
 * Bild 1, Gag alle 5–8 s, nur eine Text-Ebene (Untertitel), kein Set länger als 2 Einstellungen am Stück.
 */

/** Einstellung zum lokalen Frame: Index, Frame seit Schnitt, Länge. */
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

/** Fahrgäste von vorn (Blick vom Fahrer den Gang hinunter), state(i) liefert Mimik je Person. */
const Rows: React.FC<{ readonly state: (i: number, row: number) => Partial<PersonProps>; readonly skip?: readonly number[] }> = ({ state, skip = [] }) => {
  const rows = [
    { y: 1010, s: 0.42, xs: [150, 300, 780, 930] },
    { y: 1240, s: 0.6, xs: [90, 300, 780, 990] },
    { y: 1600, s: 0.86, xs: [60, 330, 750, 1020] },
  ];
  let n = 0;
  return (
    <g>
      {rows.map((r, ri) =>
        r.xs.map((x) => {
          const i = n++;
          if (skip.indexOf(i) >= 0) return null;
          const c = CROWD[(i * 5 + ri) % CROWD.length];
          return (
            <g key={i}>
              <Seat x={x} y={r.y - 120 * r.s} s={r.s * 1.25} c={ri % 2 ? "#3D6BE0" : "#E0533D"} />
              <Person x={x} y={r.y} s={r.s} seated shirt={c.shirt} skin={c.skin} hair={c.hair} hairColor={c.hairColor} {...state(i, ri)} />
            </g>
          );
        }),
      )}
    </g>
  );
};

/** Ted auf dem Fahrersitz von vorn, dahinter der Bus. */
const TedSeat: React.FC<{
  readonly f: number;
  readonly ted: Partial<PersonProps>;
  readonly back?: (i: number, row: number) => Partial<PersonProps>;
  readonly tint?: number;
  readonly wheelR?: number;
  readonly extra?: React.ReactNode;
}> = ({ f, ted, back, tint = 0, wheelR = 0, extra }) => (
  <>
    <Layer depth={0.85}>
      <BusInterior tint={tint} />
      <g transform="translate(270 -380) scale(0.5)">
        <Rows state={back ?? (() => ({ eyes: "open", mouth: "flat" }))} />
      </g>
    </Layer>
    <Layer>
      <Ted x={540} y={1520} s={1.45} seated f={f} {...ted} />
      <g transform="translate(540 1560) scale(1 0.42)">
        <Wheel x={0} y={0} s={1.25} r={wheelR} />
      </g>
      {extra}
    </Layer>
  </>
);

/** Taube (Ursprung = Körpermitte) */
const Pigeon: React.FC<{ readonly x: number; readonly y: number; readonly flap: number; readonly asleep: boolean; readonly r?: number }> = ({ x, y, flap, asleep, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d={`M -40 -10 Q -160 ${-120 * flap} -230 ${-60 * flap + 20} Q -120 30 -40 30 Z`} fill="#9AA3C2" stroke={INK} strokeWidth={7} />
    <ellipse rx={130} ry={80} fill="#B7C0DA" stroke={INK} strokeWidth={7} />
    <circle cx={120} cy={-60} r={62} fill="#B7C0DA" stroke={INK} strokeWidth={7} />
    <path d="M 175 -60 L 225 -48 L 175 -36 Z" fill={P.orange} stroke={INK} strokeWidth={5} />
    <g transform="translate(130 -70)">
      {asleep ? <path d="M -20 0 Q 0 16 20 0" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /> : <circle r={18} fill={P.white} stroke={INK} strokeWidth={5} />}
      {asleep ? null : <circle cx={4} r={9} fill={INK} />}
    </g>
    <path d={`M 40 -10 Q 160 ${-130 * flap} 220 ${-70 * flap + 10} Q 120 30 40 30 Z`} fill="#9AA3C2" stroke={INK} strokeWidth={7} />
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

export const GHook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const pig = B("pigeonDrops", 0.85);
  const { i, lf, len } = useShot([W("One", 0.4) - 4, pig - 5], d, f);
  if (i === 0) {
    // ECU: Gähner, hinter ihm kippen die ersten Passanten (Bewegung + Konflikt ab Bild 1)
    const open = lf < 4 ? lerp(0.55, 0.9, lf / 4) : 0.9 + 0.1 * Math.sin(lf * 0.3);
    const cam = frameOn(540, 1060, 540, 860, lerp(1.2, 1.32, ease(lf, 0, len)));
    const tip = (k: number) => clamp01((lf + 18 - k * 6) / 26);
    return (
      <Shot cam={{ ...cam, x: cam.x + jolt(lf, 10, 6) }}>
        <Layer depth={0.6}>
          <Street />
        </Layer>
        <Layer depth={0.85}>
          {[
            { x: 190, c: CROWD[2], k: 0 },
            { x: 900, c: CROWD[3], k: 1 },
            { x: 330, c: CROWD[4], k: 2 },
          ].map(({ x, c, k }) => {
            const t = tip(k);
            return (
              <Person
                key={x}
                x={x}
                y={1290}
                s={0.8}
                shirt={c.shirt}
                skin={c.skin}
                hair={c.hair}
                hairColor={c.hairColor}
                lean={(x < 540 ? -1 : 1) * 80 * t * t}
                eyes={t > 0.35 ? "closed" : "half"}
                mouth={t > 0.35 ? "drool" : "o"}
                open={0.3}
                brows={t > 0.35 ? "none" : "sad"}
                armL={20 + 60 * t}
                armR={20 + 60 * t}
              />
            );
          })}
        </Layer>
        <Layer>
          <Person x={540} y={1450} s={1} shirt={P.lime} hair="spiky" hairColor="#3A2618" eyes="closed" brows="sad" mouth="yawn" open={open} armL={165} armR={160} lean={-3} />
          <Zzz x={170} y={1000} t={lf - 14} s={0.9} />
          <Zzz x={880} y={1000} t={lf - 20} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Weit: Dominowelle der Passanten, Eis fliegt, der Gähner schaut schuldbewusst
    const cam = camPath(lf, [
      [0, { x: 540, y: 1080, zoom: 0.78 }],
      [len, { x: 560, y: 1060, zoom: 0.84 }],
    ]);
    const people = [-180, 40, 250, 830, 1040, 1250];
    const cone = clamp01(lf / 30);
    return (
      <Shot cam={{ ...cam, y: cam.y + jolt(lf, 8, 10) }}>
        <Layer depth={0.7}>
          <Street />
        </Layer>
        <Layer>
          {people.map((x, k) => {
            const c = CROWD[k % CROWD.length];
            const t = clamp01((lf - Math.abs(x - 540) / 90) / 12);
            return (
              <g key={x}>
                <Person x={x} y={1450} s={0.85} shirt={c.shirt} skin={c.skin} hair={c.hair} hairColor={c.hairColor} lean={(x < 540 ? -1 : 1) * 88 * t * t} eyes={t > 0.4 ? "closed" : "wide"} mouth={t > 0.4 ? "drool" : "o"} open={0.3} brows={t > 0.4 ? "none" : "up"} armL={30 + 80 * t} armR={30 + 80 * t} />
                <Zzz x={x + (x < 540 ? -300 : 300) * t} y={1300} t={lf - 14 - k * 2} s={0.8} />
              </g>
            );
          })}
          <g transform={`translate(${lerp(1060, 700, cone)} ${1000 - 420 * Math.sin(cone * Math.PI)}) rotate(${cone * 540})`}>
            <path d="M -30 0 L 30 0 L 0 90 Z" fill="#E8A55A" stroke={INK} strokeWidth={6} />
            <circle cy={-20} r={42} fill={P.pink} stroke={INK} strokeWidth={6} />
          </g>
          <Person x={540} y={1450} s={0.9} shirt={P.lime} hair="spiky" hairColor="#3A2618" eyes="open" look={[Math.sin(lf * 0.35), 0]} brows="worried" mouth="flat" handMouth armR={20} />
          <Sweat x={640} y={1010} s={1.2} o={clamp01((lf - 20) / 6)} />
        </Layer>
      </Shot>
    );
  }
  // Taube schläft im Flug ein und fällt
  const sleep = lf > 10;
  const fall = Math.max(0, lf - 12);
  return (
    <Shot cam={{ x: 540, y: 960, zoom: 1 }}>
      <Layer depth={0}>
        <Sky id="pigeon" a="#6FC8FF" b="#D9F4FF" />
        {[200, 760, 420].map((x, k) => (
          <ellipse key={x} cx={x} cy={500 + k * 520 - fall * 2} rx={190} ry={70} fill={P.white} opacity={0.9} />
        ))}
      </Layer>
      <Layer>
        <Pigeon x={540 + (sleep ? 0 : lf * 3)} y={760 + fall * fall * 1.6} flap={sleep ? 0.1 : Math.sin(lf * 0.9)} asleep={sleep} r={sleep ? Math.min(30, fall * 3) : 0} />
        <Zzz x={600} y={640 + fall * fall * 1.6} t={lf - 10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const GRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const mouths = W("nobody", 0.7);
  const { i, lf, len } = useShot([W("Boring", 0.32) - 4, mouths - 8], d, f);
  if (i === 0) {
    const pour = 0.5 + 0.5 * Math.sin(lf * 0.4);
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.05 }], [len, { x: 520, y: 980, zoom: 1.15 }]])}>
        <Layer depth={0.8}>
          <rect x={-800} y={-800} width={2700} height={3600} fill="#FF9A5C" />
          {Array.from({ length: 6 }).map((_, k) => (
            <rect key={k} x={-400 + k * 320} y={300} width={180} height={1500} fill="#FFB27E" />
          ))}
          <rect x={-800} y={1150} width={2700} height={1200} fill="#7A3E2A" stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          {/* Barista hinter der Theke gießt aus einer Riesenkanne */}
          <Person x={780} y={1350} s={0.95} shirt={P.pink} hair="pony" hairColor="#1B1210" skin={P.skin3} eyes="half" brows="neutral" mouth="smug" armL={130} armR={150} />
          <rect x={300} y={1170} width={900} height={500} fill="#A65A3A" stroke={INK} strokeWidth={8} />
          <g transform="translate(560 640) rotate(-35)">
            <rect x={-130} y={-120} width={260} height={240} rx={40} fill={P.grey} stroke={INK} strokeWidth={8} />
            <path d="M -130 -40 L -250 -10 L -130 30 Z" fill={P.grey} stroke={INK} strokeWidth={8} />
          </g>
          <path d={`M 380 760 Q ${360 + pour * 10} 900 ${350} 1010`} fill="none" stroke="#6B3A1E" strokeWidth={34} strokeLinecap="round" />
          {/* Kunde mit Eimer-Becher, zittert vor Koffein */}
          <g transform={`translate(${Math.sin(lf * 3.1) * 6} 0)`}>
            <Person x={250} y={1560} s={1.0} shirt={P.orange} hair="spiky" hairColor="#E8B23A" eyes="wide" look={[0.6, -0.5]} brows="up" mouth="grin" armL={60} armR={120} />
            <Mug x={360} y={1290} s={1.15} />
          </g>
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Polizei führt den Folien-Redner ab, Absperrband „DO NOT BORE“
    const drag = ease(lf, 6, len, "inOut");
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 980, zoom: 1.0 }], [len, { x: 600, y: 960, zoom: 1.08 }]])}>
        <Layer depth={0.85}>
          <rect x={-800} y={-800} width={2700} height={3600} fill="#B8F0D8" />
          <rect x={-800} y={1300} width={2700} height={1200} fill="#5FB7A0" stroke={INK} strokeWidth={8} />
          <rect x={120} y={360} width={620} height={440} rx={20} fill={P.white} stroke={INK} strokeWidth={8} />
          <circle cx={430} cy={580} r={150} fill={P.purple} stroke={INK} strokeWidth={8} />
          <path d="M 430 580 L 430 430 A 150 150 0 0 1 570 630 Z" fill={P.orange} stroke={INK} strokeWidth={8} />
          <rect x={-100} y={1150} width={1000} height={70} rx={20} fill="#8A5A3C" stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          <Person x={lerp(520, 760, drag)} y={1520} s={0.95} suit shirt="#6E7690" hair="side" hairColor="#2A1B12" eyes="wide" brows="up" mouth="scream" open={0.5} lean={-18} armL={150} armR={60} />
          <Person x={lerp(800, 1040, drag)} y={1520} s={1.0} shirt="#20306A" hair="spiky" hairColor="#111" eyes="squint" brows="angry" mouth="flat" armL={95} armR={10} />
          <Tape x1={-100} y1={420} x2={1200} y2={1180} text="DO NOT BORE" />
        </Layer>
      </Shot>
    );
  }
  // Bushaltestelle: alle halten sich den Mund zu, Augen huschen
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1060, zoom: 0.92 }], [len, { x: 540, y: 1080, zoom: 1.0 }]])}>
      <Layer depth={0.7}>
        <Street ground={1340} />
        <rect x={60} y={520} width={960} height={40} fill={P.red} stroke={INK} strokeWidth={7} />
        <rect x={80} y={560} width={24} height={780} fill={P.grey} stroke={INK} strokeWidth={5} />
        <rect x={976} y={560} width={24} height={780} fill={P.grey} stroke={INK} strokeWidth={5} />
      </Layer>
      <Layer>
        {[170, 410, 660, 900].map((x, k) => {
          const c = CROWD[(k + 1) % CROWD.length];
          return <Person key={x} x={x} y={1330} s={0.78} shirt={c.shirt} skin={c.skin} hair={c.hair} hairColor={c.hairColor} eyes={k === 2 ? "wide" : "open"} look={[Math.sin(lf * 0.3 + k * 1.7), 0]} brows="worried" handMouth armR={15} />;
        })}
        <Sweat x={740} y={860} s={1.1} o={clamp01((lf - 8) / 6)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* ted                                                                */
/* ================================================================== */

export const GTed: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Ted", 0.36, 3) - 4, W("Ted", 0.66, 4) - 4], d, f);
  if (i === 0) {
    return (
      <Shot cam={camPath(lf, [[0, { x: 440, y: 1120, zoom: 1.3 }], [len, { x: 430, y: 1100, zoom: 1.42 }]])}>
        <Layer depth={0.8}>
          <rect x={-800} y={-800} width={2700} height={3600} fill="#C7D3FF" />
          {Array.from({ length: 5 }).map((_, k) => (
            <rect key={k} x={-300 + k * 380} y={-200} width={60} height={1700} fill="#A8B6F0" />
          ))}
          <rect x={-800} y={1480} width={2700} height={1000} fill="#8A90A8" stroke={INK} strokeWidth={8} />
        </Layer>
        <Layer>
          <BusSide x={1050} y={1500} s={0.95} f={0} />
          <Ted x={330} y={1500} s={1.05} f={lf} eyes="half" brows="neutral" mouth="grin" armR={150 + 22 * Math.sin(lf * 0.5)} armL={10} bags={1} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Nacht: Baby brüllt, Ted schaukelt mit Fläschchen, Uhr 3:07
    const sway = Math.sin(lf * 0.18) * 6;
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.0 }], [len, { x: 560, y: 1000, zoom: 1.08 }]])}>
        <Layer depth={0.85}>
          <rect x={-800} y={-800} width={2700} height={3600} fill="#2E2A6E" />
          <rect x={620} y={300} width={340} height={360} rx={20} fill="#151340" stroke={INK} strokeWidth={8} />
          <circle cx={820} cy={420} r={70} fill="#FFF3B0" />
          <circle cx={250} cy={420} r={110} fill={P.white} stroke={INK} strokeWidth={8} />
          <line x1={250} y1={420} x2={250} y2={340} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <line x1={250} y1={420} x2={290} y2={440} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <rect x={-800} y={1500} width={2700} height={1000} fill="#3E3888" />
        </Layer>
        <Layer>
          <Ted x={330} y={1520} s={1.0} f={lf} lean={sway} eyes="half" brows="sad" mouth="flat" armL={10} armR={95} bags={1} />
          <g transform={`translate(${510 + sway * 4} 1180) rotate(${-60 + sway})`}>
            <rect x={-26} y={-70} width={52} height={130} rx={18} fill={P.white} stroke={INK} strokeWidth={6} />
            <rect x={-12} y={-100} width={24} height={34} rx={10} fill={P.orange} stroke={INK} strokeWidth={5} />
          </g>
          {/* Gitterbett */}
          <rect x={600} y={1150} width={440} height={380} rx={16} fill="none" stroke={P.white} strokeWidth={12} />
          <g transform={`translate(820 1170) scale(${1 + 0.04 * Math.sin(lf * 1.4)})`}>
            <circle r={120} fill={P.skin} stroke={INK} strokeWidth={7} />
            <Face r={120} eyes="closed" brows="angry" mouth="scream" open={0.6 + 0.4 * Math.abs(Math.sin(lf * 0.5))} />
          </g>
          {Array.from({ length: 7 }).map((_, k) => (
            <rect key={k} x={620 + k * 60} y={1230} width={16} height={300} fill={P.white} stroke={INK} strokeWidth={4} />
          ))}
          <Waves x={980} y={1120} f={lf} side={1} color={P.red} />
        </Layer>
      </Shot>
    );
  }
  // ECU: Augenringe bis zum Kinn, eine Fliege landet auf der Nase – keine Reaktion
  const fly = ease(lf, 4, 24, "inOut");
  const fx = lerp(800, 545, fly) + (fly < 1 ? Math.sin(lf * 1.3) * 40 : 0);
  const fy = lerp(900, 1022, fly) + (fly < 1 ? Math.cos(lf * 1.7) * 30 : 0);
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1060, zoom: 3.2 }], [len, { x: 540, y: 1050, zoom: 3.5 }]])}>
      <Layer depth={0.5}>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#C7D3FF" />
      </Layer>
      <Layer>
        <Ted x={540} y={1420} s={1.0} f={lf} eyes="twitch" brows="sad" mouth="flat" bags={1.6} />
        <g transform={`translate(${fx} ${fy})`}>
          <ellipse cx={-10} cy={-14} rx={14} ry={9} fill="#DDF4FF" stroke={INK} strokeWidth={2} opacity={0.9} transform={`rotate(${Math.sin(lf * 4) * 30})`} />
          <ellipse cx={10} cy={-14} rx={14} ry={9} fill="#DDF4FF" stroke={INK} strokeWidth={2} opacity={0.9} />
          <circle r={11} fill={INK} />
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* stakes                                                             */
/* ================================================================== */

export const GStakes: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const push = B("bridgePush", 0.85);
  const { i, lf, len } = useShot([W("longest", 0.5) - 6], d, f);
  if (i === 0) {
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1180, zoom: 1.0 }], [len, { x: 540, y: 1140, zoom: 1.1 }]])}>
        <Layer depth={0.85}>
          <BusInterior />
        </Layer>
        <Layer>
          <Rows state={(k) => ({ handMouth: true, armR: 15, eyes: k % 3 === 0 ? "wide" : "open", look: [Math.sin(lf * 0.25 + k), 0], brows: "worried" })} />
        </Layer>
      </Shot>
    );
  }
  const z = lerp(0.9, 1.0, ease(lf, 0, len)) * (1 + 0.5 * ease(f, push - 6, push + 24, "inOut"));
  const busX = 520 + lf * 1.2;
  return (
    <Shot cam={{ x: lerp(540, busX, ease(f, push - 6, push + 24, "inOut")), y: 1020, zoom: z }}>
      <Layer>
        <BridgeSide f={lf} y={1100} />
        <BusSide x={busX} y={1062} s={0.2} f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* fight                                                              */
/* ================================================================== */

export const GFight: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const bite = B("lemonBite", 0.2);
  const slap = B("slap", 0.6);
  const bow = B("politeBow", 0.88);
  const { i, lf, len } = useShot([W("He", 0.33, 2) - 4, W("He", 0.6, 3) - 4], d, f);
  if (i === 0) {
    const sour = clamp01((f - bite) / 5);
    return (
      <Shot cam={{ ...camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.35 }], [len, { x: 540, y: 990, zoom: 1.5 }]]), x: 540 + jolt(f, bite, 8) }}>
        <TedSeat
          f={lf}
          ted={{ eyes: sour > 0 ? "squint" : "half", brows: sour > 0 ? "angry" : "sad", mouth: sour > 0 ? "pucker" : "o", armR: 207, bags: 1, nod: sour > 0 ? Math.sin(f * 2.2) * 6 : 0 }}
          extra={<Lemon x={sour > 0 ? 640 : 600} y={sour > 0 ? 1060 : 1095} s={0.6} bitten={sour > 0} />}
        />
      </Shot>
    );
  }
  if (i === 1) {
    const bang = Math.sin(lf * 0.75) * 18;
    return (
      <Shot cam={{ x: 540 + Math.sin(lf * 1.6) * 8, y: 960, zoom: 1.7, rot: -6 }}>
        <TedSeat f={lf} ted={{ headphones: true, nod: bang, eyes: "closed", brows: "angry", mouth: "scream", open: 0.6, armL: 150, armR: 150 }} extra={<><Waves x={330} y={900} f={lf} side={-1} /><Waves x={750} y={900} f={lf} side={1} /></>} />
      </Shot>
    );
  }
  // Außen durch die Frontscheibe: Ohrfeige, dann höfliches Nicken zur eigenen Hand
  const hit = bump(f, slap + 2, 6);
  const nodT = clamp01((f - bow) / 8);
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 900, zoom: 1.35 }], [len, { x: 540, y: 890, zoom: 1.45 }]])}>
      <Layer depth={0.8}>
        <Bridge f={lf} />
      </Layer>
      <Layer>
        <rect x={60} y={420} width={960} height={1300} rx={90} fill={P.bus} stroke={INK} strokeWidth={10} />
        <rect x={120} y={480} width={840} height={620} rx={50} fill="#BFEFFF" stroke={INK} strokeWidth={9} />
        <g>
          <clipPath id="ws">
            <rect x={120} y={480} width={840} height={620} rx={50} />
          </clipPath>
          <g clipPath="url(#ws)">
            <Ted x={540} y={1360} s={1.3} seated f={lf} eyes={hit > 0.2 ? "closed" : "half"} brows={nodT > 0 ? "up" : "sad"} mouth={nodT > 0 ? "smile" : hit > 0.2 ? "o" : "flat"} armR={nodT > 0 ? 120 : 200 - 40 * hit} nod={-12 * hit + 10 * nodT} />
            {hit > 0.1 ? <Burst x={400} y={940} r0={70} r1={160} n={8} o={hit} color={P.red} /> : null}
          </g>
        </g>
        <circle cx={220} cy={1300} r={80} fill="#FFF3B0" stroke={INK} strokeWidth={8} />
        <circle cx={860} cy={1300} r={80} fill="#FFF3B0" stroke={INK} strokeWidth={8} />
        <rect x={360} y={1220} width={360} height={150} rx={20} fill="#2B2240" stroke={INK} strokeWidth={7} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* crypto                                                             */
/* ================================================================== */

export const GCrypto: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const jump = B("clockJump", 0.8);
  const { i, lf, len } = useShot([W("For", 0.75) - 5], d, f);
  if (i === 0) {
    const talk = Math.abs(Math.sin(lf * 0.9));
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1060, zoom: 1.0 }], [len, { x: 540, y: 1000, zoom: 1.12 }]])}>
        <Layer depth={0.85}>
          <BusInterior />
        </Layer>
        <Layer>
          <Rows skip={[9, 10]} state={(k) => ({ eyes: k % 2 ? "half" : "squint", brows: "sad", mouth: "flat", nod: Math.sin(lf * 0.1 + k) * 5 })} />
          <Person x={540} y={1700} s={1.15} suit shirt="#8D96B8" hair="side" hairColor="#2A1B12" eyes="wide" brows="up" mouth="talk" open={talk} armL={100 + 30 * Math.sin(lf * 0.4)} armR={130 + 25 * Math.sin(lf * 0.5)} />
          <ChartBubble x={540} y={640} s={1.0} f={lf} o={clamp01(lf / 6)} />
        </Layer>
      </Shot>
    );
  }
  const clock = f < jump ? "8:01" : "8:12";
  return (
    <Shot cam={camPath(lf, [[0, { x: 640, y: 900, zoom: 1.15 }], [len, { x: 640, y: 890, zoom: 1.22 }]])}>
      <Layer>
        <Cab f={lf} clock={clock} />
        {/* Ted im Rückspiegel: zuckendes Auge (Pflanzung des Spiegels für die Schlusspointe) */}
        <g>
          <clipPath id="mir1">
            <rect x={560} y={140} width={520} height={220} rx={50} />
          </clipPath>
          <g clipPath="url(#mir1)">
            <rect x={560} y={140} width={520} height={220} fill="#D7E2F5" />
            <g transform="translate(820 300) scale(1.4)">
              <Face r={130} skin={P.skin} eyes="twitch" brows="sad" mouth="flat" bags={1.2} f={lf} />
            </g>
          </g>
          <rect x={560} y={140} width={520} height={220} rx={50} fill="none" stroke={INK} strokeWidth={10} />
        </g>
        {f >= jump ? <Burst x={540} y={1090} r0={190} r1={260} n={10} o={1 - clamp01((f - jump) / 10)} color="#7CFFB2" /> : null}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* danger                                                             */
/* ================================================================== */

export const GDanger: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const pillow = B("grandmaPillow", 0.7);
  const knows = B("grandmaNod", 0.9);
  const { i, lf, len } = useShot([W("Row", 0.3, 2) - 4, W("A", 0.55) - 4], d, f);
  if (i === 0) {
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1300, zoom: 1.25 }], [len, { x: 540, y: 1280, zoom: 1.35 }]])}>
        <Layer depth={0.85}>
          <BusInterior />
        </Layer>
        <Layer>
          <Rows state={(k, row) => (row === 1 ? { lean: Math.sin(lf * 0.22 + k) * 14, nod: Math.sin(lf * 0.22 + k + 1) * 14, eyes: "half", brows: "sad", mouth: "o" } : { eyes: "wide", brows: "worried", mouth: "flat", handMouth: true, armR: 15 })} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    const jaw = ease(lf, 6, len, "inOut");
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1180, zoom: 1.45 }], [len, { x: 540, y: 1160, zoom: 1.65 }]])}>
        <Layer depth={0.7}>
          <BusInterior />
        </Layer>
        <Layer>
          <Seat x={540} y={1440} s={1.5} c="#E0533D" />
          <Person x={540} y={1560} s={1.0} seated shirt={P.teal} hair="curly" hairColor="#2A1B12" skin={P.skin2} eyes="rolled" brows="none" mouth="yawn" open={0.1 + 0.35 * jaw} nod={-8 * jaw} />
          <Person x={150} y={1700} s={0.9} seated shirt={P.orange} hair="spiky" hairColor="#E8B23A" eyes="wide" look={[1, 0]} brows="up" mouth="scream" open={0.4} armL={150} armR={150} />
          <Person x={930} y={1700} s={0.9} seated shirt={P.pink} hair="pony" hairColor="#1B1210" skin={P.skin3} eyes="wide" look={[-1, 0]} brows="up" mouth="o" handMouth armR={10} />
        </Layer>
      </Shot>
    );
  }
  // Oma am Fenster: zieht Kissen + Schlafmaske, nickt wissend
  const up = ease(f, pillow - 8, pillow + 8, "inOut");
  const nod = clamp01((f - knows) / 8);
  const scroll = lf * 6;
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.0 }], [len, { x: 540, y: 990, zoom: 1.1 }]])}>
      <Layer depth={0.8}>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#FFE9A8" />
        <rect x={80} y={300} width={920} height={620} rx={60} fill={P.sky} stroke={INK} strokeWidth={10} />
        <g>
          <clipPath id="gwin">
            <rect x={80} y={300} width={920} height={620} rx={60} />
          </clipPath>
          <g clipPath="url(#gwin)">
            <rect x={80} y={700} width={920} height={300} fill={P.sea} />
            {Array.from({ length: 8 }).map((_, k) => (
              <rect key={k} x={((k * 260 - scroll) % 1300) + 80} y={640} width={34} height={160} fill="#D9D2E8" stroke={INK} strokeWidth={5} />
            ))}
            <rect x={80} y={620} width={920} height={40} fill={P.red} stroke={INK} strokeWidth={6} />
          </g>
        </g>
      </Layer>
      <Layer>
        <Seat x={560} y={1420} s={2.3} c="#3D6BE0" />
        <Granny x={560} y={1640} s={1.55} seated eyes={nod > 0 ? "half" : "open"} look={[0.6, 0]} brows={nod > 0 ? "up" : "neutral"} mouth={nod > 0 ? "smug" : "flat"} nod={6 * Math.sin(nod * Math.PI)} armR={lerp(20, 150, up)} armL={lerp(10, 40, up)} mask={nod > 0 ? clamp01((f - knows) / 10) : 0} />
        <Pillow x={lerp(860, 800, up)} y={lerp(1900, 900, up)} s={1.2} r={lerp(30, -10, up)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* baby                                                               */
/* ================================================================== */

export const GBaby: React.FC = () => {
  const { f, d, B } = useBeats();
  const big = B("babyMegaYawn", 0.75);
  const { i, lf, len } = useShot([big - 12], d, f);
  if (i === 0) {
    const open = 0.05 + 0.4 * ease(lf, 10, len, "inOut");
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1150, zoom: 1.0 }], [len, { x: 600, y: 1200, zoom: 1.2 }]])}>
        <Layer depth={0.85}>
          <BusInterior />
        </Layer>
        <Layer>
          <Rows skip={[9, 10]} state={(k) => ({ eyes: "wide", look: [k % 4 < 2 ? 1 : -1, 1], brows: "up", mouth: k % 2 ? "scream" : "o", open: 0.5, armL: k % 3 === 0 ? 150 : 15, armR: k % 3 === 0 ? 150 : 15 })} />
          <Stroller x={540} y={1760} s={1.05} open={open} eyes="half" f={lf} />
        </Layer>
      </Shot>
    );
  }
  const t = clamp01((lf - 4) / 36);
  return (
    <Shot cam={{ x: 680 + Math.sin(lf * 2.3) * 6 * (1 - t), y: 1460 + Math.cos(lf * 2) * 6 * (1 - t), zoom: lerp(2.4, 2.7, ease(lf, 0, len)) }}>
      <Layer depth={0.7}>
        <BusInterior tint={0.15} />
      </Layer>
      <Layer>
        <Shock x={680} y={1520} t={t} max={700} />
        <Stroller x={540} y={1760} s={1.05} open={clamp01(0.5 + lf / 10)} eyes="closed" f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* sleep                                                              */
/* ================================================================== */

export const GSleep: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const thump = W("falls", 0.25) - 4;
  const rigid = B("tedRigid", 0.75);
  const { i, lf, len } = useShot([rigid - 4], d, f);
  if (i === 0) {
    return (
      <Shot cam={{ ...camPath(lf, [[0, { x: 540, y: 1180, zoom: 1.0 }], [len, { x: 540, y: 1160, zoom: 1.06 }]]), y: 1170 + jolt(f, thump + 4, 8) + jolt(f, thump + 12, 8) }}>
        <Layer depth={0.85}>
          <BusInterior tint={0.35} />
        </Layer>
        <Layer>
          <Rows
            state={(k) => {
              const t = clamp01((f - thump - (k % 6) * 3) / 6);
              return { eyes: t > 0.5 ? "closed" : "wide", brows: t > 0.5 ? "none" : "up", mouth: t > 0.5 ? "drool" : "o", open: 0.3, nod: 32 * t * (k % 2 ? 1 : -1), lean: 10 * t * (k % 2 ? 1 : -1) };
            }}
          />
          {[200, 880, 540, 330, 760].map((x, k) => (
            <Zzz key={x} x={x} y={900 + (k % 3) * 260} t={f - thump - 10 - k * 3} />
          ))}
        </Layer>
      </Shot>
    );
  }
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.3 }], [len, { x: 540, y: 990, zoom: 1.45 }]])}>
      <TedSeat
        f={lf}
        tint={0.3}
        back={() => ({ eyes: "closed", mouth: "drool", open: 0.3, brows: "none", nod: 25 })}
        ted={{ eyes: "wide", look: [0, 0], brows: "worried", mouth: "flat", armL: 35, armR: 35, bags: 1.2 }}
        extra={<Sweat x={700} y={760} s={1.4} o={clamp01(lf / 6)} />}
      />
    </Shot>
  );
};

/* ================================================================== */
/* why                                                                */
/* ================================================================== */

export const GWhy: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Ted", 0.55) - 4], d, f);
  if (i === 0) {
    const drip = (lf % 40) / 40;
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1060, zoom: 2.6 }], [len, { x: 540, y: 1050, zoom: 2.9 }]])}>
        <TedSeat
          f={lf}
          tint={0.3}
          back={() => ({ eyes: "closed", mouth: "drool", open: 0.3, brows: "none", nod: 25 })}
          ted={{ eyes: "wide", brows: "angry", mouth: "flat", armL: 35, armR: 35, bags: 1.2 }}
          extra={<Sweat x={660} y={lerp(930, 1060, drip)} s={0.7} o={1 - drip} />}
        />
      </Shot>
    );
  }
  const busX = 300 + lf * 3;
  return (
    <Shot cam={{ x: busX + 150, y: 1000, zoom: 1.6 }}>
      <Layer>
        <BridgeSide f={lf} y={1100} />
        <rect x={-3000} y={1068} width={8000} height={6} fill="#FFF3B0" />
        <BusSide x={busX} y={1062} s={0.3} f={lf} sleepT={0} />
        <Zzz x={busX - 40} y={950} t={lf} s={0.8} />
        <Zzz x={busX + 80} y={940} t={lf - 12} s={0.8} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* hero                                                               */
/* ================================================================== */

export const GHero: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const parks = B("busParks", 0.1);
  const { i, lf, len } = useShot([W("Ted", 0.62) - 4], d, f);
  if (i === 0) {
    const stop = ease(f, parks - 20, parks + 6, "smooth");
    const lurch = jolt(f, parks + 6, 10);
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1100, zoom: 0.82 }], [len, { x: 540, y: 1080, zoom: 0.9 }]])}>
        <Layer depth={0.8}>
          <Sky id="hero0" a="#FFB38A" b="#FFE9B0" />
          <circle cx={800} cy={600} r={160} fill="#FFE36B" stroke={INK} strokeWidth={8} />
          <rect x={-800} y={1440} width={2700} height={1000} fill="#8A90A8" stroke={INK} strokeWidth={8} />
          <rect x={-800} y={1100} width={2700} height={350} fill={P.sea} />
        </Layer>
        <Layer>
          <rect x={60} y={700} width={20} height={760} fill={P.grey} stroke={INK} strokeWidth={5} />
          <circle cx={70} cy={680} r={70} fill={P.ted} stroke={INK} strokeWidth={8} />
          <rect x={30} y={660} width={80} height={40} rx={8} fill={P.white} />
          <g transform={`rotate(${lurch * 0.3} ${lerp(-200, 600, stop)} 1440)`}>
            <BusSide x={lerp(-200, 600, stop)} y={1440} s={0.85} f={lf * (1 - stop)} sleepT={0} snore={clamp01((f - parks) / 10)} />
          </g>
        </Layer>
      </Shot>
    );
  }
  const glow = clamp01(lf / 10);
  return (
    <Shot cam={camPath(lf, [[0, { x: 540, y: 1050, zoom: 1.0 }], [len, { x: 540, y: 1000, zoom: 1.08 }]])}>
      <Layer depth={0.6}>
        <Sky id="hero1" a="#FFB38A" b="#FFE9B0" />
        <g opacity={glow}>
          {Array.from({ length: 16 }).map((_, k) => {
            const a = (k / 16) * Math.PI * 2 + lf * 0.01;
            return <path key={k} d={`M 540 900 L ${540 + Math.cos(a) * 1600} ${900 + Math.sin(a) * 1600} L ${540 + Math.cos(a + 0.18) * 1600} ${900 + Math.sin(a + 0.18) * 1600} Z`} fill="#FFE36B" opacity={0.6} />;
          })}
        </g>
      </Layer>
      <Layer>
        <rect x={-200} y={1500} width={1480} height={600} fill={P.bus} stroke={INK} strokeWidth={10} />
        <Ted x={540} y={1520} s={1.5} f={lf} eyes="open" look={[0.3, -0.4]} brows="up" mouth="grin" armL={45} armR={45} bags={0.6} />
        {[0, 1, 2].map((k) => {
          const tt = ((lf / 20 + k / 3) % 1 + 1) % 1;
          return <path key={k} transform={`translate(${[300, 800, 700][k]} ${[500, 560, 380][k]}) scale(${Math.sin(tt * Math.PI)})`} d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill={P.white} stroke={INK} strokeWidth={4} />;
        })}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* turn (+ stumme Hupen-Pointe)                                        */
/* ================================================================== */

export const GTurn: React.FC = () => {
  const { f, d, B } = useBeats();
  const yawn = B("mirrorYawn", 0.6);
  const { i, lf, len } = useShot([yawn - 12, yawn + 30], d, f);
  if (i === 0) {
    return (
      <Shot cam={camPath(lf, [[0, { x: 540, y: 1000, zoom: 1.25 }], [len, { x: 580, y: 960, zoom: 1.35 }]])}>
        <TedSeat
          f={lf}
          back={() => ({ eyes: "closed", mouth: "drool", open: 0.3, brows: "none", nod: 25 })}
          ted={{ eyes: "open", look: [0.8, -1], brows: "up", mouth: "smug", armL: 35, armR: 160, bags: 1 }}
        />
      </Shot>
    );
  }
  if (i === 1) {
    const open = clamp01((lf - 4) / 12);
    return (
      <Shot cam={{ x: 540, y: 960, zoom: lerp(1.0, 1.12, ease(lf, 0, len)) }}>
        <Layer depth={0.6}>
          <rect x={-800} y={-800} width={2700} height={3600} fill="#2E3A70" />
          <rect x={-200} y={-200} width={1500} height={900} fill={P.sky} />
        </Layer>
        <Layer>
          <rect x={60} y={560} width={960} height={600} rx={120} fill="#7F8BA8" stroke={INK} strokeWidth={14} />
          <clipPath id="mir2">
            <rect x={100} y={600} width={880} height={520} rx={100} />
          </clipPath>
          <g clipPath="url(#mir2)">
            <rect x={100} y={600} width={880} height={520} fill="#D7E2F5" />
            <g transform="translate(540 900) scale(1.25)">
              <circle r={240} fill={P.skin} stroke={INK} strokeWidth={8} />
              <Face r={240} skin={P.skin} eyes={open > 0.4 ? "closed" : "wide"} brows="sad" mouth="yawn" open={open} bags={1.1} />
            </g>
            <path d="M 160 640 L 360 640 L 200 1080 L 120 1080 Z" fill={P.white} opacity={0.25} />
          </g>
        </Layer>
      </Shot>
    );
  }
  // Kopf knallt auf die Hupe – HUPE – alle 40 wachen schreiend auf
  const honk = clamp01(lf / 3);
  if (lf >= 14) {
    const k = lf - 14;
    return (
      <Shot cam={{ x: 540 + Math.sin(k * 2.9) * 14, y: 1180 + Math.cos(k * 3.3) * 12, zoom: 1.05 }}>
        <Layer depth={0.85}>
          <BusInterior />
          <Burst x={540} y={700} r0={150} r1={150 + 300 * clamp01(k / 4)} n={16} color={P.red} />
        </Layer>
        <Layer>
          <Rows state={(j) => ({ eyes: "wide", look: [0, -1], brows: "up", mouth: "scream", open: 0.9, armL: 165, armR: 165, lean: (j % 2 ? 1 : -1) * 8 * Math.sin(k * 0.9 + j) })} />
        </Layer>
      </Shot>
    );
  }
  return (
    <Shot cam={{ x: 540 + Math.sin(lf * 2.9) * 12, y: 1000 + Math.cos(lf * 3.3) * 10, zoom: 0.95 }}>
      <TedSeat
        f={lf}
        back={(k) => ({ eyes: "wide", brows: "up", mouth: "scream", open: 0.8, armL: 160, armR: 160, lean: (k % 2 ? 1 : -1) * 6 })}
        ted={{ eyes: "closed", brows: "none", mouth: "drool", open: 0.4, nod: 0, armL: 40, armR: 40, y: 1700 } as Partial<PersonProps>}
        extra={
          <>
            <Burst x={540} y={1560} r0={170} r1={170 + 260 * honk} n={14} color={P.red} />
            <Zzz x={600} y={1200} t={lf} />
          </>
        }
      />
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const GOutro: React.FC = () => {
  const { f, d } = useBeats();
  const lift = ease(f, 0, 10, "inOut");
  return (
    <Shot cam={camPath(f, [[0, { x: 540, y: 1060, zoom: 1.25 }], [d, { x: 540, y: 1080, zoom: 1.45 }]])}>
      <Layer depth={0.8}>
        <rect x={-800} y={-800} width={2700} height={3600} fill="#FFE9A8" />
        <rect x={80} y={300} width={920} height={620} rx={60} fill="#FFB38A" stroke={INK} strokeWidth={10} />
        <rect x={80} y={700} width={920} height={220} fill={P.sea} />
      </Layer>
      <Layer>
        <Seat x={540} y={1420} s={2.3} c="#3D6BE0" />
        <Granny x={540} y={1700} s={1.6} seated eyes="squint" look={[0, 0]} brows="angry" mouth="shh" armR={lerp(20, 228, lift)} finger={lift > 0.8} mask={0} armL={10} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const GAEHN_SCENES: Record<string, React.FC> = {
  hook: GHook,
  rules: GRules,
  ted: GTed,
  stakes: GStakes,
  fight: GFight,
  crypto: GCrypto,
  danger: GDanger,
  baby: GBaby,
  sleep: GSleep,
  why: GWhy,
  hero: GHero,
  turn: GTurn,
  outro: GOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(GAEHN_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): nur Untertitel-Phrasen + Cover-Titel, kein HUD, keine Handlungs-Phrasen, keine Sticker. */
export const GAEHN_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Hilfswert für Prüfskripte: Anzahl Einstellungen je Szene (muss zu useShot-Schnitten passen). */
export const GAEHN_SHOT_COUNT: Record<string, number> = { hook: 3, rules: 3, ted: 3, stakes: 2, fight: 3, crypto: 2, danger: 3, baby: 2, sleep: 2, why: 2, hero: 2, turn: 3, outro: 1 };
