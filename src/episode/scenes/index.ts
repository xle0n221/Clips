import React from "react";
import { Earth, Hook, Launch, Mercury, Sun, Venus } from "./part1";
import { Jupiter, Mars, Neptune, Outro, Saturn, Uranus } from "./part2";
import { ROME_SCENES } from "./rome1";

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
};

export const scenesFor = (episode: string) => SCENE_SETS[episode] ?? SCENES;
