import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Timeline } from "../types";
import { C, clamp01, FONT } from "./core";

/**
 * Zeitleisten-Zähler (2D): großer weißer Text-Zähler oben links („HOUR 0“ … „YEAR 10,000“)
 * + Balken darunter. Werte kommen aus der Timeline: Startwert `hud.counters[0].value`, Wechsel aus
 * Cues `{hud: {id, value: "<Text>"}}`, Balken aus Cues `{bar: {id, value 0..1}}` (Startwert
 * `hud.bars[0].value`). Unabhängig von `overlays/Hud.tsx` (das nur Zahlen kann).
 * Gleiche Einheit („YEAR 25“ → „YEAR 300“): Zahl rollt hoch; andere Einheit: Wort klappt um.
 * `freezeBeat`: ab diesem Beat wird der Balken kalt-silbern mit Schloss (Mond-Wendepunkt).
 */
export const TIMELINE_HUD_BOTTOM = 372;
const LEFT = 64;
const TOP = 150;

type Change = { frame: number; value: string };
type BarChange = { frame: number; value: number };

const parse = (v: string) => {
  const m = /^([A-Z]+) ([\d,]+)$/.exec(v.trim());
  return m ? { unit: m[1], n: Number(m[2].replace(/,/g, "")) } : null;
};
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export const hudValueAt = (initial: string, changes: readonly Change[], frame: number) => {
  let prev = initial;
  let cur = initial;
  let at = -1e9;
  for (const c of changes)
    if (c.frame <= frame) {
      prev = cur;
      cur = c.value;
      at = c.frame;
    }
  return { prev, cur, local: frame - at };
};

export const TimelineHUD: React.FC<{
  readonly timeline: Timeline;
  readonly counterId?: string;
  readonly barId?: string;
  readonly freezeBeat?: string;
}> = ({ timeline, counterId = "time", barId = "traces", freezeBeat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const toF = (ms: number) => Math.round((ms / 1000) * fps);
  const spec = timeline.hud;
  const counter = spec?.counters?.find((c) => c.id === counterId);
  const bar = spec?.bars?.find((b) => b.id === barId);
  const initial = String(counter?.value ?? "");
  const changes: Change[] = timeline.cues
    .filter((c) => c.hud && c.hud.id === counterId)
    .map((c) => ({ frame: toF(c.atMs), value: String(c.hud!.value) }));
  const barChanges: BarChange[] = timeline.cues
    .map((c) => ({ c, b: (c as { bar?: { id: string; value: number } }).bar }))
    .filter((x) => x.b && x.b.id === barId)
    .map((x) => ({ frame: toF(x.c.atMs), value: x.b!.value }));
  const freezeCue = freezeBeat ? timeline.cues.find((c) => c.beat === freezeBeat) : undefined;
  const frozen = freezeCue ? frame >= toF(freezeCue.atMs) : false;

  const { prev, cur, local } = hudValueAt(initial, changes, frame);
  const a = parse(prev);
  const b = parse(cur);
  const rollFrames = 16;
  const flipFrames = 7;
  let text = cur;
  let flipOld: string | null = null;
  let t = 1;
  if (a && b && a.unit === b.unit && b.n > a.n && local < rollFrames) {
    // Zahl rollt hoch (ease-out, logarithmisch bei großen Sprüngen)
    const u = 1 - Math.pow(1 - clamp01(local / rollFrames), 3);
    const n = a.n <= 0 ? b.n * u : Math.exp(Math.log(a.n) + (Math.log(b.n) - Math.log(a.n)) * u);
    text = `${b.unit} ${fmt(n)}`;
  } else if (prev !== cur && local < flipFrames) {
    flipOld = prev;
    t = clamp01(local / flipFrames);
  }
  const punch = local >= 0 && local < 10 ? 1 + 0.12 * Math.sin((local / 10) * Math.PI) : 1;

  // Balken
  let barVal = bar?.value ?? 1;
  let barPrev = barVal;
  let barLocal = 1e9;
  for (const c of barChanges)
    if (c.frame <= frame) {
      barPrev = barVal;
      barVal = c.value;
      barLocal = frame - c.frame;
    }
  const bt = clamp01(barLocal / 18);
  const shown = barPrev + (barVal - barPrev) * (1 - Math.pow(1 - bt, 3));
  const dropFlash = barLocal < 12 ? 1 - barLocal / 12 : 0;
  const barColor = frozen ? C.moon : (bar?.color ?? C.scarf);

  const textStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: 104,
    lineHeight: 1,
    color: C.white,
    letterSpacing: -1,
    whiteSpace: "nowrap",
    textShadow: `0 0 2px ${C.ink}, 4px 5px 0 ${C.ink}, -2px -2px 0 ${C.ink}, 2px -2px 0 ${C.ink}, -2px 2px 0 ${C.ink}`,
    fontVariantNumeric: "tabular-nums",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: LEFT, top: TOP }}>
        {spec?.title ? (
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 30,
              letterSpacing: 5,
              color: C.white,
              opacity: 0.72,
              textShadow: `2px 2px 0 ${C.ink}`,
              marginBottom: 6,
            }}
          >
            {spec.title}
          </div>
        ) : null}
        <div style={{ position: "relative", height: 108, overflow: "hidden", width: 900 }}>
          {flipOld !== null ? (
            <div style={{ ...textStyle, position: "absolute", transform: `translateY(${-110 * t}px)`, opacity: 1 - t }}>
              {flipOld}
            </div>
          ) : null}
          <div
            style={{
              ...textStyle,
              position: "absolute",
              transformOrigin: "left center",
              transform: `translateY(${flipOld !== null ? 110 * (1 - t) : 0}px) scale(${punch})`,
            }}
          >
            {text}
          </div>
        </div>
        {bar ? (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 26,
                letterSpacing: 4,
                color: frozen ? C.moon : C.white,
                textShadow: `2px 2px 0 ${C.ink}`,
                marginBottom: 8,
              }}
            >
              {bar.label}
              {frozen ? "  ·  FROZEN" : ""}
            </div>
            <div
              style={{
                width: 430,
                height: 18,
                borderRadius: 9,
                background: "rgba(10,15,31,0.75)",
                border: `3px solid ${C.ink}`,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${shown * 100}%`,
                  height: "100%",
                  background: barColor,
                  boxShadow: dropFlash > 0 ? `0 0 ${16 * dropFlash}px ${C.danger}` : undefined,
                }}
              />
              {dropFlash > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: `${shown * 100}%`,
                    top: 0,
                    width: `${(barPrev - shown) * 100}%`,
                    height: "100%",
                    background: C.danger,
                    opacity: dropFlash,
                  }}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
