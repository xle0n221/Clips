
## Design Runde 1 (Design-Kritiker, 15.11.2026)

Grundlage: Kontaktabzug `out/sonne-kontakt-v2.jpg` (46 Bilder), eigene Standbilder f5 (Cover), f40, f1386, f1789, f2196, f2478, f3280 (End-Card) in `out/s3d/`, Pixelmessung. Kein Voll-Render.

**Messwerte**
- Mittlere Luminanz (0-255): Cover f5 85,9 · hook f40 113,0 · four f1789 53,6 · seven f2196 104,1 · turn f2478 29,4 · arrive f1386 15,8 (Weltraum, bewusst schwarz, Zahl/Ring tragen das Bild). Kein Bild leer; dunkle Weltraum-Szenen haben immer Ring/Planet/Gitter als Motiv.
- Kontrast Text-Platten/HUD: arrive-Zähler (255,181,64) auf (0,0,4) 11,9 : 1; „YEARS“ 14,7 : 1; seven-Sticker weiß auf (20,28,38) > 15 : 1; HUD-Zahl 8:19 rot auf dunkler Platte ca. 6-7 : 1 (Sichtprüfung f2478, knapp unter 7 : 1 geschätzt, nicht exakt gemessen). Untertitel gelb mit schwarzem Rand, in allen Bildern über Szene, Unterkante innerhalb der Zone.
- Cover-Fenster f5: Titel „THE SUN IS GONE“ gelb, drei Zeilen oben, Juno + schwarzer Ring mit Goldrand: Thema ohne Ton lesbar, kein Untertitel im Cover, Juno blinzelt nicht.

**Was gut ist**
- Themen-Treue: Cover (leere schwarze Sonnenscheibe über sonnigem Strand), 12:00-Uhr, Goldband zur Erde, Saturn im Okular verraten Thema und Farblogik ohne Ton. Gold = Licht unterwegs, Indigo/Schwarz = Welt ohne Sonne, Eisblau = Kälte (turn: Juno kalt blau) eingehalten.
- Figuren Juno und Grandpa über Szenen konsistent (Hut, Zöpfe, Wangen / Brille, Strickjacke, Bart). Keine Marken, keine echten Bilder, keine fremden Figuren.
- End-Card f3280: „KnowToon“ im Suchfeld, „Follow before the lights go out.“ + FOLLOW-Button, hoher Kontrast, passend zum Thema.

**Befunde**

P1
1. **arrive f1386 (46,2 s)**: Zähler „101 707 107“ läuft links und rechts aus dem Bild (abgeschnitten, 1080 px zu schmal), „YEARS“ darunter verblasst; die Zahl passt nicht zum Sprechtext („a hundred thirty million years“) und nicht zum Drehbuch („130 000 000 YEARS“). Vorschlag: Schriftgröße so, dass 11 Zeichen in ≤ 960 px passen (oder in „130 M“ / „130 000 000“ mit Zeilenumbruch), Endwert des Zählers auf 130 000 000 fixieren und beim Ausblenden nicht abschneiden; „YEARS“ voll deckend.
2. **seven f2196 (73,2 s)**: HUD zeigt 7:23, Soll 7:19 (Drehbuch `SUN GONE FOR 7:19`, Sprechtext „Seven minutes“). Zeit- und HUD-Kette muss zu 8:19 am Ende der Reihe passen (hope zeigt 8:16, 8:18 dazwischen: 7:23 → 8:16 ist rechnerisch nicht gleichmäßig). Vorschlag: HUD-Zeit je Szene aus dem Sprechzeitpunkt ableiten oder die Werte im JSON (7:19, 8:18) mit der Szenenlage abgleichen und f2196 auf den Soll-Wert fixieren.

P2
3. **turn f2478 (82,6 s)**: Junos gelber Hut färbt unter kaltem Licht oliv/grün – Grün ist laut Farblogik nur an der Quelle (Mikroben, Vents) reserviert; liest sich zudem als Hautkrankheit/Fremdfarbe statt Eisblau. Vorschlag: Hut im Kaltlicht blaugrau/Eisblau tönen (Rim blau statt Gelb-Mischung).
4. **turn f2478**: HUD „8:19“ rot auf dunkler Platte ca. 6-7 : 1, darunter schwach lesbare zweite Zeile („ORBIT“) auf Platte, 8-10 px hoch, auf dem Handy nicht lesbar. Vorschlag: rot aufhellen (≥ 7 : 1) und ORBIT-Zeile größer (≥ 30 px) oder streichen.
5. **four f1789 (59,6 s)**: Teleskoprohr schneidet quer über Grandpas Gesicht (Auge/Nase), Gesicht kaum lesbar, Brille halb verdeckt. Vorschlag: Rohr nach rechts schwenken oder Kamera 15° gedreht, damit Gesicht frei liegt (Konsistenz Grandpa).
6. **Text-Doppelungen (K13)**: tally f3056/f3105: Untertitel „EIGHT MINUTES OF LIGHT“ ↔ Balkenlabel „8 MIN“ ↔ Sticker „SUNLIGHT 8 MIN · SATURN 2 H“; Sticker wiederholt die Zahl dreimal. zero f641: Sticker „NO SUN. SKY: STILL BRIGHT“ ↔ Untertitel „THE SUN IS ALREADY GONE“ (inhaltlich identisch). gravity f912: Sticker „THE PULL SHOULD BE GONE“ ↔ Untertitel „NO SUN MEANS NO PULL“. Vorschlag: Sticker auf Handlung umformulieren („TWO NUMBERS, ONE ECHO“, „SKY STILL LIT“, „WILL EARTH DRIFT?“) oder Balkenlabel nur „SUN“/„SATURN“.
7. **hook f40 (1,3 s)**: Frage-Sticker „WHAT HAPPENS AT 8:19?“ liegt schräg auf dem Goldring und die obere Phrase „NO ALARM. NO CLUE. YET.“ steht dazu in doppelter Aussage-Nähe; Zusatz „Nobody knows yet“ im Cover wiederholt „NO CLUE. YET.“ kurz danach (Doppelung 0,0-1,3 s). Vorschlag: Cover-Sub „Nobody knows yet“ oder Phrase ändern („THE CLOCK STARTS NOW“).

P3
8. Cover f5: Unterzeile „Nobody knows yet“ liegt weiß auf dem dunklen Rand des Rings und teilweise auf dem Goldring; Kontrast hoch, aber Ring und Text berühren sich. Ring 40 px nach unten/oder Text höher.
9. Untertitel-Doppelungen mit Plakat-Phrase in juno f189/f279 („JUNO SOAKS UP THE RAYS“ ↔ „SUNLIGHT IS STILL WARM“) schwach, vertretbar.
10. Dunkle Weltraum-Szenen (proof f1208 blaue Kugel klein, orbit f1516 Erde ~25 px) tragen wenig Bild: Erde/Sterne größer ziehen; kein Mess-Befund (Lum. 15-30), aber auf dem Handy schwach.

### Note: **8,5 / 10** (Design)
Beleg: Themen-Treue, Farblogik, Figuren-Konsistenz, Cover und End-Card stark; keine Marken. Abzug für zwei Zahlen-Fehler (arrive abgeschnitten/falsche Zahl, seven 7:23 statt 7:19), olivfarbenen Hut im turn-Bild (Farblogik) und drei Sticker-Doppelungen (K13). Für ≥ 9: P1 1-2 und P2 3-6 beheben, danach Nachprüfung f1386, f2196, f2478, f1789 und tally.

## Regie Runde 1
Stand 15.11.2026 · Regie-Kritiker · Grundlage: `scripts/sonne_shots.mjs` (gemessen), Kontaktabzug `out/sonne-kontakt-v2.jpg` (02:57, neuer als alle Quellen ≤ 02:51), eigene Standbilder `out/s3/regie-r1.jpg` (24), `out/s3/regie-r1b.jpg` (12), Bewegungsfolge `out/s3/regie-r1c.jpg` (8 Bilder im 2-Frame-Abstand an turn 81,6 s und 83,0 s). Kein Voll-Render.

### Gemessen
| Regel | Messwert | Urteil |
| --- | --- | --- |
| Shots ≤ 4 s, Halt ≤ 6 s | 48 Shots, Ø 2,25 s, max 4,83 s (turn-Halt), five Shot 1 3,97 s | erfüllt |
| keine Shots < ~1,2 s ohne Grund | min 1,07 s (ocean „dive through ice“), sonst ≥ 1,30 s | 1 Verstoß (P2-5) |
| Phrasen 2–5 Wörter | 79 Phrasen, 272/272 Wörter, Anzeige 0,58–2,72 s | erfüllt |
| Höhepunkt 70–80 % | Gesamtlänge 109,9 s (answer2 endet 107,93 + End-Card 2 s): turn-Start 78,97 s = 71,8 %, Himmel schwarz 81,66 s = 74,3 %, Augen auf 83,08 s = 75,6 % | erfüllt |
| Eingepflanztes Ende / Loop | 107,8 s = Bildaufbau des Covers (Ring, Juno, Strand) → End-Card 107,9–109,9 s „KnowToon“ → Cover | erfüllt |
| Cover 0–0,5 s | 0,1/0,4 s: „THE SUN IS GONE / Nobody knows yet“ groß, Juno ganz im Bild, schwarzer Ring = Thema ohne Ton | erfüllt (Makel P3-8) |
| Schnitt hart, Kamera sanft | alle Übergänge `cut`, Fahrten `fly()` linear/eased; turn-Umschlag Tag→Nacht in 2 Bildern (81,6→81,73 s), Augen-Pop sauber über 3 Bilder | erfüllt |
| HUD = Sprechtext (Fakten) | turn 8:19 ✓, hope 8:16→8:18 ✓, zero 0:11 ✓, **seven 7:22/7:23** ✗, **arrive Zähler angeschnitten** ✗ | 2 Verstöße (P1) |

### Befunde (P1 = vor Freigabe, P2 = sollte, P3 = kann)
**P1**
1. **seven 72,5–74,6 s (Insert-Timer)**: HUD zeigt 7:22 (73,0 s) und 7:23 (73,9 s), genau während „One warm minute left“ (Cue `watchOneMinute` 73,86 s). Faktengeprüft ist 7:19 (8:19 − 7:19 = 60 s); 7:23 ergibt 56 s. Ursache: `CLOCK.seven = { beat: "junoClosesEyes", sec: 439, max: 459 }` (`sonneSets.tsx` 1861) zählt ab dem Augenschließen ≈ 69,2 s hoch. Vorschlag: auf das Wort ankern und stehen lassen, z. B. `seven: { beat: "watchOneMinute", sec: 439, max: 439, pre: 420 }` (läuft 7:00 → 7:19 bis „One warm minute left“, dann steht 7:19).
2. **arrive 45,1–47,5 s (Zähler „130 000 000 YEARS“)**: Die Zahl ist breiter als das Bild – 47,2 s „.29 744 756“, 47,45 s „.30 000 00(0)“: erste und letzte Ziffer außerhalb. Bei 46,2 s (Kontaktabzug) liest man „101 707 107“ zu „hundred thirty million“. Vorschlag: `TextLabel width` 4,1 → ≈ 3,0 (Platte 4,4 → 3,3) oder Kamera z 12,5 → ≥ 15; Zahl bis ≈ 60 % des Shots fertig rollen (`u = frame / (0.6·end)`) und ≥ 0,8 s auf 130 000 000 stehen lassen, damit die gesprochene Zahl gelesen wird.

**P2**
3. **five 63,1–67,1 s (OTS-Telefon, 3,97 s)**: Bild = Junos Hinterkopf als Klotz-Anschnitt (Hut, Haar, Ohr füllen 2/3), Opa im Telefon nur ≈ 60 px, das Gähnen („Grandpa yawns goodnight“, 65,0 s) ist nicht erkennbar; 4 s fast stehend. Vorschlag: Telefon in die Bildmitte, Display ≥ 40 % Bildbreite, Opa-Gesicht mit offenem Gähnmund groß; Juno nur als Schulter/Hutkante am Rand.
4. **speed 36,2–38,7 s (Shot 2 „tracking race with c“)**: zeigt nur die Erde über dem Gitter (36,6/37,9 s); weder Welle noch Lichtschale „rennen“ – das Verb „at the speed of light“ ist ohne Ton unsichtbar. Vorschlag: Gitter-Welle und Lichtschale nebeneinander auf die Erde zulaufen lassen (wie arrive-Fotofinish), Labels „RIPPLE“/„LIGHT“ optional.
5. **ocean 93,1–94,2 s (Shot 2 „dive through ice“, 1,07 s)**: 93,2 s = leeres Blau mit Lichtstrahlen, weder Eis noch Figur; einziger Shot < 1,2 s. Vorschlag: Eiskante/Unterseite der Eisschicht oben im Kader zeigen und auf ≥ 1,3 s strecken (`iceSkinCreeps + 14` → +8) oder Shot streichen und Weitwinkel direkt auf den Schlot schneiden.
6. **tally 104,0 s**: Label „2 H“ über dem Saturn-Balken ragt in die onScreen-Platte („SUNLIGHT 8 MIN · SATURN 2 H“) und ist oben angeschnitten. Bei 102,6 s ist der Saturn-Balken noch leer und das Label fehlt. Vorschlag: Balken-Maximum ≈ 15 % niedriger (Kopf ≤ y 0,22) oder Label seitlich neben die Balkenspitze.
7. **arrive 49,4 s (Fotofinish)**: „1.7 S“ dreifach – Sticker „1.7 S“ zwischen den Bahnen, Bahn-Label „+1.7 S“, onScreen „A PHOTO FINISH: 1.7 S“ (Lehre Bauarbeiter P2-2). Vorschlag: Sticker per `stickerHide: ["1.7 S"]` aus; das Bahn-Label trägt die Zahl am Ort.

**P3**
8. Cover-Ausblendung 0,6 s: Titel „THE SUN IS GONE“ blendet noch halbtransparent über dem Ring, während der Untertitel „THE SUN JUST VANISHED“ schon steht (Doppeltext für ≈ 0,2 s). Vorschlag: Titel bis 0,5 s ganz aus.
9. turn 82,0–83,8 s: Nacht = flaches Schwarz, Sterne in 1080er-Standbildern nicht erkennbar; das Kippen „noon turns to night“ trägt allein Junos kaltes Gesicht. Vorschlag: 20–30 hellere Sterne (≥ 4 px) und Strandleute als Silhouetten, die hochschauen.
10. hook 2,5 s: Sticker „WHAT HAPPENS AT 8:19?“ ist klein (≈ 25 % Bildbreite) und konkurriert mit der Uhr; Schrift auf Handy ~11 px hoch. Vorschlag: größer (≥ 45 % Breite) oder weglassen, die onScreen-Phrase trägt.
11. old 17,5 s / juno 9,3 s: Untertitel liegt auf Junos Mund/Kinn – lesbar, aber Gesicht im Close-up verdeckt. Vorschlag: Kopf 5–8 % höher im Kader.

### Was gut ist
- Höhepunkt sitzt mittig im Fenster (74 %), Umschlag Tag→Nacht + Augen-Pop liest ohne Ton; HUD wird rot (alert) – Bild sagt „etwas ist passiert“.
- Farblogik Gold (Licht unterwegs) / Schwarz-Indigo / Eisblau hält durchgehend; Ringe als Leitmotiv (Sonne weg, Licht-Schale, Okular, Bahn).
- Loop sauber: answer2 107,8 s ≙ Cover, End-Card vollständig getippt (109,8 s „KnowToon“, „FOLLOWING“).

### Note: **8,0 / 10** (Regie)
Beleg: Alle Zahlenregeln erfüllt (48 Shots, Ø 2,25 s, Halt 4,83 s, Höhepunkt 74 %, Loop). Abzug, weil zwei Bildzahlen dem faktengeprüften Text widersprechen bzw. aus dem Bild ragen (seven 7:23 bei „one minute left“, arrive-Zähler angeschnitten) und drei Einstellungen ihr Verb ohne Ton nicht zeigen (five Gähnen, speed Wettrennen, ocean dive). Für ≥ 9: P1 1–2 und P2 3–7 beheben; Nachprüfung an 73,9 / 47,4 / 49,4 / 65,0 / 37,5 / 93,5 / 104,0 s (~12 Bilder).
