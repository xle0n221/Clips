# Kritik Szenen „Who is Jason from GTA 6?“ (Regie + Design, 13.11.2026)

Prüfer: Regie-Kritiker + Design-Kritiker (zwei Noten). Grundlage: aktuelles Bundle `JasonGTA6` (72,45 s laut
`timeline.json`, 11 Szenen), 44 eigene Standbilder (`--at`, halbe Größe, mind. 2 je Szene + jeder Übergang),
20 Nachprüfbilder (Cover 0,40/0,47 s, couple 52,3/52,8/53,2 s, flawed 59,0, loop 67,0/68,5/69,9, trailer 44,3/46,0)
+ 3 Bewegungs-Dreier (je 3 Frames in Folge bei 2,85 s Whip, 34,0 s Pinnwand, 50,0 s Brett),
145 Bilder im 0,5-s-Raster (0,2×) für die Tempo-Messung, `out/jason-kontakt.png`, `out/jason-gta6-cover.png`.
Je 1 Standbild `LuciaGTA6` (Bild 852) und `JensenHuang` (Bild 300). Bilder im Scratchpad (`jk/`, nicht im Repo). Code nur gelesen.

## Noten
| Rolle | Note | Kurzgrund |
| --- | --- | --- |
| Regie | **8,5** | Ruhiges Tempo im Ziel, motivierte Übergänge (Rückspul-Polaroid, Whip, Zoom in die Karte, Sonnen-Wipe, Umblättern „PAGE 2“, Spotlight-Heiligenschein), Lucia-Lehren meist umgesetzt (Karten 3,4 s, Lucia + Jason in `play`, HUD-Platte, Loop-Naht ohne HUD). Aber: ~1 s **leeres Türkis-Bild** bei „in Florida's“ (52,3–53,3 s), „up on a roof“ zeigt kein Dach, Auswahl-Titel liegt über den Kinnen. |
| Design | **8,5** | 2D-Akten-Look als Reihe zu Lucia erkennbar, eigene Bildwelt (Keys-Mittag, Pink), HUD ≥ 10 : 1, keine Logos/kein Trailer-Nachbau. Aber: Jason **blinzelt im Cover** (Bilder 12–14 von 0–14), **null echte Bilder** (Manifest `REAL` leer, keine `bildnachweise-jason-gta6.md`), Fallback des Florida-Slots ist leer, NOV-19-Doppelung (Lucia-Fehler D4 wiederholt). |

Beide < 9 → Nacharbeit nötig. Mit P1 (R1, D1, D2) erwarte ich Regie 9, Design 9 – auch **ohne** echte Fotos, wenn deren
Fehlen in der Freigabe begründet wird (Wikimedia/Commons aus dieser Umgebung gesperrt: `out/commons-jason.log`
„Tunnel connection failed: 403 Forbidden“).

## Gemessen
- **Bildwechsel-Tempo** (mittlere Grauwert-Differenz aufeinanderfolgender 0,5-s-Bilder, 54×96 px, HUD- und Untertitelband
  ausgeblendet): harte Wechsel (Diff > 50, benachbarte zusammengefasst) **15 → Ø 4,8 s**; zusammen mit Ranschnitten/Nahen
  (Sichtzählung der Standbilder: 23 Einstellungen) **Ø ≈ 3,1 s** → im Ziel 3–4 s, kein Schnitt < 1,5 s. Längste Strecke ohne
  harten Wechsel: rehook 24,8–30,8 s (Hängematte, mit Kamerafahrt, Schild und Ast-Bruch – kein Standbild), crooks 9,3–13,8 s
  (Ass aus dem Ärmel 11,9 s). Sichtbare Ereignisse (Diff > 20): 41 → 0,57 je s. Kein ffmpeg-Wert (kein Video) – **Ich kann den ffmpeg-Wert nicht bestätigen**; Schwellen wie bei Lucia R2.
- **Bewegung** (3 Frames in Folge): Whip 2,85 s weich (Unschärfe + Versatz, kein Sprung); Pinnwand 34,0 s langsamer Push-in
  (~1–2 px/Frame) – ruhig ✔; Brett 50,0 s fast still (Rote-Faden-Animation) ✔.
- **HUD-Kontrast** (weiß gegen Platte, 99-%- gegen 25-%-Quantil im HUD-Feld, 64 Standbilder): Tiefstwert **10,0 : 1**
  (Papier „PAGE 2“ 31,9 s), dann 14,7 : 1 (Holz 61,8 s), Median 19,7 : 1 → Ziel ≥ 4,5 : 1 überall ✔. 70,8 s blendet aus (`hideBeat`) ✔.
- **Auswahlkarten**: 62,34–65,78 s = **3,4 s** stehend, zentriert, „COMMENT A OR B“ ✔ (Lucia R2 nicht wiederholt).
- **Cover**: Bilder 0–14 ohne Untertitel ✔ (erstes Wort „the“ ab 0,36 s wird erst nach dem Cover gezeigt, 0,40/0,47 s geprüft),
  Titel gelb 2 Zeilen, oberes Drittel ✔. Aber Bild 12–14 Augen zu (`blinkAt(f, 11)` im `SplitArt`/`Toon`) → D1.
- **Andere Clips**: gemeinsame Dateien seit `b1ade42^` (Diff gelesen): `hud.tsx` neues `maxWidth` (ohne Wert = 104 px wie bisher),
  `Episode.tsx` reicht nur durch, `scenes/index.ts` nur Registrierung. Standbild Lucia 28,4 s: HUD-Platte, Schrift 104 px wie Runde 2;
  Jensen 10,0 s: HUD ohne Platte wie gewohnt → **unverändert** (Code + Sicht, kein Pixel-Vergleich). Hinweis: Arbeitskopie enthält
  fremde, nicht committete Änderungen (`Captions.tsx` Variante „word-by-word-yellow“, `Episode.tsx`, `zeit-welt`) – Variante ist
  optional, Lucia/Jensen zeigen die alten Untertitel.

## Befunde
| # | Szene / s | Problem | Vorschlag | Prio |
| --- | --- | --- | --- | --- |
| R1 | couple 52,3–53,3 s („in Florida's“) | **Leeres Türkis-Bild ~1 s**: Einstellung C zeigt ohne `floridaSat`-Datei nur die Fläche; die Karte blendet erst ab `twin − 8` (53,1 s) ein und ist bei 53,2 s weiß auf Türkis kaum sichtbar. Fallback zeichnet „nichts“ statt Cartoon-Ersatz (widerspricht dem Kommentar in `jasonSets.tsx`). | Ohne echtes Bild Karte schon ab `cutC` zeigen (Opazität 1 ab Schnitt, auf „twin“ nur Pop/Pin), Kontur dunkel; oder Cartoon-Polaroid „FLORIDA“ (Halbinsel-Umriss) als Ersatz links. | **P1** |
| D1 | Cover 0,40–0,47 s (Bilder 12–14) | Jason **blinzelt im Thumbnail-Fenster** – 3 von 15 wählbaren Bildern zeigen geschlossene Augen; wer am Ende des Schiebers wählt, bekommt ein schlafendes Gesicht. | Im Cover (`f < 15`) kein Blinzeln: `blinkSeed` so wählen bzw. `eyes="open"` erzwingen, bis Bild 20. Cover-PNG danach neu ziehen. | **P1** |
| D2 | ganzer Clip | **Keine echten Bilder/Videos**: `REAL = {}`, keine `docs/bildnachweise-jason-gta6.md`; alle 7 Slots (keysWater, keysAerial, beach, beachHouse, floridaSat, marina, storm) zeigen Cartoon. Regel „Echte Bilder und Videos – Pflicht“. | Wenn Download weiter gesperrt: Freigabe muss das begründen (Beleg `out/commons-jason.log`, 403) und Bildnachweis-Datei mit „nicht geladen“ anlegen. Sobald möglich: mindestens keysAerial + floridaSat (NASA/NOAA, gemeinfrei). Der Clip trägt ohne Fotos ≥ 9 **nur**, wenn R1 behoben ist. | **P1** (Begründung) |
| R2 | trailer 41,6–44,5 s („up on a roof“) | Kein Dach lesbar: `Roof` ist eine beige Fläche auf Höhe des Meereshorizonts – Jason steht scheinbar auf einer Promenade am Strand. Verb „oben auf dem Dach“ fehlt (Regie-Prüffrage „sieht man das Verb?“). | Dachkante mit Regenrinne/Schindeln ins Bild, Horizont + Palmenkronen **unter** die Kante (Kamera leicht von unten), oder Leiter am Rand. | P2 |
| R3 | play 62,3–63,5 s | Titel „WHO DO YOU PICK?“ läuft durch Jasons Kinn und Lucias Mund; Karten verdecken beide Körper (Lucia-Rest N2 wiederholt). | Figuren ~60 px höher oder Titel/Karten ~60 px tiefer (Kartenunterkante ≤ y 1300). | P2 |
| D3 | loop 66,7–68,5 s | „NOV 19“-Sticker doppelt zum Kalenderblatt „NOV 19“ (Lucia-Fehler D4 „Sticker + Stempel mit gleichem Wort“ wiederholt); beim Ausblenden schrumpft er zu einem 20-px-Schnipsel über dem Bild (68,5 s). | Sticker weglassen oder anders („FINAL DATE?“); Kalender trägt die Zahl. | P2 |
| R4 | keys 17,7–20,0 s | Karte ohne Beschriftung: Kette heller Ovale + rote Strichlinie liest sich ohne Ton als Perlen/Steine, nicht als Inselkette; „LEONIDA KEYS“ kommt erst 23,1 s am Steg. | Kleines Label „THE KEYS“ an der Inselkette (oder Sticker schon hier), Inseln mit Palmen-Punkten. | P3 |
| D4 | hook, Cover, loop (Nahen) | Dreitagebart als Punktraster um den Mund wirkt in Großaufnahme wie Ausschlag/Sommersprossen. | Bartschatten als flache, halbtransparente Fläche (ein Ton dunkler) statt Punkte; Punkte nur in kleinen Totalen. | P3 |
| D5 | circle 33–40 s | Angeschnittenes Polaroid oben rechts („JA…“, x > 1000) wirkt wie Fehler. | Ganz ins Bild oder ganz raus. | P3 |
| R5 | loop 66,0–68,5 s | Jason steht am linken Rand (Hand bei x ≈ 14 px, Lucia-Rest N1 knapp nicht wiederholt, aber außerhalb sicherer Zone ~60 px). | Figur ~60 px nach rechts. | P3 |

## Bestanden
- Thumbnail 0–0,5 s: Titel „WHO IS JASON?“ + Unterzeile, geteiltes Bild Armee | Keys erzählt die Frage ohne Ton ✔ (nur D1).
- Loop: 72,3 s = Cover-Motiv ohne Titel/HUD, Rückfahrt aus dem Polaroid ✔.
- Untertitel-Zone (y ≈ 1300–1520) überall frei; keine Pill/kein Sticker darin.
- Schnitte auf Cue-Wörter: Army-Stempel, Rewind, Ass „crooks“, Tür „behind“, CARGO „runners“, Ast „harder“, Brian, Cal-Vorhang „Paranoid“, Leck „leaks“, Lucia am Tor, roter Faden „couple“, Stempel TOUGH/VULNERABLE/FLAWED, Heiligenschein „do-gooders“, Kalender.
- Hauptfigur in jeder Szene sichtbar (Lücke nur 52,3–54,7 s Karte).
- Bild-Hinweise Faktenprüfung (`quellen-jason-gta6.md`): keine Rockstar-Logos/GTA-Schriftzug, kein Trailer-Standbild nachgebaut (Dach/Tor eigene Bildideen), Armee-Jacke ohne Abzeichen/Rang, Drogen nur Kiste „CARGO“, Gauner gesichtslos ohne Waffen, Lucia im Cartoon-Look des Lucia-Videos und nicht größer als Jason, HUD „WORKED FOR RUNNERS“ (P2 ✔), keine Funk-Szene bei Cal ✔.
- Lucia-Lehren: HUD-Platte, Karten ≥ 2 s und zentriert, Lucia+Jason in `play`, keine Pills in fremden Einstellungen, kein Konfetti durch den Titel – erfüllt.
