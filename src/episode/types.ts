import type { Caption } from "@remotion/captions";
import { createContext, useContext } from "react";

export type Cue = {
  scene: string;
  atMs: number;
  sticker?: string;
  color?: string;
  sfx?: "boom" | "pop" | "whoosh" | "ding";
  beat?: string;
};

export type Timeline = {
  id: string;
  title: string;
  durationMs: number;
  scenes: { id: string; startMs: number; endMs: number }[];
  cues: Cue[];
};

export type EpisodeData = {
  timeline: Timeline;
  captions: Caption[];
};

/** Kontext einer Szene: lokale Frames der Beats (an Wörter gebundene Momente). */
export type SceneInfo = {
  frame: number; // lokaler Frame innerhalb der Szene
  duration: number; // Länge der Szene in Frames
  beat: (name: string) => number; // lokaler Frame des Beats (oder sehr groß, falls nicht vorhanden)
};

export const SceneContext = createContext<SceneInfo | null>(null);

export const useScene = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene() nur innerhalb einer Szene verwenden");
  return ctx;
};

/** Wählt die aktive Einstellung: cuts = lokale Frames, ab denen Einstellung i+1 gilt. */
export const shotIndex = (frame: number, cuts: number[]) => {
  let i = 0;
  for (const c of cuts) if (frame >= c) i++;
  return i;
};
