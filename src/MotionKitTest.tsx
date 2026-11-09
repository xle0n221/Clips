import type { Caption } from "@remotion/captions";
import { ThreeCanvas } from "@remotion/three";
import React, { useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRigContext, Shot, V3 } from "./episode/kit/camera";
import {
  FloorPlate,
  FormSheet,
  Hallway,
  HALLWAY_WARM,
  KIT,
  RoadSign,
  StudioBackdrop,
  StudioLights,
} from "./episode/kit/common";
import { Prop } from "./episode/kit/env";
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
  Place,
  PlaceGlow,
  RimLight,
  SceneFog,
  SpotlightStage,
  talkFromCaptions,
  trackShot,
} from "./episode/kit/motion";
import { BlobShadow } from "./episode/kit/props";
import { FaceOn, Toonie } from "./episode/kit/Toonie";
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
import { Captions } from "./episode/overlays/Captions";
import { loadCaptionFont } from "./episode/overlays/fonts";

/**
 * Prüf-Komposition der Bewegungs-Bausteine (kit/motion.tsx, kit/transitions.tsx, Erweiterungen
 * von Shot/Toonie). 12 Einstellungen (9–12 = Vorbild ricksclip, design-system.md §11), jede Technik einmal; zwischen den Einstellungen je ein anderer
 * Übergang (whip, wipe, zoom, match, tint, alter Blitz, harter Schnitt). Texte sind Testwerte.
 */
const LEN = [45, 50, 45, 60, 30, 40, 50, 40, 45, 55, 70, 70];
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
  { kind: "cut" }, // in den neuen Teil (referenz-analyse-4.md)
  { kind: "cut" },
  // Portal-Fahrt: Kamera fliegt durch die Endtür des Flurs …
  { kind: "portal", portal: "door", color: HALLWAY_WARM.lamp, rim: "#7A4A2E", at: [0.5, 0.5] },
  // … und in den Bildschirm im Labor
  { kind: "portal", portal: "screen", color: "#9FE3FF", rim: "#2B3440", at: [0.5, 0.5] },
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
  "9 Ausdrücke: squint+clench+stress+sweat → wide → beam · Ort-Licht warm",
  "10 Flur mit Fluchtpunkt + Wegweiser → Portal-Fahrt in die Tür",
  "11 Gegenstand mit Gesicht + Formular · Ort-Licht lab → Portal in den Bildschirm",
  "12 FaceOn gewölbt (beam) + Toonie smirk · Ort-Licht night",
];
const PLACES: (Place | undefined)[] = [...Array<undefined>(8).fill(undefined), "warm", "warm", "lab", "night"];
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

// Test-Wörter „ein Wort zur Zeit“ ab Einstellung 9 (12,0 s); Akzent nur auf Schlüsselwörtern
const T0 = 12000;
const WORDS2: Caption[] = (
  "your head hurts so you follow the signs down the hall through the door sign the form and jump into the screen"
)
  .split(" ")
  .map((text, i) => ({ text, startMs: T0 + 150 + i * 340, endMs: T0 + 150 + i * 340 + 300, timestampMs: null, confidence: 1 }));
const EMPH = new Map(
  WORDS2.filter((w) => ["hurts", "signs", "door", "form", "screen"].indexOf(w.text) >= 0).map((w) => [
    w.startMs,
    w.text === "hurts" ? "#FF4D6D" : "#FFC928",
  ]),
);

/** Tablette (Kapsel zweifarbig) – Träger für FaceOn. Mitte bei y = 1. */
const Pill3D: React.FC<{ readonly top?: string }> = ({ top = "#2EC4B6" }) => (
  <group position={[0, 1, 0]}>
    <Prop color="#FAFAFA" position={[0, -0.25, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.5, 24]} />
    </Prop>
    <Prop color="#FAFAFA" position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[0.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </Prop>
    <Prop color={top} position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.5, 24]} />
    </Prop>
    <Prop color={top} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </Prop>
  </group>
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
    const a = aimAt([0, 2.6, 0], 11, { yf: 0.5 });
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
        <Shot
          frame={f}
          duration={LEN[1]}
          from={[0, 0, 0]}
          look={[0, 2.6, 0]}
          fov={40}
          orbit={{ center: [0, 0, 0], radius: 12, fromDeg: -40, toDeg: 40, height: 3.6, heightTo: 3 }}
        />
        {f >= 25 ? (
          <RimLight color="#BFE4FF">
            <Toonie frame={g} suit="#2E7DFF" blinkSeed={3} cap="#FF4D6D" />
          </RimLight>
        ) : (
          <Toonie frame={g} suit="#2E7DFF" blinkSeed={3} cap="#FF4D6D" />
        )}
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
    const t = trackShot([0, 2.4, 0], 10, 3);
    const runX = (k: number) => -1.8 + (k / LEN[6]) * 3.6;
    return (
      <>
        <Studio />
        <Posts />
        <Shot frame={f} duration={LEN[6]} {...t.shot} />
        <Foreground
          {...t.start}
          items={[
            { xf: 0.04, yf: 0.22, depth: 5, size: 0.42, shape: "leaf", rot: 0.5 },
            { xf: 0.75, yf: 0.93, depth: 5.5, size: 0.45, shape: "rock" },
            { xf: 1.35, yf: 0.18, depth: 4.5, size: 0.4, shape: "leaf", rot: -0.6 },
            { xf: 1.95, yf: 0.9, depth: 5, size: 0.45, shape: "rock" },
            { xf: 2.45, yf: 0.25, depth: 5.5, size: 0.42, shape: "leaf", rot: 0.3 },
          ]}
        />
        <Echo
          frame={f}
          step={4}
          count={3}
          render={(k) => (
            <Toonie frame={g - f + k} position={[runX(k), 0, 0]} scale={0.8} suit="#2E7DFF" walk={2.2} antenna rotation={[0, 0.9, 0]} />
          )}
        />
      </>
    );
  }
  if (i === 8) {
    // Ausdrucks-Set: drei Stufen je ~15 Bilder, Großaufnahme im Flur
    const stage = f < 16 ? 0 : f < 30 ? 1 : 2;
    const a = aimAt([0, 2.45, -2], 3.6, { yf: 0.42 });
    return (
      <>
        <Hallway glow={1} labels={["ROOM 1", "ROOM 2"]} endLabel="HEAD" />
        <Shot frame={f} duration={LEN[8]} from={a.pos} to={[a.pos[0], a.pos[1], a.pos[2] - 0.5]} look={a.look} fov={40} />
        <Toonie
          frame={g}
          position={[0, 0, -2]}
          scale={0.8}
          suit="#7E57C2"
          blinkSeed={5}
          eyes={stage === 0 ? "squint" : stage === 1 ? "wide" : "happy"}
          mouth={stage === 0 ? "clench" : stage === 1 ? "o" : "beam"}
          brow={stage === 0 ? 0.25 : stage === 1 ? -0.25 : 0}
          stress={stage === 0 ? 1 : 0}
          sweatDrop={stage < 2 ? 1 : 0}
          eyePop={stage === 1 ? eyePopAt(f, 16) : 1}
        />
      </>
    );
  }
  if (i === 9) {
    // Flur-Totale: Fluchtpunkt = Endtür; Blickziel liegt IN der Tür → Portal-Fahrt (Rig-push) fliegt hinein
    const doorC: V3 = [0, 1.32, -34];
    const open = Math.min(1, Math.max(0, (f - 26) / 14));
    return (
      <>
        <Hallway glow={1} labels={["ROOM 1", "ROOM 2", "ROOM 3", "ROOM 4", "", "", "", ""]} endLabel="HEAD" openDoor={-1} open={open} />
        <Shot frame={f} duration={LEN[9]} from={[0.9, 2.1, 3]} to={[0.3, 1.7, -1]} look={doorC} fov={40} ease="in" />
        <RoadSign position={[1.15, 0, -7]} rotation={[0, -0.35, 0]} scale={0.55} lines={["HEADACHE", "20 MIN"]} arrow="up" appear={Math.min(1, f / 10)} />
        <Toonie frame={g} position={[-0.9, 0, -5]} scale={0.6} suit="#7E57C2" walk={1.5} rotation={[0, Math.PI, 0]} blinkSeed={5} />
      </>
    );
  }
  if (i === 10) {
    // Labor: Tablette mit Gesicht spricht, schwitzt dann; Formular wird unterschrieben; Bildschirm = nächstes Portal
    const talk = talkFromCaptions(WORDS2, (g / 30) * 1000);
    const worried = f > 34;
    const screenC: V3 = [1.2, 2.7, -1.5];
    const a = aimAt([0.1, 1.15, 0], 6.2, { yf: 0.5, dir: [0.25, 0.15, 1] });
    return (
      <>
        <StudioBackdrop top="#0E2236" bottom="#1E4A5E" center="#3F8FA8" />
        <StudioLights color="#E8F7FF" />
        <FloorPlate color="#D6E4EA" rim={KIT.board} />
        <Shot frame={f} duration={LEN[10]} from={a.pos} to={[a.pos[0] * 0.6 + 0.4, a.pos[1], a.pos[2] - 1]} look={a.look} lookTo={screenC} fov={40} span={[30, LEN[10]]} ease="inOut" />
        <group position={[0.6, 0, 0.6]}>
          <Pill3D />
          <FaceOn
            frame={g}
            position={[0, 1.02, 0.6]}
            scale={0.62}
            curve={1.0}
            talk={worried ? undefined : talk}
            eyes={worried ? "wide" : "dot"}
            mouth={worried ? "clench" : "smile"}
            sweatDrop={worried ? 1 : 0}
            gaze={worried ? [0.8, 0.3] : [0, 0]}
          />
        </group>
        <FormSheet
          position={[-0.55, 1.5, 0.45]}
          rotation={[0, 0.25, 0]}
          scale={0.62}
          title="CONSENT FORM"
          lines={["Swallow pill", "Find the pain", "Results may vary"]}
          checks={[true, true, false]}
          highlight={2}
          sign={Math.min(1, Math.max(0, (f - 12) / 16))}
          appear={Math.min(1, f / 8)}
        />
        {/* Bildschirm (Portal-Ziel): Rahmen + leuchtende Fläche */}
        <group position={screenC}>
          <Prop color={KIT.board} position={[0, 0, -0.08]}>
            <boxGeometry args={[1.5, 2.3, 0.14]} />
          </Prop>
          <mesh position={[0, 0, 0.0]}>
            <planeGeometry args={[1.25, 2.05]} />
            <meshBasicMaterial color="#9FE3FF" toneMapped={false} />
          </mesh>
          <Prop color={KIT.metalDark} position={[0, -1.6, -0.1]}>
            <cylinderGeometry args={[0.08, 0.08, 1.0, 10]} />
          </Prop>
        </group>
      </>
    );
  }
  if (i === 11) {
    // Nacht: gewölbtes Gesicht auf einer Kugel + Toonie mit schiefem Grinsen
    const a = aimAt([0, 2.2, 0], 7.5, { yf: 0.5 });
    return (
      <>
        <StudioBackdrop top="#0A0620" bottom="#2A1B55" center="#5B3FA0" />
        <StudioLights color="#E6DCFF" />
        <FloorPlate color="#3B2F6B" rim="#1A1238" />
        <Shot frame={f} duration={LEN[11]} from={a.pos} look={a.look} fov={40} orbit={{ center: [0, 0, 0], radius: a.pos[2], fromDeg: 12, toDeg: -12, height: a.pos[1] }} />
        <group position={[-1.1, 2.6, 0]}>
          <Prop color="#FFB547">
            <sphereGeometry args={[1.05, 32, 20]} />
          </Prop>
          <FaceOn frame={g} position={[0, 0, 1.05]} scale={0.9} curve={1.05 / 0.9} eyes="happy" mouth="beam" blush blinkSeed={9} />
        </group>
        <Toonie frame={g} position={[1.4, 0, 0.3]} scale={0.72} suit="#2E7DFF" mouth="smirk" brow={0.15} blinkSeed={3} arms={[0.3, 1.2]} />
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
  useState(() => loadCaptionFont());
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const i = STARTS.filter((s) => s <= frame).length - 1;
  const f = frame - STARTS[i];
  const cuts = STARTS.slice(1);
  const st = transitionAt(frame, cuts, SPECS);
  const fx = canvasFxOf(st);
  const place = PLACES[i];
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
      {place ? <PlaceGlow place={place} frame={frame} flicker={place === "warm" ? 0.6 : 0} /> : null}
      {i === 6 ? <SpeedStreaks strength={0.5} frame={frame} dir={-1} band={[0.25, 0.7]} count={10} /> : null}
      <TransitionOverlay state={st} />
      {oldFlash && f < 5 ? <AbsoluteFill style={{ background: "white", opacity: 0.55 - 0.11 * f }} /> : null}
      {i >= 8 ? <Captions captions={WORDS2} emph={EMPH} mode="word" /> : null}
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
