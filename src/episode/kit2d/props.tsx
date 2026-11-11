import React from "react";
import { C, Label } from "./core";

/**
 * Requisiten (2D, flach, INK-Kontur). Ursprung jeweils in der Mitte bzw. am Fußpunkt (steht dabei).
 * Alles ohne Filter – Tiefe über versetzte Schattenkopie (Paper-Cut).
 */

const K = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const };

/* ------------------------------ Straße ------------------------------ */

/** Mensch als flache Silhouette (Fußpunkt). `pop` 0..1: verschwindet mit Ring (POOF). */
export const Person: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly step?: number; readonly pop?: number; readonly s?: number; readonly tone?: string }> = ({
  x,
  y,
  color,
  step = 0,
  pop = 0,
  s = 1,
  tone = "#2B3566",
}) => {
  const k = 1 - Math.min(1, pop * 1.6);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {k > 0 ? (
        <g transform={`scale(${k} ${k})`} opacity={k}>
          <path d={`M -14 0 L ${-8 + step * 14} -70 L 8 -70 L ${14 - step * 14} 0`} stroke={tone} strokeWidth={16} strokeLinecap="round" fill="none" />
          <rect x={-26} y={-160} width={52} height={96} rx={22} fill={color} />
          <circle cy={-186} r={26} fill={tone} />
        </g>
      ) : null}
      {pop > 0 && pop < 1 ? (
        <g opacity={1 - pop}>
          <circle cy={-110} r={40 + pop * 110} fill="none" stroke={C.white} strokeWidth={8 * (1 - pop)} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line
              key={a}
              x1={Math.cos((a * Math.PI) / 180) * (50 + pop * 70)}
              y1={-110 + Math.sin((a * Math.PI) / 180) * (50 + pop * 70)}
              x2={Math.cos((a * Math.PI) / 180) * (80 + pop * 110)}
              y2={-110 + Math.sin((a * Math.PI) / 180) * (80 + pop * 110)}
              stroke={C.white}
              strokeWidth={7}
              strokeLinecap="round"
            />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/** Leerer Kleiderhaufen (Fußpunkt). `drop` 0..1 = fällt in sich zusammen. */
export const Clothes: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly drop?: number; readonly s?: number }> = ({ x, y, color, drop = 1, s = 1 }) => {
  if (drop <= 0) return null;
  const h = 1 - drop;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${-110 * h}) scale(1 ${0.4 + 0.6 * drop})`}>
        <path d="M -60 0 Q -50 -34 -10 -36 Q 30 -40 56 -20 Q 70 -4 60 0 Z" fill={color} {...K} />
        <path d="M -40 -26 L -70 -50 L -52 -60 L -24 -38" fill={color} {...K} />
      </g>
      <ellipse cx={0} cy={2} rx={70} ry={8} fill="#000" opacity={0.3 * drop} />
    </g>
  );
};

/** Handy (Mitte). `bars` 0..4 Empfangsbalken, `screen` an/aus. */
export const Phone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly bars?: number; readonly screen?: boolean; readonly noSignal?: boolean }> = ({
  x,
  y,
  s = 1,
  r = 0,
  bars = 4,
  screen = true,
  noSignal = false,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-40} y={-74} width={80} height={148} rx={14} fill="#1B2140" {...K} />
    <rect x={-31} y={-60} width={62} height={116} rx={6} fill={screen ? "#4FC3F7" : "#0B0F22"} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={-22 + i * 12} y={-30 - i * 8} width={8} height={10 + i * 8} fill={i < bars ? C.white : "#2A3360"} />
    ))}
    {noSignal ? <path d="M -24 -48 L 26 2 M 26 -48 L -24 2" stroke={C.danger} strokeWidth={8} strokeLinecap="round" /> : null}
  </g>
);

/** Auto (Fußpunkt Mitte), Breite ≈ 360. */
export const Car: React.FC<{ readonly x: number; readonly y: number; readonly color?: string; readonly s?: number }> = ({ x, y, color = "#2A3566", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -180 -40 L -170 -90 Q -150 -110 -110 -112 L -70 -170 Q -50 -186 0 -186 L 70 -186 Q 100 -184 120 -150 L 140 -112 Q 180 -108 186 -80 L 186 -40 Z" fill={color} {...K} />
    <path d="M -56 -160 L -88 -116 L 0 -116 L 0 -164 Q -30 -166 -56 -160 Z M 16 -164 L 16 -116 L 112 -116 L 94 -152 Q 82 -166 60 -166 Z" fill="#0E1430" />
    <circle cx={-110} cy={-36} r={34} fill="#0A0D1C" {...K} />
    <circle cx={110} cy={-36} r={34} fill="#0A0D1C" {...K} />
  </g>
);

/* ------------------------------ Blackout ------------------------------ */

/** Vereinfachte Iberische Halbinsel (Mitte), Breite ≈ 640. */
export const SPAIN_PATH =
  "M -300 -200 Q -180 -250 -40 -230 Q 120 -250 230 -200 Q 300 -170 320 -110 Q 270 -60 260 0 Q 230 90 150 150 Q 60 200 -60 210 Q -180 200 -240 150 Q -300 80 -290 0 Q -320 -100 -300 -200 Z";

/** Stromleitung als leuchtender Strich; `on` 0..1. */
export const PowerLine: React.FC<{ readonly d: string; readonly on: number }> = ({ d, on }) => (
  <g>
    <path d={d} stroke="#3A2A3C" strokeWidth={10} fill="none" strokeLinecap="round" />
    {on > 0 ? (
      <>
        <path d={d} stroke={C.window} strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.25 * on} />
        <path d={d} stroke={C.window} strokeWidth={8} fill="none" strokeLinecap="round" opacity={on} />
      </>
    ) : null}
  </g>
);

/** Rundes Icon-Schild (Mitte) mit Inhalt; Paper-Cut-Schatten. */
export const Badge: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly color?: string; readonly children: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  color = C.white,
  children,
}) => {
  if (s <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={8} cy={10} r={78} fill="#000" opacity={0.35} />
      <circle r={78} fill={color} {...K} />
      {children}
    </g>
  );
};

export const TrainIcon: React.FC = () => (
  <g>
    <rect x={-48} y={-46} width={96} height={80} rx={18} fill="#2A3566" {...K} />
    <rect x={-34} y={-34} width={68} height={30} rx={6} fill="#4FC3F7" />
    <circle cx={-24} cy={16} r={8} fill={C.window} />
    <circle cx={24} cy={16} r={8} fill={C.window} />
    <path d="M -40 50 L 40 50" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
  </g>
);
export const HospitalIcon: React.FC = () => (
  <g>
    <rect x={-46} y={-44} width={92} height={84} rx={8} fill={C.white} {...K} />
    <path d="M -12 -30 h 24 v 18 h 18 v 24 h -18 v 18 h -24 v -18 h -18 v -24 h 18 Z" fill={C.danger} />
    <rect x={18} y={34} width={36} height={22} rx={4} fill={C.window} {...K} />
  </g>
);

/** Reparaturwagen (Fußpunkt Mitte), Fahrertür offen, niemand drin. */
export const RepairTruck: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly door?: number }> = ({ x, y, s = 1, door = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-250} width={300} height={200} rx={10} fill="#E8E0C8" {...K} />
    <path d="M -230 -200 h 60 l -10 30 h -60 Z M -130 -200 h 60 l -10 30 h -60 Z" fill={C.window} />
    <path d="M 40 -210 L 150 -210 Q 190 -200 200 -150 L 210 -50 L 40 -50 Z" fill="#E8E0C8" {...K} />
    <path d="M 70 -194 L 140 -194 Q 170 -186 176 -140 L 70 -140 Z" fill="#0B0F22" />
    {/* offene Tür */}
    <g transform={`translate(70 -50) skewY(${-10 * door}) scale(${1 - 0.55 * door} 1)`}>
      <rect x={0} y={-150} width={110} height={150} fill="#D8CFB2" {...K} />
    </g>
    <circle cx={-170} cy={-46} r={40} fill="#0A0D1C" {...K} />
    <circle cx={140} cy={-46} r={40} fill="#0A0D1C" {...K} />
    <rect x={-60} y={-290} width={60} height={34} rx={8} fill={C.fire} {...K} />
  </g>
);

/* ------------------------------ Kernkraftwerk ------------------------------ */

/** Abklingbecken im Schnitt (Mitte oben = Wasserlinie), Breite 760, Tiefe 640. */
export const FuelPool: React.FC<{ readonly x: number; readonly y: number; readonly frame: number; readonly ruler?: number }> = ({ x, y, frame, ruler = 1 }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <linearGradient id="pool-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3FA6F0" stopOpacity="0.9" />
        <stop offset="1" stopColor="#103A78" />
      </linearGradient>
    </defs>
    <rect x={-420} y={-40} width={840} height={720} fill="#3A4258" {...K} />
    <rect x={-380} y={0} width={760} height={640} fill="url(#pool-water)" />
    <path
      d={`M -380 0 ${Array.from({ length: 20 }, (_, i) => `L ${-380 + i * 40} ${Math.sin(frame * 0.15 + i) * 6}`).join(" ")} L 380 0`}
      stroke="#BFE6FF"
      strokeWidth={6}
      fill="none"
    />
    {/* Brennelement-Gestelle unten, blaues Glimmen */}
    {Array.from({ length: 8 }, (_, i) => (
      <g key={i}>
        <rect x={-320 + i * 80} y={470} width={56} height={170} fill="#1D2A44" {...K} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={-312 + i * 80 + k * 16} y={480} width={8} height={150} fill="#7FD4FF" opacity={0.55 + 0.25 * Math.sin(frame * 0.2 + i + k)} />
        ))}
      </g>
    ))}
    {/* Messlatte „20 FT“ */}
    <g opacity={ruler}>
      <path d="M 300 6 L 300 462" stroke={C.white} strokeWidth={8} />
      <path d="M 276 6 L 324 6 M 276 462 L 324 462" stroke={C.white} strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M 300 ${52 + i * 46} l 18 0`} stroke={C.white} strokeWidth={5} />
      ))}
    </g>
  </g>
);

/** Bürostuhl (Fußpunkt), `spin` in Grad (wirkt als Drehung um die Hochachse). */
export const Chair: React.FC<{ readonly x: number; readonly y: number; readonly spin: number; readonly s?: number }> = ({ x, y, spin, s = 1 }) => {
  const c = Math.cos((spin * Math.PI) / 180);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 -40 L 0 -110" stroke="#2A3050" strokeWidth={14} />
      <path d="M -70 0 L 70 0 M 0 -40 L -60 -6 M 0 -40 L 60 -6" stroke="#2A3050" strokeWidth={10} strokeLinecap="round" />
      <g transform={`scale(${Math.max(0.15, Math.abs(c))} 1)`}>
        <rect x={-80} y={-150} width={160} height={40} rx={14} fill={c > 0 ? "#3B4A80" : "#2B3766"} {...K} />
        <rect x={-66} y={-320} width={132} height={170} rx={30} fill={c > 0 ? "#3B4A80" : "#2B3766"} {...K} />
      </g>
    </g>
  );
};

/** Trockenbehälter (Fußpunkt) mit aufsteigenden Warmluft-Pfeilen. */
export const Cask: React.FC<{ readonly x: number; readonly y: number; readonly frame: number; readonly s?: number; readonly heat?: number }> = ({ x, y, frame, s = 1, heat = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-300} width={160} height={300} rx={26} fill="#8B93A8" {...K} />
    <rect x={-80} y={-300} width={160} height={46} rx={20} fill="#A3ABBF" {...K} />
    <rect x={-60} y={-60} width={120} height={14} fill="#5D6680" />
    {[0, 1, 2].map((i) => {
      const t = ((frame * 1.4 + i * 30) % 90) / 90;
      return (
        <path
          key={i}
          d={`M ${-40 + i * 40} ${-320 - t * 160} q 14 -24 0 -48 q -14 -24 0 -48`}
          stroke={C.fire}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          opacity={heat * (1 - t) * 0.9}
        />
      );
    })}
  </g>
);

/* ------------------------------ Weltraum ------------------------------ */

/** Satellit (Mitte), Spannweite ≈ 200. */
export const Satellite: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly warn?: number; readonly frame?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  warn = 0,
  frame = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {warn > 0 ? (
      <circle r={90 + 20 * Math.sin(frame * 0.5)} fill="none" stroke={C.danger} strokeWidth={8} opacity={warn} />
    ) : null}
    <rect x={-100} y={-20} width={64} height={40} fill="#3E6FD8" {...K} />
    <rect x={36} y={-20} width={64} height={40} fill="#3E6FD8" {...K} />
    <path d="M -68 -20 v 40 M 68 -20 v 40" stroke={C.ink} strokeWidth={3} />
    <rect x={-32} y={-30} width={64} height={60} rx={8} fill={C.white} {...K} />
    <circle cx={0} cy={0} r={10} fill={C.gold} />
  </g>
);

/** Weltraumteleskop (Mitte), Länge ≈ 360. `face` = besorgtes Gesicht (Swift). */
export const Telescope: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly face?: boolean; readonly shine?: number; readonly frame?: number }> = ({
  x,
  y,
  s = 1,
  r = 0,
  face = false,
  shine = 0,
  frame = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-60} y={-150} width={50} height={300} fill="#3E6FD8" {...K} />
    <path d="M -60 -50 h 50 M -60 50 h 50" stroke={C.ink} strokeWidth={3} />
    <rect x={-180} y={-70} width={340} height={140} rx={30} fill="#C9D0DE" {...K} />
    <rect x={-180} y={-70} width={90} height={140} rx={24} fill="#AEB6C8" {...K} />
    <ellipse cx={160} cy={0} rx={18} ry={70} fill="#2B3350" {...K} />
    {shine > 0 ? <path d={`M ${-120 + (frame * 12) % 300} -60 l 40 0 l -60 120 l -40 0 Z`} fill={C.white} opacity={0.5 * shine} /> : null}
    {face ? (
      <g>
        <ellipse cx={-10} cy={-14} rx={12} ry={16} fill={C.ink} />
        <ellipse cx={40} cy={-14} rx={12} ry={16} fill={C.ink} />
        <path d="M -24 -40 L 0 -30 M 54 -40 L 30 -30" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M 0 30 Q 15 18 30 30" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M 70 -40 q 8 14 0 22 q -8 -8 0 -22" fill="#7FD4FF" />
      </g>
    ) : null}
  </g>
);

/** Feuerschweif hinter einem Objekt (Richtung nach oben-links), `o` 0..1. */
export const FireTrail: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly frame: number; readonly len?: number; readonly r?: number }> = ({ x, y, o, frame, len = 420, r = -35 }) => {
  if (o <= 0) return null;
  const flick = 1 + 0.08 * Math.sin(frame * 1.3);
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${flick} 1)`} opacity={o}>
      <path d={`M 0 -60 Q ${-len * 0.5} -40 ${-len} 0 Q ${-len * 0.5} 40 0 60 Z`} fill={C.fire} />
      <path d={`M 0 -34 Q ${-len * 0.4} -20 ${-len * 0.7} 0 Q ${-len * 0.4} 20 0 34 Z`} fill={C.window} />
    </g>
  );
};

/** Voyager (Mitte): große Schüssel, Ausleger, goldene Platte (`glint` 0..1). */
export const Voyager: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly glint?: number }> = ({ x, y, s = 1, r = 0, glint = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 0 40 L -230 120 M 0 40 L 200 160 M 0 0 L 0 -40" stroke={C.steel} strokeWidth={7} />
    <circle cx={-230} cy={120} r={16} fill={C.steelDark} {...K} />
    <rect x={-60} y={20} width={120} height={60} fill="#5D6680" {...K} />
    <path d="M -170 -10 Q 0 -150 170 -10 Q 0 30 -170 -10 Z" fill={C.white} {...K} />
    <path d="M 0 -40 L 0 -96" stroke={C.ink} strokeWidth={6} />
    <circle cx={30} cy={50} r={26} fill={C.gold} {...K} />
    <circle cx={30} cy={50} r={8} fill="#8A6A1E" />
    {glint > 0 ? (
      <g transform="translate(42 38)" opacity={glint}>
        <path d="M 0 -50 L 8 -8 L 50 0 L 8 8 L 0 50 L -8 8 L -50 0 L -8 -8 Z" fill={C.white} />
      </g>
    ) : null}
  </g>
);

/* ------------------------------ Brücke, Flasche ------------------------------ */

/**
 * Hängebrücke (rot, stilisiert) – Fußpunkt Mitte auf Wasserhöhe, Breite ≈ 1600.
 * `rust` 0..1 lässt Rostflecken wachsen.
 */
export const Bridge: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly rust?: number }> = ({ x, y, s = 1, rust = 0 }) => {
  const tower = (tx: number) => (
    <g transform={`translate(${tx} 0)`}>
      <path d="M -50 0 L -40 -760 L 40 -760 L 50 0 Z" fill={C.bridge} {...K} />
      {[-600, -420, -240].map((ty) => (
        <rect key={ty} x={-26} y={ty} width={52} height={110} rx={6} fill="#5A1410" />
      ))}
      {RUST_SPOTS.map(([rx, ry, rr], i) => (
        <circle key={i} cx={rx} cy={ry} r={rr * Math.max(0, rust * 1.4 - i * 0.06)} fill={C.rust} opacity={0.9} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -900 -330 Q -660 -330 -400 -740 Q 0 -260 400 -740 Q 660 -330 900 -330" stroke={C.bridge} strokeWidth={12} fill="none" />
      {Array.from({ length: 31 }, (_, i) => {
        const px = -750 + i * 50;
        const t = (px + 400) / 800;
        const cy = px < -400 || px > 400 ? -330 - 410 * (1 - Math.abs(Math.abs(px) - 400) / 500) : -740 + 480 * Math.sin(Math.PI * t);
        return <path key={i} d={`M ${px} ${cy} L ${px} -320`} stroke={C.bridge} strokeWidth={4} />;
      })}
      {tower(-400)}
      {tower(400)}
      <rect x={-1000} y={-330} width={2000} height={44} fill={C.bridge} {...K} />
      <rect x={-1000} y={-286} width={2000} height={16} fill="#5A1410" />
    </g>
  );
};
const RUST_SPOTS: [number, number, number][] = [
  [-20, -520, 30], [24, -300, 26], [-10, -120, 36], [30, -680, 18], [-30, -400, 20], [10, -40, 28], [-36, -620, 14], [34, -180, 22],
];

/** Farbeimer + Roller (Fußpunkt), verlassen. */
export const PaintKit: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -80 L 40 -80 L 32 0 L -32 0 Z" fill="#D8DDE8" {...K} />
    <path d="M -40 -80 Q 0 -130 40 -80" stroke={C.ink} strokeWidth={5} fill="none" />
    <rect x={-40} y={-82} width={80} height={14} fill={C.bridge} />
    <g transform="translate(60 -10) rotate(-30)">
      <rect x={-8} y={-110} width={16} height={100} fill="#6B4A2A" {...K} />
      <rect x={-40} y={-140} width={80} height={36} rx={14} fill={C.bridge} {...K} />
    </g>
  </g>
);

/** Plastikflasche (Mitte), `crack` 0..1 zeichnet einen Haarriss. */
export const Bottle: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly crack?: number }> = ({ x, y, s = 1, r = 0, crack = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -16 -120 L 16 -120 L 18 -96 Q 46 -70 46 -30 L 46 100 Q 46 120 26 120 L -26 120 Q -46 120 -46 100 L -46 -30 Q -46 -70 -18 -96 Z" fill="#BFE6FF" fillOpacity={0.55} {...K} />
    <rect x={-20} y={-140} width={40} height={24} rx={4} fill="#3E6FD8" {...K} />
    <rect x={-46} y={-10} width={92} height={50} fill="#4FC3F7" opacity={0.7} />
    <path d="M -30 -50 Q -36 20 -30 90" stroke={C.white} strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
    {crack > 0 ? (
      <path
        d="M 46 0 L 20 14 L 30 34 L 4 52 L 14 70 L -10 86"
        stroke={C.ink}
        strokeWidth={5}
        fill="none"
        strokeDasharray={200}
        strokeDashoffset={200 * (1 - crack)}
        strokeLinecap="round"
      />
    ) : null}
  </g>
);

/* ------------------------------ Natur ------------------------------ */

/** Baum (Fußpunkt), `grow` 0..1. */
export const Tree: React.FC<{ readonly x: number; readonly y: number; readonly grow: number; readonly s?: number; readonly color?: string }> = ({ x, y, grow, s = 1, color = C.natureLight }) => {
  if (grow <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * grow})`}>
      <path d="M -10 0 L -6 -160 L 6 -160 L 10 0 Z" fill="#3A2A1E" {...K} />
      <circle cx={0} cy={-200} r={80} fill={color} {...K} />
      <circle cx={-60} cy={-150} r={54} fill={color} {...K} />
      <circle cx={60} cy={-150} r={54} fill={color} {...K} />
    </g>
  );
};

/** Grasbüschel/Unkraut durch Pflaster (Fußpunkt), `grow` 0..1. */
export const Weeds: React.FC<{ readonly x: number; readonly y: number; readonly grow: number; readonly s?: number }> = ({ x, y, grow, s = 1 }) => {
  if (grow <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${s * grow})`}>
      <path d="M -30 0 Q -34 -50 -50 -80 Q -20 -50 -10 0 Z M -6 0 Q 0 -70 -4 -110 Q 16 -60 12 0 Z M 14 0 Q 30 -40 52 -70 Q 34 -30 30 0 Z" fill={C.natureLight} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

/** Reh als Silhouette (Fußpunkt). */
export const Deer: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly step?: number; readonly color?: string }> = ({ x, y, s = 1, step = 0, color = "#0E241E" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -70 0 L ${-64 + step * 10} -90 M -40 0 L ${-46 - step * 10} -90 M 50 0 L ${44 + step * 10} -90 M 76 0 L ${70 - step * 10} -90`} stroke={color} strokeWidth={12} strokeLinecap="round" />
    <path d="M -84 -86 Q -80 -140 0 -140 Q 70 -142 90 -110 L 100 -84 Q 0 -70 -84 -86 Z" fill={color} />
    <path d="M 76 -120 L 110 -210 L 140 -206 L 112 -112 Z" fill={color} />
    <path d="M 118 -204 L 108 -260 M 112 -236 L 90 -256 M 130 -206 L 150 -258 M 142 -236 L 166 -248" stroke={color} strokeWidth={7} strokeLinecap="round" />
  </g>
);

/** Fuchs (Fußpunkt), schaut nach links; `look` 0..1 dreht den Kopf zum Betrachter. */
export const Fox: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly look?: number }> = ({ x, y, s = 1, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 60 -40 Q 150 -60 170 -120 Q 130 -40 70 -20 Z" fill="#E07A2E" {...K} />
    <path d="M 168 -118 Q 176 -100 160 -92 Q 150 -110 168 -118 Z" fill={C.white} />
    <path d="M -60 -30 Q -60 -90 0 -90 Q 70 -90 70 -30 L 70 0 L -60 0 Z" fill="#E07A2E" {...K} />
    <g transform={`translate(-60 -100) rotate(${-10 + look * 18})`}>
      <path d="M -50 0 L 10 -40 L 40 10 L 0 40 Z" fill="#E07A2E" {...K} />
      <path d="M 0 -30 L 6 -70 L 26 -26 Z M -24 -16 L -40 -54 L -6 -30 Z" fill="#E07A2E" {...K} />
      <path d="M -50 0 L -20 20 L 0 40 Z" fill={C.white} />
      <path d={look > 0.5 ? "M -2 -6 l 14 0" : "M -14 -10 l 12 4"} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    </g>
  </g>
);

/** Parkbank (Fußpunkt Mitte), Breite 340. */
export const Bench: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-90} width={340} height={24} rx={6} fill="#5A4030" {...K} />
    <rect x={-170} y={-170} width={340} height={22} rx={6} fill="#5A4030" {...K} />
    <rect x={-170} y={-136} width={340} height={22} rx={6} fill="#5A4030" {...K} />
    <path d="M -140 -66 L -140 0 M 140 -66 L 140 0" stroke="#2A2A2A" strokeWidth={14} />
  </g>
);

/* ------------------------------ Fels, Mond ------------------------------ */

/**
 * Granitfelsen mit vier angedeuteten Köpfen (abstrakt, keine Porträts) – Fußpunkt Mitte, Breite ≈ 900.
 */
export const StoneHeads: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -520 0 L -470 -420 Q -420 -620 -200 -660 Q 0 -720 220 -650 Q 450 -600 500 -380 L 540 0 Z" fill="#8C8F98" {...K} />
    {[-300, -110, 80, 270].map((hx, i) => (
      <g key={hx} transform={`translate(${hx} ${-400 + (i % 2) * 30})`}>
        <ellipse rx={88} ry={130} fill="#A7AAB3" stroke="#6E717A" strokeWidth={6} />
        <path d="M -50 -30 Q 0 -44 50 -30" stroke="#6E717A" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 0 -20 L 6 30" stroke="#6E717A" strokeWidth={7} strokeLinecap="round" />
        <path d="M -30 70 Q 0 80 30 70" stroke="#6E717A" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    ))}
    <path d="M -520 0 L -500 -160 L -380 -120 L -300 -200 L -200 -110 L 0 -170 L 160 -100 L 320 -190 L 520 -120 L 540 0 Z" fill="#6E717A" />
  </g>
);

/** Lineal mit Beschriftung (Mitte links), Länge in px. */
export const Ruler: React.FC<{ readonly x: number; readonly y: number; readonly len: number; readonly label: string; readonly o?: number; readonly vertical?: boolean; readonly color?: string }> = ({
  x,
  y,
  len,
  label,
  o = 1,
  vertical = false,
  color = C.scarf,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${vertical ? -90 : 0})`} opacity={o}>
    <rect x={0} y={-22} width={len} height={44} rx={6} fill={color} {...K} />
    {Array.from({ length: Math.max(2, Math.floor(len / 30)) }, (_, i) => (
      <path key={i} d={`M ${12 + i * 30} -22 l 0 ${i % 2 ? 14 : 22}`} stroke={C.ink} strokeWidth={4} />
    ))}
    <g transform={vertical ? `translate(${len / 2} -48) rotate(90)` : `translate(${len / 2} -48)`}>
      <Label x={0} y={0} size={46}>
        {label}
      </Label>
    </g>
  </g>
);

/** Mondboden (Oberkante y0) mit Kratern, über die ganze Breite x0..x0+w. */
export const MoonGround: React.FC<{ readonly y0: number; readonly x0?: number; readonly w?: number }> = ({ y0, x0 = -800, w = 2700 }) => (
  <g>
    <path d={`M ${x0} ${y0} Q ${x0 + w * 0.3} ${y0 - 40} ${x0 + w * 0.5} ${y0 + 10} Q ${x0 + w * 0.75} ${y0 + 50} ${x0 + w} ${y0} L ${x0 + w} ${y0 + 1400} L ${x0} ${y0 + 1400} Z`} fill={C.moonDark} />
    {[
      [200, 120, 90], [700, 260, 60], [-200, 300, 120], [1100, 140, 70], [450, 480, 110], [900, 560, 50], [-100, 640, 70],
    ].map(([cx, cy, r], i) => (
      <g key={i}>
        <ellipse cx={cx} cy={y0 + cy} rx={r} ry={r * 0.32} fill="#6E7689" />
        <ellipse cx={cx} cy={y0 + cy + r * 0.06} rx={r * 0.8} ry={r * 0.22} fill="#5C6478" />
      </g>
    ))}
  </g>
);

/** Spur aus Stiefelabdrücken von (x0,y0) nach (x1,y1); `reveal` 0..1. */
export const Footprints: React.FC<{ readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number; readonly reveal: number; readonly n?: number }> = ({
  x0,
  y0,
  x1,
  y1,
  reveal,
  n = 14,
}) => {
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        if (i / n > reveal) return null;
        const t = i / (n - 1);
        const side = i % 2 ? 1 : -1;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;
        const sc = 0.6 + 0.6 * t;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${ang}) translate(0 ${side * 16 * sc}) scale(${sc})`}>
            <rect x={-22} y={-10} width={44} height={20} rx={9} fill="#4A5163" />
            {[-12, -4, 4, 12].map((k) => (
              <path key={k} d={`M ${k} -8 l 0 16`} stroke="#3A4052" strokeWidth={3} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Flagge + langer Schatten (Fußpunkt), `shadow` 0..1 zieht den Schatten auf. */
export const FlagShadow: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly shadow: number }> = ({ x, y, s = 1, shadow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g opacity={0.85}>
      <path d={`M 0 0 L ${520 * shadow} ${60 * shadow}`} stroke="#262B38" strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${400 * shadow} ${46 * shadow} L ${520 * shadow} ${60 * shadow} L ${520 * shadow} ${130 * shadow} L ${400 * shadow} ${116 * shadow} Z`} fill="#262B38" />
    </g>
    <path d="M 0 0 L 0 -260" stroke={C.steel} strokeWidth={8} />
    <path d="M 0 -256 L 130 -256 L 130 -176 L 0 -176" stroke={C.steel} strokeWidth={5} fill={C.white} opacity={0.9} />
  </g>
);
