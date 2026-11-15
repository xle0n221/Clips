import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/sonne-verschwindet.json";
import { SonArrive, SonDistance, SonGrandpa, SonGravity, SonHook, SonJuno, SonOld, SonOrbit, SonProof, SonSpeed, SonZero } from "./sonne1";
import { SonAnswer2, SonFive, SonFour, SonHope, SonMoon, SonOcean, SonRehook, SonSaturn, SonSeven, SonStraight, SonTally, SonTurn } from "./sonne2";

/** Szenen-IDs = "id" in episodes/sonne-verschwindet.json */
export const SONNE_SCENES: Record<string, React.FC> = {
  hook: SonHook,
  juno: SonJuno,
  grandpa: SonGrandpa,
  old: SonOld,
  zero: SonZero,
  distance: SonDistance,
  gravity: SonGravity,
  speed: SonSpeed,
  proof: SonProof,
  arrive: SonArrive,
  orbit: SonOrbit,
  rehook: SonRehook,
  four: SonFour,
  five: SonFive,
  seven: SonSeven,
  hope: SonHope,
  turn: SonTurn,
  straight: SonStraight,
  moon: SonMoon,
  ocean: SonOcean,
  saturn: SonSaturn,
  tally: SonTally,
  answer2: SonAnswer2,
};

/** Ruhige harte Schnitte (kein Weiß-Blitz); der Loop (answer2 → erstes Bild) ist ein Match Cut über gleiche Bildstellen (HookFrame). */
const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(SONNE_SCENES).slice(1)) TRANSITIONS[id] = CUT;

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
 * Oben steht die Handlungs-Phrase statt des Zahlen-HUD; die Zeitanzeige „SUN GONE FOR“ steht IM Bild (HudPanel).
 */
export const SONNE_CONFIG: EpisodeConfig = {
  transitions: TRANSITIONS,
  filmLook: { grain: 0.08, vignette: 0.5, dof: [0.1, 0.12, 5] },
  bed: { src: "bed.wav", volume: 1 },
  phrases: PHRASES,
  onScreen: ON_SCREEN,
  noHud: true,
  stickerTop: 430,
  onScreenPlate: true,
  // Schluss: Phrase „THEN SATURN'S ECHO ENDS“ sagt es schon (Lehre Bauarbeiter P2-2: keine Dreifach-Aussage)
  stickerHide: ["SATURN'S ECHO ENDS"],
  endCardTypeFrom: 2,
};
