/**
 * „In This City, the Gate Needs 1,000 Yeses“ – Szenen 1–7 (hook … hide).
 * Shot-Liste: episodes/tor-stadt.json (scenes[].shots) + docs/paket-tor-stadt.md; Schnitte: torCuts.ts.
 * Zähler-Regel (Lehre Sonne): der Zähler über dem Tor steht am gesprochenen Wort auf dem richtigen Wert
 * (posters: „nine hundred ninety-nine yeses“ → 999 genau auf „yeses“, dann fest).
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { useScene } from "../types";
import { torCuts } from "./torCuts";
import {
  Atmos,
  Banner,
  Barrel,
  Blok,
  Booth,
  BOOTH,
  Clipboard,
  Cobbles,
  Crowd,
  CROWD_Z0,
  cut,
  fly,
  frameOn,
  GateWall,
  headOf,
  lerp,
  LightShaft,
  Motes,
  Paddle,
  Poster,
  ramp,
  SkyDome,
  Stopwatch,
  STOPWATCH,
  T,
  TorHouse,
  TownRing,
  useCrowdLayout,
} from "./torSets";

/* ------------------------------------------------------------------ */
/* Gemeinsames                                                          */
/* ------------------------------------------------------------------ */

/** Schnitte der Szene (torCuts.ts) → aktive Einstellung, lokaler Frame, Länge. */
export const useShots = (id: string) => {
  const { frame, duration, beat } = useScene();
  const cuts = torCuts(id, beat, duration);
  const c = cut(frame, cuts);
  const end = c.shot < cuts.length ? cuts[c.shot] : duration;
  return { frame, duration, beat, cuts, ...c, len: end - c.from };
};

export type Cam = { pos: V3; look: V3; fov: number };
export const cam = (pos: V3, look: V3, fov = 40): Cam => ({ pos, look, fov });

/** Zählerstand „n / 1,000“. */
export const fmt = (n: number) => `${n >= 1000 ? "1,000" : String(Math.max(0, Math.round(n)))} / 1,000`;
/** Zähler rollt von a nach b zwischen den lokalen Frames f0 und f1 (danach fest auf b). */
export const rollTo = (frame: number, f0: number, f1: number, a: number, b: number) => fmt(lerp(a, b, ramp(frame, f0, f1, Easing.out(Easing.cubic))));

/** Tag-Licht der Stadt (warmer Mittag, staubig). */
export const DayLight: React.FC<{ readonly target?: V3 }> = ({ target = [0, 0, 8] }) => (
  <>
    <Atmos bg="#CFE3EC" fog={[40, 150]} sky="#FFF1D6" ground="#9C7A58" hemi={1.05} keyLight={{ pos: [14, 24, 22], color: "#FFE2B0", intensity: 2.5, target }} rim={{ pos: [-12, 14, -12], color: "#FFD9A0", intensity: 1.1 }} />
    <SkyDome top="#7DB6E0" mid="#BFDDEB" bottom="#F3E1C0" />
  </>
);

/** Abendlicht (Violett = Pips Tiefpunkt). */
export const DuskLight: React.FC<{ readonly target?: V3 }> = ({ target = [0, 0, 4] }) => (
  <>
    <Atmos bg={T.dusk} fog={[24, 110]} sky="#8A7AC8" ground="#2A1E3A" hemi={0.75} keyLight={{ pos: [-16, 6, 22], color: "#FFB48A", intensity: 1.25, target }} rim={{ pos: [10, 10, -10], color: "#B49AFF", intensity: 1.0 }} />
    <SkyDome top="#1E1638" mid="#4A3470" bottom="#C77BA8" />
  </>
);

/** Platz mit Mauer, Tor, Häuschen, Stoppuhr (ohne Menge). */
export const Square: React.FC<{
  readonly frame: number;
  readonly counter: string;
  readonly glow?: number;
  readonly open?: number;
  readonly gap?: boolean;
  readonly sec?: number;
  readonly banner?: boolean;
  readonly lit?: number;
  readonly booth?: boolean;
  readonly signSwing?: number;
  readonly signText?: boolean;
}> = ({ frame, counter, glow = 0, open = 0, gap = false, sec = 0, banner = false, lit = 0, booth = true, signSwing = 0.6, signText = true }) => (
  <>
    <Cobbles />
    <GateWall counter={counter} glow={glow} open={open} gap={gap} />
    <TownRing lit={lit} />
    {booth ? <Booth frame={frame} signSwing={signSwing} signText={signText} /> : null}
    <Stopwatch sec={sec} />
    {banner ? <Banner position={[0, 6.6, 20]} text="SUNDAY  NOON" width={12} frame={frame} /> : null}
  </>
);

/** Menge auf dem Platz: 1.000 Klötze in 40 Spalten, vordere Reihe bei CROWD_Z0. Freiraum für Pips Kiste (turn). */
export const useTownCrowd = (n = 1000) => useCrowdLayout(n, 40, 0.62, 0.7, CROWD_Z0, 17);

/** Kamera des Eröffnungsbilds (Hook Shot 1 = Match-Cut-Ziel im stinger): hinter Pip, Blick hoch zu Tor + Zähler. */
const HOOK_A = cam([2.6, 1.7, 21], [0.2, 8.3, 0], 40);
const HOOK_B = cam([2.3, 1.8, 19], [0.2, 5.9, 0], 40);
export const PIP_HOOK: V3 = [1.3, 0, 4.2];

/** Eröffnungsbild: geschlossenes Tor, gemaltes Meer, Zähler „999 / 1,000“; mit Pip (Hook) oder ohne + Farblücke (stinger). */
export const HookFrame: React.FC<{ readonly frame: number; readonly f: number; readonly len: number; readonly pip: boolean; readonly gap: boolean }> = ({ frame, f, len, pip, gap }) => (
  <>
    <DayLight target={[0, 0, 4]} />
    <Square frame={frame} counter="999 / 1,000" gap={gap} />
    {pip ? <Blok frame={0} who="pip" position={PIP_HOOK} rotation={[0, Math.PI - 0.2, 0]} nod={-0.32} look={0.15} eyes="dot" mouth="flat" blinkSeed={4} /> : null}
    <LightShaft from={[9, 16, 10]} to={[0.5, 0, 2]} radius={3.2} top={0.6} color="#FFE2B0" opacity={0.16} />
    <Motes frame={frame} center={[0.8, 3.5, 6]} size={[10, 7, 8]} count={70} drift={[0.003, 0.002, 0]} color="#FFE2B0" dot={0.06} opacity={0.55} seed={4} />
    <Shot frame={f} duration={len} {...fly(HOOK_A, HOOK_B)} ease="inOut" />
  </>
);

/** Ärmel des Torwächters (marineblau, Messingknopf) mit Kelle, Ursprung = Ellbogen, Unterarm nach +y. */
export const Sleeve: React.FC<{ readonly position: V3; readonly rise: number; readonly color?: string; readonly rotation?: V3 }> = ({ position, rise, color = T.no, rotation = [0, 0, 0] }) => (
  <group position={[position[0], position[1] - 1.2 * (1 - rise), position[2]]} rotation={rotation}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[0.34, 0.9, 0.34]} />
      <meshStandardMaterial color={T.navy} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.82, 0.18]}>
      <circleGeometry args={[0.055, 14]} />
      <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.98, 0]}>
      <sphereGeometry args={[0.19, 14, 10]} />
      <meshStandardMaterial color="#EBC29B" roughness={0.5} />
    </mesh>
    <group position={[0, 1.0, 0]}>
      <Paddle color={color} />
    </group>
  </group>
);

/** Tauben auf dem Zähler (Hook Shot 2). */
const Pigeon: React.FC<{ readonly position: V3; readonly frame: number; readonly seed: number }> = ({ position, frame, seed }) => {
  const peck = Math.max(0, Math.sin(frame * 0.12 + seed * 2)) ** 6;
  return (
    <group position={position} rotation={[0, seed, 0]}>
      <mesh position={[0, 0.18, 0]} scale={[1, 0.8, 1.3]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color="#8A8E9A" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.36 - peck * 0.12, 0.18 + peck * 0.06]}>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color="#6E7486" roughness={0.6} />
      </mesh>
    </group>
  );
};

/** Schlüsselloch-Beschlag mit Spinnweben (Mitte = position, Blick +z). */
const Keyhole: React.FC<{ readonly position: V3; readonly frame: number }> = ({ position, frame }) => (
  <group position={position}>
    <mesh>
      <circleGeometry args={[0.42, 36]} />
      <meshStandardMaterial color={T.brass} metalness={0.85} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.07, 0.01]}>
      <circleGeometry args={[0.1, 20]} />
      <meshBasicMaterial color="#0A0604" />
    </mesh>
    <mesh position={[0, -0.1, 0.01]}>
      <planeGeometry args={[0.09, 0.28]} />
      <meshBasicMaterial color="#0A0604" />
    </mesh>
    {/* Spinnweben: Speichen + Ringe, leicht wehend */}
    <group position={[0.18, 0.2, 0.03]} rotation={[0, 0, Math.sin(frame * 0.05) * 0.04]}>
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={k} rotation={[0, 0, (k / 7) * Math.PI * 2]} position={[0, 0, 0]}>
          <planeGeometry args={[0.008, 0.9]} />
          <meshBasicMaterial color="#F2F2F2" transparent opacity={0.75} />
        </mesh>
      ))}
      {[0.12, 0.22, 0.32, 0.42].map((r) => (
        <mesh key={r}>
          <ringGeometry args={[r, r + 0.007, 7]} />
          <meshBasicMaterial color="#F2F2F2" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  </group>
);

/* ------------------------------------------------------------------ */
/* 1 hook – „Nobody has left this city in eighty-three years. | The gate needs one yes… | from all one thousand.“ */
/* ------------------------------------------------------------------ */
export const TorHook: React.FC = () => {
  const { frame, shot, f, len } = useShots("hook");
  if (shot === 0) return <HookFrame frame={frame} f={f} len={len} pip gap={false} />;
  if (shot === 1) {
    // Untersicht: Mauer ragt auf, Rostschild „SHUT FOR 83 YEARS“, Tauben auf dem Zähler
    const a = cam([-4.6, 0.8, 15], [1.2, 5.4, 0], 42);
    const b = cam([-4.0, 0.9, 13.6], [1.2, 5.6, 0], 42);
    return (
      <>
        <DayLight target={[0, 0, 4]} />
        <Square frame={frame} counter="999 / 1,000" />
        {[-1.9, -0.6, 1.4, 2.3].map((x, i) => (
          <Pigeon key={i} position={[x, 8.86, 0.42]} frame={frame} seed={i + 1} />
        ))}
        <LightShaft from={[9, 16, 10]} to={[1.5, 0, 1]} radius={3} top={0.6} color="#FFE2B0" opacity={0.14} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Schlüsselloch mit Spinnweben, abblätterndes gemaltes Meer rundherum
  const kh: V3 = [0.45, 2.75, 0.1];
  const a = frameOn(kh, 2.4, 0.5, 0.5, [0.08, 0.05, 1]);
  const b = frameOn(kh, 1.9, 0.5, 0.5, [0.05, 0.04, 1]);
  return (
    <>
      <DayLight target={[0, 0, 2]} />
      <Square frame={frame} counter="999 / 1,000" />
      <Keyhole position={kh} frame={frame} />
      <pointLight position={[1.6, 3.6, 2.4]} color="#FFE2B0" intensity={5} distance={5} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 2 rule – „Every single person. | At the exact same second.“ */
/* ------------------------------------------------------------------ */
export const TorRule: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("rule");
  const people = useTownCrowd();
  if (shot === 0) {
    // Draufsicht: der ganze Platz voller Klötze, alle zum Tor gewandt
    const a = cam([0, 30, 38], [0, 0, 12], 40);
    const b = cam([0, 27, 35], [0, 0, 12], 40);
    return (
      <>
        <DayLight target={[0, 0, 12]} />
        <Square frame={frame} counter="0 / 1,000" />
        <Crowd people={people} frame={frame} raise={() => 0} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Stoppuhr: Zeiger rast und rastet auf „second“ auf einer Marke ein
  const snap = beat("stopwatchSnap");
  const sec = frame < snap ? 40 + frame * 0.9 : 60 + Math.sin(Math.min(1, (frame - snap) / 8) * Math.PI * 3) * 0.6 * Math.max(0, 1 - (frame - snap) / 10);
  const face: V3 = [STOPWATCH[0], 4.6, STOPWATCH[2] + 0.2];
  const a = frameOn(face, 3.6, 0.48, 0.5, [0.12, 0.02, 1]);
  const b = frameOn(face, 3.0, 0.48, 0.5, [0.08, 0.02, 1]);
  return (
    <>
      <DayLight target={[0, 0, 4]} />
      <Square frame={frame} counter="0 / 1,000" sec={sec} />
      <pointLight position={[STOPWATCH[0] + 1.2, 5.6, STOPWATCH[2] + 2.5]} color="#FFE2B0" intensity={6} distance={6} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 3 world – „This is Yesbury. | Every Sunday: a gate meeting. | And every Sunday… | one voice says no.“ */
/* ------------------------------------------------------------------ */
export const TorWorld: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("world");
  const people = useTownCrowd();
  const up = beat("paddlesUp");
  if (shot === 0) {
    // Kran-Fahrt über die Ziegeldächer hinab auf den Platz, Banner quer, Menge versammelt sich
    const a = cam([5, 26, 52], [0, 3, 6], 40);
    const b = cam([4, 15, 40], [0, 4, 4], 40);
    return (
      <>
        <DayLight target={[0, 0, 12]} />
        <Square frame={frame} counter="0 / 1,000" banner />
        <Crowd people={people} frame={frame} raise={() => 0} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // 999 grüne Kellen gehen hoch, der Zähler klappt auf 999
    const raise = (d: number) => ramp(frame, up - 2 + d * 8, up + 6 + d * 8);
    const a = cam([5.5, 8.5, 27], [0, 4.6, 3], 40);
    const b = cam([5.0, 8.2, 24.5], [0, 4.8, 2.5], 40);
    return (
      <>
        <DayLight target={[0, 0, 12]} />
        <Square frame={frame} counter={rollTo(frame, up + 4, up + 20, 0, 999)} />
        <Crowd people={people} frame={frame} raise={raise} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Totale von oben (Regie-Befund): 999 grüne Kellen, genau EINE rote mittig – die rote Kelle hebt sich auf „no“
  const no = beat("redPaddle");
  const rise = ramp(frame, no - 6, no + 2, Easing.out(Easing.back(1.6)));
  const mid = people.reduce((m, q) => (Math.hypot(q.x, q.z - 15.2) < Math.hypot(m.x, m.z - 15.2) ? q : m), people[0]);
  const rest = people.filter((q) => q !== mid);
  // schräg von oben hinter der Menge: Kellen-Scheiben (Blick +z) zeigen zur Kamera
  const a = cam([0, 12.5, 31], [0, 0.8, 15.2], 40);
  const b = cam([0, 11.0, 28.5], [0, 0.8, 15.2], 40);
  return (
    <>
      <DayLight target={[0, 0, 14]} />
      <Square frame={frame} counter="999 / 1,000" />
      <Crowd people={rest} frame={frame} raise={() => 1} />
      {/* die eine rote Kelle: größer und höher als alle grünen, damit sie in der Totale sofort liest */}
      <group position={[mid.x, 0, mid.z]} scale={1.15}>
        <Sleeve position={[0, 0.55, 0]} rise={rise} />
      </group>
      <pointLight position={[mid.x, 3.2, mid.z + 0.6]} color="#FFD7C0" intensity={6 * rise} distance={4} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 4 pip – „Meet Pip. | She has only seen the sea… | painted on the gate.“ */
/* ------------------------------------------------------------------ */
const PIP_LEAN: V3 = [0.8, 0, 0.7];
const PIP_TOUCH: V3 = [0.75, 0, 1.6];
const SIDE = -Math.PI / 2;
export const TorPip: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("pip");
  if (shot === 0) {
    // Stirn am Tor, Augen zu, Lächeln; Kopf zur Kamera gedreht
    const head = headOf("pip", PIP_LEAN);
    const a = frameOn(head, 4.6, 0.5, 0.6, [-1, 0.05, 0.45]);
    const b = frameOn(head, 4.0, 0.5, 0.6, [-1, 0.05, 0.5]);
    return (
      <>
        <DayLight target={[0, 0, 2]} />
        <Square frame={frame} counter="999 / 1,000" />
        <Blok frame={frame} who="pip" position={PIP_LEAN} rotation={[0, SIDE, 0]} look={0.15} eyes="closed" mouth="smile" reach={[0.2, 0.3]} spread={[0.5, 0.1]} />
        <pointLight position={[3, 3.4, 2.4]} color="#FFE2B0" intensity={5} distance={6} decay={2} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Makro: Hand auf der gemalten Welle, türkise Farbflocken bleiben an den Fingern (PFLANZUNG gemaltes Meer)
  const t = beat("paintedWaveTouch");
  const paint = ramp(frame, t - 4, t + 10);
  const hand: V3 = [0.75, 1.45, 0.1];
  // weiter als vorher (Regie: Makro unklar) → Hand + mehrere gemalte Wellen lesbar
  const a = frameOn(hand, 3.4, 0.55, 0.5, [-0.7, 0.15, 1]);
  const b = frameOn(hand, 2.9, 0.55, 0.5, [-0.65, 0.15, 1]);
  return (
    <>
      <DayLight target={[0, 0, 2]} />
      <Square frame={frame} counter="999 / 1,000" />
      <Blok frame={frame} who="pip" position={PIP_TOUCH} rotation={[0, SIDE, 0]} look={0.3} eyes="closed" mouth="smile" reach={[0.05, 0.1]} spread={[1.13 - 0.05 * paint, 0.1]} paint={paint} />
      <pointLight position={[2.6, 2.4, 2.0]} color="#FFE2B0" intensity={4} distance={5} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 5 posters – „So Pip hangs posters. | Sunday: nine hundred ninety-nine yeses… | and one no.“ */
/* ------------------------------------------------------------------ */
const POSTER_SPOTS: readonly V3[] = [
  [-4.6, 2.5, 1.53],
  [-1.2, 2.7, 1.53],
  [2.3, 2.4, 1.53],
  [5.6, 2.6, 1.53],
];
export const TorPosters: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("posters");
  const people = useTownCrowd();
  if (shot === 0) {
    // Gasse: Pip klebt gelbe Plakate an jede Wand (eins nach dem anderen, auf „posters“ beginnend)
    const p0 = beat("posterMontage");
    const pipX = lerp(POSTER_SPOTS[0][0] + 0.9, POSTER_SPOTS[3][0] + 0.9, ramp(frame, 0, len, (x) => x));
    const a = cam([0.8, 3.2, 17], [0.2, 2.6, 0], 40);
    const b = cam([2.0, 3.1, 15.5], [1.4, 2.6, 0], 40);
    return (
      <>
        <DayLight target={[0, 0, 2]} />
        <Cobbles />
        {[-6, -2.7, 0.6, 3.9, 7.2].map((x, i) => (
          <TorHouse key={i} position={[x, 0, 0]} w={3.2} h={4.6 + (i % 2) * 0.8} color={i % 2 ? T.cream : T.terra} seed={i + 2} />
        ))}
        {POSTER_SPOTS.map((p, i) => (
          <Poster key={i} position={p} on={frame >= p0 - 30 + i * 16 ? ramp(frame, p0 - 30 + i * 16, p0 - 24 + i * 16) : 0} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.04]} />
        ))}
        <Blok frame={frame} who="pip" position={[pipX, 0, 2.2]} rotation={[0, Math.PI - 0.5, 0]} walk={0.6} reach={[0.4, 1.5]} look={-0.5} eyes="happy" mouth="grin" />
        <Motes frame={frame} center={[1, 3, 4]} size={[10, 5, 5]} count={40} color="#FFE2B0" dot={0.05} opacity={0.5} seed={9} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Sonntag: 999 Kellen, Zähler rollt genau auf „yeses“ auf 999; Pip vorn rechts, ihr Gesicht fällt auf „no“
  const y = beat("counter999again");
  const no = beat("pipFaceDrops");
  const drop = frame >= no;
  const pip: V3 = [-2.6, 0, 12.0];
  const a = cam([-6, 5.2, 21], [-0.4, 5.2, 2], 40);
  const b = cam([-5.4, 4.4, 19.5], [-1.2, 3.8, 6], 40);
  return (
    <>
      <DayLight target={[0, 0, 6]} />
      <Square frame={frame} counter={rollTo(frame, 0, y, 0, 999)} />
      <Crowd people={people.filter((q) => Math.hypot(q.x - pip[0], q.z - pip[2]) > 1.1 && !(q.z > pip[2] && q.x < pip[0] + 1.5))} frame={frame} raise={() => 1} />
      <Blok frame={frame} who="pip" position={pip} rotation={[0, -0.35, 0]} nod={drop ? 0.12 : -0.35} look={drop ? 0.5 : 0.2} eyes={drop ? "sad" : "wide"} mouth={drop ? "frown" : "smile"} reach={[0.2, 0.2]} />
      {/* die eine rote Kelle am Häuschen */}
      <Sleeve position={[BOOTH[0] - 0.4, 1.2, BOOTH[2] + 1.4]} rise={1} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 6 doors – „She knocks on every door. | Everyone swears: yes. | So who's lying?“ */
/* ------------------------------------------------------------------ */
const STREET_X = [-6, -2.7, 0.6, 3.9, 7.2, 10.5, 13.8] as const;
export const TorDoors: React.FC = () => {
  const { frame, shot, f, len } = useShots("doors");
  if (shot === 0) {
    // Über die Schulter: Pip läuft die Gasse gleicher Terrakotta-Türen entlang, Nachbarn nicken, Hand auf dem Herzen
    const px = lerp(-5.6, 9.5, ramp(frame, 0, len, (x) => x));
    const head = headOf("pip", [px, 0, 2.4]);
    const a = cam([px - 5.2, head[1] + 1.4, 9.0], [px + 2.4, 2.2, 0.8], 42);
    const nb: { who: "baker" | "granny" | "twin"; x: number; s: number }[] = [
      { who: "baker", x: STREET_X[1], s: 0.95 },
      { who: "granny", x: STREET_X[3], s: 0.9 },
      { who: "twin", x: STREET_X[5] - 0.35, s: 0.62 },
      { who: "twin", x: STREET_X[5] + 0.45, s: 0.62 },
    ];
    return (
      <>
        <DayLight target={[px, 0, 2]} />
        <Cobbles />
        {STREET_X.map((x, i) => (
          <TorHouse key={i} position={[x, 0, 0]} w={3.2} h={4.6} color={T.terra} seed={2} door={T.woodDark} doorOpen={Math.abs(px - x) < 4 || x < px ? 1 : 0} />
        ))}
        {nb.map((n, i) => {
          const near = ramp(px, n.x - 3.5, n.x - 1.5);
          return (
            <Blok
              key={i}
              frame={frame}
              who={n.who}
              position={[n.x + (n.who === "twin" ? 0 : 0.05), 0, 1.75]}
              scale={n.s}
              eyes="happy"
              mouth="smile"
              nod={0.18 * Math.max(0, Math.sin(frame * 0.32 + i)) * near}
              reach={[0.1, 0.1 + 1.05 * near]}
              spread={[0.08, 0.08 - 0.55 * near]}
              blinkSeed={i + 3}
            />
          );
        })}
        <Blok frame={frame} who="pip" position={[px, 0, 2.4]} rotation={[0, Math.PI / 2 - 0.35, 0]} walk={1} reach={[0.25, 0.25]} eyes="dot" mouth="smile" look={-0.4} />
        <Shot frame={f} duration={len} from={a.pos} to={[a.pos[0] + 0.6, a.pos[1], a.pos[2] - 0.4]} look={a.look} lookTo={[a.look[0] + 0.6, a.look[1], a.look[2]]} fov={a.fov} shake={0.02} ease="linear" />
      </>
    );
  }
  // Klemmbrett: 1.000 Häkchen unter YES, Pip kneift die Augen zusammen
  const pip: V3 = [0, 0, 0];
  const head = headOf("pip", pip);
  const board: V3 = [0.15, 1.75, 0.95];
  const a = cam([0.55, head[1] + 0.55, 2.9], [0.1, 1.85, 0.2], 40);
  const b = cam([0.45, head[1] + 0.35, 2.55], [0.1, 1.9, 0.2], 40);
  return (
    <>
      <DayLight target={[0, 0, 0]} />
      <Cobbles />
      <TorHouse position={[0, 0, -2.2]} w={3.6} h={4.6} color={T.terra} seed={2} />
      <Blok frame={frame} who="pip" position={pip} nod={0.35} eyes="closed" mouth="flat" brow={0.6} reach={[0.9, 0.9]} spread={[-0.25, -0.25]} />
      <Clipboard position={board} rotation={[-0.75, 0, 0]} scale={0.62} />
      <pointLight position={[0.6, 3.2, 2.4]} color="#FFE2B0" intensity={5} distance={5} decay={2} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 7 hide – „Next Sunday, Pip hides near the gate. | The no comes from… | the gatekeeper.“ */
/* ------------------------------------------------------------------ */
export const HOLLIS_IN: V3 = [BOOTH[0], 0, BOOTH[2] - 0.15];
export const TorHide: React.FC = () => {
  const { frame, beat, shot, f, len, from } = useShots("hide");
  if (shot === 0) {
    // hinter dem Fass: Pip späht hervor, der Zähler leuchtet über dem Tor
    const barrel: V3 = [2.4, 0, 6.2];
    const pip: V3 = [3.1, 0, 6.9];
    const a = cam([9.5, 1.8, 12.5], [0.2, 4.2, 0], 42);
    const b = cam([8.9, 1.9, 11.6], [0.2, 4.4, 0], 42);
    return (
      <>
        <DayLight target={[0, 0, 4]} />
        <Square frame={frame} counter="999 / 1,000" glow={0.25} />
        <Barrel position={barrel} scale={1.25} />
        <Blok frame={frame} who="pip" position={pip} rotation={[0, Math.PI + 0.7, 0]} lean={0.15} nod={-0.2} look={0.9} eyes="wide" mouth="flat" reach={[0.6, 0.3]} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  const g = beat("hollisRevealed");
  if (shot === 1) {
    // Ranfahrt ans Häuschen: im Fenster hebt sich die rote NO-Kelle
    const rise = ramp(frame, from + 6, from + 20, Easing.out(Easing.back(1.4)));
    const win: V3 = [BOOTH[0], 2.0, BOOTH[2] + 1.1];
    const a = frameOn(win, 6.5, 0.52, 0.5, [-0.25, 0.08, 1]);
    const b = frameOn(win, 4.6, 0.52, 0.5, [-0.22, 0.08, 1]);
    return (
      <>
        <DayLight target={[5, 0, 2]} />
        <Square frame={frame} counter="999 / 1,000" glow={0.25} signText={false} />
        <Sleeve position={[BOOTH[0] - 0.3, 1.25, BOOTH[2] + 0.6]} rise={rise} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // MISTER HOLLIS senkt die Kelle, schaut sich um
  const head = headOf("hollis", HOLLIS_IN);
  const lower = ramp(frame, g, g + 18);
  const glance = Math.sin(Math.max(0, frame - g) * 0.16) * 0.5;
  const a = frameOn(head, 3.6, 0.5, 0.5, [-0.12, 0.02, 1]);
  const b = frameOn(head, 3.2, 0.5, 0.5, [-0.1, 0.02, 1]);
  return (
    <>
      <DayLight target={[5, 0, 2]} />
      <Square frame={frame} counter="999 / 1,000" />
      <Blok frame={frame} who="hollis" position={HOLLIS_IN} look={glance} eyes="dot" mouth="flat" brow={-0.4} reach={[0.2, lerp(Math.PI - 0.35, 0.9, lower)]} holdR={<Paddle color={T.no} />} blinkSeed={6} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};
