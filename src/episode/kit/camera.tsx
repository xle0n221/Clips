import { PerspectiveCamera } from "@react-three/drei";
import React from "react";
import { Euler, Matrix4, Vector3 } from "three";
import { Easing, interpolate } from "remotion";

export type V3 = [number, number, number];

const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/**
 * Kamera einer Einstellung. Position/Blickziel werden in jedem Render aus dem
 * Frame berechnet (kein useEffect) -> jedes Frame ist deterministisch.
 * `shake` = Stärke der Handkamera-Bewegung (wie in den Referenzvideos: nie ganz still).
 */
export const Shot: React.FC<{
  readonly frame: number;
  readonly duration: number;
  readonly from: V3;
  readonly to?: V3;
  readonly look: V3;
  readonly lookTo?: V3;
  readonly fov?: number;
  readonly shake?: number;
  readonly punch?: number; // Frame, an dem ein kurzer Zoom-Stoß passiert
}> = ({
  frame,
  duration,
  from,
  to,
  look,
  lookTo,
  fov = 45,
  shake = 0.04,
  punch,
}) => {
  const t = interpolate(frame, [0, Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });
  const pos = lerp3(from, to ?? from, t);
  const target = lerp3(look, lookTo ?? look, t);
  const s = shake;
  pos[0] += Math.sin(frame * 0.13) * s + Math.sin(frame * 0.37) * s * 0.4;
  pos[1] += Math.sin(frame * 0.11 + 1.3) * s * 0.8;
  const m = new Matrix4().lookAt(
    new Vector3(...pos),
    new Vector3(...target),
    new Vector3(0, 1, 0),
  );
  const rot = new Euler().setFromRotationMatrix(m);
  const punchAmt =
    punch === undefined
      ? 0
      : interpolate(frame - punch, [0, 3, 12], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <PerspectiveCamera
      makeDefault
      fov={fov * (1 - 0.12 * punchAmt)}
      near={0.05}
      far={600}
      position={pos}
      rotation={[rot.x, rot.y, rot.z]}
    />
  );
};
