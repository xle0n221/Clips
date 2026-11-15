/**
 * „What If the Sun Vanished? The First 8:19“ – Szenen 1–11 (hook … orbit).
 * Shot-Liste: episodes/sonne-verschwindet.json (scenes[].shots) + docs/paket-sonne-verschwindet.md; Schnitte: sonneCuts.ts.
 */
import React from "react";
import { Shot, V3 } from "../kit/camera";
import { useScene } from "../types";
import { sonneCuts } from "./sonneCuts";
import {
  atScreen,
  BalconySet,
  BeachSet,
  clockText,
  cut,
  DeadStar,
  EarthBall,
  EyepieceView,
  faceTo,
  Flash,
  fly,
  frameOn,
  Galaxies,
  Glow,
  Halo,
  HudPanel,
  Juno,
  junoHead,
  lerp,
  lerp3,
  LightShell,
  Motes,
  Ode,
  OrbitDots,
  Phone,
  Plastic,
  ramp,
  Ribbon,
  S,
  SpaceGrid,
  SpaceSet,
  SunDisc,
  TextLabel,
  WatchFace,
} from "./sonneSets";

/* ------------------------------------------------------------------ */
/* Gemeinsames                                                          */
/* ------------------------------------------------------------------ */

/** Schnitte der Szene (sonneCuts.ts) → aktive Einstellung, lokaler Frame, Länge. */
export const useShots = (id: string) => {
  const { frame, duration, beat } = useScene();
  const cuts = sonneCuts(id, beat, duration);
  const c = cut(frame, cuts);
  const end = c.shot < cuts.length ? cuts[c.shot] : duration;
  return { frame, duration, beat, cuts, ...c, len: end - c.from };
};

type Cam = { pos: V3; look: V3; fov: number };

/** Zeitanzeige im Bild an Bildstelle (xf, yf), Breite `frac` der Bildbreite, im Abstand d vor der Kamera. */
export const hudAt = (cam: Cam, xf: number, yf: number, d: number, frac = 0.62) => {
  const position = atScreen(cam, xf, yf, d);
  const H = 2 * d * Math.tan(((cam.fov / 2) * Math.PI) / 180);
  return { position, rotation: faceTo(position, cam.pos), scale: (frac * H * (1080 / 1920)) / 3.1 };
};

/** Juno sitzt am Strand (Hook, five … turn): Fußpunkt, Blick nach +z (Kamera), Meer und Himmel dahinter. */
export const JUNO_SIT: V3 = [0, 0, -1.0];
/** Juno liegt auf dem Handtuch (juno, old, rehook): Kopf nach −z, Gesicht nach oben. */
export const JUNO_LIE: V3 = [0, 0, -0.3];

/** Eröffnungsbild (Hook Shot 1 = Loop-Ziel in answer2): leere schwarze Sonne mit Goldring über Juno im Goldlicht. */
export const HookFrame: React.FC<{ readonly frame: number; readonly f: number; readonly len: number; readonly ring: number; readonly flicker?: number; readonly ease?: "linear" | "out" }> = ({ frame, f, len, ring, flicker = 0, ease = "linear" }) => {
  const head = junoHead(JUNO_SIT, "sit", 1, 0.25);
  const a = frameOn(head, 7.6, 0.64, 0.5, [0, -0.1, 1]);
  const b = frameOn(head, 6.4, 0.64, 0.5, [0, -0.1, 1]);
  const sunP = atScreen(a, 0.5, 0.37, 150);
  return (
    <>
      <BeachSet frame={frame} day={1} umbrella={false} gulls />
      <SunDisc position={sunP} rotation={faceTo(sunP, a.pos)} radius={13} on={flicker} ring={ring} />
      <Juno frame={frame} position={JUNO_SIT} pose="sit" lean={0.25} spread={[0.5, 0.5]} reach={[-0.35, -0.35]} eyes="happy" mouth="smile" glow={1} blinkSeed={2} />
      <pointLight position={[0.8, 2.6, 1.6]} color={S.gold} intensity={5} distance={5} decay={2} />
      <Motes frame={frame} center={[0, 2, -1]} size={[6, 4, 4]} count={60} drift={[0.004, 0.002, 0]} color={S.goldHot} dot={0.07} opacity={0.6} seed={4} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease={ease} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 1 hook – „The Sun just vanished. | And nobody on Earth will notice… | for eight minutes.“ */
/* ------------------------------------------------------------------ */
export const SonHook: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("hook");
  if (shot === 0) {
    // Cover (0–0,5 s): schon die leere Stelle mit Goldring, darunter Juno im Goldlicht = das Paradox ohne Ton.
    // Auf „vanished“ flackert der Ring wie ein Glühfaden, der ausgeht (2 Zucker), dann bleibt er dünn.
    const v = beat("sunBlinksOut");
    const d = frame - v;
    const flick = d >= 0 && d < 14 ? (d % 6 < 2 ? 0.7 : 0) : 0;
    const ring = d < 0 ? 1 : Math.max(0.35, 1 - d / 40);
    return <HookFrame frame={frame} f={f} len={len} ring={ring} flicker={flick} />;
  }
  // Untersicht Uhr 12:00, darüber springt die Zeitanzeige auf „minutes“ an
  const t0 = beat("hudTimerStarts");
  const watch: V3 = [0, 2.2, 0];
  const a = frameOn(watch, 4.2, 0.62, 0.5, [0.1, -0.35, 1]);
  const b = frameOn(watch, 3.7, 0.62, 0.5, [0.05, -0.38, 1]);
  const hud = hudAt(b, 0.5, 0.3, 3.2, 0.66);
  return (
    <>
      <BeachSet frame={frame} day={1} umbrella={false} towel={false} gulls />
      <WatchFace position={watch} rotation={[-0.25, 0, 0]} text="12:00" scale={1} />
      {/* Unterarm + Hand */}
      <group position={[0, 2.2, -0.4]} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, -0.15, -1.2]}>
          <boxGeometry args={[0.85, 0.75, 2.0]} />
          <meshStandardMaterial color={S.skin} roughness={0.6} />
        </mesh>
      </group>
      <pointLight position={[1.2, 3.2, 2.5]} color={S.gold} intensity={6} distance={6} decay={2} />
      <HudPanel value={clockText("hook", frame, beat)} {...hud} pop={ramp(frame, t0 - 4, t0 + 6)} />
      <Shot frame={f} duration={len} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 2 juno – „Meet Juno. | Noon, on a beach. | Sunlight is still warm on her face.“ */
/* ------------------------------------------------------------------ */
export const SonJuno: React.FC = () => {
  const { frame, shot, f, len } = useShots("juno");
  const head = junoHead(JUNO_LIE, "lie");
  if (shot === 0) {
    const a = frameOn([0, 0.6, -0.8], 9.5, 0.5, 0.5, [0.45, 0.5, 1]);
    const b = frameOn([0, 0.6, -0.8], 8.0, 0.5, 0.5, [0.38, 0.52, 1]);
    return (
      <>
        <BeachSet frame={frame} day={1} gulls crowd />
        <Juno frame={frame} position={JUNO_LIE} pose="lie" eyes="closed" mouth="smile" glow={1} spread={[0.4, 0.4]} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Gesicht von oben, Goldlicht auf den Wangen (PFLANZUNG Wärme)
  const face: V3 = [head[0], head[1] + 0.43, head[2]];
  const a = frameOn(face, 2.6, 0.45, 0.5, [0.1, 1, 0.35]);
  const b = frameOn(face, 2.2, 0.45, 0.5, [0.06, 1, 0.3]);
  return (
    <>
      <BeachSet frame={frame} day={1} umbrella={false} />
      <Juno frame={frame} position={JUNO_LIE} pose="lie" eyes="closed" mouth="smile" glow={1} spread={[0.4, 0.4]} />
      <pointLight position={[0.9, 1.6, -1.2]} color={S.gold} intensity={4} distance={3} decay={2} />
      <pointLight position={[-0.9, 1.4, -2.0]} color={S.goldHot} intensity={3} distance={3} decay={2} />
      <Motes frame={frame} center={[0, 1.2, -1.5]} size={[2.2, 1.2, 2]} count={40} drift={[0.003, 0.001, 0]} color={S.goldHot} dot={0.035} opacity={0.7} seed={8} />
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 3 grandpa – „On the phone, her grandpa. | Night on his side of the world. | His telescope is aimed at Saturn.“ */
/* ------------------------------------------------------------------ */
const PHONE_BEACH: V3 = [1.0, 0.62, -0.5];
export const SonGrandpa: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("grandpa");
  if (shot === 0) {
    // Über die Schulter: Telefon steht auf dem Handtuch, Videotelefonat mit Grandpa (Nacht, Vollmond)
    const pop = ramp(frame, beat("videoCallGrandpa") - 6, beat("videoCallGrandpa") + 4);
    const a = frameOn(PHONE_BEACH, 2.6, 0.46, 0.62, [0.3, 0.2, 1]);
    const b = frameOn(PHONE_BEACH, 2.2, 0.46, 0.62, [0.26, 0.2, 1]);
    return (
      <>
        <BeachSet frame={frame} day={1} umbrella />
        <Juno frame={frame} position={JUNO_LIE} pose="lie" eyes="dot" mouth="grin" glow={1} look={0.4} />
        <Phone position={PHONE_BEACH} rotation={[-0.12, 0.28, 0]} scale={0.9 * (0.85 + 0.15 * pop)} mood="wave" />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Balkon bei Nacht: Grandpa winkt, Teleskop, Saturn als blasser Goldpunkt (PFLANZUNG Saturn)
    const head: V3 = [0, 2.72, 0];
    const a = frameOn(head, 7.2, 0.44, 0.42, [0.3, 0.02, 1]);
    const b = frameOn(head, 6.4, 0.44, 0.44, [0.22, 0.03, 1]);
    const moon = atScreen(b, 0.2, 0.3, 70);
    const sat = atScreen(b, 0.78, 0.27, 70);
    return (
      <>
        <BalconySet frame={frame} moonPos={moon} saturnPos={sat} />
        <Ode frame={frame} wave={ramp(f, 0, 10)} mouth="grin" eyes="happy" look={0.15} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Okular-POV: Saturn klein und scharf
  return (
    <>
      <EyepieceView frame={frame} size={0.85 + 0.15 * ramp(f, 0, len)} />
      <Shot frame={f} duration={len} from={[0, 0, 13]} to={[0, 0, 12.4]} look={[0, 0, 0]} fov={40} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 4 old – „But that warmth is old. | It left the Sun eight minutes ago.“ */
/* ------------------------------------------------------------------ */
const EARTH: V3 = [0, 0, 0];
const SPOT_FAR: V3 = [-50, 18, -160];
export const SonOld: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("old");
  if (shot === 0) {
    // Makro: ein einzelner Sonnenstrahl als goldenes Band berührt Junos Wange, Schild „8 MIN OLD“
    const head = junoHead(JUNO_LIE, "lie");
    const cheek: V3 = [head[0] + 0.26, head[1] + 0.44, head[2] + 0.1];
    const a = frameOn(cheek, 2.4, 0.56, 0.42, [0.2, 1, 0.45]);
    const b = frameOn(cheek, 2.0, 0.56, 0.44, [0.18, 1, 0.42]);
    const src: V3 = [cheek[0] + 2.4, cheek[1] + 6, cheek[2] - 2.6];
    const reach = ramp(f, 0, 14);
    const tagIn = ramp(frame, beat("sunbeamTag8Min") - 6, beat("sunbeamTag8Min") + 4);
    const tag = atScreen(b, 0.62, 0.32, 3.6);
    return (
      <>
        <BeachSet frame={frame} day={1} umbrella={false} />
        <Juno frame={frame} position={JUNO_LIE} pose="lie" eyes="closed" mouth="smile" glow={1} />
        <Ribbon from={src} to={cheek} head={reach} width={0.12} frame={frame} />
        <pointLight position={[cheek[0], cheek[1] + 0.3, cheek[2]]} color={S.goldHot} intensity={3 * reach} distance={2} decay={2} />
        {tagIn > 0.01 ? (
          <group position={tag} rotation={faceTo(tag, b.pos)} scale={0.9 + 0.1 * tagIn}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.25, 0.36]} />
              <meshBasicMaterial color={S.hud} transparent opacity={0.92 * tagIn} toneMapped={false} />
            </mesh>
            <TextLabel text="8 MIN OLD" width={1.15} height={0.3} position={[0, 0, 0]} color="#FFD23F" opacity={tagIn} />
          </group>
        ) : null}
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Rückfahrt am Band entlang ins All: die Erde schrumpft hinter uns
  const u = ramp(f, 0, len);
  const dir: V3 = [SPOT_FAR[0] - EARTH[0], SPOT_FAR[1] - EARTH[1], SPOT_FAR[2] - EARTH[2]];
  const L = Math.hypot(...dir);
  const n: V3 = [dir[0] / L, dir[1] / L, dir[2] / L];
  const dist = lerp(4, 46, u * u * (3 - 2 * u));
  const camPos: V3 = [n[0] * dist + 1.2 + dist * 0.22, n[1] * dist + 1.6 + dist * 0.12, n[2] * dist + 0.4];
  return (
    <>
      <SpaceSet frame={frame} sunLight={1} sunAt={SPOT_FAR} />
      <EarthBall position={EARTH} radius={1.4} spin={frame * 0.004} moon moonAngle={2.2} />
      <Ribbon from={SPOT_FAR} to={[EARTH[0] + n[0] * 1.4, EARTH[1] + n[1] * 1.4, EARTH[2] + n[2] * 1.4]} width={0.5} frame={frame} />
      <Motes frame={frame} center={camPos} size={[14, 14, 14]} count={60} drift={[0.05, 0, -0.12]} color={S.goldHot} dot={0.08} opacity={0.6} seed={5} />
      <Shot frame={f} duration={len} from={camPos} look={[EARTH[0], EARTH[1] - 0.2, EARTH[2]]} fov={42} shake={0.01} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 5 zero – „So right now, the Sun is already gone. | Its last light is still on its way.“ */
/* ------------------------------------------------------------------ */
const SPOT: V3 = [0, 0, 0];
export const SonZero: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("zero");
  const g = beat("emptySpotLightShell");
  const shellR = 2 + Math.max(0, frame) * 0.22;
  if (shot === 0) {
    // Totale: wo die Sonne war, nur Schwarz; eine dünne goldene Lichtschale dehnt sich aus wie ein Ring auf Wasser
    const a = frameOn(SPOT, 46, 0.48, 0.5, [0.2, 0.35, 1]);
    const b = frameOn(SPOT, 40, 0.48, 0.5, [0.16, 0.32, 1]);
    return (
      <>
        <SpaceSet frame={frame} />
        <SunDisc position={SPOT} rotation={faceTo(SPOT, a.pos)} radius={2} on={0} ring={0.35} ghost={ramp(frame, g - 4, g + 10)} />
        <LightShell center={SPOT} r={shellR} on={1} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Mitfahrt auf der Vorderkante der Lichtschale; weit vorn die winzige blaue Erde
    const r = shellR;
    const camP: V3 = [0.42 * r, 0.1 * r, r - 14];
    const lookP: V3 = [0, 0, r + 30];
    const earthP: V3 = [camP[0] + (lookP[0] - camP[0]) * 3.2, camP[1] + (lookP[1] - camP[1]) * 3.2 - 6, camP[2] + (lookP[2] - camP[2]) * 3.2];
    return (
      <>
        <SpaceSet frame={frame} />
        <LightShell center={SPOT} r={r} on={1} />
        <EarthBall position={earthP} radius={2} glow={1} />
        <Glow at={earthP} size={14} color="#7FB8FF" opacity={0.7} />
        <Motes frame={frame} center={[0, 0, r]} size={[16, 20, 4]} count={90} drift={[0, 0, 0.2]} color={S.goldHot} dot={0.07} opacity={0.75} seed={11} />
        <Shot frame={f} duration={len} from={camP} to={[0.42 * r, 0.1 * r, r - 10]} look={lookP} fov={50} ease="linear" />
      </>
    );
  }
  // Einschub: Zeitanzeige 0:10 über der leeren schwarzen Stelle
  const cam = frameOn(SPOT, 14, 0.56, 0.5, [0, 0.12, 1]);
  const hud = hudAt(cam, 0.5, 0.36, 9, 0.66);
  return (
    <>
      <SpaceSet frame={frame} />
      <SunDisc position={SPOT} rotation={faceTo(SPOT, cam.pos)} radius={2.6} on={0} ring={0.3} ghost={1} />
      <HudPanel value={clockText("zero", frame, beat)} {...hud} />
      <Shot frame={f} duration={len} {...fly(cam, frameOn(SPOT, 12.5, 0.56, 0.5, [0, 0.12, 1]))} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 6 distance – „A hundred fifty million kilometers of light. | With nothing behind it.“ */
/* ------------------------------------------------------------------ */
const D_SPOT: V3 = [-6, 50, 0];
const D_EARTH: V3 = [5, -26, 0];
export const SonDistance: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("distance");
  if (shot === 0) {
    // Ultra-Totale: langes Lichtband von der leeren Stelle (oben) zur winzigen Erde (unten), Maßlinie daneben
    const ruler = ramp(frame, beat("ribbon150Mkm") - 10, beat("ribbon150Mkm") + 10);
    const a = { pos: [0, 10, 236] as V3, look: [0, 10, 0] as V3, fov: 40 };
    const b = { pos: [0, 10, 222] as V3, look: [0, 10, 0] as V3, fov: 40 };
    const ticks = 9;
    return (
      <>
        <SpaceSet frame={frame} sunLight={1} sunAt={D_SPOT} />
        <SunDisc position={D_SPOT} radius={3.4} on={0} ring={0.25} ghost={0.8} />
        <Ribbon from={D_SPOT} to={D_EARTH} width={2.4} frame={frame} />
        <EarthBall position={D_EARTH} radius={2.6} glow={1} spin={frame * 0.004} />
        <Glow at={D_EARTH} size={22} color="#7FB8FF" opacity={0.6} />
        {/* Maßlinie (weiß, mit Strichen) */}
        {ruler > 0.01 ? (
          <group>
            {Array.from({ length: ticks + 1 }, (_, i) => {
              const t = i / ticks;
              if (t > ruler) return null;
              const p = lerp3([D_SPOT[0] + 14, D_SPOT[1], 0], [D_EARTH[0] + 14, D_EARTH[1], 0], t);
              return (
                <mesh key={i} position={p}>
                  <planeGeometry args={[i % 3 === 0 ? 4 : 2.4, 0.5]} />
                  <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
                </mesh>
              );
            })}
            <mesh position={lerp3([D_SPOT[0] + 14, D_SPOT[1], 0], [D_EARTH[0] + 14, D_EARTH[1], 0], ruler / 2)} rotation={[0, 0, Math.atan2(D_EARTH[0] - D_SPOT[0], D_SPOT[1] - D_EARTH[1])]}>
              <planeGeometry args={[0.45, Math.hypot(D_EARTH[0] - D_SPOT[0], D_EARTH[1] - D_SPOT[1]) * ruler]} />
              <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
            </mesh>
          </group>
        ) : null}
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Detail: das Ende des Bandes – dahinter nur Schwarz, das Band gleitet weiter, nichts folgt
  const u = ramp(f, 0, len, (x) => x);
  const from: V3 = [0, 0, -40];
  const to: V3 = [0, 0, 60];
  const tail = 0.35 + 0.25 * u;
  const tailP = lerp3(from, to, tail);
  return (
    <>
      <SpaceSet frame={frame} />
      <Ribbon from={from} to={to} tail={tail} head={1} width={1.1} frame={frame} />
      <Glow at={tailP} size={5} color={S.goldHot} opacity={0.5} />
      <Shot frame={f} duration={len} from={[5.5, 2.6, tailP[2] - 7]} to={[5.2, 2.4, tailP[2] - 6]} look={[0, -0.5, tailP[2] + 3]} fov={44} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 7 gravity – „But wait. | No Sun means no pull. | Shouldn't Earth fly off now?“ */
/* ------------------------------------------------------------------ */
export const SonGravity: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("gravity");
  if (shot === 0) {
    // Junos Modell auf dem Handtuch: Tennisball-Sonne, Faden, Murmel-Erde kreist – ihre Schere schneidet den Faden
    const cutAt = beat("modelStringCut");
    const sunB: V3 = [0, 0.32, 0];
    const R = 1.25;
    const w = 0.09;
    const angAt = (fr: number) => fr * w;
    const cutF = Math.min(frame, cutAt);
    const ang = angAt(cutF);
    const after = Math.max(0, frame - cutAt);
    // nach dem Schnitt: geradeaus entlang der Tangente
    const base: V3 = [Math.cos(ang) * R, 0.16, Math.sin(ang) * R];
    const tang: V3 = [-Math.sin(ang), 0, Math.cos(ang)];
    const marble: V3 = frame < cutAt ? [Math.cos(angAt(frame)) * R, 0.16, Math.sin(angAt(frame)) * R] : [base[0] + tang[0] * R * w * after, 0.16, base[2] + tang[2] * R * w * after];
    const snip = ramp(frame, cutAt - 10, cutAt);
    const a = frameOn([0, 0.3, 0.2], 3.2, 0.5, 0.5, [0.25, 0.75, 1]);
    const b = frameOn([0, 0.3, 0.2], 2.7, 0.5, 0.5, [0.2, 0.7, 1]);
    return (
      <>
        <BeachSet frame={frame} day={1} umbrella={false} towel />
        <group position={[0, 0.03, 0]}>
          <mesh position={sunB} castShadow>
            <sphereGeometry args={[0.32, 24, 16]} />
            <meshStandardMaterial color="#E8F04A" roughness={0.95} emissive="#C8B000" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={marble} castShadow>
            <sphereGeometry args={[0.16, 20, 14]} />
            <meshPhysicalMaterial color={S.earthSea} roughness={0.1} clearcoat={1} transmission={0} />
          </mesh>
          {frame < cutAt ? (
            <mesh position={[(sunB[0] + marble[0]) / 2, 0.22, (sunB[2] + marble[2]) / 2]} rotation={[0, -Math.atan2(marble[2], marble[0]), 0]}>
              <boxGeometry args={[R, 0.015, 0.015]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ) : (
            <mesh position={[sunB[0] + Math.cos(ang) * 0.4, 0.22, sunB[2] + Math.sin(ang) * 0.4]} rotation={[0, -ang, 0]}>
              <boxGeometry args={[0.45, 0.015, 0.015]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          )}
          {/* Bahn als Punktlinie */}
          <OrbitDots center={[0, 0.06, 0]} radius={R} n={40} on={0.7} dot={0.025} color="#FFFFFF" />
          {/* Kinder-Schere (rot) in Junos Hand */}
          <group position={[Math.cos(ang) * 0.75 + 0.05, 0.42, Math.sin(ang) * 0.75 + 0.05]} rotation={[0, -ang + Math.PI / 2, 0]}>
            {[-1, 1].map((sd) => (
              <group key={sd} rotation={[0, sd * (0.45 * (1 - snip) + 0.04), 0]}>
                <mesh position={[0, 0, -0.18]}>
                  <boxGeometry args={[0.04, 0.03, 0.36]} />
                  <meshStandardMaterial color="#D8DCE4" metalness={0.8} roughness={0.25} />
                </mesh>
                <mesh position={[sd * 0.06, 0, 0.14]}>
                  <torusGeometry args={[0.07, 0.025, 8, 16]} />
                  <meshStandardMaterial color="#E53935" />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 0.02, 0.32]}>
              <boxGeometry args={[0.36, 0.22, 0.4]} />
              <Plastic color={S.skin} />
            </mesh>
          </group>
        </group>
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Untersicht: Grandpa auf dem Balkon hebt eine Braue, goldenes Fragezeichen über der Bahn
  const head: V3 = [0, 2.72, 0];
  const n = beat("grandpaEyebrow");
  const brow = ramp(frame, n - 14, n - 2);
  const a = frameOn(head, 3.6, 0.5, 0.5, [0.2, -0.28, 1]);
  const b = frameOn(head, 3.2, 0.5, 0.5, [0.16, -0.3, 1]);
  const q = atScreen(b, 0.72, 0.28, 7);
  return (
    <>
      <BalconySet frame={frame} telescope={false} moonPos={atScreen(b, 0.2, 0.25, 70)} saturnPos={atScreen(b, 0.82, 0.42, 70)} />
      <Ode frame={frame} brow={brow} mouth="flat" look={-0.12} tilt={0.06 * brow} eyePop={1 + 0.15 * brow} />
      <group position={q} rotation={faceTo(q, b.pos)} scale={0.9 + 0.1 * Math.sin(frame * 0.2)}>
        <TextLabel text="?" width={1.2} height={1.6} position={[0, 0, 0]} color="#FFD23F" stroke="#0A0D22" />
      </group>
      <Shot frame={f} duration={len} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 8 speed – „Nope. Gravity isn't instant either. | Its changes move at the speed of light.“ */
/* ------------------------------------------------------------------ */
export const SonSpeed: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("speed");
  const g = beat("gridRipple");
  const R = Math.max(0.5, (frame - Math.min(g, 1e6) + 30) * 0.16);
  if (shot === 0) {
    // Raumzeit als goldenes Gitter: innen schon flach (Sonne weg), außen noch die alte Delle; Welle + Lichtschale nebeneinander
    const a = frameOn([0, -1.5, 0], 22, 0.5, 0.5, [0, 0.62, 1]);
    const b = frameOn([0, -1.5, 0], 19, 0.5, 0.5, [0.08, 0.58, 1]);
    return (
      <>
        <SpaceSet frame={frame} />
        <SpaceGrid size={36} step={1.2} y={0} dip={3} rippleR={R} />
        <LightShell center={[0, 0, 0]} r={R} on={0.8} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Mitfahrt: Welle und Lichtschale rasen gemeinsam auf die blaue Erde zu (Tempo-Schild „c“ als Sticker)
  const r = 8 + f * 0.12;
  const earthP: V3 = [0, 0.8, 26];
  return (
    <>
      <SpaceSet frame={frame} sunLight={0.6} sunAt={[0, 0, -30]} />
      <SpaceGrid size={60} step={1.4} y={0} dip={3} rippleR={r} center={[0, 0, 0]} />
      <LightShell center={[0, 0, 0]} r={r} on={0.9} />
      <EarthBall position={earthP} radius={1.2} glow={1} spin={frame * 0.005} />
      <Shot frame={f} duration={len} from={[3.5, 2.8, r - 4]} to={[3.2, 2.6, r - 2.5]} look={[0, 0.2, r + 8]} fov={46} ease="linear" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 9 proof – „In twenty seventeen, we saw two dead stars crash. | Their gravity ripples and their light raced together.“ */
/* ------------------------------------------------------------------ */
export const SonProof: React.FC = () => {
  const { frame, beat, shot, f, len, cuts } = useShots("proof");
  const crash = beat("deadStarsCrash");
  if (shot === 0) {
    // Totale: zwei kleine schwere Sterne umkreisen einander immer enger (ferne Galaxie)
    const end = cuts[0] ?? 60;
    const u = Math.min(1, frame / Math.max(1, end));
    const d = lerp(2.4, 0.8, u * u);
    const ang = frame * (0.12 + 0.25 * u);
    const a = frameOn([0, 0, 0], 12, 0.5, 0.5, [0.1, 0.45, 1]);
    const b = frameOn([0, 0, 0], 9, 0.5, 0.5, [0.1, 0.42, 1]);
    return (
      <>
        <SpaceSet frame={frame} />
        <Galaxies t={frame * 0.02} />
        <DeadStar position={[Math.cos(ang) * d, Math.sin(ang) * d * 0.35, Math.sin(ang) * d]} />
        <DeadStar position={[-Math.cos(ang) * d, -Math.sin(ang) * d * 0.35, -Math.sin(ang) * d]} />
        <OrbitDots radius={d} n={40} on={0.35} dot={0.04} color="#8FA8FF" />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Groß: Zusammenstoß – heller Blitz und eine goldene Gitterwelle im selben Augenblick
    const t = (frame - crash) / 50;
    const R = Math.max(0, (frame - crash) * 0.2);
    const a = frameOn([0, 0, 0], 9, 0.5, 0.5, [0, 0.5, 1]);
    const b = frameOn([0, 0, 0], 11, 0.5, 0.5, [0, 0.52, 1]);
    const pre = frame < crash;
    return (
      <>
        <SpaceSet frame={frame} />
        <SpaceGrid size={26} step={0.9} y={-0.4} dip={pre ? 1.2 : 0} rippleR={pre ? -10 : R} ripple={1.2} opacity={0.5} />
        {pre ? (
          <>
            <DeadStar position={[Math.cos(frame * 0.5) * 0.5, 0, Math.sin(frame * 0.5) * 0.5]} />
            <DeadStar position={[-Math.cos(frame * 0.5) * 0.5, 0, -Math.sin(frame * 0.5) * 0.5]} />
          </>
        ) : null}
        <Flash position={[0, 0, 0]} t={t} size={3.5} />
        {!pre ? <LightShell center={[0, 0, 0]} r={R} on={Math.max(0, 1 - t * 0.6)} color="#FFFFFF" /> : null}
        <Shot frame={f} duration={len} {...fly(a, b)} punch={pre ? undefined : crash - (cuts[0] ?? 0)} ease="out" />
      </>
    );
  }
  // Mitfahrt: Blitz (Licht) und Welle fliegen Seite an Seite durchs All, Kalenderblatt „2017“
  const z = f * 0.5;
  const tag = ramp(frame, beat("flashRippleSideBySide") - 10, beat("flashRippleSideBySide") + 2);
  const cam = { pos: [2.6, 1.4, z - 6] as V3, look: [0, 0, z + 4] as V3, fov: 44 };
  const cal = atScreen(cam, 0.5, 0.3, 6);
  return (
    <>
      <SpaceSet frame={frame} />
      <Galaxies t={-z} count={18} center={[0, 0, z + 30]} />
      <group position={[0, 0, z]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[2.2, 0.08, 8, 64]} />
          <meshBasicMaterial color={S.gold} transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.6, 0.04, 8, 64]} />
          <meshBasicMaterial color={S.gold} transparent opacity={0.4} toneMapped={false} />
        </mesh>
        <Halo at={[-0.9, 0, 0.2]} size={2.2} color="#FFFFFF" opacity={0.95} />
        <Halo at={[-0.9, 0, 0.2]} size={4.5} color={S.goldHot} opacity={0.5} />
      </group>
      <Motes frame={frame} center={[0, 0, z]} size={[14, 16, 18]} count={80} drift={[0, 0, -0.2]} color="#FFFFFF" dot={0.06} opacity={0.6} seed={13} />
      {tag > 0.01 ? (
        <group position={cal} rotation={faceTo(cal, cam.pos)} scale={0.8 + 0.2 * tag}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.5, 0.66]} />
            <meshBasicMaterial color={S.hud} transparent opacity={0.92 * tag} toneMapped={false} />
          </mesh>
          <TextLabel text="2017" width={1.3} height={0.52} position={[0, 0, 0]} color="#FFD23F" opacity={tag} />
        </group>
      ) : null}
      <Shot frame={f} duration={len} from={cam.pos} look={cam.look} fov={cam.fov} ease="linear" shake={0.01} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 10 arrive – „After a hundred thirty million years… | they arrived under two seconds apart.“ */
/* ------------------------------------------------------------------ */
const fmtBig = (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const SonArrive: React.FC = () => {
  const { frame, beat, shot, f, len, cuts } = useShots("arrive");
  if (shot === 0) {
    // Zeitraffer: Blitz und Welle durchqueren ein Galaxienfeld, Zähler „130 000 000 YEARS“ rollt hoch
    const end = cuts[0] ?? 60;
    const u = Math.min(1, frame / Math.max(1, end - 6));
    const years = 130000000 * (1 - Math.pow(1 - u, 2.2));
    const cam = { pos: [0, 0, 14] as V3, look: [0, 0, 0] as V3, fov: 44 };
    const lbl = atScreen(cam, 0.5, 0.3, 8);
    return (
      <>
        <SpaceSet frame={frame} />
        <Galaxies t={frame * 1.4} count={30} spread={[50, 80, 120]} center={[0, 0, -80]} />
        <Motes frame={frame} center={[0, 0, 0]} size={[20, 30, 40]} count={160} drift={[0, 0, 0.9]} color="#FFFFFF" dot={0.07} opacity={0.6} seed={17} />
        <group position={[0, -1.2, 0]}>
          <mesh>
            <torusGeometry args={[1.6, 0.07, 8, 64]} />
            <meshBasicMaterial color={S.gold} toneMapped={false} />
          </mesh>
          <Halo at={[0, 0, 0.3]} size={2.4} color="#FFFFFF" opacity={0.95} />
        </group>
        <group position={lbl} rotation={faceTo(lbl, cam.pos)}>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[4.4, 1.2]} />
            <meshBasicMaterial color={S.hud} transparent opacity={0.9} toneMapped={false} />
          </mesh>
          <TextLabel text={fmtBig(years)} width={4.1} height={0.62} position={[0, 0.16, 0]} color="#FFD23F" />
          <TextLabel text="YEARS" width={2} height={0.34} position={[0, -0.36, 0]} color="#FFFFFF" />
        </group>
        <Shot frame={f} duration={len} from={cam.pos} to={[0, 0, 12.5]} look={cam.look} fov={cam.fov} ease="linear" />
      </>
    );
  }
  // Fotofinish: zwei Bahnen zur Erde – die Welle trifft zuerst, das Licht 1,7 s später
  const ap = beat("photoFinish");
  const hitW = ap - 26;
  const hitL = ap + 4;
  const lane = (x: number, hit: number, kind: "ripple" | "light") => {
    const p = Math.min(1, Math.max(0, 1 - (hit - frame) / 40));
    const y = lerp(6, 0.9, p);
    const done = frame >= hit;
    return (
      <group position={[x, 0, 0]}>
        {kind === "ripple" ? (
          <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.06, 8, 40]} />
            <meshBasicMaterial color={S.gold} toneMapped={false} />
          </mesh>
        ) : (
          <Halo at={[0, y, 0]} size={1.6} color="#FFFFFF" opacity={0.95} />
        )}
        {done ? <Halo at={[0, 0.8, 0.2]} size={2.2 + Math.max(0, 8 - (frame - hit)) * 0.2} color={kind === "ripple" ? S.gold : "#FFFFFF"} opacity={0.8} /> : null}
        <TextLabel text={kind === "ripple" ? "RIPPLE" : "LIGHT"} width={1.6} height={0.36} position={[0, -0.25, 0.4]} color={kind === "ripple" ? "#FFD23F" : "#FFFFFF"} bg={S.hud} />
        <TextLabel text={done ? (kind === "ripple" ? "1ST" : "+1.7 S") : ""} width={1.4} height={0.34} position={[0, 2.2, 0.4]} color={kind === "ripple" ? "#FFD23F" : "#FFFFFF"} />
      </group>
    );
  };
  const cam = frameOn([0, 2.2, 0], 8.5, 0.6, 0.5, [0, 0.1, 1]);
  return (
    <>
      <SpaceSet frame={frame} sunLight={0.8} sunAt={[-20, 10, 20]} />
      <EarthBall position={[0, -3.2, -1]} radius={3.2} spin={frame * 0.003} glow={0.8} />
      {/* Ziellinie */}
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[4.4, 0.06]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0, 3.4, -0.02]}>
          <planeGeometry args={[0.04, 5.2]} />
          <meshBasicMaterial color="#5A6A9A" />
        </mesh>
      ))}
      {lane(-1.05, hitW, "ripple")}
      {lane(1.05, hitL, "light")}
      <Shot frame={f} duration={len} {...fly(cam, frameOn([0, 2.2, 0], 7.8, 0.6, 0.5, [0, 0.1, 1]))} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 11 orbit – „So for eight minutes, Earth keeps circling an empty spot.“ */
/* ------------------------------------------------------------------ */
export const ORBIT_R = 9;
/** Erde auf der Bahn (Winkel aus dem Frame). */
export const earthOnOrbit = (frame: number, a0 = 0.6, w = 0.006): V3 => [Math.cos(a0 + frame * w) * ORBIT_R, 0, Math.sin(a0 + frame * w) * ORBIT_R];
export const SonOrbit: React.FC = () => {
  const { frame, beat, shot, f, len } = useShots("orbit");
  const e = earthOnOrbit(frame);
  const ang = 0.6 + frame * 0.006;
  if (shot === 0) {
    // Draufsicht: Erde (mit Mond) zieht weiter ihre Bahn um eine leere schwarze Stelle mit goldenem Geister-Umriss
    const a = frameOn([0, 0, 0], 26, 0.5, 0.5, [0, 1, 0.22]);
    const b = frameOn([0, 0, 0], 23, 0.5, 0.5, [0.05, 1, 0.24]);
    return (
      <>
        <SpaceSet frame={frame} sunLight={1} sunAt={[0, 30, 0]} />
        <SunDisc position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} radius={2} on={0} ring={0.2} ghost={1} />
        <OrbitDots radius={ORBIT_R} n={90} on={0.8} dot={0.1} />
        <EarthBall position={e} radius={0.9} moon moonAngle={frame * 0.05} glow={1} spin={frame * 0.01} />
        <Shot frame={f} duration={len} {...fly(a, b)} />
      </>
    );
  }
  // Nah: die Punktlinie leuchtet vor der Erde auf, Schild „NOTHING HERE“ auf der leeren Stelle
  const lbl = ramp(frame, beat("orbitEmptySpot") - 4, beat("orbitEmptySpot") + 8);
  const cam = frameOn([e[0] * 0.55, 0, e[2] * 0.55], 11, 0.5, 0.5, [0.2, 0.9, 0.5]);
  const ahead: V3[] = Array.from({ length: 8 }, (_, i) => [Math.cos(ang + 0.12 + i * 0.07) * ORBIT_R, 0, Math.sin(ang + 0.12 + i * 0.07) * ORBIT_R]);
  const tagP = atScreen(cam, 0.5, 0.36, Math.hypot(cam.pos[0], cam.pos[1], cam.pos[2]) * 0.92);
  return (
    <>
      <SpaceSet frame={frame} sunLight={1} sunAt={[0, 30, 0]} />
      <SunDisc position={[0, 0, 0]} rotation={faceTo([0, 0, 0], cam.pos)} radius={2} on={0} ring={0.2} ghost={1} />
      <OrbitDots radius={ORBIT_R} n={90} on={0.6} dot={0.1} />
      {ahead.map((p, i) => (
        <Halo key={i} at={p} size={0.9 - i * 0.06} color={S.goldHot} opacity={0.9 * (0.6 + 0.4 * Math.sin(frame * 0.3 - i))} />
      ))}
      <EarthBall position={e} radius={0.9} moon moonAngle={frame * 0.05} glow={1} spin={frame * 0.01} />
      {lbl > 0.01 ? (
        <group position={tagP} rotation={faceTo(tagP, cam.pos)} scale={0.8 + 0.2 * lbl}>
          <TextLabel text="NOTHING HERE" width={3.4} height={0.62} position={[0, 0, 0]} color="#FFD23F" bg={S.hud} opacity={lbl} />
        </group>
      ) : null}
      <Shot frame={f} duration={len} {...fly(cam, frameOn([e[0] * 0.55, 0, e[2] * 0.55], 10, 0.5, 0.5, [0.18, 0.9, 0.5]))} />
    </>
  );
};
