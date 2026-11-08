import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CAPTION_FONT } from "./fonts";
import { seeded } from "../kit/toon";

/** Großer Zahlen-/Text-Sticker, ploppt herein (Federanimation) und fällt wieder weg. */
export const Sticker: React.FC<{
  readonly text: string;
  readonly color: string;
  readonly duration: number;
  readonly tilt: number;
}> = ({ text, color, duration, tilt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
  const exit = interpolate(frame, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wobble = Math.sin(frame * 0.18) * 1.5;
  const dark =
    color === "#FFFFFF" || color.startsWith("#FF") || color.startsWith("#FFE");
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div
        style={{
          transform: `scale(${enter * exit}) rotate(${tilt + wobble}deg)`,
          background: color,
          border: "10px solid #111",
          borderRadius: 34,
          padding: "18px 40px",
          boxShadow: "0 14px 0 #111",
          fontFamily: CAPTION_FONT,
          fontWeight: 900,
          fontSize: 96,
          color: dark ? "#111" : "#FFF",
          whiteSpace: "nowrap",
          letterSpacing: -2,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** Blitz + Zoom-Stoß beim Szenenwechsel (lokaler Frame ab Schnitt). */
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 5], [0.55, 0], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ background: "white", opacity: o }} />;
};

/** Rote Wut-/Hitze-Adern, die vom Zentrum aus über das Bild wachsen. */
export const Veins: React.FC<{
  readonly progress: number;
  readonly color?: string;
}> = ({ progress, color = "#FF1744" }) => {
  const paths = React.useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 12 }, (_, k) => {
      let x = 540;
      let y = 900;
      let a = (k / 12) * Math.PI * 2 + r() * 0.4;
      let d = `M ${x} ${y}`;
      for (let i = 0; i < 9; i++) {
        a += (r() - 0.5) * 1.1;
        x += Math.cos(a) * 75;
        y += Math.sin(a) * 75;
        d += ` L ${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      return d;
    });
  }, []);
  if (progress <= 0) return null;
  return (
    <AbsoluteFill>
      <svg
        width={1080}
        height={1920}
        style={{ filter: `drop-shadow(0 0 18px ${color})` }}
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={color}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - Math.min(1, progress)}
            opacity={0.9}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Look: Vignette + leichtes Filmkorn (Korn wechselt alle 2 Frames, deterministisch). */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={Math.floor(frame / 2) % 50}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
