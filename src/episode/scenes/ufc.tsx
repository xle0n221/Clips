import React from "react";
import type { TransitionSpec } from "../kit/transitions";
import type { EpisodeConfig } from "./index";
import { Ban, Hook, Rules, Start, UfcCoverArt, Zuffa } from "./ufc1";
import { Boom, Empire, Ending, Price, Sale, Tuf } from "./ufc2";

/** Szenen-IDs = "id" in episodes/ufc.json */
export const UFC_SCENES: Record<string, React.FC> = {
  hook: Hook,
  start: Start,
  ban: Ban,
  rules: Rules,
  zuffa: Zuffa,
  tuf: Tuf,
  boom: Boom,
  sale: Sale,
  price: Price,
  empire: Empire,
  ending: Ending,
};

/**
 * Übergang IN die Szene (nur an Szenengrenzen, Nutzer-Tempo-Regel): Whip für Zeitsprünge,
 * Iris (zoom) für Stimmungswechsel (kühl/kalt), Form-Wipe (Oktagon) läuft IN der Szene ending (Loop).
 */
export const UFC_TRANSITIONS: Record<string, TransitionSpec> = {
  start: { kind: "whip", dir: -1 },
  ban: { kind: "zoom", color: "#0A1018" },
  rules: { kind: "whip", dir: 1 },
  zuffa: { kind: "whip", dir: 1 },
  tuf: { kind: "zoom", color: "#1C1206" },
  boom: { kind: "whip", dir: 1 },
  sale: { kind: "zoom", color: "#F2C14E" },
  price: { kind: "zoom", color: "#06080C" },
  empire: { kind: "whip", dir: 1 },
  ending: { kind: "whip", dir: -1 },
};

export const UFC_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: UFC_TRANSITIONS,
  hud2d: { counterId: "value", barId: "share" },
  labelUntil: { ban: "lettersFly", zuffa: "freezeMark" },
  labelUntilWord: { boom: "2013" },
  stickerUntil: { "NBA: ≈ 1/2": "courthouse" },
  stickerStack: true,
  coverArt: UfcCoverArt,
};
