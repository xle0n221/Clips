/**
 * „In This City, the Gate Needs 1,000 Yeses“ – Szenen 8–15 (hollis … stinger).
 * Höhepunkt `turn`: 0,6 s Stille, Pip auf der Kiste mit Pappschild „MEETING OVER?“, dann EIN Halt:
 * alle 1.000 Kellen im selben Moment, Zähler steht auf „yeses“ auf 1,000 / 1,000 und glüht gold.
 * Schluss `stinger`: Match Cut aufs Eröffnungsbild (HookFrame) – ohne Pip, mit Farblücke, Zähler 999 / 1,000.
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { cam, DayLight, DuskLight, fmt, HOLLIS_IN, HookFrame, rollTo, Square, useShots, useTownCrowd } from "./tor1";
import {
  Atmos,
  Blok,
  BOOTH,
  CardSign,
  Cone,
  Crate,
  Crowd,
  Flakes,
  fly,
  frameOn,
  GATE_C,
  GateWall,
  Gull,
  headOf,
  HollisCap,
  KeyRing,
  lerp,
  LightShaft,
  Motes,
  Paddle,
  PLAQUE,
  Poster,
  ramp,
  RULE_PLATE,
  SeaSet,
  SkyDome,
  T,
} from "./torSets";

/* ------------------------------------------------------------------ */
/* 8 hollis – „Mister Hollis. | An open gate would end his job.“ */
/* ------------------------------------------------------------------ */
export const TorHollis: React.FC = () => {
  const { frame, shot, f, len } = useShots("hollis");
  if (shot === 0) {
    // Hollis poliert stolz den Schlüsselring, hinter ihm die Urkunde „GATEKEEPER 83 YEARS“
    const head = headOf("hollis", HOLLIS_IN);
    const rub = Math.sin(frame * 0.45) * 0.18;
    const a = frameOn([head[0] - 0.1, head[1] - 0.45, head[2]], 4.8, 0.48, 0.5, [-0.15, 0.04, 1]);
    const b = frameOn([head[0] - 0.1, head[1] - 0.45, head[2]], 4.2, 0.48, 0.5, [-0.12, 0.04, 1]);
    return (
      <>
        <DayLight target={[5, 0, 2]} />
        <Square frame={frame} counter="999 / 1,000" />
        <Blok
          frame={frame}
          who="hollis"
          position={HOLLIS_IN}
          eyes="happy"
          mouth="smile"
          nod={0.22}
          brow={0.3}
          reach={[1.15 + rub, 1.25]}
          spread={[-0.35, -0.3]}
          holdR={<KeyRing position={[-0.25, 0.1, 0.25]} rotation={[0, 0, 0.3]} scale={1.1} swing={frame * 0.2} shine={0.5 + 0.5 * Math.max(0, Math.sin(frame * 0.3))} />}
          blinkSeed={6}
        />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Insert: Schild „ONLY NEEDED / WHILE SHUT“ schwingt im Wind
  const sign: V3 = [BOOTH[0], 0.6, BOOTH[2] + 1.35];
  const a = frameOn(sign, 3.0, 0.5, 0.5, [-0.18, 0.15, 1]);
  const b = frameOn(sign, 2.5, 0.5, 0.5, [-0.14, 0.15, 1]);
  return (
    <>
      <DayLight target={[5, 0, 2]} />
      <Square frame={frame} counter="999 / 1,000" signSwing={2.4} />
      <pointLight position={[BOOTH[0] + 1, 3.6, BOOTH[2] + 3]} color="#FFE2B0" intensity={4} distance={5} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 9 stakes – „Pip stares at the painted sea. | Eighty-three years… | and counting.“ */
/* ------------------------------------------------------------------ */
const PIP_SIT: V3 = [0.8, 0, 1.6];
export const TorStakes: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("stakes");
  if (shot === 0) {
    // leerer Platz in violetter Dämmerung, Pip allein am Fuß des Tors, Plakate lösen sich
    const a = cam([-5, 3.2, 22], [0.6, 4.6, 0], 40);
    const b = cam([-4.3, 3.0, 19.5], [0.6, 4.4, 0], 40);
    return (
      <>
        <DuskLight />
        <Square frame={frame} counter="999 / 1,000" lit={0.6} />
        {[
          [-3.9, 1.4, 0.06],
          [3.9, 3.5, 0.06],
          [-4.4, 5.6, 0.06],
        ].map((p, i) => (
          <Poster key={i} position={p as V3} peel={0.5 + 0.5 * Math.sin(frame * 0.04 + i)} rotation={[0, 0, (i - 1) * 0.12]} scale={0.9} />
        ))}
        <Blok frame={frame} who="pip" position={PIP_SIT} rotation={[0, Math.PI - 0.1, 0]} sit nod={-0.25} eyes="sad" mouth="frown" reach={[1.1, 1.1]} spread={[-0.2, -0.2]} />
        <pointLight position={[1.5, 3.5, 4]} color="#FFB48A" intensity={3} distance={8} decay={2} />
        <Flakes frame={frame} center={[0.8, 3.5, 0.8]} size={[3, 5, 1.2]} count={14} seed={5} speed={0.006} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Nah: eine Flocke gemaltes Meer schwebt an Pips traurigen Augen vorbei
  const fl = beat("paintFlakeFalls");
  const head = headOf("pip", PIP_SIT, 1);
  const h: V3 = [head[0], head[1] - 0.72, head[2]];
  const fy = lerp(h[1] + 1.4, h[1] - 1.2, ramp(frame, fl - 30, fl + 30, (x) => x));
  const a = frameOn(h, 2.9, 0.5, 0.5, [-0.15, 0.05, 1]);
  const b = frameOn(h, 2.5, 0.5, 0.5, [-0.12, 0.05, 1]);
  return (
    <>
      <DuskLight />
      <Square frame={frame} counter="999 / 1,000" lit={0.6} />
      <Blok frame={frame} who="pip" position={PIP_SIT} rotation={[0, Math.PI + 0.25, 0]} sit nod={0.05} look={2.6} eyes="sad" mouth="frown" reach={[1.1, 1.1]} spread={[-0.2, -0.2]} />
      <mesh position={[h[0] + 0.55 + Math.sin(frame * 0.12) * 0.12, fy, h[2] + 1.0]} rotation={[0.4, frame * 0.05, Math.sin(frame * 0.1) * 0.6]}>
        <planeGeometry args={[0.24, 0.17]} />
        <meshStandardMaterial color={T.sea} side={2} roughness={0.5} emissive={T.sea} emissiveIntensity={0.25} />
      </mesh>
      <pointLight position={[h[0] + 0.8, h[1] + 0.8, h[2] + 2.2]} color="#FFB48A" intensity={3} distance={4} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 10 hope – „But the gate never asks… | what the yes is for.“ */
/* ------------------------------------------------------------------ */
export const TorHope: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("hope");
  const pip: V3 = [-2.7, 0, 1.6];
  if (shot === 0) {
    // Makro: Regeltafel „OPENS AT 1,000 YES“ – sonst steht nichts da; Pips Augen weiten sich
    const ask = beat("rulePlate");
    const pop = 1 + 0.3 * ramp(frame, ask, ask + 8, Easing.out(Easing.back(2)));
    const a = frameOn([RULE_PLATE[0] + 0.6, RULE_PLATE[1] - 0.7, RULE_PLATE[2]], 4.6, 0.4, 0.5, [0.1, 0.04, 1]);
    const b = frameOn([RULE_PLATE[0] + 0.6, RULE_PLATE[1] - 0.7, RULE_PLATE[2]], 4.2, 0.4, 0.5, [0.08, 0.04, 1]);
    return (
      <>
        <DuskLight target={[-2, 0, 2]} />
        <Square frame={frame} counter="999 / 1,000" lit={0.6} />
        <Crate position={[RULE_PLATE[0] + 2.2, 0, 0.9]} s={1.6} />
        <Blok frame={frame} who="pip" position={[RULE_PLATE[0] + 2.2, 1.6, 0.9]} scale={0.85} rotation={[0, -0.55, 0]} eyes="wide" eyePop={pop} mouth="o" look={0} />
        <pointLight position={[RULE_PLATE[0] + 0.5, RULE_PLATE[1] + 0.6, 1.6]} color="#FFD9A0" intensity={4} distance={4} decay={2} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Nah: das Grinsen breitet sich aus, die Stoppuhr im Hintergrund
  const head = headOf("pip", pip);
  const g = ramp(frame, 0, 14);
  const a = frameOn(head, 3.2, 0.52, 0.5, [0.25, 0.04, 1]);
  const b = frameOn(head, 2.7, 0.52, 0.5, [0.22, 0.04, 1]);
  return (
    <>
      <DuskLight target={[-2, 0, 2]} />
      <Square frame={frame} counter="999 / 1,000" lit={0.6} sec={frame * 1.0} />
      <Blok frame={frame} who="pip" position={pip} eyes={g > 0.5 ? "happy" : "wide"} mouth={g > 0.3 ? "grin" : "smile"} brow={-0.3 * g} nod={-0.05} />
      <pointLight position={[head[0] + 0.6, head[1] + 0.6, head[2] + 2]} color="#FFD9A0" intensity={4} distance={4} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 11 turn – „Pip stands. | "Who wants this meeting to be over?" | One thousand yeses. | Even Hollis.“ */
/* ------------------------------------------------------------------ */
const CRATE: V3 = [0.6, 0, 3.6];
const HOLLIS_OUT: V3 = [4.6, 0, 3.4];
export const TorTurn: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("turn");
  const people = useTownCrowd();
  const y = beat("thousandPaddles");
  const crowdPeople = people;
  const pipPos: V3 = [CRATE[0], 1.1, CRATE[2]];
  if (shot === 0) {
    // Untersicht: Pip auf der Kiste, ruft durch die Papiertüte, Pappschild „MEETING OVER?“ hoch
    const st = beat("pipOnCrate");
    const up = ramp(frame, st - 6, st + 6, Easing.out(Easing.back(1.5)));
    const head = headOf("pip", pipPos);
    const a = frameOn([head[0] - 0.4, head[1] - 0.1, head[2]], 9.0, 0.5, 0.5, [0.08, 0.12, 1]);
    const b = frameOn([head[0] - 0.4, head[1] - 0.1, head[2]], 8.0, 0.5, 0.5, [0.06, 0.12, 1]);
    return (
      <>
        <DayLight target={[0, 0, 4]} />
        <Square frame={frame} counter="0 / 1,000" />
        <Crowd people={crowdPeople} frame={frame} raise={() => 0} />
        <Crate position={CRATE} s={1.1} />
        <Blok
          frame={frame}
          who="pip"
          position={[pipPos[0], lerp(0, 1.1, up), pipPos[2]]}
          eyes="wide"
          mouth="yell"
          nod={-0.1}
          reach={[Math.PI - 0.35, 1.45]}
          spread={[0.25, -0.15]}
          holdL={<CardSign scale={0.85} rotation={[Math.PI, 0, 0]} />}
          holdR={<Cone rotation={[-0.25, 0.2, 0]} scale={0.9} />}
          scarfFly={0.3}
        />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // HALT: alle 1.000 Kellen im selben Moment, Hollis brüllt YES, Mütze fliegt, Zähler 1,000 / 1,000 glüht gold
  const flip = ramp(frame, y - 12, y - 2, (x) => x);
  const glow = ramp(frame, y - 2, y + 10);
  const raise = () => ramp(frame, y - 16, y - 9, Easing.out(Easing.back(1.8)));
  const h = beat("hollisYells");
  const yell = frame >= h - 4;
  const capT = Math.max(0, frame - (h - 4));
  const hh = headOf("hollis", HOLLIS_OUT);
  const a = cam([2.2, 8.2, 27], [1.4, 5.2, 2], 40);
  const b = cam([1.9, 7.0, 17.5], [1.4, 5.2, 2], 40);
  return (
    <>
      <DayLight target={[0, 0, 6]} />
      <Square frame={frame} counter={fmt(lerp(0, 1000, flip))} glow={glow} />
      <Crowd people={crowdPeople} frame={frame} raise={raise} cheer={glow} />
      <Crate position={CRATE} s={1.1} />
      <Blok frame={frame} who="pip" position={pipPos} rotation={[0, Math.PI, 0]} eyes="happy" mouth="grin" reach={[Math.PI - 0.3, Math.PI - 0.3]} spread={[0.3, 0.3]} scarfFly={0.5} />
      <Blok
        frame={frame}
        who="hollis"
        position={HOLLIS_OUT}
        rotation={[0, -0.25, 0]}
        eyes={yell ? "closed" : "wide"}
        mouth={yell ? "yell" : "o"}
        nod={yell ? -0.28 : 0}
        reach={[yell ? Math.PI - 0.3 : 0.4, Math.PI - 0.25]}
        spread={[yell ? 0.35 : 0.1, 0.1]}
        holdR={<Paddle color={T.yes} scale={1.4} />}
        cap={!yell}
        scale={1.25}
      />
      {yell ? <HollisCap position={[hh[0] + capT * 0.03, hh[1] * 1.25 - 0.6 + capT * 0.14 - capT * capT * 0.0016, hh[2]]} rotation={[capT * 0.25, capT * 0.1, capT * 0.18]} /> : null}
      <LightShaft from={[GATE_C[0], 12, 1]} to={[0, 0, 6]} radius={5} top={1.2} color="#FFD566" opacity={0.18 * glow} />
      <Motes frame={frame} center={[1, 6, 6]} size={[14, 6, 8]} count={70} color="#FFD566" dot={0.08} opacity={0.6 * glow} seed={12} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 12 open – „The gate opens… | for exactly one second. | Pip jumps.“ */
/* ------------------------------------------------------------------ */
/** Draußen hinter dem Tor (sichtbar durch die Öffnung): heller Himmel und Meer. */
const OutsideGlow: React.FC<{ readonly on: number }> = ({ on }) =>
  on <= 0.01 ? null : (
    <group>
      <mesh position={[0, 4, -18]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial color="#EAF8FF" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.5, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial color={T.sea} toneMapped={false} />
      </mesh>
      <LightShaft from={[0, 3.4, -2]} to={[0, 0, 10]} radius={3.2} top={2.8} color="#FFF6D8" opacity={0.3 * on} />
    </group>
  );

export const TorOpen: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("open");
  const people = useTownCrowd();
  const o = beat("doorsSplit");
  const j = beat("pipLeaps");
  // genau eine Sekunde offen: auf ab „opens“, ab j + 12 wieder zu
  const open = ramp(frame, o - 4, o + 12) * (1 - ramp(frame, j + 6, j + 26));
  if (shot === 0) {
    const a = cam([1.5, 5.2, 19], [0, 4.0, 0], 40);
    const b = cam([1.2, 4.8, 16.5], [0, 3.8, 0], 40);
    return (
      <>
        <DayLight target={[0, 0, 4]} />
        <Square frame={frame} counter="1,000 / 1,000" glow={1} open={open} />
        <OutsideGlow on={open} />
        <Crowd people={people} frame={frame} raise={() => 1 - ramp(frame, o, o + 20) * 0.6} />
        <Blok frame={frame} who="pip" position={[CRATE[0], 0, CRATE[2] - 1.2]} rotation={[0, Math.PI, 0]} lean={0.2} reach={[0.6, 0.6]} spread={[0.3, 0.3]} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Zeitlupe von der Seite: Pip springt durch den Spalt, Schal fliegt, die Flügel schließen schon
  const leap = ramp(frame, j - 10, j + 34, (x) => x);
  const px: V3 = [0.2, 0.2 + Math.sin(leap * Math.PI) * 1.2, lerp(2.2, -2.6, leap)];
  const a = cam([5.0, 3.4, 9.0], [0, 2.6, -1], 40);
  const b = cam([4.6, 3.3, 8.2], [0, 2.6, -1.2], 40);
  return (
    <>
      <DayLight target={[0, 0, 2]} />
      <Square frame={frame} counter="1,000 / 1,000" glow={1} open={Math.max(open, 0.15 * (1 - ramp(frame, j + 26, j + 40)))} />
      <OutsideGlow on={Math.max(open, 0.3)} />
      <Blok frame={frame} who="pip" position={px} rotation={[-0.25, Math.PI, 0]} reach={[2.2, 2.2]} spread={[0.5, 0.5]} walk={0.4} eyes="happy" mouth="grin" scarfFly={1} look={0.6} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 13 sea – „Behind the painted sea… | the real one.“ */
/* ------------------------------------------------------------------ */
export const TorSea: React.FC = () => {
  const { frame, beat, f, len } = useShots("sea");
  const r = beat("waveRinsesPaint");
  const paint = 1 - ramp(frame, r - 2, r + 16);
  const pip: V3 = [0, 0, 1.0];
  const a = cam([1.6, 7.5, 16], [0, 2.4, -8], 40);
  const b = cam([0.9, 1.4, 6.6], [0, 1.9, 0], 40);
  return (
    <>
      <color attach="background" args={["#BFE6F2"]} />
      <fog attach="fog" args={["#CDEBF2", 40, 200]} />
      <directionalLight position={[10, 20, 16]} color="#FFF3DC" intensity={2.6} castShadow />
      <SeaSet frame={frame} />
      <Blok frame={frame} who="pip" position={pip} eyes="happy" mouth="grin" reach={[0.55, 0.55]} spread={[0.1, 0.1]} nod={0.12} paint={paint} scarfFly={0.6 + 0.3 * Math.sin(frame * 0.2)} />
      {/* Schaum um die Stiefel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 1.1]}>
        <ringGeometry args={[0.5, 1.1 + 0.25 * Math.sin(frame * 0.15), 32]} />
        <meshBasicMaterial color={T.foam} transparent opacity={0.8} />
      </mesh>
      {[
        [-6, 9, -4],
        [4, 11, -8],
        [8, 8, -2],
      ].map((p, i) => (
        <Gull key={i} position={[p[0] + Math.sin(frame * 0.02 + i) * 2, p[1], p[2]]} frame={frame} seed={i} scale={1.4} />
      ))}
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 14 first – „First one out in eighty-three years.“ */
/* ------------------------------------------------------------------ */
export const TorFirst: React.FC = () => {
  const { frame, beat, f, len } = useShots("first");
  const s = beat("pipScratchesPlaque");
  const scratch = ramp(frame, s - 6, s + 18);
  const plq: V3 = [PLAQUE[0], PLAQUE[1], -0.1];
  const pip: V3 = [PLAQUE[0] - 1.6, 0, -0.9];
  const a = cam([plq[0] - 1.6, 2.4, -11], [plq[0] - 0.8, 1.9, 0], 40);
  const b = cam([-5, 6.5, -30], [0, 5.2, 0], 40);
  return (
    <>
      <Atmos bg="#CFE3EC" fog={[50, 160]} sky="#FFF1D6" ground="#7A8A4A" hemi={1.05} keyLight={{ pos: [-14, 20, -22], color: "#FFE2B0", intensity: 2.4, target: [0, 0, -4] }} />
      <SkyDome top="#6FB0E4" mid="#BFDDEB" bottom="#F3E1C0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]} receiveShadow>
        <planeGeometry args={[200, 80]} />
        <meshStandardMaterial color="#9AAE5E" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -14]}>
        <planeGeometry args={[3, 28]} />
        <meshStandardMaterial color="#D9C49A" roughness={0.95} />
      </mesh>
      <GateWall counter="0 / 1,000" backCounter scratch={scratch} />
      <Blok frame={frame} who="pip" position={pip} rotation={[0, Math.PI, 0]} reach={[0.2, 0.15]} spread={[1.2 + 0.08 * Math.sin(frame * 0.8), 0.1]} eyes="happy" mouth="grin" look={0.35} paint={0} />
      <Shot frame={f} duration={len} {...fly(a, b)} span={[Math.min(len - 30, beat("pullBackWall") - 10), len]} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 15 stinger – „Now the gate needs a thousand yeses… | from nine hundred ninety-nine people.“ */
/* ------------------------------------------------------------------ */
export const TorStinger: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("stinger");
  const people = useTownCrowd(999);
  if (shot === 0) {
    // drinnen: 999 Klötze erstarrt mit erhobenen Kellen, Zähler bleibt auf „yeses“ bei 999 stehen; Hollis lässt die NO-Kelle sinken
    const y = beat("frozenSquare");
    const hang = ramp(frame, 6, Math.max(20, y + 10));
    const hp: V3 = [3.6, 0, 5.4];
    const a = cam([6.8, 4.4, 17.5], [0.6, 4.6, 1], 40);
    const b = cam([6.3, 4.2, 16], [0.8, 4.5, 1], 40);
    return (
      <>
        <DayLight target={[2, 0, 6]} />
        <Square frame={frame} counter={rollTo(frame, 0, y, 0, 999)} />
        <Crowd people={people} frame={frame} raise={() => 1} />
        <Blok
          frame={frame}
          who="hollis"
          position={hp}
          rotation={[0, 0.35, 0]}
          eyes="sad"
          mouth="frown"
          cap={false}
          reach={[1.0, lerp(1.6, 0.15, hang)]}
          spread={[-0.4, 0.15]}
          holdL={<HollisCap position={[0, -0.1, 0.2]} rotation={[-1.4, 0, 0]} />}
          holdR={<Paddle color={T.no} rotation={[0, 0, -0.4 * hang]} />}
        />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Match Cut aufs Eröffnungsbild: Tor zu, Farblücke, 999 / 1,000 – jetzt das Höchste, was er je zeigen kann
  return <HookFrame frame={frame} f={f} len={len} pip={false} gap />;
};
