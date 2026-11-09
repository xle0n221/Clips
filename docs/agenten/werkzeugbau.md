# Rolle: Werkzeugbau (Pipeline, Geschwindigkeit, Wiederverwendung)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Macht künftige Videos **schneller und themenunabhängig**: wiederverwendbare Skripte (Kontaktabzug, Prüfbilder, Tempo-Kalibrierung, Episoden-Gerüst), allgemeine Bau-Kit-Bausteine, Vorlagen. Misst Zeitersparnis. Prüfer: Wissensverwalter + die Rolle, die das Werkzeug nutzt.

## Messlatte (1–10)
- Zeitersparnis gemessen (vorher/nachher, Minuten oder Schritte)
- Funktioniert für jedes Thema, nicht nur Rom
- Dokumentiert in `docs/schnittstelle.md` oder SKILL.md
- `npm run lint` sauber, bestehende Videos unverändert

## Checkliste (aktueller bester Stand – nur Erprobtes)
_noch leer_

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
_noch leer_

## Nächste Experimente
- Kontaktabzug-Skript (`scripts/contactsheet`) statt Ad-hoc-Code in jedem Agenten.
- Tempo-Kalibrierung automatisch (2–3 Tempi aufnehmen, bestes nach W/s + Whisper wählen).
- Episoden-Gerüst: aus `episodes/<id>.json` leere Szenen-Dateien + Komposition erzeugen.
- Von Design-Kritiker/Render: Pixel-Vergleichs-Skript mit eingebauter Rausch-Grenze (Rom: 94–113 Pixel bei gleichem Bundle, `verbesserungen.md`) (übertragen vom Wissensverwalter 09.11.2026).
- Von Veröffentlichung: Skript „Titel → Einlöse-Sekunde aus `captions.json` + Zeichenzahl“ (`agenten/veroeffentlichung.md`) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
