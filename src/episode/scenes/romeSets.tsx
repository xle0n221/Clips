/**
 * Rom-Video: gemeinsame Kulissen und Bewegungs-Helfer für scenes/rome1–3.tsx.
 * Alles aus dem Frame berechnet (kein useEffect). Bauten aus src/episode/kit/rome.tsx.
 */
import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { V3 } from "../kit/camera";
import {
  Colosseum,
  Column,
  Hills,
  Pavement,
  RomanSkyline,
  ROME,
  RomeAtmosphere,
  RomePhase,
  SignBoard,
  SpqrBanner,
  Throne,
  UmbrellaPine,
  Cypress,
} from "../kit/rome";
import { Ink, Toon } from "../kit/toon";

export const FPS = 30;

/** Aktive Einstellung + lokaler Frame darin. cuts = lokale Szenen-Frames der Schnitte. */
export const cut = (frame: number, cuts: number[]) => {
  let i = 0;
  for (const c of cuts) if (frame >= c) i++;
  const from = i === 0 ? 0 : cuts[i - 1];
  return { shot: i, f: frame - from, from };
};

/** Federndes Erscheinen 0 → 1 (mit Überschwinger) ab Frame `at`. */
export const pop = (frame: number, at: number, damping = 11) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping, stiffness: 170 } });

/** Weicher Übergang 0..1 zwischen a und b. */
export const ramp = (frame: number, a: number, b: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/**
 * Antizipation (Experiment aus docs/agenten/szenen.md): vor einer großen Geste erst kurz
 * in die Gegenrichtung ausholen (−0,3), dann schnell auf 1 mit Überschwinger.
 * Wind-up `pre` Frames vor `at`, Ziel ab `at` per Feder.
 */
export const anticipate = (frame: number, at: number, pre = 8) => {
  if (frame < at - pre) return 0;
  if (frame < at) return -0.3 * Math.sin(((frame - (at - pre)) / pre) * (Math.PI / 2));
  return -0.3 + 1.3 * spring({ frame: frame - at, fps: FPS, config: { damping: 9, stiffness: 220 } });
};

/** Kamera-Wackler bei Gefahr (Experiment): abklingender Stoß ab `at`, Stärke amp. */
export const jolt = (frame: number, at: number, amp = 0.25, dur = 14): V3 => {
  const t = frame - at;
  if (t < 0 || t > dur) return [0, 0, 0];
  const k = (1 - t / dur) * amp;
  return [Math.sin(t * 2.7) * k, Math.cos(t * 3.3) * k * 0.7, 0];
};

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Kleiner Kasten mit Toon + Kontur (Bühne, Tische, Stufen). */
export const Block: React.FC<{
  readonly size: V3;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly color: string;
  readonly ink?: number;
}> = ({ size, position, rotation, color, ink = 0.02 }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <Toon color={color} />
    {ink > 0 ? (
      <Ink f={ink}>
        <boxGeometry args={size} />
      </Ink>
    ) : null}
  </mesh>
);

/** Dunkler Studio-Hintergrund für Info-Einschübe (Stele, Stempel, Game Over). */
export const Studio: React.FC<{
  readonly color?: string;
  readonly table?: boolean;
  readonly light?: V3;
  readonly intensity?: number;
}> = ({ color = "#2A1A12", table = false, light = [-5, 9, 7], intensity = 2.4 }) => (
  <>
    <color attach="background" args={[color]} />
    <hemisphereLight args={["#FFE2C0", "#3A2418", 0.8]} />
    <directionalLight position={light} intensity={intensity} color="#FFE7C4" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    {table ? <Block size={[30, 0.4, 14]} position={[0, -0.2, 0]} color="#6B4426" ink={0} /> : null}
    <mesh position={[0, 0, -12]} receiveShadow>
      <planeGeometry args={[80, 60]} />
      <meshToonMaterial color={color} />
    </mesh>
  </>
);

/**
 * Prätorianerlager-Bühne (Hook, Auktion, Loop am Ende): Holzbühne mit Thron und
 * „FOR SALE“-Schild, Feldzeichen, Stadt + Kolosseum im Hintergrund.
 * Thron bei (0, 0.6, -0.6); Sitzfigur bei [0, 0.6 + THRONE_SIT_Y, -0.3].
 */
export const STAGE_Y = 0.6;
export const AuctionStage: React.FC<{
  readonly frame: number;
  readonly phase?: RomePhase;
  readonly sign?: readonly string[];
  readonly signY?: number;
}> = ({ frame, phase = "glory", sign = ["EMPIRE", "FOR SALE"], signY = 0 }) => (
  <>
    <RomeAtmosphere phase={phase} frame={frame} />
    <Pavement size={120} />
    <Block size={[9, STAGE_Y, 4.6]} position={[0, STAGE_Y / 2, -0.6]} color={ROME.wood} ink={0.015} />
    {[-3.6, -1.2, 1.2, 3.6].map((x) => (
      <Block key={x} size={[0.12, 0.5, 0.05]} position={[x, 0.3, 1.66]} color="#7A4E28" ink={0} />
    ))}
    <Throne position={[0, STAGE_Y, -0.9]} />
    <SignBoard lines={sign} position={[1.55, STAGE_Y + signY, 1.0]} rotation={[0, -0.15, 0.04]} width={2.6} height={1.5} />
    <SpqrBanner frame={frame} position={[-4.0, STAGE_Y, -1.6]} />
    <SpqrBanner frame={frame + 20} position={[4.0, STAGE_Y, -1.6]} />
    <RomanSkyline position={[0, 0, -26]} width={60} rows={2} seed={7} />
    <Colosseum position={[-14, 0, -52]} scale={2.6} detail="far" segments={24} rotation={[0, 0.5, 0]} />
    <Cypress position={[9, 0, -14]} height={5} />
    <Cypress position={[-9.5, 0, -15]} height={4.4} />
    <UmbrellaPine position={[13, 0, -20]} height={5.2} />
    <Hills z={-85} />
  </>
);

/** Forum mit Tempel und Säulenreihe (Steine-Szene). */
export const ForumSet: React.FC<{ readonly frame: number; readonly phase?: RomePhase }> = ({
  frame,
  phase = "glory",
}) => (
  <>
    <RomeAtmosphere phase={phase} frame={frame} />
    <Pavement size={120} />
    {[-9, -6, 6, 9].map((x) => (
      <Column key={x} position={[x, 0, -6]} height={4.2} />
    ))}
    <RomanSkyline position={[0, 0, -30]} width={60} rows={2} seed={11} />
    <Colosseum position={[16, 0, -55]} scale={2.6} detail="far" segments={24} rotation={[0, -0.6, 0]} />
    <Hills z={-85} />
  </>
);

/**
 * Palast-Halle (Honorius, Augustulus): Marmorboden, dunkle Rückwand mit Purpurvorhängen
 * (Köpfe vor dunkler Fläche = Kontrast), Säulen, Thron bei (0, 0, -1).
 */
export const PalaceSet: React.FC<{
  readonly frame: number;
  readonly phase?: RomePhase;
  readonly throne?: boolean;
  readonly throneScale?: number;
}> = ({ frame, phase = "decline", throne = true, throneScale = 1 }) => {
  const warm = phase === "decline";
  const fall = phase === "fall";
  return (
    <>
      <color attach="background" args={[fall ? "#1C1424" : "#3A2016"]} />
      <hemisphereLight args={[fall ? "#6E72B0" : "#FFE2C0", fall ? "#21120E" : "#5A3420", fall ? 0.7 : 0.9]} />
      <directionalLight
        position={fall ? [8, 7, 6] : [-7, 9, 8]}
        intensity={fall ? 1.6 : 2.3}
        color={fall ? "#FFB27A" : warm ? "#FFD3A0" : "#FFF1D8"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {/* Boden (Marmor-Schachbrett über Pavement-Farbe) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshToonMaterial color={fall ? "#B9A88E" : "#E9DCC4"} />
      </mesh>
      {/* Rückwand dunkel + Vorhänge */}
      <Block size={[30, 14, 0.4]} position={[0, 7, -5.2]} color="#5E331C" ink={0} />
      {[-5.5, -2.9, 2.9, 5.5].map((x, i) => (
        <mesh key={x} position={[x, 4.2, -4.8]} castShadow>
          <cylinderGeometry args={[0.7, 0.95, 8.4, 16, 1, true, -Math.PI / 2, Math.PI]} />
          <Toon color={i % 2 ? ROME.purpleDark : ROME.purple} />
        </mesh>
      ))}
      {[-7.2, -4.2, 4.2, 7.2].map((x) => (
        <Column key={`c${x}`} position={[x, 0, -3.6]} height={6.5} radius={0.42} />
      ))}
      {/* Fries */}
      <Block size={[30, 0.8, 1.2]} position={[0, 6.9, -3.6]} color={ROME.marble} ink={0.015} />
      {throne ? <Throne position={[0, 0, -1]} scale={throneScale} /> : null}
      <SpqrBanner frame={frame} position={[-2.4, 0, -2.6]} color={ROME.purple} />
      <SpqrBanner frame={frame + 15} position={[2.4, 0, -2.6]} color={ROME.purple} />
    </>
  );
};

/** Senatssaal: Säulen, Bänke, dunkle Rückwand. */
export const SenateSet: React.FC<{ readonly frame: number }> = () => (
  <>
    <color attach="background" args={["#24161A"]} />
    <hemisphereLight args={["#7C80B8", "#2A1712", 0.75]} />
    <directionalLight position={[6, 9, 7]} intensity={1.9} color="#FFC08A" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshToonMaterial color="#BBA78A" />
    </mesh>
    <Block size={[30, 14, 0.4]} position={[0, 7, -6]} color="#4A2A1A" ink={0} />
    {[-6, -3.5, 3.5, 6].map((x) => (
      <Column key={x} position={[x, 0, -4.4]} height={6.5} radius={0.4} />
    ))}
    {[0, 1, 2].map((k) => (
      <Block key={k} size={[12, 0.45, 0.9]} position={[0, 0.22 + k * 0.45, -2.8 - k * 0.9]} color={ROME.marbleShade} ink={0.015} />
    ))}
  </>
);

/* ------------------------------------------------------------------ */
/* Bildgestaltung: Kamera aus gewünschter Bildposition berechnen        */
/* ------------------------------------------------------------------ */

const FOV = 40;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
const ASPECT = 1080 / 1920;
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Kamera so stellen, dass Punkt `p` (z. B. Kopfmitte) bei Bildanteil (xf, yf) liegt und das
 * Bild dort `H` Einheiten hoch ist (H/0,728 = Abstand bei fov 40). `dir` = Richtung von p
 * zur Kamera. Für Pills: Kopf knapp unter die Pill-Spitze legen (yf = Pill-y + 0,02 + 1,3/H).
 */
export const aim = (p: V3, H: number, yf = 0.55, xf = 0.5, dir: V3 = [0, 0.12, 1]) => {
  const d = H / (2 * TAN);
  const W = H * ASPECT;
  const back = norm(dir);
  const fwd: V3 = [-back[0], -back[1], -back[2]];
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const dy = (yf - 0.5) * H;
  const dx = (xf - 0.5) * W;
  const look: V3 = [
    p[0] + up[0] * dy - right[0] * dx,
    p[1] + up[1] * dy - right[1] * dx,
    p[2] + up[2] * dy - right[2] * dx,
  ];
  const pos: V3 = [look[0] + back[0] * d, look[1] + back[1] * d, look[2] + back[2] * d];
  return { pos, look };
};

/** Props für <Shot>: Fahrt von Bildausschnitt a nach b (je Ergebnis von `aim`). */
export const move = (a: { pos: V3; look: V3 }, b: { pos: V3; look: V3 } = a) => ({
  from: a.pos,
  to: b.pos,
  look: a.look,
  lookTo: b.look,
  fov: FOV,
});

/** Kopfmitte einer stehenden Figur (Maßstab k) bei Fußpunkt p. */
export const headOf = (p: V3, k = 1): V3 => [p[0], p[1] + 3.05 * k, p[2]];
/** yf für einen Kopf (Radius r) direkt unter einer Pill bei Bild-y ly. */
export const under = (ly: number, H: number, r = 1) => ly + 0.025 + (1.3 * r) / H;

/** Wackler (aus `jolt`) auf eine Kamerafahrt addieren. */
export const jmove = (m: ReturnType<typeof move>, j: V3) => ({ ...m, from: add(m.from, j), to: add(m.to, j) });
