/**
 * Rom-Video, Szenen 6–9: goths (410), perished (Hahn-Legende), vandals (455), kid (475).
 * Stimmung decline (395–455) → fall (475).
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { Burst } from "../kit/fx";
import {
  CityGate,
  Cloud,
  DangerLight,
  GiftBow,
  Goth,
  Hero,
  Pavement,
  RespawnBar,
  RomanSkyline,
  ROME,
  RomeAtmosphere,
  Rooster,
  Rubble,
  Servant,
  SignBoard,
  Temple,
  THRONE_SIT_Y,
  WoodenHorse,
  Hills,
} from "../kit/rome";
import { useScene } from "../types";
import { aim, Block, cut, jmove, jolt, move, PalaceSet, pop, ramp, under } from "./romeSets";
import { lerp } from "./util";

/* 6 — goths: 410, Plünderung, 300 „Geschenke“ öffnen das Tor, Trojanisches Pferd */
export const Goths: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const loot = beat("loot");
  const gift = beat("fakeGift");
  const gate = beat("gateOpens");
  const trojan = beat("trojanGag");
  const { shot, f } = cut(frame, [gift, trojan]);

  if (shot === 0) {
    // Außen: Gotenheer stürmt durchs offene Tor (rechts, Label „GOTHS“ x 0.7)
    const j = jolt(frame, loot, 0.35, 16);
    const army = Array.from({ length: 7 }, (_, i) => {
      const row = i % 2;
      const x = lerp(3.4 + i * 0.9, 0.2 + i * 0.75, ramp(frame, 0, duration, Easing.linear));
      return (
        <Goth
          key={i}
          frame={frame + i * 5}
          position={[x, 0, 1.6 + row * 1.4]}
          rotation={[0, -1.2, 0]}
          fur={false}
          walk={1.4}
          arms={[0.4, 1.4 + Math.sin(frame * 0.3 + i) * 0.3]}
          eyes="angry"
          mouth="teeth"
        />
      );
    });
    return (
      <>
        <RomeAtmosphere phase="decline" frame={frame} />
        <Pavement size={120} />
        <CityGate position={[0, 0, -1.5]} open={1} wall={10} />
        <RomanSkyline position={[0, 0, -16]} width={50} rows={2} seed={9} />
        {army}
        <Rubble position={[-3.2, 0, 0.5]} count={6} spread={1.4} seed={4} />
        <Burst frame={frame} start={loot} origin={[-3.4, 3.2, -1]} count={22} speed={0.18} gravity={0.008} size={0.32} colors={[ROME.sandstone, ROME.sandLight, ROME.ochre]} seed={6} shape="rock" />
        <Shot frame={f} duration={gift} {...jmove(move(aim([3.2, 3.05, 2.2], 14, under(0.5, 14), 0.7, [0.1, 0.12, 1]), aim([2.8, 3.05, 2.2], 13, under(0.5, 13), 0.7, [0.05, 0.1, 1])), j)} punch={loot} />
      </>
    );
  }
  if (shot === 1) {
    // Innen: drei junge „Geschenk“-Goten (Schleife, ohne Fell/Waffen) gehen zum Tor und öffnen es
    const open = ramp(frame, gate, gate + 12, Easing.out(Easing.back(1.4)));
    const men = [0, 1, 2].map((i) => {
      const t = ramp(frame, gift + i * 6, gate - 4, Easing.out(Easing.quad));
      const x = lerp(5.5 + i * 1.3, 0.3 + i * 1.15, t);
      const z = 1.0 - i * 0.2;
      const walking = t > 0 && t < 1;
      return (
        <group key={i}>
          <Goth
            frame={frame + i * 9}
            position={[x, 0, z]}
            rotation={[0, walking ? -1.3 : Math.PI + 0.25, 0]}
            walk={walking ? 1.3 : 0}
            fur={false}
            gear={false}
            arms={frame >= gate ? [2.3, 2.3] : [0.4, 0.4]}
            eyes={frame >= gate ? "happy" : "dot"}
            mouth={frame >= gate ? "grin" : "smile"}
          />
          <GiftBow position={[x, 4.25, z]} scale={1.1} />
        </group>
      );
    });
    return (
      <>
        <RomeAtmosphere phase="decline" frame={frame} />
        <Pavement size={120} />
        {/* Tor von innen (Rückseite zeigt zur Kamera) */}
        <CityGate position={[0.8, 0, -2.5]} rotation={[0, Math.PI, 0]} open={open} wall={10} />
        {/* draußen wartet das Heer */}
        {[-0.4, 0.8, 2.0].map((x, i) => (
          <Goth key={x} frame={frame + i * 4} position={[x, 0, -6]} fur={false} arms={[0.4, 1.8]} eyes="angry" mouth="teeth" />
        ))}
        {men}
        <Shot frame={f} duration={trojan - gift} {...move(aim([1.5, 3.05, 0.8], 13, under(0.5, 13), 0.66, [0.08, 0.1, 1]), aim([1.5, 3.05, 0.8], 12, under(0.5, 12), 0.66))} />
      </>
    );
  }
  // Gag: Holzpferd ploppt weg, an seiner Stelle drei junge Männer
  const swap = trojan + 18;
  const squash = ramp(frame, swap - 4, swap + 4);
  return (
    <>
      <RomeAtmosphere phase="decline" frame={frame} />
      <Pavement size={120} />
      <CityGate position={[0, 0, -5]} open={1} wall={10} />
      {frame < swap + 4 ? (
        <group scale={[1 + squash * 0.4, Math.max(0.001, 1 - squash), 1 + squash * 0.4]}>
          <WoodenHorse position={[0.6, 0, 0]} scale={0.85} frame={frame} />
        </group>
      ) : null}
      {[0, 1, 2].map((i) => {
        const s = Math.max(0.001, pop(frame, swap + i * 4, 9));
        const x = 0.2 + i * 1.25;
        return (
          <group key={i} position={[x, 0, 0.4 - i * 0.2]} scale={s}>
            <Goth frame={frame + i * 7} fur={false} gear={false} arms={[2.4, 2.4]} eyes="happy" mouth="grin" bounce={0.1} />
            <GiftBow position={[0, 4.25, 0]} scale={1.1} />
          </group>
        );
      })}
      <Burst frame={frame} start={swap} origin={[1.0, 2.5, 0]} count={24} speed={0.15} gravity={0.004} size={0.2} colors={[ROME.wood, "#7A4E28", "#FF5C8A"]} seed={14} />
      <Shot frame={f} duration={duration - trojan} {...move(aim([1.45, 3.05, 0.2], 13, under(0.5, 13), 0.66), aim([1.45, 3.05, 0.2], 12, under(0.5, 12), 0.66))} />
    </>
  );
};

/* 7 — perished: „Rome has perished!“ – der Hahn oder die Stadt? */
export const Perished: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const servant = beat("servantIn");
  const perished = 71;
  const horror = beat("horror");
  const eats = beat("roosterEats");
  const point = beat("pointMap");
  const phew = beat("phew");
  const { shot, f } = cut(frame, [horror, point]);
  const SEAT: V3 = [0, THRONE_SIT_Y, -0.7];

  if (shot === 0) {
    const t = ramp(frame, servant, servant + 24, Easing.out(Easing.quad));
    const shout = frame >= perished;
    return (
      <>
        <PalaceSet frame={frame} phase="decline" />
        <Hero frame={frame} position={SEAT} sit={1} arms={[0.5, 1.4]} eyes={shout ? "wide" : "happy"} mouth={shout ? "o" : "smile"} look={shout ? 0.4 : 0.3} />
        <group position={[1.85, 0, 0.3]} rotation={[0, -0.55, 0]}>
          <Rooster frame={frame} tag="ROME" peck={Math.max(0, Math.sin(frame * 0.2)) * 0.3} />
        </group>
        <Servant
          frame={frame}
          position={[lerp(6.5, 3.4, t), 0, lerp(2.4, 1.6, t)]}
          rotation={[0, t < 1 ? -1.4 : -0.6, 0]}
          walk={t > 0 && t < 1 ? 1.8 : 0}
          arms={shout ? [2.7, 2.7] : [0.5, 0.5]}
          eyes={shout ? "wide" : "dot"}
          mouth={shout ? "teeth" : "o"}
          sweat
          bounce={shout ? 0.15 : 0}
        />
        <Shot frame={f} duration={horror} {...move(aim([1.5, 3.1, 0], 13.5, 0.5), aim([1.6, 3.1, 0], 12.5, 0.5))} punch={perished} />
      </>
    );
  }
  if (shot === 1) {
    // Nah: Entsetzen, dann pickt der Hahn aus der Hand
    const eating = frame >= eats;
    const peck = eating ? Math.abs(Math.sin((frame - eats) * 0.45)) : 0;
    return (
      <>
        <PalaceSet frame={frame} phase="decline" />
        <Hero
          frame={frame}
          position={SEAT}
          sit={1}
          arms={eating ? [0.5, 1.25] : [0.9, 1.9]}
          eyes={eating ? "wide" : "wide"}
          mouth={eating ? "o" : "teeth"}
          brow={-0.4}
          sweat={!eating}
          look={0.45}
          bounce={eating ? 0 : 0.05}
        />
        <group position={[1.75, 0, 0.35]} rotation={[0, -0.75, 0]}>
          <Rooster frame={frame} tag="ROME" peck={eating ? 0.35 + peck * 0.5 : 0} flap={eating ? 0 : 0.5} />
        </group>
        {eating
          ? [0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[1.2 + (i % 2) * 0.08, 2.45 + i * 0.04, 0.95 + i * 0.05]}>
                <sphereGeometry args={[0.05, 8, 6]} />
                <meshToonMaterial color="#E6C27A" />
              </mesh>
            ))
          : null}
        <Shot frame={f} duration={point - horror} {...move(aim([0.9, 3.2, -0.2], 9, 0.5), aim([0.9, 3.2, -0.2], 8.3, 0.5))} shake={0.05} />
      </>
    );
  }
  // Diener zeigt auf die Stadt (Schild), YOU atmet erleichtert aus
  const relief = frame >= phew;
  const puff = relief ? ramp(frame, phew, phew + 14) : 0;
  return (
    <>
      <PalaceSet frame={frame} phase="decline" />
      <Hero frame={frame} position={SEAT} sit={1} arms={[0.5, 0.6]} eyes={relief ? "happy" : "wide"} mouth={relief ? "smile" : "o"} brow={relief ? -0.15 : -0.3} look={0.3} />
      <group position={[1.75, 0, 0.35]} rotation={[0, -0.75, 0]}>
        <Rooster frame={frame} tag="ROME" peck={0.2} />
      </group>
      {relief ? (
        <mesh position={[0.4, 3.5 - puff * 0.2, 0.9 + puff * 0.8]} scale={0.25 + puff * 0.35}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.7 * (1 - puff)} depthWrite={false} />
        </mesh>
      ) : null}
      <Servant frame={frame} position={[-2.6, 0, 1.4]} rotation={[0, 0.7, 0]} arms={[2.1, 0.4]} eyes="dot" mouth="smile" />
      <SignBoard lines={["THE CITY", "OF ROME"]} post={false} position={[-2.3, 5.0, 1.4]} rotation={[0, 0.3, 0]} width={2.0} height={1.0} />
      <Shot frame={f} duration={duration - point} {...move(aim([-0.8, 3.2, 0.2], 13.5, 0.5, 0.5, [-0.1, 0.1, 1]), aim([-0.8, 3.2, 0.2], 12.8, 0.5))} punch={phew - point} />
    </>
  );
};

/* 8 — vandals: Warten auf den Respawn, 455, vergoldetes Tempeldach wird geplündert */
const Vandal: React.FC<{
  readonly frame: number;
  readonly position: V3;
  readonly rotation?: V3;
  readonly walk?: number;
  readonly plate?: boolean;
  readonly cheer?: boolean;
}> = ({ frame, position, rotation, walk = 0, plate = true, cheer = false }) => (
  <group>
    <Goth
      frame={frame}
      position={position}
      rotation={rotation}
      walk={walk}
      fur={false}
      cloak="#5B4636"
      gear={false}
      arms={plate ? [2.75, 2.75] : [0.4, 0.4]}
      eyes={cheer ? "happy" : "angry"}
      mouth={cheer ? "teeth" : "grin"}
      bounce={cheer ? 0.12 : 0}
    />
    {plate ? (
      <Block size={[1.5, 0.12, 0.9]} position={[position[0], position[1] + 4.35 + (cheer ? Math.abs(Math.sin(frame * 0.3)) * 0.12 : 0), position[2]]} rotation={[0, rotation?.[1] ?? 0, 0.05]} color={ROME.gold} ink={0.05} />
    ) : null}
  </group>
);

export const Vandals: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const queue = Math.max(0, beat("respawnQueue"));
  const wide = beat("templeWide");
  const vandals = beat("vandals");
  const roof = beat("roofOff");
  const { shot, f } = cut(frame, [vandals, roof]);
  const progress = ramp(frame, queue, duration, Easing.linear) * 0.8 + 0.05;
  const templeAt: V3 = [-1.2, 0, -7];
  const aimV = (t: number) =>
    aim([lerp(0.4, 0.4, t), lerp(18.4, 4.0, t), lerp(-1.8, -4, t)], lerp(9, 15, t), 0.55, 0.5, [0, lerp(0.1, 0.25, t), 1]);

  if (shot === 0) {
    // YOU wartet auf einer Wolke („RESPAWNING…“), Kamera neigt sich zum Tempel hinab
    const tilt = ramp(frame, wide - 8, vandals, Easing.inOut(Easing.cubic));
    return (
      <>
        <RomeAtmosphere phase="decline" frame={frame} />
        <Pavement size={140} />
        <Temple position={templeAt} roofColor={ROME.gold} roofGone={0.15} />
        <RomanSkyline position={[0, 0, -22]} width={60} rows={2} seed={13} />
        <Hills z={-80} />
        <group position={[0.4, 15, -2]}>
          <Cloud position={[0, 0, 0]} scale={1.7} color="#FFF3E0" />
          <Hero frame={frame} position={[0, 0.25, 0.2]} sit={1} arms={[0.9, 0.9]} eyes={frame % 60 < 30 ? "closed" : "dot"} mouth="flat" brow={0.2} />
          <RespawnBar position={[0, 4.9, 0.4]} progress={progress} frame={frame} scale={0.85} />
        </group>
        <Shot
          frame={frame}
          duration={1}
          from={aimV(tilt).pos}
          look={aimV(tilt).look}
          fov={40}
        />
      </>
    );
  }
  const gone = ramp(frame, vandals, duration, Easing.linear) * 0.45 + 0.15;
  if (shot === 1) {
    // Vandalen tragen Goldplatten nach rechts davon (Label „VANDALS“ x 0.65)
    const carriers = [0, 1, 2].map((i) => {
      const t = ((frame - vandals) * 0.035 + i * 0.33) % 1;
      return (
        <Vandal key={i} frame={frame + i * 6} position={[lerp(0.6, 5.0, t), 0, 0.4 + i * 0.6]} rotation={[0, 1.3, 0]} walk={1.2} />
      );
    });
    return (
      <>
        <RomeAtmosphere phase="decline" frame={frame} />
        <Pavement size={140} />
        <Temple position={templeAt} roofColor={ROME.gold} roofGone={gone} />
        <RomanSkyline position={[0, 0, -22]} width={60} rows={2} seed={13} />
        <Hills z={-80} />
        {carriers}
        <Shot frame={f} duration={roof - vandals} {...move(aim([2.4, 3.05, 1.0], 14, under(0.5, 14), 0.65, [0.05, 0.15, 1]), aim([2.6, 3.05, 1.0], 13, under(0.5, 13), 0.65))} />
      </>
    );
  }
  // Nah: Vandale reißt eine Platte hoch (Pop), jubelt; halbes Dach fehlt dahinter
  const lift = pop(frame, roof, 9);
  return (
    <>
      <RomeAtmosphere phase="decline" frame={frame} />
      <Pavement size={140} />
      <Temple position={templeAt} roofColor={ROME.gold} roofGone={gone} />
      <Hills z={-80} />
      <Goth frame={frame} position={[1.4, 0, 0.6]} rotation={[0, -0.25, 0]} fur={false} cloak="#5B4636" gear={false} arms={[lerp(0.5, 2.8, lift), lerp(0.5, 2.8, lift)]} eyes="happy" mouth="teeth" bounce={0.1} />
      <Block size={[1.6, 0.12, 0.95]} position={[1.4, lerp(2.3, 4.45, lift), 0.6]} rotation={[0.3 * (1 - lift), 0, 0.08]} color={ROME.gold} ink={0.05} />
      <Vandal frame={frame + 11} position={[-1.2, 0, -0.8]} rotation={[0, 0.4, 0]} cheer />
      <Burst frame={frame} start={roof} origin={[1.4, 4.4, 0.6]} count={18} speed={0.12} gravity={0.004} size={0.13} colors={[ROME.gold, "#FFE08A", "#FFFFFF"]} seed={19} />
      <Shot frame={f} duration={duration - roof} {...move(aim([1.4, 3.05, 0.6], 11, under(0.5, 11), 0.64, [0, 0.12, 1]), aim([1.4, 3.05, 0.6], 10.2, under(0.5, 10.2), 0.64))} punch={0} />
    </>
  );
};

/* 9 — kid: Nightmare Mode, Romulus Augustulus auf dem Riesen-Thron */
export const KID_SCALE = 0.58;
const THRONE_K = 1.25;
/** Sitzposition des Kindes auf dem vergrößerten Thron (Thron bei z −1). */
export const KID_SEAT: V3 = [0, (1.15 + THRONE_SIT_Y) * THRONE_K - 1.15 * KID_SCALE, -1 + 0.3 * THRONE_K];
const KID_HEAD: V3 = [KID_SEAT[0], KID_SEAT[1] + 3.05 * KID_SCALE, KID_SEAT[2]];

export const Kid: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const kid = beat("kidThrone");
  const slips = beat("wreathSlips");
  const nightmare = 41;
  const { shot, f } = cut(frame, [kid, slips]);
  const drop = ramp(frame, 0, 10, Easing.in(Easing.quad));
  const land = frame >= 10 && frame < 18 ? Math.sin(((frame - 10) / 8) * Math.PI) : 0;
  const yDrop = lerp(KID_SEAT[1] + 6, KID_SEAT[1], drop);
  const j = jolt(frame, nightmare, 0.3, 16);

  const kidFig = (opts: { eyes?: "wide" | "dot" | "closed"; slip?: number; kick?: number }) => (
    <group position={[KID_SEAT[0], shot === 0 ? yDrop : KID_SEAT[1], KID_SEAT[2]]} scale={[KID_SCALE * (1 + land * 0.25), KID_SCALE * (1 - land * 0.3), KID_SCALE * (1 + land * 0.25)]}>
      <Hero frame={frame} kid sit={1} walk={opts.kick ?? 0} arms={[0.5, 0.5]} eyes={opts.eyes ?? "wide"} mouth="o" brow={-0.3} wreathSlip={opts.slip ?? 0} />
    </group>
  );

  if (shot === 0) {
    return (
      <>
        <PalaceSet frame={frame} phase="fall" throneScale={THRONE_K} />
        <DangerLight frame={frame} position={[4.2, 4.5, 1.5]} intensity={0.7} />
        {kidFig({ eyes: frame > nightmare ? "wide" : "dot", kick: 0.8 })}
        <Burst frame={frame} start={10} origin={[0, KID_SEAT[1] + 1, KID_SEAT[2]]} count={20} speed={0.1} gravity={0.002} size={0.1} colors={["#4FC3F7", "#FFFFFF", ROME.gold]} seed={23} />
        <Shot frame={f} duration={kid} {...jmove(move(aim([0, 3.6, -1], 13, 0.5, 0.5, [0, 0.0, 1]), aim([0, 3.6, -1], 12, 0.5)), j)} />
      </>
    );
  }
  if (shot === 1) {
    return (
      <>
        <PalaceSet frame={frame} phase="fall" throneScale={THRONE_K} />
        <DangerLight frame={frame} position={[4.2, 4.5, 1.5]} intensity={0.6} />
        {kidFig({ eyes: "wide", kick: 1.2 })}
        <Shot frame={f} duration={slips - kid} {...move(aim(KID_HEAD, 8, under(0.45, 8, KID_SCALE), 0.5, [0.05, 0.1, 1]), aim(KID_HEAD, 7.2, under(0.45, 7.2, KID_SCALE)))} />
      </>
    );
  }
  const slip = ramp(frame, slips, slips + 22, Easing.out(Easing.bounce));
  return (
    <>
      <PalaceSet frame={frame} phase="fall" throneScale={THRONE_K} />
      <DangerLight frame={frame} position={[4.2, 4.5, 1.5]} intensity={0.5} />
      {kidFig({ eyes: "wide", slip, kick: 0.6 })}
      <Shot frame={f} duration={duration - slips} {...move(aim(KID_HEAD, 5.4, under(0.45, 5.4, KID_SCALE)), aim(KID_HEAD, 4.9, under(0.45, 4.9, KID_SCALE)))} />
    </>
  );
};
