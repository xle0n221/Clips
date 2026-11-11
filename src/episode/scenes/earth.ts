import type React from "react";
import type { TransitionSpec } from "../kit/transitions";
import { Blackout, Darkness, Hook, Lights, Nuclear, Satellites, StarsScene, Swift } from "./earth1";
import { Carbon, Comeback, Ending, Hubble, MoonScene, Rushmore, Rust, VoyagerScene } from "./earth2";

/** Szenen-IDs = "id" in episodes/earth-without-humans.json */
export const EARTH_SCENES: Record<string, React.FC> = {
  hook: Hook,
  lights: Lights,
  blackout: Blackout,
  darkness: Darkness,
  stars: StarsScene,
  nuclear: Nuclear,
  satellites: Satellites,
  swift: Swift,
  hubble: Hubble,
  rust: Rust,
  comeback: Comeback,
  carbon: Carbon,
  rushmore: Rushmore,
  moon: MoonScene,
  voyager: VoyagerScene,
  ending: Ending,
};

/**
 * Übergang IN die Szene (kit/transitions.tsx). Whip für Orts-/Zeitsprünge, 2 Form-Wipes
 * (Kapitel „Vorschau“ und „echter Absturz“), Match Cuts an Form-Reimen (Globus, Kopf → Mond).
 */
export const EARTH_TRANSITIONS: Record<string, TransitionSpec> = {
  lights: { kind: "whip", dir: -1 },
  blackout: { kind: "wipe", shape: "circle", color: "#2A0F24" },
  darkness: { kind: "match" },
  stars: { kind: "whip", dir: 1 },
  nuclear: { kind: "cut" },
  satellites: { kind: "zoom", color: "#05081A" },
  swift: { kind: "wipe", shape: "star", color: "#0A0F2A" },
  hubble: { kind: "whip", dir: -1 },
  rust: { kind: "whip", dir: 1 },
  comeback: { kind: "cut" },
  carbon: { kind: "match" },
  rushmore: { kind: "whip", dir: -1 },
  moon: { kind: "match" },
  voyager: { kind: "zoom", color: "#02030A" },
  ending: { kind: "cut" },
};
