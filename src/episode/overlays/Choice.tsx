import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ChoiceSpec } from "../types";
import { CAPTION_FONT } from "./fonts";
import {
  ACCENT,
  clamp01,
  DANGER,
  hardShadow,
  INK,
  OUTLINE,
  strokeText,
} from "./style";

const LETTERS = ["A", "B", "C", "D"];
const BADGE = ["#FF5A5A", "#4FC3F7", "#7CDB5A", "#B388FF"];

const CARD_W = 880;
const LEFT = (1080 - CARD_W) / 2;
const STAGGER = 6; // Karten kommen nacheinander
const FIRST = 3;
const MOVE = 18; // Zeiger fährt zur Karte
const PRESS = 4;

/** Standard-Hinweis aus der Zahl der Karten: "COMMENT A OR B", "COMMENT A, B OR C" … */
export const askText = (n: number) => {
  const l = LETTERS.slice(0, Math.max(2, Math.min(4, n)));
  return `COMMENT ${l.slice(0, -1).join(", ")} OR ${l[l.length - 1]}`;
};

/** Mauszeiger (Pfeil) im Sticker-Stil; Spitze liegt bei (0, 0). */
const Cursor: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}> = ({ x, y, scale }) => (
  <svg
    width={120}
    height={140}
    viewBox="-8 -8 120 140"
    style={{
      position: "absolute",
      left: x - 8,
      top: y - 8,
      transform: `scale(${scale})`,
      transformOrigin: "8px 8px",
      overflow: "visible",
    }}
  >
    <path
      d="M0 0 L0 96 L24 74 L42 114 L60 106 L42 67 L74 66 Z"
      fill={INK}
      transform="translate(0 9)"
    />
    <path
      d="M0 0 L0 96 L24 74 L42 114 L60 106 L42 67 L74 66 Z"
      fill="#FFFFFF"
      stroke={INK}
      strokeWidth={7}
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Auswahlkarten A–D (Referenz-Analyse 2, Punkt 2): Karten ploppen nacheinander herein, ein
 * Mauszeiger fährt zur gewählten Karte und klickt; ohne `pick` zögert er, darunter "COMMENT A OR B".
 * Lokaler Frame ab dem Cue-Wort; `duration` = Frames bis zum Ende (Szene oder nächste Auswahl).
 */
export const Choice: React.FC<{
  readonly spec: ChoiceSpec;
  readonly duration: number;
}> = ({ spec, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const options = spec.options.slice(0, 4);
  const n = options.length;
  const pick =
    spec.pick !== undefined && spec.pick >= 0 && spec.pick < n
      ? spec.pick
      : null;
  const ask =
    spec.ask === false
      ? null
      : typeof spec.ask === "string"
        ? spec.ask
        : pick === null || spec.ask === true
          ? askText(n)
          : null;

  // Senkrechtes Layout um die Bildmitte, unteres Drittel bleibt für die Untertitel frei
  const cardH = n <= 2 ? 176 : 138;
  const gap = n <= 2 ? 40 : 30;
  const titleH = spec.title ? 110 : 0;
  const askH = ask ? 150 : 0;
  const block = titleH + n * cardH + (n - 1) * gap + askH;
  const top0 = Math.max(470, 930 - block / 2);
  const cardsTop = top0 + titleH;
  const cardY = (i: number) => cardsTop + i * (cardH + gap);

  const cardsIn = FIRST + (n - 1) * STAGGER + 10;
  const cursorIn = cardsIn;
  const clickAt = cursorIn + MOVE + 3;
  const exit = interpolate(frame, [duration - 6, duration], [1, 0], clamp01);

  // Zeiger: fährt von rechts unten zur Karte (oder pendelt ohne Wahl zwischen A und B)
  const startX = 980;
  const startY = 1560;
  const targetOf = (i: number) => ({
    x: LEFT + CARD_W - 110,
    y: cardY(i) + cardH * 0.62,
  });
  let cx = startX;
  let cy = startY;
  if (pick !== null) {
    const t = interpolate(frame, [cursorIn, cursorIn + MOVE], [0, 1], {
      ...clamp01,
      easing: Easing.inOut(Easing.cubic),
    });
    const tg = targetOf(pick);
    // leichter Bogen statt gerader Linie
    cx = interpolate(t, [0, 1], [startX, tg.x]) - Math.sin(t * Math.PI) * 60;
    cy = interpolate(t, [0, 1], [startY, tg.y]);
  } else {
    const t = interpolate(frame, [cursorIn, cursorIn + MOVE], [0, 1], {
      ...clamp01,
      easing: Easing.out(Easing.cubic),
    });
    const a = targetOf(0);
    const b = targetOf(Math.min(1, n - 1));
    const mid = (a.y + b.y) / 2;
    const swing = Math.sin(Math.max(0, frame - cursorIn - MOVE) * 0.12);
    cx = interpolate(t, [0, 1], [startX, a.x]);
    cy = interpolate(t, [0, 1], [startY, mid + swing * (b.y - a.y) * 0.5]);
  }
  const pressed = pick !== null && frame >= clickAt && frame < clickAt + PRESS;
  const clicked = pick !== null && frame >= clickAt;
  const cursorScale =
    spring({ frame: frame - cursorIn, fps, config: { damping: 12, stiffness: 220 } }) *
    (pressed ? 0.82 : 1);
  const ripple = clicked ? frame - clickAt : -1;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        fontFamily: CAPTION_FONT,
        fontWeight: 900,
        opacity: exit,
        transform: `scale(${0.9 + 0.1 * exit})`,
      }}
    >
      {spec.title ? (
        <div
          style={{
            position: "absolute",
            top: top0,
            left: 40,
            right: 40,
            textAlign: "center",
            fontSize: 72,
            lineHeight: 1.05,
            color: "#FFFFFF",
            transform: `scale(${spring({ frame, fps, config: { damping: 10, stiffness: 200 } })})`,
            ...strokeText(14),
            textShadow: "0 8px 0 rgba(0,0,0,0.75)",
          }}
        >
          {spec.title}
        </div>
      ) : null}

      {options.map((text, i) => {
        const s = spring({
          frame: frame - FIRST - i * STAGGER,
          fps,
          config: { damping: 13, stiffness: 190 },
        });
        const isPick = clicked && pick === i;
        const dim = clicked && pick !== i;
        const press = pressed && pick === i ? 8 : 0;
        const pop = isPick
          ? interpolate(frame - clickAt, [0, PRESS, PRESS + 5, PRESS + 12], [1, 0.97, 1.07, 1.03], clamp01)
          : dim
            ? 0.95
            : 1;
        const fontSize = Math.min(
          n <= 2 ? 60 : 50,
          fitText({
            text: text.toUpperCase(),
            withinWidth: CARD_W - cardH - 110,
            fontFamily: CAPTION_FONT,
            fontWeight: 900,
          }).fontSize,
        );
        const badge = cardH - 52;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: LEFT,
              top: cardY(i) + press,
              width: CARD_W,
              height: cardH,
              transform: `translateX(${(1 - s) * (i % 2 ? -1 : 1) * 1100}px) rotate(${(1 - s) * (i % 2 ? -8 : 8) + (i % 2 ? 0.8 : -0.8)}deg) scale(${pop})`,
              background: isPick ? ACCENT : dim ? "#CFCAD8" : "#FFFFFF",
              border: `${OUTLINE + 1}px solid ${INK}`,
              borderRadius: 38,
              boxShadow: hardShadow(14 - press),
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "0 34px 0 26px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: badge,
                height: badge,
                flex: "none",
                borderRadius: "50%",
                background: BADGE[i],
                border: `${OUTLINE}px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: badge * 0.62,
                color: "#FFFFFF",
                boxSizing: "border-box",
                ...strokeText(9),
              }}
            >
              {LETTERS[i]}
            </div>
            <div
              style={{
                fontSize,
                color: dim ? "#5C566B" : INK,
                lineHeight: 1,
                letterSpacing: -1,
                whiteSpace: "nowrap",
              }}
            >
              {text.toUpperCase()}
            </div>
          </div>
        );
      })}

      {ask
        ? (() => {
            const askIn = pick === null ? cursorIn + 4 : clickAt + 10;
            const s = spring({
              frame: frame - askIn,
              fps,
              config: { damping: 8, stiffness: 160 },
            });
            const beat = 1 + 0.035 * Math.sin(Math.max(0, frame - askIn) * 0.3);
            return (
              <div
                style={{
                  position: "absolute",
                  top: cardY(n - 1) + cardH + 56,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: DANGER,
                    color: "#FFFFFF",
                    border: `${OUTLINE}px solid ${INK}`,
                    borderRadius: 999,
                    boxShadow: hardShadow(10),
                    padding: "12px 40px 14px",
                    fontSize: 62,
                    letterSpacing: 1,
                    whiteSpace: "nowrap",
                    transform: `scale(${s * beat}) rotate(-2deg)`,
                    ...strokeText(8),
                  }}
                >
                  {ask}
                </div>
              </div>
            );
          })()
        : null}

      {ripple >= 0 && ripple < 16 ? (
        <div
          style={{
            position: "absolute",
            left: cx - 20 - ripple * 6,
            top: cy - 20 - ripple * 6,
            width: 40 + ripple * 12,
            height: 40 + ripple * 12,
            borderRadius: "50%",
            border: `${Math.max(2, 10 - ripple * 0.6)}px solid ${INK}`,
            opacity: interpolate(ripple, [0, 15], [1, 0], clamp01),
          }}
        />
      ) : null}
      {frame >= cursorIn ? (
        <Cursor x={cx} y={cy} scale={cursorScale} />
      ) : null}
    </AbsoluteFill>
  );
};
