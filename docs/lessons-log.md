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

## PREVIOUS VIDEO (fertig 20.11.2026, angefügt)
Title: In This City, One Yawn Puts Everyone to Sleep (gaehn-stadt, Welt-Regel-Comedy, 2D)
Length / cuts: 64,5 s inkl. End-Card, 33 Einstellungen, Ø 1,9 s; 167 W, 2,65 W/s
Audit (neuer Maßstab docs/audit-2026-11-20.md): Hook 9 · Bildvielfalt 9 · Schauspiel 9 · Lesbarkeit 9 · Konzept 9 · Humor 9 · Farbe 9 (docs/audit-gaehn-stadt.md)
Stats: noch keine (Upload geplant 21.11.2026 Slot A)
Lessons:
1. 2D-Cartoon (eigene Figur `Person` mit Pupillen/Brauen/Mund-Formen, `scenes/gaehnSets.tsx`) liefert Schauspiel + Farbe schneller als 3D-Klötze und rendert 64 s in ~10 Min. (4 Kerne) – für Comedy-Welt-Regeln Standard-Kandidat.
2. Untertitel liegen bei y ≈ 1400–1500 (Captions bottom 420): Gesichter über y ≈ 1250 komponieren; im ersten Kontaktabzug lagen 6 Gesichter unter dem Untertitel.
3. Kontaktabzug VOR der Vertonung mit einer Schätz-Timeline (2,6 W/s) spart Wartezeit; nach der Vertonung nur gezielte `--at`-Bilder an Schnittstellen nachprüfen (Hook-Shot war bei echter Zeit nur 0,6 s lang).
4. Hand vor dem Gesicht (Psst-Finger): Arm NACH dem Kopf zeichnen, sonst verdeckt.
5. Fehlende Klänge (Hupe) per Synthese ins Bett (`scripts/add_horn.py`), Pegel −15 dB reicht für die Pointe (−11 dB war 6 LU über dem Rest).

## PREVIOUS VIDEO (fertig 20.11.2026, angefügt)
Title: In This City, Every Lie Makes You Shorter (luegen-stadt, Welt-Regel-Comedy, 2D)
Length / cuts: 67,9 s inkl. End-Card, 28 Einstellungen (Ø 2,35 s); 167 W, 2,51 W/s
Audit: Hook 9 · Bildvielfalt 9 · Schauspiel 9 · Lesbarkeit 9 · Konzept 9 · Humor 9 · Farbe 9 (docs/audit-luegen-stadt.md)
Stats: noch keine (Upload geplant 21.11.2026 Slot B)
Lessons:
1. Satzende leiser wirkt erst mit `end_db` 7 + `narrator.end_win_s` 0,7 + `end_soft_ms` 80: −4,6 dB / 79 % leiser (Gähn: end_db 5 → −0,3 dB).
2. Nah-Einstellungen mit `frameOn(kopfX, kopfY, 540, 760, zoom)` statt Kamera-Mitte raten – Kopf-Mitte stehend y − 416·s, sitzend y − 336·s; so liegen Gesichter sicher über den Untertiteln.
3. Arme mit Ellenbogen (`bendL/bendR`) + `gest` (leichtes Mitschwingen) im 2D-`Person` – Standard 0 = altes Aussehen, alte Videos unverändert.
4. Frischer Container: Chatterbox- und earshot-Setup NICHT parallel starten – earshot hängt sich per .pth an `.venv-cb` (torchaudio-Konflikt); Abhilfe: `zz-venv-cb.pth` entfernen, earshot läuft dann mit eigenem torch.
5. Whisper-Ausreißer im Untertitel („Delicious“ 1 s zu früh) per Ausschnitt-Transkription (small.en, numpy-Eingabe) finden und Wortzeit in captions.json setzen; Homophone (grey/gray, chews/choose) sind keine Sprechfehler.
6. Limiter 0,66 → −2,0 dBTP / −14,7 LUFS (finalize.sh allein −0,7 dBTP).
7. Ein-Raum-Handlung (Abendessen) bricht die Regel „kein Set > 2 am Stück“ schnell – Reaktions-Nahaufnahmen auf eigene Comic-Flächen (Farbe + Strahlen, `ReactBg`) legen; vor dem Render die Set-Folge einmal durchzählen.

## PREVIOUS VIDEO (fertig 21.11.2026, angefügt)
Title: What a Ghost Pepper Does Inside Your Body (ghost-pepper, Innenwelt-Cartoon, 2D, 30-s-Beispiel)
Length / cuts: 30,3 s inkl. End-Card 1,5 s, 19 Einstellungen (Ø 1,5 s), 13 Bildwelten; 74 W, 2,50 W/s
Audit: Hook 9 · Bildvielfalt 9 · Schauspiel 9 · Lesbarkeit 9 · Konzept 9 · Humor 9 · Farbe 9 · Fakten 9 (docs/audit-ghost-pepper.md)
Stats: noch keine (Beispiel, Upload `hold`)
Lessons:
1. 30-s-Vorgabe: Chatterbox-Rohfassung lag bei 30,6 s Sprechzeit + End-Card → `retime_pauses.py --cap 330 --tail 250` + End-Card 1,5 s ergab 30,26 s ohne Neuvertonung; für 30 s ≈ 72 Skriptwörter planen.
2. Whisper-Gegenprobe vor dem Render: „Inside“, „Tiny“, „Code red“ wurden undeutlich (96,2 %) → Wörter mit weichem Anlaut am Satzbeginn ersetzen („Down inside“, „Small“, „Red alert“) → 98,8 %. Render vorher abbrechen spart einen Durchlauf.
3. Gleich lange Wortzeiten (Start = Start des nächsten Worts) erzeugen bei 1-Wort-Untertiteln doppelte Einblendungen → Starts nach der Vertonung auf ≥ 130 ms Abstand ziehen.
4. Neue Bausteine: `captionStyle: "word-red"` (rot, weiße Kontur), `Person headS` (große Köpfe), Augen `"xx"` („><“), `scripts/add_bleep.py` (Zensur-Piep), `ReactBg` in `scenes/ghost.tsx` gegen Set-Wiederholung.
5. Set-Folge VOR dem Render zählen: erst das Audit fand 5× Club-Tür in Folge (Regel max. 2) → ein Render zu viel.
6. Präsenz 4–8 kHz zu hell (earshot) → EQ −3,5 dB @ 6 kHz vor dem Limiter 0,66 → −14,4 LUFS / −2,2 dBTP, „launch-grade“.
7. Proxy sperrt Primärquellen-Hosts (nobelprize.org) → per `update_environment` freigeben; eurekalert.org liefert trotz Freigabe 403 → Zahl weglassen statt Sekundärquelle.

## PREVIOUS VIDEO (fertig 21.11.2026, angefügt)
Title: In This City, Your Last Search Is Read at Your Funeral (suche-stadt, Welt-Regel-Comedy mit schwarzem Humor, 2D)
Length / cuts: 62,8 s inkl. End-Card, 27 Einstellungen (Ø 2,3 s), 15 Sets/Flächen; 158 W, 2,57 W/s
Audit: Hook 9 · Bildvielfalt 9 · Schauspiel 9 · Lesbarkeit 9 · Konzept 9 · Humor 9 · Farbe 9 (docs/audit-suche-stadt.md)
Stats: noch keine (Upload geplant 22.11.2026 Slot B)
Lessons:
1. Chatterbox spricht „my... ...smell“ ohne Pause → Piep-Platz und Kunstpausen nachträglich mit `scripts/insert_pauses.py <id> --at <ms>:<dauer>` (Gegenstück zu retime_pauses); danach Wort-Ende des Worts VOR der Pause von Hand zurücksetzen (sonst liegt der Piep auf dem Folgewort), Bett + `add_bleep.py` neu.
2. Handy/Requisit in der Hand nie auf Kopfhöhe: im ersten Kontaktabzug verdeckte das Handy in 3 Einstellungen das Pfarrer-Gesicht → Requisit seitlich, Brust-/Schulterhöhe.
3. Dauer jeder Einstellung nach der Vertonung gegen die 4-s-Regel prüfen (Endkontrolle fand 5 s + 4,5 s) – Makro-Einschub (Laptop-Verlauf mit Bildzeichen) ist ein billiger zusätzlicher Gag + Set.
4. loudnorm (finalize.sh) hebt Spitzen nach einem vorgeschalteten Limiter wieder an (−0,6 dBFS) → Limiter 0,79 NACH finalize (4× überabgetastet): −14,2 LUFS / −1,8 dBFS.
5. Suchfelder ohne Schrift (Kritzel + Bildzeichen) halten „eine Text-Ebene“ ein, obwohl das Thema Text ist; der Fluch als „#@%&!“-Blase ist der Gag selbst.
6. Nebenfigur-Design gegen Verwechslung prüfen: grauer Dutt bei einer Trauernden wirkte wie die Oma im Sarg.
