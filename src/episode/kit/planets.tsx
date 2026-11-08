import React from "react";
import { AdditiveBlending, DoubleSide } from "three";
import { Ink, Toon, seeded, useCanvasTexture } from "./toon";

export type PlanetKind =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

type Draw = (c: CanvasRenderingContext2D, w: number, h: number) => void;

const bands =
  (colors: string[], seed: number, wobble = 6): Draw =>
  (c, w, h) => {
    const r = seeded(seed);
    let y = 0;
    let i = 0;
    while (y < h) {
      const bh = 10 + r() * 34;
      c.fillStyle = colors[i % colors.length];
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= w; x += 16)
        c.lineTo(x, y + Math.sin(x * 0.03 + i) * wobble);
      c.lineTo(w, y + bh + wobble);
      c.lineTo(0, y + bh + wobble);
      c.fill();
      y += bh;
      i++;
    }
  };

const blobs = (
  c: CanvasRenderingContext2D,
  r: () => number,
  n: number,
  color: string,
  w: number,
  h: number,
  size: number,
) => {
  c.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = h * 0.15 + r() * h * 0.7;
    const s = size * (0.4 + r());
    c.beginPath();
    c.ellipse(x, y, s * (1 + r()), s, r() * 3, 0, Math.PI * 2);
    c.fill();
  }
};

const DRAW: Record<PlanetKind, Draw> = {
  sun: (c, w, h) => {
    c.fillStyle = "#FFB300";
    c.fillRect(0, 0, w, h);
    blobs(c, seeded(1), 60, "#FFCA28", w, h, 18);
    blobs(c, seeded(2), 30, "#FF8F00", w, h, 10);
  },
  mercury: (c, w, h) => {
    c.fillStyle = "#9E9E9E";
    c.fillRect(0, 0, w, h);
    const r = seeded(3);
    for (let i = 0; i < 70; i++) {
      const x = r() * w;
      const y = r() * h;
      const s = 4 + r() * 16;
      c.fillStyle = "#757575";
      c.beginPath();
      c.arc(x, y, s, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#BDBDBD";
      c.beginPath();
      c.arc(x - s * 0.25, y - s * 0.25, s * 0.6, 0, Math.PI * 2);
      c.fill();
    }
  },
  venus: bands(["#F3D9A4", "#E8C27A", "#F6E3B8", "#DDB060"], 4, 14),
  earth: (c, w, h) => {
    c.fillStyle = "#1E88E5";
    c.fillRect(0, 0, w, h);
    const r = seeded(5);
    blobs(c, r, 14, "#43A047", w, h, 26);
    blobs(c, r, 8, "#7CB342", w, h, 14);
    blobs(c, r, 7, "rgba(255,255,255,0.8)", w, h, 9);
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, w, h * 0.06);
    c.fillRect(0, h * 0.94, w, h * 0.06);
  },
  mars: (c, w, h) => {
    c.fillStyle = "#D84315";
    c.fillRect(0, 0, w, h);
    blobs(c, seeded(6), 26, "#A63A0F", w, h, 18);
    c.fillStyle = "#FBE9E7";
    c.fillRect(0, 0, w, h * 0.05);
  },
  jupiter: (c, w, h) => {
    bands(["#E6C9A8", "#B07D53", "#F2E0C9", "#C9925F", "#8D5B3A"], 7, 8)(
      c,
      w,
      h,
    );
    c.fillStyle = "#C1442B";
    c.beginPath();
    c.ellipse(w * 0.62, h * 0.66, 34, 20, 0, 0, Math.PI * 2);
    c.fill();
  },
  saturn: bands(["#F1DFAF", "#D9BF80", "#EAD39A", "#C7A86A"], 8, 3),
  uranus: bands(["#9BE7EC", "#8ADCE3", "#A8EEF2"], 9, 2),
  neptune: (c, w, h) => {
    bands(["#2F5FD0", "#2952BA", "#3A6BE0"], 10, 4)(c, w, h);
    c.fillStyle = "#1A3A8C";
    c.beginPath();
    c.ellipse(w * 0.4, h * 0.6, 26, 14, 0, 0, Math.PI * 2);
    c.fill();
    blobs(c, seeded(11), 10, "rgba(255,255,255,0.8)", w, h, 6);
  },
};

export const Planet: React.FC<{
  readonly kind: PlanetKind;
  readonly radius?: number;
  readonly position?: [number, number, number];
  readonly spin?: number;
  readonly tilt?: number;
  readonly scale?: number;
}> = ({
  kind,
  radius = 1,
  position = [0, 0, 0],
  spin = 0,
  tilt = 0,
  scale = 1,
}) => {
  const map = useCanvasTexture(`planet-${kind}`, [512, 256], DRAW[kind]);
  const ring = useCanvasTexture(`ring-${kind}`, [512, 512], (c, w) => {
    const r = seeded(12);
    for (let i = 0; i < 80; i++) {
      const rad = (w / 2) * (0.6 + (i / 80) * 0.4);
      c.strokeStyle = `rgba(${200 + r() * 40},${180 + r() * 30},${120 + r() * 40},${0.4 + r() * 0.6})`;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(w / 2, w / 2, rad, 0, Math.PI * 2);
      c.stroke();
    }
  });
  const isSun = kind === "sun";
  const hasRing = kind === "saturn" || kind === "uranus";
  return (
    <group position={position} rotation={[0, 0, tilt]} scale={scale}>
      <mesh rotation={[0, spin, 0]}>
        <sphereGeometry args={[radius, 48, 32]} />
        {isSun ? (
          <meshBasicMaterial map={map} />
        ) : (
          <Toon color="#FFFFFF" map={map} />
        )}
        <Ink f={0.035}>
          <sphereGeometry args={[radius, 48, 32]} />
        </Ink>
      </mesh>
      {isSun &&
        [1.25, 1.6, 2.1].map((s, i) => (
          <mesh key={s} scale={1 + Math.sin(spin * 6 + i) * 0.02}>
            <sphereGeometry args={[radius * s, 32, 16]} />
            <meshBasicMaterial
              color="#FFB300"
              transparent
              opacity={0.16 - i * 0.04}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      {hasRing && (
        <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]}>
          <ringGeometry
            args={[radius * 1.35, radius * (kind === "saturn" ? 2.3 : 1.7), 96]}
          />
          <meshBasicMaterial
            map={ring}
            transparent
            side={DoubleSide}
            opacity={kind === "saturn" ? 1 : 0.45}
            color={kind === "saturn" ? "#FFFFFF" : "#B2EBF2"}
          />
        </mesh>
      )}
    </group>
  );
};
