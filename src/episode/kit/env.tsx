import { Stars } from "@react-three/drei";
import React from "react";
import { AdditiveBlending, BackSide, DoubleSide } from "three";
import { INK, Ink, Toon, seeded, useCanvasTexture } from "./toon";

/** Weltraum: Farbverlauf-Kuppel + statisches Sternenfeld. */
export const Space: React.FC<{
  readonly top?: string;
  readonly bottom?: string;
}> = ({ top = "#0B1035", bottom = "#3B1C5A" }) => {
  const tex = useCanvasTexture(`sky-${top}-${bottom}`, [8, 256], (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[300, 32, 16]} />
        <meshBasicMaterial map={tex} side={BackSide} depthWrite={false} />
      </mesh>
      <Stars radius={120} depth={60} count={3000} factor={5} fade speed={0} />
    </>
  );
};

/** Himmel über einer Planetenoberfläche (Verlauf, keine Sterne). */
export const Sky: React.FC<{
  readonly top: string;
  readonly bottom: string;
}> = ({ top, bottom }) => {
  const tex = useCanvasTexture(`sky2-${top}-${bottom}`, [8, 256], (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(0.55, bottom);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  return (
    <mesh>
      <sphereGeometry args={[300, 32, 16]} />
      <meshBasicMaterial map={tex} side={BackSide} depthWrite={false} />
    </mesh>
  );
};

/** Boden mit Fliesen-/Fleckenmuster und optional glühenden Rissen. */
export const Ground: React.FC<{
  readonly color: string;
  readonly spots?: string;
  readonly cracks?: number; // 0..1 Leuchtstärke der Risse
  readonly size?: number;
  readonly tiles?: boolean;
}> = ({ color, spots, cracks = 0, size = 80, tiles = false }) => {
  const tex = useCanvasTexture(
    `ground-${color}-${spots}-${tiles}`,
    [1024, 1024],
    (c, w, h) => {
      c.fillStyle = color;
      c.fillRect(0, 0, w, h);
      const r = seeded(21);
      if (tiles) {
        c.strokeStyle = "rgba(0,0,0,0.18)";
        c.lineWidth = 4;
        for (let i = 0; i <= 16; i++) {
          c.beginPath();
          c.moveTo((i * w) / 16, 0);
          c.lineTo((i * w) / 16, h);
          c.moveTo(0, (i * h) / 16);
          c.lineTo(w, (i * h) / 16);
          c.stroke();
        }
      }
      if (spots) {
        c.fillStyle = spots;
        for (let i = 0; i < 160; i++) {
          c.beginPath();
          c.ellipse(
            r() * w,
            r() * h,
            4 + r() * 18,
            3 + r() * 10,
            r() * 3,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
      }
    },
  );
  const crackTex = useCanvasTexture("cracks", [1024, 1024], (c, w, h) => {
    const r = seeded(33);
    c.strokeStyle = "#FFFFFF";
    c.lineCap = "round";
    for (let k = 0; k < 9; k++) {
      let x = w / 2;
      let y = h / 2;
      let a = (k / 9) * Math.PI * 2 + r();
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(x, y);
      for (let i = 0; i < 14; i++) {
        a += (r() - 0.5) * 0.9;
        x += Math.cos(a) * 32;
        y += Math.sin(a) * 32;
        c.lineTo(x, y);
        c.lineWidth = Math.max(2, 9 - i * 0.5);
      }
      c.stroke();
    }
  });
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow>
        <planeGeometry args={[size, size]} />
        <Toon color="#FFFFFF" map={tex} />
      </mesh>
      {cracks > 0 && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[14, 14]} />
          <meshBasicMaterial
            map={crackTex}
            color="#FF3D00"
            transparent
            opacity={cracks}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

/** Einfacher Felsbrocken / Kiste mit Kontur. */
export const Rock: React.FC<{
  readonly position: [number, number, number];
  readonly size?: number;
  readonly color?: string;
  readonly rotation?: [number, number, number];
}> = ({
  position,
  size = 0.5,
  color = "#8D6E63",
  rotation = [0.3, 0.6, 0.1],
}) => (
  <mesh position={position} rotation={rotation} castShadow>
    <dodecahedronGeometry args={[size, 0]} />
    <Toon color={color} />
    <Ink f={0.042}>
      <dodecahedronGeometry args={[size, 0]} />
    </Ink>
  </mesh>
);

/** Ein Objekt mit Kontur – Kurzform für eigene Requisiten. */
export const Prop: React.FC<{
  readonly children: React.ReactNode;
  readonly color: string;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: number | [number, number, number];
  readonly ink?: number;
  readonly emissive?: number;
}> = ({
  children,
  color,
  position,
  rotation,
  scale,
  ink = 0.03,
  emissive = 0,
}) => (
  <mesh position={position} rotation={rotation} scale={scale} castShadow>
    {children}
    <Toon color={color} emissive={color} emissiveIntensity={emissive} />
    {ink > 0 ? <Ink f={ink * 1.4}>{children}</Ink> : null}
  </mesh>
);

export const InkLine: React.FC<{
  readonly from: [number, number, number];
  readonly length: number;
  readonly rotation?: [number, number, number];
  readonly width?: number;
}> = ({ from, length, rotation = [0, 0, 0], width = 0.05 }) => (
  <group position={from} rotation={rotation}>
    <mesh position={[0, length / 2, 0]}>
      <cylinderGeometry args={[width, width, length, 6]} />
      <meshBasicMaterial color={INK} />
    </mesh>
  </group>
);
