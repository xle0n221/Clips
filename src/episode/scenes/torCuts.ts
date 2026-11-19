/**
 * „In This City, the Gate Needs 1,000 Yeses“ (episodes/tor-stadt.json) – Schnittplan je Szene.
 * Reine Daten (kein React): Szenen UND das Mess-Skript (scripts/torstadt_shots.mjs) nutzen dieselbe Funktion.
 * Schnitte hängen an Wort-Beats (timeline.json), nie an festen Sekunden; Abstände in Bildern (30 fps).
 * Regel (Erweiterung „Continuous Improvement“ 3): jede Einstellung ≤ 4 s, nur `turn` Shot 2 ist ein Halt (≤ 6 s);
 * Lehre Sonne-Kritik: keine Einstellung < 1,3 s → `clampCuts` schiebt zu kurze Stücke zusammen.
 */
export type BeatFn = (name: string) => number;

/** Mindestlänge einer Einstellung in Bildern (1,3 s). */
export const MIN_SHOT = 39;

export const TOR_SHOTS: Record<string, { readonly names: readonly string[]; readonly cuts: (beat: BeatFn, duration: number) => number[] }> = {
  // Cover + Zähler-Pflanzung bis nach „years.“, dann Untersicht mit Rostschild, Schlüsselloch auf „thousand“
  hook: { names: ["ECU gate + counter 999 (cover)", "low-angle wide wall + plaque", "detail keyhole cobwebs"], cuts: (b) => [b("gateCounterPlant") + 16, b("keyholeCobweb") - 30] },
  rule: { names: ["top-down square, 1,000 people", "close-up stopwatch snaps"], cuts: (b) => [b("stopwatchSnap") - 26] },
  world: {
    names: ["wide crane down rooftops + banner", "medium 999 paddles, counter flips", "detail single red NO paddle"],
    cuts: (b) => [b("paddlesUp") - 8, b("redPaddle") - 34],
  },
  pip: { names: ["medium close-up Pip forehead on gate", "macro hand on painted wave"], cuts: (b) => [b("paintedWaveTouch") - 22] },
  posters: { names: ["wide Pip pastes posters", "rack focus counter 999 → Pip's face drops"], cuts: (b) => [b("counter999again") - 32] },
  doors: { names: ["tracking OTS Pip knocks, neighbours nod", "close-up clipboard 1,000 ticks"], cuts: (b) => [b("clipboardSquint") - 20] },
  hide: {
    names: ["low-angle Pip behind barrel", "push-in booth NO paddle rises", "close-up Hollis lowers paddle"],
    cuts: (b) => [b("hollisRevealed") - 52, b("hollisRevealed") - 6],
  },
  hollis: { names: ["medium Hollis polishes keys + certificate", "insert booth sign swings"], cuts: (b) => [b("boothSign") - 16] },
  stakes: { names: ["wide dusk, Pip alone at gate", "close-up paint flake past sad eyes"], cuts: (b) => [b("paintFlakeFalls") - 44] },
  hope: { names: ["macro rule plate OPENS AT 1,000 YES", "close-up Pip grins"], cuts: (b) => [b("pipGrin") - 14] },
  turn: { names: ["low-angle Pip on crate, MEETING OVER?", "HOLD 1,000 paddles + Hollis yells, counter 1,000"], cuts: (b) => [b("thousandPaddles") - 30] },
  open: { names: ["wide doors split, daylight", "slow-mo side Pip leaps"], cuts: (b) => [b("pipLeaps") - 12] },
  sea: { names: ["wide crane down real sea → boots in surf"], cuts: () => [] },
  first: { names: ["plaque scratch 1 LEFT → pull back wall"], cuts: () => [] },
  stinger: { names: ["medium frozen square, Hollis hangs NO paddle", "match cut opening frame 999 / 1,000"], cuts: (b) => [b("loopToHook") - 40] },
};

/**
 * Zu kurze Stücke (< MIN_SHOT) verhindern, ohne Einstellungen zu streichen (die Szenen zählen die Einstellungen):
 * Schnitte nach vorn schieben (≥ vorheriger + MIN_SHOT), danach von hinten so weit zurück, dass das letzte Stück passt.
 */
const clampCuts = (cuts: number[], duration: number) => {
  const out = cuts.map((c) => Math.round(c));
  for (let i = 0; i < out.length; i++) out[i] = Math.max(out[i], (i ? out[i - 1] : 0) + MIN_SHOT);
  for (let i = out.length - 1; i >= 0; i--) out[i] = Math.min(out[i], (i + 1 < out.length ? out[i + 1] : duration) - MIN_SHOT);
  return out.filter((c) => c > 0 && c < duration);
};

export const torCuts = (scene: string, beat: BeatFn, duration: number) => clampCuts(TOR_SHOTS[scene]?.cuts(beat, duration) ?? [], duration);
