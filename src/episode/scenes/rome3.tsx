/**
 * Rom-Video, Szenen 10–13: fired (476), deleted, twist (Osten bis 1453), vote (Loop).
 */
import React from "react";
import { Easing } from "remotion";
import { Shot, V3 } from "../kit/camera";
import { Burst, Glow } from "../kit/fx";
import {
  Colosseum,
  Emperor,
  EmpireMap,
  Goth,
  Hero,
  Hills,
  LaurelWreath,
  MoneyBag,
  Pavement,
  RomanHouse,
  RomanSkyline,
  ROME,
  RomeAtmosphere,
  Rotunda,
  RubberStamp,
  Senator,
  SignBoard,
  SpqrBanner,
  StampMark,
  THRONE_SIT_Y,
  Throne,
  TimelineStele,
  UmbrellaPine,
  Cypress,
  Coin,
} from "../kit/rome";
import { useScene } from "../types";
import { KID_SCALE, KID_SEAT } from "./rome2";
import { HOOK_CAM } from "./rome1";
import { aim, anticipate, AuctionStage, Block, cut, jmove, jolt, move, PalaceSet, pop, ramp, SenateSet, Studio, under } from "./romeSets";
import { lerp } from "./util";

const ODO_K = 1.15;
const ODO_HEAD: V3 = [1.7, 3.05 * ODO_K, 0.9];
const Odoacer: React.FC<{
  readonly frame: number;
  readonly position: V3;
  readonly rotation?: V3;
  readonly arms?: [number, number];
  readonly walk?: number;
  readonly mouth?: "grin" | "smile" | "flat";
}> = ({ frame, position, rotation, arms = [0.4, 0.4], walk = 0, mouth = "smile" }) => (
  <Goth frame={frame} position={position} rotation={rotation} scale={ODO_K} fur={false} cap={false} gear={false} cloak="#5B4636" arms={arms} walk={walk} eyes="dot" mouth={mouth} />
);

/* 10 — fired: Odoaker hebt das Kind vom Thron, Rente, ab in die Villa */
export const Fired: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const lift = beat("odoacerLift");
  const setDown = beat("setDown");
  const pretty = beat("prettyFace");
  const bag = 142;
  const villa = beat("villaWalk");
  const { shot, f } = cut(frame, [setDown, pretty, villa]);

  if (shot === 0) {
    const w = ramp(frame, 0, lift, Easing.out(Easing.quad));
    const up = ramp(frame, lift + 4, lift + 26, Easing.inOut(Easing.cubic));
    const kidPos: V3 = [lerp(KID_SEAT[0], 0.55, up), lerp(KID_SEAT[1], 2.1, up), lerp(KID_SEAT[2], 0.6, up)];
    return (
      <>
        <PalaceSet frame={frame} phase="fall" throneScale={1.25} />
        <Odoacer frame={frame} position={[lerp(4.2, 1.7, w), 0, lerp(1.6, 0.9, w)]} rotation={[0, -0.7, 0]} walk={w < 1 ? 1.2 : 0} arms={[frame >= lift ? 1.6 : 0.4, 0.5]} mouth="grin" />
        <group position={kidPos} scale={KID_SCALE}>
          <Hero frame={frame} kid sit={up > 0.5 ? 0 : 1} walk={up > 0 ? 2.2 : 0} arms={up > 0 ? [2.0 + Math.sin(frame * 0.6) * 0.4, 2.0 - Math.sin(frame * 0.6) * 0.4] : [0.5, 0.5]} eyes="wide" mouth="o" brow={-0.3} />
        </group>
        <Shot frame={f} duration={setDown} {...move(aim(ODO_HEAD, 12.5, under(0.32, 12.5, ODO_K), 0.62), aim(ODO_HEAD, 11.8, under(0.32, 11.8, ODO_K), 0.62))} />
      </>
    );
  }
  if (shot === 1) {
    const d = ramp(frame, setDown, setDown + 10, Easing.in(Easing.quad));
    const land = frame >= setDown + 10 && frame < setDown + 17 ? Math.sin(((frame - setDown - 10) / 7) * Math.PI) : 0;
    return (
      <>
        <PalaceSet frame={frame} phase="fall" throneScale={1.25} />
        <Odoacer frame={frame} position={[1.7, 0, 0.9]} rotation={[0, -0.7, 0]} arms={[lerp(1.6, 0.6, d), 0.5]} />
        <group position={[lerp(0.55, 0.3, d), lerp(2.1, 0, d), lerp(0.6, 1.5, d)]} scale={[KID_SCALE * (1 + land * 0.25), KID_SCALE * (1 - land * 0.3), KID_SCALE * (1 + land * 0.25)]}>
          <Hero frame={frame} kid wreath={false} arms={[0.5, 0.5]} eyes="wide" mouth="o" rotation={[0, 0.5, 0]} />
        </group>
        <group position={[-0.6, 0.08, 0.9]} rotation={[Math.PI / 2, 0, 0.3]} scale={0.32}>
          <LaurelWreath y={0} />
        </group>
        <Shot frame={f} duration={pretty - setDown} {...move(aim(ODO_HEAD, 11.5, under(0.32, 11.5, ODO_K), 0.62, [-0.35, 0.1, 1]), aim(ODO_HEAD, 11, under(0.32, 11, ODO_K), 0.62, [-0.3, 0.1, 1]))} />
      </>
    );
  }
  if (shot === 2) {
    // Kind macht große Augen (blush), Odoaker gibt den Geldsack, Münzen regnen
    const b = ramp(frame, bag, bag + 10, Easing.in(Easing.quad));
    const sq = frame >= bag + 10 && frame < bag + 17 ? Math.sin(((frame - bag - 10) / 7) * Math.PI) : 0;
    return (
      <>
        <PalaceSet frame={frame} phase="fall" throneScale={1.25} />
        <Odoacer frame={frame} position={[1.7, 0, -0.2]} rotation={[0, -0.5, 0]} arms={[frame >= bag ? 1.2 : 0.4, 0.4]} mouth="smile" />
        <group position={[0.1, 0, 1.6]} scale={KID_SCALE}>
          <Hero frame={frame} kid wreath={false} arms={frame >= bag + 10 ? [1.0, 1.0] : [0.5, 0.5]} eyes={frame >= bag + 10 ? "happy" : "dot"} mouth={frame >= bag + 10 ? "grin" : "smile"} blush bounce={0.06} look={-0.2} />
        </group>
        {frame >= bag ? <MoneyBag position={[0.1, lerp(5.5, 0.7, b), 2.4]} scale={0.6} squash={sq} /> : null}
        <Burst frame={frame} start={bag + 6} origin={[0.4, 5.5, 1.8]} count={26} speed={0.07} gravity={0.006} size={0.2} colors={[ROME.gold, "#E8A92A"]} seed={31} />
        <Shot frame={f} duration={villa - pretty} {...move(aim([1.7, 3.5, -0.2], 9.5, under(0.32, 9.5, ODO_K), 0.62, [-0.25, -0.05, 1]), aim([1.7, 3.5, -0.2], 9, under(0.32, 9, ODO_K), 0.62, [-0.25, -0.05, 1]))} />
      </>
    );
  }
  // Villa in Kampanien: sonnig (Gag-Kontrast), das Kind marschiert mit dem Geldsack los
  const w = ramp(frame, villa, duration, Easing.linear);
  return (
    <>
      <RomeAtmosphere phase="glory" frame={frame} />
      <Pavement size={120} />
      <RomanHouse position={[3.6, 0, -6]} w={6} h={3.2} d={4} floors={1} wall="#F4DCAA" gableRoof />
      <UmbrellaPine position={[-1.5, 0, -7]} height={5.5} />
      <UmbrellaPine position={[8, 0, -9]} height={6} />
      <Cypress position={[0.4, 0, -9]} height={5} />
      <Hills z={-60} />
      <group position={[lerp(-1.0, 1.4, w), 0, lerp(0.2, -0.6, w)]} rotation={[0, 0.9, 0]} scale={KID_SCALE}>
        <Hero frame={frame} kid wreath={false} walk={1.2} arms={[0.5, 0.9]} eyes="happy" mouth="grin" />
        <MoneyBag position={[0.9, 0.3, 0.3]} scale={0.9} />
      </group>
      <Shot frame={frame - villa} duration={duration - villa} {...move(aim([0.2, 1.8, -0.5], 7.5, 0.55, 0.5, [-0.2, 0.1, 1]), aim([1.0, 1.8, -0.8], 7, 0.55, 0.5, [-0.1, 0.1, 1]))} />
    </>
  );
};

/* 11 — deleted: Senat schickt die Insignien nach Osten, Stempel „DELETED“ */
export const Deleted: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const senate = Math.max(0, beat("senateScroll"));
  const stamp = beat("stamp");
  const ad = 52;
  const { shot, f } = cut(frame, [ad]);

  if (shot === 0) {
    const pan = ramp(frame, 0, senate + 14, Easing.inOut(Easing.cubic));
    return (
      <>
        <SenateSet frame={frame} />
        <Throne position={[-5, 0, -1.5]} />
        <group position={[-5, 1.62, -1.2]} scale={0.38} rotation={[1.2, 0, 0.2]}>
          <LaurelWreath y={0} />
        </group>
        <Block size={[3.2, 1.3, 1.4]} position={[0, 0.65, 0.4]} color={ROME.wood} ink={0.02} />
        <SignBoard lines={["TO THE EAST:", "ONE EMPEROR", "IS ENOUGH"]} post={false} position={[0, 1.36, 0.45]} rotation={[-Math.PI / 2 + 0.35, 0, 0]} width={1.8} height={1.1} />
        {[-1.4, 0, 1.4].map((x, i) => (
          <Senator
            key={x}
            frame={frame + i * 8}
            position={[x, 0, -0.7 - (i === 1 ? 0.4 : 0)]}
            rotation={[0, -x * 0.25, 0]}
            arms={[0.4, i === 1 ? 1.2 + Math.abs(Math.sin(frame * 0.4)) * 0.3 : 0.7]}
            eyes={i === 1 ? "dot" : "happy"}
            mouth={i === 1 ? "flat" : "smile"}
          />
        ))}
        <Shot frame={frame} duration={1} {...move(aim([lerp(-5, 0, pan), 3.05, -0.8], 12, under(0.42, 12)))} />
      </>
    );
  }
  // Stellenanzeige auf dem Tisch, Stempel holt aus (Antizipation) und knallt
  const a = anticipate(frame, stamp, 10);
  const y = lerp(1.35, 0.12, Math.max(0, Math.min(1, a))) + (a < 0 ? -a * 1.6 : 0);
  const hit = frame >= stamp;
  const j = jolt(frame, stamp, 0.18, 14);
  return (
    <>
      <Studio table />
      <SignBoard lines={["JOB:", "EMPEROR", "OF THE WEST"]} post={false} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} width={2.5} height={1.8} />
      {hit ? <StampMark text="DELETED" position={[0, 0.12, 0.1]} rotation={[-Math.PI / 2, 0, 0.18]} w={2.6} h={0.85} scale={1 + 0.3 * (1 - pop(frame, stamp, 9))} /> : null}
      {!hit || frame < stamp + 8 ? <RubberStamp position={[0.1, hit ? 0.12 + (frame - stamp) * 0.25 : y, 0.1]} rotation={[0, 0.18, 0]} scale={0.95} /> : null}
      <Burst frame={frame} start={stamp} origin={[0, 0.2, 0.1]} count={16} speed={0.12} gravity={0.004} size={0.1} colors={["#FFFFFF", "#D9C29A"]} seed={41} />
      <Shot frame={f} duration={duration - ad} {...jmove(move(aim([0, 0.4, 0.1], 6.2, 0.55, 0.5, [0, 1.3, 1]), aim([0, 0.4, 0.1], 5.7, 0.55, 0.5, [0, 1.3, 1])), j)} shake={0.02} />
    </>
  );
};

/* 12 — twist: Osten lebt weiter, bis 1453 */
export const Twist: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const glow = beat("eastGlow");
  const race = beat("steleRace");
  const eastEmp = 150;
  const label = beat("eastEmperor");
  const { shot, f } = cut(frame, [82, eastEmp]);

  if (shot === 0) {
    const fly = ramp(frame, 0, glow + 8, Easing.inOut(Easing.cubic));
    const g = ramp(frame, glow, glow + 14);
    return (
      <>
        <Studio table intensity={1.6} />
        <EmpireMap frame={frame} scale={1.2} split={1} westFall={1} labelScale={1.3} />
        <pointLight position={[3, 3, 1]} intensity={20 * g} distance={9} color="#FFC870" />
        <Glow position={[3.4, 0.6, 0]} radius={1.3} color="#FFB84D" intensity={g} />
        <group position={[-3.6, 0.32, 0.8]} rotation={[0, 1.2, 0]} scale={0.36}>
          <Hero frame={frame} arms={[0.4, 0.4]} eyes="wide" mouth="o" />
        </group>
        <Shot frame={frame} duration={1} {...move(aim([lerp(-3.0, 2.8, fly), 0.6, 0.2], lerp(8, 8.5, fly), 0.48, 0.5, [0, 1.0, 1]))} />
      </>
    );
  }
  if (shot === 1) {
    const at = 5 + ramp(frame, race, race + 14, Easing.out(Easing.back(1.3)));
    return (
      <>
        <Studio color="#3A2016" intensity={2.6} />
        <TimelineStele at={at} frame={frame} />
        <Burst frame={frame} start={race + 12} origin={[-0.95, 1.1, 0.4]} count={20} speed={0.1} gravity={0.002} size={0.12} colors={[ROME.gold, "#FFFFFF", ROME.purple]} seed={52} />
        <Shot frame={f} duration={eastEmp - 82} {...move(aim([0, 3.4, 0], 9.6, 0.5, 0.5, [0.25, 0.05, 1]), aim([0, 3.4, 0], 9, 0.5, 0.5, [0.05, 0.05, 1]))} punch={race - 82} />
      </>
    );
  }
  const happy = frame >= label;
  return (
    <>
      <RomeAtmosphere phase="glory" frame={frame} />
      <Pavement size={120} />
      <Throne position={[0, 0, -1]} cushion={ROME.purpleDark} />
      <Emperor frame={frame} position={[0, THRONE_SIT_Y, -0.7]} sit={1} arms={[0.5, happy ? 2.2 : 0.8]} eyes="happy" mouth="grin" bounce={happy ? 0.05 : 0} />
      <SpqrBanner frame={frame} position={[-2.8, 0, -2]} color={ROME.purple} />
      <SpqrBanner frame={frame + 12} position={[2.8, 0, -2]} color={ROME.purple} />
      <Rotunda position={[-6, 0, -18]} scale={2.2} />
      <Rotunda position={[7, 0, -22]} scale={1.6} />
      <RomanSkyline position={[0, 0, -26]} width={60} rows={2} seed={17} rotunda={false} />
      <Shot frame={f} duration={duration - eastEmp} {...move(aim([0, 3.71, -0.7], 11.5, under(0.42, 11.5)), aim([0, 3.71, -0.7], 10.5, under(0.42, 10.5)))} punch={label - eastEmp} />
    </>
  );
};

/* 13 — vote: YOU auf den Stufen des Kolosseums, A/B-Karten, Loop zurück zur Auktion */
export const Vote: React.FC = () => {
  const { frame, duration, beat } = useScene();
  const closer = beat("cardsClose");
  const shrug = beat("shrug");
  const rush = beat("loopRush");
  const { shot, f } = cut(frame, [closer, rush + 16]);

  if (shot <= 1) {
    const shrugT = frame >= shrug && frame < shrug + 30 ? Math.sin(((frame - shrug) / 30) * Math.PI) : 0;
    const lean = ramp(frame, rush, rush + 14);
    const seat = 1.0;
    return (
      <>
        <RomeAtmosphere phase="decline" frame={frame} />
        <Pavement size={140} />
        <Colosseum position={[2, 0, -24]} scale={2.4} rotation={[0, -0.35, 0]} detail="far" segments={24} />
        {[0, 1, 2].map((k) => (
          <Block key={k} size={[14, 0.5, 1.2]} position={[0, 0.25 + k * 0.5, -0.3 - k * 1.2]} color={ROME.sandLight} ink={0.015} />
        ))}
        <Hero
          frame={frame}
          position={[0, seat - 1.15, -0.3 + 0.25]}
          rotation={[0.25 * lean, 0, 0]}
          sit={1}
          arms={[lerp(0.6, 2.2, shrugT), lerp(0.6, 2.2, shrugT)]}
          eyes={lean > 0 ? "happy" : shrugT > 0.1 ? "dot" : "dot"}
          mouth={lean > 0 ? "grin" : shrugT > 0.1 ? "flat" : "smile"}
          brow={shrugT * -0.35}
          look={Math.sin(frame * 0.05) * 0.1}
        />
        <Coin position={[1.2, 1.06, 0.4]} rotation={[Math.PI / 2, 0, 0]} scale={0.6} />
        {shot === 0 ? (
          <Shot frame={f} duration={closer} {...move(aim([0, 2.9, -0.05], 16, 0.265, 0.5, [0.05, 0.12, 1]), aim([0, 2.9, -0.05], 15, 0.265, 0.5, [0, 0.12, 1]))} />
        ) : (
          <Shot frame={f} duration={rush + 16 - closer} {...move(aim([0, 2.9, -0.05], 12.5, 0.27, 0.5, [0, -0.08, 1]), aim([0, 2.9, -0.05], lerp(12, 9, lean), 0.27, 0.5, [0, -0.08, 1]))} />
        )}
      </>
    );
  }
  // Loop: Kamera rast zurück zur Auktionsbühne – Endbild = erstes Bild des Videos
  const t = ramp(frame, rush + 16, duration - 4, Easing.out(Easing.cubic));
  const from: V3 = [6, 9, 40];
  return (
    <>
      <AuctionStage frame={frame} sign={["EMPIRE", "FOR SALE"]} />
      <Shot
        frame={frame}
        duration={1}
        from={[lerp(from[0], HOOK_CAM.from[0], t), lerp(from[1], HOOK_CAM.from[1], t), lerp(from[2], HOOK_CAM.from[2], t)]}
        look={HOOK_CAM.look}
        fov={HOOK_CAM.fov}
        shake={0.02}
      />
    </>
  );
};

void Hills;
void RomanSkyline;
