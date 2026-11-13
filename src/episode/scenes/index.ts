import React from "react";
import { Earth, Hook, Launch, Mercury, Sun, Venus } from "./part1";
import { Jupiter, Mars, Neptune, Outro, Saturn, Uranus } from "./part2";
import type { TransitionSpec } from "../kit/transitions";
import { EARTH_SCENES, EARTH_TRANSITIONS, EarthCoverArt } from "./earth";
import { ROME_SCENES } from "./rome1";
import { TYSON_CONFIG, TYSON_SCENES } from "./tyson";
import { UFC_CONFIG, UFC_SCENES } from "./ufc";
import { ROLLS_CONFIG, ROLLS_SCENES } from "./rolls";
import { HUANG_CONFIG, HUANG_SCENES } from "./huang";
import { LUCIA_CONFIG, LUCIA_SCENES } from "./lucia";

// Szenen-IDs = "id" in episodes/solar-system.json
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  launch: Launch,
  sun: Sun,
  mercury: Mercury,
  venus: Venus,
  earth: Earth,
  mars: Mars,
  jupiter: Jupiter,
  saturn: Saturn,
  uranus: Uranus,
  neptune: Neptune,
  outro: Outro,
};

/**
 * Szenen je Episode (Prop `episode`). Episoden ohne eigenen Eintrag nutzen SCENES
 * (Sonnensystem) – so bleibt alles Bisherige unverändert.
 */
export const SCENE_SETS: Record<string, Record<string, React.FC>> = {
  "roman-empire": ROME_SCENES,
  "earth-without-humans": EARTH_SCENES,
  "mike-tyson": TYSON_SCENES,
  ufc: UFC_SCENES,
  "rolls-royce": ROLLS_SCENES,
  "jensen-huang": HUANG_SCENES,
  "lucia-gta6": LUCIA_SCENES,
};

export const scenesFor = (episode: string) => SCENE_SETS[episode] ?? SCENES;

/**
 * Zusatz je Episode (optional, nur additiv): `look: "2d"` zeichnet die Szenen als SVG statt in der
 * ThreeCanvas (kit2d), `transitions` setzt Übergänge je Szenen-ID, `hud2d` ersetzt das Zahlen-HUD
 * durch den Text-Zähler `TimelineHUD` (Balken friert ab Beat `freezeBeat` ein).
 * Episoden ohne Eintrag bleiben unverändert.
 */
export type EpisodeConfig = {
  readonly look?: "2d";
  readonly transitions?: Record<string, TransitionSpec>;
  readonly hud2d?: { readonly freezeBeat?: string; readonly counterId?: string; readonly barId?: string };
  /** Pill (label) einer Szene endet am Beat dieses Namens statt am Szenenende (Szenen-ID → Beat) */
  readonly labelUntil?: Record<string, string>;
  /** Pill(s) einer Szene enden beim ersten Vorkommen dieses Worts (captions.json) – nur Pills, die vorher beginnen */
  readonly labelUntilWord?: Record<string, string>;
  /** Sticker (Text → Beat derselben Szene) endet an diesem Beat statt nach 54 Bildern */
  readonly stickerUntil?: Record<string, string>;
  /** Folgt ein Sticker zu schnell (< 45 Bilder), bleibt der vorige stehen und der neue rutscht 150 px tiefer */
  readonly stickerStack?: boolean;
  /** Motiv hinter dem Cover-Titel (overlays/Cover.tsx); ohne = erste Szene bleibt sichtbar */
  readonly coverArt?: React.FC;
};
export const EPISODE_CONFIG: Record<string, EpisodeConfig> = {
  "earth-without-humans": { look: "2d", transitions: EARTH_TRANSITIONS, hud2d: { freezeBeat: "barFreeze" }, coverArt: EarthCoverArt },
  "mike-tyson": TYSON_CONFIG,
  ufc: UFC_CONFIG,
  "rolls-royce": ROLLS_CONFIG,
  "jensen-huang": HUANG_CONFIG,
  "lucia-gta6": LUCIA_CONFIG,
};
export const configFor = (episode: string): EpisodeConfig | undefined => EPISODE_CONFIG[episode];
