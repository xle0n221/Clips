/**
 * „In This City, You Pay With Time“ – Szenen 8–14 (tower … twenty): Spannung → Re-Hook → Twist.
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { eyePopAt, SpotlightStage } from "../kit/motion";
import { useScene } from "../types";
import { AntonRoom, Crowd, MarketSet } from "./zeitwelt1";
import {
  Atmos,
  cut,
  fly,
  frameOn,
  Gear,
  Halo,
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
  SandStream,
  TextLabel,
  TimeJar,
  WetGround,
  Z,
} from "./zeitweltSets";

/* ------------------------------------------------------------------ */
/* 8 tower – „So Ida fixes the tower clock. | Ten hours of work… | two hours of sand.“ */
/* ------------------------------------------------------------------ */

/** Inneres des Uhrturms: riesige Messing-Zahnräder, Turmfenster mit wanderndem Sonnenstrahl. */
const TowerSet: React.FC<{ readonly frame: number; readonly sun?: number }> = ({ frame, sun = 0.3 }) => {
  const sx = lerp(-3, 3, sun);
  return (
    <>
      <Atmos bg="#1A1612" fog={[8, 34]} sky="#E8C9A0" ground="#1A120C" hemi={0.5} keyLight={{ pos: [sx * 2, 9, -6], color: "#FFD9A8", intensity: 1.4 }} rim={{ pos: [-4, 4, 6], color: "#8FB0E0", intensity: 1.0 }} />
      <mesh position={[0, 6, -4]} receiveShadow>
        <boxGeometry args={[16, 16, 0.4]} />
        <meshStandardMaterial color="#4A3E36" roughness={0.9} />
      </mesh>
      {/* rundes Turmfenster */}
      <mesh position={[0, 8.5, -3.78]}>
        <circleGeometry args={[1.5, 40]} />
        <meshBasicMaterial color="#F6E2B8" toneMapped={false} />
      </mesh>
      <LightShaft from={[0, 8.5, -3.6]} to={[sx, 0.5, 1.5]} radius={2.2} top={1.4} color="#FFE2B0" opacity={0.2} />
      <Gear position={[-2.6, 5.2, -2.8]} radius={2.6} teeth={28} angle={frame * 0.006} />
      <Gear position={[1.9, 3.4, -2.4]} radius={1.7} teeth={20} angle={-frame * 0.0092 + 0.1} />
      <Gear position={[2.6, 7.2, -2.9]} radius={1.2} teeth={14} angle={frame * 0.013} />
      <Gear position={[-1.0, 1.4, -1.8]} radius={1.0} teeth={12} angle={-frame * 0.016} />
      {/* Holzbalken / Laufsteg */}
      <Plank size={[10, 0.3, 2.2]} position={[0, 2.0, 0]} color="#7A5A40" />
      <Plank size={[0.3, 10, 0.3]} position={[-4.4, 5, -1]} color="#5A4030" />
      <Plank size={[0.3, 10, 0.3]} position={[4.4, 5, -1]} color="#5A4030" />
      <Motes frame={frame} center={[sx * 0.6, 4, 0]} size={[5, 8, 4]} count={140} drift={[0.002, 0.003, 0]} color="#FFE4B8" dot={0.05} opacity={0.7} seed={71} />
    </>
  );
};

export const ZwTower: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const tower = beat("towerGearsLowAngle");
  const payout = beat("tinyPayout");
  const c1 = Math.max(40, tower + 28); // auf „Ten hours“
  const c2 = Math.max(c1 + 45, payout - 28); // auf „two hours“
  const { shot, f } = cut(frame, [c1, c2]);
  if (shot === 0) {
    // Untersicht: Ida klettert zwischen den riesigen Zahnrädern
    const climb = ramp(frame, 0, c1);
    const a = frameOn([0, 4.4, -1], 11, 0.5, 0.5, [0.1, -0.45, 1]);
    const b = frameOn([0, 4.6, -1], 9.6, 0.5, 0.5, [0.05, -0.5, 1]);
    return (
      <>
        <TowerSet frame={frame} sun={0.2} />
        <Klotz frame={frame} who="ida" position={[0.2, 2.15 + climb * 0.1, 0]} rotation={[0, -0.3, 0]} reach={[2.6 + Math.sin(frame * 0.2) * 0.2, 2.2]} eyes="dot" mouth="flat" blinkSeed={3} jar={{ fill: 0.35 }} />
        <Shot frame={f} duration={c1} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Zeitraffer: Sonnenstrahl wandert, Ida arbeitet (Schraubenschlüssel am Zahnrad)
    const sun = ramp(frame, c1, c2, Easing.linear);
    const a = frameOn([0.4, 3.6, -0.6], 8, 0.5, 0.5, [0.3, 0.1, 1]);
    return (
      <>
        <TowerSet frame={frame * 6} sun={0.2 + sun * 0.8} />
        <Klotz frame={frame} who="ida" position={[0.4, 2.15, 0]} rotation={[0, -0.5, 0]} reach={[1.4 + Math.sin(frame * 0.9) * 0.3, 0.3]} eyes="dot" mouth="flat" brow={0.2} blinkSeed={3} jar={{ fill: 0.35 }} />
        <Shot frame={f} duration={c2 - c1} {...fly(a)} />
      </>
    );
  }
  // Auszahlung: nur ein kurzes Rinnsal tropft aus dem Messingrohr in ihr Glas, ihr Gesicht fällt
  const drip = frame >= payout - 6 && frame < payout + 14 ? 1 : 0;
  const sad = frame >= payout + 6;
  const a = frameOn([0.4, 3.4, 0], 4.6, 0.46, 0.5, [0.25, 0.08, 1]);
  const b = frameOn([0.4, 3.3, 0], 4.0, 0.46, 0.5, [0.2, 0.06, 1]);
  return (
    <>
      <TowerSet frame={frame} sun={1} />
      <mesh position={[1.5, 5.0, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 2.2, 14]} />
        <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      <Klotz frame={frame} who="ida" position={[0.4, 2.15, 0]} rotation={[0, 0.1, 0]} reach={[0.2, 0.6]} eyes="dot" mouth={sad ? "frown" : "flat"} brow={sad ? -0.6 : 0} nod={sad ? 0.25 : 0} blinkSeed={3} jar={{ fill: 0.35 + (sad ? 0.04 : 0) }} />
      <SandStream frame={frame} from={[0.6, 4.95, 0.4]} to={[0.8, 3.2, 0.5]} width={0.012} on={drip} />
      <Shot frame={f} duration={duration - c2} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 9 rent – „Then the rent goes up. | By a whole week. | Her own jar gets lighter.“ */
/* ------------------------------------------------------------------ */
export const ZwRent: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const notice = beat("rentNotice");
  const lighter = beat("idaJarDrops");
  const cutAt = Math.max(60, lighter - 33); // auf „Her own jar“
  const { shot, f } = cut(frame, [cutAt]);
  const street = (
    <>
      <Atmos bg={Z.fogDeep} fog={[6, 28]} sky="#7F97B8" ground="#121821" hemi={0.75} keyLight={{ pos: [-5, 9, 6], color: "#AFC4E6", intensity: 1.1 }} rim={{ pos: [4, 4, -8], color: "#8FB8FF", intensity: 1.8 }} />
      <WetGround glints={[[3.2, 0, -0.8]]} />
      <mesh position={[0, 3, -2.3]} receiveShadow>
        <boxGeometry args={[12, 6, 0.4]} />
        <meshStandardMaterial color={Z.wallA} roughness={0.85} />
      </mesh>
      <mesh position={[-0.4, 1.6, -2.08]}>
        <boxGeometry args={[1.9, 3.2, 0.1]} />
        <meshStandardMaterial color={Z.woodDark} roughness={0.7} />
      </mesh>
      <Lamp position={[3.2, 0, -1.4]} />
      <Rain frame={frame} center={[0, 3.5, 0]} size={[10, 8, 6]} opacity={0.26} />
    </>
  );
  if (shot === 0) {
    // Vermieter (Zylinder) nagelt den Zettel „RENT +1 WEEK“ an die Tür – Hammerschläge mit Ausholen
    const hit = (frame % 18) / 18;
    const ham = frame < notice + 10 ? Math.sin(hit * Math.PI * 2) * 0.5 : 0;
    const paperIn = ramp(frame, 8, 22);
    const a = frameOn([0.2, 2.5, -1.6], 6.8, 0.48, 0.5, [0.25, 0.05, 1]);
    const b = frameOn([0.2, 2.45, -1.6], 5.6, 0.47, 0.5, [0.18, 0.04, 1]);
    return (
      <>
        {street}
        <group position={[-0.55, 2.5, -2.0]} rotation={[0, 0, 0.04 * (1 - paperIn)]} scale={1.3 * paperIn}>
          <mesh>
            <planeGeometry args={[1.5, 1.0]} />
            <meshStandardMaterial color={Z.paper} roughness={0.9} />
          </mesh>
          <TextLabel text="RENT" width={1.2} height={0.34} color="#3A1A1A" position={[0, 0.2, 0.01]} />
          <TextLabel text="+1 WEEK" width={1.3} height={0.34} color="#8A1F2A" position={[0, -0.2, 0.01]} />
        </group>
        <Klotz frame={frame} who="landlord" position={[1.25, 0, -1.0]} rotation={[0, -1.1, 0]} reach={[1.5 + ham, 0.3]} mouth="grin" brow={0.5} blinkSeed={81} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Over-the-shoulder: Ida gießt Sand aus ihrem Glas in seinen Messingtrichter, ihr Pegel sinkt
  const pour = ramp(frame, cutAt + 4, lighter + 10);
  const a = frameOn([0.5, 2.3, -0.6], 5.8, 0.52, 0.5, [-0.45, 0.15, 1]);
  const b = frameOn([0.55, 2.25, -0.5], 5.0, 0.52, 0.5, [-0.4, 0.12, 1]);
  return (
    <>
      {street}
      <Klotz frame={frame} who="landlord" position={[1.6, 0, -1.2]} rotation={[0, -0.6, 0]} reach={[1.1, 0.2]} mouth="grin" blinkSeed={81} />
      <group position={[0.75, 1.7, -0.5]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.32, 0.05, 0.5, 24, 1, true]} />
          <meshStandardMaterial color={Z.brass} metalness={0.85} roughness={0.25} side={2} />
        </mesh>
      </group>
      <Klotz frame={frame} who="ida" position={[-0.9, 0, 0.6]} rotation={[0, 0.9, 0]} reach={[1.2, 0.4]} eyes="dot" mouth="frown" brow={-0.5} blinkSeed={3} jar={{ fill: lerp(0.35, 0.12, pour) }} />
      <SandStream frame={frame} from={[0.4, 2.25, -0.2]} to={[0.75, 2.05, -0.5]} width={0.016} on={frame > cutAt + 4 && frame < lighter + 10 ? 1 : 0} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 10 rehook – „And then Ida sees something… | that shouldn't exist.“ */
/* ------------------------------------------------------------------ */
export const ZwRehook: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const exist = beat("eyeReflection");
  // Sehr langsamer Push-in auf Idas Augen; in den Pupillen spiegelt sich eine kleine Gestalt mit Besen
  const head: V3 = [0, 2.18, 0];
  const a = frameOn([0, 2.3, 0], 3.6, 0.47, 0.5, [0, 0.02, 1]);
  const b = frameOn([0, 2.24, 0], 1.25, 0.47, 0.5, [0, 0.02, 1]);
  const refl = ramp(frame, 20, exist);
  void head;
  return (
    <>
      <Atmos bg="#0D131D" fog={[3, 16]} sky="#6A7FA0" ground="#0E131A" hemi={0.8} keyLight={{ pos: [2, 4, 5], color: "#CFDDF5", intensity: 1.3 }} rim={{ pos: [-3, 4, -5], color: "#9CC4FF", intensity: 2.4 }} />
      <Klotz frame={frame} who="ida" position={[0, 0, 0]} eyes="dot" mouth="flat" eyePop={1 + 0.25 * refl} blinkSeed={99} jar={{ fill: 0.12 }} />
      {/* Spiegelbild in beiden Pupillen: winzige Kehrerin (pflaumenfarben) mit Besen */}
      {[-0.225, 0.225].map((x) => (
        <group key={x} position={[x * 0.9, 2.18 + 0.06 * 0.9, 0.476 * 0.9 + 0.012]} scale={0.9 * (1 + 0.25 * refl)}>
          <mesh position={[0.0, -0.005, 0]}>
            <planeGeometry args={[0.02, 0.035]} />
            <meshBasicMaterial color="#B87AA8" transparent opacity={refl} toneMapped={false} />
          </mesh>
          <mesh position={[0.0, 0.018, 0]}>
            <circleGeometry args={[0.009, 10]} />
            <meshBasicMaterial color="#D8A8C8" transparent opacity={refl} toneMapped={false} />
          </mesh>
          <mesh position={[0.018, -0.01, 0]} rotation={[0, 0, 0.5]}>
            <planeGeometry args={[0.004, 0.045]} />
            <meshBasicMaterial color="#D8C8A0" transparent opacity={refl} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <HouseRow z={-10} from={-10} to={10} seed={91} lit={0.3} />
      <Motes frame={frame} center={[0, 2.2, 1.2]} size={[2, 2, 1]} count={30} drift={[0.001, 0.001, 0]} color="#C9D8F0" dot={0.04} opacity={0.4} seed={92} />
      <Shot frame={frame} duration={duration} {...fly(a, b)} ease="in" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 11 sweeper – „An old woman sweeps the market square. | Her jar is empty. | And she's alive. | She even hums.“ */
/* ------------------------------------------------------------------ */
export const ZwSweeper: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const empty = beat("sweeperEmptyJar");
  const alive = beat("sweeperWink");
  const c1 = Math.max(50, empty - 21); // auf „Her jar“
  const c2 = Math.max(c1 + 45, alive - 19); // auf „And she's“
  const { shot, f } = cut(frame, [c1, c2]);
  const sweep = Math.sin(frame * 0.15) * 0.5;
  const broom = (
    <group rotation={[0.3 + sweep * 0.3, 0, 0]}>
      <mesh position={[0, -0.6, 0.2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.0, 8]} />
        <meshStandardMaterial color="#8A6A40" roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.7, 0.25]}>
        <coneGeometry args={[0.3, 0.6, 12]} />
        <meshStandardMaterial color="#B8955A" roughness={0.9} />
      </mesh>
    </group>
  );
  const sweeper = (wink: boolean) => (
    <Klotz
      frame={frame}
      who="sweeper"
      position={[0.4, 0, -0.4]}
      rotation={[0, wink ? 0.5 : -0.3, 0]}
      reach={[0.9, 0.8]}
      spread={[0.1, -0.1]}
      eyes={wink && Math.floor((frame - alive) / 6) % 4 === 0 ? "closed" : "dot"}
      mouth="smile"
      brow={-0.2}
      blinkSeed={111}
      holdR={broom}
      jar={{ fill: 0, cobweb: true }}
    />
  );
  if (shot === 0) {
    // Totale: Nebel über dem Platz, die alte Frau fegt; Pfütze spiegelt die Laternen
    const a = frameOn([0.4, 1.6, -0.4], 10, 0.55, 0.5, [0.15, 0.25, 1]);
    const b = frameOn([0.4, 1.6, -0.4], 8.6, 0.55, 0.5, [0.1, 0.22, 1]);
    return (
      <>
        <MarketSet frame={frame} rain={0.4} />
        {sweeper(false)}
        <Shot frame={f} duration={c1} {...fly(a, b)} />
      </>
    );
  }
  if (shot === 1) {
    // Detail: ihr Glas halb unter dem Schultertuch – komplett leer, Spinnweben im Deckel
    const k = 0.92;
    const hip: V3 = [0.4 + 0.42 * k, (0.62 + 0.2) * k, -0.4 + 0.42 * k];
    const a = frameOn(hip, 1.7, 0.5, 0.5, [0.1, 0.08, 1]);
    const b = frameOn(hip, 1.3, 0.5, 0.5, [0.06, 0.06, 1]);
    return (
      <>
        <Atmos bg="#141C2A" fog={[2, 12]} sky="#7F97B8" ground="#121821" hemi={0.8} keyLight={{ pos: [3, 5, 4], color: "#CFDDF5", intensity: 1.4 }} rim={{ pos: [-3, 2, -4], color: "#8FB8FF", intensity: 2.6 }} />
        <Klotz frame={frame} who="sweeper" position={[0.4, 0, -0.4]} reach={[0.9, 0.8]} blinkSeed={111} jar={{ fill: 0, cobweb: true }} />
        <Halo at={[-1.2, 1.4, -3]} size={1.6} opacity={0.45} />
        <Halo at={[1.6, 0.8, -3.6]} size={1.2} color="#9CC0FF" opacity={0.4} />
        <Shot frame={f} duration={c2 - c1} {...fly(a, b)} />
      </>
    );
  }
  // Sie schaut Ida direkt an und zwinkert; Ida (Vordergrund links) mit Augen-Pop
  const pop = eyePopAt(frame, alive, 1.8, 1.4);
  const a = frameOn([-0.5, 2.0, 0.4], 8.0, 0.45, 0.5, [0.2, 0.08, 1]);
  const b = frameOn([-0.5, 2.0, 0.4], 7.0, 0.45, 0.5, [0.15, 0.06, 1]);
  return (
    <>
      <MarketSet frame={frame} rain={0.4} />
      {sweeper(frame >= alive)}
      <Klotz frame={frame} who="ida" position={[-1.5, 0, 1.2]} rotation={[0, 0.9, 0]} eyes="wide" eyePop={pop} mouth="o" blinkSeed={3} jar={{ fill: 0.12 }} />
      <Shot frame={f} duration={duration - c2} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 12 home – „Ida runs home to Grandpa Anton. | He just smiles. | And turns his jar over.“ */
/* ------------------------------------------------------------------ */
export const ZwHome: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const run = beat("trackRunParallax");
  const over = beat("spotlightJarFlip");
  const cutAt = Math.max(45, run + 48); // auf „Anton“/„He just“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Tracking mit Parallax: Ida rennt links → rechts durch die Gasse, Laternen ziehen im Vordergrund vorbei
    const x = lerp(-4, 4, ramp(frame, 0, cutAt, Easing.linear));
    return (
      <>
        <Atmos bg={Z.fogDeep} fog={[8, 34]} sky="#7F97B8" ground="#121821" hemi={0.8} keyLight={{ pos: [-5, 9, 6], color: "#AFC4E6", intensity: 1.1 }} rim={{ pos: [4, 4, -8], color: "#8FB8FF", intensity: 2 }} />
        <WetGround glints={[[-6, 0, -2], [0, 0, -2], [6, 0, -2]]} />
        <HouseRow z={-5.5} from={-16} to={16} seed={121} />
        {[-6, 0, 6].map((lx) => (
          <Lamp key={lx} position={[lx, 0, -2]} />
        ))}
        {/* Vordergrund-Pfosten (schneller als die Figur = Parallax) */}
        {[-5, -1, 3, 7].map((px) => (
          <mesh key={px} position={[px + (x - (-4)) * 0.6 - 2, 2.5, 4]}>
            <boxGeometry args={[0.35, 6, 0.35]} />
            <meshStandardMaterial color="#10141B" roughness={0.6} />
          </mesh>
        ))}
        <Klotz frame={frame} who="ida" position={[x, 0, 0.5]} rotation={[0, Math.PI / 2, 0]} walk={2.2} lean={0.15} eyes="dot" mouth="o" blinkSeed={3} jar={{ fill: 0.12 }} />
        <Rain frame={frame} center={[x, 3.5, 0]} size={[12, 8, 6]} opacity={0.3} />
        <Shot frame={f} duration={cutAt} from={[x - 0.4, 2.3, 9.5]} look={[x + 0.6, 1.8, 0]} fov={40} shake={0.03} />
      </>
    );
  }
  // Stube → Spotlight: Anton lächelt im Sessel, Licht zieht sich auf seine Hände zusammen, er dreht das Glas um
  const spot = ramp(frame, over - 30, over - 6);
  const flip = ramp(frame, over - 12, over + 4, Easing.inOut(Easing.cubic));
  const center: V3 = [1.6, 0.6, -2.3];
  const handJar: V3 = [1.6, 2.15, -1.55];
  const a = frameOn([1.6, 2.5, -2.3], 6, 0.47, 0.5, [-0.1, 0.12, 1]);
  const b = frameOn([1.6, 2.2, -1.9], 2.6, 0.5, 0.5, [-0.05, 0.15, 1]);
  return (
    <>
      {spot < 0.98 ? <AntonRoom frame={frame} light="lamp" /> : null}
      {spot > 0.02 ? <SpotlightStage center={[center[0], 0, center[2]]} on={spot} radius={2.2} height={9} /> : null}
      <Klotz frame={frame} who="anton" position={center} sit eyes={frame > cutAt + 18 ? "happy" : "dot"} mouth="smile" blinkSeed={7} reach={[1.3, 1.3]} spread={[-0.15, -0.15]} />
      <TimeJar position={handJar} rotation={[0, 0, Math.PI * flip]} scale={1.3} fill={1} painted glow={1.2} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} ease="inOut" />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 13 painted – „Nothing falls. | The sand is painted on. | Yellow paint, inside the glass.“ (TWIST) */
/* ------------------------------------------------------------------ */
export const ZwPainted: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const painted = beat("paintFlakes");
  const glass = beat("idaEyePop");
  const cutAt = Math.max(50, glass - 30); // kurz vor „glass“: abgekratzter Streifen ≈ 0,9 s stehen lassen
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Makro: Glas steht kopf, nichts fällt. Antons Zeigefinger (Klotz-Finger mit Nagel) kratzt von oben nach unten einen
    // Streifen Farbe ab – Splitter fallen, durch den Streifen sieht man klares Glas und die Lampe dahinter.
    const scratch = ramp(frame, painted - 22, painted + 6);
    const nailY = lerp(0.34, -0.3, ramp(frame, painted - 24, painted + 6));
    const flakes = Array.from({ length: 22 }, (_, i) => {
      const t0 = painted - 22 + i * 1.3;
      const age = frame - t0;
      const x0 = ((i * 37) % 9) * 0.012 - 0.05;
      return { on: age >= 0, x: x0 + age * 0.002 * ((i % 3) - 1), y: lerp(0.34, -0.3, Math.min(1, (t0 - painted + 24) / 30)) - age * age * 0.0012, z: 0.27 + (i % 4) * 0.01, r: age * 0.3 + i };
    });
    const a = frameOn([0, 0.0, 0.1], 1.5, 0.5, 0.5, [0.12, 0.08, 1]);
    const b = frameOn([0, -0.02, 0.1], 1.05, 0.5, 0.5, [0.08, 0.06, 1]);
    return (
      <>
        <SpotlightStage center={[0, -1.5, 0]} on={1} radius={1.4} height={8} />
        {/* Lampe hinter dem Glas: im abgekratzten Streifen sichtbar */}
        <mesh position={[0.02, 0.05, -1.4]}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshBasicMaterial color="#FFF1D6" toneMapped={false} />
        </mesh>
        <Halo at={[0.02, 0.05, -1.35]} size={1.6} color="#FFE7C0" opacity={0.7} />
        <pointLight position={[0.6, 0.5, 1.2]} color="#FFE8C8" intensity={3} distance={4} decay={2} />
        <TimeJar position={[0, 0.3, 0]} rotation={[0, 0, Math.PI]} scale={1.7} fill={1} painted scratch={scratch * 0.75} glow={0.85} clip={false} />
        {/* Antons Zeigefinger: Klotz-Glied mit hellem Nagel, kommt von rechts oben */}
        <group position={[0.06, nailY, 0.3]} rotation={[0, 0, -0.35]}>
          <mesh position={[0.12, 0.3, 0.02]}>
            <boxGeometry args={[0.14, 0.62, 0.14]} />
            <meshPhysicalMaterial color="#E8BE98" roughness={0.5} clearcoat={0.5} />
          </mesh>
          <mesh position={[0.05, 0.0, 0.07]}>
            <boxGeometry args={[0.11, 0.06, 0.03]} />
            <meshStandardMaterial color="#FFF2EA" roughness={0.25} />
          </mesh>
          <mesh position={[0.24, 0.62, 0.0]}>
            <boxGeometry args={[0.32, 0.3, 0.3]} />
            <meshPhysicalMaterial color="#E8BE98" roughness={0.5} clearcoat={0.5} />
          </mesh>
        </group>
        {/* Farbsplitter fallen */}
        {flakes.map((fl, i) =>
          fl.on ? (
            <mesh key={i} position={[fl.x, fl.y, fl.z]} rotation={[fl.r, fl.r * 0.7, 0]}>
              <boxGeometry args={[0.03, 0.022, 0.004]} />
              <meshBasicMaterial color={Z.gold} toneMapped={false} />
            </mesh>
          ) : null,
        )}
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Match Cut auf die Reaktion: Ida Großaufnahme, Augen-Pop auf „glass“
  const pop = eyePopAt(frame, glass, 2.0, 1.55);
  const a = frameOn([0, 2.2, 0], 3.2, 0.47, 0.5, [0, 0.05, 1]);
  const b = frameOn([0, 2.2, 0], 2.7, 0.47, 0.5, [0, 0.05, 1]);
  return (
    <>
      <SpotlightStage center={[0, 0, 0]} on={0.8} radius={1.6} height={8} beam="#FFF4D8" />
      <pointLight position={[0, 2.3, 2]} color="#FFE8C8" intensity={6} distance={6} decay={2} />
      <Klotz frame={frame} who="ida" position={[0, 0, 0]} eyes="wide" eyePop={pop} mouth="o" blinkSeed={133} jar={{ fill: 0.12 }} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} punch={glass - cutAt} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 14 twenty – „His jar has been empty for twenty years. | And he's still here. | Still fixing clocks.“ */
/* ------------------------------------------------------------------ */
export const ZwTwenty: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const years = beat("orbitCalendars");
  const here = beat("antonSmile");
  const cutAt = Math.max(60, here + 14); // auf „Still fixing“
  const { shot, f } = cut(frame, [cutAt]);
  const crossed = ramp(frame, 8, years + 10);
  if (shot === 0) {
    // Orbit (≈ 80°) um Anton und Ida, die sich gegenüber sitzen; 20 Kalender an der Wand werden gestrichen
    return (
      <>
        <AntonRoom frame={frame} light="lamp" calendars={20} crossed={crossed} />
        <Klotz frame={frame} who="anton" position={[1.6, 0.6, -2.3]} sit rotation={[0, -0.4, 0]} eyes={frame >= here ? "happy" : "dot"} mouth="smile" blinkSeed={7} reach={[1.0, 1.0]} />
        <Klotz frame={frame} who="ida" position={[-0.8, 0, -1.2]} rotation={[0, 1.0, 0]} eyes="wide" mouth="o" blinkSeed={3} jar={{ fill: 0.12 }} />
        <TimeJar position={[-1.6, 1.37, -2.0]} scale={1.3} fill={0} glow={0} />
        <Shot frame={f} duration={cutAt} orbit={{ center: [0.5, 2.4, -2.4], radius: 9.5, fromDeg: -20, toDeg: 30, height: 0.6, heightTo: 1.0 }} from={[0, 0, 0]} look={[0.4, 2.8, -3.2]} fov={40} shake={0.01} />
      </>
    );
  }
  // Nah: Anton repariert lächelnd eine Taschenuhr
  const a = frameOn([1.6, 2.6, -2.0], 4.2, 0.47, 0.5, [0.15, 0.1, 1]);
  const b = frameOn([1.6, 2.5, -2.0], 3.6, 0.47, 0.5, [0.1, 0.08, 1]);
  return (
    <>
      <AntonRoom frame={frame} light="lamp" calendars={20} crossed={1} />
      <Klotz frame={frame} who="anton" position={[1.6, 0.6, -2.3]} sit eyes="happy" mouth="smile" nod={0.2} blinkSeed={7} reach={[1.3, 1.25]} />
      <PocketWatch frame={frame} position={[1.6, 2.0, -1.45]} rotation={[-0.6, 0, 0]} scale={0.32} open={1} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

export { Crowd };
