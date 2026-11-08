# Schnittstelle: Clips von außen steuern (z. B. Dashboard)

Ein Dashboard steuert das Repo nicht direkt, sondern über eine Claude-Code-Sitzung, die diese
Befehle ausführt. Alles, was sich pro Clip einstellen lässt, steht im Drehbuch `episodes/<id>.json`.

## Einstellbare Werte pro Clip
| Feld | Bedeutung | Erlaubte Werte | Wirkung |
| --- | --- | --- | --- |
| `voice` | Sprecherstimme (Name oder ID) | **Lily** `af_heart` (Standard), **Bella** `af_bella`, **Finn** `am_fenrir`, **Max** `am_puck` – Liste: `scripts/voices.json` | neue Tonspur, Untertitel/Schnitte automatisch neu getimt |
| `speed` | Sprechtempo | 0.5–2.0 (Standard 1.3 ≈ 3,3 Wörter/s) | wie oben; Videolänge ändert sich |
| `scenes[].text` | Sprechtext | Englisch | wie oben; Fakten müssen in `docs/quellen-<id>.md` belegt sein |
| `scenes[].cues` | Sticker, Soundeffekte, Schnitt-Beats | siehe `episodes/solar-system.json` | Timing automatisch |

Stimmnoten laut `VOICES.md` von hexgrad/Kokoro-82M: af_heart A, af_bella A-, am_fenrir C+, am_puck C+.
Fertige Hörproben (Selbstvorstellung): `assets/stimmproben/voice-<id>.mp3`. Neue Hörproben erzeugen:
`.venv/bin/python scripts/tts.py --voice <name> --speed 1.2 --text "..." --out out/voice-samples/<name>.wav`

## Befehle
```bash
# Stimme/Tempo ändern und ins Drehbuch übernehmen
.venv/bin/python scripts/make_episode.py episodes/<id>.json --voice Finn --save
# neu rendern (ohne GPU: --gl=swangle) und Lautheit normalisieren
npx remotion render SolarSystem out/<id>-raw.mp4 --props='{"episode":"<id>"}' --crf=18
scripts/finalize.sh out/<id>-raw.mp4 out/<id>.mp4
```

## Ergebnisse, die ein Dashboard anzeigen kann
| Quelle | Inhalt |
| --- | --- |
| Ausgabe von `make_episode.py` | Dauer je Szene, Gesamtdauer, Wortzahl, „Abgleich N/M Wörter“ (Aussprache-Gegenprobe) |
| `public/episodes/<id>/timeline.json` | `durationMs`, Szenen mit Start/Ende, Cues |
| `public/episodes/<id>/captions.json` | Untertitel mit Zeitstempeln |
| Render-Log von Remotion | „Rendered X/Y, time remaining …“ (Fortschritt) |
| `out/<id>.mp4` | fertiges Video (wird nicht ins Repo committet) |

Dauer: Neue Tonspur ~2 Min, Render ~40 Min für 87 s auf 4 CPU-Kernen ohne GPU (gemessen in dieser Umgebung).
