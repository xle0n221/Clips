/**
 * „Something Under the Site Knocked Back“ (episodes/bauarbeiter.json) – Schnittplan je Szene.
 * Reine Daten (kein React): Szenen UND das Mess-Skript (Shot-Längen) nutzen dieselbe Funktion.
 * Schnitte hängen an Wort-Beats (timeline.json), nie an festen Sekunden; Abstände in Bildern (30 fps).
 * Regel (Erweiterung „Continuous Improvement“ 3): jede Einstellung ≤ 4 s, nur `turn` ist ein Halt (≤ 6 s).
 */
export type BeatFn = (name: string) => number;

/** Schnitt-Bilder (lokal in der Szene) + Namen der Einstellungen. */
export const BAU_SHOTS: Record<string, { readonly names: readonly string[]; readonly cuts: (beat: BeatFn, duration: number) => number[] }> = {
  hook: { names: ["ECU pipe + hard hat (cover)", "low-angle Milo listens"], cuts: (b) => [b("pipeMacroPebblesJump") + 30] },
  ritual: { names: ["medium trailer door, three taps", "detail knuckles on hat"], cuts: (b) => [b("hardHatThirdTapSlow") - 27] },
  stakes: { names: ["high wide crane Lot 9", "pour sign → pit + pipe"], cuts: (b) => [b("pourSign") - 9] },
  pipe: { names: ["medium ear to pipe", "OTS tablet plan"], cuts: (b) => [b("tabletPlanEmpty") - 51] },
  answer: { names: ["detail wrench taps", "macro pebbles + reaction"], cuts: (b) => [b("pebblesJumpTealPulse") - 10] },
  radio: { names: ["detail walkie BASE", "insert bore log"], cuts: (b) => [b("tabletRockLayers") - 40] },
  tape: { names: ["close-up tape into pipe", "handheld tape jerk"], cuts: (b) => [b("tapeJerk") - 12] },
  note: { names: ["ECU note STOP KNOCKING", "split logbook match"], cuts: (b) => [b("matchLogbookHandwriting") - 30] },
  look: { names: ["POV down the pipe", "reverse from inside pipe"], cuts: (b) => [b("povPipeDown") + 63] },
  mirror: {
    names: ["teal headlamp", "hard hat lit teal", "lower Milo face", "lower Milo taps hat"],
    cuts: (b) => [b("miloBelowFace") + 25, b("matchCutFaces") - 4, b("lowerMiloTapsHat") - 11],
  },
  below: { names: ["vertigo dive to Lot 9 below", "lower Milo taps up"], cuts: (b) => [b("lowerMiloTapsUp") - 47] },
  fear: { names: ["low-angle Milo looks up", "tilt up into sky"], cuts: (b) => [b("tiltUpSky") - 31] },
  hope: { names: ["wide stars over city", "close-up relief"], cuts: (b) => [b("miloExhales") - 4] },
  turn: { names: ["HOLD stars = headlamps"], cuts: () => [] },
  pour: { names: ["wide mixer trucks", "slow-mo concrete seals pipe"], cuts: (b) => [b("concreteCoversPipe") - 27] },
  knocks: { names: ["medium static: three knocks from above"], cuts: () => [] },
  answer2: { names: ["close-up lamp flickers teal", "crane up to third Lot 9"], cuts: (b) => [b("craneUpThirdSite") - 31] },
};

export const bauCuts = (scene: string, beat: BeatFn, duration: number) =>
  (BAU_SHOTS[scene]?.cuts(beat, duration) ?? []).filter((c) => c > 0 && c < duration);
