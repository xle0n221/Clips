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
import { Cover, coverClear, coverFrames } from "./overlays/Cover";
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
import { Kit2DContext, TIMELINE_HUD_BOTTOM, TimelineHUD } from "./kit2d";
import { configFor, EpisodeConfig, scenesFor } from "./scenes";
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

/** Episoden-Zusatz (scenes/index.ts `EPISODE_CONFIG`) anwenden – ohne Eintrag unverändert. */
const withConfig = (t: Timeline, cfg: EpisodeConfig): Timeline => ({
  ...t,
  // Übergang je Szenen-ID (Schlüssel per Variable: Lint hält „transition:“ sonst für CSS)
  scenes: t.scenes.map((s) => {
    const key = "transition" as const;
    return { ...s, [key]: cfg.transitions?.[s.id] ?? s[key] };
  }),
  // Text-Zähler zeichnet kit2d/TimelineHUD; das Zahlen-HUD bleibt aus
  hud: cfg.hud2d ? undefined : t.hud,
  // Pill-Ende je Szene auf einen Beat legen (optional, ohne Eintrag unverändert)
  cues: cfg.labelUntil
    ? t.cues.map((c) => (c.label && !c.untilBeat && cfg.labelUntil?.[c.scene] ? { ...c, untilBeat: cfg.labelUntil[c.scene] } : c))
    : t.cues,
});

/** `labelUntilWord`: Pill endet am ersten Vorkommen eines Worts in der Szene (Zeit aus captions.json). */
const withLabelWords = (t: Timeline, caps: Caption[], cfg: EpisodeConfig): Timeline => {
  const map = cfg.labelUntilWord;
  if (!map) return t;
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
  const extra: Timeline["cues"] = [];
  let cues = t.cues;
  for (const scene of Object.keys(map)) {
    const word = map[scene];
    const s = t.scenes.find((x) => x.id === scene);
    if (!s) continue;
    const hit = caps.find((c) => c.startMs >= s.startMs - 60 && c.startMs < s.endMs && norm(c.text) === norm(word));
    if (!hit) continue;
    const name = `untilWord-${norm(word)}`;
    extra.push({ scene, atMs: hit.startMs, beat: name });
    cues = cues.map((c) => (c.scene === scene && c.label && !c.untilBeat && c.atMs < hit.startMs ? { ...c, untilBeat: name } : c));
  }
  return { ...t, cues: [...cues, ...extra] };
};

export const Episode: React.FC<Props> = ({ episode, timeline: rawTimeline, captions }) => {
  const cfg = configFor(episode);
  const timeline = rawTimeline && cfg ? withLabelWords(withConfig(rawTimeline, cfg), captions ?? [], cfg) : rawTimeline;
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
        {cfg?.look === "2d" ? (
          // 2D-Stil (kit2d): Szenen als SVG; Übergänge wirken über denselben Kamera-Zusatz
          <CameraRigContext.Provider value={rigOf(tState)}>
            {timeline.scenes.map((s, i) => (
              <Sequence key={s.id} from={starts[i]} durationInFrames={ends[i] - starts[i]}>
                <Kit2DContext.Provider value={{ captions, fps, start: starts[i] }}>
                  <SceneRunner
                    episode={episode}
                    id={s.id}
                    start={starts[i]}
                    duration={ends[i] - starts[i]}
                    beats={beatsOf(s.id)}
                  />
                </Kit2DContext.Provider>
              </Sequence>
            ))}
          </CameraRigContext.Provider>
        ) : (
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
        )}
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
      {cfg?.hud2d && rawTimeline && frame >= coverClear(timeline.cover) ? (
        <TimelineHUD
          timeline={rawTimeline}
          freezeBeat={cfg.hud2d.freezeBeat}
          counterId={cfg.hud2d.counterId}
          barId={cfg.hud2d.barId}
          plate={cfg.hud2d.plate}
          hideBeat={cfg.hud2d.hideBeat}
          maxWidth={cfg.hud2d.maxWidth}
        />
      ) : null}

      {frame < coverClear(timeline.cover) ? null : stickers.map((c, i) => {
        // Dauer eines Stickers j (und ob er wegen `stickerStack` trotz Folge-Sticker stehen bleibt)
        const durOf = (j: number) => {
          const cj = stickers[j];
          const fromJ = toF(cj.atMs);
          const nextJ = stickers[j + 1] ? toF(stickers[j + 1].atMs) : Infinity;
          // Sticker enden spätestens mit ihrer Szene (kein Überlappen in den nächsten Ort)
          const sceneIdx = timeline.scenes.findIndex((s) => s.id === cj.scene);
          const sceneEnd = ends[sceneIdx] ?? durationInFrames;
          // optional: Sticker endet am Beat (scenes/index.ts `stickerUntil`, z. B. vor einem Ortswechsel)
          const untilName = cfg?.stickerUntil?.[cj.sticker!];
          const untilCue = untilName ? timeline.cues.find((x) => x.scene === cj.scene && x.beat === untilName) : undefined;
          const until = untilCue ? toF(untilCue.atMs) - fromJ : Infinity;
          // optional (`stickerStack`): folgt der nächste Sticker zu schnell (< 45 Bilder), bleibt dieser stehen
          const keep = Boolean(cfg?.stickerStack) && nextJ - fromJ < 45;
          return { from: fromJ, keep, dur: Math.max(10, Math.min(keep ? Infinity : nextJ - fromJ, sceneEnd - fromJ, cfg?.stickerMax?.[cj.sticker!] ?? 54, until)) };
        };
        const { from, dur } = durOf(i);
        const prev = i > 0 ? durOf(i - 1) : undefined;
        const shift = prev && prev.keep && prev.from + prev.dur > from ? 150 : 0;
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
              top={
                (timeline.hud
                  ? hudBottom(timeline.hud) + 30
                  : cfg?.hud2d
                    ? TIMELINE_HUD_BOTTOM + 30
                    : 300) + shift
              }
            />
          </Sequence>
        );
      })}

      <EpisodeOverlays timeline={timeline} ends={ends} fps={fps} layer="above" />
      {frame >= coverFrames(timeline.cover) ? (
        <Captions captions={captions} emph={emph.size ? emph : undefined} mode={timeline.captionMode} />
      ) : null}
      <Grade />
      {timeline.cover ? <Cover cover={timeline.cover} art={cfg?.coverArt} /> : null}

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
