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
- 13.11.2026 · Jason (GTA 6, out/jason-gta6.mp4) · Note 9. Technik ok: 1080×1920, h264, yuv420p, bt709, 30 fps, 72,5 s; −14,6 LUFS (ebur128, LRA 3,6 LU, in ±1), True Peak −1,3 dBTP; kein schwarzer Frame, keine Stille > 0,5 s. Kontaktabzug (fps=1/3, 24 Bilder) ohne Anschnitt. Ende: letztes gesprochenes Wort „went…“ endet bei 70,8 s (captions.json), danach 1,7 s Loop-Bild (Cover ohne Titeltext, laut Drehbuch `loop`) und Ton bis Ende (RMS −24,4 dB). End-Card „KnowToon“ gilt hier nicht (Video vor dem KnowToon-Prompt). Beleg: out/jason-final-kontakt.jpg · out/jason-frame0.jpg (Cover lesbar, Augen offen)
- 13.11.2026 · Lucia (GTA 6) · Endkontrolle ohne Befund: Video 1080×1920, h264 High, yuv420p, bt709, 30 fps, 71,8 s (Vertonung 71,7 s). Lautheit −14,5 LUFS (ebur128, LRA 3,5 LU), True Peak −1,2 dBTP – innerhalb Ziel, aber am oberen Rand der ±1-Toleranz; Finalisierung auf −14,0 LUFS zielen. Kein schwarzer Frame (blackdetect), keine Stille > 0,5 s unter −50 dB, letzte 2 s mit Ton (RMS −19 dB). Kontaktabzug alle 3 s: keine Anschnitte. Cover (erstes Frame) lesbar · out/lucia-frame0.jpg · out/lucia-final-kontakt.jpg
- 12.11.2026 · Erde ohne Menschen · Render als Hintergrund-Befehl der Sitzung wurde nach **2 h hart beendet** (Grenze der Umgebung) bei 4799/5294 Bildern – Remotion kann nicht fortsetzen, ganzer Render verloren. Lange Renders daher **losgelöst** starten: `setsid nohup npx remotion render … > out/render-<id>.log 2>&1 < /dev/null & disown`, Warten per eigener Schleife (`while pgrep …; do sleep 60; done`). Gleichzeitige Chatterbox-Stimme (nice 15) verlängerte die Restzeit-Schätzung von 1 h 10 auf 1 h 36 · `out/render-earth.log`.
- 2026-11-09 · Rom · Render 2701 Frames (90,1 s) in ~56 min (Start ~07:00, Datei 07:56 UTC) auf 4 CPU, swangle – deutlich länger als Sonnensystem (~40 min/87 s); Ursache nicht gemessen (vermutlich mehr Figuren je Bild). Ohne `--browser-executable` bricht der Render ab (remotion.media gesperrt). finalize.sh → −14,0 LUFS (ebur128). Dashboard-Vorschau: 540×960, CRF 30 = 7,8 MB (unter 15-MB-Asset-Grenze). · Beleg: out/render-rome.log, ffprobe/ebur128
- 08.11.2026 · Sonnensystem v2 · −18,5 → −14 LUFS per `finalize.sh`.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Renderzeit Rom mit Kolosseum `detail="far"` messen (Wirkung der Mesh-Reduktion).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 13.11.2026 | Lucia (GTA 6) | 9 | Technik sauber; Lautheit −14,5 statt −14,0 LUFS (am Toleranzrand), sonst ohne Befund |
| 13.11.2026 | Jason (GTA 6) | 7 | Technik ok (−14,6 LUFS, −1,3 dBTP); Endbild ohne End-Card „KnowToon“ im letzten Frame nicht bestätigt |
