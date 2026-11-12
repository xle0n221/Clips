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
**Thumbnail Pflicht** (Vorgabe 12.11.2026): erste 0,5 s jedes Clips = gestaltetes Cover zum Auswählen auf den Plattformen – `docs/clip-regeln.md` → „Thumbnail im Video“.
Stil: **je Video passend zum Thema entscheiden** (Vorgabe Nutzer 11.11.2026) – 3D (Bau-Kit `src/episode/kit/`),
2D (flach/SVG/Paper-Cut) oder Mischung; Figuren dürfen je Video anders aussehen. Entscheidung + Begründung im
Drehbuch-Feld `style`; Regeln: `docs/clip-regeln.md` → „Stilwahl“. Format immer 1080×1920.
Themenunabhängiger Ablauf und Muster je Themen-Art: `docs/playbook-themen.md`.
**Musik je Thema** (Vorgabe Nutzer 12.11.2026, gilt für alle künftigen Videos): nie dieselbe Musik – passend zum Thema und zeitgemäß, „ähnlich was momentan im Trend ist“ (düster → trendiger düsterer Sound usw.); Preset `music.mood` im Drehbuch, Sound-Trends aus `docs/trends/aktuell.md`; Claude macht die Musik komplett selbst (Stil an aktuell trendender Musik orientieren, nie fremde Melodien kopieren), der Nutzer unterlegt nichts selbst; Grundcharakter gern Rap- & R&B-lastig, angenehm zu hören (Vorgabe 12.11.2026) – Regeln `docs/clip-regeln.md` → „Musik je Thema“.
**Tempo ruhiger** (Vorgabe Nutzer 12.11.2026): „Im Allgemeinen sollen die Videos etwas langsamer sein, also die Redegeschwindigkeit mit dem Video zusammen. Es soll angenehm sein zu schauen.“ → Sprechtempo 2,3–2,6 W/s (Ziel 2,4; vorher 2,6–3,0), Einstellungen eher 3–4 s, sanfte Kamera/Übergänge – `docs/clip-regeln.md`. Bestätigt durch Branchen-Benchmark `docs/trends/benchmark-tempo.md` (ruhige virale Erzähl-Shorts 2,2–2,6 W/s; Erzähl-Shorts dauern meist 52–67 s, Median 56 s → Länge **mindestens 62 s** (Nutzer 12.11.2026), ohne Wunschlänge ~62–70 s planen). Gilt für jedes Video (Nutzer 12.11.2026: „ab jetzt jedes Video so“).
**Stimme wie ein Synchronsprecher** (Vorgabe Nutzer 12.11.2026, Regel für jedes Video): „Die Stimmen sollen lebensecht klingen und so klingen wie echte Menschen. Das, was gesagt wird, soll thematisch auch so emotional ausgedrückt werden – als würde ein Synchronsprecher das Skript sprechen.“ → je Szene/Satz passende Emotion (traurig, wütend, staunend, ironisch …) statt gleichförmigem Vorlesen; Regeln `docs/clip-regeln.md` → „Stimme“.
**Hören mit earshot** (Vorgabe Nutzer 12.11.2026): Audio nie „nach Gefühl“ beurteilen – Skill `earshot` (`.claude/skills/earshot/SKILL.md`, Setup `scripts/setup_earshot.sh`) für Stimme, Musik und fertige Videos nutzen und die Messwerte in der Freigabe nennen.
**Trends täglich** (Vorgabe 12.11.2026): was bei Cartoon-Shorts viral geht → `docs/trends/aktuell.md` vor Drehbuch und Szenenbau lesen; Ablauf `docs/trend-analyse.md`.
Letzter Rückblick + Kurzablauf für den nächsten Clip: `docs/rueckblick-roemisches-reich.md`.

## Nicht anfassen ohne Auftrag
- `public/episodes/` des fertigen Sonnensystem-Videos und andere Video-Branches als den eigenen.
- Die Dashboard-Seite nur mit vorherigem `Artifact`-`read` neu veröffentlichen (sonst neue, leere Seite).
