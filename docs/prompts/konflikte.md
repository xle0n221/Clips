# Konflikte zwischen Regeln und Entscheidungen (Autopilot-Regel §0)

Rangfolge für die Herstellung: Erweiterung > Basis-Prompt > Hausregeln. Die Upload-Strategie gilt für Veröffentlichung und Auswertung, der Autopilot dafür, wer freigibt und woher Themen kommen. Hier wird nur angefügt, nie gelöscht.

| Nr. | Datum | Konflikt | Entscheidung | Grund |
| --- | --- | --- | --- | --- |
| K1 | 14.11.2026 | `docs/dashboard-ablauf.md`, `CLAUDE.md`: Freigabe 1, Hörprobe und Freigabe 2 durch den Nutzer ↔ Autopilot §2: Selbstfreigabe | Selbstfreigabe mit belegten Noten (`decision.via = "autopilot"`); alte Texte bleiben stehen | Autopilot §0: „Wo ältere Texte eine Freigabe … verlangen, gibst du ab jetzt selbst frei“ |
| K2 | 14.11.2026 | Upload-Strategie §7: Plan-Änderung „gilt erst nach meinem ok“ ↔ Autopilot §0 | Plan-Änderungen gebe ich selbst frei, nach den Änderungsregeln aus §7 (≥ 5 Videos je Slot, höchstens 1–2 h) | Autopilot §0 „Das gilt auch für Plan-Änderungen“ |
| K3 | 14.11.2026 | Ältere fertige Videos (Tyson, UFC, Huang, Rom, Erde): bisher „hold, nach deinem ok“ ↔ Autopilot: kein Warten | Sie bleiben zurückgestellt, bis eine nachgeholte Endkontrolle ≥ 9 vorliegt. Nur `out/ufc.mp4` liegt im Container, die übrigen Dateien nicht | Grundregel: „nie mit schwächerer Prüfung … im Zweifel geparkt“ |
| K4 | 14.11.2026 | Sprechtempo: Hausregel 2,3–2,6 W/s ↔ Basis-Prompt STEP 4b 2,5–2,75 W/s | 2,5–2,75 W/s (gemessen über das ganze Video ohne Cover und End-Card); Spannungsteile dürfen langsamer sein, solange der Durchschnitt hält | Basis-Prompt > Hausregeln |
| K5 | 14.11.2026 | Länge: Basis-Prompt 90–140 s ↔ Hausregel ≥ 62 s ↔ Dashboard-Wunsch je Video | Autopilot-Themen: 90–140 s. Bauarbeiter bleibt bei ~82 s (Dashboard-Wunsch des Nutzers 65 s und Mindestlänge 62 s, vor dem Autopilot angelegt) | Basis-Prompt > Hausregeln; ein ausdrücklicher Wunsch des Nutzers zu einem Video geht für dieses Video vor |
| K6 | 14.11.2026 | Untertitel: Basis-Prompt und `CLAUDE.md` Wort für Wort ↔ Erweiterung 2–5-Wort-Phrasen | Phrasen | Erweiterung > Basis |
| K7 | 14.11.2026 | Stil: Hausregel 11.11. „je Thema 3D/2D frei“ ↔ Basis-Prompt 3D-Klotzfiguren | 3D-Klotzfiguren | Basis > Hausregeln; Nutzer 14.11.: „Ab jetzt alle Videos so wie das“ |
| K8 | 14.11.2026 | Autopilot §1.5: nur Themen mit Schnitt ≥ 8 in die Warteschlange ↔ vom Nutzer selbst eingetragene Themen | Nutzer-Themen bleiben in der Warteschlange und werden mitbewertet und sortiert; unter 8 → nach hinten mit Vermerk, gelöscht wird nichts | Autopilot §0: nichts löschen; der Nutzer hat sie ausdrücklich eingetragen |
| K9 | 14.11.2026 | Station 2 „Whisper-Abgleich ≥ 98 %“: Whisper schreibt Zahlen als Ziffern („214“ statt „two fourteen“) | Gezählt wird die Wort-Erkennung nach Zahlen-Normalisierung; Schreibweise ist kein Sprechfehler | Ziel der Regel ist die Aussprache (`clip-regeln.md` „Stimme“) |
