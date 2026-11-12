import React from "react";
import { anticipate, hop } from "../kit/motion";
import {
  beatOr,
  bump,
  Bench,
  Bottle,
  Bridge,
  C,
  Cam2D,
  CO2,
  Deer,
  ease,
  FlagShadow,
  Footprints,
  Fox,
  frameOn,
  Ghost,
  Haze,
  jolt,
  Label,
  Layer,
  lerp,
  MOODS,
  MoonDisc,
  MoonGround,
  NightEarth,
  PaintKit,
  pop,
  Ruler,
  Satellite,
  Skyline,
  Stage2D,
  Stars,
  StoneHeads,
  Telescope,
  Tree,
  Voyager,
  Weeds,
} from "../kit2d";
import { shotIndex, useScene } from "../types";
import { SpaceBack, StreetSet } from "./earthSets";

/** „Earth Without Humans“ Teil 2 (hubble … ending). Konventionen wie earth1.tsx. */

const useBeats = () => {
  const s = useScene();
  return { ...s, f: s.frame, d: s.duration, B: (n: string, fb: number) => beatOr(s.beat, n, fb) };
};

/* ------------------------------------------------------------------ */

export const Hubble: React.FC = () => {
  const { f, d, B } = useBeats();
  const sink = B("hubbleSink", 40);
  const furnace = B("furnace", Math.round(d * 0.6));
  const salute = B("salute", d - 40);
  const hot = ease(f, furnace - 3, furnace + 10);
  const hy = lerp(560, 760, ease(f, 0, sink + 20)) + lerp(0, 120, ease(f, furnace, d));
  // Einstellungen: total → Hubble nah („Earliest re-entry“) → total mit Ofen-Rand → YOU halbnah (Salut)
  const cNear = sink + 26;
  const cOven = furnace - 47;
  const cYou = furnace + 32;
  const shot = shotIndex(f, [cNear, cOven, cYou]);
  const cam =
    shot === 1
      ? frameOn(600, hy, 540, 820, lerp(1.85, 1.95, ease(f, cNear, cOven)))
      : shot === 3
        ? frameOn(380, 931, 540, 820, lerp(1.4, 1.48, ease(f, cYou, d)))
        : { x: 540, y: 960 + jolt(f, furnace, 16), zoom: lerp(1, 1.1, ease(f, 0, d)) };
  const saluting = f >= salute;
  return (
    <Stage2D cam={cam} mood="space">
      <SpaceBack f={f} seed={61} />
      <Layer depth={1}>
        <NightEarth x={540} y={2380} s={3.6} frame={f} lit={() => false} atmo={1 + hot * 1.4} rim={hot > 0.5 ? C.fire : "#5FB4FF"} />
        {/* Ofen-Pointe: Flammenzungen auf dem Rand */}
        {hot > 0
          ? Array.from({ length: 11 }, (_, i) => {
              const a = ((-34 + i * 6.8) * Math.PI) / 180;
              const R = 1152 + 40;
              const x = 540 + R * Math.sin(a);
              const y = 2380 - R * Math.cos(a);
              const h = (70 + 50 * Math.abs(Math.sin(f * 0.4 + i * 1.7))) * hot;
              return (
                <path
                  key={i}
                  d={`M ${-26} 0 Q ${-10} ${-h * 0.6} 0 ${-h} Q 10 ${-h * 0.6} 26 0 Z`}
                  transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
                  fill={i % 2 ? C.fire : C.window}
                />
              );
            })
          : null}
        <Telescope x={600} y={hy} s={0.95} r={-12 + Math.sin(f * 0.03) * 4} shine={1} frame={f} />
        <Ghost
          x={210}
          y={1120}
          s={0.72}
          frame={f}
          armR={saluting ? anticipate(f, salute, 20, 8, 158, { pre: 4, dur: 7 }) : 20}
          armL={18}
          eyes={hot > 0.5 && !saluting ? "wide" : "normal"}
          mouth={saluting ? "flat" : hot > 0.5 ? "o" : "flat"}
          tilt={saluting ? -6 : 0}
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Rust: React.FC = () => {
  const { f, d, B } = useBeats();
  const spread = B("rustSpread", Math.round(d * 0.35));
  const bottle = B("bottle", Math.round(d * 0.6));
  const crack = B("crack", d - 30);
  const rust = ease(f, spread - 6, bottle);
  // Einstellungen: Brücke total → Detail Stahl + Salzluft → Farbeimer ohne Maler (YOU) → Rost wächst (Turm)
  // → Neigung unter die Brücke zur Flasche → Flasche halbnah → Flasche nah (Riss)
  const cSalt = Math.round(spread * 0.38);
  const cPaint = spread - 43;
  const cUnder = bottle - 49;
  const cRobust = bottle + 38;
  const cBreak = crack - 15;
  const shot = shotIndex(f, [cSalt, cPaint, spread, cUnder, cRobust, cBreak]);
  const down = shot < 4 ? 0 : ease(f, cUnder, cUnder + 34, "inOut");
  const towerCam = frameOn(280, 760, 540, 820, lerp(1.4, 1.55, ease(f, spread, cUnder)));
  const waterCam = frameOn(560, 1720, 540, 900, 1.25);
  const cam: Cam2D =
    shot === 0
      ? { x: 540, y: 900, zoom: lerp(1, 1.08, ease(f, 0, cSalt)) }
      : shot === 1
        ? frameOn(280, 720, 540, 860, lerp(2.2, 2.35, ease(f, cSalt, cPaint)))
        : shot === 2
          ? frameOn(330, 860, 540, 860, lerp(2, 2.08, ease(f, cPaint, spread)))
          : shot === 5
            ? frameOn(600, 1700, 540, 900, lerp(1.25, 1.35, ease(f, cRobust, cBreak)))
            : shot === 6
              ? frameOn(600, 1650, 540, 860, lerp(2, 2.1, ease(f, cBreak, d)))
              : { x: lerp(towerCam.x, waterCam.x, down), y: lerp(towerCam.y, waterCam.y, down), zoom: lerp(towerCam.zoom, waterCam.zoom, down) };
  const gx = lerp(360, 720, down);
  const gy = lerp(935, 1700, down);
  const motion = (k: number) => lerp(360, 720, shot < 4 ? 0 : ease(k, cUnder, cUnder + 34, "inOut"));
  const salt = shot === 1 ? 1 : 0;
  return (
    <Stage2D cam={cam} mood="night">
      <Layer depth={0.2}>
        <Stars frame={f} seed={71} count={90} x={-300} y={-300} w={1700} h={1300} reveal={0.8} />
      </Layer>
      <Layer depth={0.45}>
        <path d="M -900 1150 L -500 860 L -200 1000 L 200 900 L 600 1060 L 1000 880 L 1500 1150 Z" fill={MOODS.night.sil[0]} />
      </Layer>
      <Layer depth={1}>
        <rect x={-1200} y={1150} width={3600} height={1600} fill={C.water} />
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M ${-600 + ((i * 230 + f * 2) % 2200)} ${1240 + (i % 5) * 140} q 30 -14 60 0 q 30 14 60 0`}
            stroke="#2E6FA3"
            strokeWidth={6}
            fill="none"
          />
        ))}
        <Bridge x={540} y={1150} s={0.65} rust={rust} />
        <PaintKit x={300} y={936} s={0.75} />
        {/* Salzluft: weiße Körnchen treiben gegen den Stahl */}
        {salt
          ? Array.from({ length: 26 }, (_, i) => {
              const t = ((f * 2.2 + i * 37) % 260) / 260;
              return <circle key={i} cx={60 + t * 300 + (i % 5) * 20} cy={560 + ((i * 53) % 360) + Math.sin(f * 0.1 + i) * 10} r={4 + (i % 3) * 2} fill={C.white} opacity={0.75 * (1 - Math.abs(t - 0.5) * 1.6)} />;
            })
          : null}
        <Bottle x={560} y={1700 + Math.sin(f * 0.12) * 14} r={Math.sin(f * 0.08) * 10} s={1.05} crack={ease(f, crack, crack + 12)} />
        <Ghost x={gx} y={gy} s={0.62} frame={f} motion={motion} eyes={f >= crack ? "wide" : f > spread ? "squint" : "normal"} mouth={f >= crack ? "o" : "flat"} flip={down > 0.5} blinkSeed={3} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Comeback: React.FC = () => {
  const { f, d, B } = useBeats();
  const green = B("greenGrow", Math.round(d * 0.6));
  const fox = B("foxLook", d - 40);
  // Einstellungen: Fahrt total → Detail rostiges Schild (verlassen) → Detail Hirsch („plants and animals“)
  // → Fahrt total (alles grünt) → Fuchs + YOU nah
  const cSign = green - 112;
  const cDeer = green - 59;
  const shot = shotIndex(f, [cSign, cDeer, green, fox - 24]);
  const pan: Cam2D = { x: lerp(400, 660, ease(f, 0, fox - 24, "linear")), y: 930, zoom: 1 };
  const cam: Cam2D =
    shot === 1
      ? frameOn(-20, 900, 540, 820, lerp(2, 2.1, ease(f, cSign, cDeer)))
      : shot === 2
        ? frameOn(lerp(820, 780, ease(f, cDeer, green)), 1100, 540, 860, 1.7)
        : shot === 4
          ? frameOn(560, 1000, 540, 900, lerp(1.45, 1.55, ease(f, fox - 24, d)))
          : { ...pan, zoom: shot === 3 ? 1.06 : 1 };
  const sil = MOODS.nature.sil;
  const g = (i: number) => ease(f, 6 + i * 10, 40 + i * 10) * (0.55 + 0.45 * ease(f, green - 4, green + 14));
  const deerX = lerp(1400, 900, ease(f, 20, 120));
  return (
    <Stage2D cam={cam} mood="nature">
      <Layer depth={0.3}>
        <Skyline seed={17} baseY={1100} color={sil[0]} litFrac={0} />
      </Layer>
      <Layer depth={0.6}>
        <Skyline seed={19} baseY={1180} minH={180} maxH={480} color={sil[1]} litFrac={0} />
        {[-100, 260, 980, 1300].map((x, i) => (
          <Tree key={x} x={x} y={1190} grow={g(i)} s={1.1} color={C.nature} />
        ))}
      </Layer>
      <Layer depth={1}>
        <rect x={-900} y={1220} width={3000} height={1000} fill="#24302C" />
        {[-200, 100, 400, 700, 1000, 1300].map((x) => (
          <path key={x} d={`M ${x} 1220 l 40 60 l -20 50 l 50 70`} stroke="#151C1A" strokeWidth={5} fill="none" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Weeds key={i} x={-150 + i * 190} y={1226} grow={g(i % 4)} s={1.1} />
        ))}
        <Tree x={130} y={1222} grow={g(1)} s={1.25} />
        <Tree x={1180} y={1222} grow={g(2)} s={1.4} />
        {/* rostiges Schild mit Vögeln */}
        <rect x={-30} y={940} width={14} height={282} fill="#5A3A28" />
        <rect x={-110} y={880} width={180} height={90} rx={8} fill={C.rust} stroke={C.ink} strokeWidth={5} />
        {[-80, -20, 40].map((x, i) => (
          <path key={x} d={`M ${x} ${878 - (i === 1 ? Math.abs(Math.sin(f * 0.3)) * 6 : 0)} q 10 -26 26 -10 q 4 -8 12 0 l -6 6 q -10 10 -32 4 Z`} fill="#0E1412" />
        ))}
        <Deer x={deerX} y={1226} s={0.95} step={Math.sin(f * 0.25)} />
        <Bench x={440} y={1226} />
        <Ghost x={430} y={1130} s={0.68} frame={f} bob={false} eyes={f >= fox ? "side" : "normal"} mouth={f >= fox ? "flat" : "smile"} armL={30} armR={30} blinkSeed={3} />
        <Fox x={720} y={1226} s={0.8} look={ease(f, fox, fox + 8)} />
      </Layer>
      <Layer depth={1.5}>
        {[0, 1, 2, 3].map((i) => (
          <Weeds key={i} x={-200 + i * 560} y={1700} grow={1} s={2.4} />
        ))}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Carbon: React.FC = () => {
  const { f, d, B } = useBeats();
  const hazeIn = B("hazeIn", 10);
  const stays = B("hazeStays", d - 45);
  // Einstellungen: Erde + Dunst total → Detail CO₂ am Rand → Ranschnitt YOU → Erde total voller CO₂ → YOU wedelt
  const cAir = hazeIn + 76;
  const cLook = cAir + 56;
  const cGone = stays - 72;
  const shot = shotIndex(f, [cAir, cLook, cGone, stays - 10]);
  const hz = ease(f, hazeIn, hazeIn + 30);
  if (shot < 4) {
    const cam: Cam2D =
      shot === 0
        ? { x: 540, y: 900, zoom: lerp(1, 1.08, ease(f, 0, cAir)) }
        : shot === 1
          ? { x: lerp(470, 520, ease(f, cAir, cLook)), y: 520, zoom: 2.3 }
          : shot === 2
            ? frameOn(800, 1290 - 262 * 0.72, 540, 820, lerp(1.75, 1.85, ease(f, cLook, cGone)))
            : { x: 540, y: 880, zoom: lerp(0.94, 1.02, ease(f, cGone, stays)) };
    const mol = shot === 0 ? ease(f, cAir - 30, cAir) * 0.6 : 1;
    return (
      <Stage2D cam={cam} mood="haze">
        <SpaceBack f={f} seed={81} />
        <Layer depth={0.85}>
          <NightEarth x={540} y={780} s={1.12} rot={f * 0.05} frame={f} lit={() => false} green={1} rim="#9AA0AA" />
          <circle cx={540} cy={780} r={420} fill="none" stroke={C.haze} strokeWidth={110} opacity={0.55 * hz} />
          <Haze y0={560} y1={1000} o={hz * 0.9} frame={f} />
          {/* CO₂-Moleküle in der Lufthülle (bleiben: langsame Drift) */}
          {Array.from({ length: 22 }, (_, i) => {
            const th = (i / 22) * Math.PI * 2 + f * 0.004 * (i % 2 ? 1 : -1);
            const r = 430 + ((i * 37) % 70);
            return <CO2 key={i} x={540 + r * Math.sin(th)} y={780 - r * Math.cos(th)} s={0.32 + (i % 3) * 0.06} r={f * 0.8 + i * 40} o={mol} />;
          })}
        </Layer>
        <Layer depth={1.1}>
          <Ghost
            x={830}
            y={1290}
            s={0.72}
            frame={f}
            eyes={shot === 2 ? "squint" : "side"}
            mouth="frown"
            armL={shot === 2 ? 70 : 18}
            tilt={shot === 2 ? -6 : 0}
            blinkSeed={3}
          />
        </Layer>
      </Stage2D>
    );
  }
  const g = f - stays + 10;
  const wave = 90 + 60 * Math.sin(g * 0.32);
  return (
    <Stage2D cam={frameOn(540, 1180 - 262 * 1.25, 540, 760, 1.05)} mood="haze">
      <SpaceBack f={f} seed={81} />
      <Layer depth={0.5}>
        <NightEarth x={540} y={2200} s={2.4} frame={f} lit={() => false} green={1} rim="#9AA0AA" />
      </Layer>
      <Layer depth={1}>
        <Ghost x={540} y={1180} s={1.25} frame={f} armR={wave} armL={18} eyes="squint" mouth="frown" blinkSeed={3} />
        <Haze y0={640} y1={1060} o={0.95} frame={f * 0.2} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Rushmore: React.FC = () => {
  const { f, d, B } = useBeats();
  const squint = B("squint", Math.round(d * 0.55));
  const hand = B("handLook", d - 45);
  const cInch = Math.round(d * 0.28);
  const cLost = cInch + 70;
  const cSq = squint - 22;
  // Einstellungen: Fels total → Detail Zoll-Lineal am Gesicht → Köpfe + YOU → YOU blinzelt (Ranfahrt) → Hand
  const sub = shotIndex(f, [cInch, cLost, cSq]);
  const shot = shotIndex(f, [hand - 4]);
  const ruler = ease(f, cInch, cInch + 10);
  if (shot === 0) {
    const z =
      sub === 0
        ? anticipate(f, 2, 1, 0.94, 1.06, { pre: 2, dur: 8 })
        : sub === 2
          ? lerp(1.12, 1.18, ease(f, cLost, cSq))
          : lerp(1.18, 1.32, ease(f, squint - 4, squint + 20, "inOut"));
    const cam =
      sub === 1
        ? frameOn(lerp(410, 425, ease(f, cInch, cLost)), 880, 540, 860, lerp(2.4, 2.55, ease(f, cInch, cLost)))
        : sub === 3
          ? frameOn(lerp(640, 700, ease(f, cSq, hand)), 900, 540, 900, z)
          : frameOn(540, 860, 540, 900, z);
    return (
      <Stage2D cam={{ ...cam, y: cam.y + jolt(f, 2, 16) }} mood="night">
        <Layer depth={0.2}>
          <Stars frame={f} seed={91} count={110} x={-300} y={-200} w={1700} h={1100} />
        </Layer>
        <Layer depth={1}>
          <StoneHeads x={520} y={1220} s={0.92} />
          {[-40, 150, 900, 1100].map((x, i) => (
            <Tree key={x} x={x} y={1240} grow={1} s={0.9 + (i % 2) * 0.3} color={C.nature} />
          ))}
          <rect x={-800} y={1230} width={2600} height={900} fill="#0E1A16" />
          <Ruler x={350} y={940} len={140} label="1 INCH" o={ruler} />
          <Ghost x={880} y={1250} s={0.62} frame={f} eyes={f >= squint ? "squint" : "normal"} mouth="flat" tilt={f >= squint ? -8 : 0} flip blinkSeed={3} />
        </Layer>
      </Stage2D>
    );
  }
  const g = f - hand + 4;
  return (
    <Stage2D cam={frameOn(880, 1250 - 262 * 0.62, 540, 700, 2.1)} mood="night">
      <Layer depth={0.5}>
        <StoneHeads x={520} y={1220} s={0.92} />
      </Layer>
      <Layer depth={1}>
        <Ghost
          x={880}
          y={1250}
          s={0.62}
          frame={f}
          armR={anticipate(g, 4, 18, 8, 105, { pre: 3, dur: 8 })}
          eyes={g > 4 ? "wide" : "squint"}
          eyePop={1 + 0.5 * pop(g, 4, 8) * (1 - ease(g, 20, 34))}
          mouth="frown"
          flip
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const MoonScene: React.FC = () => {
  const { f, d, B } = useBeats();
  B("barFreeze", 20);
  const mc = B("matchCutMoon", Math.round(d * 0.3));
  const fp = B("footprints", Math.round(d * 0.5));
  const flag = B("flagShadow", d - 40);
  const shot = shotIndex(f, [mc, fp]);
  // Match Cut: Geisterkopf und Mond-Scheibe an derselben Bildstelle, gleiche Größe
  if (shot === 0) {
    return (
      <Stage2D cam={{ x: 540, y: 960, zoom: lerp(1, 1.06, ease(f, 0, mc)) }} mood="night">
        <SpaceBack f={f} seed={101} />
        <Layer depth={1}>
          <Ghost x={540} y={1400} s={2.6} frame={f} bob={false} eyes="side" mouth="flat" blinkSeed={3} />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const g = f - mc;
    return (
      <Stage2D cam={{ x: 540, y: 958, zoom: lerp(1.06, 1.5, ease(g, 0, fp - mc, "inOut")) }} mood="moon">
        <SpaceBack f={f} seed={101} />
        <Layer depth={1}>
          <MoonDisc x={540} y={958} s={2.4} />
        </Layer>
      </Stage2D>
    );
  }
  const g = f - fp;
  // Einstellungen: Mondboden total → Detail Spuren („Apollo tracks“) → Orbiter am Himmel → Flaggen-Schatten nah
  const cTracks = fp + 47;
  const cOrbiter = flag - 52;
  const sub = shotIndex(f, [cTracks, cOrbiter, flag]);
  const cam =
    sub === 1
      ? frameOn(lerp(400, 480, ease(f, cTracks, cOrbiter)), 1150, 540, 880, 1.8)
      : sub === 2
        ? { x: 600, y: lerp(820, 780, ease(f, cOrbiter, flag)), zoom: 0.95 }
        : sub === 3
          ? frameOn(820, 980, 540, 820, lerp(1.7, 1.8, ease(f, flag, d)))
          : { x: lerp(470, 560, ease(g, 0, cTracks - fp, "linear")), y: 900, zoom: 1 };
  const orbX = lerp(80, 980, ease(f, cOrbiter - 10, flag + 10, "linear"));
  return (
    <Stage2D cam={cam} mood="moon">
      <SpaceBack f={f} seed={103} />
      <Layer depth={0.2}>
        <NightEarth x={860} y={420} s={0.24} frame={f} lit={() => false} />
      </Layer>
      <Layer depth={1}>
        <MoonGround y0={1000} />
        <path d="M -200 1280 Q 300 1150 900 1060 M -200 1330 Q 300 1200 900 1110" stroke="#4A5163" strokeWidth={14} fill="none" strokeDasharray="4 10" opacity={0.85} />
        <Footprints x0={120} y0={1250} x1={760} y1={1050} reveal={ease(f, cTracks - 6, cTracks + 26)} n={16} />
        {sub === 2 ? <Satellite x={orbX} y={430} s={0.7} r={-10} /> : null}
        <FlagShadow x={820} y={1050} s={0.9} shadow={ease(f, flag, flag + 16)} />
        <Ghost x={300} y={1040} s={0.6} frame={f} eyes={sub === 2 ? "wide" : "normal"} mouth={sub === 2 ? "o" : "smile"} armR={sub === 2 ? 130 : 18} blinkSeed={3} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const VoyagerScene: React.FC = () => {
  const { f, d, B } = useBeats();
  const cross = B("voyagerCross", Math.round(d * 0.35));
  const glint = B("recordGlint", Math.round(d * 0.7));
  const vy = lerp(1150, 700, Math.min(1, f / Math.max(1, cross))) - Math.max(0, f - cross) * 1.2;
  // Einstellungen: Anflug nah → Grenze total (HELIOSPHERE) → Detail goldene Platte → Sonde + YOU halbnah („Carter wrote“)
  // → total, Sonde zieht davon („a billion years“)
  const cWide = cross;
  const cRecord = cross + 68;
  const cCarter = glint + 25;
  const cFar = glint + 79;
  const shot = shotIndex(f, [cWide, cRecord, cCarter, cFar]);
  const zoom = shot === 0 ? 1.35 : shot === 1 ? lerp(1.05, 1.1, ease(f, cWide, cRecord)) : shot === 3 ? 1.3 : lerp(0.95, 0.9, ease(f, cFar, d));
  const cam =
    shot === 2
      ? frameOn(320, vy + 38, 540, 820, lerp(2.5, 2.65, ease(f, cRecord, cCarter)))
      : shot === 3
        ? { x: 580, y: vy + 40, zoom }
        : { x: 540, y: vy + 60 / zoom, zoom };
  const wave = f >= glint;
  // Sonde links, YOU rechts, HELIOSPHERE mittig über der Grenze dazwischen (nichts überdeckt sich)
  return (
    <Stage2D cam={cam} mood="space">
      <SpaceBack f={f} seed={111} />
      <Layer depth={0.5}>
        <circle cx={300} cy={1600} r={60} fill="#C9A27A" stroke={C.ink} strokeWidth={5} />
        <g transform="translate(860 1900)">
          <ellipse rx={110} ry={26} fill="none" stroke="#D8C49A" strokeWidth={10} />
          <circle r={50} fill="#D8B878" stroke={C.ink} strokeWidth={5} />
        </g>
      </Layer>
      <Layer depth={1}>
        <circle cx={540} cy={3600} r={2900} fill="none" stroke="#7FD4FF" strokeWidth={8} strokeDasharray="30 20" opacity={0.75} />
        <circle cx={540} cy={3600} r={2900} fill="#7FD4FF" opacity={0.05} />
        <Label x={580} y={655} size={32} color="#BFE6FF" o={shot === 2 ? 0 : ease(f, 15, 27)}>
          HELIOSPHERE
        </Label>
        <Voyager x={290} y={vy} s={0.8} r={-8} glint={bump(f, glint + 4, 10)} />
        <Ghost x={850} y={vy + 100} s={0.62} frame={f} armL={wave ? 130 + 20 * Math.sin(f * 0.5) : 20} eyes="normal" mouth={wave ? "smile" : "flat"} blinkSeed={3} flip />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

export const Ending: React.FC = () => {
  const { f, d, B } = useBeats();
  const dot = B("voyagerDot", 10);
  const sky = B("skyToStreet", Math.round(d * 0.4));
  const loop = B("loopToStreet", d - 20);
  const down = ease(f, sky - 4, sky + 24, "inOut");
  const ht = 1120 - 262 * 1.1;
  const street = frameOn(540, ht, 540, 850, 1);
  // „And it all starts tonight“: Ranschnitt auf YOU in der Straße
  const cTonight = loop - 31;
  // „A message, flying away“: Ranschnitt auf den Lichtpunkt, dann Neigung hinunter in die Straße
  const cDot = dot + 20;
  const cam: Cam2D = f >= cDot && f < sky - 4 ? frameOn(540, -560, 540, 760, lerp(1.8, 2, ease(f, cDot, sky))) : f >= cTonight ? frameOn(540, ht, 540, 820, lerp(1.45, 1.55, ease(f, cTonight, d))) : { x: 540, y: lerp(-520, street.y, down), zoom: 1 };
  const vs = lerp(0.42, 0.03, ease(f, 0, dot + 20));
  const turned = f >= loop;
  const h = hop(f, loop, 0.8, 10);
  return (
    <Stage2D cam={cam} mood="night">
      <StreetSet f={f} lit={0} stars={1} tallSky piles />
      <Layer depth={1}>
        {f >= cDot && f < sky - 4 ? (
          <g>
            <circle cx={540} cy={-560} r={46 + Math.sin(f * 0.3) * 6} fill={C.white} opacity={0.12} />
            <Voyager x={540} y={-560} s={0.11} r={-8} />
          </g>
        ) : vs > 0.06 ? <Voyager x={540} y={-560} s={vs} /> : <circle cx={540} cy={-560} r={5 + Math.sin(f * 0.3) * 1.5} fill={C.white} />}
      </Layer>
      <Layer depth={1}>
        <Ghost
          x={540}
          y={1120 - h.y * 60}
          s={1.1}
          squash={h.squash}
          frame={f}
          eyes={turned ? "normal" : "side"}
          mouth={turned ? "smile" : "flat"}
          tilt={turned ? 0 : -10}
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};
