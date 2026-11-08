import { Caption } from "@remotion/captions";
import React, { useState } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Timeline } from "../types";
import { Captions } from "./Captions";
import { CutFlash, Grade, Sticker } from "./Effects";
import { loadCaptionFont } from "./fonts";
import { HUD_BOTTOM } from "./Hud";
import { EpisodeOverlays, emphMap } from "./Overlays";

/**
 * Vorführung aller Overlays (HUD, Auswahl, Pill, Akzentwort) ohne Tonspur, 1080×1920, 30 fps.
 * Daten im selben Format wie timeline.json/captions.json aus make_episode.py.
 */
export const OVERLAY_DEMO_FRAMES = 200;
const FPS = 30;
const ms = (f: number) => Math.round((f / FPS) * 1000);

const TIMELINE: Timeline = {
  id: "overlay-demo",
  title: "Overlay demo",
  durationMs: ms(OVERLAY_DEMO_FRAMES),
  hud: {
    title: "THE LAST EMPEROR · PART 1",
    counters: [{ id: "year", label: "YEAR", value: 395, suffix: " AD" }],
    bars: [{ id: "empire", label: "EMPIRE", value: 0.8, color: "#FFB627" }],
  },
  scenes: [
    { id: "split", startMs: 0, endMs: ms(80) },
    { id: "pick", startMs: ms(80), endMs: ms(140) },
    { id: "ask", startMs: ms(140), endMs: ms(OVERLAY_DEMO_FRAMES) },
  ],
  cues: [
    { scene: "split", atMs: ms(8), label: { text: "You", x: 0.5, y: 0.52 } },
    {
      scene: "split",
      atMs: ms(14),
      label: { text: "Goths", color: "#FF5A5A", x: 0.84, y: 0.6 },
    },
    { scene: "split", atMs: ms(24), hud: { id: "year", value: 410 } },
    { scene: "split", atMs: ms(24), hud: { id: "empire", value: 0.45 } },
    { scene: "split", atMs: ms(24), sticker: "ROME SACKED", color: "#FF5A5A" },
    { scene: "split", atMs: ms(52), hud: { id: "empire", value: 0.2 } },
    {
      scene: "pick",
      atMs: ms(82),
      choice: {
        title: "WHAT DO YOU DO?",
        options: ["Pay the Goths", "Raise an army"],
        pick: 1,
      },
    },
    { scene: "pick", atMs: ms(118), hud: { id: "empire", value: 0.35 } },
    {
      scene: "ask",
      atMs: ms(142),
      choice: {
        title: "AND NOW?",
        options: ["Flee to the east", "Defend the walls"],
      },
    },
    { scene: "ask", atMs: ms(142), hud: { id: "year", value: 476 } },
  ],
};

// Untertitel wie aus make_episode.py; "*Goths*" und "*you*" sind im Drehbuch markiert
const WORDS: [string, number, boolean?][] = [
  ["In", 4],
  ["410,", 10],
  ["the", 20],
  ["Goths", 24, true],
  ["march", 32],
  ["into", 38],
  ["Rome.", 44, true],
  ["Nobody", 54],
  ["stops", 62],
  ["them.", 68],
  ["So", 84],
  ["what", 90],
  ["do", 96],
  ["you", 100, true],
  ["do?", 106],
  ["Fight!", 116],
  ["And", 144],
  ["now?", 152],
  ["Comment", 166],
  ["below.", 176],
];
const CAPTIONS: Caption[] = WORDS.map(([w, f], i) => ({
  text: i === 0 ? w : ` ${w}`,
  startMs: ms(f),
  endMs: ms(WORDS[i + 1]?.[1] ?? f + 12),
  timestampMs: ms(f + 3),
  confidence: null,
}));
for (const [, f, e] of WORDS)
  if (e) TIMELINE.cues.push({ scene: "split", atMs: ms(f), emph: true });

/** Platzhalter-Hintergrund im Cel-Stil (flache Flächen, schwarze Kontur). */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.08) * 6;
  const col = (x: number) => (
    <g key={x}>
      <rect x={x} y={930} width={46} height={330} fill="#F3E3C3" stroke="#111" strokeWidth={8} />
      <rect x={x - 14} y={900} width={74} height={34} fill="#F3E3C3" stroke="#111" strokeWidth={8} />
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3B2A6B" />
            <stop offset="0.55" stopColor="#D9645A" />
            <stop offset="1" stopColor="#F6A65A" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#sky)" />
        <circle cx={760} cy={760} r={130} fill="#FFD67A" stroke="#111" strokeWidth={8} />
        <path d="M0 1260 Q 300 1180 560 1250 T 1080 1230 L1080 1920 L0 1920 Z" fill="#7A4B3A" stroke="#111" strokeWidth={8} />
        <path d="M0 1400 Q 400 1330 1080 1420 L1080 1920 L0 1920 Z" fill="#5A3328" stroke="#111" strokeWidth={8} />
        <path d="M110 900 L 400 770 L 690 900 Z" fill="#F3E3C3" stroke="#111" strokeWidth={8} />
        {[140, 260, 380, 500, 620].map(col)}
        <rect x={100} y={1250} width={620} height={40} fill="#E2CFA8" stroke="#111" strokeWidth={8} />
        {/* Figur „You“: weißer Rundkopf, Strichkörper */}
        <g transform={`translate(540 ${1170 + sway * 0.3})`}>
          <path d="M0 40 L0 190 M0 90 L-60 150 M0 90 L60 140 M0 190 L-40 290 M0 190 L40 290" stroke="#111" strokeWidth={16} strokeLinecap="round" fill="none" />
          <path d="M-46 80 L46 80 L56 200 L-56 200 Z" fill="#B3262E" stroke="#111" strokeWidth={8} />
          <circle cx={0} cy={-30} r={78} fill="#FFFFFF" stroke="#111" strokeWidth={9} />
          <circle cx={-24} cy={-36} r={9} fill="#111" />
          <circle cx={24} cy={-36} r={9} fill="#111" />
          <path d="M-20 4 Q0 18 20 4" stroke="#111" strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
        {/* Goten-Silhouette rechts */}
        <g transform={`translate(905 ${1290 + sway})`}>
          <path d="M0 40 L0 170 M0 170 L-30 250 M0 170 L30 250 M0 80 L-50 130 M0 80 L50 40" stroke="#111" strokeWidth={14} strokeLinecap="round" fill="none" />
          <circle cx={0} cy={-10} r={58} fill="#FFFFFF" stroke="#111" strokeWidth={8} />
          <path d="M-58 -20 Q0 -100 58 -20 Z" fill="#6D6D6D" stroke="#111" strokeWidth={7} />
          <path d="M-20 0 L-6 8 M20 0 L6 8" stroke="#111" strokeWidth={7} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const OverlayDemo: React.FC = () => {
  useState(() => loadCaptionFont());
  const starts = TIMELINE.scenes.map((s) => Math.round((s.startMs / 1000) * FPS));
  const ends = starts.map((_, i) => starts[i + 1] ?? OVERLAY_DEMO_FRAMES);
  const sticker = TIMELINE.cues.find((c) => c.sticker)!;
  const stFrom = Math.round((sticker.atMs / 1000) * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1035" }}>
      <Backdrop />
      {starts.slice(1).map((s) => (
        <Sequence key={s} from={s} durationInFrames={6} layout="none">
          <CutFlash />
        </Sequence>
      ))}
      <EpisodeOverlays timeline={TIMELINE} ends={ends} fps={FPS} layer="below" />
      <Sequence from={stFrom} durationInFrames={30} layout="none">
        <Sticker text={sticker.sticker!} color={sticker.color!} duration={30} tilt={-3} top={HUD_BOTTOM + 30} />
      </Sequence>
      <EpisodeOverlays timeline={TIMELINE} ends={ends} fps={FPS} layer="above" />
      <Captions captions={CAPTIONS} emph={emphMap(TIMELINE)} />
      <Grade />
    </AbsoluteFill>
  );
};
