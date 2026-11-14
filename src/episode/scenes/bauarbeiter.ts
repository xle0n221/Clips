import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/bauarbeiter.json";
import { BauAnswer, BauHook, BauNote, BauPipe, BauRadio, BauRitual, BauStakes, BauTape } from "./bauarbeiter1";
import { BauAnswer2, BauBelow, BauFear, BauHope, BauKnocks, BauLook, BauMirror, BauPour, BauTurn } from "./bauarbeiter2";

/** Szenen-IDs = "id" in episodes/bauarbeiter.json */
export const BAU_SCENES: Record<string, React.FC> = {
  hook: BauHook,
  ritual: BauRitual,
  stakes: BauStakes,
  pipe: BauPipe,
  answer: BauAnswer,
  radio: BauRadio,
  tape: BauTape,
  note: BauNote,
  look: BauLook,
  mirror: BauMirror,
  below: BauBelow,
  fear: BauFear,
  hope: BauHope,
  turn: BauTurn,
  pour: BauPour,
  knocks: BauKnocks,
  answer2: BauAnswer2,
};

/** Ruhige harte Schnitte (Horror, kein Weiß-Blitz); Match Cut amber → türkis beim Doppelgänger. */
const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(BAU_SCENES).slice(1)) TRANSITIONS[id] = id === "mirror" ? { kind: "match" } : CUT;

type PlanScene = { readonly id: string; readonly onScreen?: string; readonly captions?: readonly string[] };
const scenes = (plan as { scenes: readonly PlanScene[] }).scenes;
const PHRASES: string[] = [];
const ON_SCREEN: Record<string, string> = {};
for (const s of scenes) {
  PHRASES.push(...(s.captions ?? []));
  if (s.onScreen) ON_SCREEN[s.id] = s.onScreen;
}

/**
 * Untertitel-Phrasen + Handlungs-Phrase je Szene kommen direkt aus dem Drehbuch (eine Quelle, nichts doppelt).
 * Oben steht die Handlungs-Phrase statt des Zahlen-HUD (Uhr/Guss stehen im Bild: Zaun-Uhr, Schild, onScreen).
 */
export const BAU_CONFIG: EpisodeConfig = {
  transitions: TRANSITIONS,
  filmLook: { grain: 0.09, vignette: 0.55, dof: [0.1, 0.12, 5] },
  bed: { src: "bed.wav", volume: 1 },
  phrases: PHRASES,
  onScreen: ON_SCREEN,
  noHud: true,
  stickerTop: 430,
  onScreenPlate: true,
  endCardTypeFrom: 2,
};
