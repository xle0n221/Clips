/**
 * „In This City, You Pay With Time“ – Szenen 15–21 (truth … question): Auflösung, echte Welt, Cliffhanger.
 * Echte Bilder/Videos (NASA, gemeinfrei, docs/bildnachweise-zeit-welt.md): Stadtlichter aus der ISS (franklin),
 * ISS-Video „Städte bei Nacht“ als Spiegelung im Glas (question).
 */
import React from "react";
import { Easing } from "remotion";
import { AdditiveBlending, DoubleSide } from "three";
import { Shot, V3 } from "../kit/camera";
import { useScene } from "../types";
import { AntonRoom, WorkshopSet } from "./zeitwelt1";
import {
  Atmos,
  cut,
  Frame,
  fly,
  frameOn,
  Halo,
  HouseRow,
  Klotz,
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
  useImageTexture,
  WetGround,
  Z,
} from "./zeitweltSets";

/* ------------------------------------------------------------------ */
/* 15 truth – „The jar doesn't count your life. | It only counts what you sold.“ */
/* ------------------------------------------------------------------ */
export const ZwTruth: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const life = beat("lifeColumn");
  const sold = beat("soldColumnGold");
  // Infografik im Raum: Glas in der Mitte, links Säule LIFE (grauer Nebel, nicht messbar), rechts SOLD (Gold fließt hinein)
  const t = ramp(frame, life + 6, sold, Easing.inOut(Easing.cubic));
  const soldFill = ramp(frame, life + 10, sold + 12);
  const a = frameOn([-1.4, 2.6, 0], 7.2, 0.5, 0.5, [0.05, 0.05, 1]);
  const b = frameOn([1.4, 2.6, 0], 7.2, 0.5, 0.5, [-0.05, 0.05, 1]);
  const col = (x: number, label: string, gold: boolean, fill: number, on: number) => (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3.6, 32, 1, true]} />
        <meshPhysicalMaterial color="#DDEFFF" transparent opacity={0.22} roughness={0.05} side={DoubleSide} depthWrite={false} />
      </mesh>
      {gold ? (
        <mesh position={[0, 0.6 + (3.4 * fill) / 2, 0]}>
          <cylinderGeometry args={[0.74, 0.74, Math.max(0.01, 3.4 * fill), 32]} />
          <meshStandardMaterial color={Z.gold} emissive={Z.gold} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ) : (
        <Motes frame={frame} center={[0, 2.4, 0]} size={[1.3, 3.3, 1.3]} count={160} drift={[0.002, 0.004, 0.001]} color="#B8C4D4" dot={0.22} opacity={0.35 * on} seed={151} />
      )}
      {!gold ? <TextLabel text="?" width={1.0} height={1.0} color="#C8D2DE" position={[0, 2.4, 0.85]} opacity={on} /> : null}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 0.6, 32]} />
        <meshStandardMaterial color={Z.brass} metalness={0.8} roughness={0.3} />
      </mesh>
      <TextLabel text={label} width={2.2} height={0.6} color={gold ? Z.goldHot : "#D8E0EA"} position={[0, 4.75, 0]} opacity={on} />
    </group>
  );
  return (
    <>
      <Atmos bg="#0B0F17" fog={[8, 30]} sky="#5A6E8E" ground="#0B0F17" hemi={0.6} keyLight={{ pos: [0, 8, 6], color: "#E6EEFF", intensity: 1.0 }} rim={{ pos: [0, 4, -6], color: "#9CC4FF", intensity: 1.6 }} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#121822" roughness={0.25} metalness={0.3} />
      </mesh>
      {col(-1.6, "LIFE", false, 0, 1 - 0.5 * t)}
      {col(1.6, "SOLD", true, soldFill, 0.5 + 0.5 * t)}
      <SandStream frame={frame} from={[1.6, 5.6, 0]} to={[1.6, 0.8 + 3.4 * soldFill, 0]} width={0.05} on={frame > life + 8 ? 1 : 0} />
      <Shot frame={frame} duration={duration} {...fly(lerpCam(a, b, t), lerpCam(a, b, t))} />
    </>
  );
};
const lerpCam = (a: { pos: V3; look: V3; fov: number }, b: { pos: V3; look: V3; fov: number }, t: number) => ({
  pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)] as V3,
  look: [lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t)] as V3,
  fov: a.fov,
});

/* ------------------------------------------------------------------ */
/* 16 fear – „Grandpa whispers: | the fear of an empty jar… | keeps the whole city working.“ */
/* ------------------------------------------------------------------ */
export const ZwFear: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const out = beat("pullOutWindow");
  const cutAt = Math.max(50, out - 8);
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Nah: Anton flüstert (Mund bewegt sich), Ida hört zu – Nachtfenster dahinter
    const talk = frame < cutAt - 4 ? 0.25 + 0.35 * Math.abs(Math.sin(frame * 0.55)) : 0;
    const a = frameOn([0.4, 2.5, -2.0], 5.4, 0.47, 0.5, [0.2, 0.06, 1]);
    const b = frameOn([0.6, 2.5, -2.1], 4.4, 0.47, 0.5, [0.15, 0.05, 1]);
    return (
      <>
        <AntonRoom frame={frame} light="night" />
        <Klotz frame={frame} who="anton" position={[1.6, 0.6, -2.3]} sit rotation={[0, -0.5, 0]} eyes="dot" mouth="flat" talk={talk} brow={-0.2} blinkSeed={7} reach={[1.0, 1.0]} />
        <Klotz frame={frame} who="ida" position={[-0.6, 0, -1.4]} rotation={[0, 1.0, 0]} eyes="dot" mouth="flat" blinkSeed={3} jar={{ fill: 0.12 }} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Zoom-out über die nächtliche Stadt: in jedem Fenster ein goldenes Glimmen, Glass Office als dunkler Klotz
  const t = ramp(frame, cutAt, duration, Easing.inOut(Easing.cubic));
  const pos: V3 = [lerp(0, 2, t), lerp(3, 16, t), lerp(6, 26, t)];
  const look: V3 = [0, lerp(3, 1, t), lerp(-4, -10, t)];
  return (
    <>
      <Atmos bg="#070B12" fog={[14, 70]} sky="#2A3A58" ground="#05070B" hemi={0.4} rim={{ pos: [0, 10, -30], color: "#6A8AC0", intensity: 1.2 }} />
      <WetGround />
      {[-4, -12, -20, -28].map((z, i) => (
        <HouseRow key={z} z={z} from={-26} to={26} seed={160 + i} lit={0.75} goldWin scale={1 + i * 0.15} />
      ))}
      {/* Glass Office: hoher dunkler Klotz mit frostigem Licht */}
      <mesh position={[9, 9, -24]}>
        <boxGeometry args={[7, 18, 6]} />
        <meshStandardMaterial color="#141A22" roughness={0.6} />
      </mesh>
      <mesh position={[9, 15, -20.95]}>
        <planeGeometry args={[5, 1.2]} />
        <meshBasicMaterial color="#CFE6F5" toneMapped={false} />
      </mesh>
      {/* Fabrikschlote */}
      {[-14, -10].map((x) => (
        <mesh key={x} position={[x, 7, -30]}>
          <cylinderGeometry args={[0.9, 1.2, 14, 16]} />
          <meshStandardMaterial color="#1C2129" roughness={0.8} />
        </mesh>
      ))}
      <Motes frame={frame} center={[0, 6, -14]} size={[50, 12, 30]} count={160} drift={[0.003, 0.002, 0]} color={Z.gold} dot={0.18} opacity={0.35} seed={161} />
      <Shot frame={f} duration={duration - cutAt} from={pos} look={look} fov={40} shake={0.01} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 17 franklin – „Sounds made up? | In our world, in 1748, Benjamin Franklin published this advice:“ */
/* ------------------------------------------------------------------ */

/** Schreibtisch in „unserer Welt“: echtes NASA-Foto (Stadtlichter aus der ISS) im Rahmen + eigene Papierkarte. */
const RealDesk: React.FC<{ readonly frame: number; readonly kb: number; readonly card?: number; readonly quote?: number; readonly dissolve?: number }> = ({
  frame,
  kb,
  card = 0,
  quote = 0,
  dissolve = 0,
}) => {
  const photo = useImageTexture("episodes/zeit-welt/real/city-lights-iss.jpg");
  return (
    <>
      <Atmos bg="#0E0C0B" fog={[8, 30]} sky="#FFE2C0" ground="#1A120C" hemi={0.55} keyLight={{ pos: [3, 7, 5], color: "#FFE6C4", intensity: 1.3 }} rim={{ pos: [-4, 4, -6], color: "#9CC4FF", intensity: 1.2 }} />
      <mesh position={[0, 3, -1.2]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#2E2A28" roughness={0.9} />
      </mesh>
      <Frame position={[0, 3.3, -1.1]} w={2.3} h={3.0} map={photo} kb={kb} />
      <TextLabel text="OUR WORLD · NASA PHOTO FROM SPACE" width={2.3} height={0.14} color="#C8BCA8" position={[0, 1.62, -1.08]} />
      <Plank size={[8, 0.25, 3]} position={[0, 1.0, 0.4]} color="#6E4A30" />
      {card > 0 ? (
        <group position={[0.9, 1.15, 0.6]} rotation={[-Math.PI / 2 + 0.25 * (1 - card), 0, -0.12]} scale={card}>
          <mesh>
            <planeGeometry args={[2.0, 1.3]} />
            <meshStandardMaterial color={Z.paper} roughness={0.9} />
          </mesh>
          <TextLabel text="ADVICE TO A" width={1.7} height={0.24} color="#2A2018" position={[0, 0.35, 0.01]} />
          <TextLabel text="YOUNG TRADESMAN" width={1.8} height={0.24} color="#2A2018" position={[0, 0.07, 0.01]} />
          <TextLabel text="B. FRANKLIN · 1748" width={1.5} height={0.18} color="#6A4A30" position={[0, -0.32, 0.01]} />
        </group>
      ) : null}
      {quote > 0 ? (
        <group position={[0, 3.3, -0.6]} scale={0.55 * (0.85 + 0.15 * quote)}>
          <mesh>
            <planeGeometry args={[4.4, 1.9]} />
            <meshBasicMaterial color="#0B0D12" transparent opacity={0.72 * quote} />
          </mesh>
          <TextLabel text="“REMEMBER THAT" width={4.0} height={0.5} color={Z.goldHot} position={[0, 0.5, 0.02]} opacity={quote} />
          <TextLabel text="TIME IS" width={2.4} height={0.5} color={Z.goldHot} position={[0, -0.05, 0.02]} opacity={quote} />
          <TextLabel text="MONEY.”" width={2.4} height={0.5} color={Z.goldHot} position={[0, -0.6, 0.02]} opacity={quote * (1 - dissolve)} />
        </group>
      ) : null}
      {dissolve > 0 ? (
        <Motes frame={frame} center={[0, 2.3 - dissolve * 0.6, -0.5]} size={[1.6, 0.8 + dissolve * 1.6, 0.3]} count={160} drift={[0, -0.02, 0]} color={Z.goldHot} dot={0.06} opacity={0.95} seed={171} />
      ) : null}
      <Motes frame={frame} center={[0, 3, 0]} size={[6, 4, 3]} count={60} drift={[0.0015, 0.001, 0]} color="#FFE6C0" dot={0.04} opacity={0.5} seed={172} />
    </>
  );
};

export const ZwFranklin: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const our = beat("wipeToRealWorld");
  const advice = beat("franklinPortraitAndCard");
  const cutAt = Math.max(40, our + 19); // auf „in 1748“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Nach dem Sanduhr-Wipe: echtes Foto unserer Welt (Stadtlichter), Push-in
    const a = frameOn([0, 3.2, -1.1], 5.0, 0.48, 0.5, [0, 0, 1]);
    const b = frameOn([0, 3.3, -1.1], 3.9, 0.48, 0.5, [0, 0, 1]);
    return (
      <>
        <RealDesk frame={frame} kb={ramp(frame, 0, cutAt)} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Schreibtisch: daneben fällt eine eigene Papierkarte „ADVICE TO A YOUNG TRADESMAN · 1748“ (kein Faksimile)
  const card = ramp(frame, advice - 40, advice - 20, Easing.out(Easing.back(1.4)));
  const a = frameOn([0.4, 2.5, -0.3], 6.0, 0.48, 0.5, [0, 0.3, 1]);
  const b = frameOn([0.5, 2.2, -0.1], 5.0, 0.5, 0.5, [0, 0.38, 1]);
  return (
    <>
      <RealDesk frame={frame} kb={1} card={card} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 18 literal – „…that time is money.“ | In Minuteburg, it's literal.“ */
/* ------------------------------------------------------------------ */
export const ZwLiteral: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const money = beat("quoteCard");
  const literal = beat("wordToSand");
  const cutAt = Math.max(50, literal - 22); // auf „In Minuteburg“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    const q = ramp(frame, 0, 10);
    const dis = ramp(frame, money + 6, cutAt);
    const a = frameOn([0, 3.1, -0.6], 4.8, 0.45, 0.5, [0, 0, 1]);
    const b = frameOn([0, 3.0, -0.6], 4.2, 0.45, 0.5, [0, 0, 1]);
    return (
      <>
        <RealDesk frame={frame} kb={1} card={1} quote={q} dissolve={dis} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Zurück in Minuteburg: der Goldsand von „money“ rieselt von oben in Idas Glas
  const hip: V3 = [0.42 * 0.9, (0.62 + 0.25) * 0.9, 0.42 * 0.9];
  const a = frameOn([0.2, 1.7, 0], 4.6, 0.5, 0.5, [0.2, 0.1, 1]);
  const b = frameOn([0.3, 1.2, 0.2], 3.0, 0.52, 0.5, [0.15, 0.1, 1]);
  return (
    <>
      <Atmos bg={Z.fogDeep} fog={[5, 24]} sky="#7F97B8" ground="#121821" hemi={0.8} keyLight={{ pos: [-4, 8, 6], color: "#AFC4E6", intensity: 1.1 }} rim={{ pos: [3, 4, -6], color: "#8FB8FF", intensity: 2 }} />
      <WetGround />
      <HouseRow z={-7} from={-10} to={10} seed={181} />
      <Klotz frame={frame} who="ida" position={[0, 0, 0]} rotation={[0, -0.2, 0]} eyes="dot" mouth="o" nod={0.3} blinkSeed={3} reach={[0.3, 0.6]} jar={{ fill: 0.12 + 0.25 * ramp(frame, cutAt, duration) }} />
      <SandStream frame={frame} from={[hip[0] + 0.05, 5, hip[2] + 0.1]} to={[hip[0] + 0.05, hip[1] + 0.35, hip[2] + 0.1]} width={0.03} on={1} />
      <Rain frame={frame} center={[0, 3, 0]} size={[8, 6, 5]} opacity={0.22} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 19 unpaid – „Ida puts her jar away. | She spends the whole day with Grandpa. | Unpaid.“ */
/* ------------------------------------------------------------------ */
export const ZwUnpaid: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const away = beat("jarOnShelf");
  const cutAt = Math.max(40, away + 18); // auf „She spends“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Ida stellt ihr Glas ins Regal (Gold verschwindet aus ihrer Hand)
    const put = ramp(frame, 4, away);
    const jar: V3 = [lerp(0.9, 1.6, put), lerp(1.9, 3.42, put), lerp(-1.0, -5.3, put)];
    const a = frameOn([0.8, 3.0, -3.0], 6.0, 0.48, 0.5, [0.25, 0.05, 1]);
    const b = frameOn([1.2, 3.1, -3.6], 4.8, 0.48, 0.5, [0.2, 0.05, 1]);
    return (
      <>
        <WorkshopSet frame={frame} />
        <Klotz frame={frame} who="ida" position={[0.6, 0, -2.0 - put * 2.2]} rotation={[0, Math.PI - 0.3, 0]} reach={[0.3, 1.2 + put * 1.2]} blinkSeed={3} jar={null} />
        <TimeJar position={jar} scale={1.3} fill={0.37} glow={1 - 0.6 * put} />
        <Shot frame={f} duration={cutAt} {...fly(a, b)} />
      </>
    );
  }
  // Wärmstes Bild ohne Gold: beide reparieren zusammen eine Spieluhr, lachen, Tee
  const a = frameOn([0.4, 2.3, -1.6], 6.6, 0.5, 0.5, [0.15, 0.15, 1]);
  const b = frameOn([0.4, 2.2, -1.6], 5.6, 0.5, 0.5, [0.1, 0.13, 1]);
  const laugh = Math.floor(frame / 9) % 3 === 0;
  return (
    <>
      <WorkshopSet frame={frame} warm={1.3} />
      <Klotz frame={frame} who="ida" position={[-0.7, 0.3, -0.7]} rotation={[0, 0.5, 0]} sit reach={[1.2, 1.3]} eyes={laugh ? "happy" : "dot"} mouth={laugh ? "grin" : "smile"} blinkSeed={3} jar={null} />
      <Klotz frame={frame} who="anton" position={[1.5, 0.3, -0.8]} rotation={[0, -0.5, 0]} sit reach={[1.3, 1.1]} eyes="happy" mouth="grin" blinkSeed={7} />
      {/* Spieluhr (Holzkästchen, Walze dreht) */}
      <group position={[0.4, 1.55, -1.8]}>
        <mesh>
          <boxGeometry args={[0.9, 0.36, 0.6]} />
          <meshStandardMaterial color="#7A3E2A" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.28, -0.3]} rotation={[-1.1, 0, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.6]} />
          <meshStandardMaterial color="#8A4A32" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0.05]} rotation={[frame * 0.2, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
          <meshStandardMaterial color="#C8CCD2" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* Teetassen mit Dampf */}
      {[-0.6, 1.4].map((x, i) => (
        <group key={x} position={[x, 1.55, -1.5]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.13, 0.11, 0.24, 16]} />
            <meshStandardMaterial color="#E8E2D6" roughness={0.4} />
          </mesh>
          <Motes frame={frame + i * 20} center={[0, 0.6, 0]} size={[0.25, 0.7, 0.25]} count={12} drift={[0, 0.006, 0]} color="#FFFFFF" dot={0.12} opacity={0.18} seed={190 + i} />
        </group>
      ))}
      <PocketWatch frame={frame} position={[1.0, 1.52, -2.4]} rotation={[-1.3, 0, 0]} scale={0.3} open={1} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 20 knock – „Next morning, a knock at the door. | The Glass Office. | Someone reported Grandpa.“ */
/* ------------------------------------------------------------------ */
export const ZwKnock: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const door = beat("knocker");
  const office = beat("glassOfficeLowAngle");
  const cutAt = Math.max(40, office - 12); // auf „The Glass“
  const { shot, f } = cut(frame, [cutAt]);
  if (shot === 0) {
    // Detail: Türklopfer, drei Schläge (letzter auf „door“)
    const knocks = [door - 30, door - 15, door];
    const lift = knocks.reduce((m, k) => {
      const d = frame - k;
      return d > -6 && d < 0 ? Math.max(m, (d + 6) / 6) : d >= 0 && d < 4 ? Math.max(m, 1 - d / 4) : m;
    }, 0);
    const a = frameOn([0, 1.75, 0.1], 2.2, 0.5, 0.5, [0.2, 0.05, 1]);
    const b = frameOn([0, 1.75, 0.1], 1.8, 0.5, 0.5, [0.15, 0.05, 1]);
    return (
      <>
        <Atmos bg="#0E1520" fog={[3, 14]} sky="#8FA6C6" ground="#121821" hemi={0.9} keyLight={{ pos: [-3, 5, 4], color: "#BFD2EE", intensity: 1.4 }} rim={{ pos: [3, 3, -3], color: "#9CC4FF", intensity: 1.8 }} />
        <mesh position={[0, 1.7, -0.05]}>
          <boxGeometry args={[3, 4, 0.1]} />
          <meshStandardMaterial color="#6E4A30" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.95, 0.05]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
          <meshStandardMaterial color="#9AA3AE" metalness={0.85} roughness={0.25} />
        </mesh>
        <group position={[0, 1.95, 0.08]} rotation={[-lift * 0.9, 0, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <torusGeometry args={[0.2, 0.04, 10, 24]} />
            <meshStandardMaterial color="#B8C0CA" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
        <Shot frame={f} duration={cutAt} {...fly(a, b)} shake={0.004} />
      </>
    );
  }
  // Untersicht durch den Türspalt: zwei hohe Gestalten mit Milchglas-Visier, eine hält ein Bild von Antons Glas
  const open = ramp(frame, cutAt, cutAt + 18);
  const a = frameOn([0, 3.6, -2.6], 8.4, 0.45, 0.5, [0.05, -0.32, 1]);
  const b = frameOn([0, 3.6, -2.6], 7.2, 0.45, 0.5, [0.03, -0.36, 1]);
  return (
    <>
      <Atmos bg="#0C1018" fog={[6, 26]} sky="#9DB2D2" ground="#0E131A" hemi={0.6} rim={{ pos: [0, 5, -8], color: "#DDEEFF", intensity: 3 }} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3A2E26" roughness={0.6} />
      </mesh>
      {/* Türrahmen im Vordergrund, Tür schwingt auf */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 2.6, 0.4]}>
          <boxGeometry args={[0.5, 5.4, 0.5]} />
          <meshStandardMaterial color="#2A1E16" roughness={0.6} />
        </mesh>
      ))}
      <group position={[1.35, 0, 0.4]} rotation={[0, open * 1.3, 0]}>
        <mesh position={[-1.35, 2.2, 0]}>
          <boxGeometry args={[2.7, 4.4, 0.12]} />
          <meshStandardMaterial color="#6E4A30" roughness={0.6} />
        </mesh>
      </group>
      {/* draußen: kaltes Morgenlicht, Nebel */}
      <mesh position={[0, 4, -6]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial color="#9FB8D6" toneMapped={false} />
      </mesh>
      <LightShaft from={[0, 5, -5]} to={[0, 0.1, 1.5]} radius={2.4} top={1.2} color="#DDEEFF" opacity={0.14} />
      <Klotz frame={frame} who="office" position={[-0.75, 0, -2.4]} rotation={[0, 0.1, 0]} reach={[0.15, 0.15]} blinkSeed={201} />
      <Klotz
        frame={frame}
        who="office"
        position={[0.85, 0, -2.8]}
        rotation={[0, -0.15, 0]}
        reach={[0.15, 1.3]}
        blinkSeed={202}
        holdR={
          <group position={[0, 0, 0.35]} rotation={[0, 0, 0]}>
            <mesh>
              <planeGeometry args={[0.7, 0.9]} />
              <meshStandardMaterial color="#EDE6D6" roughness={0.9} side={DoubleSide} />
            </mesh>
            <TimeJar position={[0, -0.25, 0.02]} scale={1.2} fill={0.8} painted glow={0.5} clip={false} />
          </group>
        }
      />
      <Motes frame={frame} center={[0, 2.5, -2]} size={[6, 5, 4]} count={90} drift={[0.002, 0.002, 0]} color="#E4EEFF" dot={0.06} opacity={0.5} seed={203} />
      <Shot frame={f} duration={duration - cutAt} {...fly(a, b)} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 21 question – „And you? | How many hours did you sell today?“ */
/* ------------------------------------------------------------------ */
/**
 * Echtes ISS-Video im Glas: Einzelbilder (ffmpeg aus aurora-city-lights-iss.mp4, Ausschnitt Stadtlichter)
 * per Suspense-Textur je Frame – `useOffthreadVideoTexture` lieferte im Standbild-Render keine Textur (geprüft 13.11.2026).
 */
const VIDEO_FRAMES = 90;
const RealVideoInJar: React.FC<{ readonly frame: number; readonly position: V3; readonly scale: number; readonly opacity: number }> = ({ frame, position, scale, opacity }) => {
  const i = (Math.max(0, frame) % VIDEO_FRAMES) + 1;
  const n = `${i < 10 ? "00" : i < 100 ? "0" : ""}${i}`;
  const tex = useImageTexture(`episodes/zeit-welt/real/aurora-frames/f${n}.jpg`);
  // drei additive Lagen = dreifache Helligkeit der (sehr dunklen) Nachtaufnahme
  return (
    <>
      {[1.0, 1.006, 1.012].map((k) => (
        <mesh key={k} position={position} scale={scale * k}>
          <cylinderGeometry args={[0.145, 0.145, 0.33, 32, 1, true, -Math.PI / 2, Math.PI]} />
          <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={false} side={DoubleSide} color="#E6F0FF" blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};

export const ZwQuestion: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const sell = beat("realCommutersInJar");
  // Langsamer Push-in auf Idas Glas im Regal; im Glas spiegeln sich echte Städte bei Nacht (ISS-Video)
  const jar: V3 = [1.6, 3.42, -5.3];
  const s = 2.0;
  const vid = ramp(frame, 6, sell);
  const a = frameOn([jar[0], jar[1] + 0.36, jar[2]], 2.2, 0.47, 0.5, [0.1, 0.05, 1]);
  const b = frameOn([jar[0], jar[1] + 0.36, jar[2]], 1.25, 0.47, 0.5, [0, 0.02, 1]);
  return (
    <>
      <WorkshopSet frame={frame} warm={0.6} />
      <TimeJar position={jar} scale={s} fill={0.22} glow={0.25} />
      {/* dunkle Rückwand im Glas: davor leuchten die echten Stadtlichter (additiv) */}
      <mesh position={[jar[0], jar[1] + 0.18 * s, jar[2] - 0.01]} scale={s * 0.97}>
        <cylinderGeometry args={[0.145, 0.145, 0.33, 32, 1, true, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#05070C" side={DoubleSide} transparent opacity={0.85 * vid} />
      </mesh>
      <RealVideoInJar frame={frame} position={[jar[0], jar[1] + 0.18 * s, jar[2] + 0.004]} scale={s * 1.03} opacity={0.2 + 0.8 * vid} />
      <Halo at={[jar[0], jar[1] + 0.25, jar[2] + 0.3]} size={0.8} color="#9CC4FF" opacity={0.3 * vid} />
      <Shot frame={frame} duration={duration} {...fly(a, b)} ease="out" />
    </>
  );
};
