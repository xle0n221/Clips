import React from "react";
import { camPath, ease, frameOn, jolt, Layer, lerp, LuxDefs, pop, Stage2D } from "../kit2d";
import { shotIndex } from "../types";
import { TopShade } from "./huangSets";
import { Confetti, Convertible, DateSheet, LC, LT, Pad, Palm, Stamp, StateMap, Toon, toonHand, toonHeadY } from "./luciaSets";
import { BOARD_END, CoverScene, JasonBust, JPHOTO_CAM } from "./jason1";
import { BigPolaroid, EdgeArm, Fog, Gate, Halo, hasReal, IndexCard, JPolaroid, KeysDay, Pinboard, Pipe, RealMedia, RedString, Roof, SplitArt, Spray, Water, Wrench } from "./jasonSets";
import { useBeats } from "./rollsSets";

/**
 * „Who is Jason from GTA 6?“ Teil 2 (trailer … loop). Eigene Bildideen (kein Trailer-Standbild): Dach mit Rohrzange,
 * neutrales Tor ohne Schild, eigenes Cabrio, Profil-Seite mit Spiegel, eigener Controller, Abreißkalender, Loop ins Cover.
 */

/** Kleines Brustbild Lucia (Polaroid-Inhalt, lokal). */
const LuciaBust: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-160} y={-200} width={320} height={360} fill="#FF9E7A" />
    <rect x={-160} y={20} width={320} height={160} fill="#2EC4D6" />
    <Toon x={0} y={268} s={0.56} frame={f} mouth="smirk" look={-0.3} blinkSeed={5} breathe={false} />
  </g>
);

/* ------------------------------------------------------------------ */

/**
 * trailer: Jason auf dem Flachdach mit Rohrzange („roof“), das Rohr spritzt ihm ins Gesicht („leaks“, Slapstick); Schnitt ans
 * neutrale Tor: er lehnt am eigenen Cabrio, Lucia (türkises Band) tritt heraus („Lucia“).
 */
export const Trailer: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const roof = B("roofWrench", 0.25);
  const leaks = B("pipeSpray", 0.45);
  const lucia = B("luciaAtGate", 0.68);
  const cutB = Math.max(W("And", 0.59) - 4, leaks + 26);
  const shot = shotIndex(f, [cutB]);
  if (shot === 0) {
    const floor = 1180;
    const jx = 420;
    const js = 0.95;
    const turn = f >= roof ? 10 * Math.sin((f - roof) * 0.35) * (1 - ease(f, leaks, leaks + 4)) : 0;
    const wet = f >= leaks;
    const armR: [number, number] = wet ? [150, 30] : [62 + turn * 0.4, 48];
    const hand = toonHand(1, armR, "jason");
    const hx = jx + hand[0] * js;
    const hy = floor + hand[1] * js;
    const handDry = toonHand(1, [62, 48], "jason");
    const collar: [number, number] = [jx + handDry[0] * js + 44, floor + handDry[1] * js + 8];
    const head: [number, number] = [jx + 10, floor + toonHeadY("jason") * js];
    const cam = camPath(f, [
      [0, frameOn(520, 900, 540, 900, 1.0)],
      [leaks, frameOn(500, 880, 540, 900, 1.12)],
      [cutB, frameOn(490, 870, 540, 900, 1.16)],
    ]);
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, roof, 6) + jolt(f, leaks, 10) }} mood="night" noSky>
        <LuxDefs />
        <Layer depth={0.35}>
          <KeysDay f={f} id="roof" x0={-1200} w={3400} horizon={1060} />
          <Palm x={-80} y={1240} s={0.8} lean={8} color="#2F6B4A" sway={2 * Math.sin(f * 0.05)} />
          <Palm x={1160} y={1240} s={0.9} lean={-6} color="#2F6B4A" sway={2 * Math.sin(f * 0.05 + 1)} />
        </Layer>
        <Layer>
          <Roof y={floor} />
          <Pipe x={collar[0] + 30} y={floor} h={floor - collar[1] + 150} />
          <Toon
            x={jx}
            y={floor}
            s={js}
            frame={f}
            who="jason"
            armR={armR}
            armL={wet && f > leaks + 20 ? [150, 40] : [30, 30]}
            eyes={wet ? "closed" : "narrow"}
            mouth={wet ? "o" : "grit"}
            brows={wet ? "up" : "angry"}
            look={1}
            lean={wet ? -8 * (1 - ease(f, leaks + 24, leaks + 40)) : 3}
            blinkSeed={11}
          />
          {!wet ? <Wrench x={hx} y={hy} r={-70 + turn} s={0.9} /> : <Wrench x={collar[0] - 10} y={floor - 20} r={-88} s={0.9} />}
          <Spray a={[collar[0] + 30, collar[1] - 120]} b={[head[0] + 40, head[1] + 10]} t={ease(f, leaks - 2, leaks + 4)} f={f} />
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const floor = 1250;
  const walk = ease(f, lucia - 16, lucia + 14, "inOut");
  const lx = lerp(260, 420, walk);
  const cam = camPath(f, [
    [cutB, frameOn(540, 920, 540, 920, 1.0)],
    [d, frameOn(560, 930, 540, 920, 1.05)],
  ]);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer depth={0.4}>
        <KeysDay f={f} id="gate" x0={-1200} w={3400} horizon={1300} />
      </Layer>
      <Layer>
        <Gate x={260} floor={floor} />
        <rect x={-2000} y={floor} width={5000} height={1000} fill="#C9C1B0" stroke={LC.ink} strokeWidth={6} />
        <Convertible x={790} y={floor} s={0.72} wheel={0} />
        <Toon x={600} y={floor} s={0.95} frame={f} who="jason" lean={7} armL={[30, 140]} armR={[30, 140]} look={f >= lucia - 20 ? -1 : 0} mouth={f >= lucia ? "smile" : "smirk"} blinkSeed={11} />
        <Toon x={lx} y={floor} s={0.9} frame={f} walk={walk > 0 && walk < 1} step={Math.sin(f * 0.4)} look={1} mouth={f >= lucia ? "smile" : "flat"} brows={f >= lucia ? "up" : "neutral"} blinkSeed={5} o={ease(f, lucia - 18, lucia - 10)} />
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * couple: rote Schnur verbindet beide Polaroids („couple“, HUD CRIMINAL COUPLE), Karteikarte JASON + LUCIA; Cabrio-Nahe
 * auf der Brücke („Bonnie and Clyde“, Gesichter groß); Karte: echtes Satellitenbild Florida (NASA) neben der eigenen
 * LEONIDA-Form („twin“).
 */
export const Couple: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const couple = B("redStringCouple", 0.2);
  const twin = B("leonidaTwinMap", 0.8);
  const cutB = Math.max(W("Think", 0.39) - 4, couple + 30);
  const cutC = Math.max(W("in", 0.66) - 4, cutB + 45);
  const shot = shotIndex(f, [cutB, cutC]);
  if (shot === 0) {
    const jp = { x: 310, y: 900 };
    const lp = { x: 770, y: 910 };
    const cam = camPath(f, [
      [0, frameOn(540, 860, 540, 880, 0.98)],
      [cutB, frameOn(540, 860, 540, 880, 1.06)],
    ]);
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Pinboard id="couple" f={f} />
          <IndexCard x={540} y={560} text="JASON + LUCIA" s={pop(f, couple - 6, 10)} />
          <JPolaroid x={jp.x} y={jp.y} s={0.95} r={-4} id="cj" label="JASON" color={LC.pinkDark}>
            <JasonBust f={f} />
          </JPolaroid>
          <JPolaroid x={lp.x} y={lp.y} s={0.95} r={4} id="cl" label="LUCIA" color={LC.tealDark}>
            <LuciaBust f={f} />
          </JPolaroid>
          <RedString a={[jp.x, jp.y - 180]} b={[lp.x, lp.y - 180]} t={ease(f, couple - 12, couple + 2, "inOut")} sag={70} />
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const cam = frameOn(540, 980, 540, 960, lerp(1.0, 1.05, ease(f, cutB, cutC)));
    const run = (f - cutB) * 26;
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer depth={0.3}>
          <KeysDay f={f} id="bridge" x0={-1200} w={3400} horizon={1060} />
        </Layer>
        <Layer>
          <Water y={1180} f={f} id="bridge" />
          {/* Brücke: Fahrbahn + Geländer (zieht nach links = Fahrt nach rechts) */}
          <rect x={-2000} y={1150} width={5000} height={60} fill="#B8B0A2" stroke={LC.ink} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => {
            const x = ((i * 260 - run) % 3120) + (i * 260 - run < 0 ? 3120 : 0) - 600;
            return <rect key={i} x={x} y={1210} width={60} height={400} fill="#9A9284" stroke={LC.ink} strokeWidth={5} />;
          })}
          <Convertible x={540} y={1150} s={1.5} wheel={(f - cutB) * 22}>
            <Toon x={40} y={20} s={0.6} frame={f} who="jason" look={1} mouth="smile" blinkSeed={11} breathe={false} />
            <Toon x={-170} y={24} s={0.58} frame={f} look={1} mouth="smirk" brows="up" blinkSeed={5} breathe={false} />
          </Convertible>
        </Layer>
        <Layer depth={1.4}>
          <path d="M -2000 1190 L 4000 1190" stroke="#8A8274" strokeWidth={14} />
          {Array.from({ length: 8 }, (_, i) => {
            const x = ((i * 420 - run * 1.4) % 3360) + (i * 420 - run * 1.4 < 0 ? 3360 : 0) - 800;
            return <rect key={i} x={x} y={1050} width={22} height={150} fill="#8A8274" stroke={LC.ink} strokeWidth={4} />;
          })}
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const real = hasReal("floridaSat");
  const cam = frameOn(540, 900, 540, 900, lerp(1.04, 1.0, ease(f, cutC, d)));
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="#9ED8E0" />
        {real ? (
          <JPolaroid x={300} y={900} s={0.95 * pop(f, cutC + 2, 10)} r={-5} id="fl-sat" label="FLORIDA" color={LC.tealDark}>
            <RealMedia slot="floridaSat" x={-150} y={-180} w={300} h={320} kb={{ t: (f - cutC) / 70, z0: 1.0, z1: 1.06 }} />
          </JPolaroid>
        ) : null}
        <g opacity={ease(f, twin - 8, twin + 4)}>
          <StateMap x={real ? 790 : 540} y={900} s={real ? 0.5 : 0.75} label="" />
        </g>
        {real ? (
          <g opacity={ease(f, twin, twin + 8)}>
            <path d="M 470 900 L 600 900" stroke={LC.ink} strokeWidth={8} strokeDasharray="18 14" />
            <path d="M 588 880 L 618 900 L 588 920" stroke={LC.ink} strokeWidth={8} fill="none" strokeLinejoin="round" />
          </g>
        ) : null}
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * flawed: Akten-Seite PROFILE – Jason im beschlagenen Spiegel, drei Stempel TOUGH / VULNERABLE / FLAWED (ohne Sticker);
 * Nahe: „do-gooders“ → ein Finger schnippt den Heiligenschein weg, er fällt klirrend zu Boden.
 */
export const Flawed: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const tough = B("stampTough", 0.19);
  const vuln = W("vulnerable", 0.4);
  const flawed = B("stampFlawed", 0.51);
  const flick = B("haloFlick", 0.78);
  const cutB = Math.max(W("And", 0.6) - 4, flawed + 14);
  const shot = shotIndex(f, [cutB]);
  if (shot === 0) {
    const cam = frameOn(540, 900, 540, 900, lerp(1.0, 1.04, ease(f, 0, cutB)));
    const mx = 330;
    const my = 830;
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <rect x={-2000} y={-2000} width={5080} height={5920} fill="#3A2A30" />
          <g filter="url(#paper)" transform="rotate(-1 540 900)">
            <rect x={60} y={420} width={960} height={900} fill={LC.paper} stroke={LC.ink} strokeWidth={6} />
          </g>
          <LT x={110} y={490} size={40} anchor="start" spacing={8} fill="#9A3A2E">
            PROFILE
          </LT>
          <path d="M 110 510 L 970 510" stroke={LC.ink} strokeWidth={3} />
          {/* Spiegel */}
          <defs>
            <clipPath id="mirror">
              <ellipse cx={mx} cy={my} rx={200} ry={270} />
            </clipPath>
          </defs>
          <ellipse cx={mx} cy={my} rx={222} ry={292} fill="#7A4E2E" stroke={LC.ink} strokeWidth={7} filter="url(#paper)" />
          <ellipse cx={mx} cy={my} rx={200} ry={270} fill="#CFE4EA" />
          <g clipPath="url(#mirror)">
            <Toon x={mx} y={my + 640} s={1.25} frame={f} who="jason" look={-0.2} lookY={0.1} brows={f >= vuln ? "sad" : "neutral"} mouth={f >= flawed ? "smirk" : "flat"} blinkSeed={11} />
            <Fog x={mx} y={my} o={lerp(0.7, 0.35, ease(f, 0, flawed))} />
            <path d={`M ${mx - 150} ${my - 220} L ${mx - 60} ${my - 260}`} stroke="#FFFFFF" strokeWidth={14} opacity={0.6} strokeLinecap="round" />
          </g>
          <Stamp x={790} y={660} text="TOUGH" t={ease(f, tough, tough + 7)} r={-8} size={50} />
          <Stamp x={790} y={860} text="VULNERABLE" t={ease(f, vuln, vuln + 7)} r={5} size={38} color="#2E6FB0" />
          <Stamp x={790} y={1060} text="FLAWED" t={ease(f, flawed, flawed + 7)} r={-6} size={50} />
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const floor = 1600;
  const s = 1.45;
  const headY = floor + toonHeadY("jason") * s;
  const fly = ease(f, flick, flick + 20, "inOut");
  const land = flick + 20;
  const hx = lerp(560, 230, fly);
  const hy = f < land ? lerp(headY - 150, 1230, fly) - Math.sin(Math.PI * fly) * 160 : 1230 - 30 * Math.abs(Math.sin((f - land) * 0.5)) * Math.exp(-(f - land) * 0.15);
  const hr = lerp(0, -260, fly);
  const cam = frameOn(540, 900, 540, 900, lerp(1.0, 1.03, ease(f, cutB, d)));
  const finger = ease(f, flick - 10, flick - 2, "inOut") * (1 - ease(f, flick + 6, flick + 16));
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, land, 6) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="#3A2A30" />
        <rect x={-2000} y={1240} width={5080} height={2000} fill="#5A4048" />
        <path d="M -2000 1240 L 3080 1240" stroke={LC.ink} strokeWidth={6} />
        <Toon x={540} y={floor} s={s} frame={f} who="jason" look={f >= flick ? -0.8 : 0} lookY={f < flick ? -1 : 0.4} eyes={f >= flick && f < flick + 14 ? "wide" : "open"} mouth={f >= land ? "smirk" : "flat"} brows={f >= flick ? "up" : "neutral"} blinkSeed={11} />
        <Halo x={hx} y={hy} r={hr} s={0.95} glow={1 - fly} />
        {finger > 0 ? <EdgeArm side={1} hx={lerp(1160, 720, finger)} hy={headY - 150} color={LC.pink} cuff={LC.pinkDark} /> : null}
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * play: Pinnwand dreht sich um („you“) – Rückseite mit eigenem Controller-Umriss, PLAYABLE; Jason (links) und Lucia
 * (rechts) stehen neben ihren Auswahlkarten (Köpfe über y 594, Karten decken nur Körper).
 */
export const Play: React.FC = () => {
  const { f, d, B } = useBeats();
  const you = B("boardFlipController", 0.05);
  const cards = B("pickCards", 0.17);
  const flip = ease(f, 0, Math.max(10, you + 6), "inOut");
  const front = flip < 0.5;
  const sx = Math.abs(Math.cos(Math.PI * flip));
  const cam = frameOn(540, 940, 540, 940, lerp(0.97, 1.02, ease(f, 0, d, "inOut")));
  const floor = 1180;
  const show = ease(f, you, you + 10);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <defs>
          <radialGradient id="jplay-bg" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#3A2A5A" />
            <stop offset="1" stopColor="#140C22" />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#jplay-bg)" />
        <g transform={`translate(540 960) scale(${Math.max(0.02, sx)} 1) translate(-540 -960)`}>
          {front ? (
            <g>
              <Pinboard id="play" f={f} />
              <JPolaroid x={540} y={860} s={1.0} id="play-j" label="JASON" color={LC.pinkDark}>
                <JasonBust f={f} />
              </JPolaroid>
            </g>
          ) : (
            <rect x={-200} y={-200} width={1480} height={2320} fill="url(#jplay-bg)" />
          )}
        </g>
        {!front ? (
          <g>
            {[
              [290, LC.pink],
              [800, LC.teal],
            ].map(([px, c]) => (
              <g key={String(px)} opacity={show}>
                <ellipse cx={Number(px)} cy={floor + 10} rx={210} ry={42} fill={String(c)} opacity={0.35 + 0.1 * Math.sin(f * 0.15)} />
                <ellipse cx={Number(px)} cy={floor + 10} rx={210} ry={42} fill="none" stroke={String(c)} strokeWidth={6} />
              </g>
            ))}
            <g opacity={show}>
              <Toon x={290} y={floor} s={1.3} frame={f} who="jason" armR={[lerp(12, 150, show), 20 + 12 * Math.sin(f * 0.4) * show]} armL={[12, 8]} look={0.4} mouth="smile" brows="up" blinkSeed={11} />
              <Toon x={800} y={floor} s={1.22} frame={f} armL={[30, 128]} armR={[30, 128]} look={-0.4} mouth="smirk" blinkSeed={5} />
            </g>
            <g opacity={1 - ease(f, cards - 6, cards)}>
              <Pad x={545} y={1000} s={0.42 * pop(f, you, 10)} f={f} />
              <LT x={545} y={1130} size={46} fill={LC.pink} spacing={6} o={ease(f, you + 4, you + 12)}>
                PLAYABLE
              </LT>
            </g>
          </g>
        ) : null}
      </Layer>
      <Layer depth={0}>
        <Confetti t={f - you} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * loop: Dach, Abreißkalender NOV 19 („19th“); „delays“ → zwei abgerissene Blätter (2025, MAY 26 2026) mit DELAYED in der
 * unteren Hälfte (Zahlen frei); „Now“ → Pinnwand, Fahrt ins geteilte Polaroid = Cover (nahtloser Loop).
 */
export const Loop: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const nov = B("calendarNov19", 0.16);
  const delays = B("delayedStamps", 0.37);
  const meet = B("loopToCover", 0.78);
  const after = W("after", 0.29);
  const so = Math.max(W("Now", 0.58) - 4, delays + 40);
  const shot = shotIndex(f, [so]);
  if (shot === 0) {
    const cam = frameOn(540, 960, 540, 960, lerp(0.98, 1.03, ease(f, 0, so, "inOut")));
    const s1 = ease(f, after, after + 12, "inOut");
    const s2 = ease(f, after + 10, after + 22, "inOut");
    const floor = 1290;
    const throwT = Math.max(Math.max(0, 1 - Math.abs(f - after - 4) / 8), Math.max(0, 1 - Math.abs(f - after - 14) / 8));
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, nov, 8) }} mood="night" noSky>
        <LuxDefs />
        <Layer depth={0.35}>
          <KeysDay f={f} id="loop" x0={-1200} w={3400} horizon={1100} />
        </Layer>
        <Layer>
          <Roof y={floor} />
          {/* Staffelei */}
          <path d={`M 470 ${floor} L 560 860 L 650 ${floor} M 560 860 L 560 ${floor}`} stroke="#7A4E2E" strokeWidth={14} fill="none" strokeLinecap="round" />
          <DateSheet x={560} y={1060} s={0.9 * (f >= nov ? 1 + 0.08 * Math.max(0, 1 - Math.abs(f - nov - 4) / 6) : 1)} big={f >= nov ? "NOV 19" : "???"} sub="2026" head="RELEASE" color={LC.teal} />
          {s1 > 0 ? (
            <g>
              <DateSheet x={lerp(560, 235, s1)} y={lerp(1060, 790, s1)} s={0.66} r={lerp(0, -6, s1)} big="2025" head="WINDOW" />
              <Stamp x={235} y={925} text="DELAYED" t={ease(f, delays - 6, delays)} r={-8} size={32} />
            </g>
          ) : null}
          {s2 > 0 ? (
            <g>
              <DateSheet x={lerp(560, 880, s2)} y={lerp(1060, 790, s2)} s={0.66} r={lerp(0, 6, s2)} big="MAY 26" sub="2026" head="DATE" />
              <Stamp x={880} y={930} text="DELAYED" t={ease(f, delays, delays + 6)} r={6} size={32} />
            </g>
          ) : null}
          <Toon x={150} y={floor} s={0.7} frame={f} who="jason" armR={[lerp(20, 120, throwT), 30]} armL={[30, 128]} look={1} mouth={f >= delays ? "smirk" : "flat"} brows={f >= delays ? "up" : "neutral"} blinkSeed={11} />
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const arrive = Math.min(d - 4, meet + 22);
  if (f >= arrive) return <CoverScene f={f} />;
  const cam = camPath(f, [
    [so, BOARD_END],
    [Math.max(so + 4, meet - 6), frameOn(540, 760, 540, 900, 1.25)],
    [arrive, JPHOTO_CAM],
  ]);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Pinboard id="cover" f={f} />
        <BigPolaroid clipId="clip-loop" photo={<SplitArt f={f} />} nameO={1 - ease(f, meet, meet + 12)} />
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};
