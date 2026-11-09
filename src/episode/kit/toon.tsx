import React, { createContext, useContext, useMemo } from "react";
import {
  BackSide,
  CanvasTexture,
  Color,
  DataTexture,
  NearestFilter,
  RedFormat,
  Texture,
} from "three";

export const INK = "#141414";

/**
 * Nachbild-Modus (Bewegungs-Echo, kit/motion.tsx `Echo`): innerhalb dieses Kontexts zeichnet `Toon`
 * eine flache, halbtransparente Fläche in `color`, `Ink` und Gesichts-Details entfallen.
 * Standard `null` = normales Zeichnen (unverändert).
 */
export const GhostContext = createContext<{ color: string; opacity: number } | null>(null);
export const useGhost = () => useContext(GhostContext);

/**
 * Rim-Light-Kante (kit/motion.tsx `RimLight`): innerhalb dieses Kontexts bekommt `Toon` eine harte,
 * helle Fresnel-Kante (Silhouetten-Rand), nur auf der Seite `side` (Bildrichtung x/y, z. B. [-0.6, 0.8]
 * = oben links). Standard `null` = Material unverändert (Rom/Sonnensystem pixelgleich).
 */
export type Rim = { color: string; strength: number; width: number; side: [number, number] };
export const RimContext = createContext<Rim | null>(null);

const rimShader = (rim: Rim) => {
  const c = new Color(rim.color);
  const len = Math.hypot(rim.side[0], rim.side[1]) || 1;
  const f = (v: number) => v.toFixed(4);
  // Fresnel 0..1 am Rand; harte Stufe (Toon) bei 1 − width; Maske zur Lichtseite
  return `
  {
    vec3 rimN = normalize(normal);
    float rimF = 1.0 - clamp(dot(rimN, normalize(vViewPosition)), 0.0, 1.0);
    float rimEdge = smoothstep(${f(1 - rim.width)}, ${f(1 - rim.width + 0.04)}, rimF);
    float rimSide = smoothstep(-0.1, 0.35, dot(normalize(rimN.xy + 1e-4), vec2(${f(rim.side[0] / len)}, ${f(rim.side[1] / len)})));
    outgoingLight = mix(outgoingLight, vec3(${f(c.r)}, ${f(c.g)}, ${f(c.b)}), rimEdge * rimSide * ${f(rim.strength)});
  }
  #include <opaque_fragment>`;
};

// 3-stufiger Verlauf -> harte Cartoon-Schattierung (Cel-Shading).
let gradient: DataTexture | null = null;
export const toonGradient = () => {
  if (!gradient) {
    gradient = new DataTexture(new Uint8Array([90, 175, 255]), 3, 1, RedFormat);
    gradient.minFilter = NearestFilter;
    gradient.magFilter = NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
};

export const Toon: React.FC<{
  readonly color: string;
  readonly map?: Texture | null;
  readonly emissive?: string;
  readonly emissiveIntensity?: number;
  readonly transparent?: boolean;
  readonly opacity?: number;
}> = ({
  color,
  map,
  emissive,
  emissiveIntensity = 0,
  transparent,
  opacity,
}) => {
  const ghost = useGhost();
  const rim = useContext(RimContext);
  if (ghost)
    return (
      <meshBasicMaterial
        color={ghost.color}
        transparent
        opacity={ghost.opacity}
        depthWrite={false}
      />
    );
  return (
  <meshToonMaterial
    key={rim ? "rim" : "plain"}
    color={color}
    map={map ?? null}
    gradientMap={toonGradient()}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={emissiveIntensity}
    transparent={transparent}
    opacity={opacity ?? 1}
    {...(rim
      ? {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onBeforeCompile: (sh: any) => {
            sh.fragmentShader = sh.fragmentShader.replace("#include <opaque_fragment>", rimShader(rim));
          },
          customProgramCacheKey: () => `rim:${rim.color}:${rim.strength}:${rim.width}:${rim.side.join(",")}`,
        }
      : {})}
  />
  );
};

/**
 * Dicke schwarze Kontur (Inverted Hull): dieselbe Geometrie, leicht vergrößert,
 * schwarz, nur Rückseite sichtbar. Als Kind des Meshes -> erbt dessen Transformation.
 * (drei <Outlines> hängt die Kontur per useLayoutEffect an und erscheint beim
 * Remotion-Rendering nicht – getestet.)
 */
export const Ink: React.FC<{
  readonly f?: number;
  readonly children: React.ReactNode;
}> = ({ f = 0.05, children }) => {
  const ghost = useGhost();
  if (ghost) return null;
  return (
    <mesh scale={1 + f}>
      {children}
      <meshBasicMaterial color={INK} side={BackSide} />
    </mesh>
  );
};

/** Deterministischer Zufall (gleiche Werte in Vorschau und Render). */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Prozedurale Canvas-Textur, einmal pro Schlüssel erzeugt. */
export const useCanvasTexture = (
  key: string,
  size: [number, number],
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) =>
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D-Kontext fehlt");
    draw(ctx, size[0], size[1]);
    const tex = new CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
