import React from "react";
import { Bag, camPath, clamp01, ease, Figure, frameOn, jolt, Layer, lerp, LuxDefs, pop, Stage2D } from "../kit2d";
import { shotIndex } from "../types";
import { TopShade } from "./huangSets";
import {
  Bars,
  CaseFile,
  Cell,
  CellDoor,
  Clover,
  CoverArt,
  Desk,
  Flood,
  LC,
  PageFlip,
  Palm,
  PHOTO,
  PHOTO_ZOOM,
  PostIt,
  PrisonWall,
  Puff,
  QBubble,
  Stamp,
  Sunset,
  Toon,
  toonHand,
  toonHeadY,
} from "./luciaSets";
import { useBeats } from "./rollsSets";

/**
 * „Who is Lucia from GTA 6?“ Teil 1 (hook … rehook). 2D-Comic/Paper-Cut als Akte (Drehbuch `style`).
 * Ruhiges Bildtempo: je Szene 1–2 Einstellungen à ≈ 3–4 s, Ortswechsel als Fahrt (Portal ins Akten-Foto, Kameraschwenk
 * vom Tor zur Sonne), Pointen über Requisiten (Stempel, Kleeblatt, Gitter). Alle Zeiten aus Beats (`B`) bzw. Wörtern (`W`).
 */

/** Kamera, bei der das Akten-Foto genau das Bild füllt (Cover = Foto-Inhalt im Bildraum). */
export const PHOTO_CAM = frameOn(PHOTO.x, PHOTO.y, 540, 960, PHOTO_ZOOM * 1.004);

/** Cover-/Loop-Bild: das Akten-Foto bildfüllend (Lucia hinter Gittern vor dem Abendrot). */
export const CoverScene: React.FC<{ readonly f: number }> = ({ f }) => (
  <Stage2D cam={PHOTO_CAM} mood="night" noSky>
    <LuxDefs />
    <Layer>
      <Desk id="cover" f={f} />
      <CaseFile f={f} clipId="clip-cover" photo={<CoverArt f={f} />} paperclip={false} />
    </Layer>
    <Layer depth={0}>
      <TopShade />
    </Layer>
  </Stage2D>
);

/* ------------------------------------------------------------------ */
/* Rückblende Vater (Bildraum 1080 × 1920, auch als Foto-Inhalt)        */
/* ------------------------------------------------------------------ */

const PAD_ARM = [55, 40] as const;
/** Sepia-Trainingsecke: kleine Lucia (zu große Handschuhe), Vater als gesichtslose Silhouette mit Pratzen. `hit` = Bild des Treffers. */
export const DadSet: React.FC<{ readonly f: number; readonly dadIn: number; readonly hit: number }> = ({ f, dadIn, hit }) => {
  const floor = 1290;
  const fs = 0.85;
  const fx = lerp(1240, 770, ease(f, dadIn - 14, dadIn + 4, "inOut"));
  // Pratze (rechte Hand der gespiegelten Figur) – aus der Arm-Geometrie von Figure (adult: shW 86, a1 112, a2 104)
  const padX0 = 770 - (72 + Math.sin((55 * Math.PI) / 180) * 112 + Math.sin((95 * Math.PI) / 180) * 104) * fs;
  const padY = floor + (-462 + Math.cos((55 * Math.PI) / 180) * 112 + Math.cos((95 * Math.PI) / 180) * 104) * fs;
  const ks = 1.15;
  const reach = ease(f, hit - 6, hit, "smooth") * (1 - ease(f, hit + 8, hit + 22, "inOut"));
  const jab2 = 34;
  const reach2 = ease(f, hit + jab2 - 5, hit + jab2, "smooth") * (1 - ease(f, hit + jab2 + 8, hit + jab2 + 20, "inOut"));
  const r = Math.max(reach, reach2);
  const punch: readonly [number, number] = [lerp(60, 115, r), lerp(70, -5, r)];
  const handOut = toonHand(1, [115, -5], "lucia", "kid");
  const padX = padX0 + (fx - 770);
  const kx = padX0 - 62 - handOut[0] * ks + lerp(-30, 0, r);
  const padKick = 10 * Math.max(Math.max(0, 1 - Math.abs(f - hit) / 6), Math.max(0, 1 - Math.abs(f - hit - jab2) / 6));
  return (
    <g>
      <defs>
        <linearGradient id="dad-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C99A68" />
          <stop offset="1" stopColor="#E8C79A" />
        </linearGradient>
        <radialGradient id="dad-vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#3A2412" stopOpacity="0" />
          <stop offset="1" stopColor="#3A2412" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#dad-wall)" />
      {/* Fenster mit Morgenlicht */}
      <rect x={120} y={560} width={260} height={320} fill="#FFF0C8" stroke="#5A3A20" strokeWidth={8} />
      <path d="M 250 560 L 250 880 M 120 720 L 380 720" stroke="#5A3A20" strokeWidth={8} />
      <path d={`M 120 880 L 380 880 L 640 ${floor} L 200 ${floor} Z`} fill="#FFF0C8" opacity={0.28} />
      <rect x={-2000} y={floor} width={5080} height={2000} fill="#9A6B40" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M -200 ${floor + 20 + i * 40} L 1300 ${floor + 20 + i * 40}`} stroke="#7A5030" strokeWidth={3} />
      ))}
      <path d={`M -2000 ${floor} L 3000 ${floor}`} stroke={LC.ink} strokeWidth={6} />
      <Bag x={930} y={330} s={0.85} swing={4 * Math.sin(f * 0.06)} />
      <Figure
        x={fx}
        y={floor}
        s={fs}
        frame={f}
        sil="#3B2A20"
        flip
        gloves
        gloveColor="#E9D2A6"
        gloveSide={1}
        armR={PAD_ARM}
        armL={[14, 20]}
        outfit="shirt"
        lean={-2 + padKick * 0.3}
      />
      <Toon
        x={kx}
        y={floor}
        s={ks}
        frame={f}
        age="kid"
        gloves="#D93A3A"
        armR={punch}
        armL={[40, 120]}
        brows="angry"
        mouth={r > 0.5 ? "grit" : "flat"}
        look={0.8}
        lean={lerp(0, 4, r)}
        blinkSeed={4}
      />
      <Puff x={padX - 30} y={padY} t={(f - hit) / 14} s={0.9} />
      <Puff x={padX - 30} y={padY} t={(f - hit - jab2) / 14} s={0.6} />
      <rect x={-2000} y={-2000} width={5080} height={5920} fill="url(#dad-vig)" />
      <rect x={-2000} y={-2000} width={5080} height={5920} fill="#A0703A" opacity={0.12} />
    </g>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Hook: Cover (Foto bildfüllend) → Kamera zieht zurück, das Foto liegt in der Akte; „time“ → Stempel SERVED TIME;
 * „play“ → Zettel YOU PLAY HER; „What“ → Ranfahrt aufs Feld REASON, „there“ → „?“; danach Portal-Fahrt ins Foto,
 * das sich zur Sepia-Rückblende entwickelt (nahtlos in `dad`).
 */
export const Hook: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const time = B("stampServedTime", 0.2);
  const reason = B("reasonBlank", 0.85);
  const what = W("What", 0.76);
  const portal0 = Math.min(d - 20, reason + 14);
  if (f < 21) return <CoverScene f={f} />;
  const shot = shotIndex(f, [what]);
  const fieldCam = (z: number) => frameOn(500, 1230, 540, 900, z);
  const cam =
    shot === 0
      ? camPath(f, [
          [21, PHOTO_CAM],
          [44, frameOn(540, 820, 540, 900, 1.0)],
          [what, frameOn(540, 810, 540, 900, 1.06)],
        ])
      : camPath(f, [
          [what, fieldCam(1.3)],
          [portal0, fieldCam(1.42)],
          [d, PHOTO_CAM],
        ]);
  const dev = ease(f, portal0 + 4, d - 2, "inOut");
  const photo = (
    <g>
      <CoverArt f={f} />
      {dev > 0 ? (
        <g opacity={dev}>
          <DadSet f={0} dadIn={1e6} hit={1e9} />
        </g>
      ) : null}
    </g>
  );
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, time, 12) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Desk id="hook" f={f} />
        <CaseFile f={f} clipId="clip-hook" photo={photo} reason="?" reasonQ={pop(f, reason, 10)} fieldsO={1 - ease(f, portal0, portal0 + 8)} />
        <g opacity={1 - ease(f, portal0, portal0 + 8)}>
          <Stamp x={560} y={990} text="SERVED TIME" t={ease(f, time, time + 7)} r={-12} size={66} />
        </g>
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/** Dad: Rückblende (Sepia), Kamera kommt aus dem Foto; „dad“ → Silhouette rückt ins Bild, „fight“ → Treffer auf die Pratze. */
export const Dad: React.FC = () => {
  const { f, d, B } = useBeats();
  const dadIn = B("dadSilhouette", 0.27);
  const hit = B("padHit", 0.5);
  const cam = camPath(f, [
    [0, { x: 540, y: 960, zoom: 1 }],
    [d, frameOn(560, 1000, 540, 980, 1.1)],
  ]);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, hit, 9) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <DadSet f={f} dadIn={dadIn} hit={hit} />
      </Layer>
      <Layer depth={0}>
        <TopShade />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/**
 * Familie ohne zählbare Köpfe: warmes Haus mit erleuchteten Fenstern hinter Lucia, dazu von beiden Bildrändern
 * angeschnittene Schultern/Arme (Köpfe außerhalb des Bildes), die sich an sie drängen.
 */
const FamilyHome: React.FC<{ readonly f: number; readonly floor: number; readonly t: number }> = ({ f, floor, t }) => (
  <g>
    <g filter="url(#paper)">
      <rect x={300} y={floor - 520} width={480} height={520} fill="#B9785A" stroke={LC.ink} strokeWidth={6} />
      <path d={`M 260 ${floor - 520} L 540 ${floor - 760} L 820 ${floor - 520} Z`} fill="#7A3F3A" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" />
      {[360, 640].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={floor - 440} width={90} height={110} fill="#FFD27A" stroke={LC.ink} strokeWidth={5} opacity={0.85 + 0.1 * Math.sin(f * 0.07 + wx)} />
          <path d={`M ${wx + 45} ${floor - 440} L ${wx + 45} ${floor - 330} M ${wx} ${floor - 385} L ${wx + 90} ${floor - 385}`} stroke={LC.ink} strokeWidth={4} />
        </g>
      ))}
    </g>
    <rect x={300} y={floor - 520} width={480} height={520} fill="#FFB36B" opacity={0.12} />
    {/* angeschnittene Schultern + Arme von links/rechts (Köpfe außerhalb des Bildes) */}
    {[-1, 1].map((sd) => {
      const bx = sd < 0 ? lerp(-220, -80, t) : lerp(1300, 1160, t);
      return (
        <g key={sd} filter="url(#paper)">
          <circle cx={bx + sd * 20} cy={floor - 640} r={88} fill={sd < 0 ? "#2A1A22" : "#3A2A1C"} stroke={LC.ink} strokeWidth={6} />
          <path d={`M ${bx - 200} ${floor + 40} L ${bx - 200} ${floor - 470} Q ${bx} ${floor - 560} ${bx + 200} ${floor - 470} L ${bx + 200} ${floor + 40} Z`} fill={sd < 0 ? "#6B3A55" : "#4A3A66"} stroke={LC.ink} strokeWidth={6} />
          <path d={`M ${bx - sd * 150} ${floor - 440} Q ${bx - sd * 260} ${floor - 380} ${bx - sd * 330} ${floor - 470}`} stroke={LC.ink} strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d={`M ${bx - sd * 150} ${floor - 440} Q ${bx - sd * 260} ${floor - 380} ${bx - sd * 330} ${floor - 470}`} stroke={sd < 0 ? LC.jSkin : "#8B5A3C"} strokeWidth={34} fill="none" strokeLinecap="round" />
        </g>
      );
    })}
  </g>
);

/** Family: Zeitraffer Kind → Jugendliche → Erwachsene (Haarband bleibt); „family“ → schützend vor unscharfer Gruppe; „Penitentiary“ → Gitter fällt. */
export const Family: React.FC = () => {
  const { f, d, B } = useBeats();
  const grow = B("growUp", 0.1);
  const fam = B("protectFamily", 0.4);
  const slam = B("cellDoorSlam", 0.76);
  const shot = shotIndex(f, [fam]);
  const floor = 1290;
  if (shot === 0) {
    const t1 = grow;
    const t2 = grow + 24;
    const cam = camPath(f, [
      [0, frameOn(420, 990, 540, 980, 1.02)],
      [fam, frameOn(640, 960, 540, 960, 0.92)],
    ]);
    const hop = (at: number) => 1 - 0.12 * Math.sin(clamp01((f - at) / 10) * Math.PI);
    const ages = [
      { x: 240, age: "kid" as const, at: -100, s: 1.12 },
      { x: 545, age: "teen" as const, at: t1, s: 1.04 },
      { x: 850, age: "adult" as const, at: t2, s: 1.0 },
    ];
    return (
      <Stage2D cam={cam} mood="night" noSky>
        <LuxDefs />
        <Layer>
          <rect x={-2000} y={-2000} width={5080} height={2000 + floor} fill="#D7B08A" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={-400 + i * 140} y={300} width={70} height={floor - 300} fill="#CFA47C" />
          ))}
          <rect x={-2000} y={floor} width={5080} height={2000} fill="#8A5E3C" />
          <path d={`M -2000 ${floor} L 3000 ${floor}`} stroke={LC.ink} strokeWidth={6} />
          {ages.map((a, i) => {
            const show = f >= a.at;
            const headTop = floor + (toonHeadY("lucia", a.age) - 60) * a.s;
            return (
              <g key={a.age}>
                <path d={`M ${a.x - 120} ${headTop} L ${a.x + 120} ${headTop}`} stroke="#6B4A2E" strokeWidth={6} strokeDasharray="16 10" opacity={show ? 0.8 : 0} />
                {show ? (
                  <Toon
                    x={a.x}
                    y={floor}
                    s={a.s * pop(f, a.at, 10)}
                    frame={f}
                    age={a.age}
                    squash={hop(a.at)}
                    look={i === 2 ? -0.4 : 0.6}
                    mouth={i === 2 ? "smirk" : "smile"}
                    brows={i === 2 ? "angry" : "neutral"}
                    armL={i === 2 ? [20, 110] : [12, 8]}
                    armR={i === 2 ? [20, 110] : [12, 8]}
                    blinkSeed={2 + i * 3}
                  />
                ) : null}
                <Puff x={a.x} y={floor - 300 * a.s} t={(f - a.at) / 14} s={0.9} />
              </g>
            );
          })}
        </Layer>
      </Stage2D>
    );
  }
  const bars = ease(f, slam - 8, slam, "smooth");
  const grey = ease(f, slam, slam + 12);
  const cam = frameOn(540, 980, 540, 960, lerp(1.0, 1.07, ease(f, fam, d, "inOut")));
  return (
    <Stage2D cam={{ ...cam, y: cam.y + jolt(f, slam, 14) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <rect x={-2000} y={-2000} width={5080} height={2000 + floor} fill="#E6B98E" />
        <rect x={-2000} y={floor} width={5080} height={2000} fill="#9A6B48" />
        <FamilyHome f={f} floor={floor} t={ease(f, fam - 4, fam + 12, "inOut")} />
        <Toon
          x={540}
          y={floor}
          s={1.06 * (1 - 0.06 * Math.sin(clamp01((f - fam) / 10) * Math.PI))}
          frame={f}
          armL={[lerp(12, 82, ease(f, fam, fam + 10)), lerp(8, 12, ease(f, fam, fam + 10))]}
          armR={[lerp(12, 82, ease(f, fam, fam + 10)), lerp(8, 12, ease(f, fam, fam + 10))]}
          brows="angry"
          mouth="grit"
          blinkSeed={6}
        />
        <rect x={-2000} y={-2000} width={5080} height={5920} fill="#2A3048" opacity={0.42 * grey} />
        <g transform={`translate(0 ${lerp(-1800, 0, bars)})`}>
          <Bars x0={-60} n={6} gap={240} y0={-400} y1={floor + 40} w={44} cross={[560, 1180]} />
        </g>
        <g opacity={ease(f, slam + 10, slam + 18)}>
          <PostIt x={540} y={1170} r={-3} lines={["REASON: FIGHTING", "FOR HER FAMILY"]} size={36} fill="#FFF8EA" />
        </g>
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Out: Zelle. Nah auf Lucia, „get“ → Fragezeichen; dann weit: Kleeblatt fällt durchs Gitter aufs Schloss, „luck“ → Tür springt auf, Augen-Pop, Vermerk DETAILS? UNKNOWN. */
export const Out: React.FC = () => {
  const { f, d, B, W } = useBeats();
  const stare = B("cellStare", 0.13);
  const luck = B("cloverDoorPop", 0.8);
  const wide = W("Rockstar's", 0.34);
  const floor = 1300;
  const lx = 400;
  const ls = 1.05;
  const headWY = floor + toonHeadY() * ls;
  const shot = shotIndex(f, [wide]);
  const open = ease(f, luck, luck + 14, "inOut");
  const popEye = 1 + 0.45 * Math.max(0, 1 - Math.abs(f - luck - 4) / 10);
  const cam =
    shot === 0
      ? frameOn(lx + 30, headWY + 40, 540, 860, lerp(2.0, 2.15, ease(f, 0, wide, "inOut")))
      : frameOn(lerp(560, 600, ease(f, wide, d, "inOut")), 990, 540, 960, lerp(0.95, 0.99, ease(f, wide, d, "inOut")));
  const fallT = ease(f, wide + 6, luck, "inOut");
  const cloverX = lerp(820, 870, fallT) + 24 * Math.sin(f * 0.12) * (1 - fallT);
  const cloverY = lerp(-260, 975, fallT);
  return (
    <Stage2D cam={{ ...cam, x: cam.x + jolt(f, luck, 10) }} mood="night" noSky>
      <LuxDefs />
      <Layer>
        <Cell id="out" f={f} floor={floor} light={open} />
        <CellDoor x={640} y0={640} y1={floor} w={460} open={open} glow={open} />
        <Toon
          x={lx}
          y={floor}
          s={ls}
          frame={f}
          outfit="overall"
          look={f >= stare ? 1 : 0}
          eyes={f >= luck ? "wide" : "open"}
          eyePop={f >= luck ? popEye : 1}
          mouth={f >= luck ? "o" : "flat"}
          brows={f >= luck ? "up" : f >= stare ? "sad" : "neutral"}
          armL={[10, 10]}
          armR={f >= luck ? [lerp(10, 60, ease(f, luck, luck + 8)), 30] : [10, 10]}
          blinkSeed={8}
          headTilt={f >= stare && f < luck ? 4 : 0}
        />
        {shot === 0 ? <QBubble x={lx + 150} y={headWY - 170} s={pop(f, stare, 10)} /> : null}
        {f < luck + 40 ? <Clover x={cloverX} y={cloverY} s={0.62} r={f * 3} glow={ease(f, luck - 4, luck + 4) * (1 - ease(f, luck + 10, luck + 30))} /> : null}
        <g opacity={ease(f, luck + 12, luck + 20)}>
          <PostIt x={870} y={1170} r={5} lines={["DETAILS?", "UNKNOWN"]} size={40} fill="#D9D7E0" fg="#55525F" />
        </g>
      </Layer>
      <Layer depth={0}>
        <Flood o={0.22 * open * (1 - ease(f, luck + 16, d))} />
      </Layer>
    </Stage2D>
  );
};

/* ------------------------------------------------------------------ */

/** Rehook: Tor geht auf, Lucia tritt ins Abendlicht (Hüpfer auf „easy“), Kamera schwenkt mit ihr zur Sonne; „story“ → Sonne wird rot, Akte blättert um (CHAPTER 2). */
export const Rehook: React.FC = () => {
  const { f, d, B } = useBeats();
  const easy = B("musicStopGate", 0.3);
  const story = B("sunTurnsRed", 0.79);
  const floor = 1300;
  const gx = 300;
  const open = ease(f, 0, 26, "inOut");
  const walk1 = ease(f, 14, easy, "linear");
  const walk2 = ease(f, easy + 20, d, "linear");
  const lx = gx + walk1 * 300 + walk2 * 560;
  const walking = (f > 14 && f < easy) || f > easy + 20;
  const hop = 1 - 0.14 * Math.sin(clamp01((f - easy) / 12) * Math.PI);
  const lift = 40 * Math.sin(clamp01((f - easy + 4) / 12) * Math.PI);
  const cam = camPath(f, [
    [0, frameOn(380, 1000, 540, 1000, 0.82)],
    [easy, frameOn(600, 990, 540, 990, 0.88)],
    [story - 6, frameOn(1000, 1060, 540, 960, 0.92)],
    [d, frameOn(1040, 1060, 540, 960, 0.95)],
  ]);
  const red = ease(f, story, story + 22, "inOut");
  const flipT = ease(f, story + 6, d - 2, "inOut");
  return (
    <Stage2D cam={cam} mood="night" noSky>
      <LuxDefs />
      <Layer depth={0.6}>
        <Sunset id="rehook" f={f} horizon={floor - 30} sunX={1100} sunR={240} red={red} sea={false} w={2400} />
        <Palm x={1500} y={floor - 20} s={0.7} lean={-6} color="#3A1238" />
        <Palm x={2050} y={floor - 20} s={0.8} lean={8} color="#3A1238" />
      </Layer>
      <Layer>
        <rect x={-2000} y={floor} width={6000} height={2000} fill="#3A1E30" />
        <path d={`M ${gx + 160} ${floor} L 3200 ${floor}`} stroke="#F2C14E" strokeWidth={10} strokeDasharray="60 50" opacity={0.6} />
        <PrisonWall gx={gx} floor={floor} open={open} f={f} />
        <Toon
          x={lx}
          y={floor - (f > easy - 4 && f < easy + 10 ? lift : 0)}
          s={1.0}
          frame={f}
          outfit="casual"
          walk={walking}
          step={walking ? Math.sin(f * 0.32) : 0}
          squash={f >= easy && f < easy + 12 ? hop : 1}
          look={0.9}
          brows={f >= story ? "angry" : "neutral"}
          mouth={f >= easy && f < story ? "smile" : "flat"}
          armL={[12, walking ? 8 + 10 * Math.sin(f * 0.32) : 8]}
          armR={[12, walking ? 8 - 10 * Math.sin(f * 0.32) : 8]}
          rim="#FFB36B"
          blinkSeed={5}
        />
      </Layer>
      <Layer depth={0}>
        <rect x={0} y={0} width={1080} height={1920} fill="#B8132C" opacity={0.12 * red} />
        <PageFlip t={flipT} title="CASE FILE: LUCIA" big="2" />
      </Layer>
    </Stage2D>
  );
};

