/**
 * „In This City, Gravity Pulls Toward Marta“ – Szenen 8–15 (bo … loop).
 * Shot-Liste: episodes/schwerkraft-stadt.json (scenes[].shots); Schnitte: schwerkraftCuts.ts.
 */
import React from "react";
import { Shot, V3 } from "../kit/camera";
import { camAt, HookFrame, hudAt, MARTA, MARTA_SIT, TownSet, useShots } from "./schwerkraft1";
import type { Cam } from "./schwerkraft1";
import {
  atScreen,
  Balloon,
  Board,
  boColor,
  boState,
  bowlY,
  Cat,
  Cloud,
  fly,
  Folk,
  folkHead,
  frameOn,
  G,
  Halo,
  Junk,
  lerp,
  Motes,
  onBowl,
  Pile,
  PullLine,
  ramp,
  Stick,
} from "./schwerkraftSets";

const BO_S = 0.7;
/** Kopfmitte von Bo (Kind, scale 0,7). */
const boHead = (p: V3) => folkHead(p, BO_S, false, true);

/** Bo-Anzeige im Bild (Zustand genau ab Cue-Wort). */
const BoBoard: React.FC<{ readonly scene: string; readonly frame: number; readonly beat: (n: string) => number; readonly cam: { pos: V3; look: V3; fov: number }; readonly d?: number; readonly xf?: number; readonly yf?: number; readonly frac?: number }> = ({ scene, frame, beat, cam, d = 1.5, xf = 0.5, yf = 0.27, frac = 0.56 }) => {
  const v = boState(scene, frame, beat);
  if (!v) return null;
  return <Board label="BO" value={v} color={boColor(v)} {...hudAt(cam, xf, yf, d, frac)} />;
};

/* ------------------------------------------------------------------ */
/* 8 bo – „Bo is the lightest kid in town. | The less you carry… the less it holds you.“ */
/* ------------------------------------------------------------------ */
export const SkBo: React.FC = () => {
  const { frame, shot, f, len } = useShots("bo");
  if (shot === 0) {
    // Halbnah von unten: Bo hüpft in langsamen Mond-Sprüngen die Straße entlang, sechs Ballons an der Jacke
    const z = 11 - f * 0.03;
    const hopH = Math.abs(Math.sin(f * 0.09)) * 0.9;
    const p: V3 = [0.4, bowlY(z) + hopH, z];
    const a = frameOn(boHead([0.4, bowlY(11), 11]), 6.4, 0.5, 0.5, [0.55, -0.22, 1]);
    const b = frameOn(boHead([0.4, bowlY(10.2), 10.2]), 6.0, 0.5, 0.5, [0.5, -0.2, 1]);
    return (
      <>
        <TownSet frame={frame} target={p} />
        <Folk frame={frame} kind="bo" position={p} rotation={[0, 0.5, 0]} scale={BO_S} balloons={6} emptyPockets mouth="grin" eyes="happy" spread={[0.5, 0.5]} reach={[0.4, 0.4]} tiptoe={1} blinkSeed={21} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  if (shot === 1) {
    // Nah: Bo grinst zu seinen Ballons hoch, hält stolz die Schnüre; ein Nachbar mit Ballon-Hut zeigt Daumen hoch
    const p: V3 = [0.4, bowlY(9.6) + 0.2, 9.6];
    const h = boHead(p);
    const a = frameOn([h[0] + 0.3, h[1] + 0.6, h[2]], 3.9, 0.5, 0.45, [0.3, -0.12, 1]);
    const b = frameOn([h[0] + 0.3, h[1] + 0.6, h[2]], 3.5, 0.5, 0.45, [0.3, -0.12, 1]);
    return (
      <>
        <TownSet frame={frame} target={p} />
        <Folk frame={frame} kind="bo" position={p} rotation={[0, 0.25, 0]} scale={BO_S} balloons={6} emptyPockets nod={-0.45} mouth="grin" eyes="dot" reach={[2.2, 2.4]} spread={[0.2, 0.2]} blinkSeed={21} />
        <Folk frame={frame} kind="towns" shirt={G.towns[0]} position={[2.6, bowlY(8.4), 8.4]} rotation={[0, -0.6, 0]} balloonHat reach={[0.2, 1.4]} spread={[0.1, 0.3]} mouth="grin" blinkSeed={14} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Bodennah: Bos Turnschuhe berühren kaum das Pflaster; seine Zuglinien sind dünn und blass, die bei Marta dick
  const z = 7.2;
  const lift = 0.15 + Math.abs(Math.sin(f * 0.08)) * 0.35;
  const p: V3 = [0.3, bowlY(z) + lift, z];
  const a = frameOn([0.3, bowlY(z) + 0.3, z], 3.0, 0.56, 0.5, [0.3, 0.05, 1]);
  const b = frameOn([0.3, bowlY(z) + 0.3, z - 0.3], 2.8, 0.56, 0.5, [0.3, 0.05, 1]);
  return (
    <>
      <TownSet frame={frame} pull={1} pullWidth={0.07} target={p} />
      <Folk frame={frame} kind="bo" position={p} rotation={[0, Math.PI, 0]} scale={BO_S} balloons={6} tiptoe={1} walk={0.4} blinkSeed={21} />
      {[-0.5, 0, 0.5].map((dx, i) => (
        <PullLine key={i} from={[p[0] + dx, p[1] + 0.3, p[2]]} to={[0, 1.4, 0]} bend={[dx, 0.3, 0]} width={0.012} frame={frame} opacity={0.35} pulses={1} seed={i} />
      ))}
      <Folk frame={frame} kind="marta" position={MARTA} load={0.8} sack blinkSeed={3} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 9 gust – „Then a gust hits. | Bo floats up, past the roofs.“ */
/* ------------------------------------------------------------------ */
export const SkGust: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("gust");
  if (shot === 0) {
    // Halbnah: Böe treibt Laub und Hüte seitwärts, Bos Füße verlassen den Boden, die Kappe fliegt weg
    const g = beat("gustHits");
    const up = ramp(frame, g, g + 40, (x) => x * x);
    const z = 8.4;
    const p: V3 = [0.4 + up * 0.8, bowlY(z) + up * 2.2, z];
    const a = frameOn(boHead([0.4, bowlY(z), z]), 6.2, 0.5, 0.5, [0.35, 0.02, 1]);
    const b = frameOn([0.8, bowlY(z) + 2.8, z], 6.2, 0.5, 0.5, [0.35, -0.05, 1]);
    const capT = Math.max(0, frame - g);
    return (
      <>
        <TownSet frame={frame} target={p} />
        <Folk frame={frame} kind="bo" position={p} rotation={[0, 0.3, 0.12 * up]} scale={BO_S} balloons={6} cap={capT < 2} emptyPockets eyes={up > 0.1 ? "wide" : "dot"} mouth={up > 0.1 ? "o" : "smile"} spread={[0.8 * up + 0.2, 0.8 * up + 0.2]} reach={[0.6, 0.6]} blinkSeed={21} />
        {capT >= 2 ? (
          <group position={[p[0] + capT * 0.09, p[1] + 1.8 + capT * 0.03, p[2] - capT * 0.02]} rotation={[capT * 0.2, 0, capT * 0.25]}>
            <mesh>
              <boxGeometry args={[0.74, 0.18, 0.7]} />
              <meshStandardMaterial color={G.cap} />
            </mesh>
          </group>
        ) : null}
        <Junk kind="hat" position={[-3 + Math.max(0, frame - g) * 0.16, bowlY(z) + 1.6 + Math.sin(frame * 0.2) * 0.2, z - 1]} rotation={[frame * 0.2, 0, frame * 0.15]} />
        {frame >= g - 2 ? <Motes frame={frame} center={[p[0], p[1] + 1, z]} size={[10, 4, 4]} count={90} drift={[0.12, 0.01, 0]} color="#FFFFFF" dot={0.05} opacity={0.7} seed={31} /> : null}
        <Shot frame={f} duration={len} {...fly(a, b)} ease="in" />
      </>
    );
  }
  // Steil von oben: Bo treibt an Schornsteinen und schiefen Dächern vorbei nach oben, die Stadt wird klein
  const rise = f * 0.11;
  const p: V3 = [1.6, 8 + rise, 9];
  const h = boHead(p);
  // Regie R5: von vorn-oben statt senkrecht (sonst verdeckt Bos Haarklotz das Gesicht); Waage aus (Tafel angeschnitten)
  const a = frameOn(h, 7, 0.42, 0.5, [0.3, 0.6, 1]);
  const b = frameOn([h[0], h[1] + 0.5, h[2]], 8.2, 0.42, 0.5, [0.3, 0.7, 1]);
  return (
    <>
      <TownSet frame={frame} target={[1.6, 2, 9]} scale={false} />
      <Folk frame={frame} kind="bo" position={p} rotation={[0.2, 0.4, 0.1]} scale={BO_S} balloons={6} cap={false} emptyPockets eyes="wide" mouth="o" nod={-0.35} spread={[0.9, 0.9]} reach={[0.3, 0.3]} blinkSeed={21} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 10 town – „The whole town reaches up. | But nobody's heavy enough to pull.“ */
/* ------------------------------------------------------------------ */
const CROWD: { p: V3; c: number; s: number }[] = [
  { p: [-1.8, 0, 8.2], c: 0, s: 31 },
  { p: [1.9, 0, 8.6], c: 1, s: 32 },
  { p: [-0.2, 0, 9.4], c: 2, s: 33 },
  { p: [-3.0, 0, 10.0], c: 4, s: 34 },
  { p: [3.1, 0, 10.4], c: 5, s: 35 },
  { p: [0.9, 0, 11.2], c: 3, s: 36 },
];
const crowdAt = (i: number): V3 => [CROWD[i].p[0], bowlY(CROWD[i].p[2]), CROWD[i].p[2]];
export const SkTown: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("town");
  const BO_SKY: V3 = [1.2, 24 + frame * 0.03, 8];
  if (shot === 0) {
    // Totale von unten: Stadtleute strecken die Arme zum winzigen Bo hoch; einer springt, schwebt kurz, rudert
    const up = ramp(frame, beat("crowdReaches") - 10, beat("crowdReaches") + 6);
    const a = frameOn([0, bowlY(9) + 6, 9], 13, 0.55, 0.5, [0.05, -0.45, 1]);
    const b = frameOn([0, bowlY(9) + 6.5, 9], 12, 0.55, 0.5, [0.05, -0.5, 1]);
    const jump = Math.max(0, Math.sin(Math.min(Math.PI, f * 0.06))) * 1.2;
    return (
      <>
        <TownSet frame={frame} target={[0, 2, 9]} />
        {CROWD.map((c, i) => (
          <Folk
            key={i}
            frame={frame}
            kind="towns"
            shirt={G.towns[c.c]}
            position={i === 2 ? [crowdAt(i)[0], crowdAt(i)[1] + jump, crowdAt(i)[2]] : crowdAt(i)}
            rotation={[0, Math.PI + (c.p[0] > 0 ? -0.2 : 0.2), 0]}
            balloonHat
            emptyPockets
            nod={-0.5}
            reach={[0.4 + 2.4 * up, 0.4 + 2.5 * up]}
            spread={i === 2 ? [0.8 + Math.sin(f * 0.5) * 0.4, 0.8 - Math.sin(f * 0.5) * 0.4] : [0.15, 0.15]}
            eyes="wide"
            mouth="o"
            tiptoe={up}
            blinkSeed={c.s}
          />
        ))}
        <Folk frame={frame} kind="bo" position={BO_SKY} rotation={[0, Math.PI, 0]} scale={BO_S} balloons={6} cap={false} spread={[1, 1]} blinkSeed={21} />
        <BoBoard scene="town" frame={frame} beat={beat} cam={camAt(f, len, a, b, "out")} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Über die Schulter von Bo nach unten: die Menge weit unten, Arme erhoben, hilflos; Ballons ziehen ihn höher
  // Regie R6: Tele von Bos Schulter auf die Menge (mittleres Drittel), Bo angeschnitten am rechten Rand im Vordergrund
  const lift = f * 0.04;
  const a: Cam = { pos: [2.4, 30 + lift, 6.6], look: [0, bowlY(9.6) + 1.2, 9.4], fov: 24 };
  const b: Cam = { pos: [2.4, 30.6 + lift, 6.6], look: [0, bowlY(9.6) + 1.2, 9.4], fov: 21 };
  const cam = camAt(f, len, a, b, "linear");
  const p: V3 = atScreen(cam, 1.0, 0.74, 13);
  return (
    <>
      <TownSet frame={frame} target={[0, 0, 9]} />
      {CROWD.map((c, i) => (
        <Folk key={i} frame={frame} kind="towns" shirt={G.towns[c.c]} position={crowdAt(i)} rotation={[0, Math.PI, 0]} balloonHat nod={-0.6} reach={[2.8, 2.8]} eyes="wide" mouth="o" blinkSeed={c.s} />
      ))}
      <Folk frame={frame} kind="bo" position={p} rotation={[0.3, Math.PI - 0.5, 0]} scale={BO_S} balloons={0} cap={false} nod={0.5} eyes="wide" mouth="frown" spread={[0.6, 0.6]} reach={[1.6, 1.6]} blinkSeed={21} />
      <BoBoard scene="town" frame={frame} beat={beat} cam={camAt(f, len, a, b, "linear")} yf={0.26} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 11 marta – „Only Marta does the opposite. | She grabs it all… to get heavier.“ */
/* ------------------------------------------------------------------ */
export const SkMarta: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("marta");
  if (shot === 0) {
    // Veranda, langsam ran: Marta steht von der Bank auf, stellt die Füße fest, krempelt die Ärmel hoch, die Katze springt auf ihre Schulter
    const up = ramp(f, 4, 26);
    const pos: V3 = [0, lerp(MARTA_SIT[1], MARTA[1], up), lerp(MARTA_SIT[2], MARTA[2] - 0.2, up)];
    const sleeves = f > 44;
    const roll = ramp(f, 30, 44) * (1 - ramp(f, 46, 56));
    const cat = ramp(f, 50, 64);
    const head = folkHead([0, MARTA[1], MARTA[2] - 0.2]);
    const a = frameOn(head, 6.4, 0.4, 0.5, [0.1, -0.05, 1]);
    const b = frameOn(head, 4.9, 0.4, 0.5, [0.1, -0.05, 1]);
    const hud = hudAt(camAt(f, len, a, b, "inOut"), 0.5, 0.26, 1.4, 0.5);
    return (
      <>
        <TownSet frame={frame} dusk={0.2} target={MARTA} />
        <Folk frame={frame} kind="marta" position={pos} sit={up < 0.5} load={0.9} sack={false} sleeves={sleeves} reach={[0.4 + 1.0 * roll, 0.4 + 1.0 * roll]} spread={[0.15 - 0.4 * roll, 0.15 - 0.4 * roll]} nod={-0.12} eyes="dot" mouth="flat" blinkSeed={3} />
        <Cat position={[lerp(1.2, 0.48, cat), lerp(0.18, 2.0, cat) + Math.sin(cat * Math.PI) * 0.6, lerp(-0.6, MARTA[2] - 0.3, cat)]} rotation={[0, -0.3, 0]} frame={frame} scale={0.6} />
        <Pile position={[0, 0.18, -0.15]} grow={0.9} />
        <Board label="BO" value={boState("marta", frame, beat)} color={boColor(boState("marta", frame, beat))} {...hud} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
      </>
    );
  }
  // Totale Veranda: Marta rafft den ganzen Stapel an sich; Waage schlägt aus, die Zuglinien werden dick und reichen nach oben
  const h = beat("martaScoopsPile");
  const take = ramp(frame, h - 26, h + 6);
  const reachUp = ramp(frame, h - 4, h + 30);
  const head = folkHead(MARTA);
  const a = frameOn([0, 2.4, 0], 10.5, 0.5, 0.58, [0.25, 0.12, 1]);
  const b = frameOn([0, 2.6, 0], 10, 0.5, 0.58, [0.25, 0.12, 1]);
  const hud = hudAt(camAt(f, len, a, b, "out"), 0.5, 0.24, 1.5, 0.5);
  const v = boState("marta", frame, beat);
  return (
    <>
      <TownSet frame={frame} dusk={0.2} needle={lerp(0.9, 1.05, ramp(frame, h - 6, h + 4))} pull={0.35} pullWidth={lerp(0.025, 0.045, take)} target={MARTA} />
      <Folk frame={frame} kind="marta" position={MARTA} load={lerp(0.9, 1.5, take)} sack sleeves reach={[0.6 + Math.sin(f * 0.5) * 0.5 * (1 - take) + 0.6 * take, 0.6 + Math.cos(f * 0.5) * 0.5 * (1 - take) + 0.6 * take]} spread={[0.5 * (1 - take), 0.5 * (1 - take)]} eyes="dot" mouth="flat" blinkSeed={3} holdL={take > 0.6 ? <Junk kind="teapot" position={[0.35, -0.45, 0.25]} scale={0.8} /> : null} holdR={take > 0.6 ? <Junk kind="umbrella" position={[-0.3, -0.5, 0.25]} rotation={[0, 0, 0.9]} scale={0.7} /> : null} />
      <Cat position={[0.5, 2.0, MARTA[2] - 0.35]} rotation={[0, -0.3, 0]} frame={frame} scale={0.6} />
      <Pile position={[0, 0.18, -0.15]} grow={0.95} take={take} />
      {/* der Zug wächst nach oben in den Himmel, zu Bo */}
      <PullLine from={[2, 26, 6]} to={[head[0] + 0.9, head[1] + 1.8, head[2]]} bend={[0.5, 0, 1]} width={lerp(0.04, 0.09, reachUp)} reach={0.15 + 0.85 * reachUp} frame={frame} opacity={0.7} pulses={4} />
      <Board label="BO" value={v} color={boColor(v)} {...hud} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 12 turn (HALT) – „High above, Bo stops rising. | And starts to fall… toward Marta.“ */
/* ------------------------------------------------------------------ */
export const SkTurn: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("turn");
  const still = beat("boHangsStill");
  const fall = beat("boTurnsAndFalls");
  // Bo hängt in den Wolken; die dicke Bernstein-Linie wächst von unten herauf und berührt ihn kurz vor „fall“
  const touch = ramp(frame, still - 6, fall - 6, (x) => 1 - (1 - x) * (1 - x));
  const flip = ramp(frame, fall - 4, fall + 18);
  const drop = Math.max(0, frame - fall) / 30;
  const BO0: V3 = [2, 30, 6];
  const p: V3 = [BO0[0] - drop * 0.4, BO0[1] - 0.9 * drop * drop - 0.4 * drop + Math.sin(frame * 0.5) * 0.04 * (1 - flip), BO0[2] - drop * 0.3];
  const h = boHead(p);
  // Kamera seitlich über Bo, Blick schräg nach unten: unten die winzige leuchtende Veranda
  // Regie R3: Schnitt auf „starts to fall“ → Nah, Bo kippt kopfüber (Kamera folgt dem Fall)
  const a = shot === 0 ? frameOn([h[0], h[1] - 0.6, h[2]], 9, 0.5, 0.5, [0.9, 0.55, 0.6]) : frameOn([p[0], p[1] - 0.4, p[2]], 4.8, 0.72, 0.5, [-0.35, 0.05, 1]);
  const b = shot === 0 ? frameOn([h[0], h[1] - 0.9, h[2]], 8.0, 0.52, 0.5, [0.9, 0.5, 0.6]) : frameOn([p[0], p[1] - 0.6, p[2]], 4.0, 0.65, 0.5, [-0.35, 0.08, 1]);
  // Design R3: im Nah-Shot Schild höher + kleiner, Bos Gesicht frei
  const hud = shot === 0 ? hudAt(camAt(f, len, a, b, "inOut"), 0.5, 0.25, 1.5, 0.44) : hudAt(camAt(f, len, a, b, "inOut"), 0.5, 0.19, 1.2, 0.28);
  const v = boState("turn", frame, beat);
  const glow = ramp(frame, beat("pullLineGlows") - 4, beat("pullLineGlows") + 8);
  return (
    <>
      <TownSet frame={frame} dusk={0.25} target={[0, 0, 0]} />
      <Halo at={[0, 2.4, -0.6]} size={14 + 6 * glow} color={G.amber} opacity={0.75} />
      <Cloud position={[BO0[0] - 5, BO0[1] - 1, BO0[2] - 6]} scale={1.8} seed={7} opacity={0.9} />
      <Cloud position={[BO0[0] + 6, BO0[1] + 1.5, BO0[2] - 9]} scale={2.2} seed={8} opacity={0.9} />
      <Cloud position={[BO0[0] - 2, BO0[1] - 6, BO0[2] + 2]} scale={1.4} seed={9} opacity={0.8} />
      <group position={p} rotation={[0, 0, Math.PI * flip]}>
        <group position={[0, -1.0 * BO_S * flip * 2, 0]}>
          <Folk frame={frame} kind="bo" position={[0, 0, 0]} rotation={[0, 0.9, 0]} scale={BO_S} balloons={6} cap={false} eyes={flip > 0.5 ? "wide" : "dot"} mouth={flip > 0.5 ? "o" : "flat"} spread={[0.7, 0.7]} reach={[0.4, 0.4]} blinkSeed={21} />
        </group>
      </group>
      <PullLine from={[h[0], h[1], h[2]]} to={[0, 2.4, 0]} bend={[1, 2, 2]} width={0.13 + 0.05 * glow} reach={touch} frame={frame} opacity={0.95} pulses={5} />
      <Board label="BO" value={v} color={boColor(v)} {...hud} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 13 catch – „Right into her arms. | Her first hug in years.“ */
/* ------------------------------------------------------------------ */
export const SkCatch: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("catch");
  if (shot === 0) {
    // Veranda: Bo sinkt sanft in Martas offene Arme, Ballons wippen darüber, die Katze purzelt von der Schulter
    const land = beat("boLandsInArms");
    const k = ramp(frame, land - 26, land, (x) => 1 - (1 - x) * (1 - x) * (1 - x));
    const arms: V3 = [0, 0.82, MARTA[2] + 0.55];
    const p: V3 = [lerp(0.8, arms[0], k), lerp(7, arms[1], k), arms[2]];
    const head = folkHead(MARTA);
    const a = frameOn([head[0], head[1] + 0.4, head[2]], 7.2, 0.42, 0.5, [0.15, 0.05, 1]);
    const b = frameOn([head[0], head[1] + 0.3, head[2]], 6.4, 0.42, 0.5, [0.15, 0.05, 1]);
    const hud = hudAt(camAt(f, len, a, b, "out"), 0.5, 0.24, 1.4, 0.48);
    const v = boState("catch", frame, beat);
    const catOff = ramp(frame, land - 2, land + 14);
    return (
      <>
        <TownSet frame={frame} dusk={0.45} target={MARTA} />
        <Folk frame={frame} kind="marta" position={MARTA} load={1.2} sack sleeves reach={[1.25, 1.25]} spread={[0.25 - 0.2 * k, 0.25 - 0.2 * k]} nod={-0.25 + 0.3 * k} eyes={k > 0.95 ? "happy" : "wide"} mouth={k > 0.95 ? "smile" : "o"} blinkSeed={3} />
        <Folk frame={frame} kind="bo" position={p} rotation={[0, Math.PI * 0.1, 0]} scale={BO_S} balloons={6} cap={false} eyes={k > 0.95 ? "happy" : "wide"} mouth={k > 0.95 ? "grin" : "o"} spread={[0.6, 0.6]} reach={[1.2, 1.2]} blinkSeed={21} />
        <Cat position={[lerp(0.5, 1.4, catOff), lerp(2.0, 0.18, catOff) + Math.sin(catOff * Math.PI) * 0.5, MARTA[2] - 0.3 + catOff * 0.6]} rotation={[catOff * 3, -0.3, 0]} frame={frame} scale={0.6} curl={catOff > 0.05 && catOff < 0.95 ? 0.8 : 0} />
        <Pile position={[0, 0.18, -0.15]} grow={0.3} />
        <Board label="BO" value={v} color={boColor(v)} {...hud} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Nah, goldenes Abendlicht: Marta drückt Bo fest, Augen zu, kleines Lächeln; Bo drückt zurück
  const head = folkHead(MARTA);
  const a = frameOn([head[0] + 0.3, head[1] - 0.4, head[2]], 4.6, 0.4, 0.5, [-0.45, 0.02, 1]);
  const b = frameOn([head[0] + 0.3, head[1] - 0.4, head[2]], 4.1, 0.4, 0.5, [-0.42, 0.02, 1]);
  const bo: V3 = [0.62, 0.62, MARTA[2] + 0.55];
  return (
    <>
      <TownSet frame={frame} dusk={0.7} target={MARTA} />
      <Folk frame={frame} kind="marta" position={MARTA} load={1.0} sack sleeves reach={[1.3, 1.3]} spread={[-0.35, -0.35]} nod={0.12} tilt={0.1} eyes="closed" mouth="smile" blinkSeed={3} />
      <Folk frame={frame} kind="bo" position={bo} rotation={[0, Math.PI + 0.9, 0]} scale={BO_S} balloons={6} cap={false} reach={[1.5, 1.5]} spread={[-0.4, -0.4]} eyes="closed" mouth="smile" blinkSeed={21} />
      <pointLight position={[1.5, 3, 2.5]} color="#FFD9A8" intensity={6} distance={7} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 14 answer – „Everyone stays light. | But someone must be heavy enough… to catch you.“ */
/* ------------------------------------------------------------------ */
const DUSK_FOLK: V3[] = [
  onBowl(9, 0.9), onBowl(12, 1.8), onBowl(10, -1.2), onBowl(14, -2.4), onBowl(11, 2.6), onBowl(13, -0.5), onBowl(16, 0.4), onBowl(15, 3.4), onBowl(12, -3.0),
];
export const SkAnswer: React.FC = () => {
  const { frame, shot, f, len } = useShots("answer");
  if (shot === 0) {
    // Totale am Abend: die ganze schiefe Stadt, winzige Ballon-Hüte in jeder Straße, alle an langen Schnüren
    const a = frameOn([0, 4, 0], 40, 0.55, 0.5, [0.2, 1.0, 0.9]);
    const b = frameOn([0, 4, 0], 36, 0.55, 0.5, [0.25, 0.95, 0.95]);
    return (
      <>
        <TownSet frame={frame} dusk={0.9} target={[0, 0, 0]} lampLight={2} />
        <Halo at={[0, 2.4, -0.6]} size={10} color={G.amber} opacity={0.6} />
        {DUSK_FOLK.map((p, i) => (
          <group key={i}>
            <Folk frame={frame} kind="towns" shirt={G.towns[i % 6]} position={p} rotation={[0, Math.atan2(-p[0], -p[2]), 0]} scale={1.2} blinkSeed={40 + i} />
            <Balloon anchor={[p[0], p[1] + 2.6, p[2]]} top={[p[0] + 0.3, p[1] + 8 + (i % 3), p[2]]} r={0.9} frame={frame} seed={i} />
          </group>
        ))}
        <Folk frame={frame} kind="marta" position={MARTA} load={1.0} sack scale={1.2} blinkSeed={3} />
        <Folk frame={frame} kind="bo" position={[1.1, 0.18, 0.2]} scale={BO_S * 1.2} balloons={6} cap={false} blinkSeed={21} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Halbnah: Nachbarn kommen vorsichtig am Seil den Hang herunter, einer nach dem anderen – zum ersten Mal bringt jemand ihr Tee
  const ropeTop: V3 = [-1.2, bowlY(10) + 1.4, 10];
  const ropeLow: V3 = [-2.5, 1.4, 0.55];
  const step = f * 0.012;
  const ns = [0, 1, 2].map((i) => {
    // Regie R2: alle drei Nachbarn ab dem ersten Bild sichtbar am Seil (vorher stand der hinterste dunkel direkt vor der Linse)
    const u = Math.min(0.92, 0.5 - i * 0.16 + step + (i === 0 ? 0.25 : 0));
    const z = lerp(ropeTop[2], 1.6, Math.max(0, u));
    return [lerp(ropeTop[0], -1.6, Math.max(0, u)) + 0.4, bowlY(z), z] as V3;
  });
  const head = folkHead(MARTA);
  const a = frameOn([-0.6, 2.2, 3.2], 8.4, 0.45, 0.5, [0.35, 0.3, 1]);
  const b = frameOn([-0.6, 2.2, 3.0], 7.8, 0.45, 0.5, [0.32, 0.3, 1]);
  return (
    <>
      {/* Regie R2: Laternenmast vor der Linse (schwarzer Block) → Laternen aus, Fülllicht auf die Nachbarn */}
      <TownSet frame={frame} dusk={0.95} target={[-1, 1, 3]} lampLight={0} />
      <Stick a={ropeTop} b={ropeLow} r={0.04} color="#C8B08A" basic={false} />
      {ns.map((p, i) => (
        <Folk
          key={i}
          frame={frame}
          kind="towns"
          shirt={G.towns[(i + 2) % 6]}
          position={p}
          rotation={[0, Math.PI + 0.25, 0]}
          balloonHat={i > 0}
          walk={0.3}
          lean={-0.15}
          reach={i === 0 ? [1.3, 1.0] : [1.2, 1.4]}
          spread={[0.1, -0.2]}
          mouth="smile"
          blinkSeed={50 + i}
          holdR={i === 0 ? <Junk kind="teapot" position={[0, 0, 0.15]} scale={0.7} /> : null}
        />
      ))}
      <Folk frame={frame} kind="marta" position={[0.3, MARTA[1], MARTA[2]]} rotation={[0, -0.5, 0]} load={1.0} sack eyes="dot" mouth="smile" reach={[0.4, 0.9]} blinkSeed={3} />
      <Folk frame={frame} kind="bo" position={[1.3, 0.18, 0.3]} rotation={[0, -0.6, 0]} scale={BO_S} balloons={6} cap={false} mouth="grin" blinkSeed={21} />
      <Halo at={[head[0], 2.6, head[2] - 1]} size={3} color={G.amber} opacity={0.3} />
      <pointLight position={[-0.5, 4.2, 7.5]} color="#FFD9A8" intensity={10} distance={12} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 15 loop – „So here, nothing falls down. | It falls toward Granny Marta.“ */
/* ------------------------------------------------------------------ */
export const SkLoop: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("loop");
  if (shot === 0) {
    // Nah, Bank: Marta, Bo und die Katze; Bo lässt einen Ballon los – er treibt SEITWÄRTS zu Marta und stupst ihre Nase; sie lacht
    const bump = beat("balloonBumpsNose");
    const k = ramp(frame, bump - 30, bump, (x) => x * x);
    const mHead = folkHead(MARTA_SIT, 1, true);
    const boP: V3 = [1.25, 0.6, MARTA_SIT[2] + 0.05];
    const start: V3 = [2.2, mHead[1] + 0.3, MARTA_SIT[2] + 0.4];
    const nose: V3 = [mHead[0] + 0.32, mHead[1] - 0.05, mHead[2] + 0.62];
    const t: V3 = [lerp(start[0], nose[0] + 0.35, k), lerp(start[1], nose[1], k) + Math.sin(k * Math.PI) * 0.15, lerp(start[2], nose[2], k)];
    const laugh = frame >= bump;
    const a = frameOn([0.6, mHead[1] - 0.2, mHead[2]], 4.8, 0.4, 0.5, [0.12, 0.02, 1]);
    const b = frameOn([0.5, mHead[1] - 0.2, mHead[2]], 4.3, 0.4, 0.5, [0.12, 0.02, 1]);
    return (
      <>
        <TownSet frame={frame} dusk={1} target={MARTA_SIT} clouds={false} />
        <Folk frame={frame} kind="marta" position={MARTA_SIT} sit load={0.9} look={0.3} tilt={laugh ? 0.08 : 0} eyes={laugh ? "happy" : "dot"} mouth={laugh ? "grin" : "smile"} reach={[0.9, 0.9]} spread={[0.2, 0.2]} blinkSeed={3} />
        <Folk frame={frame} kind="bo" position={boP} sit rotation={[0, -0.35, 0]} scale={BO_S} balloons={5} cap={false} mouth="grin" eyes="happy" reach={[0.6, 1.2]} blinkSeed={21} />
        <Cat position={[-1.0, 0.75, MARTA_SIT[2] + 0.05]} rotation={[0, 0.4, 0]} frame={frame} scale={0.6} />
        <Balloon anchor={[t[0] + 0.1, t[1] - 0.9, t[2]]} top={t} r={0.32} frame={0} seed={0} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
      </>
    );
  }
  // Match Cut aufs erste Bild: die Hand lässt den Apfel los, er fällt seitwärts → End-Card → Hook
  return <HookFrame frame={frame} f={f} len={len} release={Math.max(12, len - 40)} />;
};

