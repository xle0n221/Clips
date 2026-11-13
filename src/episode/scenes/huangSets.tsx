import React from "react";
import { blinkAt } from "../kit/motion";
import { Check, clamp01, FONT, lerp, LUX, seeded } from "../kit2d";

/**
 * Kulissen + Figuren für „What Jensen Huang's affairs mean for NVIDIA“ (scenes/huang*.tsx), 2D-Paper-Cut-Satire.
 * Grenzen (Drehbuch `style`): keine echten Logos/Fotos, keine Flaggen/Nationalitätssymbole; JENSEN nur als überzeichnete
 * Karikatur mit Lederjacke + Brille; Frauen aus den Berichten nur als graue, gesichtslose Silhouette; Board gesichtslos.
 * Bildregeln: HUD oben links bis y ≈ 372, Sticker ab y 402, Pills (y 0,3) ≈ 490–576, Handlung y ≈ 620–1260,
 * unteres Drittel (ab y ≈ 1280) frei für Untertitel.
 */

export const HG = {
  ink: "#15131A",
  leather: "#1C1B21",
  leatherHi: "#4A4856",
  tee: "#2C2C33",
  trousers: "#33333D",
  skin: "#EDC7A4",
  skinShade: "#CF9F79",
  hair: "#2A2A30",
  hairGray: "#7B7C88",
  glass: "#DCEBFF",
  green: "#76B900",
  red: "#E8434B",
  yellow: "#FFD23F",
  paper: "#FFF8EA",
  receipt: "#FBF7EE",
  grey: "#8E929C",
  greyDark: "#6C707A",
  navy: "#1B2340",
  screen: "#0E1424",
} as const;

/** Großer Hintergrund-Verlauf (Welt-Koordinaten). */
export const Bg: React.FC<{ readonly id: string; readonly a: string; readonly b: string; readonly y0?: number; readonly y1?: number }> = ({ id, a, b, y0 = -200, y1 = 1500 }) => (
  <>
    <defs>
      <linearGradient id={`bg-${id}`} x1="0" y1={y0} x2="0" y2={y1} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect x={-3000} y={-3000} width={8000} height={8000} fill={`url(#bg-${id})`} />
  </>
);

const T: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly fill?: string;
  readonly anchor?: "start" | "middle" | "end";
  readonly weight?: number;
  readonly spacing?: number;
  readonly family?: string;
  readonly children: React.ReactNode;
  readonly o?: number;
}> = ({ x, y, size, fill = HG.ink, anchor = "middle", weight = 900, spacing = 1, family = FONT, children, o }) => (
  <text x={x} y={y} fontFamily={family} fontWeight={weight} fontSize={size} letterSpacing={spacing} textAnchor={anchor} fill={fill} opacity={o}>
    {children}
  </text>
);
export { T as HText };

/* ------------------------------------------------------------------ */
/* JENSEN – Karikatur (nur Lederjacke + große Brille als Merkmal)         */
/* ------------------------------------------------------------------ */

export type JArm = readonly [number, number];
const UP = 118;
const FO = 108;
export const jHand = (side: -1 | 1, arm: JArm, shY = -398) => {
  const sx = side * 96;
  const a1 = (arm[0] * Math.PI) / 180;
  const a2 = ((arm[0] + arm[1]) * Math.PI) / 180;
  const ex = sx + side * Math.sin(a1) * UP;
  const ey = shY + Math.cos(a1) * UP;
  return { ex, ey, hx: ex + side * Math.sin(a2) * FO, hy: ey + Math.cos(a2) * FO };
};

/** Lederjacke (Torso), Ursprung = Fußpunkt der Figur. `slump` 0..1 = hängt leer am Bügel (schmaler, länger). */
const JacketBody: React.FC<{ readonly shY: number; readonly hipY: number; readonly slump?: number }> = ({ shY, hipY, slump = 0 }) => {
  const w = lerp(104, 90, slump);
  const hy = hipY + 30 + slump * 30;
  return (
    <g>
      {/* T-Shirt im V-Ausschnitt */}
      <path d={`M -44 ${shY - 6} L 44 ${shY - 6} L 0 ${shY + 120} Z`} fill={slump > 0.5 ? "#0B0B0E" : HG.tee} stroke={HG.ink} strokeWidth={5} />
      {/* linke + rechte Jackenhälfte (Biker-Schnitt: Reißverschluss schräg) */}
      <path
        d={`M ${-w} ${shY + 4} Q ${-w - 14} ${shY + 40} ${-w + 2} ${shY + 90} L ${-w + 8} ${hy} L 14 ${hy + 6} L 30 ${shY + 150} L -40 ${shY - 8} Q ${-w + 30} ${shY - 14} ${-w} ${shY + 4} Z`}
        fill={HG.leather}
        stroke={HG.ink}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <path
        d={`M ${w} ${shY + 4} Q ${w + 14} ${shY + 40} ${w - 2} ${shY + 90} L ${w - 8} ${hy} L 14 ${hy + 6} L 30 ${shY + 150} L 40 ${shY - 8} Q ${w - 30} ${shY - 14} ${w} ${shY + 4} Z`}
        fill={HG.leather}
        stroke={HG.ink}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      {/* Reverskragen */}
      <path d={`M -40 ${shY - 8} L -78 ${shY + 30} L -36 ${shY + 70} L -14 ${shY + 40} Z`} fill="#2A2930" stroke={HG.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 40 ${shY - 8} L 82 ${shY + 34} L 44 ${shY + 64} L 18 ${shY + 34} Z`} fill="#2A2930" stroke={HG.ink} strokeWidth={5} strokeLinejoin="round" />
      {/* Reißverschluss + Glanzkanten (Leder) */}
      <path d={`M 22 ${shY + 140} L 14 ${hy + 4}`} stroke="#B9BCC8" strokeWidth={5} strokeDasharray="6 5" />
      <path d={`M ${-w + 18} ${shY + 40} Q ${-w + 10} ${shY + 120} ${-w + 22} ${hy - 30}`} stroke={HG.leatherHi} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M ${w - 26} ${shY + 50} Q ${w - 18} ${shY + 110} ${w - 30} ${hy - 50}`} stroke={HG.leatherHi} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* Taschen-Reißverschluss */}
      <path d={`M ${-w + 30} ${hy - 60} L -30 ${hy - 76}`} stroke="#B9BCC8" strokeWidth={5} />
      <path d={`M ${-w + 4} ${hy - 4} L 14 ${hy + 2} L ${w - 4} ${hy - 4}`} stroke="#0B0B0E" strokeWidth={14} fill="none" />
    </g>
  );
};

export type JEyes = "open" | "wide" | "closed" | "side" | "down" | "up";
export type JMouth = "smile" | "grin" | "o" | "flat" | "frown" | "smirk";

/**
 * JENSEN (Karikatur): großer Kopf, kurzes Grau-Schwarz-Haar, übergroße runde Brille, schwarze Lederjacke.
 * Ursprung = Fußpunkt, s = 1 ≈ 640 px hoch. `vanish` 0..1: Kopf, Hände, Beine verschwinden, Jacke hängt leer am Bügel.
 */
export const Jensen: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly frame: number;
  readonly armA?: JArm;
  readonly armB?: JArm;
  readonly eyes?: JEyes;
  readonly mouth?: JMouth;
  readonly brows?: "neutral" | "up" | "sad" | "angry";
  readonly nod?: number;
  readonly lean?: number;
  readonly blinkSeed?: number;
  readonly vanish?: number;
  readonly squash?: number;
  readonly o?: number;
  readonly flip?: boolean;
  /** Zeichnet etwas in die Hand des rechten Bildarms (Bildkoordinaten der Hand werden übergeben) */
  readonly holdB?: (hx: number, hy: number) => React.ReactNode;
}> = ({
  x,
  y,
  s = 1,
  frame,
  armA = [10, 6],
  armB = [10, 6],
  eyes = "open",
  mouth = "smile",
  brows = "neutral",
  nod = 0,
  lean = 0,
  blinkSeed = 3,
  vanish = 0,
  squash = 1,
  o = 1,
  flip = false,
  holdB,
}) => {
  const ink = HG.ink;
  const br = vanish > 0 ? 0 : Math.sin(frame * 0.1) * 3;
  const shY = -398 + br;
  const hipY = -250;
  const headC = shY - 124;
  const hr = 104;
  const body = 1 - clamp01(vanish * 1.6);
  const hang = clamp01((vanish - 0.3) / 0.7);
  const blink = blinkAt(frame, blinkSeed) && eyes !== "closed";
  // leer: Ärmel hängen schlaff senkrecht
  const aA: JArm = [lerp(armA[0], 4, hang), lerp(armA[1], 2, hang)];
  const aB: JArm = [lerp(armB[0], 4, hang), lerp(armB[1], 2, hang)];

  const arm = (side: -1 | 1, a: JArm) => {
    const sx = side * 96;
    const { ex, ey, hx, hy } = jHand(side, a, shY);
    return (
      <g key={`a${side}`}>
        <path d={`M ${sx} ${shY + 14} L ${ex} ${ey} L ${hx} ${hy}`} stroke={ink} strokeWidth={60} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx} ${shY + 14} L ${ex} ${ey} L ${hx} ${hy}`} stroke={HG.leather} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M ${sx + side * 6} ${shY + 24} L ${lerp(sx, ex, 0.8) + side * 8} ${lerp(shY + 14, ey, 0.8)}`} stroke={HG.leatherHi} strokeWidth={6} strokeLinecap="round" />
        <g opacity={body}>
          <circle cx={hx} cy={hy} r={26} fill={HG.skin} stroke={ink} strokeWidth={6} />
          {side === 1 && holdB ? holdB(hx, hy) : null}
        </g>
      </g>
    );
  };

  const eye = (side: -1 | 1) => {
    const ex = side * 44;
    const ey = headC - 4;
    if (blink || eyes === "closed") return <path key={side} d={`M ${ex - 14} ${ey} Q ${ex} ${ey + 8} ${ex + 14} ${ey}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const dx = eyes === "side" ? 8 : 0;
    const dy = eyes === "down" ? 8 : eyes === "up" ? -9 : 0;
    const r = eyes === "wide" ? 13 : 10;
    return (
      <g key={side}>
        {eyes === "wide" ? <circle cx={ex} cy={ey} r={20} fill={LUX.white} stroke={ink} strokeWidth={4} /> : null}
        <circle cx={ex + dx} cy={ey + dy} r={r} fill={ink} />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const ex = side * 44;
    const by = headC - 58 - (brows === "up" ? 14 : 0);
    const tilt = brows === "sad" ? -side * 9 : brows === "angry" ? side * 10 : 0;
    return <path key={`b${side}`} d={`M ${ex - 22} ${by + tilt} L ${ex + 22} ${by - tilt}`} stroke={HG.hair} strokeWidth={11} strokeLinecap="round" />;
  };
  const my = headC + 52;
  const mouthEl = (() => {
    switch (mouth) {
      case "grin":
        return <path d={`M -38 ${my - 8} Q 0 ${my + 34} 38 ${my - 8} Z`} fill={LUX.white} stroke={ink} strokeWidth={6} strokeLinejoin="round" />;
      case "o":
        return <ellipse cx={0} cy={my + 2} rx={15} ry={19} fill="#5A1E22" stroke={ink} strokeWidth={6} />;
      case "flat":
        return <path d={`M -22 ${my} L 22 ${my}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />;
      case "frown":
        return <path d={`M -26 ${my + 8} Q 0 ${my - 12} 26 ${my + 8}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
      case "smirk":
        return <path d={`M -24 ${my + 4} Q 6 ${my + 10} 30 ${my - 8}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
      default:
        return <path d={`M -30 ${my - 4} Q 0 ${my + 22} 30 ${my - 4}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
    }
  })();

  return (
    <g transform={`translate(${x} ${y}) scale(${s * (2 - squash) * (flip ? -1 : 1)} ${s * squash}) rotate(${lean})`} opacity={o} filter="url(#sticker)">
      {/* Bügel (erscheint beim Verschwinden) */}
      {hang > 0 ? (
        <g opacity={hang}>
          <path d={`M 0 ${shY - 30} L 0 ${shY - 70} Q 0 ${shY - 104} 26 ${shY - 104} Q 50 ${shY - 104} 50 ${shY - 80}`} stroke="#9AA0AE" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M 26 ${shY - 104} L 26 ${shY - 2200}`} stroke="#6F7486" strokeWidth={5} />
          <path d={`M -122 ${shY + 8} L 0 ${shY - 34} L 122 ${shY + 8}`} stroke="#8A5A34" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {/* Beine */}
      <g opacity={body}>
        {[-1, 1].map((side) => (
          <g key={side}>
            <rect x={side * 46 - 32} y={hipY - 10} width={64} height={-hipY - 22} rx={22} fill={HG.trousers} stroke={ink} strokeWidth={7} />
            <path d={`M ${side * 46 - 40} 0 Q ${side * 46 - 40} -36 ${side * 46} -38 Q ${side * 46 + side * 62} -34 ${side * 46 + side * 64} 0 Z`} fill="#111114" stroke={ink} strokeWidth={6} />
          </g>
        ))}
      </g>
      <JacketBody shY={shY} hipY={hipY} slump={hang} />
      {/* Kopf */}
      <g opacity={body} transform={`rotate(${nod} 0 ${shY - 10})`}>
        <rect x={-30} y={shY - 40} width={60} height={50} fill={HG.skin} stroke={ink} strokeWidth={6} />
        <circle cx={-hr + 2} cy={headC + 10} r={20} fill={HG.skin} stroke={ink} strokeWidth={6} />
        <circle cx={hr - 2} cy={headC + 10} r={20} fill={HG.skin} stroke={ink} strokeWidth={6} />
        <ellipse cx={0} cy={headC} rx={hr} ry={hr * 1.02} fill={HG.skin} stroke={ink} strokeWidth={7} />
        {/* Haar: kurz, nach hinten gekämmt, grau meliert */}
        <path
          d={`M ${-hr + 2} ${headC - 22} Q ${-hr - 6} ${headC - hr - 12} ${-10} ${headC - hr - 20} Q ${hr + 4} ${headC - hr - 14} ${hr - 2} ${headC - 26} Q ${hr * 0.6} ${headC - 70} ${20} ${headC - 72} Q ${-hr * 0.5} ${headC - 74} ${-hr + 2} ${headC - 22} Z`}
          fill={HG.hair}
          stroke={ink}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <path d={`M ${-hr * 0.6} ${headC - 86} Q 0 ${headC - 116} ${hr * 0.6} ${headC - 90}`} stroke={HG.hairGray} strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M ${-hr * 0.4} ${headC - 66} Q 10 ${headC - 96} ${hr * 0.7} ${headC - 66}`} stroke={HG.hairGray} strokeWidth={6} fill="none" strokeLinecap="round" />
        <ellipse cx={-62} cy={headC + 38} rx={14} ry={8} fill="#F09A86" opacity={0.55} />
        <ellipse cx={62} cy={headC + 38} rx={14} ry={8} fill="#F09A86" opacity={0.55} />
        {eye(-1)}
        {eye(1)}
        {/* übergroße runde Brille (Hauptmerkmal neben der Jacke) */}
        <g>
          <circle cx={-44} cy={headC - 4} r={36} fill={HG.glass} fillOpacity={0.25} stroke={ink} strokeWidth={9} />
          <circle cx={44} cy={headC - 4} r={36} fill={HG.glass} fillOpacity={0.25} stroke={ink} strokeWidth={9} />
          <path d={`M -10 ${headC - 8} Q 0 ${headC - 16} 10 ${headC - 8}`} stroke={ink} strokeWidth={7} fill="none" />
          <path d={`M -80 ${headC - 8} L ${-hr + 4} ${headC - 2} M 80 ${headC - 8} L ${hr - 4} ${headC - 2}`} stroke={ink} strokeWidth={7} />
          <path d={`M -62 ${headC - 22} L -50 ${headC - 30} M 26 ${headC - 22} L 38 ${headC - 30}`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
        </g>
        {[brow(-1), brow(1)]}
        <path d={`M -4 ${headC + 14} Q 10 ${headC + 28} -6 ${headC + 32}`} stroke={HG.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
        {mouthEl}
      </g>
      {arm(-1, aA)}
      {arm(1, aB)}
    </g>
  );
};

/** Leere Lederjacke am Bügel (Cover/Loop), Ursprung = Fußpunkt wie bei `Jensen`. */
export const EmptyJacket: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly frame: number; readonly swing?: number }> = ({ x, y, s = 1, frame, swing = 0 }) => (
  <g transform={`rotate(${swing} ${x} ${y - 520 * s})`}>
    <Jensen x={x} y={y} s={s} frame={frame} vanish={1} />
  </g>
);

/** Kassenbon-Anhänger am Ärmel („WHAT DID IT COST?“), Ursprung = Schnur oben. */
export const ReceiptTag: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number; readonly swing?: number }> = ({ x, y, s = 1, t, swing = 0 }) => {
  if (t <= 0) return null;
  const len = 150 + 170 * clamp01(t);
  return (
    <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`} filter="url(#paper)">
      <path d="M 0 0 L 0 40" stroke={HG.ink} strokeWidth={5} />
      <path d={`M -130 40 L 130 40 L 130 ${40 + len} ${Array.from({ length: 13 }, (_, i) => `L ${130 - (i + 1) * 20} ${40 + len + (i % 2 ? 0 : 14)}`).join(" ")} Z`} fill={HG.receipt} stroke={HG.ink} strokeWidth={6} strokeLinejoin="round" />
      <T x={0} y={96} size={34}>WHAT DID</T>
      <T x={0} y={138} size={34}>IT COST?</T>
      <path d="M -100 160 L 100 160" stroke={HG.ink} strokeWidth={4} strokeDasharray="10 8" />
      {t > 0.5 ? (
        <g opacity={clamp01((t - 0.5) * 3)}>
          <rect x={-96} y={184} width={120} height={12} fill="#BDB6A6" />
          <T x={96} y={198} size={30} anchor="end">$???</T>
          <rect x={-96} y={222} width={90} height={12} fill="#BDB6A6" />
          <T x={96} y={236} size={30} anchor="end">$???</T>
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Büro (hook, cover, loop)                                            */
/* ------------------------------------------------------------------ */

export const OFFICE = { floor: 1250, calX: 250, calY: 820, screenX: 640, screenY: 760 } as const;

/** Chefbüro bei Nacht: Wand, großer Kurs-Monitor (`crash` 0..1 = Kurve stürzt rot ab), Fensterband, Boden. */
export const Office: React.FC<{ readonly f: number; readonly crash?: number; readonly dim?: number }> = ({ f, crash = 0, dim = 0 }) => {
  const { floor, screenX, screenY } = OFFICE;
  const pts: [number, number][] = [
    [-300, 120],
    [-200, 60],
    [-120, 80],
    [-30, -20],
    [60, -60],
    [130, -110],
  ];
  const drop: [number, number][] = [
    [190, -10],
    [240, 150],
    [300, 210],
  ];
  const k = clamp01(crash);
  const all = k > 0 ? [...pts, ...drop.slice(0, Math.ceil(k * drop.length))] : pts;
  const d = all.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <>
      <Bg id="office" a="#1B2140" b="#2C3560" />
      {/* Wandpaneele */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-700 + i * 200} y={-400} width={8} height={floor + 400} fill="#252C52" />
      ))}
      {/* Kurs-Monitor an der Wand */}
      <g filter="url(#paper)">
        <rect x={screenX - 380} y={screenY - 250} width={760} height={470} rx={18} fill="#0D1222" stroke={HG.ink} strokeWidth={10} />
        <g transform={`translate(${screenX} ${screenY})`}>
          {[-150, -60, 30, 120].map((gy) => (
            <path key={gy} d={`M -330 ${gy} L 330 ${gy}`} stroke="#1F2A48" strokeWidth={4} />
          ))}
          <path d={d} stroke={k > 0 ? HG.red : HG.green} strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {k > 0.6 ? <path d="M 300 210 L 270 170 L 330 180 Z" fill={HG.red} transform="rotate(0)" /> : null}
          <circle cx={all[all.length - 1][0]} cy={all[all.length - 1][1]} r={14 + 3 * Math.sin(f * 0.3)} fill={k > 0 ? HG.red : HG.green} />
        </g>
      </g>
      <rect x={screenX - 40} y={screenY + 220} width={80} height={60} fill="#3A4166" />
      {/* Boden */}
      <rect x={-3000} y={floor} width={8000} height={3000} fill="#3A3150" />
      <rect x={-3000} y={floor} width={8000} height={14} fill={HG.ink} opacity={0.5} />
      {/* Pflanze rechts */}
      <g filter="url(#paperSoft)">
        <path d={`M 960 ${floor} L 940 ${floor - 110} L 1060 ${floor - 110} L 1040 ${floor} Z`} fill="#B0763F" stroke={HG.ink} strokeWidth={6} />
        {[-40, -10, 20, 50].map((a, i) => (
          <ellipse key={a} cx={1000 + a * 1.4} cy={floor - 190 - (i % 2) * 30} rx={26} ry={70} transform={`rotate(${a} ${1000 + a * 1.4} ${floor - 190})`} fill="#3E8E5A" stroke={HG.ink} strokeWidth={5} />
        ))}
      </g>
      {dim > 0 ? <rect x={-3000} y={-3000} width={8000} height={8000} fill="#000" opacity={dim} /> : null}
    </>
  );
};

/** Kalender-Abreißblock (Wochentag groß). `flip` 0..1 = oberstes Blatt reißt ab und fliegt (nur Anzeige `prev`). */
export const CalBlock: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly day: string; readonly sub?: string; readonly color?: string }> = ({
  x,
  y,
  s = 1,
  day,
  sub = "",
  color = HG.red,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
    <rect x={-130} y={-150} width={260} height={300} rx={14} fill={LUX.white} stroke={HG.ink} strokeWidth={7} />
    <rect x={-130} y={-150} width={260} height={80} rx={14} fill={color} stroke={HG.ink} strokeWidth={7} />
    <circle cx={-70} cy={-150} r={12} fill={HG.ink} />
    <circle cx={70} cy={-150} r={12} fill={HG.ink} />
    <T x={0} y={50} size={day.length > 4 ? 64 : 92}>{day}</T>
    {sub ? (
      <T x={0} y={110} size={30} fill="#5A5F6E">
        {sub}
      </T>
    ) : null}
  </g>
);

/** Fliegendes Kalenderblatt (Mitte). */
export const CalSheet: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number; readonly day: string }> = ({ x, y, r = 0, s = 1, day }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-120} y={-140} width={240} height={280} rx={12} fill={LUX.white} stroke={HG.ink} strokeWidth={6} />
    <rect x={-120} y={-140} width={240} height={70} rx={12} fill={HG.red} stroke={HG.ink} strokeWidth={6} />
    <T x={0} y={50} size={84}>
      {day}
    </T>
  </g>
);

/** Daumen-hoch-Stempel „CONFIDENCE“ + Haken (Geometrie, kein Sonderzeichen). `t` 0..1 schlägt ein. */
export const ThumbStamp: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number; readonly r?: number; readonly color?: string; readonly text?: string; readonly mold?: number }> = ({
  x,
  y,
  s = 1,
  t,
  r = -8,
  color = HG.green,
  text = "CONFIDENCE",
  mold = 0,
}) => {
  if (t <= 0) return null;
  const k = 1 + (1 - Math.min(1, t)) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s * k})`} opacity={Math.min(1, t * 2)}>
      <rect x={-250} y={-120} width={500} height={240} rx={26} fill={LUX.white} fillOpacity={0.92} stroke={color} strokeWidth={14} />
      {/* Daumen hoch */}
      <g transform="translate(-170 4) scale(0.95)">
        <rect x={-46} y={-10} width={92} height={86} rx={18} fill={color} stroke={HG.ink} strokeWidth={6} />
        <path d="M -30 -10 L -18 -78 Q -12 -98 6 -92 Q 20 -86 16 -60 L 10 -10 Z" fill={color} stroke={HG.ink} strokeWidth={6} strokeLinejoin="round" />
        {[14, 34, 54].map((yy) => (
          <path key={yy} d={`M 46 ${yy} L 20 ${yy}`} stroke={HG.ink} strokeWidth={5} />
        ))}
      </g>
      <T x={50} y={-6} size={54} fill={color}>
        {text}
      </T>
      <Check x={50} y={58} s={1.2} color={color} t={clamp01((t - 0.3) * 2)} />
      {mold > 0 ? (
        <g opacity={mold}>
          {[
            [-120, -60, 30],
            [140, -70, 24],
            [190, 60, 34],
            [-40, 80, 22],
            [60, 30, 18],
          ].map(([mx, my, mr]) => (
            <circle key={`${mx}${my}`} cx={mx} cy={my} r={mr} fill="#7FA34A" stroke="#4E6B2A" strokeWidth={4} opacity={0.85} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** Board-Mitglied: gesichtslose Anzugfigur, optional Daumen hoch. Ursprung = Fußpunkt, s = 1 ≈ 600 px. */
export const BoardMember: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly seed?: number; readonly color?: string; readonly thumb?: number }> = ({
  x,
  y,
  s = 1,
  f,
  seed = 1,
  color = "#3A3F52",
  thumb = 0,
}) => {
  const bob = Math.sin(f * 0.08 + seed) * 3;
  const ay = lerp(-300, -470, thumb);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paperSoft)">
      <rect x={-50} y={-250} width={42} height={250} rx={16} fill="#1D1D28" />
      <rect x={8} y={-250} width={42} height={250} rx={16} fill="#1D1D28" />
      <path d={`M -96 ${-420 + bob} Q -100 ${-470 + bob} -60 ${-476 + bob} L 60 ${-476 + bob} Q 100 ${-470 + bob} 96 ${-420 + bob} L 84 -230 L -84 -230 Z`} fill={color} stroke={HG.ink} strokeWidth={6} />
      <path d={`M -26 ${-474 + bob} L 0 ${-400 + bob} L 26 ${-474 + bob} Z`} fill={LUX.white} />
      <path d={`M -8 ${-460 + bob} L 8 ${-460 + bob} L 12 ${-380 + bob} L 0 ${-366 + bob} L -12 ${-380 + bob} Z`} fill="#4A5A7A" />
      <circle cx={0} cy={-540 + bob} r={66} fill="#B8BCC8" stroke={HG.ink} strokeWidth={6} />
      {/* Arm rechts mit Daumen */}
      <path d={`M 84 ${-440 + bob} Q 140 ${-400} 130 ${ay}`} stroke={HG.ink} strokeWidth={40} fill="none" strokeLinecap="round" />
      <path d={`M 84 ${-440 + bob} Q 140 ${-400} 130 ${ay}`} stroke={color} strokeWidth={28} fill="none" strokeLinecap="round" />
      <g transform={`translate(130 ${ay})`}>
        <circle r={24} fill="#B8BCC8" stroke={HG.ink} strokeWidth={5} />
        {thumb > 0.5 ? <rect x={-8} y={-52} width={16} height={34} rx={8} fill="#B8BCC8" stroke={HG.ink} strokeWidth={5} /> : null}
      </g>
    </g>
  );
};

/** Graue, gesichtslose Silhouette (Personen aus Berichten: nie Gesicht, nie Name). Ursprung = Fußpunkt, s = 1 ≈ 560 px. */
export const GreySil: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly o?: number; readonly q?: number; readonly color?: string; readonly hair?: boolean }> = ({
  x,
  y,
  s = 1,
  o = 1,
  q = 0,
  color = HG.grey,
  hair = true,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M -110 0 Q -120 -260 -84 -330 Q -40 -380 0 -380 Q 40 -380 84 -330 Q 120 -260 110 0 Z" fill={color} />
    {hair ? <path d="M -78 -420 Q -86 -520 0 -526 Q 86 -520 78 -420 Q 70 -360 40 -380 L -40 -380 Q -70 -360 -78 -420 Z" fill={color} /> : null}
    <circle cx={0} cy={-450} r={64} fill={color} />
    {q > 0 ? (
      <g transform={`translate(0 -450) scale(${q})`}>
        <T x={0} y={36} size={110} fill="#E9ECF2">
          ?
        </T>
      </g>
    ) : null}
  </g>
);

/** Mitarbeiter (anonym, Punkt-Augen), Ursprung = Fußpunkt, s = 1 ≈ 480 px. `shock` 0..1 Mund „o“ + Arme hoch. */
export const Staffer: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly shirt: string; readonly skin?: string; readonly hair?: string; readonly shock?: number; readonly seed?: number; readonly turn?: number }> = ({
  x,
  y,
  s = 1,
  f,
  shirt,
  skin = "#E8B992",
  hair = "#4A3426",
  shock = 0,
  seed = 1,
  turn = 0,
}) => {
  const bob = Math.sin(f * 0.09 + seed) * 3;
  const blink = blinkAt(f, seed + 5);
  const arm = lerp(0, 1, shock);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paperSoft)">
      <rect x={-46} y={-190} width={38} height={190} rx={14} fill="#2F3442" />
      <rect x={8} y={-190} width={38} height={190} rx={14} fill="#2F3442" />
      <path d={`M -80 ${-330 + bob} Q -84 ${-370 + bob} -50 ${-374 + bob} L 50 ${-374 + bob} Q 84 ${-370 + bob} 80 ${-330 + bob} L 70 -180 L -70 -180 Z`} fill={shirt} stroke={HG.ink} strokeWidth={6} />
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={`M ${side * 70} ${-350 + bob} Q ${side * lerp(96, 120, arm)} ${lerp(-280, -400, arm)} ${side * lerp(84, 100, arm)} ${lerp(-210, -470, arm)}`}
          stroke={shirt}
          strokeWidth={30}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <circle cx={0} cy={-440 + bob} r={62} fill={skin} stroke={HG.ink} strokeWidth={6} />
      <path d={`M -62 ${-450 + bob} Q -60 ${-512 + bob} 0 ${-514 + bob} Q 60 ${-512 + bob} 62 ${-450 + bob} Q 30 ${-480 + bob} -62 ${-450 + bob} Z`} fill={hair} stroke={HG.ink} strokeWidth={5} />
      <g transform={`translate(${turn * 14} 0)`}>
        {blink ? (
          <path d={`M -32 ${-440 + bob} L -14 ${-440 + bob} M 14 ${-440 + bob} L 32 ${-440 + bob}`} stroke={HG.ink} strokeWidth={5} />
        ) : (
          <>
            <circle cx={-22} cy={-440 + bob - shock * 4} r={shock > 0.5 ? 10 : 7} fill={HG.ink} />
            <circle cx={22} cy={-440 + bob - shock * 4} r={shock > 0.5 ? 10 : 7} fill={HG.ink} />
          </>
        )}
        {shock > 0.3 ? <ellipse cx={0} cy={-404 + bob} rx={11} ry={15} fill="#5A1E22" stroke={HG.ink} strokeWidth={4} /> : <path d={`M -14 ${-408 + bob} L 14 ${-408 + bob}`} stroke={HG.ink} strokeWidth={5} strokeLinecap="round" />}
      </g>
    </g>
  );
};

/** Taco (halb gefaltete Schale mit Füllung), Mitte. */
export const Taco: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <path d="M -64 10 Q -50 -50 0 -54 Q 50 -50 64 10" fill="#7DBA4A" stroke={HG.ink} strokeWidth={5} />
    <path d="M -54 0 Q -40 -36 0 -40 Q 40 -36 54 0" fill="#D9473B" stroke={HG.ink} strokeWidth={4} />
    <path d="M -70 20 Q -70 -40 0 -44 Q 70 -40 70 20 Z" fill="#F2C14E" stroke={HG.ink} strokeWidth={6} />
  </g>
);

/* ------------------------------------------------------------------ */
/* confess                                                              */
/* ------------------------------------------------------------------ */

/** Firmen-Postfach (eigenes UI, kein Logo). `type` 0..1 tippt die Kernzeile. */
export const Inbox: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly type: number; readonly f: number }> = ({ x, y, s = 1, type, f }) => {
  const line = "I was unfaithful to my wife.";
  const n = Math.round(clamp01(type) * line.length);
  const caret = type > 0 && type < 1.2 && Math.floor(f / 8) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
      <rect x={-450} y={-300} width={900} height={600} rx={26} fill="#F4F6FA" stroke={HG.ink} strokeWidth={9} />
      <rect x={-450} y={-300} width={900} height={84} rx={26} fill="#2E3A5C" stroke={HG.ink} strokeWidth={9} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-400 + i * 40} cy={-258} r={11} fill={["#E8434B", "#FFD23F", "#3BB273"][i]} />
      ))}
      <T x={0} y={-244} size={36} fill="#F4F6FA" spacing={4}>
        INBOX
      </T>
      <T x={-400} y={-150} size={30} anchor="start" fill="#6C7385" weight={700}>
        TO: ALL STAFF
      </T>
      <T x={-400} y={-90} size={42} anchor="start">
        A MESSAGE TO OUR COMPANY
      </T>
      <path d="M -400 -60 L 400 -60" stroke="#C9CEDA" strokeWidth={4} />
      <rect x={-400} y={-30} width={600} height={18} rx={9} fill="#D7DBE5" />
      <rect x={-400} y={4} width={480} height={18} rx={9} fill="#D7DBE5" />
      {/* Kernzeile (Eigenaussage laut Medien) */}
      <rect x={-414} y={52} width={828} height={92} rx={14} fill="#FFF2B8" opacity={type > 0 ? 1 : 0} />
      <T x={-396} y={116} size={50} anchor="start">
        {line.slice(0, n)}
      </T>
      {caret ? <rect x={-396 + n * 25.4} y={70} width={6} height={56} fill={HG.ink} /> : null}
      <rect x={-400} y={180} width={680} height={18} rx={9} fill="#D7DBE5" />
      <rect x={-400} y={214} width={520} height={18} rx={9} fill="#D7DBE5" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* fold                                                                 */
/* ------------------------------------------------------------------ */

/** Zwei gesichtslose Silhouetten mit Herz (Wallpaper, keine realen Personen). */
const Couple: React.FC<{ readonly heart: number }> = ({ heart }) => (
  <g>
    <GreySil x={-58} y={110} s={0.36} color="#9AA2B6" hair={false} />
    <GreySil x={58} y={110} s={0.34} color="#B4BBCB" />
    {heart > 0 ? (
      <path transform={`translate(0 -140) scale(${heart * 1.2})`} d="M 0 30 C -60 -10 -40 -60 0 -36 C 40 -60 60 -10 0 30 Z" fill={HG.red} stroke={HG.ink} strokeWidth={5} />
    ) : null}
  </g>
);

/** Klapphandy (eigene Form). `open` 0..1 klappt auf; zu = Außendisplay mit Paar, auf = Innendisplay mit Paar oben. */
export const FlipPhone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly open: number; readonly heart: number; readonly r?: number }> = ({ x, y, s = 1, open, heart, r = 0 }) => {
  const k = clamp01(open);
  // obere Hälfte klappt um die Mittelachse nach oben (scaleY −1 → 1)
  const top = Math.cos((1 - k) * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
      {/* untere Hälfte (immer) */}
      <rect x={-170} y={0} width={340} height={360} rx={40} fill="#3A3F58" stroke={HG.ink} strokeWidth={9} />
      {k > 0.5 ? (
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={-120 + (i % 3) * 90} y={60 + Math.floor(i / 3) * 80} width={60} height={50} rx={12} fill="#565C78" stroke={HG.ink} strokeWidth={4} />
          ))}
        </g>
      ) : null}
      <rect x={-60} y={-14} width={120} height={28} rx={10} fill="#262A3C" stroke={HG.ink} strokeWidth={5} />
      {/* obere Hälfte */}
      <g transform={`scale(1 ${top})`}>
        <rect x={-170} y={-380} width={340} height={380} rx={40} fill={top < 0 ? "#4A5070" : "#3A3F58"} stroke={HG.ink} strokeWidth={9} />
        {top < 0 ? (
          // zugeklappt sieht man das Außendisplay (Bild ist gespiegelt gezeichnet → zurückspiegeln)
          <g transform="scale(1 -1) translate(0 0)">
            <rect x={-110} y={60} width={220} height={260} rx={22} fill="#FFE1EA" stroke={HG.ink} strokeWidth={6} />
            <g transform="translate(0 220)">
              <Couple heart={heart} />
            </g>
          </g>
        ) : (
          <g>
            <rect x={-140} y={-350} width={280} height={320} rx={22} fill="#FFE1EA" stroke={HG.ink} strokeWidth={6} />
            <g transform="translate(0 -110)">
              <Couple heart={heart} />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

/** Grafikkarten-Maskottchen (eigene Figur, kein Markenlogo): Lüfter-Augen, Lächeln, Ärmchen. `wink` 0..1. */
export const GpuBuddy: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly wink?: number; readonly glow?: number; readonly hearts?: number }> = ({
  x,
  y,
  s = 1,
  f,
  wink = 0,
  glow = 1,
  hearts = 0,
}) => {
  const spin = f * 14;
  const fan = (cx: number, closed: boolean) => (
    <g transform={`translate(${cx} -10)`}>
      <circle r={74} fill="#22252E" stroke={HG.ink} strokeWidth={7} />
      {closed ? (
        <path d="M -44 6 Q 0 -30 44 6" stroke="#E9EDF3" strokeWidth={12} fill="none" strokeLinecap="round" />
      ) : (
        <g transform={`rotate(${spin})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M 0 0 Q 30 -20 56 -6 Q 30 6 0 0 Z" fill="#9AA6C4" stroke={HG.ink} strokeWidth={3} />
          ))}
          <circle r={18} fill="#E9EDF3" stroke={HG.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow > 0 ? <circle cx={0} cy={0} r={300} fill="#BFF7FF" opacity={0.18 * glow} /> : null}
      <g filter="url(#sticker)">
        {/* Ärmchen */}
        <path d={`M -230 20 Q -300 ${-40 + 10 * Math.sin(f * 0.2)} -290 -120`} stroke={HG.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M 230 20 Q 300 60 300 0" stroke={HG.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
        <circle cx={-290} cy={-124} r={22} fill="#E9EDF3" stroke={HG.ink} strokeWidth={5} />
        <circle cx={300} cy={-2} r={22} fill="#E9EDF3" stroke={HG.ink} strokeWidth={5} />
        {/* Platine + Gehäuse */}
        <rect x={-240} y={-120} width={480} height={240} rx={30} fill="#3C4152" stroke={HG.ink} strokeWidth={9} />
        <rect x={-240} y={90} width={480} height={30} fill="#1E7F6E" stroke={HG.ink} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={-200 + i * 22} y={120} width={14} height={30} fill="#F2C14E" stroke={HG.ink} strokeWidth={3} />
        ))}
        <path d="M -240 -60 L 240 -60" stroke="#565C70" strokeWidth={5} />
        {fan(-110, false)}
        {fan(110, wink > 0.5)}
        {/* Lächeln + Bäckchen */}
        <path d="M -60 62 Q 0 104 60 62" stroke="#E9EDF3" strokeWidth={10} fill="none" strokeLinecap="round" />
        <ellipse cx={-190} cy={60} rx={20} ry={11} fill="#FF8FA3" opacity={0.8} />
        <ellipse cx={190} cy={60} rx={20} ry={11} fill="#FF8FA3" opacity={0.8} />
      </g>
      {hearts > 0
        ? [0, 1, 2].map((i) => {
            const t = (hearts * 1.4 - i * 0.2) % 1;
            if (hearts * 1.4 < i * 0.2) return null;
            return (
              <path
                key={i}
                transform={`translate(${-160 + i * 160} ${-170 - t * 160}) scale(${0.7 + 0.3 * Math.sin(t * Math.PI)})`}
                d="M 0 30 C -60 -10 -40 -60 0 -36 C 40 -60 60 -10 0 30 Z"
                fill={HG.red}
                stroke={HG.ink}
                strokeWidth={5}
                opacity={1 - t * 0.6}
              />
            );
          })
        : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* alleged                                                              */
/* ------------------------------------------------------------------ */

/** Sitzungstisch (Seitenansicht flach) mit Stühlen + Namensschildern „INDEPENDENT DIRECTORS“. */
export const BoardTable: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <path d="M -520 0 L 520 0 L 470 -70 L -470 -70 Z" fill="#6B4A32" stroke={HG.ink} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-520} y={0} width={1040} height={40} fill="#4F3524" stroke={HG.ink} strokeWidth={8} />
    <rect x={-480} y={40} width={30} height={200} fill="#3B2818" />
    <rect x={450} y={40} width={30} height={200} fill="#3B2818" />
  </g>
);

export const NamePlate: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly s?: number; readonly w?: number; readonly fill?: string; readonly fg?: string }> = ({
  x,
  y,
  text,
  s = 1,
  w,
  fill = "#E9DDBF",
  fg = HG.ink,
}) => {
  const width = w ?? text.length * 22 + 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paperSoft)">
      <path d={`M ${-width / 2} 0 L ${width / 2} 0 L ${width / 2 - 14} -64 L ${-width / 2 + 14} -64 Z`} fill={fill} stroke={HG.ink} strokeWidth={5} strokeLinejoin="round" />
      <T x={0} y={-20} size={Math.min(34, (width - 30) / (text.length * 0.66))} fill={fg}>
        {text}
      </T>
    </g>
  );
};

/** Aktenordner mit Rücken-Etikett. */
export const Binder: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly text: string }> = ({ x, y, s = 1, r = 0, text }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-210} y={-70} width={420} height={140} rx={10} fill="#2F5D8A" stroke={HG.ink} strokeWidth={6} />
    <rect x={-190} y={-40} width={380} height={80} rx={6} fill={LUX.white} stroke={HG.ink} strokeWidth={4} />
    <T x={0} y={12} size={Math.min(36, 360 / (text.length * 0.66))}>
      {text}
    </T>
  </g>
);

/** Zitat-Karte im Schreibmaschinen-Look. `type` 0..1 tippt. */
export const QuoteCard: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly lines: readonly string[]; readonly source: string; readonly type: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  lines,
  source,
  type,
}) => {
  const total = lines.join("").length;
  let left = Math.round(clamp01(type) * total);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
      <rect x={-420} y={-170} width={840} height={340} rx={10} fill="#F3EEDF" stroke={HG.ink} strokeWidth={8} />
      <T x={-380} y={-96} size={90} anchor="start" fill="#B9AE90" family="Courier New, monospace">
        “
      </T>
      {lines.map((l, i) => {
        const shown = l.slice(0, Math.max(0, left));
        left -= l.length;
        return (
          <T key={l} x={0} y={-50 + i * 64} size={46} weight={700} family="Courier New, monospace" spacing={0}>
            {shown}
          </T>
        );
      })}
      <path d="M -360 100 L 360 100" stroke="#C9C0A6" strokeWidth={4} />
      <T x={0} y={146} size={30} weight={700} fill="#5A5F6E" o={type >= 1 ? 1 : 0}>
        {source}
      </T>
    </g>
  );
};

/** Zeitungsausschnitt (eigene Typo, Zeitungsname nur als Text). */
export const Paper: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly title: string; readonly o?: number }> = ({ x, y, s = 1, r = 0, title, o = 1 }) => {
  const rnd = seeded(5);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)" opacity={o}>
      <path d="M -330 -230 L 320 -240 L 334 -80 L 318 80 L 330 236 L -324 232 L -338 60 L -326 -60 Z" fill="#EFE7D2" stroke={HG.ink} strokeWidth={6} strokeLinejoin="round" />
      <T x={0} y={-150} size={78} family="Georgia, serif" spacing={2}>
        {title}
      </T>
      <path d="M -290 -120 L 290 -120 M -290 -110 L 290 -110" stroke={HG.ink} strokeWidth={3} />
      <rect x={-290} y={-80} width={580} height={30} fill="#3A3A40" />
      {Array.from({ length: 3 }, (_, c) =>
        Array.from({ length: 7 }, (_, rI) => <rect key={`${c}-${rI}`} x={-290 + c * 200} y={-24 + rI * 34} width={170 - rnd() * 40} height={12} fill="#A9A28F" />),
      )}
    </g>
  );
};

/** Karte mit Text (Papier, Sticker-Kante) – kurz. */
export const Note: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly lines: readonly string[]; readonly fill?: string; readonly fg?: string; readonly size?: number; readonly w?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  lines,
  fill = HG.paper,
  fg = HG.ink,
  size = 54,
  w,
}) => {
  const width = w ?? Math.max(...lines.map((l) => l.length)) * size * 0.68 + 80;
  const h = lines.length * size * 1.15 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
      <rect x={-width / 2} y={-h / 2} width={width} height={h} rx={20} fill={fill} stroke={HG.ink} strokeWidth={7} />
      {lines.map((l, i) => (
        <T key={l} x={0} y={-((lines.length - 1) * size * 1.15) / 2 + i * size * 1.15 + size * 0.36} size={size} fill={fg}>
          {l}
        </T>
      ))}
    </g>
  );
};

/** Gummistempel (rot), schlägt ein (`t` 0..1). */
export const RubberStamp: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly t: number; readonly r?: number; readonly color?: string; readonly size?: number }> = ({
  x,
  y,
  text,
  t,
  r = -10,
  color = HG.red,
  size = 64,
}) => {
  if (t <= 0) return null;
  const k = 1 + (1 - Math.min(1, t)) * 1.6;
  const width = text.length * size * 0.74 + 60;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`} opacity={Math.min(1, t * 2)}>
      <rect x={-width / 2} y={-size * 0.95} width={width} height={size * 1.6} rx={12} fill={LUX.white} fillOpacity={0.55} stroke={color} strokeWidth={10} />
      <T x={0} y={size * 0.36} size={size} fill={color} spacing={3}>
        {text}
      </T>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* crash + twist                                                        */
/* ------------------------------------------------------------------ */

export type ChartPt = { readonly x: number; readonly y: number; readonly label?: string };

/** Kurs-Chart (eigene Grafik) auf Terminal. `upto` = Punkt-Index (Bruch = halber Weg zum nächsten Punkt). */
export const StockChart: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly pts: readonly ChartPt[];
  readonly upto: number;
  readonly color?: string;
  readonly w?: number;
  readonly h?: number;
  readonly f: number;
  readonly fill?: string;
  readonly pulse?: number;
}> = ({ x, y, s = 1, pts, upto, color = HG.red, w = 860, h = 560, f, fill = "#0D1222", pulse = 0 }) => {
  const u = Math.max(0, Math.min(pts.length - 1, upto));
  const i0 = Math.floor(u);
  const shown: [number, number][] = pts.slice(0, i0 + 1).map((p) => [p.x, p.y]);
  if (i0 < pts.length - 1 && u > i0) {
    const a = pts[i0];
    const b = pts[i0 + 1];
    shown.push([lerp(a.x, b.x, u - i0), lerp(a.y, b.y, u - i0)]);
  }
  const d = shown.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const tip = shown[shown.length - 1];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g filter="url(#paper)">
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={20} fill={fill} stroke={HG.ink} strokeWidth={10} />
      </g>
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M ${-w / 2 + 40} ${-h / 2 + 70 + i * ((h - 140) / 4)} L ${w / 2 - 40} ${-h / 2 + 70 + i * ((h - 140) / 4)}`} stroke="#1F2A48" strokeWidth={4} />
      ))}
      <path d={d} stroke={HG.ink} strokeWidth={24} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.5} />
      <path d={d} stroke={color} strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) =>
        p.label && i <= u + 0.001 ? (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === 0 ? 14 + 10 * pulse : 12} fill={i === 0 && pulse > 0 ? HG.yellow : "#F4F6FA"} stroke={HG.ink} strokeWidth={4} />
            <T x={p.x + (i === 0 ? 20 : 0)} y={p.y + (i === 0 ? -34 : 54)} size={32} fill="#E9EDF3" anchor={i === 0 ? "start" : "middle"}>
              {p.label}
            </T>
          </g>
        ) : null,
      )}
      <circle cx={tip[0]} cy={tip[1]} r={16 + 3 * Math.sin(f * 0.35)} fill={color} stroke={HG.ink} strokeWidth={4} />
    </g>
  );
};

/** Rotes Laufband „BREAKING“ (Fake-Ticker, eigenes Layout). Bildraum-Breite 1080, `off` = Laufweg in px. */
export const Ticker: React.FC<{ readonly y: number; readonly text: string; readonly off: number; readonly o?: number; readonly x0?: number; readonly w?: number }> = ({ y, text, off, o = 1, x0 = -200, w = 1480 }) => {
  const unit = text.length * 34 + 200;
  return (
    <g opacity={o}>
      <rect x={x0} y={y - 46} width={w} height={92} fill={HG.red} stroke={HG.ink} strokeWidth={8} />
      <rect x={x0} y={y - 46} width={w} height={14} fill="#B5232B" />
      <defs>
        <clipPath id={`tick-${y}`}>
          <rect x={x0} y={y - 46} width={w} height={92} />
        </clipPath>
      </defs>
      <g clipPath={`url(#tick-${y})`}>
        {[0, 1, 2].map((i) => (
          <T key={i} x={x0 + 1500 - (off % unit) + i * unit} y={y + 18} size={50} fill="#FFFFFF" anchor="start" spacing={2}>
            {text}
          </T>
        ))}
      </g>
    </g>
  );
};

/** Kniende Investor-Figur (anonym, von der Seite, Hände gefaltet). Ursprung = Knie am Boden. */
export const Kneeler: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => {
  const bob = Math.sin(f * 0.12) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
      <path d="M -40 0 L 120 0 Q 140 0 140 -20 L 140 -40 L -20 -40 Z" fill="#2F3442" stroke={HG.ink} strokeWidth={6} />
      <path d="M -40 0 L -40 -150 Q -40 -170 -10 -170 L 30 -170 L 30 -40 Z" fill="#2F3442" stroke={HG.ink} strokeWidth={6} />
      <path d={`M -70 ${-160 + bob} Q -80 ${-330 + bob} 0 ${-340 + bob} Q 70 ${-330 + bob} 60 ${-160 + bob} Z`} fill="#4A6FA5" stroke={HG.ink} strokeWidth={6} />
      <path d={`M 40 ${-300 + bob} Q 110 ${-280 + bob} 100 ${-380 + bob}`} stroke="#4A6FA5" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M 88 ${-372 + bob} L 106 ${-430 + bob} L 124 ${-372 + bob} Z`} fill="#E8B992" stroke={HG.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={10} cy={-400 + bob} r={58} fill="#E8B992" stroke={HG.ink} strokeWidth={6} />
      <path d={`M -48 ${-410 + bob} Q -40 ${-470 + bob} 20 ${-462 + bob} Q 64 ${-450 + bob} 64 ${-414 + bob} Q 20 ${-440 + bob} -48 ${-410 + bob} Z`} fill="#4A3426" stroke={HG.ink} strokeWidth={5} />
      <path d={`M 26 ${-400 + bob} Q 36 ${-394 + bob} 46 ${-400 + bob}`} stroke={HG.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Kleiner Markt-Pfeil (grün, nach oben) mit Etikett. */
export const MarketArrow: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number; readonly label: string }> = ({ x, y, s = 1, t, label }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, t)})`} filter="url(#sticker)">
      <rect x={-110} y={-60} width={220} height={150} rx={18} fill="#14301E" stroke={HG.ink} strokeWidth={6} />
      <path d="M -50 40 L 0 -30 L 50 40 Z" fill="#3DDC5A" stroke={HG.ink} strokeWidth={5} strokeLinejoin="round" />
      <T x={0} y={78} size={30} fill="#BFF5C9">
        {label}
      </T>
    </g>
  );
};

/** Wahlurne (eigene Form, kein Länder-/Parteisymbol). */
export const BallotBox: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t?: number }> = ({ x, y, s = 1, t = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
    <rect x={-110} y={-200} width={220} height={200} rx={14} fill="#E9ECF2" stroke={HG.ink} strokeWidth={7} />
    <rect x={-70} y={-206} width={140} height={14} rx={6} fill={HG.ink} />
    <g transform={`translate(0 ${-210 - 60 * (1 - clamp01(t))})`}>
      <rect x={-50} y={-90} width={100} height={110} fill={LUX.white} stroke={HG.ink} strokeWidth={5} />
      <path d="M -26 -40 L -8 -20 L 28 -62" stroke={HG.ink} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <T x={0} y={-80} size={34}>
      VOTE
    </T>
  </g>
);

/** Rechenzentrum-Icon (Serverschrank) mit Paragraphen-Zeichen (als Geometrie gezeichnet). */
export const ServerRack: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#sticker)">
    <rect x={-100} y={-300} width={200} height={300} rx={12} fill="#2C3346" stroke={HG.ink} strokeWidth={7} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={-80} y={-280 + i * 70} width={160} height={50} rx={6} fill="#3E4762" stroke={HG.ink} strokeWidth={4} />
        <circle cx={-56} cy={-255 + i * 70} r={7} fill={(Math.floor(f / 6) + i) % 3 === 0 ? "#3DDC5A" : "#1E5A2E"} />
      </g>
    ))}
    {/* Paragraphen-Siegel */}
    <g transform="translate(90 -290)">
      <circle r={52} fill={HG.yellow} stroke={HG.ink} strokeWidth={6} />
      <T x={0} y={24} size={70} fill={HG.ink}>
        §
      </T>
    </g>
  </g>
);

/** Papp-Chart, das brennt (Flammen `heat` 0..1+, flackern). */
export const BurningChart: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly heat: number }> = ({ x, y, s = 1, f, heat }) => {
  const rnd = seeded(9);
  const flames = Array.from({ length: 7 }, () => [rnd(), rnd()] as const);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g filter="url(#paper)">
        <rect x={-230} y={-330} width={460} height={330} rx={10} fill="#C9A77A" stroke={HG.ink} strokeWidth={7} />
        <path d="M -190 -270 L -110 -230 L -40 -250 L 30 -150 L 110 -110 L 190 -40" stroke={HG.red} strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <rect x={-30} y={0} width={60} height={60} fill="#8A6A44" stroke={HG.ink} strokeWidth={5} />
      </g>
      {flames.map(([a, b], i) => {
        const fx = -190 + i * 63;
        const hh = (90 + a * 90) * heat * (0.85 + 0.15 * Math.sin(f * (0.5 + b * 0.4) + i));
        if (hh <= 2) return null;
        return (
          <g key={i} transform={`translate(${fx} -300)`}>
            <path d={`M -40 0 Q -46 ${-hh * 0.5} 0 ${-hh} Q 46 ${-hh * 0.5} 40 0 Z`} fill="#FF8A3D" stroke={HG.ink} strokeWidth={5} />
            <path d={`M -20 0 Q -22 ${-hh * 0.35} 0 ${-hh * 0.6} Q 22 ${-hh * 0.35} 20 0 Z`} fill={HG.yellow} />
          </g>
        );
      })}
    </g>
  );
};

/** Laubbläser (in der Hand, Mitte = Griff), bläst nach links; `blow` 0..1 Luftstriche. */
export const LeafBlower: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly blow: number }> = ({ x, y, s = 1, f, blow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#paperSoft)">
      <rect x={-40} y={-40} width={120} height={90} rx={22} fill="#E8434B" stroke={HG.ink} strokeWidth={6} />
      <path d="M -40 0 L -250 -30 L -250 20 L -40 30 Z" fill="#F2C14E" stroke={HG.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={60} cy={4} r={18} fill="#2C2C33" />
    </g>
    {blow > 0
      ? [0, 1, 2, 3].map((i) => {
          const k = ((f * 0.08 + i * 0.25) % 1 + 1) % 1;
          return <path key={i} d={`M ${-270 - k * 180} ${-30 + i * 18} l -90 ${(i - 1.5) * 8}`} stroke="#E9F4FF" strokeWidth={9} strokeLinecap="round" opacity={blow * (1 - k)} />;
        })
      : null}
  </g>
);

/* ------------------------------------------------------------------ */
/* pr + answer + loop                                                   */
/* ------------------------------------------------------------------ */

/** Chefsessel (frontal) mit Namensschild auf dem Tisch davor wird von `JacketChair` genutzt. */
export const ExecChair: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly spin?: number }> = ({ x, y, s = 1, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <path d="M -160 -560 Q -170 -640 -100 -650 L 100 -650 Q 170 -640 160 -560 L 150 -260 L -150 -260 Z" fill="#2A2730" stroke={HG.ink} strokeWidth={9} transform={`scale(${Math.cos(spin)} 1)`} />
    <rect x={-190} y={-280} width={380} height={70} rx={24} fill="#2A2730" stroke={HG.ink} strokeWidth={8} />
    <rect x={-14} y={-210} width={28} height={150} fill="#55525E" stroke={HG.ink} strokeWidth={5} />
    <path d="M -130 -40 L 130 -40 M 0 -60 L 0 -20" stroke="#55525E" strokeWidth={14} strokeLinecap="round" />
    <circle cx={-130} cy={-24} r={14} fill={HG.ink} />
    <circle cx={130} cy={-24} r={14} fill={HG.ink} />
  </g>
);

/** Milchtüte (eigene Form) mit Gesicht; `medal` 0..1 Goldmedaille. */
export const MilkCarton: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly medal?: number; readonly happy?: number }> = ({ x, y, s = 1, f, medal = 0, happy = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#sticker)">
      <path d="M -110 0 L -110 -300 L -60 -380 L 60 -380 L 110 -300 L 110 0 Z" fill="#F4F7FF" stroke={HG.ink} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -110 -300 L 110 -300 M -60 -380 L 0 -300 L 60 -380" stroke={HG.ink} strokeWidth={6} fill="none" />
      <rect x={-110} y={-230} width={220} height={110} fill="#5DA9E9" stroke={HG.ink} strokeWidth={6} />
      <T x={0} y={-160} size={50} fill="#FFFFFF">
        MILK
      </T>
      <circle cx={-40} cy={-70} r={blinkAt(f, 7) ? 2 : 12} fill={HG.ink} />
      <circle cx={40} cy={-70} r={blinkAt(f, 7) ? 2 : 12} fill={HG.ink} />
      <path d={`M -30 -34 Q 0 ${-34 + 22 * happy + 4} 30 -34`} stroke={HG.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    </g>
    {medal > 0 ? (
      <g transform={`translate(0 ${-10 - 30 * (1 - medal)}) scale(${medal})`} filter="url(#paperSoft)">
        <path d="M -40 -150 L -10 -60 M 40 -150 L 10 -60" stroke={HG.red} strokeWidth={16} />
        <circle cx={0} cy={-40} r={36} fill="#F2C14E" stroke={HG.ink} strokeWidth={6} />
        <circle cx={0} cy={-40} r={20} fill="none" stroke="#C28E25" strokeWidth={5} />
      </g>
    ) : null}
  </g>
);

/** Fliegen um Verdorbenes (deterministisch). */
export const Flies: React.FC<{ readonly x: number; readonly y: number; readonly f: number; readonly o: number }> = ({ x, y, f, o }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      {[0, 1, 2].map((i) => {
        const a = f * (0.15 + i * 0.04) + i * 2;
        return (
          <g key={i} transform={`translate(${x + Math.cos(a) * (90 + i * 30)} ${y + Math.sin(a * 1.3) * 60})`}>
            <ellipse cx={-8} cy={-8} rx={9} ry={6} fill="#DDEBFF" opacity={0.8} />
            <ellipse cx={8} cy={-8} rx={9} ry={6} fill="#DDEBFF" opacity={0.8} />
            <circle r={7} fill={HG.ink} />
          </g>
        );
      })}
    </g>
  );

/** Langer Kassenbon (rollt aus `t` 0..1), Posten erscheinen nacheinander (`items` = [Text, Wert]). */
export const Receipt: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly t: number;
  readonly items: readonly (readonly [string, string, string?])[];
  readonly show: readonly number[];
  readonly f: number;
}> = ({ x, y, s = 1, t, items, show, f }) => {
  const full = 140 + items.length * 120 + 40;
  const len = full * clamp01(t);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id="rcpt">
          <rect x={-400} y={-10} width={800} height={len + 30} />
        </clipPath>
      </defs>
      <g clipPath="url(#rcpt)" filter="url(#paper)">
        <path d={`M -360 0 L 360 0 L 360 ${full} ${Array.from({ length: 24 }, (_, i) => `L ${360 - (i + 1) * 30} ${full + (i % 2 ? 0 : 16)}`).join(" ")} Z`} fill={HG.receipt} stroke={HG.ink} strokeWidth={6} />
        <T x={0} y={70} size={52}>
          WHAT DID IT COST?
        </T>
        <path d="M -320 100 L 320 100" stroke={HG.ink} strokeWidth={4} strokeDasharray="12 8" />
        {items.map(([a, b, c], i) => {
          const at = show[i] ?? 1e9;
          const k = clamp01((f - at) / 8);
          if (k <= 0) return null;
          const yy = 170 + i * 120;
          return (
            <g key={a} opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
              <T x={-320} y={yy - 22} size={40} anchor="start">
                {a}
              </T>
              <T x={320} y={yy + 30} size={Math.min(42, 640 / (b.length * 0.74))} anchor="end" fill={c ?? HG.ink}>
                {b}
              </T>
              {i === items.length - 1 ? null : <path d={`M -320 ${yy + 50} L 320 ${yy + 50}`} stroke="#D6CFBE" strokeWidth={3} />}
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** Lagerregal voller Chips (eigene Kästchen), ein Fach „TRUST“ leer. `empty` 0..1 hebt das leere Fach hervor. */
export const ChipShelf: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly empty: number; readonly f: number }> = ({ x, y, s = 1, empty, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#paper)">
      <rect x={-450} y={-560} width={900} height={560} rx={10} fill="#8A5A34" stroke={HG.ink} strokeWidth={8} />
      {[0, 1, 2].map((r) => (
        <rect key={r} x={-430} y={-540 + r * 180} width={860} height={160} fill="#5E3A1E" stroke={HG.ink} strokeWidth={5} />
      ))}
    </g>
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3].map((c) => {
        const isTrust = r === 1 && c === 2;
        const cx = -320 + c * 213;
        const cy = -460 + r * 180;
        if (isTrust)
          return (
            <g key={`${r}${c}`}>
              <rect x={cx - 90} y={cy - 70} width={180} height={140} fill="#2A1A0E" stroke={empty > 0 ? HG.red : HG.ink} strokeWidth={empty > 0 ? 8 + 3 * Math.sin(f * 0.4) * empty : 4} strokeDasharray="14 10" />
              <g transform={`translate(${cx} ${cy + 86})`}>
                <rect x={-80} y={-22} width={160} height={44} rx={6} fill={HG.yellow} stroke={HG.ink} strokeWidth={4} />
                <T x={0} y={12} size={30}>
                  TRUST
                </T>
              </g>
            </g>
          );
        return (
          <g key={`${r}${c}`} transform={`translate(${cx} ${cy})`} filter="url(#paperSoft)">
            <rect x={-70} y={-56} width={140} height={112} rx={10} fill="#3C4152" stroke={HG.ink} strokeWidth={5} />
            <rect x={-40} y={-30} width={80} height={60} rx={6} fill="#7E8AA8" stroke={HG.ink} strokeWidth={4} />
            {[-1, 1].map((sd) =>
              [0, 1, 2].map((k) => <rect key={`${sd}${k}`} x={sd > 0 ? 40 : -52} y={-24 + k * 18} width={12} height={8} fill="#F2C14E" />),
            )}
            <T x={0} y={8} size={22} fill="#FFFFFF">
              CHIP
            </T>
          </g>
        );
      }),
    )}
  </g>
);

/** Stoppuhr (eigene Form), `sec` = angezeigte Sekunden, Zeiger dreht. */
export const Stopwatch: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly sec: number; readonly t?: number }> = ({ x, y, s = 1, sec, t = 1 }) => {
  if (t <= 0) return null;
  const mm = Math.floor(sec / 60);
  const ss = Math.floor(sec % 60);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, t)})`} filter="url(#sticker)">
      <rect x={-26} y={-190} width={52} height={40} rx={8} fill="#C9CED8" stroke={HG.ink} strokeWidth={6} />
      <circle cx={0} cy={0} r={160} fill={LUX.white} stroke={HG.ink} strokeWidth={10} />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} transform={`rotate(${i * 30})`} d="M 0 -140 L 0 -118" stroke={HG.ink} strokeWidth={6} />
      ))}
      <path transform={`rotate(${(sec % 60) * 6})`} d="M 0 20 L 0 -120" stroke={HG.red} strokeWidth={9} strokeLinecap="round" />
      <circle r={14} fill={HG.ink} />
      <T x={0} y={80} size={46}>
        {`${mm}:${ss < 10 ? `0${ss}` : String(ss)}`}
      </T>
    </g>
  );
};

/** Poof-Wölkchen (Papierfetzen) um (x, y), `t` 0..1. */
export const Poof: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - t}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 60 + t * 240;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.8} r={40 * (1 - t) + 10} fill="#E9ECF2" stroke={HG.ink} strokeWidth={4} />;
      })}
    </g>
  );
};
