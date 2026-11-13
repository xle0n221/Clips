import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import { ZwEmpty, ZwHook, ZwIda, ZwRules, ZwStakes, ZwThread, ZwWorld } from "./zeitwelt1";

/** Szenen-IDs = "id" in episodes/zeit-welt.json */
export const ZEIT_SCENES: Record<string, React.FC> = {
  hook: ZwHook,
  stakes: ZwStakes,
  world: ZwWorld,
  rules: ZwRules,
  empty: ZwEmpty,
  ida: ZwIda,
  thread: ZwThread,
};

const TRANSITIONS: Record<string, TransitionSpec> = {};

export const ZEIT_CONFIG: EpisodeConfig = {
  transitions: TRANSITIONS,
  hud2d: { counterId: "jar", barId: "none", plate: true, hideBeat: "hudOut", maxWidth: 620 },
  filmLook: { grain: 0.09, vignette: 0.5, dof: [0.1, 0.12, 5] },
  bed: { src: "bed.wav", volume: 1 },
};
