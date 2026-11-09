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
- Alles aus `useCurrentFrame()`, nie `useEffect`.
- Hochformat: vertikaler Bildwinkel klein → Objekte enger staffeln.
- Liegende/gekippte Figuren: Körperlänge nach der Drehung berechnen.
- Erster Frame jedes Stickers prüfen (Spring-Überschwinger).
- Köpfe vor dunkle Flächen stellen (Rom: Arkaden).
- Kamera nicht schätzen, sondern aus dem Bildziel rechnen: `aim(kopf, H, yf, xf, dir)` in
  `scenes/romeSets.tsx` (H = sichtbare Bildhöhe in Einheiten, fov 40 → Abstand H/0,728).
  Bei Pills: Kopf mit `under(pillY, H)` direkt unter die Pill-Spitze legen.

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
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
| 09.11.2026 | Rom (Szenen v1) | – (Regie-Kritiker steht aus) | Selbstprüfung: 2 Kontaktabzüge, 9 Korrekturen |
