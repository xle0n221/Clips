# Clips – Hinweise für Claude

- Antworten an den Nutzer auf Deutsch; die Videos selbst sind auf Englisch.
- **Standard: sparsam bei gleicher Qualität** (Vorgabe des Nutzers) – nur so viele Agenten wie nötig, neue
  Sitzung je Video, kurze Aufträge/Antworten, Warten ohne Abfragen; Prüfpaare und Freigaben bleiben.
  Details: `docs/agenten/README.md` → „Sparsam arbeiten“ und „Modellwahl je Aufgabe“ (haiku leicht · sonnet Standard · opus schwer).
- **Alles automatisch** (Vorgabe Nutzer 11.11.2026): keine Rückfragen im Chat; Umgebungsänderungen (Hosts, Setup-Skript) bei echtem Bedarf sofort selbst beantragen – Details `docs/claude-arbeitsweise.md` → „Automatik“.
- **Sitzung automatisch erneuern, ohne Rückfrage**, sobald sie zu lang wird: `docs/sitzungswechsel.md`.
- Arbeitsweise mit Claude (Plan vor Bau, Worktrees, Prüfpaare, `/skillspector`, diese Datei < 200 Zeilen): `docs/claude-arbeitsweise.md`.
- Wahrheit vor Tempo: Fakten nur aus Primärquellen mit Zitat + URL, Unbelegtes kennzeichnen
  („Ich kann das nicht bestätigen“), Zahlen mit Herleitung.

## Hauptsteuerung ist das Dashboard „Clips Studio“
https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H – Themen, Freigaben, Texte und Hashtags laufen dort.
Wer ein Video aus dem Dashboard bearbeitet, hält sich an **`docs/dashboard-ablauf.md`** und **`docs/agenten-team.md`** (Agenten-Team, gegenseitige Prüfung, Repo→Dashboard-Sync)
(Auswahl, Sperre, Status-Felder, Freigaben). Datenmodell: `dashboard/README.md`.
Jeder beauftragte Agent bekommt seine Rollen-Datei aus `docs/agenten/` mit (Lern-Kreislauf: vorher lesen, ein Experiment, nachher eintragen).

## Ein Video herstellen
Skill `clip-video` (`.claude/skills/clip-video/SKILL.md`) und verbindliche Regeln `docs/clip-regeln.md`.
Stil: **je Video passend zum Thema entscheiden** (Vorgabe Nutzer 11.11.2026) – 3D (Bau-Kit `src/episode/kit/`),
2D (flach/SVG/Paper-Cut) oder Mischung; Figuren dürfen je Video anders aussehen. Entscheidung + Begründung im
Drehbuch-Feld `style`; Regeln: `docs/clip-regeln.md` → „Stilwahl“. Format immer 1080×1920.
Themenunabhängiger Ablauf und Muster je Themen-Art: `docs/playbook-themen.md`.
Letzter Rückblick + Kurzablauf für den nächsten Clip: `docs/rueckblick-roemisches-reich.md`.

## Nicht anfassen ohne Auftrag
- `public/episodes/` des fertigen Sonnensystem-Videos und andere Video-Branches als den eigenen.
- Die Dashboard-Seite nur mit vorherigem `Artifact`-`read` neu veröffentlichen (sonst neue, leere Seite).
