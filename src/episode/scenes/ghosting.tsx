import React, { useId } from "react";
import {
  camPath,
  clamp01,
  ease,
  frameOn,
  jolt,
  Layer,
  lerp,
  Stage2D,
} from "../kit2d";
import type { Cam2D } from "../kit2d";
import type { TransitionSpec } from "../kit/transitions";
import { shotIndex } from "../types";
import type { EpisodeConfig } from "./index";
import plan from "../../../episodes/ghost-stadt.json";
import { useBeats } from "./rollsSets";
import { Burst, INK, P, Person, Street, Sweat } from "./gaehnSets";
import type { PersonProps } from "./gaehnSets";
import { ReactBg } from "./suche";
import { Room } from "./akku";
import { CouchBack, CouchFront, Poof, Sparkle } from "./todo";
import { Clock, Confetti, PhoneS, PovHand } from "./meckern";

/**
 * „In This City, If You Ghost Someone, You Turn Invisible“ (episodes/ghost-stadt.json) – 2D-Cartoon, schwarzer Humor.
 * Konsequenz = Unsichtbarkeit (Verblassen von den Füßen aufwärts, Maske `Vanish`). Eine Text-Ebene (Untertitel);
 * Chat-Blasen sind Kritzel-Zeilen, „gelesen“ ist ein Augen-Symbol – keine Schrift im Bild.
 * Schnitte an Wort-Beats, kein Set > 2 am Stück (GHOSTING_SHOT_COUNT).
 */

const useShot = (cuts: readonly number[], d: number, f: number) => {
  const c = cuts.map((x) => Math.max(1, Math.round(x)));
  const i = shotIndex(f, c);
  const a = i === 0 ? 0 : c[i - 1];
  const b = i < c.length ? c[i] : d;
  return { i, lf: f - a, len: b - a };
};

const Shot: React.FC<{
  readonly cam: Cam2D;
  readonly children: React.ReactNode;
}> = ({ cam, children }) => (
  <Stage2D cam={cam} mood="haze" noSky>
    {children}
  </Stage2D>
);

const G = {
  hoodie: "#3FBF6A",
  hair: "#D9472B",
  street: "#FFC27A",
  cafe: "#FF8FC7",
  resto: "#6A3ED0",
  block: "#9FB8FF",
  hall: "#C7B98A",
  apt: "#8ED8FF",
  kitchen: "#FFD23F",
  exRoom: "#FF5FA2",
  night: "#22205A",
  sepia: "#D9B98A",
  office: "#B8F06A",
  seen: "#2F9BFF",
  phone: "#151626",
};

/* ------------------------------------------------------------------ */
/* Figuren                                                            */
/* ------------------------------------------------------------------ */

type Fig = Omit<PersonProps, "shirt" | "hair" | "hairColor">;
const Jake: React.FC<Fig & { readonly young?: boolean }> = ({
  young,
  ...p
}) => (
  <Person
    pants="#2B3A67"
    {...p}
    shirt={young ? "#FFB627" : G.hoodie}
    hair="curly"
    hairColor={G.hair}
    skin={P.skin}
  />
);
const Hooker: React.FC<Fig> = (p) => (
  <Person
    pants="#3B3F66"
    {...p}
    shirt={P.ted}
    hair="spiky"
    hairColor="#2A1B12"
    skin={P.skin2}
  />
);
const Mom: React.FC<Fig> = (p) => (
  <Person
    pants="#7A3FB0"
    cardigan
    {...p}
    shirt={P.cream}
    hair="curly"
    hairColor="#B8BFD0"
    skin={P.skin}
  />
);
const Ex: React.FC<Fig> = (p) => (
  <Person
    pants="#2A2440"
    {...p}
    shirt={P.pink}
    hair="bun"
    hairColor="#1B1530"
    skin={P.skin3}
  />
);
const Boss: React.FC<Fig> = (p) => (
  <Person
    pants="#3A3F52"
    suit
    {...p}
    shirt="#5D6377"
    hair="side"
    hairColor="#2A1B12"
    skin="#F2C7A5"
    stache
  />
);
const Tenant: React.FC<
  Fig & {
    readonly c: string;
    readonly h?: PersonProps["hair"];
    readonly hc?: string;
  }
> = ({ c, h = "side", hc = "#4A2E1E", ...p }) => (
  <Person pants="#4A4F66" {...p} shirt={c} hair={h} hairColor={hc} />
);

/** Handposition (ohne Ellenbogen-Beugung) – Ursprung Füße wie Person. */
const hand = (
  x: number,
  y: number,
  s: number,
  deg: number,
  side: 1 | -1,
  seated = false,
) => {
  const sh = (seated ? -250 : -330) + 40;
  const a = (deg * Math.PI) / 180;
  return [
    x + side * (78 + Math.sin(a) * 130) * s,
    y + (sh + Math.cos(a) * 130) * s,
  ] as const;
};
/** Kopfmitte einer Person (stehend/sitzend). */
const head = (x: number, y: number, s: number, seated = false) =>
  [x, y + ((seated ? -250 : -330) - 86) * s] as const;

/**
 * Unsichtbar werden: Kinder (in Welt-Koordinaten) verblassen von unten nach oben.
 * k = 0 sichtbar … 1 ganz verblasst (Rest `ghost` als Schimmer). holes = einzeln verblasste Kreise [x, y, r],
 * keep = nur diese Rechtecke bleiben sichtbar [x, y, w, h] (z. B. „schwebender Hoodie“).
 */
const Vanish: React.FC<{
  readonly y0: number;
  readonly y1: number;
  readonly k: number;
  readonly ghost?: number;
  readonly holes?: readonly (readonly [number, number, number])[];
  readonly keep?: readonly (readonly [number, number, number, number])[];
  readonly f?: number;
  readonly fromTop?: boolean;
  readonly children: React.ReactNode;
}> = ({
  y0,
  y1,
  k,
  ghost = 0.08,
  holes = [],
  keep,
  f = 0,
  fromTop,
  children,
}) => {
  const id = `van${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const g = Math.round(ghost * 255);
  const dim = `rgb(${g},${g},${g})`;
  const kk = clamp01(k);
  const lvl = fromTop ? lerp(y1 - 20, y0 + 20, kk) : lerp(y0 + 30, y1 - 30, kk);
  return (
    <g>
      <defs>
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x={-4000}
          y={-4000}
          width={9000}
          height={9000}
        >
          {keep ? (
            <>
              <rect x={-4000} y={-4000} width={9000} height={9000} fill={dim} />
              {keep.map(([x, y, w, h], j) => (
                <rect
                  key={j}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={30}
                  fill="#FFFFFF"
                />
              ))}
            </>
          ) : (
            <>
              <rect
                x={-4000}
                y={-4000}
                width={9000}
                height={9000}
                fill="#FFFFFF"
              />
              {kk > 0 ? (
                fromTop ? (
                  <rect
                    x={-4000}
                    y={-4000}
                    width={9000}
                    height={lvl + 4000}
                    fill={dim}
                  />
                ) : (
                  <rect
                    x={-4000}
                    y={lvl}
                    width={9000}
                    height={5000}
                    fill={dim}
                  />
                )
              ) : null}
              {holes.map(([x, y, r], j) => (
                <circle key={j} cx={x} cy={y} r={r} fill={dim} />
              ))}
            </>
          )}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{children}</g>
      {kk > 0.02 && kk < 0.98 && !keep ? (
        <g opacity={0.9}>
          <line
            x1={-200}
            x2={1300}
            y1={lvl}
            y2={lvl}
            stroke="#E8F8FF"
            strokeWidth={5}
            strokeDasharray="18 26"
            strokeDashoffset={-f * 6}
            opacity={0}
          />
          {Array.from({ length: 9 }).map((_, j) => {
            const sx = 340 + ((j * 97 + f * 9) % 420);
            const sy = lvl + Math.sin(f * 0.5 + j) * 18;
            return (
              <circle
                key={j}
                cx={sx}
                cy={sy}
                r={6 + (j % 3) * 3}
                fill="#E8F8FF"
                opacity={0.5 + 0.5 * Math.sin(f * 0.7 + j * 2)}
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Bildzeichen / Requisiten                                           */
/* ------------------------------------------------------------------ */

/** „Gelesen“-Symbol: blaues Auge im Kreis (ohne Schrift). */
const SeenEye: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly s?: number;
}> = ({ x, y, t, s = 1 }) =>
  t < 0 ? null : (
    <g
      transform={`translate(${x} ${y}) scale(${s * (t < 6 ? 0.4 + 0.12 * t + 0.25 * Math.sin((t / 6) * Math.PI) : 1)})`}
    >
      <circle r={70} fill={G.seen} stroke={INK} strokeWidth={8} />
      <path
        d="M -46 0 Q 0 -44 46 0 Q 0 44 -46 0 Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={6}
      />
      <circle r={17} fill={INK} />
      <circle cx={-6} cy={-6} r={5} fill="#FFFFFF" />
    </g>
  );

/** Chat-Blase mit Kritzel-Zeilen. side 1 = ausgehend (rechts, grün), −1 = eingehend (links, weiß). */
const Bubble: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly o: number;
  readonly s?: number;
  readonly side?: 1 | -1;
  readonly lines?: number;
  readonly w?: number;
  readonly c?: string;
  readonly icon?: React.ReactNode;
}> = ({ x, y, o, s = 1, side = -1, lines = 2, w = 420, c, icon }) =>
  o <= 0 ? null : (
    <g
      transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.3 * clamp01(o))})`}
      opacity={clamp01(o * 1.5)}
    >
      <path
        d={`M ${-w / 2} -60 Q ${-w / 2} -100 ${-w / 2 + 40} -100 L ${w / 2 - 40} -100 Q ${w / 2} -100 ${w / 2} -60 L ${w / 2} ${lines * 44 - 30} Q ${w / 2} ${lines * 44 + 10} ${w / 2 - 40} ${lines * 44 + 10} L ${side * (w / 2 - 50)} ${lines * 44 + 10} L ${side * (w / 2 + 10)} ${lines * 44 + 50} L ${side * (w / 2 - 110)} ${lines * 44 + 10} L ${-w / 2 + 40} ${lines * 44 + 10} Q ${-w / 2} ${lines * 44 + 10} ${-w / 2} ${lines * 44 - 30} Z`}
        fill={c ?? (side === 1 ? "#7BE08F" : "#FFFFFF")}
        stroke={INK}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      {icon ??
        Array.from({ length: lines }).map((_, k) => (
          <rect
            key={k}
            x={-w / 2 + 36}
            y={-70 + k * 44}
            width={(w - 72) * (k === lines - 1 ? 0.6 : 1)}
            height={20}
            rx={10}
            fill="#3A3F5A"
            opacity={0.75}
          />
        ))}
    </g>
  );

/** Winkende Hand (Bildzeichen in der Chat-Blase). */
const WaveIcon: React.FC<{ readonly f: number }> = ({ f }) => (
  <g transform={`translate(0 -20) rotate(${Math.sin(f * 0.6) * 18})`}>
    <rect
      x={-40}
      y={-30}
      width={80}
      height={80}
      rx={30}
      fill={P.bus}
      stroke={INK}
      strokeWidth={6}
    />
    {[-30, -10, 10, 30].map((k, j) => (
      <rect
        key={k}
        x={k - 9}
        y={-80 + (j % 2) * 8}
        width={18}
        height={60}
        rx={9}
        fill={P.bus}
        stroke={INK}
        strokeWidth={5}
      />
    ))}
  </g>
);

/** Großes Handy (Nah/POV) – Inhalt in Bildschirm-Koordinaten (0..600 × 0..1100). */
const BigPhone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  readonly children?: React.ReactNode;
  readonly glow?: string;
}> = ({ x, y, s = 1, r = 0, children, glow = G.phone }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-340} y={-620} width={680} height={1240} rx={80} fill={INK} />
    <rect x={-305} y={-580} width={610} height={1160} rx={56} fill={glow} />
    <g transform="translate(-300 -560)">{children}</g>
    <rect x={-70} y={-600} width={140} height={22} rx={11} fill="#000" />
  </g>
);

/** Posteingang: Zeilen mit Avatar, Kritzel und rotem Zähler-Punkt. blur = letzte Zeile (verschwommener Jung-Jake). */
const Inbox: React.FC<{
  readonly rows: number;
  readonly f: number;
  readonly last?: number;
  readonly done?: number;
}> = ({ rows, f, last = 1, done = 0 }) => (
  <g>
    {Array.from({ length: rows }).map((_, k) => {
      const y = 60 + k * 128;
      const isLast = k === rows - 1 && last > 0;
      const c = [P.purple, P.teal, P.orange, P.pink, P.sky, P.lime, P.red][
        k % 7
      ];
      return (
        <g key={k} opacity={k < done ? 0.35 : 1}>
          <rect
            x={20}
            y={y}
            width={560}
            height={110}
            rx={24}
            fill={isLast ? "#2A2E48" : "#22263C"}
          />
          {isLast ? (
            <g>
              <circle cx={85} cy={y + 55} r={40} fill={P.skin} opacity={0.75} />
              <circle cx={85} cy={y + 28} r={30} fill={G.hair} opacity={0.6} />
              <circle
                cx={85}
                cy={y + 55}
                r={44}
                fill="#9AA0C0"
                opacity={0.45}
              />
            </g>
          ) : (
            <circle cx={85} cy={y + 55} r={40} fill={c} />
          )}
          <rect
            x={145}
            y={y + 28}
            width={isLast ? 240 : 300 - (k % 3) * 40}
            height={20}
            rx={10}
            fill="#9AA0C0"
            opacity={isLast ? 0.4 : 0.9}
          />
          <rect
            x={145}
            y={y + 64}
            width={isLast ? 180 : 220 + (k % 2) * 60}
            height={16}
            rx={8}
            fill="#5B6080"
          />
          {k >= done ? (
            <circle
              cx={530}
              cy={y + 55}
              r={24 + (k === 0 ? Math.sin(f * 0.5) * 3 : 0)}
              fill={P.red}
              stroke={INK}
              strokeWidth={4}
            />
          ) : null}
        </g>
      );
    })}
  </g>
);

const Rose: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
}> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {[-30, 0, 30].map((k, j) => (
      <g key={k}>
        <line
          x1={0}
          y1={0}
          x2={k}
          y2={-150 - j * 10}
          stroke="#2E8B3A"
          strokeWidth={8}
        />
        <circle
          cx={k}
          cy={-160 - j * 10}
          r={28}
          fill={P.red}
          stroke={INK}
          strokeWidth={5}
        />
      </g>
    ))}
    <path
      d="M -50 -20 L 50 -20 L 20 40 L -20 40 Z"
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={5}
    />
  </g>
);

const Cup: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  readonly f?: number;
  readonly c?: string;
  readonly straw?: boolean;
  readonly lvl?: number;
}> = ({ x, y, s = 1, r = 0, f = 0, c = "#FFFFFF", straw, lvl = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {straw ? (
      <path
        d="M 10 -150 L 30 -230 L 80 -250"
        fill="none"
        stroke={P.red}
        strokeWidth={12}
        strokeLinecap="round"
      />
    ) : null}
    <path
      d="M -60 -150 L 60 -150 L 45 0 L -45 0 Z"
      fill={c}
      stroke={INK}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    {straw ? (
      <path
        d={`M ${-58 + (1 - lvl) * 0} ${-150 + (1 - lvl) * 140} L ${58} ${-150 + (1 - lvl) * 140} L 45 -6 L -45 -6 Z`}
        fill={P.orange}
        opacity={0.85}
      />
    ) : null}
    {straw
      ? null
      : [0, 1].map((k) => (
          <path
            key={k}
            d={`M ${-20 + k * 40} -170 q ${12 * Math.sin(f * 0.2 + k)} -30 0 -60`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={8}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}
  </g>
);

const Hat: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly f: number;
}> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.15) * 10}) scale(${s})`}>
    <ellipse
      cx={0}
      cy={0}
      rx={150}
      ry={30}
      fill="#3A2A22"
      stroke={INK}
      strokeWidth={7}
    />
    <path
      d="M -90 0 L -80 -130 Q 0 -160 80 -130 L 90 0 Z"
      fill="#4A3628"
      stroke={INK}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    <rect x={-88} y={-42} width={176} height={28} fill={P.red} />
    {/* Zigarre + Rauch in Mundhöhe */}
    <rect
      x={30}
      y={130}
      width={110}
      height={26}
      rx={12}
      fill="#8A5A2B"
      stroke={INK}
      strokeWidth={5}
    />
    <circle cx={142} cy={143} r={10} fill={P.orange} />
    {[0, 1, 2].map((k) => (
      <circle
        key={k}
        cx={160 + k * 30 + Math.sin(f * 0.2 + k) * 10}
        cy={110 - k * 50 - ((f * 2) % 40)}
        r={18 + k * 8}
        fill="#D8D8E0"
        opacity={0.6 - k * 0.15}
      />
    ))}
  </g>
);

/** Schall-Ringe (Stimme ohne Körper). */
const Voice: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly f: number;
  readonly o?: number;
}> = ({ x, y, f, o = 1 }) => (
  <g opacity={o} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round">
    {[0, 1, 2].map((k) => {
      const r = 60 + ((f * 4 + k * 45) % 135);
      return <circle key={k} cx={x} cy={y} r={r} opacity={1 - r / 200} />;
    })}
  </g>
);

const Bucket: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
}> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M -60 -100 L 60 -100 L 45 0 L -45 0 Z"
      fill="#B8BFD0"
      stroke={INK}
      strokeWidth={6}
    />
    <path
      d="M -60 -100 Q 0 -170 60 -100"
      fill="none"
      stroke={INK}
      strokeWidth={5}
    />
  </g>
);

/** Rote Räumungs-Mitteilung: Blatt mit rotem Stempel (Totenkopf-frei, nur Bildzeichen). */
const Notice: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
}> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect
      x={-150}
      y={-100}
      width={300}
      height={200}
      rx={10}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={6}
    />
    <circle
      cx={0}
      cy={-10}
      r={60}
      fill="none"
      stroke={P.red}
      strokeWidth={12}
    />
    <line x1={-42} y1={32} x2={42} y2={-52} stroke={P.red} strokeWidth={12} />
    {[0, 1].map((k) => (
      <rect
        key={k}
        x={-110}
        y={60 + k * 0}
        width={220}
        height={14}
        rx={7}
        fill="#B8BFD0"
      />
    ))}
  </g>
);

const Tear: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly f: number;
}> = ({ x, y, f }) => (
  <g>
    {[0, 1].map((k) => {
      const t = (f * 3 + k * 25) % 50;
      return (
        <path
          key={k}
          transform={`translate(${x + k * 30} ${y + t * 4})`}
          d="M 0 -20 Q 14 0 0 14 Q -14 0 0 -20 Z"
          fill="#7FD6FF"
          stroke={INK}
          strokeWidth={4}
          opacity={1 - t / 50}
        />
      );
    })}
  </g>
);

/** Schwebende Augenbrauen (was von Jake übrig ist). */
const Brows: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly mood?: "worried" | "up" | "sad";
  readonly o?: number;
}> = ({ x, y, s = 1, mood = "worried", o = 1 }) => {
  const tilt = mood === "worried" ? 14 : mood === "sad" ? 22 : -8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect
        x={-110}
        y={-14}
        width={80}
        height={26}
        rx={13}
        fill={G.hair}
        stroke={INK}
        strokeWidth={5}
        transform={`rotate(${-tilt} -70 0)`}
      />
      <rect
        x={30}
        y={-14}
        width={80}
        height={26}
        rx={13}
        fill={G.hair}
        stroke={INK}
        strokeWidth={5}
        transform={`rotate(${tilt} 70 0)`}
      />
    </g>
  );
};

/** Einzelner schwebender Daumen. */
const Thumb: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s?: number;
  readonly r?: number;
  readonly o?: number;
}> = ({ x, y, s = 1, r = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <rect
      x={-30}
      y={-90}
      width={60}
      height={130}
      rx={30}
      fill={P.skin}
      stroke={INK}
      strokeWidth={6}
    />
    <path
      d="M -18 -72 Q 0 -84 18 -72 L 16 -40 Q 0 -34 -16 -40 Z"
      fill="#FFFFFF"
      opacity={0.6}
      stroke={INK}
      strokeWidth={3}
    />
  </g>
);

const Cat: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly f: number;
  readonly s?: number;
  readonly hiss?: number;
}> = ({ x, y, f, s = 1, hiss = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse
      cx={0}
      cy={-70}
      rx={110}
      ry={70}
      fill="#FF9A3D"
      stroke={INK}
      strokeWidth={7}
    />
    <circle
      cx={90}
      cy={-150}
      r={60}
      fill="#FF9A3D"
      stroke={INK}
      strokeWidth={7}
    />
    <path
      d="M 50 -195 L 55 -250 L 90 -205 Z M 110 -205 L 140 -250 L 140 -190 Z"
      fill="#FF9A3D"
      stroke={INK}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <circle
      cx={75}
      cy={-155}
      r={hiss > 0.5 ? 14 : 10}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={4}
    />
    <circle
      cx={115}
      cy={-155}
      r={hiss > 0.5 ? 14 : 10}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={4}
    />
    <circle cx={77 + (hiss > 0.5 ? 0 : 3)} cy={-155} r={5} fill={INK} />
    <circle cx={117 + (hiss > 0.5 ? 0 : 3)} cy={-155} r={5} fill={INK} />
    <path
      d={
        hiss > 0.5
          ? "M 78 -122 Q 95 -100 112 -122 Z"
          : "M 85 -125 Q 95 -118 105 -125"
      }
      fill={hiss > 0.5 ? INK : "none"}
      stroke={INK}
      strokeWidth={4}
    />
    <path
      d={`M -100 -80 Q -180 ${-130 + Math.sin(f * 0.3) * 30} -150 -210`}
      fill="none"
      stroke="#FF9A3D"
      strokeWidth={26}
      strokeLinecap="round"
    />
    {[-12, 14].map((k) => (
      <line
        key={k}
        x1={k + 30}
        y1={-125}
        x2={k + 30 + (k > 0 ? 50 : -50)}
        y2={-130}
        stroke={INK}
        strokeWidth={3}
      />
    ))}
  </g>
);

/* ------------------------------------------------------------------ */
/* Sets                                                               */
/* ------------------------------------------------------------------ */

const Sidewalk: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.street} />
    <Street ground={1500} />
  </g>
);

const Cafe: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.cafe} />
    {Array.from({ length: 8 }).map((_, k) => (
      <rect
        key={k}
        x={-500 + k * 260}
        y={-2000}
        width={120}
        height={3500}
        fill="#FFFFFF"
        opacity={0.15}
      />
    ))}
    <rect
      x={560}
      y={300}
      width={460}
      height={560}
      rx={20}
      fill="#BFF0FF"
      stroke={INK}
      strokeWidth={9}
    />
    <line x1={790} x2={790} y1={300} y2={860} stroke={INK} strokeWidth={8} />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#8A4B6A" />
  </g>
);

const Table: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly c?: string;
}> = ({ x, y, w = 700, c = "#FFFFFF" }) => (
  <g>
    <rect
      x={x - w / 2}
      y={y}
      width={w}
      height={44}
      rx={14}
      fill={c}
      stroke={INK}
      strokeWidth={8}
    />
    <rect x={x - 22} y={y + 44} width={44} height={300} fill={INK} />
  </g>
);

const Resto: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.resto} />
    {Array.from({ length: 6 }).map((_, k) => (
      <circle
        key={k}
        cx={-100 + k * 260}
        cy={260 + (k % 2) * 80}
        r={40 + Math.sin(f * 0.1 + k) * 4}
        fill="#FFE27A"
        opacity={0.35}
      />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#3A2470" />
  </g>
);

const Candle: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly f: number;
}> = ({ x, y, f }) => (
  <g>
    <rect
      x={x - 16}
      y={y - 120}
      width={32}
      height={120}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={5}
    />
    <path
      d={`M ${x} ${y - 190 + Math.sin(f * 0.5) * 6} Q ${x + 22} ${y - 140} ${x} ${y - 124} Q ${x - 22} ${y - 140} ${x} ${y - 190 + Math.sin(f * 0.5) * 6} Z`}
      fill={P.orange}
      stroke={INK}
      strokeWidth={4}
    />
  </g>
);

const Block: React.FC<{ readonly f: number }> = ({ f }) => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.block} />
    <rect
      x={80}
      y={200}
      width={920}
      height={1400}
      fill="#B89A7A"
      stroke={INK}
      strokeWidth={10}
    />
    <path
      d="M 300 200 L 340 420 L 290 560 L 350 760 M 760 600 L 700 820 L 780 980"
      fill="none"
      stroke={INK}
      strokeWidth={8}
      strokeLinecap="round"
    />
    {Array.from({ length: 9 }).map((_, k) => {
      const x = 150 + (k % 3) * 290;
      const y = 300 + Math.floor(k / 3) * 360;
      return (
        <rect
          key={k}
          x={x}
          y={y}
          width={200}
          height={220}
          rx={10}
          fill={k === 4 ? "#3A3F66" : "#FFE9A8"}
          stroke={INK}
          strokeWidth={7}
        />
      );
    })}
    {/* Rohr leckt */}
    <rect
      x={1000}
      y={200}
      width={40}
      height={1400}
      fill="#7A8090"
      stroke={INK}
      strokeWidth={6}
    />
    {[0, 1, 2].map((k) => (
      <path
        key={k}
        transform={`translate(1060 ${700 + ((f * 9 + k * 120) % 360)})`}
        d="M 0 -20 Q 14 0 0 14 Q -14 0 0 -20 Z"
        fill="#7FD6FF"
        stroke={INK}
        strokeWidth={4}
      />
    ))}
    <rect x={-2000} y={1600} width={5000} height={2000} fill="#7A7F90" />
  </g>
);

const Hallway: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.hall} />
    {Array.from({ length: 9 }).map((_, k) => (
      <rect
        key={k}
        x={-400 + k * 220}
        y={-2000}
        width={30}
        height={3500}
        fill="#8C7F5A"
        opacity={0.5}
      />
    ))}
    <rect
      x={-60}
      y={620}
      width={360}
      height={880}
      fill="#7E4320"
      stroke={INK}
      strokeWidth={9}
    />
    <rect
      x={800}
      y={620}
      width={360}
      height={880}
      fill="#7E4320"
      stroke={INK}
      strokeWidth={9}
    />
    <circle
      cx={260}
      cy={1080}
      r={18}
      fill={P.bus}
      stroke={INK}
      strokeWidth={5}
    />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#5A4E3A" />
    <rect
      x={430}
      y={260}
      width={240}
      height={70}
      rx={14}
      fill="#FFF7C2"
      opacity={0.8}
    />
  </g>
);

const Apt: React.FC<{ readonly wall?: string; readonly dark?: number }> = ({
  wall = G.apt,
  dark = 0,
}) => (
  <g>
    <Room wall={wall} floor={1500} window />
    <rect
      x={-2000}
      y={-2000}
      width={5000}
      height={5000}
      fill="#0B0830"
      opacity={dark}
    />
  </g>
);

const Kitchen: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.kitchen} />
    {Array.from({ length: 10 }).map((_, k) => (
      <rect
        key={k}
        x={-200 + k * 150}
        y={700 + (k % 2) * 0}
        width={150}
        height={150}
        fill="none"
        stroke="#E0B020"
        strokeWidth={6}
      />
    ))}
    <rect
      x={-2000}
      y={1150}
      width={5000}
      height={60}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={8}
    />
    <rect
      x={-2000}
      y={1210}
      width={5000}
      height={400}
      fill="#E2513C"
      stroke={INK}
      strokeWidth={8}
    />
    <rect x={-2000} y={1610} width={5000} height={2000} fill="#C99A6A" />
  </g>
);

const ExRoom: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.exRoom} />
    {Array.from({ length: 12 }).map((_, k) => (
      <circle
        key={k}
        cx={-200 + (k % 4) * 400}
        cy={200 + Math.floor(k / 4) * 400}
        r={60}
        fill="#FFFFFF"
        opacity={0.15}
      />
    ))}
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#B03A7A" />
    <rect
      x={620}
      y={300}
      width={360}
      height={460}
      rx={18}
      fill="#FFE9F4"
      stroke={INK}
      strokeWidth={8}
    />
    <circle
      cx={800}
      cy={480}
      r={110}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={6}
    />
  </g>
);

const SepiaRoom: React.FC = () => (
  <g>
    <Room wall="#C9A877" floor={1500} window />
    <rect
      x={100}
      y={420}
      width={260}
      height={340}
      rx={12}
      fill="#E8D2A8"
      stroke={INK}
      strokeWidth={7}
    />
    <path
      d="M 160 700 L 230 520 L 300 700 Z"
      fill="#B88A50"
      stroke={INK}
      strokeWidth={6}
    />
  </g>
);

const Office: React.FC = () => (
  <g>
    <rect x={-2000} y={-2000} width={5000} height={5000} fill={G.office} />
    {Array.from({ length: 6 }).map((_, k) => (
      <rect
        key={k}
        x={-300 + k * 300}
        y={-2000}
        width={30}
        height={3500}
        fill="#FFFFFF"
        opacity={0.25}
      />
    ))}
    <rect
      x={560}
      y={360}
      width={460}
      height={340}
      rx={16}
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={9}
    />
    <path
      d="M 610 640 L 720 560 L 800 600 L 960 430"
      fill="none"
      stroke={P.red}
      strokeWidth={14}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x={-2000} y={1500} width={5000} height={2000} fill="#5E8F3A" />
  </g>
);

const OfficeChair: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r?: number;
}> = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect
      x={-110}
      y={-430}
      width={220}
      height={260}
      rx={40}
      fill="#2B2F45"
      stroke={INK}
      strokeWidth={8}
    />
    <rect
      x={-130}
      y={-200}
      width={260}
      height={60}
      rx={24}
      fill="#2B2F45"
      stroke={INK}
      strokeWidth={8}
    />
    <rect x={-12} y={-140} width={24} height={100} fill={INK} />
    <path
      d="M -110 0 L 0 -40 L 110 0"
      fill="none"
      stroke={INK}
      strokeWidth={14}
      strokeLinecap="round"
    />
  </g>
);

/* ================================================================== */
/* hook                                                               */
/* ================================================================== */

export const GHook: React.FC = () => {
  const { f, d, W } = useBeats();
  const inv = W("invisible", 0.75);
  const { i, lf, len } = useShot([W("turn", 0.62) - 2], d, f);
  const X = 540;
  const Y = 1560;
  if (i === 0) {
    // Gehweg: Chat-Blase poppt ab Frame 0 auf, er grinst, wischt weg – „gelesen“-Auge, Füße beginnen zu schimmern
    const swipe = ease(lf, 22, 30);
    const k = ease(lf, 30, len + 20) * 0.55;
    const [hx, hy] = hand(X, Y, 1, lerp(150, 120, swipe), 1);
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1200, 540, 1000, 1.05)],
          [len, frameOn(540, 1200, 540, 1000, 1.14)],
        ])}
      >
        <Layer depth={0.6}>
          <Sidewalk />
        </Layer>
        <Layer>
          <Vanish y0={Y} y1={Y - 560} k={k} f={f}>
            <Hooker
              x={X}
              y={Y}
              s={1}
              eyes={swipe > 0.5 ? "half" : "open"}
              look={[1, -1]}
              brows={swipe > 0.5 ? "up" : "neutral"}
              mouth={swipe > 0.3 ? "smug" : "flat"}
              armR={lerp(150, 120, swipe)}
              bendR={-70}
              armL={15}
            />
            <PhoneS x={hx} y={hy - 40} s={1.3} r={-10} />
          </Vanish>
          <Bubble
            x={lerp(620, 1150, swipe)}
            y={lerp(600, 480, swipe)}
            o={ease(lf, 0, 6)}
            s={0.8}
            side={-1}
            lines={2}
            w={380}
          />
          <SeenEye x={830} y={720} t={lf - 30} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  // Näher: er verblasst von den Füßen aufwärts, nur das Handy schwebt; Passantin geht vorbei, zuckt nur mit den Schultern
  const k = lerp(0.55, 1, ease(lf, 0, Math.max(8, inv - (d - len) + 4)));
  const [hx, hy] = hand(X, Y, 1, 120, 1);
  const walk = lf / len;
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(540, 1150, 540, 900, 1.25)],
        [len, frameOn(540, 1150, 540, 900, 1.36)],
      ])}
    >
      <Layer depth={0.6}>
        <Sidewalk />
      </Layer>
      <Layer>
        <Vanish y0={Y} y1={Y - 560} k={k} f={f}>
          <Hooker
            x={X}
            y={Y}
            s={1}
            eyes="wide"
            look={[0, 1]}
            brows="up"
            mouth="o"
            open={0.6}
            armR={120}
            bendR={-70}
            armL={30}
          />
        </Vanish>
        <PhoneS
          x={hx}
          y={hy - 40 + Math.sin(f * 0.2) * 12 * k}
          s={1.3}
          r={-10 + Math.sin(f * 0.15) * 8 * k}
        />
        <Poof x={X} y={Y - 300} t={lf - (inv - (d - len))} s={1.2} />
        <Person
          x={lerp(1200, 150, walk)}
          y={1600}
          s={0.9}
          shirt={P.lime}
          hair="pony"
          hairColor="#8A4B22"
          skin={P.skin3}
          eyes="half"
          look={[-1, 0]}
          brows="neutral"
          mouth="flat"
          armL={walk > 0.5 ? 40 : 10}
          armR={walk > 0.5 ? 40 : 10}
          flip
        />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* rules                                                              */
/* ================================================================== */

export const GRules: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot(
    [W("Ghost", 0.45) - 2, W("Bro", 0.7) - 2],
    d,
    f,
  );
  if (i === 0) {
    // Café: Frau lässt einen Chat auf „gelesen“ – ihre Hände verschwinden, die Tasse schwebt
    const X = 420;
    const Y = 1500;
    const k = ease(lf, 14, 34);
    const [lx, ly] = hand(X, Y, 1, 60, -1, true);
    const [rx, ry] = hand(X, Y, 1, 60, 1, true);
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(500, 1150, 540, 950, 1.2)],
          [len, frameOn(500, 1150, 540, 950, 1.3)],
        ])}
      >
        <Layer depth={0.6}>
          <Cafe />
        </Layer>
        <Layer>
          <Vanish
            y0={0}
            y1={0}
            k={0}
            holes={[
              [lx, ly, 46 * k],
              [rx, ry, 46 * k],
            ]}
            f={f}
          >
            <Person
              x={X}
              y={Y}
              s={1}
              seated
              shirt={P.orange}
              hair="curly"
              hairColor="#2A1B12"
              skin={P.skin2}
              eyes={k > 0.5 ? "wide" : "half"}
              look={[0, 1]}
              brows={k > 0.5 ? "up" : "neutral"}
              mouth={k > 0.5 ? "o" : "smug"}
              open={0.5}
              armL={60}
              armR={60}
            />
          </Vanish>
          <Table x={520} y={1260} w={760} />
          <PhoneS x={lx + 10} y={ly - 30 - k * 30} s={1.1} r={-8} />
          <Cup
            x={rx + 40}
            y={ry - 20 - k * 70 + Math.sin(f * 0.2) * 8 * k}
            s={0.8}
            r={Math.sin(f * 0.15) * 10 * k}
            f={f}
            c={P.teal}
          />
          <SeenEye x={250} y={780} t={lf - 6} s={0.8} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Restaurant: Date mit Rosen gegenüber einem schwebenden Hoodie
    const X = 760;
    const Y = 1500;
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 960, 1.0)],
          [len, frameOn(540, 1150, 540, 960, 1.08)],
        ])}
      >
        <Layer depth={0.6}>
          <Resto f={f} />
        </Layer>
        <Layer>
          <Person
            x={260}
            y={1500}
            s={1}
            seated
            shirt={P.bus}
            hair="side"
            hairColor="#4A2E1E"
            skin={P.skin}
            eyes="open"
            look={[1, 0]}
            brows="up"
            mouth="smile"
            armR={70}
            bendR={-50}
            armL={10}
            blush
          />
          <Vanish
            y0={Y}
            y1={Y - 560}
            k={1}
            keep={[
              [X - 130, Y - 260, 260, 230],
              [X - 230, Y - 250, 120, 200],
              [X + 110, Y - 250, 120, 200],
            ]}
            f={f}
          >
            <Person
              x={X}
              y={Y}
              s={1}
              seated
              shirt={P.ted}
              hair="spiky"
              hairColor="#2A1B12"
              skin={P.skin2}
              armL={50}
              armR={50}
            />
          </Vanish>
          <Table x={520} y={1260} w={820} c="#FFF4DE" />
          <Candle x={520} y={1260} f={f} />
          <Rose
            x={hand(260, 1500, 1, 70, 1, true)[0] + 30}
            y={hand(260, 1500, 1, 70, 1, true)[1]}
            s={0.9}
            r={20}
          />
        </Layer>
      </Shot>
    );
  }
  // Nah: der Hoodie schlürft durch den Strohhalm, das Date weint in die Rosen
  const sip = ease(lf, 4, len);
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(560, 1080, 540, 900, 1.35)],
        [len, frameOn(560, 1080, 540, 900, 1.42)],
      ])}
    >
      <Layer depth={0.6}>
        <Resto f={f} />
      </Layer>
      <Layer>
        <Person
          x={260}
          y={1500}
          s={1}
          seated
          shirt={P.bus}
          hair="side"
          hairColor="#4A2E1E"
          skin={P.skin}
          eyes="closed"
          brows="sad"
          mouth="frown"
          armR={70}
          bendR={-50}
          armL={10}
        />
        <Tear x={240} y={1100} f={f} />
        <Vanish
          y0={1500}
          y1={940}
          k={1}
          keep={[
            [630, 1240, 260, 230],
            [530, 1250, 120, 200],
            [870, 1250, 120, 200],
          ]}
          f={f}
        >
          <Person
            x={760}
            y={1500}
            s={1}
            seated
            shirt={P.ted}
            hair="spiky"
            hairColor="#2A1B12"
            skin={P.skin2}
            armL={50}
            armR={50}
          />
        </Vanish>
        <Cup
          x={740}
          y={1250 - Math.sin(lf * 0.4) * 6}
          s={0.8}
          straw
          lvl={1 - sip}
        />
        <Table x={520} y={1260} w={820} c="#FFF4DE" />
        <Rose
          x={hand(260, 1500, 1, 70, 1, true)[0] + 30}
          y={hand(260, 1500, 1, 70, 1, true)[1]}
          s={0.9}
          r={20}
        />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* landlord                                                           */
/* ================================================================== */

export const GLandlord: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Now", 0.5) - 2, W("rent", 0.8) - 3], d, f);
  if (i === 0) {
    // Bröckelndes Haus: Mieter mit Eimern winken mit Handys zum dunklen Fenster des Vermieters
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 900, 540, 900, 0.95)],
          [len, frameOn(540, 860, 540, 900, 1.03)],
        ])}
      >
        <Layer>
          <Block f={f} />
          {[0, 1, 2, 3, 5, 6, 7, 8].map((k) => {
            const x = 250 + (k % 3) * 290;
            const y = 520 + Math.floor(k / 3) * 360;
            return (
              <g key={k}>
                <g transform={`translate(${x} ${y}) scale(0.42)`}>
                  <Tenant
                    x={0}
                    y={0}
                    s={1}
                    c={
                      [
                        P.red,
                        P.lime,
                        P.purple,
                        P.teal,
                        P.orange,
                        P.pink,
                        P.sky,
                        P.bus,
                      ][k]
                    }
                    h={(["side", "curly", "bun", "spiky"] as const)[k % 4]}
                    eyes="wide"
                    brows="angry"
                    mouth="scream"
                    open={0.5 + 0.3 * Math.sin(f * 0.5 + k)}
                    armR={150 + Math.sin(f * 0.6 + k) * 20}
                    armL={20}
                  />
                </g>
                <PhoneS
                  x={x + 70}
                  y={y - 210 + Math.sin(f * 0.6 + k) * 10}
                  s={0.5}
                />
              </g>
            );
          })}
          <Bucket x={200} y={1600} s={1.1} />
          <Bucket x={860} y={1600} s={1.1} />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Flur: nur Hut + Zigarre schweben, Schall-Ringe; Mieter weichen zurück
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1100, 540, 900, 1.05)],
          [len, frameOn(540, 1100, 540, 900, 1.15)],
        ])}
      >
        <Layer depth={0.6}>
          <Hallway />
        </Layer>
        <Layer>
          <Hat x={560} y={830} s={1.1} f={f} />
          <Voice x={600} y={1010} f={f} />
          <Tenant
            x={150}
            y={1560}
            s={0.95}
            c={P.lime}
            h="curly"
            eyes="wide"
            brows="up"
            mouth="o"
            open={0.7}
            armL={40}
            armR={60}
            lean={-8}
          />
          <Tenant
            x={950}
            y={1560}
            s={0.95}
            c={P.purple}
            h="bun"
            eyes="wide"
            brows="worried"
            mouth="frown"
            armL={30}
            armR={30}
            lean={8}
            flip
          />
        </Layer>
      </Shot>
    );
  }
  // Wohnung: Räumungsblatt rutscht unter der Tür durch, Mieter schreit
  const slide = ease(lf, 0, 14);
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(540, 1200, 540, 960, 1.15)],
        [len, frameOn(540, 1200, 540, 960, 1.25)],
      ])}
    >
      <Layer depth={0.6}>
        <Room wall="#FFE08A" floor={1500} />
        <rect
          x={700}
          y={700}
          width={360}
          height={800}
          fill="#7E4320"
          stroke={INK}
          strokeWidth={9}
        />
      </Layer>
      <Layer>
        <Notice
          x={lerp(860, 560, slide)}
          y={1540}
          s={0.9}
          r={lerp(0, -8, slide)}
        />
        <Tenant
          x={300}
          y={1560}
          s={1}
          c={P.teal}
          h="spiky"
          hc="#2A1B12"
          eyes="wide"
          brows="up"
          mouth="scream"
          open={0.4 + ease(lf, 6, 14) * 0.6}
          armL={160}
          armR={160}
          bendL={30}
          bendR={30}
        />
        <Burst x={300} y={1150} r0={170} r1={240} o={ease(lf, 8, 12)} />
        <Voice x={880} y={1000} f={f} o={0.6} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* jake                                                               */
/* ================================================================== */

export const GJake: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot(
    [W("Forty-three", 0.25) - 2, W("His", 0.45) - 2, W("Can", 0.65) - 2],
    d,
    f,
  );
  const X = 540;
  const Y = 1500;
  if (i === 0) {
    // Jake halbnah (Beine außerhalb des Bildes), Handy, schiefes Lächeln
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1080, 540, 1000, 1.5)],
          [len, frameOn(540, 1080, 540, 1000, 1.58)],
        ])}
      >
        <Layer depth={0.6}>
          <Apt />
        </Layer>
        <Layer>
          <Jake
            x={X}
            y={Y}
            s={1}
            eyes="open"
            brows="up"
            mouth="grin"
            armR={150}
            bendR={-70}
            armL={60}
            gest={6}
          />
          <PhoneS
            x={hand(X, Y, 1, 150, 1)[0] - 10}
            y={hand(X, Y, 1, 150, 1)[1] - 40}
            s={1.1}
            r={-10}
          />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Handy-Nah: Posteingang voller roter Punkte, ganz unten ein verschwommener Chat (Jung-Jake, PLANT)
    const scroll = ease(lf, 0, len, "linear");
    return (
      <Shot
        cam={camPath(lf, [
          [0, { x: 540, y: 960, zoom: 1.0 }],
          [len, { x: 540, y: 1020, zoom: 1.08 }],
        ])}
      >
        <Layer depth={0}>
          <ReactBg a="#2A2470" b="#3A34A0" f={f} />
        </Layer>
        <Layer>
          <BigPhone x={540} y={960} s={1.25}>
            <g transform={`translate(0 ${-scroll * 120})`}>
              <Inbox rows={9} f={f} />
            </g>
          </BigPhone>
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Totale: Kamera neigt runter – die Beine sind nur noch Schimmer, Jake zuckt mit den Schultern
    const k = 0.34;
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 800, 1.2)],
          [len, frameOn(540, 1350, 540, 900, 1.15)],
        ])}
      >
        <Layer depth={0.6}>
          <Apt />
        </Layer>
        <Layer>
          <Vanish y0={Y} y1={Y - 560} k={k} f={f}>
            <Jake
              x={X}
              y={Y}
              s={1}
              eyes="half"
              look={[0, 1]}
              brows="up"
              mouth="flat"
              armR={40 + Math.sin(lf * 0.3) * 10}
              armL={40 + Math.sin(lf * 0.3) * 10}
            />
          </Vanish>
          <PhoneS
            x={hand(X, Y, 1, 40, 1)[0]}
            y={hand(X, Y, 1, 40, 1)[1]}
            s={1}
            r={20}
          />
          {/* Socken liegen leer am Boden */}
          <ellipse
            cx={X - 40}
            cy={Y - 4}
            rx={50}
            ry={16}
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={5}
            opacity={0.9}
          />
          <ellipse
            cx={X + 40}
            cy={Y - 4}
            rx={50}
            ry={16}
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={5}
            opacity={0.9}
          />
        </Layer>
      </Shot>
    );
  }
  // Nah: Uhr 19 Uhr tickt, Jake schwitzt
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(540, 900, 540, 900, 1.0)],
        [len, frameOn(540, 900, 540, 900, 1.1)],
      ])}
    >
      <Layer depth={0}>
        <ReactBg a="#FF9A3D" b="#FFC27A" f={f} />
      </Layer>
      <Layer>
        <Clock
          x={540}
          y={330}
          s={0.75}
          h={(7 / 12) * Math.PI * 2}
          m={(lf / 30) * 0.6}
        />
        <Vanish y0={1300} y1={740} k={0.34} f={f}>
          <Jake
            x={540}
            y={1300}
            s={1.15}
            eyes="wide"
            look={[0, -1]}
            brows="worried"
            mouth="frown"
            armL={10}
            armR={10}
          />
        </Vanish>
        <Sweat x={700} y={710 + ((lf * 3) % 30)} s={1.3} />
        <Sweat x={380} y={680 + ((lf * 2) % 30)} s={1} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* mom                                                                */
/* ================================================================== */

export const GMom: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot(
    [W("Sorry", 0.4) - 2, W("His", 0.6, 2) - 2],
    d,
    f,
  );
  if (i === 0) {
    // Handy-Nah: Mom-Chat, Daumen tippt, grüne Antwort-Blase fliegt hoch
    const sent = ease(lf, len * 0.45, len * 0.6);
    return (
      <Shot
        cam={camPath(lf, [
          [0, { x: 540, y: 960, zoom: 1.0 }],
          [len, { x: 540, y: 960, zoom: 1.06 }],
        ])}
      >
        <Layer depth={0}>
          <ReactBg a="#7A4DE0" b="#9A72FF" f={f} />
        </Layer>
        <Layer>
          <BigPhone x={540} y={900} s={1.25}>
            <circle cx={300} cy={90} r={50} fill={P.purple} />
            <Bubble x={250} y={330} o={1} s={0.9} side={-1} lines={3} w={420} />
            <Bubble
              x={360}
              y={lerp(900, 640, sent)}
              o={sent}
              s={0.9}
              side={1}
              lines={1}
              w={360}
            />
            <rect
              x={40}
              y={980}
              width={520}
              height={80}
              rx={40}
              fill="#2E3350"
            />
          </BigPhone>
          <Thumb
            x={lerp(700, 640, ease(lf, 0, len * 0.45))}
            y={lerp(1700, 1560, bumpish(lf, len * 0.45))}
            s={1.6}
            r={-20}
          />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Moms Küche: sie tippt wie wild, aus dem Handy quillt eine endlose Papierrolle Text-Kritzel
    const roll = ease(lf, 0, len, "linear");
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 960, 1.05)],
          [len, frameOn(540, 1150, 540, 960, 1.12)],
        ])}
      >
        <Layer depth={0.6}>
          <Kitchen />
        </Layer>
        <Layer>
          <Mom
            x={300}
            y={1560}
            s={1}
            eyes="wide"
            brows="up"
            mouth="talk"
            open={0.4 + 0.3 * Math.sin(lf * 0.9)}
            armR={110}
            bendR={-40}
            armL={40}
            bendL={-60}
          />
          <PhoneS x={530} y={1160} s={1.1} r={15} />
          <g>
            <path
              d={`M 560 1100 Q ${840 + roll * 60} ${980 - roll * 120} ${920} ${1200 + roll * 300}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={110}
              strokeLinecap="round"
            />
            {Array.from({ length: Math.floor(4 + roll * 10) }).map((_, k) => (
              <rect
                key={k}
                x={600 + k * 22}
                y={1020 - k * 4 + (k > 6 ? (k - 6) * 60 : 0)}
                width={70}
                height={10}
                rx={5}
                fill="#3A3F5A"
                opacity={0.6}
                transform={`rotate(${30 + k * 6} ${600 + k * 22} ${1020})`}
              />
            ))}
          </g>
          <Tear x={280} y={1140} f={f} />
        </Layer>
      </Shot>
    );
  }
  // Knie kommen mit Funkeln zurück, Jake jubelt
  const k = lerp(0.34, 0.16, ease(lf, 0, 10));
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(540, 1250, 540, 960, 1.15)],
        [len, frameOn(540, 1250, 540, 960, 1.22)],
      ])}
    >
      <Layer depth={0.6}>
        <Apt />
      </Layer>
      <Layer>
        <Vanish y0={1500} y1={940} k={k} f={f}>
          <Jake
            x={540}
            y={1500}
            s={1}
            eyes="wide"
            brows="up"
            mouth="grin"
            armR={160 - jolt(lf, 10, 10)}
            armL={160 - jolt(lf, 10, 10)}
            bendL={20}
            bendR={20}
          />
        </Vanish>
        <Sparkle x={500} y={1330} t={lf} s={1.2} />
        <Sparkle x={590} y={1350} t={lf - 4} s={1} />
      </Layer>
    </Shot>
  );
};

const bumpish = (f: number, at: number) => clamp01(1 - Math.abs(f - at) / 6);

/* ================================================================== */
/* ex                                                                 */
/* ================================================================== */

export const GEx: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot(
    [W("She", 0.3) - 2, W("vanishes", 0.65) - 2],
    d,
    f,
  );
  if (i === 0) {
    // Jake schickt hoffnungsvoll ein Winken
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 1000, 1.25)],
          [len, frameOn(540, 1150, 540, 1000, 1.32)],
        ])}
      >
        <Layer depth={0.6}>
          <Apt wall="#9FE8D8" />
        </Layer>
        <Layer>
          <Vanish y0={1500} y1={940} k={0.16} f={f}>
            <Jake
              x={420}
              y={1500}
              s={1}
              eyes="open"
              look={[1, -0.5]}
              brows="up"
              mouth="smile"
              blush
              armR={150}
              bendR={-70}
              armL={10}
            />
          </Vanish>
          <PhoneS
            x={hand(420, 1500, 1, 150, 1)[0] - 10}
            y={hand(420, 1500, 1, 150, 1)[1] - 40}
            s={1.1}
            r={-10}
          />
          <Bubble
            x={780}
            y={lerp(860, 720, ease(lf, 4, 14))}
            o={ease(lf, 4, 10)}
            s={0.9}
            side={1}
            lines={1}
            w={260}
            icon={<WaveIcon f={f} />}
          />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Ex auf dem Bett: Augenrollen, „gelesen“
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 960, 1.2)],
          [len, frameOn(540, 1150, 540, 960, 1.28)],
        ])}
      >
        <Layer depth={0.6}>
          <ExRoom />
        </Layer>
        <Layer>
          <rect
            x={80}
            y={1320}
            width={920}
            height={180}
            rx={30}
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={8}
          />
          <Ex
            x={540}
            y={1400}
            s={1}
            seated
            eyes={lf > 8 ? "rolled" : "half"}
            brows="neutral"
            mouth="smug"
            armR={150}
            bendR={-70}
            armL={20}
          />
          <PhoneS
            x={hand(540, 1400, 1, 150, 1, true)[0] - 10}
            y={hand(540, 1400, 1, 150, 1, true)[1] - 40}
            s={1.1}
            r={-10}
          />
          <SeenEye x={850} y={820} t={lf - 10} s={0.9} />
        </Layer>
      </Shot>
    );
  }
  // Sie verschwindet aus purem Trotz – grinsend, Zunge raus, zuletzt winkt die Hand
  const k = ease(lf, 2, len - 6);
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(540, 1150, 540, 960, 1.3)],
        [len, frameOn(540, 1100, 540, 960, 1.4)],
      ])}
    >
      <Layer depth={0.6}>
        <ExRoom />
      </Layer>
      <Layer>
        <rect
          x={80}
          y={1320}
          width={920}
          height={180}
          rx={30}
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth={8}
        />
        <Vanish y0={1400} y1={760} k={k} f={f}>
          <Ex
            x={540}
            y={1400}
            s={1}
            seated
            eyes="closed"
            brows="up"
            mouth="smug"
            armR={170 + Math.sin(lf * 0.8) * 15}
            armL={20}
          />
          <path
            d={`M 560 ${1400 - 386 + 50} q 0 40 -16 46 q -16 -6 -16 -46 Z`}
            fill={P.red}
            stroke={INK}
            strokeWidth={4}
          />
        </Vanish>
        <Poof x={540} y={1100} t={lf - 4} s={1.3} />
        <PhoneS
          x={hand(540, 1400, 1, 60, -1, true)[0]}
          y={hand(540, 1400, 1, 60, -1, true)[1] + Math.sin(f * 0.2) * 10 * k}
          s={1.0}
          r={Math.sin(f * 0.15) * 12 * k}
        />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* panic                                                              */
/* ================================================================== */

export const GPanic: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("Bro", 0.3) - 2, W("One", 0.62) - 2], d, f);
  if (i === 0) {
    // ECU: Uhr 23:59, rot pulsierend
    return (
      <Shot
        cam={camPath(lf, [
          [0, { x: 540, y: 900, zoom: 1.1 }],
          [len, { x: 540, y: 900, zoom: 1.25 }],
        ])}
      >
        <Layer depth={0}>
          <ReactBg a="#8A1A2A" b="#FF4D5E" f={f} />
        </Layer>
        <Layer>
          <Clock
            x={540 + jolt(lf, 0, 8)}
            y={880}
            s={1.15}
            h={Math.PI * 2 * (11.98 / 12)}
            m={Math.PI * 2 * (59 / 60) + (lf % 30 < 3 ? 0.02 : 0)}
          />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Couch: nur noch Augenbrauen und ein Daumen über dem Handy, Schweißtropfen schweben
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(560, 1080, 540, 860, 1.45)],
          [len, frameOn(560, 1050, 540, 860, 1.55)],
        ])}
      >
        <Layer depth={0.6}>
          <Apt dark={0.45} />
          <CouchBack x={540} y={1460} w={900} color="#E2513C" />
        </Layer>
        <Layer>
          <Vanish y0={1400} y1={760} k={1} f={f}>
            <Jake
              x={540}
              y={1400}
              s={1}
              seated
              eyes="wide"
              brows="worried"
              mouth="frown"
              armR={150}
              bendR={-70}
              armL={20}
            />
          </Vanish>
          <CouchFront x={540} y={1460} w={900} color="#E2513C" dark="#A8331F" />
          <Brows
            x={540 + Math.sin(f * 0.4) * 4}
            y={head(540, 1400, 1, true)[1] - 50}
            s={1}
            mood="worried"
          />
          <PhoneS
            x={hand(540, 1400, 1, 150, 1, true)[0] - 10}
            y={hand(540, 1400, 1, 150, 1, true)[1] - 40}
            s={1.1}
            r={-10}
            glow="#BFE8FF"
          />
          <Thumb
            x={hand(540, 1400, 1, 150, 1, true)[0] + 40}
            y={hand(540, 1400, 1, 150, 1, true)[1] - 10 + Math.sin(f * 0.8) * 8}
            s={0.9}
            r={-30}
          />
          <Sweat
            x={470}
            y={head(540, 1400, 1, true)[1] + ((lf * 4) % 60)}
            s={1}
          />
          <Sweat
            x={640}
            y={head(540, 1400, 1, true)[1] - 20 + ((lf * 3) % 60)}
            s={0.8}
          />
        </Layer>
      </Shot>
    );
  }
  // Handy-Nah: ein Chat übrig – der verschwommene von vorhin, Zoom
  return (
    <Shot
      cam={camPath(lf, [
        [0, { x: 540, y: 960, zoom: 1.0 }],
        [len, { x: 540, y: 1180, zoom: 1.4 }],
      ])}
    >
      <Layer depth={0}>
        <ReactBg a="#2A2470" b="#3A34A0" f={f} />
      </Layer>
      <Layer>
        <BigPhone x={540} y={960} s={1.25}>
          <g transform="translate(0 -830)">
            <Inbox rows={9} f={f} done={8} />
          </g>
        </BigPhone>
        <Brows x={540} y={240} s={1.2} mood="worried" />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* twist                                                              */
/* ================================================================== */

export const GTwist: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot(
    [W("Five", 0.2) - 2, W("reads", 0.6) - 2, W("leaves", 0.82) - 2],
    d,
    f,
  );
  const Chat: React.FC<{ readonly o?: number }> = ({ o = 1 }) => (
    <g>
      {/* Avatar: Jung-Jake (scharf) */}
      <circle cx={300} cy={110} r={64} fill="#FFB627" />
      <circle
        cx={300}
        cy={118}
        r={42}
        fill={P.skin}
        stroke={INK}
        strokeWidth={4}
      />
      <circle cx={300} cy={80} r={34} fill={G.hair} />
      <circle cx={286} cy={118} r={5} fill={INK} />
      <circle cx={314} cy={118} r={5} fill={INK} />
      <path
        d="M 286 134 Q 300 144 314 134"
        fill="none"
        stroke={INK}
        strokeWidth={4}
      />
      <Bubble
        x={260}
        y={420}
        o={o}
        s={0.95}
        side={-1}
        lines={3}
        w={440}
        c="#FFF4DE"
      />
    </g>
  );
  if (i === 0) {
    // Chat öffnet sich: Avatar ist Jake selbst, jünger; Augenbrauen schießen hoch
    return (
      <Shot
        cam={camPath(lf, [
          [0, { x: 540, y: 900, zoom: 1.1 }],
          [len, { x: 540, y: 820, zoom: 1.25 }],
        ])}
      >
        <Layer depth={0}>
          <ReactBg a="#2A2470" b="#3A34A0" f={f} />
        </Layer>
        <Layer>
          <BigPhone x={540} y={960} s={1.25}>
            <Chat o={ease(lf, 4, 12)} />
          </BigPhone>
          <Brows x={540} y={lerp(260, 200, ease(lf, 2, 8))} s={1.2} mood="up" />
        </Layer>
      </Shot>
    );
  }
  if (i === 1) {
    // Rückblende (Sepia): Jung-Jake, mit Beinen, tippt hoffnungsvoll ins Handy
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1200, 540, 1000, 1.1)],
          [len, frameOn(540, 1200, 540, 1000, 1.18)],
        ])}
      >
        <Layer depth={0.6}>
          <SepiaRoom />
        </Layer>
        <Layer>
          <Jake
            young
            x={540}
            y={1500}
            s={0.95}
            eyes="open"
            look={[0.5, 1]}
            brows="up"
            mouth="smile"
            armR={55}
            bendR={-95}
            armL={55}
            bendL={-95}
          />
          <PhoneS x={540} y={1320} s={1.0} glow="#FFF4DE" />
          <rect
            x={-2000}
            y={-2000}
            width={5000}
            height={5000}
            fill="#C8A070"
            opacity={0.32}
          />
          <rect
            x={-2000}
            y={-2000}
            width={5000}
            height={5000}
            fill="none"
            stroke="#3A2A1A"
            strokeWidth={2600}
            opacity={0.35}
          />
        </Layer>
      </Shot>
    );
  }
  if (i === 2) {
    // Nah: Augenbrauen über der Nachricht, Daumen zögert
    return (
      <Shot
        cam={camPath(lf, [
          [0, { x: 540, y: 900, zoom: 1.15 }],
          [len, { x: 540, y: 900, zoom: 1.25 }],
        ])}
      >
        <Layer depth={0}>
          <ReactBg a="#1A1636" b="#2A2470" f={f} />
        </Layer>
        <Layer>
          <BigPhone x={540} y={960} s={1.25}>
            <Chat />
          </BigPhone>
          <Brows x={540} y={220} s={1.2} mood="sad" />
          <Thumb x={720 + Math.sin(lf * 0.5) * 20} y={1400} s={1.6} r={-20} />
        </Layer>
      </Shot>
    );
  }
  // ECU: Daumen wischt weg, „gelesen“-Auge, Brauen verblassen, Handy fällt
  const sw = ease(lf, 2, 9);
  const fall = ease(lf, 14, len, "linear");
  const gone = ease(lf, 8, 20);
  return (
    <Shot
      cam={camPath(lf, [
        [0, { x: 540, y: 960, zoom: 1.0 }],
        [len, { x: 540, y: 1020, zoom: 0.95 }],
      ])}
    >
      <Layer depth={0}>
        <ReactBg a="#1A1636" b="#2A2470" f={f} />
      </Layer>
      <Layer>
        <g
          transform={`translate(0 ${fall * fall * 900}) rotate(${fall * 25} 540 960)`}
        >
          <BigPhone x={540} y={960} s={1.15}>
            <g transform={`translate(${-sw * 700} 0)`}>
              <Chat />
            </g>
            <Inbox rows={0} f={f} />
          </BigPhone>
        </g>
        <SeenEye x={540} y={700} t={lf - 8} s={1.2} />
        <Brows x={540} y={220} s={1.2} mood="sad" o={1 - gone} />
        <Thumb x={lerp(820, 240, sw)} y={1300} s={1.6} r={-20} o={1 - gone} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* gone                                                               */
/* ================================================================== */

export const GGone: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("fuck", 0.45) - 2], d, f);
  if (i === 0) {
    // Leere Couch, Handy leuchtet am Boden, Uhr springt auf 12
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 960, 0.95)],
          [len, frameOn(540, 1150, 540, 960, 1.02)],
        ])}
      >
        <Layer depth={0.6}>
          <Apt dark={0.5} />
          <CouchBack x={540} y={1460} w={900} color="#E2513C" />
        </Layer>
        <Layer>
          <CouchFront x={540} y={1460} w={900} color="#E2513C" dark="#A8331F" />
          <Clock x={540} y={520} s={0.5} h={0} m={0} />
          <Burst x={540} y={520} r0={170} r1={220} o={1 - ease(lf, 0, 12)} />
          <PhoneS x={760} y={1640} s={1.1} r={80} glow="#BFE8FF" />
          <Confetti f={f} o={0.25} />
        </Layer>
      </Shot>
    );
  }
  // Katze springt auf die Couch – und sitzt auf etwas Unsichtbarem, eine Handbreit über dem Polster. Fauchen.
  const jump = ease(lf, 0, 8);
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(540, 1300, 540, 1000, 1.3)],
        [len, frameOn(540, 1250, 540, 1000, 1.4)],
      ])}
    >
      <Layer depth={0.6}>
        <Apt dark={0.5} />
        <CouchBack x={540} y={1460} w={900} color="#E2513C" />
      </Layer>
      <Layer>
        <Vanish y0={1400} y1={760} k={1} ghost={0.1} f={f}>
          <Jake
            x={520}
            y={1400}
            s={1}
            seated
            eyes="closed"
            brows="sad"
            mouth="flat"
            armL={10}
            armR={10}
          />
        </Vanish>
        <CouchFront x={540} y={1460} w={900} color="#E2513C" dark="#A8331F" />
        <Cat
          x={lerp(900, 520, jump)}
          y={lerp(1640, 1215, jump) - Math.sin(jump * Math.PI) * 200}
          s={1}
          f={f}
          hiss={ease(lf, 12, 16)}
        />
        <ellipse
          cx={520}
          cy={1405}
          rx={130}
          ry={14}
          fill="#E8F8FF"
          opacity={0.25 + 0.15 * Math.sin(f * 0.4)}
        />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* after                                                              */
/* ================================================================== */

export const GAfter: React.FC = () => {
  const { f, d, W } = useBeats();
  const { i, lf, len } = useShot([W("still", 0.6) - 2], d, f);
  if (i === 0) {
    // Büro: Chef hält eine Rede an einen leeren Stuhl mit schwebender Tasse
    return (
      <Shot
        cam={camPath(lf, [
          [0, frameOn(540, 1150, 540, 960, 1.0)],
          [len, frameOn(540, 1150, 540, 960, 1.08)],
        ])}
      >
        <Layer depth={0.6}>
          <Office />
        </Layer>
        <Layer>
          <OfficeChair x={720} y={1540} r={Math.sin(f * 0.1) * 3} />
          <Cup x={760} y={1180 + Math.sin(f * 0.2) * 10} s={0.7} f={f} />
          <Boss
            x={300}
            y={1560}
            s={1}
            eyes="open"
            look={[1, 0]}
            brows="up"
            mouth="talk"
            open={0.4 + 0.3 * Math.sin(lf * 0.8)}
            armR={100}
            bendR={-20}
            armL={20}
            gest={10}
          />
          <Person
            x={1020}
            y={1580}
            s={0.85}
            shirt={P.purple}
            hair="bun"
            hairColor="#2A1B12"
            skin={P.skin3}
            eyes="half"
            look={[-1, 0]}
            brows="neutral"
            mouth="flat"
            armL={10}
            armR={10}
            flip
          />
        </Layer>
      </Shot>
    );
  }
  // Nah: Chef klopft auf eine unsichtbare Schulter (Hand stoppt in der Luft), die Tasse kippt zum Schluck
  const pat = Math.abs(Math.sin(lf * 0.5)) * 12;
  return (
    <Shot
      cam={camPath(lf, [
        [0, frameOn(560, 1100, 540, 960, 1.35)],
        [len, frameOn(560, 1100, 540, 960, 1.45)],
      ])}
    >
      <Layer depth={0.6}>
        <Office />
      </Layer>
      <Layer>
        <OfficeChair x={720} y={1540} />
        <Boss
          x={360}
          y={1560}
          s={1}
          eyes="closed"
          brows="up"
          mouth="smile"
          armR={115 - pat}
          bendR={-10}
          armL={10}
        />
        <Cup
          x={760}
          y={1150 - ease(lf, 6, 16) * 40}
          s={0.7}
          r={-ease(lf, 6, 16) * 40}
          f={f}
        />
        <ellipse
          cx={720}
          cy={1030}
          rx={70}
          ry={10}
          fill="#E8F8FF"
          opacity={0.35}
        />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* outro                                                              */
/* ================================================================== */

export const GOutro: React.FC = () => {
  const { f, d, W } = useBeats();
  const cut = W("comment", 0.55) - 2;
  const chk = W("Check", 0.75) - cut;
  const { i, lf, len } = useShot([cut], d, f);
  const Screen: React.FC = () => (
    <g>
      <rect x={140} y={120} width={800} height={1700} rx={80} fill={INK} />
      <rect x={170} y={150} width={740} height={1640} rx={60} fill="#151626" />
      <rect x={200} y={190} width={680} height={620} rx={30} fill={G.resto} />
      {/* Mini-Vorschau: schwebender Hoodie */}
      <g transform="translate(540 760) scale(0.7)">
        <Vanish
          y0={0}
          y1={-560}
          k={1}
          keep={[
            [-130, -260, 260, 230],
            [-230, -250, 120, 200],
            [110, -250, 120, 200],
          ]}
          f={f}
        >
          <Person
            x={0}
            y={0}
            s={1}
            seated
            shirt={P.ted}
            hair="spiky"
            hairColor="#2A1B12"
            skin={P.skin2}
            armL={50}
            armR={50}
          />
        </Vanish>
      </g>
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <circle
            cx={250}
            cy={900 + k * 140}
            r={38}
            fill={[P.purple, P.teal, P.pink][k]}
          />
          <rect
            x={310}
            y={880 + k * 140}
            width={[480, 380, 520][k]}
            height={22}
            rx={11}
            fill="#3A3F5A"
          />
          <rect
            x={310}
            y={920 + k * 140}
            width={[300, 420, 260][k]}
            height={18}
            rx={9}
            fill="#2E3350"
          />
        </g>
      ))}
      <rect
        x={200}
        y={1380}
        width={680}
        height={110}
        rx={55}
        fill="#2E3350"
        stroke="#FFFFFF"
        strokeWidth={4}
      />
      <rect
        x={250}
        y={1405}
        width={6}
        height={60}
        fill="#FFFFFF"
        opacity={Math.sin(f * 0.5) > 0 ? 1 : 0}
      />
    </g>
  );
  if (i === 0) {
    return (
      <Shot
        cam={camPath(lf, [
          [0, { x: 540, y: 960, zoom: 0.9 }],
          [len, { x: 540, y: 960, zoom: 0.97 }],
        ])}
      >
        <Layer depth={0}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
        </Layer>
        <Layer>
          <Screen />
          <PovHand x={960} y={1300} w={0} />
        </Layer>
      </Shot>
    );
  }
  // POV: der Daumen des Zuschauers verblasst von der Spitze her (Loop zum Hook)
  const k = ease(lf, chk, len - 2);
  return (
    <Shot
      cam={camPath(lf, [
        [0, { x: 600, y: 1250, zoom: 1.15 }],
        [len, { x: 620, y: 1300, zoom: 1.3 }],
      ])}
    >
      <Layer depth={0}>
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0B0B12" />
      </Layer>
      <Layer>
        <Screen />
        <Vanish y0={1950} y1={1220} k={k * 0.75} fromTop f={f}>
          <PovHand x={760} y={1300 + Math.sin(lf * 0.6) * 6} w={0} />
        </Vanish>
        <Sparkle x={760} y={lerp(1260, 1700, k * 0.75)} t={lf % 30} s={0.9} />
      </Layer>
    </Shot>
  );
};

/* ================================================================== */
/* Registrierung                                                      */
/* ================================================================== */

export const GHOSTING_SCENES: Record<string, React.FC> = {
  hook: GHook,
  rules: GRules,
  landlord: GLandlord,
  jake: GJake,
  mom: GMom,
  ex: GEx,
  panic: GPanic,
  twist: GTwist,
  gone: GGone,
  after: GAfter,
  outro: GOutro,
};

const CUT: TransitionSpec = { kind: "cut" };
const TRANSITIONS: Record<string, TransitionSpec> = {};
for (const id of Object.keys(GHOSTING_SCENES).slice(1)) TRANSITIONS[id] = CUT;

type PlanScene = { readonly id: string; readonly captions?: readonly string[] };
const PHRASES: string[] = [];
for (const s of (plan as { scenes: readonly PlanScene[] }).scenes)
  PHRASES.push(...(s.captions ?? []));

/** Eine Text-Ebene (Audit 20.11.): Untertitel-Phrasen + Cover-Titel; Chat-Blasen/Auge sind Bildzeichen. */
export const GHOSTING_CONFIG: EpisodeConfig = {
  look: "2d",
  transitions: TRANSITIONS,
  phrases: PHRASES,
  noHud: true,
  bed: { src: "bed.wav", volume: 1 },
  endCardTypeFrom: 2,
};

/** Einstellungen je Szene + Set-Folge:
 * Gehweg ×2 | Café, Restaurant ×2 | Haus, Flur, Wohnung gelb | Wohnung blau, Handy-Inbox, Wohnung blau, Comic orange |
 * Handy lila, Wohnung blau, Küche | Wohnung mint, Ex-Zimmer ×2 | Comic rot, Couch Nacht, Handy-Inbox |
 * Handy Chat, Sepia, Handy Chat, Handy Chat ECU | Couch Nacht ×2 | Büro ×2 | POV ×2
 * → nie > 2 gleiche am Stück, 17 Bildwelten. */
export const GHOSTING_SHOT_COUNT: Record<string, number> = {
  hook: 2,
  rules: 3,
  landlord: 3,
  jake: 4,
  mom: 3,
  ex: 3,
  panic: 3,
  twist: 4,
  gone: 2,
  after: 2,
  outro: 2,
};
