/**
 * „What If the Sun Vanished? The First 8:19“ (episodes/sonne-verschwindet.json) – Schnittplan je Szene.
 * Reine Daten (kein React): Szenen UND das Mess-Skript (scripts/sonne_shots.mjs) nutzen dieselbe Funktion.
 * Schnitte hängen an Wort-Beats (timeline.json), nie an festen Sekunden; Abstände in Bildern (30 fps).
 * Regel (Erweiterung „Continuous Improvement“ 3): jede Einstellung ≤ 4 s, nur `turn` ist ein Halt (≤ 6 s).
 */
export type BeatFn = (name: string) => number;

/** Schnitt-Bilder (lokal in der Szene) + Namen der Einstellungen. */
export const SONNE_SHOTS: Record<string, { readonly names: readonly string[]; readonly cuts: (beat: BeatFn, duration: number) => number[] }> = {
  hook: { names: ["ECU sun gone over beach (cover)", "low-angle watch 12:00 + timer"], cuts: (b) => [b("hudTimerStarts") - 48] },
  juno: { names: ["wide beach, Juno on towel", "close-up face in gold"], cuts: (b) => [b("junoFaceGolden") - 54] },
  grandpa: {
    names: ["OTS phone video call", "medium balcony, Grandpa waves", "eyepiece POV Saturn"],
    cuts: (b) => [b("videoCallGrandpa") + 32, b("eyepieceSaturn") - 26],
  },
  old: { names: ["macro sunbeam on cheek 8 MIN OLD", "pull-back along the beam"], cuts: (b) => [b("pullBackAlongBeam") - 40] },
  zero: {
    names: ["wide empty spot + light shell", "tracking on the light shell", "insert timer 0:10"],
    cuts: (b) => [b("emptySpotLightShell") + 6, b("rideLightShell") - 18],
  },
  distance: { names: ["ultra-wide ribbon 150M km", "detail ribbon tail, black behind"], cuts: (b) => [b("ribbonTailBlack") - 30] },
  gravity: { names: ["medium model, string cut", "low-angle Grandpa eyebrow ?"], cuts: (b) => [b("modelStringCut") + 30] },
  speed: { names: ["grid ripple + light shell", "tracking race with c"], cuts: (b) => [b("rippleAndLightRace") - 52] },
  proof: {
    names: ["wide two dead stars spiral", "ECU crash flash + ripple", "tracking flash + ripple, 2017"],
    cuts: (b) => [b("deadStarsCrash") - 8, b("flashRippleSideBySide") - 50],
  },
  arrive: { names: ["time-lapse galaxies 130M years", "photo finish 1.7 s"], cuts: (b) => [b("photoFinish") - 40] },
  orbit: { names: ["top-down orbit around empty spot", "close-up NOTHING HERE"], cuts: (b) => [b("orbitEmptySpot") - 14] },
  rehook: { names: ["medium Juno hums + timer 3:00", "wide crowd all normal"], cuts: (b) => [b("beachCrowdNormal") - 46] },
  four: { names: ["close-up Grandpa at telescope", "eyepiece POV rings"], cuts: (b) => [b("eyepieceRings") - 30] },
  five: { names: ["OTS phone Grandpa yawns", "close-up Juno holds phone + 5:00"], cuts: (b) => [b("junoHoldsPhone") - 6] },
  seven: { names: ["ECU push-in Juno closes eyes", "insert timer 7:19"], cuts: (b) => [b("watchOneMinute") - 40] },
  hope: { names: ["wide golden beach, gulls", "close-up Juno stretches + 8:18"], cuts: (b) => [b("junoStretches") - 40] },
  turn: { names: ["HOLD noon turns to night"], cuts: () => [] },
  straight: { names: ["top-down orbit snaps, 30 km/s", "close-up old orbit fading"], cuts: (b) => [b("speedTag30") - 26] },
  moon: { names: ["medium balcony, Moon goes dark", "eyepiece POV Saturn still shining"], cuts: (b) => [b("saturnStillShining") - 18] },
  ocean: {
    names: ["wide ice skin creeps over sea", "dive through ice", "macro vent + microbes"],
    cuts: (b) => [b("iceSkinCreeps") + 4, b("ventMicrobes") - 18],
  },
  saturn: { names: ["eyepiece POV Saturn +2 h", "close-up Grandpa in scarf"], cuts: (b) => [b("grandpaStares") - 32] },
  tally: { names: ["split bars 8 MIN vs 2 H (Saturn glow dims in answer2)"], cuts: () => [] },
  answer2: { names: ["eyepiece POV Saturn fades", "match cut to opening shot"], cuts: (b) => [b("saturnFades") + 20] },
};

export const sonneCuts = (scene: string, beat: BeatFn, duration: number) =>
  (SONNE_SHOTS[scene]?.cuts(beat, duration) ?? []).filter((c) => c > 0 && c < duration);
