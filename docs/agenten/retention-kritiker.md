# Rolle: Retention-Kritiker

> Gedächtnis dieser Rolle. **Vor jedem Auftrag lesen, nach jedem Auftrag ergänzen.** Ablauf: [`README.md`](README.md).

## Auftrag
Bewertet Drehbuch (und später Schnitt) danach, ob Zuschauer bis zum Ende bleiben und kommentieren. Liefert Top-5-Änderungen mit fertigem Ersatztext.

## Messlatte (woran der Prüfer die Arbeit bewertet, 1–10)
- Konkrete Sekunde/Szene, Problem, Ersatztext
- Vorschläge passen zur Freigabeliste (keine neuen Fakten)
- Begründung mit Referenzvideos (`referenz-analyse-2.md`)

## Checkliste (aktueller bester Stand – nur Erprobtes)
- Erst die ersten 3 s, dann den Schluss (Loop), dann die Mitte prüfen.
- Jede Szene braucht eine Veränderung des Einsatzes (HUD-Wert, Gefahr, Pointe).
- Von Stimme: Länge in Skriptwörtern bewerten – die Messung in `stimme-casting.md` (Methode) zählt Skriptwörter; das löst die offene Frage aus dem Rom-Review („Skript- oder Sprechwörter?“) (übertragen vom Wissensverwalter 09.11.2026).

## Gelernt (neueste oben; Datum · Clip · Befund · Beleg)
- 12.11.2026 · UFC v1 · Note 8: Hook mit Zitat in <2 s („Human cockfighting“), Re-Hook „Hold that number“ bei 39 % (76/194 W), Wendepunkt bei 67,5 %, Loop „what a senator called…“ → Satz 1 sauber. Umgesetzt: „Then“ → „Months later:“ in `empire` (Kontrast Vergleich ↔ Milliarden-Deal, +1 W). Offen (nicht umgesetzt, Wortzahl): `boom` (Frauen-Kampf) unterbricht die Geldspur – Verdienst bleibt, aber Brücke zum Geld fehlt; `empire` hat drei Zahlen in 8 s (Überladung). Lehre: Faktenkorrekturen verschieben Re-Hook-Positionen – nach jeder Korrektur Wortposition neu zählen (77→76, 136→131) · `episodes/ufc.json` note.
- 12.11.2026 · Tyson v1 · Befund-Block unten („Befund Tyson v1“): Re-Hook bei ~39 % (74/184 W) erfüllt, Loop und Wendepunkt (conviction, ~62 %) stark; Schwächen = Hook ohne Einsatz, Re-Hook beantwortet statt zu öffnen, Akzent auf „rape“, keine Pause vor Exodus-Satz, Bruch Exodus → 2024. Beleg: Wortzählung `episodes/mike-tyson.json` 184 W ≈ 65,7 s bei 2,8 W/s, plus 3 × 450 ms + 10 × 120 ms Pausen ≈ 68 s (> `lengthSec` 65).
- 11.11.2026 · Erde ohne Menschen v1 · Re-Hook lag bei ~47 % (236/496 Skriptwörter vor „swift“), weil zwei Stromausfall-Szenen (Spanien + Puerto Rico) und ein Zitat-Absatz davor stehen → Dubletten-Beats und Zitate vor dem Re-Hook streichen; Ziel 40 %. Loop-Schlusssatz stand auf `calm` → Loop-Satz braucht `tense/punch`. Mitte (Rost, Tschernobyl, CO2, Rushmore) folgt dreimal der Schablone „Year X → Fakt → Gag“ → Einsatz (HUD-Balken, Bedrohung) pro Szene hochhalten. Beleg: Wortzählung `episodes/earth-without-humans.json`, 496 W ≈ 177 s bei 2,8 W/s.
- 08.11.2026 · Rom v1 · Respawn-Regel im Hook vorgeschlagen und übernommen; „a general, Odoacer“ nicht übernehmbar (nicht freigegeben) → Vorschläge vorher gegen Freigabeliste prüfen.

## Befund Tyson v1 (12.11.2026, Drehbuch `episodes/mike-tyson.json`, Note 7/10)
Messung: 184 Skriptwörter, 11 Szenen; Re-Hook „How hard so far?“ bei Wort ~74 = 40 %; Wendepunkt `conviction` bei 62 %; Loop „Again:“ → Hook-Frage passt. Gesamtdauer ≈ 65,7 s Sprache + ≈ 2,5 s Pausen ≈ 68 s (Soll 65).
1. **Hook (Szene `hook`, 13 W ≈ 4,6 s):** Frage endet erst bei ~3 s und riskiert nichts; „Let's score it like a fight“ trägt schon die Rundenkarte. Ersatz: „Mike Tyson: a *hard* life, or his own fault? Score it.“ (10 W, −3, Frage ≈ 2 s). Gibt dem Zuschauer eine Seite zum Wählen und lädt zum Kommentar; Schluss („Hard? Brutally. Blameless? No.“) löst genau diese zwei Hälften auf. Cover-Text passend: „HARD LIFE OR HIS FAULT?“ (5 W) statt „HOW HARD WAS TYSON'S LIFE?“ (Sub „Scored round by round“ ist nett, nicht nötig).
2. **Re-Hook (Szene `mother`):** „How hard so far? *Brutal*.“ beantwortet die Frage, öffnet nichts → Zuschauer darf gehen. Ersatz: „How hard so far? *Brutal*. | And he's not champion yet.“ (+5 W; Folgeszene `champion` löst es ein, keine neue Tatsache).
3. **Akzent und Pause in der Schlüsselszene (`conviction`, `exodus`):** `*rape*` bekommt Betonung in ruhiger Szene (wirkt reißerisch); die Wende ist „isn't“. Ersatz: „Two years later, a jury convicts him of rape. He serves nearly three years. He denies it; appeals fail. | This one *isn't* bad luck.“ (±0 W). `exodus` hat keine Pause vor dem Satzende: „His four-year-old daughter, Exodus, is found tangled in a cord. | She dies the next day.“ (±0 W, ` | ` statt Komma-Fluss).
4. **Kausalbruch Exodus → Ending:** „At fifty-eight, he's still fighting.“ springt 15 Jahre ohne Bindeglied. Ersatz: „Fifteen years on, at fifty-eight, he's still fighting. He loses.“ (+2 W; Herleitung 2009 → 2024 = 15, Z36/Z37).
5. **Verdict betonen:** „Hard? *Brutally*. Blameless? *No*. You score it. Again:“ (±0 W). `ending` steht auf `punch`, passt; `champion` steht auf `hype` obwohl der erste Satz „he loses Cus“ traurig ist → `tense` für die Szene oder „hype“ erst ab „About a year later“ (Szene teilen kostet keine Wörter).
Rest: Mitte (`streets`, `detention`) kurz und mit Bildwechsel okay; `ear` als `normal` okay, kein Humor. Netto +4 W (188 ≈ 67 s) → `lengthSec` auf 68–70 setzen oder `Money trouble drags them into high-crime Brownsville.` kürzen. Alle Ersatztexte nur mit Wörtern/Fakten aus der Freigabeliste (Z2–Z37).

## Nächste Experimente (je Clip mindestens eins ausprobieren und messen)
- Nach dem ersten veröffentlichten Rom-Clip echte Zahlen (Wiedergabedauer, Kommentare) vom Nutzer erbitten und Vorhersage vs. Ergebnis vergleichen.
- Von Veröffentlichung: Einlöse-Sekunde des Titels mitbewerten (Rom: Titel A 0,92 s, Titel B 19,3 s, `agenten/veroeffentlichung.md`) (übertragen vom Wissensverwalter 09.11.2026).

## Bewertungsverlauf
| Datum | Clip | Note (Prüfer) | Wichtigster Grund |
| --- | --- | --- | --- |
| 11.11.2026 | Erde ohne Menschen v1 (Drehbuch) | 7 (Retention-Kritiker) | Starker Hook, Wendepunkt (Mond) und Loop; Re-Hook zu spät (~47 %), Mitte schablonenhaft, Stimmungsbruch Zitat/Nachschlag nach der Auflösung |
| 12.11.2026 | Mike Tyson v1 (Drehbuch) | 7 (Retention-Kritiker) | Re-Hook 40 %, starker Wendepunkt und Loop; Hook ohne Einsatz, Re-Hook öffnet nichts, Akzent auf „rape“ |
| 12.11.2026 | UFC v1 (Drehbuch) | 8 (Retention-Kritiker) | Zitat-Hook + Geldspur-Re-Hook + sauberer Loop; Mitte (`boom`) und `empire` (3 Zahlen) überladen |
