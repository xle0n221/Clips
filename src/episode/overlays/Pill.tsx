import { measureText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LabelSpec } from "../types";
import { CAPTION_FONT, useCaptionFontReady } from "./fonts";
import { ACCENT, clamp01, hardShadow, INK, isLight, OUTLINE } from "./style";

/**
 * Beschriftungs-Pill an Figuren/Dingen (Referenz-Analyse 2, Punkt 5). (x, y) = Spitze des Zipfels
 * in Bildanteilen; die Pill sitzt darüber. Ploppt ein, wippt leicht, endet mit der Szene.
 */
export const Pill: React.FC<{
  readonly label: LabelSpec;
  readonly duration: number;
}> = ({ label, duration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fontReady = useCaptionFontReady();
  if (!fontReady) return null;
  const color = label.color ?? ACCENT;
  const fg = isLight(color) ? INK : "#FFFFFF";
  const enter = spring({ frame, fps, config: { damping: 9, stiffness: 200 } });
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], clamp01);
  const bob = Math.sin(frame * 0.12) * 5;
  // Nicht über den Bildrand: Pill horizontal einklemmen, Zipfel bleibt am Ziel
  const x = Math.max(0.04, Math.min(0.96, label.x)) * width;
  const y = Math.max(0.05, Math.min(1, label.y)) * height;
  // Gemessene Breite (Schrift 46 px, Abstand 1 px) + Innenabstand 2×30 + Rahmen 2×7 + Neigung
  // measureText unterschätzt Montserrat 900 bei langen Texten → Zeichen-Schätzung als Untergrenze
  const rawW = Math.max(
    measureText({
      text: label.text.toUpperCase(),
      fontFamily: CAPTION_FONT,
      fontWeight: 900,
      fontSize: 46,
      letterSpacing: "1px",
    }).width,
    label.text.length * 46 * 0.72,
  );
  // Zu lange Pills (breiter als das Bild − 80 px) verkleinern die Schrift statt aus dem Bild zu laufen
  const fontSize = Math.min(46, Math.floor((46 * (width - 80 - 90)) / Math.max(1, rawW)));
  const estW = (rawW * fontSize) / 46 + 90;
  // Zipfel bleibt unter der Pill (nicht über deren Rundung hinaus); lieber 20 px Rand als lose Spitze
  const room = Math.max(0, estW / 2 - 50);
  const shift = Math.max(
    -room,
    Math.min(room, Math.max(40 - (x - estW / 2), Math.min(0, width - 40 - (x + estW / 2)))),
  );
  const tail = 22;
  const tri = `M6 0 L${tail + 8} ${tail + 4} L${tail * 2 + 10} 0`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + bob,
          transform: `translate(-50%, -100%) scale(${enter * exit})`,
          transformOrigin: "50% 100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transform: `translateX(${shift}px) rotate(${(label.x < 0.5 ? -1 : 1) * 2}deg)`,
            background: color,
            color: fg,
            border: `${OUTLINE}px solid ${INK}`,
            borderRadius: 999,
            boxShadow: hardShadow(8),
            padding: "8px 30px 10px",
            fontFamily: CAPTION_FONT,
            fontWeight: 900,
            fontSize,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            lineHeight: 1.1,
          }}
        >
          {label.text.toUpperCase()}
        </div>
        {/* Zipfel: schwarzes Dreieck mit Farbfüllung, zeigt auf das Ziel */}
        <svg
          width={tail * 2 + 16}
          height={tail + 24}
          viewBox={`0 0 ${tail * 2 + 16} ${tail + 24}`}
          style={{ marginTop: -OUTLINE - 1 }}
        >
          <path d={tri} fill={INK} transform="translate(0 8)" />
          <path d={`${tri} Z`} fill={color} />
          <path
            d={tri}
            fill="none"
            stroke={INK}
            strokeWidth={OUTLINE}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
