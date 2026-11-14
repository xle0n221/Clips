/**
 * „Something Under the Site Knocked Back“ (episodes/bauarbeiter.json) – Bau-Kit der Baustelle „LOT 9“.
 *
 * Stil (Drehbuch `style`): Cinematic 3D wie Zeit-Welt (PBR-Kunststoff, Volumenlicht, Nebel, Regen, Filmkorn),
 * EIGENE Klotzfigur MILO: breite kastige Schultern, kleiner Würfelkopf, kurze Beine, Punktaugen, Schnurrbart-Klotz,
 * gelber Helm mit runder Stirnlampe, orange Warnweste mit Silberstreifen, marineblaue Latzhose, roter Schraubenschlüssel.
 * Farblogik: Welt kalt marineblau · AMBER = Milos Seite (Arbeitslampen, Stirnlampe) · TÜRKIS = das Unten / Oben.
 * Keine Marken, keine Logos, kein Monster. Alles aus dem Frame berechnet (Zufall nur mit Seed).
 */
import { RoundedBox } from "@react-three/drei";
import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, RepeatWrapping, SRGBColorSpace } from "three";
import { V3 } from "../kit/camera";
import { kitFont } from "../kit/font";
import { blinkAt } from "../kit/motion";
import { seeded } from "../kit/toon";
import { Halo, LightShaft, softDot, TextLabel } from "./zeitweltSets";

export { Atmos, cut, fly, frameOn, Halo, lerp, lerp3, LightShaft, Motes, Rain, ramp, TextLabel } from "./zeitweltSets";

/* ------------------------------------------------------------------ */
/* Palette                                                              */
/* ------------------------------------------------------------------ */

export const B = {
  night: "#070C18",
  navy: "#0E1830",
  fog: "#16233D",
  mud: "#2B2723",
  mudWet: "#1E1C1B",
  concrete: "#6E727A",
  concreteDark: "#3E424A",
  rust: "#8A3A22",
  rustDark: "#4E2014",
  amber: "#FFB23E",
  amberHot: "#FFD58A",
  teal: "#2FE0D0",
  tealDeep: "#0E6F78",
  hat: "#F2C21B",
  vest: "#F06A12",
  silver: "#D9DEE6",
  overall: "#1F3463",
  sleeve: "#3A4760",
  glove: "#B98C55",
  skin: "#E6B48C",
  stache: "#4A2C1A",
  boot: "#3A2618",
  wrench: "#C8262A",
  ink: "#141414",
  paper: "#EDE6D3",
  pencil: "#2C2C34",
  tarp: "#1F3A33",
  crane: "#9A7B2A",
} as const;

/** Klopf-Impuls 0..1 (schnell an, kurz abklingend) für Schläge ab `t0` mit Abständen `gapsMs` (Rhythmus kurz-kurz-lang). */
export const knockAt = (frame: number, t0: number, gapsMs: readonly number[] = [220, 600]) => {
  const times = [t0];
  for (const g of gapsMs) times.push(times[times.length - 1] + (g / 1000) * 30);
  let v = 0;
  for (const t of times) {
    const d = frame - t;
    if (d >= -1.5 && d < 7) v = Math.max(v, d < 0 ? 1 + d / 1.5 : Math.exp(-d / 2.2));
  }
  return Math.max(0, Math.min(1, v));
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

/** Nasser Schlamm mit Reifenspuren und Pfützen-Flecken. */
const mudTex = () =>
  canvasTex("mud", 256, 256, (c) => {
    c.fillStyle = "#2E2925";
    c.fillRect(0, 0, 256, 256);
    const r = seeded(31);
    for (let i = 0; i < 260; i++) {
      const l = 30 + Math.floor(r() * 26);
      c.fillStyle = `rgba(${l + 6},${l},${l - 6},0.55)`;
      c.beginPath();
      c.ellipse(r() * 256, r() * 256, 3 + r() * 14, 2 + r() * 7, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
    c.strokeStyle = "rgba(15,13,12,0.6)";
    c.lineWidth = 9;
    for (const x of [70, 96, 170, 196]) {
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x + 20, 90, x - 20, 170, x + 6, 256);
      c.stroke();
    }
  }, [6, 6]);

/** Beton (Wand, Decke) mit Schalungsfugen. */
const concreteTex = (key: string, base: string) =>
  canvasTex(`concrete-${key}`, 256, 256, (c) => {
    c.fillStyle = base;
    c.fillRect(0, 0, 256, 256);
    const r = seeded(77);
    for (let i = 0; i < 400; i++) {
      c.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`;
      c.fillRect(r() * 256, r() * 256, 2 + r() * 3, 2 + r() * 3);
    }
    c.strokeStyle = "rgba(0,0,0,0.25)";
    c.lineWidth = 2;
    for (let k = 0; k <= 256; k += 64) {
      c.beginPath();
      c.moveTo(0, k);
      c.lineTo(256, k);
      c.stroke();
    }
    for (let k = 0; k <= 256; k += 128) {
      c.beginPath();
      c.moveTo(k, 0);
      c.lineTo(k, 256);
      c.stroke();
    }
  }, [4, 2]);

/** Rost (Rohr) mit Flecken. */
const rustTex = () =>
  canvasTex("rust", 128, 256, (c) => {
    c.fillStyle = B.rust;
    c.fillRect(0, 0, 128, 256);
    const r = seeded(13);
    for (let i = 0; i < 160; i++) {
      const dark = r() > 0.5;
      c.fillStyle = dark ? `rgba(60,20,10,${0.3 + r() * 0.4})` : `rgba(190,100,50,${0.2 + r() * 0.3})`;
      c.beginPath();
      c.ellipse(r() * 128, r() * 256, 2 + r() * 9, 2 + r() * 14, 0, 0, Math.PI * 2);
      c.fill();
    }
  });

/** Fensterraster der Stadt (warm/kalt, wenige an). */
const windowsTex = (seed: number) =>
  canvasTex(`win-${seed}`, 128, 256, (c) => {
    c.fillStyle = "#0A0F1C";
    c.fillRect(0, 0, 128, 256);
    const r = seeded(seed);
    for (let y = 6; y < 256; y += 16)
      for (let x = 6; x < 128; x += 14) {
        const on = r();
        c.fillStyle = on > 0.82 ? "#FFC27A" : on > 0.74 ? "#9FC6FF" : "#141B2A";
        c.fillRect(x, y, 8, 10);
      }
  });

/** Bauplan auf dem Tablet: blaues Raster, Titel, leeres Feld in der Mitte (dort steht das Rohr). */
const blueprintTex = () =>
  canvasTex("blueprint", 512, 384, (c) => {
    c.fillStyle = "#123A6E";
    c.fillRect(0, 0, 512, 384);
    c.strokeStyle = "rgba(190,220,255,0.35)";
    c.lineWidth = 1;
    for (let k = 0; k <= 512; k += 24) {
      c.beginPath();
      c.moveTo(k, 60);
      c.lineTo(k, 384);
      c.stroke();
    }
    for (let k = 60; k <= 384; k += 24) {
      c.beginPath();
      c.moveTo(0, k);
      c.lineTo(512, k);
      c.stroke();
    }
    c.strokeStyle = "#DDEBFF";
    c.lineWidth = 5;
    c.strokeRect(60, 96, 392, 252);
    c.lineWidth = 3;
    for (const x of [150, 256, 362]) {
      c.beginPath();
      c.moveTo(x, 96);
      c.lineTo(x, 348);
      c.stroke();
    }
    c.fillStyle = "#DDEBFF";
    c.font = kitFont(36);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("LOT 9 · FOUNDATION", 256, 34);
    c.font = kitFont(18, 700);
    c.fillText("NO PIPES · NO SERVICES", 256, 366);
  });

/** Bohrprofil („BORE LOG“): graue Fels-Schichten bis ganz unten. */
const boreLogTex = () =>
  canvasTex("borelog", 384, 512, (c) => {
    c.fillStyle = "#EDE9E0";
    c.fillRect(0, 0, 384, 512);
    c.fillStyle = "#1A1A1A";
    c.font = kitFont(40);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("BORE LOG", 192, 40);
    const cols = ["#6B5440", "#8A8C90", "#74767C", "#5E6066", "#4E5056", "#43454A", "#393B40"];
    let y = 80;
    cols.forEach((col, i) => {
      const h = i === 0 ? 40 : 58;
      c.fillStyle = col;
      c.fillRect(70, y, 200, h);
      c.fillStyle = "rgba(255,255,255,0.12)";
      for (let k = 0; k < 6; k++) c.fillRect(80 + ((k * 37 + i * 13) % 180), y + 10 + ((k * 17) % (h - 20)), 18, 6);
      c.fillStyle = "#1A1A1A";
      c.font = kitFont(20, 700);
      c.fillText(i === 0 ? "MUD" : "ROCK", 322, y + h / 2);
      y += h;
    });
    c.strokeStyle = "#1A1A1A";
    c.lineWidth = 4;
    c.strokeRect(70, 80, 200, y - 80);
  });

/** Maßband: gelb mit Strichen und Zahlen. */
const tapeTex = () =>
  canvasTex("tape", 64, 512, (c) => {
    c.fillStyle = "#F2C21B";
    c.fillRect(0, 0, 64, 512);
    c.fillStyle = "#1A1A1A";
    for (let k = 0; k < 512; k += 16) c.fillRect(0, k, k % 64 === 0 ? 34 : 18, 3);
    c.font = kitFont(20, 800);
    c.save();
    c.translate(48, 0);
    c.rotate(Math.PI / 2);
    for (let k = 0; k < 8; k++) c.fillText(String(32 + k), k * 64 + 8, -2);
    c.restore();
  }, [1, 3]);

/* ------------------------------------------------------------------ */
/* Material-Kurzformen                                                  */
/* ------------------------------------------------------------------ */

const Plastic: React.FC<{ readonly color: string; readonly rough?: number; readonly emissive?: string; readonly ei?: number }> = ({ color, rough = 0.42, emissive, ei = 0 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} clearcoat={0.55} clearcoatRoughness={0.35} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
);
const Matte: React.FC<{ readonly color: string; readonly rough?: number; readonly metal?: number }> = ({ color, rough = 0.8, metal = 0 }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
);

/* ------------------------------------------------------------------ */
/* MILO                                                                 */
/* ------------------------------------------------------------------ */

export type MiloProps = {
  readonly frame: number;
  readonly position?: V3;
  readonly rotation?: V3;
  readonly scale?: number;
  readonly eyes?: "dot" | "wide" | "closed" | "happy";
  readonly mouth?: "flat" | "smile" | "o" | "frown";
  /** Stirnlampe: Farbe (amber = Milo, teal = die anderen), an 0..1, Lichtkegel-Länge (0 = keiner) */
  readonly lamp?: { readonly color?: string; readonly on?: number; readonly beam?: number; readonly light?: number };
  /** Arme nach vorn heben (rad) [links, rechts] */
  readonly reach?: readonly [number, number];
  /** Arme seitlich (rad) [links, rechts] */
  readonly spread?: readonly [number, number];
  /** Rechte Hand klopft auf den Helm: raise 0..1 (Arm hoch), hit 0..1 (Knöchel am Helm) */
  readonly tap?: { readonly raise: number; readonly hit: number };
  /** Schlag VON OBEN auf den Helm (0..1): Helm + Kopf nicken kurz */
  readonly hatHit?: number;
  readonly nod?: number;
  readonly look?: number;
  readonly tilt?: number;
  readonly lean?: number;
  /** 0..1 knien (Körper tiefer, Beine nach vorn) */
  readonly kneel?: number;
  readonly brow?: number;
  readonly eyePop?: number;
  readonly blinkSeed?: number;
  readonly holdR?: React.ReactNode;
  readonly holdL?: React.ReactNode;
  /** Brustkorb hebt/senkt sich (Ausatmen 0..1) */
  readonly breath?: number;
  /** nur Kopf + Helm zeichnen (Ursprung = Kopfmitte), z. B. für den Milo oben im Rohr */
  readonly headOnly?: boolean;
};

/**
 * Milo (eigene Klotzfigur). Fußpunkt = position, Blick nach +z. Höhe ≈ 3,1 (Helm-Oberkante) × scale.
 * Kopfmitte y ≈ 2,45, Stirnlampe (0, 2,93, 0,47), Schulter (±0,9, 1,95).
 */
export const Milo: React.FC<MiloProps> = (p) => {
  const {
    frame,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    eyes = "dot",
    mouth = "flat",
    lamp,
    reach = [0.12, 0.12],
    spread = [0.1, 0.1],
    tap,
    hatHit = 0,
    nod = 0,
    look = 0,
    tilt = 0,
    lean = 0,
    kneel = 0,
    brow = 0,
    eyePop = 1,
    blinkSeed = 1,
    breath = 0,
  } = p;
  const lampColor = lamp?.color ?? B.amber;
  const lampOn = lamp?.on ?? 1;
  const idle = Math.sin(frame * 0.05 + blinkSeed) * 0.012;
  const blink = eyes !== "closed" && blinkAt(frame, blinkSeed);
  const drop = kneel * 0.62;
  const s = (eyes === "wide" ? 1.3 : 1) * eyePop;
  const eye = (x: number) => {
    if (eyes === "closed" || blink)
      return (
        <mesh position={[x, 0.08, 0.372]}>
          <planeGeometry args={[0.13, 0.026]} />
          <meshBasicMaterial color={B.ink} />
        </mesh>
      );
    if (eyes === "happy")
      return (
        <mesh position={[x, 0.06, 0.372]}>
          <torusGeometry args={[0.055, 0.016, 8, 16, Math.PI]} />
          <meshBasicMaterial color={B.ink} />
        </mesh>
      );
    return (
      <group position={[x, 0.08, 0.372]} scale={[s, s, 1]}>
        {eyes === "wide" ? (
          <mesh position={[0, 0, -0.002]}>
            <circleGeometry args={[0.085, 22]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ) : null}
        <mesh>
          <circleGeometry args={[0.055, 22]} />
          <meshBasicMaterial color={B.ink} />
        </mesh>
        <mesh position={[0.018, 0.02, 0.002]}>
          <circleGeometry args={[0.016, 10]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    );
  };
  const mouthEl =
    mouth === "o" ? (
      <mesh position={[0, -0.2, 0.372]}>
        <circleGeometry args={[0.055, 18]} />
        <meshBasicMaterial color="#2A1416" />
      </mesh>
    ) : mouth === "flat" ? (
      <mesh position={[0, -0.2, 0.372]}>
        <planeGeometry args={[0.16, 0.028]} />
        <meshBasicMaterial color="#2A1416" />
      </mesh>
    ) : (
      <mesh position={[0, mouth === "frown" ? -0.24 : -0.17, 0.372]} rotation={[0, 0, mouth === "frown" ? 0 : Math.PI]}>
        <torusGeometry args={[0.075, 0.017, 8, 18, Math.PI]} />
        <meshBasicMaterial color="#2A1416" />
      </mesh>
    );
  // Kopf + Helm (Drehpunkt Hals y 2,07)
  const hit = hatHit;
  const head = (
    <group position={[0, 2.07, 0]} rotation={[nod + hit * 0.16, look, tilt]}>
      <group position={[0, 0.38, 0]}>
        <RoundedBox args={[0.8, 0.76, 0.74]} radius={0.12} smoothness={3} castShadow>
          <Plastic color={B.skin} rough={0.5} />
        </RoundedBox>
        {eye(-0.17)}
        {eye(0.17)}
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.17, 0.2 + (eyes === "wide" ? 0.04 : 0) + brow * 0.03, 0.374]} rotation={[0, 0, sd * brow * 0.35]}>
            <planeGeometry args={[0.15, 0.035]} />
            <meshBasicMaterial color={B.stache} />
          </mesh>
        ))}
        {/* Nase + Schnurrbart-Klotz */}
        <RoundedBox args={[0.13, 0.12, 0.1]} radius={0.03} position={[0, -0.04, 0.39]}>
          <Plastic color="#D9A27A" rough={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.44, 0.11, 0.09]} radius={0.035} position={[0, -0.12, 0.395]} castShadow>
          <Plastic color={B.stache} rough={0.6} />
        </RoundedBox>
        {mouthEl}
        {/* Helm (gelb), Krempe, Grat, runde Stirnlampe */}
        <group position={[0, 0.47 - hit * 0.07, 0]} scale={[1, 1 - hit * 0.12, 1]}>
          <RoundedBox args={[0.9, 0.34, 0.84]} radius={0.15} smoothness={3} position={[0, 0.06, 0]} castShadow>
            <Plastic color={B.hat} rough={0.32} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.08, 0.86]} radius={0.03} position={[0, 0.24, 0]}>
            <Plastic color="#E0B010" rough={0.35} />
          </RoundedBox>
          <RoundedBox args={[1.04, 0.06, 1.02]} radius={0.025} position={[0, -0.1, 0.04]} castShadow>
            <Plastic color={B.hat} rough={0.32} />
          </RoundedBox>
          <group position={[0, 0.05, 0.43]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 22]} />
              <meshStandardMaterial color="#2A2A2E" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.052]}>
              <circleGeometry args={[0.095, 22]} />
              <meshStandardMaterial color={lampColor} emissive={lampColor} emissiveIntensity={0.3 + 2.6 * lampOn} toneMapped={false} />
            </mesh>
            {lampOn > 0.02 ? (
              <>
                <Halo at={[0, 0, 0.1]} size={0.9} color={lampColor} opacity={0.75 * lampOn} />
                <pointLight position={[0, 0, 0.5]} color={lampColor} intensity={(lamp?.light ?? 2.5) * lampOn} distance={7} decay={2} />
                {lamp?.beam ? <LightShaft from={[0, 0, 0.06]} to={[0, -lamp.beam * 0.32, lamp.beam]} radius={lamp.beam * 0.24} top={0.1} color={lampColor} opacity={0.2 * lampOn} /> : null}
              </>
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
  if (p.headOnly)
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <group position={[0, -2.45, 0]}>{head}</group>
      </group>
    );
  const arm = (sd: -1 | 1, i: 0 | 1) => {
    let rz = sd * spread[i];
    let rx = -(reach[i] + (i ? -idle : idle));
    if (i === 1 && tap && tap.raise > 0) {
      // Arm seitlich nach oben über den Kopf, Knöchel an den Helm
      const up = 3.42 + 0.2 * tap.hit;
      rz = sd * (spread[i] + (up - spread[i]) * tap.raise);
      rx = rx * (1 - tap.raise) - 0.18 * tap.raise;
    }
    return (
      <group key={sd} position={[sd * 0.9, 1.95, 0]} rotation={[rx, 0, rz]}>
        <RoundedBox args={[0.36, 0.95, 0.38]} radius={0.12} position={[0, -0.44, 0]} castShadow>
          <Plastic color={B.sleeve} />
        </RoundedBox>
        <RoundedBox args={[0.32, 0.3, 0.34]} radius={0.1} position={[0, -0.98, 0]} castShadow>
          <Plastic color={B.glove} rough={0.7} />
        </RoundedBox>
        <group position={[0, -1.02, 0.1]}>{i === 1 ? p.holdR : p.holdL}</group>
      </group>
    );
  };
  const leg = (sd: -1 | 1) => (
    <group key={sd} position={[sd * 0.3, 0.75, 0]} rotation={[-1.35 * kneel * (sd > 0 ? 1 : 0.2), 0, 0]}>
      <RoundedBox args={[0.5, 0.6, 0.52]} radius={0.12} position={[0, -0.3, 0]} castShadow>
        <Plastic color={B.overall} />
      </RoundedBox>
      <RoundedBox args={[0.54, 0.2, 0.66]} radius={0.06} position={[0, -0.65, 0.06]} castShadow>
        <Plastic color={B.boot} rough={0.6} />
      </RoundedBox>
    </group>
  );
  return (
    <group position={[position[0], position[1] + (idle - drop) * scale, position[2]]} rotation={rotation} scale={scale}>
      <group position={[0, 0.75, 0]} rotation={[lean + kneel * 0.15, 0, 0]}>
        <group position={[0, -0.75, 0]}>
          {/* Hüfte (Latzhose) */}
          <RoundedBox args={[1.25, 0.42, 0.74]} radius={0.12} position={[0, 0.92, 0]} castShadow>
            <Plastic color={B.overall} />
          </RoundedBox>
          {/* Rumpf: breit und kastig, Weste darüber */}
          <group scale={[1, 1 + breath * 0.04, 1 + breath * 0.05]} position={[0, 0, 0]}>
            <RoundedBox args={[1.5, 1.02, 0.8]} radius={0.14} position={[0, 1.6, 0]} castShadow receiveShadow>
              <Plastic color={B.overall} />
            </RoundedBox>
            <RoundedBox args={[1.6, 0.92, 0.86]} radius={0.14} position={[0, 1.66, 0]} castShadow>
              <Plastic color={B.vest} rough={0.55} />
            </RoundedBox>
            {/* Latz vorn sichtbar zwischen den Westenhälften */}
            <mesh position={[0, 1.6, 0.433]}>
              <planeGeometry args={[0.46, 0.8]} />
              <Matte color={B.overall} rough={0.7} />
            </mesh>
            {[1.42, 1.8].map((y) =>
              [-1, 1].map((sd) => (
                <mesh key={`${y}-${sd}`} position={[sd * 0.53, y, 0.434]}>
                  <planeGeometry args={[0.5, 0.085]} />
                  <meshStandardMaterial color={B.silver} metalness={0.6} roughness={0.25} emissive="#9AA4B4" emissiveIntensity={0.25} />
                </mesh>
              )),
            )}
            {[1.42, 1.8].map((y) => (
              <mesh key={`b${y}`} position={[0, y, -0.434]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[1.56, 0.085]} />
                <meshStandardMaterial color={B.silver} metalness={0.6} roughness={0.25} emissive="#9AA4B4" emissiveIntensity={0.25} />
              </mesh>
            ))}
          </group>
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
/* Requisiten                                                           */
/* ------------------------------------------------------------------ */

/** Rostiges Eisenrohr mit Kreide-X. Ursprung = Boden, `top` = Höhe über Boden. `glow` 0..1 türkis aus der Öffnung. */
export const Pipe: React.FC<{ readonly position?: V3; readonly top?: number; readonly glow?: number; readonly radius?: number; readonly down?: number; readonly inside?: boolean }> = ({
  position = [0, 0, 0],
  top = 1.0,
  glow = 0,
  radius = 0.3,
  down = 2,
  inside = false,
}) => {
  const tex = rustTex();
  const len = top + down;
  return (
    <group position={position}>
      <mesh position={[0, top - len / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, len, 28, 1, true]} />
        <meshStandardMaterial map={tex} color="#C07050" roughness={0.75} metalness={0.35} side={DoubleSide} />
      </mesh>
      {inside ? null : (
        <mesh position={[0, top - 0.25, 0]}>
          <cylinderGeometry args={[radius * 0.86, radius * 0.86, 0.5, 24, 1, true]} />
          <meshStandardMaterial color="#1A0D08" roughness={0.9} side={DoubleSide} />
        </mesh>
      )}
      {/* Flansch oben */}
      <mesh position={[0, top, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.05, 10, 28]} />
        <meshStandardMaterial map={tex} color="#B06048" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* dunkle Öffnung + türkiser Schein von unten */}
      <mesh position={[0, top - 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.86, 24]} />
        <meshStandardMaterial color="#050608" emissive={B.teal} emissiveIntensity={glow * 2.2} toneMapped={false} />
      </mesh>
      {glow > 0.02 ? (
        <>
          <pointLight position={[0, top + 0.3, 0]} color={B.teal} intensity={3 * glow} distance={4} decay={2} />
          <Halo at={[0, top + 0.05, 0]} size={1.6} color={B.teal} opacity={0.6 * glow} />
        </>
      ) : null}
      {/* Kreide-X vorn */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[0, top * 0.45, radius + 0.004]} rotation={[0, 0, sd * 0.75]}>
          <planeGeometry args={[0.05, Math.min(0.42, top * 0.6)]} />
          <meshStandardMaterial color="#E9E6DE" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

/** Kieselsteine um/auf dem Rohr, springen mit `jump` 0..1. */
export const Pebbles: React.FC<{ readonly center?: V3; readonly jump?: number; readonly ring?: number; readonly count?: number; readonly seed?: number }> = ({
  center = [0, 0, 0],
  jump = 0,
  ring = 0.55,
  count = 9,
  seed = 4,
}) => {
  const items = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + r() * 0.5;
      const d = ring + r() * 0.35;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.05 + r() * 0.06, h: 0.6 + r() * 0.8, rot: r() * 3 };
    });
  }, [count, ring, seed]);
  return (
    <group position={center}>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.s * 0.6 + jump * it.h * 0.22, it.z]} rotation={[it.rot + jump * 2, it.rot, 0]} castShadow>
          <dodecahedronGeometry args={[it.s, 0]} />
          <meshStandardMaterial color={i % 3 ? "#6A6460" : "#827A70"} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Roter Schraubenschlüssel (Ursprung = Griffmitte, liegt entlang +y). */
export const Wrench: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[0.12, 0.7, 0.07]} radius={0.03} position={[0, 0.1, 0]} castShadow>
      <Plastic color={B.wrench} rough={0.35} />
    </RoundedBox>
    <mesh position={[0, 0.52, 0]} castShadow>
      <torusGeometry args={[0.12, 0.05, 8, 18, Math.PI * 1.45]} />
      <meshStandardMaterial color="#B9BEC6" metalness={0.8} roughness={0.3} />
    </mesh>
  </group>
);

/** Tablet mit Bauplan oder Bohrprofil; `ring` 0..1 = roter Kreis (blinkt) in der Mitte des Plans. */
export const Tablet: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number; readonly show: "plan" | "bore"; readonly ring?: number; readonly kb?: number }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  show,
  ring = 0,
  kb = 0,
}) => {
  const w = show === "plan" ? 1.2 : 0.9;
  const h = show === "plan" ? 0.9 : 1.2;
  const map = show === "plan" ? blueprintTex() : boreLogTex();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[w + 0.12, h + 0.12, 0.06]} radius={0.04} castShadow>
        <Plastic color="#1B1D22" rough={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.032]} scale={[1 + kb * 0.0, 1, 1]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {ring > 0 ? (
        <mesh position={[0, -0.06 * (h / 0.9), 0.036]}>
          <ringGeometry args={[0.11, 0.15, 32]} />
          <meshBasicMaterial color="#FF2E2E" transparent opacity={ring} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Funkgerät mit Aufkleber „BASE“, LED blinkt mit `led` 0..1. */
export const Walkie: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number; readonly led?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, led = 0 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[0.42, 0.8, 0.2]} radius={0.06} castShadow>
      <Plastic color="#25282E" rough={0.5} />
    </RoundedBox>
    <mesh position={[0.12, 0.62, 0]}>
      <cylinderGeometry args={[0.035, 0.04, 0.5, 10]} />
      <Matte color="#1A1B1F" />
    </mesh>
    {[0, 1, 2, 3].map((k) => (
      <mesh key={k} position={[0, 0.2 - k * 0.07, 0.102]}>
        <planeGeometry args={[0.28, 0.03]} />
        <meshBasicMaterial color="#0C0D10" />
      </mesh>
    ))}
    <mesh position={[0, -0.2, 0.102]}>
      <planeGeometry args={[0.34, 0.16]} />
      <meshBasicMaterial color={B.amber} toneMapped={false} />
    </mesh>
    <TextLabel text="BASE" width={0.32} height={0.14} color="#141414" position={[0, -0.2, 0.106]} />
    <mesh position={[-0.12, 0.33, 0.104]}>
      <circleGeometry args={[0.035, 14]} />
      <meshBasicMaterial color={led > 0.5 ? "#FF3B30" : "#4A1210"} toneMapped={false} />
    </mesh>
    {led > 0.5 ? <Halo at={[-0.12, 0.33, 0.13]} size={0.35} color="#FF3B30" opacity={0.8} /> : null}
  </group>
);

/** Maßband-Gehäuse (gelb) + Band von `from` nach `to` (Weltkoordinaten der Szene, nicht der Gruppe). */
export const TapeBand: React.FC<{ readonly from: V3; readonly to: V3; readonly width?: number; readonly offset?: number }> = ({ from, to, width = 0.07, offset = 0 }) => {
  const tex = tapeTex();
  tex.offset.y = offset;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const mid: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const ang = Math.atan2(to[0] - from[0], -(to[1] - from[1]));
  return (
    <mesh position={mid} rotation={[0, 0, ang]}>
      <planeGeometry args={[width, len]} />
      <meshStandardMaterial map={tex} roughness={0.4} side={DoubleSide} emissive="#3A2C00" emissiveIntensity={0.4} />
    </mesh>
  );
};
export const TapeCase: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly scale?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[0.42, 0.42, 0.2]} radius={0.08} castShadow>
      <Plastic color="#F2C21B" rough={0.4} />
    </RoundedBox>
    <mesh position={[0, 0, 0.102]}>
      <circleGeometry args={[0.12, 20]} />
      <Matte color="#1B1B1B" />
    </mesh>
  </group>
);

/** Papier mit Bleistift-Schrift (Zettel / Logbuch-Zeile). */
export const Paper: React.FC<{ readonly position?: V3; readonly rotation?: V3; readonly w?: number; readonly h?: number; readonly lines: readonly string[]; readonly unfold?: number; readonly ruled?: boolean }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  w = 1.4,
  h = 0.9,
  lines,
  unfold = 1,
  ruled = false,
}) => (
  <group position={position} rotation={rotation}>
    {/* untere Hälfte fest, obere klappt auf (unfold 0 = gefaltet) */}
    <mesh position={[0, -h / 4, 0]}>
      <planeGeometry args={[w, h / 2]} />
      <meshStandardMaterial color={ruled ? "#E8E0C8" : B.paper} roughness={0.95} side={DoubleSide} />
    </mesh>
    <group rotation={[(1 - unfold) * Math.PI * 0.95, 0, 0]}>
      <mesh position={[0, h / 4, 0]}>
        <planeGeometry args={[w, h / 2]} />
        <meshStandardMaterial color={ruled ? "#E8E0C8" : B.paper} roughness={0.95} side={DoubleSide} />
      </mesh>
    </group>
    {ruled
      ? [0, 1, 2, 3].map((k) => (
          <mesh key={k} position={[0, h * 0.32 - k * h * 0.2, 0.002]}>
            <planeGeometry args={[w * 0.92, 0.008]} />
            <meshBasicMaterial color="#7FA0C8" />
          </mesh>
        ))
      : null}
    {unfold > 0.8
      ? lines.map((l, i) => (
          <TextLabel key={i} text={l} width={w * 0.9} height={h * 0.3} color={B.pencil} position={[0, (lines.length - 1) * h * 0.17 - i * h * 0.34, 0.005]} rotation={[0, 0, -0.04]} opacity={(unfold - 0.8) * 5} />
        ))
      : null}
  </group>
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                             */
/* ------------------------------------------------------------------ */

/** Arbeitslampe auf Dreibein: Kasten-Strahler (amber oder türkis), Lichtkegel nach unten-vorn. */
export const WorkLamp: React.FC<{ readonly position: V3; readonly aim?: V3; readonly color?: string; readonly on?: number; readonly height?: number; readonly light?: number }> = ({
  position,
  aim = [0, 0, 0],
  color = B.amber,
  on = 1,
  height = 3.2,
  light = 10,
}) => {
  const top: V3 = [position[0], position[1] + height, position[2]];
  const yaw = Math.atan2(aim[0] - top[0], aim[2] - top[2]);
  return (
    <group>
      {[0, 1, 2].map((k) => {
        const a = (k / 3) * Math.PI * 2;
        return (
          <mesh key={k} position={[position[0] + Math.sin(a) * 0.35, position[1] + height / 2, position[2] + Math.cos(a) * 0.35]} rotation={[Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2]}>
            <cylinderGeometry args={[0.03, 0.04, height, 6]} />
            <Matte color="#1C1F25" metal={0.5} rough={0.5} />
          </mesh>
        );
      })}
      <group position={top} rotation={[0, yaw, 0]}>
        <mesh rotation={[0.45, 0, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.25]} />
          <Matte color="#202329" metal={0.4} rough={0.5} />
        </mesh>
        <mesh position={[0, -0.06, 0.13]} rotation={[0.45, 0, 0]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2 + 2.6 * on} toneMapped={false} />
        </mesh>
      </group>
      {on > 0.02 ? (
        <>
          <pointLight position={[top[0], top[1] - 0.3, top[2]]} color={color} intensity={light * on} distance={16} decay={2} />
          <Halo at={top} size={2.4} color={color} opacity={0.55 * on} />
          <LightShaft from={top} to={[aim[0], 0, aim[2]]} radius={2.2} top={0.25} color={color} opacity={0.11 * on} />
        </>
      ) : null}
    </group>
  );
};

/** Baustellen-Wohnwagen (Bürocontainer) mit Tür, warmem Fenster, Pinnwand mit Lageplan. Front +z. */
export const Trailer: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly warm?: number; readonly tint?: string }> = ({ position, rotation = [0, 0, 0], warm = 1, tint }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
      <boxGeometry args={[6, 2.7, 2.6]} />
      <Matte color={tint ?? "#8C9198"} rough={0.6} metal={0.2} />
    </mesh>
    {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
      <mesh key={x} position={[x, 1.55, 1.305]}>
        <planeGeometry args={[0.06, 2.6]} />
        <meshBasicMaterial color="#5B6068" />
      </mesh>
    ))}
    {/* Tür */}
    <mesh position={[1.3, 1.25, 1.31]}>
      <planeGeometry args={[1.0, 2.1]} />
      <Matte color="#4D535C" rough={0.6} />
    </mesh>
    <mesh position={[1.7, 1.2, 1.33]}>
      <boxGeometry args={[0.08, 0.2, 0.05]} />
      <Matte color="#C7CCD2" metal={0.7} rough={0.3} />
    </mesh>
    {/* Fenster warm */}
    <mesh position={[-1.4, 1.85, 1.31]}>
      <planeGeometry args={[1.5, 0.9]} />
      <meshStandardMaterial color="#3A2A18" emissive={B.amberHot} emissiveIntensity={0.9 * warm} toneMapped={false} />
    </mesh>
    {/* Pinnwand mit Lageplan neben der Tür */}
    <mesh position={[0.1, 1.6, 1.32]}>
      <planeGeometry args={[0.9, 0.75]} />
      <Matte color="#9A6E44" rough={0.9} />
    </mesh>
    <mesh position={[0.1, 1.6, 1.33]} rotation={[0, 0, 0.03]}>
      <planeGeometry args={[0.7, 0.55]} />
      <meshBasicMaterial map={blueprintTex()} toneMapped={false} />
    </mesh>
    {/* Stufe + Achse */}
    <mesh position={[1.3, 0.12, 1.6]}>
      <boxGeometry args={[1.1, 0.24, 0.6]} />
      <Matte color="#3A3E45" />
    </mesh>
    <pointLight position={[1.3, 2.7, 1.9]} color={B.amberHot} intensity={4 * warm} distance={6} decay={2} />
    <mesh position={[1.3, 2.75, 1.4]}>
      <boxGeometry args={[0.3, 0.15, 0.2]} />
      <meshStandardMaterial color={B.amberHot} emissive={B.amberHot} emissiveIntensity={2 * warm} toneMapped={false} />
    </mesh>
  </group>
);

/** Turmdrehkran (eigene Form): Gittermast aus Rohren, Ausleger, Gegengewicht, rotes Warnlicht. */
export const Crane: React.FC<{ readonly position: V3; readonly height?: number; readonly yaw?: number; readonly frame: number; readonly color?: string }> = ({ position, height = 18, yaw = 0, frame, color = B.crane }) => {
  const seg = 1.5;
  const n = Math.floor(height / seg);
  const blink = Math.floor(frame / 20) % 2 === 0;
  return (
    <group position={position}>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.6, height / 2, sz * 0.6]}>
            <boxGeometry args={[0.1, height, 0.1]} />
            <Matte color={color} rough={0.6} metal={0.3} />
          </mesh>
        )),
      )}
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, i * seg + seg / 2, 0]}>
          {[0, 1].map((k) => (
            <mesh key={k} position={k ? [0, 0, 0.6] : [0.6, 0, 0]} rotation={k ? [0, 0, 0.78] : [0.78, 0, 0]}>
              <boxGeometry args={k ? [0.06, 1.7, 0.06] : [0.06, 1.7, 0.06]} />
              <Matte color={color} rough={0.6} metal={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[0, height, 0]} rotation={[0, yaw, 0]}>
        <mesh position={[-5, 0.4, 0]}>
          <boxGeometry args={[16, 0.5, 0.6]} />
          <Matte color={color} rough={0.6} metal={0.3} />
        </mesh>
        <mesh position={[2.4, 0, 0]}>
          <boxGeometry args={[1.6, 1.0, 1.0]} />
          <Matte color="#3B3E44" />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.2, 2.6, 0.2]} />
          <Matte color={color} />
        </mesh>
        <mesh position={[-11, -3, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 6, 4]} />
          <Matte color="#1A1A1A" />
        </mesh>
        <mesh position={[-11, -6.1, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.3]} />
          <Matte color="#2A2A2A" />
        </mesh>
        <mesh position={[0, 3.0, 0]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshBasicMaterial color={blink ? "#FF2A2A" : "#4A0E0E"} toneMapped={false} />
        </mesh>
        {blink ? <Halo at={[0, 3.0, 0]} size={1.8} color="#FF2A2A" opacity={0.8} /> : null}
      </group>
    </group>
  );
};

/** Bauzaun mit Planen auf der Grubenkante, Schild „CONCRETE POUR · 6:00 AM“ und Baustellenuhr. */
export const Fence: React.FC<{ readonly z?: number; readonly y?: number; readonly from?: number; readonly to?: number; readonly clock?: string; readonly sign?: boolean; readonly tarp?: string }> = ({
  z = -8.3,
  y = 3,
  from = -12,
  to = 12,
  clock = "2:14",
  sign = true,
  tarp = B.tarp,
}) => {
  const posts: number[] = [];
  for (let x = from; x <= to; x += 2.4) posts.push(x);
  return (
    <group>
      {posts.map((x) => (
        <mesh key={x} position={[x, y + 1, z]}>
          <boxGeometry args={[0.08, 2, 0.08]} />
          <Matte color="#5E636B" metal={0.6} rough={0.4} />
        </mesh>
      ))}
      <mesh position={[(from + to) / 2, y + 0.9, z + 0.02]}>
        <planeGeometry args={[to - from, 1.6]} />
        <Matte color={tarp} rough={0.9} />
      </mesh>
      {sign ? (
        <group position={[2.2, y + 1.0, z + 0.06]}>
          <mesh>
            <planeGeometry args={[2.6, 1.1]} />
            <meshBasicMaterial color="#F4F1E6" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.38, 0.002]}>
            <planeGeometry args={[2.6, 0.32]} />
            <meshBasicMaterial color="#D22B22" toneMapped={false} />
          </mesh>
          <TextLabel text="CONCRETE POUR" width={2.4} height={0.3} color="#FFFFFF" position={[0, 0.38, 0.004]} />
          <TextLabel text="6:00 AM" width={2.3} height={0.6} color="#141414" position={[0, -0.14, 0.004]} />
        </group>
      ) : null}
      {clock ? (
        <group position={[-1.6, y + 1.2, z + 0.06]}>
          <mesh>
            <planeGeometry args={[1.4, 0.7]} />
            <meshBasicMaterial color="#101418" toneMapped={false} />
          </mesh>
          <TextLabel text={clock} width={1.3} height={0.56} color="#FF5A3A" position={[0, 0, 0.004]} />
        </group>
      ) : null}
    </group>
  );
};

/** Ferne Stadt: Hochhaus-Silhouetten mit Fensterraster (wenige Fenster an). */
export const City: React.FC<{ readonly z?: number; readonly y?: number; readonly seed?: number; readonly dim?: number }> = ({ z = -40, y = 0, seed = 5, dim = 1 }) => {
  const blocks = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: 16 }, (_, i) => ({ x: -42 + i * 5.6 + r() * 2, w: 3.5 + r() * 3, h: 8 + r() * 22, d: 3 + r() * 3, s: Math.floor(r() * 9) + 1, dz: r() * 10 }));
  }, [seed]);
  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, y + b.h / 2, z - b.dz]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial map={windowsTex(b.s)} emissiveMap={windowsTex(b.s)} emissive="#FFFFFF" emissiveIntensity={0.55 * dim} color="#20283A" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

/** Bewehrungsmatte (Rebar-Gitter) mit orangen Schutzkappen. Ursprung = Mitte, liegt auf Höhe y. */
export const Rebar: React.FC<{ readonly position: V3; readonly w?: number; readonly d?: number; readonly step?: number; readonly color?: string }> = ({ position, w = 6, d = 4, step = 0.6, color = "#5A3A2A" }) => {
  const xs: number[] = [];
  for (let x = -w / 2; x <= w / 2 + 1e-6; x += step) xs.push(x);
  const zs: number[] = [];
  for (let z = -d / 2; z <= d / 2 + 1e-6; z += step) zs.push(z);
  return (
    <group position={position}>
      {xs.map((x) => (
        <mesh key={`x${x}`} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, d, 5]} />
          <Matte color={color} metal={0.5} rough={0.6} />
        </mesh>
      ))}
      {zs.map((z) => (
        <mesh key={`z${z}`} position={[0, 0.05, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, w, 5]} />
          <Matte color={color} metal={0.5} rough={0.6} />
        </mesh>
      ))}
      {xs.filter((_, i) => i % 3 === 0).map((x) => (
        <group key={`c${x}`}>
          <mesh position={[x, 0.5, -d / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1, 5]} />
            <Matte color={color} metal={0.5} rough={0.6} />
          </mesh>
          <mesh position={[x, 1.02, -d / 2]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <Matte color="#E8641A" rough={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Nasser Schlamm-Boden mit Pfützen (spiegeln Lampen als Glanzflecke). */
export const MudGround: React.FC<{ readonly size?: number; readonly y?: number; readonly puddles?: readonly V3[]; readonly glint?: string; readonly concrete?: number }> = ({
  size = 60,
  y = 0,
  puddles = [],
  glint = B.amber,
  concrete = 0,
}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={mudTex()} color="#B9AFA6" roughness={0.38} metalness={0.15} />
    </mesh>
    {puddles.map((p, i) => (
      <group key={i}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p[0], y + 0.006, p[2]]} scale={[1, 0.6, 1]}>
          <circleGeometry args={[p[1] || 0.9, 24]} />
          <meshStandardMaterial color="#0C1220" roughness={0.04} metalness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p[0], y + 0.012, p[2]]}>
          <planeGeometry args={[(p[1] || 0.9) * 0.5, (p[1] || 0.9) * 0.9]} />
          <meshBasicMaterial map={softDot()} color={glint} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    ))}
    {concrete > 0 ? (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.02, 0]}>
        <circleGeometry args={[0.1 + concrete * 14, 48]} />
        <meshStandardMaterial color="#8E9096" roughness={0.3} metalness={0.05} />
      </mesh>
    ) : null}
  </group>
);

/** Grubenwände aus Beton (hinten + Seiten), Grubenkante auf `height`. */
export const PitWalls: React.FC<{ readonly height?: number; readonly back?: number; readonly side?: number }> = ({ height = 3, back = -8, side = 9 }) => {
  const tex = concreteTex("wall", "#565A62");
  return (
    <group>
      <mesh position={[0, height / 2, back]} receiveShadow>
        <boxGeometry args={[side * 2 + 1, height, 0.6]} />
        <meshStandardMaterial map={tex} color="#9AA0AA" roughness={0.85} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * side, height / 2, back / 2 + 4]} receiveShadow>
          <boxGeometry args={[0.6, height, -back + 8]} />
          <meshStandardMaterial map={tex} color="#9AA0AA" roughness={0.85} />
        </mesh>
      ))}
      {/* Grubenkante (oberer Boden) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height, back - 20]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#1E2026" roughness={0.6} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Die ganze Baustelle LOT 9                                            */
/* ------------------------------------------------------------------ */

export const LAMPS: readonly { readonly p: V3; readonly aim: V3 }[] = [
  { p: [-3.4, 0, 2.6], aim: [0, 0, 0] },
  { p: [4.2, 0, -2.8], aim: [0.5, 0, 0.5] },
  { p: [-6.4, 0, -1.2], aim: [-5, 0, -2] },
];
export const PUDDLES: readonly V3[] = [
  [-1.6, 1.0, 1.4],
  [2.3, 0.7, 2.2],
  [-3.8, 1.2, -1.6],
  [1.4, 0.6, -3.4],
];

/**
 * Baustelle: Grube (Boden y 0), Rohr in der Mitte, Rebar, Arbeitslampen, Wohnwagen, Zaun auf der Kante, Kran, Stadt.
 * `tint` "teal" = die Baustelle UNTEN (gleich gebaut, alles türkis).
 */
export const SiteSet: React.FC<{
  readonly frame: number;
  readonly tint?: "amber" | "teal";
  readonly lampsOn?: number;
  readonly pipe?: boolean;
  readonly pipeGlow?: number;
  readonly clock?: string;
  readonly city?: boolean;
  readonly concrete?: number;
  /** Schild „CONCRETE POUR · 6:00 AM“ am Zaun (nur wo es erzählt: stakes, pour) */
  readonly sign?: boolean;
}> = ({ frame, tint = "amber", lampsOn = 1, pipe = true, pipeGlow = 0, clock = "2:14", city = true, concrete = 0, sign = false }) => {
  const col = tint === "teal" ? B.teal : B.amber;
  return (
    <>
      <MudGround puddles={PUDDLES} glint={col} concrete={concrete} />
      <PitWalls />
      <Rebar position={[0.5, 0.3, -4.6]} w={7} d={3} />
      {pipe ? <Pipe glow={pipeGlow} /> : null}
      {LAMPS.map((l, i) => (
        <WorkLamp key={i} position={l.p} aim={l.aim} color={col} on={lampsOn} />
      ))}
      <Trailer position={[-5.4, 0, -5.2]} rotation={[0, 0.25, 0]} warm={tint === "teal" ? 0.2 : 1} tint={tint === "teal" ? "#5E8A8E" : undefined} />
      <Fence clock={clock} sign={sign} tarp={tint === "teal" ? "#153A3E" : B.tarp} />
      <Crane position={[7, 3, -13]} height={17} yaw={0.4} frame={frame} />
      {city ? <City z={-34} y={3} dim={tint === "teal" ? 0.4 : 1} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Himmel: Wolken, Sterne, Beton-Decke mit Stirnlampen                  */
/* ------------------------------------------------------------------ */

/** Sternfeld auf einer Ebene in Höhe `y` (Punkte). `teal` 0..1 = Anteil der Sterne, die türkis aufflackern (Reihenfolge per Seed). */
export const StarField: React.FC<{ readonly y?: number; readonly size?: number; readonly count?: number; readonly teal?: number; readonly frame: number; readonly center?: V3; readonly dot?: number; readonly opacity?: number }> = ({
  y = 30,
  size = 90,
  count = 420,
  teal = 0,
  frame,
  center = [0, 0, -10],
  dot = 0.5,
  opacity = 1,
}) => {
  const base = useMemo(() => {
    const r = seeded(91);
    return Array.from({ length: count }, () => [r(), r(), r()]);
  }, [count]);
  const white = useMemo(() => new BufferGeometry(), []);
  const tealG = useMemo(() => new BufferGeometry(), []);
  const w: number[] = [];
  const t: number[] = [];
  base.forEach((b, i) => {
    const x = center[0] + (b[0] - 0.5) * size;
    const z = center[2] + (b[1] - 0.5) * size;
    const isTeal = i === 0 ? teal > 0 : b[2] < teal;
    (isTeal ? t : w).push(x, y, z);
  });
  white.setAttribute("position", new BufferAttribute(new Float32Array(w), 3));
  tealG.setAttribute("position", new BufferAttribute(new Float32Array(t), 3));
  const flick = 0.75 + 0.25 * Math.sin(frame * 0.9);
  return (
    <group>
      <points geometry={white}>
        <pointsMaterial map={softDot()} color="#F2F4FF" size={dot} sizeAttenuation transparent opacity={0.9 * opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
      <points geometry={tealG}>
        <pointsMaterial map={softDot()} color={B.teal} size={dot * 1.6} sizeAttenuation transparent opacity={flick * opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
    </group>
  );
};

/** Der „Himmel“ als Unterseite einer weiteren Baustelle: Beton-Decke (Deckkraft `show`), Rohr-Mündungen. */
export const ConcreteSky: React.FC<{ readonly y?: number; readonly show?: number; readonly center?: V3 }> = ({ y = 30, show = 1, center = [0, 0, -10] }) => {
  const tex = concreteTex("sky", "#4A4E56");
  if (show <= 0.01) return null;
  return (
    <mesh position={[center[0], y + 0.05, center[2]]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[140, 140]} />
      <meshStandardMaterial map={tex} color="#7C828C" roughness={0.9} transparent opacity={show} side={DoubleSide} emissive="#0E3A40" emissiveIntensity={0.4 * show} />
    </mesh>
  );
};

/** Wolkendecke aus dunklen, weichen Klötzen; `open` 0..1 schiebt sie zur Seite. */
export const Clouds: React.FC<{ readonly y?: number; readonly open?: number; readonly frame: number; readonly center?: V3 }> = ({ y = 24, open = 0, frame, center = [0, 0, -10] }) => {
  const items = useMemo(() => {
    const r = seeded(55);
    return Array.from({ length: 22 }, () => ({ x: (r() - 0.5) * 70, z: (r() - 0.5) * 60, s: 6 + r() * 8 }));
  }, []);
  return (
    <group>
      {items.map((c, i) => {
        const dir = c.x >= 0 ? 1 : -1;
        const x = center[0] + c.x + dir * open * 40 + Math.sin(frame * 0.01 + i) * 0.4;
        return (
          <mesh key={i} position={[x, y + (i % 3) * 0.6, center[2] + c.z]} scale={[c.s, c.s * 0.35, c.s]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color="#2C3854" emissive="#1A2440" emissiveIntensity={0.6} roughness={1} transparent opacity={0.92} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Betonmischer + Beton                                                 */
/* ------------------------------------------------------------------ */

/** Eigener Klotz-Betonmischer (keine Marke): Fahrerhaus, Fahrgestell, drehende Trommel mit Streifen, Rinne. Front +x. */
export const Mixer: React.FC<{ readonly position: V3; readonly rotation?: V3; readonly frame: number; readonly color?: string }> = ({ position, rotation = [0, 0, 0], frame, color = "#E4E7EA" }) => (
  <group position={position} rotation={rotation}>
    <RoundedBox args={[5.6, 0.5, 1.9]} radius={0.1} position={[0, 0.9, 0]} castShadow>
      <Plastic color="#2A2D33" />
    </RoundedBox>
    <RoundedBox args={[1.6, 1.7, 2.0]} radius={0.2} position={[2.3, 1.95, 0]} castShadow>
      <Plastic color={color} />
    </RoundedBox>
    <mesh position={[3.11, 2.25, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[1.7, 0.7]} />
      <meshStandardMaterial color="#1A2A3A" emissive="#2A3C50" emissiveIntensity={0.5} roughness={0.1} metalness={0.6} />
    </mesh>
    {[-1, 1].map((sd) => (
      <mesh key={sd} position={[3.12, 1.3, sd * 0.7]}>
        <boxGeometry args={[0.05, 0.22, 0.32]} />
        <meshStandardMaterial color="#FFF2D0" emissive="#FFE6A8" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
    ))}
    <group position={[-0.6, 2.25, 0]} rotation={[0, 0, 0.18]}>
      <group rotation={[frame * 0.06, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.95, 1.15, 3.4, 20]} />
          <Plastic color="#D8DADD" rough={0.5} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[(k * Math.PI * 2) / 3, 0, Math.PI / 2]} position={[0, 0, 0]}>
            <cylinderGeometry args={[1.02, 1.17, 0.35, 20, 1, true, 0, 0.9]} />
            <Plastic color="#E8641A" rough={0.5} />
          </mesh>
        ))}
      </group>
    </group>
    {[-1.9, -0.6, 2.2].map((x) =>
      [-1, 1].map((sd) => (
        <mesh key={`${x}${sd}`} position={[x, 0.45, sd * 0.95]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 18]} />
          <Matte color="#121316" rough={0.8} />
        </mesh>
      )),
    )}
    <mesh position={[-2.7, 1.5, 0]} rotation={[0, 0, -0.6]}>
      <boxGeometry args={[1.6, 0.12, 0.4]} />
      <Matte color="#7A7E85" metal={0.5} />
    </mesh>
  </group>
);

/** Fließender Beton: graue Zunge von `from` nach `to`, `t` 0..1 Fortschritt (Weltkoordinaten, Boden). */
export const ConcreteFlow: React.FC<{ readonly from: V3; readonly to: V3; readonly t: number; readonly width?: number; readonly frame: number }> = ({ from, to, t, width = 1.4, frame }) => {
  if (t <= 0) return null;
  const end: V3 = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
  const len = Math.hypot(end[0] - from[0], end[2] - from[2]);
  const mid: V3 = [(from[0] + end[0]) / 2, (from[1] + end[1]) / 2, (from[2] + end[2]) / 2];
  const yaw = Math.atan2(end[0] - from[0], end[2] - from[2]);
  const wob = 1 + Math.sin(frame * 0.3) * 0.03;
  return (
    <group>
      <mesh position={mid} rotation={[0, yaw, 0]} scale={[wob, 1, 1]}>
        <boxGeometry args={[width, 0.18, Math.max(0.01, len)]} />
        <meshStandardMaterial color="#8C8F95" roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={end} scale={[width * 0.6 * wob, 0.16, width * 0.6]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color="#8C8F95" roughness={0.25} />
      </mesh>
    </group>
  );
};

/** Hilfsfunktion: weicher Wert 0..1 zwischen zwei Bildern (geclamped). */
export const win = (frame: number, a: number, b: number) => interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
