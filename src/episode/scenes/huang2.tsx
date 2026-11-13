import React from "react";
import { clamp01, ease, frameOn, jolt, Layer, lerp, LuxDefs, pop, Stage2D } from "../kit2d";
import { shotIndex } from "../types";
import {
  BallotBox,
  Bg,
  BoardMember,
  BurningChart,
  CalBlock,
  CalSheet,
  ChipShelf,
  EmptyJacket,
  ExecChair,
  Flies,
  HG,
  HText,
  Jensen,
  LeafBlower,
  MilkCarton,
  NamePlate,
  Note,
  OFFICE,
  Office,
  Receipt,
  ServerRack,
  StockChart,
  Stopwatch,
  ThumbStamp,
} from "./huangSets";
import type { ChartPt } from "./huangSets";
import { useBeats } from "./rollsSets";

/**
 * „What Jensen Huang's affairs mean for NVIDIA“ Teil 2 (twist … loop). Gleiche Regeln wie huang1.tsx.
 * Loop: Endbild = Cover-Bild (leere Jacke am Bügel vor rotem Kurs-Absturz, Kalender SUN) → Satz 1 „On Sunday …“.
 */

const DAYS = ["SUN", "MON", "TUE", "WED", "THU"];

/** Cover-/Loop-Bild: Chefbüro, Kurs stürzt rot, Kalender SUN, leere Lederjacke am Bügel. */
export const CoverScene: React.FC<{ readonly f: number; readonly zoom?: number }> = ({ f, zoom = 1.04 }) => (
  <Stage2D cam={frameOn(600, 1000, 540, 1110, zoom)} mood="night" noSky>
    <LuxDefs />
    <Layer>
      <Office f={f} crash={1} />
      <CalBlock x={OFFICE.calX - 20} y={OFFICE.calY + 210} s={0.8} day="SUN" sub="NOV 2026" />
      <EmptyJacket x={700} y={OFFICE.floor} s={0.95} frame={f} swing={2 * Math.sin(f * 0.08)} />
    </Layer>
  </Stage2D>
);

/* ------------------------------------------------------------------ */

const TWIST_PTS: readonly ChartPt[] = [
  { x: -380, y: -200, label: "OCT RECORD" },
  { x: -260, y: -150 },
  { x: -150, y: -175 },
  { x: -40, y: -60, label: "NOV 5" },
  { x: 90, y: -30 },
  { x: 220, y: 60 },
  { x: 350, y: 170 },
];

/** Twist: Record-Scratch, Chart spult zurück bis NOV 5 (Fall schon VOR der Untersuchung); dann brennender Papp-Chart (Wahlurne + Rechenzentrum-§), JENSEN kommt mit Laubbläser. */
export const Twist: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const rewind = B("rewindChart", 0.04);
  const nov5 = B("nov5Drop", 0.31);
  const ballot = B("ballotIcon", 0.6);
  const affair = W("affair", 0.7);
  const blower = B("leafBlower", 0.85);
  const shot = shotIndex(f, [ballot]);
  if (shot === 0) {
    const back = ease(f, rewind, rewind + 34, "inOut");
    const upto = f < nov5 ? lerp(6, 2, back) : 2 + ease(f, nov5, nov5 + 12, "inOut");
    const cam = frameOn(lerp(540, 470, ease(f, rewind + 20, nov5, "inOut")), lerp(880, 800, ease(f, rewind + 20, nov5, "inOut")), 540, 900, lerp(1.0, 1.22, ease(f, rewind + 20, nov5 + 10, "inOut")));
    const scan = f < nov5 ? clamp01(back * 4) * (1 - back * 0.5) : 0;
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, nov5, 10) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Bg id="twist" a="#2A2014" b="#4A3820" />
          <StockChart x={540} y={880} pts={TWIST_PTS} upto={upto} f={f} w={900} h={560} color={f >= nov5 ? HG.red : "#C9A77A"} fill="#1A1610" />
          {f >= nov5 ? (
            <g opacity={ease(f, nov5 + 8, nov5 + 16)}>
              <rect x={370} y={640} width={150} height={220} rx={10} fill={HG.red} opacity={0.18 + 0.08 * Math.sin(f * 0.3)} />
            </g>
          ) : null}
        </Layer>
        <Layer depth={0}>
          {scan > 0 ? (
            <g opacity={scan}>
              {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x={0} y={((i * 170 + f * 23) % 1920) - 10} width={1080} height={10} fill="#FFFFFF" opacity={0.12} />
              ))}
              {/* Rückspul-Symbol als Geometrie (zwei Dreiecke) */}
              <g transform="translate(860 1160)">
                <path d="M 0 -50 L -80 0 L 0 50 Z M 80 -50 L 0 0 L 80 50 Z" fill="#FFFFFF" stroke={HG.ink} strokeWidth={6} strokeLinejoin="round" />
              </g>
            </g>
          ) : null}
        </Layer>
      </Stage2D>
    );
  }
  const cam = frameOn(560, 1000, 540, 960, lerp(1.0, 1.05, ease(f, ballot, d, "inOut")));
  const heat = 0.45 + 0.9 * ease(f, blower, blower + 10);
  const walk = ease(f, affair - 4, affair + 18, "inOut");
  const jx = lerp(1350, 950, walk);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, blower, 8) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="twist2" a="#2A1A10" b="#5A2E14" />
        <rect x={-2000} y={1250} width={6000} height={2000} fill="#2E1E14" />
        <BallotBox x={150} y={1250} s={0.72} t={ease(f, ballot, ballot + 12)} />
        <ServerRack x={330} y={1250} s={0.72 * pop(f, ballot + 6, 10)} f={f} />
        <BurningChart x={640} y={1250} s={0.9} f={f} heat={heat} />
        <Jensen
          x={jx}
          y={1250}
          s={0.72}
          frame={f}
          flip
          armA={[16, 10]}
          armB={[80, 12]}
          eyes="side"
          mouth={f >= blower ? "grin" : "smirk"}
          nod={Math.sin(walk * Math.PI * 4) * 4}
          blinkSeed={6}
          holdB={(hx, hy) => (
            <g transform={`translate(${hx} ${hy}) scale(-1 1)`}>
              <LeafBlower x={0} y={0} s={1.1} f={f} blow={ease(f, blower - 4, blower + 4)} />
            </g>
          )}
        />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** PR: Callback – Daumen-Stempel + Kalender SUN→THU; Rücktritts-Karte + Namensschild-Tausch; Milchtüte gegen „CONFIDENCE“ (Milch gewinnt). */
export const Pr: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const stamp = B("stampCallback", 0.07);
  const thu = W("Thursday", 0.19);
  const resign = B("resignCard", 0.26);
  const corp = W("corporate", 0.55);
  const milk = B("milkVsConfidence", 0.86);
  const shot = shotIndex(f, [resign, corp]);
  if (shot === 0) {
    const cam = frameOn(540, 960, 540, 960, lerp(1.0, 1.06, ease(f, 0, resign, "inOut")));
    const torn = f < thu ? 0 : Math.min(4, Math.floor((f - thu) / 3) + 1);
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Office f={f} crash={1} dim={0.35} />
          <ThumbStamp x={540} y={790} s={0.9} t={ease(f, stamp, stamp + 8)} r={-6} />
          <CalBlock x={540} y={1100} s={0.75} day={DAYS[torn]} sub="NOV 2026" />
        </Layer>
        <Layer depth={0}>
          {[0, 1, 2, 3].map((i) => {
            const t = (f - thu - i * 3) / 22;
            if (t <= 0 || t >= 1) return null;
            return <CalSheet key={i} x={lerp(540, 1250, t)} y={1080 - Math.sin(t * Math.PI) * 200} r={t * 80 + i * 6} s={0.7} day={DAYS[i]} />;
          })}
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const cam = frameOn(560, 980, 540, 960, lerp(1.0, 1.05, ease(f, resign, corp, "inOut")));
    const swap = ease(f, resign + 30, resign + 40, "inOut");
    const plateS = Math.abs(Math.cos(swap * Math.PI));
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Bg id="pr2" a="#6A5470" b="#8C6E80" />
          <rect x={-2000} y={1250} width={6000} height={2000} fill="#4A3646" />
          <ExecChair x={780} y={1250} s={0.72} spin={0} />
          <rect x={560} y={1120} width={460} height={130} fill="#6B4A32" stroke={HG.ink} strokeWidth={8} />
          <g transform={`translate(790 1112) scale(1 ${Math.max(0.05, plateS)})`}>
            {swap < 0.5 ? <NamePlate x={0} y={0} text="CEO" w={300} /> : <NamePlate x={0} y={0} text="INTERIM CEO: THE CFO" w={420} fill={HG.yellow} />}
          </g>
          <Note x={lerp(-300, 300, ease(f, resign, resign + 12, "inOut"))} y={860} s={0.78} r={-5} lines={["RESIGNED:", "CEO · BOARD", "EFFECTIVE", "IMMEDIATELY"]} fill="#FFE3E3" size={62} />
        </Layer>
      </Stage2D>
    );
  }
  const cam = frameOn(540, 980, 540, 960, lerp(1.0, 1.07, ease(f, corp, d, "inOut")));
  const win = ease(f, milk, milk + 10);
  const hop = milk <= f && f < milk + 16 ? Math.sin(((f - milk) / 16) * Math.PI) * 80 : 0;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="pr3" a="#F2E6CF" b="#E3CFA8" />
        <rect x={-2000} y={1250} width={6000} height={2000} fill="#C9A77A" />
        {/* Podest: Milch auf Platz 1 */}
        <g filter="url(#paper)">
          <rect x={590} y={1150 - 100 * win} width={340} height={100 + 100 * win} fill="#F2C14E" stroke={HG.ink} strokeWidth={7} />
          <rect x={150} y={1150} width={360} height={100} fill="#C9CED8" stroke={HG.ink} strokeWidth={7} />
        </g>
        <ThumbStamp x={330} y={960} s={0.62} t={ease(f, corp, corp + 8)} r={-4} mold={ease(f, milk + 4, milk + 20)} color={win > 0 ? "#8FA05A" : HG.green} />
        <Flies x={330} y={940} f={f} o={ease(f, milk + 8, milk + 18)} />
        <g opacity={ease(f, corp + 10, corp + 18)}>
          <Note x={330} y={1100} s={0.56} r={2} lines={["BEST BEFORE: 4 DAYS"]} fill="#FFFFFF" size={50} />
        </g>
        <MilkCarton x={760} y={1150 - 100 * win - hop} s={0.85} f={f} medal={pop(f, milk + 6, 10)} happy={win} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Answer: Kassenbon rollt aus (Posten nacheinander); dann Lagerregal voller Chips, nur Fach „TRUST“ leer; am Ende Kalenderblatt „NOV 17 · Q3 EARNINGS“ (nur Bild). */
export const Answer: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const cost = B("receiptFull", 0.08);
  const secrets = W("secrets", 0.56);
  const shelf = B("emptyShelf", 0.86);
  const shot = shotIndex(f, [secrets]);
  if (shot === 0) {
    const cam = frameOn(540, 930, 540, 930, lerp(1.0, 1.05, ease(f, 0, secrets, "inOut")));
    const step = Math.max(14, Math.round((secrets - cost - 24) / 4));
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Bg id="answer" a="#E9E2D2" b="#CFC4AE" />
          <rect x={160} y={570} width={760} height={40} rx={12} fill="#3C4152" stroke={HG.ink} strokeWidth={7} />
          <Receipt
            x={540}
            y={600}
            s={1}
            t={ease(f, 0, cost + 4 * step + 10, "linear")}
            f={f}
            show={[cost + 6, cost + 6 + step, cost + 6 + 2 * step, cost + 6 + 3 * step]}
            items={[
              ["CHIPS:", "NO CHANGE (BOARD SAYS)"],
              ["STOCK:", "−30% FROM RECORD (NOV 12)", HG.red],
              ["CEO:", "GONE", HG.red],
              ["TRUST:", "OUT OF STOCK", HG.red],
            ]}
          />
        </Layer>
      </Stage2D>
    );
  }
  const cam = frameOn(540, 960, 540, 960, lerp(1.0, 1.06, ease(f, secrets, d, "inOut")));
  const cal = pop(f, shelf + 8, 10);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="answer2" a="#2E3A4A" b="#4A5A6E" />
        <rect x={-2000} y={1240} width={6000} height={2000} fill="#26303C" />
        <ChipShelf x={540} y={1240} s={0.95} empty={ease(f, shelf, shelf + 8)} f={f} />
        {cal > 0 ? <CalBlock x={880} y={760} s={0.6 * cal} day="NOV 17" sub="Q3 EARNINGS" color="#3B6FB6" /> : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Loop: neuer gesichtsloser Chef (Fragezeichen) setzt sich, Stempel „CONFIDENCE“ knallt, Stoppuhr startet; „time…“ → Kalender springt auf SUN = Cover-Bild (Loop zu Satz 1). */
export const Loop: React.FC = () => {
  const { f, d, B } = useBeats();
  const stamp = B("newChairStamp", 0.18);
  const watch = B("stopwatchStart", 0.53);
  const back = B("loopToSunday", 0.76);
  if (f >= back) {
    const z = lerp(1.18, 1.04, ease(f, back, Math.min(d, back + 24), "inOut"));
    return <CoverScene f={f} zoom={z} />;
  }
  const cam = frameOn(560, 980, 540, 960, lerp(1.0, 1.06, ease(f, 0, back, "inOut")));
  const sit = ease(f, 0, 24, "inOut");
  const sec = f >= watch ? (f - watch) / 30 : 0;
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Office f={f} crash={1} dim={0.25} />
        <ExecChair x={720} y={1250} s={0.8} />
        <g>
          <BoardMember x={720} y={lerp(1150, 1260, sit)} s={0.7} f={f} seed={4} color="#4A4F66" />
          <g opacity={pop(f, 14, 10)}>
            <HText x={720} y={lerp(1150, 1260, sit) - 0.7 * 540 + 40} size={110} fill="#F4F7FF">
              ?
            </HText>
          </g>
        </g>
        <rect x={720 - 0.8 * 190} y={1250 - 0.8 * 280} width={0.8 * 380} height={0.8 * 70} rx={18} fill="#2A2730" stroke={HG.ink} strokeWidth={7} />
        <ThumbStamp x={300} y={820} s={0.62} t={ease(f, stamp, stamp + 8)} r={-10} />
        <Stopwatch x={300} y={1080} s={0.62} sec={sec} t={pop(f, watch, 10)} />
      </Layer>
    </Stage2D>
  );
};
