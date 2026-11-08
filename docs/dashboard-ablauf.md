# Ablauf: Videos über das Dashboard „Clips Studio“

Das Dashboard ist die Hauptsteuerung. Der Nutzer trägt dort Themen ein, gibt Drehbuch und
Kontaktabzug frei (OK / Nicht OK + Feedback) und holt Titel, Texte und Hashtags ab.
Claude macht nur den Feinschliff, wenn der Nutzer ihn direkt anspricht.

- Seite: https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H (privat)
- Datenbank: Collection `videos`, ein Dokument pro Video, `doc_id` = Slug. Felder und Bedeutung:
  `dashboard/README.md`, Abschnitt „Datenmodell“. Lesen und Schreiben **nur** mit dem Tool `ArtifactData`
  (`url` = Seiten-URL), jede Schreibaktion mit `if_version` der zuletzt gelesenen Version.
- Herstellung selbst: Skill `.claude/skills/clip-video/SKILL.md` und die verbindlichen Regeln
  `docs/clip-regeln.md`. Dieses Dokument legt nur fest, **wann was ins Dashboard geschrieben wird**.

## Wer arbeitet?
Die geplante Aufgabe **„Clips Dashboard-Abholer“** startet stündlich eine neue Cloud-Sitzung
(Umgebung „Clips“). Jede Sitzung erledigt **einen** Schritt für **ein** Video bis zur nächsten
Freigabe (oder bis „fertig“) und endet dann. Der Zwischenstand liegt auf dem Git-Branch des Videos,
damit die nächste Sitzung weitermachen kann.

## 1. Auswahl (in dieser Reihenfolge, genau ein Video)
1. `review` gesetzt **und** `decision` gesetzt **und** nicht `busy` → Entscheidung umsetzen.
2. `busy: true`, aber `updatedAt` älter als 3 Stunden → abgebrochene Arbeit, dort weitermachen.
3. Ältestes Dokument mit `stage: "queued"` → neu beginnen.
4. Sonst: nichts tun, keine Schreibaktion, Sitzung beenden.

## 2. Übernehmen (Sperre)
`update` mit `if_version`: `busy: true`, `sessionId` (eigene Sitzungs-ID), `statusText`, `updatedAt`.
Scheitert das wegen einer neueren Version, hat eine andere Sitzung übernommen → neu lesen, ggf. Ende.
Während der Arbeit `updatedAt` mindestens alle 30 Minuten erneuern (zusammen mit `statusText`).

## 3. Repo
- `add_repo` (owner `xle0n221`, repo `Clips`, access `push`), klonen.
- Neues Video: Branch `claude/clip-<slug>` von `claude/clips-dashboard` anlegen (enthält Pipeline,
  Bau-Kit und Dashboard), in `branch` eintragen. Weitermachen: diesen Branch auschecken.
- An jeder Freigabe und am Ende committen und pushen.

## 4. Schritte und was ins Dashboard kommt
| Schritt (Skill) | `stage` | Schreiben |
| --- | --- | --- |
| Recherche (1) | `research` | `statusText` |
| Drehbuch fertig, Freigabe 1 (2) | `script` | `review: { kind: "script", title, text, sources: [{claim, quote, url}], corrections?, scenes? }`, `decision: null`, `busy: false` |
| Audio + Timing (3) | `scenes` | `metrics: { durationSec, words, wordsPerSec, whisperMatch, voice }` |
| Szenen + Prüfbilder, Freigabe 2 (4–5) | `scenes` | Kontaktabzug als Asset hochladen → `review: { kind: "contactsheet", title, imageUrl, scenes }`, `decision: null`, `busy: false` |
| Render (6) | `render` | `renderProgress` (0..1) und `renderEta` aus dem Remotion-Log, mind. alle 10 Min. |
| Fertig | `done` | `review: null`, `busy: false`, `previewUrl` (verkleinerte Vorschau, < 15 MB), `fileSizeBytes`, `publish` (siehe unten) |
| Fehler | `error` | `statusText` = Fehler in Klartext, `busy: false` |

Vom Dashboard gewählte Stimme: Feld `voice` (Kokoro-ID) → ins Drehbuch `episodes/<slug>.json` übernehmen.
Wunschlänge `lengthSec` → Wortzahl mit 3,3–3,6 Wörtern/s planen. `note` und `inspiration` (Dateien:
Artifact-Tool `action: "read"`, `path` = `id`) beim Drehbuch berücksichtigen.

## 5. Entscheidung umsetzen
- `decision.value == "ok"` → `review: null`, `decision: null`, nächster Schritt.
- `"not_ok"` → `decision.feedback` (und `decision.scene`, falls gesetzt) umsetzen, dieselbe Stufe neu
  vorlegen (neues `review`, `decision: null`). Feedback nie stillschweigend übergehen.
- Die Seite schreibt `decision` – die Sitzung setzt es nur auf `null` zurück.

## 6. Veröffentlichen-Texte (`publish`)
Hashtags aus `hashtags/current` (Kombi passend zum Thema, 1–2 Tags themenspezifisch ersetzen),
Grenzen und Quellen: `dashboard/README.md`, Abschnitt „Veröffentlichen“.
YouTube: `title` ≤ 100 Zeichen, `description`, `hashtags`; TikTok: `caption`, höchstens 5 `hashtags`. Englisch.

## 7. Wenn etwas blockiert
Netzwerk-Sperre, fehlender Schlüssel, Freigabe in der Claude-App nötig → `actionNeeded` mit einem
Satz, was der Nutzer tun muss, `busy: false`, Sitzung beenden. Nichts erfinden, was nicht belegbar ist.

## Stil (damit jedes Video wie das Sonnensystem-Video aussieht)
- Nur mit dem Bau-Kit `src/episode/kit/` arbeiten und es erweitern, nicht neu erfinden:
  Cel-Shading mit 3-stufigem Verlauf (`toonGradient`, `Toon`), schwarze Kontur `<Ink>` in `INK = #141414`,
  Figuren `Toonie` (großer weißer Rundkopf, Strichglieder, Augen/Münder aus festen Varianten), Kamera `Shot`,
  Effekte aus `fx.tsx`, Umgebungen aus `env.tsx`.
- Untertitel, Sticker, Musik und Effekte kommen aus der vorhandenen Pipeline (`src/episode/overlays/`).
- Format 1080×1920, 30 fps; Themen-Treue, Kostüm und Farbwelt nach `docs/clip-regeln.md`.
