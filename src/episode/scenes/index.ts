import React from "react";
import { Earth, Hook, Launch, Mercury, Sun, Venus } from "./part1";
import { Jupiter, Mars, Neptune, Outro, Saturn, Uranus } from "./part2";
import type { TransitionSpec } from "../kit/transitions";
import { EARTH_SCENES, EARTH_TRANSITIONS, EarthCoverArt } from "./earth";
import { ROME_SCENES } from "./rome1";
import { TYSON_CONFIG, TYSON_SCENES } from "./tyson";
import { UFC_CONFIG, UFC_SCENES } from "./ufc";
import { ROLLS_CONFIG, ROLLS_SCENES } from "./rolls";
import { HUANG_CONFIG, HUANG_SCENES } from "./huang";
import { LUCIA_CONFIG, LUCIA_SCENES } from "./lucia";
import { JASON_CONFIG, JASON_SCENES } from "./jason";
import { ZEIT_CONFIG, ZEIT_SCENES } from "./zeitwelt";
import { BAU_CONFIG, BAU_SCENES } from "./bauarbeiter";
import { SONNE_CONFIG, SONNE_SCENES } from "./sonne";
import { SCHWERKRAFT_CONFIG, SCHWERKRAFT_SCENES } from "./schwerkraft";
import { TOR_CONFIG, TOR_SCENES } from "./tor";
import { GAEHN_CONFIG, GAEHN_SCENES } from "./gaehn";
import { LUEGEN_CONFIG, LUEGEN_SCENES } from "./luegen";
import { GHOST_CONFIG, GHOST_SCENES } from "./ghost";
import { SUCHE_CONFIG, SUCHE_SCENES } from "./suche";
import { TODO_CONFIG, TODO_SCENES } from "./todo";
import { AKKU_CONFIG, AKKU_SCENES } from "./akku";
import { FLUCH_CONFIG, FLUCH_SCENES } from "./fluch";
import { APPLE_CONFIG, APPLE_SCENES } from "./apple";
import { MECKERN_CONFIG, MECKERN_SCENES } from "./meckern";
import { GHOSTING_CONFIG, GHOSTING_SCENES } from "./ghosting";
import { SCROLL_CONFIG, SCROLL_SCENES } from "./scroll";
import { SCHNECKE_CONFIG, SCHNECKE_SCENES } from "./schnecke";
import { HANGOUT_CONFIG, HANGOUT_SCENES } from "./hangout";
import type { FilmLookSpec } from "../overlays/FilmLook";

// Szenen-IDs = "id" in episodes/solar-system.json
export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  launch: Launch,
  sun: Sun,
  mercury: Mercury,
  venus: Venus,
  earth: Earth,
  mars: Mars,
  jupiter: Jupiter,
  saturn: Saturn,
  uranus: Uranus,
  neptune: Neptune,
  outro: Outro,
};

/**
 * Szenen je Episode (Prop `episode`). Episoden ohne eigenen Eintrag nutzen SCENES
 * (Sonnensystem) – so bleibt alles Bisherige unverändert.
 */
export const SCENE_SETS: Record<string, Record<string, React.FC>> = {
  "roman-empire": ROME_SCENES,
  "earth-without-humans": EARTH_SCENES,
  "mike-tyson": TYSON_SCENES,
  ufc: UFC_SCENES,
  "rolls-royce": ROLLS_SCENES,
  "jensen-huang": HUANG_SCENES,
  "lucia-gta6": LUCIA_SCENES,
  "jason-gta6": JASON_SCENES,
  "zeit-welt": ZEIT_SCENES,
  bauarbeiter: BAU_SCENES,
  "sonne-verschwindet": SONNE_SCENES,
  "schwerkraft-stadt": SCHWERKRAFT_SCENES,
  "tor-stadt": TOR_SCENES,
  "gaehn-stadt": GAEHN_SCENES,
  "luegen-stadt": LUEGEN_SCENES,
  "ghost-pepper": GHOST_SCENES,
  "suche-stadt": SUCHE_SCENES,
  "todo-stadt": TODO_SCENES,
  "akku-stadt": AKKU_SCENES,
  "fluch-stadt": FLUCH_SCENES,
  "meckern-stadt": MECKERN_SCENES,
  "ghost-stadt": GHOSTING_SCENES,
  "scroll-stadt": SCROLL_SCENES,
  "schnecken-stadt": SCHNECKE_SCENES,
  "hangout-stadt": HANGOUT_SCENES,
  "apple-ipod": APPLE_SCENES,
};

export const scenesFor = (episode: string) => SCENE_SETS[episode] ?? SCENES;

/**
 * Zusatz je Episode (optional, nur additiv): `look: "2d"` zeichnet die Szenen als SVG statt in der
 * ThreeCanvas (kit2d), `transitions` setzt Übergänge je Szenen-ID, `hud2d` ersetzt das Zahlen-HUD
 * durch den Text-Zähler `TimelineHUD` (Balken friert ab Beat `freezeBeat` ein).
 * Episoden ohne Eintrag bleiben unverändert.
 */
export type EpisodeConfig = {
  readonly look?: "2d";
  readonly transitions?: Record<string, TransitionSpec>;
  /** `plate`: dunkle Platte hinter dem Text-Zähler (Kontrast auf hellem Papier); `hideBeat`: HUD blendet ab diesem Beat aus (Loop-Naht) */
  readonly hud2d?: { readonly freezeBeat?: string; readonly counterId?: string; readonly barId?: string; readonly plate?: boolean; readonly hideBeat?: string; readonly maxWidth?: number };
  /** Sticker (Text → höchstens so viele Bilder, Standard 54) */
  readonly stickerMax?: Record<string, number>;
  /** Pill (label) einer Szene endet am Beat dieses Namens statt am Szenenende (Szenen-ID → Beat) */
  readonly labelUntil?: Record<string, string>;
  /** Pill(s) einer Szene enden beim ersten Vorkommen dieses Worts (captions.json) – nur Pills, die vorher beginnen */
  readonly labelUntilWord?: Record<string, string>;
  /** Sticker (Text → Beat derselben Szene) endet an diesem Beat statt nach 54 Bildern */
  readonly stickerUntil?: Record<string, string>;
  /** Folgt ein Sticker zu schnell (< 45 Bilder), bleibt der vorige stehen und der neue rutscht 150 px tiefer */
  readonly stickerStack?: boolean;
  /** Motiv hinter dem Cover-Titel (overlays/Cover.tsx); ohne = erste Szene bleibt sichtbar */
  readonly coverArt?: React.FC;
  /** Kino-Look über der 3D-Leinwand: Filmkorn, Vignette, Rand-Unschärfe (overlays/FilmLook.tsx) */
  readonly filmLook?: FilmLookSpec;
  /** Ambient-Bett (Datei in public/episodes/<id>/, erzeugt mit scripts/make_sound_bed.py) */
  readonly bed?: { readonly src: string; readonly volume?: number };
  /** Untertitel-Phrasen für captionStyle "phrase-yellow" (wenn timeline.json keine `phrases` hat) */
  readonly phrases?: readonly string[];
  /** Handlungs-Phrase je Szene oben (wenn timeline.json keine `onScreen` hat), overlays/OnScreenText.tsx */
  readonly onScreen?: Readonly<Record<string, string>>;
  /** Zahlen-HUD aus timeline.hud nicht zeichnen (z. B. weil oben die Handlungs-Phrase steht) */
  readonly noHud?: boolean;
  /** Oberkante der Sticker (px); ohne = wie bisher (HUD-Unterkante + 30 bzw. 300) */
  readonly stickerTop?: number;
  /** Sticker mit diesem Text nicht zeichnen (z. B. wenn die Handlungs-Phrase dasselbe sagt) */
  readonly stickerHide?: readonly string[];
  /** dunkle Platte hinter der Handlungs-Phrase */
  readonly onScreenPlate?: boolean;
  /** End-Card: Tippen beginnt ab diesem Bild (Standard 10) */
  readonly endCardTypeFrom?: number;
};
export const EPISODE_CONFIG: Record<string, EpisodeConfig> = {
  "earth-without-humans": { look: "2d", transitions: EARTH_TRANSITIONS, hud2d: { freezeBeat: "barFreeze" }, coverArt: EarthCoverArt },
  "mike-tyson": TYSON_CONFIG,
  ufc: UFC_CONFIG,
  "rolls-royce": ROLLS_CONFIG,
  "jensen-huang": HUANG_CONFIG,
  "lucia-gta6": LUCIA_CONFIG,
  "jason-gta6": JASON_CONFIG,
  "zeit-welt": ZEIT_CONFIG,
  bauarbeiter: BAU_CONFIG,
  "sonne-verschwindet": SONNE_CONFIG,
  "schwerkraft-stadt": SCHWERKRAFT_CONFIG,
  "tor-stadt": TOR_CONFIG,
  "gaehn-stadt": GAEHN_CONFIG,
  "luegen-stadt": LUEGEN_CONFIG,
  "ghost-pepper": GHOST_CONFIG,
  "suche-stadt": SUCHE_CONFIG,
  "todo-stadt": TODO_CONFIG,
  "akku-stadt": AKKU_CONFIG,
  "fluch-stadt": FLUCH_CONFIG,
  "meckern-stadt": MECKERN_CONFIG,
  "ghost-stadt": GHOSTING_CONFIG,
  "scroll-stadt": SCROLL_CONFIG,
  "schnecken-stadt": SCHNECKE_CONFIG,
  "hangout-stadt": HANGOUT_CONFIG,
  "apple-ipod": APPLE_CONFIG,
};
export const configFor = (episode: string): EpisodeConfig | undefined => EPISODE_CONFIG[episode];
