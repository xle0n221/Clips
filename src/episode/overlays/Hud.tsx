import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { HudSpec } from "../types";
import { CAPTION_FONT, useCaptionFontReady } from "./fonts";
import {
  ACCENT,
  clamp01,
  DANGER,
  hardShadow,
  INK,
  OUTLINE,
  strokeText,
  Track,
  trackAt,
  tween,
} from "./style";

/** Oberkante der Einsatz-Anzeige: darüber liegt die Plattform-Oberfläche (Status, Suche, Tabs). */
export const HUD_TOP = 150;
/** Unterkante der Einsatz-Anzeige im Standardfall (Titel + Zähler + 1 Balken). */
export const HUD_BOTTOM = 400;

/**
 * Tatsächliche Unterkante (inkl. harter Schatten) für eine HUD-Angabe: 2 Balken sind höher als
 * der Standardfall. Sticker rutschen darunter (Episode.tsx).
 */
export const hudBottom = (spec: HudSpec) => {
  const title = spec.title ? 100 : 0; // Pill ~78 px + Abstand 22
  const nb = Math.min(2, spec.bars?.length ?? 0);
  const counters = spec.counters?.length ? 145 : 0;
  const bars = nb ? nb * 92 + (nb - 1) * 14 + 16 : 0;
  return Math.max(HUD_BOTTOM, HUD_TOP + title + Math.max(counters, bars) + 5);
};

const INNER_W = 1080 - 2 * 44; // Breite des HUD-Bereichs
const GAP = 26;

export type HudChange = { frame: number; id: string; value: number };

const COUNT_FRAMES = 26; // Zähler zählt hoch
const BAR_FRAMES = 12; // Balken springt auf den neuen Wert
const GHOST_DELAY = 8; // heller „Schaden“-Rest bleibt kurz stehen …
const GHOST_FRAMES = 16; // … und schrumpft dann nach
const LOW = 0.3; // darunter wird der Balken rot

const fmt = (v: number, from: number, to: number) => {
  const decimals = Number.isInteger(from) && Number.isInteger(to) ? 0 : 1;
  const s = v.toFixed(decimals);
  // Tausendertrennzeichen erst ab 10.000 (Jahreszahlen wie 1453 bleiben ohne Komma)
  return Math.abs(v) >= 10000 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : s;
};

const Counter: React.FC<{
  readonly label: string;
  readonly t: Track;
  readonly prefix?: string;
  readonly suffix?: string;
  /** feste Kastenbreite, Schriftgröße passt zum breitesten Wert des ganzen Videos */
  readonly width: number;
  readonly fontSize: number;
}> = ({ label, t, prefix = "", suffix = "", width, fontSize }) => {
  const v = tween(t, COUNT_FRAMES);
  const counting = t.since < COUNT_FRAMES + 4;
  // Ruck beim Start, kleines Nachfedern am Ende
  const bump = interpolate(
    t.since,
    [0, 3, COUNT_FRAMES, COUNT_FRAMES + 4, COUNT_FRAMES + 10],
    // max. 1,12: stärker ragte die Zahl über den Rand des Zähler-Kastens (Prüfbild Frame 40)
    [1, 1.08, 1.05, 1.12, 1],
    clamp01,
  );
  return (
    <div
      style={{
        background: "#1E1B33",
        border: `${OUTLINE}px solid ${INK}`,
        borderRadius: 30,
        boxShadow: hardShadow(9),
        padding: "10px 26px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 26,
          color: "#B9B4E0",
          letterSpacing: 3,
          lineHeight: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize,
          lineHeight: 70 / fontSize * 1.05,
          color: counting ? ACCENT : "#FFFFFF",
          transform: `scale(${bump})`,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: -1,
          whiteSpace: "nowrap",
          ...strokeText(10),
        }}
      >
        {prefix}
        {fmt(v, t.from, t.to)}
        {suffix}
      </div>
    </div>
  );
};

const Bar: React.FC<{
  readonly label: string;
  readonly t: Track;
  readonly color: string;
  readonly frame: number;
}> = ({ label, t, color, frame }) => {
  const v = Math.max(0, Math.min(1, tween(t, BAR_FRAMES)));
  const drop = t.to < t.from;
  // Rest des alten Werts: bleibt kurz hell stehen und schrumpft nach (Kampfspiel-Lebensbalken)
  const ghost = drop
    ? interpolate(
        t.since,
        [GHOST_DELAY, GHOST_DELAY + GHOST_FRAMES],
        [t.from, t.to],
        clamp01,
      )
    : v;
  // Ruck: gedämpftes Schütteln bei Verlust, kurzes Aufpumpen bei Gewinn
  const k = Math.exp(-t.since / 5);
  const shake =
    drop && t.since < 24 ? Math.sin(t.since * 2.4) * 16 * k : 0;
  const grow = !drop && t.since < 14 ? 1 + 0.04 * Math.sin((t.since / 14) * Math.PI) : 1;
  const low = v < LOW;
  const pulse = low ? 0.5 + 0.5 * Math.sin(frame * 0.35) : 0;
  const fill = low
    ? interpolateColors(pulse, [0, 1], [DANGER, "#FF7A6E"])
    : color;
  const flash = interpolate(t.since, [0, 6], [0.85, 0], clamp01);
  const pct = Math.round(t.to * 100) - Math.round(t.from * 100);
  const showDelta = pct !== 0 && t.since < 36;
  const deltaPop = interpolate(t.since, [0, 4, 9], [0.4, 1.25, 1], clamp01);
  return (
    <div
      style={{
        flex: 1,
        transform: `translateX(${shake}px) scale(${grow})`,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 34,
          color: "#FFFFFF",
          letterSpacing: 2,
          lineHeight: 1,
          marginBottom: 6,
          padding: "0 8px",
          ...strokeText(8),
        }}
      >
        <span>{label}</span>
        {showDelta ? (
          // Änderung ersetzt kurz die Prozentzahl: "−35%" rot bzw. "+15%" grün
          <span
            style={{
              color: pct < 0 ? "#FF6B5E" : "#7CFF6B",
              fontSize: 44,
              transform: `scale(${deltaPop})`,
              transformOrigin: "100% 100%",
              display: "inline-block",
            }}
          >
            {pct > 0 ? "+" : "−"}
            {Math.abs(pct)}%
          </span>
        ) : (
          <span style={{ color: low ? "#FF8A80" : "#FFFFFF" }}>
            {Math.round(v * 100)}%
          </span>
        )}
      </div>
      <div
        style={{
          position: "relative",
          height: 52,
          background: "#2A2540",
          border: `${OUTLINE}px solid ${INK}`,
          borderRadius: 24,
          boxShadow: hardShadow(8),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${ghost * 100}%`,
            background: drop ? "#FFF3C4" : fill,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${v * 100}%`,
            background: fill,
            borderRight: v > 0.01 && v < 0.99 ? `${OUTLINE - 2}px solid ${INK}` : undefined,
          }}
        >
          {/* Glanzlicht oben: Cel-Look statt Verlauf */}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              top: 5,
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.45)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#FFFFFF",
            opacity: flash,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Einsatz-Anzeige oben im Bild (Referenz-Analyse 2, Punkt 1): Serien-Titel, Zähler, Balken.
 * Werte ändern sich an `hud`-Cues; alles wird aus dem globalen Frame berechnet.
 */
export const Hud: React.FC<{
  readonly spec: HudSpec;
  readonly changes: HudChange[];
}> = ({ spec, changes }) => {
  const frame = useCurrentFrame();
  const fontReady = useCaptionFontReady();
  if (!fontReady) return null;
  const sorted = [...changes].sort((a, b) => a.frame - b.frame);
  const of = (id: string) => sorted.filter((c) => c.id === id);
  const counters = spec.counters ?? [];
  const bars = spec.bars ?? [];
  // Kurzes Aufploppen in den ersten Frames (bleibt dabei unterhalb der Plattform-Oberfläche)
  const enter = interpolate(frame, [0, 5, 9], [0.94, 1.03, 1], clamp01);
  // Zählerbreite: 1 Zähler 340 px, 2 Zähler je 250 px (mit Balken); ohne Balken teilen sie sich die Zeile
  const cw = bars.length
    ? counters.length > 1
      ? 250
      : 340
    : (INNER_W - GAP * (counters.length - 1)) / Math.max(1, counters.length);
  const counterFont = (c: (typeof counters)[number]) => {
    const values = [c.value, ...of(c.id).map((x) => x.value)];
    const ints = values.every((x) => Number.isInteger(x));
    const widest = values
      .map((x) => `${c.prefix ?? ""}${fmt(x, ints ? 0 : 0.5, 0)}${c.suffix ?? ""}`)
      .sort((a, b) => b.length - a.length)[0];
    // Reserve für das Nachfedern (scale 1,12) und die Kontur
    return Math.min(
      70,
      fitText({ text: widest, withinWidth: (cw - 66) / 1.12, fontFamily: CAPTION_FONT, fontWeight: 900, letterSpacing: "-1px" }).fontSize,
    );
  };
  const titleFont = spec.title
    ? Math.min(
        38,
        fitText({ text: spec.title, withinWidth: INNER_W - 90, fontFamily: CAPTION_FONT, fontWeight: 900, letterSpacing: "2px" }).fontSize,
      )
    : 38;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: HUD_TOP,
          left: 44,
          right: 44,
          transform: `scale(${enter})`,
          transformOrigin: "50% 0%",
          fontFamily: CAPTION_FONT,
          fontWeight: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        {spec.title ? (
          <div
            style={{
              background: ACCENT,
              color: INK,
              border: `${OUTLINE}px solid ${INK}`,
              borderRadius: 999,
              boxShadow: hardShadow(8),
              padding: "8px 34px 10px",
              fontSize: titleFont,
              letterSpacing: 2,
              whiteSpace: "nowrap",
              transform: "rotate(-1.5deg)",
            }}
          >
            {spec.title}
          </div>
        ) : null}
        {counters.length || bars.length ? (
          <div
            style={{
              alignSelf: "stretch",
              display: "flex",
              alignItems: "flex-end",
              gap: GAP,
            }}
          >
            {counters.map((c) => (
              <Counter
                key={c.id}
                label={c.label}
                prefix={c.prefix}
                suffix={c.suffix}
                t={trackAt(c.value, of(c.id), frame)}
                width={cw}
                fontSize={counterFont(c)}
              />
            ))}
            {bars.length ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  paddingBottom: 8,
                }}
              >
                {bars.map((b) => (
                  <Bar
                    key={b.id}
                    label={b.label}
                    color={b.color ?? "#7CDB5A"}
                    frame={frame}
                    t={trackAt(b.value, of(b.id), frame)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
