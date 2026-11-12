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
- 12.11.2026 · Earth Without Us (2D) · Beschriftungen in 2D-Sets an festen x-Werten laufen bei Kamerafahrt aus dem Bild (HELIOSPHERE `Label x=260` in `earth2.tsx` → „LIOSPHERE“, f4850); Prüfregel: jedes Label in jedem Standbild ganz im Bild? Cover-PNG in `out/` war älter als das Drehbuch (Untertext abweichend) → Cover immer aus Bild 5 des aktuellen Bundles neu ziehen · `scratchpad/v4850.png`, `c5.png`
- 08.11.2026 · Overlays · 13 Fehler behoben.
- 08.11.2026 · Rom-Kit · Kontrast weißer Kopf/Sandstein nur 1,1–1,3 : 1 → Platzierungsregel.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Safe-Areas von TikTok/Shorts an echten Bildschirmfotos prüfen (bisher Annahme).
- Von Veröffentlichung: Vorschaubild-Kandidaten mit derselben Kontrastmessung prüfen wie Kit-Standbilder (`agenten/veroeffentlichung.md`, Nächste Experimente) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 12.11.2026 | Earth Without Us (2D, Kontaktabzug + 2 Standbilder) | 7,5 (Selbstbewertung Design-Kritiker) | Stil 2D passend und konsistent; abgeschnittenes Label, veraltetes Cover-PNG, Kleinteile (Satelliten, Voyager) zu klein |
