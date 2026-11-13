# Sitzungswechsel – automatisch, ohne Rückfrage (Vorgabe des Nutzers, 09.11.2026)

> „Die Sitzungen sollen immer dann erneuert werden, wenn du merkst, dass es zu viel ist. Es soll immer
> automatisch laufen und es soll auch nicht gefragt werden.“

Grund: Jeder Schritt einer Sitzung liest den ganzen bisherigen Verlauf mit. Alles Wissen steht im Repo –
eine frische Sitzung arbeitet gleich gut, verbraucht aber viel weniger.

## Wann wechseln (eins genügt)
- Ein Video ist fertig (stage `done`) und das nächste beginnt.
- Die Sitzung wurde schon einmal zusammengefasst (Kontext-Kompaktierung) und es steht größere Arbeit an.
- Der Verlauf ist spürbar lang (viele Agenten-Berichte, Bilder, Stunden Arbeit).
Nicht mitten in einem laufenden Render oder während Agenten arbeiten – erst sichern/abschließen.

## Wie (der Orchestrator macht alles selbst, fragt nicht)
1. Alles committen und pushen; Dashboard-Status aktuell.
2. `create_session` mit `source_url` = Repo, `source_revision`/`outcome_branch` = aktueller Branch,
   `title` „CLIPS – <Thema/Stand>“ und einem **Übergabe-Prompt**: Stand in 5–10 Zeilen (laufendes Video,
   Stufe, offene Entscheidungen des Nutzers, nächste Schritte), Verweis auf `CLAUDE.md` und diese Datei.
3. Geplante Aufgaben umziehen: Abholer und Wochenrunde je mit `create_trigger` und
   `persistent_session_id` = neue Sitzung neu anlegen (gleicher Prompt – er enthält die automatische Modellwahl), die alten mit
   `update_trigger enabled=false` abschalten.
4. Dashboard: `meta/pickup` = `{ triggerId, sessionId, since }` schreiben (mit `if_version`, das Dokument
   existiert). Die Seite liest die Trigger-ID für „Jetzt starten“/Sofortstart live von dort (Rückfall: Konstante
   `PICKUP_TRIGGER` in `dashboard/index.html`) – **kein Neuveröffentlichen nötig**.
   `sessionId` beim laufenden Video auf die neue Sitzung setzen.
5. Dem Nutzer in einem Satz sagen, dass es in der neuen Sitzung weitergeht (Titel nennen).

## Verlauf
| Datum | alte Sitzung | neue Sitzung | Anlass |
|---|---|---|---|
| 09.11.2026 | session_01UNp77RB3vBiMZfvMTegJPC | session_01UNp77RfgMaxCV6mq19omHk („CLIPS – Orchestrator (ab 09.11.2026, nach Rom-Video)“) | Rom-Video fertig, Verlauf sehr lang; Abholer trig_01JLT1pGyNwh8YKTpJWtNJxp, Wochenrunde trig_01XgFBdQWeP3pQUJpqF5EKNr; alte Trigger abgeschaltet |
| 09.11.2026 | session_01UNp77RfgMaxCV6mq19omHk | session_01UNp77PfeZgZvzb2ptJpUgZ („CLIPS – Rom-Video v3 (Chatterbox Finn, ricksclip-Stil)“) | Verlauf lang, Rom-Überarbeitung beginnt; Abholer trig_011W3kQivp9AmUoMEjgQwfvL, Wochenrunde trig_01WspzYtyzSYSSJ4QBj9Msr2; alte Trigger aus |
| 11.11.2026 | session_01UNp77PfeZgZvzb2ptJpUgZ | session_01UNp77SBWELXkXVEa1Bhocq („CLIPS – Orchestrator (ab 11.11.2026, 3 neue Themen)“) | Verlauf sehr lang, 3 neue Themen im Dashboard; Abholer trig_01LrG4ZaCRWRsBfyow6Gq9Ag, tägliche Runde trig_015TKbafM6Bk1SAZKnHmyCoC; alte Trigger abgeschaltet |
| 12.11.2026 | session_01UNp77SBWELXkXVEa1Bhocq | session_01UNp77MbGLd9xQmQdv3FLjX („CLIPS – Orchestrator (ab 12.11.2026, Erde-Freigabe 2 + Warteschlange)“) | Sitzung schon kompaktiert, Erde wartet auf Freigabe 2, 8 Themen in der Warteschlange; Abholer trig_017AH4D9b5H8YGiKarMizM1a, tägliche Runde trig_01MSRAR4qxfJRSfyyTmt6c1S; alte Trigger abgeschaltet |
| 12.11.2026 | session_01UNp77MbGLd9xQmQdv3FLjX | session_01UNp77QbbGMJqc2nmbhEjyJ („CLIPS – Orchestrator (ab 12.11.2026 Mittag, Tyson + UFC + Rolls-Royce)“) | Wochenlimit knapp, Verlauf lang; alte Sitzung rendert nur noch „Erde ohne Menschen“ fertig; Abholer trig_01AD5K37cJTsy7zkgKqZbRd4 (alter trig_017AH4D9b5H8YGiKarMizM1a aus); tägliche Runde trig_01MSRAR4qxfJRSfyyTmt6c1S bis Limit-Reset pausiert |
| 12.11.2026 | session_01UNp77QbbGMJqc2nmbhEjyJ | session_01UNp77Rbv8zMoJNASdg9kGn („CLIPS – Orchestrator (ab 12.11.2026 Abend, Tyson/UFC/Rolls-Royce Freigaben)“) | Wochenlimit knapp, Verlauf lang; Hörproben aller drei Videos liegen zur Freigabe; Abholer trig_01LnS7BnVJhFZiuzXghfJjDr (alter trig_01AD5K37cJTsy7zkgKqZbRd4 aus); tägliche Runde trig_01MSRAR4qxfJRSfyyTmt6c1S weiter pausiert |
| 12.11.2026 | session_01UNp77Rbv8zMoJNASdg9kGn | session_01UNp77NVhVawXgBH2ZNK6s8 („CLIPS – Orchestrator (ab 12.11.2026 Nacht, Jensen Huang → Lucia → Jason)“) | Tyson + UFC fertig, Verlauf lang; Huang-Drehbuch wartet auf Freigabe 1; Abholer trig_01LwvVfuHuf1FAfnvscSeBAd (alter trig_01LnS7BnVJhFZiuzXghfJjDr aus) |
| 13.11.2026 | session_01UNp77NVhVawXgBH2ZNK6s8 | session_01UNp77QHeWKBPJK78ThrGyX („CLIPS – Orchestrator (ab 13.11.2026 Vormittag, Lucia → Jason → Zeit-Welt)“) | Huang fertig, Verlauf lang. **Neuer Abholer scheiterte:** Sitzung hat Tiefenlimit 8 erreicht (`create_trigger`/`update_trigger enabled=true` verweigert). Alter Abholer trig_01LwvVfuHuf1FAfnvscSeBAd wurde vorher abgeschaltet und ist jetzt **aus**. Nutzer muss eine neue Sitzung selbst starten oder den Abholer in den Einstellungen wieder einschalten. |

## Grenze: Sitzungs-Tiefe (gelernt 13.11.2026)
Jede per `create_session` gestartete Sitzung zählt eine Stufe tiefer; ab **Tiefe 8** darf eine Sitzung keine Sitzungen
starten und keine geplanten Aufgaben anlegen, auslösen oder wieder einschalten (Abschalten geht noch). Deshalb:
1. Vor dem Wechsel mit `get_session` die `lineage.depth` der **neuen** Sitzung prüfen; ist sie 8, den alten Abholer **nicht** abschalten.
2. Die Kette wird nur zurückgesetzt, wenn der Nutzer selbst eine neue Sitzung startet (Tiefe 0).
