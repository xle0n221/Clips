import { PerspectiveCamera, RoundedBox, Stars } from "@react-three/drei";
import React, { useMemo } from "react";

// Kamera-Abstand fürs Hochformat 9:16 bei 50° vertikalem FOV:
// horizontales Halb-FOV ≈ 14,7° -> ~4,3 Einheiten Radius passen bei ~16 Einheiten.
const CAMERA_DISTANCE = 16;
const CAMERA_HEIGHT = 2;
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * WICHTIG für Remotion + Three.js:
 * Jede Animation muss aus `useCurrentFrame()` berechnet werden – NICHT aus
 * `useFrame()`/`clock.elapsedTime` von React Three Fiber. Nur so ist jedes
 * Frame deterministisch und das gerenderte Video identisch mit der Vorschau.
 * https://www.remotion.dev/docs/three
 */
export const ShapesScene: React.FC<{ readonly accentColor: string }> = ({
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // "Kamerafahrt": Statt die Kamera per useEffect zu bewegen (wirkt erst im
  // nächsten Frame!), dreht sich die ganze Szene – pro Frame deterministisch.
  const orbit = interpolate(frame, [0, durationInFrames], [0, Math.PI * 0.6]);

  // Eingangsanimation (Feder) für das zentrale Objekt.
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const spin = interpolate(frame, [0, durationInFrames], [0, Math.PI * 4]);

  // Satelliten-Würfel auf einer Umlaufbahn.
  const satellites = useMemo(
    () => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2),
    [],
  );

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        position={[0, CAMERA_HEIGHT, CAMERA_DISTANCE]}
        rotation={[-Math.atan(CAMERA_HEIGHT / CAMERA_DISTANCE), 0, 0]}
      />
      <color attach="background" args={["#0b0b1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={2.2} />
      <pointLight position={[-6, -3, -4]} intensity={40} color={accentColor} />

      {/* Statisches Sternenfeld (keine zeitbasierte Animation). */}
      <Stars radius={60} depth={30} count={2500} factor={4} fade speed={0} />

      <group rotation={[0, -orbit, 0]}>
        <mesh scale={enter * 1.6} rotation={[spin * 0.5, spin, 0]}>
          <torusKnotGeometry args={[1, 0.32, 220, 32]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>

        {satellites.map((offset, i) => {
          const angle = offset + spin * 0.5;
          // Satelliten erscheinen nacheinander.
          const s = spring({
            frame: frame - 10 - i * 4,
            fps,
            config: { damping: 200 },
          });
          return (
            <RoundedBox
              key={i}
              args={[0.6, 0.6, 0.6]}
              radius={0.12}
              position={[
                Math.cos(angle) * 3.6,
                Math.sin(angle * 2) * 0.8,
                Math.sin(angle) * 3.6,
              ]}
              rotation={[angle, angle, 0]}
              scale={s}
            >
              <meshStandardMaterial
                color="#ffffff"
                metalness={0.3}
                roughness={0.35}
              />
            </RoundedBox>
          );
        })}
      </group>
    </>
  );
};
