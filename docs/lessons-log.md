# LESSONS LOG + PREVIOUS VIDEO (Erweiterungs-Prompt des Nutzers, 14.11.2026 – nie löschen, nur anfügen)

## PREVIOUS VIDEO (zuletzt hochgeladen / fertig)
Title: In This City, You Pay With Time (zeit-welt)
Length / cuts: 103 s, 24 cuts, longest shots 13.6 s, 11.9 s, 11.8 s (Angaben des Nutzers)
Critique (Nutzer):
- Hook: interesting, but not curious enough
- Storytelling: links between scenes not instantly clear
- Pace: some scenes too long
- On-screen text: single words do not carry the plot
- Drama: no strong emotional peak
- Ending: final word/image needs a much stronger resolution
Stats: noch keine

## LESSONS LOG
1. (14.11.2026, zeit-welt) Einzelwort-Untertitel tragen die Handlung nicht → 2–5-Wort-Phrasen + je Szene eine Handlungs-Phrase.
2. (14.11.2026, zeit-welt) Einstellungen bis 13,6 s waren zu lang → max. 4 s, ein Halt ≤ 6 s am Höhepunkt.
3. (14.11.2026, zeit-welt) Ohne geplanten emotionalen Höhepunkt und eingepflanztes Schlussbild wirkt das Ende schwach → Höhepunkt bei 70–80 %, Schlussbild im ersten Drittel einpflanzen.
4. (14.11.2026, Bauarbeiter) Story-Klopfer unter Wörtern verdecken die Stimme → Klopfer nur in gemessene Sprechpausen (`offsetMs` aus captions.json), Musik bis zur Wende sparsam (`sparseUntilScene`).
5. (14.11.2026, Bauarbeiter) `alimiter=limit=0.75` ergab nach AAC −0,8 dBTP (über −1) → `limit=0.68` (attack 2, release 60) ergab −1,4 dBTP bei −14,6 LUFS; immer nach dem AAC-Encode messen.
6. (14.11.2026, Bauarbeiter) Der Render wurde in der Tonphase von der Hintergrund-Zeitgrenze gestoppt → `render_chunks.sh` erneut starten (überspringt fertige Abschnitte), Hintergrund-Timeout ≥ 60 min.

## PREVIOUS VIDEO (fertig 14.11.2026, angefügt – Block oben bleibt als Verlauf)
Title: At 2:14 AM, the Ground Under Lot 9 Knocked Back (Bauarbeiter)
Length / cuts: 84,3 s, 34 Shots, Ø 2,42 s, max 4,53 s; 55 Phrasen à 2–5 Wörter; 2,31 W/s
Noten: Fakten 9 · Retention 9 · Hörprobe 9 · Regie 9,0 · Design 9,0 · Endkontrolle 9
Stats: noch keine (Upload geplant 16.11.2026 Slot B)
7. (15.11.2026, Sonne) Höheres Chatterbox-`cfg` frisst Komma-Pausen und Neuvertonungen verschieben Wort-Beats → Komma-Stille nach dem Wort-Tail einfügen (`comma_whisper`), Aufzählungen stückweise sprechen (`splitCommas`), nach jeder Neuvertonung Shots/HUD-Werte an den Wortzeiten neu messen.
8. (15.11.2026, Sonne) `gen_epic` ignorierte den Musik-Plan → Musik-Abschnitte (`music.sections`, `silenceBefore`) im Werkzeug umsetzen und die Stille im Gesamtmix (nicht nur in der Musik) messen.
9. (15.11.2026, Sonne) Tempo-Untergrenze und „nicht beschleunigen“ kollidieren (K14) → Tempo über das Sprechen (cfg), atempo ≤ 1,05; HUD-Zähler, die eine Zahl sprechen, stehen am gesprochenen Wort auf dem Endwert.

## PREVIOUS VIDEO (fertig 15.11.2026, angefügt)
Title: What If the Sun Vanished? The First 8:19 (sonne-verschwindet, What-if)
Length / cuts: 112,4 s, 48 Shots, Ø 2,30 s, max 4,87 s (Halt); 79 Phrasen à 2–5 W; 2,45 W/s
Noten: Fakten 9 · Retention 9,0 · Hörprobe 9 · Regie 9,0 · Design 9,0 · Endkontrolle 9
Stats: noch keine (Upload geplant 16.11.2026 Slot A)

## PREVIOUS VIDEOS (fertig 20.11.2026, angefügt)
Title: In This City, the Gate Needs 1,000 Yeses (tor-stadt, Welt-Regel)
Length / cuts: 70,0 s inkl. End-Card, 31 Shots, Ø 2,19 s, max 3,83 s; 51 Phrasen à 2–5 W; 2,42 W/s
Noten: Fakten 9 · Retention 9 · Ton 9 (R2) · Regie 9 (R2) · Design 9 (R3) · Endkontrolle 9 (R2)
Title: In This City, Gravity Pulls Toward Granny Marta (schwerkraft-stadt, Welt-Regel)
Length / cuts: 68,4 s inkl. End-Card, 31 Shots, Ø 2,14 s, max 3,13 s; 2,48 W/s
Noten: Fakten 9 · Retention 9 · Ton 9 (R2) · Regie 9 (R2) · Design 9 (R3) · Endkontrolle 9
Stats: noch keine (Upload geplant 20.11.2026: Tor Slot A, Schwerkraft Slot B)
Lessons:
1. Länge K15 (61–70 s INKL. End-Card) schon beim Drehbuch mit End-Card rechnen – Tor lag nach der Vertonung bei 71,15 s; ohne Neuvertonung gerettet mit `scripts/retime_pauses.py --cap 700 --tail 250`.
2. Musik an Höhepunkten auf Stimmenniveau (Schwerkraft 55 s) → `scripts/duck_music.py` nach jeder Musik-Erzeugung; Musik/Bett nach jeder Neuvertonung neu aus der aktuellen Timeline erzeugen (Stille vor turn lag sonst falsch).
3. Kamera in der Bowl-Stadt: Häuser des Innenrings stehen vor der Linse – `TownSet clear` (Sichtlinie freihalten) statt Kamerawinkel raten; Bundle vor jedem Prüfbild neu (veraltetes Bundle täuschte „kamerafestes“ Objekt vor).
4. Prüfrunden: Cover-Regel nur per Einzelbild 0,05/0,3/0,45 s prüfen; neue Nah-Shots auf Status-Tafel vs. Kopf prüfen; lange Untertitel-Phrasen teilen statt schrumpfen lassen.
5. finalize.sh allein lieferte −0,5 dBTP; Limiter-Schwelle je Video messen (Tor 0,68 → −1,6 dBTP, Schwerkraft 0,6 → −1,5 dBTP).
