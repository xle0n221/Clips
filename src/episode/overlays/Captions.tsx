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

const Word: React.FC<{ readonly text: string }> = ({ text }) => {
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
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ readonly captions: Caption[] }> = ({
  captions,
}) => {
  const { fps } = useVideoConfig();
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
            <Word text={page.text.trim()} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
