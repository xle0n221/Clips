# Clips – 3D-animierte Videos mit Three.js + Remotion

| Aufgabe | Werkzeug |
| --- | --- |
| 3D-Animationen | [Three.js](https://threejs.org) über [React Three Fiber](https://r3f.docs.pmnd.rs) + [drei](https://drei.docs.pmnd.rs), eingebunden mit [`@remotion/three`](https://www.remotion.dev/docs/three) |
| Videorendering | [Remotion](https://www.remotion.dev) (`remotion studio` / `remotion render`) |
| Audio | `<Audio>` aus [`@remotion/media`](https://www.remotion.dev/docs/media) |
| Captions | [`@remotion/captions`](https://www.remotion.dev/docs/captions) (TikTok-Stil) + [Whisper.cpp](https://www.remotion.dev/docs/install-whisper-cpp) für die Transkription |

Grundlage sind die offiziellen Remotion-Templates **`--three`** und **`--tiktok`**
(`npx create-video@4.0.541`), zusammengeführt in einem Projekt.

> **Verbindliche Regeln für jeden Clip:** [`docs/clip-regeln.md`](docs/clip-regeln.md) –
> roter Faden, „süchtig machend“, Themen-Treue, Sprache/Stimme, gemessene Referenzwerte,
> technische Fallstricke. Vor jedem neuen Video lesen.

## Voraussetzungen

- Node.js `^20.19.0 || ^22.13.0 || >=24` (Vorgabe aus `package.json` des Templates)
- Für die Transkription: ca. 1,5 GB Speicher für das Whisper-Modell `medium` (siehe `scripts/whisper-config.mjs`)

## Schnellstart

```bash
npm install
npm run dev          # Remotion Studio im Browser öffnen (Live-Vorschau, Props editierbar)
npm run render       # -> out/animated3d.mp4
npm run still        # -> out/animated3d.png (Einzelbild, Frame 60)
```

## Erklärvideo-Episoden (Komposition `SolarSystem`)

Story-Erklärvideos im Cartoon-Stil: englische KI-Stimme, wortgenaue 1–3-Wort-Untertitel,
3D-Welt mit Cel-Shading und schwarzen Konturen, Sticker, Soundeffekte, Musikbett.

**Pipeline** (`npm run episode -- episodes/solar-system.json`):

1. **Drehbuch** `episodes/<id>.json`: Szenen mit Sprechtext und *Cues*. Ein Cue ist an ein Wort gebunden
   und löst einen Sticker, Soundeffekt oder „Beat“ (Kameraschnitt/Aktion in der Szene) aus.
2. **Stimme** `scripts/tts.py`: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), lokal,
   Standardstimme `af_heart` (laut `VOICES.md` des Modells einzige englische Stimme mit Note A).
   Zahlen werden für die Aussprache ausgeschrieben (gemessen: „1,000“ wurde sonst „one zero zero zero“).
3. **Timing**: Whisper.cpp (`scripts/whisper-words.mjs`) liefert Wort-Zeitstempel; die Untertitel zeigen
   trotzdem exakt den Skripttext (`scripts/make_episode.py`, Abgleich per `difflib`).
4. **Musik + Effekte** `scripts/make_audio.py`: vollständig synthetisch erzeugt (keine Lizenzfragen).
5. **Video**: `src/episode/` – `Episode.tsx` liest `public/episodes/<id>/timeline.json` + `captions.json`;
   jede Szene ist eine Komponente in `src/episode/scenes/`, Baukasten in `src/episode/kit/`
   (Figuren `Toonie`/`Milo`/`Boss`, Planeten, Requisiten, Partikel, Kamera `Shot`).

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
npm run setup:voice                       # Kokoro-Modell + Stimmen nach voices/kokoro
node -e "import('@remotion/install-whisper-cpp').then(m=>m.installWhisperCpp({to:'whisper.cpp',version:'1.6.0'}))"
curl -L -o whisper.cpp/ggml-medium.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin
npm run episode -- episodes/solar-system.json
npm run render:episode                    # -> out/solar-system.mp4
```

**Fertiges Ergebnis (v2, gemessen mit ffprobe/ebur128):** 87,3 s, 1080×1920, 30 fps, H.264 + AAC 48 kHz,
integrierte Lautheit −14,0 LUFS (nach `scripts/finalize.sh`), Render ~40 Min ohne GPU (`--gl=swangle`).
Das Video selbst (`out/`) wird nicht committet.

Fakten-Belege für das Sonnensystem-Video: `docs/quellen-sonnensystem.md` (NASA-Faktenseiten, wörtlich zitiert).

**Neue Episode:** Drehbuch-JSON schreiben und für jede Szenen-`id` eine Komponente in
`src/episode/scenes/` anlegen und in `scenes/index.ts` eintragen. Die Szenen sind bewusst Code
(Kamera, Figuren, Aktionen) – Text und Timing kommen automatisch aus der Pipeline.

**Bekannte Grenze:** `<Outlines>` aus drei erscheint beim Remotion-Rendering nicht (getestet);
deshalb nutzt `kit/toon.tsx` eine eigene Kontur (`<Ink>`, Inverted Hull).

## Eigenes Video mit Sprache + Captions

1. Audiodatei ablegen, z. B. `public/audio/voiceover.mp3`
2. Captions erzeugen (Sprache Deutsch, einstellbar in `scripts/whisper-config.mjs`):
   ```bash
   npm run transcribe                       # alle Dateien in public/audio/
   npm run transcribe -- public/audio/voiceover.mp3 --force
   ```
   Ergebnis: `public/captions/voiceover.json`. Beim ersten Lauf werden Whisper.cpp und das Modell heruntergeladen.
3. In Remotion Studio bei der Komposition **Animated3D** die Props setzen – oder direkt rendern:
   ```bash
   npx remotion render Animated3D out/voiceover.mp4 \
     --props='{"title":"Mein Video","accentColor":"#39E508","audioFile":"audio/voiceover.mp3","captionsFile":"captions/voiceover.json"}'
   ```
   Die Videolänge richtet sich automatisch nach der Audiodatei (ohne Audio: 10 s).

`public/captions/demo.json` enthält nur **Beispiel-Captions** (keine echte Transkription), damit die Vorschau sofort etwas zeigt.

## Projektstruktur

```
src/
  Root.tsx                     Kompositionen (Animated3D, PhoneDemo)
  animated-3d/
    Animated3DVideo.tsx        Layout: 3D-Canvas + Titel + Captions + Audio, Props-Schema (zod)
    ShapesScene.tsx            Die Three.js-Szene  <- hier eigene 3D-Animationen bauen
  captions/
    Captions.tsx               Lädt Caption-JSON, TikTok-Seiten via createTikTokStyleCaptions
    CaptionPage.tsx            Darstellung + Wort-Highlight
    load-font.ts               lädt public/theboldfont.ttf
  phone-demo/                  Original-Beispiel aus dem Three-Template (Video als 3D-Textur)
scripts/
  transcribe.mjs               Whisper.cpp-Transkription -> public/captions/*.json
  whisper-config.mjs           Modell, Sprache, Version
public/                        Assets (über staticFile() erreichbar)
```

## Wichtige Regel für 3D in Remotion

Animationen **immer aus `useCurrentFrame()` berechnen** (mit `interpolate()` / `spring()`),
nicht mit `useFrame()` oder `clock.elapsedTime` von React Three Fiber und nicht über
`useEffect`. Sonst stimmt das gerenderte Video nicht mit der Vorschau überein.
Drei-Komponenten mit eigener Zeit-Animation (z. B. `Float`, `MeshDistortMaterial`) deshalb meiden.
Quelle: https://www.remotion.dev/docs/three

## Rendern ohne Grafikkarte (Server/CI/Cloud)

`remotion.config.ts` nutzt `--gl=angle` (aus dem Template). Auf Maschinen ohne GPU schlägt
das mit `Error creating WebGL context` fehl – dann Software-Rendering verwenden:

```bash
npx remotion render Animated3D out/video.mp4 --gl=swangle
```

## Lizenzen

- Remotion ist für Einzelpersonen und Teams bis 3 Personen kostenlos; darüber ist eine Firmenlizenz nötig: https://www.remotion.pro/license
- Template-Code: MIT (`LICENSE.md`)
- Schrift „The Bold Font“: siehe `public/theboldfont-license.rtf`
