/**
 * Themenunabhängige Bausteine: Info-Grafiken, Studio-Kulisse, Pointen-Requisiten.
 * Gleicher Look wie das übrige Kit (Cel-Shading über `Toon`, Kontur über <Ink> in INK),
 * alles deterministisch aus Props (`progress`, `frame`, `appear` …) – kein useFrame,
 * kein Zufall. Schrift: Montserrat 900 aus public/fonts (`useKitFont`).
 * Dokumentation und Kontrastwerte: docs/design-system.md, „Themenunabhängige Bausteine“.
 *
 * Konventionen
 * - Jede Komponente hat `position`, `rotation`, `scale`; Vorderseite zeigt nach +z.
 * - `progress` 0..1 = Aufbau-Animation (Balken wachsen, Zahl zählt hoch, Ring füllt sich).
 *   In der Szene z. B. `progress={interpolate(f, [0, 30], [0, 1], clamp)}`.
 * - `appear` 0..1 = Hereinploppen (Skalierung mit Überschwinger).
 * - Text liegt auf **unbeleuchteten** Flächen (meshBasic, toneMapped aus): der Kontrast
 *   ist dadurch unabhängig vom Licht genau der der Palette (gemessen ≥ 4,5 : 1).
 */
import React, { useMemo } from "react";
import {
  CanvasTexture,
  DoubleSide,
  Quaternion,
  Euler,
  SRGBColorSpace,
  Vector3,
} from "three";
import { Glow } from "./fx";
import { kitFont, useKitFont } from "./font";
import { Prop } from "./env";
import { INK, Ink, Toon, useCanvasTexture } from "./toon";
import { Toonie } from "./Toonie";

type P3 = [number, number, number];

type Placement = {
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
};

/* ------------------------------------------------------------------ */
/* Palette                                                              */
/* ------------------------------------------------------------------ */

/**
 * Neutrale Kit-Palette. Text-Paare (Kontrast WCAG, nachgerechnet):
 * paperText auf paper 14,7 : 1 · boardText auf board 13,4 : 1 · paperText auf accent 10,2 : 1 ·
 * INK auf accent 12,0 : 1 · paperText auf muted 10,0 : 1. Datenfarben (SERIES) stehen nie unter Text.
 */
export const KIT = {
  paper: "#FFF6E3",
  paperText: "#2B2118",
  board: "#22303F",
  boardText: "#FFFFFF",
  frame: "#4A3A2C",
  accent: "#FFC928",
  blue: "#3D8BD9",
  orange: "#F28C28",
  green: "#3DA35D",
  red: "#E5484D",
  purple: "#8E5BD0",
  muted: "#C9CED6",
  gold: "#F4B731",
  goldDark: "#B9851C",
  metal: "#C8D3DB",
  metalDark: "#8796A1",
  burlap: "#C9A26B",
  ocean: "#5DB7E3",
  land: "#9CCB6B",
  studioTop: "#2B2140",
  studioBottom: "#5B3A5E",
} as const;

/** Reihenfolge der Datenfarben (Balken, Größenvergleich). */
export const SERIES = [KIT.blue, KIT.orange, KIT.green, KIT.red, KIT.purple] as const;

/* ------------------------------------------------------------------ */
/* Hilfen: Zeit, Zahlen                                                 */
/* ------------------------------------------------------------------ */

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
/** Hereinploppen mit Überschwinger (0 → ~1,1 → 1). */
export const popIn = (t: number) => {
  const x = clamp01(t);
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
/** Teil-Fortschritt des i-ten von n Elementen (gestaffelt; `overlap` 0..1). */
export const stagger = (progress: number, i: number, n: number, overlap = 0.5) => {
  const len = 1 / (n - (n - 1) * overlap);
  const start = i * len * (1 - overlap);
  return clamp01((progress - start) / len);
};

/** Zahl mit englischen Tausender-Kommas („8,849“), deterministisch (ohne Locale). */
export const formatNumber = (v: number, decimals = 0) => {
  const neg = v < 0;
  const fixed = Math.abs(v).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${withSep}${dec ? `.${dec}` : ""}`;
};

/** Kurzform für große Zahlen: 8100000000 → „8.1B“, 12500 → „12.5K“ (1 Nachkommastelle, „.0“ entfällt). */
export const formatCompact = (v: number) => {
  const a = Math.abs(v);
  const [div, suf] = a >= 1e9 ? [1e9, "B"] : a >= 1e6 ? [1e6, "M"] : a >= 1e3 ? [1e3, "K"] : [1, ""];
  if (div === 1) return formatNumber(v);
  return `${(v / div).toFixed(1).replace(/\.0$/, "")}${suf}`;
};

/** „Schöne“ Schrittweite für Skalen (1, 2, 5 × 10^n). */
export const niceStep = (raw: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
};

/* ------------------------------------------------------------------ */
/* Text als Textur                                                      */
/* ------------------------------------------------------------------ */

export type TextStyle = {
  /** Schriftfarbe */
  readonly color?: string;
  /** Hintergrund (Pille/Feld); null = transparent */
  readonly bg?: string | null;
  /** Rand um die Schrift (wie Untertitel); null = keiner */
  readonly stroke?: string | null;
  /** Rahmen um das Feld in INK */
  readonly border?: boolean;
  readonly align?: "center" | "left" | "right";
  /** Rundung des Felds 0..1 (1 = Pille) */
  readonly round?: number;
  /** Schriftgröße relativ zur Feldhöhe */
  readonly size?: number;
};

const PX_PER_UNIT = 220;

/**
 * Text-Textur, die bei Textänderung **dieselbe** Canvas neu bemalt (für hochzählende Zahlen:
 * keine neue Textur pro Frame). Breite wird per maxWidth gestaucht statt überzulaufen.
 */
export const useTextTexture = (
  text: string,
  width: number,
  height: number,
  style: TextStyle = {},
) => {
  const font = useKitFont();
  const pw = Math.min(2048, Math.max(32, Math.round(width * PX_PER_UNIT)));
  const ph = Math.min(1024, Math.max(16, Math.round(height * PX_PER_UNIT)));
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = pw;
    canvas.height = ph;
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [pw, ph]);
  const {
    color = KIT.paperText,
    bg = null,
    stroke = null,
    border = false,
    align = "center",
    round = 1,
    size,
  } = style;
  useMemo(() => {
    const canvas = tex.image as HTMLCanvasElement;
    const c = canvas.getContext("2d");
    if (!c) return;
    const w = canvas.width;
    const h = canvas.height;
    c.clearRect(0, 0, w, h);
    const bw = border ? Math.max(4, h * 0.07) : 0;
    if (bg) {
      const r = (Math.min(w, h) / 2) * round;
      const path = new Path2D();
      path.roundRect(bw / 2, bw / 2, w - bw, h - bw, r);
      c.fillStyle = bg;
      c.fill(path);
      if (border) {
        c.lineWidth = bw;
        c.strokeStyle = INK;
        c.stroke(path);
      }
    }
    const px = h * (size ?? (bg ? 0.6 : 0.78));
    const sw = stroke ? px * 0.2 : 0;
    const pad = bg ? h * 0.32 : sw;
    c.font = kitFont(px);
    c.textBaseline = "middle";
    c.textAlign = align;
    const x = align === "left" ? pad : align === "right" ? w - pad : w / 2;
    const y = h / 2 + px * 0.04;
    const maxW = w - pad * 2;
    if (stroke) {
      c.lineJoin = "round";
      c.lineWidth = sw;
      c.strokeStyle = stroke;
      c.strokeText(text, x, y, maxW);
    }
    c.fillStyle = color;
    c.fillText(text, x, y, maxW);
    tex.needsUpdate = true;
    // `font` löst das Neuzeichnen aus, sobald die Kit-Schrift geladen ist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex, text, font, color, bg, stroke, border, align, round, size]);
  return tex;
};

/** Text-Fläche (unbeleuchtet, exakte Palettenfarben). Mitte = position. */
export const TextLabel: React.FC<
  Placement &
    TextStyle & {
      readonly text: string;
      readonly width: number;
      readonly height: number;
      readonly opacity?: number;
    }
> = ({ text, width, height, position, rotation, scale = 1, opacity = 1, ...style }) => {
  const tex = useTextTexture(text, width, height, style);
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
        side={DoubleSide}
      />
    </mesh>
  );
};

/** Pill-Beschriftung (Feld + Rahmen), Standard dunkle Schrift auf Papier (14,7 : 1). */
export const Pill: React.FC<
  Placement & {
    readonly text: string;
    readonly width?: number;
    readonly height?: number;
    readonly bg?: string;
    readonly color?: string;
  }
> = ({ text, width, height = 0.56, bg = KIT.paper, color = KIT.paperText, ...p }) => (
  <TextLabel
    text={text}
    width={width ?? Math.max(1.2, text.length * height * 0.46 + height * 0.8)}
    height={height}
    bg={bg}
    color={color}
    border
    {...p}
  />
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                             */
/* ------------------------------------------------------------------ */

/**
 * Studio-Hintergrund: Verlaufskuppel + große Rückwand mit hellem Zentrum und dunklen
 * Rändern (Vignette in 3D, zusätzlich zur 2D-`Grade`). Für Info-Einschübe zu jedem Thema.
 * `z` = Abstand der Rückwand; die Wand ist 90 × 90 groß.
 */
export const StudioBackdrop: React.FC<{
  readonly top?: string;
  readonly bottom?: string;
  readonly center?: string;
  readonly z?: number;
  readonly y?: number;
}> = ({ top = KIT.studioTop, bottom = KIT.studioBottom, center = "#8A5C7E", z = -18, y = 4 }) => {
  const sky = useCanvasTexture(`studio-sky-${top}-${bottom}`, [8, 256], (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  const wall = useCanvasTexture(`studio-wall-${top}-${bottom}-${center}`, [512, 512], (c, w, h) => {
    const lin = c.createLinearGradient(0, 0, 0, h);
    lin.addColorStop(0, top);
    lin.addColorStop(1, bottom);
    c.fillStyle = lin;
    c.fillRect(0, 0, w, h);
    const rad = c.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.42);
    rad.addColorStop(0, center);
    rad.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = rad;
    c.fillRect(0, 0, w, h);
    const vig = c.createRadialGradient(w / 2, h / 2, w * 0.28, w / 2, h / 2, w * 0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    c.fillStyle = vig;
    c.fillRect(0, 0, w, h);
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[300, 32, 16]} />
        <meshBasicMaterial map={sky} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, y, z]}>
        <planeGeometry args={[90, 90]} />
        <meshBasicMaterial map={wall} />
      </mesh>
    </>
  );
};

/** Licht für Studio-Einstellungen: warmes Key-Light links oben vorn + kühle Aufhellung. */
export const StudioLights: React.FC<{
  readonly sun?: P3;
  readonly intensity?: number;
  readonly color?: string;
}> = ({ sun = [-6, 11, 8], intensity = 2.4, color = "#FFF1D8" }) => (
  <>
    <hemisphereLight args={["#CFE3FF", "#6A4A5A", 1.0]} />
    <directionalLight
      position={sun}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-12}
      shadow-camera-right={12}
      shadow-camera-top={12}
      shadow-camera-bottom={-12}
    />
  </>
);

/** Runde Bühnen-/Bodenplatte, Oberkante bei y = 0. */
export const FloorPlate: React.FC<
  Placement & {
    readonly radius?: number;
    readonly color?: string;
    readonly rim?: string;
  }
> = ({ position = [0, 0, 0], rotation, scale = 1, radius = 4.5, color = "#E9DCC6", rim = KIT.frame }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, -0.15, 0]} receiveShadow>
      <cylinderGeometry args={[radius, radius * 1.03, 0.3, 64]} />
      <Toon color={color} />
      <Ink f={0.012}>
        <cylinderGeometry args={[radius, radius * 1.03, 0.3, 64]} />
      </Ink>
    </mesh>
    <mesh position={[0, -0.42, 0]}>
      <cylinderGeometry args={[radius * 1.06, radius * 1.1, 0.25, 64]} />
      <Toon color={rim} />
    </mesh>
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.86, radius * 0.9, 64]} />
      <meshBasicMaterial color={rim} transparent opacity={0.35} />
    </mesh>
  </group>
);

/**
 * Info-Tafel: Rahmen, Titelleiste in Akzentfarbe, Textzeilen. Mitte der Tafel = position.
 * `dark` = dunkle Tafel mit weißer Schrift (13,4 : 1), sonst Papier mit dunkler Schrift (14,7 : 1).
 * `legs` = Länge der Standbeine nach unten (0 = hängt frei). `children` sitzen vor der
 * Tafelfläche (lokale Mitte, z = 0.12).
 */
export const InfoBoard: React.FC<
  Placement & {
    readonly width?: number;
    readonly height?: number;
    readonly title?: string;
    readonly lines?: readonly string[];
    readonly accent?: string;
    readonly dark?: boolean;
    readonly legs?: number;
    readonly appear?: number;
    readonly children?: React.ReactNode;
  }
> = ({
  position,
  rotation,
  scale = 1,
  width = 4,
  height = 3,
  title,
  lines = [],
  accent = KIT.accent,
  dark = false,
  legs = 0,
  appear = 1,
  children,
}) => {
  const s = scale * popIn(appear);
  const face = dark ? KIT.board : KIT.paper;
  const text = dark ? KIT.boardText : KIT.paperText;
  const titleH = title ? Math.min(0.8, height * 0.22) : 0;
  const bodyTop = height / 2 - titleH;
  const lineH = lines.length ? Math.min(0.62, (height - titleH - 0.3) / lines.length) : 0;
  if (s <= 0.001) return null;
  return (
    <group position={position} rotation={rotation} scale={s}>
      <Prop color={KIT.frame} position={[0, 0, -0.06]} ink={0.012}>
        <boxGeometry args={[width + 0.3, height + 0.3, 0.16]} />
      </Prop>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={face} toneMapped={false} />
      </mesh>
      {title ? (
        <TextLabel
          text={title}
          position={[0, height / 2 - titleH / 2, 0.05]}
          width={width}
          height={titleH}
          bg={accent}
          color={KIT.paperText}
          round={0}
          size={0.62}
        />
      ) : null}
      {lines.map((l, i) => (
        <TextLabel
          key={`${i}-${l}`}
          text={l}
          position={[0, bodyTop - 0.15 - lineH * (i + 0.5), 0.05]}
          width={width - 0.3}
          height={lineH}
          color={text}
          size={0.72}
        />
      ))}
      {legs > 0
        ? [-1, 1].map((sx) => (
            <Prop
              key={sx}
              color={KIT.frame}
              position={[sx * width * 0.35, -height / 2 - legs / 2, -0.06]}
              ink={0.04}
            >
              <cylinderGeometry args={[0.07, 0.09, legs, 10]} />
            </Prop>
          ))
        : null}
      <group position={[0, 0, 0.12]}>{children}</group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Info-Grafiken                                                        */
/* ------------------------------------------------------------------ */

/**
 * Balkendiagramm: Balken wachsen gestaffelt mit `progress`, Wert zählt mit (weiß mit
 * INK-Rand über dem Balken), Beschriftung als Papier-Pille unter dem Sockel.
 * Ursprung = Mitte der Sockel-Unterkante (Sockel 0,62 hoch, Beschriftung auf seiner Vorderseite). `highlight` = Index, der in Akzentfarbe leuchtet.
 */
export const BarChart: React.FC<
  Placement & {
    readonly values: readonly number[];
    readonly labels?: readonly string[];
    readonly max?: number;
    readonly progress?: number;
    readonly colors?: readonly string[];
    readonly highlight?: number;
    readonly unit?: string;
    readonly decimals?: number;
    readonly height?: number;
    readonly barWidth?: number;
    readonly gap?: number;
  }
> = ({
  position,
  rotation,
  scale = 1,
  values,
  labels = [],
  max,
  progress = 1,
  colors = SERIES,
  highlight,
  unit = "",
  decimals = 0,
  height = 4,
  barWidth = 0.9,
  gap = 0.5,
}) => {
  const n = values.length;
  const top = max ?? Math.max(...values, 1e-9);
  const total = n * barWidth + (n - 1) * gap;
  const base = 0.62;
  const depth = barWidth + 0.7;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Prop color={KIT.frame} position={[0, base / 2, 0]} ink={0.01}>
        <boxGeometry args={[total + 0.9, base, depth]} />
      </Prop>
      {values.map((v, i) => {
        const g = easeOutCubic(stagger(progress, i, n, 0.6));
        const h = Math.max(0.02, (v / top) * height * g);
        const x = -total / 2 + barWidth / 2 + i * (barWidth + gap);
        const col = highlight === i ? KIT.accent : colors[i % colors.length];
        return (
          <group key={i} position={[x, base, 0]}>
            <Prop color={col} position={[0, h / 2, 0]} ink={0.025}>
              <boxGeometry args={[barWidth, h, barWidth * 0.8]} />
            </Prop>
            {g > 0.04 ? (
              <TextLabel
                text={`${formatNumber(v * g, decimals)}${unit}`}
                position={[0, h + 0.38, 0.2]}
                width={barWidth + gap + 0.4}
                height={0.6}
                color="#FFFFFF"
                stroke={INK}
              />
            ) : null}
            {labels[i] ? (
              <Pill
                text={labels[i]}
                position={[0, -base / 2, depth / 2 + 0.02]}
                width={barWidth + gap * 0.95}
                height={0.54}
              />
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

/**
 * Zahl-Zähler-Tafel: große Zahl zählt mit `progress` von `from` auf `to` (ease-out).
 * Auf einer `InfoBoard` mit Titel; `dark` für weiße Zahl auf dunkler Tafel.
 */
export const CounterBoard: React.FC<
  Placement & {
    readonly to: number;
    readonly from?: number;
    readonly progress?: number;
    readonly title?: string;
    readonly prefix?: string;
    readonly suffix?: string;
    readonly decimals?: number;
    /** Kurzform „8.1B“ statt „8,100,000,000“ (ab ~9 Zeichen empfohlen: lange Zahlen werden sonst gestaucht) */
    readonly compact?: boolean;
    readonly width?: number;
    readonly height?: number;
    readonly dark?: boolean;
    readonly accent?: string;
    readonly appear?: number;
    readonly legs?: number;
  }
> = ({
  to,
  from = 0,
  progress = 1,
  title,
  prefix = "",
  suffix = "",
  decimals = 0,
  compact = false,
  width = 4.2,
  height = 2.4,
  dark = true,
  accent = KIT.accent,
  appear = 1,
  legs = 0,
  ...p
}) => {
  const v = from + (to - from) * easeOutCubic(progress);
  const titleH = title ? Math.min(0.8, height * 0.22) : 0;
  return (
    <InfoBoard {...p} width={width} height={height} title={title} dark={dark} accent={accent} appear={appear} legs={legs}>
      <TextLabel
        text={`${prefix}${compact ? formatCompact(v) : formatNumber(v, decimals)}${suffix}`}
        position={[0, -titleH / 2, 0]}
        width={width - 0.3}
        height={(height - titleH) * 0.8}
        color={dark ? KIT.boardText : KIT.paperText}
        size={0.8}
      />
    </InfoBoard>
  );
};

/**
 * Prozent-Ring: grauer Ring, farbiger Bogen füllt sich ab 12 Uhr im Uhrzeigersinn bis
 * `value` % (× `progress`), Zahl in der Mitte, optionale Pille darunter. Steht senkrecht (+z).
 */
export const PercentRing: React.FC<
  Placement & {
    readonly value: number;
    readonly progress?: number;
    readonly radius?: number;
    readonly tube?: number;
    readonly color?: string;
    readonly track?: string;
    readonly label?: string;
    readonly decimals?: number;
  }
> = ({
  position,
  rotation,
  scale = 1,
  value,
  progress = 1,
  radius = 1.4,
  tube = 0.3,
  color = KIT.green,
  track = KIT.muted,
  label,
  decimals = 0,
}) => {
  const p = (clamp01(value / 100) * easeOutCubic(progress));
  const arc = Math.max(0.001, p * Math.PI * 2);
  const end = Math.PI / 2 - arc;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <torusGeometry args={[radius, tube, 16, 72]} />
        <Toon color={track} />
        <Ink f={0.04}>
          <torusGeometry args={[radius, tube, 16, 72]} />
        </Ink>
      </mesh>
      {p > 0.002 ? (
        <group position={[0, 0, 0.06]}>
          <mesh rotation={[0, 0, end]}>
            <torusGeometry args={[radius, tube * 1.08, 16, 72, arc]} />
            <Toon color={color} />
          </mesh>
          {[Math.PI / 2, end].map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]}>
              <sphereGeometry args={[tube * 1.08, 16, 12]} />
              <Toon color={color} />
            </mesh>
          ))}
        </group>
      ) : null}
      {/* Mittelscheibe: Papier, damit die Zahl auf jedem Hintergrund 15 : 1 hat */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[radius - tube * 0.9, 48]} />
        <meshBasicMaterial color={KIT.paper} toneMapped={false} />
      </mesh>
      <TextLabel
        text={`${formatNumber(value * easeOutCubic(progress), decimals)}%`}
        position={[0, 0, 0.1]}
        width={(radius - tube) * 1.7}
        height={(radius - tube) * 0.9}
        color={KIT.paperText}
        size={0.82}
      />
      {label ? <Pill text={label} position={[0, -radius - tube - 0.5, 0.1]} height={0.56} /> : null}
    </group>
  );
};

export type CompareItem = {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
  /** Form des Objekts; `node` = eigenes Objekt, 1 Einheit hoch, Fuß bei y = 0 */
  readonly shape?: "column" | "sphere" | "figure" | "tower";
  readonly node?: React.ReactNode;
};

/**
 * Größenvergleich: Objekte nebeneinander, maßstäblich (größter Wert = `maxHeight`),
 * Maßstab-Lineal links mit runden Schritten, Wert über, Name unter jedem Objekt.
 * Ursprung = Boden, Mitte; alles steht auf einem 0,55 hohen Sockel mit den Namen vorn. Werte in `unit` (z. B. „ m“).
 */
export const SizeCompare: React.FC<
  Placement & {
    readonly items: readonly CompareItem[];
    readonly unit?: string;
    readonly maxHeight?: number;
    readonly progress?: number;
    readonly spacing?: number;
    readonly frame?: number;
    readonly ruler?: boolean;
  }
> = ({
  position,
  rotation,
  scale = 1,
  items,
  unit = "",
  maxHeight = 4.5,
  progress = 1,
  spacing = 2.4,
  frame = 0,
  ruler = true,
}) => {
  const top = Math.max(...items.map((i) => i.value), 1e-9);
  const k = maxHeight / top;
  const step = niceStep(top / 4);
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const n = items.length;
  const x0 = (-(n - 1) * spacing) / 2;
  const rulerX = x0 - spacing * 0.75;
  const shown = easeOutCubic(progress);
  const plinth = 0.55;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Prop color={KIT.frame} position={[(rulerX - 0.6 + (-x0 + 0.9)) / 2, plinth / 2, 0]} ink={0.01}>
        <boxGeometry args={[-x0 + 0.9 - (rulerX - 0.6), plinth, 1.6]} />
      </Prop>
      {ruler ? (
        <group position={[rulerX, plinth, 0]}>
          <Prop color={KIT.paper} position={[0, (maxHeight * shown) / 2, 0]} ink={0.04}>
            <boxGeometry args={[0.14, Math.max(0.01, maxHeight * shown), 0.14]} />
          </Prop>
          {ticks.map((v) =>
            v * k <= maxHeight * shown + 1e-6 ? (
              <group key={v} position={[0, v * k, 0]}>
                <mesh position={[0.25, 0, 0]}>
                  <boxGeometry args={[0.36, 0.06, 0.06]} />
                  <meshBasicMaterial color={KIT.paper} toneMapped={false} />
                </mesh>
                <TextLabel
                  text={`${formatNumber(v)}${unit}`}
                  position={[-0.85, 0, 0]}
                  width={1.4}
                  height={0.5}
                  color="#FFFFFF"
                  stroke={INK}
                  align="right"
                />
              </group>
            ) : null,
          )}
        </group>
      ) : null}
      {items.map((it, i) => {
        const g = easeOutCubic(stagger(progress, i, n, 0.5));
        const h = Math.max(0.02, it.value * k * g);
        const col = it.color ?? SERIES[i % SERIES.length];
        const shape = it.shape ?? "column";
        let obj: React.ReactNode;
        if (it.node) {
          obj = <group scale={h}>{it.node}</group>;
        } else if (shape === "figure") {
          obj = <Toonie frame={frame + i * 17} scale={h / 4.08} suit={col} />;
        } else if (shape === "sphere") {
          obj = (
            <Prop color={col} position={[0, h / 2, 0]} ink={0.03}>
              <sphereGeometry args={[h / 2, 32, 24]} />
            </Prop>
          );
        } else if (shape === "tower") {
          const w = Math.min(1.1, h * 0.35);
          obj = (
            <>
              <Prop color={col} position={[0, h * 0.4, 0]} ink={0.025}>
                <boxGeometry args={[w, h * 0.8, w]} />
              </Prop>
              <Prop color={col} position={[0, h * 0.9, 0]} rotation={[0, Math.PI / 4, 0]} ink={0.04}>
                <coneGeometry args={[w * 0.72, h * 0.2, 4]} />
              </Prop>
            </>
          );
        } else {
          const w = Math.min(1.1, Math.max(0.5, h * 0.3));
          obj = (
            <Prop color={col} position={[0, h / 2, 0]} ink={0.025}>
              <boxGeometry args={[w, h, w]} />
            </Prop>
          );
        }
        return (
          <group key={it.label} position={[x0 + i * spacing, plinth, 0]}>
            {obj}
            {g > 0.04 ? (
              <TextLabel
                text={`${formatNumber(it.value * g)}${unit}`}
                position={[0, h + 0.4, 0.6]}
                width={spacing}
                height={0.55}
                color="#FFFFFF"
                stroke={INK}
              />
            ) : null}
            <Pill text={it.label} position={[0, -plinth / 2, 0.82]} height={0.5} width={Math.min(spacing * 0.95, it.label.length * 0.24 + 0.5)} />
          </group>
        );
      })}
    </group>
  );
};

export type TimelineEvent = { readonly year: string; readonly label: string };

/**
 * Zeitstrahl, senkrecht (Hochformat): oben alt, unten neu. Jahr als Akzent-Pille links,
 * Ereignis als Papier-Pille rechts. `progress` blendet die Einträge nacheinander ein,
 * `at` (Index, auch Zwischenwerte) = Marker-Position. Ursprung = Mitte des Strahls.
 * Inhalte nur mit Freigabe des Faktenprüfers.
 */
export const Timeline: React.FC<
  Placement & {
    readonly events: readonly TimelineEvent[];
    readonly progress?: number;
    readonly at?: number;
    readonly length?: number;
    readonly frame?: number;
    readonly color?: string;
    readonly labelWidth?: number;
  }
> = ({
  position,
  rotation,
  scale = 1,
  events,
  progress = 1,
  at,
  length = 6,
  frame = 0,
  color = KIT.accent,
  labelWidth = 2.6,
}) => {
  const n = events.length;
  const yOf = (i: number) => length / 2 - (n > 1 ? (i * length) / (n - 1) : length / 2);
  const reveal = easeOutCubic(progress);
  const beamLen = Math.max(0.01, length * reveal);
  const markerAt = at === undefined ? undefined : Math.min(Math.max(at, 0), n - 1);
  const my =
    markerAt === undefined
      ? 0
      : yOf(Math.floor(markerAt)) +
        (yOf(Math.min(n - 1, Math.floor(markerAt) + 1)) - yOf(Math.floor(markerAt))) *
          (markerAt - Math.floor(markerAt));
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Prop color={KIT.paper} position={[0, length / 2 - beamLen / 2, 0]} ink={0.04}>
        <boxGeometry args={[0.2, beamLen, 0.2]} />
      </Prop>
      {events.map((e, i) => {
        const a = popIn(stagger(progress, i, n, 0.4));
        if (a <= 0.001) return null;
        const past = markerAt === undefined || i <= markerAt + 0.01;
        return (
          <group key={`${e.year}-${i}`} position={[0, yOf(i), 0]} scale={a}>
            <Prop color={past ? color : KIT.muted} ink={0.06}>
              <sphereGeometry args={[0.24, 20, 14]} />
            </Prop>
            <Pill
              text={e.year}
              position={[-0.45 - 0.75, 0, 0.1]}
              width={1.5}
              height={0.56}
              bg={past ? color : KIT.muted}
              color={KIT.paperText}
            />
            <Pill
              text={e.label}
              position={[0.45 + labelWidth / 2, 0, 0.1]}
              width={labelWidth}
              height={0.56}
            />
          </group>
        );
      })}
      {markerAt !== undefined ? (
        <group position={[0.42 + Math.sin(frame * 0.25) * 0.05, my, 0.3]}>
          <Prop color={color} rotation={[0, 0, Math.PI / 2]} ink={0.08}>
            <coneGeometry args={[0.18, 0.4, 3]} />
          </Prop>
        </group>
      ) : null}
    </group>
  );
};

/* Stark vereinfachte Kontinente (Länge, Breite) – bewusst schematisch, keine echte Küstenlinie. */
const CONTINENTS: readonly (readonly [number, number])[][] = [
  // Nordamerika
  [[-168, 66], [-140, 70], [-95, 72], [-80, 73], [-62, 60], [-55, 50], [-67, 45], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 20], [-87, 21], [-83, 15], [-78, 8], [-85, 10], [-105, 20], [-112, 30], [-118, 34], [-124, 40], [-124, 48], [-135, 57], [-150, 60], [-165, 60]],
  // Grönland
  [[-55, 60], [-42, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 77], [-55, 70]],
  // Südamerika
  [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -42], [-68, -55], [-74, -50], [-72, -30], [-70, -18], [-81, -5], [-80, 2]],
  // Eurasien
  [[-10, 36], [-9, 43], [-2, 47], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [60, 69], [80, 73], [105, 78], [140, 72], [180, 68], [180, 62], [160, 58], [140, 55], [135, 43], [122, 40], [122, 30], [110, 20], [108, 12], [100, 13], [103, 2], [98, 8], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 16], [44, 12], [35, 28], [35, 36], [28, 37], [26, 40], [22, 37], [15, 40], [12, 44], [3, 43], [-5, 36]],
  // Großbritannien
  [[-6, 50], [2, 51], [0, 58], [-6, 58]],
  // Afrika
  [[-17, 15], [-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 28], [44, 12], [51, 12], [42, -2], [40, -15], [35, -25], [20, -35], [17, -28], [12, -15], [13, -5], [9, 4], [-8, 4], [-15, 10]],
  // Madagaskar
  [[44, -25], [50, -15], [48, -13], [43, -22]],
  // Japan
  [[130, 31], [140, 35], [142, 42], [139, 40], [131, 34]],
  // Inselwelt Südostasien
  [[95, 5], [105, -6], [115, -8], [120, -3], [110, 2]],
  // Australien
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [130, -32], [115, -34]],
  // Antarktis (Streifen)
  [[-180, -72], [180, -72], [180, -90], [-180, -90]],
];

export type MapPin = {
  readonly lon: number;
  readonly lat: number;
  readonly label?: string;
  readonly color?: string;
  /** Beschriftung höher/tiefer setzen, wenn zwei Nadeln dicht beieinander stehen (Einheiten) */
  readonly labelDy?: number;
};

/**
 * Flache, stilisierte Weltkarte (Plattkarte, 2 : 1) als Tafel mit Rahmen; Stecknadeln an
 * Koordinaten (Länge/Breite in Grad). Nadel-Spitze sitzt genau auf dem Ort; `drop` 0..1
 * lässt die Nadeln nacheinander von oben einfallen, `frame` pulsiert der Ring am Ort.
 * Bewusst schematisch – nie als genaue Karte ausgeben.
 */
export const WorldMap: React.FC<
  Placement & {
    readonly width?: number;
    readonly pins?: readonly MapPin[];
    readonly drop?: number;
    readonly frame?: number;
    readonly ocean?: string;
    readonly land?: string;
  }
> = ({
  position,
  rotation,
  scale = 1,
  width = 6,
  pins = [],
  drop = 1,
  frame = 0,
  ocean = KIT.ocean,
  land = KIT.land,
}) => {
  const height = width / 2;
  const tex = useCanvasTexture(`worldmap-${ocean}-${land}`, [1024, 512], (c, w, h) => {
    c.fillStyle = ocean;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(255,255,255,0.18)";
    c.lineWidth = 2;
    for (let lon = -150; lon <= 150; lon += 30) {
      const x = ((lon + 180) / 360) * w;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * h;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.fillStyle = land;
    c.strokeStyle = INK;
    c.lineWidth = 4;
    c.lineJoin = "round";
    for (const poly of CONTINENTS) {
      c.beginPath();
      poly.forEach(([lon, lat], i) => {
        const x = ((lon + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
      c.closePath();
      c.fill();
      c.stroke();
    }
  });
  tex.colorSpace = SRGBColorSpace;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Prop color={KIT.frame} position={[0, 0, -0.08]} ink={0.012}>
        <boxGeometry args={[width + 0.3, height + 0.3, 0.16]} />
      </Prop>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {pins.map((p, i) => {
        const x = (p.lon / 180) * (width / 2);
        const y = (p.lat / 90) * (height / 2);
        const t = stagger(drop, i, pins.length, 0.5);
        if (t <= 0) return null;
        const fall = 1 - easeOutCubic(Math.min(1, t * 1.4));
        const squash = t > 0.7 ? Math.sin((t - 0.7) * 10) * 0.15 * (1 - t) : 0;
        const col = p.color ?? KIT.red;
        const pulse = ((frame + i * 11) % 36) / 36;
        return (
          <group key={`${p.lon},${p.lat},${i}`} position={[x, y, 0.05]}>
            {t > 0.6 ? (
              <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[0.12 + pulse * 0.35, 0.18 + pulse * 0.35, 32]} />
                <meshBasicMaterial color={col} transparent opacity={0.8 * (1 - pulse)} toneMapped={false} />
              </mesh>
            ) : null}
            <group position={[0, fall * 2.5, 0.3]} scale={[1 + squash, 1 - squash, 1]}>
              <Prop color={col} position={[0, 0.3, 0]} rotation={[Math.PI, 0, 0]} ink={0.06}>
                <coneGeometry args={[0.17, 0.6, 20]} />
              </Prop>
              <Prop color={col} position={[0, 0.66, 0]} ink={0.06}>
                <sphereGeometry args={[0.24, 20, 14]} />
              </Prop>
              <mesh position={[0, 0.68, 0.24]}>
                <circleGeometry args={[0.09, 16]} />
                <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
              </mesh>
              {p.label && t > 0.8 ? (
                <Pill text={p.label} position={[0, 1.25 + (p.labelDy ?? 0), 0.1]} height={0.42} />
              ) : null}
            </group>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Zeichen und Pfeil                                                    */
/* ------------------------------------------------------------------ */

/**
 * 3D-Fragezeichen oder -Ausrufezeichen (Höhe ≈ 2,3), wackelt mit `frame`, ploppt mit `appear`.
 * Fuß bei y = 0.
 */
export const Mark: React.FC<
  Placement & {
    readonly kind?: "?" | "!";
    readonly color?: string;
    readonly frame?: number;
    readonly appear?: number;
  }
> = ({ position, rotation, scale = 1, kind = "?", color = KIT.accent, frame = 0, appear = 1 }) => {
  const s = scale * popIn(appear);
  if (s <= 0.001) return null;
  const wob = Math.sin(frame * 0.18) * 0.12;
  const t = 0.19;
  return (
    <group position={position} rotation={rotation} scale={s}>
      <group rotation={[0, 0, wob]}>
        {kind === "!" ? (
          <Prop color={color} position={[0, 1.35, 0]} ink={0.045}>
            <capsuleGeometry args={[0.22, 1.2, 8, 16]} />
          </Prop>
        ) : (
          <>
            <Prop color={color} position={[0, 1.55, 0]} rotation={[0, 0, -Math.PI / 2]} ink={0.06}>
              <torusGeometry args={[0.46, t, 14, 40, Math.PI * 1.45]} />
            </Prop>
            <Prop color={color} position={[0, 0.88, 0]} ink={0.07}>
              <cylinderGeometry args={[t, t, 0.42, 16]} />
            </Prop>
          </>
        )}
        <Prop color={color} position={[0, 0.22, 0]} ink={0.07}>
          <sphereGeometry args={[0.22, 20, 14]} />
        </Prop>
      </group>
    </group>
  );
};

/**
 * Dicker Cartoon-Pfeil von `from` nach `to` (Weltkoordinaten der Elterngruppe),
 * wächst mit `grow` 0..1, wippt mit `frame` in Pfeilrichtung.
 */
export const Arrow: React.FC<{
  readonly from: P3;
  readonly to: P3;
  readonly grow?: number;
  readonly color?: string;
  readonly width?: number;
  readonly frame?: number;
}> = ({ from, to, grow = 1, color = KIT.red, width = 0.16, frame = 0 }) => {
  const d = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const full = d.length();
  const dir = d.clone().normalize();
  const rot = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir));
  const len = full * easeOutCubic(grow);
  const head = Math.min(width * 4, len * 0.5);
  const shaft = Math.max(0.001, len - head);
  const bob = Math.sin(frame * 0.3) * 0.08 * clamp01(grow);
  if (len < 0.01) return null;
  return (
    <group position={from} rotation={[rot.x, rot.y, rot.z]}>
      <group position={[0, bob, 0]}>
        <Prop color={color} position={[0, shaft / 2, 0]} ink={0.05}>
          <cylinderGeometry args={[width, width, shaft, 14]} />
        </Prop>
        <Prop color={color} position={[0, shaft + head / 2, 0]} ink={0.05}>
          <coneGeometry args={[width * 2.4, head, 20]} />
        </Prop>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Requisiten für Pointen                                               */
/* ------------------------------------------------------------------ */

/** Geldsack (Jute) mit Währungszeichen (`symbol`, Standard „$“); `squash` 0..1 = Plumps. Fuß bei y = 0. */
export const CashBag: React.FC<
  Placement & {
    readonly symbol?: string;
    readonly color?: string;
    readonly squash?: number;
  }
> = ({ position, rotation, scale = 1, symbol = "$", color = KIT.burlap, squash = 0 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <group scale={[1 + squash * 0.25, 1 - squash * 0.25, 1 + squash * 0.25]}>
      <Prop color={color} position={[0, 0.62, 0]} scale={[0.72, 0.62, 0.66]} ink={0.04}>
        <sphereGeometry args={[1, 24, 18]} />
      </Prop>
      <Prop color={color} position={[0, 1.3, 0]} ink={0.07}>
        <cylinderGeometry args={[0.16, 0.28, 0.32, 14]} />
      </Prop>
      <Prop color={KIT.paperText} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0}>
        <torusGeometry args={[0.25, 0.05, 8, 20]} />
      </Prop>
      {[-0.14, 0.14].map((x, i) => (
        <Prop key={x} color={color} position={[x, 1.55, 0]} rotation={[0, 0, (i ? -1 : 1) * 0.5]} scale={[1, 1.4, 1]} ink={0.08}>
          <sphereGeometry args={[0.13, 12, 10]} />
        </Prop>
      ))}
      <TextLabel text={symbol} position={[0, 0.62, 0.68]} width={0.9} height={0.8} color={KIT.green} stroke={INK} size={0.9} />
    </group>
  </group>
);

/**
 * Stoppuhr, Zifferblatt nach +z. `t` = Zeigerstellung in Umdrehungen (0..1 = eine Runde),
 * `alarm` 0..1 = Zittern. Mitte des Zifferblatts = position.
 */
export const Stopwatch: React.FC<
  Placement & {
    readonly t?: number;
    readonly frame?: number;
    readonly alarm?: number;
    readonly color?: string;
  }
> = ({ position, rotation, scale = 1, t = 0, frame = 0, alarm = 0, color = KIT.red }) => {
  const dial = useCanvasTexture("kit-stopwatch-dial", [512, 512], (c, w, h) => {
    c.fillStyle = KIT.paper;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = KIT.paperText;
    c.lineCap = "round";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const big = i % 5 === 0;
      c.lineWidth = big ? 14 : 5;
      const r1 = w * 0.47;
      const r0 = big ? w * 0.38 : w * 0.43;
      c.beginPath();
      c.moveTo(w / 2 + Math.sin(a) * r0, h / 2 - Math.cos(a) * r0);
      c.lineTo(w / 2 + Math.sin(a) * r1, h / 2 - Math.cos(a) * r1);
      c.stroke();
    }
  });
  dial.colorSpace = SRGBColorSpace;
  const shake = alarm > 0 ? Math.sin(frame * 2.3) * 0.06 * alarm : 0;
  const ang = -t * Math.PI * 2;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[0, 0, shake]}>
        <Prop color={color} rotation={[Math.PI / 2, 0, 0]} ink={0.03}>
          <cylinderGeometry args={[1, 1, 0.4, 48]} />
        </Prop>
        <mesh position={[0, 0, 0.21]}>
          <circleGeometry args={[0.86, 48]} />
          <meshBasicMaterial map={dial} toneMapped={false} />
        </mesh>
        <Prop color={KIT.metal} position={[0, 1.12, 0]} ink={0.07}>
          <cylinderGeometry args={[0.12, 0.12, 0.26, 14]} />
        </Prop>
        <Prop color={color} position={[0, 1.33, 0]} ink={0.06}>
          <cylinderGeometry args={[0.24, 0.24, 0.14, 18]} />
        </Prop>
        <Prop color={KIT.metal} position={[0.78, 0.78, 0]} rotation={[0, 0, -Math.PI / 4]} ink={0.08}>
          <cylinderGeometry args={[0.1, 0.1, 0.24, 12]} />
        </Prop>
        <group position={[0, 0, 0.25]} rotation={[0, 0, ang]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.07, 0.68, 0.03]} />
            <meshBasicMaterial color={KIT.red} toneMapped={false} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.27]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Glühbirne (Idee): `on` 0..1 = Leuchten + Strahlenkranz. Fuß (Sockel-Unterkante) bei y = 0.
 * Typisch über dem Kopf einer Figur: Toonie-Kopf oben ≈ y 4,1 → Birne bei y ≈ 4,6.
 */
export const LightBulb: React.FC<
  Placement & {
    readonly on?: number;
    readonly frame?: number;
  }
> = ({ position, rotation, scale = 1, on = 1, frame = 0 }) => {
  const glass = on > 0.5 ? "#FFE36E" : "#E8EEF2";
  const rays = 10;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[0.08, 0.2, 0.32].map((y) => (
        <Prop key={y} color={KIT.metalDark} position={[0, y, 0]} ink={0.05}>
          <cylinderGeometry args={[0.26, 0.26, 0.1, 18]} />
        </Prop>
      ))}
      <Prop color={KIT.metal} position={[0, 0.2, 0]} ink={0}>
        <cylinderGeometry args={[0.23, 0.2, 0.38, 18]} />
      </Prop>
      <Prop color={glass} position={[0, 0.55, 0]} ink={0.05} emissive={on * 0.5}>
        <cylinderGeometry args={[0.42, 0.26, 0.4, 24]} />
      </Prop>
      <Prop color={glass} position={[0, 1.1, 0]} ink={0.035} emissive={on * 0.5}>
        <sphereGeometry args={[0.62, 32, 24]} />
      </Prop>
      {on > 0.01 ? (
        <>
          <Glow position={[0, 1.1, 0]} radius={0.42} color="#FFE36E" intensity={on * 0.8} />
          {Array.from({ length: rays }, (_, i) => {
            const a = (i / rays) * Math.PI * 2 + Math.PI / 2;
            const pulse = 1 + Math.sin(frame * 0.4 + i) * 0.12;
            const r = 1.05 + 0.12 * pulse;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * r, 1.1 + Math.sin(a) * r, 0]}
                rotation={[0, 0, a - Math.PI / 2]}
                scale={on * pulse}
              >
                <capsuleGeometry args={[0.06, 0.28, 4, 8]} />
                <meshBasicMaterial color="#FFD23F" toneMapped={false} />
              </mesh>
            );
          })}
        </>
      ) : null}
    </group>
  );
};

/** Warnschild: gelbes Dreieck mit INK-Rand und Zeichen (Standard „!“) auf Pfosten. Fuß bei y = 0. */
export const WarningSign: React.FC<
  Placement & {
    readonly symbol?: string;
    readonly frame?: number;
    readonly wobble?: number;
    readonly post?: boolean;
    readonly color?: string;
  }
> = ({ position, rotation, scale = 1, symbol = "!", frame = 0, wobble = 0, post = true, color = KIT.accent }) => {
  const sway = Math.sin(frame * 0.35) * 0.1 * wobble;
  const cy = post ? 2.5 : 0.8;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {post ? (
        <Prop color={KIT.metalDark} position={[0, cy / 2 - 0.2, -0.12]} ink={0.04}>
          <cylinderGeometry args={[0.07, 0.07, cy - 0.4, 10]} />
        </Prop>
      ) : null}
      <group position={[0, cy, 0]} rotation={[0, 0, sway]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.1, 3]} />
          <meshBasicMaterial color={INK} />
        </mesh>
        <mesh position={[0, -0.02, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.06, 3]} />
          <Toon color={color} />
        </mesh>
        <TextLabel text={symbol} position={[0, -0.12, 0.12]} width={0.9} height={0.9} color={INK} size={0.9} />
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Tiefen-Kulisse + Schilder (referenz-analyse-4.md Technik 3/4)        */
/* ------------------------------------------------------------------ */

export type HallwayPalette = {
  readonly wall: string;
  readonly wainscot: string;
  readonly floor: string;
  readonly runner: string;
  readonly trim: string;
  readonly door: string;
  readonly vault: string;
  readonly lamp: string;
};

/** Warmer Flur (Standard) – Farbwelt je Ort über `palette` tauschen. */
export const HALLWAY_WARM: HallwayPalette = {
  wall: "#E9B48E",
  wainscot: "#9A3B30",
  floor: "#5E2622",
  runner: "#C8372E",
  trim: "#F6E3C4",
  door: "#7A4A2E",
  vault: "#E7A47E",
  lamp: "#FFD38A",
};

/**
 * Flur mit Fluchtpunkt: Gang entlang −z (Boden y = 0, Breite `width`, Wandhöhe `wall`, Tonnengewölbe
 * darüber), Türen abwechselnd links/rechts, Wandlampen zwischen den Türen, Läufer mit Goldkante,
 * Endtür mit Schild (`endLabel`). Kamera bei z ≈ 2…4, y ≈ 1,6–2,4, Blick nach −z → Fluchtpunkt.
 * Türen haben Schildchen (`labels[i]`, sonst leer). `glow` 0..1 = Lampen-Leuchtkraft (Licht + Schein).
 * `openDoor` = Index einer Tür, die (um `open` 0..1) aufschwingt – Portal-Ziel.
 * Kosten: ≈ 12 Meshes je Tür, 3 Punktlichter (ohne Schatten).
 */
export const Hallway: React.FC<
  Placement & {
    readonly length?: number;
    readonly width?: number;
    readonly wall?: number;
    readonly doors?: number;
    readonly labels?: readonly string[];
    readonly endLabel?: string;
    readonly palette?: HallwayPalette;
    readonly glow?: number;
    readonly openDoor?: number;
    readonly open?: number;
  }
> = ({
  position,
  rotation,
  scale = 1,
  length = 34,
  width = 4.4,
  wall = 3.2,
  doors = 8,
  labels = [],
  endLabel,
  palette = HALLWAY_WARM,
  glow = 1,
  openDoor,
  open = 0,
}) => {
  const hw = width / 2;
  const step = length / (doors / 2 + 0.6);
  const ribs = Math.floor(length / 3);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <hemisphereLight args={["#FFE2C2", palette.floor, 0.9]} />
      {[0.2, 0.5, 0.8].map((k) => (
        <pointLight
          key={k}
          position={[0, wall + 0.6, -length * k]}
          color={palette.lamp}
          intensity={18 * glow}
          distance={length * 0.45}
          decay={1.6}
        />
      ))}
      {/* Boden + Läufer + Goldkanten */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2 + 2]} receiveShadow>
        <planeGeometry args={[width, length + 4]} />
        <Toon color={palette.floor} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -length / 2 + 2]}>
        <planeGeometry args={[width * 0.5, length + 4]} />
        <Toon color={palette.runner} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * width * 0.23, 0.015, -length / 2 + 2]}>
          <planeGeometry args={[0.07, length + 4]} />
          <meshBasicMaterial color={KIT.gold} />
        </mesh>
      ))}
      {/* Wände: oben hell, unten Täfelung, INK-Leisten */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * hw, 0, -length / 2 + 2]} rotation={[0, -s * (Math.PI / 2), 0]}>
          <mesh position={[0, wall / 2, 0]}>
            <planeGeometry args={[length + 4, wall]} />
            <Toon color={palette.wall} />
          </mesh>
          <mesh position={[0, 0.55, 0.01]}>
            <planeGeometry args={[length + 4, 1.1]} />
            <Toon color={palette.wainscot} />
          </mesh>
          {[1.1, 0.06, wall].map((y) => (
            <mesh key={y} position={[0, y, 0.03]}>
              <boxGeometry args={[length + 4, 0.08, 0.05]} />
              <meshBasicMaterial color={y === 1.1 ? palette.trim : INK} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Tonnengewölbe + Bögen (Rippen) – die Rippen zeichnen die Fluchtlinien */}
      <mesh position={[0, wall, -length / 2 + 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[hw, hw, length + 4, 24, 1, true, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color={palette.vault} side={DoubleSide} />
      </mesh>
      {Array.from({ length: ribs }, (_, i) => (
        <mesh key={i} position={[0, wall, 1 - i * 3]}>
          <torusGeometry args={[hw - 0.06, 0.09, 6, 24, Math.PI]} />
          <Toon color={palette.trim} />
          <Ink f={0.04}>
            <torusGeometry args={[hw - 0.06, 0.09, 6, 24, Math.PI]} />
          </Ink>
        </mesh>
      ))}
      {/* Türen + Lampen */}
      {Array.from({ length: doors }, (_, i) => {
        const s = i % 2 ? 1 : -1;
        const z = -1.5 - Math.floor(i / 2) * step - (s > 0 ? step * 0.5 : 0);
        const swing = i === openDoor ? open : 0;
        return (
          <group key={i} position={[s * (hw - 0.02), 0, z]} rotation={[0, -s * (Math.PI / 2), 0]}>
            <HallDoor color={palette.door} trim={palette.trim} label={labels[i]} swing={swing} glowColor={palette.lamp} />
            {/* Wandlampe zwischen den Türen */}
            <group position={[step * 0.5, 2.35, 0.1]}>
              <mesh>
                <boxGeometry args={[0.18, 0.4, 0.08]} />
                <meshBasicMaterial color={INK} />
              </mesh>
              <mesh position={[0, 0.18, 0.18]}>
                <sphereGeometry args={[0.16, 14, 10]} />
                <meshBasicMaterial color={palette.lamp} toneMapped={false} />
              </mesh>
              {glow > 0 ? <Glow position={[0, 0.18, 0.18]} radius={0.26} color={palette.lamp} intensity={glow} /> : null}
            </group>
          </group>
        );
      })}
      {/* Endwand + Endtür (Ziel am Fluchtpunkt) */}
      <mesh position={[0, wall / 2 + 1, -length]}>
        <planeGeometry args={[width, wall + 2.4]} />
        <Toon color={palette.wainscot} />
      </mesh>
      <group position={[0, 0, -length + 0.02]} scale={1.15}>
        <HallDoor color={palette.door} trim={palette.trim} label={endLabel} swing={openDoor === -1 ? open : 0} glowColor={palette.lamp} />
      </group>
    </group>
  );
};

/** Tür mit Zarge, Klinke, Schildchen; `swing` 0..1 öffnet nach innen, dahinter leuchtet `glowColor`. */
const HallDoor: React.FC<{
  readonly color: string;
  readonly trim: string;
  readonly label?: string;
  readonly swing: number;
  readonly glowColor: string;
}> = ({ color, trim, label, swing, glowColor }) => (
  <group>
    {/* Zarge */}
    <Prop color={trim} position={[0, 1.3, 0.04]} ink={0.02}>
      <boxGeometry args={[1.4, 2.6, 0.08]} />
    </Prop>
    {/* Öffnung (leuchtet, wenn die Tür aufgeht) */}
    <mesh position={[0, 1.15, 0.085]}>
      <planeGeometry args={[1.08, 2.24]} />
      <meshBasicMaterial color={swing > 0 ? glowColor : INK} toneMapped={false} />
    </mesh>
    {/* Türblatt, Scharnier links */}
    <group position={[-0.54, 0, 0.1]} rotation={[0, -swing * 1.6, 0]}>
      <Prop color={color} position={[0.54, 1.15, 0]} ink={0.02}>
        <boxGeometry args={[1.06, 2.22, 0.06]} />
      </Prop>
      {[0.65, 1.6].map((y) => (
        <mesh key={y} position={[0.54, y, 0.035]}>
          <planeGeometry args={[0.7, y > 1 ? 0.8 : 0.6]} />
          <meshBasicMaterial color={INK} transparent opacity={0.18} />
        </mesh>
      ))}
      <mesh position={[0.92, 1.1, 0.06]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <Toon color={KIT.gold} />
      </mesh>
      {label ? (
        <TextLabel text={label} position={[0.54, 2.0, 0.045]} width={0.82} height={0.26} bg={KIT.gold} color={INK} border round={0.4} />
      ) : null}
    </group>
  </group>
);

/**
 * Verkehrsschild (Wegweiser): grünes Feld mit weißem Rand, Text und Pfeil, auf zwei Pfosten.
 * `lines` = 1–2 Zeilen, `arrow` = "up" | "left" | "right" | null. Fuß bei y = 0, Vorderseite +z.
 * Kontrast weiß auf `#1E7A46` = 5,6 : 1. `appear` 0..1 = Hereinploppen.
 */
export const RoadSign: React.FC<
  Placement & {
    readonly lines: readonly string[];
    readonly arrow?: "up" | "left" | "right" | null;
    readonly color?: string;
    readonly width?: number;
    readonly appear?: number;
    readonly posts?: number;
  }
> = ({ position, rotation, scale = 1, lines, arrow = "up", color = "#1E7A46", width = 3.4, appear = 1, posts = 2.2 }) => {
  const rowH = 0.62;
  const h = lines.length * rowH + 0.5;
  const a = popIn(appear);
  // Pfeil als Geometrie (die Kit-Schrift hat keine Pfeil-Zeichen); sitzt links neben der letzten Zeile
  const arrowRot = arrow === "up" ? 0 : arrow === "left" ? Math.PI / 2 : -Math.PI / 2;
  const textW = width - 0.4 - (arrow ? 0.7 : 0);
  return (
    <group position={position} rotation={rotation} scale={scale * a}>
      {[-1, 1].map((s) => (
        <Prop key={s} color={KIT.metalDark} position={[s * width * 0.3, (posts + h / 2) / 2, -0.1]} ink={0.03}>
          <cylinderGeometry args={[0.07, 0.07, posts + h / 2, 10]} />
        </Prop>
      ))}
      <group position={[0, posts + h / 2, 0]}>
        <mesh>
          <boxGeometry args={[width + 0.1, h + 0.1, 0.08]} />
          <meshBasicMaterial color={INK} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[width - 0.04, h - 0.04]} />
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[width - 0.16, h - 0.16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        {lines.map((t, i) => {
          const y = ((lines.length - 1) / 2) * rowH - i * rowH;
          const last = i === lines.length - 1 && arrow;
          return (
            <group key={i}>
              <TextLabel
                text={t}
                position={[last ? 0.35 : 0, y, 0.06]}
                width={last ? textW : width - 0.4}
                height={rowH}
                color="#FFFFFF"
                size={0.8}
              />
              {last ? (
                <group position={[-width / 2 + 0.55, y, 0.06]} rotation={[0, 0, arrowRot]}>
                  <mesh position={[0, 0.12, 0]}>
                    <coneGeometry args={[0.2, 0.24, 3]} />
                    <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
                  </mesh>
                  <mesh position={[0, -0.08, 0]}>
                    <planeGeometry args={[0.1, 0.24]} />
                    <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
                  </mesh>
                </group>
              ) : null}
            </group>
          );
        })}
      </group>
    </group>
  );
};

/**
 * Formular auf Klemmbrett: Titel, Zeilen (Text), Ankreuzfelder, Unterschriftslinie mit
 * `sign` 0..1 (Strich wird gezogen). Mitte = position, Vorderseite +z. Papier/Schrift 14,7 : 1.
 * `highlight` = Index einer Zeile in Akzentfarbe (Pointe, z. B. Kleingedrucktes).
 */
export const FormSheet: React.FC<
  Placement & {
    readonly title: string;
    readonly lines: readonly string[];
    readonly checks?: readonly boolean[];
    readonly highlight?: number;
    readonly sign?: number;
    readonly appear?: number;
  }
> = ({ position, rotation, scale = 1, title, lines, checks = [], highlight, sign = 0, appear = 1 }) => {
  const w = 2.6;
  const rowH = 0.36;
  const h = 1.2 + lines.length * (rowH + 0.08) + 0.7;
  const top = h / 2;
  const a = popIn(appear);
  return (
    <group position={position} rotation={rotation} scale={scale * a}>
      {/* Klemmbrett */}
      <Prop color={KIT.burlap} position={[0, -0.05, -0.06]} ink={0.02}>
        <boxGeometry args={[w + 0.3, h + 0.45, 0.08]} />
      </Prop>
      <Prop color={KIT.metal} position={[0, top + 0.12, 0.02]} ink={0.02}>
        <boxGeometry args={[1.0, 0.3, 0.1]} />
      </Prop>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={KIT.paper} toneMapped={false} />
      </mesh>
      <TextLabel text={title} position={[0, top - 0.45, 0.01]} width={w - 0.3} height={0.46} color={KIT.paperText} />
      <mesh position={[0, top - 0.78, 0.01]}>
        <planeGeometry args={[w - 0.3, 0.03]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      {lines.map((t, i) => {
        const y = top - 1.1 - i * (rowH + 0.08);
        const hasBox = checks[i] !== undefined;
        return (
          <group key={i} position={[0, y, 0.01]}>
            {hasBox ? (
              <>
                <mesh position={[-w / 2 + 0.35, 0, 0]}>
                  <planeGeometry args={[0.26, 0.26]} />
                  <meshBasicMaterial color={INK} />
                </mesh>
                <mesh position={[-w / 2 + 0.35, 0, 0.002]}>
                  <planeGeometry args={[0.19, 0.19]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
                {checks[i]
                  ? [
                      [-0.05, -0.02, 0.12, 0.8],
                      [0.06, 0.03, 0.24, -0.9],
                    ].map(([dx, dy, l, r]) => (
                      <mesh key={r} position={[-w / 2 + 0.35 + dx, dy, 0.004]} rotation={[0, 0, r]}>
                        <planeGeometry args={[l, 0.06]} />
                        <meshBasicMaterial color={KIT.green} />
                      </mesh>
                    ))
                  : null}
              </>
            ) : null}
            <TextLabel
              text={t}
              position={[hasBox ? 0.2 : 0, 0, 0.003]}
              width={w - (hasBox ? 0.8 : 0.3)}
              height={rowH}
              align="left"
              color={KIT.paperText}
              bg={i === highlight ? KIT.accent : null}
              round={0.3}
              size={0.62}
            />
          </group>
        );
      })}
      {/* Unterschrift */}
      <mesh position={[0.2, -top + 0.42, 0.01]}>
        <planeGeometry args={[1.8, 0.03]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      <TextLabel text="SIGN HERE" position={[-0.85, -top + 0.25, 0.01]} width={0.9} height={0.18} color={KIT.red} align="left" />
      {sign > 0 ? (
        <mesh position={[-0.65 + 0.85 * clamp01(sign), -top + 0.58, 0.012]} rotation={[0, 0, 0.12]}>
          <planeGeometry args={[1.7 * clamp01(sign), 0.05]} />
          <meshBasicMaterial color="#1E3A8A" />
        </mesh>
      ) : null}
    </group>
  );
};
