import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/schwerkraft-stadt.json";
import { SkDump, SkHook, SkLight, SkLonely, SkRehook, SkRule, SkSlide } from "./schwerkraft1";
import { SkAnswer, SkBo, SkCatch, SkGust, SkLoop, SkMarta, SkTown, SkTurn } from "./schwerkraft2";

/** Szenen-IDs = "id" in episodes/schwerkraft-stadt.json */
export const SCHWERKRAFT_SCENES: Record<string, React.FC> = {
  hook: SkHook,
  rule: SkRule,
  slide: SkSlide,
  light: SkLight,
  dump: SkDump,
  lonely: SkLonely,
  rehook: SkRehook,
  bo: SkBo,
  gust: SkGust,
  town: SkTown,
  marta: SkMarta,
  turn: SkTurn,
  catch: SkCatch,
  answer: SkAnswer,
  loop: SkLoop,
};

/** Ruhige harte Schnitte; der Loop (loop → erstes Bild) ist ein Match Cut über dieselbe Kamera (HookFrame). */
const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(SCHWERKRAFT_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly onScreen?: string; readonly captions?: readonly string[] };
const scenes = (plan as { scenes: readonly PlanScene[] }).scenes;
const PHRASES: string[] = [];
const ON_SCREEN: Record<string, string> = {};
for (const s of scenes) {
  PHRASES.push(...(s.captions ?? []));
  if (s.onScreen) ON_SCREEN[s.id] = s.onScreen;
}

/**
 * Untertitel-Phrasen + Handlungs-Phrase je Szene direkt aus dem Drehbuch (eine Quelle).
 * Oben steht die Handlungs-Phrase statt des Zahlen-HUD; „CENTER OF GRAVITY: MARTA“ und „BO: …“ stehen IM Bild (Board).
 */
export const SCHWERKRAFT_CONFIG: EpisodeConfig = {
  transitions: TRANSITIONS,
  filmLook: { grain: 0.07, vignette: 0.45, dof: [0.1, 0.12, 5] },
  bed: { src: "bed.wav", volume: 1 },
  phrases: PHRASES,
  onScreen: ON_SCREEN,
  noHud: true,
  stickerTop: 430,
  onScreenPlate: true,
  endCardTypeFrom: 2,
};
