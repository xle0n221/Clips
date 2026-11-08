import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { zColor } from "@remotion/zod-types";
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Captions } from "../captions/Captions";
import { TheBoldFont } from "../captions/load-font";
import { ShapesScene } from "./ShapesScene";

export const FPS = 30;
const DEFAULT_DURATION_SECONDS = 10;

// Props sind in Remotion Studio im rechten Panel live editierbar.
export const animated3DSchema = z.object({
  title: z.string(),
  accentColor: zColor(),
  // Pfad relativ zu /public, z. B. "audio/voiceover.mp3". Leer = kein Audio.
  audioFile: z.string(),
  // Pfad relativ zu /public, z. B. "captions/voiceover.json". Leer = keine Captions.
  captionsFile: z.string(),
});

type Props = z.infer<typeof animated3DSchema>;

// Videolänge = Länge der Audiodatei (falls vorhanden), sonst 10 s.
export const calculateAnimated3DMetadata: CalculateMetadataFunction<
  Props
> = async ({ props }) => {
  const seconds = props.audioFile
    ? await getAudioDurationInSeconds(staticFile(props.audioFile))
    : DEFAULT_DURATION_SECONDS;
  return { fps: FPS, durationInFrames: Math.max(1, Math.ceil(seconds * FPS)) };
};

const Title: React.FC<{ readonly text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 5, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 220 }}>
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 110,
          color: "white",
          textAlign: "center",
          textTransform: "uppercase",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [-60, 0])}px)`,
          textShadow: "0 8px 30px rgba(0,0,0,0.6)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Animated3DVideo: React.FC<Props> = ({
  title,
  accentColor,
  audioFile,
  captionsFile,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b1a" }}>
      <ThreeCanvas width={width} height={height}>
        <ShapesScene accentColor={accentColor} />
      </ThreeCanvas>
      {title ? <Title text={title} /> : null}
      {captionsFile ? (
        <Captions src={staticFile(captionsFile)} highlightColor={accentColor} />
      ) : null}
      {audioFile ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
