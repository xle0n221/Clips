import React from "react";
import { anticipate, hop } from "../kit/motion";
import {
  At,
  Badge,
  beatOr,
  bump,
  C,
  Car,
  Cask,
  Chair,
  Clothes,
  ease,
  frameOn,
  FuelPool,
  Ghost,
  HospitalIcon,
  jolt,
  Label,
  Layer,
  lerp,
  MilkyWay,
  MOODS,
  NightEarth,
  Person,
  Phone,
  pop,
  PowerLine,
  RepairTruck,
  Satellite,
  Skyline,
  SPAIN_PATH,
  Spotlight,
  Stage2D,
  Stars,
  Telescope,
  FireTrail,
  TrafficLight,
  Train,
  TrainIcon,
  Cam2D,
} from "../kit2d";
import { shotIndex, useScene } from "../types";
import { PEOPLE, SpaceBack, StreetSet } from "./earthSets";

/**
 * „Earth Without Humans“ Teil 1 (hook … swift). 2D-Stil (Drehbuch `style.look = "2d"`).
 * Kamera je Einstellung aus `frameOn` (Weltpunkt → Bildstelle) bzw. `camPath`.
 * Bildregeln: Köpfe/Schlüsseldinge oberhalb y ≈ 1300 (Untertitel), oben links Zähler bis y ≈ 372.
 */

const useBeats = () => {
  const s = useScene();
  return { ...s, f: s.frame, d: s.duration, B: (n: string, fb: number) => beatOr(s.beat, n, fb) };
};

/** Kopf-Oberkante des Geists (Weltkoordinate) bei Fußpunkt y und Größe s. */
const headTop = (y: number, s: number) => y - 262 * s;

/* ------------------------------------------------------------------ */

export const Hook: React.FC = () => {
  const { f, d, B } = useBeats();
  const poof = B("poof", 50);
  const ghostIn = B("ghostIn", 120);
  const eyeAt = B("eyePop", d - 60);
  // Schnitte innerhalb der Handlung: ghostIn (Ranschnitt halbnah), „And you get one question“ (Ranschnitt YOU), „how long …“ (Detail leere Straße → Pointe)
  const c1 = ghostIn + 54;
  const c2 = Math.min(eyeAt - 40, c1 + 60);
  const shot = shotIndex(f, [c1, c2]);
  const gx = 540;
  const gy = 1120;
  const gs = 1.1;
  const ht = headTop(gy, gs);
  // Kamera: langsame Fahrt die Straße entlang, dann auf YOU (Kopf unter der YOU-Pill bei y 0,42)
  const zIn =
    shot === 0
      ? f < ghostIn
        ? 1
        : lerp(1.28, 1.36, ease(f, ghostIn, c1))
      : shot === 1
        ? lerp(1.75, 1.9, ease(f, c1, c2))
        : anticipate(f, eyeAt, lerp(0.92, 1.02, ease(f, c2, eyeAt)), 0.98, 1.38, { pre: 5, dur: 10 });
  const pan = shot === 2 ? lerp(470, 540, ease(f, c2, eyeAt)) : lerp(470, 540, ease(f, 0, ghostIn + 20));
  const cam = frameOn(pan, ht, 540, 850, zIn);
  const shake = jolt(f, poof, 12);
  const o = ease(f, ghostIn - 4, ghostIn + 12);
  const wide = f >= eyeAt;
  const eyePop = 1 + 0.55 * pop(f, eyeAt, 8) * (1 - ease(f, eyeAt + 18, eyeAt + 34));
  // „one question“: Zeigefinger hoch (Ausholen kurz nach dem Schnitt)
  const oneUp = shot === 1 ? anticipate(f, c1 + 8, 14, 6, 150, { pre: 4, dur: 8 }) : 14;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + shake }} mood="night">
      <StreetSet f={f} lit={1} />
      <Layer depth={1}>
        {PEOPLE.map((p, i) => {
          const at = poof + i * 2;
          const walk = (Math.min(f, at) / Math.max(1, poof)) * 40 * p.dir;
          const px = p.x + walk;
          return (
            <g key={i}>
              <Clothes x={p.x + p.dir * 40} y={1240} color={p.c} drop={ease(f, at + 3, at + 12)} s={1.05} />
              <Person x={px} y={1240} color={p.c} s={1.15} step={Math.sin(f * 0.3 + i)} pop={f < at ? 0 : ease(f, at, at + 12, "linear")} />
            </g>
          );
        })}
        {/* Handys fallen */}
        {[
          [330, -20],
          [760, 25],
        ].map(([x, r], i) => {
          const t = ease(f, poof + 2 + i * 3, poof + 14 + i * 3, "inOut");
          return f > poof ? <Phone key={i} x={x + 30} y={lerp(1080, 1215, t)} r={r + t * 70} s={0.45} screen={shot !== 2 || Math.floor(f / 10) % 2 === 0} /> : null;
        })}
        <Ghost
          x={gx}
          y={gy + (1 - o) * 70}
          s={gs}
          frame={f}
          o={o}
          eyes={wide ? "wide" : f > eyeAt - 5 ? "squint" : shot === 2 ? "side" : "normal"}
          eyePop={eyePop}
          mouth={wide ? "o" : shot === 1 ? "smile" : "flat"}
          armL={wide ? 40 : 14}
          armR={wide ? 40 : oneUp}
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Lights: React.FC = () => {
  const { f, d, B } = useBeats();
  const dots = B("cityDots", 40);
  const glow = B("glowPulse", 100);
  const flick = B("flicker", d - 40);
  const reveal = ease(f, dots - 12, dots + 14);
  const pulse = bump(f, glow + 6, 12);
  const off = f > flick && Math.floor((f - flick) / 3) % 2 === 0;
  // „Zoom out“: aus dem Lichtermeer zurück bis zum ganzen Globus
  const cam: Cam2D = { x: 540 + Math.sin(f * 0.02) * 10, y: 900, zoom: lerp(1.9, 1, ease(f, 0, 45, "inOut")) };
  const view = f > flick;
  return (
    <Stage2D cam={cam} mood="space">
      <SpaceBack f={f} />
      <Layer depth={0.85}>
        <NightEarth
          x={540}
          y={780}
          s={1.12}
          rot={f * 0.05}
          frame={f}
          pulse={pulse}
          lit={(dx, t) => t < reveal && !(off && dx > 0.35 && t < 0.5)}
        />
      </Layer>
      <Layer depth={1.15}>
        <Ghost x={830} y={1290} s={0.72} frame={f} armR={view ? 20 : 125} armL={view ? 60 : 20} eyes={view ? "squint" : "side"} mouth={view ? "smile" : "flat"} blinkSeed={3} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Stromnetz über Spanien: Stränge Süd → Nord (Kartenkoordinaten, Mitte 0/0). */
const GRID: [number, number][][] = [
  [[-200, 160], [-150, 60], [-160, -60], [-120, -190]],
  [[-60, 190], [-40, 80], [-70, -40], [-30, -200]],
  [[80, 160], [60, 40], [90, -80], [60, -210]],
  [[200, 90], [160, -10], [210, -120], [180, -190]],
  [[-150, 60], [-40, 80], [60, 40], [160, -10]],
  [[-160, -60], [-70, -40], [90, -80], [210, -120]],
];

export const Blackout: React.FC = () => {
  const { f, d, B } = useBeats();
  const train = B("trainHalt", 60);
  const bars = B("noBars", Math.round(d * 0.55));
  const truck = B("emptyTruck", d - 70);
  const hosp = Math.round((train + bars) / 2);
  // Einstellungen (je 1–3 s): Karte total → Karte nah (Zug) → Krankenhaus → Handy → dunkle Stadt (Zug/Ampel, Trupps) → „Tonight?“ → leerer Wagen
  const hit = Math.max(30, train - 49);
  const cHosp = hosp - 9;
  const cCity = bars + 40;
  const cTonight = truck - 34;
  const shot = shotIndex(f, [hit, cHosp, bars, cCity, cTonight, truck]);
  const front = lerp(240, -260, ease(f, 12, bars - 10, "linear"));
  const sil = MOODS.danger.sil;

  if (shot <= 2) {
    // Karte Spanien: At(540, 880, 1.35) → Zug-Badge bei Welt (365, 1028), Krankenhaus bei (729, 840)
    const cam =
      shot === 0
        ? { x: 540, y: lerp(900, 880, ease(f, 0, hit)), zoom: lerp(1, 1.06, ease(f, 0, hit)) }
        : shot === 1
          ? frameOn(430, 990, 540, 860, lerp(1.55, 1.68, ease(f, hit, cHosp)))
          : frameOn(729, 840, 540, 820, lerp(2.1, 2.25, ease(f, cHosp, bars)));
    return (
      <Stage2D cam={{ ...cam, y: cam.y + jolt(f, train, 10) }} mood="danger">
        <Layer depth={0.3}>
          <Stars frame={f} seed={8} count={60} x={-200} y={0} w={1500} h={1700} reveal={0.4} />
        </Layer>
        <Layer depth={1}>
          <At x={540} y={880} s={1.35}>
            <path d={SPAIN_PATH} transform="translate(8 10)" fill="#000" opacity={0.4} />
            <path d={SPAIN_PATH} fill="#2A1428" stroke={C.ink} strokeWidth={5} />
            {GRID.map((line, i) =>
              line.slice(1).map((p, k) => {
                const a = line[k];
                const midY = (a[1] + p[1]) / 2;
                return <PowerLine key={`${i}-${k}`} d={`M ${a[0]} ${a[1]} L ${p[0]} ${p[1]}`} on={midY > front ? 0 : 1} />;
              }),
            )}
            <Label x={-10} y={-250} size={40} color={C.white} o={shot === 0 ? 1 : 0}>
              SPAIN
            </Label>
            <Badge x={-130} y={110} s={0.62 * pop(f, train)} color={C.white}>
              <TrainIcon />
              <path d="M -60 -60 L 60 60" stroke={C.danger} strokeWidth={10} strokeLinecap="round" />
            </Badge>
            <Badge x={140} y={-30} s={0.62 * pop(f, hosp)} color={C.white}>
              <HospitalIcon />
            </Badge>
          </At>
        </Layer>
        {shot === 0 ? (
          <Layer depth={1.1}>
            <Ghost x={900} y={1290} s={0.58} frame={f} eyes="side" mouth="frown" blinkSeed={3} />
          </Layer>
        ) : null}
      </Stage2D>
    );
  }
  if (shot === 3 || shot === 5) {
    // Handy ohne Netz (halbnah) bzw. „Tonight?“ (Ranschnitt aufs Gesicht)
    const g = f - (shot === 3 ? bars : cTonight);
    const close = shot === 5;
    const cam = close
      ? frameOn(500, 1250 - 262 * 1.5, 540, 760, lerp(1.7, 1.8, ease(g, 0, truck - cTonight)))
      : frameOn(540, 1250 - 262 * 1.5, 540, 760, lerp(1, 1.06, ease(g, 0, cCity - bars)));
    return (
      <Stage2D cam={cam} mood="danger">
        <Layer depth={0.35}>
          <Skyline seed={9} baseY={1180} color={sil[0]} litFrac={0} />
        </Layer>
        <Layer depth={0.7}>
          <Skyline seed={12} baseY={1250} minH={160} maxH={420} color={sil[1]} litFrac={0} />
        </Layer>
        <Layer depth={1}>
          <rect x={-800} y={1250} width={2600} height={900} fill={sil[2]} />
          <Ghost x={500} y={1250} s={1.5} frame={f} eyes={close ? "wide" : "side"} mouth={close ? "o" : "frown"} armR={close ? 20 : 64} blinkSeed={3} />
          {close ? null : <Phone x={700} y={1000 + Math.sin(g * 0.4) * 4} r={-12 + Math.sin(g * 0.9) * 6 * (1 - ease(g, 0, 20))} s={1.05} bars={0} screen={false} noSignal />}
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 4) {
    // „The south stayed dark all night … with crews fixing it“: Stadt, Zug, Ampel dunkel; Trupps mit Lampen
    const g = f - cCity;
    const crews = ease(g, 30, 44);
    const cam = { x: lerp(470, 610, ease(g, 0, cTonight - cCity, "linear")), y: 930, zoom: 1.05 };
    return (
      <Stage2D cam={cam} mood="danger">
        <Layer depth={0.35}>
          <Skyline seed={14} baseY={1060} minH={260} maxH={640} color={sil[0]} litFrac={0} />
        </Layer>
        <Layer depth={0.7}>
          <Skyline seed={23} baseY={1120} minH={160} maxH={420} color={sil[1]} litFrac={0} />
          {/* Hochbahn mit stehendem Zug, Fenster dunkel */}
          <rect x={-600} y={1000} width={2400} height={26} fill="#1A1222" stroke={C.ink} strokeWidth={5} />
          {[-300, 200, 700, 1200].map((x) => (
            <rect key={x} x={x} y={1026} width={30} height={120} fill="#1A1222" />
          ))}
          <Train x={-120} y={1000} cars={4} s={0.8} />
        </Layer>
        <Layer depth={1}>
          <rect x={-800} y={1230} width={2600} height={900} fill={sil[2]} />
          <TrafficLight x={860} y={1240} s={0.95} on={0} />
          {/* Reparaturtrupps mit Stirnlampen (Lichtkegel) */}
          {[420, 560].map((x, i) => (
            <g key={x} opacity={crews}>
              <path d={`M ${x} ${1070} L ${x + 260 - i * 520} ${1240} L ${x + 120 - i * 240} ${1240} Z`} fill={C.window} opacity={0.22} />
              <Person x={x} y={1240} color={C.fire} s={0.8} step={Math.sin(g * 0.3 + i) * 0.4} />
              <rect x={x - 22} y={1240 - 0.8 * 212} width={44} height={14} rx={6} fill={C.window} />
            </g>
          ))}
          <Ghost x={220} y={1230} s={0.7} frame={f} eyes="side" mouth="frown" blinkSeed={3} />
        </Layer>
      </Stage2D>
    );
  }
  const g = f - truck;
  const cam = { x: 560, y: 960 + jolt(g, 0, 14), zoom: lerp(1.05, 1.18, ease(g, 0, d - truck)) };
  return (
    <Stage2D cam={cam} mood="danger">
      <Layer depth={0.35}>
        <Skyline seed={14} baseY={1150} color={sil[0]} litFrac={0} />
      </Layer>
      <Layer depth={1}>
        <rect x={-800} y={1200} width={2600} height={900} fill={sil[2]} />
        <RepairTruck x={500} y={1210} s={1.05} door={ease(g, 0, 8)} />
        <Ghost x={930} y={1180} s={0.78} frame={f} eyes="wide" mouth="o" armL={60} armR={20} blinkSeed={3} flip />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Darkness: React.FC = () => {
  const { f, d, B } = useBeats();
  const last = B("lastDotOff", d - 25);
  B("globeDark", 40);
  const front = lerp(1.3, -1.3, ease(f, 6, last, "inOut"));
  const zoom = lerp(1, 1.75, ease(f, last - 4, last + 22, "inOut"));
  const cam = frameOn(lerp(540, 540, 0), lerp(780, 1080, ease(f, last - 4, last + 22, "inOut")), 540, lerp(780, 860, ease(f, last - 4, last + 22)), zoom);
  return (
    <Stage2D cam={cam} mood="space">
      <SpaceBack f={f} seed={41} />
      <Layer depth={0.85}>
        <NightEarth x={540} y={780} s={1.12} rot={f * 0.05 + 4} frame={f} lit={(dx) => dx < front} />
      </Layer>
      <Layer depth={1}>
        <Ghost x={540} y={1300} s={0.8} frame={f} eyes={f > last ? "wide" : "side"} mouth="frown" armL={10} armR={10} blinkSeed={3} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const StarsScene: React.FC = () => {
  const { f, d, B } = useBeats();
  const fill = B("starsFill", 25);
  const mw = B("milkyWay", Math.round(d * 0.6));
  const clap = B("slowClap", d - 50);
  // Einstellungen: YOU auf dem Auto (nah) → Schwenk hoch, Milchstraße schwach bei „Milky Way“ → Ranschnitt Gesicht
  // → Himmel voll („full blast“) → Klatschen
  const c1 = fill + 22;
  const mention = fill + 57;
  const c2 = fill + 105;
  const shot = shotIndex(f, [c1, c2, mw, clap - 6]);
  const tilt = ease(f, c1, mention + 4, "inOut");
  const cam: Cam2D =
    shot === 0
      ? frameOn(700, 960, 540, 980, lerp(1.55, 1.65, ease(f, 0, c1)))
      : shot === 1
        ? { x: 540, y: lerp(1010, 640, tilt), zoom: lerp(1.25, 0.9, tilt) }
        : shot === 2
          ? frameOn(760, 960, 540, 900, lerp(1.7, 1.8, ease(f, c2, mw)))
          : shot === 3
            ? { x: 540, y: lerp(700, 620, ease(f, mw, clap)), zoom: lerp(0.86, 0.8, ease(f, mw, clap)) }
            : frameOn(560, 982, 540, 900, lerp(1.5, 1.62, ease(f, clap, d)));
  const mwO = Math.max(0.6 * ease(f, mention - 12, mention + 6), ease(f, mw - 4, mw + 24));
  const h = hop(f, 4, 1.2, 12);
  const clapping = f >= clap;
  const arm = clapping ? 70 + 45 * Math.abs(Math.sin((f - clap) * 0.22)) : 20;
  const sil = MOODS.night.sil;
  return (
    <Stage2D cam={cam} mood="night">
      <Layer depth={0.2}>
        <Stars frame={f} seed={51} count={260} x={-700} y={-700} w={2500} h={1900} reveal={0.15 + 0.85 * ease(f, fill, mw)} />
        <MilkyWay o={mwO} frame={f} cx={540} cy={250} />
      </Layer>
      <Layer depth={0.45}>
        <Skyline seed={3} baseY={1150} minH={300} maxH={700} color={sil[0]} litFrac={0} />
      </Layer>
      <Layer depth={0.75}>
        <Skyline seed={7} baseY={1220} minH={160} maxH={460} color={sil[1]} litFrac={0} />
      </Layer>
      <Layer depth={1}>
        <rect x={-900} y={1258} width={2900} height={1200} fill={sil[2]} />
        <Car x={640} y={1262} />
        <Ghost
          x={760}
          y={982 - h.y * 60}
          s={1}
          squash={h.squash}
          lying
          bob={false}
          frame={f}
          eyes={clapping ? "squint" : shot === 2 ? "wide" : "normal"}
          mouth={clapping ? "flat" : shot === 2 ? "o" : "smile"}
          armL={arm}
          armR={arm}
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Nuclear: React.FC = () => {
  const { f, d, B } = useBeats();
  const chair = B("emptyChair", Math.round(d * 0.4));
  const casks = B("casks", Math.round(d * 0.6));
  const warm = B("warmHands", d - 40);
  // Einstellungen: Becken total → Messlatte/Brennelemente nah → leerer Stuhl → YOU („Operators. Right.“)
  // → Brennelemente („Other fuel“) → Behälter total → YOU wärmt sich
  const cDepth = chair - 71;
  const cOps = chair + 89;
  const cFuel = casks - 33;
  const cWarm = casks + 45;
  const shot0 = shotIndex(f, [cDepth, chair, cOps, cFuel, casks, cWarm]);
  // Becken-Einstellungen 0, 1, 4 teilen sich die Kulisse; Stuhl 2/3, Behälter 5/6
  if (shot0 === 0 || shot0 === 1 || shot0 === 4) {
    const cam =
      shot0 === 0
        ? { x: 540, y: lerp(880, 940, ease(f, 0, cDepth)), zoom: lerp(1, 1.06, ease(f, 0, cDepth)) }
        : shot0 === 1
          ? frameOn(690, 860, 540, 900, lerp(1.9, 2.05, ease(f, cDepth, chair)))
          : frameOn(530, 1070, 540, 860, lerp(2.3, 2.45, ease(f, cFuel, casks)));
    return (
      <Stage2D cam={cam} mood="night">
        <Layer depth={1}>
          <rect x={-600} y={520} width={2300} height={1800} fill="#1A2036" />
          <At x={540} y={600} s={0.85}>
            <FuelPool x={0} y={0} frame={f} ruler={ease(f, 20, 40)} />
          </At>
          <Ghost x={880} y={590} s={0.56} frame={f} eyes="side" mouth="flat" blinkSeed={3} flip />
        </Layer>
      </Stage2D>
    );
  }
  const shot = shot0 === 2 || shot0 === 3 ? 1 : 2;
  if (shot === 1) {
    const g = f - chair;
    const cam =
      shot0 === 3
        ? frameOn(170, 1150 - 262 * 0.7, 540, 820, lerp(1.9, 2, ease(f, cOps, cFuel)))
        : { x: 540, y: 960, zoom: lerp(1, 1.12, ease(g, 0, cOps - chair)) + jolt(g, 0, 0.02) };
    const blink = Math.floor(g / 8) % 2 === 0;
    return (
      <Stage2D cam={cam} mood="night">
        <Layer depth={0.6}>
          <rect x={-400} y={300} width={1900} height={1000} fill="#141A30" />
          {[200, 540, 880].map((x, i) => (
            <g key={x}>
              <rect x={x - 140} y={520} width={280} height={180} rx={12} fill="#0B0F22" stroke={C.ink} strokeWidth={6} />
              <rect x={x - 120} y={540} width={240} height={140} rx={6} fill={i === 1 && blink ? C.danger : "#1E3A5C"} />
              {i === 1 ? (
                <Label x={x} y={630} size={44} color={C.white} o={blink ? 1 : 0.4}>
                  ALARM
                </Label>
              ) : null}
            </g>
          ))}
        </Layer>
        <Layer depth={1}>
          <rect x={-400} y={1000} width={1900} height={1100} fill="#0A0E1E" />
          <rect x={-100} y={880} width={1300} height={70} fill="#2A3150" stroke={C.ink} strokeWidth={6} />
          <Chair x={540} y={1200} spin={g * 9} s={1.1} />
          <Ghost x={170} y={1150} s={0.7} frame={f} eyes={shot0 === 3 ? "squint" : "side"} mouth={shot0 === 3 ? "flat" : "o"} tilt={shot0 === 3 ? -8 : 0} blinkSeed={3} />
        </Layer>
      </Stage2D>
    );
  }
  const g = f - casks;
  const cam =
    shot0 === 6
      ? frameOn(lerp(560, 600, ease(f, cWarm, d)), 1150 - 210, 540, 820, 1.7)
      : { x: lerp(420, 560, ease(g, 0, cWarm - casks, "linear")), y: 900, zoom: 1.05 };
  const warming = f >= warm;
  return (
    <Stage2D cam={cam} mood="night">
      <Layer depth={0.4}>
        <rect x={-600} y={300} width={2400} height={800} fill="#151B33" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-500 + i * 260} y={380} width={30} height={720} fill="#10162B" />
        ))}
      </Layer>
      <Layer depth={1}>
        <rect x={-600} y={1200} width={2600} height={900} fill="#0B0F1F" />
        {[160, 420, 740, 1000].map((x, i) => (
          <Cask key={x} x={x} y={1210} frame={f + i * 17} s={0.95} />
        ))}
        <Ghost
          x={590}
          y={1150}
          s={0.8}
          frame={f}
          armL={warming ? 78 : 18}
          armR={warming ? 78 : 18}
          eyes={warming ? "squint" : "normal"}
          mouth={warming ? "smile" : "flat"}
          blinkSeed={3}
          flip
        />
      </Layer>
      <Layer depth={1.6}>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={-200 + i * 420} y={1150} width={34} height={500} fill="#05070F" />
        ))}
        <rect x={-600} y={1240} width={3600} height={16} fill="#05070F" />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

const EARTH_C: [number, number] = [540, 1950];

export const Satellites: React.FC = () => {
  const { f, d, B } = useBeats();
  const near = B("nearMiss", Math.round(d * 0.2));
  const stick = B("emptyJoystick", Math.round(d * 0.35));
  const spot = B("spotlight", Math.round(d * 0.5));
  const swell = B("airSwell", Math.round(d * 0.7));
  const dip = B("satDip", d - 30);
  const shot = shotIndex(f, [stick, spot, swell]);
  // Einstellung 0 geteilt: Bahnen total → Beinahe-Zusammenstoß nah (Zoom ≥ 1,6) → YOU nah („Not you.“)
  const cSelf = Math.min(stick - 30, near + 83);
  const sub = shotIndex(f, [near, cSelf]);

  if (shot === 0) {
    const base =
      sub === 0
        ? { x: 540, y: 960 + Math.sin(f * 0.03) * 8, zoom: lerp(1, 1.08, ease(f, 0, near)) }
        : sub === 1
          ? frameOn(500, 860, 540, 800, lerp(1.6, 1.72, ease(f, near, cSelf)))
          : frameOn(400, 1050 - 262 * 0.6, 540, 820, lerp(2, 2.1, ease(f, cSelf, stick)));
    const cam = base;
    const sat = (r: number, th: number) => [EARTH_C[0] + r * Math.sin(th), EARTH_C[1] - r * Math.cos(th)] as const;
    const t1 = (f - near - 8) * 0.0035;
    const a = sat(1150, t1);
    const b = sat(1170, -t1);
    const warn = bump(f, near + 8, 14);
    return (
      <Stage2D cam={cam} mood="space">
        <SpaceBack f={f} />
        <Layer depth={1}>
          {[1150, 1300, 1480].map((r) => (
            <circle key={r} cx={EARTH_C[0]} cy={EARTH_C[1]} r={r} fill="none" stroke="#7F8BB8" strokeWidth={4} strokeDasharray="14 18" opacity={0.6} />
          ))}
          <NightEarth x={EARTH_C[0]} y={EARTH_C[1]} s={2.5} frame={f} lit={() => false} />
          <Satellite x={a[0]} y={a[1]} r={t1 * 57} s={0.8} warn={warn} frame={f} />
          <Satellite x={b[0]} y={b[1]} r={-t1 * 57} s={0.8} />
          {[0.5, -0.45, 0.25].map((th, i) => {
            const r = [1300, 1300, 1480][i];
            const p = sat(r, th + f * 0.002 * (i % 2 ? -1 : 1));
            return <Satellite key={i} x={p[0]} y={p[1]} s={0.6} r={i * 30} />;
          })}
          <Ghost
            x={400}
            y={1050}
            s={0.6}
            frame={f}
            armR={sub === 2 ? 30 : warn > 0 ? 150 : 120}
            armL={sub === 2 ? 30 : 18}
            tilt={sub === 2 ? 10 * Math.sin((f - cSelf) * 0.35) : 0}
            eyes={sub === 2 ? "side" : warn > 0 ? "wide" : "normal"}
            mouth={sub === 2 ? "frown" : warn > 0 ? "o" : "flat"}
            blinkSeed={3}
          />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const g = f - stick;
    const wob = Math.sin(g * 0.35) * 14;
    return (
      <Stage2D cam={{ x: 540, y: 960, zoom: lerp(1, 1.1, ease(g, 0, spot - stick)) + jolt(g, 0, 0.02) }} mood="space">
        <SpaceBack f={f} />
        <Layer depth={1}>
          <rect x={110} y={560} width={860} height={700} rx={36} fill="#151B33" stroke={C.ink} strokeWidth={8} />
          <rect x={150} y={600} width={780} height={300} rx={18} fill="#0B0F22" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={300 + i * 240} cy={750} r={70} fill="none" stroke="#4FC3F7" strokeWidth={5} strokeDasharray="10 10" />
          ))}
          <rect x={150} y={980} width={780} height={60} fill="#2A3150" stroke={C.ink} strokeWidth={6} />
          <g transform={`translate(400 990) rotate(${wob})`}>
            <rect x={-10} y={-110} width={20} height={110} fill="#5D6889" stroke={C.ink} strokeWidth={5} />
            <circle cy={-118} r={24} fill={C.danger} stroke={C.ink} strokeWidth={5} />
          </g>
          <Chair x={640} y={1230} spin={20} s={0.8} />
          <Ghost x={890} y={1240} s={0.62} frame={f} armL={100} armR={100} eyes="side" mouth="frown" blinkSeed={3} flip />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 2) {
    const g = f - spot;
    const cam = frameOn(540, 1150 - 262 * 1.3, 540, lerp(720, 760, ease(g, 0, 20)), lerp(1, 1.14, ease(g, 0, swell - spot)));
    return (
      <Stage2D cam={cam} mood="space">
        <SpaceBack f={f} />
        <Layer depth={1}>
          <Spotlight x={540} y={1160} o={ease(g, 0, 8)} w={300} />
          <Ghost x={540} y={1150} s={1.3} frame={f} eyes="wide" eyePop={1 + 0.4 * pop(g, 2, 8) * (1 - ease(g, 18, 30))} mouth="o" armL={30} armR={30} blinkSeed={3} />
        </Layer>
      </Stage2D>
    );
  }
  const g = f - swell;
  const atmo = lerp(1, 3.4, ease(g, 0, 30));
  const dr = 70 * ease(f, dip, dip + 14);
  return (
    <Stage2D cam={{ x: 540, y: 1000, zoom: lerp(1.05, 0.98, ease(g, 0, d - swell)) }} mood="space">
      <SpaceBack f={f} />
      <Layer depth={1}>
        <NightEarth x={540} y={1560} s={1.55} frame={f} lit={() => false} atmo={atmo} rim="#7FC8FF" />
        {[-0.55, -0.15, 0.3, 0.62].map((th, i) => {
          const r = 700 - dr + i * 18;
          const t = th + f * 0.003;
          return <Satellite key={i} x={540 + r * Math.sin(t)} y={1560 - r * Math.cos(t)} s={0.55} r={t * 57} warn={dr > 0 && i === 1 ? 0.6 * bump(f, dip + 6, 10) : 0} frame={f} />;
        })}
        <Ghost x={880} y={700} s={0.55} frame={f} eyes="side" mouth="frown" blinkSeed={3} flip />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Swift: React.FC = () => {
  const { f, d, B } = useBeats();
  const face = B("swiftFace", 20);
  const burn = B("swiftBurn", Math.round(d * 0.65));
  const tease = B("hubbleTease", d - 45);
  // Swift sinkt am Höhen-Lineal vorbei (300 → 250 MI), dann Feuer
  // Absturz endet bei Welt-y 1200 → Bild-y ≈ 1220 (Untertitelband ab ≈ 1300 bleibt frei)
  const sy = lerp(520, 1000, ease(f, 0, burn, "linear")) + lerp(0, 200, ease(f, burn, burn + 40, "smooth"));
  const sx = 600 + lerp(0, -260, ease(f, burn, burn + 40));
  const pan = ease(f, tease - 2, tease + 14, "inOut");
  const cam: Cam2D = { x: lerp(540, 1640, pan), y: lerp(Math.min(sy, 1000) - 60, 900, pan), zoom: 1 };
  const fire = ease(f, burn, burn + 6) * (1 - ease(f, burn + 30, burn + 44));
  const inset = 1 - pan;
  return (
    <Stage2D cam={cam} mood="space">
      <SpaceBack f={f} />
      <Layer depth={1}>
        {/* Höhen-Lineal */}
        <rect x={150} y={-200} width={26} height={2000} fill="#2A3460" />
        {[
          [300, 400],
          [275, 700],
          [250, 1000],
          [225, 1300],
        ].map(([mi, y]) => (
          <g key={mi}>
            <rect x={130} y={y - 5} width={110} height={10} fill={mi === 250 ? C.fire : C.white} />
            <Label x={260} y={y + 16} size={42} anchor="start" color={mi === 250 ? C.fire : C.white}>
              {`${mi} MI`}
            </Label>
          </g>
        ))}
        <FireTrail x={sx - 60} y={sy - 40} o={fire} frame={f} r={-60} len={520} />
        <Telescope x={sx} y={sy} s={0.75 * (1 - 0.6 * ease(f, burn + 20, burn + 44))} r={-20 + 40 * ease(f, burn, burn + 30)} face={f >= face - 10} frame={f} />
        <Telescope x={1640} y={900} s={0.8} shine={pan} frame={f} r={-8} />
        <Ghost x={sx + 260} y={Math.min(sy, 1000) + 230 - pan * 60} s={0.55} frame={f} armL={f > burn ? 150 : 25} armR={f > burn ? 150 : 25} eyes={f > burn ? "wide" : "side"} mouth={f > burn ? "o" : "flat"} blinkSeed={3} flip={pan < 0.5} />
      </Layer>
      {/* Einsatz-Rahmen „REAL“ (Bildraum) */}
      <g opacity={inset}>
        <rect x={50} y={420} width={980} height={860} rx={30} fill="none" stroke={C.white} strokeWidth={6} strokeDasharray="26 16" opacity={0.85} />
        <rect x={70} y={1240} width={430} height={66} rx={14} fill={C.danger} stroke={C.ink} strokeWidth={5} />
        <Label x={285} y={1288} size={38} color={C.white}>
          REAL · NOV 2026
        </Label>
      </g>
    </Stage2D>
  );
};
