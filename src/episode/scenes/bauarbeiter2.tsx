/**
 * „Something Under the Site Knocked Back“ – Szenen 9–17 (look … answer2).
 * Welt-Logik: gestapelte Baustellen. Das Rohr in Milos Boden hängt unten aus der DECKE der Baustelle darunter;
 * Milos „Himmel“ ist die Beton-Unterseite der Baustelle darüber, jeder „Stern“ eine Stirnlampe an einem Rohr.
 */
import React from "react";
import { Shot, V3 } from "../kit/camera";
import { useScene } from "../types";
import { Drizzle, Night, Puff, useShots } from "./bauarbeiter1";
import {
  B,
  Clouds,
  ConcreteFlow,
  ConcreteSky,
  fly,
  frameOn,
  Halo,
  knockAt,
  LightShaft,
  Milo,
  Mixer,
  Pipe,
  Rain,
  ramp,
  SiteSet,
  StarField,
  win,
  Wrench,
} from "./bauarbeiterSets";

/** Baustelle UNTEN (türkis) mit Decke auf y 10 und dem hängenden Rohr (Mündung y 3,6). */
const LowerSite: React.FC<{ readonly frame: number; readonly y?: number; readonly glow?: number }> = ({ frame, y = 0, glow = 0.6 }) => (
  <group position={[0, y, 0]}>
    <SiteSet frame={frame} tint="teal" pipe={false} city={false} clock="2:14" />
    <ConcreteSky y={10} show={1} center={[0, 0, -4]} />
    <group position={[0, 10, 0]} rotation={[Math.PI, 0, 0]}>
      <Pipe top={6.4} down={1} glow={glow} />
    </group>
  </group>
);

/* ------------------------------------------------------------------ */
/* 9 look – „He shines his headlamp down. | Far below… | another headlamp looks up.“ */
/* ------------------------------------------------------------------ */
export const BauLook: React.FC = () => {
  const { frame, beat, shot, f, len, from } = useShots("look");
  if (shot === 0) {
    // POV hinab ins Rohr: amber Kegel gleitet die Rostwand hinab, tief unten ein winziger türkiser Punkt
    const far = beat("povPipeDown") + 30 - from;
    const dot = ramp(f, far, far + 20);
    const a = { pos: [0.02, 2.2, 0.25] as V3, look: [0, -6, 0] as V3, fov: 46 };
    const b = { pos: [0.02, 1.7, 0.18] as V3, look: [0, -6, 0] as V3, fov: 40 };
    const beamEnd = -1 - 9 * ramp(f, 0, far + 10);
    return (
      <>
        <Night hemi={0.25} fog={[2, 26]} bg="#05070C" />
        <SiteSet frame={frame} lampsOn={0.4} city={false} />
        <Pipe top={1} down={16} inside />
        <LightShaft from={[0, 1.9, 0.1]} to={[0, beamEnd, 0]} radius={0.28} top={0.12} color={B.amber} opacity={0.35} />
        <pointLight position={[0, 0.2, 0]} color={B.amber} intensity={3} distance={5} decay={2} />
        <pointLight position={[0, beamEnd + 1, 0]} color={B.amber} intensity={2} distance={4} decay={2} />
        {dot > 0 ? <Halo at={[0, -14, 0]} size={0.9 + 0.5 * dot} color={B.teal} opacity={dot} /> : null}
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" shake={0.006} />
      </>
    );
  }
  // Gegenschuss aus dem Rohr: türkiser Schein, oben Milos Gesicht im Rohrkreis
  const a = { pos: [0, -2.4, 0.12] as V3, look: [0, 2.2, -0.25] as V3, fov: 34 };
  const b = { pos: [0, -1.5, 0.1] as V3, look: [0, 2.2, -0.25] as V3, fov: 34 };
  return (
    <>
      <Night hemi={0.35} />
      <SiteSet frame={frame} pipe={false} city={false} />
      <Pipe top={1} down={8} inside />
      <pointLight position={[0, -2.6, 0]} color={B.teal} intensity={4} distance={5} decay={2} />
      <Milo frame={frame} position={[0, 0, -1.0]} lean={0.35} nod={0.55} eyes="wide" mouth="o" lamp={{ beam: 3, light: 3 }} blinkSeed={12} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" shake={0.008} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 10 mirror – „It's Milo. | Same hat. | Same mustache. | He knocks three times. | For luck.“ */
/* ------------------------------------------------------------------ */
export const BauMirror: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("mirror");
  const pos: V3 = [0, 0, -0.9];
  const head: V3 = [0, 2.45, -0.9];
  // der untere Milo schaut nach oben zum hängenden Rohr
  const base = (
    <>
      <Night tint="teal" />
      <LowerSite frame={frame} />
      <Drizzle frame={frame} at={[0, 3, -1]} size={[6, 5, 5]} color="#9FF5EE" rain={0.6} />
    </>
  );
  if (shot <= 2) {
    // A: Stirnlampe ganz nah · B: Helm im Türkis · C: dasselbe Gesicht, schaut hoch (Match zu Milos Gesicht im Rohr)
    const views = [
      { p: [0, 2.98, -0.43] as V3, H: 1.1, dir: [0.05, 0.25, 1] as V3 },
      { p: [0, 2.8, -0.9] as V3, H: 1.6, dir: [0.7, 0.3, 1] as V3 },
      { p: head, H: 1.9, dir: [0.05, 0.45, 1] as V3 },
    ];
    const v = views[shot];
    const a = frameOn(v.p, v.H, 0.5, 0.5, v.dir);
    const b = frameOn(v.p, v.H * 0.88, 0.5, 0.5, v.dir);
    return (
      <>
        {base}
        <Milo frame={frame} position={pos} nod={shot === 2 ? -0.45 : -0.25} eyes={shot === 2 ? "wide" : "dot"} mouth="flat" lamp={{ color: B.teal, beam: 2.4, light: 4 }} blinkSeed={13} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" punch={shot === 0 ? beat("miloBelowFace") - (frame - f) : undefined} />
      </>
    );
  }
  // D: Halbnah, türkis – er klopft dreimal auf den Helm (kurz-kurz-lang) und lächelt (Wiederholung des Schlussbilds)
  const t0 = beat("lowerMiloTapsHat");
  const hit = knockAt(frame, t0);
  const raise = ramp(frame, t0 - 10, t0 - 2) * (1 - ramp(frame, t0 + 32, t0 + 42));
  const a = frameOn([0, 2.0, -0.9], 4.4, 0.5, 0.5, [-0.2, 0.15, 1]);
  const b = frameOn([0, 2.1, -0.9], 3.9, 0.5, 0.5, [-0.15, 0.15, 1]);
  return (
    <>
      {base}
      <Milo frame={frame} position={pos} nod={-0.2} tap={{ raise, hit }} eyes={frame >= beat("lowerMiloSmiles") ? "happy" : hit > 0.5 ? "closed" : "dot"} mouth="smile" lamp={{ color: B.teal, beam: 2.4, light: 4 }} blinkSeed={13} />
      <Puff at={[0.3, 3.05, -0.7]} age={frame - (t0 + 24.6)} color="#A0FFF4" />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 11 below – „Down there is another Lot Nine. | Another Milo hears knocks from above.“ */
/* ------------------------------------------------------------------ */
export const BauBelow: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("below");
  if (shot === 0) {
    // Vertigo-Sturz durchs Rohr: aus Milos Rohr (oben) hinab, unten aus der Decke heraus auf die zweite, türkise LOT 9
    const LOW = -16;
    // Sturz in ≤ 1,3 s, ab ≈ 53,5 s ist die zweite Baustelle zu sehen (P1-2)
    const a = { pos: [0.02, 2.0, 0.08] as V3, look: [0, -10, 0] as V3, fov: 34 };
    const b = { pos: [0.6, LOW + 9.0, 2.6] as V3, look: [0, LOW + 1.0, -1.2] as V3, fov: 62 };
    return (
      <>
        <Night tint="teal" hemi={0.45} />
        <Pipe top={1} down={5.2} inside />
        <pointLight position={[0, -0.6, 0]} color={B.amber} intensity={5} distance={4} decay={2} />
        <pointLight position={[0, -2.5, 0]} color={B.teal} intensity={22} distance={8} decay={2} />
        <pointLight position={[0, -7, 0]} color={B.teal} intensity={26} distance={9} decay={2} />
        <LightShaft from={[0, -12, 0]} to={[0, 1.5, 0]} radius={0.12} top={0.26} color={B.teal} opacity={0.35} />
        <LowerSite frame={frame} y={LOW} glow={1} />
        <Milo frame={frame} position={[-0.85, LOW, -0.25]} nod={-0.55} reach={[0.2, 2.6]} holdR={<Wrench rotation={[-0.3, 0, 0]} />} lamp={{ color: B.teal, beam: 3, light: 4 }} blinkSeed={14} />
        <pointLight position={[0, LOW + 6, 0]} color={B.teal} intensity={6} distance={14} decay={2} />
        <pointLight position={[0, LOW + 7, 2]} color="#BFFFF8" intensity={30} distance={22} decay={2} />
        <Shot frame={f} duration={len} {...fly(a, b)} span={[0, 26]} ease="inOut" shake={0.01} />
      </>
    );
  }
  // Halbnah: der untere Milo klopft mit dem Schlüssel NACH OBEN gegen das hängende Rohr
  const t0 = beat("lowerMiloTapsUp");
  const hit = knockAt(frame, t0);
  const a = frameOn([-0.3, 2.6, -0.3], 4.6, 0.5, 0.5, [0.45, -0.15, 1]);
  const b = frameOn([-0.3, 2.7, -0.3], 4.1, 0.5, 0.5, [0.4, -0.18, 1]);
  return (
    <>
      <Night tint="teal" />
      <LowerSite frame={frame} glow={0.5 + 0.5 * hit} />
      <Milo frame={frame} position={[-0.85, 0, -0.25]} nod={-0.55} reach={[0.25, 2.75 + 0.18 * hit]} holdR={<Wrench rotation={[-0.3, 0, 0]} />} eyes="dot" mouth="flat" lamp={{ color: B.teal, beam: 2.6, light: 4 }} blinkSeed={14} />
      <Puff at={[0, 3.55, 0]} age={frame - t0} color="#E0A080" size={0.35} />
      <Drizzle frame={frame} at={[0, 3, -0.5]} size={[6, 5, 5]} color="#9FF5EE" rain={0.5} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 12 fear – „Then Milo looks up. | If he's above someone… is someone above him?“ */
/* ------------------------------------------------------------------ */
const SKY = 26;
export const BauFear: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("fear");
  if (shot === 0) {
    const up = ramp(frame, beat("miloLooksUp") - 18, beat("miloLooksUp") + 6);
    const head: V3 = [0, 2.45, 0];
    const a = frameOn(head, 2.9, 0.5, 0.5, [0.2, -0.42, 1]);
    const b = frameOn(head, 2.5, 0.5, 0.5, [0.18, -0.45, 1]);
    return (
      <>
        <Night hemi={0.4} />
        <group position={[0, 0, 2]}>
          <SiteSet frame={frame} lampsOn={0.6} />
        </group>
        <Clouds y={SKY} frame={frame} />
        <Milo frame={frame} position={[0, 0, 0]} nod={0.25 - 0.85 * up} eyes={up > 0.6 ? "wide" : "dot"} mouth="flat" brow={0.7 * up} lamp={{ beam: 3 }} blinkSeed={15} />
        <Rain frame={frame} center={[0, 3, 0.5]} size={[5, 5, 4]} count={240} opacity={0.38} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Schwenk vom Helm hinauf in den dunklen, bewölkten Himmel
  // Helm-Silhouette bleibt unten im Bild (Fixpunkt), heller Kegel in die Wolken (P1-3/D2)
  const a = { pos: [0.3, 1.2, 2.2] as V3, look: [0, 3.0, 0] as V3, fov: 44 };
  const b = { pos: [0.3, 1.2, 2.2] as V3, look: [0, 14, -6] as V3, fov: 46 };
  return (
    <>
      <Night hemi={0.85} bg="#14224A" />
      <SiteSet frame={frame} lampsOn={0.6} />
      <Halo at={[-6, SKY + 2, -24]} size={32} color="#9FB4E8" opacity={0.8} />
      <Clouds y={SKY} frame={frame} />
      <StarField y={SKY + 6} frame={frame} opacity={0.2} />
      <Milo frame={frame} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} nod={-0.7} lamp={{ beam: 4, light: 4 }} blinkSeed={15} />
      <LightShaft from={[0, 3.2, -0.45]} to={[0, 18, -10]} radius={3.2} top={0.15} color={B.amber} opacity={0.3} />
      <pointLight position={[0, 4.5, 1.6]} color="#9FB4E8" intensity={12} distance={7} decay={2} />
      <Rain frame={frame} center={[0, 5, 1]} size={[8, 8, 6]} count={260} opacity={0.3} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 13 hope – „He sees stars. | Open sky. | He breathes. | He's on top.“ */
/* ------------------------------------------------------------------ */
export const BauHope: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("hope");
  if (shot === 0) {
    const open = ramp(frame, beat("cloudsPartStars") - 10, beat("cloudsPartStars") + 40);
    const a = { pos: [0.5, 0.4, 8.0] as V3, look: [0.2, 12, -18] as V3, fov: 50 };
    const b = { pos: [0.45, 0.55, 7.6] as V3, look: [0.2, 12.5, -18] as V3, fov: 48 };
    return (
      <>
        <Night hemi={1.0} bg="#182A5A" />
        <SiteSet frame={frame} lampsOn={0.8} clock="" />
        {/* Rim-Licht hinter Milo: Umriss vor dem Himmel (P2-8/D4) */}
        <pointLight position={[0.4, 4.2, 0.6]} color={B.amberHot} intensity={14} distance={6} decay={2} />
        <pointLight position={[1.6, 2.6, 5.0]} color="#9FB4E8" intensity={4} distance={5} decay={2} />
        <StarField y={SKY + 6} frame={frame} opacity={0.35 + 0.65 * open} dot={0.9} />
        <Clouds y={SKY} frame={frame} open={open} />
        <Milo frame={frame} position={[0, 0, 2.5]} rotation={[0, Math.PI * 0.78, 0]} nod={-0.5} lamp={{ beam: 3 }} blinkSeed={16} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Nah: Milo atmet aus, Schultern sinken, kleines erleichtertes Lächeln
  const ex = ramp(frame, beat("miloExhales") - 2, beat("miloExhales") + 26);
  const smile = frame >= beat("miloSmileRelief") - 6;
  const head: V3 = [0, 2.35, 0];
  const a = frameOn(head, 3.2, 0.5, 0.5, [0.25, 0.05, 1]);
  const b = frameOn(head, 2.8, 0.5, 0.5, [0.22, 0.05, 1]);
  return (
    <>
      <Night hemi={0.65} bg="#0B1634" />
      <SiteSet frame={frame} lampsOn={0.9} />
      <StarField y={SKY + 6} frame={frame} />
      <pointLight position={[1.5, 3.2, 2.2]} color={B.amberHot} intensity={5} distance={6} decay={2} />
      <Milo frame={frame} position={[0, -0.12 * ex, 0]} nod={-0.25 + 0.2 * ex} eyes={ex > 0.1 && !smile ? "closed" : smile ? "happy" : "dot"} mouth={smile ? "smile" : ex > 0.1 ? "o" : "flat"} breath={1 - ex} spread={[0.2 - 0.1 * ex, 0.2 - 0.1 * ex]} lamp={{ beam: 2.5 }} blinkSeed={17} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 14 turn – HALT (einzige Einstellung > 4 s): „Then one star flickers. | Like a headlamp. | Then all of them do.“ */
/* ------------------------------------------------------------------ */
export const BauTurn: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const lamp = beat("starIsHeadlamp"); // ≈ 69,5 s: Enthüllung „Gesicht im Rohr“
  const all = beat("allStarsHeadlamps");
  // erster Stern flackert türkis ab ≈ 67,2 s (Bild 6), groß und hell (P1-1)
  const lit = frame >= 6;
  const flick = lit ? (Math.floor((frame - 6) / 3) % 3 === 0 ? 0.45 : 1) : 0;
  // weitere Sterne während des Halts, auf „all“ alle
  const teal = frame < 24 ? 0 : frame < all ? 0.02 + 0.2 * win(frame, 24, lamp) : 0.22 + 0.78 * win(frame, all, all + 10);
  const conc = 0.35 + 0.65 * win(frame, all - 4, all + 14);
  const H = SKY + 6; // Decke
  const S: V3 = [0, H - 1.4, -14]; // EIN „Stern“ = Rohrmündung mit Milo oben
  const dir: V3 = [0, 29.2, -20];
  const L = Math.hypot(dir[0], dir[1], dir[2]);
  const at = (d: number): V3 => [S[0] - (dir[0] / L) * d, S[1] - (dir[1] / L) * d, S[2] - (dir[2] / L) * d];
  // Fahrt: 17 → 3,6 Einheiten bis zur Enthüllung, kurzer Halt, ab „all“ leicht zurück (viele Lampen ringsum)
  const d =
    frame < lamp
      ? 17 - 13.4 * ramp(frame, 0, lamp)
      : frame < all
        ? 3.6 - 0.3 * win(frame, lamp, all)
        : 3.3 + 4.2 * ramp(frame, all, duration);
  const pos = at(d);
  const near = 1 - Math.min(1, (d - 3.3) / 14);
  return (
    <>
      <Night hemi={0.55 + 0.2 * conc} bg="#13224A" fog={[30, 120]} />
      <StarField y={H - 0.2} frame={frame} teal={teal} center={[0, 0, -14]} size={80} dot={0.8} />
      {/* dichter Kranz weiterer Stirnlampen um den einen Stern (sichtbar beim Zurückfahren) */}
      <StarField y={H - 0.2} frame={frame + 7} teal={frame >= all ? 1 : teal} center={S} size={16} count={140} dot={0.35} opacity={0.9} />
      <ConcreteSky y={H} show={conc} center={[0, 0, -14]} />
      {/* der eine Stern: Rohrmündung aus der Decke + Milo kopfüber mit türkiser Stirnlampe */}
      <group position={[S[0], H, S[2]]} rotation={[Math.PI, 0, 0]}>
        <Pipe top={1.4} down={0.4} radius={0.75} glow={0.3 * flick} />
      </group>
      {lit ? (
        <>
          <Milo frame={frame} headOnly position={[S[0], S[1] + 0.25, S[2]]} rotation={[0.8, 0, Math.PI]} scale={1} eyes="dot" mouth="flat" lamp={{ color: B.teal, on: flick * (0.55 + 0.45 * (1 - near)), beam: 0, light: 3.5 }} blinkSeed={19} />
          {/* Glow groß, solange der Stern fern ist (≥ 40 px), nah zurückgenommen (Gesicht brennt nicht aus, D5) */}
          <Halo at={[S[0], S[1] - 0.3, S[2] + 0.3]} size={4.2 * (1 - near) + 0.6} color={B.teal} opacity={(0.95 - 0.6 * near) * flick} />
          <pointLight position={[S[0], S[1] - 1.2, S[2] + 1.0]} color="#CFE8FF" intensity={2.5 * near} distance={4} decay={2} />
        </>
      ) : (
        <Halo at={[S[0], S[1], S[2]]} size={1.6} color="#F2F4FF" opacity={0.9} />
      )}
      <Shot frame={frame} duration={duration} from={pos} look={S} fov={40} shake={0.004} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 15 pour – „At six, the trucks pour. | Concrete seals the pipe.“ */
/* ------------------------------------------------------------------ */
export const BauPour: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("pour");
  const dawn = "#22385C";
  if (shot === 0) {
    const flow = ramp(frame, beat("concretePourTrucks") - 20, beat("concretePourTrucks") + 40);
    const a = frameOn([0, 2, -4], 15, 0.55, 0.5, [0.3, 0.45, 1]);
    const b = frameOn([0, 2, -4], 13.5, 0.55, 0.5, [0.25, 0.42, 1]);
    return (
      <>
        <Night bg={dawn} hemi={0.85} />
        <SiteSet frame={frame} lampsOn={0.5} pipeGlow={0.6} clock="6:00" />
        <Mixer position={[-3.5, 3, -10]} rotation={[0, 0.2, 0]} frame={frame} />
        <Mixer position={[4.2, 3, -10.4]} rotation={[0, -0.25 + Math.PI, 0]} frame={frame} />
        <ConcreteFlow from={[-3.2, 0.1, -7.6]} to={[-0.4, 0.1, -0.6]} t={flow} frame={frame} />
        <ConcreteFlow from={[3.6, 0.1, -7.8]} to={[0.6, 0.1, -0.8]} t={flow} frame={frame} />
        <Milo frame={frame} position={[2.6, 0, 1.2]} rotation={[0, -0.6, 0]} lamp={{ beam: 2, on: 0.7 }} blinkSeed={20} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Zeitlupe: grauer Beton steigt über die Rohröffnung, der türkise Schein erlischt
  const seal = ramp(frame, beat("concreteCoversPipe") - 22, beat("concreteCoversPipe") + 8);
  const glow = 1 - seal;
  const a = frameOn([0, 0.95, 0], 2.4, 0.55, 0.5, [0.45, 0.35, 1]);
  const b = frameOn([0, 0.95, 0], 2.15, 0.55, 0.5, [0.42, 0.33, 1]);
  return (
    <>
      <Night bg={dawn} hemi={0.8} />
      <SiteSet frame={frame} lampsOn={0.45} pipeGlow={glow} city={false} />
      <mesh position={[0, -0.6 + 1.75 * seal, 0]}>
        <boxGeometry args={[9, 1.2, 9]} />
        <meshStandardMaterial color="#8E9096" roughness={0.28} />
      </mesh>
      <ConcreteFlow from={[-3, 0.15 + 1.2 * seal, -3]} to={[0, 0.15 + 1.2 * seal, 0]} t={0.6 + 0.4 * seal} frame={frame} width={1.8} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 16 knocks – „Then, on his hard hat… three knocks.“ (Schlussbild, EINE Einstellung, statisch) */
/* ------------------------------------------------------------------ */
export const BauKnocks: React.FC = () => {
  const { frame, beat, f, len } = useShots("knocks");
  const t0 = beat("hardHatTappedFromAbove");
  const hit = knockAt(frame, t0);
  const after = frame >= t0;
  const a = frameOn([0, 1.95, 0], 4.6, 0.5, 0.5, [0.1, 0.1, 1]);
  return (
    <>
      <Night bg="#22385C" hemi={0.85} />
      <SiteSet frame={frame} lampsOn={0.35} pipe={false} clock="6:00" concrete={1} />
      <Milo frame={frame} position={[0, 0, 0]} hatHit={hit} eyes={after ? "wide" : "dot"} eyePop={after ? 1.2 : 1} mouth={after ? "o" : "flat"} reach={[0.05, 0.05]} spread={[0.06, 0.06]} lamp={{ beam: 2, on: 0.8 }} blinkSeed={21} />
      <Puff at={[0, 3.25, 0]} age={frame - t0} />
      <Puff at={[0, 3.25, 0]} age={frame - (t0 + 24.6)} size={0.7} />
      <Shot frame={f} duration={len} {...fly(a)} shake={0.004} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 17 answer2 – „The knocker was always Milo. | Now he's the one below.“ */
/* ------------------------------------------------------------------ */
export const BauAnswer2: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("answer2");
  if (shot === 0) {
    // Nah: Milos amber Stirnlampe flackert türkis
    const t0 = beat("miloFaceLampTeal");
    const teal = frame >= t0 && Math.floor((frame - t0) / 4) % 3 !== 1;
    const head: V3 = [0, 2.6, 0];
    const a = frameOn(head, 3.9, 0.52, 0.5, [-0.15, 0.05, 1]);
    const b = frameOn(head, 3.5, 0.52, 0.5, [-0.12, 0.05, 1]);
    return (
      <>
        <Night bg="#1E3358" hemi={0.7} />
        <SiteSet frame={frame} lampsOn={0.3} pipe={false} clock="" concrete={1} />
        <Milo frame={frame} position={[0, 0, 0]} eyes="wide" mouth="flat" brow={0.8} lamp={{ color: teal ? B.teal : B.amber, beam: 2.5, light: 4 }} blinkSeed={22} />
        <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
      </>
    );
  }
  // Kran-Fahrt hinauf durch ein winziges Rohr im „Himmel“ in eine dritte LOT 9 – dort klopft ein Milo dreimal auf den Helm
  const UP = 14;
  const tapStart = frame - f + 10;
  const hit = knockAt(frame, tapStart);
  const raise = ramp(frame, tapStart - 8, tapStart - 1);
  const rise = ramp(f, 0, Math.min(len, 40), (x) => 1 - Math.pow(1 - x, 2));
  const a = { pos: [0.03, 9.5, 0.12] as V3, look: [0, UP + 6, 0] as V3, fov: 40 };
  // Helm + Lampe unter die obere Platte (R3 P2-2)
  const b = { pos: [2.6, UP + 3.3, 3.8] as V3, look: [0.9, UP + 3.0, -0.6] as V3, fov: 46 };
  return (
    <>
      <Night tint="teal" hemi={0.5} />
      <group position={[0, UP - 0.02, 0]}>
        <SiteSet frame={frame} tint="teal" city={false} pipe={false} clock="" />
      </group>
      <ConcreteSky y={UP - 0.05} show={1} center={[0, 0, -4]} />
      <Pipe position={[0, 8, 0]} top={UP + 1 - 8} down={0.1} inside glow={0.5} />
      {/* Licht im Rohr: der Aufstieg ist nie schwarz (P2-12) */}
      <pointLight position={[0, 10, 0]} color={B.teal} intensity={22} distance={7} decay={2} />
      <pointLight position={[0, 12.5, 0]} color="#BFFFF8" intensity={22} distance={7} decay={2} />
      <LightShaft from={[0, UP + 1, 0]} to={[0, 8.5, 0]} radius={0.12} top={0.26} color={B.teal} opacity={0.4} />
      <Milo frame={frame} position={[0.9, UP, -0.6]} rotation={[0, -0.4, 0]} tap={{ raise, hit }} mouth="smile" eyes={hit > 0.5 ? "closed" : "dot"} lamp={{ color: B.teal, beam: 2.4, light: 4 }} blinkSeed={23} />
      <Shot frame={rise * 100} duration={100} {...fly(a, b)} ease="linear" shake={0.01} />
    </>
  );
};
