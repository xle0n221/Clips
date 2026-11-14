import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CAPTION_FONT } from "./fonts";

/** Drehbuch-Feld `endCard` (KnowToon-Prompt STEP 6): letzte `seconds` s, Suchleiste tippt `handle`, darunter `cta`. */
export type EndCardSpec = { readonly handle: string; readonly cta: string; readonly seconds?: number; readonly accent?: string; /** Bild, ab dem getippt wird (Standard 10) */ readonly typeFrom?: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * End-Card: dunkler Hintergrund (blendet in 6 Bildern ein), weiße Suchleiste mit Lupe, die den Kanalnamen
 * Buchstabe für Buchstabe tippt (blinkender Cursor), danach ein kurzer Call-to-Action und ein „Follow“-Knopf,
 * der einmal gedrückt wird. Lokaler Frame 0 = Beginn der End-Card. Alles aus `useCurrentFrame()`.
 */
export const EndCard: React.FC<{ readonly spec: EndCardSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const accent = spec.accent ?? "#FFC23A";
  const fade = interpolate(frame, [0, 6], [0, 1], clamp);
  const barIn = interpolate(frame, [3, 12], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  // Tippen: ab Bild 10, ein Zeichen je 2,5 Bilder (KnowToon = 8 Zeichen ≈ 0,7 s)
  const typed = Math.max(0, Math.min(spec.handle.length, Math.floor((frame - (spec.typeFrom ?? 10)) / 2.5) + 1));
  const doneAt = 10 + spec.handle.length * 2.5;
  const cursorOn = frame < doneAt + 4 || Math.floor(frame / 8) % 2 === 0;
  const ctaIn = interpolate(frame, [doneAt + 2, doneAt + 10], [0, 1], clamp);
  const press = frame - (doneAt + 16);
  const btnScale = press >= 0 && press < 8 ? 1 - 0.08 * Math.sin((press / 8) * Math.PI) : 1;
  const followed = press >= 4;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 42%, #1A2233 0%, #0B0F18 55%, #05070B 100%)`,
        }}
      />
      {/* feine Goldkörner als Hintergrund-Glimmen (Farblogik: Gold = Zeit) */}
      {Array.from({ length: 18 }, (_, i) => {
        const x = (i * 197) % 1000 + 40;
        const y = ((i * 331) % 1500) + 160 - ((frame * (0.6 + (i % 5) * 0.25)) % 120);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 6 + (i % 3) * 3,
              height: 6 + (i % 3) * 3,
              borderRadius: 99,
              background: accent,
              opacity: 0.18 + (i % 4) * 0.06,
              filter: "blur(1.5px)",
            }}
          />
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 54, paddingBottom: 160 }}>
        <div
          style={{
            width: 900,
            height: 150,
            borderRadius: 80,
            background: "#FFFFFF",
            boxShadow: "0 18px 50px rgba(0,0,0,0.55), 0 0 0 6px rgba(255,194,58,0.35)",
            display: "flex",
            alignItems: "center",
            padding: "0 48px",
            gap: 30,
            transform: `scale(${0.85 + 0.15 * barIn}) translateY(${(1 - barIn) * 40}px)`,
            opacity: barIn,
          }}
        >
          {/* Lupe als Form (kein Schrift-Symbol) */}
          <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 44, height: 44, borderRadius: 99, border: "9px solid #1B2230", boxSizing: "border-box" }} />
            <div style={{ position: "absolute", left: 38, top: 40, width: 30, height: 10, borderRadius: 6, background: "#1B2230", transform: "rotate(45deg)", transformOrigin: "0 50%" }} />
          </div>
          <div
            style={{
              fontFamily: CAPTION_FONT,
              fontWeight: 900,
              fontSize: 78,
              color: "#111722",
              letterSpacing: 1,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
            }}
          >
            {spec.handle.slice(0, typed)}
            <span style={{ display: "inline-block", width: 7, height: 78, marginLeft: 6, background: cursorOn ? "#111722" : "transparent" }} />
          </div>
        </div>
        <div
          style={{
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 24}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 34,
          }}
        >
          <div
            style={{
              fontFamily: CAPTION_FONT,
              fontWeight: 900,
              fontSize: 62,
              color: "#FFFFFF",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.12,
              WebkitTextStroke: "10px #000",
              paintOrder: "stroke",
            }}
          >
            {spec.cta}
          </div>
          <div
            style={{
              fontFamily: CAPTION_FONT,
              fontWeight: 900,
              fontSize: 54,
              color: "#111722",
              background: followed ? "#FFFFFF" : accent,
              borderRadius: 60,
              padding: "18px 64px",
              transform: `scale(${btnScale})`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {followed ? "FOLLOWING" : "FOLLOW"}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
