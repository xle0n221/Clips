import { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import React, { useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Captions } from "./overlays/Captions";
import { CutFlash, Grade, Sticker } from "./overlays/Effects";
import { loadCaptionFont } from "./overlays/fonts";
import { hudBottom } from "./overlays/Hud";
import { EpisodeOverlays, emphMap } from "./overlays/Overlays";
import { CameraRigContext } from "./kit/camera";
import { gradeOf, GradeTint } from "./kit/motion";
import {
  canvasFxOf,
  rigOf,
  transitionAt,
  TransitionOverlay,
  whipBlurOf,
  WhipBlurDefs,
} from "./kit/transitions";
import { scenesFor } from "./scenes";
import { EpisodeData, SceneContext, Timeline } from "./types";

export const FPS = 30;

export const episodeSchema = z.object({ episode: z.string() });
type Props = z.infer<typeof episodeSchema> & Partial<EpisodeData>;

/** Lädt Zeitplan + Captions, die `scripts/make_episode.py` erzeugt hat. */
export const calculateEpisodeMetadata: CalculateMetadataFunction<
  Props
> = async ({ props }) => {
  const base = `episodes/${props.episode}`;
  const [timeline, captions] = await Promise.all([
    fetch(staticFile(`${base}/timeline.json`)).then(
      (r) => r.json() as Promise<Timeline>,
    ),
    fetch(staticFile(`${base}/captions.json`)).then(
      (r) => r.json() as Promise<Caption[]>,
    ),
  ]);
  return {
    fps: FPS,
    durationInFrames: Math.ceil((timeline.durationMs / 1000) * FPS),
    props: { ...props, timeline, captions },
  };
};

const SceneRunner: React.FC<{
  readonly episode: string;
  readonly id: string;
  readonly start: number;
  readonly duration: number;
  readonly beats: Record<string, number>;
}> = ({ episode, id, start, duration, beats }) => {
  const frame = useCurrentFrame();
  const Scene = scenesFor(episode)[id];
  if (!Scene) throw new Error(`Keine Szene für "${id}" in src/episode/scenes`);
  return (
    <SceneContext.Provider
      value={{
        frame,
        duration,
        beat: (name) => (name in beats ? beats[name] - start : 1e9),
      }}
    >
      <Scene />
    </SceneContext.Provider>
  );
};

export const Episode: React.FC<Props> = ({ episode, timeline, captions }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  useState(() => loadCaptionFont());
  if (!timeline || !captions)
    throw new Error("Episode-Daten fehlen – erst make_episode.py ausführen");

  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const starts = timeline.scenes.map((s, i) => (i === 0 ? 0 : toF(s.startMs)));
  const ends = starts.map((_, i) =>
    i + 1 < starts.length ? starts[i + 1] : durationInFrames,
  );
  const beatsOf = (id: string) =>
    timeline.cues
      .filter((c) => c.scene === id && c.beat)
      .reduce<Record<string, number>>((acc, c) => {
        acc[c.beat!] = toF(c.atMs);
        return acc;
      }, {});

  // Schnitt-Effekt: kurzer Zoom-Stoß + Unschärfe am Anfang jeder Szene
  const current = starts.filter((s) => s <= frame).pop() ?? 0;
  const local = frame - current;
  const punch = interpolate(local, [0, 9], [1.12, 1], {
    extrapolateRight: "clamp",
  });
  const blur =
    current === 0
      ? 0
      : interpolate(local, [0, 5], [10, 0], { extrapolateRight: "clamp" });

  // Neue Übergänge / Color Script (optional, timeline.scenes[i].transition / .act).
  // Ohne diese Felder bleiben Stil-Strings und Effekte exakt wie bisher.
  const cuts = starts.slice(1);
  const specs = timeline.scenes
    .slice(1)
    .map((s) => s.transition ?? timeline.transition);
  const isFlash = (i: number) => !specs[i] || specs[i]!.kind === "flash";
  const curIdx = starts.filter((s) => s <= frame).length - 1;
  const oldCutFx = curIdx <= 0 || isFlash(curIdx - 1);
  const tState = transitionAt(frame, cuts, specs);
  const fx = canvasFxOf(tState);
  const act = timeline.scenes[curIdx]?.act;
  const anyWhip = specs.some((s) => s?.kind === "whip");
  const canvasStyle: React.CSSProperties =
    !fx && !act && oldCutFx
      ? {
          transform: `scale(${punch})`,
          filter: `blur(${blur}px) saturate(1.15) contrast(1.05)`,
        }
      : {
          transform:
            [oldCutFx ? `scale(${punch})` : "", fx?.transform ?? ""]
              .join(" ")
              .trim() || "none",
          filter: [
            oldCutFx ? `blur(${blur}px)` : "",
            fx?.filter ?? "",
            "saturate(1.15) contrast(1.05)",
            gradeOf(act).filter,
          ]
            .join(" ")
            .replace(/\s+/g, " ")
            .trim(),
        };

  const stickers = timeline.cues.filter((c) => c.sticker);
  const emph = emphMap(timeline);
  const base = `episodes/${episode}`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1035" }}>
      {anyWhip ? <WhipBlurDefs blur={whipBlurOf(tState)} /> : null}
      <AbsoluteFill style={canvasStyle}>
        <ThreeCanvas width={width} height={height} shadows>
          <CameraRigContext.Provider value={rigOf(tState)}>
          {timeline.scenes.map((s, i) => (
            <Sequence
              key={s.id}
              from={starts[i]}
              durationInFrames={ends[i] - starts[i]}
              layout="none"
            >
              <SceneRunner
                episode={episode}
                id={s.id}
                start={starts[i]}
                duration={ends[i] - starts[i]}
                beats={beatsOf(s.id)}
              />
            </Sequence>
          ))}
          </CameraRigContext.Provider>
        </ThreeCanvas>
      </AbsoluteFill>
      {act ? <GradeTint grade={act} /> : null}
      <TransitionOverlay state={tState} width={width} height={height} />

      {starts.slice(1).map((s, i) =>
        isFlash(i) ? (
          <Sequence key={s} from={s} durationInFrames={6} layout="none">
            <CutFlash />
          </Sequence>
        ) : null,
      )}

      <EpisodeOverlays timeline={timeline} ends={ends} fps={fps} layer="below" />

      {stickers.map((c, i) => {
        const from = toF(c.atMs);
        const next = stickers[i + 1] ? toF(stickers[i + 1].atMs) : Infinity;
        // Sticker enden spätestens mit ihrer Szene (kein Überlappen in den nächsten Ort)
        const sceneIdx = timeline.scenes.findIndex((s) => s.id === c.scene);
        const sceneEnd = ends[sceneIdx] ?? durationInFrames;
        const dur = Math.max(10, Math.min(next - from, sceneEnd - from, 54));
        return (
          <Sequence
            key={`st-${i}`}
            from={from}
            durationInFrames={dur}
            layout="none"
          >
            <Sticker
              text={c.sticker!}
              color={c.color ?? "#FFD23F"}
              duration={dur}
              tilt={i % 2 ? 3 : -3}
              top={timeline.hud ? hudBottom(timeline.hud) + 30 : undefined}
            />
          </Sequence>
        );
      })}

      <EpisodeOverlays timeline={timeline} ends={ends} fps={fps} layer="above" />
      <Captions captions={captions} emph={emph.size ? emph : undefined} />
      <Grade />

      {/* Ton: Stimme, Musikbett, Effekte */}
      <Audio src={staticFile(`${base}/voice.wav`)} />
      <Audio src={staticFile(`${base}/music.wav`)} volume={0.13} />
      {starts.slice(1).map((s) => (
        <Sequence
          key={`wh-${s}`}
          from={Math.max(0, s - 4)}
          durationInFrames={20}
          layout="none"
        >
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />
        </Sequence>
      ))}
      {timeline.cues
        .filter((c) => c.sfx)
        .map((c, i) => (
          <Sequence
            key={`sfx-${i}`}
            from={toF(c.atMs)}
            durationInFrames={40}
            layout="none"
          >
            <Audio
              src={staticFile(`sfx/${c.sfx}.wav`)}
              volume={c.sfx === "boom" ? 0.45 : 0.35}
            />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
