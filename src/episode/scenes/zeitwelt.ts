import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import { ZwEmpty, ZwHook, ZwIda, ZwRules, ZwStakes, ZwThread, ZwWorld } from "./zeitwelt1";
import { ZwHome, ZwPainted, ZwRehook, ZwRent, ZwSweeper, ZwTower, ZwTwenty } from "./zeitwelt2";
import { ZwFear, ZwFranklin, ZwKnock, ZwLiteral, ZwQuestion, ZwTruth, ZwUnpaid } from "./zeitwelt3";

/** Szenen-IDs = "id" in episodes/zeit-welt.json */
export const ZEIT_SCENES: Record<string, React.FC> = {
  hook: ZwHook,
  stakes: ZwStakes,
  world: ZwWorld,
  rules: ZwRules,
  empty: ZwEmpty,
  ida: ZwIda,
  thread: ZwThread,
  tower: ZwTower,
  rent: ZwRent,
  rehook: ZwRehook,
  sweeper: ZwSweeper,
  home: ZwHome,
  painted: ZwPainted,
  twenty: ZwTwenty,
  truth: ZwTruth,
  fear: ZwFear,
  franklin: ZwFranklin,
  literal: ZwLiteral,
  unpaid: ZwUnpaid,
  knock: ZwKnock,
  question: ZwQuestion,
};

/**
 * Übergänge (clip-regeln „Bewegung & Übergänge“): Whip bei Orts-/Zeitsprüngen, EIN Form-Wipe in Sanduhr-Form
 * beim Wechsel Fiktion → echte Welt (franklin), Match Cut zum Twist; sonst harte, ruhige Schnitte (kein Weiß-Blitz).
 */
const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {
  stakes: CUT,
  world: { kind: "whip", dir: 1 },
  rules: CUT,
  empty: { kind: "whip", dir: -1 },
  ida: { kind: "whip", dir: 1 },
  thread: CUT,
  tower: { kind: "whip", dir: 1 },
  rent: CUT,
  rehook: CUT,
  sweeper: CUT,
  home: CUT,
  painted: { kind: "match" },
  twenty: CUT,
  truth: CUT,
  fear: CUT,
  franklin: { kind: "wipe", shape: "hourglass", color: "#FFB21F", frames: 9 },
  literal: CUT,
  unpaid: { kind: "whip", dir: 1 },
  knock: CUT,
  question: CUT,
};

export const ZEIT_CONFIG: EpisodeConfig = {
  transitions: TRANSITIONS,
  hud2d: { counterId: "jar", barId: "none", plate: true, hideBeat: "hudOut", maxWidth: 620 },
  filmLook: { grain: 0.09, vignette: 0.5, dof: [0.1, 0.12, 5] },
  bed: { src: "bed.wav", volume: 1 },
};
