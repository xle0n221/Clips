/**
 * „What If the Sun Vanished? The First 8:19“ (episodes/sonne-verschwindet.json) – Bau-Kit.
 *
 * Stil (Drehbuch `style`): Cinematic 3D wie Zeit-Welt/Bauarbeiter (PBR-Kunststoff, Volumenlicht, Partikel, Filmkorn),
 * EIGENE Klotzfiguren: JUNO (kleines Mädchen, Würfelkopf, zwei Zopf-Klötze, gelber Sonnenhut, türkises Shirt,
 * rote Shorts, dicke orange Uhr) und GRANDPA ODE (breiter Kasten, grauer Bart-Klotz, runde Brille, senfgelbe Strickjacke).
 * Farblogik: GOLD = Sonnenlicht, das noch unterwegs ist (Strand, Lichtband, Saturn-Glanz) · INDIGO/SCHWARZ = Welt ohne
 * Sonne · EISBLAU = Kälte danach · GRÜN nur an der Tiefsee-Quelle. Keine Marken, keine Logos, keine echten Bilder.
 * Alles aus dem Frame berechnet (Zufall nur mit Seed).
 */
import { RoundedBox } from "@react-three/drei";
import React, { useMemo } from "react";
import { AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, Object3D, RepeatWrapping, SRGBColorSpace } from "three";
import { V3 } from "../kit/camera";
import { blinkAt } from "../kit/motion";
import { seeded } from "../kit/toon";
import { Halo, LightShaft, Motes, softDot, TextLabel } from "./zeitweltSets";

export { Atmos, cut, fly, frameOn, Halo, lerp, lerp3, LightShaft, Motes, ramp, TextLabel } from "./zeitweltSets";

/* ------------------------------------------------------------------ */
/* Palette                                                              */
/* ------------------------------------------------------------------ */

export const S = {
  skyTop: "#1E5FD0",
  skyMid: "#3F8FEA",
  skyLow: "#9FD3F5",
  nightTop: "#03040C",
  nightLow: "#0A1030",
  indigo: "#141A4A",
  indigoDeep: "#0A0E2C",
  gold: "#FFC23A",
  goldHot: "#FFE08A",
  goldPale: "#F2D9A0",
  sand: "#E9C98E",
  sandDark: "#C9A56A",
  sea: "#1FB5B8",
  seaDeep: "#0B6F86",
  foam: "#F4FBFF",
  ice: "#CFE9FF",
  iceBlue: "#7FB8F0",
  vent: "#38F08A",
  skin: "#F0C49C",
  skinDark: "#D9A47A",
  hat: "#FFD21F",
  hatBand: "#E2412E",
  teal: "#16A3A6",
  shorts: "#D93A2E",
  watch: "#FF8A1E",
  hair: "#5A321C",
  cardigan: "#C9952A",
  cardiganDark: "#9E7218",
  trousers: "#4A4E5C",
  beard: "#B9BCC4",
  glasses: "#2A2A30",
  scarf: "#B8323F",
  brass: "#C8963E",
  tripod: "#2A2C34",
  wall: "#2C3260",
  railing: "#1A1E3E",
  towelA: "#F25A4A",
  towelB: "#FFF4E0",
  hud: "#070B1E",
  ink: "#141414",
  white: "#FFFFFF",
  earthSea: "#2F7FE0",
  earthLand: "#5CC46A",
  moon: "#D8DCE6",
  ns: "#3E6BFF",
} as const;


/* ------------------------------------------------------------------ */
/* Bild-Helfer                                                          */
/* ------------------------------------------------------------------ */

const ASPECT = 1080 / 1920;
/** Weltpunkt, der für Kamera pos→look an Bildstelle (xf, yf) im Abstand d (entlang des Strahls) liegt. */
export const atScreen = (cam: { readonly pos: V3; readonly look: V3; readonly fov: number }, xf: number, yf: number, d: number): V3 => {
  const f: V3 = [cam.look[0] - cam.pos[0], cam.look[1] - cam.pos[1], cam.look[2] - cam.pos[2]];
  const fl = Math.hypot(...f);
  const fw: V3 = [f[0] / fl, f[1] / fl, f[2] / fl];
  // right = fw × (0,1,0)
  const r0: V3 = [-fw[2], 0, fw[0]];
  const rl = Math.hypot(...r0) || 1;
  const rt: V3 = [r0[0] / rl, 0, r0[2] / rl];
  const up: V3 = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
  const tan = Math.tan(((cam.fov / 2) * Math.PI) / 180);
  const x = (xf - 0.5) * 2 * tan * ASPECT;
  const y = (0.5 - yf) * 2 * tan;
  const dir: V3 = [fw[0] + rt[0] * x + up[0] * y, fw[1] + rt[1] * x + up[1] * y, fw[2] + rt[2] * x + up[2] * y];
  const dl = Math.hypot(...dir);
  return [cam.pos[0] + (dir[0] / dl) * d, cam.pos[1] + (dir[1] / dl) * d, cam.pos[2] + (dir[2] / dl) * d];
};

/** Drehung, mit der eine +z-Fläche bei p zur Kamera cam schaut. */
export const faceTo = (p: V3, cam: V3): V3 => {
  const o = new Object3D();
  o.position.set(p[0], p[1], p[2]);
  o.lookAt(cam[0], cam[1], cam[2]);
  return [o.rotation.x, o.rotation.y, o.rotation.z];
};

/** Leuchtpunkt wie `Halo`, aber ohne Nebel (für Himmelskörper weit hinten). */
export const Glow: React.FC<{ readonly at: V3; readonly size?: number; readonly color?: string; readonly opacity?: number }> = ({ at, size = 1.2, color = "#FFFFFF", opacity = 0.6 }) => {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(at), 3));
    return g;
  }, [at]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color={color} size={size} sizeAttenuation transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
    </points>
  );
};

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

/** Sand mit Körnung und Wind-Rippeln. */
const sandTex = () =>
  canvasTex("sand", 256, 256, (c) => {
    c.fillStyle = S.sand;
    c.fillRect(0, 0, 256, 256);
    const r = seeded(5);
    for (let i = 0; i < 1400; i++) {
      const l = r();
      c.fillStyle = l > 0.5 ? "rgba(255,240,205,0.5)" : "rgba(160,120,70,0.35)";
      c.fillRect(r() * 256, r() * 256, 1.5, 1.5);
    }
    c.strokeStyle = "rgba(170,130,80,0.25)";
    c.lineWidth = 3;
    for (let y = 10; y < 256; y += 22) {
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) c.lineTo(x, y + Math.sin(x * 0.05 + y) * 4);
      c.stroke();
    }
  }, [10, 10]);

/** Meer: türkise Wellenbänder mit Schaumkronen (wird per offset verschoben). */
const seaTex = () =>
  canvasTex("sea", 256, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, S.seaDeep);
    g.addColorStop(1, S.sea);
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    const r = seeded(17);
    for (let i = 0; i < 90; i++) {
      c.strokeStyle = `rgba(240,255,255,${0.25 + r() * 0.4})`;
      c.lineWidth = 1 + r() * 2.5;
      const x = r() * 256;
      const y = r() * 256;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 10, y - 3, x + 22 + r() * 18, y);
      c.stroke();
    }
  }, [6, 6]);

/** Handtuch mit Streifen. */
const towelTex = () =>
  canvasTex("towel", 128, 256, (c) => {
    for (let k = 0; k < 8; k++) {
      c.fillStyle = k % 2 ? S.towelB : S.towelA;
      c.fillRect(0, k * 32, 128, 32);
    }
    c.fillStyle = "rgba(255,255,255,0.15)";
    c.fillRect(0, 0, 128, 6);
  });

/** Himmelskuppel-Verlauf (Tag). */
const daySkyTex = () =>
  canvasTex("daysky", 8, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, S.skyTop);
    g.addColorStop(0.35, S.skyMid);
    g.addColorStop(0.5, S.skyLow);
    g.addColorStop(1, "#FFF1D0");
    c.fillStyle = g;
    c.fillRect(0, 0, 8, 256);
  });

/** Himmelskuppel-Verlauf (Nacht / ohne Sonne). */
const nightSkyTex = (key: string, top: string, low: string) =>
  canvasTex(`nightsky-${key}`, 8, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, top);
    g.addColorStop(0.5, top);
    g.addColorStop(0.78, low);
    g.addColorStop(1, low);
    c.fillStyle = g;
    c.fillRect(0, 0, 8, 256);
  });

/** Erde: blaue Ozeane, grüne/sandige Kontinente, weiße Wolken. */
const earthTex = () =>
  canvasTex("earth", 512, 256, (c) => {
    c.fillStyle = S.earthSea;
    c.fillRect(0, 0, 512, 256);
    const r = seeded(23);
    const blob = (x: number, y: number, s: number, col: string) => {
      c.fillStyle = col;
      for (let k = 0; k < 9; k++) {
        c.beginPath();
        c.ellipse(x + (r() - 0.5) * s * 1.6, y + (r() - 0.5) * s, s * (0.4 + r() * 0.5), s * (0.3 + r() * 0.4), r() * 3, 0, Math.PI * 2);
        c.fill();
      }
    };
    [[90, 90, 40], [130, 170, 30], [250, 80, 46], [270, 160, 34], [380, 110, 44], [440, 190, 26]].forEach(([x, y, s]) => blob(x, y, s, S.earthLand));
    [[250, 70, 16], [380, 95, 14]].forEach(([x, y, s]) => blob(x, y, s, "#D8C27A"));
    c.fillStyle = "#F4F8FF";
    c.fillRect(0, 0, 512, 14);
    c.fillRect(0, 242, 512, 14);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.4})`;
      c.beginPath();
      c.ellipse(r() * 512, 20 + r() * 216, 14 + r() * 30, 4 + r() * 6, 0, 0, Math.PI * 2);
      c.fill();
    }
  });

/** Saturn: blasse Goldbänder. */
const saturnTex = () =>
  canvasTex("saturn", 256, 128, (c) => {
    const cols = ["#E9D3A0", "#D8B878", "#F2E2B8", "#C9A462", "#E4CC92", "#BF9A5A", "#EAD7AA"];
    let y = 0;
    let i = 0;
    const r = seeded(41);
    while (y < 128) {
      const h = 6 + r() * 14;
      c.fillStyle = cols[i % cols.length];
      c.fillRect(0, y, 256, h);
      y += h;
      i++;
    }
  });

/** Saturnring: konzentrische Streifen mit Cassini-Lücke (Alpha). */
const ringTex = () =>
  canvasTex("satring", 512, 8, (c) => {
    for (let x = 0; x < 512; x++) {
      const u = x / 512;
      const gap = u > 0.62 && u < 0.67;
      const a = gap ? 0.08 : 0.55 + 0.4 * Math.sin(u * 60) * Math.sin(u * 13);
      c.fillStyle = `rgba(${230 - u * 40},${205 - u * 40},${150 - u * 30},${Math.max(0.1, Math.min(1, a))})`;
      c.fillRect(x, 0, 1, 8);
    }
  });

/** Okular-Maske: schwarz mit rundem Loch, weicher Rand + Messingring. */
const maskTex = () =>
  canvasTex("eyepiece", 512, 512, (c) => {
    c.fillStyle = "#000000";
    c.fillRect(0, 0, 512, 512);
    c.globalCompositeOperation = "destination-out";
    const g = c.createRadialGradient(256, 256, 150, 256, 256, 172);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.beginPath();
    c.arc(256, 256, 172, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = "source-over";
    c.strokeStyle = "rgba(200,150,62,0.55)";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(256, 256, 178, 0, Math.PI * 2);
    c.stroke();
  });

/** Eis-Haut: weiße Schollen mit Rissen. */
const iceTex = () =>
  canvasTex("ice", 256, 256, (c) => {
    c.fillStyle = "#E6F3FF";
    c.fillRect(0, 0, 256, 256);
    const r = seeded(61);
    c.strokeStyle = "rgba(90,140,200,0.6)";
    c.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      c.beginPath();
      let x = r() * 256;
      let y = r() * 256;
      c.moveTo(x, y);
      for (let k = 0; k < 5; k++) {
        x += (r() - 0.5) * 70;
        y += (r() - 0.5) * 70;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let i = 0; i < 300; i++) {
      c.fillStyle = `rgba(255,255,255,${r() * 0.6})`;
      c.fillRect(r() * 256, r() * 256, 2, 2);
    }
  }, [5, 5]);

/** Eis-Textur (auch für die Unterseite der Eisdecke beim Tauchen). */
export const iceUnderTex = () => iceTex();

/** Fensterraster der Häuser in der Nacht (wenige warmweiß). */
const windowsTex = (seed: number) =>
  canvasTex(`swin-${seed}`, 128, 256, (c) => {
    c.fillStyle = "#0B0F2A";
    c.fillRect(0, 0, 128, 256);
    const r = seeded(seed);
    for (let y = 8; y < 256; y += 18)
      for (let x = 8; x < 128; x += 16) {
        const on = r();
        c.fillStyle = on > 0.86 ? "#F5E6C8" : "#151A3A";
        c.fillRect(x, y, 9, 11);
      }
  });

/* ------------------------------------------------------------------ */
/* Material-Kurzformen                                                  */
/* ------------------------------------------------------------------ */

export const Plastic: React.FC<{ readonly color: string; readonly rough?: number; readonly emissive?: string; readonly ei?: number }> = ({ color, rough = 0.42, emissive, ei = 0 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.55} clearcoatRoughness={0.35} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
);
export const Matte: React.FC<{ readonly color: string; readonly rough?: number; readonly metal?: number }> = ({ color, rough = 0.8, metal = 0 }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
);

/* ------------------------------------------------------------------ */
/* Gesicht (gemeinsam)                                                  */
/* ------------------------------------------------------------------ */

type EyesKind = "dot" | "wide" | "closed" | "happy";
type MouthKind = "flat" | "smile" | "o" | "frown" | "grin" | "yawn";

const Eye: React.FC<{ readonly x: number; readonly y: number; readonly z: number; readonly kind: EyesKind; readonly blink: boolean; readonly s: number; readonly r?: number }> = ({ x, y, z, kind, blink, s, r = 0.06 }) => {
  if (kind === "closed" || blink)
    return (
      <mesh position={[x, y - 0.01, z]} rotation={[0, 0, 0]}>
        <torusGeometry args={[r * 0.9, r * 0.25, 6, 14, Math.PI]} />
        <meshBasicMaterial color={S.ink} />
      </mesh>
    );
  if (kind === "happy")
    return (
      <mesh position={[x, y - 0.02, z]}>
        <torusGeometry args={[r * 0.9, r * 0.28, 6, 14, Math.PI]} />
        <meshBasicMaterial color={S.ink} />
      </mesh>
    );
  const k = (kind === "wide" ? 1.25 : 1) * s;
  return (
    <group position={[x, y, z]} scale={[k, k, 1]}>
      {kind === "wide" ? (
        <mesh position={[0, 0, -0.002]}>
          <circleGeometry args={[r * 1.55, 22]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ) : null}
      <mesh>
        <circleGeometry args={[r, 22]} />
        <meshBasicMaterial color={S.ink} />
      </mesh>
      <mesh position={[r * 0.33, r * 0.36, 0.002]}>
        <circleGeometry args={[r * 0.3, 10]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

const MouthEl: React.FC<{ readonly kind: MouthKind; readonly y: number; readonly z: number; readonly w?: number; readonly talk?: number }> = ({ kind, y, z, w = 0.08, talk = 0 }) => {
  if (kind === "yawn" || kind === "o" || talk > 0.1)
    return (
      <mesh position={[0, y, z]} scale={[1, kind === "yawn" ? 1.6 : kind === "o" ? 1 : 0.45 + talk * 0.6, 1]}>
        <circleGeometry args={[w * (kind === "yawn" ? 0.9 : 0.62), 20]} />
        <meshBasicMaterial color="#3A1418" />
      </mesh>
    );
  if (kind === "flat")
    return (
      <mesh position={[0, y, z]}>
        <planeGeometry args={[w * 2, w * 0.36]} />
        <meshBasicMaterial color="#3A1418" />
      </mesh>
    );
  if (kind === "grin")
    return (
      <mesh position={[0, y + w * 0.3, z]} rotation={[0, 0, Math.PI]}>
        <circleGeometry args={[w * 1.05, 20, 0, Math.PI]} />
        <meshBasicMaterial color="#3A1418" />
      </mesh>
    );
  const down = kind === "frown";
  return (
    <mesh position={[0, y + (down ? -w * 0.5 : w * 0.25), z]} rotation={[0, 0, down ? 0 : Math.PI]}>
      <torusGeometry args={[w, w * 0.22, 8, 18, Math.PI]} />
      <meshBasicMaterial color="#3A1418" />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* JUNO                                                                 */
/* ------------------------------------------------------------------ */

export type JunoProps = {
  readonly frame: number;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly eyes?: EyesKind;
  readonly mouth?: MouthKind;
  readonly talk?: number;
  /** Haltung: stehen, sitzen (Beine nach vorn), liegen (auf dem Rücken, Kopf nach −z, Gesicht nach oben) */
  readonly pose?: "stand" | "sit" | "lie";
  /** Oberkörper zurücklehnen (rad, beim Sitzen auf die Hände gestützt) */
  readonly lean?: number;
  /** Arme nach vorn [links, rechts] (rad) */
  readonly reach?: readonly [number, number];
  /** Arme seitlich [links, rechts] (rad) */
  readonly spread?: readonly [number, number];
  readonly nod?: number;
  readonly look?: number;
  readonly tilt?: number;
  readonly eyePop?: number;
  readonly blinkSeed?: number;
  /** goldener Rand-/Gesichtsschimmer 0..1 (Sonnenlicht) bzw. kalter Sternenschimmer (cold 0..1) */
  readonly glow?: number;
  readonly cold?: number;
  readonly holdR?: React.ReactNode;
  readonly holdL?: React.ReactNode;
  readonly hat?: boolean;
  /** Strecken (0..1): Arme hoch über den Kopf */
  readonly stretch?: number;
};

/**
 * Juno (eigene Klotzfigur, ca. 10 Jahre). Fußpunkt = position, Blick nach +z. Höhe ≈ 2,6 (Hutkrone).
 * Kopfmitte y ≈ 1,87 (stehend), Gesicht z = 0,43, Uhr am linken Handgelenk (Bild rechts bei Frontalsicht).
 * Schulter (±0,56, 1,33).
 */
export const Juno: React.FC<JunoProps> = (p) => {
  const {
    frame,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    eyes = "dot",
    mouth = "smile",
    talk = 0,
    pose = "stand",
    lean = 0,
    reach = [0.1, 0.1],
    spread = [0.12, 0.12],
    nod = 0,
    look = 0,
    tilt = 0,
    eyePop = 1,
    blinkSeed = 1,
    glow = 0,
    cold = 0,
    hat = true,
    stretch = 0,
  } = p;
  const idle = Math.sin(frame * 0.06 + blinkSeed) * 0.012;
  const blink = eyes !== "closed" && blinkAt(frame, blinkSeed);
  const faceZ = 0.432;
  const head = (
    <group position={[0, 1.42, 0]} rotation={[nod, look, tilt]}>
      <group position={[0, 0.45, 0]}>
        <RoundedBox args={[0.86, 0.84, 0.84]} radius={0.14} smoothness={3} castShadow>
          <Plastic color={S.skin} rough={0.5} emissive={cold > 0 ? "#6FA0FF" : S.gold} ei={0.05 * glow + 0.06 * cold} />
        </RoundedBox>
        {/* Wangen */}
        {[-1, 1].map((sd) => (
          <mesh key={`ch${sd}`} position={[sd * 0.26, -0.1, faceZ + 0.001]}>
            <circleGeometry args={[0.07, 16]} />
            <meshBasicMaterial color="#F59A8A" transparent opacity={0.55} />
          </mesh>
        ))}
        <Eye x={-0.18} y={0.06} z={faceZ + 0.002} kind={eyes} blink={blink} s={eyePop} />
        <Eye x={0.18} y={0.06} z={faceZ + 0.002} kind={eyes} blink={blink} s={eyePop} />
        <MouthEl kind={mouth} y={-0.17} z={faceZ + 0.002} talk={talk} />
        {/* Pony + Haar-Kappe */}
        <RoundedBox args={[0.9, 0.2, 0.88]} radius={0.06} position={[0, 0.36, -0.01]} castShadow>
          <Plastic color={S.hair} rough={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.9, 0.5, 0.2]} radius={0.06} position={[0, 0.12, -0.36]}>
          <Plastic color={S.hair} rough={0.6} />
        </RoundedBox>
        {/* zwei kurze Zopf-Klötze */}
        {[-1, 1].map((sd) => (
          <group key={`pt${sd}`} position={[sd * 0.5, -0.02, -0.12]} rotation={[0, 0, sd * (0.35 + Math.sin(frame * 0.11 + sd) * 0.05)]}>
            <RoundedBox args={[0.18, 0.34, 0.2]} radius={0.06} position={[0, -0.14, 0]} castShadow>
              <Plastic color={S.hair} rough={0.6} />
            </RoundedBox>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.2, 0.06, 0.22]} />
              <meshStandardMaterial color={S.hatBand} />
            </mesh>
          </group>
        ))}
        {/* gelber Sonnenhut */}
        {hat ? (
          <group position={[0, 0.47, -0.02]} rotation={[-0.12, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.78, 0.8, 0.05, 36]} />
              <Plastic color={cold > 0.5 ? "#A9C2E0" : S.hat} rough={0.55} />
            </mesh>
            <mesh position={[0, 0.17, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.47, 0.32, 30]} />
              <Plastic color={cold > 0.5 ? "#A9C2E0" : S.hat} rough={0.55} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.475, 0.475, 0.09, 30]} />
              <meshStandardMaterial color={S.hatBand} roughness={0.6} />
            </mesh>
          </group>
        ) : null}
      </group>
    </group>
  );
  const sit = pose === "sit";
  const arm = (sd: -1 | 1, i: 0 | 1) => {
    const up = stretch * 2.9;
    const rx = -(reach[i] + up + (i ? -idle : idle));
    const rz = sd * spread[i] * (1 - stretch * 0.6);
    return (
      <group key={`a${sd}`} position={[sd * 0.56, 1.33, 0]} rotation={[rx, 0, rz]}>
        <RoundedBox args={[0.3, 0.3, 0.32]} radius={0.09} position={[0, -0.1, 0]} castShadow>
          <Plastic color={S.teal} />
        </RoundedBox>
        <RoundedBox args={[0.22, 0.42, 0.24]} radius={0.08} position={[0, -0.38, 0]} castShadow>
          <Plastic color={S.skin} rough={0.5} />
        </RoundedBox>
        {/* dicke orange Uhr am linken Handgelenk */}
        {sd < 0 ? (
          <group position={[0, -0.55, 0]}>
            <RoundedBox args={[0.27, 0.12, 0.29]} radius={0.04} castShadow>
              <Plastic color={S.watch} rough={0.35} />
            </RoundedBox>
            <mesh position={[0, 0, 0.148]}>
              <circleGeometry args={[0.085, 20]} />
              <meshStandardMaterial color="#FFF7E6" roughness={0.3} />
            </mesh>
          </group>
        ) : null}
        <RoundedBox args={[0.24, 0.22, 0.24]} radius={0.08} position={[0, -0.7, 0]} castShadow>
          <Plastic color={S.skin} rough={0.5} />
        </RoundedBox>
        <group position={[0, -0.78, 0.08]}>{i === 1 ? p.holdR : p.holdL}</group>
      </group>
    );
  };
  const leg = (sd: -1 | 1) => (
    <group key={`l${sd}`} position={[sd * 0.22, 0.55, 0]} rotation={[sit ? -Math.PI / 2 : 0, 0, 0]}>
      <RoundedBox args={[0.3, 0.42, 0.32]} radius={0.09} position={[0, -0.22, 0]} castShadow>
        <Plastic color={S.skin} rough={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.32, 0.14, 0.42]} radius={0.05} position={[0, -0.47, 0.05]} castShadow>
        <Plastic color="#FFFFFF" rough={0.5} />
      </RoundedBox>
    </group>
  );
  const body = (
    <>
      {/* Oberkörper (lehnt um die Hüfte) */}
      <group position={[0, 0.55, 0]} rotation={[-lean, 0, 0]}>
        <group position={[0, -0.55, 0]}>
          <RoundedBox args={[0.9, 0.66, 0.54]} radius={0.12} position={[0, 1.07, 0]} castShadow receiveShadow>
            <Plastic color={S.teal} />
          </RoundedBox>
          {/* Sonne auf dem Shirt? nein – schlichter heller Kragen */}
          <mesh position={[0, 1.34, 0.272]}>
            <planeGeometry args={[0.32, 0.06]} />
            <meshStandardMaterial color="#E6FFFB" />
          </mesh>
          {head}
          {arm(-1, 0)}
          {arm(1, 1)}
        </group>
      </group>
      {/* Shorts */}
      <RoundedBox args={[0.86, 0.3, 0.56]} radius={0.1} position={[0, 0.66, 0]} castShadow>
        <Plastic color={S.shorts} />
      </RoundedBox>
      {leg(-1)}
      {leg(1)}
    </>
  );
  if (pose === "lie")
    return (
      <group position={[position[0], position[1] + 0.4 * scale, position[2]]} rotation={rotation} scale={scale}>
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.6]}>
          {body}
        </group>
      </group>
    );
  return (
    <group position={[position[0], position[1] + (sit ? -0.42 : idle) * scale, position[2]]} rotation={rotation} scale={scale}>
      {body}
    </group>
  );
};

/** Kopfmitte von Juno in Weltkoordinaten (ohne Drehung): stehend, sitzend, liegend. */
export const junoHead = (pos: V3, pose: "stand" | "sit" | "lie" = "stand", scale = 1, lean = 0): V3 =>
  pose === "lie"
    ? [pos[0], pos[1] + 0.4 * scale, pos[2] + (0.6 - 1.87) * scale]
    : [pos[0], pos[1] + ((pose === "sit" ? 0.13 : 0.55) + 1.32 * Math.cos(lean)) * scale, pos[2] - 1.32 * Math.sin(lean) * scale];

/* ------------------------------------------------------------------ */
/* GRANDPA ODE                                                          */
/* ------------------------------------------------------------------ */

export type OdeProps = {
  readonly frame: number;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly eyes?: EyesKind;
  readonly mouth?: MouthKind;
  readonly talk?: number;
  readonly nod?: number;
  readonly look?: number;
  readonly tilt?: number;
  readonly lean?: number;
  readonly brow?: number;
  readonly reach?: readonly [number, number];
  readonly spread?: readonly [number, number];
  /** rechte Hand winkt (0..1) */
  readonly wave?: number;
  readonly eyePop?: number;
  readonly blinkSeed?: number;
  readonly scarf?: boolean;
  /** Atemwolke (0..1) */
  readonly breath?: number;
  readonly holdR?: React.ReactNode;
};

/**
 * Grandpa Ode (eigene Klotzfigur): breiter Kasten, grauer Bart-Klotz, runde Brille, senfgelbe Strickjacke.
 * Fußpunkt = position, Blick nach +z. Kopfmitte y ≈ 2,72, Gesicht z = 0,49, Schulter (±0,86, 2,05).
 */
export const Ode: React.FC<OdeProps> = (p) => {
  const {
    frame,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    eyes = "dot",
    mouth = "smile",
    talk = 0,
    nod = 0,
    look = 0,
    tilt = 0,
    lean = 0,
    brow = 0,
    reach = [0.12, 0.12],
    spread = [0.1, 0.1],
    wave = 0,
    eyePop = 1,
    blinkSeed = 4,
    scarf = false,
    breath = 0,
  } = p;
  const idle = Math.sin(frame * 0.045 + blinkSeed) * 0.012;
  const blink = eyes !== "closed" && blinkAt(frame, blinkSeed);
  const fz = 0.49;
  const head = (
    <group position={[0, 2.2, 0]} rotation={[nod, look, tilt]}>
      <group position={[0, 0.52, 0]}>
        <RoundedBox args={[0.98, 0.96, 0.96]} radius={0.15} smoothness={3} castShadow>
          <Plastic color={S.skin} rough={0.55} />
        </RoundedBox>
        <Eye x={-0.21} y={0.1} z={fz + 0.003} kind={eyes} blink={blink} s={eyePop} r={0.055} />
        <Eye x={0.21} y={0.1} z={fz + 0.003} kind={eyes} blink={blink} s={eyePop} r={0.055} />
        {/* runde Brille */}
        {[-1, 1].map((sd) => (
          <mesh key={`g${sd}`} position={[sd * 0.21, 0.1, fz + 0.03]}>
            <torusGeometry args={[0.13, 0.022, 8, 28]} />
            <meshStandardMaterial color={S.glasses} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.12, fz + 0.03]}>
          <boxGeometry args={[0.16, 0.025, 0.02]} />
          <meshStandardMaterial color={S.glasses} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Augenbrauen (heben = brow) */}
        {[-1, 1].map((sd) => (
          <RoundedBox key={`b${sd}`} args={[0.22, 0.07, 0.06]} radius={0.02} position={[sd * 0.21, 0.3 + brow * (sd > 0 ? 0.09 : 0.03), fz + 0.03]} rotation={[0, 0, sd * (0.1 - brow * (sd > 0 ? 0.25 : 0))]}>
            <Plastic color={S.beard} rough={0.7} />
          </RoundedBox>
        ))}
        {/* Nase */}
        <RoundedBox args={[0.16, 0.18, 0.12]} radius={0.04} position={[0, -0.04, fz + 0.04]}>
          <Plastic color={S.skinDark} rough={0.5} />
        </RoundedBox>
        {/* Bart-Klotz + Schnurrbart, Mund dazwischen */}
        <RoundedBox args={[0.9, 0.42, 0.22]} radius={0.1} position={[0, -0.36, fz - 0.04]} castShadow>
          <Plastic color={S.beard} rough={0.75} />
        </RoundedBox>
        <RoundedBox args={[0.5, 0.1, 0.1]} radius={0.04} position={[0, -0.14, fz + 0.05]}>
          <Plastic color={S.beard} rough={0.75} />
        </RoundedBox>
        <MouthEl kind={mouth} y={-0.25} z={fz + 0.075} w={0.085} talk={talk} />
        {/* Glatze oben, graue Haarbüschel seitlich */}
        {[-1, 1].map((sd) => (
          <RoundedBox key={`h${sd}`} args={[0.14, 0.4, 0.6]} radius={0.06} position={[sd * 0.5, 0.18, -0.1]}>
            <Plastic color={S.beard} rough={0.75} />
          </RoundedBox>
        ))}
        {/* Atemwolke */}
        {breath > 0.02 ? <Halo at={[0, -0.25, fz + 0.4 + breath * 0.3]} size={0.7 + breath * 0.5} color="#DDEBFF" opacity={0.35 * breath} /> : null}
      </group>
    </group>
  );
  const arm = (sd: -1 | 1, i: 0 | 1) => {
    let rx = -(reach[i] + (i ? -idle : idle));
    let rz = sd * spread[i];
    if (i === 1 && wave > 0) {
      rz = sd * (spread[i] + 2.5 * wave);
      rx = rx * (1 - wave) - 0.15 * wave;
    }
    const wag = i === 1 && wave > 0 ? Math.sin(frame * 0.5) * 0.35 * wave : 0;
    return (
      <group key={`a${sd}`} position={[sd * 0.86, 2.05, 0]} rotation={[rx, 0, rz + wag]}>
        <RoundedBox args={[0.38, 1.0, 0.4]} radius={0.13} position={[0, -0.46, 0]} castShadow>
          <Plastic color={S.cardigan} rough={0.85} />
        </RoundedBox>
        <RoundedBox args={[0.32, 0.3, 0.34]} radius={0.1} position={[0, -1.02, 0]} castShadow>
          <Plastic color={S.skin} rough={0.55} />
        </RoundedBox>
        <group position={[0, -1.08, 0.1]}>{i === 1 ? p.holdR : null}</group>
      </group>
    );
  };
  const leg = (sd: -1 | 1) => (
    <group key={`l${sd}`} position={[sd * 0.32, 0.82, 0]}>
      <RoundedBox args={[0.5, 0.7, 0.52]} radius={0.12} position={[0, -0.38, 0]} castShadow>
        <Plastic color={S.trousers} rough={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.54, 0.18, 0.66]} radius={0.06} position={[0, -0.74, 0.06]} castShadow>
        <Plastic color="#2B1F18" rough={0.6} />
      </RoundedBox>
    </group>
  );
  return (
    <group position={[position[0], position[1] + idle * scale, position[2]]} rotation={rotation} scale={scale}>
      <group position={[0, 0.82, 0]} rotation={[lean, 0, 0]}>
        <group position={[0, -0.82, 0]}>
          {/* Strickjacke (Kasten) + Hemd-Streifen + Knöpfe */}
          <RoundedBox args={[1.6, 1.36, 0.94]} radius={0.18} position={[0, 1.48, 0]} castShadow receiveShadow>
            <Plastic color={S.cardigan} rough={0.85} />
          </RoundedBox>
          <mesh position={[0, 1.62, 0.473]}>
            <planeGeometry args={[0.3, 1.0]} />
            <Matte color="#E8E4DA" />
          </mesh>
          {[1.3, 1.55, 1.8].map((y) => (
            <mesh key={y} position={[0.2, y, 0.48]}>
              <circleGeometry args={[0.045, 14]} />
              <meshStandardMaterial color={S.cardiganDark} />
            </mesh>
          ))}
          {/* Taschen */}
          {[-1, 1].map((sd) => (
            <mesh key={`p${sd}`} position={[sd * 0.5, 1.12, 0.475]}>
              <planeGeometry args={[0.38, 0.26]} />
              <meshStandardMaterial color={S.cardiganDark} />
            </mesh>
          ))}
          {scarf ? (
            <>
              <RoundedBox args={[1.2, 0.26, 1.0]} radius={0.1} position={[0, 2.18, 0]} castShadow>
                <Plastic color={S.scarf} rough={0.9} />
              </RoundedBox>
              <RoundedBox args={[0.24, 0.7, 0.12]} radius={0.06} position={[0.32, 1.85, 0.52]} rotation={[0, 0, 0.12]}>
                <Plastic color={S.scarf} rough={0.9} />
              </RoundedBox>
            </>
          ) : null}
          {head}
          {arm(-1, 0)}
          {arm(1, 1)}
        </group>
      </group>
      {leg(-1)}
      {leg(1)}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Himmel, Sonne, Sterne                                                */
/* ------------------------------------------------------------------ */

/** Himmelskuppel: `day` 1 = blauer Mittagshimmel, 0 = schwarz (Welt ohne Sonne). */
export const SkyDome: React.FC<{ readonly day?: number; readonly radius?: number; readonly night?: "black" | "indigo" }> = ({ day = 1, radius = 300, night = "black" }) => {
  const dTex = daySkyTex();
  const nTex = night === "indigo" ? nightSkyTex("indigo", "#070A26", "#1C2560") : nightSkyTex("black", S.nightTop, "#0B1238");
  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 32, 16]} />
        <meshBasicMaterial map={nTex} side={BackSide} fog={false} toneMapped={false} depthWrite={false} />
      </mesh>
      {day > 0.01 ? (
        <mesh scale={0.99}>
          <sphereGeometry args={[radius, 32, 16]} />
          <meshBasicMaterial map={dTex} side={BackSide} fog={false} toneMapped={false} transparent opacity={day} depthWrite={false} />
        </mesh>
      ) : null}
    </>
  );
};

/** Sternfeld als Kugelschale (Punkte), `show` 0..1 blendet ein. Deterministisch. */
export const Stars: React.FC<{ readonly radius?: number; readonly count?: number; readonly show?: number; readonly dot?: number; readonly frame?: number; readonly center?: V3; readonly upper?: boolean }> = ({
  radius = 200,
  count = 700,
  show = 1,
  dot = 1.6,
  frame = 0,
  center = [0, 0, 0],
  upper = false,
}) => {
  const geo = useMemo(() => {
    const r = seeded(77);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1;
      const yv = upper ? Math.abs(u) * 0.95 + 0.05 : u;
      const th = r() * Math.PI * 2;
      const s = Math.sqrt(1 - yv * yv);
      arr.set([center[0] + radius * s * Math.cos(th), center[1] + radius * yv, center[2] + radius * s * Math.sin(th)], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(arr, 3));
    return g;
  }, [count, radius, center, upper]);
  if (show <= 0.01) return null;
  const tw = 0.85 + 0.15 * Math.sin(frame * 0.4);
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color="#F4F6FF" size={dot} sizeAttenuation transparent opacity={show * tw} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
    </points>
  );
};

/**
 * Sonne am Himmel / im All. `on` 1 = gleißende Scheibe, 0 = weg. `ring` 0..1 = dünner goldener Ring um die leere Stelle
 * (das letzte Licht), `ghost` = gestrichelter Umriss „NOTHING HERE“. Scheibe zeigt immer zur +z-Seite (billboard grob).
 */
export const SunDisc: React.FC<{ readonly position: V3; readonly radius?: number; readonly on?: number; readonly ring?: number; readonly ghost?: number; readonly rotation?: V3; readonly black?: number }> = ({
  position,
  radius = 6,
  on = 1,
  ring = 0,
  ghost = 0,
  rotation = [0, 0, 0],
  black = 1,
}) => (
  <group position={position} rotation={rotation}>
    {on > 0.01 ? (
      <>
        <mesh>
          <circleGeometry args={[radius, 48]} />
          <meshBasicMaterial color={S.goldHot} transparent opacity={on} fog={false} toneMapped={false} />
        </mesh>
        <Glow at={[0, 0, 0.1]} size={radius * 5.5} color={S.gold} opacity={0.75 * on} />
        <Glow at={[0, 0, 0.2]} size={radius * 11} color="#FFE7A8" opacity={0.35 * on} />
      </>
    ) : null}
    {on < 0.99 && black > 0 ? (
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={(1 - on) * black} fog={false} />
      </mesh>
    ) : null}
    {ring > 0.01 ? (
      <>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[radius * 1.0, radius * 1.09, 64]} />
          <meshBasicMaterial color={S.gold} transparent opacity={ring} fog={false} toneMapped={false} blending={AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[radius * 1.09, radius * 1.45, 64]} />
          <meshBasicMaterial color={S.gold} transparent opacity={ring * 0.22} fog={false} toneMapped={false} blending={AdditiveBlending} />
        </mesh>
      </>
    ) : null}
    {ghost > 0.01
      ? Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0.03]} rotation={[0, 0, a + Math.PI / 2]}>
              <planeGeometry args={[radius * 0.13, radius * 0.035]} />
              <meshBasicMaterial color={S.goldPale} transparent opacity={ghost * 0.85} fog={false} toneMapped={false} />
            </mesh>
          );
        })
      : null}
  </group>
);

/* ------------------------------------------------------------------ */
/* Strand                                                               */
/* ------------------------------------------------------------------ */

/** Möwe (V-Form, schlägt mit den Flügeln). */
export const Gull: React.FC<{ readonly position: V3; readonly frame: number; readonly seed?: number; readonly scale?: number }> = ({ position, frame, seed = 0, scale = 1 }) => {
  const flap = Math.sin(frame * 0.35 + seed * 2) * 0.45;
  return (
    <group position={position} scale={scale}>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.32, 0, 0]} rotation={[0, 0, sd * flap]}>
          <boxGeometry args={[0.6, 0.05, 0.16]} />
          <meshStandardMaterial color="#F6F6F2" />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[0.16, 0.12, 0.34]} />
        <meshStandardMaterial color="#F6F6F2" />
      </mesh>
    </group>
  );
};

/** Einfacher Strandgast (Hintergrund-Klotz). */
export const Bather: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly color: string; readonly frame: number; readonly seed?: number; readonly look?: number; readonly arm?: number; readonly scale?: number }> = ({
  position,
  rotation = [0, 0, 0],
  color,
  frame,
  seed = 0,
  look = 0,
  arm = 0,
  scale = 1,
}) => {
  const bob = Math.abs(Math.sin(frame * 0.08 + seed)) * 0.04;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={rotation} scale={scale}>
      <RoundedBox args={[0.7, 0.8, 0.45]} radius={0.12} position={[0, 0.95, 0]} castShadow>
        <Plastic color={color} />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.55, 0.4]} radius={0.1} position={[0, 0.3, 0]} castShadow>
        <Plastic color={S.skinDark} />
      </RoundedBox>
      <group position={[0, 1.4, 0]} rotation={[-look, 0, 0]}>
        <RoundedBox args={[0.6, 0.58, 0.58]} radius={0.12} position={[0, 0.3, 0]} castShadow>
          <Plastic color={seed % 2 ? S.skin : "#C98E62"} />
        </RoundedBox>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.12, 0.34, 0.292]}>
            <circleGeometry args={[0.04, 12]} />
            <meshBasicMaterial color={S.ink} />
          </mesh>
        ))}
      </group>
      <group position={[0.42, 1.25, 0]} rotation={[-arm * 2.6, 0, 0.2]}>
        <RoundedBox args={[0.2, 0.62, 0.22]} radius={0.07} position={[0, -0.28, 0]}>
          <Plastic color={S.skinDark} />
        </RoundedBox>
      </group>
    </group>
  );
};

/** Sonnenschirm (gestreift, eigene Farben). */
export const Umbrella: React.FC<{ readonly position: V3; readonly colors?: readonly [string, string] }> = ({ position, colors = [S.white, "#2E9BD6"] }) => (
  <group position={position}>
    <mesh position={[0, 1.4, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
      <meshStandardMaterial color="#EDEDED" />
    </mesh>
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[0, 2.85, 0]} rotation={[0, (i / 8) * Math.PI * 2, 0]} castShadow>
        <coneGeometry args={[1.8, 0.6, 8, 1, true, 0, Math.PI / 4]} />
        <meshStandardMaterial color={colors[i % 2]} side={DoubleSide} roughness={0.7} />
      </mesh>
    ))}
  </group>
);

/**
 * Strand-Bühne: Sand (y 0), Meer ab z −8 nach hinten, Himmel, Sonne. Juno-Handtuch bei (0, 0, 0) längs z.
 * `day` 1 = Mittag (goldenes Licht, blau), 0 = Sonne weg (schwarzer Himmel, Sterne, kaltes Sternlicht).
 */
export const BeachSet: React.FC<{
  readonly frame: number;
  readonly day?: number;
  readonly sun?: { readonly on: number; readonly ring?: number };
  readonly sunPos?: V3;
  readonly crowd?: boolean;
  readonly gulls?: boolean;
  readonly towel?: boolean;
  readonly umbrella?: boolean;
  readonly glitter?: number;
  readonly stars?: number;
  readonly lookUp?: number;
}> = ({ frame, day = 1, sun, sunPos = [30, 70, -190], crowd = false, gulls = false, towel = true, umbrella = true, glitter = 0.6, stars = 0, lookUp = 0 }) => {
  const sand = sandTex();
  const sea = seaTex();
  sea.offset.set(frame * 0.0015, frame * 0.004);
  const tw = towelTex();
  const cold = 1 - day;
  return (
    <>
      <color attach="background" args={[day > 0.5 ? S.skyMid : S.nightTop]} />
      <fog attach="fog" args={[day > 0.5 ? "#BFE2F5" : "#070A1C", 30, 180]} />
      <hemisphereLight args={[day > 0.5 ? "#BFE0FF" : "#3A4A8A", day > 0.5 ? "#E8C890" : "#0A0C18", 0.35 + 0.55 * day]} />
      {/* goldene Sonne (Schlüssellicht) – erlischt, wenn das letzte Licht vorbei ist */}
      <directionalLight
        position={[sunPos[0] * 0.15, sunPos[1] * 0.15, sunPos[2] * 0.15 * -0.6]}
        color="#FFD48A"
        intensity={2.6 * day}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, 8, 10]} color={day > 0.5 ? "#FFE6B8" : "#8FB2FF"} intensity={0.6 * day + 0.9 * cold} />
      {/* Gegenlicht für die Figuren */}
      <directionalLight position={[4, 6, -12]} color={day > 0.5 ? S.goldHot : S.iceBlue} intensity={1.4 * day + 1.6 * cold} />
      <SkyDome day={day} />
      <Stars show={stars} frame={frame} upper />
      {sun ? <SunDisc position={sunPos} radius={11} on={sun.on} ring={sun.ring ?? 0} /> : null}
      {/* Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -10]}>
        <planeGeometry args={[140, 80]} />
        <meshStandardMaterial map={sand} color={day > 0.5 ? "#FFFFFF" : "#5A6A9A"} roughness={0.95} />
      </mesh>
      {/* Meer + Schaumlinie */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -60]}>
        <planeGeometry args={[260, 100]} />
        <meshPhysicalMaterial map={sea} color={day > 0.5 ? "#FFFFFF" : "#2A3A6A"} roughness={0.18} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -10.2 + Math.sin(frame * 0.05) * 0.3]}>
        <planeGeometry args={[140, 0.5]} />
        <meshBasicMaterial color={S.foam} transparent opacity={0.75} />
      </mesh>
      {/* Glitzern auf dem Wasser (goldene Punkte) */}
      {glitter > 0 && day > 0.05 ? <Motes frame={frame} center={[6, 0.15, -30]} size={[40, 0.1, 30]} count={160} drift={[0.01, 0, 0.006]} color={S.goldHot} dot={0.35} opacity={glitter * day} seed={12} /> : null}
      {towel ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -0.6]} receiveShadow>
          <planeGeometry args={[1.6, 3.4]} />
          <meshStandardMaterial map={tw} roughness={0.9} color={day > 0.5 ? "#FFFFFF" : "#7A86B0"} />
        </mesh>
      ) : null}
      {umbrella ? <Umbrella position={[-2.6, 0, -2.4]} /> : null}
      {crowd ? (
        <>
          <Bather position={[-5, 0, -7]} color="#F2A33A" frame={frame} seed={1} look={lookUp} arm={0.4} />
          <Bather position={[4.5, 0, -8]} color="#7E57C2" frame={frame} seed={2} rotation={[0, -0.4, 0]} look={lookUp} />
          <Bather position={[8, 0, -14]} color="#2E9BD6" frame={frame} seed={3} rotation={[0, 0.5, 0]} look={lookUp} arm={0.8} />
          <Bather position={[-9, 0, -15]} color="#E85D75" frame={frame} seed={4} look={lookUp} />
          <Umbrella position={[6.5, 0, -11]} colors={[S.white, "#E85D75"]} />
          {/* Volleyballnetz */}
          <group position={[-1.5, 0, -18]}>
            {[-3, 3].map((x) => (
              <mesh key={x} position={[x, 1.5, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 3, 8]} />
                <meshStandardMaterial color="#EDEDED" />
              </mesh>
            ))}
            <mesh position={[0, 2.5, 0]}>
              <planeGeometry args={[6, 0.8]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} side={DoubleSide} />
            </mesh>
          </group>
          <mesh position={[0.5, 4 + Math.abs(Math.sin(frame * 0.07)) * 2, -18]} castShadow>
            <sphereGeometry args={[0.32, 16, 12]} />
            <Plastic color="#FFFFFF" />
          </mesh>
          {/* Hund */}
          <group position={[2.5, 0, -5]} rotation={[0, -0.6 + Math.sin(frame * 0.1) * 0.2, 0]}>
            <RoundedBox args={[0.5, 0.45, 1.0]} radius={0.12} position={[0, 0.55, 0]} castShadow>
              <Plastic color="#C27A3A" />
            </RoundedBox>
            <RoundedBox args={[0.45, 0.42, 0.45]} radius={0.1} position={[0, 0.85, 0.6]} castShadow>
              <Plastic color="#C27A3A" />
            </RoundedBox>
            {[-0.18, 0.18].map((x) =>
              [-0.35, 0.35].map((z) => (
                <mesh key={`${x}${z}`} position={[x, 0.18, z]}>
                  <boxGeometry args={[0.12, 0.36, 0.12]} />
                  <meshStandardMaterial color="#9A5A28" />
                </mesh>
              )),
            )}
            <mesh position={[0, 0.82, -0.6]} rotation={[0.8 + Math.sin(frame * 0.8) * 0.4, 0, 0]}>
              <boxGeometry args={[0.08, 0.4, 0.08]} />
              <meshStandardMaterial color="#9A5A28" />
            </mesh>
          </group>
        </>
      ) : null}
      {gulls ? (
        <>
          <Gull position={[-3 + frame * 0.03, 7 + Math.sin(frame * 0.04) * 0.4, -12]} frame={frame} seed={1} />
          <Gull position={[1 + frame * 0.025, 8.5, -16]} frame={frame} seed={2} scale={0.8} />
          <Gull position={[5 - frame * 0.02, 6.5, -10]} frame={frame} seed={3} scale={0.9} />
        </>
      ) : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Telefon (Videotelefonat)                                             */
/* ------------------------------------------------------------------ */

/** Bildschirm des Videotelefonats: Grandpa auf dem Nacht-Balkon, gezeichnet (flach), Variante je Stimmung. */
const callTex = (mood: "wave" | "yawn" | "brow") =>
  canvasTex(`call-${mood}`, 256, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#070A26");
    g.addColorStop(1, "#1C2560");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 512);
    const r = seeded(5);
    for (let i = 0; i < 60; i++) {
      c.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.6})`;
      c.fillRect(r() * 256, r() * 220, 2, 2);
    }
    // Vollmond
    c.fillStyle = "#EEF1F8";
    c.beginPath();
    c.arc(196, 70, 30, 0, Math.PI * 2);
    c.fill();
    // Grandpa (Kasten)
    c.fillStyle = S.cardigan;
    c.fillRect(48, 320, 160, 192);
    c.fillStyle = "#E8E4DA";
    c.fillRect(112, 320, 32, 192);
    c.fillStyle = S.skin;
    c.fillRect(68, 170, 120, 130);
    c.fillStyle = S.beard;
    c.fillRect(64, 250, 128, 64);
    c.fillRect(56, 190, 16, 50);
    c.fillRect(184, 190, 16, 50);
    // Brille + Augen
    c.strokeStyle = S.glasses;
    c.lineWidth = 5;
    for (const x of [102, 154]) {
      c.beginPath();
      c.arc(x, 218, 17, 0, Math.PI * 2);
      c.stroke();
    }
    c.fillStyle = S.ink;
    if (mood === "yawn") {
      c.fillRect(92, 216, 20, 4);
      c.fillRect(144, 216, 20, 4);
    } else {
      c.beginPath();
      c.arc(102, 218, 6, 0, Math.PI * 2);
      c.arc(154, 218, 6, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = S.beard;
    c.fillRect(86, mood === "brow" ? 186 : 194, 32, 7);
    c.fillRect(138, mood === "brow" ? 178 : 194, 32, 7);
    c.fillStyle = "#3A1418";
    if (mood === "yawn") {
      c.beginPath();
      c.ellipse(128, 274, 16, 22, 0, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillRect(112, 266, 32, 6);
    }
    // Teleskop am Rand
    c.fillStyle = S.brass;
    c.save();
    c.translate(220, 300);
    c.rotate(-0.7);
    c.fillRect(-10, -80, 20, 120);
    c.restore();
    // Rufleiste: grün (Ton) + rot (Auflegen)
    c.fillStyle = "rgba(0,0,0,0.45)";
    c.fillRect(0, 440, 256, 72);
    c.fillStyle = "#E53935";
    c.beginPath();
    c.arc(128, 476, 24, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#FFFFFF";
    c.fillRect(114, 472, 28, 8);
  });

/** Smartphone (eigenes Design, keine Marke). Mitte = position, Bildschirm nach +z. Höhe 1,0 × scale. */
export const Phone: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number; readonly mood?: "wave" | "yawn" | "brow"; readonly lit?: number }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  mood = "wave",
  lit = 1,
}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[0.52, 1.0, 0.06]} radius={0.05} castShadow>
      <Plastic color="#2B2F3A" rough={0.3} />
    </RoundedBox>
    <mesh position={[0, 0, 0.032]}>
      <planeGeometry args={[0.46, 0.92]} />
      <meshBasicMaterial map={callTex(mood)} toneMapped={false} color={lit < 1 ? "#9AA0B8" : "#FFFFFF"} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ */
/* Zeitanzeige „SUN GONE FOR“ (im Bild, dunkle Platte)                  */
/* ------------------------------------------------------------------ */

/** m:ss aus Sekunden. */
export const mmss = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${(s % 60 < 10 ? "0" : "") + String(s % 60)}`;
};

/**
 * Zeitanzeige als schwebende Tafel (dunkel, Text gelb/weiß; Kontrast gelb #FFD23F auf #070B1E ≈ 14 : 1).
 * Mitte = position, Breite 3 × scale. `pop` 0..1 = Einblenden (Skalierung), `alert` färbt die Zahl rot-weiß.
 */
export const HudPanel: React.FC<{
  readonly value: string;
  readonly position: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly pop?: number;
  readonly label?: string;
  readonly alert?: number;
  readonly orbit?: "CURVED" | "STRAIGHT";
}> = ({ value, position, rotation = [0, 0, 0], scale = 1, pop = 1, label = "SUN GONE FOR", alert = 0, orbit }) => {
  if (pop <= 0.01) return null;
  const s = scale * (0.6 + 0.4 * Math.min(1, pop)) * (1 + Math.max(0, Math.sin(Math.min(1, pop) * Math.PI)) * 0.08);
  return (
    <group position={position} rotation={rotation} scale={s}>
      <RoundedBox args={[3.1, orbit ? 2.1 : 1.5, 0.08]} radius={0.12} position={[0, orbit ? -0.3 : 0, -0.05]}>
        <meshBasicMaterial color={S.hud} transparent={pop < 1} opacity={0.92 * Math.min(1, pop) + (pop >= 1 ? 0.08 : 0)} toneMapped={false} />
      </RoundedBox>
      <mesh position={[0, orbit ? -0.3 : 0, -0.1]}>
        <planeGeometry args={[3.24, orbit ? 2.24 : 1.64]} />
        <meshBasicMaterial color={S.gold} transparent={pop < 1} opacity={Math.min(1, pop)} toneMapped={false} />
      </mesh>
      <TextLabel text={label} width={2.8} height={0.38} position={[0, 0.42, 0.01]} color="#FFFFFF" opacity={Math.min(1, pop)} />
      <TextLabel text={value} width={2.8} height={0.85} position={[0, -0.2, 0.01]} color={alert > 0.5 ? "#FF8A80" : "#FFD23F"} opacity={Math.min(1, pop)} />
      {orbit ? <TextLabel text={`ORBIT: ${orbit}`} width={2.9} height={0.46} position={[0, -0.95, 0.01]} color={orbit === "STRAIGHT" ? "#FF8A80" : "#BFD4FF"} opacity={Math.min(1, pop)} /> : null}
    </group>
  );
};

/** Großes Zifferblatt der Kinder-Uhr (Nahaufnahme), Text „12:00“. Mitte = position, Blick +z. */
export const WatchFace: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly scale?: number; readonly text?: string }> = ({ position, rotation = [0, 0, 0], scale = 1, text = "12:00" }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[1.5, 1.3, 0.4]} radius={0.2} castShadow>
      <Plastic color={S.watch} rough={0.35} />
    </RoundedBox>
    <mesh position={[0, 0, 0.205]}>
      <circleGeometry args={[0.55, 40]} />
      <meshStandardMaterial color="#FFF7E6" roughness={0.3} />
    </mesh>
    <TextLabel text={text} width={0.95} height={0.42} position={[0, 0, 0.215]} color={S.ink} />
    {/* Armband */}
    <RoundedBox args={[1.0, 0.3, 2.4]} radius={0.1} position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
      <Plastic color={S.watch} rough={0.4} />
    </RoundedBox>
  </group>
);

/* ------------------------------------------------------------------ */
/* Balkon (Nachtseite)                                                  */
/* ------------------------------------------------------------------ */

/** Messing-Teleskop auf Dreibein. Fußpunkt = position, Rohr zeigt nach −z/oben (Neigung `tilt`). Okular-Ende bei ~(0, 2,05, 0,85). */
export const Telescope: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly tilt?: number; readonly scale?: number }> = ({ position, rotation = [0, 0, 0], tilt = 0.55, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {[0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.sin(a) * 0.35, 0.8, Math.cos(a) * 0.35]} rotation={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 1.7, 8]} />
          <meshStandardMaterial color={S.tripod} metalness={0.5} roughness={0.4} />
        </mesh>
      );
    })}
    <mesh position={[0, 1.68, 0]}>
      <boxGeometry args={[0.25, 0.2, 0.25]} />
      <meshStandardMaterial color={S.tripod} metalness={0.5} roughness={0.4} />
    </mesh>
    <group position={[0, 1.85, 0]} rotation={[tilt, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 2.3, 24]} />
        <meshStandardMaterial color={S.brass} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, -1.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 24]} />
        <meshStandardMaterial color="#7A5A20" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.25, 14]} />
        <meshStandardMaterial color="#1E1E22" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  </group>
);

/** Vollmond am Nachthimmel. `glow` 1 = hell, 0 = dunkle Scheibe. */
export const MoonDisc: React.FC<{ readonly position: V3; readonly radius?: number; readonly glow?: number }> = ({ position, radius = 4, glow = 1 }) => (
  <group position={position}>
    <mesh>
      <circleGeometry args={[radius, 40]} />
      <meshBasicMaterial color={glow > 0.02 ? "#EEF1F8" : "#141830"} transparent opacity={1} fog={false} toneMapped={false} />
    </mesh>
    {glow < 1 ? (
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[radius * 1.001, 40]} />
        <meshBasicMaterial color="#10142C" transparent opacity={1 - glow} fog={false} />
      </mesh>
    ) : null}
    {[[-0.3, 0.2, 0.22], [0.35, -0.25, 0.16], [0.1, 0.45, 0.1]].map(([x, y, r], i) => (
      <mesh key={i} position={[x * radius, y * radius, 0.01]}>
        <circleGeometry args={[r * radius, 20]} />
        <meshBasicMaterial color="#C9CEDC" transparent opacity={0.7 * glow} fog={false} />
      </mesh>
    ))}
    {glow > 0.02 ? <Glow at={[0, 0, 0.1]} size={radius * 5} color="#DDE6FF" opacity={0.45 * glow} /> : null}
  </group>
);

/** Saturn als blasser Goldpunkt am Himmel (mit Schein). */
export const SaturnDot: React.FC<{ readonly position: V3; readonly glow?: number; readonly size?: number }> = ({ position, glow = 1, size = 1 }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[0.35 * size, 12, 8]} />
      <meshBasicMaterial color={S.goldPale} transparent opacity={glow} fog={false} toneMapped={false} />
    </mesh>
    <Glow at={[0, 0, 0]} size={3.2 * size} color={S.gold} opacity={0.55 * glow} />
  </group>
);

/** Teleskop auf dem Balkon (Fußpunkt, Maßstab 2) und sein Okular in Weltkoordinaten. */
export const TELESCOPE: V3 = [1.6, 0, -0.6];
export const EYEPIECE: V3 = [1.6, 2 * (1.85 - 1.25 * Math.sin(0.55)), -0.6 + 2 * 1.25 * Math.cos(0.55)];
/** Grandpa am Okular: Fußpunkt, Drehung (Blick nach −z), Vorbeugen, Nicken, Kopfmitte. */
export const ODE_SCOPE = { position: [1.6, 0, EYEPIECE[2] + 1.33] as V3, rotation: [0, Math.PI, 0] as V3, lean: 0.45, nod: 0.28 };
export const odeScopeHead = (): V3 => [ODE_SCOPE.position[0], 0.82 + 1.9 * Math.cos(0.45), ODE_SCOPE.position[2] - 1.9 * Math.sin(0.45)];

/**
 * Balkon bei Nacht (Nachtseite der Erde): Boden, Geländer, Hauswand mit Tür, Häuser in der Ferne, Mond, Saturn-Punkt.
 * Grandpa steht bei (0, 0, 0), Teleskop bei (1,3, 0, 0,4) zeigt in den Himmel (−z).
 */
export const BalconySet: React.FC<{ readonly frame: number; readonly moon?: number; readonly saturn?: number; readonly moonPos?: V3; readonly saturnPos?: V3; readonly telescope?: boolean; readonly cold?: number }> = ({
  frame,
  moon = 1,
  saturn = 1,
  moonPos = [-9, 26, -60],
  saturnPos = [10, 22, -60],
  telescope = true,
  cold = 0,
}) => {
  const winA = windowsTex(3);
  const winB = windowsTex(8);
  return (
    <>
      <color attach="background" args={[S.indigoDeep]} />
      <fog attach="fog" args={["#0C1238", 40, 160]} />
      <hemisphereLight args={["#4A5AB0", "#0A0C18", 0.55]} />
      {/* Mondlicht (kalt) */}
      <directionalLight position={[-8, 14, -6]} color="#AFC4FF" intensity={0.5 + 0.9 * moon} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0005} />
      {/* Licht aus der Balkontür (warmweiß, schwach) als Gesichtslicht von vorn */}
      <pointLight position={[-1.2, 3.2, 3.5]} color="#FFE3B8" intensity={9 - 3 * cold} distance={10} decay={2} />
      <directionalLight position={[5, 5, -8]} color="#8EA2FF" intensity={1.6} />
      <SkyDome day={0} night="indigo" />
      <Stars show={1} frame={frame} upper dot={1.4} />
      <MoonDisc position={moonPos} glow={moon} />
      <SaturnDot position={saturnPos} glow={saturn} />
      {/* Boden + Geländer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial color="#3A3E5C" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.15, -3.2]}>
        <boxGeometry args={[12, 0.1, 0.12]} />
        <meshStandardMaterial color={S.railing} metalness={0.6} roughness={0.4} />
      </mesh>
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={i} position={[-6 + i * 0.5, 0.58, -3.2]}>
          <boxGeometry args={[0.05, 1.15, 0.05]} />
          <meshStandardMaterial color={S.railing} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Hauswand hinten seitlich + Pflanze */}
      <mesh position={[-5.8, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color={S.wall} roughness={0.9} />
      </mesh>
      <group position={[-4.6, 0, -2.4]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.28, 0.6, 14]} />
          <meshStandardMaterial color="#8A4A2A" />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.6, 14, 10]} />
          <meshStandardMaterial color="#1F5A3A" roughness={0.9} />
        </mesh>
      </group>
      {/* Stadt in der Ferne */}
      {[-30, -18, -8, 4, 14, 26].map((x, i) => (
        <mesh key={x} position={[x, -14 + (i % 3) * 3, -45 - (i % 2) * 8]}>
          <boxGeometry args={[8, 22 + (i % 3) * 6, 6]} />
          <meshStandardMaterial map={i % 2 ? winA : winB} color="#FFFFFF" emissive="#FFFFFF" emissiveMap={i % 2 ? winA : winB} emissiveIntensity={0.5} />
        </mesh>
      ))}
      {telescope ? <Telescope position={TELESCOPE} tilt={0.55} scale={2} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Weltall                                                              */
/* ------------------------------------------------------------------ */

/** Hintergrund Weltall: schwarz, Sterne, ohne Nebel (Szene-Wurzel). */
export const SpaceSet: React.FC<{ readonly frame: number; readonly stars?: number; readonly sunLight?: number; readonly sunAt?: V3 }> = ({ frame, stars = 1, sunLight = 0, sunAt = [0, 0, 0] }) => (
  <>
    <color attach="background" args={["#020309"]} />
    <fog attach="fog" args={["#020309", 800, 1200]} />
    <ambientLight intensity={0.12} color="#8090C0" />
    {/* Erdlicht: das Sonnenlicht ist bis zur Wendung noch unterwegs → die Erde ist hell (kaltes Füll-Licht + goldenes Hauptlicht) */}
    <directionalLight position={[sunAt[0] - 40, sunAt[1] + 10, sunAt[2] + 30]} color="#FFD48A" intensity={2.4 * sunLight} />
    <directionalLight position={[30, 20, 40]} color="#9AB0FF" intensity={0.5} />
    <Stars show={stars} frame={frame} radius={400} count={1200} dot={2.2} />
  </>
);

/** Erde (mit optionalem Mond). Mitte = position. */
export const EarthBall: React.FC<{ readonly position: V3; readonly radius?: number; readonly spin?: number; readonly moon?: boolean; readonly moonAngle?: number; readonly glow?: number }> = ({
  position,
  radius = 1,
  spin = 0,
  moon = false,
  moonAngle = 0.6,
  glow = 0.6,
}) => (
  <group position={position}>
    <mesh rotation={[0.4, spin, 0]}>
      <sphereGeometry args={[radius, 40, 28]} />
      <meshStandardMaterial map={earthTex()} roughness={0.6} emissive="#2A60C0" emissiveIntensity={0.12} />
    </mesh>
    <mesh scale={1.06}>
      <sphereGeometry args={[radius, 32, 20]} />
      <meshBasicMaterial color="#7FB8FF" transparent opacity={0.18 * glow} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
    <Halo at={[0, 0, 0]} size={radius * 4.2} color="#6FA8FF" opacity={0.35 * glow} />
    {moon ? (
      <mesh position={[Math.cos(moonAngle) * radius * 2.4, 0, Math.sin(moonAngle) * radius * 2.4]}>
        <sphereGeometry args={[radius * 0.27, 20, 14]} />
        <meshStandardMaterial color={S.moon} roughness={0.9} emissive="#606A80" emissiveIntensity={0.25} />
      </mesh>
    ) : null}
  </group>
);

/** Kugelschale aus Licht (das letzte Sonnenlicht), Radius r, Stärke `on`. Additiv, mit hellem Rand (Fresnel-Näherung: zwei Schalen). */
export const LightShell: React.FC<{ readonly center?: V3; readonly r: number; readonly on?: number; readonly color?: string }> = ({ center = [0, 0, 0], r, on = 1, color = S.gold }) => {
  if (on <= 0.01) return null;
  const tube = Math.min(0.35, Math.max(0.05, r * 0.012));
  const rings: V3[] = [[Math.PI / 2, 0, 0], [0, 0, 0], [0, Math.PI / 4, 0], [0, -Math.PI / 4, 0], [0, Math.PI / 2, 0], [Math.PI / 2 - 0.5, 0, 0], [Math.PI / 2 + 0.5, 0, 0]];
  return (
    <group position={center}>
      <mesh>
        <sphereGeometry args={[r, 64, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08 * on} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
      </mesh>
      {rings.map((rot, i) => (
        <mesh key={i} rotation={rot} scale={i > 4 ? [Math.cos(0.5), Math.cos(0.5), 1] : 1} position={i === 5 ? [0, Math.sin(0.5) * r, 0] : i === 6 ? [0, -Math.sin(0.5) * r, 0] : [0, 0, 0]}>
          <torusGeometry args={[r, tube, 8, 160]} />
          <meshBasicMaterial color={S.goldHot} transparent opacity={(i < 2 ? 0.9 : 0.55) * on} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Leuchtendes Lichtband (Röhre) von `from` nach `to`. `head` 0..1 = wie weit das Band schon reicht, `tail` 0..1 = wo es beginnt
 * (hinter dem Ende nur Schwarz). Additiv gold, mit Kern.
 */
export const Ribbon: React.FC<{ readonly from: V3; readonly to: V3; readonly width?: number; readonly head?: number; readonly tail?: number; readonly on?: number; readonly frame?: number }> = ({
  from,
  to,
  width = 0.4,
  head = 1,
  tail = 0,
  on = 1,
  frame = 0,
}) => {
  const a: V3 = [from[0] + (to[0] - from[0]) * tail, from[1] + (to[1] - from[1]) * tail, from[2] + (to[2] - from[2]) * tail];
  const b: V3 = [from[0] + (to[0] - from[0]) * head, from[1] + (to[1] - from[1]) * head, from[2] + (to[2] - from[2]) * head];
  if (head - tail <= 0.001 || on <= 0.01) return null;
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.3);
  return (
    <>
      <LightShaft from={a} to={b} radius={width} top={width} color={S.gold} opacity={0.55 * on * pulse} />
      <LightShaft from={a} to={b} radius={width * 0.35} top={width * 0.35} color={S.goldHot} opacity={0.9 * on} />
      <Halo at={b} size={width * 7} color={S.goldHot} opacity={0.8 * on} />
    </>
  );
};

/** Gepunktete Bahnlinie (Kreis um center in der xz-Ebene). `glow` hebt Punkte vor `aheadAngle` hervor. */
export const OrbitDots: React.FC<{ readonly center?: V3; readonly radius: number; readonly n?: number; readonly on?: number; readonly dot?: number; readonly color?: string; readonly from?: number; readonly to?: number }> = ({
  center = [0, 0, 0],
  radius,
  n = 72,
  on = 1,
  dot = 0.12,
  color = "#BFD4FF",
  from = 0,
  to = Math.PI * 2,
}) => {
  const geo = useMemo(() => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = from + ((to - from) * i) / n;
      arr.set([center[0] + Math.cos(a) * radius, center[1], center[2] + Math.sin(a) * radius], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(arr, 3));
    return g;
  }, [center, radius, n, from, to]);
  if (on <= 0.01) return null;
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color={color} size={dot * 5} sizeAttenuation transparent opacity={on} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
};

/** Gerade Punktlinie von a nach b (z. B. Tangente, neue Bahn). */
export const DotLine: React.FC<{ readonly from: V3; readonly to: V3; readonly n?: number; readonly on?: number; readonly dot?: number; readonly color?: string }> = ({ from, to, n = 30, on = 1, dot = 0.12, color = "#FF8A7A" }) => {
  const geo = useMemo(() => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      arr.set([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(arr, 3));
    return g;
  }, [from, to, n]);
  if (on <= 0.01) return null;
  return (
    <points geometry={geo}>
      <pointsMaterial map={softDot()} color={color} size={dot * 5} sizeAttenuation transparent opacity={on} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
};

/**
 * Raumzeit-Gitter (Linien in der xz-Ebene bei y), mit Delle um `dip` und Welle (Ringwelle ab `rippleR`, Breite 1,2).
 * Pro Frame neu berechnet (deterministisch).
 */
export const SpaceGrid: React.FC<{ readonly size?: number; readonly step?: number; readonly y?: number; readonly dip?: number; readonly rippleR?: number; readonly ripple?: number; readonly center?: V3; readonly color?: string; readonly opacity?: number }> = ({
  size = 40,
  step = 1,
  y = 0,
  dip = 0,
  rippleR = -10,
  ripple = 1,
  center = [0, 0, 0],
  color = S.gold,
  opacity = 0.55,
}) => {
  const n = Math.round(size / step);
  const seg = n * 2;
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array((n + 1) * 2 * seg * 2 * 3), 3));
    return g;
  }, [n, seg]);
  const arr = (geo.getAttribute("position") as BufferAttribute).array as Float32Array;
  const h = (x: number, z: number) => {
    const r = Math.hypot(x - center[0], z - center[2]);
    const well = -dip * Math.exp(-(r * r) / 18);
    const d = r - rippleR;
    const wave = rippleR > 0 ? ripple * 0.9 * Math.exp(-(d * d) / 1.4) * Math.cos(d * 2.4) : 0;
    return y + well + wave;
  };
  let k = 0;
  const half = size / 2;
  for (let i = 0; i <= n; i++) {
    const c = -half + i * step;
    for (let s = 0; s < seg; s++) {
      const a = -half + (size * s) / seg;
      const b = -half + (size * (s + 1)) / seg;
      // Linie entlang x (z = c)
      arr.set([center[0] + a, h(center[0] + a, center[2] + c), center[2] + c, center[0] + b, h(center[0] + b, center[2] + c), center[2] + c], k);
      k += 6;
      // Linie entlang z (x = c)
      arr.set([center[0] + c, h(center[0] + c, center[2] + a), center[2] + a, center[0] + c, h(center[0] + c, center[2] + b), center[2] + b], k);
      k += 6;
    }
  }
  (geo.getAttribute("position") as BufferAttribute).needsUpdate = true;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
};

/** Neutronenstern (klein, schwer, dunkelblau glühend). */
export const DeadStar: React.FC<{ readonly position: V3; readonly radius?: number; readonly glow?: number }> = ({ position, radius = 0.6, glow = 1 }) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[radius, 28, 20]} />
      <meshStandardMaterial color="#1A2A6A" emissive={S.ns} emissiveIntensity={0.9 * glow} roughness={0.4} metalness={0.3} />
    </mesh>
    <Halo at={[0, 0, 0]} size={radius * 6} color={S.ns} opacity={0.7 * glow} />
  </group>
);

/** Blitz (Explosion): weißgoldene Kugel + Halo, `t` 0..1 (Aufblitzen und Abklingen). */
export const Flash: React.FC<{ readonly position: V3; readonly t: number; readonly size?: number }> = ({ position, t, size = 3 }) => {
  if (t <= 0 || t >= 1) return null;
  const k = t < 0.15 ? t / 0.15 : Math.exp(-(t - 0.15) * 3);
  return (
    <group position={position}>
      <mesh scale={0.4 + k * 1.2}>
        <sphereGeometry args={[size * 0.3, 24, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={k} toneMapped={false} />
      </mesh>
      <Halo at={[0, 0, 0]} size={size * 6 * k + 1} color={S.goldHot} opacity={0.9 * k} />
    </group>
  );
};

/** Ferne Galaxien: kleine Spiral-Wolken aus Punkten (deterministisch), driften mit `t`. */
export const Galaxies: React.FC<{ readonly t?: number; readonly count?: number; readonly spread?: V3; readonly center?: V3 }> = ({ t = 0, count = 14, spread = [60, 90, 40], center = [0, 0, -40] }) => {
  const list = useMemo(() => {
    const r = seeded(29);
    return Array.from({ length: count }, () => ({ p: [(r() - 0.5) * spread[0], (r() - 0.5) * spread[1], (r() - 0.5) * spread[2]] as V3, s: 1.5 + r() * 3, rot: r() * 3, hue: r() }));
  }, [count, spread]);
  const geo = useMemo(() => {
    const r = seeded(33);
    const N = 90;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const arm = i % 2;
      const d = r();
      const a = d * 5 + arm * Math.PI;
      arr.set([Math.cos(a) * d + (r() - 0.5) * 0.15, (r() - 0.5) * 0.05, Math.sin(a) * d + (r() - 0.5) * 0.15], i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <group position={center}>
      {list.map((g, i) => (
        <group key={i} position={[g.p[0], g.p[1], g.p[2] + t]} rotation={[1.1, g.rot + t * 0.01, 0.3]} scale={g.s}>
          <points geometry={geo}>
            <pointsMaterial map={softDot()} color={g.hue > 0.5 ? "#BFD0FF" : "#FFE0C0"} size={0.12} sizeAttenuation transparent opacity={0.85} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </points>
          <Halo at={[0, 0, 0]} size={0.9} color="#FFF0D8" opacity={0.6} />
        </group>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Okular-Blick (POV)                                                   */
/* ------------------------------------------------------------------ */

/** Saturn (eigenes Modell, PBR): Kugel + Ring. `glow` 1 = hell (Sonnenlicht trifft ihn noch), 0 = dunkel. */
export const SaturnModel: React.FC<{ readonly position?: V3; readonly radius?: number; readonly glow?: number; readonly spin?: number }> = ({ position = [0, 0, 0], radius = 1, glow = 1, spin = 0 }) => (
  <group position={position} rotation={[0.42, 0, 0.18]}>
    <mesh rotation={[0, spin, 0]}>
      <sphereGeometry args={[radius, 48, 32]} />
      <meshStandardMaterial map={saturnTex()} color={glow > 0.02 ? "#FFFFFF" : "#202020"} emissive="#E8C078" emissiveIntensity={0.55 * glow} roughness={0.7} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 1.25, radius * 2.25, 96, 1]} />
      <meshBasicMaterial map={ringTex()} color={glow > 0.02 ? "#FFFFFF" : "#202020"} transparent opacity={0.25 + 0.75 * glow} side={DoubleSide} toneMapped={false} depthWrite={false} />
    </mesh>
    <Halo at={[0, 0, 0]} size={radius * 7} color={S.gold} opacity={0.35 * glow} />
  </group>
);

/**
 * Blick durchs Okular: schwarzer Raum, Saturn in der Mitte, runde Maske vor der Kamera. Kamera steht bei (0, 0, dist)
 * und blickt auf den Ursprung – eigene `<Shot>` in der Szene (Maske bei z = 1,2 vor dem Saturn).
 * `glow` 0..1 Helligkeit, `size` Größe im Kreis.
 */
export const EyepieceView: React.FC<{ readonly frame: number; readonly glow?: number; readonly size?: number; readonly drift?: number; readonly stars?: number; readonly maskZ?: number; readonly maskSize?: number }> = ({
  frame,
  glow = 1,
  size = 1,
  drift = 0,
  stars = 1,
  maskZ = 4.6,
  maskSize = 4.2,
}) => (
  <>
    <color attach="background" args={["#000000"]} />
    <ambientLight intensity={0.15} />
    <directionalLight position={[-6, 3, 8]} color="#FFE6B0" intensity={1.8 * glow} />
    <Stars show={0.6 * stars} radius={60} count={240} dot={0.5} frame={frame} />
    <SaturnModel position={[drift, 0, 0]} radius={0.62 * size} glow={glow} spin={frame * 0.004} />
    <mesh position={[0, 0, maskZ]}>
      <planeGeometry args={[maskSize, maskSize]} />
      <meshBasicMaterial map={maskTex()} transparent toneMapped={false} depthWrite={false} />
    </mesh>
    {/* schwarzer Rahmen um die Maske (bildfüllend) */}
    {[-1, 1].map((sd) => (
      <mesh key={`v${sd}`} position={[sd * maskSize, 0, maskZ]}>
        <planeGeometry args={[maskSize, maskSize * 4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    ))}
    {[-1, 1].map((sd) => (
      <mesh key={`h${sd}`} position={[0, sd * maskSize * 1.5, maskZ]}>
        <planeGeometry args={[maskSize * 3, maskSize * 2]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    ))}
  </>
);

/* ------------------------------------------------------------------ */
/* Meer, Eis, Tiefsee-Quelle                                            */
/* ------------------------------------------------------------------ */

/** Eis-Haut über dem Meer: Schollen wachsen von außen (`t` 0..1). Ebene bei y. */
export const IceSheet: React.FC<{ readonly t: number; readonly y?: number; readonly size?: number }> = ({ t, y = 0.05, size = 60 }) => {
  const tex = iceTex();
  const plates = useMemo(() => {
    const r = seeded(51);
    return Array.from({ length: 70 }, () => ({ x: (r() - 0.5) * size, z: (r() - 0.5) * size, s: 2 + r() * 5, a: r() * 3, d: r() }));
  }, [size]);
  return (
    <group position={[0, y, 0]}>
      {plates.map((p, i) => {
        const dist = Math.hypot(p.x, p.z) / (size * 0.7);
        const k = Math.max(0, Math.min(1, (t * 1.6 - (1 - dist) * 0.8 - p.d * 0.2) * 2));
        if (k <= 0.01) return null;
        return (
          <mesh key={i} position={[p.x, 0.01 * i * 0.01, p.z]} rotation={[-Math.PI / 2, 0, p.a]} scale={k}>
            <circleGeometry args={[p.s, 6]} />
            <meshStandardMaterial map={tex} color="#FFFFFF" roughness={0.35} metalness={0.05} transparent opacity={0.95} emissive="#7FA8D8" emissiveIntensity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Hydrothermale Quelle: Schlot, schwarzer Rauch (Partikel), grün glimmende Mikroben-Punkte. Fußpunkt = position. */
export const Vent: React.FC<{ readonly position: V3; readonly frame: number; readonly microbes?: number; readonly scale?: number }> = ({ position, frame, microbes = 1, scale = 1 }) => {
  const smoke = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(60 * 3), 3));
    return g;
  }, []);
  const arr = (smoke.getAttribute("position") as BufferAttribute).array as Float32Array;
  for (let i = 0; i < 60; i++) {
    const life = ((frame * 0.6 + i * 7) % 60) / 60;
    const sw = Math.sin(i * 1.7 + frame * 0.03) * life * 0.8;
    arr.set([sw, 2.3 + life * 5, Math.cos(i * 2.3) * life * 0.6], i * 3);
  }
  (smoke.getAttribute("position") as BufferAttribute).needsUpdate = true;
  const dots = useMemo(() => {
    const r = seeded(73);
    return Array.from({ length: 26 }, () => [(r() - 0.5) * 2.4, 0.4 + r() * 2.2, (r() - 0.5) * 2.4, r()] as const);
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.9, 2.3, 10]} />
        <meshStandardMaterial color="#2A2420" roughness={0.95} />
      </mesh>
      <mesh position={[0.9, 0.5, 0.3]}>
        <cylinderGeometry args={[0.2, 0.55, 1.1, 8]} />
        <meshStandardMaterial color="#332A24" roughness={0.95} />
      </mesh>
      <pointLight position={[0, 2.4, 0.8]} color="#FF8A4A" intensity={6} distance={6} decay={2} />
      <Halo at={[0, 2.35, 0]} size={1.2} color="#FF9A50" opacity={0.6} />
      <points geometry={smoke}>
        <pointsMaterial map={softDot()} color="#1A1614" size={0.9} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>
      {dots.map((d, i) => (
        <Halo key={i} at={[d[0], d[1] + Math.sin(frame * 0.05 + i) * 0.1, d[2]]} size={0.42 + 0.14 * Math.sin(frame * 0.2 + d[3] * 9)} color={S.vent} opacity={0.95 * microbes} />
      ))}
      {microbes > 0.05 ? <pointLight position={[0, 1, 1]} color={S.vent} intensity={4 * microbes} distance={5} decay={2} /> : null}
    </group>
  );
};

/** Meeresboden (dunkel, Felsen). */
export const SeaFloor: React.FC<{ readonly y?: number }> = ({ y = 0 }) => {
  const rocks = useMemo(() => {
    const r = seeded(19);
    return Array.from({ length: 18 }, () => [(r() - 0.5) * 20, (r() - 0.5) * 20, 0.3 + r() * 1.2] as const);
  }, []);
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1A1E26" roughness={1} />
      </mesh>
      {rocks.map((k, i) => (
        <mesh key={i} position={[k[0], k[2] * 0.3, k[1]]} scale={[k[2], k[2] * 0.6, k[2]]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#262A32" roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Zeitanzeige je Szene (verstrichene Zeit, einheitlich mit der Ansage)  */
/* ------------------------------------------------------------------ */

/**
 * „SUN GONE FOR“: Startwert (Sekunden) je Szene ab Beat, zählt in Echtzeit hoch bis `max` (Sekunden).
 * Werte aus episodes/sonne-verschwindet.json (Cues `hud`): 0:00 · 0:10 · 2:00 · 3:00 · 4:00 · 5:00 · 7:19 · 8:18 · 8:19.
 */
export const CLOCK: Record<string, { readonly beat: string; readonly sec: number; readonly max: number; readonly pre?: number }> = {
  hook: { beat: "hudTimerStarts", sec: 0, max: 59 },
  zero: { beat: "emptySpotLightShell", sec: 10, max: 59 },
  orbit: { beat: "orbitEmptySpot", sec: 120, max: 179 },
  rehook: { beat: "junoHumming", sec: 180, max: 239 },
  four: { beat: "grandpaTelescope", sec: 240, max: 299 },
  five: { beat: "grandpaYawns", sec: 300, max: 359 },
  // 7:19 steht ab „One warm minute left“ (8:19 − 7:19 = 60 s, faktengeprüft) – vorher 7:00 → 7:19
  seven: { beat: "watchOneMinute", sec: 439, max: 439, pre: 420 },
  hope: { beat: "junoStretches", sec: 498, max: 498, pre: 480 },
  turn: { beat: "skyGoesBlack", sec: 499, max: 499 },
};
export const clockText = (scene: string, frame: number, beat: (n: string) => number) => {
  const c = CLOCK[scene];
  if (!c) return "0:00";
  const b = beat(c.beat);
  if (c.pre !== undefined && frame < b) return mmss(c.pre + ((c.sec - c.pre) * Math.max(0, frame)) / Math.max(1, b));
  const t = b > 1e8 ? 0 : Math.max(0, frame - b) / 30;
  return mmss(Math.min(c.max, c.sec + t));
};
