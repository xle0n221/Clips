import React from "react";
import { AbsoluteFill } from "remotion";
import {
  Basketball,
  BigCheck,
  Bubble,
  Clipping,
  Coin,
  CoinStack,
  Courthouse,
  Drop2,
  ease,
  FIGHT,
  Figure,
  FightHall,
  Folder,
  frameOn,
  Gavel,
  GoldTower,
  jolt,
  Layer,
  lerp,
  NeonSign,
  Octagon,
  OctagonWipe,
  PAPER,
  Pie,
  pop,
  PriceTag,
  Scale,
  seeded,
  SpotCone,
  Stage2D,
  StreamScreen,
  StudioCam,
  Suitcase,
  TextBlock,
} from "../kit2d";
import { shotIndex } from "../types";
import { headTop, Hero, HFEET, HookSet, HX, Ponytail, SIL, Suit, useBeats } from "./ufcSets";

/** „The rise of the UFC“ Teil 2 (tuf … ending). Regeln wie ufc1.tsx. */

/* ------------------------------------------------------------------ */

/** TUF: Geldkoffer leert sich in ein Loch („$40M+ IN“); TV-Studio mit Leuchtschrift, LIVE-Kamera, Schlagabtausch, „$0“ am Fernseher. */
export const Tuf: React.FC = () => {
  const { f, d, B } = useBeats();
  const studio = B("tvStudio", 0.57);
  const slug = B("slugfest", 0.74);
  const zero = B("priceZero", 0.9);
  const shot = shotIndex(f, [studio]);
  const coins = React.useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 40 }, () => ({ k: r(), o: r() * 60 }));
  }, []);
  const holeX = 620;
  const holeY = 1180;
  const cam =
    shot === 0
      ? frameOn(560, lerp(820, 900, ease(f, 0, studio, "inOut")), 540, 880, lerp(0.95, 1.12, ease(f, 0, studio, "inOut")))
      : frameOn(540, 860, 540, 900, lerp(0.86, 0.96, ease(f, studio, d, "inOut")));
  const tip = ease(f, 6, 30, "inOut");
  const sTop = headTop(1190, 0.86);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      {shot === 0 ? (
        <Layer>
          <FightHall phase="dim" f={f} fill={0.1} lights={0.4} />
          <ellipse cx={holeX} cy={holeY} rx={230} ry={60} fill="#050505" stroke={PAPER.ink} strokeWidth={8} />
          <ellipse cx={holeX} cy={holeY - 6} rx={200} ry={44} fill="#000" />
          {coins.map((c, i) => {
            const t = ((f - c.o + 200) % 34) / 34;
            if (f < c.o * 0.5 + 8) return null;
            const x = lerp(860, holeX + (c.k - 0.5) * 160, t);
            const y = lerp(820, holeY - 10, t * t);
            return <Coin key={i} x={x} y={y} s={0.7} flip={Math.cos(f * 0.4 + i)} />;
          })}
          <g transform={`rotate(${-70 * tip} 900 830)`}>
            <Suitcase x={900} y={900} s={0.8} open={1} cash={1 - ease(f, 10, studio - 10)} />
          </g>
          <Hero x={300} y={1240} s={0.86} f={f} headDown={0.6} eyes="down" brows="sad" mouth="frown" armL={[16, 10]} armR={[16, 10]} />
          <TextBlock x={holeX} y={1300} w={360} h={90} text="$40M+ IN" size={62} fill={FIGHT.redDark} fg="#FFFFFF" />
        </Layer>
      ) : (
        <Layer>
          <FightHall phase="red" f={f} fill={0.6} flashes={0.6} lights={0.9} />
          <NeonSign x={540} y={465} lines={["THE ULTIMATE FIGHTER"]} size={54} on={ease(f, studio, studio + 8) > 0.5 && (f - studio) % 23 !== 3 ? 1 : 0} />
          <Octagon g={{ cx: 540, cy: 1170, rx: 520, ry: 160, h: 300 }} frontO={0.5}>
            {(() => {
              const pA = Math.max(0, Math.sin((f - slug) * 0.45)) * (f >= slug - 20 ? 1 : 0.3);
              const pB = Math.max(0, Math.sin((f - slug) * 0.45 + Math.PI)) * (f >= slug - 20 ? 1 : 0.3);
              return (
                <>
                  <Figure x={430} y={1190} s={0.86} frame={f} sil={SIL.fighterA} gloves armL={[30, 150]} armR={[lerp(30, 95, pA), lerp(150, 95, pA)]} lean={pB * -8} />
                  <Figure x={650} y={1190} s={0.86} frame={f} sil={SIL.fighterB} gloves flip armL={[30, 150]} armR={[lerp(30, 95, pB), lerp(150, 95, pB)]} lean={pA * 8} />
                  {f >= slug
                    ? Array.from({ length: 6 }, (_, i) => {
                        const t = ((f - slug + i * 5) % 24) / 24;
                        return <Drop2 key={i} x={540 + (i % 2 ? 1 : -1) * (40 + t * 160)} y={sTop + 120 - Math.sin(t * Math.PI) * 120 + t * 80} s={0.9} r={(i % 2 ? 1 : -1) * 40} o={1 - t} />;
                      })
                    : null}
                </>
              );
            })()}
          </Octagon>
          <StudioCam x={60} y={1290} s={0.9} live={1} />
          {/* Fernseher am Rand mit Preisschild $0 */}
          <g filter="url(#paper)">
            <rect x={850} y={960} width={240} height={180} rx={18} fill="#1A1C22" stroke={PAPER.ink} strokeWidth={7} />
            <rect x={870} y={980} width={200} height={140} rx={10} fill="#5E7FA8" />
          </g>
          {f >= zero - 2 ? <PriceTag x={1000} y={930} s={0.6 * Math.min(1, pop(f, zero - 2, 10))} swing={Math.sin(f * 0.2) * 10} text="$0" color="#FFE26A" /> : null}
        </Layer>
      )}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Boom: volle goldene Halle, Umsatzbalken; THE BOSS (Silhouette) mit Sprechblase „NEVER EVER“; Blase zerplatzt, zwei Kämpferinnen im Käfig. */
export const Boom: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const boss = B("bossBubble", 0.26);
  const never = W("Never", 0.54);
  const y13 = W("2013", 0.65);
  const fight = B("bubblePop", 0.93);
  const shot = shotIndex(f, [y13]);
  const by = 1300;
  const bTop = headTop(by, 0.95);
  const cam =
    shot === 0
      ? frameOn(540, lerp(760, bTop, ease(f, 0, boss, "inOut")), 540, lerp(900, 715, ease(f, 0, boss, "inOut")), lerp(0.62, 0.96, ease(f, 0, boss, "inOut")))
      : frameOn(540, headTop(1185, 0.82), 540, lerp(740, 715, ease(f, y13, d, "inOut")), lerp(0.96, 1.04, ease(f, y13, d, "inOut")));
  const bars = [0.18, 0.3, 0.45, 0.62, 0.8, 1];
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <FightHall phase="gold" f={f} fill={1} flashes={0.9} />
        {/* übermaltes Schild des Rivalen (nur Text) */}
        <g>
          <TextBlock x={60} y={430} w={300} h={110} text="PRIDE" size={70} fill="#3A2A44" fg="#E6DDF0" r={-4} />
          <rect x={-90} y={375} width={300 * ease(f, 6, 40, "inOut")} height={110} fill={FIGHT.gold} transform="rotate(-4 60 430)" />
        </g>
        {/* Umsatzbalken (wachsen) */}
        <g filter="url(#paper)">
          {bars.map((v, i) => (
            <rect key={i} x={760 + i * 62} y={640 - 300 * v * ease(f, i * 5, 30 + i * 5, "inOut")} width={48} height={300 * v * ease(f, i * 5, 30 + i * 5, "inOut")} fill={i === bars.length - 1 ? FIGHT.gold : FIGHT.goldDark} stroke={PAPER.ink} strokeWidth={5} />
          ))}
          <rect x={740} y={640} width={400} height={10} fill={PAPER.ink} />
        </g>
        <Octagon>
          {shot === 1 ? (
            <>
              {[
                { x: lerp(-200, 400, ease(f, y13, y13 + 30, "inOut")), c: SIL.woman, side: -1 as const },
                { x: lerp(1300, 680, ease(f, y13 + 4, y13 + 34, "inOut")), c: SIL.woman2, side: 1 as const },
              ].map((w, i) => (
                <g key={i}>
                  <Ponytail x={w.x} y={1185} s={0.82} color={w.c} f={f} side={w.side} />
                  <Figure x={w.x} y={1185} s={0.82} frame={f} sil={w.c} gloves outfit="shirt" flip={i === 1} armL={[30, 150]} armR={[30, 150]} pose={f < y13 + 32 ? "walk" : "stand"} step={Math.sin(f * 0.4 + i)} />
                </g>
              ))}
              <Hero x={950} y={1290} s={0.7} f={f} eyes="side" />
            </>
          ) : (
            <Hero x={170} y={1180} s={0.8} f={f} eyes={f > never ? "side" : "open"} flip />
          )}
        </Octagon>
        {shot === 0 ? <Suit x={540} y={by} s={0.95} f={f} armR={f > never ? [lerp(10, 100, ease(f, never, never + 8)), 100] : [14, 10]} /> : null}
      </Layer>
      <Layer depth={0}>
        {f >= never - 4 ? <Bubble x={lerp(760, 790, ease(f, never, d))} y={640} s={0.6 * Math.min(1, pop(f, never - 4, 10))} lines={["NEVER", "EVER"]} burst={ease(f, y13, y13 + 14)} /> : null}
        {f >= fight ? <rect x={0} y={0} width={1080} height={1920} fill="#FFF3C8" opacity={0.25 * (1 - ease(f, fight, fight + 8))} /> : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Sale: Auktionshammer; Münzturm wächst aus dem $2M-Stapel, Kamera folgt nach oben; weit: Zeitleiste 2001 → 2016. */
export const Sale: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const gavel = Math.max(0, B("gavel", 0));
  const tower = B("coinTower", 0.33);
  const from = W("From", 0.57);
  const arrow = B("timelineArrow", 0.86);
  const shot = shotIndex(f, [from]);
  const groundY = 1200;
  const th = 2600 * ease(f, tower - 4, from - 6, "inOut");
  const hit = gavel + 8;
  const gr = f < hit ? lerp(-70, 0, ease(f, gavel - 2, hit, "inOut")) : -Math.max(0, 10 * Math.sin((f - hit) * 0.5) * Math.exp(-(f - hit) * 0.2));
  const cam =
    shot === 0
      ? f < tower
        ? frameOn(560, 920, 540, 900, 0.98)
        : frameOn(560, lerp(920, groundY - th + 400, ease(f, tower, from, "inOut")), 540, 900, lerp(0.98, 0.8, ease(f, tower, from, "inOut")))
      : frameOn(560, lerp(groundY - 1300, groundY - 1100, ease(f, from, d, "inOut")), 540, 820, lerp(0.42, 0.46, ease(f, from, d, "inOut")));
  const shake = jolt(f, hit, 12);
  const at = ease(f, arrow - 4, arrow + 14, "inOut");
  return (
    <Stage2D cam={{ ...cam, y: cam.y + shake }} mood="night" noSky>
      <Layer>
        <FightHall phase="gold" f={f} fill={0.9} flashes={0.3} lights={0.8} />
        <rect x={-3000} y={groundY} width={7000} height={3000} fill="#2A1C0A" />
        <rect x={-3000} y={groundY} width={7000} height={14} fill={PAPER.ink} />
        {/* Auktionspult */}
        <g filter="url(#paper)">
          <rect x={150} y={1010} width={220} height={190} fill="#5A3A22" stroke={PAPER.ink} strokeWidth={7} />
          <rect x={200} y={980} width={120} height={30} rx={6} fill="#3E2716" stroke={PAPER.ink} strokeWidth={5} />
        </g>
        <Gavel x={160} y={940} s={0.7} r={gr} />
        <CoinStack x={430} y={groundY} n={3} w={110} />
        <TextBlock x={430} y={groundY - 130} w={150} h={70} text="$2M" size={46} fill={FIGHT.paper} fg={PAPER.ink} />
        <GoldTower x={790} y={groundY} h={th} w={230} />
        <Hero x={600} y={groundY} s={0.72} f={f} eyes={f > tower ? "up" : "open"} brows={f > tower ? "up" : "neutral"} mouth={f > tower ? "o" : "flat"} />
      </Layer>
      {shot === 1 ? (
        <Layer depth={0}>
          <g opacity={at}>
            <rect x={150} y={1130} width={780 * at} height={16} fill={FIGHT.gold} stroke={PAPER.ink} strokeWidth={4} />
            <path d={`M ${150 + 780 * at} 1112 L ${190 + 780 * at} 1138 L ${150 + 780 * at} 1164 Z`} fill={FIGHT.gold} stroke={PAPER.ink} strokeWidth={4} />
            <TextBlock x={190} y={1060} w={170} h={70} text="2001" size={48} fill={PAPER.ink} fg="#FFFFFF" />
            <TextBlock x={890} y={1060} w={170} h={70} text="2016" size={48} fill={PAPER.ink} fg={FIGHT.gold} />
          </g>
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Price: kalt; Spotlicht auf DEN KÄMPFER mit Preisschild; zwei Kreisdiagramme (≈1/5 vs. NBA ≈1/2); Gerichtsgebäude mit Aktenordnern. */
export const Price: React.FC = () => {
  const { f, d, B } = useBeats();
  const fifth = B("pieFifth", 0.4);
  const half = B("pieHalf", 0.61);
  const court = B("courthouse", 0.79);
  const y14 = court - 4;
  const cut1 = fifth - 8;
  const shot = shotIndex(f, [cut1, y14]);
  const hTop = headTop(HFEET);
  const cam =
    shot === 0
      ? frameOn(HX, hTop + 140, 540, 840, lerp(1.1, 1.42, ease(f, 0, cut1, "inOut")))
      : shot === 1
        ? frameOn(HX, 900, 540, 900, lerp(0.9, 0.86, ease(f, cut1, y14, "inOut")))
        : frameOn(540, 900, 540, 900, lerp(0.86, 0.92, ease(f, y14, d, "inOut")));
  const sy = 1250;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        {shot < 2 ? (
          <>
            <FightHall phase="cold" f={f} fill={0.25} lights={0.15} />
            <Octagon frontO={0.45}>
              <Hero x={HX} y={HFEET} f={f} headDown={0.3} eyes="open" brows="sad" mouth="flat" />
              <PriceTag x={HX + 115} y={HFEET - 220} s={0.55} swing={Math.sin(f * 0.12) * 8} text="?" />
            </Octagon>
            <SpotCone x={HX} y={HFEET + 8} o={1} w={300} dim={shot === 1 ? 0.62 : 0.5} color="#DCE8FF" />
          </>
        ) : (
          <>
            <FightHall phase="cold" f={f} noStands lights={0.3} />
            <rect x={-2000} y={1280} width={5000} height={2000} fill="#1A222C" />
            <Courthouse x={540} y={1280} s={0.95} />
            {[330, 540, 750].map((x, i) => (
              <g key={x}>
                <Figure x={x} y={sy} s={0.82} frame={f} sil={[SIL.fighterA, SIL.fighterB, "#4A4E5A"][i]} armR={[40, 80]} />
                <Folder x={x + 70 * 0.82 + 20} y={sy - 330} s={0.8} r={-8} />
              </g>
            ))}
            <Hero x={960} y={sy + 30} s={0.78} f={f} eyes="side" flip />
          </>
        )}
      </Layer>
      {shot === 1 ? (
        <Layer depth={0}>
          <Pie x={290} y={830} r={190} frac={0.19} t={ease(f, fifth - 2, fifth + 16, "inOut")} />
          <TextBlock x={290} y={1100} w={360} h={90} text="FIGHTERS" size={56} fill={FIGHT.red} fg="#FFFFFF" />
          {f >= half - 8 ? (
            <g opacity={ease(f, half - 8, half)}>
              <Pie x={790} y={830} r={190} frac={0.5} t={ease(f, half - 2, half + 16, "inOut")} color="#5B7FA8" />
              <Basketball x={790} y={830} r={56} />
              <TextBlock x={790} y={1100} w={360} h={90} text="NBA PLAYERS" size={50} fill="#5B7FA8" fg="#FFFFFF" />
            </g>
          ) : null}
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Empire: Namensblöcke (nur Text) krachen zum Turm zusammen; Bewertung 12,1 Mrd.; kleiner Vergleichs-Scheck; Medienvertrag am Bildschirm. */
export const Empire: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const crash = B("logoCrash", 0.12);
  const at = W("at", 0.25);
  const judge = W("judge", 0.44);
  const check = B("settlementCheck", 0.62);
  const months = W("Months", 0.74);
  const deal = B("streamDeal", 0.95);
  const shot = shotIndex(f, [at, judge, months]);
  const groundY = 1200;
  const merge = ease(f, crash - 12, crash, "inOut");
  const grow = ease(f, crash + 2, at + 30, "inOut");
  const th = lerp(260, 2400, grow);
  const cam =
    shot === 0
      ? frameOn(540, 900, 540, 900, lerp(0.95, 0.85, ease(f, 0, at, "inOut")))
      : shot === 1
        ? frameOn(540, lerp(700, 300, ease(f, at, judge, "inOut")), 540, 900, lerp(0.6, 0.46, ease(f, at, judge, "inOut")))
        : shot === 2
          ? frameOn(500, 920, 540, 900, lerp(0.92, 1.0, ease(f, judge, months, "inOut")))
          : frameOn(540, 860, 540, 880, lerp(0.95, 1.02, ease(f, months, d, "inOut")));
  const shake = jolt(f, crash, 14) + jolt(f, check, 8);
  const gHit = check - 2;
  const gr = f < gHit ? lerp(-60, 0, ease(f, gHit - 10, gHit, "inOut")) : 0;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + shake }} mood="night" noSky>
      <Layer>
        <FightHall phase={shot === 3 ? "dim" : "gold"} f={f} fill={0.9} flashes={shot < 2 ? 0.4 : 0} lights={0.8} />
        <rect x={-4000} y={groundY} width={9000} height={4000} fill="#24180A" />
        <rect x={-4000} y={groundY} width={9000} height={14} fill={PAPER.ink} />
        {shot < 3 ? (
          <>
            {merge < 1 ? (
              <>
                <TextBlock x={lerp(-80, 470, merge)} y={groundY - 130} w={300} h={260} text="UFC" size={110} fill="#2B2E36" fg="#F4F1EA" r={lerp(-8, 0, merge)} />
                <TextBlock x={lerp(1160, 610, merge)} y={groundY - 130} w={300} h={260} text="WWE" size={110} fill="#3A2F2A" fg="#F4F1EA" r={lerp(8, 0, merge)} />
              </>
            ) : (
              <GoldTower x={540} y={groundY} h={th} w={360} label="TKO" labelSize={170} />
            )}
            {shot >= 1 && th > 900 ? <TextBlock x={540} y={groundY - th - 220} w={420} h={130} text="$12.1B" size={96} fill={FIGHT.paper} fg={PAPER.ink} /> : null}
            {shot === 2 ? (
              <>
                <Gavel x={-60} y={790} s={0.9} r={gr} />
                <rect x={60} y={840} width={200} height={40} rx={8} fill="#3E2716" stroke={PAPER.ink} strokeWidth={5} />
                {f >= check - 2 ? <BigCheck x={250} y={1010} s={0.42 * Math.min(1, pop(f, check - 2, 10))} r={-6} amount="$375M" memo="SETTLEMENT" /> : null}
              </>
            ) : null}
            <Hero x={shot === 2 ? 250 : 880} y={groundY + 40} s={shot === 2 ? 0.66 : 0.6} f={f} eyes={shot === 2 ? "down" : "up"} brows="sad" flip={shot !== 2} />
          </>
        ) : (
          <>
            <StreamScreen x={540} y={800} s={0.95} lines={["$7.7B", "7 YEARS", "MEDIA DEAL"]} t={ease(f, months, Math.min(deal, months + 40), "inOut")} />
            <g transform="translate(860 1120) rotate(6)" filter="url(#paper)">
              <rect x={-120} y={-60} width={240} height={120} rx={12} fill="#4A3A5A" stroke={PAPER.ink} strokeWidth={7} />
              <text x={0} y={22} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={64} fill="#E6DDF0">
                PPV
              </text>
              <line x1={-130} y1={-70} x2={-130 + 260 * ease(f, months + 30, months + 44)} y2={-70 + 140 * ease(f, months + 30, months + 44)} stroke={FIGHT.red} strokeWidth={18} strokeLinecap="round" />
            </g>
            <Octagon g={{ cx: 230, cy: 1210, rx: 230, ry: 66, h: 150 }} frontO={0.6}>
              <Hero x={230} y={1215} s={0.42} f={f} eyes="up" brows="sad" />
            </Octagon>
          </>
        )}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Ending: Split links Goldturm „$12.1B“ / rechts DER KÄMPFER mit kleinem Scheck; Waage + Auswahl; Oktagon-Wipe zurück zum Hook. */
export const Ending: React.FC = () => {
  const { f, B } = useBeats();
  const split = Math.max(0, B("splitScreen", 0.07));
  const small = B("smallCheck", 0.24);
  const tilt = B("scaleTilt", 0.45);
  const loop = B("loopToCage", 0.9);
  const shot = shotIndex(f, [tilt - 6, loop]);
  const sep = ease(f, split - 4, split + 10, "inOut");
  if (shot === 2) {
    return (
      <Stage2D cam={frameOn(HX, 820, 540, 900, 1.08)} mood="night" noSky>
        <Layer>
          <HookSet f={f} pile={0.8} sky={0} tag={0} look={0} />
        </Layer>
        <Layer depth={0}>
          <Clipping x={270} y={760} s={0.55} r={-7} lines={["“HUMAN", "COCKFIGHTING”"]} />
          <OctagonWipe local={f - loop} color={FIGHT.red} />
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const tl = lerp(0, -16, ease(f, tilt, tilt + 20, "inOut")) + Math.sin(f * 0.15) * 1.5;
    return (
      <Stage2D cam={frameOn(540, 900, 540, 900, 1)} mood="night" noSky>
        <Layer>
          <FightHall phase="dim" f={f} fill={0.6} lights={0.5} />
          <Scale
            x={540}
            y={1300}
            s={1.15}
            tilt={tl}
            left={<CoinStack x={0} y={-10} n={14} w={140} />}
            right={<BigCheck x={0} y={-50} s={0.16} amount="$375M" />}
          />
          <Hero x={930} y={1300} s={0.6} f={f} eyes="up" brows="sad" flip />
        </Layer>
        <Layer depth={0}>
          <OctagonWipe local={f - loop} color={FIGHT.red} />
        </Layer>
      </Stage2D>
    );
  }
  const half = (left: boolean) => (
    <AbsoluteFill style={{ clipPath: left ? `inset(0 ${540 + 4}px 0 0)` : `inset(0 0 0 ${540 + 4}px)`, transform: `translateX(${(left ? -1 : 1) * 60 * (1 - sep)}px)` }}>
      {left ? (
        <Stage2D cam={frameOn(540, 520, 270, 820, 0.62)} mood="night" noSky>
          <Layer>
            <FightHall phase="gold" f={f} fill={1} flashes={0.6} />
            <rect x={-3000} y={1200} width={7000} height={3000} fill="#24180A" />
            <GoldTower x={540} y={1200} h={1700} w={420} label="TKO" labelSize={190} />
            <TextBlock x={540} y={-120} w={520} h={150} text="$12.1B" size={120} fill={FIGHT.paper} fg={PAPER.ink} />
          </Layer>
        </Stage2D>
      ) : (
        <Stage2D cam={frameOn(HX, headTop(HFEET) + 220, 810, 860, 1.05)} mood="night" noSky>
          <Layer>
            <FightHall phase="cold" f={f} fill={0.3} lights={0.2} />
            <Octagon frontO={0.4}>
              <Hero x={HX} y={HFEET} f={f} armR={[70, 120]} headDown={0.4} eyes="down" brows="sad" mouth="frown" />
            </Octagon>
            {f >= small - 4 ? <BigCheck x={HX + 150} y={HFEET - 420} s={0.24 * Math.min(1, pop(f, small - 4, 10))} r={-10} amount="$375M" /> : null}
            <SpotCone x={HX} y={HFEET + 8} o={1} w={260} dim={0.4} color="#DCE8FF" />
          </Layer>
        </Stage2D>
      )}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: PAPER.ink }}>
      {half(true)}
      {half(false)}
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <rect x={534} y={0} width={12} height={1920 * sep} fill="#F4F1EA" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
