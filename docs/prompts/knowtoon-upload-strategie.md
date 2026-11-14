# Upload-Strategie und Performance-Auswertung (Nutzer 14.11.2026) – ergänzt die beiden KnowToon-Prompts

Wortlaut des Nutzers (unverändert):

```
KNOWTOON – UPLOAD-STRATEGIE UND PERFORMANCE-AUSWERTUNG
Ablage: docs/prompts/knowtoon-upload-strategie.md

0. GELTUNG
- Dieser Prompt ERGÄNZT die bestehenden Prompts. Er regelt nur Veröffentlichung und Auswertung.
- Rangfolge bleibt: Erweiterung > Basis-Prompt > Hausregeln. In seinem eigenen Bereich (Upload-Zeiten, Kennzahlen, Auswertung) geht dieser Prompt vor.
- Gilt ab sofort für alle Videos, auch für die bereits fertigen.
- Die vier Freigabe-Stationen bleiben gleich. Es kommt keine neue Station dazu.
- Paket-Aufbau, Scorecard und Handover bleiben gleich. Neu ist nur der Block „Upload“ in `publish` und die Auswertung alle 14 Tage.
- Wie bisher: keine Rückfragen im Chat, Antworten an mich auf Deutsch, Publish-Texte auf Englisch, Fakten nur mit Quelle, Unbelegtes als „Ich kann das nicht bestätigen“.

1. ZUSTÄNDIGKEIT
- Rolle Veröffentlichung: Slot vorschlagen, Ortszeiten berechnen, `publish` ergänzen.
- Rolle Wissensverwalter: Kennzahlen ablegen und Auswertung schreiben.
- Rolle Trend-Scout: nutzt die Auswertung für die Themenwahl.
- Hochladen und Zahlen eintragen mache ich selbst, solange kein Werkzeug dafür angebunden ist.
- Sparsam bleiben: Auswertung nur, wenn neue Zahlen vorliegen. Kleinstes Modell, das die Aufgabe schafft.

2. ZIELE (in dieser Reihenfolge)
1. Hohe Zuschauerbindung pro Video
2. Neue Follower/Abonnenten aus englischsprachigen Ländern
3. Aufrufe
4. Monetarisierung
Qualität geht vor Menge. Die Mindestnote 9/10 wird für keinen Slot gesenkt.

3. ZIELMÄRKTE
Primär (danach wird optimiert): USA (Eastern und Pacific), Großbritannien, Kanada.
Sekundär (nur beobachten): Australien, Indien, Philippinen, weitere englischsprachige Länder.

4. UPLOAD-PLAN (Start-Hypothese, täglich, deutsche Zeit)
Slot A: TikTok 17:00 | YouTube Shorts 18:00
Slot B: TikTok 22:00 | YouTube Shorts 23:00

Regeln:
- Der Plan ist die Ausgangsbasis, kein belegtes Optimum. Änderungen nur nach Abschnitt 7.
- Maximal 2 Videos pro Tag und Plattform. Der Plan richtet sich nach den fertigen Videos, nicht umgekehrt: Ist nur 1 Video auf `done`, kommt es in Slot B. Ist keins fertig, wird nicht gepostet.
- Dasselbe Video darf auf beiden Plattformen erscheinen, nie zweimal auf derselben.
- Bereits fertige Videos dürfen nur in den Plan, wenn sie die heutigen Regeln erfüllen (Englisch, mindestens 62 s, Urheberrecht nach `clip-regeln.md`). Sonst mit Grund im Dashboard als „nicht veröffentlichen“ markieren.
- Reihenfolge der Warteschlange: stärkste Scorecard zuerst, Themen-Arten abwechseln (Story, Wissen, What-if).

5. BLOCK „UPLOAD“ IN `publish` (bei Station „Fertig“)
- Vorgeschlagener Slot je Plattform mit Datum
- Uhrzeit in New York, Los Angeles und London, mit Rechnung
- Hinweis, falls USA und Europa gerade unterschiedlich auf Sommer-/Winterzeit stehen
- Themen-Art und Länge des Videos

6. KENNZAHLEN
Ich trage pro Video und Plattform im Dashboard ein:
Datum | Uhrzeit (DE) | Slot | Aufrufe nach 1 h / 24 h / 48 h / 7 Tagen | durchschnittliche Wiedergabedauer | % vollständig angesehen | neue Follower/Abonnenten | Top-3-Länder mit Anteil | Shares

- Datenmodell in `dashboard/README.md` um ein Feld `analytics` je Video erweitern.
- Ablage zusätzlich in `docs/analytics/uploads.md`, eine Zeile pro Upload.
- Fehlt ein Wert, steht dort „fehlt“. Keine Schätzwerte, keine erfundenen Zahlen.

7. AUSWERTUNG ALLE 14 TAGE → docs/analytics/auswertung-<datum>.md
TikTok und YouTube Shorts immer getrennt. Pro Plattform und Slot:
- Median der Aufrufe nach 24 h und 7 Tagen
- Bindung = durchschnittliche Wiedergabedauer ÷ Videolänge (in %)
- neue Follower pro 1.000 Aufrufe = neue Follower ÷ Aufrufe × 1.000
- Anteil der Aufrufe aus den Primärmärkten
Jede Rechnung mit Ausgangszahlen zeigen.

Änderungsregeln:
- Ein Slot wird erst bewertet, wenn mindestens [5] Videos pro Plattform darin liegen.
- Pro Auswertung höchstens ein Slot pro Plattform, höchstens um 1–2 Stunden.
- Ein einzelner Ausreißer ist kein Grund für eine Änderung.
- Vor jedem Schluss prüfen, ob Thema, Hook oder Länge den Unterschied erklären, nicht die Uhrzeit.
- Reichweite (Aufrufe) und Community-Aufbau (Follower pro 1.000 Aufrufe, Bindung) getrennt bewerten.
- Eine Plan-Änderung lege ich im Dashboard als Vorschlag vor. Sie gilt erst nach meinem „ok“.

8. RÜCKKOPPLUNG IN DIE PRODUKTION
- Die Auswertung liefert 3 Zeilen für `docs/lessons-log.md` und füllt die Stats im PREVIOUS-VIDEO-Block (Aufrufe, Wiedergabedauer, % bis zum Ende, Abbruch-Sekunde, falls bekannt).
- Der Trend-Scout bekommt die drei stärksten und drei schwächsten Themen-Arten.
- Der Test fürs nächste Video darf aus der Auswertung kommen, aber immer nur einer.

9. KENNZEICHNUNG
[GEMESSEN] Zahlen aus meinen Analytics
[STUDIE] externe Quelle mit Name und URL
[HYPOTHESE] Annahme
[EMPFEHLUNG] konkrete Handlung

10. AUSGABE DER AUSWERTUNG
1. Kurzfazit in 3 Sätzen
2. Aktueller Plan mit Ortszeiten der Primärmärkte
3. Tabelle pro Plattform: Slot | Anzahl Videos | Median 24 h | Median 7 Tage | Bindung % | Follower pro 1.000 Aufrufe
4. Stärkste Länder
5. Höchstens 3 Empfehlungen mit Begründung und Messgröße
6. Test
```

## Umsetzung (Orchestrator, 14.11.2026)
- **Abgleich mit den bestehenden Regeln:** Es gibt keinen Widerspruch. Der Prompt fügt nur `publish.upload`, `analytics`, `docs/analytics/` und die 14-Tage-Auswertung hinzu. Freigaben, Paket, Scorecard und Handover bleiben unverändert.
- **Ortszeiten:** Ich rechne mit der IANA-Zeitzonen-Datenbank (`python3` `zoneinfo`, im Container tzdata 2026e) für Europe/Berlin → America/New_York, America/Los_Angeles, Europe/London. Toronto hat dieselbe Zeit wie New York. Die Wechsel laut tzdata:

  | Gebiet | Winterzeit ab | Sommerzeit ab |
  | --- | --- | --- |
  | EU/UK | 25.10.2026 | 28.03.2027 |
  | USA | 01.11.2026 | 14.03.2027 |

  Daraus folgen zwei Zeiträume mit abweichendem Versatz: **25.10.–31.10.2026** und **14.03.–27.03.2027**. In diesen Zeiträumen ist New York nur 5 statt 6 h hinter Berlin, Los Angeles nur 8 statt 9 h. Der Block nennt das dann ausdrücklich.
- **Winterzeit (Stand 14.11.2026):**

  | Slot | Berlin | New York | Los Angeles | London |
  | --- | --- | --- | --- | --- |
  | A TikTok | 17:00 | 11:00 | 08:00 | 16:00 |
  | A YouTube | 18:00 | 12:00 | 09:00 | 17:00 |
  | B TikTok | 22:00 | 16:00 | 13:00 | 21:00 |
  | B YouTube | 23:00 | 17:00 | 14:00 | 22:00 |

  Die Versätze: Berlin UTC+1, New York UTC−5, Los Angeles UTC−8, London UTC+0.
- **Datenfeld `publish.upload`:**
  `{ status: "plan"|"hold"|"skip", reason?, type: "Story"|"Wissen"|"What-if", lengthSec, tiktok: { date, timeDe, slot, local: { newYork, losAngeles, london }, calc }, youtube: { … }, dstNote }`.
  - `skip` heißt „nicht veröffentlichen“, mit Grund (Regelverstoß nach Abschnitt 4).
  - `hold` heißt „zurückgestellt“: Es liegt keine dokumentierte Note ≥ 9 vor. Ich lese den Satz „Mindestnote wird für keinen Slot gesenkt“ so, dass ein Video ohne belegte 9 nicht in den Plan kommt. Eine Freigabe durch dich oder eine nachgeholte Endkontrolle hebt das auf.
- **Kennzahlen:** Du trägst sie im Dashboard ein, auf der Fertig-Karte unter „Kennzahlen“, je Plattform. Leere Felder werden als `null` gespeichert und in `docs/analytics/uploads.md` als „fehlt“ übernommen. Der Abholer überträgt neue Werte von `analytics` nach `uploads.md`.
- **Auswertung:** frühestens 14 Tage nach dem ersten Upload und nur, wenn neue Zahlen vorliegen. Die Rolle Wissensverwalter läuft mit sonnet, weil Mediane und Raten mit Herleitung gerechnet werden müssen. Eine Plan-Änderung lege ich dir als Vorschlag im Dashboard vor; sie gilt erst nach deinem „ok“. Die Anzeige dafür baue ich, sobald die erste Auswertung eine Änderung empfiehlt; vorher gibt es dafür keinen Bedarf.
- **Themen-Art je Video:**
  - Story: Fiktion/Erzählung (Zeit-Welt, Bauarbeiter, Horror-Warteschlange)
  - Wissen: Personen, Geschichte, Erklärung (Lucia, Jason, Tyson, UFC, Huang, Rom)
  - What-if: Gedankenexperiment (Erde ohne Menschen)
- **Hochladen bleibt Handarbeit (Nutzer 14.11.2026: „Ok dann belassen wirs erstmal so das im Dashboard einfach die zeiten stehen“):** Das Dashboard zeigt nur Slot und Ortszeiten; du lädst selbst hoch. Geprüft am 14.11.: In Zapier ist kein YouTube-Konto verbunden, und für TikTok gibt es dort nur Werbe-Apps. Ein nicht geprüfter TikTok-API-Zugang darf nur `SELF_ONLY` posten (developers.tiktok.com/docs/en/content-sharing-guidelines). Automatik nur auf neuen Auftrag.
