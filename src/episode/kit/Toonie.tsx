import React from "react";
import { INK, Ink, Toon, useCanvasTexture } from "./toon";

export type Eyes = "dot" | "happy" | "wide" | "angry" | "glow" | "closed";
export type Mouth = "smile" | "o" | "flat" | "grin" | "frown" | "teeth";

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
};

const R = 1; // Kopfradius
const HEAD_Y = 3.05;

// Punkt auf der Kopfoberfläche (Gesicht zeigt nach +z)
const face = (x: number, y: number, lift = 0.02): [number, number, number] => [
  x,
  y,
  Math.sqrt(Math.max(0, R * R - x * x - y * y)) + lift,
];

const Arc: React.FC<{
  readonly pos: [number, number, number];
  readonly radius: number;
  readonly up?: boolean;
  readonly tube?: number;
}> = ({ pos, radius, up, tube = 0.032 }) => (
  <mesh position={pos} rotation={[0, 0, up ? 0 : Math.PI]}>
    <torusGeometry args={[radius, tube, 8, 20, Math.PI]} />
    <meshBasicMaterial color={INK} />
  </mesh>
);

const Blob: React.FC<{
  readonly pos: [number, number, number];
  readonly s: [number, number, number];
  readonly color?: string;
}> = ({ pos, s, color = INK }) => (
  <mesh position={pos} scale={s}>
    <sphereGeometry args={[1, 16, 12]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

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
}) => {
  // Blinzeln alle ~3 s für 3 Frames (nur bei offenen Augen)
  const blinking = (eyes === "dot" || eyes === "angry") && frame % 95 < 3;
  const e: Eyes = blinking ? "closed" : eyes;
  const step = Math.sin(frame * 0.35 * walk);
  const hop = Math.abs(Math.sin(frame * 0.3)) * bounce;
  const breathe = 1 + Math.sin(frame * 0.12) * 0.012;
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
      scale={scale}
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
              <meshBasicMaterial color={INK} />
            </mesh>
            <Blob pos={[0, -0.6, 0]} s={[0.05, 0.05, 0.05]} />
            <group
              position={[0, -0.6, 0]}
              rotation={[sit * (Math.PI / 2 - 0.12) + (i ? -1 : 1) * step * 0.3, 0, 0]}
            >
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.5, 8]} />
                <meshBasicMaterial color={INK} />
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
              <meshBasicMaterial color={INK} />
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
        <mesh position={[0, 1.95, 0.53]} rotation={[-0.15, 0, 0]}>
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
          rotation={[0, 0, side * (arms[i] + Math.sin(frame * 0.2 + i) * 0.05)]}
        >
          <mesh position={[0, -0.47, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.95, 8]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <Blob pos={[0, -0.97, 0]} s={[0.1, 0.1, 0.1]} />
          {hands?.[i] ? (
            <group position={[0, -0.97, 0]}>{hands[i]}</group>
          ) : null}
        </group>
      ))}
      {body}
      {/* Kopf */}
      <group position={[0, HEAD_Y, 0]} rotation={[0, look, 0]}>
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
                    <meshBasicMaterial color={INK} />
                  </mesh>
                </group>
              );
            case "glow":
              return (
                <Blob key={x} pos={p} s={[0.13, 0.11, 0.06]} color="#FF1744" />
              );
            default:
              return <Blob key={x} pos={p} s={[0.085, 0.12, 0.05]} />;
          }
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
            <meshBasicMaterial color={INK} />
          </mesh>
        ))}
        {/* Mund */}
        {mouth === "smile" && <Arc pos={face(0, -0.3)} radius={0.17} />}
        {mouth === "frown" && <Arc pos={face(0, -0.42)} radius={0.15} up />}
        {mouth === "o" && <Blob pos={face(0, -0.35)} s={[0.11, 0.14, 0.05]} />}
        {mouth === "flat" && (
          <mesh position={face(0, -0.35, 0.03)}>
            <boxGeometry args={[0.26, 0.05, 0.03]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        )}
        {(mouth === "grin" || mouth === "teeth") && (
          <group position={face(0, -0.33, 0.01)}>
            <mesh rotation={[0, 0, Math.PI]}>
              <circleGeometry args={[0.22, 20, 0, Math.PI]} />
              <meshBasicMaterial color={INK} />
            </mesh>
            {mouth === "teeth" && (
              <mesh position={[0, -0.04, 0.01]}>
                <boxGeometry args={[0.34, 0.07, 0.01]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            )}
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
        {sunglasses && (
          <group position={[0, 0.12, 0.97]}>
            {[-0.3, 0.3].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <boxGeometry args={[0.42, 0.26, 0.06]} />
                <meshBasicMaterial color={INK} />
              </mesh>
            ))}
            <mesh>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <meshBasicMaterial color={INK} />
            </mesh>
          </group>
        )}
        {antenna && (
          <group
            position={[0.15, 0.95, 0]}
            rotation={[0, 0, -0.25 + Math.sin(frame * 0.25) * 0.08]}
          >
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
              <meshBasicMaterial color={INK} />
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
          <group position={[0, 0.45, 0]} rotation={[-0.2, 0, 0]}>
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
