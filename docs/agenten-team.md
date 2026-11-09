# Agenten-Team: jeder Clip wird von mehreren Agenten gebaut und gegenseitig geprüft

Vorgabe des Nutzers (08.11.2026): Viele Agenten erstellen die Clips, jede Rolle wird von einer
anderen kontrolliert, und Repo und Clips sollen sich ständig weiterentwickeln, bis das Ergebnis das
ansehnlichste Produkt auf dem Markt ist. Das jetzige Aussehen ist nur der Anfang.

Orchestrator ist die Sitzung **„CLIPS“**. Sie startet die Agenten, entscheidet bei Uneinigkeit,
committet und pusht und hält das Dashboard aktuell. Die Freigaben des Nutzers im Dashboard
(Drehbuch, Kontaktabzug) bleiben bestehen.

## Rollen und Prüfpaare (Ersteller → Prüfer)
| # | Ersteller | Ergebnis (nur diese Dateien) | Prüfer | Prüft vor allem |
| --- | --- | --- | --- | --- |
| 1 | Recherche | `docs/quellen-<thema>.md` | Faktenprüfer | jedes Zitat gegen die URL, Zahlen-Herleitung, Mythen markiert |
| 2 | Drehbuch | `episodes/<thema>.json` | Retention-Kritiker + Faktenprüfer | Hook in 2 s, roter Faden, Kausalkette, Humor, Loop, Tempo 2,6–3,0 W/s, Stimme nach clip-regeln „Stimme“ (delivery, *Akzentwörter*, | -Pausen), jede Aussage belegt |
| 3 | Art Direction (Farben, Grafik, Kostüme, Kulissen) | `src/episode/kit/<thema>.tsx`, `docs/design-system.md` | Design-Kritiker | Themen-Treue (Standbild ohne Ton verrät Thema), Kontrast auf dem Handy, Konsistenz mit dem Kit, Farbwelt |
| 4 | Szenen/Animation | `src/episode/scenes/<thema>*.tsx` | Regie-Kritiker | Bildausschnitt, Bewegung, Schnitt auf Beats, nichts außerhalb des Bildes, Untertitel-Zone frei |
| 5 | Render, Ton, Endkontrolle | `out/` (nicht im Repo) | Endabnahme | ffprobe, −14 LUFS, Kontaktabzug alle 3 s, Sticker im ersten Frame |

Regeln für die Zusammenarbeit:
- Ein Prüfer schreibt einen Befund mit Ort (Datei, Szene, Sekunde), Problem und Vorschlag. Der
  Ersteller setzt um, der Prüfer prüft erneut. Nach höchstens 2 Runden entscheidet der Orchestrator.
- Fakten nur aus Quellen mit Zitat und URL. Was der Faktenprüfer nicht bestätigen kann, fliegt raus.
- Jeder Agent ändert nur seine eigenen Dateien. Committen und pushen nur der Orchestrator.
- Nur ein Render gleichzeitig (4 CPU-Kerne, ~40 Min für 87 s). Prüfbilder per `renderStill` sind frei.

## Ständige Weiterentwicklung
0. **Gedächtnis je Rolle** in [`docs/agenten/`](agenten/README.md): Jeder Agent liest vor dem Auftrag
   seine Rollen-Datei (Checkliste, Gelerntes, Experimente) und ergänzt sie danach mit Note, Befund und
   neuem Experiment. So lernt jede Rolle (Animation, Artwork, Drehbuch, Stimme, …) von Clip zu Clip.
1. **Lernprotokoll** `docs/verbesserungen.md`: Nach jedem Clip tragen die Prüfer ihre Befunde ein
   (was gut war, was schlecht war, Beleg-Standbild). Was zweimal auftritt, wird zur Regel in
   `docs/clip-regeln.md` oder zur Korrektur im Bau-Kit.
2. **Verbesserungsrunde** (geplante Aufgabe, wöchentlich): Ein Kritiker-Team bewertet das letzte
   Video, wählt die 3 wirkungsvollsten Verbesserungen (Optik, Animation, Story-Technik), setzt sie im
   Kit um, belegt sie mit Vorher/Nachher-Standbildern und lässt sie von einem zweiten Agenten prüfen.
   Kein bestehendes Video wird dafür neu gerendert.
3. Messbar bleiben: Referenzwerte (Wörter/s, Schnittfrequenz, Untertitel-Größe, LUFS) stehen in
   `docs/clip-regeln.md`. Eine Änderung, die einen Wert verschlechtert, braucht eine Begründung.

## Repo → Dashboard (automatisch nach jedem Push)
1. `python3 scripts/repo-status.py > out/repo-status.json`
2. `ArtifactData` `get` meta/repo (Version merken). Dann `set` meta/repo mit `file_path`
   `out/repo-status.json` und `if_version` (beim ersten Mal ohne). Das Dashboard zeigt es unter „Repo-Stand“.
3. Hat sich `dashboardFileCommit` gegenüber dem gespeicherten Wert geändert: Seite neu veröffentlichen.
   Dazu erst `Artifact` `read` (url ohne `path`), dann `publish` mit `file_path: dashboard/index.html`
   und `url` https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H. Die übrigen Dateien (Hörproben,
   `last-action.json`) bleiben erhalten, weil sie in `files` nicht genannt werden.
