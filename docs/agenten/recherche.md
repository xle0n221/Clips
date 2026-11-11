# Rolle: Recherche

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Fakten zum Thema aus Primärquellen sammeln, wörtlich zitieren, mit URL. Ergebnis `docs/quellen-<thema>.md`. Prüfer: Faktenprüfer.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Jede Aussage mit wörtlichem Zitat + URL (Primärquelle vor Tertiärquelle)
- Zahlen mit Herleitung
- Mythen und Legenden markiert
- Bild-Hinweise (Kleidung, Orte, Farben) belegt oder als Stil-Entscheidung markiert

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Britannica, Met, British Museum blocken Bots → Thayer (penelope.uchicago.edu), Project Gutenberg, NASA, Museen mit offener Seite nutzen.
- Pro Fakt notieren, ob Primär-, Sekundär- oder Tertiärquelle.
- Legenden (z. B. Prokop: Hahn „Roma“) ausdrücklich als Legende einordnen, mit der Formel für den Sprechtext („Legend says“).
- Freigabeliste am Ende: nur was der Faktenprüfer bestätigt, darf ins Drehbuch.

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 11.11.2026 · Erde ohne Menschen (2. Durchgang) · Nach Freigabe 8 weitere Fakten (NRC, Golden Gate, NPS, Falchi 2016, Ioakeimidis 2016, ESA) per curl + Textsuche wörtlich geprüft; cdc/mta/iaea/usgs/cell/noaa blieben 403 (Akamai). Methode bewährt: Seite mit `curl -A ClipsResearch/1.0` laden, Tags entfernen, Zitat mit `in` gegen den Text prüfen (WebFetch-Zitate sind Modell-Auszüge). Browser-User-Agent vortäuschen ist verboten (Filter lehnt ab) · `quellen-erde-ohne-menschen.md`.
- 11.11.2026 · Erde ohne Menschen (1. Durchgang) · Netz war auf science.nasa.gov (+ Gutenberg) beschränkt; cdc/nrc/nps/goldengate/mta/iaea/esa/noaa/cell/ncbi/wikipedia gesperrt → nur 15 Aussagen statt 20–30. Vor dem Auftrag Erreichbarkeit mit einer curl-Schleife je Host prüfen (1 Minute) und nicht auf unerreichbare Stränge bauen. WebSearch-Zusammenfassungen sind kein Beleg (z. B. „Hubble 2033–2034“ stand nicht auf der abgerufenen Seite, dort nur „mid 2030s at the earliest“) · `quellen-erde-ohne-menschen.md`.
- 08.11.2026 · Rom · Überschrift F1 „Hahn“ und F9 waren unscharf, F12 „Golddach“ war falsch („vergoldetes Bronzedach“) · `faktencheck-roemisches-reich.md`.
- 08.11.2026 · Rom · „six princes cut off by the sword“ (Gibbon) widerspricht Gibbons eigener Erzählung → Zahlen nie nur aus einer Zusammenfassung übernehmen · `faktencheck-drehbuch-roemisches-reich.md`.

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Erde ohne Menschen: mit offenem Netz die Lücken schließen (Kernkraft/NRC+IAEA, U-Bahn/MTA, CDC-Läuse, NPS, Golden Gate, Plastik/NOAA, Falchi 2016, Deryabina 2015) und messen, wie viele davon der Faktenprüfer freigibt; Kandidatenliste steht unten in der Quellen-Datei.
- Für jedes Thema 2 „Wow“-Fakten mit Zahl suchen, die man in einem Bild zeigen kann (Info-Grafik), und messen, ob das Drehbuch sie übernimmt.
- Von Art Direction/Faktenprüfer: für jedes Kostüm- und Kulissen-Detail, das das Kit braucht (Kopfbedeckung, Fell, Farben), eine Zeile „belegt/unbelegt“ in die Bild-Hinweise – Rom: Querbusch und Goten-Fell kamen ohne Beleg ins Kit (`design-system.md` §2.4, §6) (übertragen vom Wissensverwalter 09.11.2026). Quellen-Typen je Themen-Art: `docs/playbook-themen.md` C1–C6.

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 08.11.2026 | Rom | – (76 Zitate geprüft, 3 Korrekturen) | Überschriften zu weit gefasst |
