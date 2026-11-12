# Rolle: Drehbuch

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Englisches Sprechskript mit Szenen, Cues, HUD, Auswahlkarten. Ergebnis `episodes/<thema>.json`. Prüfer: Retention-Kritiker + Faktenprüfer.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Hook in ≤ 2 s, Frage/Einsatz sofort klar
- Roter Faden (eine Figur, ein Ziel), Kausalkette statt Liste, Eskalation
- Pointe am Satzende, Loop zum ersten Satz
- 2,3–2,6 Wörter/s (natürlich; lieber Stoff kürzen als schneller), jede Aussage belegt
- Klingt gesprochen lebendig (kurze Sätze, Ausrufe, Fragen)

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Vor dem Auftrag `docs/trends/aktuell.md` lesen (tägliche Trend-Analyse, Vorgabe Nutzer 12.11.2026) und passende Erkenntnis als Experiment nutzen.
- Du-Perspektive + Spiel-Logik (Respawn, Hard/Nightmare mode) trägt Geschichte als Abenteuer.
- Legenden mit „Legend says / One story says / As the story goes“ einleiten.
- Jahreszahlen in `years`, schwierige Namen in `say` (nur für die Stimme).
- Keine freistehenden „—“ (werden eigene Untertitel-Wörter); Pausen mit „…“ am Wort.
- Auswahlkarten-Optionen ≤ ~18 Zeichen.
- „Part 1“ nur, wenn Teil 2 geplant ist.
- Von Faktenprüfer: Kausal-Wörter („so“, „because“, „killed“) vor der Abgabe selbst gegen die Quelle prüfen – Rom v1: 5 Umformulierungen (`faktencheck-drehbuch-roemisches-reich.md`) (übertragen vom Wissensverwalter 09.11.2026).
- Von Stimme: Länge in **Skriptwörtern** planen und Zahlen sparsam setzen – Zahlen-Szenen sprechen langsamer (Rom hook–stones 3,0 W/s bei 1,25, `stimme-casting.md`) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 12.11.2026 · Jensen Huang v1 · Experiment „Pointe-Satz zuerst“ (aus Rolls-Royce v3) weitergeführt: Pointe vor dem Schreiben festgelegt („confidence lasted four days“), sodass Hook, Mitte und Loop denselben Callback tragen (Stempel → Milchtüte → Stoppuhr). **Wortbudget wieder verfehlt:** Erstentwurf 375 W bei Budget ≤ 178 (+111 %), weil 13 Stationen geplant waren (Regel ≤ 11 nicht beachtet). Drei Kürzungsdurchgänge (Bingo-Meme, Frage-Szene und Re-Hook-Szene gestrichen, Untersuchung und Vorwurf zu einer Szene zusammengelegt, Zahlen nur im Bild) → 176 W ≈ 84–93 s, also über 85 s. Lehre: Bei realen Personen kostet die Absicherung („The New York Times reports …“, „reportedly“, „which Beijing denies“, „the board says it has no reason to believe“) etwa 15–20 % der Wörter. Deshalb mit ≤ 9 Stationen planen und Meme-Formate ins Bild legen (Ticker, Gebets-Caption) statt sie zu sprechen. Eine harte Witzzielregel half: Witze nur über Verhalten, PR und Börse, nie über die Frauen oder eine Nationalität; die Vorwurfs-Szene bleibt bewusst ohne Witz und mit Musik-Aussetzer. Selbstnote Retention 7/10 · `episodes/jensen-huang.json` Feld `note`, `out/jensen-script-review.json`.
- 12.11.2026 · Rolls-Royce v3 · **Nutzer-Urteil v2: „Wo ist der Sinn des Videos? Video ist auch nicht witzig“.** Ursache: (1) 10 „Steps“ waren eine Faktenliste (Stiche, Sterne, Gewand, Cocktail suite, BMW, Kombi) ohne Bezug zur Frage „wie werde ich Fahrer?“ – keine Antwort, keine Erkenntnis; (2) „Step 1: be rich. Done?“ witzelte das einzige Hindernis (Geld) in Sekunde 1 weg → kein Einsatz, kein Konflikt; (3) Meme-Formate wurden **vorgelesen** („It's giving starter pack“, „Nobody: / Rolls-Royce:“) statt als Setup→Punchline gebaut – gesprochen sind sie tot; (4) Pointen waren nackte Fakten („They're robes“), die erst mit Vorwissen lustig sind; (5) Stakkato-Füller („Done? Cool.“, „Nah.“, „Go!“) zerhacken Rhythmus und Pausen. Gegenmittel: **erst die Pointe in einem Satz festlegen, dann Szenen nur noch als Weg dorthin** (Frage → Fehlversuche → Entdeckung → Antwort); Witze = Setup → Punchline am Satzende, ein Running Gag mit Entwicklung (Wallet schwitzt → stirbt → wacht auf) + ein Callback zur Pointe; Meme-Formate ins Bild, gesprochen nur Sätze, die ohne Bild lustig sind; doppelte Bedeutung im Titel ausnutzen („driver“ = Chauffeur). v3: 159 W ≈ 76–84 s, Re-Hook erst bei 46–50 % (zu spät), Selbstnote 7/10 · `episodes/rolls-royce.json` v3, `out/rr-script-review.json`.
- 12.11.2026 · Rolls-Royce v1 · Experiment „erst ≤ 11 Stationen, dann Wörter zählen“ (Ziel Erstentwurf ≤ +10 %): **erreicht** – 10 Stationen (Step 1–10) vorab festgelegt, Erstentwurf 182 Wörter bei Budget 170–180 (+1 % über Obergrenze), ein Feinschliff (−5: Füllwörter „But“, „Obviously“, Loop-Satz kürzer) → 177. Lehre: Stationen-Deckel wirkt; nummerierte „Step N“-Klammer macht Satire zur Kausalkette und trägt den Loop („Which brings us back to…“ → „Step 1: be rich.“). Re-Hook als Ankündigung „Still here? 2 plot twists incoming.“ bei Wort 70/177 (39,5 %) – Twists erst danach einlösen. Satire + dünne Quellenlage: Gerücht nur als „Rumor says … Unconfirmed.“ mit Stempel im Bild; Preise ohne Jahr ganz weglassen und die Pointe stattdessen auf belegte Kuriositäten bauen (Kombi-Einstufung, Gewand statt Flügel, 2,2 Mio. Stiche). Meme-Formate nur als eigene Text-Layouts · `episodes/rolls-royce.json` Feld `note`.
- 12.11.2026 · UFC v1 · Experiment „Wortbudget je Satz mitzählen“ (Ziel Erstentwurf ≤ +10 %): **verfehlt** – Erstentwurf 264 Wörter bei Budget 190 (+39 %), weil 13 Stationen (inkl. Gracie, Frauen, Wetten) geplant waren; zwei Kürzungsdurchgänge über Stationen-Streichen (Gracie, 90.000 PPV, Gouverneurs-Zahl) statt Satzkürzen → 195. Lehre: **erst Stationen auf ≤ 11 begrenzen**, dann Sätze zählen; Zählskript nach jedem Durchgang. Zahlen im Sprechtext als Ziffern sparen Skriptwörter (1993 = 1 Wort), verlängern aber die Sprechzeit (Bindestrich-Beträge wie *375-million-dollar*) → Länge beim Stimm-Lauf messen. Zwei Re-Hooks: Geldspur „Hold that number.“ bei 39,5 % + Leitfrage „But who paid the price?“ als Wendepunkt bei 69,7 %. Unsichere Quellenpunkte gelöst durch Runden („about 4 billion“), „almost no rules“, „estimated … a fifth“, „claiming“, Vergleich ohne Schuld-Wort; Dana-White-Vorfall weggelassen · `episodes/ufc.json` Feld `note`.
- 12.11.2026 · Mike Tyson v2 · Faktenprüfer 9/10 (P1 'later troubles' – Abschwächer der Quelle mitnehmen; P2 Rekord-Sticker immer mit Gewichtsklasse; P3 keine unbelegten Zahlen im Bild-Hinweis, z. B. 12 Geschworene; P4 Kostüm späterer Jahre als Stil markieren) + Retention 7/10 (Hook mit Entscheidungsfrage 'a hard life, or his own fault?' statt neutraler Frage; Re-Hook muss öffnen statt beantworten; Akzent nie auf das Delikt; Pause vor dem schwersten Satz; Zeitsprünge mit Brücke 'Fifteen years on'). Umgesetzt: 191 Wörter (+7), lengthSec 68, Re-Hook jetzt Wort 71/191 = 37,2 % (durch kürzeren Hook nach vorn gerückt – beim Hook-Kürzen Re-Hook-Index nachmessen), 0 fehlende Cue-Wörter · `episodes/mike-tyson.json` v2.
- 12.11.2026 · Mike Tyson v1 · Experiment Wortbudget je Szene vorab (Ziel 180 bei 65 s): Erstentwurf trotzdem 235 Wörter (+31 %), weil Sätze ohne Mitzählen geschrieben wurden → ein Kürzungsdurchgang (−51), Endstand 184 (= 61–71 s bei 2,3–2,6 W/s). Lehre: Budget je **Satz** (≈ 5–7 Wörter) mitzählen, Jahreszahlen dem HUD-Zähler überlassen statt sprechen (sparte ~12 Wörter). Re-Hook über Wortindex gesetzt: Wort 73/184 = 39,7 % ('How hard so far? Brutal.'). Reale Person mit Verurteilung: keine Du-Perspektive, 'you' nur als Punktrichter am Schluss; Fortschrittsbalken bewegt sich bei selbst verursachten Taten bewusst nicht · `episodes/mike-tyson.json` Feld `note`.
- 11.11.2026 · Erde ohne Menschen v2 · Faktenprüfer 7/10: Quellenzeile zu Swift war nach 9 Monaten veraltet (Boost abgesagt, Absturz Nov. 2026) → bei Ereignissen „in progress“ die neueste Seite derselben Quelle prüfen; Abschwächer der Quelle wörtlich übernehmen („appeared to“, „most of“, „often“). Retention 7/10: Re-Hook-Position über Wortindex steuern (Ziel 40–44 %, erreicht 203/470 = 43 % durch Verlegen in 'satellites') · `episodes/earth-without-humans.json` v2.
- 11.11.2026 · Erde ohne Menschen v1 · Erster Entwurf 558 Wörter (≈ 199 s) → 496 durch Kürzen je Szene auf eine Pointe; Zählskript (Wörter ohne `*`/`|` + Cue-Wort-Abgleich) fand 0 fehlende Cue-Wörter. Gedankenexperiment-Thema: heutige Ereignisse (Spanien-Blackout, Tschernobyl) als „preview“ markieren, statt Folgen ohne Menschen mit Zahlen zu behaupten · `episodes/earth-without-humans.json`, Feld `sources` je Szene.
- 08.11.2026 · Rom v1 · Retention 7/10: Goten/Vandalen ohne „you“, zu viele Zahlen → v2 behoben.
- 08.11.2026 · Sonnensystem · wirkte wie Liste statt Kausalkette → Regel „roter Faden“.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Jensen Huang (läuft): Running Gag als Callback-Kette eines echten Zitats („confidence“ → 4 Tage → Stoppuhr im Loop). Frage an Retention-Kritiker und Nutzer: Trägt ein belegtes Zitat die Pointe so gut wie ein erfundener Running Gag (Wallet bei Rolls-Royce)? Nächster Clip: Stationen ≤ 9 bei Reale-Person-Themen und Wortzahl nach jeder Szene zählen.
- Rolls-Royce v3 (läuft): „Pointe-Satz zuerst“ + Running Gag mit 3 Stufen – Nutzer-/Retention-Urteil: erkennt man den Sinn, wird gelacht? Nächster Clip: Pointe-Satz vor dem Schreiben ins Feld `pointe` und Re-Hook auf ≤ 44 % bringen.
- Rolls-Royce (läuft): Re-Hook als Versprechen („2 plot twists incoming“) statt Frage + Record-Scratch an beiden Twists – Retention-Kritiker: hält die Ankündigung die Mitte (Schritte 5–7 sind Aufzählung)?
- Nächster Clip: Wortzahl je Szene schon im Entwurf als Kommentar mitführen und Zahlen-Szenen (≥ 2 Zahlen) auf ≤ 20 Wörter deckeln.
- UFC (läuft): Doppel-Re-Hook (Geldspur 39,5 % + Leitfrage als Wendepunkt 69,7 %) und HUD-Balken, der ab 'price' stillsteht, während der Geld-Zähler weiterläuft – Retention-Kritiker: trägt die Geldspur die Mitte, kommt die Leitfrage zu spät?
- Nächster Clip: Stationen vor dem Schreiben auf ≤ 11 begrenzen, dann Wortbudget je Satz (Ziel Erstentwurf ≤ +10 %).
- Mike Tyson (läuft): Re-Hook bei 39,7 % + Balken, der bei der Verurteilung stehen bleibt ('This one isn't bad luck') – Retention-Kritiker: trägt die Mitte, wirkt der Stillstand als Wendepunkt?
- Nächster Clip: Wortbudget je Satz beim Schreiben mitzählen (Ziel: Erstentwurf ≤ +10 % über Budget).
- Erde ohne Menschen (läuft): Re-Hook der zentralen Frage bei ~40 % (Szene `swift`, „how long until Earth forgets us?“) + gleicher Sticker „HOW LONG?“ wie im Hook – Retention-Kritiker/Kontaktabzug bewerten, ob die Mitte (Satelliten→Hubble) trägt.
- Nächster Clip: erst Wortbudget je Szene festlegen (Summe = Ziel), dann schreiben – hier kostete Nachkürzen einen Durchgang.
- Rom: erster EMPIRE-Balken-Abfall auf „hates“ – nach dem Render prüfen, ob die Grafik den Satz trägt.
- Nächster Clip: Cliffhanger-Frage nach 40 % der Laufzeit wiederholen (Re-Hook) und Wirkung im Kontaktabzug bewerten.
- Von Veröffentlichung: Kern-Wort des geplanten Titels in den ersten 3 Wörtern sprechen und einen Hook-Sticker auf ≤ 0,3 s legen (Rom: erstes Text-Bild erst bei 0,92 s, `austausch.md` 09.11.) – Wirkung im Kontaktabzug prüfen (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 08.11.2026 | Rom v1 | 7/10 (Retention) | zu viele Zahlen, Gegner ohne „you“ |
| 08.11.2026 | Rom v2 | Fakten freigegeben, Nutzer: OK | – |
| 12.11.2026 | Rolls-Royce v2 | Nutzer: Nicht OK | „kein Sinn, nicht witzig“ – Faktenliste statt Pointe, Memes vorgelesen |
| 12.11.2026 | Rolls-Royce v3 | 7/10 (Selbstprüfung) | klare Pointe + Running Gag; Re-Hook spät (46–50 %), nur Tertiärquellen |
| 12.11.2026 | Jensen Huang v1 | 7/10 (Selbstprüfung) | klare Pointe (4 Tage confidence) + Callback-Loop; 176 W über 85 s, Re-Hook 44 %, nur Suchzusammenfassungen als Quellen |
