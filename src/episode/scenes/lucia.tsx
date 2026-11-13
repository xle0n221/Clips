import React from "react";
import { useCurrentFrame } from "remotion";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import { CoverScene, Dad, Family, Hook, Out, Rehook } from "./lucia1";
import { First, Flawed, Heist, Jason, Loop, Play } from "./lucia2";

/** Szenen-IDs = "id" in episodes/lucia-gta6.json */
export const LUCIA_SCENES: Record<string, React.FC> = {
  hook: Hook,
  dad: Dad,
  family: Family,
  out: Out,
  rehook: Rehook,
  jason: Jason,
  heist: Heist,
  first: First,
  flawed: Flawed,
  play: Play,
  loop: Loop,
};

/**
 * Übergang IN die Szene. `cut` wo die Szene selbst überleitet (Portal ins Akten-Foto → dad, Umblättern → jason);
 * Whip für Orts-/Zeitsprünge, dunkler Zoom in die Zelle und in die Spielerwahl, 2 Form-Wipes (Gold-Stern in die
 * Serien-Premiere, Raute ins Profil).
 */
export const LUCIA_TRANSITIONS: Record<string, TransitionSpec> = {
  dad: { kind: "cut" },
  family: { kind: "whip", dir: 1 },
  out: { kind: "zoom", color: "#14121C" },
  rehook: { kind: "whip", dir: 1 },
  jason: { kind: "cut" },
  heist: { kind: "whip", dir: 1 },
  first: { kind: "wipe", shape: "star", color: "#F2C14E" },
  flawed: { kind: "wipe", shape: "diamond", color: "#2EC4B6" },
  play: { kind: "zoom", color: "#140C22" },
  loop: { kind: "whip", dir: -1 },
};

/** Thumbnail-Motiv: Akten-Foto bildfüllend (Lucia hinter Gittern im Abendrot). Titel liegt oben (overlays/Cover.tsx). */
export const LuciaCoverArt: React.FC = () => {
  const frame = useCurrentFrame();
  return <CoverScene f={frame} />;
};

export const LUCIA_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: LUCIA_TRANSITIONS,
  hud2d: { counterId: "status", barId: "none" },
  stickerStack: true,
  coverArt: LuciaCoverArt,
};
