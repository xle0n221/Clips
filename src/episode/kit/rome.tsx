/**
 * Bau-Kit „Antikes Rom“: Kostüme für Toonie, Kulissen und Requisiten.
 * Alles deterministisch (nur aus Props/`frame`), Cel-Shading über <Toon>, Kontur über <Ink>.
 * Farben und Regeln: docs/design-system.md.
 */
import React, { useMemo } from "react";
import {
  BackSide,
  BufferGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Path,
  Shape,
  ShapeGeometry,
} from "three";
import { Glow } from "./fx";
import { INK, Ink, Toon, seeded, useCanvasTexture } from "./toon";
import { Toonie, ToonieProps } from "./Toonie";

type P3 = [number, number, number];

/** Rom-Palette (Begründung in docs/design-system.md). */
export const ROME = {
  skyTop: "#4AA8E0",
  skyBottom: "#CDEBF7",
  sun: "#FFF2C2",
  sandstone: "#E7B978",
  sandLight: "#F5D9A6",
  ochre: "#C88A45",
  ochreDark: "#9A6233",
  shadowWarm: "#7A4A2A",
  ground: "#E9CC93",
  groundSpots: "#D9B276",
  marble: "#F6F0E4",
  marbleShade: "#DCD2BF",
  terracotta: "#C4562F",
  roof: "#B4472B",
  legionRed: "#C62828",
  crest: "#E53935",
  purple: "#6E2C8C",
  purpleDark: "#4A1A63",
  gold: "#F4B731",
  goldDark: "#B9851C",
  iron: "#C5D0D8",
  ironDark: "#8796A1",
  bronze: "#C8873A",
  leather: "#8A5A2E",
  wood: "#9C6B3C",
  parchment: "#F2E2B6",
  fur: "#7B5235",
  furLight: "#B08657",
  hair: "#D9A54A",
  gothWool: "#4F6E5A",
  gothCheck: "#2F4A3A",
  cypress: "#2F5D3A",
  pine: "#5A8A3C",
  hill: "#A9BF72",
} as const;

/* ------------------------------------------------------------------ */
/* Hilfen                                                               */
/* ------------------------------------------------------------------ */

/** Mesh mit fertiger Geometrie (geteilt), Toon-Material und Kontur. */
const G: React.FC<{
  readonly geo: BufferGeometry;
  readonly color: string;
  readonly ink?: number;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number | P3;
  readonly side?: typeof DoubleSide;
  readonly map?: import("three").Texture | null;
}> = ({ geo, color, ink = 0.04, position, rotation, scale, side, map }) => (
  <mesh
    geometry={geo}
    position={position}
    rotation={rotation}
    scale={scale}
    castShadow
    receiveShadow
  >
    <meshToonMaterialLike color={color} side={side} map={map} />
    {ink > 0 ? (
      <mesh geometry={geo} scale={1 + ink}>
        <meshBasicMaterial color={INK} side={BackSide} />
      </mesh>
    ) : null}
  </mesh>
);

/** Toon-Material mit optional doppelseitiger Darstellung (für Umhänge, Wände). */
const meshToonMaterialLike: React.FC<{
  readonly color: string;
  readonly side?: typeof DoubleSide;
  readonly map?: import("three").Texture | null;
}> = () => null;
// (Platzhalter, wird unten durch echte Komponente ersetzt – siehe ToonS)

/** Einfaches Teil: Geometrie als Kind, Toon + Kontur. */
const Part: React.FC<{
  readonly children: React.ReactNode;
  readonly color: string;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number | P3;
  readonly ink?: number;
  readonly double?: boolean;
  readonly map?: import("three").Texture | null;
  readonly emissive?: number;
}> = ({
  children,
  color,
  position,
  rotation,
  scale,
  ink = 0.04,
  double,
  map,
  emissive = 0,
}) => (
  <mesh position={position} rotation={rotation} scale={scale} castShadow>
    {children}
    <ToonS
      color={color}
      double={double}
      map={map}
      emissive={emissive}
    />
    {ink > 0 ? <Ink f={ink}>{children}</Ink> : null}
  </mesh>
);
