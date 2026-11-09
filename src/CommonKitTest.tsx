import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Shot } from "./episode/kit/camera";
import { Grade } from "./episode/overlays/Effects";
import { BlobShadow } from "./episode/kit/props";
import { Toonie } from "./episode/kit/Toonie";
import {
  Arrow,
  BarChart,
  CashBag,
  CounterBoard,
  FloorPlate,
  InfoBoard,
  LightBulb,
  Mark,
  PercentRing,
  SizeCompare,
  Stopwatch,
  StudioBackdrop,
  StudioLights,
  Timeline,
  WarningSign,
  WorldMap,
} from "./episode/kit/common";

/**
 * Prüf-Komposition für die themenunabhängigen Bausteine (`kit/common.tsx`):
 * 8 Einstellungen à 20 Frames. Alle Zahlen/Texte hier sind **Testwerte**, keine Fakten.
 * Aufbau-Animation in den ersten 14 Frames jeder Einstellung, danach Endzustand.
 */
export const COMMON_TEST_SHOT = 20;
const SHOTS = 8;
export const COMMON_TEST_FRAMES = COMMON_TEST_SHOT * SHOTS;

const Studio: React.FC = () => (
  <>
    <StudioBackdrop />
    <StudioLights />
    <FloorPlate />
  </>
);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = Math.min(SHOTS - 1, Math.floor(frame / COMMON_TEST_SHOT));
  const f = frame - shot * COMMON_TEST_SHOT;
  const d = COMMON_TEST_SHOT;
  const p = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (shot === 0) {
    return (
      <>
        <Studio />
        <BarChart
          position={[0, 0, 0]}
          values={[12, 35, 58, 90]}
          labels={["2000", "2010", "2020", "2030"]}
          unit="%"
          highlight={3}
          progress={p}
          height={4.6}
        />
        <Shot frame={f} duration={d} from={[0, 3.2, 14]} to={[0, 3.1, 13.5]} look={[0, 1.4, 0]} fov={42} />
      </>
    );
  }
  if (shot === 1) {
    return (
      <>
        <Studio />
        <CounterBoard position={[0, 4.6, -0.5]} title="PEOPLE" to={8100000000} compact progress={p} legs={3.2} appear={p * 2} width={4.4} height={2.4} />
        <Toonie frame={frame} position={[-1.3, 0, 1.2]} rotation={[0, 0.4, 0]} scale={0.75} suit="#3D8BD9" arms={[0.3, 2.4]} eyes="wide" mouth="o" />
        <BlobShadow position={[-1.3, 0, 1.2]} size={0.7} />
        <Shot frame={f} duration={d} from={[0, 3.4, 12.5]} to={[0, 3.3, 12]} look={[0, 1.9, 0]} fov={42} />
      </>
    );
  }
  if (shot === 2) {
    return (
      <>
        <Studio />
        <PercentRing position={[0, 4.4, 0]} value={71} progress={p} color="#3D8BD9" label="WATER" />
        <Toonie frame={frame} position={[1.5, 0, 1.4]} rotation={[0, -0.4, 0]} scale={0.7} suit="#3DA35D" arms={[2.3, 0.3]} eyes="happy" mouth="grin" />
        <BlobShadow position={[1.5, 0, 1.4]} size={0.65} />
        <Shot frame={f} duration={d} from={[0, 3.6, 12]} to={[0, 3.5, 11.5]} look={[0, 2.1, 0]} fov={42} />
      </>
    );
  }
  if (shot === 3) {
    return (
      <>
        <Studio />
        <SizeCompare
          position={[0.5, 0, 0]}
          items={[
            { label: "YOU", value: 2, shape: "figure" },
            { label: "HOUSE", value: 6, shape: "tower", color: "#F28C28" },
            { label: "TOWER", value: 12, shape: "column", color: "#8E5BD0" },
          ]}
          unit=" m"
          maxHeight={5}
          progress={p}
          spacing={1.6}
          frame={frame}
        />
        <Shot frame={f} duration={d} from={[-0.2, 3.4, 16]} to={[-0.2, 3.3, 15.5]} look={[-0.2, 1.6, 0]} fov={42} />
      </>
    );
  }
  if (shot === 4) {
    return (
      <>
        <Studio />
        <Timeline
          position={[-0.6, 3.9, 0]}
          events={[
            { year: "1800", label: "START" },
            { year: "1900", label: "BIG IDEA" },
            { year: "1969", label: "MOON" },
            { year: "2000", label: "WEB" },
            { year: "2026", label: "TODAY" },
          ]}
          progress={p}
          at={interpolate(f, [6, 19], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          length={5.4}
          frame={frame}
        />
        <Shot frame={f} duration={d} from={[0.3, 3.6, 14]} to={[0.3, 3.5, 13.5]} look={[0.3, 2.6, 0]} fov={42} />
      </>
    );
  }
  if (shot === 5) {
    return (
      <>
        <Studio />
        <WorldMap
          position={[0, 4.2, 0]}
          width={4.0}
          drop={p}
          frame={frame}
          pins={[
            { lon: 2.35, lat: 48.86, label: "PARIS" },
            { lon: 139.7, lat: 35.7, label: "TOKYO", color: "#3D8BD9" },
            { lon: -74, lat: 40.7, label: "NYC", color: "#3DA35D", labelDy: 0.55 },
          ]}
        />
        <Toonie frame={frame} position={[0, 0, 1.6]} scale={0.6} suit="#E5484D" arms={[0.4, 0.4]} eyes="dot" mouth="smile" />
        <BlobShadow position={[0, 0, 1.6]} size={0.55} />
        <Shot frame={f} duration={d} from={[0, 3.6, 12.5]} to={[0, 3.5, 12]} look={[0, 2.3, 0]} fov={42} />
      </>
    );
  }
  if (shot === 6) {
    return (
      <>
        <Studio />
        <WarningSign position={[-1.6, 0, -1.6]} frame={frame} wobble={1} />
        <Mark kind="?" position={[0.2, 2.2, -1.6]} frame={frame} appear={p * 2} />
        <Mark kind="!" position={[1.6, 2.2, -1.6]} frame={frame + 9} appear={p * 2 - 0.3} color="#E5484D" />
        <CashBag position={[-1.75, 0, 0.8]} rotation={[0, 0.3, 0]} squash={Math.max(0, 0.5 - p)} />
        <Stopwatch position={[0, 1.0, 1.4]} t={f / 20} frame={frame} alarm={1} scale={0.7} />
        <LightBulb position={[1.75, 0, 0.8]} on={p} frame={frame} />
        <Shot frame={f} duration={d} from={[0, 3.2, 13.5]} to={[0, 3.1, 13]} look={[0, 1.2, 0]} fov={42} />
      </>
    );
  }
  return (
    <>
      <Studio />
      <InfoBoard position={[0.6, 5.0, -1]} width={3.6} height={2.6} title="DID YOU KNOW?" lines={["SHORT LINE", "MAX 14 CHARS"]} legs={3.7} appear={p * 1.6} />
      <Toonie frame={frame} position={[-1.3, 0, 1]} rotation={[0, 0.35, 0]} scale={0.8} suit="#F28C28" arms={[0.3, 0.3]} eyes="happy" mouth="grin" bounce={0.1} />
      <BlobShadow position={[-1.3, 0, 1]} size={0.75} />
      <LightBulb position={[-1.3, 3.5, 1]} scale={0.6} on={interpolate(f, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} frame={frame} />
      <Arrow from={[-0.4, 2.4, 1.2]} to={[0.8, 3.4, 0]} grow={p} frame={frame} color="#FFC928" />
      <Shot frame={f} duration={d} from={[0, 3.6, 13]} to={[0, 3.5, 12.5]} look={[0, 2.2, 0]} fov={42} />
    </>
  );
};

export const CommonKitTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2B2140" }}>
      <AbsoluteFill style={{ filter: "saturate(1.15) contrast(1.05)" }}>
        <ThreeCanvas width={width} height={height} shadows>
          <Scene />
        </ThreeCanvas>
      </AbsoluteFill>
      <Grade />
      {/* Untertitel-Platzhalter (unteres Drittel) zur Kontrolle der freien Zone */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 400 }}>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 92,
            color: "#FFFFFF",
            WebkitTextStroke: "16px #111",
            paintOrder: "stroke",
            textShadow: "0 8px 0 rgba(0,0,0,0.75)",
          }}
        >
          WAIT, WHAT?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
