/**
 * Bau-Kit „Antikes Rom“: Kostüme für Toonie, Kulissen und Requisiten.
 * Alles deterministisch (nur aus Props/`frame`, kein useFrame; useEffect nur zum
 * Schrift-Laden unter delayRender, siehe `useRomeFont`),
 * Cel-Shading über `toonGradient`, Kontur über <Ink> in INK.
 * Farben, Kontrast- und Silhouettenregeln: docs/design-system.md.
 *
 * Kostüm-Teile werden in die Steckplätze von <Toonie> gesetzt:
 *   <Toonie head={<LegionaryHelmet />} body={<Lorica />} hands={[<Gladius />, <Scutum />]} />
 * oder fertig als <Legionary>, <Emperor>, <Senator>, <Goth>.
 */
import React, { useEffect, useMemo, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import {
  BackSide,
  BufferGeometry,
  DoubleSide,
  ExtrudeGeometry,
  FrontSide,
  Path,
  Shape,
  ShapeGeometry,
  Texture,
} from "three";
import { Glow } from "./fx";
import { INK, Ink, seeded, toonGradient, useCanvasTexture } from "./toon";
import { Toonie, ToonieProps } from "./Toonie";

type P3 = [number, number, number];

/** Rom-Palette (Begründung in docs/design-system.md). */
export const ROME = {
  skyTop: "#3E9FDB",
  skyBottom: "#CBEAF6",
  sun: "#FFF4C8",
  fog: "#DCEFF5",
  sandstone: "#E5B574",
  sandLight: "#F4D7A1",
  ochre: "#C9873F",
  ochreDark: "#9A5F2E",
  interior: "#A86A3A",
  /** Gewölbegänge hinter den Kolosseum-Bögen: dunkel, damit die Arkade auch klein liest */
  vault: "#5E331C",
  ground: "#E8C990",
  groundSpots: "#D6AD70",
  marble: "#F6F0E4",
  marbleShade: "#DDD3C0",
  terracotta: "#C4562F",
  roof: "#B4472B",
  legionRed: "#C62828",
  crest: "#E53935",
  purple: "#7B2D96",
  purpleDark: "#4A1A63",
  gold: "#F4B731",
  goldDark: "#B9851C",
  iron: "#C8D3DB",
  ironDark: "#8796A1",
  bronze: "#C8873A",
  leather: "#8A5A2E",
  wood: "#9C6B3C",
  parchment: "#F2E2B6",
  fur: "#7B5235",
  furLight: "#B08657",
  /** Kupfer/rotblond – bewusst nicht gelb (Gelb gehört nur dem Halstuch der Hauptfigur) */
  hair: "#C46A2B",
  gothWool: "#4F6E5A",
  gothCheck: "#2F4A3A",
  cypress: "#2F5D3A",
  pine: "#5A8A3C",
  hill: "#A9BF72",
} as const;

const HOUSE_WALLS = ["#F4DCAA", "#EBC085", "#F2CDA5", "#E0A574", "#F7E6C6", "#E9B98E"];

/* ------------------------------------------------------------------ */
/* Schrift für Textur-Beschriftungen (SPQR, Jahreszahlen, WEST/EAST)    */
/* ------------------------------------------------------------------ */

/**
 * Mitgelieferte Schrift statt Systemschrift: Montserrat 900 (OFL-1.1, public/fonts) –
 * gleiche Schrift wie die Untertitel, auf jedem Rechner gleich. Eigener Familienname,
 * damit das Kit unabhängig von den Overlays lädt. Geladen per FontFace + delayRender:
 * kein Frame wird aufgenommen, bevor die Texturen mit der richtigen Schrift gezeichnet sind.
 */
export const ROME_FONT = "RomeKitSans";
const fontStack = (px: number) => `900 ${px}px ${ROME_FONT}, 'DejaVu Sans', sans-serif`;
let fontPromise: Promise<void> | null = null;
let fontLoaded = false;
const loadRomeFont = () => {
  if (!fontPromise) {
    const face = new FontFace(
      ROME_FONT,
      `url('${staticFile("fonts/montserrat-latin-900-normal.woff2")}') format('woff2')`,
      { weight: "900" },
    );
    fontPromise = face.load().then(
      (f) => {
        document.fonts.add(f);
        fontLoaded = true;
      },
      (err) => cancelRender(err),
    );
  }
  return fontPromise;
};

/** true, sobald die Kit-Schrift geladen ist; hält bis zum Neuzeichnen das Rendern an. */
const useRomeFont = () => {
  const [ready, setReady] = useState(fontLoaded);
  const [handle] = useState(() => (fontLoaded ? null : delayRender("Rom-Kit: Schrift laden")));
  useEffect(() => {
    if (ready) {
      if (handle !== null) {
        // erst nach dem nächsten Bild freigeben, damit die neue Textur schon gezeichnet ist
        requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle)));
      }
      return;
    }
    loadRomeFont().then(() => setReady(true));
  }, [ready, handle]);
  return ready;
};

/* ------------------------------------------------------------------ */
/* Hilfen                                                               */
/* ------------------------------------------------------------------ */

const ToonM: React.FC<{
  readonly color: string;
  readonly double?: boolean;
  readonly map?: Texture | null;
  readonly emissive?: number;
}> = ({ color, double, map, emissive = 0 }) => (
  <meshToonMaterial
    color={color}
    map={map ?? null}
    gradientMap={toonGradient()}
    side={double ? DoubleSide : FrontSide}
    emissive={color}
    emissiveIntensity={emissive}
  />
);

/** Teil mit Geometrie als Kind: Toon + Kontur. */
const Part: React.FC<{
  readonly children: React.ReactNode;
  readonly color: string;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number | P3;
  readonly ink?: number;
  readonly double?: boolean;
  readonly map?: Texture | null;
  readonly emissive?: number;
  readonly shadow?: boolean;
}> = ({
  children,
  color,
  position,
  rotation,
  scale,
  ink = 0.04,
  double,
  map,
  emissive,
  shadow = true,
}) => (
  <mesh
    position={position}
    rotation={rotation}
    scale={scale}
    castShadow={shadow}
    receiveShadow={shadow}
  >
    {children}
    <ToonM color={color} double={double} map={map} emissive={emissive} />
    {ink > 0 ? <Ink f={ink}>{children}</Ink> : null}
  </mesh>
);

/** Teil mit fertiger (geteilter) Geometrie. */
const GeoPart: React.FC<{
  readonly geo: BufferGeometry;
  readonly color: string;
  readonly ink?: number;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number | P3;
}> = ({ geo, color, ink = 0.03, position, rotation, scale }) => (
  <mesh
    geometry={geo}
    position={position}
    rotation={rotation}
    scale={scale}
    castShadow
    receiveShadow
  >
    <ToonM color={color} />
    {ink > 0 ? (
      <mesh geometry={geo} scale={1 + ink}>
        <meshBasicMaterial color={INK} side={BackSide} />
      </mesh>
    ) : null}
  </mesh>
);

const Flat: React.FC<{
  readonly geo: BufferGeometry;
  readonly color?: string;
  readonly position?: P3;
}> = ({ geo, color = INK, position }) => (
  <mesh geometry={geo} position={position}>
    <meshBasicMaterial color={color} />
  </mesh>
);

/** Radius der Toonie-Körperkapsel bei Höhe y (für anliegende Kostüme). */
const bodyR = (y: number) => {
  const c = Math.min(Math.max(y, 1.475), 2.025);
  const d = y - c;
  return Math.sqrt(Math.max(0, 0.3025 - d * d));
};

/* --- Bogen-Geometrien (Kolosseum, Aquädukt) ------------------------- */

/** Wandstück w×h×d mit Rundbogen-Öffnung bis zum Boden (Π-Form), zentriert. */
const archBay = (w: number, h: number, d: number, aw: number, spring: number) => {
  const s = new Shape();
  const b = -h / 2;
  const ys = b + spring;
  s.moveTo(-w / 2, b);
  s.lineTo(-aw / 2, b);
  s.lineTo(-aw / 2, ys);
  s.absarc(0, ys, aw / 2, Math.PI, 0, true);
  s.lineTo(aw / 2, b);
  s.lineTo(w / 2, b);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.lineTo(-w / 2, b);
  const g = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -d / 2);
  return g;
};

/** Schwarzer Konturstreifen um eine Bogenöffnung (vorn aufgelegt). */
const archLine = (h: number, aw: number, spring: number, t: number) => {
  const s = new Shape();
  const b = -h / 2;
  const ys = b + spring;
  const r = aw / 2;
  s.moveTo(-r - t, b);
  s.lineTo(-r - t, ys);
  s.absarc(0, ys, r + t, Math.PI, 0, true);
  s.lineTo(r + t, b);
  s.lineTo(r, b);
  s.lineTo(r, ys);
  s.absarc(0, ys, r, 0, Math.PI, false);
  s.lineTo(-r, b);
  s.lineTo(-r - t, b);
  return new ShapeGeometry(s, 10);
};

/** Wandstück mit rechteckigem Fenster (Attika). */
const windowBay = (w: number, h: number, d: number, ww: number, wh: number) => {
  const s = new Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.lineTo(-w / 2, -h / 2);
  const hole = new Path();
  hole.moveTo(-ww / 2, -wh / 2);
  hole.lineTo(-ww / 2, wh / 2);
  hole.lineTo(ww / 2, wh / 2);
  hole.lineTo(ww / 2, -wh / 2);
  hole.lineTo(-ww / 2, -wh / 2);
  s.holes.push(hole);
  const g = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return g;
};

/** Dreieck (Giebel), zentriert um den Schwerpunkt. */
const gable = (w: number, h: number, d: number) => {
  const s = new Shape();
  s.moveTo(-w / 2, -h / 3);
  s.lineTo(w / 2, -h / 3);
  s.lineTo(0, (2 * h) / 3);
  s.lineTo(-w / 2, -h / 3);
  const g = new ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return g;
};

/* ------------------------------------------------------------------ */
/* Kostüme – Kopf (Steckplatz `head`, Ursprung Kopfmitte, R = 1)        */
/* ------------------------------------------------------------------ */

/**
 * Legionärshelm (Galea, kaiserzeitlicher Typ): Eisenkalotte mit Messingrand,
 * Nackenschutz, Wangenklappen, Helmbusch. `transverse` = quer stehender Busch
 * (Centurio – liest sich frontal als roter Fächer, für Hauptfiguren empfohlen).
 */
export const LegionaryHelmet: React.FC<{
  readonly crest?: string | null;
  readonly transverse?: boolean;
  readonly metal?: string;
  readonly trim?: string;
}> = ({
  crest = ROME.crest,
  transverse = false,
  metal = ROME.iron,
  trim = ROME.bronze,
}) => {
  const bristle = useCanvasTexture(`crest-fan-${crest}`, [256, 256], (c, w, h) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(0,0,0,0.2)";
    c.lineWidth = 4;
    for (let i = 0; i <= 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(ang) * 30, h / 2 + Math.sin(ang) * 30);
      c.lineTo(w / 2 + Math.cos(ang) * w, h / 2 + Math.sin(ang) * h);
      c.stroke();
    }
  });
  return (
    <group>
      {/* Kalotte */}
      <Part color={metal} ink={0.035}>
        <sphereGeometry args={[1.07, 32, 14, 0, Math.PI * 2, 0, 1.08]} />
      </Part>
      {/* Stirnreif */}
      <Part color={trim} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0.05}>
        <torusGeometry args={[0.95, 0.07, 8, 40]} />
      </Part>
      {/* Stirnschild (Visierkante) */}
      <Part color={trim} position={[0, 0.5, 0]} rotation={[0, 0, 0]} scale={[1, 0.18, 1]} ink={0.05} double>
        <cylinderGeometry args={[0.98, 1.12, 0.5, 32, 1, true, -Math.PI * 0.28, Math.PI * 0.56]} />
      </Part>
      {/* Nackenschutz */}
      <Part color={metal} position={[0, 0.36, 0]} ink={0.03} double>
        <cylinderGeometry
          args={[0.96, 1.22, 0.32, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76]}
        />
      </Part>
      {/* Wangenklappen */}
      {[-1, 1].map((sd) => (
        <Part
          key={sd}
          color={metal}
          position={[sd * 0.93, 0.02, 0.28]}
          rotation={[0.05, sd * 0.45, sd * 0.06]}
          ink={0.06}
        >
          <boxGeometry args={[0.1, 0.72, 0.42]} />
        </Part>
      ))}
      {/* Busch-Halter + Busch */}
      <Part color={trim} position={[0, 1.08, 0]} ink={0.06}>
        <cylinderGeometry args={[0.1, 0.14, 0.16, 12]} />
      </Part>
      {crest ? (
        <group position={[0, 1.2, 0]} rotation={[0, transverse ? 0 : Math.PI / 2, 0]}>
          {/* Fächer: Halbscheibe, quer = zur Kamera hin breit */}
          <Part
            color={crest}
            rotation={[Math.PI / 2, 0, 0]}
            scale={transverse ? [0.82, 1, 0.78] : [0.95, 1, 0.72]}
            ink={0.045}
            map={bristle}
          >
            <cylinderGeometry args={[1, 1, 0.2, 32, 1, false, Math.PI / 2, Math.PI]} />
          </Part>
        </group>
      ) : null}
    </group>
  );
};

/** Lorbeerkranz – gold (Kaiser/Triumph) oder grün. Bänder hinten. */
export const LaurelWreath: React.FC<{
  readonly color?: string;
  readonly y?: number;
}> = ({ color = ROME.gold, y = 0.48 }) => {
  const r = Math.sqrt(1 - y * y) + 0.05;
  const leaves = [];
  const n = 13;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < n; i++) {
      // von hinten (a = π) nach vorn (a ≈ 0.18) – vorn kleine Lücke über der Stirn
      const a = side * (Math.PI - (i / (n - 1)) * (Math.PI - 0.2));
      const up = i % 2 === 0 ? 0.07 : -0.05;
      leaves.push(
        <group
          key={`${side}-${i}`}
          position={[Math.sin(a) * r, y + up, Math.cos(a) * r]}
          rotation={[0, a + Math.PI / 2, 0]}
        >
          <Part
            color={color}
            rotation={[side * (i % 2 === 0 ? -0.55 : 0.45), 0, 0]}
            scale={[0.035, 0.075, 0.19]}
            ink={0.14}
          >
            <sphereGeometry args={[1, 12, 8]} />
          </Part>
        </group>,
      );
    }
  }
  return (
    <group>
      <Part color={color} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0.08}>
        <torusGeometry args={[r - 0.02, 0.03, 6, 40]} />
      </Part>
      {leaves}
      {[-1, 1].map((sd) => (
        <Part
          key={sd}
          color={ROME.legionRed}
          position={[sd * 0.18, y - 0.35, -r + 0.02]}
          rotation={[0.25, 0, sd * 0.25]}
          ink={0.06}
        >
          <boxGeometry args={[0.1, 0.6, 0.03]} />
        </Part>
      ))}
    </group>
  );
};

/** Barbaren-Kappe (Leder/Filz) mit Pelzrand – bewusst ohne Hörner. */
export const GothCap: React.FC<{
  readonly color?: string;
  readonly fur?: string;
}> = ({ color = ROME.leather, fur = ROME.furLight }) => {
  const furTex = useFurTexture(fur);
  return (
    <group>
      <Part color={color} position={[0, 0.42, 0]} scale={[1.05, 0.62, 1.05]} ink={0.035}>
        <sphereGeometry args={[1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
      {/* Nähte */}
      {[0, Math.PI / 2].map((a) => (
        <mesh key={a} position={[0, 0.42, 0]} rotation={[0, a, 0]} scale={[1.06, 0.63, 1.06]}>
          <torusGeometry args={[1, 0.018, 4, 32, Math.PI]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      ))}
      <Part color="#FFFFFF" map={furTex} position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0.04}>
        <torusGeometry args={[0.98, 0.15, 10, 36]} />
      </Part>
    </group>
  );
};

/** Zöpfe links/rechts (fallen auf die Schultern). */
export const Braids: React.FC<{ readonly color?: string; readonly length?: number }> = ({
  color = ROME.hair,
  length = 5,
}) => (
  <group>
    {[-1, 1].map((sd) => (
      <group key={sd} position={[sd * 0.86, 0.05, -0.28]}>
        {Array.from({ length }, (_, i) => (
          <Part
            key={i}
            color={color}
            position={[sd * (0.05 + i * 0.025), -i * 0.2, i * 0.02]}
            scale={[0.14, 0.13, 0.14]}
            ink={0.12}
          >
            <sphereGeometry args={[1, 14, 10]} />
          </Part>
        ))}
        <Part
          color={ROME.leather}
          position={[sd * (0.05 + length * 0.025), -length * 0.2 + 0.06, length * 0.02]}
          rotation={[Math.PI / 2, 0, 0]}
          ink={0.1}
        >
          <torusGeometry args={[0.09, 0.035, 6, 14]} />
        </Part>
      </group>
    ))}
  </group>
);

/**
 * Vollbart: liegt als Schale am Kiefer an (Mund bleibt frei), Koteletten bis zur Kappe,
 * unten in Zotteln auslaufend, Strähnen-Textur; dazu ein hängender Schnurrbart.
 * Silhouette: Kinn wird zur Spitze statt zur Kugel.
 */
export const Beard: React.FC<{ readonly color?: string; readonly frame?: number }> = ({
  color = ROME.hair,
  frame = 0,
}) => {
  const strands = useCanvasTexture(`beard-${color}`, [128, 128], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    const r = seeded(23);
    c.strokeStyle = "rgba(60,25,5,0.28)";
    c.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      const x = r() * w;
      c.beginPath();
      c.moveTo(x, 0);
      c.quadraticCurveTo(x + (r() - 0.5) * 18, h * 0.5, x + (r() - 0.5) * 10, h);
      c.stroke();
    }
  });
  // Zotteln unten: [x, Länge, Neigung]; die mittlere am längsten
  const tufts: [number, number, number][] = [
    [-0.5, 0.34, 0.35],
    [-0.25, 0.46, 0.15],
    [0, 0.58, 0],
    [0.25, 0.46, -0.15],
    [0.5, 0.34, -0.35],
  ];
  const sway = Math.sin(frame * 0.1) * 0.04;
  return (
    <group>
      {/* Schale um Kinn und Kiefer (Ausschnitt einer Kugel, vorn unter dem Mund) */}
      <Part color="#FFFFFF" map={strands} ink={0.035} double>
        <sphereGeometry
          args={[1.09, 32, 12, Math.PI / 2 - 1.35, 2.7, 2.12, Math.PI - 2.12 - 0.12]}
        />
      </Part>
      {/* Füllung, damit der Bart Volumen hat (sitzt unter dem Kinn) */}
      <Part color="#FFFFFF" map={strands} position={[0, -0.92, 0.32]} scale={[0.66, 0.34, 0.62]} ink={0.04}>
        <sphereGeometry args={[1, 24, 14]} />
      </Part>
      {/* Koteletten bis unter die Kappe */}
      {[-1, 1].map((sd) => (
        <Part
          key={`sb${sd}`}
          color="#FFFFFF"
          map={strands}
          position={[sd * 0.88, -0.28, 0.3]}
          rotation={[0, -sd * 0.34, sd * 0.1]}
          scale={[0.12, 0.4, 0.26]}
          ink={0.08}
        >
          <sphereGeometry args={[1, 14, 10]} />
        </Part>
      ))}
      {/* Zotteln */}
      <group position={[0, -1.08, 0.42]} rotation={[0.25 + sway, 0, 0]}>
        {tufts.map(([x, len, tilt]) => (
          <Part
            key={x}
            color="#FFFFFF"
            map={strands}
            position={[x, -len / 2 + 0.08, -Math.abs(x) * 0.35]}
            rotation={[0, 0, Math.PI + tilt]}
            ink={0.07}
          >
            <coneGeometry args={[0.17, len, 10]} />
          </Part>
        ))}
      </group>
      {/* Schnurrbart: hängt seitlich am Mund vorbei */}
      {[-1, 1].map((sd) => (
        <Part
          key={sd}
          color={color}
          position={[sd * 0.22, -0.24, 0.97]}
          rotation={[0, sd * 0.25, sd * -0.6]}
          scale={[0.24, 0.075, 0.08]}
          ink={0.1}
        >
          <sphereGeometry args={[1, 12, 8]} />
        </Part>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Kostüme – Körper (Steckplatz `body`, Ursprung Boden, Mitte y 1.75)   */
/* ------------------------------------------------------------------ */

/** Gürtel (cingulum) mit Schurz aus Lederstreifen. */
export const Belt: React.FC<{
  readonly color?: string;
  readonly studs?: string;
  readonly apron?: boolean;
  readonly y?: number;
}> = ({ color = ROME.leather, studs = ROME.bronze, apron = true, y = 1.42 }) => {
  const r = bodyR(y) + 0.03;
  return (
    <group>
      <Part color={color} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0.06}>
        <torusGeometry args={[r, 0.065, 8, 32]} />
      </Part>
      <Part color={studs} position={[0, y, r + 0.06]} ink={0.12}>
        <boxGeometry args={[0.16, 0.12, 0.05]} />
      </Part>
      {apron
        ? [-0.15, -0.05, 0.05, 0.15].map((x) => (
            <group key={x} position={[x, y - 0.25, r + 0.02]} rotation={[0.08, 0, 0]}>
              <Part color={color} ink={0.1}>
                <boxGeometry args={[0.06, 0.42, 0.03]} />
              </Part>
              <Part color={studs} position={[0, -0.05, 0.02]} ink={0}>
                <sphereGeometry args={[0.03, 8, 6]} />
              </Part>
              <Part color={studs} position={[0, -0.22, 0.02]} ink={0}>
                <boxGeometry args={[0.07, 0.05, 0.02]} />
              </Part>
            </group>
          ))
        : null}
    </group>
  );
};

/** Schienenpanzer (Lorica segmentata): Eisenbänder um die Brust + Schulterschienen + Gürtel. */
export const Lorica: React.FC<{
  readonly metal?: string;
  readonly belt?: boolean;
}> = ({ metal = ROME.iron, belt = true }) => {
  const bands = [1.56, 1.72, 1.88, 2.04, 2.2];
  return (
    <group>
      {bands.map((y) => {
        const h = 0.15;
        return (
          <Part key={y} color={metal} position={[0, y, 0]} ink={0.025}>
            <cylinderGeometry
              args={[bodyR(y + h / 2) + 0.045, bodyR(y - h / 2) + 0.045, h, 28]}
            />
          </Part>
        );
      })}
      {/* Brustplatte oben */}
      <Part color={metal} position={[0, 2.25, 0]} scale={[1, 0.45, 1]} ink={0.03}>
        <sphereGeometry args={[0.6, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
      {/* Schulterschienen */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.42, 2.38, 0]} rotation={[0, 0, sd * -0.55]}>
          {[0, 1, 2].map((k) => (
            <Part
              key={k}
              color={metal}
              position={[sd * k * 0.11, -k * 0.06, 0]}
              scale={[0.3, 0.09, 0.42]}
              ink={0.08}
            >
              <sphereGeometry args={[1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </Part>
          ))}
        </group>
      ))}
      {/* Messing-Schnallen vorn */}
      {[1.8, 2.12].map((y) => (
        <Part key={y} color={ROME.bronze} position={[0, y, bodyR(y) + 0.07]} ink={0.15}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </Part>
      ))}
      {belt ? <Belt y={1.42} /> : null}
    </group>
  );
};

/**
 * Toga: weißer Überwurf über dem Körper, diagonaler Bausch (sinus) über die Schulter.
 * `stripe` = Purpurstreifen (toga praetexta / Senator), `color` purpur + `stripe` gold = Kaiser (toga picta).
 */
export const Toga: React.FC<{
  readonly color?: string;
  readonly stripe?: string | null;
}> = ({ color = ROME.marble, stripe = null }) => {
  const folds = useCanvasTexture(`toga-folds`, [256, 256], (c, w, h) => {
    c.fillStyle = "#FFFFFF";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(0,0,0,0.13)";
    c.lineWidth = 6;
    for (let i = -4; i < 8; i++) {
      c.beginPath();
      c.moveTo(i * 40, h);
      c.quadraticCurveTo(i * 40 + 30, h * 0.5, i * 40 + 90, 0);
      c.stroke();
    }
  });
  const tilt = 0.62;
  return (
    <group>
      <Part color={color} map={folds} position={[0, 1.75, 0]} ink={0.035}>
        <capsuleGeometry args={[0.585, 0.55, 8, 24]} />
      </Part>
      <group position={[0, 1.86, 0]} rotation={[0, 0, tilt]}>
        <Part
          color={color}
          map={folds}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1 / Math.cos(tilt) + 0.03, 1, 1]}
          ink={0.04}
        >
          <torusGeometry args={[0.6, 0.14, 12, 40]} />
        </Part>
        {stripe ? (
          <mesh
            position={[0, 0.13, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1 / Math.cos(tilt) + 0.03, 1, 1]}
          >
            <torusGeometry args={[0.66, 0.045, 8, 40]} />
            <ToonM color={stripe} />
          </mesh>
        ) : null}
      </group>
      {/* Saum unten */}
      {stripe ? (
        <mesh position={[0, 1.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[bodyR(1.04) + 0.03, 0.04, 8, 32]} />
          <ToonM color={stripe} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Kaiser-/Feldherrenmantel (paludamentum) hinter dem Körper, mit Goldspange. */
export const ImperialCloak: React.FC<{
  readonly frame?: number;
  readonly color?: string;
  readonly clasp?: string;
}> = ({ frame = 0, color = ROME.purple, clasp = ROME.gold }) => (
  <group>
    <group position={[0, 2.5, 0]} rotation={[0.06 + Math.sin(frame * 0.08) * 0.035, 0, 0]}>
      <Part color={color} position={[0, -0.95, 0]} double ink={0.03}>
        <cylinderGeometry
          args={[0.6, 1.0, 1.9, 28, 1, true, Math.PI * 0.42, Math.PI * 1.16]}
        />
      </Part>
    </group>
    {/* Überwurf auf den Schultern */}
    <Part color={color} position={[0, 2.36, 0]} scale={[1, 0.55, 1]} ink={0.035}>
      <sphereGeometry args={[0.66, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </Part>
    <Part color={clasp} position={[0.34, 2.36, 0.48]} ink={0.12}>
      <sphereGeometry args={[0.1, 14, 10]} />
    </Part>
    <Part color={clasp} position={[-0.34, 2.36, 0.48]} ink={0.12}>
      <sphereGeometry args={[0.1, 14, 10]} />
    </Part>
  </group>
);

const useFurTexture = (fur: string) =>
  useCanvasTexture(`fur-${fur}`, [256, 256], (c, w, h) => {
    c.fillStyle = fur;
    c.fillRect(0, 0, w, h);
    const r = seeded(7);
    c.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 70; i++) {
      c.beginPath();
      c.ellipse(r() * w, r() * h, 3 + r() * 5, 10 + r() * 14, r() * 0.6 - 0.3, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "rgba(255,255,255,0.14)";
    for (let i = 0; i < 40; i++) {
      c.beginPath();
      c.ellipse(r() * w, r() * h, 2 + r() * 4, 8 + r() * 10, r() * 0.6 - 0.3, 0, Math.PI * 2);
      c.fill();
    }
  });

/** Fellumhang: zottiger Kragen + kurzer Fellmantel hinten (Goten/Germanen). */
export const FurCloak: React.FC<{
  readonly frame?: number;
  readonly color?: string;
}> = ({ frame = 0, color = ROME.fur }) => {
  const tex = useFurTexture(color);
  const tufts = 14;
  return (
    <group>
      <group position={[0, 2.45, 0]} rotation={[0.08 + Math.sin(frame * 0.07) * 0.03, 0, 0]}>
        <Part color="#FFFFFF" map={tex} position={[0, -0.7, 0]} double ink={0.03}>
          <cylinderGeometry
            args={[0.62, 0.9, 1.4, 24, 1, true, Math.PI * 0.45, Math.PI * 1.1]}
          />
        </Part>
      </group>
      <Part color="#FFFFFF" map={tex} position={[0, 2.36, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0.04}>
        <torusGeometry args={[0.5, 0.2, 12, 32]} />
      </Part>
      {Array.from({ length: tufts }, (_, i) => {
        const a = (i / tufts) * Math.PI * 2;
        return (
          <Part
            key={i}
            color="#FFFFFF"
            map={tex}
            position={[Math.sin(a) * 0.62, 2.2, Math.cos(a) * 0.62]}
            rotation={[Math.cos(a) * 2.6, 0, -Math.sin(a) * 2.6]}
            ink={0.07}
          >
            <coneGeometry args={[0.12, 0.34, 8]} />
          </Part>
        );
      })}
    </group>
  );
};

/** Karierte Wolltunika (Überzug über den Körper) – setzt Barbaren farblich von Römern ab. */
export const BarbarianTunic: React.FC<{
  readonly color?: string;
  readonly check?: string;
}> = ({ color = ROME.gothWool, check = ROME.gothCheck }) => {
  const tex = useCanvasTexture(`tunic-${color}-${check}`, [256, 256], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.fillStyle = check;
    c.globalAlpha = 0.55;
    for (let i = 0; i < 8; i++) {
      c.fillRect((i * w) / 8, 0, w / 24, h);
      c.fillRect(0, (i * h) / 8, w, h / 24);
    }
    c.globalAlpha = 1;
  });
  tex.repeat.set(2, 1);
  return (
    <group>
      <Part color="#FFFFFF" map={tex} position={[0, 1.75, 0]} ink={0.035}>
        <capsuleGeometry args={[0.58, 0.55, 8, 24]} />
      </Part>
      <Belt y={1.38} color={ROME.leather} studs={ROME.ironDark} apron={false} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Kostüme – Hand (Steckplatz `hands`, Ursprung Handmitte)              */
/* ------------------------------------------------------------------ */

/** Scutum: großer rechteckiger, gewölbter Legionärsschild (rot, Goldflügel + Blitze, Buckel). */
export const Scutum: React.FC<{
  readonly color?: string;
  readonly position?: P3;
  readonly rotation?: P3;
}> = ({ color = ROME.legionRed, position = [0.05, 0.3, 0.72], rotation = [0, 0, 0] }) => {
  const tex = useCanvasTexture(`scutum-${color}`, [256, 352], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = ROME.gold;
    c.lineWidth = 14;
    c.strokeRect(14, 14, w - 28, h - 28);
    c.lineWidth = 5;
    c.strokeRect(32, 32, w - 64, h - 64);
    c.fillStyle = ROME.gold;
    const cx = w / 2;
    const cy = h / 2;
    // Flügel
    for (const sd of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.ellipse(cx + sd * (55 + k * 10), cy - 30 + k * 28, 52 - k * 8, 11, sd * -0.5, 0, Math.PI * 2);
        c.fill();
      }
      // Blitze
      c.lineWidth = 10;
      c.strokeStyle = ROME.gold;
      c.beginPath();
      c.moveTo(cx + sd * 30, cy + 40);
      c.lineTo(cx + sd * 60, cy + 85);
      c.lineTo(cx + sd * 42, cy + 92);
      c.lineTo(cx + sd * 78, cy + 140);
      c.stroke();
      c.beginPath();
      c.moveTo(cx + sd * 30, cy - 60);
      c.lineTo(cx + sd * 50, cy - 105);
      c.lineTo(cx + sd * 34, cy - 110);
      c.lineTo(cx + sd * 60, cy - 150);
      c.stroke();
    }
    // Rahmen der Buckelplatte
    c.fillStyle = ROME.goldDark;
    c.fillRect(cx - 40, cy - 40, 80, 80);
  });
  return (
    <group position={position} rotation={rotation}>
      <Part color="#FFFFFF" map={tex} ink={0.03}>
        <boxGeometry args={[0.98, 1.34, 0.08]} />
      </Part>
      <Part color={ROME.iron} position={[0, 0, 0.05]} scale={[1, 1, 0.6]} ink={0.08}>
        <sphereGeometry args={[0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
    </group>
  );
};

/** Gladius: Kurzschwert, Klinge zeigt nach oben. */
export const Gladius: React.FC<{ readonly rotation?: P3 }> = ({ rotation = [-0.25, 0, 0] }) => (
  <group rotation={rotation}>
    <Part color={ROME.iron} position={[0, 0.55, 0]} ink={0.08}>
      <boxGeometry args={[0.12, 0.7, 0.03]} />
    </Part>
    <Part color={ROME.iron} position={[0, 0.93, 0]} rotation={[0, Math.PI / 4, 0]} ink={0.08}>
      <coneGeometry args={[0.085, 0.16, 4]} />
    </Part>
    <Part color={ROME.bronze} position={[0, 0.17, 0]} ink={0.1}>
      <boxGeometry args={[0.28, 0.06, 0.1]} />
    </Part>
    <Part color={ROME.wood} position={[0, 0.02, 0]} ink={0.1}>
      <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
    </Part>
    <Part color={ROME.bronze} position={[0, -0.12, 0]} ink={0.12}>
      <sphereGeometry args={[0.07, 12, 8]} />
    </Part>
  </group>
);

/** Zepter mit Adlerkugel (Kaiser). */
export const Scepter: React.FC<{ readonly rotation?: P3 }> = ({ rotation = [0, 0, 0] }) => (
  <group rotation={rotation}>
    <Part color={ROME.gold} position={[0, 0.35, 0]} ink={0.12}>
      <cylinderGeometry args={[0.035, 0.035, 1.5, 8]} />
    </Part>
    <Part color={ROME.gold} position={[0, 1.15, 0]} ink={0.08}>
      <sphereGeometry args={[0.12, 16, 12]} />
    </Part>
    <Eagle position={[0, 1.33, 0]} scale={0.35} />
  </group>
);

/** Germanischer Rundschild aus Brettern mit Eisenbuckel. */
export const RoundShield: React.FC<{
  readonly color?: string;
  readonly position?: P3;
  readonly rotation?: P3;
}> = ({ color = "#B9773E", position = [0.05, 0.25, 0.65], rotation = [0, 0, 0] }) => {
  const tex = useCanvasTexture(`round-${color}`, [256, 256], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "rgba(0,0,0,0.3)";
    c.lineWidth = 4;
    for (let i = 1; i < 6; i++) {
      c.beginPath();
      c.moveTo((i * w) / 6, 0);
      c.lineTo((i * w) / 6, h);
      c.stroke();
    }
    c.strokeStyle = "#E7D3A8";
    c.lineWidth = 16;
    c.beginPath();
    c.arc(w / 2, h / 2, 70, 0, Math.PI * 2);
    c.stroke();
  });
  return (
    <group position={position} rotation={rotation}>
      <Part color="#FFFFFF" map={tex} rotation={[Math.PI / 2, Math.PI / 2, 0]} ink={0.035}>
        <cylinderGeometry args={[0.62, 0.62, 0.07, 32]} />
      </Part>
      <Part color={ROME.ironDark} ink={0}>
        <torusGeometry args={[0.62, 0.045, 6, 40]} />
      </Part>
      <Part color={ROME.ironDark} position={[0, 0, 0.04]} ink={0.08}>
        <sphereGeometry args={[0.15, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
    </group>
  );
};

/** Speer (framea / Lanze), senkrecht. */
export const Spear: React.FC<{ readonly rotation?: P3; readonly length?: number }> = ({
  rotation = [0, 0, 0],
  length = 3,
}) => (
  <group rotation={rotation}>
    <Part color={ROME.wood} position={[0, length * 0.35, 0]} ink={0.12}>
      <cylinderGeometry args={[0.035, 0.035, length, 8]} />
    </Part>
    <Part color={ROME.iron} position={[0, length * 0.85 + 0.15, 0]} scale={[1, 1, 0.35]} ink={0.08}>
      <coneGeometry args={[0.09, 0.4, 4]} />
    </Part>
  </group>
);

/* ------------------------------------------------------------------ */
/* Fertige Figuren                                                      */
/* ------------------------------------------------------------------ */

const armComp = (arms: [number, number] | undefined, i: number) =>
  (i === 0 ? 1 : -1) * (arms?.[i] ?? 0.25);

/** Legionär: rote Tunika, Schienenpanzer, Helm mit Busch, Gladius + Scutum. */
export const Legionary: React.FC<
  ToonieProps & {
    readonly transverse?: boolean;
    readonly shield?: boolean;
    /** Hauptfigur: Querbusch + gelbes Halstuch (Erkennungsmerkmal in jeder Einstellung). */
    readonly hero?: boolean;
  }
> = ({ transverse, shield = true, hero = false, ...p }) => (
  <Toonie
    suit={ROME.legionRed}
    head={<LegionaryHelmet transverse={transverse ?? hero} />}
    body={
      <>
        <Lorica />
        {hero ? <Focale frame={p.frame} /> : null}
      </>
    }
    hands={[
      <group key="r" rotation={[0, 0, armComp(p.arms, 0)]}>
        <Gladius />
      </group>,
      shield ? (
        <group key="l" rotation={[0, 0, armComp(p.arms, 1)]}>
          <Scutum />
        </group>
      ) : null,
    ]}
    {...p}
  />
);

/** Kaiser: Purpurmantel, weiße Tunika mit Goldsaum, goldener Lorbeer, Zepter. */
export const Emperor: React.FC<ToonieProps & { readonly scepter?: boolean }> = ({
  scepter = true,
  ...p
}) => (
  <Toonie
    suit={ROME.marble}
    head={<LaurelWreath color={ROME.gold} />}
    body={
      <>
        <Toga color={ROME.marble} stripe={ROME.purple} />
        <ImperialCloak frame={p.frame} />
      </>
    }
    hands={[
      scepter ? (
        <group key="r" rotation={[0, 0, armComp(p.arms, 0)]}>
          <Scepter />
        </group>
      ) : null,
    ]}
    {...p}
  />
);

/** Senator: weiße Toga mit Purpurstreifen, Schriftrolle. */
export const Senator: React.FC<ToonieProps> = (p) => (
  <Toonie
    suit={ROME.marble}
    body={<Toga stripe={ROME.purple} />}
    hands={[
      <group key="r" rotation={[0, 0, armComp(p.arms, 0)]}>
        <Scroll position={[0, 0.05, 0.2]} scale={0.5} />
      </group>,
    ]}
    {...p}
  />
);

/** Gote: Fellumhang, karierte Tunika, Kappe, Zöpfe, Bart, Rundschild + Speer. Keine Hörner. */
export const Goth: React.FC<
  ToonieProps & { readonly cap?: boolean; readonly gear?: boolean; readonly hairColor?: string }
> = ({ cap = true, gear = true, hairColor = ROME.hair, ...p }) => (
  <Toonie
    suit={ROME.gothWool}
    head={
      <>
        <Braids color={hairColor} />
        <Beard color={hairColor} frame={p.frame} />
        {cap ? <GothCap /> : null}
      </>
    }
    body={
      <>
        <BarbarianTunic />
        <FurCloak frame={p.frame} />
      </>
    }
    hands={
      gear
        ? [
            <group key="r" rotation={[0, 0, armComp(p.arms, 0)]}>
              <Spear />
            </group>,
            <group key="l" rotation={[0, 0, armComp(p.arms, 1)]}>
              <RoundShield />
            </group>,
          ]
        : undefined
    }
    {...p}
  />
);

/* ------------------------------------------------------------------ */
/* Umgebung                                                             */
/* ------------------------------------------------------------------ */

/** Römischer Himmel: Verlauf (nebelfrei), weiche Sonne, flache Wolken. */
export const RomeSky: React.FC<{
  readonly top?: string;
  readonly bottom?: string;
  readonly sun?: P3 | null;
  readonly sunColor?: string;
  readonly sunRadius?: number;
  readonly clouds?: boolean;
  readonly cloudColor?: string;
  readonly frame?: number;
}> = ({
  top = ROME.skyTop,
  bottom = ROME.skyBottom,
  sun = [-30, 60, -150],
  sunColor = ROME.sun,
  sunRadius = 7,
  clouds = true,
  cloudColor = "#FFFFFF",
  frame = 0,
}) => {
  const tex = useCanvasTexture(`romesky-${top}-${bottom}`, [8, 256], (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(0.42, top);
    g.addColorStop(0.5, bottom);
    g.addColorStop(1, bottom);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[300, 32, 16]} />
        <meshBasicMaterial map={tex} side={BackSide} depthWrite={false} fog={false} />
      </mesh>
      {sun ? <SoftSun position={sun} color={sunColor} radius={sunRadius} /> : null}
      {clouds ? (
        <>
          <Cloud position={[-30 + frame * 0.01, 38, -140]} scale={7} color={cloudColor} />
          <Cloud position={[38 + frame * 0.008, 50, -150]} scale={9} color={cloudColor} />
          <Cloud position={[8 + frame * 0.012, 70, -160]} scale={6} color={cloudColor} />
        </>
      ) : null}
    </>
  );
};

/** Weiche Cartoon-Sonne: Scheibe + Lichthof (ohne Kontur). */
export const SoftSun: React.FC<{
  readonly position: P3;
  readonly radius?: number;
  readonly color?: string;
}> = ({ position, radius = 7, color = ROME.sun }) => (
  <group position={position}>
    <mesh>
      <circleGeometry args={[radius, 48]} />
      <meshBasicMaterial color={color} fog={false} />
    </mesh>
    {[1.35, 1.8, 2.5].map((k, i) => (
      <mesh key={k} position={[0, 0, -1 - i]}>
        <circleGeometry args={[radius * k, 48]} />
        <meshBasicMaterial
          color={color === ROME.sun ? "#FFF6D0" : color}
          transparent
          opacity={0.32 - i * 0.09}
          depthWrite={false}
          fog={false}
        />
      </mesh>
    ))}
  </group>
);

/** Flache Cartoon-Wolke (ohne Kontur, flacher Boden). */
export const Cloud: React.FC<{
  readonly position: P3;
  readonly scale?: number;
  readonly color?: string;
}> = ({ position, scale = 1, color = "#FFFFFF" }) => (
  <group position={position} scale={[scale, scale * 0.8, scale * 0.4]}>
    {(
      [
        [0, 0.35, 0, 1],
        [-1.1, 0.1, 0, 0.75],
        [1.15, 0.12, 0, 0.8],
        [0.45, 0.85, 0, 0.7],
        [-0.55, 0.65, 0, 0.6],
      ] as const
    ).map(([x, y, z, r]) => (
      <mesh key={`${x}-${y}`} position={[x, y, z]}>
        <sphereGeometry args={[r, 20, 14]} />
        <meshBasicMaterial color={color} fog={false} />
      </mesh>
    ))}
    <mesh position={[0, -0.05, 0]}>
      <boxGeometry args={[3.2, 0.5, 1.4]} />
      <meshBasicMaterial color={color} fog={false} />
    </mesh>
  </group>
);

/** Ferne Hügel (die sieben Hügel) als Horizontabschluss. */
export const Hills: React.FC<{ readonly z?: number; readonly color?: string }> = ({
  z = -70,
  color = ROME.hill,
}) => (
  <group position={[0, -0.5, z]}>
    {[
      [-34, 7, 20],
      [-10, 9, 18],
      [14, 6.5, 17],
      [36, 8, 21],
      [58, 6, 16],
      [-58, 6, 16],
    ].map(([x, h, w], i) => (
      <Part
        key={x}
        color={i % 2 ? color : "#97B062"}
        position={[x, 0, -i * 2]}
        scale={[w, h, 6]}
        ink={0.01}
        shadow={false}
      >
        <sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
    ))}
  </group>
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                             */
/* ------------------------------------------------------------------ */

/**
 * Kolosseum: elliptischer Bau, 3 Arkadenreihen + Attika mit Fenstern, Halbsäulen,
 * Gesimse, dunkle Gewölbegänge hinter jedem Bogen, Zuschauerränge und Arena.
 * `ruin` 0..1 lässt die oberen Ringe auf einer Seite einstürzen (wie heute; animierbar),
 * `ruinAt` = Winkel der Lücke. Außenmaß bei scale 1 ca. 15 × 12, Höhe 6.9.
 *
 * Monumental wirkt er nur groß: in der Totale `scale` 2.4–3 und weit hinten (z −30 … −40),
 * Kamera tief (y ≈ 2) und leicht nach oben – dann überragt er die Figuren 3–4-fach.
 * Leistung: Der Bogen-Baum wird nur bei Änderung von Form/`ruin` neu aufgebaut (memo).
 * `detail="far"` (ab ~30 Einheiten Abstand) lässt Fensterbänke, Masten und feine
 * Konturen weg (≈ 40 % weniger Meshes); `segments` 24 statt 32 spart weitere 25 %.
 */
export const Colosseum: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly ruin?: number;
  readonly ruinAt?: number;
  readonly color?: string;
  readonly segments?: number;
  readonly detail?: "full" | "far";
}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  ruin = 0,
  ruinAt = Math.PI * 0.22,
  color = ROME.sandstone,
  segments = 32,
  detail = "full",
}) => {
  const N = segments;
  const a = 6; // Apothem Mitte Wand
  const d = 0.5;
  const w = 2 * (a + d / 2) * Math.tan(Math.PI / N);
  const far = detail === "far";
  const geos = useMemo(() => {
    const tiers = [
      { h: 1.95, aw: w * 0.62, spring: 1.15 },
      { h: 1.75, aw: w * 0.58, spring: 1.0 },
      { h: 1.75, aw: w * 0.58, spring: 1.0 },
    ];
    return {
      tiers,
      atticH: 1.25,
      bays: tiers.map((t) => archBay(w, t.h, d, t.aw, t.spring)),
      lines: tiers.map((t) => archLine(t.h, t.aw, t.spring, 0.05)),
      attic: windowBay(w, 1.25, d, w * 0.22, 0.34),
    };
  }, [w]);
  const seats = useCanvasTexture("colosseum-seats", [64, 256], (c, wd, h) => {
    c.fillStyle = ROME.sandLight;
    c.fillRect(0, 0, wd, h);
    c.fillStyle = "rgba(120,70,30,0.35)";
    for (let i = 0; i < 16; i++) c.fillRect(0, (i * h) / 16, wd, 5);
  });
  seats.repeat.set(24, 1);

  // Der ganze Bogen-Ring hängt nur an Form und Ruine – nicht am Frame.
  const bays = useMemo(() => {
    const { tiers, atticH } = geos;
    const rnd = seeded(91);
    const jag = Array.from({ length: N }, () => rnd());
    const keptTiers = (theta: number) => {
      if (ruin <= 0) return 4;
      let dt = Math.abs(theta - ruinAt) % (Math.PI * 2);
      if (dt > Math.PI) dt = Math.PI * 2 - dt;
      const half = ruin * Math.PI * 0.42;
      if (dt > half) return 4;
      const edge = dt / Math.max(0.001, half); // 0 Mitte … 1 Rand
      return edge > 0.8 ? 3 : 2;
    };
    // Gewölbegang: dunkle Rückwand hinter den Bögen (liest sich als Tiefe, auch klein)
    const backZ = -d / 2 - 0.45;
    const backW = w * ((a + backZ) / a) + 0.02;
    const out = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      let keep = keptTiers(th);
      if (keep < 4 && jag[i] > 0.6) keep = Math.min(4, keep + 1);
      let y = 0;
      const parts = [];
      for (let t = 0; t < 3 && t < keep; t++) {
        const T = tiers[t];
        parts.push(
          <group key={t} position={[0, y + T.h / 2, 0]}>
            <GeoPart geo={geos.bays[t]} color={color} ink={0.025} />
            <Flat geo={geos.lines[t]} position={[0, 0, d / 2 + 0.006]} />
            {t > 0 && !far ? (
              <Part color={ROME.sandLight} position={[0, -T.h / 2 + 0.14, d / 2 - 0.08]} ink={0.06}>
                <boxGeometry args={[T.aw + 0.04, 0.28, 0.14]} />
              </Part>
            ) : null}
            {/* Halbsäule an der Kante */}
            <Part color={ROME.sandLight} position={[w / 2, 0, d / 2 + 0.03]} ink={far ? 0 : 0.05}>
              <boxGeometry args={[0.2, T.h, 0.12]} />
            </Part>
            {/* Gesims */}
            <Part color={ROME.sandLight} position={[0, T.h / 2 - 0.08, 0.08]} ink={0.04}>
              <boxGeometry args={[w * 1.06, 0.17, d + 0.26]} />
            </Part>
          </group>,
        );
        y += T.h;
      }
      if (keep >= 4) {
        parts.push(
          <group key="attic" position={[0, y + atticH / 2, 0]}>
            <GeoPart geo={geos.attic} color={color} ink={0.025} />
            <Part color={ROME.sandLight} position={[w / 2, 0, d / 2 + 0.03]} ink={far ? 0 : 0.05}>
              <boxGeometry args={[0.16, atticH, 0.1]} />
            </Part>
            <Part color={ROME.sandLight} position={[0, atticH / 2 - 0.07, 0.06]} ink={0.04}>
              <boxGeometry args={[w * 1.06, 0.15, d + 0.2]} />
            </Part>
            {/* Mast für das Sonnensegel (velarium) – gibt der Krone Maßstab */}
            {!far && i % 2 === 0 ? (
              <Part color={ROME.wood} position={[w / 2, atticH / 2 + 0.3, d / 2 - 0.05]} ink={0.1}>
                <boxGeometry args={[0.07, 0.6, 0.07]} />
              </Part>
            ) : null}
          </group>,
        );
        y += atticH;
      }
      parts.push(
        <mesh key="vault" position={[0, y / 2, backZ]}>
          <planeGeometry args={[backW, y]} />
          <meshBasicMaterial color={ROME.vault} side={DoubleSide} />
        </mesh>,
      );
      out.push(
        <group
          key={i}
          position={[Math.sin(th) * a, 0, Math.cos(th) * a]}
          rotation={[0, th, 0]}
        >
          {parts}
        </group>,
      );
    }
    return out;
  }, [geos, N, a, w, ruin, ruinAt, color, far]);

  const arena = a * 0.42;
  // Ränge: von der Oberkante der Gänge (bei Ruine tiefer) zur Arena
  const seatTop = ruin > 0 ? 3.7 : 5.45;
  const seatR = a - d / 2 - 0.5;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group scale={[1.22, 1, 1]}>
        {bays}
        <Part
          color="#FFFFFF"
          map={seats}
          position={[0, (seatTop + 0.6) / 2, 0]}
          double
          ink={0}
        >
          <cylinderGeometry args={[seatR, arena, seatTop - 0.6, N, 1, true]} />
        </Part>
        <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[arena, N]} />
          <ToonM color={ROME.ground} />
        </mesh>
        {/* Sockelstufe */}
        <Part color={ROME.ochre} position={[0, 0.08, 0]} ink={0.01}>
          <cylinderGeometry args={[a + 0.75, a + 0.85, 0.16, N]} />
        </Part>
      </group>
    </group>
  );
};

/** Einzelne Säule (Marmor, kanneliert) – `broken` 0..1 kappt sie schräg (Ruine). */
export const Column: React.FC<{
  readonly position?: P3;
  readonly height?: number;
  readonly radius?: number;
  readonly color?: string;
  readonly broken?: number;
  readonly rotation?: P3;
}> = ({
  position = [0, 0, 0],
  height = 3.6,
  radius = 0.3,
  color = ROME.marble,
  broken = 0,
  rotation,
}) => {
  const flutes = useCanvasTexture(`flutes-${color}`, [128, 8], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(90,70,40,0.18)";
    for (let i = 0; i < 12; i++) c.fillRect((i * w) / 12, 0, 3, h);
  });
  const shaft = height * (1 - broken * 0.65);
  return (
    <group position={position} rotation={rotation}>
      <Part color={color} position={[0, 0.1, 0]} ink={0.04}>
        <boxGeometry args={[radius * 2.6, 0.2, radius * 2.6]} />
      </Part>
      <Part color={color} position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} ink={0.05}>
        <torusGeometry args={[radius * 1.02, radius * 0.22, 8, 20]} />
      </Part>
      <Part color="#FFFFFF" map={flutes} position={[0, 0.2 + shaft / 2, 0]} ink={0.045}>
        <cylinderGeometry args={[radius * 0.9, radius, shaft, 20]} />
      </Part>
      {broken > 0 ? (
        <Part
          color={ROME.marbleShade}
          position={[0, 0.2 + shaft, 0]}
          rotation={[0.35, 0.4, 0.2]}
          ink={0.05}
        >
          <cylinderGeometry args={[radius * 0.92, radius * 0.92, 0.18, 7]} />
        </Part>
      ) : (
        <>
          <Part color={color} position={[0, 0.2 + shaft + 0.08, 0]} ink={0.05}>
            <cylinderGeometry args={[radius * 1.35, radius * 0.95, 0.18, 20]} />
          </Part>
          <Part color={color} position={[0, 0.2 + shaft + 0.25, 0]} ink={0.04}>
            <boxGeometry args={[radius * 2.7, 0.16, radius * 2.7]} />
          </Part>
        </>
      )}
    </group>
  );
};

/** Trümmer (Säulentrommeln, Quader) für Untergangs-Szenen. */
export const Rubble: React.FC<{
  readonly position?: P3;
  readonly count?: number;
  readonly spread?: number;
  readonly seed?: number;
  readonly color?: string;
}> = ({ position = [0, 0, 0], count = 7, spread = 2, seed = 5, color = ROME.sandstone }) => {
  const r = seeded(seed);
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => {
        const drum = r() > 0.5;
        const s = 0.25 + r() * 0.35;
        const x = (r() - 0.5) * spread * 2;
        const z = (r() - 0.5) * spread;
        const rot: P3 = [drum ? Math.PI / 2 : r() * 0.3, r() * 3, r() * 0.3];
        return drum ? (
          <Part key={i} color={ROME.marble} position={[x, s * 0.8, z]} rotation={rot} ink={0.05}>
            <cylinderGeometry args={[s * 0.9, s * 0.9, s * 1.2, 14]} />
          </Part>
        ) : (
          <Part key={i} color={color} position={[x, s * 0.5, z]} rotation={rot} ink={0.05}>
            <boxGeometry args={[s * 1.8, s, s * 1.2]} />
          </Part>
        );
      })}
    </group>
  );
};

/**
 * Säulentempel (Forum): Podium mit Treppe, `columns` Säulen vorn, Gebälk mit
 * Inschrift, Giebel mit dunklerem Tympanon, Ziegeldach, Cella. Breite ca. 7.
 */
export const Temple: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly columns?: number;
  readonly inscription?: string;
  readonly ruin?: number;
}> = ({
  position = [0, 0, 0],
  rotation,
  scale = 1,
  columns = 6,
  inscription = "S·P·Q·R",
  ruin = 0,
}) => {
  const W = 6.6;
  const D = 6;
  const podium = 1.1;
  const colH = 3.6;
  const top = podium + colH + 0.45;
  const geo = useMemo(() => gable(W + 0.5, 1.5, 0.4), []);
  const tym = useMemo(() => gable(W - 0.6, 1.0, 0.1), []);
  const font = useRomeFont();
  const text = useCanvasTexture(`temple-${inscription}-${font}`, [1024, 96], (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = ROME.ochreDark;
    c.font = fontStack(66);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(inscription, w / 2, h / 2 + 4, w - 80);
  });
  const slope = Math.atan2(1.5, (W + 0.5) / 2);
  const roofLen = Math.hypot(1.5, (W + 0.5) / 2) + 0.1;
  const roofY = top + 0.6 + 0.5;
  const intact = ruin < 0.5;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Podium + Treppe */}
      <Part color={ROME.marbleShade} position={[0, podium / 2, -0.4]} ink={0.02}>
        <boxGeometry args={[W + 0.6, podium, D]} />
      </Part>
      {[0, 1, 2, 3].map((k) => (
        <Part
          key={k}
          color={ROME.marble}
          position={[0, (podium / 4) * (k + 0.5), D / 2 - 0.4 + 0.9 - k * 0.3]}
          ink={0.02}
        >
          <boxGeometry args={[W - 0.6, podium / 4, 0.32]} />
        </Part>
      ))}
      {/* Cella */}
      <Part color={ROME.sandLight} position={[0, podium + colH / 2, -1.6]} ink={0.02}>
        <boxGeometry args={[W - 1.4, colH, D - 2.6]} />
      </Part>
      <mesh position={[0, podium + 1.1, -1.6 + (D - 2.6) / 2 + 0.01]}>
        <planeGeometry args={[1.1, 2.2]} />
        <meshBasicMaterial color={"#5B3A22"} />
      </mesh>
      {/* Säulen vorn + an den Seiten */}
      {Array.from({ length: columns }, (_, i) => {
        const x = -W / 2 + 0.45 + (i * (W - 0.9)) / (columns - 1);
        const br = ruin > 0 && (i === 1 || i === columns - 2) ? ruin : 0;
        return <Column key={i} position={[x, podium, D / 2 - 0.75]} height={colH} broken={br} />;
      })}
      {[-1, 1].map((sd) =>
        [0, 1].map((k) => (
          <Column
            key={`${sd}-${k}`}
            position={[sd * (W / 2 - 0.45), podium, D / 2 - 2.1 - k * 1.5]}
            height={colH}
          />
        )),
      )}
      {intact ? (
        <>
          {/* Gebälk */}
          <Part color={ROME.marble} position={[0, top + 0.3, -0.4]} ink={0.02}>
            <boxGeometry args={[W + 0.4, 0.6, D]} />
          </Part>
          <mesh position={[0, top + 0.3, D / 2 - 0.4 + 0.012]}>
            <planeGeometry args={[W, 0.58]} />
            <meshBasicMaterial map={text} transparent />
          </mesh>
          {/* Giebel */}
          <GeoPart geo={geo} color={ROME.marble} position={[0, top + 0.6 + 0.5, D / 2 - 0.6]} ink={0.02} />
          <mesh geometry={tym} position={[0, top + 0.6 + 0.42, D / 2 - 0.36]}>
            <ToonM color={ROME.marbleShade} />
          </mesh>
          {/* Dach */}
          {[-1, 1].map((sd) => (
            <Part
              key={sd}
              color={ROME.roof}
              position={[sd * ((W + 0.5) / 4), roofY + 0.25, -0.6]}
              rotation={[0, 0, -sd * slope]}
              ink={0.015}
            >
              <boxGeometry args={[roofLen, 0.14, D + 0.2]} />
            </Part>
          ))}
        </>
      ) : null}
    </group>
  );
};

/** Aquädukt: `bays` große Bögen unten, doppelt so viele kleine oben, Wasserrinne. Entlang x. */
export const Aqueduct: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly bays?: number;
  readonly color?: string;
  readonly water?: boolean;
}> = ({
  position = [0, 0, 0],
  rotation,
  scale = 1,
  bays = 5,
  color = "#DDA867",
  water = true,
}) => {
  const W = 2.4;
  const H1 = 4.2;
  const H2 = 2.0;
  const d = 0.9;
  const g = useMemo(
    () => ({
      big: archBay(W, H1, d, 1.7, 2.9),
      bigLine: archLine(H1, 1.7, 2.9, 0.06),
      small: archBay(W / 2, H2, d * 0.85, 0.75, 1.25),
      smallLine: archLine(H2, 0.75, 1.25, 0.05),
    }),
    [],
  );
  const x0 = (-(bays - 1) * W) / 2;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {Array.from({ length: bays }, (_, i) => (
        <group key={i} position={[x0 + i * W, 0, 0]}>
          <group position={[0, H1 / 2, 0]}>
            <GeoPart geo={g.big} color={color} ink={0.02} />
            <Flat geo={g.bigLine} position={[0, 0, d / 2 + 0.006]} />
          </group>
          <Part color={ROME.sandLight} position={[0, H1 + 0.08, 0]} ink={0.04}>
            <boxGeometry args={[W, 0.16, d + 0.2]} />
          </Part>
          {[-W / 4, W / 4].map((x) => (
            <group key={x} position={[x, H1 + 0.16 + H2 / 2, 0]}>
              <GeoPart geo={g.small} color={color} ink={0.03} />
              <Flat geo={g.smallLine} position={[0, 0, (d * 0.85) / 2 + 0.006]} />
            </group>
          ))}
        </group>
      ))}
      {/* Rinne (specus) */}
      <Part color={ROME.sandLight} position={[0, H1 + 0.16 + H2 + 0.2, 0]} ink={0.01}>
        <boxGeometry args={[bays * W, 0.4, d]} />
      </Part>
      {water ? (
        <mesh position={[0, H1 + 0.16 + H2 + 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[bays * W - 0.1, d * 0.5]} />
          <meshBasicMaterial color="#5EC4E8" />
        </mesh>
      ) : null}
    </group>
  );
};

/** Römisches Stadthaus: Putzwand, Ziegeldach (Walm/Sattel), Fenster, Tür. Breite w. */
export const RomanHouse: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly w?: number;
  readonly h?: number;
  readonly d?: number;
  readonly wall?: string;
  readonly roof?: string;
  readonly gableRoof?: boolean;
  readonly floors?: number;
  readonly door?: boolean;
}> = ({
  position = [0, 0, 0],
  rotation,
  w = 2.4,
  h = 2.4,
  d = 2,
  wall = HOUSE_WALLS[0],
  roof = ROME.roof,
  gableRoof = false,
  floors = 1,
  door = true,
}) => {
  const rh = Math.min(w, d) * 0.32;
  const r0 = Math.SQRT1_2;
  const winW = 0.26;
  const fh = h / floors;
  const wins = [];
  const nx = Math.max(1, Math.floor(w / 0.8));
  for (let f = 0; f < floors; f++) {
    for (let k = 0; k < nx; k++) {
      const x = -w / 2 + ((k + 0.5) * w) / nx;
      if (f === 0 && door && k === Math.floor(nx / 2)) continue;
      wins.push(
        <mesh key={`${f}-${k}`} position={[x, f * fh + fh * 0.58, d / 2 + 0.01]}>
          <planeGeometry args={[winW, fh * 0.34]} />
          <meshBasicMaterial color="#5B3A22" />
        </mesh>,
      );
    }
  }
  return (
    <group position={position} rotation={rotation}>
      <Part color={wall} position={[0, h / 2, 0]} ink={0.02}>
        <boxGeometry args={[w, h, d]} />
      </Part>
      {gableRoof ? (
        <Part
          color={roof}
          position={[0, h + rh / 2 - 0.02, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[d * 0.58, 1, 1]}
          ink={0.03}
        >
          <cylinderGeometry args={[0.0, 1, rh, 4, 1, false, Math.PI / 4]} />
        </Part>
      ) : (
        <Part
          color={roof}
          position={[0, h + rh / 2 - 0.02, 0]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[(w + 0.3) * r0, 1, (d + 0.3) * r0]}
          ink={0.03}
        >
          <coneGeometry args={[1, rh, 4]} />
        </Part>
      )}
      {/* Dachrand */}
      <Part color={ROME.terracotta} position={[0, h, 0]} ink={0.03}>
        <boxGeometry args={[w + 0.26, 0.1, d + 0.26]} />
      </Part>
      {wins}
      {door ? (
        <mesh position={[0, fh * 0.32, d / 2 + 0.012]}>
          <planeGeometry args={[0.5, fh * 0.6]} />
          <meshBasicMaterial color={ROME.ochreDark} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Zypresse (dunkle schlanke Silhouette – typisch Italien). */
export const Cypress: React.FC<{ readonly position?: P3; readonly height?: number }> = ({
  position = [0, 0, 0],
  height = 3.4,
}) => (
  <group position={position}>
    <Part color={ROME.cypress} position={[0, height / 2 + 0.2, 0]} scale={[0.42, height / 2, 0.42]} ink={0.04}>
      <sphereGeometry args={[1, 16, 12]} />
    </Part>
  </group>
);

/** Pinie (Schirmkiefer) – das „Rom-Baum“-Symbol. */
export const UmbrellaPine: React.FC<{ readonly position?: P3; readonly height?: number }> = ({
  position = [0, 0, 0],
  height = 3.6,
}) => (
  <group position={position}>
    <Part color={ROME.wood} position={[0, height / 2, 0]} rotation={[0, 0, 0.08]} ink={0.06}>
      <cylinderGeometry args={[0.09, 0.14, height, 8]} />
    </Part>
    <Part color={ROME.pine} position={[0.1, height + 0.15, 0]} scale={[1.6, 0.55, 1.4]} ink={0.04}>
      <sphereGeometry args={[1, 20, 12]} />
    </Part>
  </group>
);

/** Kuppelbau (Pantheon-Silhouette) für die Skyline. */
export const Rotunda: React.FC<{ readonly position?: P3; readonly scale?: number }> = ({
  position = [0, 0, 0],
  scale = 1,
}) => (
  <group position={position} scale={scale}>
    <Part color={ROME.sandLight} position={[0, 1.2, 0]} ink={0.02}>
      <cylinderGeometry args={[2, 2, 2.4, 28]} />
    </Part>
    <Part color={ROME.marbleShade} position={[0, 2.4, 0]} scale={[1, 0.62, 1]} ink={0.02}>
      <sphereGeometry args={[2, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </Part>
    <Part color={ROME.marble} position={[0, 1.0, 2.2]} ink={0.03}>
      <boxGeometry args={[2.6, 2.0, 1]} />
    </Part>
    <Part color={ROME.marble} position={[0, 2.28, 2.2]} rotation={[0, Math.PI / 4, 0]} scale={[1.95, 1, 0.75]} ink={0.04}>
      <coneGeometry args={[1, 0.55, 4]} />
    </Part>
  </group>
);

/**
 * Gestaffelte Stadthäuser-Skyline (deterministisch über `seed`): Reihen von Häusern
 * mit Ziegeldächern, dazwischen Zypressen und Pinien, optional eine Kuppel.
 */
export const RomanSkyline: React.FC<{
  readonly position?: P3;
  readonly width?: number;
  readonly rows?: number;
  readonly seed?: number;
  readonly rotunda?: boolean;
  readonly trees?: boolean;
}> = ({ position = [0, 0, 0], width = 30, rows = 2, seed = 3, rotunda = true, trees = true }) => {
  const r = seeded(seed);
  const items: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    let x = -width / 2 + r() * 1.2;
    const z = -row * 3.2;
    let k = 0;
    while (x < width / 2) {
      const w = 1.6 + r() * 1.8;
      const h = 1.6 + r() * (row === 0 ? 2.0 : 3.2) + row * 0.8;
      const floors = h > 3.2 ? 3 : h > 2.4 ? 2 : 1;
      if (trees && r() < 0.22) {
        items.push(
          r() < 0.6 ? (
            <Cypress key={`t${row}-${k}`} position={[x + 0.4, 0, z + 0.9]} height={2.8 + r() * 1.5} />
          ) : (
            <UmbrellaPine key={`t${row}-${k}`} position={[x + 0.6, 0, z + 0.8]} height={3 + r() * 1.2} />
          ),
        );
        x += 1.3;
      }
      items.push(
        <RomanHouse
          key={`h${row}-${k}`}
          position={[x + w / 2, 0, z + (r() - 0.5) * 0.6]}
          w={w}
          h={h}
          d={1.8 + r() * 0.8}
          floors={floors}
          wall={HOUSE_WALLS[Math.floor(r() * HOUSE_WALLS.length)]}
          gableRoof={r() < 0.4}
          door={row === 0}
        />,
      );
      x += w + 0.05 + r() * 0.3;
      k++;
    }
  }
  return (
    <group position={position}>
      {items}
      {rotunda ? <Rotunda position={[width * 0.22, 0, -rows * 3.2 - 1]} scale={1.1} /> : null}
    </group>
  );
};

/** y-Position einer sitzenden Figur (`sit={1}`) relativ zum Thron: Körper ruht auf dem Kissen. */
export const THRONE_SIT_Y = 0.66;

/**
 * Kaiserthron: Marmorstufen, goldener Sitz, Purpurkissen, Armlehnen mit Knäufen.
 * Die Lehne ist breiter (2,9) und höher (5,8) als ein Toonie-Kopf, dazu Seitenpfosten
 * mit Knäufen und ein Adler obenauf – so rahmt sie den Kopf und bleibt in der
 * Frontalen sichtbar. Figur: `position={[x, y + THRONE_SIT_Y, z + 0.3]}`, `sit={1}`.
 */
export const Throne: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly cushion?: string;
  readonly eagle?: boolean;
}> = ({ position = [0, 0, 0], rotation, scale = 1, cushion = ROME.purple, eagle = true }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* Stufen */}
    <Part color={ROME.marble} position={[0, 0.15, 0.25]} ink={0.02}>
      <boxGeometry args={[4.0, 0.3, 3.0]} />
    </Part>
    <Part color={ROME.marbleShade} position={[0, 0.42, 0]} ink={0.025}>
      <boxGeometry args={[3.3, 0.24, 2.3]} />
    </Part>
    {/* Sitz */}
    <Part color={ROME.gold} position={[0, 0.9, -0.1]} ink={0.03}>
      <boxGeometry args={[2.4, 0.7, 1.4]} />
    </Part>
    <Part color={ROME.goldDark} position={[0, 0.9, 0.61]} ink={0}>
      <boxGeometry args={[1.9, 0.36, 0.02]} />
    </Part>
    <Part color={cushion} position={[0, 1.33, 0]} scale={[1.15, 0.3, 1]} ink={0.04}>
      <capsuleGeometry args={[0.55, 0.6, 6, 16]} />
    </Part>
    {/* Lehne: Tafel + Rundbogen, deutlich größer als der Kopf */}
    <Part color={ROME.gold} position={[0, 2.8, -0.72]} ink={0.03}>
      <boxGeometry args={[2.9, 3.0, 0.28]} />
    </Part>
    <Part color={ROME.gold} position={[0, 4.3, -0.72]} rotation={[Math.PI / 2, 0, 0]} ink={0.035}>
      <cylinderGeometry args={[1.45, 1.45, 0.28, 32, 1, false, -Math.PI / 2, Math.PI]} />
    </Part>
    {/* Purpurbespannung (Tafel + Bogen) */}
    <Part color={cushion} position={[0, 2.85, -0.55]} ink={0}>
      <boxGeometry args={[2.3, 2.9, 0.08]} />
    </Part>
    <Part color={cushion} position={[0, 4.28, -0.55]} rotation={[Math.PI / 2, 0, 0]} ink={0}>
      <cylinderGeometry args={[1.15, 1.15, 0.08, 28, 1, false, -Math.PI / 2, Math.PI]} />
    </Part>
    {/* Seitenpfosten mit Knäufen – stehen links und rechts neben dem Kopf */}
    {[-1, 1].map((sd) => (
      <group key={`p${sd}`}>
        <Part color={ROME.goldDark} position={[sd * 1.55, 2.95, -0.62]} ink={0.04}>
          <cylinderGeometry args={[0.12, 0.15, 3.3, 12]} />
        </Part>
        <Part color={ROME.gold} position={[sd * 1.55, 4.75, -0.62]} ink={0.06}>
          <sphereGeometry args={[0.24, 16, 12]} />
        </Part>
      </group>
    ))}
    {eagle ? (
      <Eagle position={[0, 5.62, -0.7]} scale={0.75} />
    ) : (
      <Part color={ROME.gold} position={[0, 5.85, -0.72]} ink={0.06}>
        <sphereGeometry args={[0.22, 16, 12]} />
      </Part>
    )}
    {/* Armlehnen + Knäufe */}
    {[-1, 1].map((sd) => (
      <group key={sd}>
        <Part color={ROME.goldDark} position={[sd * 1.28, 1.6, -0.1]} ink={0.04}>
          <boxGeometry args={[0.26, 0.24, 1.4]} />
        </Part>
        <Part color={ROME.gold} position={[sd * 1.28, 1.68, 0.66]} ink={0.06}>
          <sphereGeometry args={[0.22, 16, 12]} />
        </Part>
        <Part color={ROME.goldDark} position={[sd * 1.28, 1.0, 0.55]} ink={0.04}>
          <boxGeometry args={[0.22, 1.1, 0.22]} />
        </Part>
      </group>
    ))}
  </group>
);

/* ------------------------------------------------------------------ */
/* Requisiten                                                           */
/* ------------------------------------------------------------------ */

/** Goldener Adler (Aquila) – Feldzeichen-Spitze. */
export const Eagle: React.FC<{ readonly position?: P3; readonly scale?: number; readonly color?: string }> = ({
  position = [0, 0, 0],
  scale = 1,
  color = ROME.gold,
}) => (
  <group position={position} scale={scale}>
    <Part color={color} position={[0, 0.25, 0]} scale={[0.32, 0.45, 0.3]} ink={0.07}>
      <sphereGeometry args={[1, 16, 12]} />
    </Part>
    <Part color={color} position={[0, 0.78, 0.1]} ink={0.08}>
      <sphereGeometry args={[0.2, 14, 10]} />
    </Part>
    <Part color={ROME.goldDark} position={[0, 0.74, 0.32]} rotation={[Math.PI / 2, 0, 0]} ink={0.1}>
      <coneGeometry args={[0.07, 0.2, 8]} />
    </Part>
    {[-1, 1].map((sd) => (
      <Part
        key={sd}
        color={color}
        position={[sd * 0.55, 0.62, -0.05]}
        rotation={[0, 0, sd * -0.75]}
        scale={[0.6, 0.16, 0.12]}
        ink={0.07}
      >
        <sphereGeometry args={[1, 14, 10]} />
      </Part>
    ))}
  </group>
);

/** Feldzeichen (vexillum) mit SPQR-Tuch, Fransen und Adler; Tuch schwingt mit `frame`. */
export const SpqrBanner: React.FC<{
  readonly frame?: number;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly text?: string;
  readonly color?: string;
}> = ({
  frame = 0,
  position = [0, 0, 0],
  rotation,
  scale = 1,
  text = "SPQR",
  color = ROME.legionRed,
}) => {
  const font = useRomeFont();
  const tex = useCanvasTexture(`banner-${text}-${color}-${font}`, [256, 320], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = ROME.gold;
    c.lineWidth = 12;
    c.strokeRect(14, 14, w - 28, h - 28);
    // Kranz
    c.lineWidth = 9;
    c.beginPath();
    c.arc(w / 2, h * 0.5, 82, Math.PI * 0.62, Math.PI * 2.38);
    c.stroke();
    c.fillStyle = ROME.gold;
    c.font = fontStack(50);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, w / 2, h * 0.5 + 3, 150);
  });
  const sway = Math.sin(frame * 0.09) * 0.08;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Part color={ROME.wood} position={[0, 2.2, 0]} ink={0.08}>
        <cylinderGeometry args={[0.05, 0.05, 4.4, 8]} />
      </Part>
      <Part color={ROME.gold} position={[0, 3.55, 0]} rotation={[0, 0, Math.PI / 2]} ink={0.08}>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
      </Part>
      {[-1, 1].map((sd) => (
        <Part key={sd} color={ROME.gold} position={[sd * 0.78, 3.55, 0]} ink={0.1}>
          <sphereGeometry args={[0.07, 10, 8]} />
        </Part>
      ))}
      <group position={[0, 3.52, 0.12]} rotation={[sway, sway * 0.6, 0]}>
        <Part color="#FFFFFF" map={tex} position={[0, -0.85, 0]} ink={0.025}>
          <boxGeometry args={[1.3, 1.62, 0.04]} />
        </Part>
        {Array.from({ length: 7 }, (_, i) => (
          <Part key={i} color={ROME.gold} position={[-0.6 + i * 0.2, -1.78, 0]} ink={0.12}>
            <coneGeometry args={[0.06, 0.24, 6]} />
          </Part>
        ))}
      </group>
      <Eagle position={[0, 3.7, 0]} scale={0.55} />
    </group>
  );
};

/** Schriftrolle: zwei Holzstäbe, Pergament mit Textzeilen; `open` 0..1 rollt auf. */
export const Scroll: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly open?: number;
  readonly lines?: readonly string[];
}> = ({ position = [0, 0, 0], rotation, scale = 1, open = 1, lines }) => {
  const key = lines ? lines.join("|") : "scribble";
  const font = useRomeFont();
  const tex = useCanvasTexture(`scroll-${key}-${font}`, [256, 320], (c, w, h) => {
    c.fillStyle = ROME.parchment;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(150,100,40,0.18)";
    c.fillRect(0, 0, 10, h);
    c.fillRect(w - 10, 0, 10, h);
    c.fillStyle = "#4A3020";
    if (lines) {
      c.font = fontStack(32);
      c.textAlign = "center";
      lines.forEach((l, i) => c.fillText(l, w / 2, 60 + i * 48, w - 36));
    } else {
      const r = seeded(17);
      for (let i = 0; i < 9; i++) {
        const lw = 120 + r() * 80;
        c.fillRect((w - lw) / 2, 34 + i * 30, lw, 7);
      }
    }
  });
  const len = 0.15 + open * 1.25;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[0, -len].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <Part color={ROME.parchment} rotation={[0, 0, Math.PI / 2]} ink={0.06}>
            <cylinderGeometry args={[0.1, 0.1, 1.05, 14]} />
          </Part>
          {[-1, 1].map((sd) => (
            <Part key={sd} color={ROME.wood} position={[sd * 0.62, 0, 0]} ink={0.1}>
              <sphereGeometry args={[0.08, 10, 8]} />
            </Part>
          ))}
        </group>
      ))}
      <Part color="#FFFFFF" map={tex} position={[0, -len / 2, 0.02]} ink={0.02}>
        <boxGeometry args={[1.0, len, 0.02]} />
      </Part>
    </group>
  );
};

/** Goldmünze (Aureus/Denar) mit Kaiserprofil und Umschrift; `spin` = Drehung um die Hochachse. */
export const Coin: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly spin?: number;
  readonly color?: string;
  readonly legend?: string;
}> = ({
  position = [0, 0, 0],
  rotation,
  scale = 1,
  spin = 0,
  color = ROME.gold,
  legend = "IMP CAESAR AVG",
}) => {
  const font = useRomeFont();
  const tex = useCanvasTexture(`coin-${color}-${legend}-${font}`, [256, 256], (c, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = ROME.goldDark;
    c.lineWidth = 8;
    c.beginPath();
    c.arc(cx, cy, 112, 0, Math.PI * 2);
    c.stroke();
    // Profil (nach rechts blickend)
    c.fillStyle = ROME.goldDark;
    c.beginPath();
    c.arc(cx - 4, cy - 8, 44, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(cx + 34, cy - 4);
    c.lineTo(cx + 54, cy + 8);
    c.lineTo(cx + 36, cy + 16);
    c.fill();
    c.fillRect(cx - 26, cy + 26, 40, 40);
    // Lorbeer
    c.strokeStyle = color;
    c.lineWidth = 6;
    c.beginPath();
    c.arc(cx - 4, cy - 8, 36, Math.PI * 1.05, Math.PI * 1.75);
    c.stroke();
    // Umschrift
    c.fillStyle = ROME.goldDark;
    c.font = fontStack(22);
    c.textAlign = "center";
    c.textBaseline = "middle";
    const chars = legend.split("");
    chars.forEach((ch, i) => {
      const a = -Math.PI * 0.95 + (i / Math.max(1, chars.length - 1)) * Math.PI * 1.25;
      c.save();
      c.translate(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92);
      c.rotate(a + Math.PI / 2);
      c.fillText(ch, 0, 0);
      c.restore();
    });
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group rotation={[0, spin, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.07, 40]} />
          <ToonM color={ROME.gold} />
          <Ink f={0.06}>
            <cylinderGeometry args={[0.5, 0.5, 0.07, 40]} />
          </Ink>
        </mesh>
        {[1, -1].map((sd) => (
          <mesh key={sd} position={[0, 0, sd * 0.037]} rotation={[0, sd > 0 ? 0 : Math.PI, 0]}>
            <circleGeometry args={[0.48, 40]} />
            <meshToonMaterial map={tex} gradientMap={toonGradient()} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Steinplatten-Boden (Forum/Straße). */
export const Pavement: React.FC<{ readonly size?: number; readonly color?: string }> = ({
  size = 80,
  color = ROME.ground,
}) => {
  const tex = useCanvasTexture(`pave-${color}`, [1024, 1024], (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    const r = seeded(44);
    c.strokeStyle = "rgba(120,80,40,0.22)";
    c.lineWidth = 3;
    const rows = 16;
    for (let y = 0; y < rows; y++) {
      let x = -r() * 60;
      while (x < w) {
        const pw = 50 + r() * 60;
        c.strokeRect(x, (y * h) / rows, pw, h / rows);
        if (r() < 0.25) {
          c.fillStyle = "rgba(255,255,255,0.08)";
          c.fillRect(x + 3, (y * h) / rows + 3, pw - 6, h / rows - 6);
        }
        x += pw;
      }
    }
  });
  tex.wrapS = 1000;
  tex.wrapT = 1000;
  tex.repeat.set(size / 20, size / 20);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <ToonM color="#FFFFFF" map={tex} />
    </mesh>
  );
};

/** Licht wie Mittagssonne über Rom: warmes Führungslicht, himmelblaue Aufhellung, harte Schatten. */
export const RomeLights: React.FC<{
  readonly sun?: P3;
  readonly intensity?: number;
  /** Key-Light-Farbe: Mittag #FFF1D8, Niedergang/Abend #FFC98A */
  readonly color?: string;
  /** Aufhellung [Himmel, Boden, Stärke] – kühl von oben, warm vom Boden */
  readonly fill?: readonly [string, string, number];
}> = ({ sun = [-7, 12, 9], intensity = 2.5, color = "#FFF1D8", fill = ["#CFEFFF", "#C9965A", 1.0] }) => (
  <>
    <hemisphereLight args={[fill[0], fill[1], fill[2]]} />
    <directionalLight
      position={sun}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-bias={-0.0005}
    />
  </>
);

/* ------------------------------------------------------------------ */
/* Erkennungsmerkmal, Licht-Akzente, Tiefe                              */
/* ------------------------------------------------------------------ */

/**
 * Halstuch (focale) – Erkennungsmerkmal der Hauptfigur: in jeder Einstellung gleich, gelb.
 * Sitzt als dicker Wulst auf den Schultern (y 2.3, breiter als der Hals) mit Knoten und
 * zwei langen Zipfeln vorn über dem Panzer – unterhalb und seitlich des Kopfes, damit der
 * Kopf es frontal nicht verdeckt. Gegen das helle Eisen trägt der Farbton + INK-Kontur
 * (Leuchtdichte fast gleich), deshalb dicke Kontur und leichte Eigenleuchtkraft.
 */
export const Focale: React.FC<{ readonly color?: string; readonly frame?: number }> = ({
  color = "#FFC928",
  frame = 0,
}) => {
  const flap = Math.sin(frame * 0.15) * 0.07;
  return (
    <group>
      <Part color={color} position={[0, 2.3, 0.02]} rotation={[Math.PI / 2 - 0.12, 0, 0]} ink={0.06} emissive={0.12}>
        <torusGeometry args={[0.6, 0.15, 10, 32]} />
      </Part>
      {/* Knoten vorn, leicht seitlich */}
      <Part color={color} position={[0.14, 2.16, 0.72]} scale={[1.15, 0.9, 0.8]} ink={0.08} emissive={0.12}>
        <sphereGeometry args={[0.14, 14, 10]} />
      </Part>
      {/* Zipfel */}
      {[-1, 1].map((sd) => (
        <group
          key={sd}
          position={[0.14 + sd * 0.07, 2.1, 0.74]}
          rotation={[0.2, 0, sd * 0.22 + flap * (sd > 0 ? 1 : -0.6)]}
        >
          <Part color={color} position={[0, -0.27, 0]} ink={0.07} emissive={0.12}>
            <boxGeometry args={[0.17, 0.54, 0.05]} />
          </Part>
        </group>
      ))}
    </group>
  );
};

/** Tiefenstaffelung: warmer, heller Dunst – Hintergrund wird weicher und zurückgenommen. */
export const RomeFog: React.FC<{ readonly near?: number; readonly far?: number; readonly color?: string }> = ({
  near = 22,
  far = 110,
  color = ROME.fog,
}) => <fog attach="fog" args={[color, near, far]} />;

/** Gefahrenrot: kaltes Karminrot statt Orange – liest sich als Alarm/Blut, nicht als Lagerfeuer. */
export const DANGER = "#FF1F3D";

/**
 * Rotes Gefahren-Akzentlicht (Brand, Plünderung, Alarm): unruhig flackerndes Punktlicht +
 * sichtbarer Lichthof. Nur für Gefahr verwenden – Rot ist sonst Legion/Rom.
 * Bedrohlich wird es erst mit gedimmtem, kühlem Rest-Licht: zusammen mit
 * `<RomeAtmosphere phase="fall" />` oder `romeMood("fall")` einsetzen (dort gedimmt und blau-violett).
 */
export const DangerLight: React.FC<{
  readonly frame: number;
  readonly position: P3;
  readonly intensity?: number;
  readonly glow?: boolean;
  readonly color?: string;
}> = ({ frame, position, intensity = 1, glow = true, color = DANGER }) => {
  // Alarm-Puls (langsam) + Flackern (schnell, unregelmäßig) – deterministisch aus `frame`
  const pulse =
    0.7 + Math.sin(frame * 0.3) * 0.18 + Math.sin(frame * 1.7) * 0.07 + Math.sin(frame * 2.9 + 1) * 0.05;
  return (
    <group position={position}>
      <pointLight color={color} intensity={18 * intensity * pulse} distance={14} decay={1.6} />
      {glow ? <Glow position={[0, 0, 0]} radius={0.6} color={color} intensity={pulse * intensity} /> : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Stimmung nach Story-Phase (gleiche Bauten, anderes Licht)            */
/* ------------------------------------------------------------------ */

export type RomePhase = "glory" | "decline" | "fall";

export type RomeMood = {
  readonly skyTop: string;
  readonly skyBottom: string;
  readonly sun: P3;
  readonly sunColor: string;
  readonly sunRadius: number;
  readonly cloudColor: string;
  readonly fog: readonly [string, number, number];
  readonly key: { readonly position: P3; readonly color: string; readonly intensity: number };
  readonly fill: readonly [string, string, number];
  /** CSS-Hintergrund hinter dem Canvas */
  readonly background: string;
  /** CSS-Filter fürs Endbild (statt saturate(1.15) contrast(1.05)) */
  readonly grade: string;
};

/**
 * Licht-/Himmels-Preset je Story-Phase (docs/design-system.md, Abschnitt 5.6):
 * - `glory`   Blütezeit, Mittag: klares Blau, warmes hohes Key-Light.
 * - `decline` Niedergang, später Nachmittag: Honig-Himmel, flaches Orange-Licht von der Seite,
 *             längere Schatten, Dunst wärmer und näher.
 * - `fall`    Plünderung/Untergang, Abend: Violett → Glut am Horizont, Key-Light schwach und tief,
 *             kühle blau-violette Aufhellung – erst darauf wirkt `DangerLight` bedrohlich.
 */
export const romeMood = (phase: RomePhase): RomeMood => {
  switch (phase) {
    case "decline":
      return {
        skyTop: "#D9874A",
        skyBottom: "#F7D9A8",
        sun: [-70, 22, -150],
        sunColor: "#FFE0A0",
        sunRadius: 9,
        cloudColor: "#FFE7C8",
        fog: ["#F2CFA0", 28, 150],
        key: { position: [-12, 6, 6], color: "#FFC98A", intensity: 2.2 },
        fill: ["#F5D2A8", "#9C6A3A", 0.85],
        background: "#F7D9A8",
        grade: "saturate(1.12) contrast(1.08)",
      };
    case "fall":
      return {
        skyTop: "#2E2552",
        skyBottom: "#C8553D",
        sun: [60, 6, -150],
        sunColor: "#FF8A4C",
        sunRadius: 10,
        cloudColor: "#6B4A6E",
        fog: ["#5A3A4E", 14, 75],
        key: { position: [10, 4, -4], color: "#FF9A5C", intensity: 1.3 },
        fill: ["#5F6AA8", "#2A1712", 0.75],
        background: "#2E2552",
        grade: "saturate(1.05) contrast(1.12) brightness(0.92)",
      };
    default:
      return {
        skyTop: ROME.skyTop,
        skyBottom: ROME.skyBottom,
        sun: [-30, 60, -150],
        sunColor: ROME.sun,
        sunRadius: 7,
        cloudColor: "#FFFFFF",
        fog: [ROME.fog, 22, 110],
        key: { position: [-7, 12, 9], color: "#FFF1D8", intensity: 2.5 },
        fill: ["#CFEFFF", "#C9965A", 1.0],
        background: ROME.skyBottom,
        grade: "saturate(1.15) contrast(1.05)",
      };
  }
};

/** Himmel + Dunst + Licht in einem, nach Story-Phase. `sun` überschreibt die Key-Light-Richtung. */
export const RomeAtmosphere: React.FC<{
  readonly phase?: RomePhase;
  readonly frame?: number;
  readonly sun?: P3;
  readonly clouds?: boolean;
}> = ({ phase = "glory", frame = 0, sun, clouds = true }) => {
  const m = romeMood(phase);
  return (
    <>
      <RomeSky
        top={m.skyTop}
        bottom={m.skyBottom}
        sun={m.sun}
        sunColor={m.sunColor}
        sunRadius={m.sunRadius}
        cloudColor={m.cloudColor}
        clouds={clouds}
        frame={frame}
      />
      <RomeFog color={m.fog[0]} near={m.fog[1]} far={m.fog[2]} />
      <RomeLights sun={sun ?? m.key.position} color={m.key.color} intensity={m.key.intensity} fill={m.fill} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Info-Grafik-Bausteine (Cel-Stil)                                     */
/* ------------------------------------------------------------------ */

const ringHalf = (
  rx: number,
  ry: number,
  ix: number,
  iy: number,
  side: -1 | 1,
  gap: number,
  depth: number,
) => {
  // halber elliptischer Ring um das „Mittelmeer“; side −1 = West (links), +1 = Ost
  const s = new Shape();
  const steps = 28;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 - (i / steps) * Math.PI;
    pts.push([side * (Math.cos(a) * rx + gap), Math.sin(a) * ry]);
  }
  for (let i = steps; i >= 0; i--) {
    const a = Math.PI / 2 - (i / steps) * Math.PI;
    pts.push([side * (Math.cos(a) * ix + gap), Math.sin(a) * iy]);
  }
  s.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(-side * (rx + ix) * 0.25, 0, -depth / 2);
  return g;
};

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sh: number) =>
    Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).replace(/^/, "000000").slice(-6)}`;
};

/**
 * Schematische Reichskarte als Tischmodell: Reich = Ring ums Mittelmeer,
 * West (rot, mit Italien-Stiefel und ROMA) und Ost (purpur, mit CONSTANTINOPOLIS).
 * `split` 0..1 rückt die Hälften auseinander (395 n. Chr.), `westFall` 0..1 lässt den
 * Westen grau werden und absinken (476 n. Chr.). Liegt flach; Kamera schräg von oben.
 * Bewusst schematisch – keine echte Küstenlinie.
 */
export const EmpireMap: React.FC<{
  readonly frame?: number;
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly split?: number;
  readonly westFall?: number;
  readonly labels?: boolean;
}> = ({
  frame = 0,
  position = [0, 0, 0],
  rotation,
  scale = 1,
  split = 0,
  westFall = 0,
  labels = true,
}) => {
  const geos = useMemo(
    () => ({
      west: ringHalf(3.4, 2.0, 2.3, 1.05, -1, 0.04, 0.3),
      east: ringHalf(3.4, 2.0, 2.3, 1.05, 1, 0.04, 0.3),
      italy: landShape(ITALY, 0.3),
      sicily: landShape(SICILY, 0.3),
      greece: landShape(GREECE, 0.3),
    }),
    [],
  );
  const label = (t: string) => (c: CanvasRenderingContext2D, w: number, h: number) => {
    c.clearRect(0, 0, w, h);
    c.font = fontStack(64);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 14;
    c.strokeStyle = INK;
    c.strokeText(t, w / 2, h / 2);
    c.fillStyle = "#FFFFFF";
    c.fillText(t, w / 2, h / 2);
  };
  const font = useRomeFont();
  const tWest = useCanvasTexture(`map-west-${font}`, [512, 96], label("WEST"));
  const tEast = useCanvasTexture(`map-east-${font}`, [512, 96], label("EAST"));
  const gap = split * 0.9;
  const westCol = mixHex(ROME.legionRed, "#8A8A8A", westFall);
  const sink = -westFall * 0.25;
  const wobble = westFall > 0 ? Math.sin(frame * 0.6) * 0.02 * (1 - westFall) : 0;
  // Ring-Mitte liegt in lokalen Koordinaten nach translate bei ±(rx+ix)/4
  const half = (3.4 + 2.3) * 0.25;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Tischplatte (Pergament) */}
      <Part color={ROME.parchment} position={[0, -0.12, 0]} ink={0.015}>
        <boxGeometry args={[9.2, 0.24, 5.6]} />
      </Part>
      {/* Meer */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.9, 1.55, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshToonMaterial color="#5DB7E3" gradientMap={toonGradient()} />
      </mesh>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* West */}
        <group position={[-half - gap, 0, 0.15 + sink]} rotation={[0, 0, wobble]}>
          <GeoPart geo={geos.west} color={westCol} ink={0.02} />
          {/* Italien + Sizilien (Kartenkoordinaten, daher +half) */}
          <GeoPart geo={geos.italy} color={westCol} position={[half, 0, 0]} ink={0.02} />
          <GeoPart geo={geos.sicily} color={westCol} position={[half, 0, 0]} ink={0.03} />
          <Pin position={[half + 0.02, 0.55, 0.15]} color={ROME.gold} />
          {labels ? (
            <mesh position={[half - 1.3, -1.55, 0.17]}>
              <planeGeometry args={[2.1, 0.4]} />
              <meshBasicMaterial map={tWest} transparent depthWrite={false} />
            </mesh>
          ) : null}
        </group>
        {/* Ost */}
        <group position={[half + gap, 0, 0.15]}>
          <GeoPart geo={geos.east} color={ROME.purple} ink={0.02} />
          <GeoPart geo={geos.greece} color={ROME.purple} position={[-half, 0, 0]} ink={0.02} />
          <Pin position={[-half + 1.45, 1.3, 0.15]} color={ROME.gold} />
          {labels ? (
            <mesh position={[-half + 1.3, -1.55, 0.17]}>
              <planeGeometry args={[2.1, 0.4]} />
              <meshBasicMaterial map={tEast} transparent depthWrite={false} />
            </mesh>
          ) : null}
        </group>
      </group>
    </group>
  );
};

// Schematische Landformen in Kartenkoordinaten (Mitte Mittelmeer = 0,0; Norden = +y)
const ITALY: [number, number][] = [
  [-0.6, 1.2], [-0.1, 1.2], [0.15, 0.85], [0.45, 0.45], [0.8, 0.15], [0.95, -0.15],
  [0.75, -0.12], [0.62, -0.38], [0.48, -0.32], [0.42, -0.02], [0.12, 0.3], [-0.2, 0.6], [-0.5, 0.95],
];
const SICILY: [number, number][] = [[0.15, -0.45], [0.6, -0.42], [0.45, -0.72]];
const GREECE: [number, number][] = [
  [1.1, 1.2], [1.55, 1.15], [1.45, 0.75], [1.6, 0.35], [1.35, 0.15], [1.25, 0.45], [1.05, 0.3], [1.1, 0.8],
];
const landShape = (pts: [number, number][], depth: number) => {
  const s = new Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
};

/** Stecknadel für Städte auf der Karte (stehend in lokaler z-Richtung). */
const Pin: React.FC<{ readonly position: P3; readonly color: string }> = ({ position, color }) => (
  <group position={position} rotation={[Math.PI / 2, 0, 0]}>
    <Part color={INK} position={[0, 0.25, 0]} ink={0}>
      <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
    </Part>
    <Part color={color} position={[0, 0.55, 0]} ink={0.1}>
      <sphereGeometry args={[0.16, 16, 12]} />
    </Part>
  </group>
);

/** Vom Faktenprüfer freigegebene Jahre (docs/faktencheck-roemisches-reich.md, „Für das Drehbuch freigegeben“). */
export const ROME_YEARS = ["27 BC", "193 AD", "395 AD", "410 AD", "455 AD", "476 AD", "1453 AD"] as const;

/**
 * Zeitleisten-Stele: hohe Marmorstele mit eingemeißelten Jahreszahlen (oben alt, unten neu),
 * goldener Marker gleitet zu `at` (Index, auch Zwischenwerte). Hochformat-tauglich.
 * Standard sind nur freigegebene Jahre (`ROME_YEARS`); eigene Listen nur mit Freigabe.
 */
export const TimelineStele: React.FC<{
  readonly position?: P3;
  readonly rotation?: P3;
  readonly scale?: number;
  readonly years?: readonly string[];
  readonly at?: number;
  readonly frame?: number;
}> = ({
  position = [0, 0, 0],
  rotation,
  scale = 1,
  years = ROME_YEARS,
  at = 0,
  frame = 0,
}) => {
  const H = 5.2;
  const cap = useMemo(() => gable(2.0, 0.6, 0.5), []);
  const font = useRomeFont();
  const tex = useCanvasTexture(`stele-${years.join("|")}-${font}`, [256, 640], (c, w, h) => {
    c.fillStyle = ROME.marble;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(120,100,70,0.12)";
    for (let i = 0; i < 30; i++) c.fillRect(0, i * 22, w, 2);
    c.strokeStyle = ROME.marbleShade;
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(60, 40);
    c.lineTo(60, h - 40);
    c.stroke();
    c.fillStyle = "#6B5235";
    c.font = fontStack(years.length > 6 ? 34 : 38);
    c.textBaseline = "middle";
    years.forEach((y, i) => {
      const yy = 60 + (i * (h - 120)) / Math.max(1, years.length - 1);
      c.fillRect(48, yy - 3, 26, 6);
      c.fillText(y, 86, yy + 1, w - 96);
    });
  });
  const n = Math.max(1, years.length - 1);
  const k = Math.min(Math.max(at, 0), n) / n;
  // Textur 640 px ↔ Höhe H; Marken von 60 px bis 580 px
  const markerY = H / 2 - (60 / 640) * H - k * ((520 / 640) * H);
  const bob = Math.sin(frame * 0.2) * 0.03;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Part color={ROME.marbleShade} position={[0, 0.2, 0]} ink={0.03}>
        <boxGeometry args={[2.2, 0.4, 1.0]} />
      </Part>
      <group position={[0, 0.4 + H / 2, 0]}>
        <Part color="#FFFFFF" map={tex} ink={0.025}>
          <boxGeometry args={[1.8, H, 0.5]} />
        </Part>
        <Part color={ROME.marble} position={[0, H / 2 + 0.12, 0]} ink={0.04}>
          <boxGeometry args={[2.0, 0.24, 0.6]} />
        </Part>
        <GeoPart
          geo={cap}
          color={ROME.marble}
          position={[0, H / 2 + 0.24 + 0.2, 0]}
          ink={0.04}
        />
        <group position={[-0.95 + bob, markerY, 0.3]}>
          <Part color={ROME.gold} rotation={[0, 0, -Math.PI / 2]} ink={0.08}>
            <coneGeometry args={[0.2, 0.42, 3]} />
          </Part>
        </group>
      </group>
    </group>
  );
};
