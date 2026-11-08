# Schnittstelle: Clips von außen steuern (z. B. Dashboard)

Ein Dashboard steuert das Repo nicht direkt, sondern über eine Claude-Code-Sitzung, die diese
Befehle ausführt. Alles, was sich pro Clip einstellen lässt, steht im Drehbuch `episodes/<id>.json`.

## Einstellbare Werte pro Clip
| Feld | Bedeutung | Erlaubte Werte | Wirkung |
| --- | --- | --- | --- |
| `voice` | Sprecherstimme (Name oder ID) | **Lily** `af_heart` (Standard), **Bella** `af_bella`, **Finn** `am_fenrir`, **Max** `am_puck` – Liste: `scripts/voices.json` | neue Tonspur, Untertitel/Schnitte automatisch neu getimt |
| `voiceStyle` | Sprechstil des Videos | `lebendig` (Standard), `spannend`, `witzig`, `ruhig`, `aus` | Melodie/Betonung der Stimme (`scripts/voice_fx.py`) |
| `scenes[].delivery` | Sprechweise der Szene | `punch`, `normal`, `hype`, `tense`, `calm` oder `{speed, expr}` | Tempo und Melodie dieser Szene |
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

## Overlays (HUD, Auswahl, Pills, Akzentwörter)
Alle Felder sind optional; ohne sie sieht ein Clip aus wie bisher (Sonnensystem per Standbild-Vergleich
geprüft). Code: `src/episode/overlays/` (`Hud.tsx`, `Choice.tsx`, `Pill.tsx`, `Captions.tsx`,
Verdrahtung `Overlays.tsx`). Vorführung: Komposition `OverlayDemo` (6,7 s, ohne Ton).
Cues hängen wie Sticker an einem Wort der Szene (erstes Vorkommen) und landen mit `atMs` in `timeline.json`.

```jsonc
{
  "hud": {                                   // Einsatz-Anzeige oben, ab ~150 px (darüber Plattform-UI)
    "title": "THE LAST EMPEROR · PART 1",    // Serien-Titel-Pill (optional)
    "counters": [{ "id": "year", "label": "YEAR", "value": 395, "suffix": " AD" }], // auch "prefix"
    "bars": [{ "id": "empire", "label": "EMPIRE", "value": 0.8, "color": "#FFB627" }] // 0–1, max. 2
  },
  "scenes": [{
    "id": "fall",
    "text": "In 410, the *Goths* march into *Rome*. What do you do?",
    "cues": [
      { "word": "410",   "hud": { "id": "year", "value": 410 } },     // Zähler zählt hoch (~0,9 s)
      { "word": "march", "hud": { "id": "empire", "value": 0.45 } },  // Balken ruckt, zeigt −35 %
      { "word": "Goths", "label": { "text": "Goths", "color": "#FF5A5A", "x": 0.84, "y": 0.6 } },
      { "word": "What",  "choice": { "title": "WHAT DO YOU DO?",
                                     "options": ["Pay the Goths", "Raise an army"], "pick": 1 } },
      { "word": "do",    "emph": true }                               // oder "emph": "#FF5A5A"
    ]
  }]
}
```

| Element | Verhalten |
| --- | --- |
| `hud` (Drehbuch-Feld) | wird von `make_episode.py` nach `timeline.json` übernommen; bleibt das ganze Video sichtbar. Sticker rutschen dann unter das HUD (y ≈ 430 statt 300). |
| Cue `hud: {id, value}` | Zähler zählen animiert (ganzzahlig, sonst 1 Nachkommastelle); Balken: Ruck/Schütteln bei Verlust, Aufpumpen bei Gewinn, heller Rest schrumpft nach, Änderung in % ersetzt kurz die Prozentzahl; unter 0,3 pulsiert der Balken rot. |
| Cue `choice: {options, pick?, title?, ask?}` | 2–4 Karten A–D gleiten nacheinander herein; mit `pick` (Index ab 0) fährt der Mauszeiger hin und klickt (Karte wird gelb, andere grau). Ohne `pick` pendelt der Zeiger, darunter „COMMENT A OR B“ (bei 3/4 Karten „A, B OR C“ …). `ask`: eigener Text, `true` erzwingt den Hinweis auch mit `pick`, `false` blendet ihn aus. Endet mit der Szene oder der nächsten Auswahl derselben Szene. |
| Cue `label: {text, color?, x, y}` | Pill mit Zipfel; (x, y) = Spitze des Zipfels in Bildanteilen (0–1), Pill sitzt darüber; Standardfarbe Akzentgelb, Schrift automatisch schwarz/weiß; endet mit der Szene. |
| `*Wort*` im Text / Cue `emph` | Untertitel zeigen das Wort in Akzentgelb `#FFD23F` (oder Cue-Farbe), ohne Sternchen. Mehrere Wörter: `*Western Empire*`. Die Sprachausgabe bekommt den Text ohne Sternchen, der Whisper-Abgleich bleibt gleich. |

Platz im Hochformat: HUD 150–400 px (mit 2 Balken bis ≈ 455 px, `hudBottom()` in `Hud.tsx`; Sticker
rutschen automatisch darunter), Auswahlkarten um die Bildmitte, Unterkante inkl. Hinweis höchstens
y ≈ 1380, unteres Drittel bleibt den Untertiteln. Alle Animationen werden aus dem Frame berechnet;
`useEffect` nur zum Warten auf die Schrift (`useCaptionFontReady` in `fonts.ts`), nie für Bewegung.

Empfehlungen für gut lesbare Overlays (Design-Kritik 08.11.2026, Randfälle in Komposition `OverlayEdgeCases`):
- HUD: höchstens 1 Zähler + 1 Balken (oder 2 Zähler ohne Balken). Bei 2 Zählern + 2 Balken schrumpfen
  die Zahlen auf ≈ 40 px. Serien-Titel ≤ ~30 Zeichen, sonst wird er automatisch kleiner.
- Auswahl: Optionen ≤ ~18 Zeichen (dann 50–60 px Schrift). Längere Texte werden zweizeilig gesetzt.
  Frage (`title`) ≤ ~20 Zeichen, sie bleibt einzeilig und wird sonst kleiner.
- Pills: x zwischen 0,1 und 0,75, y zwischen 0,25 und 0,7. Rechts ab x ≈ 0,8 liegen bei TikTok/Shorts
  die Knöpfe (Like/Kommentar/Teilen), oben die Reiter, unten die Beschreibung. Diese Zonen sind eine
  Annahme aus gängigen Vorlagen, nicht aus einer Primärquelle (siehe `docs/verbesserungen.md`).

## Aussprache nur für die Stimme (pro Episode)
| Feld | Bedeutung | Beispiel |
| --- | --- | --- |
| `years` | Diese Zahlen als Jahr sprechen; Mengen mit Tausenderkomma bleiben Mengen | `[193, 476, 1453]` → „one ninety-three“, „four seventy-six“, „fourteen fifty-three“ |
| `say` | Aussprache-Tabelle (ganze Wörter, Groß/klein genau) | `{"Odoacer": "Odo-acer"}` |

Die Untertitel zeigen weiterhin den Drehbuch-Text. Ersatz-Schreibweisen vorher an den Kokoro-Phonemen
oder per Hörprobe prüfen (`scripts/tts.py --text ... --out ...`). Umsetzung: `apply_say()` in `scripts/tts.py`.
