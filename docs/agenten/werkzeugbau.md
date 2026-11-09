# Rolle: Werkzeugbau (Pipeline, Geschwindigkeit, Wiederverwendung)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Macht künftige Videos **schneller und themenunabhängig**: wiederverwendbare Skripte (Kontaktabzug, Prüfbilder, Tempo-Kalibrierung, Episoden-Gerüst), allgemeine Bau-Kit-Bausteine, Vorlagen. Misst Zeitersparnis. Prüfer: Wissensverwalter + die Rolle, die das Werkzeug nutzt.

## Messlatte (1–10)
- Zeitersparnis gemessen (vorher/nachher, Minuten oder Schritte)
- Funktioniert für jedes Thema, nicht nur Rom
- Dokumentiert in `docs/schnittstelle.md` oder SKILL.md
- `npm run lint` sauber, bestehende Videos unverändert

## Checkliste (aktueller bester Stand – nur Erprobtes)
_noch leer_

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 09.11.2026 · Rom/Sonnensystem · **Kontaktabzug** `npm run contactsheet`: ein Bundle + ein Browser für alle Bilder.
  Gemessen: 9 Bilder (scale 0,25) in 31,3 s gesamt (3,3 s/Bild), 12 Bilder `--per-scene 1` (scale 0,2) in 49,2 s
  (4,0 s/Bild, CPU geteilt); Vergleich: ein `npx remotion still` = 5,7 s. Bundle mit warmem rspack-Cache 0,5–0,8 s
  (kalt nicht gemessen). Ersparnis bei 39 Bildern (13 Szenen × 3) ≈ 220 s → ≈ 140 s plus kein Ad-hoc-Code,
  Beschriftung/Kacheln automatisch · `scripts/contactsheet.mjs`, Testbild `scratchpad/cs-solar.jpg`.
- 09.11.2026 · Rom · **Tempo-Kalibrierung** `npm run calibrate`: Synthese aus `make_episode.py` in `make_voice()` +
  `synth_track()` ausgelagert (keine Kopie); Rom-Tonspur darüber **bitgleich** (2 145 872 Samples, max. Abweichung 0,0).
  Lauf 5 Tempi: 89 s bei ruhiger CPU (≈ 20 s je Tempo), 351 s bei geteilter CPU (≈ 70 s je Tempo). Vorher: je Tempo
  ein voller `make_episode.py`-Lauf mit Whisper + Musik (~2 Min laut schnittstelle.md) und Überschreiben von `public/`.
- 09.11.2026 · Rom · **Kokoro-Tempo hat eine Klippe zwischen 1,33 und 1,34**: ein Satz mit af_heart 7,47 → 6,70 s (−10 %),
  Mischung fenrir/puck 7,36 → 6,66 s; sonst ≈ −0,5…−1,5 % je 0,01. Rom gesamt: 1,32 → 102,2 s, 1,335 → 95,7 s, 1,35 → 89,4 s.
  Lineare Schätzung (1,31) lag deshalb weit daneben → Automatik halbiert jetzt das Intervall mit dem größten Sprung.
  Ursache nicht untersucht (Vermutung: Rundung der vorhergesagten Phonem-Dauern im Modell – nicht bestätigt).
- 09.11.2026 · **Gerüst** `npm run scaffold`: Rom-Drehbuch → 13 Komponenten in 0,04 s, `eslint` + `tsc` sauber;
  Test ohne timeline/Beats ebenfalls sauber; zweiter Aufruf bricht ab statt zu überschreiben (Exit 1). Testdateien gelöscht.

## Nächste Experimente
- ~~Kontaktabzug-Skript~~, ~~Tempo-Kalibrierung~~, ~~Episoden-Gerüst~~ gebaut 09.11.2026 (siehe Gelernt).
- Kontaktabzug parallel: 2 Browser-Tabs/`concurrency` – misst, ob 4 Kerne mit swangle schneller werden (nur wenn kein Render läuft).
- Kontaktabzug `--cues`: je Sticker/Choice ein Bild im **ersten** Frame (Regel aus clip-regeln) automatisch.
- Kalibrierung: Whisper-Gegenprobe nur für den empfohlenen Wert (Verständlichkeit bei hohem Tempo), optional `--whisper`.
- Kalibrierung: Klippe genauer vermessen (1,330–1,345 in 0,0025-Schritten, mehrere Stimmen) und Ergebnis in `stimme-casting.md`.
- Gerüst: optional Komposition in einer eigenen Datei vorschlagen (ohne `Root.tsx` anzufassen).
- Von Design-Kritiker/Render: Pixel-Vergleichs-Skript mit eingebauter Rausch-Grenze (Rom: 94–113 Pixel bei gleichem Bundle, `verbesserungen.md`) (übertragen vom Wissensverwalter 09.11.2026).
- Von Veröffentlichung: Skript „Titel → Einlöse-Sekunde aus `captions.json` + Zeichenzahl“ (`agenten/veroeffentlichung.md`) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
