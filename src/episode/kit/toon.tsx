import React, { useMemo } from "react";
import {
  BackSide,
  CanvasTexture,
  DataTexture,
  NearestFilter,
  RedFormat,
  Texture,
} from "three";

export const INK = "#141414";

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
}) => (
  <meshToonMaterial
    color={color}
    map={map ?? null}
    gradientMap={toonGradient()}
    emissive={emissive ?? "#000000"}
    emissiveIntensity={emissiveIntensity}
    transparent={transparent}
    opacity={opacity ?? 1}
  />
);

/**
 * Dicke schwarze Kontur (Inverted Hull): dieselbe Geometrie, leicht vergrößert,
 * schwarz, nur Rückseite sichtbar. Als Kind des Meshes -> erbt dessen Transformation.
 * (drei <Outlines> hängt die Kontur per useLayoutEffect an und erscheint beim
 * Remotion-Rendering nicht – getestet.)
 */
export const Ink: React.FC<{
  readonly f?: number;
  readonly children: React.ReactNode;
}> = ({ f = 0.05, children }) => (
  <mesh scale={1 + f}>
    {children}
    <meshBasicMaterial color={INK} side={BackSide} />
  </mesh>
);

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
