import React from "react";
import { AbsoluteFill } from "remotion";
import { anticipate, hop } from "../kit/motion";
import {
  Belt,
  Bill,
  Bulb,
  CountHand,
  ease,
  Figure,
  frameOn,
  Gavel,
  GloveWipe,
  headY,
  HangingCoat,
  ImpactLines,
  LicenseCard,
  jolt,
  Label,
  Layer,
  lerp,
  PAPER,
  PaperFlower,
  PictureFrame,
  pop,
  RING,
  RING_TONES,
  ScoreCard,
  seeded,
  Sign,
  SpotCone,
  Stage2D,
  Stool,
} from "../kit2d";
import { shotIndex } from "../types";
import { FEET, SIL, useBeats } from "./tyson1";
import { Arena, CourtDrop, GymDrop, NightDrop, StadiumDrop, TokyoDrop } from "./tysonSets";

/**
 * „Mike Tyson“ Teil 2 (champion … ending). Gleiche Bildregeln wie tyson1.tsx.
 * Ernste Szenen (conviction, exodus) symbolisch: keine Tat, kein Opfer, kein Kind, kein Unfall im Bild.
 */

/** Handtuch über dem Seil in MIKEs Ecke (Erkennungsmerkmal in Kampf-Einstellungen). */
const RopeTowel: React.FC<{ readonly x: number; readonly f: number }> = ({ x, f }) => (
  <g filter="url(#paperSoft)">
    <path
      d={`M ${x - 40} ${RING.back - 168} L ${x + 40} ${RING.back - 168} L ${x + 36 + Math.sin(f * 0.07) * 4} ${RING.back - 40} L ${x - 44 + Math.sin(f * 0.07) * 4} ${RING.back - 44} Z`}
      fill={PAPER.towel}
      stroke={PAPER.ink}
      strokeWidth={5}
      strokeLinejoin="round"
    />
  </g>
);

/* ------------------------------------------------------------------ */

/** Champion: CUS geht – Mantel bleibt am Pfosten; „some say“; Handschuh-Wipe in Gold → jüngster Champion. */
export const Champion: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const loses = B("emptyCoat", 0.24);
  const some = W("Some", 0.33);
  const wipe = B("gloveWipe", 0.61);
  const belt = B("beltUp", 0.71);
  // drei ruhige Einstellungen; der Wechsel in die Gold-Arena ist eine weiche Überblendung (kein Wipe in der Szene)
  const shot = shotIndex(f, [some]);
  const mix = ease(f, wipe - 8, wipe + 12, "inOut");
  const pace = f < belt ? Math.sin((f - wipe) * 0.1) * 80 : 0;
  const gx = 540 + pace;
  const up = ease(f, belt - 6, belt + 14, "inOut");
  const hy = FEET + headY("adult");
  const camA =
    shot === 0
      ? frameOn(700, 800, 540, 880, lerp(1.0, 1.12, ease(f, 0, some, "inOut")))
      : frameOn(400, hy, 540, 790, lerp(1.22, 1.36, ease(f, some, wipe + 12, "inOut")));
  const camB = frameOn(540, lerp(700, 600, ease(f, wipe, d, "inOut")), 540, 860, lerp(1.0, 1.28, ease(f, wipe, d, "inOut")));
  const cloud = ease(f, some, some + 40, "inOut");
  const coatSwing = f >= loses ? Math.sin((f - loses) * 0.15) * 5 * Math.exp(-(f - loses) * 0.03) : 0;
  return (
    <AbsoluteFill>
      {mix < 1 ? (
        <Stage2D cam={camA} mood="night" noSky>
          <Layer>
            <Arena phase="warm" tone={RING_TONES.warm} f={f} lights={0.3} drop={<GymDrop down={1} tint={shot === 1 ? "#1A1420" : undefined} />} />
            <HangingCoat x={RING.rx + 6} y={RING.back - 300} s={0.8} swing={coatSwing} color={SIL.cus} />
            {f < loses + 14 ? <Figure x={760} y={FEET} s={1.05} frame={f} sil={SIL.cus} outfit="coat" coatColor={SIL.cus} o={1 - ease(f, loses - 12, loses + 12, "inOut")} armL={[40, 60]} /> : null}
            {/* dunkle Papierwolken an Fäden: „spätere Probleme“ (Spekulation) */}
            {shot === 1
              ? [180, 420, 660].map((cx, i) => (
                  <g key={cx} transform={`translate(${cx} ${lerp(-260, 330 + i * 30, cloud)})`} filter="url(#paper)">
                    <line x1={0} y1={-2000} x2={0} y2={-40} stroke="#0B0B0B" strokeWidth={4} />
                    <path d="M -120 40 Q -130 -30 -60 -30 Q -40 -80 20 -60 Q 90 -80 110 -10 Q 150 10 120 40 Z" fill="#3A3442" stroke={PAPER.ink} strokeWidth={6} />
                  </g>
                ))
              : null}
            <Figure
              x={400}
              y={FEET}
              s={1.0}
              frame={f}
              gloves
              armL={[20, 150]}
              armR={[20, 150]}
              headDown={ease(f, loses, loses + 16, "inOut") * 0.6}
              eyes={f > loses ? "down" : "open"}
              brows="sad"
              mouth={f > loses ? "frown" : "flat"}
              blinkSeed={3}
            />
          </Layer>
        </Stage2D>
      ) : null}
      {mix > 0 ? (
        <AbsoluteFill style={{ opacity: mix }}>
          <Stage2D cam={{ ...camB, y: camB.y + jolt(f, belt, 5) }} mood="night" noSky>
            <Layer>
              <Arena phase="gold" tone={RING_TONES.warm} f={f} flashes={0.6} lights={1} />
              <Figure
                x={gx}
                y={FEET}
                s={1.0}
                frame={f}
                towel="neck"
                pose={f < belt ? "walk" : "stand"}
                step={Math.sin((f - wipe) * 0.2)}
                armL={[lerp(14, 160, up), lerp(10, 178, up)]}
                armR={[lerp(14, 160, up), lerp(10, 178, up)]}
                eyes={f >= belt ? "up" : "open"}
                mouth={f >= belt ? "smile" : "grit"}
                brows={f >= belt ? "up" : "angry"}
                blinkSeed={3}
              />
              <Belt x={gx} y={lerp(1150, FEET - 676, up)} s={0.55} shine={Math.max(0, Math.sin(f * 0.15))} r={lerp(30, 0, up)} />
            </Layer>
          </Stage2D>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */

/** Douglas: Tokio 1990, gesichtslose Silhouette schlägt MIKE erstmals nieder, Gürtel rollt weg, Stille, zweiter Bilderrahmen. */
export const Douglas: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const down = B("knockdown", 0.37);
  const gone = B("beltRollsAway", 0.64);
  const sister = B("secondFrame", 0.89);
  // drei ruhige Einstellungen: beide Boxer (weit) → Niederschlag + Gürtel rollt (eine Einstellung) → Stille
  const c2 = down - 16;
  const c4 = W("That", 0.73);
  const shot = shotIndex(f, [c2, c4]);
  const mx = 720;
  const ox = 960;
  const fall = ease(f, down + 2, down + 28, "inOut");
  const land = hop(f, down + 28, 0, 1);
  const bounce = Math.sin(f * 0.2) * 6;
  const wind = anticipate(f, down, 20, 70, 100, { pre: 8, dur: 5 });
  const cam =
    shot === 0
      ? frameOn(840, 820, 540, 880, lerp(1.0, 1.1, ease(f, 0, c2, "inOut")))
      : shot === 1
        ? frameOn(lerp(520, 600, ease(f, gone - 10, c4, "inOut")), 1050, 540, 900, lerp(0.86, 0.92, ease(f, c2, c4, "inOut")))
        : frameOn(540, 760, 540, 860, lerp(1.08, 1.2, ease(f, c4, d, "inOut")));
  const quiet = shot === 2;
  const dropDown = quiet ? 1 - ease(f, c4, c4 + 14, "linear") : 1;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, down + 24, 9) }} mood="night" noSky>
      <Layer>
        <Arena phase="cool" tone={RING_TONES.cool} f={f} lights={quiet ? 0 : 0.6} drop={dropDown > 0 ? <TokyoDrop down={dropDown} /> : null} />
        {!quiet ? (
          <>
            <RopeTowel x={RING.lx + 60} f={f} />
            <Figure
              x={ox}
              y={FEET}
              s={1.0}
              frame={f}
              sil={SIL.opp}
              gloves
              flip
              armL={[20, 160]}
              armR={shot >= 1 ? [wind, wind + 10] : [20, 160]}
              lean={shot === 1 ? lerp(0, -6, ease(f, down - 4, down + 4)) : 0}
              step={bounce}
            />
            <Figure
              x={mx}
              y={FEET}
              s={1.0}
              frame={f}
              gloves
              lean={-88 * fall}
              squash={land.squash}
              armL={[20, lerp(150, 60, fall)]}
              armR={[20, lerp(150, 60, fall)]}
              eyes={fall > 0.2 ? "closed" : "open"}
              brows={fall > 0 ? "sad" : "angry"}
              mouth={fall > 0 ? "o" : "grit"}
              blinkSeed={3}
            />
            <ImpactLines x={mx - 20} y={FEET - 560} t={(f - down) / 10} s={0.9} />
            {shot === 1 && f > down + 26 && f < gone ? <CountHand x={1000} y={660} n={Math.min(5, 1 + Math.floor((f - down - 26) / 7))} s={0.8} /> : null}
            {/* Gürtel rollt aus dem Bild */}
            {shot === 1 && f >= gone - 4 ? <Belt x={lerp(830, 1560, ease(f, gone - 4, gone + 30, "linear"))} y={1170} s={0.4} r={(f - gone) * 10} /> : null}
          </>
        ) : (
          <>
            <Stool x={540} y={FEET + 4} s={1.1} />
            <Figure x={540} y={FEET} s={1.1} frame={f} pose="sit" towel="neck" headDown={0.9} eyes="down" brows="sad" mouth="frown" blinkSeed={3} />
            <g>
              <line x1={240} y1={-2000} x2={240} y2={570} stroke="#0B0B0B" strokeWidth={4} />
              <PictureFrame x={240} y={700} s={0.72} />
              <line x1={840} y1={-2000} x2={840} y2={570} stroke="#0B0B0B" strokeWidth={4} opacity={pop(f, sister, 10) > 0 ? 1 : 0} />
              <PictureFrame x={840} y={700 - (1 - Math.min(1, pop(f, sister, 12))) * 600} s={0.72} long o={f >= sister - 2 ? 1 : 0} />
            </g>
            <SpotCone x={540} y={FEET + 10} o={1} w={360} dim={0.45} color="#C9D6F0" />
          </>
        )}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Conviction: leerer Gerichtssaal, Hammer, Gitter-Schatten; der Balken LIFE HITS bewegt sich NICHT. */
export const Conviction: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const strike = W("rape", 0.25) - 2;
  const serves = W("serves", 0.33);
  const denies = W("denies", 0.57);
  const luck = B("barStill", 0.95);
  const thisW = W("This", 0.8);
  // drei ruhige Einstellungen: Saal + Hammer (weit) → MIKE nah mit Gitter-Schatten → Balken steht still
  const shot = shotIndex(f, [serves - 8, thisW]);
  const gr = anticipate(f, strike, -20, -62, 8, { pre: 7, dur: 5, over: 0.02 });
  const bars = ease(f, serves + 4, serves + 34, "inOut");
  const shake = f >= denies && f < denies + 40 ? Math.sin((f - denies) * 0.3) * 7 : 0;
  const hy = FEET + headY("adult");
  const cam =
    shot === 0
      ? frameOn(lerp(560, 660, ease(f, 0, serves, "inOut")), 790, 540, 870, lerp(1.0, 1.14, ease(f, 0, serves, "inOut")))
      : shot === 1
        ? frameOn(540, hy, 540, 790, lerp(1.28, 1.42, ease(f, serves - 8, thisW, "inOut")))
        : frameOn(540, 900, 540, 900, lerp(1.0, 1.1, ease(f, thisW, d, "inOut")));
  const ruled = shot === 2;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, strike + 1, 6) }} mood="night" noSky>
      <Layer>
        <Arena phase="grey" tone={RING_TONES.grey} f={f} lights={0.2} drop={<CourtDrop down={ease(f, -8, 14, "linear")} f={f} />} />
        {!ruled ? (
          <>
            <rect x={800} y={800} width={140} height={60} rx={8} fill="#4A4643" stroke={PAPER.ink} strokeWidth={5} />
            <Gavel x={700} y={760} r={gr} s={0.9} />
            <Figure
              x={540}
              y={FEET}
              s={1.0}
              frame={f}
              headDown={shot === 1 && f < denies ? 0.5 : 0}
              headTilt={shake}
              eyes={shot === 1 && f < denies ? "down" : "open"}
              brows="sad"
              mouth="flat"
              blinkSeed={3}
            />
            {/* Gitter-Schatten (Haftzeit) */}
            {bars > 0
              ? Array.from({ length: 9 }, (_, i) => (
                  <rect key={i} x={240 + i * 76} y={lerp(-1400, 380, bars)} width={30} height={900} fill="#000" opacity={0.42} />
                ))
              : null}
          </>
        ) : (
          <>
            <Figure x={540} y={FEET} s={0.95} frame={f} headDown={0.5} eyes="down" brows="sad" mouth="flat" blinkSeed={3} />
            {/* großer Balken LIFE HITS (vor MIKE): bleibt stehen */}
            <Label x={150} y={1022} size={54} anchor="start" color="#F4F4F4">
              LIFE HITS
            </Label>
            <g filter="url(#paper)">
              <rect x={150} y={1044} width={780} height={76} rx={38} fill="#1E1E1E" stroke={PAPER.ink} strokeWidth={8} />
              <rect x={158} y={1052} width={764 * 0.72} height={60} rx={30} fill="#FF5A5A" />
            </g>
            <line x1={158 + 764 * 0.72} y1={1026} x2={158 + 764 * 0.72} y2={1138} stroke="#F4F4F4" strokeWidth={8} strokeDasharray="12 10" />
          </>
        )}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Ear: Clinch, Biss als Comic-Symbol (kein Blut), Whip in den Ring bei Nacht: Geld fliegt, BANKRUPT 2003. */
export const Ear: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const ear = B("earPiece", 56);
  const money = B("moneyFly", 83);
  const lic = ear + 13;
  const shot = shotIndex(f, [25, ear, lic, money, 120]);
  const night = f >= money;
  const whipX = night ? (1 - ease(f, money, money + 6)) * 200 : 0;
  const ox = 660;
  const oy = FEET + headY("adult");
  const cam =
    shot === 0
      ? frameOn(570, 700, 540, 860, lerp(1.32, 1.42, ease(f, 0, 25)))
      : shot === 1
        ? frameOn(600, oy, 540, 830, lerp(2.0, 2.15, ease(f, 25, ear)))
        : shot === 2
          ? frameOn(600, oy + 40, 540, 850, lerp(1.6, 1.7, ease(f, ear, lic)))
          : shot === 3
            ? frameOn(560, 860, 540, 900, 1.0)
            : shot === 4
              ? frameOn(560 + whipX, 800, 540, 880, 1.0)
              : frameOn(560, 780, 540, 860, lerp(1.3, 1.4, ease(f, 120, 166)));
  const pieceT = f - ear;
  const bills = React.useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 16 }, () => ({ a: r() * Math.PI - Math.PI, v: 8 + r() * 10, s: 0.5 + r() * 0.5, d: Math.floor(r() * 20) }));
  }, []);
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, ear, 14) + jolt(f, lic + 6, 8) }} mood="night" noSky>
      <Layer>
        <Arena phase={night ? "black" : "red"} tone={night ? RING_TONES.dark : RING_TONES.warm} f={f} flashes={night ? 0 : 0.7} lights={night ? 0 : shot === 3 ? 0.2 : 0.6} drop={night ? <NightDrop down={1} /> : null} />
        {!night && shot !== 3 ? (
          <>
            <RopeTowel x={RING.lx + 60} f={f} />
            {/* Gegner (gesichtslos): nach dem Biss Handschuh ans Ohr auf MIKEs Seite */}
            <Figure
              x={ox}
              y={FEET}
              s={1.0}
              frame={f}
              sil={SIL.opp}
              gloves
              flip
              armL={[40, 120]}
              armR={f >= ear ? [110, 232] : [30, 130]}
              lean={f >= ear ? 7 : 0}
              headTilt={f >= ear ? -6 : 0}
            />
            <Figure x={470} y={FEET} s={1.0} frame={f} gloves armL={[40, 110]} armR={[60, 110]} lean={shot === 1 ? lerp(0, 9, ease(f, 25, ear)) : 4} brows="angry" mouth="grit" eyes="side" blinkSeed={3} />
            {pieceT >= 0 ? (
              <g>
                {/* Ohrstück als Comic-Symbol (kein Blut), schwebt langsam nach oben rechts */}
                <path
                  d="M 0 -14 Q 16 -12 14 6 Q 4 16 -8 10 Q -16 -2 0 -14 Z"
                  transform={`translate(${ox - 40 + pieceT * 4} ${oy - 70 - pieceT * 3}) rotate(${pieceT * 9}) scale(2.4)`}
                  fill="#9AA1AC"
                  stroke={PAPER.ink}
                  strokeWidth={2.5}
                />
                <ImpactLines x={ox - 62} y={oy + 6} t={pieceT / 14} s={0.7} />
              </g>
            ) : null}
          </>
        ) : null}
        {shot === 3 ? <LicenseCard x={560} y={860} s={1.2} r={-4} tear={ease(f, lic + 6, lic + 16)} /> : null}
        {night ? (
          <>
            <Stool x={420} y={FEET + 4} s={1.1} />
            <Figure x={420} y={FEET} s={1.1} frame={f} pose="sit" towel="neck" headDown={1} eyes="down" brows="sad" mouth="frown" blinkSeed={3} />
            {bills.map((b, i) => {
              const t = f - money - b.d;
              if (t < 0) return null;
              const x = 540 + Math.cos(b.a) * b.v * t * 1.6;
              const y = 950 + Math.sin(b.a) * b.v * t * 0.9 + t * t * 0.35;
              return <Bill key={i} x={x} y={Math.min(y, 1250)} r={t * 9 + i * 20} s={b.s} flipY={Math.cos(t * 0.25 + i)} />;
            })}
            <Sign x={760} y={lerp(-200, 960, ease(f, money + 6, money + 18))} s={0.6} r={-6 + Math.sin(f * 0.1) * 2} lines={["BANKRUPT", "2003"]} />
          </>
        ) : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Exodus: fast schwarz, ein warmes Licht, MIKE allein auf der Ringkante, eine Papierblume fällt. Kein Kind, kein Unfall. */
export const Exodus: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const flower = B("flowerFall", 141);
  const shot = shotIndex(f, [60, 125, flower - 2]);
  const sy = RING.front + 150;
  const hy = sy + headY("adult", true);
  const fl = ease(f, flower, flower + 38, "inOut");
  const cam =
    shot === 0
      ? frameOn(540, 1060, 540, 900, lerp(1.32, 1.42, ease(f, 0, 60)))
      : shot === 1
        ? frameOn(540, hy, 540, 800, lerp(1.5, 1.68, ease(f, 60, 125)))
        : shot === 2
          ? frameOn(540, hy + 10, 540, 800, lerp(2.3, 2.4, ease(f, 125, flower)))
          : frameOn(lerp(620, 700, fl), lerp(900, 1180, fl), 540, 860, 1.5);
  const motes = React.useMemo(() => {
    const r = seeded(8);
    return Array.from({ length: 24 }, () => ({ x: 300 + r() * 480, y: 500 + r() * 700, k: r() }));
  }, []);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <Arena phase="black" tone={RING_TONES.dark} f={f} lights={0} />
        <Bulb x={540} y={620} s={1.1} swing={Math.sin(f * 0.04) * 3} glow={0.9 + Math.sin(f * 0.13) * 0.05} />
        {motes.map((m, i) => (
          <circle key={i} cx={m.x + Math.sin(f * 0.02 + i) * 20} cy={m.y - ((f * (0.4 + m.k * 0.6)) % 200)} r={2.5} fill="#FFE2A8" opacity={0.35} />
        ))}
        <Figure x={540} y={sy} s={1.0} frame={f} pose="sit" towel="neck" headDown={0.95} eyes="down" brows="sad" mouth="frown" blinkSeed={3} breathe />
        {f >= flower - 2 ? <PaperFlower x={lerp(560, 720, fl) + Math.sin(f * 0.12) * 30 * (1 - fl)} y={lerp(600, RING.front - 20, fl)} s={0.75} r={lerp(-40, 80, fl) + Math.sin(f * 0.15) * 12 * (1 - fl)} /> : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Ending: Stadion 2024, älterer MIKE verliert; Karte: HARD rot, BLAMELESS „NO“; Karte dreht sich zum Zuschauer; Wipe zurück zum Hook. */
export const Ending: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const fight = 48;
  const loses = 88;
  const hard = B("scorecardHard", 127);
  const no = B("scorecardNo", 170);
  const turn = B("cardToCamera", 208);
  const loop = B("loopToRing", 230);
  const shot = shotIndex(f, [fight, loses, hard - 2, turn - 6, loop]);
  const back = f >= loop;
  const mx = 430;
  const ox = 690;
  const jab = Math.max(0, Math.sin(f * 0.35));
  const cam =
    shot === 0
      ? frameOn(560, 820, 540, 880, lerp(0.96, 1.04, ease(f, 0, fight)))
      : shot === 1
        ? frameOn(560, 680, 540, 840, lerp(1.4, 1.5, ease(f, fight, loses)))
        : shot === 2
          ? frameOn(560, 720, 540, 860, lerp(1.2, 1.28, ease(f, loses, hard)))
          : shot <= 4
            ? frameOn(560, 760, 540, 880, 0.9)
            : frameOn(820, FEET + headY("adult", true) * 1.1, 540, 830, 1.32);
  const flipT = ease(f, turn - 4, turn + 8, "inOut");
  const cardTurn = Math.cos(flipT * Math.PI);
  const front = cardTurn >= 0;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        {!back ? (
          <>
            <Arena phase="dim" tone={RING_TONES.cool} f={f} lights={0.3} flashes={shot <= 2 ? 0.5 : 0} drop={<StadiumDrop down={ease(f, -4, 18, "linear")} f={f} />} />
            <RopeTowel x={RING.lx + 60} f={f} />
            <Figure
              x={ox}
              y={FEET}
              s={1.0}
              frame={f}
              sil="#8A909A"
              gloves
              flip
              armL={shot === 2 ? [160, 175] : [20, 160]}
              armR={shot === 1 ? [lerp(30, 90, jab), lerp(150, 90, jab)] : [20, 150]}
              step={Math.sin(f * 0.3) * 6}
            />
            <Figure
              x={mx}
              y={FEET}
              s={1.0}
              frame={f}
              grey
              towel="neck"
              gloves
              armL={shot === 2 ? [10, 10] : [20, 150]}
              armR={shot === 2 ? [10, 10] : [24, 150]}
              headDown={shot === 1 && f < denies ? 0.5 : 0}
              eyes={shot === 1 && f < denies ? "down" : "open"}
              brows={shot === 2 ? "sad" : "angry"}
              mouth={shot === 2 ? "flat" : "grit"}
              blinkSeed={3}
            />
            <SpotCone x={560} y={FEET + 10} o={1} w={520} dim={shot >= 3 ? 0.62 : 0.35} />
          </>
        ) : (
          <>
            <Arena phase="warm" tone={RING_TONES.warm} f={f} lights={0.5} />
            <Stool x={820} y={FEET + 4} s={1.1} />
            <Figure x={820} y={FEET} s={1.1} frame={f} pose="sit" towel="neck" headDown={1} eyes="down" brows="sad" blinkSeed={3} />
            <SpotCone x={820} y={FEET + 10} o={1} w={330} dim={0.5} />
          </>
        )}
      </Layer>
      {shot === 3 || shot === 4 ? (
        <Layer depth={0}>
          {front ? (
            <ScoreCard
              x={540}
              y={lerp(1500, 820, ease(f, hard - 4, hard + 8))}
              s={1.0}
              turn={Math.max(0.02, cardTurn)}
              rowH={110}
              w={900}
              title="SCORE IT"
              rows={[
                { label: "HARD?", fill: ease(f, hard, hard + 10), mark: f >= hard + 6 ? "BRUTALLY" : undefined, markColor: PAPER.paper },
                { label: "BLAMELESS?", fill: ease(f, no, no + 8), color: "#8A8F98", mark: f >= no ? "NO" : undefined },
              ]}
            />
          ) : (
            <ScoreCard x={540} y={820} s={1.0} turn={Math.max(0.02, -cardTurn)} rowH={110} w={900} title="YOU SCORE IT" rows={[{ label: "" }, { label: "" }]} pen={Math.sin(f * 0.6)} />
          )}
        </Layer>
      ) : null}
      <Layer depth={0}>
        <GloveWipe local={f - loop} color={PAPER.gold} />
      </Layer>
    </Stage2D>
  );
};
