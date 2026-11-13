import React from "react";
import { useCurrentFrame } from "remotion";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import { Army, Circle, CoverScene, Crooks, Hook, Keys, Rehook } from "./jason1";
import { Couple, Flawed, Loop, Play, Trailer } from "./jason2";

/** Szenen-IDs = "id" in episodes/jason-gta6.json */
export const JASON_SCENES: Record<string, React.FC> = {
  hook: Hook,
  crooks: Crooks,
  army: Army,
  keys: Keys,
  rehook: Rehook,
  circle: Circle,
  trailer: Trailer,
  couple: Couple,
  flawed: Flawed,
  play: Play,
  loop: Loop,
};

/**
 * Übergang IN die Szene. `cut` wo die Szene selbst überleitet (Rückspul-Dreh ins Polaroid → crooks, Umblättern → circle);
 * Whip für Orts-/Zeitsprünge, Zoom auf die Karte und in die Spielerwahl, 2 Form-Wipes (Sonne in den Re-Hook, Raute ins Profil).
 */
export const JASON_TRANSITIONS: Record<string, TransitionSpec> = {
  crooks: { kind: "cut" },
  army: { kind: "whip", dir: 1 },
  keys: { kind: "zoom", color: "#F1E3BE" },
  rehook: { kind: "wipe", shape: "circle", color: "#FFD23F" },
  circle: { kind: "cut" },
  trailer: { kind: "whip", dir: 1 },
  couple: { kind: "zoom", color: "#7C5230" },
  flawed: { kind: "wipe", shape: "diamond", color: "#FF4FA3" },
  play: { kind: "zoom", color: "#140C22" },
  loop: { kind: "whip", dir: -1 },
};

/** Thumbnail-Motiv: geteiltes Polaroid bildfüllend (Armee-Hälfte | Keys-Hälfte). Titel liegt oben (overlays/Cover.tsx). */
export const JasonCoverArt: React.FC = () => {
  const frame = useCurrentFrame();
  return <CoverScene f={frame} />;
};

export const JASON_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: JASON_TRANSITIONS,
  hud2d: { counterId: "status", barId: "none", plate: true, hideBeat: "loopToCover", maxWidth: 860 },
  stickerStack: true,
  coverArt: JasonCoverArt,
};
