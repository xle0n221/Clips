import React, { useMemo } from "react";
import { AdditiveBlending } from "three";
import { Ink, Toon, seeded } from "./toon";

type P3 = [number, number, number];

/** Explosion/Trümmer: Teile fliegen ab `start` (Frame) aus `origin` weg, mit Schwerkraft. */
export const Burst: React.FC<{
  readonly frame: number;
  readonly start: number;
  readonly origin: P3;
  readonly count?: number;
  readonly colors?: string[];
  readonly speed?: number;
  readonly gravity?: number;
  readonly size?: number;
  readonly seed?: number;
  readonly shape?: "box" | "rock";
}> = ({
  frame,
  start,
  origin,
  count = 24,
  colors = ["#FFD54F", "#FF7043", "#FFFFFF"],
  speed = 0.18,
  gravity = 0.006,
  size = 0.15,
  seed = 1,
  shape = "box",
}) => {
  const parts = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => {
      const a = r() * Math.PI * 2;
      const up = 0.3 + r();
      return {
        v: [Math.cos(a) * (0.5 + r()), up, Math.sin(a) * (0.5 + r())] as P3,
        spin: (r() - 0.5) * 0.6,
        c: colors[Math.floor(r() * colors.length)],
        s: size * (0.5 + r()),
      };
    });
  }, [count, colors, seed, size]);
  const t = frame - start;
  if (t < 0) return null;
  return (
    <group position={origin}>
      {parts.map((p, i) => (
        <mesh
          key={i}
          position={[
            p.v[0] * speed * t,
            p.v[1] * speed * t - gravity * t * t,
            p.v[2] * speed * t,
          ]}
          rotation={[p.spin * t, p.spin * t * 0.7, 0]}
          scale={Math.max(0, 1 - t / 70) * p.s}
        >
          {shape === "rock" ? (
            <dodecahedronGeometry args={[1, 0]} />
          ) : (
            <boxGeometry args={[1, 0.6, 0.15]} />
          )}
          <Toon color={p.c} />
          {shape === "rock" ? (
            <Ink f={0.08}>
              <dodecahedronGeometry args={[1, 0]} />
            </Ink>
          ) : null}
        </mesh>
      ))}
    </group>
  );
};

/** Fliegende Geschwindigkeitslinien (Wind, Tempo). */
export const SpeedLines: React.FC<{
  readonly frame: number;
  readonly count?: number;
  readonly area?: [number, number, number];
  readonly speed?: number;
  readonly color?: string;
  readonly direction?: 1 | -1;
}> = ({
  frame,
  count = 40,
  area = [30, 16, 10],
  speed = 0.9,
  color = "#FFFFFF",
  direction = 1,
}) => {
  const lines = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: count }, () => ({
      x: r() * area[0],
      y: (r() - 0.5) * area[1],
      z: (r() - 0.5) * area[2],
      len: 1 + r() * 3,
      v: 0.6 + r(),
    }));
  }, [count, area]);
  return (
    <group>
      {lines.map((l, i) => {
        const x = ((l.x + frame * speed * l.v) % area[0]) - area[0] / 2;
        return (
          <mesh
            key={i}
            position={[direction * x, l.y, l.z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.025, 0.025, l.len, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Leuchtender Lichtstrahl von a nach b, der sich mit `progress` (0..1) ausbreitet. */
export const Beam: React.FC<{
  readonly from: P3;
  readonly to: P3;
  readonly progress: number;
  readonly color?: string;
  readonly width?: number;
}> = ({ from, to, progress, color = "#FFF59D", width = 0.18 }) => {
  const d: P3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const len = Math.hypot(...d);
  const p = Math.max(0.001, Math.min(1, progress));
  const angleZ = Math.atan2(d[1], d[0]) - Math.PI / 2;
  return (
    <group position={from} rotation={[0, 0, angleZ]}>
      {[1, 2.6].map((w, i) => (
        <mesh key={w} position={[0, (len * p) / 2, 0]}>
          <cylinderGeometry args={[width * w, width * w, len * p, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={i ? 0.25 : 1}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Weiches Leuchten (z. B. hinter Figuren, Lichtquellen). */
export const Glow: React.FC<{
  readonly position: P3;
  readonly radius: number;
  readonly color: string;
  readonly intensity?: number;
}> = ({ position, radius, color, intensity = 1 }) => (
  <group position={position}>
    {[1, 1.6, 2.4].map((s, i) => (
      <mesh key={s}>
        <sphereGeometry args={[radius * s, 24, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={(0.3 - i * 0.08) * intensity}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    ))}
  </group>
);

/** Konfetti, fällt ab `start`. */
export const Confetti: React.FC<{
  readonly frame: number;
  readonly start: number;
  readonly origin?: P3;
}> = ({ frame, start, origin = [0, 7, 0] }) => (
  <Burst
    frame={frame}
    start={start}
    origin={origin}
    count={60}
    speed={0.12}
    gravity={0.004}
    size={0.18}
    colors={["#FF4081", "#FFEB3B", "#40C4FF", "#69F0AE", "#FFFFFF"]}
    seed={9}
  />
);
