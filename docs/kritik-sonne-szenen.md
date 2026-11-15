
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
