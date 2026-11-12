import React, { useContext } from "react";
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
  Kit2DContext,
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

/**
 * Zeiten je Szene: Beats aus timeline.json (`B`) und Wort-Zeiten aus captions.json (`W`, lokaler Frame des
 * n-ten Vorkommens eines Worts in dieser Szene). Keine fest kodierten Sekunden – bei neuer Tonspur passt alles mit.
 * Ersatzwerte gelten nur, wenn Beat/Wort fehlt; sie sind als Anteil der Szenendauer angegeben.
 */
export const useBeats = () => {
  const s = useScene();
  const { captions, fps, start } = useContext(Kit2DContext);
  const d = s.duration;
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9'-]/g, "");
  const W = (word: string, frac: number, nth = 1) => {
    const t0 = (start / fps) * 1000;
    const t1 = ((start + d) / fps) * 1000;
    const hits = captions.filter((c) => c.startMs >= t0 - 60 && c.startMs < t1 && norm(c.text) === norm(word));
    const c = hits[nth - 1];
    return c ? Math.max(0, Math.round((c.startMs / 1000) * fps) - start) : Math.round(frac * d);
  };
  return { f: s.frame, d, B: (n: string, frac: number) => beatOr(s.beat, n, Math.round(frac * d)), W };
};

/* ------------------------------------------------------------------ */

/** Hook: MIKE erschöpft auf dem Hocker in der Ecke, hebt den Kopf; Punktrichter-Karte fährt ein. */
export const Hook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const hard = W("hard", 0.3);
  const look = B("lookUp", 0.66);
  const card = B("scorecardIn", 0.84);
  // eine ruhige Einstellung (Nutzer: Schnitte alle 1–3 s zu hektisch): langsame Ranfahrt, MIKE rechts, Karte links
  const mx = 820;
  const s = 1.1;
  const hy = FEET + headY("adult", true) * s;
  const cam = frameOn(mx, hy, lerp(560, 700, ease(f, d * 0.18, d * 0.9, "inOut")), 860, lerp(1.3, 1.55, ease(f, 0, d, "inOut")));
  const headDown = f < look ? 1 : 1 - ease(f, look, look + 16, "inOut");
  const shake = jolt(f, hard, 6);
  const cardX = lerp(-420, 260, ease(f, card - 4, card + 12, "inOut"));
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
      {f >= card - 4 ? (
        <Layer depth={0}>
          <ScoreCard x={cardX} y={830} s={0.62} r={-6} rows={Array.from({ length: 10 }, (_, i) => ({ label: `ROUND ${i + 1}` }))} title="SCORE IT" />
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Brooklyn: Kulisse fällt, Vater geht, Mutter mit drei Kindern, Geldsorgen ziehen sie nach Brownsville (Whip). */
export const Brooklyn: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const leaves = B("dadWalksOut", 0.19);
  const alone = B("momKids", 0.43);
  const whip = B("whipBrownsville", 0.89);
  const c3 = W("Money", 0.54);
  const shot = shotIndex(f, [c3]);
  const walk = f > c3 ? (f - c3) * 2.2 : 0;
  const dadX = f < leaves ? 300 : 300 - (f - leaves) * 8;
  const kidX = 520 + walk;
  const momX = 700 + walk;
  // Ortswechsel Brooklyn → Brownsville als weiche Überblendung (kein Whip innerhalb der Szene)
  const fade = ease(f, whip - 14, whip + 10, "inOut");
  const cam =
    shot === 0
      ? frameOn(lerp(540, 640, ease(f, 0, c3, "inOut")), 880, 540, 900, lerp(1.0, 1.14, ease(f, 0, c3, "inOut")))
      : frameOn(720 + walk, 860, 540, 900, lerp(1.18, 1.08, ease(f, c3, d, "inOut")));
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
              <BrooklynDrop down={ease(f, -6, 24, "linear")} dx={-walk * 0.6} />
              {fade > 0 ? (
                <g opacity={fade}>
                  <BrownsvilleDrop down={1} dx={-walk * 0.6} f={f} blue={fade} />
                </g>
              ) : null}
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
          eyes={f > leaves && f < alone - 10 ? "side" : f > alone && f < c3 ? "up" : "open"}
          flip={f > leaves && f < alone - 10}
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
  const { f, d, B, W } = useBeats();
  const grab = W("bigger", 0.36);
  const feather = B("featherFall", 0.53);
  const tally = B("tallyMarks", 0.63);
  const arrests = W("arrests", 0.9);
  // zwei ruhige Einstellungen: Dach (Taube, Zugriff) → leere Hände, Feder, Ziegelwand senkt sich, Strichliste
  const shot = shotIndex(f, [feather]);
  const kx = 330;
  const ks = 1.25;
  const birdX = 483;
  const birdY = 759;
  const reach = ease(f, grab + 2, feather - 2, "inOut");
  const bigX = f < feather ? lerp(1000, 780, ease(f, grab - 10, grab + 16, "inOut")) : lerp(780, 1250, ease(f, feather + 6, feather + 40, "inOut"));
  const n = Math.floor(ease(f, tally + 4, tally + 52, "linear") * 38);
  const brick = ease(f, tally - 8, tally + 8, "linear");
  const cam =
    shot === 0
      ? frameOn(birdX, birdY, 540, 770, lerp(1.1, 1.32, ease(f, 0, feather, "inOut")))
      : frameOn(lerp(birdX, 640, ease(f, feather, tally + 20, "inOut")), lerp(birdY, 790, ease(f, feather, tally + 20, "inOut")), 540, lerp(770, 860, ease(f, feather, tally + 20, "inOut")), lerp(1.32, 1.05, ease(f, feather, tally + 30, "inOut")));
  const hasBird = f < feather;
  const fT = f - feather;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, arrests, 5) }} mood="night" noSky>
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
        {brick < 0.5 ? (
          <>
            {/* Tauben auf der Kulisse */}
            <Pigeon x={150} y={505} s={0.6} flap={bump(f, 30, 12)} />
            <Pigeon x={300} y={500} s={0.55} flip flap={bump(f, 90, 12)} />
          </>
        ) : null}
        <Figure
          x={bigX}
          y={FEET}
          s={1.25}
          frame={f}
          age="teen"
          sil={SIL.big}
          outfit="plain"
          pose={f > feather + 6 ? "walk" : "stand"}
          step={Math.sin(f * 0.3)}
          armL={f < feather ? [lerp(30, 95, reach), lerp(30, 100, reach)] : [20, 20]}
          lean={f < feather ? -6 * reach : 0}
          o={ease(f, grab - 10, grab)}
        />
        <Figure
          x={kx}
          y={FEET}
          s={ks}
          frame={f}
          age="kid"
          outfit="shirt"
          armR={[lerp(120, 20, ease(f, feather + 20, feather + 44, "inOut")), lerp(160, 20, ease(f, feather + 20, feather + 44, "inOut"))]}
          armL={[14, 10]}
          lean={f < feather ? -5 * reach : 0}
          eyes={f >= tally + 10 ? "side" : f >= feather ? "up" : "open"}
          brows={f >= grab ? "sad" : "neutral"}
          mouth={f >= tally ? "flat" : f >= feather ? "o" : f > grab ? "frown" : "smile"}
          blinkSeed={3}
        />
        {hasBird ? <Pigeon x={birdX + reach * 10} y={birdY - 10} s={0.9} flap={Math.max(0, Math.sin(f * 0.4)) * reach} /> : null}
        {fT >= 0 && fT < 70 ? <Feather x={birdX + Math.sin(fT * 0.12) * 34} y={762 + fT * 2.2} s={0.9} r={Math.sin(fT * 0.14) * 35} /> : null}
        {/* Blaulicht als flacher, langsamer Schimmer */}
        <rect x={-600} y={-600} width={2400} height={3200} fill="#3D6BFF" opacity={f > arrests - 18 ? 0.08 * (Math.sin(f * 0.25) + 1) * ease(f, arrests - 18, arrests) : 0} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Detention: Flur, Kind schlägt auf Sandsack, Betreuer staunt (Augen-Pop), Handschlag → Match Cut auf CUS. */
export const Detention: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const talent = B("eyePop", 0.62);
  const cus = B("matchCutHandshake", 0.88);
  // zwei ruhige Einstellungen: Sandsack (weit) → Zweier-Einstellung Betreuer/Kind; CUS wird weich eingeblendet
  const c1 = talent - 14;
  const shot = shotIndex(f, [c1]);
  const kx = 360;
  const ks = 1.25;
  const cyc = (f % 24) / 24;
  const punch = shot === 0 ? Math.max(0, Math.sin(cyc * Math.PI * 2)) : 0;
  const hitAt = f - (f % 24) + 5;
  const bagSwing = Math.sin((f - hitAt) * 0.2) * 8 * Math.exp(-Math.max(0, f - hitAt) * 0.06);
  const staffX = 880;
  const eyeP = 1 + 0.8 * pop(f, talent, 10) * (1 - ease(f, talent + 24, talent + 40));
  const hsX = 520;
  const hsY = 930;
  const shake = ease(f, talent + 13, talent + 33, "inOut");
  const cusIn = ease(f, cus - 4, cus + 14, "inOut");
  const cam =
    shot === 0
      ? frameOn(600, 820, 540, 880, lerp(1.0, 1.16, ease(f, 0, c1, "inOut")))
      : frameOn(hsX, 760, 360, 860, lerp(1.05, 1.16, ease(f, c1, d, "inOut")));
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <Arena
          phase="warm"
          tone={RING_TONES.warm}
          f={f}
          lights={0.3}
          drop={
            <>
              <HallwayDrop down={ease(f, -10, 16, "linear")} />
              {cusIn > 0 ? (
                <g opacity={cusIn}>
                  <GymDrop down={1} />
                </g>
              ) : null}
            </>
          }
        />
        {shot === 0 ? (
          <>
            <Bag x={610} y={560} swing={bagSwing} s={0.95} />
            <ImpactLines x={560} y={800} t={(f - hitAt) / 10} s={0.6} />
            {/* Betreuer: Ex-Boxer, Handschuhe über der Schulter */}
            <Figure x={staffX} y={FEET} s={1.0} frame={f} sil={SIL.staff} silEyes outfit="plain" armL={[20, 150]} armR={[10, 6]} />
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
              lean={punch * 5}
              eyes="side"
              brows="angry"
              mouth="grit"
              blinkSeed={3}
            />
          </>
        ) : (
          <>
            {/* Betreuer (Augen-Pop) → CUS (Mantel) weich überblendet; Hände treffen sich bei (hsX, hsY) */}
            <Figure x={hsX + 200} y={FEET} s={1.0} frame={f} sil={SIL.staff} outfit="plain" silEyes eyePop={eyeP} armL={[lerp(10, 34, shake), lerp(8, 40, shake)]} o={1 - cusIn} />
            {cusIn > 0 ? <Figure x={hsX + 200} y={FEET} s={1.0} frame={f} sil={SIL.cus} outfit="coat" coatColor={SIL.cus} armL={[34, 40]} lean={-3} o={cusIn} /> : null}
            <Figure
              x={hsX - 210}
              y={FEET}
              s={ks}
              frame={f}
              age="kid"
              outfit="shirt"
              armR={[lerp(14, 66, shake), lerp(10, 78, shake)]}
              eyes="open"
              brows={f > talent + 27 ? "up" : "neutral"}
              mouth={f > talent + 27 ? "smile" : "flat"}
              blinkSeed={3}
            />
            {shake > 0.95 ? <Handshake x={hsX} y={hsY + Math.sin(f * 0.3) * 5} other={cusIn > 0.5 ? SIL.cus : SIL.staff} sleeve={cusIn > 0.5 ? SIL.cus : undefined} /> : null}
          </>
        )}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Mother: Bild der Mutter verblasst, CUS wird Vormund; Re-Hook im Spotlicht mit Punktrichter-Karte. */
export const Mother: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const dies = B("frameFade", 0.17);
  const guard = B("guardianDoc", 0.42);
  const spot = B("spotlight", 0.53);
  const brutal = B("scorecardRed", 0.67);
  const yet = W("And", 0.8);
  const cusW = W("Cus", 0.25);
  // zwei ruhige Einstellungen: Zimmer (Bild verblasst, CUS kommt, Dokument) → Spotlicht mit Karte, Blick nach oben
  const shot = shotIndex(f, [spot]);
  const tx = shot === 0 ? 400 : 540;
  const ts = 1.15;
  const fade = ease(f, dies, dies + 30, "inOut");
  const roomUp = 1 - ease(f, spot - 2, spot + 8, "linear");
  const cusX = lerp(1250, 660, ease(f, cusW - 14, cusW + 20, "inOut"));
  const hand = ease(f, cusW + 20, cusW + 36, "inOut");
  const tilt = ease(f, yet - 10, yet + 30, "inOut");
  const cam =
    shot === 0
      ? frameOn(lerp(620, 560, ease(f, 0, spot, "inOut")), 780, 540, 870, lerp(1.12, 1.28, ease(f, 0, spot, "inOut")))
      : frameOn(tx, lerp(760, 640, tilt), lerp(330, 540, tilt), lerp(880, 900, tilt), lerp(1.2, 1.32, ease(f, spot, d, "inOut")));
  const rows = Array.from({ length: 10 }, (_, i) => ({
    label: `ROUND ${i + 1}`,
    fill: i < 4 ? ease(f, brutal + i * 5, brutal + i * 5 + 10) : 0,
  }));
  const cardX = lerp(1400, 770, ease(f, spot + 6, spot + 28, "inOut")) + ease(f, yet - 8, yet + 10, "inOut") * 700;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <Arena
          phase="cool"
          tone={RING_TONES.cool}
          f={f}
          lights={shot === 1 ? 0 : 0.3}
          drop={
            roomUp > 0 ? (
              <RoomDrop down={roomUp}>
                <PictureFrame x={830} y={640} s={1.1} fade={fade} long />
              </RoomDrop>
            ) : null
          }
        />
        {shot === 0 && f > cusW - 16 ? (
          <Figure x={cusX} y={FEET} s={1.05} frame={f} sil={SIL.cus} outfit="coat" coatColor={SIL.cus} pose={f < cusW + 20 ? "walk" : "stand"} step={Math.sin(f * 0.3)} armL={[lerp(10, 66, hand), lerp(10, 96, hand)]} />
        ) : null}
        <Figure
          x={tx}
          y={FEET}
          s={ts}
          frame={f}
          age="teen"
          outfit="shirt"
          eyes={shot === 0 ? (f < dies + 30 ? "side" : "down") : tilt > 0.3 ? "up" : "open"}
          headDown={shot === 0 && f > dies + 30 ? 0.4 : 0}
          brows="sad"
          mouth={tilt > 0.3 ? "flat" : "frown"}
          blinkSeed={3}
        />
        {shot === 0 && f >= guard ? <Doc x={540} y={790} s={0.9 * pop(f, guard, 14)} r={-4} title="LEGAL GUARDIAN" stamp={ease(f, guard + 14, guard + 22)} /> : null}
        {shot === 1 ? <SpotCone x={tx} y={FEET + 10} o={1} w={300} dim={0.72} /> : null}
        {shot === 1 ? <Belt x={tx} y={410} s={0.72} outline o={ease(f, yet, yet + 20)} /> : null}
      </Layer>
      {shot === 1 && cardX < 1400 ? (
        <Layer depth={0}>
          <ScoreCard x={cardX} y={840} s={0.66} r={4} rows={rows} title="SCORE IT" />
        </Layer>
      ) : null}
    </Stage2D>
  );
};
