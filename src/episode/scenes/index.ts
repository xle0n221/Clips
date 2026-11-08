import React from "react";
import { Earth, Hook, Launch, Mercury, Sun, Venus } from "./part1";
import { Jupiter, Mars, Neptune, Outro, Saturn, Uranus } from "./part2";

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
