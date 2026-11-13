# Rolle: Szenen / Animation

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
3D-Szenen (`src/episode/scenes/<thema>*.tsx`) mit Kamera, Bewegung, Schnitt auf Beats. Prüfer: Regie-Kritiker.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Nichts Wichtiges außerhalb des Bildes, Untertitel-Zone frei
- Bewegung in jeder Einstellung (keine Standbilder > 1,5 s)
- Schnitt alle 2,5–3,5 s (Referenz R2/R3), auf Wort-Cues
- Figuren spielen (Gestik, Mimik passend zum Satz)
- Kamera: Wechsel Halbnah ↔ Totale, Ranfahrten bei Pointen

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Vor dem Auftrag `docs/trends/aktuell.md` lesen (tägliche Trend-Analyse, Vorgabe Nutzer 12.11.2026) und passende Erkenntnis als Experiment nutzen.
- Alles aus `useCurrentFrame()`, nie `useEffect`.
- Hochformat: vertikaler Bildwinkel klein → Objekte enger staffeln.
- Liegende/gekippte Figuren: Körperlänge nach der Drehung berechnen.
- Erster Frame jedes Stickers prüfen (Spring-Überschwinger).
- Köpfe vor dunkle Flächen stellen (Rom: Arkaden).
- Kamera nicht schätzen, sondern aus dem Bildziel rechnen: `aim(kopf, H, yf, xf, dir)` in
  `scenes/romeSets.tsx` (H = sichtbare Bildhöhe in Einheiten, fov 40 → Abstand H/0,728).
  Bei Pills: Kopf mit `under(pillY, H)` direkt unter die Pill-Spitze legen.

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 13.11.2026 · Jensen Huang (2D Paper-Cut-Satire) v1 · **Experiment Re-Hook-Rückfahrt statt Schnitt:** in `crash` fährt die
  Kamera nach „Tuesday“ vom Terminal (Zoom 1,1) auf 0,72 zurück und enthüllt den knienden Investor + Gebets-Caption – liest
  sich im Kontaktabzug als neue Einstellung ohne Schnitt; erste Fassung (Zoom 0,6) machte Chart + Figur zu klein → ≥ 0,7.
  9 Szenen, 17 Einstellungen/Fahrten auf 72,4 s (Ø ≈ 4,2 s). Loop: Endbild = Cover-Komponente (`CoverScene` in
  `scenes/huang2.tsx`, auch `coverArt`), Auswahlkarte `untilBeat: loopToSunday` (Drehbuch + timeline). Fallen: Cover-Titel
  mit 5 Wörtern bricht auf 4 Zeilen + Unterzeile bis y ≈ 880 → Motiv darunter legen (Kalender wanderte sonst unter die
  Unterzeile); Pill-Text 44 Zeichen lief aus dem Bild, `measureText` unterschätzt → `overlays/Pill.tsx` schrumpft Schrift
  (Zeichen-Schätzung 0,72 em als Untergrenze, kurze Pills unverändert); `&` hinter `cd … && S=…` schickt die ganze Kette
  in den Hintergrund (Variable fehlt in der Warteschleife). **Offen:** Cue-Abstände laut Drehbuch n 38, Ø 1,88 s, Median 1,64,
  15 < 1,5 s (z. B. hook „Thursday“→„gone“ 0,72 s, pr 0,65 s) – nicht im Code lösbar, UFC-Methode (Cues verlegen + `--retime`)
  nötig. Neu in `huangSets.tsx`: `Jensen` (Karikatur, `vanish` → leere Jacke am Bügel), `ThumbStamp`, `FlipPhone`,
  `GpuBuddy`, `StockChart` (`upto` = Punkt-Index), `Ticker`, `Receipt`, `ChipShelf`, `MilkCarton`, `Stopwatch`, `GreySil`.
  Beleg `out/jensen-huang-contact.jpg`, `out/jensen-huang-fix.jpg`, `out/jensen-huang-fix2.jpg`.
- 12.11.2026 · Rolls-Royce (2D) v2 nach Regie-Kritik 6/10 (neue Erzähler-Tonspur 92,7 s) · **Experiment UFC-Methode
  übernommen (Cues verlegen statt Schnitte ändern):** 7 reine Beat-/SFX-Cues entfernt (Animation per `W("wort")` aus
  captions.json), 15 Cues auf Nachbarwörter gelegt (z. B. Startschuss „minute“ statt „Go!“ am Szenenende, Haken auf „Done?“),
  `--retime` ohne Neuvertonung, Text unverändert. Abstände (Szenenstart + Cues > 0,3 s + Szenenende): vorher n 49, Ø 1,88 s,
  Median 1,68, 21 < 1,5 s → nachher n 40, Ø 2,30, Median 2,08, **1 < 1,5 s** (hood 1,46 s), max 4,07. Fallen: Wenn ein Cue
  vom Wort wegrückt, muss die Animation getrennt am Wort bleiben (Preisschild am Cue, Portemonnaie auf „Optional“); Freeze
  und HUD-Wechsel im selben Bild = Flip-Animation liest sich als „doppeltes HUD“ → HUD-Wechsel auf einen anderen Cue;
  Auswahlkarte + Sticker belegen y ≈ 400–1266 → kleine Figur (s 0,25) links neben den Kartentitel statt ins Band.
  Weitere Fixes: Label hood endet am neuen Beat `wingsPoint`, Kamera fährt ab Szenenstart an die Haube, Figur/Auto im Bild
  (hood, suite), Meme-Karte „nobody:“ gefüllt, Stichreihen groß (burgund auf Twill) + Nadel 1,35× · `out/rr-kontakt-v2.jpg`,
  `out/rr-fix-v2.jpg`.
- 12.11.2026 · UFC (2D) v2 nach Regie-Kritik 6/10 (neue Erzähler-Tonspur 110,7 s) · **Ereignis-Abstände misst man an
  den Cues, nicht an den Schnitten:** Schnitte lagen schon bei ≈ 3–4 s, unruhig machten die Cue-Ereignisse (Sticker/Label/
  Beat + SFX). Cues nur im Drehbuch auf andere Wörter gelegt bzw. zusammengelegt (5 Cues entfernt, Animation im Code an
  den Nachbar-Beat gekoppelt, z. B. `drop = march + 10`, `clip = tape + 14`), Text unverändert, `--retime` ohne Neuvertonung.
  Abstände (Szenenstart + Cues > 0,3 s nach Start + Szenenende): vorher n 49, Ø 2,24 s, Median 2,10, 16 < 1,5 s, max 5,98 →
  nachher n 43, Ø 2,56 s, Median 2,35, **0 < 1,5 s**, max 4,72. Weitere Fixes: Auswahlkarte `untilBeat: loopToCage`
  (Endbild = Hook-Bild), Waage s 0,3 ins Band y ≈ 590; HUD/Sticker erst nach Cover-Ausblendung (`coverClear` in
  `overlays/Cover.tsx`, gilt für alle Clips); Sprechblase aus dem Label-Stapel (y 960); Label tuf y 0,42 + Leuchtschrift
  y 600; RULES-Blatt y 640/s 0,6. Rest: Start-Oktagon in den ersten ≈ 1 s noch fast leer (Kämpfer laufen erst ein) ·
  `out/ufc-kontakt-v2.jpg`, `out/ufc-fix-v2.jpg`. Hinweis: `make_episode.py --retime` importiert kokoro – ohne Paket
  per Stub-Modul `tts` aufrufbar.
- 12.11.2026 · UFC (2D) v1 · **Ruhiges Tempo von Anfang an:** 11 Szenen, 26 Einstellungen bei 80,6 s → im Mittel ≈ 3,1 s,
  kürzeste ≈ 1,9 s (boom „2013“) außer Loop-Wipe am Ende (≈ 0,9 s); Ortswechsel in einer Szene als Prospekt, der hinter dem
  Käfig herabfällt (rules: Büro), statt Schnitt – die Pill bleibt dabei korrekt an der Figur. Alle Zeiten aus Beats/Wörtern
  (`useBeats` in `scenes/ufcSets.tsx`). Neu im Motor (additiv): `EpisodeConfig.labelUntilWord` (Pill endet am ersten Vorkommen
  eines Worts aus captions.json, nur Pills davor) – nötig, wenn kein Beat am Einstellungswechsel liegt (boom: Boss-Pill vs.
  Kämpferinnen). Fallen: Pill (x 0.5/y 0.36) verdeckt alles zwischen y ≈ 600–691 → Schilder darüber oder darunter; Auswahlkarten
  (594–1266) verdecken Bildmitte bis Szenenende → Motiv dahinter nur als Rahmen. Cues am Szenenende (boom „fight“, 0,4 s vor
  Schnitt) erzeugen Sticker/Pill mit < 0,5 s Standzeit – Drehbuch-Cue früher legen. Beleg `out/ufc-contactsheet.jpg`.
- 12.11.2026 · Rolls-Royce (2D) v1 · **Experiment ruhiges Bildtempo von Anfang an:** 22 Einstellungen auf 72,2 s
  (Mittel ≈ 3,3 s; nur der Rückspul-Loop am Ende < 1,5 s), Pointen über Requisiten-Timing (Stempel, fallendes Schild,
  Karte dreht sich, Brille fällt) statt Schnitt; Ortswechsel in einer Szene als weiche Kamerafahrt (pick: Schwenk
  Phantom → Ghost, hood: Ranfahrt an die Haube). Fallen: Pill (label) zeigte nach Schwenk auf das falsche Auto →
  Schwenk erst am Beat starten, an dem die Pill endet (`labelUntil`); Preisschild im Dach lag unter dem Sticker
  (y < 560 im Bild) → tiefer; Auswahlkarte (choice) deckt im Finale Figur + Kritzel → Kritzel ab dem Beat ausblenden.
  Alle Zeiten aus `useBeats` (B/W, scenes/rollsSets.tsx). Beleg `out/rolls-royce-contactsheet.jpg`.
- 12.11.2026 · Mike Tyson (2D) v3 · **Nutzer empfindet 1–3-s-Schnitte als zu hektisch** (Freigabe 2 „Nicht OK“:
  „etwas langsamer … angenehmer zum Schauen“). Umbau: 33 → 24 Einstellungen, im Mittel ≈ 3,0 s (vorher ≈ 2,2 s);
  Ortswechsel innerhalb einer Szene als Überblendung (zwei `Stage2D` übereinander mit Deckkraft, z. B. Gold-Arena,
  Bankrott-Nacht) bzw. Prospekt-Überblendung statt Whip/Wipe; Kamera nur noch `ease(…, "inOut")` über die ganze
  Einstellung, Rucke halbiert, `anticipate`-Zooms entfernt; exodus als eine durchgehende Fahrt. Alle Zeiten aus
  Beats (`B`, Ersatz als Anteil der Szenendauer) und Wort-Zeiten aus captions.json (`W` in `useBeats`, tyson1.tsx),
  damit eine neue, langsamere Tonspur ohne Code-Änderung passt. Noch ungeprüft im Kontaktabzug (Tonspur wird neu erzeugt).
- 12.11.2026 · Mike Tyson (2D) Runde 2 nach Regie-Kritik 6,5 · 8 Befunde: Sticker lief in den nächsten Ort →
  `stickerUntil` (Sticker-Text → Beat); Sitzpose frontal „auf Stelzen“ → verkürzte dicke Oberschenkel + Kniescheiben,
  Hände gefaltet (Standard bei `pose="sit"`); Biss unlesbar → Gegner-Handschuh am Ohr, Ohrstück 2,4×, eigene
  Einstellung Lizenzkarte reißt; liegende KO-Figur: Ausschnitt um 15 % weiter (Zoom 0,86). Selbstprüfung hatte
  Ränder-Anschnitte bei Whip/KO als „vertretbar“ durchgelassen → künftig jeden Anschnitt korrigieren.
- 12.11.2026 · Mike Tyson (2D) · **Experiment Pill-Ende auf Beat** (`EPISODE_CONFIG.labelUntil`, Szene → Beat):
  „HE SAYS“/„SOME SAY“/„HE DENIES IT“ verschwinden vor der nächsten Einstellung, statt auf Strichliste/Balken zu zeigen
  – timeline.json bleibt unverändert. Weitere Funde: Beat-Wörter, die im Satz doppelt vorkommen („years“ in conviction),
  landen auf dem ersten Vorkommen → Zeit aus captions.json ablesen und fest setzen. Liegende Figur (lean −88) ist
  Körperhöhe breit → Kamera vorher auf Kopfposition rechnen (erster Versuch: Kopf außerhalb). Wipe-/Whip-Mitte
  im Kontaktabzug erwischt = leeres Bild; Whip kurz halten (6 Bilder, Versatz ≤ 400). In-Szene-Form-Wipe
  (`GloveWipe`, Bildraum-Ebene depth 0) funktioniert ohne Engine-Änderung. Beleg `out/tyson-contactsheet.jpg`.
- 12.11.2026 · Earth Without Us (2D) · **Standeinstellungen brechen ohne neue Kulisse:** je Szene `shotIndex` mit
  Schnitten auf Wort-Cues und nur die Kamera (`frameOn`, Zoom 1,6–2,5 auf Detail/Gesicht) neu gesetzt – hook, blackout,
  stars, nuclear, satellites, rust, carbon, rushmore jetzt 1,1–3,3 s je Einstellung (vorher bis 9,6 s). Neu: Ampel, Zug,
  CO₂ in `kit2d/props.tsx`. Fallen: Figuren in Parallax-Ebene (depth ≠ 1) landen bei Zoom 2 im Untertitelband → in
  Detail-Einstellungen ausblenden; Karten-Beschriftung nur in der Totale. Label + Sonde: nicht auf den Kreuzungspunkt legen,
  Sonde links / YOU rechts / Label mittig dazwischen. Runde 2: auch Fahrten (swift, voyager, hubble, comeback, lights, moon, ending) gebrochen → alle 16 Szenen ≤ 3,5 s. Dunkle Silhouetten (Hirsch) verschwinden im Detail vor dunklem Grund → Detail auf helle Figur (Fuchs) legen.
  Beleg `scratchpad/before.jpg` gegen `after.jpg`, `out/earth-contact.jpg`.
- 09.11.2026 · MotionKitTest 9–12 · **Experiment Portal-Fahrt** (Tür im Flur → Labor, Bildschirm → Nacht):
  liest sich im Bildstreifen als eine durchgehende Kamerareise ohne Schnitt; Voraussetzung: `look` liegt in der
  Öffnung, die Öffnung leuchtet in der Portal-Farbe, Flugbahn frei (erste Fassung flog durchs Formular).
  Rom pixelgleich (Diff 0, 3 Bilder). 0,85 s/Bild halbe Größe · `scratchpad/portal/portal-streifen.jpg`, `design-system.md` §11.
- 09.11.2026 · MotionKitTest · **Übergänge in einer Canvas funktionieren ohne Überblendung:** Whip
  (6+6 Bilder, Kamera-Yaw 0,55 rad + SVG-Unschärfe bis 90 px) liest sich im Bildstreifen als ein
  durchgehender Schwenk von A nach B; Stern-Wipe, Zoom-Through-Iris, Match Cut auf Großaufnahme und
  Farb-Blitz ebenso. Renderzeit 0,53–0,64 s/Bild (halbe Größe, 2 Läufe) gegen Rom 0,84 s/Bild (1 Lauf) – kein spürbarer
  Aufschlag · `scratchpad/motion/uebergang-*.jpg`, `streifen-gesamt.jpg`.
- 09.11.2026 · MotionKitTest · Parallax-Vordergrund bei depth 2,4–3 und Fahrt 7: Elemente als riesige
  schwarze Flächen, nach 3–4 Bildern aus dem Bild. Mit depth 4,5–5,5, size ≈ 0,4, Fahrt 3 und Elementen
  über die ganze Fahrt verteilt: sichtbar schnellere Ebene als die Säulen · `streifen-parallax.jpg`.
- 09.11.2026 · MotionKitTest · Ausrüstung im Kit (Nutzung `design-system.md` §10): `Shot` mit
  orbit/dollyZoom/anticipate/span/ease, `Toonie` mit blinkSeed/talk/squash/drag/eyePop, `Echo`,
  `Foreground`, `trackShot`, `aimAt`/`screenOf`. Ohne neue Props rendern Rom/Sonnensystem pixelgleich.
- 09.11.2026 · Rom · Geschätzte Kameras waren alle ≈ 1,6× zu nah: Pill „YOU“ lag auf der Stirn,
  „RESPAWN“-Sticker über den Augen, „EMPIRE FOR SALE“-Schild angeschnitten (erster Kontaktabzug,
  Bilder 6/99/193). Ursache: Im Hochformat ist das Bild bei fov 40 nur 0,42·Abstand breit und
  0,73·Abstand hoch. → Helfer `aim()`/`under()`; danach saßen alle 13 Pills über den Köpfen
  (zweiter Kontaktabzug). Halbnah: H ≈ 9–11, Totale H ≈ 13–15, Kopf bei yf ≈ 0,55–0,6.
- 09.11.2026 · Rom · Pills bleiben bis zum Szenenende stehen, auch nach einem Schnitt. Deshalb die
  benannte Figur in **jeder** Einstellung der Szene an dieselbe Bildstelle legen (z. B. Rivale
  hinter der Palisade bei x 0,32 auch in der Finger-Nahaufnahme). Nicht ganz gelöst: „EAST“ in
  split und „ODOACER“ in der Villa zeigen ins Leere.
- 09.11.2026 · Rom · Auswahlkarten (2 Optionen + Hinweis) belegen y ≈ 594–1266 px über die ganze
  Szene `vote`. Freie Fläche nur 400–594 px → YOU dort mit Kopf bei yf ≈ 0,27 (H 15–16).
- 09.11.2026 · Rom · `DangerLight` 4 Einheiten neben der Figur färbt den Kopf ganz rot (GAME OVER,
  Bild 20,3 s). → 5–6 Einheiten seitlich-hinten, Stärke 0,55 + Fülllicht von vorn 0,9 (danach Kopf
  weiß mit rotem Rand). Gleiches Fülllicht in `PalaceSet` für die „fall“-Szenen.
- 09.11.2026 · Rom · Figur von hinten (Villa-Gang) zeigt kein Halstuch → Erkennungsmerkmal weg.
  Hauptfigur nie mehr als ~100° von der Kamera abgedreht.
- 08.11.2026 · Sonnensystem · Tafel/Figur/Sticker angeschnitten (9 s, 66 s, 75 s) → Kamera-Korrekturen be84199.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- NEU: Im nächsten Clip **eine** Portal-Fahrt statt Schnitt an einem Ortswechsel (Tür/Kopf/Bildschirm), Note vom Regie-Kritiker im bewegten Clip; Wort-Untertitel (`captionMode: "word"`) gegen Seiten vergleichen.
- ERLEDIGT (Werkzeug gebaut 09.11.2026, Einsatz im echten Clip offen): Übergänge, Orbit/Dolly-Zoom, Figur lebendig – siehe Gelernt; noch zu messen: Note je Übergang vom Regie-Kritiker, Kopfgröße beim Dolly-Zoom in px (nicht gemessen).
- NEU: Im nächsten Clip je Szenenwechsel einen anderen Übergang aus §10 wählen, Mitte auf Wort-Cue; Match Cut mit `aimAt` (gleiches xf/yf) und mit `screenOf` prüfen.
- NEU: Lippen-Sync aus `voice.wav` (`useWindowedAudioData`) gegen `talkFromCaptions` vergleichen – nur wenn deterministisch.
- (alt) NEU (09.11.2026, aus `docs/animation-techniken.md` Top 1–3): **Übergänge statt Einheits-Blitz** – Whip Pan (6+6 Bilder schneller Schwenk, Schnitt im Blur) und Match Cut (gleiche Form an gleicher Bildstelle via `aim()`), Mitte des Übergangs auf einen Wort-Cue. Messung: Regie-Kritiker im bewegten Probe-Clip, Note je Übergang.
- NEU: **Kamera** `Shot` um Orbit (≤ 100°) und Dolly-Zoom (`fovTo`, Abstand = Breite/(2·tan(fov/2))) erweitern lassen (Werkzeugbau) und je einmal einsetzen; Prüfung: Kopf bleibt beim Dolly-Zoom gleich groß (px im Anfangs-/Endbild).
- NEU: **Figur lebendig**: Follow-through an Halstuch/Antenne (`frame − 3`), versetztes Blinzeln je Figur (heute alle bei `frame % 95`), Lippen-Sync aus `voice.wav`; Prüfung im bewegten Clip.
- Ergebnis Rom (09.11.2026): **Antizipation wirkt.** Finger-Hand (auction, Frames 407/411/416) und
  Stempel (deleted, 2204/2231/2238/2241) holen sichtbar aus, bevor sie zuschlagen. Die Bewegung liest
  sich auch im Standbild als Absicht. Voraussetzung: Das Ausholen muss im Bild bleiben. Beim ersten
  Versuch war der Stempel beim Ausholen oben aus dem Bild. → Kandidat für die Checkliste (1× belegt).
- Ergebnis Rom: **Squash & Stretch bei Steinen wirkt nur bei Größe ≥ 0,34** (≈ 40 px). Bei 0,2 war
  im Kontaktabzug nichts zu erkennen. Mit 0,34 sind die Steine im Flug gestreckt und am Boden gestaucht
  (Frames 568/575). Der Effekt ist schwach, aber sichtbar. Beim Hahn (Pop-in) klar erkennbar (Frame 1072).
- Ergebnis Rom: **Kamera-Wackler** (`jolt`) bei loot/GAME OVER/Nightmare/Stempel. Im Standbild nicht
  bewertbar, erst die Endkontrolle im Video kann das beurteilen.
- NEU: Antizipation auch für Kamera-Ranfahrten testen (vor der Pointe 4 Frames zurück, dann rein).
- NEU: Pills bei Schnitt mitführen. Option `follow` für Szenen mit mehreren Einstellungen prüfen
  (mit Werkzeugbau), statt die Figur in jeder Einstellung an dieselbe Stelle zu zwingen.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 08.11.2026 | Sonnensystem v2 | – | 3 Anschnitte |
| 12.11.2026 | UFC (2D) v1 | 6,0 (Regie) | Cue-Abstände Ø 1,7 s, Karten bis Loop-Ende, Label-Stapel |
| 12.11.2026 | UFC (2D) v2 | – (Selbstnote 7,5, Regie offen) | 0 Cue-Abstände < 1,5 s, 7 Befunde umgesetzt; Start-Oktagon anfangs leer |
| 12.11.2026 | Mike Tyson (2D) v1 | 6,5 (Regie/Design) | Biss unlesbar, Sitzpose, Anschnitte → v2 |
| 13.11.2026 | Jensen Huang (2D) v1 | – (Selbstnote 7, Regie offen) | 15 Cue-Abstände < 1,5 s (Drehbuch), sonst keine Anschnitte |
| 12.11.2026 | Earth (2D) v1 | 6,5 (Regie) | Standeinstellungen > 4 s, Bild ≠ Wort → Korrektur v2 |
| 09.11.2026 | Rom (Szenen v1) | – (Regie-Kritiker steht aus) | Selbstprüfung: 2 Kontaktabzüge, 9 Korrekturen |
| 12.11.2026 | Rolls-Royce (2D) v1 | – (Selbstprüfung 7–8, Regie-Kritiker offen) | 2 Kontaktabzüge, 5 Korrekturen |
| 12.11.2026 | Rolls-Royce (2D) v2 | – (Selbstnote 7,5, Regie offen) | 1 Cue-Abstand < 1,5 s (vorher 21), 6 Befunde umgesetzt; Cover-Auto weiter klein |
