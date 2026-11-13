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

## Runde 2 (Szenen v2, Commit eed81b4, 13.11.2026)

Grundlage: neues Bundle, 30 Standbilder an den Befund-Stellen + Stichproben (`--at`, halbe Größe), 143 Bilder im
0,5-s-Raster (0,2×) für die Tempo-Messung, `out/lucia-gta6-cover.png` (stimmt mit Bild 3 des Bundles überein,
mittlere Abweichung 2,5–3,7 Grauwerte = JPEG/Skalierung), `out/lucia-kontakt.png` (11:16, aktuell). Code nur gelesen.

### Noten
| Rolle | Runde 1 | Runde 2 | Kurzgrund |
| --- | --- | --- | --- |
| Regie | 7,5 | **9,0** | Alle P1/P2 behoben: Karten 60,7–63,4 s (≈ 2,6 s, zentriert, „COMMENT A OR B“), Lucia + Jason in `play`, Lucia im Kalender, Familie lesbar (Haus + Arme vom Rand), Pills enden rechtzeitig, Loop-Naht ohne HUD. Einstellungstempo im Ziel. |
| Design | 8,0 | **9,0** | Cover-Gesicht frei, „2025“/„MAY 26“ lesbar, keine Doppel-Sticker, HUD-Platte ≥ 6 : 1, Cabrio-Nahe mit erkennbarer Lucia. Nur Kleinigkeiten (Bildrand, Karten-Mitte). |

Beide ≥ 9 → aus Regie-/Design-Sicht freigabefähig.

### Messwerte
- **HUD-Kontrast** (weiße Füllung gegen Platte/Grund, alle 30 Standbilder): min. **6,0 : 1** (Papierseite 28,4 s, vorher 1,46 : 1), Gold 47,5 s 9,7 : 1, Holz/Haus 7,7–11,8 : 1, sonst 15–19 : 1 → Ziel ≥ 4,5 : 1 überall erfüllt. 71,6 s: HUD ausgeblendet (`hideBeat: "loopToCover"`) ✔.
- **Bildwechsel-Tempo** (Mittelwert-Differenz aufeinanderfolgender 0,5-s-Bilder, HUD- und Untertitelband ausgeblendet, 54×86 px): Einstellungswechsel (Diff > 50, benachbarte zusammengefasst) **≈ 19 in 71,7 s → Ø ≈ 3,7 s** → im Ziel 3–4 s. Sichtbare Bild-Ereignisse (Diff > 20, inkl. Sticker/Stempel/Fahrten): 57 → **0,8 je s** (Ø 1,24 s). Längste ruhige Strecke: Akte 1,3–6,2 s (Kamerafahrt, kein Standbild). Methode ersetzt ffmpeg `scene` (kein Video vorhanden), Schwelle ist eine Annahme – **kein ffmpeg-Wert, das kann ich nicht bestätigen**.
- **Gemeinsame Dateien** (`Episode.tsx`, `kit2d/hud.tsx`, `scenes/index.ts`, Diff gelesen): neue Felder `plate` (Standard `false`), `hideBeat` (Standard undefiniert → Deckkraft 1), `stickerMax` (Standard `?? 54` = alter Wert). Nur `lucia.tsx` setzt sie; Huang/Tyson/UFC/Rolls/Earth nicht. Standbild `JensenHuang` 10,0 s: HUD ohne Platte, Sticker/Layout wie gewohnt → **andere Clips unverändert** (Code-Lesung + 1 Standbild; kein Pixel-Vergleich, da kein Vorher-Bild).

### Status der 15 Befunde
| # | Status | Beleg |
| --- | --- | --- |
| D1 Cover-Stab | erledigt | 0,1 s / 71,6 s: Gesicht zwischen zwei Stäben, keine Klammer |
| R1 Familie | erledigt | 14,6 s: Haus mit Fenstern + Arme/Schultern vom Rand, keine zählbaren Köpfe (P11 ✔) |
| R2 Karten | erledigt | 61,5–63,3 s zentriert, ≈ 2,6 s stehend, Aufruf „COMMENT A OR B“ |
| R3 Lucia fehlt | erledigt | 60,5 s Lucia + Jason; 64–68 s Lucia neben Kalender |
| D2 2025-Blatt | erledigt | 67,3 s „WINDOW 2025“ und „DATE MAY 26 2026“ lesbar, Stempel unter der Zahl (P29 ✔) |
| R4 BANK-Pill | erledigt | 40,0 s Pill über der Bank, Karte später |
| R5 DELAYED-Pill | erledigt | 69,9 s kein Sticker über dem Foto |
| R6 Portal-Kollision | erledigt | 7,5 s Untertitel frei, WHY? weg (`stickerMax`) |
| D3 Stab 16,5 s | erledigt | Gesicht zwischen Stäben |
| D4 Doppel-Sticker | erledigt | 2,0 s / 54,0 s nur Stempel |
| D5 HUD-Kontrast | erledigt | s. Messwerte |
| D6 Konfetti | erledigt | 61,5 s Konfetti am linken Rand, nicht durch Titel |
| D7 Cabrio | erledigt | 35,5 s Nahe, Lucia (türkises Band) erkennbar |
| D8 RIGHT-Schild | erledigt | 58,5 s frei |
| R7 Loop-Naht | erledigt | HUD blendet ab 69,7 s aus |

### Rest-Befunde (kein Muss für 9)
| # | Szene / s | Problem | Vorschlag | Prio |
| --- | --- | --- | --- | --- |
| N1 | loop 64,0–65,0 s | Lucia steht am linken Bildrand, ihre Hand ist bei x = 0 angeschnitten. | Figur ~40 px nach rechts. | P3 |
| N2 | play 61,5–62,5 s | Kartenblock ≈ 38 px links der Mitte; Karten verdecken die Körper von Lucia/Jason (Köpfe frei). | Block auf x 540 zentrieren; Figuren 40 px höher oder Karten etwas tiefer (Unterkante ≤ y 1300). | P3 |
| N3 | family 16,5 s | HUD-Wechsel FIGHTER→INMATE steht genau im Moment des Standbilds halb gerollt (Animation, kein Fehler). | – | info |
