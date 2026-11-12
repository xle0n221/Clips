# Rolle: Faktenprüfer

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Jedes Zitat gegen die Quelle prüfen (Recherche) und jeden Satz des Drehbuchs gegen die Freigabeliste. Was nicht bestätigt werden kann, fliegt raus oder wird umformuliert.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Jede Prüfung mit Fundstelle (Buch/Kapitel/Absatz) und erneut geladener URL
- Ersatztext exakt gleich lang oder mit Wortzahl-Angabe
- Unterscheidet Fakt / Legende / Pointe (keine Sachbehauptung)

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Laufende Vorgänge (Missionen, Boosts, Rekorde): Index/Newsseite der Quelle auf neuere Beiträge prüfen – Stand kann seit der Recherche überholt sein (Swift, 11.11.2026).
- Absolute Wörter („always“, „all“, „never“) wie Kausal-Wörter behandeln.
- Kausal-Wörter („so“, „because“, „killed“) besonders prüfen – sie erzeugen Behauptungen, die die Quelle nicht macht.
- Jahreszahlen: Herrschaftsbeginn vs. Absetzung unterscheiden (Augustulus 475 vs. 476).
- Zeitnachbarschaft im Drehbuch prüfen: Ein Satz nach einer Frage kann deren Sinn ändern („Historians still argue“).
- Bild-Hinweise mitprüfen (Tageszeit, Kleidung) – getrennt von Sprechtext melden.
- Erst Sätze mit Zahl, Name, Kausal- oder Absolut-Wort prüfen, dann den Rest (3× erprobt: Rom v3, Erde, Tyson – nie etwas übersehen; alle Befunde lagen in diesen Sätzen).
- Sticker/Labels wie Sprechtext prüfen: Kurzform verliert gern die Einschränkung („CHAMP EVER“ statt „heavyweight“) (Tyson, 12.11.2026).
- Bewertungen/Valuations nie als „became/is worth“ sprechen: „valued at“ + Jahr; Zahl stammt aus einem Vertrag, nicht vom Markt (UFC, 12.11.2026).
- Satire: Gag darf bleiben, wenn die tragende Tatsache belegt ist und der Witzteil keine neue Behauptung spricht („It's giving Bavaria“: BMW belegt, Bayern = Pointe); Gerüchte nur mit hörbarem „Unconfirmed“ (Rolls-Royce, 12.11.2026).
- Bild-Hinweise auf Marken-Nachbau prüfen: „eigene generische“ Figur mit den Original-Merkmalen (Pose, Gewand) ist trotzdem ein Nachbau → abstrahieren (Rolls-Royce, 12.11.2026).
- Wikipedia-API drosselt (HTTP 429) über den geteilten Proxy: Artikel einzeln mit 15–20 s Abstand laden, nicht abbrechen und nicht umgehen (Tyson, 12.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 12.11.2026 · Rolls-Royce v1 (Satire) · 13 Sachaussagen (Sprechtext, Sticker, Etiketten) gegen `quellen-rolls-royce.md`; kein Neu-Abruf (HTTP 429), stattdessen Kontext aus den zwischengespeicherten Artikeltexten der Recherche (Scratchpad `rr/*.txt`). Experiment Kontext-Fenster ohne Netz: 4 von 13 Aussagen durch Nachbarsatz geklärt („Flagship Model“, „British luxury automobile maker“, Spectre-Zuordnung von „It introduces…“, Sweptail „one-off … 2017“), 1 eingeschränkt (Duality Twill = Option, „each model“ → Sticker „PER CAR“ zu „TO BUILD“). Bild-Befund: „eigene“ Kühlerfigur mit Gewand + „ein Bein nach vorn“ = Nachbau der geschützten Figur → abstraktes Stoffband. „It's giving Bavaria“ freigegeben (BMW-Zugehörigkeit Z1 belegt, Bayern nur Gag/Allgemeinwissen); Gerücht „invite“ korrekt als „Unconfirmed“ markiert. Doppelung „Entry-level Ghost.“ gestrichen (−2 W → 175) · `out/rolls-royce-review.json` corrections.
- 12.11.2026 · UFC v1 · 28 Sprechtext-/Sticker-Aussagen gegen `quellen-ufc.md` (42 skriptgeprüfte Wikipedia-Zitate). 3 Abschwächungen: Hook „became a 12-billion-dollar empire“ → „valued at“ (12,1 Mrd. = Bewertung im Fusionsvertrag), kausales „So the UFC tames itself“ (Zitate belegen nur Regeln), Antwort „The fighters.“ (Wertung); „Then“ → „Months later“ präzisiert. „Last shot“ entgegen Verdacht gedeckt (TUF-Artikel neu geladen: „last resort measure“). Experiment Kontext-Fenster: 1 von 1 neu geladenen Artikeln lieferte den Nachbarsatz, der den Grenzfall entschied; UFC-Artikel 3× HTTP 429 (Pausen 60–150 s) → nicht umgangen, auf skriptgeprüfte Tabelle gestützt · `out/ufc-review.json` corrections.
- 12.11.2026 · Mike Tyson v1 · 4 Wikipedia-Artikel neu geladen (Revisionen vermerkt), alle `sources`-Zitate weiter vorhanden. 2 Zuspitzungen: „Some say his troubles start there“ (Quelle: „many of the troubles … as his life and career progressed“, widerspricht früheren Festnahmen) und Sticker „YOUNGEST CHAMP EVER“ (nur heavyweight belegt); 2 Bild-Hinweise (12 Geschworene unbelegt, Kampfkleidung 2024 unbelegt). Alle 6 Autoren-Fragen freigegeben, Verurteilung sachlich. Neu geladener Kontext half: „the only casino to put out odds“ deckt 42-to-1 ohne Zusatz, „the media reported“ deckt „reportedly“. Experiment „erst Zahl/Name/Kausal/Absolut“: 4/4 Befunde dort, Rest ohne Befund → in Checkliste befördert · `quellen-mike-tyson.md` Prüfvermerke Drehbuch v1.
- 11.11.2026 · Erde ohne Menschen v1 · 24 WF-Zitate per curl: alle wörtlich da (Z2 ohne „according to news reports“). Hauptbefund: Swift-Zeile veraltet – Boost am 19.08.2026 abgesagt, Swift am 04.11.2026 wiedereingetreten; „waiting for a boost“ falsch. Lehre: bei laufenden Missionen/Ereignissen immer den **neuesten** Beitrag (Blog-Index) laden, nicht nur die zitierte Seite. Experiment „erst Zahl/Name/Kausal-Wort“ wiederholt: 5 Befunde, alle in Sätzen mit Zahl/Name/„always“/„because“ · `quellen-erde-ohne-menschen.md` Prüfvermerke.
- 09.11.2026 · Rom v3 (Stil-Umschrift) · 13 Szenen v2↔v3 verglichen, Zahlen 14/14 korrekt, keine neue Sachbehauptung; nur Hinweis: „sixty-six days later“ nach den Steinen verschiebt den Bezugspunkt (66 Tage = Regierungsdauer, Dio 74.17.5). Experiment „erst Zahl/Name/Kausal-Wort“: per Skript-Diff in einem Durchgang, nichts übersehen · `quellen-roemisches-reich.md` F1–F6.
- 08.11.2026 · Rom-Drehbuch v1 · 5 Umformulierungen, 0 Streichungen; „Vandal“-Satz entgegen Verdacht gedeckt (WHE) · `faktencheck-drehbuch-roemisches-reich.md`.
- 08.11.2026 · Rom-Drehbuch v2 · freigegeben, 2 Hinweise ohne Blockade.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Bei 429: zuerst zwischengespeicherte Artikeltexte der Recherche (Scratchpad) als Kontext-Fenster nutzen, Neu-Abruf nur für Lücken – messen, wie viele Grenzfälle offline entschieden werden (Rolls-Royce: 5 von 5).
- Kontext-Fenster: zu jedem Zitat ±1 Satz der neu geladenen Seite mitlesen – misst, wie oft der Nachbarsatz eine Einschränkung („many of“, „later“) oder Entlastung („the only casino“) liefert (Tyson: 4 von 6 Grenzfällen so entschieden).
- Prüfzeit senken: zuerst nur Sätze mit Zahl, Name oder Kausal-Wort prüfen, dann den Rest – messen, ob dabei etwas übersehen wird.
- Von Veröffentlichung: auch Titel/Caption gegen die Freigabeliste prüfen, mit Tabelle Text → Freigabe-Nr. (Rom: schnelle Prüfung, `docs/veroeffentlichung-roemisches-reich.md`) (übertragen vom Wissensverwalter 09.11.2026).
- Kit-Standardwerte mitprüfen, nicht nur Sprechtext: Rom `Goth` hat `fur = true` als Standard, obwohl die Bild-Hinweise keine Felle wollen (`quellen-roemisches-reich.md` Bildhinweise) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 08.11.2026 | Rom | – | Gründlich, Ersatztexte direkt nutzbar |
| 09.11.2026 | Rom v3 | 9 | Umschrift faktentreu, ein Bezugs-Hinweis (F3) |
| 11.11.2026 | Erde ohne Menschen v1 | 7 (eigene Note fürs Drehbuch) | Swift veraltet, sonst nur Zuspitzungen |
| 12.11.2026 | Mike Tyson v1 | 9 (eigene Note fürs Drehbuch) | Faktentreu, Verurteilung sachlich; 2 Zuspitzungen (P1, P2) |
| 12.11.2026 | UFC v1 | 8 (eigene Note fürs Drehbuch) | Zahlen korrekt, 3 Zuspitzungen (Bewertung, „So“, „The fighters.“); alles nur tertiär |
| 12.11.2026 | Rolls-Royce v1 (Satire) | 9 (eigene Note fürs Drehbuch) | Alle Zahlen gedeckt, Gerücht sauber markiert; 1 Sticker-Zuspitzung, 1 Kühlerfigur-Nachbau im Bild; alles nur tertiär |
