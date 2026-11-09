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

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 08.11.2026 · Sonnensystem · Tafel/Figur/Sticker angeschnitten (9 s, 66 s, 75 s) → Kamera-Korrekturen be84199.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Rom: „Squash & Stretch“ bei Treffern (Steine) und Antizipation vor großen Gesten testen; im Kontaktabzug bewerten.
- Kamera-Wackler (leicht) bei Gefahr-Momenten testen.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 08.11.2026 | Sonnensystem v2 | – | 3 Anschnitte |
