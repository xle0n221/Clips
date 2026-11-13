/**
 * „In This City, You Pay With Time“ (episodes/zeit-welt.json) – Bau-Kit der Stadt Minuteburg.
 *
 * Stil (Drehbuch `style`, KnowToon-Prompt STEP 2): Cinematic 3D mit EIGENEN Spielzeug-Klotzfiguren –
 * großer abgerundeter Quader-Kopf (breiter als der Körper), runde Punktaugen mit Glanzpunkt, einfacher Mund,
 * klobige abgerundete Glieder, Fäustlinge statt Hände, kräftige Einfarb-Kleidung. Bewusst KEIN Noppen-Kopf,
 * keine C-Hände, keine Pixel-Gesichter, keine Würfel-Proportionen (Markenabstand zu Steck- und Voxel-Spielzeug).
 * Licht: PBR-Material (Kunststoff mit Klarlack), Volumen-Lichtkegel (additiv), Gegenlicht, nasse Straße mit
 * Glanz-Streifen, Staub/Sand/Regen-Partikel, Nebel. Farblogik: Welt kalt blau-grau, GOLD nur = Zeit/Sand.
 * Schlüsselobjekt: das Zeitglas am Gürtel (`TimeJar`). Nichts aus „In Time“ (keine leuchtende Arm-Uhr).
 * Alles aus dem Frame berechnet (kein useEffect, kein Zufall ohne Seed).
 */
import { RoundedBox, useTexture } from "@react-three/drei";
import React, { useMemo } from "react";
import { Easing, interpolate, staticFile } from "remotion";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
} from "three";
import { aimAt, blinkAt } from "../kit/motion";
import { V3 } from "../kit/camera";
import { seeded } from "../kit/toon";

/* ------------------------------------------------------------------ */
/* Palette + Helfer                                                     */
/* ------------------------------------------------------------------ */

export const Z = {
  night: "#0B1320",
  fog: "#33445C",
  fogDeep: "#162131",
  dawn: "#5B7393",
  stone: "#4B5567",
  stoneDark: "#252D3A",
  wet: "#161D28",
  copper: "#4F7F74",
  wallA: "#6A7385",
  wallB: "#545E70",
  wallC: "#7B8090",
  trim: "#2F3744",
  gold: "#FFB21F",
  goldHot: "#FFD566",
  brass: "#B8913F",
  leather: "#5B3A22",
  skin: "#EFC6A0",
  idaShirt: "#18707A",
  apron: "#B98A2A",
  idaHair: "#5A3A24",
  anton: "#7E8693",
  white: "#ECECEC",
  plum: "#6E3A62",
  coat: "#555C67",
  visor: "#D5E6F0",
  lamp: "#FFC37A",
  wood: "#6E4A30",
  woodDark: "#3E2A1C",
  paper: "#EFE6D2",
  ink: "#141414",
} as const;

export const FPS = 30;

/** Aktive Einstellung + lokaler Frame darin (cuts = lokale Szenen-Frames der Schnitte). */
export const cut = (frame: number, cuts: number[]) => {
  let i = 0;
  for (const c of cuts) if (frame >= c) i++;
  const from = i === 0 ? 0 : cuts[i - 1];
  return { shot: i, f: frame - from, from };
};

export const ramp = (frame: number, a: number, b: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Kamera-Bildausschnitt: Punkt p bei Bildstelle (xf, yf), Bildhöhe H, Blickrichtung dir (zur Kamera). */
export const frameOn = (p: V3, H: number, yf = 0.5, xf = 0.5, dir: V3 = [0, 0.1, 1], fov = 40) => aimAt(p, H, { yf, xf, dir, fov });

/** Props für <Shot>: Fahrt von Ausschnitt a nach b. */
export const fly = (a: { pos: V3; look: V3; fov: number }, b: { pos: V3; look: V3; fov: number } = a) => ({
  from: a.pos,
  to: b.pos,
  look: a.look,
  lookTo: b.look,
  fov: a.fov,
  shake: 0.015,
  ease: "inOut" as const,
});

/* ------------------------------------------------------------------ */
/* Texturen (einmal je Schlüssel, Canvas)                               */
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

/** Weicher runder Lichtpunkt (Partikel, Bokeh, Halo). */
export const softDot = () =>
  canvasTex("softDot", 64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });

/** Senkrechter Verlauf hell → durchsichtig (Lichtkegel). */
const shaftTex = () =>
  canvasTex("shaft", 4, 128, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.5, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 128);
  });

/** Kopfsteinpflaster (Farbe + Fugen), wiederholt. */
const cobbleTex = (repeat: number) =>
  canvasTex(`cobble-${repeat}`, 256, 256, (c) => {
    c.fillStyle = "#1A212C";
    c.fillRect(0, 0, 256, 256);
    const r = seeded(11);
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 6; x++) {
        const ox = (y % 2) * 21;
        const l = 26 + Math.floor(r() * 18);
        c.fillStyle = `rgb(${l},${l + 6},${l + 16})`;
        c.beginPath();
        c.roundRect(x * 43 + ox + 2, y * 32 + 2, 39, 28, 9);
        c.fill();
      }
  }, [repeat, repeat]);

/** Holzdielen/Brett. */
const woodTex = () =>
  canvasTex("wood", 256, 256, (c) => {
    c.fillStyle = Z.wood;
    c.fillRect(0, 0, 256, 256);
    const r = seeded(5);
    for (let i = 0; i < 8; i++) {
      const l = 0.8 + r() * 0.35;
      c.fillStyle = `rgba(${Math.round(110 * l)},${Math.round(74 * l)},${Math.round(48 * l)},1)`;
      c.fillRect(0, i * 32 + 1, 256, 30);
      c.fillStyle = "rgba(30,18,10,0.55)";
      c.fillRect(0, i * 32, 256, 2);
    }
  }, [2, 2]);

/* ------------------------------------------------------------------ */
/* Echte Bilder/Videos als Textur                                       */
/* ------------------------------------------------------------------ */

/** Bild aus public/ als Textur (drei `useTexture` = Suspense; ThreeCanvas wartet per delayRender, bis es geladen ist). */
export const useImageTexture = (path: string) => {
  const t = useTexture(staticFile(path));
  t.colorSpace = SRGBColorSpace;
  return t;
};

/* ------------------------------------------------------------------ */
/* Material-Kurzformen                                                  */
/* ------------------------------------------------------------------ */

/** Spielzeug-Kunststoff mit Klarlack (Figuren). */
const Plastic: React.FC<{ readonly color: string; readonly rough?: number }> = ({ color, rough = 0.42 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.55} clearcoatRoughness={0.35} />
);
const Matte: React.FC<{ readonly color: string; readonly rough?: number; readonly metal?: number }> = ({ color, rough = 0.8, metal = 0 }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
);

/* ------------------------------------------------------------------ */
/* Zeitglas (Schlüsselobjekt)                                           */
/* ------------------------------------------------------------------ */

/**
 * Zeitglas: Zylinderglas, Messingdeckel, kleiner Messinghahn, Lederclip. `fill` 0..1 = Sandstand (Gold leuchtet),
 * `painted` = Sand ist nur Farbe innen am Glas (`scratch` 0..1 = Streifen abgekratzt → klares Glas),
 * `cobweb` = Spinnweben im Deckel (leeres Glas der Kehrerin), `glow` = goldenes Licht (Punktlicht).
 * Maßstab 1: 0,36 hoch, Ursprung = Glasboden-Mitte.
 */
export const TimeJar: React.FC<{
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly fill?: number;
  readonly painted?: boolean;
  readonly scratch?: number;
  readonly cobweb?: boolean;
  readonly glow?: number;
  readonly clip?: boolean;
}> = ({ position, rotation, scale = 1, fill = 0.7, painted, scratch = 0, cobweb, glow = 1, clip = true }) => {
  const h = 0.36;
  const r = 0.15;
  const sandH = Math.max(0.0001, h * 0.92 * fill);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Sand: echter Sand = volle Säule; gemalt = dünne Schicht innen an der Wand (mit Kratz-Streifen) */}
      {fill > 0.002 && !painted ? (
        <mesh position={[0, 0.012 + sandH / 2, 0]}>
          <cylinderGeometry args={[r * 0.9, r * 0.9, sandH, 28]} />
          <meshStandardMaterial color={Z.gold} emissive={Z.gold} emissiveIntensity={1.15 * glow} roughness={0.9} toneMapped={false} />
        </mesh>
      ) : null}
      {painted
        ? // gemalter Sand: dünne Farbschicht innen; `scratch` (rad) = abgekratzter Streifen vorn UND hinten → man sieht durchs klare Glas
          [0, Math.PI].map((o) => (
            <mesh key={o} position={[0, 0.012 + sandH / 2, 0]}>
              <cylinderGeometry args={[r * 0.93, r * 0.93, sandH, 28, 1, true, o + scratch / 2, Math.PI - scratch]} />
              <meshStandardMaterial color={Z.gold} emissive={Z.gold} emissiveIntensity={0.9 * glow} roughness={0.95} side={DoubleSide} toneMapped={false} />
            </mesh>
          ))
        : null}
      {/* Glas */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r, h, 32, 1, true]} />
        <meshPhysicalMaterial color="#DDEFFF" roughness={0.04} metalness={0} transparent opacity={0.28} clearcoat={1} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[r, r, 0.012, 32]} />
        <meshPhysicalMaterial color="#CFE4F5" roughness={0.05} transparent opacity={0.45} />
      </mesh>
      {/* Glanzkante (Spiegelung) */}
      <mesh position={[-r * 0.55, h * 0.55, r * 0.84]} rotation={[0, -0.6, 0]}>
        <planeGeometry args={[0.025, h * 0.7]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* Messingdeckel + Knauf */}
      <mesh position={[0, h + 0.03, 0]}>
        <cylinderGeometry args={[r * 1.08, r * 1.08, 0.06, 32]} />
        <meshStandardMaterial color={Z.brass} metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh position={[0, h + 0.075, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.04, 16]} />
        <meshStandardMaterial color={Z.brass} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Messinghahn unten seitlich */}
      <mesh position={[r + 0.03, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 12]} />
        <meshStandardMaterial color={Z.brass} metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[r + 0.06, 0.08, 0]}>
        <boxGeometry args={[0.016, 0.05, 0.016]} />
        <meshStandardMaterial color={Z.brass} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Lederclip hinten */}
      {clip ? (
        <mesh position={[0, h * 0.6, -r - 0.012]}>
          <boxGeometry args={[0.09, h * 0.75, 0.025]} />
          <meshStandardMaterial color={Z.leather} roughness={0.7} />
        </mesh>
      ) : null}
      {/* Spinnweben im Deckel */}
      {cobweb
        ? [0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[0, h - 0.04, 0]} rotation={[0, (k * Math.PI) / 4, 0.25]}>
              <boxGeometry args={[r * 1.7, 0.003, 0.003]} />
              <meshBasicMaterial color="#D8DEE6" transparent opacity={0.7} />
            </mesh>
          ))
        : null}
      {glow > 0 && fill > 0.02 ? <pointLight position={[0, h * 0.5, 0.3]} color={Z.gold} intensity={0.35 * glow * scale * scale} distance={2.5 * scale} decay={2} /> : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Klotzfigur                                                           */
/* ------------------------------------------------------------------ */

export type Who = "ida" | "anton" | "sweeper" | "landlord" | "office" | "worker" | "baker" | "kid" | "towns";
export type KlotzProps = {
  readonly frame: number;
  readonly who: Who;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly eyes?: "dot" | "wide" | "closed" | "happy";
  readonly mouth?: "flat" | "smile" | "o" | "frown" | "grin";
  /** Arme nach vorn heben (rad; 0 = hängt, π/2 = waagerecht) [Bild links, Bild rechts] */
  readonly reach?: readonly [number, number];
  /** Arme seitlich abspreizen (rad) */
  readonly spread?: readonly [number, number];
  readonly walk?: number;
  readonly look?: number;
  readonly nod?: number;
  readonly lean?: number;
  readonly jar?: { readonly fill: number; readonly painted?: boolean; readonly cobweb?: boolean; readonly glow?: number } | null;
  readonly blinkSeed?: number;
  readonly eyePop?: number;
  readonly talk?: number;
  readonly squash?: number;
  readonly shirt?: string;
  readonly pants?: string;
  readonly brow?: number;
  /** Inhalt in der rechten (Bild rechts) Hand, Ursprung = Handmitte */
  readonly holdR?: React.ReactNode;
  readonly holdL?: React.ReactNode;
  readonly sit?: boolean;
};

const LOOKS: Record<Who, { shirt: string; pants: string; skin: string; hair?: string; height: number }> = {
  ida: { shirt: Z.idaShirt, pants: "#2D3646", skin: Z.skin, hair: Z.idaHair, height: 0.9 },
  anton: { shirt: Z.anton, pants: "#3B4250", skin: "#E8BE98", hair: Z.white, height: 1 },
  sweeper: { shirt: "#5A5F68", pants: "#3A3F48", skin: "#E3B996", hair: Z.plum, height: 0.92 },
  landlord: { shirt: "#3B2F3F", pants: "#262230", skin: "#EBC29B", hair: "#1E1C22", height: 1.05 },
  office: { shirt: Z.coat, pants: "#3A3F48", skin: "#C9D2DA", height: 1.35 },
  worker: { shirt: "#3F5A78", pants: "#2A3240", skin: "#E0B48F", hair: "#2B2522", height: 1 },
  baker: { shirt: "#DCD6CC", pants: "#3A3F48", skin: "#EFC2A0", hair: "#3A2A20", height: 1 },
  kid: { shirt: "#7A4A3A", pants: "#2E3644", skin: "#EBC09A", hair: "#2E2420", height: 0.7 },
  towns: { shirt: "#4E5C70", pants: "#2E3644", skin: "#E2B892", hair: "#30282A", height: 1 },
};

/** Einfacher Mund im Gesicht (z = Vorderseite). */
const Mouth: React.FC<{ readonly kind: NonNullable<KlotzProps["mouth"]>; readonly talk: number }> = ({ kind, talk }) => {
  const z = 0.476;
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
  const wide = kind === "grin" ? 1.35 : 1;
  return (
    <mesh position={[0, down ? -0.27 : -0.17, z]} rotation={[0, 0, down ? 0 : Math.PI]} scale={[wide, 1, 1]}>
      <torusGeometry args={[0.1, 0.022, 8, 20, Math.PI]} />
      <meshBasicMaterial color="#2A1416" />
    </mesh>
  );
};

/** Punktauge mit Glanzpunkt; `wide` = weißer Ring, `closed`/`happy` = Strich/Bogen. */
const Eye: React.FC<{ readonly x: number; readonly kind: NonNullable<KlotzProps["eyes"]>; readonly blink: boolean; readonly pop: number }> = ({ x, kind, blink, pop }) => {
  const z = 0.476;
  if (kind === "closed" || blink)
    return (
      <mesh position={[x, 0.06, z]}>
        <planeGeometry args={[0.16, 0.03]} />
        <meshBasicMaterial color={Z.ink} />
      </mesh>
    );
  if (kind === "happy")
    return (
      <mesh position={[x, 0.03, z]}>
        <torusGeometry args={[0.07, 0.02, 8, 16, Math.PI]} />
        <meshBasicMaterial color={Z.ink} />
      </mesh>
    );
  const s = (kind === "wide" ? 1.25 : 1) * pop;
  return (
    <group position={[x, 0.06, z]} scale={[s, s, 1]}>
      {kind === "wide" ? (
        <mesh position={[0, 0, -0.002]}>
          <circleGeometry args={[0.11, 24]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ) : null}
      <mesh>
        <circleGeometry args={[0.068, 24]} />
        <meshBasicMaterial color={Z.ink} />
      </mesh>
      <mesh position={[0.022, 0.025, 0.002]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

/**
 * Klotzfigur (eigenes Design). Fußpunkt = position; Höhe ≈ 3,0 × Größe der Rolle (`LOOKS.height`) × scale.
 * Kopfmitte bei y ≈ 2,45, Gürtel y ≈ 1,05 (Zeitglas vorn rechts an der Hüfte).
 */
export const Klotz: React.FC<KlotzProps> = (p) => {
  const L = LOOKS[p.who];
  const {
    frame,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    eyes = "dot",
    mouth = "smile",
    reach = [0.15, 0.15],
    spread = [0.08, 0.08],
    walk = 0,
    look = 0,
    nod = 0,
    lean = 0,
    jar,
    blinkSeed = 1,
    eyePop = 1,
    talk = 0,
    squash = 1,
    brow = 0,
    sit = false,
  } = p;
  const shirt = p.shirt ?? L.shirt;
  const pants = p.pants ?? L.pants;
  const k = scale * L.height;
  const ph = frame * 0.32 * (walk || 0);
  const legA = walk ? Math.sin(ph) * 0.55 : 0;
  const bob = walk ? Math.abs(Math.cos(ph)) * 0.07 : Math.sin(frame * 0.06 + blinkSeed) * 0.012;
  const armSwing = walk ? Math.sin(ph) * 0.5 : Math.sin(frame * 0.05 + blinkSeed) * 0.03;
  const blink = blinkAt(frame, blinkSeed);
  const w = 1 / Math.sqrt(squash);
  const isOffice = p.who === "office";
  const head = (
    <group position={[0, 2.42, 0]} rotation={[nod, look, 0]}>
      <RoundedBox args={[1.22, 1.0, 0.95]} radius={0.2} smoothness={3} castShadow>
        <Plastic color={L.skin} rough={0.5} />
      </RoundedBox>
      {isOffice ? (
        // Milchglas-Visier statt Gesicht (keine Augen sichtbar), graue Kappe
        <>
          {/* Visier-Band aus Mattglas über den Augen (kein Bildschirm-Gesicht): dunkler Rahmen, bläulich-frostige Scheibe */}
          <mesh position={[0, 0.06, 0.482]}>
            <planeGeometry args={[1.14, 0.42]} />
            <meshStandardMaterial color="#262B33" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.06, 0.49]}>
            <planeGeometry args={[1.02, 0.3]} />
            <meshPhysicalMaterial color="#9DB6CA" roughness={0.35} transparent opacity={0.95} emissive="#6F92AE" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.24, 0.482]}>
            <planeGeometry args={[0.24, 0.03]} />
            <meshBasicMaterial color="#2A1416" />
          </mesh>
          <RoundedBox args={[1.3, 0.3, 1.02]} radius={0.1} position={[0, 0.5, 0]}>
            <Plastic color="#3F454F" />
          </RoundedBox>
        </>
      ) : (
        <>
          <Eye x={-0.25} kind={eyes} blink={blink} pop={eyePop} />
          <Eye x={0.25} kind={eyes} blink={blink} pop={eyePop} />
          <Mouth kind={mouth} talk={talk} />
          {/* Brauen */}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.25, 0.25 + (eyes === "wide" ? 0.05 : 0), 0.478]} rotation={[0, 0, sd * brow * 0.35]}>
              <planeGeometry args={[p.who === "anton" ? 0.26 : 0.18, p.who === "anton" ? 0.09 : 0.035]} />
              <meshBasicMaterial color={p.who === "anton" ? Z.white : "#3A2A20"} />
            </mesh>
          ))}
        </>
      )}
      {/* Frisur / Kopfbedeckung je Rolle */}
      {p.who === "ida" ? (
        <>
          <RoundedBox args={[1.32, 0.42, 1.04]} radius={0.16} position={[0, 0.36, -0.03]} castShadow>
            <Plastic color={L.hair!} rough={0.55} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.75, 1.0]} radius={0.09} position={[-0.6, -0.05, -0.04]}>
            <Plastic color={L.hair!} rough={0.55} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.75, 1.0]} radius={0.09} position={[0.6, -0.05, -0.04]}>
            <Plastic color={L.hair!} rough={0.55} />
          </RoundedBox>
          <RoundedBox args={[1.3, 0.75, 0.2]} radius={0.09} position={[0, -0.03, -0.5]}>
            <Plastic color={L.hair!} rough={0.55} />
          </RoundedBox>
          {/* Stirnband mit Messing-Lupe */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.27, 0.07, 1.0]} />
            <Matte color="#2B2B30" rough={0.6} />
          </mesh>
          <group position={[0.34, 0.31, 0.52]} rotation={[0.2, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.11, 0.03, 10, 24]} />
              <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.1, 20]} />
              <meshPhysicalMaterial color="#BFE3FF" transparent opacity={0.45} roughness={0.05} />
            </mesh>
          </group>
        </>
      ) : null}
      {p.who === "anton" ? (
        <>
          {[-1, 1].map((sd) => (
            <RoundedBox key={sd} args={[0.2, 0.42, 0.7]} radius={0.08} position={[sd * 0.64, 0.05, -0.08]}>
              <Plastic color={Z.white} rough={0.7} />
            </RoundedBox>
          ))}
          {/* runde Brille */}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.25, 0.06, 0.49]}>
              <torusGeometry args={[0.13, 0.018, 8, 24]} />
              <meshStandardMaterial color="#2A2A2E" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 0.07, 0.49]}>
            <boxGeometry args={[0.12, 0.02, 0.02]} />
            <meshStandardMaterial color="#2A2A2E" metalness={0.6} roughness={0.35} />
          </mesh>
        </>
      ) : null}
      {p.who === "sweeper" ? (
        <>
          <RoundedBox args={[1.36, 0.5, 1.06]} radius={0.2} position={[0, 0.34, -0.03]} castShadow>
            <Plastic color={Z.plum} rough={0.8} />
          </RoundedBox>
          <RoundedBox args={[1.36, 0.8, 0.22]} radius={0.1} position={[0, -0.05, -0.48]}>
            <Plastic color={Z.plum} rough={0.8} />
          </RoundedBox>
          <mesh position={[0, -0.48, 0.3]} rotation={[0.3, 0, Math.PI / 4]}>
            <boxGeometry args={[0.16, 0.16, 0.08]} />
            <Plastic color={Z.plum} rough={0.8} />
          </mesh>
        </>
      ) : null}
      {p.who === "landlord" ? (
        <group position={[0, 0.5, 0]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.06, 28]} />
            <Plastic color="#17151B" />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.5, 0.52, 0.8, 28]} />
            <Plastic color="#17151B" />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.525, 0.525, 0.12, 28]} />
            <Plastic color="#5A2230" />
          </mesh>
        </group>
      ) : null}
      {p.who === "worker" || p.who === "towns" || p.who === "kid" ? (
        <RoundedBox args={[1.28, 0.3, 1.0]} radius={0.12} position={[0, 0.44, -0.02]}>
          <Plastic color={L.hair!} rough={0.7} />
        </RoundedBox>
      ) : null}
      {p.who === "baker" ? (
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.55, 0.42, 0.55, 24]} />
          <Plastic color="#F4F1EA" rough={0.8} />
        </mesh>
      ) : null}
    </group>
  );
  const armX = 0.72;
  const arm = (sd: -1 | 1, i: 0 | 1) => (
    <group key={sd} position={[sd * armX, 1.85, 0]} rotation={[-(reach[i] + (i ? armSwing : -armSwing)), 0, sd * spread[i]]}>
      <RoundedBox args={[0.3, 0.86, 0.32]} radius={0.12} position={[0, -0.4, 0]} castShadow>
        <Plastic color={isOffice ? Z.coat : shirt} />
      </RoundedBox>
      <mesh position={[0, -0.88, 0]} castShadow>
        <sphereGeometry args={[0.19, 16, 12]} />
        <Plastic color={isOffice ? "#2D3036" : L.skin} rough={0.5} />
      </mesh>
      <group position={[0, -0.95, 0.08]}>{i === 1 ? p.holdR : p.holdL}</group>
    </group>
  );
  const leg = (sd: -1 | 1) => (
    <group key={sd} position={[sd * 0.26, sit ? 0.8 : 0.8, 0]} rotation={[sit ? -1.45 : sd * legA, 0, 0]}>
      <RoundedBox args={[0.38, 0.72, 0.42]} radius={0.12} position={[0, -0.36, 0]} castShadow>
        <Plastic color={pants} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.16, 0.52]} radius={0.06} position={[0, -0.72, 0.05]} castShadow>
        <Plastic color="#1E1A1A" rough={0.6} />
      </RoundedBox>
    </group>
  );
  return (
    <group position={[position[0], position[1] + bob * k, position[2]]} rotation={rotation} scale={[k * w, k * squash, k * w]}>
      <group rotation={[lean, 0, 0]}>
        {/* Rumpf (leicht trapezförmig: oben breiter) */}
        <RoundedBox args={[1.06, 1.12, 0.66]} radius={0.16} position={[0, 1.45, 0]} castShadow receiveShadow>
          <Plastic color={isOffice ? Z.coat : shirt} />
        </RoundedBox>
        {isOffice ? (
          // langer Mantel bis unter die Knie
          <RoundedBox args={[1.12, 1.0, 0.72]} radius={0.14} position={[0, 0.72, 0]} castShadow>
            <Plastic color={Z.coat} />
          </RoundedBox>
        ) : null}
        {p.who === "ida" ? (
          <mesh position={[0, 1.2, 0.336]}>
            <planeGeometry args={[0.82, 0.95]} />
            <Matte color={Z.apron} rough={0.85} />
          </mesh>
        ) : null}
        {p.who === "baker" ? (
          <mesh position={[0, 1.2, 0.336]}>
            <planeGeometry args={[0.86, 1.0]} />
            <Matte color="#F4F1EA" rough={0.9} />
          </mesh>
        ) : null}
        {p.who === "anton"
          ? [0, 1, 2].map((b) => (
              <mesh key={b} position={[0, 1.75 - b * 0.25, 0.336]}>
                <circleGeometry args={[0.045, 12]} />
                <meshStandardMaterial color="#3A3027" />
              </mesh>
            ))
          : null}
        {p.who === "sweeper" ? (
          // Schultertuch
          <RoundedBox args={[1.2, 0.36, 0.76]} radius={0.12} position={[0, 1.88, 0]}>
            <Plastic color="#8A6A80" rough={0.85} />
          </RoundedBox>
        ) : null}
        {/* Gürtel */}
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[1.08, 0.12, 0.68]} />
          <meshStandardMaterial color={Z.leather} roughness={0.6} />
        </mesh>
        {jar ? (
          <TimeJar position={[0.42, 0.62, 0.42]} rotation={[0, -0.35, 0]} scale={1.15} fill={jar.fill} painted={jar.painted} cobweb={jar.cobweb} glow={jar.glow ?? 1} />
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

/* ------------------------------------------------------------------ */
/* Licht, Atmosphäre, Partikel                                          */
/* ------------------------------------------------------------------ */

/** Grundstimmung: Hintergrund, Nebel, Himmel-/Bodenlicht, Hauptlicht mit Schatten, Gegenlicht. */
export const Atmos: React.FC<{
  readonly bg?: string;
  readonly fog?: readonly [number, number];
  readonly sky?: string;
  readonly ground?: string;
  readonly hemi?: number;
  readonly keyLight?: { readonly pos: V3; readonly color?: string; readonly intensity?: number; readonly target?: V3 };
  readonly rim?: { readonly pos: V3; readonly color?: string; readonly intensity?: number; readonly target?: V3 };
}> = ({ bg = Z.fogDeep, fog = [10, 46], sky = "#8FA6C6", ground = "#141A24", hemi = 0.9, keyLight: key, rim }) => {
  const kt = useMemo(() => new Object3D(), []);
  const rt = useMemo(() => new Object3D(), []);
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, fog[0], fog[1]]} />
      <hemisphereLight args={[sky, ground, hemi]} />
      {key ? (
        <>
          <primitive object={kt} position={key.target ?? [0, 0, 0]} />
          <directionalLight
            position={key.pos}
            target={kt}
            color={key.color ?? "#CFE0FF"}
            intensity={key.intensity ?? 1.6}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0005}
          />
        </>
      ) : null}
      {rim ? (
        <>
          <primitive object={rt} position={rim.target ?? [0, 1.5, 0]} />
          <directionalLight position={rim.pos} target={rt} color={rim.color ?? "#9CC8FF"} intensity={rim.intensity ?? 2.4} />
        </>
      ) : null}
    </>
  );
};

/** Sichtbarer Lichtkegel (Volumenlicht-Näherung): offener Kegel, additiv, Verlauf von der Quelle weg. */
export const LightShaft: React.FC<{
  readonly from: V3;
  readonly to: V3;
  readonly radius?: number;
  readonly top?: number;
  readonly color?: string;
  readonly opacity?: number;
}> = ({ from, to, radius = 1.6, top = 0.15, color = Z.lamp, opacity = 0.18 }) => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dy, dz) || 1;
  const mid: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  // Zylinder zeigt entlang +y: Drehung so, dass +y → (from - to)
  const ob = new Object3D();
  ob.position.set(...mid);
  ob.lookAt(from[0], from[1], from[2]);
  ob.rotateX(Math.PI / 2);
  const o = ob;
  const tex = shaftTex();
  return (
    <mesh position={mid} quaternion={o.quaternion}>
      <cylinderGeometry args={[top, radius, len, 32, 1, true]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
    </mesh>
  );
};

/** Halo/Bokeh-Scheibe (immer zur Kamera gerichtet über Punkte). */
export const Halo: React.FC<{ readonly at: V3; readonly size?: number; readonly color?: string; readonly opacity?: number }> = ({ at, size = 1.2, color = Z.lamp, opacity = 0.6 }) => {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(at), 3));
    return g;
  }, [at]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color={color} size={size} sizeAttenuation transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
};

/**
 * Schwebende Teilchen (Staub, Sand, Bokeh): `count` Punkte im Kasten `box` (Mitte `center`, Maße `size`),
 * driften mit `drift` je Frame (Einheiten) und wickeln im Kasten um. Deterministisch aus Seed + Frame.
 */
export const Motes: React.FC<{
  readonly frame: number;
  readonly center: V3;
  readonly size: V3;
  readonly count?: number;
  readonly drift?: V3;
  readonly color?: string;
  readonly dot?: number;
  readonly opacity?: number;
  readonly seed?: number;
}> = ({ frame, center, size, count = 120, drift = [0.002, -0.004, 0], color = "#FFE6B0", dot = 0.06, opacity = 0.7, seed = 3 }) => {
  const base = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => [r(), r(), r(), r()]);
  }, [count, seed]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const arr = (geo.getAttribute("position") as BufferAttribute).array as Float32Array;
  const wrap = (v: number) => v - Math.floor(v);
  base.forEach((b, i) => {
    const wob = Math.sin(frame * 0.05 + b[3] * 20) * 0.02;
    arr[i * 3] = center[0] + (wrap(b[0] + (frame * drift[0]) / size[0] + wob) - 0.5) * size[0];
    arr[i * 3 + 1] = center[1] + (wrap(b[1] + (frame * drift[1] * (0.6 + b[3])) / size[1]) - 0.5) * size[1];
    arr[i * 3 + 2] = center[2] + (wrap(b[2] + (frame * drift[2]) / size[2]) - 0.5) * size[2];
  });
  (geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color={color} size={dot} sizeAttenuation transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
};

/** Nieselregen: kurze helle Striche, fallen schräg (deterministisch). */
export const Rain: React.FC<{ readonly frame: number; readonly center: V3; readonly size: V3; readonly count?: number; readonly opacity?: number; readonly seed?: number }> = ({
  frame,
  center,
  size,
  count = 260,
  opacity = 0.32,
  seed = 9,
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
  const len = 0.32;
  base.forEach((b, i) => {
    const y = center[1] + (0.5 - ((b[1] + (frame * 0.28 * b[3]) / size[1]) % 1)) * size[1];
    const x = center[0] + (b[0] - 0.5) * size[0] + (y - center[1]) * 0.08;
    const z = center[2] + (b[2] - 0.5) * size[2];
    arr.set([x, y, z, x - len * 0.08, y + len, z], i * 6);
  });
  (geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#B8CCE6" transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
};

/** Goldener Sandfaden von a nach b (leuchtend) + fallende Körner. */
export const SandStream: React.FC<{ readonly frame: number; readonly from: V3; readonly to: V3; readonly width?: number; readonly on?: number }> = ({
  frame,
  from,
  to,
  width = 0.02,
  on = 1,
}) => {
  if (on <= 0.01) return null;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const mid: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  return (
    <group>
      <mesh position={mid}>
        <cylinderGeometry args={[width * on, width * 0.7 * on, len, 10]} />
        <meshBasicMaterial color={Z.goldHot} toneMapped={false} transparent opacity={0.95} />
      </mesh>
      <Motes frame={frame} center={mid} size={[width * 6, len, width * 6]} count={40} drift={[0, -0.03, 0]} color={Z.goldHot} dot={width * 2.2} opacity={0.9 * on} seed={21} />
      <pointLight position={mid} color={Z.gold} intensity={0.6 * on} distance={3} decay={2} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Kulissen: Boden, Häuser, Laternen                                    */
/* ------------------------------------------------------------------ */

/** Nasses Kopfsteinpflaster (glänzend) mit Lichtpfützen-Streifen unter Laternen. */
export const WetGround: React.FC<{ readonly size?: number; readonly y?: number; readonly glints?: readonly V3[]; readonly glintColor?: string }> = ({
  size = 120,
  y = 0,
  glints = [],
  glintColor = Z.lamp,
}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={cobbleTex(size / 3)} color="#9AA6B8" roughness={0.22} metalness={0.25} />
    </mesh>
    {glints.map((g, i) => (
      // Spiegelung einer Lichtquelle auf nassem Stein: lang gezogener heller Streifen Richtung Kamera
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[g[0], y + 0.01, g[2] + 1.6]}>
        <planeGeometry args={[0.55, 4.2]} />
        <meshBasicMaterial map={softDot()} color={glintColor} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    ))}
  </group>
);

/** Straßenlaterne (Eisenmast, warme Laterne, Licht, Kegel, Halo). `on` 0..1 (Flackern/Aus). */
export const Lamp: React.FC<{ readonly position: V3; readonly on?: number; readonly height?: number; readonly shaft?: boolean; readonly light?: number }> = ({
  position,
  on = 1,
  height = 4.2,
  shaft = true,
  light = 6,
}) => {
  const top: V3 = [position[0], position[1] + height, position[2]];
  return (
    <group>
      <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, height, 10]} />
        <meshStandardMaterial color="#1C2027" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[top[0], top[1] + 0.25, top[2]]}>
        <boxGeometry args={[0.42, 0.5, 0.42]} />
        <meshStandardMaterial color="#FFE2B0" emissive={Z.lamp} emissiveIntensity={2.2 * on} toneMapped={false} />
      </mesh>
      <mesh position={[top[0], top[1] + 0.57, top[2]]}>
        <coneGeometry args={[0.36, 0.22, 4]} />
        <meshStandardMaterial color="#1C2027" metalness={0.6} roughness={0.5} />
      </mesh>
      {on > 0.02 ? (
        <>
          <pointLight position={[top[0], top[1] + 0.1, top[2] + 0.2]} color={Z.lamp} intensity={light * on} distance={14} decay={2} />
          <Halo at={[top[0], top[1] + 0.25, top[2]]} size={2.2} opacity={0.55 * on} />
          {shaft ? <LightShaft from={[top[0], top[1] + 0.1, top[2]]} to={[top[0], position[1], top[2]]} radius={1.7} top={0.2} opacity={0.12 * on} /> : null}
        </>
      ) : null}
    </group>
  );
};

/**
 * Schiefes Klotzhaus (eigene Form): Wandkörper, Satteldach in Kupfer-Grün, Fenster (warm oder kalt,
 * optional goldenes Glas-Glimmen = Zeitglas im Fenster), Tür. Ursprung = Bodenmitte, Front zeigt nach +z.
 */
export const House: React.FC<{
  readonly position: V3;
  readonly w?: number;
  readonly h?: number;
  readonly d?: number;
  readonly color?: string;
  readonly tilt?: number;
  readonly rotY?: number;
  readonly windows?: number;
  readonly lit?: number;
  readonly goldWin?: boolean;
  readonly seed?: number;
}> = ({ position, w = 3.2, h = 5.2, d = 3, color = Z.wallA, tilt = 0, rotY = 0, windows = 2, lit = 0.5, goldWin = false, seed = 1 }) => {
  const r = seeded(seed);
  const rows = Math.max(1, Math.floor((h - 1.6) / 1.5));
  const wins: { x: number; y: number; on: boolean; gold: boolean }[] = [];
  for (let row = 0; row < rows; row++)
    for (let c = 0; c < windows; c++) {
      const v = r();
      wins.push({ x: (c - (windows - 1) / 2) * (w / windows), y: 1.9 + row * 1.5, on: v < lit, gold: goldWin && v < lit * 0.75 });
    }
  return (
    <group position={position} rotation={[0, rotY, tilt]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <Matte color={color} rough={0.85} />
      </mesh>
      {/* Gesims */}
      <mesh position={[0, h + 0.05, 0]}>
        <boxGeometry args={[w + 0.2, 0.18, d + 0.2]} />
        <Matte color={Z.trim} />
      </mesh>
      {/* Satteldach (Prisma) */}
      <mesh position={[0, h + 0.14 + w * 0.28, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[1, 1, 1]} castShadow>
        <cylinderGeometry args={[w * 0.62, w * 0.62, d + 0.5, 3, 1]} />
        <meshStandardMaterial color={Z.copper} roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Schornstein */}
      <mesh position={[w * 0.25, h + w * 0.5, -d * 0.15]}>
        <boxGeometry args={[0.35, 1.0, 0.35]} />
        <Matte color={Z.trim} />
      </mesh>
      {wins.map((wi, i) => (
        <group key={i} position={[wi.x, wi.y, d / 2 + 0.01]}>
          <mesh>
            <planeGeometry args={[0.8, 1.0]} />
            {wi.on ? (
              <meshStandardMaterial color={wi.gold ? "#FFC24A" : "#FFD9A0"} emissive={wi.gold ? Z.gold : Z.lamp} emissiveIntensity={wi.gold ? 1.6 : 0.9} toneMapped={false} />
            ) : (
              <meshStandardMaterial color="#121821" roughness={0.15} metalness={0.4} />
            )}
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.06, 1.0]} />
            <Matte color={Z.trim} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.8, 0.06]} />
            <Matte color={Z.trim} />
          </mesh>
        </group>
      ))}
      {/* Tür */}
      <mesh position={[w * 0.18, 0.75, d / 2 + 0.01]}>
        <planeGeometry args={[0.8, 1.5]} />
        <Matte color={Z.woodDark} />
      </mesh>
    </group>
  );
};

/** Häuserzeile entlang x (Front nach +z) mit Laternen; `seed` variiert Höhen/Farben/Neigung. */
export const HouseRow: React.FC<{
  readonly z: number;
  readonly from?: number;
  readonly to?: number;
  readonly seed?: number;
  readonly lit?: number;
  readonly goldWin?: boolean;
  readonly rotY?: number;
  readonly scale?: number;
}> = ({ z, from = -14, to = 14, seed = 1, lit = 0.45, goldWin = false, rotY = 0, scale = 1 }) => {
  const r = seeded(seed);
  const houses: React.ReactNode[] = [];
  let x = from;
  let i = 0;
  const cols = [Z.wallA, Z.wallB, Z.wallC, "#5E6A7C", "#6F6A78"];
  while (x < to) {
    const w = (2.6 + r() * 1.4) * scale;
    const h = (4.2 + r() * 3.2) * scale;
    houses.push(
      <House
        key={i}
        position={[x + w / 2, 0, z + (r() - 0.5) * 0.6]}
        w={w}
        h={h}
        d={3 * scale}
        color={cols[i % cols.length]}
        tilt={(r() - 0.5) * 0.06}
        windows={w > 3.2 * scale ? 3 : 2}
        lit={lit}
        goldWin={goldWin}
        seed={seed * 31 + i}
      />,
    );
    x += w + 0.05;
    i++;
  }
  return <group rotation={[0, rotY, 0]}>{houses}</group>;
};

/* ------------------------------------------------------------------ */
/* Requisiten                                                           */
/* ------------------------------------------------------------------ */

/** Messing-Zahnrad (Scheibe + Zähne + Speichen), dreht um z. */
export const Gear: React.FC<{ readonly position: V3; readonly radius?: number; readonly teeth?: number; readonly angle?: number; readonly rotation?: V3; readonly color?: string; readonly thick?: number }> = ({
  position,
  radius = 1,
  teeth = 16,
  angle = 0,
  rotation = [0, 0, 0],
  color = Z.brass,
  thick = 0.18,
}) => (
  <group position={position} rotation={rotation}>
    <group rotation={[0, 0, angle]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.86, radius * 0.86, thick, 40, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.32} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius * 0.92, Math.sin(a) * radius * 0.92, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[radius * 0.2, radius * 0.16, thick]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.32} />
          </mesh>
        );
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, thick * 0.6]}>
        <cylinderGeometry args={[radius * 0.16, radius * 0.16, thick * 0.6, 20]} />
        <meshStandardMaterial color="#6F5A2C" metalness={0.8} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3, 4].map((s) => (
        <mesh key={s} position={[0, 0, thick * 0.52]} rotation={[0, 0, (s / 5) * Math.PI * 2]}>
          <boxGeometry args={[radius * 1.4, radius * 0.06, thick * 0.2]} />
          <meshStandardMaterial color="#8A6E34" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
    </group>
  </group>
);

/** Schild/Plakat mit Text (Kit-Schrift) – Wrapper um TextLabel ohne Beleuchtung. */
export { TextLabel } from "../kit/common";

/** Holzbrett/Tisch. */
export const Plank: React.FC<{ readonly size: V3; readonly position: V3; readonly rotation?: V3; readonly color?: string }> = ({ size, position, rotation, color = "#B08A66" }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial map={woodTex()} color={color} roughness={0.7} />
  </mesh>
);

/** Brotlaib (abgerundet) mit Preisschild-Platz. */
export const Bread: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scale?: number }> = ({ position, rotation, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[1.4, 0.55, 0.7]} radius={0.26} smoothness={4} position={[0, 0.27, 0]} castShadow>
      <meshStandardMaterial color="#B87634" roughness={0.75} />
    </RoundedBox>
    {[-0.4, 0, 0.4].map((x) => (
      <mesh key={x} position={[x, 0.53, 0.05]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.06, 0.03, 0.5]} />
        <meshStandardMaterial color="#E7B776" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

/** Messing-Schale (für Sand). */
export const BrassDish: React.FC<{ readonly position: V3; readonly scale?: number; readonly fill?: number }> = ({ position, scale = 1, fill = 0 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.55, 0.35, 0.16, 32, 1, true]} />
      <meshStandardMaterial color={Z.brass} metalness={0.85} roughness={0.25} side={DoubleSide} />
    </mesh>
    <mesh position={[0, 0.005, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 0.01, 32]} />
      <meshStandardMaterial color={Z.brass} metalness={0.85} roughness={0.25} />
    </mesh>
    {fill > 0 ? (
      <mesh position={[0, 0.02 + fill * 0.05, 0]} scale={[1, 0.25 + fill, 1]}>
        <sphereGeometry args={[0.32 + fill * 0.12, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={Z.gold} emissive={Z.gold} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
    ) : null}
  </group>
);

/** Taschenuhr (offen) – Zifferblatt + Messinggehäuse + Zeiger. */
export const PocketWatch: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scale?: number; readonly open?: number; readonly frame: number }> = ({
  position,
  rotation,
  scale = 1,
  open = 1,
  frame,
}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.14, 40]} />
      <meshStandardMaterial color={Z.brass} metalness={0.85} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0, 0.075]}>
      <circleGeometry args={[0.43, 40]} />
      <meshStandardMaterial color="#F2EADB" roughness={0.5} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.35, Math.cos((i / 12) * Math.PI * 2) * 0.35, 0.08]}>
        <boxGeometry args={[0.025, 0.06, 0.005]} />
        <meshBasicMaterial color="#2A2420" />
      </mesh>
    ))}
    <mesh position={[0, 0, 0.085]} rotation={[0, 0, -frame * 0.02]}>
      <boxGeometry args={[0.02, 0.6, 0.006]} />
      <meshBasicMaterial color="#2A2420" />
    </mesh>
    {/* Deckel klappt auf */}
    <group position={[0, 0.5, 0]} rotation={[-open * 1.9, 0, 0]}>
      <mesh position={[0, -0.5, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 40]} />
        <meshStandardMaterial color={Z.brass} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  </group>
);

/** Gerahmtes Bild (echte Textur oder Farbe) an der Wand. */
export const Frame: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly w: number; readonly h: number; readonly map: Texture | null; readonly frameColor?: string; readonly kb?: number }> = ({
  position,
  rotation,
  w,
  h,
  map,
  frameColor = "#2A1D14",
  kb = 0,
}) => {
  if (map) {
    // Ken-Burns: Ausschnitt wandert/zoomt (Texturkoordinaten), Seitenverhältnis wie das Bild (cover)
    const img = map.image as { width: number; height: number } | undefined;
    const ar = img ? img.width / img.height : 1.5;
    const target = w / h;
    const z = 1 - 0.12 * kb;
    const rx = (target < ar ? target / ar : 1) * z;
    const ry = (target < ar ? 1 : ar / target) * z;
    map.repeat.set(rx, ry);
    map.offset.set((1 - rx) * (0.5 + 0.25 * kb - 0.125), (1 - ry) * 0.5);
  }
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[w + 0.24, h + 0.24, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w, h]} />
        {map ? <meshBasicMaterial map={map} toneMapped={false} /> : <meshStandardMaterial color="#222" />}
      </mesh>
    </group>
  );
};

/** Kalenderblatt mit gelbem Pinselstrich (durchgestrichen). */
export const CalendarSheet: React.FC<{ readonly position: V3; readonly crossed?: number; readonly rot?: number }> = ({ position, crossed = 1, rot = 0 }) => (
  <group position={position} rotation={[0, 0, rot]}>
    <mesh>
      <planeGeometry args={[0.5, 0.62]} />
      <meshStandardMaterial color={Z.paper} roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.24, 0.005]}>
      <planeGeometry args={[0.5, 0.14]} />
      <meshStandardMaterial color="#8A3A32" roughness={0.9} />
    </mesh>
    {crossed > 0 ? (
      <mesh position={[0, -0.04, 0.01]} rotation={[0, 0, 0.7]} scale={[crossed, 1, 1]}>
        <planeGeometry args={[0.66, 0.07]} />
        <meshBasicMaterial color="#E9C23A" toneMapped={false} />
      </mesh>
    ) : null}
  </group>
);

/** Innenraum-Kasten (Rückwand, Seitenwand, Boden) mit Holz, warmem Licht. */
export const Room: React.FC<{
  readonly wall?: string;
  readonly floor?: string;
  readonly width?: number;
  readonly depth?: number;
  readonly height?: number;
  readonly windowAt?: V3;
  readonly windowColor?: string;
  readonly windowGlow?: number;
}> = ({ wall = "#4A3A33", floor = "#7A5A40", width = 14, depth = 12, height = 7, windowAt, windowColor = "#3D5A80", windowGlow = 0.8 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={woodTex()} color={floor} roughness={0.55} />
    </mesh>
    <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <Matte color={wall} rough={0.9} />
    </mesh>
    <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[depth, height]} />
      <Matte color={wall} rough={0.9} />
    </mesh>
    <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[depth, height]} />
      <Matte color={wall} rough={0.9} />
    </mesh>
    {windowAt ? (
      <group position={windowAt}>
        <mesh>
          <planeGeometry args={[1.8, 2.2]} />
          <meshBasicMaterial color={windowColor} toneMapped={false} />
        </mesh>
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, 0, 0.02]}>
            <planeGeometry args={[0.07, 2.2]} />
            <Matte color={Z.woodDark} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.8, 0.07]} />
          <Matte color={Z.woodDark} />
        </mesh>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[2.0, 2.4, 0.04]} />
          <Matte color={Z.woodDark} />
        </mesh>
        <Halo at={[0, 0, 0.1]} size={5} color={windowColor} opacity={0.25 * windowGlow} />
      </group>
    ) : null}
  </group>
);

/** Hängelampe (warm) mit Kegel. */
export const HangLamp: React.FC<{ readonly position: V3; readonly on?: number; readonly to?: V3; readonly color?: string; readonly intensity?: number }> = ({
  position,
  on = 1,
  to,
  color = Z.lamp,
  intensity = 9,
}) => (
  <group>
    <mesh position={[position[0], position[1] + 1.2, position[2]]}>
      <cylinderGeometry args={[0.015, 0.015, 2.4, 6]} />
      <meshBasicMaterial color="#1A1A1A" />
    </mesh>
    <mesh position={position}>
      <coneGeometry args={[0.5, 0.45, 24, 1, true]} />
      <meshStandardMaterial color="#2E3A30" metalness={0.5} roughness={0.4} side={DoubleSide} />
    </mesh>
    <mesh position={[position[0], position[1] - 0.15, position[2]]}>
      <sphereGeometry args={[0.16, 16, 12]} />
      <meshBasicMaterial color="#FFF0D0" toneMapped={false} />
    </mesh>
    <pointLight position={[position[0], position[1] - 0.3, position[2]]} color={color} intensity={intensity * on} distance={16} decay={2} castShadow={false} />
    <Halo at={[position[0], position[1] - 0.15, position[2]]} size={1.6} color={color} opacity={0.6 * on} />
    {to ? <LightShaft from={[position[0], position[1] - 0.2, position[2]]} to={to} radius={2.2} top={0.4} color={color} opacity={0.11 * on} /> : null}
  </group>
);
