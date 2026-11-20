/**
 * „In This City, Gravity Pulls Toward Marta“ (episodes/schwerkraft-stadt.json) – Schnittplan je Szene.
 * Reine Daten (kein React): Szenen UND das Mess-Skript (scripts/schwerkraft_shots.mjs) nutzen dieselbe Funktion.
 * Schnitte hängen an Wort-Beats (timeline.json), nie an festen Sekunden; Abstände in Bildern (30 fps).
 * Regeln: jede Einstellung 1,3–4 s (Regie Sonne R2: keine Mikro-Shots), auch `turn` (Regie Station 3: Schnitt auf „starts to fall“).
 * Hinweis: Cue „martaCatchesCat“ (slide) hängt am ERSTEN „her“ („toward her door“) → Schnitte nutzen ihn nicht.
 */
export type BeatFn = (name: string) => number;

const MIN = 40; // 1,33 s

/** Schnitt-Bilder (lokal in der Szene) + Namen der Einstellungen. */
export const SCHWERKRAFT_SHOTS: Record<string, { readonly names: readonly string[]; readonly cuts: (beat: BeatFn, duration: number) => number[] }> = {
  hook: { names: ["ECU hand lets go, apple drops sideways (cover)", "wide low-angle apple rolls to Marta's boots"], cuts: (b) => [b("appleReachesMarta") - 40] },
  rule: { names: ["medium town scale, board flips to MARTA", "close-up Marta + load, tired wave"], cuts: (b) => [b("martaWaves") - 34] },
  slide: {
    names: ["high wide crane down, town funnel", "insert hat + letter skid sideways", "medium porch, cat flies into Marta's arms"],
    cuts: (b) => {
      const c1 = b("townFunnel") - 4;
      return [c1, Math.max(c1 + MIN + 4, b("catFliesIn") - 6)];
    },
  },
  light: { names: ["medium street, balloon hats on tiptoe", "detail empty pocket, coins roll away"], cuts: (b) => [b("pocketInsideOut") - 26] },
  dump: { names: ["tracking downhill, junk rolls to the porch", "medium porch, pile grows, key into pocket"], cuts: (b) => [b("scaleNeedleTicks") - 40] },
  lonely: {
    names: ["wide street, neighbour waves, skids, grabs lamp", "close-up Marta alone at dusk, empty arms"],
    cuts: (b) => [Math.max(b("neighbourSkids") + 14, b("martaAlone") - 50)],
  },
  rehook: { names: ["ECU balloon string slips through a small hand"], cuts: () => [] },
  bo: {
    names: ["medium low angle, Bo hops like on the moon", "close-up Bo grins at his balloons", "detail sneakers barely touch, thin pull-lines"],
    cuts: (b) => {
      const c1 = b("boHops") + 4;
      return [c1, Math.max(c1 + MIN + 4, b("thinPullLines") - 36)];
    },
  },
  gust: { names: ["medium street, gust lifts Bo, cap flies", "high angle down, Bo rises past the roofs"], cuts: (b) => [b("boPastRoofs") - 40] },
  town: { names: ["wide low angle, crowd reaches up", "OTS from Bo, crowd far below"], cuts: (b) => [b("boLooksDown") - 40] },
  marta: { names: ["medium porch push-in, Marta stands up", "wide porch, she scoops the pile"], cuts: (b) => [b("martaScoopsPile") - 34] },
  turn: { names: ["Bo stops rising, pull line reaches him", "close-up Bo flips and falls toward Marta"], cuts: (b) => [b("boTurnsAndFalls") - 2] },
  catch: { names: ["medium porch, Bo lands in her arms", "close-up hug, eyes closed"], cuts: (b) => [b("hugClose") - 36] },
  answer: { names: ["high wide dusk, balloon hats everywhere", "medium, neighbours come down the rope"], cuts: (b) => [b("neighboursCome") - 50] },
  loop: { names: ["close-up bench, balloon bumps Marta's nose", "match cut to opening shot (apple)"], cuts: (b) => [b("loopToHook") - 40] },
};

export const schwerkraftCuts = (scene: string, beat: BeatFn, duration: number) =>
  (SCHWERKRAFT_SHOTS[scene]?.cuts(beat, duration) ?? []).filter((c) => c > 0 && c < duration);
