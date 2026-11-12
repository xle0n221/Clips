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
- Wikipedia-API drosselt (HTTP 429) über den geteilten Proxy: Artikel einzeln mit 15–20 s Abstand laden, nicht abbrechen und nicht umgehen (Tyson, 12.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 12.11.2026 · Mike Tyson v1 · 4 Wikipedia-Artikel neu geladen (Revisionen vermerkt), alle `sources`-Zitate weiter vorhanden. 2 Zuspitzungen: „Some say his troubles start there“ (Quelle: „many of the troubles … as his life and career progressed“, widerspricht früheren Festnahmen) und Sticker „YOUNGEST CHAMP EVER“ (nur heavyweight belegt); 2 Bild-Hinweise (12 Geschworene unbelegt, Kampfkleidung 2024 unbelegt). Alle 6 Autoren-Fragen freigegeben, Verurteilung sachlich. Neu geladener Kontext half: „the only casino to put out odds“ deckt 42-to-1 ohne Zusatz, „the media reported“ deckt „reportedly“. Experiment „erst Zahl/Name/Kausal/Absolut“: 4/4 Befunde dort, Rest ohne Befund → in Checkliste befördert · `quellen-mike-tyson.md` Prüfvermerke Drehbuch v1.
- 11.11.2026 · Erde ohne Menschen v1 · 24 WF-Zitate per curl: alle wörtlich da (Z2 ohne „according to news reports“). Hauptbefund: Swift-Zeile veraltet – Boost am 19.08.2026 abgesagt, Swift am 04.11.2026 wiedereingetreten; „waiting for a boost“ falsch. Lehre: bei laufenden Missionen/Ereignissen immer den **neuesten** Beitrag (Blog-Index) laden, nicht nur die zitierte Seite. Experiment „erst Zahl/Name/Kausal-Wort“ wiederholt: 5 Befunde, alle in Sätzen mit Zahl/Name/„always“/„because“ · `quellen-erde-ohne-menschen.md` Prüfvermerke.
- 09.11.2026 · Rom v3 (Stil-Umschrift) · 13 Szenen v2↔v3 verglichen, Zahlen 14/14 korrekt, keine neue Sachbehauptung; nur Hinweis: „sixty-six days later“ nach den Steinen verschiebt den Bezugspunkt (66 Tage = Regierungsdauer, Dio 74.17.5). Experiment „erst Zahl/Name/Kausal-Wort“: per Skript-Diff in einem Durchgang, nichts übersehen · `quellen-roemisches-reich.md` F1–F6.
- 08.11.2026 · Rom-Drehbuch v1 · 5 Umformulierungen, 0 Streichungen; „Vandal“-Satz entgegen Verdacht gedeckt (WHE) · `faktencheck-drehbuch-roemisches-reich.md`.
- 08.11.2026 · Rom-Drehbuch v2 · freigegeben, 2 Hinweise ohne Blockade.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
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
