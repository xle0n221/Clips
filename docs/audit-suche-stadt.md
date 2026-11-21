# Audit „In This City, Your Last Search Is Read at Your Funeral“ (suche-stadt, 21.11.2026, Video 2)

Maßstab `docs/audit-2026-11-20.md` (Rolle Comic-/Cartoon-Designer + Publikum) + Humor-Regeln/Tabus `docs/prompts/innenwelt-cartoon.md`.
Grundlage: Kontaktabzüge `out/suche-k1…k5.jpg` (k1 Schnitt-Mitten, k2 gezielt je Einstellung, k3–k5 Korrekturbilder),
Endkontrolle aus dem fertigen MP4 (0,05 / 0,6 s + alle 3 s, `out/suche-end.jpg`), earshot critique, `scripts/stimm_messung.py`. Dateien in `out/` nicht im Repo.

| Kriterium | Note | Beleg / Rest-Schwäche |
|---|---|---|
| **Hook** (erste 2 s) | 9 | Bild 0: Pfarrer liest vom leuchtenden Handy (Suchfeld + Hühnchen-Bildzeichen) über dem offenen Sarg, zwei Trauergäste schreien; Cover-Titel „YOUR LAST SEARCH IS READ AT YOUR FUNERAL“ 0–0,5 s; Bewegung ab Bild 1 (Zurückweichen, Lichtblitz, Kamera-Stoß). Erster Satz = Regel. Offene Frage „Was hat Kevin gesucht?“ ab 26 s („He types it. Deletes it.“), Antwort erst bei ~47 s (Piep). Runde 1 → 2: Handy verdeckte das Pfarrer-Gesicht, Figuren zu klein (Zoom 1,05 → 1,4), Trauergast mit Dutt sah aus wie Oma → Frisur geändert. |
| Bildvielfalt | 9 | 27 Einstellungen (Ø 2,3 s), 15 Sets/Flächen (Kirche innen in 4 Wandfarben, Kirche außen, Küche, Wald, Kevins Zimmer, Laptop-Makro, Gesang-Zimmer, Schlafzimmer nachts, Handy-Makro, Regal/Urne, Straße + 4 Comic-Reaktionsflächen); kein Set > 2 am Stück. Endkontrolle → Runde 3: Kevin-Einstellung 5 s und Outro 4,5 s (> 4 s) → Laptop-Verlauf-Makro + Outro-Nahaufnahme eingefügt, neu gerendert. |
| Figuren/Schauspiel | 9 | Pupillen-Blick, Brauen, Schreie, Kneifaugen (Oma vergiftet), Augenzucken (Brokkoli), Ohnmacht, Sonnenbrille/Flüstern, Urne kneift die Augen zusammen, Nonnen marschieren mit bösem Blick. Neu: Brille, Sonnenbrille, Priesterkragen, Nonnenschleier im 2D-`Person`. Rest: keine Gehzyklen (Laufen = Hüpfen). |
| Lesbarkeit (Text-Ebenen) | 9 | Nur Untertitel-Phrasen + Cover-Titel. Suchfelder ohne Text (Kritzel + Bildzeichen); einzige Bild-Schrift = Fluch-Blase „#@%&!“ (der Gag selbst, beim Piep). Gesichter über der Untertitelzone (Runde 2: Trauergäste in 4 Einstellungen angehoben). |
| Konzept sofort sichtbar | 9 | Sarg + Pfarrer liest vom Handy + entsetzte Gäste = stumm verständlich; Cover-Titel nennt die Regel. |
| Humor (schwarz) | 9 | Gag alle 2–5 s: Oma + grünes Hühnchen („She found out.“), Bär mit Serviette + Stiefel („No.“), Bürgermeister „delete history – too late“, Katze hält sich die Ohren zu, Brokkoli-Würgen, Incognito = Pfarrer flüstert mit Sonnenbrille, Urne beobachtet, „Who dies on a Tuesday?“, Bus + fliegender Schuh, Piep + „smell like popcorn“, Mama-Ohnmacht, Nonnen gehen, Busfahrer „How to drive a bus.“, Schluss an den Zuschauer. Tabus geprüft: keine realen Personen, keine Minderjährigen, kein Hass, kein Suizid, keine Ratschläge. |
| Farbe/Kontrast | 9 | Gesättigte Figuren (Kevin grün, Pfarrer schwarz vor warmen Wänden, Mama pink) vor bunten Kirchenfenstern und Pastell-Gründen. |

Ton (Messung): −14,2 LUFS, Sample-Peak −1,8 dBFS (Limiter nach loudnorm), LRA 3,5 LU; Präsenz-EQ −3,5 dB @ 6 kHz.
earshot critique: **launch-grade**, 22/23 Messwerte im Bereich (97 %), 0 kritisch/0 schwer; Rest „Stereo-Breite niedrig (minor)“ = Mono-Stimme, gewollt.
Stimme: Whisper 98,7 % (156/158; Ausschnitt-Prüfung: „bus“ am Ende deutlich erkannt), 2,57 W/s, Satzpause 230 ms, Satzende −3,4 dB leiser (71 %), 1 harte Kante bei 47,29 s = Schnitt vor dem Piep (vom Piep überdeckt).
Pausen eingefügt (neu `scripts/insert_pauses.py`): +400 ms vor „Bus“, +450 ms nach „Bus“, +600 ms für den Piep (Chatterbox sprach „my… …smell“ ohne Pause).
Länge 62,8 s inkl. End-Card (Regel 61–70 s). Fiktion, keine Faktenbehauptungen.
