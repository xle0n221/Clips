import React, { useMemo } from "react";
import { PAPER, PaperDefs } from "./boxing";
import { FONT, seeded } from "./core";

/**
 * Paper-Cut-Bausteine „Käfigkampf / Fight-Poster“ (zuerst: UFC-Clip, scenes/ufc*.tsx).
 * Oktagon-Käfig (Boden, hintere Zaunhälfte, Kinder, vordere Zaunhälfte), Halle mit Rängen,
 * Geld-Infografik (Münzen, Scheck, Kreisdiagramm, Türme) und Requisiten. Keine Logos: Firmen- und
 * Sendungsnamen nur als schlichter Text in Montserrat. Alles reine Funktion von `f`.
 */

export const FIGHT = {
  red: "#E3262B",
  redDark: "#9E1418",
  gold: "#F2C14E",
  goldDark: "#B8862A",
  coin: "#E9B949",
  coinEdge: "#A87A1E",
  black: "#0E0E10",
  mat: "#D8D3C8",
  matShade: "#B9B3A6",
  mesh: "#C9CED6",
  paper: "#F1E7CF",
  paperOld: "#E3D2A6",
  blue: "#5B7FA8",
} as const;

/** Phasen der Halle (Color Script UFC): rot-schwarz → kühles Blau → Gold → kalt → dunkel. */
export type FightPhase = "red" | "cool" | "gold" | "cold" | "dim" | "office";
export const FIGHT_HALL: Record<FightPhase, { top: string; bottom: string; crowd: string; seat: string; light: string }> = {
  red: { top: "#140608", bottom: "#3A1012", crowd: "#0C0405", seat: "#2A0D10", light: "#FFE3C8" },
  cool: { top: "#0A1018", bottom: "#22303F", crowd: "#070B12", seat: "#18222E", light: "#D6E6FF" },
  gold: { top: "#1C1206", bottom: "#4E3410", crowd: "#130C04", seat: "#3A260C", light: "#FFE8B0" },
  cold: { top: "#06080C", bottom: "#141C26", crowd: "#040507", seat: "#0E141C", light: "#CFE0FF" },
  dim: { top: "#0B0909", bottom: "#221A18", crowd: "#060505", seat: "#181210", light: "#FFE0B8" },
  office: { top: "#1A1612", bottom: "#2C241C", crowd: "#100C09", seat: "#221A14", light: "#FFE0B8" },
};

const deg = (d: number) => (d * Math.PI) / 180;

/* ------------------------------------------------------------------ */
/* Halle                                                               */
/* ------------------------------------------------------------------ */

/**
 * Halle mit Rängen: Verlauf, Traversen-Lichter, Sitzreihen (y 700…1080) und Publikum.
 * `fill` 0..1 = Anteil besetzter Plätze (1993: halb leer), `flashes` = Blitzlichter.
 */
export const FightHall: React.FC<{
  readonly phase: FightPhase;
  readonly f: number;
  readonly fill?: number;
  readonly flashes?: number;
  readonly lights?: number;
  readonly noStands?: boolean;
}> = ({ phase, f, fill = 1, flashes = 0, lights = 1, noStands = false }) => {
  const h = FIGHT_HALL[phase];
  const seats = useMemo(() => {
    const r = seeded(31);
    return Array.from({ length: 6 * 30 }, (_, i) => ({ row: Math.floor(i / 30), col: i % 30, k: r(), j: r() }));
  }, []);
  const id = `fh-${phase}`;
  return (
    <g>
      <PaperDefs />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={h.top} />
          <stop offset="1" stopColor={h.bottom} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={h.light} stopOpacity="0.5" />
          <stop offset="1" stopColor={h.light} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-2500} y={-3000} width={6100} height={7000} fill={`url(#${id})`} />
      {/* Traverse mit Lichtern */}
      <rect x={-1500} y={196} width={4100} height={14} fill="#000" opacity={0.5} />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i} opacity={lights}>
          <circle cx={-760 + i * 200} cy={230} r={70} fill={`url(#${id}-glow)`} />
          <circle cx={-760 + i * 200} cy={230} r={15} fill={h.light} />
        </g>
      ))}
      {noStands
        ? null
        : seats.map((s, i) => {
            const y = 720 + s.row * 62;
            const x = -820 + s.col * 92 + (s.row % 2) * 46;
            const taken = s.k < fill;
            return (
              <g key={i}>
                <rect x={x - 36} y={y + 18} width={72} height={34} rx={8} fill={h.seat} opacity={0.9} />
                {taken ? (
                  <>
                    <circle cx={x + (s.j - 0.5) * 10} cy={y + Math.sin(f * 0.08 + s.j * 9) * 2} r={22} fill={h.crowd} />
                    <rect x={x - 28} y={y + 12} width={56} height={44} rx={16} fill={h.crowd} />
                    {flashes > 0 && Math.floor(f / 3 + s.j * 50) % 19 === 0 ? <circle cx={x + 10} cy={y - 8} r={13} fill="#FFFFFF" opacity={flashes} /> : null}
                  </>
                ) : null}
              </g>
            );
          })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Oktagon                                                             */
/* ------------------------------------------------------------------ */

export type OctGeom = { readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number; readonly h: number };
export const OCT: OctGeom = { cx: 540, cy: 1150, rx: 560, ry: 175, h: 340 };

const octPts = (g: OctGeom) => Array.from({ length: 8 }, (_, k) => [g.cx + g.rx * Math.cos(deg(22.5 + k * 45)), g.cy + g.ry * Math.sin(deg(22.5 + k * 45))] as const);

/** Muster: Maschendraht (Rauten). Einmal je Bühne im Oktagon enthalten. */
const MeshDefs: React.FC<{ readonly color: string }> = ({ color }) => (
  <defs>
    <pattern id="cage-mesh" width={30} height={30} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M 0 0 L 30 0 M 0 0 L 0 30" stroke={color} strokeWidth={3} fill="none" />
    </pattern>
  </defs>
);

/** Ein Zaunfeld (Viereck p→q, Höhe h) mit Gitter, oben Polster. */
const Panel: React.FC<{ readonly p: readonly [number, number]; readonly q: readonly [number, number]; readonly h: number; readonly meshO: number; readonly back: number; readonly lift: number }> = ({ p, q, h, meshO, back, lift }) => {
  const d = `M ${p[0]} ${p[1] - lift} L ${q[0]} ${q[1] - lift} L ${q[0]} ${q[1] - h - lift} L ${p[0]} ${p[1] - h - lift} Z`;
  return (
    <g>
      <path d={d} fill="#000" opacity={back} />
      <path d={d} fill="url(#cage-mesh)" opacity={meshO} />
      <line x1={p[0]} y1={p[1] - h - lift} x2={q[0]} y2={q[1] - h - lift} stroke={FIGHT.black} strokeWidth={22} strokeLinecap="round" />
      <line x1={p[0]} y1={p[1] - lift} x2={q[0]} y2={q[1] - lift} stroke={FIGHT.black} strokeWidth={16} strokeLinecap="round" />
    </g>
  );
};

const Post: React.FC<{ readonly p: readonly [number, number]; readonly h: number; readonly lift: number; readonly tilt?: number }> = ({ p, h, lift, tilt = 0 }) => (
  <g transform={`rotate(${tilt} ${p[0]} ${p[1] - lift})`}>
    <line x1={p[0]} y1={p[1] - lift + 6} x2={p[0]} y2={p[1] - h - lift - 14} stroke={PAPER.ink} strokeWidth={20} strokeLinecap="round" />
    <line x1={p[0]} y1={p[1] - lift + 6} x2={p[0]} y2={p[1] - h - lift - 14} stroke="#2C2E34" strokeWidth={12} strokeLinecap="round" />
  </g>
);

/**
 * Oktagon-Käfig in drei Lagen: Boden + hintere Zaunhälfte, `children` (Kämpfer), vordere Zaunhälfte.
 * `drop` 0..1 = Zaun senkt sich von oben ab (1 = steht), `battered` = alter, schiefer Käfig,
 * `frontO` = Deckkraft des vorderen Gitters (Figuren bleiben lesbar).
 */
export const Octagon: React.FC<{
  readonly g?: OctGeom;
  readonly drop?: number;
  readonly battered?: boolean;
  readonly frontO?: number;
  readonly mat?: string;
  readonly children?: React.ReactNode;
  readonly noFront?: boolean;
}> = ({ g = OCT, drop = 1, battered = false, frontO = 0.55, mat = FIGHT.mat, children, noFront = false }) => {
  const pts = octPts(g);
  const t = Math.min(1, Math.max(0, drop));
  const bounce = t < 1 ? 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2) : 1;
  const lift = (1 - bounce) * 1400;
  const floor = pts.map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1]}`).join(" ") + " Z";
  const big = octPts({ ...g, rx: g.rx + 50, ry: g.ry + 22 });
  const apron = big.map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1] + 12}`).join(" ") + " Z";
  // Segmente k→k+1; hinten = Mittelpunkt oberhalb der Bodenmitte
  const segs = pts.map((p, k) => ({ p, q: pts[(k + 1) % 8], back: (p[1] + pts[(k + 1) % 8][1]) / 2 < g.cy }));
  const meshColor = battered ? "#A88C6A" : FIGHT.mesh;
  return (
    <g>
      <MeshDefs color={meshColor} />
      <path d={apron} fill={FIGHT.black} />
      <path d={floor} fill={mat} stroke={PAPER.ink} strokeWidth={6} />
      <ellipse cx={g.cx} cy={g.cy} rx={g.rx * 0.42} ry={g.ry * 0.42} fill="none" stroke={battered ? "#8E7C66" : FIGHT.red} strokeWidth={10} opacity={0.75} />
      {battered ? (
        <>
          <path d={`M ${g.cx - 200} ${g.cy - 40} l 60 30 l -20 40`} stroke="#8E7C66" strokeWidth={6} fill="none" />
          <ellipse cx={g.cx + 180} cy={g.cy + 50} rx={70} ry={18} fill="#9C8A70" opacity={0.6} />
        </>
      ) : null}
      {segs.filter((s) => s.back).map((s, i) => (
        <Panel key={`b${i}`} p={s.p} q={s.q} h={g.h} meshO={0.85} back={0.25} lift={lift} />
      ))}
      {pts.filter((p) => p[1] <= g.cy + 1).map((p, i) => (
        <Post key={`pb${i}`} p={p} h={g.h} lift={lift} tilt={battered && i === 1 ? -7 : 0} />
      ))}
      {children}
      {noFront ? null : (
        <g opacity={frontO}>
          {segs.filter((s) => !s.back).map((s, i) => (
            <Panel key={`f${i}`} p={s.p} q={s.q} h={g.h} meshO={0.9} back={0} lift={lift} />
          ))}
        </g>
      )}
      {noFront ? null : pts.filter((p) => p[1] > g.cy + 1).map((p, i) => <Post key={`pf${i}`} p={p} h={g.h} lift={lift} tilt={battered && i === 2 ? 6 : 0} />)}
    </g>
  );
};

/** Vorhängeschloss (Mitte = Bügel unten). */
export const Padlock: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <path d="M -38 0 L -38 -46 Q -38 -92 0 -92 Q 38 -92 38 -46 L 38 0" stroke={PAPER.ink} strokeWidth={22} fill="none" />
    <path d="M -38 0 L -38 -46 Q -38 -92 0 -92 Q 38 -92 38 -46 L 38 0" stroke="#9AA3AE" strokeWidth={12} fill="none" />
    <rect x={-62} y={-8} width={124} height={104} rx={14} fill={FIGHT.red} stroke={PAPER.ink} strokeWidth={7} />
    <circle cx={0} cy={36} r={13} fill={PAPER.ink} />
    <rect x={-5} y={40} width={10} height={30} fill={PAPER.ink} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Papier + Text                                                       */
/* ------------------------------------------------------------------ */

/** Vergilbter Zeitungsausschnitt mit Schlagzeile (Mitte). */
export const Clipping: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly lines: readonly string[]; readonly o?: number }> = ({ x, y, s = 1, r = 0, lines, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)" opacity={o}>
    <path d="M -300 -190 L 290 -200 L 300 -60 L 286 60 L 300 200 L -294 196 L -306 70 L -296 -40 Z" fill={FIGHT.paperOld} stroke={PAPER.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-262} y={-168} width={524} height={12} fill="#8C7A55" />
    {lines.map((l, i) => (
      <text key={l} x={0} y={-82 + i * 92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(78, 780 / Math.max(1, l.length))} letterSpacing={1} fill={PAPER.ink}>
        {l}
      </text>
    ))}
    {[0, 1, 2].map((k) => (
      <g key={k}>
        <rect x={-262 + k * 180} y={110} width={160} height={10} fill="#A8946A" />
        <rect x={-262 + k * 180} y={134} width={150} height={10} fill="#A8946A" />
        <rect x={-262 + k * 180} y={158} width={120} height={10} fill="#A8946A" />
      </g>
    ))}
  </g>
);

/** Preisschild an Schnur (Drehpunkt = Schnur oben), Text in der Mitte. */
export const PriceTag: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly swing?: number; readonly text: string; readonly color?: string }> = ({ x, y, s = 1, swing = 0, text, color = FIGHT.paper }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
    <path d="M 0 0 Q 8 40 0 70" stroke={PAPER.ink} strokeWidth={5} fill="none" />
    <g filter="url(#paper)">
      <path d="M -70 110 L -40 70 L 40 70 L 70 110 L 70 250 L -70 250 Z" fill={color} stroke={PAPER.ink} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={0} cy={94} r={10} fill={PAPER.ink} />
      <text x={0} y={216} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={text.length > 2 ? 54 : 104} fill={PAPER.ink}>
        {text}
      </text>
    </g>
  </g>
);

/** Regelblatt: Titel, Zeilen (durchgestrichen / stehen bleibend), Stempel. Mitte. */
export const RuleSheet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  /** 0..1: Anteil der durchgestrichenen Zeilen */
  readonly cross?: number;
  readonly keep: readonly string[];
  /** Stempel je Text 0..1 (Einschlag) */
  readonly stamps?: readonly (readonly [string, number])[];
}> = ({ x, y, s = 1, r = 0, cross = 0, keep, stamps = [] }) => {
  const rows = 9;
  const keepAt = [3, 5, 7];
  let crossed = 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
      <rect x={-330} y={-420} width={660} height={840} rx={12} fill={FIGHT.paper} stroke={PAPER.ink} strokeWidth={8} />
      <text x={0} y={-326} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} letterSpacing={8} fill={PAPER.ink}>
        RULES
      </text>
      {Array.from({ length: rows }, (_, i) => {
        const ry = -260 + i * 72;
        const ki = keepAt.indexOf(i);
        if (ki >= 0 && keep[ki]) {
          return (
            <text key={i} x={-290} y={ry + 40} fontFamily={FONT} fontWeight={900} fontSize={44} fill={PAPER.ink}>
              {keep[ki]}
            </text>
          );
        }
        const n = rows - keepAt.length;
        const idx = crossed++;
        const c = Math.max(0, Math.min(1, cross * n - idx));
        const w = 420 + ((i * 53) % 160);
        return (
          <g key={i}>
            <rect x={-290} y={ry + 12} width={w} height={22} rx={8} fill="#B9AE96" />
            {c > 0 ? <line x1={-300} y1={ry + 23} x2={-300 + (w + 20) * c} y2={ry + 23 - 6 * c} stroke={FIGHT.red} strokeWidth={14} strokeLinecap="round" /> : null}
          </g>
        );
      })}
      {stamps.map(([t, k], i) => {
        if (k <= 0) return null;
        const sc = 1.7 - 0.7 * Math.min(1, k);
        return (
          <g key={t} transform={`translate(${i % 2 ? 60 : -40} ${-250 + i * 210}) rotate(${-10 + i * 7}) scale(${sc})`} opacity={Math.min(1, k * 1.6)}>
            <rect x={-280} y={-56} width={560} height={112} rx={12} fill={FIGHT.paper} fillOpacity={0.85} stroke={FIGHT.redDark} strokeWidth={10} />
            <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={t.length > 12 ? 52 : 64} letterSpacing={3} fill={FIGHT.redDark}>
              {t}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** Großer Scheck (Mitte). */
export const BigCheck: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly amount: string; readonly memo?: string; readonly color?: string }> = ({
  x,
  y,
  s = 1,
  r = 0,
  amount,
  memo = "",
  color = "#DDEBD3",
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <rect x={-380} y={-170} width={760} height={340} rx={14} fill={color} stroke={PAPER.ink} strokeWidth={8} />
    <rect x={-380} y={-170} width={760} height={44} rx={14} fill="#7FA77A" />
    <text x={-340} y={-60} fontFamily={FONT} fontWeight={900} fontSize={34} letterSpacing={4} fill="#4E6B4A">
      PAY TO THE ORDER OF
    </text>
    <rect x={-350} y={-6} width={700} height={110} rx={10} fill="#FFFFFF" stroke={PAPER.ink} strokeWidth={5} />
    <text x={0} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={amount.length > 9 ? 70 : 90} fill={PAPER.ink}>
      {amount}
    </text>
    {memo ? (
      <text x={-340} y={150} fontFamily={FONT} fontWeight={900} fontSize={30} letterSpacing={3} fill="#4E6B4A">
        {memo}
      </text>
    ) : null}
  </g>
);

/** Sprechblase (Mitte des Körpers, Zipfel nach unten links). `burst` 0..1 = zerplatzt in Splitter. */
export const Bubble: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lines: readonly string[]; readonly burst?: number }> = ({ x, y, s = 1, lines, burst = 0 }) => {
  if (burst >= 1) return null;
  if (burst > 0) {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - burst}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = deg(i * 40 + 10);
          const d = 60 + burst * 380;
          return <path key={i} d="M -40 -30 L 46 -24 L 20 40 Z" fill="#FFFFFF" stroke={PAPER.ink} strokeWidth={6} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d}) rotate(${i * 50 + burst * 200})`} />;
        })}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
      <path d="M -270 -120 Q -280 -200 -180 -205 L 180 -205 Q 280 -200 270 -120 L 270 40 Q 270 110 180 110 L -60 110 L -150 190 L -130 110 L -180 110 Q -280 110 -270 40 Z" fill="#FFFFFF" stroke={PAPER.ink} strokeWidth={9} strokeLinejoin="round" />
      {lines.map((l, i) => (
        <text key={l} x={0} y={-60 + i * 96 - (lines.length - 1) * 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={88} letterSpacing={2} fill={PAPER.ink}>
          {l}
        </text>
      ))}
    </g>
  );
};

/** Schild mit schlichtem Text (Firmen-/Sendungsname nur als neutrale Schrift, kein Logo). */
export const TextBlock: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly text: string;
  readonly fill?: string;
  readonly fg?: string;
  readonly size?: number;
  readonly r?: number;
  readonly o?: number;
}> = ({ x, y, w, h, text, fill = "#2B2E36", fg = "#F4F1EA", size = 110, r = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} filter="url(#paper)" opacity={o}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={fill} stroke={PAPER.ink} strokeWidth={8} />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={4} fill={fg}>
      {text}
    </text>
  </g>
);

/** Leuchtschrift (Neon) über dem TV-Studio: Text mit Glühen, `on` 0..1. */
export const NeonSign: React.FC<{ readonly x: number; readonly y: number; readonly lines: readonly string[]; readonly on: number; readonly color?: string; readonly size?: number }> = ({
  x,
  y,
  lines,
  on,
  color = "#FF6B6B",
  size = 76,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-470} y={-size * 1.1} width={940} height={lines.length * size * 1.15 + size * 0.6} rx={18} fill="#140A0C" stroke={PAPER.ink} strokeWidth={8} />
    {lines.map((l, i) => (
      <g key={l}>
        <text x={0} y={i * size * 1.15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={6} fill="none" stroke={color} strokeWidth={14} opacity={0.35 * on}>
          {l}
        </text>
        <text x={0} y={i * size * 1.15} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={6} fill={on > 0.5 ? "#FFE3E3" : "#4A2A2E"}>
          {l}
        </text>
      </g>
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/* Geld                                                                */
/* ------------------------------------------------------------------ */

/** Münzstapel, Fußpunkt (x, y), `n` Münzen, Münzbreite w. */
export const CoinStack: React.FC<{ readonly x: number; readonly y: number; readonly n: number; readonly w?: number }> = ({ x, y, n, w = 120 }) => {
  const th = w * 0.16;
  const c = Math.max(0, Math.floor(n));
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#paperSoft)">
      {c > 0 ? <rect x={-w / 2} y={-c * th} width={w} height={c * th} fill={FIGHT.coinEdge} stroke={PAPER.ink} strokeWidth={5} /> : null}
      {c > 1
        ? Array.from({ length: Math.min(c, 80) }, (_, i) => (
            <line key={i} x1={-w / 2} y1={-(i * c) / Math.min(c, 80) * th} x2={w / 2} y2={-(i * c) / Math.min(c, 80) * th} stroke="#7C5810" strokeWidth={2} />
          ))
        : null}
      <ellipse cx={0} cy={-c * th} rx={w / 2} ry={w * 0.16} fill={FIGHT.coin} stroke={PAPER.ink} strokeWidth={5} />
    </g>
  );
};

/** Berg aus Goldmünzen, Fußpunkt Mitte, Höhe h (wächst). */
export const CoinPile: React.FC<{ readonly x: number; readonly y: number; readonly h: number; readonly w?: number }> = ({ x, y, h, w = 520 }) => {
  const coins = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 120 }, () => ({ u: r() * 2 - 1, v: r(), k: r() }));
  }, []);
  if (h <= 2) return null;
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#paper)">
      <path d={`M ${-w / 2} 0 Q ${-w * 0.22} ${-h * 0.95} 0 ${-h} Q ${w * 0.22} ${-h * 0.95} ${w / 2} 0 Z`} fill={FIGHT.goldDark} stroke={PAPER.ink} strokeWidth={7} />
      {coins.map((c, i) => {
        const yy = -c.v * h * 0.92;
        const half = (w / 2) * (1 - Math.pow(c.v, 1.6)) * 0.9;
        return <ellipse key={i} cx={c.u * half} cy={yy} rx={22} ry={9} fill={c.k > 0.5 ? FIGHT.coin : FIGHT.gold} stroke={PAPER.ink} strokeWidth={3} />;
      })}
    </g>
  );
};

/** Goldturm (Skyline-Hochhaus aus Münzen), Fußpunkt Mitte, Höhe h, Breite w, optional Schrift. */
export const GoldTower: React.FC<{ readonly x: number; readonly y: number; readonly h: number; readonly w?: number; readonly label?: string; readonly labelSize?: number; readonly color?: string }> = ({
  x,
  y,
  h,
  w = 200,
  label,
  labelSize = 90,
  color = FIGHT.gold,
}) => {
  if (h <= 2) return null;
  const rows = Math.floor(h / 70);
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#paper)">
      <rect x={-w / 2} y={-h} width={w} height={h} fill={color} stroke={PAPER.ink} strokeWidth={7} />
      <path d={`M ${-w / 2} ${-h} L 0 ${-h - w * 0.35} L ${w / 2} ${-h} Z`} fill={FIGHT.goldDark} stroke={PAPER.ink} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: rows }, (_, r) =>
        [-1, 0, 1].map((c) => <rect key={`${r}${c}`} x={c * w * 0.3 - w * 0.09} y={-h + 40 + r * 70} width={w * 0.18} height={34} fill="#7A5410" opacity={0.55} />),
      )}
      {label ? (
        <text x={0} y={-h * 0.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={labelSize} fill={PAPER.ink} transform={`rotate(-90 0 ${-h * 0.5})`} letterSpacing={6}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** Geldkoffer (Mitte unten = Fußpunkt). `open` 0..1 Deckel, `cash` 0..1 Füllung. */
export const Suitcase: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly open?: number; readonly cash?: number }> = ({ x, y, s = 1, open = 0, cash = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    {open > 0 ? (
      <g transform={`translate(0 -150) scale(1 ${-Math.max(0.05, open)})`}>
        <rect x={-170} y={-140} width={340} height={140} rx={16} fill="#3A2C22" stroke={PAPER.ink} strokeWidth={7} />
      </g>
    ) : null}
    <rect x={-170} y={-150} width={340} height={150} rx={16} fill="#4A382A" stroke={PAPER.ink} strokeWidth={7} />
    {open > 0 && cash > 0
      ? Array.from({ length: Math.ceil(cash * 5) }, (_, i) => <rect key={i} x={-150 + i * 60} y={-176} width={54} height={40} rx={4} fill="#86B47E" stroke={PAPER.ink} strokeWidth={4} />)
      : null}
    {open <= 0 ? <path d="M -50 -150 L -50 -186 L 50 -186 L 50 -150" stroke={PAPER.ink} strokeWidth={14} fill="none" /> : null}
    <rect x={-20} y={-96} width={40} height={24} rx={4} fill={FIGHT.gold} stroke={PAPER.ink} strokeWidth={4} />
  </g>
);

/** Einzelne Münze (Mitte), `flip` −1..1 Drehung um die Hochachse. */
export const Coin: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly flip?: number }> = ({ x, y, s = 1, flip = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * Math.max(0.15, Math.abs(flip))} ${s})`}>
    <circle r={30} fill={FIGHT.coin} stroke={PAPER.ink} strokeWidth={5} />
    <circle r={19} fill="none" stroke={FIGHT.coinEdge} strokeWidth={4} />
  </g>
);

/** Kreisdiagramm (Mitte), `frac` Anteil (rot) wächst mit `t` 0..1. */
export const Pie: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly frac: number; readonly t: number; readonly color?: string; readonly rest?: string }> = ({
  x,
  y,
  r,
  frac,
  t,
  color = FIGHT.red,
  rest = FIGHT.gold,
}) => {
  const a = Math.max(0.001, frac * t) * Math.PI * 2;
  const px = Math.sin(a) * r;
  const py = -Math.cos(a) * r;
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#paper)">
      <circle r={r} fill={rest} stroke={PAPER.ink} strokeWidth={8} />
      <path d={`M 0 0 L 0 ${-r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${px} ${py} Z`} fill={color} stroke={PAPER.ink} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

/** Basketball-Symbol (Mitte). */
export const Basketball: React.FC<{ readonly x: number; readonly y: number; readonly r?: number }> = ({ x, y, r = 50 }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#paperSoft)">
    <circle r={r} fill="#E07A2E" stroke={PAPER.ink} strokeWidth={6} />
    <line x1={-r} y1={0} x2={r} y2={0} stroke={PAPER.ink} strokeWidth={5} />
    <line x1={0} y1={-r} x2={0} y2={r} stroke={PAPER.ink} strokeWidth={5} />
    <path d={`M ${-r * 0.7} ${-r * 0.7} Q ${-r * 0.25} 0 ${-r * 0.7} ${r * 0.7}`} stroke={PAPER.ink} strokeWidth={5} fill="none" />
    <path d={`M ${r * 0.7} ${-r * 0.7} Q ${r * 0.25} 0 ${r * 0.7} ${r * 0.7}`} stroke={PAPER.ink} strokeWidth={5} fill="none" />
  </g>
);

/** Fallende Kurve auf einer Tafel (Mitte), `t` 0..1 zeichnet die Linie. */
export const Chart: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number; readonly up?: boolean }> = ({ x, y, s = 1, t, up = false }) => {
  const pts = up ? [[-200, 120], [-120, 90], [-40, 100], [40, 20], [120, -40], [200, -130]] : [[-200, -120], [-120, -60], [-40, -90], [40, 10], [120, 60], [200, 150]];
  const n = Math.max(2, Math.ceil(t * pts.length));
  const d = pts.slice(0, n).map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1]}`).join(" ");
  const last = pts[n - 1];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
      <rect x={-250} y={-190} width={500} height={380} rx={12} fill="#F3EEE2" stroke={PAPER.ink} strokeWidth={7} />
      <line x1={-210} y1={-160} x2={-210} y2={160} stroke="#B5AE9F" strokeWidth={4} />
      <line x1={-210} y1={160} x2={220} y2={160} stroke="#B5AE9F" strokeWidth={4} />
      <path d={d} stroke={up ? "#2E8B57" : FIGHT.red} strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={14} fill={up ? "#2E8B57" : FIGHT.red} stroke={PAPER.ink} strokeWidth={4} />
    </g>
  );
};

/** Mahnung (rotes Papier, Mitte). */
export const Bill2: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-110} y={-70} width={220} height={140} rx={6} fill="#F6D6D2" stroke={PAPER.ink} strokeWidth={5} />
    <rect x={-110} y={-70} width={220} height={36} rx={6} fill={FIGHT.red} />
    <text x={0} y={-42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} letterSpacing={3} fill="#FFFFFF">
      PAST DUE
    </text>
    {[0, 1, 2].map((k) => (
      <rect key={k} x={-90} y={-14 + k * 26} width={k === 2 ? 110 : 170} height={10} rx={5} fill="#C9A6A2" />
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/* Orte + Geräte                                                       */
/* ------------------------------------------------------------------ */

/** Alter Röhrenfernseher mit Antenne (Fußpunkt Mitte unten), Bildschirm-Inhalt `screen` (lokal −150..150 × −110..110). */
export const RetroTV: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly screen?: React.ReactNode; readonly glow?: string }> = ({
  x,
  y,
  s = 1,
  f,
  screen,
  glow = "#9FC3E8",
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g filter="url(#paper)">
      <line x1={-30} y1={-330} x2={-120} y2={-470} stroke={PAPER.ink} strokeWidth={8} />
      <line x1={30} y1={-330} x2={130} y2={-460} stroke={PAPER.ink} strokeWidth={8} />
      <rect x={-230} y={-340} width={460} height={340} rx={36} fill="#6A4A30" stroke={PAPER.ink} strokeWidth={8} />
      <rect x={-200} y={-310} width={330} height={260} rx={40} fill="#0E1418" stroke={PAPER.ink} strokeWidth={6} />
      {[0, 1].map((k) => (
        <circle key={k} cx={180} cy={-260 + k * 80} r={20} fill="#2E2218" stroke={PAPER.ink} strokeWidth={5} />
      ))}
    </g>
    <g transform="translate(-35 -180)">
      <clipPath id="tv-screen">
        <rect x={-150} y={-110} width={300} height={220} rx={34} />
      </clipPath>
      <g clipPath="url(#tv-screen)">
        <rect x={-150} y={-110} width={300} height={220} fill={glow} opacity={0.35} />
        {screen}
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={-150} y={-110 + i * 10} width={300} height={3} fill="#000" opacity={0.18 + 0.1 * Math.sin(f * 0.7 + i)} />
        ))}
      </g>
    </g>
  </g>
);

/** VHS-Kassette (Mitte). */
export const VHS: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paper)">
    <rect x={-120} y={-70} width={240} height={140} rx={10} fill="#1E1E22" stroke={PAPER.ink} strokeWidth={6} />
    <rect x={-90} y={-50} width={180} height={50} rx={6} fill="#F1E7CF" />
    {[-50, 50].map((cx) => (
      <circle key={cx} cx={cx} cy={30} r={22} fill="#3A3A40" stroke="#000" strokeWidth={4} />
    ))}
  </g>
);

/** Briefumschlag (Mitte). */
export const Envelope: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-70} y={-46} width={140} height={92} rx={6} fill="#F4EEDD" stroke={PAPER.ink} strokeWidth={5} />
    <path d="M -70 -46 L 0 10 L 70 -46" fill="none" stroke={PAPER.ink} strokeWidth={5} strokeLinejoin="round" />
    <rect x={30} y={-36} width={26} height={30} fill={FIGHT.red} />
  </g>
);

/** USA-Umriss (stark vereinfacht, kein exakter Grenzverlauf), Breite ≈ 1000 bei s = 1, Mitte. */
const US_PATH =
  "M -480 -190 L -330 -205 L -120 -190 L 80 -185 L 170 -150 L 230 -175 L 300 -150 L 360 -205 L 430 -230 L 470 -190 L 420 -130 L 400 -60 L 330 10 L 300 80 L 250 120 L 280 230 L 240 250 L 190 160 L 120 140 L 30 150 L -40 200 L -110 160 L -160 120 L -250 100 L -330 60 L -420 20 L -470 -60 Z";
/**
 * USA als Muster-Karte: Fliesen-Raster im Umriss, `red` 0..1 färbt nacheinander bis zu `max` Fliesen rot
 * (Reihenfolge zufällig, Gesamtzahl der Fliesen ≈ 50 – Anzahl/Lage NICHT als echte Staatenliste lesen).
 */
export const USMap: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly red: number; readonly max?: number; readonly f: number }> = ({ x, y, s = 1, red, max = 36, f }) => {
  const tiles = useMemo(() => {
    const out: { x: number; y: number; k: number }[] = [];
    const r = seeded(19);
    for (let row = 0; row < 6; row++) for (let col = 0; col < 10; col++) out.push({ x: -470 + col * 96, y: -230 + row * 80, k: r() });
    return out;
  }, []);
  const order = useMemo(() => [...tiles.keys()].sort((a, b) => tiles[a].k - tiles[b].k), [tiles]);
  const nRed = Math.round(red * max);
  const redSet = new Set(order.slice(0, nRed));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id="us-clip">
          <path d={US_PATH} />
        </clipPath>
      </defs>
      <g filter="url(#paper)">
        <path d={US_PATH} fill="#C8CFD8" stroke={PAPER.ink} strokeWidth={8} strokeLinejoin="round" />
      </g>
      <g clipPath="url(#us-clip)">
        {tiles.map((t, i) => {
          const isRed = redSet.has(i);
          const age = isRed ? order.indexOf(i) : 0;
          const pulse = isRed && age === nRed - 1 ? 0.15 * Math.sin(f * 0.6) : 0;
          return <rect key={i} x={t.x} y={t.y} width={92} height={76} fill={isRed ? FIGHT.red : "#AEB7C2"} opacity={0.92 + pulse} stroke="#7C8794" strokeWidth={4} />;
        })}
      </g>
      <path d={US_PATH} fill="none" stroke={PAPER.ink} strokeWidth={8} strokeLinejoin="round" />
    </g>
  );
};

/** Rundenuhr (LED, Mitte). */
export const RoundClock: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly text: string; readonly o?: number }> = ({ x, y, s = 1, text, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)" opacity={o}>
    <rect x={-170} y={-80} width={340} height={160} rx={18} fill="#101012" stroke={PAPER.ink} strokeWidth={8} />
    <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={112} letterSpacing={4} fill="#FF4A3D">
      {text}
    </text>
  </g>
);

/** Studio-Kamera auf Stativ mit rotem LIVE-Licht (Fußpunkt). */
export const StudioCam: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly live: number; readonly flip?: boolean }> = ({ x, y, s = 1, live, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#paper)">
    {[-60, 0, 60].map((dx) => (
      <line key={dx} x1={0} y1={-220} x2={dx} y2={0} stroke={PAPER.ink} strokeWidth={12} />
    ))}
    <rect x={-120} y={-330} width={220} height={120} rx={14} fill="#2A2C32" stroke={PAPER.ink} strokeWidth={7} />
    <rect x={100} y={-305} width={70} height={70} rx={8} fill="#3A3D45" stroke={PAPER.ink} strokeWidth={6} />
    <circle cx={-80} cy={-355} r={20} fill={live > 0.5 ? "#FF2B2B" : "#5A1C1C"} stroke={PAPER.ink} strokeWidth={5} />
    {live > 0.5 ? <circle cx={-80} cy={-355} r={40} fill="#FF2B2B" opacity={0.3} /> : null}
  </g>
);

/** Gerichtsgebäude (Fußpunkt Mitte). */
export const Courthouse: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <rect x={-470} y={-60} width={940} height={60} fill="#B9B4AA" stroke={PAPER.ink} strokeWidth={7} />
    <rect x={-430} y={-110} width={860} height={50} fill="#C9C4BA" stroke={PAPER.ink} strokeWidth={7} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-380 + i * 150} y={-520} width={70} height={410} fill="#E2DDD2" stroke={PAPER.ink} strokeWidth={6} />
    ))}
    <rect x={-450} y={-580} width={900} height={60} fill="#C9C4BA" stroke={PAPER.ink} strokeWidth={7} />
    <path d="M -480 -580 L 0 -780 L 480 -580 Z" fill="#D6D1C6" stroke={PAPER.ink} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={0} cy={-660} r={44} fill="#B9B4AA" stroke={PAPER.ink} strokeWidth={6} />
  </g>
);

/** Aktenordner (Mitte), z. B. in der Hand einer Silhouette. */
export const Folder: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#paperSoft)">
    <rect x={-50} y={-70} width={100} height={140} rx={6} fill="#D9B45A" stroke={PAPER.ink} strokeWidth={5} />
    <rect x={-50} y={-70} width={40} height={18} rx={4} fill="#C29A3E" stroke={PAPER.ink} strokeWidth={4} />
  </g>
);

/** Waage (Drehpunkt oben auf der Säule, Fußpunkt unten), `tilt` Grad (+ = rechte Schale tiefer). */
export const Scale: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly tilt: number; readonly left?: React.ReactNode; readonly right?: React.ReactNode }> = ({
  x,
  y,
  s = 1,
  tilt,
  left,
  right,
}) => {
  const a = deg(tilt);
  const arm = 300;
  const lx = -Math.cos(a) * arm;
  const ly = -Math.sin(a) * arm;
  const rx = Math.cos(a) * arm;
  const ry = Math.sin(a) * arm;
  const pan = (px: number, py: number, child: React.ReactNode, k: string) => (
    <g key={k} transform={`translate(${px} ${py})`}>
      <line x1={0} y1={0} x2={-90} y2={170} stroke={PAPER.ink} strokeWidth={5} />
      <line x1={0} y1={0} x2={90} y2={170} stroke={PAPER.ink} strokeWidth={5} />
      <path d="M -120 170 Q 0 240 120 170 Z" fill={FIGHT.goldDark} stroke={PAPER.ink} strokeWidth={6} />
      <g transform="translate(0 170)">{child}</g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
      <rect x={-18} y={-520} width={36} height={520} fill={FIGHT.goldDark} stroke={PAPER.ink} strokeWidth={6} />
      <path d="M -130 0 L 130 0 L 90 -50 L -90 -50 Z" fill={FIGHT.goldDark} stroke={PAPER.ink} strokeWidth={6} />
      <g transform="translate(0 -520)">
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={PAPER.ink} strokeWidth={22} strokeLinecap="round" />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={FIGHT.gold} strokeWidth={12} strokeLinecap="round" />
        <circle r={24} fill={FIGHT.gold} stroke={PAPER.ink} strokeWidth={6} />
        {pan(lx, ly, left, "l")}
        {pan(rx, ry, right, "r")}
      </g>
    </g>
  );
};

/** Streaming-Bildschirm (Mitte) mit Vertragszeile und Play-Symbol. */
export const StreamScreen: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly lines: readonly string[]; readonly t?: number }> = ({ x, y, s = 1, lines, t = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <rect x={-400} y={-250} width={800} height={480} rx={26} fill="#15171E" stroke={PAPER.ink} strokeWidth={9} />
    <rect x={-370} y={-220} width={740} height={420} rx={14} fill="#232838" />
    <path d="M -60 -150 L 70 -90 L -60 -30 Z" fill="#F4F1EA" opacity={0.9} />
    {lines.map((l, i) => (
      <text key={l} x={0} y={i ? 40 + i * 66 : 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={i ? 50 : 84} fill={i ? "#C9D3E6" : FIGHT.gold} opacity={Math.min(1, Math.max(0, t * 2 - i * 0.6))}>
        {l}
      </text>
    ))}
    <rect x={-120} y={232} width={240} height={30} fill="#2B2E36" stroke={PAPER.ink} strokeWidth={6} />
  </g>
);

/** Form-Wipe Oktagon (Bildraum): wächst bis bildfüllend um local 0, danach Loch. */
export const OCT_PATH = Array.from({ length: 8 }, (_, k) => {
  const a = deg(22.5 + k * 45);
  return `${k ? "L" : "M"} ${(Math.cos(a) * 100).toFixed(1)} ${(Math.sin(a) * 100).toFixed(1)}`;
}).join(" ") + " Z";
export const OctagonWipe: React.FC<{ readonly local: number; readonly n?: number; readonly color?: string; readonly x?: number; readonly y?: number }> = ({ local, n = 8, color = FIGHT.red, x = 540, y = 860 }) => {
  if (local < -n || local >= n) return null;
  const full = 13;
  if (local < 0) {
    const t = (local + n) / n;
    const sc = 0.05 + full * t * t;
    return <path d={OCT_PATH} transform={`translate(${x} ${y}) rotate(${-30 + 30 * t}) scale(${sc})`} fill={color} stroke={PAPER.ink} strokeWidth={14 / sc} />;
  }
  const t = local / n;
  const hole = full * t * t;
  return (
    <g>
      <defs>
        <mask id="oct-hole">
          <rect x={-2000} y={-2000} width={5000} height={6000} fill="#fff" />
          <path d={OCT_PATH} transform={`translate(${x} ${y}) scale(${hole})`} fill="#000" />
        </mask>
      </defs>
      <rect x={-2000} y={-2000} width={5000} height={6000} fill={color} mask="url(#oct-hole)" />
    </g>
  );
};

/** Schweißtropfen (Paper-Cut-Form), Mitte. */
export const Drop2: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly o?: number }> = ({ x, y, s = 1, r = 0, o = 1 }) => (
  <path d="M 0 -24 Q 16 0 12 10 Q 0 24 -12 10 Q -16 0 0 -24 Z" transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="#DDF1FF" stroke={PAPER.ink} strokeWidth={4} opacity={o} />
);
