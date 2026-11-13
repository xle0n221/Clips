import React from "react";
import { useCurrentFrame } from "remotion";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import { Alleged, Confess, Crash, Fold, Hook } from "./huang1";
import { Answer, CoverScene, Loop, Pr, Twist } from "./huang2";

/** Szenen-IDs = "id" in episodes/jensen-huang.json */
export const HUANG_SCENES: Record<string, React.FC> = {
  hook: Hook,
  confess: Confess,
  fold: Fold,
  alleged: Alleged,
  crash: Crash,
  twist: Twist,
  pr: Pr,
  answer: Answer,
  loop: Loop,
};

/**
 * Übergang IN die Szene (ruhig: Whip/Wipe nur an Szenengrenzen). Whip für Ortswechsel, dunkler Zoom in den ernsten
 * Teil (alleged), roter Burst-Wipe in den Plot-Twist, Rauten-Wipe in die Auflösung (2 Wipes je Clip).
 */
export const HUANG_TRANSITIONS: Record<string, TransitionSpec> = {
  confess: { kind: "whip", dir: 1 },
  fold: { kind: "zoom", color: "#7A3570" },
  alleged: { kind: "zoom", color: "#14161C" },
  crash: { kind: "whip", dir: 1 },
  twist: { kind: "wipe", shape: "burst", color: "#E8434B" },
  pr: { kind: "whip", dir: -1 },
  answer: { kind: "wipe", shape: "diamond", color: "#F2C14E" },
  loop: { kind: "whip", dir: 1 },
};

/** Thumbnail-Motiv: leere Lederjacke am Bügel vor rotem Kurs-Absturz, Kalender SUN. Titel liegt oben (overlays/Cover.tsx). */
export const HuangCoverArt: React.FC = () => {
  const frame = useCurrentFrame();
  return <CoverScene f={frame} />;
};

export const HUANG_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: HUANG_TRANSITIONS,
  hud2d: { counterId: "nvda", barId: "conf" },
  labelUntil: { alleged: "clippingsIn" },
  stickerStack: true,
  coverArt: HuangCoverArt,
};
