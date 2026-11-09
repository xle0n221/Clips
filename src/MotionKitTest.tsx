import type { Caption } from "@remotion/captions";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRigContext, Shot, V3 } from "./episode/kit/camera";
import { FloorPlate, StudioBackdrop, StudioLights } from "./episode/kit/common";
import {
  Act,
  aimAt,
  anticipate,
  Echo,
  eyePopAt,
  followThrough,
  Foreground,
  gradeOf,
  GradeTint,
  hop,
  RimLight,
  SceneFog,
  SpotlightStage,
  talkFromCaptions,
  trackShot,
} from "./episode/kit/motion";
import { BlobShadow } from "./episode/kit/props";
import { Toonie } from "./episode/kit/Toonie";
import { Ink, Toon } from "./episode/kit/toon";
import {
  canvasFxOf,
  rigOf,
  SpeedStreaks,
  transitionAt,
  TransitionOverlay,
  TransitionSpec,
  whipBlurOf,
  WhipBlurDefs,
} from "./episode/kit/transitions";
import { Grade } from "./episode/overlays/Effects";

/**
 * Prüf-Komposition der Bewegungs-Bausteine (kit/motion.tsx, kit/transitions.tsx, Erweiterungen
 * von Shot/Toonie). 8 Einstellungen, jede Technik einmal; zwischen den Einstellungen je ein anderer
 * Übergang (whip, wipe, zoom, match, tint, alter Blitz, harter Schnitt). Texte sind Testwerte.
 */
const LEN = [45, 50, 45, 60, 30, 40, 50, 40];
const STARTS = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
export const MOTION_TEST_FRAMES = LEN.reduce((a, b) => a + b, 0);
const SPECS: (TransitionSpec | undefined)[] = [
  { kind: "whip", dir: 1 },
  { kind: "wipe", shape: "star", color: "#FFC928" },
  { kind: "zoom", color: "#0B0B14" },
  { kind: "match" },
  { kind: "tint", color: "#FF4D6D" },
  undefined, // alter weißer Blitz zum Vergleich
  { kind: "cut" },
];
const LABELS = [
  "1 Blinzeln versetzt + Mund (Mitte/rechts) · links alt",
  "2 Orbit + Rim-Light ab Mitte + Dunst",
  "3 Dolly-Zoom (Kopf bleibt gleich groß)",
  "4 Sprung: links alt, rechts Squash · Follow-through · Kamera-Antizipation",
  "5 Reaktions-Großaufnahme + Augen-Pop (Match Cut)",
  "6 Spotlight-Bühne",
  "7 Tracking + Parallax-Vordergrund + Echo + Speed-Lines",
  "8 Color Script: neutral → glory → decline → fall",
];
const ACTS: Act[] = ["neutral", "glory", "decline", "fall"];

// Test-Wörter für die Mund-Animation (Zeiten in ms ab Videostart)
const WORDS: Caption[] = ["Hello", "everybody", "this", "is", "a", "talking", "test"].map(
  (text, i) => ({
    text,
    startMs: 150 + i * 200,
    endMs: 150 + i * 200 + 170,
    timestampMs: null,
    confidence: 1,
  }),
);

const Studio: React.FC<{ readonly fog?: boolean }> = ({ fog }) => (
  <>
    <StudioBackdrop top="#1B2440" bottom="#3B2F55" center="#5A4A7A" />
    <StudioLights />
    <FloorPlate />
    {fog ? <SceneFog color="#2A2A48" near={10} far={42} /> : null}
  </>
);

/** Reihe von Säulen nach hinten – macht Dunst, Dolly-Zoom und Parallaxe sichtbar. */
const Posts: React.FC = () => (
  <>
    {Array.from({ length: 8 }, (_, i) =>
      [-1, 1].map((s) => (
        <mesh key={`${i}-${s}`} position={[s * 4.2, 2.5, 2 - i * 5]}>
          <cylinderGeometry args={[0.45, 0.5, 5, 14]} />
          <Toon color={i % 2 ? "#C9A27A" : "#E0C49A"} />
          <Ink f={0.05}>
            <cylinderGeometry args={[0.45, 0.5, 5, 14]} />
          </Ink>
        </mesh>
      )),
    )}
  </>
);

const Scene: React.FC<{ readonly i: number; readonly f: number; readonly g: number }> = ({ i, f, g }) => {
  const head: V3 = [0, 3.05, 0];
  if (i === 0) {
    const talk = talkFromCaptions(WORDS, (g / 30) * 1000);
    const a = aimAt([0, 2.6, 0], 9, { yf: 0.5 });
    return (
      <>
        <Studio />
        <Shot frame={f} duration={LEN[0]} from={a.pos} look={a.look} fov={40} />
        <Toonie frame={g} position={[-2.6, 0, 0]} scale={0.8} />
        <Toonie frame={g} position={[0, 0, 0]} scale={0.8} suit="#2E7DFF" blinkSeed={3} talk={talk} />
        <Toonie frame={g} position={[2.6, 0, 0]} scale={0.8} suit="#22B573" blinkSeed={11} />
      </>
    );
  }
  if (i === 1) {
    return (
      <>
        <Studio fog />
        <Posts />
        {f >= 25 ? <RimLight intensity={2.2} /> : null}
        <Shot
          frame={f}
          duration={LEN[1]}
          from={[0, 0, 0]}
          look={[0, 2.6, 0]}
          fov={40}
          orbit={{ center: [0, 0, 0], radius: 12, fromDeg: -40, toDeg: 40, height: 3.6, heightTo: 3 }}
        />
        <Toonie frame={g} suit="#2E7DFF" blinkSeed={3} cap="#FF4D6D" />
        <BlobShadow position={[0, 0.01, 0]} />
      </>
    );
  }
  if (i === 2) {
    return (
      <>
        <Studio />
        <Posts />
        <Shot
          frame={f}
          duration={LEN[2]}
          from={[0, 3.4, 9]}
          look={head}
          fov={28}
          fovTo={72}
          dollyZoom
          ease="inOut"
          shake={0}
        />
        <Toonie frame={g} suit="#2E7DFF" blinkSeed={3} eyes={f > 20 ? "wide" : "dot"} mouth={f > 20 ? "o" : "smile"} />
      </>
    );
  }
  if (i === 3) {
    // rechts: Figur läuft seitlich und stoppt → Antenne schwingt nach; springt mit Squash
    const xOf = (k: number) => 1.2 + Math.min(1, Math.max(0, k / 22)) * 1.8 * (2 - Math.min(1, Math.max(0, k / 22)));
    const drag = followThrough(xOf, f, { gain: 1.6 });
    const h = hop(f, 30, 1.5, 14);
    const hOld = hop(f, 30, 1.5, 14);
    const arm = anticipate(f, 30, 0.25, -0.2, 2.7);
    const a = aimAt([0.8, 2.6, 0], 11, { yf: 0.52 });
    const b = aimAt([xOf(60), 3.05 * 0.75, 0], 4.2, { yf: 0.45 });
    return (
      <>
        <Studio />
        <Shot
          frame={f}
          duration={LEN[3]}
          from={a.pos}
          to={b.pos}
          look={a.look}
          lookTo={b.look}
          fov={40}
          span={[42, 58]}
          anticipate={0.12}
          anticipateFrames={5}
          ease="out"
        />
        <Toonie frame={g} position={[-2.2, hOld.y, 0]} scale={0.75} suit="#9E9E9E" />
        <Toonie
          frame={g}
          position={[xOf(f), h.y, 0]}
          scale={0.75}
          squash={h.squash}
          drag={drag}
          antenna
          tie="#FFC928"
          suit="#2E7DFF"
          blinkSeed={3}
          arms={[arm, arm]}
        />
      </>
    );
  }
  if (i === 4) {
    // Match Cut: Kopf an derselben Bildstelle wie am Ende von Einstellung 4, sehr nah
    const pop = eyePopAt(f, 5);
    const c = aimAt([0, 3.05, 0], 3.4, { yf: 0.45 });
    return (
      <>
        <Studio />
        <Shot frame={f} duration={LEN[4]} from={c.pos} look={c.look} fov={40} shake={0.02} />
        <Toonie frame={g} suit="#2E7DFF" eyes={f >= 5 ? "wide" : "dot"} mouth={f >= 5 ? "o" : "smile"} eyePop={pop} brow={f >= 5 ? -0.3 : 0} antenna />
      </>
    );
  }
  if (i === 5) {
    const on = Math.min(1, Math.max(0, (f - 4) / 8));
    const a = aimAt([0, 2.2, 0], 10, { yf: 0.5, dir: [0, 0.3, 1] });
    return (
      <>
        <SpotlightStage on={on} />
        <Shot frame={f} duration={LEN[5]} from={a.pos} to={[a.pos[0], a.pos[1] - 0.6, a.pos[2] - 2]} look={a.look} fov={40} />
        <Toonie frame={g} suit="#2E7DFF" blinkSeed={3} arms={[0.4, 2.6]} mouth="grin" />
      </>
    );
  }
  if (i === 6) {
    const t = trackShot([0, 2.4, 0], 10, 7);
    const runX = (k: number) => -3 + (k / LEN[6]) * 7;
    return (
      <>
        <Studio />
        <Posts />
        <Shot frame={f} duration={LEN[6]} {...t.shot} />
        <Foreground
          {...t.start}
          items={[
            { xf: 0.08, yf: 0.3, depth: 2.6, size: 0.55, shape: "leaf", rot: 0.4 },
            { xf: 0.62, yf: 0.9, depth: 3, size: 0.7, shape: "rock" },
            { xf: 1.15, yf: 0.25, depth: 2.4, size: 0.5, shape: "leaf", rot: -0.5 },
            { xf: 1.55, yf: 0.85, depth: 2.8, size: 0.7, shape: "rock" },
          ]}
        />
        <Echo
          frame={f}
          step={2}
          count={3}
          render={(k) => (
            <Toonie frame={g - f + k} position={[runX(k), 0, 0]} scale={0.8} suit="#2E7DFF" walk={2.2} antenna rotation={[0, 0.9, 0]} />
          )}
        />
      </>
    );
  }
  const a = aimAt([0, 2.4, 0], 10, { yf: 0.5 });
  return (
    <>
      <Studio />
      <Posts />
      <Shot frame={f} duration={LEN[7]} from={a.pos} look={a.look} fov={40} />
      <Toonie frame={g} suit="#2E7DFF" blinkSeed={3} />
    </>
  );
};

export const MotionKitTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const i = STARTS.filter((s) => s <= frame).length - 1;
  const f = frame - STARTS[i];
  const cuts = STARTS.slice(1);
  const st = transitionAt(frame, cuts, SPECS);
  const fx = canvasFxOf(st);
  const act = i === 7 ? ACTS[Math.min(3, Math.floor(f / 10))] : undefined;
  // alter Blitz (Einstellung 6) wie in Episode.tsx
  const oldFlash = i === 5 && f < 9;
  const punch = oldFlash ? 1.12 - (0.12 * f) / 9 : 1;
  const blur = oldFlash ? Math.max(0, 10 - 2 * f) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1035" }}>
      <WhipBlurDefs blur={whipBlurOf(st)} />
      <AbsoluteFill
        style={{
          transform: `scale(${punch}) ${fx?.transform ?? ""}`,
          filter: `blur(${blur}px) ${fx?.filter ?? ""} saturate(1.15) contrast(1.05) ${gradeOf(act).filter}`,
        }}
      >
        <ThreeCanvas width={width} height={height} shadows>
          <CameraRigContext.Provider value={rigOf(st)}>
            <Scene i={i} f={f} g={frame} />
          </CameraRigContext.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      {act ? <GradeTint grade={act} /> : null}
      {i === 6 ? <SpeedStreaks strength={0.5} frame={frame} dir={-1} band={[0.25, 0.7]} count={10} /> : null}
      <TransitionOverlay state={st} />
      {oldFlash && f < 5 ? <AbsoluteFill style={{ background: "white", opacity: 0.55 - 0.11 * f }} /> : null}
      <Grade />
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          right: 40,
          color: "white",
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 34,
          textShadow: "0 2px 6px black",
        }}
      >
        {LABELS[i]}
        {act ? ` · ${act}` : ""}
      </div>
    </AbsoluteFill>
  );
};
