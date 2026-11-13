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
- 13.11.2026 · Jensen Huang (2D) · Experiment: ffmpeg `scene > 0,12` an der Vorschau gegen Beat-Zählung aus `timeline.json` – ffmpeg 21 Wechsel (≈18 Einstellungen, Ø ≈ 3,9 s, im Ziel 3–4 s) vs. Beats Ø 1,88 s/Median 1,61 s: Beat-Zählung überschätzt das Tempo, weil Szenenstart→erster Beat (0,3–0,7 s) und Sticker ohne Bildwechsel mitzählen → für Tempo ffmpeg-Wert melden, Beats nur für Standphasen. Kontaktabzug war älter als Vorschau (07:18 vs. 07:41) → immer eigene Bilder aus der neuesten Vorschau ziehen. Neu: Label und Sticker auf gleicher Höhe y≈0,3 verdecken sich (RECORD-Label 40,6 s, Board-Label 24,6 s); Textbreite > Schildbreite schneidet Buchstaben ab (NDEPENDENT 21,3 s); weißes HUD auf hellem Hintergrund unlesbar (55–63 s). Prüfregel: jedes `label` gegen Sticker derselben Szene auf gleiche y prüfen · `out/jensen-huang-regie.json`
- 12.11.2026 · Rolls-Royce v1 (2D) · Experiment: Beat-Abstände (nur `beat`-Cues + Szenenstart) aus `timeline.json` statt aller Cues zählen – Ø 1,57 s, Median 1,52 s, 23/46 unter 1,5 s, keiner über 5 s → Bildtempo deutlich hektischer als Ziel 3–4 s, obwohl kein Standbild „steht“. Bekannte Fehler bestätigt (WINGS?-Sticker über SPIRIT-OF-ECSTASY-Pill 38,3 s; Choice-Karten verdecken Figur + Karte A links angeschnitten 70,8 s); neu: Freeze-Bild verdoppelt HUD („TIME LEFT 0:45/0:3…“, 28,9 s), Choice-Karten laufen bis Loop-Ende (72,3 s ≠ Cover), „nobody:“-Schwarzbild 1,8 s ohne Inhalt (21,0 s), Stiche als Karte nicht lesbar (24,9 s). Prüfregel: Freeze-/Bild-im-Bild-Effekte auf doppelte Overlays prüfen · `out/rr-kontakt.jpg`, `out/rr-regie.jpg`
- 12.11.2026 · UFC v1 (2D) · Beat-Abstände Ø 1,74 s / Median 1,48 s (24/47 < 1,5 s), ein Loch 6,9 s (empire logoCrash→settlementCheck). Bekannte Fehler noch da: boom-Schluss-Beat 0,28 s (Rousey-Bild 46,3 s schon im Zoom-Übergang), GRIFFIN-vs-BONNAR-Label auf Leuchtschrift (38,7 s), Choice-Karten über Waage (79,0 s). Neu: Choice-Karten bis Loop-Ende (81,6 s, Endbild ≠ Hook), Label/Sticker-Stapel „NEVER EVER“ über Sprechblase + DANA-WHITE-Label (44,6 s), RULES-Blatt in Untertitelzone (21,6 s), Cover-Titel blendet 0,6 s über HUD (auch RR). Prüfregel: Cover-Ausblendung und erstes Overlay-Bild (0,5–0,7 s) eigens rendern · `out/ufc-kontakt.jpg`, `out/ufc-regie.jpg`
- 12.11.2026 · Mike Tyson (2D) · Experiment: gezielte Einzelbilder an Szenen-Übergängen/Whips (`--at`, 8 Bilder, 42 s) statt neuem Kontaktabzug – fanden 3 Fehler, die das 3-s-Raster nur streifte: Pill „A PIECE OF HIS EAR“ steht bis Szenenende über BANKRUPT-Nacht (55,2 s), Whip-Startbild schiebt Figur halb aus dem Bild (54,6 s), Biss-Moment ohne lesbares Verb (Ohrstück klein, Gegner greift nicht ans Ohr, 53,6–54,2 s). Prüfregel: je Whip Start- und Endbild ansehen; Pill-Inhalt gegen spätere Einstellungen (nicht nur Ort) prüfen · `out/tyson-check.jpg`
- 12.11.2026 · Earth Without Us (2D) · Szenen-Sets wechseln nur auf Cues: Cue-Abstände aus `timeline.json` je Szene listen findet stehende Einstellungen ohne Render (hook 5,2 s, blackout 5,5 s, nuclear 5,3 s); Kontaktabzug mit 2 Bildern/Szene zeigt dieselbe Lücke (gleiche Einstellung 3,2/9,3 s). Kleine Hauptfigur in Totalen (Voyager 166,6 s, Satelliten 69,2 s) trägt den roten Faden nicht · `out/earth-contact.jpg`
- 09.11.2026 · Rom v3 Runde 2 · Einen Beat aufs richtige Wort zu legen reicht nicht, wenn die Einstellung die Handlung nicht zeigt: roofOff schneidet jetzt auf „rip“, zeigt aber Vandalen-Nahe, das Tempeldach bleibt ganz (84,1/85,3 s) – Prüffrage je Beat: *sieht man das Verb?* cardB-Ranschnitt (Kopf größer, Karten gleich) liest sich als Push-in, nicht als neue Einstellung, reicht aber knapp; Loop-Ende per `untilBeat` sauber (132,9 s = Hook-Bild) · `out/rk-v3-fix.jpg`, `out/rk-v3-r2.jpg`
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
| 09.11.2026 | Rom v3 Runde 2 (nach Fix) | 7,0 (Selbstbewertung Regie-Kritiker) | roofOff-Einstellung zeigt kein Dach; vandals-Schluss 5,1 s ohne Schnitt |
| 12.11.2026 | Earth Without Us (2D, 16 Szenen, Kontaktabzug) | 6,5 (Selbstbewertung Regie-Kritiker) | Standeinstellungen 4–5,5 s, Szenen ohne Themenbild (nuclear 62 s, blackout 30,8 s), Figur in Totalen zu klein |
| 12.11.2026 | Mike Tyson (2D, 11 Szenen, Kontaktabzug + 8 Einzelbilder) | 6,5 (Selbstbewertung Regie-Kritiker) | ear-Szene (Pill über Nacht-Einstellung, Biss unlesbar, Lizenzkarte fehlt), enge/abgeschnittene Ausschnitte douglas/conviction |
| 12.11.2026 | UFC v1 (2D, 11 Szenen, Kontaktabzug + 12 Einzelbilder) | 6,0 (Selbstbewertung Regie-Kritiker) | Beats Ø 1,7 s statt 3–4 s, Choice-Karten über Waage bis Loop-Ende, boom-Schluss 0,28 s, Label-Stapel tuf/boom |
| 12.11.2026 | Rolls-Royce v1 (2D, 10 Szenen, Kontaktabzug + 12 Einzelbilder) | 6,0 (Selbstbewertung Regie-Kritiker) | Beats Ø 1,6 s statt 3–4 s, Choice-Karten verdecken YOU bis Loop-Ende, WINGS? über Pill, doppeltes HUD im Freeze |
| 13.11.2026 | Jensen Huang (2D, 9 Szenen, Vorschau alle 3 s + 23 Einzelbilder) | 7,5 (Selbstbewertung Regie-Kritiker) | kein Muss; Label/Sticker-Stapel (crash, alleged), −29 % vs. −30 %, HUD auf Beige unlesbar, Laubbläser unklar |
