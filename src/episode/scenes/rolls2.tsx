import React from "react";
import {
  bump,
  CalendarPage,
  clamp01,
  Dude,
  dudeShoulder,
  ease,
  FONT,
  frameOn,
  GasPump,
  handOf,
  HeldItem,
  jolt,
  Layer,
  lerp,
  LUX,
  LuxCar,
  LuxDefs,
  pop,
  RibbonOrnament,
  Sparkle,
  Spotlight,
  Stage2D,
  Stamp,
  ThoughtBubble,
  TrunkHole,
  WagonOutline,
  ZigzagArrow,
} from "../kit2d";
import { shotIndex } from "../types";
import {
  Cloth,
  FactoryPark,
  Glitch,
  GoldStage,
  Highway,
  LivingRoom,
  Lawn,
  MathScribbles,
  Rewind,
  ROOM,
  SofaFront,
  SofaSeat,
  SunsetRoad,
  TwistCard,
  useBeats,
} from "./rollsSets";

/**
 * „How to become a Rolls-Royce driver in 1 minute“ Teil 2 (hood … ending). Regeln wie Teil 1 (rolls1.tsx).
 * Kühlerfigur = nur abstraktes Stoffband auf Sockel (keine Figur). Twist-Szenen: Glitch-Rot + Karte dreht sich.
 */

/* ------------------------------------------------------------------ */

/** Hood: Coupé im Abendlicht, Kamera fährt an die Haube; YOU zeigt („WINGS?“) → Stoffband flattert („ROBES“), YOU tut wissend. */
export const Hood: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const hood = W("hood", 0.4);
  const wings = W("wings", 0.58);
  const robes = B("robesFlutter", 0.85);
  const push = ease(f, 6, hood + 12, "inOut");
  const orn = { x: 220, y: 1063 };
  const wide = frameOn(470, 1000, 540, 960, 0.84);
  const close = frameOn(orn.x, orn.y, 640, 980, lerp(1.4, 1.48, ease(f, hood + 12, d, "inOut")));
  const cam = { x: lerp(wide.x, close.x, push), y: lerp(wide.y, close.y, push), zoom: wide.zoom * Math.pow(close.zoom / wide.zoom, push) };
  const point = ease(f, wings - 6, wings + 6, "inOut");
  const know = ease(f, robes + 4, robes + 14, "inOut");
  const flutter = ease(f, robes - 4, robes + 10, "inOut");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <SunsetRoad />
        <LuxCar x={620} y={1250} s={1} kind="coupe" flip body="#2E3F6E" top="#1C2440" glint={ease(f, hood, hood + 30, "linear")} />
        <g transform={`translate(${orn.x} ${orn.y}) scale(-1 1)`}>
          <RibbonOrnament x={0} y={0} s={0.9} frame={f} flutter={flutter} />
        </g>
        {flutter > 0
          ? [0, 1, 2].map((i) => {
              const k = ((f * 0.06 + i * 0.33) % 1 + 1) % 1;
              return <path key={i} d={`M ${orn.x + 60 + k * 300} ${orn.y - 150 + i * 40} l 90 0`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={flutter * (1 - k)} />;
            })
          : null}
        <Dude
          x={100}
          y={1250}
          s={0.75}
          frame={f}
          armA={know > 0 ? [lerp(10, 22, know), lerp(8, -110, know)] : [10, 8]}
          armB={know > 0 ? [lerp(96, 22, know), lerp(-6, -110, know)] : [lerp(10, 96, point), lerp(8, -6, point)]}
          shades={1}
          mouth={f >= robes + 4 ? "smirk" : f >= wings ? "grin" : "smile"}
          brows={f >= robes + 4 ? "one" : f >= wings ? "up" : "neutral"}
          nod={f >= robes + 4 ? 6 * Math.sin(clamp01((f - robes - 4) / 20) * Math.PI) : 0}
          gaze={0.6}
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Suite: SUV-Heck öffnet sich; Gedankenblase Tailgate-Party (Plastikstühle, Kühlbox, Grill) platzt → Leder-Sitze fahren aus, Champagner. */
export const Suite: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const trunk = W("trunk", 0.23);
  const tail = B("tailgateBubble", 0.34);
  const nah = W("Nah", 0.52);
  const suite = B("seatsDeploy", 0.66);
  const shot = shotIndex(f, [nah]);
  const carX = 860;
  const hatch = ease(f, trunk - 4, trunk + 14, "inOut");
  const deploy = ease(f, suite - 4, suite + 16, "inOut");
  const cam =
    shot === 0
      ? frameOn(680, 960, 540, 960, lerp(0.84, 0.87, ease(f, 0, nah, "inOut")))
      : frameOn(380, 1000, 540, 1000, lerp(1.22, 1.3, ease(f, nah, d, "inOut")));
  const seat = (x: number, k: number) => (
    <g transform={`translate(${lerp(carX - 380, x, k)} 1180)`} filter="url(#sticker)" opacity={k > 0.02 ? 1 : 0}>
      <path d="M -40 0 L -10 -90 M 40 0 L 10 -90" stroke={LUX.ink} strokeWidth={8} />
      <rect x={-56} y={-118} width={112} height={34} rx={10} fill={LUX.leather} stroke={LUX.ink} strokeWidth={6} />
      <rect x={-50} y={-250} width={30} height={140} rx={10} fill={LUX.leather} stroke={LUX.ink} strokeWidth={6} transform={`rotate(${-8 * k} -35 -118)`} />
    </g>
  );
  const glass = ease(f, suite + 4, suite + 12);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Lawn f={f} />
        <LuxCar x={carX} y={1180} s={0.9} kind="suv" body="#5A2234" top="#E8DCC0" hatch={hatch} />
        <TrunkHole x={carX} y={1180} s={0.9} o={hatch} sparkle={bump(f, suite + 14, 8)} />
        {deploy > 0 ? (
          <>
            {seat(250, deploy)}
            {seat(410, ease(f, suite + 2, suite + 18, "inOut"))}
            <g transform={`translate(330 ${1180})`} opacity={ease(f, suite + 8, suite + 14)} filter="url(#sticker)">
              <rect x={-6} y={-110} width={12} height={110} fill={LUX.wood} />
              <ellipse cx={0} cy={-112} rx={60} ry={12} fill={LUX.wood} stroke={LUX.ink} strokeWidth={5} />
              <HeldItem kind="glass" x={20} y={-104} frame={f} />
            </g>
          </>
        ) : null}
        <Dude
          x={200}
          y={1185}
          s={0.86}
          frame={f}
          armA={[10, 8]}
          armB={glass > 0 ? [lerp(10, 34, glass), lerp(8, 96, glass)] : f >= tail && f < nah ? [30, 120] : [10, 8]}
          holdB={glass > 0.5 ? "glass" : "none"}
          shades={1}
          mouth={f >= suite ? "grin" : f >= nah ? "o" : f >= tail ? "smile" : "flat"}
          brows={f >= nah && f < suite ? "up" : "neutral"}
          gaze={0.7}
          blinkSeed={8}
        />
        {f >= tail - 2 ? (
          <ThoughtBubble x={420} y={700} s={0.78 * Math.min(1, pop(f, tail - 2, 10))} burst={ease(f, nah, nah + 10, "linear")} tailX={-300} tailY={160}>
            {/* Tailgate-Party: Plastikstühle, Kühlbox, Grill (eigene Mini-Zeichnungen) */}
            <g transform="translate(-140 40)">
              <path d="M -40 40 L -30 -10 L 30 -10 L 40 40 M -30 -10 L -34 -70 L 30 -70 L 30 -10" stroke={LUX.ink} strokeWidth={8} fill="none" />
              <rect x={-34} y={-70} width={64} height={60} fill="#F4F4F4" opacity={0.9} />
            </g>
            <g transform="translate(0 50)">
              <rect x={-60} y={-60} width={120} height={90} rx={10} fill="#3C7DD9" stroke={LUX.ink} strokeWidth={6} />
              <rect x={-60} y={-60} width={120} height={26} rx={8} fill="#F4F4F4" stroke={LUX.ink} strokeWidth={6} />
            </g>
            <g transform="translate(150 40)">
              <path d="M -60 -40 Q 0 30 60 -40 Z" fill="#2A2A2A" stroke={LUX.ink} strokeWidth={6} />
              <path d="M -30 0 L -46 50 M 30 0 L 46 50 M 0 4 L 0 50" stroke={LUX.ink} strokeWidth={6} />
              <path d="M -20 -60 Q -10 -80 -20 -100 M 10 -60 Q 20 -80 10 -100" stroke="#9A9AA6" strokeWidth={5} fill="none" />
            </g>
          </ThoughtBubble>
        ) : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** BMW: YOU posiert mit Teetasse vor der Fabrik („GOODWOOD, ENGLAND“) → Glitch-Rot, Karte PLOT TWIST #1 dreht sich: „BMW AG · SINCE 2003“ → Brezel statt Tee. */
export const Bmw: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const icon = W("icon", 0.24);
  const plot = B("recordScratch", 0.41);
  const bmw = W("BMW", 0.55);
  const bav = W("Bavaria", 0.87);
  const shot = shotIndex(f, [plot]);
  const yx = 170;
  const ys = 0.9;
  const fy = 1170;
  const armB: [number, number] = [40, 118];
  const cam =
    shot === 0
      ? frameOn(560, 960, 540, 960, lerp(1.0, 1.05, ease(f, 0, plot, "inOut")))
      : frameOn(150, 900, 760, 1000, lerp(1.2, 1.26, ease(f, plot, d, "inOut")));
  const glitch = Math.max(bump(f, plot + 3, 10), 0.3 * ease(f, plot, plot + 6) * (1 - ease(f, bmw + 4, bmw + 16)));
  const drop = ease(f, plot, plot + 12, "inOut");
  const flip = ease(f, bmw - 6, bmw + 6, "inOut");
  const hand = handOf(1, armB, dudeShoulder(false));
  const cupT = clamp01((f - bav) / 22);
  const cupX = yx + hand.hx * ys + cupT * 140;
  const cupY = fy + hand.hy * ys + cupT * cupT * 520;
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, plot, 12) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <FactoryPark />
        <LuxCar x={660} y={1165} s={0.82} kind="sedan" body="#1E3A2E" top="#E8E4DA" glint={ease(f, icon, icon + 30, "linear")} />
        <Dude
          x={yx}
          y={fy}
          s={ys}
          frame={f}
          armA={[34, -128]}
          armB={armB}
          holdB={f >= bav ? "pretzel" : "tea"}
          shades={1}
          squash={1 - bump(f, plot + 2, 6) * 0.06}
          mouth={f >= bav ? "grin" : f >= plot ? "o" : "smirk"}
          brows={f >= bav ? "one" : f >= plot ? "up" : "neutral"}
          nod={f < plot ? -5 : 0}
          blinkSeed={9}
        />
        {f >= bav && cupT < 1 ? (
          <g transform={`rotate(${cupT * 160} ${cupX} ${cupY})`}>
            <HeldItem kind="tea" x={cupX} y={cupY} frame={f} />
          </g>
        ) : null}
      </Layer>
      {shot === 1 ? (
        <Layer depth={0}>
          <Glitch k={glitch} f={f} />
          <TwistCard
            x={330}
            y={lerp(-400, 880, drop)}
            n={1}
            flip={flip}
            s={0.84}
            r={lerp(-14, -4, drop)}
            back={
              <>
                <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={LUX.ink}>
                  OWNED BY
                </text>
                <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={104} fill="#1C3D8F">
                  BMW
                </text>
                <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#1C3D8F">
                  AG
                </text>
                <Stamp x={0} y={180} text="SINCE 2003" t={ease(f, bmw + 6, bmw + 12, "linear")} r={-8} size={44} />
              </>
            }
          />
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Wagon: SUV auf dem US-Highway → Glitch, Karte #2 „STATION WAGON“, Kombi-Umriss legt sich darüber → Zapfsäule frisst Münzen, Brille ab. */
export const Wagon: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const twist = B("recordScratch", 0.42);
  const classified = W("classified", 0.53);
  const wag = B("wagonStamp", 0.66);
  const gas = W("Gas", 0.74);
  const exempt = W("exempt", 0.92);
  const shot = shotIndex(f, [twist, gas]);
  if (shot < 2) {
    const slow = shot === 0 ? 1 : 1 - 0.7 * ease(f, twist, twist + 20);
    const scroll = shot === 0 ? f * 14 : twist * 14 + (f - twist) * 14 * slow;
    const cam =
      shot === 0
        ? frameOn(540, 980, 540, 960, lerp(0.98, 1.03, ease(f, 0, twist, "inOut")))
        : frameOn(560, 1000, 540, 1040, lerp(1.05, 1.1, ease(f, twist, gas, "inOut")));
    const bob = Math.sin(f * 0.5) * 3;
    const flip = ease(f, classified - 6, classified + 6, "inOut");
    const outline = ease(f, wag - 4, wag + 10, "inOut");
    const glitch = shot === 1 ? Math.max(bump(f, twist + 3, 10), 0.3 * ease(f, twist, twist + 6) * (1 - ease(f, classified, classified + 12))) : 0;
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, twist, 12) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Highway scroll={scroll} />
          <g transform={`translate(0 ${bob})`}>
            <LuxCar x={540} y={1150} s={0.85} kind="suv" body="#1F2A44" top="#C9CED8" driver spin={scroll * 0.8} />
          </g>
          {outline > 0 ? <WagonOutline x={540} y={1150 + bob} s={0.85} t={outline} /> : null}
          <Stamp x={560} y={1010} text="STATION WAGON" t={ease(f, wag, wag + 6, "linear")} r={-8} size={64} />
        </Layer>
        {shot === 1 ? (
          <Layer depth={0}>
            <Glitch k={glitch} f={f} />
            <TwistCard
              x={850}
              y={lerp(-400, 700, ease(f, twist, twist + 12, "inOut"))}
              n={2}
              flip={flip}
              s={0.55}
              r={lerp(14, 6, ease(f, twist, twist + 12))}
              back={
                <>
                  <text x={0} y={-130} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={LUX.ink}>
                    US CLASS:
                  </text>
                  <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#8A5A34">
                    STATION
                  </text>
                  <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#8A5A34">
                    WAGON
                  </text>
                </>
              }
            />
          </Layer>
        ) : null}
      </Stage2D>
    );
  }
  const cam = frameOn(520, 980, 540, 960, lerp(1.04, 1.1, ease(f, gas, d, "inOut")));
  const off = ease(f, exempt - 4, exempt + 10, "inOut");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Highway scroll={gas * 14} />
        <LuxCar x={1180} y={1150} s={0.8} kind="suv" body="#1F2A44" top="#C9CED8" />
        <GasPump x={300} y={1165} s={0.95} frame={f} eat={ease(f, gas, d, "linear")} />
        <Dude
          x={730}
          y={1172}
          s={0.86}
          frame={f}
          armA={[10, 8]}
          armB={off > 0 ? [lerp(10, 40, off), lerp(8, 140, off)] : [10, 8]}
          shades={1 - off}
          eyes={f >= exempt ? "half" : "open"}
          mouth={f >= exempt ? "frown" : "o"}
          brows={f >= exempt ? "sad" : "up"}
          gaze={-0.8}
          blinkSeed={1}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Ending: Enthüllung Sweptail (Spotlicht, Tuch fliegt) → Zickzack-Pfeil, Kalenderblätter → YOU mit Taschenrechner (Mathe-Kritzel) → Rückspulen aufs Sofa (Loop). */
export const Ending: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const custom = W("custom", 0.13);
  const mil = B("stonksArrow", 0.34);
  const build = B("calendarFly", 0.47);
  const you = W("You", 0.56);
  const minute = W("minute", 0.62);
  const math = B("mathConfusion", 0.74);
  const back = B("rewindToCouch", 0.91);
  const shot = shotIndex(f, [you, back]);
  if (shot === 0) {
    const cam = frameOn(540, 940, 540, 960, lerp(1.0, 1.05, ease(f, 0, you, "inOut")));
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <GoldStage f={f} />
          <Spotlight x={520} y={1150} o={1 - 0.5 * ease(f, mil, mil + 10)} w={560} />
          <LuxCar x={520} y={1140} s={0.85} kind="sweptail" body="#2E3F6E" top="#D9CDB4" glint={ease(f, custom + 10, custom + 40, "linear")} />
          <Cloth x={520} y={1140} s={0.85} off={ease(f, custom - 2, custom + 16, "inOut")} />
          {f >= custom + 8 ? <Sparkle x={250} y={930} s={0.8 * bump(f, custom + 16, 10)} /> : null}
          {f >= custom + 8 ? <Sparkle x={820} y={980} s={0.7 * bump(f, custom + 22, 10)} /> : null}
          <Dude
            x={935}
            y={1160}
            s={0.72}
            frame={f}
            armA={[10, 8]}
            armB={f >= mil ? [140, 10] : [10, 8]}
            shades={1}
            mouth={f >= custom + 6 ? "o" : "smile"}
            brows={f >= custom + 6 ? "up" : "neutral"}
            gaze={-0.8}
            blinkSeed={4}
          />
        </Layer>
        <Layer depth={0}>
          {f >= mil - 2 ? <ZigzagArrow x={300} y={1180} s={1} t={ease(f, mil - 2, mil + 14, "inOut")} /> : null}
          {[0, 1, 2, 3].map((i) => {
            const t = (f - build - i * 5) / 34;
            if (t <= 0 || t >= 1) return null;
            return <CalendarPage key={i} x={lerp(-120, 1200, t)} y={760 + i * 34 - Math.sin(t * Math.PI) * 90} r={-20 + t * 60 + i * 9} s={0.8} label={`YR ${i + 1}`} />;
          })}
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const cam = frameOn(540, 990, 540, 900, lerp(1.18, 1.26, ease(f, you, back, "inOut")));
    const shrink = ease(f, math - 2, math + 12, "inOut");
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <GoldStage f={f} />
          <rect x={-2000} y={-2000} width={6000} height={6000} fill="#3A3D48" opacity={0.55 + 0.25 * bump(f, math, 6)} />
          {/* Ab „mathing“ liegt die Auswahlkarte (y 594–1266) im Bild → YOU klein ins freie Band y ≈ 400–594 */}
          <Dude
            x={540}
            y={lerp(1500, 742, shrink)}
            s={lerp(1, 0.3, shrink)}
            frame={f}
            armA={[20, 70]}
            armB={[22, -118]}
            holdB="calc"
            shades={1}
            mouth={f >= math ? "frown" : f >= minute ? "o" : "flat"}
            brows={f >= math ? "one" : f >= minute ? "up" : "neutral"}
            nod={Math.sin(f * 0.15) * 4}
            blinkSeed={2}
          />
          <g opacity={1 - ease(f, math, math + 8)}>
            <MathScribbles x={540} y={990} t={ease(f, you + 4, math, "linear")} f={f} />
          </g>
        </Layer>
      </Stage2D>
    );
  }
  const k = 1 - ease(f, back + 4, d, "inOut");
  const cam = frameOn(560, 900, 540, 960, 1.0);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + Math.sin(f * 1.7) * 10 * k }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <LivingRoom f={f} />
        <SofaSeat />
        <Dude x={ROOM.sofaX} y={ROOM.floor + 10} frame={f} pose="sit" armA={[14, -96]} armB={[40, 30]} holdA="noodles" mouth="flat" gaze={0.4} blinkSeed={4} />
        <SofaFront />
      </Layer>
      <Layer depth={0}>
        <Rewind k={k} f={f} />
      </Layer>
    </Stage2D>
  );
};
