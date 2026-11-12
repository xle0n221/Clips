import React from "react";
import { anticipate } from "../kit/motion";
import {
  Bag,
  beatOr,
  Bill,
  bump,
  Doc,
  ease,
  Feather,
  Figure,
  frameOn,
  headY,
  ImpactLines,
  jolt,
  Layer,
  lerp,
  PAPER,
  PictureFrame,
  Pigeon,
  pop,
  RING_TONES,
  ScoreCard,
  SpotCone,
  Stage2D,
  Stool,
  Tally,
  Belt,
} from "../kit2d";
import { shotIndex, useScene } from "../types";
import { Arena, BrickDrop, BrooklynDrop, BrownsvilleDrop, GymDrop, Handshake, HallwayDrop, RoomDrop, RooftopDrop } from "./tysonSets";

/**
 * „Mike Tyson – hard life or his own fault?“ Teil 1 (hook … mother). 2D-Paper-Cut (Drehbuch `style`).
 * Bildregeln: oben links Zähler bis y ≈ 372, Sticker ab y 402, Pills (label) über y 691,
 * unteres Drittel (ab y ≈ 1280) für Untertitel frei. Kamera je Einstellung über `frameOn`.
 * MIKE ohne Porträtähnlichkeit (generischer Cartoon-Kopf), Nebenfiguren als gesichtslose Silhouetten.
 */

export const FEET = 1220;
export const SIL = { dad: "#3A3330", mom: "#4A3B36", kid: "#40363A", big: "#2A2428", cus: "#2B2F38", staff: "#3E4450", opp: "#7C828C" } as const;

export const useBeats = () => {
  const s = useScene();
  return { f: s.frame, d: s.duration, B: (n: string, fb: number) => beatOr(s.beat, n, fb) };
};

/* ------------------------------------------------------------------ */

/** Hook: MIKE erschöpft auf dem Hocker in der Ecke, hebt den Kopf; Punktrichter-Karte fährt ein. */
export const Hook: React.FC = () => {
  const { f, B } = useBeats();
  const hard = 34;
  const look = B("lookUp", 73);
  const card = B("scorecardIn", 93);
  const c1 = 52;
  const c2 = card - 3;
  const shot = shotIndex(f, [c1, c2]);
  const mx = 820;
  const s = 1.1;
  const hy = FEET + headY("adult", true) * s;
  const cam =
    shot === 0
      ? frameOn(mx, hy, 540, 830, lerp(1.32, 1.46, ease(f, 0, c1)))
      : shot === 1
        ? frameOn(mx, hy - 10, 540, 860, anticipate(f, look, 2.1, 2.0, 2.45, { pre: 4, dur: 10 }))
        : frameOn(mx, hy + 40, 700, 900, lerp(1.02, 1.08, ease(f, c2, c2 + 30)));
  const headDown = f < look ? 1 : 1 - ease(f, look, look + 9);
  const shake = jolt(f, hard, 10);
  const cardX = lerp(-420, 290, ease(f, card - 2, card + 9));
  return (
    <Stage2D cam={{ ...cam, y: cam.y + shake }} mood="night" noSky>
      <Layer>
        <Arena phase="warm" tone={RING_TONES.warm} f={f} lights={0.5} />
        <Stool x={mx} y={FEET + 4} s={1.1} />
        <Figure
          x={mx}
          y={FEET}
          s={s}
          frame={f}
          pose="sit"
          towel="neck"
          headDown={headDown}
          eyes={f < look ? "down" : "open"}
          brows={f < look ? "sad" : "neutral"}
          mouth="flat"
          blinkSeed={3}
        />
        <SpotCone x={mx} y={FEET + 10} o={1} w={330} dim={0.5} />
      </Layer>
      {shot === 2 ? (
        <Layer depth={0}>
          <ScoreCard x={cardX} y={830} s={0.72} r={-6} rows={Array.from({ length: 10 }, (_, i) => ({ label: `ROUND ${i + 1}` }))} title="SCORE IT" />
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Brooklyn: Kulisse fällt, Vater geht, Mutter mit drei Kindern, Geldsorgen ziehen sie nach Brownsville (Whip). */
export const Brooklyn: React.FC = () => {
  const { f, B } = useBeats();
  const leaves = B("dadWalksOut", 34);
  const alone = B("momKids", 78);
  const whip = B("whipBrownsville", 160);
  const c1 = leaves - 5;
  const c2 = 56;
  const c3 = 98;
  const c4 = whip - 8;
  const shot = shotIndex(f, [c1, c2, c3, c4]);
  const walk = f > c3 ? (f - c3) * 2.2 : 0;
  const dadX = f < leaves ? 300 : 300 - (f - leaves) * 12;
  const kidX = 520 + walk;
  const momX = 700 + walk;
  const slide = ease(f, whip - 8, whip + 4, "inOut");
  const cam =
    shot === 0
      ? frameOn(540, 900, 540, 900, lerp(1.0, 1.06, ease(f, 0, c1)))
      : shot === 1
        ? frameOn(lerp(340, 300, ease(f, c1, c2)), 700, 560, 840, 1.55)
        : shot === 2
          ? frameOn(700, 840, 540, 880, lerp(1.32, 1.5, ease(f, alone - 6, alone + 10)))
          : shot === 3
            ? frameOn(720 + walk, 860, 540, 900, 1.18)
            : frameOn(700 + walk, 860, 540, 900, lerp(1.25, 1.05, ease(f, whip - 8, whip + 10)));
  const momArm: [number, number] = [38, 28];
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <Arena
          phase="warm"
          tone={RING_TONES.warm}
          f={f}
          lights={0.4}
          drop={
            <>
              <BrooklynDrop down={ease(f, -6, 20, "linear")} dx={-walk * 0.6 - slide * 1400} />
              {slide > 0 ? <BrownsvilleDrop down={1} dx={(1 - slide) * 1400} f={f} blue={ease(f, whip, whip + 10)} /> : null}
            </>
          }
        />
        {dadX > -300 ? (
          <Figure x={dadX} y={FEET} s={1.0} frame={f} sil={SIL.dad} outfit="coat" coatColor={SIL.dad} pose={f > leaves ? "walk" : "stand"} step={Math.sin(f * 0.4)} />
        ) : null}
        {/* Mutter mit drei Kindern (MIKE = Kind im grauen Shirt) */}
        <Figure x={momX} y={FEET} s={0.98} frame={f} sil={SIL.mom} outfit="dress" armL={momArm} armR={momArm} pose={walk ? "walk" : "stand"} step={Math.sin(f * 0.35)} lean={walk ? 4 : 0} headDown={f > alone ? 0.4 : 0} />
        <Figure x={momX + 170} y={FEET} s={0.9} frame={f} age="kid" sil={SIL.kid} outfit="plain" armL={[34, 20]} pose={walk ? "walk" : "stand"} step={Math.sin(f * 0.35 + 1)} />
        <Figure x={momX + 280} y={FEET} s={0.78} frame={f} age="kid" sil={SIL.kid} outfit="plain" armL={[34, 20]} pose={walk ? "walk" : "stand"} step={Math.sin(f * 0.35 + 2)} />
        <Figure
          x={kidX}
          y={FEET}
          s={1.12}
          frame={f}
          age="kid"
          outfit="shirt"
          armR={[40, 34]}
          pose={walk ? "walk" : "stand"}
          step={Math.sin(f * 0.35 + 0.5)}
          eyes={shot === 1 ? "side" : f > alone && f < c3 ? "up" : "open"}
          flip={shot === 1}
          brows={f > leaves ? "sad" : "neutral"}
          mouth={f > leaves ? "frown" : "flat"}
          blinkSeed={3}
        />
        {/* Geld fliegt davon */}
        {shot >= 3
          ? Array.from({ length: 6 }, (_, i) => {
              const t = f - c3 - i * 6;
              if (t < 0) return null;
              return <Bill key={i} x={momX - 40 + t * (7 + i)} y={760 - t * (2.4 + (i % 3)) + Math.sin(t * 0.3 + i) * 20} r={t * (6 + i)} s={0.8} flipY={Math.cos(t * 0.2 + i)} />;
            })
          : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Streets: Dach mit Tauben, größerer Junge greift zu → leere Hände + Feder; Strichliste bis 38. */
export const Streets: React.FC = () => {
  const { f, B } = useBeats();
  const says = 40;
  const grab = 70;
  const feather = B("featherFall", 104);
  const tally = B("tallyMarks", 122);
  const arrests = 177;
  const shot = shotIndex(f, [says, grab, feather, tally, 160]);
  const kx = 330;
  const ks = 1.25;
  const birdX = 483;
  const birdY = 759;
  const reach = ease(f, grab + 2, feather - 2, "inOut");
  const bigX = lerp(1000, 780, ease(f, grab - 4, grab + 14));
  const n = Math.floor(ease(f, tally + 2, tally + 46, "linear") * 38);
  const brick = ease(f, tally - 6, tally + 6, "linear");
  const cam =
    shot === 0
      ? frameOn(480, 820, 540, 880, lerp(1.15, 1.25, ease(f, 0, says)))
      : shot === 1
        ? frameOn(birdX, birdY, 540, 770, lerp(1.45, 1.55, ease(f, says, grab)))
        : shot === 2
          ? frameOn(620, 800, 540, 860, 1.12)
          : shot === 3
            ? frameOn(birdX - 10, 800, 540, 760, lerp(2.0, 2.15, ease(f, feather, tally)))
            : shot === 4
              ? frameOn(600, 760, 540, 860, lerp(1.0, 1.06, ease(f, tally, 160)))
              : frameOn(760, 700, 540, 820, lerp(1.35, 1.45, ease(f, 160, 195)));
  const hasBird = f < feather;
  const fT = f - feather;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, arrests, 10) }} mood="night" noSky>
      <Layer>
        <Arena
          phase="dusk"
          tone={RING_TONES.warm}
          f={f}
          lights={0.3}
          drop={
            <>
              <RooftopDrop down={brick < 1 ? 1 : 0} />
              <BrickDrop down={brick}>
                <Tally x={640} y={520} n={n} per={3} s={1.05} />
              </BrickDrop>
            </>
          }
        />
        {f < tally ? (
          <>
            {/* Tauben auf der Kulisse */}
            <Pigeon x={150} y={505} s={0.6} flap={bump(f, 30, 8)} />
            <Pigeon x={300} y={500} s={0.55} flip flap={bump(f, 90, 8)} />
            <Figure
              x={bigX}
              y={FEET}
              s={1.25}
              frame={f}
              age="teen"
              sil={SIL.big}
              outfit="plain"
              armL={[lerp(30, 95, reach), lerp(30, 100, reach)]}
              lean={-6 * reach}
              o={ease(f, grab - 6, grab)}
            />
            <Figure
              x={kx}
              y={FEET}
              s={ks}
              frame={f}
              age="kid"
              outfit="shirt"
              armR={hasBird || fT < 30 ? [120, 160] : [20, 20]}
              armL={[14, 10]}
              lean={-5 * reach}
              eyes={f >= feather ? "up" : shot === 2 ? "side" : "open"}
              brows={f >= grab ? "sad" : "neutral"}
              mouth={f >= feather ? "o" : f > grab ? "frown" : "smile"}
              blinkSeed={3}
            />
            {hasBird ? <Pigeon x={birdX + reach * 10} y={birdY - 10} s={0.9} flap={Math.max(0, Math.sin(f * 0.6)) * reach} /> : null}
            {fT >= 0 ? <Feather x={birdX + Math.sin(fT * 0.18) * 34} y={762 + fT * 2.6} s={0.9} r={Math.sin(fT * 0.2) * 35} /> : null}
          </>
        ) : (
          <>
            <Figure x={250} y={FEET} s={1.2} frame={f} age="kid" outfit="shirt" eyes="side" brows="sad" mouth="flat" headTilt={4} blinkSeed={3} />
            {/* Blaulicht als flacher Schimmer */}
            <rect x={-600} y={-600} width={2400} height={3200} fill="#3D6BFF" opacity={shot === 5 ? 0.12 * (Math.sin(f * 0.6) + 1) : 0} />
          </>
        )}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Detention: Flur, Kind schlägt auf Sandsack, Betreuer staunt (Augen-Pop), Handschlag → Match Cut auf CUS. */
export const Detention: React.FC = () => {
  const { f, B } = useBeats();
  const talent = B("eyePop", 103);
  const cus = B("matchCutHandshake", 146);
  const c1 = 45;
  const c2 = talent - 12;
  const c3 = 120;
  const shot = shotIndex(f, [c1, c2, c3, cus]);
  const kx = 360;
  const ks = 1.25;
  const cyc = (f % 18) / 18;
  const punch = shot <= 2 ? Math.max(0, Math.sin(cyc * Math.PI * 2)) : 0;
  const hitAt = f - (f % 18) + 4;
  const bagSwing = Math.sin((f - hitAt) * 0.25) * 9 * Math.exp(-Math.max(0, f - hitAt) * 0.08);
  const staffX = 880;
  const eyeP = 1 + 0.9 * pop(f, talent, 8) * (1 - ease(f, talent + 22, talent + 36));
  // Handschlag-Punkt (Welt), gleiche Bildstelle vor und nach dem Match Cut
  const hsX = 520;
  const hsY = 930;
  const cam =
    shot === 0
      ? frameOn(600, 820, 540, 880, lerp(1.02, 1.1, ease(f, 0, c1)))
      : shot === 1
        ? frameOn(470, 820, 540, 860, lerp(1.55, 1.65, ease(f, c1, c2)))
        : shot === 2
          ? frameOn(staffX, FEET + headY("adult") * 1.0, 540, 820, anticipate(f, talent, 2.1, 2.0, 2.5, { pre: 4, dur: 8 }))
          : shot === 3
            ? frameOn(hsX, hsY, 540, 1000, lerp(1.8, 1.95, ease(f, c3, cus)))
            : frameOn(hsX, hsY, lerp(540, 400, ease(f, cus, cus + 16)), lerp(1000, 1060, ease(f, cus, cus + 16)), lerp(1.95, 1.2, ease(f, cus, cus + 16, "inOut")));
  const afterCut = shot === 4;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <Arena
          phase="warm"
          tone={RING_TONES.warm}
          f={f}
          lights={0.3}
          drop={afterCut ? <GymDrop down={1} /> : <HallwayDrop down={ease(f, -10, 14, "linear")} />}
        />
        {shot <= 2 ? (
          <>
            <Bag x={610} y={560} swing={bagSwing} s={0.95} />
            <ImpactLines x={560} y={800} t={(f - hitAt) / 8} s={0.6} />
            {/* Betreuer: Ex-Boxer, Handschuhe über der Schulter */}
            <Figure x={staffX} y={FEET} s={1.0} frame={f} sil={SIL.staff} silEyes outfit="plain" eyePop={eyeP} armL={[20, 150]} armR={[10, 6]} />
            <g transform={`translate(${staffX - 70} ${FEET - 470})`}>
              <ellipse cx={0} cy={60} rx={30} ry={34} fill={PAPER.glove} stroke={PAPER.ink} strokeWidth={5} />
              <ellipse cx={30} cy={84} rx={30} ry={34} fill={PAPER.glove} stroke={PAPER.ink} strokeWidth={5} />
            </g>
            <Figure
              x={kx}
              y={FEET}
              s={ks}
              frame={f}
              age="kid"
              outfit="shirt"
              armR={[lerp(40, 92, punch), lerp(150, 92, punch)]}
              armL={[30, 150]}
              lean={punch * 6}
              eyes="side"
              brows="angry"
              mouth="grit"
              blinkSeed={3}
            />
          </>
        ) : (
          <>
            {/* Betreuer bzw. CUS rechts, Kind links; Hände treffen sich bei (hsX, hsY) */}
            <Figure
              x={hsX + 200}
              y={FEET}
              s={1.0}
              frame={f}
              sil={afterCut ? SIL.cus : SIL.staff}
              outfit={afterCut ? "coat" : "plain"}
              coatColor={SIL.cus}
              silEyes={!afterCut}
              armL={[34, 40]}
              lean={afterCut ? -3 : 0}
            />
            <Figure x={hsX - 210} y={FEET} s={ks} frame={f} age="kid" outfit="shirt" armR={[66, 78]} eyes="open" brows="up" mouth="smile" blinkSeed={3} />
            <Handshake x={hsX} y={hsY + Math.sin(f * 0.5) * 6} other={afterCut ? SIL.cus : SIL.staff} sleeve={afterCut ? SIL.cus : undefined} />
          </>
        )}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Mother: Bild der Mutter verblasst, CUS wird Vormund; Re-Hook im Spotlicht mit Punktrichter-Karte. */
export const Mother: React.FC = () => {
  const { f, B } = useBeats();
  const dies = B("frameFade", 45);
  const guard = B("guardianDoc", 109);
  const spot = B("spotlight", 138);
  const brutal = B("scorecardRed", 174);
  const yet = 208;
  const shot = shotIndex(f, [dies, 66, guard, spot, yet]);
  const tx = shot <= 2 ? 400 : 540;
  const ts = 1.15;
  const fade = ease(f, dies, dies + 22);
  const roomUp = 1 - ease(f, spot - 2, spot + 8, "linear");
  const cam =
    shot === 0
      ? frameOn(560, 760, 540, 860, lerp(1.22, 1.3, ease(f, 0, dies)))
      : shot === 1
        ? frameOn(720, 700, 540, 800, lerp(1.9, 2.05, ease(f, dies, 66)))
        : shot === 2
          ? frameOn(540, 760, 540, 880, lerp(1.32, 1.4, ease(f, 66, guard)))
          : shot === 3
            ? frameOn(540, 800, 540, 860, 1.1)
            : shot === 4
              ? frameOn(tx, 760, 330, 880, lerp(1.2, 1.32, ease(f, spot, yet)))
              : frameOn(tx, 640, 540, 900, lerp(1.25, 1.4, ease(f, yet, yet + 50)));
  const rows = Array.from({ length: 10 }, (_, i) => ({
    label: `ROUND ${i + 1}`,
    fill: i < 4 ? ease(f, brutal + i * 4, brutal + i * 4 + 8) : 0,
  }));
  const cardIn = ease(f, spot + 8, spot + 20);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <Arena
          phase="cool"
          tone={RING_TONES.cool}
          f={f}
          lights={shot >= 4 ? 0 : 0.3}
          drop={
            roomUp > 0 ? (
              <RoomDrop down={roomUp}>
                <PictureFrame x={830} y={640} s={1.1} fade={fade} long />
              </RoomDrop>
            ) : null
          }
        />
        {shot === 2 || shot === 3 ? (
          <Figure x={660} y={FEET} s={1.05} frame={f} sil={SIL.cus} outfit="coat" coatColor={SIL.cus} armL={[lerp(10, 66, ease(f, 66, 84)), lerp(10, 96, ease(f, 66, 84))]} />
        ) : null}
        <Figure
          x={tx}
          y={FEET}
          s={ts}
          frame={f}
          age="teen"
          outfit="shirt"
          eyes={shot <= 1 ? "side" : shot === 5 ? "up" : shot === 4 ? "open" : "down"}
          headDown={shot === 2 ? 0.4 : 0}
          brows="sad"
          mouth={shot === 5 ? "flat" : "frown"}
          blinkSeed={3}
        />
        {shot === 3 ? <Doc x={540} y={790} s={0.9 * pop(f, guard, 10)} r={-4} title="LEGAL GUARDIAN" stamp={ease(f, guard + 12, guard + 18)} /> : null}
        {shot >= 4 ? <SpotCone x={tx} y={FEET + 10} o={1} w={300} dim={0.72} /> : null}
        {shot === 5 ? <Belt x={tx} y={410} s={0.72} outline /> : null}
      </Layer>
      {shot === 4 ? (
        <Layer depth={0}>
          <ScoreCard x={lerp(1400, 770, cardIn)} y={840} s={0.66} r={4} rows={rows} title="SCORE IT" />
        </Layer>
      ) : null}
    </Stage2D>
  );
};
