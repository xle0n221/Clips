import React, { useContext } from "react";
import { beatOr, CoinPile, ease, FIGHT, Figure, FightHall, GoldTower, headY, Kit2DContext, lerp, Octagon, OCT, PriceTag, SpotCone } from "../kit2d";
import { useScene } from "../types";

/**
 * Gemeinsames für „The rise of the UFC“ (scenes/ufc1.tsx, ufc2.tsx), 2D Fight-Poster/Paper-Cut.
 * Bildregeln: HUD oben links bis y ≈ 372, Sticker ab y 402, Pills (label, x 0.5 / y 0.36) zeigen auf y 691 →
 * benannte Silhouette mit Kopf-Oberkante bei ≈ 715 px; unteres Drittel (ab y ≈ 1280) frei für Untertitel.
 * Reale Personen nur als gesichtslose Silhouetten (Namen nur in der Pill), keine Logos.
 * Hauptfigur: DER KÄMPFER (erfunden) – rote Handschuhe + rote Hose, Rot trägt sonst niemand.
 */

/** Fußpunkt der Hauptfigur im Oktagon. */
export const HX = 540;
export const HFEET = 1178;
export const HERO_SKIN: readonly [string, string] = ["#C68B5E", "#A16B44"];
/** Silhouetten-Farben (Anzüge, generische Kämpfer). */
export const SIL = { suit: "#22262E", suit2: "#2C303A", fighterA: "#5A4E6A", fighterB: "#3E5A5C", woman: "#6A4E5A", woman2: "#4E5E72", crowd: "#1A1A1E" } as const;

/** Kopf-Oberkante (Welt-y) einer Figur mit Fußpunkt y und Größe s. */
export const headTop = (y: number, s = 1, sit = false) => y + (headY("adult", sit) - 64) * s;
/** Rechte Hand bei hängendem Arm (Standard-Pose) relativ zum Fußpunkt, s = 1. */
export const HAND_R = [109, -249] as const;

/**
 * Zeiten je Szene: Beats aus timeline.json (`B`) und Wort-Zeiten aus captions.json (`W`, lokaler Frame des
 * n-ten Vorkommens eines Worts in dieser Szene). Keine fest kodierten Sekunden; Ersatzwerte nur als Anteil
 * der Szenendauer – eine neue Tonspur passt ohne Code-Änderung.
 */
export const useBeats = () => {
  const s = useScene();
  const { captions, fps, start } = useContext(Kit2DContext);
  const d = s.duration;
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9'-]/g, "");
  const W = (word: string, frac: number, nth = 1) => {
    const t0 = (start / fps) * 1000;
    const t1 = ((start + d) / fps) * 1000;
    const hits = captions.filter((c) => c.startMs >= t0 - 60 && c.startMs < t1 && norm(c.text) === norm(word));
    const c = hits[nth - 1];
    return c ? Math.max(0, Math.round((c.startMs / 1000) * fps) - start) : Math.round(frac * d);
  };
  return { f: s.frame, d, B: (n: string, frac: number) => beatOr(s.beat, n, Math.round(frac * d)), W };
};

type FigProps = React.ComponentProps<typeof Figure>;

/** DER KÄMPFER: erfundene Hauptfigur, rote MMA-Handschuhe + rote Hose. */
export const Hero: React.FC<Omit<FigProps, "frame"> & { readonly f: number }> = ({ f, ...p }) => (
  <Figure frame={f} gloves gloveColor={FIGHT.red} trunksColor={FIGHT.red} skinTone={HERO_SKIN} blinkSeed={7} {...p} />
);

/** Gesichtslose Anzug-Silhouette (reale Person; Name nur in der Pill). */
export const Suit: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly f: number; readonly color?: string; readonly armL?: readonly [number, number]; readonly armR?: readonly [number, number]; readonly flip?: boolean }> = ({
  x,
  y,
  s = 1,
  f,
  color = SIL.suit,
  armL,
  armR,
  flip,
}) => <Figure x={x} y={y} s={s} frame={f} sil={color} outfit="coat" coatColor={color} armL={armL} armR={armR} flip={flip} />;

/** Pferdeschwanz für weibliche Silhouetten (hinter dem Kopf, Fußpunkt x/y, Größe s). */
export const Ponytail: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly color: string; readonly f: number; readonly side?: -1 | 1 }> = ({ x, y, s = 1, color, f, side = 1 }) => {
  const hc = y + headY("adult") * s;
  const sw = Math.sin(f * 0.25) * 8;
  return (
    <path
      d={`M ${x + side * 30 * s} ${hc - 50 * s} Q ${x + side * (110 + sw) * s} ${hc - 30 * s} ${x + side * (96 + sw) * s} ${hc + 70 * s} Q ${x + side * 70 * s} ${hc} ${x + side * 40 * s} ${hc - 10 * s} Z`}
      fill={color}
      stroke="#15100C"
      strokeWidth={5}
    />
  );
};

/**
 * Hook-Motiv (auch Cover): DER KÄMPFER allein im Käfig im Spotlicht, Goldberg wächst hinter dem Zaun,
 * Goldtürme (Skyline) steigen mit `sky` 0..1. Preisschild an der rechten Hand mit `tag` 0..1.
 */
export const HookSet: React.FC<{ readonly f: number; readonly pile: number; readonly sky: number; readonly tag: number; readonly look: number; readonly spot?: number }> = ({ f, pile, sky, tag, look, spot = 1 }) => {
  const towers = [
    [-420, 900, 230],
    [-120, 1250, 260],
    [180, 760, 200],
    [930, 980, 240],
    [1220, 1380, 280],
    [1500, 820, 210],
  ] as const;
  return (
    <>
      <FightHall phase="red" f={f} fill={0.9} lights={0.6} />
      {towers.map(([x, h, w], i) => (
        <GoldTower key={i} x={x} y={1010} h={h * ease(sky, i * 0.08, 0.6 + i * 0.07)} w={w} />
      ))}
      <CoinPile x={905} y={1010} h={pile * 560} w={620} />
      <Octagon>
        <Hero
          x={HX}
          y={HFEET}
          f={f}
          eyes={look > 0.5 ? "open" : "side"}
          eyePop={1 + 0.25 * Math.max(0, 1 - Math.abs(look - 0.6) * 4)}
          brows={look > 0.5 ? "up" : "neutral"}
          mouth={look > 0.5 ? "flat" : "grit"}
          headTilt={lerp(-6, 0, look)}
        />
        {tag > 0 ? <PriceTag x={HX + HAND_R[0] + 6} y={HFEET + HAND_R[1] + 30} s={0.55 * Math.min(1, tag * 1.2)} swing={Math.sin(f * 0.18) * 12 * Math.max(0.3, 1 - tag)} text="?" /> : null}
      </Octagon>
      <SpotCone x={HX} y={HFEET + 8} o={spot} w={330} dim={0.42} />
    </>
  );
};

export { OCT };
