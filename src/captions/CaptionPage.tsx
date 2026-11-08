import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { TikTokPage } from "@remotion/captions";
import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TheBoldFont } from "./load-font";

const DESIRED_FONT_SIZE = 110;

export const CaptionPage: React.FC<{
  readonly page: TikTokPage;
  readonly highlightColor: string;
}> = ({ page, highlightColor }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  // `frame` ist relativ zur <Sequence>, die bei page.startMs beginnt.
  const timeInMs = (frame / fps) * 1000;

  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 5,
  });

  const fontSize = Math.min(
    DESIRED_FONT_SIZE,
    fitText({
      fontFamily: TheBoldFont,
      text: page.text,
      withinWidth: width * 0.9,
      textTransform: "uppercase",
    }).fontSize,
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        top: undefined,
        bottom: 320,
        height: 160,
      }}
    >
      <div
        style={{
          fontSize,
          fontFamily: TheBoldFont,
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "18px black",
          paintOrder: "stroke",
          transform: makeTransform([
            scale(interpolate(enter, [0, 1], [0.8, 1])),
            translateY(interpolate(enter, [0, 1], [50, 0])),
          ]),
        }}
      >
        {page.tokens.map((t, i) => {
          const start = t.fromMs - page.startMs;
          const end = t.toMs - page.startMs;
          const active = start <= timeInMs && end > timeInMs;
          return (
            <span
              key={`${t.fromMs}-${i}`}
              style={{
                whiteSpace: "pre",
                color: active ? highlightColor : "white",
              }}
            >
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
