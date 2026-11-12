import React from "react";
import { useCurrentFrame } from "remotion";
import type { TransitionSpec } from "../kit/transitions";
import { Figure, Layer, RING_TONES, SpotCone, Stage2D, Stool } from "../kit2d";
import type { EpisodeConfig } from "./index";
import { Brooklyn, Detention, FEET, Hook, Mother, Streets } from "./tyson1";
import { Champion, Conviction, Douglas, Ear, Ending, Exodus } from "./tyson2";
import { Arena } from "./tysonSets";

/** Szenen-IDs = "id" in episodes/mike-tyson.json */
export const TYSON_SCENES: Record<string, React.FC> = {
  hook: Hook,
  brooklyn: Brooklyn,
  streets: Streets,
  detention: Detention,
  mother: Mother,
  champion: Champion,
  douglas: Douglas,
  conviction: Conviction,
  ear: Ear,
  exodus: Exodus,
  ending: Ending,
};

/**
 * Übergang IN die Szene. Whip für Orts-/Zeitsprünge, Zoom ins Dunkle für die ernsten Szenen,
 * Match an Form-Reimen (Figur an gleicher Bildstelle). Form-Wipes (Handschuh) laufen IN den Szenen
 * champion und ending (2× je Clip, Regel „Bewegung & Übergänge“).
 */
export const TYSON_TRANSITIONS: Record<string, TransitionSpec> = {
  brooklyn: { kind: "zoom", color: "#1A120D" },
  streets: { kind: "whip", dir: 1 },
  detention: { kind: "whip", dir: -1 },
  mother: { kind: "match" },
  champion: { kind: "whip", dir: 1 },
  douglas: { kind: "whip", dir: -1 },
  conviction: { kind: "zoom", color: "#141414" },
  ear: { kind: "cut" },
  exodus: { kind: "zoom", color: "#050403" },
  ending: { kind: "whip", dir: 1 },
};

/** Thumbnail-Motiv: MIKE erschöpft auf dem Hocker im Spotlicht, weißes Handtuch; Titel liegt oben (overlays/Cover.tsx). */
export const TysonCoverArt: React.FC = () => {
  const frame = useCurrentFrame();
  const s = 1.45;
  const mx = 540;
  const fy = FEET + 380;
  return (
    <Stage2D cam={{ x: 540, y: 960, zoom: 1 }} mood="night" noSky>
      <Layer>
        <Arena phase="warm" tone={RING_TONES.warm} f={frame} lights={0.5} />
        <Stool x={mx} y={fy + 4} s={s} />
        <Figure x={mx} y={fy} s={s} frame={frame} pose="sit" towel="neck" armL={[18, 2]} armR={[18, 2]} headDown={1} eyes="down" brows="sad" blinkSeed={3} />
        <SpotCone x={mx} y={fy + 10} o={1} w={430} dim={0.5} />
      </Layer>
    </Stage2D>
  );
};

export const TYSON_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TYSON_TRANSITIONS,
  hud2d: { counterId: "age", barId: "hits" },
  labelUntil: { streets: "tallyMarks", champion: "gloveWipe", conviction: "barStill" },
  coverArt: TysonCoverArt,
};
