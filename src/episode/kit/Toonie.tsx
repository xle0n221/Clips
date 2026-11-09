import React from "react";
import { blinkAt } from "./motion";
import { INK, Ink, Toon, useCanvasTexture, useGhost } from "./toon";

/** `squint` = zugekniffen („> <“). */
export type Eyes = "dot" | "happy" | "wide" | "angry" | "glow" | "closed" | "squint";
/** `clench` = gefletschte Zähne (Zahnreihe mit Rand), `beam` = breites Grinsen mit Zähnen, `smirk` = schiefes Grinsen. */
export type Mouth = "smile" | "o" | "flat" | "grin" | "frown" | "teeth" | "clench" | "beam" | "smirk";

export type ToonieProps = {
  readonly frame: number;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: number;
  readonly eyes?: Eyes;
  readonly mouth?: Mouth;
  readonly brow?: number; // Neigung der Augenbrauen (+ = böse, - = traurig/überrascht)
  readonly blush?: boolean;
  readonly sweat?: boolean;
  readonly suit?: string;
  readonly skin?: string;
  readonly antenna?: boolean;
  readonly cap?: string | null;
  readonly tie?: string | null;
  readonly partyHat?: boolean;
  readonly sunglasses?: boolean;
  readonly arms?: [number, number]; // Winkel links/rechts (0 = hängt, PI = nach oben)
  readonly walk?: number; // Laufgeschwindigkeit (0 = steht)
  readonly bounce?: number; // Hüpfen beim Sprechen/Freuen
  readonly look?: number; // Kopfdrehung (rad)
  /**
   * Kostüm-Steckplätze (optional, ohne sie ändert sich nichts):
   * `head`  – in der Kopfgruppe: Ursprung = Kopfmitte, Radius 1, Gesicht zeigt nach +z.
   * `body`  – in der Figurengruppe: Ursprung = Boden zwischen den Füßen, Körpermitte y = 1.75
   *           (Kapsel r = 0.55, Höhe 0.925–2.575), Schultern y ≈ 2.15.
   * `hands` – [Hand bei −x, Hand bei +x] (Figur blickt zur Kamera: [Bild links, Bild rechts]
   *           = [rechte, linke Hand der Figur]). Ursprung = Handmitte, dreht mit dem Arm.
   * `sit`   – 0..1 Sitzen (z. B. auf dem Thron): Oberschenkel nach vorn, Unterschenkel hängt
   *           am Knie. Sitzfläche auf Hüfthöhe y ≈ 1.15 (Figur also um Sitzhöhe − 1.15 anheben).
   *           Bei 0 exakt die bisherigen Stehbeine.
   */
  readonly head?: React.ReactNode;
  readonly body?: React.ReactNode;
  readonly hands?: readonly [React.ReactNode?, React.ReactNode?];
  readonly sit?: number;
  /**
   * Bewegungs-Bausteine (kit/motion.tsx, design-system.md §10). Alle optional; ohne sie
   * zeichnet die Figur exakt wie bisher.
   * `blinkSeed` – eigener Blinzel-Takt je Figur (2–5 s, gelegentlich doppelt) statt `frame % 95`.
   * `talk`      – Mundöffnung 0..1 (z. B. `talkFromCaptions`); unter 0,08 gilt `mouth`.
   * `squash`    – Squash & Stretch, volumen-erhaltend ab Fußpunkt (1 = normal, `hop()`).
   * `drag`      – Follow-through (rad, `followThrough()`): Antenne, Krawatte, Kappe, Arme, Kopf schwingen nach.
   * `eyePop`    – Augen-Größe (1 = normal; Reaktions-Großaufnahme z. B. 1,8 mit `eyes="wide"`).
   */
  readonly blinkSeed?: number;
  readonly talk?: number;
  readonly squash?: number;
  readonly drag?: number;
  readonly eyePop?: number;
  /**
   * Ausdrucks-Set (referenz-analyse-4.md Technik 6). Optional, ohne sie unverändert.
   * `sweatDrop` – großer Comic-Schweißtropfen an der Schläfe (0..1 = Größe; rutscht langsam).
   * `stress`    – Stress-Striche neben dem Kopf (0..1 = Länge; pulsieren mit `frame`).
   * Dazu `eyes="squint"`, `mouth="clench" | "beam" | "smirk"`.
   */
  readonly sweatDrop?: number;
  readonly stress?: number;
};

const R = 1; // Kopfradius
const HEAD_Y = 3.05;

// Punkt auf der Kopfoberfläche (Gesicht zeigt nach +z)
const face = (x: number, y: number, lift = 0.02): [number, number, number] => [
  x,
  y,
  Math.sqrt(Math.max(0, R * R - x * x - y * y)) + lift,
];

/** Schwarzes Linien-Material; im Nachbild-Modus (GhostContext) in Geisterfarbe. */
const InkMat: React.FC = () => {
  const ghost = useGhost();
  return ghost ? (
    <meshBasicMaterial color={ghost.color} transparent opacity={ghost.opacity} depthWrite={false} />
  ) : (
    <meshBasicMaterial color={INK} />
  );
};

const Arc: React.FC<{
  readonly pos: [number, number, number];
  readonly radius: number;
  readonly up?: boolean;
  readonly tube?: number;
}> = ({ pos, radius, up, tube = 0.032 }) =>
  useGhost() ? null : (
    <mesh position={pos} rotation={[0, 0, up ? 0 : Math.PI]}>
      <torusGeometry args={[radius, tube, 8, 20, Math.PI]} />
      <InkMat />
    </mesh>
  );

const Blob: React.FC<{
  readonly pos: [number, number, number];
  readonly s: [number, number, number];
  readonly color?: string;
}> = ({ pos, s, color = INK }) =>
  useGhost() ? null : (
    <mesh position={pos} scale={s}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );

/* ---------- Ausdrucks-Teile (auch für FaceOn). Koordinaten im Gesichts-Raum, +z = nach vorn. ---------- */

/** Zugekniffenes Auge „>“ bzw. „<“ (side −1 = Bild links). */
const SquintEye: React.FC<{ readonly pos: [number, number, number]; readonly side: number }> = ({ pos, side }) =>
  useGhost() ? null : (
    <group position={pos}>
      {[1, -1].map((v) => (
        <mesh key={v} position={[-side * 0.05, v * 0.055, 0]} rotation={[0, 0, side * v * 0.5]}>
          <boxGeometry args={[0.22, 0.05, 0.03]} />
          <InkMat />
        </mesh>
      ))}
    </group>
  );

/** Gefletschte Zähne: weiße Zahnreihe mit INK-Rand, Mittellinie und Zahnlücken. */
const ClenchMouth: React.FC<{ readonly pos: [number, number, number]; readonly w?: number }> = ({ pos, w = 0.46 }) =>
  useGhost() ? null : (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[w + 0.06, 0.26, 0.02]} />
        <InkMat />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[w, 0.2, 0.02]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[w, 0.022, 0.01]} />
        <InkMat />
      </mesh>
      {[-2, -1, 0, 1, 2].map((k) => (
        <mesh key={k} position={[(k * w) / 6, 0, 0.025]}>
          <boxGeometry args={[0.02, 0.2, 0.01]} />
          <InkMat />
        </mesh>
      ))}
    </group>
  );

/** Breites Grinsen: Halbscheibe in INK, oben weiße Zahnreihe, unten rote Zunge. */
const BeamMouth: React.FC<{ readonly pos: [number, number, number] }> = ({ pos }) =>
  useGhost() ? null : (
    <group position={pos}>
      <mesh rotation={[0, 0, Math.PI]}>
        <circleGeometry args={[0.3, 24, 0, Math.PI]} />
        <InkMat />
      </mesh>
      <mesh position={[0, -0.045, 0.01]}>
        <boxGeometry args={[0.46, 0.07, 0.01]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, -0.2, 0.01]} scale={[1, 0.55, 1]}>
        <circleGeometry args={[0.13, 16]} />
        <meshBasicMaterial color="#E85A6B" />
      </mesh>
    </group>
  );

/** Schiefes Grinsen: gekippter Bogen + Grübchen-Strich. */
const SmirkMouth: React.FC<{ readonly pos: [number, number, number] }> = ({ pos }) =>
  useGhost() ? null : (
    <group position={pos}>
      <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI + 0.35]}>
        <torusGeometry args={[0.17, 0.032, 8, 20, Math.PI * 0.8]} />
        <InkMat />
      </mesh>
      <mesh position={[0.24, 0.06, 0]} rotation={[0, 0, 0.9]}>
        <boxGeometry args={[0.09, 0.03, 0.02]} />
        <InkMat />
      </mesh>
    </group>
  );

/** Comic-Schweißtropfen (Kugel + Spitze, hellblau mit INK-Rand und Glanzpunkt). */
export const SweatDrop: React.FC<{
  readonly position: [number, number, number];
  readonly size?: number;
  readonly frame?: number;
}> = ({ position, size = 1, frame = 0 }) => {
  if (useGhost() || size <= 0.01) return null;
  // rutscht in 2 s um 0,18 nach unten, dann wieder oben (deterministisch)
  const slide = ((frame % 60) / 60) * 0.18;
  return (
    <group position={[position[0], position[1] - slide, position[2]]} scale={0.22 * size}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 12]} />
        <Toon color="#7FD3FF" emissive="#7FD3FF" emissiveIntensity={0.45} />
        <Ink f={0.08}>
          <sphereGeometry args={[0.5, 16, 12]} />
        </Ink>
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.43, 0.75, 16]} />
        <Toon color="#7FD3FF" emissive="#7FD3FF" emissiveIntensity={0.45} />
        <Ink f={0.08}>
          <coneGeometry args={[0.43, 0.75, 16]} />
        </Ink>
      </mesh>
      <mesh position={[-0.17, 0.08, 0.45]}>
        <circleGeometry args={[0.1, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

/**
 * Stress-Striche: 3 kurze Striche strahlenförmig um einen Punkt (Kopf-Ecke), pulsieren.
 * `center` = Mittelpunkt, `radius` = Abstand, `fromDeg`/`toDeg` = Fächer (0° = rechts, 90° = oben).
 */
export const StressMarks: React.FC<{
  readonly center: [number, number, number];
  readonly radius: number;
  readonly amount?: number;
  readonly frame?: number;
  readonly color?: string;
  readonly fromDeg?: number;
  readonly toDeg?: number;
}> = ({ center, radius, amount = 1, frame = 0, color = "#E53935", fromDeg = 25, toDeg = 75 }) => {
  if (useGhost() || amount <= 0.01) return null;
  return (
    <group position={center}>
      {[0, 1, 2].map((k) => {
        const a = ((fromDeg + ((toDeg - fromDeg) * k) / 2) * Math.PI) / 180;
        // jeder Strich pulsiert versetzt (Länge 0,6..1)
        const len = 0.28 * amount * (0.8 + 0.2 * Math.sin(frame * 0.9 + k * 2.1));
        const r = radius + 0.06 + len / 2;
        return (
          <mesh key={k} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[len, 0.07, 0.03]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Toonie: React.FC<ToonieProps> = ({
  frame,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  eyes = "dot",
  mouth = "smile",
  brow = 0,
  blush = false,
  sweat = false,
  suit = "#F57C00",
  skin = "#FAFAFA",
  antenna = false,
  cap = null,
  tie = null,
  partyHat = false,
  sunglasses = false,
  arms = [0.25, 0.25],
  walk = 0,
  bounce = 0,
  look = 0,
  head,
  body,
  hands,
  sit = 0,
  blinkSeed,
  talk,
  squash = 1,
  drag = 0,
  eyePop = 1,
  sweatDrop = 0,
  stress = 0,
}) => {
  // Blinzeln: alt alle ~3 s für 3 Frames (alle Figuren gleichzeitig); mit blinkSeed je Figur versetzt
  const blinking =
    (eyes === "dot" || eyes === "angry") &&
    (blinkSeed === undefined ? frame % 95 < 3 : blinkAt(frame, blinkSeed));
  const e: Eyes = blinking ? "closed" : eyes;
  // Sprechen: offener Mund statt `mouth`, solange talk ≥ 0,08
  const m: Mouth | "talk" = talk !== undefined && talk >= 0.08 ? "talk" : mouth;
  const step = Math.sin(frame * 0.35 * walk);
  const hop = Math.abs(Math.sin(frame * 0.3)) * bounce;
  const breathe = 1 + Math.sin(frame * 0.12) * 0.012;
  // Ein Auge (x = Seite, p = Punkt auf der Kopfoberfläche)
  const eyeOf = (x: number, p: [number, number, number]) => {
      switch (e) {
        case "happy":
          return <Arc key={x} pos={p} radius={0.13} up />;
        case "closed":
          return <Arc key={x} pos={face(x, 0.08)} radius={0.12} />;
        case "wide":
          return (
            <group key={x}>
              <Blob pos={p} s={[0.2, 0.24, 0.06]} color="#FFFFFF" />
              <Blob pos={[p[0], p[1], p[2] + 0.04]} s={[0.08, 0.1, 0.04]} />
              <mesh position={[p[0], p[1], p[2] + 0.01]}>
                <torusGeometry args={[0.21, 0.025, 6, 24]} />
                <InkMat />
              </mesh>
            </group>
          );
        case "glow":
          return (
            <Blob key={x} pos={p} s={[0.13, 0.11, 0.06]} color="#FF1744" />
          );
        case "squint":
          return <SquintEye key={x} pos={face(x, 0.1, 0.03)} side={Math.sign(x)} />;
        default:
          return <Blob key={x} pos={p} s={[0.085, 0.12, 0.05]} />;
      }
  };
  const party = useCanvasTexture("party-hat", [128, 128], (c, w, h) => {
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? "#FF4081" : "#FFEB3B";
      c.fillRect(0, (i * h) / 8, w, h / 8);
    }
  });

  return (
    <group
      position={[position[0], position[1] + hop, position[2]]}
      rotation={rotation}
      scale={
        squash === 1
          ? scale
          : [scale / Math.sqrt(squash), scale * squash, scale / Math.sqrt(squash)]
      }
    >
      {/* Beine */}
      {[-0.22, 0.22].map((x, i) =>
        sit > 0 ? (
          // Sitzen: Oberschenkel nach vorn, Unterschenkel hängt am Knie (leicht gespreizt)
          <group
            key={x}
            position={[x, 1.15, 0]}
            rotation={[-sit * (Math.PI / 2), 0, (i ? -1 : 1) * sit * 0.12]}
          >
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.6, 8]} />
              <InkMat />
            </mesh>
            <Blob pos={[0, -0.6, 0]} s={[0.05, 0.05, 0.05]} />
            <group
              position={[0, -0.6, 0]}
              rotation={[sit * (Math.PI / 2 - 0.12) + (i ? -1 : 1) * step * 0.3, 0, 0]}
            >
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.5, 8]} />
                <InkMat />
              </mesh>
              <Blob pos={[0, -0.5, 0.08]} s={[0.12, 0.07, 0.18]} />
            </group>
          </group>
        ) : (
          <group
            key={x}
            position={[x, 1.15, 0]}
            rotation={[(i ? -1 : 1) * step * 0.5, 0, 0]}
          >
            <mesh position={[0, -0.55, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 1.1, 8]} />
              <InkMat />
            </mesh>
            <Blob pos={[0, -1.1, 0.08]} s={[0.12, 0.07, 0.18]} />
          </group>
        ),
      )}
      {/* Körper */}
      <mesh position={[0, 1.75, 0]} scale={[breathe, 1, breathe]}>
        <capsuleGeometry args={[0.55, 0.55, 8, 20]} />
        <Toon color={suit} />
        <Ink f={0.056}>
          <capsuleGeometry args={[0.55, 0.55, 8, 20]} />
        </Ink>
      </mesh>
      {tie ? (
        <mesh position={[0, 1.95, 0.53]} rotation={[-0.15, 0, drag * 0.8]}>
          <boxGeometry args={[0.16, 0.6, 0.04]} />
          <Toon color={tie} />
          <Ink f={0.028}>
            <boxGeometry args={[0.16, 0.6, 0.04]} />
          </Ink>
        </mesh>
      ) : (
        <mesh position={[0, 1.95, 0.5]}>
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial color="#FFF59D" />
        </mesh>
      )}
      {/* Arme */}
      {[-1, 1].map((side, i) => (
        <group
          key={side}
          position={[side * 0.5, 2.15, 0]}
          rotation={[0, 0, side * (arms[i] + Math.sin(frame * 0.2 + i) * 0.05) + drag * 0.5]}
        >
          <mesh position={[0, -0.47, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.95, 8]} />
            <InkMat />
          </mesh>
          <Blob pos={[0, -0.97, 0]} s={[0.1, 0.1, 0.1]} />
          {hands?.[i] ? (
            <group position={[0, -0.97, 0]}>{hands[i]}</group>
          ) : null}
        </group>
      ))}
      {body}
      {/* Kopf */}
      <group position={[0, HEAD_Y, 0]} rotation={[0, look, drag * 0.2]}>
        <mesh>
          <sphereGeometry args={[R, 32, 24]} />
          <Toon color={skin} />
          <Ink f={0.063}>
            <sphereGeometry args={[R, 32, 24]} />
          </Ink>
        </mesh>
        {/* Augen */}
        {[-0.3, 0.3].map((x) => {
          const p = face(x, 0.12);
          if (eyePop !== 1) {
            // Augen-Pop: Auge um seinen Mittelpunkt skalieren (nur wenn gesetzt)
            return (
              <group key={x} position={p} scale={eyePop}>
                <group position={[-p[0], -p[1], -p[2]]}>{eyeOf(x, p)}</group>
              </group>
            );
          }
          return eyeOf(x, p);
        })}
        {/* Augenbrauen */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={face(side * 0.3, e === "wide" ? 0.45 : 0.37, 0.03)}
            rotation={[
              0,
              0,
              -side * (brow + (e === "angry" || e === "glow" ? 0.45 : 0)),
            ]}
          >
            <boxGeometry args={[0.28, 0.055, 0.03]} />
            <InkMat />
          </mesh>
        ))}
        {/* Mund */}
        {m === "smile" && <Arc pos={face(0, -0.3)} radius={0.17} />}
        {m === "frown" && <Arc pos={face(0, -0.42)} radius={0.15} up />}
        {m === "o" && <Blob pos={face(0, -0.35)} s={[0.11, 0.14, 0.05]} />}
        {m === "flat" && (
          <mesh position={face(0, -0.35, 0.03)}>
            <boxGeometry args={[0.26, 0.05, 0.03]} />
            <InkMat />
          </mesh>
        )}
        {(m === "grin" || m === "teeth") && (
          <group position={face(0, -0.33, 0.01)}>
            <mesh rotation={[0, 0, Math.PI]}>
              <circleGeometry args={[0.22, 20, 0, Math.PI]} />
              <InkMat />
            </mesh>
            {m === "teeth" && (
              <mesh position={[0, -0.04, 0.01]}>
                <boxGeometry args={[0.34, 0.07, 0.01]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            )}
          </group>
        )}
        {m === "clench" && <ClenchMouth pos={face(0, -0.38, 0.03)} />}
        {m === "beam" && <BeamMouth pos={face(0, -0.3, 0.02)} />}
        {m === "smirk" && <SmirkMouth pos={face(0, -0.32, 0.02)} />}
        {m === "talk" && talk !== undefined && (
          <group position={face(0, -0.36, 0.0)}>
            <Blob pos={[0, 0, 0]} s={[0.15, 0.04 + 0.15 * talk, 0.05]} />
            <Blob
              pos={[0, -0.02 - 0.06 * talk, 0.03]}
              s={[0.08, 0.02 + 0.05 * talk, 0.03]}
              color="#E85A6B"
            />
          </group>
        )}
        {blush &&
          [-0.55, 0.55].map((x) => (
            <Blob
              key={x}
              pos={face(x, -0.15, 0.0)}
              s={[0.13, 0.08, 0.03]}
              color="#FF8A80"
            />
          ))}
        {sweat && (
          <Blob
            pos={[0.75, 0.3 - ((frame * 0.02) % 0.6), 0.55]}
            s={[0.07, 0.11, 0.07]}
            color="#81D4FA"
          />
        )}
        {sweatDrop > 0 && <SweatDrop position={[0.78, 0.5, 0.55]} size={sweatDrop} frame={frame} />}
        {stress > 0 && <StressMarks center={[0, 0, 0.3]} radius={1.05} amount={stress} frame={frame} />}
        {sunglasses && (
          <group position={[0, 0.12, 0.97]}>
            {[-0.3, 0.3].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <boxGeometry args={[0.42, 0.26, 0.06]} />
                <InkMat />
              </mesh>
            ))}
            <mesh>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <InkMat />
            </mesh>
          </group>
        )}
        {antenna && (
          <group
            position={[0.15, 0.95, 0]}
            rotation={[0, 0, -0.25 + Math.sin(frame * 0.25) * 0.08 + drag]}
          >
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
              <InkMat />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.11, 16, 12]} />
              <Toon
                color="#FF3D00"
                emissive="#FF3D00"
                emissiveIntensity={0.3}
              />
              <Ink f={0.028}>
                <sphereGeometry args={[0.11, 16, 12]} />
              </Ink>
            </mesh>
          </group>
        )}
        {cap && (
          <group position={[0, 0.45, 0]} rotation={[-0.2, 0, drag * 0.15]}>
            <mesh scale={[1.05, 0.62, 1.05]}>
              <sphereGeometry
                args={[R, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <Toon color={cap} />
              <Ink f={0.042}>
                <sphereGeometry
                  args={[R, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
                />
              </Ink>
            </mesh>
            <mesh position={[0, 0.02, 0.75]} scale={[1, 1, 0.75]}>
              <cylinderGeometry
                args={[0.75, 0.75, 0.06, 24, 1, false, -Math.PI / 2, Math.PI]}
              />
              <Toon color={cap} />
              <Ink f={0.028}>
                <cylinderGeometry
                  args={[0.75, 0.75, 0.06, 24, 1, false, -Math.PI / 2, Math.PI]}
                />
              </Ink>
            </mesh>
            <Blob
              pos={[0, 0.35, 0.92]}
              s={[0.08, 0.08, 0.03]}
              color="#FFD54F"
            />
          </group>
        )}
        {partyHat && (
          <mesh position={[-0.25, 1.15, 0]} rotation={[0, 0, 0.25]}>
            <coneGeometry args={[0.35, 0.8, 24]} />
            <Toon color="#FFFFFF" map={party} />
            <Ink f={0.028}>
              <coneGeometry args={[0.35, 0.8, 24]} />
            </Ink>
          </mesh>
        )}
        {head}
      </group>
    </group>
  );
};

/** Milo – unser Astronaut: orangefarbener Anzug + Antenne mit rotem Knopf. */
export const Milo: React.FC<ToonieProps> = (p) => (
  <Toonie suit="#F57C00" antenna {...p} />
);
/** Der Boss – dunkler Anzug, Krawatte. */
export const Boss: React.FC<ToonieProps> = (p) => (
  <Toonie suit="#37474F" tie="#8D6E63" skin="#F5F5F5" {...p} />
);

/**
 * Gegenstand mit Gesicht (referenz-analyse-4.md Technik 2): legt Augen, Brauen, Mund, Blinzeln,
 * Sprechen, Schweißtropfen und Stress-Striche auf JEDES Objekt (Tablette, Tür, Planet, Kiste …).
 * Als Kind an die Vorderseite des Objekts setzen: Ursprung = Gesichtsmitte, Gesicht zeigt nach +z,
 * `scale` 1 = Gesichtsbreite wie bei Toonie (Augenabstand 0,6). `curve` = Radius, wenn das Gesicht
 * auf einer Kugel/einem Zylinder sitzt (Teile werden auf die Wölbung gelegt); ohne = flach.
 * Gleiche Ausdrücke wie Toonie (`Eyes`, `Mouth`, `brow`, `talk`, `blinkSeed`, `eyePop`). Deterministisch.
 */
export const FaceOn: React.FC<{
  readonly frame: number;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: number;
  readonly eyes?: Eyes;
  readonly mouth?: Mouth;
  readonly brow?: number;
  /** Brauen zeigen (Standard: nur bei wide/angry/squint oder brow ≠ 0) */
  readonly brows?: boolean;
  readonly blinkSeed?: number;
  readonly talk?: number;
  readonly eyePop?: number;
  readonly blush?: boolean;
  readonly sweatDrop?: number;
  readonly stress?: number;
  readonly curve?: number;
  /** Blickrichtung der Pupillen (−1..1, x/y) */
  readonly gaze?: readonly [number, number];
}> = ({
  frame,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  eyes = "dot",
  mouth = "smile",
  brow = 0,
  brows,
  blinkSeed = 7,
  talk,
  eyePop = 1,
  blush = false,
  sweatDrop = 0,
  stress = 0,
  curve,
  gaze = [0, 0],
}) => {
  const pt = (x: number, y: number, lift = 0.02): [number, number, number] => {
    if (!curve) return [x, y, lift];
    // auf Kugel mit Radius `curve` (Gesichtsmitte = Kugel-Vorderpunkt bei z 0)
    const zz = Math.sqrt(Math.max(0, curve * curve - x * x - y * y)) - curve;
    return [x, y, zz + lift];
  };
  const blinking = (eyes === "dot" || eyes === "angry") && blinkAt(frame, blinkSeed);
  const e: Eyes = blinking ? "closed" : eyes;
  const m: Mouth | "talk" = talk !== undefined && talk >= 0.08 ? "talk" : mouth;
  const gx = gaze[0] * 0.05;
  const gy = gaze[1] * 0.05;
  const eyeOf = (x: number) => {
    const p = pt(x, 0.12);
    switch (e) {
      case "happy":
        return <Arc key={x} pos={p} radius={0.13} up />;
      case "closed":
        return <Arc key={x} pos={pt(x, 0.08)} radius={0.12} />;
      case "squint":
        return <SquintEye key={x} pos={pt(x, 0.1, 0.03)} side={Math.sign(x)} />;
      case "wide":
        return (
          <group key={x} position={p} scale={eyePop}>
            <Blob pos={[0, 0, 0]} s={[0.2, 0.24, 0.04]} color="#FFFFFF" />
            <Blob pos={[gx, gy, 0.03]} s={[0.08, 0.1, 0.03]} />
            <mesh position={[0, 0, 0.01]}>
              <torusGeometry args={[0.21, 0.025, 6, 24]} />
              <InkMat />
            </mesh>
          </group>
        );
      case "glow":
        return <Blob key={x} pos={p} s={[0.13, 0.11, 0.04]} color="#FF1744" />;
      default:
        return <Blob key={x} pos={[p[0] + gx, p[1] + gy, p[2]]} s={[0.085 * eyePop, 0.12 * eyePop, 0.04]} />;
    }
  };
  const showBrows = brows ?? (e === "wide" || e === "angry" || e === "squint" || brow !== 0);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[-0.3, 0.3].map(eyeOf)}
      {showBrows
        ? [-1, 1].map((side) => (
            <mesh
              key={side}
              position={pt(side * 0.3, e === "wide" ? 0.45 : 0.37, 0.03)}
              rotation={[0, 0, -side * (brow + (e === "angry" || e === "squint" ? 0.45 : 0))]}
            >
              <boxGeometry args={[0.28, 0.055, 0.03]} />
              <InkMat />
            </mesh>
          ))
        : null}
      {m === "smile" && <Arc pos={pt(0, -0.3)} radius={0.17} />}
      {m === "frown" && <Arc pos={pt(0, -0.42)} radius={0.15} up />}
      {m === "o" && <Blob pos={pt(0, -0.35)} s={[0.11, 0.14, 0.04]} />}
      {m === "flat" && (
        <mesh position={pt(0, -0.35, 0.03)}>
          <boxGeometry args={[0.26, 0.05, 0.03]} />
          <InkMat />
        </mesh>
      )}
      {(m === "grin" || m === "teeth") && (
        <group position={pt(0, -0.33, 0.01)}>
          <mesh rotation={[0, 0, Math.PI]}>
            <circleGeometry args={[0.22, 20, 0, Math.PI]} />
            <InkMat />
          </mesh>
          {m === "teeth" && (
            <mesh position={[0, -0.04, 0.01]}>
              <boxGeometry args={[0.34, 0.07, 0.01]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          )}
        </group>
      )}
      {m === "clench" && <ClenchMouth pos={pt(0, -0.38, 0.03)} />}
      {m === "beam" && <BeamMouth pos={pt(0, -0.3, 0.02)} />}
      {m === "smirk" && <SmirkMouth pos={pt(0, -0.32, 0.02)} />}
      {m === "talk" && talk !== undefined && (
        <group position={pt(0, -0.36, 0.02)}>
          <Blob pos={[0, 0, 0]} s={[0.15, 0.04 + 0.15 * talk, 0.04]} />
          <Blob pos={[0, -0.02 - 0.06 * talk, 0.025]} s={[0.08, 0.02 + 0.05 * talk, 0.02]} color="#E85A6B" />
        </group>
      )}
      {blush &&
        [-0.55, 0.55].map((x) => <Blob key={x} pos={pt(x, -0.15, 0.01)} s={[0.13, 0.08, 0.02]} color="#FF8A80" />)}
      {sweatDrop > 0 && <SweatDrop position={[0.72, 0.42, 0.12]} size={sweatDrop} frame={frame} />}
      {stress > 0 && <StressMarks center={[0, 0.1, 0.05]} radius={0.75} amount={stress} frame={frame} />}
    </group>
  );
};
