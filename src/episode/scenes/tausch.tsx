import React from "react";
import { camPath, clamp01, ease, frameOn, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/tausch-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, Face, INK, P, Person, Street, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";
import { ReactBg } from "./suche";
import { Bed, Room } from "./akku";
import { CouchBack, CouchFront, Poof, Sparkle } from "./todo";
import { Clock, PovHand } from "./meckern";

/**
 * „In This City, on Black Friday, You Can Trade In Your Family“ (episodes/tausch-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Konsequenz = Tausch: Verwandte aufs Kassenband, roter Scanner-Laser piept, Poof → Gutschein. Stumm lesbar ab Bild 1.
 * Eine Text-Ebene (Untertitel); Schilder/Gutscheine zeigen nur Symbole (Familie → Münze, Socke, %).
 * Schnitte an Wort-Beats, kein Set > 2 am Stück (TAUSCH_SHOT_COUNT).
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.max(1, Math.round(x)));
  const i = shotIndex(f, c);
  const a = i === 0 ? 0 : c[i - 1];
  const b = i < c.length ? c[i] : d;
  return { i, lf: f - a, len: b - a };
};

const Shot: React.FC<{ readonly cam: Cam2D; readonly children: React.ReactNode }> = ({ cam, children }) => (
  <Stage2D cam={cam} mood="haze" noSky>
    {children}
  </Stage2D>
);

const push = (lf: number, len: number, wx: number, wy: number, z0: number, z1: number, sx = 540, sy = 900) =>
  camPath(lf, [
    [0, frameOn(wx, wy, sx, sy, z0)],
    [len, frameOn(wx, wy, sx, sy, z1)],
  ]);

const spring = (f: number, a: number, dur = 12) => {
  if (f < a) return 0;
  const t = clamp01((f - a) / dur);
  return 1 + Math.sin(t * Math.PI) * 0.25 * (1 - t);
};

const C = {
  guy: "#22B573",
  guyHair: "#1F1A2E",
  uncle: "#FF8A1F",
  sister: "#FF6FB5",
  mom: "#9A6BFF",
  clerk: "#E8323F",
  store: "#FFE066",
  storeDark: "#F2B705",
  belt: "#2E2A44",
  laser: "#FF1F3D",
  coupon: "#FFF4DE",
  credit: "#36D6FF",
  gold: "#F2B23A",
  night: "#1E2350",
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Guy: React.FC<Fig> = (p) => <Person pants="#2B2F45" {...p} shirt={C.guy} hair="curly" hairColor={C.guyHair} skin={p.skin ?? P.skin2} />;
const Uncle: React.FC<Fig> = (p) => <Person pants="#4A3B2A" stache glasses {...p} shirt={C.uncle} hair="none" hairColor="#000" skin={p.skin ?? P.skin} />;
const Sister: React.FC<Fig> = (p) => <Person pants="#3B3F66" {...p} shirt={C.sister} hair="pony" hairColor="#7A3E1E" skin={p.skin ?? P.skin} />;
const Mom: React.FC<Fig> = (p) => <Person pants="#3B2F55" cardigan {...p} shirt={C.mom} hair="bun" hairColor="#6B4A2E" skin={p.skin ?? P.skin} />;
const Clerk: React.FC<Fig> = (p) => <Person pants="#2B2F45" eyes="half" mouth="flat" {...p} shirt={C.clerk} hair="side" hairColor="#2E2A1E" skin={p.skin ?? P.skin3} />;

/** Kopf mit Haut + Gesicht (Face zeichnet nur die Züge). */
const Head: React.FC<React.ComponentProps<typeof Face>> = (p) => (
  <g>
    <circle r={p.r} fill={p.skin ?? P.skin} stroke={INK} strokeWidth={Math.max(6, p.r * 0.06)} />
    <Face {...p} />
  </g>
);

/** Liegende Person (auf dem Band): Figur um 90° gedreht, Kopf zeigt nach `dir`. */
const Lying: React.FC<{ readonly x: number; readonly y: number; readonly s: number; readonly dir?: 1 | -1; readonly children: (p: { x: number; y: number; s: number }) => React.ReactNode }> = ({
  x,
  y,
  s,
  dir = 1,
  children,
}) => <g transform={`translate(${x} ${y}) rotate(${dir * 90})`}>{children({ x: 0, y: 260 * s, s })}</g>;

/* ------------------------------------------------------------------ */
/* Requisiten                                                         */
/* ------------------------------------------------------------------ */

/** Gutschein mit Zackenrand + Symbol (Socke oder %). */
const Coupon: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly icon?: "sock" | "pct" }> = ({ x, y, s = 1, r = 0, icon = "sock" }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-150} y={-80} width={300} height={160} rx={14} fill={C.coupon} stroke={INK} strokeWidth={8} />
    <rect x={-130} y={-60} width={260} height={120} rx={8} fill="none" stroke={P.red} strokeWidth={5} strokeDasharray="14 10" />
    {icon === "sock" ? (
      <path d="M -20 -45 L 25 -45 L 25 10 Q 25 45 -10 45 L -55 45 Q -75 45 -75 25 Q -75 8 -55 8 L -20 8 Z" fill={P.red} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    ) : (
      <g stroke={P.red} strokeWidth={12} fill="none" strokeLinecap="round">
        <path d="M -40 40 L 40 -40" />
        <circle cx={-35} cy={-30} r={14} />
        <circle cx={35} cy={30} r={14} />
      </g>
    )}
    <path d="M 75 -45 L 75 45" stroke={INK} strokeWidth={4} strokeDasharray="8 8" />
  </g>
);

/** Leuchtende Guthaben-Karte. */
const CreditCard: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly glow?: number }> = ({ x, y, s = 1, r = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {glow > 0 ? <rect x={-210} y={-140} width={420} height={280} rx={50} fill={C.credit} opacity={0.35 * glow} /> : null}
    <rect x={-170} y={-105} width={340} height={210} rx={24} fill={C.credit} stroke={INK} strokeWidth={8} />
    <rect x={-170} y={-60} width={340} height={36} fill={INK} opacity={0.8} />
    <circle cx={110} cy={50} r={30} fill={C.gold} stroke={INK} strokeWidth={5} />
    <rect x={-140} y={30} width={150} height={20} rx={8} fill="#FFFFFF" opacity={0.8} />
  </g>
);

/** Schild über der Kasse: Familie → Pfeil → Münze (nur Symbole). */
const TradeSign: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.08) * 1.5})`}>
    <line x1={-200} y1={-220} x2={-200} y2={-110} stroke={INK} strokeWidth={6} />
    <line x1={200} y1={-220} x2={200} y2={-110} stroke={INK} strokeWidth={6} />
    <rect x={-300} y={-110} width={600} height={200} rx={24} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    {/* Familie: drei Köpfe */}
    {[
      [-225, -20, 34, C.mom],
      [-165, -8, 28, C.uncle],
      [-115, 4, 22, C.sister],
    ].map(([cx, cy, r, c]) => (
      <g key={String(cx)}>
        <circle cx={cx as number} cy={cy as number} r={r as number} fill={P.skin} stroke={INK} strokeWidth={5} />
        <rect x={(cx as number) - (r as number)} y={(cy as number) + (r as number)} width={(r as number) * 2} height={(r as number) * 1.4} rx={10} fill={c as string} stroke={INK} strokeWidth={5} />
      </g>
    ))}
    <path d="M -50 0 L 70 0 M 40 -30 L 75 0 L 40 30" stroke={P.red} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={180} cy={0} r={62} fill={C.gold} stroke={INK} strokeWidth={8} />
    <circle cx={180} cy={0} r={40} fill="none" stroke="#C98A1A" strokeWidth={6} />
  </g>
);

/** Kassenband mit laufenden Streifen; Oberkante y. */
const Belt: React.FC<{ readonly x0: number; readonly x1: number; readonly y: number; readonly f: number; readonly speed?: number }> = ({ x0, x1, y, f, speed = 6 }) => (
  <g>
    <rect x={x0} y={y + 40} width={x1 - x0} height={420} fill="#B9C0D4" stroke={INK} strokeWidth={9} />
    <rect x={x0} y={y} width={x1 - x0} height={60} rx={10} fill={C.belt} stroke={INK} strokeWidth={8} />
    {Array.from({ length: Math.ceil((x1 - x0) / 90) + 1 }).map((_, k) => {
      const xx = x0 + ((k * 90 + f * speed) % (x1 - x0 + 90)) - 45;
      return xx > x0 + 6 && xx < x1 - 6 ? <line key={k} x1={xx} y1={y + 8} x2={xx} y2={y + 52} stroke="#5A5577" strokeWidth={6} /> : null;
    })}
    <rect x={x0 + 40} y={y + 120} width={x1 - x0 - 80} height={24} rx={12} fill="#8C93AA" />
  </g>
);

/** Scanner-Glas mit rotem Laser-Fächer; on = 0..1. */
const Scanner: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly on: number; readonly f: number }> = ({ x, y, s = 1, on, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-30} width={240} height={50} rx={10} fill="#3A3F55" stroke={INK} strokeWidth={7} />
    <rect x={-90} y={-24} width={180} height={30} rx={6} fill="#7A1020" />
    {on > 0 ? (
      <g opacity={on * (0.75 + 0.25 * Math.sin(f * 1.3))}>
        {[-1, -0.5, 0, 0.5, 1].map((k) => (
          <line key={k} x1={0} y1={-20} x2={k * 260} y2={-520} stroke={C.laser} strokeWidth={8} strokeLinecap="round" />
        ))}
      </g>
    ) : null}
  </g>
);

/** Roter Laser-Punkt/Strich auf einer Stirn. */
const LaserDot: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly w?: number }> = ({ x, y, o, w = 160 }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 7} width={w} height={14} rx={7} fill={C.laser} />
      <circle cx={x} cy={y} r={24} fill={C.laser} opacity={0.4} />
    </g>
  );

/** Kasse mit Display (Symbol) */
const Register: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly show?: "sock" | "card" | "none"; readonly o?: number }> = ({ x, y, s = 1, show = "none", o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-120} width={300} height={170} rx={16} fill="#5B6BD6" stroke={INK} strokeWidth={8} />
    <rect x={-120} y={-100} width={240} height={110} rx={10} fill="#0E1A2E" />
    <g opacity={o}>
      {show === "sock" ? <path d="M -15 -85 L 25 -85 L 25 -30 Q 25 -5 0 -5 L -45 -5 Q -60 -5 -60 -20 Q -60 -35 -45 -35 L -15 -35 Z" fill="#7CFF9B" /> : null}
      {show === "card" ? <rect x={-60} y={-80} width={120} height={70} rx={10} fill={C.credit} /> : null}
    </g>
    <rect x={-160} y={50} width={320} height={40} rx={10} fill="#3E4AA8" stroke={INK} strokeWidth={7} />
  </g>
);

/** Einkaufswagen; Ursprung = Räder-Mitte unten. */
const Cart: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly children?: React.ReactNode; readonly flip?: boolean }> = ({ x, y, s = 1, children, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {children}
    <path d="M -200 -330 L 200 -330 L 160 -90 L -160 -90 Z" fill="#DDE6F5" fillOpacity={0.55} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {[-120, -40, 40, 120].map((xx) => (
      <line key={xx} x1={xx} y1={-325} x2={xx * 0.85} y2={-95} stroke={INK} strokeWidth={4} opacity={0.6} />
    ))}
    <path d="M 200 -330 L 260 -400 L 320 -400" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M -150 -90 L -150 -30 L 150 -30" stroke={INK} strokeWidth={9} fill="none" />
    <circle cx={-130} cy={-14} r={18} fill={INK} />
    <circle cx={130} cy={-14} r={18} fill={INK} />
  </g>
);

/** Vertrag (Rolle) mit Kritzel-Zeilen, rollt über `roll` 0..1 nach unten aus. */
const Contract: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly roll: number; readonly r?: number }> = ({ x, y, s = 1, roll, r = 0 }) => {
  const h = 200 + roll * 1300;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <rect x={-200} y={0} width={400} height={h} fill="#FFFDF4" stroke={INK} strokeWidth={8} />
      {Array.from({ length: Math.floor(h / 26) }).map((_, k) => (
        <path key={k} d={`M -170 ${30 + k * 26} q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} stroke="#8C93AA" strokeWidth={4} fill="none" />
      ))}
      <ellipse cx={0} cy={h} rx={210} ry={34} fill="#F2EBD6" stroke={INK} strokeWidth={8} />
    </g>
  );
};

/** Preisschild „-70 %“-Symbol (nur Zeichen) an einer Schnur. */
const Tag: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 0 -60 L 0 -10" stroke={INK} strokeWidth={5} />
    <path d="M -70 -10 L 70 -10 L 70 120 L -70 120 Z" fill={P.red} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <circle cx={0} cy={10} r={9} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    <g stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round">
      <path d="M -30 100 L 30 40" />
      <circle cx={-26} cy={48} r={10} />
      <circle cx={26} cy={92} r={10} />
    </g>
  </g>
);

/** Golden Retriever im Pullover (seitlich, blickt nach links). */
const Dog: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly flip?: boolean }> = ({ x, y, s = 1, f, flip }) => {
  const wag = Math.sin(f * 0.8) * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M 150 -170 Q 230 ${-230 + wag} 260 ${-260 + wag}`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M 150 -170 Q 230 ${-230 + wag} 260 ${-260 + wag}`} stroke={C.gold} strokeWidth={22} fill="none" strokeLinecap="round" />
      {[-110, -40, 60, 130].map((xx) => (
        <rect key={xx} x={xx - 18} y={-120} width={36} height={120} rx={16} fill={C.gold} stroke={INK} strokeWidth={6} />
      ))}
      <ellipse cx={20} cy={-180} rx={170} ry={90} fill={C.gold} stroke={INK} strokeWidth={8} />
      <path d="M -120 -230 Q 20 -290 150 -230 L 150 -130 Q 20 -90 -120 -130 Z" fill={P.red} stroke={INK} strokeWidth={7} />
      <path d="M -100 -200 L 130 -200 M -100 -160 L 130 -160" stroke="#FFFFFF" strokeWidth={8} opacity={0.8} />
      <circle cx={-170} cy={-290} r={90} fill={C.gold} stroke={INK} strokeWidth={8} />
      <ellipse cx={-250} cy={-265} rx={55} ry={40} fill="#F7D08A" stroke={INK} strokeWidth={6} />
      <circle cx={-295} cy={-280} r={16} fill={INK} />
      <path d="M -150 -280 Q -110 -220 -130 -180" stroke="#C98A1A" strokeWidth={30} fill="none" strokeLinecap="round" />
      <circle cx={-195} cy={-320} r={14} fill={INK} />
      <circle cx={-200} cy={-325} r={5} fill="#FFFFFF" />
      <path d="M -250 -235 Q -235 -205 -215 -230" fill="#FF8FA8" stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** Restposten-Regal (Ursprung = Bodenmitte). */
const ClearanceShelf: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-330} y={-900} width={660} height={900} fill="#C9CFE0" stroke={INK} strokeWidth={9} />
    {[-620, -330].map((yy) => (
      <rect key={yy} x={-340} y={yy} width={680} height={36} fill="#8C93AA" stroke={INK} strokeWidth={7} />
    ))}
    <rect x={-340} y={-36} width={680} height={36} fill="#8C93AA" stroke={INK} strokeWidth={7} />
    {/* Restkartons */}
    <rect x={-300} y={-720} width={130} height={100} fill="#D9A066" stroke={INK} strokeWidth={6} transform="rotate(-8 -235 -670)" />
    <rect x={160} y={-430} width={140} height={100} fill="#D9A066" stroke={INK} strokeWidth={6} />
    <Tag x={-200} y={-290} s={0.8} r={-8} />
  </g>
);

/** Truthahn auf Platte. */
const Turkey: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={230} ry={46} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <path d="M -170 0 Q -180 -170 0 -170 Q 180 -170 170 0 Z" fill="#C8783A" stroke={INK} strokeWidth={8} />
    <path d="M -150 -40 L -230 -110 M 150 -40 L 230 -110" stroke="#C8783A" strokeWidth={36} strokeLinecap="round" />
    <circle cx={-235} cy={-115} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <circle cx={235} cy={-115} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <ellipse cx={-50} cy={-120} rx={50} ry={18} fill="#E89A5A" />
  </g>
);

/** Krypto-Handy mit grüner Raketen-Kurve. */
const CryptoPhone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly f: number }> = ({ x, y, s = 1, r = 0, f }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-70} y={-130} width={140} height={260} rx={20} fill={INK} />
    <rect x={-58} y={-115} width={116} height={230} rx={12} fill="#0E1A2E" />
    <path d={`M -45 80 L -20 50 L 0 65 L 20 ${10 - Math.sin(f * 0.3) * 10} L 45 -80`} stroke="#3DFF7A" strokeWidth={9} fill="none" strokeLinejoin="round" />
    <path d="M 30 -80 L 45 -80 L 45 -65" stroke="#3DFF7A" strokeWidth={9} fill="none" />
    <path d="M -20 -60 l 14 -30 l 14 30 z" fill="#FFFFFF" />
  </g>
);

/* ------------------------------------------------------------------ */
/* Kulissen                                                           */
/* ------------------------------------------------------------------ */

/** Kaufhaus-Halle: gelbe Wand, Deckenlampen, Regale mit %-Wimpeln. */
const StoreHall: React.FC<{ readonly f: number; readonly wall?: string; readonly shelf?: boolean }> = ({ f, wall = C.store, shelf = true }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3450} fill={wall} />
    <rect x={-2000} y={1450} width={5000} height={2000} fill="#E9E2CF" />
    {Array.from({ length: 14 }).map((_, k) => (
      <line key={k} x1={-600 + k * 180} y1={1450} x2={-1400 + k * 300} y2={2600} stroke="#CFC6AD" strokeWidth={5} />
    ))}
    {[-200, 300, 800, 1300].map((x) => (
      <g key={x}>
        <rect x={x - 120} y={100} width={240} height={30} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
        <path d={`M ${x - 140} 130 L ${x + 140} 130 L ${x + 260} 420 L ${x - 260} 420 Z`} fill="#FFFFFF" opacity={0.18} />
      </g>
    ))}
    {/* Wimpel-Kette */}
    <path d="M -300 230 Q 540 330 1380 230" stroke={INK} strokeWidth={5} fill="none" />
    {Array.from({ length: 9 }).map((_, k) => {
      const x = -200 + k * 180;
      const y = 250 + Math.sin((k / 8) * Math.PI) * 70;
      return <path key={k} d={`M ${x - 40} ${y} L ${x + 40} ${y} L ${x} ${y + 80 + Math.sin(f * 0.1 + k) * 6} Z`} fill={k % 2 ? P.red : "#FFFFFF"} stroke={INK} strokeWidth={5} />;
    })}
    {shelf ? (
      <g>
        {[-260, 1340].map((x) => (
          <g key={x}>
            <rect x={x - 220} y={500} width={440} height={950} fill="#9FB4FF" stroke={INK} strokeWidth={8} />
            {[700, 950, 1200].map((yy) => (
              <g key={yy}>
                <rect x={x - 230} y={yy} width={460} height={26} fill="#5B6BD6" stroke={INK} strokeWidth={6} />
                {[-150, -40, 70, 170].map((bx, j) => (
                  <rect key={bx} x={x + bx - 40} y={yy - 110 + (j % 2) * 20} width={80} height={110 - (j % 2) * 20} fill={[P.pink, P.lime, P.orange, P.teal][j]} stroke={INK} strokeWidth={5} />
                ))}
              </g>
            ))}
          </g>
        ))}
      </g>
    ) : null}
  </g>
);

/** Die Kasse aus Bild 1 (Band, Scanner, Kasse, Schild). Kassierer optional. */
const Checkout: React.FC<{ readonly f: number; readonly laser: number; readonly show?: "sock" | "card" | "none"; readonly clerk?: boolean; readonly bg?: boolean }> = ({
  f,
  laser,
  show = "none",
  clerk = true,
  bg = true,
}) => (
  <g>
    {bg ? <StoreHall f={f} /> : null}
    {/* eingepflanzt: Restposten-Regal mit traurigem Mann hinten links */}
    {bg ? (
      <g transform="translate(380 1000) scale(0.42)">
        <ClearanceShelf x={0} y={900} />
        <Person x={-60} y={570} s={0.85} seated shirt={P.grey} hair="side" hairColor="#555" eyes="half" brows="sad" mouth="frown" />
        <Tag x={140} y={170} s={1} r={10} />
      </g>
    ) : null}
    <TradeSign x={700} y={560} s={0.8} f={f} />
    {clerk ? <Clerk x={860} y={1290} s={0.95} armL={60} bendL={-30} /> : null}
    <Register x={860} y={1200} s={0.9} show={show} o={show === "none" ? 0 : 1} />
    <Belt x0={-300} x1={760} y={1250} f={f} />
    <Scanner x={640} y={1262} on={laser} f={f} />
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

/** Bild 1: Typ schiebt den Onkel aufs Band, Laser piept auf der Stirn, Poof → Gutschein. */
const HookCounter: React.FC<{ readonly lf: number; readonly f: number }> = ({ lf, f }) => {
  const slide = ease(lf, 4, 26);
  const zap = lf >= 28 ? 1 : 0;
  const gone = lf >= 40;
  const ux = lerp(60, 360, slide);
  return (
    <g>
      <Checkout f={f} laser={zap} show={gone ? "sock" : "none"} />
      {!gone ? (
        <Lying x={ux} y={1180} s={0.9} dir={1}>
          {(p) => <Uncle {...p} eyes={zap ? "xx" : "wide"} brows="angry" mouth="scream" open={0.6} armL={160} armR={160} />}
        </Lying>
      ) : (
        <Coupon x={520} y={1180} s={spring(lf, 40, 10) * 0.9} r={-6} />
      )}
      <LaserDot x={ux + 140} y={1180} o={zap && !gone ? 1 : 0} w={30} />
      <Poof x={500} y={1150} t={lf - 38} s={0.8} />
      {/* der Typ schiebt, grinst */}
      <Guy x={lerp(-330, -40, slide)} y={1450} s={1.0} lean={14} armR={95} bendR={-20} armL={95} bendL={-20} eyes="squint" brows="angry" mouth="grin" />
    </g>
  );
};

export const SHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const family = W("family", 0.82);
  const { i, lf, len } = useShot([family - 3], d, f);
  if (i === 0) {
    return (
      <Shot cam={push(lf, len, 470, 1020, 1.05, 1.14, 540, 900)}>
        <Layer>
          <HookCounter lf={f} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Totale: riesige Halle, Schlange mit Verwandten im Einkaufswagen
  return (
    <Shot cam={push(lf, len, 540, 1000, 0.8, 0.86, 540, 880)}>
      <Layer>
        <StoreHall f={f} shelf={false} />
        <TradeSign x={540} y={430} s={1.1} f={f} />
        {[0, 1, 2, 3].map((k) => {
          const x = -100 + k * 360 + ((f * 2) % 40);
          const kids = [Granny4, Uncle4, Sister4, Mom4][k];
          return (
            <g key={k}>
              <Cart x={x + 150} y={1500} s={0.85}>
                {kids(f + k * 7)}
              </Cart>
              <Person x={x - 120} y={1500} s={0.85} shirt={[P.teal, P.purple, P.orange, P.lime][k]} hair={(["spiky", "bun", "side", "curly"] as const)[k]} hairColor="#3A2A1E" mouth="grin" eyes="squint" armR={80} bendR={-10} />
            </g>
          );
        })}
        <Burst x={540} y={980} r0={500} r1={500 + 200 * ease(lf, 0, 8)} n={14} o={1 - ease(lf, 6, 16)} color="#FFFFFF" />
      </Layer>
    </Shot>
  );
};

/** Verwandte im Wagen (Kopf + Schultern ragen heraus). */
const InCart: React.FC<{ readonly f: number; readonly fig: (p: { x: number; y: number; s: number }) => React.ReactNode }> = ({ fig }) => <g>{fig({ x: 0, y: -40, s: 0.8 })}</g>;
const Granny4 = (f: number) => (
  <InCart f={f} fig={(p) => <Person {...p} shirt={P.cream} cardigan hair="bun" hairColor="#F2F2F2" skin="#F2C7A5" eyes="closed" mouth="o" open={0.2} />} />
);
const Uncle4 = (f: number) => <InCart f={f} fig={(p) => <Uncle {...p} eyes="wide" brows="angry" mouth="talk" open={Math.abs(Math.sin(f * 0.4)) * 0.5} />} />;
const Sister4 = (f: number) => <InCart f={f} fig={(p) => <Sister {...p} eyes="rolled" mouth="flat" armL={150} />} />;
const Mom4 = (f: number) => <InCart f={f} fig={(p) => <Mom {...p} eyes="open" brows="angry" mouth="talk" open={Math.abs(Math.sin(f * 0.5)) * 0.5} finger />} />;

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const SRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const no = W("No", 0.6);
  const { i, lf, len } = useShot([no - 2], d, f);
  if (i === 0) {
    // Rückgabe-Theke (pink): Frau hievt ihren erwachsenen Bruder in Luftpolsterfolie auf die Theke
    const lift = ease(lf, 0, 18);
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.1, 1.18, 540, 880)}>
        <Layer>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#FF9BC8" />
          <rect x={-2000} y={1300} width={5000} height={2000} fill="#E86FA4" />
          <rect x={-100} y={1150} width={1300} height={300} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
          <path d="M 420 520 L 660 520 L 660 640 L 540 600 L 420 640 Z" fill={P.red} stroke={INK} strokeWidth={7} />
          <path d="M 470 580 Q 540 530 610 580 M 590 560 L 612 582 L 588 600" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
          <Clerk x={880} y={1180} s={0.9} mouth="smug" />
          <g transform={`translate(${lerp(300, 520, lift)} ${lerp(1250, 1120, lift)})`}>
            <ellipse cx={0} cy={-90} rx={210} ry={130} fill="#DDF3FF" fillOpacity={0.75} stroke={INK} strokeWidth={6} />
            {Array.from({ length: 12 }).map((_, k) => (
              <circle key={k} cx={-160 + (k % 6) * 64} cy={-150 + Math.floor(k / 6) * 90} r={16} fill="none" stroke="#9CC9E6" strokeWidth={4} />
            ))}
            <Head r={80} eyes="wide" brows="worried" mouth="scream" open={0.7} />
          </g>
          <Sister x={lerp(120, 250, lift)} y={1500} s={1.0} lean={8} armR={130} bendR={-30} armL={120} bendL={-20} eyes="squint" brows="angry" mouth="grin" />
          <Sweat x={560} y={960} s={1.2} />
        </Layer>
      </Shot>
    );
  }
  // Nah: Opa schläft im Wagen, Verkäufer knallt den Stempel auf die Stirn
  const stamp = ease(lf, 6, 12);
  return (
    <Shot cam={push(lf, len, 540, 900, 1.3, 1.38, 540, 860)}>
      <Layer depth={0.5}>
        <ReactBg a="#7ED6C8" b="#A6EBDF" f={f} cx={540} cy={900} />
      </Layer>
      <Layer>
        <Cart x={460} y={1450} s={1.3}>
          <Person x={0} y={-40} s={0.95} shirt={P.grey} hair="none" hairColor="#fff" stache skin="#F2C7A5" eyes="closed" mouth="o" open={0.25} />
        </Cart>
        <g transform={`translate(560 ${lerp(500, 740, stamp)})`}>
          <rect x={-50} y={-180} width={100} height={150} rx={20} fill="#8E4F22" stroke={INK} strokeWidth={7} />
          <rect x={-90} y={-40} width={180} height={50} rx={10} fill={P.red} stroke={INK} strokeWidth={7} />
        </g>
        {lf > 12 ? <path d="M 400 785 L 420 765 L 440 785 L 460 765 L 480 785" stroke={P.red} strokeWidth={0} /> : null}
        {lf > 12 ? <circle cx={460} cy={790} r={34} fill="none" stroke={P.red} strokeWidth={8} /> : null}
        <Burst x={560} y={760} r0={70} r1={70 + 120 * ease(lf, 12, 18)} n={10} o={1 - ease(lf, 18, 28)} />
        <Clerk x={880} y={1500} s={1.1} armL={150} bendL={-20} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* guy                                                                */
/* ================================================================== */

export const SGuy: React.FC = () => {
  const { f, d, W } = useBeats();
  const his = W("His", 0.45);
  const { i, lf, len } = useShot([his - 2], d, f);
  if (i === 0) {
    // Thanksgiving-Tisch: unser Typ starrt mit toten Augen auf den Truthahn
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.05, 1.13, 540, 880)}>
        <Layer>
          <Room wall="#FFB86B" floor={1500} />
          <rect x={700} y={420} width={300} height={360} rx={16} fill={C.night} stroke={INK} strokeWidth={8} />
          <circle cx={900} cy={520} r={40} fill="#FFF4C2" />
          {/* Familienfoto an der Wand (Hintergrund-Gag: er ist ausgeschnitten) */}
          <g transform="translate(220 560)">
            <rect x={-130} y={-110} width={260} height={220} rx={10} fill="#FFF4DE" stroke={INK} strokeWidth={6} />
            <circle cx={-60} cy={-10} r={30} fill={P.skin} stroke={INK} strokeWidth={4} />
            <circle cx={60} cy={-10} r={30} fill={P.skin} stroke={INK} strokeWidth={4} />
            <rect x={-20} y={-50} width={40} height={110} fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeDasharray="8 6" />
          </g>
          <Guy x={540} y={1280} s={1.05} seated eyes="half" look={[0, 0.6]} brows="sad" mouth="flat" bags={1} />
          <rect x={-100} y={1250} width={1300} height={60} rx={14} fill="#B97A45" stroke={INK} strokeWidth={8} />
          <rect x={-100} y={1310} width={1300} height={300} fill="#8E5A2E" stroke={INK} strokeWidth={8} />
          <Turkey x={540} y={1245} s={0.7} />
          <Uncle x={980} y={1330} s={0.9} seated eyes="wide" brows="up" mouth="talk" open={Math.abs(Math.sin(f * 0.5)) * 0.5} armL={150} bendL={-40} />
        </Layer>
      </Shot>
    );
  }
  // Onkel nah mit Krypto-Handy, Uhr dreht durch, die Seele des Typen verlässt den Körper
  const spin = lf * 0.6;
  const soul = ease(lf, 20, len);
  return (
    <Shot cam={push(lf, len, 540, 900, 1.15, 1.22, 540, 860)}>
      <Layer depth={0.5}>
        <ReactBg a="#3DDC84" b="#9BF0B8" f={f} cx={540} cy={800} />
      </Layer>
      <Layer>
        <Clock x={840} y={420} s={0.5} h={(spin / 12) % 12} m={(spin * 4) % 60} />
        <Uncle x={420} y={1500} s={1.25} eyes="wide" brows="up" mouth="scream" open={0.4 + Math.abs(Math.sin(f * 0.6)) * 0.4} armR={150} bendR={-50} gest={10} />
        <CryptoPhone x={690} y={720} s={1.3} r={12} f={f} />
        <g transform="translate(800 1130)">
          <Head r={100} eyes="closed" brows="sad" mouth="flat" skin={P.skin2} />
          <g opacity={0.55 * (1 - soul * 0.3)} transform={`translate(0 ${-soul * 420})`}>
            <path d="M -60 -40 Q -70 -170 0 -180 Q 70 -170 60 -40 Q 30 -10 0 -40 Q -30 -10 -60 -40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
            <circle cx={-18} cy={-120} r={8} fill={INK} />
            <circle cx={18} cy={-120} r={8} fill={INK} />
          </g>
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* line                                                               */
/* ================================================================== */

export const SLine: React.FC = () => {
  const { f, d, W } = useBeats();
  const drag = W("dragging", 0.55);
  const { i, lf, len } = useShot([drag - 2], d, f);
  if (i === 0) {
    // Morgengrauen, leerer Parkplatz, er steht allein vor den Türen, Atemwölkchen
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.95, 1.05, 540, 880)}>
        <Layer>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.night} />
          <rect x={-2000} y={300} width={5000} height={500} fill="#3A3F8A" opacity={0.7} />
          <rect x={60} y={450} width={960} height={1000} fill="#5B5F73" stroke={INK} strokeWidth={9} />
          <rect x={300} y={820} width={480} height={630} fill="#FFE066" stroke={INK} strokeWidth={9} />
          <line x1={540} y1={820} x2={540} y2={1450} stroke={INK} strokeWidth={8} />
          <rect x={220} y={520} width={640} height={200} rx={20} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
          <g transform="translate(540 620) scale(0.55)">
            <TradeSign x={0} y={0} s={1} f={f} />
          </g>
          <rect x={-2000} y={1450} width={5000} height={2000} fill="#3B3F55" />
          {[100, 400, 700, 1000].map((x) => (
            <rect key={x} x={x} y={1600} width={180} height={16} fill="#FFFFFF" opacity={0.6} />
          ))}
          <Guy x={540} y={1450} s={1.0} eyes="open" look={[0, -1]} brows="up" mouth="grin" armL={20} armR={20} />
          {[0, 1].map((k) => {
            const t = (f + k * 20) % 40;
            return <circle key={k} cx={600 + t * 3} cy={950 - t * 4} r={20 + t} fill="#FFFFFF" opacity={0.5 * (1 - t / 40)} />;
          })}
          {Array.from({ length: 20 }).map((_, k) => (
            <circle key={k} cx={(k * 173) % 1080} cy={(k * 97 + f * 3) % 1450} r={5} fill="#FFFFFF" opacity={0.7} />
          ))}
        </Layer>
      </Shot>
    );
  }
  // Seitlich: er zieht den schlafenden Onkel am Knöchel über den Asphalt (Kratzspuren)
  const x = lerp(760, 520, ease(lf, 0, len, "linear"));
  return (
    <Shot cam={push(lf, len, 540, 1050, 1.0, 1.06, 540, 900)}>
      <Layer>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#4A4F9A" />
        <rect x={-2000} y={1300} width={5000} height={2000} fill="#3B3F55" />
        {[-100, 300, 700, 1100].map((xx) => (
          <rect key={xx} x={xx + ((f * 4) % 400)} y={1400} width={180} height={14} fill="#FFFFFF" opacity={0.5} />
        ))}
        <path d={`M ${x - 40} 1330 L 1300 1330`} stroke="#8C93AA" strokeWidth={10} strokeDasharray="30 20" />
        <Guy x={x} y={1330} s={1.0} lean={-16} flip armR={60} bendR={0} armL={60} eyes="squint" brows="angry" mouth="grin" />
        <Lying x={x + 140} y={1250} s={0.9} dir={-1}>
          {(p) => <Uncle {...p} eyes="closed" mouth="o" open={0.3} armL={170} armR={170} />}
        </Lying>
        <text x={x + 520} y={1120} fontSize={64} fontWeight={900} fill="#FFFFFF" opacity={0.8} fontFamily="Arial Black, sans-serif">
          z
        </text>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* scan                                                               */
/* ================================================================== */

export const SScan: React.FC = () => {
  const { f, d, W } = useBeats();
  const socks = W("socks", 0.75);
  // Extrem nah: Laser auf der Onkel-Stirn, dann Kassendisplay mit Socke, Gutschein springt heraus
  const zap = f > 4 ? 1 : 0;
  const out = f >= socks - 4;
  return (
    <Shot cam={push(f, d, 540, 860, 1.2, 1.3, 540, 860)}>
      <Layer depth={0.5}>
        <ReactBg a="#FF4D5E" b="#FF8C96" f={f} cx={540} cy={860} />
      </Layer>
      <Layer>
        {!out ? (
          <g transform="translate(540 860)">
            <Head r={260} eyes="xx" brows="angry" mouth="o" open={0.4} />
            <path d="M -170 -150 Q 0 -230 170 -150" fill="none" stroke="#000" strokeWidth={0} />
            <rect x={-120} y={-210} width={240} height={0} />
            <path d="M -200 -60 L -120 -60 M 120 -60 L 200 -60" stroke={INK} strokeWidth={0} />
            <path d="M -110 60 Q 0 120 110 60" stroke="#5A3A2A" strokeWidth={34} fill="none" strokeLinecap="round" />
            <LaserDot x={0} y={-150} o={zap} w={520} />
          </g>
        ) : (
          <g>
            <Register x={540} y={900} s={2.2} show="sock" />
            <Coupon x={540} y={lerp(900, 560, ease(f, socks - 4, socks + 6))} s={spring(f, socks - 4, 12) * 1.3} r={-8} />
            <Sparkle x={300} y={500} t={f - socks} s={1.2} />
            <Sparkle x={800} y={620} t={f - socks - 4} s={1} />
          </g>
        )}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* sister                                                             */
/* ================================================================== */

export const SSister: React.FC = () => {
  const { f, d, W } = useBeats();
  const steal = W("steal", 0.75);
  const { i, lf, len } = useShot([W("Low-key", 0.6) - 2], d, f);
  if (i === 0) {
    // Band: Schwester mit Brötchen-Backen fährt aufs Band, Krümel fliegen
    return (
      <Shot cam={push(lf, len, 420, 1080, 1.25, 1.32, 540, 880)}>
        <Layer>
          <Checkout f={f} laser={lf > len - 14 ? 1 : 0} clerk={false} />
          <Lying x={lerp(80, 380, ease(lf, 0, len))} y={1180} s={0.9} dir={-1}>
            {(p) => <Sister {...p} eyes="rolled" brows="angry" mouth="pucker" blush armL={170} armR={150} />}
          </Lying>
          {Array.from({ length: 6 }).map((_, k) => (
            <circle key={k} cx={lerp(80, 380, ease(lf, 0, len)) - 310 + k * 22} cy={1110 - ((lf * (3 + k)) % 90)} r={8} fill="#E0A35A" stroke={INK} strokeWidth={3} />
          ))}
        </Layer>
      </Shot>
    );
  }
  // Reaktion: Geschenkkarte – er jubelt mit Faust
  return (
    <Shot cam={push(lf, len, 540, 960, 1.05, 1.12, 540, 900)}>
      <Layer depth={0.5}>
        <ReactBg a="#FF8FC7" b="#FFC2E0" f={f} cx={540} cy={900} />
      </Layer>
      <Layer>
        <Guy x={480} y={1500} s={1.25} eyes="squint" brows="up" mouth="grin" armR={170} bendR={-10} armL={30} bendL={70} />
        <CreditCard x={760} y={620} s={spring(f, steal - 4, 12) * 0.8} r={10} glow={1} />
        <Sparkle x={860} y={460} t={f - steal} s={1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* mom                                                                */
/* ================================================================== */

export const SMom: React.FC = () => {
  const { f, d, W } = useBeats();
  const store = W("store", 0.6);
  const { i, lf, len } = useShot([store - 6], d, f);
  if (i === 0) {
    // Band nah: Mama auf dem Band, Zeigefinger, meckert weiter
    return (
      <Shot cam={push(lf, len, 500, 1060, 1.45, 1.52, 540, 900)}>
        <Layer>
          <Checkout f={f} laser={0} clerk={false} />
          <Lying x={420} y={1180} s={0.9} dir={-1}>
            {(p) => <Mom {...p} eyes="open" brows="angry" mouth="talk" open={Math.abs(Math.sin(f * 0.5)) * 0.6} armL={150} armR={150} />}
          </Lying>
          <Guy x={130} y={1460} s={0.95} eyes="half" brows="angry" mouth="flat" armL={20} armR={20} />
        </Layer>
      </Shot>
    );
  }
  // Poof: Mama wird zur leuchtenden Guthaben-Karte (blau)
  const t = lf;
  return (
    <Shot cam={push(lf, len, 540, 900, 1.1, 1.18, 540, 880)}>
      <Layer depth={0.5}>
        <ReactBg a="#2F8CFF" b="#7FC4FF" f={f} cx={540} cy={900} />
      </Layer>
      <Layer>
        {t < 6 ? <Mom x={540} y={1300} s={1.1} eyes="wide" brows="up" mouth="o" open={0.6} /> : <CreditCard x={540} y={900} s={spring(t, 6, 12) * 1.5} r={-6} glow={1} />}
        <Poof x={540} y={900} t={t - 4} s={1.2} />
        {/* Mini-Dutt + Zeigefinger auf der Karte (Gag) */}
        {t >= 6 ? <circle cx={540 + 40} cy={900 - 190} r={34} fill="#6B4A2E" stroke={INK} strokeWidth={6} /> : null}
        <Sparkle x={250} y={560} t={t - 8} s={1.1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* print                                                              */
/* ================================================================== */

export const SPrint: React.FC = () => {
  const { f, d, W } = useBeats();
  const bro = W("Bro", 0.65);
  const { i, lf, len } = useShot([bro - 2], d, f);
  if (i === 0) {
    // Verkäufer mit toten Augen schiebt einen Vertrag rüber, der bis zum Boden ausrollt
    return (
      <Shot cam={push(lf, len, 540, 900, 1.15, 1.22, 540, 860)}>
        <Layer>
          <StoreHall f={f} />
          <rect x={-200} y={1100} width={1500} height={420} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
          <Clerk x={540} y={1100} s={1.15} eyes="half" look={[0, 0.3]} mouth="smug" armR={60} bendR={-40} />
          <Contract x={380} y={1080} s={0.7} roll={ease(lf, 6, len)} r={-4} />
        </Layer>
      </Shot>
    );
  }
  // Er unterschreibt blind, Stift fliegt weg
  const fly = ease(lf, 10, 22);
  return (
    <Shot cam={push(lf, len, 540, 960, 1.15, 1.2, 540, 880)}>
      <Layer depth={0.5}>
        <ReactBg a="#FFC94D" b="#FFE699" f={f} cx={540} cy={800} />
      </Layer>
      <Layer>
        <Guy x={540} y={1550} s={1.3} eyes="closed" brows="up" mouth="smug" armR={140} bendR={-60} />
        <Contract x={540} y={1180} s={0.9} roll={0.25} r={90} />
        <g transform={`translate(${lerp(760, 1200, fly)} ${lerp(1050, 300, fly)}) rotate(${fly * 720})`}>
          <rect x={-10} y={-90} width={20} height={180} rx={8} fill="#2F6FD6" stroke={INK} strokeWidth={5} />
        </g>
        <path d="M 500 1210 q 30 -40 60 0 t 60 0 t 60 -10" stroke="#2F6FD6" strokeWidth={9} fill="none" opacity={ease(lf, 0, 10)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* deluxe                                                             */
/* ================================================================== */

/** Zu perfekte Deluxe-Figur (glänzende Haut, Grinsen, Funkeln). */
const Shiny: React.FC<{ readonly children: React.ReactNode; readonly x: number; readonly y: number; readonly f: number }> = ({ children, x, y, f }) => (
  <g>
    {children}
    <Sparkle x={x + 90} y={y - 480} t={(f % 30) + 2} s={0.6} />
  </g>
);

export const SDeluxe: React.FC = () => {
  const { f, d, W } = useBeats();
  const proud = W("proud", 0.8);
  const { i, lf, len } = useShot([W("A", 0.5) - 2], d, f);
  if (i === 0) {
    // Ausgang: er schiebt einen Wagen mit der verpackten Deluxe-Familie, Schleife oben
    const x = lerp(260, 480, ease(lf, 0, len, "linear"));
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.95, 1.02, 540, 880)}>
        <Layer>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#9BE35A" />
          <rect x={-2000} y={1450} width={5000} height={2000} fill="#6FB83A" />
          {Array.from({ length: 16 }).map((_, k) => (
            <rect key={k} x={-200 + k * 110} y={-100} width={30} height={60} fill={[P.red, P.pink, "#FFF07A", P.teal][k % 4]} transform={`rotate(${f * 4 + k * 30} ${-185 + k * 110} ${((f * 6 + k * 130) % 1500) - 100})`} />
          ))}
          <Cart x={x + 280} y={1450} s={1.25}>
            <g>
              <Person x={-90} y={-40} s={0.75} shirt={C.mom} cardigan hair="bun" hairColor="#C9A27A" skin="#FFD9B8" eyes="open" mouth="grin" blush />
              <Person x={90} y={-40} s={0.75} shirt={C.uncle} hair="none" hairColor="#000" stache skin="#FFD9B8" eyes="open" mouth="grin" />
              <rect x={-230} y={-560} width={460} height={480} rx={30} fill="#DDF3FF" fillOpacity={0.35} stroke="#FFFFFF" strokeWidth={8} />
              <path d="M -40 -580 Q -110 -650 -40 -660 Q 0 -640 0 -580 Q 0 -640 40 -660 Q 110 -650 40 -580 Z" fill={P.red} stroke={INK} strokeWidth={6} />
            </g>
          </Cart>
          <Guy x={x} y={1450} s={1.0} lean={10} armR={90} bendR={-10} eyes="squint" brows="up" mouth="grin" />
          <Sparkle x={x + 420} y={700} t={(lf % 30) + 1} s={1} />
          <Sparkle x={x + 120} y={600} t={((lf + 15) % 30) + 1} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  // Nah: neue Mama umarmt ihn, zu perfektes Lächeln, Funkeln; er ist gerührt
  return (
    <Shot cam={push(lf, len, 540, 1000, 1.25, 1.32, 540, 880)}>
      <Layer depth={0.5}>
        <ReactBg a="#FFD9EC" b="#FFF4FA" f={f} cx={540} cy={900} />
      </Layer>
      <Layer>
        <Guy x={680} y={1500} s={1.15} eyes={f >= proud ? "closed" : "open"} brows="sad" mouth="o" open={0.3} blush armL={120} bendL={-60} />
        <Shiny x={400} y={1500} f={f}>
          <Person x={400} y={1500} s={1.15} shirt={C.mom} cardigan hair="bun" hairColor="#C9A27A" skin="#FFD9B8" eyes="open" look={[0.4, 0]} brows="up" mouth="grin" blush armR={110} bendR={-70} />
        </Shiny>
        {f >= proud ? (
          <g>
            <circle cx={690} cy={940} r={12} fill="#7FD6FF" />
            <circle cx={640} cy={1000} r={10} fill="#7FD6FF" />
          </g>
        ) : null}
        <Sparkle x={300} y={520} t={f - proud} s={1.3} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* creepy                                                             */
/* ================================================================== */

export const SCreepy: React.FC = () => {
  const { f, d, W } = useBeats();
  const smiles = W("smiles", 0.6);
  const { i, lf, len } = useShot([W("Until", 0.45) - 2], d, f);
  if (i === 0) {
    // Perfekte Familie auf dem Sofa, alle drehen gleichzeitig den Kopf zu ihm
    const turn = lf > len * 0.5;
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.0, 1.08, 540, 880)}>
        <Layer>
          <Room wall="#7ED6C8" floor={1500} />
          <rect x={120} y={420} width={260} height={200} rx={10} fill="#FFF4DE" stroke={INK} strokeWidth={6} />
          <path d="M 170 580 L 250 470 L 330 580 Z" fill="#9BE35A" stroke={INK} strokeWidth={5} />
          <CouchBack x={540} y={1400} w={900} color="#FF8FC7" />
          {[300, 540, 780].map((x, k) => (
            <Person
              key={x}
              x={x}
              y={1300}
              s={0.9}
              seated
              shirt={[C.mom, C.uncle, C.sister][k]}
              cardigan={k === 0}
              hair={(["bun", "none", "pony"] as const)[k]}
              hairColor={["#C9A27A", "#000", "#D9A066"][k]}
              stache={k === 1}
              skin="#FFD9B8"
              eyes="open"
              look={turn ? [1, 0] : [0, 0]}
              mouth="grin"
              nod={turn ? 8 : 0}
            />
          ))}
          <CouchFront x={540} y={1400} w={900} color="#FF8FC7" dark="#E86FA4" />
          <Guy x={1010} y={1500} s={1.0} eyes="wide" look={[-1, 0]} brows="worried" mouth="flat" />
        </Layer>
      </Shot>
    );
  }
  // Nacht, Türspalt: neue Mama schläft mit offenen Augen und Grinsen, er schwitzt
  const open = ease(f, smiles - 6, smiles + 6);
  return (
    <Shot cam={push(lf, len, 540, 960, 1.15, 1.24, 540, 880)}>
      <Layer>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0E1030" />
        <path d={`M ${560 - 300 * open} 0 L ${560 + 340 * open} 0 L ${560 + 500 * open} 1920 L ${560 - 420 * open} 1920 Z`} fill="#4A4F9A" opacity={0.85} />
        <g opacity={0.4 + 0.6 * open}>
          <Bed x={560} y={1350} w={700} c="#5B6BD6" />
          <g transform="translate(560 1020)">
            <Head r={120} eyes="wide" look={[0, 0]} brows="neutral" mouth="grin" skin="#FFD9B8" />
          </g>
          <rect x={250} y={1080} width={620} height={200} rx={40} fill="#7F8FE0" stroke={INK} strokeWidth={8} />
        </g>
        <rect x={-2000} y={-2000} width={2000 + 560 - 300 * open} height={5000} fill="#0E1030" />
        <g transform="translate(150 1500) scale(1.1)">
          <Guy x={0} y={0} s={1} eyes="wide" look={[1, 0]} brows="worried" mouth="o" open={0.4} handMouth />
        </g>
        <Sweat x={260} y={900} s={1.3} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* back                                                               */
/* ================================================================== */

export const SBack: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("taps", 0.6) - 3], d, f);
  if (i === 0) {
    // Sonntag: er sprintet mit Kassenbon zurück zum Laden
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.95, 1.0, 540, 880)}>
        <Layer depth={0.4}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#8ED8FF" />
        </Layer>
        <Layer>
          <g transform={`translate(${-((lf * 14) % 600)} 0)`}>
            <Street ground={1450} />
          </g>
          <Guy x={540} y={1450} s={1.05} lean={-18} armL={150} bendL={-60} armR={40} bendR={60} eyes="wide" brows="worried" mouth="scream" open={0.5} gest={30} />
          <g transform={`translate(380 ${700 + Math.sin(lf * 0.6) * 20}) rotate(-20)`}>
            <rect x={-40} y={-120} width={80} height={240} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((k) => (
              <line key={k} x1={-25} y1={-90 + k * 40} x2={25} y2={-90 + k * 40} stroke="#8C93AA" strokeWidth={5} />
            ))}
          </g>
          {[0, 1, 2].map((k) => (
            <line key={k} x1={720 + k * 30} y1={900 + k * 120} x2={920 + k * 30} y2={900 + k * 120} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
          ))}
        </Layer>
      </Shot>
    );
  }
  // Lupe auf dem Kleingedruckten: Symbol zwei Pfeile im Kreis (Tausch geht in beide Richtungen)
  const lens = ease(lf, 0, 14);
  return (
    <Shot cam={push(lf, len, 540, 900, 1.15, 1.25, 540, 860)}>
      <Layer>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#FFFDF4" />
        {Array.from({ length: 40 }).map((_, k) => (
          <path key={k} d={`M -100 ${60 + k * 46} q 30 -12 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} stroke="#B8BFD0" strokeWidth={6} fill="none" />
        ))}
        <g transform={`translate(540 860) scale(${0.6 + 0.4 * lens})`}>
          <circle r={300} fill="#FFFFFF" stroke={INK} strokeWidth={22} />
          <rect x={200} y={200} width={60} height={300} rx={20} fill="#8E4F22" stroke={INK} strokeWidth={10} transform="rotate(-45 230 350)" />
          <g stroke={P.red} strokeWidth={30} fill="none" strokeLinecap="round">
            <path d="M -150 -30 A 150 150 0 0 1 130 -80" />
            <path d="M 150 30 A 150 150 0 0 1 -130 80" />
          </g>
          <path d="M 90 -150 L 150 -70 L 50 -50 Z" fill={P.red} />
          <path d="M -90 150 L -150 70 L -50 50 Z" fill={P.red} />
          <circle cx={-150} cy={-110} r={34} fill={P.skin} stroke={INK} strokeWidth={6} />
          <circle cx={150} cy={110} r={34} fill={P.skin2} stroke={INK} strokeWidth={6} />
        </g>
        {/* Finger des Verkäufers tippt */}
        <g transform={`translate(${900} ${1250 - Math.abs(Math.sin(lf * 0.5)) * 40})`}>
          <rect x={-40} y={-200} width={80} height={300} rx={40} fill={P.skin3} stroke={INK} strokeWidth={8} />
          <rect x={-60} y={60} width={120} height={200} fill={C.clerk} stroke={INK} strokeWidth={8} />
        </g>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

export const STwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("His", 0.35) - 2, W("They", 0.7) - 2], d, f);
  if (i <= 1) {
    // Überwachungsmonitor (grün/grau, Scanlines): seine ECHTE Familie an der Kasse im Morgengrauen, schiebt SEIN Foto aufs Band
    const show = i === 1;
    return (
      <Shot cam={push(lf, len, 540, 900, i === 0 ? 1.0 : 1.2, i === 0 ? 1.06 : 1.28, 540, 860)}>
        <Layer>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#1B1530" />
          <rect x={90} y={360} width={900} height={1080} rx={40} fill="#3A3F55" stroke={INK} strokeWidth={10} />
          <svg x={130} y={400} width={820} height={1000} viewBox="60 520 1020 1240" preserveAspectRatio="xMidYMid slice">
            <rect x={-500} y={-500} width={3000} height={3000} fill="#6F8A7A" />
            <g opacity={0.85}>
              <Checkout f={0} laser={show ? 1 : 0} />
              {show ? (
                <g transform="translate(420 1170) rotate(-8)">
                  <rect x={-90} y={-110} width={180} height={140} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
                  <circle cx={0} cy={-50} r={34} fill={P.skin2} stroke={INK} strokeWidth={5} />
                  <path d="M -34 -70 q 34 -40 68 0" fill={C.guyHair} />
                  <rect x={-40} y={-16} width={80} height={40} fill={C.guy} />
                </g>
              ) : null}
              <Uncle x={110} y={1460} s={0.85} eyes="squint" mouth="grin" armR={90} bendR={-20} />
              <Mom x={-70} y={1460} s={0.85} eyes="squint" mouth="grin" />
              <Sister x={260} y={1460} s={0.8} eyes="squint" mouth="smug" armR={100} />
            </g>
            {Array.from({ length: 40 }).map((_, k) => (
              <rect key={k} x={-500} y={520 + k * 32 + ((f * 2) % 32)} width={3000} height={8} fill="#000" opacity={0.18} />
            ))}
          </svg>
          <circle cx={170} cy={460} r={18} fill={C.laser} opacity={f % 20 < 10 ? 1 : 0.2} />
          <rect x={120} y={1460} width={840} height={40} rx={10} fill="#2B2F45" />
        </Layer>
      </Shot>
    );
  }
  // Seine echte Familie verlässt glücklich den Laden – mit einem Golden Retriever
  return (
    <Shot cam={push(lf, len, 540, 1000, 1.0, 1.07, 540, 900)}>
      <Layer>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#FF9A3D" />
        <rect x={-2000} y={1450} width={5000} height={2000} fill="#D9772A" />
        <rect x={700} y={500} width={460} height={950} fill="#FFE066" stroke={INK} strokeWidth={9} />
        <Mom x={300} y={1450} s={0.95} eyes="squint" mouth="grin" armR={60} bendR={-30} blush />
        <Uncle x={560} y={1450} s={0.95} eyes="squint" mouth="grin" armL={140} bendL={-20} />
        <Sister x={90} y={1450} s={0.85} eyes="squint" mouth="grin" armR={170} />
        <Dog x={700} y={1450} s={0.9} f={f} />
        <Burst x={540} y={900} r0={420} r1={420 + 200 * ease(lf, 0, 8)} n={14} o={1 - ease(lf, 6, 16)} color="#FFFFFF" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* dog                                                                */
/* ================================================================== */

export const SDog: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("What", 0.5) - 2], d, f);
  if (i === 0) {
    // Nah: Mama knuddelt den Hund im Pullover, Herzen
    return (
      <Shot cam={push(lf, len, 540, 1000, 1.2, 1.28, 540, 880)}>
        <Layer depth={0.5}>
          <ReactBg a="#FFC94D" b="#FFE699" f={f} cx={540} cy={900} />
        </Layer>
        <Layer>
          <Mom x={760} y={1500} s={1.15} eyes="closed" brows="up" mouth="grin" blush armL={130} bendL={-80} />
          <Dog x={560} y={1500} s={1.1} f={f} />
          {[0, 1, 2].map((k) => {
            const t = (lf + k * 12) % 36;
            return <path key={k} d="M 0 20 C -40 -10 -30 -50 0 -30 C 30 -50 40 -10 0 20 Z" fill={P.red} stroke={INK} strokeWidth={4} transform={`translate(${380 + k * 160} ${760 - t * 8}) scale(${1.5})`} opacity={1 - t / 36} />;
          })}
        </Layer>
      </Shot>
    );
  }
  // Extrem nah: sein fassungsloser Schrei
  return (
    <Shot cam={push(lf, len, 540, 860, 1.0, 1.1, 540, 860)}>
      <Layer depth={0.5}>
        <ReactBg a="#E8323F" b="#FF7A85" f={f} cx={540} cy={860} />
      </Layer>
      <Layer>
        <g transform={`translate(${540 + Math.sin(lf * 2.2) * 8} 900)`}>
          <Head r={330} eyes="wide" look={[0, -0.2]} brows="angry" mouth="scream" open={0.95} skin={P.skin2} />
          <path d="M -300 -250 Q -150 -460 0 -330 Q 150 -470 300 -250 Q 200 -380 0 -360 Q -200 -380 -300 -250 Z" fill={C.guyHair} />
        </g>
        <Burst x={540} y={900} r0={360} r1={360 + 160 * ease(lf, 0, 6)} n={16} o={1 - ease(lf, 6, 14)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* shelf                                                              */
/* ================================================================== */

export const SShelf: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Still", 0.55) - 2], d, f);
  if (i === 0) {
    // Restposten-Gang: er sitzt im Regal mit rotem Schild, Steppenläufer rollt durch
    const tw = ((lf * 9) % 1600) - 300;
    return (
      <Shot cam={push(lf, len, 540, 1000, 0.95, 1.05, 540, 880)}>
        <Layer>
          <StoreHall f={f} wall="#C9B8FF" shelf={false} />
          <ClearanceShelf x={540} y={1450} s={1.2} />
          <Guy x={500} y={1450 - 330 * 1.2 - 10} s={0.95} seated eyes="half" look={[0, 0.5]} brows="sad" mouth="frown" bags={1} />
          <Tag x={700} y={760} s={1.2} r={12} />
          <g transform={`translate(${tw} 1420) rotate(${lf * 9})`}>
            <circle r={60} fill="none" stroke="#B5853A" strokeWidth={8} />
            <circle r={36} fill="none" stroke="#B5853A" strokeWidth={6} />
            <path d="M -50 -20 L 50 20 M -40 30 L 40 -30" stroke="#B5853A" strokeWidth={6} />
          </g>
        </Layer>
      </Shot>
    );
  }
  // Kundin greift lieber zum Socken-Gutschein (dem Onkel) und geht an ihm vorbei
  const walk = ease(lf, 0, len, "linear");
  return (
    <Shot cam={push(lf, len, 540, 1000, 1.05, 1.1, 540, 880)}>
      <Layer>
        <StoreHall f={f} wall="#B5A2FF" shelf={false} />
        <ClearanceShelf x={300} y={1450} s={1.0} />
        <Guy x={270} y={1450 - 330 - 10} s={0.8} seated eyes="open" look={[1, 0]} brows="worried" mouth="smile" armR={120} bendR={-30} />
        <Person x={lerp(700, 1150, walk)} y={1450} s={1.0} shirt={P.teal} hair="bun" hairColor="#2E2A1E" eyes="squint" mouth="smile" armL={70} bendL={-50} flip />
        <Coupon x={lerp(700, 1150, walk) - 160} y={1010} s={0.6} r={-10} />
        <Sweat x={340} y={850} s={1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const SOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const photo = W("photo", 0.8);
  const { i, lf, len } = useShot([W("With", 0.55) - 2], d, f);
  if (i === 0) {
    // POV: Hand des Zuschauers hält das Handy; darauf die Schlange – eine Mutter hält ein gerahmtes Foto (Silhouette = Zuschauer)
    return (
      <Shot cam={push(lf, len, 540, 960, 1.0, 1.04, 540, 960)}>
        <Layer>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2B2440" />
          <rect x={190} y={180} width={700} height={1300} rx={80} fill={INK} />
          <rect x={220} y={220} width={640} height={1220} rx={54} fill="#FFFFFF" />
          <svg x={220} y={220} width={640} height={1220} viewBox="60 260 960 1830" preserveAspectRatio="xMidYMid slice">
            <StoreHall f={f} />
            <Mom x={520} y={1500} s={1.1} eyes="squint" mouth="smug" armR={110} bendR={-60} />
            <g transform="translate(720 980) rotate(8)">
              <rect x={-110} y={-140} width={220} height={260} rx={10} fill={C.gold} stroke={INK} strokeWidth={8} />
              <rect x={-85} y={-115} width={170} height={210} fill="#DDF3FF" />
              <circle cx={0} cy={-30} r={50} fill="#2B2440" />
              <rect x={-60} y={20} width={120} height={75} rx={30} fill="#2B2440" />
            </g>
            <Uncle x={160} y={1500} s={0.9} eyes="squint" mouth="grin" />
            <Cart x={900} y={1500} s={0.8} />
          </svg>
          <PovHand x={560} y={1420} w={0} skin={P.skin} />
        </Layer>
      </Shot>
    );
  }
  // Loop: das Foto klatscht aufs Band der Kasse aus Bild 1, Laser piept darauf
  const slap = ease(f, photo - 6, photo);
  return (
    <Shot cam={push(lf, len, 470, 1020, 1.05, 1.1, 540, 900)}>
      <Layer>
        <Checkout f={f} laser={f >= photo ? 1 : 0} />
        <g transform={`translate(480 ${lerp(700, 1170, slap)}) rotate(${lerp(-30, -6, slap)})`}>
          <rect x={-130} y={-160} width={260} height={200} rx={10} fill={C.gold} stroke={INK} strokeWidth={8} />
          <rect x={-105} y={-135} width={210} height={150} fill="#DDF3FF" />
          <circle cx={0} cy={-70} r={40} fill="#2B2440" />
          <rect x={-55} y={-30} width={110} height={45} rx={20} fill="#2B2440" />
        </g>
        <LaserDot x={480} y={1110} o={f >= photo ? 1 : 0} w={200} />
        <Burst x={480} y={1100} r0={160} r1={160 + 120 * ease(f, photo, photo + 6)} n={12} o={f >= photo ? 1 - ease(f, photo + 6, photo + 14) : 0} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const TAUSCH_SCENES: Record<string, React.FC> = {
  hook: SHook,
  rules: SRules,
  guy: SGuy,
  line: SLine,
  scan: SScan,
  sister: SSister,
  mom: SMom,
  print: SPrint,
  deluxe: SDeluxe,
  creepy: SCreepy,
  back: SBack,
  twist: STwist,
  dog: SDog,
  shelf: SShelf,
  outro: SOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(TAUSCH_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Schilder/Gutscheine zeigen nur Symbole. */
export const TAUSCH_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene: Kasse, Halle | Rückgabe pink, Stempel | Thanksgiving, Onkel nah | Parkplatz, Ziehen |
 * Scanner/Display | Band, Jubel | Band nah, Karte | Vertrag, Unterschrift | Ausgang, Umarmung | Sofa, Türspalt |
 * Straße, Lupe | Monitor ×2, Hund-Abgang | Hund nah, Schrei | Restposten ×2 | POV, Kasse → nie > 2 gleiche Sets am Stück. */
export const TAUSCH_SHOT_COUNT: Record<string, number> = {
  hook: 2,
  rules: 2,
  guy: 2,
  line: 2,
  scan: 1,
  sister: 2,
  mom: 2,
  print: 2,
  deluxe: 2,
  creepy: 2,
  back: 2,
  twist: 3,
  dog: 2,
  shelf: 2,
  outro: 2,
};
