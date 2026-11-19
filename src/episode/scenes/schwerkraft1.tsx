/**
 * „In This City, Gravity Pulls Toward Marta“ – Szenen 1–7 (hook … rehook).
 * Shot-Liste: episodes/schwerkraft-stadt.json (scenes[].shots) + docs/paket-schwerkraft-stadt.md; Schnitte: schwerkraftCuts.ts.
 * Welt: Schüssel-Stadt (Boden y = K·r²), Martas Veranda in der Mitte, „Hill Street“ läuft von dort nach +z bergauf.
 */
import React from "react";
import { Shot, V3 } from "../kit/camera";
import { useScene } from "../types";
import { schwerkraftCuts } from "./schwerkraftCuts";
import {
  atScreen,
  Balloon,
  Board,
  boColor,
  boState,
  BowlTown,
  bowlY,
  Cat,
  Cloud,
  cut,
  faceTo,
  flapText,
  fly,
  Folk,
  folkHead,
  frameOn,
  G,
  Halo,
  Junk,
  JunkKind,
  lerp,
  MartaHouse,
  Mitten,
  Motes,
  onBowl,
  Pile,
  PullFan,
  PullLine,
  ramp,
  SlantRain,
  Stick,
  StreetLamps,
  TownLight,
  TownScale,
} from "./schwerkraftSets";

/* ------------------------------------------------------------------ */
/* Gemeinsames                                                          */
/* ------------------------------------------------------------------ */

/** Schnitte der Szene (schwerkraftCuts.ts) → aktive Einstellung, lokaler Frame, Länge. */
export const useShots = (id: string) => {
  const { frame, duration, beat } = useScene();
  const cuts = schwerkraftCuts(id, beat, duration);
  const c = cut(frame, cuts);
  const end = c.shot < cuts.length ? cuts[c.shot] : duration;
  return { frame, duration, beat, cuts, ...c, len: end - c.from };
};

export type Cam = { pos: V3; look: V3; fov: number };

/** Anzeige-Tafel im Bild an Bildstelle (xf, yf), Breite `frac` der Bildbreite, Abstand d vor der Kamera. */
export const hudAt = (cam: Cam, xf: number, yf: number, d: number, frac = 0.6) => {
  const position = atScreen(cam, xf, yf, d);
  const H = 2 * d * Math.tan(((cam.fov / 2) * Math.PI) / 180);
  return { position, rotation: faceTo(position, cam.pos), scale: (frac * H * (1080 / 1920)) / 3.34 };
};

/** Marta steht auf der Veranda (Blick +z, zur Hill Street). */
export const MARTA: V3 = [0, 0.18, -0.15];
/** Marta sitzt auf der Bank. */
export const MARTA_SIT: V3 = [0, 0.74, -1.3];
/** Stadtwaage am Platz links hinter der Veranda (Front schräg zur Hill Street). */
export const SCALE_POS: V3 = [-6.4, bowlY(6.6) - 0.1, -2.6];
export const SCALE_ROT: V3 = [0, 0.75, 0];

/** Stadt im Hintergrund + Martas Haus + Laternen der Hill Street; optional Zuglinien zur Veranda. */
export const TownSet: React.FC<{
  readonly frame: number;
  readonly dusk?: number;
  readonly pull?: number;
  readonly pullWidth?: number;
  readonly scale?: boolean;
  readonly needle?: number;
  readonly photo?: boolean;
  readonly clouds?: boolean;
  readonly target?: V3;
  readonly lampLight?: number;
  readonly scaleName?: string;
}> = ({ frame, dusk = 0, pull = 0, pullWidth = 0.05, scale = true, needle = 0.8, photo = false, clouds = true, target = [0, 0, 0], lampLight = 0, scaleName = "MARTA" }) => (
  <>
    <TownLight dusk={dusk} target={target} />
    <BowlTown dusk={dusk} />
    <MartaHouse dusk={dusk} photo={photo} />
    <StreetLamps light={lampLight} />
    {scale ? <TownScale position={SCALE_POS} rotation={SCALE_ROT} needle={needle} name={scaleName} /> : null}
    {pull > 0 ? <PullFan to={[0, 1.4, -0.9]} frame={frame} reach={pull} width={pullWidth} r={16} n={9} /> : null}
    {clouds ? (
      <>
        <Cloud position={[-30, 46, -70]} scale={4} seed={1} />
        <Cloud position={[34, 52, -60]} scale={5} seed={2} />
        <Cloud position={[10, 60, -110]} scale={7} seed={3} />
      </>
    ) : null}
  </>
);

/* ------------------------------------------------------------------ */
/* Eröffnungsbild (Hook Shot 1 = Loop-Ziel): Hand lässt den Apfel los, er fällt SEITWÄRTS nach links (zu Marta). */
/* ------------------------------------------------------------------ */
export const HAND: V3 = onBowl(11, 0, 2.7);
const APPLE0: V3 = [HAND[0], HAND[1] - 0.42, HAND[2] + 0.05];
/** Apfel-Position t Frames nach dem Loslassen: beschleunigt Richtung Marta (−z, leicht abwärts). */
export const appleAt = (t: number): V3 => {
  if (t <= 0) return APPLE0;
  const s = t / 30;
  const d = 2.2 * s * s; // a = 4,4 E/s²
  return [APPLE0[0], APPLE0[1] - d * 0.22 - Math.sin(Math.min(1, s) * Math.PI) * 0.12, APPLE0[2] - d];
};
const hookCam = (k: number) => frameOn([HAND[0], HAND[1] - 0.6, HAND[2] - 0.5], lerp(4.4, 3.8, k), 0.42, 0.6, [-1, 0.12, 0.08]);

export const HookFrame: React.FC<{ readonly frame: number; readonly f: number; readonly len: number; readonly release: number }> = ({ frame, f, len, release }) => {
  const a = hookCam(0);
  const b = hookCam(1);
  const t = f - release;
  const apple = appleAt(t);
  const open = ramp(t, -3, 3);
  return (
    <>
      <TownSet frame={frame} scale={false} target={HAND} />
      <Mitten position={HAND} rotation={[0, -Math.PI / 2, 0.1]} open={open} sleeve={G.towns[3]} />
      <Junk kind="apple" position={apple} rotation={[t * 0.06, 0, t * 0.12]} scale={1.15} />
      {/* der Zug: dünne Bernstein-Linie vom Apfel nach links zur (unsichtbaren) Veranda */}
      <PullLine from={apple} to={[0, 1.4, 0]} bend={[0, 1.4, 0]} width={0.025} frame={frame} reach={1} opacity={0.75} pulses={3} />
      <Motes frame={frame} center={[HAND[0], HAND[1], HAND[2] - 2]} size={[3, 3, 8]} count={40} drift={[0, -0.002, -0.03]} color="#FFF4DD" dot={0.05} opacity={0.5} seed={6} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 1 hook – „In this city, nothing falls down. | It falls toward Granny Marta.“ */
/* ------------------------------------------------------------------ */
export const SkHook: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("hook");
  if (shot === 0) {
    // Cover 0–0,5 s: Hand hält den Apfel, Bernstein-Linie zeigt schon nach links; Loslassen kurz vor „down“
    const release = Math.max(18, beat("appleDropsSideways") - 22);
    return <HookFrame frame={frame} f={f} len={len} release={release} />;
  }
  // Totale, tief: Apfel rollt die Hill Street hinunter und bleibt an Martas Stiefeln liegen
  const hit = beat("appleReachesMarta");
  const k = ramp(frame, hit - 40, hit - 2, (x) => 1 - (1 - x) * (1 - x));
  const r = lerp(9.5, 0.75, k);
  const apple: V3 = r > 1.2 ? onBowl(r, 0.06, 0.22) : [0.12, 0.4, MARTA[2] + 0.75];
  const head = folkHead(MARTA);
  const a = frameOn([0, 2.0, 0.6], 7.2, 0.5, 0.5, [0.12, 0.02, 1]);
  const b = frameOn([0, 1.9, 0.4], 6.4, 0.5, 0.5, [0.1, 0.01, 1]);
  const hud = hudAt(b, 0.5, 0.27, 1.6, 0.62);
  const look = ramp(frame, hit - 6, hit + 6);
  return (
    <>
      <TownSet frame={frame} target={[0, 0, 0]} />
      <Folk frame={frame} kind="marta" position={MARTA} load={0.55} sack nod={0.12 + 0.18 * look} eyes="dot" mouth="smile" reach={[0.15, 0.15]} blinkSeed={3} />
      <Cat position={[1.1, 0.18, -0.6]} rotation={[0, -0.4, 0]} frame={frame} scale={0.9} />
      <Junk kind="apple" position={apple} rotation={[0, 0, -r * 1.6]} scale={1.15} />
      <PullLine from={apple} to={[head[0], 1.3, MARTA[2] + 0.3]} bend={[0, 0.5, 0]} width={0.03} frame={frame} opacity={0.8} />
      <Board label="CENTER OF GRAVITY" value="MARTA" {...hud} pop={ramp(frame, hit - 2, hit + 8)} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 2 rule – „Gravity here pulls toward whoever carries the most. | Right now, that's Marta.“ */
/* ------------------------------------------------------------------ */
export const SkRule: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("rule");
  if (shot === 0) {
    // Stadtwaage: Schale trägt eine prall gefüllte Schürzentasche (LAST), Klapptafel blättert auf „most“ zu MARTA
    const flip = beat("scaleBoardFlips");
    const board: V3 = [SCALE_POS[0] + Math.sin(SCALE_ROT[1]) * 0.2, SCALE_POS[1] + 5.0, SCALE_POS[2] + Math.cos(SCALE_ROT[1]) * 0.2];
    const dir: V3 = [Math.sin(SCALE_ROT[1]) + 0.05, 0.02, Math.cos(SCALE_ROT[1])];
    const a = frameOn(board, 10.2, 0.27, 0.5, dir);
    const b = frameOn(board, 9.4, 0.27, 0.5, dir);
    const towns: { p: V3; c: number; look: number }[] = [
      { p: [SCALE_POS[0] + 2.8, SCALE_POS[1] - 0.1, SCALE_POS[2] + 3.2], c: 1, look: 0.5 },
      { p: [SCALE_POS[0] + 0.6, SCALE_POS[1], SCALE_POS[2] + 4.4], c: 2, look: -0.2 },
      { p: [SCALE_POS[0] - 2.0, SCALE_POS[1] + 0.2, SCALE_POS[2] + 2.8], c: 4, look: -0.6 },
    ];
    const nerv = ramp(frame, flip, flip + 20);
    return (
      <>
        <TownSet frame={frame} needle={lerp(0.55, 0.85, ramp(frame, flip - 6, flip + 14))} scaleName={flapText("MARTA", frame, flip)} target={SCALE_POS} />
        {towns.map((t, i) => (
          <Folk
            key={i}
            frame={frame}
            kind="towns"
            shirt={G.towns[t.c]}
            position={t.p}
            rotation={[0, Math.PI + 0.75 + t.look * 0.4, 0]}
            balloonHat
            tiptoe={0.6}
            nod={-0.3 + 0.1 * nerv}
            eyes={nerv > 0.5 ? "wide" : "dot"}
            mouth={nerv > 0.5 ? "o" : "flat"}
            emptyPockets
            blinkSeed={i + 5}
          />
        ))}
        <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
      </>
    );
  }
  // Nah, leicht von unten: Marta (gleiche Maße wie alle), Gewicht = volle Schürzentaschen + Sack; müdes Winken
  const head = folkHead(MARTA);
  const wave = ramp(frame, beat("martaWaves") - 8, beat("martaWaves") + 4);
  const a = frameOn(head, 4.6, 0.36, 0.5, [0.32, -0.06, 1]);
  const b = frameOn(head, 4.2, 0.36, 0.5, [0.28, -0.04, 1]);
  return (
    <>
      <TownSet frame={frame} target={MARTA} />
      <Folk
        frame={frame}
        kind="marta"
        position={MARTA}
        load={0.75}
        sack
        reach={[0.15, 0.2 + 2.2 * wave]}
        spread={[0.1, 0.25 + Math.sin(frame * 0.35) * 0.22 * wave]}
        eyes="dot"
        mouth="smile"
        nod={-0.05}
        tilt={0.06 * wave}
        blinkSeed={3}
      />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 3 slide – „Every street tilts toward her door. | Hats, cats, rain… all land on her.“ */
/* ------------------------------------------------------------------ */
export const SkSlide: React.FC = () => {
  const { frame, shot, f, len } = useShots("slide");
  if (shot === 0) {
    // Totale von hoch oben, Kran abwärts: die ganze Schüssel kippt zur Veranda, Regen fällt schräg zur Mitte
    const a = frameOn([0, 1, 1], 46, 0.56, 0.5, [0, 1.35, 0.75]);
    const b = frameOn([0, 1, 1], 34, 0.56, 0.5, [0, 0.95, 1]);
    return (
      <>
        <TownSet frame={frame} pull={1} pullWidth={0.12} clouds target={[0, 0, 0]} lampLight={0} />
        <Folk frame={frame} kind="marta" position={MARTA} load={0.75} sack blinkSeed={3} />
        <Halo at={[0, 2.4, -0.6]} size={9} color={G.amber} opacity={0.55} />
        <SlantRain frame={frame} center={[0, 12, 8]} size={[40, 22, 40]} dir={[0, -0.6, -0.8]} count={600} opacity={0.35} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  if (shot === 1) {
    // Bodennah: Hut + aufgeweichter Brief rutschen seitwärts (nach links = zur Veranda), Regen schräg
    const p0 = onBowl(7.5, 0.05);
    const a = frameOn([p0[0], p0[1] + 0.5, p0[2]], 2.8, 0.55, 0.5, [-1, 0.15, -0.05]);
    const b = frameOn([p0[0], p0[1] + 0.5, p0[2] - 0.6], 2.8, 0.55, 0.5, [-1, 0.15, -0.05]);
    const s = f / 30;
    const hatZ = p0[2] + 1.8 - 1.4 * s - 0.5 * s * s;
    const letZ = p0[2] + 2.6 - 1.1 * s - 0.6 * s * s;
    return (
      <>
        <TownSet frame={frame} target={p0} />
        <Junk kind="hat" position={[p0[0] + 0.3, bowlY(hatZ) + 0.05 + Math.abs(Math.sin(f * 0.3)) * 0.06, hatZ]} rotation={[0.2, f * 0.2, 0.35]} />
        <Junk kind="letter" position={[p0[0] - 0.4, bowlY(letZ) + 0.03, letZ]} rotation={[0, f * 0.05, 0]} />
        <SlantRain frame={frame} center={[p0[0], p0[1] + 1.5, p0[2]]} size={[6, 4, 8]} dir={[0, -0.55, -0.85]} count={260} opacity={0.5} seed={8} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Veranda halbnah: Hut, Katze und Regen fliegen von der Seite heran; Marta fängt die Katze, ohne hinzusehen (PLANT: ihre Arme)
  const head = folkHead(MARTA);
  const a = frameOn(head, 6.2, 0.36, 0.48, [0.18, 0.04, 1]);
  const b = frameOn(head, 5.6, 0.36, 0.48, [0.16, 0.04, 1]);
  const land = 26;
  const k = Math.min(1, f / land);
  const catP: V3 = f < land ? [lerp(4.6, 0.05, k), lerp(2.6, 1.25, k) + Math.sin(k * Math.PI) * 0.6, lerp(1.4, 0.32, k)] : [0.05, 1.22, MARTA[2] + 0.45];
  const arms = ramp(f, land - 8, land);
  const hatP: V3 = [lerp(5, -1.2, Math.min(1, f / 40)), 2.6 - Math.min(1, f / 40) * 1.3, 0.6];
  return (
    <>
      <TownSet frame={frame} target={MARTA} />
      <Folk frame={frame} kind="marta" position={MARTA} load={0.75} sack reach={[0.3 + 1.0 * arms, 0.3 + 1.0 * arms]} spread={[0.15, 0.15]} look={0.35} eyes="dot" mouth="smile" blinkSeed={3} />
      {/* Regenschirm zeigt SEITWÄRTS (der Regen kommt von der Seite) */}
      <group position={[-0.8, 2.4, 0.2]} rotation={[0, 0, 1.25]}>
        <mesh>
          <coneGeometry args={[1.1, 0.5, 10, 1, true]} />
          <meshStandardMaterial color="#2E3A5A" side={2} roughness={0.6} />
        </mesh>
        <Stick a={[0, -1.2, 0]} b={[0, 0.25, 0]} r={0.03} color="#2A2224" basic={false} />
      </group>
      <Cat position={catP} rotation={[f < land ? f * 0.25 : 0, -0.6, f < land ? f * 0.2 : 0]} frame={frame} scale={0.85} curl={f < land ? 0.8 : 0} eyes={f < land ? "wide" : "dot"} />
      <Junk kind="hat" position={hatP} rotation={[f * 0.2, 0, f * 0.15]} />
      <SlantRain frame={frame} center={[1.5, 2.5, 0]} size={[10, 6, 6]} dir={[-0.85, -0.5, 0]} count={300} opacity={0.45} seed={3} />
      <PullLine from={catP} to={[0, 1.3, MARTA[2] + 0.3]} width={0.025} frame={frame} opacity={f < land ? 0.7 : 0} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 4 light – „So everyone fights to stay light. | Balloon hats, empty pockets.“ */
/* ------------------------------------------------------------------ */
export const SkLight: React.FC = () => {
  const { frame, shot, f, len } = useShots("light");
  if (shot === 0) {
    // Hill Street seitlich (Kamera −x): Stadtleute mit Ballon-Hüten auf Zehenspitzen, ein Mann lässt die Aktentasche fallen
    const c: V3 = onBowl(12, 0, 1.7);
    const a = frameOn([c[0], c[1], c[2] - 0.6], 5.2, 0.45, 0.5, [-1, 0.1, 0.05]);
    const b = frameOn([c[0], c[1] + 0.2, c[2] + 0.6], 5.2, 0.45, 0.5, [-1, 0.1, 0.05]);
    const walkers = [
      { z: 10.2, sh: 0, seed: 4 },
      { z: 12.0, sh: 2, seed: 6 },
      { z: 13.8, sh: 5, seed: 8 },
    ];
    const drop = 22;
    const bz = 12.0 + 0.55 - (f > drop ? 0.5 * ((f - drop) / 30) ** 2 * 3 : 0);
    return (
      <>
        <TownSet frame={frame} target={c} />
        {walkers.map((w, i) => {
          const z = w.z + f * 0.018;
          return (
            <Folk
              key={i}
              frame={frame}
              kind="towns"
              shirt={G.towns[w.sh]}
              position={onBowl(z, 0, 0)}
              rotation={[0, i === 1 ? -Math.PI / 2 + 0.3 : 0.05, 0]}
              walk={0.9}
              tiptoe={1}
              balloonHat
              emptyPockets
              lean={-0.12}
              eyes={i === 1 && f > drop ? "wide" : "dot"}
              mouth={i === 1 && f > drop ? "o" : "flat"}
              reach={i === 1 ? [0.2, f > drop ? 1.4 : 0.9] : [0.15, 0.15]}
              spread={i === 1 && f > drop ? [0.6, 0.6] : [0.1, 0.1]}
              blinkSeed={w.seed}
            />
          );
        })}
        <Junk kind="briefcase" position={[0.6, bowlY(bz) + (f > drop ? Math.max(0.12, 1.2 - (f - drop) * 0.08) : 1.2), bz]} rotation={[0, Math.PI / 2, f > drop ? (f - drop) * 0.15 : 0]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Detail: eine Hand stülpt die Manteltasche um – leer, eine Motte flattert heraus; dahinter rollen Münzen bergab
  const P: V3 = onBowl(10, 0, 0);
  const pocket: V3 = [P[0] + 0.47, P[1] + 0.95, P[2] + 0.1];
  const a = frameOn([pocket[0], pocket[1] + 0.3, pocket[2]], 3.6, 0.5, 0.42, [0.9, 0.12, 0.6]);
  const b = frameOn([pocket[0], pocket[1] + 0.3, pocket[2]], 3.2, 0.5, 0.42, [0.9, 0.12, 0.6]);
  const out = ramp(f, 4, 16);
  const moth: V3 = [pocket[0] + 0.3 + f * 0.012, pocket[1] + 0.2 + f * 0.018, pocket[2] + Math.sin(f * 0.4) * 0.1];
  const coins = [0, 1, 2, 3].map((i) => {
    const s = Math.max(0, f - 6 - i * 3) / 30;
    const z = 8.8 - i * 0.2 - 0.8 * s * s * 2;
    return [1.6 + i * 0.12, bowlY(z) + 0.1, z] as V3;
  });
  return (
    <>
      <TownSet frame={frame} target={P} />
      <Folk frame={frame} kind="towns" shirt={G.towns[1]} position={P} rotation={[0, 0.5, 0]} balloonHat emptyPockets={out > 0.5} reach={[0.1, 0.5]} spread={[0.1, 0.35]} blinkSeed={9} />
      <Mitten position={[pocket[0] + 0.05, pocket[1] + 0.12, pocket[2] + 0.15]} rotation={[0.3, 0.6, -0.4 - out * 0.4]} sleeve={G.towns[1]} />
      {/* umgestülptes Taschenfutter */}
      <mesh position={[pocket[0] + 0.1 * out, pocket[1] - 0.12 * out, pocket[2] + 0.22]} rotation={[0, 0.5, 0.4 * out]}>
        <boxGeometry args={[0.32, 0.36 * out + 0.02, 0.08]} />
        <meshStandardMaterial color="#F2EEE6" roughness={0.9} />
      </mesh>
      {out > 0.6 ? (
        <group position={moth} rotation={[0, 0.5, 0]}>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.06, 0, 0]} rotation={[0, sd * (0.4 + Math.sin(f * 1.3) * 0.6), 0]}>
              <planeGeometry args={[0.12, 0.09]} />
              <meshStandardMaterial color="#D8D0C0" side={2} />
            </mesh>
          ))}
        </group>
      ) : null}
      <Folk frame={frame} kind="towns" shirt={G.towns[4]} position={[1.9, bowlY(9.4), 9.4]} rotation={[0, -0.4, 0]} balloonHat reach={[1.2, 1.2]} spread={[0.2, 0.2]} blinkSeed={11} />
      {coins.map((c, i) => (
        <Junk key={i} kind="coin" position={c} rotation={[0, 0, f * 0.3]} scale={1.4} />
      ))}
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 5 dump – „Whatever they toss rolls to Marta's porch. | Every catch makes her heavier.“ */
/* ------------------------------------------------------------------ */
const ROLLERS: { kind: JunkKind; a: number; r0: number; delay: number }[] = [
  { kind: "umbrella", a: 0.12, r0: 13, delay: 0 },
  { kind: "shoe", a: -0.1, r0: 12, delay: 6 },
  { kind: "wheel", a: 0.02, r0: 14.5, delay: 3 },
  { kind: "teapot", a: -0.16, r0: 13.5, delay: 10 },
  { kind: "box", a: 0.18, r0: 15, delay: 14 },
];
export const SkDump: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("dump");
  if (shot === 0) {
    // Fahrt bergab: Schirme, Schuhe, ein Fahrrad-Rad und eine Teekanne hüpfen zur Veranda
    const a = frameOn(onBowl(9.5, 0, 1.2), 7, 0.55, 0.5, [0.05, 0.35, 1]);
    const b = frameOn(onBowl(5.5, 0, 1.0), 7, 0.55, 0.5, [0.05, 0.3, 1]);
    return (
      <>
        <TownSet frame={frame} pull={0.7} pullWidth={0.05} target={onBowl(6)} />
        <Folk frame={frame} kind="marta" position={MARTA} load={0.75} sack blinkSeed={3} />
        <Pile position={[0, 0.18, -0.15]} grow={0.35} />
        {ROLLERS.map((j, i) => {
          const s = Math.max(0, f - j.delay) / 30;
          const r = Math.max(1.6, j.r0 - 1.6 * s - 1.0 * s * s);
          const bounce = Math.abs(Math.sin(s * 5 + i)) * 0.35;
          return <Junk key={i} kind={j.kind} position={onBowl(r, j.a, 0.25 + bounce)} rotation={[s * 4, 0, s * 3]} scale={1.2} />;
        })}
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Veranda: Stapel wächst, Marta steckt einen Schlüssel in die Schürzentasche, hinten tickt die Stadtwaage weiter
  const t = beat("scaleNeedleTicks");
  const head = folkHead(MARTA);
  const a = frameOn([head[0] - 0.8, head[1] - 0.3, head[2]], 7.6, 0.38, 0.5, [0.32, 0.06, 1]);
  const b = frameOn([head[0] - 0.8, head[1] - 0.3, head[2]], 7.0, 0.38, 0.5, [0.3, 0.06, 1]);
  const stuff = ramp(f, 6, 20) * (1 - ramp(f, 26, 40));
  const grow = lerp(0.5, 0.85, ramp(frame, t - 40, t + 10));
  return (
    <>
      <TownSet frame={frame} needle={lerp(0.85, 0.95, ramp(frame, t - 3, t + 3))} target={MARTA} />
      <Folk frame={frame} kind="marta" position={MARTA} load={lerp(0.75, 0.95, ramp(f, 20, 30))} sack reach={[0.2, 0.5 + 0.6 * stuff]} spread={[0.1, -0.35 * stuff]} nod={0.2 * stuff} eyes="dot" mouth="flat" blinkSeed={3} holdR={stuff > 0.1 ? <Junk kind="key" position={[0, 0, 0.1]} scale={1.4} /> : null} />
      <Pile position={[0, 0.18, -0.15]} grow={grow} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 6 lonely – „Nobody visits. | Too close, and you slide. | No hugs in years.“ */
/* ------------------------------------------------------------------ */
export const SkLonely: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("lonely");
  if (shot === 0) {
    // Blick von der Veranda die Straße hinauf: Nachbar winkt von weit oben, macht einen Schritt – rutscht, klammert sich an die Laterne
    const sk = beat("neighbourSkids");
    const slip = ramp(frame, sk - 4, sk + 12);
    const z = lerp(11.6, 9.2, slip);
    const lampP: V3 = [-2.4, bowlY(8.8), 8.8];
    const n: V3 = [-1.4 + 0.5 * slip, bowlY(z), z];
    const a = frameOn(onBowl(9.6, 0, 1.4), 7.5, 0.42, 0.5, [0.15, 0.25, -1]);
    const b = frameOn(onBowl(9.4, 0, 1.4), 6.6, 0.42, 0.5, [0.15, 0.25, -1]);
    return (
      <>
        <TownSet frame={frame} dusk={0.35} target={n} />
        <Folk
          frame={frame}
          kind="towns"
          shirt={G.towns[2]}
          position={n}
          rotation={[0, Math.PI - 0.3 * slip, 0]}
          balloonHat
          lean={0.25 * slip}
          reach={slip > 0.3 ? [1.3, 1.6] : [0.2, 2.4]}
          spread={slip > 0.3 ? [-0.6, 0.4] : [0.1, 0.4 + Math.sin(frame * 0.4) * 0.3]}
          eyes={slip > 0.3 ? "wide" : "dot"}
          mouth={slip > 0.3 ? "o" : "smile"}
          blinkSeed={12}
        />
        {/* Stoß-Linie: der Zug reißt ihn bergab */}
        <PullLine from={folkHead(n)} to={[0, 1.4, 0]} width={0.03 + 0.03 * slip} frame={frame} opacity={0.4 + 0.5 * slip} bend={[0, 1, 0]} />
        <Stick a={lampP} b={[lampP[0] + 0.4, lampP[1] + 3.4, lampP[2] - 0.6]} r={0.08} color="#2A2426" basic={false} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Nah, warmes Abendlicht: Marta allein auf der Bank, Katze auf dem Schoß, offene Arme leer auf den Knien; Foto einer Umarmung
  const head = folkHead(MARTA_SIT, 1, true);
  const a = frameOn([head[0] - 0.4, head[1] - 0.3, head[2]], 4.6, 0.38, 0.5, [0.25, 0.02, 1]);
  const b = frameOn([head[0] - 0.4, head[1] - 0.3, head[2]], 4.1, 0.38, 0.5, [0.22, 0.02, 1]);
  return (
    <>
      <TownSet frame={frame} dusk={1} photo target={MARTA_SIT} clouds={false} />
      <Folk frame={frame} kind="marta" position={MARTA_SIT} sit load={0.9} sack={false} reach={[1.0, 1.0]} spread={[0.32, 0.32]} nod={0.18} eyes="dot" mouth="flat" blinkSeed={3} />
      <Cat position={[0, 0.98, MARTA_SIT[2] + 0.55]} rotation={[0, 0.3, 0]} frame={frame} scale={0.7} eyes="closed" />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 7 rehook – „But being too light is worse.“ */
/* ------------------------------------------------------------------ */
export const SkRehook: React.FC = () => {
  const { frame, beat, f, len } = useShots("rehook");
  // Sehr langsames Ranfahren: eine himmelblaue Ballonschnur rutscht durch eine kleine Hand, Wind setzt ein
  const P: V3 = onBowl(13, 0.4, 1.2);
  const slip = ramp(frame, 6, len - 4, (x) => x);
  const hand: V3 = [P[0], P[1], P[2]];
  const knot: V3 = [hand[0], hand[1] - 0.35 + slip * 0.55, hand[2]];
  const top: V3 = [hand[0] + 0.25, hand[1] + 2.0 + slip * 0.5, hand[2] - 0.2];
  const a = frameOn([hand[0], hand[1] + 0.7, hand[2]], 3.6, 0.5, 0.5, [0.25, 0.05, 1]);
  const b = frameOn([hand[0], hand[1] + 0.7, hand[2]], 3.1, 0.5, 0.5, [0.25, 0.05, 1]);
  const hud = hudAt(b, 0.5, 0.27, 1.4, 0.6);
  const w = beat("balloonStringSlips");
  const v = boState("rehook", frame, beat);
  return (
    <>
      <TownSet frame={frame} target={hand} />
      <Mitten position={hand} rotation={[0, 0.2, 0.15]} scale={0.75} color="#F2C8A0" sleeve={G.bo} open={slip * 0.6} />
      <Stick a={knot} b={[hand[0], hand[1] + 0.3, hand[2]]} r={0.012} color="#F4F4F4" />
      <Balloon anchor={[hand[0], hand[1] + 0.3, hand[2]]} top={top} r={0.55} frame={frame} seed={2} />
      <Motes frame={frame} center={[hand[0], hand[1] + 1, hand[2] - 1]} size={[6, 4, 4]} count={60} drift={[-0.03, 0.004, 0]} color="#FFFFFF" dot={0.04} opacity={0.55} seed={13} />
      {v ? <Board label="BO" value={v} color={boColor(v)} {...hud} pop={ramp(frame, w - 2, w + 8)} /> : null}
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

