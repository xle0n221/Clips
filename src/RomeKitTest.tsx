import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Shot } from "./episode/kit/camera";
import { Grade } from "./episode/overlays/Effects";
import { BlobShadow } from "./episode/kit/props";
import {
  Aqueduct,
  Coin,
  Colosseum,
  Column,
  DangerLight,
  Emperor,
  EmpireMap,
  Goth,
  Hills,
  Legionary,
  Pavement,
  RomanSkyline,
  RomeFog,
  RomeLights,
  RomeSky,
  Rubble,
  Scroll,
  Senator,
  SpqrBanner,
  Temple,
  Throne,
  TimelineStele,
  UmbrellaPine,
  Cypress,
} from "./episode/kit/rome";

/** Prüf-Komposition für das Rom-Kit: 8 Einstellungen à 14 Frames (≈ 3,7 s). */
export const ROME_TEST_SHOT = 14;
export const ROME_TEST_FRAMES = ROME_TEST_SHOT * 8;

const World: React.FC<{ readonly frame: number; readonly ruin?: number }> = ({
  frame,
  ruin = 0,
}) => (
  <>
    <RomeSky frame={frame} />
    <RomeFog />
    <RomeLights />
    <Pavement />
    <Hills />
    <Colosseum position={[0, 0, -16]} ruin={ruin} />
    <RomanSkyline position={[0, 0, -32]} width={44} seed={4} />
    <RomanSkyline position={[-4, 0, -9]} width={8} rows={1} seed={9} rotunda={false} />
    <UmbrellaPine position={[-5.2, 0, -6]} height={4.2} />
    <Cypress position={[4.6, 0, -7]} height={4} />
  </>
);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = Math.min(7, Math.floor(frame / ROME_TEST_SHOT));
  const f = frame - shot * ROME_TEST_SHOT;
  const d = ROME_TEST_SHOT;

  const cast = (
    <>
      <Legionary
        frame={frame}
        hero
        position={[-2.3, 0, 0.6]}
        rotation={[0, 0.35, 0]}
        arms={[0.35, 0.2]}
        eyes="dot"
        mouth="grin"
      />
      <BlobShadow position={[-2.3, 0, 0.6]} />
      <Emperor
        frame={frame + 20}
        position={[0, 0, -1.2]}
        arms={[0.45, 0.25]}
        eyes="happy"
        mouth="smile"
      />
      <BlobShadow position={[0, 0, -1.2]} />
      <Goth
        frame={frame + 40}
        position={[2.3, 0, 0.6]}
        rotation={[0, -0.35, 0]}
        arms={[0.3, 0.25]}
        eyes="angry"
        mouth="teeth"
      />
      <BlobShadow position={[2.3, 0, 0.6]} />
    </>
  );

  if (shot === 0) {
    return (
      <>
        <World frame={frame} />
        {cast}
        <Shot frame={f} duration={d} from={[0, 2.4, 15.5]} to={[0, 2.35, 14.8]} look={[0, 4.4, -8]} fov={44} />
      </>
    );
  }
  if (shot === 1) {
    return (
      <>
        <World frame={frame} />
        {cast}
        <Shot frame={f} duration={d} from={[-1.0, 3.6, 7.4]} to={[-1.1, 3.5, 6.8]} look={[-2.3, 3.0, 0.6]} fov={40} />
      </>
    );
  }
  if (shot === 2) {
    return (
      <>
        <World frame={frame} />
        <Throne position={[0, 0, -1.5]} />
        <Emperor
          frame={frame}
          position={[0, 0.55, -1.2]}
          sit={1}
          arms={[0.6, 0.3]}
          eyes="happy"
          mouth="grin"
        />
        <SpqrBanner frame={frame} position={[-2.4, 0, -1.2]} />
        <SpqrBanner frame={frame + 30} position={[2.4, 0, -1.2]} />
        <Shot frame={f} duration={d} from={[0, 3.6, 8.5]} to={[0, 3.5, 7.8]} look={[0, 3.0, -1]} fov={42} />
      </>
    );
  }
  if (shot === 3) {
    return (
      <>
        <World frame={frame} ruin={0.8} />
        <Goth
          frame={frame}
          position={[-0.7, 0, 3.4]}
          rotation={[0, -0.25, 0]}
          arms={[0.3, 0.25]}
          eyes="angry"
          mouth="teeth"
        />
        <BlobShadow position={[-0.7, 0, 3.4]} />
        <Rubble position={[2.6, 0, -1]} count={6} seed={8} />
        <Shot frame={f} duration={d} from={[0, 2.6, 10.5]} to={[0, 2.6, 10]} look={[0.5, 4.2, -10]} fov={44} />
      </>
    );
  }
  if (shot === 4) {
    return (
      <>
        <RomeSky frame={frame} />
        <RomeFog />
        <RomeLights sun={[-8, 12, 6]} />
        <Pavement />
        <Hills />
        <Aqueduct position={[0, 0, -26]} bays={9} rotation={[0, 0.25, 0]} />
        <RomanSkyline position={[0, 0, -34]} width={40} seed={12} />
        <Temple position={[0, 0, -7]} />
        <Column position={[-4.4, 0, -2]} broken={0.7} />
        <Rubble position={[-3.4, 0, -0.6]} />
        <Senator frame={frame} position={[2.0, 0, 0.6]} rotation={[0, -0.3, 0]} arms={[0.5, 0.2]} mouth="o" eyes="wide" />
        <BlobShadow position={[2.0, 0, 0.6]} />
        <SpqrBanner frame={frame} position={[-1.6, 0, 0]} />
        <Shot frame={f} duration={d} from={[0, 3.5, 12.5]} to={[0, 3.4, 11.5]} look={[0, 4.0, -5]} fov={44} />
      </>
    );
  }
  if (shot === 5) {
    return (
      <>
        <color attach="background" args={["#2A1A12"]} />
        <RomeLights sun={[-4, 8, 6]} intensity={2.2} />
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[8, 0.6, 6]} />
          <meshToonMaterial color="#9C6B3C" />
        </mesh>
        <Scroll position={[-0.9, 2.3, 0.4]} rotation={[-0.2, 0.25, 0]} lines={["SPQR", "ANNO 476", "FINIS?"]} />
        <Coin position={[0.9, 1.7, 0.6]} spin={0.4 + frame * 0.08} scale={0.9} />
        <Coin position={[0.5, 0.05, 1.6]} rotation={[-Math.PI / 2, 0, 0]} scale={0.7} />
        <Coin position={[1.3, 0.05, 1.4]} rotation={[-Math.PI / 2, 0, 0.6]} scale={0.7} />
        <DangerLight frame={frame} position={[2.5, 2.5, 1.5]} intensity={0.7} />
        <Shot frame={f} duration={d} from={[0, 2.9, 8.6]} to={[0, 2.8, 8.0]} look={[0, 1.3, 0.5]} fov={40} />
      </>
    );
  }
  const studio = (
    <>
      <color attach="background" args={["#2A1A12"]} />
      <RomeLights sun={[-4, 10, 6]} intensity={2.3} />
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[14, 0.6, 12]} />
        <meshToonMaterial color="#7A5232" />
      </mesh>
    </>
  );
  if (shot === 6) {
    return (
      <>
        {studio}
        <EmpireMap frame={frame} position={[0, 0.1, 0]} split={0.4 + (f / d) * 0.3} westFall={0.5} />
        <DangerLight frame={frame} position={[-3, 1.5, 0.5]} intensity={0.8} />
        <Shot frame={f} duration={d} from={[0, 15, 6.5]} to={[0, 14.4, 6.2]} look={[0, 0, 0.3]} fov={42} />
      </>
    );
  }
  return (
    <>
      {studio}
      <TimelineStele position={[0, 0, -1]} at={3 + f / d} frame={frame} />
      <Legionary frame={frame} hero position={[1.9, 0, 0.6]} rotation={[0, -0.4, 0]} arms={[0.3, 1.2]} eyes="wide" mouth="o" shield={false} />
      <Shot frame={f} duration={d} from={[0, 4.2, 10]} to={[0, 4.1, 9.4]} look={[0, 3.4, -1]} fov={42} />
    </>
  );
};

export const RomeKitTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#CBEAF6" }}>
      <AbsoluteFill style={{ filter: "saturate(1.15) contrast(1.05)" }}>
        <ThreeCanvas width={width} height={height} shadows>
          <Scene />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* Look wie im Episoden-Render: Vignette + Korn */}
      <Grade />
      {/* Untertitel-Zone (unteres Drittel) als Platzhalter zur Kontrollprüfung */}
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
          ROME FELL?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
