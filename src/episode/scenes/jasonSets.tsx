import React from "react";
import { Img, OffthreadVideo, staticFile } from "remotion";
import { blinkAt } from "../kit/motion";
import { clamp01, ease, lerp, seeded } from "../kit2d";
import { LC, LT, Palm, Pin, STATE_PATH, Toon, toonHeadY } from "./luciaSets";

/**
 * Kulissen + Figuren für „Who is Jason from GTA 6?“ (scenes/jason*.tsx), 2D-Comic/Paper-Cut als Akte „CASE FILE: JASON“
 * an einer Pinnwand, Keys-Mittag (Wasserblau, Sand, Pink). Grenzen (Drehbuch `style`): eigene Figuren (JASON pink, LUCIA
 * türkis, nie größer als Jason), keine Logos/kein GTA-/Rockstar-Schriftzug, kein Trailer-Nachbau, keine Waffen, Drogen nur
 * als Kiste „CARGO“, Armee ohne Abzeichen/Rang/Einheit. Echte Fotos/Videos nur aus `docs/bildnachweise-jason-gta6.md`
 * (Manifest `REAL`), sonst zeichnet jede Stelle ihren Cartoon-Ersatz (`fallback`).
 * Bildregeln: HUD oben links bis y ≈ 372, Sticker y ≈ 402–560, Handlung y ≈ 600–1290, ab y ≈ 1300 Untertitel.
 */

export const JC = {
  sea: "#2EC4D6",
  seaDeep: "#1A8FB0",
  sky: "#9FE3F5",
  sand: "#F1D7A0",
  sandDark: "#D9B676",
  olive: "#5F6B3C",
  oliveDark: "#3E4728",
  cork: "#C08A55",
  corkDark: "#9C6A3C",
  sepia: "#C99A68",
  dock: "#9A6B40",
  dockDark: "#6E4A2A",
} as const;

/* ------------------------------------------------------------------ */
/* Echte Fotos / Videos                                                  */
/* ------------------------------------------------------------------ */

/** Stellen für echte Bilder. Datei-Konvention: public/episodes/jason-gta6/real/<datei> (Liste: docs/bildnachweise-jason-gta6.md). */
export type RealSlot = "keysWater" | "keysAerial" | "beach" | "beachHouse" | "floridaSat" | "marina" | "storm";
export type RealSpec = {
  readonly file: string;
  readonly kind: "img" | "video";
  /** Video: Start im Clip (s) */
  readonly startSec?: number;
  /** Bildausschnitt (CSS object-position) */
  readonly pos?: string;
};

/**
 * Manifest: NUR Dateien, die in docs/bildnachweise-jason-gta6.md mit Lizenz stehen. Fehlt ein Eintrag, zeichnet die Stelle
 * den Cartoon-Ersatz (kein Fehlbild, kein Platzhalter-Text im Video).
 */
export const REAL: Partial<Record<RealSlot, RealSpec>> = {};

export const realSrc = (spec: RealSpec) => staticFile(`episodes/jason-gta6/real/${spec.file}`);

/**
 * Echtes Foto/Video als Rechteck im SVG (foreignObject), Ken-Burns über `kb` (t 0..1: Zoom z0 → z1, Versatz dx/dy in px).
 * `tone`: CSS-Filter (z. B. leicht entsättigt, damit es zum Papier-Look passt); `dim` dunkelt ab (Gewitter).
 */
export const RealMedia: React.FC<{
  readonly slot: RealSlot;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly kb?: { readonly t: number; readonly z0?: number; readonly z1?: number; readonly dx?: number; readonly dy?: number };
  readonly tone?: string;
  readonly dim?: number;
  readonly fallback?: React.ReactNode;
}> = ({ slot, x, y, w, h, kb, tone = "saturate(1.08) contrast(1.04)", dim = 0, fallback = null }) => {
  const spec = REAL[slot];
  if (!spec) return <>{fallback}</>;
  const t = kb ? clamp01(kb.t) : 0;
  const z = kb ? lerp(kb.z0 ?? 1.04, kb.z1 ?? 1.14, t) : 1;
  const dx = kb ? (kb.dx ?? 0) * t : 0;
  const dy = kb ? (kb.dy ?? 0) * t : 0;
  const style: React.CSSProperties = {
    width: w,
    height: h,
    objectFit: "cover",
    objectPosition: spec.pos ?? "50% 50%",
    transform: `translate(${dx}px, ${dy}px) scale(${z})`,
    transformOrigin: "50% 50%",
    filter: tone,
    display: "block",
  };
  return (
    <g>
      <foreignObject x={x} y={y} width={w} height={h}>
        <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
          {spec.kind === "video" ? (
            <OffthreadVideo src={realSrc(spec)} muted trimBefore={Math.round((spec.startSec ?? 0) * 30)} style={style} />
          ) : (
            <Img src={realSrc(spec)} style={style} />
          )}
        </div>
      </foreignObject>
      {dim > 0 ? <rect x={x} y={y} width={w} height={h} fill="#1C2A3A" opacity={dim} /> : null}
    </g>
  );
};

/** Gibt es ein echtes Bild für diese Stelle? */
export const hasReal = (slot: RealSlot) => Boolean(REAL[slot]);

/* ------------------------------------------------------------------ */
/* Pinnwand, Polaroid, Akte                                             */
/* ------------------------------------------------------------------ */

/** Kork-Pinnwand (Weltraum, reicht weit über den Bildrand) mit Holzrahmen-Andeutung und Licht von oben. */
export const Pinboard: React.FC<{ readonly id: string; readonly f: number }> = ({ id, f }) => (
  <g>
    <defs>
      <radialGradient id={`cork-${id}`} cx="0.5" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#D09A62" />
        <stop offset="1" stopColor="#7C5230" />
      </radialGradient>
    </defs>
    <rect x={-3000} y={-3000} width={7000} height={7000} fill={`url(#cork-${id})`} />
    {Array.from({ length: 260 }, (_, i) => {
      const r = seeded(900 + i);
      return <circle key={i} cx={-400 + r() * 1900} cy={-300 + r() * 2600} r={2 + r() * 4} fill={r() < 0.5 ? JC.corkDark : "#E0AE76"} opacity={0.55} />;
    })}
    {/* Pinnwand-Licht: weicher Fensterstreifen (Mittag) */}
    <g opacity={0.1} transform={`translate(${-200 + Math.sin(f * 0.015) * 8} -200) skewX(-24)`}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-600} y={i * 300} width={2200} height={120} fill="#FFF4D8" />
      ))}
    </g>
  </g>
);

/** Rote Schnur zwischen zwei Nadeln, `t` 0..1 zeichnet sie (leicht durchhängend). */
export const RedString: React.FC<{ readonly a: readonly [number, number]; readonly b: readonly [number, number]; readonly t: number; readonly sag?: number; readonly dash?: boolean }> = ({ a, b, t, sag = 40, dash = false }) => {
  if (t <= 0) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 + sag;
  return (
    <g>
      <path
        d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`}
        stroke="#00000055"
        strokeWidth={9}
        fill="none"
        transform="translate(5 8)"
        pathLength={1}
        strokeDasharray={dash ? undefined : "1 1"}
        strokeDashoffset={dash ? undefined : 1 - clamp01(t)}
      />
      <path
        d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`}
        stroke={LC.red}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={dash ? "0.03 0.025" : "1 1"}
        strokeDashoffset={dash ? 0 : 1 - clamp01(t)}
        opacity={dash ? clamp01(t * 2) : 1}
      />
    </g>
  );
};

/** Großes Akten-Foto (9:16) an der Pinnwand – wie Lucia: Inhalt im Bildraum 1080 × 1920, bei `PHOTO_ZOOM` bildfüllend. */
export const JPHOTO = { x: 540, y: 700, w: 420, h: 746.67 } as const;
export const JPHOTO_ZOOM = 1080 / JPHOTO.w;
/** Bildpunkt im Foto-Inhalt → Welt */
export const inPhoto = (X: number, Y: number) => [JPHOTO.x - JPHOTO.w / 2 + (X * JPHOTO.w) / 1080, JPHOTO.y - JPHOTO.h / 2 + (Y * JPHOTO.w) / 1080] as const;

export const BigPolaroid: React.FC<{ readonly photo: React.ReactNode; readonly clipId: string; readonly name?: string; readonly nameO?: number; readonly rot?: number; readonly pin?: boolean }> = ({
  photo,
  clipId,
  name = "JASON",
  nameO = 1,
  rot = 0,
  pin = true,
}) => {
  const k = JPHOTO.w / 1080;
  const px = JPHOTO.x - JPHOTO.w / 2;
  const py = JPHOTO.y - JPHOTO.h / 2;
  return (
    <g transform={rot ? `rotate(${rot} ${JPHOTO.x} ${JPHOTO.y})` : undefined}>
      <g filter="url(#paper)">
        <rect x={px - 20} y={py - 20} width={JPHOTO.w + 40} height={JPHOTO.h + 120} fill="#FFFFFF" stroke={LC.ink} strokeWidth={5} />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect x={px} y={py} width={JPHOTO.w} height={JPHOTO.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${px} ${py}) scale(${k})`}>{photo}</g>
      </g>
      <rect x={px} y={py} width={JPHOTO.w} height={JPHOTO.h} fill="none" stroke={LC.ink} strokeWidth={3} />
      <LT x={JPHOTO.x} y={py + JPHOTO.h + 72} size={50} spacing={8} fill={LC.pinkDark} o={nameO}>
        {name}
      </LT>
      {pin ? <Pin x={JPHOTO.x} y={py - 4} /> : null}
    </g>
  );
};

/** Polaroid (lokal 300 × 320 Bildfläche) mit Beschriftung unten – Inhalt als children in lokalen Koordinaten (−150..150, −180..140). */
export const JPolaroid: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  readonly label: string;
  readonly color?: string;
  readonly id: string;
  readonly pin?: boolean;
  readonly o?: number;
  readonly children: React.ReactNode;
}> = ({ x, y, s = 1, r = 0, label, color = LC.ink, id, pin = true, o = 1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <g filter="url(#paper)">
      <rect x={-170} y={-200} width={340} height={430} fill="#FFFFFF" stroke={LC.ink} strokeWidth={6} />
    </g>
    <defs>
      <clipPath id={`jp-${id}`}>
        <rect x={-150} y={-180} width={300} height={320} />
      </clipPath>
    </defs>
    <rect x={-150} y={-180} width={300} height={320} fill="#DDE7EA" />
    <g clipPath={`url(#jp-${id})`}>{children}</g>
    <rect x={-150} y={-180} width={300} height={320} fill="none" stroke={LC.ink} strokeWidth={4} />
    <LT x={0} y={196} size={label.length > 9 ? 34 : 42} fill={color} spacing={3}>
      {label}
    </LT>
    {pin ? <Pin x={0} y={-188} /> : null}
  </g>
);

/** Karteikarte (Überschrift an der Pinnwand). */
export const IndexCard: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly s?: number; readonly r?: number; readonly color?: string; readonly o?: number }> = ({ x, y, text, s = 1, r = -2, color = "#9A3A2E", o = 1 }) => {
  const w = text.length * 30 + 90;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
      <g filter="url(#paper)">
        <rect x={-w / 2} y={-52} width={w} height={104} fill={LC.paper} stroke={LC.ink} strokeWidth={5} />
      </g>
      <path d={`M ${-w / 2 + 20} -22 L ${w / 2 - 20} -22`} stroke="#E79C9C" strokeWidth={3} />
      <LT x={0} y={26} size={44} fill={color} spacing={4}>
        {text}
      </LT>
      <rect x={-40} y={-66} width={80} height={28} fill="#FFFFFF" opacity={0.6} transform="rotate(3)" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Cover: geteiltes Porträt (Bildraum 1080 × 1920)                      */
/* ------------------------------------------------------------------ */

/** Keys-Wasser (Cartoon-Ersatz): Mittagshimmel, türkises Meer, Sandstreifen, Palme. */
export const KeysDay: React.FC<{ readonly f: number; readonly id: string; readonly x0?: number; readonly w?: number; readonly horizon?: number }> = ({ f, id, x0 = 0, w = 1080, horizon = 980 }) => (
  <g>
    <defs>
      <linearGradient id={`kd-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5FC8F0" />
        <stop offset="1" stopColor="#CFF3FA" />
      </linearGradient>
      <linearGradient id={`kd-sea-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={JC.seaDeep} />
        <stop offset="1" stopColor="#5FE0E0" />
      </linearGradient>
    </defs>
    <rect x={x0} y={-200} width={w} height={horizon + 200} fill={`url(#kd-sky-${id})`} />
    <circle cx={x0 + w * 0.72} cy={horizon - 640} r={110} fill="#FFF4B8" />
    <circle cx={x0 + w * 0.72} cy={horizon - 640} r={170} fill="#FFF4B8" opacity={0.3} />
    <rect x={x0} y={horizon} width={w} height={2200} fill={`url(#kd-sea-${id})`} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={x0 + 40 + ((i * 173 + f * 1.2) % (w - 120))} y={horizon + 40 + i * 70} width={120} height={8} rx={4} fill="#FFFFFF" opacity={0.45} />
    ))}
  </g>
);

/** Armee-Hälfte (Cartoon): schlichte olivgrüne Zeltplane, Kisten-Silhouetten – kein Abzeichen, keine Schrift. */
export const ArmyDrab: React.FC<{ readonly x0?: number; readonly w?: number }> = ({ x0 = 0, w = 1080 }) => (
  <g>
    <defs>
      <linearGradient id="drab" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8E9468" />
        <stop offset="1" stopColor="#4E5634" />
      </linearGradient>
    </defs>
    <rect x={x0} y={-200} width={w} height={2400} fill="url(#drab)" />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M ${x0 - 200 + i * 150} -200 L ${x0 + 200 + i * 150} 2200`} stroke="#000" strokeWidth={30} opacity={0.06} />
    ))}
    <rect x={x0 + 40} y={1480} width={300} height={200} fill="#4A5230" stroke={LC.ink} strokeWidth={6} />
    <rect x={x0 + 70} y={1360} width={240} height={130} fill="#566038" stroke={LC.ink} strokeWidth={6} />
  </g>
);

const SPLIT_S = 2.4;
const SPLIT_FOOT = 2330;
/** Kopfmitte des Cover-Jasons im Foto-Inhalt */
export const SPLIT_HEAD = SPLIT_FOOT + toonHeadY("jason") * SPLIT_S;

/**
 * Geteiltes Porträt: links olivgrüne Jacke vor Zeltplane, rechts pinkes Hemd vor Keys-Wasser (echtes Foto `keysWater`).
 * Die Riss-Kante läuft nur ÜBER dem Kopf und UNTER dem Kinn – das Gesicht bleibt frei (Lehre Lucia D1).
 * `dimL`/`dimR` dunkeln eine Hälfte ab (Fokus in der Hook-Fahrt).
 */
export const SplitArt: React.FC<{ readonly f: number; readonly dimL?: number; readonly dimR?: number; readonly mood?: "flat" | "smirk" }> = ({ f, dimL = 0, dimR = 0, mood = "flat" }) => {
  const headTop = SPLIT_HEAD - 58 * SPLIT_S - 40;
  const chin = SPLIT_HEAD + 58 * SPLIT_S + 30;
  const tear = (y0: number, y1: number) =>
    Array.from({ length: 13 }, (_, i) => {
      const y = lerp(y0, y1, i / 12);
      return `${i ? "L" : "M"} ${540 + (i % 2 ? 12 : -12)} ${y.toFixed(0)}`;
    }).join(" ");
  const jason = (outfit: "army" | "jason") => (
    <Toon
      x={540}
      y={SPLIT_FOOT}
      s={SPLIT_S}
      frame={f < 21 ? 0 : f}
      who="jason"
      outfit={outfit}
      armL={[16, 10]}
      armR={[16, 10]}
      look={0}
      lookY={-0.1}
      mouth={mood}
      brows="neutral"
      blinkSeed={11}
      breathe={false}
    />
  );
  return (
    <g>
      <defs>
        <clipPath id="split-l">
          <rect x={-200} y={-200} width={740} height={2400} />
        </clipPath>
        <clipPath id="split-r">
          <rect x={540} y={-200} width={740} height={2400} />
        </clipPath>
      </defs>
      <g clipPath="url(#split-l)">
        <ArmyDrab x0={-200} w={740} />
        {jason("army")}
        {dimL > 0 ? <rect x={-200} y={-200} width={740} height={2400} fill="#120E18" opacity={dimL} /> : null}
      </g>
      <g clipPath="url(#split-r)">
        <RealMedia
          slot="keysWater"
          x={540}
          y={0}
          w={540}
          h={1920}
          kb={{ t: f / 300, z0: 1.05, z1: 1.12 }}
          fallback={
            <g>
              <KeysDay f={f} id="split" x0={540} w={540} horizon={1060} />
              <Palm x={1030} y={1500} s={1.1} lean={-10} color="#1F5A44" sway={2 * Math.sin(f * 0.05)} />
            </g>
          }
        />
        {jason("jason")}
        {dimR > 0 ? <rect x={540} y={-200} width={740} height={2400} fill="#120E18" opacity={dimR} /> : null}
      </g>
      {/* Riss-Kante: oberhalb des Kopfes und unterhalb des Kinns */}
      <path d={tear(-40, headTop)} stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinejoin="round" />
      <path d={tear(chin, 1960)} stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinejoin="round" />
      <path d={tear(-40, headTop)} stroke={LC.ink} strokeWidth={4} fill="none" strokeLinejoin="round" opacity={0.6} />
      <path d={tear(chin, 1960)} stroke={LC.ink} strokeWidth={4} fill="none" strokeLinejoin="round" opacity={0.6} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Nebenfiguren (eigene Figuren): BRIAN, CAL, Silhouetten               */
/* ------------------------------------------------------------------ */

/** Kopf + Schultern (lokal: Kopfmitte = 0,0, Kopfradius 60). */
export const Guy: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly f: number;
  readonly kind: "brian" | "cal";
  readonly look?: number;
  readonly eyes?: "open" | "narrow" | "wide";
  readonly mouth?: "flat" | "smile" | "smirk" | "o" | "frown";
  readonly blinkSeed?: number;
  readonly shoulders?: boolean;
}> = ({ x, y, s = 1, f, kind, look = 0, eyes = "open", mouth = "flat", blinkSeed = 2, shoulders = true }) => {
  const ink = LC.ink;
  const skin = kind === "brian" ? "#E6B48E" : "#B97E58";
  const r = 60;
  const blink = blinkAt(f, blinkSeed);
  const mY = r * 0.5;
  const mouthEl =
    mouth === "smile" ? (
      <path d={`M -16 ${mY - 4} Q 0 ${mY + 12} 16 ${mY - 4}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "smirk" ? (
      <path d={`M -14 ${mY + 2} Q 4 ${mY + 6} 17 ${mY - 6}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mouth === "o" ? (
      <ellipse cx={0} cy={mY + 2} rx={9} ry={11} fill={ink} />
    ) : mouth === "frown" ? (
      <path d={`M -15 ${mY + 6} Q 0 ${mY - 6} 15 ${mY + 6}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : (
      <path d={`M -12 ${mY} L 12 ${mY}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
    );
  const eye = (sd: -1 | 1) => (
    <g key={sd} transform={`translate(${sd * r * 0.36} ${-4}) scale(${eyes === "wide" ? 1.25 : 1})`}>
      {blink ? (
        <path d="M -11 0 Q 0 5 11 0" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse rx={11} ry={eyes === "narrow" ? 5.5 : 13} fill="#FBF8F2" stroke={ink} strokeWidth={4} />
          <circle cx={look * 5} cy={0} r={eyes === "narrow" ? 4.5 : 6} fill="#2A1A12" />
        </>
      )}
    </g>
  );
  const shirt = kind === "brian" ? "#F2A65A" : "#7D8A72";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
      {shoulders ? (
        <g>
          <path d={`M -150 ${r + 230} Q -150 ${r + 60} -60 ${r + 40} L 60 ${r + 40} Q 150 ${r + 60} 150 ${r + 230} Z`} fill={shirt} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
          {kind === "brian"
            ? Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-100 + i * 40} cy={r + 110 + (i % 2) * 50} r={10} fill="#FFF3D6" opacity={0.85} />)
            : null}
          <path d={`M -26 ${r + 40} L 0 ${r + 80} L 26 ${r + 40}`} fill={skin} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
        </g>
      ) : null}
      <rect x={-16} y={r - 20} width={32} height={46} fill={skin} stroke={ink} strokeWidth={5} />
      {[-1, 1].map((sd) => (
        <circle key={sd} cx={sd * r * 0.98} cy={6} r={r * 0.2} fill={skin} stroke={ink} strokeWidth={5} />
      ))}
      <ellipse cx={0} cy={0} rx={r * 0.96} ry={r} fill={skin} stroke={ink} strokeWidth={6} />
      {kind === "brian" ? (
        <g>
          {/* Glatze mit grauem Haarkranz, grauer Schnurrbart, Falten (älterer Mann) */}
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * r * 0.92} ${-r * 0.05} Q ${sd * r * 1.02} ${-r * 0.55} ${sd * r * 0.62} ${-r * 0.7}`} stroke="#C9C6CC" strokeWidth={16} fill="none" strokeLinecap="round" />
          ))}
          <path d={`M -22 ${mY - 12} Q 0 ${mY - 22} 22 ${mY - 12} Q 12 ${mY - 4} 0 ${mY - 8} Q -12 ${mY - 4} -22 ${mY - 12} Z`} fill="#C9C6CC" stroke={ink} strokeWidth={3} />
          <path d={`M -30 ${-r * 0.62} Q 0 ${-r * 0.7} 30 ${-r * 0.62}`} stroke="#B98E6E" strokeWidth={4} fill="none" />
          <path d={`M -26 ${-r * 0.48} Q 0 ${-r * 0.56} 26 ${-r * 0.48}`} stroke="#B98E6E" strokeWidth={4} fill="none" />
        </g>
      ) : (
        <g>
          {/* Struppige Haare */}
          <path
            d={`M ${-r * 0.98} ${-r * 0.05} Q ${-r * 1.1} ${-r * 1.05} ${-r * 0.2} ${-r * 1.08} L ${-r * 0.05} ${-r * 1.3} L ${r * 0.2} ${-r * 1.06} L ${r * 0.5} ${-r * 1.2} L ${r * 0.6} ${-r * 0.98} Q ${r * 1.08} ${-r * 0.8} ${r * 0.98} ${-r * 0.05} Q ${r * 0.7} ${-r * 0.55} 0 ${-r * 0.6} Q ${-r * 0.7} ${-r * 0.55} ${-r * 0.98} ${-r * 0.05} Z`}
            fill="#5A3E2A"
            stroke={ink}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        </g>
      )}
      {eye(-1)}
      {eye(1)}
      {[-1, 1].map((sd) => (
        <path
          key={`b${sd}`}
          d={`M ${sd * r * 0.14} ${-r * 0.42 + (eyes === "narrow" ? 6 : 0)} Q ${sd * r * 0.36} ${-r * 0.5} ${sd * r * 0.58} ${-r * 0.4 - (eyes === "narrow" ? 4 : 0)}`}
          stroke={kind === "brian" ? "#A9A6AE" : "#3E2A1C"}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path d={`M -4 ${r * 0.18} Q 0 ${r * 0.26} 6 ${r * 0.18}`} stroke="#00000055" strokeWidth={5} fill="none" strokeLinecap="round" />
      {mouthEl}
      {kind === "cal" ? (
        <g>
          {/* Kopfhörer */}
          <path d={`M ${-r * 1.02} ${-r * 0.05} Q 0 ${-r * 1.75} ${r * 1.02} ${-r * 0.05}`} stroke={ink} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={`M ${-r * 1.02} ${-r * 0.05} Q 0 ${-r * 1.75} ${r * 1.02} ${-r * 0.05}`} stroke="#3B3F4A" strokeWidth={10} fill="none" strokeLinecap="round" />
          {[-1, 1].map((sd) => (
            <rect key={sd} x={sd * r * 1.02 - 20} y={-34} width={40} height={68} rx={16} fill="#3B3F4A" stroke={ink} strokeWidth={5} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** Gesichtslose Silhouette (Kopf + Schultern), weich – Auftraggeber/Gauner. */
export const ShadowMan: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly color?: string; readonly o?: number }> = ({ x, y, s = 1, color = "#1B1520", o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={-330} rx={58} ry={64} fill={color} />
    <path d="M -110 0 L -120 -200 Q -118 -262 -40 -268 L 40 -268 Q 118 -262 120 -200 L 110 0 Z" fill={color} />
    <path d="M -70 -390 L 70 -390 L 90 -372 L -90 -372 Z" fill={color} />
    <rect x={-50} y={-440} width={100} height={60} rx={10} fill={color} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Requisiten                                                           */
/* ------------------------------------------------------------------ */

/** Neutrale Holzkiste „CARGO“ (keine Drogen-Details). `open` 0..1 klappt den Deckel auf (Stroh). */
export const Cargo: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly open?: number }> = ({ x, y, s = 1, r = 0, open = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <g filter="url(#paper)">
      <rect x={-110} y={-150} width={220} height={150} fill="#B98A52" stroke={LC.ink} strokeWidth={6} />
    </g>
    {[-1, 1].map((sd) => (
      <path key={sd} d={`M ${sd * 100} -140 L ${-sd * 100} -10`} stroke="#8A6236" strokeWidth={12} />
    ))}
    <rect x={-74} y={-102} width={148} height={50} fill="#E8D2A8" stroke={LC.ink} strokeWidth={4} />
    <LT x={0} y={-64} size={34} spacing={3} fill={LC.ink}>
      CARGO
    </LT>
    {open > 0 ? (
      <g>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${-90 + i * 22} -150 L ${-80 + i * 22 + (i % 2 ? 10 : -10)} ${-150 - 30 * open - (i % 3) * 8}`} stroke="#E8C86A" strokeWidth={6} strokeLinecap="round" />
        ))}
        <g transform={`rotate(${-110 * open} -110 -150)`}>
          <rect x={-110} y={-166} width={220} height={18} fill="#A57A44" stroke={LC.ink} strokeWidth={5} />
        </g>
      </g>
    ) : (
      <rect x={-114} y={-166} width={228} height={18} fill="#A57A44" stroke={LC.ink} strokeWidth={5} />
    )}
  </g>
);

/** Kleines Motorboot (Seitenansicht, eigene Form). Ursprung = Wasserlinie Mitte. */
export const Boat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly bob?: number }> = ({ x, y, s = 1, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    <g filter="url(#paper)">
      <path d="M -300 -90 L 300 -90 L 250 20 Q 0 40 -260 20 Z" fill="#F6F2EA" stroke={LC.ink} strokeWidth={7} strokeLinejoin="round" />
    </g>
    <path d="M -290 -60 L 292 -60" stroke={LC.pink} strokeWidth={14} />
    <path d="M 120 -90 L 150 -190 L 250 -190 L 270 -90" fill="#BFE6F2" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" opacity={0.95} />
    <rect x={-330} y={-150} width={50} height={90} rx={8} fill="#3B3F4A" stroke={LC.ink} strokeWidth={5} />
  </g>
);

/** Holzsteg (Seitenansicht): Planken bis y, Pfähle ins Wasser. */
export const Dock: React.FC<{ readonly x0: number; readonly x1: number; readonly y: number }> = ({ x0, x1, y }) => (
  <g>
    {Array.from({ length: Math.ceil((x1 - x0) / 180) + 1 }, (_, i) => (
      <rect key={i} x={x0 + i * 180} y={y} width={36} height={420} fill={JC.dockDark} stroke={LC.ink} strokeWidth={5} />
    ))}
    <g filter="url(#paper)">
      <rect x={x0} y={y - 40} width={x1 - x0} height={56} fill={JC.dock} stroke={LC.ink} strokeWidth={6} />
    </g>
    {Array.from({ length: Math.ceil((x1 - x0) / 90) }, (_, i) => (
      <path key={i} d={`M ${x0 + i * 90} ${y - 40} L ${x0 + i * 90} ${y + 16}`} stroke={JC.dockDark} strokeWidth={4} />
    ))}
  </g>
);

/** Wasserfläche (Cartoon), Welt-Koordinaten. */
export const Water: React.FC<{ readonly y: number; readonly f: number; readonly id: string; readonly dark?: number }> = ({ y, f, id, dark = 0 }) => (
  <g>
    <defs>
      <linearGradient id={`wa-${id}`} x1="0" y1={y} x2="0" y2={y + 900} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#3FD0D8" />
        <stop offset="1" stopColor={JC.seaDeep} />
      </linearGradient>
    </defs>
    <rect x={-3000} y={y} width={7000} height={3000} fill={`url(#wa-${id})`} />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M ${-200 + ((i * 237 + f * 2) % 1500)} ${y + 30 + (i % 5) * 60} q 30 -12 60 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round" />
    ))}
    {dark > 0 ? <rect x={-3000} y={y} width={7000} height={3000} fill="#1C2A3A" opacity={dark} /> : null}
  </g>
);

/** Spielkarte (lokal 0,0 Mitte). */
export const Card: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number; readonly ace?: boolean; readonly back?: boolean }> = ({ x, y, r = 0, s = 1, ace = false, back = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-42} y={-60} width={84} height={120} rx={10} fill={back ? "#8A2E3A" : "#FFFDF6"} stroke={LC.ink} strokeWidth={5} />
    {back ? <rect x={-30} y={-48} width={60} height={96} rx={6} fill="none" stroke="#F2C9A0" strokeWidth={4} /> : null}
    {ace ? (
      <g>
        <LT x={-24} y={-28} size={28} fill={LC.redDark}>
          A
        </LT>
        <path d="M 0 -6 C -30 -36 -36 4 0 26 C 36 4 30 -36 0 -6 Z" fill={LC.red} stroke={LC.ink} strokeWidth={3} />
      </g>
    ) : null}
  </g>
);

/** Würfel. */
export const Die: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number; readonly n?: number }> = ({ x, y, r = 0, s = 1, n = 5 }) => {
  const pts: Record<number, readonly (readonly [number, number])[]> = {
    1: [[0, 0]],
    3: [[-14, -14], [0, 0], [14, 14]],
    5: [[-14, -14], [14, -14], [0, 0], [-14, 14], [14, 14]],
    6: [[-14, -16], [14, -16], [-14, 0], [14, 0], [-14, 16], [14, 16]],
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x={-32} y={-32} width={64} height={64} rx={12} fill="#FFFDF6" stroke={LC.ink} strokeWidth={5} />
      {(pts[n] ?? pts[5]).map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={6} fill={LC.ink} />
      ))}
    </g>
  );
};

/** Münze. */
export const Coin: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={30} ry={12} fill="#B8862A" stroke={LC.ink} strokeWidth={4} transform="translate(0 6)" />
    <ellipse rx={30} ry={12} fill="#F2C14E" stroke={LC.ink} strokeWidth={4} />
  </g>
);

/** Ärmel + Hand vom Bildrand (gesichtslose Gauner – nicht zählbar). `side` −1 = von links. */
export const EdgeArm: React.FC<{ readonly side: -1 | 1; readonly hx: number; readonly hy: number; readonly color?: string; readonly cuff?: string; readonly children?: React.ReactNode }> = ({
  side,
  hx,
  hy,
  color = "#2A2230",
  cuff = "#E8DCC6",
  children,
}) => {
  const ex = side < 0 ? -120 : 1200;
  const ey = hy + 160;
  return (
    <g>
      <path d={`M ${ex} ${ey} Q ${(ex + hx) / 2} ${hy + 70} ${hx - side * 40} ${hy + 10}`} stroke={LC.ink} strokeWidth={96} fill="none" strokeLinecap="round" />
      <path d={`M ${ex} ${ey} Q ${(ex + hx) / 2} ${hy + 70} ${hx - side * 40} ${hy + 10}`} stroke={color} strokeWidth={84} fill="none" strokeLinecap="round" />
      <ellipse cx={hx - side * 36} cy={hy + 8} rx={24} ry={42} fill={cuff} stroke={LC.ink} strokeWidth={5} transform={`rotate(${side * 30} ${hx - side * 36} ${hy + 8})`} />
      {children}
      <ellipse cx={hx} cy={hy} rx={36} ry={30} fill="#9C7458" stroke={LC.ink} strokeWidth={5} />
    </g>
  );
};

/** Hängelampe mit Lichtkegel (Rückblende). */
export const HangLamp: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly o?: number }> = ({ x, y, f, o = 1 }) => {
  const sw = Math.sin(f * 0.05) * 3;
  return (
    <g opacity={o}>
      <path d={`M ${x} -100 L ${x + sw} ${y}`} stroke={LC.ink} strokeWidth={5} />
      <path d={`M ${x + sw - 90} ${y + 70} L ${x + sw - 520} 1300 L ${x + sw + 520} 1300 L ${x + sw + 90} ${y + 70} Z`} fill="#FFE7A8" opacity={0.18} />
      <path d={`M ${x + sw - 90} ${y + 70} Q ${x + sw} ${y - 40} ${x + sw + 90} ${y + 70} Z`} fill="#3B2A20" stroke={LC.ink} strokeWidth={5} />
      <ellipse cx={x + sw} cy={y + 72} rx={34} ry={14} fill="#FFF1B8" />
    </g>
  );
};

/** Hängematte zwischen zwei Punkten; `sag` 0..1 (1 = ein Ende gerissen, hängt durch). */
export const Hammock: React.FC<{ readonly a: readonly [number, number]; readonly b: readonly [number, number]; readonly drop?: number }> = ({ a, b, drop = 0 }) => {
  const bx = lerp(b[0], b[0] - 60, drop);
  const by = lerp(b[1], b[1] + 330, drop);
  const mx = (a[0] + bx) / 2;
  const my = Math.max(a[1], by) + 150 + 60 * drop;
  return (
    <g filter="url(#paper)">
      <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my + 40} ${bx} ${by} Q ${mx} ${my - 40} ${a[0]} ${a[1]} Z`} fill="#F4E2B8" stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((t) => (
        <path key={t} d={`M ${lerp(a[0], bx, t)} ${lerp(a[1], by, t) + 40} L ${lerp(a[0], bx, t)} ${lerp(a[1], by, t) + 120}`} stroke={LC.pink} strokeWidth={14} opacity={0.7} />
      ))}
    </g>
  );
};

/** Gewitterwolke (Cartoon), `t` 0..1 schiebt sie ins Bild. */
export const StormCloud: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number; readonly bolt?: number }> = ({ x, y, s = 1, o = 1, bolt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} filter="url(#paper)">
    {[
      [-160, 20, 110],
      [-40, -40, 140],
      [110, -10, 120],
      [220, 40, 90],
      [0, 60, 130],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill="#4A5266" stroke={LC.ink} strokeWidth={6} />
    ))}
    <rect x={-250} y={40} width={540} height={110} fill="#4A5266" />
    {bolt > 0 ? <path d="M 20 150 L -30 290 L 30 290 L -20 430 L 100 250 L 40 250 L 80 150 Z" fill={LC.yellow} stroke={LC.ink} strokeWidth={6} strokeLinejoin="round" opacity={bolt} /> : null}
  </g>
);

/** Heiligenschein. */
export const Halo: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly glow?: number }> = ({ x, y, s = 1, r = 0, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse rx={110} ry={30} fill="none" stroke="#FFF4B8" strokeWidth={34} opacity={0.35 * glow} />
    <ellipse rx={100} ry={26} fill="none" stroke={LC.ink} strokeWidth={22} />
    <ellipse rx={100} ry={26} fill="none" stroke="#F2C14E" strokeWidth={13} />
  </g>
);

/** Rohrzange. */
export const Wrench: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-12} y={-20} width={24} height={150} rx={8} fill="#C24A3A" stroke={LC.ink} strokeWidth={5} />
    <path d="M -26 -20 L -26 -70 L 30 -70 L 30 -52 L -6 -52 L -6 -20 Z" fill="#9AA2AE" stroke={LC.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

/** Polylinie bis zum Anteil t (0..1) der Gesamtlänge – für gestrichelte, wachsende Weg-Linien. */
export const partialPath = (pts: readonly (readonly [number, number])[], t: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * clamp01(t);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < seg.length && left > 0; i++) {
    const k = Math.min(1, left / seg[i]);
    d += ` L ${lerp(pts[i][0], pts[i + 1][0], k).toFixed(1)} ${lerp(pts[i][1], pts[i + 1][1], k).toFixed(1)}`;
    left -= seg[i];
  }
  return d;
};

/** Insel-Karte (eigene, fiktive Form): Spitze der Halbinsel oben rechts, Inselkette nach Südwesten mit Brücken. */
export const KEYS_ISLANDS: readonly (readonly [number, number, number])[] = [
  [700, 830, 30],
  [620, 900, 36],
  [530, 960, 28],
  [440, 1010, 40],
  [340, 1050, 30],
  [250, 1080, 34],
  [160, 1100, 26],
];
export const KeysMap: React.FC<{ readonly f: number; readonly line: number; readonly lineFrom?: readonly [number, number] }> = ({ f, line, lineFrom = [520, 180] }) => {
  const route: (readonly [number, number])[] = [lineFrom, [640, 420], [760, 640], [700, 830], ...KEYS_ISLANDS.slice(1).map(([x, y]) => [x, y] as const)];
  const d = partialPath(route, line);
  return (
    <g>
      <rect x={-3000} y={-3000} width={7000} height={7000} fill="#9ED8E0" />
      {Array.from({ length: 18 }, (_, i) => (
        <path key={i} d={`M ${-200 + ((i * 197) % 1400)} ${300 + ((i * 131) % 1100)} q 24 -10 48 0`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.55} />
      ))}
      {/* Spitze der Halbinsel (eigene Form, Ausschnitt der LEONIDA-Karte) */}
      <g transform="translate(560 120) scale(1.9)" filter="url(#paper)">
        <path d={STATE_PATH} fill="#F1E3BE" stroke={LC.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* Brücken */}
      {KEYS_ISLANDS.slice(0, -1).map(([x, y], i) => {
        const [x2, y2] = KEYS_ISLANDS[i + 1];
        return <path key={i} d={`M ${x} ${y} L ${x2} ${y2}`} stroke="#7A6A50" strokeWidth={10} strokeLinecap="round" />;
      })}
      {KEYS_ISLANDS.map(([x, y, r], i) => (
        <g key={i} filter="url(#paper)">
          <ellipse cx={x} cy={y} rx={r * 1.4} ry={r * 0.8} fill="#F1E3BE" stroke={LC.ink} strokeWidth={4} transform={`rotate(-22 ${x} ${y})`} />
          <circle cx={x + 4} cy={y - 8} r={6} fill="#3E8A5A" />
        </g>
      ))}
      {/* Weg-Linie (gestrichelt rot) */}
      {line > 0 ? <path d={d} stroke={LC.red} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 18" filter="url(#paperSoft)" /> : null}
      <circle cx={route[0][0]} cy={route[0][1]} r={14} fill={LC.red} stroke={LC.ink} strokeWidth={4} opacity={0.6 + 0.0 * f} />
    </g>
  );
};

/** Vorhang am Fenster (Cal): `gap` 0..1 Spaltbreite. Lokal: Fenster 0..300 × 0..320 (Polaroid-Inhalt). */
export const Curtain: React.FC<{ readonly gap: number; readonly cx?: number }> = ({ gap, cx = 0 }) => {
  const g = 18 + 70 * gap;
  return (
    <g filter="url(#paper)">
      <path d={`M -170 -200 L ${cx - g} -200 Q ${cx - g - 20} -20 ${cx - g} 160 L -170 160 Z`} fill="#C26A7A" stroke={LC.ink} strokeWidth={5} />
      <path d={`M 170 -200 L ${cx + g} -200 Q ${cx + g + 20} -20 ${cx + g} 160 L 170 160 Z`} fill="#C26A7A" stroke={LC.ink} strokeWidth={5} />
      {[-120, -80, -40].map((dx) => (
        <path key={dx} d={`M ${dx} -200 L ${dx} 160`} stroke="#9A4A5A" strokeWidth={4} opacity={dx > cx - g ? 0 : 1} />
      ))}
      {[120, 80, 40].map((dx) => (
        <path key={dx} d={`M ${dx} -200 L ${dx} 160`} stroke="#9A4A5A" strokeWidth={4} opacity={dx < cx + g ? 0 : 1} />
      ))}
    </g>
  );
};

/** Eingedrückte Spiegel-Beschlag-Flecken (weiß, halbtransparent). */
export const Fog: React.FC<{ readonly x: number; readonly y: number; readonly o?: number }> = ({ x, y, o = 0.5 }) => (
  <g opacity={o}>
    {Array.from({ length: 9 }, (_, i) => {
      const r = seeded(70 + i);
      return <ellipse key={i} cx={x + (r() - 0.5) * 300} cy={y + (r() - 0.5) * 420} rx={60 + r() * 60} ry={40 + r() * 40} fill="#FFFFFF" opacity={0.5} />;
    })}
  </g>
);

/** Kurzer Sprühstrahl (Wasser) von a nach b, `t` 0..1. */
export const Spray: React.FC<{ readonly a: readonly [number, number]; readonly b: readonly [number, number]; readonly t: number; readonly f: number }> = ({ a, b, t, f }) => {
  if (t <= 0) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = Math.min(a[1], b[1]) - 80;
  const d = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  return (
    <g>
      <path d={d} stroke="#BDF2FF" strokeWidth={34} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${clamp01(t)} 2`} opacity={0.9} />
      <path d={d} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${clamp01(t)} 2`} />
      {t >= 1
        ? Array.from({ length: 8 }, (_, i) => {
            const r = seeded(500 + i);
            const k = ((f * 0.08 + r()) % 1) as number;
            return <circle key={i} cx={b[0] + (r() - 0.5) * 120 * k} cy={b[1] + (r() - 0.2) * 100 * k} r={10 * (1 - k)} fill="#BDF2FF" stroke={LC.ink} strokeWidth={2} />;
          })
        : null}
    </g>
  );
};

/** Flaches Dach (Seitenansicht) mit Lüftungsrohr; Ursprung linke Kante bei Dachhöhe y. */
export const Roof: React.FC<{ readonly y: number; readonly ladderX?: number }> = ({ y, ladderX }) => (
  <g>
    {/* Hauswand unter der Dachkante (Pastell), Fensterstürze */}
    <rect x={-3000} y={y + 120} width={7000} height={3000} fill="#F4C9B4" stroke={LC.ink} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => (
      <g key={i}>
        <rect x={-700 + i * 330} y={y + 230} width={170} height={260} fill="#9FD8E6" stroke={LC.ink} strokeWidth={5} />
        <rect x={-712 + i * 330} y={y + 210} width={194} height={26} fill="#FFFFFF" stroke={LC.ink} strokeWidth={4} />
      </g>
    ))}
    {/* Dach-Oberseite (Kies) + Blende + Regenrinne */}
    <g filter="url(#paper)">
      <rect x={-3000} y={y} width={7000} height={60} fill="#C9C3B6" stroke={LC.ink} strokeWidth={6} />
      <rect x={-3000} y={y + 60} width={7000} height={44} fill="#FFFFFF" stroke={LC.ink} strokeWidth={6} />
    </g>
    {Array.from({ length: 70 }, (_, i) => (
      <circle key={i} cx={-600 + i * 37} cy={y + 18 + (i % 3) * 13} r={4} fill="#A39C8E" />
    ))}
    <rect x={-3000} y={y + 102} width={7000} height={22} rx={11} fill="#B9C2CC" stroke={LC.ink} strokeWidth={5} />
    {ladderX !== undefined ? (
      <g filter="url(#paper)">
        {[-36, 36].map((dx) => (
          <path key={dx} d={`M ${ladderX + dx} ${y - 130} L ${ladderX + dx + 40} ${y + 900}`} stroke="#C98B3A" strokeWidth={14} strokeLinecap="round" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${ladderX - 36 + i * 4.4} ${y - 100 + i * 110} L ${ladderX + 36 + i * 4.4} ${y - 100 + i * 110}`} stroke="#C98B3A" strokeWidth={10} />
        ))}
      </g>
    ) : null}
  </g>
);

/** Rohr mit Knie (Dach), Leck-Stelle bei (lx, ly). */
export const Pipe: React.FC<{ readonly x: number; readonly y: number; readonly h?: number }> = ({ x, y, h = 300 }) => (
  <g filter="url(#paper)">
    <rect x={x - 26} y={y - h} width={52} height={h} fill="#9AA2AE" stroke={LC.ink} strokeWidth={6} />
    <rect x={x - 26} y={y - h - 30} width={200} height={52} rx={6} fill="#9AA2AE" stroke={LC.ink} strokeWidth={6} />
    <rect x={x - 36} y={y - h / 2 - 20} width={72} height={40} rx={6} fill="#7E8794" stroke={LC.ink} strokeWidth={5} />
  </g>
);

/** Neutrales Tor (keine Schrift, kein Name): graue Mauer mit Durchgang. */
export const Gate: React.FC<{ readonly x: number; readonly floor: number; readonly open?: number }> = ({ x, floor, open = 1 }) => (
  <g>
    <g filter="url(#paper)">
      <rect x={-3000} y={floor - 640} width={x + 3000 - 170} height={640} fill="#BDB6AA" stroke={LC.ink} strokeWidth={6} />
      <rect x={x + 170} y={floor - 640} width={600} height={640} fill="#BDB6AA" stroke={LC.ink} strokeWidth={6} />
    </g>
    <rect x={x - 170} y={floor - 560} width={340} height={560} fill="#4A4450" stroke={LC.ink} strokeWidth={6} />
    <rect x={x - 170} y={floor - 560} width={340 * (1 - open)} height={560} fill="#8A8794" stroke={LC.ink} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M -3000 ${floor - 560 + i * 100} L ${x - 170} ${floor - 560 + i * 100} M ${x + 170} ${floor - 560 + i * 100} L ${x + 770} ${floor - 560 + i * 100}`} stroke="#A49C90" strokeWidth={4} />
    ))}
    <path d={`M -3000 ${floor - 660} L ${x + 770} ${floor - 660}`} stroke="#8A8794" strokeWidth={8} strokeDasharray="4 30" />
  </g>
);

/** Duffel-Seesack (oliv, ohne Schrift). */
export const Duffel: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <rect x={-60} y={-150} width={120} height={230} rx={56} fill="#6B7444" stroke={LC.ink} strokeWidth={6} />
    <path d="M -50 -110 Q 0 -90 50 -110" stroke="#4E5634" strokeWidth={6} fill="none" />
    <path d="M 0 -150 L 0 -200" stroke={LC.ink} strokeWidth={8} />
  </g>
);

/** Zeitraffer-Kreise (Uhr-Wirbel) für „erwachsen werden“. */
export const TimeSwirl: React.FC<{ readonly x: number; readonly y: number; readonly t: number }> = ({ x, y, t }) => {
  if (t <= 0 || t >= 1) return null;
  const o = Math.sin(Math.PI * t);
  return (
    <g opacity={o}>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x} cy={y} r={120 + i * 70 + t * 80} fill="none" stroke="#FFF1C8" strokeWidth={10 - i * 2} strokeDasharray="30 26" transform={`rotate(${t * 360 * (i % 2 ? -1 : 1)} ${x} ${y})`} />
      ))}
    </g>
  );
};

export { ease };
