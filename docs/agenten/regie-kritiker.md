# Rolle: Regie-Kritiker

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Prüft Szenen per Kontaktabzug (alle 3 s) und Einzelbildern: Bildausschnitt, Lesbarkeit ohne Ton, Tempo, Schnitt.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Befund mit Sekunde + Standbild
- Schnittfrequenz gemessen (ffmpeg scene > 0,12)
- Vergleich mit Referenzwerten

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Zuerst ohne Ton ansehen: Versteht man jede Einstellung?
- Dann mit Untertiteln: verdeckt etwas?
- Von Retention-Kritiker: Kontaktabzug in der Reihenfolge erste 3 s → Schluss/Loop → Mitte prüfen (`agenten/retention-kritiker.md`) (übertragen vom Wissensverwalter 09.11.2026).
- **Pills gelten bis Szenenende** (`Overlays.tsx`: Dauer = Szenenende − Cue). Für jede Pill jede *spätere* Einstellung der Szene prüfen: Steht dort das benannte Ding unter der Spitze? Wenn nicht, Kamera per `aim(kopf, H, under(pill.y, H), pill.x)` am Ding verankern (Rom 09.11.: RIVAL, EAST, ODOACER, ROME (ROOSTER)).
- **Belegte Bildzonen bei Auswahlkarten** (2 Optionen + Titel + Hinweis): Karten y ≈ 594–1300, Sticker y ≈ 430–560 / x 180–900, HUD bis y 400 → freies Band y 400–594. Figur dort klein (H ≈ 18–20 bei Kopf-yf 0,258), mit Sticker am Rand (xf ≈ 0,885).
- Vor dem Rendern Bildpositionen mit einer Projektion nachrechnen (Mathematik von `aim`); spart Render-Runden (Rom: 2 Prüfrunden à 20/5 Bilder statt Versuch und Irrtum).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 09.11.2026 · Rom v3 (Neuvertonung 133 s) · Nach Neuvertonung Beat-Abstände per Skript aus `timeline.json` je Szene listen (Δ zwischen Cues) und gegen Wortzeiten in `captions.json` legen: findet stehende Einstellungen (vote S0 4,8 s, vandals 4,4 s) und zu späte Beats (roofOff auf „roof.“ statt „rip“) ohne Render; Pills, die früher am Ding verankert waren, zeigen bei neuem Timing wieder ins Leere (EAST über Hahn 57,0 s); Overlay-Karten (Choice) laufen über den Loop-Schuss → Endbild ≠ erstes Bild · `out/rom-v3-kontakt.jpg`, `out/rk-v3.jpg`
- 09.11.2026 · Probe `MotionKitTest` · Bewegung im Streifen (6–30 fps) statt Einzelbild bewertet. Noten: Whip 8, Spotlight 8, Blinzeln 7, Wipe 7, Augen-Pop 7, Zoom-Through 7, Orbit 7, Mund 6, Squash 6, Match Cut 6, Tint 6, Color Script 6, Dolly-Zoom 6, Fog 5, Antizipation 5, Parallax 5→7, Echo 5→7, Rim 3→6; alter Weiß-Blitz 4 (im Streifen kaum sichtbar, nur Weichzeichnen). Behoben: Rim als Fresnel-Kante (`RimContext`), Parallax-Untertitel-Schutz (`captionBand`), Echo `step` 4. Rom 3 + Sonne 2 Standbilder Diff 0 · `scratchpad/motion/kritik-check.jpg`, `kritik-rim.jpg`, `uebergaenge-alle.jpg`
- 09.11.2026 · Probe · Echo mit kleinem Abstand je Nachbild (Tempo × step < ½ Körperbreite) wirkt als Leuchten/Schein, nicht als Nachbild · `kritik-check.jpg` 9,3 s
- 09.11.2026 · Rom · Experiment Schnittfrequenz: im Code 41 Einstellungen (`cut()`-Listen in `scenes/rome1–3.tsx`) in 89,4 s = **Ø 2,18 s/Einstellung** → im Ziel 2–3 s (`clip-regeln.md` Bild & Schnitt 5), schneller als R3 (≈ 2,6 s) und R2 (≈ 3,3 s). Nur Code-Zählung, **nicht** per ffmpeg `scene > 0,12` am fertigen Video gemessen (kein Render erlaubt) – Kameraschwenks ohne Schnitt (z. B. goths Pferd → Männer) zählen nicht mit · `scratchpad/rome-scenes/kontaktabzug-v2.jpg`
- 09.11.2026 · Rom · Pills, die bis Szenenende stehen, zeigten nach einem Schnitt ins Leere (RIVAL 15,2 s, EAST 33,1/35,6 s, ODOACER 70,5 s); behoben durch Kamera-Anker am benannten Ding, ohne Overlay-Code · `kontaktabzug.jpg` vs. `kontaktabzug-v2.jpg`
- 09.11.2026 · Rom · Dauerdrehung (0,16 rad/Frame) eines Karussells zeigt die Figur meist von hinten; Drehung pro Takt (ganze Umdrehung in der 2. Takthälfte) hält das Gesicht beim Wechsel vorn · chaos 24,8 s vorher/nachher
- 09.11.2026 · Rom · Ein Requisit, das nur ~0,5 s zu sehen ist und dabei gestaucht wird, liest sich nicht (Holzpferd 42,4 s). Mindestens ~0,8 s unverformt in eigener Bildmitte zeigen · goths 42,4 s vorher/nachher

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Clip 3: Übergänge im fertigen Video per Streifen (12 fps, ±6 Bilder um jeden Schnitt) prüfen – liest sich jeder Übergang in ≤ 8 Bildern, und passt die Art (whip = Ortssprung, wipe = Kapitel)?
- Match Cut: Kopfgröße vor/nach dem Schnitt messen (`screenOf`); in der Probe ist es ein Ranschnitt (Kopf ×2,5), kein echter Match Cut.
- Schnittfrequenz des Rom-Clips nach dem Render per ffmpeg (`scene > 0,12`) gegen die Code-Zählung (Ø 2,18 s) prüfen – zählt ffmpeg die Kamerafahrten mit?
- Werkzeug-Idee: Projektions-Prüfer, der für jede Pill und jede Einstellung meldet, ob ein Figurenkopf unter der Spitze liegt (statt Sichtprüfung).
- Von Veröffentlichung: Verrät das **erste Bild** (vor dem ersten Text bei Rom 0,92 s) ohne Ton das Thema und das Titel-Versprechen? (`austausch.md` 09.11.) (übertragen vom Wissensverwalter 09.11.2026).
- Schnittfrequenz-Ziel ist 2–3 s (`clip-regeln.md` Bild & Schnitt 5); die Szenen-Messlatte nennt 2,5–3,5 s – gemessenen Wert gegen beide melden (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 09.11.2026 | Probe MotionKitTest (17 Techniken, bewegt) | Ø 6,1 vor / 6,5 nach Fix (18 Noten) (Selbstbewertung) | Rim nur Aufhellung, Parallax in Untertitel-Zone, Echo als Schein |
| 09.11.2026 | Rom (13 Szenen, Kontaktabzug) | Ø 6,0 → 7,0 (Selbstbewertung Regie-Kritiker, Endabnahme steht aus) | Pills zeigten nach Schnitten ins Leere, YOU in vote/twist kaum sichtbar |
| 09.11.2026 | Rom v3 (Neuvertonung, 13 Szenen) | 6,5 (Selbstbewertung Regie-Kritiker) | Loop-Ende mit A/B-Karten, vote S0 4,8 s statisch, roofOff zu spät, EAST-Pill über Hahn |
