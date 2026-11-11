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
