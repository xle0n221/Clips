# Rolle: Design-Kritiker (Kit + Overlays)

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Prüft Art Direction und Overlays mit Standbildern (vorher/nachher), misst Kontrast und Größen, behebt im Auftrag.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Jeder Befund mit Standbild-Nummer, Messwert, Maßnahme, Status
- Bestehende Videos unverändert (Pixel-Vergleich mit Rausch-Grenze)

## Checkliste (aktueller bester Stand – nur Erprobtes)
- HUD-Kontrast als weiße Füllung gegen Grund messen (Ziel ≥ 4,5 : 1); auf hellem Papier/Gold braucht es die Platte `hud2d.plate` (Lucia: 1,46 → 6,0 : 1).
- Geänderte gemeinsame Dateien: Diff lesen (neue Props mit neutralem Standard?) + ein Standbild eines anderen Clips ziehen.
- Rausch-Grenze vorab messen: gleiches Bundle zweimal rendern (bisher 94–113 Pixel Unterschied).
- Randfälle eigens bauen (`OverlayEdgeCases`).
- Gruppen-Deckkraft beim Ausblenden vermeiden (Geisterbilder in Chromium/swangle).
- Schrift erst nach dem Laden messen (`useCaptionFontReady`).
- Untertitel-Zone mit den Werten aus dem Code prüfen: Unterkante y 1520 (`Captions.tsx` `paddingBottom: 400`), eine Zeile ≈ 1420–1520, zwei Zeilen ab ≈ 1325 (`design-system.md` §4.6) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 14.11.2026 · Bauarbeiter (3D, KnowToon) · Experiment: Pixelmessung von Sticker-Grau gegen Szenen-Grund im Fade-in (1,4 : 1 auf hellem Mund-Ring, 52,5 s) und Dunkelstellen per mittlerer Luminanz (11-17 bei 64-69 s); Prüfregel: Sticker-Kontrast auch während des Einblendens messen, Sticker, die den Untertitel wörtlich wiederholen, als Doppelung führen · `docs/kritik-bauarbeiter-szenen.md` Design Runde 1
- 13.11.2026 · ZeitWelt Runde 2 · Neue Kollisionsart: Sticker über Bildnachweis-Zeile (1748, 84,3 s) – Prüfregel: Nachweis-Zeilen echter Bilder gegen alle Sticker/Labels derselben Einstellung prüfen, nicht nur gegen Untertitel · `docs/kritik-zeitwelt-szenen.md` Runde 2 N1
- 13.11.2026 · ZeitWelt (3D, KnowToon) · Experiment: Originalitäts-Check gegen Markenfiguren als Merkmalsliste statt Bauchgefühl – LEGO (Noppen, C-Hände, Zylinderkopf), Minecraft (Pixeltextur, scharfe Würfel), Roblox (Blocky-Rumpf, Rechteck-Glieder, Standard-Smiley) gegen Code (`Klotz`, `zeitweltSets.tsx`) und Nahaufnahmen (49,8 / 66,0 s): nur das Grundprinzip „Blocky Avatar“ geteilt, keine Erkennungsmerkmale → bestanden mit Hinweis. Andere Clips per Pixel-Differenz zu einem früheren eigenen Standbild geprüft (Lucia Bild 852: 0,0). HUD min. 14,6 : 1. Text-auf-Text bei echten Bildern: Bildnachweis-Zeile und Karten gehören über y 1300 · `docs/kritik-zeitwelt-szenen.md`
- 13.11.2026 · Jason GTA 6 Runde 2 · Cover-PNG gegen Bild 3 **und** Bild 14 des Bundles verglichen (1,5 / 1,3 Grauwerte) – deckt jetzt das ganze Thumbnail-Fenster ab, nicht nur den Anfang. Fehlende echte Bilder als Bedingung der Note geführt (Begründung in der Freigabe), nicht als Notenabzug, wenn der Ersatz lückenlos ist · `docs/kritik-jason-szenen.md` Runde 2
- 13.11.2026 · Jason GTA 6 (2D) · Experiment: Cover-Fenster Bild 0–14 vollständig auf Blinzeln/Animation geprüft (Bilder 3, 12, 14) statt nur Bild 3/5 – fand geschlossene Augen in Bild 12–14 (`blinkAt` läuft auch im Cover). Prüfregel: im Thumbnail-Fenster alle Figuren-Animationen (Blinzeln, Mund) aus. HUD-Kontrast-Messung automatisch über 64 Bilder: min. 10 : 1 (Platte auf Papier). Leeres Manifest `REAL = {}` per grep gefunden → echte Bilder fehlen ganz; Fallback eines Slots war leer statt Cartoon · `docs/kritik-jason-szenen.md`
- 13.11.2026 · Lucia GTA 6 Runde 2 · Experiment: HUD-Kontrast automatisch über alle 30 Standbilder (hellstes Pixel im HUD-Feld gegen 25-%-Quantil) – Platte `rgba(16,10,26,0,62)` hebt den Tiefstwert von 1,46 auf 6,0 : 1; Quantil-Methode greift beim Ausblenden (69,9/71,6 s) daneben, dort von Hand prüfen. Cover-PNG gegen Bundle-Bild 3 per Pixel-Differenz geprüft (2,5–3,7) statt nur Zeitstempel · `docs/kritik-lucia-szenen.md` Runde 2
- 13.11.2026 · Lucia GTA 6 (2D) · Experiment: Gitterstab-Lage im Cover aus dem Code nachgerechnet (`Bars x0 + k·gap` gegen Figuren-x) statt nur Sichtprüfung – fand Stab mitten im Gesicht (x 480 vs. 470) und lieferte direkt die Korrektur (x0 −130, gap 400). HUD-Kontrast als Füllung/Grund **und** Kontur/Grund messen: weiß auf Creme 1,46 : 1, lesbar nur durch Kontur 14 : 1 → Prüfregel: Füllung < 3 : 1 = Befund. Durchgestrichene Daten (Faktenhinweis) bleiben nur lesbar, wenn X/Stempel nicht über der Zahl liegen · `docs/kritik-lucia-szenen.md` D1/D2/D5
- 12.11.2026 · Mike Tyson (2D) · `pose="sit"` in `kit2d/boxing.tsx` zeigt frontal keine Oberschenkel: Beine hängen gerade unter den Trunks zwischen den Hocker-Beinen → liest sich als Stehen auf Stelzen (Cover, Hook, ear 55,2 s, exodus 59,5 s); Sitzfiguren frontal brauchen sichtbare verkürzte Oberschenkel/Knie oder ¾-Ansicht. `towel="head"` mit dunklem Gesicht liest sich als Kapuze/Kopftuch, nicht als Boxerhandtuch. Keine Porträtähnlichkeit, keine Logos – bestanden. Cover-Untertitel mit Einzelwort-Umbruch („round“) → Zeilenbreite prüfen · `out/tyson-check.jpg`, `out/mike-tyson-cover.png`
- 12.11.2026 · Earth Without Us (2D) · Beschriftungen in 2D-Sets an festen x-Werten laufen bei Kamerafahrt aus dem Bild (HELIOSPHERE `Label x=260` in `earth2.tsx` → „LIOSPHERE“, f4850); Prüfregel: jedes Label in jedem Standbild ganz im Bild? Cover-PNG in `out/` war älter als das Drehbuch (Untertext abweichend) → Cover immer aus Bild 5 des aktuellen Bundles neu ziehen · `scratchpad/v4850.png`, `c5.png`
- 08.11.2026 · Overlays · 13 Fehler behoben.
- 08.11.2026 · Rom-Kit · Kontrast weißer Kopf/Sandstein nur 1,1–1,3 : 1 → Platzierungsregel.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Safe-Areas von TikTok/Shorts an echten Bildschirmfotos prüfen (bisher Annahme).
- Von Veröffentlichung: Vorschaubild-Kandidaten mit derselben Kontrastmessung prüfen wie Kit-Standbilder (`agenten/veroeffentlichung.md`, Nächste Experimente) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 14.11.2026 | Bauarbeiter Runde 1 (Kontaktabzug + 9 Standbilder) | 8,5 (Design-Kritiker) | Sticker 1,4 : 1 bei 52,5 s, leere Fear-Szene mit Sticker-Doppelung, dunkle Szenen 64-69 s, Gesicht ausgeblichen 70,5 s |
| 13.11.2026 | ZeitWelt Runde 2 (Cover + 24 Nachprüfbilder) | 9,0 (Design-Kritiker) | Ida im Cover, Doppel-Sticker weg, ISS-Lichter im Glas; Rest P3 |
| 13.11.2026 | ZeitWelt (3D, Cover + 57 Einzelbilder) | 8,5 (Design-Kritiker) | Cover ohne Hauptfigur, Sticker doppelt zum Schild, ISS-Video in Spiegelung unkenntlich |
| 13.11.2026 | Jason GTA 6 Runde 2 (Cover + 20 Nachprüfbilder) | 9,0 (Design-Kritiker) | Cover ohne Blinzeln, keine Doppelung; echte Fotos fehlen (begründen) |
| 13.11.2026 | Jason GTA 6 (2D, Cover + 64 Einzelbilder) | 8,5 (Design-Kritiker) | Blinzeln im Cover, keine echten Bilder (REAL leer), leerer Florida-Fallback, NOV-19-Doppelung |
| 13.11.2026 | Lucia GTA 6 Runde 2 (v2, Cover + 30 Standbilder) | 9,0 (Design-Kritiker) | alle Befunde erledigt, HUD ≥ 6 : 1; Rest: Bildrand 64 s, Karten 38 px links |
| 13.11.2026 | Lucia GTA 6 (2D, Cover + 45 Einzelbilder) | 8,0 (Design-Kritiker) | Stab durchs Gesicht im Cover, „2025“-Blatt unlesbar, doppelte Sticker/Stempel, HUD auf Papier 1,46 : 1 |
| 12.11.2026 | Earth Without Us (2D, Kontaktabzug + 2 Standbilder) | 7,5 (Selbstbewertung Design-Kritiker) | Stil 2D passend und konsistent; abgeschnittenes Label, veraltetes Cover-PNG, Kleinteile (Satelliten, Voyager) zu klein |
| 12.11.2026 | Mike Tyson (2D, Kontaktabzug + Cover + 8 Einzelbilder) | 6,5 (Selbstbewertung Design-Kritiker) | Sitzpose ohne Oberschenkel, Kopf-Handtuch als Kapuze, abgeschnittene LIFE-HITS-Leiste conviction |
