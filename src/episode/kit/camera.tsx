import { PerspectiveCamera } from "@react-three/drei";
import React, { createContext, useContext } from "react";
import { Euler, Matrix4, Vector3 } from "three";
import { Easing, interpolate } from "remotion";

export type V3 = [number, number, number];

const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/**
 * Zusatz-Bewegung der Kamera, die ein Übergang (kit/transitions.tsx) über alle Szenen legt:
 * `yaw` = Schwenk (rad, + = nach links), `push` = Anteil der Strecke Kamera→Blickziel nach vorn,
 * `roll` = Kippen (rad), `fov` = Faktor. Standard = keine Änderung.
 */
export type CameraRig = {
  readonly yaw: number;
  readonly push: number;
  readonly roll: number;
  readonly fov: number;
};
export const NO_RIG: CameraRig = { yaw: 0, push: 0, roll: 0, fov: 1 };
export const CameraRigContext = createContext<CameraRig>(NO_RIG);

export type ShotEase = "smooth" | "linear" | "in" | "out" | "inOut" | "snap";
const EASES: Record<ShotEase, (t: number) => number> = {
  smooth: Easing.bezier(0.33, 0, 0.2, 1), // bisherige Standardkurve
  linear: (t) => t,
  in: Easing.bezier(0.55, 0, 0.9, 0.45),
  out: Easing.bezier(0.1, 0.65, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  snap: Easing.bezier(0.8, 0, 0.1, 1),
};

export type ShotProps = {
  readonly frame: number;
  readonly duration: number;
  readonly from: V3;
  readonly to?: V3;
  readonly look: V3;
  readonly lookTo?: V3;
  readonly fov?: number;
  readonly shake?: number;
  readonly punch?: number; // Frame, an dem ein kurzer Zoom-Stoß passiert
  /* --- Erweiterungen (alle optional; ohne sie exakt das alte Verhalten) --- */
  /** Kurve der Fahrt (Standard „smooth“ = bisherige Kurve). */
  readonly ease?: ShotEase;
  /** Fahrt nur zwischen diesen lokalen Frames (Standard [0, duration]). */
  readonly span?: readonly [number, number];
  /** Antizipation: Kamera holt vor der Fahrt um diesen Anteil der Strecke aus (z. B. 0.08). */
  readonly anticipate?: number;
  /** Frames des Ausholens (Standard 5). */
  readonly anticipateFrames?: number;
  /** Kreisfahrt um `center` (ersetzt from/to). 0° = vor dem Zentrum (+z), + = gegen den Uhrzeigersinn von oben. */
  readonly orbit?: {
    readonly center: V3;
    readonly radius: number;
    readonly fromDeg: number;
    readonly toDeg: number;
    readonly height?: number;
    readonly heightTo?: number;
  };
  /** Dolly-Zoom (Vertigo): fov fährt von `fov` nach `fovTo`, Abstand so, dass das Bild am Blickziel gleich hoch bleibt. */
  readonly fovTo?: number;
  readonly dollyZoom?: boolean;
};

/** Antizipations-Kurve: 0 → −a in k (Anteil), dann eased nach 1. */
const anticipated = (u: number, a: number, k: number, ease: (t: number) => number) => {
  if (u <= 0) return 0;
  if (u < k) return -a * Math.sin(((u / k) * Math.PI) / 2);
  return -a + (1 + a) * ease((u - k) / (1 - k));
};

/**
 * Kamerastellung einer Einstellung zum Frame (ohne Übergangs-Rig) – nützlich für Vordergrund-
 * Ebenen (`Foreground`) oder Match-Cut-Prüfung (`screenOf`).
 */
export const shotPose = (p: ShotProps) => {
  const {
    frame,
    duration,
    from,
    to,
    look,
    lookTo,
    fov = 45,
    shake = 0.04,
    ease = "smooth",
    span,
    anticipate,
    anticipateFrames = 5,
    orbit,
    fovTo,
    dollyZoom,
  } = p;
  const s0 = span ? span[0] : 0;
  const s1 = span ? span[1] : duration;
  let t: number;
  if (anticipate) {
    const len = Math.max(1, s1 - s0);
    const u = Math.min(1, Math.max(0, (frame - s0) / len));
    t = anticipated(u, anticipate, Math.min(0.5, anticipateFrames / len), EASES[ease]);
  } else {
    t = interpolate(frame, [s0, Math.max(s0 + 1, s1)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASES[ease],
    });
  }
  let pos: V3;
  if (orbit) {
    const deg = orbit.fromDeg + (orbit.toDeg - orbit.fromDeg) * t;
    const a = (deg * Math.PI) / 180;
    const h0 = orbit.height ?? 0;
    const h = h0 + ((orbit.heightTo ?? h0) - h0) * t;
    pos = [
      orbit.center[0] + Math.sin(a) * orbit.radius,
      orbit.center[1] + h,
      orbit.center[2] + Math.cos(a) * orbit.radius,
    ];
  } else {
    pos = lerp3(from, to ?? from, t);
  }
  const target = lerp3(look, lookTo ?? look, t);
  let fovNow = fov;
  if (fovTo !== undefined) {
    fovNow = fov + (fovTo - fov) * t;
    if (dollyZoom) {
      // Bildhöhe am Ziel aus Startabstand + Start-fov; Abstand je Frame daraus
      const d0 = Math.hypot(from[0] - look[0], from[1] - look[1], from[2] - look[2]);
      const H = 2 * d0 * Math.tan(((fov / 2) * Math.PI) / 180);
      const d = H / (2 * Math.tan(((fovNow / 2) * Math.PI) / 180));
      const dir = [pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]];
      const l = Math.hypot(dir[0], dir[1], dir[2]) || 1;
      pos = [
        target[0] + (dir[0] / l) * d,
        target[1] + (dir[1] / l) * d,
        target[2] + (dir[2] / l) * d,
      ];
    }
  }
  const s = shake;
  pos[0] += Math.sin(frame * 0.13) * s + Math.sin(frame * 0.37) * s * 0.4;
  pos[1] += Math.sin(frame * 0.11 + 1.3) * s * 0.8;
  return { pos, target, fov: fovNow };
};

/**
 * Kamera einer Einstellung. Position/Blickziel werden in jedem Render aus dem
 * Frame berechnet (kein useEffect) -> jedes Frame ist deterministisch.
 * `shake` = Stärke der Handkamera-Bewegung (wie in den Referenzvideos: nie ganz still).
 * Übergänge (kit/transitions.tsx) wirken über `CameraRigContext` zusätzlich (Standard: nichts).
 */
export const Shot: React.FC<ShotProps> = (props) => {
  const { frame, punch } = props;
  const rig = useContext(CameraRigContext);
  const { pos, target, fov } = shotPose(props);
  let tgt = target;
  if (rig.push) {
    for (let k = 0; k < 3; k++) pos[k] += (target[k] - pos[k]) * rig.push;
  }
  if (rig.yaw) {
    const dx = target[0] - pos[0];
    const dz = target[2] - pos[2];
    const c = Math.cos(rig.yaw);
    const sn = Math.sin(rig.yaw);
    tgt = [pos[0] + dx * c + dz * sn, target[1], pos[2] - dx * sn + dz * c];
  }
  const m = new Matrix4().lookAt(
    new Vector3(...pos),
    new Vector3(...tgt),
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
      fov={fov * (1 - 0.12 * punchAmt) * rig.fov}
      near={0.05}
      far={600}
      position={pos}
      rotation={rig.roll ? [rot.x, rot.y, rot.z + rig.roll] : [rot.x, rot.y, rot.z]}
    />
  );
};
