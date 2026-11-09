/**
 * Rom-Video „WORST JOB IN ROME“ (episodes/roman-empire.json), Szenen 1–5.
 * YOU = <Hero> (Kaiser mit gelbem Halstuch) in jeder Einstellung, in der er vorkommt.
 * Stimmung: glory (193) → decline (395–455) → fall (475/476) → Twist wärmer.
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { Burst } from "../kit/fx";
import {
  BigHand,
  CityGate,
  CoinStack,
  Emperor,
  EmpireMap,
  FlyingStone,
  Hero,
  LaurelWreath,
  Legionary,
  Rooster,
  ROME,
  Senator,
  Servant,
  SignBoard,
  StampMark,
  Temple,
  THRONE_SIT_Y,
  Throne,
  TimelineStele,
  DangerLight,
  RomeAtmosphere,
  Pavement,
  RomanSkyline,
  Hills,
  Colosseum,
} from "../kit/rome";
import { useScene } from "../types";
import { Fired, Deleted, Twist, Vote } from "./rome3";
import { Goths, Perished, Vandals, Kid } from "./rome2";
import {
  add,
  aim,
  jmove,
  move,
  under,
  anticipate,
  AuctionStage,
  Block,
  cut,
  ForumSet,
  jolt,
  PalaceSet,
  pop,
  ramp,
  STAGE_Y,
  Studio,
} from "./romeSets";
import { lerp } from "./util";

const SEAT: V3 = [0, STAGE_Y + THRONE_SIT_Y, -0.6];

/** Kamera der ersten Einstellung (Hook S0) – auch Zielbild des Loops am Ende (vote). */
export const HOOK_A = aim([0.7, 3.0, -0.2], 10.5, 0.5, 0.5, [0, 0.1, 1]);
export const HOOK_CAM = move(HOOK_A, aim([0.7, 3.0, -0.2], 11.5, 0.5, 0.5, [0, 0.12, 1]));

/* 1 — hook: „the Roman Empire got auctioned off …“ */
export const RomeHook: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const wide = beat("auctionWide");
  const win = beat("youWin");
  const close = beat("throneClose");
  const worried = beat("worriedPush");
  const respawnAt = 146; // Sticker „RESPAWN = WORSE JOB“ (Wort „respawn“)
  const { shot, f } = cut(frame, [wide, close]);

  if (shot === 0) {
    return (
      <>
        <AuctionStage frame={frame} />
        <Legionary frame={frame} position={[-2.7, STAGE_Y, 0.4]} rotation={[0, 0.3, 0]} arms={[0.3, 0.5]} />
        <Legionary frame={frame + 9} position={[2.9, STAGE_Y, -0.2]} rotation={[0, -0.3, 0]} arms={[0.3, 0.5]} />
        <Shot frame={f} duration={wide} {...HOOK_CAM} punch={28} />
      </>
    );
  }
  if (shot === 1) {
    // Totale: Bieter vor der Bühne, YOU gewinnt und springt
    const j = frame - win;
    const jump = j >= 0 && j < 16 ? Math.sin((j / 16) * Math.PI) * 1.1 : 0;
    const won = frame >= win;
    const bidders: [V3, number][] = [
      [[-2.0, 0, 3.4], 0.35],
      [[2.1, 0, 3.6], -0.35],
      [[-3.3, 0, 2.2], 0.5],
      [[3.4, 0, 2.3], -0.5],
    ];
    return (
      <>
        <AuctionStage frame={frame} />
        {bidders.map(([p, r], i) => (
          <Senator
            key={i}
            frame={frame + i * 13}
            position={p}
            rotation={[0, won ? r * 2.2 : r * 0.4 + Math.PI, 0]}
            arms={won ? [0.3, 0.3] : [0.3, i % 2 ? 2.5 : 0.4]}
            eyes={won ? "wide" : "dot"}
            mouth={won ? "o" : "flat"}
          />
        ))}
        <Hero
          frame={frame}
          position={[0, jump, 4.2]}
          arms={won ? [2.6, 2.6] : [0.3, 2.4]}
          eyes={won ? "happy" : "dot"}
          mouth={won ? "teeth" : "smile"}
          bounce={won ? 0.12 : 0}
        />
        {/* Wachen auf der Bühne zeigen auf YOU */}
        <Legionary frame={frame} position={[-2.6, STAGE_Y, 0.6]} rotation={[0, 0.5, 0]} arms={won ? [1.4, 0.4] : [0.3, 0.5]} mouth={won ? "grin" : "flat"} />
        <Legionary frame={frame + 7} position={[2.6, STAGE_Y, 0.6]} rotation={[0, -0.5, 0]} arms={won ? [0.4, 1.4] : [0.3, 0.5]} mouth={won ? "grin" : "flat"} />
        <Burst frame={frame} start={win} origin={[0, 4.6, 4.2]} count={26} speed={0.14} gravity={0.004} size={0.16} colors={[ROME.gold, "#FFFFFF", "#FFE08A"]} seed={3} />
        <Shot frame={f} duration={close - wide} {...move(aim([0, 3.05, 4.2], 14.5, under(0.42, 14.5)), aim([0, 3.05, 4.2], 13.5, under(0.42, 13.5)))} punch={win - wide} />
      </>
    );
  }
  // Halbnah auf dem Thron: erst Grinsen, ab „respawn“ Sorge, Ranfahrt bei „worse“
  const scared = frame >= respawnAt;
  const push = ramp(frame, worried - 30, duration, Easing.out(Easing.cubic));
  const H = frame < worried - 30 ? lerp(10, 9, ramp(frame, close, worried - 30)) : lerp(9, 7.4, push);
  const cam = aim(add(SEAT, [0, 3.05, 0]), H, under(0.42, H), 0.5, [0.05, 0.08, 1]);
  return (
    <>
      <AuctionStage frame={frame} />
      <Hero
        frame={frame}
        position={SEAT}
        sit={1}
        arms={scared ? [0.6, 0.6] : [1.2, 2.3]}
        eyes={scared ? "wide" : "happy"}
        mouth={scared ? "frown" : "grin"}
        brow={scared ? -0.35 : 0.1}
        sweat={scared}
        bounce={scared ? 0 : 0.06}
        scepter
      />
      <Shot frame={frame} duration={1} from={cam.pos} look={cam.look} fov={40} shake={scared ? 0.05 : 0.03} />
    </>
  );
};

/* 2 — auction: Rewind 193, Wachen, Bieter drinnen/draußen, Finger, „Sold!“ */
const PALISADE_H = 2.0;
const Palisade: React.FC<{ readonly along: "z" | "x" }> = ({ along }) => (
  <>
    <Block size={along === "z" ? [0.6, PALISADE_H, 30] : [30, PALISADE_H, 0.6]} position={[0, PALISADE_H / 2, 0]} color={ROME.wood} ink={0.015} />
    {Array.from({ length: 21 }, (_, i) => {
      const k = -15 + i * 1.5;
      return (
        <mesh key={i} position={along === "z" ? [0, PALISADE_H + 0.2, k] : [k, PALISADE_H + 0.2, 0]}>
          <coneGeometry args={[0.32, 0.5, 4]} />
          <meshToonMaterial color="#7A4E28" />
        </mesh>
      );
    })}
  </>
);

export const RomeAuction: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const guards = beat("guardsWall");
  const forSale = beat("throneForSale");
  const rival = beat("rivalInside");
  const outside = beat("youOutside");
  const fingers = beat("fingers");
  const sold = beat("sold");
  const { shot, f } = cut(frame, [guards, forSale, fingers]);

  if (shot === 0) {
    // Rewind: Zeitleiste spult von 1453 auf 193 zurück, Kamera dreht schnell zurück
    const t = ramp(frame, 0, guards - 6, Easing.out(Easing.cubic));
    const a = lerp(1.4, 0, t);
    return (
      <>
        <Studio />
        <TimelineStele position={[0, 0, 0]} at={lerp(6, 1, t)} frame={frame} />
        <Burst frame={frame} start={guards - 8} origin={[-0.95, 4.6, 0.4]} count={16} speed={0.1} gravity={0} size={0.12} colors={[ROME.gold, "#FFFFFF"]} seed={8} />
        <Shot frame={frame} duration={1} {...move(aim([0, 3.4, 0], 9.2, 0.5, 0.5, [Math.sin(a), 0.1, Math.cos(a)]))} shake={0.06} />
      </>
    );
  }
  if (shot === 1) {
    // Lagertor, Wachen oben (Label „GUARDS“ bei y 0.3)
    return (
      <>
        <RomeAtmosphere phase="glory" frame={frame} />
        <Pavement size={120} />
        <CityGate position={[0, 0, -2]} wall={9} />
        {[-1.6, 0, 1.6].map((x, i) => (
          <Legionary
            key={x}
            frame={frame + i * 11}
            position={[x, 5.5, -2.1]}
            rotation={[0, -x * 0.12, 0]}
            arms={i === 1 ? [0.3, 0.5] : [1.1, 0.5]}
            eyes={i === 1 ? "angry" : "dot"}
            mouth={i === 1 ? "grin" : "flat"}
            bounce={0.05}
          />
        ))}
        <RomanSkyline position={[0, 0, -24]} width={60} rows={2} seed={5} />
        <Shot frame={f} duration={forSale - guards} {...move(aim([0, 8.55, -2.1], 15, under(0.3, 15), 0.5, [0.05, -0.25, 1]), aim([0, 8.55, -2.1], 14, under(0.3, 14), 0.5, [0, -0.22, 1]))} />
      </>
    );
  }
  if (shot === 2) {
    // Querschnitt der Lagermauer: links drinnen der Rivale, rechts draußen YOU, Wachen oben
    const bidR = frame >= rival;
    const bidY = frame >= outside;
    const sign = pop(frame, forSale);
    return (
      <>
        <RomeAtmosphere phase="glory" frame={frame} />
        <Pavement size={120} />
        <Palisade along="z" />
        <Legionary frame={frame} position={[0, PALISADE_H, -0.8]} arms={[2.7, 2.7]} mouth="grin" eyes="happy" bounce={0.04} shield={false} />
        <group position={[0, PALISADE_H + 1.75, -0.1]} scale={Math.max(0.001, sign)}>
          <SignBoard lines={["THRONE", "FOR SALE"]} post={false} width={2.0} height={1.0} />
        </group>
        <Legionary frame={frame + 15} position={[0, PALISADE_H, -3.2]} arms={[0.3, 0.5]} />
        <Senator
          frame={frame}
          position={[-1.7, 0, 0.5]}
          rotation={[0, 0.55, 0]}
          arms={bidR ? [0.3, 2.6 + Math.sin(frame * 0.4) * 0.15] : [0.3, 0.3]}
          eyes={bidR ? "angry" : "dot"}
          mouth={bidR ? "teeth" : "flat"}
          bounce={bidR && !bidY ? 0.08 : 0}
        />
        <CoinStack position={[-2.9, 0, 0.9]} count={bidR ? Math.min(9, 2 + (frame - rival) / 4) : 2} scale={0.75} />
        <Hero
          frame={frame}
          position={[1.3, 0, 0.6]}
          rotation={[0, -0.55, 0]}
          arms={bidY ? [2.7 + Math.sin(frame * 0.5) * 0.15, 2.7 - Math.sin(frame * 0.5) * 0.15] : [0.3, 0.3]}
          eyes={bidY ? "angry" : "dot"}
          mouth={bidY ? "teeth" : "smile"}
          bounce={bidY ? 0.12 : 0}
        />
        <CoinStack position={[2.4, 0, 1.4]} count={bidY ? Math.min(11, 2 + (frame - outside) / 3) : 2} scale={0.75} />
        <Shot frame={f} duration={fingers - forSale} {...move(aim([-1.7, 3.05, 0.5], 12.5, under(0.45, 12.5), 0.32), aim([-1.7, 3.05, 0.5], 12, under(0.45, 12), 0.3))} />
      </>
    );
  }
  // Finger-Detail (Antizipation: Hand holt erst nach unten aus) → Zurückfahren bei „Sold!“
  const a = anticipate(frame, fingers + 4, 9);
  const handY = lerp(2.4, 4.75, a);
  const soldT = ramp(frame, sold, duration, Easing.out(Easing.cubic));
  const won = frame >= sold;
  return (
    <>
      <RomeAtmosphere phase="glory" frame={frame} />
      <Pavement size={120} />
      <group position={[0, 0, 0]}>
        <Palisade along="x" />
      </group>
      {[-2.2, 0.4, 2.8].map((x, i) => (
        <Legionary
          key={x}
          frame={frame + i * 9}
          position={[x, PALISADE_H, -0.2]}
          arms={won ? [2.7, 2.7] : [0.3, 0.5]}
          eyes={won ? "happy" : "dot"}
          mouth={won ? "teeth" : "flat"}
          bounce={won ? 0.15 : 0}
          shield={false}
        />
      ))}
      <Senator frame={frame} position={[-1.4, 0, -1.2]} arms={[0.3, won ? 0.3 : 2.4]} eyes={won ? "wide" : "angry"} mouth={won ? "o" : "teeth"} />
      <Hero
        frame={frame}
        position={[0.6, 0, 2.6]}
        rotation={[0, 0.1, 0]}
        arms={won ? [2.6, 2.6] : [lerp(0.4, 2.3, Math.max(0, a)), 0.4]}
        eyes={won ? "happy" : "angry"}
        mouth={won ? "teeth" : "grin"}
        brow={won ? 0 : 0.15}
        bounce={won ? 0.12 : 0}
      />
      {!won ? (
        <BigHand position={[-0.5, handY, 3.3]} rotation={[0, 0.2, lerp(-0.4, 0.15, Math.max(0, a))]} scale={0.95} fingers={5} wiggle={1} frame={frame} />
      ) : null}
      <Burst frame={frame} start={sold} origin={[0.9, 5.5, 2.6]} count={34} speed={0.16} gravity={0.006} size={0.22} colors={[ROME.gold, "#E8A92A", "#FFE08A"]} seed={12} />
      <Shot
        frame={frame}
        duration={1}
        from={aim([0.6, 3.05, 2.6], lerp(8.2, 13.5, soldT), 0.56, 0.52, [0.1, 0.1, 1]).pos}
        look={aim([0.6, 3.05, 2.6], lerp(8.2, 13.5, soldT), 0.56, 0.52, [0.1, 0.1, 1]).look}
        fov={40}
        shake={0.04}
        punch={sold}
      />
    </>
  );
};

/* 3 — stones: Rom hasst dich, Steine, GAME OVER, letzte Worte */
const CROWD: [V3, number][] = [
  [[-2.3, 0, 1.4], 0.9],
  [[2.4, 0, 1.2], -0.9],
  [[-3.2, 0, -1.4], 0.6],
  [[3.3, 0, -1.6], -0.6],
  [[-1.3, 0, -2.6], 0.3],
  [[1.5, 0, -2.8], -0.3],
];

export const RomeStones: React.FC = () => {
  const { frame, beat } = useScene();
  const boo = beat("crowdBoo");
  const stones = beat("stonesFly");
  const over = beat("gameOver");
  const last = beat("lastWords");
  const dead = beat("deadpan");
  const { shot, f } = cut(frame, [stones, over, last]);

  const crowd = (angry: boolean) =>
    CROWD.map(([p, r], i) =>
      i % 3 === 2 ? (
        <Servant key={i} frame={frame + i * 7} position={p} rotation={[0, r, 0]} arms={angry ? [2.4 + Math.sin(frame * 0.5 + i) * 0.3, 0.5] : [0.3, 0.3]} eyes="angry" mouth="teeth" bounce={angry ? 0.08 : 0} />
      ) : (
        <Senator key={i} frame={frame + i * 7} position={p} rotation={[0, r, 0]} arms={angry ? [0.4, 2.4 + Math.sin(frame * 0.45 + i) * 0.3] : [0.3, 0.3]} eyes="angry" mouth={i % 2 ? "frown" : "teeth"} bounce={angry ? 0.07 : 0} />
      ),
    );
  const temple = <Temple position={[0, 0, -11]} scale={1.1} />;

  if (shot === 0) {
    return (
      <>
        <ForumSet frame={frame} />
        {temple}
        {crowd(frame >= boo)}
        <Hero frame={frame} position={[0, 0, 0]} arms={[0.6, 0.6]} eyes="wide" mouth="o" brow={-0.3} sweat />
        <Shot frame={f} duration={stones} {...move(aim([0, 3.05, 0], 14, under(0.42, 14), 0.5, [0, 0.14, 1]), aim([0, 3.05, 0], 13, under(0.42, 13), 0.5, [0.05, 0.12, 1]))} punch={boo} />
      </>
    );
  }
  if (shot === 1) {
    // Steine fliegen (Squash & Stretch), YOU duckt sich
    const duck = ramp(frame, stones, stones + 6);
    const throws: [number, V3, V3][] = [
      [stones + 0, [-2.4, 3.4, 1.4], [0.7, 0, 0.8]],
      [stones + 5, [2.4, 3.4, 1.2], [-0.8, 0, 0.6]],
      [stones + 10, [-3.2, 3.5, -1.4], [0.4, 0, -0.6]],
      [stones + 15, [3.3, 3.5, -1.6], [0.9, 0, -0.3]],
      [stones + 21, [-1.3, 3.4, -2.6], [-0.5, 0, 1.0]],
      [stones + 27, [1.5, 3.4, -2.8], [-0.2, 0, 1.3]],
      [stones + 32, [-2.4, 3.4, 1.4], [1.2, 0, 0.2]],
    ];
    return (
      <>
        <ForumSet frame={frame} />
        {temple}
        {crowd(true)}
        <Hero
          frame={frame}
          position={[0, -0.25 * duck, 0]}
          rotation={[0.18 * duck, 0, 0]}
          arms={[lerp(0.6, 2.75, duck), lerp(0.6, 2.75, duck)]}
          eyes="closed"
          mouth="teeth"
          brow={-0.3}
          sweat
        />
        {throws.map(([s, a, b], i) => (
          <FlyingStone key={i} frame={frame} start={s} dur={13} from={a} to={b} arc={1.6} size={0.2} />
        ))}
        <Shot frame={f} duration={over - stones} {...move(aim([0, 3.05, 0], 11, under(0.42, 11), 0.5, [0.18, 0.1, 1]), aim([0, 3.05, 0], 10, under(0.42, 10), 0.5, [0.14, 0.1, 1]))} shake={0.08} />
      </>
    );
  }
  if (shot === 2) {
    // GAME OVER: dunkles Studio, rotes Gefahrenlicht, Stempel knallt, Kamera-Wackler
    const s = pop(frame, over, 9);
    const j = jolt(frame, over + 2, 0.3, 16);
    return (
      <>
        <Studio color="#1A0F14" light={[6, 7, 6]} intensity={1.2} />
        <DangerLight frame={frame} position={[-3.6, 4, 2]} intensity={0.8} />
        <Hero frame={0} position={[0, -0.25, 0]} rotation={[0.18, 0, 0]} arms={[2.75, 2.75]} eyes="closed" mouth="teeth" brow={-0.3} />
        <StampMark text="GAME OVER" position={[0, 1.7, 1.8]} rotation={[0, 0, 0.1]} w={4.2} h={1.25} scale={Math.max(0.001, 2.2 - 1.2 * s)} />
        <Shot frame={f} duration={last - over} {...jmove(move(aim([0, 2.8, 0], 10, under(0.42, 10)), aim([0, 2.8, 0], 9.4, under(0.42, 9.4))), j)} shake={0.02} />
      </>
    );
  }
  // Letzte Worte: Nah, unschuldiger Blick in die Kamera; „Buddy…“ → Ranfahrt
  const deadpan = frame >= dead;
  const push = ramp(frame, dead, dead + 12, Easing.out(Easing.cubic));
  return (
    <>
      <ForumSet frame={frame} />
      {temple}
      <Hero
        frame={frame}
        position={[0, 0, 0]}
        arms={deadpan ? [0.4, 0.4] : [1.0, 1.0]}
        eyes={deadpan ? "dot" : "wide"}
        mouth={deadpan ? "flat" : "o"}
        brow={deadpan ? 0.05 : -0.4}
        blush={deadpan}
        look={Math.sin(frame * 0.07) * 0.06}
      />
      <Shot frame={frame} duration={1} {...move(aim([0, 3.05, 0], lerp(8.4, 7.0, push), under(0.42, lerp(8.4, 7.0, push))))} shake={0.03} />
    </>
  );
};

/* 4 — chaos: 5 Kaiser in einem Jahr (Karussell), 238, „Nope“ */
export const RomeChaos: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const carousel = Math.min(beat("throneCarousel"), 20);
  const stele = beat("stele238");
  const nope = beat("nopeSkip");
  const { shot, f } = cut(frame, [stele]);

  if (shot === 0) {
    const spinA = frame * 0.16;
    const step = 11;
    const k = Math.max(0, Math.min(4, Math.floor((frame - carousel) / step) + 1));
    const seatY = THRONE_SIT_Y + 0.3;
    const flyers = Array.from({ length: k }, (_, i) => {
      const t = frame - (carousel + i * step);
      if (t < 0 || t > 40) return null;
      const dir = i % 2 ? 1 : -1;
      const pos: V3 = [dir * t * 0.26, seatY + t * 0.32 - 0.011 * t * t, 0.6 + t * 0.1];
      const P = i === 1 ? Hero : Emperor;
      return (
        <P key={`fly${i}`} frame={frame} position={pos} rotation={[t * 0.2, 0, dir * t * 0.25]} arms={[2.5, 2.5]} eyes="wide" mouth="o" />
      );
    });
    const SeatP = k === 1 ? Hero : Emperor;
    const seatPop = pop(frame, carousel + (k - 1) * step, 10);
    return (
      <>
        <PalaceSet frame={frame} phase="glory" throne={false} />
        <group rotation={[0, spinA, 0]}>
          <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[3.2, 3.3, 0.3, 40]} />
            <meshToonMaterial color={ROME.gold} />
          </mesh>
          <Throne position={[0, 0.3, -0.3]} />
          <group position={[0, 0, 0]} scale={k === 0 ? 1 : Math.max(0.001, seatPop)}>
            <SeatP frame={frame} position={[0, seatY, 0]} sit={1} arms={[0.5, 0.5]} eyes="happy" mouth="grin" />
          </group>
        </group>
        {flyers}
        <Shot frame={f} duration={stele} {...move(aim([0, 3.6, 0], 13, 0.55, 0.5, [0, 0.4, 1]), aim([0, 3.6, 0], 12, 0.55, 0.5, [0.1, 0.3, 1]))} shake={0.06} />
      </>
    );
  }
  // Stele 193 → 238, sechs Kränze fallen, YOU winkt ab („Nope“) → Vorspulen auf 395
  const years = ["193 AD", "238 AD", "395 AD"];
  const at = frame < nope ? ramp(frame, stele, stele + 18) : 1 + ramp(frame, nope + 3, nope + 15);
  const nopeOn = frame >= nope;
  const wreaths = Array.from({ length: 6 }, (_, i) => {
    const s = stele + 21 + i * 6;
    const t = frame - s;
    if (t < 0) return null;
    const land = 16;
    const y = t < land ? lerp(8.5, 0.12, Math.pow(t / land, 2)) : 0.12;
    const sq = t >= land && t < land + 6 ? Math.sin(((t - land) / 6) * Math.PI) : 0;
    const x = -2.2 + i * 0.55;
    return (
      <group key={i} position={[x, y, 1.4 + (i % 2) * 0.5]} scale={[0.32 * (1 + sq * 0.3), 0.32 * (1 - sq * 0.4), 0.32 * (1 + sq * 0.3)]} rotation={[0.3, i, 0]}>
        <LaurelWreath y={0} />
      </group>
    );
  });
  return (
    <>
      <Studio table />
      <TimelineStele position={[-1.1, 0, 0]} years={years} at={at} frame={frame} />
      {wreaths}
      <Hero
        frame={frame}
        position={[1.5, 0, 0.6]}
        rotation={[0, -0.25, 0]}
        arms={nopeOn ? [0.3, 2.0 + Math.sin(frame * 0.9) * 0.45] : [0.4, 0.4]}
        eyes={nopeOn ? "closed" : "wide"}
        mouth={nopeOn ? "flat" : "o"}
        brow={nopeOn ? 0.3 : -0.3}
        look={nopeOn ? Math.sin(frame * 0.9) * 0.35 : 0}
      />
      <Shot frame={f} duration={duration - stele} {...move(aim([0.2, 3.2, 0.3], 10.5, 0.52), aim([0.2, 3.2, 0.3], 9.8, 0.52))} punch={nope - stele} />
    </>
  );
};

/* 5 — split: Respawn 395 (Hard Mode), Reichsteilung, Honorius + Hahn */
export const RomeSplit: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const split = beat("mapSplit");
  const throne = beat("honoriusThrone");
  const rooster = beat("rooster");
  const { shot, f } = cut(frame, [split, throne, rooster]);

  if (shot <= 1) {
    const s = ramp(frame, split, split + 14, Easing.out(Easing.back(1.6)));
    const MS = 1.2;
    const gap = s * 0.9 * MS;
    const y = 0.36;
    const spawn = pop(frame, 2, 9);
    const walk = ramp(frame, split + 10, duration);
    const j = jolt(frame, split, 0.25, 14);
    const cam = shot === 0
      ? move(aim([-2.7, 1.0, 0.6], 6.5, 0.52, 0.5, [0, 0.9, 1]), aim([-2.7, 1.0, 0.6], 5.8, 0.52, 0.5, [0.1, 0.8, 1]))
      : move(aim([0.6, 0.3, 0.2], 13, 0.52, 0.5, [0, 1.6, 1]), aim([0.9, 0.3, 0.2], 12.5, 0.52, 0.5, [0, 1.5, 1]));
    return (
      <>
        <Studio table />
        <hemisphereLight args={["#FFE9C8", "#5A3420", 0.4]} />
        <EmpireMap frame={frame} scale={MS} split={s} />
        <group position={[-2.7 - gap, y, 0.7]} scale={0.36 * Math.max(0.001, spawn)}>
          <Hero frame={frame} arms={frame > split ? [0.5, 1.2] : [2.4, 2.4]} eyes={frame > split ? "wide" : "happy"} mouth={frame > split ? "o" : "grin"} />
        </group>
        <Burst frame={frame} start={1} origin={[-2.7, 1.2, 0.7]} count={22} speed={0.08} gravity={0.002} size={0.09} colors={["#4FC3F7", "#FFFFFF", ROME.gold]} seed={21} />
        <group position={[2.5 + gap + walk * 1.6, y, 0.7]} rotation={[0, frame > split ? 1.2 : -0.3, 0]} scale={0.36}>
          <Emperor frame={frame} walk={frame > split + 10 ? 1 : 0} arms={[0.4, 1.6 + Math.sin(frame * 0.4) * 0.3]} eyes="happy" mouth="grin" />
        </group>
        <Shot frame={f} duration={shot === 0 ? split : throne - split} {...jmove(cam, j)} />
      </>
    );
  }
  // Palast: Honorius auf dem Thron, ab „rooster“ der große Hahn daneben
  const rPop = pop(frame, rooster, 8);
  const rs = Math.max(0.001, rPop);
  // Squash & Stretch beim Hereinploppen: breit-flach → schmal-hoch → normal
  const sq = frame >= rooster ? Math.sin(Math.min(1, (frame - rooster) / 10) * Math.PI) * 0.25 : 0;
  const withRooster = shot === 3;
  return (
    <>
      <PalaceSet frame={frame} phase="decline" />
      <Hero
        frame={frame}
        position={[0, THRONE_SIT_Y, -0.7]}
        sit={1}
        arms={withRooster ? [0.5, 1.5 + Math.sin(frame * 0.2) * 0.15] : [0.5, 0.9]}
        eyes={withRooster ? "happy" : "dot"}
        mouth={withRooster ? "grin" : "smile"}
        blush={withRooster}
        look={withRooster ? 0.35 : 0}
        scepter={!withRooster}
      />
      {withRooster ? (
        <group position={[1.55, 0, 0.5]} rotation={[0, -0.55, 0]} scale={[1.25 * rs * (1 - sq * 0.5), 1.25 * rs * (1 + sq), 1.25 * rs * (1 - sq * 0.5)]}>
          <Rooster frame={frame} tag="ROME" flap={frame - rooster < 14 ? 0.8 : 0.1} />
        </group>
      ) : null}
      {shot === 2 ? (
        <Shot frame={f} duration={rooster - throne} {...move(aim([0, 3.71, -0.7], 11.5, under(0.42, 11.5), 0.4), aim([0, 3.71, -0.7], 10.5, under(0.42, 10.5), 0.4))} />
      ) : (
        <Shot frame={f} duration={duration - rooster} {...move(aim([0, 3.71, -0.7], 10, under(0.42, 10), 0.36), aim([0, 3.71, -0.7], 9.4, under(0.42, 9.4), 0.37))} punch={0} />
      )}
    </>
  );
};

// Unbenutzte Importe vermeiden (Hills/Colosseum/RomanSkyline werden in Sets genutzt)
void Hills;
void Colosseum;
void RomanSkyline;

/** Szenen-IDs = "id" in episodes/roman-empire.json */
export const ROME_SCENES: Record<string, React.FC> = {
  hook: RomeHook,
  auction: RomeAuction,
  stones: RomeStones,
  chaos: RomeChaos,
  split: RomeSplit,
  goths: Goths,
  perished: Perished,
  vandals: Vandals,
  kid: Kid,
  fired: Fired,
  deleted: Deleted,
  twist: Twist,
  vote: Vote,
};
