---
name: clip-video
description: Erstellt ein englisches 3D-Cartoon-Story-Short (9:16, ~60–90 s) zu einem beliebigen Thema mit Remotion + Three.js – von Recherche über Drehbuch, Stimme, Untertitel und 3D-Szenen bis zum fertigen Video. Verwenden, wenn der Nutzer ein neues Video/einen Clip zu einem Thema möchte oder Stimme/Tempo eines bestehenden Clips ändern will.
---

# Clip-Video erstellen

Lies **zuerst vollständig** `docs/clip-regeln.md` – die Regeln dort sind verbindlich (roter Faden,
„süchtig machend“, Themen-Treue, Sprache/Stimme, Referenzwerte, technische Fallstricke).
Antworte dem Nutzer auf Deutsch, das Video selbst ist auf Englisch.
Ablauf-Checkliste mit Rollen und Muster je Themen-Art (Hook, Erzähl-Klammer, Figur, Quellen, Fallen):
`docs/playbook-themen.md`.

**Kommt das Video aus dem Dashboard „Clips Studio“** (Dokument in der Collection `videos`), gilt
zusätzlich `docs/dashboard-ablauf.md`: Status, Kennzahlen und Freigaben (Freigabe 1 und 2) laufen
dann über das Dashboard statt über den Chat, Stimme/Länge/Notiz/Inspiration kommen aus dem Dokument.

## 0. Umgebung prüfen
- `.venv` mit `requirements.txt`, `voices/kokoro/` (`npm run setup:voice`), `whisper.cpp/` mit
  `ggml-medium.bin` (Befehle in README, Abschnitt „Erklärvideo-Episoden“). Downloads per `curl`.
- Ohne GPU: Rendern und Standbilder mit `--gl=swangle`; in Cloud-Containern ggf.
  `--browser-executable` auf das vorinstallierte Chromium-Headless-Shell setzen.

## 1. Recherche (Primärquellen)
- Fakten nur aus Primärquellen; jede Aussage mit wörtlichem Zitat + URL in `docs/quellen-<thema>.md`.
- Gängige, aber falsche Angaben/Klischees prüfen und vermerken (Beispiel: NASA 1.000 statt „1.300 Erden“).
- Was nicht belegbar ist, kommt nicht ins Video.

## 2. Story + Drehbuch → `episodes/<thema>.json`
Format wie `episodes/solar-system.json`: `id`, `title`, `voice`, `speed`, `sceneGapMs`, `scenes[]`
mit `id`, `text` und `cues` (an ein Wort gebunden: `sticker`+`color`, `sfx` boom|pop|whoosh|ding, `beat`).
- Struktur nach `docs/clip-regeln.md`: zentrale Frage in den ersten 2 s → Einsatz → Kausalkette →
  Eskalation → Wendepunkt → Auflösung → Loop zum ersten Satz.
- ~3,3–3,6 Skriptwörter/s ⇒ 60 s ≈ 200–215 Wörter, 90 s ≈ 300 Wörter (Zielwert und Messungen:
  `docs/clip-regeln.md`, Sprache & Stimme).
- Zahlen als Ziffern schreiben (die Sprachausgabe schreibt sie automatisch aus).
- **Freigabe 1:** Drehbuch + Quellen dem Nutzer vorlegen, erst nach OK weiter.

## 3. Audio + Timing
`npm run episode -- episodes/<thema>.json` (Optionen: `--voice <name>`, `--speed <x>`, `--save`)
- Prüfen: Ausgabe „Abgleich: N/M Wörter“ (Ziel ≥ 98 %); Gesamtlänge und Wörter/s notieren.
- **Tempo vorher kalibrieren:** `npm run calibrate -- episodes/<thema>.json` erzeugt nur die Stimme für
  ~5 Tempo-Werte (ohne Whisper/Musik, nichts in `public/`), misst Dauer + W/s und empfiehlt einen Wert im
  Zielband 3,3–3,6 W/s. Kokoro wirkt nicht linear: zwischen 1,33 und 1,34 wird die Tonspur ~10 % kürzer
  (beide getesteten Stimmen) – nie linear hochrechnen. Rom: 5 Werte in 89 s (ruhige CPU) bzw. 351 s (geteilt).
- Aussprache-Gegenprobe: `node scripts/whisper-words.mjs` auf `voice.wav` (16 kHz) und mit dem
  ausgeschriebenen Skript vergleichen – Abweichungen außer Ziffernschreibweise beheben.

## 4. Szenen bauen (Themen-Treue!)
- Startpunkt: `npm run scaffold -- episodes/<thema>.json` → `src/episode/scenes/<id>-template.tsx` mit einer
  Komponente pro Szene (Kommentar: Text, `visual`, Cues mit Zeit; Beat-Schnitte per `shotIndex` vorbereitet,
  Zeiten aus `timeline.json`, also nach Schritt 3 laufen lassen). Überschreibt nie; lint-sauber.
- Pro Szenen-`id` eine Komponente in `src/episode/scenes/` (Vorbild: `part1.tsx`, `part2.tsx`),
  in `scenes/index.ts` eintragen. Baukasten: `src/episode/kit/` (Toonie-Figuren, Planeten,
  Requisiten, Partikel, `Shot`-Kamera, `<Ink>`-Konturen). Neue themenspezifische Figuren/Kostüme/
  Kulissen als wiederverwendbare Komponenten im Kit ergänzen.
- Hauptfigur im **Kostüm des Themas**; Standbild ohne Ton muss das Thema verraten.
- Einstellungen auf `beat`s schneiden, alle 2–3 s neue Einstellung **innerhalb derselben Handlung**;
  Ortswechsel zeigen (Reise/Übergang). Alles **vertikal** komponieren, unteres Drittel frei für Untertitel.
- Komposition in `src/Root.tsx` registrieren (wie `SolarSystem`, Prop `episode`).
- `npm run lint` muss sauber sein.

## 5. Prüfbilder (Pflicht vor dem Render)
- `npm run contactsheet -- --comp <Komposition> --per-scene 3` (oder `--every 2`, `--at 0.8,7.7`; `--scale 0.25`,
  `--out out/x.jpg`): bündelt einmal, ein Browser für alle Bilder, beschriftet (Szene, Sekunde, Frame), ffmpeg
  `tile`. Gemessen 3,3–4 s/Bild statt 5,7 s je `npx remotion still`. Kein eigener Ad-hoc-Code mehr nötig.
- Checkliste: nichts außerhalb des Bildes, keine leeren Einstellungen, Figuren nicht verdeckt,
  Sticker enden mit ihrer Szene, Thema erkennbar, roter Faden sichtbar.
- **Freigabe 2:** Kontaktabzug dem Nutzer zeigen, erst nach OK rendern.

## 6. Render + Abschluss
- `npx remotion render <Komposition> out/<thema>-raw.mp4 --crf=18 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --gl=swangle`
  (im Hintergrund; ~40 Min für 87 s auf 4 CPU-Kernen ohne GPU, Rom mit mehr Figuren ~70 Min geschätzt).
  Ohne `--browser-executable` will Remotion Chromium von remotion.media laden – das Netz der Cloud-Umgebung
  sperrt den Host (ENOTFOUND, 09.11.2026).
- `scripts/finalize.sh out/<thema>-raw.mp4 out/<thema>.mp4` (−14 LUFS).
- Endkontrolle: `ffprobe` (1080×1920, 30 fps, AAC), Lautheit (`ebur128`), Kontaktabzug alle 3 s.
- Video an den Nutzer senden, ehrlich über bekannte Schwächen berichten, committen, pushen.

## Stimme eines fertigen Clips ändern
`npm run episode -- episodes/<thema>.json --voice <name> --save`, danach Schritt 6.
Erlaubte Stimmen (Name oder ID, zentrale Liste `scripts/voices.json`, Hörproben in `assets/stimmproben/`):
**Lily** `af_heart` (technischer Standard, Note A; Rom nutzt eine Mischung, siehe `docs/clip-regeln.md`), **Bella** `af_bella` (A-), **Finn** `am_fenrir` (C+), **Max** `am_puck` (C+)
– Noten laut `VOICES.md` von hexgrad/Kokoro-82M. Namen identisch mit dem Dashboard „Clips Studio“.
Die Szenen bleiben unverändert; Untertitel, Sticker und Schnitte werden automatisch neu getimt.
