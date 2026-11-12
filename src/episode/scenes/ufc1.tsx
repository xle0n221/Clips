import React from "react";
import {
  BigCheck,
  Bill2,
  Chart,
  Clipping,
  Envelope,
  ease,
  FIGHT,
  Figure,
  FightHall,
  frameOn,
  jolt,
  Layer,
  lerp,
  Octagon,
  Padlock,
  PAPER,
  pop,
  RetroTV,
  RoundClock,
  RuleSheet,
  Stage2D,
  Suitcase,
  TextBlock,
  USMap,
  VHS,
  camPath,
} from "../kit2d";
import { shotIndex } from "../types";
import { headTop, Hero, HFEET, HookSet, HX, SIL, Suit, useBeats } from "./ufcSets";

/**
 * „The rise of the UFC“ Teil 1 (hook … zuffa). 2D Fight-Poster/Paper-Cut (Drehbuch `style`).
 * Ruhiges Tempo (Nutzer 12.11.2026): Einstellungen ≈ 3–4 s, Kamera nur weich (`inOut`), Ortswechsel
 * innerhalb einer Szene als Prospekt/Überblendung; Whip/Wipe nur an Szenengrenzen (scenes/ufc.tsx).
 */

const RULES_KEEP = ["NO BITING", "NO EYE-GOUGING", "NO GROIN SHOTS"] as const;

/* ------------------------------------------------------------------ */

/** Hook: Käfig im Spotlicht, Goldberg wächst; Zeitungsausschnitt; Zoom-out zur Gold-Skyline; Preisschild „?“. */
export const Hook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const cock = W("called", 0.2); // erst nach dem Cover (Befund Cover-Ende)
  const gold = B("goldSkyline", 0.64);
  const price = B("priceTag", 0.9);
  const pile = 0.75 + 0.25 * ease(f, 0, gold, "inOut");
  const sky = ease(f, gold - 6, gold + 40, "inOut");
  const cam = camPath(f, [
    [0, frameOn(HX, 820, 540, 900, 1.06)],
    [gold - 4, frameOn(HX, 800, 540, 900, 1.2)],
    [Math.min(price - 8, gold + 40), frameOn(560, 640, 540, 860, 0.62)],
    [Math.min(d, price + 18), frameOn(HX, headTop(HFEET) + 160, 540, 860, 0.95)],
  ]);
  const clipIn = ease(f, cock - 2, cock + 12, "inOut");
  const clipOut = ease(f, gold - 10, gold + 6, "inOut");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <HookSet f={f} pile={pile} sky={sky} tag={ease(f, price - 2, price + 8)} look={ease(f, price - 4, price + 6, "inOut")} spot={1 - 0.6 * sky + 0.5 * ease(f, price, price + 18)} />
      </Layer>
      {clipIn > 0 && clipOut < 1 ? (
        <Layer depth={0}>
          <Clipping x={lerp(-360, 270, clipIn) - 500 * clipOut} y={760} s={0.55} r={lerp(-25, -7, clipIn)} lines={["“HUMAN", "COCKFIGHTING”"]} />
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/** Cover (Bilder 0–14): Hook-Motiv mit vollem Goldberg, Kämpfer schaut in die Kamera; Titel liegt oben. */
export const UfcCoverArt: React.FC = () => (
  <Stage2D cam={frameOn(HX, 860, 540, 1040, 1.05)} mood="night" noSky>
    <Layer>
      <HookSet f={0} pile={1.05} sky={0.25} tag={1} look={1} spot={0.9} />
    </Layer>
  </Stage2D>
);

/* ------------------------------------------------------------------ */

const MARCH = [
  { sil: "#6B5A48", s: 0.74, row: 0, outfit: "trunks" as const },
  { sil: "#D8D2C4", s: 0.78, row: 0, outfit: "coat" as const },
  { sil: "#4E5E72", s: 0.86, row: 0, outfit: "trunks" as const, one: true },
  { sil: "#5A4E6A", s: 0.72, row: 0, outfit: "shirt" as const },
  { sil: "#3E5A5C", s: 0.92, row: 1, outfit: "trunks" as const },
  { sil: "", s: 0.86, row: 1, outfit: "trunks" as const },
  { sil: "#7A6250", s: 0.98, row: 1, outfit: "plain" as const },
  { sil: "#5C4040", s: 0.8, row: 1, outfit: "shirt" as const },
];

/** Start: Denver 1993, halb leere Ränge, acht Kämpfer marschieren ein, Käfig senkt sich; Regelzettel; Scheck. */
export const Start: React.FC = () => {
  const { f, d, B } = useBeats();
  const march = B("eightMarch", 0.31);
  const drop = march + 10; // Käfig senkt sich, wenn die Kämpfer ankommen (ein Ereignis statt zwei)
  const rules = B("rulesCrossedOut", 0.58);
  const check = B("bigCheck", 0.83);
  const cut = rules - 8;
  const shot = shotIndex(f, [cut]);
  const cam =
    shot === 0
      ? frameOn(540, lerp(860, 900, ease(f, 0, cut, "inOut")), 540, 900, lerp(0.84, 0.96, ease(f, 0, cut, "inOut")))
      : frameOn(lerp(420, 380, ease(f, cut, d, "inOut")), 760, 540, 900, 1.08);
  const shake = jolt(f, drop, 10);
  const dropT = ease(f, drop - 14, drop + 4, "linear");
  return (
    <Stage2D cam={{ ...cam, y: cam.y + shake }} mood="night" noSky>
      <Layer>
        <FightHall phase="red" f={f} fill={0.38} lights={0.75} />
        <Octagon drop={dropT}>
          {MARCH.map((m, i) => {
            const k = m.row ? i - 4 : i;
            const tx = 160 + k * 250 + (m.row ? 0 : 120);
            const startX = -160 - k * 110 - (m.row ? 0 : 120);
            const t = ease(f, k * 4, march + 22 + k * 6, "inOut"); // marschieren ab Bild 0 (kein leeres Oktagon)
            const x = lerp(startX, tx, t);
            const walking = t > 0 && t < 1;
            const y = m.row ? 1235 : 1075;
            if (!m.sil)
              return <Hero key={i} x={x} y={y} s={m.s} f={f} pose={walking ? "walk" : "stand"} step={Math.sin(f * 0.35)} armL={[24, 150]} armR={[24, 150]} mouth="grit" brows="angry" />;
            return (
              <Figure
                key={i}
                x={x}
                y={y}
                s={m.s}
                frame={f}
                sil={m.sil}
                outfit={m.outfit}
                coatColor={m.outfit === "coat" ? m.sil : undefined}
                gloves={Boolean(m.one)}
                gloveSide={m.one ? 1 : undefined}
                pose={walking ? "walk" : "stand"}
                step={Math.sin(f * 0.35 + i)}
              />
            );
          })}
        </Octagon>
      </Layer>
      {shot === 1 ? (
        <Layer depth={0}>
          <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0.45 * ease(f, cut, cut + 10)} />
          <RuleSheet x={lerp(440, 450, ease(f, cut, d))} y={lerp(1500, 640, ease(f, cut, cut + 14, "inOut"))} s={0.6} r={-4} cross={ease(f, rules, rules + 22, "inOut")} keep={RULES_KEEP} />
          {f >= check - 6 ? <BigCheck x={lerp(1500, 540, ease(f, check - 6, check + 10, "inOut"))} y={1080} s={0.56} r={-5} amount="$50,000" memo="WINNER TAKES IT" /> : null}
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Ban: SENATOR (Silhouette) vor dem Röhrenfernseher; Ausschnitt kehrt zurück; Briefe über die USA-Karte; 36 Felder rot, Schloss am Käfig. */
export const Ban: React.FC = () => {
  const { f, d, B } = useBeats();
  const tape = B("tvTape", 0.2);
  const clip = tape + 14; // Ausschnitt kommt mit dem Band (ein Beat)
  const letters = B("lettersFly", 0.53);
  const red = B("statesRed", 0.78);
  const shot = shotIndex(f, [letters]);
  const sy = 1290;
  const sTop = headTop(sy, 0.95);
  const cam =
    shot === 0
      ? frameOn(560, sTop, 540, 715, lerp(0.92, 1.0, ease(f, 0, letters, "inOut")))
      : frameOn(540, 900, 540, 860, lerp(1.0, 1.06, ease(f, letters, d, "inOut")));
  const clipT = ease(f, clip - 4, clip + 12, "inOut");
  const mini = { cx: 840, cy: 1215, rx: 170, ry: 50, h: 120 };
  return (
    <Stage2D cam={cam} mood="night" noSky>
      {shot === 0 ? (
        <>
          <Layer>
            <FightHall phase="cool" f={f} noStands lights={0.3} />
            {/* Zimmerwand + Fenster mit Jalousie */}
            <rect x={-400} y={300} width={1900} height={1000} fill="#2A3A4E" />
            {Array.from({ length: 16 }, (_, k) => (
              <rect key={k} x={-400 + k * 120} y={300} width={6} height={1000} fill="#25344A" />
            ))}
            <rect x={-120} y={420} width={380} height={420} fill="#9DB4CF" stroke={PAPER.ink} strokeWidth={8} />
            {Array.from({ length: 10 }, (_, k) => (
              <rect key={k} x={-120} y={430 + k * 41} width={380} height={18} fill="#6E87A6" />
            ))}
            <rect x={-400} y={1290} width={1900} height={600} fill="#1C2634" />
            {/* Tisch + TV + Kassette */}
            <rect x={620} y={1060} width={460} height={34} fill="#5A4030" stroke={PAPER.ink} strokeWidth={6} />
            <rect x={650} y={1094} width={26} height={196} fill="#4A3426" />
            <rect x={1030} y={1094} width={26} height={196} fill="#4A3426" />
            <RetroTV
              x={860}
              y={1060}
              s={0.78}
              f={f}
              screen={
                f >= tape ? (
                  <g>
                    <Octagon g={{ cx: 0, cy: 50, rx: 120, ry: 34, h: 70 }} frontO={0.4}>
                      <Figure x={-40 + Math.sin(f * 0.5) * 10} y={52} s={0.16} frame={f} sil="#E9EEF5" gloves armL={[30, 150]} armR={[lerp(30, 90, Math.max(0, Math.sin(f * 0.5))), 120]} />
                      <Figure x={45} y={56} s={0.16} frame={f} sil="#C9D2DE" flip gloves armL={[30, 150]} armR={[30, 150]} lean={Math.sin(f * 0.5) * 6} />
                    </Octagon>
                  </g>
                ) : null
              }
            />
            {f >= tape - 10 ? <VHS x={lerp(1300, 700, ease(f, tape - 10, tape + 4, "inOut"))} y={1030} s={0.42} r={-6} /> : null}
            <Suit x={540} y={sy} s={0.95} f={f} armR={[24, 70]} />
          </Layer>
          {clipT > 0 ? (
            <Layer depth={0}>
              <Clipping x={lerp(-360, 290, clipT)} y={lerp(560, 600, clipT)} s={0.5} r={lerp(-30, -9, clipT)} lines={["“HUMAN", "COCKFIGHTING”"]} />
            </Layer>
          ) : null}
        </>
      ) : (
        <Layer>
          <FightHall phase="cool" f={f} noStands lights={0.4} />
          <USMap x={540} y={800} s={0.98} red={ease(f, red - 2, red + 30, "linear")} f={f} />
          {Array.from({ length: 12 }, (_, i) => {
            const t = ease(f, letters + i * 3, letters + i * 3 + 26, "inOut");
            if (t <= 0 || t >= 1) return null;
            const tx = 140 + ((i * 197) % 800);
            const ty = 640 + ((i * 113) % 300);
            return <Envelope key={`e${i}`} x={lerp(-120, tx, t)} y={lerp(1150, ty, t) - Math.sin(t * Math.PI) * 180} s={0.7} r={lerp(-30, 10, t)} />;
          })}
          <Octagon g={mini} frontO={0.75}>
            <Hero x={mini.cx} y={mini.cy + 6} s={0.32} f={f} armL={[lerp(20, 70, ease(f, red, red + 12)), 160]} armR={[lerp(20, 70, ease(f, red, red + 12)), 160]} eyes={f > red ? "wide" : "open"} brows="sad" mouth="frown" />
          </Octagon>
          {f >= red + 6 ? <Padlock x={mini.cx + 40} y={lerp(900, mini.cy + 20, ease(f, red + 6, red + 18, "inOut"))} s={0.55} /> : null}
        </Layer>
      )}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Rules: Regelzettel bekommt drei Stempel; DER KÄMPFER im Käfig mit Rundenuhr; Licht fällt, Büro-Prospekt mit Mahnungen. */
export const Rules: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const stamp = B("rulesStamp", 0.08);
  const sWeight = W("weight", 0.24);
  const sGloves = W("gloves", 0.37);
  const sRounds = W("rounds", 0.5);
  const clock = B("roundClock", 0.5);
  const still = W("Still", 0.64);
  const bills = B("redBills", 0.88);
  const cut = sRounds + 12;
  const shot = shotIndex(f, [cut]);
  const dark = ease(f, still - 4, still + 20, "inOut");
  const officeDown = ease(f, still, still + 26, "linear");
  const cam =
    shot === 0
      ? frameOn(400, 900, 540, 900, 1.0)
      : frameOn(HX, lerp(820, 860, ease(f, cut, d, "inOut")), 540, 900, lerp(1.12, 1.0, ease(f, cut, d, "inOut")));
  const tug = ease(f, cut, cut + 18, "inOut");
  const officeY = lerp(-1300, 0, officeDown < 1 ? 1 + 2.4 * Math.pow(officeDown - 1, 3) + 1.4 * Math.pow(officeDown - 1, 2) : 1);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <FightHall phase={shot === 0 ? "red" : "dim"} f={f} fill={0.5} lights={1 - dark * 0.8} />
        {officeDown > 0 ? (
          <g transform={`translate(0 ${officeY})`} filter="url(#paper)">
            {/* Büro-Prospekt: Wand, Fenster mit Firmenschild (nur Text), fallende Kurve */}
            <rect x={-110} y={300} width={1300} height={760} fill="#4A3E36" stroke={PAPER.ink} strokeWidth={10} />
            <rect x={40} y={380} width={380} height={300} fill="#24303E" stroke={PAPER.ink} strokeWidth={8} />
            <TextBlock x={230} y={460} w={180} h={84} text="SEG" size={56} fill="#C9B27A" fg="#2A2018" />
            <Chart x={820} y={560} s={0.8} t={ease(f, still + 10, bills, "inOut")} />
          </g>
        ) : null}
        <Octagon>
          <Hero
            x={HX}
            y={HFEET}
            f={f}
            armL={[lerp(10, 40, tug), lerp(10, 150, tug)]}
            armR={[lerp(60, 30, tug), lerp(-40, 150, tug)]}
            headDown={0.5 * dark}
            eyes={dark > 0.5 ? "down" : "open"}
            brows={dark > 0.5 ? "sad" : "neutral"}
            mouth={dark > 0.5 ? "frown" : "flat"}
                      />
        </Octagon>
        {shot === 1 ? <RoundClock x={HX} y={headTop(HFEET) - 6 - 70} s={0.62} text="5:00" o={ease(f, Math.max(cut, clock), Math.max(cut, clock) + 8)} /> : null}
        {Array.from({ length: 12 }, (_, i) => {
          const t0 = still + 6 + i * 4;
          const t = ease(f, t0, t0 + 22, "inOut");
          if (t <= 0) return null;
          const x = 120 + ((i * 271) % 840);
          return <Bill2 key={i} x={x} y={lerp(300, 1150 - (i % 3) * 40, t)} s={0.62} r={lerp(-40, (i % 5) * 9 - 18, t)} />;
        })}
        <rect x={-2000} y={-2000} width={5000} height={6000} fill="#000" opacity={0.35 * dark} />
      </Layer>
      {shot === 0 ? (
        <Layer depth={0}>
          <RuleSheet
            x={440}
            y={lerp(1500, 640, ease(f, 0, 12, "inOut"))}
            s={0.6}
            r={-4}
            cross={1}
            keep={RULES_KEEP}
            stamps={[
              ["WEIGHT CLASSES", ease(f, Math.max(stamp, sWeight - 4), sWeight + 4)],
              ["GLOVES", ease(f, sGloves - 4, sGloves + 4)],
              ["ROUNDS", ease(f, sRounds - 4, sRounds + 4)],
            ]}
          />
        </Layer>
      ) : null}
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Zuffa: zwei Anzug-Silhouetten am Tisch, Geldkoffer gegen U·F·C-Buchstaben + ramponierten Käfig; Freeze + Markierung am Zähler. */
export const Zuffa: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const mil = W("million", 0.53);
  const suitcase = B("suitcase", 0.53);
  const hold = B("freezeMark", 0.75);
  const cut = W("2", 0.49) - 6;
  const shot = shotIndex(f, [cut]);
  const ff = Math.min(f, hold + 2);
  const sy = 1240;
  const top = headTop(sy, 0.92);
  const cam =
    shot === 0
      ? frameOn(560, top, 540, 715, lerp(0.86, 0.94, ease(f, 0, cut, "inOut")))
      : frameOn(560, top, 540, 715, lerp(1.08, 1.16, ease(ff, cut, d, "inOut")));
  const slide = ease(ff, suitcase - 14, suitcase + 10, "inOut");
  const lettersIn = (k: number) => pop(ff, mil + 4 + k * 5, 10);
  const frozen = f >= hold;
  const mark = frozen ? pop(f, hold, 10) : 0;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <Layer>
        <FightHall phase="gold" f={ff} fill={0.15} lights={0.45} />
        {/* ramponierter Käfig im Hintergrund, DER KÄMPFER sitzt darin */}
        <Octagon g={{ cx: 1000, cy: 1000, rx: 300, ry: 90, h: 190 }} battered frontO={0.6}>
          <Hero x={1000} y={1004} s={0.42} f={ff} pose="sit" headDown={0.5} eyes="down" brows="sad" />
        </Octagon>
        <Suit x={470} y={sy} s={0.92} f={ff} armR={[30, 80]} />
        <Suit x={650} y={sy} s={0.92} f={ff} color={SIL.suit2} armL={[30, 80]} />
        {/* Tisch */}
        <rect x={60} y={1040} width={980} height={40} rx={8} fill="#6B4A2E" stroke={PAPER.ink} strokeWidth={7} filter="url(#paper)" />
        <rect x={110} y={1080} width={880} height={220} fill="#4E3420" stroke={PAPER.ink} strokeWidth={7} />
        <Suitcase x={lerp(560, 1220, slide)} y={1044} s={0.5} />
        {["U", "F", "C"].map((ch, k) =>
          lettersIn(k) > 0 ? (
            <TextBlock key={ch} x={360 + k * 150} y={980 - 30 * (1 - lettersIn(k))} w={120} h={120} text={ch} size={92} fill={FIGHT.paper} fg={PAPER.ink} r={(k - 1) * 6} o={Math.min(1, lettersIn(k))} />
          ) : null,
        )}
        {frozen ? <rect x={-2000} y={-2000} width={5000} height={6000} fill="#3A3A3A" opacity={0.35} style={{ mixBlendMode: "saturation" }} /> : null}
      </Layer>
      {frozen ? (
        <Layer depth={0}>
          <rect x={40} y={176} width={600} height={140} rx={20} fill="none" stroke="#FFD23F" strokeWidth={12} transform={`translate(340 246) scale(${0.8 + 0.2 * mark}) translate(-340 -246)`} opacity={Math.min(1, mark * 1.5)} />
        </Layer>
      ) : null}
    </Stage2D>
  );
};
