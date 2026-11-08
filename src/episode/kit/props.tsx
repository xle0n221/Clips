import React from "react";
import { DoubleSide } from "three";
import { Ink, Toon, useCanvasTexture } from "./toon";
import { Glow } from "./fx";

type P3 = [number, number, number];

/** Licht-Setup: weiches Umgebungslicht + hartes "Sonnenlicht" mit Schatten (wie in den Referenzen). */
export const Lights: React.FC<{
  readonly sun?: P3;
  readonly intensity?: number;
  readonly color?: string;
  readonly ambient?: number;
  readonly sky?: string;
  readonly ground?: string;
}> = ({
  sun = [6, 10, 6],
  intensity = 2.6,
  color = "#FFFFFF",
  ambient = 0.9,
  sky = "#BBDEFB",
  ground = "#5D4037",
}) => (
  <>
    <hemisphereLight args={[sky, ground, ambient]} />
    <directionalLight
      position={sun}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-15}
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15}
    />
  </>
);

/** Schatten-Klecks unter Figuren (Cartoon-Kontaktschatten). */
export const BlobShadow: React.FC<{
  readonly position: P3;
  readonly size?: number;
}> = ({ position, size = 0.9 }) => (
  <mesh
    position={[position[0], position[1] + 0.02, position[2]]}
    rotation={[-Math.PI / 2, 0, 0]}
  >
    <circleGeometry args={[size, 32]} />
    <meshBasicMaterial
      color="#000000"
      transparent
      opacity={0.28}
      depthWrite={false}
    />
  </mesh>
);

/** Rakete. `flame` 0..1 = Triebwerksflamme. */
export const Rocket: React.FC<{
  readonly frame: number;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly flame?: number;
}> = ({ frame, position, rotation, scale = 1, flame = 0 }) => {
  const flick = 1 + Math.sin(frame * 1.7) * 0.12 + Math.sin(frame * 3.1) * 0.06;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 3.4, 32]} />
        <Toon color="#F5F5F5" />
        <Ink f={0.07}>
          <cylinderGeometry args={[0.8, 0.9, 3.4, 32]} />
        </Ink>
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <coneGeometry args={[0.8, 1.6, 32]} />
        <Toon color="#E53935" />
        <Ink f={0.07}>
          <coneGeometry args={[0.8, 1.6, 32]} />
        </Ink>
      </mesh>
      <mesh position={[0, 2.6, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.1, 24]} />
        <Toon color="#4FC3F7" emissive="#4FC3F7" emissiveIntensity={0.25} />
        <Ink f={0.056}>
          <cylinderGeometry args={[0.36, 0.36, 0.1, 24]} />
        </Ink>
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i * Math.PI * 2) / 3) * 0.9,
            0.6,
            Math.cos((i * Math.PI * 2) / 3) * 0.9,
          ]}
          rotation={[0, (i * Math.PI * 2) / 3, 0]}
          castShadow
        >
          <boxGeometry args={[0.12, 1.2, 0.8]} />
          <Toon color="#E53935" />
          <Ink f={0.056}>
            <boxGeometry args={[0.12, 1.2, 0.8]} />
          </Ink>
        </mesh>
      ))}
      {flame > 0 && (
        <group position={[0, 0.1, 0]} scale={[flame, flame * flick, flame]}>
          <mesh position={[0, -0.9, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.6, 1.9, 24]} />
            <meshBasicMaterial color="#FF9100" />
          </mesh>
          <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.35, 1.1, 24]} />
            <meshBasicMaterial color="#FFF59D" />
          </mesh>
          <Glow
            position={[0, -0.8, 0]}
            radius={0.8}
            color="#FF9100"
            intensity={0.9}
          />
        </group>
      )}
    </group>
  );
};

/** Büro-Kulisse: Boden, Rückwand mit Fenster, Schreibtisch. */
export const Office: React.FC = () => {
  const wall = useCanvasTexture("office-wall", [512, 512], (c, w, h) => {
    c.fillStyle = "#90A4AE";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#78909C";
    c.fillRect(0, h * 0.62, w, h * 0.38);
    c.strokeStyle = "rgba(0,0,0,0.12)";
    c.lineWidth = 3;
    for (let y = 0; y < h * 0.62; y += 32) {
      for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64)
        c.strokeRect(x, y, 64, 32);
    }
  });
  return (
    <group>
      <mesh position={[0, 5, -4]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <Toon color="#FFFFFF" map={wall} />
      </mesh>
      {/* Fenster mit Lichteinfall */}
      <mesh position={[3.5, 5.5, -3.95]}>
        <planeGeometry args={[4, 3]} />
        <meshBasicMaterial color="#E3F2FD" />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[3.5 + i * 1.33, 5.5, -3.9]}>
          <boxGeometry args={[0.1, 3, 0.05]} />
          <meshBasicMaterial color="#263238" />
        </mesh>
      ))}
      {/* Schreibtisch */}
      <mesh position={[0, 1.4, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.25, 1.8]} />
        <Toon color="#8D6E63" />
        <Ink f={0.042}>
          <boxGeometry args={[4.4, 0.25, 1.8]} />
        </Ink>
      </mesh>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, 0.65, -1.2]} castShadow>
          <boxGeometry args={[0.25, 1.3, 1.6]} />
          <Toon color="#6D4C41" />
          <Ink f={0.042}>
            <boxGeometry args={[0.25, 1.3, 1.6]} />
          </Ink>
        </mesh>
      ))}
    </group>
  );
};

/** Whiteboard/Schild mit gezeichneter Beschriftung (Canvas-Textur). */
export const Board: React.FC<{
  readonly lines: string[];
  readonly position: P3;
  readonly rotation?: P3;
  readonly size?: [number, number];
  readonly bg?: string;
  readonly ink?: string;
}> = ({
  lines,
  position,
  rotation,
  size = [4, 2.6],
  bg = "#FAFAFA",
  ink = "#1E3A8A",
}) => {
  const tex = useCanvasTexture(
    `board-${lines.join("|")}-${bg}`,
    [1024, 666],
    (c, w, h) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);
      c.fillStyle = ink;
      c.textAlign = "center";
      c.textBaseline = "middle";
      const fs = Math.min(150, (h * 0.8) / lines.length);
      c.font = `900 ${fs}px Montserrat, sans-serif`;
      lines.forEach((l, i) =>
        c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1),
      );
    },
  );
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.2, size[1] + 0.2, 0.12]} />
        <Toon color="#455A64" />
        <Ink f={0.042}>
          <boxGeometry args={[size[0] + 0.2, size[1] + 0.2, 0.12]} />
        </Ink>
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={tex} side={DoubleSide} />
      </mesh>
    </group>
  );
};

export const Cake: React.FC<{
  readonly frame: number;
  readonly position: P3;
  readonly lit?: boolean;
}> = ({ frame, position, lit = true }) => (
  <group position={position}>
    <mesh position={[0, 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.7, 0.7, 0.7, 32]} />
      <Toon color="#F48FB1" />
      <Ink f={0.042}>
        <cylinderGeometry args={[0.7, 0.7, 0.7, 32]} />
      </Ink>
    </mesh>
    <mesh position={[0, 0.72, 0]}>
      <cylinderGeometry args={[0.72, 0.72, 0.06, 32]} />
      <Toon color="#FFFFFF" />
    </mesh>
    {[-0.3, 0, 0.3].map((x) => (
      <group key={x} position={[x, 0.95, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <Toon color="#4FC3F7" />
        </mesh>
        {lit && (
          <mesh
            position={[0, 0.3, 0]}
            scale={[1, 1 + Math.sin(frame * 0.9 + x * 9) * 0.2, 1]}
          >
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshBasicMaterial color="#FFCA28" />
          </mesh>
        )}
      </group>
    ))}
  </group>
);

export const Thermometer: React.FC<{
  readonly level: number;
  readonly position: P3;
  readonly scale?: number;
}> = ({ level, position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 2, 0]}>
      <capsuleGeometry args={[0.32, 3.6, 8, 16]} />
      <meshToonMaterial color="#FFFFFF" transparent opacity={0.55} />
      <Ink f={0.056}>
        <capsuleGeometry args={[0.32, 3.6, 8, 16]} />
      </Ink>
    </mesh>
    <mesh position={[0, 0.1, 0]}>
      <sphereGeometry args={[0.55, 24, 16]} />
      <Toon color="#FF1744" emissive="#FF1744" emissiveIntensity={0.4} />
      <Ink f={0.056}>
        <sphereGeometry args={[0.55, 24, 16]} />
      </Ink>
    </mesh>
    <mesh position={[0, 0.3 + (3.6 * Math.min(1.05, level)) / 2, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 3.6 * Math.min(1.05, level), 12]} />
      <Toon color="#FF1744" emissive="#FF1744" emissiveIntensity={0.4} />
    </mesh>
  </group>
);

export const House: React.FC<{
  readonly position: P3;
  readonly scale?: number;
}> = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[1.4, 1.2, 1.2]} />
      <Toon color="#FFF3E0" />
      <Ink f={0.056}>
        <boxGeometry args={[1.4, 1.2, 1.2]} />
      </Ink>
    </mesh>
    <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[1.2, 0.8, 4]} />
      <Toon color="#D84315" />
      <Ink f={0.056}>
        <coneGeometry args={[1.2, 0.8, 4]} />
      </Ink>
    </mesh>
    <mesh position={[0, 0.4, 0.61]}>
      <planeGeometry args={[0.35, 0.7]} />
      <meshBasicMaterial color="#5D4037" />
    </mesh>
  </group>
);
