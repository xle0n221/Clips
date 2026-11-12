import React from "react";
import { useCurrentFrame } from "remotion";
import type { TransitionSpec } from "../kit/transitions";
import { Dude, FONT, Layer, LUX, LuxDefs, Stage2D } from "../kit2d";
import type { EpisodeConfig } from "./index";
import { Hook, Pick, Stars, Stitch, Wait } from "./rolls1";
import { Bmw, Ending, Hood, Suite, Wagon } from "./rolls2";
import { LivingRoom, ROOM, SofaFront, SofaSeat } from "./rollsSets";

/** Szenen-IDs = "id" in episodes/rolls-royce.json */
export const ROLLS_SCENES: Record<string, React.FC> = {
  hook: Hook,
  pick: Pick,
  wait: Wait,
  stitch: Stitch,
  stars: Stars,
  hood: Hood,
  suite: Suite,
  bmw: Bmw,
  wagon: Wagon,
  ending: Ending,
};

/**
 * Übergang IN die Szene (ruhig: Whip/Wipe nur an Szenengrenzen). Whip für Ortswechsel, Gold-Rauten-Wipe in den
 * Innenraum (Kapitel „einsteigen“), roter Burst-Wipe in die Plot-Twists (2 Wipes je Clip), Zoom-Iris ins Finale.
 */
export const ROLLS_TRANSITIONS: Record<string, TransitionSpec> = {
  pick: { kind: "whip", dir: 1 },
  wait: { kind: "whip", dir: -1 },
  stitch: { kind: "wipe", shape: "diamond", color: LUX.gold },
  stars: { kind: "match" },
  hood: { kind: "whip", dir: 1 },
  suite: { kind: "whip", dir: -1 },
  bmw: { kind: "wipe", shape: "burst", color: "#D7263D" },
  wagon: { kind: "whip", dir: 1 },
  ending: { kind: "zoom", color: "#2A1A0C" },
};

/** Thumbnail-Motiv: YOU auf dem Sofa mit Cup-Nudeln schielt zur Limousine im Goldlicht; Timer-Sticker „1:00“. Titel liegt oben (overlays/Cover.tsx). */
export const RollsCoverArt: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage2D cam={{ x: 580, y: 730, zoom: 1.04 }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <LivingRoom f={frame} gold={0.35} />
        <SofaSeat />
        <Dude x={ROOM.sofaX} y={ROOM.floor + 10} frame={frame} pose="sit" armA={[14, -96]} armB={[40, 30]} holdA="noodles" eyes="side" mouth="o" brows="up" blinkSeed={4} />
        <SofaFront />
      </Layer>
      <Layer depth={0}>
        <g transform="translate(880 1300) rotate(8)" filter="url(#sticker)">
          <circle r={96} fill={LUX.white} stroke={LUX.ink} strokeWidth={8} />
          <rect x={-18} y={-128} width={36} height={30} rx={6} fill={LUX.red} stroke={LUX.ink} strokeWidth={5} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={LUX.red}>
            1:00
          </text>
        </g>
      </Layer>
    </Stage2D>
  );
};

export const ROLLS_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: ROLLS_TRANSITIONS,
  hud2d: { counterId: "time", barId: "level" },
  labelUntil: { pick: "entryLevelSign", bmw: "recordScratch", wagon: "recordScratch", ending: "stonksArrow" },
  stickerStack: true,
  coverArt: RollsCoverArt,
};
