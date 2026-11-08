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
  RomeAtmosphere,
  RomeFog,
  RomeLights,
  RomePhase,
  RomeSky,
  romeMood,
  Rubble,
  Scroll,
  Senator,
  SpqrBanner,
  Temple,
  Throne,
  THRONE_SIT_Y,
  TimelineStele,
  UmbrellaPine,
  Cypress,
} from "./episode/kit/rome";

/**
 * Prüf-Komposition für das Rom-Kit: 10 Einstellungen à 14 Frames (≈ 4,7 s).
 * 0–7 Bausteine bei Mittag („glory“), 8 = gleiche Totale im Niedergang („decline“),
 * 9 = Untergang („fall“) mit Gefahrenlicht.
 */
export const ROME_TEST_SHOT = 14;
const SHOTS = 10;
export const ROME_TEST_FRAMES = ROME_TEST_SHOT * SHOTS;

const phaseOf = (shot: number): RomePhase => (shot === 8 ? "decline" : shot === 9 ? "fall" : "glory");

/** Kulisse: Kolosseum groß und weit hinten (monumental), davor Stadt, Bäume. */
const World: React.FC<{
  readonly frame: number;
  readonly ruin?: number;
  readonly phase?: RomePhase;
}> = ({ frame, ruin = 0, phase = "glory" }) => (
  <>
    <RomeAtmosphere phase={phase} frame={frame} />
    <Pavement />
    <Hills />
    <Colosseum position={[6, 0, -44]} scale={2.6} ruin={ruin} />
    <RomanSkyline position={[0, 0, -22]} width={40} rows={1} seed={4} rotunda={false} />
    <RomanSkyline position={[-4, 0, -9]} width={8} rows={1} seed={9} rotunda={false} />
    <UmbrellaPine position={[-5.2, 0, -6]} height={4.2} />
    <Cypress position={[4.6, 0, -7]} height={4} />
  </>
);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = Math.min(SHOTS - 1, Math.floor(frame / ROME_TEST_SHOT));
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
        <Shot frame={f} duration={d} from={[0, 2.0, 15.5]} to={[0, 1.95, 14.8]} look={[0, 6.2, -20]} fov={46} />
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
          position={[0, THRONE_SIT_Y, -1.2]}
          sit={1}
          arms={[0.6, 0.3]}
          eyes="happy"
          mouth="grin"
        />
        <SpqrBanner frame={frame} position={[-2.4, 0, -1.2]} />
        <SpqrBanner frame={frame + 30} position={[2.4, 0, -1.2]} />
        <Shot frame={f} duration={d} from={[0, 3.4, 10.2]} to={[0, 3.35, 9.6]} look={[0, 3.3, -1]} fov={42} />
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
        <Shot frame={f} duration={d} from={[-0.3, 2.7, 10.4]} to={[-0.3, 2.65, 9.9]} look={[-0.5, 3.6, 3.4]} fov={42} />
      </>
    );
  }
  if (shot === 8 || shot === 9) {
    const fall = shot === 9;
    return (
      <>
        <World frame={frame} phase={phaseOf(shot)} ruin={fall ? 0.7 : 0} />
        {fall ? (
          <>
            <Goth
              frame={frame}
              position={[1.6, 0, 0.8]}
              rotation={[0, -0.35, 0]}
              arms={[0.4, 0.3]}
              eyes="angry"
              mouth="teeth"
            />
            <BlobShadow position={[1.6, 0, 0.8]} />
            <Legionary
              frame={frame}
              hero
              position={[-1.8, 0, 0.4]}
              rotation={[0, 0.35, 0]}
              arms={[0.3, 0.6]}
              eyes="wide"
              mouth="o"
              brow={-0.2}
            />
            <BlobShadow position={[-1.8, 0, 0.4]} />
            <Rubble position={[3.2, 0, -2.5]} count={6} seed={8} />
            <DangerLight frame={frame} position={[5, 2.4, -3]} intensity={0.8} />
          </>
        ) : (
          cast
        )}
        <Shot frame={f} duration={d} from={[0, 2.0, 15.5]} to={[0, 1.95, 14.8]} look={[0, 6.2, -20]} fov={46} />
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
      <Shot frame={f} duration={d} from={[0, 3.2, 11.5]} to={[0, 3.15, 11]} look={[0, 1.3, -1]} fov={50} />
    </>
  );
};

export const RomeKitTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const mood = romeMood(phaseOf(Math.floor(frame / ROME_TEST_SHOT)));
  return (
    <AbsoluteFill style={{ backgroundColor: mood.background }}>
      <AbsoluteFill style={{ filter: mood.grade }}>
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
