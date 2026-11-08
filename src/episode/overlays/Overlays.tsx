import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Timeline } from "../types";
import { Choice } from "./Choice";
import { Hud } from "./Hud";
import { Pill } from "./Pill";
import { ACCENT } from "./style";

/** Startzeit (ms) eines Untertitel-Worts -> Akzentfarbe, aus den `emph`-Cues. */
export const emphMap = (timeline: Timeline) => {
  const m = new Map<number, string>();
  for (const c of timeline.cues)
    if (c.emph) m.set(c.atMs, typeof c.emph === "string" ? c.emph : ACCENT);
  return m;
};

/**
 * Optionale Overlays aus Drehbuch-Feld `hud` und den Cues `hud`, `choice`, `label`.
 * Ohne diese Felder wird nichts gezeichnet (bestehende Episoden bleiben unverändert).
 * ends: Szenenenden in Frames (wie in Episode.tsx).
 */
export const EpisodeOverlays: React.FC<{
  readonly timeline: Timeline;
  readonly ends: number[];
  readonly fps: number;
  readonly layer: "below" | "above";
}> = ({ timeline, ends, fps, layer }) => {
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const sceneEnd = (scene: string) => {
    const i = timeline.scenes.findIndex((s) => s.id === scene);
    return ends[i] ?? ends[ends.length - 1] ?? 0;
  };
  // Pills liegen unter den Stickern (an der Figur), HUD und Auswahl darüber
  if (layer === "below") {
    const labels = timeline.cues.filter((c) => c.label);
    if (!labels.length) return null;
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {labels.map((c, i) => {
          const from = toF(c.atMs);
          const dur = Math.max(10, sceneEnd(c.scene) - from);
          return (
            <Sequence key={`lb-${i}`} from={from} durationInFrames={dur} layout="none">
              <Pill label={c.label!} duration={dur} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  }
  const hudChanges = timeline.cues
    .filter((c) => c.hud)
    .map((c) => ({ frame: toF(c.atMs), id: c.hud!.id, value: c.hud!.value }));
  const choices = timeline.cues.filter((c) => c.choice);
  if (!timeline.hud && !choices.length) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {timeline.hud ? <Hud spec={timeline.hud} changes={hudChanges} /> : null}
      {choices.map((c, i) => {
        const from = toF(c.atMs);
        const next = choices[i + 1];
        const nextF =
          next && next.scene === c.scene ? toF(next.atMs) : Infinity;
        const dur = Math.max(20, Math.min(sceneEnd(c.scene), nextF) - from);
        return (
          <Sequence key={`ch-${i}`} from={from} durationInFrames={dur} layout="none">
            <Choice spec={c.choice!} duration={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
