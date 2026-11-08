# Stimmen-Casting: lebendige Erzählstimme (08.11.2026)

Auftrag: Sprecherstimmen von den Referenzvideos inspirieren lassen – „aufgeweckt und lebendig,
charakteristisch und angenehm zum Zuhören“. Hauptreferenz ist **R3** (englisch, „Zombie Apocalypse –
30th Floor – Part 1“), R1 (deutsch) und R2 (russisch) nur ergänzend. Die Referenz-Dateien und alle
Hörproben liegen **nicht** im Repo (Urheberrecht bzw. Größe).

## Methode (nachvollziehbar, nur numpy/soundfile/ffmpeg)
Messskript liegt im Sitzungs-Scratchpad (`work/measure.py`), Verfahren:
- **Tempo (W/s)** = Wortzahl / Sprechspanne. Wortzahl bei den Referenzen aus der Whisper.cpp-
  Transkription (`scripts/whisper-words.mjs`, Modell `medium`; Tokens wie `[MUSIC PLAYING]` entfernt),
  bei Kokoro die Wörter des Skripttexts (wie die Untertitel sie zählen). Sprechspanne = erster bis
  letzter Sprach-Frame der Pegel-Erkennung (s. u.). Whisper-Wortzeiten selbst taugen **nicht** für
  Pausen: sie schließen lückenlos aneinander (R3: 0 Lücken ≥ 150 ms; R1: letztes Wort bei 59,2 s,
  obwohl die Datei 46,7 s lang ist).
- **Tonhöhe (F0)**: YIN-Verfahren (de Cheveigné & Kawahara 2002), Fenster 40 ms, Schritt 10 ms,
  65–420 Hz, Schwelle 0,12; nur Sprach-Frames mit Pegel > P95 − 20 dB; Ausreißer > 5 Halbtöne (HT)
  vom gleitenden Median (9 Frames) verworfen. Kenngrößen: Median (Hz), Interquartil P25–P75 in HT
  (robust, **Hauptmaß für Melodie**), P10–P90 in HT. Eigenprüfung: künstlicher Ton mit 14 Obertönen +
  Rauschen, Glissando 100 → 141,4 Hz → erkannt 100,5 → 140,5 Hz, 195/195 Frames.
- **Dynamik**: Pegel (RMS, 30-ms-Fenster, 10-ms-Schritt) in Sprach-Frames: Std und P10–P90 in dB.
- **Pausen**: Pegel-Erkennung, Sprache = Pegel > P95 − 25 dB, Lücken < 80 ms geschlossen; Pause =
  Stille ≥ 150 ms innerhalb der Sprechspanne. Pausenanteil = Summe Pausen / Sprechspanne.
- **Präsenz**: Energieanteil 2–5 kHz bzw. 200–500 Hz am Band 80 Hz–8 kHz (FFT über die ganze Datei).
- Lautheit: ffmpeg `ebur128` (integriert, LRA).

## Messung der Referenzen
| Ref | Wörter / Spanne | W/s | F0 Median | F0 IQR | F0 P10–P90 | Pegel P10–P90 | Pausen ≥ 0,3 s | Pausenanteil | 2–5 kHz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **R3 Erzähler** (0–54,3 s, bis „one problem.“) | 152 / 54,2 s | **2,81** | **126,5 Hz** | **6,5 HT** | 13,3 HT | **14,1 dB** | 1,1–11/min (s. u.) | 4–13 % (s. u.) | −11,7 dB (ganze Datei) |
| R3 ganz (inkl. Frauenstimme „Mia“ ab 54 s) | 169 / 67,8 s | 2,49 | 156 Hz | 12,6 HT | 18,0 HT | 15,3 dB | – | – | – |
| R1 (deutsch) | 136 / 44,4 s | 3,06 | 144,6 Hz | 8,2 HT | 16,1 HT | 22,0 dB | 12,2/min, Median 0,36 s | 13,7 % | −18,1 dB |
| R2 (russisch) | 341 / 140,9 s | 2,42* | 128,6 Hz* | 8,9 HT* | 14,5 HT* | 10,8 dB* | nicht messbar | nicht messbar | – |

Herleitung Beispiel R3: 152 Wörter (Whisper, bis einschließlich „problem.“ bei 54,30 s) / 54,2 s
Sprechspanne = 2,81 W/s. Lautheit ganze Dateien: R1 −18,1 LUFS (LRA 4,1), R2 −22,3 (2,6), R3 −17,4 (3,1).

Einschränkungen:
- **R3 hat einen durchgehenden Klangteppich** (leisestes 5 % der 50-ms-Fenster bei −44,6 dBFS; R1:
  −75,6 = echte Stille). Deshalb hängen R3-Pausen stark von der Schwelle ab: P95 − 10 dB → 11,1 Pausen
  ≥ 0,3 s/min, Anteil 12,8 %; −15 dB → 1,1/min, 3,8 %; −25 dB → 0 Pausen. Sicher ist nur: **R3 hat
  kaum lange Pausen** (Median der Pausen ≥ 0,3 s: 0,32–0,38 s).
- *R2: Musik unter der Stimme (leisestes 5 % bei −32,3 dBFS), nur 591 stimmhafte Frames in 141 s
  erkannt → F0 und Pausen unzuverlässig; russische Wörter sind länger → W/s nicht mit Englisch vergleichbar.
- R3 F0 in 5-s-Fenstern schwankt im Median zwischen 113 und 197 Hz (Erzähler steigt bei „Rule number
  one, fill the bathtub“ hoch) – das ist die gemessene „Lebendigkeit“. Einzelne Fenster (5–10 s: 239 Hz,
  nur 12 Frames) sind vermutlich Musik/Effekte.
- Silbenrate nicht gemessen (keine verlässliche Silbenzerlegung ohne neue Abhängigkeit).

**Hörbare Eindrücke (Energie, Lächeln, Betonung, Rhythmus): Ich kann das nicht bestätigen** – ich kann
die Dateien nicht anhören, nur messen. Stellvertretend messbar: Tonhöhen-Streuung (Melodie), Pegel-
Streuung (Betonung/Dynamik), Pausen (Rhythmus), 2–5-kHz-Anteil (Präsenz/„Nähe“). „Lächeln in der
Stimme“ (angehobene Formanten) habe ich nicht gemessen. Das Probehören bleibt beim Menschen.

## Kokoro-Stimmen, gleicher Probesatz, Tempo 1,0
Satz (31 Wörter): „You just bought the Roman Empire. Bad news: every time you respawn, this job gets worse.
An actual auction. And you won it. Congrats, Emperor! So how long do you last?“ Erzeugt mit
`scripts/tts.py` (Voice-Klasse), ohne Nachbearbeitung. Neu geladen aus dem Modell-Repo
(onnx-community/Kokoro-82M-v1.0-ONNX, gleiche Quelle wie das Modell): `am_echo`, `am_liam`,
`af_nicole`, `bm_fable` (alle 10 angefragten Stimmen existieren dort, HTTP 302 → Download je 522 240 Byte).

| Stimme | W/s | F0 Median | **F0 IQR** | F0 P10–P90 | Pegel P10–P90 | Pausen ≥ 0,3 s/min | Pausenanteil |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **am_fenrir** (Finn, jetzt im Rom-Drehbuch) | 3,00 | 137,2 Hz | **6,9 HT** | 13,1 | 19,1 dB | 0,0 | 7,1 % |
| am_puck (Max) | 3,10 | 105,5 Hz | 6,0 HT | 13,0 | 17,9 dB | 0,0 | 6,0 % |
| am_liam | 3,48 | 136,8 Hz | 4,6 HT | 8,0 | 17,6 dB | 13,5 | 10,5 % |
| am_michael | 2,66 | 116,8 Hz | 3,9 HT | 6,8 | 19,1 dB | 15,5 | 16,2 % |
| am_echo | 3,35 | 115,9 Hz | 3,1 HT | 7,4 | 20,8 dB | 6,5 | 11,4 % |
| bm_fable | 3,29 | 125,7 Hz | 4,0 HT | 8,1 | 23,5 dB | 6,4 | 4,0 % |
| bm_george | 2,75 | 140,9 Hz | 2,8 HT | 6,4 | 15,8 dB | 16,0 | 16,2 % |
| af_heart (Lily) | 2,85 | 200,7 Hz | 3,5 HT | 6,8 | 17,3 dB | 16,6 | 17,8 % |
| af_bella | 2,75 | 206,4 Hz | 3,5 HT | 6,2 | 19,1 dB | 16,0 | 17,4 % |
| af_nicole | 1,83 | 150,6 Hz | 1,5 HT | 3,3 | 22,1 dB | 24,8 | 39,4 % (Flüsterstimme) |
| *R3 Erzähler (Ziel)* | *2,81* | *126,5 Hz* | *6,5 HT* | *13,3* | *14,1 dB* | *≈ 1–11* | *≈ 4–13 %* |

Mischungen (gewichteter Mittelwert der Stil-Vektoren, gleicher Satz, Tempo 1,0):

| Mischung | W/s | F0 Median | F0 IQR | F0 P10–P90 | Pegel P10–P90 | Pausen ≥ 0,3 s/min |
| --- | --- | --- | --- | --- | --- | --- |
| **fenrir 0,6 + puck 0,4** | 3,03 | **126,6 Hz** | **6,3 HT** | **13,7** | 18,2 dB | 0,0 |
| fenrir 0,7 + liam 0,3 | 3,09 | 133,9 Hz | 7,0 HT | 11,0 | 16,7 dB | 12,0 |
| fenrir 0,7 + michael 0,3 | 2,85 | 131,1 Hz | 5,2 HT | 9,8 | 18,8 dB | 11,0 |
| fenrir 0,5 + echo 0,5 | 3,10 | 128,6 Hz | 5,3 HT | 9,5 | 20,7 dB | 0,0 |
| puck 0,6 + liam 0,4 | 3,15 | 118,2 Hz | 5,3 HT | 10,2 | 17,2 dB | 12,2 |

Befund: Nur `am_fenrir` und `am_puck` erreichen die Melodie von R3 (IQR ≥ 6 HT); alle anderen,
auch die laut VOICES.md „besseren“ af_heart (A) und af_bella (A−), sprechen mit gut halb so viel
Tonhöhen-Bewegung (2,8–4,6 HT). Die Mischung fenrir 0,6 + puck 0,4 trifft R3 in Median (126,6 vs.
126,5 Hz), IQR (6,3 vs. 6,5 HT) und P10–P90 (13,7 vs. 13,3 HT) am genauesten. Kokoro-Pegel schwanken
stärker als R3 (17–23 vs. 14 dB) → Kompressor sinnvoll.

## Was die Pipeline technisch hergibt (geprüft)
| Hebel | Ergebnis der Messung |
| --- | --- |
| **Tempo** (`speed`) | ändert die Tonhöhe nicht: Mischung bei 1,0 / 1,15 / 1,25 → F0 Median 129,7 / 129,6 / 129,6 Hz, IQR 7,2 / 6,9 / 6,7 HT. Rom-Szenen 1–3 (85 Skriptwörter): 2,55 / 2,78 / 3,00 W/s. |
| **Tempo je Szene** (`voiceStyle.sceneSpeed`) | eingebaut; Faktor auf `speed` pro Szenen-ID. |
| **Stimmen mischen** (`voiceStyle.blend`) | eingebaut; siehe Tabelle oben. |
| **Satzzeichen** | Probesatz „Bad news … this job gets worse“ (Mischung, 1,2) in 6 Varianten: nur „gets... worse“ erzeugte eine messbare Pause (0,16 s, sonst keine Stille ≥ 120 ms). „.“ / „:“ / „!“ / „?“ / „—“ änderten die F0-Spanne nur zwischen 10,3 und 11,4 HT (P10–P90) – im Rauschen der Messung. Zwischen Sätzen bündelt `tts.py` bis 380 Phoneme, Kokoro setzt dort eigene kurze Pausen (0,2–0,5 s). |
| **Betonung** | Kokoro hat keine Betonungs-Steuerung im Text. Messbar wirken nur Satzbau und Satzzeichen (s. o.). Kurze Ausrufe („Sold!“) bleiben im Block mit Nachbarsätzen, damit Kokoro nicht schwächelt. |
| **Tonhöhe pro Szene** | nicht eingebaut: geht in ffmpeg nur über `asetrate`+`atempo`, verschiebt Formanten mit („Micky-Maus“) – nicht angenehm. |
| **Nachbearbeitung** (`voiceStyle.post`) | eingebaut, Länge bleibt exakt gleich. `lively`: 2–5-kHz-Anteil −13,6 → −10,1 dB (R3: −11,7), Pegel P10–P90 20,2 → 15,4 dB (R3: 14,1), LRA 2,6 → 1,6 LU. Lautheit danach regelt weiterhin `finalize.sh` (−14 LUFS). |

Rückwärtskompatibel geprüft: alte `tts.py` (Commit 8b41f78) und neue erzeugen für `af_heart`, Tempo 1,3,
einen Sonnensystem-Satz **bitgleiche** Samples (164 352 Samples, `np.array_equal` = True). Ohne
`voiceStyle` ändert `make_episode.py` nichts. Schnittstelle: [`docs/schnittstelle.md`](schnittstelle.md).

## Empfehlung für das Rom-Video
Hörproben (Rom-Szenen hook, auction, stones aus dem Drehbuch, wie `make_episode.py` erzeugt) liegen
außerhalb des Repos im Sitzungs-Scratchpad `voice-casting/` (WAV + MP3).

| Probe | Einstellung | W/s | F0 Median | F0 IQR | P10–P90 | Pegel P10–P90 | 2–5 kHz | Whisper-Gegenprobe |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K0 (Ist) | `am_fenrir`, 1,25, ohne post | 3,01 | 139,4 Hz | 6,9 HT | 12,8 | 20,2 dB | −13,6 dB | 84/85 („Empire“ fehlt) |
| **K1 (Empfehlung)** | `blend` fenrir 0,6 + puck 0,4, 1,25, `post: "lively"` | 3,00 | 128,1 Hz | 6,8 HT | 15,0 | 15,0 dB | −10,7 dB | 84/85 („respawn“ → „respond“) |
| K2 (kleinster Eingriff) | `am_fenrir`, 1,25, `post: "lively"` | 3,01 | 137,0 Hz | 7,0 HT | 12,8 | 15,4 dB | −10,1 dB | 85/85 |
| K3 (mehr Rhythmus) | `blend` fenrir 0,7 + liam 0,3, 1,2, `sceneSpeed` {hook 1,08, stones 0,95}, `post: "lively-room"` | 3,02 | 132,9 Hz | 6,9 HT | 13,5 | 14,8 dB | −10,2 dB | 85/85 |
| *R3 Erzähler* | | *2,81* | *126,5 Hz* | *6,5 HT* | *13,3* | *14,1 dB* | *−11,7 dB* | |

Whisper-Gegenprobe: Whisper.cpp `medium` auf der Probe, Abgleich der normalisierten Wörter mit dem
Skripttext (difflib, wie `make_episode.py`). Ein Fehlwort bei 85 ist eine Einzelprobe, kein Beleg für
schlechtere Verständlichkeit; bei K1 vor dem Lauf „respawn“ anhören, notfalls `say: {"respawn": "re-spawn"}`
(Aussprache-Tabelle des Drehbuchs, Ersatz vorher prüfen).

Begründung K1: Tonhöhe und Melodie am nächsten an R3 (Median +1,6 Hz, IQR +0,3 HT), Dynamik nach dem
Kompressor fast gleich (15,0 vs. 14,1 dB), Präsenz 1 dB über R3. Gegenüber K0 eine tiefere, etwas
ruhigere Stimmlage (−11 Hz ≈ −1,4 HT) bei gleicher Lebendigkeit. Ob das „angenehmer“ klingt, muss
ein Mensch entscheiden – das ist nicht gemessen.

Eintrag fürs Drehbuch (macht der Drehbuch-Agent/Orchestrator, nicht diese Rolle):
```json
"voice": "am_fenrir", "speed": 1.25,
"voiceStyle": { "blend": { "am_fenrir": 0.6, "am_puck": 0.4 }, "post": "lively" }
```

Tempo: Alle Proben liegen bei ≈ 3,0 W/s auf den Szenen 1–3. Das ist langsamer als die Schätzung im
Drehbuch (Finn 1,25 ≈ 3,45 W/s) – diese Szenen haben viele Zahlen („193“, „25,000“ → mehrere gesprochene
Wörter) und „…“. R3 spricht 2,81 W/s, die Regel `clip-regeln.md` nennt 3,3–3,6 (aus Referenz 2 der
ersten Runde). Ich empfehle, `speed` 1,25 zu lassen und nach dem ersten vollständigen TTS-Lauf die
Gesamtrate zu messen; ein höheres Tempo als R3 ist für Shorts vertretbar, ein Beleg dafür fehlt aber.

## Nicht messbar / offen
- Hörurteil (Wärme, Lächeln, Natürlichkeit, „Cringe“) – Ich kann das nicht bestätigen.
- Pausen in R3/R2 wegen Klangteppich nur als Spanne; Silbenrate nicht gemessen.
- Ob Kokoro-Mischungen über die ganze Episode stabil klingen (Artefakte bei langen Blöcken), nur an
  85 Wörtern geprüft.
