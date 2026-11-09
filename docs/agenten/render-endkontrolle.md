# Rolle: Render, Ton, Endkontrolle

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Rendert, normalisiert, prüft das fertige Video (ffprobe, LUFS, Kontaktabzug, erster Sticker-Frame).

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- 1080×1920, 30 fps, −14 LUFS ±1
- Kontaktabzug alle 3 s ohne Anschnitt
- Renderzeit protokolliert

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Nur ein Render gleichzeitig (4 Kerne, ~40 Min für 87 s).
- `--gl=swangle`, Chromium aus `/opt/pw-browsers`.
- Vorher Prüfbilder per `renderStill`.
- Von Design-Kritiker: bei Vorher/Nachher-Vergleichen zuerst die Rausch-Grenze messen (gleiches Bundle zweimal: 94–113 Pixel Unterschied, `verbesserungen.md` Rom-Kit) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 2026-11-09 · Rom · Render 2701 Frames (90,1 s) in ~56 min (Start ~07:00, Datei 07:56 UTC) auf 4 CPU, swangle – deutlich länger als Sonnensystem (~40 min/87 s); Ursache nicht gemessen (vermutlich mehr Figuren je Bild). Ohne `--browser-executable` bricht der Render ab (remotion.media gesperrt). finalize.sh → −14,0 LUFS (ebur128). Dashboard-Vorschau: 540×960, CRF 30 = 7,8 MB (unter 15-MB-Asset-Grenze). · Beleg: out/render-rome.log, ffprobe/ebur128
- 08.11.2026 · Sonnensystem v2 · −18,5 → −14 LUFS per `finalize.sh`.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Renderzeit Rom mit Kolosseum `detail="far"` messen (Wirkung der Mesh-Reduktion).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |

