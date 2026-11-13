import React from "react";
import { camPath, ease, frameOn, jolt, Layer, lerp, LuxDefs, pop, Scale, seeded, Spotlight, Stage2D } from "../kit2d";
import { shotIndex } from "../types";
import { TopShade } from "./huangSets";
import { CoverScene, PHOTO_CAM } from "./lucia1";
import {
  BankFront,
  CaseFile,
  Cash,
  CoffeeRing,
  Confetti,
  Convertible,
  CoverArt,
  Crack,
  DateSheet,
  Desk,
  EyeMark,
  GoldSeal,
  LC,
  LT,
  MoneyBag,
  Pad,
  PageFlip,
  Palm,
  Pin,
  Polaroid,
  PrisonWall,
  Stamp,
  StateMap,
  Sunset,
  Tick,
  Toon,
  toonHand,
  toonHeadY,
} from "./luciaSets";
import { useBeats } from "./rollsSets";

/**
 * „Who is Lucia from GTA 6?“ Teil 2 (jason … loop). Gleiche Regeln wie lucia1.tsx.
 * Loop: Endbild = Akten-Foto bildfüllend = Cover → Satz 1 „Lucia did time.“
 */

/** Brustbild in einem Polaroid (Kopf bei y ≈ −40). */
const Bust: React.FC<{ readonly who: "lucia" | "jason"; readonly f: number; readonly s?: number; readonly mouth?: "smile" | "smirk" | "flat"; readonly look?: number }> = ({ who, f, s = 0.9, mouth = "smirk", look = 0 }) => (
  <Toon x={0} y={-40 - toonHeadY(who) * s} s={s} frame={f} who={who} mouth={mouth} look={look} blinkSeed={who === "jason" ? 11 : 7} breathe={false} />
);

/* ------------------------------------------------------------------ */

/** Jason: Cabrio hält vorm Tor, JASON (pink) lehnt dort, Lucia kommt raus; Pinnwand mit roter Schnur (CRIMINAL COUPLE); Cabrio im Abendrot (Tracking + Parallax). */
export const Jason: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const jason = B("jasonAtGate", 0.12);
  const couple = B("redStringCouple", 0.53);
  const florida = B("convertibleSunset", 0.8);
  const and = W("And", 0.39);
  const think = W("Think", 0.67);
  const walks = W("walks", 0.25);
  const shot = shotIndex(f, [and, think]);
  const floor = 1300;
  if (shot === 0) {
    const arrive = ease(f, 0, jason - 2, "inOut");
    const carX = lerp(1700, 860, arrive);
    const lWalk = ease(f, walks - 30, walks + 10, "linear");
    const walking = lWalk > 0 && lWalk < 1;
    const cam = frameOn(lerp(560, 600, ease(f, 0, and, "inOut")), 1000, 540, 980, lerp(0.86, 0.92, ease(f, 0, and, "inOut")));
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer depth={0.6}>
          <Sunset id="jason0" f={f} horizon={floor - 30} sunX={1150} sunR={220} red={0.25} sea={false} w={2200} />
          <Palm x={1500} y={floor - 20} s={0.7} lean={-6} color="#3A1238" />
        </Layer>
        <Layer>
          <rect x={-2000} y={floor} width={6000} height={2000} fill="#3A1E30" />
          <PrisonWall gx={120} floor={floor} open={1} f={f} light={0.6} />
          <Convertible x={carX} y={floor} s={0.95} wheel={-(1 - arrive) * 900} />
          <Toon
            x={carX - 250}
            y={floor}
            s={0.93 * (f >= jason && f < jason + 10 ? 1 - 0.05 * Math.sin(((f - jason) / 10) * Math.PI) : 1)}
            o={ease(f, jason - 8, jason)}
            frame={f}
            who="jason"
            armL={[30, 128]}
            armR={[30, 128]}
            mouth="smirk"
            look={-1}
            lean={-4}
            blinkSeed={11}
          />
          <Toon
            x={lerp(120, 360, lWalk)}
            y={floor}
            s={1.0}
            frame={f}
            walk={walking}
            step={walking ? Math.sin(f * 0.32) : 0}
            look={1}
            mouth={lWalk >= 1 ? "smile" : "flat"}
            brows={lWalk >= 1 ? "up" : "neutral"}
            blinkSeed={5}
          />
        </Layer>
        <Layer depth={0}>
          <PageFlip t={1 + ease(f, 0, 14, "inOut")} title="CASE FILE: LUCIA" big="2" />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const cam = frameOn(540, 900, 540, 900, lerp(1.0, 1.08, ease(f, and, think, "inOut")));
    const str = ease(f, couple - 14, couple, "inOut");
    const p1 = [340, 690] as const;
    const p2 = [760, 720] as const;
    const mid = [550, 820] as const;
    const heart = pop(f, couple, 10);
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <rect x={-2000} y={-2000} width={5080} height={5920} fill={LC.cork} />
          {Array.from({ length: 160 }, (_, i) => {
            const r = seeded(500 + i);
            return <circle key={i} cx={r() * 1400 - 160} cy={r() * 1600 + 160} r={3 + r() * 4} fill="#8E6236" opacity={0.5} />;
          })}
          <Polaroid x={340} y={900} r={-5} name="LUCIA" color={LC.teal} id="pl">
            <Bust who="lucia" f={f} look={0.6} />
          </Polaroid>
          <Polaroid x={760} y={930} r={5} s={0.92} name="JASON" color={LC.pink} id="pj">
            <Bust who="jason" f={f} look={-0.6} s={0.86} />
          </Polaroid>
          <path
            d={`M ${p1[0]} ${p1[1]} Q ${mid[0]} ${mid[1]} ${p2[0]} ${p2[1]}`}
            stroke={LC.red}
            strokeWidth={9}
            fill="none"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - str}
            strokeLinecap="round"
          />
          <Pin x={p1[0]} y={p1[1]} />
          <Pin x={p2[0]} y={p2[1]} />
          {heart > 0 ? (
            <path
              transform={`translate(550 ${760 + 8 * Math.sin(f * 0.15)}) scale(${1.1 * heart})`}
              d="M 0 30 C -60 -10 -40 -60 0 -36 C 40 -60 60 -10 0 30 Z"
              fill={LC.red}
              stroke={LC.ink}
              strokeWidth={5}
            />
          ) : null}
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const run = f - think;
  const carX = 300 + run * 9;
  const cam = { x: carX + 80, y: lerp(1000, 980, ease(f, florida, florida + 20)), zoom: lerp(0.9, 0.96, ease(f, think, d, "inOut")) };
  const wheel = run * 14;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer depth={0.15}>
        <Sunset id="jason2" f={f} horizon={1180} sunX={carX + 160} sunR={260 * (1 + 0.04 * ease(f, florida, florida + 14))} red={0.1} sea w={2000} />
      </Layer>
      <Layer depth={0.55}>
        {Array.from({ length: 8 }, (_, i) => (
          <Palm key={i} x={-200 + i * 520} y={1200} s={0.55 + (i % 3) * 0.08} lean={(i % 2 ? 1 : -1) * 8} color="#2A0F35" sway={2 * Math.sin(f * 0.08 + i)} />
        ))}
      </Layer>
      <Layer>
        <rect x={-3000} y={1210} width={9000} height={400} fill="#4A2440" />
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={-400 + i * 260} y={1252} width={130} height={10} fill="#F2C14E" opacity={0.6} />
        ))}
        <Convertible x={carX} y={1290} s={0.9} wheel={wheel}>
          <Toon x={-80} y={10} s={0.5} frame={f} sil="#24102C" armR={[150, 10]} />
          <Toon x={90} y={10} s={0.48} frame={f} who="jason" sil="#24102C" />
        </Convertible>
      </Layer>
      <Layer depth={1.7}>
        {Array.from({ length: 6 }, (_, i) => (
          <Palm key={i} x={600 + i * 1100} y={2050} s={1.3} lean={6} color="#12060F" />
        ))}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Heist: Bank (eigene Fassade), maskierte Silhouetten; „wrong“ → Alarm, Sack reißt; Karte LEONIDA mit Fäden + Augen; Spotlight Rücken an Rücken. */
export const Heist: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const wrong = B("alarmMoneyBurst", 0.16);
  const consp = B("stateMapStrings", 0.47);
  const other = B("backToBack", 0.86);
  const they = W("They", 0.29);
  const now = W("Now", 0.69);
  const shot = shotIndex(f, [they, now]);
  const floor = 1300;
  if (shot === 0) {
    const cam = frameOn(540, 1000, 540, 980, lerp(0.9, 0.97, ease(f, 0, they, "inOut")));
    const alarm = ease(f, wrong, wrong + 4);
    const lx = lerp(430, 360, ease(f, 0, wrong, "inOut"));
    const armR = [lerp(30, 70, ease(f, wrong, wrong + 6)), 20] as const;
    const hand = toonHand(1, armR);
    const bx = lx + hand[0] + 40;
    const by = floor + hand[1] + 60;
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, wrong, 14) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <rect x={-2000} y={-2000} width={5080} height={2000 + floor} fill="#2A1E3E" />
          <rect x={-2000} y={floor} width={5080} height={2000} fill="#2B2433" />
          <BankFront x={540} floor={floor} alarm={alarm} f={f} />
          <Toon x={lx} y={floor} s={1.0} frame={f} outfit="heist" mask armR={armR} armL={[20, 30]} eyes={f >= wrong ? "wide" : "open"} look={0.6} blinkSeed={5} />
          <Toon x={760} y={floor} s={0.94} frame={f} who="jason" outfit="heist" mask armL={[40, 20]} armR={[20, 30]} eyes={f >= wrong ? "wide" : "open"} look={-0.6} blinkSeed={11} />
          <MoneyBag x={bx} y={by} s={0.8} rip={f >= wrong ? 1 : 0} r={8 * Math.sin(f * 0.2)} />
          {f >= wrong
            ? Array.from({ length: 16 }, (_, i) => {
                const r = seeded(70 + i);
                const t = (f - wrong) / 30;
                const vx = (r() - 0.5) * 900;
                const vy = -500 - r() * 600;
                return <Cash key={i} x={bx + vx * t} y={by + vy * t + 900 * t * t} r={t * (200 + r() * 300)} s={0.8} />;
              })
            : null}
        </Layer>
        <Layer depth={0}>
          <rect x={0} y={0} width={1080} height={1920} fill={LC.red} opacity={alarm * (0.1 + 0.08 * Math.sin(f * 0.5))} />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const cam = frameOn(540, 900, 540, 900, lerp(1.25, 0.98, ease(f, they, consp + 20, "inOut")));
    const pins: readonly (readonly [number, number])[] = [
      [400, 640],
      [700, 610],
      [520, 820],
      [740, 860],
      [620, 1040],
      [700, 1240],
      [430, 720],
      [800, 1000],
    ];
    const hub = [600, 880] as const;
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <rect x={-2000} y={-2000} width={5080} height={5920} fill="#3A2A22" />
          <StateMap x={560} y={900} s={1.05} />
          {pins.map(([px, py], i) => {
            const t = ease(f, they + i * 5, they + i * 5 + 14, "inOut");
            return (
              <path
                key={i}
                d={`M ${hub[0]} ${hub[1]} L ${lerp(hub[0], px, t)} ${lerp(hub[1], py, t)}`}
                stroke={LC.red}
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}
          {pins.map(([px, py], i) => (f >= they + i * 5 + 12 ? <Pin key={i} x={px} y={py} /> : null))}
          <Pin x={hub[0]} y={hub[1]} color={LC.yellow} />
          {pins.map(([px, py], i) => {
            const at = consp + i * 4;
            const blink = (f + i * 13) % 70 < 3;
            return <EyeMark key={`e${i}`} x={px + (i % 2 ? 60 : -60)} y={py - 50} s={0.75 * pop(f, at, 9)} look={Math.sin(f * 0.05 + i)} blink={blink} />;
          })}
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const close = ease(f, other - 10, other + 2, "inOut");
  const cam = frameOn(540, 1000, 540, 960, lerp(0.95, 1.05, ease(f, now, d, "inOut")));
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="#1A1424" />
        <rect x={-2000} y={floor} width={5080} height={2000} fill="#120E1A" />
        {Array.from({ length: 12 }, (_, i) => {
          const r = seeded(900 + i);
          const blink = (f + i * 17) % 80 < 3;
          const ex = i % 2 ? 80 + r() * 200 : 800 + r() * 200;
          return <EyeMark key={i} x={ex} y={520 + r() * 640} s={0.55 * pop(f, now + i * 3, 9)} look={i % 2 ? 1 : -1} blink={blink} />;
        })}
        <Spotlight x={540} y={floor} o={ease(f, now, now + 10)} w={340} />
        <Toon x={lerp(380, 465, close)} y={floor} s={1.0} frame={f} look={-1} brows="angry" mouth="grit" armL={[30, 140]} armR={[30, 140]} blinkSeed={5} />
        <Toon x={lerp(720, 625, close)} y={floor} s={0.95} frame={f} who="jason" look={1} brows="angry" mouth="grit" armL={[30, 140]} armR={[30, 140]} blinkSeed={11} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** First: goldene Seite SERIES RECORD, graue leere Rahmen, Lucias Foto + Siegel FIRST; Formular: OPTIONAL wird durchgestrichen. */
export const First: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const first = B("goldSealFirst", 0.09);
  const opt = B("optionalCrossed", 0.78);
  const female = W("female", 0.55);
  const shot = shotIndex(f, [female]);
  if (shot === 0) {
    const cam = frameOn(540, 920, 540, 930, lerp(0.98, 1.08, ease(f, 0, female, "inOut")));
    const slide = ease(f, first - 12, first + 2, "inOut");
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <defs>
            <linearGradient id="gold-page" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B8862A" />
              <stop offset="1" stopColor="#F2C14E" />
            </linearGradient>
          </defs>
          <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#gold-page)" />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M 540 980 L ${540 + Math.cos(i * 0.39 + f * 0.004) * 2000} ${980 + Math.sin(i * 0.39 + f * 0.004) * 2000}`} stroke="#FFE7A0" strokeWidth={60} opacity={0.12} />
          ))}
          <LT x={540} y={660} size={46} spacing={10} fill="#5A3A0A">
            SERIES RECORD
          </LT>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${140 + i * 200} 745) scale(0.7)`} opacity={0.75}>
              <rect x={-70} y={-90} width={140} height={170} fill="#A8A4AE" stroke={LC.ink} strokeWidth={5} />
              <circle cx={0} cy={-25} r={32} fill="#8E8A96" />
              <path d="M -50 80 Q 0 10 50 80 Z" fill="#8E8A96" />
            </g>
          ))}
          <Polaroid x={540} y={lerp(1700, 1060, slide)} r={lerp(8, -3, slide)} s={1.0} name="LUCIA" color={LC.teal} id="first">
            <Bust who="lucia" f={f} mouth="smile" />
          </Polaroid>
          <GoldSeal x={705} y={900} s={0.66} t={ease(f, first + 2, first + 10)} />
        </Layer>
      </Stage2D>
    );
  }
  const cam = frameOn(560, 960, 540, 950, lerp(1.0, 1.06, ease(f, female, d, "inOut")));
  const cross = ease(f, opt, opt + 8, "linear");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="#2B5C63" />
        <g filter="url(#paper)" transform="rotate(2 640 930)">
          <rect x={330} y={620} width={680} height={640} fill={LC.paper} stroke={LC.ink} strokeWidth={6} />
        </g>
        <g transform="rotate(2 640 930)">
          <LT x={670} y={700} size={36} spacing={6} fill="#9A3A2E">
            LEAD CHARACTER
          </LT>
          <LT x={670} y={800} size={78} fill={LC.tealDark}>
            LUCIA
          </LT>
          {[
            { y: 960, label: "PLAYABLE LEAD", tick: 1 },
            { y: 1110, label: "OPTIONAL", tick: 0 },
          ].map((row) => (
            <g key={row.label}>
              <rect x={390} y={row.y - 50} width={70} height={70} rx={8} fill="#FFFFFF" stroke={LC.ink} strokeWidth={6} />
              {row.tick ? <Tick x={425} y={row.y - 15} s={1.1} t={ease(f, female + 4, female + 14)} /> : null}
              <LT x={490} y={row.y + 6} size={50} anchor="start" fill={row.tick ? LC.ink : "#55525F"}>
                {row.label}
              </LT>
            </g>
          ))}
          <path d={`M 480 1094 L ${480 + 300 * cross} ${1094 - 12 * cross}`} stroke={LC.red} strokeWidth={16} strokeLinecap="round" />
          {f >= opt + 6 ? <Stamp x={860} y={1180} text="NO" t={ease(f, opt + 6, opt + 12)} r={-12} size={60} /> : null}
        </g>
        <Toon x={180} y={1290} s={0.82} frame={f} armL={[30, 128]} armR={[30, 128]} mouth="smirk" look={1} brows={f >= opt ? "up" : "neutral"} blinkSeed={4} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Flawed: Profil-Seite, Stempel TOUGH / VULNERABLE (Riss) / FLAWED (Kaffeefleck); dann Waage RIGHT/WRONG kippt neben Lucia. */
export const Flawed: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const tough = B("stampTough", 0.22);
  const flawed = B("stampFlawed", 0.5);
  const wrong = B("scaleTilt", 0.76);
  const vul = W("vulnerable", 0.43);
  const right = W("right", 0.63);
  const shot = shotIndex(f, [right]);
  if (shot === 0) {
    const cam = frameOn(540, 940, 540, 930, lerp(0.98, 1.05, ease(f, 0, right, "inOut")));
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, tough, 6) + jolt(f, flawed, 6) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Desk id="flawed" f={f} />
          <g filter="url(#paper)">
            <rect x={110} y={580} width={860} height={760} fill={LC.paper} stroke={LC.ink} strokeWidth={6} transform="rotate(-1 540 960)" />
          </g>
          <LT x={170} y={660} size={40} anchor="start" spacing={8} fill="#9A3A2E">
            PROFILE
          </LT>
          <Polaroid x={360} y={900} s={0.82} r={-3} name="LUCIA" color={LC.teal} id="flawed">
            <Bust who="lucia" f={f} mouth="flat" />
          </Polaroid>
          <Crack x={330} y={850} s={0.75} t={ease(f, vul, vul + 8)} />
          <CoffeeRing x={790} y={760} s={0.9} t={ease(f, flawed, flawed + 8)} />
          <Stamp x={760} y={720} text="TOUGH" t={ease(f, tough, tough + 7)} r={8} size={56} color="#2B5C63" />
          <Stamp x={730} y={930} text="VULNERABLE" t={ease(f, vul, vul + 7)} r={-6} size={44} color="#6B4AA0" />
          <Stamp x={700} y={1150} text="FLAWED" t={ease(f, flawed, flawed + 7)} r={5} size={60} color={LC.red} />
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const tilt = f < wrong ? -14 * ease(f, right, right + 10) : lerp(-14, 16, ease(f, wrong, wrong + 10)) + 3 * Math.sin((f - wrong) * 0.3) * Math.max(0, 1 - (f - wrong) / 30);
  const cam = frameOn(540, 1000, 540, 960, lerp(0.92, 0.98, ease(f, right, d, "inOut")));
  const card = (text: string, color: string) => (
    <g transform="translate(0 -40)">
      <rect x={-110} y={-44} width={220} height={70} rx={10} fill={LC.paper} stroke={LC.ink} strokeWidth={5} />
      <LT x={0} y={6} size={40} fill={color}>
        {text}
      </LT>
    </g>
  );
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="#4A2A5A" />
        <rect x={-2000} y={1290} width={5080} height={2000} fill="#2E1A3A" />
        <BlindLightRect f={f} />
        <Scale x={730} y={1290} s={0.82} tilt={tilt} left={card("RIGHT", LC.tealDark)} right={card("WRONG", LC.red)} />
        <Toon
          x={310}
          y={1290}
          s={1.0}
          frame={f}
          armL={[lerp(12, 50, ease(f, wrong, wrong + 8)), lerp(8, -70, ease(f, wrong, wrong + 8))]}
          armR={[lerp(12, 50, ease(f, wrong, wrong + 8)), lerp(8, -70, ease(f, wrong, wrong + 8))]}
          look={1}
          mouth={f >= wrong ? "smirk" : "flat"}
          brows={f >= wrong ? "up" : "neutral"}
          headTilt={f >= wrong ? 6 : 0}
          blinkSeed={3}
        />
      </Layer>
    </Stage2D>
  );
};

const BlindLightRect: React.FC<{ readonly f: number }> = ({ f }) => (
  <g opacity={0.14} transform={`translate(-300 ${200 + 6 * Math.sin(f * 0.03)}) skewX(-28)`}>
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={0} y={i * 110} width={1800} height={50} fill="#FF9E6B" />
    ))}
  </g>
);

/* ------------------------------------------------------------------ */

/** Play: Akte dreht sich um → eigener Controller + PLAYABLE, Konfetti; ab „Jason“ Auswahlkarten (Overlay). */
export const Play: React.FC = () => {
  const { f, d, B } = useBeats();
  const you = B("fileFlipController", 0.23);
  const flip = ease(f, you - 6, you + 10, "inOut");
  const sx = Math.cos(flip * Math.PI);
  const back = sx < 0;
  const cam = frameOn(540, 940, 540, 940, lerp(0.95, 1.04, ease(f, 0, d, "inOut")));
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <defs>
          <radialGradient id="play-bg" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#3A2A5A" />
            <stop offset="1" stopColor="#140C22" />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#play-bg)" />
        <g transform={`translate(540 960) scale(${Math.max(0.02, Math.abs(sx))} 1) rotate(${back ? 0 : -2})`}>
          <g filter="url(#paper)">
            <rect x={-360} y={-440} width={720} height={880} rx={10} fill={back ? "#2B2236" : LC.manila} stroke={LC.ink} strokeWidth={8} />
          </g>
          {back ? (
            <g>
              <Pad x={0} y={-60} s={0.95} f={f} />
              <LT x={0} y={240} size={78} fill={LC.teal} spacing={6}>
                PLAYABLE
              </LT>
            </g>
          ) : (
            <g>
              <LT x={0} y={-300} size={48} spacing={8} fill="#6B4A1E">
                CASE FILE
              </LT>
              <LT x={0} y={20} size={110} fill="#6B4A1E">
                LUCIA
              </LT>
            </g>
          )}
        </g>
      </Layer>
      <Layer depth={0}>
        <Confetti t={f - you} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Loop: Kalender NOV 19 (2026); „Yes, after two delays“ → Blätter 2025 + MAY 26, 2026 durchgestrichen + DELAYED; „meet“ → Kamera fährt zurück ins Akten-Foto = Cover. */
export const Loop: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const nov = B("calendarNov19", 0.12);
  const delays = B("delayedStamps", 0.38);
  const meet = B("loopToCover", 0.75);
  const yes = W("Yes", 0.28);
  const so = W("So", 0.54);
  const shot = shotIndex(f, [so]);
  if (shot === 0) {
    const cam = frameOn(540, 940, 540, 940, lerp(0.98, 1.04, ease(f, 0, so, "inOut")));
    const s1 = ease(f, yes, yes + 12, "inOut");
    const s2 = ease(f, yes + 12, yes + 24, "inOut");
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, nov, 8) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Desk id="loop" f={f} />
          <DateSheet x={540} y={1020} s={1.0 * (f >= nov ? 1 + 0.08 * Math.max(0, 1 - Math.abs(f - nov - 4) / 6) : 1)} big={f >= nov ? "NOV 19" : "???"} sub="2026" head="RELEASE" color={LC.teal} />
          {s1 > 0 ? (
            <g>
              <DateSheet x={lerp(-300, 230, s1)} y={720} s={0.6} r={lerp(-40, -10, s1)} big="2025" head="WINDOW" cross={ease(f, yes + 12, yes + 20)} />
              <Stamp x={230} y={800} text="DELAYED" t={ease(f, yes + 20, yes + 26)} r={-14} size={44} />
            </g>
          ) : null}
          {s2 > 0 ? (
            <g>
              <DateSheet x={lerp(1400, 850, s2)} y={720} s={0.6} r={lerp(40, 9, s2)} big="MAY 26" sub="2026" head="DATE" cross={ease(f, delays - 8, delays)} />
              <Stamp x={850} y={800} text="DELAYED" t={ease(f, delays, delays + 6)} r={10} size={44} />
            </g>
          ) : null}
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const arrive = Math.min(d - 4, meet + 22);
  if (f >= arrive) return <CoverScene f={f} />;
  const cam = camPath(f, [
    [so, frameOn(540, 860, 540, 920, 0.95)],
    [meet - 6, frameOn(540, 800, 540, 920, 1.12)],
    [arrive, PHOTO_CAM],
  ]);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Desk id="cover" f={f} />
        <CaseFile f={f} clipId="clip-cover" photo={<CoverArt f={f} />} />
      </Layer>
    </Stage2D>
  );
};

