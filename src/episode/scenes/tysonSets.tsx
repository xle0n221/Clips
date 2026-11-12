import React, { useMemo } from "react";
import { Drop, Hall, PAPER, PaperDefs, RingBack, RingTone, seeded } from "../kit2d";

/**
 * Kulissen für „Mike Tyson – hard life or his own fault?“ (scenes/tyson*.tsx), 2D-Paper-Cut.
 * Durchgehende Bühne: dunkle Halle + Boxring; jede Lebensstation = Prospekt (`Drop`) hinter den Seilen.
 * Prospekt-Fläche: Welt x −110…1190, y 60…1120 (lokal 0…1300 × 0…1060; unten verdeckt die Matte).
 * Color Script (Drehbuch `note`): warm-gold → kühles Blau-Grau (douglas) → Grau (conviction) →
 * fast schwarz mit einem warmen Licht (exodus) → gedimmter Spot (ending).
 */

export const DW = 1300;
export const DH = 1060;

export type Phase = "warm" | "dusk" | "cool" | "grey" | "black" | "gold" | "red" | "dim";
export const HALL: Record<Phase, { top: string; bottom: string; crowd: string }> = {
  warm: { top: "#1A120D", bottom: "#3A2618", crowd: "#120C09" },
  dusk: { top: "#140F1A", bottom: "#2E1E22", crowd: "#0D0A10" },
  cool: { top: "#0C1220", bottom: "#1E2A3E", crowd: "#080C16" },
  grey: { top: "#141414", bottom: "#2C2C2C", crowd: "#0C0C0C" },
  black: { top: "#050403", bottom: "#0E0B08", crowd: "#030202" },
  gold: { top: "#1E1408", bottom: "#4A3010", crowd: "#140D05" },
  red: { top: "#1C0A0C", bottom: "#3E1416", crowd: "#120607" },
  dim: { top: "#0E0C10", bottom: "#262028", crowd: "#08070A" },
};

/** Halle + Ring als Grundbühne (innerhalb einer Stage2D, Ebene depth 1 oder Parallax je Teil). */
export const Arena: React.FC<{
  readonly phase: Phase;
  readonly tone: RingTone;
  readonly f: number;
  readonly flashes?: number;
  readonly lights?: number;
  readonly drop?: React.ReactNode;
  readonly noRing?: boolean;
}> = ({ phase, tone, f, flashes = 0, lights = 1, drop, noRing = false }) => {
  const h = HALL[phase];
  return (
    <>
      <PaperDefs />
      <Hall top={h.top} bottom={h.bottom} crowd={h.crowd} frame={f} flashes={flashes} lights={lights} />
      {drop}
      {noRing ? null : <RingBack tone={tone} frame={f} />}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Prospekte (lokale Koordinaten 0…DW × 0…DH)                          */
/* ------------------------------------------------------------------ */

const Sky: React.FC<{ readonly a: string; readonly b: string; readonly id: string }> = ({ a, b, id }) => (
  <>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect width={DW} height={DH} fill={`url(#sky-${id})`} />
  </>
);

/** Brooklyn: Reihe von Brownstones mit Treppen, warmes verblasstes Gold. */
export const BrooklynDrop: React.FC<{ readonly down: number; readonly dx?: number }> = ({ down, dx }) => (
  <Drop id="brooklyn" down={down} dx={dx}>
    <Sky a="#E8C58A" b="#C98E55" id="bk" />
    <circle cx={1040} cy={260} r={90} fill="#F6DFA8" opacity={0.8} />
    {[0, 1, 2, 3, 4].map((i) => {
      const x = 20 + i * 256;
      const top = 300 + (i % 2) * 50;
      return (
        <g key={i}>
          <rect x={x} y={top} width={240} height={DH - top} fill={i % 2 ? "#8E5638" : "#7A4A31"} stroke={PAPER.ink} strokeWidth={6} />
          <rect x={x - 6} y={top - 24} width={252} height={28} fill="#5A3322" stroke={PAPER.ink} strokeWidth={5} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={x + 26 + c * 72} y={top + 50 + r * 150} width={46} height={92} fill={(i + r + c) % 4 ? "#F5D58E" : "#3A2418"} stroke={PAPER.ink} strokeWidth={4} />
            )),
          )}
          {/* Tür + Treppe */}
          <rect x={x + 92} y={DH - 300} width={60} height={110} fill="#3A2418" stroke={PAPER.ink} strokeWidth={4} />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={x + 70 - k * 10} y={DH - 190 + k * 34} width={104 + k * 20} height={34} fill="#A57A5A" stroke={PAPER.ink} strokeWidth={3} />
          ))}
        </g>
      );
    })}
    <rect x={0} y={DH - 60} width={DW} height={60} fill="#6E6258" />
    <g>
      <rect x={1220} y={560} width={14} height={440} fill="#2A2A2A" />
      <circle cx={1227} cy={556} r={24} fill="#FFE6A8" stroke={PAPER.ink} strokeWidth={4} />
    </g>
  </Drop>
);

/** Brownsville: höhere Wohnblöcke, dunkler, flacher blauer Lichtschimmer. */
export const BrownsvilleDrop: React.FC<{ readonly down: number; readonly dx?: number; readonly f: number; readonly blue?: number }> = ({ down, dx, f, blue = 1 }) => {
  const lit = useMemo(() => {
    const r = seeded(41);
    return Array.from({ length: 200 }, () => r() < 0.22);
  }, []);
  const flick = (Math.sin(f * 0.5) + 1) / 2;
  return (
    <Drop id="brownsville" down={down} dx={dx}>
      <Sky a="#2B2340" b="#5A3A44" id="bv" />
      {[0, 1, 2, 3].map((i) => {
        const x = 30 + i * 320;
        const top = 180 + (i % 2) * 120;
        return (
          <g key={i}>
            <rect x={x} y={top} width={280} height={DH - top} fill={i % 2 ? "#4A3A3E" : "#3E3034"} stroke={PAPER.ink} strokeWidth={6} />
            {Array.from({ length: 8 }, (_, r) =>
              Array.from({ length: 5 }, (__, c) => (
                <rect key={`${r}-${c}`} x={x + 22 + c * 52} y={top + 30 + r * 96} width={30} height={54} fill={lit[(i * 40 + r * 5 + c) % 200] ? "#E9B864" : "#241A1E"} />
              )),
            )}
          </g>
        );
      })}
      <rect x={0} y={DH - 70} width={DW} height={70} fill="#2A2426" />
      {/* Blaulicht nur als flacher Schimmer */}
      <rect x={0} y={0} width={DW} height={DH} fill="#3D6BFF" opacity={0.18 * blue * flick} />
      <rect x={0} y={0} width={DW} height={DH} fill="#FF3B3B" opacity={0.08 * blue * (1 - flick)} />
    </Drop>
  );
};

/** Dach in Brownsville: Brüstung, Wasserturm, Taubenschlag. */
export const RooftopDrop: React.FC<{ readonly down: number; readonly dx?: number }> = ({ down, dx }) => (
  <Drop id="roof" down={down} dx={dx}>
    <Sky a="#3C2A4A" b="#C76A4A" id="rf" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={i * 190 - 20} y={520 + (i % 3) * 60} width={170} height={600} fill="#2E2236" />
    ))}
    {/* Wasserturm */}
    <g transform="translate(1040 300)">
      <rect x={-80} y={0} width={160} height={190} rx={20} fill="#6A4A34" stroke={PAPER.ink} strokeWidth={6} />
      <path d="M -90 0 L 0 -70 L 90 0 Z" fill="#4A3424" stroke={PAPER.ink} strokeWidth={6} />
      {[-60, 60].map((lx) => (
        <line key={lx} x1={lx} y1={190} x2={lx * 1.2} y2={420} stroke={PAPER.ink} strokeWidth={10} />
      ))}
    </g>
    {/* Taubenschlag */}
    <g transform="translate(180 560)">
      <rect x={0} y={0} width={330} height={300} fill="#8A6040" stroke={PAPER.ink} strokeWidth={7} />
      <path d="M -20 0 L 165 -90 L 350 0 Z" fill="#5E3E28" stroke={PAPER.ink} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({ length: 8 }, (_, k) => (
        <line key={k} x1={30 + k * 38} y1={40} x2={30 + k * 38} y2={260} stroke="#C8C0B0" strokeWidth={3} />
      ))}
      {Array.from({ length: 6 }, (_, k) => (
        <line key={k} x1={20} y1={50 + k * 40} x2={310} y2={50 + k * 40} stroke="#C8C0B0" strokeWidth={3} />
      ))}
    </g>
    {/* Brüstung */}
    <rect x={0} y={880} width={DW} height={180} fill="#5A4652" stroke={PAPER.ink} strokeWidth={6} />
    {Array.from({ length: 14 }, (_, k) => (
      <line key={k} x1={k * 96} y1={880} x2={k * 96} y2={1060} stroke="#46363F" strokeWidth={4} />
    ))}
  </Drop>
);

/** Ziegelwand (Strichliste). */
export const BrickDrop: React.FC<{ readonly down: number; readonly dx?: number; readonly children?: React.ReactNode }> = ({ down, dx, children }) => (
  <Drop id="brick" down={down} dx={dx}>
    <rect width={DW} height={DH} fill="#6E3428" />
    {Array.from({ length: 24 }, (_, r) =>
      Array.from({ length: 12 }, (__, c) => (
        <rect key={`${r}-${c}`} x={c * 120 - (r % 2) * 60} y={r * 46} width={112} height={40} fill={(r * 7 + c * 3) % 5 ? "#7C3C2E" : "#68301F"} />
      )),
    )}
    {children}
  </Drop>
);

/** Flur einer Jugendanstalt (schlicht, Türen, Perspektive). */
export const HallwayDrop: React.FC<{ readonly down: number; readonly dx?: number }> = ({ down, dx }) => (
  <Drop id="hallway" down={down} dx={dx}>
    <rect width={DW} height={DH} fill="#B9BBA6" />
    <path d={`M 0 0 L 470 330 L 470 760 L 0 ${DH} Z`} fill="#9EA18C" stroke={PAPER.ink} strokeWidth={5} />
    <path d={`M ${DW} 0 L 830 330 L 830 760 L ${DW} ${DH} Z`} fill="#A6A994" stroke={PAPER.ink} strokeWidth={5} />
    <rect x={470} y={330} width={360} height={430} fill="#C9CBB5" stroke={PAPER.ink} strokeWidth={5} />
    <rect x={590} y={470} width={120} height={290} fill="#6F7A6A" stroke={PAPER.ink} strokeWidth={5} />
    <path d={`M 0 ${DH} L 470 760 L 830 760 L ${DW} ${DH} Z`} fill="#7E7A6E" stroke={PAPER.ink} strokeWidth={5} />
    {[
      [120, 290, 140, 420],
      [300, 360, 100, 330],
    ].map(([x, y, w, h], i) => (
      <g key={i}>
        <path d={`M ${x} ${y} L ${x + w} ${y + w * 0.7} L ${x + w} ${y + h - w * 0.4} L ${x} ${y + h} Z`} fill="#5E6858" stroke={PAPER.ink} strokeWidth={5} />
        <path d={`M ${DW - x} ${y} L ${DW - x - w} ${y + w * 0.7} L ${DW - x - w} ${y + h - w * 0.4} L ${DW - x} ${y + h} Z`} fill="#5E6858" stroke={PAPER.ink} strokeWidth={5} />
      </g>
    ))}
    <rect x={560} y={150} width={180} height={26} rx={10} fill="#F4F2DE" opacity={0.9} />
  </Drop>
);

/** Holz-Trainingshalle (Gym): Bretterwand, Fenster, Sandsäcke. */
export const GymDrop: React.FC<{ readonly down: number; readonly dx?: number; readonly tint?: string }> = ({ down, dx, tint }) => (
  <Drop id="gym" down={down} dx={dx}>
    <rect width={DW} height={DH} fill="#9A6A42" />
    {Array.from({ length: 22 }, (_, k) => (
      <rect key={k} x={k * 60} y={0} width={56} height={DH} fill={k % 3 ? "#A0703F" : "#8C5E36"} />
    ))}
    {[260, 1040].map((wx) => (
      <g key={wx}>
        <rect x={wx - 110} y={200} width={220} height={260} fill="#F0D7A0" stroke={PAPER.ink} strokeWidth={8} />
        <line x1={wx} y1={200} x2={wx} y2={460} stroke={PAPER.ink} strokeWidth={8} />
        <line x1={wx - 110} y1={330} x2={wx + 110} y2={330} stroke={PAPER.ink} strokeWidth={8} />
      </g>
    ))}
    <rect x={0} y={0} width={DW} height={60} fill="#5E3E24" />
    {tint ? <rect width={DW} height={DH} fill={tint} opacity={0.35} /> : null}
  </Drop>
);

/** Schlichte Zimmerwand (Erinnerung), kühles Licht. */
export const RoomDrop: React.FC<{ readonly down: number; readonly dx?: number; readonly children?: React.ReactNode }> = ({ down, dx, children }) => (
  <Drop id="room" down={down} dx={dx}>
    <rect width={DW} height={DH} fill="#4E5E72" />
    {Array.from({ length: 14 }, (_, k) => (
      <rect key={k} x={k * 96} y={0} width={4} height={DH} fill="#455467" />
    ))}
    <rect x={0} y={820} width={DW} height={240} fill="#3A4656" />
    <rect x={0} y={812} width={DW} height={16} fill="#2C3644" />
    {children}
  </Drop>
);

/** Leerer Gerichtssaal: Holzwand, Richterbank, Geschworenen-Reihe (Köpfe überlappend, nicht zählbar). */
export const CourtDrop: React.FC<{ readonly down: number; readonly dx?: number; readonly f: number }> = ({ down, dx, f }) => (
  <Drop id="court" down={down} dx={dx}>
    <rect width={DW} height={DH} fill="#6E6A66" />
    {Array.from({ length: 10 }, (_, k) => (
      <rect key={k} x={k * 140} y={0} width={130} height={620} fill="#787470" stroke="#5C5854" strokeWidth={4} />
    ))}
    {/* Richterbank */}
    <rect x={380} y={380} width={540} height={300} fill="#57534F" stroke={PAPER.ink} strokeWidth={7} />
    <rect x={360} y={360} width={580} height={40} fill="#4A4643" stroke={PAPER.ink} strokeWidth={6} />
    <circle cx={650} cy={260} r={70} fill="#8A8682" stroke={PAPER.ink} strokeWidth={6} />
    <circle cx={650} cy={260} r={40} fill="#6E6A66" />
    {/* Geschworene: viele überlappende graue Köpfe, nach rechts ins Dunkel auslaufend */}
    {Array.from({ length: 22 }, (_, k) => (
      <g key={k} opacity={Math.max(0.15, 1 - k * 0.045)}>
        <circle cx={-40 + k * 34} cy={760 + (k % 2) * 30 + Math.sin(f * 0.04 + k) * 2} r={34} fill="#4E4B48" />
        <rect x={-80 + k * 34} y={790 + (k % 2) * 30} width={80} height={120} rx={26} fill="#4E4B48" />
      </g>
    ))}
    <rect x={0} y={880} width={DW} height={180} fill="#4A4643" stroke={PAPER.ink} strokeWidth={6} />
  </Drop>
);

/** Tokio 1990: kühle Nacht-Skyline (generisch); Ort/Jahr nennt der Sticker. */
export const TokyoDrop: React.FC<{ readonly down: number; readonly dx?: number }> = ({ down, dx }) => {
  const b = useMemo(() => {
    const r = seeded(9);
    return Array.from({ length: 16 }, (_, i) => ({ x: i * 84 - 20, h: 220 + r() * 420, w: 70 + r() * 30 }));
  }, []);
  return (
    <Drop id="tokyo" down={down} dx={dx}>
      <Sky a="#0E1830" b="#3A4E70" id="tk" />
      {b.map((q, i) => (
        <g key={i}>
          <rect x={q.x} y={DH - 120 - q.h} width={q.w} height={q.h + 120} fill={i % 2 ? "#1E2A44" : "#25324E"} stroke={PAPER.ink} strokeWidth={4} />
          {Array.from({ length: Math.floor(q.h / 60) }, (_, r) => (
            <rect key={r} x={q.x + 14} y={DH - 100 - q.h + r * 60} width={q.w - 28} height={10} fill="#8FB3E0" opacity={0.35 + ((i + r) % 3) * 0.12} />
          ))}
        </g>
      ))}

    </Drop>
  );
};

/** Stadion 2024: riesige Ränge mit vielen kleinen Lichtern. */
export const StadiumDrop: React.FC<{ readonly down: number; readonly dx?: number; readonly f: number }> = ({ down, dx, f }) => {
  const dots = useMemo(() => {
    const r = seeded(13);
    return Array.from({ length: 260 }, () => ({ x: r() * DW, y: 120 + r() * 760, k: r() }));
  }, []);
  return (
    <Drop id="stadium" down={down} dx={dx}>
      <Sky a="#0A0A14" b="#1C1828" id="st" />
      {[0, 1, 2, 3].map((t) => (
        <path key={t} d={`M -40 ${200 + t * 200} Q 650 ${120 + t * 200} 1340 ${200 + t * 200} L 1340 ${400 + t * 200} Q 650 ${320 + t * 200} -40 ${400 + t * 200} Z`} fill={t % 2 ? "#221C2C" : "#2A2236"} stroke={PAPER.ink} strokeWidth={5} />
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={4 + d.k * 3} fill="#FFF3D6" opacity={0.25 + 0.5 * ((Math.sin(f * 0.2 + d.k * 30) + 1) / 2)} />
      ))}
      <rect x={0} y={60} width={DW} height={28} fill="#E8E4F0" opacity={0.25} />
    </Drop>
  );
};

/** Leeres Arena-Prospekt mit Rot-Ton (Biss/Bankrott). */
export const NightDrop: React.FC<{ readonly down: number; readonly dx?: number }> = ({ down, dx }) => (
  <Drop id="night" down={down} dx={dx}>
    <Sky a="#0A0C18" b="#24182A" id="nt" />
    {Array.from({ length: 40 }, (_, k) => (
      <circle key={k} cx={(k * 173) % DW} cy={60 + ((k * 97) % 500)} r={3} fill="#E6E9FF" opacity={0.6} />
    ))}
    <circle cx={1060} cy={240} r={70} fill="#DDE3F2" opacity={0.85} />
  </Drop>
);

/** Handschlag-Großaufnahme: Kinderhand (Haut) in der Hand des anderen (Silhouette, ggf. Ärmel). Mitte (x, y). */
export const Handshake: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly other: string; readonly sleeve?: string }> = ({ x, y, s = 1, other, sleeve }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <rect x={-120} y={-18} width={90} height={36} rx={16} fill={PAPER.skin} stroke={PAPER.ink} strokeWidth={5} />
    <ellipse cx={-18} cy={0} rx={34} ry={28} fill={PAPER.skin} stroke={PAPER.ink} strokeWidth={5} />
    <rect x={30} y={-22} width={110} height={44} rx={18} fill={sleeve ?? other} stroke={PAPER.ink} strokeWidth={5} />
    <path d="M 40 -30 Q -10 -40 -34 -10 Q -40 20 -4 30 Q 30 34 44 22 Z" fill={other} stroke={PAPER.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -4 -30 Q -30 -44 -40 -24" stroke={PAPER.ink} strokeWidth={5} fill={other} />
  </g>
);
