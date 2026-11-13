# Kritik Szenen „Who is Lucia from GTA 6?“ (Regie + Design, 13.11.2026)

Prüfer: Regie-Kritiker + Design-Kritiker (zwei Noten). Grundlage: aktuelles Bundle `LuciaGTA6` (71,72 s), 41 eigene
Standbilder (`--at`, halbe Größe) + 3 Bewegungs-Dreier (je 3 Frames in Folge bei 7,5 s / 28,2 s / 35,0 s / 70,0 s)
+ 4 Nachprüfbilder (14,6 / 62,6 / 67,3 / 68,2 s), `out/lucia-kontakt.png`, `out/lucia-gta6-cover.png`,
`timeline.json`. Bilder: Scratchpad `rk/sheet.jpg`, `rk/motion.jpg`, `rk/g.jpg` (nicht im Repo).
Code nur gelesen.

## Noten
| Rolle | Note | Kurzgrund |
| --- | --- | --- |
| Regie | **7,5** | Ruhige Kamera, motivierte Übergänge (Portal, Umblättern, Whip, Tracking), Loop nahtlos aufs Cover. Aber: Auswahlkarten nur ~1,1 s sichtbar, Hauptfigur 59,9–68,5 s nicht im Bild, Pills ragen in fremde Einstellungen, Familien-Beat ohne Ton unlesbar. |
| Design | **8,0** | 2D-Akten-Look stimmig, Farbwelt konsequent, keine Logos/kein GTA-Schriftzug/kein Trailer-Nachbau, Controller generisch. Aber: Gitterstab genau durchs Gesicht (Cover + 16,5 s), „2025“-Blatt unlesbar, doppelte Sticker+Stempel, HUD auf Papier nur über Kontur lesbar. |

Beide < 9 → Nacharbeit nötig (Mindestnote 9/10). Mit den P1-Punkten erwarte ich Regie 9, Design 9.

## Gemessen
- Beat-Abstände (Szenenstart + `beat`-Cues, `timeline.json`): 39 Abstände, Ø 1,84 s, Median 1,70 s, 17/39 < 1,5 s, längster 5,14 s (hook 1,54→6,68 s, aber mit Kamerafahrt Akte → kein Standbild). Nach Lernpunkt Jensen überschätzt die Beat-Zählung das Tempo; ffmpeg-`scene`-Messung war nicht möglich (Vorschau-Render 0,25× brach nach 10 min ab). **Ich kann den ffmpeg-Wert nicht bestätigen.**
- Bewegung (3 Frames in Folge): Portal 7,5 s weich (Dolly + Überblendung, kein Sprung); Cabrio 35,0 s: Auto ~4 px/Frame, Vordergrund-Palme schneller → Parallax lesbar, ruhig; Umblättern 28,2 s: „2“ blendet sauber ein; Loop 70,0 s: gleichmäßiger Zoom ins Foto. Kamera durchgehend ruhig ✔.
- HUD-Kontrast (Füllung weiß vs. Grund): Papierseite 28,4 s **1,46 : 1**, Gold 47,5 s 3,3 : 1, sonst ≥ 9 : 1. Lesbar nur durch schwarze Kontur (14 : 1 auf Papier).
- Cover: Gitterstäbe bei x = −120 + 300·k (`CoverArt`, `luciaSets.tsx` Z. 668) → Stab x = 480, Lucia bei x = 470 → Stab läuft mittig durchs Gesicht.

## Erledigt seit Ersteller-Hinweis
- „Auswahlkarten verdecken Bildmitte bis 64,4 s“: im aktuellen Bundle **nicht mehr** – Karten 62,24–63,35 s, Kalender ab 63,5 s frei (Standbilder 63,0/63,5/64,0 s). Dafür neues Problem R2.
- „Zellen-Nahaufnahme Kopf nah am HUD“ (19,5 s): Kopfoberkante y ≈ 580, HUD-Unterkante ≈ 290 → ~290 px Luft; HUD steht über dem hellen Fenster, durch Kontur lesbar. **Kein Muss mehr.**

## Befunde
| # | Szene / s | Problem | Vorschlag | Prio |
| --- | --- | --- | --- | --- |
| D1 | Cover 0–0,5 s (+ Loop-Ende 69,7–71,7 s) | Gitterstab (x 480) läuft mitten durchs Gesicht, verdeckt ein Auge – als Vorschaubild schwächt das genau das Wiedererkennungs-Merkmal. Schwacher Geister-Bogen (Büroklammer?) oben links bei x≈200, y≈120. | `CoverArt`: `Bars x0={-130} n={4} gap={400}` → Stäbe bei 270/670, Gesicht (≈305–635) frei; Klammer im Cover ausblenden. Danach Cover-PNG neu ziehen (Bild 5 aus aktuellem Bundle). | **P1** |
| R1 | family 14,1–16,0 s („fighting for her *family*“) | „Familie“ ist ein rosa-violetter Unschärfe-Fleck → liest sich ohne Ton als Rauch/Aura, nicht als Familie (Themen-Treue-Test fällt). | Ohne zählbare Köpfe, aber erkennbar: z. B. Schatten mehrerer Hände/Arme von hinten ins Bild, oder warmes Fenster eines kleinen Hauses hinter ihr, oder angeschnittene Schulter-Silhouetten am Bildrand (nie ganz zählbar). | **P1** |
| R2 | play 62,24–63,35 s | Auswahlkarten „WHO DO YOU PICK?“ nur ~1,1 s sichtbar, fahren bei 62,6 s noch angeschnitten von links ein (A-Karte ab x<0), dann harter Szenenwechsel → Kommentar-Aufruf nicht lesbar. Karten zudem links versetzt (Mitte ≈ x 490 statt 540). | Karten mindestens 2,0–2,5 s stehen lassen: in `loop` über den Szenenstart bis ~64,3 s halten, aber **unten-mittig klein** (über y 1300 enden, Kalender oben frei) oder `pickCards` früher (auf „play“, ≈60,9 s). Karten zentrieren. | **P1** |
| R3 | play + loop 59,9–68,5 s | Hauptfigur 8,6 s nicht im Bild (Controller, Kalender) – längste Lücke, roter Faden reißt kurz vor Schluss. | In `play` Lucia (und Jason klein) als Figuren-Auswahl neben/auf den Karten zeigen; im Kalender Lucia klein am Rand, die das Blatt abreißt. | **P1** |
| D2 | loop 66,6–67,6 s | „2025“-Blatt (Faktenhinweis P29) unlesbar: rotes X + DELAYED-Stempel liegen genau über der Jahreszahl („20?5“), Kopf „WIN…“ abgeschnitten; „MAY 26“ ebenso halb verdeckt. „DELAYED ×2“-Sticker überdeckt die Blatt-Köpfe. | Stempel unter die Jahreszahl/schräg in die untere Blatthälfte, X dünner (halbe Deckkraft); Blätter ~15 % größer; Kopf „WINDOW“ ganz oder weglassen; Sticker höher (y ≤ 330). | **P1** |
| R4 | heist 40,0 s | Pill „BANK JOB: FAILED“ steht nach dem Schnitt auf die Karte weiter und verdeckt den Kartennamen („LEONI…“); Karte 39,9–41,4 s leer (nur ein Punkt), Fäden erst ab 41,42 s. | Pill bei Karten-Schnitt ausblenden oder Karte erst auf „run“ (≈40,4 s) zeigen; erste Fäden schon beim Schnitt anlegen. | P2 |
| R5 | loop 68,2 s | „DELAYED ×2“ ragt in die Rückfahrt zur Akte (über dem Foto). | Sticker bis Kalender-Ende begrenzen (vor `loopToCover`-Bewegung ausblenden). | P2 |
| R6 | hook→dad 7,5–7,7 s | Untertitel „her there?“ kollidiert mit dem Akten-Feld „NAME: LUCIA“ (Text auf Text); „WHY?“-Sticker steht noch über der Box-Szene. | Akte während Portal-Fahrt so skalieren, dass Feld NAME über y 1300 bleibt, oder Feld ausblenden; WHY? vor Portal-Start ausblenden. | P2 |
| D3 | family 16,5 s („Penitentiary“) | Gitterstab läuft wieder durchs Gesicht, genau auf dem Schlüsselwort; HUD-Roll FIGHTER→INMATE liegt hinter/zwischen Stäben (halb lesbar). | Stäbe so setzen, dass Gesicht zwischen zwei Stäben steht (`lucia1.tsx` Z. 307 `x0`); HUD über die Stäbe legen. | P2 |
| D4 | hook 2,0 s, flawed 54,0 s | Doppelung Sticker + Stempel mit gleichem Wort („SERVED TIME“ ×2, „TOUGH“ ×2) – wirkt wie Fehler, kostet Fläche. | Sticker-Text weglassen, wenn ein Stempel dasselbe sagt (`sticker` aus Cue entfernen) oder Sticker anders („IN PRISON?“). | P2 |
| D5 | rehook 27,7–29,2 s (Papierseite), first 46–51 s (Gold) | HUD weiß auf Creme 1,46 : 1, auf Gold 3,3 : 1 – nur über Kontur lesbar. | HUD-Hintergrundplatte (dunkle Pille, 60 % Deckkraft) wie bei Jensen-Befund; gilt fürs Kit. | P2 |
| D6 | play 60,5–63,0 s | Konfetti-Strom läuft senkrecht durch „CASE FILE: LUCIA“ und „WHO DO YOU PICK?“. | Konfetti seitlich/hinter Karten (z-Reihenfolge), nicht durch Titel. | P3 |
| D7 | jason 35–37,6 s | Paar im Cabrio nur als ~40 px hohe Silhouetten – Lucia (Hauptfigur) nicht erkennbar. | Kurze Nahe im Auto (türkises Band sichtbar) oder Kamera näher (Auto ×1,5). | P3 |
| D8 | flawed 58,5 s | Schild „RIGHT“ liegt über Lucias Hand. | Waage ~60 px nach rechts. | P3 |
| R7 | Loop-Naht 71,7 → 0,0 s | Letztes Bild zeigt HUD „PLAYABLE“, erstes Bild kein HUD + Titel → kleiner Sprung bei Wiederholung. | HUD ab `loopToCover` ausblenden (69,7 s). | P3 |

## Bestanden
- Thumbnail 0–0,5 s vorhanden: Titel „WHO IS LUCIA?“ gelb, groß, oberes Drittel, ohne Untertitel; Thema (Gefängnis + Florida-Abend + Name) ohne Ton klar – nur Gesicht (D1).
- Untertitel-Zone (y ≈ 1300–1420) überall frei außer R6.
- Schnitte auf Cue-Wörter (time, fight, family, luck, easy, story, Jason, couple, wrong, first, optional, 19th) – Bild zeigt jeweils das Verb.
- Keine Rockstar-Logos, kein GTA-Schriftzug-Nachbau, eigenes Auto, generischer Controller, graue Platzhalter-Rahmen statt Ex-Protagonisten, keine Waffen. Boxhandschuhe nicht als „Boxerin“ beschriftet (P7 ✔). Familie ohne zählbare Köpfe (P11 ✔, aber R1).
- Übergänge: Portal, Whip (22,9 s), Umblättern, Spotlight (43,5 s), Tracking + Parallax – alle ruhig.
