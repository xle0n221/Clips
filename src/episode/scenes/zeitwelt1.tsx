/**
 * „In This City, You Pay With Time“ – Kulissen-Sets + Szenen 1–7 (hook … thread).
 * Shot-Liste: docs/paket-zeit-welt.md (Abschnitt 3/4). Schnitte auf Wort-Beats (useScene().beat).
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { eyePopAt, hop, SpotlightStage } from "../kit/motion";
import { useScene } from "../types";
import {
  Atmos,
  Bread,
  BrassDish,
  CalendarSheet,
  cut,
  fly,
  frameOn,
  Gear,
  Halo,
  HangLamp,
  HouseRow,
  Klotz,
  Lamp,
  lerp,
  LightShaft,
  Motes,
  Plank,
  PocketWatch,
  Rain,
  ramp,
  Room,
  SandStream,
  TextLabel,
  TimeJar,
  WetGround,
  Z,
} from "./zeitweltSets";

/* ------------------------------------------------------------------ */
/* Sets                                                                 */
/* ------------------------------------------------------------------ */

/** Marktplatz von Minuteburg: nasser Platz, Häuserzeilen auf drei Seiten, Laternen, Regen, Nebel. */
export const MarketSet: React.FC<{ readonly frame: number; readonly rain?: number; readonly lampsOn?: number; readonly goldWin?: boolean }> = ({
  frame,
  rain = 1,
  lampsOn = 1,
  goldWin = false,
}) => {
  const lamps: V3[] = [
    [-5, 0, 2],
    [5, 0, 2],
    [-5.5, 0, -5],
    [5.5, 0, -5],
  ];
  return (
    <>
      <Atmos bg={Z.fogDeep} fog={[12, 48]} sky="#7F97B8" ground="#121821" hemi={0.7} keyLight={{ pos: [-8, 14, 6], color: "#AFC4E6", intensity: 1.1 }} rim={{ pos: [6, 6, -14], color: "#8FB8FF", intensity: 2 }} />
      <WetGround glints={lamps} />
      <HouseRow z={-11} from={-16} to={16} seed={3} goldWin={goldWin} />
      <group position={[-11, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <HouseRow z={0} from={-12} to={12} seed={5} goldWin={goldWin} />
      </group>
      <group position={[11, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <HouseRow z={0} from={-12} to={12} seed={8} goldWin={goldWin} />
      </group>
      {/* Brunnen in der Mitte (Messing-Uhr auf Säule = Stadtsymbol) */}
      <mesh position={[0, 0.35, -3]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.7, 32]} />
        <meshStandardMaterial color={Z.stone} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.0, -3]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 3.2, 16]} />
        <meshStandardMaterial color={Z.stoneDark} roughness={0.6} />
      </mesh>
      <group position={[0, 3.9, -3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.22, 32]} />
          <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <circleGeometry args={[0.66, 32]} />
          <meshStandardMaterial color="#F0E6CF" emissive="#FFE7B8" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, 0.2, 0.14]}>
          <boxGeometry args={[0.05, 0.42, 0.01]} />
          <meshBasicMaterial color={Z.ink} />
        </mesh>
        <mesh position={[0.12, 0, 0.14]} rotation={[0, 0, -frame * 0.012]}>
          <boxGeometry args={[0.04, 0.55, 0.01]} />
          <meshBasicMaterial color={Z.ink} />
        </mesh>
      </group>
      {lamps.map((p, i) => (
        <Lamp key={i} position={p} on={lampsOn} />
      ))}
      {rain > 0 ? <Rain frame={frame} center={[0, 5, 0]} size={[24, 12, 20]} opacity={0.28 * rain} /> : null}
      <Motes frame={frame} center={[0, 3, 0]} size={[20, 6, 16]} count={90} drift={[0.004, -0.002, 0]} color="#C9D8F0" dot={0.08} opacity={0.35} seed={4} />
    </>
  );
};

/** Leute auf dem Markt mit goldenen Gläsern (Gold = einzige warme Farbe). */
const CROWD: { p: V3; r: number; who: "towns" | "worker" | "kid" | "baker"; shirt: string; fill: number }[] = [
  { p: [-3.2, 0, 1.2], r: 0.5, who: "towns", shirt: "#4E5C70", fill: 0.7 },
  { p: [-1.4, 0, 3.2], r: 0.2, who: "worker", shirt: "#3F5A78", fill: 0.4 },
  { p: [1.6, 0, 2.6], r: -0.3, who: "towns", shirt: "#5B4E6A", fill: 0.9 },
  { p: [3.4, 0, 0.4], r: -0.8, who: "towns", shirt: "#4A6670", fill: 0.6 },
  { p: [-4.6, 0, -2.2], r: 1.2, who: "worker", shirt: "#5A6070", fill: 0.3 },
  { p: [4.2, 0, -2.6], r: -1.4, who: "baker", shirt: "#DCD6CC", fill: 0.8 },
  { p: [-2.2, 0, -6.4], r: 0.3, who: "towns", shirt: "#3E4E66", fill: 0.5 },
  { p: [2.6, 0, -6.8], r: -0.2, who: "kid", shirt: "#7A4A3A", fill: 0.85 },
  { p: [0.2, 0, 4.6], r: 3.0, who: "towns", shirt: "#56506A", fill: 0.65 },
  { p: [-6.4, 0, 4.2], r: 0.9, who: "worker", shirt: "#44566C", fill: 0.45 },
  { p: [6.6, 0, 3.6], r: -0.9, who: "towns", shirt: "#4D5A66", fill: 0.75 },
];
export const Crowd: React.FC<{ readonly frame: number; readonly walk?: boolean; readonly scale?: number }> = ({ frame, walk = true, scale = 1 }) => (
  <>
    {CROWD.map((c, i) => {
      const w = walk && i % 3 !== 2 ? 1 : 0;
      const dx = w ? Math.sin(c.r) * frame * 0.012 : 0;
      const dz = w ? Math.cos(c.r) * frame * 0.012 : 0;
      return (
        <Klotz
          key={i}
          frame={frame + i * 11}
          who={c.who}
          shirt={c.shirt}
          position={[c.p[0] + dx, 0, c.p[2] + dz]}
          rotation={[0, c.r, 0]}
          scale={scale}
          walk={w}
          blinkSeed={i + 10}
          mouth={i % 2 ? "flat" : "smile"}
          jar={{ fill: c.fill, glow: 1.4 }}
        />
      );
    })}
  </>
);

/** Werkstatt (einziger warmer Innenraum): Werkbank, Regale mit Uhren, Hängelampe, Nachtfenster. */
export const WorkshopSet: React.FC<{ readonly frame: number; readonly warm?: number; readonly haze?: number }> = ({ frame, warm = 1, haze = 0 }) => (
  <>
    <Atmos bg="#1A130F" fog={[9, 30]} sky="#FFD9B0" ground="#2A1A10" hemi={0.45} keyLight={{ pos: [4, 9, 6], color: "#FFD7A8", intensity: 0.9 * warm }} rim={{ pos: [-5, 4, -6], color: "#7FA8E0", intensity: 1.2 }} />
    <Room wall="#4B3A30" floor="#8A6446" width={14} depth={12} height={7} windowAt={[-3.4, 3.4, -5.98]} windowColor="#2C4468" />
    <HangLamp position={[0.4, 4.6, -1.6]} to={[0.4, 1.0, -1.2]} intensity={14 * warm} />
    {/* Werkbank */}
    <Plank size={[5.4, 0.22, 1.8]} position={[0.4, 1.4, -2.2]} />
    {[-2, 2.8].map((x) => (
      <Plank key={x} size={[0.22, 1.4, 1.6]} position={[x, 0.7, -2.2]} color="#7A5A40" />
    ))}
    {/* Regal mit Uhren an der Rückwand */}
    {[3.2, 4.4].map((y) => (
      <Plank key={y} size={[4.6, 0.12, 0.6]} position={[1.6, y, -5.6]} color="#8A6446" />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <PocketWatch key={i} frame={frame + i * 40} position={[-0.2 + i * 1.15, 3.62, -5.45]} scale={0.55 + (i % 2) * 0.15} open={0} />
    ))}
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0.3 + i * 1.4, 4.85, -5.45]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.18, 24]} />
          <meshStandardMaterial color={i === 1 ? "#5E3A2A" : "#3A4A3A"} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <circleGeometry args={[0.26, 24]} />
          <meshStandardMaterial color="#EFE6D2" />
        </mesh>
      </group>
    ))}
    {/* Zahnräder auf der Bank */}
    <Gear position={[2.2, 1.56, -2.5]} radius={0.32} teeth={12} angle={frame * 0.02} rotation={[-Math.PI / 2, 0, 0]} thick={0.06} />
    <Gear position={[2.75, 1.56, -2.1]} radius={0.2} teeth={9} angle={-frame * 0.032} rotation={[-Math.PI / 2, 0, 0]} thick={0.06} />
    <Motes frame={frame} center={[0.4, 2.6, -1.6]} size={[5, 4, 3]} count={110} drift={[0.002, 0.0015, 0]} color="#FFE2B0" dot={0.04} opacity={0.65} seed={12} />
    {haze > 0 ? <Halo at={[0, 2.6, 0.5]} size={14} color="#FFD8A0" opacity={0.25 * haze} /> : null}
  </>
);

/** Antons Stube: Sessel, Nachttisch, Fenster (Morgen-Blau oder Nacht), Lampe, Kalender an der Wand. */
export const AntonRoom: React.FC<{
  readonly frame: number;
  readonly light?: "dawn" | "lamp" | "night";
  readonly calendars?: number;
  readonly crossed?: number;
}> = ({ frame, light = "lamp", calendars = 0, crossed = 1 }) => {
  const dawn = light === "dawn";
  const night = light === "night";
  return (
    <>
      <Atmos
        bg={dawn ? "#1B2638" : "#17120F"}
        fog={[9, 30]}
        sky={dawn ? "#8FA8CC" : "#FFD4A8"}
        ground="#1B1512"
        hemi={dawn ? 0.75 : 0.4}
        keyLight={{ pos: dawn ? [-6, 6, -2] : [3, 8, 5], color: dawn ? "#A9C2EA" : "#FFCF9A", intensity: dawn ? 1.6 : 0.9 }}
        rim={{ pos: [-4, 5, -8], color: dawn ? "#BFD6FF" : "#8FB0E0", intensity: 1.4 }}
      />
      <Room wall={dawn ? "#3E4656" : "#4A3B33"} floor="#7A5A40" width={14} depth={12} height={7} windowAt={[-3.2, 3.2, -5.98]} windowColor={dawn ? "#7F9CC6" : night ? "#1A2A44" : "#22385A"} windowGlow={dawn ? 1.2 : 0.6} />
      {dawn ? <LightShaft from={[-3.2, 3.6, -5.8]} to={[-0.6, 0.6, -1.2]} radius={1.6} top={0.9} color="#B8CFF2" opacity={0.16} /> : null}
      {!dawn ? <HangLamp position={[1.8, 4.8, -2.2]} to={[1.6, 0.6, -1.6]} intensity={night ? 6 : 11} /> : null}
      {/* Sessel */}
      <group position={[1.6, 0, -2.4]}>
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 1.1, 1.8]} />
          <meshStandardMaterial color="#5C2E2A" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.6, -0.75]} castShadow>
          <boxGeometry args={[2.0, 2.0, 0.4]} />
          <meshStandardMaterial color="#5C2E2A" roughness={0.75} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.95, 1.25, 0]} castShadow>
            <boxGeometry args={[0.3, 0.5, 1.8]} />
            <meshStandardMaterial color="#532824" roughness={0.75} />
          </mesh>
        ))}
      </group>
      {/* Nachttisch */}
      <Plank size={[1.2, 0.12, 1.0]} position={[-1.6, 1.3, -2.0]} color="#8A6446" />
      <Plank size={[1.0, 1.25, 0.9]} position={[-1.6, 0.62, -2.0]} color="#6E4A30" />
      {calendars > 0
        ? Array.from({ length: calendars }, (_, i) => (
            <CalendarSheet key={i} position={[-2.6 + (i % 5) * 0.62, 4.6 - Math.floor(i / 5) * 0.75, -5.95]} crossed={Math.min(1, Math.max(0, crossed * 20 - i))} rot={((i * 37) % 7) * 0.01 - 0.03} />
          ))
        : null}
      <Motes frame={frame} center={[0, 2.6, -1.5]} size={[7, 4, 4]} count={90} drift={[0.0015, 0.001, 0]} color={dawn ? "#D8E6FF" : "#FFE2B0"} dot={0.04} opacity={0.55} seed={17} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 1 hook – „In this city, bread costs twelve minutes. | Of your life.“ */
/* ------------------------------------------------------------------ */

/** Bäckertheke (Makro): Brot mit Preisschild, Ida-Hand kippt ihr Glas, Sand rieselt aus dem Messinghahn in die Schale. */
export const CounterMacro: React.FC<{ readonly frame: number; readonly pour?: number; readonly dish?: number }> = ({ frame, pour = 1, dish = 0.3 }) => {
  const jarPos: V3 = [-0.75, 1.62, 0.25];
  const tilt = -0.42;
  // Hahn-Spitze in Weltkoordinaten (Hahn bei lokal (0.21, 0.08), Maßstab 1.6, Drehung um z)
  const s = 1.6;
  const lx = 0.21 * s;
  const ly = 0.08 * s;
  const tap: V3 = [jarPos[0] + lx * Math.cos(tilt) - ly * Math.sin(tilt), jarPos[1] + lx * Math.sin(tilt) + ly * Math.cos(tilt), jarPos[2]];
  return (
    <>
      <Atmos bg="#141A26" fog={[3, 14]} sky="#9DB4D8" ground="#1E1610" hemi={0.55} keyLight={{ pos: [3, 6, 4], color: "#FFE0B8", intensity: 1.3 }} rim={{ pos: [-3, 3, -5], color: "#8FB8FF", intensity: 2.2 }} />
      {/* Theke */}
      <Plank size={[6, 0.25, 2.4]} position={[0, 0.88, 0]} color="#9A7050" />
      <Bread position={[0.85, 1.0, -0.35]} rotation={[0, -0.35, 0]} scale={0.95} />
      {/* Preisschild am Spieß */}
      <mesh position={[0.3, 1.62, 0.05]}>
        <cylinderGeometry args={[0.012, 0.012, 0.75, 6]} />
        <meshStandardMaterial color="#C9C2B4" metalness={0.6} roughness={0.3} />
      </mesh>
      <group position={[0.3, 1.98, 0.06]} rotation={[0, -0.12, 0.04]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.12, 0.46]} />
          <meshStandardMaterial color={Z.paper} roughness={0.9} />
        </mesh>
        <TextLabel text="BREAD · 12 MIN" width={1.02} height={0.36} color="#1A1410" position={[0, 0, 0.005]} />
      </group>
      <BrassDish position={[-0.15, 1.01, 0.3]} scale={0.75} fill={dish} />
      {/* Ida-Arm (petrol) von links oben, Fäustling hält das Glas */}
      <group position={[jarPos[0] - 0.55, jarPos[1] + 0.2, jarPos[2]]} rotation={[0, 0, -1.05]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.32, 1.2, 0.34]} />
          <meshPhysicalMaterial color={Z.idaShirt} roughness={0.42} clearcoat={0.5} />
        </mesh>
      </group>
      <mesh position={[jarPos[0] - 0.22, jarPos[1] + 0.25, jarPos[2] + 0.05]}>
        <sphereGeometry args={[0.24, 18, 14]} />
        <meshPhysicalMaterial color={Z.skin} roughness={0.5} clearcoat={0.5} />
      </mesh>
      <TimeJar position={jarPos} rotation={[0, 0.25, tilt]} scale={s} fill={0.62} clip={false} />
      <SandStream frame={frame} from={tap} to={[-0.15, 1.08, 0.3]} width={0.018} on={pour} />
      {/* Hintergrund: Regal mit Broten, warme Bokeh-Lichter, kaltes Fenster */}
      <Plank size={[6, 0.12, 0.6]} position={[0.5, 2.6, -2.6]} color="#7A5A40" />
      {[-1.5, -0.3, 0.9, 2.1].map((x) => (
        <Bread key={x} position={[x, 2.66, -2.6]} scale={0.6} rotation={[0, 0.2, 0]} />
      ))}
      <Halo at={[-1.8, 2.4, -3.6]} size={1.5} opacity={0.55} />
      <Halo at={[1.9, 3.1, -4.2]} size={1.9} opacity={0.5} />
      <Halo at={[2.9, 1.9, -3.2]} size={1.1} color="#9CC0FF" opacity={0.4} />
      <Halo at={[-2.7, 3.2, -4.6]} size={2.2} color="#7FA6E6" opacity={0.35} />
      <Motes frame={frame} center={[0, 1.8, -0.2]} size={[3, 2, 2]} count={70} drift={[0.0015, -0.0012, 0]} color="#FFE0A8" dot={0.025} opacity={0.75} seed={5} />
    </>
  );
};

export const ZwHook: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const minutes = beat("sandPourMacro");
  const life = beat("idaLowAngleEyes");
  const cutAt = Math.max(30, life - 21); // Schnitt auf „Of“ (≈ 0,7 s vor „life“): Einstellung ≥ 1,5 s
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    const a = frameOn([0.1, 1.55, 0.1], 3.4, 0.58, 0.5, [0.15, 0.22, 1]);
    const b = frameOn([-0.1, 1.45, 0.2], 2.5, 0.58, 0.5, [0.1, 0.18, 1]);
    return (
      <>
        <CounterMacro frame={frame} dish={0.25 + 0.15 * ramp(frame, 0, cutAt)} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} ease="linear" punch={minutes} />
      </>
    );
  }
  // Untersicht: Idas Gesicht im Gold-Schein von unten, Augen werden groß auf „life“
  const head: V3 = [0, 1.95, 0];
  const pop = eyePopAt(frame, life, 1.7, 1.35);
  const a = frameOn(head, 5.2, 0.42, 0.5, [0.05, -0.3, 1]);
  const b = frameOn(head, 4.4, 0.42, 0.5, [0.05, -0.34, 1]);
  return (
    <>
      <Atmos bg="#0F1520" fog={[6, 24]} sky="#3E5270" ground="#2A1A0C" hemi={0.35} rim={{ pos: [-3, 5, -6], color: "#9CC4FF", intensity: 2.6 }} />
      <pointLight position={[0, 0.6, 1.4]} color={Z.gold} intensity={5} distance={6} decay={2} />
      <Klotz frame={frame} who="ida" position={[0, 0, 0]} eyes={frame >= life ? "wide" : "dot"} mouth={frame >= life ? "o" : "flat"} eyePop={pop} blinkSeed={3} reach={[0.9, 0.9]} jar={{ fill: 0.6 }} />
      <Plank size={[6, 0.25, 1.6]} position={[0, 0.88, 1.3]} color="#9A7050" />
      <BrassDish position={[0.1, 1.01, 1.1]} scale={0.75} fill={0.45} />
      <Halo at={[0.1, 1.2, 1.1]} size={2.4} color={Z.gold} opacity={0.5} />
      <HouseRow z={-9} from={-8} to={8} seed={4} />
      <Motes frame={frame} center={[0, 2, 0.6]} size={[3, 3, 2]} count={60} drift={[0, 0.003, 0]} color="#FFD27A" dot={0.03} opacity={0.7} seed={8} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} ease="out" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 2 stakes – „Everyone here pays with time. | And Ida's grandpa has one day left.“ */
/* ------------------------------------------------------------------ */
export const ZwStakes: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const day = beat("otsGrandpaJar");
  const cutAt = Math.max(40, day - 36); // auf „Ida's“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Totale von oben: kalter Platz, nur die Gläser leuchten
    const a = frameOn([0, 1, -0.5], 17, 0.5, 0.5, [0, 0.95, 0.75]);
    const b = frameOn([0, 1, -0.5], 14.5, 0.52, 0.5, [0, 0.8, 0.9]);
    return (
      <>
        <MarketSet frame={frame} />
        <Crowd frame={frame} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Over-the-shoulder: über Idas Schulter auf Anton am regennassen Fenster, sein Glas fast leer
  const anton: V3 = [0.6, 0, -3.2];
  const a = frameOn([0.2, 2.0, -2.4], 6.4, 0.48, 0.5, [-0.3, 0.06, 1]);
  const b = frameOn([0.3, 1.9, -2.6], 5.6, 0.48, 0.5, [-0.28, 0.05, 1]);
  return (
    <>
      <Atmos bg={Z.fogDeep} fog={[6, 26]} sky="#7F97B8" ground="#121821" hemi={0.7} keyLight={{ pos: [-6, 9, 6], color: "#AFC4E6", intensity: 1.0 }} rim={{ pos: [4, 4, -10], color: "#8FB8FF", intensity: 2 }} />
      <WetGround />
      {/* Hauswand mit großem Fenster, drinnen warmes Dämmerlicht */}
      <mesh position={[0, 3, -4.0]} receiveShadow>
        <boxGeometry args={[12, 6, 0.4]} />
        <meshStandardMaterial color={Z.wallB} roughness={0.85} />
      </mesh>
      <mesh position={[0.6, 2.35, -3.78]}>
        <planeGeometry args={[2.6, 2.4]} />
        <meshStandardMaterial color="#2A2420" emissive="#5A3A22" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0.6, 2.8, -3.2]} color="#FFC78A" intensity={3.5} distance={5} decay={2} />
      <Klotz frame={frame} who="anton" position={anton} rotation={[0, 0.25, 0]} eyes="dot" mouth="flat" blinkSeed={7} brow={-0.4} reach={[0.25, 0.1]} jar={{ fill: 0.05, glow: 1.6 }} />
      {/* Fensterrahmen + Regenglas davor */}
      <mesh position={[0.6, 2.35, -3.55]}>
        <planeGeometry args={[2.6, 2.4]} />
        <meshPhysicalMaterial color="#9FB6D8" transparent opacity={0.16} roughness={0.1} />
      </mesh>
      {[-0.7, 0.6, 1.9].map((x) => (
        <mesh key={x} position={[x, 2.35, -3.5]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color={Z.trim} />
        </mesh>
      ))}
      {[1.1, 3.6].map((y) => (
        <mesh key={y} position={[0.6, y, -3.5]}>
          <boxGeometry args={[2.8, 0.12, 0.12]} />
          <meshStandardMaterial color={Z.trim} />
        </mesh>
      ))}
      {/* Ida von hinten im Vordergrund (Schulter, Frisur) */}
      <Klotz frame={frame} who="ida" position={[-2.3, 0, 0.2]} rotation={[0, Math.PI - 0.35, 0]} scale={1.0} blinkSeed={3} reach={[0.1, 0.25]} jar={{ fill: 0.6 }} />
      <Lamp position={[3.8, 0, -2.6]} />
      <Rain frame={frame} center={[0, 3.5, -1]} size={[10, 8, 6]} opacity={0.3} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 3 world – „This is Minuteburg. Everyone wears a little glass jar. | Inside: golden sand.“ */
/* ------------------------------------------------------------------ */
export const ZwWorld: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const detail = beat("jarDetail");
  const cutAt = Math.max(60, detail - 27); // auf „Inside“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Kranfahrt: von über den Dächern hinab zur Straße mit dem Schaufenster „TIME REPAIRS“
    const t = ramp(frame, 0, cutAt, Easing.inOut(Easing.cubic));
    const pos: V3 = [lerp(-3, 1.2, t), lerp(15, 3.1, t), lerp(14, 8.5, t)];
    const look: V3 = [lerp(0, 1.4, t), lerp(3, 2.2, t), lerp(-12, -3.4, t)];
    return (
      <>
        <Atmos bg={Z.fogDeep} fog={[10, 50]} sky="#7F97B8" ground="#121821" hemi={0.75} keyLight={{ pos: [-8, 14, 6], color: "#AFC4E6", intensity: 1.0 }} rim={{ pos: [6, 6, -14], color: "#8FB8FF", intensity: 2 }} />
        <WetGround glints={[[-4, 0, -1], [5, 0, -1]]} />
        <HouseRow z={-6} from={-14} to={-1.6} seed={21} />
        <HouseRow z={-6} from={4.6} to={16} seed={22} />
        <HouseRow z={-18} from={-20} to={20} seed={23} scale={1.3} />
        {/* Uhrmacher-Laden mit Schaufenster */}
        <group position={[1.5, 0, -4.6]}>
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[6, 6.4, 2.6]} />
            <meshStandardMaterial color="#3F4B5E" roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.7, 1.31]}>
            <planeGeometry args={[4.2, 2.4]} />
            <meshStandardMaterial color="#2A1E14" emissive="#7A4A1A" emissiveIntensity={0.5} />
          </mesh>
          <Gear position={[-0.9, 1.9, 1.0]} radius={0.8} teeth={16} angle={frame * 0.03} />
          <Gear position={[0.55, 1.4, 1.0]} radius={0.55} teeth={11} angle={-frame * 0.045 + 0.2} />
          <Gear position={[1.3, 2.4, 1.0]} radius={0.4} teeth={9} angle={frame * 0.06} />
          <pointLight position={[0, 1.9, 1.9]} color="#FFC07A" intensity={4} distance={5} decay={2} />
          <mesh position={[0, 1.7, 1.35]}>
            <planeGeometry args={[4.2, 2.4]} />
            <meshPhysicalMaterial color="#AFC8E8" transparent opacity={0.12} roughness={0.05} />
          </mesh>
          <mesh position={[0, 3.45, 1.33]}>
            <planeGeometry args={[4.4, 0.62]} />
            <meshStandardMaterial color="#1B2230" />
          </mesh>
          <TextLabel text="TIME REPAIRS" width={4.0} height={0.5} color="#F2E2B8" position={[0, 3.45, 1.36]} />
        </group>
        <Lamp position={[-4, 0, -1]} />
        <Lamp position={[5, 0, -1]} />
        {/* Passanten mit Gläsern */}
        <Klotz frame={frame} who="towns" shirt="#4E5C70" position={[lerp(-3.4, -1.6, ramp(frame, 0, duration)), 0, -0.6]} rotation={[0, Math.PI / 2, 0]} walk={1} blinkSeed={21} jar={{ fill: 0.7, glow: 1.4 }} />
        <Klotz frame={frame + 9} who="worker" position={[lerp(5.2, 3.6, ramp(frame, 0, duration)), 0, 0.6]} rotation={[0, -Math.PI / 2, 0]} walk={1} blinkSeed={22} jar={{ fill: 0.45, glow: 1.4 }} />
        <Rain frame={frame} center={[0, 6, 0]} size={[22, 14, 18]} opacity={0.26} />
        <Shot frame={f} duration={cutAt} from={pos} look={look} fov={40} shake={0.01} />
      </>
    );
  }
  // Detail: Zeitglas am Gürtel einer Passantin (Messingdeckel, Hahn, Lederclip, Gold leuchtet)
  const hip: V3 = [0.42, 0.62 + 0.36 * 0.55, 0.42];
  const a = frameOn(hip, 2.1, 0.5, 0.5, [0.35, 0.12, 1]);
  const b = frameOn(hip, 1.6, 0.5, 0.5, [0.22, 0.1, 1]);
  return (
    <>
      <Atmos bg="#141C2A" fog={[2, 12]} sky="#7F97B8" ground="#121821" hemi={0.6} keyLight={{ pos: [3, 5, 4], color: "#CFDDF5", intensity: 1.3 }} rim={{ pos: [-3, 2, -4], color: "#8FB8FF", intensity: 3 }} />
      <Klotz frame={frame} who="towns" shirt="#5B4E6A" position={[0, 0, 0]} rotation={[0, 0, 0]} blinkSeed={23} jar={{ fill: 0.72, glow: 1.6 }} />
      <Halo at={[-1.6, 1.8, -3]} size={1.6} opacity={0.5} />
      <Halo at={[1.8, 1.2, -4]} size={2.1} opacity={0.4} />
      <Halo at={[0.8, 2.3, -5]} size={1.2} color="#9CC0FF" opacity={0.45} />
      <Rain frame={frame} center={[0, 2, -1]} size={[4, 4, 3]} count={120} opacity={0.25} />
      <Motes frame={frame} center={hip} size={[0.8, 0.8, 0.6]} count={40} drift={[0, 0.002, 0]} color={Z.goldHot} dot={0.012} opacity={0.8} seed={31} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 4 rules – „Every grain is one second. Work fills the jar. | Buying empties it.“ */
/* ------------------------------------------------------------------ */
export const ZwRules: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const fills = beat("factoryFill");
  const empties = beat("bakerScale");
  const cutAt = Math.max(36, fills - 12);
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Makro: einzelne Körner fallen im Sekundentakt durch den Hals des Glases
    const jar: V3 = [0, 0, 0];
    const a = frameOn([0, 0.4, 0], 1.7, 0.5, 0.5, [0.1, 0.05, 1]);
    const b = frameOn([0, 0.45, 0], 1.3, 0.5, 0.5, [0.06, 0.05, 1]);
    const grains = [0, 1, 2, 3].map((k) => {
      const t = ((frame + k * 30) % 30) / 30;
      return { y: lerp(0.62, 0.3, t * t), o: t < 0.95 ? 1 : 0 };
    });
    return (
      <>
        <Atmos bg="#0E141F" fog={[1.5, 8]} sky="#7F97B8" ground="#121821" hemi={0.45} keyLight={{ pos: [2, 3, 3], color: "#E6EEFF", intensity: 1.2 }} rim={{ pos: [-2, 1, -3], color: "#FFB247", intensity: 2.2 }} />
        <TimeJar position={jar} scale={1.6} fill={0.55} clip={false} />
        {grains.map((g, i) => (
          <mesh key={i} position={[0.01 * i, g.y, 0.02]} visible={g.o > 0}>
            <sphereGeometry args={[0.012, 8, 6]} />
            <meshBasicMaterial color={Z.goldHot} toneMapped={false} />
          </mesh>
        ))}
        <Halo at={[0.6, 0.6, -1.4]} size={0.9} opacity={0.5} />
        <Halo at={[-0.7, 0.2, -1.8]} size={1.2} color="#9CC0FF" opacity={0.4} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Fahrt links → rechts: Fabrik füllt Gläser (Sand aus Messingrohr) → Bäcker kippt ein Kunden-Glas auf seine Waage
  const startX = -2.4;
  const endX = 5.2;
  const t = ramp(frame, empties - 9, empties + 5, Easing.inOut(Easing.cubic));
  const x = lerp(startX, endX, t);
  const crank = frame * 0.12;
  const workerFill = 0.25 + 0.4 * ramp(frame, fills, fills + 40);
  const customerFill = 0.7 - 0.45 * ramp(frame, empties, empties + 30);
  return (
    <>
      <Atmos bg="#1A1E26" fog={[8, 30]} sky="#9DB0CC" ground="#1A1612" hemi={0.75} keyLight={{ pos: [2, 9, 6], color: "#E6EEFF", intensity: 1.4 }} rim={{ pos: [0, 5, -8], color: "#FFB247", intensity: 1.2 }} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#2E3440" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[1.5, 4, -3.5]} receiveShadow>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial color="#3C4452" roughness={0.9} />
      </mesh>
      {/* Fabrik: Messingrohr mit Kurbel, Arbeiter dreht, Sand fließt ins Glas */}
      <mesh position={[1.4, 3.6, -1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 11.6, 16]} />
        <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-1.6, 3.0, -1.2]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
        <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      <group position={[-3.6, 2.4, -1.0]} rotation={[0, 0, crank]}>
        <mesh>
          <boxGeometry args={[0.9, 0.1, 0.1]} />
          <meshStandardMaterial color="#5A5048" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      <Klotz frame={frame} who="worker" position={[-3.0, 0, -0.4]} rotation={[0, -0.5, 0]} reach={[1.2 + Math.sin(crank) * 0.25, 1.1 + Math.cos(crank) * 0.25]} blinkSeed={31} mouth="flat" />
      <TimeJar position={[-1.6, 1.7, -1.1]} scale={1.3} fill={workerFill} />
      <Plank size={[1.2, 0.12, 0.8]} position={[-1.6, 1.64, -1.1]} color="#5A4636" />
      <SandStream frame={frame} from={[-1.6, 2.4, -1.15]} to={[-1.6, 1.95, -1.1]} on={frame >= fills - 6 ? 1 : 0.3} />
      {/* Bäckerei: Waage aus Messing, Bäcker kippt das Kunden-Glas */}
      <Plank size={[3.2, 0.2, 1.2]} position={[5.2, 1.4, -1.0]} color="#9A7050" />
      <group position={[4.8, 1.5, -0.9]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 1, 10]} />
          <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.sin(frame * 0.08) * 0.05 - 0.08 * ramp(frame, empties, empties + 30)]}>
          <boxGeometry args={[1.6, 0.05, 0.05]} />
          <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
        </mesh>
        <BrassDish position={[0.75, 0.62, 0]} scale={0.6} fill={0.2 + 0.6 * ramp(frame, empties, empties + 30)} />
        <BrassDish position={[-0.75, 0.62, 0]} scale={0.6} />
      </group>
      <Klotz frame={frame} who="baker" position={[6.4, 0, -1.8]} rotation={[0, -0.6, 0]} reach={[1.3, 0.4]} blinkSeed={32} mouth="grin" />
      <Klotz frame={frame} who="towns" shirt="#4A6670" position={[3.6, 0, 0.6]} rotation={[0, 0.8, 0]} reach={[0.2, 1.4]} blinkSeed={33} mouth="frown" brow={-0.5} jar={{ fill: customerFill, glow: 1.4 }} />
      <SandStream frame={frame} from={[5.0, 2.55, -0.6]} to={[5.55, 2.15, -0.9]} on={frame >= empties ? 1 - ramp(frame, empties + 30, empties + 40) : 0} />
      <Motes frame={frame} center={[1.5, 3, -1]} size={[12, 4, 3]} count={80} drift={[0.003, 0.001, 0]} color="#E8EEF8" dot={0.05} opacity={0.35} seed={41} />
      <Shot frame={f} duration={duration - cutAt} from={[x, 2.9, 8.2]} look={[x, 2.1, -1]} fov={40} shake={0.012} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 5 empty – „And when a jar runs empty? | Every kid knows: | the Glass Office comes. | And you disappear.“ */
/* ------------------------------------------------------------------ */

/** Graue Amtstür mit Milchglas-Emblem (eigene Form: Sanduhr-Umriss im Kreis) und Schildern. */
export const OfficeDoor: React.FC<{ readonly frost?: number; readonly sign?: boolean; readonly gap?: number }> = ({ frost = 0.4, sign = true, gap = 0 }) => (
  <group>
    <mesh position={[0, 3.2, -0.25]} receiveShadow>
      <boxGeometry args={[9, 6.4, 0.5]} />
      <meshStandardMaterial color="#3A414C" roughness={0.9} />
    </mesh>
    {/* Türblatt (öffnet bei gap > 0 nach innen) */}
    <group position={[-1.0, 0, 0.02]} rotation={[0, -gap * 1.2, 0]}>
      <mesh position={[1.0, 1.7, 0]} castShadow>
        <boxGeometry args={[2.0, 3.4, 0.14]} />
        <meshStandardMaterial color="#59616D" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[1.0, 2.45, 0.08]}>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial color="#DDEAF3" emissive="#BFD8EA" emissiveIntensity={frost} roughness={0.3} toneMapped={false} />
      </mesh>
      {/* Sanduhr-Umriss im Milchglas */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[1.0, 2.45 + s * 0.17, 0.09]} rotation={[0, 0, s > 0 ? Math.PI : 0]}>
          <circleGeometry args={[0.22, 3]} />
          <meshBasicMaterial color="#6E8496" />
        </mesh>
      ))}
      <mesh position={[1.75, 1.6, 0.12]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color="#9AA3AE" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Türklopfer (Ring) */}
      <mesh position={[1.0, 1.75, 0.12]}>
        <torusGeometry args={[0.16, 0.035, 10, 24]} />
        <meshStandardMaterial color="#9AA3AE" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
    {gap > 0 ? (
      <mesh position={[0, 1.7, -0.2]}>
        <planeGeometry args={[2.0, 3.4]} />
        <meshBasicMaterial color="#E6F0F8" toneMapped={false} />
      </mesh>
    ) : null}
    {sign ? (
      <group position={[0, 4.1, 0.03]}>
        <mesh>
          <planeGeometry args={[3.6, 0.9]} />
          <meshStandardMaterial color="#C9D3DC" roughness={0.6} />
        </mesh>
        <TextLabel text="GLASS OFFICE" width={3.3} height={0.5} color="#1E2630" position={[0, 0.13, 0.01]} />
        <TextLabel text="REPORT EMPTY JARS" width={3.2} height={0.3} color="#6A2A32" position={[0, -0.24, 0.01]} />
      </group>
    ) : null}
  </group>
);

export const ZwEmpty: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const office = beat("glassOfficeDoor");
  const gone = beat("emptyJarRolls");
  const c1 = 66; // „Every kid knows“
  const c2 = Math.max(c1 + 45, gone - 23); // auf „And you“
  const { shot, f, from } = cut(frame, [c1, c2]);
  const doorGlow = 0.35 + 0.9 * ramp(frame, office - 4, office + 8);
  const alley = (
    <>
      <Atmos bg="#0C121C" fog={[6, 26]} sky="#5A6E8E" ground="#0E131A" hemi={0.45} keyLight={{ pos: [-4, 8, 6], color: "#9DB2D2", intensity: 0.7 }} rim={{ pos: [3, 5, -6], color: "#B8D4F0", intensity: 1.6 }} />
      <WetGround glints={[[0, 0, -0.2]]} glintColor="#CFE3F2" />
      <group position={[0, 0, -2]}>
        <OfficeDoor frost={doorGlow} />
      </group>
      <pointLight position={[0, 2.5, -0.6]} color="#CFE3F2" intensity={1.2 + 3 * ramp(frame, office - 4, office + 8)} distance={7} decay={2} />
      <HouseRow z={-9} from={-12} to={12} seed={51} lit={0.2} />
      <Rain frame={frame} center={[0, 4, 1]} size={[12, 9, 8]} opacity={0.34} />
    </>
  );
  if (shot === 0) {
    const a = frameOn([0, 2.6, -2], 9.5, 0.5, 0.5, [0.15, 0.08, 1]);
    const b = frameOn([0, 2.6, -2], 8.2, 0.5, 0.5, [0.1, 0.06, 1]);
    return (
      <>
        {alley}
        <Lamp position={[3.4, 0, -0.6]} light={4} />
        <Shot frame={f} duration={c1} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Kinder flüstern hinter einer Mauer, hinten leuchtet die Amtstür auf („Glass Office“)
    const a = frameOn([0.1, 2.2, 2.0], 5.4, 0.5, 0.5, [0.25, 0.05, 1]);
    const b = frameOn([0.1, 2.2, 2.0], 4.6, 0.5, 0.5, [0.18, 0.05, 1]);
    return (
      <>
        {alley}
        <mesh position={[0, 0.7, 3.2]} castShadow receiveShadow>
          <boxGeometry args={[5, 1.4, 0.5]} />
          <meshStandardMaterial color="#4A5262" roughness={0.9} />
        </mesh>
        <Klotz frame={frame} who="kid" position={[-0.55, 0, 2.5]} rotation={[0, 0.5, 0]} look={0.4} eyes="wide" mouth="o" blinkSeed={51} reach={[1.2, 0.3]} jar={{ fill: 0.8 }} />
        <Klotz frame={frame + 7} who="kid" shirt="#3E5A4A" position={[0.65, 0, 2.6]} rotation={[0, -0.5, 0]} look={-0.5} eyes="wide" mouth="flat" blinkSeed={52} reach={[0.3, 0.9]} jar={{ fill: 0.6 }} />
        <Shot frame={f} duration={c2 - c1} {...fly(a, b)} />
      </>
    );
  }
  // Bodennah: leeres Glas fällt aufs Pflaster und rollt, die Laterne flackert aus
  const lf = frame - gone;
  const fall = lf < 0 ? 0 : Math.min(1, lf / 8);
  const y = lf < 0 ? 1.1 : lf < 8 ? 1.1 * (1 - fall * fall) : Math.abs(Math.sin(lf * 0.5)) * 0.08 * Math.exp(-(lf - 8) * 0.25);
  const roll = Math.max(0, lf - 8) * 0.05;
  const flick = lf < 0 ? 1 : lf < 16 ? (Math.floor(lf / 2) % 2 ? 0.25 : 0.9) : Math.max(0, 1 - (lf - 16) / 6);
  const a = frameOn([0.4, 0.6, 0.4], 3.0, 0.55, 0.5, [0.35, 0.25, 1]);
  const b = frameOn([0.9, 0.4, 0.4], 2.4, 0.55, 0.5, [0.3, 0.22, 1]);
  void from;
  return (
    <>
      <Atmos bg="#0A0F18" fog={[5, 20]} sky="#6A7FA0" ground="#0E131A" hemi={0.7} rim={{ pos: [3, 4, -6], color: "#B8D4F0", intensity: 1.4 }} />
      <WetGround glints={flick > 0.3 ? [[-1.4, 0, -1.4]] : []} />
      <Lamp position={[-1.4, 0, -3.2]} on={flick} />
      <TimeJar position={[0.3 + roll * 1.4, 0.16 + y, 0.4]} rotation={[lf >= 8 ? 0 : -fall * 1.2, 0, Math.PI / 2 + roll * 6]} scale={1.3} fill={0} glow={0} clip />
      <HouseRow z={-8} from={-10} to={10} seed={52} lit={0.1} />
      <Rain frame={frame} center={[0, 2, 0]} size={[6, 5, 5]} count={160} opacity={0.3} />
      <Shot frame={f} duration={duration - c2} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 6 ida – „Ida is fourteen. | She fixes clocks in a tiny workshop. | Grandpa Anton taught her everything.“ */
/* ------------------------------------------------------------------ */
export const ZwIda: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const clocks = beat("workshopPocketWatch");
  const anton = beat("flashbackHands");
  const cutAt = Math.max(70, anton - 27); // auf „Grandpa“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Halbnah in der warmen Werkstatt: Ida öffnet eine Taschenuhr, springt dann vom Hocker (Hop)
    const h = hop(frame, cutAt - 26, 0.7, 12);
    const open = ramp(frame, clocks - 6, clocks + 10);
    const a = frameOn([0.0, 2.2, -1.0], 8.0, 0.5, 0.5, [0.25, 0.12, 1]);
    const b = frameOn([0.0, 2.1, -1.0], 6.8, 0.5, 0.5, [0.15, 0.1, 1]);
    const sitting = frame < cutAt - 26;
    return (
      <>
        <WorkshopSet frame={frame} />
        <Plank size={[0.9, 0.12, 0.9]} position={[-0.3, 1.02, -0.6]} color="#7A5A40" />
        <Plank size={[0.12, 1.0, 0.12]} position={[-0.3, 0.5, -0.6]} color="#5A4030" />
        <Klotz
          frame={frame}
          who="ida"
          position={[-0.3, sitting ? 0.25 : h.y, sitting ? -0.45 : -0.1]}
          rotation={[0, 0.1, 0]}
          squash={h.squash}
          reach={sitting ? [1.25, 1.35] : [0.4, 0.5]}
          eyes={frame >= clocks ? "happy" : "dot"}
          mouth="smile"
          blinkSeed={3}
          nod={sitting ? 0.25 : 0}
          jar={{ fill: 0.6 }}
        />
        <PocketWatch frame={frame} position={[0.15, 1.62, -1.55]} rotation={[-1.2, 0, 0]} scale={0.42} open={open} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Rückblende-Insert: Antons Hände führen Idas Hände mit der Pinzette (warmer Dunst)
  const a = frameOn([0.3, 1.75, -1.3], 2.8, 0.5, 0.5, [0.1, 0.55, 1]);
  const b = frameOn([0.3, 1.72, -1.3], 2.3, 0.5, 0.5, [0.08, 0.5, 1]);
  const guide = Math.sin(frame * 0.07) * 0.05;
  return (
    <>
      <WorkshopSet frame={frame} haze={1} warm={1.2} />
      <PocketWatch frame={frame} position={[0.1, 1.56, -1.4]} rotation={[-Math.PI / 2, 0, 0]} scale={0.6} open={1} />
      {/* Idas Fäustling mit Pinzette, darüber Antons größere Hand */}
      <group position={[0.35 + guide, 1.82, -1.15]} rotation={[0, 0, 0.5]}>
        <mesh>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshPhysicalMaterial color={Z.skin} roughness={0.5} clearcoat={0.5} />
        </mesh>
        <mesh position={[-0.2, -0.16, 0]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.02, 0.36, 0.02]} />
          <meshStandardMaterial color="#C8CCD2" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.32, 0.1, 0]} rotation={[0, 0, -1.2]}>
          <boxGeometry args={[0.3, 0.55, 0.3]} />
          <meshPhysicalMaterial color={Z.idaShirt} roughness={0.42} clearcoat={0.5} />
        </mesh>
      </group>
      <group position={[0.55 + guide, 1.98, -1.05]}>
        <mesh>
          <sphereGeometry args={[0.24, 16, 12]} />
          <meshPhysicalMaterial color="#E8BE98" roughness={0.5} clearcoat={0.5} />
        </mesh>
        <mesh position={[0.36, 0.14, 0.05]} rotation={[0, 0, -1.25]}>
          <boxGeometry args={[0.36, 0.62, 0.36]} />
          <meshPhysicalMaterial color={Z.anton} roughness={0.42} clearcoat={0.5} />
        </mesh>
      </group>
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 7 thread – „This morning, she checks his jar. | One thin thread of sand. | A day, at most.“ */
/* ------------------------------------------------------------------ */
export const ZwThread: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const sand = beat("pushInThinThread");
  const most = beat("idaHalfProfile");
  const c1 = Math.max(40, sand - 40); // auf „One“
  const c2 = Math.max(c1 + 45, most - 25); // auf „A day“
  const { shot, f } = cut(frame, [c1, c2]);
  const jarPos: V3 = [-1.6, 1.37, -2.0];
  if (shot === 0) {
    // Morgengrauen: Ida in der Tür, Anton schläft im Sessel, das Glas auf dem Nachttisch
    const a = frameOn([-0.6, 2.0, -1.6], 9.0, 0.5, 0.5, [0.35, 0.15, 1]);
    const b = frameOn([-0.8, 1.9, -1.6], 7.8, 0.5, 0.5, [0.3, 0.14, 1]);
    return (
      <>
        <AntonRoom frame={frame} light="dawn" />
        <Klotz frame={frame} who="anton" position={[1.6, 0.6, -2.3]} sit eyes="closed" mouth="flat" blinkSeed={7} reach={[0.9, 0.9]} />
        <TimeJar position={jarPos} scale={1.4} fill={0.04} glow={2} />
        <Klotz frame={frame} who="ida" position={[-2.6, 0, 0.6]} rotation={[0, 0.9, 0]} look={0.2} eyes="dot" mouth="flat" brow={-0.4} blinkSeed={3} reach={[0.3, 0.2]} jar={{ fill: 0.6 }} />
        <Shot frame={f} duration={c1} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Langsamer Push-in auf das Glas: nur ein dünner Goldfaden am Boden (Tiefenunschärfe über Dunst)
    const a = frameOn([jarPos[0], jarPos[1] + 0.3, jarPos[2]], 2.2, 0.5, 0.5, [0.15, 0.12, 1]);
    const b = frameOn([jarPos[0], jarPos[1] + 0.25, jarPos[2]], 1.4, 0.52, 0.5, [0.12, 0.1, 1]);
    return (
      <>
        <AntonRoom frame={frame} light="dawn" />
        <TimeJar position={jarPos} scale={1.4} fill={0.04} glow={2.5} />
        <Halo at={[jarPos[0], jarPos[1] + 0.05, jarPos[2] + 0.1]} size={0.5} color={Z.gold} opacity={0.6} />
        <Halo at={[-3.2, 3.2, -5.9]} size={3} color="#9CB8E6" opacity={0.35} />
        <Shot frame={f} duration={c2 - c1} {...fly(a, b)} ease="linear" />
      </>
    );
  }
  // Idas Gesicht im Halbprofil, kaltes Morgenlicht, Atem dampft
  const head: V3 = [-1.2, 2.18, -0.6];
  const a = frameOn(head, 4.0, 0.45, 0.5, [0.9, 0.05, 0.5]);
  const b = frameOn(head, 3.4, 0.45, 0.5, [0.85, 0.05, 0.55]);
  const breath = (frame - c2) % 40;
  return (
    <>
      <AntonRoom frame={frame} light="dawn" />
      <Klotz frame={frame} who="ida" position={[-1.2, 0, -0.6]} rotation={[0, 0.7, 0]} eyes="dot" mouth="flat" brow={-0.6} blinkSeed={3} jar={{ fill: 0.6 }} />
      <Motes frame={breath} center={[-0.55, 1.95, 0.25]}  size={[0.5, 0.25, 0.4]} count={30} drift={[-0.006, 0.002, 0.004]} color="#E4EEFF" dot={0.09} opacity={breath < 24 ? 0.35 * (1 - breath / 24) : 0} seed={61} />
      <Shot frame={f} duration={duration - c2} {...fly(a, b)} />
    </>
  );
};

export { SpotlightStage };
