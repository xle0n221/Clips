import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CAPTION_FONT } from "./fonts";

// Referenzvideos: 1–3 kurze Wörter pro Einblendung, Wechsel ca. alle 0,15–0,55 s.
const COMBINE_MS = 320;

type Part = { text: string; color?: string };

const Word: React.FC<{ readonly text: string; readonly parts?: Part[] }> = ({
  text,
  parts,
}) => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [0, 2, 4], [0.86, 1.06, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 400,
      }}
    >
      <div
        style={{
          fontFamily: CAPTION_FONT,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.05,
          color: "#FFFFFF",
          textAlign: "center",
          maxWidth: 960,
          WebkitTextStroke: "16px #111",
          paintOrder: "stroke",
          textShadow: "0 8px 0 rgba(0,0,0,0.75)",
          transform: `scale(${pop})`,
          letterSpacing: -1,
        }}
      >
        {parts
          ? parts.map((p, i) =>
              p.color ? (
                <span key={i} style={{ color: p.color }}>
                  {p.text}
                </span>
              ) : (
                p.text
              ),
            )
          : text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Variante „ein Wort zur Zeit“ (referenz-analyse-4.md Technik 5, verbessert): GROSSBUCHSTABEN,
 * weiß mit dicker INK-Kontur (18 : 1 auf jedem Grund), Akzentfarbe NUR auf Schlüsselwörtern
 * (`emph`) – lesbarer als Dauer-Rot. Kleiner Pop (3 Bilder), Schlüsselwörter etwas größer.
 */
const OneWord: React.FC<{ readonly text: string; readonly color?: string; readonly bottom: number }> = ({
  text,
  color,
  bottom,
}) => {
  const frame = useCurrentFrame();
  const key = color !== undefined;
  const pop = interpolate(frame, [0, 2, 4], key ? [0.7, 1.14, 1] : [0.82, 1.06, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom }}>
      <div
        style={{
          fontFamily: CAPTION_FONT,
          fontWeight: 900,
          fontSize: key ? 96 : 80,
          lineHeight: 1,
          color: color ?? "#FFFFFF",
          textAlign: "center",
          maxWidth: 980,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          WebkitTextStroke: "18px #111",
          paintOrder: "stroke",
          textShadow: "0 7px 0 rgba(0,0,0,0.8)",
          transform: `scale(${pop}) rotate(${key ? -2 : 0}deg)`,
          letterSpacing: 0,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Variante „word-by-word-yellow“ (KnowToon-Prompt STEP 5, Drehbuch-Feld `captionStyle`): ein Wort zur Zeit,
 * fett (900), serifenlos, GELB mit dicker schwarzer Kontur, unteres Drittel. Akzentwörter (`emph`) gleiche Farbe,
 * nur etwas größer + kräftigerer Pop – so bleibt die Farbe eindeutig „Untertitel“.
 */
export const YELLOW_CAPTION = "#FFD400";
const YellowWord: React.FC<{ readonly text: string; readonly key2: boolean; readonly bottom: number }> = ({
  text,
  key2,
  bottom,
}) => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [0, 2, 4], key2 ? [0.72, 1.12, 1] : [0.86, 1.05, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom }}>
      <div
        style={{
          fontFamily: CAPTION_FONT,
          fontWeight: 900,
          fontSize: key2 ? 104 : 90,
          lineHeight: 1,
          color: YELLOW_CAPTION,
          textAlign: "center",
          maxWidth: 1000,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
          WebkitTextStroke: "20px #000",
          paintOrder: "stroke",
          textShadow: "0 8px 0 rgba(0,0,0,0.85), 0 0 26px rgba(0,0,0,0.55)",
          transform: `scale(${pop})`,
          letterSpacing: 1,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * emph: Startzeit (ms) eines Untertitel-Worts -> Akzentfarbe. Kommt aus `emph`-Cues bzw. aus
 * "*Wort*" im Drehbuch (make_episode.py). Seiten ohne Akzentwort werden unverändert gezeichnet.
 */
export const Captions: React.FC<{
  readonly captions: Caption[];
  readonly emph?: Map<number, string>;
  /** "word" = ein Wort zur Zeit (Großbuchstaben, Akzent nur auf emph-Wörtern); Standard = bisherige Seiten */
  readonly mode?: "pages" | "word";
  /** Abstand vom unteren Rand (px), nur für "word" (Standard 420) */
  readonly bottom?: number;
  /** Drehbuch-Feld `captionStyle`; "word-by-word-yellow" = gelbe Wort-für-Wort-Untertitel (überschreibt `mode`) */
  readonly variant?: string;
}> = ({ captions, emph, mode, bottom = 420, variant }) => {
  const { fps } = useVideoConfig();
  if (variant === "word-by-word-yellow")
    return <WordCaptions captions={captions} emph={emph} fps={fps} bottom={bottom} yellow />;
  if (mode === "word") return <WordCaptions captions={captions} emph={emph} fps={fps} bottom={bottom} />;
  return <PageCaptions captions={captions} emph={emph} fps={fps} />;
};

/** Ein Wort je Einblendung: steht bis zum nächsten Wort (höchstens Wortende + 300 ms, mind. 4 Bilder). */
const WordCaptions: React.FC<{
  readonly captions: Caption[];
  readonly emph?: Map<number, string>;
  readonly fps: number;
  readonly bottom: number;
  readonly yellow?: boolean;
}> = ({ captions, emph, fps, bottom, yellow }) => {
  const words = captions.filter((c) => c.text.trim() !== "");
  return (
    <AbsoluteFill>
      {words.map((w, i) => {
        const next = words[i + 1];
        const from = Math.round((w.startMs / 1000) * fps);
        const endMs = next ? Math.min(next.startMs, w.endMs + 300) : w.endMs + 400;
        const dur = Math.max(4, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            {yellow ? (
              <YellowWord text={w.text.trim().replace(/^["“]+/, "").replace(/["”.,:;…]+$/, "")} key2={Boolean(emph?.has(w.startMs))} bottom={bottom} />
            ) : (
              <OneWord text={w.text.trim()} color={emph?.get(w.startMs)} bottom={bottom} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Bisherige Untertitel (Seiten mit 1–3 Wörtern) – unverändert. */
const PageCaptions: React.FC<{
  readonly captions: Caption[];
  readonly emph?: Map<number, string>;
  readonly fps: number;
}> = ({ captions, emph, fps }) => {
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: COMBINE_MS,
      }),
    [captions],
  );
  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next
          ? Math.min(next.startMs, page.startMs + page.durationMs + 400)
          : page.startMs + page.durationMs + 400;
        const dur = Math.max(1, Math.round((endMs / 1000) * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Word
              text={page.text.trim()}
              parts={
                emph && page.tokens.some((t) => emph.has(t.fromMs))
                  ? page.tokens.map((t, k) => ({
                      text: k === 0 ? t.text.replace(/^\s+/, "") : t.text,
                      color: emph.get(t.fromMs),
                    }))
                  : undefined
              }
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
