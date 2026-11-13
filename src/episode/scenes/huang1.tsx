import React from "react";
import { camPath, clamp01, ease, frameOn, jolt, Layer, lerp, LuxDefs, pop, Spotlight, Stage2D } from "../kit2d";
import { shotIndex } from "../types";
import {
  BoardMember,
  BoardTable,
  Bg,
  Binder,
  CalBlock,
  CalSheet,
  FlipPhone,
  GpuBuddy,
  GreySil,
  HG,
  HText,
  Inbox,
  Jensen,
  Kneeler,
  MarketArrow,
  NamePlate,
  Note,
  OFFICE,
  Office,
  Paper,
  Poof,
  QuoteCard,
  ReceiptTag,
  RubberStamp,
  Staffer,
  StockChart,
  Taco,
  ThumbStamp,
  Ticker,
} from "./huangSets";
import type { ChartPt } from "./huangSets";
import { useBeats } from "./rollsSets";

/**
 * „What Jensen Huang's affairs mean for NVIDIA“ Teil 1 (hook … crash). 2D-Paper-Cut-Satire (Drehbuch `style`).
 * Ruhiges Bildtempo: je Szene 1–3 Einstellungen à ≈ 3–4,5 s, Ortswechsel innerhalb einer Szene als weiche Kamerafahrt,
 * Pointen über Requisiten-Timing (Stempel, Kalenderblätter, Bügel, Taco, Klapp-Reveal). Alle Zeiten aus Beats (`B`) bzw.
 * Wort-Zeiten (`W`) – eine neue Tonspur passt ohne Code-Änderung.
 */

const DAYS = ["SUN", "MON", "TUE", "WED", "THU"];

/** Hook: Chefbüro, Kalender SUN, Daumen-Stempel „CONFIDENCE“; „Thursday“ → Blätter fliegen; „gone“ → Jacke am Bügel + Bon „WHAT DID IT COST?“. */
export const Hook: React.FC = () => {
  const { f, d, B } = useBeats();
  const conf = B("confidenceStamp", 0.36);
  const rip = B("calendarRip", 0.76);
  const gone = B("emptyJacket", 0.86);
  const jx = 700;
  const fl = OFFICE.floor;
  const move = ease(f, rip - 4, rip + 14, "inOut");
  const cam = {
    ...frameOn(lerp(540, 520, move), lerp(960, 990, move), 540, 960, lerp(lerp(1.0, 1.05, ease(f, 0, rip, "inOut")), 1.12, move) + 0.02 * ease(f, gone, d, "inOut")),
    x: lerp(540, 520, move) + jolt(f, gone, 10),
  };
  const torn = f < rip ? 0 : Math.min(4, Math.floor((f - rip) / 4) + 1);
  const vanish = ease(f, gone, gone + 12, "inOut");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Office f={f} crash={ease(f, gone + 2, gone + 16, "linear")} />
        <CalBlock x={OFFICE.calX} y={OFFICE.calY} s={0.85} day={DAYS[torn]} sub="NOV 2026" />
        <Jensen
          x={jx}
          y={fl}
          s={0.95}
          frame={f}
          armA={f >= conf ? [28, 40] : [12, 8]}
          armB={f >= conf && f < rip ? [150, 20] : [14, 10]}
          eyes={f >= rip ? "wide" : "open"}
          mouth={f >= rip ? "o" : f >= conf ? "grin" : "smile"}
          brows={f >= rip ? "up" : "neutral"}
          nod={f >= conf && f < rip ? 5 * Math.sin(clamp01((f - conf) / 24) * Math.PI * 2) : 0}
          vanish={vanish}
          blinkSeed={3}
        />
        <ThumbStamp x={300} y={1110} s={0.72} t={ease(f, conf, conf + 8)} r={-8} />
        <Poof x={jx} y={fl - 470} t={(f - gone) / 16} s={0.9} />
        <ReceiptTag x={830} y={880} s={0.72} t={ease(f, gone + 10, gone + 26)} swing={4 * Math.sin(f * 0.12)} />
      </Layer>
      <Layer depth={0}>
        {/* abgerissene Blätter SUN → WED fliegen nach rechts oben weg */}
        {[0, 1, 2, 3].map((i) => {
          const t = (f - rip - i * 4) / 26;
          if (t <= 0 || t >= 1) return null;
          return <CalSheet key={i} x={lerp(250, 1200, t)} y={760 - Math.sin(t * Math.PI) * 160 + i * 20} r={-10 + t * 70 + i * 8} s={0.85} day={DAYS[i]} />;
        })}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Confess: Mitarbeiter vor dem Firmen-Postfach; Ranfahrt, Kernzeile tippt; „memo“ → Taco fällt. */
export const Confess: React.FC = () => {
  const { f, B } = useBeats();
  const conf = B("inboxConfession", 0.3);
  const taco = B("tacoDrop", 0.78);
  const cam = camPath(f, [
    [0, frameOn(540, 1060, 540, 920, 0.8)],
    [Math.max(10, conf - 6), frameOn(540, 1000, 540, 920, 0.86)],
    [conf + 14, frameOn(540, 880, 540, 900, 1.06)],
    [taco - 4, frameOn(540, 880, 540, 900, 1.1)],
    [taco + 14, frameOn(560, 1240, 540, 960, 1.08)],
  ]);
  const shock = ease(f, taco, taco + 8);
  const drop = Math.max(0, f - taco);
  const floor = 1560;
  const mid = { x: 560, s: 0.88 };
  const handX = mid.x + 84 * mid.s;
  const handY = floor - 210 * mid.s;
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, taco, 8) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="confess" a="#2E3350" b="#4A4F70" />
        <rect x={-2000} y={floor} width={6000} height={2000} fill="#2B2E44" />
        <Inbox x={540} y={860} s={1} type={ease(f, conf, conf + 40, "linear")} f={f} />
        <Staffer x={250} y={floor} s={0.82} f={f} shirt="#E07A5F" shock={ease(f, taco + 4, taco + 12)} seed={2} />
        <Staffer x={mid.x} y={floor} s={mid.s} f={f} shirt="#81B29A" skin="#C98E68" hair="#1E1A1A" shock={shock} seed={5} />
        <Staffer x={850} y={floor} s={0.8} f={f} shirt="#F2CC8F" skin="#F1D2B6" hair="#8A5A34" shock={ease(f, taco + 6, taco + 14)} seed={8} turn={-1} />
        <Taco x={handX + drop * 2} y={handY - 20 + (drop > 0 ? 0.9 * drop * drop : 0)} s={0.9} r={drop * 9} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Fold: Klapphandy-Meme (selbst gezeichnet). Zu = Paar auf dem Außendisplay; „inside“ → klappt auf, Grafikkarten-Maskottchen; „anyway“ → Zwinkern. */
export const Fold: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const closed = B("phoneClosed", 0.19);
  const wife = W("wife", 0.32);
  const flip = B("phoneFlip", 0.57);
  const wink = B("gpuWink", 0.83);
  const slide = ease(f, 0, closed, "inOut");
  const open = ease(f, flip, flip + 12, "inOut");
  const buddy = pop(f, flip + 8, 12);
  const cam = camPath(f, [
    [0, frameOn(330, 1060, 540, 960, 1.45)],
    [flip, frameOn(330, 1060, 540, 960, 1.55)],
    [flip + 18, frameOn(560, 900, 540, 930, 1.12)],
    [d, frameOn(560, 900, 540, 930, 1.17)],
  ]);
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="fold" a="#3A1F4E" b="#7A3570" />
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            transform={`translate(${-200 + i * 190} ${560 + (i % 3) * 300 + 20 * Math.sin(f * 0.05 + i)}) scale(${0.5 + (i % 2) * 0.3})`}
            d="M 0 30 C -60 -10 -40 -60 0 -36 C 40 -60 60 -10 0 30 Z"
            fill="#9C4A8C"
            opacity={0.5}
          />
        ))}
        <FlipPhone x={300} y={lerp(900, 1500, 1 - slide)} s={0.9} open={open} heart={pop(f, wife, 10)} r={lerp(-6, 0, open)} />
        {buddy > 0 ? <GpuBuddy x={790} y={1000} s={0.7 * buddy} f={f} wink={f >= wink && f < wink + 24 ? 1 : 0} hearts={ease(f, wink, wink + 40, "linear")} /> : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Alleged (ernst, kein Witz): Sitzungstisch „INDEPENDENT DIRECTORS“ + Kanzlei-Ordner, Zitat-Karte; Zeitung „NYT“ mit Stempeln; graue Silhouette im Spot + „BEIJING: DENIES“. */
export const Alleged: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const table = B("boardTable", 0.04);
  const quote = B("quoteCard", 0.16);
  const clip = B("clippingsIn", 0.3);
  const alleged = B("allegedStamp", 0.5);
  const woman = W("woman", 0.56);
  const denies = B("deniesCard", 0.87);
  const shot = shotIndex(f, [clip, woman]);
  if (shot === 0) {
    const cam = frameOn(540, 960, 540, 960, lerp(0.98, 1.04, ease(f, 0, clip, "inOut")));
    const q = ease(f, quote - 2, quote + 10, "inOut");
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Bg id="alleged" a="#14161C" b="#2A2E38" />
          <rect x={-2000} y={1240} width={6000} height={2000} fill="#1C1E25" />
          {[260, 540, 820].map((bx, i) => (
            <BoardMember key={bx} x={bx} y={1180} s={0.72} f={f} seed={i + 1} color={["#3A3F52", "#2F3446", "#454A5E"][i]} />
          ))}
          <BoardTable x={540} y={1150} s={1} />
          <NamePlate x={430} y={1132} text="INDEPENDENT DIRECTORS" s={pop(f, table, 10)} />
          <Binder x={850} y={1060} s={0.62 * pop(f, table + 6, 10)} r={-4} text="EXTERNAL LAW FIRM" />
          <rect x={-2000} y={-2000} width={6000} height={6000} fill="#000" opacity={0.35 * q} />
          {q > 0 ? (
            <QuoteCard
              x={540}
              y={lerp(380, 830, q)}
              s={0.95}
              r={-2}
              lines={["the target of a foreign", "intelligence effort"]}
              source="NVIDIA BOARD STATEMENT, NOV 8"
              type={ease(f, quote + 6, quote + 36, "linear")}
            />
          ) : null}
        </Layer>
      </Stage2D>
    );
  }
  if (shot === 1) {
    const cam = frameOn(540, 900, 540, 930, lerp(1.0, 1.08, ease(f, clip, woman, "inOut")));
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, alleged, 8) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <Bg id="alleged2" a="#1A1C22" b="#30343F" />
          <Paper x={540} y={lerp(980, 900, ease(f, clip, clip + 14, "inOut"))} s={1.0} r={-3} title="NYT" />
          <RubberStamp x={400} y={830} text="REPORTED" t={ease(f, clip + 10, clip + 18)} r={-12} color="#5A6FA6" />
          <RubberStamp x={650} y={1010} text="ALLEGED" t={ease(f, alleged, alleged + 8)} r={-8} size={78} />
        </Layer>
      </Stage2D>
    );
  }
  const cam = frameOn(lerp(470, 540, ease(f, denies - 8, denies + 10, "inOut")), 940, 540, 940, lerp(1.0, 1.06, ease(f, woman, d, "inOut")));
  const card = ease(f, denies, denies + 10, "inOut");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="alleged3" a="#1A1C22" b="#30343F" />
        <rect x={-2000} y={1220} width={6000} height={2000} fill="#22252D" />
        <Spotlight x={400} y={1220} o={ease(f, woman, woman + 10)} w={300} />
        <GreySil x={400} y={1220} s={1.0} q={pop(f, woman + 6, 10)} o={ease(f, woman, woman + 8)} />
        {card > 0 ? <Note x={lerp(1300, 790, card)} y={830} s={0.8} r={4} lines={["BEIJING:", "DENIES"]} fill="#E9ECF2" size={64} /> : null}
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

const CRASH_PTS: readonly ChartPt[] = [
  { x: -380, y: -200, label: "OCT RECORD" },
  { x: -260, y: -150 },
  { x: -150, y: -175 },
  { x: -40, y: -60 },
  { x: 90, y: -30 },
  { x: 220, y: 60, label: "NOV 9" },
  { x: 350, y: 170, label: "NOV 10" },
];

/** Crash (Re-Hook): Ranfahrt aufs Börsen-Terminal; „Monday“ → BREAKING-Laufband + Fall; „Tuesday“ → Rückfahrt, kniender Investor mit Gebets-Caption; „record“ → Rekordpunkt leuchtet. */
export const Crash: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const zoom = B("terminalZoom", 0.05);
  const mon = B("tickerBreaking", 0.25);
  const tue = B("chartDrop", 0.52);
  const rec = B("recordFlag", 0.85);
  const market = W("market", 0.33);
  const upto = 4 + ease(f, mon, mon + 14, "inOut") + ease(f, tue, tue + 14, "inOut");
  const back = ease(f, tue + 2, tue + 22, "inOut");
  const c0 = camPath(f, [
    [0, frameOn(540, 900, 540, 900, 0.82)],
    [zoom + 16, frameOn(540, 880, 540, 900, 1.06)],
    [tue, frameOn(540, 880, 540, 900, 1.1)],
  ]);
  const c1 = frameOn(540, 880, 620, 990, lerp(0.74, 0.71, ease(f, tue + 22, d, "inOut")));
  const cam = {
    x: lerp(c0.x, c1.x, back),
    y: lerp(c0.y, c1.y, back),
    zoom: c0.zoom * Math.pow(c1.zoom / c0.zoom, back),
  };
  const shake = jolt(f, mon, 10) + jolt(f, tue, 10);
  const caption = ease(f, tue + 14, tue + 26);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + shake }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Bg id="crash" a="#1A0C12" b="#3E1220" />
        <rect x={-3000} y={1300} width={8000} height={3000} fill="#24101A" />
        <rect x={420} y={1160} width={240} height={140} fill="#3A2030" stroke={HG.ink} strokeWidth={8} />
        <StockChart x={540} y={880} pts={CRASH_PTS} upto={upto} f={f} w={900} h={560} pulse={ease(f, rec, rec + 8) * (0.6 + 0.4 * Math.sin(f * 0.3))} />
        {f >= rec ? <path d="M 160 680 L 160 1050" stroke={HG.yellow} strokeWidth={8} strokeDasharray="18 12" /> : null}
        <MarketArrow x={850} y={700} s={0.8} t={pop(f, market, 10)} label="MARKET" />
        <Kneeler x={-60} y={1245} s={1.05} f={f} />
      </Layer>
      <Layer depth={0}>
        <Ticker y={lerp(1215, 1215, back)} text="BREAKING: STOCK FALLS FASTER THAN BOARD CONFIDENCE" off={Math.max(0, f - mon) * 9} o={ease(f, mon, mon + 6) * (1 - caption)} />
        {caption > 0 ? (
          <g opacity={caption} transform={`translate(540 ${lerp(660, 705, caption)})`}>
            <rect x={-500} y={-70} width={1000} height={150} rx={12} fill="#FFFFFF" stroke={HG.ink} strokeWidth={6} />
            <HText x={0} y={-8} size={40} weight={700}>
              Lord, forgive us for the losses
            </HText>
            <HText x={0} y={46} size={40} weight={700}>
              we are about to have this month
            </HText>
          </g>
        ) : null}
      </Layer>
    </Stage2D>
  );
};
