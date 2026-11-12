import React, { useContext } from "react";
import { beatOr, Card, Cash, Check, FONT, Kit2DContext, LUX, LuxCar, seeded } from "../kit2d";
import { useScene } from "../types";

/**
 * Kulissen + Helfer für „How to become a Rolls-Royce driver in 1 minute“ (scenes/rolls*.tsx), 2D-Sticker/Paper-Cut.
 * Bildregeln: HUD oben links bis y ≈ 372, Sticker ab y 402 (gestapelt bis ≈ 700), Pills zeigen auf y 691,
 * unteres Drittel (ab y ≈ 1280) frei für Untertitel. Color Script (Drehbuch `note`): Wohnzimmer-Grau →
 * Gold/Champagner → Glitch-Rot bei den Plot-Twists → Gold → zurück ins Wohnzimmer.
 */

/**
 * Zeiten je Szene: Beats aus timeline.json (`B`) und Wort-Zeiten aus captions.json (`W`, lokaler Frame des
 * n-ten Vorkommens eines Worts). Nichts fest kodiert – eine neue Tonspur passt ohne Code-Änderung.
 * Ersatzwerte (Anteil der Szenendauer) gelten nur, wenn Beat/Wort fehlt.
 */
export const useBeats = () => {
  const s = useScene();
  const { captions, fps, start } = useContext(Kit2DContext);
  const d = s.duration;
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9'-]/g, "");
  const W = (word: string, frac: number, nth = 1) => {
    const t0 = (start / fps) * 1000;
    const t1 = ((start + d) / fps) * 1000;
    const hits = captions.filter((c) => c.startMs >= t0 - 60 && c.startMs < t1 && norm(c.text) === norm(word));
    const c = hits[nth - 1];
    return c ? Math.max(0, Math.round((c.startMs / 1000) * fps) - start) : Math.round(frac * d);
  };
  return { f: s.frame, d, B: (n: string, frac: number) => beatOr(s.beat, n, Math.round(frac * d)), W };
};

/** Großer Hintergrund-Verlauf (Welt-Koordinaten, reicht weit über den Bildrand). */
export const Wash: React.FC<{ readonly id: string; readonly a: string; readonly b: string; readonly y0?: number; readonly y1?: number }> = ({ id, a, b, y0 = -400, y1 = 1400 }) => (
  <>
    <defs>
      <linearGradient id={`wash-${id}`} x1="0" y1={y0} x2="0" y2={y1} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect x={-2000} y={-2000} width={6000} height={6000} fill={`url(#wash-${id})`} />
  </>
);

/* ------------------------------------------------------------------ */
/* Wohnzimmer (hook, Loop am Ende, Cover)                               */
/* ------------------------------------------------------------------ */

export const ROOM = { floor: 1150, sofaX: 380, winX: 770, winY: 760 } as const;

export const LivingRoom: React.FC<{ readonly f: number; readonly gold?: number }> = ({ f, gold = 0 }) => {
  const { floor, sofaX, winX, winY } = ROOM;
  return (
    <>
      <Wash id="room" a="#9C95B4" b="#B9B2CC" />
      {/* Tapete: Streifen */}
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={-400 + i * 90} y={-400} width={36} height={floor + 400} fill="#A8A1C0" opacity={0.6} />
      ))}
      {/* Fenster mit Limousine im Goldlicht */}
      <g filter="url(#paper)">
        <rect x={winX - 250} y={winY - 300} width={500} height={420} rx={14} fill="#5C4A6E" stroke={LUX.ink} strokeWidth={10} />
        <defs>
          <linearGradient id="winSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFB86B" />
            <stop offset="1" stopColor="#FFE3A3" />
          </linearGradient>
          <clipPath id="winClip">
            <rect x={winX - 232} y={winY - 282} width={464} height={384} rx={6} />
          </clipPath>
        </defs>
        <g clipPath="url(#winClip)">
          <rect x={winX - 240} y={winY - 290} width={480} height={400} fill="url(#winSky)" />
          <circle cx={winX + 120} cy={winY - 150} r={70} fill="#FFF3C9" opacity={0.9} />
          <rect x={winX - 240} y={winY + 40} width={480} height={80} fill="#7D6A58" />
          <LuxCar x={winX - 10} y={winY + 70} s={0.43} kind="sedan" body="#2D2A4A" top="#E8DCC0" sticker={false} glint={((f % 90) / 90) * 1.4 - 0.2} />
          <circle cx={winX - 10} cy={winY - 10} r={260} fill="url(#luxGlow)" opacity={0.7} />
        </g>
        <path d={`M ${winX} ${winY - 290} L ${winX} ${winY + 110} M ${winX - 240} ${winY - 90} L ${winX + 240} ${winY - 90}`} stroke="#5C4A6E" strokeWidth={14} />
        <rect x={winX - 270} y={winY + 110} width={540} height={26} rx={8} fill="#E9E2D2" stroke={LUX.ink} strokeWidth={6} />
      </g>
      {/* Poster links */}
      <g filter="url(#paper)" transform="translate(120 560) rotate(-4)">
        <rect x={-90} y={-120} width={180} height={240} fill="#F5E9D0" stroke={LUX.ink} strokeWidth={6} />
        <path d="M -60 60 L -10 -40 L 20 10 L 40 -20 L 70 60 Z" fill="#7FA6C9" stroke={LUX.ink} strokeWidth={4} />
        <circle cx={40} cy={-70} r={20} fill="#F2C14E" stroke={LUX.ink} strokeWidth={4} />
      </g>
      {/* Boden */}
      <rect x={-2000} y={floor} width={6000} height={2000} fill="#5E5675" />
      <rect x={-2000} y={floor} width={6000} height={14} fill={LUX.ink} opacity={0.5} />
      {/* Teppich */}
      <ellipse cx={sofaX + 60} cy={floor + 90} rx={520} ry={70} fill="#7C6F98" stroke={LUX.ink} strokeWidth={6} />
      {/* Sofa (hinterer Teil – Figur sitzt davor) */}
      <g filter="url(#paper)">
        <rect x={sofaX - 330} y={floor - 330} width={660} height={230} rx={60} fill="#5A6FA6" stroke={LUX.ink} strokeWidth={9} />
        <path d={`M ${sofaX} ${floor - 320} L ${sofaX} ${floor - 110}`} stroke="#465A8E" strokeWidth={10} />
      </g>
      {/* Goldlicht flutet den Raum (auf „rich“) */}
      {gold > 0 ? <rect x={-2000} y={-2000} width={6000} height={6000} fill="#FFC94A" opacity={gold * 0.22} /> : null}
    </>
  );
};

/** Vorderer Sofa-Teil (Sitz + Armlehnen) – vor die sitzende Figur legen (Beine bleiben sichtbar). */
export const SofaFront: React.FC = () => {
  const { floor, sofaX } = ROOM;
  return (
    <g filter="url(#paper)">
      <rect x={sofaX - 380} y={floor - 210} width={110} height={210} rx={40} fill="#5A6FA6" stroke={LUX.ink} strokeWidth={9} />
      <rect x={sofaX + 270} y={floor - 210} width={110} height={210} rx={40} fill="#5A6FA6" stroke={LUX.ink} strokeWidth={9} />
      <rect x={sofaX - 290} y={floor - 60} width={580} height={44} rx={12} fill="#465A8E" stroke={LUX.ink} strokeWidth={7} />
    </g>
  );
};

/** Sitzfläche hinter der Figur (zwischen Rückenlehne und Figur). */
export const SofaSeat: React.FC = () => {
  const { floor, sofaX } = ROOM;
  return <rect x={sofaX - 290} y={floor - 130} width={580} height={90} rx={26} fill="#6A80B8" stroke={LUX.ink} strokeWidth={8} />;
};

/** Geldregen (Papierscheine, deterministisch). */
export const CashRain: React.FC<{ readonly t: number; readonly x0?: number; readonly w?: number; readonly n?: number }> = ({ t, x0 = 0, w = 1080, n = 14 }) => {
  if (t <= 0) return null;
  const rnd = seeded(31);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const sx = x0 + rnd() * w;
        const delay = rnd() * 22;
        const sp = 9 + rnd() * 6;
        const k = t - delay;
        if (k < 0) return null;
        const y = 380 + k * sp;
        return <Cash key={i} x={sx + Math.sin(k * 0.12 + i) * 40} y={y} r={k * (3 + (i % 4)) + i * 30} s={0.8} flip={Math.cos(k * 0.15 + i)} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Showroom (pick, ending)                                             */
/* ------------------------------------------------------------------ */

export const Showroom: React.FC<{ readonly f: number; readonly floor?: number }> = ({ f, floor = 1120 }) => (
  <>
    <Wash id="show" a="#F7E2A6" b="#D9A24E" y0={-200} y1={floor} />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M ${-600 + i * 260} -400 L ${-520 + i * 260} -400 L ${-380 + i * 260} ${floor} L ${-500 + i * 260} ${floor} Z`} fill="#FFF4D2" opacity={0.18 + 0.06 * Math.sin(f * 0.04 + i)} />
    ))}
    {/* Wandpaneele */}
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={`p${i}`} x={-700 + i * 420} y={420} width={300} height={floor - 520} rx={10} fill="none" stroke="#C48E36" strokeWidth={6} opacity={0.6} />
    ))}
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#2E211A" />
    <rect x={-2000} y={floor} width={6000} height={10} fill={LUX.gold} />
    <rect x={-2000} y={floor + 40} width={6000} height={400} fill="#3E2C20" opacity={0.6} />
  </>
);

/** Drehbühne (Ellipse mit Goldrand). */
export const Turntable: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly f: number }> = ({ x, y, w, f }) => (
  <g>
    <ellipse cx={x} cy={y + 14} rx={w / 2 + 10} ry={58} fill={LUX.ink} />
    <ellipse cx={x} cy={y} rx={w / 2} ry={50} fill="#4A382A" stroke={LUX.gold} strokeWidth={8} />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + f * 0.03;
      return <path key={i} d={`M ${x} ${y} L ${x + Math.cos(a) * (w / 2 - 20)} ${y + Math.sin(a) * 40}`} stroke="#6A5440" strokeWidth={4} />;
    })}
  </g>
);

/** Krone als Sticker (eigene Form). */
export const Crown: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
    <path d="M -70 40 L -80 -40 L -40 0 L 0 -60 L 40 0 L 80 -40 L 70 40 Z" fill={LUX.gold} stroke={LUX.ink} strokeWidth={7} strokeLinejoin="round" />
    <circle cx={0} cy={10} r={12} fill={LUX.red} stroke={LUX.ink} strokeWidth={4} />
  </g>
);

/** Supermarkt-Schild „ENTRY LEVEL“ (blinkt). */
export const DealSign: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly f: number }> = ({ x, y, t, f }) => {
  if (t <= 0) return null;
  const on = Math.floor(f / 6) % 2 === 0 ? 1 : 0.55;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1, t)}) rotate(${Math.sin(f * 0.15) * 3})`}>
      <path d="M -150 -150 L -120 -60 M 150 -150 L 120 -60" stroke={LUX.ink} strokeWidth={5} />
      <g filter="url(#sticker)">
        <path d="M -230 -60 L 230 -60 L 250 0 L 230 60 L -230 60 L -250 0 Z" fill="#FFE14D" stroke={LUX.ink} strokeWidth={8} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={LUX.red} opacity={on} letterSpacing={2}>
          ENTRY LEVEL
        </text>
      </g>
    </g>
  );
};

/** Starter-Pack-Raster (eigenes 2×2-Layout, eigene Zeichnungen). `t` 0..1 = Zellen erscheinen nacheinander. */
export const StarterPack: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly f: number; readonly s?: number }> = ({ x, y, t, f, s = 1 }) => {
  if (t <= 0) return null;
  const cell = (i: number, label: string, art: React.ReactNode) => {
    const k = Math.max(0, Math.min(1, t * 4.2 - i));
    const cx = (i % 2 === 0 ? -1 : 1) * 210;
    const cy = (i < 2 ? -1 : 1) * 175;
    return (
      <g key={label} transform={`translate(${cx} ${cy}) scale(${k > 0 ? 0.85 + 0.15 * Math.min(1, k) : 0})`} opacity={Math.min(1, k * 2)}>
        <rect x={-195} y={-160} width={390} height={320} rx={10} fill="#FFFFFF" stroke={LUX.ink} strokeWidth={5} />
        {art}
        <text x={0} y={132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={LUX.ink}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, t * 3)})`} filter="url(#sticker)">
      <rect x={-430} y={-370} width={860} height={740} rx={16} fill="#EDE6D6" stroke={LUX.ink} strokeWidth={8} />
      {cell(
        0,
        "CARDBOARD SHADES",
        <g transform="translate(0 -20) scale(1.25)">
          <path d="M -118 -40 L -10 -40 L -18 30 Q -60 52 -106 30 Z M 118 -40 L 10 -40 L 18 30 Q 60 52 106 30 Z" fill="#B88A55" stroke={LUX.ink} strokeWidth={5} />
          <path d="M -108 -32 L -20 -32 L -26 22 Q -62 40 -100 22 Z M 108 -32 L 20 -32 L 26 22 Q 62 40 100 22 Z" fill="#111018" />
          <rect x={-14} y={-38} width={28} height={14} fill="#B88A55" stroke={LUX.ink} strokeWidth={4} />
        </g>,
      )}
      {cell(
        1,
        "LEATHER GLOVES",
        <g transform="translate(0 -24)">
          {[-60, 60].map((gx) => (
            <path
              key={gx}
              transform={`translate(${gx} 0) scale(${gx < 0 ? -1 : 1} 1)`}
              d="M -40 70 L -44 -10 Q -50 -60 -36 -62 Q -24 -62 -24 -20 L -22 -76 Q -16 -92 -4 -76 L -4 -24 L 0 -84 Q 10 -98 18 -82 L 16 -22 L 24 -70 Q 36 -82 40 -64 L 34 -4 L 52 -30 Q 66 -36 62 -18 L 40 40 L 38 70 Z"
              fill={LUX.leatherDark}
              stroke={LUX.ink}
              strokeWidth={5}
              strokeLinejoin="round"
            />
          ))}
        </g>,
      )}
      {cell(
        2,
        "CHAMPAGNE",
        <g transform="translate(0 -10) scale(1.4)">
          <path d="M -20 -70 L 20 -70 L 14 0 Q 0 12 -14 0 Z" fill={LUX.champagne} stroke={LUX.ink} strokeWidth={4} />
          <path d="M -16 -52 L 16 -52" stroke={LUX.gold} strokeWidth={4} />
          <path d="M 0 8 L 0 50 M -22 52 L 22 52" stroke={LUX.ink} strokeWidth={5} strokeLinecap="round" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-6 + i * 6} cy={-30 - ((f * 1.5 + i * 12) % 34)} r={3} fill={LUX.white} />
          ))}
        </g>,
      )}
      {cell(3, "1x GHOST", <LuxCar x={0} y={60} s={0.36} body="#3B4A6B" top="#D9DDE6" sticker={false} />)}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Warteschlange (wait)                                                */
/* ------------------------------------------------------------------ */

export const VelvetHall: React.FC<{ readonly floor?: number }> = ({ floor = 1180 }) => (
  <>
    <Wash id="velvet" a="#2A1530" b="#4A2650" y1={floor} />
    {Array.from({ length: 12 }, (_, i) => (
      <g key={i}>
        <rect x={-900 + i * 340} y={300} width={240} height={floor - 400} rx={12} fill="#55305C" stroke="#C9A04A" strokeWidth={6} />
        <circle cx={-780 + i * 340} cy={420} r={30} fill="#FFE6A6" opacity={0.5} />
      </g>
    ))}
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#E9E1D2" />
    {Array.from({ length: 24 }, (_, i) => (
      <path key={`m${i}`} d={`M ${-1200 + i * 180} ${floor} L ${-1400 + i * 180} ${floor + 600}`} stroke="#D3C8B4" strokeWidth={4} />
    ))}
    <rect x={-2000} y={floor} width={6000} height={10} fill={LUX.ink} opacity={0.4} />
  </>
);

/** Absperrpfosten + Samtkordel (von x0 bis x1). */
export const Rope: React.FC<{ readonly x0: number; readonly x1: number; readonly y: number; readonly n?: number; readonly sway?: number }> = ({ x0, x1, y, n = 3, sway = 0 }) => {
  const xs = Array.from({ length: n }, (_, i) => x0 + ((x1 - x0) * i) / Math.max(1, n - 1));
  return (
    <g filter="url(#paperSoft)">
      {xs.slice(1).map((px, i) => (
        <path key={`r${px}`} d={`M ${xs[i]} ${y - 190} Q ${(xs[i] + px) / 2} ${y - 100 + sway * Math.sin(i)} ${px} ${y - 190}`} stroke="#B0213A" strokeWidth={16} fill="none" strokeLinecap="round" />
      ))}
      {xs.map((px) => (
        <g key={px}>
          <rect x={px - 9} y={y - 210} width={18} height={210} fill={LUX.gold} stroke={LUX.ink} strokeWidth={4} />
          <circle cx={px} cy={y - 214} r={18} fill={LUX.gold} stroke={LUX.ink} strokeWidth={4} />
          <ellipse cx={px} cy={y - 4} rx={44} ry={12} fill={LUX.goldDark} stroke={LUX.ink} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

/** Gesichtslose Anzug-Silhouette (Nebenfigur). */
export const Suit: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly seed?: number; readonly color?: string }> = ({ x, y, s = 1, f, seed = 1, color = "#2B2B3A" }) => {
  const bob = Math.sin(f * 0.08 + seed) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paperSoft)">
      <rect x={-50} y={-250} width={42} height={250} rx={16} fill="#1D1D28" />
      <rect x={8} y={-250} width={42} height={250} rx={16} fill="#1D1D28" />
      <path d={`M -96 ${-420 + bob} Q -100 ${-470 + bob} -60 ${-476 + bob} L 60 ${-476 + bob} Q 100 ${-470 + bob} 96 ${-420 + bob} L 84 -230 L -84 -230 Z`} fill={color} stroke={LUX.ink} strokeWidth={6} />
      <path d={`M -26 ${-474 + bob} L 0 ${-400 + bob} L 26 ${-474 + bob} Z`} fill={LUX.white} />
      <path d={`M -8 ${-460 + bob} L 8 ${-460 + bob} L 12 ${-380 + bob} L 0 ${-366 + bob} L -12 ${-380 + bob} Z`} fill="#7A1E2E" />
      <circle cx={0} cy={-540 + bob} r={66} fill={color} stroke={LUX.ink} strokeWidth={6} />
    </g>
  );
};

/** Goldener Umschlag mit Siegel (eigene Form). */
export const Envelope: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#sticker)">
    <rect x={-170} y={-110} width={340} height={220} rx={12} fill={LUX.gold} stroke={LUX.ink} strokeWidth={7} />
    <path d="M -170 -110 L 0 20 L 170 -110" stroke={LUX.goldDark} strokeWidth={8} fill="none" />
    <path d="M -170 -110 L 0 20 L 170 -110" stroke={LUX.ink} strokeWidth={4} fill="none" />
    <circle cx={0} cy={20} r={34} fill="#B0213A" stroke={LUX.ink} strokeWidth={5} />
    <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill="#F6C6C6">
      ?
    </text>
  </g>
);

/* ------------------------------------------------------------------ */
/* Innenraum (stitch, stars)                                           */
/* ------------------------------------------------------------------ */

/** Großer Leder-Sitz frontal mit Steppung (Fußpunkt der sitzenden Figur = x, y). */
export const SeatBack: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly sink?: number }> = ({ x, y, s = 1, sink = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#paper)">
    <path d="M -230 -200 L -250 -640 Q -250 -720 -170 -724 L 170 -724 Q 250 -720 250 -640 L 230 -200 Z" fill={LUX.cream} stroke={LUX.ink} strokeWidth={9} />
    {/* Steppung (Rauten) */}
    <g opacity={0.55}>
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => <path key={`${r}-${c}`} d={`M ${-180 + c * 90} ${-650 + r * 76} l 45 38 l -45 38 l -45 -38 Z`} fill="none" stroke="#C8B48E" strokeWidth={4} strokeDasharray="8 6" />),
      )}
    </g>
    <rect x={-150} y={-800} width={300} height={90} rx={40} fill={LUX.cream} stroke={LUX.ink} strokeWidth={8} />
    <path d={`M -260 -210 Q 0 ${-170 + sink * 40} 260 -210 L 270 -120 Q 0 ${-90 + sink * 30} -270 -120 Z`} fill="#E2D2B2" stroke={LUX.ink} strokeWidth={8} />
  </g>
);

export const Cabin: React.FC<{ readonly floor?: number }> = ({ floor = 1250 }) => (
  <>
    <Wash id="cabin" a="#3B2A24" b="#6B4A36" y1={floor} />
    {/* Holz-Leiste + Fensterbögen links/rechts */}
    <path d={`M -2000 ${floor - 560} L 4000 ${floor - 560} L 4000 ${floor - 500} L -2000 ${floor - 500} Z`} fill={LUX.wood} stroke={LUX.ink} strokeWidth={6} />
    <path d={`M -400 ${floor - 560} Q -380 ${floor - 1100} 120 ${floor - 1160} L 120 ${floor - 560} Z`} fill="#9EC7E6" stroke={LUX.ink} strokeWidth={8} />
    <path d={`M 1480 ${floor - 560} Q 1460 ${floor - 1100} 960 ${floor - 1160} L 960 ${floor - 560} Z`} fill="#9EC7E6" stroke={LUX.ink} strokeWidth={8} />
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#2A1E19" />
  </>
);

/** Steppnaht auf Stoff: Nadel auf/ab, Stichlinie wächst (`t` 0..1). */
export const StitchPanel: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly t: number; readonly f: number }> = ({ x, y, w, t, f }) => {
  const nx = x - w / 2 + 40 + (w - 80) * t;
  const up = Math.abs(Math.sin(f * 0.9)) * 70;
  return (
    <g>
      <g filter="url(#paper)">
        <rect x={x - w / 2} y={y - 150} width={w} height={300} rx={20} fill="#E8DCC2" stroke={LUX.ink} strokeWidth={8} />
        {/* Twill-Struktur */}
        {Array.from({ length: Math.floor(w / 26) }, (_, i) => (
          <path key={i} d={`M ${x - w / 2 + i * 26} ${y - 146} l 40 292`} stroke="#D6C7A6" strokeWidth={6} />
        ))}
      </g>
      <path d={`M ${x - w / 2 + 40} ${y} L ${nx} ${y}`} stroke="#8A5A34" strokeWidth={8} strokeDasharray="22 12" />
      <path d={`M ${x - w / 2 + 40} ${y + 70} L ${x - w / 2 + 40 + (w - 80) * Math.max(0, t - 0.15)} ${y + 70}`} stroke="#8A5A34" strokeWidth={8} strokeDasharray="22 12" />
      <path d={`M ${x - w / 2 + 40} ${y - 70} L ${x - w / 2 + 40 + (w - 80) * Math.max(0, t - 0.3)} ${y - 70}`} stroke="#8A5A34" strokeWidth={8} strokeDasharray="22 12" />
      {/* Nadel */}
      <g transform={`translate(${nx} ${y - 30 - up})`} filter="url(#sticker)">
        <path d="M -8 -260 L 8 -260 L 6 0 L 0 26 L -6 0 Z" fill={LUX.chrome} stroke={LUX.ink} strokeWidth={5} />
        <ellipse cx={0} cy={-230} rx={4} ry={14} fill={LUX.ink} />
        <rect x={-40} y={-330} width={80} height={80} rx={12} fill="#5A6070" stroke={LUX.ink} strokeWidth={5} />
      </g>
      <path d={`M ${nx} ${y - 40 - up - 230} Q ${nx + 60} ${y - 400} ${nx + 30} ${y - 520}`} stroke="#8A5A34" strokeWidth={4} fill="none" />
    </g>
  );
};

/** Papier-Landkarte mit Faden quer darüber (`t` 0..1) und Garnrolle. */
export const ThreadMap: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly f: number }> = ({ x, y, t, f }) => {
  const x0 = x - 380;
  const x1 = x + 380;
  const sx = x0 + (x1 - x0) * t;
  const wave = (px: number) => y + Math.sin((px - x0) * 0.018) * 60;
  const pts = Array.from({ length: 41 }, (_, i) => x0 + ((sx - x0) * i) / 40);
  return (
    <g>
      <g filter="url(#sticker)">
        <path d={`M ${x - 440} ${y - 260} L ${x - 150} ${y - 240} L ${x + 150} ${y - 270} L ${x + 440} ${y - 250} L ${x + 440} ${y + 250} L ${x + 150} ${y + 270} L ${x - 150} ${y + 240} L ${x - 440} ${y + 260} Z`} fill="#E7F0D2" stroke={LUX.ink} strokeWidth={7} />
        <path d={`M ${x - 150} ${y - 240} L ${x - 150} ${y + 240} M ${x + 150} ${y - 270} L ${x + 150} ${y + 270}`} stroke="#C9D3B2" strokeWidth={5} />
        <path d={`M ${x - 420} ${y + 160} Q ${x - 100} ${y + 40} ${x + 60} ${y + 200} T ${x + 420} ${y + 140}`} stroke="#F2C14E" strokeWidth={14} fill="none" />
        <path d={`M ${x - 300} ${y - 240} Q ${x - 200} ${y} ${x - 360} ${y + 240}`} stroke="#9CC3E6" strokeWidth={22} fill="none" />
        <circle cx={x + 250} cy={y - 140} r={60} fill="#B9D59A" />
      </g>
      <path d={pts.map((px, i) => `${i ? "L" : "M"} ${px} ${wave(px)}`).join(" ")} stroke={LUX.red} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* Garnrolle rollt mit */}
      <g transform={`translate(${sx} ${wave(sx) - 10}) rotate(${f * 12})`} filter="url(#sticker)">
        <rect x={-46} y={-60} width={92} height={120} rx={10} fill={LUX.red} stroke={LUX.ink} strokeWidth={6} />
        <rect x={-62} y={-72} width={124} height={22} rx={6} fill={LUX.wood} stroke={LUX.ink} strokeWidth={5} />
        <rect x={-62} y={50} width={124} height={22} rx={6} fill={LUX.wood} stroke={LUX.ink} strokeWidth={5} />
        <path d="M -40 -30 L 40 -20 M -40 0 L 40 10 M -40 30 L 40 40" stroke="#B02A33" strokeWidth={5} />
      </g>
      <Card x={x} y={y + 330} w={520} h={100} lines={["OVER 11 MILES"]} size={56} fill="#FFFFFF" o={Math.min(1, t * 3)} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Twist-Karten (stitch, bmw, wagon)                                    */
/* ------------------------------------------------------------------ */

/** Karte, die sich umdreht: `flip` 0 = Vorderseite (rot, „PLOT TWIST #n“), 1 = Rückseite (`back`). */
export const TwistCard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly n: number;
  readonly flip: number;
  readonly s?: number;
  readonly r?: number;
  readonly back?: React.ReactNode;
  readonly o?: number;
}> = ({ x, y, n, flip, s = 1, r = 0, back, o = 1 }) => {
  const a = Math.max(0, Math.min(1, flip)) * Math.PI;
  const sx = Math.cos(a);
  const front = sx >= 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s * Math.max(0.04, Math.abs(sx))} ${s})`} filter="url(#sticker)" opacity={o}>
      {front ? (
        <>
          <rect x={-200} y={-280} width={400} height={560} rx={28} fill="#D7263D" stroke={LUX.ink} strokeWidth={9} />
          <rect x={-170} y={-250} width={340} height={500} rx={18} fill="none" stroke="#FFB3BC" strokeWidth={6} strokeDasharray="18 12" />
          <text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={LUX.white}>
            PLOT
          </text>
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={LUX.white}>
            TWIST
          </text>
          <text x={0} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120} fill="#FFE14D" stroke={LUX.ink} strokeWidth={8} paintOrder="stroke">
            {`#${n}`}
          </text>
        </>
      ) : (
        <g transform="scale(-1 1)">
          <rect x={-200} y={-280} width={400} height={560} rx={28} fill={LUX.paper} stroke={LUX.ink} strokeWidth={9} />
          <g transform="scale(-1 1)">{back}</g>
        </g>
      )}
    </g>
  );
};

/** Glitch-Rot (Record-Scratch): versetzte rote Balken + Tönung, `k` 0..1. Bildraum (Layer depth 0). */
export const Glitch: React.FC<{ readonly k: number; readonly f: number }> = ({ k, f }) => {
  if (k <= 0.01) return null;
  const rnd = seeded(50 + Math.floor(f / 2));
  return (
    <g opacity={k}>
      <rect x={0} y={0} width={1080} height={1920} fill="#D7263D" opacity={0.28} />
      {Array.from({ length: 6 }, (_, i) => {
        const y = rnd() * 1300 + 100;
        return <rect key={i} x={-40 + (rnd() - 0.5) * 160} y={y} width={1160} height={10 + rnd() * 40} fill={i % 2 ? "#FF3B5C" : "#3BE8FF"} opacity={0.5} />;
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Draußen (hood, suite, bmw, wagon) + Goldbühne (ending)               */
/* ------------------------------------------------------------------ */

export const SunsetRoad: React.FC<{ readonly floor?: number }> = ({ floor = 1250 }) => (
  <>
    <Wash id="sunset" a="#FFB45E" b="#FFE0A3" y0={0} y1={floor} />
    <circle cx={780} cy={floor - 420} r={180} fill="#FFF1C4" opacity={0.85} />
    <path d={`M -2000 ${floor - 120} Q -400 ${floor - 300} 300 ${floor - 160} T 1600 ${floor - 200} T 4000 ${floor - 120} L 4000 ${floor} L -2000 ${floor} Z`} fill="#D98A5A" opacity={0.7} />
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#4A3A40" />
    <rect x={-2000} y={floor + 120} width={6000} height={16} fill="#F2E3C4" opacity={0.6} />
  </>
);

export const Lawn: React.FC<{ readonly floor?: number; readonly f: number }> = ({ floor = 1180, f }) => (
  <>
    <Wash id="lawn" a="#FFD08A" b="#FFEFC9" y0={0} y1={floor} />
    <path d={`M -2000 ${floor - 80} Q -500 ${floor - 260} 500 ${floor - 120} T 3000 ${floor - 100} L 3000 ${floor} L -2000 ${floor} Z`} fill="#8DBA6A" />
    {[-200, 260, 980, 1400].map((tx, i) => (
      <g key={tx} transform={`translate(${tx} ${floor - 150 - (i % 2) * 40})`} filter="url(#paperSoft)">
        <rect x={-12} y={-40} width={24} height={110} fill="#6A4A2E" />
        <circle cx={0} cy={-90} r={90 + (i % 2) * 20} fill="#5E9A50" stroke={LUX.ink} strokeWidth={5} />
      </g>
    ))}
    {/* Wimpelkette */}
    <path d={`M -200 ${420} Q 540 ${560} 1300 ${420}`} stroke={LUX.ink} strokeWidth={4} fill="none" />
    {Array.from({ length: 12 }, (_, i) => {
      const px = -150 + i * 120;
      const t = (px + 200) / 1500;
      const py = 420 + Math.sin(t * Math.PI) * 140 * 0.98;
      return <path key={i} d={`M ${px - 30} ${py} L ${px + 30} ${py} L ${px} ${py + 60 + Math.sin(f * 0.1 + i) * 5} Z`} fill={i % 2 ? LUX.gold : LUX.white} stroke={LUX.ink} strokeWidth={4} />;
    })}
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#6FA35A" />
    {Array.from({ length: 30 }, (_, i) => (
      <rect key={`s${i}`} x={-1200 + i * 160} y={floor} width={80} height={2000} fill="#7BB065" />
    ))}
  </>
);

/** Fabrik-Kulisse (generisch: langer flacher Bau mit Gründach im Grünen; keine Beschriftung). */
export const FactoryPark: React.FC<{ readonly floor?: number }> = ({ floor = 1160 }) => (
  <>
    <Wash id="uk" a="#A9C4DE" b="#DCE8F2" y0={0} y1={floor} />
    {[
      [-300, 220],
      [500, 180],
      [1300, 240],
    ].map(([cx, w]) => (
      <ellipse key={cx} cx={cx} cy={400} rx={w} ry={60} fill="#FFFFFF" opacity={0.8} />
    ))}
    <path d={`M -2000 ${floor - 300} Q -600 ${floor - 520} 400 ${floor - 340} T 2600 ${floor - 360} L 2600 ${floor} L -2000 ${floor} Z`} fill="#7FAF6A" />
    <g filter="url(#paper)">
      <rect x={-640} y={floor - 330} width={1900} height={250} fill="#E8E2D6" stroke={LUX.ink} strokeWidth={8} />
      <path d={`M -680 ${floor - 330} L 1300 ${floor - 330} L 1260 ${floor - 380} L -640 ${floor - 380} Z`} fill="#5E8A4E" stroke={LUX.ink} strokeWidth={7} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-600 + i * 132} y={floor - 290} width={96} height={150} fill="#7FA6C9" stroke={LUX.ink} strokeWidth={5} />
      ))}
    </g>
    <rect x={-2000} y={floor - 80} width={6000} height={2000} fill="#8FBF73" />
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#9A9AA6" />
    <rect x={-2000} y={floor} width={6000} height={10} fill={LUX.ink} opacity={0.4} />
  </>
);

/** Wüsten-Highway (scrollt mit `scroll` px). */
export const Highway: React.FC<{ readonly floor?: number; readonly scroll: number }> = ({ floor = 1150, scroll }) => {
  const m = (v: number, k: number) => ((((v - scroll * k) % 1600) + 1600) % 1600) - 400;
  return (
    <>
      <Wash id="desert" a="#7EC8F0" b="#D9F0FA" y0={0} y1={floor} />
      {[0, 800].map((ox) => (
        <path key={ox} transform={`translate(${m(ox, 0.15)} 0)`} d={`M -200 ${floor - 120} L -100 ${floor - 330} L 160 ${floor - 330} L 260 ${floor - 120} Z`} fill="#D9875A" stroke={LUX.ink} strokeWidth={6} />
      ))}
      <rect x={-2000} y={floor - 130} width={6000} height={140} fill="#E8C07A" />
      {/* generisches Straßenschild (Form/Farbe frei, kein echtes Verkehrszeichen) */}
      <g transform={`translate(${m(300, 0.6)} ${floor - 140})`} filter="url(#paperSoft)">
        <rect x={-6} y={-300} width={12} height={300} fill="#8A8F99" />
        <rect x={-130} y={-430} width={260} height={140} rx={16} fill="#2F7D4F" stroke={LUX.white} strokeWidth={8} />
        <text x={0} y={-345} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={LUX.white}>
          USA
        </text>
      </g>
      {[100, 900].map((ox) => (
        <g key={ox} transform={`translate(${m(ox, 0.6)} ${floor - 120})`}>
          <path d="M 0 0 L 0 -150 M 0 -90 Q -40 -90 -40 -130 M 0 -60 Q 34 -60 34 -110" stroke="#4E8A4A" strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <rect x={-2000} y={floor} width={6000} height={2000} fill="#4A4A55" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={m(i * 300, 1.6)} y={floor + 110} width={150} height={18} fill="#FFE14D" />
      ))}
    </>
  );
};

export const GoldStage: React.FC<{ readonly f: number; readonly floor?: number }> = ({ f, floor = 1150 }) => (
  <>
    <Wash id="stage" a="#2A1A0C" b="#6A4512" y1={floor} />
    {/* Vorhang */}
    {Array.from({ length: 16 }, (_, i) => (
      <path key={i} d={`M ${-600 + i * 150} -400 Q ${-525 + i * 150 + Math.sin(f * 0.05 + i) * 6} ${floor / 2} ${-600 + i * 150} ${floor}`} stroke="#7A1E2E" strokeWidth={70} fill="none" opacity={0.85} />
    ))}
    <rect x={-2000} y={floor} width={6000} height={2000} fill="#1E140A" />
    <ellipse cx={540} cy={floor + 30} rx={620} ry={70} fill={LUX.gold} opacity={0.35} />
    <rect x={-2000} y={floor} width={6000} height={8} fill={LUX.gold} />
  </>
);

/** Tuch über einem Auto (Enthüllung): `off` 0..1 fliegt nach oben rechts weg. */
export const Cloth: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly off: number }> = ({ x, y, s = 1, off }) => {
  if (off >= 1) return null;
  const dx = off * 900;
  const dy = -off * 700;
  return (
    <g transform={`translate(${x + dx} ${y + dy}) rotate(${off * 40}) scale(${s})`} filter="url(#sticker)" opacity={1 - off * 0.3}>
      <path d="M -540 0 Q -560 -160 -380 -220 Q -140 -330 40 -330 Q 180 -330 260 -230 Q 470 -220 500 -120 L 520 0 Q 380 -30 260 0 Q 120 -40 0 0 Q -140 -40 -280 0 Q -400 -30 -540 0 Z" fill="#B0213A" stroke={LUX.ink} strokeWidth={8} />
      <path d="M -300 -40 Q -260 -200 -200 -260 M 0 -20 Q 20 -200 60 -320 M 260 -30 Q 300 -150 300 -220" stroke="#8A1A2E" strokeWidth={8} fill="none" />
    </g>
  );
};

/** Formel-Kritzel um den Kopf (eigene Zeichnung, nur ASCII). */
export const MathScribbles: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly f: number }> = ({ x, y, t, f }) => {
  if (t <= 0) return null;
  const items = ["4 YRS", "= 1 MIN?", "$12.8M", "x + y = ?", "??", "4 > 1 ?"];
  return (
    <g>
      {items.map((txt, i) => {
        const a = (i / items.length) * Math.PI * 2 + f * 0.02;
        const k = Math.max(0, Math.min(1, t * 3 - i * 0.3));
        const rx = 330;
        const ry = 230;
        return (
          <text
            key={txt}
            x={x + Math.cos(a) * rx}
            y={y + Math.sin(a) * ry}
            textAnchor="middle"
            fontFamily={FONT}
            fontWeight={900}
            fontSize={46}
            fill="#FFFFFF"
            stroke={LUX.ink}
            strokeWidth={8}
            paintOrder="stroke"
            opacity={k}
            transform={`rotate(${(i % 2 ? 1 : -1) * 8} ${x + Math.cos(a) * rx} ${y + Math.sin(a) * ry})`}
          >
            {txt}
          </text>
        );
      })}
    </g>
  );
};

/** Rückspul-Effekt: VHS-Streifen + „<<“ (Geometrie). `k` 0..1. Bildraum. */
export const Rewind: React.FC<{ readonly k: number; readonly f: number }> = ({ k, f }) => {
  if (k <= 0) return null;
  const rnd = seeded(90 + Math.floor(f / 2));
  return (
    <g opacity={k}>
      <rect x={0} y={0} width={1080} height={1920} fill="#1A1630" opacity={0.25} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={0} y={rnd() * 1300 + 300} width={1080} height={4 + rnd() * 16} fill="#FFFFFF" opacity={0.35} />
      ))}
      <g transform="translate(860 560)" filter="url(#sticker)">
        <path d="M 0 -60 L -90 0 L 0 60 Z M 90 -60 L 0 0 L 90 60 Z" fill="#FFFFFF" stroke={LUX.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Haken-Kreis (grün, Stempel-Look) für „STEP 1“. */
export const CheckBurst: React.FC<{ readonly x: number; readonly y: number; readonly t: number; readonly s?: number }> = ({ x, y, t, s = 1 }) => {
  if (t <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + (1 - Math.min(1, t)) * 0.8)})`} filter="url(#sticker)" opacity={Math.min(1, t * 2)}>
      <circle r={70} fill="#FFFFFF" stroke={LUX.green} strokeWidth={12} />
      <Check x={0} y={0} s={1.2} t={Math.min(1, t * 1.4)} />
    </g>
  );
};

