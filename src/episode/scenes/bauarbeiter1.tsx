/**
 * „Something Under the Site Knocked Back“ – Szenen 1–8 (hook … note).
 * Shot-Liste: episodes/bauarbeiter.json (scenes[].shots) + docs/paket-bauarbeiter.md; Schnitte: bauarbeiterCuts.ts.
 */
import React, { useMemo } from "react";
import { BufferAttribute, BufferGeometry, AdditiveBlending } from "three";
import { Shot, V3 } from "../kit/camera";
import { eyePopAt } from "../kit/motion";
import { useScene } from "../types";
import { bauCuts } from "./bauarbeiterCuts";
import {
  Atmos,
  B,
  cut,
  fly,
  frameOn,
  Halo,
  knockAt,
  Milo,
  Paper,
  Pebbles,
  Rain,
  ramp,
  SiteSet,
  Tablet,
  TapeBand,
  TapeCase,
  Walkie,
  win,
  Wrench,
  Motes,
} from "./bauarbeiterSets";
import { softDot } from "./zeitweltSets";

/* ------------------------------------------------------------------ */
/* Gemeinsames                                                          */
/* ------------------------------------------------------------------ */

/** Schnitte der Szene (bauarbeiterCuts.ts) → aktive Einstellung, lokaler Frame, Länge. */
export const useShots = (id: string) => {
  const { frame, duration, beat } = useScene();
  const cuts = bauCuts(id, beat, duration);
  const c = cut(frame, cuts);
  const end = c.shot < cuts.length ? cuts[c.shot] : duration;
  return { frame, duration, beat, cuts, ...c, len: end - c.from };
};

/** Nacht-Licht: kalt marineblau (amber = Lampen) oder türkis (die Baustelle unten/oben). */
export const Night: React.FC<{ readonly tint?: "amber" | "teal"; readonly bg?: string; readonly hemi?: number; readonly fog?: readonly [number, number] }> = ({ tint = "amber", bg, hemi, fog }) =>
  tint === "teal" ? (
    <Atmos bg={bg ?? "#03161B"} fog={fog ?? [12, 55]} sky="#2FA8A0" ground="#041012" hemi={hemi ?? 0.55} keyLight={{ pos: [-8, 14, 6], color: "#7FE6DE", intensity: 0.8 }} rim={{ pos: [6, 6, -12], color: "#3FE0D0", intensity: 2 }} />
  ) : (
    <Atmos bg={bg ?? B.navy} fog={fog ?? [14, 60]} sky="#3A4E78" ground="#120E0C" hemi={hemi ?? 0.6} keyLight={{ pos: [-10, 16, 8], color: "#8FA8D8", intensity: 0.85 }} rim={{ pos: [6, 7, -12], color: "#86A8EE", intensity: 1.8 }} />
  );

/** Nieselregen + Staub im Licht um einen Punkt. */
export const Drizzle: React.FC<{ readonly frame: number; readonly at?: V3; readonly size?: V3; readonly color?: string; readonly rain?: number }> = ({ frame, at = [0, 3, 0], size = [14, 8, 12], color = "#FFD9A0", rain = 1 }) => (
  <>
    {rain > 0 ? <Rain frame={frame} center={at} size={size} count={240} opacity={0.3 * rain} /> : null}
    <Motes frame={frame} center={at} size={size} count={80} drift={[0.003, -0.002, 0]} color={color} dot={0.06} opacity={0.4} seed={6} />
  </>
);

/** Staubwolke beim Klopfen (Punkte fliegen aus `at` nach außen, `age` = Bilder seit dem Schlag). */
export const Puff: React.FC<{ readonly at: V3; readonly age: number; readonly color?: string; readonly size?: number }> = ({ at, age, color = "#D8C8B0", size = 0.5 }) => {
  const dirs = useMemo(() => Array.from({ length: 14 }, (_, i) => [Math.cos(i * 2.4), 0.4 + ((i * 37) % 10) / 14, Math.sin(i * 2.4)]), []);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(14 * 3), 3));
    return g;
  }, []);
  if (age < 0 || age > 24) return null;
  const arr = (geo.getAttribute("position") as BufferAttribute).array as Float32Array;
  const r = (1 - Math.exp(-age / 6)) * size;
  dirs.forEach((d, i) => arr.set([at[0] + d[0] * r, at[1] + d[1] * r * 0.6, at[2] + d[2] * r], i * 3));
  (geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color={color} size={0.09} sizeAttenuation transparent opacity={0.85 * (1 - age / 24)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
};

/* ------------------------------------------------------------------ */
/* 1 hook – „The ground under Lot Nine just knocked back. | In Milo's secret rhythm.“ */
/* ------------------------------------------------------------------ */
export const BauHook: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("hook");
  // Klopfer im Ton: 750 ms nach „knocked“, Abstände 120 / 1750 ms (soundBed.knocks)
  const k = knockAt(frame, beat("pipeMacroPebblesJump") + 22.5, [120, 1750]);
  if (shot === 0) {
    // ECU: Rohr im Schlamm, Kiesel springen; Milo kniet dahinter, Stirnlampe wirft den Kegel aufs Rohr (= Cover)
    const a = frameOn([0.1, 1.25, -0.4], 4.0, 0.6, 0.5, [-0.15, 0.12, 1]);
    const b = frameOn([0.1, 1.2, -0.4], 3.5, 0.6, 0.5, [-0.12, 0.12, 1]);
    return (
      <>
        <Night hemi={0.45} />
        <SiteSet frame={frame} pipeGlow={0.15 + 0.5 * k} />
        <Pebbles center={[0, 0, 0]} jump={k} />
        <Pebbles center={[0, 1.0, 0]} ring={0.27} count={4} jump={k} seed={9} />
        <Milo frame={frame} position={[0.2, 0, -1.25]} rotation={[0, -0.15, 0]} kneel={1} lean={0.1} nod={0.18} eyes={k > 0.3 ? "wide" : "dot"} lamp={{ beam: 2.4, light: 3 }} reach={[0.5, 0.5]} blinkSeed={2} />
        <Drizzle frame={frame} at={[0, 2, 0]} size={[5, 4, 5]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" punch={k > 0.9 ? f : undefined} />
      </>
    );
  }
  // Untersicht: Gesicht halb im Schatten, horcht; Baustellenuhr „2:14“ am Zaun dahinter
  const head: V3 = [0.6, 2.45, -2.2];
  const knock3 = beat("pipeMacroPebblesJump") + 22.5 + 1.87 * 30 * 1;
  const pop = eyePopAt(frame, knock3, 1.5, 1.3);
  const a = frameOn(head, 3.4, 0.5, 0.45, [0.3, -0.32, 1]);
  const b = frameOn(head, 2.9, 0.5, 0.45, [0.25, -0.36, 1]);
  return (
    <>
      <Night hemi={0.35} />
      <SiteSet frame={frame} lampsOn={0.55} pipeGlow={0.2} />
      <pointLight position={[2.4, 2.4, -0.8]} color={B.amber} intensity={6} distance={6} decay={2} />
      <Milo frame={frame} position={[0.6, 0, -2.2]} eyes={frame >= knock3 - 2 ? "wide" : "dot"} eyePop={pop} mouth={frame >= knock3 ? "o" : "flat"} look={-0.25 + 0.15 * ramp(f, 0, 20)} tilt={0.12} lamp={{ beam: 3 }} blinkSeed={3} />
      <Drizzle frame={frame} at={[0.6, 3, -2]} size={[6, 5, 4]} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 2 ritual – „Every shift, Milo knocks his hard hat three times. | Two quick, one slow. | For luck.“ */
/* ------------------------------------------------------------------ */
const TRAILER_MILO: V3 = [-3.55, 0, -3.1];
export const BauRitual: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("ritual");
  if (shot === 0) {
    const t0 = beat("miloTapsHardHat");
    const hit = knockAt(frame, t0);
    const raise = ramp(frame, t0 - 12, t0 - 3) * (1 - ramp(frame, t0 + 34, t0 + 44));
    const a = frameOn([TRAILER_MILO[0], 2.0, TRAILER_MILO[2]], 4.6, 0.5, 0.5, [0.15, 0.1, 1]);
    const b = frameOn([TRAILER_MILO[0], 2.1, TRAILER_MILO[2]], 4.0, 0.5, 0.5, [0.1, 0.12, 1]);
    return (
      <>
        <Night hemi={0.55} />
        <SiteSet frame={frame} />
        <Milo frame={frame} position={TRAILER_MILO} rotation={[0, 0.2, 0]} mouth="smile" tap={{ raise, hit }} eyes={hit > 0.5 ? "closed" : "dot"} lamp={{ beam: 2 }} blinkSeed={4} />
        <Puff at={[TRAILER_MILO[0] + 0.3, 3.05, TRAILER_MILO[2] + 0.2]} age={frame - (t0 + 24.6)} />
        <Drizzle frame={frame} at={[-3.5, 3, -3]} size={[7, 6, 5]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
      </>
    );
  }
  // Detail: Knöchel auf dem Helm – zwei schnell, einer langsam; Staub springt von der Krempe (Schlussbild gepflanzt)
  const slow = beat("hardHatThirdTapSlow");
  const t0 = slow - 26;
  const hit = knockAt(frame, t0, [230, 630]);
  const hat: V3 = [TRAILER_MILO[0] + 0.05, 2.95, TRAILER_MILO[2]];
  const a = frameOn([hat[0], hat[1] - 0.35, hat[2]], 2.7, 0.5, 0.5, [0.35, 0.15, 1]);
  const b = frameOn([hat[0], hat[1] - 0.3, hat[2]], 2.35, 0.5, 0.5, [0.3, 0.14, 1]);
  return (
    <>
      <Night hemi={0.5} />
      <SiteSet frame={frame} city={false} />
      <pointLight position={[TRAILER_MILO[0] + 0.6, 3.8, TRAILER_MILO[2] + 1.6]} color={B.amberHot} intensity={4} distance={5} decay={2} />
      <Milo frame={frame} position={TRAILER_MILO} rotation={[0, 0.2, 0]} mouth="smile" tap={{ raise: 1, hit }} eyes={frame > slow + 20 ? "happy" : "dot"} lamp={{ beam: 1.5 }} blinkSeed={5} />
      <Puff at={[hat[0] + 0.35, hat[1] - 0.05, hat[2] + 0.35]} age={frame - slow} size={0.7} />
      <Puff at={[hat[0] + 0.35, hat[1] - 0.05, hat[2] + 0.35]} age={frame - t0} size={0.35} />
      <Drizzle frame={frame} at={hat} size={[3, 3, 3]} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" punch={slow - (frame - f)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 3 stakes – „Tonight he's alone. | At six, trucks pour the foundation. | Then nothing gets out.“ */
/* ------------------------------------------------------------------ */
export const BauStakes: React.FC = () => {
  const { frame, beat, shot, f, len, from } = useShots("stakes");
  if (shot === 0) {
    const a = frameOn([0, 0.5, -2.5], 24, 0.55, 0.5, [0.35, 1.1, 0.9]);
    const b = frameOn([0, 0.5, -2.5], 21, 0.55, 0.5, [0.2, 1.15, 0.85]);
    return (
      <>
        <Night />
        <SiteSet frame={frame} sign />
        <Milo frame={frame} position={[0.9, 0, -0.9]} rotation={[0, -0.6, 0]} lamp={{ beam: 3 }} blinkSeed={6} />
        <Rain frame={frame} center={[0, 6, -2]} size={[30, 12, 26]} count={320} opacity={0.25} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Schild am Zaun im Regen → kurzer Kran-Schwenk hinab auf die leere Grube mit dem Rohr
  const sign: V3 = [2.2, 4.0, -8.24];
  const pit = beat("pitLowAnglePipe") - from;
  const a = frameOn(sign, 2.9, 0.48, 0.5, [0.05, -0.12, 1]);
  const b = frameOn([0, 0.7, 0], 4.2, 0.62, 0.5, [0.05, 0.12, 1]);
  return (
    <>
      <Night />
      <SiteSet frame={frame} sign />
      <Milo frame={frame} position={[2.2, 0, -3.2]} rotation={[0, 0.4, 0]} lamp={{ beam: 3 }} blinkSeed={6} look={-0.5} />
      <Rain frame={frame} center={[1, 4, -4]} size={[10, 9, 12]} count={300} opacity={0.32} />
      <Shot frame={f} duration={len} {...fly(a, b)} span={[Math.max(10, pit - 16), Math.max(24, pit)]} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 4 pipe – „At two fourteen, three knocks. | From an iron pipe not on the plans.“ */
/* ------------------------------------------------------------------ */
export const BauPipe: React.FC = () => {
  const { frame, beat, shot, f, len, from } = useShots("pipe");
  if (shot === 0) {
    const k = knockAt(frame, beat("miloEarToPipe") + 20, [130, 220]);
    const a = frameOn([0.15, 1.3, -0.5], 3.9, 0.55, 0.5, [1, 0.1, 0.75]);
    const b = frameOn([0.15, 1.3, -0.5], 3.4, 0.55, 0.5, [0.95, 0.1, 0.8]);
    return (
      <>
        <Night hemi={0.45} />
        <SiteSet frame={frame} pipeGlow={0.1 + 0.6 * k} />
        <Pebbles jump={k} />
        <Pebbles center={[0, 1.0, 0]} ring={0.27} count={4} jump={k} seed={9} />
        <Milo frame={frame} position={[0.25, 0, -1.05]} rotation={[0, 0.25, 0]} kneel={1} lean={0.3} nod={0.08} tilt={0.35} eyes={k > 0.2 ? "wide" : "closed"} mouth="flat" reach={[0.9, 0.8]} lamp={{ beam: 1.6 }} blinkSeed={7} />
        <Drizzle frame={frame} at={[0, 2, -0.5]} size={[5, 4, 4]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" punch={k > 0.95 ? f : undefined} />
      </>
    );
  }
  // Über die Schulter: Bauplan, leeres Raster, roter Kreis blinkt auf „plans“
  const on = beat("tabletPlanEmpty") - from;
  const ring = f >= on - 4 ? (Math.floor((f - on) / 7) % 2 === 0 ? 1 : 0.25) : 0;
  const tab: V3 = [0, 1.6, 0];
  const a = frameOn(tab, 2.3, 0.5, 0.5, [0.12, 0.3, 1]);
  const b = frameOn(tab, 1.9, 0.5, 0.5, [0.08, 0.28, 1]);
  return (
    <>
      <Night hemi={0.4} />
      <SiteSet frame={frame} lampsOn={0.6} city={false} />
      <Tablet position={tab} rotation={[-0.25, 0, 0]} show="plan" ring={ring} />
      <pointLight position={[0, 2.2, 1.2]} color="#9CC4FF" intensity={1.5} distance={3} decay={2} />
      <Milo frame={frame} position={[0.85, -0.85, 1.25]} rotation={[0, Math.PI + 0.25, 0]} lamp={{ beam: 0, on: 0.6 }} blinkSeed={8} />
      <Drizzle frame={frame} at={[0, 2, 0.5]} size={[3, 3, 3]} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 5 answer – „Milo taps his lucky three. | The pipe answers. | Exactly the same.“ */
/* ------------------------------------------------------------------ */
export const BauAnswer: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("answer");
  if (shot === 0) {
    // Detail: roter Schlüssel klopft dreimal auf den Flansch (kurz-kurz-lang)
    const hit = knockAt(frame, beat("wrenchTapsThree"));
    const raise = ramp(frame, beat("wrenchTapsThree") - 14, beat("wrenchTapsThree") - 4);
    const a = frameOn([0.1, 1.1, 0], 1.9, 0.55, 0.5, [0.55, 0.35, 1]);
    const b = frameOn([0.1, 1.1, 0], 1.6, 0.55, 0.5, [0.5, 0.32, 1]);
    const ang = 0.9 - 0.75 * hit - 0.3 * (1 - raise);
    return (
      <>
        <Night hemi={0.45} />
        <SiteSet frame={frame} pipeGlow={0.12} city={false} />
        <Pebbles center={[0, 1.0, 0]} ring={0.27} count={4} seed={9} />
        <group position={[0.62, 1.32, 0.1]} rotation={[0, 0, ang]}>
          <mesh>
            <boxGeometry args={[0.34, 0.32, 0.36]} />
            <meshStandardMaterial color={B.glove} roughness={0.7} />
          </mesh>
          <mesh position={[0.45, 0.05, 0]}>
            <boxGeometry args={[0.7, 0.36, 0.38]} />
            <meshStandardMaterial color={B.sleeve} roughness={0.6} />
          </mesh>
          <Wrench position={[-0.18, -0.02, 0.05]} rotation={[0, 0, Math.PI / 2 + 0.2]} />
        </group>
        <Puff at={[0.28, 1.05, 0.1]} age={frame - beat("wrenchTapsThree") - 24.6} color="#E0A080" size={0.35} />
        <pointLight position={[0.8, 2.2, 1.2]} color={B.amber} intensity={4} distance={4} decay={2} />
        <Drizzle frame={frame} at={[0, 1.6, 0]} size={[3, 2.4, 3]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" punch={hit > 0.95 ? f : undefined} />
      </>
    );
  }
  // Makro: Kiesel springen von selbst, türkiser Puls aus der Öffnung; Milo weicht zurück
  const t0 = beat("pebblesJumpTealPulse");
  const k = knockAt(frame, t0);
  const back = ramp(frame, beat("miloLeansBack") - 10, beat("miloLeansBack") + 4);
  const a = frameOn([0.15, 1.25, -0.4], 3.2, 0.58, 0.5, [-0.3, 0.25, 1]);
  const b = frameOn([0.15, 1.35, -0.5], 3.6, 0.56, 0.5, [-0.28, 0.24, 1]);
  return (
    <>
      <Night hemi={0.4} />
      <SiteSet frame={frame} pipeGlow={0.15 + 0.9 * k} lampsOn={0.8} />
      <Pebbles jump={k} />
      <Pebbles center={[0, 1.0, 0]} ring={0.27} count={4} jump={k} seed={9} />
      <Milo
        frame={frame}
        position={[0.35, 0, -1.3]}
        rotation={[0, -0.25, 0]}
        kneel={0.85}
        lean={0.15 - 0.5 * back}
        nod={0.1 - 0.3 * back}
        eyes={k > 0.1 || back > 0.2 ? "wide" : "dot"}
        eyePop={1 + 0.3 * back}
        mouth={back > 0.4 ? "o" : "flat"}
        reach={[0.6 + 0.6 * back, 0.6 + 0.6 * back]}
        holdR={<Wrench rotation={[1.4, 0, 0]} scale={0.9} />}
        lamp={{ beam: 1.8 }}
        blinkSeed={9}
      />
      <Drizzle frame={frame} at={[0, 1.8, -0.4]} size={[4, 3, 3]} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 6 radio – „He calls base. | "Below Lot Nine is solid rock, Milo."“ */
/* ------------------------------------------------------------------ */
export const BauRadio: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("radio");
  if (shot === 0) {
    // Funkgerät „BASE“, LED blinkt, solange Rosa spricht (ab „Below“)
    const talk0 = beat("radioBaseLed") + 13;
    const led = frame >= talk0 && Math.floor(frame / 5) % 2 === 0 ? 1 : 0;
    const wk: V3 = [0.25, 2.15, 0.55];
    const a = frameOn([0.15, 2.2, 0.3], 2.3, 0.52, 0.5, [0.2, 0.08, 1]);
    const b = frameOn([0.15, 2.2, 0.3], 1.95, 0.52, 0.5, [0.15, 0.06, 1]);
    return (
      <>
        <Night hemi={0.45} />
        <SiteSet frame={frame} lampsOn={0.7} />
        <Milo frame={frame} position={[-0.25, 0, -0.55]} rotation={[0, 0.15, 0]} look={0.25} nod={0.12} mouth="flat" brow={0.6} lamp={{ beam: 2.5, on: 0.9 }} blinkSeed={10} />
        <Walkie position={wk} rotation={[0, -0.25, 0.08]} led={led} />
        <pointLight position={[0.5, 2.6, 1.6]} color={B.amber} intensity={3} distance={4} decay={2} />
        <Drizzle frame={frame} at={[0, 2.4, 0]} size={[3, 3, 3]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Einschub: Bohrprofil auf dem Tablet, Ken-Burns nach unten – nur Fels
  const tab: V3 = [0, 1.6, 0];
  const a = frameOn([0, 2.1, 0.03], 2.05, 0.5, 0.5, [0, 0.05, 1]);
  const b = frameOn([0, 1.4, 0.03], 1.6, 0.5, 0.5, [0, 0.03, 1]);
  return (
    <>
      <Night hemi={0.6} />
      <SiteSet frame={frame} city={false} lampsOn={0.5} />
      <Tablet position={tab} show="bore" />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 7 tape – „He lowers his tape measure. | Forty meters down… | something tugs.“ */
/* ------------------------------------------------------------------ */
export const BauTape: React.FC = () => {
  const { frame, beat, shot, f, len, from } = useShots("tape");
  const caseAt: V3 = [0.42, 1.75, 0.15];
  const mouth: V3 = [0.02, 0.85, 0];
  if (shot === 0) {
    const roll = ramp(frame, beat("tapeIntoPipe") - 20, from + len, (t) => t);
    const a = frameOn([0.2, 1.3, 0], 1.9, 0.5, 0.5, [0.55, 0.4, 1]);
    const b = frameOn([0.2, 1.25, 0], 1.7, 0.52, 0.5, [0.5, 0.42, 1]);
    return (
      <>
        <Night hemi={0.45} />
        <SiteSet frame={frame} pipeGlow={0.1} city={false} />
        <TapeCase position={caseAt} rotation={[0.2, -0.4, 0.3]} />
        <TapeBand from={[caseAt[0] - 0.12, caseAt[1] - 0.1, caseAt[2]]} to={mouth} offset={-roll * 6} />
        <mesh position={[caseAt[0] + 0.12, caseAt[1] + 0.06, caseAt[2] + 0.05]}>
          <boxGeometry args={[0.3, 0.3, 0.32]} />
          <meshStandardMaterial color={B.glove} roughness={0.7} />
        </mesh>
        <pointLight position={[0.6, 2.4, 1.0]} color={B.amber} intensity={4} distance={4} decay={2} />
        <Drizzle frame={frame} at={[0.2, 1.4, 0]} size={[2.5, 2.4, 2.5]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Ruck: Band reißt nach unten, Gehäuse fast aus den Händen (Handkamera)
  const jerk = beat("tapeJerk") - from;
  const j = f >= jerk ? Math.exp(-(f - jerk) / 5) : 0;
  const pull = f >= jerk ? 1 : 0;
  const c2: V3 = [caseAt[0] - 0.05 * pull, caseAt[1] - 0.35 * pull + 0.1 * j, caseAt[2]];
  const a = frameOn([0.2, 1.35, 0], 2.2, 0.5, 0.5, [0.7, 0.3, 1]);
  return (
    <>
      <Night hemi={0.45} />
      <SiteSet frame={frame} pipeGlow={0.25 + 0.4 * j} city={false} />
      <Milo frame={frame} position={[0.85, 0, -0.55]} rotation={[0, -0.9, 0]} kneel={0.8} lean={0.15 + 0.15 * pull} nod={0.15} eyes={pull ? "wide" : "dot"} mouth={pull ? "o" : "flat"} reach={[1.2, 1.3]} lamp={{ beam: 1.6 }} blinkSeed={11} />
      <TapeCase position={c2} rotation={[0.2 + 0.6 * j, -0.4, 0.3 - 0.5 * j]} />
      <TapeBand from={[c2[0] - 0.12, c2[1] - 0.1, c2[2]]} to={mouth} offset={-f * 0.2} />
      <Drizzle frame={frame} at={[0.2, 1.6, 0]} size={[3, 3, 3]} />
      <Shot frame={f} duration={len} {...fly(a)} shake={0.03 + 0.12 * j} punch={jerk} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 8 note – „It comes back with a note. | "Stop knocking." | In Milo's own handwriting.“ */
/* ------------------------------------------------------------------ */
export const BauNote: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("note");
  if (shot === 0) {
    const unfold = 0.45 + 0.55 * win(frame, 0, beat("noteTextStopKnocking") - 6);
    const paper: V3 = [0, 1.55, 0.5];
    const a = frameOn([0, 1.75, 0.5], 2.7, 0.5, 0.5, [0.1, 0.2, 1]);
    const b = frameOn(paper, 2.0, 0.5, 0.5, [0.06, 0.18, 1]);
    return (
      <>
        <Night hemi={0.5} />
        <SiteSet frame={frame} lampsOn={0.6} city={false} />
        <Paper position={paper} rotation={[-0.15, 0, 0.03]} w={1.2} h={0.8} lines={["STOP", "KNOCKING."]} unfold={unfold} />
        {/* nasses Bandende mit Draht */}
        <TapeBand from={[0.05, 1.98, 0.5]} to={[0.12, 3.4, 0.6]} />
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.68, 1.35, 0.55]}>
            <boxGeometry args={[0.3, 0.32, 0.32]} />
            <meshStandardMaterial color={B.glove} roughness={0.7} />
          </mesh>
        ))}
        <pointLight position={[0.2, 2.4, 1.7]} color={B.amber} intensity={4} distance={4} decay={2} />
        <Drizzle frame={frame} at={paper} size={[2.4, 2, 2]} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Senkrechter Split: oben der Zettel, unten Milos Logbuch – dieselbe Schrift
  const mid: V3 = [0, 1.65, 0.3];
  const a = frameOn(mid, 3.9, 0.45, 0.5, [0, 0.05, 1]);
  const b = frameOn(mid, 3.6, 0.45, 0.5, [0, 0.05, 1]);
  return (
    <>
      <Night hemi={0.7} />
      <SiteSet frame={frame} lampsOn={0.5} city={false} />
      <Paper position={[0, 2.25, 0.3]} w={1.5} h={0.72} lines={["STOP", "KNOCKING."]} />
      <Paper position={[0, 1.25, 0.3]} w={1.6} h={0.72} lines={["2:00 ALL QUIET", "– M."]} ruled />
      <mesh position={[0, 1.75, 0.29]}>
        <planeGeometry args={[1.8, 0.04]} />
        <meshBasicMaterial color={B.amber} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.8, 2]} color="#FFE2B8" intensity={3} distance={4} decay={2} />
      <Halo at={[0.9, 1.75, 0.2]} size={0.6} color={B.amber} opacity={0.6} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};
