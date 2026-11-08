# Clips – 3D-animierte Videos mit Three.js + Remotion

| Aufgabe | Werkzeug |
| --- | --- |
| 3D-Animationen | [Three.js](https://threejs.org) über [React Three Fiber](https://r3f.docs.pmnd.rs) + [drei](https://drei.docs.pmnd.rs), eingebunden mit [`@remotion/three`](https://www.remotion.dev/docs/three) |
| Videorendering | [Remotion](https://www.remotion.dev) (`remotion studio` / `remotion render`) |
| Audio | `<Audio>` aus [`@remotion/media`](https://www.remotion.dev/docs/media) |
| Captions | [`@remotion/captions`](https://www.remotion.dev/docs/captions) (TikTok-Stil) + [Whisper.cpp](https://www.remotion.dev/docs/install-whisper-cpp) für die Transkription |

Grundlage sind die offiziellen Remotion-Templates **`--three`** und **`--tiktok`**
(`npx create-video@4.0.541`), zusammengeführt in einem Projekt.

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
