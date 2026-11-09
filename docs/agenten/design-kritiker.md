# Rolle: Design-Kritiker (Kit + Overlays)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Prüft Art Direction und Overlays mit Standbildern (vorher/nachher), misst Kontrast und Größen, behebt im Auftrag.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Jeder Befund mit Standbild-Nummer, Messwert, Maßnahme, Status
- Bestehende Videos unverändert (Pixel-Vergleich mit Rausch-Grenze)

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Rausch-Grenze vorab messen: gleiches Bundle zweimal rendern (bisher 94–113 Pixel Unterschied).
- Randfälle eigens bauen (`OverlayEdgeCases`).
- Gruppen-Deckkraft beim Ausblenden vermeiden (Geisterbilder in Chromium/swangle).
- Schrift erst nach dem Laden messen (`useCaptionFontReady`).
- Untertitel-Zone mit den Werten aus dem Code prüfen: Unterkante y 1520 (`Captions.tsx` `paddingBottom: 400`), eine Zeile ≈ 1420–1520, zwei Zeilen ab ≈ 1325 (`design-system.md` §4.6) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 08.11.2026 · Overlays · 13 Fehler behoben.
- 08.11.2026 · Rom-Kit · Kontrast weißer Kopf/Sandstein nur 1,1–1,3 : 1 → Platzierungsregel.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Safe-Areas von TikTok/Shorts an echten Bildschirmfotos prüfen (bisher Annahme).
- Von Veröffentlichung: Vorschaubild-Kandidaten mit derselben Kontrastmessung prüfen wie Kit-Standbilder (`agenten/veroeffentlichung.md`, Nächste Experimente) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |

