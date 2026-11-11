import React, { useState } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CameraRigContext } from "./episode/kit/camera";
import {
  canvasFxOf,
  rigOf,
  transitionAt,
  TransitionOverlay,
  TransitionSpec,
  whipBlurOf,
  WhipBlurDefs,
} from "./episode/kit/transitions";
import {
  Bottle,
  Bridge,
  C,
  Cask,
  ease,
  FireTrail,
  FlagShadow,
  Footprints,
  Fox,
  FuelPool,
  Ghost,
  Layer,
  lerp,
  MilkyWay,
  MoonGround,
  NightEarth,
  Person,
  Ruler,
  Satellite,
  Skyline,
  Stage2D,
  Stars,
  StoneHeads,
  Telescope,
  TimelineHUD,
  Tree,
  Voyager,
  Weeds,
} from "./episode/kit2d";
import { Grade } from "./episode/overlays/Effects";
import { loadCaptionFont } from "./episode/overlays/fonts";
import type { Timeline } from "./episode/types";

/**
 * Prüf-Komposition des 2D-Bau-Kits (src/episode/kit2d/). 8 Einstellungen à 60 Bilder, jede mit
 * Bewegung; dazwischen Whip/Wipe/Match/Zoom wie in der Episode. Texte/Werte sind Testwerte.
 */
const LEN = 60;
const N = 8;
export const KIT2D_TEST_FRAMES = LEN * N;
const CUTS = Array.from({ length: N - 1 }, (_, i) => (i + 1) * LEN);
const SPECS: TransitionSpec[] = [
  { kind: "whip", dir: 1 },
  { kind: "wipe", shape: "circle", color: "#2A0F24" },
  { kind: "match" },
  { kind: "zoom", color: "#05081A" },
  { kind: "whip", dir: -1 },
  { kind: "wipe", shape: "star", color: "#0A0F2A" },
  { kind: "cut" },
];
const TL: Timeline = {
  id: "kit2d-test",
  title: "",
  durationMs: (KIT2D_TEST_FRAMES / 30) * 1000,
  scenes: [],
  hud: {
    title: "EARTH WITHOUT US",
    counters: [{ id: "time", label: "", value: "HOUR 0" as unknown as number }],
    bars: [{ id: "traces", label: "HUMAN TRACES", value: 1, color: C.scarf }],
  },
  cues: [
    { scene: "t", atMs: 1200, hud: { id: "time", value: "DAY 1" as unknown as number } },
    { scene: "t", atMs: 3000, hud: { id: "time", value: "YEAR 1" as unknown as number } },
    { scene: "t", atMs: 6000, hud: { id: "time", value: "YEAR 300" as unknown as number } },
    { scene: "t", atMs: 9000, hud: { id: "time", value: "YEAR 10,000" as unknown as number } },
    { scene: "t", atMs: 4000, ...({ bar: { id: "traces", value: 0.6 } } as object) },
    { scene: "t", atMs: 12000, beat: "freeze" },
  ],
};

const Shot: React.FC<{ readonly i: number; readonly f: number }> = ({ i, f }) => {
  const t = f / LEN;
  switch (i) {
    case 0:
      return (
        <Stage2D cam={{ x: lerp(480, 600, t), y: 900, zoom: 1 }} mood="night">
          <Layer depth={0.35}>
            <Skyline seed={2} baseY={1110} minH={320} maxH={780} color="#18204A" litFrac={1 - t} />
          </Layer>
          <Layer depth={0.6}>
            <Skyline seed={5} baseY={1170} minH={200} maxH={560} color="#0F1530" litFrac={1 - t * 0.6} />
          </Layer>
          <Layer>
            <rect x={-900} y={1196} width={2900} height={900} fill="#070A18" />
            <Person x={300} y={1240} color="#C0362C" s={1.15} step={Math.sin(f * 0.3)} pop={ease(f, 20, 32, "linear")} />
            <Ghost x={560} y={1120} s={1.1} frame={f} motion={(k) => Math.sin(k * 0.15) * 40} eyes={f > 40 ? "wide" : "normal"} mouth={f > 40 ? "o" : "flat"} armR={f > 40 ? 120 : 18} />
          </Layer>
        </Stage2D>
      );
    case 1:
      return (
        <Stage2D cam={{ x: 540, y: 900, zoom: lerp(1.6, 1, ease(f, 0, 40)) }} mood="space">
          <Layer depth={0.2}>
            <Stars frame={f} count={150} y={-200} h={2200} />
          </Layer>
          <Layer depth={0.85}>
            <NightEarth x={540} y={800} s={1.12} rot={f * 0.1} frame={f} lit={(dx) => dx < lerp(1.3, -1.3, t)} />
          </Layer>
        </Stage2D>
      );
    case 2:
      return (
        <Stage2D cam={{ x: 540, y: lerp(1000, 700, ease(f, 0, LEN)), zoom: lerp(1.3, 0.9, t) }} mood="night">
          <Layer depth={0.2}>
            <Stars frame={f} count={240} x={-500} y={-600} w={2100} h={1800} reveal={t} />
            <MilkyWay o={t} frame={f} cy={300} />
          </Layer>
          <Layer>
            <Skyline seed={3} baseY={1250} color="#070A18" litFrac={0} />
          </Layer>
        </Stage2D>
      );
    case 3:
      return (
        <Stage2D cam={{ x: lerp(420, 640, t), y: 900, zoom: 1 }} mood="night">
          <Layer>
            <rect x={-600} y={1200} width={2600} height={900} fill="#0B0F1F" />
            <g transform="translate(540 380) scale(0.6)">
              <FuelPool x={0} y={0} frame={f} />
            </g>
            <Cask x={300} y={1210} frame={f} s={0.9} />
            <Cask x={760} y={1210} frame={f + 20} s={0.9} />
            <Ghost x={530} y={1150} s={0.8} frame={f} armL={78} armR={78} eyes="squint" mouth="smile" />
          </Layer>
          <Layer depth={1.6}>
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x={-200 + k * 420} y={1150} width={34} height={500} fill="#05070F" />
            ))}
          </Layer>
        </Stage2D>
      );
    case 4:
      return (
        <Stage2D cam={{ x: 540, y: 960, zoom: 1 }} mood="space">
          <Layer depth={0.2}>
            <Stars frame={f} count={150} y={-200} h={2200} />
          </Layer>
          <Layer>
            <NightEarth x={540} y={1950} s={2.5} frame={f} lit={() => false} atmo={lerp(1, 3, t)} />
            <Satellite x={300 + f * 3} y={700} warn={t > 0.5 ? 1 : 0} frame={f} />
            <FireTrail x={700} y={1000} o={1} frame={f} r={-60} />
            <Telescope x={760} y={1040} s={0.7} face frame={f} r={20} />
          </Layer>
        </Stage2D>
      );
    case 5:
      return (
        <Stage2D cam={{ x: 540, y: lerp(900, 1400, ease(f, 20, 50, "inOut")), zoom: 1 }} mood="night">
          <Layer>
            <rect x={-1200} y={1150} width={3600} height={1600} fill={C.water} />
            <Bridge x={540} y={1150} s={0.65} rust={t} />
            <Bottle x={560} y={1600} crack={ease(f, 40, 52)} />
          </Layer>
        </Stage2D>
      );
    case 6:
      return (
        <Stage2D cam={{ x: lerp(400, 640, t), y: 930, zoom: 1 }} mood="nature">
          <Layer>
            <StoneHeads x={540} y={1000} s={0.6} />
            <Ruler x={330} y={560} len={140} label="1 INCH" />
            <rect x={-900} y={1220} width={3000} height={1000} fill="#24302C" />
            <Tree x={200} y={1222} grow={ease(f, 0, 30)} />
            <Weeds x={600} y={1226} grow={ease(f, 10, 40)} />
            <Fox x={760} y={1226} s={0.8} look={ease(f, 30, 38)} />
          </Layer>
        </Stage2D>
      );
    default:
      return (
        <Stage2D cam={{ x: 540, y: 900, zoom: lerp(1.2, 0.9, t) }} mood="moon">
          <Layer depth={0.2}>
            <Stars frame={f} count={150} y={-200} h={2200} />
          </Layer>
          <Layer>
            <MoonGround y0={1000} />
            <Footprints x0={120} y0={1250} x1={760} y1={1050} reveal={t} />
            <FlagShadow x={820} y={1050} s={0.9} shadow={ease(f, 20, 40)} />
            <Voyager x={540} y={500} s={0.5} glint={t > 0.6 ? 1 : 0} />
          </Layer>
        </Stage2D>
      );
  }
};

export const Kit2DTest: React.FC = () => {
  const frame = useCurrentFrame();
  useState(() => loadCaptionFont());
  const i = Math.min(N - 1, Math.floor(frame / LEN));
  const st = transitionAt(frame, CUTS, SPECS);
  const fx = canvasFxOf(st);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1035" }}>
      <WhipBlurDefs blur={whipBlurOf(st)} />
      <AbsoluteFill style={{ transform: fx?.transform || undefined, filter: fx?.filter || undefined }}>
        <CameraRigContext.Provider value={rigOf(st)}>
          <Shot i={i} f={frame - i * LEN} />
        </CameraRigContext.Provider>
      </AbsoluteFill>
      <TransitionOverlay state={st} width={1080} height={1920} />
      <TimelineHUD timeline={TL} freezeBeat="freeze" />
      <Grade />
    </AbsoluteFill>
  );
};
