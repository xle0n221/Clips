import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/tor-stadt.json";
import { TorDoors, TorHide, TorHook, TorPip, TorPosters, TorRule, TorWorld } from "./tor1";
import { TorFirst, TorHollis, TorHope, TorOpen, TorSea, TorStakes, TorStinger, TorTurn } from "./tor2";

/** Szenen-IDs = "id" in episodes/tor-stadt.json */
export const TOR_SCENES: Record<string, React.FC> = {
  hook: TorHook,
  rule: TorRule,
  world: TorWorld,
  pip: TorPip,
  posters: TorPosters,
  doors: TorDoors,
  hide: TorHide,
  hollis: TorHollis,
  stakes: TorStakes,
  hope: TorHope,
  turn: TorTurn,
  open: TorOpen,
  sea: TorSea,
  first: TorFirst,
  stinger: TorStinger,
};

/** Ruhige harte Schnitte (kein Weiß-Blitz); der Loop (stinger → erstes Bild) ist ein Match Cut über dieselbe Kamera (HookFrame). */
const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(TOR_SCENES).slice(1)) TRANSITIONS[id] = CUT;

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
 * Zahlen-HUD aus: der Zähler „YES ___ / 1,000“ steht IM Bild über dem Tor (CounterBoard, torSets.tsx).
 */
export const TOR_CONFIG: EpisodeConfig = {
  transitions: TRANSITIONS,
  filmLook: { grain: 0.07, vignette: 0.45, dof: [0.1, 0.12, 4] },
  bed: { src: "bed.wav", volume: 1 },
  phrases: PHRASES,
  onScreen: ON_SCREEN,
  noHud: true,
  stickerTop: 430,
  onScreenPlate: true,
  // „OPENS AT: 1,000 YES“: die Regeltafel im Bild trägt genau diesen Text (K13, keine Doppelung)
  stickerHide: ["OPENS AT: 1,000 YES"],
  endCardTypeFrom: 2,
};
