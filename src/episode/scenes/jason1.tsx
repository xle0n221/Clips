import React from "react";
import { camPath, Cam2D, ease, frameOn, jolt, Layer, lerp, LuxDefs, pop, Stage2D } from "../kit2d";
import { shotIndex } from "../types";
import { TopShade } from "./huangSets";
import { LC, PageFlip, Palm, PostIt, Puff, Stamp, Toon, toonHand } from "./luciaSets";
import {
  ArmyDrab,
  BigPolaroid,
  Boat,
  Card,
  Cargo,
  Coin,
  Curtain,
  Die,
  Dock,
  Duffel,
  EdgeArm,
  Guy,
  Hammock,
  HangLamp,
  inPhoto,
  JC,
  JPHOTO,
  JPHOTO_ZOOM,
  JPolaroid,
  KeysDay,
  KeysMap,
  partialPath,
  Pinboard,
  RealMedia,
  RedString,
  ShadowMan,
  SplitArt,
  StormCloud,
  TimeSwirl,
  Water,
  hasReal,
} from "./jasonSets";
import { useBeats } from "./rollsSets";

/**
 * „Who is Jason from GTA 6?“ Teil 1 (hook … circle). 2D-Comic/Paper-Cut-Akte an einer Pinnwand (Drehbuch `style`).
 * Ruhiges Bildtempo: je Szene 1–3 Einstellungen à ≈ 2,5–4 s, Ortswechsel als Fahrt (Rückspul-Dreh ins Polaroid, Tür,
 * Weg-Linie auf der Karte, Umblättern). Alle Zeiten aus Beats (`B`) bzw. Wörtern (`W`).
 */

/** Kamera, bei der das Akten-Foto genau das Bild füllt (Cover = Foto-Inhalt im Bildraum). */
export const JPHOTO_CAM = frameOn(JPHOTO.x, JPHOTO.y, 540, 960, JPHOTO_ZOOM * 1.004);
/** Pinnwand-Totale mit dem großen Polaroid (Ende Hook = Anfang crooks). */
export const BOARD_CAM = frameOn(540, 760, 540, 880, 1.1);
export const BOARD_END = frameOn(540, 760, 540, 880, 1.13);
const photoCam = (X: number, Y: number, z: number): Cam2D => {
  const [wx, wy] = inPhoto(X, Y);
  return frameOn(wx, wy, 540, 960, JPHOTO_ZOOM * z);
};

/** Cover-/Loop-Bild: das geteilte Polaroid bildfüllend. */
export const CoverScene: React.FC<{ readonly f: number }> = ({ f }) => (
  <Stage2D cam={JPHOTO_CAM} mood="night" noSky>
    <LuxDefs />
    <Layer>
      <Pinboard id="cover" f={f} />
      <BigPolaroid clipId="clip-cover" photo={<SplitArt f={f} />} nameO={0} />
    </Layer>
    <Layer depth={0}>
      <TopShade />
    </Layer>
  </Stage2D>
);

/** Kleines Brustbild Jason (Polaroid-Inhalt, lokal). */
export const JasonBust: React.FC<{ readonly f: number; readonly mouth?: "smirk" | "flat" | "smile"; readonly look?: number }> = ({ f, mouth = "smirk", look = 0 }) => (
  <g>
    <KeysDay f={f} id="jbust" x0={-160} w={320} horizon={40} />
    <Toon x={0} y={270} s={0.56} frame={f} who="jason" mouth={mouth} look={look} blinkSeed={11} breathe={false} />
  </g>
);

/* ------------------------------------------------------------------ */

/**
 * Hook: Cover (Polaroid bildfüllend) → ruhiger Zoom auf die Armee-Hälfte, Stempel ARMY → Whip auf die Keys-Hälfte,
 * Stempel DRUG RUNNERS → Rückfahrt an die Pinnwand („That's Jason …“) → rote gestrichelte Linie mit „?“ auf „happen“.
 */
export const Hook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const army = Math.max(B("stampArmy", 0.06), 24);
  const runners = B("whipToKeysHalf", 0.33);
  const thats = W("That's", 0.51);
  const happen = B("redLineQuestion", 0.85);
  if (f < 21) return <CoverScene f={f} />;
  const camL = photoCam(360, 1000, 1.25);
  const camR = photoCam(720, 1000, 1.25);
  const cam = camPath(f, [
    [21, JPHOTO_CAM],
    [60, camL],
    [runners - 4, photoCam(350, 990, 1.3)],
    [runners + 6, camR],
    [thats, photoCam(730, 990, 1.3)],
    [thats + 42, BOARD_CAM],
    [d, BOARD_END],
  ]);
  const dimR = 0.5 * ease(f, 21, 50) * (1 - ease(f, runners - 2, runners + 4));
  const dimL = 0.5 * ease(f, runners, runners + 6) * (1 - ease(f, thats + 6, thats + 30));
  const tA = ease(f, army, army + 7);
  const tR = ease(f, runners + 4, runners + 11);
  const lineT = ease(f, happen - 4, happen + 14);
  const [la, lb] = [inPhoto(230, 1460), inPhoto(850, 1460)];
  const photo = (
    <g>
      <SplitArt f={f} dimL={dimL} dimR={dimR} mood={f >= runners ? "smirk" : "flat"} />
      <Stamp x={270} y={760} text="ARMY" t={tA} r={-10} size={80} />
      <Stamp x={790} y={770} text="DRUG RUNNERS" t={tR} r={6} size={50} />
    </g>
  );
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, army, 10) * 0.3 }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Pinboard id="hook" f={f} />
        <BigPolaroid clipId="clip-hook" photo={photo} nameO={ease(f, thats + 20, thats + 34)} />
        <RedString a={la} b={lb} t={lineT} sag={30} dash />
        {lineT > 0 ? (
          <g transform={`translate(${(la[0] + lb[0]) / 2} ${la[1] + 30}) scale(${0.55 * pop(f, happen + 4, 10)})`} filter="url(#sticker)">
            <circle r={62} fill="#FFFFFF" stroke={LC.ink} strokeWidth={7} />
            <text x={0} y={34} fontFamily="Montserrat" fontWeight={900} fontSize={96} textAnchor="middle" fill={LC.red}>
              ?
            </text>
          </g>
        ) : null}
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */
/* Rückblende: Kindheit unter Gaunern (Bildraum 1080 × 1920)             */
/* ------------------------------------------------------------------ */

export const CrooksRoom: React.FC<{ readonly f: number; readonly ace: number; readonly kid?: boolean }> = ({ f, ace, kid = true }) => {
  const aceT = ease(f, ace - 6, ace + 6, "inOut");
  const seen = f >= ace + 2;
  return (
    <g>
      <defs>
        <linearGradient id="cr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E4430" />
          <stop offset="1" stopColor="#B08458" />
        </linearGradient>
        <radialGradient id="cr-vig" cx="0.5" cy="0.5" r="0.72">
          <stop offset="0.55" stopColor="#2A1A10" stopOpacity="0" />
          <stop offset="1" stopColor="#2A1A10" stopOpacity="0.78" />
        </radialGradient>
        <filter id="cr-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
      </defs>
      <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#cr-wall)" />
      {/* Schatten der Erwachsenen an der Wand – weich, ineinander, nicht zählbar */}
      <g filter="url(#cr-blur)" opacity={0.55}>
        {[
          [-40, 640, 1.2],
          [150, 700, 1.0],
          [930, 650, 1.15],
          [1110, 720, 1.0],
          [780, 760, 0.9],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + Math.sin(f * 0.03 + i) * 8} ${y}) scale(${s})`}>
            <ellipse cx={0} cy={-120} rx={90} ry={100} fill="#1A100A" />
            <rect x={-170} y={-40} width={340} height={500} rx={120} fill="#1A100A" />
          </g>
        ))}
      </g>
      <HangLamp x={540} y={420} f={f} />
      {/* Kind hinter dem Tisch */}
      {kid ? (
        <Toon
          x={540}
          y={1340}
          s={1.3}
          frame={f}
          who="jason"
          age="kid"
          armL={[40, 60]}
          armR={[40, 60]}
          look={seen ? 0.9 : 0}
          lookY={seen ? 0.3 : 0.6}
          eyes={seen ? "wide" : "open"}
          mouth={seen ? "o" : "flat"}
          brows={seen ? "up" : "neutral"}
          blinkSeed={11}
        />
      ) : null}
      {/* Tisch */}
      <g filter="url(#paper)">
        <path d="M -40 1110 L 1120 1110 L 1120 1150 L -40 1150 Z" fill="#7A4E2E" stroke={LC.ink} strokeWidth={6} />
        <rect x={-40} y={1150} width={1160} height={200} fill="#4E3020" stroke={LC.ink} strokeWidth={6} />
      </g>
      <Die x={430} y={1090} r={-12} s={0.8} n={5} />
      <Die x={490} y={1098} r={18} s={0.7} n={3} />
      <Coin x={640} y={1100} s={0.9} />
      <Coin x={680} y={1092} s={0.9} />
      <Coin x={655} y={1084} s={0.9} />
      <Card x={560} y={1096} r={80} s={0.7} back />
      <Card x={590} y={1100} r={96} s={0.7} back />
      {/* Hände vom Bildrand: Kartenfächer links, Ass aus dem Ärmel rechts */}
      <EdgeArm side={-1} hx={250} hy={1020} color="#2A2230">
        {[-24, -8, 8, 24].map((r, i) => (
          <Card key={i} x={250 + i * 10} y={960} r={r} s={0.8} back={i !== 3} />
        ))}
      </EdgeArm>
      <EdgeArm side={1} hx={830} hy={1010} color="#3A2E26" cuff="#E8DCC6">
        <Card x={lerp(900, 830, aceT)} y={lerp(1030, 935, aceT)} r={lerp(60, -14, aceT)} s={0.85 * (0.4 + 0.6 * aceT)} ace />
      </EdgeArm>
      {seen ? (
        <g opacity={1 - ease(f, ace + 14, ace + 26)}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${830 + Math.cos(i * 1.3 - 1.6) * 90} ${930 + Math.sin(i * 1.3 - 1.6) * 90} l ${Math.cos(i * 1.3 - 1.6) * 40} ${Math.sin(i * 1.3 - 1.6) * 40}`} stroke={LC.yellow} strokeWidth={9} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#cr-vig)" />
      <rect x={-2000} y={-2000} width={5080} height={5920} fill="#A0703A" opacity={0.14} />
    </g>
  );
};

/** Rückspul-Symbol (Geometrie, kein Sonderzeichen). */
const RewindIcon: React.FC<{ readonly o: number }> = ({ o }) =>
  o <= 0 ? null : (
    <g opacity={o} transform="translate(540 560)" filter="url(#paper)">
      <rect x={-130} y={-70} width={260} height={140} rx={24} fill="#1A1220" opacity={0.75} />
      <path d="M 0 -44 L -70 0 L 0 44 Z M 76 -44 L 6 0 L 76 44 Z" fill={LC.paper} />
    </g>
  );

/** crooks: Rückspul-Dreh – das Polaroid wirbelt, Kamera taucht in die Sepia-Rückblende; „grifters“ → Ass aus dem Ärmel. */
export const Crooks: React.FC = () => {
  const { f, d, B } = useBeats();
  const ace = B("aceFromSleeve", 0.63);
  const arrive = Math.min(28, d - 10);
  if (f >= arrive) {
    const cam = frameOn(540, 960, 540, 960, lerp(1.0, 1.06, ease(f, arrive, d, "inOut")));
    return (
      <Stage2D cam={{ ...cam, x: cam.x + jolt(f, ace, 6) }} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <CrooksRoom f={f} ace={ace} />
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const cam = camPath(f, [
    [0, BOARD_END],
    [arrive, JPHOTO_CAM],
  ]);
  const spin = 360 * (1 - ease(f, 0, arrive, "inOut"));
  const mix = ease(f, 6, 16);
  const photo = (
    <g>
      <SplitArt f={f} />
      <g opacity={mix}>
        <CrooksRoom f={f} ace={ace} />
      </g>
    </g>
  );
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Pinboard id="hook" f={f} />
        <BigPolaroid clipId="clip-crooks" photo={photo} rot={-spin} nameO={1 - ease(f, 0, 8)} />
      </Layer>
      <Layer depth={0}>
        <RewindIcon o={Math.sin(Math.PI * Math.min(1, f / arrive))} />
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * army: Zeitraffer – der Junge wird beim Gehen zum Mann (olivgrüne Jacke ohne Abzeichen, Seesack), tritt durch die Tür ins
 * Helle; „Army“ → Tür knallt hinter ihm zu, die Schatten bleiben im Dunkeln; „behind“ → rote Weg-Linie beginnt an seinen Füßen.
 */
export const Army: React.FC = () => {
  const { f, d, B } = useBeats();
  const army = B("doorCloseOnCrooks", 0.22);
  const behind = B("pathLineStarts", 0.64);
  const floor = 1290;
  const walkEnd = Math.max(army - 2, 20);
  const jx = lerp(380, 900, ease(f, 0, walkEnd, "inOut")) + lerp(0, 120, ease(f, walkEnd, d, "linear"));
  const g = ease(f, 3, 18, "inOut");
  const walking = f < walkEnd + 4 || f > army + 20;
  const step = Math.sin(f * 0.42);
  const close = ease(f, army - 6, army, "smooth");
  const cam = camPath(f, [
    [0, frameOn(430, 960, 540, 960, 1.0)],
    [walkEnd + 6, frameOn(860, 960, 540, 960, 1.0)],
    [d, frameOn(980, 960, 540, 960, 1.03)],
  ]);
  const lineT = ease(f, behind - 2, behind + 30, "inOut");
  const path = partialPath(
    [
      [jx + 30, floor + 24],
      [jx + 360, floor + 40],
      [jx + 760, floor + 110],
      [jx + 1200, floor + 200],
    ],
    lineT,
  );
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, army, 12) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        {/* Draußen: heller Mittag, Karten-Boden */}
        <defs>
          <linearGradient id="ar-out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFEAF5" />
            <stop offset="1" stopColor="#FFF6DC" />
          </linearGradient>
        </defs>
        <rect x={560} y={-2000} width={4000} height={2000 + floor} fill="url(#ar-out)" />
        <rect x={560} y={floor} width={4000} height={2000} fill="#F1E3BE" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${640 + i * 260} ${floor + 60 + (i % 3) * 70} q 80 -30 160 0 t 160 0`} stroke="#D9C79C" strokeWidth={5} fill="none" />
        ))}
        <path d={`M 560 ${floor} L 4000 ${floor}`} stroke={LC.ink} strokeWidth={5} />
        {/* Drinnen: Rückblenden-Raum (dunkel, Schatten) */}
        <g>
          <defs>
            <clipPath id="ar-room">
              <rect x={-3000} y={-2000} width={3560} height={5000} />
            </clipPath>
          </defs>
          <g clipPath="url(#ar-room)">
            <g transform="translate(-20 0)">
              <CrooksRoom f={f} ace={-100} kid={false} />
            </g>
            <rect x={-3000} y={-2000} width={3560} height={5000} fill="#120A06" opacity={0.25 + 0.45 * close} />
          </g>
        </g>
        {/* Wand mit Tür */}
        <rect x={540} y={-2000} width={40} height={2000 + floor + 60} fill="#3A2618" stroke={LC.ink} strokeWidth={5} />
        <path d={`M 560 ${floor} L 560 ${floor - 640}`} stroke={LC.ink} strokeWidth={6} />
        <path d={`M 560 ${floor - 640} L 780 ${floor - 640}`} stroke="#3A2618" strokeWidth={30} />
        {/* Lichtkeil aus der Tür (nur offen) */}
        <path d={`M 560 ${floor - 620} L 560 ${floor} L ${lerp(300, 560, close)} ${floor + 160} Z`} fill="#FFF1C8" opacity={0.35 * (1 - close)} />
        {/* Junge → Mann */}
        <TimeSwirl x={jx} y={floor - 330} t={ease(f, 2, 20)} />
        {g < 1 ? (
          <g opacity={1 - g}>
            <Toon x={jx} y={floor} s={1.3 * (1 + 0.25 * g)} frame={f} who="jason" age="kid" walk step={step} armL={[10 + 10 * step, 8]} armR={[10 - 10 * step, 8]} look={1} blinkSeed={11} />
          </g>
        ) : null}
        {g > 0 ? (
          <g opacity={g}>
            <Toon
              x={jx}
              y={floor}
              s={0.95 * (0.85 + 0.15 * g)}
              frame={f}
              who="jason"
              outfit="army"
              walk={walking}
              step={walking ? step : 0}
              armL={[walking ? 10 + 12 * step : 6, 8]}
              armR={[28, 14]}
              look={f > army && f < army + 26 ? -1 : 0.8}
              brows={f > army + 26 ? "neutral" : "up"}
              mouth={f > behind ? "smile" : "flat"}
              blinkSeed={11}
            />
            <Duffel x={jx + toonHand(1, [28, 14], "jason")[0] * 0.95 + 20} y={floor + toonHand(1, [28, 14], "jason")[1] * 0.95 + 150} s={0.85} r={8} />
          </g>
        ) : null}
        <Puff x={jx} y={floor - 300} t={(f - 9) / 14} s={1.2} color="#FFF1C8" />
        {/* Tür (Scharnier links), schließt auf „Army“ */}
        <g filter="url(#paper)">
          <rect x={560} y={floor - 620} width={14 + 206 * close} height={620} fill="#7A4E2E" stroke={LC.ink} strokeWidth={6} />
          {close > 0.6 ? <circle cx={560 + 186 * close} cy={floor - 300} r={12} fill={LC.yellow} stroke={LC.ink} strokeWidth={4} /> : null}
        </g>
        {lineT > 0 ? <path d={path} stroke={LC.red} strokeWidth={11} fill="none" strokeLinecap="round" strokeDasharray="26 18" filter="url(#paperSoft)" /> : null}
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * keys: Weg-Linie läuft auf der eigenen Inselkarte nach Süden über die Brücken; echtes Foto der Florida Keys (Vorbild,
 * W Nr. 11) als Polaroid daneben; Schnitt an den Steg: Jason (pink) lädt „CARGO“ ins Boot, Auftraggeber als Schatten.
 */
export const Keys: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const south = B("pathLineSouth", 0.09);
  const cargo = B("cargoOnBoat", 0.45);
  const dock0 = Math.max(W("local", 0.36) - 4, south + 46);
  const shot = shotIndex(f, [dock0]);
  if (shot === 0) {
    const line = ease(f, south, south + 52, "inOut");
    const pol = south + 22;
    const cam = camPath(f, [
      [0, frameOn(560, 640, 540, 880, 1.08)],
      [south + 52, frameOn(520, 900, 540, 880, 1.12)],
      [dock0, frameOn(540, 920, 540, 880, 1.15)],
    ]);
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <KeysMap f={f} line={line} />
          {hasReal("keysAerial") ? (
            <JPolaroid x={850} y={1090} s={0.74 * pop(f, pol, 10)} r={5} id="keys-aerial" label="FLORIDA KEYS" color={LC.tealDark}>
              <RealMedia slot="keysAerial" x={-150} y={-180} w={300} h={320} kb={{ t: (f - pol) / 60, z0: 1.05, z1: 1.18 }} />
            </JPolaroid>
          ) : null}
        </Layer>
        <Layer depth={0}>
          <TopShade />
        </Layer>
      </Stage2D>
    );
  }
  const floor = 1110;
  const lift = ease(f, cargo - 14, cargo, "inOut");
  const cam = camPath(f, [
    [dock0, frameOn(470, 960, 540, 960, 1.0)],
    [d, frameOn(600, 960, 540, 960, 1.03)],
  ]);
  const jx = 470;
  const hand = toonHand(1, [lerp(70, 20, lift), lerp(20, 10, lift)], "jason");
  const cx = lerp(jx + hand[0] * 0.92 + 40, 800, lift);
  const cy = lerp(floor + hand[1] * 0.92 + 80, 1088, lift) - Math.sin(Math.PI * lift) * 60;
  const bob = Math.sin(f * 0.12) * 6;
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, cargo, 6) }} mood="night" noSky>
      <LuxDefs />
      <Layer depth={0.3}>
        <RealMedia
          slot="marina"
          x={-300}
          y={0}
          w={1700}
          h={1180}
          kb={{ t: (f - dock0) / (d - dock0), z0: 1.04, z1: 1.1 }}
          tone="saturate(1.05) brightness(1.03)"
          fallback={<KeysDay f={f} id="keys-dock" x0={-1000} w={3200} horizon={1000} />}
        />
      </Layer>
      <Layer>
        <Water y={1150} f={f} id="keys" />
        <Boat x={820} y={1170} s={0.82} bob={bob} />
        {/* Bootshaus-Schatten mit den Auftraggebern (gesichtslos, am Bildrand) */}
        <rect x={-900} y={floor - 760} width={1060} height={760} fill="#2A1E24" opacity={0.9} />
        <path d={`M -900 ${floor - 760} L 220 ${floor - 760} L 120 ${floor - 860} L -900 ${floor - 860} Z`} fill="#6E4A2A" stroke={LC.ink} strokeWidth={6} />
        <ShadowMan x={60} y={floor} s={1.0} color="#141018" />
        <ShadowMan x={-90} y={floor} s={1.08} color="#141018" />
        <Dock x0={-900} x1={640} y={floor} />
        <Toon
          x={jx}
          y={floor}
          s={0.92}
          frame={f}
          who="jason"
          armL={[lerp(70, 12, lift), lerp(20, 8, lift)]}
          armR={[lerp(70, 20, lift), lerp(20, 10, lift)]}
          look={f > cargo + 10 ? -0.9 : 0.6}
          lean={lerp(0, 6, lift)}
          brows={f > cargo + 10 ? "up" : "neutral"}
          blinkSeed={11}
        />
        <Cargo x={cx} y={cy + (lift >= 1 ? bob : 0)} s={0.62} r={lerp(-4, 3, lift)} />
        <Puff x={800} y={1090} t={(f - cargo) / 12} s={0.8} color="#BDF2FF" />
      </Layer>
      <Layer depth={1.35}>
        <rect x={-40} y={1180} width={60} height={800} fill={JC.dockDark} stroke={LC.ink} strokeWidth={6} />
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * rehook: Strand (echtes Video/Foto `beach`, Ken-Burns) mit Cartoon-Palmen und Hängematte; „easy“ → Notiz GOAL: EASY LIFE;
 * „harder“ → Seil reißt, Hängematte sackt ab, Gewitterwolke vor die Sonne; Umblättern auf Seite 2.
 */
export const Rehook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const easy = B("hammockSun", 0.48);
  const harder = B("branchSnapStorm", 0.82);
  const cutB = Math.max(W("he", 0.38) - 6, 60);
  const shot = shotIndex(f, [cutB]);
  const drop = ease(f, harder, harder + 9, "smooth");
  const storm = ease(f, harder - 4, harder + 16, "inOut");
  const flipT = ease(f, d - 22, d, "inOut");
  const cam =
    shot === 0
      ? camPath(f, [
          [0, frameOn(540, 930, 540, 930, 1.0)],
          [cutB, frameOn(560, 930, 540, 930, 1.04)],
        ])
      : camPath(f, [
          [cutB, frameOn(530, 940, 540, 900, 1.38)],
          [harder, frameOn(540, 960, 540, 900, 1.45)],
          [d, frameOn(540, 990, 540, 900, 1.4)],
        ]);
  const a: [number, number] = [235, 830];
  const b: [number, number] = [845, 830];
  // Jason liegt in der Hängematte (Kopf links), rutscht beim Reißen ab
  const jx = lerp(700, 790, drop);
  const jy = lerp(1000, 1262, drop);
  const lean = lerp(-74, -86, drop);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, harder, 14) }} mood="night" noSky>
      <LuxDefs />
      <Layer depth={0.25}>
        <RealMedia
          slot="beach"
          x={-260}
          y={-200}
          w={1600}
          h={1700}
          kb={{ t: f / d, z0: 1.04, z1: 1.12, dx: -30 }}
          dim={0.5 * storm}
          fallback={
            <g>
              <KeysDay f={f} id="rehook" x0={-1000} w={3200} horizon={1060} />
              <rect x={-1000} y={-400} width={3200} height={2400} fill="#1C2A3A" opacity={0.5 * storm} />
            </g>
          }
        />
      </Layer>
      <Layer depth={0.5}>
        <StormCloud x={lerp(1500, 780, storm)} y={lerp(160, 330, storm)} s={1.1} o={storm} bolt={ease(f, harder + 6, harder + 9) * (1 - ease(f, harder + 14, harder + 22))} />
      </Layer>
      <Layer>
        {/* Sand (Cartoon), darauf stehen Palmen + Hängematte */}
        <path d="M -2000 1240 Q 540 1190 3000 1250 L 3000 4000 L -2000 4000 Z" fill={JC.sand} stroke={LC.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={-100 + i * 97} cy={1300 + (i % 3) * 40} r={5} fill={JC.sandDark} />
        ))}
        <Palm x={190} y={1290} s={1.0} lean={-6} color="#24452F" sway={2 * Math.sin(f * 0.05)} />
        <Palm x={890} y={1290} s={1.0} lean={8} color="#24452F" sway={2 * Math.sin(f * 0.05 + 1) + 14 * drop} />
        <Hammock a={a} b={b} drop={drop} />
        <Toon
          x={jx}
          y={jy}
          s={0.74}
          frame={f}
          who="jason"
          lean={lean}
          armL={[160, 150]}
          armR={drop > 0.2 ? [110, 20] : [160, 150]}
          eyes={drop > 0.2 ? "wide" : f >= easy ? "closed" : "open"}
          mouth={drop > 0.2 ? "o" : "smile"}
          brows={drop > 0.2 ? "up" : "neutral"}
          blinkSeed={11}
          breathe={false}
        />
        <Puff x={b[0] - 40} y={b[1] + 40} t={(f - harder) / 12} s={0.9} />
      </Layer>
      <Layer depth={0}>
        <TopShade />
        {f >= easy ? <PostIt x={720} y={560} s={pop(f, easy, 10)} r={4} lines={["GOAL:", "EASY LIFE"]} size={50} /> : null}
        <PageFlip t={flipT} title="PAGE" big="2" />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

const BRIAN = { x: 285, y: 1010, r: -4 } as const;
const CAL = { x: 800, y: 1020, r: 4 } as const;
const JMINI = { x: 540, y: 640, s: 0.78 } as const;

/** Brian-Polaroid (lokal): echtes Strandhaus-Foto (`beachHouse`) als Hintergrund, Brian im Liegestuhl mit Mietbuch, Kiste CARGO. */
const BrianPhoto: React.FC<{ readonly f: number; readonly tip: number }> = ({ f, tip }) => {
  const t = ease(f, tip - 4, tip + 6, "smooth");
  return (
    <g>
      <RealMedia
        slot="beachHouse"
        x={-150}
        y={-180}
        w={300}
        h={320}
        kb={{ t: f / 260, z0: 1.04, z1: 1.14 }}
        fallback={
          <g>
            <KeysDay f={f} id="brian" x0={-160} w={320} horizon={-10} />
            <rect x={-130} y={-120} width={170} height={120} fill="#F6F2EA" stroke={LC.ink} strokeWidth={4} />
            <path d="M -145 -120 L -45 -175 L 55 -120 Z" fill={LC.pink} stroke={LC.ink} strokeWidth={4} />
          </g>
        }
      />
      {/* Liegestuhl */}
      <g filter="url(#paper)">
        <path d="M -120 140 L -60 -10 L 70 -10 L 120 140" fill="none" stroke="#7A4E2E" strokeWidth={10} />
        <path d="M -70 -20 L 70 -20 L 60 110 L -60 110 Z" fill={LC.white} stroke={LC.ink} strokeWidth={4} />
        {[-40, 0, 40].map((x) => (
          <rect key={x} x={x - 10} y={-20} width={20} height={130} fill={LC.pink} opacity={0.85} />
        ))}
      </g>
      <Guy x={-10} y={-8} s={0.58} f={f} kind="brian" mouth={f > tip ? "smirk" : "flat"} look={f > tip ? 0.8 : 0} blinkSeed={6} />
      {/* Mietbuch */}
      <g transform="translate(-70 92) rotate(-8)" filter="url(#paper)">
        <rect x={-36} y={-26} width={72} height={52} fill="#3E6A9A" stroke={LC.ink} strokeWidth={4} />
        <text x={0} y={8} fontFamily="Montserrat" fontWeight={900} fontSize={20} textAnchor="middle" fill="#FFFFFF">
          RENT
        </text>
      </g>
      <Cargo x={98} y={138} s={0.42} r={-62 * t} open={t} />
    </g>
  );
};

/** Cal-Polaroid (lokal): Fenster mit Vorhang, Cal (Kopfhörer, Fernglas) späht durch den Spalt; „Paranoid“ → zu. */
const CalPhoto: React.FC<{ readonly f: number; readonly snap: number }> = ({ f, snap }) => {
  const shut = ease(f, snap - 3, snap + 2, "smooth");
  const gap = (0.55 + 0.08 * Math.sin(f * 0.2)) * (1 - shut);
  return (
    <g>
      <rect x={-160} y={-200} width={320} height={360} fill="#2A2236" />
      <g opacity={1 - shut}>
        <Guy x={8} y={-10} s={0.62} f={f} kind="cal" eyes="narrow" look={0.9} mouth="frown" blinkSeed={8} />
        {/* Fernglas (schlicht) */}
        <g transform="translate(70 40)">
          <rect x={-34} y={-24} width={30} height={46} rx={8} fill="#3B3F4A" stroke={LC.ink} strokeWidth={4} />
          <rect x={4} y={-24} width={30} height={46} rx={8} fill="#3B3F4A" stroke={LC.ink} strokeWidth={4} />
        </g>
      </g>
      <Curtain gap={gap} cx={10} />
      {/* Fensterrahmen */}
      <rect x={-150} y={-180} width={300} height={320} fill="none" stroke="#F6F2EA" strokeWidth={16} />
    </g>
  );
};

/**
 * circle: Pinnwand (nach dem Umblättern): Brian links, Cal rechts an roter Schnur zu Jasons Foto; Ranfahrt an Brian
 * („runner“ → Kiste CARGO kippt), dann an Cal („Paranoid“ → Vorhang zu).
 */
export const Circle: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const around = B("pinboardPan", 0.11);
  const tip = B("brianCargoTip", 0.58);
  const snap = B("calCurtainSnap", 0.9);
  const cutB = Math.max(W("Even", 0.28) - 4, around + 30);
  const cutC = Math.max(W("His", 0.7) - 4, tip + 30);
  const shot = shotIndex(f, [cutB, cutC]);
  const inB = ease(f, around - 2, around + 12, "inOut");
  const inC = ease(f, around + 8, around + 22, "inOut");
  const brianX = lerp(-300, BRIAN.x, inB);
  const calX = lerp(1400, CAL.x, inC);
  const jPin: [number, number] = [JMINI.x, JMINI.y - 188 * JMINI.s];
  const zoomOn = (p: { x: number; y: number }, z: number) => frameOn(p.x, p.y - 10, 540, 820, z);
  const cam =
    shot === 0
      ? camPath(f, [
          [0, frameOn(510, 860, 540, 900, 0.98)],
          [cutB, frameOn(560, 860, 540, 900, 1.02)],
        ])
      : shot === 1
        ? camPath(f, [
            [cutB, zoomOn(BRIAN, 2.3)],
            [cutC, zoomOn(BRIAN, 2.45)],
          ])
        : camPath(f, [
            [cutC, zoomOn(CAL, 2.3)],
            [d, zoomOn(CAL, 2.45)],
          ]);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + (shot === 1 ? jolt(f, tip, 8) : 0) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Pinboard id="circle" f={f} />
        <RedString a={jPin} b={[brianX, BRIAN.y - 188 * 0.8]} t={ease(f, around + 10, around + 24)} />
        <RedString a={jPin} b={[calX, CAL.y - 188 * 0.8]} t={ease(f, around + 20, around + 34)} />
        <JPolaroid x={JMINI.x} y={JMINI.y} s={JMINI.s} r={-2} id="j-mini" label="JASON" color={LC.pinkDark}>
          <JasonBust f={f} />
        </JPolaroid>
        <JPolaroid x={brianX} y={BRIAN.y} s={0.8} r={BRIAN.r} id="brian" label="LANDLORD">
          <BrianPhoto f={f} tip={tip} />
        </JPolaroid>
        <JPolaroid x={calX} y={CAL.y} s={0.8} r={CAL.r} id="cal" label="FRIEND">
          <CalPhoto f={f} snap={snap} />
        </JPolaroid>
      </Layer>
      <Layer depth={0}>
        <TopShade />
        <PageFlip t={1 + ease(f, 0, 14, "inOut")} title="PAGE" big="2" />
      </Layer>
    </Stage2D>
  );
};

export { ArmyDrab };
