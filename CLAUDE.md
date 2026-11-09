# Clips – Hinweise für Claude

- Antworten an den Nutzer auf Deutsch; die Videos selbst sind auf Englisch.
- **Standard: sparsam bei gleicher Qualität** (Vorgabe des Nutzers) – nur so viele Agenten wie nötig, neue
  Sitzung je Video, kurze Aufträge/Antworten, Warten ohne Abfragen; Prüfpaare und Freigaben bleiben.
  Details: `docs/agenten/README.md` → „Sparsam arbeiten“.
- **Sitzung automatisch erneuern, ohne Rückfrage**, sobald sie zu lang wird: `docs/sitzungswechsel.md`.
- Wahrheit vor Tempo: Fakten nur aus Primärquellen mit Zitat + URL, Unbelegtes kennzeichnen
  („Ich kann das nicht bestätigen“), Zahlen mit Herleitung.

## Hauptsteuerung ist das Dashboard „Clips Studio“
https://claude.ai/artifact/5hB3B36zzQuaX5e78LEr8H – Themen, Freigaben, Texte und Hashtags laufen dort.
Wer ein Video aus dem Dashboard bearbeitet, hält sich an **`docs/dashboard-ablauf.md`** und **`docs/agenten-team.md`** (Agenten-Team, gegenseitige Prüfung, Repo→Dashboard-Sync)
(Auswahl, Sperre, Status-Felder, Freigaben). Datenmodell: `dashboard/README.md`.
Jeder beauftragte Agent bekommt seine Rollen-Datei aus `docs/agenten/` mit (Lern-Kreislauf: vorher lesen, ein Experiment, nachher eintragen).

## Ein Video herstellen
Skill `clip-video` (`.claude/skills/clip-video/SKILL.md`) und verbindliche Regeln `docs/clip-regeln.md`.
Stil: immer das Bau-Kit `src/episode/kit/` (Cel-Shading, `<Ink>`-Kontur, `Toonie`-Figuren) wie im
Sonnensystem-Video, Format 1080×1920.
Themenunabhängiger Ablauf und Muster je Themen-Art: `docs/playbook-themen.md`.
Letzter Rückblick + Kurzablauf für den nächsten Clip: `docs/rueckblick-roemisches-reich.md`.

## Nicht anfassen ohne Auftrag
- `public/episodes/` des fertigen Sonnensystem-Videos und andere Video-Branches als den eigenen.
- Die Dashboard-Seite nur mit vorherigem `Artifact`-`read` neu veröffentlichen (sonst neue, leere Seite).
