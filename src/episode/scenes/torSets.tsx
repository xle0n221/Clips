/**
 * „In This City, the Gate Needs 1,000 Yeses“ (episodes/tor-stadt.json) – Bau-Kit der Stadt Yesbury.
 *
 * Stil (Drehbuch `style`): Cinematic 3D wie Zeit-Welt/Sonne (PBR-Kunststoff, Volumenlicht, Staub, Filmkorn) mit EIGENEN
 * Klotzfiguren: PIP (junge Frau, Würfelkopf, senfgelber Regenmantel, türkiser Schal, rote Stiefel, später türkise Farbe an
 * den Fingern) und MISTER HOLLIS (hoher schmaler Kasten, grauer Schnurrbart-Klotz, buschige Brauen, marineblaue Uniform mit
 * Messingknöpfen, Schirmmütze, riesiger Schlüsselring). Einwohner = einfache Klötze (instanziert), grüne YES-Kellen, eine rote NO-Kelle.
 * Kein Noppen-Kopf, keine Avatar-Proportionen, keine Marken.
 * Farblogik: TERRAKOTTA/CREME = die Stadt drinnen · TÜRKIS = das Meer (nur gemalt auf dem Tor und das echte Meer) ·
 * MESSING/BERNSTEIN = die Abstimmung (Tor, Zähler, Stoppuhr) · VIOLETT = Pips Tiefpunkt (Abend) · GRÜN/ROT nur an den Kellen.
 * Schlüsselobjekt: das runde Messing-Tor mit gemaltem Meer und dem Zähler „YES ___ / 1,000“ darüber.
 * Alles aus dem Frame berechnet (kein useEffect, Zufall nur mit Seed).
 */
import { RoundedBox } from "@react-three/drei";
import React, { useMemo } from "react";
import { BackSide, CanvasTexture, Color, DoubleSide, InstancedMesh, Matrix4, Object3D, RepeatWrapping, Shape, SRGBColorSpace, Path } from "three";
import { V3 } from "../kit/camera";
import { blinkAt } from "../kit/motion";
import { seeded } from "../kit/toon";
import { Matte, Plastic } from "./sonneSets";
import { Halo, TextLabel } from "./zeitweltSets";

export { Atmos, cut, fly, frameOn, Halo, lerp, lerp3, LightShaft, Motes, ramp, TextLabel } from "./zeitweltSets";
export { atScreen, faceTo, Glow, Gull, Matte, Plastic } from "./sonneSets";

/* ------------------------------------------------------------------ */
/* Palette                                                              */
/* ------------------------------------------------------------------ */

export const T = {
  sky: "#BFDDEB",
  skyWarm: "#F3D9B0",
  dusk: "#3B2A5C",
  duskDeep: "#1E1638",
  duskGlow: "#C77BA8",
  ground: "#C9A27A",
  groundDark: "#9C7A58",
  wall: "#E6CFA8",
  wallShade: "#C9AE86",
  terra: "#C8643C",
  terraDark: "#9C4A2C",
  cream: "#EBDDC2",
  roof: "#B5532F",
  brass: "#C9A04A",
  brassDark: "#8C6A2A",
  amber: "#FFC94A",
  counterBg: "#1B130A",
  sea: "#1AA6A0",
  seaDeep: "#0E6F78",
  seaLight: "#7FD9CF",
  foam: "#F5FBF8",
  yes: "#3DB45A",
  no: "#E0392E",
  skin: "#F0C49C",
  skinB: "#D9A47A",
  coat: "#D9A21F",
  coatDark: "#B5841A",
  scarf: "#17A3A0",
  boots: "#D0342C",
  hair: "#4A2C1A",
  navy: "#1F2E57",
  navyDark: "#141E3C",
  grey: "#B9BCC4",
  wood: "#8A5A34",
  woodDark: "#5A3A22",
  card: "#D9B07A",
  paper: "#F4ECD8",
  poster: "#F7D347",
  rust: "#5A2E1C",
  ink: "#17120E",
  white: "#FFFFFF",
} as const;

/* ------------------------------------------------------------------ */
/* Orte (Weltkoordinaten der Stadt; Tor in der Mauer bei z = 0, Stadt bei z > 0)                         */
/* ------------------------------------------------------------------ */

export const GATE_C: V3 = [0, 3.4, 0];
export const GATE_R = 3.0;
/** Mitte der Zähler-Tafel über dem Tor */
export const COUNTER_C: V3 = [0, 7.75, 0.42];
/** Torwächter-Häuschen rechts neben dem Tor (Fußpunkt) */
export const BOOTH: V3 = [6.6, 0, 1.6];
/** Regel-Tafel (links am Tor) und Rostschild (rechts) */
export const RULE_PLATE: V3 = [-3.55, 4.6, 0.08];
export const PLAQUE: V3 = [3.55, 2.1, 0.08];
/** Pip vor dem Tor (Hook/Stakes) */
export const PIP_GATE: V3 = [0.95, 0, 1.5];
/** Stoppuhr am Mast (Fußpunkt), Zifferblatt bei y 4,6 */
export const STOPWATCH: V3 = [-5.6, 0, 5.2];
/** Menge: vordere Reihe bei z 7, nach hinten bis ~z 23 */
export const CROWD_Z0 = 7;

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

/** Gemaltes Meer auf den Torflügeln (UV der Kreisscheibe: u = Bild links→rechts, v = unten→oben). `gap` = Stelle, an der Pips Farbe abging. */
export const paintedSeaTex = (gap: boolean) =>
  canvasTex(`sea-${gap}`, 512, 512, (c) => {
    const W = 512;
    // Himmel (oben) – blasses Creme-Blau mit Wolken
    const g = c.createLinearGradient(0, 0, 0, W * 0.5);
    g.addColorStop(0, "#E9F2EC");
    g.addColorStop(1, "#BFE3DD");
    c.fillStyle = g;
    c.fillRect(0, 0, W, W * 0.5);
    c.fillStyle = "#FFFFFF";
    for (const [x, y, r] of [[120, 120, 34], [160, 112, 44], [205, 122, 30], [360, 80, 26], [392, 74, 34], [424, 84, 24]] as const) {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    // gemalte Sonne
    c.fillStyle = "#F6D58A";
    c.beginPath();
    c.arc(300, 170, 40, 0, Math.PI * 2);
    c.fill();
    // Meer (unten) – Türkis mit Bändern und weißen Wellenkringeln
    const s = c.createLinearGradient(0, W * 0.5, 0, W);
    s.addColorStop(0, "#2DBDB3");
    s.addColorStop(1, "#0F7F84");
    c.fillStyle = s;
    c.fillRect(0, W * 0.5, W, W * 0.5);
    c.strokeStyle = "#F5FBF8";
    c.lineWidth = 9;
    c.lineCap = "round";
    const r = seeded(7);
    for (let row = 0; row < 6; row++) {
      const y = W * 0.56 + row * 38;
      for (let k = 0; k < 6; k++) {
        const x = (k + (row % 2) * 0.5) * 92 + r() * 20 - 10;
        c.beginPath();
        c.arc(x, y, 18 + row * 2, Math.PI * 1.05, Math.PI * 1.95);
        c.stroke();
      }
    }
    // alte Abplatzer (nacktes Messing)
    c.fillStyle = "#B8913F";
    const q = seeded(11);
    for (let i = 0; i < 26; i++) {
      const x = q() * W;
      const y = q() * W;
      c.beginPath();
      c.ellipse(x, y, 4 + q() * 9, 3 + q() * 6, q() * 3, 0, Math.PI * 2);
      c.fill();
    }
    if (gap) {
      // Lücke, wo Pips Farbflocken abgingen (rechter Flügel, Handhöhe)
      c.fillStyle = "#B8913F";
      c.beginPath();
      c.ellipse(345, 410, 34, 24, 0.4, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(372, 392, 16, 12, 0.2, 0, Math.PI * 2);
      c.fill();
    }
  });

const cobbleTex = () =>
  canvasTex(
    "cobble",
    256,
    256,
    (c) => {
      c.fillStyle = "#B8916A";
      c.fillRect(0, 0, 256, 256);
      const r = seeded(5);
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          const v = 190 + Math.floor(r() * 30);
          c.fillStyle = `rgb(${v + 20},${v - 10},${v - 50})`;
          const ox = (y % 2) * 16;
          c.beginPath();
          c.roundRect?.(x * 32 + ox + 2, y * 32 + 2, 28, 28, 8);
          c.fill();
        }
    },
    [24, 24],
  );

const gradTex = (key: string, top: string, bottom: string, mid?: string) =>
  canvasTex(key, 4, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    if (mid) g.addColorStop(0.55, mid);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 256);
  });

/** Strichliste fürs Klemmbrett: 1.000 Häkchen in Reihen (reine Linien, keine Schrift). */
const tickTex = () =>
  canvasTex("ticks", 256, 320, (c) => {
    c.fillStyle = T.paper;
    c.fillRect(0, 0, 256, 320);
    c.strokeStyle = "#2E7D3A";
    c.lineWidth = 3;
    for (let row = 0; row < 18; row++)
      for (let k = 0; k < 14; k++) {
        const x = 14 + k * 17;
        const y = 22 + row * 16.5;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 4, y + 5);
        c.lineTo(x + 11, y - 5);
        c.stroke();
      }
  });

/** Himmelskuppel (Verlauf), Radius r, folgt nicht der Kamera. */
export const SkyDome: React.FC<{ readonly top: string; readonly bottom: string; readonly mid?: string; readonly radius?: number; readonly center?: V3 }> = ({ top, bottom, mid, radius = 160, center = [0, 0, 0] }) => (
  <mesh position={center}>
    <sphereGeometry args={[radius, 32, 16]} />
    <meshBasicMaterial map={gradTex(`sky-${top}-${bottom}-${mid}`, top, bottom, mid)} side={BackSide} fog={false} toneMapped={false} />
  </mesh>
);

/* ------------------------------------------------------------------ */
/* Gesicht + Figur                                                      */
/* ------------------------------------------------------------------ */

export type Eyes = "dot" | "wide" | "closed" | "happy" | "sad";
export type Mouth = "flat" | "smile" | "o" | "frown" | "grin" | "yell";

const FaceEye: React.FC<{ readonly x: number; readonly kind: Eyes; readonly blink: boolean; readonly pop: number }> = ({ x, kind, blink, pop }) => {
  const z = 0.476;
  if (kind === "closed" || blink)
    return (
      <mesh position={[x, 0.06, z]}>
        <planeGeometry args={[0.16, 0.03]} />
        <meshBasicMaterial color={T.ink} />
      </mesh>
    );
  if (kind === "happy")
    return (
      <mesh position={[x, 0.03, z]}>
        <torusGeometry args={[0.07, 0.022, 8, 16, Math.PI]} />
        <meshBasicMaterial color={T.ink} />
      </mesh>
    );
  const s = (kind === "wide" ? 1.25 : 1) * pop;
  return (
    <group position={[x, kind === "sad" ? 0.03 : 0.06, z]} scale={[s, s, 1]}>
      {kind === "wide" ? (
        <mesh position={[0, 0, -0.002]}>
          <circleGeometry args={[0.11, 24]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ) : null}
      <mesh>
        <circleGeometry args={[0.068, 24]} />
        <meshBasicMaterial color={T.ink} />
      </mesh>
      <mesh position={[0.022, 0.025, 0.002]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

const FaceMouth: React.FC<{ readonly kind: Mouth; readonly talk: number }> = ({ kind, talk }) => {
  const z = 0.476;
  if (kind === "yell")
    return (
      <group position={[0, -0.22, z]}>
        <mesh scale={[1.3, 1.1, 1]}>
          <circleGeometry args={[0.11, 24]} />
          <meshBasicMaterial color="#3A1214" />
        </mesh>
        <mesh position={[0, -0.05, 0.001]} scale={[1, 0.5, 1]}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color="#C8505A" />
        </mesh>
      </group>
    );
  if (talk > 0.08 || kind === "o")
    return (
      <mesh position={[0, -0.22, z]} scale={[1, kind === "o" ? 1 : 0.4 + talk, 1]}>
        <circleGeometry args={[0.075, 20]} />
        <meshBasicMaterial color="#2A1416" />
      </mesh>
    );
  if (kind === "flat")
    return (
      <mesh position={[0, -0.22, z]}>
        <planeGeometry args={[0.2, 0.035]} />
        <meshBasicMaterial color="#2A1416" />
      </mesh>
    );
  const down = kind === "frown";
  const wide = kind === "grin" ? 1.45 : 1;
  return (
    <mesh position={[0, down ? -0.27 : -0.17, z]} rotation={[0, 0, down ? 0 : Math.PI]} scale={[wide, 1, 1]}>
      <torusGeometry args={[0.1, 0.024, 8, 20, Math.PI]} />
      <meshBasicMaterial color="#2A1416" />
    </mesh>
  );
};

export type Who = "pip" | "hollis" | "baker" | "granny" | "twin" | "towns";
type Look = { shirt: string; pants: string; skin: string; hair: string; torsoW: number; torsoH: number; legLen: number };
const LOOKS: Record<Who, Look> = {
  pip: { shirt: T.coat, pants: "#3A3550", skin: T.skin, hair: T.hair, torsoW: 1.0, torsoH: 1.08, legLen: 0.8 },
  hollis: { shirt: T.navy, pants: T.navyDark, skin: "#EBC29B", hair: T.grey, torsoW: 0.84, torsoH: 1.5, legLen: 0.98 },
  baker: { shirt: "#EDE8DE", pants: "#4A4A52", skin: "#EFC2A0", hair: "#3A2A20", torsoW: 1.12, torsoH: 1.1, legLen: 0.78 },
  granny: { shirt: "#9A7AA6", pants: "#4A3E52", skin: "#EFC9A8", hair: "#D8D8DC", torsoW: 1.0, torsoH: 1.02, legLen: 0.72 },
  twin: { shirt: "#5E8F4A", pants: "#3A3F48", skin: "#E7B98F", hair: "#2E2420", torsoW: 0.96, torsoH: 0.95, legLen: 0.7 },
  towns: { shirt: T.terra, pants: "#5A4A3E", skin: T.skin, hair: "#3A2A22", torsoW: 1.02, torsoH: 1.08, legLen: 0.8 },
};

/** Kopfmitte über dem Fußpunkt (ohne Drehung/Neigung). */
export const headY = (who: Who) => {
  const L = LOOKS[who];
  return L.legLen + L.torsoH + 0.52;
};
export const headOf = (who: Who, pos: V3, scale = 1): V3 => [pos[0], pos[1] + headY(who) * scale, pos[2]];

export type BlokProps = {
  readonly frame: number;
  readonly who: Who;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly eyes?: Eyes;
  readonly mouth?: Mouth;
  /** Arme nach vorn heben (rad; 0 = hängt, π = senkrecht hoch) [Bild links, Bild rechts] */
  readonly reach?: readonly [number, number];
  readonly spread?: readonly [number, number];
  readonly walk?: number;
  readonly look?: number;
  readonly nod?: number;
  readonly lean?: number;
  readonly blinkSeed?: number;
  readonly eyePop?: number;
  readonly talk?: number;
  readonly brow?: number;
  readonly holdR?: React.ReactNode;
  readonly holdL?: React.ReactNode;
  readonly sit?: boolean;
  /** türkise Farbe an den Fingern (0..1) */
  readonly paint?: number;
  /** Schal-Ende weht (0..1) */
  readonly scarfFly?: number;
  /** Mütze auf dem Kopf (Hollis; false = fliegt separat) */
  readonly cap?: boolean;
  readonly shirt?: string;
};

/** Klotzfigur (eigenes Design). Fußpunkt = position, Blick nach +z. Kopfmitte bei `headY(who)`. */
export const Blok: React.FC<BlokProps> = (p) => {
  const L = LOOKS[p.who];
  const {
    frame,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    eyes = "dot",
    mouth = "smile",
    reach = [0.12, 0.12],
    spread = [0.08, 0.08],
    walk = 0,
    look = 0,
    nod = 0,
    lean = 0,
    blinkSeed = 1,
    eyePop = 1,
    talk = 0,
    brow = 0,
    sit = false,
    paint = 0,
    scarfFly = 0,
    cap = true,
  } = p;
  const shirt = p.shirt ?? L.shirt;
  const ph = frame * 0.34 * (walk || 0);
  const legA = walk ? Math.sin(ph) * 0.6 : 0;
  const bob = walk ? Math.abs(Math.cos(ph)) * 0.08 : Math.sin(frame * 0.06 + blinkSeed) * 0.012;
  const armSwing = walk ? Math.sin(ph) * 0.5 : Math.sin(frame * 0.05 + blinkSeed) * 0.03;
  const blink = eyes !== "closed" && blinkAt(frame, blinkSeed);
  const hY = headY(p.who);
  const torsoY = L.legLen + L.torsoH / 2 + 0.1;
  const shoulderY = L.legLen + L.torsoH - 0.06;
  const armX = L.torsoW / 2 + 0.2;
  const isHollis = p.who === "hollis";
  const isPip = p.who === "pip";
  const head = (
    <group position={[0, hY, 0]} rotation={[nod, look, 0]}>
      <RoundedBox args={[1.22, 1.0, 0.95]} radius={0.2} smoothness={3} castShadow>
        <Plastic color={L.skin} rough={0.5} />
      </RoundedBox>
      <FaceEye x={-0.25} kind={eyes} blink={blink} pop={eyePop} />
      <FaceEye x={0.25} kind={eyes} blink={blink} pop={eyePop} />
      <FaceMouth kind={mouth} talk={talk} />
      {/* Brauen (Hollis buschig grau) */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.25, 0.25 + (eyes === "wide" ? 0.05 : 0) + (eyes === "sad" ? -0.02 : 0), 0.48]} rotation={[0, 0, sd * (brow + (eyes === "sad" ? -0.5 : 0)) * 0.35]}>
          <planeGeometry args={[isHollis ? 0.3 : 0.18, isHollis ? 0.11 : 0.035]} />
          <meshBasicMaterial color={isHollis ? T.grey : "#3A2A20"} />
        </mesh>
      ))}
      {isHollis ? (
        <>
          {/* Schnurrbart-Klotz */}
          <RoundedBox args={[0.62, 0.16, 0.12]} radius={0.05} position={[0, -0.1, 0.5]}>
            <Plastic color={T.grey} rough={0.8} />
          </RoundedBox>
          {cap ? <HollisCap /> : null}
        </>
      ) : null}
      {isPip ? (
        <>
          {/* Bob-Frisur: Kappe + Seitenklötze + Pony-Kante */}
          <RoundedBox args={[1.32, 0.38, 1.04]} radius={0.15} position={[0, 0.38, -0.03]} castShadow>
            <Plastic color={L.hair} rough={0.6} />
          </RoundedBox>
          {[-1, 1].map((sd) => (
            <RoundedBox key={sd} args={[0.2, 0.7, 1.0]} radius={0.08} position={[sd * 0.62, -0.02, -0.04]}>
              <Plastic color={L.hair} rough={0.6} />
            </RoundedBox>
          ))}
          <RoundedBox args={[1.3, 0.72, 0.2]} radius={0.08} position={[0, 0.0, -0.5]}>
            <Plastic color={L.hair} rough={0.6} />
          </RoundedBox>
        </>
      ) : null}
      {p.who === "baker" ? (
        <mesh position={[0, 0.74, 0]}>
          <cylinderGeometry args={[0.56, 0.42, 0.56, 24]} />
          <Plastic color="#F4F1EA" rough={0.8} />
        </mesh>
      ) : null}
      {p.who === "granny" ? (
        <>
          <RoundedBox args={[1.3, 0.32, 1.02]} radius={0.14} position={[0, 0.42, -0.03]}>
            <Plastic color={L.hair} rough={0.8} />
          </RoundedBox>
          <mesh position={[0, 0.66, -0.22]}>
            <sphereGeometry args={[0.24, 16, 12]} />
            <Plastic color={L.hair} rough={0.8} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.25, 0.06, 0.49]}>
              <torusGeometry args={[0.13, 0.016, 8, 24]} />
              <meshStandardMaterial color="#3A3036" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
        </>
      ) : null}
      {p.who === "twin" || p.who === "towns" ? (
        <RoundedBox args={[1.28, 0.3, 1.0]} radius={0.12} position={[0, 0.44, -0.02]}>
          <Plastic color={L.hair} rough={0.7} />
        </RoundedBox>
      ) : null}
    </group>
  );
  const arm = (sd: -1 | 1, i: 0 | 1) => (
    <group key={sd} position={[sd * armX, shoulderY, 0]} rotation={[-(reach[i] + (i ? armSwing : -armSwing)), 0, sd * spread[i]]}>
      <RoundedBox args={[0.3, 0.86, 0.32]} radius={0.12} position={[0, -0.4, 0]} castShadow>
        <Plastic color={shirt} />
      </RoundedBox>
      <mesh position={[0, -0.88, 0]} castShadow>
        <sphereGeometry args={[0.19, 16, 12]} />
        <Plastic color={L.skin} rough={0.5} />
      </mesh>
      {paint > 0.02
        ? [0, 1, 2].map((k) => (
            <mesh key={k} position={[(k - 1) * 0.09, -1.0 + (k % 2) * 0.04, 0.12]} scale={paint}>
              <sphereGeometry args={[0.065, 10, 8]} />
              <meshStandardMaterial color={T.sea} roughness={0.4} />
            </mesh>
          ))
        : null}
      <group position={[0, -0.95, 0.08]}>{i === 1 ? p.holdR : p.holdL}</group>
    </group>
  );
  const bootC = isPip ? T.boots : "#1E1A1A";
  const leg = (sd: -1 | 1) => (
    <group key={sd} position={[sd * 0.25, L.legLen, 0]} rotation={[sit ? -1.45 : sd * legA, 0, 0]}>
      <RoundedBox args={[0.38, L.legLen - 0.06, 0.42]} radius={0.12} position={[0, -L.legLen / 2 + 0.04, 0]} castShadow>
        <Plastic color={L.pants} />
      </RoundedBox>
      <RoundedBox args={[0.42, isPip ? 0.34 : 0.16, 0.54]} radius={0.07} position={[0, -L.legLen + 0.08 + (isPip ? 0.09 : 0), 0.05]} castShadow>
        <Plastic color={bootC} rough={0.45} />
      </RoundedBox>
    </group>
  );
  return (
    <group position={[position[0], position[1] + bob * scale, position[2]]} rotation={rotation} scale={scale}>
      <group rotation={[lean, 0, 0]}>
        <RoundedBox args={[L.torsoW, L.torsoH, 0.66]} radius={0.16} position={[0, torsoY, 0]} castShadow receiveShadow>
          <Plastic color={shirt} />
        </RoundedBox>
        {isPip ? (
          <>
            {/* Regenmantel-Saum bis zu den Knien + Knopfleiste */}
            <RoundedBox args={[1.08, 0.5, 0.72]} radius={0.12} position={[0, L.legLen - 0.05, 0]} castShadow>
              <Plastic color={T.coat} />
            </RoundedBox>
            <mesh position={[0, torsoY - 0.1, 0.335]}>
              <planeGeometry args={[0.05, L.torsoH * 0.9]} />
              <meshBasicMaterial color={T.coatDark} />
            </mesh>
            {/* türkiser Schal: Wulst + hängendes/wehendes Ende */}
            <RoundedBox args={[1.08, 0.26, 0.74]} radius={0.11} position={[0, L.legLen + L.torsoH - 0.02, 0]}>
              <Plastic color={T.scarf} rough={0.7} />
            </RoundedBox>
            <group position={[0.28, L.legLen + L.torsoH - 0.1, 0.34]} rotation={[-0.15 - scarfFly * 1.25, 0, -0.1 - scarfFly * 0.6]}>
              <RoundedBox args={[0.24, 0.72, 0.1]} radius={0.04} position={[0, -0.34, 0]}>
                <Plastic color={T.scarf} rough={0.7} />
              </RoundedBox>
            </group>
          </>
        ) : null}
        {isHollis ? (
          <>
            {[0, 1, 2, 3].map((b) => (
              <mesh key={b} position={[0, L.legLen + L.torsoH - 0.2 - b * 0.32, 0.335]}>
                <circleGeometry args={[0.055, 14]} />
                <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} />
              </mesh>
            ))}
            {/* Gürtel + Schlüsselring */}
            <mesh position={[0, L.legLen + 0.18, 0]}>
              <boxGeometry args={[L.torsoW + 0.02, 0.12, 0.68]} />
              <meshStandardMaterial color="#2A2018" roughness={0.6} />
            </mesh>
            <KeyRing position={[-0.42, L.legLen + 0.0, 0.38]} scale={0.8} />
          </>
        ) : null}
        {p.who === "baker" ? (
          <mesh position={[0, torsoY - 0.15, 0.336]}>
            <planeGeometry args={[0.86, 0.95]} />
            <Matte color="#FFFFFF" rough={0.9} />
          </mesh>
        ) : null}
        {head}
        {arm(-1, 0)}
        {arm(1, 1)}
      </group>
      {leg(-1)}
      {leg(1)}
    </group>
  );
};

/** Schirmmütze von Hollis (Ursprung = Kopfmitte). Auch einzeln (fliegend) nutzbar. */
export const HollisCap: React.FC<{ readonly position?: V3; readonly rotation?: V3 }> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0.6, -0.02]}>
      <cylinderGeometry args={[0.72, 0.66, 0.3, 28]} />
      <Plastic color={T.navyDark} />
    </mesh>
    <mesh position={[0, 0.47, 0]}>
      <cylinderGeometry args={[0.68, 0.68, 0.08, 28]} />
      <Plastic color={T.brass} rough={0.3} />
    </mesh>
    <mesh position={[0, 0.44, 0.5]} rotation={[0.3, 0, 0]}>
      <boxGeometry args={[0.95, 0.05, 0.45]} />
      <Plastic color="#0E1428" />
    </mesh>
    <mesh position={[0, 0.62, 0.71]}>
      <circleGeometry args={[0.1, 16]} />
      <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.25} />
    </mesh>
  </group>
);

/** Riesiger Schlüsselring (Ursprung = Ringmitte, Blick +z). */
export const KeyRing: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number; readonly swing?: number; readonly shine?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, swing = 0, shine = 0 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh>
      <torusGeometry args={[0.34, 0.04, 10, 32]} />
      <meshStandardMaterial color={T.brass} metalness={0.85} roughness={0.25} emissive={T.amber} emissiveIntensity={shine * 0.6} />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map((k) => {
      const a = -Math.PI / 2 + (k - 2.5) * 0.32 + Math.sin(swing + k) * 0.08;
      return (
        <group key={k} position={[Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0]} rotation={[0, 0, a + Math.PI / 2]}>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.07, 0.5, 0.04]} />
            <meshStandardMaterial color={k % 2 ? T.brass : "#B9B2A0"} metalness={0.85} roughness={0.3} emissive={T.amber} emissiveIntensity={shine * 0.4} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <torusGeometry args={[0.08, 0.025, 8, 16]} />
            <meshStandardMaterial color={k % 2 ? T.brass : "#B9B2A0"} metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** Abstimmungskelle (Ursprung = Griffende in der Hand, Kelle nach +y). */
export const Paddle: React.FC<{ readonly color: string; readonly scale?: number; readonly rotation?: V3 }> = ({ color, scale = 1, rotation = [0, 0, 0] }) => (
  <group scale={scale} rotation={rotation}>
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[0.07, 0.7, 0.07]} />
      <Matte color={T.wood} />
    </mesh>
    <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.32, 0.32, 0.06, 28]} />
      <Plastic color={color} rough={0.35} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ */
/* Menge (instanziert)                                                  */
/* ------------------------------------------------------------------ */

const CROWD_COLS = [T.terra, T.cream, "#D98A5A", "#E8C9A0", "#B9553A", "#CFB48E", "#A8683E"];
const m4 = new Matrix4();
const m4b = new Matrix4();
const o3 = new Object3D();
const col = new Color();

type Person = { x: number; z: number; yaw: number; s: number; c: string; hair: string; d: number };

export const useCrowdLayout = (n: number, cols: number, gapX: number, gapZ: number, z0: number, seed: number, hole?: (x: number, z: number) => boolean) =>
  useMemo(() => {
    const r = seeded(seed);
    const out: Person[] = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols);
      const k = i % cols;
      const x = (k - (cols - 1) / 2) * gapX + (row % 2) * gapX * 0.5 + (r() - 0.5) * 0.18;
      const z = z0 + row * gapZ + (r() - 0.5) * 0.16;
      if (hole && hole(x, z)) continue;
      out.push({ x, z, yaw: (r() - 0.5) * 0.35, s: 0.9 + r() * 0.2, c: CROWD_COLS[Math.floor(r() * CROWD_COLS.length)], hair: r() < 0.5 ? "#3A2A22" : r() < 0.5 ? "#6A4A30" : "#C8C2B8", d: r() });
    }
    return out;
  }, [n, cols, gapX, gapZ, z0, seed, hole]);

/**
 * Bis zu 1.000 Einwohner als vier InstancedMeshes (Rumpf, Kopf, Arm mit Kelle, Kelle). Blick nach −z (zum Tor).
 * `raise(i, d)` 0..1 hebt die YES-Kelle (d = Zufallswert je Person für Staffelung). `scale` = Figurengröße.
 * Matrizen werden per Ref-Callback in JEDEM Render aus dem Frame gesetzt (deterministisch, kein useEffect).
 */
export const Crowd: React.FC<{
  readonly people: readonly Person[];
  readonly frame: number;
  readonly raise: (d: number, x: number, z: number) => number;
  readonly scale?: number;
  readonly paddles?: boolean;
  readonly cheer?: number;
}> = ({ people, frame, raise, scale = 0.45, paddles = true, cheer = 0 }) => {
  const n = people.length;
  const place = (m: InstancedMesh | null, part: "body" | "head" | "arm" | "paddle") => {
    if (!m) return;
    for (let i = 0; i < n; i++) {
      const p = people[i];
      const r = paddles ? raise(p.d, p.x, p.z) : 0;
      const hop = cheer * Math.max(0, Math.sin(frame * 0.5 + p.d * 9)) * 0.25;
      o3.position.set(p.x, hop * scale, p.z);
      o3.rotation.set(0, Math.PI + p.yaw, 0);
      o3.scale.setScalar(scale * p.s);
      o3.updateMatrix();
      m4.copy(o3.matrix);
      if (part === "body") {
        o3.position.set(0, 1.25, 0);
        o3.rotation.set(0, 0, 0);
        o3.scale.set(1.04, 1.5, 0.66);
      } else if (part === "head") {
        o3.position.set(0, 2.45, 0);
        o3.rotation.set(0, 0, 0);
        o3.scale.set(1.18, 0.98, 0.92);
      } else {
        // Arm rechts (Figur-Sicht), dreht um die Schulter nach vorn/oben
        const a = 0.15 + r * (Math.PI - 0.25);
        const sx = 0.68;
        const sy = 1.9;
        const L = part === "arm" ? 0.42 : 0.95;
        o3.position.set(sx, sy - Math.cos(a) * L, Math.sin(a) * L);
        if (part === "arm") {
          o3.rotation.set(-a, 0, 0);
          o3.scale.set(0.3, 0.86, 0.32);
        } else {
          // Kelle: über der Hand, Fläche zur Kamera (Gesicht nach +z der Figur = weg vom Tor)
          const hx = sx;
          const hy = sy - Math.cos(a) * 0.95;
          const hz = Math.sin(a) * 0.95;
          o3.position.set(hx, hy + 0.55 * (r > 0.3 ? 1 : -0.2), hz + (r > 0.3 ? 0 : 0.25));
          o3.rotation.set(Math.PI / 2, 0, 0);
          o3.scale.set(1, 1, 1);
        }
      }
      o3.updateMatrix();
      m4b.multiplyMatrices(m4, o3.matrix);
      m.setMatrixAt(i, m4b);
      if (part === "body") m.setColorAt(i, col.set(p.c));
      if (part === "head") m.setColorAt(i, col.set(p.hair === "#C8C2B8" ? "#EFC9A8" : T.skin));
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };
  return (
    <group>
      <instancedMesh key={`b${n}`} ref={(m) => place(m, "body")} args={[undefined, undefined, n]} frustumCulled={false} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh key={`h${n}`} ref={(m) => place(m, "head")} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      {paddles ? (
        <>
          <instancedMesh key={`a${n}`} ref={(m) => place(m, "arm")} args={[undefined, undefined, n]} frustumCulled={false}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={T.cream} roughness={0.6} />
          </instancedMesh>
          <instancedMesh key={`p${n}`} ref={(m) => place(m, "paddle")} args={[undefined, undefined, n]} frustumCulled={false}>
            <cylinderGeometry args={[0.36, 0.36, 0.07, 20]} />
            <meshStandardMaterial color={T.yes} roughness={0.35} emissive={T.yes} emissiveIntensity={0.15} />
          </instancedMesh>
        </>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Tor, Mauer, Zähler                                                   */
/* ------------------------------------------------------------------ */

/** Zähler-Tafel „YES / 999 / 1,000“ (Mitte = position, Blick +z). Bernstein auf Fast-Schwarz ≈ 12 : 1. `glow` 0..1 = Gold-Leuchten. */
export const CounterBoard: React.FC<{ readonly value: string; readonly position?: V3; readonly rotation?: V3; readonly scale?: number; readonly glow?: number; readonly back?: boolean; readonly dim?: number }> = ({
  value,
  position = COUNTER_C,
  rotation = [0, 0, 0],
  scale = 1,
  glow = 0,
  back = false,
  dim = 1,
}) => {
  const txt = glow > 0.5 ? "#FFF1B8" : T.amber;
  const face = (
    <>
      <TextLabel text="YES" width={1.6} height={0.5} position={[0, 0.55, 0.08]} color="#F4ECD8" opacity={dim} />
      <TextLabel text={value} width={5.0} height={1.05} position={[0, -0.18, 0.08]} color={txt} opacity={dim} />
    </>
  );
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[5.8, 2.1, 0.3]} radius={0.1} position={[0, 0, -0.1]}>
        <meshStandardMaterial color={T.brass} metalness={0.75} roughness={0.32} emissive={T.amber} emissiveIntensity={0.15 + glow * 1.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[5.4, 1.8]} />
        <meshBasicMaterial color={T.counterBg} toneMapped={false} />
      </mesh>
      {/* Klappziffer-Fugen */}
      <mesh position={[0, -0.18, 0.07]}>
        <planeGeometry args={[5.2, 0.025]} />
        <meshBasicMaterial color="#3A2C18" toneMapped={false} />
      </mesh>
      {face}
      {back ? (
        <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.26]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[5.4, 1.8]} />
            <meshBasicMaterial color={T.counterBg} toneMapped={false} />
          </mesh>
          <TextLabel text="YES" width={1.6} height={0.5} position={[0, 0.55, 0.02]} color="#F4ECD8" opacity={dim} />
          <TextLabel text={value} width={5.0} height={1.05} position={[0, -0.18, 0.02]} color={txt} opacity={dim} />
        </group>
      ) : null}
      {glow > 0.02 ? <Halo at={[0, 0, 0.5]} size={9 * glow} color={T.amber} opacity={0.55 * glow} /> : null}
    </group>
  );
};

/** Torflügel (Halbscheibe mit gemaltem Meer). `side` −1 = links, +1 = rechts; `open` 0..1 schwenkt nach außen (−z). */
const GateDoor: React.FC<{ readonly side: -1 | 1; readonly open: number; readonly gap: boolean }> = ({ side, open, gap }) => {
  const map = paintedSeaTex(gap);
  const ang = open * 1.5;
  return (
    <group position={[side * GATE_R, 0, 0]} rotation={[0, side * ang, 0]}>
      <group position={[-side * GATE_R, 0, 0]}>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[GATE_R, 64, side < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial map={map} roughness={0.75} side={DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.14]}>
          <circleGeometry args={[GATE_R, 64, side < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={T.brassDark} metalness={0.6} roughness={0.45} side={DoubleSide} />
        </mesh>
        {/* Mittelleiste + Nieten */}
        <mesh position={[side * 0.06, 0, 0.05]}>
          <boxGeometry args={[0.12, GATE_R * 2, 0.08]} />
          <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[side * 0.42, -0.2, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.05, 8, 20]} />
          <meshStandardMaterial color={T.brass} metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};

/** Stadtmauer mit Torrahmen (Loch), Tor, Zähler, Regeltafel und Rostschild. Ursprung = Tor-Fuß bei z 0, Stadt bei +z. */
export const GateWall: React.FC<{
  readonly counter: string;
  readonly glow?: number;
  readonly open?: number;
  readonly gap?: boolean;
  readonly scratch?: number;
  readonly backCounter?: boolean;
  readonly wallR?: number;
  readonly dusk?: number;
}> = ({ counter, glow = 0, open = 0, gap = false, scratch = 0, backCounter = false, wallR = 26 }) => {
  const plate = useMemo(() => {
    const s = new Shape();
    s.moveTo(-5.2, 0);
    s.lineTo(5.2, 0);
    s.lineTo(5.2, 9.6);
    s.lineTo(-5.2, 9.6);
    s.lineTo(-5.2, 0);
    const h = new Path();
    h.absarc(GATE_C[0], GATE_C[1], GATE_R + 0.12, 0, Math.PI * 2, true);
    s.holes.push(h);
    return s;
  }, []);
  const gapA = 0.2;
  return (
    <group>
      {/* Mauerring (links + rechts vom Torrahmen) */}
      <mesh position={[0, 4.8, wallR]}>
        <cylinderGeometry args={[wallR, wallR, 9.6, 96, 1, true, Math.PI + gapA, Math.PI * 2 - gapA * 2]} />
        <meshStandardMaterial color={T.wall} roughness={0.92} side={DoubleSide} />
      </mesh>
      {/* Mauerkrone */}
      <mesh position={[0, 9.75, wallR]}>
        <cylinderGeometry args={[wallR + 0.35, wallR + 0.35, 0.3, 96, 1, true, Math.PI + gapA, Math.PI * 2 - gapA * 2]} />
        <meshStandardMaterial color={T.wallShade} roughness={0.9} side={DoubleSide} />
      </mesh>
      {/* Torrahmen mit rundem Loch (Vorder- und Rückseite) */}
      <mesh position={[0, 0, 0]}>
        <shapeGeometry args={[plate, 48]} />
        <meshStandardMaterial color={T.wallShade} roughness={0.9} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 9.75, 0]}>
        <boxGeometry args={[10.8, 0.3, 1.0]} />
        <meshStandardMaterial color={T.wallShade} roughness={0.9} />
      </mesh>
      {/* Messingring um das Loch */}
      <mesh position={[GATE_C[0], GATE_C[1], 0.12]}>
        <torusGeometry args={[GATE_R + 0.18, 0.24, 14, 72]} />
        <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} emissive={T.amber} emissiveIntensity={glow * 0.5} />
      </mesh>
      <mesh position={[GATE_C[0], GATE_C[1], -0.2]}>
        <torusGeometry args={[GATE_R + 0.18, 0.2, 10, 72]} />
        <meshStandardMaterial color={T.brassDark} metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Torflügel */}
      <group position={[GATE_C[0], GATE_C[1], 0.02]}>
        <GateDoor side={-1} open={open} gap={gap} />
        <GateDoor side={1} open={open} gap={gap} />
      </group>
      <CounterBoard value={counter} glow={glow} back={backCounter} />
      {/* Regeltafel: Messing, dunkle Gravur (unbeleuchtet, ≈ 8 : 1) */}
      <group position={RULE_PLATE}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial color={T.brassDark} metalness={0.6} roughness={0.4} />
        </mesh>
        <TextLabel text="OPENS AT" width={1.34} height={0.34} position={[0, 0.2, 0.01]} color={T.ink} bg="#E0BE6A" round={0.08} />
        <TextLabel text="1,000 YES" width={1.34} height={0.42} position={[0, -0.2, 0.01]} color={T.ink} bg="#E0BE6A" round={0.08} />
      </group>
      {/* Rostschild */}
      <Plaque position={PLAQUE} />
      <Plaque position={[PLAQUE[0], PLAQUE[1], -0.08]} rotation={[0, Math.PI, 0]} scratch={scratch} />
    </group>
  );
};

/** Rostschild „SHUT FOR 83 YEARS“, darunter (scratch 0..1) gekratzt „1 LEFT“. */
export const Plaque: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scratch?: number }> = ({ position, rotation = [0, 0, 0], scratch = 0 }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0, -0.02]}>
      <planeGeometry args={[1.7, 1.06]} />
      <meshStandardMaterial color="#3A1E12" roughness={0.9} />
    </mesh>
    <TextLabel text="SHUT FOR" width={1.56} height={0.4} position={[0, 0.22, 0.01]} color="#F2E2C4" bg={T.rust} round={0.06} />
    <TextLabel text="83 YEARS" width={1.56} height={0.46} position={[0, -0.22, 0.01]} color="#F2E2C4" bg={T.rust} round={0.06} />
    {scratch > 0.01 ? (
      <group position={[0, -0.86, 0.01]}>
        <TextLabel text="1 LEFT" width={1.2} height={0.42} position={[0, 0, 0]} color="#FFFFFF" bg="#2A2420" round={0.1} opacity={Math.min(1, scratch * 1.4)} />
      </group>
    ) : null}
  </group>
);

/* ------------------------------------------------------------------ */
/* Stadt                                                                */
/* ------------------------------------------------------------------ */

/** Terrakotta-Klotzhaus mit Ziegel-Satteldach, Fensterläden und Tür. Ursprung = Bodenmitte, Front +z. */
export const TorHouse: React.FC<{ readonly position: V3; readonly w?: number; readonly h?: number; readonly d?: number; readonly color?: string; readonly rotY?: number; readonly seed?: number; readonly door?: string; readonly doorOpen?: number; readonly lit?: number }> = ({
  position,
  w = 3.2,
  h = 4.6,
  d = 3,
  color = T.terra,
  rotY = 0,
  seed = 1,
  door = T.woodDark,
  doorOpen = 0,
  lit = 0,
}) => {
  const r = seeded(seed);
  const rows = Math.max(1, Math.floor((h - 1.8) / 1.5));
  const wins: { x: number; y: number; on: boolean }[] = [];
  for (let row = 0; row < rows; row++)
    for (let c = 0; c < 2; c++) wins.push({ x: (c - 0.5) * (w / 2), y: 2.4 + row * 1.5, on: r() < lit });
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <Matte color={color} rough={0.9} />
      </mesh>
      <mesh position={[0, h + w * 0.25, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[w * 0.6, w * 0.6, d + 0.5, 3, 1]} />
        <Matte color={T.roof} rough={0.75} />
      </mesh>
      {wins.map((wi, i) => (
        <group key={i} position={[wi.x, wi.y, d / 2 + 0.01]}>
          <mesh>
            <planeGeometry args={[0.7, 0.9]} />
            {wi.on ? <meshStandardMaterial color="#FFD9A0" emissive="#FFB060" emissiveIntensity={1.0} toneMapped={false} /> : <meshStandardMaterial color="#2A1E18" roughness={0.3} />}
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.5, 0, 0.01]}>
              <planeGeometry args={[0.28, 0.95]} />
              <Matte color="#6A4A2E" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Tür (schwenkt nach innen auf) */}
      <group position={[-0.45, 0, d / 2 + 0.01]} rotation={[0, -doorOpen * 1.4, 0]}>
        <mesh position={[0.45, 0.8, 0]}>
          <planeGeometry args={[0.9, 1.6]} />
          <Matte color={door} />
        </mesh>
      </group>
      {doorOpen > 0.01 ? (
        <mesh position={[0, 0.8, d / 2 - 0.02]}>
          <planeGeometry args={[0.9, 1.6]} />
          <meshBasicMaterial color="#20140C" />
        </mesh>
      ) : null}
    </group>
  );
};

/** Häuser rund um den Platz (hinten und seitlich), Blick zum Tor. */
export const TownRing: React.FC<{ readonly lit?: number; readonly zBack?: number }> = ({ lit = 0, zBack = 28 }) => {
  const r = seeded(3);
  const out: React.ReactNode[] = [];
  let x = -16;
  let i = 0;
  while (x < 16) {
    const w = 2.8 + r() * 1.4;
    out.push(<TorHouse key={`b${i}`} position={[x + w / 2, 0, zBack + r()]} w={w} h={4.2 + r() * 2.6} color={i % 3 === 1 ? T.cream : i % 3 === 2 ? "#D98A5A" : T.terra} rotY={Math.PI} seed={i + 4} lit={lit} />);
    x += w + 0.1;
    i++;
  }
  for (const sd of [-1, 1]) {
    let z = 4;
    let k = 0;
    while (z < zBack - 2) {
      const w = 2.8 + r() * 1.2;
      out.push(<TorHouse key={`s${sd}${k}`} position={[sd * (14.5 + r() * 0.6), 0, z + w / 2]} w={w} h={4 + r() * 2.4} color={k % 2 ? T.cream : T.terra} rotY={-sd * Math.PI / 2} seed={k * 7 + (sd > 0 ? 50 : 90)} lit={lit} />);
      z += w + 0.1;
      k++;
    }
  }
  return <group>{out}</group>;
};

/** Pflaster-Boden (Stadt). */
export const Cobbles: React.FC<{ readonly size?: number; readonly tint?: string }> = ({ size = 140, tint = "#FFFFFF" }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial map={cobbleTex()} color={tint} roughness={0.92} />
  </mesh>
);

/** Stoppuhr am Mast. Fußpunkt = position, Zifferblatt bei y 4,6 mit Blick +z; `sec` 0..60 = Zeigerstellung. */
export const Stopwatch: React.FC<{ readonly position?: V3; readonly sec?: number; readonly scale?: number; readonly glow?: number; readonly rotation?: V3 }> = ({ position = STOPWATCH, sec = 0, scale = 1, glow = 0, rotation = [0, 0, 0] }) => (
  <group position={position} scale={scale} rotation={rotation}>
    <mesh position={[0, 2.1, 0]}>
      <cylinderGeometry args={[0.09, 0.12, 4.2, 12]} />
      <meshStandardMaterial color="#3A2E22" metalness={0.4} roughness={0.5} />
    </mesh>
    <group position={[0, 4.6, 0.1]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.24, 48]} />
        <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} emissive={T.amber} emissiveIntensity={glow * 0.6} />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.26, 16]} />
        <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.24, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.16, 0.04, 8, 16]} />
        <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.125]}>
        <circleGeometry args={[0.82, 48]} />
        <meshBasicMaterial color="#FBF6EA" toneMapped={false} />
      </mesh>
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.sin(a) * 0.68, Math.cos(a) * 0.68, 0.13]} rotation={[0, 0, -a]}>
            <planeGeometry args={[0.05, k % 3 === 0 ? 0.2 : 0.11]} />
            <meshBasicMaterial color={T.ink} toneMapped={false} />
          </mesh>
        );
      })}
      <group rotation={[0, 0, -(sec / 60) * Math.PI * 2]} position={[0, 0, 0.14]}>
        <mesh position={[0, 0.3, 0]}>
          <planeGeometry args={[0.06, 0.66]} />
          <meshBasicMaterial color={T.no} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.15]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color={T.ink} toneMapped={false} />
      </mesh>
    </group>
  </group>
);

/** Banner quer über den Platz zwischen zwei Masten (Mitte = position). */
export const Banner: React.FC<{ readonly position: V3; readonly text: string; readonly width?: number; readonly frame: number }> = ({ position, text, width = 12, frame }) => (
  <group position={position}>
    {[-1, 1].map((sd) => (
      <mesh key={sd} position={[sd * (width / 2 + 0.3), -3.2, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 9, 10]} />
        <meshStandardMaterial color="#5A3A22" roughness={0.6} />
      </mesh>
    ))}
    <group rotation={[Math.sin(frame * 0.05) * 0.04, 0, 0]}>
      <mesh>
        <planeGeometry args={[width, 1.4]} />
        <meshStandardMaterial color={T.cream} roughness={0.9} side={DoubleSide} />
      </mesh>
      <TextLabel text={text} width={width * 0.9} height={1.0} position={[0, 0, 0.02]} color={T.terraDark} />
      <TextLabel text={text} width={width * 0.9} height={1.0} position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]} color={T.terraDark} />
    </group>
  </group>
);

/** Plakat „SAY YES / ON SUNDAY!“ mit lächelndem Tor. `peel` 0..1 löst die untere Ecke. Mitte = position, Blick +z. */
export const Poster: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scale?: number; readonly peel?: number; readonly on?: number }> = ({ position, rotation = [0, 0, 0], scale = 1, peel = 0, on = 1 }) => {
  if (on <= 0.01) return null;
  return (
    <group position={position} rotation={rotation} scale={scale * (0.7 + 0.3 * on)}>
      <group position={[0, 0.9, 0]} rotation={[peel * 0.5, 0, peel * 0.35]}>
        <group position={[0, -0.9, 0]}>
          <mesh>
            <planeGeometry args={[1.4, 1.8]} />
            <meshStandardMaterial color={T.poster} roughness={0.85} side={DoubleSide} />
          </mesh>
          <TextLabel text="SAY YES" width={1.26} height={0.38} position={[0, 0.6, 0.01]} color={T.ink} />
          <TextLabel text="ON SUNDAY!" width={1.26} height={0.3} position={[0, 0.24, 0.01]} color={T.ink} />
          {/* lächelndes Tor */}
          <mesh position={[0, -0.38, 0.01]}>
            <torusGeometry args={[0.36, 0.05, 8, 32]} />
            <meshBasicMaterial color={T.ink} />
          </mesh>
          <mesh position={[0, -0.38, 0.01]}>
            <circleGeometry args={[0.33, 32]} />
            <meshBasicMaterial color={T.sea} />
          </mesh>
          <mesh position={[0, -0.47, 0.02]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.14, 0.03, 8, 20, Math.PI]} />
            <meshBasicMaterial color={T.white} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.12, -0.3, 0.02]}>
              <circleGeometry args={[0.045, 12]} />
              <meshBasicMaterial color={T.white} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

/** Holzfass (Fußpunkt). */
export const Barrel: React.FC<{ readonly position: V3; readonly scale?: number }> = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.75, 0]} castShadow>
      <cylinderGeometry args={[0.62, 0.62, 1.5, 24]} />
      <Matte color={T.wood} rough={0.8} />
    </mesh>
    {[0.25, 1.25].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.645, 0.645, 0.1, 24]} />
        <meshStandardMaterial color="#3A3430" metalness={0.6} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

/** Holzkiste (Fußpunkt), Kantenlänge s. */
export const Crate: React.FC<{ readonly position: V3; readonly s?: number }> = ({ position, s = 1.1 }) => (
  <group position={position}>
    <mesh position={[0, s / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[s, s, s]} />
      <Matte color="#A8743E" rough={0.85} />
    </mesh>
    {[-1, 1].map((sd) => (
      <mesh key={sd} position={[0, s / 2 + sd * s * 0.3, s / 2 + 0.01]}>
        <planeGeometry args={[s, 0.1]} />
        <Matte color="#7A522A" />
      </mesh>
    ))}
  </group>
);

/** Papier-Sprachrohr (Ursprung = Mundstück, öffnet nach +z). */
export const Cone: React.FC<{ readonly rotation?: V3; readonly scale?: number }> = ({ rotation = [0, 0, 0], scale = 1 }) => (
  <group rotation={rotation} scale={scale}>
    <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.38, 0.08, 0.9, 20, 1, true]} />
      <meshStandardMaterial color={T.paper} roughness={0.9} side={DoubleSide} />
    </mesh>
  </group>
);

/** Handgemaltes Pappschild „MEETING OVER?“ an einem Stiel (Ursprung = Griff, Schild nach +y, Blick +z). Tinte auf Karton ≈ 9 : 1. */
export const CardSign: React.FC<{ readonly scale?: number; readonly rotation?: V3 }> = ({ scale = 1, rotation = [0, 0, 0] }) => (
  <group scale={scale} rotation={rotation}>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[0.08, 1.2, 0.08]} />
      <Matte color={T.wood} />
    </mesh>
    <group position={[0, 1.55, 0.06]} rotation={[0, 0, 0.04]}>
      <mesh>
        <boxGeometry args={[2.3, 1.15, 0.05]} />
        <Matte color="#B98E58" />
      </mesh>
      <TextLabel text="MEETING" width={2.1} height={0.5} position={[0, 0.25, 0.03]} color={T.ink} bg={T.card} round={0.04} />
      <TextLabel text="OVER?" width={2.1} height={0.52} position={[0, -0.27, 0.03]} color={T.ink} bg={T.card} round={0.04} />
    </group>
  </group>
);

/** Klemmbrett mit Strichliste unter „YES“ (Mitte = position, Blick +z). */
export const Clipboard: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[1.5, 2.0, 0.06]} radius={0.05}>
      <Matte color="#8A5A34" />
    </RoundedBox>
    <mesh position={[0, -0.12, 0.035]}>
      <planeGeometry args={[1.3, 1.62]} />
      <meshBasicMaterial map={tickTex()} toneMapped={false} />
    </mesh>
    <TextLabel text="YES" width={0.9} height={0.3} position={[0, 0.78, 0.04]} color={T.ink} bg={T.paper} round={0.05} />
    <mesh position={[0, 0.98, 0.05]}>
      <boxGeometry args={[0.6, 0.16, 0.06]} />
      <meshStandardMaterial color="#9A9AA2" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

/** Torwächter-Häuschen (Fußpunkt, Fenster nach +z), Urkunde innen, Schild darunter. */
export const Booth: React.FC<{ readonly position?: V3; readonly frame: number; readonly signSwing?: number; readonly interior?: boolean }> = ({ position = BOOTH, frame, signSwing = 0.6, interior = true }) => {
  const W = 2.4;
  const H = 3.4;
  const D = 2.2;
  return (
    <group position={position}>
      {/* Rückwand, Seiten, Sockel, Sturz (Fensteröffnung vorn) */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W, H, 0.12]} />
        <Matte color="#3A4A78" />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * W / 2, H / 2, 0]} castShadow>
          <boxGeometry args={[0.12, H, D]} />
          <Matte color={T.navy} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, D / 2]} castShadow>
        <boxGeometry args={[W, 1.2, 0.12]} />
        <Matte color={T.navy} />
      </mesh>
      <mesh position={[0, H - 0.3, D / 2]}>
        <boxGeometry args={[W, 0.6, 0.12]} />
        <Matte color={T.navy} />
      </mesh>
      <mesh position={[0, 1.22, D / 2 + 0.08]}>
        <boxGeometry args={[W + 0.1, 0.1, 0.4]} />
        <meshStandardMaterial color={T.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Dach */}
      <mesh position={[0, H + 0.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.1, 0.9, 4]} />
        <Matte color={T.navyDark} />
      </mesh>
      {interior ? (
        <>
          {/* Urkunde an der Rückwand */}
          <group position={[0, 2.35, -D / 2 + 0.08]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.5, 0.95]} />
              <meshStandardMaterial color={T.brass} metalness={0.7} roughness={0.3} />
            </mesh>
            <TextLabel text="GATEKEEPER" width={1.32} height={0.36} position={[0, 0.16, 0.01]} color={T.ink} bg={T.paper} round={0.03} />
            <TextLabel text="83 YEARS" width={1.32} height={0.36} position={[0, -0.2, 0.01]} color={T.ink} bg={T.paper} round={0.03} />
          </group>
          <pointLight position={[0, 2.8, 0]} color="#FFD9A0" intensity={4} distance={4} decay={2} />
        </>
      ) : null}
      {/* Schild unter dem Dach, schwingt */}
      <group position={[0, H - 0.62, D / 2 + 0.25]} rotation={[0, 0, Math.sin(frame * 0.09) * 0.08 * signSwing]}>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.7, -0.12, 0]}>
            <boxGeometry args={[0.03, 0.25, 0.03]} />
            <meshStandardMaterial color="#2A2A2E" metalness={0.6} />
          </mesh>
        ))}
        <TextLabel text="ONLY NEEDED" width={1.9} height={0.34} position={[0, -0.42, 0.01]} color="#FFFFFF" bg={T.navyDark} round={0.06} />
        <TextLabel text="WHILE SHUT" width={1.9} height={0.34} position={[0, -0.78, 0.01]} color="#FFFFFF" bg={T.navyDark} round={0.06} />
      </group>
    </group>
  );
};

/** Fallende Farbflocken (türkis), deterministisch. */
export const Flakes: React.FC<{ readonly frame: number; readonly center: V3; readonly size: V3; readonly count?: number; readonly seed?: number; readonly speed?: number; readonly scale?: number }> = ({ frame, center, size, count = 20, seed = 3, speed = 0.01, scale = 1 }) => {
  const parts = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => ({ x: r(), y: r(), z: r(), rot: r() * 6, sp: 0.6 + r() * 0.8 }));
  }, [count, seed]);
  return (
    <group>
      {parts.map((p, i) => {
        const y = (((p.y - frame * speed * p.sp) % 1) + 1) % 1;
        return (
          <mesh key={i} position={[center[0] + (p.x - 0.5) * size[0] + Math.sin(frame * 0.07 + i) * 0.08, center[1] + (y - 0.5) * size[1], center[2] + (p.z - 0.5) * size[2]]} rotation={[p.rot + frame * 0.05, p.rot, frame * 0.04 * p.sp]} scale={scale}>
            <planeGeometry args={[0.12, 0.09]} />
            <meshStandardMaterial color={i % 3 ? T.sea : "#F5FBF8"} side={DoubleSide} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Draußen: Meer, Klippe                                                */
/* ------------------------------------------------------------------ */

/** Echtes Meer (y 0, nach +z zur Kamera), Wellen-Schaumbänder, Strand und Klippe mit der Stadtmauer dahinter (−z). */
export const SeaSet: React.FC<{ readonly frame: number; readonly wallCounter?: string }> = ({ frame, wallCounter = "0 / 1,000" }) => {
  const foam = [0, 1, 2, 3, 4].map((k) => {
    const ph = ((frame * 0.012 + k / 5) % 1 + 1) % 1;
    return { z: 1.5 + ph * -3.2 + k * 0.0, k, a: Math.sin(ph * Math.PI) };
  });
  return (
    <group>
      <SkyDome top="#5FB3E8" mid="#A9DDF2" bottom="#E9F6F4" radius={220} />
      <hemisphereLight args={["#DFF3FF", "#C9A27A", 1.2]} />
      {/* Meer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 40]} receiveShadow>
        <planeGeometry args={[400, 80]} />
        <meshPhysicalMaterial color={T.sea} roughness={0.12} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 120]}>
        <planeGeometry args={[400, 100]} />
        <meshStandardMaterial color={T.seaDeep} roughness={0.2} />
      </mesh>
      {/* Strand-Rampe */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, 0]} position={[0, -0.05, -6]} receiveShadow>
        <planeGeometry args={[200, 16]} />
        <meshStandardMaterial color="#E7CFA2" roughness={0.95} />
      </mesh>
      {/* Schaumbänder laufen an den Strand */}
      {foam.map((f) => (
        <mesh key={f.k} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05 + f.k * 0.002, f.z + f.k * 0.9 - 1.6]}>
          <planeGeometry args={[60, 0.35 + f.a * 0.3]} />
          <meshBasicMaterial color={T.foam} transparent opacity={0.85 * f.a} depthWrite={false} />
        </mesh>
      ))}
      {/* Klippe + Stadtmauer oben */}
      <mesh position={[0, 4, -22]} castShadow receiveShadow>
        <boxGeometry args={[90, 8, 14]} />
        <meshStandardMaterial color="#D8C2A0" roughness={0.95} />
      </mesh>
      <group position={[-3, 8, -24]} scale={0.55} rotation={[0, Math.PI, 0]}>
        <GateWall counter={wallCounter} backCounter wallR={26} />
      </group>
      {/* Glitzern */}
      {Array.from({ length: 24 }, (_, i) => {
        const r = seeded(i + 40);
        const x = (r() - 0.5) * 40;
        const z = 4 + r() * 30;
        const on = Math.max(0, Math.sin(frame * 0.3 + i * 1.7));
        return on > 0.6 ? <Halo key={i} at={[x, 0.1, z]} size={0.5} color="#FFFFFF" opacity={on * 0.8} /> : null;
      })}
    </group>
  );
};
