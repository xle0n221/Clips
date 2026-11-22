import React from "react";
import { bump, camPath, clamp01, ease, frameOn, jolt, Layer, lerp, Stage2D } from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/fluch-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, Granny, INK, P, Person, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";
import { Church, CurseBubble, Mom, Pew, Priest, ReactBg } from "./suche";
import { Bed, Room } from "./akku";
import { Poof } from "./todo";

/**
 * „In This City, Every Time You Swear, Your Mom Appears“ (episodes/fluch-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Konsequenz = Peinlichkeit (keine Tote, Abwechslung nach todo/suche/akku). Eine Text-Ebene (Untertitel; Fluch-Blasen
 * „#@%&!“ sind der Gag), Schnitte an Wort-Beats, kein Set > 2 am Stück (FLUCH_SHOT_COUNT).
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

const F = {
  dave: "#2FA84F",
  tie: "#E8413A",
  slipper: "#FF8FC7",
  robe: "#7FD6FF",
  garage: "#8FA3C8",
  or: "#BFF2DE",
  board: "#26306B",
  sea: "#1E8FE0",
  sky: "#8ED8FF",
  kid: "#FFC6E0",
  hall: "#FFD9A8",
  asphalt: "#4A4E63",
  wood: "#B8693A",
  woodDark: "#7E4320",
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Dave: React.FC<Fig> = (p) => <Person pants="#1F5E33" suit {...p} shirt={F.dave} hair="spiky" hairColor="#6B3A1E" skin={P.skin} />;
const Surgeon: React.FC<Fig> = (p) => <Person pants="#1D9E86" {...p} shirt={P.teal} hair="none" hairColor="#000" skin={P.skin2} />;
const Ceo: React.FC<Fig> = (p) => <Person pants="#22222E" suit {...p} shirt="#2B2B3A" hair="side" hairColor="#9A9A9A" skin="#F2C7A5" />;
const Sailor: React.FC<Fig & { readonly c?: string }> = ({ c = P.skin, ...p }) => (
  <Person pants="#1E3A8A" {...p} shirt="#FFFFFF" hair="none" hairColor="#000" skin={c} chest={<g>{[-250, -200, -150].map((y) => <rect key={y} x={-90} y={y} width={180} height={18} fill="#1E3A8A" />)}</g>} />
);
const InLaw: React.FC<Fig> = (p) => <Person pants={F.robe} cardigan {...p} shirt={F.robe} hair="curly" hairColor="#A8A8B0" skin="#F2C7A5" />;
const Bride: React.FC<Fig> = (p) => <Person pants="#FFFFFF" {...p} shirt="#FFFFFF" hair="bun" hairColor="#8A4B22" skin={P.skin3} />;

/** Handposition (ohne Ellenbogen-Beugung, ohne Neigung) – Ursprung Füße wie Person. */
const hand = (x: number, y: number, s: number, deg: number, side: 1 | -1, seated = false, flip = false) => {
  const sh = (seated ? -250 : -330) + 40;
  const a = (deg * Math.PI) / 180;
  const k = flip ? -1 : 1;
  return [x + k * side * (78 + Math.sin(a) * 130) * s, y + (sh + Math.cos(a) * 130) * s] as const;
};

/** Plüsch-Hausschuh, Ursprung = Ferse (in der Hand), zeigt nach oben. */
const Slipper: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number; readonly c?: string }> = ({ x, y, s = 1, r = 0, c = F.slipper }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -34 -170 Q -50 -205 0 -210 Q 50 -205 34 -170 L 42 0 Q 0 36 -42 0 Z" fill={c} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -38 -95 Q 0 -130 38 -95 L 40 -45 Q 0 -65 -40 -45 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    {[-20, 0, 20].map((k) => <circle key={k} cx={k} cy={-118} r={9} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}
  </g>
);

/** Mutter (pinke Strickjacke) mit erhobenem Hausschuh; raise = Armwinkel rechts. */
const MomS: React.FC<Fig & { readonly raise?: number; readonly shake?: number }> = ({ raise = 160, shake = 0, ...p }) => {
  const s = p.s ?? 1;
  const [hx, hy] = hand(p.x, p.y, s, raise, 1, p.seated, p.flip);
  return (
    <g>
      <Mom {...p} armR={raise} cardigan />
      <Slipper x={hx + Math.sin(shake * 2.7) * (shake ? 6 : 0)} y={hy} s={s * 0.9} r={(p.flip ? -1 : 1) * (raise > 120 ? -15 : 30)} />
    </g>
  );
};

/** Lockenwickler auf dem Kopf (Schwiegermutter). */
const Curlers: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y - 416 * s}) scale(${s})`}>
    {[-70, -25, 25, 70].map((k, j) => (
      <rect key={k} x={k - 20} y={-118 + Math.abs(k) * 0.35 - (j % 2) * 8} width={40} height={30} rx={12} fill={P.pink} stroke={INK} strokeWidth={5} />
    ))}
  </g>
);

/** Weißer Brautschleier hinter dem Kopf + Blumenkranz. */
const Veil: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly front?: boolean }> = ({ x, y, s = 1, front }) => (
  <g transform={`translate(${x} ${y - 416 * s}) scale(${s})`}>
    {front ? (
      [-60, -20, 20, 60].map((k) => <circle key={k} cx={k} cy={-92 + Math.abs(k) * 0.3} r={16} fill={k % 40 === 0 ? P.pink : P.bus} stroke={INK} strokeWidth={4} />)
    ) : (
      <path d="M -95 -60 Q -170 120 -150 330 L 150 330 Q 170 120 95 -60 Q 0 -140 -95 -60 Z" fill="#FFFFFF" opacity={0.85} stroke={INK} strokeWidth={5} />
    )}
  </g>
);

/** Matrosenmütze. */
const SailorHat: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y - 416 * s}) scale(${s})`}>
    <path d="M -80 -80 Q 0 -150 80 -80 L 70 -60 Q 0 -90 -70 -60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <rect x={-72} y={-72} width={144} height={14} fill="#1E3A8A" />
  </g>
);

/** Pochende Stirn-Ader (Kopf-Koordinaten wie Person). */
const Vein: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly k?: number }> = ({ x, y, s = 1, f, k = 1 }) => {
  const pulse = 1 + 0.18 * Math.max(0, Math.sin(f * 0.9)) * k;
  return (
    <g transform={`translate(${x + 28 * s} ${y - 416 * s - 62 * s}) scale(${s * pulse * k})`}>
      <path d="M 0 30 L 0 -10 L -26 -38 M 0 -10 L 24 -40 M 0 10 L 22 22" fill="none" stroke="#B0103A" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** Pochender, roter Daumen (Hammer). */
const Thumb: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number }> = ({ x, y, s = 1, f }) => {
  const k = 1 + 0.15 * Math.max(0, Math.sin(f * 0.7));
  return (
    <g transform={`translate(${x} ${y}) scale(${s * k})`}>
      <ellipse cx={0} cy={0} rx={46} ry={56} fill="#FF4D5E" stroke={INK} strokeWidth={6} />
      <ellipse cx={-12} cy={-18} rx={12} ry={16} fill="#FFFFFF" opacity={0.5} />
    </g>
  );
};

const Hammer: React.FC<{ readonly x: number; readonly y: number; readonly r?: number; readonly s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-12} y={-20} width={24} height={200} rx={10} fill={F.wood} stroke={INK} strokeWidth={6} />
    <rect x={-60} y={-60} width={120} height={50} rx={10} fill="#8A8FA3" stroke={INK} strokeWidth={6} />
  </g>
);

/* ------------------------------------------------------------------ */
/* Sets                                                               */
/* ------------------------------------------------------------------ */

const Garage: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={F.garage} />
    <rect x={-300} y={500} width={1700} height={520} fill="#C9A27A" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 60 }).map((_, k) => (
      <circle key={k} cx={-260 + (k % 15) * 110} cy={540 + Math.floor(k / 15) * 120} r={8} fill={INK} opacity={0.5} />
    ))}
    <path d="M 100 640 l 0 160 M 60 640 l 80 0" stroke={INK} strokeWidth={14} />
    <circle cx={820} cy={720} r={70} fill="none" stroke={INK} strokeWidth={14} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#6F7690" />
    <rect x={-400} y={1180} width={1900} height={60} rx={10} fill={F.wood} stroke={INK} strokeWidth={8} />
    <rect x={-380} y={1240} width={40} height={260} fill={F.woodDark} stroke={INK} strokeWidth={6} />
    <rect x={1420} y={1240} width={40} height={260} fill={F.woodDark} stroke={INK} strokeWidth={6} />
  </g>
);

const OpRoom: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={F.or} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#8FD3C0" />
    <ellipse cx={540} cy={330} rx={300} ry={80} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    <path d={`M 300 380 L 120 1200 L 960 1200 L 780 380 Z`} fill="#FFFDE0" opacity={0.25 + 0.05 * Math.sin(f * 0.2)} />
    <rect x={150} y={1180} width={780} height={60} rx={14} fill="#DCE6F0" stroke={INK} strokeWidth={8} />
    <rect x={500} y={1240} width={80} height={260} fill="#9AA3B5" stroke={INK} strokeWidth={6} />
    <path d="M 220 1180 Q 540 1060 860 1180 Z" fill="#7FA8FF" stroke={INK} strokeWidth={7} />
    <rect x={1000} y={700} width={220} height={160} rx={14} fill={INK} />
    <path d={`M 1015 790 l 40 0 l 15 -40 l 20 80 l 15 -40 l 100 0`} fill="none" stroke={P.lime} strokeWidth={6} />
  </g>
);

const Boardroom: React.FC<{ readonly up?: number }> = ({ up = 0 }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3500} fill={F.board} />
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <rect key={k} x={-500 + k * 380} y={300 + (k % 3) * 60} width={160} height={1200} fill="#3A4690" />
    ))}
    <rect x={160} y={360} width={760} height={520} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    <path d={`M 220 820 L 380 760 L 520 790 L ${lerp(680, 640, up)} ${lerp(720, 600, up)} L ${lerp(860, 860, up)} ${lerp(690, 410, up)}`} fill="none" stroke={up > 0.3 ? "#22A84F" : P.red} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
    {up > 0.3 ? <path d="M 830 420 L 875 400 L 870 450" fill="none" stroke="#22A84F" strokeWidth={14} strokeLinecap="round" /> : null}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#1A2050" />
    <path d="M -300 1250 L 1380 1250 L 1500 1420 L -420 1420 Z" fill="#7A4A2A" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </g>
);

const Ship: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3000} fill={F.sky} />
    <circle cx={850} cy={300} r={110} fill="#FFE27A" />
    <rect x={-2000} y={1000} width={5000} height={3000} fill={F.sea} />
    {Array.from({ length: 10 }).map((_, k) => (
      <path key={k} d={`M ${-300 + k * 200 + ((f * 3) % 200)} ${1060 + (k % 2) * 40} q 40 -30 80 0`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
    ))}
    <path d="M -400 1250 L 1500 1250 L 1350 1700 L -250 1700 Z" fill={F.wood} stroke={INK} strokeWidth={9} />
    <rect x={-400} y={1210} width={1900} height={50} fill={F.woodDark} stroke={INK} strokeWidth={8} />
    <rect x={500} y={-200} width={50} height={1420} fill={F.woodDark} stroke={INK} strokeWidth={8} />
    <path d="M 560 -100 Q 900 200 560 700 Z" fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    {[0, 1].map((k) => (
      <path key={k} d={`M ${150 + k * 600 + Math.sin(f * 0.1 + k) * 30} ${250 + k * 80} q 30 -30 60 0 q 30 -30 60 0`} fill="none" stroke={INK} strokeWidth={7} />
    ))}
  </g>
);

const KidRoom: React.FC<{ readonly marks?: number }> = ({ marks = 1 }) => {
  const n = Math.floor(lerp(40, 180, marks));
  return (
    <g>
      <Room wall={F.kid} floor={1500} />
      {Array.from({ length: n }).map((_, k) => {
        const g = Math.floor(k / 5);
        const gx = -350 + (g % 14) * 125;
        const gy = 560 + Math.floor(g / 14) * 130;
        const j = k % 5;
        return j < 4 ? <line key={k} x1={gx + j * 20} x2={gx + j * 20} y1={gy} y2={gy + 90} stroke={INK} strokeWidth={7} strokeLinecap="round" /> : <line key={k} x1={gx - 12} x2={gx + 75} y1={gy + 80} y2={gy + 10} stroke={P.red} strokeWidth={7} strokeLinecap="round" />;
      })}
      <circle cx={900} cy={1000} r={60} fill={P.bus} stroke={INK} strokeWidth={6} />
    </g>
  );
};

const Mirror: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 260} y={y - 380} width={520} height={760} rx={260} fill="#BFE8FF" stroke={F.woodDark} strokeWidth={30} />
    <path d={`M ${x - 150} ${y - 250} L ${x - 60} ${y - 330} M ${x - 180} ${y - 150} L ${x - 30} ${y - 280}`} stroke="#FFFFFF" strokeWidth={16} strokeLinecap="round" opacity={0.7} />
  </g>
);

const ChurchOut: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3600} fill={F.sky} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#7BC96F" />
    <rect x={160} y={600} width={760} height={900} fill="#FFF4DE" stroke={INK} strokeWidth={10} />
    <path d="M 120 620 L 540 260 L 960 620 Z" fill={P.red} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <rect x={460} y={-100} width={160} height={400} fill="#FFF4DE" stroke={INK} strokeWidth={10} />
    <path d="M 440 -100 L 540 -260 L 640 -100 Z" fill={P.red} stroke={INK} strokeWidth={10} />
    <g transform={`rotate(${Math.sin(f * 0.25) * 18} 540 40)`}>
      <path d="M 500 40 Q 500 120 480 140 L 600 140 Q 580 120 580 40 Q 540 10 500 40 Z" fill={P.bus} stroke={INK} strokeWidth={6} />
    </g>
    <path d="M 420 1500 L 420 1200 Q 540 1080 660 1200 L 660 1500 Z" fill={F.woodDark} stroke={INK} strokeWidth={9} />
    {[260, 820].map((x) => <circle key={x} cx={x} cy={900} r={70} fill={P.purple} stroke={INK} strokeWidth={8} />)}
  </g>
);

const Armchair: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 230} y={y - 520} width={460} height={420} rx={80} fill="#8E5BD6" stroke={INK} strokeWidth={9} />
    <rect x={x - 270} y={y - 260} width={110} height={260} rx={40} fill="#7A48C2" stroke={INK} strokeWidth={9} />
    <rect x={x + 160} y={y - 260} width={110} height={260} rx={40} fill="#7A48C2" stroke={INK} strokeWidth={9} />
  </g>
);
const ArmchairFront: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 230} y={y - 130} width={460} height={130} rx={30} fill="#9B6AE0" stroke={INK} strokeWidth={9} />
    <rect x={x - 270} y={y - 260} width={110} height={260} rx={40} fill="#7A48C2" stroke={INK} strokeWidth={9} />
    <rect x={x + 160} y={y - 260} width={110} height={260} rx={40} fill="#7A48C2" stroke={INK} strokeWidth={9} />
  </g>
);

const Car: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly c?: string; readonly flip?: boolean; readonly sport?: boolean }> = ({ x, y, s = 1, c = "#4F86F7", flip, sport }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d={sport ? "M -300 -60 L -260 -140 L -60 -170 L 120 -150 L 300 -90 L 300 -20 L -300 -20 Z" : "M -300 -70 L -280 -160 L -160 -260 L 120 -260 L 220 -160 L 300 -140 L 300 -20 L -300 -20 Z"} fill={c} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d={sport ? "M -200 -140 L -60 -160 L 80 -145 L 20 -100 L -200 -100 Z" : "M -250 -160 L -150 -240 L 90 -240 L 180 -160 Z"} fill="#BFE8FF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {[-180, 180].map((k) => (
      <g key={k}>
        <circle cx={k} cy={-20} r={62} fill={INK} />
        <circle cx={k} cy={-20} r={26} fill="#C9CEDB" />
      </g>
    ))}
  </g>
);

const Parking: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={3000} fill="#FFB27A" />
    {[-300, 0, 260, 600, 900, 1200].map((x, k) => (
      <rect key={x} x={x} y={500 - (k % 3) * 120} width={220} height={600 + (k % 3) * 120} fill={["#7A6BD6", "#5A86D6", "#D66B9A"][k % 3]} stroke={INK} strokeWidth={6} />
    ))}
    <rect x={-2000} y={1000} width={5000} height={3000} fill={F.asphalt} />
    {[-200, 250, 700, 1150].map((x) => (
      <path key={x} d={`M ${x} 1050 L ${x - 120} 1900`} stroke="#FFFFFF" strokeWidth={16} />
    ))}
  </g>
);

/** Altar mit Stufe (Kirche innen). */
const Altar: React.FC<{ readonly floor?: number }> = ({ floor = 1500 }) => (
  <g>
    <rect x={240} y={floor - 300} width={600} height={300} fill="#FFF4DE" stroke={INK} strokeWidth={9} />
    <rect x={200} y={floor - 330} width={680} height={40} fill={P.bus} stroke={INK} strokeWidth={8} />
    {[380, 700].map((x) => (
      <g key={x}>
        <rect x={x - 14} y={floor - 450} width={28} height={120} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
        <path d={`M ${x} ${floor - 500} q 14 25 0 44 q -14 -19 0 -44`} fill={P.orange} />
      </g>
    ))}
    <rect x={-600} y={floor} width={2300} height={50} fill={F.woodDark} stroke={INK} strokeWidth={7} />
  </g>
);

/** Bodengitter (Abfluss) in der Kirche, Nahaufnahme. */
const Drain: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y} rx={230} ry={80} fill="#3A3F52" stroke={INK} strokeWidth={9} />
    {[-160, -80, 0, 80, 160].map((k) => (
      <rect key={k} x={x + k - 16} y={y - 60 + Math.abs(k) * 0.12} width={32} height={120 - Math.abs(k) * 0.4} rx={8} fill={INK} />
    ))}
  </g>
);

const Ring: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={46} ry={40} fill="none" stroke={INK} strokeWidth={26} />
    <ellipse cx={0} cy={0} rx={46} ry={40} fill="none" stroke={P.bus} strokeWidth={14} />
    <path d="M -16 -48 L 0 -76 L 16 -48 Z" fill="#BFF4FF" stroke={INK} strokeWidth={5} />
  </g>
);

const Hall: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <Room wall={F.hall} floor={1500} />
    {Array.from({ length: 14 }).map((_, k) => (
      <circle key={k} cx={-300 + k * 130} cy={220 + Math.sin(k * 0.9) * 40} r={16} fill={[P.bus, P.pink, P.lime][k % 3]} stroke={INK} strokeWidth={4} opacity={0.75 + 0.25 * Math.sin(f * 0.3 + k)} />
    ))}
    <path d="M -300 210 Q 600 330 1500 210" fill="none" stroke={INK} strokeWidth={5} />
  </g>
);

const Cake: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((k) => (
      <rect key={k} x={-150 + k * 40} y={-120 - k * 110} width={300 - k * 80} height={110} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    ))}
    <circle cx={-12} cy={-350} r={18} fill={P.red} stroke={INK} strokeWidth={4} />
    <circle cx={14} cy={-352} r={18} fill={P.red} stroke={INK} strokeWidth={4} />
  </g>
);

const Confetti: React.FC<{ readonly f: number; readonly o?: number }> = ({ f, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 40 }).map((_, k) => (
      <rect key={k} x={((k * 137) % 1300) - 100 + Math.sin(f * 0.1 + k) * 30} y={((f * (6 + (k % 5)) + k * 97) % 1700) - 100} width={22} height={34} fill={[P.bus, P.pink, P.lime, P.sky, P.orange][k % 5]} transform={`rotate(${(f * 7 + k * 40) % 360} ${((k * 137) % 1300) - 100} ${((f * (6 + (k % 5)) + k * 97) % 1700) - 100})`} />
    ))}
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

export const FHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const mom = W("mom", 0.6);
  const { i, lf, len } = useShot([mom - 2], d, f);
  if (i === 0) {
    // Garage: Hammer trifft den Daumen (ab Bild 0 in Bewegung), Fluch-Blase + Piep
    const hit = 4;
    const sw = lf < hit ? lerp(-70, 0, lf / hit) : -10 * Math.exp(-(lf - hit) * 0.3);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 900, 1.3)], [len, frameOn(540, 1000, 540, 900, 1.45)]])}>
        <Layer depth={0.6}>
          <Garage />
        </Layer>
        <Layer>
          <Dave x={420} y={1500} s={1.05} eyes={lf > hit ? "xx" : "open"} brows={lf > hit ? "angry" : "neutral"} mouth={lf > hit ? "scream" : "flat"} open={0.9} armL={60} armR={50} bendR={-40} />
          <Thumb x={640} y={1170} s={1} f={lf} />
          <Hammer x={700} y={1020} r={sw} s={1.1} />
          <Burst x={640} y={1170} r0={70} r1={160} n={10} o={bump(lf, hit + 2, 8)} color={P.red} />
          <CurseBubble x={640} y={700} o={clamp01((lf - hit) / 3)} s={0.85} />
          <Sweat x={300} y={760} s={1} />
        </Layer>
      </Shot>
    );
  }
  // POOF: Mutter mit Hausschuh erscheint hinter ihm – er erstarrt
  const arr = clamp01((lf - 3) / 6);
  return (
    <Shot cam={{ ...frameOn(540, 1050, 540, 820, 1.2), x: frameOn(540, 1050, 540, 820, 1.2).x + jolt(lf, 3, 14) }}>
      <Layer depth={0.6}>
        <Garage />
      </Layer>
      <Layer>
        {arr > 0 ? <MomS x={760} y={1500} s={1.15 * (0.8 + 0.2 * arr)} raise={lerp(90, 165, ease(lf, 6, 14))} eyes="squint" brows="angry" mouth="frown" armL={40} bendL={-60} /> : null}
        <Poof x={760} y={1050} t={lf} s={1.4} />
        <Dave x={380} y={1500} s={1.05} eyes="wide" look={[1, -0.3]} brows="up" mouth="o" open={0.4} armL={10} armR={10} />
        <Thumb x={500} y={1210} s={0.6} f={lf} />
        <Sweat x={300} y={780} s={1.1} o={clamp01((lf - 8) / 4)} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const FRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("His", 0.2) - 2, W("CEO", 0.45) - 3, W("Now", 0.65) - 2], d, f);
  if (i === 0) {
    // OP-Saal: Chirurg lässt das Skalpell fallen, Fluch-Blase
    return (
      <Shot cam={camPath(lf, [[0, frameOn(400, 1060, 540, 780, 1.2)], [len, frameOn(420, 1060, 540, 780, 1.32)]])}>
        <Layer depth={0.7}>
          <OpRoom f={lf} />
        </Layer>
        <Layer>
          <Surgeon x={400} y={1500} s={1} mask={0} eyes="wide" brows="angry" mouth="scream" open={0.8} armL={70} armR={110} bendR={-40} />
          <rect x={590} y={lerp(1080, 1460, ease(lf, 0, 10, "linear"))} width={70} height={14} rx={5} fill="#C9CEDB" stroke={INK} strokeWidth={4} transform={`rotate(${lf * 25} 625 ${lerp(1087, 1467, ease(lf, 0, 10, "linear"))})`} />
          <CurseBubble x={620} y={720} o={clamp01(lf / 3)} s={0.75} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Mutter operiert ruhig, Chirurg schmollt in der Ecke auf einem Hocker
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1080, 540, 820, 1.0)], [len, frameOn(540, 1080, 540, 820, 1.1)]])}>
        <Layer depth={0.7}>
          <OpRoom f={lf} />
        </Layer>
        <Layer>
          <MomS x={560} y={1500} s={1} raise={30} eyes="half" brows="neutral" mouth="smug" armL={60} bendL={-50} gest={5} />
          <rect x={30} y={1380} width={150} height={30} rx={10} fill="#9AA3B5" stroke={INK} strokeWidth={5} />
          <rect x={95} y={1410} width={20} height={90} fill="#9AA3B5" stroke={INK} strokeWidth={4} />
          <Surgeon x={105} y={1385} s={0.62} seated eyes="half" brows="sad" mouth="frown" armL={20} armR={20} nod={10} />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Vorstand: CEO haut auf den Tisch, Fluch-Blase, Kurve fällt
    const slam = W("swore", 0.55, 2) - (W("CEO", 0.45) - 3);
    return (
      <Shot cam={{ ...frameOn(540, 1040, 540, 800, 1.15), y: frameOn(540, 1040, 540, 800, 1.15).y + jolt(lf, slam, 12) }}>
        <Layer depth={0.7}>
          <Boardroom up={0} />
        </Layer>
        <Layer>
          {[-80, 1160].map((x, k) => (
            <Person key={x} x={x} y={1500} s={0.9} shirt={[P.purple, P.orange][k]} suit hair={k ? "curly" : "side"} hairColor="#2A1B12" skin={k ? P.skin3 : P.skin} eyes="wide" brows="up" mouth="o" open={0.3} armL={20} armR={20} />
          ))}
          <Ceo x={540} y={1500} s={1} eyes={lf > slam ? "squint" : "open"} brows="angry" mouth={lf > slam ? "scream" : "frown"} open={0.8} armL={lf > slam ? 150 : 40} armR={lf > slam ? 150 : 40} bendL={-30} bendR={-30} />
          <CurseBubble x={720} y={680} o={clamp01((lf - slam) / 3)} s={0.75} />
        </Layer>
      </Shot>
    );
  }
  // Mutter leitet den Konzern: Kurve schießt hoch, CEO sitzt auf einem Kinderstuhl
  const up = ease(lf, W("better", 0.8) - (W("Now", 0.65) - 2) - 10, W("better", 0.8) - (W("Now", 0.65) - 2) + 6);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 820, 1.0)], [len, frameOn(540, 1000, 540, 820, 1.08)]])}>
      <Layer depth={0.7}>
        <Boardroom up={up} />
      </Layer>
      <Layer>
        <MomS x={540} y={1500} s={1} raise={lerp(60, 165, up)} eyes="half" brows="neutral" mouth={up > 0.5 ? "grin" : "smug"} armL={130} bendL={-70} />
        <rect x={880} y={1420} width={130} height={24} rx={8} fill={P.red} stroke={INK} strokeWidth={5} />
        <Ceo x={945} y={1420} s={0.55} seated eyes="half" brows="sad" mouth="frown" armL={20} armR={20} nod={8} />
        <Burst x={860} y={420} r0={40} r1={110} n={8} o={bump(lf, (W("better", 0.8) - (W("Now", 0.65) - 2)) + 4, 8)} color="#22A84F" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* orphans                                                            */
/* ================================================================== */

export const FOrphans: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Most", 0.5) - 2], d, f);
  if (i === 0) {
    // Comic-Fläche: Mann stößt sich, flucht, schaut sich um – niemand kommt – er grinst
    const look = lf > 18;
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 800, 1.15)], [len, frameOn(540, 1084, 540, 800, 1.25)]])}>
        <Layer depth={0}>
          <ReactBg a={P.lime} b="#B8F07A" f={lf} />
        </Layer>
        <Layer>
          <Person x={540} y={1500} s={1} shirt={P.orange} hair="curly" hairColor="#2A1B12" skin={P.skin2} eyes={look ? "open" : "xx"} look={look ? [Math.sin(lf * 0.25), 0] : [0, 0]} brows={look ? "up" : "angry"} mouth={lf > 32 ? "grin" : look ? "flat" : "scream"} open={0.8} armL={30} armR={30} gest={look ? 0 : 6} />
          <CurseBubble x={740} y={720} o={lf < 20 ? clamp01(lf / 3) : clamp01((24 - lf) / 4)} s={0.75} />
          <Poof x={880} y={1100} t={lf - 22} s={0.6} />
        </Layer>
      </Shot>
    );
  }
  // Schiff: fröhliche Matrosen fluchen, überall Blasen
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1060, 540, 860, 0.95)], [len, frameOn(560, 1060, 540, 860, 1.05)]])}>
      <Layer depth={0.6}>
        <Ship f={lf} />
      </Layer>
      <Layer>
        {[
          [150, P.skin],
          [540, P.skin3],
          [930, P.skin2],
        ].map(([x, c], k) => (
          <g key={k}>
            <Sailor x={x as number} y={1520} s={0.85} c={c as string} eyes={k === 1 ? "closed" : "open"} brows="up" mouth={k === 1 ? "grin" : "talk"} open={0.6 + 0.3 * Math.sin(lf * 0.5 + k)} armL={k === 0 ? 150 : 30} armR={k === 2 ? 150 : 40} gest={8} />
            <SailorHat x={x as number} y={1520} s={0.85} />
            <CurseBubble x={Math.min(900, (x as number) + 120)} y={720 - (k % 2) * 90} o={clamp01((lf - k * 5) / 3)} s={0.5} />
          </g>
        ))}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* dave                                                               */
/* ================================================================== */

export const FDave: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Today", 0.45) - 2, W("Can", 0.65) - 2], d, f);
  if (i === 0) {
    // Erwachsener Dave auf winzigem Kinderbett, Wand voller Strichlisten
    const m = ease(lf, W("grounded", 0.3) - 4, W("grounded", 0.3) + 30);
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 820, 1.25)], [len, frameOn(540, 900, 540, 820, 0.95)]])}>
        <Layer depth={0.7}>
          <KidRoom marks={m} />
        </Layer>
        <Layer>
          <Bed x={560} y={1500} w={460} c={P.pink} />
          <Dave x={560} y={1360} s={1} seated eyes="half" bags={0.6} brows="sad" mouth="flat" armL={20} armR={20} nod={-4} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Spiegel: Dave im Hochzeitsanzug übt ein Lächeln, schwitzt
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 800, 1.3)], [len, frameOn(540, 1000, 540, 800, 1.42)]])}>
        <Layer depth={0.7}>
          <Room wall="#BFE8FF" floor={1500} />
          <Mirror x={800} y={920} />
        </Layer>
        <Layer>
          <Dave x={420} y={1500} s={1} eyes="wide" look={[1, 0]} brows="worried" mouth="grin" armL={20} armR={60} bendR={-80} />
          <Dave x={800} y={1500} s={0.7} flip eyes="wide" look={[-1, 0]} brows="worried" mouth="grin" armL={20} armR={60} bendR={-80} />
          <Sweat x={330} y={760} s={1} />
          <Sweat x={500} y={720} s={0.8} o={bump(lf, 14, 10)} />
        </Layer>
      </Shot>
    );
  }
  // Kirche außen: Glocke schwingt, Braut winkt, Dave „Reißverschluss“ über den Mund
  const zip = ease(lf, len * 0.5, len * 0.5 + 8);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 860, 0.9)], [len, frameOn(540, 1050, 540, 860, 1.05)]])}>
      <Layer depth={0.6}>
        <ChurchOut f={lf} />
      </Layer>
      <Layer>
        <Veil x={760} y={1560} s={0.9} />
        <Bride x={760} y={1560} s={0.9} eyes="closed" brows="up" mouth="smile" armR={lerp(140, 170, Math.sin(lf * 0.4) * 0.5 + 0.5)} armL={15} />
        <Veil x={760} y={1560} s={0.9} front />
        <Dave x={320} y={1560} s={0.95} eyes="wide" brows="worried" mouth={zip > 0.5 ? "flat" : "o"} open={0.3} armR={lerp(30, 160, zip)} bendR={-120} armL={15} />
        {zip > 0 ? <path d={`M 290 ${1560 - 416 * 0.95 + 42} L ${lerp(290, 370, zip)} ${1560 - 416 * 0.95 + 42}`} stroke={INK} strokeWidth={8} strokeDasharray="10 6" /> : null}
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* morning                                                            */
/* ================================================================== */

export const FMorning: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Dave", 0.4) - 2, W("his", 0.7, 2) - 2], d, f);
  if (i === 0) {
    // Nahaufnahme: nackter Zeh knallt gegen den Bettpfosten
    const hit = W("stubs", 0.2) + 2;
    const x = lf < hit ? lerp(200, 560, ease(lf, 0, hit, "linear")) : 560 - 20 * Math.exp(-(lf - hit) * 0.3);
    return (
      <Shot cam={{ x: 540 + jolt(lf, hit, 16), y: 960, zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#9DB7FF" />
          <rect x={-2000} y={1150} width={5000} height={2000} fill={F.wood} />
        </Layer>
        <Layer>
          <rect x={620} y={300} width={180} height={900} rx={20} fill={F.woodDark} stroke={INK} strokeWidth={10} />
          <g transform={`translate(${x} 1000)`}>
            <rect x={-700} y={-60} width={640} height={130} rx={60} fill={P.skin} stroke={INK} strokeWidth={9} />
            <ellipse cx={-40} cy={0} rx={70} ry={80} fill={lf > hit ? "#FF4D5E" : P.skin} stroke={INK} strokeWidth={9} />
          </g>
          <Burst x={600} y={1000} r0={110} r1={260} n={12} o={bump(lf, hit + 2, 10)} color={P.red} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Dave schreit lautlos ins Kissen (Adern, zitternd)
    return (
      <Shot cam={{ ...frameOn(540, 1050, 540, 820, 1.35), x: frameOn(540, 1050, 540, 820, 1.35).x + Math.sin(lf * 2.1) * 4 }}>
        <Layer depth={0.7}>
          <Room wall="#9DB7FF" floor={1500} window />
        </Layer>
        <Layer>
          <Bed x={560} y={1500} w={900} c="#7FA8FF" />
          <Dave x={540} y={1340} s={1} seated eyes="xx" brows="angry" mouth="scream" open={1} armL={130} bendL={-90} armR={130} bendR={-90} />
          <rect x={400} y={1020} width={280} height={150} rx={60} fill="#FFFFFF" stroke={INK} strokeWidth={8} transform={`rotate(${Math.sin(lf * 1.7) * 3} 540 1095)`} />
          <Vein x={540} y={1340 + 80} s={1} f={lf} />
        </Layer>
      </Shot>
    );
  }
  // Mutter quer durch die Stadt: schon halb aus dem Sessel, Hausschuh oben – setzt sich enttäuscht wieder
  const down = ease(lf, len * 0.45, len * 0.75);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1060, 540, 820, 1.15)], [len, frameOn(540, 1060, 540, 820, 1.25)]])}>
      <Layer depth={0.7}>
        <Room wall="#FFE08A" floor={1500} window />
      </Layer>
      <Layer>
        <Armchair x={540} y={1500} />
        <MomS x={540} y={lerp(1500, 1410, down)} seated={down > 0.5} s={1} raise={lerp(165, 60, down)} eyes={down > 0.5 ? "half" : "squint"} brows={down > 0.5 ? "sad" : "angry"} mouth={down > 0.5 ? "frown" : "smug"} armL={30} />
        <ArmchairFront x={540} y={1500} />
        <ellipse cx={780} cy={1440} rx={70} ry={20} fill="#FFFFFF" stroke={INK} strokeWidth={5} opacity={0.9} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* parking                                                            */
/* ================================================================== */

export const FParking: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Dave", 0.45) - 2, W("twitches", 0.8) - 3], d, f);
  if (i === 0) {
    // Roter Sportwagen schießt in die letzte Lücke vor Daves Auto
    const zoom = ease(lf, 6, 20, "inOut");
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1250, 540, 1000, 0.85)], [len, frameOn(540, 1250, 540, 1000, 0.95)]])}>
        <Layer depth={0.6}>
          <Parking />
        </Layer>
        <Layer>
          <Car x={lerp(-500, 520, zoom)} y={1420} s={1.1} c={P.red} sport />
          <path d={`M ${lerp(-900, 120, zoom)} 1330 L ${lerp(-600, 260, zoom)} 1330 M ${lerp(-900, 120, zoom)} 1380 L ${lerp(-620, 240, zoom)} 1380`} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={1 - zoom * 0.8} />
          <Car x={960} y={1460} s={0.9} c="#4F86F7" />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Dave lächelt mit zusammengebissenen Zähnen: „Fudge.“
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 780, 1.3)], [len, frameOn(540, 1084, 540, 780, 1.45)]])}>
        <Layer depth={0.6}>
          <Parking />
        </Layer>
        <Layer>
          <Dave x={540} y={1500} s={1} eyes="twitch" f={lf} brows="angry" mouth="grin" armL={20} armR={30} />
          <Vein x={540} y={1500} s={1} f={lf} k={0.7} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: Mutters Auge zuckt, Hausschuh zittert
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 800, 1.5)], [len, frameOn(540, 1084, 540, 800, 1.65)]])}>
      <Layer depth={0}>
        <ReactBg a={P.pink} b="#FFB3DA" f={lf} />
      </Layer>
      <Layer>
        <MomS x={540} y={1500} s={1} raise={150} shake={lf} eyes="twitch" f={lf} brows="angry" mouth="frown" armL={20} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* ring                                                               */
/* ================================================================== */

export const FRing: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("vein", 0.6) - 4], d, f);
  if (i === 0) {
    // Ring hüpft über den Kirchenboden und – plink – in den Abfluss
    const t = clamp01(lf / Math.max(1, len - 6));
    const x = lerp(-50, 540, t);
    const y = 1200 - Math.abs(Math.sin(t * Math.PI * 3)) * 260 * (1 - t) + (t > 0.92 ? (t - 0.92) * 2500 : 0);
    return (
      <Shot cam={{ x: 540, y: 1000, zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill={F.wood} />
          {Array.from({ length: 8 }).map((_, k) => <line key={k} x1={-200} x2={1300} y1={500 + k * 160} y2={500 + k * 160} stroke={F.woodDark} strokeWidth={6} />)}
          <path d="M 380 -200 L 700 -200 L 820 2000 L 260 2000 Z" fill={P.red} opacity={0.85} />
        </Layer>
        <Layer>
          <Drain x={540} y={1260} />
          {t < 0.99 ? <Ring x={x} y={y} s={1.8} r={lf * 20} /> : null}
          <Burst x={540} y={1240} r0={60} r1={150} n={8} o={bump(lf, len - 5, 6)} color={P.bus} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: Daves Mund zugepresst, riesige Stirnader pocht
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 840, 1.7)], [len, frameOn(540, 1084, 540, 840, 1.95)]])}>
      <Layer depth={0}>
        <ReactBg a={P.red} b="#FF7A88" f={lf} />
      </Layer>
      <Layer>
        <Dave x={540} y={1500} s={1} eyes="wide" brows="angry" mouth="flat" armL={10} armR={10} />
        <Vein x={540} y={1500} s={1} f={lf} k={1.3} />
        <Sweat x={430} y={1000} s={0.7} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* vows                                                               */
/* ================================================================== */

const AltarSet: React.FC = () => (
  <g>
    <Church floor={1500} />
    <Altar floor={1500} />
  </g>
);

export const FVows: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("He", 0.4) - 2], d, f);
  if (i === 0) {
    // Altar: Dave + Braut, Pfarrer lächelt
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1050, 540, 820, 1.0)], [len, frameOn(540, 1050, 540, 820, 1.12)]])}>
        <Layer depth={0.7}>
          <AltarSet />
        </Layer>
        <Layer>
          <Priest x={540} y={1360} s={0.85} eyes="closed" brows="up" mouth="smile" armL={150} armR={150} bendL={-40} bendR={-40} />
          <Veil x={790} y={1520} s={0.95} />
          <Bride x={790} y={1520} s={0.95} flip eyes="open" look={[-1, 0]} brows="up" mouth="smile" armL={20} armR={20} />
          <Veil x={790} y={1520} s={0.95} front />
          <Dave x={290} y={1520} s={0.95} eyes="open" look={[1, 0]} brows="up" mouth={lf < 14 ? "talk" : "smile"} open={0.5} armL={20} armR={20} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: Dave triumphiert, Arme hoch, Konfetti, Freudenträne
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1084, 540, 840, 1.2)], [len, frameOn(540, 1084, 540, 840, 1.35)]])}>
      <Layer depth={0}>
        <ReactBg a={P.bus} b="#FFE58A" f={lf} />
      </Layer>
      <Layer>
        <Dave x={540} y={1500} s={1} eyes="closed" brows="up" mouth="grin" armL={165} armR={165} bendL={-20} bendR={-20} gest={6} />
        <ellipse cx={470} cy={1110 + ((lf * 4) % 60)} rx={10} ry={16} fill="#7FD6FF" stroke={INK} strokeWidth={3} />
        <Confetti f={lf} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

export const FTwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("says", 0.25) - 2, W("her", 0.5, 2) - 2, W("So", 0.85) - 2], d, f);
  if (i === 0) {
    // Nahaufnahme: weißer Brautschuh knallt gegen die Altarstufe
    const hit = Math.min(len - 6, W("stubs", 0.15) + 3);
    const x = lf < hit ? lerp(480, 820, ease(lf, 0, hit, "linear")) : 820 - 18 * Math.exp(-(lf - hit) * 0.3);
    return (
      <Shot cam={{ x: 540 + jolt(lf, hit, 16), y: 960, zoom: 1 }}>
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#E9C9FF" />
          <rect x={-2000} y={1150} width={5000} height={2000} fill={P.red} />
        </Layer>
        <Layer>
          <rect x={820} y={900} width={900} height={250} fill="#FFF4DE" stroke={INK} strokeWidth={10} />
          <rect x={800} y={880} width={940} height={40} fill={P.bus} stroke={INK} strokeWidth={8} />
          <g transform={`translate(${x} 1080)`}>
            <path d="M -500 -80 L -500 -900 L -300 -900 L -260 -80 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} />
            <path d="M -420 -80 Q -440 -150 -300 -150 L -40 -110 Q 20 -60 -10 0 L -420 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
            <rect x={-160} y={-2} width={30} height={90} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
          </g>
          <Burst x={820} y={1060} r0={100} r1={240} n={12} o={bump(lf, hit + 2, 10)} color={P.red} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Altar halbnah: Braut flucht (Blase + Piep), Gäste in den Bänken schnappen nach Luft
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 780, 1.05)], [len, frameOn(540, 1000, 540, 780, 1.15)]])}>
        <Layer depth={0.7}>
          <Church floor={1500} wall="#E9C9FF" />
        </Layer>
        <Layer>
          <Veil x={600} y={1420} s={1} />
          <Bride x={600} y={1420} s={1} eyes="xx" brows="angry" mouth="scream" open={1} armL={60} armR={150} bendR={-40} gest={6} />
          <Veil x={600} y={1420} s={1} front />
          <CurseBubble x={850} y={500} o={clamp01((lf - 6) / 3)} s={0.85} />
          <Pew y={1380} />
          {[90, 330, 820, 1040].map((x, k) => (
            <Person key={x} x={x} y={1560} s={0.8} shirt={[P.teal, P.purple, P.orange, P.lime][k]} hair={(["side", "bun", "curly", "pony"] as const)[k]} hairColor="#2A1B12" skin={[P.skin, P.skin2, P.skin3, P.skin][k]} eyes="wide" look={[k < 2 ? 1 : -1, -0.5]} brows="up" mouth="o" open={0.7} handMouth={k % 2 === 0} armL={20} armR={20} />
          ))}
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // POOF: ihre Mutter (Lockenwickler, Bademantel) erscheint, sieht Dave, flucht ihn an
    const sw = W("swears", 0.6) - (W("her", 0.5, 2) - 2);
    const arr = clamp01((lf - 3) / 6);
    return (
      <Shot cam={{ ...frameOn(540, 1050, 540, 800, 1.05), x: frameOn(540, 1050, 540, 800, 1.05).x + jolt(lf, 3, 14) }}>
        <Layer depth={0.7}>
          <AltarSet />
        </Layer>
        <Layer>
          <Dave x={260} y={1520} s={0.95} eyes="wide" look={[1, -0.3]} brows="up" mouth="o" open={0.5} armL={20} armR={20} lean={lf > sw ? -6 : 0} />
          {arr > 0 ? (
            <g>
              <InLaw x={760} y={1520} s={1.05 * (0.8 + 0.2 * arr)} flip eyes={lf > sw ? "squint" : "wide"} look={[-1, 0]} brows="angry" mouth={lf > sw ? "scream" : "frown"} open={0.8} armL={20} armR={lf > sw ? 120 : 30} />
              <Curlers x={760} y={1520} s={1.05 * (0.8 + 0.2 * arr)} />
            </g>
          ) : null}
          <Poof x={760} y={1050} t={lf} s={1.4} />
          <CurseBubble x={470} y={520} o={clamp01((lf - sw) / 3)} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  // Comic-Fläche: POOF – winzige uralte Oma mit noch größerem Hausschuh
  const arr = clamp01((lf - 3) / 6);
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1150, 540, 860, 1.25)], [len, frameOn(540, 1150, 540, 860, 1.4)]])}>
      <Layer depth={0}>
        <ReactBg a={P.purple} b="#B79BFF" f={lf} />
      </Layer>
      <Layer>
        {arr > 0 ? (
          <g>
            <Granny x={540} y={1500} s={0.85 * (0.8 + 0.2 * arr)} eyes="squint" brows="angry" mouth="frown" bags={0.9} armR={160} armL={20} />
            <Slipper x={hand(540, 1500, 0.85, 160, 1)[0]} y={hand(540, 1500, 0.85, 160, 1)[1]} s={1.8 * arr} r={-15} c={P.red} />
          </g>
        ) : null}
        <Poof x={540} y={1150} t={lf} s={1.2} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* chain                                                              */
/* ================================================================== */

const MOMS = Array.from({ length: 41 }).map((_, k) => ({
  x: -120 + ((k * 263) % 1320),
  y: 1180 + (k % 4) * 110,
  s: 0.62 + (k % 3) * 0.08,
  hair: (["curly", "bun", "side", "pony"] as const)[k % 4],
  hc: ["#F2C14E", "#F2F2F2", "#A8A8B0", "#6B3A1E", "#2A1B12"][k % 5],
  shirt: [P.pink, P.purple, F.robe, P.orange, P.teal][k % 5],
  skin: [P.skin, P.skin2, P.skin3, "#F2C7A5"][k % 4],
}));

export const FChain: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Dave", 0.5) - 2], d, f);
  if (i === 0) {
    // Festsaal: 41 Mütter aller Generationen, Hausschuhe erhoben, Torte
    const n = Math.round(lerp(8, 41, ease(lf, 0, len * 0.8)));
    return (
      <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 820, 1.2)], [len, frameOn(540, 1000, 540, 820, 0.98)]])}>
        <Layer depth={0.7}>
          <Hall f={lf} />
        </Layer>
        <Layer>
          {[...MOMS.slice(0, n)].sort((a, b) => a.y - b.y).map((m, k) => {
            const [hx, hy] = hand(m.x, m.y, m.s, 160, 1);
            return (
              <g key={k}>
                <Person x={m.x} y={m.y} s={m.s} shirt={m.shirt} cardigan={k % 2 === 0} hair={m.hair} hairColor={m.hc} skin={m.skin} eyes="squint" brows="angry" mouth={k % 3 === 0 ? "scream" : "frown"} open={0.6} armR={160} armL={20} />
                <Slipper x={hx} y={hy} s={m.s * 0.9} r={-15 + Math.sin(lf * 0.6 + k) * 10} c={[F.slipper, P.red, P.lime][k % 3]} />
              </g>
            );
          })}
          <Cake x={540} y={1100} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  // Dave im Hochzeitsanzug sitzt in der Ecke auf einem Hocker, Gesicht zur Wand; Mütter drohen mit dem Finger
  return (
    <Shot cam={camPath(lf, [[0, frameOn(540, 1000, 540, 780, 1.2)], [len, frameOn(540, 1000, 540, 780, 1.32)]])}>
      <Layer depth={0.7}>
        <Room wall={F.hall} floor={1500} />
        <path d="M 540 -2000 L 540 1500" stroke="#E0B67A" strokeWidth={14} />
      </Layer>
      <Layer>
        <rect x={430} y={1290} width={220} height={36} rx={10} fill={F.wood} stroke={INK} strokeWidth={6} />
        <rect x={525} y={1326} width={30} height={174} fill={F.woodDark} stroke={INK} strokeWidth={5} />
        <Dave x={540} y={1300} s={0.85} seated eyes="half" look={[0.6, 0.4]} brows="sad" mouth="frown" armL={10} armR={10} nod={14} />
        <Person x={100} y={1560} s={0.95} shirt={F.robe} cardigan hair="curly" hairColor="#A8A8B0" skin="#F2C7A5" eyes="squint" brows="angry" mouth="frown" finger armR={150} bendR={-30} />
        <Curlers x={100} y={1560} s={0.95} />
        <MomS x={980} y={1560} s={0.95} flip raise={150} eyes="squint" brows="angry" mouth="frown" armL={20} />
        <Granny x={790} y={1560} s={0.6} eyes="squint" brows="angry" mouth="frown" finger armR={150} bendR={-30} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const FOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  // POV: schwarzer Handybildschirm; in der Spiegelung steigt hinter dem Zuschauer eine Mutter mit Hausschuh auf
  const rise = ease(f, W("Don't", 0.6) - 40, W("Don't", 0.6) + 6);
  const peek = ease(f, 0, 20);
  return (
    <Shot cam={{ x: 540, y: 960, zoom: 1 + 0.06 * ease(f, 0, d) }}>
      <Layer depth={0}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
      </Layer>
      <Layer>
        <rect x={20} y={40} width={1040} height={1840} rx={90} fill={INK} />
        <rect x={50} y={70} width={980} height={1780} rx={70} fill="#151626" />
        <rect x={420} y={90} width={240} height={46} rx={23} fill="#0B0B12" />
        <g opacity={lerp(0.6, 0.85, rise) * peek}>
          <rect x={160} y={300} width={300} height={420} rx={10} fill="#2A2C48" />
          <MomS x={lerp(860, 760, rise)} y={lerp(2700, 1500, rise)} s={1.3} raise={165} eyes="squint" brows="angry" mouth="smug" armL={20} />
          <Person x={540} y={2050} s={1.5} shirt="#2A2C48" hair="side" hairColor="#1B1530" skin="#3A3C58" eyes="closed" brows="none" mouth="flat" />
        </g>
        <path d="M 120 140 L 420 1700" stroke="#FFFFFF" strokeWidth={40} opacity={0.05} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const FLUCH_SCENES: Record<string, React.FC> = {
  hook: FHook,
  rules: FRules,
  orphans: FOrphans,
  dave: FDave,
  morning: FMorning,
  parking: FParking,
  ring: FRing,
  vows: FVows,
  twist: FTwist,
  chain: FChain,
  outro: FOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(FLUCH_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes) PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Fluch-Blasen „#@%&!“ sind der Gag. */
export const FLUCH_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene + Set-Folge (vor dem Render gezählt):
 * Garage, Garage | OP, OP | Vorstand, Vorstand | Comic grün, Schiff | Kinderzimmer, Spiegel, Kirche außen |
 * Zeh-ECU, Kissen, Mutter-Sessel | Parkplatz, Parkplatz | Comic pink | Abfluss-ECU, Comic rot | Altar, Comic gelb |
 * Stufe-ECU, Kirchenbank, Altar, Comic lila | Festsaal, Ecke | POV  → nie > 2 gleiche am Stück, 18 Bildwelten. */
export const FLUCH_SHOT_COUNT: Record<string, number> = { hook: 2, rules: 4, orphans: 2, dave: 3, morning: 3, parking: 3, ring: 2, vows: 2, twist: 4, chain: 2, outro: 1 };
