import type { Caption } from "@remotion/captions";
import React from "react";
import { Easing } from "remotion";
import { AdditiveBlending, DoubleSide, Object3D } from "three";
import { GhostContext, Ink, RimContext, seeded, Toon } from "./toon";
import type { V3 } from "./camera";

/**
 * Bewegungs-Bausteine (themenunabhängig, docs/design-system.md §10).
 * Alles ist eine reine Funktion des Frames – keine useFrame/useEffect, kein Zustand.
 * Verzögerungen/Nachschwingen werden aus dem Wert bei `frame − k` berechnet.
 */

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = Easing.bezier(0.33, 0, 0.2, 1);

/* ------------------------------------------------------------------ */
/* Antizipation                                                        */
/* ------------------------------------------------------------------ */

/**
 * Antizipation: Wert holt vor `at` um `back` aus (in `pre` Frames) und schießt dann in `dur`
 * Frames auf `to` (mit leichtem Überschwinger `over`). Vor `at − pre`: `from`.
 * Beispiel Arm: `anticipate(frame, 30, 0.25, -0.4, 2.6)`.
 */
export const anticipate = (
  frame: number,
  at: number,
  from: number,
  back: number,
  to: number,
  { pre = 5, dur = 8, over = 0.08 }: { pre?: number; dur?: number; over?: number } = {},
) => {
  if (frame <= at - pre) return from;
  if (frame < at) {
    const s = (frame - (at - pre)) / pre;
    return from + (back - from) * Math.sin((s * Math.PI) / 2);
  }
  const u = clamp01((frame - at) / dur);
  // schneller Start, Überschwinger, Ruhe
  const e = 1 - Math.pow(1 - u, 3) + over * Math.sin(u * Math.PI) * (1 - u) * 4;
  return back + (to - back) * e;
};

/* ------------------------------------------------------------------ */
/* Follow-through / Overlap                                            */
/* ------------------------------------------------------------------ */

/**
 * Nachschwingen eines Anhängsels (Antenne, Krawatte, Haare, Schild …) auf eine Körperbewegung.
 * `signal(f)` = Körperwert zum Frame f (z. B. x-Position oder Neigung). Ergebnis = Auslenkung
 * entgegen der Bewegung, die nach dem Stopp gedämpft nachschwingt (Impulsantwort eines gedämpften
 * Pendels über die letzten `window` Frames – deterministisch, nur aus `frame`).
 */
export const followThrough = (
  signal: (f: number) => number,
  frame: number,
  { gain = 1, damp = 0.16, freq = 0.42, window = 30 }: {
    gain?: number;
    damp?: number;
    freq?: number;
    window?: number;
  } = {},
) => {
  let out = 0;
  for (let k = 1; k <= window; k++) {
    const v = signal(frame - k + 1) - signal(frame - k);
    out += v * Math.exp(-damp * k) * Math.sin(freq * k);
  }
  return -out * gain;
};

/* ------------------------------------------------------------------ */
/* Squash & Stretch                                                    */
/* ------------------------------------------------------------------ */

/** Volumen-erhaltende Skalierung: y·s, x/z·1/√s. */
export const squashScale = (s: number): V3 => {
  const w = 1 / Math.sqrt(Math.max(0.05, s));
  return [w, s, w];
};

/**
 * Sprung mit Antizipation: 4 Frames Ducken (squash 0.78), Absprung gestreckt (1.18),
 * Flugbogen über `air` Frames, Landung gestaucht (0.74) und Nachfedern.
 * Ergebnis: Höhe `y` und `squash` (für `<Toonie squash>`).
 */
export const hop = (frame: number, at: number, height = 1.4, air = 14) => {
  const f = frame - at;
  if (f < -4 || f > air + 10) return { y: 0, squash: 1 };
  if (f < 0) return { y: 0, squash: 1 - 0.22 * Math.sin(((f + 4) / 4) * (Math.PI / 2)) };
  if (f <= air) {
    const u = f / air;
    const y = 4 * height * u * (1 - u);
    // gestreckt beim Steigen/Fallen, rund oben
    const squash = 1 + 0.18 * Math.abs(1 - 2 * u);
    return { y, squash };
  }
  const g = f - air; // Landung
  return { y: 0, squash: 1 - 0.26 * Math.exp(-g * 0.35) * Math.cos(g * 0.7) };
};

/* ------------------------------------------------------------------ */
/* Blinzeln und Mund                                                   */
/* ------------------------------------------------------------------ */

const blinkCache = new Map<number, number[]>();
/** Blinzel-Starts einer Figur: Abstand 2–5 s, 15 % Doppelblinzeln (seeded, gleich in Vorschau/Render). */
const blinkStarts = (seed: number) => {
  let list = blinkCache.get(seed);
  if (!list) {
    const r = seeded(seed * 7919 + 13);
    list = [];
    let t = Math.floor(10 + r() * 60);
    while (t < 30 * 60 * 10) {
      list.push(t);
      if (r() < 0.15) list.push(t + 6);
      t += Math.floor(60 + r() * 90);
    }
    blinkCache.set(seed, list);
  }
  return list;
};

/** true, wenn Figur `seed` im Frame blinzelt (3 Frames ≈ 100 ms). */
export const blinkAt = (frame: number, seed: number) =>
  blinkStarts(seed).some((s) => frame >= s && frame < s + 3);

const syllables = (w: string) =>
  Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) ?? []).length);

/**
 * Mundöffnung 0..1 aus Wort-Zeiten (`captions.json`): im Wort öffnet/schließt sich der Mund einmal
 * je Silbe (Vokalgruppen gezählt), zwischen Wörtern zu. `ms` = Zeit im Video.
 * Keine echte Lautanalyse – nur Wort-Rhythmus.
 */
export const talkFromCaptions = (captions: readonly Caption[], ms: number) => {
  const c = captions.find((w) => ms >= w.startMs && ms < w.endMs);
  if (!c) return 0;
  const u = (ms - c.startMs) / Math.max(1, c.endMs - c.startMs);
  const n = syllables(c.text);
  return 0.15 + 0.85 * Math.pow(Math.abs(Math.sin(Math.PI * n * u)), 0.7);
};

/* ------------------------------------------------------------------ */
/* Kamera-Ziel für Match Cuts                                          */
/* ------------------------------------------------------------------ */

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const ASPECT = 1080 / 1920;

/**
 * Kamera so stellen, dass Punkt `p` an Bildstelle (`xf`, `yf`, Anteile 0..1 von links/oben) liegt
 * und das Bild dort `H` Einheiten hoch ist. `dir` = Richtung von p zur Kamera.
 * Gleiche Idee wie `aim()` in scenes/romeSets.tsx, aber mit freiem fov. Für Match Cuts:
 * letzte Form in A und erste Form in B mit gleichem xf/yf (und ähnlichem H) anvisieren.
 */
export const aimAt = (
  p: V3,
  H: number,
  { yf = 0.5, xf = 0.5, dir = [0, 0.12, 1] as V3, fov = 40 } = {},
) => {
  const tan = Math.tan(((fov / 2) * Math.PI) / 180);
  const d = H / (2 * tan);
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
  return { pos, look, fov };
};

/** Bildstelle [xf, yf] (0..1) eines Weltpunkts für Kamera pos→look – Prüfung „sitzt der Match Cut?“. */
export const screenOf = (p: V3, pos: V3, look: V3, fov = 40): [number, number] => {
  const fwd = norm(sub(look, pos));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const v = sub(p, pos);
  const z = dot(v, fwd);
  const tan = Math.tan(((fov / 2) * Math.PI) / 180);
  const y = dot(v, up) / (z * tan);
  const x = dot(v, right) / (z * tan * ASPECT);
  return [0.5 + x / 2, 0.5 - y / 2];
};

/* ------------------------------------------------------------------ */
/* Parallax-Vordergrund                                                */
/* ------------------------------------------------------------------ */

export type ForegroundItem = {
  /** Bildstelle bei Szenenbeginn (0..1 von links/oben) */
  readonly xf: number;
  readonly yf: number;
  /** Abstand vor der Kamera (klein = nah = schnelle Parallaxe), z. B. 2–5 */
  readonly depth: number;
  readonly size?: number;
  readonly shape?: "leaf" | "rock" | "post" | "blob";
  readonly color?: string;
  readonly rot?: number;
};

/**
 * Multiplane-Vordergrund: Elemente werden einmal im Kamerabild von Frame 0 (`pos`→`look`)
 * platziert und bleiben dann in der Welt stehen. Fährt die Kamera seitlich (Truck/Orbit),
 * ziehen die nahen Ebenen schneller vorbei als der Hintergrund → Tiefe.
 * Dunkle Farbe = liest sich als „unscharf nah“.
 * Untertitel-Schutz: Elemente (außer `post`), deren Bildhöhe das Band `captionBand` (Standard
 * y 0,62–0,86 = Untertitel bei paddingBottom 400 + Rand) schneidet, werden aus dem Band geschoben –
 * nach unten (nur die Oberkante ragt ins Bild) bzw. nach oben. `captionBand={null}` schaltet das ab.
 */
export const Foreground: React.FC<{
  readonly pos: V3;
  readonly look: V3;
  readonly fov?: number;
  readonly items: readonly ForegroundItem[];
  readonly captionBand?: readonly [number, number] | null;
}> = ({ pos, look, fov = 40, items, captionBand = [0.62, 0.86] }) => {
  const fwd = norm(sub(look, pos));
  const right = norm(cross(fwd, [0, 1, 0]));
  const up = cross(right, fwd);
  const tan = Math.tan(((fov / 2) * Math.PI) / 180);
  return (
    <group>
      {items.map((it, i) => {
        const h = 2 * it.depth * tan;
        const w = h * ASPECT;
        const dx = (it.xf - 0.5) * w;
        const s0 = it.size ?? 0.6;
        const shape0 = it.shape ?? "blob";
        // halbe Bildhöhe des Elements (Anteil), +15 % für die Perspektive naher Körper
        const half = (s0 * (shape0 === "rock" ? 0.8 : shape0 === "leaf" ? 1.3 : 1) * 1.15) / h;
        let yf = it.yf;
        if (captionBand && shape0 !== "post" && yf + half > captionBand[0] && yf - half < captionBand[1]) {
          yf = yf >= (captionBand[0] + captionBand[1]) / 2 ? captionBand[1] + half : captionBand[0] - half;
        }
        const dy = (0.5 - yf) * h;
        const p: V3 = [
          pos[0] + fwd[0] * it.depth + right[0] * dx + up[0] * dy,
          pos[1] + fwd[1] * it.depth + right[1] * dx + up[1] * dy,
          pos[2] + fwd[2] * it.depth + right[2] * dx + up[2] * dy,
        ];
        const s = it.size ?? 0.6;
        const c = it.color ?? "#1F1B2C";
        const shape = it.shape ?? "blob";
        return (
          <group key={i} position={p} rotation={[0, 0, it.rot ?? 0]} scale={s}>
            {shape === "post" ? (
              <mesh>
                <cylinderGeometry args={[0.35, 0.42, 6, 12]} />
                <Toon color={c} />
                <Ink f={0.06}>
                  <cylinderGeometry args={[0.35, 0.42, 6, 12]} />
                </Ink>
              </mesh>
            ) : shape === "leaf" ? (
              [0, 1, 2].map((k) => (
                <mesh
                  key={k}
                  position={[(k - 1) * 0.55, Math.abs(k - 1) * -0.3, 0]}
                  rotation={[0, 0, (k - 1) * 0.7]}
                  scale={[0.45, 1.2, 0.12]}
                >
                  <sphereGeometry args={[1, 12, 10]} />
                  <Toon color={c} />
                  <Ink f={0.08}>
                    <sphereGeometry args={[1, 12, 10]} />
                  </Ink>
                </mesh>
              ))
            ) : (
              <mesh scale={shape === "rock" ? [1.2, 0.8, 1] : [1, 1, 1]}>
                {shape === "rock" ? (
                  <dodecahedronGeometry args={[1, 0]} />
                ) : (
                  <sphereGeometry args={[1, 16, 12]} />
                )}
                <Toon color={c} />
                <Ink f={0.06}>
                  {shape === "rock" ? (
                    <dodecahedronGeometry args={[1, 0]} />
                  ) : (
                    <sphereGeometry args={[1, 16, 12]} />
                  )}
                </Ink>
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Licht: Rim-Light, Dunst                                             */
/* ------------------------------------------------------------------ */

/**
 * Gegenlicht (Rim-Light) als harte helle Kante an der Silhouette (Fresnel im Toon-Material) für alle
 * `children` – trennt Figur vom Hintergrund, ohne sie insgesamt aufzuhellen. `side` = Bildrichtung der
 * Lichtquelle ([-0.6, 0.8] = oben links), `width` 0,3–0,45 (Kantenbreite, Standard 0,4), `strength` 0..1.
 * Ohne `children` nur das alte Richtungslicht (`light`, hellt alles auf – Befund 09.11.2026).
 * `light` > 0 ergänzt ein schwaches Richtungslicht aus `from`.
 */
export const RimLight: React.FC<{
  readonly from?: V3;
  readonly color?: string;
  readonly intensity?: number;
  readonly side?: [number, number];
  readonly width?: number;
  readonly strength?: number;
  readonly light?: number;
  readonly children?: React.ReactNode;
}> = ({ from = [-3, 5, -6], color = "#CFE6FF", intensity = 1.4, side = [-0.6, 0.8], width = 0.4, strength = 1, light, children }) => {
  const li = light ?? (children ? 0 : intensity);
  return (
    <>
      {li > 0 ? <directionalLight position={from} color={color} intensity={li} /> : null}
      {children ? (
        <RimContext.Provider value={{ color, strength, width, side }}>{children}</RimContext.Provider>
      ) : null}
    </>
  );
};

/**
 * Atmosphären-Dunst: `scene.fog` in Hintergrundfarbe. Ab `near` beginnt der Dunst, ab `far`
 * ist alles in `color` aufgelöst (Weltabstand zur Kamera). Toon- und Kontur-Material reagieren darauf.
 */
export const SceneFog: React.FC<{
  readonly color: string;
  readonly near?: number;
  readonly far?: number;
}> = ({ color, near = 14, far = 60 }) => <fog attach="fog" args={[color, near, far]} />;

/* ------------------------------------------------------------------ */
/* Color Script (Farbe je Akt)                                         */
/* ------------------------------------------------------------------ */

export type GradeSpec = {
  /** zusätzliche CSS-Filter auf der 3D-Leinwand (nach `saturate(1.15) contrast(1.05)`) */
  readonly filter: string;
  /** Farbschleier über der Leinwand (unter Untertiteln/Overlays) */
  readonly tint: string;
  readonly tintOpacity: number;
  readonly blend: React.CSSProperties["mixBlendMode"];
};

/**
 * Akt-Stimmungen. Reihenfolge eines typischen Bogens: `hook` → `rise` → `glory` → `tension`
 * → `decline` → `fall` → `aftermath`. `neutral` = keine Änderung.
 */
export const COLOR_SCRIPT = {
  neutral: { filter: "", tint: "#000000", tintOpacity: 0, blend: "normal" },
  hook: { filter: "saturate(1.12) brightness(1.03)", tint: "#FFD27A", tintOpacity: 0.1, blend: "soft-light" },
  rise: { filter: "saturate(1.05)", tint: "#9FD8FF", tintOpacity: 0.12, blend: "soft-light" },
  glory: { filter: "saturate(1.18) brightness(1.04)", tint: "#FFB547", tintOpacity: 0.18, blend: "soft-light" },
  tension: { filter: "saturate(0.95) contrast(1.06)", tint: "#6B4CFF", tintOpacity: 0.14, blend: "soft-light" },
  decline: { filter: "saturate(0.72) sepia(0.18)", tint: "#B07A4A", tintOpacity: 0.16, blend: "multiply" },
  fall: { filter: "saturate(0.8) brightness(0.88) contrast(1.08)", tint: "#8E1B2A", tintOpacity: 0.2, blend: "multiply" },
  aftermath: { filter: "saturate(0.55) brightness(0.95)", tint: "#4A6A8A", tintOpacity: 0.18, blend: "multiply" },
} as const satisfies Record<string, GradeSpec>;

export type Act = keyof typeof COLOR_SCRIPT;

export const gradeOf = (g: Act | GradeSpec | undefined): GradeSpec =>
  g === undefined ? COLOR_SCRIPT.neutral : typeof g === "string" ? COLOR_SCRIPT[g] : g;

/** Farbschleier eines Akts als DOM-Ebene (über der Leinwand, unter Overlays). */
export const GradeTint: React.FC<{ readonly grade: Act | GradeSpec | undefined }> = ({ grade }) => {
  const g = gradeOf(grade);
  if (!g.tintOpacity) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: g.tint,
        opacity: g.tintOpacity,
        mixBlendMode: g.blend,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * Ort-Licht (referenz-analyse-4.md Technik 7): weiches Leuchten + farbige Vignette als DOM-Ebene
 * über der Leinwand (unter Untertiteln). Kostet zwei CSS-Verläufe, kein 3D. Farbwelt je Ort über
 * `PLACE_GLOW`-Preset oder eigene Werte; `flicker` 0..1 = Kerzen-/Lampenflackern (deterministisch).
 */
export type PlaceGlowSpec = {
  /** Farbe des Leuchtens (screen-Mischung) */
  readonly color: string;
  /** Mittelpunkt in Bildanteilen */
  readonly at: readonly [number, number];
  /** Radius in Bildbreiten */
  readonly radius: number;
  readonly strength: number;
  /** Vignettenfarbe (multiply-Mischung, dunkle Ränder in der Farbwelt des Orts) */
  readonly vignette: string;
  readonly vignetteStrength: number;
};
export const PLACE_GLOW = {
  /** warmer Innenraum (Flur, Wohnzimmer, Kerzenlicht) */
  warm: { color: "#FFB866", at: [0.5, 0.36], radius: 0.75, strength: 0.32, vignette: "#3A0E0A", vignetteStrength: 0.6 },
  /** Körperinneres / Gefahr (rot) */
  body: { color: "#FF6A5A", at: [0.5, 0.4], radius: 0.8, strength: 0.28, vignette: "#4A0610", vignetteStrength: 0.65 },
  /** Labor / Technik (kühl) */
  lab: { color: "#9FE3FF", at: [0.5, 0.3], radius: 0.8, strength: 0.22, vignette: "#0B1A33", vignetteStrength: 0.5 },
  /** Nacht / Weltraum (violett) */
  night: { color: "#B39CFF", at: [0.5, 0.32], radius: 0.7, strength: 0.22, vignette: "#0A0620", vignetteStrength: 0.7 },
  /** Tageslicht draußen (sanft) */
  day: { color: "#FFF1C7", at: [0.62, 0.18], radius: 0.9, strength: 0.18, vignette: "#24304A", vignetteStrength: 0.3 },
} as const satisfies Record<string, PlaceGlowSpec>;
export type Place = keyof typeof PLACE_GLOW;

export const PlaceGlow: React.FC<{
  readonly place?: Place | PlaceGlowSpec;
  readonly frame?: number;
  readonly flicker?: number;
  /** 0..1 Ein-/Ausblenden (z. B. beim Ortswechsel) */
  readonly amount?: number;
  readonly width?: number;
  readonly height?: number;
}> = ({ place = "warm", frame = 0, flicker = 0, amount = 1, width = 1080, height = 1920 }) => {
  const g = typeof place === "string" ? PLACE_GLOW[place] : place;
  if (amount <= 0.01) return null;
  const fl = flicker ? 1 + flicker * (0.06 * Math.sin(frame * 0.9) + 0.04 * Math.sin(frame * 2.3 + 1.1)) : 1;
  const cx = g.at[0] * width;
  const cy = g.at[1] * height;
  const r = g.radius * width;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: g.strength * amount * fl,
          background: `radial-gradient(circle at ${cx}px ${cy}px, ${g.color} 0px, rgba(0,0,0,0) ${r.toFixed(0)}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "multiply",
          opacity: g.vignetteStrength * amount,
          background: `radial-gradient(ellipse 75% 62% at 50% 46%, rgba(255,255,255,0) 55%, ${g.vignette} 100%)`,
        }}
      />
    </>
  );
};

export { smooth as SMOOTH_EASE };

/* ------------------------------------------------------------------ */
/* Zusatz aus referenz-analyse-3.md „Übertragbar“ 1–4                  */
/* ------------------------------------------------------------------ */

/**
 * Bewegungs-Echo / Nachbilder: zeichnet `render(frame)` normal und dahinter `count` flache,
 * halbtransparente Kopien bei `frame − k·step` (ohne Kontur und Gesicht, GhostContext).
 * `strength` 0..1 blendet die Echos ein/aus (z. B. nur während eines Sprints).
 * Kosten: jede Kopie = ein weiterer Figuren-Satz Meshes (count 3 ⇒ ×4 Meshes der Figur).
 */
export const Echo: React.FC<{
  readonly frame: number;
  readonly render: (f: number) => React.ReactNode;
  readonly count?: number;
  readonly step?: number;
  readonly color?: string;
  readonly strength?: number;
}> = ({ frame, render, count = 3, step = 2, color = "#9FE3FF", strength = 1 }) => (
  <>
    {strength > 0.02
      ? Array.from({ length: count }, (_, i) => count - i).map((k) => (
          <GhostContext.Provider
            key={k}
            value={{ color, opacity: strength * 0.42 * (1 - (k - 1) / count) }}
          >
            {render(frame - k * step)}
          </GhostContext.Provider>
        ))
      : null}
    {render(frame)}
  </>
);

/**
 * Seitliche Tracking-Fahrt (Truck) parallel zum Motiv: Props für `<Shot>` + Kamera bei Frame 0
 * (für `<Foreground pos look>`). `travel` = seitliche Strecke in Einheiten (+ = nach rechts).
 */
export const trackShot = (
  subject: V3,
  H: number,
  travel: number,
  { yf = 0.55, xf = 0.5, fov = 40, dir = [0, 0.1, 1] as V3 } = {},
) => {
  const a = aimAt(subject, H, { yf, xf, dir, fov });
  const shift = (v: V3, dx: number): V3 => [v[0] + dx, v[1], v[2]];
  return {
    shot: {
      from: shift(a.pos, -travel / 2),
      to: shift(a.pos, travel / 2),
      look: shift(a.look, -travel / 2),
      lookTo: shift(a.look, travel / 2),
      fov,
      ease: "linear" as const,
    },
    start: { pos: shift(a.pos, -travel / 2), look: shift(a.look, -travel / 2), fov },
  };
};

/**
 * Spotlight-Bühne für „Fokus“-Momente: fast schwarzer Raum, heller Bodenkreis, sichtbarer
 * Lichtkegel (additive Fläche) und echtes Spot-Licht von oben auf `center`.
 * `on` 0..1 = Licht geht an (Kegel + Kreis blenden auf). Hintergrund: `color` (z. B. Szenen-Dunkel).
 */
export const SpotlightStage: React.FC<{
  readonly center?: V3;
  readonly on?: number;
  readonly color?: string;
  readonly beam?: string;
  readonly radius?: number;
  readonly height?: number;
}> = ({
  center = [0, 0, 0],
  on = 1,
  color = "#07070D",
  beam = "#FFF2C4",
  radius = 2.4,
  height = 11,
}) => {
  const target = React.useMemo(() => new Object3D(), []);
  return (
    <group>
      <color attach="background" args={[color]} />
      <hemisphereLight args={["#3A3A55", "#000000", 0.25]} />
      <primitive object={target} position={center} />
      <spotLight
        position={[center[0], center[1] + height, center[2] + 1.5]}
        target={target}
        angle={Math.atan((radius * 1.1) / height)}
        penumbra={0.35}
        intensity={260 * on}
        decay={2}
        distance={0}
        color={beam}
      />
      {/* Boden: dunkel, darauf heller Lichtkreis */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center[0], center[1] - 0.005, center[2]]}>
        <circleGeometry args={[40, 48]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center[0], center[1] + 0.004, center[2]]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color={beam} transparent opacity={0.55 * on} />
      </mesh>
      {/* sichtbarer Kegel */}
      <mesh position={[center[0], center[1] + height / 2, center[2]]}>
        <coneGeometry args={[radius, height, 40, 1, true]} />
        <meshBasicMaterial
          color={beam}
          transparent
          opacity={0.1 * on}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
};

/** Augen-Pop für die Reaktions-Großaufnahme: 1 → `peak` in 3 Frames mit Überschwinger, dann `hold`. */
export const eyePopAt = (frame: number, at: number, peak = 2, hold = 1.6) => {
  const f = frame - at;
  if (f < 0) return 1;
  if (f < 3) return 1 + (peak - 1) * (f / 3);
  return hold + (peak - hold) * Math.exp(-(f - 3) * 0.35) * Math.cos((f - 3) * 0.9);
};
