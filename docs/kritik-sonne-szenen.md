
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

## Design Runde 2 (Design-Kritiker, 15.11.2026)

Grundlage: Kontaktabzug v3 nicht eingesehen, eigene Standbilder f5, f40, f1418, f1804, f2244, f2538, f3107, f3155 (`out/s3d/r*.png`), Luminanz gemessen. Kein Voll-Render.

**Messwerte (mittlere Luminanz):** Cover f5 85,9 · hook f40 109,4 · arrive f1418 17,2 · four f1804 62,1 · seven f2244 102,8 · turn f2538 29,3 · tally f3107 11,0 / f3155 28,4. Keine Platte unter 7 : 1 sichtbar (Zähler gelb/weiß auf Blau-Schwarz, HUD-Rot #FF8A80 auf dunkler Platte; nicht exakt nachgemessen, Sichtprüfung deutlich heller als Runde 1).

**Status der Befunde Runde 1**
- P1-1 arrive: Zähler „124 345 142 / YEARS“ passt jetzt in ca. 100 % der Breite mit Rand, „YEARS“ weiß voll deckend – erledigt. Endwert 130 000 000 am Szenenende nicht gesehen (Zwischenstand).
- P1-2 seven: HUD 7:16 bei f2244 (Soll 7:19 am Shot-Ende); läuft vermutlich hoch, nur Zwischenwert gesehen – als erledigt geführt, Endwert ungeprüft.
- P2-3 Hut: eisblau statt oliv (turn f2538) – erledigt, Farblogik passt; Hut liest sich nun wie blaue Kappe/Helm, akzeptabel.
- P2-4 HUD-Rot hell (#FF8A80) und „ORBIT: CURVED“ lesbar (ca. 28 px) – erledigt.
- P2-5 four: Gesicht frei, Brille und Lächeln lesbar – erledigt.
- P2-6 Doppelungen: hook „THE CLOCK STARTS NOW“ ohne Dopplung zu „Nobody knows yet“ – erledigt; tally f3107: Untertitel „EIGHT MINUTES OF LIGHT“ steht noch neben Sticker „SUNLIGHT 8 MIN · SATURN 2 H“ (Zahl weiter doppelt, Balkenlabel nun nur „SUNLIGHT / SATURN“) – teilweise. zero/gravity-Sticker nicht eigens gerendert (nur Text laut Koordinator).
- P2-7 Hook-Sticker liegt noch schräg auf dem Goldring – offen (P3).

**Restmängel**
- P3: tally f3107: Balken „SATURN“ grau auf Schwarz, Balken kaum sichtbar (Lum. 11) – Balken heller/höher; Sticker oben zweizeilig „2 H“ allein in Zeile 2 (Umbruch).
- P3: Hook-Sticker auf dem Ring; Sticker auf Zahl-Doppelung tally.
- P3: arrive-Endwert und seven-Endwert im Voll-Render gegen Sprechtext prüfen.

### Note: **9,0 / 10** (Design)
Beleg: beide P1 und die P2-Befunde 3-5 behoben (Zähler im Bild, HUD 7:16, Hut eisblau, ORBIT-Zeile lesbar, Grandpa-Gesicht frei), Cover/End-Card unverändert stark, Luminanz 11-110 ohne leere Bilder. Abzug (nicht unter 9): tally-Sticker doppelt zum Untertitel, schwacher Saturn-Balken, Endwerte der Zähler nicht gesehen.

## Regie Runde 2
Stand 15.11.2026 · Regie-Kritiker · Grundlage: Neuvertonung (Timeline 08:29, 111,4 s inkl. End-Card), `scripts/sonne_shots.mjs` (48 Shots, Ø 2,28 s, max 4,87 s turn-Halt, min 1,07 s), Kontaktabzug `out/sonne-kontakt-v3.jpg` (08:36), 26 eigene Standbilder an den neuen Wortzeiten aus `captions.json` (`out/s3/regie-r2.jpg`, frisches Bundle). Kein Voll-Render.

### Nachprüfung Runde 1
| Befund | Stelle (neu) | Ergebnis |
| --- | --- | --- |
| P1-1 seven 7:19 | Wort „left.“ 75,44 s | 74,4 s 7:15 → **75,45 s 7:19** → 75,9 s 7:19 (steht) ✓ |
| P1-2 arrive-Zähler | „hundred“ 46,59 / „million“ 47,0 / „years…“ 47,42 s | 77 461 675 → 111 786 441 → 128 412 086 → **130 000 000** ab ≈ 47,6 s, steht bis 48,7 s (≈ 1,1 s); Zahl + „YEARS“ ganz im Bild ✓ (Endwert ≈ 0,2 s nach „years“, nicht beim Wort – vertretbar, Zähler rollt auf die gesprochene Zahl zu) |
| P2-3 five | 65,2 / 66,6 / 67,6 s | Telefon groß, Opa mit offenem Gähnmund und geschlossenen Augen bei „yawns goodnight“ ✓ |
| P2-4 speed | 39,3 s | „SPEED: c“, Bahnen LIGHT/RIPPLE als Bogen auf die Erde ✓ (Rest P3-a) |
| P2-5 ocean ≥ 1,3 s | dive 94,70–96,23 s = 1,53 s | ✓; Eis in Shot 1 (94,0 s Schollen) lesbar |
| P2-6 tally „2 H“ | 104,0 / 105,4 / 105,9 s | Balken unter der Platte, kein Anschnitt ✓ (Werte stehen nur noch in der Platte) |
| P2-7 „1.7 S“ einmal im Bild | 50,3 / 50,7 s | Sticker weg; im Bild nur Bahn-Label „+1.7 S“ (ab Lichtankunft) + Platte ✓ |
| Höhepunkt | turn 80,97 s = 72,7 %, Himmel schwarz 83,36 s = 74,8 %, Augen auf 85,02 s = 76,3 % (von 111,4 s) | ✓ im Fenster; ±0,2 s Verschiebung ändert < 0,2 % |
| Loop / End-Card | 109,2 s = Cover-Bildaufbau, 111,2 s „KnowToon“ getippt | ✓ |

### Min 1,07 s – welcher Shot?
**orbit Shot 2 „close-up NOTHING HERE“ 53,20–54,27 s** (durch die Neuvertonung: `orbitEmptySpot − 4` liegt jetzt 1,07 s vor Szenenende; vorher 1,30 s). Bei 53,3 s ist „NOTHING HERE“ noch kaum sichtbar, bei 53,9 s lesbar; Bild = derselbe Ring + Erde wie Shot 1, liest sich als Ranschnitt.

### Restmängel
**P2**
1. orbit 53,2 s: Shot 2 nur 1,07 s ohne erzählerischen Grund. Vorschlag: Schnitt früher (`orbitEmptySpot − 14` → ≈ 1,4 s) oder Shot mit Shot 1 verschmelzen (Push-in statt Schnitt).

**P3**
- a. speed 37,40–≈ 38,3 s: Shot 2 beginnt mit Erde allein auf dem Gitter (38,0 s), das Rennen erscheint erst ≈ 1 s später – Bahnen ab Shot-Beginn zeigen.
- b. ocean dive 94,9 s: heller Lichtkegel von oben liest sich eher als Scheinwerfer als „durchs Eis“; Eiskante oben im Kader wäre klarer.
- c. five: hellbraunes Teleskop/Stab läuft diagonal über Opas Kinn (66,6 s) – leicht verrückt, Mund bleibt frei.
- d. Cover 0,6 s: Titel blendet noch über den Untertitel (aus R1 offen).
- e. turn Nacht ohne erkennbare Sterne, hook-Sticker klein, Untertitel auf Mund old/juno (aus R1 offen).

### Note: **9,0 / 10** (Regie)
Beleg: alle P1/P2 aus Runde 1 an den neuen Wortzeiten belegt erledigt (seven 7:19 genau auf „left“ 75,45 s, Zähler ganz im Bild mit 130 000 000 vor dem nächsten Satz, five/speed/ocean zeigen ihr Verb, „1.7 S“ nicht mehr dreifach). Höhepunkt 74,8 %, Shots ≤ 4 s, Loop sauber. Rest: ein neuer Mikro-Shot (orbit 1,07 s, P2, Ranschnitt ohne Lesbarkeitsschaden) und P3-Feinheiten – keine Freigabe-Hürde. Sollte die Stille vor turn noch wandern: nur seven 7:19 auf „left“ und den orbit-Shot nachmessen.
