import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/suche-stadt.json";
import { useBeats } from "./rollsSets";
import { BusSide, Burst, Granny, INK, P, Person, Sky, Street, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";

/**
 * „In This City, Your Last Search Is Read at Your Funeral“ (episodes/suche-stadt.json) – 2D-Cartoon wie Lügen-Stadt,
 * schwarzer Humor (Nutzer 21.11.2026). Eine Text-Ebene (nur Untertitel + Cover), Suchfelder ohne lesbaren Text
 * (Bildzeichen statt Wörter), kein Set > 2 Einstellungen am Stück, Gesichter über der Untertitelzone.
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.round(x));
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

const C = {
  kevin: "#2FBF71",
  church: "#FFD7B0",
  church2: "#E9C9FF",
  wood: "#B8693A",
  woodDark: "#7E4320",
  priest: "#2A2440",
  mom: "#FF5FA8",
  rick: "#E8413A",
  bear: "#9A5B2E",
  bearDark: "#6E3D1C",
  night: "#1E2A6B",
  glow: "#BFF4FF",
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Kevin: React.FC<Fig> = (p) => <Person pants="#2B3A67" {...p} shirt={C.kevin} hair="side" hairColor="#6B3A1E" skin={P.skin} glasses />;
const Priest: React.FC<Fig> = (p) => <Person pants={C.priest} {...p} shirt={C.priest} hair="none" hairColor="#000" skin="#F2C7A5" collar />;
const Mom: React.FC<Fig> = (p) => <Person pants={C.mom} {...p} shirt={C.mom} hair="curly" hairColor="#F2C14E" skin={P.skin} />;
const Nun: React.FC<Fig> = (p) => <Person pants={INK} {...p} shirt={INK} hair="none" hairColor="#000" skin={p.skin ?? P.skin} veil />;
const Check: React.FC = () => (
  <g>
    {[-60, -20, 20, 60].map((x) => (
      <rect key={x} x={x - 8} y={-320} width={16} height={200} fill="#8C1C17" opacity={0.6} />
    ))}
    {[-280, -230, -180].map((y) => (
      <rect key={y} x={-80} y={y} width={160} height={14} fill="#8C1C17" opacity={0.6} />
    ))}
  </g>
);
const Rick: React.FC<Fig> = (p) => <Person pants="#2B3A67" {...p} shirt={C.rick} hair="spiky" hairColor="#7A4A22" skin={P.skin} stache chest={<Check />} />;

/* ------------------------------------------------------------------ */
/* Sets + Requisiten                                                  */
/* ------------------------------------------------------------------ */

/** Kirche innen: warme Wand, bunte Rosettenfenster, Holzboden. */
const Church: React.FC<{ readonly wall?: string; readonly floor?: number; readonly dim?: number }> = ({ wall = C.church, floor = 1500, dim = 0 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={2000 + floor} fill={wall} />
    {[-700, -150, 400, 950, 1500].map((x, k) => (
      <g key={x}>
        <path d={`M ${x} ${floor - 420} L ${x} ${floor - 1100} Q ${x + 130} ${floor - 1300} ${x + 260} ${floor - 1100} L ${x + 260} ${floor - 420} Z`} fill={[P.purple, P.teal, P.orange, P.pink, P.lime][k % 5]} stroke={INK} strokeWidth={9} />
        <circle cx={x + 130} cy={floor - 980} r={60} fill={[P.bus, P.red, P.sky, P.bus, P.red][k % 5]} stroke={INK} strokeWidth={6} />
        <line x1={x + 130} x2={x + 130} y1={floor - 920} y2={floor - 420} stroke={INK} strokeWidth={6} />
        <line x1={x} x2={x + 260} y1={floor - 700} y2={floor - 700} stroke={INK} strokeWidth={6} />
      </g>
    ))}
    <rect x={-2000} y={floor} width={5000} height={2500} fill={C.wood} />
    <rect x={-2000} y={floor} width={5000} height={22} fill={C.woodDark} />
    <path d={`M 380 ${floor + 22} L 700 ${floor + 22} L 900 ${floor + 2400} L 180 ${floor + 2400} Z`} fill={P.red} opacity={0.85} />
    {dim > 0 ? <rect x={-2000} y={-2000} width={5000} height={5000} fill={INK} opacity={dim} /> : null}
  </g>
);

/** Kirchenbank (Rückenlehne vorn), Oberkante y. */
const Pew: React.FC<{ readonly y: number; readonly x0?: number; readonly x1?: number }> = ({ y, x0 = -600, x1 = 1680 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={70} rx={14} fill={C.wood} stroke={INK} strokeWidth={8} />
    <rect x={x0} y={y + 70} width={x1 - x0} height={260} fill={C.woodDark} stroke={INK} strokeWidth={8} />
  </g>
);

/** Rednerpult mit Mikro. */
const Lectern: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 -330 L 150 -330 L 110 0 L -110 0 Z" fill={C.wood} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={-175} y={-372} width={350} height={50} rx={10} fill={C.woodDark} stroke={INK} strokeWidth={8} />
    <path d="M 90 -372 Q 120 -470 60 -520" fill="none" stroke={INK} strokeWidth={8} />
    <ellipse cx={55} cy={-530} rx={22} ry={30} fill="#555A70" stroke={INK} strokeWidth={6} />
  </g>
);

/** Offener Sarg (Seitenansicht) mit liegender Person: head = Gesichtsfarbe; who = "granny" | "kevin" | "driver". */
const Coffin: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly who?: "granny" | "kevin" | "driver" }> = ({ x, y, s = 1, who = "granny" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-400} y={-250} width={800} height={34} rx={12} fill="#6E3D1C" stroke={INK} strokeWidth={8} transform="rotate(-8 400 -233)" />
    <g transform="translate(-170 -210)">
      <circle r={78} fill={who === "granny" ? "#F2C7A5" : P.skin} stroke={INK} strokeWidth={7} />
      {who === "granny" ? <circle cx={-80} cy={0} r={36} fill="#F2F2F2" stroke={INK} strokeWidth={6} /> : null}
      {who === "driver" ? <path d="M -60 -70 Q 0 -110 60 -70 L 70 -40 L -70 -40 Z" fill={P.ted} stroke={INK} strokeWidth={6} /> : null}
      <path d="M -40 -12 Q -28 -2 -16 -12 M 16 -12 Q 28 -2 40 -12" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M -14 30 Q 0 38 14 30" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </g>
    <rect x={-400} y={-180} width={800} height={180} rx={18} fill={C.wood} stroke={INK} strokeWidth={9} />
    <rect x={-360} y={-150} width={720} height={14} rx={7} fill="#E8C27A" />
    {[-250, -80, 90, 250].map((fx, k) => (
      <g key={fx} transform={`translate(${fx} -190)`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 22} cy={Math.sin((a * Math.PI) / 180) * 22} rx={20} ry={14} fill={[P.pink, P.white, P.bus, P.red][k]} stroke={INK} strokeWidth={4} transform={`rotate(${a})`} />
        ))}
        <circle r={12} fill={P.bus} stroke={INK} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** Großes Handy; children = Bildschirm-Inhalt (Ursprung Bildschirmmitte). */
const Phone: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly children?: React.ReactNode; readonly glow?: number }> = ({ x, y, s = 1, r = 0, children, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {glow > 0 ? <circle r={300} fill={C.glow} opacity={0.35 * glow} /> : null}
    <rect x={-120} y={-220} width={240} height={440} rx={34} fill={INK} />
    <rect x={-102} y={-198} width={204} height={386} rx={18} fill="#FFFFFF" />
    {children}
  </g>
);

/** Suchfeld (Pille + Lupe). typed 0..1 = Kritzel-Länge (kein lesbarer Text, eine Text-Ebene). */
const SearchBar: React.FC<{ readonly y?: number; readonly typed?: number; readonly w?: number }> = ({ y = -120, typed = 0, w = 180 }) => (
  <g transform={`translate(0 ${y})`}>
    <rect x={-w / 2} y={-26} width={w} height={52} rx={26} fill="#F1F3F8" stroke={INK} strokeWidth={5} />
    <circle cx={-w / 2 + 28} cy={-4} r={11} fill="none" stroke={INK} strokeWidth={5} />
    <line x1={-w / 2 + 36} y1={4} x2={-w / 2 + 46} y2={14} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    {typed > 0.01 ? <path d={`M ${-w / 2 + 56} 0 ${Array.from({ length: Math.max(1, Math.round(typed * 9)) }).map((_, k) => `q 6 ${k % 2 ? 12 : -12} 12 0`).join(" ")}`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" /> : null}
  </g>
);

/** Bildzeichen im Handy: Hühnchen + Uhr, Bär + Läufer, Papierkorb. */
const Icon: React.FC<{ readonly kind: "chicken" | "bear" | "trash" | "q"; readonly y?: number; readonly s?: number }> = ({ kind, y = 30, s = 1 }) => (
  <g transform={`translate(0 ${y}) scale(${s})`}>
    {kind === "chicken" ? (
      <g>
        <ellipse cx={-20} cy={0} rx={48} ry={34} fill="#C9A86B" stroke={INK} strokeWidth={5} transform="rotate(-25)" />
        <rect x={20} y={-8} width={44} height={16} rx={8} fill="#FFF4DE" stroke={INK} strokeWidth={5} transform="rotate(-25)" />
        <circle cx={50} cy={60} r={30} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
        <path d="M 50 60 L 50 42 M 50 60 L 64 66" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      </g>
    ) : null}
    {kind === "bear" ? (
      <g>
        <circle cx={30} cy={0} r={44} fill={C.bear} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-38} r={14} fill={C.bear} stroke={INK} strokeWidth={4} />
        <circle cx={60} cy={-38} r={14} fill={C.bear} stroke={INK} strokeWidth={4} />
        <circle cx={-50} cy={-10} r={18} fill={P.skin} stroke={INK} strokeWidth={4} />
        <path d="M -50 8 L -50 40 M -50 40 L -64 64 M -50 40 L -36 64 M -50 18 L -70 30 M -50 18 L -30 6" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      </g>
    ) : null}
    {kind === "trash" ? (
      <g>
        <path d="M -40 -30 L 40 -30 L 30 60 L -30 60 Z" fill={P.grey} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-50} y={-46} width={100} height={16} rx={6} fill={P.grey} stroke={INK} strokeWidth={5} />
        <path d="M -12 -10 L -10 44 M 12 -10 L 10 44" stroke={INK} strokeWidth={4} />
      </g>
    ) : null}
    {kind === "q" ? (
      <g>
        <path d="M -26 -30 Q -26 -64 4 -64 Q 34 -64 34 -36 Q 34 -14 8 -4 L 8 16" fill="none" stroke={P.red} strokeWidth={14} strokeLinecap="round" />
        <circle cx={8} cy={44} r={9} fill={P.red} />
      </g>
    ) : null}
  </g>
);

/** Comic-Reaktionsfläche (Farbe + Strahlen) gegen Set-Wiederholung. */
const ReactBg: React.FC<{ readonly a: string; readonly b: string; readonly f: number; readonly cx?: number; readonly cy?: number }> = ({ a, b, f, cx = 540, cy = 900 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={a} />
    {Array.from({ length: 16 }).map((_, k) => {
      const t = (k / 16) * Math.PI * 2 + f * 0.004;
      const t2 = t + Math.PI / 16;
      return <path key={k} d={`M ${cx} ${cy} L ${cx + Math.cos(t) * 3000} ${cy + Math.sin(t) * 3000} L ${cx + Math.cos(t2) * 3000} ${cy + Math.sin(t2) * 3000} Z`} fill={b} />;
    })}
  </g>
);

/** Küche: Mintwand, Arbeitsplatte. */
const Kitchen: React.FC<{ readonly top?: number }> = ({ top = 1180 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#BDF2D5" />
    {Array.from({ length: 12 }).map((_, k) => (
      <rect key={k} x={-1200 + k * 260} y={-2000} width={120} height={2000 + top} fill="#FFFFFF" opacity={0.22} />
    ))}
    <rect x={620} y={300} width={360} height={300} rx={18} fill="#FFF4DE" stroke={INK} strokeWidth={9} />
    <rect x={620} y={300} width={360} height={60} fill="#FFB070" stroke={INK} strokeWidth={9} />
    <rect x={-2000} y={top} width={5000} height={60} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    <rect x={-2000} y={top + 60} width={5000} height={2000} fill="#4FA3E0" stroke={INK} strokeWidth={9} />
    {[-300, 200, 700, 1200].map((x) => (
      <rect key={x} x={x} y={top + 120} width={380} height={380} rx={16} fill="none" stroke={INK} strokeWidth={7} />
    ))}
  </g>
);

/** Grünes Hühnchen auf Teller, Fliegen kreisen. */
const BadChicken: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={190} ry={40} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <ellipse cx={-20} cy={-50} rx={120} ry={70} fill="#9BC75A" stroke={INK} strokeWidth={8} />
    <rect x={80} y={-80} width={90} height={30} rx={15} fill="#FFF4DE" stroke={INK} strokeWidth={7} transform="rotate(-20 80 -80)" />
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M ${-80 + k * 60} ${-130} q 10 -30 0 -60 q -10 -30 0 -60`} fill="none" stroke="#6BAF3A" strokeWidth={8} strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(f * 0.2 + k)} />
    ))}
    {[0, 1, 2, 3].map((k) => {
      const a = f * 0.25 + k * 1.6;
      const fx = Math.cos(a) * (150 + k * 20);
      const fy = -150 + Math.sin(a * 1.3) * 60;
      return (
        <g key={`fly${k}`} transform={`translate(${fx} ${fy})`}>
          <ellipse cx={-10} cy={-12} rx={14} ry={9} fill="#FFFFFF" opacity={0.85} stroke={INK} strokeWidth={3} />
          <ellipse cx={10} cy={-12} rx={14} ry={9} fill="#FFFFFF" opacity={0.85} stroke={INK} strokeWidth={3} />
          <circle r={10} fill={INK} />
        </g>
      );
    })}
  </g>
);

/** Wald: Himmel, Tannen, Boden. */
const Forest: React.FC<{ readonly ground?: number; readonly f?: number; readonly scroll?: number }> = ({ ground = 1450, scroll = 0 }) => (
  <g>
    <Sky id="forest" a="#FFB86B" b="#FFE7A8" />
    {Array.from({ length: 14 }).map((_, k) => {
      const x = ((-600 + k * 260 - scroll) % 3640 + 3640) % 3640 - 900;
      const h = 700 + (k % 3) * 160;
      return (
        <g key={k}>
          <rect x={x - 22} y={ground - 160} width={44} height={180} fill={C.woodDark} stroke={INK} strokeWidth={6} />
          <path d={`M ${x} ${ground - h} L ${x + 170} ${ground - 140} L ${x - 170} ${ground - 140} Z`} fill={k % 2 ? "#2E9E5B" : "#1F7F4A"} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        </g>
      );
    })}
    <rect x={-2000} y={ground} width={5000} height={2500} fill="#7BC24A" stroke={INK} strokeWidth={8} />
  </g>
);

/** Bär (Ursprung Füße), Serviette um den Hals. */
const Bear: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly run?: number; readonly mouth?: "grin" | "lick"; readonly flip?: boolean }> = ({ x, y, s = 1, f, run = 0, mouth = "grin", flip }) => {
  const b = -Math.abs(Math.sin(f * 0.6)) * 30 * run;
  return (
    <g transform={`translate(${x} ${y + b}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {[-90, 90].map((lx, k) => (
        <rect key={lx} x={lx - 40} y={-200 + Math.sin(f * 0.6 + k * Math.PI) * 30 * run} width={80} height={200} rx={36} fill={C.bearDark} stroke={INK} strokeWidth={8} />
      ))}
      <ellipse cx={0} cy={-330} rx={230} ry={210} fill={C.bear} stroke={INK} strokeWidth={9} />
      <ellipse cx={0} cy={-300} rx={130} ry={120} fill="#C98A5E" />
      <path d="M -120 -500 L 120 -500 L 0 -380 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -60 -470 L 60 -470 M -40 -440 L 40 -440" stroke={P.red} strokeWidth={8} />
      <g transform="translate(0 -640)">
        <circle cx={-120} cy={-110} r={56} fill={C.bear} stroke={INK} strokeWidth={8} />
        <circle cx={120} cy={-110} r={56} fill={C.bear} stroke={INK} strokeWidth={8} />
        <circle r={160} fill={C.bear} stroke={INK} strokeWidth={9} />
        <ellipse cx={0} cy={50} rx={80} ry={60} fill="#C98A5E" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={20} rx={26} ry={18} fill={INK} />
        <circle cx={-60} cy={-40} r={26} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        <circle cx={60} cy={-40} r={26} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        <circle cx={-54} cy={-36} r={12} fill={INK} />
        <circle cx={54} cy={-36} r={12} fill={INK} />
        <path d="M -95 -85 L -35 -65 M 95 -85 L 35 -65" stroke={INK} strokeWidth={9} strokeLinecap="round" />
        {mouth === "grin" ? (
          <path d="M -50 60 Q 0 110 50 60 Z" fill="#7A1B1B" stroke={INK} strokeWidth={6} />
        ) : (
          <g>
            <path d="M -40 70 Q 0 90 40 70" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <ellipse cx={30} cy={84} rx={18} ry={14} fill={P.pink} stroke={INK} strokeWidth={5} />
          </g>
        )}
        {mouth === "grin" ? <path d="M -30 66 L -24 80 L -18 68 M 18 68 L 24 80 L 30 66" fill="#FFFFFF" stroke={INK} strokeWidth={3} /> : null}
      </g>
      {[-1, 1].map((sd) => (
        <ellipse key={sd} cx={sd * 230} cy={-380 + Math.sin(f * 0.6 + sd) * 20 * run} rx={50} ry={90} fill={C.bear} stroke={INK} strokeWidth={8} transform={`rotate(${sd * -30} ${sd * 230} -380)`} />
      ))}
    </g>
  );
};

/** Gerahmtes Trauerbild auf Staffelei. kind: Bürgermeister (Schärpe) oder Busfahrer (Mütze). */
const Portrait: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly kind: "mayor" | "driver" }> = ({ x, y, s = 1, kind }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 0 L -40 -560 M 150 0 L 40 -560 M 0 -560 L 0 20" stroke={C.woodDark} strokeWidth={22} strokeLinecap="round" />
    <rect x={-210} y={-860} width={420} height={500} rx={20} fill="#E8C27A" stroke={INK} strokeWidth={10} />
    <rect x={-170} y={-820} width={340} height={420} fill={kind === "mayor" ? "#BFE8FF" : "#FFE9A8"} stroke={INK} strokeWidth={6} />
    <path d="M -120 -400 Q -120 -520 0 -530 Q 120 -520 120 -400 Z" fill={kind === "mayor" ? INK : P.ted} stroke={INK} strokeWidth={6} />
    {kind === "mayor" ? <path d="M -80 -500 L 60 -400 L 90 -420 L -50 -520 Z" fill={P.red} stroke={INK} strokeWidth={4} /> : null}
    <circle cx={0} cy={-620} r={95} fill={P.skin} stroke={INK} strokeWidth={7} />
    <circle cx={-34} cy={-635} r={11} fill={INK} />
    <circle cx={34} cy={-635} r={11} fill={INK} />
    {kind === "mayor" ? (
      <g>
        <path d="M -50 -590 Q -25 -610 0 -595 Q 25 -610 50 -590 Q 25 -580 0 -585 Q -25 -580 -50 -590 Z" fill="#4A2E1E" stroke={INK} strokeWidth={4} />
        <rect x={-70} y={-790} width={140} height={90} fill={INK} />
        <rect x={-110} y={-712} width={220} height={18} rx={9} fill={INK} />
      </g>
    ) : (
      <g>
        <path d="M -30 -575 Q 0 -560 30 -575" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M -100 -660 Q -95 -760 0 -755 Q 95 -760 100 -660 Z" fill={P.ted} stroke={INK} strokeWidth={6} />
        <path d="M -110 -660 L 130 -660 Q 140 -645 110 -640 L -100 -645 Z" fill={P.tedDark} stroke={INK} strokeWidth={6} />
      </g>
    )}
    <path d="M 120 -860 L 210 -860 L 210 -770 Z" fill={INK} />
  </g>
);

/** Wohnzimmer/Schlafzimmer-Wand. */
const Room: React.FC<{ readonly wall?: string; readonly floor?: number; readonly night?: boolean }> = ({ wall = "#BFE8FF", floor = 1500, night }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={2000 + floor} fill={night ? C.night : wall} />
    {[...Array(14)].map((_, k) => (
      <rect key={k} x={-1500 + k * 300} y={-2000} width={110} height={2000 + floor} fill="#FFFFFF" opacity={night ? 0.05 : 0.18} />
    ))}
    <rect x={-2000} y={floor} width={5000} height={2500} fill={night ? "#3B2A5A" : C.wood} />
    <rect x={-2000} y={floor} width={5000} height={22} fill={C.woodDark} />
  </g>
);

const Desk: React.FC<{ readonly y: number }> = ({ y }) => (
  <g>
    <rect x={-400} y={y} width={1880} height={50} fill={C.wood} stroke={INK} strokeWidth={8} />
    <rect x={-300} y={y + 50} width={40} height={600} fill={C.woodDark} stroke={INK} strokeWidth={6} />
    <rect x={1300} y={y + 50} width={40} height={600} fill={C.woodDark} stroke={INK} strokeWidth={6} />
  </g>
);

const Laptop: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -170 -230 L 170 -230 L 160 0 L -160 0 Z" fill="#555A70" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-145} y={-205} width={290} height={180} rx={8} fill="#FFFFFF" />
    <SearchBar y={-140} typed={0} w={220} />
    <path d="M -110 -80 L 110 -80 M -110 -50 L 60 -50" stroke={P.grey} strokeWidth={10} strokeLinecap="round" />
    <rect x={-220} y={0} width={440} height={26} rx={10} fill="#8A8FA8" stroke={INK} strokeWidth={7} />
  </g>
);

/** Katze hält sich die Ohren zu. */
const Cat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.9) * 3}) scale(${s})`}>
    <ellipse cx={0} cy={-80} rx={110} ry={90} fill={P.orange} stroke={INK} strokeWidth={8} />
    <path d="M 100 -60 Q 190 -80 170 -190" fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
    <path d="M 100 -60 Q 190 -80 170 -190" fill="none" stroke={P.orange} strokeWidth={18} strokeLinecap="round" />
    <g transform="translate(0 -230)">
      <path d="M -90 -40 L -80 -130 L -20 -80 Z M 90 -40 L 80 -130 L 20 -80 Z" fill={P.orange} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle r={100} fill={P.orange} stroke={INK} strokeWidth={8} />
      <path d="M -60 -10 L -20 0 L -60 10 M 60 -10 L 20 0 L 60 10" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -30 46 Q 0 26 30 46" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {[-1, 1].map((sd) => (
        <circle key={sd} cx={sd * 92} cy={-60} r={34} fill={P.orange} stroke={INK} strokeWidth={7} />
      ))}
    </g>
  </g>
);

/** Aufsteigende Noten (Bildzeichen, kein Text). */
const Notes: React.FC<{ readonly x: number; readonly y: number; readonly f: number }> = ({ x, y, f }) => (
  <g>
    {[0, 1, 2].map((k) => {
      const t = ((f / 24 + k / 3) % 1 + 1) % 1;
      return (
        <g key={k} transform={`translate(${x + k * 70 + Math.sin(t * 6) * 20} ${y - t * 260})`} opacity={Math.sin(t * Math.PI)}>
          <ellipse cx={0} cy={0} rx={22} ry={16} fill={INK} transform="rotate(-20)" />
          <line x1={18} y1={-6} x2={18} y2={-80} stroke={INK} strokeWidth={8} />
          <path d="M 18 -80 Q 50 -60 40 -30" fill="none" stroke={INK} strokeWidth={8} />
        </g>
      );
    })}
  </g>
);

/** Brokkoli-Röschen. */
const Broccoli: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-22} y={-10} width={44} height={110} rx={18} fill="#9BE35A" stroke={INK} strokeWidth={6} />
    {[[-50, -30], [0, -60], [50, -30], [-25, -15], [25, -15]].map(([cx, cy], k) => (
      <circle key={k} cx={cx} cy={cy} r={42} fill="#2E9E5B" stroke={INK} strokeWidth={6} />
    ))}
  </g>
);

/** Bett bei Nacht (Kopfkissen links). */
const Bed: React.FC<{ readonly y: number }> = ({ y }) => (
  <g>
    <rect x={-300} y={y - 380} width={60} height={600} rx={20} fill={C.woodDark} stroke={INK} strokeWidth={8} />
    <ellipse cx={20} cy={y - 60} rx={180} ry={80} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
  </g>
);
const Blanket: React.FC<{ readonly y: number }> = ({ y }) => (
  <g>
    <path d={`M 120 ${y - 120} Q 600 ${y - 220} 1500 ${y - 140} L 1500 ${y + 260} L 120 ${y + 260} Z`} fill={P.purple} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {[300, 600, 900, 1200].map((x) => (
      <circle key={x} cx={x} cy={y} r={30} fill={P.bus} opacity={0.6} />
    ))}
  </g>
);

/** Urne mit Gesicht (Oma wacht). */
const Urn: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly squint: number; readonly look?: number }> = ({ x, y, s = 1, squint, look = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 0 L 120 0 L 90 -40 Q 190 -200 110 -360 L -110 -360 Q -190 -200 -90 -40 Z" fill="#6F7BD8" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={-90} y={-400} width={180} height={44} rx={12} fill="#4E58B0" stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={-430} rx={60} ry={30} fill="#4E58B0" stroke={INK} strokeWidth={8} />
    <circle cx={0} cy={-370 - 40} r={0} />
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <ellipse cx={sd * 50} cy={-220} rx={34} ry={lerp(30, 8, squint)} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        <circle cx={sd * 50 + look * 12} cy={-220} r={lerp(13, 6, squint)} fill={INK} />
        <path d={`M ${sd * 20} ${-262 + squint * 10} L ${sd * 84} ${-268 - squint * 14}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      </g>
    ))}
    <path d="M -30 -140 L 30 -140" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <circle cx={0} cy={-470} r={30} fill="#F2F2F2" stroke={INK} strokeWidth={6} />
  </g>
);

/** Regal mit Pflanze + Bilderrahmen (Hintergrund-Gag: Oma-Foto mit Hühnchen). */
const Shelf: React.FC<{ readonly y: number }> = ({ y }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2E3A86" />
    {[...Array(14)].map((_, k) => (
      <rect key={k} x={-1500 + k * 300} y={-2000} width={110} height={5000} fill="#FFFFFF" opacity={0.05} />
    ))}
    <rect x={-400} y={y} width={1880} height={50} fill={C.wood} stroke={INK} strokeWidth={8} />
    <g transform={`translate(860 ${y})`}>
      <rect x={-110} y={-280} width={220} height={280} rx={10} fill="#E8C27A" stroke={INK} strokeWidth={8} />
      <rect x={-85} y={-255} width={170} height={230} fill="#FFE1C2" />
      <circle cx={0} cy={-160} r={50} fill="#F2C7A5" stroke={INK} strokeWidth={5} />
      <circle cx={-50} cy={-170} r={24} fill="#F2F2F2" stroke={INK} strokeWidth={4} />
      <ellipse cx={30} cy={-70} rx={40} ry={24} fill="#C9A86B" stroke={INK} strokeWidth={4} />
    </g>
    <g transform={`translate(200 ${y})`}>
      <path d="M -60 0 L 60 0 L 45 -110 L -45 -110 Z" fill={P.orange} stroke={INK} strokeWidth={7} />
      <path d="M 0 -110 Q -60 -250 -100 -230 M 0 -110 Q 10 -280 40 -300 M 0 -110 Q 70 -220 110 -210" fill="none" stroke="#2E9E5B" strokeWidth={22} strokeLinecap="round" />
    </g>
  </g>
);

/** Daumen (von unten ins Bild). */
const Thumb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-70} y={0} width={140} height={700} rx={70} fill={P.skin} stroke={INK} strokeWidth={9} />
    <path d="M -40 30 Q 0 0 40 30 L 40 90 Q 0 110 -40 90 Z" fill="#FFE1D2" stroke={INK} strokeWidth={5} />
  </g>
);

/** Kalender (Bildzeichen: Spalten, ein Tag rot umkreist). */
const Calendar: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-160} y={-200} width={320} height={300} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <rect x={-160} y={-200} width={320} height={70} rx={14} fill={P.red} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 15 }).map((_, k) => (
      <rect key={k} x={-140 + (k % 5) * 58} y={-110 + Math.floor(k / 5) * 66} width={40} height={40} rx={6} fill={P.grey} opacity={0.6} />
    ))}
    <circle cx={-140 + 1 * 58 + 20} cy={-110 + 66 + 20} r={34} fill="none" stroke={P.red} strokeWidth={8} />
  </g>
);

/** Sprechblase mit Fluch-Zeichen „#@%&!“ (der Gag selbst, Piep). */
const CurseBubble: React.FC<{ readonly x: number; readonly y: number; readonly o: number; readonly s?: number }> = ({ x, y, o, s = 1 }) =>
  o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.8 + 0.2 * o)})`} opacity={o}>
      <path d="M -230 -100 Q -240 -190 -120 -190 L 130 -190 Q 240 -190 230 -100 L 230 10 Q 230 80 130 80 L -40 80 L -110 150 L -100 80 L -120 80 Q -230 80 -230 10 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <text x={0} y={-30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={120} fill={P.red} stroke={INK} strokeWidth={6} paintOrder="stroke">
        #@%&!
      </text>
    </g>
  );

/** Popcorn-Becher (gestreift), Körner fallen ab t. */
const Popcorn: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 8 }).map((_, k) => {
      const fall = t > 0 ? t * t * 0.9 + k * 4 * Math.min(1, t / 8) : 0;
      return <circle key={k} cx={-70 + k * 20 + (t > 0 ? Math.sin(k) * t * 2 : 0)} cy={-170 + (k % 3) * 18 + fall} r={26} fill="#FFF4C2" stroke={INK} strokeWidth={5} />;
    })}
    <path d="M -100 -150 L 100 -150 L 80 60 L -80 60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[-60, 0, 60].map((sx) => (
      <path key={sx} d={`M ${sx - 18} -150 L ${sx + 18} -150 L ${sx * 0.8 + 14} 60 L ${sx * 0.8 - 14} 60 Z`} fill={P.red} />
    ))}
  </g>
);

/** Kirche von außen: Fassade, Doppeltür, Stufen. */
const ChurchOutside: React.FC<{ readonly door: number }> = ({ door }) => (
  <g>
    <Sky id="church-out" a="#8ED8FF" b="#E6F7FF" />
    <path d="M -100 1500 L -100 500 L 540 80 L 1180 500 L 1180 1500 Z" fill="#FFE1C2" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <circle cx={540} cy={420} r={110} fill={P.purple} stroke={INK} strokeWidth={9} />
    <path d="M 540 310 L 540 530 M 430 420 L 650 420" stroke={INK} strokeWidth={7} />
    <path d="M 300 1500 L 300 900 Q 540 700 780 900 L 780 1500 Z" fill="#3B2412" stroke={INK} strokeWidth={10} />
    <g transform={`translate(300 0) scale(${1 - door * 0.8} 1)`}>
      <path d="M 0 1500 L 0 900 Q 120 790 240 760 L 240 1500 Z" fill={C.wood} stroke={INK} strokeWidth={8} />
    </g>
    <g transform={`translate(780 0) scale(${-(1 - door * 0.8)} 1)`}>
      <path d="M 0 1500 L 0 900 Q 120 790 240 760 L 240 1500 Z" fill={C.wood} stroke={INK} strokeWidth={8} />
    </g>
    {[0, 1, 2].map((k) => (
      <rect key={k} x={180 - k * 60} y={1500 + k * 60} width={720 + k * 120} height={60} fill="#D9D3E6" stroke={INK} strokeWidth={7} />
    ))}
    <rect x={-2000} y={1680} width={5000} height={2000} fill="#7BC24A" stroke={INK} strokeWidth={8} />
  </g>
);

/** Reihe Trauergäste (sitzend), Gesichter wählbar. */
const Mourners: React.FC<{ readonly y: number; readonly x0: number; readonly n: number; readonly s?: number; readonly eyes?: PersonProps["eyes"]; readonly mouth?: PersonProps["mouth"]; readonly brows?: PersonProps["brows"]; readonly lean?: number; readonly look?: readonly [number, number]; readonly seed?: number; readonly arms?: number }> = ({ y, x0, n, s = 0.8, eyes = "open", mouth = "flat", brows = "sad", lean = 0, look = [0, 0], seed = 0, arms = 10 }) => {
  const shirts = [P.red, P.teal, P.orange, P.purple, P.lime, P.pink, P.ted];
  const hairs: PersonProps["hair"][] = ["side", "curly", "bun", "spiky", "pony", "none"];
  const skins = [P.skin, P.skin2, P.skin3, "#F2C7A5"];
  const cols = ["#4A2E1E", "#2A1B12", "#E8B23A", "#F2F2F2", "#1B1210"];
  return (
    <g>
      {Array.from({ length: n }).map((_, k) => {
        const j = k + seed;
        return <Person key={k} x={x0 + k * 300 * s} y={y} s={s} seated shirt={shirts[j % 7]} skin={skins[j % 4]} hair={hairs[j % 6]} hairColor={cols[j % 5]} eyes={eyes} mouth={mouth} brows={brows} open={0.5} lean={lean * (k % 2 ? 1 : 0.7)} look={look as [number, number]} armL={arms} armR={arms} />;
      })}
    </g>
  );
};

/* ================================================================== */
/* Szenen                                                             */
/* ================================================================== */

export const SHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("funeral", 0.7) - 2], d, f);
  if (i === 0) {
    // Bild 1: Pfarrer liest vom riesigen Handy über dem offenen Sarg, Gäste schrecken zurück (Bewegung ab Bild 1)
    const rec = ease(lf, 3, 14);
    const cam = camPath(lf, [[0, frameOn(500, 1230, 540, 900, 1.4)], [len, frameOn(505, 1220, 540, 900, 1.5)]]);
    return (
      <Shot cam={{ ...cam, y: cam.y + jolt(lf, 6, 10) }}>
        <Layer depth={0.7}>
          <Church />
        </Layer>
        <Layer>
          <Person x={200} y={1500} s={0.78} shirt={P.teal} hair="curly" hairColor="#2A1B12" skin={P.skin2} eyes="wide" look={[1, 0]} brows="up" mouth="scream" open={0.6} lean={lerp(0, -12, rec)} armL={140} armR={120} bendL={-60} bendR={-60} />
          <Person x={370} y={1500} s={0.75} shirt={P.orange} hair="spiky" hairColor="#4A2E1E" skin={P.skin} eyes="wide" look={[1, 0]} brows="up" mouth="o" open={0.6} lean={lerp(0, -8, rec)} handMouth />
          <Coffin x={360} y={1600} s={0.72} />
          <Priest x={740} y={1500} s={1.0} eyes="squint" look={[-1, 0.6]} brows="up" mouth="talk" open={0.5 + 0.3 * Math.sin(lf * 0.9)} armL={60} bendL={-70} armR={70} bendR={-80} />
          <Lectern x={740} y={1500} s={0.95} />
          <Phone x={560} y={1220} s={0.6} r={-8} glow={1}>
            <SearchBar typed={1} />
            <Icon kind="chicken" s={1.2} />
          </Phone>
          <Burst x={560} y={1220} r0={200} r1={260} n={14} o={bump(lf, 8, 8) * 0.8} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // Nah: entsetzte Gesichter, ein Hut fliegt hoch (Comic-Fläche lila)
  const hat = ease(lf, 2, 16);
  return (
    <Shot cam={{ x: 540, y: 900 + jolt(lf, 1, 12), zoom: 1 }}>
      <Layer depth={0}>
        <ReactBg a={P.purple} b="#B28CFF" f={lf} />
      </Layer>
      <Layer>
        <Mourners y={1260} x0={150} n={3} s={1.0} seed={2} eyes="wide" mouth="scream" brows="up" look={[0, -0.5]} arms={150} />
        <g transform={`translate(${450 + hat * 80} ${lerp(560, 120, hat)}) rotate(${hat * 220})`}>
          <ellipse rx={130} ry={26} fill={INK} />
          <rect x={-75} y={-90} width={150} height={90} rx={20} fill={INK} />
          <rect x={-75} y={-30} width={150} height={20} fill={P.red} />
        </g>
      </Layer>
    </Shot>
  );
};

export const SExamples: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("She", 0.18) - 2, W("Rick", 0.32) - 6, W("No", 0.55) - 3, W("mayor", 0.7) - 6], d, f);
  if (i === 0) {
    // Oma schnuppert am grünen Hühnchen, Fliegen kreisen
    const sniff = Math.sin(lf * 0.5) * 4;
    return (
      <Shot cam={camPath(lf, [[0, frameOn(470, 820, 540, 860, 1.35)], [len, frameOn(470, 820, 540, 860, 1.5)]])}>
        <Layer depth={0.7}>
          <Kitchen />
        </Layer>
        <Layer>
          <Granny x={330} y={1500} s={1.05} eyes="half" look={[1, 0.5]} brows="neutral" mouth="smile" nod={8 + sniff} armL={20} armR={60} bendR={-50} />
          <rect x={-2000} y={1180} width={5000} height={60} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
          <BadChicken x={720} y={1170} s={1.0} f={lf} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // „She found out.“ – Oma grün, Kneifaugen, kippt nach hinten
    const fall = ease(lf, 6, 18);
    return (
      <Shot cam={{ ...frameOn(420, 900, 540, 820, 1.3), y: frameOn(420, 900, 540, 820, 1.3).y + jolt(lf, 18, 14) }}>
        <Layer depth={0.7}>
          <Kitchen />
        </Layer>
        <Layer>
          <g transform={`rotate(${lerp(0, -70, fall)} 300 1500)`}>
            <Granny x={330} y={1500} s={1.05} skin="#A9D96B" eyes="xx" brows="worried" mouth="drool" open={0.6} armL={lerp(20, 150, fall)} armR={lerp(60, 160, fall)} />
          </g>
          <rect x={-2000} y={1180} width={5000} height={60} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
          <BadChicken x={760} y={1170} s={1.0} f={lf} />
          <Burst x={330} y={1060} r0={150} r1={220} n={10} o={bump(lf, 18, 6)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Wald: Onkel Rick rennt, Bär mit Serviette direkt dahinter
    const cam = frameOn(560, 900, 540, 820, 0.95);
    return (
      <Shot cam={{ ...cam, x: cam.x + Math.sin(lf * 0.7) * 6 }}>
        <Layer depth={0.6}>
          <Forest scroll={lf * 40} />
        </Layer>
        <Layer>
          <Rick x={760} y={1450 - Math.abs(Math.sin(lf * 0.7)) * 30} s={0.95} lean={14} eyes="wide" look={[-1, 0]} brows="up" mouth="scream" open={0.7} armL={60 + Math.sin(lf * 0.7) * 40} armR={60 - Math.sin(lf * 0.7) * 40} bendL={-60} bendR={-60} />
          <Sweat x={840} y={860} s={1} />
          <Bear x={260} y={1450} s={0.72} f={lf} run={1} />
        </Layer>
      </Shot>
    );
  }
  if (i === 3) {
    // „No.“ – Bär sitzt satt da, Serviette, Rick's Stiefel liegt daneben, leckt sich das Maul
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 900, 540, 820, 1.0)], [len, frameOn(540, 900, 540, 820, 1.12)]])}>
        <Layer depth={0.6}>
          <Forest />
        </Layer>
        <Layer>
          <Bear x={540} y={1450} s={0.8} f={lf} mouth="lick" />
          <g transform="translate(870 1440) rotate(-10)">
            <path d="M -60 0 L -60 -120 L 10 -120 L 10 -40 L 80 -40 Q 100 0 80 0 Z" fill="#5A3418" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          </g>
        </Layer>
      </Shot>
    );
  }
  // Beerdigung des Bürgermeisters: Porträt, Pfarrer scrollt, Witwe schlägt die Hände vors Gesicht
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 840, 1.15)], [len, frameOn(540, 1000, 540, 840, 1.28)]])}>
      <Layer depth={0.7}>
        <Church wall={C.church2} />
      </Layer>
      <Layer>
        <Portrait x={300} y={1500} s={0.8} kind="mayor" />
        <Priest x={800} y={1500} s={0.95} eyes="half" look={[0, 0.6]} brows="neutral" mouth="talk" open={0.4 + 0.3 * Math.sin(lf * 0.8)} armL={60} bendL={-70} armR={60} bendR={-75} />
        <Phone x={760} y={1060} s={0.6} r={-6} glow={0.6}>
          <SearchBar typed={1} />
          <Icon kind="trash" s={1.3} />
        </Phone>
        <Person x={420} y={1600} s={0.95} seated shirt={INK} pants={INK} hair="bun" hairColor="#2A1B12" skin={P.skin2} eyes="closed" brows="sad" mouth="frown" handMouth armL={150} armR={150} bendL={-100} bendR={-100} />
        <Pew y={1480} />
      </Layer>
    </Shot>
  );
};

export const SKevin: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i: i0, lf, len } = useShot([W("For", 0.35) - 3, W("hymns", 0.62) - 4, W("broccoli", 0.85) - 6], d, f);
  if (i0 === 1) {
    // ECU Laptop: Suchverlauf nur aus Heiligenschein-, Noten- und Brokkoli-Bildzeichen, scrollt brav nach oben
    const sc = lf * 6;
    return (
      <Shot cam={{ x: 540, y: 900, zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#2E3A86" />
        </Layer>
        <Layer>
          <rect x={90} y={260} width={900} height={900} rx={30} fill="#555A70" stroke={INK} strokeWidth={12} />
          <rect x={130} y={300} width={820} height={820} rx={14} fill="#FFFFFF" />
          <clipPath id="hist-clip">
            <rect x={130} y={420} width={820} height={700} />
          </clipPath>
          <g transform="translate(540 370)">
            <SearchBar y={0} typed={0} w={700} />
          </g>
          <g clipPath="url(#hist-clip)">
            {Array.from({ length: 12 }).map((_, k) => {
              const y = 480 + k * 130 - (sc % 130) - Math.floor(sc / 130) * 0;
              const kind = k % 3;
              return (
                <g key={k} transform={`translate(0 ${y})`}>
                  <circle cx={230} cy={40} r={20} fill="none" stroke={P.grey} strokeWidth={6} />
                  <line x1={230} y1={40} x2={230} y2={26} stroke={P.grey} strokeWidth={5} />
                  {kind === 0 ? <ellipse cx={330} cy={40} rx={40} ry={14} fill="none" stroke={P.bus} strokeWidth={10} /> : null}
                  {kind === 1 ? <g transform="translate(330 60) scale(0.7)"><ellipse cx={0} cy={0} rx={22} ry={16} fill={INK} transform="rotate(-20)" /><line x1={18} y1={-6} x2={18} y2={-80} stroke={INK} strokeWidth={8} /></g> : null}
                  {kind === 2 ? <Broccoli x={330} y={40} s={0.45} /> : null}
                  <rect x={400} y={28} width={420 - (k % 4) * 60} height={24} rx={12} fill={P.grey} opacity={0.7} />
                </g>
              );
            })}
          </g>
          <rect x={20} y={1160} width={1040} height={44} rx={16} fill="#8A8FA8" stroke={INK} strokeWidth={10} />
        </Layer>
      </Shot>
    );
  }
  const i = i0 === 0 ? 0 : i0 - 1;
  if (i === 0) {
    // Kevin am Schreibtisch, höfliches Lächeln, Laptop
    return (
      <Shot cam={camPath(lf, [[0, frameOn(560, 1150, 540, 820, 1.5)], [len, frameOn(560, 1150, 540, 820, 1.7)]])}>
        <Layer depth={0.7}>
          <Room />
        </Layer>
        <Layer>
          <Kevin x={420} y={1500} s={1.05} seated eyes="open" look={[0, 0]} brows="neutral" mouth="smile" armL={40} armR={50} bendL={-60} bendR={-60} gest={3} />
          <Desk y={1240} />
          <Laptop x={700} y={1240} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Kevin singt aus dem Gesangbuch, Katze hält sich die Ohren zu
    return (
      <Shot cam={camPath(lf, [[0, frameOn(560, 880, 540, 800, 1.05)], [len, frameOn(560, 880, 540, 800, 1.15)]])}>
        <Layer depth={0.7}>
          <Room wall="#FFE9A8" />
        </Layer>
        <Layer>
          <Kevin x={420} y={1500} s={1.0} eyes="closed" brows="up" mouth="scream" open={0.6 + 0.3 * Math.sin(lf * 0.6)} armL={40} armR={40} bendL={-100} bendR={-100} nod={-6} />
          <g transform="translate(420 1250)">
            <path d="M -130 -60 L 0 -40 L 130 -60 L 130 60 L 0 80 L -130 60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            <path d="M 0 -40 L 0 80" stroke={INK} strokeWidth={5} />
            <rect x={-150} y={-70} width={300} height={10} fill={P.red} />
          </g>
          <Notes x={520} y={760} f={lf} />
          <Cat x={860} y={1500} s={0.75} f={lf} />
        </Layer>
      </Shot>
    );
  }
  // Brokkoli: Nahaufnahme, Augenzucken, würgt ihn hinunter (Comic-Fläche grün)
  return (
    <Shot cam={{ x: 540, y: 960 + jolt(lf, 4, 8), zoom: 1 }}>
      <Layer depth={0}>
        <ReactBg a={P.lime} b="#B8F07A" f={lf} cx={540} cy={800} />
      </Layer>
      <Layer>
        <Kevin x={540} y={1650} s={1.7} eyes="twitch" f={lf} brows="worried" mouth="smile" look={[0, 0]} armL={10} armR={130} bendR={-100} />
        <Broccoli x={790} y={600} s={1.1} r={-20} />
        <Sweat x={740} y={760} s={1.4} />
      </Layer>
    </Shot>
  );
};

export const SIncognito: React.FC = () => {
  const { f, d } = useBeats();
  const lean = ease(f, d * 0.5, d * 0.5 + 12);
  // Pfarrer mit Sonnenbrille flüstert, Hand am Mund; Gäste lehnen sich vor, um zu hören
  return (
    <Shot cam={camPath(f, [[0, frameOn(540, 1050, 540, 860, 1.2)], [d, frameOn(560, 1050, 540, 860, 1.4)]])}>
      <Layer depth={0.7}>
        <Church dim={0.25} />
      </Layer>
      <Layer>
        <Priest x={620} y={1500} s={1.0} shades eyes="open" brows="neutral" mouth="shh" lean={-8} armL={120} bendL={-110} armR={20} />
        <path d="M 680 1050 Q 760 1020 820 1060" stroke={P.white} strokeWidth={0} />
        <Coffin x={260} y={1580} s={0.8} />
        <Mourners y={1650} x0={380} n={3} s={0.85} seed={4} eyes="squint" mouth="o" brows="up" lean={lerp(0, -18, lean)} look={[-1, -0.6]} />
        <Pew y={1530} />
      </Layer>
    </Shot>
  );
};

export const SStakes: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("types", 0.55) - 4, W("Grandma's", 0.78) - 5], d, f);
  if (i === 0) {
    // Nacht, Bett, Handy-Licht im Gesicht, Schweiß
    return (
      <Shot cam={camPath(lf, [[0, frameOn(470, 1100, 540, 780, 1.6)], [len, frameOn(470, 1100, 540, 780, 1.8)]])}>
        <Layer depth={0.7}>
          <Room night />
        </Layer>
        <Layer>
          <Bed y={1350} />
          <Kevin x={360} y={1420} s={0.95} seated eyes="wide" look={[1, 0.3]} brows="worried" mouth="flat" armL={10} armR={100} bendR={-80} />
          <Blanket y={1300} />
          <Phone x={600} y={1110} s={0.4} r={-18} glow={1.4}>
            <SearchBar typed={0} />
          </Phone>
          <Sweat x={430} y={880} s={1} o={clamp01((lf - 8) / 8)} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Daumen tippt (Kritzel wachsen) – und löscht wieder (leer)
    const del = W("Deletes", 0.68) - (W("types", 0.55) - 4) - 2;
    const typed = lf < del ? ease(lf, 0, del - 2) : 1 - ease(lf, del, del + 8);
    return (
      <Shot cam={{ x: 540, y: 900, zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.night} />
          <circle cx={540} cy={800} r={900} fill={C.glow} opacity={0.12} />
        </Layer>
        <Layer>
          <Phone x={540} y={820} s={2.6}>
            <SearchBar typed={typed} />
            {lf >= del ? <Icon kind="trash" s={0.8} y={40} /> : null}
          </Phone>
          <Thumb x={lerp(560, 640, (Math.sin(lf * 1.3) + 1) / 2) - (lf >= del ? 60 : 0)} y={lerp(560, 600, (Math.sin(lf * 1.3) + 1) / 2) + 40} s={1.0} r={-18} />
        </Layer>
      </Shot>
    );
  }
  // Omas Urne im Regal kneift die Augen zusammen
  const sq = ease(lf, 4, 14);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 760, 540, 760, 1.4)], [len, frameOn(540, 760, 540, 760, 1.7)]])}>
      <Layer depth={0.6}>
        <Shelf y={1000} />
      </Layer>
      <Layer>
        <Urn x={540} y={1000} s={1.0} squint={sq} look={lerp(0, 1, sq)} />
      </Layer>
    </Shot>
  );
};

export const SSearch: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("hits", 0.45) - 4, W("walks", 0.66) - 4], d, f);
  if (i === 0) {
    // Kevin zuckt die Schultern: „Wer stirbt schon an einem Dienstag?“ (Comic-Fläche gelb, Kalender)
    return (
      <Shot cam={{ x: 540, y: 960, zoom: 1 }}>
        <Layer depth={0}>
          <ReactBg a={P.bus} b="#FFE27A" f={lf} cx={540} cy={760} />
        </Layer>
        <Layer>
          <Kevin x={540} y={1700} s={1.55} eyes="half" look={[0, 0]} brows="up" mouth="smug" armL={lerp(20, 120, bump(lf, len * 0.55, len * 0.4))} armR={lerp(20, 120, bump(lf, len * 0.55, len * 0.4))} bendL={-80} bendR={-80} />
          <Calendar x={860} y={520} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Daumen drückt auf Suchen – Funken
    const press = ease(lf, 2, 7);
    return (
      <Shot cam={{ x: 540, y: 900 + jolt(lf, 7, 10), zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={C.night} />
        </Layer>
        <Layer>
          <Phone x={540} y={820} s={2.6}>
            <SearchBar typed={1} />
            <circle cx={0} cy={40} r={44} fill={P.ted} stroke={INK} strokeWidth={5} />
            <circle cx={-6} cy={34} r={16} fill="none" stroke="#FFFFFF" strokeWidth={6} />
            <line x1={6} y1={46} x2={18} y2={58} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
          </Phone>
          <Thumb x={540} y={lerp(1300, 920, press)} s={1.0} />
          <Burst x={540} y={924} r0={150} r1={150 + 120 * bump(lf, 9, 6)} n={12} o={bump(lf, 9, 6)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // Straße: Kevin läuft lesend, Grinsen wird breiter
  const g = ease(lf, 0, len);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(520, 950, 540, 880, 1.25)], [len, frameOn(560, 950, 540, 880, 1.3)]])}>
      <Layer depth={0.6}>
        <Street />
      </Layer>
      <Layer>
        <Kevin x={lerp(440, 600, g)} y={1450 - Math.abs(Math.sin(lf * 0.4)) * 10} s={1.0} eyes="open" look={[0.6, 0.8]} brows="up" mouth={g > 0.5 ? "grin" : "smile"} armL={10} armR={80} bendR={-80} nod={10} />
        <Phone x={lerp(440, 600, g) + 120} y={1060} s={0.32} r={-14} glow={0.6}>
          <SearchBar typed={1} />
        </Phone>
      </Layer>
    </Shot>
  );
};

export const SBus: React.FC = () => {
  const { f, W } = useBeats();
  // Kevin liest – Hupe – Bus füllt das Bild, weißer Blitz, Handy + ein Schuh wirbeln davon
  const hit = Math.max(8, W("Bus", 0.3) + 2);
  const busX = lerp(2600, 640, ease(f, hit - 9, hit));
  const fly = clamp01((f - hit) / 18);
  return (
    <Shot cam={{ ...frameOn(560, 1150, 540, 900, 1.15), y: frameOn(560, 1150, 540, 900, 1.15).y + jolt(f, hit, 24) }}>
      <Layer depth={0.6}>
        <Street />
      </Layer>
      <Layer>
        {f < hit ? <Kevin x={480} y={1450} s={1.0} eyes={f > hit - 9 ? "wide" : "open"} look={f > hit - 9 ? [1, 0] : [0.6, 0.8]} brows="up" mouth={f > hit - 9 ? "o" : "grin"} open={0.6} armL={10} armR={80} bendR={-80} nod={f > hit - 9 ? 0 : 10} /> : null}
        {f < hit ? <Phone x={600} y={1060} s={0.32} r={-14}><SearchBar typed={1} /></Phone> : null}
        <BusSide x={busX} y={1600} s={1.7} f={f} honk={bump(f, hit - 6, 6)} />
        {f >= hit ? (
          <g transform={`translate(${lerp(480, 300, fly)} ${lerp(1400, 700, fly) + fly * fly * 500}) rotate(${-f * 25})`}>
            <path d="M -60 0 L -60 -90 L 0 -90 L 0 -30 L 70 -30 Q 90 0 70 0 Z" fill={P.red} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          </g>
        ) : null}
        {f >= hit ? (
          <Phone x={lerp(520, 900, fly)} y={lerp(1050, 200, fly) + fly * fly * 300} s={0.4} r={f * 30}>
            <SearchBar typed={1} />
          </Phone>
        ) : null}
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#FFFFFF" opacity={bump(f, hit, 5)} />
      </Layer>
    </Shot>
  );
};

export const SReading: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Kevin's", 0.42) - 4, W("popcorn", 0.88) - 2], d, f);
  if (i === 0) {
    // Freitag: volle Kirche, Pfarrer klopft ans Mikro, Kevins Sarg vorn
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 900, 0.85)], [len, frameOn(540, 1150, 540, 900, 1.0)]])}>
        <Layer depth={0.7}>
          <Church />
        </Layer>
        <Layer>
          <Priest x={760} y={1500} s={0.9} eyes="half" brows="neutral" mouth="flat" armL={20} armR={lerp(60, 140, bump(lf, len * 0.6, 8))} bendR={-90} />
          <Lectern x={760} y={1500} s={0.85} />
          <Coffin x={260} y={1560} s={0.8} who="kevin" />
          <Mourners y={1760} x0={-150} n={6} s={0.72} eyes="open" mouth="flat" brows="sad" look={[0.6, -0.5]} />
          <Pew y={1650} />
          <Pew y={1900} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // ECU Pfarrer liest vom Handy – beim Piep Fluch-Blase
    // Szenen-Frame = lf + Startbild der Einstellung; Piep folgt ~0,5 s nach „my“
    const s0 = W("Kevin's", 0.42) - 4;
    const curse = bump(lf, W("my", 0.6) - s0 + 14, 12);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(580, 1130, 540, 800, 1.5)], [len, frameOn(580, 1110, 540, 800, 1.7)]])}>
        <Layer depth={0.7}>
          <Church />
        </Layer>
        <Layer>
          <Priest x={620} y={1500} s={1.0} eyes={curse > 0.2 ? "wide" : "half"} look={[0, 0.7]} brows={curse > 0.2 ? "up" : "neutral"} mouth="talk" open={0.4 + 0.3 * Math.sin(lf * 0.9)} armL={60} bendL={-80} armR={60} bendR={-80} />
          <Phone x={450} y={1250} s={0.45} r={-12} glow={0.8}>
            <SearchBar typed={1} />
            <Icon kind="q" s={1.2} />
          </Phone>
          <CurseBubble x={700} y={850} o={clamp01(curse * 2)} s={0.6} />
        </Layer>
      </Shot>
    );
  }
  // Gesichter erstarrt, einer lässt Popcorn fallen (Comic-Fläche rot)
  return (
    <Shot cam={{ x: 540, y: 900 + jolt(lf, 2, 10), zoom: 1 }}>
      <Layer depth={0}>
        <ReactBg a={P.red} b="#FF7A86" f={lf} />
      </Layer>
      <Layer>
        <Mourners y={1240} x0={150} n={3} s={1.0} seed={5} eyes="wide" mouth="o" brows="up" look={[0, 0]} />
        <Popcorn x={830} y={1160} s={0.9} t={lf - 4} />
      </Layer>
    </Shot>
  );
};

export const SFallout: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("nuns", 0.2) - 6, W("Same", 0.4) - 4], d, f);
  if (i === 0) {
    // Mama fällt in Ohnmacht nach hinten in die Bank
    const faint = ease(lf, 2, 12);
    return (
      <Shot cam={{ ...frameOn(540, 1000, 540, 800, 1.25), y: frameOn(540, 1000, 540, 800, 1.25).y + jolt(lf, 12, 12) }}>
        <Layer depth={0.7}>
          <Church wall={C.church2} />
        </Layer>
        <Layer>
          <g transform={`rotate(${lerp(0, -38, faint)} 540 1500)`}>
            <Mom x={540} y={1500} s={1.1} seated eyes={faint > 0.5 ? "rolled" : "wide"} brows="up" mouth="o" open={0.6} armL={lerp(20, 160, faint)} armR={lerp(20, 140, faint)} bendL={-30} />
          </g>
          <Pew y={1420} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Drei Nonnen verlassen die Kirche (außen, Türen auf)
    const walk = ease(lf, 0, len);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(560, 1200, 540, 860, 1.15)], [len, frameOn(580, 1220, 540, 860, 1.25)]])}>
        <Layer depth={0.6}>
          <ChurchOutside door={1} />
        </Layer>
        <Layer>
          {[0, 1, 2].map((k) => (
            <Nun key={k} x={330 + k * 210 + lerp(0, 60, walk)} y={lerp(1500, 1640, walk) + k * 20 - Math.abs(Math.sin(lf * 0.45 + k)) * 12} s={lerp(0.75, 0.95, walk)} eyes="squint" look={[1, 0]} brows="angry" mouth="frown" armL={20} armR={20} lean={4} skin={[P.skin, P.skin2, P.skin3][k]} />
          ))}
        </Layer>
      </Shot>
    );
  }
  // Zweite Beerdigung: Busfahrer-Porträt, Pfarrer liest, alle drehen sich langsam zur Kamera
  const s2 = W("Same", 0.4) - 4;
  const turn = ease(lf, W("bus", 0.92) - s2 - 4, W("bus", 0.92) - s2 + 10);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 860, 1.05)], [len, frameOn(540, 1050, 540, 860, 1.2)]])}>
      <Layer depth={0.7}>
        <Church wall="#C9F0FF" />
      </Layer>
      <Layer>
        <Portrait x={300} y={1500} s={0.8} kind="driver" />
        <Coffin x={700} y={1560} s={0.6} who="driver" />
        <Priest x={860} y={1500} s={0.85} eyes="half" look={[0, 0.6]} brows="neutral" mouth="talk" open={0.4 + 0.3 * Math.sin(lf * 0.8)} armL={60} bendL={-70} armR={60} bendR={-75} />
        <Mourners y={1610} x0={-20} n={5} s={0.8} seed={1} eyes={turn > 0.5 ? "squint" : "open"} mouth="flat" brows={turn > 0.5 ? "angry" : "sad"} look={[lerp(0.5, 0, turn), lerp(-0.6, 0.2, turn)]} />
        <Pew y={1500} />
      </Layer>
    </Shot>
  );
};

export const SOutro: React.FC = () => {
  const { f: f0, d, W } = useBeats();
  const cutAt = W("Don't", 0.6) - 3;
  const raise = ease(f0, d * 0.2, d * 0.2 + 14);
  const f = f0;
  if (f0 >= cutAt) {
    // Nah: Pfarrer, Braue hoch, Handy neben dem Gesicht – Blick in die Linse
    const lf = f0 - cutAt;
    return (
      <Shot cam={camPath(lf, [[0, frameOn(600, 1000, 540, 760, 2.1)], [d - cutAt, frameOn(600, 1000, 540, 760, 2.35)]])}>
        <Layer depth={0.7}>
          <Church dim={0.45} />
        </Layer>
        <Layer>
          <Priest x={540} y={1500} s={1.0} eyes="squint" look={[0, 0]} brows="angry" mouth="smug" armL={20} armR={150} bendR={-70} nod={-4} />
          <Phone x={720} y={1000} s={0.5} r={-6} glow={1}>
            <SearchBar typed={0} />
          </Phone>
        </Layer>
      </Shot>
    );
  }
  // Pfarrer blickt in die Linse und hebt langsam das Handy des Zuschauers, Braue hoch
  return (
    <Shot cam={camPath(f, [[0, frameOn(600, 1060, 540, 820, 1.45)], [d, frameOn(600, 1060, 540, 820, 1.7)]])}>
      <Layer depth={0.7}>
        <Church dim={0.35} />
      </Layer>
      <Layer>
        <Priest x={540} y={1500} s={1.0} eyes="open" look={[0, 0]} brows={raise > 0.5 ? "angry" : "up"} mouth="smug" armL={20} armR={lerp(20, 150, raise)} bendR={lerp(0, -70, raise)} />
        <Phone x={lerp(660, 720, raise)} y={lerp(1300, 1000, raise)} s={0.5} r={lerp(10, -6, raise)} glow={raise}>
          <SearchBar typed={0} />
        </Phone>
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const SUCHE_SCENES: Record<string, React.FC> = {
  hook: SHook,
  examples: SExamples,
  kevin: SKevin,
  incognito: SIncognito,
  stakes: SStakes,
  search: SSearch,
  bus: SBus,
  reading: SReading,
  fallout: SFallout,
  outro: SOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(SUCHE_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): nur Untertitel-Phrasen + Cover-Titel. */
export const SUCHE_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

export const SUCHE_SHOT_COUNT: Record<string, number> = { hook: 2, examples: 5, kevin: 4, incognito: 1, stakes: 3, search: 3, bus: 1, reading: 3, fallout: 3, outro: 2 };
