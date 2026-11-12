import React from "react";
import {
  bump,
  CalendarPage,
  clamp01,
  Dude,
  ease,
  FONT,
  frameOn,
  jolt,
  Layer,
  lerp,
  LUX,
  LuxCar,
  LuxDefs,
  pop,
  Stage2D,
  Stamp,
  StarField,
  Tag,
} from "../kit2d";
import { shotIndex } from "../types";
import {
  CashRain,
  CheckBurst,
  Cabin,
  Crown,
  DealSign,
  Envelope,
  LivingRoom,
  ROOM,
  Rope,
  SeatBack,
  Showroom,
  SofaFront,
  SofaSeat,
  StarterPack,
  StitchPanel,
  Suit,
  ThreadMap,
  Turntable,
  TwistCard,
  useBeats,
  VelvetHall,
  Wash,
} from "./rollsSets";

/**
 * „How to become a Rolls-Royce driver in 1 minute“ Teil 1 (hook … stars). 2D-Sticker/Paper-Cut (Drehbuch `style`).
 * Ruhiges Bildtempo (Nutzer 12.11.2026): je Szene 1–3 Einstellungen à ≈ 2,5–4,5 s, Kamera nur weich (`inOut`),
 * Pointen über Timing der Requisiten (Stempel, Schild, Karte) statt über Schnitte.
 * YOU = limettengrüner Hoodie, ab „rich“ Papp-Sonnenbrille. Autos = eigene Formen ohne Emblem/Grill/Kühlerfigur.
 */

/* ------------------------------------------------------------------ */

/** Hook: Sofa + Cup-Nudeln, Limousine im Fenster. „rich“ → Haken + Geldregen + Goldlicht; „Cool“ → Brille + Nicken; „Go“ → Startpistole. */
export const Hook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const rich = W("rich", 0.18);
  const check = B("checkStamp", 0.44);
  const cool = W("Cool", 0.5);
  // Startschuss auf „1 minute“ (Cue/Knall dort, ruhiger Abstand zum Szenenende)
  const go = B("startPistol", 0.75);
  const minute = W("driver", 0.66);
  const shot = shotIndex(f, [cool]);
  const sx = ROOM.sofaX;
  const fy = ROOM.floor + 10;
  const headY = fy - 430;
  const cam =
    shot === 0
      ? frameOn(560, 900, 540, 960, lerp(1.0, 1.07, ease(f, 0, cool, "inOut")))
      : frameOn(sx + 30, headY, 540, lerp(880, 900, ease(f, cool, d, "inOut")), lerp(1.42, 1.55, ease(f, cool, d, "inOut")));
  const shades = ease(f, cool - 2, cool + 10, "inOut");
  const nod = 7 * Math.sin(clamp01((f - cool - 10) / 22) * Math.PI * 2);
  const raise = ease(f, minute - 8, minute + 6, "inOut");
  const rich1 = f >= rich;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <LivingRoom f={f} gold={ease(f, rich, rich + 12) * (1 - 0.4 * ease(f, rich + 40, rich + 80))} />
        <SofaSeat />
        <Dude
          x={sx}
          y={fy}
          frame={f}
          pose="sit"
          armA={[14, -96]}
          armB={raise > 0 ? [lerp(40, 152, raise), lerp(30, 14, raise)] : [40, 30]}
          holdA="noodles"
          holdB={raise > 0.3 ? "pistol" : "none"}
          bang={pop(f, go, 8)}
          eyes={rich1 ? (f < rich + 26 ? "wide" : "open") : "open"}
          mouth={f >= go ? "grin" : rich1 ? (f < cool ? "o" : "smirk") : "flat"}
          brows={rich1 && f < cool ? "up" : "neutral"}
          shades={shades}
          nod={nod}
          gaze={shot === 0 ? 0.4 : 0}
          blinkSeed={4}
        />
        <SofaFront />
      </Layer>
      <Layer depth={0}>
        <CashRain t={f - rich} />
        <CheckBurst x={shot === 0 ? 870 : 880} y={shot === 0 ? 1010 : 1060} t={ease(f, check, check + 10)} s={0.9} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Pick: Drehbühne Phantom (Flaggschiff, Krone) → Schwenk zum Ghost mit Supermarkt-Schild → Starter-Pack-Raster. */
export const Pick: React.FC = () => {
  const { f, B, W } = useBeats();
  const ride = W("ride", 0.15);
  const flag = W("flagship", 0.33);
  const entry = B("entryLevelSign", 0.52);
  const its = W("It's", 0.78);
  const pack = B("starterPack", 0.92);
  const pan = ease(f, entry - 2, entry + 16, "inOut");
  const gx = 1720;
  const cam = frameOn(lerp(540, gx + 40, pan), 930, 540, 960, lerp(lerp(0.96, 1.02, ease(f, 0, entry, "inOut")), 1.04, pan));
  const spin = Math.cos(ease(f, ride, ride + 36, "inOut") * Math.PI * 2);
  const grid = ease(f, Math.min(its, pack), Math.min(its, pack) + 24, "inOut") * 0.96;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Showroom f={f} />
        <Turntable x={540} y={1120} w={980} f={f} />
        <LuxCar x={540} y={1110} s={0.95} kind="sedan" body="#2D2A4A" top="#E8DCC0" turn={spin} glint={ease(f, flag, flag + 24, "linear")} />
        {f >= flag ? <Crown x={420} y={760} s={pop(f, flag, 10)} r={-12} /> : null}
        <Turntable x={gx - 60} y={1120} w={820} f={f} />
        <LuxCar x={gx - 60} y={1110} s={0.78} kind="sedan" body="#3B4A6B" top="#D9DDE6" />
        <Tag x={gx - 230} y={1190} text="GHOST" s={0.85} r={-3} />
        <DealSign x={gx - 80} y={760} t={pop(f, entry, 10)} f={f} />
        <Dude
          x={gx + 300}
          y={1190}
          s={0.82}
          frame={f}
          armA={[10, 8]}
          armB={f >= entry ? [lerp(10, 62, ease(f, entry, entry + 10)), 70] : [10, 8]}
          holdA="noodles"
          shades={1}
          brows={f >= entry ? "one" : "neutral"}
          mouth={f >= entry ? "smirk" : "smile"}
          gaze={-0.6}
          blinkSeed={6}
        />
      </Layer>
      <Layer depth={0}>
        <StarterPack x={540} y={910} t={grid} f={f} s={1.02} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Wait: Schlange an der Samtkordel, YOU ganz hinten; Umschlag „INVITE ONLY?“ → Stempel UNCONFIRMED, fällt. Dann SUV, Käufer-Schlange, SOLD OUT. */
export const Wait: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const waitB = W("wait", 0.12);
  const invite = B("goldEnvelope", 0.28);
  const unconf = B("rumorStamp", 0.41);
  const inB = W("In", 0.5);
  const cull = B("soldOutSign", 0.79);
  const shot = shotIndex(f, [inB]);
  if (shot === 0) {
    const cam = frameOn(lerp(470, 610, ease(f, 0, inB, "inOut")), 920, 540, 960, 1.06);
    // Umschlag: flattert von rechts oben herein, Stempel, fällt um
    const fl = ease(f, invite - 10, invite + 14, "inOut");
    const fall = ease(f, unconf + 14, unconf + 34, "inOut");
    const ex = lerp(1200, 760, fl) + Math.sin(f * 0.18) * 16 * (1 - fall);
    const ey = lerp(380, 690, fl) + fall * 470;
    const er = lerp(-30, -6, fl) + Math.sin(f * 0.2) * 6 * (1 - fall) + fall * 80;
    const clock = ease(f, waitB, inB, "linear");
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <VelvetHall />
          {/* Wanduhr: Zeiger rasen ab „wait“ */}
          <g transform="translate(120 640)" filter="url(#sticker)">
            <circle r={78} fill={LUX.paper} stroke={LUX.ink} strokeWidth={8} />
            <path d={`M 0 0 L 0 -58`} transform={`rotate(${clock * 2160})`} stroke={LUX.ink} strokeWidth={8} strokeLinecap="round" />
            <path d={`M 0 0 L 0 -38`} transform={`rotate(${clock * 180})`} stroke={LUX.red} strokeWidth={10} strokeLinecap="round" />
          </g>
          {[60, 230, 400, 570].map((x, i) => (
            <Suit key={x} x={x} y={1180} s={0.78} f={f} seed={i} color={["#2B2B3A", "#33304A", "#2A3540", "#3A2B30"][i]} />
          ))}
          <Dude
            x={830}
            y={1185}
            s={0.82}
            frame={f}
            armA={[14, -96]}
            armB={[10, 8]}
            holdA="noodles"
            shades={1}
            mouth={f >= unconf + 14 ? "flat" : f >= invite ? "o" : "flat"}
            brows={f >= invite && f < unconf + 14 ? "up" : "neutral"}
            gaze={f >= invite ? -0.3 : -0.8}
            nod={f >= invite && f < unconf ? -6 : 0}
            blinkSeed={2}
          />
          <Rope x0={-120} x1={1180} y={1290} n={4} sway={Math.sin(f * 0.1) * 8} />
          {f >= invite - 10 ? (
            <g>
              <Envelope x={ex} y={ey} r={er} s={1.05} />
              <g transform={`translate(${ex} ${ey}) rotate(${er})`}>
                <Stamp x={0} y={-10} text="RUMOR" t={ease(f, unconf, unconf + 6, "linear")} r={-14} size={64} />
              </g>
            </g>
          ) : null}
        </Layer>
      </Stage2D>
    );
  }
  const cam = frameOn(lerp(540, 560, ease(f, inB, d, "inOut")), lerp(960, 930, ease(f, inB, d, "inOut")), 540, 960, lerp(1.0, 1.08, ease(f, inB, d, "inOut")));
  const drop = ease(f, cull - 2, cull + 10, "inOut");
  const sold = f >= cull - 2;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, cull + 10, 8) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <VelvetHall floor={1080} />
        <LuxCar x={560} y={1070} s={0.82} kind="suv" body="#1F2A44" top="#C9CED8" glint={ease(f, inB, inB + 30, "linear")} />
        <Tag x={790} y={700} text="CULLINAN" s={0.85} r={4} />
        {sold ? (
          <g transform={`translate(560 ${lerp(-200, 840, drop)}) rotate(${-8 + Math.sin(clamp01((f - cull - 10) / 20) * Math.PI * 3) * 4 * (1 - clamp01((f - cull - 10) / 30))})`} filter="url(#sticker)">
            <path d="M -140 -120 L -110 -60 M 140 -120 L 110 -60" stroke={LUX.ink} strokeWidth={5} />
            <rect x={-250} y={-62} width={500} height={124} rx={18} fill={LUX.red} stroke={LUX.ink} strokeWidth={8} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={LUX.white} letterSpacing={3}>
              SOLD OUT
            </text>
          </g>
        ) : null}
        {[90, 260, 430, 600].map((x, i) => (
          <Suit key={x} x={x} y={1260} s={0.7} f={f} seed={i + 3} color={["#2B2B3A", "#33304A", "#2A3540", "#3A2B30"][i]} />
        ))}
        <Tag x={340} y={1030} text="ESTABLISHED BUYERS" s={0.72} r={-2} />
        <CalendarPage x={140} y={680} r={-8} s={pop(f, inB + 4, 10)} label="2019" />
        <Dude
          x={930}
          y={1262}
          s={0.78}
          frame={f}
          armA={[14, -96]}
          armB={[10, 8]}
          holdA="noodles"
          shades={1}
          mouth={f >= cull + 6 ? "frown" : "flat"}
          brows={f >= cull + 6 ? "sad" : "neutral"}
          gaze={-0.7}
          blinkSeed={2}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Stitch: YOU sinkt in den Ledersitz → Meme-Karte (schwarz) „Rolls-Royce:“ + Nadel/Zähler → Faden über Karte → Standbild + 2 verdeckte Twist-Karten. */
export const Stitch: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const sit = W("sit", 0.12);
  const nobody = B("nobodyMeme", 0.18);
  const rr = W("Rolls-Royce", 0.28);
  const mil = B("needleCounter", 0.39);
  const over = W("Over", 0.57);
  const still = B("freezeTwistCards", 0.77);
  const shot = shotIndex(f, [nobody, over, still]);

  if (shot === 0 || shot === 3) {
    // Sitz-Einstellung; in Einstellung 3 friert YOU ein (Standbild) und zwei Karten legen sich ins Bild
    const ff = shot === 3 ? still : f;
    const drop = ease(f, sit - 8, sit + 8, "inOut");
    const bounce = Math.sin(clamp01((f - sit - 6) / 12) * Math.PI) * (1 - clamp01((f - sit - 6) / 12));
    const cam =
      shot === 0
        ? frameOn(540, 980, 540, 960, lerp(1.0, 1.08, ease(f, 0, nobody, "inOut")))
        : frameOn(540, 1000, 540, 1000, lerp(1.08, 1.13, ease(f, still, d, "inOut")));
    const slide = (k: number) => ease(f, still + 4 + k * 6, still + 18 + k * 6, "inOut");
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Cabin />
          <SeatBack x={540} y={1250} s={1.1} sink={bounce} />
          <Dude
            x={540}
            y={lerp(1110, 1250, drop) + bounce * 14}
            frame={ff}
            pose="sit"
            squash={1 - bounce * 0.08}
            armA={[48, 30]}
            armB={[48, 30]}
            shades={1}
            mouth={shot === 3 ? "o" : f >= sit + 8 ? "grin" : "smile"}
            brows={shot === 3 ? "up" : "neutral"}
            blinkSeed={5}
          />
        </Layer>
        {shot === 3 ? (
          <Layer depth={0}>
            <rect x={0} y={0} width={1080} height={1920} fill="#1A1630" opacity={0.28 * ease(f, still, still + 6)} />
            <rect x={24} y={24} width={1032} height={1872} fill="none" stroke="#FFFFFF" strokeWidth={14} opacity={bump(f, still + 3, 8)} />
            <TwistCard x={lerp(-300, 255, slide(0))} y={860} n={1} flip={0} s={0.6} r={-8} />
            <TwistCard x={lerp(1380, 825, slide(1))} y={860} n={2} flip={0} s={0.6} r={8} />
          </Layer>
        ) : null}
      </Stage2D>
    );
  }
  if (shot === 1) {
    const count = Math.round(2200000 * ease(f, mil, mil + 22, "smooth"));
    return (
      <Stage2D cam={frameOn(540, 960, 540, 960, 1)} mood="night" noSky>
        <LuxDefs />
        <Layer depth={0}>
          <Wash id="meme" a="#141218" b="#1E1A24" />
          <rect x={40} y={560} width={1000} height={720} rx={18} fill="#000000" stroke="#FFFFFF" strokeWidth={6} />
          {/* Meme-Layout von Anfang an gefüllt: „nobody:“ (leer) / „Rolls-Royce:“ + Nadel (Regie-Kritik: kein leeres Schwarzbild) */}
          <text x={90} y={650} fontFamily={FONT} fontWeight={900} fontSize={64} fill="#FFFFFF" opacity={ease(f, nobody, nobody + 5)}>
            nobody:
          </text>
          {f >= rr ? (
            <text x={90} y={745} fontFamily={FONT} fontWeight={900} fontSize={72} fill="#FFFFFF" opacity={ease(f, rr, rr + 5)}>
              Rolls-Royce:
            </text>
          ) : null}
          {f >= rr ? (
            <g opacity={ease(f, rr, rr + 8)}>
              <StitchPanel x={540} y={985} w={940} t={ease(f, rr, over, "linear")} f={f} />
              {f >= mil - 2 ? (
                <text x={540} y={1250} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={LUX.gold} stroke={LUX.ink} strokeWidth={10} paintOrder="stroke">
                  {count.toLocaleString("en-US")}
                </text>
              ) : null}
            </g>
          ) : null}
        </Layer>
      </Stage2D>
    );
  }
  // shot 2: Faden über die Karte
  return (
    <Stage2D cam={frameOn(540, 960, 540, 960, lerp(1, 1.05, ease(f, over, still, "inOut")))} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Wash id="desk" a="#E9DCC0" b="#D8C6A2" />
        <ThreadMap x={540} y={880} t={ease(f, over + 2, still - 6, "inOut")} f={f} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Stars: Kopf in den Nacken, Kamera kippt hoch zum Sternenhimmel im Dach; „Optional“ → Preisschild + leeres Portemonnaie mit Motten. */
export const Stars: React.FC = () => {
  const { f, B, W } = useBeats();
  const look = W("look", 0.19);
  const starsW = W("Stars", 0.42);
  const ceil = B("starCeiling", 0.51);
  // Preisschild mit Sticker (Cue auf „Cullinan?“), Portemonnaie/Motten erst auf „Optional“
  const tagAt = B("emptyWallet", 0.67);
  const opt = W("Optional", 0.84);
  const tilt = ease(f, look, starsW + 12, "inOut");
  const fy = 1500;
  const cam = frameOn(540, 1050, 540, lerp(880, 1170, tilt), lerp(1.06, 1.0, tilt));
  const on = ease(f, starsW - 6, ceil + 14, "inOut");
  const shoot = clamp01((f - ceil - 4) / 18);
  const wallet = ease(f, opt - 10, opt + 4, "inOut");
  const tagSwing = Math.sin((f - tagAt) * 0.25) * 10 * (1 - clamp01((f - tagAt) / 30));
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Wash id="cab2" a="#4A3428" b="#6B4A36" />
        {/* Dachhimmel */}
        <path d="M -600 -400 L 1680 -400 L 1680 820 Q 540 960 -600 820 Z" fill="#11163A" stroke={LUX.ink} strokeWidth={10} />
        <StarField x0={-200} y0={-80} w={1480} h={860} n={300} frame={f} on={on} />
        {shoot > 0 && shoot < 1 ? (
          <path d={`M ${lerp(-100, 900, shoot)} ${lerp(120, 380, shoot)} l -160 -46`} stroke="#FFF7DA" strokeWidth={8} strokeLinecap="round" opacity={1 - shoot} />
        ) : null}
        {f >= tagAt - 2 ? (
          <g transform={`translate(800 560) rotate(${tagSwing})`}>
            <path d="M 0 0 L 0 90" stroke={LUX.paper} strokeWidth={4} />
            <g transform={`translate(0 ${90 + (1 - pop(f, tagAt - 2, 10)) * -60})`} filter="url(#sticker)">
              <path d="M -110 0 L 110 0 L 110 90 L -110 90 L -140 45 Z" fill={LUX.paper} stroke={LUX.ink} strokeWidth={6} />
              <circle cx={-112} cy={45} r={8} fill="none" stroke={LUX.ink} strokeWidth={4} />
              <text x={10} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={LUX.ink}>
                $ EXTRA
              </text>
            </g>
          </g>
        ) : null}
        <path d={`M -600 900 L 1680 900 L 1680 2400 L -600 2400 Z`} fill="#6B4A36" />
        <SeatBack x={540} y={fy} s={1.12} />
        <Dude
          x={540}
          y={fy}
          s={1.04}
          frame={f}
          pose="sit"
          armA={[48, 30]}
          armB={wallet > 0 ? [lerp(48, 30, wallet), lerp(30, -110, wallet)] : [48, 30]}
          holdB={wallet > 0.4 ? "wallet" : "none"}
          moths={ease(f, opt, opt + 26, "linear")}
          shades={1}
          lookUp={f >= opt ? 1 - ease(f, opt, opt + 8) : tilt}
          eyes={f >= opt ? "down" : f >= look ? "up" : "open"}
          mouth={f >= opt ? "frown" : f >= starsW ? "o" : "smile"}
          brows={f >= opt ? "sad" : f >= starsW ? "up" : "neutral"}
          blinkSeed={7}
        />
      </Layer>
    </Stage2D>
  );
};
