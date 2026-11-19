# Übergabe an die neue Sitzung (Stand 19.11.2026, 18:40 UTC)

Alte Orchestrator-Sitzung `session_01UNp77QHeWKBPJK78ThrGyX` hat Lineage-Tiefe 8 und kann keine Sitzung/keinen Abholer anlegen. Nutzerregel 19.11.: Tokens sparen, jedes neue Video in neuer Sitzung (automatisch).

## Laufende Arbeit (Branch `claude/friendly-dijkstra-1slqt3`)
Zwei Videos im Stil „In This City“ (zeit-welt), Länge 61–70 s inkl. End-Card (K15):
| Video | Drehbuch | Station 1 | Stand |
|---|---|---|---|
| Schwerkraft-Stadt (`episodes/schwerkraft-stadt.json`, Dashboard `welt-schwerkraft-zum-schwersten`) | v1.1, 166 W | Fakten 9 · Retention 9 (selbst freigegeben) | Stimme erzeugt (public/episodes/schwerkraft-stadt/), noch nicht gemessen; Szenen `src/episode/scenes/schwerkraft*` im Bau, Komposition `SchwerkraftStadt` |
| Tor-Stadt (`episodes/tor-stadt.json`, Dashboard `welt-tor-nur-bei-einstimmigkeit`) | v2, 165 W | Fakten 9 · Retention 9 | Stimme noch nicht erzeugt; Szenen `src/episode/scenes/tor*` im Bau, Komposition `TorStadt` |

`scripts/music.py`: `gen_funny` setzt jetzt `music.sections`/`silenceBefore` um (WIP, Hash-Nachweis für fertige Videos noch prüfen).

## Nächste Schritte je Video
1. Stimme: `npm run episode -- episodes/<id>.json`, `stimm_messung.py` (Ziele: Länge 61–70 s, ≥ 2,45 W/s, atempo ≤ 1,05, Komma ≥ 150 ms, Kanten 0, Whisper ≥ 98 %, Stille vor turn ≥ 0,6 s im Mix), Bett, Hörprobe → unabhängiger Hörprüfer ≥ 9 (Station 2).
2. Szenen an echte Timeline, Shot-Messung, Kontaktabzug → Regie- + Design-Kritik ≥ 9 (Station 3).
3. Render `scripts/render_chunks.sh <Komp> out/<id>-raw.mp4` (Hintergrund, bei Zeitgrenze neu starten – überspringt Fertiges), `scripts/finalize.sh`, Limiter `alimiter=limit=0.68:level=false:attack=2:release=60` → ≤ −1 dBTP, Vorschau 540×960.
4. Publish-Datei `docs/veroeffentlichung/publish-<dashboard-id>.json` (Vorbild Sonne), Endkontrolle ≥ 9 (Station 4), Dashboard `done`, MP4 an Nutzer, Lessons-Log, Tagesbericht.
Upload-Slots: nächste freie Slots ab 20.11. (A TT 17 / YT 18, B TT 22 / YT 23 DE).

## Sitzungswechsel (neue Sitzung, Tiefe 0)
- Abholer `trig_01NLm7wDjZkjX4TVWdW1r2uy` zeigt noch auf die alte Sitzung → neuen Abholer mit `persistent_session_id` = neue Sitzung anlegen (Wortlaut in `docs/sitzungswechsel.md`, Abschnitt Autopilot), alten mit `update_trigger enabled=false` abschalten, `meta/pickup` im Dashboard umstellen.
- Danach je Video eine neue Sitzung (Regel 18./19.11.).

## Nachtrag 19.11. abends
Schwerkraft-Stadt: Szenen v1 an echter Stimme (30 Shots, Ø 2,18 s, 67,47 s, turn 71,9 %); Kontaktabzug out/schwerkraft-kontakt-r3.jpg (nicht im Repo). Offen: rule Shot 1 unbekanntes orangefarbenes Objekt vor der Waage; marta Shot 2 Zuglinien überstrahlen Marta; Cover frames 15→9; bed.wav fehlt; Kleinkram (slide/light/catch/town/answer). Danach Station 2 (Hörprüfer) + Station 3 (Regie/Design).
Tor-Stadt: Szenen v1 an echter Stimme (31 Shots, Ø 2,23 s, 69,75 s – knapp unter 70!, Zähler-Werte am Wort korrekt); Kontaktabzug out/tor-kontakt.jpg. Offen: K13 „MEETING OVER?“-Pappe + „83 YEARS“-Schild; Tor ~4 s offen vs. „exactly one second“; Häuschen-Schild teils unter Untertitel; Kratzer „1 LEFT“ spät; bed.wav fehlt. Stimme-Agent-Bericht (Messwerte) stand bei Übergabe noch aus – stimm_messung für beide neu laufen lassen.

## Nachtrag 19.11. ~19:45 UTC (neue Sitzung session_01UNp77MtRT1w4ZDwHvrEHpp, Tiefe 1)
- Abholer umgezogen: neu `trig_01YFVees4t4feuwwe9gyvcmh` (→ diese Sitzung), alt `trig_01NLm7wDjZkjX4TVWdW1r2uy` abgeschaltet. Alte Sitzung per Nachricht ruhiggestellt.
- Umgebung dieser Sitzung = „Schule“ (nicht „Clips“, Umzug nicht möglich); Hugging-Face-Hosts dort ergänzt (Whisper).
- Schwerkraft-Stadt: rule Shot 1 – Ursache war ein Haus des Innenrings vor der Linse → `BowlTown clear` (Sichtlinie Kamera→Waage, r 6) behoben; marta Shot 2 – Zuglinien dünner, Gegenstände unter das Gesicht; Cover 9 Bilder; bed.wav erzeugt (7 Basstreffer).
- Tor-Stadt: bed.wav erzeugt (9 Basstreffer, 1 Klopf-Folge).
- stimm_messung (out/<id>-messung.json): Schwerkraft 66,9 s · 2,48 W/s · Satzpause 275 · Komma 180 · Szene 450 ms · Satzende −1,2 dB / −2,7 HT (76 % fallend) · 1 Kante 55,8 s · Whisper gesprochen 97,1 % (Rest nur „Bo“→„bowe“, „MAR-tuh“-Schreibung). Tor 69,7 s · 2,37 W/s · 275/230/460 ms · −0,8 dB / −1,9 HT · 0 Kanten · Whisper gesprochen 98,8 %.
- Offen: Ton-Mischung rendern → Station 2 (Hörprüfer); Kleinkram + Tor-Punkte; Station 3.
