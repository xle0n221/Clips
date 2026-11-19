/**
 * „In This City, Gravity Pulls Toward Marta“ (episodes/schwerkraft-stadt.json) – Bau-Kit der Schüssel-Stadt.
 *
 * Stil (Drehbuch `style`, K7): Cinematic 3D mit EIGENEN Klotzfiguren (Kopf breiter als der Rumpf, Punktaugen mit
 * Glanzpunkt, Fäustlinge) – kein Noppen-Kopf, keine Spiel-UI, keine Marken. Die Stadt ist eine Schüssel: Boden
 * y = K·r², alle Häuser, Laternen und Dächer kippen zur Mitte, wo Martas Veranda steht.
 * Farblogik (Paket §4): BERNSTEIN nur = Zug der Schwerkraft (Zuglinien, Laternen, Veranda-Licht) ·
 * HIMMELBLAU/WEISS nur = Leichtigkeit (Ballons, Luft, Wolken) · Terrakotta-Pastell = Stadt · ROSTROT nur an Marta.
 * Sensibilität: Marta hat GENAU die Körpermaße aller Stadtleute; ihr Gewicht ist sichtbare LAST
 * (Schürzentaschen, Sack, Stapel) – die Stadtwaage wiegt Lasten, nie Körper.
 * Alles aus dem Frame berechnet (kein useEffect, Zufall nur mit Seed).
 */
import { RoundedBox } from "@react-three/drei";
import React, { useMemo } from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  LatheGeometry,
  Object3D,
  QuadraticBezierCurve3,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { V3 } from "../kit/camera";
import { blinkAt } from "../kit/motion";
import { seeded } from "../kit/toon";
import { atScreen, faceTo, Plastic, Matte } from "./sonneSets";
import { frameOn as zFrameOn, Halo, TextLabel } from "./zeitweltSets";

export { atScreen, faceTo, Plastic, Matte };
export { cut, fly, Halo, lerp, lerp3, LightShaft, Motes, ramp, TextLabel } from "./zeitweltSets";

/**
 * Kamera-Ausschnitt wie `frameOn` (zeitweltSets), aber nie unter dem Schüssel-Boden: die Schüssel steigt zur Kamera
 * hin an (y = K·r²), bergauf gestellte Kameras lagen im ersten Kontaktabzug unter dem Pflaster (schwarze Bilder).
 * Liegt die Kamera tiefer als Boden + 1,2, wird nur die Kamera angehoben (Blickziel bleibt).
 */
export const frameOn = (p: V3, H: number, yf = 0.5, xf = 0.5, dir: V3 = [0, 0.1, 1], fov = 40) => {
  const c = zFrameOn(p, H, yf, xf, dir, fov);
  const floor = bowlY(Math.hypot(c.pos[0], c.pos[2])) + 1.2;
  return c.pos[1] >= floor ? c : { ...c, pos: [c.pos[0], floor, c.pos[2]] as V3 };
};

/* ------------------------------------------------------------------ */
/* Palette                                                              */
/* ------------------------------------------------------------------ */

export const G = {
  // Himmel (Luft = Leichtigkeit)
  skyTop: "#4F8FD6",
  skyLow: "#CFE7F7",
  duskTop: "#3A3A78",
  duskLow: "#E9A7A0",
  cloud: "#F7FBFF",
  // Zug der Schwerkraft (exklusiv)
  amber: "#FFB23E",
  amberHot: "#FFD98A",
  // Leichtigkeit (exklusiv)
  balloon: "#7EC8FF",
  balloonHi: "#CDEBFF",
  // Stadt
  walls: ["#E39A6E", "#F0C796", "#F4DDB4", "#C8A6C4", "#A9CBB6", "#E7A9A4", "#D6B48C"] as readonly string[],
  roof: "#8A4F3E",
  roofB: "#5F6B80",
  trim: "#4A3A34",
  cobble: "#9C948C",
  cobbleDark: "#6E6862",
  grass: "#9DB07A",
  wood: "#8A6244",
  woodDark: "#5A3E2C",
  brass: "#C9973F",
  brassDark: "#7A5A26",
  // Figuren
  skin: "#F0C49C",
  skinB: "#D9A47A",
  marta: "#B23A2A", // Rostrot – nur Marta
  apron: "#EEE2C6",
  patch: "#C9A56A",
  bun: "#BFC2CA",
  sack: "#A88A5E",
  bo: "#7FD6B0",
  cap: "#FFD21F",
  boPants: "#3E4A66",
  cat: "#F08A2E",
  towns: ["#6E7F4E", "#7A4E6E", "#2F6E6A", "#34406A", "#7A5A40", "#5C5470"] as readonly string[],
  pants: "#3A3F4E",
  // Tafeln
  plate: "#0B0F1E",
  ink: "#141414",
  white: "#FFFFFF",
  warn: "#FF8A80",
  safe: "#FFE27A",
} as const;

/** Schüssel-Boden: y = K·r² (Mitte = Martas Veranda). */
export const K = 0.02;
export const bowlY = (r: number) => K * r * r;
/** Punkt auf dem Schüssel-Boden: Radius r, Winkel a (0 = +z, „Hill Street“ zur Kamera), Höhe darüber h. */
export const onBowl = (r: number, a = 0, h = 0): V3 => [r * Math.sin(a), bowlY(r) + h, r * Math.cos(a)];
/** Hangneigung (rad) bei Radius r. */
export const slopeAt = (r: number) => Math.atan(2 * K * r);

/* ------------------------------------------------------------------ */
/* Texturen                                                             */
/* ------------------------------------------------------------------ */

const texCache = new Map<string, CanvasTexture>();
const canvasTex = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d");
  if (!c) throw new Error("2D-Kontext fehlt");
  draw(c);
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace;
  if (repeat) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  texCache.set(key, t);
  return t;
};

/** Warmes Kopfsteinpflaster (Terrakotta-Grau), wiederholt. */
const cobbleTex = (rep: number) =>
  canvasTex(`sk-cobble-${rep}`, 256, 256, (c) => {
    c.fillStyle = "#5E554E";
    c.fillRect(0, 0, 256, 256);
    const r = seeded(17);
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 6; x++) {
        const ox = (y % 2) * 21;
        const l = 140 + Math.floor(r() * 40);
        c.fillStyle = `rgb(${l},${l - 10},${l - 22})`;
        c.beginPath();
        c.roundRect(x * 43 + ox + 2, y * 32 + 2, 39, 28, 9);
        c.fill();
      }
  }, [rep, rep]);

const skyTex = (key: string, top: string, low: string) =>
  canvasTex(`sk-sky-${key}`, 4, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    g.addColorStop(0.55, low);
    g.addColorStop(1, low);
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 256);
  });

/* ------------------------------------------------------------------ */
/* Geometrie-Helfer                                                     */
/* ------------------------------------------------------------------ */

const Y_UP = new Vector3(0, 1, 0);
/** Zylinder (Stab, Schnur, Mast) von a nach b. */
export const Stick: React.FC<{ readonly a: V3; readonly b: V3; readonly r?: number; readonly color?: string; readonly basic?: boolean; readonly opacity?: number }> = ({ a, b, r = 0.015, color = "#EDEDED", basic = true, opacity = 1 }) => {
  const d = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const len = d.length() || 1e-4;
  const q = new Quaternion().setFromUnitVectors(Y_UP, d.clone().normalize());
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, 6]} />
      {basic ? <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} /> : <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />}
    </mesh>
  );
};

/** Drehung, die +y auf die Richtung zur Schüssel-Mitte kippt (Neigung `lean` rad) – für Häuser/Laternen am Hang. */
export const leanToCenter = (p: V3, lean: number): V3 => {
  const a = Math.atan2(p[0], p[2]);
  // um die Tangente (senkrecht zum Radius) kippen: Kopf Richtung −r
  return [-lean * Math.cos(a), 0, lean * Math.sin(a)];
};

/* ------------------------------------------------------------------ */
/* Himmel, Wolken, Regen                                                */
/* ------------------------------------------------------------------ */

export const SkyDome: React.FC<{ readonly dusk?: number; readonly radius?: number }> = ({ dusk = 0, radius = 320 }) => {
  const day = skyTex("day", G.skyTop, G.skyLow);
  const eve = skyTex("dusk", G.duskTop, G.duskLow);
  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 32, 16]} />
        <meshBasicMaterial map={day} side={BackSide} fog={false} toneMapped={false} depthWrite={false} />
      </mesh>
      {dusk > 0.01 ? (
        <mesh scale={0.99}>
          <sphereGeometry args={[radius, 32, 16]} />
          <meshBasicMaterial map={eve} side={BackSide} fog={false} toneMapped={false} transparent opacity={dusk} depthWrite={false} />
        </mesh>
      ) : null}
    </>
  );
};

/** Wolke aus weichen Kugeln (weiß = Luft/Leichtigkeit). */
export const Cloud: React.FC<{ readonly position: V3; readonly scale?: number; readonly seed?: number; readonly opacity?: number; readonly tint?: string }> = ({ position, scale = 1, seed = 1, opacity = 1, tint = G.cloud }) => {
  const parts = useMemo(() => {
    const r = seeded(seed * 7 + 3);
    return Array.from({ length: 6 }, (_, i) => ({ p: [(i - 2.5) * 1.1 + (r() - 0.5), (r() - 0.3) * 0.8, (r() - 0.5) * 1.2] as V3, s: 0.9 + r() * 0.9 }));
  }, [seed]);
  return (
    <group position={position} scale={scale}>
      {parts.map((q, i) => (
        <mesh key={i} position={q.p} scale={q.s}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={tint} roughness={1} transparent={opacity < 1} opacity={opacity} emissive={tint} emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  );
};

/** Schräger Regen in Richtung `dir` (zur Veranda), deterministisch. */
export const SlantRain: React.FC<{ readonly frame: number; readonly center: V3; readonly size: V3; readonly dir?: V3; readonly count?: number; readonly opacity?: number; readonly seed?: number }> = ({
  frame,
  center,
  size,
  dir = [-0.7, -0.7, 0],
  count = 320,
  opacity = 0.42,
  seed = 5,
}) => {
  const base = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => [r(), r(), r(), 0.7 + r() * 0.6]);
  }, [count, seed]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 6), 3));
    return g;
  }, [count]);
  const arr = (geo.getAttribute("position") as BufferAttribute).array as Float32Array;
  const dl = Math.hypot(...dir) || 1;
  const u: V3 = [dir[0] / dl, dir[1] / dl, dir[2] / dl];
  const len = 0.45;
  const wrap = (v: number) => v - Math.floor(v);
  base.forEach((b, i) => {
    const t = frame * 0.03 * b[3];
    const x = center[0] + (wrap(b[0] + t * u[0] * 3) - 0.5) * size[0];
    const y = center[1] + (wrap(b[1] + t * u[1] * 3) - 0.5) * size[1];
    const z = center[2] + (wrap(b[2] + t * u[2] * 3) - 0.5) * size[2];
    arr.set([x, y, z, x - u[0] * len, y - u[1] * len, z - u[2] * len], i * 6);
  });
  (geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#DCEBFA" transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
};

/* ------------------------------------------------------------------ */
/* Licht + Grundstimmung                                                */
/* ------------------------------------------------------------------ */

/**
 * Tag (Wolkenlicht, weich) bzw. Abend (`dusk`): Hintergrund, Nebel, Himmel-/Boden-Licht, Schlüssellicht mit Schatten,
 * Gegenlicht für Konturen. `target` = Schattenmitte.
 */
export const TownLight: React.FC<{ readonly dusk?: number; readonly target?: V3; readonly fog?: readonly [number, number]; readonly sky?: boolean; readonly key?: number }> = ({ dusk = 0, target = [0, 0, 0], fog = [30, 150], sky = true, key: keyI = 1 }) => {
  const kt = useMemo(() => new Object3D(), []);
  const fogC = dusk > 0.5 ? "#8C7A9A" : "#C9DDEB";
  return (
    <>
      <color attach="background" args={[dusk > 0.5 ? G.duskTop : G.skyTop]} />
      <fog attach="fog" args={[fogC, fog[0], fog[1]]} />
      <hemisphereLight args={[dusk > 0.5 ? "#B9A8D8" : "#DCEBFF", dusk > 0.5 ? "#5A4048" : "#8A7A62", 1.35 - 0.35 * dusk]} />
      <primitive object={kt} position={target} />
      <directionalLight
        position={[target[0] + 10, target[1] + 16, target[2] + 12]}
        target={kt}
        color={dusk > 0.5 ? "#FFC9A8" : "#FFF3DE"}
        intensity={(2.6 - 1.1 * dusk) * keyI}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[target[0] - 8, target[1] + 6, target[2] - 12]} color={dusk > 0.5 ? "#B8A6FF" : "#CFE6FF"} intensity={1.1} />
      {sky ? <SkyDome dusk={dusk} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Zug der Schwerkraft (Bernstein)                                      */
/* ------------------------------------------------------------------ */

/**
 * Leuchtende Zuglinie von `from` nach `to` (Ziel = Marta), gebogen über `bend` (Versatz der Bogenmitte).
 * `width` Dicke, `reach` 0..1 = wie weit die Linie vom Ziel aus schon gewachsen ist, Pulse wandern zum Ziel.
 */
export const PullLine: React.FC<{ readonly from: V3; readonly to: V3; readonly bend?: V3; readonly width?: number; readonly reach?: number; readonly frame: number; readonly opacity?: number; readonly pulses?: number; readonly seed?: number }> = ({
  from,
  to,
  bend = [0, 0.6, 0],
  width = 0.05,
  reach = 1,
  frame,
  opacity = 0.9,
  pulses = 3,
  seed = 0,
}) => {
  const key = `${from.join()}|${to.join()}|${bend.join()}|${width}|${reach.toFixed(3)}`;
  const { core, glow, curve } = useMemo(() => {
    const mid = new Vector3((from[0] + to[0]) / 2 + bend[0], (from[1] + to[1]) / 2 + bend[1], (from[2] + to[2]) / 2 + bend[2]);
    // Kurve beginnt am Ziel (Marta) und wächst nach außen
    const full = new QuadraticBezierCurve3(new Vector3(...to), mid, new Vector3(...from));
    const pts = full.getPoints(40).slice(0, Math.max(2, Math.round(40 * Math.max(0.05, reach)) + 1));
    const c = new QuadraticBezierCurve3(pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1]);
    return { core: new TubeGeometry(c, 32, width, 6, false), glow: new TubeGeometry(c, 32, width * 3.2, 8, false), curve: c };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (reach <= 0.01 || opacity <= 0.01) return null;
  const dots: V3[] = [];
  for (let i = 0; i < pulses; i++) {
    const u = 1 - (((frame * 0.018 + i / pulses + seed * 0.13) % 1) + 1) % 1; // wandert vom Rand zum Ziel
    const p = curve.getPoint(u);
    dots.push([p.x, p.y, p.z]);
  }
  return (
    <group>
      <mesh geometry={core}>
        <meshBasicMaterial color={G.amberHot} transparent opacity={opacity} toneMapped={false} fog={false} />
      </mesh>
      <mesh geometry={glow}>
        <meshBasicMaterial color={G.amber} transparent opacity={0.28 * opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      {dots.map((d, i) => (
        <Halo key={i} at={d} size={width * 14} color={G.amberHot} opacity={0.85 * opacity} />
      ))}
    </group>
  );
};

/** Bündel von Zuglinien aus allen Richtungen zur Mitte `to` (Totale/Schüssel). */
export const PullFan: React.FC<{ readonly to: V3; readonly frame: number; readonly n?: number; readonly r?: number; readonly width?: number; readonly reach?: number; readonly opacity?: number; readonly rise?: number; readonly seed?: number }> = ({
  to,
  frame,
  n = 8,
  r = 14,
  width = 0.06,
  reach = 1,
  opacity = 0.85,
  rise = 0.5,
  seed = 1,
}) => {
  const rr = seeded(seed);
  const lines = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rr() * 0.4;
    const rad = r * (0.75 + rr() * 0.4);
    const from = onBowl(rad, a, 1.5 + rr() * 2.5 + rise * rad * 0.15);
    return { from, bend: [-Math.cos(a) * rad * 0.15, rad * 0.12, Math.sin(a) * rad * 0.15] as V3 };
  });
  return (
    <>
      {lines.map((l, i) => (
        <PullLine key={i} from={l.from} to={to} bend={l.bend} width={width} reach={reach} frame={frame} opacity={opacity} pulses={2} seed={i} />
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Ballon (Himmelblau = Leichtigkeit)                                   */
/* ------------------------------------------------------------------ */

export const Balloon: React.FC<{ readonly anchor: V3; readonly top: V3; readonly r?: number; readonly frame: number; readonly seed?: number; readonly color?: string }> = ({ anchor, top, r = 0.3, frame, seed = 0, color = G.balloon }) => {
  const sw = Math.sin(frame * 0.07 + seed * 1.7) * r * 0.25;
  const t: V3 = [top[0] + sw, top[1] + Math.sin(frame * 0.05 + seed) * r * 0.1, top[2] + Math.cos(frame * 0.06 + seed) * r * 0.15];
  return (
    <group>
      <Stick a={anchor} b={[t[0], t[1] - r * 1.05, t[2]]} r={0.008 + r * 0.01} color="#F4F4F4" />
      <group position={t}>
        <mesh scale={[1, 1.15, 1]} castShadow>
          <sphereGeometry args={[r, 20, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} emissive={color} emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[-r * 0.35, r * 0.45, r * 0.62]}>
          <sphereGeometry args={[r * 0.16, 10, 8]} />
          <meshBasicMaterial color={G.balloonHi} />
        </mesh>
        <mesh position={[0, -r * 1.12, 0]}>
          <coneGeometry args={[r * 0.12, r * 0.14, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Gesicht                                                              */
/* ------------------------------------------------------------------ */

export type EyesKind = "dot" | "wide" | "closed" | "happy";
export type MouthKind = "flat" | "smile" | "o" | "frown" | "grin";

const Eye: React.FC<{ readonly x: number; readonly z: number; readonly kind: EyesKind; readonly blink: boolean; readonly pop: number }> = ({ x, z, kind, blink, pop }) => {
  if (kind === "closed" || blink)
    return (
      <mesh position={[x, 0.04, z]}>
        <torusGeometry args={[0.06, 0.017, 6, 14, Math.PI]} />
        <meshBasicMaterial color={G.ink} />
      </mesh>
    );
  if (kind === "happy")
    return (
      <mesh position={[x, 0.03, z]}>
        <torusGeometry args={[0.066, 0.02, 6, 14, Math.PI]} />
        <meshBasicMaterial color={G.ink} />
      </mesh>
    );
  const s = (kind === "wide" ? 1.25 : 1) * pop;
  return (
    <group position={[x, 0.06, z]} scale={[s, s, 1]}>
      {kind === "wide" ? (
        <mesh position={[0, 0, -0.002]}>
          <circleGeometry args={[0.105, 22]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ) : null}
      <mesh>
        <circleGeometry args={[0.068, 22]} />
        <meshBasicMaterial color={G.ink} />
      </mesh>
      <mesh position={[0.022, 0.025, 0.002]}>
        <circleGeometry args={[0.021, 10]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

const Mouth: React.FC<{ readonly kind: MouthKind; readonly z: number }> = ({ kind, z }) => {
  if (kind === "o")
    return (
      <mesh position={[0, -0.2, z]}>
        <circleGeometry args={[0.065, 18]} />
        <meshBasicMaterial color="#3A1418" />
      </mesh>
    );
  if (kind === "flat")
    return (
      <mesh position={[0, -0.2, z]}>
        <planeGeometry args={[0.18, 0.032]} />
        <meshBasicMaterial color="#3A1418" />
      </mesh>
    );
  if (kind === "grin")
    return (
      <mesh position={[0, -0.16, z]} rotation={[0, 0, Math.PI]}>
        <circleGeometry args={[0.11, 20, 0, Math.PI]} />
        <meshBasicMaterial color="#3A1418" />
      </mesh>
    );
  const down = kind === "frown";
  return (
    <mesh position={[0, down ? -0.25 : -0.16, z]} rotation={[0, 0, down ? 0 : Math.PI]}>
      <torusGeometry args={[0.09, 0.02, 8, 18, Math.PI]} />
      <meshBasicMaterial color="#3A1418" />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Figuren                                                              */
/* ------------------------------------------------------------------ */

export type FolkKind = "marta" | "bo" | "towns";
export type FolkProps = {
  readonly frame: number;
  readonly kind: FolkKind;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly eyes?: EyesKind;
  readonly mouth?: MouthKind;
  /** Arme nach vorn [Bild links, Bild rechts] (rad) */
  readonly reach?: readonly [number, number];
  /** Arme seitlich (rad) */
  readonly spread?: readonly [number, number];
  readonly nod?: number;
  readonly look?: number;
  readonly tilt?: number;
  /** ganze Figur kippt (rad, um x) – z. B. zur Schüssel-Mitte gezogen */
  readonly lean?: number;
  readonly walk?: number;
  /** auf Zehenspitzen (0..1) */
  readonly tiptoe?: number;
  readonly sit?: boolean;
  readonly blinkSeed?: number;
  readonly eyePop?: number;
  readonly shirt?: string;
  /** Marta: Füllgrad der Schürzentaschen 0..1 (sichtbare Last) */
  readonly load?: number;
  /** Marta: Sack auf dem Rücken */
  readonly sack?: boolean;
  /** Ballon-Hut (Stadtleute) */
  readonly balloonHat?: boolean;
  /** Bo: Ballons an der Jacke (Anzahl) */
  readonly balloons?: number;
  /** Bo: Kappe auf (fliegt in `gust` weg) */
  readonly cap?: boolean;
  /** Ärmel hochgekrempelt (Marta in `marta`) */
  readonly sleeves?: boolean;
  readonly holdR?: React.ReactNode;
  readonly holdL?: React.ReactNode;
  /** leere, umgestülpte Hosentaschen */
  readonly emptyPockets?: boolean;
};

/**
 * Klotzfigur. Fußpunkt = position, Blick +z. Höhe ≈ 2,6 (Kopf-Oberkante) × scale.
 * Kopfmitte y 2,08, Gesicht z 0,47, Schulter (±0,56, 1,52). ALLE Erwachsenen (auch Marta) haben dieselben Maße.
 * Bo = kind "bo" mit scale ≈ 0,7 und etwas größerem Kopf (Kind).
 */
export const Folk: React.FC<FolkProps> = (p) => {
  const {
    frame,
    kind,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    eyes = "dot",
    mouth = "smile",
    reach = [0.12, 0.12],
    spread = [0.1, 0.1],
    nod = 0,
    look = 0,
    tilt = 0,
    lean = 0,
    walk = 0,
    tiptoe = 0,
    sit = false,
    blinkSeed = 1,
    eyePop = 1,
    load = 0,
    sack = false,
    balloonHat = false,
    balloons = 0,
    cap = true,
    sleeves = false,
    emptyPockets = false,
  } = p;
  const isM = kind === "marta";
  const isB = kind === "bo";
  const shirt = p.shirt ?? (isM ? G.marta : isB ? G.bo : G.towns[0]);
  const pants = isB ? G.boPants : isM ? "#4A3F48" : G.pants;
  const idle = Math.sin(frame * 0.06 + blinkSeed) * 0.012;
  const blink = eyes !== "closed" && blinkAt(frame, blinkSeed);
  const sw = walk > 0 ? Math.sin(frame * 0.32 * walk + blinkSeed) * 0.45 : 0;
  const hs = isB ? 1.12 : 1; // Kinderkopf etwas größer
  const fz = 0.47;
  const lift = tiptoe * 0.12;
  const head = (
    <group position={[0, 1.66, 0]} rotation={[nod, look, tilt]}>
      <group position={[0, 0.42, 0]} scale={hs}>
        <RoundedBox args={[1.0, 0.9, 0.92]} radius={0.16} smoothness={3} castShadow>
          <Plastic color={isM ? G.skin : isB ? "#F2C8A0" : G.skinB} rough={0.5} />
        </RoundedBox>
        {[-1, 1].map((sd) => (
          <mesh key={`ch${sd}`} position={[sd * 0.3, -0.1, fz + 0.001]}>
            <circleGeometry args={[0.075, 16]} />
            <meshBasicMaterial color="#F29A8A" transparent opacity={0.5} />
          </mesh>
        ))}
        <Eye x={-0.2} z={fz + 0.002} kind={eyes} blink={blink} pop={eyePop} />
        <Eye x={0.2} z={fz + 0.002} kind={eyes} blink={blink} pop={eyePop} />
        <Mouth kind={mouth} z={fz + 0.002} />
        {isM ? (
          <>
            {/* graue Haar-Kappe + Dutt-Klotz oben hinten */}
            <RoundedBox args={[1.04, 0.24, 0.96]} radius={0.08} position={[0, 0.38, -0.02]} castShadow>
              <Plastic color={G.bun} rough={0.7} />
            </RoundedBox>
            <RoundedBox args={[1.04, 0.6, 0.22]} radius={0.08} position={[0, 0.12, -0.38]}>
              <Plastic color={G.bun} rough={0.7} />
            </RoundedBox>
            <RoundedBox args={[0.42, 0.34, 0.42]} radius={0.14} position={[0, 0.62, -0.2]} castShadow>
              <Plastic color={G.bun} rough={0.7} />
            </RoundedBox>
            {/* runde kleine Brille */}
            {[-1, 1].map((sd) => (
              <mesh key={`gl${sd}`} position={[sd * 0.2, 0.06, fz + 0.012]}>
                <torusGeometry args={[0.105, 0.016, 6, 20]} />
                <meshStandardMaterial color="#4A3A34" metalness={0.5} roughness={0.4} />
              </mesh>
            ))}
          </>
        ) : isB ? (
          <>
            <RoundedBox args={[1.04, 0.2, 0.96]} radius={0.07} position={[0, 0.38, -0.02]}>
              <Plastic color="#5A3A24" rough={0.6} />
            </RoundedBox>
            {cap ? (
              <group position={[0, 0.5, 0.02]}>
                <RoundedBox args={[1.06, 0.26, 0.98]} radius={0.1} castShadow>
                  <Plastic color={G.cap} rough={0.45} />
                </RoundedBox>
                <mesh position={[0, -0.1, 0.62]}>
                  <boxGeometry args={[0.9, 0.06, 0.4]} />
                  <Plastic color={G.cap} rough={0.45} />
                </mesh>
              </group>
            ) : null}
          </>
        ) : (
          <>
            <RoundedBox args={[1.04, 0.2, 0.96]} radius={0.07} position={[0, 0.38, -0.02]}>
              <Plastic color={["#3A2A22", "#2E2420", "#6A4A30", "#8A8A8A"][blinkSeed % 4]} rough={0.6} />
            </RoundedBox>
            {balloonHat ? (
              <group position={[0, 0.52, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.34, 0.4, 0.22, 20]} />
                  <Plastic color="#F4F4F4" rough={0.5} />
                </mesh>
                <mesh position={[0, -0.1, 0]}>
                  <cylinderGeometry args={[0.6, 0.6, 0.04, 24]} />
                  <Plastic color="#F4F4F4" rough={0.5} />
                </mesh>
                <Balloon anchor={[-0.1, 0.12, 0]} top={[-0.42, 1.25, 0.05]} r={0.3} frame={frame} seed={blinkSeed} />
                <Balloon anchor={[0.1, 0.12, 0]} top={[0.4, 1.35, -0.05]} r={0.3} frame={frame} seed={blinkSeed + 3} />
              </group>
            ) : null}
          </>
        )}
      </group>
    </group>
  );
  const arm = (sd: -1 | 1, i: 0 | 1) => {
    const rx = -(reach[i] + (walk > 0 ? sd * sw * 0.6 : 0) + (i ? -idle : idle));
    const rz = sd * spread[i];
    return (
      <group key={`a${sd}`} position={[sd * 0.56, 1.52, 0]} rotation={[rx, 0, rz]}>
        <RoundedBox args={[0.3, 0.34, 0.32]} radius={0.09} position={[0, -0.12, 0]} castShadow>
          <Plastic color={shirt} />
        </RoundedBox>
        <RoundedBox args={[0.26, 0.4, 0.28]} radius={0.08} position={[0, -0.42, 0]} castShadow>
          <Plastic color={sleeves ? G.skin : shirt} rough={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.27, 0.25, 0.27]} radius={0.1} position={[0, -0.72, 0]} castShadow>
          <Plastic color={isM ? G.skin : isB ? "#F2C8A0" : G.skinB} rough={0.5} />
        </RoundedBox>
        <group position={[0, -0.82, 0.08]}>{i === 1 ? p.holdR : p.holdL}</group>
      </group>
    );
  };
  const leg = (sd: -1 | 1) => (
    <group key={`l${sd}`} position={[sd * 0.22, 0.72, 0]} rotation={[sit ? -Math.PI / 2 : sd * sw, 0, 0]}>
      <RoundedBox args={[0.32, 0.6, 0.34]} radius={0.09} position={[0, -0.32, 0]} castShadow>
        <Plastic color={pants} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.16, 0.46]} radius={0.06} position={[0, -0.64, 0.06]} rotation={[tiptoe * 0.5, 0, 0]} castShadow>
        <Plastic color={isB ? "#FFFFFF" : "#2A2224"} rough={0.5} />
      </RoundedBox>
    </group>
  );
  // Schürze + Taschen + Fundstücke (Last, kein Körper)
  const pocketS = 0.75 + 0.5 * load;
  const apron = isM ? (
    <group>
      <mesh position={[0, 1.08, 0.286]}>
        <planeGeometry args={[0.74, 0.72]} />
        <meshStandardMaterial color={G.apron} roughness={0.85} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={`pk${sd}`} position={[sd * 0.2, 0.92, 0.3]} scale={[1, pocketS, pocketS]}>
          <RoundedBox args={[0.32, 0.26, 0.12]} radius={0.05} castShadow>
            <meshStandardMaterial color={sd < 0 ? G.patch : G.apron} roughness={0.85} />
          </RoundedBox>
        </group>
      ))}
      {load > 0.05 ? (
        <>
          {/* Schlüsselbund (Messing dunkel), Teetasse, Hutkrempe ragen aus den Taschen */}
          <mesh position={[-0.26, 1.08 + 0.06 * load, 0.33]} rotation={[0, 0, 0.5]}>
            <torusGeometry args={[0.06, 0.018, 6, 14]} />
            <meshStandardMaterial color={G.brassDark} metalness={0.7} roughness={0.35} />
          </mesh>
          <Stick a={[-0.22, 1.08, 0.34]} b={[-0.12, 1.2 + 0.05 * load, 0.34]} r={0.018} color={G.brassDark} basic={false} />
          <mesh position={[0.2, 1.1 + 0.05 * load, 0.33]}>
            <cylinderGeometry args={[0.09, 0.07, 0.12, 14]} />
            <meshStandardMaterial color="#F6F2EA" roughness={0.3} />
          </mesh>
          <mesh position={[0.06, 1.06, 0.36]} rotation={[0.3, 0, 0.4]}>
            <cylinderGeometry args={[0.16, 0.16, 0.025, 18]} />
            <meshStandardMaterial color="#4E5A48" roughness={0.7} />
          </mesh>
        </>
      ) : null}
    </group>
  ) : null;
  const sackEl =
    isM && sack ? (
      <group position={[0, 1.2, -0.52]}>
        <RoundedBox args={[0.86, 0.9 + 0.2 * load, 0.6]} radius={0.24} smoothness={3} castShadow>
          <meshStandardMaterial color={G.sack} roughness={0.95} />
        </RoundedBox>
        <mesh position={[0, 0.5 + 0.1 * load, 0]}>
          <cylinderGeometry args={[0.16, 0.24, 0.16, 12]} />
          <meshStandardMaterial color="#8A6E48" roughness={0.95} />
        </mesh>
        {/* Gurte über die Schultern */}
        {[-1, 1].map((sd) => (
          <mesh key={`st${sd}`} position={[sd * 0.32, 0.3, 0.34]}>
            <boxGeometry args={[0.1, 0.5, 0.06]} />
            <meshStandardMaterial color="#6A5034" roughness={0.9} />
          </mesh>
        ))}
        {/* herausragende Fundstücke: Regenschirmgriff, Schuh */}
        <Stick a={[0.25, 0.4, 0]} b={[0.42, 0.95, 0.05]} r={0.03} color="#2E3A5A" basic={false} />
        <mesh position={[-0.28, 0.52, 0.05]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.16, 0.14, 0.3]} />
          <meshStandardMaterial color="#6E3A2A" roughness={0.7} />
        </mesh>
      </group>
    ) : null;
  // Bo: Ballons an der Jacke
  const boBalloons =
    isB && balloons > 0 ? (
      <group>
        {Array.from({ length: balloons }, (_, i) => {
          const a = (i / Math.max(1, balloons - 1) - 0.5) * 1.9;
          const anchor: V3 = [Math.sin(a) * 0.42, 1.45, -0.1];
          const top: V3 = [Math.sin(a) * 1.4, 3.6 + Math.cos(a * 1.3) * 0.5 + (i % 2) * 0.35, -0.4 + (i % 3) * 0.2];
          return <Balloon key={i} anchor={anchor} top={top} r={0.36} frame={frame} seed={i + 2} />;
        })}
      </group>
    ) : null;
  const torso = (
    <>
      <RoundedBox args={[0.9, 0.86, 0.56]} radius={0.12} position={[0, 1.16, 0]} castShadow receiveShadow>
        <Plastic color={shirt} />
      </RoundedBox>
      {isB ? (
        // Reißverschluss + Kapuzenkragen der Regenjacke
        <>
          <mesh position={[0, 1.16, 0.282]}>
            <planeGeometry args={[0.05, 0.8]} />
            <meshStandardMaterial color="#3E8A6E" />
          </mesh>
          <RoundedBox args={[0.82, 0.16, 0.5]} radius={0.06} position={[0, 1.6, -0.06]}>
            <Plastic color={shirt} />
          </RoundedBox>
        </>
      ) : null}
      {apron}
      {sackEl}
      {boBalloons}
      {head}
      {arm(-1, 0)}
      {arm(1, 1)}
    </>
  );
  const pocketsOut =
    emptyPockets ? (
      <>
        {[-1, 1].map((sd) => (
          <mesh key={`ep${sd}`} position={[sd * 0.47, 0.62, 0.1]} rotation={[0, 0, sd * 0.3]}>
            <boxGeometry args={[0.06, 0.2, 0.16]} />
            <meshStandardMaterial color="#F2EEE6" roughness={0.9} />
          </mesh>
        ))}
      </>
    ) : null;
  return (
    <group position={[position[0], position[1] + (sit ? -0.62 : idle + lift) * scale, position[2]]} rotation={rotation} scale={scale}>
      <group rotation={[lean, 0, 0]}>
        {torso}
        <RoundedBox args={[0.88, 0.26, 0.54]} radius={0.08} position={[0, 0.72, 0]} castShadow>
          <Plastic color={pants} />
        </RoundedBox>
        {pocketsOut}
        {leg(-1)}
        {leg(1)}
      </group>
    </group>
  );
};

/** Kopfmitte einer Folk-Figur in Weltkoordinaten (ohne Drehung). */
export const folkHead = (pos: V3, scale = 1, sit = false, kid = false): V3 => [pos[0], pos[1] + ((sit ? -0.62 : 0) + 2.08 + (kid ? 0.05 : 0)) * scale, pos[2]];

/** Orange Katze (Klotz), sitzend; `curl` 0..1 rollt sie ein (im Flug). */
export const Cat: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scale?: number; readonly frame: number; readonly eyes?: EyesKind; readonly curl?: number }> = ({ position, rotation = [0, 0, 0], scale = 1, frame, eyes = "dot", curl = 0 }) => {
  const tail = Math.sin(frame * 0.12) * 0.3;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[0.5, 0.46, 0.7]} radius={0.16} position={[0, 0.25, 0]} castShadow>
        <Plastic color={G.cat} rough={0.6} />
      </RoundedBox>
      <group position={[0, 0.62, 0.26]} rotation={[curl * 0.5, 0, 0]}>
        <RoundedBox args={[0.46, 0.38, 0.38]} radius={0.12} castShadow>
          <Plastic color={G.cat} rough={0.6} />
        </RoundedBox>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.15, 0.24, 0]} rotation={[0, 0, sd * -0.2]}>
            <coneGeometry args={[0.08, 0.16, 4]} />
            <Plastic color={G.cat} rough={0.6} />
          </mesh>
        ))}
        {[-1, 1].map((sd) =>
          eyes === "closed" ? (
            <mesh key={`e${sd}`} position={[sd * 0.1, 0.03, 0.195]}>
              <planeGeometry args={[0.08, 0.018]} />
              <meshBasicMaterial color={G.ink} />
            </mesh>
          ) : (
            <mesh key={`e${sd}`} position={[sd * 0.1, 0.03, 0.195]}>
              <circleGeometry args={[eyes === "wide" ? 0.05 : 0.035, 14]} />
              <meshBasicMaterial color={G.ink} />
            </mesh>
          ),
        )}
        <mesh position={[0, -0.05, 0.196]}>
          <circleGeometry args={[0.025, 10]} />
          <meshBasicMaterial color="#C2584A" />
        </mesh>
      </group>
      <group position={[0, 0.2, -0.34]} rotation={[0.9 - curl, tail, 0]}>
        <RoundedBox args={[0.12, 0.12, 0.55]} radius={0.05} position={[0, 0, -0.25]}>
          <Plastic color="#D8711F" rough={0.6} />
        </RoundedBox>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Fundstücke (Last)                                                    */
/* ------------------------------------------------------------------ */

export type JunkKind = "apple" | "hat" | "teapot" | "shoe" | "umbrella" | "wheel" | "briefcase" | "letter" | "key" | "coin" | "box";
export const Junk: React.FC<{ readonly kind: JunkKind; readonly position: V3; readonly rotation?: V3; readonly scale?: number }> = ({ kind, position, rotation = [0, 0, 0], scale = 1 }) => {
  let el: React.ReactNode = null;
  if (kind === "apple")
    el = (
      <>
        <mesh castShadow scale={[1, 0.92, 1]}>
          <sphereGeometry args={[0.22, 20, 16]} />
          <meshPhysicalMaterial color="#D8262E" roughness={0.3} clearcoat={1} />
        </mesh>
        <Stick a={[0, 0.17, 0]} b={[0.03, 0.3, 0]} r={0.016} color="#5A3A20" basic={false} />
        <mesh position={[0.09, 0.26, 0]} rotation={[0, 0, -0.8]} scale={[1, 0.45, 0.2]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#4E8A3A" />
        </mesh>
      </>
    );
  else if (kind === "hat")
    el = (
      <>
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 22]} />
          <meshStandardMaterial color="#4E5A48" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.27, 0.3, 18]} />
          <meshStandardMaterial color="#4E5A48" roughness={0.8} />
        </mesh>
      </>
    );
  else if (kind === "teapot")
    el = (
      <>
        <mesh castShadow scale={[1, 0.8, 1]}>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshPhysicalMaterial color="#5E8FA0" roughness={0.3} clearcoat={0.8} />
        </mesh>
        <Stick a={[0.2, 0, 0]} b={[0.42, 0.16, 0]} r={0.04} color="#5E8FA0" basic={false} />
        <mesh position={[-0.27, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.03, 6, 14]} />
          <meshStandardMaterial color="#5E8FA0" />
        </mesh>
      </>
    );
  else if (kind === "shoe")
    el = (
      <RoundedBox args={[0.22, 0.16, 0.42]} radius={0.06} castShadow>
        <meshStandardMaterial color="#6E3A2A" roughness={0.7} />
      </RoundedBox>
    );
  else if (kind === "umbrella")
    el = (
      <group rotation={[0, 0, 1.2]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <coneGeometry args={[0.55, 0.3, 8, 1, true]} />
          <meshStandardMaterial color="#2E3A5A" side={DoubleSide} roughness={0.6} />
        </mesh>
        <Stick a={[0, -0.45, 0]} b={[0, 0.55, 0]} r={0.02} color="#2A2224" basic={false} />
      </group>
    );
  else if (kind === "wheel")
    el = (
      <group rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.42, 0.045, 8, 28]} />
          <meshStandardMaterial color="#2A2A30" roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <boxGeometry args={[0.8, 0.015, 0.015]} />
            <meshStandardMaterial color="#B8B8C0" metalness={0.7} />
          </mesh>
        ))}
      </group>
    );
  else if (kind === "briefcase")
    el = (
      <>
        <RoundedBox args={[0.62, 0.44, 0.18]} radius={0.04} castShadow>
          <meshStandardMaterial color="#5A3A26" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0.27, 0]}>
          <torusGeometry args={[0.1, 0.025, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#3A2618" />
        </mesh>
      </>
    );
  else if (kind === "letter")
    el = (
      <mesh rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[0.5, 0.32]} />
        <meshStandardMaterial color="#E6DCC6" roughness={0.9} side={DoubleSide} />
      </mesh>
    );
  else if (kind === "key")
    el = (
      <>
        <mesh>
          <torusGeometry args={[0.07, 0.02, 6, 14]} />
          <meshStandardMaterial color={G.brassDark} metalness={0.7} roughness={0.35} />
        </mesh>
        <Stick a={[0.06, 0, 0]} b={[0.26, 0, 0]} r={0.018} color={G.brassDark} basic={false} />
      </>
    );
  else if (kind === "coin")
    el = (
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.025, 16]} />
        <meshStandardMaterial color="#B8A06A" metalness={0.8} roughness={0.3} />
      </mesh>
    );
  else
    el = (
      <RoundedBox args={[0.5, 0.4, 0.4]} radius={0.04} castShadow>
        <meshStandardMaterial color="#B08A5E" roughness={0.9} />
      </RoundedBox>
    );
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {el}
    </group>
  );
};

/** Stapel aufgefangener Dinge um Martas Veranda (`grow` 0..1 = Höhe des Stapels). */
const PILE: { kind: JunkKind; p: V3; r: V3 }[] = [
  { kind: "box", p: [-1.6, 0.2, 0.4], r: [0, 0.3, 0] },
  { kind: "umbrella", p: [-1.9, 0.5, 0.9], r: [0.3, 0, 0.2] },
  { kind: "wheel", p: [1.7, 0.42, 0.2], r: [0, 0.5, 0.3] },
  { kind: "teapot", p: [-1.3, 0.62, 0.5], r: [0, 1, 0] },
  { kind: "hat", p: [1.4, 0.06, 1.0], r: [0.2, 0, 0.1] },
  { kind: "shoe", p: [1.1, 0.1, 1.2], r: [0, 0.8, 0] },
  { kind: "briefcase", p: [-1.7, 0.85, 0.2], r: [0, 0.4, 0.2] },
  { kind: "box", p: [1.8, 0.95, -0.1], r: [0, -0.2, 0] },
  { kind: "hat", p: [-1.5, 1.2, 0.4], r: [0.4, 0, 0] },
  { kind: "teapot", p: [1.6, 1.4, 0.1], r: [0, 2, 0] },
  { kind: "shoe", p: [-1.2, 1.45, 0.6], r: [0.4, 0.3, 0] },
  { kind: "umbrella", p: [1.3, 1.7, 0.3], r: [0, 0, -0.4] },
];
export const Pile: React.FC<{ readonly position?: V3; readonly grow?: number; readonly take?: number }> = ({ position = [0, 0, 0], grow = 0.5, take = 0 }) => {
  const n = Math.round(PILE.length * grow);
  return (
    <group position={position}>
      {PILE.slice(0, n).map((j, i) => {
        // `take` 0..1: Marta rafft den Stapel an sich (Dinge fliegen zu ihr)
        const k = Math.min(1, Math.max(0, take * 1.6 - (i / PILE.length) * 0.6));
        const p: V3 = [j.p[0] * (1 - k), j.p[1] * (1 - k) + 1.1 * k + Math.sin(k * Math.PI) * 0.8, j.p[2] * (1 - k) + 0.3 * k];
        return k >= 0.98 ? null : <Junk key={i} kind={j.kind} position={p} rotation={j.r} scale={1 - 0.4 * k} />;
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Stadt                                                                */
/* ------------------------------------------------------------------ */

/** Klotzhaus (Terrakotta-Pastell) mit Satteldach; Ursprung = Bodenmitte, Front +z. */
export const Cottage: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly w?: number; readonly h?: number; readonly d?: number; readonly color: string; readonly roof?: string; readonly lit?: number; readonly seed?: number; readonly dusk?: number }> = ({
  position,
  rotation = [0, 0, 0],
  w = 2.6,
  h = 3.4,
  d = 2.6,
  color,
  roof = G.roof,
  lit = 0.3,
  seed = 1,
  dusk = 0,
}) => {
  const r = seeded(seed);
  const rows = Math.max(1, Math.floor((h - 1.0) / 1.2));
  const cols = w > 2.8 ? 2 : 1;
  const wins: { x: number; y: number; on: boolean }[] = [];
  for (let row = 0; row < rows; row++)
    for (let c = 0; c < cols; c++) wins.push({ x: cols === 1 ? -w * 0.2 : (c - 0.5) * (w * 0.48), y: 1.5 + row * 1.2, on: r() < lit + dusk * 0.4 });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <Matte color={color} rough={0.9} />
      </mesh>
      <mesh position={[0, h + w * 0.25, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[w * 0.62, w * 0.62, d + 0.4, 3, 1]} />
        <meshStandardMaterial color={roof} roughness={0.75} />
      </mesh>
      <mesh position={[w * 0.25, h + w * 0.42, -d * 0.15]} castShadow>
        <boxGeometry args={[0.32, 0.9, 0.32]} />
        <Matte color={G.trim} />
      </mesh>
      {wins.map((wi, i) => (
        <group key={i} position={[wi.x, wi.y, d / 2 + 0.01]}>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[0.78, 0.9]} />
            <Matte color={G.trim} />
          </mesh>
          <mesh>
            <planeGeometry args={[0.64, 0.76]} />
            {wi.on ? <meshStandardMaterial color="#FFE6C0" emissive="#FFD9A0" emissiveIntensity={0.7} toneMapped={false} /> : <meshStandardMaterial color="#3A4658" roughness={0.2} metalness={0.3} />}
          </mesh>
        </group>
      ))}
      <mesh position={[w * 0.22, 0.65, d / 2 + 0.01]}>
        <planeGeometry args={[0.66, 1.3]} />
        <Matte color={G.woodDark} />
      </mesh>
    </group>
  );
};

/** Laterne (lehnt zur Mitte, warmes Bernsteinlicht = Teil des Zugs). */
export const LeanLamp: React.FC<{ readonly position: V3; readonly lean?: V3; readonly on?: number; readonly height?: number; readonly light?: number }> = ({ position, lean = [0, 0, 0], on = 1, height = 3.6, light = 0 }) => (
  <group position={position} rotation={lean}>
    <mesh position={[0, height / 2, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.09, height, 8]} />
      <meshStandardMaterial color="#2A2426" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[0, height + 0.22, 0]}>
      <boxGeometry args={[0.36, 0.42, 0.36]} />
      <meshStandardMaterial color="#FFE6B8" emissive={G.amber} emissiveIntensity={1.6 * on} toneMapped={false} />
    </mesh>
    <mesh position={[0, height + 0.5, 0]}>
      <coneGeometry args={[0.3, 0.2, 4]} />
      <meshStandardMaterial color="#2A2426" metalness={0.5} roughness={0.5} />
    </mesh>
    {light > 0 ? <pointLight position={[0, height + 0.1, 0.2]} color={G.amber} intensity={light * on} distance={10} decay={2} /> : null}
    <Halo at={[0, height + 0.22, 0]} size={1.6} color={G.amber} opacity={0.45 * on} />
  </group>
);

/** Schüssel-Boden (Lathe) mit Pflaster + radiale Straßen. */
const BowlGround: React.FC<{ readonly rMax?: number; readonly dusk?: number }> = ({ rMax = 70, dusk = 0 }) => {
  const geo = useMemo(() => {
    const pts: Vector2[] = [];
    for (let i = 0; i <= 40; i++) {
      const r = (i / 40) * rMax;
      pts.push(new Vector2(r, bowlY(r)));
    }
    return new LatheGeometry(pts, 64);
  }, [rMax]);
  const tex = cobbleTex(60);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial map={tex} color={dusk > 0.5 ? "#C6B4C0" : "#FFFFFF"} roughness={0.35} metalness={0.12} side={DoubleSide} />
    </mesh>
  );
};

/** Ringe kippender Häuser + Laternen um die Mitte. `skipNear` lässt den vorderen Sektor (Winkel ≈ 0) frei. */
export const BowlTown: React.FC<{ readonly dusk?: number; readonly rings?: readonly number[]; readonly gap?: number; readonly gapAt?: number; readonly lampLight?: boolean }> = ({ dusk = 0, rings = [9, 14, 20, 27, 35, 44], gap = 0.55, gapAt = 0, lampLight = false }) => {
  const items = useMemo(() => {
    const r = seeded(99);
    const out: { pos: V3; rot: V3; w: number; h: number; color: string; roof: string; seed: number }[] = [];
    const lamps: { pos: V3; rot: V3 }[] = [];
    rings.forEach((rad, ri) => {
      const n = Math.round((2 * Math.PI * rad) / 3.6);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ri * 0.21;
        const da = Math.atan2(Math.sin(a - gapAt), Math.cos(a - gapAt));
        if (Math.abs(da) < gap) continue; // Hill Street bleibt frei (keine Masten quer vor der Kamera)
        const rr = rad + (r() - 0.5) * 1.2;
        const p = onBowl(rr, a, -0.2);
        const lean = slopeAt(rr) + 0.12 + r() * 0.08; // mehr als der Hang → kippt sichtbar zur Mitte
        const tilt = leanToCenter(p, lean);
        out.push({ pos: p, rot: [tilt[0], a, tilt[2]], w: 2.2 + r() * 1.2, h: 2.6 + r() * 2.2, color: G.walls[(i + ri) % G.walls.length], roof: r() < 0.7 ? G.roof : G.roofB, seed: ri * 50 + i });
      }
    });
    return { out, lamps };
  }, [rings, gap, gapAt]);
  return (
    <>
      <BowlGround dusk={dusk} />
      {items.out.map((h, i) => (
        // Front zur Mitte: Haus um a + π drehen; Neigung zur Mitte über eine äußere Gruppe
        <group key={i} position={h.pos} rotation={[h.rot[0], 0, h.rot[2]]}>
          <Cottage position={[0, 0, 0]} rotation={[0, h.rot[1] + Math.PI, 0]} w={h.w} h={h.h} color={h.color} roof={h.roof} seed={h.seed} dusk={dusk} />
        </group>
      ))}
      {items.lamps.map((l, i) => {
        const lean = leanToCenter(l.pos, slopeAt(Math.hypot(l.pos[0], l.pos[2])) + 0.28);
        return <LeanLamp key={`l${i}`} position={l.pos} lean={lean} light={lampLight && i < 4 ? 3 : 0} />;
      })}
    </>
  );
};

/** Laternen entlang der Hill Street (Winkel `a`), lehnen zur Mitte. */
export const StreetLamps: React.FC<{ readonly a?: number; readonly side?: number; readonly from?: number; readonly to?: number; readonly step?: number; readonly light?: number }> = ({ a = 0, side = 2.4, from = 4, to = 20, step = 4, light = 0 }) => {
  const out: React.ReactNode[] = [];
  for (let r = from, i = 0; r <= to; r += step, i++) {
    const sd = 1.25; // nur +x-Seite, weiter außen: Kameras auf der −x-Seite haben freie Sicht (Kontaktabzug r0: Mast quer im Bild)
    void i;
    const base = onBowl(r, a);
    const p: V3 = [base[0] + Math.cos(a) * side * sd, base[1], base[2] - Math.sin(a) * side * sd];
    out.push(<LeanLamp key={r} position={p} lean={leanToCenter(p, slopeAt(r) + 0.3)} light={light} />);
  }
  return <>{out}</>;
};

/** Martas Häuschen mit Veranda in der Mitte. Veranda-Boden y 0,18, Bank bei z −0,9. */
export const MartaHouse: React.FC<{ readonly dusk?: number; readonly porchLight?: number; readonly umbrella?: boolean; readonly photo?: boolean }> = ({ dusk = 0, porchLight = 1, umbrella = false, photo = false }) => (
  <group>
    <Cottage position={[0, 0, -3.4]} w={4.6} h={3.4} d={3.2} color="#F4DDB4" roof={G.roof} lit={0.9} seed={7} dusk={dusk} />
    {/* Veranda-Deck */}
    <mesh position={[0, 0.09, -0.6]} receiveShadow castShadow>
      <boxGeometry args={[5.4, 0.18, 2.6]} />
      <Matte color={G.wood} rough={0.8} />
    </mesh>
    {/* Vordach + Pfosten */}
    <mesh position={[0, 3.0, -0.7]} rotation={[0.18, 0, 0]} castShadow>
      <boxGeometry args={[5.6, 0.12, 2.8]} />
      <Matte color={G.roof} />
    </mesh>
    {[-2.5, 2.5].map((x) => (
      <mesh key={x} position={[x, 1.5, 0.55]} castShadow>
        <boxGeometry args={[0.16, 3.0, 0.16]} />
        <Matte color={G.woodDark} />
      </mesh>
    ))}
    {/* Bank */}
    <group position={[0, 0.18, -1.35]}>
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.1, 0.62]} />
        <Matte color={G.woodDark} />
      </mesh>
      <mesh position={[0, 0.95, -0.3]} castShadow>
        <boxGeometry args={[2.4, 0.7, 0.08]} />
        <Matte color={G.woodDark} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.44, 0.56]} />
          <Matte color={G.woodDark} />
        </mesh>
      ))}
    </group>
    {/* Stufen */}
    <mesh position={[0, 0.05, 0.95]} receiveShadow>
      <boxGeometry args={[1.6, 0.1, 0.6]} />
      <Matte color={G.wood} />
    </mesh>
    {/* Veranda-Licht (Bernstein = Mitte des Zugs) */}
    <mesh position={[1.6, 2.5, -1.75]}>
      <boxGeometry args={[0.3, 0.38, 0.3]} />
      <meshStandardMaterial color="#FFE6B8" emissive={G.amber} emissiveIntensity={1.8 * porchLight} toneMapped={false} />
    </mesh>
    <pointLight position={[1.4, 2.4, -0.9]} color={G.amber} intensity={5 * porchLight} distance={9} decay={2} />
    <Halo at={[1.6, 2.5, -1.75]} size={2.2} color={G.amber} opacity={0.6 * porchLight} />
    {/* Foto einer Umarmung an der Wand (lonely) */}
    {photo ? (
      <group position={[-1.3, 1.95, -1.78]}>
        <mesh>
          <planeGeometry args={[0.8, 0.62]} />
          <Matte color={G.woodDark} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.66, 0.48]} />
          <meshStandardMaterial color="#D8C8A8" roughness={0.9} />
        </mesh>
        {/* zwei Klotz-Silhouetten, die sich umarmen (verblasst) */}
        {[-0.08, 0.08].map((x, i) => (
          <group key={x} position={[x, -0.04, 0.02]} rotation={[0, 0, i ? -0.15 : 0.15]}>
            <mesh position={[0, 0.1, 0]}>
              <planeGeometry args={[0.14, 0.13]} />
              <meshBasicMaterial color="#9A8668" />
            </mesh>
            <mesh position={[0, -0.06, 0]}>
              <planeGeometry args={[0.16, 0.18]} />
              <meshBasicMaterial color="#9A8668" />
            </mesh>
          </group>
        ))}
      </group>
    ) : null}
    {umbrella ? null : null}
  </group>
);

/* ------------------------------------------------------------------ */
/* Stadtwaage mit Klapptafel                                            */
/* ------------------------------------------------------------------ */

const FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** Klapptafel-Text: vor `settle` laufen die Buchstaben durch, ab `settle + i·4` steht Buchstabe i fest. */
export const flapText = (target: string, frame: number, settle: number) =>
  target
    .split("")
    .map((ch, i) => (frame >= settle + i * 4 || ch === " " ? ch : FLAP[(Math.floor(frame / 2) * 7 + i * 5) % FLAP.length]))
    .join("");

/**
 * Messing-Stadtwaage (Ursprung = Bodenmitte, Front +z): Säule, großes Zifferblatt mit Zeiger (`needle` 0..1),
 * Schale mit einem Modell einer prall gefüllten Schürzentasche (LAST, nie Körper), oben die Klapptafel.
 */
export const TownScale: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly needle?: number; readonly name?: string; readonly scale?: number }> = ({ position, rotation = [0, 0, 0], needle = 0.8, name = "MARTA", scale = 1 }) => {
  const ang = 1.2 - needle * 2.4;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Sockel + Säule */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.5, 0.5, 24]} />
        <meshStandardMaterial color={G.brassDark} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 3.4, 16]} />
        <meshStandardMaterial color={G.brass} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Zifferblatt */}
      <group position={[0, 3.4, 0.45]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.2, 32]} />
          <meshStandardMaterial color={G.brass} metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <circleGeometry args={[0.9, 32]} />
          <meshStandardMaterial color="#F4ECD8" roughness={0.5} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const t = 1.2 - (i / 8) * 2.4;
          return (
            <mesh key={i} position={[Math.sin(t) * 0.72, Math.cos(t) * 0.72, 0.12]} rotation={[0, 0, -t]}>
              <planeGeometry args={[0.05, 0.16]} />
              <meshBasicMaterial color={G.ink} />
            </mesh>
          );
        })}
        <group position={[0, 0, 0.14]} rotation={[0, 0, -ang]}>
          <mesh position={[0, 0.34, 0]}>
            <planeGeometry args={[0.07, 0.7]} />
            <meshBasicMaterial color={G.marta} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.15]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={G.ink} />
        </mesh>
      </group>
      {/* Schale mit Taschen-Modell */}
      <group position={[0, 1.55, 1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.85, 0.6, 0.18, 24]} />
          <meshStandardMaterial color={G.brass} metalness={0.75} roughness={0.3} />
        </mesh>
        <RoundedBox args={[0.9, 0.62, 0.5]} radius={0.16} position={[0, 0.4, 0]} castShadow>
          <meshStandardMaterial color={G.patch} roughness={0.9} />
        </RoundedBox>
        <mesh position={[0.1, 0.78, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.16, 12]} />
          <meshStandardMaterial color="#F6F2EA" />
        </mesh>
        <mesh position={[-0.18, 0.74, 0.05]} rotation={[0, 0, 0.7]}>
          <torusGeometry args={[0.08, 0.022, 6, 12]} />
          <meshStandardMaterial color={G.brassDark} metalness={0.7} />
        </mesh>
        <Stick a={[0, 0.1, -0.9]} b={[0, 0.1, 0]} r={0.05} color={G.brass} basic={false} />
      </group>
      {/* Klapptafel (deckend, dunkel; Text ≥ 7 : 1) */}
      <group position={[0, 5.55, 0.2]}>
        <mesh position={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[4.4, 1.9, 0.14]} />
          <meshStandardMaterial color={G.brassDark} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh>
          <planeGeometry args={[4.15, 1.68]} />
          <meshBasicMaterial color={G.plate} toneMapped={false} />
        </mesh>
        <TextLabel text="CENTER OF GRAVITY" width={3.9} height={0.42} position={[0, 0.5, 0.02]} color="#FFFFFF" />
        {name.split("").map((ch, i) => (
          <group key={i} position={[(i - (name.length - 1) / 2) * 0.74, -0.25, 0.02]}>
            <mesh>
              <planeGeometry args={[0.66, 0.86]} />
              <meshBasicMaterial color="#1C2236" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.004]}>
              <planeGeometry args={[0.66, 0.025]} />
              <meshBasicMaterial color="#05070E" toneMapped={false} />
            </mesh>
            <TextLabel text={ch} width={0.62} height={0.8} position={[0, 0, 0.01]} color={G.amberHot} />
          </group>
        ))}
      </group>
      <Stick a={[-1.6, 4.6, 0.1]} b={[-1.6, 3.6, 0.1]} r={0.06} color={G.brass} basic={false} />
      <Stick a={[1.6, 4.6, 0.1]} b={[1.6, 3.6, 0.1]} r={0.06} color={G.brass} basic={false} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Anzeige-Tafel im Bild (HUD „BO“ / „CENTER OF GRAVITY“)               */
/* ------------------------------------------------------------------ */

/** Deckende dunkle Tafel mit Bernstein-Rand: Zeile `label` (weiß) + Wert (Farbe je Zustand). Breite 3,2 × scale. */
export const Board: React.FC<{ readonly label: string; readonly value: string; readonly position: V3; readonly rotation?: V3; readonly scale?: number; readonly pop?: number; readonly color?: string }> = ({
  label,
  value,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  pop = 1,
  color = G.amberHot,
}) => {
  if (pop <= 0.01) return null;
  const k = Math.min(1, pop);
  const s = scale * (0.6 + 0.4 * k) * (1 + Math.max(0, Math.sin(k * Math.PI)) * 0.08);
  return (
    <group position={position} rotation={rotation} scale={s}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[3.34, 1.64]} />
        <meshBasicMaterial color={G.amber} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.2, 1.5]} />
        <meshBasicMaterial color={G.plate} toneMapped={false} />
      </mesh>
      <TextLabel text={label} width={2.9} height={0.4} position={[0, 0.42, 0.01]} color="#FFFFFF" />
      <TextLabel text={value} width={2.9} height={0.78} position={[0, -0.2, 0.01]} color={color} />
    </group>
  );
};

/** Zustände der Bo-Anzeige je Szene (Wert genau ab dem Cue-Wort, Paket §3 / Drehbuch cues). */
export const BO_STATES: Record<string, { readonly start: string; readonly at?: { readonly beat: string; readonly value: string } }> = {
  rehook: { start: "", at: { beat: "balloonStringSlips", value: "GROUNDED" } },
  bo: { start: "GROUNDED" },
  gust: { start: "GROUNDED", at: { beat: "gustHits", value: "FLOATING" } },
  town: { start: "FLOATING", at: { beat: "crowdReaches", value: "TOO HIGH" } },
  marta: { start: "TOO HIGH", at: { beat: "martaScoopsPile", value: "SLOWING" } },
  turn: { start: "SLOWING", at: { beat: "boTurnsAndFalls", value: "FALLING" } },
  catch: { start: "FALLING", at: { beat: "boLandsInArms", value: "SAFE" } },
};
export const boState = (scene: string, frame: number, beat: (n: string) => number) => {
  const s = BO_STATES[scene];
  if (!s) return "";
  return s.at && frame >= beat(s.at.beat) ? s.at.value : s.start;
};
/** Farbe je Zustand: Blau = Leichtigkeit, Warnrot = Gefahr, Bernstein = der Zug greift, Hellgelb = sicher. */
export const boColor = (v: string) => (v === "FLOATING" ? G.balloon : v === "TOO HIGH" ? G.warn : v === "SLOWING" || v === "FALLING" ? G.amberHot : v === "SAFE" ? G.safe : "#FFFFFF");

/** Kleine Hand (Fäustling) mit Unterarm, Ursprung = Handmitte, Arm kommt von +y/−z. */
export const Mitten: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scale?: number; readonly open?: number; readonly color?: string; readonly sleeve?: string }> = ({ position, rotation = [0, 0, 0], scale = 1, open = 0, color = G.skinB, sleeve = G.towns[3] }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[0.42, 0.36, 0.4]} radius={0.14} castShadow>
      <Plastic color={color} rough={0.5} />
    </RoundedBox>
    {/* Daumen klappt beim Loslassen ab */}
    <RoundedBox args={[0.14, 0.2, 0.16]} radius={0.06} position={[0.24, -0.04 - open * 0.06, 0.08]} rotation={[0, 0, -0.4 - open * 0.6]} castShadow>
      <Plastic color={color} rough={0.5} />
    </RoundedBox>
    <RoundedBox args={[0.34, 0.9, 0.34]} radius={0.1} position={[0, 0.6, -0.06]} castShadow>
      <Plastic color={sleeve} />
    </RoundedBox>
  </group>
);

